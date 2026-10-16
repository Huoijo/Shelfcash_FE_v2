import { isRecord } from '../../shared/http/httpClient'
import { captureCapabilityInput } from './capabilities.data'
import type { CapabilityInput } from './capabilities.data'
import { capabilityOperations } from './capabilities.wire'
import type { CapabilityWriteOperation } from './capabilities.wire'
import { recoveryRules } from './recovery.policy'
import { matchesCapabilitySchema } from './capabilities.validation'

export type RecoveryScope = { actor_user_id: string; store_id: string | null; sessionIdentity: string }
export type RecoveryRecord = {
  id: string; scope: string; actor_user_id: string; store_id: string | null
  operation_id: CapabilityWriteOperation; phase: string | null; method: string; path: string
  resource_ids: Record<string, string>; idempotency_key: string
  original_cas: { revision?: string; ifNoneMatch?: '*' }
  created_at: string; payload_sha256: string; state: 'pending' | 'unknown' | 'confirmed' | 'rejected'
  // Entire captured replay input or nothing. Never persist a partially redacted request.
  replay_input?: CapabilityInput<CapabilityWriteOperation>
}
export interface RecoveryJournal {
  reserve(record: RecoveryRecord): Promise<void>
  update(id: string, state: RecoveryRecord['state']): Promise<void>
  list(actor: string, store: string | null): Promise<RecoveryRecord[]>
}
export class RecoveryJournalError extends Error {
  constructor(message: string) { super(message); this.name = 'RecoveryJournalError' }
}
export const unresolvedRecovery = (record: RecoveryRecord) => record.state === 'pending' || record.state === 'unknown'
const empty = (value: unknown) => Array.isArray(value) && value.length === 0
const absentOrEmpty = (body: Record<string, unknown>, key: string) => !Object.hasOwn(body, key) || empty(body[key])

export async function recoveryPayloadHash(body: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(body) ?? '')
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(n => n.toString(16).padStart(2, '0')).join('')
}

/** Default deny. Only reviewed fields may survive reload; secrets/free text are not generically serialized. */
export async function prepareRecoveryRecord<K extends CapabilityWriteOperation>(operation: K, input: CapabilityInput<K>, scope: RecoveryScope): Promise<RecoveryRecord | null> {
  const captured = captureCapabilityInput(operation, input)
  if (!matchesCapabilitySchema({ type: 'string', format: 'uuid' }, scope.actor_user_id, {}) || (scope.store_id !== null && !matchesCapabilitySchema({ type: 'string', format: 'uuid' }, scope.store_id, {})) || !scope.sessionIdentity) throw new RecoveryJournalError('A current authenticated actor/session and valid scope identifiers are required.')
  const args = captured as { key?: string; path?: Record<string, string>; body?: unknown; revision?: string; ifNoneMatch?: '*' }
  const body = isRecord(args.body) ? args.body : {}
  const rule = recoveryRules.find(r => r.operation === operation && (r.phase === null || r.phase === body.phase))
  if (!rule || rule.mode === 'excluded') return null
  if (!args.key) throw new RecoveryJournalError('A journaled mutation requires its original key.')
  if (args.path?.store_id && args.path.store_id !== scope.store_id) throw new RecoveryJournalError('Store scope mismatch.')
  // Writers without a Store path still require caller-owned Store scope, except account-wide T03/NF03.
  if (!['T03', 'NF03'].includes(operation) && !scope.store_id) throw new RecoveryJournalError('Current Store is required for this mutation.')
  let safe = rule.mode !== 'metadata_only' && Object.keys(body).every(k => (rule.fields as readonly string[]).includes(k))
  if (rule.mode === 'conditional_full_body') {
    if (operation === 'I05' && rule.phase === 'commit') safe &&= (!Object.hasOwn(body, 'reason') || body.reason === null) && empty(body.resolutions) && absentOrEmpty(body, 'supplier_changes') && absentOrEmpty(body, 'history_corrections')
    else if (operation === 'C02') safe &&= ['default', 'saved'].includes(String(body.requirements_mode)) && (!Object.hasOwn(body, 'requirements') || body.requirements === null)
    else safe = false
  }
  // No invitation proof, query or future unreviewed wrapper field can enter a replay input.
  safe &&= Object.keys(captured).every(k => ['path', 'body', 'key', 'revision', 'ifNoneMatch'].includes(k))
  const resources = Object.fromEntries(Object.entries(args.path ?? {}).sort(([a], [b]) => a.localeCompare(b))), store = ['T03', 'NF03'].includes(operation) ? null : scope.store_id
  const logicalScope = JSON.stringify([scope.actor_user_id, store, operation, resources])
  return {
    id: JSON.stringify([logicalScope, args.key]), scope: logicalScope, actor_user_id: scope.actor_user_id, store_id: store,
    operation_id: operation, phase: rule.phase, method: capabilityOperations[operation].method,
    path: capabilityOperations[operation].path, resource_ids: resources, idempotency_key: args.key,
    original_cas: { ...(args.revision !== undefined ? { revision: args.revision } : {}), ...(args.ifNoneMatch !== undefined ? { ifNoneMatch: args.ifNoneMatch } : {}) },
    created_at: new Date().toISOString(), payload_sha256: await recoveryPayloadHash(args.body), state: 'pending',
    ...(safe ? { replay_input: captured as CapabilityInput<CapabilityWriteOperation> } : {}),
  }
}

/** Lazy opening; no expiry, logout purge, credentials, responses, provider text or file bytes. */
export function createIndexedDbRecoveryJournal(factory: IDBFactory = indexedDB): RecoveryJournal {
  let opening: Promise<IDBDatabase> | undefined
  const open = () => opening ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open('shelfcash-intent-journal-v1', 1)
    let abandoned = false
    request.onupgradeneeded = () => request.result.createObjectStore('intents', { keyPath: 'id' })
    request.onsuccess = () => {
      if (abandoned) { request.result.close(); return }
      request.result.onversionchange = () => { request.result.close(); opening = undefined }
      resolve(request.result)
    }
    request.onerror = () => { if (abandoned) return; abandoned = true; opening = undefined; reject(new RecoveryJournalError('Cannot open durable intent storage.')) }
    request.onblocked = () => { abandoned = true; opening = undefined; reject(new RecoveryJournalError('Durable intent storage is blocked by another tab.')) }
  })
  async function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, done: (value: T) => void) => void): Promise<T> {
    const db = await open()
    return new Promise<T>((resolve, reject) => {
      // Strict durability requests disk flush before acknowledgement where supported.
      const tx = db.transaction('intents', mode, { durability: 'strict' })
      let result: T
      tx.oncomplete = () => resolve(result)
      tx.onerror = tx.onabort = () => reject(new RecoveryJournalError('Durable intent transaction failed; outcome must be reconciled.'))
      try { run(tx.objectStore('intents'), value => { result = value }) } catch (error) { tx.abort(); reject(error) }
    })
  }
  return {
    reserve: record => transaction<void>('readwrite', (store, done) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const records = request.result as RecoveryRecord[]
        // Atomic across tabs: never overwrite a receipt/key or compete with another unresolved intent.
        if (records.some(r => r.id === record.id || (r.scope === record.scope && unresolvedRecovery(r)))) { store.transaction.abort(); return }
        store.add(structuredClone(record)); done(undefined)
      }
    }),
    update: (id, state) => transaction<void>('readwrite', (store, done) => {
      const request = store.get(id)
      request.onsuccess = () => {
        const record = request.result as RecoveryRecord | undefined
        if (!record) { store.transaction.abort(); return }
        if (record.state === 'confirmed' || record.state === 'rejected') {
          // A late failed replay in another tab must not erase an already validated acknowledgement.
          if (state === record.state || state === 'unknown') { done(undefined); return }
          store.transaction.abort(); return
        }
        store.put({ ...record, state }); done(undefined)
      }
    }),
    list: (actor, storeId) => transaction<RecoveryRecord[]>('readonly', (store, done) => {
      const request = store.getAll()
      request.onsuccess = () => done((request.result as RecoveryRecord[]).filter(r => r.actor_user_id === actor && r.store_id === storeId))
    }),
  }
}
