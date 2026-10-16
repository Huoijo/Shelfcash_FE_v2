# S3.6.1 verification / native synthetic benchmark

CURRENT FACT, collected2026-10-09. See S361_TASK_NOTES.md for exact commands,
initial fixture/script failures, final fixes and verification scope. Internal
slice COMPLETE; S3 overall IN PROGRESS. No full suite/DB/API/commit/push.

389 targeted cases passed:32 procurement/2 +357 old affected callers/contracts.
Final isolated evidence-hardening:6 passed/26 deselected; numeric cache/capacity
hardening:7 passed/27 deselected, strengthened fixture3 passed/31 deselected.
There are34 new cases now;389 gate remains historical32+357, not a391 rerun.
Packaging guard tests:
23 passed/2 Windows symlink-privilege skips. These are distinct commands, not
a full-regression claim or accuracy evidence.

## What assertions establish

Six independently ranked16-vector exhaustive cases use native search and exact
canonical evaluation; complete enumeration reconciles generation to the expected
customer-domain/target/fallback choice. Oracle independently implements Cartesian
search, replacement thresholds, hand cost/fee and min/mean/money/order ranking,
sharing fixed-basket serving/FEFO only. Thus it tests selection/search correctness
under that serving policy, not an independently validated simulator or forecast.

Hand cases cover mixed cup/piece units, common versus replacement requirements,
multiple paths, zero requested/budget/purchase, max-min ahead of mean, mean ahead
of money, customer-pass/construction-miss eligibility, exact .3+tiny reject/re-search,
fees/MOQ/dates/expiry/capacity, no false delivery taxonomy, money/HIGH/BASE/LOW/stable
winner ties, duplicate baskets/source evidence and input immutability/revalidation.
Fault injections explicitly test native-limit/no-incumbent and retained ERROR
classification; actual native timeout evidence is separately recorded below.
Forged output eligibility/proof/winner/rejection/cache/timing evidence is rejected.
Old comparison/1 identities and old pipeline callers regress without new business policy.

## Native measurements — not certificates

All cases:4 Ingredients (g/ml exact units),8 offers,8 inventory lots, seven days,
two dated recipe versions/Product, integer bounds0..3, domain4^8=65,536 vectors.
MOQ, arrivals/expiry, budget14, supplier fees and gross capacities configured.
Python3.11.9/SciPy1.17.1/NumPy2.2.6/HiGHS1.12.0. Certification DISABLED; no exhaustive
large-domain traversal. Deadline10s engine cooperative, comparison/selector separate.

| Input | Native dimensions | Engine wall | Recorded overrun | Comparison/selector | Result / candidate / proof |
| --- | --- | ---: | ---: | ---: | --- |
|5P,10recipes; BASE.2 (P0.25),HIGH.1|3714–3715 vars /9513 rows|4.072s|0|4.944s|INCOMPLETE, customer-fail zero reference, winner null; UNKNOWN/UNPROVEN|
|10P,20recipes; same requirements|9384–9385 vars /28323 rows|9.918s|0|7.330s|INCOMPLETE, no eligible candidate; UNKNOWN/UNPROVEN|
|5P,10recipes; BASE/HIGH.01|3714–3715 vars /9513 rows|12.449s|2.442s|13.446s|customer-pass/construction-miss fallback13 chosen over13.5; native PROTECTED LIMIT with incumbent; UNPROVEN|
|10P,20recipes; BASE/HIGH.01|9384–9385 vars /28323 rows|10.987s|0.971s|7.674s|eligible captured-stock zero baseline, no new native incumbent; winner0; INCOMPLETE/UNPROVEN|

Requirements are explicit SYNTHETIC experiment values, not accepted customer defaults.
First pair ran concurrently with unit verification; second pair after regression.
Model rows listed are native solve evidence; some constraints are transient per-call
customer/construction rows and dimensions do not imply all stages ran. The5P permissive
case stopped before full mean/cost stages; exact ranking is among evaluated candidates
only.10P zero baseline is an actual exact/customer-pass candidate even though native
time-limit solve supplied no incumbent. No native infeasible status became exact no-pass.

Raw runtime/s361/{native,selection}_{5,10}p.json and permissive/* contain full captured
inputs/results/source diagnostics/journals/proof, plus benchmark_summary.json. Saved
artifacts were revalidated by current final contracts after evidence hardening;
recorded timings are previous run measurements, not a new timing after that patch.

## Remaining limits / review priorities

- Cooperative deadline can overrun during nonpreemptible build/native/validation.
  Comparison/selector revalidation is materially costly and outside engine deadline.
  No latency SLA, hard cancellation or representative real-Store throughput proven.
- Large-domain optimum/no-pass unknown; float generation can miss exact candidates.
  Complete small-domain proof is limited to captured technical bounds, not all real POs.
- Generic payable fees have no delivery taxonomy. No API default/custom/saved resolver,
  HTTP, operational-v2 bridge, auth, retention/replay/DecisionRun or Optuna implemented.
- S1 completed/recommended-strategy constraint unchanged; no-winner persistence needs
  separately accepted evolution. Real forecast accuracy and procurement backtesting
  remain outside these mechanical synthetic checks.
-11 preexisting ZIPs and unrelated WIP are hash-preserved. New ZIP contains current
  filesystem and mixed historical WIP; source patches are not a staged/committed slice.
