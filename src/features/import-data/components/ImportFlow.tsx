import { useEffect, useRef } from 'react'
import { useContentReveal } from '../../../shared/motion/useContentReveal'
import type { ImportFlowState, ImportFlowTab, ImportFlowWorkflow } from '../importFlow.workflow'
import type { MappingStatus } from '../importFlow.types'
import { ImportMapping, ImportProfileReview, Evidence } from './ImportMapping'
import { ImportPreview } from './ImportPreview'
import { ImportResult } from './ImportResult'
import './ImportFlow.css'

export function ImportFlow({ state, workflow, parentBusy, parentStale, canDecideProfile, canProposeMapping }: { state: ImportFlowState; workflow: ImportFlowWorkflow; parentBusy: boolean; parentStale: boolean; canDecideProfile: boolean; canProposeMapping: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const flowRef = useContentReveal<HTMLElement>(state.tab)
  const lastTab = useRef(state.tab)
  useEffect(() => {
    if (lastTab.current !== state.tab) { heading.current?.focus(); lastTab.current = state.tab }
  }, [state.tab])
  const locked = parentBusy || parentStale || !!state.retryOperation
  const busy = state.busy || parentBusy
  useEffect(() => {
    if (state.tab === 'mapping' && !busy && !locked && !state.error) void workflow.loadVisibleOptions()
  }, [state.tab, state.queue, state.mappingOptions, state.error, busy, locked, workflow])
  const options = { ...state.mappingOptions, ...(state.options && (state.optionsMappingId || state.selectedSheetId) ? { [state.optionsMappingId ?? state.selectedSheetId!]: state.options } : {}) }
  const tabs: { key: ImportFlowTab; label: string; available: boolean }[] = [
    { key: 'mapping', label: '2. Ghép cột', available: !!state.summary },
    { key: 'review', label: '3. Xem lại', available: !!state.summary?.can_preview },
    { key: 'preview', label: '4. Xem trước / Ghi dữ liệu', available: !!state.preview || !!state.job && state.job.operation !== 'import_analyze' },
    { key: 'result', label: '5. Hoàn tất', available: !!state.completion },
  ]
  return <section ref={flowRef} className="import-flow" aria-labelledby="import-flow-title" aria-busy={busy}>
    <h2 ref={heading} id="import-flow-title" className="sr-only" tabIndex={-1}>{tabs.find((tab) => tab.key === state.tab)?.label}</h2>
    {state.error && <p className="import-flow__notice" role="alert">{state.error}</p>}
    <p role="status">{busy ? 'Đang đọc hoặc gửi yêu cầu… ' : ''}{state.notice}</p>
    {state.retryOperation && <div className="import-flow__notice"><p>Kết quả yêu cầu {state.retryOperation} chưa xác định. Không gửi yêu cầu mới; thử lại giữ nguyên key, nội dung và phiên bản đã gửi.</p><button type="button" disabled={busy} onClick={() => { void workflow.retry() }}>Đối chiếu và thử lại đúng yêu cầu</button></div>}
    {state.job && !['completed', 'failed'].includes(state.job.status) && <section className="import-flow__card" aria-label="Tiến trình máy chủ">
      <p role="status">Đang xử lý dữ liệu…</p><p>Tiến độ: {state.job.progress === null ? 'Chưa biết' : `${Math.round(state.job.progress * 100)}%`}</p>
      {state.job.error && <Evidence value={state.job.error} label="Chẩn đoán tiến trình thất bại" />}
    </section>}
    {state.job?.status === 'failed' && <div className="import-flow__notice" role="alert"><strong>Xử lý dữ liệu chưa thành công.</strong>{state.job.error && <Evidence value={state.job.error} label="Chi tiết lỗi xử lý" />}</div>}
    {state.tab === 'mapping' && (state.summary ? <>
      <ImportMapping summary={state.summary} queue={state.queue} selectedSheetId={state.selectedSheetId} filter={state.filter} reviewOnly={state.reviewOnly} options={options} busy={busy} locked={locked} canPropose={canProposeMapping && !state.batch?.active_job_id}
        onSelectSheet={(id) => { void workflow.selectSheet(id) }} onFilter={(filter, reviewOnly) => { void workflow.setFilter(filter as MappingStatus | 'all', reviewOnly) }}
        onLoadOptions={(id) => { void workflow.loadOptions(id) }} onLoadSheetOptions={(id) => { void workflow.loadSheetOptions(id) }}
        onConfirm={(id, target) => { void workflow.confirmMapping(id, target) }} onResolve={(id, resolution) => { void workflow.resolveMapping(id, resolution) }} onLoadMore={() => { void workflow.loadMoreMappings() }} />
      <div className="import-flow__footer"><p>{state.summary.progress.unresolved ? `${state.summary.progress.unresolved} mục cần xử lý trước khi tiếp tục.` : state.summary.can_preview ? 'Đã xử lý xong. Bạn có thể tiếp tục.' : 'Cần xử lý lỗi chặn hoặc chờ duyệt quy tắc ghép dữ liệu.'}</p><button type="button" className="import-flow__primary" disabled={busy || locked || !state.summary.can_preview} onClick={() => workflow.setTab('review')}>Tiếp tục</button></div>
    </> : <p>Chưa có tóm tắt ghép cột. Đợi phân tích hoàn tất hoặc đọc lại bước xử lý; không có dữ liệu minh họa thay thế khi API lỗi.</p>)}
    {state.summary && ['mapping', 'review'].includes(state.tab) && <>
      {!!state.summary.blockers.length && <Evidence value={state.summary.blockers} label="Lỗi chặn toàn lô" />}
      <Evidence value={{ binding_refs: state.summary.binding_refs, approved_contexts: state.summary.approved_contexts }} label="Bindings và ngữ cảnh đã duyệt từ máy chủ" />
      {!!state.summary.profile_proposals.length && <details className="import-flow__profile-review" open><summary>Duyệt quy tắc ghép dữ liệu · {state.summary.profile_proposals.length} đề xuất</summary>
        <ImportProfileReview summary={state.summary} busy={busy} locked={locked} canDecide={canDecideProfile}
          onDecision={(id, revision, decision) => { void workflow.decideProfile(id, revision, decision) }} /></details>}
    </>}
    {state.tab === 'review' && state.summary && <section className="import-flow__card">
      <h3>Xem lại trước khi Preview</h3><p>{state.summary.progress.completed_fields} / {state.summary.progress.total_fields} mục được xử lý theo máy chủ; {state.summary.progress.unresolved} mục chưa xử lý.</p>
      <p>Preview sẽ ghim nguồn, mapping và policy hiện tại. Bước này không ghi dữ liệu.</p>
      <Evidence value={{ progress: state.summary.progress, mapping_revision: state.summary.mapping_revision, allowed_actions: state.summary.allowed_actions }} label="Trạng thái kiểm tra toàn lô" />
      <div className="import-flow__footer"><button type="button" disabled={busy || locked} onClick={() => workflow.setTab('mapping')}>Quay lại ghép cột</button><button type="button" className="import-flow__primary" disabled={busy || locked || !state.summary.can_preview || !!state.summary.blockers.length || !state.batch?.allowed_actions.some((action) => action === 'preview' || action === 'import.preview')} onClick={() => { void workflow.startPreview() }}>Tạo Preview</button></div>
    </section>}
    {state.tab === 'preview' && (state.preview ? <ImportPreview bundle={state.preview} busy={busy} locked={locked} blockers={state.commitBlockers} reason={state.commitReason} acknowledged={state.commitAcknowledged}
      reviewReason={state.reviewReason} reviewAcknowledged={state.reviewAcknowledged} reviewBlockers={state.reviewBlockers}
      onReviewReason={workflow.setReviewReason} onReviewAcknowledge={workflow.acknowledgeReview} onConfirmReview={() => { void workflow.confirmReview() }}
      resolutions={state.resolutions} supplierChanges={state.supplierChanges} onResolutions={workflow.setResolutions} onSupplierChanges={workflow.setSupplierChanges}
      onReason={workflow.setCommitReason} onAcknowledge={workflow.acknowledgeCommit} onLoadMore={() => { void workflow.loadMorePreview() }} onCommit={() => { void workflow.commit() }} /> : <p>Đang chờ snapshot Preview từ máy chủ. Yêu cầu được nhận chưa phải Import thành công.</p>)}
    {state.completion && state.tab !== 'result' && <p><button type="button" className="import-flow__primary" disabled={busy} onClick={() => workflow.setTab('result')}>Xem biên nhận hoàn tất</button></p>}
    {state.tab === 'result' && state.completion && <ImportResult completion={state.completion} />}
    <details className="import-flow__navigation"><summary>Các bước nhập dữ liệu</summary>
      <ol className="import-flow__steps" aria-label="Các bước sau phân tích">{tabs.map((tab) => <li key={tab.key}><button type="button" aria-current={state.tab === tab.key ? 'step' : undefined} disabled={!tab.available || busy || locked} onClick={() => workflow.setTab(tab.key)}>{tab.label}</button></li>)}</ol>
      <button type="button" disabled={busy} onClick={() => { void workflow.refresh() }}>Đọc lại bước xử lý</button>
    </details>
  </section>
}
