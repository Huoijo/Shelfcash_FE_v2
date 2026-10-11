import { HttpError } from '../../shared/http/httpClient'
import { comparePlanningDecimal } from '../decision-planning/planning.validation'
import { planningContextFixture } from '../decision-planning/planning.fixtures'
import type {
  Invitation, MembershipsResponse, PermissionDescriptor, StaffMembership, StoreBudget,
  StoreWorkspaceDataSource,
} from './storeWorkspace.types'
import {
  validateWorkspaceBudgetRequest, validateWorkspaceGrants, validateWorkspaceInvitationAction,
  validateWorkspaceInvitationCreate, validateWorkspaceKey, workspaceIfMatch,
} from './storeWorkspace.validation'

/** Synthetic DEV/QA only: memory mutations are not BE persistence or email delivery. */
export const STORE_WORKSPACE_FIXTURE_IDS = {
  store: 'f17e0000-0000-4000-8000-000000000000',
  secondStore: 'f17e0000-0000-4000-8000-000000000002',
  staff: 'd1000000-0000-4000-8000-000000000001',
  inactiveStaff: 'd1000000-0000-4000-8000-000000000002',
  user: 'd1000000-0000-4000-8000-000000000003',
  inactiveUser: 'd1000000-0000-4000-8000-000000000004',
  invitation: 'd1000000-0000-4000-8000-000000000005',
  issuer: 'd1000000-0000-4000-8000-000000000006',
  event: 'd1000000-0000-4000-8000-000000000007',
  attempt: 'd1000000-0000-4000-8000-000000000008',
} as const
const ids = STORE_WORKSPACE_FIXTURE_IDS
const at = '2026-10-11T01:00:00Z'
const clone = <T,>(value: T): T => structuredClone(value)
const envelope = <T,>(data: T) => ({ data: clone(data), meta: { request_id: 'synthetic-store-workspace' }, error: null })

/** Catalogue key set matches permissions-v2; wording is explicitly synthetic QA copy. */
export function storeWorkspaceCatalogueFixture(): PermissionDescriptor[] {
  const groups: Record<string, string[]> = {
    'Menu': ['ingredient.read', 'ingredient.create', 'menu.read', 'product.create', 'recipe.read', 'recipe.create_version', 'recipe.manage_effectivity'],
    'Kho': ['inventory.read', 'inventory.receive', 'inventory.count.correct', 'procurement.cost.read'],
    'Bán hàng': ['sales.read', 'sales.record', 'sales.correct', 'sales.merge'],
    'Nhà cung cấp': ['supplier.read', 'supplier.create', 'supplier.terms.create', 'supplier.terms.correct', 'supplier.fees.manage'],
    'Nhập dữ liệu': ['import.create', 'import.upload', 'import.read', 'import.analyze', 'import.preview', 'import.commit', 'mapping.read', 'mapping.propose'],
    'Lập kế hoạch': ['planning.context.read', 'planning.run', 'planning.result.read', 'planning.requirements.read', 'planning.requirements.create', 'planning.requirements.manage', 'planning.export'],
    'Ngân sách': ['budget.read', 'budget.update'],
  }
  const dependencies: Record<string, string[]> = {
    'planning.context.read': ['budget.read', 'procurement.cost.read'],
    'planning.run': ['budget.read', 'procurement.cost.read'],
    'planning.result.read': ['budget.read', 'procurement.cost.read'],
    'planning.requirements.read': ['budget.read'],
    'planning.requirements.create': ['budget.read', 'planning.requirements.read'],
    'planning.requirements.manage': ['budget.read', 'planning.requirements.read'],
    'budget.update': ['budget.read'],
  }
  return Object.entries(groups).flatMap(([group, keys]) => keys.map((key): PermissionDescriptor => ({
    key, group, label_vi: `${key} · DEV/QA`, description_vi: 'Mô tả minh họa; API mode dùng catalogue Backend hiện hành.',
    grantable_to_staff: true, required_with: dependencies[key] ?? [],
    exposure: key.startsWith('budget.') ? 'budget' : key === 'procurement.cost.read' ? 'cost' : 'ordinary',
  })))
}
export function storeWorkspaceStaffFixture(overrides: Partial<StaffMembership> = {}): StaffMembership {
  return clone({ membership_id: ids.staff, user: { user_id: ids.user, email: 'staff-qa@example.invalid', display_name: 'Nhân viên · DEV/QA' },
    role: 'STAFF', active: true, grants: ['inventory.read', 'menu.read'], version: 'synthetic-staff/1', updated_at: at, ...overrides })
}
export function storeWorkspaceMembershipsFixture(): MembershipsResponse {
  return { data: { items: [storeWorkspaceStaffFixture(), storeWorkspaceStaffFixture({ membership_id: ids.inactiveStaff,
    user: { user_id: ids.inactiveUser, email: 'inactive-qa@example.invalid', display_name: 'Nhân viên ngừng hoạt động · DEV/QA' },
    active: false, grants: [], version: 'synthetic-inactive/1' })], permission_catalog_version: 'permissions-v2', permission_catalog: storeWorkspaceCatalogueFixture() },
    meta: { request_id: 'synthetic-n12', pagination: { limit: 50, next_cursor: null, total_count: 2 } }, error: null }
}
export function storeWorkspaceInvitationFixture(overrides: Partial<Invitation> = {}): Invitation {
  return clone({ invitation_id: ids.invitation, store_id: ids.store, target_email: 'invite-qa@example.invalid', role: 'STAFF',
    offered_grants: ['menu.read'], permission_catalog_version: 'permissions-v2', version: 'synthetic-invitation/1', status: 'pending',
    issuer_user_id: ids.issuer, created_at: at, issued_at: at, expires_at: '2026-10-18T01:00:00Z', accepted_at: null,
    revoked_at: null, reason: 'Lời mời minh họa DEV/QA', delivery_status: 'queued', ...overrides })
}
export function storeWorkspaceBudgetFixture(overrides: Partial<StoreBudget> = {}): StoreBudget {
  return { amount: '1000000', currency: 'VND', version: 'synthetic-cap/1', updated_at: at, ...overrides }
}

/** Never creates an account/membership, sends email, exposes a token or calls a live API. */
export function createMockStoreWorkspaceDataSource(): StoreWorkspaceDataSource {
  type RecordState = { members: StaffMembership[]; invitations: Invitation[]; cap: StoreBudget | null; revision: number }
  const stores = new Map<string, RecordState>()
  const receipts = new Map<string, { fingerprint: string; response: unknown }>()
  let serial = 20
  const uuid = () => `d1000000-0000-4000-8000-${String(serial++).padStart(12, '0')}`
  function state(storeId: string, signal?: AbortSignal): RecordState {
    signal?.throwIfAborted()
    if (storeId !== ids.store && storeId !== ids.secondStore) throw new HttpError('contract', 'Store DEV/QA không tồn tại.', 404)
    if (!stores.has(storeId)) stores.set(storeId, { members: storeWorkspaceMembershipsFixture().data.items,
      invitations: [storeWorkspaceInvitationFixture({ store_id: storeId })], cap: storeWorkspaceBudgetFixture(), revision: 1 })
    return stores.get(storeId)!
  }
  function mutation<T>(scope: string, key: string, input: unknown, action: () => T): T {
    validateWorkspaceKey(key)
    const receiptKey = `${scope}:${key}`, fingerprint = JSON.stringify(input), prior = receipts.get(receiptKey)
    if (prior) {
      if (prior.fingerprint !== fingerprint) throw new HttpError('contract', 'Idempotency-Key đã dùng cho nội dung hoặc CAS khác.', 409)
      return clone(prior.response as T)
    }
    const response = action()
    receipts.set(receiptKey, { fingerprint, response: clone(response) })
    return response
  }
  function checkCas(actual: string, expected: string): void {
    if (workspaceIfMatch(actual) !== workspaceIfMatch(expected)) throw new HttpError('contract', 'Phiên bản đã thay đổi. Đọc lại trước khi xác nhận ý định mới.', 412)
  }
  function page<T>(items: T[], query: { limit?: number; cursor?: string }, scope: string, revision: number) {
    const limit = query.limit ?? 50
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error('Kích thước trang không hợp lệ.')
    const prefix = `synthetic:${scope}:${revision}:${limit}:`
    let offset = 0
    if (query.cursor !== undefined) {
      if (!query.cursor.startsWith(prefix)) throw new HttpError('contract', 'Danh sách DEV/QA đã đổi; đọc lại trang đầu.', 409)
      offset = Number(query.cursor.slice(prefix.length))
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > items.length) throw new Error('Cursor DEV/QA không hợp lệ.')
    }
    return { data: { items: clone(items.slice(offset, offset + limit)) }, meta: { request_id: 'synthetic-list', pagination: {
      limit, next_cursor: offset + limit < items.length ? `${prefix}${offset + limit}` : null, total_count: items.length,
    } }, error: null }
  }
  return {
    async memberships(storeId, query = {}, signal) {
      const current = state(storeId, signal), filter = query.active ?? 'all'
      const response = page(current.members.filter((item) => filter === 'all' || item.active === (filter === 'true')), query, `${storeId}:members:${filter}`, current.revision)
      return { ...response, data: { ...response.data, permission_catalog_version: 'permissions-v2', permission_catalog: storeWorkspaceCatalogueFixture() } }
    },
    async replacePermissions(storeId, membershipId, intent, signal) {
      const current = state(storeId, signal)
      const request = validateWorkspaceGrants(intent.request, storeWorkspaceCatalogueFixture())
      return mutation(`${storeId}:permissions:${membershipId}`, intent.key, intent, () => {
        const member = current.members.find((item) => item.membership_id === membershipId)
        if (!member) throw new HttpError('contract', 'Không tìm thấy Staff DEV/QA.', 404)
        if (!member.active) throw new HttpError('contract', 'Membership không hoạt động; không thể thay quyền.', 409)
        checkCas(member.version, intent.version)
        const changed = JSON.stringify(member.grants) !== JSON.stringify(request.grants)
        if (changed) { member.grants = clone(request.grants); member.version = `synthetic-staff/${++current.revision}` }
        return envelope({ membership: member, changed, event_id: changed ? uuid() : null })
      })
    },
    async invitations(storeId, query = {}, signal) {
      const current = state(storeId, signal)
      const rows = current.invitations.filter((item) => (!query.statuses || query.statuses.includes(item.status)) && (!query.email || item.target_email.includes(query.email)))
      return page(rows, query, `${storeId}:invitations:${JSON.stringify([query.statuses, query.email])}`, current.revision)
    },
    async createInvitation(storeId, intent, signal) {
      const current = state(storeId, signal)
      const request = validateWorkspaceInvitationCreate(intent.request, storeWorkspaceCatalogueFixture())
      return mutation(`${storeId}:create-invitation`, intent.key, intent, () => {
        if (current.invitations.some((item) => item.target_email.toLowerCase() === request.email.toLowerCase() && item.status === 'pending')) throw new HttpError('contract', 'Đã có lời mời pending cho email này.', 409)
        const invitation = storeWorkspaceInvitationFixture({ store_id: storeId, invitation_id: uuid(), target_email: request.email.toLowerCase(),
          offered_grants: clone(request.grants), reason: request.reason })
        current.invitations.unshift(invitation); current.revision++
        return envelope({ invitation, delivery: { status: 'queued' as const, attempt_id: uuid() } })
      })
    },
    async invitationAction(storeId, invitationId, intent, signal) {
      const current = state(storeId, signal)
      const request = validateWorkspaceInvitationAction(intent.request, storeWorkspaceCatalogueFixture())
      return mutation(`${storeId}:invitation:${invitationId}:${request.action}`, intent.key, intent, () => {
        const invitation = current.invitations.find((item) => item.invitation_id === invitationId)
        if (!invitation) throw new HttpError('contract', 'Không tìm thấy lời mời DEV/QA.', 404)
        checkCas(invitation.version, intent.version)
        if (invitation.status === 'accepted') throw new HttpError('contract', 'Lời mời đã accepted là terminal; quản lý quyền qua Staff.', 409)
        if (request.action === 'revoke') {
          if (invitation.status === 'expired') throw new HttpError('contract', 'Lời mời đã hết hạn.', 409)
          const changed = invitation.status !== 'revoked'
          if (changed) Object.assign(invitation, { status: 'revoked', revoked_at: at, reason: request.reason, version: `synthetic-invitation/${++current.revision}` })
          return envelope({ invitation, delivery: null, event_id: changed ? uuid() : null })
        }
        Object.assign(invitation, { offered_grants: clone(request.grants), reason: request.reason, status: 'pending',
          revoked_at: null, delivery_status: 'queued', version: `synthetic-invitation/${++current.revision}` })
        return envelope({ invitation, delivery: { status: 'queued' as const, attempt_id: uuid() }, event_id: uuid() })
      })
    },
    async planningContext(storeId, signal) {
      const current = state(storeId, signal)
      return envelope(planningContextFixture({ store_id: storeId, budget_ceiling: clone(current.cap),
        readiness: { status: 'unknown', can_generate: false, reason_codes: ['SYNTHETIC_NO_WORKER'], evaluated_forecast_start_date: null,
          scope_estimate: null, history_watermark: null } }))
    },
    async updateBudget(storeId, intent, signal) {
      const current = state(storeId, signal), request = validateWorkspaceBudgetRequest(intent.request)
      return mutation(`${storeId}:budget`, intent.key, intent, () => {
        if (intent.condition.kind === 'create') {
          if (current.cap !== null) throw new HttpError('contract', 'Trần đã tồn tại; create-only không overwrite.', 412)
        } else {
          if (!current.cap) throw new HttpError('contract', 'Trần chưa tồn tại.', 412)
          checkCas(current.cap.version, intent.condition.version)
        }
        if (!current.cap || comparePlanningDecimal(current.cap.amount, request.amount) !== 0) current.cap = storeWorkspaceBudgetFixture({ amount: request.amount, version: `synthetic-cap/${++current.revision}` })
        return envelope({ store_id: storeId, budget_ceiling: current.cap })
      })
    },
  }
}
