# S4.9 task notes

## ACCEPTED DECISION — scope freeze, 11/10/2026

Authorization: attachment24394db9-c6da-4735-aebc-5df27e004100, read in full.
BASELINE explicit approved for first eventual FE E2E; no trained activation needed.
C02/C03 public Run identity, bounded local planning worker/recovery, config fixed
at acceptance, forecast→same-snapshot operational capture→existing engine→retained
result. C01/R01 must reflect real worker capability. S4.10 result detail/history/
PDF/H01/H02 and S4.11 browser/FE remain outside scope. No commit/stage/push/deploy,
development DB, real provider, policy change or new handoff/ZIP.

Observed HEAD a4b68378f35fea6f71b549e24393cf4bbb35aba5 on
feat/from_forecast_to_decision_run; index empty, no old Python runner/worker.
535 existing source/test/docs/script/migration paths snapshotted in ignored
runtime/s49/start_hashes.json; broad S3/S4 WIP must survive. Exact ZIP10/10 hash
238959dd16307ebd691834d2a679f7f80134495bbe99c56f29f7835f39bab6fd verified.
Supported inspect_database after validate_reset_target: exact local shelfcash_test,
head0016_planning_configuration,60 tables. No reset/migration at observe.

| Baseline design | Current authority | Current source | S4.9 work |
| --- | --- | --- | --- |
| PLAN5/6 C02 | Auth P2, exact three-mode request/presence-sensitive digest, durable receipt, no job UUID | Internal PlanningRun accept/provider/key/receipt+resolved config; S4.8 caller-owned resolver/registry | Public acceptance current auth fence, capture registry/config atomically, immutable receipt/audit metadata, guarded replay/uncertain ACK. |
| PLAN7/IMP14 | Real observed history, exact actual identity/reuse, no auto model/train, ≤2 preparation retries, owned RR capture | ForecastServing prepare/serve/capture pins; operational capture2 engine adapter | Fixed accepted serving config, exact source comparison, real coherent operational/declaration/bounds adapter, Session closure before engine. |
| PLAN8/ADR022 | Separate lifecycle/outcome/search/proof,180s stage budget; recovery only proven dead incarnation | PlanningRun claim/retain/finalize/fail/recover, OS PID/birth/host, immutable terminal writer | Bounded single local execution loop, independent default-off flag, current execution/publication auth fences, actionable typed errors, process recovery without stealing live claims. |
| PLAN9 C03 | Owning Store/current sensitive reads; exact typed retained-only projection, ETag,200 all lifecycle states | Scoped verified internal aggregate read with deep integrity checks | Typed condensed public projection; bounded query/payload/decode verification, no live facts/solver/forecast/provider. |
| PLAN4/IMP14 R01 | Registered runtime capability, valid data independent of unavailable worker | S4.8 hardcodes planning unavailable truthfully | Wire actual planning capability; no GET enqueue/computation. |

Authority read in AGENTS order: CURRENT_STATE/DECISIONS, ADR015/019/020/021/022,
ARCHITECTURE/API/DOMAIN/SCHEMA/ROADMAP; exact PLAN5–10 plus P1/P2 and Auth current
session/grant/commit fence, IMP14 orchestration; S47/S48 notes/compatibility.
Historical source absence sections are not authority to alter accepted product
rules. Existing policy/forecast/BOM/FEFO/procurement/comparison/selector preserved.

TECHNICAL CHOICE: separate planning worker flag, default false, explicit supported
local command; no use of Import flag or automatic development startup. Reuse the
existing Run aggregate and conservative dead-owner terminal recovery rather than
parallel job lifecycle or elapsed-time claim stealing. Extend storage only for
typed public integration evidence if needed, preserve old internal aggregate
serialization/integrity. Freeze concrete decisions alongside tests before edits.

Acceptance coverage: real guarded local shelfcash_test sequential HTTP→worker→
BASELINE→actual engine→fresh C03, default/custom/saved, stock/purchase/no-winner,
config immutability, exact reuse/source retries, local exclusions/global blockers/
zero-cost bounds, current grants/replay/isolation, concurrent acceptance/claim,
real process death/stale claim, actual-commit lost ACK, retained integrity and
query/payload limits. Mocks only labeled failure injection; no mocked winner or DB
counts as engine/persistence evidence. Related internal PlanningRun/S4.8/Import/
timeline/forecast boundary regressions; no default full suite or sum of overlap.

Rollback scope: only S4.9 added DTO/routes/application/worker integration/tests/docs,
explicit Settings/aggregate extensions and migration if proven necessary. Preserve
all other WIP. BE adds public planning; FE wire sync is documentation for final
handoff, not implemented FE. ML policy unchanged; demo uses synthetic owned test
entities and explicit serving setup, no speculative business seeds.

## Verification/checkpoints

No S4.9 test PASS at freeze. S4.8 recorded gates are historical evidence only.

### Checkpoint: public acceptance and owned execution

CURRENT FACT: no migration needed so far; head0016 retained. Public optional typed
evidence lives in existing JSONB aggregate; absent public fields are omitted to
preserve canonical bytes/digests of internal historical records. Acceptance is
fenced before resolver and replay; transitions lock current actor/Store authority
before Run row. Auth contract logout does not delete accepted intent: worker
rechecks active account/credential revision/current membership/grants, browser
session expiry/logout alone does not grant or revoke actor permissions.

TECHNICAL CHOICE: frozen policy resource guards30s/reserve2s/8 solves, disabled
enumeration, overall180s cooperative budget. An operational fee mode conflicting
with accepted policy discriminator blocks; amounts/declarations remain capture
facts. No silent policy rewrite. Source maxima bound the finite search domain;
CAPTURED_SUPPLIER_LIMIT label is used only with an actual captured SupplierLimit
declaration. TermSource maximum alone uses TECHNICAL_SEARCH_LIMIT, explicit source
derivation and finite-domain-only proof; it does not fabricate supplier_limits.
No history yields nullable internal forecast reference + explicit Product
exclusions, not a synthetic forecast/zero predictions. Global unknowns still block.

DRIFT: S48 readiness checked computed<=50 while PLAN2 says active menu<=50. S49
aligns readiness and C02 with authority; S48 notes remain historical evidence.

Commands (all `.\\.venv\\Scripts\\python.exe -m pytest` unless noted):

| Exact arguments | Completion / evidence |
| --- | --- |
| `-q tests/unit/test_planning_public_contract.py` before DTO | collection failed ModuleNotFound,0.19s; expected red boundary. |
| `-q tests/unit/test_planning_public_contract.py` | 2PASS0.21s,exit0. |
| `-x -q tests/unit/test_planning_run.py tests/unit/test_planning_public_contract.py` | 28PASS89.56s,exit0; prior running session2171 completed and reused, not restarted. |
| `-x -q tests/integration/test_planning_public.py` first2 tests | 1FAIL3.37s: fixture called unrelated C01 with real clock and cleared synthetic session; removed unused call. Same gate2PASS4.35s,exit0. |
| `-x -q tests/integration/test_planning_public.py::test_real_baseline_worker_stock_and_retained_poll` | 1PASS8.15s,exit0: real baseline+native existing pipeline, retained winner/audit, fresh stock unchanged. |
| `-x -q tests/integration/test_planning_public.py tests/unit/test_planning_public_contract.py` | 5PASS11.87s,exit0,session86051 completion verified. |
| `-x -q tests/integration/test_planning_public.py` expanded | 7PASS1FAIL45.24s,exit1: source-only bound mislabeled as captured SupplierLimit; remaining tests NOT RUN. |
| `-x -q tests/integration/test_planning_public.py::test_zero_cost_bounds_are_explicit` | 1PASS1FAIL6.72s,exit1; diagnostic SNAPSHOT_CONFIGURATION_INVALID. Diagnostic rerun log `runtime/s49/zero_bound_failure.log`,exit1: unchanged validator requires an actual supplier-limit declaration. Correct adapter provenance; verification pending. |

Transient import syntax check failed due to route response-header closing brace;
fixed before first HTTP gate. No task commands were interrupted or counted as
PASS without exit evidence. Counts above overlap and are not additive regression.

### Checkpoint: coherent sources, concurrency and final verification

CURRENT FACT: the boundary regression process session47539 completed with exit0;
its128PASS79.10s output was recovered and reused, without starting another runner.
No sleep/interruption was inferred to be failure or success. All tests counted
below have completion/exit evidence. An attempted inspection of nonexistent
start_head.txt/start_branch.txt was corrected to the existing head.txt/branch.txt;
it was a read-only path error, not a test result or missing baseline.

Fail→fix after the first checkpoint:

- Source maximum bounds now retain TECHNICAL_SEARCH_LIMIT with explicit numeric
  source derivation; a real SupplierLimit alone permits CAPTURED_SUPPLIER_LIMIT.
  Zero-cost unbounded offers block globally; there is no fake zero/default bound.
- A failure fixture tried deleting append-only fee evidence; replaced with an
  actual new fee version. A positive-sales retry correctly produced no eligible
  candidate with no stock/offers; corrected test expectation, not engine policy.
- Publication revoke injection now runs after actual positive-demand native
  search. The earlier zero-demand input never constructed a search factory.
- New C03 output makes Pydantic expose PlanningRequest-Input/-Output. Corrected
  the OpenAPI test reference; old component JSON shapes remain identical after
  explicit reference renames. No global schema/contract workaround was added.
- Full typed private term/fee/source/declaration/bound evidence was added to the
  existing JSONB aggregate; schema/digest and semantic relationships are verified.
  Generic fees retain delivery=null, supplier-order fees occur once in aggregate.

All commands below use `.\.venv\Scripts\python.exe -m pytest`; logs are ignored
runtime artifacts, not a new handoff. Gate counts overlap and must not be summed.

| Exact arguments / runtime evidence | Result |
| --- | --- |
| `-x -q tests/integration/test_planning_public.py::test_real_source_changes_bounded_reprepare tests/integration/test_planning_public.py::test_concurrent_acceptance_and_two_workers_one_publication tests/integration/test_planning_public.py::test_actual_process_death_recovery_and_stale_attempt tests/integration/test_planning_public.py::test_actual_commit_lost_ack_is_reconciled` — concurrency_recovery.log |6PASS30.62s,exit0; actual child process death, two concurrent workers and actual-commit lost ACK, labeled fault injections. |
| `-x -q tests/integration/test_planning_public_security.py` — security_retry.log |17PASS77.24s,exit0 at that checkpoint; current revoke/read isolation/logout/config immutability/deadline/live worker/retained integrity. Subsequent tests are in final gate. |
| `-x -q tests/integration/test_planning_public.py::test_zero_cost_bounds_are_explicit tests/integration/test_planning_public.py::test_real_purchase_and_budget_modes tests/integration/test_planning_public_security.py::test_retained_digest_and_typed_evidence_corruption_fails_closed` — source_evidence.log |7PASS51.50s,exit0 after typed source evidence; actual native computation and rehashed semantic-corruption rejection. |
| `-x -q tests/api/test_planning_public_openapi.py tests/api/test_auth_openapi.py tests/api/test_health.py tests/integration/test_planning_public_security.py::test_actual_lifespan_worker_and_runtime_readiness tests/integration/test_planning_public_security.py::test_worker_unavailable_leaves_data_valid_and_get_does_not_start_it` — openapi_runtime.log |6PASS12.60s,exit0. Test-only flag opt-in; development runtime remains disabled. |
| `-x -q tests/integration/test_planning_public_sources.py` — fees_scope_performance.log |5PASS133.63s,exit0. Real PER_OFFER/PER_SUPPLIER_ORDER/foreign source identity, partial scope and actual50-active-Product pipeline. |
| `-x -q tests/integration/test_decision_operational_v2.py tests/integration/test_forecast_serving.py tests/integration/test_readiness_context.py tests/integration/test_planning_configuration_public.py tests/integration/test_import_readiness_snapshot.py tests/api/test_planning_configuration_openapi.py tests/api/test_recipe_schedule_openapi.py tests/unit/test_planning_setup.py tests/unit/test_planning_configuration_contract.py` — boundary_regression.log |128PASS79.10s,exit0,session47539. Relevant /2 adapter, serving/config/readiness/import/timeline regressions; no full-suite claim. |

Earlier diagnostic subset logs orchestration.log/orchestration_retry.log each
ended4PASS1FAIL,20.37s/29.98s; security.log ended2PASS1FAIL10.48s;
wire_error.log ended2PASS1FAIL14.38s. Exact original subset selectors are not
retained in these redirected logs, so they are not presented as reproducible
final gates. Failures/fixes are described above and affected reruns have completion
evidence. Unrun tests after `-x` failures never count as PASS.

Retained-read measurements (actual HTTP, no mocked result):

- One active Product/one Ingredient/observed zero:9 queries,7741 bytes,0.714s
  cold-ish HTTP measurement, unchanged ETag/response after live source mutations.
- 50 active Products/one Ingredient/zero offers/lots, actual observed zero and
 150 Product service rows:9 queries,118281 bytes,12.728s cold HTTP; worker83.062s.
  Reuse this completed benchmark; no rerun solely because the session resumed.
  TECHNICAL DEBT: repeated deep retained validation is costly. No latency SLA,
  maximum lots/offers benchmark or production capacity claim.

Coverage limits: BASELINE with synthetic observations, not trained activation or
accuracy evaluation; clocks/one-strategy exceptions/deadline/commit-ACK are
explicit failure injections around actual engine/DB operations. No FE/browser,
live provider, development DB, hard cancellation, production backups/durability,
S4.10/H01/H02/history/PDF or full-suite verification. Process recovery cannot
prove failure of an abandoned thread within a still-live process. Accepted fee
mode is immutable; operational mode changes block instead of rewriting policy.

### Final public gate and remaining compatibility gate

`-x -q tests/integration/test_planning_public.py tests/integration/test_planning_public_security.py tests/api/test_planning_public_openapi.py tests/unit/test_planning_public_contract.py`
→40PASS170.63s,exit0,session60631,final_public.log. Actual queued/claimed running/
deadline-failed/completed HTTP responses were retained for the validated JSON
examples. The deadline failure is labeled clock injection after real engine work.

PLAN7 provenance warning was then completed: exact intersection dates produce
FORECAST_TRAINING_OVERLAP; unavailable bounds produce
FORECAST_TRAINING_BOUNDS_UNKNOWN. This only annotates actual captured dates, with
no model rejection/selection change. Baseline empirical history precedes the
forecast window. The focused internal/real-baseline gate verifies this last change.

`-x -q tests/integration/test_planning_run.py tests/unit/test_planning_run.py tests/unit/test_planning_public_contract.py tests/integration/test_planning_public.py::test_real_baseline_worker_stock_and_retained_poll -k 'not additive_migration'`
→collection ERROR,exit1,1.92s,internal_compatibility.log: existing unit/integration
files share the module basename test_planning_run under prepend mode. No tests
counted PASS. Rerun with explicit --import-mode=importlib, preserving both files
and WIP; no cache deletion or repository-wide runner configuration change.

Offline commands: `$env:PYTHONPATH='.'; .\.venv\Scripts\python.exe runtime/s49/check_openapi.py`
→exit0,2 new operations/paths,46 operations including health; all old operation
definitions unchanged; all old component shapes equal after explicitly verified
CustomPath/CustomRequirements input and readiness Exclusion reference renames.
`.\.venv\Scripts\python.exe runtime/s49/export_examples.py` →exit0,8 validated JSON
files (3 request modes,5 actual HTTP response lifecycles), no new handoff/ZIP.
`.\.venv\Scripts\python.exe runtime/s49/update_docs.py` →exit0,current/roadmap and
explicit compatibility updated; prior S48 facts labeled historical.

`--import-mode=importlib -x -q tests/integration/test_planning_run.py tests/unit/test_planning_run.py tests/unit/test_planning_public_contract.py tests/integration/test_planning_public.py::test_real_baseline_worker_stock_and_retained_poll -k 'not additive_migration'`
→62PASS,1DESELECTED,310.70s,exit0,session76902,internal_compatibility_retry.log.
The historical additive migration roundtrip is intentionally excluded: S49 adds
no schema migration and must not repeat an unrelated downgrade/upgrade. Existing
internal acceptance/retention/claim/atomic rollback/uncertain commit/dead process/
canonical corruption and real baseline public capture remain compatible.

### Fee/source binding edge: fail→fix

DRIFT: readiness used source keys without namespace and selected one supplier
alias; coherent capture matched namespace but treated multiple covered aliases
as ambiguous. Actual Import source bindings can map several aliases to the same
canonical Supplier. The old capture could also ignore an unresolved component
and calculate zero payable amount. These are binding/coverage bugs, not permission
or optimization decisions.

`-q tests/integration/test_planning_public_sources.py::test_actual_fee_coverage_basis_and_source_identity -k 'SUPPLIER_ALIASES or UNRESOLVED_COMPONENT'`
→2FAIL,3DESELECTED,13.75s,exit1,session62135,fee_bindings_red.log. The alias case
incorrectly blocked a known canonical Supplier; unresolved-component case
incorrectly offered a recommendation with omitted charge.

Fix: shared explicit canonical source bindings now enforce source namespace and
known fee components. Coverage may use any resolved alias of the same canonical
Supplier; all its fee components are summed into one supplier-order fee. Unknown
component binding globally blocks. Readiness uses the same coverage bindings and
checks Store currency. No new fee taxonomy or changed engine objective/bounds.
The actual two-Ingredient/two-line alias case expects one aggregate7 fee and35
total payable cost; it does not count aliases as separate suppliers/orders.

The affected fee/readiness/import-readiness/real purchase+zero-bound gate excludes
the completed50-Product benchmark: this fix only affects non-NONE fee bindings,
whereas that fixture has explicit NONE fees. Reuse its verified evidence.

`-x -q tests/integration/test_planning_public_sources.py tests/integration/test_readiness_context.py tests/integration/test_import_readiness_snapshot.py tests/integration/test_planning_public.py::test_real_purchase_and_budget_modes tests/integration/test_planning_public.py::test_zero_cost_bounds_are_explicit tests/integration/test_planning_public.py::test_real_baseline_worker_stock_and_retained_poll tests/unit/test_planning_public_contract.py -k 'not retained_read_at_active_product_bound'`
first run→3PASS1FAIL,1DESELECTED,40.90s,exit1,session91935,fee_bindings_final.log.
The alias engine result correctly had7 fee/35 total and zero duplicated line fees;
the old test assertion checked the alias label instead of the actual fee mode.
Corrected assertion to PER_SUPPLIER_ORDER semantics and added actual R01 coverage
checks for each namespace/alias/unresolved-component case. Remaining tests after
the `-x` failure were NOT RUN. Same exact command rerun is recorded below.

Same exact affected command →30PASS,1DESELECTED,132.12s,exit0,session27685,
fee_bindings_final_retry.log. Actual R01 and actual worker agree on known alias,
foreign namespace and unresolved component coverage. This is the last source
change; no further implementation or test runner remains active.

### Final checkpoint — S4.9 COMPLETE authorized scope

All required C02/C03/worker/config capture/forecast orchestration/retained read
deliverables are complete within the accepted contract. CURRENT_STATE/ROADMAP,
feature/manual worker runbook, compatibility changelog and8 validated JSON
examples were updated. No new migration, accepted ADR change, handoff or ZIP.

Final commands after the last runner completed:

```powershell
$env:PYTHONPATH='.'
.\.venv\Scripts\python.exe runtime/s49/final_database.py
.\.venv\Scripts\python.exe runtime/s49/check_openapi.py
.\.venv\Scripts\python.exe runtime/s49/export_examples.py
.\.venv\Scripts\python.exe runtime/s49/check_docs.py
.\.venv\Scripts\python.exe runtime/s49/preservation_check.py
Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'python|pytest|uvicorn' } | Select-Object ProcessId,ParentProcessId,Name,CreationDate
```

Completion session27406,exit0. Exact local shelfcash_test guard PASS before DB
connect; head0016_planning_configuration,60 tables, no schema change. OpenAPI
2 new operations/paths,46 including health; old operation definitions unchanged
and old component shapes equal after explicit input/module reference renames.
JSON8/examples and local documentation links PASS. Process inspection returned
no Python/pytest/uvicorn processes. No interrupted/unverified command is counted
PASS; failures and deselected/not-run cases are explicitly recorded above.

HEAD/branch unchanged at a4b68378f35fea6f71b549e24393cf4bbb35aba5 /
feat/from_forecast_to_decision_run; index empty. Exact audited ZIP SHA unchanged.
Of535 preexisting paths,513 remain byte-identical and22 reviewed changed paths
are the authorized S49 integration/shared-boundary/tests/current-docs/flag files;
none deleted. Existing unrelated WIP, migration files, accepted authority/ADRs
and engine/domain implementation were preserved. Details in preservation.json.

Limits remain explicit: no full-suite/count aggregation, FE/browser acceptance,
trained activation/accuracy, simultaneous maximum lots/offers load or hard
cancellation/SLA verification. Cold50-Product retained decode latency is technical
debt. Optional manual uvicorn/operator flow is documented, not executed against
development runtime. Workers remain default-off; no live provider, development
DB, commit/stage/push/deploy, ZIP or S4.10 work. Next authorized roadmap scope
would be S4.10; this task does not begin it.
