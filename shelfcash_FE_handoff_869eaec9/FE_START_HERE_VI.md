# FE bắt đầu tại đây

## 1. Pin contract và kiểm môi trường

**CURRENT FACT — source main:** `869eaec914aa6905d6b935889afebe7d973004ae`, branch `main`, working tree sạch lúc sinh OpenAPI ngày 15/10/2026. Khi đóng gói có WIP seed Owner/Staff và docs xuất hiện đồng thời; đã giữ nguyên và loại khỏi gói. Code `app/` được kiểm hash với Git blob main; canonical snapshots lấy từ Git, không từ WIP. [OpenAPI mới](openapi.json) được sinh trực tiếp từ code: **73 operations / 66 paths**, gồm `GET /health`. OpenAPI `info.version=1.0.0` không định danh đủ các thay đổi; pin cả source SHA và SHA-256 trong [manifest](MANIFEST.sha256).

**CURRENT FACT — runtime8103 tại lúc audit:** HTTPS `/openapi.json` trả 200 và khớp toàn bộ JSON source mới; `/health` trả 200. Launch manifest ghi cùng SHA main, PID/birth và tiến trình con nghe 8103 đã được kiểm. Đây là bằng chứng manifest/process/OpenAPI, không phải attestation executable. `local_runtime status` vẫn báo **Worker observation stale**, nên chưa xác minh được sức khỏe hiện tại của các worker. Không restart/migrate hoặc chạy job trong audit này. Xem [runtime verification](runtime/verification.json).

**CURRENT FACT — baseline FE chính:** `Shelfcash_FE_v2/contracts/011/openapi.main.json`, SHA-256 `d45b25e6423c52a854bae39efc7896df5c44a22f15549fa7f7259b565e2d837d`, 54 operations/50 paths. FE receipt 011 ghi đã nhận snapshot main cũ `b1ede89a…`; `scripts/wire-source.mjs` pin đúng hash này. [Diff chính](diff/fe011_to_main.json) so với bytes đó. [Baseline FE54 cũ](diff/fe54_to_main.json) chỉ để tham khảo lịch sử; không thay provenance FE011.

Đây là delta so với baseline FE đã pin, **không phải kết luận code FE hiện tại sai hoặc chưa dùng mọi API mới**. Audit chỉ đọc baseline/receipt/generator pin; chưa rà toàn bộ adapters/UI và chưa chạy browser E2E.

## 2. FE cần xử lý những gì

| Nhóm | Delta từ FE011 đến main | Việc cần làm |
| --- | --- | --- |
| Breaking đối với types/strict validators cũ | N19 `accept` thành `const:true`; enum trạng thái có `declined`, catalogue quyền v3/43; shared response có thêm required fields | Regenerate từ OpenAPI mới, cập nhật discriminated unions và mock fixtures; không nới thành arbitrary object. Danh sách required/enum diff nằm trong [summary](diff/SUMMARY_VI.md). |
| Additive routes | +19 operations, không xóa route: A02/A05/A06/A07/IN01, T03, NF01–03, PR01–04, MQ01–03, D01/SU01/EX01 | Chỉ nối UI đã được giao; không coi route mới đồng nghĩa FE thiếu tính năng. [Routes](routes.json) có method/path chính xác. |
| Additive DTO/query | R01/C01 `planning_request`, assessments/forecast; C03/C08 optional source references; Import contribution/receipt/history/evidence fields; N9 budget/filter metadata | Giữ metadata, nhận optional fields đúng DTO, không dựng lại evidence từ dữ liệu live. |
| Semantics | Readiness theo request/scope; recognized forecast fallback; local offer omission; partial menu; completed có thể không winner | Tách trạng thái xử lý, đủ dữ liệu, phạm vi tính, chất lượng forecast, proof và winner. Không dùng một boolean thay cho tất cả. |

Source main trước merge readiness `052cddee…` cũng có 73/66: [diff BE cũ → main](diff/previous_main_to_main.json) chỉ đổi definitions R01/C01 và shared D4 schemas, không thêm route. Hai baseline phục vụ hai câu hỏi khác nhau.

## 3. Auth, HTTPS, CORS và lỗi

Local hiện dùng **BE `https://localhost:8103` / FE Origin `https://localhost:5173`**, `AUTH_DEV_COOKIE=false`. Tin cậy chứng chỉ localhost trên máy trình duyệt. `start` không migrate, seed hoặc tự login. Nếu muốn setup HTTP cần workflow riêng; launcher local hiện bắt buộc HTTPS/dev-cookie false.

- Gọi API với `credentials: "include"`; browser tự giữ cookie `__Host-shelfcash_session` (`Secure`, `HttpOnly`, `SameSite=Lax`, Path `/`). Không JWT/Bearer/localStorage token. Không tự đặt header Cookie hoặc Origin trong browser JS.
- Mọi mutation browser kiểm Origin khớp scheme/host/port. Login/public token completion không cần CSRF token; mutation có session cần `X-CSRF-Token` lấy từ A01/A03. Thêm key/CAS theo từng operation, không áp một key format cho tất cả APIs.
- CORS cho `Content-Type`, `X-CSRF-Token`, `If-Match`, `If-None-Match`, `Idempotency-Key`, `X-Invitation-Token`. Không gửi `Authorization` hoặc header tùy ý từ generic interceptor. `OPTIONS 400` chặn POST trước login; không thể coi là sai mật khẩu. Smoke audit xác nhận HTTPS origin + content-type đạt 200; HTTP origin hoặc authorization header bị 400.
- Success envelope có `data`, `meta`, `error:null`; failure có `data:null`, `meta`, `error:{code,message,details}`. Meta/details khác nhau theo cụm: dùng DTO, không ép mọi warnings có cùng shape.
- `401 UNAUTHENTICATED` ở A03 → form login. `401 INVALID_CREDENTIALS` ở A01 → thông tin đăng nhập không hợp lệ (không phân biệt email tồn tại, chưa verified hay sai mật khẩu). `403` kiểm quyền/Origin/CSRF; `404` có thể là resource không accessible; `409` kiểm state/key/version; `412` CAS cũ → đọc lại; `428` thiếu precondition; `422` sửa input; `429/503` đọc `Retry-After`. Không retry mutation mù bằng key mới.

[Examples auth](examples/http-contracts.json) có login/me và mutation T03/NF03 đủ headers; mọi token/password trong examples là placeholder synthetic, không dùng được để login. Ví dụ JS:

```js
const r = await fetch("https://localhost:8103/api/v1/auth/me", {
  credentials: "include"
});
const body = await r.json();
if (r.status === 401) showLogin();
```

## 4. R01/C01 và request planning

| Operation | URL sau prefix `/api/v1` | Cách gọi |
| --- | --- | --- |
| R01 | `GET /stores/{store_id}/readiness` | Nếu đánh giá planning, gửi `actions=planning` hoặc actions có planning; mặc định chỉ `import,menu,inventory`. |
| C01 | `GET /stores/{store_id}/planning-context` | Đọc cấu hình/capability và readiness của default hoặc request supplied. |
| C02 | `POST /stores/{store_id}/procurement-plans` | Nhận Run durable, không trả kết quả ngay. |
| C03 | `GET /procurement-plans/{plan_id}` | Poll/read cùng UUID `run_id`; không job_id planning thứ hai. |
| C08 | `GET /procurement-plans/{plan_id}/explanation` | Đọc giải thích/evidence retained, không chạy LLM/solver. |

`planning_request` là **một query string chứa JSON của C02**, không body GET, không nested bracket query, không base64. JSON strict, UTF-8 tối đa 64KiB; duplicate/unknown fields/keys hoặc null không hợp lệ → `422 INVALID_FILTER`. Với R01, `forecast_start_date` riêng nếu có phải bằng ngày trong request; supplied request khi không có action planning bị 422.

```js
const request = {
  requirements_mode: "custom",
  forecast_start_date: "2026-10-15", // synthetic; lấy ngày user chọn khi dùng thật
  requirements: {
    paths: [{path: "BASE", min_fill_rate_percent: "90", product_overrides: []}],
    budget_limit: "0"
  }
};
const query = new URLSearchParams({ planning_request: JSON.stringify(request) });
// C01: .../planning-context?${query}; R01 thêm actions=planning.
```

[Encoded URLs đầy đủ](examples/contextual-queries.json), [default blocked](examples/c01-default-blocked-response.json), [custom ready có warnings](examples/c01-contextual-custom-ready-warning-response.json).

- Omit query → `assessment.input_scope=DEFAULT_CONFIGURATION`; không suy can_generate của custom/saved từ default blocked. Có query → `SUPPLIED_REQUEST`, `requirements_mode` đúng request. Version semantics là `planning_readiness/1`; configuration status là `RESOLVED|INVALID|UNKNOWN`. R01 có `planning_assessment`/`forecast_assessment`; C01 có `readiness.assessment`/`readiness.forecast`.
- Default cần default configuration/version hiện hành. Full custom khai đủ từng path không phụ thuộc default không dùng. Custom thiếu min/overrides kế thừa đúng path từ default và cần `default_requirements_version`; null min/overrides không hợp lệ, `[]` là explicit empty. Saved dùng `saved_requirement_id`, kiểm current saved state và references; không lấy unused default làm blocker.
- Budget luôn có Store ceiling đã biết. Omit/null `budget_limit` kế thừa ceiling; `"0"` là cap zero hợp lệ; vượt ceiling bị từ chối, không clamp. Saved/unknown ceiling vẫn có thể blocked. [Ba mode](examples/index.json) và partial-inheritance example ghi rõ điều kiện application.
- Request đúng DTO nhưng không resolve được cấu hình → GET có thể trả 200 assessment blocked. `can_generate=true` chỉ đủ preflight/capability cho scope đang đánh giá; không bảo đảm C02 sẽ nhận khi facts/quyền đổi, không bảo đảm winner/feasibility. GET không pin input, infer, train hay solve; C02/worker revalidate.

## 5. Forecast, exclusions và offer omissions

**CURRENT FACT:** `requested_mode=TRAINED` không có nghĩa actual model là trained. Hiển thị `actual_model_type`, `actual_model_version`, `selection_reason` và warnings. Whole-scope baseline fallback chỉ cho nguyên nhân recognized (`NO_ARTIFACT`, `ARTIFACT_MISSING`, `NOT_READY_HISTORY`, artifact chọn baseline); corruption/incompatibility/programming error không bị đổi thành thành công. `BASELINE_FALLBACK` khác lỗi hệ thống. `quality_status=not_evaluated` không là accuracy đã được kiểm chứng.

Sales quantity là observed sales. Stockout unknown không là false, absent sales không tự là zero. Censored history có thể bị loại/reconstruct theo policy có provenance; all-unusable có thể trả blocked `CENSORED_HISTORY_NOT_USABLE` thay generic 503.

Menu scope và computed scope khác nhau: hiển thị exclusions theo Product/ngày/reason; computed winner chỉ bao phủ computed scope. Override của Product bị exclude là `NOT_EVALUATED`. Unknown graph attribution, shared unknown fees/budget/constraints hoặc mandatory unsupported safety có thể block whole computation.

New acceptance pin `offer_eligibility/1`: known local missing offer facts/finite bound có thể tạo `OFFER_OMITTED`, retained identity/version/reason/proof scope `CAPTURED_ELIGIBLE_OFFERS_ONLY`; remaining offers và zero-purchase vẫn được xét. Không có offer đủ điều kiện không chứng minh thị trường không thể cung cấp. Không tự biến omitted offer thành excluded Product hoặc warning thành blocker. Old retained/queued policy không marker giữ semantics cũ.

## 6. Nhận Run, retry và retained results

C02 dùng canonical UUID `Idempotency-Key`, Origin/cookie/CSRF. Timeout/lost ACK → cùng key và nguyên ý định ban đầu; giữ field presence/array order, không đổi omit thành null/[] khi retry. Khác intent cùng key có thể `409 IDEMPOTENCY_KEY_REUSED`; Run mới dùng key mới. Default/saved/config version đổi cần refresh đúng lỗi, không âm thầm đổi request rồi reuse key.

202 là accepted. Theo Location đọc C03; `meta.poll_after_ms=2000` khi queued/running, `0` khi terminal; tôn trọng Retry-After. C03 trả 200 cho cả failed/completed, nên phải đọc status/outcome/errors. Đổi tab không tạo Run, GET không tính lại.

| Case | FE cần hiển thị | Example |
| --- | --- | --- |
| completed + winner | Eligible retained option; không tự đặt hàng | [Completed](examples/c03-completed-response.json) |
| completed + no winner | `winner_option_id:null`, outcome/reasons và proof; không tự ghi “vô nghiệm” | [No winner](examples/c03-completed-no-winner-response.json) |
| failed + partial | Lỗi vẫn visible; chỉ giữ independently verified partial result, kể cả có candidate eligible | [Partial/unknown proof](examples/c03-failed-partial-unknown-proof-response.json) |
| captured-only | Required result_digest có thể null; engine-dependent values unavailable/null | [C04 null](examples/c04-unknown-null-digest-response.json), [C05 null](examples/c05-unknown-null-digest-response.json) |

`UNPROVEN`/`UNKNOWN`/search incomplete không chứng minh infeasibility; finite proof chỉ có scope đã capture. P25/P50/P75 là demand quantiles; LOW/BASE/HIGH là paths; strategies public là `lean|balanced|protected`. Không ép 3 strategies thành 3 baskets khác nhau.

C03/C08 notification details có optional `source_reference`/`source_version`, không có thì elide. Dùng references/version retained; không lấy supplier/profile latest để thay evidence lịch sử. R01 current issue details dùng `reference`/`version`, không cùng tên với retained notifications. [C08 có source reference](examples/c08-retained-source-reference-response.json).

Unknown/null/zero: service null khi requested zero; không gán 100%. Unknown stock không confirmed empty. Missing delivery classification không fee=0. Exact numerator/denominator mới là truth, `decimal_view`/`percent_view` để display; Money/Quantity/count lớn giữ string. Required-nullable khác optional-absent.

## 7. Import, profile, notifications và discovery trên main

Import hiện có 15 schemas. Stockout/contribution lineage, bốn support-history domains, actual inventory receipts và typed effect/completion đã có main. Purchase history không làm tăng stock; actual receipt mới là hàng nhận. Không tự dùng support history thành forecast feature. Recipe/supplier basis, raw `source_value`, header/preamble/epoch metadata đã có ở baseline FE011: giữ đúng; không báo chúng đều là delta mới.

I04 PreviewPage thêm required `mapping_revision`, `read_set_digest`, `source_evidence_digest`, typed aggregates và optional effect fields. Mapping list có counters/counter_scope; MQ01–03 giữ pinned submission revision và review eligibility. Owner có thể tự approve profile mình tạo; Staff proposal không có quyền activate. N5 approval/rejection không phải batch canonical commit: tiếp tục preview/confirm_review/commit và current rights. Commit atomic; I06 retained completion mới chứng minh canonical result, không dùng upload/202/notification làm “đã nhập”.

NF01 inbox/NF02 unread count/NF03 read state là account-scoped current authorization. PATCH read cần cookie/CSRF/Origin/If-Match/key; stale revision 412 → refresh. Notification là lịch sử thông báo, không cấp grants, không chấp nhận invitation, không commit Import. PR01–04 là permission requests; approval union vẫn kiểm current authority. MQ deep link dùng submission_id, không thay bằng latest profile revision.

D01 Today là sections có authorization/partial availability; SU01 picker suppliers; EX01 list retained exports. N9 Run history có captured_budget và timezone/applied_filters; captured zero khác unknown/null. PDF download N11 là binary, không success JSON; download cookie/current rights, lỗi vẫn JSON. Dùng OpenAPI và [canonical index](contracts/INDEX.md) khi nối các màn này.

## 8. Self-service Store và email callbacks

**ACCEPTED DECISION / CURRENT FACT:** A02 signup nhận email/display_name → A05 mailbox proof + holder password → A01 login → T03 tự tạo Store. Signup/verify không tạo session, Store hoặc membership. T03 body `{name,timezone,currency}` explicit, tạo Owner cho authenticated holder, không seed menu/stock/budget. Key T03 là visible ASCII 1..128 (không bắt buộc UUID); cùng account/key/canonical body replay 201 cùng Store. [T03 example](examples/t03-create-store-request.json).

**Cấu hình trên disk khi audit, không chứng nhận delivery runtime:** email flag ON; verification callback **chưa set**; SETUP/RESET callback `https://localhost:5173/credentials/complete`; invitation callback `https://localhost:5173/invitations/{invitation_id}`. FE cần chốt route verification riêng rồi phối hợp cấu hình BE trong task khác. Không giả callback EMAIL_VERIFY thành trang N7 SETUP/RESET, không đổi config trong handoff này.

Token lấy từ fragment, giữ memory, xóa fragment ngay/no-referrer, không log/localStorage; A05 consume EMAIL_VERIFY, N7 consume SETUP/RESET. A02/A06/A07 trả generic 202 khi service-wide capability available, không chứng minh email đã gửi hay account tồn tại. Thiếu callback/capability → `503 EMAIL_DELIVERY_UNAVAILABLE`, Retry-After 60; không spinner “chờ mail” vô hạn. A05/N7 token completion không có idempotent receipt: token consumed/expired retry có thể 400; hướng dẫn login hoặc resend/reset. Không gửi email thật trong audit này.

## 9. Chưa có hiệu lực tích hợp

**CURRENT FACT:** main không cung cấp Decision Assistant/chat API; Assistant và forecast challenger/E4 thuộc worktree riêng, không đưa vào OpenAPI này. Mục preview này không là contract, không nối FE vào WIP.

PO/order placement/customer option selection, subscription/OAuth/Store transfer/delete chưa có public flow. What-if/scenario-based planning chưa được triển khai public; C01 capability không cho phép inbound PO/scenario. Không dựng endpoint từ proposal, C06/C07/C10 riêng: chart gộp C05, polling C03, regenerate qua C02.

Một số canonical prose còn checkpoint cũ mâu thuẫn current source (assisted-only/Store creation, D4 proposal, notification chưa merge). [Audit mismatch](verification/DOC_MISMATCHES_VI.md) chỉ rõ từng chỗ. Source DTO/routes quyết định wire; approved workflow mới ở canonical section tương ứng; không sửa code để chạy theo prose cũ.

## 10. Checklist bàn giao

1. Pin OpenAPI main mới, review [diff chính và required/enum changes](diff/SUMMARY_VI.md); regenerate closures/types/mocks, review validators từng cụm.
2. Kiểm HTTPS trust, exact Origin, bỏ bearer header thừa, `credentials:include`. Login sai → POST thực nhận 401; A03 401 → login. Kiểm expired/revoked session và Store switch.
3. Dùng scope/version assessment: default blocked nhưng full custom có thể ready; partial inheritance/version stale; saved archived/over-cap; budget zero/null/omitted; R01 supplied request phải có action planning.
4. Kiểm fallback/warnings, omitted offer, partial menu, all-censored blocked, known-empty inventory; không biến unknown thành zero.
5. C02 accepted/lost ACK/same-key retry → C03 queued/running/terminal; completed winner/no-winner, failed partial, unknown proof; C03/C08 giữ source refs và retained facts sau config đổi.
6. Import profile review → pinned MQ/N5 → preview/confirm/atomic commit/I06; notifications/read CAS, current rights mất giữa flow; PDF binary/current-rights; actual receipt khác purchase history.
7. Chốt FE verification route và kiểm email capability trước khi chạy signup → verify → login → create Store. T03 retry không tạo Store trùng.

**Kết quả audit này:** source OpenAPI + boundary examples đã kiểm offline; runtime smoke chỉ health/OpenAPI/CORS, worker observation stale. Không chạy login/business mutation, DB integration suite hoặc browser; **không claim browser PASS**. Fixtures là synthetic; examples minh họa mới không phải kết quả solver hay bằng chứng persistence. Các tests ưu tiên ở trên là checklist cho lượt tích hợp tiếp theo.

Đọc sâu khi cần: [canonical index](contracts/INDEX.md), [examples index](examples/index.json), [provenance](provenance/source.json). Không cần đọc task notes để bắt đầu.
