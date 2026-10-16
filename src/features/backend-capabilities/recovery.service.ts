import type { CapabilityApi, CapabilityCallOptions, CapabilityInput, CapabilityOutput } from './capabilities.data'
import type { CapabilityWriteOperation } from './capabilities.wire'
import { prepareRecoveryRecord, RecoveryJournalError, unresolvedRecovery } from './recovery.journal'
import type { RecoveryJournal, RecoveryRecord, RecoveryScope } from './recovery.journal'

/** Opt-in application boundary. No background replay, automatic restore dispatch or product UI. */
export function createCapabilityRecoveryService(api: CapabilityApi, journal: RecoveryJournal, currentScope: () => RecoveryScope | null) {
  let busy = false
  function scope(): RecoveryScope {
    const value = currentScope()
    if (!value?.actor_user_id || !value.sessionIdentity) throw new RecoveryJournalError('Current authenticated session is required.')
    return { ...value }
  }
  function assertCurrent(captured: RecoveryScope) {
    const now = scope()
    if (now.actor_user_id !== captured.actor_user_id || now.store_id !== captured.store_id || now.sessionIdentity !== captured.sessionIdentity) throw new RecoveryJournalError('Actor, Store or session changed; restore in the correct current scope.')
  }
  async function exclusive<T>(task: () => Promise<T>): Promise<T> {
    if (busy) throw new RecoveryJournalError('A recovery operation is already pending.')
    busy = true
    try { return await task() } finally { busy = false }
  }
  async function execute<K extends CapabilityWriteOperation>(record: RecoveryRecord, input: CapabilityInput<K>, captured: RecoveryScope, options?: CapabilityCallOptions): Promise<CapabilityOutput<K>> {
    assertCurrent(captured)
    let result: CapabilityOutput<K>
    try { result = await api.call(record.operation_id as K, input, options) }
    catch (error) {
      // Even PR01/PR04 409 can reconcile lifecycle audits. No generic rejection means no effects.
      // A denied replay never settles the original attempt; every dispatched failure remains unknown here.
      await journal.update(record.id, 'unknown')
      throw error
    }
    // Never persist a raw response. Validation in the typed API precedes this acknowledgement.
    await journal.update(record.id, 'confirmed')
    assertCurrent(captured)
    return result
  }
  async function scopedRecords(captured: RecoveryScope) {
    const rows = await journal.list(captured.actor_user_id, captured.store_id)
    // T03/NF03 are account-scoped; they are never relabelled as Store-local intents.
    if (captured.store_id !== null) rows.push(...await journal.list(captured.actor_user_id, null))
    assertCurrent(captured)
    return rows.filter(row => row.actor_user_id === captured.actor_user_id && (row.store_id === captured.store_id || (row.store_id === null && ['T03', 'NF03'].includes(row.operation_id))))
  }
  return {
    get busy() { return busy },
    // A restored pending record is potentially dispatched; expose it as unknown without network work.
    async restore(): Promise<RecoveryRecord[]> {
      const rows = await scopedRecords(scope())
      return structuredClone(rows.filter(unresolvedRecovery).map(row => ({ ...row, state: 'unknown' as const })))
    },
    async send<K extends CapabilityWriteOperation>(operation: K, input: CapabilityInput<K>, options?: CapabilityCallOptions): Promise<CapabilityOutput<K>> {
      return exclusive(async () => {
        const captured = scope(), original = structuredClone(input)
        const record = await prepareRecoveryRecord(operation, original, captured)
        if (!record) throw new RecoveryJournalError('Operation is not allowlisted for this durable boundary; use its operation-specific recovery flow.')
        assertCurrent(captured)
        await journal.reserve(record) // Must finish successfully BEFORE dispatch.
        // A reservation is visible to other tabs: our local no-dispatch does not prove nobody replayed it.
        assertCurrent(captured)
        return execute(record, original, captured, options)
      })
    },
    async replay(id: string, options?: CapabilityCallOptions): Promise<CapabilityOutput<CapabilityWriteOperation>> {
      return exclusive(async () => {
        const captured = scope(), rows = await scopedRecords(captured)
        const record = rows.find(r => r.id === id)
        if (!record || !unresolvedRecovery(record) || !record.replay_input) throw new RecoveryJournalError('No full reviewed original body is available; use authorized operation-specific readback.')
        // Stored bytes are untrusted input. Revalidate policy, exact body hash, key, CAS and scope.
        const checked = await prepareRecoveryRecord(record.operation_id, record.replay_input, captured)
        if (!checked?.replay_input || ['id', 'scope', 'actor_user_id', 'store_id', 'operation_id', 'phase', 'method', 'path', 'idempotency_key', 'payload_sha256'].some(k => checked[k as keyof RecoveryRecord] !== record[k as keyof RecoveryRecord]) || JSON.stringify(checked.resource_ids) !== JSON.stringify(record.resource_ids) || JSON.stringify(checked.original_cas) !== JSON.stringify(record.original_cas)) throw new RecoveryJournalError('Stored intent failed integrity/policy validation; do not dispatch a replacement.')
        assertCurrent(captured)
        await journal.update(record.id, 'pending')
        return execute(record, checked.replay_input, captured, options)
      })
    },
  }
}
