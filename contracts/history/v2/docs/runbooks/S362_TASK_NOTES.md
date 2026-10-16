# S3.6.2 — pre-edit scope and verification plan

2026-10-09. Authorization: user's attached S3.6.2 task, current planning-contract/1
and ADR-020. Observe before edits: operational capture/pipeline /1 is same-day,
single selling-unit; procurement/2, comparison/2, selector/1 exist only internally.
User-approved P1 allows hypothetical current captured facts for past/future dates.

Scope: separate operational /2 request/source/capture/pipeline; retain whole active
menu and original effective requirements/declarations, project only independently
verified computable Products and dependency facts, retain exclusions and override
NOT_EVALUATED audit. Explicit unknown fees/budget/config stay blockers. No implicit
defaults, no auth/API/forecast orchestration/DecisionRun/storage/migrations/DB writes.
Contract-only public counter change: domain_size and potentially unbounded search
counters are canonical integer strings; Python internal counters remain exact ints.

Affected boundaries: PreparedDecisionInput optional explicit /2 temporal basis,
serving/native/exact validation date adapter and comparison identity serialization.
Historical /1 guards and implicit identities must remain unchanged. Temporal facts
retain physical capture and original received/expiry/effective dates; no fake day-start
or historical stock guarantee. Domain allocation/arithmetic/ranking remain unchanged.

Acceptance: new unit/boundary pipeline cases, partial/shared dependencies, original
requirements audit, today/past/future dates, fee coverage/budget conflicts, copied/forged
inputs/results, numeric/search/error distinctions, /1 caller regressions. Real disposable
PostgreSQL /2 MVCC/detachment/release/ownership/retained-forecast evidence where available.
Synthetic 5/10 Product end-to-end benchmark, separate phase timing, raw evidence and
truthful proof limits. No accuracy/SLA claim and no development DB connection.

Verification scope: new /2 tests plus existing operational capture/adapters, procurement/2,
comparison/selector, BOM and serving/package boundaries affected by the temporal field.
This internal opt-in integration has no schema/lifecycle/public API change; targeted
caller coverage is the default gate. Broaden only for a demonstrated shared-boundary gap.
Documentation/packaging checks cover public string-counter examples and hashes/CRC/paths.

Rollback: remove exact /2 additions and restore only this slice's edits from pre-edit
bytes; no git checkout/reset and no archive deletion. Baseline hashes/status and backup
of touched files are retained under runtime/s362; unrelated preexisting WIP preserved.
All preexisting ZIPs must remain byte-identical. No commit/push or next-slice work.

## Final status — PARTIAL; PostgreSQL acceptance BLOCKED

Independent implementation and targeted unit gates are complete. Six real /2 PG
cases exist but have not executed because Docker daemon/test DB is unavailable.
No developer DB connection/reset/migration. Do not mark this slice COMPLETE yet.

### Implementation and routine choices

Separate /2 source/entrypoints, full active menu + detached raw facts and scoped
Ingredient/term identities, computed projection/exclusions with override audit,
explicit temporal basis, fee coverage and budget effective/ceiling snapshot. Caller
budget_version labels its explicit selection bundle, independent of actual captured
constraint IDs/versions. Effective limit can tighten physical ceiling; conflicting
frozen ceiling blocks. This implements accepted C01 semantics, no new monetary policy.
Only new operational /2 envelope admits tightening; old equality guard unchanged.

Old /1 identities elide absent operational_basis. Existing /1 and capture2-without-basis
keep day-start/as-of semantics; S1 package still rejects capture2. No pure allocation,
FEFO, arithmetic, winner or forecast/lifecycle change. Original dated facts preserved.

Past lot eligibility activates its captured current balance on original receipt date,
not actual historical receipt volume. This activation appears in lot arrivals with
explicit hypothetical basis, never writes movement/inbound. Future-dated lots relative
to actual capture remain excluded. No forecasts of intervening inventory evolution.

Measured validation duplication removed only in new orchestration; existing public
internal boundaries and final recursive graph check still reject copied/forged values.
Final /2 BOM output additionally reconciles contributions/coverage/issues with pure
expansion of the retained snapshot. Existing S3.2 output contract is structural; no
retroactive strengthening of S1/S3.2 callers. Only validated wall diagnostics are
amended after measuring final graph validation; business objects are unchanged.

### Commands actually run — targeted, not full regression

1. `.venv/Scripts/python.exe -m pytest tests/unit/test_decision_pipeline_v2.py -q --tb=short`
   Initial group: **17 passed, 3 failed, 5 warnings in 40.28s**. Failures were fixture
   append calls on frozen tuple model_dump collections. Fixed fixture construction,
   without weakening runtime behavior or tests.
2. Same file with `-k 'multi_path or partial_missing or shared_ingredient'`:
   **3 passed, 17 deselected in 14.57s**.
3. Same file with `-k 'past_receipt or future_start or missing_forecast_one or unused_ingredient or foreign_offer or engine_numeric or search_programming'`:
   **7 passed, 20 deselected in 13.37s**.
4. `.venv/Scripts/python.exe -m pytest tests/unit/test_decision_snapshot_adapter_v2.py -q --tb=short`:
   **4 passed in 0.81s**. Fake repository/ownership mapping only, NOT PostgreSQL proof.
5. Broader affected boundary/caller gate:

```powershell
.venv/Scripts/python.exe -m pytest tests/unit/test_decision_pipeline_v2.py tests/unit/test_decision_snapshot_adapter_v2.py tests/unit/test_decision_capture.py tests/unit/test_decision_snapshot_adapter.py tests/unit/test_procurement_v2.py tests/unit/test_procurement.py tests/unit/test_procurement_comparison.py tests/unit/test_bom.py tests/unit/test_serving.py tests/unit/test_serving_output_validation.py tests/unit/test_decision_execution.py -q --tb=short --durations=6
```

**427 passed, 1 failed, 10 warnings in 168.01s.** Existing 391 regression cases
passed at that gate; one new forged-BOM case exposed missing quantity reconciliation
in the new /2 aggregate. Root cause: reused historical BOM output contract checks
shape/status, so copied empty contributions were not caught by shape alone. Fixed
only /2 aggregate validation to compare exact BOM from retained snapshot. This gate
is not a final “428 passed” result and is not the full suite. Log targeted_regression.txt.

6. Same new pipeline file with `-k 'final_pipeline_boundary or native_capture or copied_request'`:
   **4 passed, 29 deselected in 13.38s** after the BOM fix.
7. `.venv/Scripts/python.exe -m pytest tests/unit/test_decision_snapshot_adapter_v2.py tests/unit/test_decision_pipeline_v2.py -q --tb=short --durations=4`:
   **39 passed, 5 warnings in 47.26s**, after scoped malformed Ingredient/term handling.
   Log affected_final.txt. Further budget/date/source-boundary cases added afterward.
8. Final affected gate after the last runtime changes:

```powershell
.venv/Scripts/python.exe -m pytest tests/unit/test_decision_pipeline_v2.py tests/unit/test_decision_snapshot_adapter_v2.py tests/unit/test_procurement.py tests/unit/test_procurement_v2.py tests/unit/test_decision_capture.py -q --tb=short -k 'decision_pipeline_v2 or decision_snapshot_adapter_v2 or budget or scope_unit_provenance or legacy_identity or effective_requirements or past_origin'
```

**58 passed, 131 deselected, 5 warnings in 60.17s.** All 47 new unit/mapping cases
and 11 directly affected historical budget/scope/identity/caller cases at current
source. Log last_affected.txt. Warnings are serializer diagnostics from deliberately
forged bool/float/NaN/Infinity/negative copied stock, all asserted rejected. No skip.
No full-group rerun after this narrow final correction; unrelated previous passing
regressions remain gate-time evidence, not a final whole-suite claim.

### PostgreSQL readiness and scope

`docker ps --format '{{.Names}} {{.Status}}'`: failed because Docker Desktop Linux
daemon named pipe is absent. A Python read-only probe parsed Settings.test_database_url,
asserted local host 127.0.0.1 and database shelfcash_test, built environment=test settings
and called existing validate_reset_target before connecting. Credentials not printed.
Result: **BLOCKED / OperationalError**, no development connection. Safe metadata in
runtime/s362/postgres_readiness.json. The probe did not run fixtures/migrations/resets.
The initial probe was Python stdin; its guarded equivalent is retained and rerun as:
`.venv/Scripts/python.exe scripts/probe_decision_test_database.py`.

```powershell
.venv/Scripts/python.exe -m pytest tests/integration/test_decision_operational_v2.py --collect-only -q
```

**6 collected in 0.82s**, not executed. Cases specify same read-only REPEATABLE READ
snapshot under a concurrent writer, Store/override isolation, detached post-capture
computation, owned Session/caller/readonly behavior, release before BOM/solver,
retained integrity and fresh-session unchanged state/no DecisionRun. These assertions
are NOT yet proven on PostgreSQL. Historical S3.5.2 six-case pass remains historical.
When test DB is ready, use guarded existing disposable fixtures for these six and
relevant old operational capture regressions; never development DB.

### Synthetic end-to-end timing — actual runs

`.venv/Scripts/python.exe scripts/benchmark_decision_pipeline_v2.py`:
initial benchmark completed; raw graphs retained locally under runtime/s362/benchmark.
Explicit BASE/HIGH .01 requirements, no override: demo configuration, NOT defaults.
5 Products total45.46s, output revalidation15.52s; 10 Products29.90s/revalidation8.61s.
This concrete cost motivated removing immediately duplicated graph reconstructions.

`.venv/Scripts/python.exe scripts/benchmark_decision_pipeline_v2.py --output-name benchmark_optimized`:
5 Products total29.46s and 10 Products20.86s. Existing boundary validators retained.
These timings precede final BOM/capture/budget boundary fixes and are history only.

`.venv/Scripts/python.exe scripts/benchmark_decision_pipeline_v2.py --output-name benchmark_final`:
final source runs completed; full raw aggregates and source input in benchmark_final,
console in benchmark_final_console.txt. Dimensions: 5/10 Products, 4 Ingredients,
10/20 recipes, 8 lots, 8 offers, captured domain65,536. Both return a verified
customer-pass construction-miss recommendation, INCOMPLETE/UNPROVEN, not exact optimum.

| Phase seconds | 5 Products | 10 Products |
| --- | --- | --- |
| Capture/preparation | .0126 | .0196 |
| BOM | .0221 | .0291 |
| Engine wall (build/search/exact checks) | 11.8108 | 10.6554 |
| Comparison | 5.1861 | 2.8912 |
| Selector | 5.4463 | 3.2851 |
| Final output revalidation | 7.6034 | 4.2645 |
| Internal total | 30.0815 | 21.1450 |
| External function wall | 30.0847 | 21.1525 |
| Engine reported overrun of10s budget | 1.8057 | .6443 |

Synthetic fake source, not DB capture latency/forecast accuracy/real savings. Engine
budget is cooperative; revalidation remains costly. Native results depend on timing,
hardware and earlier proof state; no SLA or explanation that larger menus run faster.

### Documentation/packaging verification

Public C03 domain_size is canonical nonnegative integer text, including >JS-safe example;
internal Python remains integer. No public route/OpenAPI business schema added. Current
OpenAPI is checked to keep only /health; original FE/auth/C01/accepted ADRs unchanged.
Commands: `.venv/Scripts/python.exe scripts/verify_s362_context.py` and
`.venv/Scripts/python.exe scripts/bundle_s362_review.py`; exact check counts/results
are retained in context_verification.json and bundle_verification.json. These are
documentation/artifact/hash/path checks, not runtime/PG regression substitutes.

Review ZIP includes current source/contracts/tests/docs, final raw synthetic evidence,
readiness/collection/test logs, guide/status, slice-only diff from pre-edit bytes,
tracked full-WIP diff, manifest/hashes and omissions. All 13 preexisting ZIPs and
unrelated baseline WIP must pass byte-identity guard. No commit/push/next slice.


## 2026-10-09 acceptance continuation - CURRENT FACT

User authorized finishing six PostgreSQL /2 tests plus related capture regressions,
using only guarded disposable test DB, preserving all WIP and old ZIPs. Pre-edit
scope/acceptance/rollback recorded in runtime/s362_acceptance/WORK_PLAN.md; baseline
hashes cover 328 preexisting first-party files and 14 archives.

Docker daemon responded; no runtime container initially reported by docker ps.
Command `docker compose up -d postgres` returned Running for existing service.
Guarded read-only probe verified local 127.0.0.1:5432/shelfcash_test, PostgreSQL 17.11,
environment test + validate_reset_target before any pytest fixture/schema operation.
No development DB connection, migration, reset or volume removal.

Exact pytest command:
`.venv/Scripts/python.exe -m pytest tests/integration/test_decision_operational_v2.py tests/integration/test_decision_operational_capture.py -q --tb=short`
Console saved through Tee-Object to runtime/s362_acceptance/postgresql_tests.txt;
pytest exit code retained. Result: **12 passed in 21.00s** (six /2 + six /1).
No runtime/test fixes or reruns needed. This scope verifies PostgreSQL snapshot,
read-only ownership, Store isolation, detached captured values, retained integrity
blockers, resource release before BOM/solver and fresh-session persisted assertions.
Selected /1 regressions protect shared reads/lifecycle without running unrelated suite.

Read-only fresh post-test inspection verified shelfcash_test at existing Alembic
head 0008_forecast_execution_meta with zero business rows after fixture cleanup.
Readiness and post-inspection Python checks were run via PowerShell here-string
stdin using make_url(Settings().test_database_url), exact host/database assertions,
validate_reset_target, SELECT current_database/SHOW server_version and inspect_database.
No credentials printed. Safe outputs are retained as readiness.json and
post_test_database.json. No full suite, benchmark or new slice.

Updated current-fact state/roadmap/architecture/feature/contract capability notes and
ADR-021 CURRENT FACT limits only; accepted intent/product policy unchanged.
See ../reports/S362_POSTGRESQL_ACCEPTANCE.md for per-test assertions and limitations.
Historical initial BLOCKED notes/results above remain historical, not current status.
Current internal S3.6.2 status COMPLETE; S3 overall IN PROGRESS, public HTTP/durable
flow still backlog. New acceptance archive uses exclusive publication with suffix
if needed; original archives and unrelated WIP must remain byte-identical.


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
