# S4.5 — atomic canonical import commit

## ACCEPTED SCOPE / freeze before implementation, 10/10/2026

Explicit user authorization: finish S4.5 catalog (Product/Ingredient), sales and
recipe canonical commit from retained preview + per-import confirmation, current
rights, Owner-approved pins, CAS/idempotency and durable jobs/completion. All-batch
atomicity; no silent omissions. Inventory/count/opening/receipts/supplier/fees/
declarations remain S4.6; purchase history OPEN. No provider in commit, no engine
change, development DB, stage/commit/push/ZIP or next slice.

Authority read: AGENTS order, CURRENT_STATE, DECISIONS/accepted ADR004/007/008/010/
013, ARCHITECTURE/API/DOMAIN/SCHEMA/ROADMAP, Auth and Import contract; S44 notes,
classification/shared-value/batch mechanics and schema inventory. S4.4 schema
capability is preview capability, not commit support. User contract overrides
historical ADR008 atomic/partial and ADR013 self-approval wording; ADRs unchanged.

Baseline branch feat/from_forecast_to_decision_run, HEAD
 a4b68378f35fea6f71b549e24393cf4bbb35aba5; large unrelated WIP preserved.
Hashes/status in ignored runtime/import_commit. Rollback only explicit deltas in
Import contracts/service/routes/read-set/preview, transaction seams in catalog/
sales/recipe writers, new commit adapter/tests and current slice docs. Preserve
Auth/Staff/engines/S364/accepted ADR/FE original/archives; no tree-wide restore.

Plan: failing HTTP commit acceptance; reusable transaction-owned typed writers;
read-set locking compatible with existing S1 writers (table-level write fences for
phantoms when writers lack Store fencing); retained effective plan and atomic
canonical/audit/completion. Use existing0013 durable jobs/receipts/immutable audits
if sufficient; do not add tables only for endpoint count. Source sales contributions
need retained versioned provenance, not file hashes or generic UPSERT. Unsupported
schema blocks whole commit, even NO_OP. Completion readiness records unknown when
current evaluator absent, never fabricated planning readiness.

BE/FE: phase commit202, J01 import_completion and I06 retained read, I04 hints;
confirm_review200 does not write canonical. ML/demo: canonical sales available to
existing pipeline, retained Runs unchanged; no implicit forecast/planning execution.
Acceptance: fresh PG Sessions, rollback/locks/revocation/replay/recovery/provenance,
Ngày/Món/SL12/0 with approved unit and new import report key. Guard exact local
shelfcash_test before connect; sequential targeted PG only, no full suite default.
Offline OpenAPI changes limited accepted S4.5 operations/variants.

## Evidence

S4.5 COMPLETE authorized four-schema scope, not whole Import v1 or full runtime
acceptance. Source/DTO routes commit job/completion are implemented and targeted
real PostgreSQL verified. Current capability/FE JSON/count definitions in
[feature](../features/IMPORT_CANONICAL_COMMIT.md); canonical policy unchanged.

### Storage/transaction choice and limits

Existing0013 storage is sufficient: immutable retained previews, confirmations,
receipts/jobs and ImportAudit JSONB. No migration/model/schema change. Sales source
revisions are append-only canonical commit evidence inside immutable audits; ID
includes Store/system/report/Product/day, source and canonical revisions, quantity,
explicit correction/merge resolution and captured unknown-baseline row/version.
No new shadow totals, generic UPSERT or event-sourcing architecture introduced.
Catalog/recipe/sales writers reuse transaction-owned seams; standalone callers keep
owned transaction and original error handling. Failure rolls back all canonical
rows AND success audit/completion, verified fresh Sessions.

Canonical table write fences are conservative/global, sorted fixed model names,
cover absent rows and internal writers lacking Store fencing. Tests prove real PG
lock wait, not throughput. No source/engine/auth/staff redesign. Import job claim/
process-proof recovery existing foundation reused; no broker/background infrastructure.
Completion readiness evaluator remains unavailable: unknown/NOT_ASSESSED, no false
planning-ready or reconstructed engine result. H01/H02/R01 and S4.6 not implemented.

### Test database guard and execution context

Before test connection: Settings.test_database_url parsed with make_url; exact
database=shelfcash_test, host local and no query; validate_reset_target on settings
with environment=test/database_url overridden. Only after guard, SELECT
current_database()/version() verified shelfcash_test/PostgreSQL17.11. No development
DB connect/reset/migrate. Sequential PG pytest processes; integration fixture owns
only disposable test reset/Alembic. No real OpenRouter; fixture clears provider key,
commit/read hooks forbid parser/suggest_sheet/make_preview/write_rows as appropriate.

Every pytest invocation below uses PowerShell context:

```powershell
$env:PYTHONDONTWRITEBYTECODE='1'
$env:IMPORT_WORKER_ENABLED='false'
```

No full suite. Do not sum overlapping gates. Exact commands and outcomes:

| Order | Command after `.venv\Scripts\python.exe` | Actual result / correction |
| --- | --- | --- |
| 1 | `-m pytest tests/integration/test_import_commit.py -q --tb=short --maxfail=1` | RED:1 failed,4.15s; current409 IMPORT_COMMIT_NOT_SUPPORTED expected before implementation. |
| 2 | Same command | 1 passed,4.53s; first public HTTP→job→fresh canonical read. |
| 3 | `-m pytest tests/integration/test_import_commit.py -q --tb=short --maxfail=2` | 1 failed,10 passed,26.36s; fixture tried missing openpyxl. Reused existing tiny ZIP/XML XLSX helper, no dependency added. |
| 4 | `-m pytest tests/integration/test_import_commit.py tests/api/test_import_openapi.py tests/api/test_health.py -q --tb=short --maxfail=2` | 2 failed,12 passed,34.65s; reused-profile helper expected new approval issue, count fixture omitted explicit inventory_semantics. Fixed fixtures, not business validation. |
| 5 | `-m pytest tests/integration/test_import_commit.py::test_recipe_creates_reserved_ingredient_and_preserves_zero_loss_then_blocks_overlap tests/integration/test_import_commit.py::test_unsupported_inventory_noop_blocks_whole_commit -q --tb=short --show-capture=no` | 1 passed,1 failed,6.83s; count declaration still absent, corrected explicit lot_stock_count fixture. |
| 6 | `-m pytest tests/integration/test_import_commit.py tests/api/test_import_openapi.py tests/api/test_health.py -q --tb=short --show-capture=no --maxfail=2` | 20 passed,1 failed,47.37s; old OpenAPI test still asserted I06 absent, updated to accepted implemented path. |
| 7 | `-m pytest tests/integration/test_import_commit.py tests/unit/test_import_sales_sources.py tests/api/test_import_openapi.py tests/api/test_health.py -q --tb=short --show-capture=no --maxfail=2` | 26 passed,1 failed,58.41s; bad-unit fixture attempted Owner approval without conversion and was correctly blocked at mapping. Test now asserts actual early gate; no invented conversion. |
| 8 | `-m pytest tests/integration/test_import_commit.py::test_recipe_invalid_unit_or_dates_block_before_commit tests/api/test_import_openapi.py -q --tb=short --show-capture=no` | 3 passed,7.40s after fixture fix. |
| 9 | `-m pytest tests/integration/test_import_staging.py tests/integration/test_import_classification.py tests/integration/test_import_field_value_bindings.py tests/integration/test_import_batch_mechanics.py tests/unit/test_import_preview.py tests/unit/test_import_field_values.py tests/integration/test_catalog_recipe_schema.py tests/integration/test_data_semantics_correction.py tests/integration/test_public_reads.py -q --tb=short --show-capture=no --maxfail=2` | **173 passed**,235.49s,4 warnings. Affected foundation/writer/public-read regression, not full suite. |
| 10 | `-m pytest tests/integration/test_import_commit.py tests/unit/test_import_sales_sources.py tests/api/test_import_openapi.py tests/api/test_health.py tests/unit/test_import_preview.py -q --tb=short --show-capture=no --maxfail=2` | Final source gate **47 passed,1 failed**,57.46s,4 warnings. New provenance assertion wrongly treated public dict as list; source was correct. Fixed only assertion to row.provenance.quantity.origin. All other cases passed on final source, including multi-line recipe provenance/local readiness date. |
| 11 | `-m pytest tests/integration/test_import_commit.py::test_disjoint_source_retry_revision_205_to_210_and_daily_total_mix_blocked -q --tb=short --show-capture=no` | **1 passed**,5.47s,4 warnings. Only failed affected case rerun; no fake combined regression count. |
| 12 | `-m pytest tests/integration/test_import_commit.py::test_commit_acceptance_and_success_receipt_replay_recheck_current_write_rights tests/integration/test_import_commit.py::test_reserved_product_commits_before_dependent_sales_with_explicit_false_null -q --tb=short --show-capture=no` | **3 passed**,7.69s,4 warnings. Added acceptance AND successful-receipt replay revocation checks, plus raw-row/logical-action count distinction. No source change after gate10. |

An intervening local edit script used Windows default encoding on the NEW own test
file and failed UnicodeError, leaving that new file truncated; selection ran no
tests (0.02s), not a pass. Reconstructed only own new file, switched every doc/script
read/write to UTF-8. Existing WIP/source files were not restored/truncated. Later
gates above execute reconstructed tests. Warnings are preexisting Pydantic schema
shadowing (3) and Starlette/AnyIO deprecation (1), not ignored failures.

### Verified evidence → acceptance

All names below belong to `tests/integration/test_import_commit.py`, actually run
in gate10 (one assertion fix verified gate11) or added affected gate12;
source presence alone is not evidence.

| Cases | Evidence |
| --- | --- |
| test_http_commit_fresh_rows_retained_completion_and_same_key_retry | Public I05 commit202/J01/I06, canonical/audit fresh Session, retained receipt replay, GET forbidden-computation hooks, correct Store-local readiness date vs batch data_date. |
| test_excel_shared_values_reuse_12_and_zero_require_own_confirmation | Real tiny XLSX Ngày/Món/SL12 and0, explicit PROFILE_CONSTANT unit and IMPORT_VALUE report key; missing next-batch key blocked, fresh preview/confirmation, source-aware NO_OP. |
| test_reserved_product_commits_before_dependent_sales_with_explicit_false_null | Approved reservation before dependent sales, false/null preserved, IDENTITY_BINDING proposal provenance, no stock rows. |
| test_recipe_creates_reserved_ingredient_and_preserves_zero_loss_then_blocks_overlap | Approved Ingredient dependency, two actual RecipeLines/source-row column provenance, zero loss/null/falses, overlap blocked. |
| test_recipe_invalid_unit_or_dates_block_before_commit | Mapping conversion-required gate and invalid date preview gate preserved; no canonical recipe. |
| test_rejected_transaction_rolls_back_earlier_canonical_rows_and_success_audit | Inject failure only after TWO actual SQL flushes inside real PG transaction; fresh Session sees zero rows/success audit/completion. Injection is not mocked DB transaction. |
| test_changed_dependency_blocks_acceptance_or_execution / test_shared_declaration_change_requires_new_preview_and_review | DB/read-set and declared-value changes block accepted/queued plan, no hidden preview or writes. |
| test_worker_current_rights_not_acceptance_grant / test_commit_and_completion_foreign_store_reads_deny_and_retained_read_does_no_work | Current revoked commit/write/sensitive reads and foreign Store deny; GET no parser/preview/commit. |
| test_commit_acceptance_and_success_receipt_replay_recheck_current_write_rights | Revoked write denies both new acceptance and replay of previously successful receipt; fresh Session verifies no extra rows/job/success audit. |
| test_retired_pin_blocks_uncommitted_but_completion_survives_profile_reapproval | Retired approval prevents new commit; approved profile update for future keeps completed batch terminal/retained result unchanged. |
| test_parallel_commit_acceptance_worker_retry_and_conflicting_payload / test_two_actual_workers_claim_only_one_commit | Real PG concurrent HTTP acceptance and independent worker threads; one canonical success/job/audit, stale412/conflict409; key/body conflict409. |
| test_uncertain_commit_after_durable_write_reconciles_without_repeat | Simulated acknowledgment loss AFTER actual Session.commit succeeded; fresh durable proof reconciles, no false failed job/double canonical writes. |
| test_actual_process_death_after_claim_requires_explicit_retry_not_double_write | Real child process claims then os._exit86, process-proof recovery marks failed; old key returns old receipt, new key/current CAS commits once. No live-worker steal or provider. |
| test_table_fence_blocks_unfenced_writer_until_atomic_commit_finishes | Actual competing S1 writer and pg_locks ungranted RowExclusiveLock prove write fencing; after release both distinct-day rows correct. |
| test_disjoint_source_retry_revision_205_to_210_and_daily_total_mix_blocked | Captured unknown baseline100 + asserted separate105→205; same source replay NO_OP;105→110 correction aggregate210; immutable source revisions/baseline evidence; mixed semantics blocked. |
| test_unsupported_inventory_noop_blocks_whole_commit | Valid preview NO_OP count still SCHEMA_BLOCKED, no inventory movement/job success or silent omission. |

`tests/unit/test_import_sales_sources.py` proves exact >28-digit arithmetic and
source correction delta; no float/context rounding. Not DB concurrency evidence.

### Offline OpenAPI / generated artifact convention

Generated via `create_app(Settings(_env_file=None,openrouter_api_key=None,
import_worker_enabled=False)).openapi()`, without entering lifespan. Before importing
main, disable env_file and replace Engine.connect/raw_connection/socket.connect
with fail guards. **No DB/network/worker/provider calls**. Ignored artifacts:
runtime/import_commit/openapi_before.json,openapi_after.json,openapi_diff.json.
Repo has no committed OpenAPI generated artifact convention; test schema assertions
updated instead. Diff PASS: add only `/api/v1/imports/{import_id}/completion`;
change only existing `/api/v1/imports/{import_id}/process`; no removed paths.
Changed existing components: CommitRequest,ConfirmationResult,ImportRead,JobView,
PreviewRow,PreviewSummary. Added completion/impact/provenance types only. Auth/Staff/
public-read/health operations and their components unchanged. Feature's three JSON
examples instantiated/serialized current CommitRequest/CommitAccepted/ImportCompletion.

### Remaining / explicitly unverified

S4.6 five schemas + opening/receipt, H01/H02/R01, recipe timeline S4.7 and later
planning/public configuration not this slice. Purchase-history remains user OPEN.
No new product decision needed for four-schema commit; deterministic JSON/CAS/
fences/typed adapters are implementation choices. Unknown sales baseline merge only
with accepted explicit operator disjointness assertion and audit, not proof by model.
Read-set/resource fences are bounded/coarse; no production throughput/load/memory,
live HTTP worker deployment, browser FE, live provider quality, crash during every
machine power-loss point, backup/restore or full-suite certification. Existing worker
config remains default false; local opt-in documented in feature. S4.6 not started.

### Final mechanical checks

Baseline476 hashes: exactly20 existing files changed, all declared S4.5 source/tests/
contract/feature/state surfaces; no baseline file missing. Six new files: two commit/
sales-source modules, integration/unit tests, feature and these notes. Existing Auth/
Staff/main/config/models/migrations/accepted ADRs/FE original/S364/S44 notes/archives
unchanged since baseline. Branch/HEAD unchanged; index empty before and after,
no stage/commit/push/deploy or ZIP creation. Earlier WIP remains intact.

UTF-8/AST parse PASS on modified/new Python files. Markdown check:21 JSON examples
syntactically valid,217 local file/anchor references resolve, including runtime-s45
explicit anchor. Three new feature examples also validate/serialize current DTOs.
`git diff --check` PASS (preexisting main.py LF/CRLF warning only). Offline artifact
runtime/import_commit/final_checks.json records hash/link checks, ignored from repo.
These documentation/OpenAPI checks are not API/runtime acceptance.
