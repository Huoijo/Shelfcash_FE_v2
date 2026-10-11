import { useEffect, useRef } from 'react'
import { formatImportFileSize, importFileLimits } from '../importData.files'
import './ImportHelp.css'

interface ImportHelpProps {
  id: string
  open: boolean
  onClose: () => void
}

// Static guidance from current Import contracts and BE response #004.
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
          <p>Chỉ chọn tệp có phần mở rộng .csv hoặc .xlsx. Thiết bị kiểm tra sơ bộ; khi tải lên, máy chủ xác minh định dạng và quyết định nhận từng tệp.</p>
        </section>

        <section className="import-help__section" aria-labelledby={`${id}-limits`}>
          <h3 id={`${id}-limits`}>Giới hạn mỗi lô</h3>
          <ul>
            <li>Tối đa {importFileLimits.count} tệp mỗi lô.</li>
            <li>Tối đa {formatImportFileSize(importFileLimits.perFileBytes)} mỗi tệp.</li>
            <li>Tổng dung lượng tối đa {formatImportFileSize(importFileLimits.totalBytes)} mỗi lô, tính trước khi giải nén.</li>
          </ul>
          <p>Giới hạn của lô tính tất cả tệp máy chủ đã nhận qua các lần tải. Tệp bị từ chối không dùng hạn mức. Khi chọn cục bộ, lần thêm không hợp lệ giữ nguyên danh sách cũ.</p>
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
          <p>Chọn ngày dữ liệu, rồi nhấn “Tạo lô và tải file”. Mỗi biên nhận cho biết tệp đã nhận hoặc bị từ chối; có thể tải thêm vào cùng lô khi máy chủ cho phép. Tệp đã nhận không thể bỏ hoặc thay thế.</p>
          <p>“Xử lý dữ liệu” yêu cầu xác nhận tập tệp trước khi khóa và phân tích. Sau khi khóa, muốn bổ sung hoặc đổi tệp phải dùng lô mới.</p>
          <p>Lựa chọn file và intent thử lại chỉ giữ trong bộ nhớ, mất khi làm mới/rời khu vực Nhập dữ liệu. URL giữ import ID để đọc lại trạng thái từ máy chủ; cũng có thể mở lô đã tải qua Lịch sử. Draft chưa tải file không được Lịch sử tìm thấy. Sau kết quả chưa xác định, không tải lại như yêu cầu mới.</p>
          <p>Sau phân tích, chọn loại dữ liệu của từng Sheet, khai báo ngữ cảnh nguồn rồi xử lý cột, định danh, quy đổi hoặc shared value theo descriptor máy chủ. Chọn trong danh sách chưa lưu thay đổi. Profile mới/thay đổi cần Owner xem đầy đủ spec và bằng chứng rồi duyệt; resolved không có nghĩa approved.</p>
          <p>Tạo Preview, đọc đủ các trang thay đổi và cảnh báo rồi “Lưu xác nhận review” với lý do. Bước này chỉ lưu xác nhận trên máy chủ, chưa ghi dữ liệu. Sau đó xác nhận từng thay đổi doanh số/điều khoản/phí nếu được yêu cầu, rồi ghi nguyên tử toàn lô. Mapping hoặc dữ liệu nguồn thay đổi có thể làm Preview/review hết hiệu lực.</p>
          <p className="import-help__note">Nhận tệp, phân tích hoặc HTTP202 chưa phải Import thành công. Chỉ biên nhận hoàn tất từ máy chủ xác nhận dữ liệu đã ghi hoặc không có thay đổi. Các trường hợp còn lỗi chặn, stale preview hoặc cần Owner duyệt vẫn bị khóa. Chế độ minh họa không ghi dữ liệu; kết nối thật cần backend, phiên đăng nhập và Store hợp lệ.</p>
        </section>
      </div>
    </dialog>
  )
}
