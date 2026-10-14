# FE → BE 013 — Import display capabilities

**FE PROPOSAL TO BE — not runtime API.** 14/10/2026. Bổ sung request 012; không thay existing I01–I06/J01/M01–M04/N5/R01, không yêu cầu global queue/notifications/underconstruction.

## 1. Business display names của immutable Preview

Flow: Preview groups → dòng dữ liệu → before/after → Review.

FE cần tên hoặc business code dễ đọc cho ingredient/product/supplier/lot được tham chiếu trong đúng snapshot Preview. Canonical IDs vẫn là authority cho identity và mutation; display name không được dùng làm key hoặc suy ra matching.

Expected capability: name/code gắn đúng reference và đúng retained snapshot/source pin; phân biệt missing label với empty/unknown entity. Không dùng catalog hiện tại để silently đổi cách hiển thị lịch sử. BE chốt capability này thuộc read model hiện có hay mở rộng contract nào; FE không đề xuất route/DB implementation cụ thể.

Hiện FE chỉ dùng source token khi retained identity rule chỉ rõ cùng canonical ID; thiếu label hiện “Tên chưa được cung cấp”. Không giả tên từ UUID hoặc demo.

## 2. Friendly source/report labels

Flow: Source context, Analyze readout, Profile review.

FE cần display label cho source system/report type đã được xác nhận nếu namespace/key không nằm trong known catalog. Key hiện hành vẫn gửi nguyên vẹn; display label không phải bằng chứng nguồn và không thay source verification. Cần phân biệt chưa xác nhận với đã xác nhận nhưng thiếu label. Không xin lại scope/source_context/provenance đã có.

## 3. Aggregate warning capability

Flow: Preview overview trước khi đọc toàn bộ pages.

FE cần BE xác nhận metric “Cảnh báo” là số dòng có warning hay số warning occurrences, phạm vi toàn snapshot hay từng group. Nếu có aggregate, phải cùng immutable Preview pin, không thay đổi theo page/filter đang nhìn. Unknown khác zero. T hiện không đảm bảo exact total nên FE hiển thị Có/Không/—, không đếm một trang rồi coi là toàn batch.

Đây là đề xuất product/display semantics, chưa phải endpoint hoặc response field đã tồn tại. BE có thể chốt reuse capability hiện hành nếu đã đủ, kèm authority/source/OpenAPI và semantics để FE integrate.
