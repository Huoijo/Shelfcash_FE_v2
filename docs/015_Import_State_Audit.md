# 015 — Import state audit before implementation

14/10/2026. Business → MagicPath → frontend mapping. Latest component source was fetched read-only, not reused from revision 013/014.

Runtime target: contracts/011/openapi.main.json. Full missing-design register: [FOUND_MISSING_UI.md](FOUND_MISSING_UI.md). Prototype demo counts and fake candidate IDs are never runtime evidence.

## OWNER — 62 design states

- `01-empty` → ImportUpload / ImportBatchWorkflow; admission/retry guards retained. Partial upload/source-set UX → FM-005.
- `01-ready` → ImportUpload / ImportBatchWorkflow; admission/retry guards retained. Partial upload/source-set UX → FM-005.
- `01-upload-failed` → ImportUpload / ImportBatchWorkflow; admission/retry guards retained. Partial upload/source-set UX → FM-005.
- `01-unsupported` → ImportUpload / ImportBatchWorkflow; admission/retry guards retained. Partial upload/source-set UX → FM-005.
- `01-duplicate` → ImportUpload / ImportBatchWorkflow; admission/retry guards retained. Partial upload/source-set UX → FM-005.
- `02-running` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-complete` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-failed` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-source` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-ambiguous` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-no-profile` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-drift` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-retired` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `03-resolved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-overview-unresolved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03a-view` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03a-editing` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03a-unresolved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03a-duplicate` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03a-ignore` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03a-error` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03a-saved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03b-resolved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03b-unresolved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03b-search` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03b-ambiguous` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03b-selected` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03b-permission` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03c-view` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03c-missing` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03c-editing` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03c-validation` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03c-saved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03d-compatible` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03d-conversion` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03d-needs` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03d-unsupported` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03d-saved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `04-review` → ImportProfileReview / N5; error designs exist. Baseline/reason/ack controls → FM-002; uncertain save → FM-007.
- `04-approved` → ImportProfileReview / N5; error designs exist. Baseline/reason/ack controls → FM-002; uncertain save → FM-007.
- `04-failed` → ImportProfileReview / N5; error designs exist. Baseline/reason/ack controls → FM-002; uncertain save → FM-007.
- `04-changed` → ImportProfileReview / N5; error designs exist. Baseline/reason/ack controls → FM-002; uncertain save → FM-007.
- `04-handled` → ImportProfileReview / N5; error designs exist. Baseline/reason/ack controls → FM-002; uncertain save → FM-007.
- `04-rejected` → ImportProfileReview / N5; error designs exist. Baseline/reason/ack controls → FM-002; uncertain save → FM-007.
- `04-retired` → ImportProfileReview / N5; error designs exist. Baseline/reason/ack controls → FM-002; uncertain save → FM-007.
- `04-permission` → ImportProfileReview / N5; error designs exist. Baseline/reason/ack controls → FM-002; uncertain save → FM-007.
- `05-preview` → ImportPreviewExplorer / previewCanContinue; paging and immutable pin retained. Raw cells/counters/stockout not in T remain API limitations; no fabricated demo.
- `05-review` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `05-processing` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `05-warning` → ImportPreviewExplorer / previewCanContinue; paging and immutable pin retained. Raw cells/counters/stockout not in T remain API limitations; no fabricated demo.
- `05-blocked` → ImportPreviewExplorer / previewCanContinue; paging and immutable pin retained. Raw cells/counters/stockout not in T remain API limitations; no fabricated demo.
- `05-stale` → ImportPreviewExplorer / previewCanContinue; paging and immutable pin retained. Raw cells/counters/stockout not in T remain API limitations; no fabricated demo.
- `05-failed` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `05-uncertain` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `05-permission` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `05-profile-retired` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `06-ready` → ImportResult / I06 then independent ImportReadiness / R01; ready/not-ready/warnings designs exist; unknown/permission/date states → FM-008.
- `06-not-ready` → ImportResult / I06 then independent ImportReadiness / R01; ready/not-ready/warnings designs exist; unknown/permission/date states → FM-008.
- `queue` → History existing route; queue/profile lifecycle are explicitly designed secondary surfaces but underconstruction/runtime-pending and untouched.
- `profiles-active` → History existing route; queue/profile lifecycle are explicitly designed secondary surfaces but underconstruction/runtime-pending and untouched.
- `profiles-retired` → History existing route; queue/profile lifecycle are explicitly designed secondary surfaces but underconstruction/runtime-pending and untouched.
- `history` → History existing route; queue/profile lifecycle are explicitly designed secondary surfaces but underconstruction/runtime-pending and untouched.

## STAFF — 72 design states

- `01-empty` → ImportUpload / ImportBatchWorkflow; admission/retry guards retained. Partial upload/source-set UX → FM-005.
- `01-ready` → ImportUpload / ImportBatchWorkflow; admission/retry guards retained. Partial upload/source-set UX → FM-005.
- `01-upload-failed` → ImportUpload / ImportBatchWorkflow; admission/retry guards retained. Partial upload/source-set UX → FM-005.
- `01-unsupported` → ImportUpload / ImportBatchWorkflow; admission/retry guards retained. Partial upload/source-set UX → FM-005.
- `01-duplicate` → ImportUpload / ImportBatchWorkflow; admission/retry guards retained. Partial upload/source-set UX → FM-005.
- `01-conflict` → ImportUpload / ImportBatchWorkflow; admission/retry guards retained. Partial upload/source-set UX → FM-005.
- `02-running` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-complete` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-failed` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-source` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-ambiguous` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-no-profile` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-drift` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-retired` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `02-provider` → ImportAnalyze / analyzeAssessment; source proof → FM-004. Candidate selection is visually designed but current DTO is unavailable; API limitation, not missing UI.
- `03-ready` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-manual` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-duplicate` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-id-unresolved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-id-ambiguous` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-new-entity` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-new-entity-blocked` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-missing-declaration` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-unit` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-permission` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-spec-changed` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-submit` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-waiting` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-approved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-rejected` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-sales-correction` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-correction-conflict` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-map-view` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-map-editing` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-map-manual` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-map-duplicate` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-map-ignore` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-map-reusable` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-map-saved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-map-error` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-id-resolved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-id-unresolved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-id-search` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-id-ambiguous` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-id-selected` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-id-permission` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-dec-view` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-dec-missing` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-dec-editing` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-dec-error` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-dec-saved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-unit-compatible` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-unit-conversion` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-unit-needs` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-unit-unsupported` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `03-ui-unit-saved` → Shared Resolve overview + focused 3A/3B/3C/3D drawer. Source/spec/grants determine resolution. Conditional gaps → FM-001/004/006/007/009; sales branch → FM-010.
- `04-preview` → ImportPreviewExplorer / previewCanContinue; paging and immutable pin retained. Raw cells/counters/stockout not in T remain API limitations; no fabricated demo.
- `04-warning` → ImportPreviewExplorer / previewCanContinue; paging and immutable pin retained. Raw cells/counters/stockout not in T remain API limitations; no fabricated demo.
- `04-blocked` → ImportPreviewExplorer / previewCanContinue; paging and immutable pin retained. Raw cells/counters/stockout not in T remain API limitations; no fabricated demo.
- `04-stale` → ImportPreviewExplorer / previewCanContinue; paging and immutable pin retained. Raw cells/counters/stockout not in T remain API limitations; no fabricated demo.
- `04-inventory` → ImportPreviewExplorer / previewCanContinue; paging and immutable pin retained. Raw cells/counters/stockout not in T remain API limitations; no fabricated demo.
- `05-review` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `05-processing` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `05-permission` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `05-profile-retired` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `05-preview-stale` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `05-failed` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `05-uncertain` → ImportPreview / ImportFlowWorkflow; review/commit, current rights and exact intent retained. Additional confirmations → FM-003/010/011.
- `06-ready` → ImportResult / I06 then independent ImportReadiness / R01; ready/not-ready/warnings designs exist; unknown/permission/date states → FM-008.
- `06-not-ready` → ImportResult / I06 then independent ImportReadiness / R01; ready/not-ready/warnings designs exist; unknown/permission/date states → FM-008.
- `06-warning` → ImportResult / I06 then independent ImportReadiness / R01; ready/not-ready/warnings designs exist; unknown/permission/date states → FM-008.
- `history` → History existing route; queue/profile lifecycle are explicitly designed secondary surfaces but underconstruction/runtime-pending and untouched.

## Coverage conclusions before coding

- Shared Step 3 cards/drawers now have explicit designs; replace legacy card contents and nested File/Sheet dashboard rather than preserving old FE composition.
- Latest source explicitly retains OWNER FLOW / STAFF FLOW and product step eyebrows; keep them, remove FE-only explanations.
- Resolver designs differ slightly in detailed Owner/Staff markup, but agree on 2-column overview, 500px drawer and focused Save/Cancel footer. Use one shared component family as requested.
- Manual target, duplicate/ignore, candidate search/explicit selection, declaration-required, exact-unit states have designs. New entity metadata, some required protocol inputs and context/paging variants do not; only these belong in the FM register.
- Readiness ready/not-ready and completion warning are designed; unassessed/unknown/error/date/permission are not equivalent to not-ready.
- Current API limits (candidate selection, supplier lookup, some A1/A2 fields and per-batch outcome) do not erase visual design coverage and must not be mislabeled as missing UI.

## Frozen Design Contract v1 — audit bổ sung 14/10/2026

Authority mới thay revision của audit ban đầu: OWNER component `460747146686242816`, revision `461110616439017472`; STAFF component `460747115572916224`, revision `461109945690124288`. Project `458079658328604672`. Legacy component `458395069779681280` được quarantine: không đọc/port làm reference cho pass này.

Đã lấy editable code context của đúng revision, xem stored preview của cả hai; inspect catalog và các surfaces ResolverScope, AdvancedImport, ContextPrimitives, DeclarationContext, SourceContext, MutationRecovery, ResolverMutationRecovery, ReviewCommit, DomainReview, Wave7ProfileDecision, CSS và controller để phân biệt product behavior với prototype plumbing. Không copy controller, sessionStorage, DOM action bridges, MutationObserver hay simulated timers sang business workflow.

Business authority vẫn là `SHELFCASH_IMPORT_NAM_NGUYEN.docx` được user xác nhận không đổi. Runtime authority: `contracts/011/openapi.main.json`, generated `importFlow.wire.ts`, current validators/data clients. Repository architecture: AppRouter → AuthGuard → StoreProvider/StoreGate → AppShell → ImportWorkspace; authenticated permissions/current Store giữ nguyên. Các phase được suy từ workflow, không từ scenario picker.

Thay đổi đáng chú ý so với audit trước: cả 12 FM đã có design surface, nhưng design-ready không tự resolve implementation/API dependencies. Xem status mới ở `FOUND_MISSING_UI.md` và receipt 015.

### Mapping frozen surface → production state boundary

- File/partial/confirm set → ImportUpload + ImportUploadAdmission + ImportBatchWorkflow. Không dùng hard-coded accepted list; retry receipt đã rejected là intent mới, uncertain upload chỉ readback.
- Analyze/source → ImportAnalyze, AnalyzeAssessment, ImportSourceContext + SourceContextEditor; nguồn/evidence typed M04. Data period và source display catalogue chưa có current contract tương ứng.
- Resolve 3A/B/C/D + scope conditions → shared ImportResolveOverview/ImportResolveDrawer, M01 global authority, M02 scoped/paged rows, M03 field descriptors. Single navigation counter chỉ đếm current loaded category, không giả total toàn import.
- Entity creation → current M04 new_entity_proposal metadata; chưa có immediate current-import create+bind capability. Không báo entity đã tạo chỉ từ proposal ACK.
- Declarations → SharedValueEditor giữ typed value, explicit scope và source replacement ack/reason. Chỉ replacement đúng source column đang có evidence; không tự mượn evidence cột khác.
- Exact units → explicit units + rational factor + evidence, không suy target unit từ sample cuối.
- Profile first/changed/full/reject/retire → ImportProfileReview + ImportProfileSpecification, whole-spec N5 decisions/CAS. M01 không có requester/submission timeline và authoritative rejection outcome đầy đủ.
- No reusable change → M01 can_preview + không có proposal: Owner tiếp tục Preview, không tạo version mới.
- STAFF submit/wait/approved/rejected → existing DEV gateway chỉ trong fixtures; production manual handoff/read current M01. Không nhận notification/queue như runtime.
- Domain review → ImportDomainReview mở row drawer từ Preview, typed Sales/Supplier intent; guards ở navigation, Review và Commit. Current I05 chỉ persist các quyết định này trong commit, không có separate domain-decision save.
- Review/Commit → hai phase riêng; review receipt pins + independent reasons/acks. Commit phase khóa cho tới khi confirmation usable và không có domain blocker.
- Mutation recovery → existing reads, no replay từ uncertain product recovery. M04 khi exact persisted issue khớp thì saved; Profile/negative outcome chưa đủ authority thì unknown/locked.
- Commit uncertainty → I04 + J01/I06 retained result, không tạo commit mới.
- Completion/Readiness → ImportResult + ImportReadiness, receipt bất biến; R01 date/current permission scoped, unknown khác blocked.

Catalog dưới đây là inventory thiết kế, KHÔNG phải danh sách trạng thái đã chạy against live backend. Secondary queue/active/retired/profile list/history nằm ngoài scope thay thế shell/underconstruction.

### Frozen catalog inventory

OWNER: 160 scenario entries (gồm secondary surfaces và aliases).

- 01 · File: `01-empty`, `01-ready`, `01-upload-failed`, `01-unsupported`, `01-duplicate`, `01-partial`, `01-partial-can`, `01-partial-must`, `01-retrying`, `01-ack-checking`, `01-ack-confirmed`, `01-ack-unknown`, `01-confirm-set`.

- 02 · Analyze: `02-running`, `02-complete`, `02-failed`, `02-source`, `02-source-evidence`, `02-source-custom`, `02-source-locale`, `02-source-period`, `02-source-amendment`, `02-source-validation`, `02-source-confirmed`, `02-ambiguous`, `02-no-profile`, `02-drift`, `02-retired`.

- 03 · Resolve overview: `03-resolved`, `03-overview-unresolved`, `03-sales-correction`, `03-correction-conflict`.

- 03A · Mapping: `03a-view`, `03a-editing`, `03a-unresolved`, `03a-duplicate`, `03a-ignore`, `03a-error`, `03a-saved`, `03a-mutation-saving`, `03a-mutation-failed`, `03a-mutation-uncertain`, `03a-mutation-checking`, `03a-mutation-saved`, `03a-mutation-unknown`, `03a-mutation-not-saved`.

- 03B · Identity: `03b-resolved`, `03b-unresolved`, `03b-search`, `03b-ambiguous`, `03b-selected`, `03b-permission`, `03b-create-no-match`, `03b-create-form`, `03b-create-validation`, `03b-create-duplicate`, `03b-create-permission`, `03b-create-creating`, `03b-create-failed`, `03b-create-created`, `03b-create-created-reusable`.

- 03C · Declarations: `03c-view`, `03c-missing`, `03c-editing`, `03c-validation`, `03c-batch-only`, `03c-reusable-editing`, `03c-source-value`, `03c-editing-replacement`, `03c-validation-replacement`, `03c-error-permission`, `03c-error-save`, `03c-saved`.

- 03D · Units: `03d-compatible`, `03d-conversion`, `03d-needs`, `03d-unsupported`, `03d-saved`, `03d-exact-needs`, `03d-exact-editing`, `03d-exact-invalid`, `03d-exact-evidence`, `03d-exact-permission`, `03d-exact-failed`, `03d-exact-saved`.

- 04 · Profile approval: `04-review`, `04-review-full`, `04-review-first`, `04-review-staff`, `04-review-no-change`, `04-approve-ready`, `04-approve-decision-saving`, `04-approve-decision-failed`, `04-approve-decision-uncertain`, `04-approve-decision-checking`, `04-approve-decision-unknown`, `04-approve-decision-not-saved`, `04-approved`, `04-reject`, `04-reject-decision-saving`, `04-rejected`, `04-changed`, `04-handled`, `04-permission`, `04-retired`.

- 05 · Preview: `05-preview`, `05-warning`, `05-blocked`, `05-stale`, `05-sales-correction-preview`, `05-sales-correction-detail`, `05-sales-correction-confirmed`, `05-sales-correction-disjoint`, `05-sales-correction-conflict`, `05-sales-correction-permission`, `05-sales-correction-save-failed`, `05-supplier-preview`, `05-supplier-changed`, `05-supplier-missing-effective`, `05-supplier-fee`, `05-supplier-conflict`, `05-supplier-permission`, `05-supplier-confirmed`, `05-supplier-save-failed`.

- 05 · Review / Commit: `05-review-domain-summary`, `05-review-domain-blocked`, `05-review-not-confirmed`, `05-review-confirming`, `05-review-failed`, `05-review-uncertain`, `05-review-confirmed`, `05-review-expired`, `05-review-permission`, `05-commit-ready`, `05-commit-permission`, `05-commit-profile-retired`, `05-commit-preview-stale`, `05-processing`, `05-failed`, `05-uncertain`.

- 06 · Completion / Readiness: `06-ready`, `06-not-ready`, `06-not-assessed`, `06-selecting`, `06-loading`, `06-ready`, `06-not-ready`, `06-unknown`, `06-unavailable`, `06-permission`, `06-warning-ready`, `06-warning-not-ready`.

- Secondary · Staff approval queue: `queue`.

- Secondary · Active profiles: `profiles-active`, `profiles-retire-decision`, `profiles-retire-decision-saving`, `profiles-retire-decision-uncertain`, `profiles-retire-decision-confirmed`.

- Secondary · Retired profiles: `profiles-retired`.

- Secondary · Import history: `history`.

STAFF: 149 scenario entries (gồm secondary surfaces và aliases).

- 01 · File: `01-empty`, `01-ready`, `01-upload-failed`, `01-unsupported`, `01-duplicate`, `01-partial`, `01-partial-can`, `01-partial-must`, `01-retrying`, `01-ack-checking`, `01-ack-confirmed`, `01-ack-unknown`, `01-confirm-set`, `01-conflict`.

- 02 · Analyze: `02-running`, `02-complete`, `02-failed`, `02-source`, `02-source-evidence`, `02-source-custom`, `02-source-locale`, `02-source-period`, `02-source-amendment`, `02-source-validation`, `02-source-confirmed`, `02-ambiguous`, `02-no-profile`, `02-drift`, `02-retired`, `02-provider`.

- 03 · Resolve overview: `03-ready`, `03-manual`, `03-id-unresolved`, `03-id-ambiguous`, `03-missing-declaration`, `03-unit`, `03-permission`, `03-spec-changed`, `03-sales-correction`, `03-correction-conflict`.

- 03A · Mapping: `03-ui-map-view`, `03-ui-map-editing`, `03-ui-map-manual`, `03-ui-map-duplicate`, `03-ui-map-ignore`, `03-ui-map-reusable`, `03-ui-map-error`, `03-ui-map-saved`, `03-ui-map-mutation-saving`, `03-ui-map-mutation-failed`, `03-ui-map-mutation-uncertain`, `03-ui-map-mutation-checking`, `03-ui-map-mutation-saved`, `03-ui-map-mutation-unknown`, `03-ui-map-mutation-not-saved`.

- 03B · Identity: `03-ui-id-resolved`, `03-ui-id-unresolved`, `03-ui-id-search`, `03-ui-id-ambiguous`, `03-ui-id-selected`, `03-ui-id-permission`, `03b-create-no-match`, `03b-create-form`, `03b-create-validation`, `03b-create-duplicate`, `03b-create-permission`, `03b-create-creating`, `03b-create-failed`, `03b-create-created`, `03b-create-created-reusable`.

- 03C · Declarations: `03-ui-dec-view`, `03-ui-dec-missing`, `03-ui-dec-editing`, `03-ui-dec-error`, `03c-batch-only`, `03c-reusable-editing`, `03c-source-value`, `03c-editing-replacement`, `03c-validation-replacement`, `03c-error-permission`, `03c-error-save`, `03-ui-dec-saved`.

- 03D · Units: `03-ui-unit-compatible`, `03-ui-unit-conversion`, `03-ui-unit-needs`, `03-ui-unit-unsupported`, `03-ui-unit-saved`, `03d-exact-needs`, `03d-exact-editing`, `03d-exact-invalid`, `03d-exact-evidence`, `03d-exact-permission`, `03d-exact-failed`, `03d-exact-saved`.

- 03 · Owner approval branch: `03-spec-changed`, `03-submit`, `03-waiting`, `03-approved`, `03-rejected`.

- 04 · Preview: `04-preview`, `04-warning`, `04-blocked`, `04-stale`, `04-inventory`, `04-sales-correction-preview`, `04-sales-correction-detail`, `04-sales-correction-confirmed`, `04-sales-correction-disjoint`, `04-sales-correction-conflict`, `04-sales-correction-permission`, `04-sales-correction-save-failed`, `04-supplier-preview`, `04-supplier-changed`, `04-supplier-missing-effective`, `04-supplier-fee`, `04-supplier-conflict`, `04-supplier-permission`, `04-supplier-confirmed`, `04-supplier-save-failed`.

- 05 · Review / Commit: `05-review-domain-summary`, `05-review-domain-blocked`, `05-review-not-confirmed`, `05-review-confirming`, `05-review-failed`, `05-review-uncertain`, `05-review-confirmed`, `05-review-expired`, `05-review-permission`, `05-commit-ready`, `05-commit-permission`, `05-commit-profile-retired`, `05-commit-preview-stale`, `05-processing`, `05-failed`, `05-uncertain`.

- 06 · Completion / Readiness: `06-ready`, `06-not-ready`, `06-not-assessed`, `06-selecting`, `06-loading`, `06-ready`, `06-not-ready`, `06-unknown`, `06-unavailable`, `06-permission`, `06-warning-ready`, `06-warning-not-ready`, `06-warning`.

- Secondary · Import history: `history`.

Shared scope conditions: `normal`, `multiple-files`, `multiple-sheets`, `current-unresolved`, `current-complete-more`, `all-scope-resolved`, `loading-scope`, `scope-load-failed`, `empty-scope`, `partial-page`, `loading-more`, `load-more-failed`, `next-unresolved`.
