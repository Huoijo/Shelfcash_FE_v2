# Vertical-slice roadmap

## CURRENT FACT — FE contract supplement, 11/10/2026

The authorized documentation/packaging audit presents exact baseline10/10→v2
operation/schema/semantics deltas and the [FE update checklist](../FE_UPDATE_CHECKLIST_VI.md).
Current source OpenAPI matches v2; no API/policy/source/DB change or new slice.
Offline verification retains one stale Auth route-inventory test failure.
API E2E and existing-screen browser evidence do not complete the missing whole-chain
Mapping/commit/readiness/planning/retained/PDF UI acceptance; S4.11 remains PARTIAL.

## CURRENT FACT — S4.11 PARTIAL, 11/10/2026

Environment/tooling and API E2E are verified on isolated local integration DB,
including real workers/PDF, fresh-session persistence, guarded reset/reseed,
restart and current-rights revocation. Existing FE screens pass real Edge gates;
mapping/preview/commit/planning/retained/PDF UI are absent, so complete browser
acceptance remains blocked. S4.11 is PARTIAL, not COMPLETE. Integration-only
H01/H02 response/retry and FE validator fixes are included in final handoff v2;
v1 and exact audited ZIP10/10 remain preserved. No next slice authorized.
Evidence: [S411 notes](runbooks/S411_TASK_NOTES.md).

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


CURRENT FACT (2026-10-10): S4.4 explicit scalar field-value extension complete,
PROFILE_CONSTANT/IMPORT_VALUE source rules/value separation and content-bound review
verified by targeted Import tests (106 pass plus overlapping affected34 pass).
[Feature](features/IMPORT_FIELD_VALUE_BINDINGS.md),
[allowlist/evidence](runbooks/IMPORT_FIELD_VALUES_TASK_NOTES.md).
S4.5 atomic consumers must retain/revalidate exact declared sources. S4.6 opening/
actual receipts remain separate planned N6 scope, not count aliases. No next slice
authorized, no generic/nested/new source schemas or DATA_REQUIREMENTS work.

HISTORICAL INFORMATION — inventory survey before scalar bindings:

CURRENT FACT / Import inventory follow-up: nine supported source schemas and
field-source/writer gaps are documented in
[inventory](features/IMPORT_SCHEMA_INVENTORY.md). Required row values may conceptually
come from reviewed binding/context; current generic row-context constants are not
implemented. Freeze and verify that mapping seam before canonical consumers require
it, without forcing technical UUIDs into spreadsheets or loosening typed validation.
S4.5 owns atomic catalog/sales/recipe adapters/corrections/provenance. S4.6 owns N6
OPENING_STOCK/ACTUAL_RECEIPT lifecycle, count and supplier/fee/declaration storage;
any dedicated Excel receipt/opening intake must be designed there, never routed to
inventory_count. Purchase-history/usage/calendar/combo import remains OPEN, not
authorized parity work. Both future slices remain PLANNED.

CURRENT FACT (2026-10-10): authorized Import classification/review extension of S4.4
is complete: indexed rule/Qwen proposals, shared source descriptors, manual type/
column/IGNORE corrections, scoped approved reuse, per-import retained confirmation.
Targeted PG/HTTP/offline/OpenAPI evidence and limits:
[task notes](runbooks/IMPORT_CLASSIFICATION_TASK_NOTES.md),
[feature](features/IMPORT_STAGING_PREVIEW.md). No new slice number or canonical writes;
S4.5 remains PLANNED and must consume/recheck exact confirmation + current rights/
read-set at atomic commit. No next slice begins automatically.

## S4 — public backend, user-authorized roadmap (2026-10-10)

ACCEPTED DECISION: the explicit S4 task replaces the earlier future sequence
S4 Explanation/What-if, S5 mapping, S6 authorization below. Those rows and old
next-gate paragraphs are HISTORICAL INFORMATION, not the current work order.
Canonical product scope is SHELFCASH_API_CONTRACT_V1_VI and its linked contracts.
Dashboard, AI, What-if and one-time approval implementation remain unauthorized.
S3.6.4 is internal completion, not HTTP/auth/worker readiness. No next slice starts
automatically. S4.2 is authorized by the subsequent explicit Staff workflow task;
S4.3 was subsequently authorized for six reads only; S4.4 is now authorized by
the explicit Import task. S4.5 onward still require their own authorization.

| Slice | Status | Public scope / technical dependency |
| --- | --- | --- |
| S4.1 | COMPLETE authorized scope; targeted PostgreSQL/HTTP verified | Auth/session, assisted provisioning/credential, Store isolation and canonical permissions. Evidence/limits in S41_TASK_NOTES; no deployment/full-suite claim. |
| S4.2 | COMPLETE authorized scope; targeted PostgreSQL/HTTP verified | N12–N19 Owner Staff grants, invitations/acceptance/audit; reuses S4.1 proof/session/grants/revision. Explicit encrypted-intent delivery command; real SMTP/browser/load unverified. Evidence and limits in S42_TASK_NOTES; slice-time record excludes S4.3. |
| S4.3 | COMPLETE authorized read scope; targeted PostgreSQL/HTTP verified | P01/P02/V01?V04, typed exact projections, current Store permissions, read-only REPEATABLE READ/keyset snapshots, additive revision metadata0012. Unknown completeness/threshold/provenance retained; no mutations. Evidence/limits in S43_TASK_NOTES and PUBLIC_MENU_INVENTORY_READS. |
| S4.4 | COMPLETE authorized staging/preview scope; targeted PG/HTTP verified | User approved M04 source_context. I01–I04/M01–M04/N5/I05 preview/J01, additive staging0013, immutable profiles/retained preview/durable local jobs; gate61 PASS plus affected followups. Related regressions307 passed/5 stale-inventory failures corrected and affected reruns PASS, not full-suite claim. Source declaration not verified; no canonical commit/completion/history/readiness. Evidence/limits S44_TASK_NOTES/IMPORT_STAGING_PREVIEW. |
| S4.5 | COMPLETE authorized four-schema scope; targeted real PG/HTTP verified | Atomic catalog/sales/recipe adapters + versioned sales provenance, current-rights/read-set fences, I05 commit202/J01/I06 retained completion. No S4.6 writes or R01 evaluator; evidence S45_TASK_NOTES / IMPORT_CANONICAL_COMMIT. |
| S4.6 | COMPLETE authorized scope; targeted real PG/HTTP verified | Atomic nine-schema commit; N6 opening/actual receipts, N8 thresholds, explicit supplier/fees/declarations with source identity/version/provenance. Evidence S46_TASK_NOTES / IMPORT_INVENTORY_SUPPLIER; no readiness evaluator. |
| S4.7 | COMPLETE; targeted verified, see S47 notes | Exact CAT12 N20–N22; atomic effectivity editor + audit remediation. Depends on S4.3/S4.5/S4.6; precedes S4.8 readiness. |
| S4.8 | COMPLETE authorized scope; targeted verified, see S48 notes | N1–N4/R01/C01, retained post-write I06 readiness, explicit serving registry and exact reuse/prepare/capture dependencies. Public acceptance followed in S4.9; S4.8 evidence remains historical. |
| S4.9 | COMPLETE authorized scope; targeted verified, see S49 notes | Exact C02/C03, atomic accepted config/receipt/result, bounded default-off local worker/recovery, current authorization and retained-read integrity/performance evidence. Uses existing engine; cold50-Product C03 latency is technical debt, no SLA claim. |
| S4.10 | COMPLETE authorized scope; targeted verified, see S410 notes | C04/C05/C08 retained views/reasons, N9 Run history, H01/H02 Import history, N10/N11 private PDF/shared J01; current rights, snapshot cursors, default-off bounded worker, migration0017 and actual PDF QA. Cold-read performance remains debt; S4.11 stays planned. |
| S4.11 | PARTIAL | Isolated local environment/API E2E, reset/reseed/restart and existing FE Edge gates verified. Full browser chain blocked by missing mapping/commit/planning/retained/PDF UI; remote topology unverified. See S411 notes and handoff v2. |

TECHNICAL CHOICE: retain requested order. S4.4 preview must not imply canonical
write before S4.5; supplier preview responsibility can be scaffolded there but
supplier/fee commit completeness waits for S4.6. Recipe timeline and config/forecast
integration are prerequisites to S4.9 public planning. Existing internal source
supports this order without changing product scope or marking future rows COMPLETE.
S4.1 evidence/rollback: [task notes](runbooks/S41_TASK_NOTES.md).

## S3.6.4 — COMPLETE / internal persistence, PostgreSQL verified

New PlanningRun supports atomic C02 acceptance, retained config/capture/result,
scoped idempotency, fenced claim/finalize and conservative real-process recovery.
Migration0009 is additive; S1/S2 lifecycle remains unchanged. Targeted gates and
limits are recorded in [task notes](runbooks/S364_TASK_NOTES.md). S3 remains
IN PROGRESS. All33 new PostgreSQL cases verified across targeted groups,26 new
unit cases verified,438 boundary/caller regressions passed; no full-suite claim.
Remaining integration backlog (PROPOSAL, not started): consistent
DB configuration/saved adapters with version guards, authorization/money access,
worker composition, auto forecast/reuse and HTTP C01/C02/C03. No automatic next
slice or deployment permission. Prior rows retain their slice-time scope exclusions.

## S3.6.3 small-domain verification - CURRENT FACT (2026-10-09)

Stock zero-purchase winner, native affordable purchase and tiny-domain certified
no-pass verified through resolver/bridge/pipeline/selector.90 targeted tests passed;
final two selected-outlay assertions reran and passed. No production correctness fix.
Historical BASE95 5/10P outputs and UNKNOWN/UNPROVEN unchanged. Separate checked
temporal upper bound proves P0<=60% on those frozen synthetic fixtures; no large
enumeration or public readiness/model quality claim.
[Review report](reports/S363_SMALL_DOMAIN_VERIFICATION.md) records exact scope,
commands/proof and small overlay ZIP contents. S3.6.4 has not started.


## S3.6.3 - COMPLETE / internal resolver only (2026-10-09)

Explicit typed default/custom/saved resolution and small operational /2 bridge
implemented; selected regression gate 212 passed, resolver group 86 passed; final
bridge cap guard affected group 5 passed/82 deselected.
BASE95 synthetic 5/10P evidence has no eligible winner and UNKNOWN feasibility /
UNPROVEN, without reducing thresholds. [Feature](features/PLANNING_SETUP_RESOLVER.md)
and [task notes](runbooks/S363_TASK_NOTES.md) record commands, limits and actual phases.
Remaining authorized-product backlog: consistent config/saved/budget persistence,
auth/public C01-C03 wiring, durable acceptance/idempotency/Run result/read/replay,
forecast orchestration/reuse and operational resource admission. None started here.
No ZIP/full suite/DB access/migration/commit. Earlier sections are slice-time history.


## S3.6.2 — COMPLETE / internal scope (2026-10-09)

Internal operational /2 bridge and P1 temporal adapter are implemented and unit/boundary
tested, preserving /1 and S1/S2. Current details/evidence are in
[DECISION_OPERATIONAL_V2](features/DECISION_OPERATIONAL_V2.md) and
[S362_TASK_NOTES](runbooks/S362_TASK_NOTES.md). PostgreSQL acceptance PASS:
6 /2 tests plus 6 /1 capture regressions, 12 passed in 21.00s on guarded local
shelfcash_test, PostgreSQL 17.11. [Acceptance report](reports/S362_POSTGRESQL_ACCEPTANCE.md)
records fresh-session and snapshot/resource evidence; no implementation fixes needed.
No development DB access/reset/migration, HTTP/auth/durable Run/resolver implementation.
Later resolver/storage/HTTP work remains backlog/PROPOSAL and has not started.

## Planning contract review — design completed, implementation pending (2026-10-09)

The current planning cluster is [PROCUREMENT_API_CONTRACT_VI.md](PROCUREMENT_API_CONTRACT_VI.md):
C01/C02 plus C03 polling/result, folding C07's duplicate read responsibility into C03.
User-approved temporal assumptions, whole-response money permissions and indefinite
retention are documented there. This is not completion of S3 HTTP/end-to-end persistence.
Before implementation, freeze the storage/lifecycle evolution and operational /2
bridge with explicit acceptance/fresh-session evidence; do not weaken S1 writers.
Save requirements/budget settings is a separate next review PROPOSAL, not authorization
to implement or start another engine slice. No runtime/DB/full regression this turn.

CURRENT FACT: S0 is complete; S1 is complete with S1.1/S1.2/S1.3/S1.4 persistence schemas
implemented, with S1.5/S1.6/S1.7 operational access (acceptance in CURRENT_STATE). Future slices are PROPOSAL, not permission to
implement them or an accepted public contract. Every slice must freeze precise
contracts, acceptance tests, rollback scope and affected BE/FE/ML/Data/demo behavior
before implementation. Preserve unrelated WIP; no batches of backend layers.

| Slice | End-to-end behavior | Acceptance gate before implementation |
| --- | --- | --- |
| S0 — Scaffold + architecture freeze | App/settings → health/OpenAPI → PostgreSQL migration bootstrap → canonical docs | Includes S0.2 persistence correction: healthy Compose, named volume, isolated real PostgreSQL tests, guarded reset/status/seed, migration head and unchanged API. Completion evidence/status is recorded in CURRENT_STATE. |
| S1 — Domain Model + Database Schema v1 / Operational truth | Store → Product → Ingredient → Recipe → Sales → Inventory Lot → Supplier Term | Split into small create/read/validate/persist vertical paths. Define Pydantic contracts, store boundaries, units/money/date rules and corrections. Assert validated persistence/retrieval, same-store relations, rejected invalid data and reproducible clean DB migrations. |
| S2 — Forecast | Sales → model/baseline → ForecastRun → P25/P50/P75 | Freeze cutoff, horizon, baseline/model, quantile semantics and data contract. Assert future dates, ordered nonnegative quantiles, reproducible controlled-input output, input/model provenance and no LLM dependence. |
| S3 — Decision MVP | Forecast → BOM → ingredient demand → inventory/FEFO → three candidates → exact simulation → comparison → recommendation → DecisionRun | Freeze units, simulator granularity, objective/tie break, infeasibility and package schema. Assert demand/pack/MOQ/expiry/arrival invariants, exactly three evaluated strategies, deterministic selection, preserved schema-versioned snapshot, all golden scenarios and provider-outage operation. |
| S4 — Explanation + What-if | Authorized facts → wording; baseline + mutation → recomputation → comparison | Freeze allowed tools/mutations and permissions. Assert fact fidelity, deterministic recomputation, authorized facts only, no real-state mutation, simulation vs mutation distinction and useful provider-unavailable behavior. |
| S5 — Excel semantic mapping / Store Mapping Profile | Known approved profile or rules → validated mapping → ambiguity suggestion → approval if required | Freeze canonical schema, confidence and approval rules. Assert known profiles never need LLM, confident rules are deterministic, ambiguous suggestions are validated, no invented fields, profile versions/store scope and safe human fallback on outage. |
| S6 — Authorization/human approval hardening where required | OWNER/STAFF + delegated permissions → authorized use case → auditable human approval | Freeze action permission matrix and approval triggers. Assert unauthorized reads/mutations rejected, simulation permission does not imply mutation permission, tools cannot bypass checks, store isolation and approval evidence. |

S6 hardens authorization; it is not permission to postpone minimum access enforcement
needed by any earlier slice. No unprotected real business data exposure is implied.

## S1 implementation slices

HISTORICAL INFORMATION: scope exclusions in S1.1-S1.4 rows describe those schema
slices when delivered. CURRENT FACT: S1.5 adds internal repositories for all their
tables; S1.6/S1.7 add internal operational application paths. Public APIs and engines remain future work.

| Slice | Status | Scope |
| --- | --- | --- |
| S1.1 — Identity + Store | COMPLETE; 22 targeted; historical full suite 240 passes | Only users/stores/store_memberships, storage constraints, direct Session tests and manual inspection; no APIs/repos/auth |
| S1.2 — Catalog + Recipe | COMPLETE; 51 targeted; historical full suite 240 passes, usable manual guide | Only products/ingredients/recipes/recipe_lines; scoped SKU, dated nonoverlap, yield/loss, exact unit/same-store constraints; no APIs/repos/BOM |
| S1.3 — Supplier / Operational / Constraints | COMPLETE; 80 targeted / 240 historical full passes, usable manual guide | Exactly suppliers/terms, canonical sales, received lots/movement history, registry constraints; ADR-008/009 accepted; no import/mutation/FEFO/API/repos |
| S1.3.1 -- Data Completeness & Source Semantics | COMPLETE; 9 targeted / 240 historical full passes | ADR-010; unknown receipt date nullable without default; strict supplier dates/per-pack costs unchanged; no import/readiness implementation |
| S1.4 -- Forecast / Decision persistence | COMPLETE; 58 targeted / 240 full passes | Three run tables, dated/status/quantile/state constraints, same-store FKs, versioned snapshot/package, ADR-011; no engine/API/repos |
| S1.5 -- Persistence Access Contract + Repository Layer | COMPLETE; 65 repository integration / 15 unit checks; historical full suite 320 passes | Concrete typed access for sixteen tables; explicit Store scope, caller-owned transactions, inserts/history/date queries, RUNNING-only lifecycle guards and PostgreSQL acceptance tests; no generic framework, public API or engines |
| S1.6 -- Application Contracts + Validated Read/Write Paths | COMPLETE; 38 unit / 44 application integration; 82 targeted / 402 full passes | Typed Product/Sales paths, Forecast/Decision persistence lifecycle, effective Recipe read, by-value outputs, explicit Store context/transactions/errors, atomic PostgreSQL rollback; no schema/API/engine change |
| S1.7 -- Application Coverage + Inventory Transaction Closure | COMPLETE; 106 new targeted / 188 combined targeted / 508 full passes; one final full regression | Typed Store/Ingredient/SupplierTerm create/read, atomic Recipe version+lines, received lot+RECEIPT and locked justified corrections; frozen exact money/unit/DATE/UTC/correction semantics; no schema/API/engine change |

S1.5 is authorized and implemented; see PERSISTENCE_ACCESS for its internal contract.
S1.6 adds representative contracts; S1.7 closes remaining authorized operational
boundaries. Public transports, auth and computation need separately authorized
slices; none is started automatically.

## Local verification gate

ACCEPTED DECISION (user verification update, 2026-10-07): default to tests for the
change and affected boundaries/callers, with a brief coverage rationale per slice.
Full suite at major integration milestones or broad changes when targeted evidence
is insufficient, not automatically per slice. Small fixes rerun affected/failed tests;
documentation-only changes use document checks. Preserve necessary verification and
report commands/results/limits precisely. See AGENTS.md and [TESTING](TESTING.md).

CURRENT FACT: S0 includes categorized repository test runners, guarded PostgreSQL
reset/migration, explicit no-op schema-verification seed, read-only DB inspection, a
[scaffold feature guide](features/SCAFFOLD.md) and
[fresh-environment runbook](runbooks/FULL_TEST_FLOW.md). Business seeds and e2e
scenarios are not implemented. S1.1-S1.4 implement sixteen persistence tables;
S1.5-S1.7 implement operational persistence/application paths. S1.7 final acceptance passes, and S1 is COMPLETE.

ACCEPTED DECISION: future major slices are complete only with automated tests,
relevant integration/persistence coverage, usable manual verification, deterministic
fixtures where practical, fresh-session persisted-state assertions and canonical
feature documentation. Require both application/API results and database evidence.
Keep the full test flow and testing guide current; do not mark a slice complete
while its verification instructions are unusable.

## S1 overall acceptance -- CURRENT FACT / PROPOSAL

S1.7 has implemented the authorized remaining S1 gates: Store/Ingredient/SupplierTerm
create/read, Recipe atomic version+lines, audited initial inventory receipt and
movement-backed locked corrections; exact money/unit/DATE/UTC/correction semantics.
S1.7 COMPLETE; S1 overall COMPLETE. Targeted and full regression gates pass;
no canonical S1 acceptance gate remains open. See CURRENT_STATE for counts/evidence.
The full operational chain is tested with fresh-session persistence; only Supplier
identity creation remains an explicit S1.5 repository prerequisite, as authorized.

Future budget/constraint writers, actor authorization, full Sales correction,
source conversion, engine-specific currency rounding/day cutoffs and public APIs
are deliberately outside S1.7 and are not newly invented S1 completion gates.
HISTORICAL INFORMATION (remaining-S2 task authorization): **S2 -- Forecast** was IN PROGRESS. S2.1 contracts/validation and S2.2
baseline/readiness and S2.3 retained execution exist; the explicit remaining-S2 task
authorized trained models/evaluation/artifact integration, not S3/public API. The later
explicit S3.1 task authorizes only the contracts/design slice listed below.

## S2 implementation slices — CURRENT FACT / PROPOSAL

| Slice | Status | Scope |
| --- | --- | --- |
| S2.1 — Forecast execution contract and semantic validation | COMPLETE; 81 new unit + 1 new PostgreSQL regression; 164 targeted / 590 full passed, one final full run | Typed execution/prepared/result values, pure validation, complete Product x 7-date output, canonical docs; S1/schema/API unchanged; no model/readiness policy or execution persistence |
| S2.2 — Forecast Readiness + Deterministic Quantile Baseline | COMPLETE; 42 new unit; 233 targeted / 632 full passed, one final full run | Baseline-specific per-Product >=1 observation readiness, all-or-nothing no-history rejection, exact historical Decimal quantiles, seven dates and mandatory S2.1 result gate; no persistence/evaluation/model dependencies |
| S2.3 -- Internal baseline execution end-to-end + retained input | COMPLETE; 40 new tests /165 final targeted /672 full passed; one full run | Explicitly user-authorized snapshot loader, separate JSONB retention, versioned SHA-256, atomic baseline persistence and new-UUID replay; no trained model/evaluation/S3 |

S2.1 adds typed execution requests, immutable prepared observed-sales values and
pure semantic validation. Verification/status is recorded in CURRENT_STATE.
See [FORECAST_EXECUTION](features/FORECAST_EXECUTION.md) and accepted ADR-012:
Store-local D, explicit Products, D+1..D+7 and complete Product/date output. S1's
supplied-prediction lifecycle, including empty completion, is unchanged.

S2.2 implements the explicitly authorized weak Historical Quantile Baseline and its
own >=1 observation readiness rule; this is not general/LightGBM readiness. Exact
policy and callable verification are in FORECAST_EXECUTION; no existing ADR changed.
S2.4-S2.7 are explicitly authorized by the remaining-S2 task. ADR-015 freezes
provisional readiness, causal pooled direct-horizon LightGBM, validation-only selection,
postprocessing, immutable artifact identity and retained execution metadata/replay.
**S2 implementation complete / real-data evaluation pending**. Final gate: 767 passed,
fresh-session persistence/retained exact-artifact replay and guarded manual CLI verified.
No real dataset is available; synthetic checks prove mechanics, not quality/superiority.
HISTORICAL INFORMATION: the remaining-S2 task did not authorize S3. CURRENT FACT:
S3.1 is now separately authorized and COMPLETE within contracts/design; pure BOM added in S3.2; no full Decision executor/API.

| Slice | Status | Scope |
| --- | --- | --- |
| S2.4 | COMPLETE; 85 targeted | Policy and immutable typed contracts, ADR-015 |
| S2.5 | COMPLETE; 56 targeted | Causal features, three fixed deterministic quantile boosters, Decimal postprocessing |
| S2.6 | COMPLETE; 21 targeted | Chronological paired-target evaluation, validation/holdout, selection and metrics |
| S2.7 | COMPLETE implementation; final 767 passed, fresh-session + CLI manual verified | Immutable artifacts, atomic input/run/metadata, validated completion/read/replay, migration 0008, CLI/manual verification |

See [trained forecast](features/FORECAST_TRAINED.md) and
[task notes](runbooks/S2_TRAINED_TASK_NOTES.md) for exact final evidence.

## S3 implementation slices — CURRENT FACT / PROPOSAL

| Slice | Status | Scope |
| --- | --- | --- |
| S3.1 — Decision contracts, versioned policy, golden cases | COMPLETE; 81 new cases /225 targeted /848 final full passed | Opt-in immutable typed snapshot/output validation; provisional actual policy v1; design/ADR-016; fourteen hand-calculated specifications. No engines/HTTP/schema/persistence adapter; S1/S2 unchanged. |
| S3.2 -- Pure dated BOM | COMPLETE, targeted verified; see S32 notes | Captured LOW/BASE/HIGH, dated yield/loss contributions and exact design totals; blockers/provenance retained. No loader/DB, FEFO, strategy construction, procurement, simulator, recommendation or API. |
| S3.3 -- Pure serving/FEFO | COMPLETE; 30 new tests, 144 targeted boundary cases +9 shape regressions; manual demo | Versioned exact progressive allocation, dated FEFO, explicit arrivals, capture eligibility, lot attribution. No procurement/selector/API/DB change. ADR-017 future directions accepted, implementation deferred. |
| S3.3.1 -- Serving output validation | COMPLETE; 60 mutation tests, targeted boundary verification | Independent exact row/aggregate conservation, dated recipe attribution, stock eligibility/continuity/expiry/FEFO, captured issues/provenance; no simulator replay or policy/shape change. |
| S3.4.1 -- Procurement design/formulation | DESIGN DELIVERED; engine/policy proposals await approval | Legacy static review; finite toy enumeration/current serving evaluation; surrogate mismatch/repair experiment. No production procurement or DB/API; ADR-018 PROPOSED. See S341 notes. |
| S3.4.2 -- Procurement correctness/optimization benchmark | SCRATCH BENCHMARK DELIVERED; no engine accepted | Policy-faithful candidate finite-corpus parity/probes and37 oracle cases;5/10 Product limited scale/deadline evidence;123 canonical targeted tests. Fee/capacity/supplier choices experimental only, safety BLOCKED. See S342 report/notes; production S3.4 incomplete. |
| S3.4.3 -- Numeric correctness/exact bounded certification/broader benchmark | SCRATCH DELIVERED; no engine accepted | Old counterexample handled by vector exclusions and exact enumeration;26 small fixtures/553 vectors oracle match. Richer topology/fees/dates/lots/parity, native incumbent timeout and honest large-domain UNCERTIFIED evidence. No production integration; see S343 report/notes. |
| S3.4.4 — Internal procurement engine | COMPLETE internal slice; 60 new tests /206 affected regressions | ADR-019 user-authorized MILP + exact evaluator, required policy/envelope, bounded search, optional finite proof and manual synthetic demo. No persistence/API/selector. See S344 notes. |
| S3.5.1 — Pure procurement comparison | COMPLETE internal slice;40 comparison /202 direct regression tests | Exact captured metrics/outlay, grouped compatible plans with separate target/proof outcomes, signed deltas; no solver/simulator rerun, winner, HTTP or DB. See S351 notes. |
| S3.5.2 — Operational snapshot/internal pipeline | COMPLETE internal scope; PostgreSQL acceptance PASS | Scoped detached read-only REPEATABLE READ adapter and pure pipeline;6 real PostgreSQL cases passed, strengthened6 passed, final cross-store1 passed. No HTTP/retention/DecisionRun/winner/new migration. See S352 notes/acceptance report. |
| S3.6.1 — Internal Product requirements + winner | COMPLETE internal slice;389 targeted passed, final evidence checks in S361 notes | ADR-020 procurement/2 customer constraints/per-Product construction, exact max-min/mean/cost fallback; comparison/2 grouping and selector/1. Native5/10P benchmark UNPROVEN, finite small-domain certificates. No HTTP/default/saved/auth/persistence/DB/Optuna. |
| Further procurement adoption (historical pre-S3.4.4 gate) | PROPOSAL, not started | Review input/proof/domain/latency scope and business policies; no general float-bound transformation or large-domain certificate. ADR-018 remains PROPOSED. No next slice authorized automatically. |
| Further S3 integration | PROPOSAL, scope not frozen | Internal selector now implemented; operational capture still /1. Review S3.6.1 before separately authorizing effective-policy/default/saved resolution, operational-v2 bridge, fee taxonomy and retained DecisionRun/API. No-winner lifecycle and end-to-end verification need explicit evolution; no automatic next slice. |

S3.1 is an explicitly authorized design/contract slice, not an end-to-end Decision
MVP completion. Real dataset evaluation proceeds separately; baseline is a permitted
forecast input without waiting for LightGBM superiority. No next slice starts
automatically. See [design](features/DECISION_DESIGN.md),
[goldens](features/DECISION_GOLDEN_CASES.md), [notes](runbooks/S31_TASK_NOTES.md).

## HISTORICAL INFORMATION — future import direction trước contracts Auth/Import v1

[ADR-013](adr/ADR-013-future-store-mapping-approval-direction.md) records Store-scoped
OWNER/STAFF with delegated actions; authorized mappers may approve their own mapping.
Profiles are per source/report type; reviewed versions are immutable; approved mapping
runs deterministically; approval differs from import confirmation; audit retains
the version used. Mapping stays S5, authorization hardening S6 and ordering unchanged.
Minimum access enforcement cannot wait when a public operation needs it.
Atomic/partial import and detailed permissions remain unfrozen. No import implementation.


CURRENT FACT (2026-10-07): S2.3 corrective patch is limited to commit-error classification
and primary-error-preserving cleanup; 35 added regression cases, 238 targeted passed
including existing architecture assertions. First full gate had one direct-close
architecture failure, fixed by placing concrete cleanup in infrastructure; second full
gate **707 passed in283.16s**, zero skips, one existing warning. Corrective patch COMPLETE;
two full attempts due to the initial failure. Original slice counts above are historical verification.
No baseline/contract/schema/retention scope change or authorization for another slice.
See CURRENT_STATE and S23_TASK_NOTES for final corrective verification.


## HISTORICAL INFORMATION — next gate after S3.4.4

Review internal procurement contracts/configuration, numeric envelope and quality/latency
before authorizing capture/retention/DecisionRun/API or full selector. These integrations
are not implemented; no-winner persistence still needs schema/lifecycle authorization.
The earlier “no engine accepted” S341–343 rows are historical evidence, superseded only
by ADR-019's limited internal direction. Safety semantics, real payable facts and business
configuration remain review questions; no next slice automatically starts.

## HISTORICAL INFORMATION — gate after S3.5.1

Customer-facing API/UX must be designed separately against frontend design, including
delivery-fee taxonomy, fractional units, incomplete/proof labels, delta orientation,
conflict handling and explicit customer choice. Comparison does not choose a cheapest
winner or accept new recommendation policy. Persistence/auth/API/selection are not
implemented or authorized automatically; S3 end-to-end remains unfinished.
