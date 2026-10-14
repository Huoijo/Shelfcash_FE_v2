import { useEffect, useRef } from 'react'
import type { ImportBatchState, ImportBatchWorkflow } from '../importData.workflow'
import type { ImportFlowState, ImportFlowWorkflow } from '../importFlow.workflow'
import { analyzeAssessment, experienceStep, type ImportRole, type ImportScreen } from '../importExperience'
import {ImportSourceContext} from './ImportSourceContext'
import {ImportStatus} from './ImportStatus'
import { DebugValue } from '../../../shared/debug/DevelopmentTools'
import { importMessage, reportLabel, sourceLabel, sourceScopeLabel } from '../importPresentation'

export function ImportStepper({ role, screen }: { role: ImportRole; screen: ImportScreen }) {
  const steps = role === 'OWNER' ? [['File', 'Tải dữ liệu'], ['Phân tích', 'Đọc nguồn'], ['Kiểm tra', 'Cách hiểu'], ['Duyệt profile', 'Reusable'], ['Nhập dữ liệu', 'Preview & commit'], ['Hoàn tất', 'Readiness']] :
    [['File', 'Tải dữ liệu'], ['Phân tích', 'Đọc nguồn'], ['Kiểm tra', 'Cách hiểu'], ['Xem trước', 'Read-only'], ['Xác nhận', 'Commit'], ['Hoàn tất', 'Readiness']]
  const active = experienceStep(role, screen)
  const stepsRef = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const list = stepsRef.current, current = list?.querySelector<HTMLElement>('[aria-current=step]')
    if (list && current && list.scrollWidth > list.clientWidth) list.scrollLeft += current.getBoundingClientRect().left - list.getBoundingClientRect().left - (list.clientWidth - current.clientWidth) / 2
  }, [active, role])
  return <ol ref={stepsRef} className="input-steps" aria-label="Tiến trình nhập dữ liệu 6 bước">{steps.map(([title, copy], index) => <li key={title} aria-current={index + 1 === active ? 'step' : undefined} className={index + 1 === active ? 'current' : index + 1 < active ? 'complete' : ''}><span>{index + 1 < active ? '✓' : index + 1}</span><div><strong>{title}</strong><small>{copy}</small></div></li>)}</ol>
}

export function ImportSource({ state, flow, storeName, status }: { state: ImportBatchState; flow: ImportFlowState; storeName: string; status: string }) {
  const contexts = flow.summary?.profile_proposals.flatMap(p => p.spec ? [p.spec.scope] : []) ?? []
  const approved = flow.summary?.approved_profiles.flatMap(p => p.spec ? [p.spec.scope] : []) ?? []
  const sources = [...new Set([...contexts, ...approved, ...(flow.summary?.approved_contexts ?? [])].map(scope => sourceScopeLabel(scope)))]
  return <dl className="input-source"><div><dt>Store</dt><dd>{storeName}</dd></div><div><dt>File</dt><dd>{state.batch?.file_count ?? state.files.length} file{flow.summary ? ` · ${flow.summary.sheets.length} sheets` : ''}</dd></div><div><dt>Nguồn</dt><dd>{sources.join(', ') || (flow.summary?.binding_refs.length ? 'Cách đọc đã duyệt' : 'Chưa xác nhận')}</dd></div><div><dt>Trạng thái</dt><dd>{status}</dd></div></dl>
}

export function ImportAnalyze({ state, flowState, workflow, flow, onContinue, role, canPropose = false }: { canPropose?:boolean; role: ImportRole; state: ImportBatchState; flowState: ImportFlowState; workflow: ImportBatchWorkflow; flow: ImportFlowWorkflow; onContinue: () => void }) {
  const running = state.processing || state.batch?.status === 'analyzing' || !!state.batch?.active_job_id
  const failed = state.batch?.status === 'failed'
  const assessment = analyzeAssessment(state, flowState)
  const messages = {
    queued: ['Phân tích dữ liệu', 'ShelfCash đang đọc cấu trúc, nguồn và profile phù hợp. Không có dữ liệu nào được ghi.'],
    running: ['Phân tích dữ liệu', 'ShelfCash đang đọc cấu trúc, nguồn và profile phù hợp. Không có dữ liệu nào được ghi.'],
    failed: ['Không thể phân tích dữ liệu', 'Giữ nguyên file đã tải và thử lại.'],
    source_required: ['Cần xác nhận nguồn dữ liệu', 'ShelfCash không dùng tên file làm bằng chứng về nguồn.'],
    profile_ambiguous: ['Tìm thấy nhiều cách đọc phù hợp', 'ShelfCash không tự chọn khi có nhiều profile tương thích.'],
    profile_drift: ['Cấu trúc nguồn đã thay đổi', 'Một số header khác profile đã duyệt; cần kiểm tra trước khi tái sử dụng.'],
    profile_retired: ['Profile phù hợp đã ngừng sử dụng', 'Không tự động dùng profile đã retired.'],
    provider_unavailable: ['Không thể dùng gợi ý tự động', 'Bạn vẫn có thể tiếp tục xử lý thủ công.'],
    no_profile: [role === 'OWNER' ? 'Chưa có profile phù hợp' : 'Chưa có cách đọc đã được duyệt', role === 'OWNER' ? 'Owner có thể tiếp tục sang bước kiểm tra cách hiểu để tạo profile mới.' : 'Tiếp tục sang Step 3 để xử lý thủ công. Đây không phải lỗi kỹ thuật.'],
    complete: ['Phân tích hoàn tất', 'ShelfCash đang đọc cấu trúc, nguồn và profile phù hợp. Không có dữ liệu nào được ghi.'],
  } as const
  const summary = flowState.summary
  const scope = summary?.profile_proposals[0]?.spec?.scope ?? summary?.approved_profiles[0]?.spec?.scope ?? summary?.approved_contexts[0]
  const normalAnalysis = running || assessment === 'complete'
  // Completion is based on the retained server summary, never prototype timers.
  const stages: [string, boolean][] = role === 'OWNER' ? [
    ['Đã đọc cấu trúc file', !!summary], ['Đã nhận diện sheets', !!summary],
    ['Kiểm tra nguồn báo cáo', !!summary?.can_preview], ['Tìm cách đọc phù hợp', !!summary?.binding_refs.length],
  ] : [
    ['Đã đọc file', !!summary], ['Đã nhận diện sheets', !!summary], ['Kiểm tra cấu trúc', !!summary],
    ['Kiểm tra nguồn báo cáo', !!summary?.can_preview], ['Tìm profile phù hợp', !!summary?.binding_refs.length],
  ]
  const sourceIssue=flowState.queue?.items.find(issue=>issue.issue_type==='source_context'&&!['resolved','auto_mapped'].includes(issue.status))
  if(assessment==='source_required'&&sourceIssue&&summary)return <ImportSourceContext state={flowState} flow={flow} issue={sourceIssue} canPropose={canPropose} onContinue={onContinue}/>
  const diagnostic = summary?.sheets.filter(sheet => sheet.suggestion_diagnostic)
  return <section className="input-panel" aria-label="Phân tích dữ liệu" aria-busy={running}>
    <header className="input-section-title"><small>Bước 2/6 · Phân tích</small><h2>{messages[assessment][0]}</h2><p>{messages[assessment][1]}</p></header>
    {normalAnalysis && <div className="input-progress-list" aria-label="Tiến độ phân tích">{stages.map(([label, done]) => <div key={label}><span aria-hidden="true">{done ? '✓' : '•'}</span><strong>{label}</strong><small>{done ? 'Hoàn tất' : running ? 'Đang xử lý' : 'Cần xác nhận'}</small></div>)}</div>}
    {!normalAnalysis && <ImportStatus kind={failed?'error':'warn'} title={messages[assessment][0]} copy={messages[assessment][1]}/>}
    {summary && assessment === 'complete' && <div className={`input-readout ${role === 'OWNER' ? 'input-analysis-readout' : ''}`}>
      {role === 'STAFF' && <><div><span>Sheets</span><strong>{summary.sheets.length}</strong></div><div><span>Rows</span><strong>{summary.sheets.reduce((n, sheet) => n + sheet.row_count, 0)}</strong></div></>}
      <div><span>{role === 'OWNER' ? 'Nguồn' : 'Source context'}</span><strong>{scope ? role === 'OWNER' ? sourceLabel(scope.source_system_key) : sourceScopeLabel(scope) : 'Chưa xác nhận'}</strong></div>
      {role === 'OWNER' && <div><span>Loại báo cáo</span><strong>{scope ? reportLabel(scope.report_type) : 'Chưa xác nhận'}</strong></div>}
      <div><span>{role === 'OWNER' ? 'Profile candidate' : 'Compatible profile'}</span><strong>{summary.binding_refs.length ? 'Đã duyệt' : 'Chưa có profile phù hợp'}</strong></div>
    </div>}

    {summary?.warnings.filter(warning => !['PROFILE_STRUCTURE_OR_SEMANTICS_DRIFT','PROFILE_MATCH_AMBIGUOUS'].includes(warning.code)).map((warning, i) => <p className="input-status" key={warning.code + i}>{importMessage(warning.code, warning.message)}</p>)}
    <DebugValue label="Analyze diagnostics" value={{job: flowState.job, sheets: diagnostic, blockers: summary?.blockers}} />
    {flowState.error && <div className="input-status" role="alert"><p>{importMessage(flowState.fault?.code ?? '', flowState.error)}</p><button disabled={state.busy || state.processing || flowState.busy} onClick={() => { void workflow.refresh().then(() => flow.refresh()) }}>Đọc lại trạng thái</button></div>}
    <footer className="input-actions">{failed ? <button disabled={state.busy || state.processing || flowState.busy || !state.sealedLocked&&!state.batch?.allowed_actions.includes('analyze')} onClick={() => { if(state.sealedLocked)void workflow.refresh().then(()=>flow.refresh());else void workflow.process() }}>{state.sealedLocked?'Đọc lại trạng thái':'Thử phân tích lại'}</button> : <button className="input-primary" disabled={running || !summary || flowState.busy || !!flowState.retryOperation || !state.fresh} onClick={onContinue}>{assessment === 'provider_unavailable' ? 'Tiếp tục thủ công' : 'Kiểm tra cách hiểu'}</button>}<DebugValue label="Analyze state" value={{assessment,failed,running}} /></footer>
  </section>
}
