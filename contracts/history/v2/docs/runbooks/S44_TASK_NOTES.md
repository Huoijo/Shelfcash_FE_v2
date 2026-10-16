# S4.4 — staging/parser, mapping approval/reuse and preview

## Resumption audit — 2026-10-10

FINAL CURRENT FACT: COMPLETE authorized S4.4 staging/preview scope; whole Import
cluster is not COMPLETE. No open failing check in selected coverage. No full suite
claim; broader regression failures below corrected and only affected groups rerun.

Final completed commands (same Python prefix; overlapping scope):

- `-m pytest tests/integration/test_import_staging.py::test_capability_hints_use_current_permissions_and_actual_state tests/integration/test_import_staging.py::test_retired_version_blocks_new_preview_but_retained_result_is_readable tests/integration/test_import_staging.py::test_parser_failure_retains_location_and_retry_is_explicit tests/integration/test_import_staging.py::test_recipe_count_term_fee_and_declarations_are_retained_not_canonical -q --tb=short`
  →4 passed12.31s after allowed_actions/can_preview use current grants/state;
  reader-only actor gets no mutation hints, empty draft no analyze hint, retired
  binding not offered preview, explicit failed analysis retry remains possible.

- `-m pytest tests/integration/test_forecast_decision_persistence.py::test_fresh_migration_exact_tables_and_downgrade tests/integration/test_verification_commands.py tests/api/test_health.py tests/api/test_auth_openapi.py -q --tb=short`
  →6 passed/1 failed15.32s; health path assertion still preceded new inventory.
- `-m pytest tests/api/test_health.py::test_only_intended_routes_exist -q --tb=short`
  →1 passed1.50s after placement corrected; exact route equality retained.
- `-m pytest tests/integration/test_import_staging.py tests/unit/test_import_preview.py tests/unit/test_import_suggestions.py tests/unit/test_import_parser.py tests/api/test_import_openapi.py -q --tb=short`
  →61 passed54.25s after formatting; includes new receipt/semantic revision cases.
- `-m pytest tests/api/test_import_openapi.py -q --tb=short`
  →1 passed1.24s after adding documented ETag headers to new operation specs.
- `-m pytest tests/unit/test_import_preview.py tests/integration/test_import_staging.py::test_recipe_count_term_fee_and_declarations_are_retained_not_canonical tests/integration/test_import_staging.py::test_owner_reserved_product_dependency_and_no_bootstrap_writes tests/integration/test_import_staging.py::test_bounded_worker_drains_durable_job_and_get_only_reads -q --tb=short`
  →21 passed/1 failed11.34s. Worker test's own polling Session raced global pool-zero
  assertion; production parser did not own that Session. Synchronize test with Event
  before opening polling connection; preserve pool-zero assertion, not weakened.
- `-m pytest tests/integration/test_import_staging.py::test_bounded_worker_drains_durable_job_and_get_only_reads -q --tb=short`
  →1 passed2.72s; actual thread drains one accepted job, GET never calls parser.
- `-m pytest tests/unit/test_import_preview.py tests/integration/test_import_staging.py::test_owner_reserved_product_dependency_and_no_bootstrap_writes -q --tb=short`
  →21 passed3.27s after numeric-equivalent catalog metadata comparison correction.
- `-m pytest tests/unit/test_import_preview.py tests/integration/test_import_staging.py::test_approved_structure_reuse_without_reapproval tests/integration/test_import_staging.py::test_context_semantics_edit_is_proposal_and_keeps_active_version tests/integration/test_import_staging.py::test_owner_reserved_product_dependency_and_no_bootstrap_writes -q --tb=short`
  →24 passed7.99s. Incomplete inherited proposal preserves approved base rules,
  omitted optional expiry/amendment rules retained; no live rule/default inference.
- `-m pytest tests/integration/test_import_staging.py::test_owner_decision_compare_and_swap_race_is_atomic -q --tb=short`
  →1 passed3.11s. Two distinct-key Owner decisions same lifecycle revision: one
  activation, one PROFILE_REVISION_CONFLICT; fresh versions/audit count exactly2
  including earlier activation, no partial version transition.
- `-m pytest tests/integration/test_import_staging.py::test_upload_retry_content_dedup_and_source_set_seal tests/integration/test_import_staging.py::test_all_rejected_upload_has_actionable_error_and_receipt -q --tb=short`
  →2 passed4.33s after byte-hash fingerprint avoids large intermediate hex string.
- `scripts/run_import_jobs.py --test-database --max-jobs 20 --recover`
  →exit0, jobs=[]/recovered=[] on guarded disposable DB; CLI import path corrected.
  Empty queue smoke does not replace actual bounded-thread/PG job tests above.

Additional final-review correctness: reject overlap between two new active staged
terms, not only vs existing DB terms; exact numeric-equivalent recipe yield/loss and
catalog price no false conflict. Three Pydantic warnings for canonical `schema`
field shadowing deprecated BaseModel.schema and existing AnyIO deprecation remain
nonfatal; not a claim dependency/security certification. Mechanical formatting
limited S44-owned files with AST equality, not unrelated WIP rewrite.
Final source compatibility checks: git diff --check, AST format equality and exact
OpenAPI old paths/component preservation. Baseline content-hash comparison shows
23 preexisting files changed, all declared S44/docs/schema-inventory dependencies;
no missing baseline file,18 old ZIPs unchanged, AGENTS/accepted ADRs/engine/ML/auth
and unrelated WIP unchanged against continuation baseline. HEAD/index unchanged.
New S44 files are additional WIP; no stage/commit/ZIP. These checks are not tests
of operational dataset quality, live provider or production security.

User yêu cầu kiểm tra tiến trình, tiếp tục incomplete scope và không tính interrupted
test là PASS. Git status vẫn huge unrelated S3/S4 WIP, HEAD baseline unchanged.
Source inspection: staging/profile/jobs/preview code exists, old current-state
foundation absence wording stale; reclassified historical, not runtime absence.
No process/test từ lượt bị ngắt được assumed completed. No commit/stage/push/ZIP,
development DB, S4.5/canonical writes. Existing before-edit plan/rollback below
continues; remaining acceptance/compatibility/evidence are mandatory before complete.

Selected tests: pure parser/preview/numeric/provider limits; real PG HTTP current
permissions/Store/CAS/receipts/profile lifecycle/dependencies/whole-domain preview;
owned RR snapshot/detachment/claim/death/finalization/fresh-session persistence;
new OpenAPI inventory and exact preexisting path/schema comparison. Related
S4.1–3/schema/migration/S1 writers/health regressions because additive schema and
shared composition changed. No unrelated solver/ML/full suite. Counts overlap.

Environment first attempt: test URL parsed exact local shelfcash_test/no query;
guarded SELECT current_database connection timed out. Docker daemon pipe unavailable.
Combined pytest was allowed through fixture's own guard but all PG setup failed:
29 unit passed,14 setup errors; not PostgreSQL PASS. Started existing Docker Desktop
hidden, `docker compose up -d postgres` using existing named volume (no delete/reset),
then explicit SELECT current_database()==shelfcash_test confirmed PASS. No connection
to development DB. All subsequent PG processes sequential; fixtures own/reset test DB.

Correctness fixes from actual new tests/review:

- Optional integer annotations were detected with substring matching, incorrectly
  treating non-null StrictInt shelf_life_days as text. Replaced with recursive actual
  typing introspection; repeating/optional decimals remain strings/exact.
- Recipe quantity unit resolution incorrectly referenced Product when product_id
  appeared before ingredient_id; resolve against Ingredient. Duplicate-column check
  now excludes identity/conversion issues sharing the same target (not column binds).
- I04 configurations shadowed import ID with configuration ID, final scope recheck
  returned404; separate names, same preview paging/hash and current scope fence.
- Source context selection used scope only and could ignore declared changed
  semantics; compare declared policy against approved spec, create proposal/reapprove,
  fork different scope, retain old active version/preview. Validate variant issue type.
- Recovery uses same authority/Store→batch→job lock order, fenced fresh transitions;
  parser failure retains locations/file failed parse status; completed programming
  bug never becomes success or FAILED. Cleanup/failure recording preserve primary.
- Structured UPLOAD_REJECTED/per-item errors/immutable receipt; full bounded file
  size/hash instead of truncated prefix. Malformed transport gets sanitized envelope.
- Relevant-only read-set capture, explicit declaration subtype permission scope;
  GET configurations before preview projects stored analysis, never normalization.
- Reviewed future SupplierTerm period amendment/expiry rule represented explicitly;
  no implicit overlap closure/retroactive rewrite/canonical mutations. No source-key
  registry claimed. Provider redirects prohibited; no raw rows sent/live provider test.

Test-only mistakes corrected: immutable version no-op was not a mutation; SQL bind
literal replaced jsonb_build_object; Store membership loss403 expectation corrected
to scope-safe404 while revoked mapping.read grant retains403 assertion; accidental
test-body tail placement corrected and migration full roundtrip rerun. No business
expected values weakened. Existing inventory tests expanded exactly for10 new tables/
11 routes/head0013; seed verifier allowlist expanded, still writes no business seeds.

### Commands completed during resumption (Python prefix `.venv/Scripts/python.exe`)

- `-m pytest tests/integration/test_import_staging.py tests/unit/test_import_preview.py tests/unit/test_import_parser.py -q --tb=short`
  →29 passed,14 setup errors,11.28s (Docker unavailable; not PG verification).
- `-m pytest tests/integration/test_import_staging.py -q --tb=short`
  →14 passed,27.46s after guarded Docker readiness (initial coverage).
- `-m pytest tests/unit/test_import_preview.py tests/unit/test_import_suggestions.py -q --tb=short`
  →1 failed/18 passed, then19 passed0.21s after StrictInt annotation correction.
- `-m pytest tests/integration/test_import_staging.py -q --tb=short`
  →1 failed/16 passed32.83s (recipe unit/duplicate issue); then cross-domain test
  alone failed twice (I04 configurations404), finally passed6.06s after shadow fix.
- `-m pytest tests/integration/test_import_staging.py -q --tb=short`
  →1 failed/22 passed43.51s (test expected403 for membership-scope loss).
- `-m pytest tests/integration/test_import_staging.py::test_staff_proposes_context_owner_only_approval_and_current_revoke tests/integration/test_import_staging.py::test_owner_reserved_product_dependency_and_no_bootstrap_writes tests/integration/test_import_staging.py::test_migration_roundtrip_preserves_canonical_rows -q --tb=short`
  →3 passed6.60s after explicit grant-revoke403 + membership-loss404 assertions.
- `-m pytest tests/integration/test_import_staging.py tests/unit/test_import_preview.py tests/unit/test_import_suggestions.py tests/unit/test_import_parser.py tests/api/test_import_openapi.py -q --tb=short`
  →59 passed49.70s. Targeted scope, not full regression.
- `-m pytest tests/integration/test_import_staging.py::test_uncertain_acceptance_is_error_then_retry_reads_durable_receipt tests/integration/test_import_staging.py::test_context_semantics_edit_is_proposal_and_keeps_active_version tests/integration/test_import_staging.py::test_recipe_count_term_fee_and_declarations_are_retained_not_canonical tests/integration/test_import_staging.py::test_staff_proposes_context_owner_only_approval_and_current_revoke -q --tb=short`
  →3 passed/1 failed10.91s (test-body accidental migration tail, NameError).
- `-m pytest tests/integration/test_import_staging.py::test_context_semantics_edit_is_proposal_and_keeps_active_version tests/integration/test_import_staging.py::test_migration_roundtrip_preserves_canonical_rows -q --tb=short`
  →2 passed4.15s after test-body correction; true full downgrade0012→upgradehead.
- `-m pytest tests/integration/test_auth_public.py tests/integration/test_staff_public.py tests/integration/test_public_reads.py tests/integration/test_cursor_signing.py tests/integration/test_identity_store_schema.py tests/integration/test_catalog_recipe_schema.py tests/integration/test_data_semantics_correction.py tests/integration/test_supplier_operational_constraints.py tests/integration/test_forecast_decision_persistence.py tests/integration/test_database_bootstrap.py tests/integration/test_verification_commands.py tests/api/test_health.py tests/api/test_auth_openapi.py tests/api/test_staff_openapi.py tests/api/test_public_reads_openapi.py tests/unit/test_auth_cleanup.py tests/unit/test_cursor_signer.py -q --tb=short`
  →307 passed/5 failed341.37s. Failures: stale exact table count/import_jobs absence,
  seed schema allowlist and exact HTTP inventory. All old API/schema invariants
  retained; inventories extended for authorized additions, not ignored/subset asserts.
- `-m pytest tests/integration/test_verification_commands.py::test_seed_and_status_verify_fresh_persisted_baseline -q --tb=short`
  →1 failed2.18s reproduces stale script seed verifier; corrected actual allowlist.
- Inline OpenAPI diff vs runtime/s44_completion/openapi_before.json →20 old paths
  and all old component schemas EXACTLY unchanged,31 paths now,11 additions.
  Snapshot retained ignored runtime; test_import_openapi independently checks route/
  ID/status/variant/can_commit=false. No DB involved in this check.

Fresh-session evidence: scoped blob/file/receipt/batch/profile/context/audit/jobs/
preview persisted; canonical Sales/Recipe/Term/Movement untouched and lot balance12
after count preview10; Product reservation exists only retained preview. RR actual
second connection writes77 between Product and Sales queries, captured Sales remains
empty/read-only and pool checkedout0. Concurrent same-key acceptance one aggregate,
two executor instances one claim/completion. Real child process exit proves DEAD
recovery; live process not reclaimed. Injected ValueError after real durable completion
raises to caller and persisted completed remains. Injected failure-recording OSError
adds note, preserves primary ValueError/running outcome. Injected SQLAlchemy
OperationalError wrapping psycopg.OperationalError after real acceptance commit
raises error, retry reads existing receipt; not physical network loss certification.

Limits: no live LLM/browser/production concurrency/load/backup/DR/SLA/security
certification. Maximum parser bounds not load benchmark. Numeric serial Excel dates
not inferred; explicit supported date text required. Whole Import cluster is not
complete: commit/I06/history/readiness/configuration canonical writers remain future.

## Completion continuation - frozen scope before edits

User explicitly approved M04 source_context variant, proposal-level stable
Store codes, Owner approval, reuse and ambiguity/conflict handling. Earlier
pending question is resolved; historical PARTIAL evidence below remains slice-time.
Baseline for continuation saved in runtime/s44_completion: status, file hashes,
OpenAPI; preserve existing WIP/archives. No staging, commit, push or ZIP.

Implementation plan: additive staging tables with immutable bytes/profile versions/
previews, scoped receipts/audit and fenced durable jobs; typed requests/projections;
strict source-context proposal; manual and deterministic reuse; parsing/normalizing
outside held transactions; bounded explicit local executor with fresh reauthorization.
Pin coherent operational read-set for full-domain preview; never canonical writes.
Acceptance: real PostgreSQL/HTTP scope/CAS/idempotency/Owner/current revoke;
source integrity and immutability; profile reuse/ambiguity/retirement; lexical/parser
and preview semantics, stale read-set and job fencing/recovery; fresh-session proof;
OpenAPI preservation and affected auth/schema/writer regressions. PG sequential,
only exact guarded shelfcash_test. No broad suite unless targeted gaps require it.
Rollback limited to new S44 storage/modules/routes/tests and declared contract/docs;
remove new migration only on disposable test DB. Never restore unrelated WIP.
BE/FE import workflow affected; ML/decision/forecast/lifecycle remain unchanged.

## Frozen plan before implementation

Authority: explicit S44 attachment; AGENTS ordered CURRENT_STATE/DECISIONS/ADRs/
ARCHITECTURE/API/DOMAIN/SCHEMA/ROADMAP; handoff v1, Import sections4–13/14.5,
current AUTH catalogue and S41/S42/S43 evidence. Relevant accepted ADR004/007/
008/009/010/013 remain unchanged. FE0 is historical, not runtime authority.

Baseline: branch feat/from_forecast_to_decision_run, HEAD
a4b68378f35fea6f71b549e24393cf4bbb35aba5;456 pre-edit files and18 archives hashed,
status/OpenAPI saved under ignored runtime/s44. Preserve all unrelated WIP,
credentials, archives, engine logic and retained Runs. No staging/commit/push/
deploy/ZIP, no development DB access or S4.5 canonical writes.

First verify S4.1 T01 and S4.2 list cursor signatures and all scope bindings with
client-held token. If reproduced, negative tests first then reuse existing private
key/MAC primitive for only affected lists; preserve routes/DTOs/status semantics.
Authority independently checked, forged cursor must never grant Store/action access.

S4.4 target: I01–I04/M01–M04/N5/I05 preview/J01, durable immutable bytes/analysis/
profiles/proposals/preview/jobs, full current Store permissions, CAS/idempotency,
Owner-only mapping decision, bounded local execution outside DB transactions and
retained typed results. CSV/XLSX bounds and physical cell provenance, deterministic
approved mapping reuse, unknown facts/manual review, no LLM-created canonical truth.
Commit/history/readiness capabilities must explicitly distinguish unwired phases.
No operational entity, stock movement, SupplierTerm, fee/completeness or Run writes.

Contract gap under clarification: source_system_key/report_type are mandatory
profile scope, yet I01/I03 have no declaration and current M04 variants have no
source-context resolution. Requested user decision asynchronously before adding
public fields/variants. Do not infer scope from filename or silently change wire.
Proceed with independent cursor verification and file/parser foundations meanwhile.

Verification selection: real guarded shelfcash_test only, PG processes sequential;
cursor paging/auth regressions; pure parser limits/CSV locations/XLSX cached formula
and no execution; staging HTTP/idempotency/scope/current revoke; profile activation/
CAS/audit; exact preview/classification/read-set/no canonical writes; job claim/
fencing/recovery and fresh-session retained results. OpenAPI diff preserves current
20 business operations; targeted schema/writers and S4.1–S4.3 callers. No full
suite/ML/solver benchmarks without new evidence. Document commands/fail-fix/limits.

Rollback scope: new S44 modules/migration/composition/tests/docs plus reproduced
cursor defect; no reset/checkout of existing WIP. Migration exercised only on exact
local shelfcash_test; storage uses test-only directories, no deletion of real files.
BE staging/FE review affected; ML/business computation unchanged. Stop after S4.4;
mark PARTIAL/BLOCKED if necessary acceptance cannot be completed, never fake COMPLETE.

## HISTORICAL INFORMATION — foundation PARTIAL, before clarification

Required user question remains pending: M04 source_context resolution vs context
strictly in files. Because adding a resolution changes handed-off wire behavior,
no new variant or Import HTTP has been implemented without that decision. Independent
cursor hardening and parser source-value foundation completed; no canonical writes,
staging migration, profile, preview or jobs claimed ready.

Cursor finding reproduced with actual HTTP/PostgreSQL: decode issued cursor, change
offset from1 to2, re-encode and sign HMAC-SHA256 with caller's own raw cookie token.
Both T01 and N12 accepted200 before patch. Binding existing actor/list/permissions
did not make client-held signing key private. No cross-Store escalation observed:
normal authorization precedes list paging. Shared CursorSigner now uses random
private process key, domain + session + payload; signature verification remains
constant-time. Existing source/filter/order/limit/authorization bindings retained.
Auth/Staff use Auth-owned key, PublicReads an owned signer using same primitive.
No persistence/credential/session permission policy or wire schema change.

Guard: parsed Settings.test_database_url; exact local shelfcash_test, no URL query
override; test Settings + validate_reset_target; SELECT current_database() confirmed.
No credentials printed or development DB connection. PG pytest processes sequential.

Exact commands (`.venv/Scripts/python.exe` prefix), results:

- `-m pytest tests/integration/test_cursor_signing.py -q --tb=short`
  —2 failed (2.99s), expected negative tests reproduce pre-patch200 instead of422.
- `-m pytest tests/integration/test_cursor_signing.py tests/integration/test_auth_public.py::test_no_stores_multiple_stores_cursor_and_current_revocation tests/integration/test_public_reads.py::test_client_session_token_cannot_sign_cursor_and_restart_refresh -q --tb=short`
  —4 passed (5.55s) after fix.
- `-m pytest tests/integration/test_staff_public.py::test_owner_invitation_paging_tamper_snapshot_and_audit tests/integration/test_cursor_signing.py tests/api/test_auth_openapi.py tests/api/test_staff_openapi.py -q --tb=short`
  —5 passed (4.42s).
- `-m pytest tests/unit/test_import_parser.py -q --tb=short`
  —13 passed (0.05s): CSV multiline physical locations/BOM/zero vs empty/frozen
  containers; XLSX exact lexical long decimal/cached value not formula result;
  absent cache, traversal/macros/DTD UTF8+UTF16/external relationship, limits and
  malformed input fail with sanitized source codes.
- `-m pytest tests/integration/test_cursor_signing.py tests/unit/test_cursor_signer.py tests/integration/test_auth_public.py::test_no_stores_multiple_stores_cursor_and_current_revocation tests/integration/test_staff_public.py::test_owner_invitation_paging_tamper_snapshot_and_audit tests/integration/test_public_reads.py -q --tb=short`
  —25 passed (31.79s): valid paging, forged cursor rejected, current revoke/list
  version, filter/limit/session binding, foreign Store404,20 S4.3 PG/HTTP cases
  and private-key domain separation. Counts overlap, not full regression.

Chosen coverage: only changed cursor callers/paging/public-read boundaries, OpenAPI
and standalone parser. No schema change or broad infrastructure rewrite. No full
suite/solver/ML benchmark, live provider calls, Import HTTP or near-limit memory
benchmark. Parser no DB/network/filesystem accesses; source formats preserved as
lexical facts, not normalized business truth. No durable upload/job/profile/preview
acceptance yet. Details/limitations in IMPORT_STAGING_PREVIEW feature.

OpenAPI comparison before/after is exactly equal structured JSON (all20 business
operations and health, schemas, headers unchanged). Baseline456 files/18 archives
preserved except the declared four cursor files and documentation changes. No
accepted ADR/FE original/engine/model/retained Run, .env or AGENTS change. No commit,
stage/push/deploy/ZIP or S4.5. Final hash/diff/link checks recorded below.

Final parser check: missing XLSX shared-string index now produces structured
MALFORMED_WORKBOOK with physical location, rather than an unhandled TypeError.
Added independent malformed-cell fixture; reran only the affected parser group:
`.venv/Scripts/python.exe -m pytest tests/unit/test_import_parser.py -q --tb=short`
—14 passed (0.09s). Five new Python files formatted with Black and AST equivalence
checked; existing WIP was not bulk formatted.

Final checks: whole OpenAPI structured equality PASS; local documentation links
PASS; `git diff --check` PASS (existing main.py LF/CRLF warning only). Baseline hash
comparison identifies exactly four cursor modules and six existing documentation
files changed this turn; all18 archives unchanged, HEAD/branch unchanged. Initial
inline verification script used nonexistent app.core.config and failed before its
checks; corrected import app.config and reran successfully. This was a verification
script error, not an application/test failure. No staged changes were introduced.
