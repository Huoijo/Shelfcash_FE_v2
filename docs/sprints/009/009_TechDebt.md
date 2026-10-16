# 009 — TechDebt cần resolve

Ngày tạo lập: 13/10/2026. General Context: dependencies còn mở sau phản hồi BE, inspect MagicPath mới nhất và triển khai FE prompt 009. Đây là delta sau phản hồi BE và triển khai 009, không phải danh sách khẳng định BE chưa làm mọi mục của 008.

## Những nhận định đã được giải quyết ở mức contract/FE

- V01 đủ discovery nguyên liệu canonical, kể cả chưa có lô: đã dùng picker tìm kiếm/phân trang cho receipt/recipe. Không còn yêu cầu BE tạo endpoint nguyên liệu mới chỉ để bỏ giới hạn current-page/current-recipe.
- N16 có events theo từng `invitation_id`: đã sửa adapter và UI. Không còn gọi feed lời mời toàn Store sai contract.
- M02 có filtered `pagination.total_count`, auto filter đã hỗ trợ: đã dùng đúng scope; không cần bổ sung BE để hiển thị số khớp bộ lọc hiện tại.
- C01 authorized `budget_ceiling=null` xác nhận chưa có cap; N4 create-only đã hỗ trợ. FE đã mở initial-create, giữ zero, replay và conflict handling.
- Preview groups/provenance/before-after/source locations đã có contract và đang hiển thị qua UI hiện hữu. Không yêu cầu BE cung cấp lại các field này.
- Saved requirements refresh/discovery và mock saved/configuration coherence là FE debt; đã sửa trong 009, có test save→use-saved và immutable captured basis.

Các mục này có thể đóng **subtask contract/FE**, chưa thể đóng live-verification chỉ dựa trên tài liệu.

## BE / Product còn cần xử lý

### 009-BE-000 — Bàn giao môi trường và artifact chuẩn

**Loại:** bàn giao/verification; không phải thiếu UI hoặc endpoint tự động.

BE báo HEAD `c58fc75125e49bee2a0b87f647b23d4229418044` + WIP và SHA OpenAPI khác local. Receipt BE gửi lại không chứa evidence nghiệm thu mới. Các integration references trong phản hồi được ghi NOT_RUN; chưa có deployment/worker sẵn sàng được xác nhận.

Cần BE cung cấp:

- OpenAPI artifact chính xác, commit/diff, SHA và ví dụ success/error tương ứng. Không chỉ gửi hash hoặc link nguồn không có trong checkout FE.
- Base URL, build SHA, cách chạy/staging, cấu hình cookie/CORS/CSRF cho FE, worker Import/Planning/PDF và tài khoản test theo quyền/Store.
- Fixtures Store không cap/cap zero, nguyên liệu chưa có lô, danh sách nhiều trang và lời mời ở từng trạng thái.
- Kết quả integration thực thi: CAS, create race, lost ACK/idempotency, signed cursor, isolation, authorization và binary PDF/hash; request IDs để đối chiếu.
- Người phụ trách và ngày bàn giao thực tế. Các ngày “đề nghị” trong phản hồi không coi là cam kết.

**Gate đóng:** đối chiếu artifact và chạy FE→BE thật các luồng current-contract. Hiện localhost:18001 không kết nối được; Playwright intercept không thay thế gate này.

### 009-BE-001 — Public signup / reset request (TD-BE-001)

**Loại:** Product chưa duyệt + thiếu contract cho luồng public. M01/M02.

N7 chỉ hoàn tất mật khẩu bằng token từ assisted provisioning, không tạo tài khoản hoặc tự yêu cầu reset. Product xác nhận tiếp tục assisted-only thì nghiệm thu theo phạm vi đó; nếu muốn self-service, cần contract luồng request/delivery/rate-limit/token lifecycle, payload/error, rights và test. Không chặn việc dùng Login/N7 hiện có.

### 009-BE-002 — Từ chối lời mời (TD-BE-002)

**Loại:** Product/lifecycle ngoài contract. M02.

N12 hiện chỉ nhận `accept:true`. Cần Product bỏ decline khỏi tiêu chí nghiệm thu hoặc BE bàn giao action/lifecycle/error/idempotency đã duyệt. Không dùng `accept:false`, revoke hoặc lỗi 422 để giả lập decline. Accept hiện có có thể kiểm thử riêng.

### 009-BE-003 — Timeline quản trị hợp nhất (phần còn lại TD-BE-003)

**Loại:** Product/scope đọc. M02.

N14 toàn Store và N16 theo invitation đều đã có adapter. Nếu vẫn yêu cầu một timeline hợp nhất/filter global, cần contract ordering/snapshot/pagination/filter và quyền; nếu chấp nhận hai feed riêng thì đóng yêu cầu UI hợp nhất. Không yêu cầu sửa N16 thành global nếu chưa duyệt.

### 009-BE-005 — Aggregates theo file/sheet (phần còn lại TD-BE-005)

**Loại:** thiếu fields/aggregates hoặc Product thu gọn. M03.

M01 progress và M02 `counts` là toàn batch; `pagination.total_count` là filtered total. Cần aggregates có scope rõ ràng và pin mapping revision nếu muốn badges auto/origin/approval theo file/sheet. Test nhiều file/sheet, >limit, bộ lọc rỗng khác batch rỗng. Không cộng số trang FE hoặc đồng nhất resolved với auto.

### 009-BE-006 — Raw cells và per-file preview aggregates (phần còn lại TD-BE-006)

**Loại:** dữ liệu ngoài contract hiện tại. M05.

Groups, row canonical before/after và provenance hiện có không bị chặn nữa. Nếu thiết kế bắt buộc raw cell viewer/tổng per-file, cần field/pagination/redaction/snapshot contract tương ứng hoặc Product bỏ khỏi nghiệm thu. Inventory import là stock-count theo lô; receipt thực nhận dùng N6, không đổi nghĩa import thành đơn nhận hàng.

### 009-BE-007 — Supplier/location discovery (phần còn lại TD-BE-007)

**Loại:** Product/discovery còn thiếu. M06/M07.

Canonical ingredient discovery đã giải quyết bằng V01. N6 chấp nhận supplier/cost/received date nullable; FE đang dùng trường hợp này. Nếu yêu cầu chọn supplier/location đầy đủ, cần discovery API/permission/active/version/currency/unit semantics hoặc duyệt cách nhập locator đã xác minh. Không tự suy supplier từ lô cũ hay terms. BE cần live fixture nguyên liệu expiry-tracked để kiểm thử expiry bắt buộc; không suy tracking từ expiry của lô hiện hữu.

### 009-BE-008 — History filters và tìm PDF mất locator (phần còn lại TD-BE-008)

**Loại:** thiếu query/discovery hoặc Product thu gọn. M09.

N9 hiện hỗ trợ status/forecast-start, không creator/created-at; RunSummary cũng không có captured budget. Cột ngân sách FE hiện hiển thị “Xem trong Run”. Nếu cần ngân sách ngay tại danh sách, bổ sung captured value/currency/null semantics vào N9; không thay bằng Store cap hiện hành. N10/J01/N11 có thể tiếp tục khi còn run/export/job locator hoặc intent cùng key/body. Nếu cần tìm lại mọi PDF sau mất locator, cần endpoint list/discovery; đồng thời chốt retention/purge SLA. Luồng PDF hiện tại không cần chờ extension này để test.

### 009-BE-010 — Store profile/settings writers (phần còn lại TD-BE-010)

**Loại:** thiếu writer/policy Product. M11.

Initial cap absence/create đã giải quyết; không giữ làm lý do block. Các profile, ngôn ngữ, lịch nhận hàng chung, priority mặc định và open-PO semantics chưa có writer được duyệt thì chỉ đọc/không khả dụng. Product xác nhận readonly scope hoặc BE giao endpoint/payload/permission/CAS/idempotency/effective-date. Không lưu các settings này chung request N4.

## FE / QA còn lại — không quy cho BE

### 009-FE-001 — Mock xuyên workspace

M00/M15 chưa có fake auth/session/invitation/import/menu/recipe→Planning thống nhất. Import còn nguồn synthetic riêng, recipe không thay đổi basis của engine mock; mock reset khi reload. Chưa có PDF worker mock hoàn chỉnh; PDF được kiểm thử bằng controlled API. Scenario picker không chứng minh toàn bộ adapters hỗ trợ mọi fault. Đây là FE work nếu muốn nghiệm thu mock E2E toàn phạm vi; không phải yêu cầu BE thêm endpoint.

### 009-FE-002 — Đã đóng các phần FE/UX trước đây; còn nghiệm thu rộng

Đã đóng subtask UI/controlled của recipient states và chọn đúng Store sau acceptance, Preview group/row drawer/provenance, receipt Review/dirty close/readback recovery, recipe diff/confirmation, Saved draft mode preservation, History pagination/filter-empty, Planning lifecycle/reasons và PDF alternative/download retry. Không giữ các mục này dưới nhãn “chưa có UI”.

Phần còn lại là QA sâu: nhiều invitation/Store và quyền bị thu hồi giữa các bước; receipt expiry-tracked/canonical paging nhiều trang; Recipe date-edit/withdraw/conflict và reload known-change; Import nhiều file/sheet/provenance/filter cùng snapshot; Saved archive/conflict/permission recovery; PDF long-running/status error/retention và resume. Có workflow/unit coverage cho một số nhánh, nhưng chưa có browser hoặc live evidence toàn ma trận. Owner: FE/QA phối hợp BE cho fixtures thật. Gate đóng: lưu test evidence theo từng nhánh, không chỉ tổng số test.

### 009-FE-003 — Coverage và hiệu năng

M15 chưa bao phủ hết A/B/C, permission revocation/403, Store switch khi pending, keyboard/reduced-motion và mọi viewport. Build vẫn có chunk chính 985.53 kB minified (267.31 kB gzip); cần đo/split phù hợp, không chỉ nâng ngưỡng warning. Lint còn 2 cảnh báo set-state-in-effect tại OnboardingPages và RecipeSchedulePage. Không dùng số test passed hiện tại để tuyên bố ma trận đầy đủ.

## Phân biệt với thiết kế mới

Các label/fields prototype chưa có dữ liệu hoặc semantics server không tự trở thành API mới: password 8 ký tự được giữ theo BE 12–128; token invalid/expired/used giữ thông báo chung; invitation không tiết lộ email đích/Store trước xác thực; tên supplier không gửi vào UUID; raw cells và History budget thiếu được ghi đúng dữ liệu còn thiếu; priority/open-PO không ghi qua C02/N4. Những điểm này cần quyết định Product hoặc extension contract tương ứng nếu muốn nghiệm thu nguyên prototype, không phải lý do dừng các flow current-contract đã hoàn thiện.

## Cách đóng debt

Chỉ đóng đúng subtask có evidence. Contract đã rõ có thể chuyển sang FE implementation/test; endpoint/field thiếu cần BE hoặc quyết định thu gọn của Product; live chưa chạy cần môi trường/worker và test thật. Không đánh dấu toàn milestone COMPLETE khi một trong ba lớp còn mở.
