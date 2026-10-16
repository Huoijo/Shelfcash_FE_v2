# #004 — Import flow: clarification cho BE sau rà soát package

Rà lại: 11/10/2026 · 9 areas, 3 follow-up questions · Chỉ cập nhật báo cáo này, không thay code/contracts.

## A. Short context

**Đính chính báo cáo ban đầu:** đã rà toàn bộ 27 file của `api-contract-v1` (10.503 dòng, chia đọc đầy đủ trong nhóm). V1 đã có core mapping shapes, nhiều typed resolutions/domain semantics, quyền và refresh rules; không đúng nếu gọi tất cả là thiếu DTO. Đồng thời workspace hiện có `api-contract-v2`: đã kiểm tra có trọng tâm Import/current OpenAPI và evidence liên quan, **không claim đã đọc toàn bộ V2**. V2 cung cấp schema cụ thể cho phần lớn câu hỏi cũ; blocker chính của FE là chưa đồng bộ snapshot/wire, không phải BE chưa công bố các DTO đó.

Nguồn hiện hành để đối chiếu: [V2 README/authority](../../../contracts/history/v2/README_VI.md), [delta](../../../contracts/history/v2/CONTRACT_HANDOFF_DELTA_VI.md), [FE checklist](../../../contracts/history/v2/FE_UPDATE_CHECKLIST_VI.md), [OpenAPI](../../../contracts/history/v2/generated/openapi.json). V2 là supplement trình bày baseline10/10→S4.11, không tự đổi `/api/v1` thành `/api/v2`. V1 và [003](../003/003-import-flow-integration.md) vẫn là evidence theo snapshot cũ; câu “S4.5/S4.6 chưa bắt đầu” không còn mô tả BE mới. Evidence triển khai/tests của V2 là **reported**, chưa được chạy lại ở FE trong lần rà tài liệu này; A03 connection refusal trong 003 chỉ là kết quả kiểm tra trước đó, không phải live probe mới.

## B. Clarification table

Các route tương đối `/api/v1`. `Đã có` nghĩa schema/evidence nằm trong V2, không phải FE đã tích hợp hoặc live-verified. Không trộn shape FE0/V1 với wire V2.

| Area | Current FE understanding | Missing clarification | Why it blocks FE |
| --- | --- | --- | --- |
| M01 | `GET /imports/{id}/mapping-summary`; typed `MappingSummary`, `SheetInfo`, `BindingRef`, `ProfileProposal`/`ProfileSpec`. `Progress` chỉ có total_fields/completed_fields/unresolved; files là FileView[], không shape grouped cũ. | **Đã có DTO.** Chỉ còn câu2: matching approved spec để Owner so sánh proposal; không thiếu toàn bộ spec/evidence. | FE cần adapter/grouping từ refs; không yêu cầu lại core progress hoặc suy readiness từ queue page. |
| M02 | `GET /imports/{id}/mappings`; `MappingList={items,counts:Progress}`, meta pagination; item dùng `status`, `source_header`, `samples`, typed issue/origin/profile refs. | **Đã có DTO.** Không có old `filter_counts`/queue mapping_revision; không yêu cầu BE tạo lại shape FE0. Per-state histogram không được wire cung cấp. | FE phải đổi validation/names; không đếm page để dựng badges. Counts trước status filter, không page totals. |
| M03 | `GET /imports/{id}/sheets/{sheet_id}/field-options`; typed FieldOptions/FieldOption/SchemaDescriptor, requiredness, nullable, unit semantics, support, input_sources/help và shared scopes. | **Đã có DTO.** Không còn blocker “requiredness/unit semantics chưa có schema”. Search/category/ordering mới không phải điều kiện bắt buộc. | Bỏ assumption unknown vô điều kiện sau khi adapter theo đúng schema; không hardcode catalog hoặc dùng label làm ID. |
| M04 | `PATCH /imports/{id}/mappings/{mapping_id}`; TargetRequest hoặc ResolveRequest-Input union7 kinds; MappingUpdated200 có status/revision/progress/sheets/proposal revision/approval. CAS mapping revision + key. | **Đã có DTO.** Identity/conversion/ignored/new_entity/source_context/sheet_type/shared_value variants đều có schema. Route-table import-CAS wording là drift đã nhận diện; precise operation dùng mapping CAS. | FE đang chỉ wire column target; phải bổ sung đúng variants, nullable fields và response shape; không chờ BE mô tả lại. |
| I05 Preview | Cùng `POST /imports/{id}/process`, preview202→J01→I04. PreviewRow before/after là nullable tagged union9 domains; counts là ClassificationCounts, bindings typed. I04 hỗ trợ include_preview và include allowlist. | **Đã có DTO/query.** PreviewPage có stale/rows_page. Cần FE dùng pin và source/config semantics đã công bố, không hỏi lại full domain union. | FE validation/fixtures cũ chưa khớp current nine-schema wire, không phải preview DTO không tồn tại. |
| Commit | Cùng I05: **preview202 → confirm_review200 → commit202**. ConfirmReviewRequest/ReviewConfirmation/CommitAccepted typed; supplier_changes ở top-level, action_id=PreviewRow.row_id. | **Đã có request/receipt.** FE còn thiếu confirm_review API/state và supplier/sales UI; reason chỉ bắt buộc cho effective correction/merge/count/amend, không mọi insert/NO_OP. | Checkbox FE không thay server confirmation; thiếu phase/revision mới sẽ chặn commit dù đã có full schema. |
| I06 | `GET /imports/{id}/completion`; ImportCompletion/CompletionSummary có counts/impacts/canonical references, audit UUID; evaluated_actions/omitted_actions nằm **trong readiness**. | **Đã có DTO.** Failure qua I04/J01; no_changes/null/zero và retained point-in-time readiness đã định nghĩa. | FE cần render retained receipt theo current shape; không derive counts hoặc thành công từ202. |
| Resume | Checklist đã có H02→I04/I06; known import_id dùng I04/actions/active_job_id, J01 và pinned preview. Old cursors invalid khi process restart, phải refresh paging. | **Một phần là FE scope.** Câu3 chỉ xin acceptance/retention limits cho từng Import stage; không yêu cầu endpoint active-import mới hoặc BE quyết định FE route. | FE memory-only/deep-link là phần chưa triển khai; restart evidence C03/PDF không tự chứng nhận Import re-entry. |
| Permissions/approval | N5 Owner-only và catalogue/current fences đã có. V2 cho Staff IGNORE own uncommitted whole sheet không N5 riêng; reused-column edit fork proposal, cần approval mới, không sửa active profile. | **Policy đã có.** Full spec/evidence schema có sẵn; chỉ narrow comparison-baseline question2. Không mở lại Owner/Staff rules. | FE phải phân biệt ignore sheet, ignored field binding, reusable profile approval và per-import confirm_review. |

## C. Exact questions for BE

1. **Deployed snapshot:** Môi trường FE sẽ gọi có chạy đúng OpenAPI S4.11 trong V2 không? Xin reachable URL, schema/version/hash và Auth/Store/worker prerequisites không chứa secrets.
2. **Owner comparison:** `include_profile_details=true` có bảo đảm trả approved spec khớp proposal.profile_id/active_version trong approved_profiles không? FE được dựng display-only diff từ hai exact specs đó, hay còn response nào chứa canonical diff? Không dùng latest/unrelated spec khi không khớp.
3. **Reload/restart acceptance:** Những Import stages nào đã được kiểm chứng re-entry bằng I04/M01/pinned preview/J01/I06 sau refresh/process restart, và retention/expiry limits hiện hành là gì? Xin evidence hoặc ghi rõ chưa verified; không suy implementation thiếu từ việc chưa có UI.

Ưu tiên thực tế: đồng bộ FE với V2 (nhất là M01/M02 response và confirm_review), xác minh môi trường cùng snapshot, rồi whole-chain UI acceptance. Câu2 là presentation/completeness guarantee hẹp; câu3 là verification/operational boundary, không còn broad missing-DTO claim. Nếu không có matching comparison baseline thì hiển thị unavailable và không claim review đủ diff.

## D. Already resolved

- **Batch mechanics đã đóng, không hỏi lại:** 20 files/batch, 20 MiB/file, 100 MiB accepted source bytes/batch; multi-call accumulation, partial admission, rejected receipts, I04 canonical quota, I02 retry/idempotency, I03 seal lifecycle, accepted/rejected count và byte accounting.
- M02 có5 states đã chốt, ignored flag riêng; M03 context-specific descriptors. V1 đã có core IDs/header/options/response/refresh behavior và một phần non-column variants. V2 OpenAPI cung cấp đầy đủ current wire: không yêu cầu republish tất cả vì FE đang dùng old shape.
- M04 column method/path/body và mapping CAS đã hiểu. POST/PATCH idempotency/current reauthorization, CAS428/412, state409 và validation422 giữ per-route rules; không tạo policy/key mới hoặc retry blind. Reused-column edit chỉ fork proposal, không mutate approved spec tại chỗ.
- Preview immutable/pinned; batch proposal/binding revision hoặc captured DB read-set đổi thì invalidate commit, không sửa preview cũ. Active profile mới không tự migrate/invalidate pin cũ còn authorized; explicit retirement chặn pin chưa commit. Commit explicit, nguyên tử toàn batch; không partial writes, optimistic success hay retry blind.
- M04 proposal ≠ N5 Owner approval ≠ per-import confirm_review ≠ canonical commit. Không Manager role mới hoặc one-time approval bypass. Whole-sheet Staff IGNORE exception đã có trong current V2; không áp nó để bypass approval cho reusable profile/ignored field binding.
- J01 states/context/result union, failed HTTP200, unknown progress=null, polling2000/nonterminal và0/terminal đã định nghĩa (§14.5). I06 retained readiness là point-in-time; R01 là current readiness (§14), không cần quyết định lại hai semantics này.
- **Implementation status đã có evidence mới:** V2 delta ghi exact M01–M04/I05/I06/J01/R01 đã implement, có targeted/API E2E evidence theo scope; không còn dùng V1 “commit chưa bắt đầu” làm current claim. Không đồng nghĩa live/staging ready ở máy FE, full regression hoặc whole-chain browser PASS. V2 verification còn ghi offline OpenAPI gate9 passed/1 failed do stale Auth path inventory; không che failure.

## E. Requested BE response format

Chỉ trả lời3 câu còn lại; với DTO đã có, dẫn component/operation hiện hành thay vì thiết kế lại. Nếu có deviation/deployment mới, ghi theo format sau cho endpoint bị ảnh hưởng (không yêu cầu điền lại toàn bộ9 surfaces):

```yaml
endpoint: M01 # chỉ endpoint liên quan follow-up/deviation
status: CONTRACT_ONLY | IMPLEMENTED | TESTED | STAGING_READY
method_path: ... # giữ canonical route; ghi rõ prefix
dto_version: ...
request_dto: ... # current OpenAPI ref; chỉ ghi khác biệt/clarification nếu có
response_dto: ... # current OpenAPI ref; baseline matching/retention guarantee nếu liên quan
revision_cas_rules: ... # exact token/header, validation and invalidation
idempotency_rules: ... # scope/digest/replay; GET: not applicable
important_error_codes: ... # HTTP/domain code + typed details
contract_v1_deviations: ... # none hoặc exact khác biệt và authority/version
implementation_evidence: ... # OpenAPI/schema, handler, executed tests + environment/date
staging_access: ... # reachable URL và non-sensitive setup prerequisites, nếu ready
```

Không gửi credentials, session cookies, CSRF tokens hoặc customer files. `TESTED` cần evidence đúng scope; `STAGING_READY` cần reachable environment và Auth/Store/worker preconditions. Không coi schema fixtures hoặc API E2E là whole-chain UI acceptance.

### Audit trace / giới hạn

- **V1 đọc toàn bộ:**6 root domain/umbrella contracts; mechanics supplement; README, packaging report, manifest; toàn bộ17 references (AGENTS/API_CONTRACT/CURRENT_STATE/FE0,6 ADRs,5 features, report và runbook). Tổng27 files/10.503 dòng; references lịch sử không override root policy. Catalog/Inventory/Procurement bổ sung business semantics, không tự biến internal/read DTO thành Import preview wire.
- **V2 kiểm tra có trọng tâm:** README/delta/checklist/verification, current Import clauses, Import feature docs và các refs OpenAPI của M01–M04/N5/I04/I05/I06/J01/R01. Schema anchors: MappingSummary/Progress/MappingList/FieldOption/ResolveRequest-Input, PreviewRow/ClassificationCounts, ConfirmReviewRequest/CommitAccepted, ImportCompletion/CompletionReadiness. Không đọc/claim audit toàn bộ V2 hoặc chạy BE commands/runbooks.
- **Evidence giới hạn:** [S411 notes](../../../contracts/history/v2/docs/runbooks/S411_TASK_NOTES.md) ghi restart A03/C03/PDF; chưa chứng nhận riêng toàn Import re-entry. [Staging feature](../../../contracts/history/v2/docs/features/IMPORT_STAGING_PREVIEW.md) ghi cursor restart/recovery limits. Cold-retained performance debt trong V2 nói Planning C03, không phải bằng chứng lỗi Import resume.
- Đối chiếu FE: [types](../../../src/features/import-data/importFlow.types.ts), [validation](../../../src/features/import-data/importFlow.validation.ts), [data](../../../src/features/import-data/importFlow.data.ts), [workflow](../../../src/features/import-data/importFlow.workflow.ts). `unsupportedFields` do FE hiện tại không chứng minh schema thiếu trong BE package. Lần này chỉ sửa004, giữ003 như historical M08 handoff; không đổi implementation, contracts hoặc tự nhận live acceptance.
