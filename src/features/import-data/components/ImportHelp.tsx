import { useEffect, useRef } from 'react'
import { formatImportFileSize, importFileLimits } from '../importData.files'
import './ImportHelp.css'

interface ImportHelpProps {
  id: string
  open: boolean
  onClose: () => void
}

// Static preparation guidance from Import Contract V1 §§5, 6, 9.1 and 13.
// Native modal behavior keeps the workspace inert and restores focus on close.
export function ImportHelp({ id, open, onClose }: ImportHelpProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className="import-help"
      aria-labelledby={`${id}-title`}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={onClose}
    >
      <header className="import-help__header">
        <div>
          <h2 id={`${id}-title`}>Hướng dẫn nhập dữ liệu</h2>
          <p>Chuẩn bị tệp trước khi chọn</p>
        </div>
        <button type="button" className="import-help__close" aria-label="Đóng hướng dẫn" autoFocus onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="m4 4 10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="import-help__content" tabIndex={0} role="region" aria-label="Nội dung hướng dẫn">
        <section className="import-help__section" aria-labelledby={`${id}-types`}>
          <h3 id={`${id}-types`}>Loại tệp</h3>
          <div className="import-help__file-types"><span>.csv</span><span>.xlsx</span></div>
          <p>Chỉ chấp nhận tệp có phần mở rộng .csv hoặc .xlsx. Hiện tại, ShelfCash chỉ kiểm tra phần mở rộng, chưa xác minh nội dung tệp.</p>
        </section>

        <section className="import-help__section" aria-labelledby={`${id}-limits`}>
          <h3 id={`${id}-limits`}>Giới hạn mỗi lô</h3>
          <ul>
            <li>Tối đa {importFileLimits.count} tệp mỗi lô.</li>
            <li>Tối đa {formatImportFileSize(importFileLimits.perFileBytes)} mỗi tệp.</li>
            <li>Tổng dung lượng tối đa {formatImportFileSize(importFileLimits.totalBytes)} mỗi lô, tính trước khi giải nén.</li>
          </ul>
          <p>Áp dụng cho toàn bộ danh sách đang chọn, kể cả các tệp đã chọn trước đó. Nếu lần thêm mới không hợp lệ, danh sách cũ được giữ nguyên.</p>
        </section>

        <section className="import-help__section" aria-labelledby={`${id}-categories`}>
          <h3 id={`${id}-categories`}>Dữ liệu có thể chuẩn bị</h3>
          <p>Các nhóm dữ liệu dưới đây thuộc phạm vi nhập khi kết nối máy chủ. Không cần có đủ mọi nhóm trong một tệp.</p>
          <dl className="import-help__categories">
            <div><dt>Lịch sử bán hàng</dt><dd>Số lượng món đã bán theo ngày.</dd></div>
            <div><dt>Kiểm kê tồn kho</dt><dd>Số lượng nguyên liệu của từng lô hàng đã được định danh; không phải ghi nhận hàng mới nhập.</dd></div>
            <div><dt>Công thức</dt><dd>Quan hệ giữa món và nguyên liệu, định lượng và thời gian hiệu lực.</dd></div>
            <div><dt>Nhà cung cấp</dt><dd>Thông tin nhà cung cấp, điều kiện cung cấp và phí thuộc phạm vi hỗ trợ; không phải mọi bảng tính nhà cung cấp.</dd></div>
          </dl>
        </section>

        <section className="import-help__section" aria-labelledby={`${id}-checklist`}>
          <h3 id={`${id}-checklist`}>Trước khi chọn tệp</h3>
          <ul>
            <li>Lưu tệp CSV theo UTF-8.</li>
            <li>Giữ tiêu đề cột và bố cục rõ ràng.</li>
            <li>Bỏ các sheet trống không cần dùng; tệp cần có dữ liệu.</li>
            <li>Kiểm tra ngày, số lượng và đơn vị; không điền 0 cho dữ liệu chưa biết.</li>
            <li>Đối chiếu tệp với đúng cửa hàng và ngữ cảnh nhập. Ngày dữ liệu được chọn không thay thế ngày bán hoặc ngày hiệu lực trong tệp.</li>
          </ul>
        </section>

        <section className="import-help__section" aria-labelledby={`${id}-after-selection`}>
          <h3 id={`${id}-after-selection`}>Sau khi chọn tệp</h3>
          <p>Kéo thả tệp vào vùng chọn hoặc nhấn để chọn từ thiết bị. Các tệp hiện chỉ được kiểm tra sơ bộ trên thiết bị: phần mở rộng, số lượng và dung lượng.</p>
          <p>Danh sách chỉ được giữ trong bộ nhớ trình duyệt. Làm mới trang hoặc rời khu vực Nhập dữ liệu sẽ xóa lựa chọn.</p>
          <p className="import-help__note">Chưa tải tệp lên, tạo lô trên máy chủ hay ghi dữ liệu vào hệ thống. Xác minh nội dung, đối chiếu cột, xem trước và ghi dữ liệu chưa khả dụng; các bước này sẽ được bổ sung khi tích hợp máy chủ.</p>
        </section>
      </div>
    </dialog>
  )
}
