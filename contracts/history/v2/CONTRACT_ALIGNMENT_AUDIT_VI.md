# CONTRACT_ALIGNMENT_AUDIT_VI — ShelfCash

> HISTORICAL INFORMATION: audit read-only gốc mô tả snapshot trước S4.7.
> Remediation được user authorize sau đó; xem §9 bên dưới cho trạng thái hiện hành.
> Các finding/IDs/evidence gốc được giữ, không dùng absence/OPEN cũ làm current policy.


Audit ngày **11/10/2026, Asia/Saigon**. Source/documentation read-only; chỉ tạo report/
evidence artifacts. Không sửa source/contract/notes, pytest/DB/migration/worker/
provider/browser/network, commit/stage/push hoặc bắt đầu S4.7.

## 1. Baseline và authority

Đúng artifact **shelfcash_backend_context_handoff.zip** (tên gửi có thể có `(1)`),
working-tree snapshot **10/10/2026**, root `shelfcash-backend-context/`, **303 files**.
302 file trong MANIFEST_SHA256.json đều khớp; manifest loại chính nó. CRC pass,
không duplicate/unsafe paths. ZIP SHA-256:
`238959dd16307ebd691834d2a679f7f80134495bbe99c56f29f7835f39bab6fd`.
Không thay bằng ZIP API09/10, không checkout HEAD tái tạo baseline. Baseline packaging
report ghi sanitized .env.example/alembic.ini/config/compose/TESTING; evidence giữ
exact bytes của relevant files đã gửi và baseline generated/openapi.json.

Current branch `feat/from_forecast_to_decision_run`, HEAD
`a4b68378f35fea6f71b549e24393cf4bbb35aba5`, audit-start302 WIP entries. Index/HEAD/status
lưu machine evidence. HEAD chung không nghĩa working tree chung.
Authority AGENTS: CURRENT_STATE → DECISIONS/accepted ADRs → ARCHITECTURE → API_CONTRACT
→ DOMAIN_MODEL → DATABASE_SCHEMA → ROADMAP → source/tests; AUTH đặc biệt cho quyền.
User-approved product contract supersedes các phần cũ đã nêu; source/agent task notes
không tự là product approval. Design chưa implement không tự thành vi phạm.

**Đính chính lượt trước:** dùng nhầm ZIP09/10 để trả lời câu hỏi alignment. Baseline
đúng10/10 đã có source_context, term_period_amendments và design commit202/job.
CommitRequest đã required reason, nhưng prose conditional. Không quy cả ba thành
thay đổi mới hoàn toàn do S4.5/6.

## 2. Kết luận theo cụm

| Cụm | Alignment A contract ZIP / B current docs / C source | Gap chính |
| --- | --- | --- |
| Auth/Staff | Contract/routes/DTO normalized unchanged; current OpenAPI không delta | Historical testing không production SMTP/browser proof |
| Menu/Catalog/Recipe | CAT unchanged, P01/P02 wire stable | N20–22 timeline chưa HTTP |
| Planning/history/PDF | PLAN unchanged; không evidence engine policy đổi | Các routes planned chưa implement, approved v1 không nghĩa deployed |
| Import staging/mapping | Wire mở rộng và confirm_review bắt buộc; source context/quota foundation có baseline | FE strict codegen/flow phải sync, IGNORE authority CA-020 |
| Canonical Import | Planned atomic commit nay implement;202 có authority | Reason/bounds/prose-vs-DTO và state/nullability/enum compatibility |
| Inventory | N6/N8 implements routes đã design, stock ledger distinction đúng | Temporal invariant N6 CA-019 chưa đầy đủ evidence |
| Supplier/fees/declarations | Typed planned schemas + registry/period/coverage writers | Owner/executor actions và nested provenance/schema cần sync |

Không tìm evidence đổi winner/requirements/FEFO/forecast/auto-order. Tuy nhiên không
được kết luận toàn contract aligned: có breaking flow, inherited drift và hai quyền/
temporal boundaries cần làm rõ. S4.6 COMPLETE trong notes là scoped implementation
claim, không độc lập chứng minh conformance toàn contract.

## 3. Inventory contract và route coverage

`same` dưới đây so UTF-8 text normalize CR/LF, không raw bytes. Exact baseline giữ
trong ZIP evidence. Hashes đầy đủ trong manifest.

| Contract baseline docs/ | Current text | Surface |
| --- | --- | --- |
| SHELFCASH_API_CONTRACT_V1_VI.md | changed, deltas bên dưới | Integration contract |
| AUTHORIZATION_CONTRACT_VI.md | same | Integration contract |
| IMPORT_MAPPING_API_CONTRACT_VI.md | changed, deltas bên dưới | Integration contract |
| CATALOG_MENU_RECIPE_API_CONTRACT_VI.md | same | Integration contract |
| INVENTORY_API_CONTRACT_VI.md | changed, deltas bên dưới | Integration contract |
| PROCUREMENT_API_CONTRACT_VI.md | same | Integration contract |

63 candidates: **53 READY core design**, 3 MERGED,2 DEFERRED,5 NEEDS_REVIEW.
Baseline OpenAPI31 core +health; current34 core +health. Added **I06/N6/N8**, removed0.
5 existing path objects changed: I01–04 chỉ declared ETag, I05 variants. **42 added /
21 changed /0 removed components**. $ref changes có thể ảnh hưởng M/J routes dù path
object unchanged. Không xem số routes/OpenAPI là verified runtime hoặc phần trăm.

| ID | Method / baseline route (prefix /api/v1) | Design | Implementation hiện tại | Evidence / dependency |
| --- | --- | --- | --- | --- |
| A01 | POST `/auth/login` | READY | HTTP source/OpenAPI | AUTH/S4.1 |
| A02 | POST `/auth/register` | DEFERRED | DEFERRED | roadmap planned |
| A03 | GET `/auth/me` | READY | HTTP source/OpenAPI | AUTH/S4.1 |
| A04 | POST `/auth/logout` | READY | HTTP source/OpenAPI | AUTH/S4.1 |
| I01 | POST `/stores/{store_id}/imports` | READY | HTTP source/OpenAPI | IMP/S4.4–6 |
| I02 | POST `/imports/{import_id}/files` | READY | HTTP source/OpenAPI | IMP/S4.4–6 |
| I03 | POST `/imports/{import_id}/analyze` | READY | HTTP source/OpenAPI | IMP/S4.4–6 |
| I04 | GET `/imports/{import_id}` | READY | HTTP source/OpenAPI | IMP/S4.4–6 |
| H01 | GET `/stores/{store_id}/imports/calendar` | READY | No public route | roadmap planned |
| H02 | GET `/stores/{store_id}/imports` | READY | No public route | roadmap planned |
| M01 | GET `/imports/{import_id}/mapping-summary` | READY | HTTP source/OpenAPI | IMP/S4.4–6 |
| M02 | GET `/imports/{import_id}/mappings` | READY | HTTP source/OpenAPI | IMP/S4.4–6 |
| M03 | GET `/imports/{import_id}/sheets/{sheet_id}/field-options` | READY | HTTP source/OpenAPI | IMP/S4.4–6 |
| M04 | PATCH `/imports/{import_id}/mappings/{mapping_id}` | READY | HTTP source/OpenAPI | IMP/S4.4–6 |
| I05 | POST `/imports/{import_id}/process` | READY | HTTP source/OpenAPI | IMP/S4.4–6 |
| I06 | GET `/imports/{import_id}/completion` | READY | HTTP source/OpenAPI | IMP/S4.4–6 |
| R01 | GET `/stores/{store_id}/readiness` | READY | No public route | roadmap planned |
| D01 | GET `/stores/{store_id}/today` | NEEDS_REVIEW | NEEDS_REVIEW | roadmap planned |
| V01 | GET `/stores/{store_id}/inventory` | READY | HTTP source/OpenAPI | CAT/INV/S4.3 |
| V02 | GET `/stores/{store_id}/inventory/{ingredient_id}` | READY | HTTP source/OpenAPI | CAT/INV/S4.3 |
| V03 | GET `/stores/{store_id}/inventory/{ingredient_id}/lots` | READY | HTTP source/OpenAPI | CAT/INV/S4.3 |
| V04 | GET `/stores/{store_id}/inventory/{ingredient_id}/movements` | READY | HTTP source/OpenAPI | CAT/INV/S4.3 |
| P01 | GET `/stores/{store_id}/products` | READY | HTTP source/OpenAPI | CAT/INV/S4.3 |
| P02 | GET `/stores/{store_id}/products/{product_id}` | READY | HTTP source/OpenAPI | CAT/INV/S4.3 |
| C01 | GET `/stores/{store_id}/planning-context` | READY | No public route | roadmap planned |
| C02 | POST `/stores/{store_id}/procurement-plans` | READY | No public route | roadmap planned |
| C03 | GET `/procurement-plans/{plan_id}` | READY | No public route | roadmap planned |
| C04 | GET `/procurement-plans/{plan_id}/ingredients` | READY | No public route | roadmap planned |
| C05 | GET `/procurement-plans/{plan_id}/ingredients/{ingredient_id}` | READY | No public route | roadmap planned |
| C06 | GET `/procurement-plans/{plan_id}/ingredients/{ingredient_id}/forecast-series` | MERGED | MERGED | roadmap planned |
| C07 | GET `/procurement-plans/{plan_id}/strategies` | MERGED | MERGED | roadmap planned |
| C08 | GET `/procurement-plans/{plan_id}/explanation` | READY | No public route | roadmap planned |
| C09 | POST `/procurement-plans/{plan_id}/draft-purchase-orders` | DEFERRED | DEFERRED | roadmap planned |
| C10 | POST `/procurement-plans/{plan_id}/regenerate` | MERGED | MERGED | roadmap planned |
| S01 | POST `/procurement-plans/{plan_id}/scenarios` | NEEDS_REVIEW | NEEDS_REVIEW | roadmap planned |
| S02 | GET `/procurement-plans/{plan_id}/scenarios/{scenario_id}` | NEEDS_REVIEW | NEEDS_REVIEW | roadmap planned |
| X01 | POST `/stores/{store_id}/ai/explain` | NEEDS_REVIEW | NEEDS_REVIEW | roadmap planned |
| X02 | GET `/ai/explanations/{explanation_id}` | NEEDS_REVIEW | NEEDS_REVIEW | roadmap planned |
| T01 | GET `/stores` | READY | HTTP source/OpenAPI | AUTH/S4.1 |
| T02 | GET `/stores/{store_id}` | READY | HTTP source/OpenAPI | AUTH/S4.1 |
| J01 | GET `/jobs/{job_id}` | READY | HTTP source/OpenAPI | IMP/S4.4–6 |
| N1 | POST `/stores/{store_id}/planning-requirements` | READY | No public route | roadmap planned |
| N2 | GET `/stores/{store_id}/planning-requirements/{saved_requirement_id}` | READY | No public route | roadmap planned |
| N3 | PUT `/stores/{store_id}/planning-requirements/{saved_requirement_id}` | READY | No public route | roadmap planned |
| N4 | PUT `/stores/{store_id}/planning-budget` | READY | No public route | roadmap planned |
| N5 | POST `/stores/{store_id}/mapping-profiles/{profile_id}/decisions` | READY | HTTP source/OpenAPI | IMP/S4.4–6 |
| N6 | POST `/stores/{store_id}/inventory/receipts` | READY | HTTP source/OpenAPI | INV/S4.6 |
| N7 | POST `/auth/credentials/complete` | READY | HTTP source/OpenAPI | AUTH/S4.1 |
| N8 | PUT `/stores/{store_id}/inventory/{ingredient_id}/threshold` | READY | HTTP source/OpenAPI | INV/S4.6 |
| N9 | GET `/stores/{store_id}/procurement-plans` | READY | No public route | roadmap planned |
| N10 | POST `/procurement-plans/{plan_id}/exports` | READY | No public route | roadmap planned |
| N11 | GET `/procurement-plans/{plan_id}/exports/{export_id}` | READY | No public route | roadmap planned |
| N12 | GET `/stores/{store_id}/memberships` | READY | HTTP source/OpenAPI | AUTH/S4.2 |
| N13 | PUT `/stores/{store_id}/memberships/{membership_id}/permissions` | READY | HTTP source/OpenAPI | AUTH/S4.2 |
| N14 | GET `/stores/{store_id}/permission-events` | READY | HTTP source/OpenAPI | AUTH/S4.2 |
| N15 | POST `/stores/{store_id}/staff-invitations` | READY | HTTP source/OpenAPI | AUTH/S4.2 |
| N16 | GET `/stores/{store_id}/staff-invitations` | READY | HTTP source/OpenAPI | AUTH/S4.2 |
| N17 | POST `/stores/{store_id}/staff-invitations/{invitation_id}/actions` | READY | HTTP source/OpenAPI | AUTH/S4.2 |
| N18 | GET `/staff-invitations/{invitation_id}` | READY | HTTP source/OpenAPI | AUTH/S4.2 |
| N19 | POST `/staff-invitations/{invitation_id}/accept` | READY | HTTP source/OpenAPI | AUTH/S4.2 |
| N20 | GET `/stores/{store_id}/products/{product_id}/recipe-schedule` | READY | No public route | roadmap planned |
| N21 | POST `/stores/{store_id}/products/{product_id}/recipe-schedule/changes` | READY | No public route | roadmap planned |
| N22 | GET `/stores/{store_id}/products/{product_id}/recipe-schedule/changes/{change_id}` | READY | No public route | roadmap planned |

19 READY chưa HTTP: H01/H02/R01; C01–05/C08; N1–4/N9–11/N20–22. S4.7 timeline;
S4.8 config/readiness; S4.9 publicRun; S4.10 detail/history/PDF. **H01/H02 thiếu slice
owner rõ** trong roadmap table. Internal PlanningRun/validator không public route.
D01/S01/S02/X01/X02 và one-time approval review riêng; A02/C09 deferred đã chốt.

## 4. Differences và evidence

IDs CA-001–022 ổn định. Mỗi mục ghi category chính; optional/additive field vẫn có
thể breaking với strict additionalProperties/Literal client. Không gom mọi thay đổi
thành additive. Baseline paths lấy từ ZIP, current paths từ repo. IMP = docs/IMPORT_MAPPING_API_CONTRACT_VI.md; INV = docs/INVENTORY_API_CONTRACT_VI.md; PLAN = docs/PROCUREMENT_API_CONTRACT_VI.md. Các function/test được tra full path và current line trong generated/current_function_index.json của evidence ZIP. Paths source ghi
repo-relative; function và test presence không tự chứng minh test vừa chạy.

| ID | Phân loại | Severity/blocking |
| --- | --- | --- |
| CA-001 | Breaking wire/flow change | HIGH: baseline preview→commit bị409 |
| CA-002 | Documentation ↔ typed DTO/runtime drift | HIGH: validation; inherited phần lớn |
| CA-003 | Implementation của capability đã có trong contract gốc | MEDIUM: codegen/job integration |
| CA-004 | Additive wire change cần FE cập nhật | MEDIUM: strict response consumers |
| CA-005 | Clarification không đổi nghĩa nghiệp vụ | MEDIUM: revisions/seal/retry |
| CA-006 | Additive wire change cần FE cập nhật | MEDIUM: classification/ack workflow |
| CA-007 | Additive wire change cần FE cập nhật | MEDIUM: batch-varying facts/reuse |
| CA-008 | Clarification không đổi nghĩa nghiệp vụ | MEDIUM: review semantic metadata |
| CA-009 | Implementation của capability đã có trong contract gốc | MEDIUM: nullable/state enum compatibility |
| CA-010 | Implementation của capability đã có trong contract gốc | MEDIUM: counts/impacts/provenance |
| CA-011 | Implementation của capability đã có trong contract gốc | MEDIUM: sales money/history semantics |
| CA-012 | Additive wire change cần FE cập nhật | MEDIUM — period review |
| CA-013 | Implementation của capability đã có trong contract gốc | MEDIUM — explicit facts/identities |
| CA-014 | Implementation của capability đã có trong contract gốc | MEDIUM — N6 ledger/retry |
| CA-015 | Implementation của capability đã có trong contract gốc | LOW — N8/read projection |
| CA-016 | Documentation ↔ typed DTO/runtime drift | HIGH — bounds; inherited baseline |
| CA-017 | Clarification không đổi nghĩa nghiệp vụ | LOW headers; MEDIUM error interpretation |
| CA-018 | Capability chưa implement/deferred đúng roadmap | HIGH whole-v1; không S4.6 scope failure |
| CA-019 | Documentation ↔ typed DTO/runtime drift | HIGH — N6 temporal conformance chưa đủ |
| CA-020 | Chưa đủ evidence để kết luận | HIGH — whole-sheet Staff IGNORE/Owner boundary |
| CA-021 | Documentation ↔ typed DTO/runtime drift | MEDIUM — mixed current/history |
| CA-022 | Implementation của capability đã có trong contract gốc | LOW alignment; MEDIUM throughput constraint |

### CA-001 — Breaking wire/flow change

**Severity/blocking:** HIGH: baseline preview→commit bị409.

**A — baseline / before:** IMP§7/9.3 trong ZIP: preview→commit(confirm:true), không phase confirm_review trong source/OpenAPI.

**B — current contract / after và FE impact:** Current IMP classification/§9.3: I05 confirm_review200 trước commit202; thiếu stored confirmation→409 PREVIEW_BLOCKED. FE thêm call, refresh ETag; UI không nhất thiết thêm nút.

**C — source/function/test evidence:** app/application/contracts/import_mapping.py::ConfirmReviewRequest/ReviewConfirmation; app/application/use_cases/import_staging.py::confirm_review/_commit_preview(2151–2175); app/api/import_staging.py::process; tests/integration/test_import_classification.py::test_manual_correction_owner_profile_then_reuse_still_needs_own_confirmation.

**Authorization evidence:** Original S4.5 request mục2 retained confirmation; mục5 nguyên văn “upload → analyze → mapping → approval nếu cần → preview → confirm_review → commit/job → completion/read”. Classification notes ghi user extension nhưng original classification prompt chưa tìm thấy.

**Nguyên nhân / remediation đề xuất (chưa thực hiện):** Workflow bổ sung sau snapshot, original S4.5 ratifies bước này. Không phải chỉ additive field. Giữ authorized flow; cập nhật handoff/FE sequencing trước integration.

### CA-002 — Documentation ↔ typed DTO/runtime drift

**Severity/blocking:** HIGH: validation; inherited phần lớn.

**A — baseline / before:** IMP§9.3 reason required khi correction/merge/count. Nhưng ZIP CommitRequest reason:str đã required; ImportDTO reject blank; OpenAPI required reason/resolutions/confirm.

**B — current contract / after và FE impact:** Current IMP current-wire§9.3: reason nonblank mọi commit; DTO str→Text(min1,max1000), strict confirm true. FE omit reason đã422 baseline; >1000 hoặc confirm=1 nay bị chặn. Universal user-entered reason vẫn không rõ authority.

**C — source/function/test evidence:** app/application/contracts/import_mapping.py::CommitRequest/explicit_true; import_scalars.py::ImportDTO/Text; baseline generated/openapi.json#/CommitRequest.

**Authorization evidence:** Original S4.5 không expressly universal user-entered reason; user tự quyết validation/types được ủy quyền. Chưa tìm separate authorization evidence chọn mandatory reason cho new insert/NO_OP.

**Nguyên nhân / remediation đề xuất (chưa thực hiện):** Mâu thuẫn prose↔DTO có từ baseline; siết bound/strict bool là implementation validation. Nam chốt UX reason phạm vi nào, rồi đồng bộ prose/DTO; audit không tự chọn.

### CA-003 — Implementation của capability đã có trong contract gốc

**Severity/blocking:** MEDIUM: codegen/job integration.

**A — baseline / before:** IMP§4 commit_id/job_id async;§9.3 “job còn recheck ...202 không durable business success”. Baseline route202 chỉ schema PreviewAccepted, commit service409 IMPORT_COMMIT_NOT_SUPPORTED.

**B — current contract / after và FE impact:** Current IMP§9.3/API S4.5: CommitAccepted202(status=committing,phase=commit,job_id,job_status,commit_id,preview_id,effective_plan_digest,import_revision); J01 import_commit → I06. Worker defaultfalse.

**C — source/function/test evidence:** app/api/import_staging.py::process; import_mapping.py::CommitAccepted; import_staging.py::commit/_execute_commit; test_import_commit.py::test_http_commit_fresh_rows_retained_completion_and_same_key_retry.

**Authorization evidence:** Original S4.5 mục2 yêu cầu commit/job/completion đã contract định nghĩa, không tự đặt status; mục4 durable job.202 có baseline design authority.

**Nguyên nhân / remediation đề xuất (chưa thực hiện):** Hoàn thiện planned behavior, không sync200→async202. FE phải update response union/J01/I06, không gọi202 canonical success. Giữ và publish wire/worker operating notes.

### CA-004 — Additive wire change cần FE cập nhật

**Severity/blocking:** MEDIUM: strict response consumers.

**A — baseline / before:** I04 ZIP không quota object, file_count/source_set/files pages có sẵn; accepted-record admission có source baseline.

**B — current contract / after và FE impact:** Current IMP§9.1a, ImportRead.quota required response: accepted_file_count/accepted_total_bytes/remaining_file_slots/remaining_bytes toàn batch, không files pagination.

**C — source/function/test evidence:** import_mapping.py::ImportQuota/ImportRead; import_staging.py::_quota/read; test_import_batch_mechanics.py::test_quota_read_has_current_rights_store_isolation_and_no_import_writes.

**Authorization evidence:** User conversation: “Bổ sung authoritative quota metadata vào I04 ... accepted_file_count ... remaining_bytes”; original standalone artifact chưa xác định, transcript provenance kèm.

**Nguyên nhân / remediation đề xuất (chưa thực hiện):** User-approved metadata sau snapshot, không new request/path/limits. FE strict additionalProperties có thể reject response thêm field; update schema, không derive từ page.

### CA-005 — Clarification không đổi nghĩa nghiệp vụ

**Severity/blocking:** MEDIUM: revisions/seal/retry.

**A — baseline / before:** ZIP IMP§4 gọi file_set_version accepted-list revision. Baseline upload thực đã accepted logical records, multipart partial order, new-key receipt/rejected thay version; same-key replay trước seal check.

**B — current contract / after và FE impact:** Current IMP§9.1a ghi exact behavior. Rejected không quota; same bytes/new client ID tính record mới; blob dedup khác business. Seal acceptance không đổi version, failed không reopen upload, không remove/replace/quota release.422 UPLOAD_REJECTED có committed receipts khác request rollback.

**C — source/function/test evidence:** import_staging.py::upload(284–416)/analyze(419–469); api/import_staging.py::upload; test_import_batch_mechanics.py multicall/bytes/races/replay; exact corresponding baseline functions.

**Authorization evidence:** User conversation chốt accepted-record quota/ordered partial/revision và giữ20files/20MiB/100MiB. Audit request chốt numeric, không hỏi lại.

**Nguyên nhân / remediation đề xuất (chưa thực hiện):** Clarify behavior đã baseline, không mới chuyển admission sang partial. 8+7+6 đủ bytes nhận5/reject1;99MiB+1+1 nhậnfirst1/rejectsecond1. FE refresh I04 sau replay; preserve request guards/transaction rollback.

### CA-006 — Additive wire change cần FE cập nhật

**Severity/blocking:** MEDIUM: classification/ack workflow.

**A — baseline / before:** ZIP M04 column/context/entity resolutions; không SheetTypeResolution hoặc indexed classification UI/descriptors. Unknown sheet chưa có manual type workflow hoàn chỉnh.

**B — current contract / after và FE impact:** Current IMP classification header: sheet_type/whole IGNORE +ack/reason; M01/M02 indexed selected/suggested/MANUAL/REUSED/confidence; M03 schemas[]/nullable/input_help. New whole-ignore acknowledgment bắt buộc.

**C — source/function/test evidence:** import_mapping.py::SheetTypeResolution/ResolveRequest/SchemaDescriptor; import_staging.py::_change_type/resolve/field_options; app/application/import_descriptors.py; test_import_classification.py type/reuse/multifile tests.

**Authorization evidence:** Classification notes nêu user task manual/type/IGNORE/reuse/confirmation. Original classification prompt chưa tìm thấy; downstream S4.5 references docs không chứng minh mọi checkbox policy.

**Nguyên nhân / remediation đề xuất (chưa thực hiện):** Authorized-feature intent dựa notes, chưa đủ whole-ignore permission evidence CA-020. Legacy notes nói reference-only/no schema/API port; không tự bịa cause legacy compatibility. Update FE descriptors/controls, confidence heuristic only.

### CA-007 — Additive wire change cần FE cập nhật

**Severity/blocking:** MEDIUM: batch-varying facts/reuse.

**A — baseline / before:** ZIP ProfileSpec không shared_field_bindings; không PROFILE_CONSTANT/IMPORT_VALUE DTO. Source row fields typed required từ Excel/bindings.

**B — current contract / after và FE impact:** Current IMP field-values header: M04 shared_value scalar allowlist; switch column needs index/ack/evidence. Constants/rules nhớ approved profile, batch values chỉ sheet. Import sau missingreportkey blocked, không inherit value.

**C — source/function/test evidence:** app/application/contracts/import_field_values.py; import_staging.py::resolve/_resolve_shared/_run_one; import_analysis.py::build_spec; test_import_field_value_bindings.py::test_first_sales_then_reuse_requires_new_import_report_key/test_explicit_switch_conflicts_profile_change_and_value_invalidates_review.

**Authorization evidence:** Original S4.5 mục1/6 nhắc unit PROFILE_CONSTANT/report key IMPORT_VALUE và test reuse missing blocked. Exact per-field allowlist/ack representation agent-notes technical choice; original extension prompt chưa tìm thấy.

**Nguyên nhân / remediation đề xuất (chưa thực hiện):** User ratification feature/reuse separation; no evidence business defaults hoặc LLM facts. FE cần new controls/scopes, first rule N5, change value cần new preview/confirmation; giữ không generic nested/identity injection.

### CA-008 — Clarification không đổi nghĩa nghiệp vụ

**Severity/blocking:** MEDIUM: review semantic metadata.

**A — baseline / before:** ZIP IMP§5/9.2 đã source_context stable Store/system/report Owner approval. DTO đã sales_semantics/inventory_semantics/decimal_locale/date_format/pack_cost_basis/planned_arrival_expiry_rule/term_period_amendments.

**B — current contract / after và FE impact:** Current prose bổ sung optional fields có sẵn; source codes128ASCII/case-sensitive giữ nguyên; fee_period_amendments mới CA-012. Approved context reuse exact, conflict forks proposal; filename không authority.

**C — source/function/test evidence:** import_mapping.py::SourceContext/ProfileSpec; import_analysis.py::build_spec/source_context_conflicts; import_staging.py::resolve/_run_one; test_import_staging.py::test_context_semantics_edit_is_proposal_and_keeps_active_version/test_source_context_change_invalidates_usage_without_mutating_evidence.

**Authorization evidence:** Baseline accepted source-context declaration ghi trong§5/9.2 và S44 notes; conversation user Owner mapping principle. Original exact source-context reply standalone chưa xác định.

**Nguyên nhân / remediation đề xuất (chưa thực hiện):** Documentation describes pre-existing DTO; không gọi context mới sau baseline. Không thấy reusing prior IMPORT_VALUE hoặc silently change semantics. FE Owner phải thấy full parsing/aggregation spec; giữ, sync docs/descriptors.

### CA-009 — Implementation của capability đã có trong contract gốc

**Severity/blocking:** MEDIUM: nullable/state enum compatibility.

**A — baseline / before:** ZIP IMP§11 thiết kế I06 completion; không route thật; ImportRead.completion_available/can_commit constfalse, Configurations preview-only/staged.

**B — current contract / after và FE impact:** Current IMP/S4.5–6: I06 retained HTTP; I04 bool flags true; configs analysis_rows/basis/stale, preview_id/digest nullable trước preview; state staged|committed với actual versions. Literal client có thể breaking dù thêm capability.

**C — source/function/test evidence:** import_mapping.py::ImportRead/Configurations/ConfigurationRevision; import_staging.py::read/completion; test_import_commit.py::test_commit_and_completion_foreign_store_reads_deny_and_retained_read_does_no_work; test_import_inventory_supplier.py multi-schema.

**Authorization evidence:** Original S4.5 completion/read; S4.6 mục5 I04/J01/I06 retained state/provenance. New representations technical delegation.

**Nguyên nhân / remediation đề xuất (chưa thực hiện):** Planned surface supplied, new enum/null values invalidate generated assumptions. FE regenerate discriminated variants/current examples; GET không parser/worker/write, staged không canonical success.

### CA-010 — Implementation của capability đã có trong contract gốc

**Severity/blocking:** MEDIUM: counts/impacts/provenance.

**A — baseline / before:** ZIP IMP§11 impact/counts design, không executable I06 DTO/API.

**B — current contract / after và FE impact:** Current I06 inserted_record_count/changed_record_count/no_op_count; suppliers/terms/fees/declarations impacts; canonical_domain chín nhóm/movement_ids/nested refs/versions/provenance. REGISTER_TERM_SOURCE created_count là logical config action, không core term mới.

**C — source/function/test evidence:** app/application/import_commit.py::write_rows; import_staging.py::_execute_commit; import_mapping.py::UpdatedResources/CommitRowReference; test_import_inventory_supplier.py::test_multi_schema_supplier_terms_explicit_none_fee_and_declaration_atomic_commit.

**Authorization evidence:** Original S4.5 mục5 counts/provenance; S4.6 mục5 “Không double-count raw rows và canonical logical actions”, nested per-part source trace.

**Nguyên nhân / remediation đề xuất (chưa thực hiện):** Representation của authorized completion, baseline schema thiếu cho codegen. FE đừng equate raw recipe rows/logicalactions hoặc registry with offercreation; cập nhật enums/examples/permission-aware UI.

### CA-011 — Implementation của capability đã có trong contract gốc

**Severity/blocking:** MEDIUM: sales money/history semantics.

**A — baseline / before:** ZIP IMP§8.2 user-approved daily total100→105 khác independent100+105→205; no file-hash/business identity. Baseline commit unsupported.

**B — current contract / after và FE impact:** Current explicit sales resolutions+immutable source/canonical history. Retry105 NO_OP; same contribution105→110 đưa aggregate205→210, không cộng110 lần nữa; mixed overlap blocks, unknown baseline explicit assertion/evidence.

**C — source/function/test evidence:** app/application/import_sales_sources.py::classify_sales; import_preview.py::make_preview; import_commit.py::write_rows; test_import_commit.py::test_disjoint_source_retry_revision_205_to_210_and_daily_total_mix_blocked.

**Authorization evidence:** User quote đã baseline§8.2, original S4.5 no generic overwrite/duplicate inference; contract approved correction/merge permission/reason.

**Nguyên nhân / remediation đề xuất (chưa thực hiện):** Implement agreed policy, không evidence đổi generic UPSERT. FE source keys/semantics/explicit disjoint evidence required; giữ policy, publish retained source revision examples.

### CA-012 — Additive wire change cần FE cập nhật

**Severity/blocking:** MEDIUM — period review.

**A — baseline/before:** IMP§13.4 baseline: Owner explicit amend kỳ cũ + kỳ mới tương lai, không hồi tố/auto-close. supplier_changes và TermPeriodAmendment có trong DTO; FeePeriodAmendment chưa có.

**B — current contract/after và FE impact:** IMP S4.6: fee_period_amendments ở SourceContext/ProfileSpec; AMEND_FEE_PERIOD closed-copy + immutable new revision. supplier_changes.action_id=PreviewRow.row_id, exact toàn bộ required set; thiếu/thừa/duplicate422.

**C — source/function/test evidence:** app/application/import_configuration_preview.py::finish_configurations; import_commit.py::commit_rows; use_cases/operational_configuration.py::close_term/fee; contracts/import_mapping.py::FeePeriodAmendment; tests/integration/test_import_inventory_supplier.py::test_future_terms_and_fee_changes_require_exact_owner_amendments_and_executor_confirmation.

**Authorization evidence:** Original S4.6 mục2 yêu cầu hoàn thiện supplier_changes theo authority; baseline§13.4 reviewed future changes. Không có approval riêng tên field, thuộc technical delegation.

**Nguyên nhân / remediation (chưa thực hiện):** Bổ sung representation cho workflow đã duyệt. FE full Owner diff/xmin + executor actions; pinned amendment reused có thể stale, không chọn latest. Giữ và update handoff.

### CA-013 — Implementation của capability đã có trong contract gốc

**Severity/blocking:** MEDIUM — explicit facts/identities.

**A — baseline/before:** IMP§13 typed suppliers/terms/fees/INVENTORY/SALES_COVERAGE/PROCUREMENT_CONTEXT; unknown khác0. Baseline staging only.

**B — current contract/after và FE impact:** Current S4.6 nine atomic adapters, migration0014 registries/immutable revisions; dependencies không theo sheet order. Declaration dependency hash sau writes, nhận lô/count/catalog đổi invalidates coverage. Không fuzzy/generic UPSERT.

**C — source/function/test evidence:** app/models/operational_import.py; alembic/versions/0014*; repositories/import_staging.py::read_set_in_session; app/application/operational_import_facts.py; test_import_inventory_supplier.py nested/zero/source/Store tests; test_operational_import_schema.py immutable/FK/longkey.

**Authorization evidence:** Original S4.6 explicit năm schemas/canonical source refs/coverage, storage rationale delegated. Baseline§13 và accepted ADRs unchanged.

**Nguyên nhân / remediation (chưa thực hiện):** Planned capability implement; FE exact covered references/unknown, null max-order không unlimited. Không table-driven extra API/readiness. Giữ typed facts, future evaluator riêng.

### CA-014 — Implementation của capability đã có trong contract gốc

**Severity/blocking:** MEDIUM — N6 ledger/retry.

**A — baseline/before:** INV§4/N6 baseline sync201/source identity/CAS: opening current quantity +COUNT_CORRECTION khác actual +RECEIPT. Dates unknown giữ null. Chưa public N6.

**B — current contract/after và FE impact:** Current exact N6 route201 first/200 replay; same identity/payload một lô, changed payload409. Cost nonnull0 cần current costread; replay mask. Quantity text max200, required-nullable fields gửi null. Temporal gap CA-019 riêng.

**C — source/function/test evidence:** app/application/use_cases/stock_writes.py::receive/_run/_visible; contracts/stock_writes.py; app/api/stock_writes.py; inventory.py::receive_in_transaction; test_stock_writes.py opening/actual/ACK/concurrent/permissions.

**Authorization evidence:** Baseline INV4, user approved opening/actual trong conversation, original S4.6 mục3 và roadmap. Không authoritative requirement dedicated Excel receipt schema.

**Nguyên nhân / remediation (chưa thực hiện):** Implement existing design responsibility, không new route ngoài53. Count không bootstrap lot, purchase history không rename receipt. Giữ, gửi typed wire, xử lý temporal conformance.

### CA-015 — Implementation của capability đã có trong contract gốc

**Severity/blocking:** LOW — N8/read projection.

**A — baseline/before:** INV§5 N8 Owner/null clear/0/noop/CAS/audit đã chốt; near expiry7. V01–04 HTTP baseline nhưng threshold/completeness unknown.

**B — current contract/after và FE impact:** Current exact N8 method/body,412 stale/428 missing; SQL projection threshold/completeness/origin/actor, counters trước pagination. Public read DTO/path unchanged, values đã có enum design nay xuất hiện.

**C — source/function/test evidence:** stock_writes.py::threshold; app/repositories/public_reads.py::stock_aggregate/confirmed_stock; app/domain/inventory/read_rules.py; test_stock_writes.py::test_threshold_cas_null_zero_noop_and_inventory_revision; test_public_reads.py.

**Authorization evidence:** User7days/Owner thresholds, baselineINV3/5 và S4.6 roadmap threshold scope.

**Nguyên nhân / remediation (chưa thực hiện):** Planned settings implement, không planning constraint/USAGE/forecast. Giữ; no browser/runtime gate mới trong audit.

### CA-016 — Documentation ↔ typed DTO/runtime drift

**Severity/blocking:** HIGH — bounds; inherited baseline.

**A — baseline/before:** IMP§13 ZIP keys/component_key1..128, packcost/amount MoneyText theo PLAN. Source ZIP Text1000/Quantity200 dùng keys/amounts. import_scalars.py/import_source.py baseline/current AST identical.

**B — current contract/after và FE impact:** Current prose giữ128/MoneyText; feature ghi drift. S4.6 hash index giữ raw1000Unicode tránh btree overflow, không truncate nhưng không ratify1000 product contract.

**C — source/function/test evidence:** app/application/contracts/import_scalars.py::Text/Quantity; import_source.py::SOURCE_MODELS; baseline/current schemas SupplierSource/TermSource/FeeComponent; test_operational_import_schema.py::test_unicode_source_identity_at_current_typed_model_limit_does_not_exceed_postgres_index_limit.

**Authorization evidence:** Chưa tìm explicit authorization evidence thay128/MoneyText bằng1000/Quantity200. S4.6 preserve invariants không tự approve source theo prose mới.

**Nguyên nhân / remediation (chưa thực hiện):** Inherited typed/prose drift proven, không mới S4.6. FE128 precheck reject BE accepted; source DTO pass không prove commit domain/storage pass. Reviewer đề xuất compatible bounds, Nam giao chuẩn hóa kỹ thuật; không tự chọn authority rồi gọi aligned.

### CA-017 — Clarification không đổi nghĩa nghiệp vụ

**Severity/blocking:** LOW headers; MEDIUM error interpretation.

**A — baseline/before:** Baseline source có ETag draft/upload/analyze/read nhưng OpenAPI chưa declare. Import envelopes riêng auth/read. All-rejected422 receipt đã có.

**B — current contract/after và FE impact:** Current ETag declaration I01–05; I02 status/shape unchanged. N6/N8 declare413 boundedJSON/428 preconditions. UPLOAD_REJECTED422 committed receipts khác request-level rollback.

**C — source/function/test evidence:** app/api/import_staging.py::draft/upload/analyze/read/process; auth dependencies/middleware; ImportEnvelope/UploadFailure; generated/openapi_diff.json.

**Authorization evidence:** Baseline conventions + user batch clarification. Guard/headers technical details, không mới product policy.

**Nguyên nhân / remediation (chưa thực hiện):** Documentation của header existing; FE render details/refresh I04, không xem mọi422 là rollback. Giữ envelope/status.

### CA-018 — Capability chưa implement/deferred đúng roadmap

**Severity/blocking:** HIGH whole-v1; không S4.6 scope failure.

**A — baseline/before:** 53 READY core design, không HTTP proof. ZIP31 core+health, commit unsupported; histories/readiness/planning/timeline/PDF planned.

**B — current contract/after và FE impact:** Current34 core+health,19 READY chưa HTTP: H01/H02/R01,C01–05/C08,N1–4/N9–11/N20–22. S4.7–10 planned; H01/H02 thiếu slice owner rõ. Approved v1 không tự deferred do chưa design/HTTP.

**C — source/function/test evidence:** app/main.py; docs/ROADMAP.md S4 table; baseline/current CAT12/PLAN14–16/IMP11/14; generated/route_inventory.json.

**Authorization evidence:** User kept PDF/history/Staff/reasons v1; original S4.6 excludes future slices; audit pause all new. Không authority cancel v1.

**Nguyên nhân / remediation (chưa thực hiện):** Implementation completeness gap; no whole-v1 COMPLETE. FE mocks có planned label; không gọi absent routes/internal engines. Assign H01/H02 future slice, không implement trong audit.

### CA-019 — Documentation ↔ typed DTO/runtime drift

**Severity/blocking:** HIGH — N6 temporal conformance chưa đủ.

**A — baseline/before:** INV§4 ZIP: Receiptcurrentbalance “observed current và không intervening observation/source events”; no invented backdate. N6 planned.

**B — current contract/after và FE impact:** Current INV rule same. receive checks freshCAS và observed_at<=now, không lower-bound theo events trước. Inventory seam refs/unit/expiry không event-order check. Count preview riêng compares lot.updated_at.

**C — source/function/test evidence:** app/application/use_cases/stock_writes.py::receive126–145/_run; inventory.py::receive_in_transaction; contracts/inventory.py::ReceiveInventoryInput; import_preview.py441–445. test_stock_writes stale case không old observed_at+freshCAS.

**Authorization evidence:** Chưa tìm authority thay current/no-intervening bằng freshCAS-only. Original S4.6 says timestamps/backdated only contract. Relevant scope lot/Ingredient/Store chưa rõ.

**Nguyên nhân / remediation (chưa thực hiện):** Source reachable scenario freshCAS sau movement + olderobserved_at không explicit rejection; chưa reproduce runtime audit. Có thể missing invariant hoặc underspecified scope. Nam clarify relevant events/freshCAS interpretation rồi minimal test/fix; chưa full temporal N6 acceptance.

### CA-020 — Chưa đủ evidence để kết luận

**Severity/blocking:** HIGH — whole-sheet Staff IGNORE/Owner boundary.

**A — baseline/before:** IMP§5 ZIP Owner full structure/columns/ignore; optional unresolved Owner-approved ignore. Whole-sheet batch exclusion chưa explicit permission semantics.

**B — current contract/after và FE impact:** Current ack/reason; resolve mapping.propose; _change_type(ignore) không profile proposal, drops pin/confirmation, approval_required=false. _summary xét nonignored sheets, excluded part không N5.

**C — source/function/test evidence:** app/application/use_cases/import_staging.py::resolve997/_change_type909–974/_summary554/_run_one; test_import_classification.py::test_unsupported_sheet_requires_acknowledged_ignore + multifile ignore; features/IMPORT_STAGING_PREVIEW.md classification.

**Authorization evidence:** Classification notes only cho explicit ignore; original prompt không tìm thấy để chứng minh Staff noOwner exclusion. S4.5 ratifies review, không express exclusion authority. Chưa tìm thấy evidence≠user neverapproved.

**Nguyên nhân / remediation (chưa thực hiện):** Staff grants mapping.propose+commit có thể exclude sheet rồi preview/confirm; evidence vẫn giữ. Batch inclusion có thể distinct mapping semantic change, chưa đủ kết luận violation/approval. Nam choose Owner-reviewed scope vs explicit Staff batch skip; nofix now.

### CA-021 — Documentation ↔ typed DTO/runtime drift

**Severity/blocking:** MEDIUM — mixed current/history.

**A — baseline/before:** ZIP design contract +API/CURRENT_STATE/CONTEXT tách S4.1–3 vs future staging; known histories.

**B — current contract/after và FE impact:** Current IMP top S4.6 supports9 nhưng lower§11 CURRENTFACT S4.5/S4.6 future; conditionalreason/bounds coexist header. S46notes còn vài dấu? encoding. Header không đủ cho reader đọc riêng section.

**C — source/function/test evidence:** docs/IMPORT_MAPPING_API_CONTRACT_VI.md headers/§9.3/11/13; CURRENT_STATE/ROADMAP histories; runbooks/S46_TASK_NOTES.md; raw diffs.

**Authorization evidence:** Tasks permit docs reflect/runtime drift, không ratify policy theo code. Stale clause không authority override.

**Nguyên nhân / remediation (chưa thực hiện):** Append status updates gây competing clauses; encoding issue từ documentation script visible. Consolidate current/history/versionedwire after review, không sửa trong audit hoặc hide drift bằng COMPLETE label.

### CA-022 — Implementation của capability đã có trong contract gốc

**Severity/blocking:** LOW alignment; MEDIUM throughput constraint.

**A — baseline/before:** Baseline atomic/currentrights/CAS/readset/jobs design;0013 staging/audit/receipt, commit chưa implement.

**B — current contract/after và FE impact:** Current sorted global table fences, transaction-owned seams; canonical+successaudit+completion/job atomic. Auth checks at acceptance/execution/replay/read. Shared fenced table writes crossStore serialize; no throughput/load proof.

**C — source/function/test evidence:** app/repositories/import_staging.py::read_set_in_session; import_staging.py::_commit_preview/_execute_commit; stock_writes.py::_run; test_import_commit.py rollback/actualworkers/ACK/tablefence; test_import_inventory_supplier.py mixedrollback/concurrentstale.

**Authorization evidence:** Original S4.5 locking/recovery/currentrights; S4.6 explicit conservative fences không concurrency redesign.

**Nguyên nhân / remediation (chưa thực hiện):** Authorized technical mechanism, không engine/provider canonical facts hoặc legacy compatibility evidence. Giữ correctness + disclose global throughput; historical PG evidence, not new verification; CA019/020 vẫn độc lập.

## 5. Authorization và nguyên nhân — đánh giá bằng evidence

| Cấp evidence | Tìm được | Giới hạn |
| --- | --- | --- |
| Original request | Attachments S4.5/S4.6 còn trên filesystem, exact copies kèm ZIP | Slice authorization không approve mọi invented policy |
| User instruction trong conversation | Batch accepted quota/order/revisions/I04; Owner Store mapping, limits LLM; opening/near7/Owner threshold; v1 Staff/history/PDF | Transcript excerpt kèm có provenance; không giả là original exported chat artifact |
| Accepted baseline contract/ADRs | Source context§5/9.2; supplier changes§13.4; sales§8.2; INV4/5 | ADR013 self-approval historical superseded rõ, không sửa accepted ADR |
| Agent task notes | Classification/shared-values scope, allowlists và acknowledgment technical choices | Original extension prompts chưa tìm thấy trong artifacts đã xác định |
| Chưa đủ authorization evidence | Universal user-entered reason; bounds authority; Staff whole-sheet ignore bypass; N6 temporal scope | Không khẳng định người dùng chưa từng duyệt |

S4.5 request nguyên văn: “Không tự đặt route, status, permission hoặc payload mới
nếu contract đã có”. Đồng thời explicitly walkthrough confirm_review→commit/job.
S4.6 request: “Nếu supplier_changes/resolutions đã có DTO/contract, hoàn thiện
semantics đúng authority”; “Không coi confirm_review là đã cấp quyền thay đổi mọi
supplier facts”. Đây là scope cụ thể, không giấy phép đổi nghĩa bất kỳ field.
Source contexts/terms amendments đã baseline DTO; fee amendment representation mới
được xây cho workflow existing. Exact bounds discrepancy có từ snapshot trước, không
story mới do S4.6. Không có evidence causal legacy-port; classification notes chỉ
nói đọc legacy reference, no schema/API port. Không suy nguyên nhân từ file diff.

## 6. Những gì vẫn khớp / FE tích hợp gì

- Auth/login/Store/Staff grants, P01/P02 và V01–04 giữ paths/DTO; cookies/currentrights,
  CSRF/Origin, Store isolation/snapshot conventions. FE có thể dùng baseline wire
  cho nhóm này; historical tests không deployed/production gate.
- Basic Import upload/analyze/source-context/N5 profile approval giữ requests. I02
  source baseline đã partial acceptance; mandatory reject acknowledgment trước I03,
  quota không unique blobs. Nhưng I04/M03 responses có fields mới: strict generated
  baseline clients phải update schemas, không gọi mọi additive là compatible.
- Commit không dùng baseline prose-only sequencing: thêm confirm_review/ETag,
  phase response union/job polling/I06. Mapping approval không canonical commit.
- N6/N8 trách nhiệm/body đã design; lấy current typed examples để gửi required-nullable
  null, handle errors; CA-019 temporal và CA-020 permission chưa được miễn bằng tests.
- Supplier/fees/nested declarations giữ explicit identity/coverage/version; FE phải
  render Owner reviewed diff và executor confirmations. No historic price edits.
- Winner/requirements/FEFO/forecast không có evidence policy đổi, import không tự
  tính lại Run/USAGE/auto-order, readiness chưa evaluator vẫn unknown/NOT_ASSESSED.
- Missing19 routes không gọi được; PDF/history/timeline vẫn v1 approved/planned.
  Không tự deferred chỉ vì FE thiếu design. H01/H02 cần assigned slice trước whole-v1.

## 7. Remediation đề xuất, chưa thực hiện

1. Giữ những thay đổi có authority: confirmation/jobs/quota/shared-value feature/
   nine-schema/N6/N8; tạo handoff version mới + compatibility guide khi được yêu cầu.
2. Chuẩn hóa documentation/typed DTO/descriptor/codegen bounds và reasons/history;
   không sửa mọi docs về code để hợp thức hóa behavior chưa có approval.
3. Sửa implementation về contract gốc nếu temporal/Owner exclusion được xác định
   thiếu invariant; targeted cases cần bổ sung sau quyết định. Audit chưa fix.
4. Assign H01/H02 ownership và không claim53 implemented/whole-v1 ready từ OpenAPI.

**Ba quyết định sản phẩm cần Nam chốt trước tiếp tục:**

- **CA-020 — bỏ cả sheet:** Staff đủ grants có được loại một sheet khỏi riêng batch
  bằng ack/reason mà không Owner không? Hiện source có thể làm vậy. Khuyến nghị
  Owner duyệt thay scope khi sheet chứa canonical data; alternative Staff explicit
  batch selection có audit. Khác nhau ở quyền loại dữ liệu, không chỉ JSON shape.
- **CA-019 — thời điểm N6:** sau movement mới, freshCAS có cho observation cũ của lô
  mới không, và relevant events xét lot/Ingredient/Store? Source chưa explicit lower
  bound. Khuyến nghị chặn relevant later events, giữ opening current; alternative
  accept past real event với cảnh báo/audit explicit. Có hệ quả chronology/tồn kho.
- **CA-002 — reason:** người dùng phải nhập lý do mọi insert/NO_OP hay chỉ correction/
  merge/count? Baseline prose/DTO conflict. Khuyến nghị mandatory khi thay số liệu;
  alternative universal reason để audit, tăng bước nhập. Chưa tự chọn BE/prose authority.

CA-016 bounds là thêm một remediation quan trọng có ảnh hưởng integration, nhưng có
thể giao technical compatibility proposal; chưa tự chọn128/1000 hay money precision.
Không hỏi lại limits20/20MiB/100MiB, daily-total/disjoint, winner/requirements/FEFO.
Không coi implementation backlog là product OPEN; không triển khai remediation lúc audit.

## 8. Verification và audit limits

**Không chạy tests mới.** Source/test names là specs; verified historical execution
chỉ theo task notes, không filesystem-presence proof. S45 affected173(235.49s),
final47pass/1fail + rerun1; S46 critical105(200.60s), affected61(127.98s), boundary16
(20.52s). Batch13/affected48, shared106/affected34 cũng overlapping. Không cộng
counts/full-suite. PG rollback/fresh-session/concurrency/recovery là historical,
không mock mới chứng minh. CA-019/020 chưa runtime reproduce; targeted notes không
chứng minh hai boundary đó được covered. Provider live-quality/SMTP/browser/load và
production schema rollout unverified.

OpenAPI offline: patch Settings.__init__ ép _env_file=None **trước import main**
(module-level app cũng vậy), workerfalse; Engine.connect/raw_connection raise; no
lifespan/network/provider. Không đọc .env thật. OpenAPI không runtime acceptance.
Baseline CRC/manifest/paths, current schema diff, route inventory có machine evidence.
Sau audit hash lại toàn bộ app/docs/tests/scripts/alembic/AGENTS/ZIP cũ và HEAD/index;
chỉ report/runtime/packaging artifacts mới. Xem ZIP README/manifest/verification cho
source origins/sanitization/omissions. Evidence bundle không runnable full repo,
không API keys/tokens thật/DB uploads/model binaries hoặc toàn bộ ZIP cũ.

### Packaging / bảo toàn snapshot đã kiểm

Baseline303 entries/302 manifest hashes/CRC/path safety verified. Current OpenAPI
được generate lần nữa với socket connect guard, kết quả giống hệt schema đã diff.
Archive đã đọc lại CRC/unique safe paths/từng SHA-256 và exact selected baseline bytes.
Secret pattern scan không còn suspicious locations; baseline config là placeholders
đã có trong bản giao. Current config URL chỉ redact trong COPY (lines19/20), source
hash và redaction locations ghi rõ. Không in suspected credential values.
480 protected files gồm app/docs/tests/scripts/alembic/AGENTS và hai baseline ZIP
không đổi SHA-256, index empty, HEAD unchanged, không status entries cũ bị mất.
Chỉ report/ZIP mới và ignored audit artifacts. Packaging PASS không API/runtime gate.


## 9. Remediation hiện hành — 11/10/2026 / S4.7

ACCEPTED DECISION: attachment aba07527 đã chốt CA-002/016/019/020/021 và H01/H02.
CURRENT FACT: targeted implementation/evidence ở
[task notes](docs/runbooks/S47_TASK_NOTES.md); không xóa finding lịch sử bên trên.

| Finding | Trạng thái remediation | Source và test evidence |
| --- | --- | --- |
| CA-002 | RESOLVED trong scope effective I05 actions | CommitRequest.reason optional; import_commit.commit_rows bắt buộc correction/merge/count/amend. test_sales_correction_http_requires_effective_action_reason_before_acceptance, test_pure_insert_commit_does_not_require_user_reason và unit effective actions. Confirm_review/source/action reasons giữ nguyên. |
| CA-016 | RESOLVED bounds/descriptor matrix; legacy compatibility explicit | import_scalars.Money18/18; domain.money; typed writers/storage exact; Text1000 khác Code128; import_descriptors.options. test_money_and_long_quantity_persist_exact_without_scale_rounding và test_money_is_not_quantity_and_retained_legacy_evidence_is_explicit. Historic evidence giữ exact; old oversized commit409 LEGACY_MONEY_REVIEW_REQUIRED, không round. |
| CA-019 | RESOLVED opening vs receipt temporal boundary | stock_writes.receive + stock_observation.validate_opening_observation dưới shared fence; scoped evidence repository. Audit PG tests old observation/freshCAS, other Ingredient, existing physical lot, late receipt và real concurrent writes; không tự thêm TTL/history correction. |
| CA-020 | RESOLVED approved Staff own-batch selection | ImportStagingUseCases.resolve ownership + existing ack/reason/terminal/invalidation; targeted own-batch IGNORE giữ profile, other actor403, completed guard/quota. Không mở Owner profile privileges. |
| CA-021 | RESOLVED competing clauses trong các surface đã thay đổi | Current-state/roadmap/contracts/feature bounds/reason/timeline đồng bộ; các đoạn absence và audit snapshot cũ gắn HISTORICAL INFORMATION. Changelog ghi wire/retained compatibility. |
| CA-018 / H01/H02 ownership | RESOLVED slice ownership; implementation REMAINING | ROADMAP S4.10 history/read; approved v1, không deferred; chưa triển khai ở S4.7. |

CA-* khác không được tự chuyển thành RESOLVED do gate này: các authorized wire
extensions giữ nguồn/evidence lịch sử; FE handoff sync/codegen và các routes S4.8–10
vẫn REMAINING. CAT12 N20–N22 nay HTTP, tăng34→37 core; không53 implemented claim.
[Compatibility changelog](docs/CONTRACT_COMPATIBILITY_CHANGELOG_VI.md) phân biệt
new input bounds với retained output exception. ZIP baseline/evidence không đổi,
không tạo handoff mới hoặc chạy provider/engine để hợp thức hóa các findings.
