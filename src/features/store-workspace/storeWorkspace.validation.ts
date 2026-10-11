import { HttpError, isRecord } from '../../shared/http/httpClient'
import { comparePlanningDecimal, isPlanningMoney } from '../decision-planning/planning.validation'
import type {
  BudgetResponse, InvitationActionResponse, InvitationCreateResponse, InvitationsResponse,
  MembershipsResponse, PermissionDescriptor, PermissionMutationRequest, PermissionsResponse,
  StaffInvitationActionRequest, StaffInvitationCreateRequest, StoreBudgetRequest,
} from './storeWorkspace.types'
import { matchesStoreWire } from './storeWorkspace.wire'

const nonblank = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const unique = (items: string[]) => new Set(items).size === items.length
export const isStoreWorkspaceUuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(value)

function invalid(label: string, value: unknown): never {
  const requestId = isRecord(value) && isRecord(value.meta) && typeof value.meta.request_id === 'string' ? value.meta.request_id : undefined
  throw new HttpError('protocol', `Phản hồi ${label} không khớp contract Store Workspace hiện hành. Đọc lại dữ liệu trước khi tiếp tục.`, undefined, undefined, requestId)
}
function envelope<T>(schema: string, value: unknown, label: string): T {
  if (!matchesStoreWire(schema, value) || !isRecord(value) || !isRecord(value.meta) || !nonblank(value.meta.request_id)) return invalid(label, value)
  return value as T
}
function grantsValid(grants: string[]): boolean {
  return grants.length <= 37 && grants.every(nonblank) && unique(grants) && grants.every((key, index) => index === 0 || grants[index - 1] < key)
}
function validPage(response: { data: { items: unknown[] }; meta: { pagination?: { limit: number; next_cursor: string | null; total_count: number | null } | null } }): boolean {
  const page = response.meta.pagination
  return !!page && Number.isSafeInteger(page.limit) && page.limit >= 1 && page.limit <= 100 && response.data.items.length <= page.limit &&
    (page.next_cursor === null || (nonblank(page.next_cursor) && page.next_cursor.length <= 4096)) &&
    (page.total_count === null || (Number.isSafeInteger(page.total_count) && page.total_count >= response.data.items.length))
}
function validCatalogue(catalogue: PermissionDescriptor[]): boolean {
  return unique(catalogue.map((item) => item.key)) && catalogue.every((item) => nonblank(item.key) && nonblank(item.label_vi) &&
    unique(item.required_with) && item.required_with.every((key) => catalogue.some((entry) => entry.key === key)))
}
function validInvitation(item: InvitationsResponse['data']['items'][number], storeId: string): boolean {
  return item.store_id === storeId && grantsValid(item.offered_grants) && nonblank(item.version) && nonblank(item.target_email) &&
    item.permission_catalog_version === 'permissions-v2' &&
    (item.status === 'accepted' ? item.accepted_at !== null && item.revoked_at === null : item.accepted_at === null) &&
    (item.status === 'revoked' ? item.revoked_at !== null : item.revoked_at === null)
}

export function validateWorkspaceKey(value: string): string {
  if (!nonblank(value) || /[\r\n]/.test(value) || new TextEncoder().encode(value).byteLength > 128) throw new Error('Idempotency-Key cần opaque token không rỗng, tối đa 128 byte UTF-8.')
  return value
}
/** Retains the original CAS token; never replaces it silently on retry. */
export function workspaceIfMatch(version: string): string {
  if (!nonblank(version) || version.length > 254 || [...version].some((character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127) || /[,\\]/.test(version) || version.startsWith('W/') || version === '*') throw new Error('Cần phiên bản CAS nguyên gốc, không wildcard, weak ETag hoặc nhiều phiên bản.')
  if (version.startsWith('"') && version.endsWith('"') && version.length > 2 && !version.slice(1, -1).includes('"')) return version
  if (version.includes('"')) throw new Error('Phiên bản CAS không hợp lệ.')
  return `"${version}"`
}

export function validateWorkspaceGrants(value: unknown, catalogue?: PermissionDescriptor[]): PermissionMutationRequest {
  if (!matchesStoreWire('GrantsRequest', value)) throw new Error('Cần toàn bộ danh sách quyền và lý do thay đổi; không nhận role hoặc active.')
  const request = value as PermissionMutationRequest
  if (!grantsValid(request.grants) || !nonblank(request.reason)) throw new Error('Quyền cần duy nhất, sắp xếp theo key; lý do không được trống.')
  if (catalogue && request.grants.some((key) => !catalogue.some((item) => item.key === key && item.grantable_to_staff))) throw new Error('Chỉ được chọn quyền Staff có trong catalogue hiện hành.')
  return request
}
export function validateWorkspaceInvitationCreate(value: unknown, catalogue?: PermissionDescriptor[]): StaffInvitationCreateRequest {
  if (!matchesStoreWire('CreateInvitation', value)) throw new Error('Lời mời chỉ nhận email, quyền, phiên bản catalogue và lý do.')
  const request = value as StaffInvitationCreateRequest
  validateWorkspaceGrants({ grants: request.grants, reason: request.reason }, catalogue)
  if (request.permission_catalog_version !== 'permissions-v2' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email) || /[\r\n]/.test(request.email)) throw new Error('Cần email hợp lệ và phiên bản catalogue đã được xem lại.')
  return request
}
export function validateWorkspaceInvitationAction(value: unknown, catalogue?: PermissionDescriptor[]): StaffInvitationActionRequest {
  if (matchesStoreWire('RevokeInvitation', value)) {
    const request = value as StaffInvitationActionRequest
    if (!nonblank(request.reason)) throw new Error('Cần lý do thu hồi lời mời.')
    return request
  }
  if (!matchesStoreWire('ReissueInvitation', value)) throw new Error('Thao tác lời mời phải là gửi lại hoặc thu hồi theo contract.')
  const request = value as Extract<StaffInvitationActionRequest, { action: 'reissue' }>
  validateWorkspaceGrants({ grants: request.grants, reason: request.reason }, catalogue)
  if (request.permission_catalog_version !== 'permissions-v2') throw new Error('Đọc lại catalogue trước khi gửi lại lời mời.')
  return request
}
export function validateWorkspaceBudgetRequest(value: unknown): StoreBudgetRequest {
  if (!matchesStoreWire('BudgetRequest', value) || !isRecord(value) || !isPlanningMoney(value.amount)) throw new Error('Trần ngân sách phải là decimal string không âm, tối đa 18 chữ số nguyên và 18 chữ số lẻ; 0 hợp lệ.')
  return value as StoreBudgetRequest
}

export function validateWorkspaceMemberships(value: unknown): MembershipsResponse {
  const response = envelope<MembershipsResponse>('Envelope_MembershipList_', value, 'N12')
  if (!validPage(response) || !validCatalogue(response.data.permission_catalog) || !unique(response.data.items.map((item) => item.membership_id)) ||
    response.data.items.some((item) => !nonblank(item.version) || !grantsValid(item.grants) || item.grants.some((key) => !response.data.permission_catalog.some((permission) => permission.key === key && permission.grantable_to_staff)))) return invalid('N12 catalogue/membership/page', value)
  return { ...response, data: { ...response.data, permission_catalog_version: response.data.permission_catalog_version ?? 'permissions-v2',
    items: response.data.items.map((item) => ({ ...item, role: item.role ?? 'STAFF' })) } }
}
export function validateWorkspacePermissions(value: unknown, membershipId: string, request?: PermissionMutationRequest): PermissionsResponse {
  const response = envelope<PermissionsResponse>('Envelope_PermissionUpdate_', value, 'N13')
  const data = response.data
  if (data.membership.membership_id !== membershipId || !data.membership.active || !nonblank(data.membership.version) || !grantsValid(data.membership.grants) ||
    data.changed !== (data.event_id !== null) || (request && JSON.stringify(data.membership.grants) !== JSON.stringify(request.grants))) return invalid('N13 identity/receipt', value)
  return { ...response, data: { ...data, membership: { ...data.membership, role: data.membership.role ?? 'STAFF' } } }
}
export function validateWorkspaceInvitations(value: unknown, storeId: string): InvitationsResponse {
  const response = envelope<InvitationsResponse>('Envelope_InvitationList_', value, 'N16')
  if (!validPage(response) || !unique(response.data.items.map((item) => item.invitation_id)) || response.data.items.some((item) => !validInvitation(item, storeId))) return invalid('N16 scope/lifecycle/page', value)
  return { ...response, data: { items: response.data.items.map((item) => ({ ...item, role: item.role ?? 'STAFF' })) } }
}
export function validateWorkspaceInvitationCreated(value: unknown, storeId: string, request?: StaffInvitationCreateRequest): InvitationCreateResponse {
  const response = envelope<InvitationCreateResponse>('Envelope_InvitationCreation_', value, 'N15')
  const item = response.data.invitation
  // The retained creation receipt is pending + queued, even after later lifecycle/delivery changes.
  if (!validInvitation(item, storeId) || item.status !== 'pending' || item.delivery_status !== 'queued' || response.data.delivery.status !== 'queued' ||
    (request && (item.target_email !== request.email.trim().toLowerCase() || JSON.stringify(item.offered_grants) !== JSON.stringify(request.grants)))) return invalid('N15 scope/recipient/receipt', value)
  return { ...response, data: { ...response.data, invitation: { ...response.data.invitation, role: response.data.invitation.role ?? 'STAFF' } } }
}
export function validateWorkspaceInvitationActionResult(value: unknown, storeId: string, invitationId: string, request?: StaffInvitationActionRequest): InvitationActionResponse {
  const response = envelope<InvitationActionResponse>('Envelope_InvitationAction_', value, 'N17')
  const item = response.data.invitation
  if (!validInvitation(item, storeId) || item.invitation_id !== invitationId ||
    (request?.action === 'reissue' && (item.status !== 'pending' || item.delivery_status !== 'queued' || response.data.delivery?.status !== 'queued' || response.data.event_id === null || JSON.stringify(item.offered_grants) !== JSON.stringify(request.grants))) ||
    (request?.action === 'revoke' && (item.status !== 'revoked' || response.data.delivery !== null))) return invalid('N17 scope/lifecycle/receipt', value)
  return { ...response, data: { ...response.data, invitation: { ...item, role: item.role ?? 'STAFF' } } }
}
export function validateWorkspaceBudget(value: unknown, storeId: string, amount?: string): BudgetResponse {
  const response = envelope<BudgetResponse>('Envelope_BudgetResult_', value, 'N4')
  if (response.data.store_id !== storeId || !isPlanningMoney(response.data.budget_ceiling.amount) || !nonblank(response.data.budget_ceiling.currency) ||
    !nonblank(response.data.budget_ceiling.version) || (amount !== undefined && comparePlanningDecimal(response.data.budget_ceiling.amount, amount) !== 0)) return invalid('N4 scope/money/receipt', value)
  return response
}
