import { requestJson } from '../../shared/http/httpClient'
import { createPlanningDataSource } from '../decision-planning/planning.data'
import type { PermissionDescriptor, StoreWorkspaceDataSource, StoreWorkspaceDataSourceOptions, WorkspacePageQuery } from './storeWorkspace.types'
import {
  isStoreWorkspaceUuid, validateWorkspaceBudget, validateWorkspaceBudgetRequest, validateWorkspaceInvitationAction,
  validateWorkspaceInvitationActionResult, validateWorkspaceInvitationCreate, validateWorkspaceInvitationCreated,
  validateWorkspaceInvitations, validateWorkspaceKey, validateWorkspaceMemberships, validateWorkspaceGrants,
  validateWorkspacePermissions, workspaceIfMatch,
} from './storeWorkspace.validation'

function requireUuid(value: string, label: string): void {
  if (!isStoreWorkspaceUuid(value)) throw new Error(`${label} phải là UUID canonical của máy chủ.`)
}
function paging(query: WorkspacePageQuery): URLSearchParams {
  const params = new URLSearchParams()
  if (query.limit !== undefined) {
    if (!Number.isSafeInteger(query.limit) || query.limit < 1 || query.limit > 100) throw new Error('Kích thước trang phải từ 1 đến 100.')
    params.set('limit', String(query.limit))
  }
  if (query.cursor !== undefined) {
    if (!query.cursor.trim() || query.cursor.length > 4096) throw new Error('Cursor cần nguyên gốc, không rỗng và tối đa 4096 ký tự.')
    params.set('cursor', query.cursor)
  }
  return params
}

/** Explicit mock injection only. A failed API request never switches to synthetic data. */
export function createStoreWorkspaceDataSource(options: StoreWorkspaceDataSourceOptions): StoreWorkspaceDataSource {
  if (options.dataSource === 'mock') {
    if (!options.mockSource) throw new Error('Store Workspace mock cần được truyền tường minh; không có API → mock fallback.')
    return options.mockSource
  }
  if (options.dataSource !== 'api') throw new Error('Nguồn Store Workspace phải là api hoặc mock.')
  const catalogues = new Map<string, PermissionDescriptor[]>()
  const planning = createPlanningDataSource({ dataSource: 'api', apiBaseUrl: options.apiBaseUrl })
  const storePath = (id: string) => { requireUuid(id, 'Store'); return `/api/v1/stores/${id}` }
  const get = (path: string, signal?: AbortSignal) => requestJson<unknown>(options.apiBaseUrl, path, { signal, referrerPolicy: 'no-referrer' })
  const source: StoreWorkspaceDataSource = {
    async memberships(storeId, query = {}, signal) {
      const endpoint = storePath(storeId)
      const params = paging(query)
      if (query.active !== undefined && !['all', 'true', 'false'].includes(query.active)) throw new Error('Bộ lọc Staff active không hợp lệ.')
      params.set('role', 'STAFF')
      params.set('active', query.active ?? 'all')
      const response = validateWorkspaceMemberships(await get(`${endpoint}/memberships?${params}`, signal))
      signal?.throwIfAborted()
      catalogues.set(storeId, structuredClone(response.data.permission_catalog))
      return response
    },
    async replacePermissions(storeId, membershipId, intent, signal) {
      const endpoint = storePath(storeId); requireUuid(membershipId, 'Membership')
      const headers = { 'Idempotency-Key': validateWorkspaceKey(intent.key), 'If-Match': workspaceIfMatch(intent.version) }
      // Snapshot body before a prerequisite read; an input edit cannot mutate the submitted intent.
      const request = structuredClone(validateWorkspaceGrants(intent.request))
      if (!catalogues.has(storeId)) await source.memberships(storeId, {}, signal)
      validateWorkspaceGrants(request, catalogues.get(storeId))
      return validateWorkspacePermissions(await requestJson<unknown>(options.apiBaseUrl, `${endpoint}/memberships/${membershipId}/permissions`, {
        method: 'PUT', signal, headers, body: request, referrerPolicy: 'no-referrer',
      }), membershipId, request)
    },
    async invitations(storeId, query = {}, signal) {
      const endpoint = storePath(storeId)
      const params = paging(query)
      params.set('view', 'invitations'); params.set('sort', '-issued_at')
      if (query.statuses !== undefined) {
        if (!query.statuses.length || new Set(query.statuses).size !== query.statuses.length || query.statuses.some((status) => !['pending', 'accepted', 'revoked', 'expired'].includes(status))) throw new Error('Trạng thái lời mời cần danh sách hợp lệ, duy nhất.')
        params.set('status', query.statuses.join(','))
      }
      if (query.email !== undefined) {
        if (!query.email.trim() || [...query.email].length > 320 || /[\r\n]/.test(query.email)) throw new Error('Bộ lọc email không hợp lệ.')
        params.set('email', query.email)
      }
      return validateWorkspaceInvitations(await get(`${endpoint}/staff-invitations?${params}`, signal), storeId)
    },
    async createInvitation(storeId, intent, signal) {
      const endpoint = storePath(storeId)
      const headers = { 'Idempotency-Key': validateWorkspaceKey(intent.key) }
      const request = structuredClone(validateWorkspaceInvitationCreate(intent.request))
      if (!catalogues.has(storeId)) await source.memberships(storeId, {}, signal)
      validateWorkspaceInvitationCreate(request, catalogues.get(storeId))
      return validateWorkspaceInvitationCreated(await requestJson<unknown>(options.apiBaseUrl, `${endpoint}/staff-invitations`, {
        method: 'POST', signal, headers, body: request, referrerPolicy: 'no-referrer',
      }), storeId, request)
    },
    async invitationAction(storeId, invitationId, intent, signal) {
      const endpoint = storePath(storeId); requireUuid(invitationId, 'Invitation')
      const headers = { 'Idempotency-Key': validateWorkspaceKey(intent.key), 'If-Match': workspaceIfMatch(intent.version) }
      const request = structuredClone(validateWorkspaceInvitationAction(intent.request))
      if (request.action === 'reissue') {
        if (!catalogues.has(storeId)) await source.memberships(storeId, {}, signal)
        validateWorkspaceInvitationAction(request, catalogues.get(storeId))
      }
      return validateWorkspaceInvitationActionResult(await requestJson<unknown>(options.apiBaseUrl, `${endpoint}/staff-invitations/${invitationId}/actions`, {
        method: 'POST', signal, headers, body: request, referrerPolicy: 'no-referrer',
      }), storeId, invitationId, request)
    },
    planningContext: (storeId, signal) => planning.context(storeId, signal),
    async updateBudget(storeId, intent, signal) {
      const endpoint = storePath(storeId)
      const request = structuredClone(validateWorkspaceBudgetRequest(intent.request))
      const headers: Record<string, string> = { 'Idempotency-Key': validateWorkspaceKey(intent.key) }
      if (intent.condition.kind === 'create' && Object.keys(intent.condition).length === 1) headers['If-None-Match'] = '*'
      else if (intent.condition.kind === 'replace' && Object.keys(intent.condition).length === 2) headers['If-Match'] = workspaceIfMatch(intent.condition.version)
      else throw new Error('Cấu hình ngân sách cần đúng một điều kiện create-only hoặc CAS replacement.')
      return validateWorkspaceBudget(await requestJson<unknown>(options.apiBaseUrl, `${endpoint}/planning-budget`, {
        method: 'PUT', signal, headers, body: request,
      }), storeId, request.amount)
    },
  }
  return source
}
