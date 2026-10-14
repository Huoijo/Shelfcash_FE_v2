# 012 — Import OWNER / STAFF: design → FE → contract

Audit trước implementation, 14/10/2026.

- Business: `docs/SHELFCASH_IMPORT_NAM_NGUYEN.docx`, SHA256 `492f5834625c1d3103eca97ea7c76927cd1511a7c2dfc04ee49cbff1339bd29d`. Trùng bản Downloads. Business document thắng prototype; prose branch A1/A2 không thay thế runtime snapshot T.
- MagicPath OWNER component 460747146686242816, revision 460803015184642048; STAFF 460747115572916224, revision 460804081875824640. Đã đọc toàn bộ TSX state catalog/render branches, CSS và xem preview cả hai. Không dùng component Input flow lịch sử. Không khởi động session chỉnh canvas.
- Runtime: `contracts/011/openapi.main.json`; existing I01–I06 / J01 / M01–M04 / N5 / R01 clients, validators và workflow là authority. Không thêm endpoint DESIGN_READY.

## Shared mapping

- File states → ImportBatchWorkflow local files/validation, I01/I02 receipts/quota/retry. Duplicate/conflict không tự drop accepted files; partial rejected phải acknowledge exact source set trước I03.
- Analyze running/complete/failed → I03 + I04 active_job/status + J01. Completion phải có CTA tiếp tục; không giả progress hoặc suy nguồn từ filename.
- Source/candidates/no-profile/drift/retired → M01/M02 diagnostics + M03 options, M04 source resolution / exact profile pin. Không tự chọn candidate; nếu thiếu descriptor thì giữ blocker.
- Resolve → M02 typed issue_type, M03 descriptors, M04 revision CAS. Phân biệt structure/semantics, identity, declarations/batch facts, units. Không tính scoped counters từ một trang queue.
- Owner approval → proposed full spec + exact active baseline từ M01, N5 lifecycle CAS; reject/retire/permission/conflict có recovery giữ import. Approval không commit.
- Staff approval branch → chỉ M01 profile_proposals báo reusable change; quantities/prices/date không tự kích hoạt nhánh. N5 Owner decision đã có; submit/queue/decision notification chưa có runtime. Handoff exact import URL + refresh trong API mode; DEV mock gateway tách riêng nếu trình diễn submit/wait/decision.
- Preview/review → process preview, J01, I04 exact preview ID/digest/source version + tất cả pages, confirm_review. WARNING ≠ blocked ≠ stale; blocked về Resolve, stale tạo lại. Không loại INVALID khỏi batch.
- Commit → existing atomic process commit/current rights/exact review confirmation; progress từ J01, failure giữ context, uncertain retry giữ intent/key. 403 ≠ retired ≠ stale ≠ system failure.
- Completion → I06 receipt immutable. Readiness R01 action + forecast date riêng, không suy từ import thành công hay snapshot inventory/menu/import readiness.
- Secondary history → existing history route. Store-wide queue/profiles discovery vẫn backend-pending/Underconstruction; không triển khai global fake APIs.

## Full prototype catalog

Mỗi state dưới đây được đối chiếu theo shared mapping phía trên. Các trạng thái nhánh chưa có wire riêng được giữ dưới diagnostics/guard hoặc DEV gateway, không coi là backend runtime parity.

### OWNER

- `01-empty` → upload / local validation + I01–I02.
- `01-ready` → upload / local validation + I01–I02.
- `01-upload-failed` → upload / local validation + I01–I02.
- `01-unsupported` → upload / local validation + I01–I02.
- `01-duplicate` → upload / local validation + I01–I02.
- `02-running` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-complete` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-failed` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-source` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-ambiguous` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-no-profile` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-drift` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-retired` → analyze / I03–I04–J01 + M01 diagnostics.
- `03-resolved` → resolve / M01–M04 + current grants.
- `03-manual` → resolve / M01–M04 + current grants.
- `03-id-unresolved` → resolve / M01–M04 + current grants.
- `03-id-ambiguous` → resolve / M01–M04 + current grants.
- `03-new-entity` → resolve / M01–M04 + current grants.
- `03-missing-declaration` → resolve / M01–M04 + current grants.
- `03-unit` → resolve / M01–M04 + current grants.
- `03-duplicate` → resolve / M01–M04 + current grants.
- `03-permission` → resolve / M01–M04 + current grants.
- `04-review` → profile / M01 + N5.
- `04-approved` → profile / M01 + N5.
- `04-failed` → profile / M01 + N5.
- `04-changed` → profile / M01 + N5.
- `04-handled` → profile / M01 + N5.
- `04-rejected` → profile / M01 + N5.
- `04-retired` → profile / M01 + N5.
- `04-permission` → profile / M01 + N5.
- `05-preview` → preview–review–commit / process + J01 + current grants.
- `05-review` → preview–review–commit / process + J01 + current grants.
- `05-processing` → preview–review–commit / process + J01 + current grants.
- `05-warning` → preview–review–commit / process + J01 + current grants.
- `05-blocked` → preview–review–commit / process + J01 + current grants.
- `05-stale` → preview–review–commit / process + J01 + current grants.
- `05-failed` → preview–review–commit / process + J01 + current grants.
- `05-uncertain` → preview–review–commit / process + J01 + current grants.
- `05-permission` → preview–review–commit / process + J01 + current grants.
- `05-profile-retired` → preview–review–commit / process + J01 + current grants.
- `06-ready` → completion / I06 + separate R01.
- `06-not-ready` → completion / I06 + separate R01.
- `queue` → secondary / existing history or backend-pending.
- `profiles-active` → secondary / existing history or backend-pending.
- `profiles-retired` → secondary / existing history or backend-pending.
- `history` → secondary / existing history or backend-pending.

### STAFF

- `01-empty` → upload / local validation + I01–I02.
- `01-ready` → upload / local validation + I01–I02.
- `01-upload-failed` → upload / local validation + I01–I02.
- `01-unsupported` → upload / local validation + I01–I02.
- `01-duplicate` → upload / local validation + I01–I02.
- `01-conflict` → upload / local validation + I01–I02.
- `02-running` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-complete` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-failed` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-source` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-ambiguous` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-no-profile` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-drift` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-retired` → analyze / I03–I04–J01 + M01 diagnostics.
- `02-provider` → analyze / I03–I04–J01 + M01 diagnostics.
- `03-ready` → resolve / M01–M04 + current grants.
- `03-manual` → resolve / M01–M04 + current grants.
- `03-duplicate` → resolve / M01–M04 + current grants.
- `03-id-unresolved` → resolve / M01–M04 + current grants.
- `03-id-ambiguous` → resolve / M01–M04 + current grants.
- `03-new-entity` → resolve / M01–M04 + current grants.
- `03-new-entity-blocked` → resolve / M01–M04 + current grants.
- `03-missing-declaration` → resolve / M01–M04 + current grants.
- `03-unit` → resolve / M01–M04 + current grants.
- `03-permission` → resolve / M01–M04 + current grants.
- `03-spec-changed` → reusable proposal / M01 + N5 handoff; submit/queue DEV-only, not runtime.
- `03-submit` → reusable proposal / M01 + N5 handoff; submit/queue DEV-only, not runtime.
- `03-waiting` → reusable proposal / M01 + N5 handoff; submit/queue DEV-only, not runtime.
- `03-approved` → reusable proposal / M01 + N5 handoff; submit/queue DEV-only, not runtime.
- `03-rejected` → reusable proposal / M01 + N5 handoff; submit/queue DEV-only, not runtime.
- `03-sales-correction` → resolve / M01–M04 + current grants.
- `03-correction-conflict` → resolve / M01–M04 + current grants.
- `04-preview` → preview / process + I04.
- `04-warning` → preview / process + I04.
- `04-blocked` → preview / process + I04.
- `04-stale` → preview / process + I04.
- `04-inventory` → preview / process + I04.
- `05-review` → preview–review–commit / process + J01 + current grants.
- `05-processing` → preview–review–commit / process + J01 + current grants.
- `05-permission` → preview–review–commit / process + J01 + current grants.
- `05-profile-retired` → preview–review–commit / process + J01 + current grants.
- `05-preview-stale` → preview–review–commit / process + J01 + current grants.
- `05-failed` → preview–review–commit / process + J01 + current grants.
- `05-uncertain` → preview–review–commit / process + J01 + current grants.
- `06-ready` → completion / I06 + separate R01.
- `06-not-ready` → completion / I06 + separate R01.
- `06-warning` → completion / I06 + separate R01.
- `history` → secondary / existing history or backend-pending.
