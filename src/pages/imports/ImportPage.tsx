import { Link, useOutletContext } from 'react-router'
import { ImportUpload } from '../../features/import-data/components/ImportUpload'
import { AppShellHeader } from '../../layouts/app-shell/AppShell'
import type { ImportSelection } from './ImportWorkspace'
import './ImportPage.css'

export function ImportPage() {
  const { files, setFiles, dataDate, setDataDate } = useOutletContext<ImportSelection>()

  return (
    <div className="import-page">
      <AppShellHeader>
        <div className="import-page__date">
          <label htmlFor="import-data-date">Ngày dữ liệu</label>
          <input id="import-data-date" type="date" value={dataDate} onChange={(event) => setDataDate(event.target.value)} />
        </div>
      </AppShellHeader>
      <main className="import-page__main" aria-labelledby="import-page-title">
        <h1 id="import-page-title">Nhập dữ liệu</h1>
        <div className="import-page__grid">
          <ImportUpload files={files} onFilesChange={setFiles} />
          <nav className="import-page__utilities" aria-label="Tiện ích nhập dữ liệu">
            <Link to="/imports/history">Lịch sử nhập</Link>
            <button type="button" disabled title="Chưa triển khai">File mẫu</button>
            <button type="button" disabled title="Chưa triển khai">HDSD</button>
          </nav>
          <div className="import-page__process">
            <p id="import-processing-help">Chức năng tải lên và xử lý dữ liệu chưa khả dụng.</p>
            <button type="button" disabled aria-describedby="import-processing-help">Xử lý dữ liệu</button>
          </div>
        </div>
      </main>
    </div>
  )
}
