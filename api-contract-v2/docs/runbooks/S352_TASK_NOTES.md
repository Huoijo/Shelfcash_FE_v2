# S3.5.2 operational capture and internal pipeline

## PostgreSQL acceptance continuation — pre-run plan (2026-10-08)

User opened Docker and authorized finishing only S3.5.2 PostgreSQL acceptance.
Before any fixtures/migrations: Docker container healthy; reset guard passed for
local `127.0.0.1:5432`, `shelfcash_test`, environment `test`. Administrative catalog
probe on `postgres` confirmed reachability/test DB existence, without connecting
to development DB or printing credentials. Existing fixture/reset mechanism checks
actual `current_database()` before test-schema reset/migration. Test DB is disposable.

Acceptance: run the six authored PostgreSQL tests; require real concurrent committed
mutation to preserve one MVCC view, scope rejection, detached capture, pool release
before solver, read-only enforcement/caller ownership, and retained blockers/provenance.
Strengthen missing PostgreSQL assertions if the six cases do not cover a required
invariant. No weakening/skips/mocks substituted. Only affected tests/regressions;
no full suite/large benchmark. Scope/rollback: S352 tests and any evidenced S352 fix,
canonical acceptance docs/report and packaging only; no policy/API/schema/DecisionRun
writes. Preserve all WIP/ZIPs; hashes captured in
`runtime/s352_acceptance/before_hashes.json` before edits. Publication uses a new
acceptance-specific ZIP/suffix with verified temporary archive, no overwrite.

## Pre-edit scope / contract / rollback (2026-10-08)

User authorization: attached S3.5.2 task. Reuse S1 scoped repositories, S2 retained
Forecast provenance, S3 frozen prepared snapshot/BOM/serving/procurement/comparison.
ADR-007/010/014/016/017/019 apply; ADR-018 remains PROPOSED. No new policy acceptance.
Branch `feat/from_forecast_to_decision_run`, HEAD
`a4b68378f35fea6f71b549e24393cf4bbb35aba5`; extensive preexisting S3 WIP preserved.
Baseline hashes/status: `runtime/s352/before_hashes.json`, `before_status.txt`.

Contract: trusted internal Store-scoped request with explicit ForecastRun and Product
scope; owned read-only PostgreSQL REPEATABLE READ capture, detached typed facts,
current-balance observation time (no historical as-of ability), explicit day-start
attestation and inventory completeness/confirmed-empty declarations. Reject unsupported
past-day capture. No caller Session accepted or caller transaction changed.
Forecast prediction units come from integrity-verified retained input, never inferred
from current Product labels. Missing legacy retention blocks rather than guessing.
Exact units only; no conversion source exists in schema, so no conversions fabricated.

Explicit configuration: frozen DecisionPolicy v1 (historical boundary only), separate
procurement/1 policy/targets, offered term IDs/bounds/fees, budget when no effective DB
budget, capacities/supplier limits with provenance and explicit unconfigured states.
No committed inbound source/semantics exists; declare none or block unsupported inbound.
Hypothetical procurement arrivals remain separate. No silent missing-balance zero.

Acceptance: repository-to-comparison happy path, cross-store IDs, incomplete/invalid
forecast coverage/provenance, dated recipes/units, balance missing versus zero, expiry
and future receipts, explicit configuration provenance, blockers stop solver, detached
mutation/revalidation, fresh PostgreSQL reads/same MVCC snapshot/read-only isolation,
released connection before computation, INCOMPLETE/UNKNOWN/no-candidate preservation.
Technical exceptions propagate separately from business blockers/no-pass outcomes.

Verification scope: new unit/capture PostgreSQL tests, direct BOM/serving/procurement/
comparison/decision boundary regressions and packaging tests. No shared lifecycle,
schema, public API or algorithms changed; targeted integration covers new read-only
transaction boundary without claiming a full regression. No large benchmark rerun.
DB tests use guarded disposable `shelfcash_test` only, never development DB.

Affected behavior: internal BE composition and synthetic demo only. FE, ML/Data,
S1/S2 runtime and all persisted runs unchanged. No DecisionRun writes/retention,
HTTP, winner, PO, migrations, commit/push or next slice.
Rollback: only new capture/contracts/adapter/pipeline/demo/tests/feature/task files,
new S352 documentation entries, narrowly extended packaging helper/tests and S352
bundler/evidence. Never reset worktree/DB or remove existing ZIPs.

## Source mapping (frozen before implementation)

| Snapshot field | Scoped source | Effective time / missing behavior |
| --- | --- | --- |
| Store/timezone/currency | StoreRepository | Current row; missing blocks |
| Products/selling units | CatalogRepository requested IDs | Current definitions; unit drift against retained forecast blocks |
| Forecast/predictions/model/warnings | ForecastRepository + ForecastInputRepository + ExecutionMetadataRepository | Explicit COMPLETED run, retained input digest/units; D+1..D+7 exact coverage |
| Recipes/lines | RecipeRepository versions/lines | Inclusive daily effective bounds; gap/empty blocks, overlap rejects |
| Ingredients/unit definitions | CatalogRepository | Exact base labels only; no conversion table |
| Lots/current balance | InventoryRepository all scoped lots | Current MVCC values; no historical inventory query; missing quantity blocks |
| Supplier terms | SupplierRepository | Active/effective at decision date, all scoped Ingredients; pack cost/MOQ/lead/shelf captured |
| Constraints | ConstraintsRepository | Order-day budget, horizon-intersecting safety; unsupported safety blocks |
| Source timestamps | Existing created_at/updated_at/completed_at | Observed source metadata, not full temporal history |
| Policies/fees/bounds/capacity/limits | Required typed caller declarations | No DB storage source; provenance retained separately |
| Committed inbound | No canonical source | Explicit absence attestation or blocker; not stock/hypothetical arrivals |

## Implemented / routine choices

CURRENT FACT: small typed capture contracts, synchronous snapshot port, PostgreSQL
repository adapter, capture validation and internal pipeline added. Public API/schema,
S1/S2 lifecycle/algorithms and existing BOM/serving/procurement/comparison source unchanged.
All Store Ingredients are captured conservatively, with explicit per-Ingredient
inventory completeness; no lot rows require confirmed-empty declaration, never zero
inference. Existing expired/future rows remain captured. Full Forecast Product scope
must equal requested scope; unit and timezone drift against retained input blocks.
Forecast completion after capture is rejected. Source-time metadata and forecast
execution details are retained by value. Existing forecast retention is verified,
but no Decision snapshot retention/hash/replay is introduced.

CAPTURED is a data-capture outcome, not Decision quality. Configuration preflight can
return COMPUTATION_BLOCKED with capture still CAPTURED. Existing serving boundary
expands BOM first; pipeline reuses its BOM result, avoiding a redundant explicit
expansion. Each basket still receives its own canonical hypothetical arrivals and
mandatory validation. INCOMPLETE/UNKNOWN/no-candidate and technical ERROR survive
comparison; no candidate is fabricated. All decision_readiness remains NOT_ASSESSED.

Routine reversible choices: full Store Ingredient capture; fixed exact Forecast scope;
explicit completeness/absence declarations until DB sources exist; consumer blocks
legacy forecasts without retained units; owned adapter accepting Engine, never Session;
clock records observation after first snapshot SELECT; source timestamps retained,
not interpreted as historical availability. No open serving/budget/selector decision
was accepted. Existing snapshot policy-v1 coefficients are preserved but not used as
implicit procurement policy/targets. No committed-inbound implementation.

## Original implementation commands / HISTORICAL INFORMATION

1. `.venv/Scripts/python.exe -m pytest tests/unit/test_decision_capture.py -q`:
   first run **41 passed, 1 failed in 3.55s**, five intentional malformed-copy serializer
   warnings. Failure was a test assertion comparing Decimal to string; corrected.
2. `.venv/Scripts/python.exe -m pytest tests/unit/test_decision_capture.py -q -k 'happy_native or procurement_preflight'`:
   **6 passed, 36 deselected in 1.34s** after assertion correction and capture/computation
   outcome separation. No full rerun for that small patch.
3. `.venv/Scripts/python.exe -m pytest tests/integration/test_decision_operational_capture.py -q`:
   **6 setup errors in 8.11s**: PostgreSQL connection timeout in the guarded existing
   fixture. No integration test body reached. `docker version --format '{{.Server.Version}}'`
   reported Docker daemon pipe unavailable. No development DB inspected/reset/migrated.
   No SQLite/mock equivalence or PostgreSQL pass claimed. Test corruption injection was
   subsequently corrected to a valid-shaped wrong digest (`'0'*64`) from reading schema;
   collection-only is the only later integration command, not a successful execution.
4. `.venv/Scripts/python.exe -m pytest tests/unit/test_decision_capture.py tests/unit/test_decision_snapshot_adapter.py -q`:
   **49 passed in 5.18s**, then **51 passed in 5.04s** after adding retained forecast
   execution/warning provenance and supplier overlap tests. Five warnings each run come
   from deliberately invalid copied balance types before rejection; no fabricated values.
5. `.venv/Scripts/python.exe -m pytest tests/unit/test_bom.py tests/unit/test_serving.py tests/unit/test_serving_output_validation.py tests/unit/test_decision_execution.py tests/unit/test_procurement.py tests/unit/test_procurement_comparison.py tests/unit/test_application_contracts.py tests/unit/test_repository_contract.py -q`:
   **345 passed in 55.98s**. Direct engine/boundary/architecture regressions only,
   not full regression. No existing shared engine/schema/writer change.
6. `.venv/Scripts/python.exe -m pytest tests/unit/test_review_archive.py -q`:
   **19 passed, 2 skipped in 0.12s**. Temporary verification, exclusive hard-link
   publication, preservation under concurrent writer, suffix and path rejection covered.
   Windows denied actual symlink creation (WinError 1314); those two tests remain unverified.
7. `.venv/Scripts/python.exe scripts/demo_decision_pipeline.py --output runtime/s352/synthetic_pipeline.json`:
   SYNTHETIC fake repository port + native solver returned CAPTURED/COMPUTED, 1 pack,
   outlay0.1, three FINISHED/PASS_EXISTS/UNPROVEN outcomes grouped to one option; no winner.
   This initial artifact predates added forecast-provenance wrapper fields.
8. `.venv/Scripts/python.exe -m pytest tests/unit/test_decision_capture.py -q -k 'future_forecast_completion or forecast_warning or overlapping_supplier'`:
   **3 passed, 44 deselected in 0.62s**, following the small future-completion/timezone guard.
9. `.venv/Scripts/python.exe -m pytest tests/integration/test_decision_operational_capture.py --collect-only -q`:
   **6 tests collected in 0.71s**; no database body executed.
10. `git diff --check`: exit0, tracked whitespace check only; untracked source included
    directly in review archive rather than claiming git diff contains it.
11. `.venv/Scripts/python.exe scripts/demo_decision_pipeline.py --output runtime/s352/synthetic_pipeline_final.json`:
    current wrapper/provenance output captured after final guard changes; same
    CAPTURED/COMPUTED, 1-pack/outlay.1 and UNPROVEN outcomes. Initial artifact preserved.
12. `.venv/Scripts/python.exe scripts/bundle_s352_review.py`: first attempt correctly
    rejected the changed packaging note omitted from its allowed-change list, before
    writing any ZIP. Added that authorized packaging-document change to the narrow
    allowlist; historical ZIP/engine preservation checks remain strict. The final
    invocation verifies temporary CRC, safe paths, both manifests/hashes and exact
    filesystem source correspondence before exclusive publication.

Unit tests establish hand-expected demand2/stock1/pack1/outlay.1, exact dated recipe/unit
mapping, malformed/cross-store facts, missing versus zero, detached snapshots, future/
expiry handling, configuration blockers, unknown/proof/no-candidate/technical outcomes,
and fake owned-resource release. They do NOT prove PostgreSQL MVCC/readonly/real pool
release, fresh-session state, forecast quality, optimizer global optimum or real data.
At this original packaging point, six PostgreSQL tests were authored but unverified;
the acceptance continuation below supersedes that limitation.

## Original packaging status / HISTORICAL INFORMATION

Code implemented; PostgreSQL acceptance gate remains IN PROGRESS. No full pytest,
large benchmark or business HTTP/OpenAPI change. Caller attestations cannot prove
before-trading/no-unreported-orders/completeness. No inventory historical as-of or
movement-ledger reconstruction, conversion/committed-inbound source, persisted business
configuration, DecisionRun retention/replay/selection/API or real quality evidence.
Next action within this slice: run the included PostgreSQL group on a healthy guarded
disposable database and review temporal/configuration boundaries. No next slice started.

Packaging uses S3.5.2-specific name, validated private temporary ZIP and exclusive
publication; an existing target gets a new suffix. Historical ZIPs stay byte-identical.
Current S3.4.4 is REGENERATED, not original ZIP bytes (REVIEW_PACKAGING.md). No historical
bundler rerun or regeneration. Final verification result lives in
`runtime/s352/bundle_verification.json` after publication, outside the self-referential ZIP.

## PostgreSQL acceptance — CURRENT FACT / PASS (2026-10-08)

Ran `.venv/Scripts/python.exe -m pytest tests/integration/test_decision_operational_capture.py -q --tb=short`:
**6 passed in6.79s**. No implementation failure; runtime files unchanged. Strengthened
the same six tests with actual persisted warning/selection provenance, post-capture
mutation, successful caller-ownership/pool accounting and blocker-to-pipeline assertions;
reran the same command: **6 passed in7.47s**, no skips.
Added other-Store Ingredient/Supplier/recipe/line/term/lot/budget rows plus foreign-term
configuration rejection to existing cross-store case; reran only
`.venv/Scripts/python.exe -m pytest tests/integration/test_decision_operational_capture.py -q --tb=short -k actual_cross_store`:
**1 passed,5 deselected in1.48s**. No test weakening or business semantics changes.

Evidence: actual RR/read-only MVCC view after another connection commits mutations;
fresh current values differ, and post-capture commit does not mutate retained DTOs.
Pool checkedout0 before three solver factories; read-only SQLSTATE25006; caller active
dirty transaction survives both success/failure; own scope excludes foreign rows;
retained digest/warnings/config references survive to pipeline/comparison; missing
balance and corrupted retention stop before solver. No DecisionRun or operational write
by pipeline. Synthetic fixture writes occur only on disposable test DB.

Final test-only read-only inspection: `shelfcash_test`, PostgreSQL17.11,
Alembic0008_forecast_execution_meta at head; business tables empty after fixture cleanup.
No development connection/inspection/migration/reset; no credentials printed/packaged.
Safe target/head metadata and real logs are in runtime/s352_acceptance.

Packaging helper now admits the exact acceptance stem while maintaining strict path
guard/exclusive publication and numbered suffix. Ran
`.venv/Scripts/python.exe -m pytest tests/unit/test_review_archive.py -q --tb=short`:
**23 passed,2 skipped in0.14s**; Windows symlink permission limitation unchanged.
No full suite/benchmark or pure engine rerun: runtime/contracts/schema/lifecycle unchanged,
so real S352 capture-boundary tests plus affected packaging regressions are sufficient.
Prior pure test results remain historical. New ZIP uses
`.venv/Scripts/python.exe scripts/bundle_s352_acceptance_review.py` and preserves every
preexisting ZIP. Verification output: runtime/s352_acceptance/bundle_verification.json.

S3.5.2 COMPLETE within internal scope; S3 IN PROGRESS. Remaining limits/open decisions
unchanged; no next slice, API/winner/persistence/policy/commit/push. Detailed assertions,
commands, limits and rollback: [acceptance report](../reports/S352_POSTGRESQL_ACCEPTANCE.md).
