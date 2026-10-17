# What-if REPLAN — handoff FE

**CURRENT FACT: SOURCE_READY / NOT_DEPLOYED.** Implementation pin:
`d555035bdb52929eea4ce7b60b5d1447ce748078`.
Đây là hướng dẫn tích hợp riêng What-if, không phải phát hành toàn hệ thống.
Source toàn BE: **78 operations / 71 paths**; không migration mới.
Không suy runtime8103 đã chạy source này. Chưa có browser/FE/deployment acceptance.

Semantics do [Planning §19](https://github.com/trankhanhnamhoccode/MLAI_backend/blob/d555035bdb52929eea4ce7b60b5d1447ce748078/docs/PROCUREMENT_API_CONTRACT_VI.md#what-if-replan)
sở hữu; [Authorization](https://github.com/trankhanhnamhoccode/MLAI_backend/blob/d555035bdb52929eea4ce7b60b5d1447ce748078/docs/AUTHORIZATION_CONTRACT_VI.md)
sở hữu quyền/session. Không thay các contract đó bằng tài liệu này.
Các URL Git pin commit local; chỉ truy cập được từ remote sau một lần push riêng
được cho phép. Trong checkout, đọc `docs/PROCUREMENT_API_CONTRACT_VI.md#what-if-replan`.

Artifacts đi kèm: [OpenAPI subset](what_if/openapi_subset.json),
[examples](what_if/examples.json), [API diff](what_if/api_diff.json),
[checklist FE](what_if/FE_ACCEPTANCE_CHECKLIST.md),
[provenance](what_if/PROVENANCE.json), [manifest](what_if/manifest.sha256).
**Subset chỉ chứa S01/S02 và toàn bộ schema references cần thiết**, không phải
OpenAPI toàn BE. C03 được nhắc đến theo behavior source, không nằm trong subset.

## 1. Flow và ba preset

Mở một PlanningRun gốc đã lưu → chọn giả định → bấm **“Tính lại theo giả định”**
→ lưu intent trước dispatch → S01 → giữ `data.run_id` → poll S02 theo `Location`
→ hiển thị so sánh. `scenario_id = scenario_run_id = data.run_id` của S01.
Không lấy baseline Run ID làm scenario ID.

Ba body gửi đầy đủ:

```json
{"demand_multiplier":"1.2","supplier_delay_days":0}
```

```json
{"demand_multiplier":"1","supplier_delay_days":2}
```

```json
{"demand_multiplier":"1.2","supplier_delay_days":2}
```

| Field | Wire type và bounds thực tế |
| --- | --- |
| `demand_multiplier` | Decimal **text**, từ `"0.1"` đến `"5"`, tối đa 6 chữ số sau dấu chấm, tối đa 8 ký tự. Dấu chấm thập phân; không exponent, dấu `+`, khoảng trắng hoặc số 0 đầu thừa. `"1.20"` hợp lệ và chuẩn hóa thành `"1.2"`. |
| `supplier_delay_days` | Integer từ 0 đến 30; không nhận boolean, float hoặc text `"2"`. |

Defaults khi bỏ field là factor `"1"`, delay `0`; `{}` hợp lệ và là identity REPLAN.
`null` không tương đương bỏ field. Unknown fields bị từ chối, không silently ignore.
Không gửi raw capture, budget, strategy, supplier ID hoặc input facts từ FE.

## 2. S01 — tạo scenario

`POST /api/v1/procurement-plans/{plan_id}/what-if`, `plan_id` là UUID Run gốc.

Gửi `Content-Type: application/json`, `Origin` thuộc allowlist BE,
`X-CSRF-Token` của session hiện tại, và `Idempotency-Key` UUID canonical lowercase
36 ký tự. Browser dùng `credentials: "include"`; không đọc/ghi cookie HttpOnly.
Cookie theo môi trường: `__Host-shelfcash_session` trên HTTPS hoặc
`shelfcash_dev_session` trong cấu hình dev được phép. Không hardcode credential.
Không gửi query parameters, `If-Match` hoặc `If-None-Match`.

Create/replay cần đủ quyền hiện tại:
`planning.run`, `planning.result.read`, `budget.read`, `procurement.cost.read`.
Không tự cấp thêm quyền Staff. Baseline phải public, completed, có retained result
và capture `/2` đủ source/prepared/forecast; completed đơn thuần chưa đủ điều kiện.

Response success là `{data:{run_id,status,accepted_at},meta:{warnings,poll_after_ms},error:null}`.
**202** khi `queued`/`running`; **200** khi replay trả Run terminal
`completed`/`failed`. Cả hai có `Location: /api/v1/what-if/{run_id}`;
active có `Retry-After: 2`, `meta.poll_after_ms: 2000`; terminal có
`meta.poll_after_ms: 0`, không có `Retry-After` do S01 đặt.
`Cache-Control: no-store`, `X-Request-ID` do middleware đặt.
202 chỉ xác nhận đã nhận intent, không chứng minh đã tính hoặc có winner.

Examples `create_queued`, `create_running_replay`, `create_terminal_replay` trong
JSON được capture từ router với DTO/service fixture SYNTHETIC, không phải HTTP
acceptance trên runtime8103. Headers trong examples là headers thực của harness;
CSRF placeholder trong request phải thay bằng session hiện tại.

## 3. S02 — poll và đọc lại

`GET /api/v1/what-if/{scenario_id}`; không body/query. Cần session và đủ
`planning.result.read`, `budget.read`, `procurement.cost.read` hiện tại trên cùng
Store của scenario và baseline. Create rights không thay read rights.
GET không cần Origin/CSRF mutation guard, không chạy lại forecast/solve.

Read thành công trả **200**, kể cả Run `queued`, `running`, `failed` hoặc completed
không winner. Envelope `data` là `WhatIfView`; `meta.warnings` là `[]`,
`meta.poll_after_ms` là 2000 khi active và 0 khi terminal. S02 không đặt
`Retry-After`. Có `ETag: "<data.scenario.response_version>"`,
`Cache-Control: no-store`, `X-Request-ID`. ETag là opaque version của child,
không phải baseline/result digest. Không có conditional 304 contract; gửi
`If-None-Match` không thay thế polling/readback.

| Path trong `data` | FE sử dụng |
| --- | --- |
| `scenario_id`, `scenario_run_id` | Cùng UUID; giữ để reload/readback. |
| `pin` | `authority=HYPOTHETICAL`, `mode=REPLAN`, `transform_version=what_if/1`, baseline ID/input/result digests, mutation đã normalize, delay scope và fingerprint. |
| `baseline`, `scenario` | Hai `RunView` riêng: status/outcome, configuration/budget, scope/exclusions, execution, result/errors. Không ghép options của hai bên thành một Run. |
| `scenario.authority`, `scenario.baseline_run_id` | `HYPOTHETICAL` và link Run gốc. C03 `GET /api/v1/procurement-plans/{child_id}` cũng trả hai field này. |
| `*.result.winner_option_id` | Nullable; chỉ chọn option cùng phía có ID này để hiển thị winner basket. |
| `*.result.options[]` | Costs, purchase lines, Product service, requirements assessment, Ingredient balances, issues. Có thể có reference/ineligible option mà không có winner. |
| `*.result.strategies[]`, `*.execution` | Execution, termination, search_complete, proof/proof_scope, eligibility/gaps; đọc đúng trạng thái thực. |
| `deltas[]` | `metric`, `entity_id`, snapshot `label` nullable, `unit`, `path`, `baseline`, `scenario`, signed `delta`, `unavailable_reason`. |
| `explanation`, `limitations` | Wording deterministic từ số đã tính; không phải LLM hoặc lựa chọn thay khách. |

Mọi quantity là phân số exact `{numerator,denominator,decimal_view}` dạng text;
`delta.numerator` có thể âm. Không ép tiền/số lượng sang binary float để tính lại
chân lý nghiệp vụ. Dùng `decimal_view` để hiển thị, giữ numerator/denominator
khi cần xử lý chính xác. Không suy LOW/BASE/HIGH là xác suất.

## 4. UI so sánh

Hiển thị ba lựa chọn và nút **“Tính lại theo giả định”**; tránh double-click tạo hai
intent. Giữ nhãn **“Giả định”**, link Run gốc và mutation/scope đang xem trên mọi
trang chi tiết. Bảng **Gốc / Giả định / Chênh lệch** chỉ so các metric cùng nghĩa,
scope, unit, currency và Product/path.

| Nội dung | Metric/source |
| --- | --- |
| Tiền mua, phí phải trả, phí giao hàng nếu biết, tổng chi | `purchase`, `payable_fees`, `delivery_fees`, `total`; currency từ budget/costs. Phí giao hàng có thể unknown dù tổng phí đã biết. |
| Ngân sách | `baseline/scenario.configuration.budget`; không gọi current Store budget để thay giá trị retained. |
| Lượng mua | `purchase_quantity` theo Ingredient + unit; chi tiết supplier/pack/arrival/expiry trong winner `purchases[]`. |
| Nhu cầu, phục vụ, thiếu bán | `requested`, `fulfilled`, `lost_sales` theo Product/unit/LOW,BASE,HIGH. |
| Tỷ lệ phục vụ, thiếu so yêu cầu | `service_ratio` dùng unit `ratio`; `requirement_shortfall` theo Product/path đã cấu hình. Khác `lost_sales`. |
| Hết hạn, tồn cuối còn dùng | `expired`, `ending_usable` theo Ingredient/unit/path; không cộng các path với nhau. |

**Delta = scenario − baseline**. Dấu dương không luôn tốt hoặc luôn xấu: thêm tiền
mua khác thêm service, thêm tồn cuối khác giảm expiry. Dùng tên snapshot; label
thiếu thì hiện tên chưa có và reference để phân biệt, không thay bằng catalog hiện tại.
Không cộng cup với g/ml hoặc các currency/unit không tương thích.

Null/unknown phải hiện **“Chưa có số liệu”**, kèm reason khi có; không hiện `0`.
Ví dụ `SCENARIO_WINNER_UNAVAILABLE`, `BASELINE_WINNER_UNAVAILABLE`,
`METRIC_UNKNOWN_OR_SCOPE_MISMATCH`. Một winner không mua gì là known zero;
một phía không có winner là thiếu đối tượng so sánh, không phải giỏ miễn phí.
Hai winner baskets có thể khác nhau. Vẫn cho xem reference options, blockers,
warnings và excluded scope nhưng không tự dùng reference làm winner.

| Trạng thái | UI / quyết định polling |
| --- | --- |
| `queued` / `running` | Đã nhận / đang xử lý; poll theo meta. `result=null` không phải no winner terminal. Worker default-OFF có thể khiến Run ở queued; FE không bật flags hoặc tự kết luận timeout. |
| `failed`, outcome `execution_error` | Lỗi kỹ thuật, xem `errors[]`; có thể thiếu hoặc có partial result. Không trình bày partial winner là kết quả thành công đầy đủ. |
| `completed`, `recommendation_available` | Hiện winner đã lưu cùng proof/limitations; không giả global optimum. |
| `completed`, `no_eligible_candidate` | Không có candidate đủ điều kiện trong lần tìm kiếm này; khác technical failure. |
| `computation_blocked` / `no_computable_products` | Hiện lỗi dữ liệu/scope/bounds; không gọi là thiếu tiền nếu source không nói thế. |
| `search_complete=false` hoặc strategy `INCOMPLETE` | Search incomplete; có thể cùng tồn tại với winner hoặc no winner. Xem termination/proof và scope thực đã đánh giá. |

Không suy **globally infeasible** từ không có winner, timeout, search incomplete
hoặc finite-domain proof. Backend không thay deadline/objective để ép có winner.

## 5. Errors, idempotency và recovery

| HTTP / code đại diện | FE xử lý |
| --- | --- |
| 400 `INVALID_REQUEST` | Key thiếu/sai, JSON không hợp lệ hoặc precondition header không được phép; sửa request. |
| 401 `UNAUTHENTICATED` | Khôi phục session; không tái sử dụng intent dưới actor khác. |
| 403 `CSRF_CHECK_FAILED` / `PERMISSION_DENIED` | Kiểm Origin/CSRF/current grants. Không dùng cached response để vượt quyền. |
| 404 `RESOURCE_NOT_FOUND` | Không có resource hoặc không được thấy Store; không chứng minh intent chưa từng được nhận. |
| 409 `WHAT_IF_BASELINE_UNSUPPORTED` | Đọc `details.field_errors[]`: `BASELINE_NOT_COMPLETED`, `RETAINED_CAPTURE_UNAVAILABLE`, `RETAINED_FORECAST_UNAVAILABLE`, `RETAINED_INBOUND_UNSUPPORTED`, `CHALLENGER_BASELINE_UNSUPPORTED`, `SCENARIO_CHAIN_UNSUPPORTED` theo guard source. Guard trước có thể quyết định reason đầu tiên. |
| 409 `IDEMPOTENCY_KEY_REUSED` | Cùng key nhưng fingerprint/request khác; không sửa body của intent cũ rồi retry. |
| 422 `INVALID_PLANNING_CONFIGURATION` | S01 body sai: `UNKNOWN_FIELD` cho field lạ; `INVALID_FIELD` cho factor/delay sai type/bounds. Xem field_errors. |
| 422 `INVALID_RESOURCE_ID` / `INVALID_FILTER` / `VALIDATION_ERROR` | S01 path UUID sai dùng INVALID_RESOURCE_ID; S02 path sai hiện dùng generic VALIDATION_ERROR. Query/body GET không được phép bị từ chối. |
| 413 `REQUEST_TOO_LARGE` | Streaming guard S01 >64 KiB; không được khai báo riêng trong OpenAPI hiện tại. |
| 503 `RESULT_INTEGRITY_UNAVAILABLE` / `UNSUPPORTED_RESULT_VERSION` / `SERVICE_UNAVAILABLE` | Không có readback đáng tin cậy hoặc dịch vụ lỗi; giữ unknown outcome và intent. |

**CURRENT FACT — OpenAPI/runtime drift:** responses lỗi S02 đang khai báo
`ConfigurationErrorEnvelope` (`meta={}`), nhưng lỗi `AuthError` của route này
được middleware serialize thành `ErrorEnvelope` với `meta.request_id` và
`error.details.approval_request_allowed=false`. S01 auth lỗi dùng `meta={}` vì
thuộc planning_surface. JSON examples lấy từ handlers/router; subset giữ nguyên
operation source và có `x-runtime-error-schema` để mô tả S02 drift. Không đổi
contract lỗi ngầm để làm handoff đẹp hơn. Runtime ETag S02 và 413 guard cũng được
ghi nhận trong extension vì source OpenAPI chưa mô tả chúng đầy đủ.

Trước S01, persist intent gồm actor/Store/baseline ID, method/path, key, body gốc
(giữ field presence) và trạng thái. Không lưu cookie/CSRF/capture vào journal.
Key scope là actor + Store + namespace S01 + key; baseline/mutation/version/input/
result được fingerprint. Không reuse cùng key để chạy baseline khác trong Store.
Concurrent submit cùng intent chỉ nhận một child; body khác cùng key bị conflict.

Mất response/lost ACK: nếu đã có ID, đọc S02; đồng thời có thể replay S01 bằng
**đúng key/body/path/actor ban đầu**, session/CSRF hiện tại. Nếu chưa có ID, replay
S01 để lấy lại. Không tạo key mới để thoát unknown outcome. 403/404, mất quyền,
empty result hoặc network timeout không chứng minh chưa tạo scenario. S01 replay
cũng kiểm quyền create hiện tại; quyền bị revoke có thể khiến không replay được.

BE giữ durable request, transformed input/result, claim fencing và immutable
replay. Restart chỉ recover claim khi có bằng chứng OS process owner đã chết;
Run thành `failed/PROCESS_INTERRUPTED`, không solve lại tự động. Không recovery
theo một mốc chờ FE tự đoán. GET/read/replay không chạy solve mới. Một lần chạy
mới sau terminal failure cần ý định mới rõ ràng của người dùng, không auto retry.

## 6. Scope và dữ liệu SYNTHETIC

REPLAN tìm giỏ mua mới; **không phải fixed-basket STRESS_TEST**. Giữ snapshot Run
gốc, không sửa tồn thực/configuration, không tạo receipt/order/movement hoặc tự đặt
mua. Nhân quantile từng Product/ngày là giả định nhu cầu, không forecast model mới.
Delay áp dụng mọi **supported captured offer arrivals**, đúng một lần; không phải
một supplier được chọn. Opening stock và HSD cố định không tự dịch. Offer expiry
chỉ tính từ arrival khi đã capture explicit shelf-life basis; không đoán HSD.
Giữ horizon, bounds/effectivity và search proof scope theo engine.

Chưa hỗ trợ pending inbound, challenger baseline và scenario chaining.
**Không gọi Summary/Chat/PDF cho child scenario**: hiện trả
`WHAT_IF_PRESENTATION_UNSUPPORTED` (409) sau các guard liên quan. C03 có thể đọc
child với HYPOTHETICAL authority, không biến child thành Run thật.

Oracle **SYNTHETIC**, không phải kết quả dữ liệu quán thật:

| Preset | Baseline total | Scenario winner total | Delta tiền |
| --- | --- | --- | --- |
| demand1.2 | 10 VND | 15 VND | +5 VND |
| delay2 | 10 VND | null — không winner | null |
| combined | 10 VND | null — không winner | null |

Examples completed lấy từ đúng review đã duyệt, không solve lại để làm handoff.
Queued/running/technical-failure là state fixtures từ DTO/source; errors là router
fixtures. Không gán chúng thành bằng chứng runtime/customer acceptance.
