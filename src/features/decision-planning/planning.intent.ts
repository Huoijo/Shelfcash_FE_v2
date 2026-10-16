import { HttpError } from '../../shared/http/httpClient'
import { captureCapabilityInput } from '../backend-capabilities/capabilities.data'
import type { CapabilityApi, CapabilityCallOptions, CapabilityInput, CapabilityOutput } from '../backend-capabilities/capabilities.data'
import { prepareRecoveryRecord, RecoveryJournalError, unresolvedRecovery } from '../backend-capabilities/recovery.journal'
import type { RecoveryJournal, RecoveryRecord, RecoveryScope } from '../backend-capabilities/recovery.journal'

export type PlanningMutation = 'N10' | 'AS01' | 'AS03'
export type PlanningAuthority = { scope: RecoveryScope; permissions: string[] }
export type PlanningIntentState<K extends PlanningMutation> = {
  status: 'restoring' | 'idle' | 'pending' | 'succeeded' | 'failed' | 'unknown' | 'blocked'
  result?: CapabilityOutput<K>
  error?: unknown
  recoveryId?: string
  receiptIds?: RecoveryRecord['receipt_ids']
}
export const assistantRights = ['planning.result.read', 'budget.read', 'procurement.cost.read']

/** One actor/Store/Run/operation. Restore is storage-only; replay is always explicit.
 * AS03 keeps original text only in memory, never in durable storage. */
export class PlanningIntentController<K extends PlanningMutation> {
  private state: PlanningIntentState<K> = { status: 'restoring' }
  private record?: RecoveryRecord
  private original?: CapabilityInput<K>
  private listeners = new Set<() => void>()
  private epoch = 0
  private disposed = false
  private api: CapabilityApi
  private journal: RecoveryJournal
  readonly operation: K
  private runId: string
  private owner: RecoveryScope
  private authority: () => PlanningAuthority | null
  constructor(api: CapabilityApi, journal: RecoveryJournal, operation: K,
    runId: string, owner: RecoveryScope, authority: () => PlanningAuthority | null) {
    this.api = api; this.journal = journal; this.operation = operation
    this.runId = runId; this.owner = { ...owner }; this.authority = authority
  }
  getSnapshot = () => this.state
  getOriginalInput = (): CapabilityInput<K> | undefined => {
    if (this.state.status !== 'unknown' || !this.record?.replay_input) return undefined
    try { return captureCapabilityInput(this.operation, this.record.replay_input as CapabilityInput<K>) } catch { return undefined }
  }
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn) } }
  private publish(state: PlanningIntentState<K>) { this.state = state; this.listeners.forEach(fn => fn()) }
  private authorize() {
    const now = this.authority()
    const rights = this.operation === 'N10' ? [...assistantRights, 'planning.export'] : assistantRights
    if (this.disposed || !now || ['actor_user_id', 'store_id', 'sessionIdentity'].some(k => now.scope[k as keyof RecoveryScope] !== this.owner[k as keyof RecoveryScope]) || !rights.every(p => now.permissions.includes(p))) throw new RecoveryJournalError('Current actor/session/Store or Planning permission changed.')
  }
  restore = async () => {
    if (this.state.status !== 'restoring') return
    const epoch = ++this.epoch
    try {
      this.authorize()
      const rows = await this.journal.list(this.owner.actor_user_id, this.owner.store_id)
      this.authorize()
      const pending = rows.filter(r => r.operation_id === this.operation && r.resource_ids.plan_id === this.runId && unresolvedRecovery(r))
      if (pending.length > 1) throw new RecoveryJournalError('Multiple unresolved intents require reconciliation; replacement is blocked.')
      if (epoch !== this.epoch) return
      this.record = pending[0]
      const accepted = rows.filter(r => r.operation_id === this.operation && r.resource_ids.plan_id === this.runId && r.state === 'confirmed' && r.receipt_ids).sort((a,b) => b.created_at.localeCompare(a.created_at))[0]
      this.publish(this.record ? { status: 'unknown', recoveryId: this.record.id } : accepted ? { status: 'succeeded', receiptIds: accepted.receipt_ids } : { status: 'idle' })
    } catch (error) { if (epoch === this.epoch) this.publish({ status: 'blocked', error }) }
  }
  send = async (input: CapabilityInput<K>, options?: CapabilityCallOptions) => {
    if (!['idle', 'succeeded', 'failed'].includes(this.state.status)) throw new RecoveryJournalError('Resolve the original intent before creating new work.')
    this.authorize()
    const original = captureCapabilityInput(this.operation, input)
    if (original.path.plan_id !== this.runId) throw new RecoveryJournalError('Run scope mismatch.')
    this.publish({ status: 'pending' })
    let reserved = false
    try {
      const record = await prepareRecoveryRecord(this.operation, original, this.owner)
      if (!record) throw new RecoveryJournalError('Operation has no reviewed journal policy.')
      this.authorize()
      await this.journal.reserve(record)
      reserved = true
      this.record = record; this.original = original
      this.authorize()
    } catch (error) {
      this.publish({ status: reserved ? 'unknown' : 'blocked', error, recoveryId: this.record?.id })
      throw error
    }
    return this.execute(original, options)
  }
  replay = async (options?: CapabilityCallOptions) => {
    if (this.state.status !== 'unknown' || !this.record) throw new RecoveryJournalError('No unresolved intent to replay.')
    this.authorize()
    const input = this.record.replay_input as CapabilityInput<K> | undefined ?? this.original
    if (!input) throw new RecoveryJournalError('Original Chat body is unavailable after reload; metadata cannot reconstruct a turn.')
    this.publish({ status: 'pending', recoveryId: this.record.id })
    try {
    const checked = await prepareRecoveryRecord(this.operation, input, this.owner)
    if (!checked || ['id', 'scope', 'payload_sha256', 'path', 'operation_id', 'idempotency_key'].some(k => checked[k as keyof RecoveryRecord] !== this.record![k as keyof RecoveryRecord])) throw new RecoveryJournalError('Original intent integrity check failed.')
    this.authorize()
    await this.journal.update(this.record.id, 'pending')
    } catch (error) {
      this.publish({ status: 'unknown', recoveryId: this.record.id, error })
      throw error
    }
    return this.execute(input, options)
  }
  private async execute(input: CapabilityInput<K>, options?: CapabilityCallOptions): Promise<CapabilityOutput<K>> {
    try {
      this.authorize()
      const response = await this.api.call(this.operation, input, options)
      const data = response.data as { export_id?: string; job_id?: string; generation_id?: string }
      const receiptIds = this.operation === 'N10' ? { export_id: data.export_id!, job_id: data.job_id! } : this.operation === 'AS01' ? { generation_id: data.generation_id! } : undefined
      // Atomically persist safe locators with acknowledgement, before publishing to React/URL.
      await this.journal.update(this.record!.id, 'confirmed', receiptIds)
      this.record!.state = 'confirmed'
      this.authorize()
      this.original = undefined
      this.publish({ status: 'succeeded', result: structuredClone(response), receiptIds })
      return response
    } catch (error) {
      // AS03 explicitly identifies an immutable terminal failed generation. This
      // is different from live/unknown GENERATION_IN_PROGRESS or a denied replay.
      if (this.operation === 'AS03' && error instanceof HttpError && error.status === 409 && error.problem?.code === 'GENERATION_FAILED') {
        let persisted = false
        try {
          await this.journal.update(this.record!.id, 'rejected')
          this.record!.state = 'rejected'; this.original = undefined
          if (!this.disposed) this.publish({ status: 'failed', error })
          persisted = true
        } catch { /* A storage failure must retain uncertainty. */ }
        if (persisted) throw error
      }
      // A denied replay cannot prove that the earlier accepted operation did not execute.
      try { await this.journal.update(this.record!.id, 'unknown') } catch { /* durable pending also restores as unknown */ }
      if (!this.disposed) this.publish({ status: 'unknown', error, recoveryId: this.record?.id })
      throw error
    }
  }
  reset = () => {
    if (['pending', 'unknown', 'restoring', 'blocked'].includes(this.state.status)) return false
    this.publish({ status: 'idle' }); return true
  }
  /** Remove protected responses immediately; retain unresolved durable intent. */
  redact = (error: unknown) => {
    this.publish({ status: this.record && unresolvedRecovery(this.record) && this.state.status !== 'succeeded' ? 'unknown' : 'blocked', error, recoveryId: this.record?.id })
  }
  dispose = () => { this.disposed = true; this.epoch++; this.original = undefined; this.publish({ status: 'blocked' }); this.listeners.clear() }
}

export function planningAccessFailure(error: unknown): boolean {
  return error instanceof HttpError && [401, 403, 404].includes(error.status ?? 0)
}
