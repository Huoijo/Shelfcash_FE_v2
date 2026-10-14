import { DebugContent, DebugValue } from '../../shared/debug/DevelopmentTools'
import { displayStoreName, importMessage } from '../../features/import-data/importPresentation'
import { UnderConstructionButton } from '../../shared/UnderConstruction'
import { useCurrentStore } from '../../features/store/store.context'
import { ImportAnalyze, ImportSource, ImportStepper } from '../../features/import-data/components/ImportExperience'
import { analyzeAssessment, importScreen } from '../../features/import-data/importExperience'
import { useId, useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router'
import { ImportHelp } from '../../features/import-data/components/ImportHelp'
import { ImportUpload } from '../../features/import-data/components/ImportUpload'
import { ImportBatchPanel } from '../../features/import-data/components/ImportBatchPanel'
import { ImportFlow } from '../../features/import-data/components/ImportFlow'
import { importStage, importStageLabels } from '../../features/import-data/importFlow.stage'
import { importLocatorMismatch } from '../../features/import-data/importFlow.locator'
import { AppShellHeader } from '../../layouts/app-shell/AppShell'
import type { ImportSelection } from './ImportWorkspace'
import './ImportPage.css'

export function ImportPage({selection}:{selection?:ImportSelection} = {}) {
  const outlet = useOutletContext<ImportSelection>()
  const { state, workflow, flow, flowState, canDecideProfile, canProposeMapping, role, devOwnerReview, startNewDraft, preview } = selection ?? outlet
  const [searchParams] = useSearchParams()
  const { state: storeState } = useCurrentStore()
  const storeName = storeState.status === 'ready' || storeState.status === 'mock_preview' ? displayStoreName(storeState.store.name) : 'Đang đọc cửa hàng'
  const [resolveImportId, setResolveImportId] = useState<string | null>(() => preview ? state.batch?.import_id ?? null : null)
  const screen = preview?.screen ?? importScreen(state, flowState, resolveImportId)
  const analyzeVisible = screen === 'analyze'
  const locator = preview ? null : searchParams.get('import_id')
  const { files, dataDate, batch } = state
  const busy = state.busy || state.processing
  const locatorMismatch = importLocatorMismatch(locator, batch?.import_id)
  const continuationLocked = locatorMismatch || flowState.busy || !!flowState.retryOperation || !!batch?.active_job_id || batch?.status === 'committing'
  const uploadLocked = busy || continuationLocked || !!state.retryOperation || state.sealedLocked || !!batch?.source_set.sealed ||
    !!(batch && !batch.allowed_actions.includes('upload'))
  const [helpOpen, setHelpOpen] = useState(false)
  const helpId = useId()
  const showFlow = state.sealedLocked && !locatorMismatch
  const rejectedFiles = state.receipts.filter((file) => file.upload_status === 'rejected')
  const title = 'Nhập dữ liệu'

  return (
    <div className="import-page" data-ui-preview={preview?.scenario}>
      <AppShellHeader>
        {showFlow ? <span>Nhập dữ liệu</span> : <div className="import-page__date">
          <label htmlFor="import-data-date">Ngày dữ liệu</label>
          <input id="import-data-date" type="date" value={dataDate} disabled={locatorMismatch || !!state.draft || busy || !!state.retryOperation} onChange={(event) => workflow.setDataDate(event.target.value)} />
        </div>}
      </AppShellHeader>
      <main className="import-page__main" aria-labelledby="import-page-title">
        <div className="import-page__heading"><div><h1 id="import-page-title">{title}</h1><span className="import-page__step">{role} FLOW</span></div>
          <DebugContent><button className="import-page__help" type="button" aria-haspopup="dialog" aria-controls={helpId} aria-expanded={helpOpen} onClick={() => setHelpOpen(true)}>HDSD</button></DebugContent></div>
        <p className="input-subtitle">{role === 'OWNER' ? 'Owner nhập dữ liệu, xác nhận cách hiểu và kiểm soát điều gì được tái sử dụng.' : 'Reuse khi an toàn, xử lý khi cần; chỉ gửi Owner duyệt khi cách đọc reusable thay đổi.'}</p>
        <nav className="input-view-tabs" aria-label="Tiện ích nhập dữ liệu"><span aria-current="page">Nhập mới</span><Link to="/imports/history">Lịch sử</Link>{role === 'OWNER' && <><UnderConstructionButton feature="Duyệt mapping toàn cửa hàng">Phê duyệt Staff</UnderConstructionButton><UnderConstructionButton feature="Danh sách profile toàn cửa hàng">Profiles</UnderConstructionButton></>}</nav>
        <ImportStepper role={role} screen={screen} />
        {showFlow && <ImportSource state={state} flow={flowState} storeName={storeName} status={flowState.retryOperation === 'commit' ? 'Đang kiểm tra kết quả' : ({upload:'Chọn file',analyze: state.processing || state.batch?.active_job_id ? 'Đang phân tích' : analyzeAssessment(state, flowState) === 'complete' ? 'Phân tích hoàn tất' : 'Cần xử lý',resolve:flowState.summary?.progress.unresolved ? 'Cần xử lý' : 'Đã xử lý',profile:flowState.summary?.can_preview ? 'Profile đã duyệt' : 'Chưa ghi dữ liệu',preview:'Preview · Chưa ghi dữ liệu',review:'Chờ xác nhận',commit:'Đang ghi dữ liệu',complete:'Import hoàn tất'})[screen]} />}
        <DebugValue label="Import workspace" value={{ role, screen, batch: state.batch, flow: flowState }} />
        <p className="sr-only" aria-live="polite">Bước hiện tại: {importStageLabels[importStage(state)]}</p>
        {locatorMismatch && <p className="import-page__error" role="status">Chưa đọc được đúng lô trong URL. Các thao tác thay đổi bị khóa; không dùng lô trước làm trạng thái của lô đang yêu cầu.{batch && <> <Link to={`/imports?import_id=${encodeURIComponent(batch.import_id)}`}>Quay lại lô đang giữ trong workspace</Link>.</>}</p>}
        {locatorMismatch && !batch && !state.draft && state.error && <button type="button" disabled={busy || !!state.retryOperation || flowState.busy || !!flowState.retryOperation} onClick={startNewDraft}>Bỏ định danh đang mở và bắt đầu lô mới</button>}
        {!showFlow && !!rejectedFiles.length && <section className="input-status" role="alert"><strong>File chưa được nhận</strong>{rejectedFiles.map(file => <p key={file.client_file_id}>{file.filename} · {file.error?.code === 'INVALID_FILE_TYPE' ? 'Định dạng không được hỗ trợ' : file.error?.code === 'RESOURCE_LIMIT_EXCEEDED' ? 'Vượt giới hạn dung lượng của lần nhập' : 'Không thể nhận file này'}</p>)}</section>}
        {showFlow && <>
          {!!rejectedFiles.length && <p className="import-page__error" role="alert">{rejectedFiles.length} file không được phân tích: {rejectedFiles.map((file) => file.filename).join(', ')}. Xem lý do trong “File đã nhập và thông tin lô”.</p>}
          {state.error && <p className="import-page__error" role="alert">{importMessage('', state.error)}</p>}
          {state.retryOperation && <button type="button" disabled={busy} onClick={() => { void workflow.retry() }}>Thử lại đúng yêu cầu trước</button>}
          {analyzeVisible ? <ImportAnalyze role={role} state={state} flowState={flowState} workflow={workflow} flow={flow} onContinue={() => { setResolveImportId(batch?.import_id ?? null); flow.setTab('mapping') }} /> : <ImportFlow initialEditor={preview?.editor} initialSubmit={preview?.submit} readinessPreview={preview?.readiness} key={batch?.import_id} role={role} devOwnerReview={devOwnerReview} state={flowState} workflow={flow} canDecideProfile={canDecideProfile} canProposeMapping={canProposeMapping} parentBusy={busy || !!state.retryOperation} parentStale={!state.fresh || locatorMismatch} />}
          <DebugContent><ImportBatchPanel state={state} workflow={workflow} continuationLocked={continuationLocked} onNewDraft={startNewDraft} /></DebugContent>
        </>}
        {!showFlow && <div className="import-page__grid">
          <div className="import-page__upload-column">
            <header className="input-section-title input-section-title--stat"><div><small>Bước 1/6 · File</small><h2>Thêm dữ liệu</h2><p>Thêm một hoặc nhiều file. Mỗi file vẫn giữ cấu trúc và ý nghĩa riêng.</p></div><aside className="input-stat"><strong>{files.length}</strong><span>file đã thêm</span></aside></header>
            <ImportUpload files={files} onFilesChange={workflow.setFiles} disabled={uploadLocked} uncertainFiles={state.retryOperation === 'upload'} />
            {state.draft && <DebugContent><ImportBatchPanel state={state} workflow={workflow} continuationLocked={continuationLocked} onNewDraft={startNewDraft} /></DebugContent>}
          </div>
          <nav className="import-page__utilities" aria-label="Tiện ích nhập dữ liệu">
            <Link to="/imports/history">Lịch sử nhập</Link>
            <button type="button" disabled title="Chưa triển khai">File mẫu</button>
          </nav>
          <div className="import-page__process">
            <span id="import-processing-help" className="sr-only">Chọn file và ngày dữ liệu trước khi phân tích.</span>
            <button type="button" disabled={continuationLocked || busy || !!state.retryOperation || !dataDate || (!files.length && (!batch?.file_count || !batch.allowed_actions.includes('analyze')))} aria-describedby="import-processing-help" onClick={() => { void workflow.process() }}>{busy ? 'Đang xử lý…' : 'Phân tích dữ liệu'}</button>
          </div>
          <div className="import-page__feedback">
            {state.error && <p className="import-page__error" role="alert">{importMessage('', state.error)}</p>}
            {locator && locatorMismatch && state.error && <button type="button" disabled={busy || !!state.retryOperation || flowState.busy || !!flowState.retryOperation} onClick={() => { void (state.draft?.import_id === locator ? workflow.refresh() : workflow.resume(locator)) }}>Đọc lại lô từ máy chủ</button>}
            {state.retryOperation && <button type="button" disabled={busy} onClick={() => { void workflow.retry() }}>Thử lại đúng yêu cầu trước</button>}
            <DebugValue label="Upload notice" value={state.notice} />
          </div>
        </div>}
      </main>
      <ImportHelp id={helpId} open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
