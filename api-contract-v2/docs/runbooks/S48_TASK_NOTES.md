# S4.8 — planning configuration, readiness và forecast dependencies

## ACCEPTED DECISION — freeze 11/10/2026

Authorization: attachment f575a5d0-1d9b-4b7d-b8e4-a74884ba8f40, đọc nguyên văn.
S4.8 được giao; không S4.9/C02/C03 public worker, S4.10/history/PDF, S4.11 FE,
commit/stage/push/deploy/ZIP/handoff/provider/đổi engine. Baseline ZIP10/10 SHA256
238959dd16307ebd691834d2a679f7f80134495bbe99c56f29f7835f39bab6fd.
HEAD a4b68378f35fea6f71b549e24393cf4bbb35aba5, branch feat/from_forecast_to_decision_run;
index trống; broad S3/S4 WIP và ZIP cũ phải giữ. Snapshot ở ignored runtime/s48.

| Baseline contract | Current authority | Implementation trước S4.8 | S4.8 cần làm |
| --- | --- | --- | --- |
| PLAN14 N1–N4 | Exact routes/types/CAS/idempotency/ownership; Auth permissions-v2 | Pure setup resolver; chưa config persistence/HTTP | Atomic config/revisions/audit/receipts và N1–N4; saveable khác executable |
| IMP14 R01 | Selected-action whole deny, snapshot versions, estimated scope, NOT_ASSESSED | Chưa evaluator/HTTP; S4.6 có fee/declaration records | Detached canonical loader/evaluator/R01; runtime phản ánh composition thật |
| PLAN4/15.1 C01 | Exact setup fields/projection IMP14/P2 rights | Chưa HTTP | Setup/default/saved/budget + canonical readiness projection, no computation GET |
| IMP14.3 I06 | Pin post-write authorized readiness trong canonical transaction | Retained completion readiness NOT_ASSESSED/unknown | New completions retain snapshot; old receipts không backfill/recompute |
| ADR015/PLAN7/IMP14 | Explicit versioned serving registry, exact reuse/hash, bounded retries | Baseline/trained execution/retention/internal capture/PlanningRun | Registry/operator seam, typed prep/reuse/capture comparison; no public forecast route |

Authority read: AGENTS; CURRENT_STATE/DECISIONS; ADR007–015 và ADR020–022 relevant;
ARCHITECTURE/API/DOMAIN/SCHEMA/ROADMAP; Auth, PLAN4/7/14/15.1, IMP14;
audit remediation, S45/46/47 notes/features và compatibility. Proposals trong
historical labels không tự thành authority; exact user task adopts các S4.8 contract
surfaces. Model serving selection chưa có Store config được duyệt: không tự bật
trained/default mode; hỏi optional preference trong lúc làm phần config độc lập.

Acceptance trước edit: real guarded local shelfcash_test sequential, fresh Session
state/rollback/concurrency/replay, null/0/omit/inheritance, ownership/current rights,
read-only R01/C01, scope/declarations/coverage, I06 atomic immutable projection,
exact forecast identity/reuse/fallback/retry, affected resolver/Import/timeline/schema.
Không full-suite mặc định; gates overlap ghi riêng. Migration clean roundtrip và
refuse evidence loss nếu cần. OpenAPI offline diff + validated feature examples.

Rollback scope: chỉ S4.8 source/DTO/routes/config/readiness/forecast seams/migration/
tests/docs; không reset/restore broad WIP hoặc downgrade dev DB. BE config/Import/
forecast seams ảnh hưởng; FE cần sync N1–N4/R01/C01 và I06 projection cuối roadmap;
ML policy/minima giữ ADR015; demo manual walkthrough dùng synthetic data/test DB.
Observe → freeze → test → implement một vertical slice → targeted verify → document.

## Verification và checkpoints

Chưa có verification S4.8 PASS tại freeze; kết quả S4.7 là historical evidence.

### Checkpoint N1–N4/R01/C01

ACCEPTED DECISION bổ sung từ người dùng: operator được cấu hình BASELINE explicit;
không tự chọn mode/activate trained cho Store. Thêm supported operator command
cho BASELINE và default BASE95 đã approved; absent config giữ unknown, no backfill.

Exact prefix mọi test: `.\.venv\Scripts\python.exe -m pytest` từ backend.
Fixtures validate exact local shelfcash_test trước connect/reset; PG gates tuần tự.

| Command suffix | Kết quả | Fail→fix / coverage |
| --- | --- | --- |
| `-q tests/unit/test_planning_configuration_contract.py` | collection error, module absent | Red boundary gate trước implementation, không PASS. |
| `-q tests/unit/test_planning_configuration_contract.py tests/unit/test_planning_setup.py` | 88 passed/1 warning12.27s | Shared inheritance boundary và existing resolver; không persistence. |
| `-x -q tests/integration/test_planning_configuration_public.py` | 6 passed/1 failed12.39s | Real config/CAS/noop/archive/concurrency; failed test helper duplicate name kwargs, sửa helper. |
| `-x -q tests/integration/test_planning_configuration_public.py::test_actual_commit_ack_loss_reconciles_and_write_failure_rolls_back tests/integration/test_planning_configuration_public.py::test_staff_read_other_manage_own_owner_manage_all_current_revoke tests/integration/test_planning_configuration_public.py::test_transport_invalid_headers_body_limit_and_unknown_fields` | 1 passed/1 failed4.49s | Lost ACK/SQL rollback PASS; Staff fixture dùng sai permission_key, đổi exact ORM permission. Last case chưa chạy do -x. |
| `-x -q tests/integration/test_planning_configuration_public.py::test_staff_read_other_manage_own_owner_manage_all_current_revoke tests/integration/test_planning_configuration_public.py::test_transport_invalid_headers_body_limit_and_unknown_fields` | 2 passed4.46s | Staff own/other/current revoke, streaming body cap và wire errors. |
| `-q tests/unit/test_planning_configuration_contract.py tests/unit/test_planning_setup.py` | 88 passed7.47s | Current DTO/shared inheritance integration, overlap với88 trước. |
| `-x -q tests/integration/test_readiness_context.py` | collection error | Pydantic reserved model_config field; giữ exact wire alias model_config, internal field model_configuration. |
| `-x -q tests/integration/test_readiness_context.py` | 8 passed19.23s | Real snapshot/zero/history/7daytimeline/declarations/watermark/P2/actionrights/context/GET no canonical writes; no public planning execution. |

Migration0016 đang được hoàn thiện trong cùng slice/config task; test resets đã
apply trên shelfcash_test, chưa migrate development DB. Source/registry/seams còn
verification tiếp theo; không claim toàn S4.8 COMPLETE tại checkpoint này.


### Checkpoint internal seams / storage / compatibility

All command suffixes below use `.\.venv\Scripts\python.exe -m pytest` in backend.
No interrupted runner is counted PASS; every listed PASS has completed output and
exit0. Gates overlap and are never summed into a full-regression count.

| Exact command suffix | Actual result | Fail→fix / coverage |
| --- | --- | --- |
| `-x -q tests/integration/test_import_readiness_snapshot.py tests/integration/test_import_commit.py::test_http_commit_fresh_rows_retained_completion_and_same_key_retry tests/integration/test_import_inventory_supplier.py::test_sales_coverage_and_procurement_nested_declarations_are_stored_without_readiness_execution` | 1 passed/1 failed7.54s | Fault-injection test expected a return despite intentional RuntimeError; canonical/success evidence rollback was correct. |
| `-x -q tests/integration/test_import_readiness_snapshot.py::test_projection_storage_failure_rolls_back_canonical_and_success_completion tests/integration/test_import_readiness_snapshot.py::test_legacy_completion_unknown_projection_preserved_on_read tests/integration/test_import_commit.py::test_http_commit_fresh_rows_retained_completion_and_same_key_retry tests/integration/test_import_inventory_supplier.py::test_sales_coverage_and_procurement_nested_declarations_are_stored_without_readiness_execution` | 4 passed17.14s | Fixed expectation; post-write immutable snapshot/legacy retention/atomic failure verified on real PG. |
| `-x -q tests/integration/test_forecast_serving.py` | 6 passed12.37s | Explicit operator CAS/noop/unknown; exact reuse/relevant invalidation; corruption vs recognized fallback; real capture retries and closed sessions. |
| `-x -q tests/integration/test_planning_configuration_schema.py tests/integration/test_identity_store_schema.py::test_schema_exact_tables_constraints_indexes_and_metadata tests/integration/test_verification_commands.py tests/integration/test_database_bootstrap.py tests/integration/test_operational_import_schema.py::test_additive_migration_roundtrip_preserves_prior_tables_and_matches_model_columns tests/integration/test_recipe_schedule_schema.py` | 10 passed26.52s | Clean0016 roundtrip, full ORM compare_metadata=[], evidence/creator immutability, refusal to discard evidence, existing downgrade boundaries and exact DB scripts. Inventories updated to60 current tables. |
| `-x -q tests/integration/test_planning_configuration_resolution.py tests/integration/test_forecast_serving.py tests/integration/test_planning_configuration_public.py tests/integration/test_readiness_context.py tests/integration/test_import_readiness_snapshot.py` | 1 failed3.42s; remaining not run | New resolver test used non-UUID key archive-seam; runtime correctly rejected400. |
| `-x -q tests/integration/test_planning_configuration_resolution.py --tb=short` | 1 failed3.54s | Diagnostic confirms invalid test key; changed to fresh UUID. |
| `-x -q tests/integration/test_planning_configuration_resolution.py tests/integration/test_forecast_serving.py tests/integration/test_planning_configuration_public.py tests/integration/test_readiness_context.py tests/integration/test_import_readiness_snapshot.py` | 27 passed53.37s | Current config resolution owns no commit/Run; current cap0; archive refusal; actual/configured dependency and training window pins; all config/readiness/retention cases. |
| `-x -q tests/integration/test_readiness_context.py::test_context_unrepresentable_suggestion_is_null tests/api/test_health.py tests/api/test_auth_openapi.py tests/api/test_recipe_schedule_openapi.py tests/unit/test_planning_configuration_contract.py tests/unit/test_planning_setup.py` | 1 failed4.15s; remaining not run | Calendar-boundary fixture set unmapped created_at instead of AuthSession.issued_at; real expiry check correctly prevented inconsistent fixture. |
| `-x -q tests/integration/test_readiness_context.py::test_context_unrepresentable_suggestion_is_null --tb=short` | 1 failed4.33s | Direct application diagnostic exposes expiry check; corrected issued_at. No auth schema/policy changed. |
| `-x -q tests/integration/test_readiness_context.py::test_context_unrepresentable_suggestion_is_null tests/api/test_health.py tests/api/test_auth_openapi.py tests/api/test_recipe_schedule_openapi.py tests/unit/test_planning_configuration_contract.py tests/unit/test_planning_setup.py` | 93 passed13.20s | Null C01 suggestion, exact route inventory, accepted CAT12 unchanged, public DTO/shared inheritance resolver. |

Offline `$env:PYTHONPATH='.'; .\.venv\Scripts\python.exe runtime/s48/check_openapi.py`:
first FAIL caught component-name collisions (no wire-value change); uniquely named
new configuration notification and canonical completion issue/details eliminate
unrelated component churn. PASS: exactly6 operations/5 paths added; all prior
operation definitions identical; only CompletionActionReadiness and
CompletionReadinessIssue expanded. Total44 operations including health.

`.\.venv\Scripts\python.exe runtime/s48/check_preservation.py` PASS:
HEAD/index unchanged, no prior file lost, existing changes limited to explicit
S4.8 allowlist, Python AST parses. `git diff --check` PASS.
`$env:PYTHONPATH='.'; .\.venv\Scripts\python.exe runtime/s48/validate_examples.py`
PASS: five request DTO examples plus two detached SYNTHETIC response projections
and feature links. These examples are not persisted business state or PG evidence.

Schema remains local shelfcash_test head0016 after owned fixture resets. No
development DB/provider/real Store configuration/training job/engine policy change.
Forecast trained regression uses existing synthetic test artifacts only.
Internal dependencies are verified as seams, not public C02/C03 end-to-end.

Current additional affected gate is PENDING until completed output/exit evidence:
`-x -q tests/integration/test_import_commit.py tests/integration/test_import_inventory_supplier.py tests/integration/test_recipe_schedule.py tests/integration/test_forecast_execution_flow.py tests/integration/test_forecast_trained_execution.py tests/integration/test_forecast_decision_persistence.py::test_fresh_migration_exact_tables_and_downgrade tests/integration/test_catalog_recipe_schema.py::test_fresh_schema_and_downgrade_reupgrade tests/integration/test_supplier_operational_constraints.py tests/integration/test_data_semantics_correction.py`.
Observed only one pytest launcher/child tree; no duplicate runner or kill.


### Final checkpoint — S4.8 COMPLETE authorized scope

The previously PENDING affected gate completed exit0: **217 passed,4 warnings,
400.68s**. Exact command is recorded immediately above. Coverage includes actual
Import writers, CAT12 timeline, owned baseline/trained forecast lifecycle,
schema downgrade boundaries, existing supplier/constraint and correction semantics.
Selected coverage was broadened because0016 changes the common migration head and
I06 shares the transaction lifecycle; this is an affected regression gate, not the
full suite. S4.7 audit remediation remains resolved; H01/H02 stay with S4.10.

Final transport/application gate, prefix `.\.venv\Scripts\python.exe -m pytest`:
`-x -q tests/integration/test_planning_configuration_public.py tests/integration/test_readiness_context.py tests/integration/test_forecast_serving.py tests/integration/test_planning_configuration_resolution.py tests/integration/test_import_readiness_snapshot.py tests/api/test_planning_configuration_openapi.py tests/api/test_health.py tests/api/test_auth_openapi.py tests/api/test_recipe_schedule_openapi.py`
→ **37 passed,4 warnings,59.76s**, exit0. Additional current-source verification:
`-x -q tests/integration/test_readiness_context.py::test_unavailable_forecast_composition_keeps_valid_data_status`
→ **1 passed,4 warnings,3.45s**, exit0. No default full suite; overlap remains separate.

Final boundary changes: oversized/malformed header constraints yield400 rather
than configuration-field422; N1 rejects inapplicable conditionals, N3 rejects
If-None-Match; success ETag/Location and N4 create201 documented in OpenAPI.
Config errors have typed empty-meta DTOs. Scope bound is applied to actual estimated
computed Products, not total active menu (51 active/one computable verified).
Current membership revocation during detached artifact preflight denies the whole
snapshot. C01 nullable calendar suggestion uses a separate internal assessment;
R01 keeps required dates exactly as IMP14. A missing forecast composition yields
valid data plus unavailable execution, not a fake invalid-data failure.

Operator BASELINE is explicitly authorized by the user's answer; no development
Store was configured. Absence remains MODEL_CONFIGURATION_UNKNOWN. Existing
ADR015 selection, trained minima, recognized fallback, corrupt-artifact failure,
serialization and quantile behavior are unchanged. Current identity includes
actual/configured dependency versions and actual training dates. Caller-owned
config resolution and real same-snapshot operational facts/pins feed S4.9; no
public C02/C03/worker/PlanningRun acceptance was added in this slice.

Final offline scripts (PYTHONPATH=.) all PASS:
`runtime/s48/check_openapi.py` (6 operations/5 paths, old operations identical,
only two readiness components expanded), `runtime/s48/validate_examples.py`
(5 request DTOs/2 SYNTHETIC response projections and links),
`runtime/s48/check_preservation.py` (HEAD/index/WIP/AST),
`runtime/s48/final_database_state.py` (supported inspect_database after exact
validate_reset_target; shelfcash_test head0016,60 tables, no business rows).
`git diff --check` PASS. No active task pytest/worker remains after completion.

Documentation: CURRENT_STATE/ROADMAP current S4.8 completion; previous S4.7 status
explicitly historical. DATABASE_SCHEMA/API runtime annotations, canonical feature,
validated JSON examples and compatibility changelog updated. Accepted authority
documents/ADRs/source baseline ZIP remain unchanged. No handoff/ZIP/FE sync claim.

Limits: no public planning end-to-end, production trained quality/live artifact
activation, production/development DB migration, real provider or FE acceptance.
Planning workflow remains unavailable and readiness reflects that independently
of valid input. Default Import worker remains false. No test was left interrupted
or unverified in this S4.8 execution; historical S4.7 recorded results are reused
as historical evidence, not counted as newly run verification. No commit/stage/
push/deploy/ZIP/handoff or start of S4.9 occurred. Resume preserved the actual
S4.7 checkpoint and broad WIP; the newer attachment explicitly authorized S4.8.

Final `Get-FileHash -LiteralPath shelfcash_backend_context_handoff.zip -Algorithm SHA256`
matches238959dd16307ebd691834d2a679f7f80134495bbe99c56f29f7835f39bab6fd;
branch remains feat/from_forecast_to_decision_run, cached diff empty. Final
Win32_Process check contains no Python pytest/worker process; none was killed.
