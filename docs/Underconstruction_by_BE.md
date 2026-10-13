# Underconstruction_by_BE

Ngày chốt phạm vi: 2026-10-13 · Prompt 009.

Theo yêu cầu của chủ dự án, **M04, M10, M12, M13 và M14 được tạm dừng**. Không tiếp tục phát triển nghiệp vụ, bổ sung API suy đoán hoặc đưa các mục này vào backlog thực thi 009. Chỉ mở lại khi có chỉ đạo mới của chủ dự án. Tài liệu này là nơi lưu phạm vi đang chờ; không có nghĩa BE đã cam kết ngày hoàn thành.

## M04 — Mapping toàn cửa hàng

- Phạm vi tạm dừng: queue Owner duyệt toàn Store, khám phá profile active/retired, quản lý vòng đời toàn Store, thao tác Submit riêng nếu chưa có contract.
- Phản hồi liên quan: TD-BE-004 trong `BE_answer/008_TechDebt.md`. Chưa có global queue/discovery đáp ứng thiết kế; per-profile/per-import API không thay thế global queue.
- FE: nút “Duyệt mapping toàn cửa hàng” trong workspace Import mở thông báo đang xây dựng.
- **Mapping trong một lần import vẫn hoạt động**, bao gồm các thao tác đã có contract. Không tắt upload, analyze, resolve mapping hoặc Preview/Commit.

## M10 — Today

- Phạm vi tạm dừng: tổng quan vận hành, pending decisions, outlook 7 ngày, arrivals và signals.
- Phản hồi liên quan: TD-BE-009. Các read kho hiện có không cung cấp toàn bộ ngữ nghĩa Today.
- FE: `/today` và mục “Hôm nay” mở trang “Hôm nay đang được xây dựng”. Không tiếp tục dùng tổng kho làm bằng chứng nghiệm thu Today.

## M12 — Contextual AI

- Phạm vi tạm dừng: hỏi đáp AI theo tồn kho, món và kế hoạch; evidence, provider, lifecycle và quyền truy cập tương ứng.
- Phản hồi liên quan: TD-BE-011. Chưa có contract hỏi đáp được duyệt.
- FE: các nút “Hỏi AI”, “Hỏi AI về tồn kho”, “Hỏi AI về món này” mở thông báo đang xây dựng.
- Giải thích kết quả đã lưu qua C05/C08 vẫn được giữ: đây là dữ liệu engine đã có contract.

## M13 — What-if

- Phạm vi tạm dừng: tạo, chạy, lưu và so sánh kịch bản giả định.
- Phản hồi liên quan: TD-BE-012. Chưa có request/basis/lifecycle được duyệt.
- FE: nút “Kịch bản giả định” mở thông báo đang xây dựng. Không thêm field What-if vào C02.

## M14 — Draft Purchase Orders

- Phạm vi tạm dừng: chuyển retained plan/option thành Draft PO và toàn bộ vòng đời đơn hàng.
- Phản hồi liên quan: TD-BE-013. Thiếu thiết kế downstream và contract nghiệp vụ được duyệt.
- FE: nút “Tạo Draft PO” mở thông báo đang xây dựng.
- Xuất PDF và ghi nhận hàng thực nhận vẫn là các luồng độc lập đã có contract; không tạo PO ngầm.

## Hành vi giao diện chung

Thông báo nêu tính năng đang được xây dựng và sẽ có ở bản cập nhật sau. Dialog có tiêu đề và nút Đóng; có thể đóng bằng Escape. Các entry này không gọi writer cho nghiệp vụ tạm dừng. Nội dung giao diện không công bố lịch ra mắt chưa được xác nhận.

Kiểm thử: `tests/e2e/operations.mock.spec.ts` kiểm tra entry mapping toàn Store, Today, AI kế hoạch, What-if và Draft PO. Nút AI tại Kho/Menu dùng cùng component thông báo.
