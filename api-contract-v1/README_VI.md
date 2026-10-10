# ShelfCash — bàn giao API contract v1 cho FE

Phiên bản gói: `shelfcash-fe-handoff/1-20261009-184259`. Ngày bàn giao: **09/10/2026**, múi giờ Asia/Saigon.
Snapshot tài liệu hiện hành; **packaging/documentation only**, không thay policy.

Đọc [bản tổng hợp](SHELFCASH_API_CONTRACT_V1_VI.md) trước, rồi contract từng cụm:

- [AUTHORIZATION_CONTRACT_VI.md](AUTHORIZATION_CONTRACT_VI.md).
- [CATALOG_MENU_RECIPE_API_CONTRACT_VI.md](CATALOG_MENU_RECIPE_API_CONTRACT_VI.md).
- [IMPORT_MAPPING_API_CONTRACT_VI.md](IMPORT_MAPPING_API_CONTRACT_VI.md).
- [INVENTORY_API_CONTRACT_VI.md](INVENTORY_API_CONTRACT_VI.md).
- [PROCUREMENT_API_CONTRACT_VI.md](PROCUREMENT_API_CONTRACT_VI.md).

**53 canonical routes core đã review về design** theo bản hiện hành (31 route gốc
READY + 22 route mới). Chưa phải HTTP APIs đã triển khai/verified. Dashboard/AI/
what-if/approval một lần còn cần review phạm vi; không tự included hoặc deferred.
Các acceptance cases là specification, không evidence runtime acceptance.

FE gốc là nguồn lịch sử đối chiếu; các contract hiện hành ở thư mục gốc mới là
nguồn integration. Khi contract thay đổi, FE/BE phải dùng **cùng phiên bản bàn giao**;
không ghép endpoint hoặc policy giữa hai snapshot. Không chạy commands/runbooks
trong references chỉ vì tài liệu được kèm theo. Gói không triển khai ứng dụng.

## References và giới hạn authority

`references/` chỉ gồm tài liệu được contract chính dẫn trực tiếp, giữ subfolders.
FE0 là thiết kế lịch sử; ADRs là các quyết định tại thời điểm ghi nhận và có những
policy cần supersede đã được contract hiện hành chỉ rõ. Features có cả design và
internal facts; reports/runbooks/CURRENT_STATE là snapshot evidence lịch sử, không
làm HTTP/auth/worker/config persistence trở thành đã verified. AGENTS là quy tắc
engineering. API_CONTRACT reference mô tả runtime lúc chụp, không cạnh tranh với
contract integration hiện hành. Không sửa accepted ADRs hoặc WIP.

Tài liệu kèm theo:

- [references/AGENTS.md](references/AGENTS.md).
- [references/API_CONTRACT.md](references/API_CONTRACT.md).
- [references/CURRENT_STATE.md](references/CURRENT_STATE.md).
- [references/ShelfCash_FE_BE_API_CONTRACT_v0.md](references/ShelfCash_FE_BE_API_CONTRACT_v0.md).
- [references/adr/ADR-008-import-idempotency-correction-policy.md](references/adr/ADR-008-import-idempotency-correction-policy.md).
- [references/adr/ADR-009-inventory-mutation-audit-policy.md](references/adr/ADR-009-inventory-mutation-audit-policy.md).
- [references/adr/ADR-010-data-completeness-and-missing-business-facts.md](references/adr/ADR-010-data-completeness-and-missing-business-facts.md).
- [references/adr/ADR-011-historical-run-immutability-snapshot-policy.md](references/adr/ADR-011-historical-run-immutability-snapshot-policy.md).
- [references/adr/ADR-013-future-store-mapping-approval-direction.md](references/adr/ADR-013-future-store-mapping-approval-direction.md).
- [references/adr/ADR-020-product-requirements-procurement-selector.md](references/adr/ADR-020-product-requirements-procurement-selector.md).
- [references/features/APPLICATION_CONTRACTS.md](references/features/APPLICATION_CONTRACTS.md).
- [references/features/DECISION_OPERATIONAL_PIPELINE.md](references/features/DECISION_OPERATIONAL_PIPELINE.md).
- [references/features/DECISION_OPERATIONAL_V2.md](references/features/DECISION_OPERATIONAL_V2.md).
- [references/features/IMPORT_MAPPING.md](references/features/IMPORT_MAPPING.md).
- [references/features/PLANNING_RUN.md](references/features/PLANNING_RUN.md).
- [references/reports/S361_PROCUREMENT_VERIFICATION.md](references/reports/S361_PROCUREMENT_VERIFICATION.md).
- [references/runbooks/S364_TASK_NOTES.md](references/runbooks/S364_TASK_NOTES.md).

## Omissions và liên kết thông báo

Không kèm source/tests/migrations/model binaries, raw data khách, `.env`, credentials,
tokens thật, ZIP cũ hoặc toàn bộ repository. Các đường dẫn source/commands dạng code
trong ghi chép chỉ là provenance, không phải file có trong gói hay hướng dẫn FE chạy.
Ví dụ JSON trong contract là dữ liệu minh họa, không credentials/token đang dùng.

Các tham chiếu sâu hơn dưới đây được bỏ khỏi gói vì không cần để tích hợp core v1.
**Link tương ứng trong bản copy dẫn đến chính thông báo omission này, không đến bản
nguồn và không giả tài liệu nguồn đã được kèm.** Nguồn vẫn có trong repo; cần đọc
sâu implementation thì lấy đúng snapshot từ BE. Đường dẫn dưới đây là tên nguồn
trong repo, không link phụ thuộc máy tính. Không có nguồn trực tiếp bị thiếu.

<a id="omission-001"></a>
- Không kèm `docs/TESTING.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-002"></a>
- Không kèm `docs/adr/ADR-017-serving-fefo-provisional-direction.md`; tham chiếu phụ thuộc từ `references/adr/ADR-020-product-requirements-procurement-selector.md`.

<a id="omission-003"></a>
- Không kèm `docs/adr/ADR-019-internal-procurement-engine.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`, `references/adr/ADR-020-product-requirements-procurement-selector.md`.

<a id="omission-004"></a>
- Không kèm `docs/adr/ADR-021-operational-decision-v2-temporal-scope.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-005"></a>
- Không kèm `docs/features/BOM.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-006"></a>
- Không kèm `docs/features/DECISION_DESIGN.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-007"></a>
- Không kèm `docs/features/DECISION_GOLDEN_CASES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-008"></a>
- Không kèm `docs/features/FORECAST_EXECUTION.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-009"></a>
- Không kèm `docs/features/FORECAST_TRAINED.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-010"></a>
- Không kèm `docs/features/PERSISTENCE_ACCESS.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-011"></a>
- Không kèm `docs/features/PLANNING_SETUP_RESOLVER.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-012"></a>
- Không kèm `docs/features/PROCUREMENT_COMPARISON.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-013"></a>
- Không kèm `docs/features/PROCUREMENT_DESIGN.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-014"></a>
- Không kèm `docs/features/PROCUREMENT_ENGINE.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-015"></a>
- Không kèm `docs/features/PROCUREMENT_FORMULATION.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-016"></a>
- Không kèm `docs/features/PROCUREMENT_GOLDEN_CASES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-017"></a>
- Không kèm `docs/features/PROCUREMENT_V2.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`, `references/adr/ADR-020-product-requirements-procurement-selector.md`.

<a id="omission-018"></a>
- Không kèm `docs/features/SCAFFOLD.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-019"></a>
- Không kèm `docs/features/SERVING_FEFO.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-020"></a>
- Không kèm `docs/features/STORE_IDENTITY.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-021"></a>
- Không kèm `docs/reports/S2_SYNTHETIC_COMPARISON.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-022"></a>
- Không kèm `docs/reports/S342_PROCUREMENT_BENCHMARK.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-023"></a>
- Không kèm `docs/reports/S343_PROCUREMENT_NUMERIC_BENCHMARK.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-024"></a>
- Không kèm `docs/reports/S344_PROCUREMENT_VERIFICATION.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-025"></a>
- Không kèm `docs/reports/S352_POSTGRESQL_ACCEPTANCE.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`, `references/features/DECISION_OPERATIONAL_PIPELINE.md`.

<a id="omission-026"></a>
- Không kèm `docs/reports/S362_POSTGRESQL_ACCEPTANCE.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`, `references/features/DECISION_OPERATIONAL_V2.md`.

<a id="omission-027"></a>
- Không kèm `docs/reports/S363_SMALL_DOMAIN_VERIFICATION.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-028"></a>
- Không kèm `docs/runbooks/FULL_TEST_FLOW.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`, `references/features/APPLICATION_CONTRACTS.md`.

<a id="omission-029"></a>
- Không kèm `docs/runbooks/S02_SQLITE_AUDIT.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-030"></a>
- Không kèm `docs/runbooks/S16_VERIFICATION.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`, `references/features/APPLICATION_CONTRACTS.md`.

<a id="omission-031"></a>
- Không kèm `docs/runbooks/S17_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/features/APPLICATION_CONTRACTS.md`.

<a id="omission-032"></a>
- Không kèm `docs/runbooks/S17_VERIFICATION.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`, `references/features/APPLICATION_CONTRACTS.md`.

<a id="omission-033"></a>
- Không kèm `docs/runbooks/S2_TRAINED_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-034"></a>
- Không kèm `docs/runbooks/S31_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-035"></a>
- Không kèm `docs/runbooks/S32_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-036"></a>
- Không kèm `docs/runbooks/S331_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-037"></a>
- Không kèm `docs/runbooks/S33_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-038"></a>
- Không kèm `docs/runbooks/S341_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-039"></a>
- Không kèm `docs/runbooks/S342_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-040"></a>
- Không kèm `docs/runbooks/S343_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-041"></a>
- Không kèm `docs/runbooks/S344_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-042"></a>
- Không kèm `docs/runbooks/S351_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

<a id="omission-043"></a>
- Không kèm `docs/runbooks/S352_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`, `references/features/DECISION_OPERATIONAL_PIPELINE.md`.

<a id="omission-044"></a>
- Không kèm `docs/runbooks/S361_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`, `references/adr/ADR-020-product-requirements-procurement-selector.md`.

<a id="omission-045"></a>
- Không kèm `docs/runbooks/S362_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`, `references/features/DECISION_OPERATIONAL_V2.md`.

<a id="omission-046"></a>
- Không kèm `docs/runbooks/S363_TASK_NOTES.md`; tham chiếu phụ thuộc từ `references/CURRENT_STATE.md`.

## Kiểm tính toàn vẹn và kết quả packaging

[MANIFEST_SHA256.txt](MANIFEST_SHA256.txt) dùng SHA-256 cho mọi file khác trong
`api-contract-v1/`, bao gồm README và báo cáo; manifest không tự hash chính nó.
Tên trong manifest là đường dẫn tương đối tính từ thư mục gốc gói. ZIP CRC kiểm cả
manifest. SHA-256 kiểm tính toàn vẹn snapshot, không phải chữ ký xác thực.

[Báo cáo packaging](PACKAGING_REPORT_VI.md) ghi hashes nguồn/copy và toàn bộ rewrite
links. Canonical docs không bị sửa; diff copy/nguồn chỉ thay đường dẫn Markdown link.
Packaging PASS không phải API/runtime acceptance. Không tests/solver/DB/OpenAPI runtime,
commit/push, sửa WIP hoặc bắt đầu implementation.
