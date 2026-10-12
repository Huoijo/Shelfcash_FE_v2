import { formatImportFileSize } from '../importData.files'
import type { ImportBatchWorkflow, ImportBatchState } from '../importData.workflow'
import type { ImportFileReceipt } from '../importData.types'
import './ImportBatchPanel.css'

const statuses: Record<string, string> = {
  draft: 'Bản nháp', uploaded: 'Đã nhận file', analyzing: 'Đang phân tích',
  failed: 'Phân tích thất bại', review_required: 'Cần đối chiếu dữ liệu',
  ready_for_preview: 'Đã phân tích', blocked: 'Có lỗi chặn', previewing: 'Đang xem trước',
  preview_ready: 'Đã xem trước', committing: 'Đang ghi dữ liệu',
  completed: 'Đã hoàn tất', completed_with_warnings: 'Hoàn tất có cảnh báo',
}

function receiptError(file: ImportFileReceipt) {
  const labels: Record<string, string> = {
    RESOURCE_LIMIT_EXCEEDED: 'Vượt hạn mức file hoặc dung lượng còn lại của lô.',
    INVALID_FILE_TYPE: 'Nội dung file không có định dạng được hỗ trợ.',
    EMPTY_FILE: 'File không có nội dung.',
  }
  return file.error ? labels[file.error.code] ?? file.error.message : null
}

export function ImportBatchPanel({ state, workflow, continuationLocked = false, onNewDraft }: { state: ImportBatchState; workflow: ImportBatchWorkflow; continuationLocked?: boolean; onNewDraft?: () => void }) {
  const batch = state.batch
  const displayed = new Map<string, ImportFileReceipt>()
  state.receipts.forEach((file) => displayed.set(file.client_file_id, file))
  state.serverFiles.forEach((file) => displayed.set(file.client_file_id, file))
  const sealed = state.sealedLocked || batch?.source_set.sealed
  const busy = state.busy || state.processing

  return (
    <section className="import-batch" aria-label="Lô nhập hiện tại" aria-busy={busy}>
      <div className="import-batch__heading">
        <div>
          <h2>Lô nhập hiện tại</h2>
          <p>{state.draft?.display_number ?? 'Lô sẽ được tạo khi bạn tải file.'}</p>
        </div>
        {state.draft && <button type="button" disabled={busy || continuationLocked} onClick={() => { void workflow.refresh() }}>Đọc lại lô</button>}
      </div>
      {state.draft && (
        <>
          <p className="import-batch__state">{statuses[batch?.status ?? state.draft.status] ?? batch?.status}</p>
          {state.fresh && batch ? (
            <dl className="import-batch__quota" aria-label="Hạn mức từ máy chủ">
              <div><dt>File đã nhận</dt><dd>{batch.quota.accepted_file_count} / 20</dd></div>
              <div><dt>Dung lượng đã dùng</dt><dd>{formatImportFileSize(batch.quota.accepted_total_bytes)} / 100 MiB</dd></div>
              <div><dt>Còn nhận được</dt><dd>{batch.quota.remaining_file_slots} file</dd></div>
              <div><dt>Dung lượng còn lại</dt><dd>{formatImportFileSize(batch.quota.remaining_bytes)}</dd></div>
            </dl>
          ) : <p className="import-batch__muted">Chưa có hạn mức hiện tại. Cần đọc lại lô từ máy chủ.</p>}
          <p className="import-batch__muted">File bị từ chối không dùng hạn mức. Hạn mức có thể thay đổi nếu có người tải đồng thời; máy chủ quyết định kết quả cuối cùng.</p>
        </>
      )}
      {displayed.size > 0 && (
        <section className="import-batch__receipts" aria-label="Biên nhận file">
          <h3>Biên nhận file</h3>
          <p className="import-batch__muted">Đang hiển thị {displayed.size} biên nhận đã đọc hoặc nhận trong phiên này. File đã nhận được giữ nguyên trên máy chủ.</p>
          <ul>
            {[...displayed.values()].map((file) => (
              <li key={file.client_file_id} data-client-file-id={file.client_file_id}>
                <div className="import-batch__file-heading">
                  <span>{file.filename}</span>
                  <span className="import-batch__badge">{file.upload_status === 'uploaded' ? 'Đã nhận' : 'Bị từ chối'}</span>
                </div>
                <p>{file.type.toUpperCase()} · {formatImportFileSize(file.size_bytes)}</p>
                {file.error && <p className="import-batch__rejection">{receiptError(file)} <span>({file.error.code})</span></p>}
              </li>
            ))}
          </ul>
          {state.nextCursor && <button type="button" disabled={busy || !state.fresh} onClick={() => { void workflow.loadMore() }}>Xem thêm biên nhận</button>}
        </section>
      )}
      {sealed && <p className="import-batch__sealed">Để nhập thêm hoặc thay file, hãy bắt đầu lần nhập mới.</p>}
      {batch?.status === 'analyzing' && <p role="status">Đang phân tích dữ liệu…</p>}
      {batch?.status === 'failed' && <p role="status">Phân tích thất bại. Chỉ có thể thử lại khi máy chủ cho phép; tập file vẫn giữ nguyên.</p>}
      {batch && ['review_required', 'ready_for_preview'].includes(batch.status) && <p>Đã kết thúc bước phân tích. Tiếp tục ở bước Ghép cột; chưa ghi dữ liệu nghiệp vụ.</p>}
      {state.draft && <button className="import-batch__new" type="button" disabled={busy || !!state.retryOperation || continuationLocked} onClick={onNewDraft ?? workflow.startNewDraft}>Lô mới — giữ file chưa tải</button>}
    </section>
  )
}
