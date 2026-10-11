# S3.4.4 verification evidence

Classification: CURRENT FACT; collected 2026-10-07/08. SYNTHETIC mechanics, not forecast
accuracy, calibration, real Store economics, recommendation quality or global MILP proof.

## Commands actually run

All Python commands use the existing `.venv/Scripts/python.exe`. No DB accessed,
no full pytest suite, migration/reset, API change, commit or push.

| Command | Actual result | Evidence |
| --- | --- | --- |
| `-m pytest tests/unit/test_procurement.py -q` (initial) | 41 passed, 2 failed, 29.41s | pytest_initial.txt |
| `-m pytest tests/unit/test_procurement.py -q -k 'deadline_fairness or full_state_parity'` | 2 passed, 1 failed, 1.66s | pytest_fix1.txt |
| `-m pytest tests/unit/test_procurement.py -q -k 'deadline_fairness or full_state_parity or scope_unit'` | 4 passed, 39 deselected, 1.85s | pytest_fix2.txt |
| `-m pytest tests/unit/test_procurement.py -q` (output hardening) | 56 passed, 29.31s | pytest_procurement.txt |
| `-m pytest tests/unit/test_procurement.py -q -k 'fee or fault or integer or target_met_unproven'` | 22 passed, 38 deselected, 8.98s | pytest_hardening.txt |
| `-m pytest tests/unit/test_procurement.py -q` (final) | **60 passed, 26.39s** | pytest_procurement_final.txt |
| `-m pytest tests/unit/test_procurement.py -q -k 'exclusion_numeric or exact_no_good or saved_decimal'` (after final small numeric guard) | **3 passed, 58 deselected, 2.56s** | pytest_cut_guard.txt |
| `-m pytest tests/unit/test_bom.py tests/unit/test_serving.py tests/unit/test_serving_output_validation.py tests/unit/test_decision_execution.py tests/unit/test_smoke.py -q` | **206 passed, 7.10s** | pytest_boundaries.txt |
| `scripts/demo_procurement.py --example target-met --seconds 15 --output runtime/s344/demo_target_met.json` | exit 0, all three pass; packs3, exact spend.3; finite certification | full result + summary |
| `scripts/demo_procurement.py --example zero-purchase --seconds 15 --output runtime/s344/demo_zero_purchase.json` | exit 0, stock10/budget0; packs0, all paths served10 | full result + summary |
| `scripts/demo_procurement.py --example numeric-miss --seconds 15 --output runtime/s344/demo_numeric_miss.json` | exit 0, exact just-above-.3 miss; fallback3/spend.3 | full result + summary |
| `scripts/demo_procurement.py --products 5 --seconds 15 --output runtime/s344/native_5p_15s.json` | exit 0; bounded search overall INCOMPLETE, retained exact fallback | full native result + summary |
| `scripts/demo_procurement.py --products 10 --seconds 15 --output runtime/s344/native_10p_15s.json` | exit 0; overall INCOMPLETE; native LIMIT with exact-validated incumbents | full native result + summary |

Raw files are included in review ZIP under runtime/s344/. Output was redirected to
the named logs/summary JSONs; shell command success is not business target success.
Initial demos/native6s predate the final raw extracted-count/version metadata addition;
their measured algorithm behavior remains historical evidence, not rerun claims.
An earlier inline native5P/6s measurement used explicit .001s reserve, retained zero
only (late native incumbents not validated), elapsed6.2393s/overrun.2393s. Its raw JSON
is retained. The supported representative demo now explicitly selects .5s reserve.

## What changed after failures

Initial deadline test depended on real 90ms timing and could skip the solver entirely.
It now uses a labelled controlled clock and verifies all three strategies receive
time, overrun remains visible and comparison is incomplete. Native fixed-zero parity
has zero-valued placeholder offer lots absent from canonical simulator; compare
canonical full keys plus verify every extra model lot field is zero. The next rerun
exposed captured assumptions ordering (canonical serving sorts it); procurement now
canonicalizes the snapshot at its boundary using existing BOM ordering, preserving
facts/issues. Re-ran only affected checks before the expanded procurement group.

## Assertions and their limits

The procurement file now contains 61 tests: 60 passed in the complete targeted group
before the last exclusion-range guard; three affected checks (including the new 61st
case) passed afterward. The remaining unchanged tests were not redundantly rerun.
Tests cover hand packs/cost/fees/MOQ, complementary/shared demand, supplier split
and exact supplier quantity limit, all-day dated yield/loss/expiry and gross capacity,
zero budget/stock baseline, distinct construction paths with all-path service, floors,
exact target/fee/service tie boundaries, source/scope/units/version/date/copy checks,
immutable capture and ambient context, independent output mutation rejection and
domain isolation. Saved target `.3000000000000000000000000001`: three packs serve3
of10 and fail by exact1e-27 quantity; eleven-vector complete enumeration certifies
no pass in budget. Just-at/below.3 pass. Exact service tie differs beyond float64.

Independent itertools oracle separately prices fees, checks constraints and compares
finite-domain objectives; it uses the same canonical fixed-basket serving engine.
It proves the selected finite cases against that evaluator, not an independent proof
of allocation semantics. Related 206 tests cover BOM/serving/output/contracts/callers;
unchanged S1/S2/database/API and whole repository regression were not rerun.

Native full-state parity: two fixed baskets on dated shared two-Ingredient/two-Product
scope with lots/expiry/lead/yield/loss; all product, contribution, lot and Ingredient
fields agree within a technical comparison tolerance. That tolerance is not applied
to business targets/budget/conservation. Native 3x3 two-pack grid confirms a no-good
excludes exactly (1,1). This finite evidence is not a universal MILP equivalence theorem.

Fault injections explicitly cover LIMIT with/without candidate, deadline before any
validation, interrupted certification, repeated excluded vector, cut failure,
programming/model status3/4 errors, and passing zero baseline retained on later bug.
These are labelled FAULT INJECTED, separate from the actual native observations below.

## Representative native measurements (not exhaustive oracles)

Topology: 5/10 Products, four Ingredients (g/ml), eight supplier offers, eight initial
lots, dated yield/loss change, distinct quantiles, shelf/lead, MOQ, once-per-supplier fee,
budget14 and gross capacity22 per Ingredient. 4^8=65,536-vector supplied domain;
enumeration DISABLED. Targets.8 and reserve.5s are explicit SYNTHETIC configuration.

| Case | Actual time /overrun | Native and exact evidence |
| --- | --- | --- |
| 5P/15s | 13.81035s /0 | LEAN/BASE fallback-service status0; fallback-cost LIMIT without new incumbent, earlier exact vector (2,0,2,0,2,0,0,0) retained. HIGH retained (2,0,0,0,2,0,2,0), native fallback-cost status0. All miss; UNPROVEN, overall INCOMPLETE. |
| 10P/15s | 15.71997s /.71997 | LOW fallback LIMIT without incumbent retains exact zero. BASE native fallback LIMIT with incumbent, gap.211344..., exact vector (2,0,2,0,2,0,0,0). HIGH LIMIT with incumbent gap.642142..., vector (2,0,0,1,2,0,0,0). Exact validated, miss; UNPROVEN/INCOMPLETE. |

No exact objective claim for these large domains or transform of native float dual
bound into canonical objective proof. Cooperative overruns demonstrate nonpreemptible
build/solve/validation. Original results are retained even if a subsequent run differs.
Final raw solver metadata names installed SciPy1.17.1 /NumPy2.2.6 /HiGHS1.12.0;
earlier raw files identify SciPy and bundled HiGHS, with exact installed version
separately inspected via scipy.optimize._highspy._core constants.

## Packaging checks

The bundle script checks unchanged preexisting WIP hashes except the four deliberately
updated documentation files, reads ZIP CRC, checks all manifest entries/hashes against
archived bytes and verifies filesystem source correspondence. Its generated verification
JSON is delivered beside/in the ZIP as applicable; manifest does not self-hash.
No environment/private keys, model weights, DB dumps, .git, old ZIPs or cache included.
