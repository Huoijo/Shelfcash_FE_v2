# S3.1 task notes

Classification: CURRENT FACT / ACCEPTED DECISION / PROVISIONAL POLICY / OPEN QUESTION.

## Pre-edit plan — 2026-10-07

Observed branch `feat/from_forecast_to_decision_run`, HEAD
`a4b68378f35fea6f71b549e24393cf4bbb35aba5`; working tree clean.
S2 source is committed. S2 implementation complete; real-data quality and LightGBM
superiority unproven. S3 domain packages were empty; S1 DecisionUseCases persists
caller-supplied opaque packages, not engine results.

Authority read: CURRENT_STATE, DECISIONS, ADR-005/010/011/014/015, ARCHITECTURE,
API_CONTRACT, DOMAIN_MODEL, DATABASE_SCHEMA, ROADMAP, TESTING, S2 feature/task notes,
current forecast/decision/recipe/inventory/supplier/constraint contracts and writers.
User's S3.1 attachment explicitly authorizes the scope and provisional coefficients.
Reviewed the existing `../shelfcash_competition_review.zip` decision briefing and
omissions selectively. It documents absent FEFO/procurement/readiness engines;
it is a historical Competition snapshot, not legacy source. No legacy backend or
frontend source is available in the workspace; no legacy algorithm was read/copied.

Freeze: new opt-in internal typed decision contracts and pure semantic validation;
versioned actual policy values; design/ADR and fourteen hand-calculated golden
specifications. Keep S1 opaque fixture lifecycle, S2, ORM/schema/API/dependencies intact.
Do not implement capture, BOM, FEFO, procurement, recommendation selection, HTTP,
LLM, stochastic mode, or the next slice. Missing facts differ from shortages.
Serving allocation and constrained budget allocation remain reviewer choices.

Acceptance: exact finite Decimal; immutable nested capture; dates/units/scope;
policy v1 consistency; no incomplete or hard-invalid selected candidate; fixed
orders, pack/MOQ/budget; three strategies x same three paths; metric null/reason;
business issues; recipe coverage; snapshot identity versioning design. Unit tests
exercise actual validators only, not a pretend simulator. Existing PostgreSQL S1
Decision lifecycle/fresh-session regressions verify compatibility. Targeted first,
supported full regression at final gate; generated OpenAPI unchanged.

Impact: BE adds opt-in contracts; FE/API unchanged; ML/Data untouched; demo gains
golden specification, no simulated demo/generator. No unrelated WIP initially.
Rollback: remove new S3.1 modules/tests/docs and revert only S3.1 documentation
edits. No DB downgrade/data rollback, dependency changes or API rollback necessary.
No commit/push, checkout/reset, development migration/reset, or S3.2 execution.

## Verification

Golden cases are specifications, not executed simulation or evidence of accuracy,
optimality, or prediction calibration. Checks below are newly run in this task;
S2's 767-pass result remains historical, not claimed as a rerun.

- Expected red before implementation: `./.venv/Scripts/python.exe -m pytest
  tests/unit/test_decision_execution.py -q` failed collection with missing new module.
  Implementation stages then passed 13 / 48 / 65 contract cases.
- Initial PostgreSQL/compatibility gate: `./.venv/Scripts/python.exe -m pytest
  tests/unit/test_decision_execution.py tests/unit/test_application_contracts.py
  tests/unit/test_smoke.py tests/unit/test_repository_contract.py
  tests/integration/test_forecast_decision_persistence.py
  tests/integration/test_application_paths.py -q`: **209 passed in70.05s**.
- Unit/API command: `./.venv/Scripts/python.exe -m pytest
  tests/unit/test_decision_execution.py tests/unit/test_application_contracts.py
  tests/unit/test_smoke.py tests/unit/test_repository_contract.py
  tests/api/test_health.py -q`: stages **118 passed in1.05s**, **121 in1.12s**,
  **122 in1.31s**, final **125 in1.07s**. One existing Starlette/AnyIO warning.
- First full `./scripts/test.ps1 all`: **841 passed in319.50s**, no skips,
  one existing warning. This was an intermediate code snapshot, superseded below:
  while it ran, targeted edge probes revealed a timezone-conversion OverflowError
  escaping validation and Python equality conflating two DST fold instants.
  UTC normalization/guarded Store-local conversion fixed those in NEW S3.1 code;
  three regressions added. Exponent-bound service check prevents fake underflow0;
  business issue scope checks added. New modules separated into snapshot/policy,
  output shapes and output validator; S1/S2 modules remain unchanged.
- Read-only probes used date9999/Kiritimati and New_York fold0/fold1; observed both
  defects before fixing. Targeted tests now reject both with ValidationError.
- Hash audit: all original app/tests/alembic files preserved; only seven original
  docs changed. Generated OpenAPI equals pre-edit snapshot (`/health` only), 14
  golden sections present, new local doc links valid, `git diff --check` clean.
  Audit metadata is outside Git, referenced by ignored runtime/s31_audit_path.txt.

Final targeted command (same six files as the initial PostgreSQL gate): **225 passed
in59.16s**, including 81 S3.1 contract cases. All business-output fixtures are supplied
by tests; no candidate generator/FEFO simulator is stubbed or claimed implemented.
Final full `./scripts/test.ps1 all`: **848 passed in300.21s**, no skips, one existing
Starlette/AnyIO warning. Counts389 unit /457 PostgreSQL /2 API. No source changes
after the final green gate; only final verification/status documentation updated.
Two full attempts, both green, with intermediate code explicitly superseded.

Fresh-session evidence is existing real PostgreSQL compatibility coverage, not new
engine persistence: `test_decision_json_fresh_reload_rerun_and_independent_values`
asserts copied historical JSON after live inventory changes and distinct rerun IDs;
application paths assert atomic completion/read, same-Store completed Forecast
requirement, failed/terminal guards, rollback and stale Session lifecycle refresh.
The old fixture packages still work without retroactive S3.1 validation.

Read-only `./scripts/db_status.ps1 -AllowUnmigrated`: reachable shelfcash, PostgreSQL
17.11, development remains0006, repository head0008, sixteen empty business tables,
one revision row. No development migration/reset/seed; test fixtures own shelfcash_test.

## Usable manual contract check — no DB

From backend PowerShell:

```powershell
@'
from tests.unit.test_decision_execution import snapshot_data, package_data
from app.application.contracts.decision_execution import PreparedDecisionInput
from app.application.contracts.decision_package import DecisionPackageV1
from app.application.decision_validation import validate_decision_package
source = snapshot_data()
snapshot = PreparedDecisionInput.model_validate(source)
source['recipes'][0]['lines'][0]['quantity'] = '999'
assert str(snapshot.recipes[0].lines[0].quantity) == '1'
package = validate_decision_package(snapshot, DecisionPackageV1.model_validate(package_data()),
                                   expected_input_fingerprint='decision-fixture')
print(package.recommendation.status, package.recommendation.strategy, len(package.evaluations))
'@ | ./.venv/Scripts/python.exe -
```

Expected `TARGETS_MET LEAN 9`. This validates supplied hand fixtures, not engine
computation, persistence, replay execution or calibrated service. No network/LLM/DB.
The exact manual command above was executed and returned `TARGETS_MET LEAN 9`.

OPEN QUESTION recorded: S1 completed persistence requires a winner; no-winner typed
outcomes need separately approved persistence handling before end-to-end wiring.

## Final state

S3.1 COMPLETE for contracts/design only; S3 overall IN PROGRESS. S3.2 not started.
No remaining failing verification gate in this slice. Allocation, degraded ranking
and no-winner persistence choices remain open for their separately authorized slices.
Branch/HEAD unchanged from the pre-edit plan; seven tracked documentation edits and
nine new slice files; no commits/staging/push. All unrelated context ZIPs preserved.
`python -m pip check` reports no broken requirements; `git diff --check` passes.
Final source hash/OpenAPI/doc-link audit confirms the green-gate source unchanged.
