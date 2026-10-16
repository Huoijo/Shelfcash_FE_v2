# S4.10 task notes

## ACCEPTED DECISION - scope freeze, 11/10/2026

Authority: user attachment0e45bf3d-4aef-4db5-8551-120a7500d015 read in full.
S4.10 is explicitly authorized: C04/C05 retained Ingredient navigator/detail,
C08 structured engine reasons, N9 Run history, H01/H02 Import history/calendar,
N10/N11 private PDF exports and canonical J01 export variants. S4.11/FE/browser,
AI explanations/what-if/order flows, engine/forecast/winner changes, development
DB, live provider, commit/stage/push/deploy and handoff/ZIP are outside scope.

Observed branch feat/from_forecast_to_decision_run and HEAD
a4b68378f35fea6f71b549e24393cf4bbb35aba5; index empty; no Python/pytest/uvicorn
process. S49 checkpoint is COMPLETE with no active runner. Existing extensive
S3/S4 WIP and all baseline/archive bytes must be preserved. Initial hashes,
Git observations and exact guarded local shelfcash_test state are saved in
runtime/s410. No reset/migration is part of observation.

| Baseline design | Current authority | Current source | S4.10 work |
| --- | --- | --- | --- |
| C04/C05, C06 merged | PLAN16 exact scope/option/null/3x7 rows, current C03 rights | Verified PlanningRun source/candidates/evaluation lots/ingredients/contributions; names absent in old retained Ingredient facts | Typed retained-only list/detail; companion metadata in new coherent capture, historical labels unavailable; no live names/costs or inverse shortage attribution. |
| C08 | PLAN15.3 retained engine codes/proof/options, global warnings survive filter | C03 typed projection and full result/exclusion/selection evidence | Structured reasons sharing verified aggregate/projection; no LLM/recompute/new proof. |
| N9 | PLAN15.2 current Store-wide reads, -accepted_at/UUID, actor/Store/filter/revision cursor | PlanningRun JSONB lifecycle/digests; private CursorSigner and scoped auth available | Snapshot-consistent bounded history, real/null totals and current rights, no creator-only/TTL/delete. |
| H01/H02 | IMP11 accepted category+filename same-file AND, first uploaded Store-local date, distinct batches; FE0 shape with UUID alignment and explicit in_progress | ImportBatch imported_at/status/revision, ImportFile, retained analysis/completion and current sensitive-read rules | Metadata-only calendar/history; authorized batch filtering, no parse/commit reconstruction, I04/I06 reopen unchanged. |
| N10/N11/J01 | PLAN15.4/IMP14.5 exact export option/locale/render/digest, artifact proof, current export/result/budget/cost fences | Import durable claim/reconciliation foundations and planning OS-incarnation liveness; local artifact patterns; no export storage/renderer | Minimal purpose-specific durable export aggregate/job, shared J01 typed dispatcher, default-off local worker, atomic private artifact/hash and terminal receipt; no broker/generic job service. |
| Retained performance | User asks profile/parity/corruption checks; preserve full semantic integrity | S49 actual50-Product C03 9 queries/118281 bytes/cold12.728s; repeated deep validators | Controlled profiling; owned bounded cache keyed full raw hash/schema/revision/identity, never only Run UUID; current authorization every read; reuse verified projections without weakening cold validation. |

Read AGENTS authority order and relevant ADR007/010/011/015/019/020/021/022;
current source facts are distinct from historical absence statements. PLAN15-16,
IMP11/14.5, Auth current/session/Store/commit fence and sensitive-read rules own
semantics. Exact audited ZIP10/10 is reference, not ZIP09/10. S47-S49 audit/
compatibility/notes remain prior evidence, not new S410 PASS counts.

Implementation sequence: first profile and shared verified retained reads; then
small C04/C05/C08 slice, history slices, durable PDF/export/J01 slice, relevant
targeted verification and documentation. Record concrete storage/dependency/flag
choices with rationale before their edits. Migration only for real export storage
and history snapshot revision needs; guard exact local shelfcash_test first.

Coverage: real sequential PostgreSQL/HTTP and actual retained engine results;
cross-endpoint digest/option parity, scoped/global/null/known0/daily rows, no live
facts or compute GET; signed snapshot pagination/concurrent invalidation and
current sensitive rights; actual PDF Unicode/font/bytes/hash/visual QA, option
policy, private paths, durable claim/recovery/concurrency/uncertain ACK/revoke.
Faults are labeled injections, no mocked PDF or DB as rendering/persistence proof.
Use PDF skill render-and-inspect workflow for actual sample artifacts. No default
full suite; counts overlap, interrupted/no completion commands never PASS.

Rollback scope: only S410 additions and narrow shared composition/read/capture/
job-schema/settings dependencies; existing engine/domain/business authority and
unrelated WIP remain intact. BE implements accepted surfaces; FE sync notes only.
ML/Data policy unchanged; demos/tests synthetic guarded data, not business seeds.

## CURRENT FACT - verification checkpoint

No S410 test PASS at scope freeze. S49 completed gates are historical reusable
evidence only. All future commands/results/fail-to-fix recorded below.

### ACCEPTED DECISION - conditional PLAN16 nullability

User resolved the PLAN16 contradiction explicitly: terminal failed Run with
prepared computed scope may expose retained captured facts with result_digest
null. Existing input/snapshot and aggregate digest validation remains mandatory;
no substituted or fabricated result digest. Engine-dependent fields remain null.
Existing retained results still require a validated non-null result digest.
DTO/OpenAPI/examples/tests/compatibility notes must agree; grants/policy unchanged.

### CURRENT FACT - first retained inspection slice

- Baseline command: `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_s410_retained_read.py`
  redirected to `runtime/s410/retained_profile_baseline.log`: 1 PASS,94.52s,exit0.
  Real50-Product Run: worker78.428s,C03 HTTP11.748s,9queries,118281bytes.
- `.\.venv\Scripts\python.exe -m runtime.s410.profile_reads`:
  exit0, actual retained fixture offline profiler/parity/corruption gate.
  Profiled cold34.207s (instrumentation overhead, not comparable HTTP timing),
  warm0.881s; full raw/rehashed semantic/identity-column corruption rejected.
  78million function calls; dominant full nested semantic revalidation, notably
  procurement replay and exact simulation. Cold checks remain intact.
- Owned cache: four terminal entries maximum,16MiB total canonical source bytes;
  this is admission/accounting, not a claimed16MiB process RSS ceiling. Full raw
  hash and every persistence identity column/revision bind each lookup. Current
  authorization remains outside/on every read; no mutable global cache.
- `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_planning_inspection.py`
  redirected to `runtime/s410/inspection_gate.log`: 3 PASS,21.30s,exit0.
  Actual purchases/21daily rows/contributions/C03-C08 parity, no live name lookup,
  known0 vs null, historical missing label, warmed rehashed corruption rejected,
  actual injected failure after capture with null result digest and freshSession
  persisted capture proof. Fault injection is labeled, no fake engine result.
- No interrupted commands in this checkpoint. N9/H01/H02/PDF/J01 and further
  current-right/pagination/physical-lot coverage remain unverified/unimplemented.

### TECHNICAL CHOICE - history and purpose-specific export storage

N9 uses PostgreSQL SHA256 of ordered Run identity/revision/digest metadata,
computed in the same repeatable-read snapshot as count and page. Current grants
are fenced per request; server-signed cursor binds actor/Store/auth/filter/limit.
Only selected-page records enter the full semantic decoder; no history-wide
result materialization. Creator display_name is null because it was not captured,
never email/current membership. No history migration is necessary.

H01/H02 reuse existing I04 sensitive-domain authority and deny the whole response
before unfiltered counts. First imported_at is grouped in retained/current Store
timezone; accepted schemas map sales/inventory_count/recipes/supplier schemas to
the four approved categories. Other schemas and unclassified uploads are not
guessed. Category and q match one uploaded file; ignored sheets do not classify.
Actual I06 completion/digest alone supplies completed/completed_with_warnings;
other uploaded states including mapping blockers remain in_progress unless the
batch actually failed. Metadata range guard1000batches returns explicit413,
never truncates a complete calendar/count. Bound is technical resource admission,
not retention/delete policy. History tests: exact command
`.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_retained_history.py`
to `runtime/s410/history_gate.log`: 2 PASS,9.48s,exit0. More auth/concurrent and
same-file multi-file/completion coverage remains to run.

PDF needs a purpose-specific planning_exports aggregate (one export + one job
UUID, atomic original receipt/key scope, revision/digest, claim/terminal proof).
ImportJob import_id is mandatory, so inserting PDF into that table would violate
the actual schema. Migration0017 will only add this export table/indexes/FK and
existing Run history index, not a generic broker or rewrite old imports/Runs.
Default-off local PDF thread; conservative proven-process-death failure, no
automatic rerender/expiry/infinite retry. Current accepted actor authority follows
S49 logout-vs-credential-revision semantics and adds export/result/budget/cost.

ReportLab4 is chosen for actual paginated tables/Unicode embedded TrueType
([official fonts documentation](https://docs.reportlab.com/reportlab/userguide/ch3_fonts/)).
Bundle unchanged NotoSans Regular/Bold with its SIL OFL1.1 copyright/license
([upstream license](https://github.com/notofonts/noto-fonts/blob/main/LICENSE));
no runtime font/asset network. pypdf and PDFium are development QA dependencies
because Poppler is unavailable here. New public renderer/storage dependencies
are only for this authorized slice. Exact installed versions/font hashes and
actual visual QA still to record; no PDF creation/render PASS claimed yet.

### CURRENT FACT - PDF implementation/first gates and fail-to-fix

- Guarded `.\.venv\Scripts\python.exe -m runtime.s410.migrate_test` exit0:
  shelfcash_test0016->0017,61tables; no reset. Original rows untouched by upgrade.
- PDF skill marker ran once successfully immediately before first PDF test:
  `node container_tools/mark_artifact_operation_started.mjs --operation-kind create --expected-output-count 1 --output-format pdf`
  in the PDF skill directory. ReportLab4.5.1,pypdf6.20.0,pypdfium2 5.14.0 installed;
  pip command exit0. Bundled fonts/license hashes in app/assets/fonts/PROVENANCE.md.
- First exact test command:
  `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_planning_exports.py::test_real_pdf_winner_job_replay_download_and_font_proof`.
  `pdf_first_gate.log`: 1FAIL4.61s,exit1. Fixture renamed Ingredient before capture
  but left physical declaration stale; renewed actual empty observation in fixture.
  `pdf_first_fix_gate.log`: 1FAIL12.80s,exit1. Queued export digest failed: JSON-mode
  UTC Z differed from canonical +00:00. Fixed storage to existing exact_json,
  keeping canonical decoder strict. `pdf_canonical_fix_gate.log`: 1FAIL13.24s,exit1.
  PDF was generated/persisted but shared middleware replaced private,no-store;
  fixed only PDF binary headers and exposed N11 download headers through CORS.
- `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_planning_exports.py`
  to `pdf_gate.log`: 2PASS21.09s,exit0. Actual winner and explicit ineligible PDF,
  explicit-null/no-winner, missing option_id422, exact receipt replay/conflict,
  J01 discriminator, embedded Vietnamese TrueType/font/text/multi-page proof,
  bytes/hash/headers/freshSession terminal, current name-independent existing
  artifact and corrupt-artifact503 without rerender. Later renderer layout/
  deterministic bytes changes require latest sample regeneration/QA.
- `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_planning_export_durability.py`
  to `pdf_durability_gate.log`: 4PASS1FAIL37.41s,exit1. Two independent real workers
  and actual-commit lost ACK acceptance/claim/terminal passed. Recovery after live
  owner then proven process death failed because bounded cursor needed an empty
  scan before wrapping. Fixed partial recovery pages to wrap immediately; never
  timeout-takeover an ALIVE/UNKNOWN owner.
- `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_planning_export_durability.py::test_proven_process_death_live_owner_and_bounded_controlled_retry tests/integration/test_planning_export_durability.py::test_staff_current_read_export_replay_worker_and_download_rights tests/integration/test_planning_export_schema.py`
  to `pdf_recovery_auth_schema_gate.log`: 4PASS31.69s,exit0. Real child process
  claim/ALIVE/no takeover/exit0/DEAD recovery; one controlled internal retry same
  export/job,attempt2, stale claim rejection; Staff current rights denial before
  materialization/after real rendering, replay/J01/N11 denial, warmed C03-C08/N9
  cost-right denial and Store-wide Owner-created history read. Real migration
  roundtrip preserved populated prior Run JSON exactly; metadata diff empty and
  downgrade refuses any retained export intent.

No public retry route, no automatic retry/Run recomputation. Internal retry is
limited to one additional attempt for render/artifact/process failures and
rechecks accepted actor's current rights; permanent permission failures cannot
retry. Admission bounds20 pending exports/Store,3MiB typed report; rendering
1000pages/25MiB/120s cooperative deadline (not hard process cancellation).
Private temp bytes are fsynced, UUID-scoped and atomically renamed under current
publication fence; completion has verified hash/size. DB failure can retain an
orphan private artifact, never a successful download without durable receipt.
No artifact TTL/purge. Windows rename/file fsync is used; POSIX also fsyncs directory.

First actual sample:28pages87598bytes. PDFium rendered all28pages; agent inspected
all three contact sheets and full pages1/3/4, clear Vietnamese glyphs/tables/footers.
Found orphan heading at end of page1; set keepWithNext and localized main labels/
unknown dates. This is first-layout evidence, not final-layout PASS.

At that checkpoint the read-after/inspection gate was still running; its later
completion evidence is recorded below. No command was classified PASS before exit.

### CURRENT FACT — resumed verification/checkpoint

Recovered the original S410 scope, accepted conditional PLAN16 decision and
runtime logs without recreating baseline artifacts. Schema gate's owned process
had exited1; no old pytest worker was active before starting its sequential rerun.
No reset/restore/stage/commit of the working tree; baseline observation/hash files
are reused. No interrupted/missing-output command was promoted to PASS.

Completed gates (counts overlap, do not sum as regression totals):

- `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_s410_retained_read.py tests/integration/test_planning_inspection.py`
  `read_after_and_inspection_gate.log`:4PASS1037.19s,exit0. Actual50-Product HTTP:
  worker84.265s,cold13.068s,warm1.127s;9queries/118281bytes both reads,
  byte/response parity. Long gate wall time is observed, not a failure inferred
  from sleep; exact completed output is retained. Baseline initial cold11.748s
  remains unchanged. Cold decode remains TECHNICAL DEBT; no SLA claim.
- `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_planning_inspection.py tests/integration/test_retained_history.py tests/integration/test_planning_exports.py`
  `inspection_history_pdf_final_gate.log`:11PASS72.17s,exit0. Includes physical
  expired/future lots, scoped/global warnings, computed-scope pagination,
  conditional null result digest, same-file category+q, current sensitive rights,
  stale history cursor, real I06 completion status, winner/ineligible real PDFs
  and identical historical bytes after a live label edit.
- `.\.venv\Scripts\python.exe -m pytest -x -q tests/api/test_planning_public_openapi.py tests/api/test_planning_inspection_exports_openapi.py tests/api/test_import_openapi.py tests/integration/test_planning_export_durability.py`
  `api_export_final_gate.log`:13PASS73.02s,exit0. Actual two-worker claims,
  acceptance/claim/terminal lost ACK after real commit, before-commit absence
  correctly503 (not success), exact orphan bytes on bounded retry, proven process
  death/live owner, Staff revocation before materialization/after rendering,
  Store-wide read, replay/J01/N11 current rights, twenty-job quota and unavailable
  renderer admission. Replay remains possible before new-admission checks.
- Shared schema/migration coverage was broadened because0017 adds storage and
  changes the current Alembic head; this is an affected-boundary gate, not full
  suite. Exact initial command:
  `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_database_bootstrap.py tests/integration/test_verification_commands.py tests/integration/test_catalog_recipe_schema.py tests/integration/test_identity_store_schema.py tests/integration/test_data_semantics_correction.py tests/integration/test_forecast_decision_persistence.py tests/integration/test_supplier_operational_constraints.py tests/integration/test_recipe_schedule_schema.py tests/integration/test_planning_configuration_schema.py tests/integration/test_planning_export_schema.py`
  `schema_affected_gate.log`:86PASS1FAIL112.22s,exit1. Failure was the old exact
  downgrade table subtraction omitting new planning_exports, not a migration
  failure. Updated only that expected table set; rerunning the failed file and
  remaining schema files sequentially as
  `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_forecast_decision_persistence.py tests/integration/test_supplier_operational_constraints.py tests/integration/test_recipe_schedule_schema.py tests/integration/test_planning_configuration_schema.py tests/integration/test_planning_export_schema.py`
  to `schema_tail_gate.log`; completion pending at this checkpoint, not PASS.

Offline `.\.venv\Scripts\python.exe -m runtime.s410.check_openapi`: first failed
exit1 because the validation script named a nonexistent DTO alias; fixed the
script to use actual InspectionEnvelope generics. Latest exit0:46->54 operations,
53core+health, eight intended new operations/six paths, no removed/changed old
operation and only shared JobView expanded. Eight real synthetic normal JSON
responses and both conditional-null C04/C05 examples validate and are copied to
docs/features/examples/s410. No private Run aggregate is published as an example.

Final `.\.venv\Scripts\python.exe -m runtime.s410.pdf_qa`:exit0,28pages/87989bytes,
SHA256875c43b48bdb5cb693f2cc2115171625e0dc6dfe0ee3c785b81a96c2c462e443.
PDFium rendered every page. Agent inspected all three contact sheets and full
pages1/2/4/26; Vietnamese glyphs, tables, footers and heading transitions clear,
no clipping/overlap/orphan heading. Final visual status PASS in pdf_qa.json.

Remaining at this checkpoint: schema tail completion, related S49/Import job
regressions, final GET no-compute/no-write/foreign Store/streaming-body guards,
documentation/current-state/compatibility updates and preservation audit.

### CURRENT FACT — final related boundaries and additional integrity fix

- `schema_tail_gate.log` completed143PASS186.31s,exit0. The failed downgrade
  expectation and remaining five schema files pass; earlier86 passing cases are
  retained evidence and were not rerun without cause.
- Exact related-boundary command:
  `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_s410_read_guards.py tests/integration/test_planning_public.py tests/integration/test_planning_public_security.py tests/integration/test_planning_public_sources.py tests/integration/test_import_staging.py tests/integration/test_import_commit.py`.
  `related_read_job_gate.log`:1FAIL11.26s,exit1. New guard fixture had composed
  Import history with real clock while its real AuthSession uses controlled test
  clock; H01 correctly401. Rebound ImportStaging/history to the same fixture auth,
  no production source change. Rerun exact command to
  `related_read_job_fix_gate.log`:99PASS454.72s,exit0. Current GET C03–C08/N9/H01/H02/
  J01/N11 hooks forbid forecast/solver/Import execution/PDF rendering; SQL listener
  observes no INSERT/UPDATE/DELETE. Real foreign Store principal denied404 on all
  those GETs and N10;64KiB streaming limit413 creates no intent. Query errors are
  exact INVALID_FILTER/INVALID_MONTH/INVALID_DATE. Existing S49/Import staging/
  canonical commit callers pass with shared JobView/current head.
- `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_s410_option_history.py`
  `alternate_lifespan_gate.log`:2PASS30.88s,exit0. Real differing baseline histories
  produce an eligible actual option other than winner. Explicit C04/C05/C08 use
  that option, not winner simulation. Live Ingredient name/Product price/term
  pack cost/physical stock/budget/model config edits preserve all retained views
  and identically rerendered alternate PDF bytes. Actual provider hooks reject
  suggest_sheet/transport calls; current settings key configured=False (boolean
  only checked, no credential output). N10 detects a rehashed wrong result digest;
  malformed artifact/Ingredient path UUIDs422. Explicit PDF opt-in lifespan owns
  exactly one real local thread, completes a real queued report and joins on exit;
  default-off owns no such thread. No second runner or external worker was launched.
- Additional labeled corruption test added after that gate: internally matching
  export Store fields plus recomputed hash were insufficient to prove parent Run
  Store. Exact command
  `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_s410_option_history.py::test_export_rehashed_foreign_store_binding_fails_closed`
  to `export_store_binding_first.log`:1FAIL13.20s,exit1 (J01 incorrectly200 under
  the forged Store). Added independent parent Run ownership metadata validation
  before materialization/publication, ACK reconciliation, J01 and N11. No live
  business lookup or migration/schema/engine change. This reports actual drift
  and its fix, rather than rewriting prior evidence as passing.
- Final affected rerun currently owns one runner:
  `.\.venv\Scripts\python.exe -m pytest -x -q tests/integration/test_s410_option_history.py tests/integration/test_planning_exports.py tests/integration/test_planning_export_durability.py tests/integration/test_s410_read_guards.py`
  to `export_binding_final_gate.log`. Not PASS until completed. Basic PDF tests
  regenerate the sample's synthetic UUIDs, so final JSON validation/PDF QA hash
  will be refreshed against that actual latest artifact before completion.

No UNVERIFIED/INTERRUPTED commands so far: each ended command has retained output
and exit status. The currently running command is pending, not missing evidence.

### CURRENT FACT — COMPLETE authorized S4.10 / final checkpoint

The final exact affected command above completed to `export_binding_final_gate.log`:
16PASS3909.45s (1:05:09),exit0. Long measured wall time is recorded without assuming
sleep failed/interrupted the process. Rehashed foreign Store binding is now503
for J01/N11; normal alternate/ineligible/winner PDF, actual lifespan, two workers,
lost ACK, proven dead/live owner, controlled retry, current rights, GET no-compute/
no-write and foreign-request guards all pass after the ownership fix. No runner
remains active. All nine surfaces C04/C05/C08/N9/N10/N11/H01/H02/J01 are COMPLETE
within the authorized contract; S4.11/FE/browser remains PLANNED.

Latest actual sample regenerated by that gate:28pages/88009bytes,
SHA256bde27ad99e2f2a181dd78008c1687fd43c897ccc7854af5f3202957f1f5fab48.
`.\.venv\Scripts\python.exe -m runtime.s410.pdf_qa` exit0 rendered all28 pages;
agent rechecked all three contact sheets and full1/2/4/26. Final QA PASS; previous
sample hashes above are historical generation evidence, not the latest artifact.
No clipping/overlap/orphan heading; embedded Vietnamese fonts, page footers,
exact values and unknown labels remain clear. Actual download/hash/font proof
is automated, with real bytes rather than mocked PDF evidence.

`.\.venv\Scripts\python.exe -m runtime.s410.check_openapi` exit0 refreshed the
actual eight normal and two conditional-null DTO examples. Same exact eight
additive operations/six paths and shared JobView-only component expansion.
`.\.venv\Scripts\python.exe -m runtime.s410.final_docs` exit0 updated current state,
roadmap, API/domain/database and compatibility; old slice evidence is explicitly
historical. Authoritative contracts gained current-runtime pointers and preserve
earlier inventories as historical information; the only product contract change
is the user-approved conditional PLAN16 nullability. No accepted ADR was edited.
`.\.venv\Scripts\python.exe -m runtime.s410.docs_check` exit0: new links/examples,
current-vs-historical markers, final actual PDF hash/QA and operation counts valid.

`.\.venv\Scripts\python.exe -m runtime.s410.preservation` exit0: HEAD/branch
unchanged, index empty; no deleted baseline paths, all23 ZIP hashes unchanged,
plain domain/engine and all preexisting migrations unchanged. Changes since
start are only intended application/API/composition, optional capture labels,
export storage/rendering/assets/dependencies, head-aware schema expectations and
S410 docs/examples. Existing unrelated WIP remains. Guarded shelfcash_test at
0017/61tables; all business rows empty after fixture cleanup, no development DB
connection/reset/migration. Final process inspection lists no Python task runner
or worker. `git diff --check` exit0. No commit/stage/push/deploy/handoff/new ZIP.

Verification limits: gates overlap and are not summed; no default full suite,
FE/browser/end-to-end S4.11, real provider, trained-model/real-data forecast quality
or production capacity/SLA proof. No interrupted/unverified command remains among
the required local gates. Cold retained semantic validation remains debt (restart/
eviction13.068s in the measured50-Product fixture); warm1.127s is not a guarantee.
Bounds are technical admission (cache source bytes, not RSS; render checks, not
hard cancellation). No artifact purge/TTL/retention policy was approved/introduced.

Final wire synchronization: conditional required-null C04/C05 result_digest and
unavailable engine fields; retained label/option/exact quantity/path semantics;
history filters/snapshot errors/first-upload timezone and in_progress; required
N10 explicit-null option selection; shared J01 operation/rendering/context/result
union; private binary N11 headers; eight new operations and JobView component.
These are recorded for the final roadmap handoff, not a newly created handoff.
