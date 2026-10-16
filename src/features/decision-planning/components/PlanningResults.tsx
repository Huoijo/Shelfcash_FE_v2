import { UnderConstructionButton } from '../../../shared/UnderConstruction'
import { useId, useRef, useState, type ReactNode } from 'react'
import { ActiveIndicator } from '../../../shared/motion/ActiveIndicator'
import { useContentReveal } from '../../../shared/motion/useContentReveal'
import type { PlanningIngredient, PlanningIngredients, PlanningReasons, PlanningRun } from '../planning.types'
import { formatPlanningDate, formatPlanningMoney, formatPlanningQuantity, planningStrategyLabels } from '../planning.format'
import { PlanningEngineReasons, PlanningIngredientPanel, PlanningNotifications, PlanningOptionFacts, PlanningPurchases } from './PlanningEvidence'
import './Planning.css'

export type PlanningResultsProps = {
  assistantAction?: ReactNode
  assistantWhy?: ReactNode
  exportAction?:ReactNode
  historical?:boolean
  run: PlanningRun
  ingredients?: PlanningIngredients | null
  ingredient?: PlanningIngredient | null
  reasons?: PlanningReasons | null
  selectedOptionId: string | null
  busy: boolean
  detailBusy: boolean
  error?: string | null
  ingredientsError?: string | null
  detailError?: string | null
  reasonsError?: string | null
  hasMoreIngredients?: boolean
  ingredientsTotal?: number | null
  initialTab?: 'overview' | 'ingredients' | 'strategies' | 'reasons'
  onSelectOption: (id: string | null) => void
  onLoadIngredients: () => void
  onMoreIngredients: () => void
  onSelectIngredient: (id: string) => void
  onLoadReasons: () => void
  onNewPlan: () => void
}

const tabs = [{ id: 'overview', label: 'Tổng quan' }, { id: 'ingredients', label: 'Nguyên liệu' }, { id: 'strategies', label: 'Phương án khác' }, { id: 'reasons', label: 'Lý do' }] as const
type Tab = typeof tabs[number]['id']

export function PlanningResults(props: PlanningResultsProps) {
  const { run, ingredients, ingredient, reasons, selectedOptionId, busy, detailBusy, error, onSelectOption,
    onLoadIngredients, onMoreIngredients, onSelectIngredient, onLoadReasons, onNewPlan } = props
  const prefix = useId()
  const [tab, setTab] = useState<Tab>(props.initialTab ?? 'overview')
  const panelRef = useContentReveal<HTMLElement>(tab)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const result = run.result
  const completedRecommendation = run.status === 'completed' && run.outcome === 'recommendation_available'
  const partialFailure = run.status === 'failed' && result?.completeness === 'partial'
  const winner = completedRecommendation || partialFailure
    ? result?.options.find((option) => option.option_id === result.winner_option_id) : undefined
  const selected = result?.options.find((option) => option.option_id === (selectedOptionId ?? result.winner_option_id))
  const nameFor = (id: string) => {
    const captured = ingredients?.items.find((item) => item.ingredient_id === id)
    return captured?.name_availability === 'captured' && captured.display_name !== null ? captured.display_name : id
  }
  const inspect = (id: string) => { setTab('ingredients'); onSelectIngredient(id) }
  function changeTab(next: Tab) { setTab(next); if (next === 'ingredients' && !ingredients) onLoadIngredients(); if(next==='reasons'&&!reasons)onLoadReasons() }

  return <main className="sc-proc-content" aria-labelledby={`${prefix}-title`} aria-busy={busy || undefined}>
    <header className="sc-proc-page-header"><div><h1 id={`${prefix}-title`}>Kế hoạch nhập</h1><p className="sc-proc-page-subtitle">{formatPlanningDate(run.request.forecast_start_date)} · 7 ngày · kết quả đã lưu</p></div><div className="sc-proc-header-actions">
      {props.assistantAction ?? <UnderConstructionButton feature="Hỏi AI" className="sc-proc-secondary-action">Hỏi AI</UnderConstructionButton>}{props.exportAction}
      <button type="button" className="sc-proc-text-action" disabled={busy} onClick={onNewPlan}>Thiết lập mới</button>
    </div></header>
    {props.historical&&<section className="sc-proc-retained-strip"><strong>Run lịch sử · chỉ đọc</strong><span>Kết quả lịch sử bất biến. Không tái dựng từ tồn kho, công thức hoặc ngân sách hiện tại.</span></section>}
    {run.status === 'failed' && <section className="sc-proc-warning" role="alert"><strong>Chạy kế hoạch thất bại.</strong><span>Dữ liệu một phần bên dưới chỉ để kiểm tra, không phải khuyến nghị đã hoàn tất.</span>{winner && <span>Phương án một phần được máy chủ xác minh và giữ lại; không đổi trạng thái thất bại của lần chạy.</span>}{props.assistantWhy}</section>}
    {run.status === 'completed' && !winner && <section className="sc-proc-warning" role="status"><strong>Đã hoàn tất — chưa có phương án đủ điều kiện.</strong><span>Kết quả: {run.outcome ?? 'Chưa đánh giá'}. Không tạo kế hoạch mua giả.</span>{props.assistantWhy}</section>}
    {['queued', 'running'].includes(run.status) && <p role="status">Máy chủ đang tính kế hoạch. Chưa có khuyến nghị hoàn tất.</p>}
    {error && <p className="sc-proc-warning" role="alert">{error}</p>}
    <div className="sc-proc-tabs" role="tablist" aria-label="Kế hoạch nhập">
      {tabs.map((item, index) => <button key={item.id} ref={(node) => { refs.current[index] = node }} type="button" role="tab"
        id={`${prefix}-tab-${item.id}`} aria-controls={`${prefix}-panel-${item.id}`} aria-selected={tab === item.id} tabIndex={tab === item.id ? 0 : -1}
        className={tab === item.id ? 'sc-proc-tab-active' : ''} onClick={() => changeTab(item.id)} onKeyDown={(event) => {
          const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null
          if (next === null) return
          event.preventDefault(); changeTab(tabs[next].id); refs.current[next]?.focus()
        }}>{tab === item.id && <ActiveIndicator id={`${prefix}-planning-tabs`} underline />}{item.label}</button>)}
      <UnderConstructionButton feature="Kịch bản giả định">Kịch bản giả định</UnderConstructionButton>
    </div>
    <section ref={panelRef} className="sc-proc-tab-panel" role="tabpanel" id={`${prefix}-panel-${tab}`} aria-labelledby={`${prefix}-tab-${tab}`} tabIndex={0}>
      {tab === 'overview' && <div className="sc-proc-overview">
        <div className="sc-proc-kpi-grid"><article className="sc-proc-kpi"><h2>Chi phí dự kiến</h2><strong>{formatPlanningMoney(winner?.costs.total, run.configuration.budget.currency)}</strong><span>{partialFailure && winner ? 'Phương án một phần đã lưu; lần chạy thất bại' : winner ? 'Tổng chi phí canonical của phương án được chọn' : 'Chưa có khuyến nghị hoàn tất'}</span></article>
          <article className="sc-proc-kpi"><h2>Cần nhập</h2><strong>Chưa biết</strong><span>{winner ? `${winner.purchases.length} dòng mua; chưa có tổng nguyên liệu toàn kế hoạch` : 'Chưa có tổng nguyên liệu toàn kế hoạch'}</span></article>
          <article className="sc-proc-kpi"><h2>Mức đáp ứng</h2><strong>Chưa đánh giá</strong><span>Không có tỷ lệ tổng; xem theo món và đường nhu cầu</span></article></div>
        <section className="sc-proc-priority-purchases"><header><h2>{partialFailure ? 'Dữ liệu mua hàng một phần' : 'Kế hoạch mua hàng'}</h2><span className="sc-proc-strategy-badge">{winner ? winner.source_strategies.map((strategy) => planningStrategyLabels[strategy]).join(' / ') : 'Chưa có chiến lược được chọn'}</span></header>
          {!!winner?.purchases.length && <ol>{winner.purchases.slice(0, 3).map((purchase, index) => <li key={`${purchase.supplier_term_id}-${purchase.ingredient_id}-${index}`}>
            <button className="sc-proc-purchase-row" type="button" disabled={busy || detailBusy} onClick={() => inspect(purchase.ingredient_id)}>
              <span className="sc-proc-purchase-rank" aria-label="Dòng">{index + 1}</span><strong className="planning-identity" title={purchase.ingredient_id}>{nameFor(purchase.ingredient_id) === purchase.ingredient_id ? `Nguyên liệu · …${purchase.ingredient_id.slice(-6)}` : nameFor(purchase.ingredient_id)}</strong>
              <span className="sc-proc-purchase-quantity">Mua {formatPlanningQuantity(purchase.quantity, purchase.unit)}</span><span className="sc-proc-purchase-cost">{formatPlanningMoney(purchase.purchase_outlay, run.configuration.budget.currency)}</span>
            </button>
          </li>)}</ol>}
          <details className="planning-purchase-details" open={!winner || winner.purchases.length === 0}><summary>Xem toàn bộ kế hoạch</summary>
            <PlanningPurchases option={winner} currency={run.configuration.budget.currency} nameFor={nameFor} onInspect={inspect} />
          </details>
        </section>
        <PlanningNotifications title="Lỗi thực thi" items={run.errors} /><PlanningNotifications title="Cảnh báo của kết quả" items={result?.warnings ?? []} action={props.assistantWhy} />
        <PlanningNotifications title="Cảnh báo dự báo" items={run.forecast?.warnings ?? []} />
        {run.scope && <details className="sc-proc-disclosure"><summary>Phạm vi món và dữ liệu bị loại</summary><p>Đã tính {run.scope.computed_count} / {run.scope.menu_count} món · Phạm vi {run.scope.coverage_status}.</p>
          <ul className="sc-proc-short-bullets">{run.scope.excluded_products.map((product, index) => <li key={`${product.product_id}-${product.code}-${index}`}><span>{product.message}</span> <code>{product.code}</code><small> · {product.product_id} · {product.field} · {product.affected_dates.map(formatPlanningDate).join(', ')}</small>{product.suggested_action && <p>{product.suggested_action}</p>}</li>)}</ul>
        </details>}
        {run.forecast && <details className="sc-proc-disclosure"><summary>Thông tin dự báo đã lưu</summary><p>{formatPlanningDate(run.forecast.start_date)} → {formatPlanningDate(run.forecast.end_date)} · {run.forecast.model_type} · Chất lượng: {run.forecast.quality_status}</p><p>Lịch sử đến {formatPlanningDate(run.forecast.history_end_date)}. Không có chuỗi lượng dự báo tổng để dựng biểu đồ tại đây.</p></details>}
        {run.operational_basis && <p className="sc-planning-note">Cơ sở vận hành: {run.operational_basis.kind} · Ngày chụp {formatPlanningDate(run.operational_basis.local_capture_date)} · {run.operational_basis.timezone}. Đây không phải tái tạo tồn kho lịch sử.</p>}
        <div className="sc-proc-overview-actions"><UnderConstructionButton feature="Draft PO" className="sc-proc-primary-cta">Tạo Draft PO</UnderConstructionButton>
          <button type="button" className="sc-proc-secondary-action" onClick={() => changeTab('strategies')}>Xem phương án khác</button>
          <button type="button" className="sc-proc-secondary-action" disabled={busy || detailBusy} onClick={()=>{setTab('reasons');onLoadReasons()}}>{detailBusy ? 'Đang đọc…' : 'Xem lý do từ engine'}</button></div>
        <details className="sc-proc-disclosure"><summary>Thông tin lần lập kế hoạch</summary><p className="sc-planning-note planning-run-identity">Lần chạy {run.run_id} · {run.status} · Bắt đầu {formatPlanningDate(run.request.forecast_start_date)} · Ngân sách đã chụp {formatPlanningMoney(run.configuration.budget.limit, run.configuration.budget.currency)}</p><p className="sc-planning-note">{props.assistantAction ? 'Kịch bản giả định chưa khả dụng.' : 'Hỏi AI và kịch bản giả định chưa khả dụng.'}</p></details>
        {props.reasonsError && <p role="alert">{props.reasonsError}</p>}
      </div>}
      {tab === 'ingredients' && <div className="sc-proc-ingredient-workspace">
        <section className="sc-proc-ingredient-navigator" aria-label="Nguyên liệu của lần chạy"><header><h2>Nguyên liệu</h2><p className="sc-planning-note">{selectedOptionId ? 'Đang kiểm tra phương án riêng; khuyến nghị gốc không đổi.' : 'Theo phương án được máy chủ chọn.'}</p>
          <button type="button" className="sc-proc-text-action" disabled={busy || detailBusy} onClick={onLoadIngredients}>Đọc lại danh sách</button></header>
          {props.ingredientsError && <p className="sc-proc-empty-state" role="alert">{props.ingredientsError}</p>}
          <ul className="sc-proc-ingredient-list">{ingredients?.items.map((item) => <li key={item.ingredient_id}><button type="button" className={`sc-proc-ingredient-row${ingredient?.ingredient_id === item.ingredient_id ? ' sc-proc-ingredient-selected' : ''}`}
            disabled={!item.detail_available || detailBusy || busy} aria-pressed={ingredient?.ingredient_id === item.ingredient_id} onClick={() => onSelectIngredient(item.ingredient_id)}>
            <strong className="planning-identity">{item.name_availability === 'captured' && item.display_name !== null ? item.display_name : item.ingredient_id}</strong><span>Mua: {formatPlanningQuantity(item.purchase_quantity, item.unit)}</span>
          </button></li>)}</ul>
          {!ingredients && <p className="sc-proc-empty-state" role="status">{detailBusy ? 'Đang đọc nguyên liệu…' : 'Chưa đọc danh sách nguyên liệu.'}</p>}
          {ingredients && <p className="sc-planning-note planning-page-count">Đã đọc {ingredients.items.length} · Tổng {props.ingredientsTotal ?? 'chưa biết'}</p>}
          {props.hasMoreIngredients && <button type="button" className="sc-proc-text-action planning-page-count" disabled={busy || detailBusy} onClick={onMoreIngredients}>Đọc thêm nguyên liệu</button>}
        </section>
        <div>{detailBusy && <p role="status">Đang đọc bằng chứng nguyên liệu…</p>}{props.detailError && <p role="alert">{props.detailError}</p>}
          {ingredient ? <PlanningIngredientPanel ingredient={ingredient} currency={run.configuration.budget.currency} /> : <p className="sc-proc-empty-state">Chọn nguyên liệu để xem bằng chứng đã lưu theo ngày.</p>}
        </div>
      </div>}
      {tab === 'strategies' && <div className="sc-proc-strategies">
        <p className="sc-planning-note">Chọn thẻ chỉ để kiểm tra dữ liệu đã lưu, không đổi chiến lược hoặc chạy lại. Nhiều chiến lược có thể trỏ cùng một phương án.</p>
        <div className="sc-proc-strategy-grid" role="group" aria-label="Các chiến lược do máy chủ trả về">{result?.strategies.map((strategy) => {
          const option = result.options.find((item) => item.option_id === strategy.option_id)
          return <button key={strategy.strategy} type="button" className={`sc-proc-strategy-card${selected?.option_id === strategy.option_id ? ' sc-proc-strategy-selected' : ''}`}
            aria-pressed={!!option && selected?.option_id === option.option_id} disabled={!option || busy || detailBusy} onClick={() => onSelectOption(strategy.option_id)}>
            <header><h2>{planningStrategyLabels[strategy.strategy]}</h2>{winner && strategy.option_id === winner.option_id && <span className="sc-proc-status">{partialFailure ? 'Giữ lại một phần' : 'Được chọn'}</span>}</header>
            <dl><div><dt>Chi phí dự kiến</dt><dd>{formatPlanningMoney(option?.costs.total, run.configuration.budget.currency)}</dd></div><div><dt>Thực thi</dt><dd>{strategy.execution}</dd></div><div><dt>Đường xây dựng</dt><dd>{strategy.construction_path}</dd></div><div><dt>Yêu cầu khách hàng</dt><dd>{strategy.customer_feasibility}</dd></div></dl>
          </button>
        })}</div>
        {selectedOptionId && <button type="button" className="sc-proc-text-action" disabled={busy || detailBusy} onClick={() => onSelectOption(null)}>Trở về phương án được chọn</button>}
        {selected && <><PlanningOptionFacts option={selected} run={run} /><PlanningPurchases option={selected} currency={run.configuration.budget.currency} nameFor={nameFor} onInspect={inspect} /></>}
        {!result?.strategies.length && <p>Chưa có dữ liệu so sánh chiến lược.</p>}
      </div>}
      {tab==='reasons'&&<section className="sc-proc-reasons-section"><h2>Lý do lựa chọn phương án</h2><p className="sc-planning-note">Bằng chứng của lần chạy đã lưu, độc lập với dữ liệu cửa hàng hiện tại.</p>{props.reasonsError&&<p className="sc-proc-warning" role="alert">{props.reasonsError}</p>}{detailBusy&&<p role="status">Đang tải lý do…</p>}{reasons?<PlanningEngineReasons reasons={reasons}/>:<p>Chưa đọc được bằng chứng lựa chọn. Các phần đã tải vẫn có thể xem.</p>}<button type="button" className="sc-proc-secondary-action" disabled={busy||detailBusy} onClick={onLoadReasons}>Thử lại lý do từ engine</button></section>}
    </section>
  </main>
}
