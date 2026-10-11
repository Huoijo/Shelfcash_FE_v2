import type { AuthContext } from '../auth/auth.types'
import { HttpError } from '../../shared/http/httpClient'
import type { Pagination } from '../../shared/http/http.types'
import type { StoreChangeGuard, StoreState } from './store.context'
import type { StoreContext, StoreDataSource, StoreSummary } from './store.types'

export type StoreOwner = AuthContext | 'mock' | null
export type StoreSnapshot = {
  owner: StoreOwner
  state: StoreState
  accessibleStores: StoreSummary[]
  pagination: Pagination | null
  listBusy: boolean
  listError: string | null
}
const initial = (owner: StoreOwner = null): StoreSnapshot => ({
  owner, state: owner ? { status: 'loading' } : { status: 'unavailable', message: 'Chưa có phiên đăng nhập hợp lệ.' },
  accessibleStores: [], pagination: null, listBusy: false, listError: null,
})
function describe(error: unknown): string {
  if (error instanceof HttpError) return [error.message, error.problem?.code ? `(${error.problem.code})` : '',
    error.requestId ? `Mã yêu cầu: ${error.requestId}` : ''].filter(Boolean).join(' ')
  return error instanceof Error ? error.message : 'Không đọc được cửa hàng hoặc quyền hiện hành.'
}
const protocol = (message: string) => new HttpError('protocol', message)

/** Only FE request scope lives here. T01 is discovery, T02 is current authority;
 * no session mutation, cross-tab persistence or business-data cache. */
export class StoreWorkflow {
  private snapshot = initial()
  private source: StoreDataSource
  private mockDefaultStoreId: string | null
  private listeners = new Set<() => void>()
  private guards = new Set<StoreChangeGuard>()
  private ownerEpoch = 0
  private selectionIntent = 0
  private readEpoch = 0
  private listEpoch = 0
  private readController: AbortController | null = null
  private listController: AbortController | null = null
  private targetId: string | null = null
  private cursors = new Set<string>()

  constructor(source: StoreDataSource, options: { mockDefaultStoreId?: string } = {}) {
    this.source = source
    this.mockDefaultStoreId = options.mockDefaultStoreId ?? null
  }
  getSnapshot = () => this.snapshot
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  private update(patch: Partial<StoreSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch }
    this.listeners.forEach((listener) => listener())
  }
  registerChangeGuard = (guard: StoreChangeGuard) => {
    this.guards.add(guard)
    return () => { this.guards.delete(guard) }
  }
  cancel = () => {
    this.ownerEpoch += 1
    this.selectionIntent += 1
    this.readEpoch += 1
    this.listEpoch += 1
    this.readController?.abort()
    this.listController?.abort()
    this.readController = null
    this.listController = null
  }
  activate = async (owner: StoreOwner) => {
    this.cancel()
    this.guards.clear()
    this.targetId = null
    this.cursors.clear()
    this.snapshot = initial(owner)
    this.listeners.forEach((listener) => listener())
    if (!owner) return
    const ownerEpoch = this.ownerEpoch
    const loaded = await this.firstPage()
    if (!loaded || ownerEpoch !== this.ownerEpoch) return
    const defaultId = owner === 'mock' ? this.mockDefaultStoreId
      : owner.accessible_store_count === 1 ? owner.default_store_id : null
    if (defaultId && this.snapshot.accessibleStores.some((store) => store.store_id === defaultId))
      await this.read(defaultId)
    // Deliberately never auto-select items[0], including when A03's summary and
    // a newer T01 disagree. User selection always confirms current T02 grants.
  }
  private selectionState(): StoreState {
    return this.snapshot.accessibleStores.length || this.snapshot.pagination?.next_cursor
      ? { status: 'selecting', message: 'Chọn cửa hàng để mở dữ liệu và quyền hiện hành.' }
      : { status: 'empty', message: 'Tài khoản chưa có cửa hàng đang hoạt động. Liên hệ hỗ trợ ShelfCash.' }
  }
  private async firstPage(): Promise<boolean> {
    const epoch = ++this.listEpoch
    this.listController?.abort()
    const controller = new AbortController()
    this.listController = controller
    this.update({ listBusy: true, listError: null, state: { status: 'loading' } })
    try {
      const page = await this.source.list(controller.signal)
      if (epoch !== this.listEpoch || controller.signal.aborted) return false
      this.cursors.clear()
      this.update({ accessibleStores: page.items, pagination: page.pagination })
      this.update({ state: this.selectionState() })
      return true
    } catch (error) {
      if (epoch === this.listEpoch && !controller.signal.aborted) {
        const message = describe(error)
        this.update({ state: { status: 'error', message }, listError: message })
      }
      return false
    } finally { if (epoch === this.listEpoch && !controller.signal.aborted) this.update({ listBusy: false }) }
  }
  loadMore = async () => {
    const cursor = this.snapshot.pagination?.next_cursor
    if (!this.snapshot.owner || this.snapshot.listBusy || !cursor) return
    const epoch = ++this.listEpoch
    const controller = new AbortController()
    this.listController?.abort()
    this.listController = controller
    this.update({ listBusy: true, listError: null })
    try {
      const page = await this.source.list(controller.signal, cursor)
      if (epoch !== this.listEpoch || controller.signal.aborted) return
      const existing = new Set(this.snapshot.accessibleStores.map((store) => store.store_id))
      if (page.items.some((store) => existing.has(store.store_id)) || page.pagination.next_cursor === cursor ||
        page.pagination.next_cursor !== null && this.cursors.has(page.pagination.next_cursor) ||
        this.snapshot.pagination?.total_count !== null && page.pagination.total_count !== null &&
        this.snapshot.pagination?.total_count !== page.pagination.total_count)
        throw protocol('Danh sách cửa hàng đã thay đổi hoặc cursor không tiến triển. Hãy tải lại danh sách.')
      const items = [...this.snapshot.accessibleStores, ...page.items]
      if (page.pagination.total_count !== null && items.length > page.pagination.total_count)
        throw protocol('Tổng số cửa hàng không khớp phân trang.')
      this.cursors.add(cursor)
      this.update({ accessibleStores: items, pagination: page.pagination })
      if (this.snapshot.state.status === 'empty' || this.snapshot.state.status === 'selecting') this.update({ state: this.selectionState() })
    } catch (error) {
      if (epoch === this.listEpoch && !controller.signal.aborted) this.update({ listError: describe(error) })
    } finally { if (epoch === this.listEpoch && !controller.signal.aborted) this.update({ listBusy: false }) }
  }
  selectStore = async (storeId: string): Promise<boolean> => {
    if (!this.snapshot.owner || !this.snapshot.accessibleStores.some((store) => store.store_id === storeId)) return false
    const intent = ++this.selectionIntent
    const state = this.snapshot.state
    if ((state.status === 'ready' || state.status === 'mock_preview') && state.store.store_id === storeId) return true
    const ownerEpoch = this.ownerEpoch
    for (const guard of this.guards) {
      try { if (!await guard()) return false } catch { return false }
      if (intent !== this.selectionIntent || ownerEpoch !== this.ownerEpoch) return false
    }
    if (intent !== this.selectionIntent || ownerEpoch !== this.ownerEpoch) return false
    return this.read(storeId)
  }
  private async read(storeId: string): Promise<boolean> {
    const epoch = ++this.readEpoch
    this.readController?.abort()
    const controller = new AbortController()
    this.readController = controller
    this.targetId = storeId
    this.update({ state: { status: 'loading' } })
    try {
      const store: StoreContext = await this.source.read(storeId, controller.signal)
      if (epoch !== this.readEpoch || controller.signal.aborted) return false
      if (store.store_id !== storeId) throw protocol('Phản hồi T02 không thuộc cửa hàng được chọn.')
      // T02 may be newer than its T01 discovery row. Never replace current
      // grants with a list-summary version or infer permissions from role.
      this.update({ state: this.snapshot.owner === 'mock' ? { status: 'mock_preview', store } : { status: 'ready', store },
        accessibleStores: this.snapshot.accessibleStores.map((item) => item.store_id === storeId ? {
          store_id: store.store_id, name: store.name, timezone: store.timezone, currency: store.currency,
          role: store.role, membership_id: store.membership_id, authorization_version: store.authorization_version,
        } : item) })
      return true
    } catch (error) {
      if (epoch === this.readEpoch && !controller.signal.aborted) this.update({ state: { status: 'error', message: describe(error) } })
      return false
    }
  }
  refresh = async () => {
    if (!this.snapshot.owner) return
    if (this.targetId) await this.read(this.targetId)
    else await this.activate(this.snapshot.owner)
  }
  retry = () => { void this.refresh() }
}
