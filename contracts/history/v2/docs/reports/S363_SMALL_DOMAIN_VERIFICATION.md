# S3.6.3 — small-domain verification

## Pre-edit scope / acceptance / rollback (2026-10-09)

User authorized three hand-calculated cases through request → resolver → bridge →
operational pipeline/2 → selector, using the real native search where purchase is
needed. Separate exhaustive oracle for the tiny synthetic domain must not call
production serving/search/eligibility to derive its expected result. Zero-purchase
must pass BASE95 each Product and every construction path; affordable purchase must
be compared to exact oracle; insufficient budget must have complete finite proof.

Preserve original BASE95 5/10P artifacts byte-for-byte. Explain stocks, bounded offers,
delivery/expiry and strategy termination. Only a few explicit witness probes permitted;
no exhaustive scan of large domain or lowering requirements/increasing budgets.
Engine UNKNOWN remains UNKNOWN unless its own finite certification completes.

Test scope: new cases plus existing resolver boundary/bridge regressions directly
adjacent. Expand to engine regressions only if a correctness fix becomes necessary.
No DB/HTTP/schema/migration or S3.6.4. No commit/push/development DB access.

Rollback limited to new verification fixture/test/script/docs and any explicitly
identified necessary correctness fix. Before hashes in runtime/s363_review guard
preexisting first-party WIP, benchmark artifacts and 15 archives. Create one small
review ZIP, exclusively published with a new suffix if destination exists; include
only S363/context dependencies needed for review, not entire backend or older ZIPs.

## CURRENT FACT — results

All three cases pass through default request → real resolver → explicit bridge →
pipeline/2 (capture/BOM/procurement/comparison) → selector. No fabricated selector
output, DB or mock solver. Forecast points are hand-supplied synthetic fixtures,
not model accuracy evidence.

Two Products request 10 and 20 servings on 08/10/2026, zero on remaining days.
All LOW/BASE/HIGH demands are identical. P0 uses 2g of I0 per serving, P1 uses 1g
of I1; yields1/loss0, independent Ingredients. All recipes cover the horizon.
Two offers each pack10, upper2, MOQ1, costs2/3; arrival08/10, expiry14/10 inclusive.
No payable fees, capacity/supplier limits explicitly not configured; inventory
complete, tracked expiry provided, inbound explicitly none, no additional orders.

| Case | Hand oracle / native | Status |
| --- | --- | --- |
| Enough stock | 20g each Ingredient, budget0. Zero basket serves P0=10/P1=20. Selected outlay exact0, every strategy customer+construction pass. | VERIFIED winner; complete enumeration of domain9; native not invoked because exact zero baseline suffices. |
| Purchase needed | Stock0, budget10. BASE95 needs at least19g of each Ingredient, hence exactly2 packs of each; basket(2,2) costs2×2+3×2=10, serves10/20. Independent exhaustive9-vector oracle has this sole passing basket. | VERIFIED native witness/winner, same counts/outlay/eligibility. Native factory called3 times and solver evidence present; production enumeration DISABLED, engine proof remains UNPROVEN although independent tiny oracle proves minimum cost. |
| Insufficient budget | Same stock/supply/95% requirements, budget9 fixed before execution. Independent9-vector enumeration has zero passing baskets: minimum needed outlay10 exceeds9. | VERIFIED no winner; engine FINISHED/NO_PASS_CERTIFIED, COMPLETE_EXACT_ENUMERATION,9 enumerated per strategy, proof scope CAPTURED_FINITE_DOMAIN_ONLY. Not timeout UNKNOWN. |

Independent oracle uses Fraction and itertools with the hand formula
fulfilled=min(requested,(stock+10×packs)/recipe quantity). It does not call production
serving, BOM, evaluator, ranking or search. Assertions keep those expected values;
native purchase found them, so no UNKNOWN discrepancy or budget/threshold adjustment.

## Original BASE95 5/10P artifacts — preserved

Source/results: `runtime/s363/benchmark_BASE95/`. Every file's SHA-256 is guarded;
no native benchmark rerun, overwrite, proof rewrite or large-domain enumeration.
Current source fixture/settings match retained requests.

- Budget14 VND; generic payable supplier-order fees1 and1.5. These fees are not
  relabelled delivery costs. Four Ingredients g/ml/g/ml, capacities22 in exact units.
- Per Ingredient, supplier0: pack8/cost2/MOQ2/upper3, lead0 → arrival08/10,
  shelf2 → expiry10/10. Supplier1: pack6/cost3/MOQ1/upper3, lead2 → arrival10/10,
  shelf0 → expiry10/10. Expiry day is usable, then disposal at day's close;
  shelf0 does NOT mean unusable on arrival. Technical bounds are not physical limits.
- Stocks: I0=1g, I1=2ml, I2=3g, I3=4ml expire09/10, plus2 units each without expiry.
  Eight offers/eight lots; domain4^8=65536 (includes MOQ-invalid vectors).
- 5P: LEAN/BALANCED/PROTECTED all ENCODED_NO_CUSTOMER_INCUMBENT_NOT_PROOF.
  10P: LEAN SEARCH_LIMIT_NO_INCUMBENT, other two encoded-no-customer termination.
  All INCOMPLETE, customer_pass=false, proof UNPROVEN, feasibility UNKNOWN.

Five deliberate exact probes per benchmark: zero and four baskets buying two packs
from supplier0 for three of four Ingredients. Zero costs0, others13 including fee1;
all hard-valid but customer-fail. This absence of witness alone proves nothing about
infeasibility; no scan of the65,536-vector domain was performed.

### Separate verified conservative temporal bound

`scripts/review_planning_verification.py::temporal_upper_bound` reads typed captured
values and checks the proof prerequisites; it does not use production serving/search
to derive arithmetic. Both fixtures contain P0 requesting16 total BASE servings.
For its I3 dependency, every possible offered lot expires10/10. From11/10, at most
2ml persistent stock remains. The late recipe consumes 1/(2×(1−.1))=5/9 ml/serving.
Grant ALL this stock to P0, ignore competition, budget, capacities and earlier usage:
late fulfillment≤2/(5/9)=18/5=3.6. Before11/10, P0 requests at most6 servings.
Thus total fulfillment≤6+3.6=48/5=9.6, below BASE95 requirement16×19/20=76/5=15.2.
The upper bound is3/5=60%, so no basket in these unchanged captured fixtures can
satisfy every Product's BASE95, independent of the failed probes or native search.

Status: VERIFIED NECESSARY BOUND for this exact frozen synthetic topology, not a
new engine proof mechanism, finite enumeration certificate or claim about real
business data. The engine's recorded UNKNOWN/UNPROVEN remains untouched. No new
stock/expiry/business policy and no generic analytical solver were implemented.

## Exact commands / evidence / limits

```powershell
.venv/Scripts/python.exe -m pytest tests/unit/test_planning_small_domain.py -q --tb=short
.venv/Scripts/python.exe -m pytest tests/unit/test_planning_small_domain.py tests/unit/test_planning_setup.py -q --tb=short
.venv/Scripts/python.exe -m pytest tests/unit/test_planning_small_domain.py -q --tb=short -k 'stock or purchase_native'
.venv/Scripts/python.exe scripts/review_planning_verification.py
```

First command:2 failed/1 passed in25.48s, due solely to a new test referencing
ComparisonOption.option_token rather than actual token; implementation had returned
the expected winners. Corrected test field, kept all numerical expectations.
Combined targeted rerun: **90 passed,1 warning in31.17s** (3 new +87 resolver regressions).
Then added direct selected-option outlay assertions; reran affected2 tests only:
**2 passed,1 deselected in8.24s**. Existing warning is deliberately forged bool
serialized before boundary rejection. No production correctness patch was needed.

Manual script completed all three cases VERIFIED and wrote original typed results,
oracle rows, strategy evidence, five witness probes per benchmark and the checked
temporal bound to `runtime/s363_review/results/verification.json`, with accompanying
resolution/pipeline JSONs. It chooses a new directory when one exists.

No full suite, PostgreSQL/HTTP/schema/auth/real-data/model accuracy or SLA checks.
Past212/86/5-test S363 and12-test S362 PG results remain historical this turn.
Selection remains independent from customer order confirmation.

## Small ZIP scope

Only S363 source/contracts/tests, benchmark/review scripts and helpers/results,
planning contract/feature/task/review docs, scoped diffs, status and manifest/hashes.
Not a standalone backend checkout: unchanged S1/S2/S361/S362 runtime dependencies
are referenced by hashes and deliberately omitted. Overlay onto the matching current
workspace/source context to run tests. No whole-backend patch, historical ZIPs,
secrets, .env, binary models, customer data or DB dumps.


### Packaging checks - actually run

`.venv/Scripts/python.exe -m pytest tests/unit/test_review_archive.py -q --tb=short`
->23 passed,2 skipped in0.14s. Both skips require Windows symlink creation privilege
(WinError1314); no mandatory small-domain/resolver test skipped.
Lightweight Python stdin check parsed4 new Python files, checked74 local doc links,
confirmed every prior runtime dependency and historical benchmark file unchanged,
and all15 ZIPs preserved. Exact result in runtime/s363_review/context_checks.json.
`git diff --check` passed. These checks do not replace runtime tests/full regression.

New exclusive packaging command: `.venv/Scripts/python.exe scripts/bundle_s363_small_review.py`.
It verifies CRC/safe paths/exact manifest inventory/SHA-256/source correspondence
before publication and after reopening; existing destination gets a numbered suffix.
Final archive metadata is stored outside the archive in
runtime/s363_review/bundle_verification.json to avoid a self-artifact hash cycle.
No full backend or historical ZIP source is included.

Final packaging follow-up: first exclusive publication had valid CRC/JSON hashes
but a redundant MANIFEST.json listing in MANIFEST.md. Removed that duplicate and
added exact Markdown-manifest inventory verification. Retained first archive;
rerun packaging publishes suffix_2 rather than overwriting. Runtime/tests unchanged.
