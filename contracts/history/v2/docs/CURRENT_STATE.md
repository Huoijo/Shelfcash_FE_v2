# Current state

## CURRENT FACT — contract supplement audit, 11/10/2026

Documentation/packaging only: exact ZIP10/10 and S4.11 v2 hashes verified;
current source-generated OpenAPI equals v2 (22 added operations, six changed
definitions, none removed or moved versus baseline). No new API version or
implementation slice. See [delta](../CONTRACT_HANDOFF_DELTA_VI.md)
and [verification/limits](../VERIFICATION_VI.md).
Offline OpenAPI gate: nine passed, one stale Auth path-inventory failure preserved;
no DB/provider/browser/full-suite rerun. Full source equivalence at v2 publication
cannot be proved from its consumer-only manifest. S4.11 remains PARTIAL.

## CURRENT FACT — S4.11 PARTIAL, 11/10/2026

Isolated local integration environment and API E2E are verified with native
backend/Import/Planning/PDF workers and PostgreSQL on5433, exact disposable DB
`shelfcash_integration_s411`. Explicit per-Store BASELINE, five-Product synthetic
dataset, fresh-session state, real PDF, current-rights revocation and restart
evidence are recorded in [S411 notes](runbooks/S411_TASK_NOTES.md). Guarded reset
refuses active clients, then recreates only the isolated DB at Alembic0017;
normal seed/API flows recreate the dataset. Development DB is untouched.

Real installed Edge verified existing FE Auth, Menu, Inventory, multifile
upload/analyze/polling and H01/H02 with Staff denial. Required mapping/preview/
confirmation/commit/planning/retained/PDF screens are absent in the supplied FE;
whole-chain browser acceptance remains BLOCKED_BY_FE_SCOPE. No fake UI gate.
Browser integration corrected H01/H02 meta.warnings omission against the existing
Import contract, bounded whole-read PostgreSQL40001 retries, and FE status/Notice
validation. No business engine, permission policy or schema migration changed.

Versioned integration handoff v1 remains frozen; v2 contains final wire/schema/
examples/browser fixes.53 core HTTP operations plus health remain current.
Targeted verification is not full regression. No commit/stage/push/deploy,
provider call, trained activation or next slice. Local endpoints are
http://localhost:18001 and http://localhost:5173; private generated credentials
stay under ignored runtime. See [local runbook](runbooks/S411_LOCAL_INTEGRATION.md).

## HISTORICAL INFORMATION — S4.10 completion checkpoint, 11/10/2026

C04/C05 retained Ingredient inspection, C08 structured engine reasons, N9 Run
history, H01/H02 Import history and N10/N11 private PDF export with shared J01
are implemented and targeted verified. Current Store sensitive-read rights apply
on every read/replay; export also requires planning.export at acceptance,
materialization/publication and download. No GET invokes forecast/solver/provider
or rewrites business facts. Options and global proof/reason semantics stay retained.

ACCEPTED DECISION: terminal captured computed scope without a retained result
can return C04/C05 with required result_digest=null, verified by existing snapshot/
input/aggregate integrity. Engine-dependent values stay unavailable/null. A retained
result still requires its valid non-null digest; no substitute digest or new grant.

Migration0017 adds one purpose-specific planning_exports table plus queue/history
indexes, no backfill; downgrade refuses retained intents. Head0017,61 public
tables including Alembic;53 core HTTP operations plus health. Eight new operations/
six paths, existing operations unchanged; shared JobView gains PDF variants.
PDF_EXPORT_WORKER_ENABLED defaults false independently of planning/import flags;
explicit opt-in starts one bounded local lifespan thread. Durable claims, current
rights fences, exact lost-ACK reconciliation and artifact hash/size proof prevent
successful download before publication. Proven dead owners fail without automatic
rerender; internal retry is bounded to one additional attempt, no public retry.

Actual ReportLab Vietnamese PDF with bundled offline NotoSans fonts was downloaded,
hashed and rendered in full:28 pages/88009 bytes; contact sheets and detailed pages
passed visual inspection. Real sequential guarded shelfcash_test gates cover reads,
history, permissions, export durability/HTTP and affected schema/S49/Import callers.
Counts overlap, no full-suite claim. Test output and failure fixes remain in notes.

TECHNICAL DEBT:50-Product C03 after cold13.068s/warm1.127s,9 queries/118281 bytes;
response parity and corruption rejection verified. Cold deep validation remains
slow after restart/eviction; these measurements are not a capacity/SLA claim. Cache
is four entries/16MiB canonical source admission, not an RSS cap. Export limits
include twenty outstanding/Store,3MiB report,25MiB PDF,1000 pages/120s cooperative
checks. No new TTL/purge/retention policy or real-data forecast-quality assessment.

Evidence: [S410 notes](runbooks/S410_TASK_NOTES.md),
[feature/examples](features/RETAINED_PLANNING_HISTORY_PDF.md),
[manual worker flow](runbooks/S410_RETAINED_HISTORY_PDF.md),
[wire compatibility](CONTRACT_COMPATIBILITY_CHANGELOG_VI.md).
S4.11 FE/browser acceptance remains PLANNED. No development DB/live provider,
engine policy change, commit/stage/push/deploy or new handoff/ZIP.

## HISTORICAL INFORMATION — S4.9 COMPLETE authorized scope, 11/10/2026

C02 accepts a durable Run with default/custom/saved requirements, budget ceiling
and explicit serving configuration frozen at acceptance. C03 polls the same Run,
checks current Store sensitive-read rights and verifies retained schema/digests;
it never recaptures or recomputes. Acceptance/audit/receipt and terminal result/
audit/lifecycle are atomic. Existing forecast, BOM, FEFO, procurement and selector
semantics are unchanged. Explicit BASELINE was verified; trained activation and
real-data forecast quality were not assessed.

An independent PLANNING_WORKER_ENABLED flag defaults false. Explicit opt-in owns
one local lifespan thread; C01/R01 follow actual worker liveness. Bounded attempts
close Sessions before the engine. Claims fence publication; only proven dead
process incarnations recover to failed, without automatic re-execution. No new
migration: head0016,60 tables; 45 core HTTP operations plus health.

Targeted sequential real shelfcash_test gates verify public engine paths, current
rights, config immutability, exact reuse/reprepare, concurrent claims, process
death, lost acknowledgment and retained integrity. Gate counts overlap. The
50-active-Product benchmark retained118281 bytes/9 queries; cold C03 took12.73s.
TECHNICAL DEBT: deep retained decoding at this boundary remains slow; this is not
a latency SLA or a simultaneous maximum offers/lots benchmark.

Evidence/limits: [S49 notes](runbooks/S49_TASK_NOTES.md),
[feature](features/PUBLIC_PLANNING.md), [manual flow](runbooks/S49_PUBLIC_PLANNING.md),
[wire compatibility](CONTRACT_COMPATIBILITY_CHANGELOG_VI.md).
S4.10/H01/H02 and S4.11 FE/browser acceptance remain PLANNED. No development DB,
live provider, policy change, commit/stage/push/deploy or new handoff/ZIP.

## HISTORICAL INFORMATION — S4.8 COMPLETE authorized scope, 11/10/2026

N1–N4 saved requirements/budget, R01 canonical readiness and C01 planning context
are public. Config writes use current authorization, creator ownership, CAS,
atomic revisions/audit/receipts and exact replay; Save does not require execution
prerequisites. New I06 retains authorized post-write readiness atomically; old
completions are unchanged. Serving configuration is versioned and explicitly
selected by operator (BASELINE authorized); absent configuration stays unknown.
Internal exact forecast reuse and bounded prepare/capture comparison are wired.
No forecasting/solver policy was changed.

Migration head is 0016_planning_configuration (60 public tables including Alembic),
with eight additive scoped configuration/evidence tables, no business backfill,
immutable retained evidence and guarded downgrade. There are 43 core HTTP
operations plus health. S4.9/S4.10/S4.11 remain PLANNED; C02/C03, public planning
worker, H01/H02 and FE end-to-end remain unimplemented. Import worker defaults
false; readiness distinguishes valid data from unavailable planning execution.

Targeted real PostgreSQL shelfcash_test gates run sequentially. Exact commands,
fail→fix, results and limits: [S48 notes](runbooks/S48_TASK_NOTES.md).
[Feature/manual examples](features/PLANNING_CONFIGURATION_READINESS.md),
[wire compatibility](CONTRACT_COMPATIBILITY_CHANGELOG_VI.md). No full-suite claim,
development DB mutation, live provider, commit, ZIP or handoff publication.


## HISTORICAL INFORMATION — S4.7 COMPLETE trong scope CAT12, 11/10/2026

N20 timeline, N21 preview/commit synchronous và N22 retained change/audit đã có
HTTP theo đúng CAT12. Chỉ thay từ ngày Store kế tiếp; explicit close/open,
no overlap, gap cần acknowledgment, ngày hôm nay/quá khứ bất biến. Current
rights/Store isolation, CAS/dependency/day pins, idempotency và ordered canonical
fences dùng chung Import; writer/audit/receipt atomic, rollback qua real SQL.
Migration0015 thêm assignment flag và hai bảng evidence, không backfill lịch sử;
public/operational readers chỉ dùng assigned recipes. Downgrade chặn mất evidence.

CA-002/016/019/020/021 đã remediation theo quyết định người dùng: reason có điều kiện;
Money18/18 tách Quantity, source keys1000; Staff IGNORE own uncommitted batch;
OPENING_STOCK kiểm intervening evidence dưới fence, ACTUAL_RECEIPT giữ late event.
Legacy money evidence không sửa/round; re-import ngoài bounds cần review rõ ràng.
H01/H02 approved v1 có owner S4.10, chưa implement. S4.8/S4.9/S4.10 vẫn PLANNED,
không tự bắt đầu. 37 core HTTP operations + health không nghĩa53 design routes đã
implement. Worker mặc định false; chưa public planning/readiness hoặc handoff mới.

Targeted PostgreSQL shelfcash_test tuần tự + API/unit/offline OpenAPI đã thực chạy;
exact commands, fail→fix và giới hạn ở [S47 task notes](runbooks/S47_TASK_NOTES.md).
Không cộng gates overlap thành full-suite; không development DB/provider/engine
execution/ZIP/commit. [Feature](features/RECIPE_SCHEDULE.md),
[compatibility](CONTRACT_COMPATIBILITY_CHANGELOG_VI.md).

## HISTORICAL INFORMATION — S4.6 operational import / stock writers, 11/10/2026

S4.6 COMPLETE trong scope được duyệt. I05/I06 atomic commit hỗ trợ chín source
schemas; N6 nhận lô ban đầu/hàng thực nhận và N8 ngưỡng Owner có public HTTP,
current permissions/Store isolation, CAS, idempotency và immutable audit.
Migration0014 bổ sung tám bảng operational evidence/configuration, không backfill.
Inventory count không tạo lô; opening COUNT_CORRECTION khác RECEIPT.

Canonical writes + success audit + completion/job atomic. Period amendments cần
pinned Owner evidence và executor supplier_changes; explicit coverage không đồng
nghĩa planning readiness. Purchase history OPEN; S4.7 timeline, S4.8 readiness,
S4.9 public planning và H01/H02/R01 chưa implement. Worker mặc định false.

Verification: critical gate105 passed (200.60s), affected gate61 passed (127.98s),
final boundary gate16 passed (20.52s). Các gate overlap, không cộng thành full-suite.
Real PostgreSQL shelfcash_test tuần tự; offline OpenAPI thêm đúng N6/N8, không đổi
path cũ. Không development DB/live provider/full suite/commit/ZIP.
[Feature/FE walkthrough](features/IMPORT_INVENTORY_SUPPLIER.md),
[exact commands/fail→fix/limits](runbooks/S46_TASK_NOTES.md).

TECHNICAL DEBT: typed SourceText/Quantity bounds khác handwritten Import§13;
feature ghi rõ drift, không tự đổi policy. Absence statements bên dưới là lịch sử.

## HISTORICAL INFORMATION — S4.5 canonical commit, 10/10/2026

S4.5 COMPLETE trong scope được duyệt: products/ingredients/sales/recipes. I05
phase=preview202, confirm_review200 staging-only, commit202 durable import_commit;
J01 và I04 đọc job/state, I06 retained completion. Canonical + success audit +
completion/job terminal atomic; current rights/source pins/confirmation/read-set
recheck ở acceptance và execution. Không parser/provider/remap trong commit.

S4.6 inventory/count/opening/receipts/suppliers/terms/fees/declarations vẫn PLANNED;
purchase history OPEN; recipe timeline S4.7, H01/H02/R01 chưa implement. Completion
readiness unknown/NOT_ASSESSED, không planning-ready claim. Default worker=false.
Không migration mới: reuse0013 JSONB staging/jobs/receipts/immutable audit provenance.

Verification: affected regression173 passed (235.49s); final source gate47 passed/
1 failed assertion dùng list thay wire dict, sửa test rồi affected case1 passed
(5.47s). Không cộng gates overlap, không full-suite claim. Real shelfcash_test:
rollback sau hai flush, concurrent acceptance/claim, dead-process recovery,
uncertain acknowledgment và table-lock fence; offline OpenAPI chỉ thêm I06 và I05
202 variant/Import DTOs. [Feature/FE walkthrough](features/IMPORT_CANONICAL_COMMIT.md),
[exact commands/fail→fix/limits](runbooks/S45_TASK_NOTES.md).

Các phần S4.4 bên dưới là HISTORICAL INFORMATION theo thời điểm từng extension,
không còn authority cho absence statements “commit unsupported/S4.5 planned”.

## S4.4 — batch mechanics / additive quota, 10/10/2026

User-approved contract freezes multi-call accepted-logical-file quotas, ordered
partial byte acceptance and evidence/receipt-set revision semantics. I04 adds typed
whole-batch quota independent pagination, with read metadata refresh under existing
User/session/Store→batch lock order. No admission policy/new route/storage/migration/
DELETE/canonical writer change. S4.5/S4.6 remain PLANNED. Targeted tests/evidence and
limits: [task notes](runbooks/IMPORT_BATCH_MECHANICS_TASK_NOTES.md). New targeted gate: 13 passed; affected Import/OpenAPI gate: 48 passed
(overlap, not full-suite count). Offline OpenAPI paths unchanged; only required
ImportRead.quota and new ImportQuota component. No automatic
next slice, development DB/provider calls/commit/stage/push/ZIP authorization.


## Explicit scalar field-value sources — COMPLETE authorized staging scope

CURRENT FACT (2026-10-10): same M04 route adds shared_value; profile constants are
Owner-approved immutable rules, import values remain sheet-local and absent from
reused profiles. Typed rows unchanged; source conflicts require explicit switch;
M03 scopes/M01-I04 declarations/preview provenance and digests now cover sources.
Pure normalization releases Sessions; no canonical writes/migration/new schemas.
Targeted Import gate106 passed; affected duplicate-source/false/date34 passed;
wire provenance/fresh PG followup40 passed; final strict-null/shared unit13 passed
and descriptor wording23 passed (overlap, not full suite).
Fresh PG17.11 shelfcash_test evidence, failures/fixes,
allowlist/limits: [task notes](runbooks/IMPORT_FIELD_VALUES_TASK_NOTES.md),
[feature](features/IMPORT_FIELD_VALUE_BINDINGS.md).
S4.5/S4.6 PLANNED; generic/nested/identity injections not added. No live provider,
development DB access, commit/stage/push/ZIP. Older absence statements below are
slice-time history before this opt-in scalar extension.

## HISTORICAL INFORMATION — Import schema inventory / descriptors follow-up

CURRENT FACT (2026-10-10): field-by-field inventory of nine current source schemas
includes111 fields/discriminators/nested fee/declaration values, required-nullable,
input source/binding and actual preview versus future writer destinations.
[Inventory and gaps](features/IMPORT_SCHEMA_INVENTORY.md),
[task notes](runbooks/IMPORT_SCHEMA_INVENTORY_TASK_NOTES.md).
M03 additive nullable/input_sources/input_help and business reference aliases;
approved tokens resolve without Excel UUIDs. Generic row context constants remain
absent; current required-column gate documented as a gap, not product policy.
Opening/actual receipts have N6 contract but no Import schema; purchase history
has no accepted importer. No schema/writer/migration change or next slice started.
Targeted descriptor/provider/preview/OpenAPI47 passed; not full regression.

## Import classification/review extension — COMPLETE authorized staging scope

CURRENT FACT (2026-10-10): user-authorized rules/Qwen indexed sheet/column proposals,
typed shared descriptors/M03, M04 sheet type/explicit ignore and direct reused-column
corrections now implemented. Approved memory remains Store/source/report scoped;
MANUAL confidence=null, REUSED version pinned. Per-import I05 confirm_review (200)
is distinct from N5 profile approval and preview (202), binds exact retained source/
mapping/preview/read-set and current write scope; no canonical commit or new schema.
I04 exposes current usability; new preview/edit/stale/revoke requires review again.

Targeted Import regression90 passed/1 failed; compatible identity-issue deletion on
same-type review corrected, affected8 passed. Expanded new boundary group32 passed;
subsequent immutable ignore evidence/direct reused-edit context regressions4 passed,
Store-memory isolation/structure drift1 passed. Groups overlap; not full regression.
Earlier fixture/helper/collection failures and all executed commands are in
[task notes](runbooks/IMPORT_CLASSIFICATION_TASK_NOTES.md). PG17.11 on guarded
local shelfcash_test only; fresh Sessions show atomic staging audit/receipts and
no canonical business writes. No interrupted test is counted PASS.

OpenAPI keeps31 paths/all IDs, only I05 operation adds confirmation request/200;
Import DTO changes explicit in canonical contract, old non-Import DTOs unchanged.
Offline provider validation/bounds/outage tested; live Qwen/provider accuracy,
FE/browser, production load/security certification not verified. Canonical commit
remains409/can_commit=false. See [feature](features/IMPORT_STAGING_PREVIEW.md).
S4.5 remains PLANNED, not started; no commit/stage/push/ZIP/development DB access.
Previous S4.4 gates below are foundation evidence, not this extension's test results.

## S4.4 — COMPLETE authorized staging/preview scope / targeted verified

CURRENT FACT (2026-10-10): M04 source_context đã được người dùng duyệt; stable
Store source/report codes do proposer khai báo, Owner review cả immutable profile,
USER_DECLARED không externally verified. I01–I04/M01–M04/N5/I05 preview/J01 hiện
có code/typed HTTP và migration0013 additive10 staging tables. Không S4.5/canonical
writes/completion/history/readiness; can_commit=false. Worker explicitly opt-in,
default startup/health không DB. Evidence mới: S44_TASK_NOTES và Import feature.

Gate61 tests đã hoàn tất PASS (PG + parser/preview/provider-offline/OpenAPI),
cùng affected followups24/2/1 tests (overlap, không cộng thành full suite). Related
regression307 passed/5 failed do stale inventories/seed verifier, corrected exact
authorized additions; affected rerun6 passed/1 remaining route-inventory failure,
then that test1 passed. No unresolved test failure; no full-suite PASS claim.
Worker real local-thread drain và Owner CAS race đã verified on guarded PG;
CLI empty-queue guard smoke PASS. Exact commands/fail→fix/limits S44_TASK_NOTES.
Không coi lượt test bị ngắt hoặc setup errors là PASS.
Baseline/WIP/18 ZIPs/HEAD giữ nguyên; development DB không truy cập/migrate/reset.
Những absence statements dưới đây là historical foundation/slice-time records.

## HISTORICAL INFORMATION — S4.4 foundation trước source_context approval

CURRENT FACT (2026-10-10): T01 and Staff pagination now use server-private,
process-local cursor signing keys, with session/domain binding. Real PostgreSQL
tests reproduced client-forged cursors before correction and reject them after
correction. S4.3 reads use the same signing primitive with their own private key.
Authorization remains independent of cursor integrity; public wire/OpenAPI is
unchanged. Related targeted gate: 25 passed; earlier overlapping gates are recorded
in [S44 task notes](runbooks/S44_TASK_NOTES.md), not full regression evidence.

CURRENT FACT: immutable parser outputs and bounded CSV/XLSX lexical parsing exist
and have 14 passing unit tests. This foundation is not connected to HTTP or jobs.
There are no Import endpoints, staging persistence, profile decisions, durable jobs
or full-domain previews yet. S4.4 is not COMPLETE; S4.5 has not started.

OPEN: profile scope requires source_system_key/report_type, but the current request
contract has no explicit source-context declaration. An additional M04 variant
would change the handed-off wire contract and awaits user approval. Inferring that
identity from filenames/headers is not an implemented workaround. See
[Import feature](features/IMPORT_STAGING_PREVIEW.md) for the dependency and limits.
No migrations, development DB access, commit, staging, deployment or ZIP this turn.

## S4.3 ? COMPLETE authorized reads / targeted PostgreSQL + HTTP verified (2026-10-10)

CURRENT FACT: P01/P02/V01?V04 now registered below /api/v1, canonical typed
Menu/recipe/inventory projections, scoped current permissions and private cost
queries, bounded SQL keyset pages and Store-wide aggregate summaries. Owned
READ ONLY REPEATABLE READ before first SQL, detached output and final current
authorization recheck. Migration0012 adds metadata revision counters/triggers for
atomic source insert/update/delete/ABA invalidation; no business backfill or writers.
S4 overall IN PROGRESS; S4.4 onward PLANNED, not started.

Exact quantities/nullable0 facts/unit labels, Store-local inclusive dated recipe,
missing vs empty recipe, lot expiry/usable/physical and signed source movements
are preserved. Completeness and thresholds have no implemented source: UNKNOWN/
null, no fabricated CONFIRMED/empty/low/stable. Old provenance remains UNKNOWN,
location unsupported, historical actor null; no recent-page balance reconstruction.
No receipt/count/threshold/import/recipe timeline/planning/forecast/solver/LLM path.

Evidence: new S4.3 unit/HTTP/real-PG tests cover canonical values, scope/current
revoke, cursor changes and coherent concurrent reads, test-only migration rollback.
Related schema/writer/auth regressions completed with documented fixture failures
and corrections. OpenAPI preserves all old operations/DTOs and adds exactly6 GETs.
See [S43_TASK_NOTES](runbooks/S43_TASK_NOTES.md) for exact commands/results/fail-fix
and [feature](features/PUBLIC_MENU_INVENTORY_READS.md) for FE usage/source map.
Groups overlap: no full-suite, browser FE, production SLA or security certification.

Only guarded local shelfcash_test was connected/migrated/reset. No development DB,
commit/stage/push/deploy/ZIP. Unrelated WIP and18 prior archives preserved. Private
process signing key protects new cursors; backend restart requires refresh. No next
slice starts automatically; S4.4 remains the roadmap's next proposed implementation.


## S4.2 — COMPLETE authorized scope / targeted PostgreSQL + HTTP verified (2026-10-10)

CURRENT FACT: N12–N19 routes, typed Staff contracts, Owner Store-scoped grant CAS,
invitation consent/acceptance/audit/receipts and explicit encrypted-intent local
dispatcher exist. Migration0011 is additive, without ownership/grants backfill.
Verified only on guarded shelfcash_test. S4.1 historical evidence
below remains slice-time evidence, not current absence of invitation/grant routes.
See [S42_TASK_NOTES](runbooks/S42_TASK_NOTES.md) and
[Staff feature](features/STAFF_PERMISSIONS_INVITATIONS.md). At S4.2 completion, S4.3 had not started.

Evidence:34 new PostgreSQL/HTTP cases,2 unit and1 OpenAPI verified across targeted
groups;57 contract/API/cleanup/application checks and50 S4.1+identity/schema/dev
regressions passed. Additional S1/S2 schema/recipe/operational gate197 passed/1 stale
table-count failure, corrected assertion rerun1 passed. Final delivery4 and expanded
scope/OpenAPI6 passed; counts overlap, not full regression. OpenAPI diff preserves
health/six S4.1 operations and existing DTOs, adds exactly7paths/8operations.
Fresh Sessions prove exact grants and atomic membership/transition/audit/receipts,
no-op/CAS/retry/current revoke, rollback failure invariants. Real PG concurrency
covers accept/accept/revoke/reissue, grant CAS and two dispatcher claims. Explicit
lock-wait tests recheck issuer authority/expiry. Controlled negative test confirmed
stale ORM intent cache could duplicate sends; locked refresh fixes it.

Delivery is queued until authorized local dispatcher runs; no automatic worker or
real SMTP/FE/browser/load/security certification. Expired ciphertext cleanup also
requires dispatcher; uncertain claimed attempts need Owner reissue. No development
DB access, commit/stage/push/deploy/ZIP; unrelated WIP and18 archives preserved.
Historical S4.2 completion: S4 overall IN PROGRESS; S4.3 onward was PLANNED.
Current S4.3 state is above; no automatic next slice.

## S4.1 — COMPLETE authorized scope / targeted PostgreSQL + HTTP verified (2026-10-10)

CURRENT FACT: A01/A03/A04/T01/T02/N7 public routes under /api/v1, controlled
operator-assisted account/Store/credential commands and TLS SMTP adapter now exist.
Opaque secure session/CSRF, Argon2id, single-use SETUP/RESET, live Store membership/
grants and permissions-v2 catalogue. Migration0010 adds six auth tables and
membership authorization_revision; no role/grant/ownership backfill. Old S1
reserved permissions constraint and S1/S2/S3 writer/run semantics preserved.
Historical S4.1 scope at completion: S4.2 onward was PLANNED; the current S4.2
extension is above. Planning HTTP/worker, Dashboard/AI/What-if/one-time approval
remain absent.

Evidence:38 new cases verified across targeted groups (11 contract unit,2 cleanup
unit,1 OpenAPI,24 real PostgreSQL/HTTP). Final combined auth/schema/boundary gate
112 passed; subsequent transport/OpenAPI25 and cleanup/dev3 passed. Schema gate
223 passed/1 expected-list ordering failure, corrected test rerun passed; selected
S1/S2/planning callers133 passed/14 deselected. These groups overlap, not full-suite
results. OpenAPI diff keeps health unchanged and adds exactly six authorized paths.
Final N7/fence/application/repository rerun42 passed after transport schema checks.
Fresh-session evidence includes atomic provision/credential/session/audit, reset/
logout/deactivation revocation, completion/provision races, grant ABA revision,
real PostgreSQL lock-wait revoke fence, cross-Store denial and failed-commit rollback.
Detailed commands/fail→fix/limits: [S41_TASK_NOTES](runbooks/S41_TASK_NOTES.md).

Only guarded local shelfcash_test was connected/migrated/reset; Docker started
without volume removal. Development DB untouched. No full suite/ML/solver benchmark,
commit/push/deploy or ZIP. Existing unrelated WIP/archives preserved against baseline.
Deployment prerequisites: configure FE origins, HTTPS, operator identity/secret and
verified-holder SMTP channel; real email delivery/browser FE flow/load/security audit
not verified here. No provider credentials configured or printed.
History sections below are slice-time facts, including statements that auth/HTTP
were absent before S4.1; current product behavior remains canonical AUTH v1.

## S3.6.4 — COMPLETE internal scope / PostgreSQL acceptance PASS (2026-10-09)

CURRENT FACT: additive PlanningRun storage/lifecycle implemented internally;
atomic acceptance/idempotency, claim/retain/finalize/read and OS-verified interrupted
recovery. S1 winner-required writer/package and S2 remain unchanged. Migration0009
was exercised only by guarded shelfcash_test fixtures, never development.
Initial unit/boundary gate273 passed; new unit affected gate25 passed. First PG
gate11 passed/1 injection-setup failure; next23 passed/1 Windows liveness failure;
fix uses OS signaled-handle evidence. Affected PG22 passed, including recovery.
Final flow/recovery gate9 passed180.16s, including a real child process claiming in
PostgreSQL then exiting, with living parent owner protected. Provider ownership
gate5 passed4.21s (commit/rollback/dirty provider rejects; race/retry preserved).
All33 new PostgreSQL cases passed across affected groups;26 new unit cases passed
across25-case gate and1 exact large-counter check. Schema/S1/S2/capture regression
gate438 passed312.79s; unchanged health/API boundary2 passed; final type/import
boundary10 passed. These are targeted gates, not full-suite or accuracy evidence.
Final Engine ownership guard1 passed and private transition/fencing/recovery gate4
passed: caller-bound Connection/Session rejects; queued terminal/start rewrite rejects.
Retained read measured1.506/2.716/8.399/1.736s on tiny synthetic stock/purchase/
no-pass/partial fixtures, including pure semantic checks; no latency SLA.
See [task notes](runbooks/S364_TASK_NOTES.md) and [feature](features/PLANNING_RUN.md).
No HTTP/auth/worker/auto forecast/config CRUD/ZIP/commit or next slice.
Older absence-of-storage statements are historical slice boundaries.
DB config/saved adapters, authorization, worker, forecast orchestration/reuse and
HTTP C01/C02/C03 remain unimplemented. S3 overall IN PROGRESS. Observed concurrent
planning-contract configuration-document consolidation was preserved, not edited
or implemented by this slice. No development connection, ZIP or commit.

## S3.6.3 small-domain verification - CURRENT FACT (2026-10-09)

Stock zero-purchase winner, native affordable purchase and tiny-domain certified
no-pass verified through resolver/bridge/pipeline/selector.90 targeted tests passed;
final two selected-outlay assertions reran and passed. No production correctness fix.
Historical BASE95 5/10P outputs and UNKNOWN/UNPROVEN unchanged. Separate checked
temporal upper bound proves P0<=60% on those frozen synthetic fixtures; no large
enumeration or public readiness/model quality claim.
[Review report](reports/S363_SMALL_DOMAIN_VERIFICATION.md) records exact scope,
commands/proof and small overlay ZIP contents. S3.6.4 has not started.


## S3.6.3 - COMPLETE / internal planning setup resolver (2026-10-09)

CURRENT FACT: typed planning_resolution/1 request and by-value config bundle resolve
explicit default/custom/saved into frozen effective requirements/budget/provenance.
Small bridge feeds operational pipeline/2 with explicit execution declarations;
no live setup reread, mutation/Save or auth/readiness/durable-acceptance claim.
Existing default BASE95 is declared/versioned in source, never fallback.
Targeted gate 212 passed; resolver-only affected rerun 86 passed; final bridge cap
guard affected rerun 5 passed/82 deselected. New synthetic
BASE95 5/10P benchmark: both winner null, customer-fail/INCOMPLETE/UNPROVEN, feasibility
UNKNOWN; resolver ~0.96/0.77ms, full external pipeline ~12.42/22.24s. Not no-solution
proof, real data/accuracy/savings/SLA or full regression.
See [feature](features/PLANNING_SETUP_RESOLVER.md) and [task notes](runbooks/S363_TASK_NOTES.md).
No DB/schema/public HTTP/auth/default/saved persistence/forecast orchestration/
Run storage/worker/idempotency/FE/Optuna. S3 overall IN PROGRESS; no next slice started.
Earlier slice sections retain their slice-time absence of resolver, not current absence
of the new internal resolver. All prior WIP and 15 archives must remain intact.


## S3.6.2 — COMPLETE / PostgreSQL acceptance PASS (2026-10-09)

CURRENT FACT: opt-in operational_decision/2 → detached capture2 with temporal basis →
BOM → procurement/2 → comparison/2 → selector/1 is implemented internally. Active
menu, computed scope/exclusions and original requirement overrides are separately
retained; excluded overrides are NOT_EVALUATED. Shared Ingredient blockers propagate
by captured dependency graph; unknown scope blocks. Budget effective limit and ceiling,
versions/fee coverage/declarations are explicit and frozen; no default BASE95/zero fees.
Lower effective budget can tighten captured ceiling without rewriting physical facts.

P1 executes CURRENT_CAPTURE or HYPOTHETICAL_CURRENT_CAPTURE with original receipt/
expiry/effective dates and explicit warning/assumptions; past eligibility activation
is not a historical stock/receipt reconstruction. /1 guards/callers and S1/S2 lifecycle
remain unchanged. Pure allocation/FEFO/arithmetic/winner policy unchanged. C03 design
domain_size is now canonical integer text; there is still no public planning route.

Unit/boundary and affected regressions are historical evidence in [task notes](runbooks/S362_TASK_NOTES.md).
CURRENT FACT: Docker readiness restored; local shelfcash_test target verified before
fixtures. Six /2 PostgreSQL acceptance tests and six /1 capture regressions ran together:
12 passed in 21.00s. Fresh-session checks, concurrent writer/read-only snapshot,
resource release, scope, detached input and retained integrity blockers passed.
See [acceptance report](reports/S362_POSTGRESQL_ACCEPTANCE.md) for exact scope/limits.
No implementation fix or schema change was needed. No development DB connected,
reset or migrated. S3.6.2 internal slice is COMPLETE; public flow remains backlog.
See [feature](features/DECISION_OPERATIONAL_V2.md),
[ADR-021](adr/ADR-021-operational-decision-v2-temporal-scope.md).

No HTTP/default/custom/saved resolver/storage, auto forecast/reuse, durable Run/worker/
idempotency/replay persistence/auth/migration/FE/Optuna. Public capability stays absent.
No commit/push; preexisting WIP and archives preserved. S3 overall IN PROGRESS;
No next slice started; further public integration requires separate authorization.

## Planning contract cluster — DESIGN ONLY (2026-10-09)

Current contract: [PROCUREMENT_API_CONTRACT_VI.md](PROCUREMENT_API_CONTRACT_VI.md).
C01/C02 are consolidated; C03 is the polling/result read, with C07's strategy-read
responsibility folded into C03 v1 (delegated TECHNICAL CHOICE). The user accepted
noncurrent dates with explicit current-capture assumptions; whole-response denial
without planning plus budget/procurement-cost permissions; indefinite retention of
Run/input/result/idempotency links with no automatic deletion. These are product
decisions, not implemented runtime. No planning policy question remains in this cluster.

CURRENT FACT at that documentation review: no new public route/auth/storage/migration/engine change.
At that review's boundary, operational capture was /1 and same-day only; noncurrent-date support and capture2
bridge, public resolver, durable acceptance/no-winner lifecycle and retained reads
were IMPLEMENTATION BACKLOG. The newer S3.6.2 section records the opt-in internal bridge;
public resolver/persistence remain backlog. S1/S2 runtime status below is unchanged.
Verification is documentation/example/archive checks only, recorded in the review
ZIP; no pytest, solver or PostgreSQL run in this turn. Historical evidence stays historical.

Classification: CURRENT FACT unless explicitly marked otherwise.

## S3.6.1 — CURRENT FACT (2026-10-09)

COMPLETE within the typed internal slice: procurement/2 enforces explicit effective
customer Product/path requirements in native generation and exact validation,
per-Product100% LOW/BASE/HIGH construction, customer-pass max-min/equal mean/cost
fallback. comparison/2 groups compatible options with distinct strategy evidence;
selector/1 recommends eligible exact candidates by cost/min HIGH/BASE/LOW/stable basket.
Errors remain errors; incomplete/unproven incumbents may be recommended. No implicit
BASE95 default. Accepted limited supersession is [ADR-020](adr/ADR-020-product-requirements-procurement-selector.md);
historical accepted ADRs and procurement/1/DecisionPolicy/S1 lifecycle are unchanged.

Explicit capture_version=2 admits per-Product mixed selling units; default version1
still requires a common unit, and DecisionPackageV1 rejects capture2. Operational
capture/pipeline remains /1, not wired to the new selector. No HTTP/default/saved/auth,
DB/retention/replay/DecisionRun/schema/migration/FE/Optuna or S1/S2 logic change.

Verification: 389 targeted tests passed (32 new /357 affected old at that gate), not full suite;
5 expected serializer warnings from deliberately malformed capture tests. Final small
evidence/numeric hardening passed affected6, then7, then3 cases;34 new cases now,
without another full-group rerun. Packaging checks23 passed/2 Windows symlink skips;
exact commands are in [task notes](runbooks/S361_TASK_NOTES.md).
Six16-vector native+independent exhaustive ranking cases certify finite domains;
oracle shares canonical fixed-basket serving, not an independent simulator.
Real native SYNTHETIC5/10 Product benchmarks have65,536-vector domains, no exact
certificate. Low-requirement5P yields eligible fallback and a real native LIMIT WITH
incumbent;10P keeps eligible zero-purchase baseline while native reports NO incumbent.
Engine10s cooperative deadline overrun observed ~2.44s/0.97s; comparison/selector add
~13.45s/7.67s separately. No latency SLA, global optimality or real-data quality claim.
See [feature](features/PROCUREMENT_V2.md), [benchmark](reports/S361_PROCUREMENT_VERIFICATION.md).

S3 remains IN PROGRESS. Further API/persistence/operational-v2 integration is PROPOSAL,
not started. Older no-selector/absence statements below are slice-time historical
boundaries. Development DB and old ZIPs remain untouched; no commit/push.

## S3.5.2 — CURRENT FACT (2026-10-08)

Operational capture/typed internal pipeline and PostgreSQL acceptance COMPLETE within
the internal S3.5.2 scope; S3 overall remains IN PROGRESS. Scoped repository adapter
owns read-only REPEATABLE READ capture, verifies retained Forecast unit/input provenance,
copies current operational values/dated recipes/terms/constraints, closes before
BOM/serving/procurement/comparison. Required typed declarations preserve missing/zero,
fees/budget/bounds/limits/inventory completeness and unsupported committed inbound.
No historical inventory as-of claim, schema/API/winner/DecisionRun persistence,
S1/S2 algorithm changes or new accepted policy. Older capture-absence statements
below are historical slice boundaries. See [feature](features/DECISION_OPERATIONAL_PIPELINE.md)
and [task notes](runbooks/S352_TASK_NOTES.md) for exact evidence/limitations.
Verification: 51 new capture/adapter unit cases passed, then 3 affected guard tests
passed after the small final patch; 345 direct engine/boundary regressions passed.
Earlier packaging: 19 passed/2 Windows symlink skips. Earlier six PostgreSQL setup
timeouts were resolved by user opening Docker. Real PostgreSQL acceptance: 6 passed
in6.79s, then strengthened 6 passed in7.47s; final cross-store-only addition passed
1 test/5 deselected in1.48s. Acceptance packaging: 23 passed/2 Windows symlink skips.
Snapshot concurrency, detachment, pool release, caller ownership, scoped data,
blockers and provenance verified on disposable shelfcash_test; no runtime fix.
See [acceptance report](reports/S352_POSTGRESQL_ACCEPTANCE.md). Synthetic fake-port/
native-solver demo reaches comparison with proof UNPROVEN and no winner. No full-suite
pass claim. Development DB and historical ZIP bytes preserved.

## S3.5.1 — CURRENT FACT (2026-10-08)

Pure procurement comparison foundation COMPLETE within internal scope. Revalidated
S3.4.4 source → exact captured cost/fee breakdown, Product/path and Ingredient/path
facts, compatible-plan grouping with per-strategy evidence, signed B−A deltas and
independent output reconciliation. Null candidate remains separate from zero purchase;
INCOMPLETE/UNPROVEN and NO_PASS_CERTIFIED/UNKNOWN are preserved. No winner/selection,
new targets/safety policy, probabilities/profit, Product→lot attribution or Decision-ready
claim. Generic payable fees cannot be labelled delivery fees without captured taxonomy.
40 comparison tests passed in11.26s;202 direct procurement/serving-output/decision
regressions passed in41.91s. Targeted evidence only, not a full suite. Synthetic demo
reads offline fixed-basket fixture, no solver/simulator/DB call. S3 remains IN PROGRESS;
HTTP/FE contracts, customer choice persistence and selector remain separately OPEN.
See [feature](features/PROCUREMENT_COMPARISON.md), [notes](runbooks/S351_TASK_NOTES.md).
Older comparison absence statements below describe earlier slice boundaries only.

## S3.4.4 — CURRENT FACT (2026-10-08)

Internal procurement/1 candidate engine is implemented under [ADR-019](adr/ADR-019-internal-procurement-engine.md).
Separate explicit policy/envelope, policy-faithful infrastructure MILP, exact canonical
serving/output validation, bounded vector exclusions, optional finite certification,
fair shared deadline and independent quality dimensions. 60 procurement tests passed
in 26.39s; 206 affected-boundary regressions passed in 7.10s. This is targeted evidence,
not a full suite. Final cut-range guard: 3 affected tests passed in 2.56s (one added,
61 procurement cases now exist; unchanged group not rerun). 5/10 Product native SYNTHETIC measurements retain validated fallback
and honest UNPROVEN/INCOMPLETE labels; 10P native LIMIT with exact-validated incumbents
observed, with ~0.72s cooperative deadline overrun on the recorded 15s run.
No DB/API/schema/retention/replay/selector/winner/LLM or S1/S2 behavior change.
S3.4.4 internal slice COMPLETE within documented envelope; S3/S3.4 remain IN PROGRESS.
Real-data accuracy, universal latency and large-domain exact optimum remain unproven.
See [feature](features/PROCUREMENT_ENGINE.md), [notes](runbooks/S344_TASK_NOTES.md),
[verification](reports/S344_PROCUREMENT_VERIFICATION.md).

HISTORICAL INFORMATION: older S3.4.1–3 and S3.1/2/3 descriptions below record their
slice-time boundaries (including “no production procurement” and pending engine choice).
Those absence/approval statements are superseded only by the limited current facts
and authorization above; S1 lifecycle/no-winner persistence and policy-v1 remain unchanged.


CURRENT FACT S3.4.3 (2026-10-07): scratch bounded re-search/no-good and exact
enumeration certification implemented; old target-projection counterexample now
certifies fallback3/outlay.3 in its11-vector domain.26 small fixtures/553 vectors
match independent oracle; conservative projection false negatives are recovered
by exact search, not treated as solver proof. Broader3P/3I/6offer/6lot+3arrival
cases are certified;5/10P,4I,8offer,65,536-vector domains remain UNCERTIFIED.
Native timeout WITH incumbent observed and exact validated on10P; no exact large-
domain proof. One20s small-fixture incomplete result retained, targeted60s rerun
certified. Old evidence/production/contracts/accepted ADRs unchanged; no full
pytest/DB/API/commit/push. ADR-018 PROPOSED, no engine/policy ACCEPTED.
See [S343 report](reports/S343_PROCUREMENT_NUMERIC_BENCHMARK.md),
[task notes](runbooks/S343_TASK_NOTES.md). S3/S3.4 remain IN PROGRESS.

CURRENT FACT S3.4.2 (2026-10-07): scratch-only procurement MILP/oracle benchmark
delivered, no production procurement or accepted new policy. Full finite corpus:
37 oracle cases/169 vectors match;70 fixed baskets with complete-state parity and
247 min/max coordinate probes found no mismatch above experimental tolerance.
One required-safety case explicitly BLOCKED; two5/10 Product scale cases measured,
not exhaustively enumerated. Scale/deadline/fallback/comparator changes were rerun
only in affected groups.123 canonical serving/output/BOM tests passed in4.59s.
No full suite/DB access, production/contracts/accepted ADR changes or commit/push.
ADR-018 remains PROPOSED; S3/S3.4 remain IN PROGRESS. Native incumbent timeout
unobserved; fault-injected handler evidence is separate. See
[benchmark report](reports/S342_PROCUREMENT_BENCHMARK.md),
[task notes](runbooks/S342_TASK_NOTES.md). Product–Ingredient and lot-consumption
outputs are separate; direct Product-to-lot attribution is absent.
Additional numeric diagnostic found float64 target projection loss beyond the main
corpus; exact validation rejects it, but general repair/fallback proof is absent.
Counterexample retained; optimizer correctness is not complete for production.

CURRENT FACT (2026-10-07): S3.4.1 procurement design/formulation review delivered;
**S3.4 remains IN PROGRESS, no production procurement engine**. User explicitly
reopened ADR-017's heuristic engine choice; serving/FEFO, construction paths and
no-winner direction remain unchanged. ADR-018 is PROPOSED, not ACCEPTED.
Tiny scratch evidence: 12 synthetic cases /58 enumerated grid vectors, actual
surrogate MILP mismatch/repair and native zero-time-limit observation. No
policy-faithful MILP or realistic optimizer benchmark, DB access or new pytest.
See [design](features/PROCUREMENT_DESIGN.md),
[formulation](features/PROCUREMENT_FORMULATION.md),
[goldens](features/PROCUREMENT_GOLDEN_CASES.md), [notes](runbooks/S341_TASK_NOTES.md).
Construction targets, objective/service aggregation, supplier splits, fee/capacity
capture, bounds, deadline/ties and best_available ranking await approval.

ACCEPTED DECISION — user verification update, 2026-10-07: targeted changed-behavior
tests plus affected boundary/caller regressions are the default; explain selection.
Full suite only at integration milestones or broad changes where targeted checks
are insufficient. Small fixes rerun affected/failed tests; documentation-only edits
use document checks. Exact results and unverified scope must be reported. This
supersedes previous per-slice full-gate instructions, not historical results below.
Canonical rules: AGENTS.md, [TESTING](TESTING.md),
[full-flow scope](runbooks/FULL_TEST_FLOW.md).

- Project phase: **S3 — IN PROGRESS; S3.1 contracts/design, S3.2 pure BOM and S3.3 serving/FEFO COMPLETE**;
  S2 implementation complete / real-data evaluation pending; S1 and S0/S0.2 complete.
- S3.1 adds opt-in typed decision snapshots/output validation and provisional
  `competition_demo / 1` actual policy values (ADR-016), plus fourteen hand-calculated
  golden specifications. S3.2 adds pure dated BOM; S3.3 adds pure serving/FEFO; no procurement/recommendation computation,
  capture/retention/replay executor, schema migration or business HTTP API.
  S1 opaque DecisionUseCases lifecycle and S2 source remain unchanged.
  ADR-017 records user-approved progressive serving and future procurement/no-winner
  directions; S3.4.1 reopens only the heuristic engine choice for review. Search/tie/best_available ranking and policy-v2/persistence details
  remain pending specification; old S1/S3.1 contracts remain unchanged.
  See [decision design](features/DECISION_DESIGN.md),
  [goldens](features/DECISION_GOLDEN_CASES.md), [notes](runbooks/S31_TASK_NOTES.md).
- S2.4–S2.7: causal trained LightGBM, rolling-origin evaluation, immutable trusted local
  artifacts, purpose-specific execution metadata and retained exact-artifact replay
  implemented under ADR-015. See [trained forecast](features/FORECAST_TRAINED.md)
  and [task notes](runbooks/S2_TRAINED_TASK_NOTES.md). S3.1 is now separately authorized;
  Pure BOM exists; the full Decision executor remains absent.
- S2 final verification (2026-10-07): **767 passed in 325.76s**, no skips, one existing
  Starlette/AnyIO warning. First full attempt had one expected-table ordering failure,
  corrected; targeted schema check passed before the second full gate. No code changes
  followed the green gate. New coverage: 38 unit and 22 PostgreSQL cases; total
  308 unit / 457 PostgreSQL / 2 API. OpenAPI equals pre-edit snapshot.
- Guarded SYNTHETIC trained demo and CLI pure/persisted replay verified through fresh
  Sessions: three distinct COMPLETED UUIDs, three retained inputs/metadata, 42 predictions,
  same input/artifact despite corrected live sales/unit values. Development DB remains
  0006, unmodified; test DB migrated to 0008. Details/IDs/commands in task notes.
- Quality on suitable real observed-sales data: **NOT EVALUATED**. LightGBM superiority
  and predictive calibration on real data: **UNPROVEN**. Synthetic comparison proves
  mechanics only; see [comparison report](reports/S2_SYNTHETIC_COMPARISON.md).
- Completed: **S2.3 -- Internal baseline execution end-to-end + retained input**.
  Final verification below. Trusted internal capture/atomic JSONB start,
  versioned SHA-256, transaction-free baseline computation, validated completion
  and retained replay exist under ADR-014. Trained/evaluation extension is documented separately under ADR-015; no public API/S3.
- Completed: **S2.1 — Forecast execution contract and semantic validation**.
  Internal typed observed-sales execution contracts and pure
  semantic validation; verification/status below. ADR-012 accepts Store-local D,
  explicit Product scope, D+1..D+7, sparse captured sales and exact full coverage.
  HISTORICAL INFORMATION: S2.1 introduced no computation/readiness policy;
  S2.2 below added only baseline readiness/math; S2.3 now adds internal DB execution.
  ADR-013 records future accepted import direction, not implemented mapping/auth.
  Canonical guide: [FORECAST_EXECUTION](features/FORECAST_EXECUTION.md).
- Completed: **S2.2 — Forecast Readiness + Deterministic Quantile Baseline**.
  Baseline-specific per-Product readiness and deterministic
  Historical Quantile Baseline using exact Decimal interpolation exist; acceptance
  status below. Safe internal entrypoints revalidate capture, reject all no-history
  Products before math and always validate complete output. HISTORICAL INFORMATION (S2.2): no ForecastRun wiring; S2.3 adds it. No
  legacy adapter or public API. HISTORICAL INFORMATION: trained models/evaluation/artifact storage were absent in S2.2; ADR-015 now adds them.
- Completed: **S1.1 — Identity + Store Schema Cluster** (persistence only).
- Completed: **S1.2 — Catalog + Recipe Schema Cluster** (persistence only).
- Completed: **S1.3 — Supplier + Operational + Constraints Schema** (persistence only).
- Completed: **S1.3.1 -- Data Completeness & Source Semantics Correction**.
  Schema changed: only unknown inventory receipt dates become nullable (no default),
  with an explicit both-known expiry check. Supplier price/effective date unchanged.
  ADR-010 Data Completeness and Missing Business Facts Policy is ACCEPTED.
- Completed: **S1.4 -- Forecast + Decision Persistence Schema** (storage only).
  ADR-011 Historical Run Immutability and Snapshot Policy is ACCEPTED.
  HISTORICAL INFORMATION (S1.4): forecast/decision computation had not started.
  CURRENT FACT: S2.2 added in-memory baseline math; S2.3 persists execution; S3.2 adds pure BOM, no full Decision executor.
  Repository layer: implemented by S1.5 (see below). Public business API: NONE.
  S1.6/S1.7 now cover the authorized operational application/Pydantic flow;
  S1.7 final acceptance closes the canonical S1 operational gates.
- Completed: **S1.5 -- Persistence Access Contract + Repository Layer**.
  Nine domain modules / ten concrete repositories cover all sixteen tables.
  Store-owned access requires explicit Store scope; application supplies the shared
  synchronous Session and owns commit/rollback. No generic CRUD or public API.
  Forecast/Decision RUNNING-only lifecycle writers and inventory lock/append
  primitives exist; completed/failed run writes are rejected by repository guards.
  S1.7 implements atomic receipt/corrections; full engine validation remains future.
  Contract/manual verification: [PERSISTENCE_ACCESS](features/PERSISTENCE_ACCESS.md).
- Completed: **S1.6 -- Application Contracts + Validated Read/Write Paths**.
  Typed Product create/read, Sales
  insert/history, Forecast/Decision start/complete/fail/read and dated Recipe+lines
  read use S1.5 repositories. By-value outputs, explicit Store context, internal
  errors and application commit/rollback exist. Forecast horizon/Product validation
  and completed same-store Forecast consumption by Decision are implemented;
  full package/evaluation/provenance validation and engines remain absent.
  [APPLICATION_CONTRACTS](features/APPLICATION_CONTRACTS.md) freezes the boundary;
  [S16_VERIFICATION](runbooks/S16_VERIFICATION.md) provides usable local steps.
- Completed: **S1.7 -- Application Coverage + Inventory Transaction Closure**.
  Typed Store/Ingredient create/read,
  SupplierTerm version create/read, atomic Recipe version+lines, positive receipt
  lot+RECEIPT and justified delta COUNT_CORRECTION/MANUAL_ADJUSTMENT exist.
  Scoped lot row locks refresh current balances; exact plain Python domain arithmetic
  rejects negative results. Every mutation owns one balance+movement transaction.
  Money/unit/business-date/event-time/correction conventions are frozen in
  [APPLICATION_CONTRACTS](features/APPLICATION_CONTRACTS.md); reproducible checks
  are in [S17_VERIFICATION](runbooks/S17_VERIFICATION.md).
- Greenfield Competition Edition; no legacy backend was imported.
- Current database: **PostgreSQL**, SQLAlchemy 2.x with psycopg and synchronous
  Session. ADR-007 is ACCEPTED; ADR-003 is SUPERSEDED. The empty Alembic
  baseline is `0001_scaffold`; repository head is `0008_forecast_execution_meta`; development DB is not automatically migrated.
- Implemented business tables/models: `users`, `stores`, `store_memberships`,
  `products`, `ingredients`, `recipes`, `recipe_lines`, `suppliers`, `supplier_terms`,
  `sales_daily`, `inventory_lots`, `inventory_movements`, `business_constraints`,
  `forecast_runs`, `forecast_predictions`, `decision_runs`, `forecast_run_inputs`,
  `forecast_execution_metadata` -- eighteen business tables.
  ADR-008 Import Idempotency and Correction Policy and ADR-009 Inventory Mutation
  and Audit Policy are ACCEPTED. S1.7 enforces atomic audited receipt/corrections
  at the trusted internal application boundary. Import/FEFO and full Sales correction
  remain absent. No balance/expiry/audit trigger exists.
  Identity/store membership persistence exists; authentication/authorization does not.
  Plain Python domain implements exact nonnegative inventory balance arithmetic
  and S2.1 forecast semantic validation plus S2.2 baseline readiness/quantiles;
  trained model computation/evaluation exists in infrastructure/application; S3.2 adds pure BOM, no full Decision executor.
  S1.5 concrete repositories cover all sixteen
  tables. S1.6/S1.7 internal application use cases exist;
  public business APIs remain not started.
  Remaining Schema v1 is PROPOSAL.
- Runtime: FastAPI app factory, Pydantic v2 settings and typed health schema.
  `GET /health` is the only API operation. `/openapi.json` is framework schema
  metadata. Interactive documentation routes are disabled.
- Import/startup/health do not initialize the database or contact external services.
- Local DB: Docker Compose official PostgreSQL 17, native `pg_isready` healthcheck,
  loopback port 5432 and persistent named volume `shelfcash-postgres-data`.
  Backend remains native Python/venv; no host PostgreSQL install is needed.
- Runtime has trusted immutable local model artifact storage.
  No upload feature or public API Session dependency is implemented.
  Repositories receive a caller-owned synchronous Session.
- Canonical documents created: AGENTS, README, architecture, domain model, Schema v1
  proposal, API contract, decisions/ADRs 001–016, roadmap and testing guide.
- Local verification tooling: PowerShell/POSIX test, reset, seed and DB status
  scripts. Reset is restricted to development/test, local hosts and explicit
  `shelfcash`/`shelfcash_test` databases; test permits only the latter. It recreates
  `public`, migrates and optionally checks the seed baseline. Status reports
  reachability/database/server/revision/head and table counts via a fresh read-only
  transaction. `AllowUnmigrated` permits inspection before migration.
- Tests are organized into unit/integration/api/e2e/fixtures; no e2e/business seed
  or executable golden simulator scenarios exist yet. S3.1 adds documented golden
  specifications and executable contract tests only. Seed writes no business rows.
- [Full test flow](runbooks/FULL_TEST_FLOW.md) and
  [scaffold feature guide](features/SCAFFOLD.md) provide manual HTTP and persisted
  DB verification. All execution/testing/demo preparation remains local; no Kaggle
  or hosted notebook dependency. S1.1/S1.2/S1.3/S1.4 schema clusters are implemented; all
  S2.3 adds internal retained baseline persistence/replay; public business APIs remain absent;
  S1.5/S1.6/S1.7 provide
  internal persistence/application paths. Seed verifies schema, writes no rows.
- Integration tests own only separate `shelfcash_test`, created if absent by the
  local role. Tests run sequentially and never reset normal development state.

## Verification

### S3.3.1 output validation -- CURRENT FACT, 2026-10-07

- COMPLETE serving output now independently validates exact Product/recipe/BOM,
  eligible lot/day/path continuity/expiry/FEFO and Ingredient reconciliations,
  snapshot/issue consistency, full grids and blocked no-partial rows.
- Same public fields/serving_fefo/1 policy, unchanged domain/use case, S1/S2/S3.1/S3.2
  contracts/schema/API/lifecycle. Output invariant violations raise validation
  errors, not successful or fabricated quantities. No simulator replay in validator.
- Targeted 202 cases passed (58 initial mutation +30 serving +33 BOM +81 S3.1),
  plus two later extreme-output checks passed separately (60 mutation cases now).
  Manual milk A15/B7.5 unchanged. Four output JSON schemas match old S3.3 ZIP.
- Validation does not prove progressive fairness, optimality, captured-source
  authenticity or full Decision readiness. Same numeric limits; no new intermediate
  rejection found in exercised outputs. No full suite/PG/dev DB/commit/push.
  [Notes](runbooks/S331_TASK_NOTES.md), [feature](features/SERVING_FEFO.md).
  S3.3.1 COMPLETE within authorized hardening scope; S3 remains IN PROGRESS.

### S3.3 serving/FEFO -- CURRENT FACT, 2026-10-07

- Pure `simulate_serving(ServingSimulationInput)` revalidates captured input and BOM;
  progressive proportional Product filling, dated recipe intensities, independent
  LOW/BASE/HIGH states, exact Product–Ingredient contributions and separate lot
  consumption/balances; no direct Product-to-lot attribution edge.
- Typed explicit hypothetical arrivals; future-dated operational lots excluded,
  no inferred inbound. FEFO expiry/received_date/UUID; expiry usable through X,
  close-X leftover expires once. Unknown source dates/costs/issues remain intact.
- `serving_fefo/1`: exact rational state and typed canonical ratio + Decimal view
  precision50/HALF_EVEN. No epsilon or rounded-view stock subtraction. Numeric/data
  blockers return no partial serving rows; never full Decision READY.
- 30 new cases; serving + BOM + S3.1 **144 passed in 2.98s**; recipe/inventory shapes
  **9 passed, 43 deselected in 0.11s**. Numeric hardening rerun **6 passed,
  24 deselected in 0.87s**. Manual milk demo A15/B7.5 passed without DB.
  No full suite/PG/API test run for this additive pure scope.
- ADR-017 partially supersedes ADR-016/011 policy intent only. Accepted future
  construction/heuristic/no-winner directions are not implemented: policy-v1
  snapshot/package validators and S1 writer lifecycle remain unchanged.
- No procurement, budget allocator, selector, cost valuation, capture/retention/
  replay, persistence migration or HTTP. Existing source/tests/ADRs protected by
  pre-edit hash audit; no commit/push/DB commands or next-slice work.
  [Feature](features/SERVING_FEFO.md), [notes](runbooks/S33_TASK_NOTES.md).

### S3.2 pure dated BOM -- CURRENT FACT, 2026-10-07

- `expand_bom(PreparedDecisionInput)` revalidates and uses captured values only.
  LOW/BASE/HIGH, dated whole-yield/loss contributions and exact exported-row totals;
  complete Product/day scope, units/provenance/issues retained. No DB loader or API.
- Typed COMPLETE/DATA_BLOCKED/ARITHMETIC_BLOCKED. Missing/empty recipe and numeric
  failure return no partial quantities. Other snapshot blockers persist even when
  BOM computes; whole Decision readiness is DATA_BLOCKED or NOT_ASSESSED, never READY.
- Rational calculation, one precision50/HALF_EVEN division, exact dynamic-precision
  sums; explicit exponent/capacity/output-boundary behavior in [BOM](features/BOM.md).
- Targeted evidence: BOM + S3.1 **111 passed in 0.66s**; recipe contracts **7 passed,
  45 deselected in 0.05s**. Final BOM group **33 passed in 0.25s**, including later half-even/near-one-loss
  assertions; document/WIP checks recorded in
  [S32 notes](runbooks/S32_TASK_NOTES.md). No full suite/PostgreSQL rerun for this
  pure additive slice. Historical S3.1 848 pass is not a new S3.2 run.
- No serving/budget/no-winner policy decision, FEFO, procurement, simulator,
  recommendation, capture/replay/persistence or next-slice implementation.
  S1/S2 and pre-existing S3.1 source/tests/ADRs unchanged; no commit/push, migration/reset.

### S3.1 contracts/design — CURRENT FACT, 2026-10-07

- 81 new contract cases; final targeted **225 passed in59.16s** including existing
  PostgreSQL S1 compatibility/fresh-session evidence. Final unit/API gate125 passed.
- Final supported `./scripts/test.ps1 all`: **848 passed in300.21s**, no skips,
  one existing Starlette/AnyIO warning (389 unit /457 PostgreSQL /2 API).
  Earlier full841 passed against an intermediate snapshot; repeated because new
  timezone/DST/exponent/scope checks and module separation followed it.
- All original S1/S2 source/tests/migrations unchanged; generated OpenAPI unchanged,
  only /health. Read-only development status remains0006, no migration/reset/seed.
- Manual supplied-fixture validation returns TARGETS_MET LEAN9; no computation or
  accuracy claim. Fourteen golden cases are specifications, not executed simulators.
  Snapshot immutable; no input hasher/retention/replay or Decision persistence adapter.
- No-winner business outcomes conflict with existing S1 completed storage requirements;
  HISTORICAL S3.1: those directions were OPEN. ADR-017 now approves serving and
  future procurement/no-winner direction; detailed search/ranking/wiring still pending.
- S3.1 COMPLETE within authorized boundary; S3 overall IN PROGRESS. HISTORICAL INFORMATION: S3.2 had not started at the S3.1 gate; current S3.2 status above.
  No commit/push. Commands, limitations and rollback: S31_TASK_NOTES.

### S2.3 corrective patch - CURRENT FACT, 2026-10-07

Explicitly authorized fix for two review P2 findings only. Baseline/contracts/schema/
retention/API unchanged; accepted ADR-014 intent clarified, not expanded.
- Narrow SQLAlchemy/psycopg commit classifier uses types/SQLSTATE/disconnect evidence;
  programming/integrity/known transaction failures cannot reconcile into success.
- Owned-Session rollback/close/invalidation preserves primary errors; secondary failures
  remain notes/trusted logs. Fresh-Session reconciliation reports run ID/actual state,
  preserves durable COMPLETED after bugs and keeps original execution cause when
  recording/verification also fails. S1 source unchanged.
- 35 new regression cases; initial targeted **200 passed in33.33s**, no skips. Fresh
  PostgreSQL Sessions assert durable state; actual after_commit callbacks and server
  40001 tested. Transport lost-ack scenarios use typed fault injection, not real network
  interruption. Classifier scope/unsupported cases: FORECAST_EXECUTION.
- First full gate 706 passed/1 failed in312.48s: architecture assertion rejected direct
  application close. Moved only concrete cleanup/diagnostics to infrastructure, keeping
  the assertion unchanged; follow-up targeted **238 passed in33.13s**. Second supported
  full gate **707 passed in283.16s**, zero skips, one existing Starlette/AnyIO warning;
  270 unit /435 integration /2 API. Two full attempts because the first failed.
  No development reset/migration, commit or
  next slice. Historical original S2.3 gate below remains separate evidence.
- Read-only development status still shelfcash/0006, sixteen empty business tables;
  no automatic upgrade to0007. Generated OpenAPI unchanged. Pre-edit hash audit shows
  eight files modified, two added, none deleted; all other WIP/backendContext preserved.
  Corrective patch COMPLETE; no remaining blocker found in the two authorized P2 paths.


### S2.3 original acceptance - HISTORICAL INFORMATION

S2.3 COMPLETE; S2 overall IN PROGRESS. Windows/Python 3.11.9, 2026-10-07:
- 40 new tests: 10 canonical serialization units +30 real PostgreSQL execution tests.
  Final targeted 165 passed in 20.29s; expanded targeted 494 passed/1 bootstrap table
  expectation failure, then exact fix and bootstrap targeted pass. No runtime gate failure.
- Supported `./scripts/test.ps1 all`: 672 passed in 273.90s, zero skips, one existing
  Starlette/AnyIO deprecation warning; 252 unit /418 integration /2 API. Full run count 1.
- Actual snapshot isolation/read-only flags and concurrent committed corrections between
  SELECTs preserve captured timezone/units/sales; all requested Products incl inactive,
  sparse zero and inclusive window remain. Preflight no history creates no run.
- Fresh Sessions assert exact 14 prediction keys/Decimal values/actual metadata and
  retained JSONB/digest. Start rollback after flush and before commit leaves no aggregate.
  Completion downstream CHECK after 14 actual prediction flush leaves no partial rows;
  FAILED retains input/sanitized summary. Commit acknowledgment loss reconciles true
  state, verified COMPLETED is not failed; unavailable state reports UNKNOWN with run ID.
  Programming errors after commit are not converted to success; failed failure recording
  reports actual known state. No DB transaction or ForecastRun lock spans computation.
- Replay ignores corrected operational values; persisted replay creates new UUID/same
  digest and preserves old run. Pure replay still works with removed Products; persisted
  replay rejects missing identity. Missing S1 retention/corruption/version mismatch reject.
- Guarded shelfcash_test migration roundtrip preserves runs/predictions and demonstrates
  retained-input loss on downgrade. Alembic check no new operations; current/head 0007.
  pip check passes; runnable isolated manual execution/replay verifies fresh persisted rows.
- Development db-status read-only: shelfcash stays 0006, sixteen empty business tables,
  revision count1; expected repository head0007/at_head=false. No development reset,
  migration or seed. Deploying internal execution on development requires explicit upgrade.
- Generated/live full OpenAPI equal pre-edit, /health only, exact live health200/payload;
  own hidden verifier stopped. 194 pre-edit files preserved; all prior accepted ADRs,
  S1 lifecycle/contracts, S2.1 source/tests, S2.2 math tests and backendContext unchanged.
  S2.2 source shares identity constants only. Seven older tests update schema/head
  assertions only. AST/local doc links/diff reviewed. No commit or native POSIX claim.
- ADR-014 records user-authorized retention/execution decisions; empty warnings marked
  CURRENT FACT, stale computation/lifecycle statements corrected. No evaluated/calibrated
  predictive quality, historical unit reconstruction, point-in-time availability,
  trained model/adapter/artifact service, public API/RBAC/import/worker/TTL or S3.
- Rollback code/docs/tests +0007 structure only. Downgrade destroys retained inputs,
  leaves run/prediction history; export/backup before real-history downgrade.


### S2.2 final acceptance — HISTORICAL INFORMATION

S2.2 COMPLETE; S2 overall IN PROGRESS. Windows/Python 3.11.9, 2026-10-07:
- Frozen new acceptance tests first failed collection with expected missing baseline
  module. New baseline unit coverage: **42 passed**. Combined S2.1/S2.2 units:
  **123 passed**, no DB required for computation/readiness.
- Final targeted command in FORECAST_EXECUTION: **233 passed in 169.82s**
  (123 unit, 110 actual PostgreSQL application/repository/S1 empty-completion
  regressions). No new fake baseline integration/persistence test.
- Supported `./scripts/test.ps1 all`: **632 passed in 503.27s** (242 unit,
  388 integration, 2 API), no skips; one existing Starlette/AnyIO warning.
  Exactly **one full regression run**, after targeted green; no failure/rerun.
- Baseline-specific empty history reports NOT_READY_NO_HISTORY, count 0, no first/
  last dates; >=1 observation including zero is READY. Mixed scope reports every
  missing-history Product in UUID order and rejects before any prediction math.
- Exact known linear quantiles, zero/repeated/outlier participation, sparse missing
  days, unsorted quantities without input mutation and ambient Decimal precision/
  exponent-bound independence pass. Same input yields identical result/metadata.
  Exact 14-key coverage and date-then-UUID ordering pass; mandatory final canonical
  validator rejects missing/duplicate/wrong Product/unordered corrupted output.
  Public internal entrypoints revalidate malformed prepared instances first.
- Baseline identity is historical_quantile_baseline / 1, artifact None, no metrics/
  evaluation/trained metadata. Frozen readiness values and plain domain computation
  import without application/Pydantic/ORM/HTTP dependencies. No DB query/write.
- Both canonical-doc examples execute; actual sparse Mon=10/Wed=0 baseline yields
  2.5/5/7.5 for seven dates 2026-09-12..2026-09-18, count 2, no Tuesday zero.
  These are mathematical fixtures, not measured accuracy.
- Supported Compose up/wait healthy; PostgreSQL 17.11. Alembic check: No new upgrade
  operations detected; current/head unchanged 0006_forecast_decision_persist.
  pip check passes. Tests own only shelfcash_test; no development reset/seed.
  Read-only development db-status remains one revision row and sixteen empty tables.
- Entire generated/live OpenAPI equal pre-S2.2 baseline, only /health; live exact
  HTTP 200/payload unchanged, own verifier stopped. Saved 190-file pre-edit hashes
  preserve existing S1/S2.1 source/tests/schema/migrations/ADRs/dependencies and WIP,
  including backendContext folder/zip. Only six existing docs changed for S2.2;
  four new slice files. Syntax, 39 local docs links, diff/whitespace reviewed.
- SHA 10197895255af393607514266aaee95703d725fd unchanged, no commit; S2.1 WIP
  preserved. Native POSIX runtime not checked/claimed. No architecture change or
  new/modified ADR; explicitly user-authorized baseline policy documented separately
  from historical ADR-012 deferral. No S2.3 scope is frozen in canonical ROADMAP.
- No persistence integration/ForecastRun completion, public business API, LightGBM,
  legacy adapter, features, metrics/backtesting/model comparison, durable input/
  artifact retention, hashing or S2.3 implementation. Rollback only new S2.2 modules/
  tests and its precise docs edits; no DB/API/migration downgrade.

### S2.1 final acceptance — HISTORICAL INFORMATION

S2.1 COMPLETE; S2 overall IN PROGRESS. Windows/Python 3.11.9, 2026-10-07:
- Frozen acceptance tests first produced the expected missing-module collection
  error before implementation. New S2.1 unit coverage: **81 passed**.
- Final targeted command in FORECAST_EXECUTION: **164 passed** (119 unit, 45 actual
  PostgreSQL integration including 1 new S1 empty-completion regression), 25.70s.
- Supported `./scripts/test.ps1 all`: **590 passed** (200 unit, 388 integration,
  2 API), no skips; existing Starlette/AnyIO deprecation warning, 233.05s.
  Exactly **one full regression run**, after targeted green; no failure/rerun.
- Explicit request scope/window, Store-local D+1..D+7, month/year/leap-date edges,
  timezone boundary rejection, immutable sparse zero capture, canonical Store/
  Product/unit/date checks, exact finite ordered Decimal and deterministic ordering
  pass. Exact 14-key output accepted; empty/duplicate/missing/extra/wrong-scope/date
  outputs rejected. No integer rounding or fake facts/model metadata.
- S1 code/tests unchanged; new PostgreSQL regression verifies committed empty
  completion with supplied start metadata, read autobegin and terminal rejection
  through fresh Sessions. S2 coverage does not tighten S1 lifecycle.
- Initial Docker engine unavailable; installed Docker Desktop started, supported
  Compose up/wait succeeded. PostgreSQL 17.11 healthy. Integration owns only
  shelfcash_test; no development reset. Read-only development db-status remains
  head 0006_forecast_decision_persist, sixteen empty business tables, one revision row.
- Executable canonical-doc example produces 14 keys for 2026-09-12..2026-09-18
  from two requested Products, preserving one explicit zero observation.
  Entire generated and live OpenAPI equal original baseline; live health exact
  HTTP 200/payload, verifier stopped. Only /health remains a public operation.
- Original tracked source/tests/schema/migrations/accepted ADRs/API_CONTRACT/
  dependencies match saved hashes; only precise existing docs changed. Unrelated
  backendContext folder/zip preserved. Syntax, 60 local doc links, diff and whitespace
  reviewed. No commit; no native POSIX runtime verification claimed.
- Canonical docs and ADR-012/013 distinguish implemented validation, accepted
  observed-sales/future import direction and deferred model/readiness/retention/
  evaluation/recovery. No computation, orchestration, execution persistence, public
  business API, import/auth implementation, schema/migration/dependency or next slice.
  Rollback only new S2.1 modules/tests and precise docs; no DB downgrade.

### S1.7 final acceptance -- CURRENT FACT

S1.7 COMPLETE; S1 overall COMPLETE. Verified on Windows/Python 3.11.9, 2026-10-06:
- New S1.7 targeted coverage: **106 passed** (52 unit/domain, 54 actual PostgreSQL
  integration). Final targeted command after authorized reset/upgrade includes
  unchanged S1.6 regression: **188 passed** (90 unit, 98 integration).
- Supported test.ps1 all: **508 passed** (119 unit, 387 integration, 2 API), no skips;
  one existing upstream Starlette/AnyIO deprecation warning. Full regression run
  count for S1.7: **1**, only at final gate after targeted green; no rerun needed.
- Store/Ingredient/SupplierTerm create/read and Recipe atomic version+lines pass
  scoped validation, exact Decimal, required dates, duplicate/period conflicts and
  typed fresh-session retrieval without silent overwrite/auto-close.
- Positive receipt creates exactly one lot and RECEIPT together. Tracked expiry
  is required, unknown received_date stays NULL, source refs stay paired, unit/cost
  remain canonical, aware supplied events preserve their instant normalized UTC.
- Correcting deltas require COUNT_CORRECTION/MANUAL_ADJUSTMENT and nonblank note;
  negative results fail without new history. Locked materialized balance and
  appended movement commit together. Pure domain arithmetic stays exact despite
  small ambient precision and imports without HTTP/ORM/infrastructure.
- Recipe downstream CHECK after header/line flush leaves no aggregate; receipt
  downstream failures after lot or movement flush leave no partial state; movement
  CHECK after balance flush restores old balance/history. All six new writers'
  commit failures roll back. Caller-owned transactions remain untouched; reads
  neither flush nor commit pending work. Success/failure assertions use fresh Sessions.
- PostgreSQL pg_stat_activity confirms actual second-writer Lock wait; first -5
  and second -7 yield 50 ->45 ->38 with three movements summing to 38. Cached old
  balance also refreshes correctly. Complete S1 operational application chain passes;
  Supplier identity remains the explicitly authorized repository prerequisite.
- Compose PostgreSQL 17.11 healthy; supported development reset, Alembic upgrade/
  current and no-op seed succeed. Final db-status: shelfcash at unchanged head
  0006_forecast_decision_persist, sixteen empty business tables and one revision row.
  Tests own only shelfcash_test. Alembic check detects no new upgrade operations;
  pip check reports no broken requirements.
- 53 pre-S1.7 protected-file hashes match: models/migrations/accepted ADRs/public
  API contract/dependencies/all existing tests unchanged. All 160 pre-existing
  files remain present; changes stay within authorized extensions/docs. Prior S1.6
  WIP is preserved. Application import/construction does not connect to DB.
  Exact generated/live OpenAPI comparison and live health 200/payload pass;
  verifier server stopped. Diff/status, document links, AST and whitespace reviewed.
- Canonical contracts/feature docs/testing/state/roadmap/manual guide distinguish
  current paths from historical schema-only absence claims. No schema/migration,
  public business API, auth/actor enforcement, import/computation engine, commit or
  S2+ implementation. Native POSIX runtime is not claimed. Rollback affects only
  S1.7 application/domain/tests/docs, with no database rollback.

### S1.6 final acceptance -- HISTORICAL INFORMATION

S1.6 COMPLETE. Verified on Windows/Python 3.11.9, 2026-10-06:
- Targeted application command: **82 passed** (38 contract/unit, 44 actual
  PostgreSQL integration). Supported test.ps1 all: **402 passed** (67 unit,
  333 integration, 2 API), no skips, one existing Starlette/AnyIO warning.
- Product typed create/scoped read and canonical Sales insert/inclusive ordered
  history pass with exact Decimal/NULL, conflict/no-overwrite and Store isolation.
  Effective Recipe+typed lines verifies inclusive/open-ended/no-version behavior.
- Forecast/Decision start/complete/fail/read, current locked lifecycle, terminal
  guards, stale cached status refresh, horizon/Product/terminal-time checks and
  completed same-store Forecast consumption pass. Outputs are by-value; JSON/input
  mutations do not change stored values. Supplied fixtures do not claim engines.
- Explicit commit and failure rollback, untouched caller-owned transaction, read
  no-commit/no-autoflush, commit failure and fresh-session persistence pass.
  A Forecast downstream CHECK failure rolls back an already flushed prediction;
  a Decision downstream OperationalError rolls back all flushed completion fields.
  Known named unique conflicts map to application errors; unexpected DB errors
  propagate after rollback. Repository transaction-ownership regressions pass.
- Compose PostgreSQL 17.11 healthy. Supported authorized development reset,
  upgrade/current/seed/status pass; sixteen business tables remain empty at
  0006_forecast_decision_persist with one revision row. Tests own only shelfcash_test.
  Alembic check: No new upgrade operations detected. pip check passes.
- Pre-S1.6 protected hashes confirm models/migrations/accepted ADRs/API_CONTRACT/
  dependencies unchanged. Application import/construction causes no DB connection;
  generated/live OpenAPI equal saved baseline, live health exact unchanged HTTP 200.
  Verification server stopped. Syntax/type/dependency/query/whitespace/link audits
  and diff/status review pass. Initial working tree was clean; no prior WIP removed.
- APPLICATION_CONTRACTS, S16_VERIFICATION and S16_TASK_NOTES document the frozen
  scope, limitations, rollback and manual verification. Current architecture,
  roadmap/testing/schema/domain and affected feature docs explicitly distinguish
  S1.6 application behavior from historical schema/repository-only limitations.
- No schema change/migration, public business API, engine, inventory mutation,
  import/correction, authentication/authorization, commit or S2+ work. Native POSIX
  runtime is not claimed. S1 overall remains IN PROGRESS; remaining gates below.

### S1.5 final acceptance -- HISTORICAL INFORMATION

S1.5 -- Persistence Access Contract + Repository Layer COMPLETE.
Verified on Windows/Python 3.11.9, 2026-10-05:
- Targeted repository integration + unit contract/guard command: **80 passed**
  (65 real PostgreSQL integration, 15 unit). Supported test.ps1 all: **320 passed**
  (289 integration, 29 unit, 2 API), no skips; one existing Starlette/AnyIO warning.
- All sixteen tables are covered by nine domain modules / ten concrete repositories.
  Store-scoped reads, dated Recipe/SupplierTerm/Constraint queries, chronological
  Sales history, inventory lot/movement reads and caller transactions pass.
- RUNNING Forecast/Decision completion/failure, RUNNING-only prediction append,
  repeated/terminal-write rejection, copied JSON, Store isolation, row-lock lifetime,
  stale cached status refresh and commit/close/fresh-session reload pass.
  Multi-repository rollback leaves neither run; inventory movement failure rolls
  back the flushed lot change. No operational mutation or computation service.
- Compose PostgreSQL 17.11 healthy. Authorized supported development reset and
  Alembic upgrade pass; head stays 0006_forecast_decision_persist, sixteen empty
  business tables. Integration fixtures own only shelfcash_test.
- Alembic check: No new upgrade operations detected. All models/migrations/accepted
  ADRs/API_CONTRACT/pyproject hashes match the start-of-review baseline. No migration.
- App import, generated and live OpenAPI equal baseline; live health returns exact
  unchanged HTTP 200 payload. Verification server stopped. pip check and syntax/
  transaction-ownership/structure audits pass; diff/status reviewed, WIP preserved.
- Known access limit: tracked ORM/direct SQL mutation can bypass repository guards;
  full package/horizon/authorization and audited inventory mutation remain future.
  S1 overall IN PROGRESS under ROADMAP. No business API, engines, commit or S2+ work.

### Earlier S1.5 insert/read verification -- HISTORICAL INFORMATION

S1.5 insert/read baseline verified on Windows/Python 3.11.9, 2026-10-05:
- `./scripts/test.ps1 all`: **310 passed** (29 unit, 279 integration, 2 API),
  one existing Starlette/AnyIO deprecation warning, no skips. New S1.5 coverage:
  55 repository integration and 15 unit tests. Earlier standalone targeted run:
  47 passed before final coverage additions; all final additions pass in full suite.
- All sixteen tables round-trip through concrete repositories and close/fresh
  Session reads. Explicit Store scope, identity-map isolation, exact Decimal/NULL/
  JSON, inclusive/open-ended/inactive date queries, duplicate/no-upsert/new-row
  guards, caller transaction visibility/rollback and same-store FK failures pass.
- Inventory fixture transactions prove valid balance+movement commit, failed
  movement rolls back an already flushed balance, and scoped SELECT FOR UPDATE
  refreshes cached balance and holds its lock until caller rollback. These tests
  do not implement an inventory mutation service. Generated Forecast parent flush
  and predictions remain rollbackable; no append-to-existing-run writer exists.
- Protected-file SHA-256 checks match pre-S1.5: all models/migrations, accepted
  ADRs, API_CONTRACT and pyproject unchanged. Generated OpenAPI exactly matches
  pre-S1.5. Existing health/import/domain independence and migration/metadata tests
  pass. pip check passes. No schema/public API/dependency/engine implementation.
- Read-only supported db-status reports development shelfcash at head
  0006_forecast_decision_persist, sixteen empty business tables and one revision row;
  no development reset or business seed write. Tests own only shelfcash_test.
- Contract and reproducible manual verification are in PERSISTENCE_ACCESS and
  S15_TASK_NOTES; current docs/roadmap/testing/runbook updated, prior WIP preserved.
  New-file syntax and scope/diff/whitespace reviewed; no commit or next slice.
  PowerShell runtime verified; POSIX wrappers unchanged, no new POSIX runtime claim.
- Limit: repositories return tracked mutable ORM rows; completed-run lifecycle/
  immutability, full package/horizon validation and audited operational inventory
  mutation remain future authorized use cases. S1 overall remains IN PROGRESS.

### S1.4 acceptance -- HISTORICAL INFORMATION

S1.4 verified on Windows/Python 3.11.9, 2026-10-05:
- Targeted test_forecast_decision_persistence.py: **58 passed**, actual isolated
  shelfcash_test. Run status/windows/time/metadata, finite ordered quantiles, business
  key, same-store references, exact fresh-session JSON/Decimal, completed minimum
  fields, partial/failed outputs, JSON null rejection, independent copied input values,
  same-fingerprint reruns and zero/equal quantiles tested. Fixtures are not engine output.
- `./scripts/test.ps1 all`: **240 passed** (14 unit, 224 integration, 2 API), one
  existing Starlette/AnyIO deprecation warning, no skips. All previous tests preserved;
  metadata/migration agreement and fresh/down/up succeed. Initial bootstrap assertion
  expecting thirteen tables was updated to sixteen; final complete rerun is green.
- Compose config/up --wait/ps pass; PostgreSQL 17.11 healthy. Development reset,
  upgrade/current/status/seed pass at 0006_forecast_decision_persist, sixteen empty
  business tables and one revision row. S14_VERIFICATION read-only column/constraint/
  index/row commands execute successfully; three run row queries return [].
- Generated/live OpenAPI exactly matches saved pre-S1.1 baseline. App/model/domain
  imports with DB connection forbidden pass. Live /health returns exact unchanged
  HTTP 200 payload; verification server stopped. pip check passes.
- Pre-task hashes confirm prior models/migrations 0001-0005/accepted ADRs/API_CONTRACT
  unchanged; only model registration is extended. Scope/diff/status/whitespace and
  new-file syntax reviewed. No additional tables, dependencies, API, repository,
  service, computation, snapshot builder/hasher or S2 implementation; no commit.
- PowerShell commands runtime verified. POSIX wrappers unchanged; historical syntax
  validation only, no native POSIX runtime claim. No remaining S1.4 acceptance blocker.

### S1.3.1 acceptance -- HISTORICAL INFORMATION

S1.3.1 verified on Windows/Python 3.11.9, 2026-10-05:
- Targeted test_data_semantics_correction.py: **9 passed**, actual isolated
  shelfcash_test. ORM NULL/raw SQL omitted/NULL receipt persistence via fresh sessions,
  no fabricated snapshot date/default, strict supplier NULL rejection, exact pack cost,
  known-row downgrade/re-upgrade and transactional refusal with unknown receipt dates.
- `./scripts/test.ps1 all`: **182 passed** (14 unit, 166 integration, 2 API),
  one existing Starlette/AnyIO deprecation warning, no skips. All S1.1/S1.2/S1.3
  regressions and metadata/migration agreement pass. Fresh upgrade and downgrade/
  re-upgrade on isolated PostgreSQL pass. No tests mutate normal development state.
- Compose config/up --wait/ps pass; PostgreSQL 17.11 healthy. Development reset,
  upgrade/current/status/seed pass at 0005_data_semantics_correction; thirteen empty
  business tables and one Alembic row. Read-only inspection confirms received_date
  nullable/no default, strict supplier columns nonnullable/no defaults and expiry check.
- Application/model/domain imports with psycopg connection forbidden pass. Generated
  and live OpenAPI exactly match saved pre-S1.1 baseline. Live /health is HTTP 200
  with unchanged payload; verification server stopped. pip check passes.
- Scope/diff/status/whitespace reviewed. Pre-task hashes prove all prior models except
  InventoryLot, all migrations including 0004, accepted ADRs including 008/009 and
  API_CONTRACT preserved byte-for-byte. No new tables, services, repositories, import
  implementation or public endpoints. Existing S1.3 WIP preserved; no commit.
- PowerShell runtime verified; POSIX wrappers unchanged, historical syntax-only
  verification retained. No POSIX runtime claim. No remaining acceptance blocker.

### S1.3 acceptance -- HISTORICAL INFORMATION

S1.3 verified on Windows/Python 3.11.9, 2026-10-05:
- Targeted `test_supplier_operational_constraints.py`: **80 passed**, actual isolated
  shelfcash_test. Six-model commit/close/fresh-session reload, many-to-many terms,
  version/active overlap, pack/minimum/cost/lead/shelf-life, canonical sales identity,
  lot expiry/unit/store, movement type/sign/reference/lot consistency, controlled
  scope/registry and NULL STORE uniqueness tested. Boundaries/limits explicit.
- `./scripts/test.ps1 all`: **173 passed** (14 unit, 157 integration, 2 API), one
  existing Starlette/AnyIO deprecation warning, no skips. All prior S1.1/S1.2 tests
  remain passing; metadata/migration comparison passes. Fresh reset/upgrade and
  0004->0003->head succeed on shelfcash_test; bootstrap reaches scaffold/base and
  re-upgrades. No test mutates ordinary development state.
- Compose config/up --wait/ps pass; PostgreSQL 17.11 healthy. Development reset,
  upgrade/current, seed/status pass at 0004_supplier_ops_constraints. Exactly thirteen
  empty business tables and one Alembic revision row. S13_VERIFICATION's actual
  read-only inspection commands execute successfully, including columns/constraints
  and six domain row queries returning []. No S1.4/import/order tables present.
- App/model/domain import with psycopg connection forbidden passes; generated
  OpenAPI exactly matches saved pre-S1.1 baseline. Live /health HTTP 200 unchanged;
  live /openapi.json identical, verification server stopped afterward.
- pip check passes. Diff/status/scope/whitespace reviewed; prior business models and
  migrations, API_CONTRACT, API/domain/repository code and dependencies unchanged.
  ADR-008/009 indexed ACCEPTED, no commit, no remaining S1.3 acceptance blocker.
- PowerShell workflow runtime-verified; POSIX wrappers unchanged, previous syntax
  checks only. No POSIX runtime verification claimed for this slice.

### S1.2 acceptance — HISTORICAL INFORMATION

S1.2 verified on Windows/Python 3.11.9, 2026-10-05 (state before S1.3):
- Targeted `test_catalog_recipe_schema.py`: **51 passed** on shelfcash_test. Covers
  four-model commit/close/fresh-session reload, exact Decimal/defaults, scoped SKUs
  and nullable semantics, PK/FK/check/exclusion, inclusive/open-ended dates, version,
  yield/loss, quantities, duplicate lines, unit/cross-store integrity and parent updates.
- `./scripts/test.ps1 all`: **93 passed** (14 unit, 77 integration, 2 API), one
  existing upstream Starlette/AnyIO warning, no skips. S1.1 regressions preserved;
  metadata comparison passes. Fresh reset/upgrade and 0003->0002->head pass; bootstrap
  also downgrades through 0001/base and re-upgrades. Tests own only shelfcash_test.
- `docker compose config --quiet`, up, up --wait and ps succeed: PostgreSQL 17.11
  healthy. Development reset, upgrade/current, seed and status succeed. Head is
  0003_catalog_recipe; one revision row and seven empty business tables. Direct
  SQL inspection confirms constraints; no future tables exist.
- App/model/domain imports succeed with psycopg connection forbidden. OpenAPI
  matches the saved pre-S1.1 schema exactly; live /health HTTP 200 payload unchanged,
  live /openapi.json identical, verification server stopped afterward.
- `pip check` passes. Diff/status/scope reviewed, whitespace check passes. API_CONTRACT,
  public API code, domain code, repository layer, accepted ADRs/dependencies unchanged.
  No commit; no remaining S1.2 blocker. No BOM, API, auth or S1.3 implementation.
- PowerShell workflow runtime-verified. POSIX wrappers unchanged; historical syntax
  validation only, no POSIX runtime verification claimed for this slice.

### S1.1 acceptance — HISTORICAL INFORMATION

S1.1 verified on Windows/Python 3.11.9, 2026-10-05 (state before S1.2):
- Targeted `test_identity_store_schema.py`: **22 passed**, real shelfcash_test,
  covering metadata/migration agreement, fresh-session round trips, PostgreSQL
  constraints/defaults and UTC timestamp semantics. Development reset/upgrade/head,
  seed and table-count inspection pass at `0002_identity_store` with empty tables.
- `./scripts/test.ps1 all`: **42 passed** (14 unit, 26 integration, 2 API), one
  existing upstream Starlette/AnyIO deprecation warning; no skips. Integration
  writes/downgrades/resets own only shelfcash_test. Downgrade through the original
  scaffold and re-upgrade to head pass; model/migration comparison has no drift.
- Docker Compose up/ps: PostgreSQL 17.11 healthy. The feature guide's direct SQL
  column/constraint inspection command succeeds. Development status after tests/HTTP
  remains `alembic_version: 1`, `users: 0`, `stores: 0`, `store_memberships: 0`.
- App/model/domain imports with psycopg connection forbidden succeed; OpenAPI
  matches the pre-S1.1 schema exactly. Live `/health` returns unchanged HTTP 200
  payload, and `/openapi.json` adds no business operations; server stopped afterward.
- `pip check`: no broken requirements. Diff/status/scope and whitespace reviewed;
  API_CONTRACT, app API/schemas, dependencies, domain packages and repository layer
  untouched; no commit. No remaining S1.1 acceptance blocker.
- Storage semantics/known limits are recorded in DATABASE_SCHEMA and
  [STORE_IDENTITY](features/STORE_IDENTITY.md). POSIX scripts unchanged; prior syntax
  verification only, no native POSIX runtime verification claimed.

### S0.2 acceptance — HISTORICAL INFORMATION

S0.2 verified on Windows/Python 3.11.9, 2026-10-05:
- `docker compose config`, `docker compose up -d postgres`, `docker compose ps`:
  succeed; service healthy, named volume mounted. PostgreSQL server is 17.11.
- PowerShell status/reset/seed and Alembic upgrade/current succeed against fresh
  PostgreSQL. Persisted public state is only revision `0001_scaffold`, one row.
- `.venv/Scripts/python.exe -m pytest` and `./scripts/test.ps1 all`:
  **20 passed** each (14 unit, 4 integration, 2 API), one existing upstream
  Starlette/AnyIO deprecation warning. No skips; real PostgreSQL integration tests.
- `pip check` passes; psycopg/psycopg-binary 3.3.6 installed. App import and exact
  saved-before/generated-after OpenAPI comparison pass. Live Uvicorn `/health`
  returns unchanged HTTP 200 payload; `/openapi.json` is identical. Server stopped.
- `docker compose up -d --force-recreate --wait --wait-timeout 90 postgres`:
  healthy; subsequent fresh status retained revision/table state in the named volume.
  Reset without seed, upgrade/current, standalone seed and final status also pass.
- All five POSIX wrappers pass Git Bash `bash -n`: syntax-checked only, no native
  POSIX runtime verification. PowerShell workflow is runtime-verified.
- Diff/status reviewed, whitespace check passes; public API/migration/business
  model surface unchanged, no commit created. Remaining old persistence references
  are classified in [cleanup audit](runbooks/S02_SQLITE_AUDIT.md) as historical only.
- No remaining S0.2 acceptance blocker. Native URL defaults use explicit loopback
  to avoid this Windows machine's hostname/IPv6 fallback delay. URL remains configurable.

### Earlier local verification slice — HISTORICAL INFORMATION

Local verification tooling slice verified on 2026-10-05 (Windows/Python 3.11.9):
- `./scripts/test.ps1 all`: **13 passed**, one existing upstream Starlette/AnyIO
  deprecation warning. Includes guarded command failures, fresh persisted reads,
  repeated reset/seed on temporary SQLite and sidecar refusal without data loss.
- PowerShell reset with seed, standalone seed and DB status succeed on the canonical
  development database; only `alembic_version` exists with row `0001_scaffold`.
- Live Uvicorn health/OpenAPI assertions and independent read-only SQL checks pass;
  server stopped afterward. `pip check` succeeds. No public API/schema change.
- PowerShell wrapper propagates rejected reset as exit 1; the empty e2e selector
  reports no tests. POSIX wrapper syntax passes Git Bash `bash -n`; runtime
  execution on a native POSIX environment has not been verified in this session.

### Initial scaffold verification — HISTORICAL INFORMATION

Verified on 2026-10-05 with Python 3.11.9 (Windows):
- `.\.venv\Scripts\python.exe -m pytest`: **5 passed**, one upstream Starlette/AnyIO
  deprecation warning; no test failures. Tests cover app import, health contract,
  OpenAPI/route inventory, domain import independence, empty migration upgrade/downgrade
  and synchronous Session. No external HTTP calls; temporary SQLite/in-process ASGI.
- `.\.venv\Scripts\python.exe -m pip check`: no broken requirements.
- App import and JSON serialization of generated OpenAPI 3.1.0 succeed;
  OpenAPI paths contain only `/health`; runtime routes are `/health`, `/openapi.json`.
- `.\.venv\Scripts\alembic.exe upgrade head` / `current`: `0001_scaffold (head)`;
  local ignored `runtime/shelfcash.db` contains only the revision table.
- Uvicorn startup succeeds and local `/health` returns the documented payload;
  the verification server was stopped afterward.
- Git initialized for review, no commit created. Diff whitespace check, ADR links,
  canonical agent-document references, dependency inventory and empty-domain scope verified.

FastAPI is constrained to the tested 0.115 release line for HTTPX test-client/route
inventory compatibility. Verified stack: FastAPI 0.115.14, Pydantic 2.13.5,
SQLAlchemy 2.1.3, Alembic 1.20.0. Other dependencies use declared version ranges;
an exact transitive lockfile is not part of this scaffold.

## Next slice -- PROPOSAL

S1.7 and S1 are COMPLETE; no canonical operational S1 gate remains open.
S2.1 implements execution values/semantic validation under ADR-012; S2.2 adds the
explicitly authorized baseline-specific readiness and historical quantile computation.
S2.3 retained execution and S2.4–S2.7 trained/evaluation/artifact integration are
authorized and implemented. Remaining real-data quality evaluation needs suitable
observed sales/correction provenance. S3 remains a proposal, not started; no public
business API or subsequent slice starts automatically.

## Current limitations — CURRENT FACT

- Repository writers guard RUNNING-only transitions and prediction append.
  Direct tracked ORM/SQL mutation can bypass these guards. S1.6 validates prediction
  horizon membership and completed forecast consumption in its application paths.
  Full Decision package/evaluation validation and actor authorization remain future
  responsibilities; S2.3 now captures and retains baseline input and sanitizes failure summaries.
  DB enforces local state/shape/FKs but has no immutability/horizon triggers.
- S1.5 repositories expose explicit insert/read/lifecycle primitives, no arbitrary
  completed-row update/delete writer. Reads are tracked mutable ORM rows; direct
  Session/SQL can bypass policy. S1.6 returns by-value outputs and guards its lifecycle
  paths; wider immutable application boundaries remain future.
- S2.3 provides retained forecast input and deterministic SHA-256; S2.7 adds verified
  immutable trained artifacts and typed execution metadata. Full Decision package
  schemas remain future requirements. Fingerprint alone is not a replay guarantee;
  retained input and exact available artifact are required for trained replay.

- Inventory balance and ledger are independently stored. S1.7 receipt/correction
  paths require movement and balance in one locked application transaction and
  reject negative results. They append history without edit/delete. Direct ORM/SQL
  can bypass policy: no append-only/reconciliation/audit trigger or actor permission
  exists. Optional paired source refs are retained; authentication is not implemented.
- S1.7 tracked Ingredient receipts require expiry and both-known dates enforce order;
  unknown receipt remains NULL. DATE facts are explicit and separate from UTC event
  instants. No future-date derivation, automatic expiry or engine cutoff is invented.
  All supplied money inherits Store.currency; no budget writer is in this slice.
  Future budget boundaries must enforce the unchanged budget unit=Store.currency rule.
- No import parser/hash/classification/mode/correction/provenance engine, full Sales
  correction, FEFO, trained Forecast model or Decision computation. S2.2 baseline
  computation remains pure; S2.3 persists internal execution, no business API.
  Internal persistence access is documented in features/PERSISTENCE_ACCESS.md.

## Known unresolved decisions — PROPOSAL

- Future public Store API fields, validation and transport error contract. S1.1 UUID storage and
  timezone/currency defaults are frozen; public identifier/payload contracts are not.
- Authentication/bootstrap and minimum store isolation needed before data exposure.
- Engine-specific currency rounding, explicit unit conversions and expiry
  business-day cutoff. ADR-012 freezes forecast Store-local D and D+1..D+7;
  S1.7 already freezes exact Decimal,
  Store.currency inheritance, exact units and separate DATE/aware UTC instants.
- Recipe resolver/API behavior beyond frozen inclusive date selection; future forecast
  model/quantile calibration (S2.2 weak historical baseline is frozen) and simulator
  time granularity, objectives/tie breaks and constraint infeasibility policy.
- Decision package structure beyond required schema version 1 and historical context.
- Mapping confidence thresholds, atomic/partial import contract and detailed
  permission matrix. ADR-013 accepts future mapping self-approval by an authorized
  mapper, immutable reviewed versions and mapping approval distinct from import
  confirmation; none is implemented. Mapping remains S5; hardening S6 must not defer
  minimum access enforcement when a public operation needs it.

No known technical debt is recorded in the initial scaffold. These unresolved choices
are not accepted architecture and must not be silently treated as implementation facts.
