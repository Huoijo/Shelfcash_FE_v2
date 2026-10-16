# 014 — Import UI State Playground

14/10/2026. Mở `/imports` trong development → nút fixed **Debug** → **UI State Preview**.

## Dùng để review UI

1. **Role** chọn OWNER hoặc STAFF, không đổi membership/quyền thật của tài khoản.
2. **Step** lọc catalog theo sáu bước của role.
3. **Scenario** đổi màn Import phía sau ngay, không reload hoặc đổi URL/lô thật.
4. **Previous state / Next state** đi theo happy path chuẩn. Nếu đang ở nhánh ngoài happy path, Next bắt đầu từ File Ready; Previous đi tới Final.
5. **Data condition** chọn Đủ dữ liệu / Thiếu dữ liệu / Dữ liệu mơ hồ / Dữ liệu lỗi. Preset chuyển tới ví dụ phù hợp và mang condition theo khi đổi Step/Scenario. Reset/Role/Happy path shortcut và Previous/Next trả condition về sufficient.
6. **Simulate error** mở ngay Analyze failed, Source unresolved, Permission revoked, Profile retired, Preview stale/blocked, Commit failed, Lost acknowledgement hoặc Readiness not ready.
7. **Happy path** có OWNER/STAFF Start và Final. **Reset scenario** dựng lại File Ready sạch cho role đang chọn.
8. Đóng Debug để kiểm tra UI và dùng các nút sản phẩm. **Return to current import** thoát playground, khôi phục màn/lô/file trước đó.

Diagnostics, current IDs, capacity, receipts, raw state và scenario picker toàn ứng dụng cũ nằm trong **Advanced diagnostics**, mặc định thu gọn. Picker cũ chỉ cần khi kiểm tra account/store/grants của toàn ứng dụng; nó vẫn có reset/reload theo convention cũ. Các control chính của Import Playground không dùng picker đó.

## Catalog

- **OWNER: 40 scenarios.** File 5, Analyze 8, Resolve 7, Profile approval 7, Preview/Commit 10, Completion 3.
- **STAFF: 41 scenarios.** File 5, Analyze 9, Resolve/Owner approval 13, Preview 4, Commit 7, Completion 3.

Tất cả scenario được định nghĩa có type trong `src/shared/debug/importPlayground.catalog.ts`. Hai happy path:

- Owner: File Ready → Analyze Complete → Resolve Complete → Profile Review → Profile Approved → Preview → Review → Processing → Completed + Ready.
- Staff: File Ready → Analyze Complete → Approved Profile Reused → Preview → Review → Processing → Completed + Ready.

Processing và Waiting được giữ ổn định để review, không tự biến mất theo timer prototype. Sau một thao tác sản phẩm, session tiếp tục qua mock workflow bình thường và polling mock nếu cần.

## Dữ liệu và giới hạn

Mỗi lựa chọn dựng một mock world riêng, sử dụng public actions của ImportBatchWorkflow/ImportFlowWorkflow để chuẩn bị các phase hợp lệ. Seed tải descriptor trước khi confirm mapping; review/commit dùng pin, confirmation và intent trong mock world đó.

Các nhánh nguồn/ambiguity/identity/declaration/unit/retirement/approval rejection hoặc warning/blocker là **DEV visual projections**, không phải khẳng định backend cung cấp outcome/candidate API. Thao tác sản phẩm đầu tiên bỏ projection và tiếp tục mock workflow; source/grants/validation của production không đổi. New entity và missing declaration mở đúng editor/form của component thật.

Lost acknowledgement dùng một mock commit đã nhận nhưng response bị mất, giữ pending intent để retry cùng mock batch. Readiness được inject riêng: completion vẫn thành công khi planning bị chặn vì supplier cost/inventory completeness/declaration thiếu. Bấm kiểm tra Readiness trong playground không gọi R01 thật.

Playground dùng lại ImportPage/Analyze/Flow/Mapping/Preview/Result/Readiness hiện hành; không có bản sao HTML của màn sản phẩm. Nó không đọc dữ liệu thật để giả fixture, không nhận API client, không ghi lô hoặc sửa membership thật. Refresh toàn trang không lưu playground state; URL tiếp tục là locator của lô thật.

Không dùng playground để nghiệm thu API semantics hoặc tuyên bố đã resolve debt 012/013. Source-candidate/outcome/raw-cell/A1/A2 runtime gaps và Underconstruction vẫn giữ nguyên.

## Layout, keyboard và production

Trigger/drawer cố định, không resize/push nội dung trang. Debug dùng được trong native product dialog; Escape đóng Debug trước và focus quay lại trigger. Khi preview tạm ẩn lô thật, native dialog của lô đó cũng tạm đóng top layer rồi mở lại khi thoát, giữ draft và component state.

DEV lazy boundary không được bundle như route runtime trong production; không có Debug/Role/Step/Scenario controls trong production UI. Advanced diagnostics không nằm trong primary hierarchy.
