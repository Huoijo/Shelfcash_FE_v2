import { HttpError } from '../../shared/http/httpClient'
import { validatePlanningRequest } from './planning.validation'
import type {
  PlanningAccepted, PlanningContext, PlanningDataSource, PlanningIngredient, PlanningIngredients,
  PlanningIntent, PlanningNotification, PlanningReadiness, PlanningReasons, PlanningRequest, PlanningRun, PlanningRunResponse,
} from './planning.types'

export type PlanningPhase = 'setup' | 'loading_context' | 'creating' | 'pending' | 'result' | 'error'
export type PlanningState = {
  phase: PlanningPhase
  context: PlanningContext | null
  run: PlanningRun | null
  accepted: PlanningAccepted | null
  warnings: PlanningNotification[]
  busy: boolean
  error: string | null
  uncertain: boolean
  pollAfterMs: number | null
  pollStopped: boolean
  readiness: PlanningReadiness | null
  readinessDate: string | null
  readinessBusy: boolean
  readinessError: string | null
  selectedOptionId: string | null
  ingredients: PlanningIngredients | null
  ingredient: PlanningIngredient | null
  reasons: PlanningReasons | null
  nextIngredientCursor: string | null
  ingredientsTotal: number | null
  detailBusy: boolean
  inspectionArea: 'ingredients' | 'ingredient' | 'reasons' | null
  inspectionError: string | null
}
const initial = (): PlanningState => ({
  phase: 'setup', context: null, run: null, accepted: null, warnings: [], busy: false, error: null,
  uncertain: false, pollAfterMs: null, pollStopped: false, readiness: null, readinessDate: null,
  readinessBusy: false, readinessError: null, selectedOptionId: null, ingredients: null,
  ingredient: null, reasons: null, nextIngredientCursor: null, ingredientsTotal: null,
  detailBusy: false, inspectionArea: null, inspectionError: null,
})
const moneyRights = ['budget.read', 'procurement.cost.read']
const isPending = (status: PlanningRun['status']) => status === 'queued' || status === 'running'
function uncertainOutcome(error: unknown): boolean {
  return error instanceof HttpError && (error.kind === 'transport' || error.kind === 'protocol' ||
    error.status !== undefined && error.status >= 500)
}
export function describePlanningError(error: unknown): string {
  if (!(error instanceof HttpError)) return error instanceof Error ? error.message : 'Không thực hiện được yêu cầu kế hoạch.'
  const prefix = error.status === 401 ? 'Cần đăng nhập lại.' : error.status === 403 ? 'Bạn chưa có quyền cho thao tác này.'
    : error.status === 404 ? 'Không tìm thấy kế hoạch trong cửa hàng hiện tại.' : ''
  return [prefix, error.message, error.problem?.code ? `(${error.problem.code})` : '',
    error.requestId ? `Mã yêu cầu: ${error.requestId}` : ''].filter(Boolean).join(' ')
}

// Memory-only owner of one Store's planning workspace. URL IDs are locators,
// never credentials or retained business truth. No automatic mutation replay.
export class PlanningWorkflow {
  private state = initial()
  private listeners = new Set<() => void>()
  private permissions: string[]
  private pending: PlanningIntent | null = null
  private targetId: string | null = null
  private epoch = 0
  private controller: AbortController | null = null
  private readinessEpoch = 0
  private readinessController: AbortController | null = null
  private inspectionEpoch = 0
  private inspectionController: AbortController | null = null
  private inspectionPin: { digest: string | null; version: string | null } | null = null
  private polls = 0
  private source: PlanningDataSource
  private storeId: string | null

  constructor(source: PlanningDataSource, storeId: string | null, options: { permissions?: string[] } = {}) {
    this.source = source
    this.storeId = storeId
    this.permissions = [...(options.permissions ?? [])]
  }
  getSnapshot = () => this.state
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  private update(patch: Partial<PlanningState>) {
    this.state = { ...this.state, ...patch }
    this.listeners.forEach((listener) => listener())
  }
  setPermissions = (permissions: string[]) => { this.permissions = [...permissions] }
  private authorize(action: string): string {
    if (!this.storeId || ![action, ...moneyRights].every((right) => this.permissions.includes(right)))
      throw new Error('Chưa có cửa hàng hoặc quyền planning/ngân sách/giá mua hiện hành.')
    return this.storeId
  }
  private clearInspection(): Partial<PlanningState> {
    this.inspectionController?.abort()
    this.inspectionEpoch += 1
    this.inspectionPin = null
    return { ingredients: null, ingredient: null, reasons: null, nextIngredientCursor: null,
      ingredientsTotal: null, detailBusy: false, inspectionArea: null, inspectionError: null }
  }
  private publish(response: PlanningRunResponse) {
    const run = response.data
    if (run.store_id !== this.storeId || run.run_id !== this.targetId) throw new Error('Kế hoạch không thuộc định danh/cửa hàng đang mở.')
    const changed = this.state.run?.response_version !== run.response_version
    const pending = isPending(run.status)
    this.update({ ...(changed ? this.clearInspection() : {}), run, warnings: response.meta.warnings,
      phase: pending ? 'pending' : 'result', pollAfterMs: pending && this.polls < 60 ? response.meta.poll_after_ms : null,
      pollStopped: pending && this.polls >= 60, error: null,
      selectedOptionId: this.state.selectedOptionId && run.result?.options.some((option) => option.option_id === this.state.selectedOptionId)
        ? this.state.selectedOptionId : null })
  }
  private async core(phase: PlanningPhase, task: (signal: AbortSignal, epoch: number) => Promise<void>) {
    if (this.state.busy) return
    const epoch = ++this.epoch
    this.controller?.abort()
    const controller = new AbortController()
    this.controller = controller
    this.update({ busy: true, phase, error: null, pollAfterMs: null })
    try { await task(controller.signal, epoch) }
    catch (error) {
      if (epoch === this.epoch && !controller.signal.aborted) this.update({ phase: 'error', error: describePlanningError(error), pollAfterMs: null })
    } finally { if (epoch === this.epoch && !controller.signal.aborted) this.update({ busy: false }) }
  }
  loadContext = () => {
    const pollAfterMs = this.state.pollAfterMs
    return this.core('loading_context', async (signal, epoch) => {
      const response = await this.source.context(this.authorize('planning.context.read'), signal)
      if (epoch === this.epoch) this.update({ context: response.data,
        phase: this.state.run ? isPending(this.state.run.status) ? 'pending' : 'result' : 'setup',
        pollAfterMs: this.state.run && isPending(this.state.run.status) && !this.state.pollStopped ? pollAfterMs : null })
    })
  }
  assessDate = async (start: string) => {
    const epoch = ++this.readinessEpoch
    this.readinessController?.abort()
    const controller = new AbortController()
    this.readinessController = controller
    this.update({ readiness: null, readinessDate: null, readinessBusy: true, readinessError: null })
    try {
      const response = await this.source.readiness(this.authorize('planning.context.read'), start, controller.signal)
      if (epoch === this.readinessEpoch && !controller.signal.aborted)
        this.update({ readiness: response.data, readinessDate: start })
    } catch (error) {
      if (epoch === this.readinessEpoch && !controller.signal.aborted) this.update({ readinessError: describePlanningError(error) })
    } finally {
      if (epoch === this.readinessEpoch && !controller.signal.aborted) this.update({ readinessBusy: false })
    }
  }
  create = (request: PlanningRequest) => this.core('creating', async (signal, epoch) => {
    const storeId = this.authorize('planning.run')
    this.authorize('planning.result.read')
    if (this.pending || this.targetId) throw new Error('Cần giải quyết kế hoạch hiện tại trước khi bắt đầu một intent mới.')
    validatePlanningRequest(request)
    const context = this.state.context
    const readiness = this.state.readiness?.actions.find((action) => action.action === 'planning')
    if (!context || !context.budget_ceiling || !context.capabilities.winner_selection ||
      !context.requirements_modes.some((mode) => mode.mode === request.requirements_mode && mode.availability === 'available') ||
      this.state.readinessDate !== request.forecast_start_date || !readiness?.can_execute ||
      readiness.availability !== 'ready' || readiness.execution_status !== 'available' || readiness.blockers.length)
      throw new Error('Cần cấu hình và readiness hợp lệ cho đúng ngày bắt đầu trước khi tạo kế hoạch.')
    if (request.requirements_mode === 'default' && request.default_requirements_version !== context.default_requirements_version)
      throw new Error('Phiên bản yêu cầu mặc định đã đổi; cần đọc lại thiết lập.')
    this.pending = { key: crypto.randomUUID(), request: structuredClone(request) }
    this.polls = 0
    await this.sendCreate(storeId, signal, epoch)
  })
  private async sendCreate(storeId: string, signal: AbortSignal, epoch: number) {
    if (!this.pending) throw new Error('Không có intent tạo kế hoạch để gửi lại.')
    let response
    try { response = await this.source.create(storeId, structuredClone(this.pending), signal) }
    catch (error) {
      if (epoch === this.epoch && !signal.aborted) {
        // A later rejected replay cannot disprove an earlier lost acceptance.
        const uncertain = this.state.uncertain || uncertainOutcome(error)
        if (!uncertain) this.pending = null
        this.update({ uncertain })
      }
      throw error
    }
    if (epoch !== this.epoch || signal.aborted) return
    // A known durable acceptance is not an uncertain POST, even if its GET fails.
    this.pending = null
    this.targetId = response.data.run_id
    this.update({ accepted: response.data, warnings: response.meta.warnings, uncertain: false, phase: 'pending' })
    const retained = await this.source.read(this.authorize('planning.result.read'), response.data.run_id, signal)
    if (epoch === this.epoch && !signal.aborted) this.publish(retained)
  }
  retryCreate = () => this.core('creating', async (signal, epoch) => {
    if (!this.state.uncertain || !this.pending) throw new Error('Không có yêu cầu tạo kế hoạch chưa rõ kết quả.')
    await this.sendCreate(this.authorize('planning.run'), signal, epoch)
  })
  refresh = () => this.core(this.state.phase, async (signal, epoch) => {
    if (!this.targetId) throw new Error('Chưa có định danh kế hoạch đã nhận để đọc lại.')
    const response = await this.source.read(this.authorize('planning.result.read'), this.targetId, signal)
    if (epoch === this.epoch && !signal.aborted) this.publish(response)
  })
  poll = async () => {
    if (this.state.busy || this.state.pollAfterMs === null || !this.state.run || !isPending(this.state.run.status)) return
    this.polls += 1
    await this.refresh()
  }
  resume = (runId: string) => {
    if (this.state.busy || this.pending) return Promise.resolve()
    this.targetId = runId
    this.polls = 0
    this.update({ ...this.clearInspection(), run: null, accepted: null, warnings: [], selectedOptionId: null, pollStopped: false })
    return this.refresh()
  }
  selectOption = (id: string | null) => {
    if (!this.state.run || isPending(this.state.run.status)) return
    if (id !== null && !this.state.run.result?.options.some((option) => option.option_id === id)) return
    this.update({ ...this.clearInspection(), selectedOptionId: id })
  }
  private async inspect(task: (storeId: string, runId: string, signal: AbortSignal) => Promise<void>,area:NonNullable<PlanningState['inspectionArea']>) {
    if (this.state.detailBusy || !this.state.run || isPending(this.state.run.status)) return
    const epoch = ++this.inspectionEpoch
    const controller = new AbortController()
    this.inspectionController?.abort()
    this.inspectionController = controller
    this.update({ detailBusy: true, inspectionArea:area, inspectionError: null })
    try { await task(this.authorize('planning.result.read'), this.state.run.run_id, controller.signal) }
    catch (error) {
      if (epoch === this.inspectionEpoch && !controller.signal.aborted)
        this.update({ ...(error instanceof HttpError&&(error.kind==='transport'||error.kind==='contract'&&(error.status??0)>=500)?{}:this.clearInspection()), inspectionArea:area, inspectionError: describePlanningError(error) })
    } finally {
      if (epoch === this.inspectionEpoch && !controller.signal.aborted) this.update({ detailBusy: false })
    }
  }
  private pin(digest: string | null, version?: string) {
    if (this.inspectionPin && (this.inspectionPin.digest !== digest ||
      version !== undefined && this.inspectionPin.version !== null && this.inspectionPin.version !== version))
      throw new Error('Chi tiết không cùng snapshot kết quả; cần đọc lại kế hoạch và bắt đầu từ trang đầu.')
    this.inspectionPin = { digest, version: version ?? this.inspectionPin?.version ?? null }
  }
  loadIngredients = (cursor?: string) => this.inspect(async (storeId, runId, signal) => {
    if (cursor && cursor !== this.state.nextIngredientCursor) throw new Error('Cursor không thuộc trang kế tiếp đang đọc.')
    const optionId = this.state.selectedOptionId ?? undefined
    const response = await this.source.ingredients(storeId, runId, { optionId, cursor }, signal)
    if (signal.aborted) return
    this.pin(response.data.result_digest, response.meta.response_version)
    const pagination = response.meta.pagination
    if (!pagination) throw new Error('Thiếu metadata phân trang nguyên liệu.')
    const previous = cursor ? this.state.ingredients : null
    const items = [...(previous?.items ?? []), ...response.data.items]
    if (cursor && (!previous || this.state.ingredientsTotal !== pagination.total_count || previous.selected_option_id !== response.data.selected_option_id) ||
      new Set(items.map((item) => item.ingredient_id)).size !== items.length ||
      pagination.total_count !== null && (items.length > pagination.total_count || !pagination.next_cursor && items.length !== pagination.total_count) ||
      cursor && pagination.next_cursor === cursor)
      throw new Error('Trang nguyên liệu không nhất quán; không trộn snapshots hoặc bỏ qua dòng trùng.')
    this.update({ ingredients: { ...response.data, items }, nextIngredientCursor: pagination.next_cursor,
      ingredientsTotal: pagination.total_count })
  },'ingredients')
  loadIngredient = (id: string) => this.inspect(async (storeId, runId, signal) => {
    const inspected = this.state.run?.result?.options.find((option) => option.option_id ===
      (this.state.selectedOptionId ?? this.state.run?.result?.winner_option_id))
    const located = this.state.ingredients?.items.some((item) => item.ingredient_id === id && item.detail_available) ||
      inspected?.purchases.some((purchase) => purchase.ingredient_id === id) ||
      inspected?.ingredient_balances.some((balance) => balance.ingredient_id === id)
    if (!located) throw new Error('Nguyên liệu không thuộc navigator hoặc phương án đã đọc. Máy chủ vẫn kiểm phạm vi computed scope.')
    const response = await this.source.ingredient(storeId, runId, id, this.state.selectedOptionId ?? undefined, signal)
    if (signal.aborted) return
    this.pin(response.data.result_digest, response.meta.response_version)
    this.update({ ingredient: response.data })
  },'ingredient')
  loadReasons = () => this.inspect(async (storeId, runId, signal) => {
    const response = await this.source.reasons(storeId, runId, this.state.selectedOptionId ?? undefined, signal)
    if (signal.aborted) return
    this.pin(response.data.result_digest)
    this.update({ reasons: response.data })
  },'reasons')
  reset = () => {
    if (this.state.busy || this.pending) return false
    this.epoch += 1
    this.controller?.abort()
    this.readinessEpoch += 1
    this.readinessController?.abort()
    this.clearInspection()
    this.targetId = null
    this.polls = 0
    const context = this.state.context
    this.state = { ...initial(), context }
    this.listeners.forEach((listener) => listener())
    return true
  }
  dispose = () => {
    this.epoch += 1
    this.readinessEpoch += 1
    this.inspectionEpoch += 1
    this.controller?.abort()
    this.readinessController?.abort()
    this.inspectionController?.abort()
    // StrictMode can replay the mounting effects using this same instance.
    // Invalidate the old work first, then release its locks for a fresh read.
    this.state = { ...this.state, busy: false, readinessBusy: false, detailBusy: false }
    this.listeners.clear()
  }
}
