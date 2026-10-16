# START_HERE — bàn giao FE: Summary, PDF và Chat

## CURRENT FACT — baseline và trạng thái

Preview **SOURCE_READY / NOT_DEPLOYED** pin source main local
`a17d153feccfa96de34002dd536bf9381c01f219`. Deployment hiện phục vụ chưa được
xác minh; không khẳng định hệ thống đang tắt. Local remote-tracking `origin/main`
lúc chuẩn bị là `d5cfbfb59de7c45bc08eb47129b5ba3919e05473`; chưa fetch xác minh
server remote. Không suy runtime8103 đã cập nhật từ Git hoặc manifest cũ.

PDF source `9a80f970ed2770b9d44ac662c08cdb63b4b50806`, integration
`1134a787938633836a970e504376fb81e26e3eb2`; Summary source
`48a3658d64ff2edbdf6d1ecb72a0ed034f6ed88f`, integration là HEAD trên.
Cả bốn mốc nằm trong ancestry main local. Không commit/push/merge, restart,
migrate, provider activation hoặc sửa FE trong lần chuẩn bị này.
Migration source head `l5_20261016_assistant_f4` không chứng minh DB đã upgrade.

OpenAPI từ source: **76 operations / 69 paths**. So handoff `d5cfbfb`, không
thêm/xóa/đổi operation, không thêm/xóa schema hay field; chỉ mở rộng version đã
duyệt ở ExportAccepted.render_version, SummaryAnswer.renderer_version và
SummaryDiagnostics.prompt_version/validator_version.
[Diff d5cfbfb](openapi_diff_d5cfbfb.json) pin hash bytes baseline từ Git.
[Diff FE73](openapi_diff_fe73.json) giữ provenance gốc
`869eaec914aa6905d6b935889afebe7d973004ae`, OpenAPI SHA256
`790443d80350cc597c7c06179309e43303ba558de34017ea1dd4113de71fc1ee`.
AS01/AS02/AS03 là ba operation thêm so với FE73.

Import nâng cấp đang ở nhánh riêng; chưa thuộc bản bàn giao này. Sẽ reconcile và
phát hành handoff thống nhất sau tích hợp. Import trong artifacts giữ theo main.
ZIP dưới ignored runtime là preview, chưa thay thế bản phát hành cuối sau Import.
PROVENANCE.json trong gói pin source/local remote ref/trạng thái; manifest SHA-256
kiểm bytes tài liệu/artifacts chưa commit, không giả chúng là bytes của HEAD.

## Đọc theo thứ tự

1. [OpenAPI](openapi.json): DTO, required/nullability, headers/responses.
2. [Planning](../PROCUREMENT_API_CONTRACT_VI.md): §15.4 PDF, §17 discovery,
   §18 Assistant; [Assistant feature](../features/DECISION_ASSISTANT.md): composition,
   cấu hình, evidence và giới hạn.
3. [Examples](examples.json): lịch sử giữ text/pins; integration_sequences là
   ILLUSTRATIVE offline từ fixture source, không phải HTTP/live mới.
4. [API chung](../API_CONTRACT.md), [Authorization](../AUTHORIZATION_CONTRACT_VI.md),
   [Import](../IMPORT_MAPPING_API_CONTRACT_VI.md),
   [Notifications](../NOTIFICATION_API_CONTRACT_VI.md),
   [recovery allowlist](recovery_journal.json).
5. [Current state](../CURRENT_STATE.md), [runbook](../runbooks/FULL_TEST_FLOW.md),
   [recovery audit](../reports/FE_019_BACKEND_RECOVERY_AUDIT.md).

## CURRENT FACT — phân biệt các consumer

| Consumer | Vai trò | FE hiển thị / xử lý |
| --- | --- | --- |
| C03 GET `/api/v1/procurement-plans/{plan_id}` | Kết quả authoritative và response_version | Giữ outcome/recommendation/scope; format số cùng unit/currency |
| C08 GET `/api/v1/procurement-plans/{plan_id}/explanation` | Structured engine evidence đã lưu | Hiện reasons/proof/references, không tự dựng causal claim |
| AS01/AS02 | Immutable summary generation | result.answer, claims/references, source/diagnostics và generation status |
| AS03 | Hội thoại theo evidence | answer hoặc clarification; context được BE kiểm lại |
| N10 / EX01 / J01 / N11 | Export/PDF tải xuống | Quản lý intent/job/artifact; không tái tạo PDF ở FE |

Tên/giá trị từ retained snapshot. Có label thì dùng làm tên chính, ID để truy vết;
không thay bằng catalog hiện tại. Label thiếu vẫn phân biệt entity. Không cộng/
gộp/deduplicate shortlist thành tổng Ingredient, kể cả dòng cùng Ingredient/số/
unit. Không suy unknown=0, phí phải trả=phí giao hàng, can_generate=có winner,
model fallback=Planning failed. Summary/PDF/chat không là đơn mua, hàng đã nhận,
tiêu thụ thật hoặc thao tác chạy lại solver.

## CURRENT FACT — Summary AS01 / AS02

1. Đọc C03 lấy response_version; xác định Run/option đang xem.
2. AS01 POST `/api/v1/procurement-plans/{plan_id}/assistant/summary` với đủ
   expected_evidence_version, option_id (nullable), locale (vi|en), detail_level
   (simple|technical). Null dùng winner nếu có, không có thì overview.
   Không thêm question/history/business facts.
3. Cookie session hiện hành, exact allowed Origin, fresh X-CSRF-Token, UUID
   Idempotency-Key; không query, If-Match hoặc If-None-Match. Body≤32KiB.
   HTTP200 SummaryEnvelope, Location trỏ AS02, Cache-Control: private, no-store.
4. Lưu generation_id; AS02 GET cùng path thêm `/{generation_id}`, không body/query,
   không mutation headers bắt buộc. GET chỉ đọc running/completed/failed, không recover.

Cả hai kiểm current Store/session + planning.result.read, budget.read,
procurement.cost.read; thiếu một quyền không trả cached facts một phần.
SummaryView.status và result.source là hai chiều khác nhau. Completed result
model_presentation là bounded validated wording; deterministic_fallback với
MODEL_DISABLED/PROVIDER_UNAVAILABLE/SCHEMA_REJECTED/GROUNDING_REJECTED/INPUT_LIMIT
vẫn dùng được. Failed generation có result=null/error_code.
AS01 thường synchronous completed; replay có thể trả retained running/failed.

Uncertain delivery: giữ original key/body; có generation_id thì AS02, không có
thì explicit POST replay đúng key/body. Same key đổi body409. Live/unknown claim409
GENERATION_IN_PROGRESS; chỉ POST replay có OS proof owner chết mới recovery
PROCESS_INTERRUPTED, không phát lại ambiguous paid call. GET/replay terminal không
gọi model. Key mới chỉ là thao tác mới có chủ ý sau khi đã giải quyết outcome.
Generation cũ giữ text/evidence/pins; đổi dữ liệu nghiệp vụ cần Run mới.

S3 BE chọn communication plan; FE không tái tạo selection/validation. Giữ khác
biệt winner, zero purchase hợp lệ, no eligible candidate, blocked, failed/partial.
Failed selector option chỉ diagnostic, không hiển thị thành khuyến nghị. Món thiếu
không có nhu cầu bằng0. Giữ outcome/scope/warning/qualifier có references; unknown
notice dùng wording trung tính. Shortlist tối đa ba dòng, có thể không đầy đủ;
từng dòng giữ ordinal/quantity/unit/arrival date. C03/C05/C08 giữ chi tiết.
Không suy nguyên nhân hay tối ưu ngoài evidence.

Public pins mới: renderer_version=plan_summary_renderer/4; diagnostics
prompt_version=plan_summary_prompt/5, validator_version=summary_owner_guard/4.
summary_profile/6, owner_summary_selection/2, summary_narrative/3 là internal,
không field cho FE chọn. Public schema_version=plan_summary/1 giữ nguyên.
Không chờ headline/key_points internal trên wire.

## CURRENT FACT — Chat AS03 và tiếp nối

POST `/api/v1/procurement-plans/{plan_id}/assistant/messages`, cùng quyền và
mutation headers như AS01, không CAS/query. **Không có GET message endpoint**.
Required: bốn field SummaryRequest + question1..2000 chars, ingredient_id nullable,
history (có thể[]). History≤6 user/assistant messages, content1..2000 chars,
tổng≤4000; body≤32KiB. Optional context chứa Run/evidence version,
option/comparison_pair, Ingredient/Product ID, pending/topic đúng DTO.
Không có top-level product_id hoặc field chọn candidate8.

History chỉ hỗ trợ hội thoại; không cấp facts/quyền. Context là identity hint
được BE kiểm với retained scope/version, không tự có authority. Dùng response.context
ở turn tiếp; clarification hiện candidates, giữ pending.original_question. Chọn
candidate bằng ID/context tường minh; POST key mới vì là turn mới đã có response
xác định, không dùng key cũ đổi body. Nếu response trước còn uncertain, chỉ exact
original POST replay; không biến retry thành turn mới. AS03 generic journal chỉ
metadata, không tự persist toàn question/history; xem allowlist bên dưới.

kind=clarification là thành công có xử lý, kể cả diagnostic FALLBACK của renderer
cũ/V6. Hiện question/candidates, không báo Planning lỗi. kind=answer dùng answer,
claims/references. Phân biệt source=model|deterministic_fallback|deterministic_clarification
và disposition ACCEPTED/REPAIRED/TRIMMED/REGENERATED/FALLBACK/CLARIFICATION.
REGENERATED là semantic retry có giới hạn do BE làm, không yêu cầu FE retry.

Chuỗi trong examples.json.integration_sequences: hỏi Sữa tươi rõ ràng;
“Sữa cần mua bao nhiêu?” → hai candidates; chọn Sữa tươi → tiếp câu gốc;
“Vì sao lượng đó?” → giữ entity/topic, nêu thiếu causal evidence;
“Còn sữa đặc?” → đổi entity/evidence. Pronoun chỉ resolve khi antecedent rõ.
Comparison giữ chiều to-minus-from, Product/path/unit và simulated scope.
No-winner/failed/partial không khẳng định có recommendation hợp lệ.
Ví dụ offline không là live quality evidence.

V6 vẫn default tại AssistantChat(...,presentation_version=6) và main composition.
Candidate8 chỉ explicit constructor trial, không env/public selector. Acceptance
candidate8 không đổi default. Model OFF vẫn deterministic answer/clarification.
CHAT_*, SUMMARY_* và Import Qwen độc lập; không dùng chat mua hàng/sửa data/rerun
solver. Request/replay kiểm current rights/Store; history không bypass revocation.

## CURRENT FACT — PDF renderer /3

1. N10 POST `/api/v1/procurement-plans/{plan_id}/exports`, body
   `{format:"pdf",option_id:null|OptionId,locale:"vi"}`; session/Origin/CSRF/UUID key,
   không CAS/query. Null cần winner;409 WINNER_NOT_AVAILABLE không tạo winner mới.
   202 ExportEnvelope, receipt chứa export_id/job_id/result_digest/render_version.
2. J01 GET `/api/v1/jobs/{job_id}`, không body/query: queued/running poll theo
   meta.poll_after_ms (2000); completed dùng result.download_url; failed hiện error.
3. EX01 GET `/api/v1/procurement-plans/{plan_id}/exports` tìm lại; filters
   option_id/status/limit/cursor/snapshot_id theo OpenAPI; dùng allowed_actions và
   artifact_availability. List trống không là definitive no-effect.
4. N11 GET `/api/v1/procurement-plans/{plan_id}/exports/{export_id}` tải binary PDF;
   Content-Disposition/Content-Length/ETag SHA256/private,no-store/nosniff.

Current rights gồm ba quyền đọc trên + planning.export, kiểm cả worker,
discovery/status/replay/download. GET không tạo job/render lại. N10 uncertain dùng
same key/body; replay original receipt/job, không resurrect failed job. New key chỉ
explicit export mới sau review. Giữ receipt/job/retry/bytes /1 và /2;
N10 mới default /3, FE chấp nhận cả ba.

/3 deterministic, không cần LLM hoặc tự chứa Gemini Summary. Có kỳ kế hoạch,
tổng chi/ngân sách/winner, đầy đủ dòng mua, BASE/LOW/HIGH dễ hiểu, warnings và trace
gọn. Product/Ingredient snapshot labels; thiếu tên dùng fallback suffix phân biệt.
Store/Supplier chưa luôn có tên; không đổi cup→ly mặc định. Số trang theo data:
fixture77→4 trang; Run gốc169 trang chưa rerender. FE không tái tạo nội dung PDF.

## CURRENT FACT — UI states và recovery

| UI | Tín hiệu source | Hành động FE |
| --- | --- | --- |
| Loading | Request chờ; summary running; export queued/running | Hiện tiến trình; AS02/J01 là readers tương ứng |
| Clarification | AS03 kind=clarification | Hiện candidates/pending, không retry loop vì FALLBACK |
| Fallback/provider unavailable | Completed deterministic + diagnostics reason | Hiện answer/qualifier; không đổi Planning status |
| Stale evidence |409 EVIDENCE_VERSION_CONFLICT | Đọc C03, báo context cũ; không silently đổi intent uncertain |
| Permission revoked |403 PERMISSION_DENIED | Dừng facts; không dùng cache bypass |
| Expired session |401 UNAUTHENTICATED | Auth/fresh CSRF; giữ uncertainty, không suy rollback |
| Foreign/inaccessible |404 RESOURCE_NOT_FOUND | Không lộ entity;404 không chứng minh no-effect |
| Uncertain mutation | Mất response/timeout;409 GENERATION_IN_PROGRESS | Read/exact replay theo operation; không automatic new-key |
| Terminal generation failure | Summary failed/result=null; chat409 GENERATION_FAILED | Hiện failure, không recommendation; thao tác mới explicit |
| PDF chưa sẵn sàng/thiếu |409 EXPORT_NOT_READY /503 EXPORT_ARTIFACT_UNAVAILABLE | Theo J01/EX01; không render từ GET |

OpenAPI/Planning §18 sở hữu toàn bộ error enums. TECHNICAL DEBT: §18.5 từng ghi
422 VALIDATION_ERROR; handler hiện trả INVALID_PLANNING_CONFIGURATION cho lỗi body
Assistant. Adapter theo source; không đổi runtime/policy để che drift.

## ACCEPTED DECISION — FE persistent journal

Persist allowlisted intent **trước** dispatch, scope actor/Store/operation/resource,
original key/body/CAS/time theo [recovery_journal.json](recovery_journal.json).
Restore sau F5 kiểm session/actor/Store rồi explicit readback/exact replay.
Fresh cookie/CSRF từ Auth, không persist. Default DENY unlisted fields/operations.
AS03 metadata-only; không bỏ field rồi replay body thiếu. Question/history/pending
original_question không được generic journal tự persist.

Full body chỉ cho operation/conditions trong JSON: T03, I01, I03, I05 preview,
N4, N21, N10, NF03, AS01; I05 commit chỉ pure insert/NO_OP, reason absent/null và
correction arrays đúng empty/absent; C02 chỉ default/saved không custom requirements.
Giữ field presence/array order. Grants/review reasons, mapping/source resolution,
stock facts/custom requirements theo metadata/exclusion. Không credentials,
token/session/CSRF/cookie, email/invitation proof, raw cells/file bytes.
Auth proof flows dùng operation-specific UX.

Empty/absent receipt/403/404/timeout không definitive no-effect. Readback có thể mới
hơn receipt; hash không dựng lại body mất. Replay denial giữ uncertainty.
Logout/clear journal không cancel accepted write. Không thêm BE retention policy,
generic negative-proof API hoặc cross-device receipt discovery. Journal/browser
restore/XSS/shared-device acceptance còn NOT_RUN; retention UX là PROPOSAL.

## FE acceptance checklist — chưa nghiệm thu browser

- Regenerate adapter theo OpenAPI; hỗ trợ version enums mới, giữ nullable/unknown.
- Summary: winner/zero/no eligible/blocked/failed diagnostic, excluded scope,
  warning references, duplicate purchase lines và abbreviated-list qualifier.
- Summary: AS02/replay pins cũ, provider disabled/rejected/unavailable, running,
  failed, lost response, same key/different body; không extra provider call.
- Chat: đủ bảy examples, clarification/context, pronoun ambiguity, switch Ingredient,
  causal limit, comparison direction/Product/path/unit; không GET chat.
- PDF: N10→J01→N11, EX01 tìm lại, /1-/2-/3, unavailable artifact, unknown labels;
  không promise bốn trang hoặc Summary trong PDF.
- Cả ba: stale evidence/session expired/từng quyền revoke/foreign Store,
  concurrency/lost ACK/replay; không hidden cached facts.
- Journal: F5/actor/Store switch/write failure trước dispatch; lookup empty trước
  delayed acceptance không unlock competing mutation.
- Import giữ nguyên: I02 exact multipart replay có BE nhưng FE helper018 chưa hỗ trợ;
  không journal bytes. I04 authoritative file set/quota/persisted preview review;
  resolver chưa submit khác persisted decisions. Auth verify không tạo session/Store.
- Kiểm serving source/schema và browser Owner/Staff riêng sau deployment; health200
  chỉ liveness. Handoff không chứng nhận full suite hoặc production.

## Evidence và operator

HISTORICAL INFORMATION: S2/S2.1 real Gemini synthetic acceptance giữ pins/fingerprint
riêng; Codex grading, không independent human review. S3 backend/offline fake-provider,
HTTP/PostgreSQL/security/recovery có evidence; **không final-source live Gemini VERIFIED**.
Chat V6 và explicit candidate8 có finite synthetic live/offline evidence tại feature;
không browser/production acceptance. Finite paraphrase vocabulary vẫn có thể reject
câu đúng rồi fallback; không general entailment.

FE chỉ API base/Origin/adapter, cookie credentials theo Auth; không OpenRouter key.
BE operator đọc [startup settings](../features/DECISION_ASSISTANT.md#operator-settings)
và [runbook](../runbooks/FULL_TEST_FLOW.md). Defaults provider OFF; key không tự enable.
Settings cần authorized process restart để áp dụng; nhiệm vụ này không restart.
Không copy SUMMARY_MAX_TOKENS=256 cũ cho narrative hiện tại.

BACKLOG ngoài scope: accepted-file delete/replace/unseal; Today outlook/arrival/pending
customer decision; immediate canonical create+bind; standalone saved Preview decisions;
richer token continuation; cross-device discovery/negative fencing. Latest Run không
là pending purchasing approval. Import curated templates/I1/I2 chưa tích hợp.
