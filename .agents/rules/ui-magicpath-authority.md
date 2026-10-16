# UI phải tuân theo MagicPath

Áp dụng cho mọi công việc thiết kế, triển khai hoặc sửa UI/interaction của ShelfCash, kể cả khi tích hợp API trước UI.

- MagicPath project `458079658328604672` là nguồn thiết kế UI/interaction. Đối chiếu revision hiện hành của surface và vai trò liên quan trước khi triển khai; không lấy bản legacy đã bị thay thế làm authority.
- “Làm API trước, UI đến sau” chỉ cho phép chuẩn bị typed client, DTO/validation, data/service, logic workflow đã rõ nghiệp vụ và test độc lập với giao diện trong phạm vi được giao. Không đồng nghĩa được tự thiết kế UI trước.
- Không tự tạo màn hình, form, dialog, nút, điều hướng, nhánh tương tác hoặc trạng thái sản phẩm mới để gắn API khi chưa có thiết kế MagicPath phù hợp. API có sẵn không quyết định giao diện và không tự cho phép bật feature đang tạm dừng.
- Chỉ tái sử dụng shared pattern đã được định nghĩa khi không phát sinh quyết định sản phẩm/interaction mới. Không coi một pattern chung là đủ thiết kế cho mọi nhánh nghiệp vụ mới.
- Nếu thiếu thiết kế cần thiết, ghi hoặc cập nhật gap có căn cứ trong [FOUND_MISSING_UI_V1.md](../../docs/status/FOUND_MISSING_UI_V1.md), phân biệt thiếu UI với API TODO/bug tích hợp. Để phần UI chờ MagicPath; tiếp tục phần data/service độc lập đã được giao nếu contract và semantics đủ rõ.
- Không dùng UI tự nghĩ ra, mockup hoặc fallback tạm làm bản production hay coi đó là đóng gap. Test API pass không chứng minh UI đã tích hợp hoặc E2E đã hoàn tất.
- Báo riêng: API/data layer đã chuẩn bị, workflow đã nối, UI đã theo MagicPath, phần chờ thiết kế và mức kiểm chứng. Không gọi client chưa có caller là flow runtime đã hoàn tất.
- Business docs quyết định nghĩa nghiệp vụ; contract hiện hành quyết định wire/quyền/CAS; MagicPath quyết định cách trình bày và tương tác. Nếu các nguồn mâu thuẫn, ghi rõ discrepancy và giữ phần bị ảnh hưởng chưa hoàn tất, không tự sửa policy hay bịa UI để đi tiếp.

Register hiện hành là V1; [FOUND_MISSING_UI.md](../../docs/FOUND_MISSING_UI.md) giữ nguyên làm historical audit evidence. Không chép status cũ đè lên current implementation; tách Design/Frontend/Backend/Live, owner, next action và safe behavior.

Với Import, đồng thời tuân theo [import-ui-design-contract.mdc](../../.cursor/rules/import-ui-design-contract.mdc) và giữ lịch sử gap trong register hiện hành.
