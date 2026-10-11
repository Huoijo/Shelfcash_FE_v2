import { useId, useState } from 'react'
import { Link, useOutletContext } from 'react-router'
import { ImportHelp } from '../../features/import-data/components/ImportHelp'
import { ImportUpload } from '../../features/import-data/components/ImportUpload'
import { ImportBatchPanel } from '../../features/import-data/components/ImportBatchPanel'
import { config } from '../../app/config'
import { AppShellHeader } from '../../layouts/app-shell/AppShell'
import type { ImportSelection } from './ImportWorkspace'
import './ImportPage.css'

export function ImportPage() {
  const { state, workflow } = useOutletContext<ImportSelection>()
  const { files, dataDate, batch } = state
  const uploadLocked = state.busy || !!state.retryOperation || state.sealedLocked || !!batch?.source_set.sealed ||
    !!(batch && !batch.allowed_actions.includes('upload'))
  const [helpOpen, setHelpOpen] = useState(false)
  const helpId = useId()

  return (
    <div className="import-page">
      <AppShellHeader>
        <div className="import-page__date">
          <label htmlFor="import-data-date">Ngày dữ liệu</label>
          <input id="import-data-date" type="date" value={dataDate} disabled={!!state.draft || state.busy || !!state.retryOperation} onChange={(event) => workflow.setDataDate(event.target.value)} />
        </div>
      </AppShellHeader>
      <main className="import-page__main" aria-labelledby="import-page-title">
        <h1 id="import-page-title">Nhập dữ liệu</h1>
        <p className="import-page__source">{config.dataSource === 'mock' ? 'Chế độ minh họa · Chỉ phục vụ thử giao diện, không tải file lên máy chủ.' : 'Kết nối máy chủ · Cần phiên đăng nhập và quyền của cửa hàng.'}</p>
        <div className="import-page__grid">
          <div className="import-page__upload-column">
            <ImportUpload files={files} onFilesChange={workflow.setFiles} disabled={uploadLocked} uncertainFiles={state.retryOperation === 'upload'} />
            <div className="import-page__upload-action">
              <button type="button" disabled={uploadLocked || !files.length || !dataDate} onClick={() => { void workflow.upload() }}>{state.draft ? 'Tải thêm file vào lô' : 'Tạo lô và tải file'}</button>
              <p>Ngày dữ liệu cố định sau khi tạo lô. File trên thiết bị có thể bỏ trước khi gửi.</p>
            </div>
            <ImportBatchPanel state={state} workflow={workflow} />
          </div>
          <nav className="import-page__utilities" aria-label="Tiện ích nhập dữ liệu">
            <Link to="/imports/history">Lịch sử nhập</Link>
            <button type="button" disabled title="Chưa triển khai">File mẫu</button>
            <button type="button" aria-haspopup="dialog" aria-controls={helpId} aria-expanded={helpOpen} onClick={() => setHelpOpen(true)}>HDSD</button>
          </nav>
          <div className="import-page__process">
            <p id="import-processing-help">Khóa toàn bộ file đã nhận để bắt đầu phân tích. Chưa đối chiếu cột, xem trước hoặc ghi dữ liệu nghiệp vụ.</p>
            <button type="button" disabled={state.busy || !!state.retryOperation || !state.fresh || !batch?.allowed_actions.includes('analyze') || !batch.file_count || !!files.length || !!state.preparation} aria-describedby="import-processing-help" onClick={() => { void workflow.prepareAnalysis() }}>Xử lý dữ liệu</button>
          </div>
          <div className="import-page__feedback">
            {state.error && <p className="import-page__error" role="alert">{state.error}</p>}
            {state.retryOperation && <button type="button" disabled={state.busy} onClick={() => { void workflow.retry() }}>Thử lại đúng yêu cầu trước</button>}
            <p role="status">{state.busy ? 'Đang thực hiện yêu cầu… ' : ''}{state.notice}</p>
          </div>
        </div>
      </main>
      <ImportHelp id={helpId} open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
