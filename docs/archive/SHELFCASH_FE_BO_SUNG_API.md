# ShelfCash — Yêu cầu bổ sung frontend theo API backend hiện hành

Ngày đối chiếu: **12/10/2026**.

## 1. Mục đích và căn cứ

Tài liệu này là backlog tích hợp FE, không thay thế API contract hoặc tự bổ sung endpoint mới.

Căn cứ:
- Danh sách BE do nhóm cung cấp: **53 HTTP operations nghiệp vụ + GET /health**, đối chiếu từ OpenAPI sinh từ code.
- Tài liệu FE `008-fe-pages-actions-api.md`, cập nhật 12/10/2026, mô tả lời gọi và workflow trong source hiện tại.

Kết quả đối chiếu method/path: FE mô tả sử dụng **38/53 operations nghiệp vụ**; **15 operations chưa có tác vụ sử dụng được mô tả**. Chưa thấy method/path không khớp trong những operations FE liệt kê.

Đây chưa phải kiểm thử FE–BE trực tiếp. Body, response, headers, permissions, enum và xử lý lỗi cần đối chiếu OpenAPI/contract hiện hành và kiểm thử thực tế. “Chưa dùng” không đồng nghĩa “endpoint thừa”.

Base URL local hiện tại: `http://localhost:18001`. Chỉ cấu hình trong biến môi trường, không hardcode vào component.

## 2. Thứ tự triển khai đề xuất

| Ưu tiên | Cụm | Lý do |
| --- | --- | --- |
| P0 | Hoàn tất mật khẩu và nhận lời mời Staff | Đóng luồng onboarding; hiện Owner mời được nhưng người nhận chưa accept qua UI |
| P0 | Tạo trần ngân sách ban đầu | UI hiện chỉ sửa trần đã tồn tại; cần kiểm tra và xử lý Store chưa có cấu hình |
| P1 | Requirements default/custom/saved | Hoàn thiện cách người dùng đặt điều kiện cho kế hoạch |
| P1 | Lịch sử PlanningRun và PDF | Mở lại và mang kế hoạch ra sử dụng |
| P1 | Nhận hàng/tồn đầu kỳ và ngưỡng kho | Bổ sung nguồn tồn kho vận hành có kiểm quyền |
| P2 | Timeline và thay đổi hiệu lực công thức | Hoàn thiện quản lý recipe có version |
| P2 | Audit phân quyền | Cho Owner kiểm tra lịch sử thay đổi quyền |

Thứ tự trên là đề xuất tổ chức công việc, không loại bỏ tính năng đã duyệt khỏi phạm vi.

## 3. Hoàn tất tài khoản và invitation

### 3.1. Hoàn tất thiết lập/reset mật khẩu

**API chưa dùng:** `POST /api/v1/auth/credentials/complete`.

Bổ sung màn hình nhận token theo cơ chế delivery/link trong contract, nhập và xác nhận mật khẩu, gửi yêu cầu hoàn tất. Không tạo API đăng ký hoặc quên mật khẩu mới.

- Dùng đúng schema và cơ chế Origin/CSRF của endpoint này; không mặc định áp dụng cấu hình protected mutation nếu endpoint là public.
- Không ghi token vào log, analytics hoặc thông báo lỗi.
- Phân biệt token hết hạn, đã dùng, không hợp lệ và lỗi mạng theo error contract.
- Sau thành công, điều hướng theo response/contract; không giả định tự đăng nhập nếu BE không cấp session.

Acceptance: token hợp lệ thành công; token hết hạn/đã dùng không thành công; lỗi mạng được xử lý theo semantics của BE.

### 3.2. Người nhận xem và chấp nhận lời mời

**Hai API chưa dùng:**
- `GET /api/v1/staff-invitations/{invitation_id}`
- `POST /api/v1/staff-invitations/{invitation_id}/accept`

Luồng cần bổ sung:
1. Mở link invitation, giữ locator an toàn khi chuyển sang đăng nhập.
2. Đăng nhập bằng tài khoản có email đã xác minh phù hợp.
3. Gọi GET review với invitation proof/header đúng contract.
4. Hiển thị Store, quyền đề nghị và trạng thái có thể chấp nhận.
5. Người nhận xác nhận; POST accept theo body/headers contract.
6. Sau thành công, đọc lại danh sách Store/context để thấy membership mới.

Không cấp quyền tại FE chỉ vì có link hoặc nhận được email.

Acceptance:
- Đúng tài khoản và lời mời còn hiệu lực: accept thành công.
- Sai tài khoản, token hết hạn hoặc lời mời bị revoke: không accept.
- Retry giữ đúng intent/idempotency nếu endpoint yêu cầu.
- Replay accept cũ không khôi phục grants đã bị Owner thu hồi.

Các API Owner tạo, đọc và reissue/revoke invitation đã được FE mô tả sử dụng; tiếp tục tái sử dụng workflow hiện có.

## 4. Planning requirements và ngân sách

### 4.1. Tạo trần ngân sách lần đầu

**API đã có adapter nhưng UI chưa đủ:** `PUT /api/v1/stores/{store_id}/planning-budget`.

Theo báo cáo FE, UI chỉ sửa trần đã đọc được; adapter hỗ trợ tạo với `If-None-Match: *`.

Bổ sung nhánh tạo khi BE xác nhận chưa có cấu hình và người dùng có quyền. Không coi UNKNOWN, không có quyền đọc hoặc lỗi tải là “chưa có trần”. Nhánh thay thế dùng `If-Match` đúng version.

Phân biệt:
- Trần ngân sách Store: cấu hình được lưu.
- Ngân sách một Run: input cho lần chạy, không tự sửa trần Store.

Acceptance: tạo lần đầu, sửa với version đúng, conflict khi stale, thiếu quyền, và retry mutation chưa biết kết quả.

### 4.2. Default / custom / saved

**Ba API chưa dùng:**
- `POST /api/v1/stores/{store_id}/planning-requirements`
- `GET /api/v1/stores/{store_id}/planning-requirements/{saved_requirement_id}`
- `PUT /api/v1/stores/{store_id}/planning-requirements/{saved_requirement_id}`

Tiếp tục dùng `GET /api/v1/stores/{store_id}/planning-context` cho cấu hình/capabilities theo contract. Ba API trên không gồm endpoint list riêng; không tự tạo route list, dùng nguồn discovery đã quy định trong planning context/contract.

Cần kiểm tra và hoàn thiện UI:
- Default: hiển thị requirements thực tế từ BE.
- Custom: chỉnh các fields được contract cho phép; không chỉ đổi nhãn “tiết kiệm/cân bằng”.
- Saved: chọn, đọc, dùng và quản lý bộ đã lưu theo quyền.
- Save độc lập với chạy planning. Không buộc tạo Run để lưu.
- Owner quản lý mọi bộ trong Store; Staff chỉ sửa/lưu trữ bộ mình tạo theo quyền được cấp.
- Cách lưu trữ bộ sử dụng đúng schema PUT hiện hành; không tự thêm DELETE.
- Giữ semantics omitted/null/zero/[]; không chuẩn hóa tất cả thành cùng giá trị.

Requirements là điều kiện đánh giá các phương án. Ngân sách là mức trần. Winner là đề xuất của engine theo requirements, không phải xác nhận mua hàng.

Acceptance: chạy bằng default/custom/saved; lưu và đọc lại; stale version; Staff sửa bộ người khác bị chặn; thay bộ đã lưu không thay đổi Run đã accepted.

## 5. Lịch sử kế hoạch và PDF

**Ba API chưa dùng:**
- `GET /api/v1/stores/{store_id}/procurement-plans`
- `POST /api/v1/procurement-plans/{plan_id}/exports`
- `GET /api/v1/procurement-plans/{plan_id}/exports/{export_id}`

### 5.1. Lịch sử

Bổ sung danh sách Run theo paging/filter contract. Mở một Run bằng locator `plan_id`, tái sử dụng `GET /api/v1/procurement-plans/{plan_id}`.

Hiển thị riêng lifecycle, winner/no-winner và mức độ chứng minh khi response cung cấp. Không coi winner null là lỗi kỹ thuật, cũng không coi UNPROVEN là infeasible.

### 5.2. PDF

Cho phép xuất kết quả/phương án được contract hỗ trợ, bao gồm winner hoặc phương án khác đủ điều kiện export. Tạo export job, theo dõi qua `GET /api/v1/jobs/{job_id}`, rồi tải PDF bằng endpoint export.

Dùng xử lý response nhị phân đúng Content-Type/Content-Disposition; không đưa PDF qua JSON parser. Download phải gửi cookie và BE kiểm quyền hiện hành.

Không thêm “xác nhận chọn phương án” hoặc tự tạo Purchase Order. Chọn phương án để xem/in không ghi đè winner.

Acceptance: xuất và tải thành công; reload/mở lại export theo locator; thiếu/thu hồi quyền bị chặn; export chưa xong không báo tải thành công.

## 6. Kho: nhận hàng và ngưỡng tồn

**Hai API chưa dùng:**
- `POST /api/v1/stores/{store_id}/inventory/receipts`
- `PUT /api/v1/stores/{store_id}/inventory/{ingredient_id}/threshold`

Bổ sung form nhập tồn đầu kỳ/hàng thực nhận theo schema receipt, và form cấu hình ngưỡng Ingredient.

Phân biệt hàng thực nhận với purchases giả định trong PlanningRun. Receipt là thao tác ghi dữ liệu vận hành; xem hoặc in kế hoạch không tạo lot/movement.

Giữ quantity/tiền dạng exact string theo schema; không dùng Number để tính lại giá trị nghiệp vụ. Units, dates và nguồn dữ liệu lấy theo contract.

Acceptance: receipt hợp lệ tạo lot/movement; retry không nhập hai lần; kiểm quyền ghi độc lập quyền xem; ngưỡng chưa khai báo không hiển thị thành 0; đọc lại Kho sau ghi thành công.

## 7. Công thức: lịch hiệu lực

**Ba API chưa dùng:**
- `GET /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule`
- `POST /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule/changes`
- `GET /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule/changes/{change_id}`

Bổ sung drawer/tab timeline trong Menu:
1. Đọc lịch recipe.
2. Chuẩn bị thay đổi và gọi POST với phase preview.
3. Hiển thị tác động, warnings/blockers.
4. Xác nhận và commit bằng phase tương ứng.
5. Đọc lại bằng chứng change đã lưu.

Không suy preview là commit. Theo policy đã duyệt, thay đổi chỉ từ ngày Store kế tiếp trở đi, không sửa lịch sử hoặc Run đã lưu.

Acceptance: preview không ghi thay đổi; commit đúng version; conflict khi timeline đã đổi; ngày không hợp lệ bị chặn; kết quả giữ nguyên Run cũ.

## 8. Audit phân quyền

**API chưa dùng:** `GET /api/v1/stores/{store_id}/permission-events`.

Bổ sung tab/lịch sử cho Owner trong trang Store. Dùng filters/paging và fields thực tế từ response để hiển thị người thực hiện, đối tượng, thời điểm và thay đổi quyền.

Không tự thêm endpoint audit. Không suy luận lịch sử từ state grants hiện tại.

Acceptance: đúng Store; đúng quyền; paging; đọc được sự kiện sau cập nhật grants; Staff không được phép đọc bị chặn.

## 9. Những điểm cần xác minh, chưa kết luận là lỗi

| Điểm | Việc FE cần làm |
| --- | --- |
| Import source context | Xác minh UI xử lý được source_system_key/report_type qua descriptor/resolution hiện hành. Báo thiếu cụ thể nếu schema không cung cấp cách khai báo; không đoán từ tên file |
| Quyền đổi giữa phiên | Xử lý lỗi quyền, đọc lại Store context và cập nhật workspace; không cần gọi auth/me trước mọi API |
| Polling Run dừng sau 60 lượt | Hiển thị tạm dừng kiểm tra tự động, cho kiểm tra thủ công; không tự chuyển Run sang FAILED |
| Timeout đọc Run | Đo FE–BE thực tế trước khi đổi timeout; timeout không chứng minh Run thất bại |
| Lịch sử import tải calendar cùng danh sách | Có thể tránh tải calendar lại khi chỉ đổi cursor; tối ưu request, không phải đổi contract |
| Default/custom/saved | Tài liệu FE chưa chứng minh UI đầy đủ; kiểm tra source/UI trước khi viết thêm trùng |
| Error responses | Kiểm tra JSON/error code, 401/403/409 và CORS trên cả response lỗi; route khớp chưa chứng minh payload khớp |

## 10. Quy tắc tích hợp dùng chung

- Giữ HTTP client chung, credentials include; CSRF theo protected mutation contract.
- Cookie HttpOnly do browser quản lý; không lưu session token trong localStorage.
- Login và credential completion dùng security semantics riêng của endpoint.
- Backend kiểm quyền hiện hành trên mỗi request. Ẩn control tại FE không thay thế authorization.
- Retry mutation khi kết quả chưa xác định giữ nguyên body/key/version của intent gốc; không tự tạo request mới.
- Conflict cần đọc lại state rồi để người dùng xem thay đổi trước khi tạo intent mới.
- Không gửi nhầm idempotency key của Store/actor cũ sau khi đổi scope.
- Async acceptance/job receipt chưa phải completion.
- Không hiển thị UNKNOWN/missing thành 0 hoặc thành thành công.
- Không tự thêm AI chat, What-if, đăng ký hoặc Draft PO trong task bổ sung này.

## 11. Tiêu chí bàn giao

Với mỗi cụm hoàn tất:
1. Nêu màn hình/tác vụ đã thêm và API thực sự gọi.
2. Đối chiếu request/response với OpenAPI và contract BE hiện hành.
3. Kiểm thử thành công, thiếu quyền, khác Store, version conflict và retry phù hợp với endpoint.
4. Kiểm thử trên chế độ API thật; mock không chứng minh tích hợp.
5. Cập nhật trực tiếp 008-fe-pages-actions-api.md; không tạo tài liệu phụ cho mỗi thay đổi nhỏ.
6. Báo rõ phần chưa kiểm chứng; không gọi toàn bộ sản phẩm end-to-end hoàn tất chỉ vì routes đã nối.

Tài liệu này không yêu cầu thay đổi backend hoặc tạo endpoint mới. Nếu phát hiện schema BE không hỗ trợ một workflow đã duyệt, báo chính xác endpoint/field và tình huống bị chặn để phối hợp sửa.



## 12. Implementation delta — 12/10/2026

Các mục “API chưa dùng” phía trên giữ làm snapshot yêu cầu gốc. Lượt triển khai #008 đã nối N7/N18/N19, N14/N16-events, N1/N2/N3, N6/N8, N9/N10/N11 và N20/N21/N22 vào entry FE; J01 thêm handling context PDF. Các adapter có controlled boundary tests; receipt lost-response/fresh reads và PDF transport có controlled browser tests. Không có live BE verification.

Xem [008 Implementation Receipt](../sprints/008/008_Implementation_Receipt.md) để biết mức evidence từng operation, tests thực chạy, remaining FE work và matrix toàn MP-M00–MP-M15. Xem [008 TechDebt](../sprints/008/008_TechDebt.md) cho các dependency Backend/Product. Không coi API có thật là thiếu contract: initial N4 cần xác nhận absence authority; N1–N3 đã nối nhưng mock saved-config→run chưa coherent; API PDF đã nối nhưng mock PDF chưa có. Signup/decline/global mapping queue/Today projections/AI/What-if/PO vẫn chưa có đủ semantics để kết thúc các flow tương ứng.
