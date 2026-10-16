# S3.6.1 — internal procurement/2 and selector

## Scope frozen before edits — 2026-10-09

User task and PROCUREMENT_API_CONTRACT_VI policy v1 authorize Product/path
construction100%, effective customer requirements, customer-pass-first fallback
max-min/equal mean/cost, winner cost/min HIGH/BASE/LOW/stable basket and grouping.
Old suppress-winner-on-partial-search wording is historical; search limit does
not mean execution failed. Preserve all old evidence/ZIPs and unrelated WIP.

Implementation boundary: separate typed procurement/2 + comparison/2 + selector;
no HTTP/wire/default/saved resolver, DB capture/persistence/migration/auth/FE/Optuna.
Preserve procurement/1, DecisionPolicy/S1 lifecycle, serving/FEFO and S1/S2.
Shared reuse limited to exact basket evaluation, input scope checks and MILP
physical equations; v1 retains common-unit/aggregate behavior.

Acceptance: handwritten multi-path/override/zero/mixed-unit/fees/MOQ/date/capacity
cases; independent finite exhaustive ranking oracle; native generation parity;
tiny .3 threshold counterexample; eligibility versus construction/proof/error;
grouping/evidence and immutable/revalidated boundaries. Synthetic 5/10 Product
native benchmark records finite domain, dimensions/timing/overrun/UNPROVEN limits.
Targeted procurement/2 first, then affected procurement/comparison/BOM/serving/
output/capture-pipeline unit regressions. No DB call/full-suite by default: this
is isolated internal version, not shared schema/transaction/API milestone.

Rollback: remove new v2 modules/tests/docs/benchmark artifacts and restore only
this slice's small reuse edits; never reset worktree, delete old ZIPs or change DB.
Affected BE internal engine/demo only; no FE/API or ML serving change.

## Evidence

CURRENT FACT: COMPLETE within internal scope; no HTTP/persistence/operational-v2
wiring. Branch feat/from_forecast_to_decision_run; HEAD
a4b68378f35fea6f71b549e24393cf4bbb35aba5 unchanged. All checks below ran 2026-10-09.

### Actual commands/results (chronological)

1. `.venv/Scripts/python.exe -m compileall -q app/application/contracts/procurement_v2.py app/application/use_cases/procurement_v2.py app/infrastructure/procurement_milp_v2.py app/application/use_cases/procurement_selection.py`
   exit0, compilation only.
2. `.venv/Scripts/python.exe -m pytest tests/unit/test_procurement_v2.py -q --maxfail=2`
   24 passed/1 failed in96.80s. Test fixture incorrectly called reverse on tuple;
   corrected fixture to tuple(reversed(...)), no business behavior relaxed.
3. `.venv/Scripts/python.exe -m pytest tests/unit/test_procurement_v2.py::test_capture_detached_ordering_ambient_context_and_public_revalidation tests/unit/test_procurement_v2.py::test_hand_winner_ties_and_money_priority -q`
   5 passed in19.36s. Hand tie test also explicitly distinguishes no third generated
   candidate from repeated-invalid-vector fault injection.
4. `.venv/Scripts/python.exe -m pytest tests/unit/test_procurement_v2.py -q -k "search_limit_without or blocked_input or stable_basket or legacy_identity or effective_requirements" --maxfail=2`
   6 passed/1 failed/25 deselected in4.07s. New blocker fixture supplied message
   instead of the existing typed field/affected/impact/suggested_action contract.
   Corrected fixture, preserving validation.
5. `.venv/Scripts/python.exe -m pytest tests/unit/test_procurement_v2.py::test_blocked_input_never_calls_search_or_fabricates_proof -q`
   3 passed in0.65s.
6. `.venv/Scripts/python.exe -m pytest tests/unit/test_procurement_v2.py tests/unit/test_procurement.py tests/unit/test_procurement_comparison.py tests/unit/test_bom.py tests/unit/test_serving.py tests/unit/test_serving_output_validation.py tests/unit/test_decision_execution.py tests/unit/test_decision_capture.py tests/unit/test_decision_snapshot_adapter.py -q --durations=10`
   389 passed/5 warnings in156.78s;32 new cases +357 affected regression cases.
   Warnings are serializer diagnostics from intentionally malformed copied capture
   facts (-1/NaN/Infinity/bool/float), tests assert rejection. No tests skipped.
7. Final small output-boundary hardening reconciles exact rejection reasons, unique
   cache count and elapsed/overrun evidence; added forged-output assertions to an
   existing test. `.venv/Scripts/python.exe -m pytest tests/unit/test_procurement_v2.py -q -k "forged_results or zero_demand or blocked_input or tiny_above" --durations=3`
   6 passed/26 deselected in20.20s. Old groups were not rerun after this isolated v2
   evidence check; do not add repeated tests to a unique-case regression count.
8. `.venv/Scripts/python.exe -m pytest tests/unit/test_review_archive.py -q`
   23 passed/2 skipped in0.17s. Windows host lacks symlink-creation privilege;
   exclusive destination/no-overwrite/suffix/manifest/CRC/publication guards pass.
9. Final numeric-capacity audit found that classification could exceed rational
   capacity AFTER basket computation. Cache now records only completely classified
   facts; requirement numeric admission and arithmetic inability return typed
   NUMERIC_UNSUPPORTED with no partial cache/proof. Two focused extreme cases added
   (source exponent too small, valid source threshold whose shortfall exceeds capacity).
   `.venv/Scripts/python.exe -m pytest tests/unit/test_procurement_v2.py -q -k "numeric_capacity or tiny_above or effective_requirements or fallback_minimum or deadline_incumbent or forged_results" --durations=3`
   7 passed/27 deselected in30.43s. Subsequently strengthened second numeric fixture
   from1e-1000 to1e-999 to specifically reach shortfall classification, and moved
   scope assertions back into their original test:
   `.venv/Scripts/python.exe -m pytest tests/unit/test_procurement_v2.py -q -k "numeric_capacity or effective_requirements"`
   3 passed/31 deselected in0.91s. There are34 new cases now; earlier389 gate had32.
   No full rerun after isolated numeric changes; affected cache/fallback/error paths
   covered by the seven-case run. Exact tiny threshold retained in output, no display
   rounding of the requirement. Assertion-only rerun:
   `.venv/Scripts/python.exe -m pytest tests/unit/test_procurement_v2.py::test_exact_tiny_above_point_three_native_research -q`
   1 passed in2.18s.

Coverage selection: new Product/path requirements, generation/exact validation,
oracle/ranking/selector plus all reused physical engines, old identities/contracts
and capture-pipeline unit callers. No HTTP/ORM/schema/transaction edits, and targeted
coverage exercises admission v1/v2 and old lifecycle/package behavior. Full suite
and PostgreSQL not run/accessed this slice. Prior PostgreSQL acceptance remains
historical S3.5.2 evidence, not a new test here. No accuracy/profit claim.

### Benchmark and artifact evidence

`.venv/Scripts/python.exe scripts/benchmark_procurement_v2.py`: first attempt exit1
because script used inventory_lots instead of existing lots field AFTER calculation;
script corrected, rerun exit0. Actual second-run native5/10P results saved, not
retroactively attributed to the failed command. This run overlapped unit verification;
wall times are measurements under that host load, not isolated SLA evidence.

`.venv/Scripts/python.exe scripts/benchmark_procurement_v2.py --permissive`: exit0;
additional explicit SYNTHETIC1% BASE/HIGH requirements, separate artifacts, previous
results preserved. Unit regression had finished before this command. Native5P
deadline WITH incumbent exact/customer-pass observed,10P without native incumbent
retains eligible captured-stock zero baseline. All large-domain proof UNPROVEN.
Timing/dimensions/limits are in S361_PROCUREMENT_VERIFICATION.md and raw runtime/s361.

After final evidence validator patch (and repeated after numeric cache fix):
`.venv/Scripts/python.exe scripts/verify_procurement_v2_benchmark.py`: exit0;
4 native results +4 selector artifacts revalidated through CURRENT boundaries,
source correspondence PASS; no solver/DB. Earlier raw timings remain earlier
measurements, not timings regenerated after that small validation hardening.

### Implementation choices and limits

New concrete contracts/port/adapter, no generic architecture. Admission marker2
needed because old capture rejects mixed selling units before procurement; default1
and DecisionPackageV1 keep old behavior. Old identity serializer omits only the new
implicit1 marker to preserve comparison/1 tokens; explicit2 is included. Technical
stable basket order is UUID/packs/arrivals; target thresholds retain exact Decimal.

Finite certificates cover only explicitly captured bounds; native statuses never
certify exact infeasibility. Float false negatives remain possible for large domain,
reported UNKNOWN/UNPROVEN. Reference customer-fail not ranked. Re-search iteration
limit and cooperative deadline are explicit; no guaranteed native cancellation.
Observed benchmark engine overrun2.44s/0.97s and separate comparison/selector latency
are disclosed. Generic payable fees remain unclassified as delivery; no hidden defaults.

No API/default/saved/auth/Optuna/DecisionRun retention/persistence. Operational-v1
pipeline remains unchanged and does not automatically call v2. Future integration
requires review; no next slice implemented. Historical ADR files untouched; ADR-020
supersedes only task-authorized policy sections. Review ZIP includes raw user task,
source/tests/docs, benchmark evidence and full WIP-aware patches/status. Baseline
hash audit preserves unrelated WIP and all11 prior ZIPs.

### Lightweight and archive checks

Final compileall over all12 new implementation/scripts modules: exit0.
`git diff --check`: exit0 (tracked whitespace only, not untracked correctness).
Packaging command:
`.venv/Scripts/python.exe scripts/bundle_s361_review.py --baseline C:/Users/trank/AppData/Local/Temp/shelfcash_s361_trpeekm7.json`
uses task pre-edit hashes; performs source/unrelated-WIP/historical-ZIP audit,
safe-path/known-secret checks, exact manifest byte/hash/CRC/source correspondence
and exclusive publication. Actual publication result/path/hash is recorded outside
the archive in runtime/s361/bundle_verification.json and reported to the user;
this document does not claim publication before that command succeeds.
