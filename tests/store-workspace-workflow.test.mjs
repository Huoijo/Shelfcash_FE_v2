import test from 'node:test'
import assert from 'node:assert/strict'
import { HttpError } from '../src/shared/http/httpClient'
import { StoreWorkspaceWorkflow } from '../src/features/store-workspace/storeWorkspace.workflow'
import { mockStoreContext, MOCK_STORE_IDS } from '../src/features/store/store.fixtures'
import {
  createMockStoreWorkspaceDataSource, STORE_WORKSPACE_FIXTURE_IDS,
  storeWorkspaceMembershipsFixture, storeWorkspaceStaffFixture, storeWorkspaceInvitationFixture,
  storeWorkspaceBudgetFixture,
} from '../src/features/store-workspace/storeWorkspace.fixtures'
import { planningContextFixture } from '../src/features/decision-planning/planning.fixtures'

const ids = STORE_WORKSPACE_FIXTURE_IDS
const clone = (value) => structuredClone(value)
const envelope = (data, pagination) => ({ data, meta: { request_id: 'workflow-controlled', ...(pagination ? { pagination } : {}) }, error: null })
const grantsRequest = () => ({ grants: ['menu.read'], reason: 'Đổi quyền cho ca làm việc' })
const inviteRequest = () => ({ email: 'new-staff@example.invalid', grants: ['menu.read'], permission_catalog_version: 'permissions-v2', reason: 'Mời nhân viên ca sáng' })
const denial = (status = 403) => new HttpError('contract', 'Máy chủ từ chối yêu cầu', status, { code: 'PERMISSION_DENIED', message: 'Máy chủ từ chối yêu cầu', details: {} }, 'controlled-denial')
const conflict = () => new HttpError('contract', 'Phiên bản đã thay đổi', 412, { code: 'PRECONDITION_FAILED', message: 'Phiên bản đã thay đổi', details: {} }, 'controlled-conflict')
const lost = () => new HttpError('transport', 'Mất phản hồi sau khi gửi')
const deferred = () => { let resolve; const promise = new Promise((yes) => { resolve = yes }); return { promise, resolve } }
const ownerFlow = (overrides = {}, store = mockStoreContext()) => {
  const source = { ...createMockStoreWorkspaceDataSource(), ...overrides }
  return { source, flow: new StoreWorkspaceWorkflow(source, store) }
}
const memberPage = (items, cursor = null, total = null, catalog = storeWorkspaceMembershipsFixture().data.permission_catalog) => envelope({
  items, permission_catalog_version: 'permissions-v2', permission_catalog: catalog,
}, { limit: 50, next_cursor: cursor, total_count: total })
const invitationPage = (items, cursor = null, total = null) => envelope({ items }, { limit: 50, next_cursor: cursor, total_count: total })
const permissionReceipt = (request, version = 'controlled-member/2') => envelope({
  membership: storeWorkspaceStaffFixture({ grants: clone(request.grants), version }), changed: true, event_id: ids.event,
})

test('Staff cannot load Owner roster/invitations or mutate grants/invitations even with copied action strings', async () => {
  let calls = 0
  const store = mockStoreContext(MOCK_STORE_IDS.second)
  store.membership.effective_permissions.push('staff.permissions.manage')
  const { flow } = ownerFlow({
    memberships: async () => { calls++; throw new Error('must not request') },
    invitations: async () => { calls++; throw new Error('must not request') },
    replacePermissions: async () => { calls++; throw new Error('must not request') },
    createInvitation: async () => { calls++; throw new Error('must not request') },
  }, store)
  await flow.loadMembers(); await flow.loadInvitations()
  await flow.savePermissions(ids.staff, grantsRequest()); await flow.invite(inviteRequest())
  assert.equal(flow.canManage, false)
  assert.equal(calls, 0)
  assert.deepEqual(flow.getSnapshot().members.items, [])
})

test('Owner role alone does not authorize budget read/update without exact current grants', async () => {
  const store = mockStoreContext()
  store.membership.effective_permissions = []
  let calls = 0
  const { flow } = ownerFlow({ planningContext: async () => { calls++; throw new Error('must not request') } }, store)
  await flow.loadBudget(); await flow.saveBudget('0')
  assert.equal(flow.canReadBudget, false)
  assert.equal(flow.canUpdateBudget, false)
  assert.equal(calls, 0)
})

test('Staff with all exact budget grants may update budget independently of Owner-only roster', async () => {
  const store = mockStoreContext(MOCK_STORE_IDS.second)
  store.membership.effective_permissions = ['planning.context.read', 'budget.read', 'budget.update', 'procurement.cost.read']
  const { flow } = ownerFlow({}, store)
  assert.equal(flow.canManage, false)
  assert.equal(flow.canUpdateBudget, true)
  await flow.loadBudget(); await flow.saveBudget('0')
  assert.equal(flow.getSnapshot().context.budget_ceiling.amount, '0')
  assert.equal(flow.getSnapshot().uncertain, false)
})

test('known budget cap accepts exact zero and preserves original CAS without changing requirements', async () => {
  const mock = createMockStoreWorkspaceDataSource()
  const observed = []
  const { flow } = ownerFlow({ updateBudget: async (storeId, intent, signal) => {
    observed.push(clone(intent)); return mock.updateBudget(storeId, intent, signal)
  }, planningContext: mock.planningContext })
  await flow.loadBudget()
  const requirements = clone(flow.getSnapshot().context.default_requirements)
  await flow.saveBudget('0')
  assert.equal(observed.length, 1)
  assert.equal(observed[0].request.amount, '0')
  assert.deepEqual(observed[0].condition, { kind: 'replace', version: 'synthetic-cap/1' })
  assert.equal(flow.getSnapshot().context.budget_ceiling.amount, '0')
  assert.deepEqual(flow.getSnapshot().context.default_requirements, requirements)
})

test('unknown/null budget ceiling blocks create-only mutation instead of guessing absence', async () => {
  let writes = 0
  const { flow } = ownerFlow({ planningContext: async () => envelope(planningContextFixture({ budget_ceiling: null })),
    updateBudget: async () => { writes++; throw new Error('must not write') } })
  await flow.loadBudget(); await flow.saveBudget('100')
  assert.equal(writes, 0)
  assert.match(flow.getSnapshot().error, /Chưa xác minh/)
  assert.equal(flow.getSnapshot().uncertain, false)
})

test('money input keeps up to 18 fractional digits without Number coercion; invalid input never writes', async () => {
  const mock = createMockStoreWorkspaceDataSource()
  const writes = []
  const { flow } = ownerFlow({ updateBudget: async (storeId, intent, signal) => {
    writes.push(clone(intent)); return mock.updateBudget(storeId, intent, signal)
  }, planningContext: mock.planningContext })
  await flow.loadBudget()
  for (const invalid of ['', '-1', '1e3', '1,000', '1.1234567890123456789']) await flow.saveBudget(invalid)
  assert.equal(writes.length, 0)
  await flow.saveBudget('999999999999999999.123456789012345678')
  assert.equal(writes[0].request.amount, '999999999999999999.123456789012345678')
})

test('permission lost ACK preserves stable key, original CAS and defensive-cloned body on explicit retry', async () => {
  const attempts = []
  const { flow } = ownerFlow({ replacePermissions: async (_store, _member, intent) => {
    attempts.push(clone(intent))
    if (attempts.length === 1) throw lost()
    return permissionReceipt(intent.request)
  } })
  await flow.loadMembers()
  const request = grantsRequest()
  await flow.savePermissions(ids.staff, request)
  assert.equal(flow.getSnapshot().uncertain, true)
  assert.equal(flow.canLeave(), false)
  request.grants.push('inventory.read'); request.reason = 'caller changed after send'
  await flow.savePermissions(ids.staff, { grants: [], reason: 'new intent must be blocked' })
  assert.equal(attempts.length, 1)
  await flow.retry()
  assert.deepEqual(attempts[1], attempts[0])
  assert.equal(attempts[1].version, 'synthetic-staff/1')
  assert.equal(flow.getSnapshot().uncertain, false)
  assert.equal(flow.canLeave(), true)
})

test('later definitive denial cannot erase earlier lost-ACK uncertainty or replace original intent', async () => {
  const attempts = []
  const { flow } = ownerFlow({ replacePermissions: async (_store, _member, intent) => {
    attempts.push(clone(intent)); throw attempts.length === 1 ? lost() : denial()
  } })
  await flow.loadMembers(); await flow.savePermissions(ids.staff, grantsRequest())
  await flow.retry(); await flow.retry()
  assert.equal(attempts.length, 2)
  assert.deepEqual(attempts[1], attempts[0])
  assert.equal(flow.getSnapshot().uncertain, true)
  assert.equal(flow.canLeave(), false)
  assert.equal(flow.getSnapshot().authorizationInvalidated, true)
  assert.equal(flow.canManage, false)
})

test('budget lost ACK retries exact amount/key/original budget version, without refetching a new CAS', async () => {
  const attempts = []
  const mock = createMockStoreWorkspaceDataSource()
  const { flow } = ownerFlow({ updateBudget: async (storeId, intent, signal) => {
    attempts.push(clone(intent)); const result = await mock.updateBudget(storeId, intent, signal)
    if (attempts.length === 1) throw lost()
    return result
  }, planningContext: mock.planningContext })
  await flow.loadBudget(); await flow.saveBudget('0'); await flow.retry()
  assert.deepEqual(attempts[1], attempts[0])
  assert.deepEqual(attempts[1].condition, { kind: 'replace', version: 'synthetic-cap/1' })
  assert.equal(flow.getSnapshot().context.budget_ceiling.amount, '0')
})

test('known permission receipt plus failed follow-up GET never replays the mutation', async () => {
  let reads = 0, writes = 0
  const { flow } = ownerFlow({ memberships: async () => {
    if (++reads > 1) throw new HttpError('transport', 'GET temporarily unavailable')
    return storeWorkspaceMembershipsFixture()
  }, replacePermissions: async (_store, _id, intent) => { writes++; return permissionReceipt(intent.request) } })
  await flow.loadMembers(); await flow.savePermissions(ids.staff, grantsRequest())
  assert.equal(flow.getSnapshot().uncertain, false)
  assert.match(flow.getSnapshot().notice, /Đã cập nhật/)
  assert.match(flow.getSnapshot().members.error, /GET/)
  await flow.retry()
  assert.equal(writes, 1)
  assert.equal(reads, 2)
})

test('known budget receipt plus failed C01 reread stays a read failure and cannot replay N4', async () => {
  let reads = 0, writes = 0
  const { flow } = ownerFlow({ planningContext: async () => {
    if (++reads > 1) throw lost()
    return envelope(planningContextFixture())
  }, updateBudget: async (_store, intent) => {
    writes++; return envelope({ store_id: ids.store, budget_ceiling: storeWorkspaceBudgetFixture({ amount: intent.request.amount, version: 'new-cap' }) })
  } })
  await flow.loadBudget(); await flow.saveBudget('0'); await flow.retry()
  assert.equal(writes, 1)
  assert.equal(flow.getSnapshot().uncertain, false)
  assert.equal(flow.getSnapshot().context, null)
  assert.match(flow.getSnapshot().contextError, /Mất phản hồi/)
})

test('definitive CAS conflict invalidates draft revision, rereads, and requires a new explicit intent', async () => {
  let reads = 0
  const writes = []
  const { flow } = ownerFlow({ memberships: async () => {
    reads++; const value = storeWorkspaceMembershipsFixture()
    if (reads > 1) value.data.items[0].version = 'current-member/9'
    return value
  }, replacePermissions: async (_store, _member, intent) => {
    writes.push(clone(intent)); if (writes.length === 1) throw conflict()
    return permissionReceipt(intent.request)
  } })
  await flow.loadMembers()
  const revision = flow.getSnapshot().revision
  await flow.savePermissions(ids.staff, grantsRequest())
  assert.equal(flow.getSnapshot().uncertain, false)
  assert.ok(flow.getSnapshot().revision > revision)
  assert.equal(flow.getSnapshot().members.items[0].version, 'current-member/9')
  assert.match(flow.getSnapshot().error, /Không tự gửi lại/)
  await flow.retry()
  assert.equal(writes.length, 1)
  await flow.savePermissions(ids.staff, grantsRequest())
  assert.equal(writes.length, 2)
  assert.notEqual(writes[0].key, writes[1].key)
  assert.equal(writes[1].version, 'current-member/9')
})

test('budget CAS conflict rereads current ceiling without silently resubmitting against new version', async () => {
  let reads = 0
  const sent = []
  const { flow } = ownerFlow({ planningContext: async () => envelope(planningContextFixture({ budget_ceiling:
    storeWorkspaceBudgetFixture({ version: ++reads === 1 ? 'old-cap' : 'current-cap', amount: reads === 1 ? '1000' : '2000' }) })),
  updateBudget: async (_store, intent) => { sent.push(clone(intent)); throw conflict() } })
  await flow.loadBudget(); await flow.saveBudget('0')
  assert.equal(sent.length, 1)
  assert.equal(sent[0].condition.version, 'old-cap')
  assert.equal(flow.getSnapshot().context.budget_ceiling.version, 'current-cap')
  assert.equal(flow.getSnapshot().uncertain, false)
  await flow.retry()
  assert.equal(sent.length, 1)
  await flow.saveBudget('0')
  assert.equal(sent.length, 2)
  assert.notEqual(sent[1].key, sent[0].key)
  assert.equal(sent[1].condition.version, 'current-cap')
})

test('no-op permission receipt remains successful without claiming a permission event was created', async () => {
  const { flow } = ownerFlow({ replacePermissions: async (_store, _id, intent) => envelope({
    membership: storeWorkspaceStaffFixture({ grants: clone(intent.request.grants) }), changed: false, event_id: null,
  }) })
  await flow.loadMembers(); await flow.savePermissions(ids.staff, grantsRequest())
  assert.match(flow.getSnapshot().notice, /không thay đổi.*không tạo sự kiện/i)
  assert.equal(flow.getSnapshot().uncertain, false)
})

test('inactive membership cannot be edited or submitted despite being in roster', async () => {
  let writes = 0
  const { flow } = ownerFlow({ replacePermissions: async () => { writes++; throw new Error('must not write') } })
  await flow.loadMembers()
  await flow.savePermissions(ids.inactiveStaff, grantsRequest())
  assert.equal(writes, 0)
})

test('unknown grant fails before write; full replacement permits explicit empty grants', async () => {
  let writes = 0, sent
  const { flow } = ownerFlow({ replacePermissions: async (_store, _id, intent) => {
    writes++; sent = clone(intent); return permissionReceipt(intent.request)
  } })
  await flow.loadMembers()
  await flow.savePermissions(ids.staff, { grants: ['unknown.future'], reason: 'Unknown needs review' })
  assert.equal(writes, 0)
  await flow.savePermissions(ids.staff, { grants: [], reason: 'Xóa toàn bộ quyền Staff' })
  assert.equal(writes, 1)
  assert.deepEqual(sent.request.grants, [])
})

test('dispose aborts pending read and ignores late data; controller can be used after Strict replay', async () => {
  const response = deferred()
  let signal, calls = 0
  const { flow } = ownerFlow({ memberships: async (_store, _query, nextSignal) => {
    signal = nextSignal; return ++calls === 1 ? response.promise : storeWorkspaceMembershipsFixture()
  } })
  const pending = flow.loadMembers()
  assert.equal(flow.getSnapshot().members.busy, true)
  flow.dispose()
  assert.equal(signal.aborted, true)
  response.resolve(storeWorkspaceMembershipsFixture()); await pending
  assert.deepEqual(flow.getSnapshot().members.items, [])
  assert.equal(flow.getSnapshot().members.busy, false)
  await flow.loadMembers()
  assert.equal(flow.getSnapshot().members.loaded, true)
})

test('dispose while writing ignores a late receipt and never begins its follow-up GET', async () => {
  const receipt = deferred()
  let reads = 0, signal
  const { flow } = ownerFlow({ memberships: async () => { reads++; return storeWorkspaceMembershipsFixture() },
    replacePermissions: async (_store, _id, _intent, nextSignal) => { signal = nextSignal; return receipt.promise } })
  await flow.loadMembers()
  const pending = flow.savePermissions(ids.staff, grantsRequest())
  assert.equal(flow.canLeave(), false)
  flow.dispose()
  receipt.resolve(permissionReceipt(grantsRequest())); await pending
  assert.equal(signal.aborted, true)
  assert.equal(reads, 1)
  assert.equal(flow.getSnapshot().notice, null)
  assert.equal(flow.getSnapshot().busy, false)
  assert.equal(flow.canLeave(), true)
})

test('superseded member read cannot overwrite the newest request response', async () => {
  const first = deferred()
  let calls = 0, firstSignal
  const { flow } = ownerFlow({ memberships: async (_store, _query, signal) => {
    if (++calls === 1) { firstSignal = signal; return first.promise }
    return memberPage([storeWorkspaceStaffFixture({ version: 'latest-member' })], null, 1)
  } })
  const original = flow.loadMembers(); await flow.loadMembers()
  first.resolve(storeWorkspaceMembershipsFixture()); await original
  assert.equal(firstSignal.aborted, true)
  assert.equal(flow.getSnapshot().members.items[0].version, 'latest-member')
})

test('C01 Store/currency/timezone mismatch clears context and blocks budget write', async () => {
  let writes = 0
  const { flow } = ownerFlow({ planningContext: async () => envelope(planningContextFixture({ currency: 'USD' })),
    updateBudget: async () => { writes++; throw new Error('must not write') } })
  await flow.loadBudget(); await flow.saveBudget('0')
  assert.equal(flow.getSnapshot().context, null)
  assert.match(flow.getSnapshot().contextError, /không khớp/)
  assert.equal(writes, 0)
})

test('valid member pagination preserves server catalogue and exact total', async () => {
  const calls = []
  const a = storeWorkspaceStaffFixture(), b = storeWorkspaceStaffFixture({ membership_id: ids.inactiveStaff, active: false })
  const { flow } = ownerFlow({ memberships: async (_store, query) => {
    calls.push(query); return query.cursor ? memberPage([b], null, 2) : memberPage([a], 'next', 2)
  } })
  await flow.loadMembers(); await flow.loadMembers(true)
  assert.deepEqual(calls, [{}, { cursor: 'next' }])
  assert.equal(flow.getSnapshot().members.items.length, 2)
  assert.equal(flow.getSnapshot().members.total, 2)
  assert.equal(flow.getSnapshot().members.cursor, null)
})

for (const [name, transform] of [
  ['duplicate membership', (value, first) => { value.data.items = clone(first.data.items) }],
  ['changed catalogue', (value) => { value.data.permission_catalog[0].label_vi = 'Changed current label' }],
  ['changed exact total', (value) => { value.meta.pagination.total_count = 3 }],
  ['stalled cursor', (value) => { value.meta.pagination.next_cursor = 'next' }],
]) test(`member pagination rejects ${name}, clears stale catalogue/rows and increments draft revision`, async () => {
  const first = memberPage([storeWorkspaceStaffFixture()], 'next', 2)
  const next = memberPage([storeWorkspaceStaffFixture({ membership_id: ids.inactiveStaff })], null, 2)
  transform(next, first)
  const { flow } = ownerFlow({ memberships: async (_store, query) => clone(query.cursor ? next : first) })
  await flow.loadMembers(); const revision = flow.getSnapshot().revision
  await flow.loadMembers(true)
  assert.match(flow.getSnapshot().members.error, /Danh sách/)
  assert.deepEqual(flow.getSnapshot().members.items, [])
  assert.deepEqual(flow.getSnapshot().catalog, [])
  assert.ok(flow.getSnapshot().revision > revision)
})

test('invitation creation only confirms pending invitation/delivery, never a new member', async () => {
  const { flow } = ownerFlow()
  await flow.loadMembers()
  const before = clone(flow.getSnapshot().members.items)
  await flow.invite(inviteRequest())
  assert.match(flow.getSnapshot().notice, /Chưa.*(?:membership|thành viên)/)
  assert.deepEqual(flow.getSnapshot().members.items, before)
  assert.equal(flow.getSnapshot().invitations.items[0].target_email, 'new-staff@example.invalid')
  assert.equal(flow.getSnapshot().invitations.items[0].status, 'pending')
})

test('accepted invitation is terminal; expired cannot revoke but may explicitly reissue', async () => {
  const accepted = storeWorkspaceInvitationFixture({ status: 'accepted', accepted_at: '2026-10-11T02:00:00Z' })
  const expired = storeWorkspaceInvitationFixture({ invitation_id: ids.event, status: 'expired' })
  let writes = 0
  const { flow } = ownerFlow({ invitations: async () => invitationPage([accepted, expired], null, 2),
    invitationAction: async (_store, _id, intent) => { writes++; return envelope({
      invitation: { ...expired, status: 'pending', offered_grants: intent.request.grants },
      delivery: { status: 'queued', attempt_id: ids.attempt }, event_id: ids.event,
    }) } })
  await flow.loadMembers(); await flow.loadInvitations()
  await flow.actOnInvitation(accepted.invitation_id, { action: 'revoke', reason: 'Must not revoke accepted' })
  await flow.actOnInvitation(expired.invitation_id, { action: 'revoke', reason: 'Must not revoke expired' })
  assert.equal(writes, 0)
  await flow.actOnInvitation(expired.invitation_id, { action: 'reissue', grants: ['menu.read'], permission_catalog_version: 'permissions-v2', reason: 'Gửi lại lời mời hết hạn' })
  assert.equal(writes, 1)
})

test('duplicate invitation pagination clears old rows instead of merging duplicates', async () => {
  const item = storeWorkspaceInvitationFixture()
  const { flow } = ownerFlow({ invitations: async (_store, query) => invitationPage([item], query.cursor ? null : 'next', 2) })
  await flow.loadInvitations(); await flow.loadInvitations(true)
  assert.deepEqual(flow.getSnapshot().invitations.items, [])
  assert.match(flow.getSnapshot().invitations.error, /Danh sách/)
})

test('lost invitation-create ACK replays one original intent and does not send a second independent invitation', async () => {
  const mock = createMockStoreWorkspaceDataSource()
  const sent = []
  const { flow } = ownerFlow({ createInvitation: async (storeId, intent, signal) => {
    sent.push(clone(intent)); const result = await mock.createInvitation(storeId, intent, signal)
    if (sent.length === 1) throw lost()
    return result
  }, invitations: mock.invitations })
  await flow.loadMembers(); await flow.invite(inviteRequest()); await flow.retry()
  assert.deepEqual(sent[1], sent[0])
  assert.equal(flow.getSnapshot().invitations.items.filter((item) => item.target_email === 'new-staff@example.invalid').length, 1)
})

test('member pagination rejects a longer cursor cycle even without duplicate IDs or known total', async () => {
  let calls = 0
  const { flow } = ownerFlow({ memberships: async () => {
    calls++
    return memberPage([storeWorkspaceStaffFixture({ membership_id: `d1000000-0000-4000-8000-${String(calls).padStart(12, '0')}` })],
      calls === 1 ? 'page-a' : calls === 2 ? 'page-b' : 'page-a')
  } })
  await flow.loadMembers(); await flow.loadMembers(true); await flow.loadMembers(true)
  assert.match(flow.getSnapshot().members.error, /cursor/)
  assert.deepEqual(flow.getSnapshot().members.items, [])
})

test('invitation pagination rejects a longer cursor cycle, not just immediate repetition', async () => {
  let calls = 0
  const { flow } = ownerFlow({ invitations: async () => {
    calls++
    return invitationPage([storeWorkspaceInvitationFixture({ invitation_id: `d1000000-0000-4000-8000-${String(calls).padStart(12, '0')}` })],
      calls === 1 ? 'page-a' : calls === 2 ? 'page-b' : 'page-a')
  } })
  await flow.loadInvitations(); await flow.loadInvitations(true); await flow.loadInvitations(true)
  assert.match(flow.getSnapshot().invitations.error, /cursor/)
  assert.deepEqual(flow.getSnapshot().invitations.items, [])
})

for (const status of [403, 404]) test(`definitive ${status} mutation rejection invalidates sensitive caches and blocks cached authority until T02 refresh`, async () => {
  let writes = 0
  const { flow } = ownerFlow({ replacePermissions: async () => { writes++; throw denial(status) } })
  await flow.loadMembers(); await flow.loadInvitations(); await flow.loadBudget()
  assert.ok(flow.getSnapshot().members.items.length)
  assert.ok(flow.getSnapshot().context)
  await flow.savePermissions(ids.staff, grantsRequest())
  assert.equal(flow.getSnapshot().authorizationInvalidated, true)
  assert.equal(flow.canManage, false)
  assert.equal(flow.canReadBudget, false)
  assert.equal(flow.canUpdateBudget, false)
  assert.deepEqual(flow.getSnapshot().members.items, [])
  assert.deepEqual(flow.getSnapshot().invitations.items, [])
  assert.deepEqual(flow.getSnapshot().catalog, [])
  assert.equal(flow.getSnapshot().context, null)
  assert.equal(flow.getSnapshot().uncertain, false)
  await flow.savePermissions(ids.staff, grantsRequest())
  assert.equal(writes, 1)
})

test('403 from a workspace read clears previously loaded unrelated sensitive resources', async () => {
  const { flow } = ownerFlow({ invitations: async () => { throw denial() } })
  await flow.loadMembers(); await flow.loadBudget()
  await flow.loadInvitations()
  assert.equal(flow.getSnapshot().authorizationInvalidated, true)
  assert.deepEqual(flow.getSnapshot().members.items, [])
  assert.equal(flow.getSnapshot().context, null)
  assert.equal(flow.canManage, false)
})

test('late successful read cannot restore caches after a concurrent authorization rejection', async () => {
  const budget = deferred()
  let budgetSignal
  const { flow } = ownerFlow({ planningContext: async (_store, signal) => { budgetSignal = signal; return budget.promise },
    invitations: async () => { throw denial() } })
  const pending = flow.loadBudget()
  await flow.loadInvitations()
  budget.resolve(envelope(planningContextFixture())); await pending
  assert.equal(budgetSignal.aborted, true)
  assert.equal(flow.getSnapshot().authorizationInvalidated, true)
  assert.equal(flow.getSnapshot().context, null)
})

test('N17 receipt for a different target email stays uncertain and cannot silently retarget the action', async () => {
  const sent = []
  const item = storeWorkspaceInvitationFixture()
  const { flow } = ownerFlow({ invitations: async () => invitationPage([item], null, 1),
    invitationAction: async (_store, _id, intent) => {
      sent.push(clone(intent))
      return envelope({ invitation: { ...item, target_email: 'different-person@example.invalid', status: 'revoked', revoked_at: '2026-10-11T02:00:00Z' }, delivery: null, event_id: ids.event })
    } })
  await flow.loadMembers(); await flow.loadInvitations()
  await flow.actOnInvitation(item.invitation_id, { action: 'revoke', reason: 'Thu hồi đúng người nhận đã xem' })
  assert.equal(flow.getSnapshot().uncertain, true)
  assert.equal(flow.getSnapshot().notice, null)
  assert.equal(flow.canLeave(), false)
  await flow.retry()
  assert.equal(sent.length, 2)
  assert.deepEqual(sent[1], sent[0])
})
