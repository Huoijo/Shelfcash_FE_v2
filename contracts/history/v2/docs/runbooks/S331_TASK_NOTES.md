# S3.3.1 - Serving/FEFO output boundary hardening

Classification: CURRENT FACT / ACCEPTED DECISION / TECHNICAL DEBT.

## Pre-edit plan / acceptance / rollback

Explicit user authorization: output validation only; serving_fefo/1 shape/policy
unchanged. Read AGENTS, authority-order docs, ADR-017, SERVING_FEFO/S33 notes,
current contracts/use case/domain/tests. Existing WIP observed and hash-snapshotted.
Finding: ProductServingDay accepts canonical requested1/fulfilled2/lost0; aggregate
only validates Product coverage/status, not recipe/lot/Ingredient facts/conservation.

Add independent application validation helper, no simulator/allocator calls.
Standalone Product and Lot conservation and Ingredient shortage checks; aggregate
full unique row scopes, captured forecast/recipe/unit attribution, exact fulfilled
BOM, eligible lot openings/arrivals/continuity/expiry/FEFO, Ingredient reconciliations,
retained snapshot/issue/status consistency. Revalidation of JSON/copied models
inherits existing always-revalidate contracts. All business checks use canonical
ratios, not Decimal views. Bounds reuse exact()/checked() with existing 1000-digit
capacity; canonical ordering matches source aggregation to avoid permutation-based
numeric failures. No new technical cap; investigate before changing limits.

Acceptance: mutation tests from real valid output, including recipe-attribution
mutation preserving quantities; invalid standalone row, duplicate/missing/foreign
scope/unit/date/path, contribution amounts, lot balance/continuity/source opening/
arrival/expiry/FEFO, Ingredient metrics, erased blockers/provenance and partial
blocked output; copied/constructed/JSON outputs. Existing valid milk/complement/
expiry/arrivals/zero/repeating/permutation/isolation outputs must remain passing.
No fairness/optimality/full Decision-ready guarantee from conservation validation.

Verification: new mutation + existing serving/BOM/S3.1 boundary tests. This shared
boundary is opt-in and only the existing pure serving producer calls it; all direct
callers covered, no API/schema/writer/transaction change, targeted sufficient.
No full suite or PG/dev DB access. Docs/link/diff/hash checks and manual demo.
BE output rejection strengthened; FE/ML/Data/API/persistence untouched.

Rollback: remove new helper/mutation test/notes and reverse S3.3.1-only validator
edits in serving contracts and canonical docs. Preserve all pre-existing WIP and
source/domain/ADRs/S1/S2/S3.1/S3.2; no dependency/schema/data rollback required.
No commit/push/reset/migration/procurement/next slice.

## Evidence

CURRENT FACT, Windows/Python 3.11.9, 2026-10-07; actual commands:

1. `./.venv/Scripts/python.exe -m pytest tests/unit/test_serving_output_validation.py -q`
   TDD: 2 failed in 0.40s (no rejection of overfulfilled row / wrong dated recipe).
2. After validation implementation:
   `./.venv/Scripts/python.exe -m pytest tests/unit/test_serving_output_validation.py tests/unit/test_serving.py -q`
   => 32 passed in 2.87s (2 initial mutations +30 existing producer cases).
3. Expanded independent mutations, same mutation-file-only command:
   => 58 passed in 1.43s. Includes quantity-conserving wrong recipe, conserving FEFO
   swap with all later lot continuities corrected, partial/erased provenance,
   raw/copy/construct/JSON and no simulator invocation checks.
4. `./.venv/Scripts/python.exe -m pytest tests/unit/test_serving_output_validation.py tests/unit/test_serving.py tests/unit/test_bom.py tests/unit/test_decision_execution.py -q`
   => 202 passed in 4.53s (58 mutations +30 serving +33 BOM +81 S3.1).
5. Added two valid-extreme checks after that green group, no code change:
   `./.venv/Scripts/python.exe -m pytest tests/unit/test_serving_output_validation.py -k extreme -q`
   => 2 passed, 58 deselected in 0.41s. Exercises denominator length1000, repeating
   stock remainder whose Decimal display is1, and finite 1E+300 demand. Existing
   limits unchanged; no valid output rejected by new intermediates in these checks.
6. `./.venv/Scripts/python.exe -m scripts.demo_serving_fefo`
   => COMPLETE / NOT_ASSESSED / serving_fefo/1, A15/B7.5 with exact ratios, unchanged.
7. Inline Python schema comparison: extracts old app/ source from the existing
   shelfcash_S3_3_review_updated.zip into a temporary directory, imports in an
   isolated subprocess and compares model_json_schema for ProductServingDay,
   LotServingDay, IngredientServingDay and ServingSimulationResult. All four equal.

60 new mutation/valid-boundary cases; 204 distinct targeted passing cases across
these groups. Added tests are not represented as a new 204-case combined run.
No full suite/PG/OpenAPI test or DB access/reset/migration/commit/push. Existing
producer/domain/common/S3.1/S3.2 remain byte-identical. Only serving output contracts
and new independent application helper alter source behavior; public API unchanged.
Targeted covers all direct callers, so broad verification is not needed here.

Fixed: individual canonical quantities no longer suffice to fake conservation;
aggregate verifies captured scope/forecast/recipe attribution, exact consumption,
full zero-row grids, eligible lots/arrivals/source amounts/continuity/expiry/FEFO,
Ingredient metrics and retained snapshots/issues/status. Direct FEFO check compares
usable pre-close remaining against any later consumed stock; no allocator replay.

Limits: no fairness/optimality/authenticated capture/full Decision readiness proof;
old BOM calculation not recomputed. Equality of copied snapshots is coherence only.
Model-copy/construct alone bypasses Pydantic; explicit revalidation rejects bad data.
Numeric capacity remains1000, no epsilon/float/display business checks. A conserving
milk A10/B10 alternative passes independent invariants intentionally, despite actual
simulator producing accepted progressive A15/B7.5. Numeric failures keep prior typed
behavior; invariant/programming errors are refused, not converted into success.

Rollback: remove app/application/serving_validation.py and the new mutation tests/
notes; reverse only S3.3.1 methods/import in contracts/serving.py and associated doc
updates. No domain/use case, ADR/policy/schema/history/dependency rollback needed.

Document/WIP and ZIP checks recorded after final collection. S3.3.1 COMPLETE;
S3 remains IN PROGRESS. No procurement/next slice started.


Final read-only checks: pre-edit SHA-256 audit permits only contracts/serving.py
and CURRENT_STATE/ROADMAP/TESTING/SERVING_FEFO document edits among existing files.
All other app/tests/scripts/ADRs/migrations/AGENTS bytes unchanged; no missing files.
`git diff --check` clean. Inline Markdown local links: 55 checked, all valid.
Review bundle shelfcash_S3_3_1_review_updated.zip is an uncommitted worktree snapshot;
contains current source dependencies, targeted tests, canonical docs/notes, original
authorization, guide/status/manifest/omissions. Integrity/path/content checks performed
after writing; no tests rerun merely for packaging. No old ZIP embedded.
