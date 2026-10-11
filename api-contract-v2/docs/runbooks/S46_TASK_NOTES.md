# S4.6 — inventory/supplier canonical import và public stock writers

## Freeze trước implementation — 10/10/2026

ACCEPTED SCOPE: explicit user task S4.6, ROADMAP row includes receipts/opening/count/
threshold/supplier/fees/declarations. Preserve S4.5 four-schema semantics, whole-import
atomic transaction/current rights/read-set/confirmation/pins/receipts/jobs. Five
existing Import schemas gain writers; N6 synchronous receipt/opening and N8 Owner
threshold satisfy public workflows. Dedicated Excel opening/receipt schemas are not
required by existing authoritative contract: these use N6, not count aliases.
Purchase history OPEN, timeline S4.7/readiness execution/engines outside scope.

Authority: AGENTS order CURRENT_STATE→DECISIONS/relevant accepted ADR007/008/009/010/
011/013→ARCHITECTURE→API→DOMAIN/SCHEMA→ROADMAP; Import13/Auth/Inventory N6/N8,
schema inventory/field values/staging/S45/batch foundation source and evidence.
CURRENT FACT before edits: five schema previews, four commit adapters; no canonical
fee/declaration/source-term registry or receipt identity/threshold storage. Inventory/
SupplierTerm internal writers own transactions. S4.5 canonical audit JSON sufficient
for sales; S4.6 needs actual typed operational config and public receipt storage,
not fabricate completeness from audit count or model existence.

Plan: red targeted HTTP Import/N6 cases → additive Alembic storage (test-only) →
transaction-owned inventory/SupplierTerm seams + explicit scoped configuration writers
→ preview identity/version/amendment/coverage + atomic adapter/completion → N6/N8
same stock invariants/current auth/CAS/retained receipts → targeted PG fresh-session
atomicity/replay/fences/recovery/source distinctions → affected S4.5/read/migration
regressions → offline OpenAPI/docs. Conservative ordered table fences retained;
no concurrency infrastructure redesign. Immutable source revisions + explicit audited
period closing, no retroactive price edits or generic UPSERT.

Before-edit baseline: branch feat/from_forecast_to_decision_run, HEAD
a4b68378f35fea6f71b549e24393cf4bbb35aba5. Existing broad WIP/ZIP preserved; hashes,
status and offline schema in ignored runtime/import_inventory. Rollback only own
deltas/new0014 files; never reset/restore unrelated tree.
Affected: BE Import/writer/read projections, FE N6/N8 + supplier_changes/I04/I06;
ML/Data/demo receive genuine source facts, no implicit engine or forecast/planning.
Tests: local exact shelfcash_test guard before connections/reset/migrate, sequential
targeted PG; no development DB/full suite/live OpenRouter/browser/deploy/ZIP.

## Execution evidence

CURRENT FACT ? 11/10/2026: COMPLETE authorized S4.6, not whole v1/runtime release.
Migration0014 eight operational tables + scoped FK/unique/immutable guards; no
business backfill. Inventory/SupplierTerm transaction-owned seams retain old callers.
Nine Import adapters share existing atomic transaction/job/audit fences. Explicit
source registries and exact typed payloads, period amendments and executor
supplier_changes; immutable fee/declaration revisions and nested provenance.
N6/N8 synchronous typed public writers/current auth/CAS/retained receipts; reads
project confirmed coverage/threshold/origin/actor without parser/provider/writes.
No engine algorithm, quantity rounding, count-as-receipt or implicit coverage.

### Exact verification commands and outcomes

Commands run from backend PowerShell. Before every pytest invocation:
`$env:PYTHONDONTWRITEBYTECODE='1'; $env:IMPORT_WORKER_ENABLED='false'`.
Executable is `.\.venv\Scripts\python.exe -m pytest`; test fixtures enforce local
`shelfcash_test` before DB/reset/migration operations, PostgreSQL17.11, PG sequential.
These are overlapping gates, not a sum or full-suite claim.

Final critical gate, 105 passed / 200.60s:
```powershell
.\.venv\Scripts\python.exe -m pytest tests/integration/test_import_inventory_supplier.py tests/integration/test_stock_writes.py tests/integration/test_operational_import_schema.py tests/unit/test_operational_import_preview.py tests/unit/test_import_preview.py tests/integration/test_import_commit.py tests/integration/test_public_reads.py tests/api/test_stock_writes_openapi.py tests/api/test_import_openapi.py tests/api/test_public_reads_openapi.py tests/api/test_auth_openapi.py tests/integration/test_forecast_decision_persistence.py::test_fresh_migration_exact_tables_and_downgrade tests/integration/test_supplier_operational_constraints.py::test_fresh_schema_and_downgrade_reupgrade -q --tb=short --show-capture=no --maxfail=2
```

Affected staging/auth gate, 61 passed / 127.98s:
```powershell
.\.venv\Scripts\python.exe -m pytest tests/integration/test_import_staging.py tests/integration/test_import_classification.py tests/integration/test_import_field_value_bindings.py tests/integration/test_import_batch_mechanics.py tests/api/test_auth_openapi.py tests/api/test_staff_openapi.py -q --tb=short --show-capture=no --maxfail=2
```

Last boundary gate after quantity max200 / additive 413 documentation, 16 passed /
20.52s. Final critical gate predates only these bounded DTO/response declarations.
```powershell
.\.venv\Scripts\python.exe -m pytest tests/unit/test_stock_write_contracts.py tests/api/test_stock_writes_openapi.py tests/api/test_auth_openapi.py tests/integration/test_stock_writes.py -q --tb=short --show-capture=no --maxfail=2
```

Broadened schema/internal-caller gate because additive migration and transaction
seams affect existing persistence, 276 passed / 2 failed / 282.11s:
```powershell
.\.venv\Scripts\python.exe -m pytest tests/integration/test_database_bootstrap.py tests/integration/test_identity_store_schema.py tests/integration/test_catalog_recipe_schema.py tests/integration/test_supplier_operational_constraints.py tests/integration/test_data_semantics_correction.py tests/integration/test_verification_commands.py tests/integration/test_operational_paths.py tests/integration/test_forecast_decision_persistence.py -q --tb=short --show-capture=no --maxfail=3
```
Failures were exact table inventory/downgrade expectations (42→50 tables and eight
new tables removed at downgrade), not altered domain outputs. Both failed cases
rerun in final105 gate and passed; did not rerun the entire broad gate.

Earlier developmental runs (commands below use same prefix/options):
- `tests/integration/test_import_inventory_supplier.py tests/unit/test_import_preview.py`:22 passed /7.45s.
- `tests/integration/test_stock_writes.py tests/integration/test_import_inventory_supplier.py tests/integration/test_public_reads.py`:30 passed /53.19s.
- Critical adapters/schema/stock/import gate:69 passed /138.07s before subsequent edge fixes; historical, superseded by final105.
- Expanded critical gate:77 passed /1 failed /150.95s, corrected readiness DTO assertion to `actions.result_assessment`.
- `tests/integration/test_import_inventory_supplier.py tests/integration/test_stock_writes.py tests/integration/test_operational_import_schema.py tests/unit/test_operational_import_preview.py tests/integration/test_public_reads.py`:49 passed /1 failed /122.91s; concurrent-claim test corrected for existing single-flight returning None.
- Affected staging/auth command above first58 passed /2 failed /122.38s; preserved explicit supplier source identity (no UUID-text implicit binding), corrected path inventory including pre-existing I06 omission. Rerun61 passed.

### Fail?fix and meaningful evidence

- Initial count RED failed before adapter; after adapter and migration passes. Count
  adjusts an identified lot, one exact correction movement, no lot/receipt creation.
- Mixed-source fixture initially lacked explicit supplier binding and tried approving
  an already active profile. Fixed fixture/helper, not relaxed Owner approval.
- Complete coverage initially read UNKNOWN: SQL `text` xmin was absent from row mapping;
  fixed labeled `literal_column` projection, verified costless read and dependency hash.
- Future fee amendment needed typed `EntityRefs.fee_id`; added field and verified
  immutable closed-period copy/new version, term effectivity and exact confirmation.
- A later declaration reused covered lot UUID as its own identity, causing PK collision.
  Fixed schema-specific root identity; count+same-payload declaration now creates a
  new revision/post-write dependency digest. CONFIRMED_EMPTY validated against explicit
  same-batch count0, not old physical balance. No fabricated empty declaration.
- Clock-advanced fixture expired its login session; relogged before HTTP calls. No
  weakening auth expiry. Parallel worker claim may legitimately return None; drain
  remaining job, assert one completed canonical write/one stale rejection.
- PG btree key limits: raw typed source key1000 Unicode is retained but indexed by
  SHA256 identity with scoped uniqueness; fresh PG long-key test. No identity truncation.
- Strong scoped FK/immutable trigger tests, migration downgrade/re-upgrade and fresh
  Session assertions prove storage. Two real PG N6 requests same source create one
  lot; two import worker claims single flight/read-set fencing preserve atomicity.
- Lost acknowledgment tests require fresh durable receipt/completion proof; no blind
  retry success. Replay reauthorizes and masks cost using current rights; supplier/
  inventory rights revoked before execution prevent all writes.
- Final max200 stock Decimal text avoids backend numeric fractional representation
  overflow without rounding. Null threshold clears; exact0 valid; public N6 cost
  Money18/18 and import Quantity200 remain distinct typed contracts.

### OpenAPI / documentation / limits

Offline schema generated with Engine.connect and raw_connection patched to raise;
no database connection/lifespan/worker. Artifacts under ignored
`runtime/import_inventory/openapi_after.json` and `openapi_diff.json`.
Exactly two added paths N6/N8, zero removed/changed existing paths; eleven added and
eleven changed components (typed operational impacts/provenance/period amendments).
No checked-in generated OpenAPI artifact convention existed.

Known warnings: three Pydantic `schema` shadow warnings and Starlette anyio alias
DeprecationWarning. Source inspection/test presence is not proof an unrun case passed.
Full suite, production migration, live OpenRouter, frontend browser/demo and downstream
planning integration were not run. No development DB/commit/stage/push/deploy/ZIP.

TECHNICAL DEBT carried from S4.4: handwritten Import?13 source key128/MoneyText
bounds differ from typed source Text1000/Quantity200. Preserved current source
validation; feature documents drift explicitly rather than claiming a user-approved
policy change. Purchase-history policy remains OPEN; source-bound reconciliation is
technical drift, not another business decision for this slice. Existing previews made
before added canonical snapshot tables may need refresh under normal staleness checks.

Next authorized dependency is S4.7 recipe timeline, followed by S4.8 readiness and
S4.9 public planning; not started. H01/H02/R01 not supplied by S4.6. Rollback only own
S4.6 deltas; staging/index/HEAD and unrelated WIP/ZIP/instructions/accepted ADRs remain
untouched. No next-slice authorization inferred from completion.


### Final documentation / WIP checks

- Python AST parse all changed baseline Python files plus new writer/model/contract
  helpers: passed, no generated bytecode. Both feature JSON examples parsed; relative
  file links in new feature/task notes resolve. Existing historical repo links were
  not rewritten to hide drift.
- `git diff --check`: exit0; only Git LF?CRLF informational warning for app/main.py.
- Baseline SHA256 comparison in runtime/import_inventory: only intended S4.6 source,
  tests/docs/schema/script deltas. No protected ADR/AGENTS/config/.env.example/engine/
  S45 task notes/FE original/ZIP changes. HEAD remains
  a4b68378f35fea6f71b549e24393cf4bbb35aba5; `git diff --cached --name-only` empty.
- Table fences intentionally serialize canonical writes across Stores on shared
  tables. Correctness verified locally; throughput/load testing not performed.
