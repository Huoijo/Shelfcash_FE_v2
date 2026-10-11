# Sheet classification, mapping review/reuse — task notes

## ACCEPTED DECISION / scope before edit (2026-10-10)

User task extends S4.4 staging/preview: typed sheet selection, indexed column
suggestions, Store profile reuse, and content-bound per-import review confirmation.
No S4.5 canonical writes, engine changes, commit/stage/push/deployment or ZIP.
Authority: AGENTS, CURRENT_STATE, DECISIONS/ADR-004/008/013, architecture/API/domain/
schema/roadmap, AUTHORIZATION and Import contracts. Legacy is reference only.
Legacy report/evidence initially absent in repo; located in sibling projectAttacker2026/attackerBE, then user supplied matching files in this backend. Read report and relevant ZIP prompt/rule/ingestion/provider/confirmation schema/tests; no legacy API/schema imported.

Baseline: feat/from_forecast_to_decision_run,
HEAD a4b68378f35fea6f71b549e24393cf4bbb35aba5, extensive existing S3/S4 WIP.
Before-edit file hashes/status/OpenAPI retained in ignored runtime/import_classification.
Keep all archives and unrelated WIP. Rollback scope: only this task's import
modules/tests/docs/config deltas; no reset/check-out of existing WIP or development DB.

## Gap table (source inspection)

| Desired behavior | Current source | Gap / acceptance |
| --- | --- | --- |
| Sheet type editable | import_analysis.discover/build_spec infer one schema from exact targets | Explicit sheet selection, indexed rule proposals; changing type clears invalid targets and pins |
| Shared descriptors | options reflects SOURCE_MODELS | Vietnamese labels/descriptions/aliases/conditional semantics and source-vs-persistence meaning; same payload to M03/provider |
| Bounded Qwen suggestion | suggest_headers, header-name dictionary | Typed versioned per-sheet payload/output, duplicate headers indexed, max8 rows, complete validation, outage manual review |
| Approved reuse | Store/signature scoped ImportProfileVersion, Owner N5 | Preserve exact reuse/no provider; expose origin; drift/ambiguity remain review |
| Per-import confirmation | I05 preview/unsupported commit; immutable previews/audit/receipts | Add I05 review confirmation bound to exact preview/source/mapping/read-set; reuse never bypasses it |
| Full review evidence | M01 sheets/M02 issues/I04 preview | Classification/source/confidence/ignored columns and confirmation status |

## Frozen additive contract / technical choices before implementation

Keep all routes/IDs. M04 resolution gains sheet_type (schema or explicit ignored
with reason/acknowledgment). Classification issue is editable even on reused sheets.
M01 sheets expose selected type, suggestion origin/confidence and ignore state.
M02 retains full indexed columns; manual origin is MANUAL, reused origin REUSED;
confidence is heuristic/self-score only, never approval or structural readiness.
M03 exposes descriptors from existing typed source schemas, not new canonical schemas.
I05 adds phase=confirm_review, exact preview_id/digest/import and mapping revisions,
explicit confirm=true/reason. Existing current import.commit + all preview write
permissions are required; confirmation creates only staging metadata/audit/receipt.
No canonical writes. I04 exposes current content-bound confirmation; any stale
preview, changed pins/revisions or revoked required permission makes it unusable.
Retry same operation receipt is retained; still reauthorize current actor.
Confirmation does not activate profiles or assert business readiness/commit support.

Provider: fixed qwen/qwen3.5-9b, temperature0/reasoning disabled, bounded selected
samples, no catalog/actor/session/workbook; strict code validation always.
No live-provider quality assertion. Exact transport budgets recorded with adapter.

## Verification plan

New pure descriptor/classification/provider-contract tests + import preview/parser
regressions. Real PostgreSQL HTTP sequential on guarded shelfcash_test: multi-sheet,
type edit/reuse/ignore/Owner approval/current revoke, confirmation exact binding/
retry/stale, fresh retained audit/profile evidence and no canonical writes.
OpenAPI old route preservation plus explicitly additive DTO changes. Targeted
coverage is selected because changes are import-only; no full/solver/ML benchmark.
Commands/results will be appended only after completion; interrupted runs are not PASS.

## CURRENT FACT — delivered scope and evidence

Code: import_descriptors + typed sheet_suggestion/1, indexed deterministic discovery,
bounded optional Qwen adapter; M04 sheet selection/ignore/reused-column proposal fork;
I05 import_review/1 confirmation + I04 current usability. Existing0013 JSON storage,
immutable preview/audit/receipt reused, no new migration/table/cache/canonical writer.
Preview hash now covers reviewed sheets/mappings/ignore acknowledgments as well as
source/pins/operations/read-set. N5 remains current Owner-only whole approval.
Same-type review preserves compatible identity/conversion issues and corrections;
different type drops invalid targets and derived incompatible issues. Manual names/
units/quantities are not normalized by classification. Core engines unchanged.

Legacy files supplied after initial inspection match the sibling evidence byte-for-
byte; hashes in ignored runtime/import_classification/legacy_evidence_hashes.json.
Read legacy report/prompt/rules/ingestion/provider validation/confirmation schema and
tests. Reused concepts: distinct date/unit meanings, index-safe proposals, mandatory
review. Rejected legacy facts as authority: nine legacy schemas, shared owner key,
mutable confirmed flag, API/persistence/partial engine, confidence1 for manual mapping.

Test scope: all Import boundary regressions because typed mapping/preview shape and
proposal lifecycle changed; new unit provider/descriptors + real PG HTTP confirmation/
reuse/type/ignore/permission/failure/race. No source engine/S1/S2/schema change, so no
solver/ML benchmark or full-suite gate. After fixes, only affected groups rerun.
Only disposable local shelfcash_test (SELECT current_database exact guard before
fixtures), PG17.11; Docker Compose healthy, no development DB connection or migration.

### Exact executed pytest commands / results (2026-10-10)

All below use `.venv/Scripts/python.exe`; counts overlap and must not be summed.

```text
-m pytest tests/unit/test_import_preview.py tests/unit/test_import_parser.py tests/api/test_import_openapi.py -q --tb=short
  36 passed, 1.55s (initial source delta)
-m pytest tests/unit/test_import_classification.py tests/unit/test_import_preview.py -q --tb=short
  37 passed, 0.37s (unit file later renamed)
-m pytest tests/integration/test_import_staging.py::test_preview_fresh_session_and_no_canonical_write -q --tb=short
  collection failed: node does not exist; no tests executed, not PASS
-m pytest tests/integration/test_import_staging.py::test_sales_staging_owner_approval_preview_and_fresh_sessions tests/integration/test_import_staging.py::test_approved_structure_reuse_without_reapproval -q --tb=short
  2 passed, 5.52s
-m pytest tests/integration/test_import_classification.py -q --tb=short
  3 failed / 2 passed, 10.37s: test helper wrongly expected mapping_revision in I04; use M01 canonical source
-m pytest tests/integration/test_import_classification.py -k 'manual_correction or change_type or confirmation_stale' -q --tb=short
  2 failed / 1 passed, 7.71s: clean sheets omitted by default and helper refetch after revoke; explicit include_clean_sheets and captured revision
-m pytest tests/integration/test_import_classification.py -k 'manual_correction or confirmation_stale' -q --tb=short
  1 failed / 1 passed, 5.77s: inactive membership canonical404, not403
-m pytest tests/integration/test_import_classification.py::test_confirmation_stale_wrong_digest_and_current_revoke -q --tb=short
  1 passed, 3.21s after exact RESOURCE_NOT_FOUND assertion
-m pytest tests/integration/test_import_classification.py -k 'multifile or concurrent' -q --tb=short
  1 failed / 1 passed, 5.45s: physical unnamed sheet hit canonical-name nonblank validator
-m pytest tests/integration/test_import_classification.py::test_multifile_multisheet_indexed_review_and_explicit_ignores -q --tb=short
  1 failed, 3.39s after allowing physical empty name: same-type selection cleared explicit IGNORE
-m pytest tests/integration/test_import_classification.py::test_multifile_multisheet_indexed_review_and_explicit_ignores -q --tb=short
  1 passed, 3.67s after preserving acknowledged column ignore
-m pytest tests/integration/test_import_staging.py tests/integration/test_import_classification.py tests/unit/test_import_classification.py tests/unit/test_import_suggestions.py tests/unit/test_import_preview.py tests/unit/test_import_parser.py tests/api/test_import_openapi.py -q --tb=short
  collection ERROR: same basename unit/integration (not a gate PASS); renamed only new unit file to test_import_schema_suggestions.py
-m pytest tests/integration/test_import_staging.py tests/integration/test_import_classification.py tests/unit/test_import_schema_suggestions.py tests/unit/test_import_suggestions.py tests/unit/test_import_preview.py tests/unit/test_import_parser.py tests/api/test_import_openapi.py -q --tb=short
  90 passed / 1 failed, 68.86s: same-type selection discarded an existing unresolved Product issue
-m pytest tests/integration/test_import_staging.py::test_owner_reserved_product_dependency_and_no_bootstrap_writes tests/integration/test_import_classification.py -q --tb=short
  8 passed, 16.03s after retaining compatible issues and proposal facts
-m pytest tests/integration/test_import_classification.py::test_staff_confirmation_checks_current_write_scope_and_retry_without_owner_approval tests/unit/test_import_schema_suggestions.py tests/unit/test_import_suggestions.py -q --tb=short
  19 passed, 3.40s
-m pytest tests/api/test_import_openapi.py tests/integration/test_import_classification.py::test_manual_correction_owner_profile_then_reuse_still_needs_own_confirmation -q --tb=short
  2 passed, 3.99s after exact200 vs202 typed OpenAPI/transport response split
-m pytest tests/integration/test_import_classification.py -k 'persistence_failure or valid_qwen' -q --tb=short
  1 failed / 1 passed, 5.38s: shared HTTP middleware sanitizes injected ValueError, test incorrectly expected propagation
-m pytest tests/integration/test_import_classification.py::test_review_persistence_failure_rolls_back_confirmation_and_audit -q --tb=short
  1 failed, 3.31s: exact existing SERVICE_UNAVAILABLE503, not guessed500
-m pytest tests/integration/test_import_classification.py::test_review_persistence_failure_rolls_back_confirmation_and_audit -q --tb=short
  1 passed, 3.21s with exact503/data=null and fresh rollback assertions
-m pytest tests/unit/test_import_schema_suggestions.py tests/api/test_import_openapi.py tests/integration/test_import_classification.py -q --tb=short
  32 passed, 24.89s after strict boolean confirmation/versioned envelope
-m pytest tests/integration/test_import_classification.py::test_direct_reused_column_edit_forks_proposal_and_preserves_approved_context tests/integration/test_import_classification.py::test_multifile_multisheet_indexed_review_and_explicit_ignores tests/integration/test_import_staging.py::test_context_semantics_edit_is_proposal_and_keeps_active_version tests/integration/test_import_staging.py::test_source_context_change_invalidates_usage_without_mutating_evidence -q --tb=short
  4 passed, 9.10s after retained ignore evidence and direct reused-column correction support
-m pytest tests/integration/test_import_classification.py::test_approved_memory_does_not_cross_store_or_auto_accept_structure_drift -q --tb=short
  1 passed, 2.93s
```

No unfinished/interrupted process treated as PASS; all listed completed exit codes
observed. Failures above resolved within import/task tests, not weakened business
gates. Three existing Pydantic schema-name warnings and AnyIO deprecation remain
nonfatal. Old S44_TASK_NOTES results are historical, not this task's measurements.

### Assertions actually proved

Fresh PG Sessions: manual-correction immutable profile origin/confidence, one version
across same-Store reuse with provider forbidden, independent confirmation per import,
exact audit/receipt/hash equality, no SalesDaily/canonical inserts; old profile and
preview immutable after type/column edits; current Staff grant revoke blocks retry;
same-key concurrent confirmation produces one audit, new preview requires review;
failure after real flush rolls back pointer/audit, HTTP error not fake success.
Multi-file/two XLSX sheets + CSV includes unnamed/misleading names/duplicate headers,
explicit per-column and whole-sheet ignore with retained acknowledgment/warnings.
Cross-Store identical structure does not reuse; changed structure never auto-binds.
Old Import PG regressions cover ambiguous contexts/current revoke/Owner CAS, real
RR/read-only snapshots, detached capture/zero pooled connections during computation,
process claim/recovery/failed jobs/retired pins/CAS/source seal/no canonical writes.

Offline adapter: exact index set/target scope/duplicate/extra fields/nonfinite output
rejected wholly, truncated/oversize/timeout/no-key/deadline preserve manual flow,
fixed model/temperature/reasoning/strict JSON payload, no catalog/actor/session in
allowlisted bounded payload. Mock transport is not live OpenRouter evidence or
semantic mapping accuracy. Source DTO requiredness parity covers all current schemas;
high confidence with missing required fields cannot build approved-ready spec.

### Remaining limits / next boundary

No live provider, real customer workbooks, FE/browser/load/security certification.
Provider DNS/OS scheduling not hard real-time; input96KB/32-column optional cap means
wide files remain manual (parser limit256); first physical row remains header.
No separate HTTP Qwen-remap action; adapter supports selected-schema constraint,
manual type/correction flow remains public. No new schema/universal/mixed-table engine.
Review does not resolve future sales/supplier correction confirmations automatically.
Operational data can change after review; S4.5 must reauthorize/recheck exact retained
confirmation and read-set at atomic commit. S4.5 not started, commit409 unchanged.
No commit/stage/push/deploy/new archive. Baseline preservation/OpenAPI/UTF8 checks
and final artifact hashes recorded separately below after execution.

### Final mechanical checks (executed)

`.venv/Scripts/python.exe runtime/import_classification/final_checks.py` exited0.
SHA256 compared all470 baseline files:16 changed files all inside authorized Import
scope; no unexpected change/deletion. All19 baseline ZIPs and the two newly supplied
legacy evidence files preserved byte-for-byte. HEAD remains
`a4b68378f35fea6f71b549e24393cf4bbb35aba5`, index remains empty.
`git diff --check` PASS; UTF8/replacement-character/AST and129 local documentation
links PASS. This is mechanical evidence, not another pytest run.

Final generated OpenAPI:31 existing paths and all operation IDs retained. Only I05
operation definition changed (additional200 confirmation response/request variant);
six added/eight changed Import schema components, none removed. All pre-Import
foundation schema components unchanged. Generation did not start app lifespan,
worker or connect to a database. JSON evidence under ignored
`runtime/import_classification/final_checks.json` and `openapi_diff.json`.

OpenRouter API/model are fixed for mapping; its upstream inference vendor routing
is not pinned. This clarification is documentation only, no extra provider call.
