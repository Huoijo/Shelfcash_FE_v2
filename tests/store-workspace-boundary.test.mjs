import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createStoreWorkspaceDataSource } from '../src/features/store-workspace/storeWorkspace.data'
import { createMockStoreWorkspaceDataSource, STORE_WORKSPACE_FIXTURE_IDS as ids, storeWorkspaceBudgetFixture,
  storeWorkspaceCatalogueFixture, storeWorkspaceInvitationFixture, storeWorkspaceMembershipsFixture, storeWorkspaceStaffFixture } from '../src/features/store-workspace/storeWorkspace.fixtures'
import { matchesStoreWire } from '../src/features/store-workspace/storeWorkspace.wire'
import { validateWorkspaceBudget, validateWorkspaceBudgetRequest, validateWorkspaceGrants, validateWorkspaceInvitationAction,
  validateWorkspaceInvitationActionResult, validateWorkspaceInvitationCreate, validateWorkspaceInvitationCreated,
  validateWorkspaceInvitations, validateWorkspaceKey, validateWorkspaceMemberships, validateWorkspacePermissions, workspaceIfMatch } from '../src/features/store-workspace/storeWorkspace.validation'
import { configureHttpSession, CsrfTokenUnavailableError, HttpError } from '../src/shared/http/httpClient'

const OTHER = 'd1000000-0000-4000-8000-000000000099'
const key = 'synthetic-intent-key'
const envelope = (data) => ({ data, meta: { request_id: 'qa-workspace' }, error: null })
const membershipList = () => storeWorkspaceMembershipsFixture()
const invitationList = () => ({ ...envelope({ items: [storeWorkspaceInvitationFixture()] }),
  meta: { request_id: 'qa-invitations', pagination: { limit: 50, total_count: 1, next_cursor: null } } })
const permissions = (changed = false) => envelope({ membership: storeWorkspaceStaffFixture(), changed, event_id: changed ? ids.event : null })
const createRequest = () => ({ email: 'invite-qa@example.invalid', grants: ['menu.read'], permission_catalog_version: 'permissions-v3', reason: 'Mời Staff kiểm thử' })
const created = () => envelope({ invitation: storeWorkspaceInvitationFixture(), delivery: { status: 'queued', attempt_id: ids.attempt } })
const budget = (amount = '0') => envelope({ store_id: ids.store, budget_ceiling: storeWorkspaceBudgetFixture({ amount }) })
const source = () => createStoreWorkspaceDataSource({ dataSource: 'api', apiBaseUrl: 'https://workspace-qa.invalid' })
const respond = (payload, status = 200) => new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } })
function fetchWith(t, callback) { const original = globalThis.fetch; globalThis.fetch = callback; t.after(() => { globalThis.fetch = original }) }
function session(t, token = 'synthetic-csrf') { t.after(configureHttpSession({ getCsrfToken: () => token, onUnauthenticated: () => {} })) }

test('current Store Workspace fixtures conform to frozen canonical schemas', () => {
  for (const [schema, value] of [['Envelope_MembershipList_', membershipList()], ['Envelope_PermissionUpdate_', permissions()],
    ['Envelope_InvitationList_', invitationList()], ['Envelope_InvitationCreation_', created()], ['Envelope_BudgetResult_', budget()],
    ['GrantsRequest', { grants: [], reason: 'Thu quyền' }], ['CreateInvitation', createRequest()]])
    assert.equal(matchesStoreWire(schema, value), true, schema)
  assert.equal(storeWorkspaceCatalogueFixture().length, 43)
})

test('N12 preserves inactive Staff, independent grants and canonical optional defaults', () => {
  const input = membershipList(); delete input.data.permission_catalog_version; delete input.data.items[0].role
  const result = validateWorkspaceMemberships(input)
  assert.equal(result.data.permission_catalog_version, 'permissions-v3')
  assert.equal(result.data.items[0].role, 'STAFF')
  assert.equal(result.data.items[1].active, false)
  assert.deepEqual(result.data.items[1].grants, [])
})

test('N12 rejects fake Owner roster, duplicates, missing pagination and unknown grant keys', () => {
  const cases = Array.from({ length: 5 }, membershipList)
  cases[0].data.items[0].role = 'OWNER'
  cases[1].data.items.push(cases[1].data.items[0])
  delete cases[2].meta.pagination
  cases[3].data.items[0].grants = ['owner.all']
  cases[4].data.permission_catalog.push(cases[4].data.permission_catalog[0])
  for (const input of cases) assert.throws(() => validateWorkspaceMemberships(input), HttpError)
})

test('full replacement grants are sorted unique and never silently add prerequisites', () => {
  const input = { grants: ['planning.run'], reason: 'Chọn một tác vụ độc lập' }
  assert.deepEqual(validateWorkspaceGrants(input, storeWorkspaceCatalogueFixture()), input)
  assert.deepEqual(validateWorkspaceGrants({ grants: [], reason: 'Thu toàn bộ quyền' }).grants, [])
  for (const request of [{ grants: ['menu.read', 'inventory.read'], reason: 'Sai thứ tự' }, { grants: ['menu.read', 'menu.read'], reason: 'Trùng' },
    { grants: ['unknown.permission'], reason: 'Không có trong catalogue' }, { grants: [], reason: '  ' },
    { grants: [], reason: 'Không sửa role', role: 'OWNER' }, { grants: [], reason: 'Không sửa active', active: true }])
    assert.throws(() => validateWorkspaceGrants(request, storeWorkspaceCatalogueFixture()))
})

test('nondelegable catalogue keys cannot be granted even if known', () => {
  const catalogue = storeWorkspaceCatalogueFixture(); catalogue.find((item) => item.key === 'menu.read').grantable_to_staff = false
  assert.throws(() => validateWorkspaceGrants({ grants: ['menu.read'], reason: 'Không cấp được' }, catalogue))
})

test('N13 no-op receipt cannot fabricate a change event or a different submitted grant set', () => {
  assert.equal(validateWorkspacePermissions(permissions(), ids.staff).data.event_id, null)
  const bad = permissions(); bad.data.event_id = ids.event
  assert.throws(() => validateWorkspacePermissions(bad, ids.staff), HttpError)
  assert.throws(() => validateWorkspacePermissions(permissions(), OTHER), HttpError)
  assert.throws(() => validateWorkspacePermissions(permissions(), ids.staff, { grants: [], reason: 'Thu quyền' }), HttpError)
  const inactive = permissions(); inactive.data.membership.active = false
  assert.throws(() => validateWorkspacePermissions(inactive, ids.staff), HttpError)
})

test('invitation requests reject role, user/account creation, arbitrary lifecycle and Owner token fields', () => {
  assert.deepEqual(validateWorkspaceInvitationCreate(createRequest()), createRequest())
  for (const extra of [{ role: 'OWNER' }, { user_id: ids.user }, { account_exists: true }, { token: 'synthetic-secret' }, { active: true }])
    assert.throws(() => validateWorkspaceInvitationCreate({ ...createRequest(), ...extra }))
  for (const email of ['bad', 'a b@example.invalid', 'a\nb@example.invalid']) assert.throws(() => validateWorkspaceInvitationCreate({ ...createRequest(), email }))
  assert.throws(() => validateWorkspaceInvitationCreate({ ...createRequest(), permission_catalog_version: 'permissions-v1' }))
  assert.throws(() => validateWorkspaceInvitationAction({ action: 'accept', token: 'synthetic-secret' }))
})

test('invitation creation queued delivery is distinct from membership and accepted state', () => {
  const result = validateWorkspaceInvitationCreated(created(), ids.store, createRequest())
  assert.equal(result.data.delivery.status, 'queued')
  assert.equal(result.data.invitation.status, 'pending')
  assert.equal(Object.hasOwn(result.data, 'membership'), false)
  const leaked = created(); leaked.data.token = 'must-not-be-exposed'
  assert.throws(() => validateWorkspaceInvitationCreated(leaked, ids.store), HttpError)
  const accountLeak = created(); accountLeak.data.account_exists = true
  assert.throws(() => validateWorkspaceInvitationCreated(accountLeak, ids.store), HttpError)
})

test('N15 receipt pins canonical recipient and original pending/queued state, not later lifecycle', () => {
  assert.equal(validateWorkspaceInvitationCreated(created(), ids.store, { ...createRequest(), email: 'Invite-QA@Example.Invalid' }).data.invitation.target_email, 'invite-qa@example.invalid')
  const cases = Array.from({ length: 4 }, created)
  cases[0].data.invitation.target_email = 'different-recipient@example.invalid'
  Object.assign(cases[1].data.invitation, { status: 'accepted', accepted_at: '2026-10-11T02:00:00Z' })
  cases[2].data.delivery.status = 'delivered'
  cases[3].data.invitation.delivery_status = 'failed'
  for (const input of cases) assert.throws(() => validateWorkspaceInvitationCreated(input, ids.store, createRequest()), HttpError)
})

test('N16 rejects cross-Store response, inconsistent lifecycle and duplicate invitation rows', () => {
  const cases = Array.from({ length: 4 }, invitationList)
  cases[0].data.items[0].store_id = OTHER
  cases[1].data.items[0].status = 'accepted'
  cases[2].data.items.push(cases[2].data.items[0])
  cases[3].meta.pagination.total_count = 0
  for (const input of cases) assert.throws(() => validateWorkspaceInvitations(input, ids.store), HttpError)
})

test('N17 reissue and revoke receipts retain precise action-specific lifecycle', () => {
  const revoke = envelope({ invitation: storeWorkspaceInvitationFixture({ status: 'revoked', revoked_at: '2026-10-11T01:00:00Z' }), delivery: null, event_id: null })
  assert.equal(validateWorkspaceInvitationActionResult(revoke, ids.store, ids.invitation, { action: 'revoke', reason: 'Đã thu hồi' }).data.event_id, null)
  const reissue = envelope({ ...created().data, event_id: ids.event })
  const request = { action: 'reissue', grants: ['menu.read'], permission_catalog_version: 'permissions-v3', reason: 'Gửi lại' }
  assert.equal(validateWorkspaceInvitationActionResult(reissue, ids.store, ids.invitation, request).data.invitation.status, 'pending')
  reissue.data.delivery = null
  assert.throws(() => validateWorkspaceInvitationActionResult(reissue, ids.store, ids.invitation, request), HttpError)
  reissue.data.delivery = { status: 'delivered', attempt_id: ids.attempt }
  assert.throws(() => validateWorkspaceInvitationActionResult(reissue, ids.store, ids.invitation, request), HttpError)
  assert.throws(() => validateWorkspaceInvitationAction({ action: 'revoke', reason: 'Thu hồi', grants: [] }))
})

test('budget preserves exact zero and huge decimal text, rejecting unlimited/null and runtime knobs', () => {
  for (const amount of ['0', '0.000', '999999999999999999.123456789012345678'])
    assert.deepEqual(validateWorkspaceBudgetRequest({ amount }), { amount })
  for (const amount of [0, null, ' 0', '-0', '01', '+1', '1e6', '1,000', '1000000000000000000', '0.1234567890123456789'])
    assert.throws(() => validateWorkspaceBudgetRequest({ amount }))
  for (const extra of [{ currency: 'VND' }, { month: '2026-10' }, { strategy: 'lean' }, { default_requirements_version: 'x' }])
    assert.throws(() => validateWorkspaceBudgetRequest({ amount: '0', ...extra }))
  assert.equal(validateWorkspaceBudget(budget('0.000'), ids.store, '0').data.budget_ceiling.amount, '0.000')
  assert.throws(() => validateWorkspaceBudget(budget(), OTHER), HttpError)
  assert.throws(() => validateWorkspaceBudget(budget(), ids.store, '1'), HttpError)
})

test('CAS and idempotency header validation accepts opaque keys, never wildcard/weak/multiple CAS', () => {
  assert.equal(validateWorkspaceKey('opaque-not-a-uuid'), 'opaque-not-a-uuid')
  assert.equal(workspaceIfMatch('member-version/2'), '"member-version/2"')
  assert.equal(workspaceIfMatch('"member-version/2"'), '"member-version/2"')
  for (const version of ['', '*', 'W/"version"', 'a,b', '"one","two"', 'a\nb', 'a b']) assert.throws(() => workspaceIfMatch(version))
  for (const value of ['', ' ', 'a\nb', 'a'.repeat(129), 'ư'.repeat(65)]) assert.throws(() => validateWorkspaceKey(value))
})

test('API GETs use Store scope, explicit filters, include cookies and never send mutation CSRF', async (t) => {
  session(t); const calls = []
  fetchWith(t, async (url, init) => { calls.push([url, init]); return respond(url.includes('/memberships') ? membershipList() : invitationList()) })
  const api = source()
  await api.memberships(ids.store, { active: 'all', limit: 50 })
  await api.invitations(ids.store, { statuses: ['pending', 'expired'], email: 'invite-qa@example.invalid', limit: 50 })
  assert.match(calls[0][0], new RegExp(`/stores/${ids.store}/memberships`))
  assert.equal(new URL(calls[0][0]).searchParams.get('role'), 'STAFF')
  assert.equal(new URL(calls[1][0]).searchParams.get('status'), 'pending,expired')
  assert.equal(new URL(calls[1][0]).searchParams.get('view'), 'invitations')
  for (const [, init] of calls) { assert.equal(init.credentials, 'include'); assert.equal(init.cache, 'no-store'); assert.equal(init.headers.has('X-CSRF-Token'), false) }
})

test('N13 writes exact body, original key/CAS and shared session CSRF without editing role or active', async (t) => {
  session(t); const calls = []
  fetchWith(t, async (url, init) => { calls.push([url, init]); return respond(init.method === 'PUT' ? permissions() : membershipList()) })
  const request = { grants: ['inventory.read', 'menu.read'], reason: 'Giữ quyền hiện tại' }
  await source().replacePermissions(ids.store, ids.staff, { key, version: 'synthetic-staff/1', request })
  const [, init] = calls[1]
  assert.equal(init.method, 'PUT'); assert.equal(init.headers.get('If-Match'), '"synthetic-staff/1"')
  assert.equal(init.headers.get('Idempotency-Key'), key); assert.equal(init.headers.get('X-CSRF-Token'), 'synthetic-csrf')
  assert.deepEqual(JSON.parse(init.body), request)
})

test('N15/N17 do not call account, recipient acceptance or token endpoints', async (t) => {
  session(t); const calls = []
  fetchWith(t, async (url, init) => {
    calls.push([url, init])
    if (url.includes('/memberships')) return respond(membershipList())
    if (url.endsWith('/actions')) return respond(envelope({ ...created().data, event_id: ids.event }))
    return respond(created(), 201)
  })
  const api = source()
  await api.createInvitation(ids.store, { key, request: createRequest() })
  await api.invitationAction(ids.store, ids.invitation, { key: 'reissue-key', version: 'synthetic-invitation/1',
    request: { action: 'reissue', grants: ['menu.read'], permission_catalog_version: 'permissions-v3', reason: 'Gửi lại' } })
  assert.equal(calls.length, 3)
  for (const [url, init] of calls) { assert.equal(url.includes('/accept'), false); assert.equal(init.headers.has('X-Invitation-Token'), false); assert.equal(new URL(url).searchParams.has('token'), false) }
})

test('N4 sends exactly one conditional header for create versus replace, preserving zero text', async (t) => {
  session(t); const calls = []
  fetchWith(t, async (url, init) => { calls.push([url, init]); return respond(budget('0.000')) })
  const api = source()
  await api.updateBudget(ids.store, { key, request: { amount: '0.000' }, condition: { kind: 'create' } })
  await api.updateBudget(ids.store, { key: 'replace-key', request: { amount: '0' }, condition: { kind: 'replace', version: 'synthetic-cap/1' } })
  assert.equal(calls[0][1].headers.get('If-None-Match'), '*'); assert.equal(calls[0][1].headers.has('If-Match'), false)
  assert.equal(calls[1][1].headers.get('If-Match'), '"synthetic-cap/1"'); assert.equal(calls[1][1].headers.has('If-None-Match'), false)
  assert.deepEqual(JSON.parse(calls[0][1].body), { amount: '0.000' })
  assert.match(calls[0][0], /\/planning-budget$/)
})

test('unsupported body/precondition/query/ID inputs are rejected before a network call', async (t) => {
  session(t); let calls = 0
  fetchWith(t, async () => { calls++; throw new Error('Unexpected fetch') })
  const api = source()
  for (const action of [() => api.memberships('not-id'), () => api.memberships(ids.store, { limit: 101 }),
    () => api.invitations(ids.store, { statuses: ['pending', 'pending'] }), () => api.invitations(ids.store, { cursor: '' }),
    () => api.updateBudget(ids.store, { key, request: { amount: null }, condition: { kind: 'create' } }),
    () => api.updateBudget(ids.store, { key, request: { amount: '0' }, condition: { kind: 'create', version: 'overlap' } }),
    () => api.replacePermissions(ids.store, ids.staff, { key, version: '*', request: { grants: [], reason: 'Thu quyền' } })])
    await assert.rejects(action)
  assert.equal(calls, 0)
})

test('mutation needs current session CSRF and never falls back to fixtures', async (t) => {
  session(t, null); let calls = 0
  fetchWith(t, async () => { calls++; throw new Error('No live response') })
  await assert.rejects(() => source().updateBudget(ids.store, { key, request: { amount: '0' }, condition: { kind: 'create' } }), CsrfTokenUnavailableError)
  assert.equal(calls, 0)
  assert.throws(() => createStoreWorkspaceDataSource({ dataSource: 'mock', apiBaseUrl: '' }))
  const explicit = createMockStoreWorkspaceDataSource()
  assert.equal(createStoreWorkspaceDataSource({ dataSource: 'mock', apiBaseUrl: '', mockSource: explicit }), explicit)
})

test('transport uncertainty never automatically retries a write or fabricates success', async (t) => {
  session(t); let calls = 0
  fetchWith(t, async () => { calls++; throw new TypeError('offline') })
  await assert.rejects(() => source().updateBudget(ids.store, { key, request: { amount: '0' }, condition: { kind: 'replace', version: 'cap/1' } }), (error) => error instanceof HttpError && error.kind === 'transport')
  assert.equal(calls, 1)
})

test('canonical 403/409/412/428/429 errors retain server codes/request IDs without reinterpretation', async (t) => {
  session(t); let status = 403
  fetchWith(t, async () => respond({ data: null, meta: { request_id: 'qa-rejection' }, error: { code: 'EXACT_SERVER_CODE', message: 'Yêu cầu bị từ chối', details: {} } }, status))
  for (status of [403, 409, 412, 428, 429]) await assert.rejects(() => source().updateBudget(ids.store, { key, request: { amount: '0' }, condition: { kind: 'replace', version: 'cap/1' } }),
    (error) => error instanceof HttpError && error.status === status && error.problem.code === 'EXACT_SERVER_CODE' && error.requestId === 'qa-rejection')
})

test('an aborted N12 response cannot populate the catalogue for a later mutation', async (t) => {
  session(t); const abort = new AbortController(); let calls = 0
  fetchWith(t, async (url, init) => {
    calls++
    if (calls === 1) { abort.abort(); return respond(membershipList()) }
    return respond(init.method === 'PUT' ? permissions() : membershipList())
  })
  const api = source()
  await assert.rejects(() => api.memberships(ids.store, {}, abort.signal))
  await api.replacePermissions(ids.store, ids.staff, { key, version: 'synthetic-staff/1', request: { grants: ['inventory.read', 'menu.read'], reason: 'Không dùng cache stale' } })
  assert.equal(calls, 3)
})

test('API mutation snapshots the original body before asynchronous catalogue loading', async (t) => {
  session(t); let release; let captured
  const request = { grants: ['inventory.read', 'menu.read'], reason: 'Ý định gốc' }
  fetchWith(t, async (url, init) => {
    if (url.includes('/memberships?')) { await new Promise((resolve) => { release = resolve }); return respond(membershipList()) }
    captured = JSON.parse(init.body); return respond(permissions())
  })
  const pending = source().replacePermissions(ids.store, ids.staff, { key, version: 'synthetic-staff/1', request })
  request.grants = []; request.reason = 'Đã sửa UI'
  release(); await pending
  assert.deepEqual(captured, { grants: ['inventory.read', 'menu.read'], reason: 'Ý định gốc' })
})

test('mock permission changes are exact, CAS protected, no-op aware and receipt replay safe', async () => {
  const mock = createMockStoreWorkspaceDataSource(), intent = { key, version: 'synthetic-staff/1', request: { grants: [], reason: 'Thu toàn bộ' } }
  const result = await mock.replacePermissions(ids.store, ids.staff, intent)
  assert.deepEqual(validateWorkspacePermissions(result, ids.staff, intent.request).data.membership.grants, [])
  assert.deepEqual(await mock.replacePermissions(ids.store, ids.staff, intent), result)
  await assert.rejects(() => mock.replacePermissions(ids.store, ids.staff, { ...intent, key: 'new-key' }), (error) => error.status === 412)
  await assert.rejects(() => mock.replacePermissions(ids.store, ids.staff, { ...intent, request: { grants: ['menu.read'], reason: 'Nội dung khác' } }), (error) => error.status === 409)
  const noOp = await mock.replacePermissions(ids.store, ids.staff, { key: 'noop-key', version: result.data.membership.version, request: intent.request })
  assert.equal(noOp.data.changed, false); assert.equal(noOp.data.event_id, null)
})

test('mock invitation creation and lifecycle never creates Staff membership or delivers mail', async () => {
  const mock = createMockStoreWorkspaceDataSource(), count = (await mock.memberships(ids.store)).meta.pagination.total_count
  const result = await mock.createInvitation(ids.store, { key, request: { ...createRequest(), email: 'new-qa@example.invalid' } })
  validateWorkspaceInvitationCreated(result, ids.store)
  assert.equal(result.data.delivery.status, 'queued')
  assert.equal((await mock.memberships(ids.store)).meta.pagination.total_count, count)
  const revoked = await mock.invitationAction(ids.store, result.data.invitation.invitation_id, { key: 'revoke-key', version: result.data.invitation.version, request: { action: 'revoke', reason: 'Thu hồi' } })
  validateWorkspaceInvitationActionResult(revoked, ids.store, result.data.invitation.invitation_id, { action: 'revoke', reason: 'Thu hồi' })
  const reissued = await mock.invitationAction(ids.store, result.data.invitation.invitation_id, { key: 'reissue-key', version: revoked.data.invitation.version,
    request: { action: 'reissue', grants: [], permission_catalog_version: 'permissions-v3', reason: 'Gửi lại không quyền tính năng' } })
  assert.equal(reissued.data.invitation.status, 'pending'); assert.deepEqual(reissued.data.invitation.offered_grants, [])
})

test('mock budget writes independent of planning readiness and isolate Store state', async () => {
  const mock = createMockStoreWorkspaceDataSource(), intent = { key, request: { amount: '0' }, condition: { kind: 'replace', version: 'synthetic-cap/1' } }
  assert.equal((await mock.planningContext(ids.store)).data.readiness.can_generate, false)
  const result = await mock.updateBudget(ids.store, intent)
  validateWorkspaceBudget(result, ids.store, '0')
  assert.equal((await mock.planningContext(ids.store)).data.budget_ceiling.amount, '0')
  assert.equal((await mock.planningContext(ids.secondStore)).data.budget_ceiling.amount, '1000000')
  assert.deepEqual(await mock.updateBudget(ids.store, intent), result)
  await assert.rejects(() => mock.updateBudget(ids.store, { key: 'create-new-key', request: { amount: '5' }, condition: { kind: 'create' } }), (error) => error.status === 412)
})

test('mock paginated snapshots reject a changed list instead of mixing pages', async () => {
  const mock = createMockStoreWorkspaceDataSource(), first = await mock.memberships(ids.store, { limit: 1 })
  const second = await mock.memberships(ids.store, { limit: 1, cursor: first.meta.pagination.next_cursor })
  assert.equal(second.data.items[0].membership_id, ids.inactiveStaff)
  await mock.replacePermissions(ids.store, ids.staff, { key, version: 'synthetic-staff/1', request: { grants: [], reason: 'Thay đổi danh sách' } })
  await assert.rejects(() => mock.memberships(ids.store, { limit: 1, cursor: first.meta.pagination.next_cursor }), (error) => error.status === 409)
})
