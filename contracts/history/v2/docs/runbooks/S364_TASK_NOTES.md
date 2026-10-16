# S3.6.4 — durable internal planning

## Frozen work plan before implementation — 2026-10-09

Authorization: explicit S3.6.4 user task. Internal persistence only. Preserve all
existing WIP, seventeen archives, S1 DecisionRun and S2 lifecycle. No HTTP/auth,
worker service, auto forecast, config CRUD, orders, development DB or ZIP.

Current contract: planning_resolution/1 → operational_capture/2 → pipeline/2 →
selector/1. S1 COMPLETED requires recommendation; separate additive PlanningRun
is the chosen implementation detail, not reinterpretation of historical packages.
ADR-005/007/011/014/020/021 and PROCUREMENT_API_CONTRACT_VI govern boundaries.

Plan: versioned exact JSON + typed aggregate; additive migration; atomic acceptance
and scoped idempotency; short locked claim/retain/finalize; fresh detached reads;
process identity liveness with no expiry-based death inference. Extract a pure
captured-pipeline entrypoint preserving existing computation. Retain capture before
solver and validate retained identity on finalization/read. No live reconstruction.

Acceptance: canonical request presence/numeric equivalence; forged resolution,
serialization/version/hash corruption; all outcome mappings; concurrency/rollback,
scope, fencing, immutable terminal writes; genuine uncertain commits vs programming
errors/cleanup; real PostgreSQL migration/S1 compatibility and fresh-session
stock/purchase/no-winner/partial/recovery evidence. Reads never invoke solver.

Verification scope: new unit/PostgreSQL tests, S1 persistence/application/repository,
S2 commit boundary and affected S3 resolver/pipeline/capture regressions. Schema is
additive, old writers untouched; broaden only if these checks reveal wider impact.
Use guarded shelfcash_test only. No benchmark rerun or automatic full suite.

Affected: internal BE persistence/composition and schema-verification seed guard;
no public FE/API/ML/data policy change. Existing synthetic small fixtures are
mechanics evidence, never model accuracy or production latency.

Rollback: remove only new slice files; reverse this slice's model registration,
pipeline extraction and documentation additions using the recorded pre-edit hashes.
Migration downgrade drops only new planning history; no development downgrade or
reset is authorized. Never git checkout/reset unrelated WIP. Baseline hashes/status
are retained locally under runtime/s364 (not credentials or DB dump).

## Verification

Guard before fixtures: parsed test_database_url only, required local host and
exact shelfcash_test name, environment=test, validate_reset_target, then
SELECT current_database()/SHOW server_version. PASS, PostgreSQL17.11 at
127.0.0.1. No development connection. Fixtures own reset/migration of disposable
test schema; migration0009 was applied there only. Admin postgres catalogue access
is the existing fixture mechanism, not access to development shelfcash.

Commands use `.venv/Scripts/python.exe`; output captured via PowerShell
`2>&1 | Tee-Object runtime/s364/<log>; exit $LASTEXITCODE`.

1. `-m pytest tests/unit/test_planning_run.py -q` — initial22 passed133.07s.
2. `-m pytest tests/integration/test_planning_run.py -q -x` —11 passed/1 failed
   266.17s. Test injection incorrectly faulted lookup autoflush before insert;
   moved fault to the explicit write flush after acceptance insert.
3. `-u -m pytest tests/integration/test_planning_run.py -v --tb=short --durations=8`
   —23 passed/1 failed205.35s. Real Windows liveness defect: OpenProcess can succeed
   for an exited process whose handle remains open. Fixed by SYNCHRONIZE access
   and WaitForSingleObject(handle,0), preserving UNKNOWN on unsupported/error.
4. `-u -m pytest tests/unit/test_planning_run.py tests/unit/test_planning_setup.py
   tests/unit/test_planning_small_domain.py tests/unit/test_decision_pipeline_v2.py
   tests/unit/test_forecast_execution.py tests/unit/test_application_contracts.py
   -q --tb=short` —273 passed200.98s, six expected serializer warnings for deliberately
   forged numeric inputs. This gate preceded later narrowly scoped cleanup/liveness
   and diagnostic timing changes; affected reruns below are the final evidence.
5. `-u -m pytest tests/integration/test_planning_run.py -k 'not actual_capture_pipeline
   and not concurrent_claim and not additive_migration' -v --tb=short`
   —22 passed/6 deselected78.50s. Includes atomic rollback, key races, actor/Store
   scope, caller ownership, no TTL, typed read/accept retry cleanup, post-commit
   programming errors, genuine uncertain accept/completion, known40001 failure,
   primary-preserving rollback/close, rehashed input/result semantic corruption and
   then-current process-death recovery. Final recovery is strengthened below to
   a real child process claiming through PostgreSQL (no owner-row injection).
6. `-u -m pytest tests/unit/test_planning_run.py -q --tb=short`
   —25 passed105.00s. Final unit arithmetic/request/versions/input/result digests,
   forged captured boundary and exact1/3 round-trip included.
7. Schema/S1/S2/capture caller regression command:

```powershell
.venv/Scripts/python.exe -u -m pytest tests/integration/test_database_bootstrap.py tests/integration/test_identity_store_schema.py tests/integration/test_catalog_recipe_schema.py tests/integration/test_supplier_operational_constraints.py tests/integration/test_data_semantics_correction.py tests/integration/test_forecast_decision_persistence.py tests/integration/test_repositories.py tests/integration/test_application_paths.py tests/integration/test_verification_commands.py tests/integration/test_forecast_execution_flow.py tests/integration/test_forecast_execution_s1_regression.py tests/integration/test_decision_operational_capture.py tests/integration/test_decision_operational_v2.py tests/unit/test_forecast_commit_errors.py tests/unit/test_repository_contract.py tests/unit/test_repository_guards.py tests/unit/test_database_config.py -q --tb=short
```

438 passed312.79s. Exact table/head assertions now include the additive table;
old integrity/lifecycle assertions were preserved. Bootstrap down/up, metadata
agreement, historical S1 supplied-output/empty S2 completion, caller transaction
conventions, S2 commit classification/cleanup, and both PostgreSQL snapshot
adapters pass. These tests cover this schema/transaction boundary rather than
automatically running all unrelated ML/evaluation/engine tests.

8. `-u -m pytest tests/api/test_health.py -q` —2 passed0.29s, existing AnyIO
   deprecation warning. No public API changed; this is the unchanged health/route
   boundary check, not an implemented C01/C02/C03.

9. Final end-to-end/recovery affected rerun:

```powershell
.venv/Scripts/python.exe -u -m pytest tests/integration/test_planning_run.py -k 'actual_capture_pipeline or concurrent_claim or additive_migration or durable_queued or programming_after or failure_recording' -v --tb=short --junitxml=runtime/s364/final_flows.xml
```

9 passed/19 deselected180.16s. Four pytest record_property/xunit2 compatibility
warnings are report-format warnings, not missing assertions. XML retains measured
fresh-read properties; runtime/s364/read_timings.json records stock1.506s,
purchase2.716s, certified no-pass8.399s, verified partial1.736s (one run, tiny
synthetic fixtures, validation/load/cleanup elapsed, not SLA/representative benchmark).
All four flows use the actual PostgreSQL operational adapter, durably retain capture
before solver, then persist/read exact results after changing current inventory.
Read observes one planning SELECT, no live operational queries or solver calls.
Completed winner: stock exact outlay0 and purchase. Completed no-winner: captured
finite no-pass, not timeout. Failed retains verified partial recommendation.
Fresh historical S1 DecisionRun survives0008→0009 migration and its old reader.
Real spawned child claims using a guarded PostgreSQL Session, closes it and exits;
recovery verifies OS death, while an alive parent-owned Run remains running.

10. Provider ownership affected guard:

```powershell
.venv/Scripts/python.exe -u -m pytest tests/integration/test_planning_run.py -k 'resolution_provider or concurrent_acceptance or retry_before_new_config' -v --tb=short
```

5 passed/26 deselected4.21s. Commit/rollback/pending ORM writes by a resolution
provider reject without an acceptance; concurrent-key and retry behavior still pass.
This validates a trusted transaction seam, not an implemented DB config adapter.

11. After annotation-only cleanup, import/application boundaries and immutable
request/version/process cases:

```powershell
.venv/Scripts/python.exe -u -m pytest tests/unit/test_application_contracts.py -k 'application_import or application_has_no' tests/unit/test_planning_run.py -k 'application_import or application_has_no or omitted_null or constructed_aggregate or real_local_process' -q --tb=short
.venv/Scripts/python.exe -u -m pytest tests/unit/test_planning_run.py -k large_internal_counter -q
```

10 passed/53 deselected1.08s; final independent large-counter assertion1 passed/
25 deselected0.75s, verifies2**100+1 remains an exact Python/JSON integer.
12. Final ownership/transition review guards:

```powershell
.venv/Scripts/python.exe -u -m pytest tests/integration/test_planning_run.py -k own_sessions -q --tb=short
.venv/Scripts/python.exe -u -m pytest tests/integration/test_planning_run.py -k 'repo_transition or concurrent_claim or durable_queued' -q --tb=short
```

1 passed/30 deselected1.60s;4 passed/29 deselected30.21s. Enforce real Engine at
construction: a Session bound to caller Connection could otherwise commit only an
inner boundary and falsely verify uncommitted outer data through that same binding.
Caller Connection/Session reject without altering caller WIP. Private repository
transition helper now explicitly guards legal states, immutable start/claim/input/
declarations and prior durable capture for result; no general update/delete writer.
Direct privileged ORM/SQL access remains outside that guard, as documented.
Valid completion/fencing and real child-process interrupted recovery reran and passed.

Total new coverage:26 unit and33 PostgreSQL cases, verified across the listed
affected groups (not33 cases in a single final run; counts across gates overlap).
No full suite or large benchmark.
Historical previous slice results are not counted as tests run in this task.

Status: S3.6.4 COMPLETE internal scope, PostgreSQL acceptance PASS. S3 overall
IN PROGRESS; no subsequent slice, development migration, commit/push or ZIP.

## Preservation / concurrent context

Before hashes captured367 existing first-party/context files including17 ZIPs.
Existing ZIPs, preexisting ADRs/models/migrations are unchanged except explicit
model registration. The only existing computation file touched is /2 pipeline's
captured continuation extraction; original arithmetic/serving/search/selection
remain unchanged. scripts/dev.py only adds current table to its no-op seed guard;
seven legacy schema-test files update expected head/table sets, not business checks.

Observed concurrent documentation change: PROCUREMENT_API_CONTRACT_VI.md now
includes section14 consolidated planning-configuration design, timestamp11:29:46
local during this task. This task did not edit that file. Its C02/retention rules
remain compatible; config/saved/budget CRUD and auth/CAS adapter are still outside
S3.6.4. Preserve it as unrelated WIP, not a patch contribution or runtime claim.

## Known limits

No public auth/HTTP/C03 projection, DB config/saved storage, worker service,
automatic forecast/reuse, order or selected_option. Source is trusted internal;
configuration provider seam is not proof of atomic DB config reads. Privileged
SQL can rewrite rows/hashes; integrity is not authenticity. Windows OS liveness
is exercised; Linux branch is implemented but not executed on this host. Living
process thread-only abandonment stays running; foreign/unknown owner cannot be
declared dead. No arbitrary timeout, automatic retry, expiry or purge.

Fault injection uses actual SQLAlchemy OperationalError wrapping psycopg transport
errors, plus server SQLSTATE40001. It is not a real network-disconnection experiment.
Read validates a deeply nested exact result graph and can be expensive; no SLA.
Input/result verification may replay pure exact checks, never solver/live facts.
Synthetic fixture forecasts are supplied values, not accuracy/quality evidence.
