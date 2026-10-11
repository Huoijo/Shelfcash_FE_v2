# ShelfCash FE v2 - Thư viện Báo cáo & Tài liệu Kiến trúc (Docs Library)

Thư mục này đóng vai trò như một **thư viện tài liệu (living documentation library)** của dự án ShelfCash Frontend v2. Mục đích nhằm ghi nhận lịch sử ra quyết định, kiến trúc hệ thống và giúp bất kỳ lập trình viên nào mới tham gia dự án cũng có thể truy cập và nắm bắt bối cảnh (context) nhanh chóng.

---

## Quy ước Mỗi Báo cáo (Document Standards)

Mỗi bản báo cáo trong thư viện bắt buộc phải bao gồm các metadata chuẩn sau ở phần mở đầu:
1. **Số thứ tự (ID)**: Ví dụ `#001`, `#002`, ...
2. **Tiêu đề (Title)**: Rõ ràng, mô tả đúng nội dung/phạm vi kỹ thuật.
3. **General Context**: Bối cảnh ra đời, động lực kỹ thuật và mục tiêu của lần thay đổi.
4. **Ngày tạo lập (Creation Date)**: Định dạng `DD/MM/YYYY`.

---

## Danh mục Báo cáo Kiến trúc (Architecture Reports Catalog)

| STT | Tiêu đề Báo cáo | Bối cảnh Tổng quan (General Context) | Ngày tạo lập | Tài liệu chi tiết |
| :---: | :--- | :--- | :---: | :---: |
| `#001` | **Thiết lập Nền tảng Dự án & Định hướng Kiến trúc** | Tái khởi tạo ShelfCash từ đầu (React 19 + TypeScript + Vite), loại bỏ boilerplate thừa, thiết lập layout tối giản (Header với ShelfCash & Đăng nhập) và định hướng kiến trúc phân tầng 4 lớp (`app`, `pages`, `features`, `shared`). | 05/10/2026 | [001-architecture-foundation.md](./001-architecture-foundation.md) |
| `#002` | **Technical Debt & Integration TODO** | Theo dõi công việc đã có evidence cần hoàn tất trước staging/production và tích hợp BE; không thay đổi hành vi ứng dụng. | 10/10/2026 | [002-technical-debt-and-integration-todo.md](./002-technical-debt-and-integration-todo.md) |
| `#006` | **Decision / Planning E2E integration** | Canonical C01/R01/C02/C03/C04/C05/C08, MagicPath mapping, controlled checks và live blocker; không chứng nhận live completion. | 11/10/2026 | [006-decision-planning-e2e-integration.md](./006-decision-planning-e2e-integration.md) |

---

## Hướng dẫn Bổ sung Báo cáo Mới

Báo cáo `#006` — [Decision / Planning E2E integration](./006-decision-planning-e2e-integration.md), 11/10/2026: status PARTIAL, API topology hiện hành, mapping hai màn hình MagicPath, lifecycle/retry, concerns, test evidence và exact M09 file manifest. First live blocker là connection refused trước A03; không gọi mock/SSR là live.

Khi có thay đổi lớn về kiến trúc hoặc hoàn thành một cột mốc kỹ thuật (milestone):
1. Tạo file mới theo định dạng: `docs/NNN-<ten-ngan-gon-bang-tieng-anh-hoac-viet>.md` (ví dụ: `docs/002-routing-and-auth-setup.md`).
2. Điền đầy đủ metadata: Số thứ tự, Tiêu đề, Ngày tạo lập, General Context.
3. Cập nhật bản ghi mới vào bảng Danh mục phía trên trong file `docs/README.md`.
