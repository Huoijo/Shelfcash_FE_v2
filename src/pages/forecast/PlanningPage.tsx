import { operationsSource } from '../../features/operations/operations.source'
import { PlanExport } from '../../features/operations/PlanExport'
import { mockPlanningSource } from '../../features/mock/mockSources'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Link, useSearchParams } from 'react-router'
import { config } from '../../app/config'
import { useCurrentStore } from '../../features/store/store.context'
import { AppShellHeader } from '../../layouts/app-shell/AppShell'
import { createPlanningDataSource } from '../../features/decision-planning/planning.data'
import { PlanningWorkflow } from '../../features/decision-planning/planning.workflow'
import type { PlanningRequest } from '../../features/decision-planning/planning.types'
import { PlanningLifecycle } from '../../features/decision-planning/components/PlanningLifecycle'
import { PlanningSetup } from '../../features/decision-planning/components/PlanningSetup'
import { PlanningResults } from '../../features/decision-planning/components/PlanningResults'
import { PlanningNotifications } from '../../features/decision-planning/components/PlanningEvidence'
import './PlanningPage.css'

const moneyRights = ['budget.read', 'procurement.cost.read']

export function PlanningPage() {
  const { currentStoreId } = useCurrentStore()
  const { state } = useCurrentStore()
  const version = state.status === 'ready' || state.status === 'mock_preview' ? state.store.authorization_version : ''
  return <ScopedPlanningPage key={`${currentStoreId}:${version}`} storeId={currentStoreId} />
}

function ScopedPlanningPage({ storeId }: { storeId: string | null }) {
  const { state: store } = useCurrentStore()
  const permissions = useMemo(() => store.status === 'ready' || store.status === 'mock_preview' ? store.store.membership.effective_permissions : [], [store])
  const canRead = ['planning.result.read', ...moneyRights].every((right) => permissions.includes(right))
  const canViewContext = ['planning.context.read', ...moneyRights].every((right) => permissions.includes(right))
  const hasCreateRights = ['planning.context.read', 'planning.run', 'planning.result.read', ...moneyRights]
    .every((right) => permissions.includes(right))
  const [params, setParams] = useSearchParams()
  const locator = params.get('plan_id')
  const [planningSource] = useState(() => createPlanningDataSource({
    dataSource: config.dataSource, apiBaseUrl: config.apiBaseUrl,
    ...(config.mockPreview ? { mockSource: mockPlanningSource } : {}),
  }))
  const [workflow] = useState(() => new PlanningWorkflow(planningSource, storeId, { permissions }))
  const state = useSyncExternalStore(workflow.subscribe, workflow.getSnapshot)
  const [submitted,setSubmitted]=useState<PlanningRequest|null>(null)
  const visit = useRef<{ locator: string | null; attempted: boolean }>({ locator: null, attempted: false })
  const loadedId = state.run?.run_id ?? state.accepted?.run_id
  const mismatch = locator !== null && locator !== loadedId

  useEffect(() => { workflow.setPermissions(permissions) }, [workflow, store, permissions])
  useEffect(() => {
    if (locator === null && !loadedId && !state.context) void workflow.loadContext()
  }, [workflow, locator, loadedId, state.context])
  useEffect(() => {
    if (visit.current.locator !== locator) visit.current = { locator, attempted: false }
    if (locator === null || locator === loadedId || state.busy || state.uncertain || visit.current.attempted) return
    visit.current.attempted = true
    void workflow.resume(locator)
  }, [locator, loadedId, state.busy, state.uncertain, workflow])
  useEffect(() => {
    // Publish durable acceptance immediately, but never overwrite an explicit
    // user locator with a previous Run while hydration is pending or failed.
    if (locator !== null || !state.accepted) return
    const next = new URLSearchParams(params)
    next.set('plan_id', state.accepted.run_id)
    setParams(next, { replace: true })
  }, [locator, state.accepted, params, setParams])
  useEffect(() => {
    if (mismatch || state.busy || state.pollAfterMs === null) return
    const timer = setTimeout(() => { void workflow.poll() }, state.pollAfterMs)
    return () => clearTimeout(timer)
  }, [workflow, mismatch, state.busy, state.pollAfterMs, state.run])
  useEffect(() => () => {
    visit.current.attempted = false
    workflow.dispose()
  }, [workflow])

  const newPlan = () => {
    if (state.busy || state.uncertain) return
    visit.current = { locator, attempted: true }
    if (!workflow.reset()) return
    setSubmitted(null)
    const next = new URLSearchParams(params)
    next.delete('plan_id')
    next.delete('export_id')
    next.delete('export_job_id')
    setParams(next, { replace: true })
    void workflow.loadContext()
  }
  const retryRead = () => {
    if (state.busy || state.uncertain) return
    if (locator !== null && locator !== loadedId) void workflow.resume(locator)
    else if (loadedId) void workflow.refresh()
    else void workflow.loadContext()
  }
  const creating = state.busy && state.phase === 'creating'
  const lifecycle=creating||state.uncertain||!!state.accepted&&!state.run||!!state.run&&['queued','running'].includes(state.run.status)
  const inspectIngredient = async (id: string) => {
    if (state.detailBusy || state.busy) return
    if (!state.ingredients) await workflow.loadIngredients()
    await workflow.loadIngredient(id)
  }

  return <>
    <AppShellHeader><nav className="sc-planning-breadcrumb" aria-label="Vị trí trong ShelfCash">
      <Link to="/forecast/planning">Dự đoán</Link><span aria-hidden="true">/</span><span aria-current="page">Kế hoạch nhập</span>
    </nav></AppShellHeader>
    {config.mockPreview && <p className="planning-page-notice" role="note">DEV/QA minh họa — dữ liệu cố định, không chạy dự báo hay ghi dữ liệu thật.</p>}
    <p className="planning-page-notice"><Link to="/forecast/planning/history">Lịch sử kế hoạch</Link></p>
    <section className="planning-page-feedback" aria-label="Trạng thái lập kế hoạch" aria-live="polite">
      {!canRead && <p role="alert">Cần quyền xem kết quả kế hoạch, ngân sách và giá mua của cửa hàng hiện tại. Không hiển thị kết quả cũ hoặc tự chuyển cửa hàng.</p>}
      {state.busy && !creating && <p role="status">Đang đọc trạng thái kế hoạch…</p>}

      {state.error && <p role="alert">{state.error}</p>}
      {mismatch && <p>Định danh trong URL chưa khớp kế hoạch đã đọc. Các thao tác trên kế hoạch cũ bị khóa.</p>}
      {state.uncertain && <><p>Chưa biết máy chủ đã nhận yêu cầu hay chưa. Thử lại dùng nguyên nội dung và Idempotency-Key. Không tạo intent mới; tải lại trang, rời màn hình, đổi cửa hàng hoặc đăng nhập lại sẽ mất intent đang giữ trong bộ nhớ.</p>
</>}
      {state.error && !state.uncertain && <button type="button" disabled={state.busy} onClick={retryRead}>Đọc lại trạng thái</button>}
      {state.pollStopped && <><p>Đã tạm dừng tự kiểm tra sau 60 lượt; máy chủ có thể vẫn đang xử lý. Không hủy hoặc tự chạy lại kế hoạch.</p>
</>}
      {canRead && !mismatch && state.run && ['queued', 'running'].includes(state.run.status) && <p role="status">Máy chủ: {state.run.status === 'queued' ? 'Đang chờ xử lý' : 'Đang tính toán'}. Run: <code>{state.run.run_id}</code>. Kết quả chưa sẵn sàng.</p>}
      {canRead && !mismatch && <PlanningNotifications title="Cảnh báo của lần đọc kế hoạch" items={state.warnings} />}
      {locator !== null && !state.uncertain && !state.busy && (mismatch || !state.run) && <button type="button" onClick={newPlan}>Bỏ định danh và thiết lập kế hoạch mới</button>}
    </section>
    {canRead&&!mismatch&&lifecycle&&<PlanningLifecycle creating={creating} uncertain={state.uncertain} run={state.run} accepted={state.accepted} request={submitted} long={state.pollStopped} busy={state.busy||state.uncertain&&!hasCreateRights} onCheck={()=>{if(state.uncertain)void workflow.retryCreate();else retryRead()}}/>}
    {canViewContext && locator === null && !loadedId && state.context && <div hidden={creating||state.uncertain}><PlanningSetup readContext={planningSource.context} operationsSource={operationsSource} permissions={permissions} context={state.context} busy={state.busy || state.uncertain}
      canCreate={hasCreateRights && !state.uncertain}
      canCreateReason={!hasCreateRights ? 'Thiếu quyền lập/xem kế hoạch hoặc xem ngân sách/giá mua.' : undefined}
      onCreate={(request) => { setSubmitted(structuredClone(request));void workflow.create(request) }} onAssessDate={workflow.assessDate}
      readiness={state.readiness} readinessDate={state.readinessDate} readinessRequestKey={state.readinessRequestKey} readinessBusy={state.readinessBusy} readinessError={state.readinessError} /></div>}
    {canRead && !mismatch && state.run && ['completed', 'failed'].includes(state.run.status) && <PlanningResults
      key={state.run.run_id} historical={params.get('historical')==='1'} exportAction={<PlanExport run={state.run} optionId={state.selectedOptionId}/>} run={state.run} ingredients={state.ingredients ?? undefined} ingredient={state.ingredient ?? undefined}
      reasons={state.reasons ?? undefined} selectedOptionId={state.selectedOptionId} busy={state.busy} detailBusy={state.detailBusy}
      ingredientsError={state.inspectionArea==='ingredients'?state.inspectionError:undefined} detailError={state.inspectionArea==='ingredient'?state.inspectionError:undefined} reasonsError={state.inspectionArea==='reasons'?state.inspectionError:undefined} hasMoreIngredients={state.nextIngredientCursor !== null} ingredientsTotal={state.ingredientsTotal}
      onSelectOption={workflow.selectOption} onLoadIngredients={() => { void workflow.loadIngredients() }}
      onMoreIngredients={() => { if (state.nextIngredientCursor) void workflow.loadIngredients(state.nextIngredientCursor) }}
      onSelectIngredient={(id) => { void inspectIngredient(id) }} onLoadReasons={() => { void workflow.loadReasons() }} onNewPlan={newPlan} />}
  </>
}
