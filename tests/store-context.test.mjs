import test from 'node:test'
import assert from 'node:assert/strict'
import { StoreWorkflow } from '../src/features/store/store.workflow'
import { createStoreDataSource } from '../src/features/store/store.data'
import { MOCK_STORE_IDS, createMockStoreDataSource, mockStoreContext } from '../src/features/store/store.fixtures'
import { validateStoreContext, validateStoreList } from '../src/features/store/store.validation'
import { HttpError } from '../src/shared/http/httpClient'

const A = MOCK_STORE_IDS.first
const B = MOCK_STORE_IDS.second
const owner = (count = 1, id = A) => ({
  user: { user_id: 'f17e0000-0000-4000-8000-000000000099', email: 'test@example.com', display_name: 'Test' },
  session: { expires_at: '2026-10-11T12:00:00Z', absolute_expires_at: '2026-10-11T13:00:00Z', csrf_token: 'test-only' },
  default_store_id: id, accessible_store_count: count, authorization_version: 'auth-1',
})
const summary = (id) => {
  const { store_id, name, timezone, currency, role, membership_id, authorization_version } = mockStoreContext(id)
  return { store_id, name, timezone, currency, role, membership_id, authorization_version }
}
const page = (ids, next = null, total = ids.length) => ({
  items: ids.map(summary), pagination: { limit: 50, next_cursor: next, total_count: total },
})
const envelope = (data, extra = {}) => ({ data, meta: { request_id: 'store-test', ...extra }, error: null })
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
const tick = () => new Promise((resolve) => setImmediate(resolve))
const source = (ids = [A], options = {}) => ({
  list: async () => page(ids), read: async (id) => mockStoreContext(id), ...options,
})

test('one canonical default Store bootstraps T01 then T02, never role-derived grants', async () => {
  const calls = []
  const flow = new StoreWorkflow(source([A], {
    list: async () => { calls.push('T01'); return page([A]) },
    read: async (id) => { calls.push(id); return mockStoreContext(id) },
  }))
  await flow.activate(owner())
  assert.deepEqual(calls, ['T01', A])
  assert.equal(flow.getSnapshot().state.status, 'ready')
  assert.equal(flow.getSnapshot().state.store.timezone, 'Asia/Ho_Chi_Minh')
  assert.equal(flow.getSnapshot().state.store.membership.effective_permissions.includes('staff.permissions.manage'), false)
})

test('multiple Stores with null default require explicit selection, never items[0]', async () => {
  const calls = []
  const flow = new StoreWorkflow(source([A, B], { read: async (id) => { calls.push(id); return mockStoreContext(id) } }))
  await flow.activate(owner(2, null))
  assert.equal(flow.getSnapshot().state.status, 'selecting')
  assert.deepEqual(calls, [])
  assert.equal(await flow.selectStore(B), true)
  assert.equal(flow.getSnapshot().state.store.store_id, B)
  assert.deepEqual(flow.getSnapshot().state.store.membership.effective_permissions, ['ingredient.read', 'inventory.read', 'menu.read'])
})

test('no accessible Store is a valid empty state without T02 or fabricated Store', async () => {
  let reads = 0
  const flow = new StoreWorkflow(source([], { read: async () => { reads++; throw new Error('must not read') } }))
  await flow.activate(owner(0, null))
  assert.equal(flow.getSnapshot().state.status, 'empty')
  assert.deepEqual(flow.getSnapshot().accessibleStores, [])
  assert.equal(reads, 0)
  assert.equal(await flow.selectStore(A), false)
})

test('missing default from a newer T01 does not choose the first available item', async () => {
  let reads = 0
  const flow = new StoreWorkflow(source([B], { read: async () => { reads++; return mockStoreContext(B) } }))
  await flow.activate(owner())
  assert.equal(flow.getSnapshot().state.status, 'selecting')
  assert.equal(reads, 0)
})

test('A to B clears old context immediately until current T02 resolves', async () => {
  const response = deferred()
  const flow = new StoreWorkflow(source([A, B], { read: async (id) => id === A ? mockStoreContext(A) : response.promise }))
  await flow.activate(owner())
  const selecting = flow.selectStore(B)
  assert.equal(flow.getSnapshot().state.status, 'loading')
  assert.equal('store' in flow.getSnapshot().state, false)
  response.resolve(mockStoreContext(B))
  await selecting
  assert.equal(flow.getSnapshot().state.store.store_id, B)
})

test('late A response cannot overwrite B even when transport ignores abort', async () => {
  const a = deferred()
  let signalA
  const flow = new StoreWorkflow(source([A, B], { read: async (id, signal) => {
    if (id === A) { signalA = signal; return a.promise }
    return mockStoreContext(B)
  } }))
  const starting = flow.activate(owner())
  await tick()
  assert.equal(flow.getSnapshot().state.status, 'loading')
  await flow.selectStore(B)
  assert.equal(signalA.aborted, true)
  a.resolve(mockStoreContext(A))
  await starting
  assert.equal(flow.getSnapshot().state.store.store_id, B)
})

test('new AuthContext invalidates accessible list, context and stale old-owner T02', async () => {
  const first = deferred()
  let firstRead = true
  const flow = new StoreWorkflow(source([A, B], { read: async (id) => {
    if (firstRead) { firstRead = false; return first.promise }
    return mockStoreContext(id)
  } }))
  const originalOwner = owner()
  const firstActivation = flow.activate(originalOwner)
  await tick()
  const nextOwner = owner(2, null)
  nextOwner.authorization_version = 'auth-2'
  await flow.activate(nextOwner)
  first.resolve(mockStoreContext(A))
  await firstActivation
  assert.equal(flow.getSnapshot().owner, nextOwner)
  assert.equal(flow.getSnapshot().state.status, 'selecting')
  await flow.activate(null)
  assert.equal(flow.getSnapshot().state.status, 'unavailable')
  assert.deepEqual(flow.getSnapshot().accessibleStores, [])
})

test('T01 failure is retryable, never interpreted as no Store or API-to-mock fallback', async () => {
  let calls = 0
  const flow = new StoreWorkflow(source([A], { list: async () => { if (++calls === 1) throw new Error('maintenance'); return page([A]) } }))
  await flow.activate(owner())
  assert.equal(flow.getSnapshot().state.status, 'error')
  assert.match(flow.getSnapshot().listError, /maintenance/)
  await flow.refresh()
  assert.equal(flow.getSnapshot().state.status, 'ready')
  assert.equal(calls, 2)
})

test('T02 denial clears prior context and retains exact request reference', async () => {
  const flow = new StoreWorkflow(source([A, B], { read: async (id) => {
    if (id === B) throw new HttpError('contract', 'Forbidden', 403, { code: 'PERMISSION_DENIED', message: 'Forbidden', details: {} }, 'req-denied')
    return mockStoreContext(A)
  } }))
  await flow.activate(owner())
  assert.equal(await flow.selectStore(B), false)
  assert.equal(flow.getSnapshot().state.status, 'error')
  assert.match(flow.getSnapshot().state.message, /PERMISSION_DENIED.*req-denied/)
  assert.equal('store' in flow.getSnapshot().state, false)
})

test('T02 Store mismatch is a protocol failure, not a scope switch', async () => {
  const flow = new StoreWorkflow(source([A, B], { read: async () => mockStoreContext(B) }))
  await flow.activate(owner())
  assert.equal(flow.getSnapshot().state.status, 'error')
  assert.match(flow.getSnapshot().state.message, /T02/)
})

test('refresh reads latest T02 grants/version without freezing the login or T01 version', async () => {
  let reads = 0
  const flow = new StoreWorkflow(source([A], { read: async () => {
    const value = mockStoreContext(A)
    if (++reads > 1) {
      value.authorization_version = 'current-2'
      value.membership.authorization_version = 'current-2'
      value.membership.effective_permissions = ['menu.read', 'unknown.future.permission']
    }
    return value
  } }))
  await flow.activate(owner())
  await flow.refresh()
  assert.equal(flow.getSnapshot().state.store.authorization_version, 'current-2')
  assert.deepEqual(flow.getSnapshot().state.store.membership.effective_permissions, ['menu.read', 'unknown.future.permission'])
  assert.equal(flow.getSnapshot().accessibleStores[0].authorization_version, 'current-2')
})

test('dirty change guard prevents Store switching; cleanup permits explicit switch', async () => {
  const flow = new StoreWorkflow(source([A, B]))
  await flow.activate(owner())
  const release = flow.registerChangeGuard(() => false)
  assert.equal(await flow.selectStore(B), false)
  assert.equal(flow.getSnapshot().state.store.store_id, A)
  release()
  assert.equal(await flow.selectStore(B), true)
  assert.equal(flow.getSnapshot().state.store.store_id, B)
})

test('late guard confirmation from prior owner cannot start a Store read', async () => {
  const confirmation = deferred()
  let reads = 0
  const flow = new StoreWorkflow(source([A, B], { read: async (id) => { reads++; return mockStoreContext(id) } }))
  await flow.activate(owner())
  flow.registerChangeGuard(() => confirmation.promise)
  const pending = flow.selectStore(B)
  await flow.activate(null)
  confirmation.resolve(true)
  assert.equal(await pending, false)
  assert.equal(reads, 1)
  assert.equal(flow.getSnapshot().state.status, 'unavailable')
})

test('choosing the current Store cancels an older asynchronous switch confirmation', async () => {
  const confirmation = deferred()
  const flow = new StoreWorkflow(source([A, B]))
  await flow.activate(owner())
  flow.registerChangeGuard(() => confirmation.promise)
  const pending = flow.selectStore(B)
  assert.equal(await flow.selectStore(A), true)
  confirmation.resolve(true)
  assert.equal(await pending, false)
  assert.equal(flow.getSnapshot().state.store.store_id, A)
})

test('opaque cursor bounds reject locally without issuing a request', async (t) => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', async () => { calls++; throw new Error('must not fetch') })
  const data = createStoreDataSource('https://qa.invalid')
  await assert.rejects(data.list(undefined, ''))
  await assert.rejects(data.list(undefined, 'x'.repeat(4097)))
  assert.equal(calls, 0)
})

test('StrictMode setup-cleanup-setup aborts old request and leaves no busy lock', async () => {
  const first = deferred()
  const signals = []
  let calls = 0
  const flow = new StoreWorkflow(source([A], { list: async (signal) => {
    signals.push(signal)
    return ++calls === 1 ? first.promise : page([A])
  } }))
  const old = flow.activate(owner())
  flow.cancel()
  await flow.activate(owner())
  first.resolve(page([B]))
  await old
  assert.equal(signals[0].aborted, true)
  assert.equal(flow.getSnapshot().listBusy, false)
  assert.equal(flow.getSnapshot().state.store.store_id, A)
})

test('T01 pagination appends explicit accessible Stores without selecting a first item', async () => {
  const calls = []
  const flow = new StoreWorkflow(source([], { list: async (_signal, cursor) => {
    calls.push(cursor)
    return cursor ? page([B], null, 2) : page([A], 'opaque cursor/+?', 2)
  } }))
  await flow.activate(owner(2, null))
  await flow.loadMore()
  assert.deepEqual(calls, [undefined, 'opaque cursor/+?'])
  assert.deepEqual(flow.getSnapshot().accessibleStores.map((item) => item.store_id), [A, B])
  assert.equal(flow.getSnapshot().state.status, 'selecting')
  assert.equal(flow.getSnapshot().pagination.next_cursor, null)
})

test('duplicate or stalled T01 pagination is rejected without duplicate/foreign rows', async () => {
  const flow = new StoreWorkflow(source([], { list: async (_signal, cursor) => cursor
    ? page([A], 'again', 2) : page([A], 'again', 2) }))
  await flow.activate(owner(2, null))
  await flow.loadMore()
  assert.match(flow.getSnapshot().listError, /cursor/)
  assert.deepEqual(flow.getSnapshot().accessibleStores.map((item) => item.store_id), [A])
  assert.equal(flow.getSnapshot().listBusy, false)
})

test('late paginated list from an old owner cannot enter the new owner list', async () => {
  const next = deferred()
  let moreSignal
  const flow = new StoreWorkflow(source([], { list: async (signal, cursor) => {
    if (cursor) { moreSignal = signal; return next.promise }
    return page([A], 'next', 2)
  } }))
  await flow.activate(owner(2, null))
  const pending = flow.loadMore()
  await flow.activate(null)
  next.resolve(page([B], null, 2))
  await pending
  assert.equal(moreSignal.aborted, true)
  assert.deepEqual(flow.getSnapshot().accessibleStores, [])
})

test('DEV preview has deterministic two-Store discovery and never calls auth or fetch', async (t) => {
  t.mock.method(globalThis, 'fetch', () => { throw new Error('mock preview must not use network') })
  const flow = new StoreWorkflow(createMockStoreDataSource(), { mockDefaultStoreId: A })
  await flow.activate('mock')
  assert.equal(flow.getSnapshot().state.status, 'mock_preview')
  assert.equal(flow.getSnapshot().state.store.store_id, A)
  assert.deepEqual(flow.getSnapshot().accessibleStores.map((item) => item.store_id), [A, B])
  await flow.selectStore(B)
  assert.equal(flow.getSnapshot().state.store.role, 'STAFF')
})

test('DEV fixtures pass the same T01/T02 boundary validation', async () => {
  const mock = createMockStoreDataSource()
  const list = await mock.list()
  assert.deepEqual(validateStoreList(envelope({ items: list.items }, { pagination: list.pagination })), list)
  for (const row of list.items) {
    const current = await mock.read(row.store_id)
    assert.deepEqual(validateStoreContext(envelope(current), row.store_id), current)
  }
})

test('T01 adapter encodes cursor; T02 GET uses cookie session without mutation or session Store write', async (t) => {
  const observed = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    observed.push({ url, options })
    return new Response(JSON.stringify(String(url).includes('/stores?')
      ? envelope({ items: [summary(B)] }, { pagination: page([B]).pagination })
      : envelope(mockStoreContext(B))), { status: 200, headers: { 'Content-Type': 'application/json' } })
  })
  const data = createStoreDataSource('https://qa.invalid')
  await data.list(undefined, 'opaque cursor/+?')
  await data.read(B)
  assert.equal(observed[0].url, 'https://qa.invalid/api/v1/stores?cursor=opaque+cursor%2F%2B%3F')
  assert.equal(observed[1].url, `https://qa.invalid/api/v1/stores/${B}`)
  for (const item of observed) {
    assert.equal(item.options.credentials, 'include')
    assert.equal(item.options.method ?? 'GET', 'GET')
    assert.equal(item.options.body, undefined)
    assert.equal(new Headers(item.options.headers).has('X-CSRF-Token'), false)
    assert.equal(new Headers(item.options.headers).has('Authorization'), false)
  }
})
