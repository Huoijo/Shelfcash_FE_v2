# Import batch mechanics — S4.4 extension, 10/10/2026

## Scope/contract frozen before edits

Explicit user authorization: authoritative Import docs + additive I04 quota +
targeted guarded verification. Multi-call accepted-logical-record accounting,
ordered per-file partial acceptance and evidence/receipt-set file_set_version
approved; numeric20 files/20MiB perfile/100MiB acceptedsource unchanged. No path,
DELETE, admission-policy change, canonical writer, migration or S4.5/S4.6.

Read AGENTS authority order, current status/decisions/architecture/API/domain/schema/
roadmap, Auth v1, ADR004/007/008/009/010/013, Import/response/S44 and classification/
shared-value notes. Preserve accepted ADRs, engine, unrelated Auth/Staff/Import WIP
and all ZIPs. Baseline status/protected hashes/OpenAPI in ignored
runtime/import_batch_mechanics; offline schema generated without .env/DB/network.
Rollback only declared DTO/read projection/new tests/current docs; never whole-tree
reset/clean/restore. No new storage or migration required.

Technical choice: required quota object on I04 with accepted_file_count,
accepted_total_bytes, remaining_file_slots, remaining_bytes integer fields; derive
from all uploaded records loaded for file_count/source_set, independent pagination.
Read locks refreshed batch after existing current authorization lock order; prevents
pre-authorization stale ORM metadata versus newly read files. No batch/canonical
writes, parser/worker/LLM in GET. Projection/Store permissions stay current.

Tests first: real HTTP + PostgreSQL for multi-call/orderedpartial/bytes/dedup/replay/
pagination/parse-failed/rights and actual lock races/read coherence. Authenticated
synthetic fixtures reuse guarded existing shelfcash_test fixture; PG pytest processes
sequential. Exact local test URL guard before connection, current_database checked;
no development DB. No live provider calls; new tests forbid the suggestion gateway.
OpenAPI old operations/components preserved except ImportRead quota addition.
Run new targeted gate then existing affected Import HTTP/OpenAPI groups; broaden
only on a new failure/gap, no full suite by default. Record commands/results/fail→fix.

## Verification

CURRENT FACT — completed targeted verification, 10/10/2026. This extension is
complete within authorized S4.4 staging/read scope; canonical commit/receipt writers
are not implemented here. These are separate overlapping gates, not a full-suite
count or production acceptance.

### Commands and results

PowerShell setup for successful pytest gates:

```powershell
$env:PYTHONDONTWRITEBYTECODE = '1'
$env:IMPORT_WORKER_ENABLED = 'false'
.\.venv\Scripts\python.exe -m pytest tests/integration/test_import_batch_mechanics.py tests/api/test_import_openapi.py -q --tb=short --maxfail=2
.\.venv\Scripts\python.exe -m pytest tests/integration/test_import_staging.py tests/integration/test_import_classification.py tests/integration/test_import_field_value_bindings.py tests/api/test_import_openapi.py -q --tb=short --maxfail=2
```

- New gate: **13 passed, 4 warnings, 22.33s**. Actual PostgreSQL 17.11
  `shelfcash_test`, HTTP uploads/GET and fresh committed-state Sessions; actual
  two-session locking/race tests for count/bytes and upload/seal. These concurrency
  tests use application calls against real PG, not a mocked DB or production load.
- Affected existing callers: **48 passed, 4 warnings, 106.44s**. Staging permissions/
  Store isolation, sealed retry, classification and shared field-value branches,
  preview/confirmation invalidation and current OpenAPI. The OpenAPI test overlaps
  the first gate; do not sum 13 + 48 into a regression/full-suite total.
- Warnings: existing Pydantic `schema` shadowing (three) and AnyIO deprecation (one).
  No full suite, browser tests, production latency/memory/load tests, development
  database access, solver or live OpenRouter calls.

Guard before DB verification: standalone Python checked `make_url` against exact
local `shelfcash_test` target, `validate_reset_target(environment="test")`, then
`SELECT current_database(), version()` on that target. Confirmed PostgreSQL17.11.
Existing integration fixture alone recreates/migrates the guarded test DB; no new
migration authored and no development DB migration/reset. PG pytest gates ran
sequentially, no concurrent test runner sharing the DB. Workers disabled globally;
existing tests explicitly exercise workers only where required. New quota tests
forbid provider suggestion hooks; existing provider tests use mocks. Real provider
availability is outside evidence.

### Fail → fix evidence

1. Initial `python -m pytest tests/integration/test_import_batch_mechanics.py -q
   --tb=short --maxfail=2`: **2 setup errors, 1.30s**. Test guard used nonexistent
   `suggest_headers`; corrected to real `suggest_sheet`. This was fixture error,
   not runtime behavior.
2. Same command with workers disabled: **2 failed, 3.77s**, reproducing missing
   `data.quota` before implementation. Added typed ImportQuota and whole-batch
   uploaded-record projection on both I04 branches.
3. `python -m pytest tests/integration/test_import_batch_mechanics.py::test_reader_refreshes_batch_metadata_after_upload_during_authorization
   -q --tb=short`: **1 failed, 2.61s** before read fix. Cached batch revision was old
   while newly loaded files reflected a concurrent committed upload.
   Read now authorizes first in established User/session/Store order, refreshes and
   locks batch, then performs current sensitivity authorization; revisions/source
   set/count/quota are coherent. Existing rights/pagination semantics preserved.
4. Both successful gates above cover fixes; no unresolved failing targeted test.

### Test evidence and limits

`tests/integration/test_import_batch_mechanics.py` covers:

- `test_multicall_8_7_6_accepts_five_and_rejects_one`;
- `test_18_two_valid_one_invalid_and_required_rejected_ack`;
- `test_byte_boundary_and_later_small_file_fits` (99MiB + 1MiB/1MiB, and skip a
  non-fitting 2MiB file then accept later 1MiB);
- `test_dedup_replays_rejected_pagination_and_parse_failed_accounting` (two logical
  records, one blob; same-key replay and new-key client-ID replay; paginated quota);
- `test_request_guards_and_conflicts_rollback_all_items`;
- `test_concurrent_i02_cannot_exceed_count_or_bytes` (two real PG sessions);
- `test_upload_analyze_race_fenced_at_actual_database_batch_lock` (both winners);
- `test_reader_refreshes_batch_metadata_after_upload_during_authorization`;
- `test_quota_read_has_current_rights_store_isolation_and_no_import_writes`.

Accepted record count/bytes include parse-failed uploaded files, exclude rejected,
use actual raw source size, and count duplicate-content logical files separately.
No expanded XLSX parser-limit certification added. GET tests forbid parser/worker/
preview computation, and compare Import/job/receipt/audit state before/after; Auth
session activity retains existing policy. Foreign Store/revocation behavior also
covered by the successful existing staging gate.

### Offline OpenAPI and documentation checks

Offline generation used `Settings(_env_file=None)`, provider unset, workers off;
`Engine.connect`, `Engine.raw_connection` and socket connects guarded to fail. No
lifespan run or DB/network call. Artifacts (ignored, not handoff ZIP):

- `runtime/import_batch_mechanics/openapi_before.json`;
- `runtime/import_batch_mechanics/openapi_after.json`;
- `runtime/import_batch_mechanics/openapi_diff.json`.

Compared every path/operation: unchanged. New component only `ImportQuota`; existing
component change only required `ImportRead.quota` reference. Removing that property
and required entry reproduces the old ImportRead schema exactly. No tracked generated
OpenAPI artifact required by this repository.

All six JSON examples in IMPORT_BATCH_MECHANICS_RESPONSE_VI.md validate against
current Pydantic DTOs. Checked 162 relative file/anchor links across the seven edited
docs, no missing links; UTF-8 replacement-character check and Python AST checks pass.
Protected-hash comparison: all **465** baseline files unchanged, including unrelated
source/tests/migrations/accepted ADRs/task notes and old ZIPs. Git whitespace check
is scoped to authorized edits; historical unrelated WIP is not a clean-tree claim.

### Remaining gaps / next step

No unresolved product choice for these approved mechanics. Existing I02 OpenAPI422
schema documents UploadFailure while generic request-validation422 can return the
Auth ErrorEnvelope; FE checks error.code/details. That drift is documented, not
silently changed in this additive quota slice. No remove/replace/quota-release route;
IGNORE does not release quota. Canonical import commit and opening/receipt writer
integration remain S4.5/S4.6 PLANNED and require separate authorization. No next
slice started; no stage/commit/push/ZIP.
