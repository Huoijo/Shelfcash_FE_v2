import { HttpError } from '../../shared/http/httpClient'
import type { PlanningContext } from '../decision-planning/planning.types'
import type { StoreContext } from '../store/store.types'
import type {
  BudgetIntent, Invitation, PermissionDescriptor, PermissionMutationRequest,
  StaffInvitationActionRequest, StaffInvitationCreateRequest, StaffMembership,
  StoreWorkspaceDataSource, WorkspaceCasIntent, WorkspaceIntent,
} from './storeWorkspace.types'
import { validateWorkspaceBudgetRequest, validateWorkspaceGrants, validateWorkspaceInvitationAction, validateWorkspaceInvitationCreate } from './storeWorkspace.validation'
import { storeDeliveryStatus, storeInvitationStatus } from './storeWorkspace.format'

type Resource<T> = { items: T[]; loaded: boolean; busy: boolean; error: string | null; cursor: string | null; total: number | null }
type Pending =
  | { kind: 'permissions'; id: string; intent: WorkspaceCasIntent<PermissionMutationRequest> }
  | { kind: 'invite'; intent: WorkspaceIntent<StaffInvitationCreateRequest> }
  | { kind: 'action'; id: string; targetEmail: string; intent: WorkspaceCasIntent<StaffInvitationActionRequest> }
  | { kind: 'budget'; intent: BudgetIntent }
export type StoreWorkspaceSnapshot = {
  members: Resource<StaffMembership>; invitations: Resource<Invitation>
  catalog: PermissionDescriptor[]; catalogVersion: string | null
  context: PlanningContext | null; contextBusy: boolean; contextError: string | null
  busy: boolean; uncertain: boolean; error: string | null; notice: string | null; revision: number
  authorizationInvalidated: boolean
  receiptKind: Pending['kind'] | null
  receiptSerial: number
}
const resource = <T>(): Resource<T> => ({ items: [], loaded: false, busy: false, error: null, cursor: null, total: null })
const initial = (): StoreWorkspaceSnapshot => ({ members: resource(), invitations: resource(), catalog: [], catalogVersion: null,
  context: null, contextBusy: false, contextError: null, busy: false, uncertain: false, error: null, notice: null, revision: 0, authorizationInvalidated: false, receiptKind: null, receiptSerial: 0 })
const message = (error: unknown) => error instanceof HttpError
  ? `${error.message}${error.requestId ? ` · Mã hỗ trợ: ${error.requestId}` : ''}`
  : error instanceof Error ? error.message : 'Không đọc được phản hồi cửa hàng.'
const ambiguous = (error: unknown) => error instanceof HttpError &&
  (['transport', 'protocol'].includes(error.kind) || (error.status ?? 0) >= 500 || (error.kind === 'http' && !error.problem))
const conflict = (error: unknown) => error instanceof HttpError && [409, 412, 428].includes(error.status ?? 0)

/** Mounted Store + authorization scope only. Nothing persists through refresh/logout. */
export class StoreWorkspaceWorkflow {
  private state = initial()
  private listeners = new Set<() => void>()
  private controllers = new Map<string, AbortController>()
  private pending: Pending | null = null
  private generation = 0
  private source: StoreWorkspaceDataSource
  readonly store: StoreContext
  private seenCursors = { members: new Set<string>(), invitations: new Set<string>() }
  constructor(source: StoreWorkspaceDataSource, store: StoreContext) { this.source = source; this.store = structuredClone(store) }
  getSnapshot = () => this.state
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private publish(patch: Partial<StoreWorkspaceSnapshot>) { this.state = { ...this.state, ...patch }; this.listeners.forEach((listener) => listener()) }
  private start(kind: string) { this.controllers.get(kind)?.abort(); const controller = new AbortController(); this.controllers.set(kind, controller); return controller }
  private current(kind: string, controller: AbortController) { return !controller.signal.aborted && this.controllers.get(kind) === controller }
  private invalidateAuthorization(error: unknown) {
    if (!(error instanceof HttpError) || ![401, 403, 404].includes(error.status ?? 0)) return
    for (const [kind, controller] of this.controllers) if (kind !== 'write') controller.abort()
    this.publish({ authorizationInvalidated: true, members: resource(), invitations: resource(), catalog: [], catalogVersion: null,
      context: null, contextBusy: false, contextError: null, revision: this.state.revision + 1,
      error: `${message(error)} · Không tiếp tục dùng quyền hoặc dữ liệu đã cache. Đọc lại cửa hàng và quyền hiện hành.` })
  }
  dispose = () => {
    this.generation++; this.controllers.forEach((controller) => controller.abort()); this.controllers.clear()
    this.pending = null; this.state = initial(); this.listeners.forEach((listener) => listener())
  }
  get canManage() { return !this.state.authorizationInvalidated && this.store.membership.role === 'OWNER' }
  get canReadBudget() { return !this.state.authorizationInvalidated && ['planning.context.read', 'budget.read', 'procurement.cost.read'].every((key) => this.store.membership.effective_permissions.includes(key)) }
  get canUpdateBudget() { return this.canReadBudget && ['budget.read', 'budget.update'].every((key) => this.store.membership.effective_permissions.includes(key)) }
  canLeave = () => !this.state.busy && !this.state.uncertain

  loadMembers = async (more = false): Promise<void> => {
    if (!this.canManage || this.state.busy || (more && (!this.state.members.cursor || this.state.members.busy))) return
    const before = this.state.members; const cursor = more ? before.cursor! : undefined
    if (!more) this.seenCursors.members.clear()
    if (cursor) this.seenCursors.members.add(cursor)
    const controller = this.start('members')
    this.publish({ members: { ...(more ? before : resource<StaffMembership>()), busy: true },
      ...(!more ? { catalog: [], catalogVersion: null } : {}) })
    try {
      const response = await this.source.memberships(this.store.store_id, { ...(cursor ? { cursor } : {}) }, controller.signal)
      if (!this.current('members', controller)) return
      const page = response.meta.pagination!
      const items = more ? [...before.items, ...response.data.items] : response.data.items
      if (new Set(items.map((item) => item.membership_id)).size !== items.length || (page.next_cursor !== null && this.seenCursors.members.has(page.next_cursor)) ||
        (more && (this.state.catalogVersion !== response.data.permission_catalog_version || JSON.stringify(this.state.catalog) !== JSON.stringify(response.data.permission_catalog))) ||
        (more && before.total !== page.total_count) || (page.total_count !== null && items.length > page.total_count)) throw new Error('Danh sách/quyền đã thay đổi hoặc cursor không tiến. Đọc lại toàn bộ thành viên.')
      this.publish({ catalog: response.data.permission_catalog, catalogVersion: response.data.permission_catalog_version!,
        members: { items, loaded: true, busy: false, error: null, cursor: page.next_cursor, total: page.total_count } })
    } catch (error) {
      if (this.current('members', controller)) { this.publish({ members: { ...resource<StaffMembership>(), error: message(error) }, catalog: [], catalogVersion: null, revision: this.state.revision + 1 }); this.invalidateAuthorization(error) }
    }
  }
  loadInvitations = async (more = false): Promise<void> => {
    if (!this.canManage || this.state.busy || (more && (!this.state.invitations.cursor || this.state.invitations.busy))) return
    const before = this.state.invitations; const cursor = more ? before.cursor! : undefined
    if (!more) this.seenCursors.invitations.clear()
    if (cursor) this.seenCursors.invitations.add(cursor)
    const controller = this.start('invitations')
    this.publish({ invitations: { ...(more ? before : resource<Invitation>()), busy: true } })
    try {
      const response = await this.source.invitations(this.store.store_id, cursor ? { cursor } : {}, controller.signal)
      if (!this.current('invitations', controller)) return
      const page = response.meta.pagination!
      const items = more ? [...before.items, ...response.data.items] : response.data.items
      if (new Set(items.map((item) => item.invitation_id)).size !== items.length || (page.next_cursor !== null && this.seenCursors.invitations.has(page.next_cursor)) ||
        (more && before.total !== page.total_count) || (page.total_count !== null && items.length > page.total_count)) throw new Error('Danh sách lời mời đã thay đổi hoặc cursor không tiến. Đọc lại toàn bộ lời mời.')
      this.publish({ invitations: { items, loaded: true, busy: false, error: null, cursor: page.next_cursor, total: page.total_count } })
    } catch (error) {
      if (this.current('invitations', controller)) { this.publish({ invitations: { ...resource<Invitation>(), error: message(error) }, revision: this.state.revision + 1 }); this.invalidateAuthorization(error) }
    }
  }
  loadBudget = async (): Promise<void> => {
    if (!this.canReadBudget || this.state.busy) return
    const controller = this.start('context')
    this.publish({ context: null, contextBusy: true, contextError: null })
    try {
      const response = await this.source.planningContext(this.store.store_id, controller.signal)
      if (!this.current('context', controller)) return
      if (response.data.store_id !== this.store.store_id || response.data.currency !== this.store.currency || response.data.timezone !== this.store.timezone) throw new Error('Planning context không khớp cửa hàng hiện hành. Đọc lại Store và quyền truy cập.')
      this.publish({ context: response.data, contextBusy: false })
    } catch (error) { if (this.current('context', controller)) { this.publish({ context: null, contextBusy: false, contextError: message(error), revision: this.state.revision + 1 }); this.invalidateAuthorization(error) } }
  }
  private available() { return !this.state.busy && !this.state.uncertain && !this.state.members.busy && !this.state.invitations.busy && !this.state.contextBusy }
  savePermissions = async (id: string, request: PermissionMutationRequest): Promise<void> => {
    if (!this.available() || !this.canManage) return
    const member = this.state.members.items.find((item) => item.membership_id === id)
    if (!member?.active || !this.state.catalogVersion) return
    try { validateWorkspaceGrants(request, this.state.catalog) } catch (error) { this.publish({ error: message(error) }); return }
    this.pending = { kind: 'permissions', id, intent: { key: crypto.randomUUID(), version: member.version, request: structuredClone(request) } }
    await this.send()
  }
  invite = async (request: StaffInvitationCreateRequest): Promise<void> => {
    if (!this.available() || !this.canManage || request.permission_catalog_version !== this.state.catalogVersion) return
    try { validateWorkspaceInvitationCreate(request, this.state.catalog) } catch (error) { this.publish({ error: message(error) }); return }
    this.pending = { kind: 'invite', intent: { key: crypto.randomUUID(), request: structuredClone(request) } }; await this.send()
  }
  actOnInvitation = async (id: string, request: StaffInvitationActionRequest): Promise<void> => {
    if (!this.available() || !this.canManage) return
    const item = this.state.invitations.items.find((invitation) => invitation.invitation_id === id)
    if (!item || item.status === 'accepted' || (request.action === 'revoke' && !['pending', 'revoked'].includes(item.status))) return
    try { validateWorkspaceInvitationAction(request, this.state.catalog) } catch (error) { this.publish({ error: message(error) }); return }
    if (request.action === 'reissue' && request.permission_catalog_version !== this.state.catalogVersion) return
    this.pending = { kind: 'action', id, targetEmail: item.target_email, intent: { key: crypto.randomUUID(), version: item.version, request: structuredClone(request) } }; await this.send()
  }
  saveBudget = async (amount: string): Promise<void> => {
    if (!this.available() || !this.canUpdateBudget || !this.state.context) return
    try { validateWorkspaceBudgetRequest({ amount }) } catch (error) { this.publish({ error: message(error) }); return }
    const cap = this.state.context.budget_ceiling
    // C01 has no absence-vs-unavailable discriminator for a null ceiling. Fail closed.
    if (!cap) { this.publish({ error: 'Chưa xác minh trần ngân sách chưa tồn tại. Cần BE xác nhận trạng thái trước khi tạo trần ban đầu.' }); return }
    this.pending = { kind: 'budget', intent: { key: crypto.randomUUID(), request: { amount }, condition: { kind: 'replace', version: cap.version } } }; await this.send()
  }
  retry = async (): Promise<void> => { if (this.state.uncertain && !this.state.busy && this.pending) await this.send() }
  private async send() {
    const pending = this.pending; if (!pending) return
    if (pending.kind === 'budget' ? !this.canUpdateBudget : !this.canManage) return
    const wasUncertain = this.state.uncertain; const generation = this.generation
    const controller = this.start('write')
    this.publish({ busy: true, error: null, notice: null })
    try {
      if (pending.kind === 'permissions') {
        const response = await this.source.replacePermissions(this.store.store_id, pending.id, structuredClone(pending.intent), controller.signal)
        if (!this.current('write', controller)) return
        this.publish({ notice: response.data.changed ? 'Đã cập nhật quyền theo phản hồi máy chủ.' : 'Quyền không thay đổi; máy chủ xác nhận không tạo sự kiện mới.' })
      } else if (pending.kind === 'invite') {
        const response = await this.source.createInvitation(this.store.store_id, structuredClone(pending.intent), controller.signal)
        if (!this.current('write', controller)) return
        this.publish({ notice: `Đã tạo lời mời: ${storeInvitationStatus(response.data.invitation.status)} · ${storeDeliveryStatus(response.data.delivery.status)}. Chưa thêm thành viên hoặc cấp quyền cho người nhận.` })
      } else if (pending.kind === 'action') {
        const response = await this.source.invitationAction(this.store.store_id, pending.id, structuredClone(pending.intent), controller.signal)
        if (!this.current('write', controller)) return
        if (response.data.invitation.target_email !== pending.targetEmail) throw new HttpError('protocol', 'Phản hồi thay đổi sai người nhận lời mời. Chưa xác minh được kết quả yêu cầu.')
        this.publish({ notice: `Máy chủ xác nhận: ${storeInvitationStatus(response.data.invitation.status)}${response.data.delivery ? ` · ${storeDeliveryStatus(response.data.delivery.status)}` : ''}. Không thay đổi quyền của thành viên hiện hành.` })
      } else {
        const response = await this.source.updateBudget(this.store.store_id, structuredClone(pending.intent), controller.signal)
        if (!this.current('write', controller)) return
        if (response.data.budget_ceiling.currency !== this.store.currency) throw new HttpError('protocol', 'Ngân sách trả về sai currency cửa hàng.')
        this.publish({ notice: 'Đã cập nhật trần ngân sách cửa hàng. Không thay đổi default requirements hoặc Run đã được nhận.' })
      }
      this.pending = null; this.publish({ busy: false, uncertain: false, receiptKind: pending.kind, receiptSerial: this.state.receiptSerial + 1, revision: this.state.revision + 1 })
      // Known receipt: a failed follow-up GET never replays the write.
      if (pending.kind === 'budget') await this.loadBudget()
      else if (pending.kind === 'permissions') await this.loadMembers()
      else await this.loadInvitations()
    } catch (error) {
      if (generation !== this.generation || !this.current('write', controller)) return
      const uncertain = wasUncertain || ambiguous(error)
      if (!uncertain) this.pending = null
      this.publish({ busy: false, uncertain, error: message(error), ...(!uncertain && conflict(error) ? { revision: this.state.revision + 1 } : {}) })
      this.invalidateAuthorization(error)
      if (!uncertain && conflict(error)) {
        this.publish({ error: `${message(error)} · Đã bỏ bản sửa cũ; đọc lại rồi xác nhận thay đổi mới. Không tự gửi lại với version mới.` })
        if (pending.kind === 'budget') await this.loadBudget()
        else if (pending.kind === 'permissions') await this.loadMembers()
        else await this.loadInvitations()
      }
    }
  }
}
