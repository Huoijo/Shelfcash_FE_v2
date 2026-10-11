# S3.4.3 - Numeric correctness, exact bounded re-search and broader benchmark

Classification: CURRENT FACT for scratch execution, PROPOSAL for adoption/policy.
ADR-018 remains PROPOSED. Production source/contracts/serving policy/accepted ADRs,
schema/DB/API/PO/persistence and previous evidence are unchanged. This is not S3.4
production completion or forecast/profit/probability accuracy evidence.

## Findings and answers to the six review questions

1. **Old counterexample resolved within its declared finite domain.** Demand10,
   pack1,cost.1,U10,budget.3,target.3000000000000000000000000001: native gives3,
   exact evaluator classifies HARD_VALID_TARGET_MISS, journal persists evidence,
   coordinator excludes only(3), next native result is encoded INFEASIBLE. This
   is not accepted as exact proof. Independent traversal of all11 vectors then
   certifies no target pass and fallback service3/outlay3/10, acceptable set{(3)}.
   Proof source is COMPLETE_EXACT_ENUMERATION, not native MILP or zero MIP gap.
2. **Yes, exact-feasible baskets excluded by conservative projection were found.**
   Experimental RHS=3.001 at true target.3 makes native target model infeasible
   with budget.3. Enumeration recovers3packs, target pass and minimal outlay.3.
   Conservative projection is neither an exact equivalent nor superset relaxation;
   never used as business default or an exact bound/infeasibility certificate.
3. **Minimum cost/fallback proof is enumeration.** Updated evidence:26 small
   fixtures,553 integer grid vectors, all certified objectives and acceptable
   sets match independent oracle. Coordinator uses its own odometer/cache/ranking;
   oracle uses unchanged S342 itertools.product/acceptable-set implementation.
   Both share only exact business checks and canonical simulator/validation, not
   exclusion or search logic. This verifies search/certification logic, not an
   independent second implementation of the entire business evaluator.
4. **Broader topology works, but exact proof has a measurable cost.** Six small
   cases:3 Products,3 Ingredients,6 offers (two suppliers perIngredient),6 actual
   lots+3 explicit arrivals,64 vectors each. Includes hand topology/fixed seeds,
   shared/complementary multi-Ingredient recipes, simultaneous limits, missing
   receipt-date warnings, dated yield/loss, distinct three paths, fees, one/split
   suppliers, binding budget and receipt caps. One NONE-fee fixture needs about
   23.89s coordinator plus23.49s independent oracle, rather than a demo deadline.
   Large5/10 Product cases below stay UNCERTIFIED in a65,536-vector domain.
5. **Remaining correctness gaps:** no general float-to-exact bound transformation,
   no mathematical proof of all progressive/FEFO states/ranges, no complete large-
   domain search. Technical numeric guards remain experimental; unsupported ranges
   return diagnostics. Enumeration cannot cover operational-size combinations at
   guaranteed latency. Exact certificate is valid only for declared bounds and
   shared evaluator semantics. Safety semantics, fees/capacity capture and business
   targets remain unapproved. No direct Product-to-lot attribution or economic
   evaluation. These limits are not hidden behind native OPTIMAL labels.
6. **Engine recommendation remains a proposal.** Evidence supports continuing with
   policy-faithful MILP as candidate generator plus exact evaluation, and exact
   bounded enumeration as small-domain certificate/reference. It does not support
   selecting MILP alone as an exact production optimizer. Proposed guaranteed scope
   is the explicitly enumerated fixtures/domains (up to64 vectors here), not a
   blanket64-vector production guarantee for arbitrary values/topology. Larger
   input contracts, domain bounds, numerical policy, certification/termination
   semantics and business policies require reviewer approval before wiring.

## Implemented scratch flow and evidence levels

`runtime/s343/coordinator.py:execute` builds unchanged S342 event-unrolled MILP;
`no_good` adds exact-vector disjunction with finite M=U+1; `vectors` is a separate
odometer traversal. `benchmark.py:verify` compares against unchanged independent
`runtime/s342/common.py:oracle`. Production serving_fefo/1 supplies exact truth.

For each extracted vector: finite near-integer guard -> exact bounds/MOQ/budget/
fee/scope/date checks -> canonical serving plus output revalidation -> receipt
capacity -> exact targets/outlay -> journal classification before continuation.
Hard-valid misses remain evidence/incumbents. Cached vectors are not reevaluated
after deadline. Only mismatched vectors are excluded, never a supplier neighborhood.
Repeated excluded vector, cut failure or programming failure is execution error.
No-good cuts alone never certify cost, infeasibility or fallback optimum.

Three evidence levels remain separate:

| Level | Claim allowed |
| --- | --- |
| Exact-validated candidate | Its integer basket/arrivals/evaluated service and money are valid under fixture constraints; target status separate |
| Native float encoded optimum | Recorded native status/bound/gap; not exact evaluator optimum |
| Complete exact finite traversal | Exact primary mincost or no-pass/maxservice/mincost fallback, full acceptable optimal set, explicit enumeration proof |

Incomplete search keeps validated incumbent when present, target feasibility UNKNOWN
and no optimal set/proof. Experimental canonical tie is lexicographic vector order;
entire cached row for that vector is returned, not metrics from a different tie.
Policy-independent target-pass supersedes fallback in ranking. No rounding down
targets, budget epsilon, float business conservation tolerance or serving change.

Large-domain native fallback maximizes encoded supported service only to generate
another candidate; it cannot certify exact service/cost optimality. Exact hard-
valid output is retained under UNCERTIFIED. This optional phase was added only
for domains exceeding certification limit; small-domain certification is unchanged.

## Numeric outcomes and counterexamples

| Fixture | Exact result / treatment |
| --- | --- |
| Target.3, just below, just above | Boundary/below certify primary3packs/cost.3; above certifies fallback3/cost.3 after exact rejection/no-good |
| Conservative RHS3.001 | Encoded false negative; exact enumeration recovers target-feasible3packs |
| Fee just above.1 plus packcost.2, budget.3 | PER_OFFER and PER_SUPPLIER_ORDER native projected purchase is rejected by exact budget; no charge silently truncated |
| Costs1 and1.0000000000000000000000000001 | Float ties; exact certificate chooses cheaper offer vector(0,1),outlay1 |
| Pack/service3 and3.000000000000000000000000001 under budget1 | Float ties; exact fallback chooses vector(0,1),service3000000000000000000000000001/1000000000000000000000000000 |
| Repeating recipe/service, floors, zero demand/free offers | Exact comparison/set verification passes; finite zero-cost bounds explicit, no arbitrary infinite search |
| Multiple offers on LOW/BASE/HIGH construction | False passes journaled/excluded, exact fallback certified separately perpath; targets are experimental, no strategy policy acceptance |
| NaN/Infinity/fractional pack, finite1e-120 scale | Reject/NUMERIC_UNSUPPORTED diagnostic; no fabricated zero/feasibility; unsupported model not turned into completed business result |

Full synthetic fixtures/hashes: `runtime/s343/corpus.json`. Old reproduction and
projection mismatches are retained in `counterexamples_all.json`; the initial
20s incomplete fixture is preserved there even after a successful targeted rerun.
Original raw run is not rewritten to PASS. `results_current.json` is a labelled
merge with provenance, not a new run. Old S341/S342 sources/results unchanged.

## Policy parity and defenses

Unchanged formulation checked on6 fixed baskets over5 affected fixtures, including
new small/big topology and dated/repeating/simultaneous examples. Complete Product,
contribution, lot and Ingredient projection parity PASS;16 selected min/max
fulfilled coordinate probes found no alternate spread beyond experimental tolerance.
Maximum absolute measured error3.9968028886505635e-15. Large parity skips probes;
finite tests do not prove universal policy equivalence. Production simulator not
changed. Existing S342 tolerance remains a comparison rule, not business epsilon.

General cuts verified against all9 vectors of a2D domain with three exclusions;
only the exact excluded vectors become native infeasible. Fault-injected repeated
vector/cut/programming failure returns EXECUTION_ERROR. Deadline after one/two
rejected baskets and during certification returns INCOMPLETE without false proof.
Fault timeout with/without incumbent can still obtain an enumeration certificate
if sufficient budget remains; proof is not credited to the injected solver status.
Existing near-integer/nonfinite/range guards are exercised without modifying them.

## Broader performance and native termination

Large fixtures each have4 Ingredients,8 offers,8 actual lots+4 explicit arrivals;
offer U3 gives4**8=65,536 vectors. No forced exhaustive oracle. Offers mix MOQ1/2,
lead0/2,shelf2/0, shared supplier fees; dates/caps/recipes/paths vary. Store/raw
quantities with g/ml are never summed into an invented common Ingredient unit;
Product service uses common cup units.

| Products | Variables / constraints (fallback model) | Budget | Actual total | Validated candidate / proof |
| --- | --- | ---: | ---: | --- |
| 5 | 3966 /10086 | .1s | .1743s | Build overrun, no candidate, UNCERTIFIED |
| 5 | same | 1s | .7664s | Native limit without incumbent, UNCERTIFIED |
| 5 | same | 5s | 2.3578s | Outlay13, BASE service3107/10185, UNCERTIFIED |
| 5 | same | 15s | 2.3428s | Same candidate/service; native encoded optimum, no exact proof |
| 10 | 9644 /28901 | .1s | .4151s | Build overrun, no candidate, UNCERTIFIED |
| 10 | same | 1s | .9247s | Native limit without incumbent, UNCERTIFIED |
| 10 | same | 5s | 5.4237s | **Observed native limit WITH incumbent**, exact-valid outlay13, BASE service668099/3010560; native gap.1159814598654881 |
| 10 | same | 15s | 6.6072s | Same evaluated candidate; native gap0/encoded optimal, still UNCERTIFIED |

Native statuses/options/incumbent/bound/gap/nodes and build/solve/evaluate/validate
times are retained perrun. Stage certification time includes its evaluations;
do not add overlapping phase/operation timing fields as though disjoint. These
are workstation measurements, not latency promises; some initial/targeted jobs
overlapped briefly, so do not infer hardware-normalized comparisons from them.

One monotonic deadline covers every stage. Non-preemptible model build/evaluator
can overrun, demonstrated above. At10 Products the5s validated candidate overran
by.4237s during final checking. The result remains honestly UNCERTIFIED. No hard
wall-clock guarantee or infrastructure preemption added. Cached fully checked
rows are retained; new expensive evaluation is not started after expiration.

## Verification chronology, limitations and next proposal

Initial new corpus:28 cases,204.9861s;25 small certified, one small budget-overrun
assertion, two large incomplete performance cases. The coordinator's interrupted
result was correct UNCERTIFIED; harness required completion for small fixtures.
Reran only NONE-fee fixture with explicit60s experiment budget: PASS,47.9734s
including23.4862s independent oracle and23.8926s coordinator. No full-corpus repeat.
Added candidate-only fallback for large domains, reran only5/10 Product cases:
7.0983/15.2265s for four budgets each. Defensive checks and affected parity PASS.
Early fixture-generation failed because missing receipt date lacked required
object-specific WARNING; fixture fixed, production contract preserved. Commands
and package checks: [task notes](../runbooks/S343_TASK_NOTES.md).

No full pytest/PG/DB/API check: production/shared contracts/schema/transactions
unchanged. S342123-test result is historical, not rerun. No mathematical proof
outside the finite fixtures, no large exact objective oracle, no real-data quality
or stochastic/profit/LLM claim. Configured safety remains unsupported; no new
business target or winner/persistence policy accepted. Native float infeasibility
does not prove exact target infeasibility for any unfinished domain.

PROPOSAL: review bounded input/search/certification contracts and broader numerical
parity before a production-engine slice. Evaluate domain-budget limits and exact
proof options for bigger topology; preserve honest UNCERTIFIED outcomes. Do not
trade algorithm quality for demo latency or self-ACCEPT ADR-018. Stop after S3.4.3.
