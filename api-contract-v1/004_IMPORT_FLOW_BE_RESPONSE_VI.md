# #004 — BE response: Import Mapping → Preview → Review → Commit → Result

Ngày đối chiếu: 11/10/2026. CURRENT FACT chỉ những hành vi đối chiếu DTO, routes,
use cases và tests hiện tại; ACCEPTED DECISION là các policy trong sáu contract.
TESTED dưới đây dùng completed evidence lịch sử, không phải test vừa chạy lại.

BE đã có mapping, pinned preview, per-import `confirm_review`, canonical commit
atomic cho chín domain, durable completion, shared jobs và current readiness.
FE có thể tích hợp bằng schema hiện hành. Những trường FE đang chờ nhưng runtime
không trả phải được nhận diện riêng; không thêm implementation/policy trong audit này.

| FE question | BE capability | schema đã công bố chưa | verification | gap/action |
| --- | --- | --- | --- | --- |
| M01 files/sheets/progress/profile review | Summary typed, full profile details tùy query, top-level sheets | Có trong v2; công bố lại exact refs/required/null ở bundle này | Source + E46 historical HTTP | Không có files[].sheets, state histogram hoặc computed profile diff; FE join bằng file_id, xem full spec |
| M02 union/counts/full queue | MappingIssue thống nhất, 5 statuses, filtered signed pages | Có; shape thực là items/counts:Progress | Source + E46 historical HTTP | Không có filter_counts theo 5 states, candidates/reason arrays, issue_type discriminator; include_details không đổi projection |
| M03 descriptors/availability | Options theo sheet và catalogue 9 schema, uniqueness | Có; catalogue example lấy từ current descriptor functions | Schema gate E46; chưa tìm thấy executed endpoint HTTP case | IMPLEMENTED; cần targeted HTTP follow-up nếu muốn TESTED runtime, không browser verified |
| M04 non-column/CAS | TargetRequest hoặc ResolveRequest union đầy đủ | Có; discriminator ở resolution.kind | Source + E46/E47 historical HTTP | Mapping CAS, không import CAS; refresh cả mapping và I04 sau write |
| I05 Preview/pins/pages | Async202 → J01 → I04 pinned rows/configurations | Có, validation và serialization schema tách riêng | E45/E46/E411 historical | Wire refs/provenance là object; read-set đầy đủ nằm internal, không đòi field chưa expose |
| I05 confirm_review | Synchronous200 staging review, content-bound confirmation | Có; phase thứ ba đã được duyệt | E45/E46/E411 historical | FE thêm bước review trước commit; activation không thay per-import review |
| I05 Commit/mixed/replay | Async202, atomic 9 domain, exact resolutions/supplier_changes | Có | E45/E46/E47/E411 historical | supplier_changes ở top-level; 202 không durable success; reason conditional |
| I06 impacts/omissions | Retained receipt/readiness sau transaction, committed/no_changes | Có; omission dưới data.readiness | E45/E46/E48/E411 historical | Không có receipt job_id/request_id; null impacts không đồng nghĩa 0 |
| J01 status/reconcile | Retained Import/PDF job; failed vẫn HTTP200 | Có, result resource_type discriminator | E45/E46/E411 historical | Recovery/replay/current-right checks khác browser reload flow |
| R01 readiness | Current coherent snapshot, action-specific rights | Có | E48 historical completed HTTP/PG tests | Không dùng thay snapshot I06; GET không chạy forecast/solver/provider |
| N5 approval | Owner-only immutable profile activation/reject/retire | Có | E46 historical HTTP/CAS + E47 Staff exception tests | Proposal edit ≠ activation ≠ batch confirmation ≠ commit |
| Reload/discovery | I04/J01/I06 retained reads, H01/H02 first-upload discovery | Có, H01/H02 nằm OpenAPI slice | E411 historical History browser + API | FE checkout không có continuation/re-entry UI; H02 không discover never-uploaded draft |
| Environment/whole chain | Dedicated local integration localhost:18001 | Public setup trong runbook; không gửi secrets | Chưa re-probe lượt này | Không STAGING_READY; S4.11 PARTIAL, whole-chain browser chưa PASS |

## Authority và snapshot đối chiếu

Đọc theo AGENTS: CURRENT_STATE → DECISIONS/accepted ADRs → ARCHITECTURE →
API_CONTRACT → DOMAIN_MODEL → DATABASE_SCHEMA → ROADMAP → code/tests.
Sáu contract authoritative: [aggregate](../SHELFCASH_API_CONTRACT_V1_VI.md),
[Auth](../AUTHORIZATION_CONTRACT_VI.md),
[Catalog/Menu/Recipe](../CATALOG_MENU_RECIPE_API_CONTRACT_VI.md),
[Import/Mapping](../IMPORT_MAPPING_API_CONTRACT_VI.md),
[Inventory](../INVENTORY_API_CONTRACT_VI.md),
[Procurement](../PROCUREMENT_API_CONTRACT_VI.md).
Đối chiếu [compatibility changelog](../CONTRACT_COMPATIBILITY_CHANGELOG_VI.md),
[S411 notes](../runbooks/S411_TASK_NOTES.md),
[local runbook](../runbooks/S411_LOCAL_INTEGRATION.md),
[FE clarification gốc](../../004-import-flow-be-clarification.md).

Baseline **đúng ngày10/10**: `shelfcash_backend_context_handoff.zip`, SHA256
`238959dd16307ebd691834d2a679f7f80134495bbe99c56f29f7835f39bab6fd`.
Handoff v2: `shelfcash_integration_handoff_S4_11_v2.zip`, SHA256
`b66ce2842db68793a75af10ed7bf0297c070f0b8c16de9e913dcc1804fedc02d`.
Không dùng ZIP09/10. HEAD BE `a4b68378f35fea6f71b549e24393cf4bbb35aba5`;
source có WIP nên HEAD không đại diện toàn snapshot; hash source trong
[evidence](004_import_flow/evidence/source_evidence.json).

OpenAPI sinh offline từ **source hiện tại** bằng v2 đầy đủ. Baseline32 → current54
operations (kể cả health):22 thêm,6 definition đổi I01–I05/M04,0 loại bỏ,0 đổi
method/path của operation cũ. Component/schema diff là vấn đề riêng, không dùng
route count chứng minh implementation. Baseline design đã có commit202/job;
baseline source chưa canonical commit. Đây là công bố schema/đối chiếu implementation
hiện có, không API version mới. V2 không chứa whole-source hash manifest nên
không chứng minh byte-equality toàn source với thời điểm publication. S411 notes
có post-publication setup `.env` và user-authorized reset/reseed; đó là thay đổi
environment/dataset, không API delta. Evidence trước reset vẫn là lịch sử.

## §E — exact surface contracts và cách dùng schema

Trả riêng đủ11 surface theo **đúng key format §E** tại
[SURFACES_VI.md](004_import_flow/SURFACES_VI.md) và bản máy đọc
[SURFACES.json](004_import_flow/SURFACES.json): M01, M02, M03, M04,
I05 Preview, I05 confirm_review, I05 Commit, I06, J01, R01, N5.
Mỗi entry có full request parameters/body refs, success/async/replay/error schemas,
CAS/idempotency/errors/deviations/source/executed evidence/access. JSON flow mappings
trong YAML blocks là cú pháp YAML1.2 hợp lệ; không phải DTO YAML gửi lên API.

Đọc [OpenAPI slice](004_import_flow/schemas/openapi_import_flow.json) để biết exact
HTTP/headers/query và responses, [field catalogue](004_import_flow/schemas/FIELD_CATALOG_VI.md)
để tra mọi required/optional/null/enum/bounds/default, và
[DTO validation/serialization bundle](004_import_flow/schemas/dto_validation_serialization.json)
để phân biệt input với public wire serializer. Slice có14 operations/162 schemas,
bao gồm I04/H01/H02/A03/T02 phục vụ resume và authorization; full current OpenAPI
cũng có trong bundle. Không refs tới schema ở một ZIP khác.

Không có global DTO version cho tất cả Import surfaces. `operationId` M01… không
phải schema version. Literal **thực**: `import_schema/1`, `import_mapping_policy/1`,
`import_review/1`, `field_value/1` chỉ thuộc các object tương ứng. JSON Schema
không mô tả đầy đủ current authorization, cross-field/nonblank/decimal/identity/CAS
validators; các quy tắc bổ sung dưới đây là cần thiết.

Transport: `/api/v1`; session cookie qua `credentials:include`, cookie HttpOnly
do server quản lý. Local dev dùng `shelfcash_dev_session`, production schema cookie
`__Host-shelfcash_session`. Writes cần allowed browser Origin, `X-CSRF-Token`,
canonical lowercase UUID `Idempotency-Key`, quoted strong `If-Match` đúng resource.
Key header max128, match max256, CSRF max512; JSON body ≤65,536 bytes. Header
optional/nullable trong OpenAPI là transport declaration, không phải runtime guard
optional. GET không body; unknown/duplicate query bị422 INVALID_FILTER; wrong path
UUID422 VALIDATION_ERROR. M01/M02/M03 query bounds và R01 date bounds ở slice.

Import success envelope `data`, `meta:{request_id,warnings,poll_after_ms,pagination}`,
`error:null`; nullable defaults có thể serialize null. `warnings` hiện lấy từ data
warning collection nếu có. R01 success dùng Auth Envelope/Meta, không ImportMeta;
error dùng ReadErrorEnvelope với `meta:{}`. Cache no-store; `X-Request-ID` mỗi request.
M01/M04 ETag là quoted mapping revision; I04/I05 là quoted import revision; N5 là
quoted lifecycle revision. M02/M03 không ETag response; dùng M01/M03 mapping_revision.

## Mapping DTO, identities và completeness

M01 `GET /api/v1/imports/{import_id}/mapping-summary`:

- `files[]` là FileView phẳng, `sheets[]` riêng; join `sheets[].file_id` với
  `files[].file_id`. FileView gồm client_file_id/file_id nullable, filename/type/
  size/content_digest/upload_status/error và parse_status. Không `files[].sheets`.
- Progress đúng ba số `total_fields/completed_fields/unresolved`; tính trên **mọi
  issue**, kể cả source/classification/identity/conversion, không chỉ cột hay page.
  Completed là status auto_mapped/resolved; resolved proposal chưa phải approved.
- Default `include_clean_sheets=false` ẩn những sheet hoàn toàn auto_mapped có
  binding hợp lệ và không sheet blocker. `true` để kiểm toàn sheet inventory;
  files/progress/bindings không bị thu nhỏ theo projection này.
- `include_profile_details=true` trả full typed proposal.spec và approved_profiles
  (binding + spec); mặc định proposal.spec=null, approved_profiles rỗng. Proposals
  vẫn có profile_id/proposal_revision/lifecycle_revision/active_version/missing_fields.
  Không full-spec paging hoặc truncation flag; không riêng computed old/new diff.
  Owner so sánh full proposed spec và approved spec theo identities/version; samples
  rút gọn không thay full review evidence. M01 không search hoặc cursor.
- `binding_refs` là `{sheet_id,profile_id,version,content_digest}`; approved_contexts
  là source_system_key/report_type/evidence_reference/approved_by/approved_at.
  `can_preview/blockers/allowed_actions` đã được lọc current rights, không suy từ progress.

M02 `GET /api/v1/imports/{import_id}/mappings`:

- DTO **một MappingIssue**, `issue_type` enum source_context/column/identity/
  conversion/schema_blocker/classification; không issue_type-discriminated union
  với variant-specific requiredness. Server issue type quyết M04 variant hợp lệ.
  Stable mapping_id/sheet_id; file identity ở source_location.file_id; column identity
  bằng `(file_id,sheet_id,source_column_index)` zero-based, không header text.
  SourceLocation row/index/record/line fields optional-null, không phải tất cả đều có.
- 5 status auto_mapped/resolved/needs_confirmation/ambiguous/unmatched; không status
  ignored. `ignored:boolean` và explicit resolution/profile evidence biểu diễn IGNORE.
  `profile_ref`, `resolution`, `resolved_by` nullable; resolution_origin bắt buộc
  APPROVED_PROFILE/USER_PROPOSAL/UNRESOLVED. Header/target/suggestion nullable;
  samples tuple; suggestion_origin RULE/QWEN/REUSED/MANUAL/NONE và confidence0..1/null.
  Confidence không xác suất hay authorization. `code` là issue code, không
  `reason_code[]`, candidate array hoặc ranked identity search result.
- Default review_only=true chỉ bỏ auto_mapped; **resolved vẫn có trong queue**.
  `review_only=false&status=auto_mapped` đọc successful pairs. Filter sheet_id/status
  chỉ items; data.counts = Progress **toàn batch trước tất cả filters**, không riêng
  sheet và không 5-state histogram. meta.pagination.total_count thuộc filtered list.
  include_details nhận boolean nhưng hiện không thu gọn/mở rộng item fields; nó
  tham gia cursor binding. Không search `q` tại M02.
- limit default50,1..100; cursor optional-null max4096, opaque signed. Giữ nguyên
  session/actor/auth snapshot/import/mapping_revision/sheet/review/status/details/
  limit cho mọi page. next_cursor=null kết thúc filtered list. Khi revision đổi,
  binding mismatch thường422 INVALID_CURSOR; fingerprint đổi409 LIST_VERSION_CHANGED.
  Drop cursor và đọc lại trang đầu; không merge pages khác revision. Nếu FE cần
  local state histogram, đọc **toàn** unfiltered queue `review_only=false`, không
  dùng trang đầu/filtered page; đó là client-derived display, không server filter_counts.

M03 `GET /api/v1/imports/{import_id}/sheets/{sheet_id}/field-options`:

- `schema` selected sheet type hoặc inferred unique target domain, nullable;
  `schema_version=import_schema/1`; schema_context_id chính sheet_id. optional mapping_id
  phải thuộc sheet; không cần FE nhớ schema theo UUID.
- `options[]` là current sheet choices; `schemas[]` full supported catalogue9
  schema có schema_id/label/description/supported=true/fields[]. Field key là identity,
  label/aliases chỉ hiển thị. Không backend category enum/order guarantee; không search,
  paging hoặc cursor. M03 response đầy đủ cho context, không cần gọi page tiếp.
- FieldOption: key/type/requiredness/unit_semantics/support/available/reason_code/
  label/description/aliases/conditional_requirements/nullable/input_sources/
  allowed_shared_scopes/input_help/value_role; exact enums ở catalogue. `type` và
  unit_semantics là strings, không tự phát minh compatible-types enum. Requiredness
  required|optional khác nullable; required-nullable vẫn cần declaration/cột/value.
- Target unique trong **sheet**, cùng target ở sheet khác độc lập. Ngoại trừ current
  mapping_id, target đã dùng bị available=false/TARGET_ALREADY_BOUND; M04 duplicate
  là409 DUPLICATE_MAPPING. Shared-vs-column conflicts kiểm thêm tại M04. Catalogue
  schema fields không tự mang availability của sheet; dùng options[].available.
  SOURCE_MODELS/descriptors là field authority; không suy missing thành0 hay sinh
  UUID canonical từ label. Không guarantee mọi source field trở thành DB column.

## M04 union, approval và refresh

`PATCH /api/v1/imports/{import_id}/mappings/{mapping_id}` nhận top union không
discriminator `{target_field}` **hoặc** `{resolution:{kind:…}}`; union resolution
discriminator `kind` gồm đúng7 variants. Không body import_id/actor_id/revision.

| Variant | Required payload và constraint chính | Issue/context hợp lệ |
| --- | --- | --- |
| TargetRequest | target_field strict string1..128 | column; target thuộc current schema, support/availability hợp lệ |
| sheet_type | kind, sheet_type enum9 hoặc null **required**, reason nonblank1..1000; ignored/acknowledgment defaultfalse | classification; ignored iff sheet_type=null; IGNORE cần acknowledgment=true |
| source_context | kind, source_system_key/report_type Code1..128 pattern namespace, evidence_reference1..1000 | source_context; optional-null semantics/format/expiry rule; period amendments typed arrays unique IDs |
| identity_binding | kind, canonical_id UUID | identity; đúng entity/code, existing same Store hoặc approved/reserved local proposal, không global identity lookup |
| declared_conversion | kind, from_unit/to_unit1..32, factor.numerator/denominator unsigned decimal text max200 và >0, evidence_reference | conversion; from_unit=issue source_header/to_unit=issue.samples[-1], không đoán conversion |
| ignored_optional_field | kind, evidence_reference nonblank1..1000 | column; proposal ignored optional binding; không ignore business-required fact để vượt validation |
| new_entity_proposal | kind, entity product/ingredient/supplier, source_business_key nonblank1..1000, typed metadata, evidence_reference | identity cùng entity/key; không new lot; metadata discriminator được kiểm liên trường, chưa canonical insert |
| shared_value | kind, target_field1..128, scope PROFILE_CONSTANT/IMPORT_VALUE, value strict scalar/null **required**, evidence_reference; optional replace_source_column_index0..255/null + acknowledgment | selected nonignored sheet và target allowlist; source switch đúng index + acktrue; conflicting sources409 FIELD_SOURCE_CONFLICT |

SourceContext optional sales_semantics daily_total/disjoint_contribution,
inventory_semantics lot_stock_count, decimal_locale dot/comma, date_format
ISO/DMY_SLASH/MDY_SLASH, pack_cost_basis PER_PACK/PER_SOURCE_UNIT,
planned_arrival_expiry_rule `{basis:ARRIVAL_PLUS_DECLARED_SHELF_LIFE_DAYS,evidence_reference}`.
term_period_amendments `{supplier_term_id,expected_version,effective_to,reason}`;
fee_period_amendments `{fee_id,expected_version,effective_to,reason}`. Period closing
phải explicit Owner-reviewed policy, không auto-close historical periods.

Shared scalar union strict string≤1000/bool/int32/null; type/nullability kiểm theo
SOURCE_MODELS và target-scope allowlist. PROFILE_CONSTANT vào immutable approved
ProfileSpec; IMPORT_VALUE profile chỉ giữ requirement, value thuộc batch/sheet và
phải khai báo lại mỗi import. `false`, `0`, `null` là ba giá trị khác nhau; date/decimal
lexical normalization/downstream validations vẫn áp dụng. Example request thành công
DTO không chứng minh mọi target/value/context sẽ được runtime chấp nhận.

M04 response200 MappingUpdated: mapping_id/status **string**, mapping_revision,
progress, sheets, proposal_revision **required nullable**, approval_required.
ETag/mapping_revision không phải import revision. M04 cập nhật cả batch mapping và
import revision; response không trả import_revision. Classification/column edits
trên reused binding fork proposal, không mutate approved version. Staff whole-sheet
IGNORE trên **own batch** với mapping.propose + sensitive reads và acknowledgment/
reason không cần N5; other actor's batch bị403. IGNORE invalidates preview/confirmation,
không biến approved profile thành ignored policy. Optional-field ignored proposal
vẫn cần Owner-approved spec. Quyết định CA-020 đã duyệt, không mở lại.

N5 `POST /api/v1/stores/{store_id}/mapping-profiles/{profile_id}/decisions` Owner-only:
approve_activate `{decision,proposal_revision,expected_active_version:Version|null,
reason}` (expected_active_version required nullable), reject `{decision,proposal_revision,
reason}`, retire `{decision,active_version,reason}`. Discriminator decision. If-Match
**lifecycle_revision**, không mapping/import/proposal revision; proposal/active body
CAS kiểm thêm. Response200 profile_id/approved_version nullable/active_version
nullable/lifecycle_revision/decision_id/decided_at/audit_id. Owner phải đủ full
proposed evidence và missing_fields rỗng; runtime unresolved409. Matching approved
reuse không cần approve lại; version retirement chặn uncommitted pins, không xóa receipt.

Read-after-write: giữ nguyên submitted key/body/original If-Match để reconcile retry.
Sau200 M04 đọc M01 `include_clean_sheets=true&include_profile_details=true`, M02 trang
đầu unfiltered, M03 từng changed sheet/current mapping, rồi I04 để lấy **import** ETag/
active_job_id/allowed_actions. N5 refresh M01/M02/M03/I04 tương tự. Proposal version
mới dùng N5 với lifecycle CAS mới; không dùng M04 ETag ở N5/I05. 412 refresh object
đúng scope, review changes, mới tạo intent/key khác khi intent thay đổi. 409 xử lý
theo code: active job → poll/read; key reused → restore original intent; stale preview/
retired pin → refresh/review/repreview; incomplete mapping → resolve/Owner approval.
Không auto re-submit business mutation với token mới nếu chưa review.

## Permission/approval/blocker matrix

CURRENT FACT: quyền Store hiện tại kiểm từng read/write/replay và worker; Staff
không có quyền ngầm. Owner current Store membership có catalogue, N5 riêng Owner-only.
Sensitive reads dùng captured domain READS; khi schema/target còn unknown cần toàn
ALL_READS = menu.read, ingredient.read, recipe.read, sales.read, inventory.read,
supplier.read, procurement.cost.read, budget.read. Known scope declarations dùng
subtype reads theo code. Đây là permission-sensitive projection, không grant UI.

| Issue/action | Endpoint | Current permission (cộng sensitive reads) | Owner approval | Blocker/gate preview → confirm → commit |
| --- | --- | --- | --- | --- |
| Read queue/options/spec | M01–M03 | mapping.read | Không | Missing rights403; analysis chưa ready409; không trả partial data trái quyền |
| Classify/source context/column/identity/conversion/new entity/optional ignored/profile constant | M04 | mapping.propose | Changed reusable spec cần N5 Owner | unresolved → UNRESOLVED_REQUIRED_FIELDS; binding chưa approved → OWNER_MAPPING_APPROVAL_REQUIRED; then PREVIEW_BLOCKED/stale at later phases |
| Staff own-batch whole-sheet IGNORE | M04 sheet_type null + acktrue | mapping.propose; own batch for Staff | Không cần separate N5 | Không thêm ignored status; empty active data → NO_DATA_ROWS; remove pin/invalidate confirmation |
| Value dưới approved IMPORT_VALUE rule | M04 shared_value | mapping.propose | Không nếu chỉ per-import value dưới approved rule | Missing → MISSING_IMPORT_VALUE; edit → new preview/review; change requirement/spec vẫn N5 |
| Resolve schema_blocker | M04 theo supported classifier/field context | mapping.propose | Tùy thay spec | Không generic schema_blocker resolution kind; unsupported domain/invalid data phải sửa input/context, không bypass |
| Activate/reject/retire profile | N5 | Owner-only current membership | Chính N5 là approval | Missing fields409; lifecycle/proposal/active CAS412; retired pin → MAPPING_VERSION_RETIRED/stale |
| Preview accept | I05 phase preview | import.preview | All active sheet bindings approved | No unresolved/retired/missing values; worker validate business facts; preview có thể ready/blocked/confirmation_required, không grant write |
| Per-import review | I05 confirm_review | import.commit + ALL summary.required_actions | Không thêm Owner-only rule | Required rights403; blockers409 PREVIEW_BLOCKED; stale source/bindings/read-set409 PREVIEW_STALE |
| products / ingredients | I05 commit | import.commit + product.create / ingredient.create | New profile/entity reservation đã N5, executor không nhất thiết Owner | Unsupported/invalid/changed read-set block cả batch; NO_OP vẫn required_actions theo groups |
| sales insert / replacement / merge | I05 commit | sales.record; replacement thêm sales.correct; merge thêm sales.merge | Profile semantics N5; executor theo grants | Exact replacement/merge row resolutions; overlap409; reason422; không replace bằng additive |
| recipes | I05 commit | recipe.create_version (+ ingredients.create khi reserved ingredient) | Reviewed mapping/entity proposals N5 | Invalid unit/date/BOM/overlap block; không recipe scheduling override implicit |
| inventory_count | I05 commit | inventory.count.correct | Mapping policy N5 | Explicit observed count/reason/scope; count correction ≠ receipt; missing ≠0; zero delta no movement |
| suppliers | I05 commit | supplier.create | New/resolved policy N5 | Source identity/current state checks; all atomic |
| supplier_terms / AMEND_TERM_PERIOD | I05 commit | supplier.terms.create; amendment thêm supplier.terms.correct | Exact period amendment rule N5 | CHANGED/AMEND required supplier_changes set; reason; expected version/read-set stale block |
| payable_fees / AMEND_FEE_PERIOD | I05 commit | supplier.fees.manage | Explicit fee period/coverage N5 | Exact confirmations + reason; unsupported fee rules block, null không unlimited/NONE |
| scope_declarations INVENTORY / SALES_COVERAGE / PROCUREMENT_CONTEXT | I05 commit | inventory.count.correct / sales.record / (supplier.fees.manage + budget.read) | Typed declarations in reviewed policy | Freshness/coverage/dependency state; không fill missing thành fact |
| Retained completion / Import job | I06/J01 | import.read + sensitive reads | Không | Current rights dù replay/retained; receipt integrity409; foreign resource scope-safe404 |
| Current action readiness | R01 | ACTION_READS requested union | Không | import:import.read; menu:menu.read; inventory:inventory.read+ingredient.read; forecast:planning.context.read+sales.read; planning:planning.context.read+budget.read+procurement.cost.read; whole-response denial |

summary.required_actions là authority cho **batch thực**, gồm group rights và
row.required_permissions. FE không rebuild bằng matrix để bypass list. Worker
recheck current actor/session/Store grants/full write set và pinned read-set trước
transaction. Approve profile không tạo current permission hay one-time execution token.

## Pinned preview, includes và paging

I05 preview request `{phase:preview,mapping_revision}` + import If-Match →202
PreviewAccepted import_id/status=previewing/phase/job_id/job_status=queued/
import_revision; meta.poll_after_ms=2000. Poll J01 queued/running theo2000ms; terminal0.
Completed job result `{resource_type:import_preview,resource_id:import_id,preview_id}`;
I04 mới là retained preview read, không parser/worker/solver execution trong GET.

| I04 query | Hành vi runtime |
| --- | --- |
| không include và include_preview=false | metadata/files/source_set/actions; preview null; confirmation có thể được trả và nội bộ kiểm pin dù preview không expose |
| include_preview=true | preview object; chọn preview_id nếu có, nếu không latest retained preview; chưa preview →409 PREVIEW_NOT_AVAILABLE |
| include=preview | Tương đương include_preview=true; explicit include_preview=false không override include |
| include=configurations | configurations projection; chưa preview nhưng analysis có →basis=analysis, NOT_PREVIEWED cells, preview_id/digest null; chưa analysis →409 ANALYSIS_NOT_READY |
| include=configurations,preview hoặc preview,configurations | preview + configurations từ cùng row page/pin |
| include=configurations với include_preview=true | Như kết hợp ở trên |
| preview_id với preview/configurations requested | Pin exact retained preview trong import; không có →409 PREVIEW_NOT_AVAILABLE, không silently latest |
| preview_id đơn lẻ không include, chưa confirmation | Không kích hoạt preview lookup, preview=null; **không dùng để chứng minh pinned review** |
| preview_id đơn lẻ khi confirmation đã có | Nội bộ lookup để kiểm confirmation/pin; preview vẫn null; nếu pin không tồn tại409 |

Include chỉ allow4 enum strings trên; không `all`, không repeated include query,
unknown query422. `preview_id` là UUID optional-null; classification enum5/null;
files_limit/rows_limit default50,1..100; cursors optional max4096. `rows_cursor`
không tự enable projection. Không `actions_cursor` hoặc riêng action list endpoint.

PreviewPage: summary + rows[] + rows_page + stale. Summary immutable id/digest/
created_at/source_set_version/mapping_bindings/policy_version/mode=atomic/
validation_status/required_actions/groups/counts/blockers/warnings; can_commit
**current projection** của allowed_actions, không immutable durable guarantee;
confirmed_resolutions_version=null. Counts NEW/UNCHANGED/CHANGED/INVALID/CONFLICT
trên logical actions toàn preview, recipe grouped/synthetic entity actions có thể
khác raw Excel rows. Groups canonical_domain/required_write_action/row_count/
planned_insert_count/planned_update_count/no_op_count/blocked_count.

PreviewRow: row_id/source_location/classification/proposed_action/entity_refs/
before/after/changes/provenance/blockers/warnings/confirmation_required và optional
source_locations/line_provenance/nested_provenance/nested_references/dependencies/
canonical_domain/target_reserved_or_existing_id/expected_version/
normalized_source_quantity/required_permissions. before/after nullable union
**discriminator domain** chín domains; recipes after RecipeValue có lines[].
proposed_action là string, không enum exhaustive do FE tự giới hạn.
Public entity_refs là object product_id/ingredient_id/lot_id/supplier_id/
supplier_term_id/fee_id nullable, ingredient_ids[]; public provenance là map field→
ProvenanceValue, không internal list FieldProvenance. Origin enum5, rule IDs,
value_source SOURCE_COLUMN/PROFILE_CONSTANT/IMPORT_VALUE/IDENTITY_BINDING,
source_column_index/declaration_id optional-null. Changes before/after strings/null,
không tự convert Money/Quantity qua JS number.

Notice exact code/severity/message với optional-null field/entity/impact/source_location;
**không Notice.details**. Recipe multiline/nested configuration provenance giữ path+
source identities. Input Money18 integer/18 fractional digits; retained legacy output
cho wider exact decimal≤200 ký tự là read-only exception, không input bypass.
Pending oversized legacy Money commit409 LEGACY_MONEY_REVIEW_REQUIRED; namespace
Code1..128 khác business key1..1000. Canonical date ISO, aware timestamp required.

I04 top-level store_id/data_date/import_revision/file_set_version/source_set.digest/
sealed/accepted_file_ids + preview bindings/digest xác định nguồn. ReviewConfirmation
exposes source_digest/binding_digest/read_set_digest/reviewed_import_revision; full
DB read_set/source_files/reviewed_sheets/reviewed_mappings/config inputs nằm immutable
internal ImportPreview content, **không field public read_set object**. M01 analysis_id
liên kết analysis; đừng đòi preview.analysis_id/store_id duplicate chưa expose.
I04 configurations gồm suppliers/terms/fees/declarations typed payload/provenance/
canonical_id/version/source_identity/state staged|committed/expected_before_version,
preview_id/digest/blocked_row_ids/rows_page/analysis_rows/basis/stale. Đây là projection
từ cùng row page, không complete Store configuration list.

Để complete review: giữ import_id, preview_id/digest, mapping bindings, source version,
classification/filter/rows_limit/session; tải rows_page.next_cursor đến null và ghép
row_id không trùng. Không classification filter để đánh giá cả batch; filtered
total_count không tổng batch. Ghép configurations theo cùng pin/page, blocked_row_ids
chỉ page projection. Files có files_page riêng; đọc đến null nếu cần all file metadata.
Summary toàn preview không thay thế all rows khi executor cần exact confirmation
sets. Revision/auth change/409/422 cursor → discard pages, refresh/review từ đầu.

Mapping/source-context/classification/shared-value changes/new preview clear hoặc
invalidate confirmation. Captured canonical read-set change/retired pinned profile/
lost current rights → stale/unusable; immutable preview không bị recompute/overwrite.
Active pointer/version mới không tự migrate old authorized pin còn hợp lệ.

## Preview → confirm_review → commit → completion

1. Sau analyze job completed, M01/M02/M03 đọc complete mapping; resolve với M04.
   Owner N5 duyệt full new spec khi cần; approved exact reuse giữ version.
2. I04 lấy current import ETag; M01 lấy mapping_revision. I05 preview202; retain
   accepted job_id/revision, poll J01 đến terminal; failed thì đọc error và I04,
   không đi tiếp. Job result preview_id dùng I04 pinned read và all row pages.
3. Review full retained rows/configurations/warnings/bindings, kiểm stale=false/
   allowed_actions/required_actions. I05 confirm_review request required phase,
   preview_id/digest,mapping_revision,confirm **true**,reason nonblank1..1000 với
   latest I04 import If-Match và key riêng phase. Response200 ConfirmationResult
   phase/import_revision/confirmation/canonical_commit_supported. Confirmation
   có confirmation_id/import_id/preview/file-set/source/mapping/binding/read-set/
   reviewed_import_revision/confirmed_by/time/reason/content_digest/version.
   Đây là reviewed evidence, không canonical writes; can_commit không được suy từ200.
4. Refresh I04 pinned view, dùng **new import ETag từ confirmation**, confirmation_usable
   và allowed_actions. CommitRequest phase commit/preview_id/digest/confirm true/
   resolutions **required**; reason optional-null chỉ insert/NO_OP; supplier_changes
   optional default[]. Không gửi confirmation_id/digest hoặc nested confirmations:
   backend lấy retained confirmation và đối chiếu exact pins. Conditional global
   reason bắt buộc cho REPLACE_DAILY_TOTAL/MERGE_DISJOINT_SALES/COUNT_CORRECTION/
   AMEND_TERM_PERIOD/AMEND_FEE_PERIOD. Action/source reason riêng không thay global
   reason khi action cần, review reason cũng không thay action confirmation.
5. resolutions phải exact set sales row_id cần confirm. Mỗi item required row_id,
   action replace_daily_total|confirm_disjoint_merge,report_business_key,
   evidence_reference,reason,disjoint_assertion **required nullable**. Merge cầntrue;
   replacement không true (null hoặc false). supplier_changes exact set term/fee
   row_id cần confirmation: `{action_id:PreviewRow.row_id,reason}`; không profile_id/
   term_id/version làm action_id. expected_version nằm retained row/source amendment
   rule; không thêm vào SupplierConfirmation. Duplicate/missing/extra sets422
   INVALID_IMPORT_CONFIGURATION; mismatched semantics409 SALES_OVERLAP_UNRESOLVED.
6. Commit202 CommitAccepted import_id/status=committing/phase/job_id/job_status=queued/
   commit_id/preview_id/effective_plan_digest/import_revision. Replay same original
   key/body/CAS trả **cùng data**, cùng ETag/status202, không tạo job/commit thứ hai;
   outer meta.request_id và X-Request-ID là request mới. Current auth/full write
   rights vẫn kiểm cả acceptance replay lẫn worker. No canonical synchronous commit200.
7. J01 terminal completed result resource_type=import_completion/resource_id=import_id/
   commit_id. I04 completion_available/status rồi I06 GET durable receipt; so khớp
   import_id/commit_id/preview_id/effective_plan_digest. **HTTP202 không durable success.**
   Transaction canonical writes/audit/completion/job success atomic; fresh-session
   receipt reconciliation sau lost commit ACK không ghi lại transaction.

I06 data không có job_id/acceptance request key/request_id; linkage đi qua J01 result
và accepted CommitAccepted. Envelope meta.request_id là I06 read request. Completion
required fields: status completed|completed_with_warnings, outcome committed|no_changes,
data_date/mode/completed_at/commit_id/preview_id/effective_plan_digest/mapping_bindings/
summary/updated_resources/readiness/audit_reference/canonical_references.
Summary files/sheets/rows/mapped_fields/errors **literal0**/warnings/counts/
inserted_record_count/changed_record_count/no_op_count; raw rows khác logical counts.
updated_resources inventory/menu/sales/catalog/suppliers/terms/fees/declarations
phản ánh **receipt transaction**, không Store totals. inventory/menu nullable impact
counts preserve null; sales/catalog/config counts có actual ints/defaults. no_changes
có thể chứa UNCHANGED/no_op_count >0, không mọi count bằng0; updated=false, không
fabricated delta0 movement. Missing không tự suy0. Warnings status hiện dựa preview
summary warnings; readiness warnings riêng không tự đổi completion status.

`data.readiness.{actions,evaluated_actions,omitted_actions}` đúng vị trí;
omitted items `{action,reason:NOT_AUTHORIZED}`. I06 readiness point-in-time sau write,
không recompute theo current data. Legacy retained projection có thể unknown/
NOT_ASSESSED; không rewrite receipt. R01 current readiness dùng action list CSV
import/menu/inventory/forecast/planning; duplicate/empty/unknown action422;
forecast_start_date chỉ khi forecast/planning requested. Action DTO availability/
can_execute/data_status/execution_status/blockers/warnings/result_assessment;
Issue.details hiện empty typed object. Current data_version/source_versions gồm
catalog/recipes/inventory/sales/suppliers/fees/declarations/planning_config/model_config;
scope_estimate/history_watermark nullable; known data≠execution available và chưa
ASSESS computation. Đừng đánh đồng import success với planning-ready.

Examples đầy đủ và validation receipts: [README](004_import_flow/examples/README_VI.md),
[index](004_import_flow/examples/VALIDATION.json). Tất cả là **schema-validated synthetic
example**, không live trace/customer data. Mixed sales+supplier request được đối chiếu
exact row IDs trong paired synthetic preview và pure commit_rows validator; không
chứng minh writer acceptance/persistence của bộ input ấy. Digest strings là synthetic
opaque placeholders, không digest cryptographically computed từ dataset.

## Error schemas, status và reconciliation

Exact per-operation status sets và root schemas ở §E; route declarations Import
400/401/403/404/409/412/413/415/422/428/503 là published alternatives, không khẳng
định mỗi code xảy ra trên mọi surface. Source direct-error inventory có file/line
tại [use_case_errors.json](004_import_flow/evidence/use_case_errors.json).

| HTTP/domain code | Current typed details | FE handling |
| --- | --- | --- |
| 428 PRECONDITION_REQUIRED | ErrorDetails chỉ approval_request_allowed=false | Missing If-Match sau key validation; fetch đúng resource ETag |
| 412 MAPPING_REVISION_CONFLICT / IMPORT_REVISION_CONFLICT / PROFILE_REVISION_CONFLICT | Không expected/current revision fields | Refresh đúng scope; không dùng error.details để construct new token |
| 409 IDEMPOTENCY_KEY_REUSED / IMPORT_STATE_CONFLICT | Không receipt lookup URL/details | Restore original intent hoặc I04/J01/I06 reconcile; không blind key mới |
| 409 PREVIEW_STALE / PREVIEW_BLOCKED / MAPPING_VERSION_RETIRED / OWNER_MAPPING_APPROVAL_REQUIRED / UNRESOLVED_REQUIRED_FIELDS / MISSING_IMPORT_VALUE / NO_DATA_ROWS | Không automatic approval request | M01/I04 blockers + pinned rows, sửa proposal/value/review khi cần |
| 409 DUPLICATE_MAPPING / FIELD_SOURCE_CONFLICT / SOURCE_CONTEXT_CONFLICT / SOURCE_IDENTITY_CONFLICT / PROFILE_MATCH_AMBIGUOUS / SOURCE_INTEGRITY_ERROR | Không candidates hoặc arbitrary details | Refresh M01/M02/M03, explicit context/evidence; integrity error không retry mutation tự động |
| 409 PREVIEW_NOT_AVAILABLE / ANALYSIS_NOT_READY / IMPORT_NOT_COMPLETED / LIST_VERSION_CHANGED | Không missing-state payload | I04/current job; reset cursor hoặc wait terminal thích hợp |
| 409 SALES_OVERLAP_UNRESOLVED / SCHEMA_BLOCKED / LEGACY_MONEY_REVIEW_REQUIRED | Không field_errors | Xem typed row/provenance; exact confirmation/money/domain input cần review |
| 422 INVALID_MAPPING_TARGET / INVALID_IMPORT_CONFIGURATION / COMMIT_REASON_REQUIRED / VALIDATION_ERROR / INVALID_FILTER / INVALID_CURSOR | Không Pydantic loc/errors passthrough | Match schema/issue/context, hiển thị code; no invented field error array |
| 400 INVALID_REQUEST,413 RESOURCE_LIMIT_EXCEEDED,415 unsupported content type | ErrorDetails như trên | Fix transport/byte budget; variants theo router/handler |
| 401 UNAUTHENTICATED;403 PERMISSION_DENIED / CSRF_CHECK_FAILED;404 RESOURCE_NOT_FOUND;503 SERVICE_UNAVAILABLE | Không exposed membership/provider/database diagnostics | Re-auth/current Store/grants/CSRF; 404 scope-safe,503 uncertain outcome phải reconcile |
| J01 HTTP200 status failed | JobErrorDetails source_locations[]/blockers[]/approval_request_allowed=false | Terminal failure UI, no optimistic Result; generic IMPORT_EXECUTION_ERROR hoặc domain/parse/interruption code |

Không nói “mọi missing guard428”: missing/malformed UUID key tại `_request` là422
VALIDATION_ERROR; Origin denial có thể403 trước guard; malformed/nonquoted/weak/
wildcard/multi-token If-Match422, missing CAS428 khi key hợp lệ. Header oversize
Pydantic trên Import hiện generic422. Reason validation/cross-field errors không
expose detailed loc. R01 wrong requested union403 whole response; authorization
version race409 SNAPSHOT_NOT_AVAILABLE. Generic auth error `message` hiện bằng code.
Auth/session errors có Retry-After nếu auth error đặt; Import không tự polling retry
mutation bằng header đó. Idempotency scope actor+Store+resource operation (I05 phase
riêng), request digest normalized DTO body **và original unquoted CAS**. Same key với
CAS mới bị409 dù body giống; auth recheck trước retained replay và trước stale CAS.

## Resume/discovery và lost-response read order

FE biết import_id sau reload nếu URL/query/deep-link giữ **identifier locator** hoặc
người dùng chọn H02 item. URL convention là FE routing, không backend endpoint
`resume`/reopen mutation. Current FE checkout ImportWorkspace giữ workflow trong
useState và ghi rõ refresh/leaving destroys memory; HistoryList chỉ cards/pagination,
không link resume. Các importFlow.* file trong #004 và `003-import-flow-integration.md`
không có trong supplied checkout. Vì vậy audit không xác nhận M08 adapters/controlled
checks mới ở repo FE khác; cần đồng bộ đúng FE snapshot trước implementation review.

H01 `/api/v1/stores/{store_id}/imports/calendar?month=YYYY-MM` giúp chọn ngày;
H02 `/api/v1/stores/{store_id}/imports?import_date=YYYY-MM-DD` bắt buộc **ngày first
accepted upload theo Store timezone**, không data_date/created_at. Filter status
in_progress/completed/completed_with_warnings/failed, category sales/inventory/recipes/
supplier, q filename; limit1..100/cursor, sort=-imported_at. in_progress gộp mọi
nonterminal stages; H02 không auto-transition/reopen completed batch. Nó có import_id/
display_number/data_date/imported_at/file_count/status; I04 đọc canonical state/actions.

Draft chưa first accepted upload (kể cả rejected-only upload) không có imported_at
và **không discover bằng H01/H02**; không list all active drafts hoặc by latest actor
route. Nếu import_id từ I01 chưa giữ locator và create response mất cả intent/key,
không có generic key search API để tìm draft. I01 exact key/body replay có thể
recover ID khi original intent còn. H02 chỉ date/Store scope; tháng/ngày cần lựa chọn;
≤1000 batches/window rồi413, không global cross-date discovery. Whole response deny
khi bất kỳ retained batch trong date window không đủ sensitive rights, không trả
partial authorized-only list hay counts leak. q/category còn yêu cầu accepted-file
match, do đó không được mặc định một empty history nghĩa không có draft.

Backend recovery recipe khi **đã có ID**:

1. Re-auth/A03/T02 correct Store/current rights, GET I04 metadata; never overwrite
   remote workflow bằng local draft state. Khi permission-denied của retained confirmation
   sensitive projection, hiển thị quyền hiện tại, không downgrade request để bypass.
2. I04 active_job_id không null → J01 với ID đó; queued/running poll2000ms,
   completed đọc resource_type; failed giữ code/location và refresh I04. `active_job_id`
   bị clear sau terminal, nên giữ accepted job_id là useful locator, không canonical truth.
3. Sau lost preview response: exact same-key/body/original CAS replay để lấy accepted
   job nếu còn intent; I04 active job trước; terminal preview dùng J01 result.preview_id
   hoặc I04 include=preview latest khi ID mất. Pin exact returned id/digest, rồi
   M01 full/mapping queue khi state review_required hoặc cần verify current binding.
4. Sau lost confirm response: I04 include=preview (& preview_id nếu biết) trả
   review_confirmation/confirmation_usable; đối chiếu import/preview/digest/mapping/
   source/bindings và current actions. Replay original intent để lấy same confirmation;
   không dựa on missing HTTP200 để kết luận không confirmed. Refresh import revision
   riêng cho **intent commit mới**, không thay header của retry confirm cũ.
5. Sau lost commit response: I04 → nếu completion_available thì I06; nếu active job
   thì J01; nếu known job completed thì verify result.commit_id với I06. Exact replay
   original key/body/CAS lấy old CommitAccepted ngay cả sau durable completion nếu
   rights còn. Server receipt/worker reconciliation chứng minh lost ACK sau commit
   sẽ đọc completion đã ghi, không duplicate. Nếu job failed rồi I06409, chưa có
   successful receipt: resolve error/repreview/review khi cần và explicit new retry,
   không gọi commit blind. Với I04 status ambiguously changed và không original job
   locator/intent, refresh retained state; không có backend list-all jobs-for-import.
6. Sau durable success, I06 immutable receipt/readiness/audit/canonical refs là Result;
   R01 là current readiness cho hành động tiếp theo, không mutate retained Result.

Retain locator IDs import_id/store_id/job_id/preview_id; pins preview digest/file-set/
mapping bindings/version/content_digest/confirmation content_digest/read_set_digest,
commit_id/effective_plan_digest để đối chiếu. Canonical source phải từ fresh authorized
reads; không localStorage workflow cache thành business truth. Có thể thiết kế FE
deep-link locator nhưng **chưa implemented/browser accepted** trong checkout này.

Không published time TTL/cleanup-expiry cho Import batch/preview/confirmation/receipt/
job trong current models/usecases; không tự ghi “7days/30days”. Usability phụ thuộc
state/pins/current rights, không đơn giản thời gian. Session timeout/cookie expiry
là auth lifecycle riêng, không retention promise của artifacts; cursor session-bound,
không dùng cursor cũ sau re-login. Local explicit reset/disposable reseed xóa generation
và old IDs/accounts không còn; không SLA permanent retention. recover() hiện chỉ
operator/worker proof process identity DEAD → failed IMPORT_EXECUTOR_INTERRUPTED,
không elapsed timeout auto-rerun hay public FE recovery mutation.

## FE đang dùng thông tin cũ

- S4.5/S4.6 “chưa bắt đầu” chỉ lịch sử: current supports atomic chín domains,
  confirmation, canonical receipt và impacts; R01/readiness đã S4.8, History/PDF S4.10.
- localhost:8000 refusal chỉ sai/unreachable target trước đó, không evidence nghiệp
  vụ BE fail. Dedicated local integration base18001, public FE config api mode;
  chưa kiểm reachable lượt này, không shared/remote staging. Post-reset old sessions invalid.
- Thiếu confirm_review trong FE sequence phải sửa; separate phase200 rồi commit202;
  commit202/job có trong baseline design, không mô tả là API async đổi mới.
- Staff own whole-sheet IGNORE accepted exception CA-020; optional-field ignored
  reusable rule và profile activation vẫn Owner. Không tạo sixth ignored status,
  Manager role/one-time approval hoặc mở lại accepted product decision.
- `filter_counts`, candidates, nested confirmations.supplier_changes, receipt job_id,
  Notice.details, files[].sheets không current wire. Không thêm speculative fields
  vào runtime validator. Editorial generic import CAS trên mapping phải nhường
  precise M04 mapping CAS và actual code; authoritative docs không bị sửa trong audit.

## Gap thật cần xử lý

| Gap / phân loại | Bằng chứng và ảnh hưởng | Action đề xuất, chưa thực hiện |
| --- | --- | --- |
| FE continuation/resume UI — integration gap CURRENT FACT | Current ImportWorkspace upload/analyze, HistoryList không re-entry; supplied #004 references importFlow files absent | Sync đúng FE M08 snapshot rồi adapter/validation/re-entry work theo published schemas; không claim browser completion |
| Never-uploaded draft discovery — unsupported capability | H01/H02 filter ImportBatch.imported_at, no active-draft listing | FE retain locator + exact create intent/replay where possible; nếu cần server discovery rộng, propose scope/policy riêng, không tự thêm route |
| M02 per-state filter counts/candidates — wire expectation gap | MappingList.counts:Progress toàn batch; MappingIssue không candidates/reason collections | FE dùng current3 counters; complete unfiltered traversal cho local display khi cần; backend richer shape chỉ proposal sau approval |
| include_details / full computed profile diff — documentation ambiguity | M02 details chỉ cursor binding; M01 full spec nhưng không diff DTO | FE không dựa flag để đánh giá detail completeness; review full specs; proposal docs clarification nếu yêu cầu payload diff cụ thể |
| Typed errors nghèo chi tiết — current capability limit | auth.ErrorDetails chỉ literalFalse; main.failure generic code/message; Notice không details; readiness details={} | FE show code + read fresh state/row diagnostics; nếu cần field/CAS details, đề xuất typed accepted extension, chưa sửa source/policy |
| M03 runtime endpoint verification — evidence gap | Chỉ tìm thấy API schema inventory assertions, không endpoint HTTP invocation trong selected tests | Future targeted HTTP/auth/availability/uniqueness acceptance, không đánh đồng generated descriptor example với HTTP PASS |
| Stale exact-route auth test — test inventory debt | Prior audit executed 9passed/1failed; tests/api/test_auth_openapi.py:23 chưa 6 S410 paths, current OpenAPI=v2 | Follow-up cập nhật expected inventory theo current contract; không source/test edit và không rerun trong lượt này |
| Whole-chain browser acceptance — verification gap | S411 PARTIAL, existing9 gates chỉ existing screens; after latest reset browser NOT_RUN | Build required UI và chạy native full chain ở authorized follow-up; API E2E/existing-screen PASS không substitute |
| Full-source equality after v2 — evidence limit | Consumer ZIP không full checkout hash manifest | Exact current OpenAPI=v2 được chứng minh; không claim all source untouched from v2 publication |

Không tìm bằng chứng cần triển khai lại mapping/commit/readiness BE để unblock
current continuation. Core việc trước mắt là **đồng bộ exact schemas/workflow với FE**.
Follow-up implementation cần FE continuation/resume và verification; BE discovery/
rich errors/counts chỉ cần nếu sản phẩm yêu cầu capability hiện chưa có, phải freeze
accepted scope riêng. Audit không kết luận full contract conformance hay S4.11 COMPLETE.

## Executed evidence và limits

E46 mapping/approval historical completed tests ngày11/10, PowerShell backend,
`.venv/Scripts/python.exe`, PostgreSQL local `shelfcash_test` theo guarded fixtures:

```text
-m pytest tests/integration/test_import_staging.py tests/integration/test_import_classification.py tests/integration/test_import_field_value_bindings.py tests/integration/test_import_batch_mechanics.py tests/api/test_auth_openapi.py tests/api/test_staff_openapi.py -q --tb=short --show-capture=no --maxfail=2
61 passed / 127.98s
```

E46 canonical mixed domains historical completed critical gate có
test_import_inventory_supplier.py/test_import_commit.py/test_import_openapi.py và
affected writers/readers: **105 passed/200.60s**, exact long command tại
[S46 notes](../runbooks/S46_TASK_NOTES.md). Mapping route-specific assertions:
test_sales_staging_owner_approval_preview_and_fresh_sessions,
test_staff_proposes_context_owner_only_approval_and_current_revoke,
test_owner_decision_compare_and_swap_race_is_atomic;
M02 đọc trong shared resolve helper và classification tests. M03 chỉ OpenAPI assertion
test_import_operations_and_typed_variants_preserve_boundaries, không gọi actual GET.

E45 ngày10/10 historical: [S45 notes](../runbooks/S45_TASK_NOTES.md) gate10
47passed/1failed provenance assertion; affected single failed selector rerun
test_disjoint_source_retry_revision_205_to_210_and_daily_total_mix_blocked **1passed/5.47s**;
gate12 commit replay/current rights và reserved dependency **3passed/7.69s**.
Không biến mixed failed aggregate thành toàn PASS. Current test selectors còn có
test_http_commit_fresh_rows_retained_completion_and_same_key_retry,
test_uncertain_commit_after_durable_write_reconciles_without_repeat,
test_mixed_commit_lost_ack_is_reconciled_and_public_count_scope_invalidates_on_new_lot,
test_future_terms_and_fee_changes_require_exact_owner_amendments_and_executor_confirmation
(latter two trong E46 gate); source test presence chỉ mô tả selected coverage,
completed results phải đọc notes tương ứng.

E47 ngày11/10: [S47 notes](../runbooks/S47_TASK_NOTES.md) final audit/remediation
coverage Staff own-sheet IGNORE/current rights/conditional reason/Money; earlier affected
audit/write group46passed151.91s; final API/unit50passed4warnings4.34s. Không cộng
overlap totals. Test_s47_audit_remediation.py assertions tách proposal khỏi activation.

E48 R01/I06 snapshot ngày11/10: [S48 notes](../runbooks/S48_TASK_NOTES.md), completed
final transport/application **37passed4warnings59.76s**, exact command:

```text
.venv/Scripts/python.exe -m pytest -x -q tests/integration/test_planning_configuration_public.py tests/integration/test_readiness_context.py tests/integration/test_forecast_serving.py tests/integration/test_planning_configuration_resolution.py tests/integration/test_import_readiness_snapshot.py tests/api/test_planning_configuration_openapi.py tests/api/test_health.py tests/api/test_auth_openapi.py tests/api/test_recipe_schedule_openapi.py
```

R01 cases permission union/invalid filters/known-valid unavailable/current auth fence;
I06 projection failure rollback/post-write/legacy retention. Additional affected
test_unavailable_forecast_composition_keeps_valid_data_status **1passed/3.45s**.

E411 S411 notes records `-m scripts.integration e2e` and `cases` final exit0 native
HTTP+fresh PG chain through Import commit/I06/R01/planning/History/PDF; existing-screen
browser9 gates PASS historically. These executed records predate later user reset/
reseed; latest browser status NOT_RUN. No fresh runtime, DB, browser, provider probe
in this audit. Never claim TESTED means reachable-now, and no STAGING_READY entry.

Current offline commands only: build_audit.py freeze/build/verify, git diff --check.
Recorded generator failed once due TypeAdapter serialization call in documentation
script; corrected generator, successful build rerun. No BE/FE source touched.
Verification JSON covers parsing/ref closure/current DTO examples/internal links/
hashes/HEAD/index/old ZIP preservation. External JSON Schema metaschema validator
not installed: structural JSON/ref checks + actual Pydantic validation/serialization
reported separately, no unexecuted draft-metaschema/full conformance claim.
