# S3.4.2 procurement correctness benchmark task notes

Classification: CURRENT FACT for executed evidence; PROPOSAL for engine/policies.
User authorizes runtime/s342 prototypes and benchmark only. No production source,
contracts/serving policy, accepted ADRs, migrations/DB/API/PO/commit/push changes.

## Pre-edit contract, plan and rollback

Read AGENTS and authority-order documents, ADR-017/018, S3.4.1 design/formulation/
goldens, current serving/FEFO and independent validation. ADR-018 remains PROPOSED.
Freeze current serving_fefo/1 exact rational equal-fraction progressive policy,
dated recipes/yield/loss and independently reset LOW/BASE/HIGH lot states. Snapshot
and all prior WIP retained. A pre-edit SHA-256 inventory is runtime/s342/before_sha256.json.

Observed claim drift: serving Product/Ingredient contributions and lot usage are
separate records, no Product-to-lot edge. Correct docs, do not add attribution.

Scratch acceptance: fixed-basket complete Product/day/path, contribution, lot and
Ingredient parity first; adverse min/max fulfilled probes; exact independent
enumeration of bounded integer vectors next; objective/set membership not arbitrary
native tie equality. Include chronology/capacity/fees/supplier/numeric cases,
seeded generated corpus and 5/10 Product scale experiments. Preserve counterexamples.
Model progress unrolled saturation events, FEFO and lot continuity, integer packs,
activation/MOQ and explicitly synthetic fee/capacity extensions. No capture support
claim. Constructed offers in snapshot remain absent; scratch fixtures are authority
only for this experiment and must say synthetic.

Provisional experimental policy only: common cup unit, construction targets1 and
lower rational alternatives; horizon aggregate with optional per-Product floors;
NONE/PER_OFFER/PER_SUPPLIER_ORDER fees; fixed finite bounds; receipt checkpoint
after arrival before expiry/service. Required safety rule => NOT_SUPPORTED/BLOCKED.
Technical float comparison tolerance and extraction/scaling guards will be recorded;
native evaluator exact validation owns feasibility. No float eps in budget/targets.

Verification: execute scratch runner/selfchecks; affected canonical serving/BOM/
output-validation tests only if needed to check integration of scratch inputs.
No full pytest: production/shared contracts/schema/transactions unchanged. No PG,
OpenAPI/API or DB checks needed. Record commands, observed/fault-injected statuses
and incomplete runs honestly. Deadline is shared, best effort, no hard preemption.

Rollback: only runtime/s342, new report/notes/ZIP and this slice's documented
claim/evidence/state/roadmap corrections; existing app/tests/scripts/accepted ADRs
remain byte-identical. FE/ML/Data/demo runtime behavior unchanged. Stop after
benchmark regardless of outcome; no engine acceptance or next-slice implementation.

## Executed evidence

Executed on2026-10-07, existing venv Python3.11.9/SciPy1.17.1/HiGHS1.12.0.
No dependency installed/modified. Primary solver-interface semantics checked
against official SciPy milp documentation linked in the benchmark report.

Commands (working directory backend):

```
./.venv/Scripts/python.exe -X utf8 runtime/s342/benchmark.py --only milk
./.venv/Scripts/python.exe -X utf8 runtime/s342/benchmark.py
./.venv/Scripts/python.exe -m pytest tests/unit/test_serving.py tests/unit/test_serving_output_validation.py tests/unit/test_bom.py -q
./.venv/Scripts/python.exe -X utf8 runtime/s342/benchmark.py --scale-only
./.venv/Scripts/python.exe -X utf8 runtime/s342/benchmark.py --only target_
./.venv/Scripts/python.exe -X utf8 runtime/s342/benchmark.py --checks-only
./.venv/Scripts/python.exe -X utf8 runtime/s342/verify_and_bundle.py
```

Initial milk command had2 harness failures: date serialization then NumPy scalar
boolean serialization; fixed only scratch JSON serializer. Subsequent smoke/milk
passed. Full corpus completed40 cases in62.4911378s including status checks:
37 oracle comparisons PASS across169 finite integer grid vectors;70 fixed-basket
state comparisons PASS;247 selected min/max fulfilled coordinate probes without
spread above1e-7*(1+abs(exact)). Maximum absolute state discrepancy1.4210854715202004e-14.
Safety case NOT_SUPPORTED/BLOCKED;5/10 Product cases not enumerated.

123 canonical tests passed in4.59s. Selected serving/BOM/output-hardening because
their exact behavior/validation supplies oracle truth. S3.1/S1/S2/PG/API/full-suite
not rerun: no changes to their code/contracts/schema/transactions or public API.

Evidence-driven scratch correction: initial short-deadline scale run duplicated
an expensive evaluator call after deadline. Cache exact evaluated basket, preserve
already-validated incumbent, refuse new post-check when deadline already expired,
reserve an experimental validation allowance. Reran scale only:2 cases6.9713944s,
and affected fallback/target variants only:4 cases3.2171006s, all comparisons pass.
No full corpus rerun after this narrow orchestration correction. Model constraints,
oracle and fixtures did not change. A later integer-range guard affects unsupported
bounds outside all corpus domains; checked directly without rerunning unrelated cases.

Comparator evidence additions record solver-predicted service per stage/path and
actual canonical service separately. Reran milk only after each reporting addition;
latest2cases1.4831015s, both oracle comparisons and parity pass. Actual surrogate
milk0packs predicts28.5, evaluator27.75; policy-faithful1pack gives28.5. Surrogate
fallback at6L predicts25 in max-service phase, evaluator22.5. It remains a candidate
generator, not evaluator-optimal. Full reproducible fixtures/results retained in
surrogate_counterexamples.json, generated by the verify/bundle command.

Status checks invoked directly through imported numeric_and_status_checks() during
development, then final reusable --checks-only command PASS. Native observed0,
2,1/no-incumbent,4 ambiguous unbounded-or-infeasible with presolve,3 unbounded
without presolve, and ValueError for invalid NaN objective. Timeout WITH valid
incumbent is fault-injected into an executed experiment-only handler, not observed
native behavior or a production classifier. Invalid-incumbent/failure handling,
near-integer extraction and exact budget/target checks execute assertions.1e-120
finite quantities remain exact-evaluable but solver guard rejects their range;
integer upper2**53+1 rejected rather than rounded. See status_numeric_checks.json.

After adding the actual optimization boundary diagnostic, reran --checks-only
only (affected numeric/status group), PASS. This deliberately discovers and guards
a native mismatch: target.3000000000000000000000000001 with demand10 and budget.3
is rounded to3 by float64. Native status0 buys3; exact post-validation returns
REJECTED_EXACT_TARGET_MISMATCH. Oracle proves no target-pass in this domain and
fallback service3/cost.3. Full fixture/hash/native stages/oracle are retained in
numeric_counterexamples.json. General repair/fallback proof is not implemented;
not a claim that all optimizer correctness checks pass. No production wiring.

Initial smoke command was inline Python importing cases/evaluate/flat/build and
solving fixed-zero baskets for milk_fairness, simultaneous_bottlenecks and
multiday_fefo with10s per solve: all status0, maximum state error0. No DB or legacy
execution. Failed/read-only console encoding/search attempts are not test evidence.

Report details: [S342_PROCUREMENT_BENCHMARK](../reports/S342_PROCUREMENT_BENCHMARK.md).
Original results_all are preserved; results_current is a provenance-labelled merge
of initial and targeted results, NOT another run. All previous source/tests and
accepted ADRs are protected by pre-edit hash audit. Only four pre-existing files
may change: CURRENT_STATE, ROADMAP, PROCUREMENT_DESIGN and PROCUREMENT_FORMULATION.
New report/notes and ignored runtime/s342 are additional; no production wiring.

verify_and_bundle.py checks corpus hashes against persisted fixture bytes and
regenerated cases, merged37 oracle comparisons, all protected pre-existing hashes,
local document links and git diff --check. It creates the review ZIP and verifies
CRC, complete manifest membership/hashes and source-byte equivalence. Results are
in verification.json and post-creation archive_check.json; archive checks are not
regression/accuracy evidence. No development DB access/reset/migration/commit/push.
Stop after this benchmark. ADR-018 remains PROPOSED; business policies not accepted.
