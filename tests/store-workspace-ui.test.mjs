import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StoreOverview, StoreMembers, MemberPermissionDrawer, StaffInviteDrawer, InvitationActionDrawer, StoreOperatingDefaults, StoreNoAccess,
  StoreWorkspaceTabs, StoreWorkspaceHeader, StorePermissionFields } from '../src/features/store-workspace/components'
import { canonicalStoreEmail, formatStoreBudget, isKnownStorePermission, missingStorePrerequisites, parseStoreBudget, sameStoreGrants,
  sortedStoreGrants, storeDeliveryStatus, storeDialogFocusIndex, storeInvitationStatus, storePermissionLabel, validStoreReason } from '../src/features/store-workspace/storeWorkspace.format'
import { planningContextFixture, PLANNING_FIXTURE_IDS } from '../src/features/decision-planning/planning.fixtures'

const noop = () => {}
const render = (component, props = {}) => renderToStaticMarkup(createElement(component, props))
const at = '2026-10-11T01:00:00Z'
const store = { store_id: PLANNING_FIXTURE_IDS.store, name: 'Quán QA — Store A', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', role: 'OWNER',
  membership_id: 'd1000000-0000-4000-8000-000000000001', authorization_version: 'auth/1', active: true, server_now: at, as_of_date: '2026-10-11',
  membership: { membership_id: 'd1000000-0000-4000-8000-000000000001', role: 'OWNER', authorization_version: 'auth/1', effective_permissions: ['menu.read'] }, permission_catalog_version: 'permissions-v2' }
const member = { membership_id: 'd1000000-0000-4000-8000-000000000002', user: { user_id: 'd1000000-0000-4000-8000-000000000003', display_name: 'Nhân viên QA', email: 'staff@example.com' },
  role: 'STAFF', active: true, grants: ['menu.read'], version: 'membership/1', updated_at: at }
const catalog = [
  { key: 'menu.read', group: 'catalog', label_vi: 'Server Menu label', description_vi: 'Xem Menu và giá bán.', grantable_to_staff: true, required_with: [], exposure: 'ordinary' },
  { key: 'planning.run', group: 'planning', label_vi: 'Server run label', description_vi: 'Chạy kế hoạch.', grantable_to_staff: true, required_with: ['planning.context.read', 'procurement.cost.read'], exposure: 'cost' },
]
const invitation = { invitation_id: 'd1000000-0000-4000-8000-000000000004', store_id: store.store_id, target_email: 'invited@example.com', role: 'STAFF', offered_grants: ['menu.read'], permission_catalog_version: 'permissions-v2',
  version: 'invite/1', status: 'pending', issuer_user_id: 'd1000000-0000-4000-8000-000000000005', created_at: at, issued_at: at, expires_at: '2026-10-18T01:00:00Z', accepted_at: null, revoked_at: null,
  reason: 'Mời nhân viên QA', delivery_status: 'queued' }
const permissionProps = { member, catalog, canEdit: true, busy: false, onSave: noop, onClose: noop }
const operatingProps = { store, planningContext: planningContextFixture(), canUpdateBudget: true, busy: false, onSaveBudget: noop }

test('overview preserves MagicPath profile, hours and status cards without inventing API profile data or save', () => {
  const html = render(StoreOverview, { store })
  for (const label of ['Thông tin cửa hàng', 'Tên cửa hàng', 'Loại hình kinh doanh', 'Địa chỉ', 'Số điện thoại', 'Múi giờ', 'Đơn vị tiền tệ', 'Giờ hoạt động', 'Trạng thái', 'Lưu thay đổi']) assert.ok(html.includes(label), label)
  assert.match(html, /value="Quán QA — Store A"/)
  assert.match(html, /Asia\/Ho_Chi_Minh/)
  assert.match(html, /Chỉnh sửa thông tin cửa hàng chưa được hỗ trợ/)
  assert.match(html, /disabled=""[^>]*>Lưu thay đổi/)
  assert.doesNotMatch(html, /19-21 Nguyễn Huệ|028 1234|07:00|23:00|22:00|Café/)
  assert.equal((html.match(/Trạng thái mở cửa/g) ?? []).length, 7)
  assert.match(html, /không được suy từ dữ liệu hoặc số thành viên/)
})

test('illustrative fields exist only with explicit mockPreview and are labelled noncanonical', () => {
  const html = render(StoreOverview, { store, mockPreview: true })
  assert.match(html, /Minh họa DEV/)
  assert.match(html, /không phải thông tin đã lưu/)
  assert.match(html, /19-21 Nguyễn Huệ/)
  assert.match(html, /07:00/)
  assert.match(html, /disabled=""[^>]*>Lưu thay đổi/)
})

test('tabs preserve designed names and expose linked roving-focus tab semantics', () => {
  const html = render(StoreWorkspaceTabs, { id: 'store-ui', tab: 'members', onTab: noop })
  for (const label of ['Tổng quan', 'Thành viên &amp; quyền', 'Thiết lập vận hành']) assert.ok(html.includes(label))
  assert.match(html, /role="tablist" aria-label="Cửa hàng"/)
  assert.match(html, /id="store-ui-tab-members"[^>]*aria-selected="true"[^>]*aria-controls="store-ui-panel-members"[^>]*tabindex="0"/)
  assert.equal((html.match(/tabindex="-1"/g) ?? []).length, 2)
})

test('Store header uses only canonical current identity and restricted-state guidance', () => {
  const html = render(StoreWorkspaceHeader, { store, selector: createElement('span', null, 'Authorized selector'), restricted: true })
  assert.match(html, /Quán QA — Store A/)
  assert.match(html, /Authorized selector/)
  assert.match(html, /Quản lý thành viên chỉ dành cho Owner/)
  assert.doesNotMatch(html, /The Coffee House|Thảo Điền|Phú Mỹ Hưng/)
})

test('member names are real keyboard buttons and Staff roster is distinct from Owner self and invitations', () => {
  const html = render(StoreMembers, { members: [member], invitations: [invitation], currentIdentity: { name: 'Owner QA', email: 'owner@example.com', role: 'OWNER', grants: ['menu.read'] }, canManage: true, busy: false,
    membersTotal: null, invitationsTotal: 1, onSelectMember: noop, onSelectIdentity: noop, onSelectInvitation: noop, onInvite: noop })
  assert.match(html, /<button[^>]*type="button"[^>]*aria-label="Xem quyền của Nhân viên QA"/)
  assert.match(html, /chỉ gồm Staff, không phải toàn bộ Owner/)
  assert.match(html, /1 quyền đề nghị/)
  assert.match(html, /Đang chờ chấp nhận/)
  assert.match(html, /Đang chờ gửi email/)
  assert.match(html, /Tổng chưa biết/)
  assert.match(html, /Chưa suy ra tên tài khoản/)
  assert.match(html, /role="region" aria-label="Danh sách Staff, có thể cuộn ngang"/)
  assert.match(html, /<th scope="col">/)
  assert.doesNotMatch(html, /Toàn quyền|Đã cấp quyền|Đã gửi lời mời thành công/)
})

test('restricted Staff never sees cached Owner roster or invitations even if parent has old rows', () => {
  const html = render(StoreMembers, { members: [member], invitations: [invitation], currentIdentity: { name: 'Staff self', email: 'self@example.com', role: 'STAFF', grants: ['menu.read'] }, canManage: false, busy: false,
    onSelectMember: noop, onSelectInvitation: noop, onInvite: noop })
  assert.match(html, /Staff self/)
  assert.match(html, /Chỉ Owner/)
  assert.match(html, /disabled=""[^>]*>\+ Mời nhân viên/)
  assert.doesNotMatch(html, /Nhân viên QA|staff@example.com|invited@example.com|Lời mời nhân viên/)
})

test('permission drawer labels canonical grants and requires reason before save', () => {
  const html = render(MemberPermissionDrawer, permissionProps)
  assert.match(html, /<dialog[^>]*aria-modal="true"[^>]*aria-labelledby=/)
  assert.match(html, /Đóng bảng chi tiết/)
  assert.match(html, /Xem Menu/)
  assert.match(html, /Lý do thay đổi/)
  assert.match(html, /disabled=""[^>]*>Lưu quyền/)
  assert.match(html, /Bỏ chọn tất cả sẽ thu toàn bộ quyền tính năng, không xóa thành viên/)
  assert.doesNotMatch(html, /viewData|confirmImportant|Server Menu label/)
  const omittedRole = { ...member }
  delete omittedRole.role
  assert.doesNotMatch(render(MemberPermissionDrawer, { ...permissionProps, member: omittedRole }), /type="checkbox"[^>]*disabled=""/)
})

test('Owner identity drawer and inactive Staff are read-only, without ownership or activation mutation affordances', () => {
  const owner = render(MemberPermissionDrawer, { ...permissionProps, member: null, identity: { name: 'Owner QA', email: 'owner@example.com', role: 'OWNER', grants: ['menu.read'] } })
  assert.match(owner, /Quyền Owner chỉ đọc/)
  assert.match(owner, /type="checkbox"[^>]*disabled=""/)
  assert.doesNotMatch(owner, /Lưu quyền|Lý do thay đổi|Chuyển Owner/)
  const inactive = render(MemberPermissionDrawer, { ...permissionProps, member: { ...member, active: false } })
  assert.match(inactive, /không kích hoạt lại thành viên/)
  assert.match(inactive, /type="checkbox"[^>]*disabled=""/)
})

test('busy or uncertain permission intents lock the draft, and revoking edit authority never permits a new save', () => {
  for (const overrides of [{ busy: true }, { locked: true }, { canEdit: false }]) {
    const html = render(MemberPermissionDrawer, { ...permissionProps, ...overrides })
    assert.match(html, /type="checkbox"[^>]*disabled=""/)
    assert.match(html, /disabled=""[^>]*>Lưu quyền/)
  }
  assert.match(render(MemberPermissionDrawer, { ...permissionProps, busy: true }), /aria-busy="true"/)
  assert.match(render(MemberPermissionDrawer, { ...permissionProps, locked: true }), /Yêu cầu trước chưa được giải quyết/)
  const retryHtml = render(MemberPermissionDrawer, { ...permissionProps, locked: true, onRetry: noop })
  assert.match(retryHtml, /Đóng bảng không hủy yêu cầu đã gửi/)
  assert.match(retryHtml, /type="button"[^>]*>Thử lại đúng yêu cầu trước/)
  assert.match(render(MemberPermissionDrawer, { ...permissionProps, locked: true, busy: true, onRetry: noop }), /disabled=""[^>]*>Thử lại đúng yêu cầu trước/)
})

test('unknown and nondelegable grants are not mapped, not dropped, not editable, and are escaped', () => {
  const unsafe = 'future.<script>unsafe()</script>'
  const html = render(MemberPermissionDrawer, { ...permissionProps, member: { ...member, grants: ['menu.read', unsafe] }, catalog: [...catalog, { ...catalog[0], key: unsafe, label_vi: 'Fake known action' }] })
  assert.match(html, /Quyền chưa có nhãn được xác nhận/)
  assert.match(html, /future\.&lt;script&gt;unsafe\(\)&lt;\/script&gt;/)
  assert.match(html, /Chưa thể lưu tập quyền thay thế/)
  assert.doesNotMatch(html, /<script>|Fake known action/)
  assert.equal(isKnownStorePermission(unsafe), false)
  assert.notEqual(storePermissionLabel(unsafe), storePermissionLabel('menu.read'))
  const nondelegable = render(StorePermissionFields, { catalog: [{ ...catalog[0], grantable_to_staff: false }], grants: ['menu.read'], disabled: false, onChange: noop })
  assert.match(nondelegable, /type="checkbox"[^>]*disabled=""[^>]*checked=""/)
})

test('required_with produces guidance only, never adds permissions or uses prototype groups as grant keys', () => {
  const selected = ['planning.run']
  const html = render(StorePermissionFields, { catalog, grants: selected, disabled: false, onChange: noop })
  assert.match(html, /Không tự thêm quyền/)
  assert.deepEqual(selected, ['planning.run'])
  assert.deepEqual(missingStorePrerequisites(selected, catalog), ['planning.context.read', 'procurement.cost.read'])
  assert.deepEqual(sortedStoreGrants(['menu.read', 'inventory.read', 'menu.read']), ['inventory.read', 'menu.read'])
  assert.equal(sameStoreGrants(['menu.read', 'inventory.read'], ['inventory.read', 'menu.read']), true)
})

test('invitation form fixes Staff role, no preselected grants and no token or account-existence disclosure', () => {
  const html = render(StaffInviteDrawer, { catalog, catalogVersion: 'permissions-v2', canInvite: true, busy: false, onSend: noop, onClose: noop })
  for (const label of ['Mời nhân viên', 'Email', 'Vai trò', 'Quyền ban đầu', 'Lý do mời', 'Gửi lời mời']) assert.ok(html.includes(label), label)
  assert.match(html, /<select[^>]*disabled=""[^>]*><option value="STAFF" selected="">Staff/)
  assert.doesNotMatch(html, /type="checkbox"[^>]*checked=""|value="OWNER"|account_exists|invitation.token|localStorage/)
  assert.match(html, /disabled=""[^>]*>Gửi lời mời/)
  assert.match(html, /Có thể không chọn quyền nào/)
})

test('invitation receipt reports canonical delivery status rather than fake membership success', () => {
  const html = render(StaffInviteDrawer, { catalog, catalogVersion: 'permissions-v2', canInvite: true, busy: false, sent: invitation, onSend: noop, onClose: noop })
  assert.match(html, /Đã tạo lời mời/)
  assert.match(html, /Đang chờ gửi email/)
  assert.match(html, /Gửi email chưa có nghĩa đã cấp quyền/)
  assert.doesNotMatch(html, /Đã gửi lời mời|Gửi lời mời<|Đã thêm thành viên/)
})

test('accepted invitation is terminal and offered grants never substitute current membership grants', () => {
  const props = { invitation: { ...invitation, status: 'accepted', accepted_at: at }, catalog, catalogVersion: 'permissions-v2', canManage: true, busy: false, onAction: noop, onClose: noop }
  const html = render(InvitationActionDrawer, props)
  assert.match(html, /Đã chấp nhận/)
  assert.match(html, /không thể gửi lại hoặc thu hồi/)
  assert.match(html, /không dùng quyền đề nghị cũ làm quyền hiện hành/)
  assert.doesNotMatch(html, /type="submit"|Lý do<textarea/)
  assert.match(html, /type="checkbox"[^>]*disabled=""/)
  const pending = render(InvitationActionDrawer, { ...props, invitation })
  assert.match(pending, /Thu hồi lời mời/)
  assert.match(pending, /vô hiệu liên kết cũ/)
})

test('operating defaults preserve design cards but budget writer is only canonical ceiling', () => {
  const html = render(StoreOperatingDefaults, operatingProps)
  for (const label of ['Thiết lập chung', 'Ngày bắt đầu tuần', 'Ngôn ngữ hiển thị', 'Mặc định lập kế hoạch', 'Tính đơn hàng đang chờ', 'Ưu tiên mặc định', 'Lịch nhận hàng', 'Ngân sách mặc định']) assert.ok(html.includes(label), label)
  assert.match(html, /Trần ngân sách cửa hàng/)
  assert.match(html, /Kế thừa trần cửa hàng/)
  assert.match(html, /Lưu chỉ thay trần ngân sách/)
  assert.match(html, /value="1000000"/)
  assert.match(html, /disabled=""[^>]*>Lưu ngân sách/)
  assert.doesNotMatch(html, /value="3"|value="5"|aria-pressed="true"|Đã lưu thiết lập|50\.000\.000/)
  assert.match(html, /không chọn Cân bằng giả/)
  assert.match(html, /Không dùng lịch giao của từng nhà cung cấp thay thế/)
})

test('budget unavailable and true zero remain distinct; no rights, loading or uncertain intent locks editing', () => {
  const unknown = render(StoreOperatingDefaults, { ...operatingProps, planningContext: null, canUpdateBudget: false })
  assert.match(unknown, /Chưa được thiết lập/)
  assert.match(unknown, /Chưa đọc được/)
  assert.match(unknown, /không có nghĩa không giới hạn/)
  assert.match(unknown, /disabled=""[^>]*value=""/)
  const context = planningContextFixture({ budget_ceiling: { amount: '0', currency: 'VND', version: 'zero/1', updated_at: at } })
  assert.match(render(StoreOperatingDefaults, { ...operatingProps, planningContext: context }), /Trần hiện hành: 0 VND/)
  const ambiguousAbsence = render(StoreOperatingDefaults, { ...operatingProps, planningContext: planningContextFixture({ budget_ceiling: null }) })
  assert.match(ambiguousAbsence, /Chưa xác minh được trần ngân sách hiện hành/)
  assert.match(ambiguousAbsence, /input[^>]*disabled=""[^>]*value=""/)
  for (const overrides of [{ canUpdateBudget: false }, { loading: true }, { busy: true }, { locked: true }]) {
    const html = render(StoreOperatingDefaults, { ...operatingProps, ...overrides })
    assert.match(html, /input[^>]*disabled=""[^>]*value="1000000"/)
  }
})

test('exact budget formatting and parsing never coerce large monetary values to Number', () => {
  assert.equal(parseStoreBudget('0'), '0')
  assert.equal(parseStoreBudget('50,000,000'), '50000000')
  assert.equal(parseStoreBudget('9007199254740993.000000000000000001'), '9007199254740993.000000000000000001')
  for (const invalid of ['', '1e7', '-1', '1000000000000000000', '0.0000000000000000001']) assert.equal(parseStoreBudget(invalid), null)
  assert.equal(formatStoreBudget('9007199254740993.000000000000000001', 'VND'), '9.007.199.254.740.993,000000000000000001 VND')
  assert.equal(formatStoreBudget(null, 'VND'), 'Chưa được thiết lập')
})

test('email normalization and reason Unicode bounds preserve canonical write intent', () => {
  assert.equal(canonicalStoreEmail('  QA.Owner@Example.com  '), 'qa.owner@example.com')
  for (const email of ['', 'no-at', 'a b@example.com', 'a@localhost', `${'x'.repeat(321)}@example.com`]) assert.equal(canonicalStoreEmail(email), null)
  assert.equal(validStoreReason('   '), false)
  assert.equal(validStoreReason('🧋'.repeat(1000)), true)
  assert.equal(validStoreReason('🧋'.repeat(1001)), false)
  assert.equal(storeInvitationStatus('expired'), 'Đã hết hạn')
  assert.equal(storeDeliveryStatus('failed'), 'Gửi email thất bại')
})

test('dialog focus trap index wraps only at boundaries and no-Store state never creates fake Store', () => {
  assert.equal(storeDialogFocusIndex(0, 3, true), 2)
  assert.equal(storeDialogFocusIndex(2, 3, false), 0)
  assert.equal(storeDialogFocusIndex(-1, 3, false), 0)
  assert.equal(storeDialogFocusIndex(1, 3, false), null)
  assert.equal(storeDialogFocusIndex(0, 0, false), null)
  const html = render(StoreNoAccess)
  assert.match(html, /Bạn chưa có cửa hàng/)
  assert.match(html, /Liên hệ Owner hoặc hỗ trợ ShelfCash/)
  assert.doesNotMatch(html, /STORE_001|Tạo cửa hàng|The Coffee House/)
})

test('static responsive contracts include desktop density, narrow drawers and scroll-contained tables, not browser QA', () => {
  const css = readFileSync('src/features/store-workspace/components/StoreWorkspace.css', 'utf8')
  assert.match(css, /max-width:1180px/)
  assert.match(css, /width:440px; max-width:100vw/)
  assert.match(css, /@media\(max-width:850px\)/)
  assert.match(css, /@media\(max-width:620px\)/)
  assert.match(css, /@media\(max-width:480px\)/)
  assert.match(css, /\.sc-store-table-scroll \{ overflow-x:auto/)
  assert.match(css, /\.sc-store-hours-times \{ grid-column:1\/-1/)
})
