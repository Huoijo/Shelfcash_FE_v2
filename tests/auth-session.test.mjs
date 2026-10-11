import test from 'node:test'
import assert from 'node:assert/strict'
import {
  configureHttpSession, CsrfTokenUnavailableError, HttpError,
  requestJson, requestMultipart, requestNoContent,
} from '../src/shared/http/httpClient'
import { createAuthDataSource } from '../src/features/auth/auth.data'
import { validateAuthContext } from '../src/features/auth/auth.validation'
import { createStoreDataSource } from '../src/features/store/store.data'
import { validateStoreContext, validateStoreList } from '../src/features/store/store.validation'
import { getInventory, getInventoryIngredient, getInventoryLots, getInventoryMovements } from '../src/features/inventory/inventory.data'
import { formatInventoryDate, formatInventoryTimestamp } from '../src/features/inventory/inventory.format'
import { getMenu, getMenuProduct } from '../src/features/menu/menu.data'
import { getImportCalendar, getImportHistory } from '../src/features/import-history/importHistory.data'

const BASE = 'https://qa.invalid'
const STORE = '00000000-0000-4000-8000-000000000001'
const USER = '00000000-0000-4000-8000-000000000002'
const MEMBER = '00000000-0000-4000-8000-000000000003'
const authFixture = () => ({
  user: { user_id: USER, email: 'owner@example.com', display_name: 'Người dùng' },
  session: { expires_at: '2026-10-11T03:00:00Z', absolute_expires_at: '2026-10-11T10:00:00Z', csrf_token: 'controlled-session-csrf' },
  default_store_id: STORE, accessible_store_count: 1, authorization_version: 'opaque auth version',
})
const summaryFixture = () => ({
  store_id: STORE, name: 'Quán A', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND',
  role: 'STAFF', membership_id: MEMBER, authorization_version: 'opaque member version',
})
const storeFixture = () => ({
  ...summaryFixture(), active: true, server_now: '2026-10-11T18:30:00Z', as_of_date: '2026-10-12',
  membership: { membership_id: MEMBER, role: 'STAFF', authorization_version: 'opaque member version', effective_permissions: ['menu.read'] },
  permission_catalog_version: 'catalog-1',
})
const envelope = (data, meta = {}) => ({ data, error: null, meta: { request_id: 'qa-request', ...meta } })
const jsonResponse = (payload, status = 200, headers) => new Response(JSON.stringify(payload), { status, headers })
const failure = (code) => ({ data: null, meta: { request_id: 'qa-error-reference' }, error: { code, message: code, details: {} } })
function stubFetch(t, handler) { t.mock.method(globalThis, 'fetch', handler) }
function session(t, options = {}) {
  const cleanup = configureHttpSession({ getCsrfToken: () => 'session-token', onUnauthenticated: () => {}, ...options })
  t.after(cleanup)
  return cleanup
}
const protocol = (error) => error instanceof HttpError && error.kind === 'protocol'

test('A01 posts canonical credentials without session CSRF or token fabrication', async (t) => {
  let invalidations = 0
  session(t, { getCsrfToken: () => null, onUnauthenticated: () => invalidations++ })
  let observed
  stubFetch(t, async (url, options) => { observed = { url, options }; return jsonResponse(envelope(authFixture())) })
  const data = await createAuthDataSource(BASE).login({ email: '  OWNER@EXAMPLE.COM  ', password: '  unchanged password  ', remember_me: true })
  assert.equal(observed.url, `${BASE}/api/v1/auth/login`)
  assert.equal(observed.options.credentials, 'include')
  assert.equal(observed.options.cache, 'no-store')
  assert.deepEqual(JSON.parse(observed.options.body), { email: 'owner@example.com', password: '  unchanged password  ', remember_me: true })
  assert.equal(new Headers(observed.options.headers).get('X-CSRF-Token'), null)
  assert.equal(new Headers(observed.options.headers).get('Authorization'), null)
  assert.equal(data.user.user_id, USER)
  assert.equal(invalidations, 0)
})

test('invalid credentials stay a public A01 error; protected 401 policy does not run', async (t) => {
  let invalidations = 0
  session(t, { onUnauthenticated: () => invalidations++ })
  stubFetch(t, async () => jsonResponse(failure('INVALID_CREDENTIALS'), 401))
  await assert.rejects(createAuthDataSource(BASE).login({ email: 'owner@example.com', password: 'bad', remember_me: false }),
    (error) => error instanceof HttpError && error.status === 401 && error.problem?.code === 'INVALID_CREDENTIALS' && error.requestId === 'qa-error-reference')
  assert.equal(invalidations, 0)
})

test('invalid login input fails locally and does not send credentials', async (t) => {
  let calls = 0
  stubFetch(t, async () => { calls++; return jsonResponse(envelope(authFixture())) })
  const source = createAuthDataSource(BASE)
  await assert.rejects(source.login({ email: 'invalid', password: 'password', remember_me: false }))
  await assert.rejects(source.login({ email: 'a@example.com', password: '', remember_me: false }))
  assert.equal(calls, 0)
})

test('A03 authoritative session read uses included cookies, no query or mutation CSRF', async (t) => {
  session(t, { getCsrfToken: () => null })
  let observed
  stubFetch(t, async (url, options) => { observed = { url, options }; return jsonResponse(envelope(authFixture())) })
  const data = await createAuthDataSource(BASE).readSession()
  assert.equal(observed.url, `${BASE}/api/v1/auth/me`)
  assert.equal(observed.options.body, undefined)
  assert.equal(observed.options.credentials, 'include')
  assert.equal(new Headers(observed.options.headers).get('X-CSRF-Token'), null)
  assert.equal(data.session.csrf_token, 'controlled-session-csrf')
})

test('protected 401 invalidates current session even if response body is malformed', async (t) => {
  let invalidations = 0
  session(t, { getCsrfToken: () => null, onUnauthenticated: () => invalidations++ })
  stubFetch(t, async () => new Response('gateway HTML', { status: 401, headers: { 'X-Request-Id': 'header-reference' } }))
  await assert.rejects(createAuthDataSource(BASE).readSession(),
    (error) => error instanceof HttpError && error.status === 401 && error.requestId === 'header-reference')
  assert.equal(invalidations, 1)
})

test('late protected 401 cannot invalidate a newer CSRF session', async (t) => {
  let token = 'before-login'
  let invalidations = 0
  session(t, { getCsrfToken: () => token, onUnauthenticated: () => invalidations++ })
  let resolveResponse
  stubFetch(t, () => new Promise((resolve) => { resolveResponse = resolve }))
  const pending = requestJson(BASE, '/api/v1/protected')
  token = 'after-login'
  resolveResponse(jsonResponse(failure('UNAUTHENTICATED'), 401))
  await assert.rejects(pending)
  assert.equal(invalidations, 0)
})

test('late protected 401 cannot invalidate replacement session hooks', async (t) => {
  let invalidations = 0
  session(t, { onUnauthenticated: () => invalidations++ })
  let resolveResponse
  stubFetch(t, () => new Promise((resolve) => { resolveResponse = resolve }))
  const pending = requestJson(BASE, '/api/v1/protected')
  session(t, { onUnauthenticated: () => invalidations++ })
  resolveResponse(jsonResponse(failure('UNAUTHENTICATED'), 401))
  await assert.rejects(pending)
  assert.equal(invalidations, 0)
})

test('aborted protected request does not invalidate canonical session', async (t) => {
  let invalidations = 0
  session(t, { onUnauthenticated: () => invalidations++ })
  const controller = new AbortController()
  let resolveResponse
  stubFetch(t, () => new Promise((resolve) => { resolveResponse = resolve }))
  const pending = requestJson(BASE, '/api/v1/protected', { signal: controller.signal })
  controller.abort()
  resolveResponse(jsonResponse(failure('UNAUTHENTICATED'), 401))
  await assert.rejects(pending)
  assert.equal(invalidations, 0)
})

test('session-owned current CSRF is injected into JSON and multipart mutations', async (t) => {
  let token = 'first-session-token'
  session(t, { getCsrfToken: () => token })
  const observed = []
  stubFetch(t, async (_url, options) => { observed.push(options); return jsonResponse(envelope({ ok: true })) })
  await requestJson(BASE, '/api/v1/change', { method: 'POST', headers: { 'X-CSRF-Token': 'stale-caller-token' }, body: { value: 1 } })
  token = 'rotated-session-token'
  const body = new FormData()
  body.append('files[]', new File(['x'], 'source.csv'))
  await requestMultipart(BASE, '/api/v1/upload', { method: 'POST', body, headers: { 'Content-Type': 'invalid-boundary' } })
  assert.equal(new Headers(observed[0].headers).get('X-CSRF-Token'), 'first-session-token')
  assert.equal(new Headers(observed[1].headers).get('X-CSRF-Token'), 'rotated-session-token')
  assert.equal(new Headers(observed[1].headers).get('Content-Type'), null)
  assert.equal(observed[1].body, body)
})

test('missing CSRF refuses protected writes; caller header cannot bypass session source', async (t) => {
  session(t, { getCsrfToken: () => null })
  let calls = 0
  stubFetch(t, async () => { calls++; return jsonResponse(envelope({ ok: true })) })
  await assert.rejects(requestJson(BASE, '/api/v1/change', { method: 'POST', headers: { 'X-CSRF-Token': 'fabricated' } }),
    (error) => error instanceof CsrfTokenUnavailableError && error.code === 'CSRF_TOKEN_UNAVAILABLE')
  assert.equal(calls, 0)
  await requestJson(BASE, '/api/v1/read')
  assert.equal(calls, 1)
})

test('CSRF/Origin denial has no fabricated token refresh or automatic retry', async (t) => {
  session(t)
  let calls = 0
  stubFetch(t, async () => { calls++; return jsonResponse(failure('CSRF_CHECK_FAILED'), 403) })
  await assert.rejects(requestJson(BASE, '/api/v1/change', { method: 'POST' }),
    (error) => error instanceof HttpError && error.problem?.code === 'CSRF_CHECK_FAILED')
  assert.equal(calls, 1)
})

test('A04 accepts only204, sends no body/JSON content type and uses central CSRF', async (t) => {
  session(t)
  let observed
  stubFetch(t, async (url, options) => { observed = { url, options }; return new Response(null, { status: 204 }) })
  await createAuthDataSource(BASE).logout()
  assert.equal(observed.url, `${BASE}/api/v1/auth/logout`)
  assert.equal(observed.options.method, 'POST')
  assert.equal(observed.options.body, undefined)
  assert.equal(new Headers(observed.options.headers).get('Content-Type'), null)
  assert.equal(new Headers(observed.options.headers).get('X-CSRF-Token'), 'session-token')
  stubFetch(t, async () => jsonResponse(envelope({ ok: true })))
  await assert.rejects(createAuthDataSource(BASE).logout(), protocol)
})

test('logout failure stays an error; no automatic local-success translation', async (t) => {
  session(t)
  stubFetch(t, async () => { throw new TypeError('network') })
  await assert.rejects(createAuthDataSource(BASE).logout(), (error) => error instanceof HttpError && error.kind === 'transport')
})

test('HTTP errors preserve safe request references and validate nested canonical errors', async (t) => {
  session(t)
  stubFetch(t, async () => jsonResponse({ ...failure('PERMISSION_DENIED'), meta: {} }, 403, { 'X-Request-Id': 'fallback-ref' }))
  await assert.rejects(requestJson(BASE, '/protected'), (error) => error.requestId === 'fallback-ref' && error.problem?.code === 'PERMISSION_DENIED')
  stubFetch(t, async () => jsonResponse({ data: null, meta: {}, error: { code: 'BAD', message: 'bad', details: [] } }, 422))
  await assert.rejects(requestJson(BASE, '/protected'), (error) => error instanceof HttpError && error.kind === 'http' && error.problem === undefined)
})

test('session context validates default Store/count, UUIDs, token and true UTC instants', () => {
  assert.deepEqual(validateAuthContext(envelope(authFixture())), authFixture())
  const noStore = { ...authFixture(), default_store_id: null, accessible_store_count: 0 }
  assert.equal(validateAuthContext(envelope(noStore)).accessible_store_count, 0)
  const multiStore = { ...authFixture(), default_store_id: null, accessible_store_count: 2 }
  assert.equal(validateAuthContext(envelope(multiStore)).default_store_id, null)
  const corruptions = [
    (value) => { value.default_store_id = null },
    (value) => { value.accessible_store_count = 2 },
    (value) => { value.accessible_store_count = -1 },
    (value) => { value.user.user_id = 'user-1' },
    (value) => { value.session.csrf_token = '' },
    (value) => { value.session.expires_at = '2026-02-30T01:00:00Z' },
    (value) => { value.session.expires_at = '2026-10-12T01:00:00Z' },
    (value) => { value.authorization_version = '' },
  ]
  for (const corrupt of corruptions) {
    const value = authFixture()
    corrupt(value)
    assert.throws(() => validateAuthContext(envelope(value)), protocol)
  }
})

test('malformed Auth envelope, backend503 and network errors remain distinct', async (t) => {
  session(t)
  const source = createAuthDataSource(BASE)
  stubFetch(t, async () => jsonResponse({ data: authFixture(), meta: {}, error: null }))
  await assert.rejects(source.readSession(), protocol)
  stubFetch(t, async () => jsonResponse(failure('SERVICE_UNAVAILABLE'), 503))
  await assert.rejects(source.readSession(), (error) => error.kind === 'contract' && error.status === 503)
  stubFetch(t, async () => { throw new TypeError('network') })
  await assert.rejects(source.readSession(), (error) => error.kind === 'transport')
})

test('T01 omits default limit, preserves opaque cursor and validates pagination', async (t) => {
  session(t)
  const observed = []
  const page = { limit: 50, next_cursor: 'opaque next', total_count: null }
  stubFetch(t, async (url) => { observed.push(url); return jsonResponse(envelope({ items: [summaryFixture()] }, { pagination: page })) })
  const source = createStoreDataSource(BASE)
  assert.deepEqual((await source.list()).pagination, page)
  await source.list(undefined, 'opaque cursor+&')
  assert.equal(observed[0], `${BASE}/api/v1/stores`)
  assert.equal(new URL(observed[1]).searchParams.get('cursor'), 'opaque cursor+&')
  assert.equal(new URL(observed[1]).searchParams.has('limit'), false)
  assert.throws(() => validateStoreList(envelope({ items: [summaryFixture(), summaryFixture()] }, { pagination: page })), protocol)
})

test('T02 consumes exact Store UUID, timezone/current-date and membership permissions', async (t) => {
  session(t)
  let url
  stubFetch(t, async (target) => { url = target; return jsonResponse(envelope(storeFixture())) })
  const context = await createStoreDataSource(BASE).read(STORE)
  assert.equal(url, `${BASE}/api/v1/stores/${STORE}`)
  assert.equal(context.as_of_date, '2026-10-12')
  assert.deepEqual(context.membership.effective_permissions, ['menu.read'])
  assert.throws(() => validateStoreContext(envelope(storeFixture()), USER), protocol)
})

test('Store schema rejects unavailable membership, wrong role/version/timezone and malformed permissions', () => {
  const corruptions = [
    (value) => { value.active = false },
    (value) => { value.timezone = 'Mars/Unknown' },
    (value) => { value.role = 'ADMIN' },
    (value) => { value.membership = null },
    (value) => { value.membership.membership_id = USER },
    (value) => { value.membership.authorization_version = 'different' },
    (value) => { value.membership.effective_permissions = ['menu.read', 'menu.read'] },
    (value) => { value.membership.effective_permissions = [null] },
    (value) => { value.as_of_date = '2026-10-11' },
    (value) => { value.server_now = '2026-02-30T18:30:00Z' },
  ]
  for (const corrupt of corruptions) {
    const value = storeFixture()
    corrupt(value)
    assert.throws(() => validateStoreContext(envelope(value), STORE), protocol)
  }
})

test('Owner permissions remain exact server-provided catalogue entries, not inferred actions', () => {
  const value = storeFixture()
  value.role = 'OWNER'
  value.membership.role = 'OWNER'
  value.membership.effective_permissions = ['menu.read']
  assert.deepEqual(validateStoreContext(envelope(value), STORE).membership.effective_permissions, ['menu.read'])
})

test('Store reads propagate403/404 and do not silently choose a fixture or default Store', async (t) => {
  session(t)
  const source = createStoreDataSource(BASE)
  for (const [status, code] of [[403, 'PERMISSION_DENIED'], [404, 'RESOURCE_NOT_FOUND']]) {
    stubFetch(t, async () => jsonResponse(failure(code), status))
    await assert.rejects(source.read(STORE), (error) => error.status === status && error.problem?.code === code)
  }
  let calls = 0
  stubFetch(t, async () => { calls++; return jsonResponse(envelope(storeFixture())) })
  await assert.rejects(source.read('not-a-store-uuid'))
  assert.equal(calls, 0)
})

test('cleaning stale hook registration cannot remove the current session source', async (t) => {
  const staleCleanup = session(t, { getCsrfToken: () => 'old' })
  session(t, { getCsrfToken: () => 'new' })
  staleCleanup()
  let token
  stubFetch(t, async (_url, options) => { token = new Headers(options.headers).get('X-CSRF-Token'); return new Response(null, { status: 204 }) })
  await requestNoContent(BASE, '/logout', { method: 'POST' })
  assert.equal(token, 'new')
})

function businessReads(storeId) {
  const signal = new AbortController().signal
  return [
    { path: `/api/v1/stores/${storeId}/inventory`, run: () => getInventory({}, signal, storeId) },
    { path: `/api/v1/stores/${storeId}/inventory/${USER}`, run: () => getInventoryIngredient(USER, 'snapshot-bound', signal, storeId) },
    { path: `/api/v1/stores/${storeId}/inventory/${USER}/lots`, run: () => getInventoryLots(USER, { snapshot_id: 'snapshot-bound', cursor: 'opaque lots' }, signal, storeId) },
    { path: `/api/v1/stores/${storeId}/inventory/${USER}/movements`, run: () => getInventoryMovements(USER, { snapshot_id: 'snapshot-bound' }, signal, storeId) },
    { path: `/api/v1/stores/${storeId}/products`, run: () => getMenu({ q: 'cà phê', status: 'active' }, signal, storeId) },
    { path: `/api/v1/stores/${storeId}/products/${USER}`, run: () => getMenuProduct(USER, signal, storeId) },
    { path: `/api/v1/stores/${storeId}/imports/calendar`, run: () => getImportCalendar({ month: '2026-10' }, signal, storeId) },
    { path: `/api/v1/stores/${storeId}/imports`, run: () => getImportHistory({ import_date: '2026-10-11', cursor: 'opaque history' }, signal, storeId) },
  ]
}

test('all Inventory/Menu/History reads use current Store scope and ignore poisoned development Store', async (t) => {
  session(t, { getCsrfToken: () => null })
  const observed = []
  stubFetch(t, async (url, options) => {
    observed.push({ url: new URL(url), options })
    return jsonResponse(failure('PERMISSION_DENIED'), 403)
  })
  const operations = businessReads(STORE)
  for (const operation of operations) {
    await assert.rejects(operation.run(), (error) => error instanceof HttpError &&
      error.status === 403 && error.problem?.code === 'PERMISSION_DENIED')
  }
  assert.equal(observed.length, operations.length)
  observed.forEach(({ url, options }, index) => {
    assert.equal(url.origin, BASE)
    assert.equal(url.pathname, operations[index].path)
    assert.equal(url.href.includes('ffffffff-ffff-4fff-8fff-ffffffffffff'), false)
    assert.equal(url.searchParams.has('limit'), false)
    assert.equal(url.searchParams.has('lot_limit'), false)
    assert.equal(options.credentials, 'include')
    assert.equal(options.cache, 'no-store')
    assert.equal(options.body, undefined)
    assert.equal(new Headers(options.headers).get('X-CSRF-Token'), null)
  })
  assert.equal(observed[1].url.searchParams.get('snapshot_id'), 'snapshot-bound')
  assert.equal(observed[2].url.searchParams.get('cursor'), 'opaque lots')
  assert.equal(observed[3].url.searchParams.get('sort'), '-occurred_at')
  assert.equal(observed[5].url.search, '')
  assert.equal(observed[7].url.searchParams.get('cursor'), 'opaque history')
})

test('missing or invalid current Store blocks every business read before fetch without development fallback', async (t) => {
  session(t)
  let calls = 0
  stubFetch(t, async () => { calls++; return jsonResponse(failure('PERMISSION_DENIED'), 403) })
  for (const scope of [null, '', 'not-a-store-uuid']) {
    for (const operation of businessReads(scope)) await assert.rejects(operation.run())
  }
  assert.equal(calls, 0)
})

test('business GET401 uses central session invalidation without requiring or sending CSRF', async (t) => {
  let invalidations = 0
  session(t, { getCsrfToken: () => null, onUnauthenticated: () => invalidations++ })
  let observed
  stubFetch(t, async (_url, options) => { observed = options; return jsonResponse(failure('UNAUTHENTICATED'), 401) })
  await assert.rejects(getMenu({}, new AbortController().signal, STORE),
    (error) => error instanceof HttpError && error.status === 401 && error.problem?.code === 'UNAUTHENTICATED')
  assert.equal(invalidations, 1)
  assert.equal(new Headers(observed.headers).get('X-CSRF-Token'), null)
})

test('Inventory timestamps use actual Store timezone while date-only facts and explicit UTC fallback stay unchanged', () => {
  const timestamp = '2026-10-11T18:30:00Z'
  assert.equal(formatInventoryTimestamp(timestamp, 'Asia/Ho_Chi_Minh'), '12/10/2026 01:30:00 (Asia/Ho_Chi_Minh)')
  assert.equal(formatInventoryTimestamp(timestamp), '11/10/2026 18:30:00 UTC')
  assert.equal(formatInventoryTimestamp(timestamp, null), '11/10/2026 18:30:00 UTC')
  assert.equal(formatInventoryTimestamp(null, 'Asia/Ho_Chi_Minh'), 'Chưa xác định')
  assert.equal(formatInventoryDate('2026-10-11'), '11/10/2026')
  assert.equal(formatInventoryDate(null), 'Chưa xác định')
})
