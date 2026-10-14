import { DebugValue } from '../../../shared/debug/DevelopmentTools'
import { importMessage } from '../importPresentation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { config } from '../../../app/config'
import { useCurrentStore } from '../../store/store.context'
import { createPlanningDataSource } from '../../decision-planning/planning.data'
import { createMockPlanningDataSource } from '../../decision-planning/planning.fixtures'
import type { PlanningReadiness } from '../../decision-planning/planning.types'
import { shiftPlanningDate } from '../../decision-planning/planning.validation'

type Assessment = { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string } | { status: 'loaded'; value: PlanningReadiness }

/** R01 is action/date scoped. Never interpret I06's retained import/menu/inventory checks as planning readiness. */
export function ImportReadiness({preview}:{preview?:PlanningReadiness} = {}) {
  const { state: storeState, currentStoreId } = useCurrentStore()
  const store = storeState.status === 'ready' || storeState.status === 'mock_preview' ? storeState.store : null
  const [date, setDate] = useState(() => store ? shiftPlanningDate(store.as_of_date, 1) ?? '' : '')
  const [record, setRecord] = useState<{ key: string; assessment: Assessment } | null>(null)
  const abort = useRef<AbortController | null>(null)
  const source = useMemo(() => createPlanningDataSource({ dataSource: config.dataSource, apiBaseUrl: config.apiBaseUrl,
    ...(config.mockPreview ? { mockSource: createMockPlanningDataSource() } : {}) }), [])
  const canRead = !!preview || store?.membership.effective_permissions.includes('planning.context.read') === true
  const authorization = store?.membership.authorization_version
  const assessmentKey = `${currentStoreId}:${date}:${authorization}`
  const assessment: Assessment = record?.key === assessmentKey ? record.assessment : preview ? {status:'loaded',value:preview} : { status: 'idle' }
  const setAssessment = (next: Assessment) => setRecord({ key: assessmentKey, assessment: next })
  useEffect(() => () => { abort.current?.abort() }, [assessmentKey])
  const assess = async () => {
    if (!canRead || !currentStoreId || !date || assessment.status === 'loading') return
    if(preview){setAssessment({status:'loaded',value:{...preview,evaluated_forecast_start_date:date}});return}
    const controller = new AbortController(); abort.current?.abort(); abort.current = controller
    setAssessment({ status: 'loading' })
    try { const response = await source.readiness(currentStoreId, date, controller.signal)
      if (!controller.signal.aborted) setAssessment({ status: 'loaded', value: response.data })
    } catch (error) { if (!controller.signal.aborted) setAssessment({ status: 'error', message: error instanceof Error ? error.message : 'Không đọc được Readiness.' }) }
  }
  const action = assessment.status === 'loaded' ? assessment.value.actions.find(a => a.action === 'planning') : null
  const ready = action?.availability === 'ready' && action.can_execute
  return <section className="input-readiness" aria-labelledby="import-planning-readiness">
    <header><div><small>Readiness</small><h2 id="import-planning-readiness">Khả năng lập kế hoạch</h2></div><span className="import-page__step">{assessment.status === 'loading' ? 'Đang kiểm tra' : action ? ready ? 'Đủ dữ liệu' : action.availability === 'blocked' ? 'Cần bổ sung' : 'Chưa xác định' : 'Chưa đánh giá'}</span></header>
    <label>Ngày bắt đầu kế hoạch<input type="date" value={date} disabled={assessment.status === 'loading'} onChange={event => setDate(event.target.value)} /></label>
    {!canRead && <p className="input-status">Bạn chưa có quyền xem đánh giá lập kế hoạch.</p>}
    <button className="input-primary" disabled={!canRead || !date || assessment.status === 'loading'} onClick={() => { void assess() }}>{assessment.status === 'loading' ? 'Đang kiểm tra…' : 'Kiểm tra Readiness'}</button>
    {assessment.status === 'error' && <p className="input-status" role="alert">Chưa kiểm tra được khả năng lập kế hoạch. Vui lòng thử lại.</p>}
    {assessment.status === 'loaded' && <div role="status"><p>{ready ? 'Đủ dữ liệu cho hành động tiếp theo' : 'Còn dữ liệu cần bổ sung'}</p><DebugValue label="Readiness assessment" value={assessment} />
      {[...(action?.blockers ?? []).map(issue => ({ issue, kind: 'Cần bổ sung' })), ...(action?.warnings ?? []).map(issue => ({ issue, kind: 'Cảnh báo' }))].map(({ issue, kind }, i) => <article className="input-status" key={issue.code + i}><strong>{kind}: {importMessage(issue.code)}</strong><DebugValue label="Readiness issue" value={issue} />{issue.source === 'sales' ? <Link to="/imports">Nhập thêm dữ liệu</Link> : issue.source === 'inventory' ? <Link to="/inventory">Xem Kho</Link> : issue.source === 'recipe' ? <Link to="/menu">Xem Menu</Link> : null}</article>)}
    </div>}
    <footer className="input-actions"><Link to="/imports/history">Hoàn tất</Link>{canRead && <Link to="/forecast/planning">{ready ? 'Đi tới Dự đoán' : 'Xem điều kiện và thiết lập kế hoạch'}</Link>}</footer>
  </section>
}
