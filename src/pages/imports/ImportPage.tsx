import { useId, useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router'
import { ImportHelp } from '../../features/import-data/components/ImportHelp'
import { ImportUpload } from '../../features/import-data/components/ImportUpload'
import { ImportBatchPanel } from '../../features/import-data/components/ImportBatchPanel'
import { ImportFlow } from '../../features/import-data/components/ImportFlow'
import { importStage, importStageLabels } from '../../features/import-data/importFlow.stage'
import { importLocatorMismatch } from '../../features/import-data/importFlow.locator'
import { config } from '../../app/config'
import { AppShellHeader } from '../../layouts/app-shell/AppShell'
import type { ImportSelection } from './ImportWorkspace'
import './ImportPage.css'

export function ImportPage() {
  const { state, workflow, flow, flowState, canDecideProfile, canProposeMapping, startNewDraft } = useOutletContext<ImportSelection>()
  const [searchParams] = useSearchParams()
  const locator = searchParams.get('import_id')
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
  const stepTitles = { mapping: 'Ghép cột dữ liệu', review: 'Kiểm tra + xác nhận ghi', preview: 'Xem trước dữ liệu', result: 'Hoàn tất' }
  const title = showFlow ? stepTitles[flowState.tab] : 'Nhập dữ liệu'
  const step = showFlow ? ({ mapping: 2, preview: 3, review: 4, result: 5 }[flowState.tab]) : 1

  return (
    <div className="import-page">
      <AppShellHeader>
        {showFlow ? <nav aria-label="Đường dẫn trang"><Link to="/imports">Nhập dữ liệu</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav> : <div className="import-page__date">
          <label htmlFor="import-data-date">Ngày dữ liệu</label>
          <input id="import-data-date" type="date" value={dataDate} disabled={locatorMismatch || !!state.draft || busy || !!state.retryOperation} onChange={(event) => workflow.setDataDate(event.target.value)} />
        </div>}
      </AppShellHeader>
      <main className="import-page__main" aria-labelledby="import-page-title">
        <div className="import-page__heading"><div><h1 id="import-page-title">{title}</h1><span className="import-page__step">Bước {step}/5</span></div>
          <button className="import-page__help" type="button" aria-haspopup="dialog" aria-controls={helpId} aria-expanded={helpOpen} onClick={() => setHelpOpen(true)}>HDSD</button></div>
        {config.dataSource === 'mock' && <p className="import-page__source">Minh họa · Không phân tích file hoặc ghi dữ liệu thật.</p>}
        <p className="sr-only" aria-live="polite">Bước hiện tại: {importStageLabels[importStage(state)]}</p>
        {locatorMismatch && <p className="import-page__error" role="status">Chưa đọc được đúng lô trong URL. Các thao tác thay đổi bị khóa; không dùng lô trước làm trạng thái của lô đang yêu cầu.{batch && <> <Link to={`/imports?import_id=${encodeURIComponent(batch.import_id)}`}>Quay lại lô đang giữ trong workspace</Link>.</>}</p>}
        {locatorMismatch && !batch && !state.draft && state.error && <button type="button" disabled={busy || !!state.retryOperation || flowState.busy || !!flowState.retryOperation} onClick={startNewDraft}>Bỏ định danh đang mở và bắt đầu lô mới</button>}
        {showFlow && <>
          {!!rejectedFiles.length && <p className="import-page__error" role="alert">{rejectedFiles.length} file không được phân tích: {rejectedFiles.map((file) => file.filename).join(', ')}. Xem lý do trong “File đã nhập và thông tin lô”.</p>}
          {state.error && <p className="import-page__error" role="alert">{state.error}</p>}
          {state.retryOperation && <button type="button" disabled={busy} onClick={() => { void workflow.retry() }}>Thử lại đúng yêu cầu trước</button>}
          <ImportFlow state={flowState} workflow={flow} canDecideProfile={canDecideProfile} canProposeMapping={canProposeMapping} parentBusy={busy || !!state.retryOperation} parentStale={!state.fresh || locatorMismatch} />
          <details className="import-page__batch-details"><summary>File đã nhập và thông tin lô</summary><ImportBatchPanel state={state} workflow={workflow} continuationLocked={continuationLocked} onNewDraft={startNewDraft} /></details>
        </>}
        {!showFlow && <div className="import-page__grid">
          <div className="import-page__upload-column">
            <ImportUpload files={files} onFilesChange={workflow.setFiles} disabled={uploadLocked} uncertainFiles={state.retryOperation === 'upload'} />
            {state.draft && <ImportBatchPanel state={state} workflow={workflow} continuationLocked={continuationLocked} onNewDraft={startNewDraft} />}
          </div>
          <nav className="import-page__utilities" aria-label="Tiện ích nhập dữ liệu">
            <Link to="/imports/history">Lịch sử nhập</Link>
            <button type="button" disabled title="Chưa triển khai">File mẫu</button>
          </nav>
          <div className="import-page__process">
            <p id="import-processing-help">Chọn file và ngày dữ liệu, sau đó xử lý để ghép cột. File được máy chủ nhận sẽ được phân tích; file bị từ chối sẽ có thông báo riêng.</p>
            <button type="button" disabled={continuationLocked || busy || !!state.retryOperation || !dataDate || (!files.length && (!batch?.file_count || !batch.allowed_actions.includes('analyze')))} aria-describedby="import-processing-help" onClick={() => { void workflow.process() }}>{busy ? 'Đang xử lý…' : 'Xử lý dữ liệu'}</button>
          </div>
          <div className="import-page__feedback">
            {state.error && <p className="import-page__error" role="alert">{state.error}</p>}
            {locator && locatorMismatch && state.error && <button type="button" disabled={busy || !!state.retryOperation || flowState.busy || !!flowState.retryOperation} onClick={() => { void (state.draft?.import_id === locator ? workflow.refresh() : workflow.resume(locator)) }}>Đọc lại lô từ máy chủ</button>}
            {state.retryOperation && <button type="button" disabled={busy} onClick={() => { void workflow.retry() }}>Thử lại đúng yêu cầu trước</button>}
            <p role="status">{busy ? 'Đang thực hiện yêu cầu… ' : ''}{state.notice}</p>
          </div>
        </div>}
      </main>
      <ImportHelp id={helpId} open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
