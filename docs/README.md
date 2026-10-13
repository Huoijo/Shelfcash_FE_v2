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
| `#007` | **Store Workspace E2E integration** | Multi-Store context, Owner Staff grants/invitations, known budget ceiling, complete field/default audits; controlled verification, không claim live. | 11/10/2026 | [007-store-workspace-e2e-integration.md](./007-store-workspace-e2e-integration.md) |
| `#008` | **Audit MagicPath và checklist milestone E2E** | Đối chiếu 12 design mới với FE và OpenAPI V2; lộ trình mock E2E, BE-ready, kiểm thử và các gap contract. | 12/10/2026 | [008-magicpath-e2e-milestones.md](./008-magicpath-e2e-milestones.md) |
| `#008-I` | **Implementation Receipt MP-M00–MP-M15** | Các operation FE mới, evidence mock/controlled/live, remaining FE work và milestone matrix. | 12/10/2026 | [008_Implementation_Receipt.md](./008_Implementation_Receipt.md) |
| `#008-TD` | **Backend / Product TechDebt** | 13 dependency contract/Product có evidence và acceptance; không thay FE TODO list. | 12/10/2026 | [008_TechDebt.md](./008_TechDebt.md) |

---

## Hướng dẫn Bổ sung Báo cáo Mới

Báo cáo bổ sung `#003` — [Import Flow Integration: evidence and handoff](./003-import-flow-integration.md), 11/10/2026: phạm vi FE continuation đã làm, kiểm thử controlled, bằng chứng backend và các ranh giới contract/live còn bị chặn. Không chứng nhận toàn bộ luồng Import thật đã hoàn tất.

Báo cáo `#004` — [BE clarification sau rà soát contracts](./004-import-flow-be-clarification.md), 11/10/2026; response BE tại [004_IMPORT_FLOW_BE_RESPONSE_VI.md](../api-contract-v1/004_IMPORT_FLOW_BE_RESPONSE_VI.md).

Báo cáo `#005` — [Import input và schema mapping](./005-import-input-schema-mapping.md), 11/10/2026: cập nhật FE theo response BE, typed resolutions/Owner approval, server review, resume locator và verification hiện tại. Không thay thế evidence lịch sử bằng live acceptance.

Báo cáo `#006` — [Decision / Planning E2E integration](./006-decision-planning-e2e-integration.md), 11/10/2026: status PARTIAL, API topology hiện hành, mapping hai màn hình MagicPath, lifecycle/retry, concerns, test evidence và exact M09 file manifest. First live blocker là connection refused trước A03; không gọi mock/SSR là live.

Khi có thay đổi lớn về kiến trúc hoặc hoàn thành một cột mốc kỹ thuật (milestone):
1. Tạo file mới theo định dạng: `docs/NNN-<ten-ngan-gon-bang-tieng-anh-hoac-viet>.md` (ví dụ: `docs/002-routing-and-auth-setup.md`).
2. Điền đầy đủ metadata: Số thứ tự, Tiêu đề, Ngày tạo lập, General Context.
3. Cập nhật bản ghi mới vào bảng Danh mục phía trên trong file `docs/README.md`.

### Prompt 009 — phản hồi BE và cập nhật thiết kế MagicPath

- [009 Implementation Receipt](009_Implementation_Receipt.md): triển khai bảy flow theo MagicPath mới, giữ contract BE; 350 unit/component/workflow tests và 22 browser tests đạt.
- [009 TechDebt cần resolve](009_TechDebt.md): dependencies BE/Product, live verification và FE/QA còn lại; không bao gồm phạm vi Underconstruction.
- [Underconstruction_by_BE](Underconstruction_by_BE.md): M04/M10/M12/M13/M14 tạm dừng theo chủ dự án; entry FE thông báo đang xây dựng.
