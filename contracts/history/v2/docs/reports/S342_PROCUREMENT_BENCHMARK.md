# S3.4.2 procurement correctness and optimization benchmark

Classification: CURRENT FACT for scratch experiments; PROPOSAL for adoption.
No production source/contracts/serving policy/accepted ADR/schema/DB changed.
ADR-018 remains PROPOSED. S3.4 is not COMPLETE. Synthetic observed-sales design
paths have no probabilities; this report evaluates procurement correctness, not
forecast accuracy, profit, demand calibration or purchase readiness.

## Answer to the six review questions

1. On the executed finite corpus, the event-unrolled progressive/dated-FEFO MILP
   matches current canonical evaluator state within declared technical tolerance.
   Initial full run:40 cases =37 enumerated optimization cases,1 explicit safety
   NOT_SUPPORTED/BLOCKED case,2 non-enumerated scale cases.70 fixed baskets were
   compared across all three paths/seven days. Maximum absolute measured state
   error1.4210854715202004e-14; maximum scaled error is separately retained by metric.
2. Adversarial min/max probes on247 selected positive Product/path/day coordinates
   found no spread above tolerance. This is not a proof of uniqueness for every
   state/fixture, nor exhaustive probing of every variable. Scale cases compare
   state only and skip these probes. Intermediate zero-step event traces can differ
   while final policy projection is the same; no alternate projected allocation
   was found. The larger/non-corpus mathematical equivalence remains unproved.
3. All37 enumerated cases match independent exact oracle feasibility/objective and
   membership in the acceptable optimal basket set, over169 total grid vectors.
   Primary is min outlay under the experimental service target; if none pass,
   maximum canonical supported service then min outlay. Equal-objective supplier
   baskets are accepted by set membership; no unapproved native tie choice is an
   error. Proof concerns those finite declared domains only.
4. No progressive-state/oracle mismatch was found in the executed domains. Two
   surrogate counterexamples are retained with full fixture/hash/result: milk
   target prediction differs from exact evaluator; independent non-construction
   paths are also unconstrained by max-servings objective. Extreme finite1e-120
   stock is evaluable exactly but intentionally rejected by solver scaling guard,
   not turned into zero. Integer bounds above2**53 are rejected. Business budget
   .3 and target .3 pass exactly; raising target beyond .3 rejects the same basket.
   A later actual optimization diagnostic found float64 target projection loss:
   native solver accepts3 packs at target.3000000000000000000000000001, exact
   evaluation rejects. Oracle finds no target passer and fallback service3/cost.3.
   The scratch runner safely rejects but does not perform a general repair/search
   to certify that fallback. This is a concrete unresolved optimizer-correctness
   gap beyond the37-case corpus, not an exact evaluator failure or a PASS claim.
5. At5/10 Products the models have2651/8111 variables and7022/24032 base constraints
   (additional objective/fixed-basket rows differ by solve),1179/3279 binaries.
   The corrected shared-deadline runner at5s solved both staged problems in about
   .749/1.602s on this machine. Scale models have only2 Ingredients/2 offers and
   common seven-day demand; this is limited scale evidence, not operational-size
   performance. Their candidate objectives were not checked by exhaustive oracle.
6. Policy-faithful MILP is worth further controlled correctness/numeric/performance
   work; candidate generation using unconstrained max-servings is insufficient.
   No engine is selected. Need broader topology/lot/offer benchmarks, proof review,
   coefficient guards and deadline/retained-incumbent handling before production.

## Evidence map and chronology

- `runtime/s342/corpus.json`:40 typed prepared snapshots plus explicit scratch
  offers/fees/caps/policy variants, each with canonical SHA-256 and SYNTHETIC label.
- `common.py`: exact independent basket/price/MOQ/supplier checks and enumeration;
  arrivals run through existing simulate_serving and result revalidation. It never
  uses MILP quantities to decide service/feasibility/objective.
- `model.py`: actual progressive stages, fixed recipes/yield/loss, FEFO implications,
  per-lot continuity, packs/MOQ, fees/supplier choices and physical checkpoint.
- `benchmark.py`: full-state projection/parity, min/max probes, staged objective,
  exact basket extraction/post-check, deadlines and status/numeric experiments.
- `results_all.json`: initial complete corpus run,62.4911378s including status
  checks (last case checkpoint JSON elapsed62.1982196s excludes trailing checks).
  This is evidence before the subsequent scratch deadline/evidence refinements.
- `results_scale.json`: affected scale/deadline rerun after reserve/cache fix,
 2 cases,6.9713944s. `results_target_.json`:4 affected fallback/policy variants,
 3.2171006s. `results_milk.json`:latest targeted comparator evidence,2 cases,
 1.4831015s. No full corpus repeat after those refinements. Constraint formulation,
  corpus and oracle are unchanged; new integer-range guard affects outside-domain
  inputs only. New metadata fields are not retrospectively invented in old results.
- `status_numeric_checks.json`: actual native statuses and separately identified
  executed fault-injection handler/extraction checks. `environment.json`: Python
 3.11.9, SciPy1.17.1, bundled HiGHS1.12.0, NumPy2.2.6 and machine metadata.
- Empty `counterexamples_all.json` means no counterexample discovered in that run,
  not a general proof. `surrogate_counterexamples.json` contains reproduced
  comparator disagreements; `numeric_counterexamples.json` preserves the later
  native target-projection diagnostic with exact oracle and full fixture/hash.
  Numeric guard fixtures are in status_numeric_checks.

Early harness attempts failed serializing dates then NumPy scalar booleans before
writing results; these were fixed in scratch serialization, not serving/MILP
business policy. Three direct smoke cases (milk/simultaneous/multiday FEFO) solved
optimally with zero observed state difference. No progressive-formulation
counterexample requiring a simulator/policy change was observed.

## What is actually compared

Every compared fixed basket projects all canonical rows/fields:

- Product requested/fulfilled/lost per path/day, Product–Ingredient consumption.
- Lot opening/arrival/pre-service expiry/consumed/close expiry/other_waste/ending.
- Ingredient requested/available/shortage/consumed/expiry/other_waste/ending.

Technical test: abs(float_projection-exact_ratio)<=1e-7*(1+abs(exact_ratio)). Record
absolute and scaled errors for each metric group; never truncate errors away.
This relative allowance is deliberately labelled an experimental comparison, not
permitted business leakage. Canonical result exact ratios/conservation remain
authority. Pack extraction accepts only finite near-integers within1e-7, then
validates actual integer packs and exact money/targets. No rounding solver lot
quantities into business truth. Synthetic coefficient scaling1e-6/1e6 passes;
the unsupported dynamic-range fixture is preserved, not claimed as general support.

Product-to-lot attribution claim corrected in PROCUREMENT_FORMULATION: source
`app/domain/decision/serving.py` Usage and LotDay, and corresponding contracts,
record separate Product–Ingredient and lot rows. They do not identify which lot
served each Product. No feature added to make the old claim true.

## Formulation completion and bounds

Active Products initialize exactly when positive demand. Zero demand has fraction0
and emits full zero coverage. At most n positive-Product stages; each active stage
must hit a real saturated Ingredient or common fraction1. Selecting only some
simultaneous bottlenecks permits zero-step stages; at least one active Product
freezes each stage, final active set is empty. Fixed demand/recipe intensities use
exact Fraction(line)/(yield*(1-loss)), then float conversion for solver only.
This implements S3.4.1's analytical formulation without changing the evaluator.

For Ingredient i, scale=sum of maximum eligible opening/explicit-arrival/offer
quantities, or a normalization reference1 when no stock exists. Each lot variable
bound is that lot's maximum/scale. Available/residual maximum is1, giving derived
saturation big-M1; shortage bound max(1,gross demand/scale). Pack U is fixture-
declared finite domain, not inferred business supplier capacity. Guards reject
nonzero coefficients outside1e-10..1e10, scales outside1e-100..1e100 and integer
bounds beyond exact float64 integer range2**53. These are conservative experimental
technical bounds, not accepted production limits. No general grocery numeric-range
recommendation inferred. Floats still cannot prove exact optimization.

Each path owns its own lot/day state. Eligible opening lots are captured; explicit
arrivals alone add scheduled receipts. FEFO known expiry/known receipt/UUID matches
source, including missing receipt key. Expiry<t disposes before service; expiry=t
is usable then closes once. Later positive lot take forces earlier usable remainder
zero before close disposal. Zero-purchase potential lots are projected as zero
rows only in scratch and checked for unexpected nonzero values; canonical output
omits those hypothetical identities.

Capacity guard/MILP/oracle all use opening+arrival, before pre-expiry removal or
service. Initial already-expired5 plus receipt3 violates cap7 even if ending0.
Fees NONE/PER_OFFER/PER_SUPPLIER_ORDER are explicit synthetic extensions; shared
supplier fee charged once by supplier activation OR. One supplier perIngredient
and split modes are separate experiments. Missing canonical fee/capacity capture
remains an integration gap; no end-to-end support claim from this benchmark.

## Representative exact outcomes

| Case | Result / meaning |
| --- | --- |
| Complementarity | X/Y packs(1,1),outlay10,serves5/10; singles unlock0; no target pass within domain |
| Milk .95 target | Progressive chooses1 pack,outlay1,serves28.5; surrogate0 predicts28.5 but actually27.75 and is rejected |
| Milk6L fairness | Actual A15/B7.5,total22.5; surrogate max-service phase predicts25. Subsequent cost tie may select another surrogate allocation; never an evaluator-optimality certificate |
| Fees | Complementary basket costs4 with NONE;7 with one supplier fee3;10 with per-offer fee3, thus violates budget7 and fallback serves0 |
| Distinct paths | LOW/BASE/HIGH construction chooses1/2/3 bulk packs respectively. Each is exact evaluated on all paths; BASE service with those baskets9/14/14, HIGH demand21 and PROTECTED covers it. Not a production strategy selector |
| Safety floor required | NOT_SUPPORTED/BLOCKED; no silently omitted constraint |

Variants: targets1/.8, horizon aggregate with/without per-Product.5 floor, distinct
construction paths and one/split suppliers. All values PROVISIONAL for experiment;
daily Product gaps are persisted in results even when objective is horizon based.
Corpus keeps the S3.4.1 scenarios and6 fixed-seed generated graphs17/29/41/53/67/79.
This task does not benchmark a joint-activation heuristic. Earlier single-move
greedy results remain historical comparator evidence, not claims about bundles.

## Runtime, termination and numeric failures

Corrected scale-run timing (build + solve + exact evaluation/validation included):

| Products / budget seconds | End-to-end seconds | Outcome |
| --- | ---: | --- |
| 5 / .05 | .101765 | Deadline before solve; build overhead.051765 |
| 5 / .5 | .258525 | Native limit, no incumbent |
| 5 / 2 | .743716 | Encoded staged optimum, exact-valid basket(9,7),outlay39 |
| 5 / 5 | .749021 | Same basket/quality |
| 10 / .05 | .287343 | Deadline before solve; build overhead.237343 |
| 10 / .5 | .285682 | Reserved validation leaves no solver time after build |
| 10 / 2 | 1.526383 | Max-service phase optimal; cost phase times out without a new incumbent; prior exact-valid basket retained, no final optimal label |
| 10 / 5 | 1.602317 | Encoded staged optimum, same exact-valid basket/outlay39 |

An initial .5s run duplicated expensive evaluation after deadline and overran by
.5292057s. Scratch correction caches completed exact evaluation, refuses new
evaluation once expired and reserves max(.05,.05*Products) capped at half budget.
This reserve is experimental, not a production deadline decision. Native call,
matrix construction and evaluator itself are not preemptible; even the corrected
runner can exceed deadline during a single stage. Report overhead rather than
claim hard wall-clock guarantee. All build/solve/evaluate/validate stage times,
native options/status/incumbent/bound/gap/nodes and model sizes are in results.

Native observations: status0 optimal,2 infeasible,1 timeout without incumbent;
unbounded presolve reports4 ambiguous unbounded-or-infeasible, disabling presolve
reports3 unbounded. NaN objective raises actual ValueError. A genuine native
timeout WITH incumbent was not observed. Executed fault-injected handler preserves
an exact-valid incumbent with status1, rejects invalid one, treats missing one as
INCOMPLETE, and programming failure as execution error even with a prior valid
candidate. These are scratch handler checks, not production infrastructure.
Near-integer3.00000005 becomes integer3 then exact validated; larger error and NaN
reject. Exact target above.3 does not pass via tolerance.

Additional executed native diagnostic: demand10, pack1/cost.1/U10,budget.3 and
target.3000000000000000000000000001. Exact requirement is3+1e-27, but float64
target RHS is3. Native OPTIMAL buys3; actual target is false and runner returns
REJECTED_EXACT_TARGET_MISMATCH. Independent oracle gives fallback service3/outlay.3.
No quantity rounding/tolerance bypass is applied. Counterexample saved before
reporting; no repair algorithm added or policy weakened. Core mathematical policy
parity on the main corpus remains good, while general objective handling at such
boundaries is **not yet complete**. Numeric-safe transformation or bounded exact
rejection/re-search/fallback proof needs further authorized work.

SciPy converts optimization inputs to double precision and exposes status plus
optional incumbent/bound/gap; those cannot replace exact business checks. See
[official milp documentation](https://docs.scipy.org/doc/scipy-1.17.0/reference/generated/scipy.optimize.milp.html).

## Recommendation, open decisions and verification limits

Continue with evidence-driven numeric/proof and broader benchmark work for the
policy-faithful candidate, starting with the saved numeric boundary counterexample.
The prototype does not meet general optimizer correctness at that diagnostic;
stop here, no production wiring. Production adoption still needs approved construction
targets/service aggregation and floor semantics, supplier splitting/fees/capacity/
safety capture, finite-domain bounds/ties/quality labels and deadline rules.
Cost-minimization uses no dish-profit or missing monetary values. Do not self-ACCEPT
ADR-018, change serving policy or claim model quality. Surrogate can generate
candidates only with explicit mismatch rejection/search, not forecasted feasibility.

Limits: finite synthetic corpus; only2 Ingredients/2 offers in scale fixtures;
no complete alternate-state proof, no large diverse topology/lot benchmark;
no exhaustive scale oracle; no observed native incumbent timeout; no LLM/stochastic/
customer data/API/persistence/business procurement. Model rows use floats and may
still admit undetected states at other ranges. Captured required safety is blocked.
Any unsupported/hard-invalid candidate cannot become purchase-ready success.

Verification commands/results and rollback are in
[S342_TASK_NOTES](../runbooks/S342_TASK_NOTES.md). Existing canonical serving,
output-hardening and BOM targeted tests123 passed in4.59s. No full suite/PG or
development DB access. Next scope is only a reviewer-approved proposal; stop here.
