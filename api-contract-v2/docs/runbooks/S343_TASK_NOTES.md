# S3.4.3 task notes - numeric correctness and exact bounded certification

Classification: CURRENT FACT for scratch execution; PROPOSAL for engine/policy.
Authorization: runtime/s343 only plus design/formulation/state/roadmap/report docs.
No production/contracts/serving/accepted ADR/schema/DB/commit/push/API/PO changes.

## Pre-edit plan, frozen numeric handling and rollback

Read AGENTS and authority order, ADR-017/018, procurement design/formulation,
S342 report/notes/source/counterexample. Preserve prior WIP AND all runtime/s341/
s342 artifacts byte-for-byte; before_sha256.json records protected inputs.

Exact strings -> Decimal/Fraction for business; float64 projection is candidate
generation only. Existing finite/near-integer extraction guards remain technical.
Every extracted vector gets exact packs/MOQ/fees/budget/scope/date checks, canonical
simulate_serving plus output validation and receipt-capacity checks. Record evidence
before another operation. Reject false passes, retain hard-valid target misses,
exclude only that integer vector; general finite no-good binary cuts, not neighbor
cuts. Deduplicate and detect repeated excluded basket/extraction/cut failure.

One absolute deadline covers build/solve/candidate checks/re-search/certification.
Cache fully evaluated vectors. No new evaluation after expiration; non-preemptible
stage may overrun and must be reported. Native LIMIT incumbent exact checks if time
remains; native INFEASIBLE proves only encoded float model. Programming/numeric/
model failures remain execution failures, never business completion.

Small domain certification uses a separate odometer/exhaustive traversal in the
coordinator, independent from oracle's itertools.product and acceptable-set ranking.
Share only exact business checker/canonical evaluator, not search/cuts/proof logic.
Complete exact traversal certifies min-outlay target or max-service/min-outlay
fallback and acceptable set. Exact comparisons; experimental stable vector tie.
No float bound/gap is used as exact proof. Incomplete traversal retains validated
incumbent and UNKNOWN target feasibility; no optimal/infeasible claims. Enumeration
proof is explicitly credited to enumeration, not MILP. Unsupported solver range
is a diagnostic, not fabricated feasibility. Required safety remains BLOCKED.

Conservative target projection is a deliberate experiment only: raising RHS can
exclude exact-feasible baskets and is not a superset relaxation. Use it to test
independent certification recovery; do not adopt as production fix. No target
rounding down, budget epsilon or serving change. Ordinary projection stays unchanged.

Acceptance: reproduce saved counterexample first; boundary/price/service float
ties, multiple offers/paths, fees/floors/zero/repeating rationals; interrupted
re-search and certification, native/fault outcomes and repeated-vector defenses.
Broader hand/seeded graphs with more Ingredients/offers/lots, dated recipes,
shared/complementary paths/fees/physical caps. Small exact oracles; large domains
runtime only, no forced enumeration. Existing S342 affected cases/parity checks
rerun selectively, not full corpus/full pytest; domain formulation unchanged.

Rollback limited to new runtime/s343/report/notes/ZIP and four existing docs:
CURRENT_STATE/ROADMAP/PROCUREMENT_DESIGN/PROCUREMENT_FORMULATION. Previous evidence,
production/tests/ADRs unchanged. No BE/FE/ML/Data business behavior changed.

## Execution evidence

Commands actually run, backend working directory:

```
./.venv/Scripts/python.exe -X utf8 runtime/s343/benchmark.py --only numeric_target
./.venv/Scripts/python.exe -X utf8 runtime/s343/benchmark.py --checks-only
./.venv/Scripts/python.exe -X utf8 runtime/s343/benchmark.py
./.venv/Scripts/python.exe -X utf8 runtime/s343/benchmark.py --only broader_3p_seed103_NONE --seconds 60
./.venv/Scripts/python.exe -X utf8 runtime/s343/benchmark.py --only broader_5
./.venv/Scripts/python.exe -X utf8 runtime/s343/benchmark.py --only broader_10
./.venv/Scripts/python.exe -X utf8 runtime/s343/parity_checks.py
./.venv/Scripts/python.exe -X utf8 runtime/s343/verify_and_bundle.py
```

Initial numeric-target invocation failed during whole-corpus materialization:
missing actual receipt dates need object-specific WARNING. Added warnings to
synthetic fixtures, did not change the contract. Rerun3 cases PASS in1.9689s.
Initial defensive group PASS. Full NEW S343 benchmark28 cases in204.9861s:
25 small certificates pass,1 small NONE-fee fixture incomplete20s and harness
assertion preserved,2 large runtime-only fixtures UNCERTIFIED. No old full S342
corpus or full pytest rerun. S342 affected fixtures8 are included with fresh
canonical validation/oracle checks; numeric guards and old counterexample rerun.

NONE-fee fixture initially scanned45/64 vectors in20.5701s, returning correct
UNCERTIFIED. New experiment budget60s rerun only that fixture: certificate PASS;
47.9734s whole run including23.4862s independent oracle,23.8926s coordinator.
Combined evidence has26 small certificates/553 grid vectors, all primary/fallback
objective and full acceptable-set matches. No old result silently rewritten.

Added large-domain candidate-only fallback when full domain exceeds cert limit.
Reran only5/10 Product groups across.1/1/5/15s budgets,7.0983/15.2265s total.
Both large domains65,536 vectors, not exhaustively enumerated. Native10P5s
fallback LIMIT WITH incumbent observed (gap.1159814598654881), exact validated
outlay13,BASE service668099/3010560. Total5.4237s includes non-preemptible final
validation overrun.15s run encoded gap0 same candidate, remains UNCERTIFIED.
No native float bound/gap used as exact proof. Some initial/targeted jobs briefly
overlapped on workstation; report raw timings, not hardware performance guarantees.

Affected policy parity:6 fixed baskets over5 fixtures, full state and16 selected
min/max probes PASS; max absolute error3.9968028886505635e-15. Formulation and
canonical serving unchanged; no full historical parity-corpus repeat. Large
parity cases skip alternate-state probes; no general uniqueness proof.

Final --checks-only rerun after adding unbounded-model/empty-vector/safety/integer
range defenses PASS. Nine2D-vector no-good checks, repeated/cut/programming/model
errors, deadlines after1/2 rejections/in certification, fault timeout with/without
incumbent, NaN/Infinity/near-integer/range guards, zero-vector exclusion and required
safety BLOCKED asserted. Fault status evidence remains separate from the actual
native timeout observed in large run. Technical failures cannot certify business
outcome; cached hard-valid evidence retained where present. No production classifier.

No new pytest/PG/API/full-suite run: only scratch coordinator/fixtures/docs changed;
canonical boundary executes on every valid evaluated vector and parity output.
S342123 targeted test pass is historical. No dependency install or DB access.
Existing app/tests/contracts/migrations/accepted ADRs and all S341/S342 evidence
are protected by before_sha256 audit; only four existing docs may change.

verify_and_bundle checks those hashes, snapshots/corpus identities, raw/current
provenance and26 independent comparisons, links/git diff, then archive CRC,
manifest/hash membership and source equivalence. Results in verification.json and
archive_check.json are document/archive checks, not extra benchmark/test runs.
No engine ACCEPTED; ADR-018 PROPOSED; no commit/push or next slice started.
