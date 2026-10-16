import { captureCapabilityInput } from '../backend-capabilities/capabilities.data'
import type { CapabilityInput } from '../backend-capabilities/capabilities.data'

export type StoreCreateIntent = CapabilityInput<'T03'>
export type StoreCreateRecord = {
  version: 1; operation: 'T03'; method: 'POST'; path: '/api/v1/stores'
  actor: string; store_id: null; original_cas: null
  input: StoreCreateIntent; created_at: string; updated_at: string
  state: 'pending' | 'unknown' | 'confirmed' | 'rejected'
  receipt_store_id: string | null
}
const database = 'shelfcash-intent-journal'
const unavailable = () => new Error('Không lưu được yêu cầu an toàn. Chưa gửi thay đổi; kiểm tra quyền lưu trữ của trình duyệt rồi tải lại.')
function allowedInput(value: StoreCreateIntent): StoreCreateIntent {
  // Default deny: only reviewed T03 key/body fields, never arbitrary HTTP options.
  if (Object.keys(value).some(k => !['key', 'body'].includes(k)) || !value.body ||
      Object.keys(value.body).some(k => !['name', 'timezone', 'currency'].includes(k))) throw unavailable()
  return captureCapabilityInput('T03', value)
}
function checked(value: StoreCreateRecord, actor: string): StoreCreateRecord {
  const fields = ['version','operation','method','path','actor','store_id','original_cas','input','created_at','updated_at','state','receipt_store_id']
  if (!value || Object.keys(value).some(k => !fields.includes(k)) || value.version !== 1 || value.operation !== 'T03' ||
      value.method !== 'POST' || value.path !== '/api/v1/stores' || value.actor !== actor || value.store_id !== null || value.original_cas !== null ||
      !['pending','unknown','confirmed','rejected'].includes(value.state) || !Number.isFinite(Date.parse(value.created_at)) ||
      !Number.isFinite(Date.parse(value.updated_at)) || !(value.receipt_store_id === null || typeof value.receipt_store_id === 'string')) throw unavailable()
  return { ...value, input: allowedInput(value.input) }
}
async function transaction<T>(_actor: string, mode: IDBTransactionMode, action: (store: IDBObjectStore, resolve: (value: T) => void) => void): Promise<T> {
  let db: IDBDatabase | undefined
  try {
    db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(database, 1)
      let abandoned = false
      request.onblocked = () => { abandoned = true; reject(unavailable()) }
      request.onerror = () => reject(unavailable())
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('intents')) request.result.createObjectStore('intents', { keyPath: 'actor' }) }
      request.onsuccess = () => { if (abandoned) request.result.close(); else resolve(request.result) }
    })
    db.onversionchange = () => db?.close()
    return await new Promise<T>((resolve, reject) => {
      const tx = db!.transaction('intents', mode, { durability: 'strict' }); let result: T
      tx.oncomplete = () => resolve(result)
      tx.onabort = tx.onerror = () => reject(unavailable())
      try { action(tx.objectStore('intents'), value => { result = value }) }
      catch { tx.abort(); reject(unavailable()) }
    })
  } catch { throw unavailable() } finally { db?.close() }
}
export async function readStoreCreate(actor: string): Promise<StoreCreateRecord | null> {
  const value = await transaction<StoreCreateRecord | undefined>(actor, 'readonly', (store, resolve) => {
    const request = store.get(actor); request.onsuccess = () => resolve(request.result)
  })
  return value === undefined ? null : checked(value, actor)
}
export async function reserveStoreCreate(actor: string, input: StoreCreateIntent): Promise<StoreCreateRecord> {
  const safe = allowedInput(input), now = new Date().toISOString()
  const record: StoreCreateRecord = { version: 1, operation: 'T03', method: 'POST', path: '/api/v1/stores', actor,
    store_id: null, original_cas: null, input: safe, created_at: now, updated_at: now, state: 'pending', receipt_store_id: null }
  const existing = await transaction<StoreCreateRecord | null>(actor, 'readwrite', (store, resolve) => {
    const request = store.get(actor)
    request.onsuccess = () => {
      const old = request.result as StoreCreateRecord | undefined
      // A durable slot, not a timestamp/lease, fences all unresolved or confirmed attempts.
      if (old && old.state !== 'rejected') { resolve(old); return }
      store.put(record); resolve(null)
    }
  })
  if (existing) throw new Error('Yêu cầu trước vẫn được lưu. Đọc lại đúng yêu cầu trước khi tạo ý định khác.')
  return record
}
export async function settleStoreCreate(record: StoreCreateRecord, state: StoreCreateRecord['state'], receipt: string | null = null): Promise<void> {
  await transaction<void>(record.actor, 'readwrite', (store, resolve) => {
    const request = store.get(record.actor)
    request.onsuccess = () => {
      const current = request.result as StoreCreateRecord | undefined
      if (!current || current.input.key !== record.input.key) { request.transaction?.abort(); return }
      // A late failed attempt can never overwrite a known receipt from another tab.
      if (current.state !== 'confirmed') store.put({ ...checked(current, record.actor), state, receipt_store_id: receipt, updated_at: new Date().toISOString() })
      resolve()
    }
  })
}
export async function lockStoreCreate<T>(actor: string, action: () => Promise<T>): Promise<T> {
  if (!navigator.locks) throw unavailable()
  return navigator.locks.request('shelfcash:T03:' + actor, { ifAvailable: true }, lock => {
    if (!lock) throw new Error('Yêu cầu đang được xử lý ở tab khác. Chờ tab đó hoàn tất rồi kiểm tra đúng yêu cầu trước.')
    return action()
  })
}
