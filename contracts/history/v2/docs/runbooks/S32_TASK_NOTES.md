# S3.2 — Pure dated BOM task notes

Classification: CURRENT FACT / ACCEPTED DECISION / TECHNICAL DEBT / OPEN QUESTION.

## Pre-edit plan and arithmetic freeze

User explicitly authorizes pure snapshot-driven BOM only, under ADR-016. Read
AGENTS/CURRENT_STATE/DECISIONS/ADR-016, architecture/API/domain/schema/roadmap,
DECISION_DESIGN/GOLDEN_CASES and current captured/recipe/path contracts and tests.
Existing S3.1 and verification-policy WIP preserved; no commit/push or next slice.
No S1/S2 logic, schema/migration, public API, loader/DB, inventory/FEFO/netting,
supplier/procurement/strategy construction/simulator/recommendation or LLM changes.

Contract: public pure application function revalidates PreparedDecisionInput, builds
LOW/BASE/HIGH from copied quantiles, maps to plain frozen domain values, expands
each Product/day's inclusive recipe. Return typed paths, contributions and design
Ingredient totals plus immutable canonical source snapshot and dated diagnostics.
Unused Ingredients do not acquire synthetic demand. Zero demand still needs recipe.
Missing/empty recipes admitted by S3.1's object-specific blocker rule => DATA_BLOCKED
with Product/day diagnostics and no partial outputs. Malformed scope/unit/overlap/
copied input => existing validation rejection, not fallback. Other snapshot blockers
may permit BOM COMPLETE, but decision_readiness remains DATA_BLOCKED; otherwise
NOT_ASSESSED, never a new whole-Decision readiness guarantee.

Arithmetic frozen before implementation: rational q*line/(yield*(1-loss)), with
decimal power carried separately to avoid expanding huge quantity exponents into
giant integers. Single Decimal division boundary, precision50/ROUND_HALF_EVEN,
Emax=MAX_EMAX/Emin=MIN_EMIN; underflow/overflow/invalid/nonfinite cannot become zero.
Exact subnormals allowed only when no underflow precision loss occurs. Totals sum
the exported contributions exactly in an owned context with sufficient precision;
no epsilon, serving/integer/currency rounding or second precision50 cap.
Explicit technical resource limits (not business/readiness quality thresholds):
10000 source coefficient digits, loss decimal scale10000, exact aggregate working
precision10000. Unsupported capacity => ARITHMETIC_BLOCKED with a diagnostic;
no approximate sum or partial success. Numeric errors use controlled codes, not raw
exception strings. Limits belong to dated_bom/1 arithmetic, not shared S1 contracts.

Acceptance tests: hand-independent yield/loss, recipe date switch, shared/multiple
Ingredients/units, zero/full ordered paths, missing/empty/invalid recipe, repeating
division/exact exported sums, hostile ambient contexts, order/mutation independence,
captured-only provenance, revalidation and extreme numeric failure/no fake zero.
Relevant portions of golden G01/G09/G12/G13/G14 become executable BOM checks only;
their procurement/simulation/recommendation/replay persistence portions stay specs.

Verification selection: new BOM tests, existing S3.1 tests (81 cases) and recipe
shape regressions that the snapshot embeds. No recipe writer, repository, transaction
or public contract changes: PostgreSQL/full suite not needed unless evidence expands
impact. Domain import isolation included. Document links/diff/hash audit for docs/WIP.
After small fixes rerun affected/failing tests only; report exact commands/limits.

BE impact: pure opt-in entrypoint/new output types; FE/ML/Data/API/persistence unchanged.
Rollback: remove new BOM modules/tests/docs and reverse S3.2-only doc edits; preserve
all pre-existing WIP. No DB/API/dependency rollback required.

## Execution evidence

CURRENT FACT, Windows/Python 3.11.9, 2026-10-07. No commit/push/DB commands.

- TDD: `./.venv/Scripts/python.exe -m pytest tests/unit/test_bom.py -q`
  initially failed collection because the new module did not exist. First implemented
  run: 5 failed/1 passed (tuple `.sort()` in new snapshot canonicalization). Fixed
  new module only; same command => 6 passed in 0.09s.
- Expanded group, same command => 24 passed/3 failed in 0.39s. The failing extreme
  fixtures exceeded the pre-existing Pydantic NonnegativeDecimal acceptance range,
  not just Decimal exponent bounds. A read-only TypeAdapter probe demonstrated both
  string and Decimal('1e2000000') are rejected; small negative exponents remain exact.
  No shared contract was changed. Public tests now cover valid extreme inputs and
  typed output-boundary failures; pure-domain tests cover Decimal MAX_EMAX itself.
  Output-range check catches only Pydantic finite_number; other bugs still propagate.
- Same BOM command after corrections/new G01/G13/domain assertions:
  **30 passed in 0.29s**.
- `./.venv/Scripts/python.exe -m pytest tests/unit/test_bom.py tests/unit/test_decision_execution.py -q`
  => **111 passed in 0.66s** (30 BOM + 81 unchanged S3.1 cases).
- `./.venv/Scripts/python.exe -m pytest tests/unit/test_operational_contracts.py -k recipe -q`
  => **7 passed, 45 deselected in 0.05s**. Recipe shape reused in snapshots; no
  writer/repository change, so unrelated DB transactions are not exercised again.
- Added independent half-even ties and near-one loss guards:
  `./.venv/Scripts/python.exe -m pytest tests/unit/test_bom.py -k 'half_even or near_one' -q`
  => **3 passed, 30 deselected in 0.13s**.
- Final new BOM group (33 cases together), same full BOM-file command:
  **33 passed in 0.25s**. Unchanged S3.1/recipe groups were not redundantly rerun.
  There are 121 distinct passing targeted cases across these groups; this is not
  a full regression result. No full suite, PostgreSQL test, migration/reset or API
  check run: no API/schema/transaction/shared-boundary changes. S3.1 historical
  848-pass full gate is historical, not evidence of running the S3.2 full suite.

Actual assertions prove dated inclusive selection, full forecast path scope, exact
units, whole-yield/loss, zero/missing distinction, shared Ingredient conservation,
exact sums of recurring exported rows, half-even ties, hostile ambient contexts,
near-one loss, immutable/order-independent capture, copied-input rejection,
nonfinite/float/bool rejection, no fabricated underflow zero, overflow/capacity/
output-boundary diagnostics and framework-free domain imports in a fresh process.
G01/G09/G12/G13 and captured-only G14 are executable BOM subsets. No procurement,
FEFO, simulator, recommendation, persisted replay or forecast-accuracy proof.

Routine implementation choices: result separates BOM status from NOT_ASSESSED /
DATA_BLOCKED Decision readiness; returns full canonical immutable snapshot rather
than inventing a hash/retention contract; records all dated recipe gaps but first
ordered numeric failure; numeric capacity 10000 and unchanged output-boundary range
are explicit technical limitations. No policy changes to serving/budget/no-winner.

Document/link/WIP audit results follow after final checks. Rollback scope unchanged:
remove four new BOM modules, BOM tests/feature doc/task notes and reverse only S3.2
edits in current-state/roadmap/design/goldens/architecture/domain/testing. Preserve
pre-existing S3.1 and verification-policy WIP. No dependencies/DB/API rollback.


Final read-only/document checks:
- `git diff --check` passed without output.
- Inline Python SHA-256 audit against the pre-edit snapshot: no existing app/tests/
  migrations/ADRs/AGENTS file changed or disappeared. Existing S3.1 source/tests,
  ADR-016, S1/S2 source/tests and verification rules remain byte-identical. Only
  the planned S3.2 documentation edits differ among pre-existing files.
- Inline Python Markdown local-link check: 66 links checked, no broken paths.
- `git branch --show-current`: feat/from_forecast_to_decision_run.
  `git rev-parse HEAD`: a4b68378f35fea6f71b549e24393cf4bbb35aba5 (unchanged).
- No OpenAPI/schema change; no development DB access, full pytest or PostgreSQL
  check in this slice. No API/transaction/persistence success is inferred from units.
- New files: application/contracts/bom.py, application/use_cases/bom.py,
  domain/demand/arithmetic.py, domain/demand/bom.py (under app/), tests/unit/test_bom.py,
  docs/features/BOM.md and these task notes. Existing unrelated WIP retained.

S3.2 COMPLETE within the authorized pure BOM scope. S3 remains IN PROGRESS.
PROPOSAL only: next pure inventory/FEFO simulation foundation. Reviewer must keep
serving allocation, budget allocator and no-winner persistence OPEN until explicitly
approved; no next-slice implementation was started.
