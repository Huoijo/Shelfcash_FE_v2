# S3.5.2 PostgreSQL acceptance — PASS

Classification: CURRENT FACT. User-authorized continuation of S3.5.2 only,
2026-10-08. Branch `feat/from_forecast_to_decision_run`, HEAD
`a4b68378f35fea6f71b549e24393cf4bbb35aba5`. No runtime/business algorithm fix required.
Tests gained real PostgreSQL assertions; packaging/docs updated, WIP preserved.

## Target safety and verification commands

`docker ps --format '{{.Names}} {{.Status}} {{.Ports}}'` confirmed the local PostgreSQL
container healthy. Before fixtures, a Python check parsed Settings.test_database_url,
required local `127.0.0.1:5432 / shelfcash_test`, constructed environment=test settings
and called the existing `validate_reset_target`. Administrative readiness used only
the `postgres` catalog to confirm test DB existence; development DB was never connected.
Credentials were neither printed nor copied into evidence. Existing fixtures own
disposable test schema reset/migration and assert actual current_database() first.

```powershell
.venv/Scripts/python.exe -m pytest tests/integration/test_decision_operational_capture.py -q --tb=short
```

Initial execution: **6 passed in 6.79s**. After strengthening provenance, post-capture
mutation, success-path caller ownership and pipeline blocker assertions: **6 passed
in 7.47s**. Logs: `runtime/s352_acceptance/postgres_initial.txt`, `postgres_final.txt`.
No environment/setup/implementation failure during this continuation. The earlier six
setup timeouts are historical evidence from when Docker was unavailable.

After extending the cross-store fixture to Ingredients/lots/recipes/terms/budget and
a real foreign SupplierTerm UUID, reran only the affected test:

```powershell
.venv/Scripts/python.exe -m pytest tests/integration/test_decision_operational_capture.py -q --tb=short -k actual_cross_store
```

**1 passed, 5 deselected in 1.48s**; `postgres_scope_final.txt`. This is a targeted
follow-up to the six-case passing group, not another full regression claim.

```powershell
.venv/Scripts/python.exe -m pytest tests/unit/test_review_archive.py -q --tb=short
```

**23 passed, 2 skipped in 0.14s**. Packaging-only regression covers the new acceptance
stem, suffix preservation, verified temporary publication, race refusal and invalid
paths/stems. Windows denied symlink creation (WinError 1314); two symlink tests skipped.
These skips do not affect the PostgreSQL group, which had no skips.

Post-fixture read-only inspection targeted shelfcash_test only: PostgreSQL **17.11**,
Alembic head **0008_forecast_execution_meta**, all business tables empty after fixture
cleanup. Safe metadata: `runtime/s352_acceptance/test_database_final.json`.
No new migration, development inspection/reset or DB dump. No full suite/large benchmark:
runtime/schema/lifecycle/algorithms unchanged, so the changed PostgreSQL boundary tests
and packaging tests are the necessary scope. Earlier 345 pure/boundary regressions
remain historical results and were not rerun in this continuation.

## What the six real PostgreSQL tests establish

| Test symbol in tests/integration/test_decision_operational_capture.py | Actual PostgreSQL evidence |
| --- | --- |
| test_real_repositories_pipeline_and_fresh_session_state | Scoped persisted Forecast/input/metadata/operational rows reach native procurement and comparison; actual retained digest and warning/selection provenance survive; three solver factories see pool.checkedout()==0; fresh Session confirms untouched lot balance, COMPLETED forecast, seven predictions, no DecisionRun row; readiness NOT_ASSESSED |
| test_one_repeatable_read_snapshot_under_concurrent_changes | First Store SELECT fixes capture snapshot; SHOW reports repeatable read/read-only; a separate connection commits Product unit and lot balance changes before subsequent capture reads; capture still sees cup/quantity1, fresh reads see changed-unit/99; a second post-capture commit sets77 and detached capture remains byte-for-value identical with quantity1 |
| test_capture_readonly_and_does_not_touch_caller_transaction | Success leaves caller's active dirty transaction unchanged and only caller connection checked out; actual UPDATE in capture is rejected by PostgreSQL SQLSTATE25006; error cleanup also leaves caller transaction/dirty state intact; caller rollback/fresh read confirms no unintended durable write |
| test_actual_cross_store_uuid_and_forecast_lifecycle | Real other-Store Product/Ingredient/Supplier/recipe/line/term/lot/budget rows do not leak into local capture; foreign Product/run scope rejects; foreign term UUID in explicit config blocks before solver; RUNNING forecast rejects |
| test_dated_recipe_budget_capture_and_missing_balance | Both inclusive dated recipe versions/lines captured, correct version used at switch; explicit zero lot is valid; DB budget identity/version becomes procurement provenance; deleting lot produces missing-balance blocker, preserves capture issue and never calls solver |
| test_missing_predictions_and_corrupted_retained_input_block | Actual deleted prediction yields coverage blocker; valid-shaped corrupted retained SHA256 yields integrity blocker through owned cleanup; pipeline retains same issue, emits no BOM/procurement result and never calls solver; pool released |

No unit mock or SQLite substitutes for this evidence. The read-only test injects an
attempted write at the repository boundary but relies on actual PostgreSQL rejection.
Concurrency assertions use actual separately committed PostgreSQL transactions.
Forecast rows/metadata and model quantities are synthetic fixture facts; these tests
do not certify the forecast training producer, accuracy or calibrated uncertainty.

## Remaining limits and status

S3.5.2 internal capture/pipeline + PostgreSQL acceptance COMPLETE within authorized
scope. S3 overall remains IN PROGRESS. No HTTP/auth, DecisionRun/result persistence,
winner, PO, new business policy or next slice. Current inventory is a consistent
observed snapshot, not historical as-of reconstruction; caller attestations are not
proof of before-trading/completeness/no-replenishment. Conversion/committed-inbound
storage, business configuration persistence, real-data quality and global optimizer
proof remain absent/open. INCOMPLETE/UNKNOWN/no-candidate behavior remains covered by
previous pure tests, not a claim of native timeout in these PostgreSQL cases.

Rollback only added S352 assertions, packaging support and acceptance documentation;
do not reset the worktree or delete historical ZIPs. Acceptance ZIP is independently
named, uses suffix on collision and verifies temporary CRC/paths/manifests/hashes/source
correspondence before exclusive publication. All eight preexisting ZIPs are preserved.
S3.4.4 remains a regenerated historical archive, not original bytes.
