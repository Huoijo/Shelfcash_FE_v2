# S3.6.2 — PostgreSQL acceptance PASS

CURRENT FACT, thu thập ngày 2026-10-09. S3.6.2 COMPLETE trong phạm vi internal
operational capture/pipeline /2; S3 tổng thể vẫn IN PROGRESS. Không triển khai slice mới.

## Môi trường và guard

- Branch `feat/from_forecast_to_decision_run`, HEAD
  `a4b68378f35fea6f71b549e24393cf4bbb35aba5`; working tree có WIP từ trước.
- Docker daemon đã hoạt động; `docker compose up -d postgres` đưa service hiện hữu
  vào trạng thái Running. Không xóa container/volume hoặc dùng `down -v`.
- Trước pytest: parse riêng `test_database_url`, bắt buộc database `shelfcash_test`,
  host local, environment `test`, chạy `validate_reset_target`; kết nối đọc xác nhận
  `SELECT current_database()` và `SHOW server_version`. Đích:
  `127.0.0.1:5432/shelfcash_test`, PostgreSQL 17.11 (Debian).
- Fixtures hiện hữu chỉ tạo/reset/migrate schema trên test DB disposable. Admin
  connection đến `postgres` chỉ kiểm tra/tạo test database theo cơ chế repo.
  Không kết nối, migrate hoặc reset development DB; không in credentials.

## Lệnh và kết quả mới

```powershell
docker compose up -d postgres
.venv/Scripts/python.exe -m pytest tests/integration/test_decision_operational_v2.py tests/integration/test_decision_operational_capture.py -q --tb=short
```

Kết quả thực chạy: **12 passed in 21.00s**, không skip, không lỗi setup hoặc
implementation. Console được lưu qua `Tee-Object -FilePath
runtime/s362_acceptance/postgresql_tests.txt`, giữ exit code pytest.
Không sửa runtime code/tests và không cần rerun. Không chạy full suite/benchmark.

Nhóm được chọn: sáu acceptance /2 vừa collect trước đây và sáu regressions capture
/1 dùng chung repositories/session lifecycle/retained forecast. Đây là targeted
PostgreSQL acceptance, không phải toàn bộ regression pass.

## Những assertions thực sự pass

| Test /2 trong `tests/integration/test_decision_operational_v2.py` | Bằng chứng |
| --- | --- |
| `test_pg_v2_retained_forecast_to_winner_release_and_fresh_session` | DB-retained forecast → capture → BOM → ba strategy native solver → comparison/selector có winner; digest provenance giữ nguyên. Pool checked-out bằng 0 trước BOM và cả ba solver calls. Fresh Session xác nhận database test, lot vẫn 1, ForecastRun COMPLETED, không ghi DecisionRun. |
| `test_pg_v2_same_readonly_snapshot_under_second_connection_update` | Ngay sau SELECT Store đầu tiên, connection đang REPEATABLE READ và read-only. Connection khác commit lot 99/tên Product mới trước các reads tiếp; capture vẫn lot 1/tên cũ. Fresh Session thấy 99/tên mới; pool được release. |
| `test_pg_v2_owned_session_keeps_caller_and_forbids_write` | Caller đang transaction/dirty không bị source commit/rollback. Source-owned transaction reject UPDATE thật với SQLSTATE 25006; chỉ caller connection còn checkout. Caller rollback và fresh Session thấy Store ban đầu. |
| `test_pg_v2_menu_partial_scope_and_foreign_override_rejection` | Product local active thiếu dữ liệu được giữ trong menu/exclusions; override NOT_EVALUATED, computed Product vẫn có winner. Product foreign không leak vào menu; foreign override reject trước computation. |
| `test_pg_v2_post_capture_mutation_does_not_change_detached_computation` | Sau source read/release, writer đổi lot thành 100. Retained DTO/model dump và Prepared input vẫn lot 1, pipeline tính bằng captured values; fresh Session thấy DB 100. |
| `test_pg_v2_corrupted_retained_integrity_keeps_blocker_and_releases` | Digest retained input bị sửa trong DB → CAPTURE_BLOCKED, timestamp/provenance issue giữ qua pipeline, không BOM/selector/solver; resources release. |

Sáu regressions /1 trong `tests/integration/test_decision_operational_capture.py`:
`test_real_repositories_pipeline_and_fresh_session_state`,
`test_one_repeatable_read_snapshot_under_concurrent_changes`,
`test_capture_readonly_and_does_not_touch_caller_transaction`,
`test_actual_cross_store_uuid_and_forecast_lifecycle`,
`test_dated_recipe_budget_capture_and_missing_balance`,
`test_missing_predictions_and_corrupted_retained_input_block`.
Chúng kiểm tra retained DB pipeline/fresh-session state, snapshot isolation,
caller ownership/read-only, cross-store entity references và forecast lifecycle,
dated recipes/budget/explicit zero/missing inventory và blockers missing predictions/
corrupt retention không đi tới solver. /1 semantics được giữ trong nhóm này.

Sau fixtures, kết nối đọc mới qua `inspect_database` xác nhận test DB tại Alembic
head `0008_forecast_execution_meta`, tất cả business tables 0 rows, chỉ
`alembic_version` có một row. Evidence: `runtime/s362_acceptance/post_test_database.json`.
Đây là test fixture cleanup, không phải reset development DB hoặc DB dump.

## Evidence và giới hạn

- Mới: `runtime/s362_acceptance/readiness.json`, `postgresql_tests.txt`,
  `post_test_database.json`, pre-edit work plan và hash guard.
- Historical: unit/adapter/targeted results và synthetic 5/10 Product benchmark trong
  `runtime/s362/`, được mô tả trong task notes. Các report BLOCKED cũ giữ nguyên và
  phản ánh thời điểm Docker chưa sẵn sàng; chúng không phải trạng thái acceptance mới.
- PG fixtures dùng dữ liệu synthetic và persisted COMPLETED forecast được dựng bởi
  fixture. Tests chứng minh đọc/integrity/pipeline với fixture đó, không chứng minh
  training/forecast accuracy, real-data savings, optimality hoặc latency SLA.
- Không test mọi P1 temporal/mixed-unit combination trên PG trong lượt này; các cases
  đó có historical unit evidence. Không HTTP/auth/resolver/storage/idempotency/replay
  hoặc durable DecisionRun acceptance; public planning API vẫn chưa có.
- Không thay accepted policy, API contract semantics, schema hoặc S1/S2 logic.

## Bàn giao

Không còn blocker PostgreSQL acceptance của S3.6.2 trong phạm vi 12 tests trên.
Runtime implementation không cần sửa. Docs cập nhật current facts; accepted intent
ADR-021 không đổi. Tạo ZIP acceptance bằng tên mới, không ghi đè archive cũ;
manifest/hashes, CRC, safe paths, source correspondence và WIP/old ZIP guards phải
pass trước publish. Chưa commit/push, chưa bắt đầu slice kế tiếp.


## Additional packaging and read-only checks (CURRENT FACT)

Commands actually run:

```powershell
.venv/Scripts/python.exe scripts/verify_s362_acceptance.py
.venv/Scripts/python.exe -m pytest tests/unit/test_review_archive.py -q --tb=short
.venv/Scripts/python.exe scripts/bundle_s362_acceptance_review.py
```

Read-only verification: PASS, disposable target/schema and zero business rows.
Packaging guard tests: 23 passed, 2 skipped in 0.15s; both skipped cases require
Windows symlink creation privilege (WinError 1314). No PostgreSQL test skipped.
This is related archive guard coverage, not full regression; actual new archive
CRC/path/inventory/hash/source correspondence and 14 old ZIP/WIP guards are checked
by the acceptance bundler before and after exclusive publication.
The bundler also parses Python files, checks local links in changed docs and asserts
current OpenAPI paths remain only /health; counts are in context_checks.json.
New packaging scripts are first-party tooling, not application behavior changes.
Old S362 bundle/verifier scripts retain their historical BLOCKED context and should
not be used as the current acceptance recipe.
