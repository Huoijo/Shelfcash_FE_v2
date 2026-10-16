# S3.4.4 internal procurement — work plan

Classification: CURRENT FACT / ACCEPTED DECISION / PROPOSAL as labelled.

## Before editing — 2026-10-07

Authorization: user's S3.4.4 task, attachment c31e0780. Read AGENTS, authority-order
documents, ADR-017/018, S341–343 evidence, scratch formulation and canonical serving.
Branch feat/from_forecast_to_decision_run, HEAD a4b68378f35fea6f71b549e24393cf4bbb35aba5.
Preexisting modified docs/AGENTS and untracked S3.1–3.4.3 sources/tests/evidence are
unrelated WIP; preserve them, adding only clearly labelled new state entries.

Frozen boundary: separate procurement/1 policy; required strategy targets, explicit
budget/fees/bounds/provenance/technical controls. Capture remains caller-owned typed
PreparedDecisionInput. No reinterpretation of DecisionPolicy v1. Supplier splitting,
one order, common selling unit, all-three-path exact serving, gross capacity before
expiry, min outlay for target and max service/min outlay for fallback. Configured
safety stock blocks. Solver is infrastructure; domain helpers are plain Python;
application owns revalidation, exact evaluation, journalling, deadlines and quality.

Acceptance: hand-calculated packs/MOQ/fees/shared ingredients; saved Decimal target
counterexample; independent small domain oracle; fixed-basket full-state MILP parity;
timeout/fault distinction; scope/unit/copy/mutation safety; native 5/10 Product
benchmarks. Targeted procurement plus serving/BOM/output/decision boundary regressions
because these are the direct dependencies; no public API/schema/shared lifecycle
changes, so no automatic full suite or PostgreSQL checks.

Rollback: remove new procurement contracts/domain/infrastructure/use case/tests/demo,
ADR-019 and new documentation entries only. No schema/data rollback, no DB access.
BE: opt-in internal computation only. FE/ML/Data/HTTP: unchanged. Demo: synthetic.
No commit/push, reset, migration, persistence, selector or next slice.

Routine choices to expose explicitly: sorted offer UUID pack-vector tie rule, equal
remaining-time strategy slices, cooperative deadline with required validation reserve,
guarded float64 projection, opt-in bounded certification. These are not hidden
business defaults. Reviewable numeric guard values are supplied by callers.

## Delivery — 2026-10-08

CURRENT FACT: internal contracts, plain exact helpers, solver port, infrastructure
progressive/FEFO MILP and application orchestration/output validator are implemented.
Required explicit policy and captured supplier-term references, budget/fees/capacity/
supplier limits/bounds/provenance; no operational schema extension. Journal classifies
before exclusions; target misses remain admissible to fallback. Shared exact cache,
fair three-strategy deadline, zero baseline, bounded search and opt-in enumeration.
Raw status/bound/gap/versions are distinct from exact validity/target/proof/completeness.
Later programming/model failure remains ERROR with retained validated evidence.

ACCEPTED DECISION: ADR-019 records only the user's approved internal direction;
targets/numeric demo constants/ties are required reviewable configuration/implementation,
not universal business policy. ADR-016/017/018 historical content unchanged.

Verification selection: 60 procurement tests; 206 BOM/serving/output/decision/smoke
regressions. Final commands/results and initial failures in S344_PROCUREMENT_VERIFICATION.
Final numeric hardening adds one test for exclusion RHS beyond exact integer range;
three affected no-good/counterexample tests passed after the small guard (58 deselected).
No redundant rerun of the unaffected group; procurement now has 61 executable cases.
No broad shared schema/transaction/public boundary change, so no full suite needed.
No PostgreSQL/fresh-session evidence is relevant to this pure scope; none claimed.
Synthetic native 5/10P measures and passing/miss/zero-budget demos delivered. Native
10P LIMIT with validated incumbents observed; large exact optimum NOT proven.
Build/native/evaluation are nonpreemptible; ~.72s overrun recorded honestly.

Remaining integration: capture/retention/replay/DB lifecycle/API/auth/PO/movements and
full cross-strategy selector untouched. No final Decision-ready or winner claim.
PROPOSAL: reviewer approves input envelope/business configuration and numeric/latency
limits before authorizing a next slice. Safety semantics and persistence no-winner remain
open. No commit/push/development DB access or next-slice implementation.
