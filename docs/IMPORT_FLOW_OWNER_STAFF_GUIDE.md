# Import dữ liệu — hướng dẫn Owner/Staff, API và xử lý lỗi

Ngày cập nhật đối chiếu: **16/10/2026**. Phạm vi: frontend trong checkout hiện tại, chế độ `VITE_DATA_SOURCE=api`, đường dẫn `/imports` và `/imports/history`.

**Đọc trước khi dùng:** các bước dưới đây mô tả FE hiện đang pin `contracts/011/openapi.main.json`, không phải toàn bộ khả năng BE main mới. Phản hồi BE cho `b0db90c` xác nhận SU01, MQ01–03/notifications, N5 request_changes, 15 schemas và approval RULE theo full spec đã có. Handoff local `869eaec9` và source local `052cddee` hỗ trợ đối chiếu nhiều điểm này; chưa có source/OpenAPI đúng `b0db90c` để chứng nhận commit đó. [Mục 15](#15-đối-chiếu-be-main-và-fe--16102026) ghi nguồn chứng cứ, lệch tích hợp và kiểm chứng. Chưa thay pin, adapter hoặc UI trong lượt cập nhật tài liệu này.

Tài liệu mô tả hành vi đang có trong code, không chứng nhận toàn luồng đã chạy thành công với BE thật. Tên nút đặt trong **in đậm** là nhãn UI hiện tại. Các lỗi dưới đây bao gồm validation FE, lỗi HTTP, lỗi nghiệp vụ BE và lỗi job; mã BE có thể mở rộng, nên danh mục mã cụ thể không phải một enum đóng. Mục 12 mô tả cách catch mọi nhóm lỗi, kể cả mã chưa biết.

## 1. Quy tắc và khác biệt giữa hai vai trò

- Owner: chọn file → phân tích → sửa cách hiểu → duyệt reusable profile nếu cần → Preview → xác nhận Review → commit → completion → kiểm tra Readiness.
- Staff: chọn file → phân tích → sửa cách hiểu → nếu thay đổi reusable thì bàn giao Owner và đọc lại quyết định → Preview → xác nhận Review → commit nếu đủ quyền → completion → Readiness nếu đủ quyền.
- Tái sử dụng đúng profile đã duyệt không buộc Owner duyệt lại. Sửa cấu trúc/semantics reusable có thể phát sinh proposal mới.
- Vai trò không thay thế quyền cụ thể. FE dùng `mapping.propose` để cho sửa mapping; Review/commit cần `import.commit` và **tất cả** `required_actions` của Preview. Owner mới được quyết định profile. BE kiểm tra lại quyền trên từng request.
- Tìm Product dùng reader Menu; tìm Ingredient dùng reader Inventory, do đó còn phụ thuộc quyền đọc các nguồn này. **BE R01 planning yêu cầu đủ `planning.context.read`, `budget.read`, `procurement.cost.read`; FE hiện mới kiểm tra quyền đầu tiên trước khi mở CTA**, nên BE vẫn có thể trả 403.
- Upload chỉ đưa nguồn vào staging. **Lưu mapping ≠ duyệt profile ≠ xác nhận Review ≠ ghi dữ liệu nghiệp vụ.** Profile approval có thể thay đổi cấu hình reusable nhưng chưa import dữ liệu của batch.
- Commit nguyên tử toàn lô. Không có thao tác tự bỏ dòng lỗi, commit một phần hay tự cộng số liệu để né conflict.
- API bên dưới đều dùng prefix `/api/v1`; `{store_id}`, `{import_id}`, `{sheet_id}`, `{mapping_id}`, `{profile_id}`, `{job_id}` là UUID BE trả về.
- Mọi request dùng cookie qua `credentials: include`. Mutation được bảo vệ cần `X-CSRF-Token` từ phiên hiện tại. Các mutation Import dùng `Idempotency-Key`; không tự tạo key mới để thử lại một yêu cầu chưa biết kết quả.

Các nhóm dữ liệu có nhãn trong UI hiện tại: Bán hàng, Kiểm kê tồn kho, Tồn đầu kỳ thực tế, Công thức, Món, Nguyên liệu, Nhà cung cấp, Điều khoản nhà cung cấp, Phí phải trả, Khai báo phạm vi. BE mới có **15 schemas**, gồm thêm `inventory_receipts`, `calendar_events`, `promotion_observations`, `usage_history`, `purchase_history`; FE wire hiện còn enum 10 schemas, có thể từ chối response mới ngay tại validation. Schema/field hợp lệ phải lấy từ M03 sau khi đồng bộ đúng snapshot; không tự suy schema từ tên file. Purchase history không tự làm tăng tồn kho; actual receipts mới là thực nhận.

## 2. Bước 0 — đăng nhập và chọn cửa hàng

**Thao tác cho Owner và Staff**

1. Mở `/imports`. FE kiểm tra phiên tự động.
2. Nếu về `/login`, nhập **Email**, **Mật khẩu**, tùy chọn **Ghi nhớ đăng nhập**, bấm **Đăng nhập**.
3. Nếu kiểm tra phiên lỗi, có thể bấm **Thử lại**. Tại màn lỗi bảo vệ Import có **Đăng nhập lại**; tại `/login` form vẫn sử dụng được khi kiểm tra phiên lỗi.
4. Chọn đúng cửa hàng ở bộ chọn **Cửa hàng hiện tại** nếu có nhiều cửa hàng. Vai trò Owner/Staff lấy theo membership của cửa hàng đang chọn.

**API**

- A03 `GET /auth/me` lúc khởi động/kiểm tra lại và sau A01 thành công.
- A01 `POST /auth/login`, body `{email,password,remember_me}`. Đây là public request, chưa yêu cầu session CSRF. FE chuẩn hóa email; giữ nguyên mật khẩu.
- T01 `GET /stores`; T02 `GET /stores/{store_id}` để lấy ngữ cảnh và quyền hiện tại. Việc chọn Store quyết định scope cho các bước sau.
- A04 `POST /auth/logout` khi người dùng chủ động đăng xuất; thành công yêu cầu HTTP 204.

**Lỗi và xử lý**

- Email sai định dạng/rỗng, dài quá 320 ký tự hoặc thiếu mật khẩu: FE chặn submit, focus trường lỗi, chưa gọi A01.
- `401 INVALID_CREDENTIALS`: form báo email/mật khẩu không đúng. `401` từ protected API: phiên bị vô hiệu hóa, cần đăng nhập lại.
- `403`, gồm `CSRF_CHECK_FAILED`; `429`; `5xx`; mất mạng/timeout; response không đúng Auth contract: form hiện lỗi tương ứng. Không tạo session giả hoặc token giả.
- A01 thành công nhưng A03 tiếp theo lỗi: chưa được vào Import; form có thể báo lỗi và kiểm tra phiên lại. Cookie đã được cấp không tự chứng minh FE đã xác minh phiên.
- T01/T02 lỗi, không có Store, không có membership/quyền hoặc chọn Store không hợp lệ: chưa có scope hợp lệ để tiếp tục. Không lấy Store fixture thay thế.
- Đổi Store, đăng xuất hoặc tải lại trang có thể làm mất file local/intent đang giữ trong bộ nhớ. URL lô chỉ giúp đọc lại dữ liệu đã được BE lưu, không khôi phục intent chưa xác định.

## 3. Bước 1 — chọn file, tạo lô và nhận kết quả upload

**Thao tác cho cả hai vai trò**

1. Chọn **Ngày dữ liệu** ở đầu trang, trước khi tạo draft.
2. Bấm vùng **Kéo thả file ở đây** / **hoặc chọn file từ thiết bị**, hoặc kéo thả file. Có thể chọn nhiều lần.
3. Kiểm tra danh sách file local. Bấm nút **×** có tên truy cập `Bỏ file <tên file>` để bỏ file chưa gửi.
4. Bấm **Phân tích dữ liệu**. Lần bấm này tạo draft nếu cần, upload và chuẩn bị tập file; **chưa bắt đầu job analyze ngay**.
5. Nếu có file bị từ chối, xử lý từng file:
   - **Thử lại <tên file>**: gửi lại file đã bị từ chối bằng một lần upload mới; chỉ dùng được khi FE còn giữ File local.
   - **Thay file**: chọn file khác để upload vào lô chưa seal.
   - **Xóa**: bỏ dòng retry khỏi UI. Không gọi DELETE, không xóa bằng chứng từ chối trên BE, không giải phóng quota của file đã được nhận.
6. **Xem thêm file** đọc thêm biên nhận nếu có nhiều trang.
7. Nếu cần, thêm file trước khi seal. Khi không còn file local chưa gửi, bấm **Phân tích dữ liệu** để mở xác nhận tập nguồn ở bước tiếp theo.

**API theo thứ tự thực tế**

- I01 `POST /stores/{store_id}/imports`, body `{data_date}`, `Idempotency-Key` riêng cho draft.
- I04 `GET /imports/{import_id}` trước mỗi upload mới: kiểm tra quyền thao tác, seal và quota của lô.
- I02 `POST /imports/{import_id}/files`, multipart `files[]` + `client_file_ids[]`, cùng thứ tự; key riêng cho lần upload. Timeout upload 120 giây. Browser tự đặt multipart boundary.
- I04 đọc lại sau receipt upload để cập nhật quota/tập file. Phân trang dùng `files_cursor`; FE không tự đặt `files_limit`.
- URL được bổ sung `?import_id=<id>` sau khi có draft để có thể tiếp tục lô đã lưu.

**Validation và lỗi upload**

- Chỉ nhận phần mở rộng `.csv`, `.xlsx`; tối đa 20 file trong tập chọn local, 20 MiB/file, 100 MiB tổng local. Sai giới hạn: hiện lỗi và không thêm tập file mới, chưa gọi API.
- Không chọn file/ngày sai/không có Store: FE chặn hoặc báo lỗi trước mutation. Ngày bị khóa sau khi draft được tạo.
- BE tính quota toàn lô bằng bytes thực tế: tối đa 20 file được nhận, 100 MiB nguồn đã nhận. Kiểm tra local không bảo đảm batch còn quota.
- Per-file rejection đã có receipt: `RESOURCE_LIMIT_EXCEEDED`, `INVALID_FILE_TYPE`, `EMPTY_FILE`. File có phần mở rộng đúng vẫn có thể bị sniff nội dung từ chối.
- HTTP 200 I02 **có thể chứa cả file nhận và file từ chối**. FE xử lý từng item, không coi 200 là mọi file đều thành công.
- `422 UPLOAD_REJECTED` có `details.items` hợp lệ: adapter catch riêng và chuyển thành kết quả admission để UI hiển thị từng file. Không coi như generic validation failure; accepted set vẫn có thể rỗng.
- `422` khác hoặc `UPLOAD_REJECTED` sai receipt/ID/shape: không được coi là upload receipt hợp lệ; lỗi đi lên workflow.
- Lỗi toàn request: multipart/pairing sai (`INVALID_IMPORT_CONFIGURATION`), count/ID lặp/giới hạn request (`413 RESOURCE_LIMIT_EXCEEDED`), lô đã seal (`409`), key/client ID conflict (`409`), quyền `401/403/404`, server `503`.
- File đã được nhận nhưng I04 đọc quota thất bại: giữ receipt, không tự upload lại. Trạng thái chưa fresh sẽ khóa phân tích; cần đọc lại trạng thái. Một số nút đọc chi tiết lô chỉ ở DEV, xem mục 13.
- Upload không biết kết quả do mạng/timeout/protocol: bấm **Kiểm tra lại trạng thái file**, FE đọc I04 qua tất cả trang và đối chiếu `client_file_id`. Nếu chưa chứng minh nhận đủ, vẫn khóa, không tự gửi lại.
- File malformed có thể upload thành công rồi fail khi analyze; upload không full parse workbook.

## 4. Bước 1B — xác nhận chính xác file sẽ phân tích

**Thao tác**

1. Đọc màn **Xác nhận file sẽ được phân tích** và danh sách file đã được nhận.
2. Nếu chưa đúng, bấm **Quay lại** để hủy preparation và xử lý file trước khi seal.
3. Nếu đúng, bấm **Phân tích N file**. N chỉ là số file được BE nhận; file rejected không tham gia analyze.

**API**

- Trước khi hiện xác nhận, FE đọc I04 qua **toàn bộ** `files_cursor`, kiểm tra cùng revision/source set, ID không trùng và accepted set khớp.
- I03 `POST /imports/{import_id}/analyze`, header `If-Match: "<import_revision>"`, key riêng; body `{file_set_version,accepted_file_ids,acknowledged_rejected_client_file_ids}`.
- Bấm xác nhận đồng thời xác nhận danh sách rejected IDs của preparation; không phải âm thầm mất file lỗi.
- I03 acceptance làm source set bị seal. FE tiếp tục I04/J01 để đọc tiến trình, không cho upload thay nguồn sau seal.

**Lỗi/chặn**

- Không có accepted file; còn file local chưa gửi; chưa fresh; chưa xác nhận; BE không cho `analyze`: chưa gửi I03.
- Cursor lặp, biên nhận trùng, số biên nhận thiếu, lô thay đổi giữa các trang, accepted IDs không khớp source set: hủy preparation, cần đọc và xác nhận tập mới.
- `409 NO_UPLOADED_FILES`, `IMPORT_STATE_CONFLICT`; `412 IMPORT_REVISION_CONFLICT`; `428 PRECONDITION_REQUIRED`; `422 INVALID_IMPORT_CONFIGURATION`; lỗi chung mục 12.
- Analyze mất ACK: giữ intent gốc. Nút **Thử lại đúng yêu cầu trước** của batch dùng lại key, revision và body I03, không tạo intent mới.
- I03 đã nhận nhưng I04 lỗi: giữ thông tin đã seal/acceptance; không mặc định phân tích lại hoặc mở upload.

## 5. Bước 2 — phân tích và xác nhận nguồn

**Thao tác**

1. Chờ màn **Phân tích dữ liệu**. FE tự polling job; không cần bấm liên tục.
2. Khi đọc được kết quả, bấm **Kiểm tra cách hiểu**.
3. Nếu gợi ý tự động unavailable/invalid, bấm **Tiếp tục thủ công**; không có gợi ý không đồng nghĩa dữ liệu không thể nhập.
4. Nếu cần source context, điền **Hệ thống nguồn**, **Loại báo cáo**, **Bằng chứng / tham chiếu nguồn**; khai báo các mục conditional thực sự áp dụng rồi bấm **Xác nhận nguồn**.
5. Mở **Semantics và định dạng nguồn (chỉ khai báo khi đã biết)** để nhập sales semantics, kiểm kho theo lô, dấu thập phân, định dạng ngày, quy tắc expiry có evidence. Mở **Điều chỉnh kỳ hạn cung cấp và phí**, bấm **Thêm amendment Supplier term** / **Thêm amendment Payable fee** nếu thực sự cần; mỗi amendment cần ID/version/ngày cuối kỳ/lý do, có **Bỏ amendment N** để hủy dòng chưa lưu. Không đoán source từ tên file.

**API**

- J01 `GET /jobs/{job_id}` theo `poll_after_ms`; I04 đọc trạng thái batch.
- M01 `GET /imports/{import_id}/mapping-summary?include_clean_sheets=true&include_profile_details=true`.
- M02 `GET /imports/{import_id}/mappings?sheet_id=...&review_only=true&include_details=true`.
- M03 `GET /imports/{import_id}/sheets/{sheet_id}/field-options` và khi cần `?mapping_id=...`.
- Xác nhận nguồn dùng M04 `PATCH /imports/{import_id}/mappings/{mapping_id}`, body `{resolution:{kind:"source_context",...}}`, mapping CAS. Đây không phải source API riêng.
- Sau M04, FE đọc lại M01/M02/M03/I04 để xác định trạng thái thật.

**Trạng thái/lỗi nghiệp vụ**

- `SOURCE_CONTEXT_REQUIRED`, `SOURCE_CONTEXT_CONFLICT`, `SOURCE_IDENTITY_CONFLICT`: cần khai báo/đối chiếu nguồn.
- `PROFILE_MATCH_AMBIGUOUS`: có nhiều profile; FE không tự chọn một profile tùy ý.
- `PROFILE_STRUCTURE_OR_SEMANTICS_DRIFT`: cần kiểm tra header/semantics ở bước 3.
- `MAPPING_VERSION_RETIRED`: không dùng profile đã retired; quay lại xử lý cách hiểu.
- Không có profile phù hợp: trạng thái nghiệp vụ bình thường; tiếp tục tạo/sửa đề xuất nếu có quyền.
- Provider suggestion unavailable/invalid: đi thủ công. Không coi `503` chung của API là schema vĩnh viễn không hỗ trợ.
- Job `failed` có thể được trả trong HTTP 200: UI dùng `job.status` và `job.error.code/message`; không coi HTTP 200 là analyze thành công.
- Parser/encoding/workbook/ZIP/resource/data lỗi được giữ trong Job.error và source locations nếu BE trả. Không có enum đóng mọi lỗi parser ở FE; mã chưa biết vẫn hiện lỗi chung/diagnostic.
- Analyze failed: UI hiện **Đọc lại trạng thái** nếu đã seal. **Thử phân tích lại** chỉ hiện ở nhánh chưa seal/được phép. BE có thể cho retry cùng nguồn đã seal nhưng FE hiện không cung cấp CTA retry job mới đầy đủ cho mọi trường hợp.
- Source form thiếu evidence, source namespace sai ký tự/độ dài, amendment sai UUID/version/date/reason, thiếu quyền hoặc đang pending: khóa save. Source key chỉ dùng chữ/số/dấu chấm/gạch ngang/gạch dưới/dấu hai chấm. Các lỗi M04 áp dụng như bước 3.

## 6. Bước 3 — kiểm tra và sửa mapping/cách hiểu

Owner và Staff dùng cùng bốn nhóm resolver. Đang busy, pending mutation, dữ liệu stale hoặc thiếu `mapping.propose` thì không được lưu. Nút **Hủy** đóng resolver, không lưu thay đổi chưa gửi.

### 6.1. Điều hướng và đọc dữ liệu

1. Tại overview, chọn nhóm cần xử lý bằng **Chỉnh mapping**, **Chọn entity** / **Xem bindings**, **Xác nhận thông tin**, **Kiểm tra đơn vị**.
2. Trong drawer chọn **File**, **Sheet**, bộ lọc **Cần xử lý** / **Tất cả**, **Mục đang xử lý** hoặc mũi tên **Mục trước** / **Mục tiếp theo**.
3. Bấm **Tải thêm** nếu queue còn cursor. Tập đã tải không chứng minh toàn lô đã hết lỗi; chỉ M01 cung cấp progress toàn lô.
4. Sau save thành công drawer đóng, về overview; không tự chuyển bước.

Đổi Sheet/bộ lọc/đọc thêm gọi M02; descriptor gọi M03. Khi đọc đồng bộ, FE đọc M01 trước và sau M02/M03 để phát hiện mapping revision đổi giữa chừng. Descriptor cho các mục nhìn thấy có thể được tải tự động, tối đa bốn request song song.

### 6.2. Nhóm 3A — Cấu trúc & semantics

1. Bấm **Chỉnh mapping**; kiểm tra header và samples.
2. Với cột dữ liệu, chọn **ShelfCash hiểu là** từ descriptor BE.
3. Bấm **Lưu mapping**; với Staff đang tạo thay đổi đề xuất, nút có thể là **Lưu đề xuất**.
4. Muốn bỏ cột optional: chọn **Bỏ qua**, điền **Lý do**, tick xác nhận cột không chứa dữ kiện bắt buộc, rồi lưu.
5. Với issue phân loại Sheet: chọn **Loại dữ liệu**, điền **Lý do phân loại hoặc bỏ qua**. Nếu chọn **Không nhập dữ liệu của Sheet này**, tick xác nhận toàn Sheet không tham gia import rồi lưu.

API: M04 cùng endpoint. Cột thường gửi `{target_field}`; bỏ cột gửi `resolution.kind=ignored_optional_field`; phân loại/bỏ Sheet gửi `resolution.kind=sheet_type`. Header `If-Match` dùng **mapping_revision**, không dùng import_revision.

Lỗi/chặn hiện tại: target rỗng, descriptor thiếu/sai context, target đã được cột khác dùng, bỏ required field, thiếu lý do/ack, resolution sai issue/schema. FE hiện chỉ cho chọn `support=supported`, nên còn khóa cả `source_only`; **đây là lệch FE, không phải chính sách BE**. BE cho `source_only` khả dụng: đó là dữ kiện nguồn/evidence, không tự thành canonical DB column. `unsupported` và `available=false` vẫn phải bị chặn đúng descriptor. FE không tự chọn target thay user. `409 UNRESOLVED_REQUIRED_FIELDS`, `SCHEMA_BLOCKED`, `OWNER_MAPPING_APPROVAL_REQUIRED`; `422 INVALID_MAPPING_TARGET`/`INVALID_IMPORT_CONFIGURATION`; `412 MAPPING_REVISION_CONFLICT`; lỗi chung mục 12.

IGNORE cả Sheet không phải xóa file; không giảm quota. Staff có thể thực hiện khi BE cho phép đối với lô thuộc phạm vi của mình, không tự suy rằng mọi ignored binding reusable đều miễn Owner approval.

### 6.3. Nhóm 3B — Identity

1. Bấm **Chọn entity**, chọn đúng File/Sheet/mục nguồn.
2. Nhập **Tìm sản phẩm** hoặc **Tìm nguyên liệu**, chọn một kết quả cụ thể, kiểm tra binding nguồn → Store entity.
3. Dùng **Xem thêm** / **Trang đầu** nếu cần rồi chọn lại kết quả ở trang đang xem.
4. Bấm **Lưu bindings** để gửi `resolution.kind=identity_binding`, `canonical_id` đúng entity đã chọn.
5. Nếu không tìm được, bấm **Không tìm thấy? Tạo đối tượng mới**. Chọn loại entity, mã chính xác trong nguồn, tên, đơn vị/SKU/giá nếu áp dụng, trạng thái active, expiry của Ingredient và evidence. Bấm footer **Lưu bindings** khi form hợp lệ. Có thể bấm **Quay lại tìm đối tượng**.

API tìm kiếm: Product `GET /stores/{store_id}/products?q=...&limit=20[&cursor=...]`; Ingredient `GET /stores/{store_id}/inventory?q=...&limit=20[&cursor=...]` và lọc Ingredient active. Search chỉ chạy khi có từ khóa, debounce 150 ms; đổi query/scope hủy request cũ. Save dùng M04. Entity mới gửi `new_entity_proposal`, **không gọi CRUD tạo entity ngay**.

Lỗi/chặn: search mất mạng/HTTP/response sai → **Thử lại**; không có kết quả; ambiguous cần chọn rõ; target không xác định loại entity; thiếu quyền reader hoặc quyền mapping. **BE đã có SU01 `GET /stores/{store_id}/suppliers`, search/pagination và `supplier.read`; FE Import chưa nối reader này**, nên ô tìm Supplier vẫn bị khóa. Metadata mới thiếu/sai kiểu, trạng thái chưa chọn rõ, evidence trống hoặc server không cho propose: không lưu được. ACK proposal chưa chứng minh entity đã được tạo; còn Owner approval và atomic commit.

### 6.4. Nhóm 3C — Thông tin cần xác nhận

1. Bấm **Xác nhận thông tin**.
2. Chọn **Trường đích**, **Phạm vi**, **Kiểu giá trị** rồi nhập **Giá trị**, thêm evidence theo descriptor.
3. Phạm vi `IMPORT_VALUE`: chỉ lần import này, phải khai báo lại lần sau. `PROFILE_CONSTANT`: reusable constant, cần Owner duyệt khi phát sinh thay đổi profile.
4. Nếu cần thay cột nguồn, tick **Dùng giá trị khai báo thay cho cột nguồn**, đối chiếu before/after và đúng cột, nhập **Lý do thay thế**, tick xác nhận đúng cột.
5. Bấm **Lưu thông tin**.

API: M04 `resolution.kind=shared_value`, gửi target/scope/value/evidence và replacement acknowledgment khi áp dụng. False, 0 và null là các giá trị khác nhau; null chỉ chọn được khi descriptor nullable.

Lỗi/chặn: không có descriptor cho shared value; schema chưa chọn hoặc Sheet ignored; scope không nằm trong allowlist; kiểu giá trị không hợp lệ; null trên field non-nullable; integer/decimal/date không đúng yêu cầu; evidence trống; thay nguồn nhưng thiếu cột xác minh, lý do hoặc ack. Replacement chỉ đúng cột của issue đang mở, không chọn cột khác tùy ý. JSON resolution quá 65.536 byte bị chặn trước request. Lỗi M04 và lỗi chung vẫn áp dụng.

### 6.5. Nhóm 3D — Units

1. Bấm **Kiểm tra đơn vị**.
2. Điền **Đơn vị nguồn**, **Đơn vị đích**, **Tử số (decimal text > 0)**, **Mẫu số (decimal text > 0)** và evidence.
3. Bấm **Lưu đơn vị**.

API: M04 `resolution.kind=declared_conversion`, `factor:{numerator,denominator}` dạng decimal string chính xác.

Lỗi/chặn: đơn vị rỗng/quá dài, tử/mẫu không phải positive decimal hoặc bằng 0, evidence trống, đơn vị không tương thích/không được BE hỗ trợ. Không suy density, pack size hoặc dùng floating point để tự tạo conversion. Lỗi M04 và lỗi chung vẫn áp dụng.

### 6.6. Sau mọi lần lưu

- FE đọc lại mapping và parent batch. Đổi cách hiểu làm Preview cũ stale và xóa tick Review/commit.
- Save đã ACK nhưng readback lỗi: không tự gửi lại mutation; đọc trạng thái hiện tại.
- Save chưa biết kết quả: UI **Chưa xác định kết quả lưu** / footer **Kiểm tra lại trạng thái**; giữ giá trị và khóa mutation mới.
- M04 recovery đọc M01/M02, bỏ filter chỉ khi cần tìm issue đã resolved và đối chiếu exact target/resolution. Mục biến mất khỏi trang đang lọc không phải bằng chứng save thành công.
- Không có bằng chứng save hoặc state đổi trong readback: vẫn pending, chưa tự gửi lại.
- FE hiện khóa nút đi tiếp khi toàn lô còn unresolved, kể cả Sheet hiện tại đã xử lý xong. **Không áp quy tắc này thành điều kiện approval BE:** RULE candidates đủ điều kiện có thể được Owner duyệt chung trong spec hợp lệ, `missing_fields=[]`; sau approval, các RULE issues tương ứng chuyển `auto_mapped`. Gate vào màn duyệt/bàn giao hiện quá chặt với nhánh này, cần sửa ở lượt tích hợp.

## 7. Nhánh Owner — duyệt reusable profile

**Khi nào cần**: có `profile_proposals`. Nếu `can_preview=true` và không có proposal, overview có **Tạo Preview**, có thể bỏ qua bước duyệt.

**Thao tác Owner**

1. Trong UI hiện tại, nút **Xem profile sẽ được lưu** chỉ mở sau khi unresolved bằng 0. Đây là hạn chế FE cần sửa: BE cho Owner duyệt RULE proposals đủ điều kiện theo full spec dù các issue tương ứng chưa được resolve riêng. Owner được duyệt proposal do chính mình tạo.
2. Dùng **Thay đổi** / **Toàn bộ Profile** để kiểm tra spec đề xuất và baseline đúng active version; bấm **Xem bằng chứng →** ở từng rule hoặc mở **Xem toàn bộ cách đọc và bằng chứng**. Duyệt luôn áp dụng cho toàn version, không chỉ phần diff đang lọc. First Profile không có baseline cũ.
3. Điền **Lý do duyệt**, tick đã kiểm tra đề xuất/bằng chứng/baseline, bấm **Duyệt profile**. Nếu có nhiều proposal, xử lý từng proposal cần thiết.
4. Đợi readback xác nhận được phép preview, rồi bấm **Tạo Preview**.
5. Nhánh từ chối: **Từ chối** → nhập **Lý do từ chối** → tick xác nhận → **Từ chối đề xuất** → **Quay lại chỉnh sửa**.
6. Nhánh retire nếu có active version: **Ngừng sử dụng profile** → nhập lý do và tick → **Ngừng sử dụng Profile**. Không tự activate version khác và không thay completion đã ghi.

**API**

- N5 `POST /stores/{store_id}/mapping-profiles/{profile_id}/decisions`, `Idempotency-Key`, `If-Match: "<lifecycle_revision>"`.
- Approve body `{decision:"approve_activate",proposal_revision,expected_active_version,reason}`.
- Reject body `{decision:"reject",proposal_revision,reason}`.
- Retire body `{decision:"retire",active_version,reason}`.
- Sau ACK đọc lại M01/M02/M03/I04. N5 không gọi commit batch.

**BE có thêm, FE chưa tích hợp:** `decision=request_changes` và các submission fences `submission_id`/`expected_submission_version`. N5 main trả thêm `submission` và `notification_delivery`; validator FE cũ chưa nhận các field này. Không coi lỗi FE parse response là bằng chứng quyết định Owner chưa được BE lưu.

**Lỗi/chặn**

- Không phải Owner, proposal không còn đúng lifecycle/proposal revision, thiếu full spec hoặc `missing_fields`, thiếu exact baseline, lý do/ack chưa đủ: khóa duyệt hoặc workflow từ chối trước request.
- `412 PROFILE_REVISION_CONFLICT`; `409` trạng thái đã đổi/đã xử lý; `PROFILE_REJECTED`; `MAPPING_VERSION_RETIRED`; quyền bị thu hồi `403`; HTTP/protocol/network lỗi chung.
- UI recovery có **Tải lại review**, **Quay lại chỉnh sửa**, **Đọc lại trạng thái hiện tại** tùy lỗi. Giữ phần comparison, không lấy unrelated/latest baseline thay thế.
- N5 mất ACK: dùng **Kiểm tra lại trạng thái**. Current workflow không có authoritative intent-status/lifecycle receipt đầy đủ để tự đóng mọi pending decision. Không mặc định resend hoặc coi approve đã thành công chỉ vì state trông tương tự.

## 8. Nhánh Staff — bàn giao cho Owner

1. Staff xử lý các issue có quyền sửa; `IMPORT_VALUE` riêng batch không tự trở thành reusable default.
2. Nếu BE cho `can_preview=true`, bấm **Tạo Preview**, không cần bàn giao chỉ vì actor là Staff.
3. Nếu còn reusable proposal, sau khi unresolved bằng 0 và full spec đủ, bấm **Bàn giao cho Owner**.
4. Copy trường **Đường dẫn bàn giao lô**, có dạng `/imports?import_id=<id>`, gửi Owner bằng kênh làm việc hiện có. UI hiện tại không có nút gửi notification/copy tự động.
5. Owner chọn đúng Store, mở liên kết, thực hiện bước 7. Link không cấp quyền và không tự chọn đúng Store cho người nhận.
6. Staff bấm **Đọc lại quyết định Owner** trong dialog. Nút đóng dialog rồi gọi workflow refresh để đọc canonical state.
7. Nếu đã duyệt và BE cho preview: tiếp tục **Tạo Preview**. Nếu rejected/chưa được duyệt: chưa đi tiếp; chỉnh proposal theo phản hồi có được qua kênh bàn giao rồi nhờ Owner xem lại.

**API FE hiện gọi**: bước mở dialog/copy link không gửi mutation. Đọc quyết định dùng I04/M01/M02/M03; Owner dùng N5. FE chưa gọi MQ01–03/NF01–03. **BE đã có submit/withdraw, Store queue, pinned detail/evidence và notification**; link thủ công là fallback của FE, không phải giới hạn BE. Payload/đường dẫn BE đã có được ghi ở mục 15.

**Lỗi/chặn**: chưa đủ spec, unresolved còn, missing fields, không có quyền mapping, Owner không truy cập được lô/Store, approval chưa reflected, proposal đổi/retired, readback lỗi, pending decision chưa rõ. Cần giữ lô và đối chiếu state, không upload lại file để né approval.

**DEV khác runtime**: **Gửi Owner duyệt**, màn waiting/polling adapter, approved/rejected có reason là nhánh `devOwnerReview` injected bởi mock source. Không dùng những màn đó làm bằng chứng production có submission/notification/outcome continuation đầy đủ.

## 9. Bước Preview — xem trước và xác nhận thay đổi từng dòng

**Thao tác cho cả hai vai trò khi đủ điều kiện**

1. Bấm **Tạo Preview**. Cần mapping đủ, profile được phép và batch có action phù hợp.
2. Chờ job; chọn tab nhóm dữ liệu, **Tất cả** / **Cần kiểm tra**, **Xem cảnh báo** nếu có.
3. Bấm **Chi tiết** hoặc dòng dữ liệu để đọc nguồn, before/after, blocker, warning, inventory effect/supplier semantics nếu có.
4. Bấm **Đọc thêm dòng Preview** cho đến khi đã đọc hết cùng một preview pin. Bộ lọc/tab hiển thị là local trên các dòng đã tải, không thay tổng toàn Preview.
5. Ở nhóm Sales review/Supplier terms, mở nút từng dòng **Xem chi tiết →**, xử lý theo các nhánh bên dưới.
6. Khi tất cả guard đạt, bấm **Tiếp tục xác nhận** để sang màn Review/commit. Nút này chỉ đổi màn, chưa ghi dữ liệu.

**API**

- I05 `POST /imports/{import_id}/process`, body `{phase:"preview",mapping_revision}`, key mới cho ý định preview, `If-Match` import_revision hiện tại.
- Acceptance thường 202 → J01 polling → I04 đọc lại.
- I04 Preview `GET /imports/{import_id}?include=configurations,preview[&preview_id=...][&rows_cursor=...]`.
- Đọc trang tiếp theo giữ exact preview ID/digest/source set. Không sửa ảnh preview cũ tại client.

**Sales correction/disjoint**

- `REPLACE_DAILY_TOTAL`: điền **Report business key từ chứng từ nguồn**, **Tham chiếu bằng chứng**, **Lý do xác nhận**; tick dữ liệu hiện tại thay contribution trước; bấm **Xác nhận thay đổi**.
- `MERGE_DISJOINT_SALES`: các trường tương tự; tick hai nguồn là contribution riêng. Chỉ dùng khi có evidence disjoint.
- FE không cho quantity override hoặc tự chọn quan hệ overlap. Case ambiguous chưa được BE phân loại an toàn vẫn bị chặn.

**Supplier term/fee**

- Đọc before/after và hiệu lực; nhập **Lý do xác nhận**, tick xác nhận điều khoản/phí/ngày trong Preview, bấm **Xác nhận thay đổi**.
- Ngày hiệu lực trong drawer domain là read-only. Amendment được hỗ trợ phải khai báo upstream; không tự đóng kỳ cũ.
- Các nút **Xác nhận thay đổi** chỉ stage quyết định trong bộ nhớ FE, **không gọi API lưu domain riêng**. Commit gửi sales `resolutions` và `supplier_changes`; xác nhận domain chưa phải persisted Review.

**Lỗi/chặn Preview**

- `409 ANALYSIS_NOT_READY`, `OWNER_MAPPING_APPROVAL_REQUIRED`, `UNRESOLVED_REQUIRED_FIELDS`, `SCHEMA_BLOCKED`, `PREVIEW_BLOCKED`, `PREVIEW_NOT_AVAILABLE`, `MAPPING_VERSION_RETIRED`; revision conflict; job failed; lỗi chung.
- Preview `validation_status=blocked` hoặc có blockers: khóa toàn lô, **Quay lại xử lý**. Dòng `INVALID`/`CONFLICT` được giữ trong evidence, không âm thầm loại.
- Blocker có thể gồm `INVALID_ROW`, `NEGATIVE_QUANTITY`, `MISSING_REQUIRED_VALUE`, `SALES_OVERLAP_UNRESOLVED`, `STALE_STOCK_OBSERVATION`, source/recipe/supplier constraints BE trả. FE không có mapper riêng cho mọi code; xem mục 12.
- Preview stale/expired do mapping/profile/source/read-set đổi: **Tạo lại Preview** hoặc **Kiểm tra lại cách hiểu**. Sau tạo lại phải Review riêng lần nữa.
- Chưa đọc hết rows; total_count không khớp; cursor/dòng trùng; khác preview ID/digest/configuration basis; cùng canonical ID đổi cấu hình giữa các trang: không cho tiếp tục; đọc lại canonical state.
- Sales/supplier thiếu reason/evidence/ack, quyết định trùng/thừa/khác row/action, action cần confirmation chưa được FE hỗ trợ: chặn Review/commit.
- Chỉ có warning không tự chặn, nhưng còn phải đạt mọi guard khác.
- Preview mất ACK: **Kiểm tra lại trạng thái** là readback. Current `checkPendingState()` chưa có nhánh đối chiếu preview intent chuyên biệt như commit; không hứa nút này tự giải quyết mọi pending preview hoặc tự gửi lại POST.

## 10. Bước 5 — xác nhận Review rồi commit

### 10.1. Lưu xác nhận đã kiểm tra

1. Tại màn **Xác nhận nhập dữ liệu**, đọc summary theo domain và **Cần chú ý**.
2. Trong **1. Xác nhận đã kiểm tra dữ liệu**, điền **Lý do review (bắt buộc)**.
3. Tick **Tôi đã đọc đủ dữ liệu, nguồn báo cáo, cách đọc và cảnh báo.**
4. Bấm **Xác nhận đã kiểm tra**. Chờ biên nhận Review từ server; chưa commit.

API: FE đọc lại I04 parent và pinned Preview trước mutation. I05 `POST /imports/{import_id}/process`, body `{phase:"confirm_review",preview_id,preview_digest,mapping_revision,confirm:true,reason}`, `If-Match` import_revision, key riêng. Sau thành công đọc lại I04/Preview, kiểm tra `confirmation_usable`.

Chặn: Preview thiếu/stale/blocked/unsupported; batch không `preview_ready` hoặc còn job; chưa đọc hết trang; source set/revision không khớp; chưa xử lý sales/supplier; thiếu quyền `import.commit` hoặc required_actions; reason/ack thiếu; còn pending intent. Chặn xảy ra ở UI và workflow, không chỉ dựa nút disabled.

Lỗi: `PREVIEW_STALE`, `PREVIEW_BLOCKED`, state/revision conflict, `401/403`, HTTP/network/protocol; receipt sai import/preview/digest/mapping bị từ chối. Mất ACK → **Kiểm tra lại trạng thái**, đọc pinned confirmation và đối chiếu exact ID/digest/revision/reason. Không khớp thì chưa resend. ACK có nhưng readback lỗi thì chỉ đọc lại.

### 10.2. Ghi nguyên tử toàn bộ lô

1. Sau khi Review usable, trong **2. Xác nhận ghi toàn bộ lô**, nhập **Lý do nhập dữ liệu (bắt buộc)**, riêng với lý do Review.
2. Tick **Tôi đã kiểm tra dữ liệu, cảnh báo và phạm vi nhập.**
3. Bấm **Xác nhận và nhập dữ liệu**.
4. Chờ **Đang nhập dữ liệu** và kết quả bền vững. Không tạo lô mới để retry khi chưa rõ kết quả.

API: FE đọc lại I04/pinned Preview trước commit. I05 `POST /imports/{import_id}/process`, body `{phase:"commit",preview_id,preview_digest,confirm:true,reason,resolutions,supplier_changes}`; `If-Match` import_revision, key riêng. Sales resolution có row_id/action/report_business_key/evidence_reference/reason/disjoint_assertion; supplier confirmation dùng `action_id` bằng preview row_id và reason. 202 chỉ là acceptance → J01 → I04 → I06.

Chặn ngoài Review guards: confirmation server thiếu/không usable/khác preview, digest, mapping, file set hoặc source digest; `allowed_actions` không cho commit hoặc `summary.can_commit=false`; quyền hiện tại không đủ; thiếu ack/reason commit; quyết định row thiếu/thừa/trùng; lô đã completion. **FE luôn yêu cầu reason commit; BE cho phép omit/null với pure inserts/NO_OP**, chỉ correction/thao tác cần justification mới buộc reason tương ứng. Đây là validation FE quá chặt, không phải policy cần user quyết định lại. Không thay đổi yêu cầu reason của Review hoặc từng sales/supplier confirmation bằng kết luận này.

Lỗi: `PREVIEW_BLOCKED`, `PREVIEW_STALE`, `SALES_OVERLAP_UNRESOLVED`, `STALE_STOCK_OBSERVATION`, `INVALID_IMPORT_CONFIGURATION`, `IMPORT_STATE_CONFLICT`, `MAPPING_VERSION_RETIRED`, revision/permission/resource/system errors. BE có thể trả các domain blockers khác theo row; không tự biến thành partial success.

Recovery:

- `PREVIEW_STALE`: **Tạo lại Preview** → đọc đủ → Review lại → commit explicit.
- System failure đã xác định: UI có **Quay lại kiểm tra**; giữ review context, đọc lại trước khi xác nhận tiếp.
- Commit chưa biết kết quả: **Kiểm tra lại trạng thái** đọc I04. Nếu completion có: I06 đối chiếu preview ID rồi hiện receipt; nếu đang committing có job: tiếp tục polling. Nếu chưa chứng minh gì: giữ pending, không tự gửi lại commit.
- Job complete nhưng không có receipt bền vững, hoặc job/result sai import/store/preview: protocol error; chưa báo thành công, cần đọc lại.
- Refresh/đăng xuất/đổi Store mất pending intent local. Có thể dùng URL lô đọc lại retained state; không vì mất intent mà tạo mutation mới trước khi đối soát.

## 11. Bước 6 — completion, Readiness và lịch sử

**Completion**

- I06 `GET /imports/{import_id}/completion` chỉ dùng khi BE có retained completion.
- Màn **Import đã hoàn tất** lấy counts/impact từ receipt, phân biệt committed, `no_changes` và completed_with_warnings. Không lấy counts Preview để giả kết quả.
- Có **Xem kho**, **Xem menu**. Nếu batch báo completion có nhưng đọc chưa được, bấm **Đọc lại biên nhận**.
- Lỗi: `409 IMPORT_NOT_COMPLETED`, `404`, quyền, network/protocol; receipt sai ID/preview, mode/status/counts/schema bất hợp lệ không được coi hoàn tất. Failure giữ ở I04/J01, không có fake I06 cho batch chưa commit.

**Readiness**

1. Trong **Khả năng lập kế hoạch**, bấm **Kiểm tra Readiness** lần đầu để mở chọn ngày.
2. Kiểm tra/chọn **Ngày bắt đầu kế hoạch**, bấm **Kiểm tra Readiness** lần tiếp để gửi request. Ngày mặc định là ngày sau `Store.as_of_date` khi component khởi tạo với Store.
3. API R01 `GET /stores/{store_id}/readiness?actions=planning&forecast_start_date=YYYY-MM-DD`.
4. Ready: có **Đi tới Dự đoán**. Chưa ready/unknown: **Xem điều kiện và thiết lập kế hoạch** nếu có quyền. Blocker có thể dẫn **Nhập thêm dữ liệu**, **Xem Kho**, **Xem Menu**.
5. **Hoàn tất** về `/imports/history`.

Lỗi/trạng thái: thiếu một trong ba quyền `planning.context.read`, `budget.read`, `procurement.cost.read` → BE có thể trả `403`; FE hiện chỉ khóa trước request nếu thiếu quyền đầu tiên. Thiếu ngày hoặc đang loading → khóa request; transport/HTTP/protocol → chưa kiểm tra được, thử nút lại; thiếu action planning, availability unknown hoặc ready nhưng can_execute=false → chưa xác định. Các mã đã có nhãn gồm `SALES_COVERAGE_INCOMPLETE`, `INVENTORY_COMPLETENESS_REQUIRED`, `SUPPLIER_COST_MISSING`, `DEFAULT_CONFIG_UNAVAILABLE`. Readiness thất bại/blocked không rollback completion. I06 readiness là snapshot lúc commit; R01 đánh giá hiện tại theo Store/ngày/quyền.

**Lịch sử và tiếp tục lô**

- Bấm **Lịch sử** / **Lịch sử nhập**. H01 `GET /stores/{store_id}/imports/calendar?month=...` và H02 `GET /stores/{store_id}/imports?import_date=...` cùng category/status/q khi được chọn; H02 có cursor/limit khi áp dụng.
- Bộ lọc lỗi HTTP/`INVALID_FILTER`/`INVALID_CURSOR`/response sai hoặc mất mạng: UI **Thử lại**, đổi bộ lọc hoặc về trang đầu. Không có dữ liệu là empty state, không phải request failure.
- Mở link lô `/imports?import_id=<id>` để resume. FE I04 đọc toàn bộ file pages, xác minh Store/source set, rồi đọc mapping, pinned Preview, job hoặc completion theo state. Không tạo draft mới khi resume.
- URL UUID sai, không thuộc Store hiện tại, không đủ quyền, hết retention/không tìm thấy, source set/page không nhất quán: khóa mutation. Có **Đọc lại lô từ máy chủ** khi lỗi resume được hiển thị; ở nhánh có CTA **Bỏ định danh đang mở và bắt đầu lô mới**, đây là bỏ locator local chứ không xóa lô BE. Chỉ bắt đầu lô mới sau khi đã đối soát trường hợp kết quả ghi chưa rõ.

## 12. Cách catch lỗi: áp dụng cho mọi bước gọi API

### 12.1. Tầng HTTP dùng chung

Nguồn: [httpClient.ts](../src/shared/http/httpClient.ts).

- `HttpError.kind=transport`: fetch/network/CORS/timeout. Timeout mặc định 15 giây; I02 override 120 giây. Browser không cung cấp đủ thông tin để FE phân biệt chắc chắn mất mạng với CORS chỉ qua fetch error.
- `kind=http`: HTTP không thành công nhưng không có error envelope đúng contract; có status/requestId nếu đọc được. Response không phải JSON cũng đi nhánh http nếu HTTP không OK.
- `kind=contract`: `{data:null,error:{code,message,details},meta}` hợp lệ; giữ status, problem và requestId. Kể cả HTTP 200 có error envelope hợp lệ cũng không coi success.
- `kind=protocol`: JSON success envelope sai, dữ liệu sai schema, IDs/revisions/digest không khớp, receipt không nhất quán. Có thể chưa xác định kết quả mutation đã được server lưu hay chưa.
- `CsrfTokenUnavailableError`: protected mutation thiếu token thì chặn trước fetch. Không tự sinh CSRF, không tự refresh token rồi replay mutation.
- Protected HTTP 401 vô hiệu hóa phiên trước khi parse body, kể cả body malformed; stale/aborted request được guard để không làm mất phiên mới.
- Abort do đổi Store/query/unmount được những reader tương ứng bỏ qua nếu request đã abort; không áp kết quả cũ vào scope mới.

### 12.2. Mã/status và hướng xử lý chung

- `400 INVALID_REQUEST`: cấu trúc request không hợp lệ; cần sửa dữ liệu/adapter, retry nguyên request không sửa sẽ không khắc phục.
- `401 UNAUTHENTICATED`: đăng nhập lại; không bypass AuthGuard.
- `403 PERMISSION_DENIED`, `CSRF_CHECK_FAILED`: kiểm tra quyền/phiên; không tự replay hoặc dùng Owner approval để thay quyền commit.
- `404 RESOURCE_NOT_FOUND`: không tồn tại hoặc ngoài scope được đọc; FE không kết luận chắc chắn resource đã bị xóa.
- `409`: conflict nghiệp vụ/trạng thái. Đọc lại canonical state, xử lý blocker tương ứng. Bao gồm `NO_UPLOADED_FILES`, `IMPORT_STATE_CONFLICT`, `ANALYSIS_NOT_READY`, `OWNER_MAPPING_APPROVAL_REQUIRED`, `UNRESOLVED_REQUIRED_FIELDS`, `SCHEMA_BLOCKED`, `PREVIEW_BLOCKED`, `PREVIEW_STALE`, `PREVIEW_NOT_AVAILABLE`, `MAPPING_VERSION_RETIRED`, `SOURCE_IDENTITY_CONFLICT`, `SALES_OVERLAP_UNRESOLVED`, `STALE_STOCK_OBSERVATION`, `IDEMPOTENCY_KEY_REUSED`, `IMPORT_NOT_COMPLETED`.
- `412 MAPPING_REVISION_CONFLICT`, `IMPORT_REVISION_CONFLICT`, `PROFILE_REVISION_CONFLICT`: đọc revision mới và review lại; không thay If-Match để âm thầm replay quyết định cũ.
- `413 RESOURCE_LIMIT_EXCEEDED`: giảm request/file theo đúng giới hạn; không có quota release bằng xóa file đã nhận.
- `415 INVALID_FILE_TYPE`: thay file hợp lệ. Trong I02 mã này cũng có thể nằm trong item rejection; kiểm tra location và HTTP shape thực tế.
- `422 INVALID_FILTER`, `INVALID_CURSOR`, `INVALID_MAPPING_TARGET`, `INVALID_IMPORT_CONFIGURATION`: sửa filter/cursor/target/config. Riêng `UPLOAD_REJECTED` receipt hợp lệ được xử lý riêng ở adapter I02.
- `428 PRECONDITION_REQUIRED`: thiếu CAS bắt buộc; cần đọc state và sửa request, không gửi thiếu header.
- `429`: Auth có thông báo riêng; Import catch generic theo message/status, không có automatic backoff/replay mutation được hứa bởi UI.
- `5xx`, đặc biệt `503 SERVICE_UNAVAILABLE`: chưa bảo đảm request ghi không được lưu. Dùng recovery theo operation, không mặc định thất bại hoàn toàn.
- Mã/status khác: vẫn catch ở HTTP/workflow; hiển thị generic state và diagnostic, không coi thành công vì code chưa có trong danh sách.

### 12.3. Workflow nào catch, thông tin user thấy

- [importData.data.ts](../src/features/import-data/importData.data.ts): catch riêng `422 UPLOAD_REJECTED`, validate committed per-file receipts; lỗi khác throw lên.
- [importData.workflow.ts](../src/features/import-data/importData.workflow.ts): catch draft/upload/analyze, resume/read/paging/preparation; `describeImportError()` bổ sung giải thích theo status. Mutation không rõ kết quả giữ intent khi transport/protocol/http hoặc status ≥500. Predicate batch hiện rộng: malformed HTTP 401/403 dạng `http` cũng có thể đi nhánh uncertain local trước khi AuthGuard điều hướng; không hiểu đây là quyền được retry khi chưa đăng nhập.
- Batch **Thử lại đúng yêu cầu trước** thực sự có thể gọi lại mutation draft/analyze bằng intent gốc; product recovery upload hiện dùng đọc I04. `retryRejectedFile` là upload mới chỉ cho file có receipt rejected rõ ràng, khác uncertain upload.
- [importFlow.workflow.ts](../src/features/import-data/importFlow.workflow.ts): wrapper `run()` catch và lưu error/fault; `sendPending()` giữ intent chưa xác định, còn ACK đã nhận thì không giữ pending để resend chỉ vì follow-up GET lỗi. Flow uncertainty loại 401/403; giữ non-contract errors hoặc contract status ≥500.
- `importFault()` phân loại `permission`, `profile`, `stale`, `conflict`, `system`. Rule ưu tiên: 401/403 hoặc permission code → permission; retired/inactive profile → profile; stale/expired preview code → stale; 409/412 còn lại → conflict; còn lại → system.
- Nút retry của flow gọi `checkPendingState()` để **đọc đối soát**, không replay M04/N5/I05. Chưa có negative intent-status receipt thì state không đổi vẫn là unknown.
- J01 HTTP 200 + `status=failed`: workflow bắt ở nhánh status, lưu `job.error`; không cần Promise reject mới là lỗi.
- `importMessage()` chỉ dịch một tập mã có sẵn. Message chứa mã kỹ thuật/DTO/hash có thể được thay bằng câu chung; `DebugValue` chứa diagnostic trong DEV. Vì vậy không hứa production có mọi `error.details.field_errors` cạnh từng ô hoặc có request_id hiển thị cho user ở mọi màn.
- Entity search catch riêng vào kết quả search lỗi, nút **Thử lại** tăng retry query. Readiness catch riêng, phân biệt 403 với unavailable; không thay đổi import receipt.
- Validation request/response còn kiểm tra UUID canonical, version/header an toàn, schema wire, cursor/limit, đúng Store/import/sheet/mapping, IDs không trùng, counts/quota/source set và consistency giữa các trang. Không enumerate mọi chuỗi lỗi schema thành một code BE; chúng là lỗi FE/protocol và được catch theo nhóm trên.

## 13. Giới hạn runtime cần biết khi dùng tài liệu này

- FE chưa tích hợp production MQ/notification; tạm dùng link bàn giao và N5. BE đã có các API này.
- FE chưa tích hợp SU01 Supplier search. Immediate create+bind và persisted API riêng cho sales/supplier domain decision không được chứng minh là capability đã có; domain decisions hiện gửi cùng commit.
- Không có DELETE/replace file đã nhận; source set đã seal không mở lại để thay bytes. File thay cho rejected là upload mới trong lô chưa seal.
- General period/custom-source catalogue, finer declaration controls và một số domain decision/effectivity states chưa có full runtime parity; xem [FOUND_MISSING_UI.md](FOUND_MISSING_UI.md) và [015_Import_TechDebt.md](015_Import_TechDebt.md). BE chưa hỗ trợ Import trực tiếp layout constraints tổng quát, weather/uplift hoặc combo/discount/derived savings theo phản hồi `b0db90c`; yêu cầu nhập các layout đó là mở phạm vi, không phải resolve policy cũ. Không suy endpoint DESIGN_READY hoặc BE đã implement đồng nghĩa FE đã wire.
- Một số recovery còn thiếu CTA production đầy đủ: readback quota sau upload ACK lỗi, retry analyze đã seal, pending Preview/N5 không đủ receipt đối soát. Nếu không có nút tương ứng, ghi nhận blocker để hỗ trợ kỹ thuật; không hướng dẫn dùng DEV controls như tính năng production.
- **HDSD**, **Bỏ tất cả**, panel batch diagnostic, điều hướng debug steps, **Xem chi tiết biên nhận** và nút **Đọc lại bước xử lý** nằm dưới `DebugContent`; không coi là nút luôn có trong production.
- **File mẫu** chưa triển khai. Các nút Owner **Phê duyệt Staff** / **Profiles** trên trang là `UnderConstructionButton`, không phải inbox/quản lý profile runtime hoàn chỉnh.
- File local, chưa-submit form và pending mutation intent không được lưu bền vững. Resume bằng `import_id` chỉ khôi phục dữ liệu BE đang giữ và actor còn quyền đọc.

## 14. Nguồn đối chiếu và cách bảo trì

- Route/quyền/resume: [ImportWorkspace.tsx](../src/pages/imports/ImportWorkspace.tsx), [ImportPage.tsx](../src/pages/imports/ImportPage.tsx), [AuthGuard.tsx](../src/features/auth/AuthGuard.tsx).
- Upload/analyze adapters và lifecycle: [importData.data.ts](../src/features/import-data/importData.data.ts), [importData.workflow.ts](../src/features/import-data/importData.workflow.ts), [importData.validation.ts](../src/features/import-data/importData.validation.ts).
- Mapping/N5/Preview/Review/commit: [importFlow.data.ts](../src/features/import-data/importFlow.data.ts), [importFlow.workflow.ts](../src/features/import-data/importFlow.workflow.ts), [importFlow.validation.ts](../src/features/import-data/importFlow.validation.ts), [importDomainReview.ts](../src/features/import-data/importDomainReview.ts).
- Nhãn nút và guard UI: [ImportFlow.tsx](../src/features/import-data/components/ImportFlow.tsx), [ImportResolveDrawers.tsx](../src/features/import-data/components/ImportResolveDrawers.tsx), [ImportMapping.tsx](../src/features/import-data/components/ImportMapping.tsx), [ImportPreview.tsx](../src/features/import-data/components/ImportPreview.tsx), [ImportReadiness.tsx](../src/features/import-data/components/ImportReadiness.tsx).
- Baseline contract: [V2 OpenAPI](../api-contract-v2/generated/openapi.json), [Import contract §11 errors](../api-contract-v2/docs/IMPORT_MAPPING_API_CONTRACT_VI.md), [Batch mechanics](../api-contract-v2/docs/IMPORT_BATCH_MECHANICS_RESPONSE_VI.md). Contract có ghi chú lịch sử theo milestone; inventory runtime trong tài liệu này lấy từ adapters FE hiện tại, không từ claim lịch sử.

Khi đổi nhãn CTA, adapter/query, quyền, cách recovery hoặc bổ sung endpoint runtime, cập nhật đồng thời bước liên quan và mục catch/giới hạn. Tài liệu này không thay thế kiểm thử acceptance với BE triển khai thực tế.

## 15. Đối chiếu BE main và FE — 16/10/2026

### 15.1. Nguồn và mức chứng cứ

- **BE báo đã có tại `b0db90c`:** phản hồi người dùng cung cấp trong hội thoại. Chưa lấy được Git object/OpenAPI đúng commit này; không ghi nhận `VERIFIED_SOURCE` cho riêng `b0db90c`.
- **BE source đã đọc local:** `/Users/thuong/Desktop/MLAI_backend`, HEAD `052cddee075e165af2c0cea42ebc2e616c396760`. `git ls-remote origin refs/heads/main` trong lượt này cũng trả SHA đó. Lookup GitHub commit `b0db90c` trả HTTP 422; hai checkout BE local không có object này. Điều đó chỉ giới hạn nguồn có thể kiểm chứng, không phủ nhận phản hồi BE.
- **BE handoff đã đối chiếu offline:** [provenance](../shelfcash_FE_handoff_869eaec9/provenance/source.json), source SHA `869eaec914aa6905d6b935889afebe7d973004ae`; [OpenAPI](../shelfcash_FE_handoff_869eaec9/openapi.json), SHA-256 `790443d80350cc597c7c06179309e43303ba558de34017ea1dd4113de71fc1ee`, 73 operations/66 paths. Không tự coi đây là snapshot `b0db90c`.
- **FE đã đọc:** HEAD `864ac8c9bf4ae811d78a3d19d8b4050740eb1441`, cộng file hướng dẫn này đang untracked từ lượt trước. [wire-source.mjs](../scripts/wire-source.mjs) vẫn pin `contracts/011/openapi.main.json`, SHA-256 `d45b25e6423c52a854bae39efc7896df5c44a22f15549fa7f7259b565e2d837d`, 54 operations/50 paths.
- **Kiểm chứng trong lượt này:** source read/static OpenAPI diff, probe validator cục bộ và các tests FE controlled. Không đăng nhập BE, không gọi business mutation, không chạy BE integration suite, không đổi worker/DB/config và không có live E2E mới.

`BE CÓ` dưới đây nghĩa source/handoff khả dụng hỗ trợ capability đó, cùng phản hồi BE cho commit mới; `FE CHƯA/PARTIAL` là kết luận từ code FE. Hai mức này độc lập với `VERIFIED_LIVE`, hiện chưa đạt trong lượt này.

### 15.2. G0 — pin và strict wire compatibility: cần xử lý trước các slice tích hợp

**BE CÓ / FE CHƯA ĐỒNG BỘ.** Cùng URL `/api/v1` và `info.version=1.0.0` không bảo đảm DTO giống baseline FE.

- M02 `MappingList` thêm `mapping_revision`, `counters`, `counter_scope`; M01 cũng thêm counters/scope.
- N5 `DecisionResult` thêm required `submission`, `notification_delivery`, kể cả khi không dùng queue trực tiếp.
- I04 `PreviewPage` thêm required `mapping_revision`, `read_set_digest`, `source_evidence_digest`, cùng aggregates; PreviewRow thêm receipt/stockout/contribution effects.
- M03/schema/source/preview unions mở rộng lên 15 schemas; receipt và bốn history/event schemas không nằm trong enum FE cũ.
- R01 thêm `planning_assessment`, `forecast_assessment`; những validator strict của Planning cũng cần review khi đồng bộ snapshot dùng chung.

`matchesImportWire()` reject unknown keys khi `additionalProperties=false`. Vì vậy field additive trên BE vẫn có thể làm FE protocol error. Không sửa bằng bỏ validation/cho arbitrary object; cần pin snapshot chính xác, regenerate closures và cập nhật adapters/fixtures cho từng slice. Không đổi pin chung một cách cơ học vì Auth/Store/Planning/Operations cũng dùng generator nguồn này.

**Đã kiểm controlled:** 9 probe bằng matcher FE thật, bundle vào thư mục tạm rồi xóa. Baseline sales descriptor, DecisionResult và MappingList được nhận; descriptor `inventory_receipts`, DecisionResult có hai field mới và MappingList có `mapping_revision` bị từ chối. Wire cũ đã chấp nhận commit thiếu/null reason; schema `RequestChanges` chưa tồn tại trong matcher FE. Các probe là payload tổng hợp dựa trên schema, không phải response lấy từ request BE sống.

### 15.3. G1 — Supplier reader

**BE CÓ / FE CHƯA NỐI / LIVE CHƯA KIỂM.**

- SU01 `GET /stores/{store_id}/suppliers`, query `q`, `active`, `sort`, `limit`, `cursor`, `snapshot_id`. Reader kiểm `supplier.read`; trả canonical ID/name/active/version, không thay bằng endpoint terms/cost.
- Source local: `app/api/discovery.py`, `DiscoveryReads.suppliers()` trong `app/application/use_cases/discovery.py`. OpenAPI handoff có operation SU01 và `SupplierPickerEnvelope`.
- FE `searchImportEntities()` chỉ gọi Product/Inventory; nhánh Supplier throw và `ImportIdentityResolver` khóa search nếu không có injected source.
- Lượt tích hợp cần adapter typed SU01, query/snapshot/paging/current authorization, revoke và stale selection guards. Không tự lọc inactive nếu contract/operation không yêu cầu.
- Lỗi cần cover: `403`, `INVALID_FILTER`, `INVALID_CURSOR`, `SNAPSHOT_NOT_AVAILABLE`, transport/protocol; supplier hiện có cùng Store phải chọn được, không sinh proposal mới vì reader FE chưa nối.

### 15.4. G2 — submission, queue, notification và N5 request_changes

**BE CÓ / FE CHƯA NỐI MQ/NF, N5 PARTIAL / LIVE CHƯA KIỂM.**

- MQ01 `POST /imports/{import_id}/mapping-submissions`: submit body `{action:"submit",profile_id,proposal_revision,mapping_revision,reason}` hoặc withdraw `{action:"withdraw",submission_id,expected_submission_version,reason}`. `If-Match` là import_revision; cookie/CSRF/key/Origin theo contract.
- MQ02 `GET /stores/{store_id}/mapping-submissions`: state/file/import/limit/cursor; Owner đọc scope Store, Staff own scope. Mặc định Owner chỉ submitted eligible, Staff own submissions; lịch sử dùng explicit state.
- MQ03 `GET /stores/{store_id}/mapping-submissions/{submission_id}`: pinned full spec/evidence, `evidence_limit`, `evidence_cursor`, current eligibility/profile drift. Không thay pinned revision bằng latest.
- N5 đã có `approve_activate`, `reject`, `request_changes`, `retire`. Queue decisions có submission ID/version fence; direct Owner self-approval vẫn được. Một decision duyệt một full profile proposal, không phải atomic bulk nhiều profiles.
- NF01 `GET /notifications`, NF02 `GET /notifications/unread-count`, NF03 `PATCH /notifications/{notification_id}` cung cấp inbox/read state. Submission/decision notification không phải commit receipt, không cấp quyền mới.
- FE hiện chỉ direct N5 approve/reject/retire và manual link dialog. `ProfileDecisionRequest`/wire không có RequestChanges hoặc submission fences; không có adapter gọi MQ/NF. Vì vậy không được mô tả queue/notification là BE chưa có.
- Lỗi cần cover khi tích hợp: `REVIEW_NOT_READY`, `MAPPING_ALREADY_SUBMITTED`, `MAPPING_SUBMISSION_STALE`, `MAPPING_SUBMISSION_STATE_CONFLICT`, revision/permission/cursor/snapshot errors. Same-key submit replay không tạo task/notification trùng; withdrawal không đồng nghĩa reject profile.
- Source local: `app/api/mapping_submissions.py`, `app/application/use_cases/mapping_submissions.py`, `ImportStaging.decision()`; [canonical handoff mục 15](../shelfcash_FE_handoff_869eaec9/contracts/docs/IMPORT_MAPPING_API_CONTRACT_VI.md).

### 15.5. G3 — RULE approval và column suggestions

**BE CÓ / FE GATE QUÁ CHẶT / LIVE CHƯA KIỂM.**

- Source `ImportStaging.decision()` duyệt complete valid spec, `missing_fields=[]`; cập nhật đúng Sheet, `needs_confirmation`, `suggestion_origin=RULE`, issue `classification`/`column` sang `auto_mapped`, `resolution_origin=APPROVED_PROFILE`.
- Không suy mọi unresolved issue được bulk approve: identity/conversion/ambiguous hoặc spec thiếu vẫn phải xử lý theo contract. MQ eligibility cũng kiểm deterministic candidate có evidence.
- FE `ImportFlow.tsx` khóa cả Owner **Xem profile sẽ được lưu** và Staff **Bàn giao cho Owner** bằng `progress.unresolved > 0`. Đây là UI navigation gate quá chặt; `decideProfile()` vốn đã có checks full spec/missing fields/CAS, không nên thay toàn bộ bằng bypass unresolved.
- `needs_confirmation` có target là đề xuất để review, không tự là lỗi pipeline. `profile_proposals=[]` chỉ nói không có profile proposal; column suggestions nằm M02 độc lập. FE drawer hiện đọc `target_field/suggested_target_field` từ issue, nên chưa thấy bằng chứng rằng chỉ riêng empty proposals làm mất suggestion. Cần test response M02 thật sau khi sửa strict wire, không tự báo thêm bug chưa chứng minh.
- Acceptance cần có: Owner tự tạo → duyệt full valid RULE spec dù unresolved candidate >0; Staff submit cùng điều kiện; missing_fields/unsupported/ambiguous thật vẫn chặn; approval xong refresh auto_mapped và không tự commit.

### 15.6. G4 — source_only và 15 schemas

**BE CÓ / FE PARTIAL, một số valid target bị khóa / LIVE CHƯA KIỂM.**

- Enum BE handoff gồm `sales`, `recipes`, `inventory_count`, `opening_stock`, `inventory_receipts`, `products`, `ingredients`, `suppliers`, `supplier_terms`, `payable_fees`, `scope_declarations`, `calendar_events`, `promotion_observations`, `usage_history`, `purchase_history`.
- Source `import_descriptors.py` trả `support=source_only, available=true` cho dữ kiện nguồn; M04 trong `ImportStaging` cho target available có support khác `unsupported`. FE mapping editor và workflow lại yêu cầu `support==='supported'`; shared-value selectors cũng lọc như vậy.
- Wire nhận literal source_only không đồng nghĩa UI cho chọn. Cần review cả type/descriptor/UI và M04 guards, giữ đúng input_sources/scope/nullability của từng field; không đơn giản đổi source_only thành canonical_candidate.
- Không tự bỏ cột source_only, không coi optional là có thể IGNORE âm thầm; không chuyển purchase history thành receipt, không suy calendar/promotion observations thành weather/uplift/combo formulas.
- Acceptance: descriptor source_only khả dụng hiển thị/chọn đúng vai trò nguồn và save đúng M04; unsupported/unavailable vẫn khóa; 15 schema unions và typed effects/evidence/completion được nhận, không làm mất provenance.

### 15.7. G5 — Preview, persisted Review, atomic commit và reason

**BE CÓ / FE ĐÃ NỐI TRÊN BASELINE CŨ, reason quá chặt / LIVE CHƯA KIỂM.**

- FE có I05 ba phases, J01, I04 pinned Preview, I06, current required_actions và domain guards. Các tests controlled chứng minh phạm vi baseline cũ, không chứng minh parity main mới.
- BE commit DTO permits omitted/null reason; `import_commit.py` yêu cầu reason cho `REPLACE_DAILY_TOTAL`, `MERGE_DISJOINT_SALES`, `COUNT_CORRECTION`, `AMEND_TERM_PERIOD`, `AMEND_FEE_PERIOD` và các justification riêng theo action.
- FE `commitBlockers()` thêm reason vô điều kiện; `ImportPreview.tsx` luôn yêu cầu textarea nonempty; mock cũng bắt reason. Cần sửa nhất quán UI/workflow/fixtures/tests, vẫn giữ Review reason và per-row sales/supplier reason/ack riêng.
- Không có API riêng persist sales/supplier decision trước commit: đây là capability chưa có, không cùng loại gap với SU01/MQ đã có. Quyết định staged local phải gửi cùng đúng commit intent.
- Acceptance: pure insert/NO_OP omit/null reason hợp lệ; correction thiếu reason bị chặn; Review confirmation không thay justification; stale/read-set/permission thay đổi vẫn fail closed; 202 chưa là completion.

### 15.8. G6 — Readiness planning

**BE CÓ / FE CHECK QUYỀN CHƯA ĐỦ, wire cần đồng bộ / LIVE CHƯA KIỂM.**

- Source `app/application/readiness_evaluation.py`, `ACTION_READS['planning']` cần đủ ba quyền `planning.context.read`, `budget.read`, `procurement.cost.read`.
- FE ImportReadiness chỉ kiểm quyền đầu tiên để mở CTA/link. BE vẫn có authority cuối cùng và trả 403; đây không phải permission bypass, nhưng FE hiện hứa thao tác có thể thực hiện quá sớm.
- Cần gate/feedback đủ ba quyền và đồng bộ response assessment; không gộp default planning readiness với mọi supplied request. Completion vẫn giữ nguyên dù R01 bị denied/unknown/unavailable.
- Acceptance từng quyền thiếu riêng, revoke giữa request, ngày đổi, unknown/blocked/ready và lỗi R01 không ảnh hưởng receipt.

### 15.9. Những mục không cần quyết định policy mới

- Không có DELETE/replace accepted file hoặc mở lại seal để thay bytes; không có generic negative mutation-outcome endpoint. Retained state và idempotent replay theo từng operation là cơ chế BE hiện hành. FE read-only recovery thận trọng là lựa chọn triển khai hiện tại, không phải BE cấm mọi same-key replay.
- BE chưa hỗ trợ direct Import general layout constraints, weather/uplift, combo/discount/derived savings. Muốn thêm các layout đó là scope extension.
- Policy đã rõ: proposal/approval/Review/commit tách biệt; Staff không quyết định profile; approval không cấp quyền commit; unknown khác zero/null/IGNORE; không auto-bind hoặc bỏ nguồn.
- Chỉ cần chủ nguồn xác nhận khi dữ liệu cụ thể nhập nhằng: PNK purchase history hay actual receipt; NCT là ngày nào; recipe theo mỗi suất hay toàn yield; giá/MOQ theo pack hay base unit; kiểm kê dùng giờ/timezone nào; calendar mô tả sự kiện gì. Không hỏi lại những quyết định policy đã chốt.

### 15.10. Thứ tự tích hợp đề xuất và kết quả kiểm tra

1. Chốt artifact exact `b0db90c` (hoặc SHA main thay thế được BE xác nhận), pin/hash/diff toàn closure có caller dùng chung; preserve provenance baseline 011.
2. Sửa strict wire/adapters cùng RULE approval gate và source_only bằng các slice có acceptance riêng. Đây là các điểm có thể chặn luồng hiện có, ưu tiên trước xây queue mới.
3. Nối SU01, sau đó MQ/N5 request_changes/NF với pinned submission evidence, lỗi/CAS/permissions. Audit latest OWNER/STAFF MagicPath trước viết UI theo AGENTS; màn/nút chưa thiết kế phải được ghi gap, không tự dựng final UI.
4. Hoàn thiện 15 schema effects/evidence, commit reason conditional và Readiness permission/assessment; chạy controlled regression và live E2E với đúng BE snapshot/worker khi môi trường sẵn sàng.

Kết quả lượt tài liệu này: `npm run check:import-wire` PASS cho **127 schemas/types theo baseline 011**; `node tests/run-import-batch.mjs import-flow-boundary import-flow-workflow import-mapping-ui` **67/67 PASS**; 9 probe validator đạt các kết quả accept/reject nêu ở G0. Gate/tests pass không đóng các gap main mới. Chưa đổi production code, pin/generator, fixtures, design hoặc trạng thái FM thành IMPLEMENTED.
