# S4.11 integration checkpoint

## Authorization / frozen scope

CURRENT FACT: task resumes on `feat/from_forecast_to_decision_run`, HEAD
`a4b68378f35fea6f71b549e24393cf4bbb35aba5`; index empty. Existing S4.7–S4.10
source/tests/migrations/docs are WIP and are preserved outside documented S411
contract synchronization and two targeted History integration fixes. Baseline ZIP SHA-256:
`238959dd16307ebd691834d2a679f7f80134495bbe99c56f29f7835f39bab6fd`.
Private `runtime/s411/resume_baseline.json` records 653 files and 28 archives.

Read authority in AGENTS order, accepted ADR-007/013/022, six authoritative
contracts, compatibility changelog and S4.7–S4.10 notes. Newly supplied root
`ShelfCash-Staging-Environment-Test-Tooling-Contract-v0.md` found and read.
Roadmap includes cross-cluster and FE browser acceptance; this prompt authorizes
BE/environment/handoff first and requires PARTIAL if browser acceptance is missing.
No FE repository/package.json found under the project parent. No Python/pytest/
backend worker active at observation. Unrelated Codex/Docker processes preserved.

ACCEPTED DECISION: explicit per-Store BASELINE, existing engine/winner/policy;
manual mapping fallback with no provider call; CA-020/019/002/016/021 and conditional
PLAN16 nullability preserved. No LightGBM activation, AI/what-if/order placement,
commit/stage/push/deployment or next slice. New versioned handoff authorized.

## Verification and rollback scope

Guarded read-only `shelfcash_test` inspection actually executed via
`Settings(environment=test, database_url=test_database_url)` and
`validate_reset_target` before `inspect_database`: exit 0, revision/head
`0017_planning_exports`, 61 tables, all business rows zero. No migration/reset run.
Prior completed S4.10 gates remain historical evidence, not new S4.11 PASS.
No interrupted task-owned process found. Initial prompt read had a stdout encoding
failure (UNVERIFIED); repeated with PYTHONIOENCODING=utf-8, exit 0.

Implementation plan: isolated local PostgreSQL/owned runtime; internal CLI reuses
provisioning, operator configuration and Alembic; native supported app/real workers;
versioned five-Product synthetic seed through typed application and HTTP workflows;
real HTTP integration with fresh-session assertions; authoritative wire sync,
OpenAPI/baseline diff and sanitized manifest handoff; relevant automated guard tests.
BE/FE effects: local credentials/cookie/CSRF/CORS/polling and documented consumer
contracts. ML/Data unchanged. Demo dataset explicitly synthetic, never customer data.
Rollback: stop only owned server, retain runtime/DB evidence; new isolated tooling,
docs and archive can be removed individually. Never reset/clean unrelated WIP.

TECHNICAL DEBT: safe Store-only reset is unavailable because retained histories,
receipts, cross-resource dependencies and immutable audit triggers need coordinated
lifecycle. Authorized fallback is an exact guarded disposable integration DB,
after owned server shutdown, no DB clients, and exact Store allowlist verification.
Existing `scripts.dev` test/development guards must not be weakened.

## Completion evidence

CURRENT FACT: environment/tooling and API E2E PASS. Existing FE browser gates PASS;
whole S4.11 PARTIAL because required mapping/commit/planning/retained/PDF screens
are absent. No next slice started. The following results supersede the initial
UNVERIFIED checkpoint; prior S4.7-S4.10 results remain historical evidence.

## Supplied FE and resumed state

User supplied `D:\hocc_bk\ai\proj\projectMLAI\Shelfcash_FE_v2`. Read README,
package/lockfile and existing source/tests. Initial FE HEAD
720b883abe0bab88fa22abf093210dcf67a44bbd, clean index/worktree. No applicable
FE source AGENTS; old api-contract-v1 reference AGENTS is historical handoff.
FE has Auth, Menu, Inventory, upload/analyze and History; remaining required
screens do not exist. This is a scope blocker, not authority to implement a new UI.
Observed Node24.16.0/npm11.13.0; existing lockfile reused, no production dependency.

At the latest resume, owned BE and Vite were active; no pytest was left running.
Prior reliable API/cases/restart and targeted results were reused. Browser report
was FAILED/partial: six UI gates passed, History wire/concurrency fixes were in
progress. No sleep/interruption was counted PASS. Each runner launched during
continuation was awaited to actual exit status; no second test runner overlapped.

## Implemented scope / exact commands and results

All Python commands below use `.venv\Scripts\python.exe` from backend.
All npm commands use the supplied FE directory except runtime Playwright install.

| Command / gate | Actual result and evidence |
| --- | --- |
| `-m scripts.integration init` | exit0; private random configuration, no secrets printed; reuse preserves existing settings. |
| `docker compose --env-file runtime/s411/private/compose.env -f compose.integration.yaml up -d --wait` | exit0; dedicated project/volume, PostgreSQL17 on127.0.0.1:5433, exact integration DB/role. Existing5432 cluster untouched. |
| `-m scripts.integration migrate` | exit0; explicit Alembic head0017,61 tables; no new S411 migration/backfill. Ownership marker and exact Store allowlist checked. |
| `-m scripts.integration start` / `stop` | exit0; native app and three real lifespan workers; UUID-bound graceful completion. Startup now waits real health200; no unknown process killed/replaced. |
| `-m scripts.integration seed` | final exit0, and exit0 after actual reset/reseed. Five Products, one Ingredient, five dated recipes,70 actual sales including zero,2 opening lots, supplier/term/NONE fee/declarations/budget and explicit versioned Store BASELINE. |
| `-m scripts.integration e2e` | final exit0 after reset/reseed; native HTTP+PG chain through Import commit/I06/readiness/C02-C05/C08/history/PDF. Fresh session proves sales/movement/configuration/Run state. Actual grant then revoke through N12/N13 makes same-session Staff Run/PDF/J01 return403; grants restored to menu.read. |
| `-m scripts.integration cases` | final exit0 after reset/reseed; five case gates PASS.20-file aggregate quota/partial rejection/ACK/CAS/seal/replay, NO_OP/profile reuse/no duplicate70 sales, IMPORT_VALUE not carried/confirmation invalidation, invalid mapping422, zero/null/expired stock and unchanged retained Run/PDF after N8 live change. |
| `-m scripts.integration reset-disposable` while server active | expected exit1; guard refusal, no drop. |
| internal `reset_disposable()` while an owned PG client is connected | expected ValueError; same connection still sees2 Stores, PASS guard. Initial probe import typo ModuleNotFoundError exit1 made no mutation, corrected module import and repeated. |
| internal `reset_disposable()` after owned stop/no clients | exit0; exact disposable DB recreated at0017, old artifact generation retained privately, accounts/dataset cleared then recreated through seed. No Store ledger surgery or client termination. |
| same-client restart probe using `Client`, `stop`, `start` | exit0 after reseed/cases; same HttpOnly cookie survives A03, retained C03 exactly equal, PDF byte/hash equal. Cold C03 first read3.937s/warm0.360s on5 Products. |
| `-m scripts.integration status` | exit0; exact DB/head,2 Stores/3 users/5 Products/70 sales/2 lots/2 movements/one explicit model configuration. |
| `-m pytest tests/unit/test_history_read_retry.py tests/unit/test_integration_tooling.py -q` | exit0,17 PASS1.60s. Exact isolation guards/known targets/storage/provider/defaults; retry bound5, whole-read freshness and unrelated failure propagation. |
| `-m pytest tests/integration/test_history_concurrent_session.py tests/integration/test_retained_history.py tests/api/test_planning_inspection_exports_openapi.py -q` | exit0,6 PASS16.76s after final retry fix. Real PG barrier forces concurrent session snapshots; existing history rights/count/cursor/first-upload/completion and public wire checks. |
| guarded `validate_reset_target` + `inspect_database` probe | exit0 before and after tests; exact shelfcash_test head0017, all business rows zero. Integration DB cannot substitute for test DB. |
| `npm ci --no-audit --no-fund` | exit0;30 packages, lock unchanged. |
| `npm install --prefix runtime/s411/browser --no-audit --no-fund playwright` | exit0;2 runtime-only packages, installed Edge used; no app dependency/browser download. |
| `npm run test:auth` | exit0,27 PASS after History consumer fix. |
| `npm run test:import` | exit0,31 PASS; consumer unit/model cases include explicit mock adapter tests, distinct from real Edge gates. |
| `npm run build` | exit0 after final FE changes; TypeScript/Vite151 modules. |
| `npm run lint` | exit0,oxlint. |
| `node scripts/integration_browser.mjs` then affected `--history-only` | final exit0; all nine existing-screen gates PASS against native API, no interception/mock/CORS bypass. Full browser report status PARTIAL. |
| `-m scripts.integration_contract_snapshot` | exit0; exact baseline SHA/CRC, current DTO OpenAPI54operations vs32,22 added/6 changed/0 removed. Current History schemas contain warnings. |
| `git diff --check` | exit0; both HEADs/index unchanged; no commit/stage/push. |

Prior overlapping targeted gates: unit tooling13 PASS; retry4 PASS after fixture
argument-count fix; native history5 PASS16.16s then5 PASS19.66s after warnings.
These are historical iterations, NOT added to17/6 as a regression total.
Selected coverage follows the narrow History transaction/read shape and local
operator guards. No schema/engine change or completed whole-browser milestone
justifies claiming full regression. Full pytest was not run.

## Fail -> fix, retained evidence and drift

Seed failures: assumed I02 quota -> use authoritative I04; incomplete NONE fee
coverage -> explicitly cover both term and supplier; approved reused profiles
absent from editable classifications -> skip immutable approved profile edits.
Failed/draft batches were retained. Pure insert/NO_OP commit uses no forced reason.
Core API negative CSRF first got400 due missing UUID idempotency header -> provide
the header, then actual403. Invalid test field resolution body corrected to typed
binding shape. Overall failed invocations did not become PASS from partial output.

Real FE History initially503. Reproduced actual PG40001: REPEATABLE READ reads
also refresh sliding auth sessions. Three immediate retries still exhausted with
multiple retained batches; final five whole-read attempts with0.75s total backoff
passed actual UI and native concurrency tests. Every attempt rolls back/disposes,
takes a fresh snapshot and rechecks current rights. No mutations/other SQL states
retry. Exhaustion remains503; sustained-contention/load behavior is UNVERIFIED.

Real200 then failed FE protocol validation. Observed drift: HistoryMeta omitted
warnings despite Import common-success contract; runtime now explicitly emits[].
FE assumed raw processing stages and mandatory Notice.details; accepts canonical
in_progress and optional details, rejects malformed status/envelopes/details.
Source changes: BE contracts/history.py and use_cases/import_history.py; FE three
importHistory type/format/validation modules and auth-session consumer tests.
No accepted ADR, permission policy, engine, migrations or retained facts changed.

Browser harness failures: initial startup race before BE health -> readiness wait;
history defaults to month day1 and cards show display number rather than filename
-> select actual anchor date/cards; Unicode strings piped through PowerShell became
question marks -> correct UTF-8 selectors; Staff login restores History route
-> wait for actual imports prefix. These were setup/assertion failures, not PASS.
Screenshots were visually inspected privately; final Staff denial is real403,
then granted Menu loads. No browser JS page errors in passing continuation.

Latest actual PDF139440 bytes, SHA256
b76c987f28fd9c928204259f6195c3c3f419306fae841c31d436d22b58b8fe1d;
ETag/Content-Length/private no-store/nosniff/attachment/CORS exposed headers
and shared J01 polling checked. Private reports preserve real identities/receipts;
no credentials/logs/screenshots/PDF artifacts are shipped in handoff.

Preservation check: all653 baseline paths exist; all28 pre-existing archives hash
unchanged. Changed existing source only the two History files plus authorized
contracts/current-state/roadmap/API/changelog. Ignored `.env` hash also differs
from initial snapshot (mtime13:07); cause is unattributed, preserved without
restore or exposing content. S411 tooling does not write/read root .env for native
runtime (Settings(_env_file=None)); test probe selects exact test URL then guards.
Engine, migration and ADR hashes unchanged. FE original HEAD/index preserved.

## Handoff and remaining limits

Initial v1 ZIP is preserved, SHA256
2c46457f355f7e7de18ff00156f0c068724d7884fc000e9466c9399723fc4ea3,
46 entries/18 DTO examples; browser NOT_RUN at its freeze. Final v2 publication
uses `-m scripts.integration_handoff --version v2`:20 DTO-validated examples,
six complete authoritative contracts/current OpenAPI/baseline diff/changelog,
workflow/runbook/tooling/browser harness/sample public config and SHA manifest.
Builder validates paths/casefold duplicates/CRC/exact manifest entries/checksums
before exclusive publication; checksum result is recorded separately in runtime
handoff_v2.json and final response. Packaging is independent from runtime/UI.

S4.11 PARTIAL: missing required FE mapping/preview/confirmation/commit/planning/
retained/PDF UI prevents whole-chain acceptance. No remote/HTTPS deployment,
SMTP/live provider/cost test/trained activation, Store-only reset/purge or load/SLA
verification.50-Product cold-read~13s debt remains;5-Product timing is not a SLA.
No new engine/what-if/ordering/one-time approval behavior or next slice.
Owned BE with three workers and Vite are left running on loopback for local use;
credentials live only in private accounts.json. All tests/browser probes completed,
no interrupted runner counted PASS. Stop BE only through its owned CLI.

## Post-publication receipt

`-m scripts.integration_handoff --version v2` actually completed exit0:
PACKAGING_PASS,51 entries,20 validated examples. SHA256
b66ce2842db68793a75af10ed7bf0297c070f0b8c16de9e913dcc1804fedc02d.
Independent final ZIP verify again passed path/CRC/duplicates/manifest checks;
all six authoritative bodies match the current files, History schemas include
warnings, original28 archives/v1 hashes and both unstaged HEADs/index preserved.
This receipt is appended after exclusive publication: the ZIP contains the frozen
pre-publication checkpoint above, not a circular checksum of its own receipt.

Final process inspection: native owned launcher PID35356/run UUID
39049558-df3b-4127-9ad8-04b0a9b2c459, Python child9236 belongs to35356 (venv
launcher/child, not a second server). Vite PID32672 remains the original owned
process. No pytest or browser runner remains active. Both repositories
`git diff --check` exit0. No process was killed, no commit/stage/push/deploy.

## User-requested local .env setup

User explicitly requested BE/FE .env for manual testing. Existing root BE .env
(and FE .env if present) copied to ignored private env-backups before replacement.
New BE .env reuses the exact guarded private S411 integration settings and preserves
the separate test DB URL; no provider/SMTP settings. FE .env selects api mode and
localhost:18001. Parsed Settings/exact target guard and Vite loadEnv checks exit0;
existing BE health/FE HTTP200, no second server launched. Both files stay ignored;
no secret output or archive update. This is a post-handoff user configuration.

## User-authorized integration reset/reseed

User selected reset/reseed of exact shelfcash_integration_s411. Prior accounts/
dataset/e2e/browser/state copied into a timestamped private before-user-reset folder.
Exact target/ownership guard, integration stop, reset-disposable, start and seed
all exit0. No other database reset or unknown process termination. Fresh inspection
proves head0017,5 Products/70 sales/2 lots/one explicit model configuration,
0 prior planning Runs/exports. Owner login/A03/Menu/Inventory native HTTP passed
with newly generated account credentials. Old sessions/accounts are invalidated.
BE/worker relaunched; FE .env unchanged. Old browser/e2e evidence is historical;
current browser status NOT_RUN, no full E2E/test rerun claimed. Private user-reset.json
records this generation. Handoff archives unchanged.
