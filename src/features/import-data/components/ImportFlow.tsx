import { DebugContent, DebugValue } from '../../../shared/debug/DevelopmentTools'
import { ImportBusinessFacts } from './ImportBusinessFacts'
import { config } from '../../../app/config'
import { ImportSubmissionLifecycle } from './ImportSubmissionLifecycle'
import { importMessage } from '../importPresentation'
import { Link } from 'react-router'
import { FlowDialog } from '../../../shared/flow/FlowDialog'
import { previewCanContinue, type ResolutionGroup, type ImportRole, type OwnerReviewState, type DevOwnerReviewGateway } from '../importExperience'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useContentReveal } from '../../../shared/motion/useContentReveal'
import type { ImportFlowState, ImportFlowTab, ImportFlowWorkflow } from '../importFlow.workflow'
import { ImportResolveOverview } from './ImportResolveOverview'
import { ImportResolveDrawer } from './ImportResolveDrawers'
import {ImportProcessing} from './ImportProcessing'
import {ImportMutationStatus} from './ImportMutationStatus'
import {ImportStatus} from './ImportStatus'
import { ImportActionBar } from './ImportActionBar'
import { ImportProfileReview } from './ImportMapping'
import { ImportPreview } from './ImportPreview'
import { ImportResult } from './ImportResult'
import './ImportFlow.css'

export function ImportFlow({ initialSheetId, initialEditor, initialSubmit, readinessPreview, onBackToAnalyze, state, workflow, parentBusy, parentStale, canDecideProfile, canProposeMapping, role, devOwnerReview }: { onBackToAnalyze?:()=>void; initialSheetId?: string; initialEditor?: ResolutionGroup; initialSubmit?: boolean; readinessPreview?: import('../../decision-planning/planning.types').PlanningReadiness; role: ImportRole; devOwnerReview?: DevOwnerReviewGateway; state: ImportFlowState; workflow: ImportFlowWorkflow; parentBusy: boolean; parentStale: boolean; canDecideProfile: boolean; canProposeMapping: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const scopedSheet = useRef<string | null>(null)
  useEffect(() => {
    if (!initialSheetId || !state.summary || state.busy || scopedSheet.current === initialSheetId || !state.summary.sheets.some(sheet => sheet.sheet_id === initialSheetId)) return
    scopedSheet.current = initialSheetId
    if (state.selectedSheetId !== initialSheetId) void workflow.selectSheet(initialSheetId)
  }, [initialSheetId, state.summary, state.busy, state.selectedSheetId, workflow])
  const flowRef = useContentReveal<HTMLElement>(state.tab)
  const lastTab = useRef(state.tab)
  const previousRetry=useRef(state.retryOperation)
  useEffect(() => {
    if (lastTab.current !== state.tab) { heading.current?.focus(); lastTab.current = state.tab }
  }, [state.tab])
  const [approval, setApproval] = useState<OwnerReviewState>({ status: 'idle' })
  const [category, setCategory] = useState<ResolutionGroup | null>(initialEditor ?? null)
  const [dismissedFault,setDismissedFault]=useState<ImportFlowState['fault']>(null)
  const [rejectedProfile,setRejectedProfile]=useState<string|null>(null)
  const [lastSaved,setLastSaved]=useState<ResolutionGroup|null>(null)
  const [submitOpen, setSubmitOpen] = useState(initialSubmit ?? false)
  const [approvalError, setApprovalError] = useState<string | null>(null)
  const [approvalBusy, setApprovalBusy] = useState(false)
  const [submissionGate, setSubmissionGate] = useState<{ importId: string; locked: boolean } | null>(null)
  const onSubmissionLock = useCallback((importId: string, locked: boolean) => setSubmissionGate(previous => previous?.importId === importId && previous.locked === locked ? previous : { importId, locked }), [])
  const refreshSubmission = useCallback(async () => { await workflow.refresh() }, [workflow])
  const apiSubmission = role === 'STAFF' && !config.mockPreview && !devOwnerReview
  const submissionLocked = apiSubmission && state.tab === 'mapping' && (submissionGate?.importId !== state.batch?.import_id || submissionGate?.locked)
  const locked = parentBusy || parentStale || !!state.retryOperation || approval.status === 'waiting' || approvalBusy || !!submissionLocked
  const approvalImportId = state.batch?.import_id
  useEffect(() => {
    if (!devOwnerReview || role !== 'STAFF' || !approvalImportId) return
    let current = true
    void devOwnerReview.read(approvalImportId).then(async next => {
      if (!current) return
      setApproval(next)
      if (next.status === 'approved') await workflow.refresh()
    }).catch(error => { if (current) setApprovalError(error instanceof Error ? error.message : 'Không đọc được nhánh duyệt DEV.') })
    return () => { current = false }
  }, [devOwnerReview, role, approvalImportId, workflow])
  const refreshApproval = useCallback(async () => {
    if (!devOwnerReview || !state.batch || approvalBusy) return
    setApprovalBusy(true)
    try {
      const next = await devOwnerReview.read(state.batch.import_id)
      setApproval(next); setApprovalError(null)
      if (next.status === 'approved' || next.status === 'rejected') await workflow.refresh()
    } catch (error) { setApprovalError(error instanceof Error ? error.message : 'Chưa đọc được quyết định. Ngữ cảnh vẫn được giữ.') }
    finally { setApprovalBusy(false) }
  }, [devOwnerReview, state.batch, approvalBusy, workflow])
  useEffect(() => {
    if (approval.status !== 'waiting' || approvalBusy || approvalError) return
    const timer = setTimeout(() => { void refreshApproval() }, 1000)
    return () => clearTimeout(timer)
  }, [approval, approvalBusy, approvalError, refreshApproval])
  useEffect(()=>{if(previousRetry.current&& !state.retryOperation && !state.error && state.notice.startsWith('Đã xác nhận cách hiểu')){setLastSaved(category);setCategory(null)}previousRetry.current=state.retryOperation},[state.retryOperation,state.error,state.notice,category])
  const busy = state.busy || parentBusy
  // A complete spec may include deterministic RULE candidates awaiting grouped approval.
  const hasReviewableProfile = state.summary?.profile_proposals.some(proposal => !!proposal.spec && !proposal.missing_fields.length)
  const previewBlocked = state.preview?.preview.summary.validation_status === 'blocked' || !!state.preview?.preview.summary.blockers.length
  const previewInvalid = state.previewStale || !!state.preview?.preview.stale || previewBlocked
  useEffect(() => {
    if (state.tab === 'mapping' && !busy && !locked && !state.error) void workflow.loadVisibleOptions()
  }, [state.tab, state.queue, state.mappingOptions, state.error, busy, locked, workflow])
  const options = { ...state.mappingOptions, ...(state.options && (state.optionsMappingId || state.selectedSheetId) ? { [state.optionsMappingId ?? state.selectedSheetId!]: state.options } : {}) }
  const tabs: { key: ImportFlowTab; label: string; available: boolean }[] = [
    { key: 'mapping', label: '3. Kiểm tra cách hiểu', available: !!state.summary },
    ...(role === 'OWNER' ? [{ key: 'profile' as const, label: '4. Duyệt reusable profile', available: !!state.summary && (!!hasReviewableProfile || !state.summary.progress.unresolved) }] : []),
    { key: 'preview', label: `${role === 'OWNER' ? 5 : 4}. Xem trước dữ liệu`, available: !!state.summary?.can_preview || !!state.preview || !!state.job && state.job.operation !== 'import_analyze' },
    { key: 'review', label: '5. Kiểm tra + xác nhận ghi', available: previewCanContinue(state) },
    { key: 'result', label: '6. Hoàn tất', available: !!state.completion },
  ]
  const commitFailed=!!state.error&&state.faultOperation==='commit'&&state.fault?.kind==='system'&&!state.retryOperation&&state.fault!==dismissedFault
  const localRejected=!!rejectedProfile
  const profileFailure=state.tab==='profile'&&!state.retryOperation&&(state.error||localRejected)?
    localRejected||state.fault?.code==='PROFILE_REJECTED'?{title:'Profile đã bị từ chối',copy:'Quay lại Step 3 để chỉnh cách hiểu.'}:
    state.fault?.kind==='permission'?{title:'Quyền của bạn đã thay đổi',copy:'Bạn không còn quyền duyệt reusable profile.'}:
    state.fault?.kind==='profile'?{title:'Profile version đã ngừng sử dụng',copy:'Không thể duyệt batch dựa trên version đã retired.'}:
    state.fault?.kind==='conflict'?{title:'Profile đã thay đổi trong lúc review',copy:'Tải dữ liệu mới nhất trước khi phê duyệt.'}:
    {title:'Không thể duyệt profile',copy:'Giữ nguyên toàn bộ review context và thử lại.'}:null
  if (role === 'STAFF' && state.tab === 'mapping' && approval.status !== 'idle') {
    if (approval.status === 'waiting') return <section className="input-panel"><header className="input-section-title"><small>Bước 3/6 · Nhánh Owner approval</small><h2>Đang chờ Owner duyệt</h2><p>Import vẫn được giữ. Bạn không cần tải file lại.</p></header><section className="input-status"><strong>Thay đổi reusable đang chờ quyết định</strong></section>{approvalError && <p role="alert">Chưa đọc được quyết định. <button disabled={approvalBusy} onClick={() => { void refreshApproval() }}>Thử lại</button></p>}<footer className="input-actions"><Link to="/imports/history">Về Lịch sử nhập</Link><button disabled>Đang chờ Owner duyệt</button></footer><DebugValue label="Owner approval" value={approval} /></section>
    if (approval.status === 'rejected') return <section className="input-panel"><header className="input-section-title"><small>Bước 3/6 · Kiểm tra cách hiểu</small><h2>Cần chỉnh lại cách hiểu</h2><p>File, mapping cũ, identity đã resolve và batch context vẫn được giữ.</p></header><section className="input-status"><strong>Phản hồi của Owner</strong><p>{approval.reason}</p></section><footer className="input-actions"><button className="input-primary" data-brand-accent={false} onClick={() => setApproval({status:'idle'})}>Chỉnh lại</button></footer></section>
    if (approval.status === 'approved' && state.summary?.can_preview) return <section className="input-panel"><header className="input-section-title"><small>Bước 3/6 · Kiểm tra cách hiểu</small><h2>Cách đọc đã được duyệt</h2><p>Bạn có thể tiếp tục kiểm tra dữ liệu. Approval không có nghĩa dữ liệu đã được import.</p></header><footer className="input-actions"><button className="input-primary" disabled={busy || locked} onClick={() => { void workflow.startPreview() }}>Tạo Preview</button></footer></section>
  }
  if (state.batch?.completion_available && !state.completion) return <section className="input-panel" aria-busy={busy}><h2>Đang đọc biên nhận hoàn tất</h2>{state.error && <p role="alert">{importMessage(state.fault?.code ?? '', state.error)}</p>}<button disabled={busy} onClick={() => { void workflow.refresh() }}>Đọc lại biên nhận</button></section>
  return <section ref={flowRef} className="import-flow" aria-labelledby="import-flow-title" aria-busy={busy}>
    <h2 ref={heading} id="import-flow-title" className="sr-only" tabIndex={-1}>{tabs.find((tab) => tab.key === state.tab)?.label}</h2>
    {state.error && !profileFailure && !commitFailed && <section className="input-status" role="alert"><strong>{state.tab === 'profile' ? state.fault?.code === 'PROFILE_REJECTED' ? 'Profile đã bị từ chối' : ({ permission: 'Quyền của bạn đã thay đổi', profile: 'Profile version đã ngừng sử dụng', stale: 'Profile cần được tải lại', conflict: 'Profile đã thay đổi trong lúc review', system: 'Không thể duyệt profile' })[state.fault?.kind ?? 'system'] : ({ permission: 'Quyền hiện tại không cho phép thao tác này', profile: 'Profile không còn hiệu lực', stale: 'Preview cần được tạo lại', conflict: 'Phiên bản đã thay đổi hoặc đã được xử lý', system: 'Không thể hoàn tất yêu cầu' })[state.fault?.kind ?? 'system']}</strong><DebugValue label="Import error" value={{error:state.error,fault:state.fault}} />{!state.retryOperation && <button disabled={busy} onClick={() => { void workflow.refresh() }}>Đọc lại trạng thái hiện tại</button>}{state.fault?.kind === 'profile' && <button disabled={busy || locked} onClick={() => workflow.setTab('mapping')}>Kiểm tra lại cách hiểu</button>}{state.fault?.kind === 'stale' && !state.previewStale && !state.preview?.preview.stale && <button disabled={busy || locked || !state.summary?.can_preview} onClick={() => { void workflow.startPreview() }}>Tạo lại Preview</button>}{state.fault?.kind === 'system' && !state.retryOperation && previewCanContinue(state) && <button disabled={busy || locked} onClick={() => workflow.setTab('review')}>Quay lại Review</button>}</section>}
    <DebugValue label="Workflow notice" value={state.notice} />
    {state.retryOperation&&state.retryOperation==='commit'&&<ImportProcessing kind="uncertain" title={state.retryOperation==='commit'?'Đang kiểm tra trạng thái lần nhập':'Đang kiểm tra kết quả lưu'} copy={state.retryOperation==='commit'?'ShelfCash đang xác nhận liệu lần nhập này đã hoàn tất hay chưa. Không tạo một import mới.':'Giữ nguyên yêu cầu đang chờ xác nhận trước khi chỉnh sửa tiếp.'}><button type="button" disabled={busy} onClick={()=>{void workflow.checkPendingState()}}>Kiểm tra lại trạng thái</button></ImportProcessing>}
    <ImportMutationStatus state={state} onCheck={()=>{void workflow.checkPendingState()}}/>
    {commitFailed&&<ImportProcessing kind="failed" title="Không thể hoàn tất nhập dữ liệu" copy="Review context vẫn được giữ. Kiểm tra lại trước khi xác nhận nhập."><button type="button" disabled={busy} onClick={()=>{setDismissedFault(state.fault);workflow.setTab('review')}}>Quay lại kiểm tra</button></ImportProcessing>}
    <DebugValue label="Job / retry" value={{job:state.job,retryOperation:state.retryOperation}} />
    {state.job && !['completed', 'failed'].includes(state.job.status) && state.batch?.status !== 'committing' && <section className="input-analysis-status" role="status"><strong>Đang xử lý dữ liệu</strong>{state.job.progress !== null && <progress aria-label="Tiến độ xử lý" value={state.job.progress} max={1} />}</section>}
    {state.tab === 'mapping' && (state.summary ? <>
      <header className="input-section-title input-section-title--stat"><div><small>Bước 3/6 · Kiểm tra cách hiểu</small><h2>Kiểm tra cách hiểu</h2><p>Xem tổng quan trước; chỉ mở resolver khi cần kiểm tra hoặc chỉnh một phần.</p></div><aside className="input-stat"><strong>{state.summary.progress.unresolved}</strong><span>vấn đề chưa xử lý</span></aside></header>
      {!!state.summary.binding_refs.length && !state.summary.profile_proposals.length && <section className="input-status"><strong>Đang dùng cách đọc đã duyệt</strong><p>Profile đã duyệt được tái sử dụng; không cần Owner duyệt lại.</p></section>}
      {role === 'STAFF' && !!state.summary.profile_proposals.length && approval.status === 'idle' && <section className="input-status"><strong>Cách đọc reusable đang thay đổi</strong><p>Thay đổi này ảnh hưởng reusable semantics và cần Owner duyệt trước khi tiếp tục.</p></section>}
      {role === 'STAFF' && approval.status === 'waiting' && <section className="input-status" role="status"><strong>Đang chờ Owner duyệt</strong><p>Import vẫn được giữ. Bạn không cần tải file lại.</p><button disabled={approvalBusy} onClick={() => { void refreshApproval() }}>Kiểm tra quyết định</button></section>}
      {role === 'STAFF' && approval.status === 'rejected' && <section className="input-status"><strong>Owner trả lại · Cần chỉnh lại cách hiểu</strong><p>{approval.reason}</p><button disabled={busy} onClick={() => setApproval({ status: 'idle' })}>Chỉnh lại</button></section>}
      {role === 'STAFF' && approval.status === 'approved' && <section className="input-status"><strong>Cách đọc đã được Owner duyệt</strong><p>Bạn có thể tiếp tục kiểm tra dữ liệu. Approval không có nghĩa dữ liệu đã được import.</p></section>}
      {approvalError && !submitOpen && <p className="input-status" role="alert"><span>{approvalError}</span><button disabled={approvalBusy} onClick={() => { void refreshApproval() }}>Thử đọc lại quyết định</button></p>}
      {!!state.summary.blockers.filter(issue => issue.code !== 'OWNER_MAPPING_APPROVAL_REQUIRED').length && <section className="input-status" role="alert">{state.summary.blockers.filter(issue => issue.code !== 'OWNER_MAPPING_APPROVAL_REQUIRED').map((issue,i) => <p key={issue.code+i}>{importMessage(issue.code,issue.message)}</p>)}</section>}
      {apiSubmission && state.batch && <ImportSubmissionLifecycle key={state.batch.import_id} batch={state.batch} summary={state.summary} disabled={busy || parentStale || !!state.retryOperation} canPropose={canProposeMapping} onLock={onSubmissionLock} onRefresh={refreshSubmission} />}
      <ImportResolveOverview summary={state.summary} queue={state.queue} busy={busy||locked} lastSaved={lastSaved} onOpen={group=>{setCategory(group);void workflow.setFilter('all',false)}}/>
      {category&&<ImportResolveDrawer key={JSON.stringify([state.summary.import_id,state.selectedSheetId,state.summary.mapping_revision,category])} group={category} role={role} summary={state.summary} queue={state.queue} options={options} sheetId={state.selectedSheetId} storeId={state.batch?.store_id??''} busy={busy} locked={locked} canPropose={canProposeMapping&&!state.batch?.active_job_id} error={state.error} saving={busy&&['mapping','resolution'].includes(state.savingOperation??'')} pending={!!state.retryOperation} onRetry={()=>{void workflow.checkPendingState()}} onReload={()=>{void workflow.refresh()}} reviewOnly={state.reviewOnly} onFilter={unresolved=>{void workflow.setFilter('all',unresolved)}}
        onClose={()=>{if(!busy&&!locked)setCategory(null)}} onSheet={id=>{void workflow.selectSheet(id)}} onLoadMore={()=>{void workflow.loadMoreMappings()}}
        onConfirm={async(id,target)=>{await workflow.confirmMapping(id,target);const next=workflow.getSnapshot();const saved=!next.error&&!next.retryOperation;if(saved)setLastSaved(category);return saved}}
        onResolve={async(id,resolution)=>{await workflow.resolveMapping(id,resolution);const next=workflow.getSnapshot();const saved=!next.error&&!next.retryOperation;if(saved)setLastSaved(category);return saved}}/>}
      <ImportActionBar back={onBackToAnalyze} note={state.summary.progress.unresolved&&!hasReviewableProfile?'Giải quyết vấn đề còn lại trước khi tiếp tục.':undefined}>
        {role === 'OWNER' ? <button className="input-primary" disabled={busy || locked || (!hasReviewableProfile && !!state.summary.progress.unresolved)} onClick={() => { if(state.summary?.can_preview && !state.summary.profile_proposals.length) void workflow.startPreview(); else workflow.setTab('profile') }}>{state.summary.can_preview && !state.summary.profile_proposals.length ? 'Tạo Preview' : 'Xem profile sẽ được lưu'}</button> : state.summary.can_preview ? <button className="input-primary" disabled={busy || locked} onClick={() => { void workflow.startPreview() }}>Tạo Preview</button> : (devOwnerReview || config.mockPreview) && !!state.summary.profile_proposals.length && <button className="input-primary" disabled={busy || locked || state.summary.profile_proposals.some(p => !p.spec || !!p.missing_fields.length)} onClick={() => setSubmitOpen(true)}>{devOwnerReview ? 'Gửi Owner duyệt' : 'Bàn giao cho Owner'}</button>}
      </ImportActionBar>
      {submitOpen && (devOwnerReview || config.mockPreview) && <FlowDialog title={devOwnerReview ? 'Gửi thay đổi để Owner duyệt?' : 'Bàn giao cách đọc cho Owner'} center onClose={() => { if (!approvalBusy) setSubmitOpen(false) }} closeDisabled={approvalBusy} footer={<><button disabled={approvalBusy} onClick={() => setSubmitOpen(false)}>Hủy</button>{devOwnerReview ? <button className="sc-flow-primary" data-brand-accent={true} disabled={approvalBusy || busy} onClick={async () => {
        if (!state.batch || !state.summary) return
        setApprovalBusy(true)
        try { const next = await devOwnerReview.submit(state.batch.import_id, state.summary.profile_proposals[0].proposal_revision); setApproval(next); setSubmitOpen(false); setApprovalError(null) }
        catch (error) { setApprovalError(error instanceof Error&&error.message.includes('REJECTED_PROPOSAL_REQUIRES_EDIT')?'Đề xuất đã bị trả lại. Cần chỉnh cách hiểu trước khi gửi lại.':'Chưa gửi được thay đổi. Ngữ cảnh vẫn được giữ.') }
        finally { setApprovalBusy(false) }
      }}>Gửi Owner duyệt</button> : <button disabled={busy || approvalBusy} onClick={() => { setSubmitOpen(false); void workflow.refresh() }}>Đọc lại quyết định Owner</button>}</>}>
        <p>Chỉ reusable spec cần Owner duyệt. Import vẫn được giữ; approval không commit.</p>
        {approvalError&&<p className="input-status" role="alert">{approvalError}</p>}
        <ImportBusinessFacts value={state.summary.profile_proposals.map(proposal => ({field_bindings:proposal.spec?.field_bindings,identity_rules:proposal.spec?.identity_rules,shared_field_bindings:proposal.spec?.shared_field_bindings,conversions:proposal.spec?.conversions}))} />
        {devOwnerReview ? <DebugValue label="Approval adapter" value="DEV simulation only; no queue/notification HTTP endpoint" /> : <><p>Gửi Owner liên kết lô để duyệt cách đọc, sau đó kiểm tra lại quyết định.</p><input aria-label="Đường dẫn bàn giao lô" readOnly value={`${window.location.origin}/imports?import_id=${state.batch?.import_id ?? ''}`} /></>}
      </FlowDialog>}
    </> : <p>Chưa có tóm tắt cách hiểu. Đợi phân tích hoàn tất hoặc đọc lại trạng thái.</p>)}
    {state.tab === 'profile' && state.summary && <>
      <header className="input-section-title"><span className="sc-flow-badge input-profile-badge">Reusable Profile</span><small>Bước 4/6 · Duyệt cách đọc dữ liệu</small><h2>{profileFailure?.title??(state.summary.can_preview ? 'Profile đã được duyệt' : 'Duyệt cách đọc dữ liệu')}</h2><p>{profileFailure?.copy??'Owner đang phê duyệt phần interpretation có thể tái sử dụng, không phải import batch.'}</p></header>
      {profileFailure&&<ImportStatus kind="error" title={profileFailure.title} copy={profileFailure.copy}/>}
      <div><ImportProfileReview summary={state.summary} busy={busy} locked={locked||!!profileFailure} canDecide={canDecideProfile&&state.fault?.kind!=='permission'} onDecision={(id, revision, decision) => { void workflow.decideProfile(id, revision, decision).then(()=>{const next=workflow.getSnapshot();if(!next.error&&!next.retryOperation)setRejectedProfile(decision.decision==='reject'?`${id}:${decision.proposal_revision}`:null)}) }} />
      {state.summary.can_preview && <section className="input-status" role="status"><strong>Profile đã được duyệt</strong><p>Profile version này có thể được tái sử dụng cho các file nguồn tương thích. Dữ liệu batch hiện tại vẫn chưa được nhập.</p></section>}
      <section className="input-batch-only"><h3>Chỉ áp dụng cho lần nhập này</h3><p>Các giá trị này không được lưu làm mặc định cho những lần nhập sau.</p><span>Ngày dữ liệu · {state.batch?.data_date}</span></section>
      {!profileFailure&&<ImportActionBar back={()=>workflow.setTab('mapping')} backLabel="Quay lại chỉnh sửa"><button className="input-primary" disabled={busy||locked||!state.summary.can_preview} onClick={()=>{void workflow.startPreview()}}>Tạo Preview</button></ImportActionBar>}</div>
      {profileFailure&&<ImportActionBar back={()=>{setRejectedProfile(null);workflow.setTab('mapping')}}><button className="input-primary" data-brand-accent={false} disabled={busy||locked} onClick={()=>{if(localRejected||state.fault?.code==='PROFILE_REJECTED'){setRejectedProfile(null);workflow.setTab('mapping')}else void workflow.refresh()}}>{localRejected||state.fault?.code==='PROFILE_REJECTED'?'Quay lại chỉnh sửa':'Tải lại review'}</button></ImportActionBar>}
    </>}
    {(state.previewStale || state.preview?.preview.stale) && ['preview', 'review'].includes(state.tab) && <section className="input-status" role="alert"><strong>Preview không còn mới nhất</strong><p>Mapping hoặc profile đã thay đổi sau lần Preview trước.</p><button disabled={busy || locked || !state.summary?.can_preview} onClick={() => { void workflow.startPreview() }}>Tạo lại Preview</button><button disabled={busy || locked} onClick={() => workflow.setTab('mapping')}>Kiểm tra lại cách hiểu</button></section>}
    {previewBlocked && ['preview', 'review'].includes(state.tab) && <section className="input-status" role="alert"><strong>Preview bị chặn toàn lô</strong><p>Không có dòng nào bị bỏ qua âm thầm. Hãy quay lại xử lý.</p><button disabled={busy || locked} onClick={() => workflow.setTab('mapping')}>Quay lại xử lý</button></section>}
    {state.batch?.status === 'committing' && !state.retryOperation && <ImportProcessing kind="running" title="Đang nhập dữ liệu" copy="Dữ liệu đang được ghi. Vui lòng chờ xác nhận kết quả." confirmed={state.preview?.confirmation_usable&&!!state.preview.review_confirmation}/>}
    {state.batch?.status !== 'committing' && state.retryOperation !== 'commit' && !previewInvalid && !commitFailed && ['preview','review'].includes(state.tab) && (state.preview ? <ImportPreview onBack={()=>workflow.setTab('preview')} showStaleNotice={false} key={state.preview.preview.summary.preview_id} mapping={state.summary} stage={state.tab === 'review' ? 'review' : 'preview'} bundle={state.preview} busy={busy} locked={locked || state.tab === 'review' && (!previewCanContinue(state)||!!state.error&&state.fault?.kind!=='system')} blockers={state.commitBlockers} reason={state.commitReason} acknowledged={state.commitAcknowledged}
      reviewReason={state.reviewReason} reviewAcknowledged={state.reviewAcknowledged} reviewBlockers={state.reviewBlockers}
      onReviewReason={workflow.setReviewReason} onReviewAcknowledge={workflow.acknowledgeReview} onConfirmReview={() => { void workflow.confirmReview() }}
      historyCorrections={state.historyCorrections} onHistoryCorrections={workflow.setHistoryCorrections} resolutions={state.resolutions} supplierChanges={state.supplierChanges} onResolutions={workflow.setResolutions} onSupplierChanges={workflow.setSupplierChanges}
      onReason={workflow.setCommitReason} onAcknowledge={workflow.acknowledgeCommit} onLoadMore={() => { void workflow.loadMorePreview() }} onCommit={() => { void workflow.commit() }} /> : <section className="import-flow__card"><p>Chưa có dữ liệu nào được ghi vào ShelfCash.</p><button type="button" disabled={busy || locked || !state.summary?.can_preview} onClick={() => { void workflow.startPreview() }}>Tạo bản xem trước</button></section>)}
    {state.tab === 'preview' && state.preview && !previewInvalid && !commitFailed && state.retryOperation !== 'commit' && state.batch?.status !== 'committing' && <ImportActionBar back={()=>workflow.setTab('mapping')}><button type="button" className="input-primary" disabled={busy || locked || !previewCanContinue(state)} onClick={() => workflow.setTab('review')}>Tiếp tục xác nhận</button></ImportActionBar>}
    {state.completion && state.tab !== 'result' && <p><button type="button" className="import-flow__primary" disabled={busy} onClick={() => workflow.setTab('result')}>Xem biên nhận hoàn tất</button></p>}
    {state.tab === 'result' && state.completion && <ImportResult completion={state.completion} readinessPreview={readinessPreview} />}
    <DebugContent><details className="import-flow__navigation"><summary>Các bước nhập dữ liệu</summary>
      <ol className="import-flow__steps" aria-label="Các bước sau phân tích">{tabs.map((tab) => <li key={tab.key}><button type="button" aria-current={state.tab === tab.key ? 'step' : undefined} disabled={!tab.available || busy || locked || !!state.completion && tab.key !== 'result'} onClick={() => workflow.setTab(tab.key)}>{tab.label}</button></li>)}</ol>
      <button type="button" disabled={busy} onClick={() => { void workflow.refresh() }}>Đọc lại bước xử lý</button>
    </details></DebugContent>
  </section>
}
