# Phân quyền ShelfCash — contract thiết kế tiếng Việt

Ngày ghi nhận: 09/10/2026. **ĐÃ CHỐT / ACCEPTED DECISION về sản phẩm** là các
nguyên tắc người dùng chỉ định trong task phân quyền; không tuyên bố implementation
hay tự ACCEPT một ADR mới. Permission catalogue và routes mới ghi **PROPOSAL**.
Các phần **CURRENT FACT** dựa trên đọc filesystem, không phải tests vừa chạy.

## Phạm vi, nguồn và rollback — HISTORICAL INFORMATION của lượt đầu

Chỉ tạo tài liệu phân quyền chung và ZIP review. Giữ nguyên contract FE gốc,
`C01_PLANNING_CONTEXT_VI.md`, `PROCUREMENT_API_CONTRACT_VI.md`, code, schema,
ADRs và unrelated WIP. Không commit/push, migrate/reset DB hoặc sửa FE.
Rollback chỉ bỏ tài liệu mới và ZIP mới, không restore/reset worktree.
Acceptance tài liệu: phân biệt approval sản phẩm với runtime, đủ 12 nhóm,
không tạo quyền từ legacy, không đổi C01/C02, verify nguồn/manifest/CRC/hashes ZIP.
Không cần pytest/OpenAPI regeneration vì không có thay đổi code/public runtime.

Nguồn authorization: task người dùng gửi ngày 09/10/2026, bản đầy đủ trong ZIP
ở `review_context/AUTHORIZATION_TASK.txt`. Nguồn đối chiếu:
`docs/ShelfCash_FE_BE_API_CONTRACT_v0.md`, hai contract VI và ADR-001/004/009/013.

## CURRENT FACT — nền hiện có

- `app/models/user.py:12`: stored identity, chưa login/password verification/auth.
- `app/models/store.py:12`: Store context, chưa public CRUD/tenancy enforcement.
- `app/models/store_membership.py:15`: membership chỉ lưu quan hệ. `:20` unique
  Store/User; `:21` chỉ OWNER/STAFF; `:22` bắt `delegated_permissions = []`.
  `:34` lưu active. Không suy ra OWNER đang có toàn quyền runtime.
- `app/repositories/identity.py:25`: add/read/list membership theo Store là
  persistence access, không phải service cấp/thu hồi quyền.
- `docs/DATABASE_SCHEMA.md:96`: schema membership chưa có sole/minimum owner
  enforcement; `:118` cấm nonempty delegated permissions. Cần migration rõ ràng
  trong slice implementation được giao, không ghi permissions vào JSON hiện tại.
- `app/main.py:19` chỉ đăng ký health router; `app/api/health.py` là route hiện có.
  `docs/API_CONTRACT.md:3` xác nhận business APIs/auth chưa triển khai.
- `tests/integration/test_identity_store_schema.py:105` có tests membership
  persistence; `:171` trở đi test reserved permissions. Đọc tests không chứng
  minh actor authorization, one-time approval hoặc audit đã hoạt động.
- `app/application/decision_snapshot_source.py:1` nói rõ Store scoping không phải
  actor authorization. Internal operational services/engines không phải HTTP APIs.

## ĐÃ CHỐT — quyền theo nhân viên và Store

Owner có toàn quyền trong Store mình sở hữu, trong giới hạn validation/lifecycle
và ràng buộc nghiệp vụ; không có quyền vượt Store. Staff chỉ được làm tác vụ
được cấp tại Store đó. Một người có quyền khác nhau giữa các Store.

Tách quyền xem và thao tác. Server kiểm tra từng request và Store của đối tượng,
không tin Store ID/actor do payload khai hoặc việc FE ẩn nút. Không được cấp quyền
thì mặc định từ chối. Staff hoặc quản lý một tính năng không tự có quyền quản lý
permissions. Không thêm Manager. Owner quản lý quyền ở scope đầu tiên; delegation
quản lý permissions để OPEN.

Membership bị thu hồi không được dùng thường quyền hoặc approval cũ để tiếp tục
thao tác. User/Store/membership active rules và thời điểm enforce kỹ thuật cần
specification; không suy ra active flag hiện đang được kiểm tra authorization.

## Ma trận 12 nhóm — catalogue PROPOSAL, không phải quyền đã triển khai

Tên permission gợi ý dùng nhóm + tác vụ để trao đổi, chưa chốt enum/checkbox đầy
đủ. **Không permission nào dưới đây đã được enforce runtime.** IMPLEMENTED chỉ
chỉ phần nội bộ có bằng chứng, không nghĩa endpoint hay policy đã triển khai.

| Nhóm tham khảo | Tác vụ/quyền đề xuất tách riêng | Capability thực tế và bằng chứng |
| --- | --- | --- |
| 1. Tổng quan | Xem dashboard; xem dữ liệu nhạy cảm riêng | Dashboard PROPOSED, chưa HTTP/business aggregation dành cho màn này; `app/main.py`. |
| 2. Nguyên liệu | Xem; tạo; sửa; ngừng sử dụng | Internal create/get IMPLEMENTED: `app/application/use_cases/catalog.py:46`; sửa/lifecycle HTTP chưa có. |
| 3. Menu và sản phẩm | Xem; tạo; sửa; thay trạng thái bán | Internal create/get IMPLEMENTED: `catalog.py:10`; Product.active là storage, không chứng minh update API. |
| 4. Công thức | Xem; tạo phiên bản; thay hiệu lực | Internal create_version/get_active IMPLEMENTED: `app/application/use_cases/recipe.py:23`; pure dated BOM IMPLEMENTED: `bom.py`; API permissions PROPOSED. |
| 5. Kho hàng | Xem lô/lịch sử; kiểm kê; điều chỉnh; nhận hàng | Receive/adjust/get/movements nội bộ IMPLEMENTED: `app/application/use_cases/inventory.py:16`; workflow kiểm kê và PO receiving chưa được suy ra từ adjust/receive. |
| 6. Bán hàng và tiêu hao | Xem; ghi sales; sửa sales; xem tiêu hao | Record/history nội bộ IMPLEMENTED: `app/application/use_cases/sales.py:15`; full sales correction và operational depletion workflow chưa có. Pure FEFO không tự ghi tiêu hao thật. |
| 7. Mua hàng | Xem; tạo/sửa nháp; xác nhận đặt mua; nhận hàng | Purchase-order lifecycle chưa có. Procurement engine không phải PO; quyền nháp/xác nhận/nhận phải riêng khi triển khai. |
| 8. Điều kiện nhà cung cấp | Xem; tạo; sửa; xem giá nhập | Create/get SupplierTerm nội bộ IMPLEMENTED: `app/application/use_cases/supplier.py:15`; không có permission/CRUD HTTP. |
| 9. Dự báo và kế hoạch | Xem context/results; chạy forecast/plan; lưu requirements; export | Forecast execution IMPLEMENTED nội bộ: `forecast_execution.py:76`, `forecast_trained_execution.py:53`; capture/pipeline/comparison nội bộ có. HTTP C01/C02, winner và saved persistence chưa có. |
| 10. Trợ lý quyết định AI | Xem giải thích; yêu cầu giải thích; What-if riêng | PROPOSED, chưa runtime trợ lý/LLM/What-if. Backend business truth không được thay bằng provider; ADR-001/004. |
| 11. Nhập Excel | Upload; mapping; preview; approve mapping; commit theo từng loại dữ liệu | PROPOSED, chưa import/parser/mapping runtime; ADR-008/013 là direction. Mapping self-approval của authorized mapper khác Owner duyệt một lần tác vụ thiếu quyền. |
| 12. Cấu hình và lịch kinh doanh | Xem/sửa context; lịch; xem/sửa budget; quản lý quyền riêng | Store.create/get nội bộ có: `app/application/use_cases/store.py`; BusinessConstraint storage có. Lịch/business settings API và permission management chưa có. |

12 nhóm từ ShelfCash cũ chỉ là khung tham khảo được user yêu cầu, không port APIs,
schema hoặc checkbox legacy. Permission xem cost/budget là lớp bảo vệ xuyên nhóm,
không chỉ một checkbox trong nhóm 12. Bộ quyền mẫu có thể PROPOSED giúp Owner tick
nhanh; không tự cấp hoặc thay enforcement từng tác vụ.

## ĐÃ CHỐT — cấp quyền thường xuyên

Owner chọn Store → chọn nhân viên thuộc Store → tick tác vụ theo nhóm → lưu → xem
lịch sử thay đổi. Đọc quyền, cập nhật quyền và xem audit là các responsibilities
cần phân biệt; Staff không tự được quản lý quyền chỉ vì có quyền tính năng.
Trước khi lưu phải validate actor/Store/membership hiện hành và sự hợp lệ của bộ
quyền. OPEN: permission implications, owner lifecycle, nhiều Owner, last Owner,
concurrency/versioning và thời điểm thu hồi có hiệu lực đối với job đang chạy.

## ĐÃ CHỐT — duyệt một lần thay owner-key chung

Staff bị chặn → nếu policy cho phép tác vụ đó, gửi yêu cầu cùng lý do → server
xác định actor, Store, tác vụ, đối tượng và dữ liệu dự kiến đổi → Owner xem nội
dung cụ thể rồi duyệt/từ chối → Staff chỉ thực hiện đúng thao tác được duyệt.

Approval có thời hạn ngắn và dùng một lần; không thay đổi thường quyền của Staff.
Owner không phản hồi, từ chối hoặc hết hạn thì vẫn chặn. Nội dung hoặc dữ liệu
liên quan thay đổi thì approval cũ không được tái sử dụng. Thời hạn 5 phút chỉ là
ví dụ mockup, chưa được chốt. Không có key chung mở toàn quyền nhiều lần.
Nếu sau này dùng mã nhập thì mã phải gắn đúng yêu cầu và cùng giới hạn; không
phải mật khẩu Owner/key Store. Cơ chế mã/token chưa chốt hoặc triển khai.

Policy allowlist tác vụ được yêu cầu approval còn OPEN. Không tự cho mọi quyền,
đặc biệt quản lý quyền, quyền sở hữu hoặc dữ liệu nhạy cảm, dùng cơ chế này.

Ví dụ đã chỉ định: Linh được kiểm kê nhưng không được điều chỉnh kho. Linh yêu
cầu sửa LOT-01 từ 12 L xuống 10 L tại Store A kèm lý do; Owner duyệt đúng nội dung
đó. Khi thực hiện, server vẫn kiểm tra lô thuộc A, membership còn hợp lệ, balance/
version chưa đổi, đúng đơn vị và validation. Nếu balance đã thành 11 L thì không
tái sử dụng approval "12 → 10". Kiểm kê workflow và approval chưa có trong code.

## ĐÃ CHỐT — thực hiện, retry và audit

Approval chỉ bổ sung quyền tác vụ, không bypass Store isolation, membership thu
hồi, validation, budget, business constraints, trạng thái/lifecycle, phiên bản
hoặc lỗi kỹ thuật. Kiểm tra lại điều kiện hiện hành tại lúc thực hiện.

Tiêu thụ quyền một lần và ghi dữ liệu phải bảo đảm retry/concurrent requests
không làm thao tác hai lần. Không suy ra idempotency C02 đã đủ cho approval ở mọi
mutation. Transaction/version/storage design, xử lý crash/uncertain commit và
retry sau thất bại còn OPEN, cần failure-case acceptance trong slice triển khai.

Audit ghi actor đổi quyền, người nhận, Store, quyền trước/sau; requester, approver/
rejector; tác vụ/đối tượng/nội dung được duyệt; lý do/thời điểm/hạn; executor,
kết quả và trạng thái quyền một lần. Staff vẫn là executor, không đổi actor thành
Owner. Không ghi mã/token bí mật trong logs. Audit retention/visibility và schema OPEN.

PROPOSAL — lỗi có cấu trúc cần mô tả category/code, tác vụ thiếu quyền, scope
được phép tiết lộ, có được request approval không và lý do. Không tự hiện ô nhập
key sau mọi 403. Phân biệt chưa đăng nhập, không quyền/membership thu hồi, policy
không cho approval, pending/rejected/expired/consumed, payload/version conflict và
business validation. Mã cụ thể/HTTP mapping/403 hay 404 để tránh lộ tài nguyên OPEN.

## ĐÃ CHỐT — import và dữ liệu nhạy cảm

Upload/mapping/preview không tự cho quyền ghi. Khi confirm import phải xác định
tất cả nhóm dữ liệu/tác vụ ghi và kiểm tra quyền toàn phạm vi; kiểm tra lại lúc
commit, không chỉ upload. Thiếu quyền thì chặn commit, không âm thầm bỏ phần
không có quyền. Không tự cho batch import dùng approval một lần nếu chưa có spec
nội dung/phạm vi batch. Preview/results/history cũng cần quyền xem.

Quyền xem ngân sách/giá nhập/dữ liệu nhạy cảm áp đồng nhất ở API, dashboard,
comparison, export/PDF, AI/explanation, import preview/history. Không gửi facts
không được phép cho LLM rồi mong model tự che. Không để suy diễn/dẫn xuất làm lộ
dữ liệu bị chặn. Core decision không phụ thuộc provider khả dụng.

OPEN — partial response/redaction hay chặn toàn response: redaction thuận tiện
nhưng phải kiểm soát mọi derived field; chặn toàn response dễ kiểm chứng nhưng
giảm tiện dụng. Chưa hứa backend có redaction hoặc tự chọn một hướng.

## Giữ luồng procurement — không sửa C01/C02

Approval quyền thao tác không phải chọn/duyệt candidate. Hệ thống vẫn đề xuất
theo requirements và winner. Không bắt khách xác nhận chọn phương án, không thêm
`selected_option`, xác nhận mua hoặc tự đặt hàng vào luồng này. Người dùng cho phép
xuất PDF phương án tối ưu hoặc phương án khác; PDF implementation chưa có, quyền
export/view cần review. Không thiết kế payload export trong tài liệu phân quyền.

C01/C02 nói winner khác lựa chọn xác nhận khách và không tự đặt hàng; câu này
không yêu cầu một bước xác nhận. Saved/winner/source scope vẫn theo contract chung.
FE gốc có C09 draft PO PROPOSED; không triển khai hoặc đưa vào luồng đã duyệt chỉ
vì route có trong v0. Các proposal legacy về selection không thành quyết định.

## Bản đồ endpoints — tái sử dụng, không tự bịa ID

| ID / route từ FE gốc | Vai trò tham khảo | Trạng thái |
| --- | --- | --- |
| A01 `POST /auth/login` | Xác thực | PROPOSED, chưa runtime. |
| A02 `POST /auth/register` | Tạo tài khoản/onboarding | PROPOSED, chưa runtime; không tự cấp Owner cho Store bất kỳ. |
| A03 `GET /auth/me` | Session/identity | PROPOSED, chưa runtime; shape permissions chưa duyệt. |
| A04 `POST /auth/logout` | Đóng session | PROPOSED, chưa runtime. |
| T01 `GET /stores` | Liệt kê Stores được phép | PROPOSED, chưa runtime; giữ route gốc, query/paging còn theo review riêng. |
| T02 `GET /stores/{store_id}` | Context Store được phép xem | PROPOSED, chưa runtime. |
| C01/C02 | Context và Run procurement | Contract sản phẩm đang review; HTTP chưa có. Giữ ID/route đã chốt. |
| I01–I06, M* | Import/mapping | PROPOSED trong FE gốc; áp nguyên tắc quyền, không thiết kế lại endpoints. |
| `GET /health` (không gán ID mới) | Liveness | IMPLEMENTED public tại `app/api/health.py`. Không xác nhận DB/auth readiness. |

PROPOSAL — thiếu responsibilities cho Owner xem/cập nhật quyền/audit và Staff
request/Owner review approval. Các responsibilities cần API vì không được chỉ
thực hiện ở FE, nhưng chưa chốt routes/IDs/payloads; không tạo 12 endpoints theo
12 nhóm. Catalogue/lifecycle được duyệt riêng trước khi đề xuất đường dẫn cụ thể.

## OPEN của lượt đầu — HISTORICAL INFORMATION, xem cập nhật v1 bên dưới

- Permission vocabulary/checkboxes/action mapping, implications và bộ mẫu.
- Login/session/bootstrap, Store ownership/multiple/last Owner, membership active
  rules, onboarding/revocation và saved dùng chung hay theo người.
- Approval allowlist, thời hạn, lifecycle/retry, version binding, concurrent execution,
  lưu trữ/migration và kiểm tra quyền ở các giai đoạn job dài.
- Routes/IDs/schemas cho quản lý quyền/approval/audit; auth errors/data disclosure.
- Quyền với money/derived metrics, partial response hay toàn response bị chặn;
  PDF export và AI facts filtering cần specification riêng.
- Permission/audit schema migration: reserved empty JSON hiện tại chưa dùng được;
  không chốt dùng JSON thay bảng hay ngược lại trong lượt tài liệu này.

## Verification và giới hạn — HISTORICAL INFORMATION của lượt đầu

Chỉ đọc source/tests/ADRs và kiểm tra tài liệu/ZIP; không chạy pytest, DB, migrations,
HTTP flow hoặc auth acceptance. Schema tests có trên filesystem không chứng minh
permission runtime. ZIP có manifest/hashes, context nguồn và report verification.
C01/C02/FE gốc cùng toàn bộ WIP và ZIP cũ được kiểm tra hashes trước/sau.

<a id="auth-v1"></a>
## Contract v1 hiện hành — Auth/session, Store và quyền Staff

Ngày cập nhật 09/10/2026. Phần này supersede các OPEN kỹ thuật về login/session,
errors, current grants và routes A01/A03/A04/T01/T02 ở bản lịch sử phía trên.
Policy Owner/Staff, deny-by-default, sensitive data và không owner-key giữ nguyên.
**ĐÃ CHỐT:** onboarding có hỗ trợ; Owner quản lý quyền Staff thuộc phạm vi v1 theo
câu trả lời trực tiếp trong lượt hoàn thiện. **TECHNICAL CHOICE:** schemas/transport
dưới đây. **CURRENT FACT:** chưa có auth/business HTTP; membership permissions vẫn
bị constraint bắt rỗng. Không coi contract là migration/enforcement đã hoạt động.

Điểm vào [bàn giao v1](SHELFCASH_API_CONTRACT_V1_VI.md). Các phần độc lập:
[session](#auth-session), [onboarding](#auth-assisted), [routes](#auth-routes),
[quyền Staff](#auth-staff), [invitation](#auth-invitations), [acceptance/backlog](#auth-acceptance).

<a id="auth-session"></a>
### 1. Session, quyền hiện hành và transport

Routes tương đối `/api/v1`. JSON envelope theo contract Planning: data/meta/error,
meta.request_id, failures data=null/error={code,message,details}. UUID cho entities,
timestamp UTC Z; permissions và Version là chuỗi opaque. Unknown fields422.

TECHNICAL CHOICE: opaque random256-bit session cookie `__Host-shelfcash_session`,
Secure/HttpOnly/SameSite=Lax/Path=/, không Domain; server chỉ lưu digest token.
Không JWT/bearer/refresh token thứ hai. Session thường: idle30 phút, absolute8 giờ,
cookie session-only; remember_me: idle7 ngày, absolute30 ngày, cookie Max-Age30 ngày.
Response expires_at là min(idle_deadline,absolute_deadline); request hợp lệ gia hạn
idle không vượt absolute. Không lưu token vào localStorage; no-store mọi auth/read
nhạy cảm. Local development dùng HTTPS hoặc cookie dev riêng trên loopback có
config rõ; không disable Secure production từ request headers.

Mọi mutation browser, kể cả login/credential completion/logout, kiểm Origin bằng
allowlist FE exact scheme+host+port; thiếu/sai Origin403 CSRF_CHECK_FAILED. Sau login
dùng thêm `X-CSRF-Token` gắn session, lấy từ A01/A03, compare constant-time. Login/
credential completion chưa có session nên không yêu cầu token này. GET không đổi
business state. CORS credentials chỉ explicit origins, không wildcard; OPTIONS chỉ
preflight. X-CSRF-Token/If-Match/Idempotency-Key trong allowlisted request headers.
Rotate session+CSRF sau login; không nhận session ID do client chọn. 401 xóa cookie.

Từng request kiểm User.active + Store.active + membership.active + current grants.
Session không freeze grants. Owner có effective catalogue đầy đủ trong đúng Store;
Staff nhận đúng grants đã lưu, không implications ngầm. Resource khác Store hoặc
Store không accessible404 RESOURCE_NOT_FOUND; thiếu action trong Store accessible403
PERMISSION_DENIED. Thiếu session401 UNAUTHENTICATED. Deactivation/credential reset
revoke sessions account; thay grants/membership cập nhật authorization_version ngay.
Mutations/job canonical commit kiểm lại dưới authorization transaction fence cùng
write; revoke và commit serialize theo version/lock. Revoke trước fence thì chặn,
commit trước revoke không undo lịch sử; reads/retries sau revoke vẫn kiểm quyền mới.
Logout chỉ revoke session hiện tại; accepted job không bị xóa, vẫn recheck actor tại
commit. Không approve-once bypass cho v1 endpoints; details.approval_request_allowed=false.

<a id="auth-assisted"></a>
### 2. Assisted provisioning, delivery và reset — đủ onboarding tối thiểu

Không A02 self-registration. Trusted operator dùng **application command có kiểm
soát**, không SQL thủ công/seed demo: verify yêu cầu mở quán và identity chủ quán
qua kênh hỗ trợ; ghi request/evidence reference, operator ID, timestamp, Store và
Owner được xác nhận. Một transaction tạo User chưa có credential usable + Store +
OWNER membership + audit; existing account chỉ bind sau verify identity, không
reset password hoặc cấp Store khác từ email trùng. Client không truyền role=OWNER
để tự cấp. Operator là audit identity của tác vụ hỗ trợ, không role Store thứ ba.

Owner tự mời Staff và chọn grants theo mục6; trước khi chấp nhận chưa có membership
hoặc quyền. Account chưa có vẫn được thiết lập có hỗ trợ, operator chỉ tạo account/
credential, không tự bind membership thay acceptance. Initial Owner của Store được
xác minh có toàn quyền; invitation chỉ STAFF và quyền được Owner chọn. Owner
lifecycle/multiple-last-Owner review riêng, không hỗ trợ bypass proof/ownership.

Sau xác minh account, operator phát single-use credential setup/reset token256-bit,
digest stored, purpose SETUP|RESET, lifetime30 phút, bound user+credential revision.
Giao qua kênh riêng đã xác minh của chính account; không đưa token cho Owner của
Staff, không mật khẩu chung, không gửi qua logs/audit. Không password email/plaintext.
Reset chỉ theo yêu cầu và kiểm chứng account holder, không cho Owner đọc/đặt mật
khẩu Staff. Reissue invalidate token cũ; reset completion revoke mọi session account.
Delivery chưa thành công account vẫn chưa login được. Không public reset-request
endpoint v1; FE hiển thị hướng dẫn liên hệ hỗ trợ. Fragment token trên FE link
được đọc rồi xóa khỏi URL trước POST, Referrer-Policy:no-referrer.

**THÊM N7** `POST /auth/credentials/complete`: workflow nhận credential an toàn
không được A01 hoặc A02 đáp ứng; public one-use token boundary, Origin/rate-limit
vẫn bắt buộc. Request {token:string,password:string}; token opaque tối đa512 bytes;
password12..128 Unicode characters, tối đa1024 UTF-8 bytes, không trim/truncate,
không bắt composition tùy tiện; Argon2id hash, không plaintext. Response200
{next_action:"login",completed_at:Timestamp}; không session/Store grants. Invalid/
expired/consumed token đều400 CREDENTIAL_TOKEN_INVALID, không lộ account. Two
concurrent completions chỉ một thắng; transaction consume+hash+credential revision+
revocation+audit atomic. Token không phải Idempotency-Key: retry sau thành công báo
invalid rồi khách login với mật khẩu đã đặt; không thay password lần hai.

<a id="auth-routes"></a>
### 3. A01/A03/A04/T01/T02 — giữ đúng ID/method/route gốc

| ID | Contract request / kết quả |
| --- | --- |
| A01 POST /auth/login | {email:string,password:string,remember_me:boolean=false}; email1..320 trim outer whitespace, lowercase và validate; password không normalize. 200 AuthContext + cookie; không user_id/store_id/role trong request. |
| A03 GET /auth/me | Không body/query; 200 AuthContext từ session + current accessible membership summary; không dùng snapshot grants login làm authority. |
| A04 POST /auth/logout | Không body/query; Origin+CSRF nếu session tồn tại; revoke session hiện tại, clear cookie; 204 không envelope. Session đã hết/hết cookie:204 sau Origin check, không lỗi logout vô hạn. |
| T01 GET /stores | limit50/max100,cursor; active accessible Store của account; sort name,UUID; no arbitrary Store filter. 200 {items:StoreSummary[]}; pagination theo FE, total_count exact hoặc null. |
| T02 GET /stores/{store_id} | 200 StoreContext; chỉ membership active; không yêu cầu quyền xem cost để chọn Store; không budget/cost/settings nhạy cảm. |
| A02 POST /auth/register | DEFERRED đã chốt assisted onboarding; không registered route v1, không auto-owner. |

AuthContext={user:{user_id,email,display_name},session:{expires_at,absolute_expires_at,
csrf_token},default_store_id:UUID|null,accessible_store_count:int,
authorization_version:Version}. Default duy nhất accessible thì Store đó; nhiều
Store thì null để chọn; không ghi ngầm “Store vừa xem”. Không Store thì login vẫn
200, count0/defaultnull, FE trạng thái chờ hỗ trợ thay vì redirect Today/403 vòng lặp.
T01 StoreSummary={store_id,name,timezone,currency,role:OWNER|STAFF,membership_id,
authorization_version}. T02 thêm active:true,server_now:Timestamp,as_of_date:date,
membership:{membership_id,role,authorization_version,effective_permissions:string[]},
permission_catalog_version:Version. Chọn Store là local FE context rồi T02, không
đổi global session Store; hai tab Store khác nhau không xung đột.

Ví dụ A01 request:

```json
{"email":"owner@example.com","password":"example-long-password","remember_me":false}
```

Ví dụ T02 response (UUID chỉ minh họa; permissions Owner thực tế là đầy đủ catalogue):

```json
{"data":{"store_id":"00000000-0000-0000-0000-000000000001","name":"Quán A","timezone":"Asia/Ho_Chi_Minh","currency":"VND","role":"STAFF","membership_id":"00000000-0000-0000-0000-000000000002","authorization_version":"auth-7","active":true,"server_now":"2026-10-09T02:00:00Z","as_of_date":"2026-10-09","membership":{"membership_id":"00000000-0000-0000-0000-000000000002","role":"STAFF","authorization_version":"auth-7","effective_permissions":["menu.read"]},"permission_catalog_version":"permissions-v2"},"meta":{"request_id":"req-context"},"error":null}
```

Error mapping:401 INVALID_CREDENTIALS chung cho email không tồn tại/password sai/
inactive/unset credential; login throttle5 thất bại/account+IP/15 phút và IP limiter,
429 RATE_LIMITED+Retry-After, không permanent lock account. 422 INVALID_EMAIL/
PASSWORD_POLICY_VIOLATION/INVALID_FILTER/INVALID_CURSOR/VALIDATION_ERROR;
403 CSRF_CHECK_FAILED/PERMISSION_DENIED;503 SERVICE_UNAVAILABLE. Không debug hash/token.

<a id="auth-staff"></a>
### 4. Màn hình Owner quản lý quyền Staff — v1 giữ lại

Ba routes mới cho đúng workflow: chọn Staff → tick tác vụ → lưu CAS → xem audit.
Mời Staff qua mục6; ba routes này không mời/xóa hoặc chuyển Owner, không endpoint theo từng nhóm DB.

**N12 GET /stores/{store_id}/memberships**: Owner-only; query role=STAFF (default,
v1 chỉ nhận STAFF),active=all|true|false defaultall,limit/cursor; order display_name,
membershipUUID. Response {items:StaffMembership[],permission_catalog_version,
permission_catalog:PermissionDescriptor[]}. StaffMembership={membership_id,user:
{user_id,display_name,email},role:"STAFF",active:boolean,grants:string[],version:Version,
updated_at:Timestamp}; User fields chỉ Store Staff không toàn account memberships.
Descriptor={key,group,label_vi,description_vi,grantable_to_staff:boolean,
required_with:string[],exposure:"ordinary"|"cost"|"budget"}. Catalogue chỉ actions
đã có contract v1, không checkbox giả cho features chưa review. Active toggle chỉ
read ở đây; quản lý membership lifecycle không bị lẫn vào PUT grants.

Catalogue `permissions-v2`, technical action mapping, không quyền runtime có thật:

| Nhóm | có thể cấp cho Staff action keys |
| --- | --- |
| Catalog/Menu | ingredient.read,ingredient.create,menu.read,product.create,recipe.read,recipe.create_version,recipe.manage_effectivity |
| Kho | inventory.read,inventory.receive,inventory.count.correct; procurement.cost.read riêng |
| Sales | sales.read,sales.record,sales.correct,sales.merge |
| Supplier | supplier.read,supplier.create,supplier.terms.create,supplier.terms.correct,supplier.fees.manage |
| Import | import.create,import.upload,import.read,import.analyze,import.preview,import.commit,mapping.read,mapping.propose |
| Planning | planning.context.read,planning.run,planning.result.read,planning.requirements.read,planning.requirements.create,planning.requirements.manage,planning.export |
| Budget | budget.read,budget.update |

Grants độc lập: menu.read bao gồm retail price đã chốt; không auto ingredient.read/
recipe.read. Các composite endpoints đòi đủ keys theo contract cụm. `required_with`
chỉ UI hướng dẫn prerequisite, không auto-add hoặc reject granting single action;
Owner có thể cấp đúng tập mình muốn, FE nêu tác vụ chưa dùng được do thiếu keys.
Owner-only: mapping decisions/activate/retire, inventory threshold management,
membership list/grants/audit. Không đưa vào có thể cấp cho Staff catalogue. Nguyên liệu/
sản phẩm update/delete/lifecycle writers chưa contract thì không cấp key giả.

**N13 PUT /stores/{store_id}/memberships/{membership_id}/permissions**:
Owner-only, Idempotency-Key + If-Match Staff.version required. Body
{grants:string[],reason:string}; grants unique sorted canonical known catalogue,
max catalogue length; reason1..1000 nonblank. Full replace, [] thu toàn grants.
Không active/role/user_id/ownership fields; target chỉ Staff cùng Store, inactive
Staff409 MEMBERSHIP_INACTIVE (không silently activate); Owner target422 INVALID_TARGET.
Response200 {membership:StaffMembership,event_id:UUID,changed:boolean}; ETag version
mới. No-op cùng grants giữ version và changed = false, ghi request receipt nhưng không
fake change event (event_id:null trong no-op; type UUID|null). Current grant reload
ngay request kế; current jobs fence như mục1. PUT không revoke membership hoặc
session toàn account vì có thể account dùng Store khác.

```json
{"grants":["inventory.read","menu.read"],"reason":"Cho nhân viên ca sáng xem Menu và Kho"}
```

**N14 GET /stores/{store_id}/permission-events** Owner-only; optionalmembership_id,
limit/cursor; sort -occurred_at,UUID. {items:PermissionEvent[]} theo pagination.
Event={event_id,store_id,target_membership_id,actor_user_id,occurred_at,reason,
before_grants,after_grants,before_version,after_version,request_id}; append-only,
không password/token hoặc memberships Store khác. Events provision/grants ban đầu
có source:"ASSISTED_PROVISIONING", operator_reference thay actor_user_id khi operator
không account; actor_user_id nullable, source:"OWNER_CHANGE" cho PUT;
source:"INVITATION_ACCEPTANCE" khi Staff accept, actor là Staff và issuer_user_id
riêng như mục6. Retain tối
thiểu suốt Store activity v1, không endpoint purge; policy retention dài hạn OPEN
ngoài workflow này. Cursor signed bound Store/actor/filter/version quyền.

428 PRECONDITION_REQUIRED;412 PERMISSION_REVISION_CONFLICT;409
IDEMPOTENCY_KEY_REUSED/MEMBERSHIP_INACTIVE;422 UNKNOWN_PERMISSION/INVALID_TARGET/
VALIDATION_ERROR. Key same request trả receipt sau current Owner recheck; different
body409; audit+version+grants+receipt cùng transaction. Không cấp permissions thông
qua payload A01/T02, không one-time bypass hoặc Staff tự sửa grants.

<a id="auth-acceptance"></a>
### 5. Acceptance specifications và implementation backlog

Chưa chạy tests: (1) assisted provision atomic Owner đúng Store, token chưa complete
không login; (2) setup/reset token single-use, race một thành công, reset revoke
sessions; (3) unknown email/sai password cùng401, throttle429, password không trim;
(4) cookie/CSRF/CORS origin và rotation đúng, không token logs; (5) no Store login
200/count0, nhiều Store default = null; (6) Store khác404, Staff action thiếu403, Owner
không vượt Store; (7) current revoke chặn GET/retry và commit fence, không undo
committed result; (8) Owner tick grants explicit, stale412, Staff quản quyền403,
retry không duplicate event; (9) giá retail với menu.read, cost/budget riêng;
(10) support không giả ownership từ email, không reset Staff thay account holder.

IMPLEMENTATION BACKLOG: credential/session/provision commands+delivery integration,
permission catalogue/UI descriptors/membership schema migration, synchronous auth
fences/audit/receipts, public routes/OpenAPI/security acceptance. Existing JSON
permissions reserved empty phải migration được giao riêng, không ghi lén.
OPEN ngoài core đã review: Owner lifecycle, one-time allowlist/TTL, dài hạn
audit retention. Source/accepted ADR và WIP status không sửa trong task contract.


<a id="auth-invitations"></a>
### 6. Invitation Staff theo Store — ĐÃ CHỐT, 09/10/2026

Policy user trực tiếp: Owner tự mời, Staff chấp nhận; Owner chọn quyền khi mời,
quyền riêng từng Store và chỉ có sau acceptance hợp lệ. Không mời thành Owner.
Phần này thay PROPOSAL grants=[]/pending của lượt trước: **grants đã chọn được
lưu ở invitation, không phải quyền hiện hành; khi accept mới được áp đúng tập đó**.
Current fact: models User/StoreMembership chỉ persistence, permissions còn reserved
empty; chưa invitations/email verification/delivery/HTTP/actor enforcement. Thiết
kế dưới đây là TECHNICAL CHOICE, không migration hoặc ADR accepted mới.

#### 6.1. Luồng và identity

Owner mở quản lý Staff → nhập email, tick quyền → gửi → server tạo invitation và
ý định delivery → người nhận đăng nhập đúng account đã xác minh → xem Store và
tập quyền offered → chấp nhận → server atomically tạo STAFF membership/grants →
FE refresh A03/T01/T02. Account chưa có: assisted account+credential completion N7
trước, không self-registration hoặc account mới tự có Store. Owner không đăng
nhập/accept thay Staff. Không suy quyền từ việc đã gửi mail, possession token,
checkbox FE hoặc Owner approval mapping. Staff thuộc Store khác không bị đổi quyền.

invitation_id UUID; invitation_version opaque đổi mỗi lần reissue/revoke/accept;
store_id immutable; target_email canonical như A01; role cố định STAFF;
permission_catalog_version pin catalogue review; offered_grants unique sorted,
chỉ Staff-grantable keys. Không role/user_id/membership_id do client đặt. Catalogue
permissions-v2 thêm recipe.manage_effectivity theo contract Catalog12; versions
trước giữ history, không suy invitation dùng latest keys khi accept.

States pending→accepted|revoked|expired. expired là server_now≥expires_at, không
GET tự ghi state. Delivery queued|delivered|failed tách khỏi membership/state;
SMTP accepted không chứng minh người nhận đã đọc. accepted terminal; revoke/reissue
không sửa membership đã tạo (dùng N13 cho đổi grants). Một pending invitation mỗi
Store/email; create mới trùng pending409 INVITATION_ALREADY_PENDING, không cộng
hoặc đổi offered grants ngầm. Membership đã có, kể cả inactive hoặc OWNER,409
MEMBERSHIP_ALREADY_EXISTS; invitation không reactivate membership hoặc hạ Owner
thành Staff. Reactivation/lifecycle là responsibility review riêng.

#### 6.2. Token, expiry, delivery và acceptance fence

Token random256-bit CSPRNG, base64url opaque; server lưu SHA-256 digest + revision/
email/Store/purpose STAFF_INVITATION, lifetime7×24 giờ từ issued_at. Không session
hoặc credential token; purpose khác không dùng thay. Không trả raw token cho Owner,
không logs/audit/URL query/localStorage. FE link chứa invitation_id và token trong
fragment; đọc vào memory rồi xóa fragment, Referrer-Policy:no-referrer. Email gửi
đúng target_email; raw secret chỉ dùng ở delivery channel/intent mã hóa có hạn,
không giữ bản rõ trong database. Sau delivery bỏ secret material, vẫn giữ digest.
Không API tải token hoặc gửi link sang email khác.

Owner reissue chọn lại grants, version/token/expiry mới, invalid token cũ kể cả
mail đã đến. Pending offer bị đổi bắt buộc người nhận xem lại; GET nhận ETag version,
POSTaccept dùng If-Match đó. Reissue/revoke/accept serialize trên invitation lock/
version; token cũ hoặc changed offer không activate. Owner issuer vẫn phải active
OWNER đúng Store tại acceptance, Store/User active, target account email verified
và đúng email; issuer mất authority thì409 INVITATION_AUTHORITY_CHANGED, cần Owner
hiện hành reissue trước khi accept. Reissue chuyển issuer sang Owner executor và
có audit; không tự chuyển authority theo latest Owner.

Email verification là bằng chứng kiểm soát account email trong assisted onboarding,
không chỉ có chuỗi email ở User hay N7 completion vô điều kiện. Credential setup
được giao tới account holder đã xác minh; ghi identity verification reference và
verified_at/version. User model hiện chưa lưu proof này: implementation backlog,
không coi field email/active/password_hash là đã verified. Unknown proof không
accept. Không trả account_exists/Stores khác trong Owner create/delivery result.

#### 6.3. Routes mới cho workflow thật, không CRUD account

| Nhãn / method / route | Request và response |
| --- | --- |
| N15 POST /stores/{store_id}/staff-invitations | Owner-only, Idempotency-Key; body {email,grants:string[],permission_catalog_version:Version,reason:string}. 201 {invitation:Invitation,delivery:DeliveryReceipt}; không token/account_exists. |
| N16 GET /stores/{store_id}/staff-invitations | Owner-only; view=invitations default, status pending/accepted/revoked/expired comma-separated, email?,limit50/max100,cursor,sort=-issued_at. 200 {items:Invitation[]}; metadata pagination. view=events cần invitation_id, chỉ limit/cursor, trả {items:InvitationEvent[]}, sort -occurred_at/UUID. |
| N17 POST /stores/{store_id}/staff-invitations/{invitation_id}/actions | Owner-only, If-Match+Idempotency-Key; union {action:"reissue",grants:string[],permission_catalog_version,reason} hoặc {action:"revoke",reason}. 200 {invitation,delivery:DeliveryReceipt|null,event_id}; reissue pending/expired/revoked được, accepted409. Revoke pending, revoked replay/no-op không duplicate event; expired409. |
| N18 GET /staff-invitations/{invitation_id} | Authenticated active verified target account, không đòi membership chưa tồn tại; header X-Invitation-Token required. 200 {invitation:InvitationOffer,can_accept:boolean,reason_codes:string[]}, ETag invitation_version. Không body/query, không delivery/audit/Staff list. |
| N19 POST /staff-invitations/{invitation_id}/accept | Active verified target account; Origin+CSRF+If-Match+Idempotency-Key, body {token:string,accept:true}. 201 AcceptanceReceipt; không grants/Store/role từ payload. |

Owner reason1..1000 nonblank; email1..320 canonical/validated; grants=[] hợp lệ
nếu Owner chọn không quyền tính năng (Staff sau accept vẫn thấy Store context).
Unknown/nondelegable keys422 UNKNOWN_PERMISSION/NON_DELEGABLE_PERMISSION;
wrong catalogue409 PERMISSION_CATALOG_CHANGED. Composite permission prerequisites
vẫn chỉ hướng dẫn, không tự add: nếu Owner chọn action mà thiếu read/cost dependency
thì FE cho biết action chưa dùng được, server giữ đúng offered set.

N16 cursor ký, bind Store/actor/filter/view và snapshot revision; thay dữ liệu
giữa các page trả409 LIST_VERSION_CHANGED, không trộn hai danh sách. Metadata
{request_id,pagination:{limit,next_cursor:string|null,total_count:integer|null}};
count chỉ trả khi cùng snapshot. N17 event_id:UUID|null, null cho no-op revoke.

DeliveryReceipt={status:"queued"|"delivered"|"failed",attempt_id:UUID}; status là
kết quả delivery, không trạng thái membership và không proof email đã verified.
Invitation={invitation_id,store_id,target_email,role:"STAFF",offered_grants:string[],
permission_catalog_version,version,status,issuer_user_id,created_at,issued_at,
expires_at,accepted_at:Timestamp|null,revoked_at:Timestamp|null,reason,
delivery_status:queued|delivered|failed}.
InvitationOffer={invitation_id,store:{store_id,name},target_email,role:"STAFF",
offered_grants,permission_catalog_version,permission_descriptors:PermissionDescriptor[],
version,status,issued_at,expires_at}. Chỉ đúng email/token được xem; Store name lúc
review là current label, permission descriptions từ pinned catalogue. Actor login
khác email403 INVITATION_ACCOUNT_MISMATCH, không lộ Store/grants/target email;
proof unknown403 ACCOUNT_EMAIL_NOT_VERIFIED. Invalid token/UUIDnotfound404 chung
INVITATION_NOT_FOUND. Token max512 bytes; header được allowlist CORS, redactlogs.

AcceptanceReceipt={invitation_id,invitation_version_at_acceptance,store_id,
membership_id,role:"STAFF",accepted_grants:string[],authorization_version_at_acceptance,
accepted_at,event_id,next_action:"refresh_store_context"}. Đây là retained receipt,
không current grants: T02 luôn đọc current. GET accepted invitation chỉ trả offer
read-only cho đúng token/account và current active membership; can_accept=false.
GET pending expired/revoked token hợp lệ trả status/can_acceptfalse; không access
Store business facts. Same acceptance key/payload trả receipt200 sau kiểm current
User/Store/membership; membership revoked thì403, không resurrect grants. Key khác
khi token consumed409 INVITATION_ALREADY_ACCEPTED, không cấp lại quyền.

```json
{"email":"linh@example.com","grants":["ingredient.read","inventory.read","menu.read"],"permission_catalog_version":"permissions-v2","reason":"Mời nhân viên ca sáng xem Menu và Kho"}
```

```json
{"token":"SYNTHETIC-INVITATION-TOKEN","accept":true}
```

```json
{"data":{"invitation_id":"00000000-0000-0000-0000-000000000015","invitation_version_at_acceptance":"invite-1","store_id":"00000000-0000-0000-0000-000000000001","membership_id":"00000000-0000-0000-0000-000000000016","role":"STAFF","accepted_grants":["ingredient.read","inventory.read","menu.read"],"authorization_version_at_acceptance":"auth-8","accepted_at":"2026-10-09T03:00:00Z","event_id":"00000000-0000-0000-0000-000000000017","next_action":"refresh_store_context"},"meta":{"request_id":"req-invite-accept"},"error":null}
```

#### 6.4. Atomicity, retry, audit và errors

Accept transaction: lockinvitation/Store+issuer authorization/target membership
absence + email proof version → check current validity/grantability/token/expiry/
If-Match → create STAFF membership+exact offered grants → consume invitation/token,
increment authorization_version → permission audit+acceptance receipt → commit.
Unique(Store,User) conflict không merge grants;409 MEMBERSHIP_ALREADY_EXISTS.
Before commit authorization fence serialize với revoke/issuer deactivation/Store
state. Any failure rollback tất cả; concurrent accept/revoke một transition thắng,
không ghost membership hoặc tokenconsumed mà không có membership.

Key scope actor+Store+method+route+action, digest body/CAS; accept Store resolve từ
invitation, không payload. Look up receipt sau authorization trước staleCAS; key
khácpayload409 IDEMPOTENCY_KEY_REUSED. Create/reissue invitation+delivery intent+
audit+receipt atomic localDB; email ngoài DB không một transaction. Dispatcher gửi
idempotent intent/attempt, lỗi delivery không grant, không fake delivered; retry
không tạo invitation/membership khác. Duplicate mail có thể xảy ra khi provider
outcome uncertain, cùng một active revision vẫn chỉ accept một lần. Owner dùng
reissue sau failed delivery để lấy token mới, không endpoint resend trả token.

InvitationEvent={event_id,invitation_id,store_id,actor_user_id:UUID|null,occurred_at,
kind:CREATED|REISSUED|REVOKED|ACCEPTED|DELIVERY_FAILED|DELIVERY_SUCCEEDED,
reason:string|null,before_version:Version|null,after_version:Version,
before_offered_grants:string[]|null,after_offered_grants:string[],
recipient_user_id:UUID|null}. Event delivery do dispatcher có actor_user_id=null
và delivery attempt reference, không giả Owner executor. offered grants audit khác
permission changes.
Acceptance tạo PermissionEvent source=INVITATION_ACCEPTANCE, before_grants=[],
after_grants=offered, actor_user_id=Staff acceptor, issuer_user_id riêng, không đổi
executor thành Owner. N14 enum source mở rộng trường hợp này; source OWNER_CHANGE/
ASSISTED_PROVISIONING lịch sử giữ nguyên. Token/password/proof bí mật không audit.
Store Owner đọc full invitation events qua N16, không toàn account/Store khác.

Errors chung AUTH +428 missingIf-Match,412 INVITATION_REVISION_CONFLICT,
409 INVITATION_ALREADY_PENDING/INVITATION_ALREADY_ACCEPTED/
INVITATION_AUTHORITY_CHANGED/MEMBERSHIP_ALREADY_EXISTS/PERMISSION_CATALOG_CHANGED/
IDEMPOTENCY_KEY_REUSED/INVITATION_STATE_CONFLICT;410 INVITATION_EXPIRED/
INVITATION_REVOKED cho token hợp lệ/đúng account;422 INVALID_EMAIL/INVALID_TOKEN/
UNKNOWN_PERMISSION/NON_DELEGABLE_PERMISSION;429 RATE_LIMITED. Resolve/accept
rate-limit account+IP, invitations mutation10 lần/Store/10 phút,429 Retry-After;
không secret hoặc lỗi provider thô. No one-time approval bypass Owner-only actions.

#### 6.5. Acceptance specifications và FE

Chưa chạy: invite không tạo grants/membership; Owner chọn keys chính xác; accept
chỉ đúng verified account, không OWNER; cùng account ở hai Store grants riêng;
unknown account không bị Owner API lộ existence; setup/reset token không accept;
expiry/revoked/changedoffer block; reissue rights mới phải rereview; originalissuer
mất quyền thì block; existingmembership không merge/reactivate; accept race một
membership/event, retry samekey không tăng quyền; revoke trước fence block, revoke
sau accept không thu hồi membership ngầm; later grantschange/revoke không replay
old offered rights; deliveryfail/duplicateemail không grant; audit đúng issuer/
acceptor, no secret. FE thêm formmời/tickquyền, pendinglist/events/reissue/revoke,
link invitation→login/setup→reviewStore+grants→accept→refreshStorecontext.

IMPLEMENTATION BACKLOG: invitation/delivery intent/tokenhash/version/receipt/audit
storage, verifiedemailproof, app commands+delivery adapter/local dispatcher,
authorization fences/publicroutes/OpenAPI/security/persistence acceptance. Không
code/tests/migrations/DB/ZIP trong task; không broker/enterprise IAM. Owner lifecycle,
one-time approval và reactivation membership vẫn review riêng, không invitation
bypass. Không còn câu hỏi nghiệp vụ chặn invitation scope đã chốt.
