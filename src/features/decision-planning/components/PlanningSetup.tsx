import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import type { PlanningContext, PlanningReadiness, PlanningRequest } from '../planning.types'
import { buildPlanningSetupRequest, defaultPlanningCutoff, formatPlanningDate, formatPlanningMoney, parsePlanningBudget, planningStrategyLabels, shiftPlanningDate } from '../planning.format'
import './Planning.css'

export type PlanningSetupProps = {
  context: PlanningContext
  busy: boolean
  canCreate: boolean
  canCreateReason?: string
  onCreate: (request: PlanningRequest) => void
  onAssessDate: (forecastStartDate: string) => void
  readiness?: PlanningReadiness | null
  readinessDate?: string | null
  readinessBusy?: boolean
  readinessError?: string | null
}

export function PlanningSetup({ context, busy, canCreate, canCreateReason, onCreate, onAssessDate,
  readiness, readinessDate, readinessBusy, readinessError }: PlanningSetupProps) {
  const prefix = useId()
  const [cutoff, setCutoff] = useState(() => defaultPlanningCutoff(context))
  const [budget, setBudget] = useState('')
  const start = shiftPlanningDate(cutoff, 1)
  const request = buildPlanningSetupRequest(context, cutoff, budget)
  const action = readiness?.actions.find((item) => item.action === 'planning')
  const assessed = !!start && readinessDate === start && readiness?.evaluated_forecast_start_date === start
  const ready = assessed && action?.can_execute === true && action.availability === 'ready' && action.execution_status === 'available' && action.blockers.length === 0
  const canSubmit = canCreate && context.capabilities.winner_selection && !!request && ready && !busy && !readinessBusy
  const invalidBudget = budget.trim() !== '' && parsePlanningBudget(budget) === null

  useEffect(() => { if (start) onAssessDate(start) }, [start, onAssessDate])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (canSubmit && request) onCreate(request)
  }

  return <main className="sc-planning-content" aria-labelledby={`${prefix}-title`}>
    <h1 id={`${prefix}-title`}>Kế hoạch nhập</h1>
    <form onSubmit={submit} noValidate>
      <section className="sc-planning-setup-card" aria-label="Thiết lập kế hoạch nhập" aria-busy={busy || undefined}>
        <div className="sc-planning-main-fields">
          <label className="sc-planning-field" htmlFor={`${prefix}-date`}><span>Dữ liệu tính đến ngày</span>
            <input id={`${prefix}-date`} type="date" required value={cutoff} disabled={busy} aria-invalid={!start || undefined}
              onChange={(event) => setCutoff(event.target.value)} aria-describedby={`${prefix}-dates`} />
          </label>
          <label className="sc-planning-field" htmlFor={`${prefix}-horizon`}><span>Lập kế hoạch cho</span>
            <select id={`${prefix}-horizon`} value="7" disabled><option value="7">7 ngày</option></select>
          </label>
          <label className="sc-planning-field" htmlFor={`${prefix}-budget`}><span>Ngân sách nhập hàng</span>
            <div className="sc-planning-currency-control" data-invalid={invalidBudget || undefined}>
              <input id={`${prefix}-budget`} type="text" inputMode="decimal" autoComplete="off" spellCheck={false} value={budget} disabled={busy}
                placeholder="Để trống: dùng cấu hình hiện hành" aria-invalid={invalidBudget || undefined} aria-describedby={`${prefix}-budget-note`}
                onChange={(event) => setBudget(event.target.value)} /><span>{context.currency}</span>
            </div>
          </label>
        </div>
        <fieldset className="sc-planning-priority" aria-describedby={`${prefix}-priority-note`}>
          <legend>Ưu tiên</legend><div className="sc-planning-priority-options">
            {(['lean', 'balanced', 'protected'] as const).map((strategy) => <label key={strategy} className="sc-planning-priority-option">
              <input type="radio" name={`${prefix}-priority`} value={strategy} checked={false} disabled readOnly /><span>{planningStrategyLabels[strategy]}</span>
            </label>)}
          </div><p id={`${prefix}-priority-note`} className="sc-planning-note">Ưu tiên được xác định khi lập kế hoạch. Chưa hỗ trợ chọn thủ công.</p>
        </fieldset>
        <div><label className="sc-planning-open-orders"><input type="checkbox" checked={false} disabled readOnly aria-describedby={`${prefix}-po-note`} /><span>Tính cả đơn hàng đang chờ</span></label>
          <p id={`${prefix}-po-note`} className="sc-planning-note">Chưa hỗ trợ tính đơn hàng đang chờ.</p></div>
        <details className="sc-planning-advanced"><summary>Cài đặt nâng cao <span aria-hidden="true">⌄</span></summary>
          <div className="sc-planning-advanced-controls">
            <label className="sc-planning-field"><span>Phương pháp tính</span><select disabled value="standard"><option value="standard">Tiêu chuẩn</option><option value="scenarios">Theo kịch bản — chưa hỗ trợ</option></select></label>
            <label className="sc-planning-field"><span>Mức độ mô phỏng</span><select disabled value="unavailable"><option value="unavailable">Chưa hỗ trợ</option></select></label>
            <p className="sc-planning-note">Các tùy chọn nâng cao chưa khả dụng.</p>
          </div>
          <p id={`${prefix}-dates`} className="sc-planning-note">{start ? `Kế hoạch từ ${formatPlanningDate(start)} đến ${formatPlanningDate(shiftPlanningDate(start, 6))} · ${context.timezone}.` : 'Chọn ngày lịch hợp lệ.'} Chỉ hỗ trợ 7 ngày.</p>
          <p id={`${prefix}-budget-note`} className="sc-planning-note">Ngân sách hiện hành: {formatPlanningMoney(context.default_requirements?.budget_limit ?? context.budget_ceiling?.amount, context.currency)}. Trần: {formatPlanningMoney(context.budget_ceiling?.amount, context.currency)}. Có thể nhập 0 hoặc 50,000,000; dấu chấm là phần thập phân. Chỉ thay ngân sách của lần chạy, giữ nguyên đầy đủ yêu cầu phục vụ.</p>
        </details>
        <div className="sc-planning-assessment" aria-live="polite">
          {readinessBusy && <p role="status">Đang kiểm tra khả năng lập kế hoạch cho ngày đã chọn…</p>}
          {readinessError && <p role="alert">{readinessError}</p>}
          {canCreateReason && <p>{canCreateReason}</p>}
          {!context.capabilities.winner_selection && <p>Backend hiện chưa cho phép chọn phương án kế hoạch; chưa thể tạo lần chạy từ màn hình này.</p>}
          {!request && <p>Ngày, ngân sách hoặc cấu hình yêu cầu chưa hợp lệ/khả dụng. Ngân sách không được vượt trần hiện hành.</p>}
          {assessed && action && <>
            {action.blockers.map((issue, index) => <p key={`${issue.code}-${index}`}>Chặn: <code>{issue.code}</code> · {issue.source} · {issue.scope}</p>)}
            {action.warnings.map((issue, index) => <p key={`${issue.code}-${index}`}>Cảnh báo: <code>{issue.code}</code> · {issue.source} · {issue.scope}</p>)}
          </>}
        </div>
        <footer className="sc-planning-actions"><span className="sc-planning-ready-status" role="status">{canSubmit ? 'Sẵn sàng lập kế hoạch' : busy ? 'Đang tạo kế hoạch…' : 'Chưa sẵn sàng lập kế hoạch'}</span>
          <button className="sc-planning-primary-cta" type="submit" disabled={!canSubmit}>Tạo kế hoạch nhập hàng</button>
        </footer>
      </section>
    </form>
  </main>
}
