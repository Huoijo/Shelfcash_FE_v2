import { Link } from 'react-router'
import { formatDate, formatTimestamp, statusLabels } from '../importHistory.format'
import type { HistoryResponse } from '../importHistory.types'

export function ImportHistoryList({ response, timezone, nextLink, firstLink }: {
  response: HistoryResponse
  timezone: string
  nextLink: string | null
  firstLink: string | null
}) {
  const { items } = response.data
  if (items.length === 0) {
    return (
      <div className="history-empty" role="status">
        <h3>{response.meta.unfiltered_date_count === 0 ? 'Chưa có lần nhập nào' : 'Không có kết quả phù hợp'}</h3>
        <p>{response.meta.unfiltered_date_count === 0
          ? 'Chọn một ngày khác trên lịch để xem các lần nhập dữ liệu.'
          : 'Thử thay đổi bộ lọc hoặc chọn ngày khác.'}</p>
        {firstLink && <Link to={firstLink}>Quay lại trang đầu</Link>}
      </div>
    )
  }
  return (
    <>
      <ul className="history-batches">
        {items.map((item) => (
          <li key={item.import_id} className="history-batch">
            <div className="history-batch__title">
              <h3>Import #{item.display_number}</h3>
              <span className={`history-batch__status history-batch__status--${item.status}`}>{statusLabels[item.status]}</span>
            </div>
            <dl>
              <div><dt>Ngày dữ liệu</dt><dd><time dateTime={item.data_date}>{formatDate(item.data_date)}</time></dd></div>
              <div><dt>Đã tải lên</dt><dd><time dateTime={item.imported_at}>{formatTimestamp(item.imported_at, timezone)}</time></dd></div>
              <div><dt>Số file</dt><dd>{item.file_count === null ? 'Chưa biết' : `${item.file_count} file`}</dd></div>
            </dl>
            <Link to={`/imports?import_id=${encodeURIComponent(item.import_id)}`}>{['completed', 'completed_with_warnings'].includes(item.status) ? 'Xem biên nhận Import' : 'Mở lô và tiếp tục xử lý'}</Link>
          </li>
        ))}
      </ul>
      <nav className="history-pagination" aria-label="Phân trang lịch sử nhập">
        <span>{items.length} lần nhập trên trang này</span>
        <div>
          {firstLink && <Link to={firstLink}>Trang đầu</Link>}
          {nextLink && <Link to={nextLink}>Trang tiếp →</Link>}
        </div>
      </nav>
    </>
  )
}
