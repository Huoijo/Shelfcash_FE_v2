# S3.4.1 - Procurement design and optimization formulation

Classification: CURRENT FACT / PROPOSAL / HISTORICAL INFORMATION.
Explicit user authorization: design and scratch verification only. Money-affecting
correctness, complete constraints and auditability take priority over demo simplicity.
ADR-017 heuristic choice reopened by user; no replacement engine ACCEPTED here.

## Pre-edit plan, verification and rollback

Read AGENTS and authority-order docs, ADR-016/017, current supplier/decision/serving
contracts, exact domain evaluator and output validator. Current branch
feat/from_forecast_to_decision_run, HEAD a4b68378f35fea6f71b549e24393cf4bbb35aba5.
S3.2/S3.3/S3.3.1 source present; no procurement engine. Preserve every existing WIP.
Also preserve newly supplied untracked PROCUREMENT_TRIAL_PURCHASE_REPORT.md.

Legacy accessible as backend/shelfcash_legacy_review.zip (not literal (1) filename).
Inspect selected core optimizer/formulations/critic/expiry/inventory/adapter/economics/
package writer/tests statically. No legacy code execution or schema/API adoption.
Copy selected files to ignored runtime/s341/legacy_reference with original paths
for cited evidence and focused review bundle; no env/config/runtime data copied.

Deliver procurement design/formulation/golden specs and a PROPOSED superseding ADR
for the reopened engine direction only, plus current-state/roadmap classification.
Keep serving/FEFO/no-winner/strategy directions unchanged. No production code,
contracts/schema/API/DB/persistence/PO/movements/commit/push or implementation slice.

Prototype in ignored runtime/s341 only: exhaustive finite tiny offer grids evaluated
by existing pure serving entrypoint, hand assertions, optional SciPy milp toy with
installed dependencies. Verify complementarity/shared Ingredient/offer-MOQ/zero/
arrival-expiry/capacity/greedy trap/fairness mismatch/ties. Enumerated domains and
proof limits explicit. Timeout golden cases may use explicitly synthetic result
records; never claim simulated records are real solver timeout evidence.
No full pytest: docs/scratch-only changes; run actual scripts/assertions, local links,
hash/diff checks. No model accuracy/production benchmark or legacy tests claimed.

Freeze proposed numeric approach: integer packs, exact price/constraint post-check,
bounded rationals from current evaluator; float64 solver coefficients only for
candidate generation/relaxation and solver-bound evidence with explicit caveats.
Mismatch candidates cannot be published as target-met: exact rejection, finite-domain
no-good/repair re-search under one deadline; preserve validated incumbent, incomplete
search/unknown feasibility when unresolved. Detailed proof/constraints in formulation.

Rollback is new docs/proposed ADR and S3.4.1-only current-state/roadmap/design-index
edits, ignored scratch experiment artifacts and review ZIP. Preserve all earlier WIP,
legacy ZIP/report/source. No data/schema rollback needed. FE/ML/Data/API unchanged.

## Evidence and results

Executed on 2026-10-07 in the existing venv (Python3.11.9, SciPy1.17.1):

```
./.venv/Scripts/python.exe runtime/s341/procurement_experiments.py
```

First run: all assertions passed,12cases/58grid vectors,4.242949899999985s.
Added an actual single-move greedy comparator (not ADR-017 joint heuristic), then
reran the same command: all assertions passed,4.756902400000399s; results.json
matches the final script. Complementarity comparator0 versus exhaustive5;
greedy trap5 versus8. Actual surrogate milk MILP status0 predicts28.5 with0packs,
current serving gives27.75; excluding0 and buying1 gives28.5. Actual native
zero-time-limit call status1/no incumbent. Timeout-with-valid-incumbent examples
are synthetic records, not observed termination or tested production classification.

Existing simulate_serving and output contracts evaluate each candidate on all
three identical toy paths. Explicit scratch-only guards add configured capacity,
offer bounds/MOQ/budget/supplier exclusivity and a proposed objective. No capture
extension or production optimizer is wired. A policy-faithful unrolled progressive
MILP/FEFO formulation is analytical PROPOSAL, not solver-implemented or verified.
Whole-grid proofs apply only to those finite synthetic domains, not business-scale
quality, forecast accuracy or general optimization. No arbitrary probabilities.

Legacy ZIP561entries inspected statically through a source whitelist. Core delivery
fees/supplier limits are not propagated by its adapter; shared store capacity is
not evaluated without volume metadata. Adapter docstring/report says residuals
never optimize but code branches to risk_scenarios in stochastic mode; selector
and runtime combination remain unexecuted. Native critic rejects non-OPTIMAL
incumbents and probes use independent time limits. Expiry handling differs for
not_required Ingredients. DESIGN cites exact files/symbols/lines; no legacy API,
solver/simulator tests or report's historical command results were rerun.

Read official SciPy milp primary documentation and local installed docstring/status
interface for float64/status/options semantics; no dependency installed/changed.
No pytest, full regression, OpenAPI build or DB access was necessary/performed:
only docs and isolated scratch changed, existing app/contracts are preserved.
Document links, worktree-preservation audit, git diff and ZIP checks below are
separate from historical S3.3.1 test evidence.

Additional actual checks:

```
./.venv/Scripts/python.exe runtime/s341/verify_context.py
git diff --check
```

Document check passed:76 local links resolve. SHA-256 audit of240 pre-existing
files shows only CURRENT_STATE, DECISIONS, ROADMAP and DECISION_DESIGN changed;
no missing files or unexpected mutations. Existing app/tests/scripts/migrations,
AGENTS, accepted ADRs and supplied trial report remain byte-identical. New docs,
proposed ADR and ignored scratch files are additional. git diff --check passed.
The portable pre-edit hash inventory is retained in scratch for review; it is
verification evidence, not an input-retention implementation.

Review ZIP generation and integrity command:

```
./.venv/Scripts/python.exe runtime/s341/build_review_zip.py
```

This command packages current files, a sanitized tracked worktree patch and exact
manifest hashes, then checks ZIP CRC/integrity, manifest membership/hash equality
and packaged-source equivalence. Archive-local guides explain omissions and any
configuration redaction; no .env, nested ZIPs, database dumps or binary models.
Archive validation results are recorded in runtime/s341/archive_check.json after
the command succeeds; no test/benchmark claims are inferred from archive checks.
