# ShelfCash contract handoff supplement — 2026-10-11 v1

CURRENT FACT: bản bổ sung cho FE đang giữ **baseline10/10** `shelfcash_backend_context_handoff.zip`, SHA256 `238959dd16307ebd691834d2a679f7f80134495bbe99c56f29f7835f39bab6fd`. Đối chiếu thêm handoff S4.11 v2 `shelfcash_integration_handoff_S4_11_v2.zip`, SHA256 `b66ce2842db68793a75af10ed7bf0297c070f0b8c16de9e913dcc1804fedc02d`. Cả hai đúng hash; không dùng ZIP09/10, không ghi đè baseline/v1/v2.

**Đọc theo thứ tự:** [delta từng operation](CONTRACT_HANDOFF_DELTA_VI.md) → [checklist FE theo workflow](FE_UPDATE_CHECKLIST_VI.md) → [examples current](examples/README_VI.md) → [runbook local](docs/runbooks/S411_LOCAL_INTEGRATION.md). [Sample public FE config](public-fe-config.env.example) chỉ có data source/API base URL.

Authority là sáu snapshot nguyên byte hiện hành:

- [Bàn giao v1/umbrella](docs/SHELFCASH_API_CONTRACT_V1_VI.md).
- [Authorization](docs/AUTHORIZATION_CONTRACT_VI.md).
- [Catalog/Menu/Recipe](docs/CATALOG_MENU_RECIPE_API_CONTRACT_VI.md).
- [Import/Mapping](docs/IMPORT_MAPPING_API_CONTRACT_VI.md).
- [Inventory](docs/INVENTORY_API_CONTRACT_VI.md).
- [Procurement/Planning](docs/PROCUREMENT_API_CONTRACT_VI.md).

ACCEPTED DECISION giữ policy/accepted ADRs; CURRENT FACT wire từ router/DTO/use case và [OpenAPI hiện hành](generated/openapi.json). [Compatibility changelog](docs/CONTRACT_COMPATIBILITY_CHANGELOG_VI.md) giữ slice checkpoints. Tài liệu hỗ trợ/ADRs/backlog lịch sử để đọc context không chứng minh runtime hay cấp quyền. Các code-fence examples TARGET DESIGN/historical không phải current request/response; dùng index examples đã validate. Không rewrite authority để che drift.

CURRENT FACT: baseline32 → current54 operations gồm health;22 thêm/6 definition đổi/0 bỏ/0 đổi method-path đã có. Xem [diff](generated/openapi_diff.json), [wire details](generated/OPERATION_DETAILS_VI.md), [schema closures/JSON-pointer comparison](generated/operation_comparison.json), [baseline design excerpts](generated/baseline_design_evidence.json), [source route/hash evidence](generated/source_evidence.json).

OpenAPI hiện tại bằng toàn bộ v2; sáu contracts/changelog/runbook/checklist bằng byte v2. Chỉ S411 notes đã thêm publication receipt/process inspection sau freeze. Không phát hiện API delta sau v2; supplement là cách trình bày baseline→v2, **không phiên bản API mới**. v2 không manifest toàn source nên không chứng minh tuyệt đối mọi source byte-identical; mtime không thay checksum evidence. [v2 comparison](generated/v2_comparison.json) ghi rõ giới hạn.

**S4.11 PARTIAL**: API E2E PASS và existing-screen Edge browser gates PASS đã ghi trong [S411 notes](docs/runbooks/S411_TASK_NOTES.md). Whole-chain browser acceptance vẫn BLOCKED_BY_FE_SCOPE vì UI Mapping/review/preview/confirmation/commit/config/readiness/planning/retained/PDF chưa có. Audit này không chạy DB/provider/runtime/browser/full suite; không claim full contract conformance hay COMPLETE. Offline OpenAPI targeted gate **9 passed/1 failed** vì Auth test stale path inventory, được ghi trong [verification](VERIFICATION_VI.md); không sửa source/test để làm xanh.

38 JSON examples (request fixtures và synthetic test traces) validate lại qua DTO hiện hành và schema refs; không phải fresh runtime replay/persistence proof. H01/H02 dùng s411 có explicit warnings, loại S410 omitted-warning traces. IDs/dates/versions/digests synthetic cần thay bằng actual server values; không sử dụng như resource/authorization evidence.

Package gồm consumer docs/contract snapshots/OpenAPI/examples/schema/audit evidence, link-support documentation và file SHA256 manifest. Không whole source checkout, actual .env/credentials/accounts/session keys/DB dump/private runtime/PDF/screenshots/customer data. Supporting markdown có một số checkout-only historical references được chuyển thành plain text và ghi [transformation report](generated/support_document_transformations.json); sáu authoritative bodies không sửa. Tooling/runbook cần **current backend checkout/migration0017** để chạy, supplement không phải backend executable. Sample public config không provisioning account và không mở provider/production deployment.

Kiểm archive bằng manifest file hashes; checksum của ZIP nằm trong sidecar `.zip.sha256`, không circular self-checksum. [Verification](VERIFICATION_VI.md) ghi commands/checks/results/limits. Artifact unpacked có thể dùng độc lập để tích hợp contract; thực thi local workflow vẫn cần current BE và FE checkout riêng.
