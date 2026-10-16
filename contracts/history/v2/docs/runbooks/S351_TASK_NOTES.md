# S3.5.1 — Pure procurement comparison foundation

## Before edit — 2026-10-08

CURRENT FACT: read AGENTS/current state/roadmap/design, ADR-019 and historical 017/018,
current procurement/serving contracts, validation, arithmetic and tests. Preserve all
tracked/untracked WIP and runtime evidence. No existing engine/source change planned.

Frozen input: one revalidated ProcurementResult, including captured input and exactly
three strategy outcomes. A candidate's snapshot/currency/scope/metrics must match
that result, verified by existing procurement/serving validators. No second context,
live facts, DB, solver or simulator call. Explicit proof/target/execution limitations
remain per strategy even when a purchase plan is grouped.

Available facts: captured terms × integer counts give exact purchase outlay; captured
applicable fee policy gives exact fee activation; candidate.outlay gives total; full
Product/day/path requested/fulfilled/lost and Ingredient/day/path diagnostic shortage,
expired/other-waste/ending exist. No price/revenue/profit, probability or Product→lot
attribution exists. Ingredient ending is D+7 only; daily shortages are diagnostic
full recipe need minus available, not purchase quantity or Product loss allocation.

Implementation choices: pure exact signed quantities/deltas; three-path per-Product
horizon totals (no business-value total); Ingredient totals in exact units. Stable
internal SHA256 option tokens identify plan plus evaluation, never persisted IDs.
Group exact captured offer/count/lot/arrival plan only if evaluations also agree;
otherwise retain separate options with explicit diagnostic. One retained source result
preserves all warnings/issues/provenance/journals/raw solver evidence. Output independently
reconciles metrics/costs/deltas/group memberships; no trust in construct/copy objects.

Acceptance: zero purchase vs absent/unknown; miss vs certified no-pass; incomplete
validated incumbents; duplicate targets/proofs kept separately; equal-cost different
plans; unequal Product/path gains; repeating ratios/signed deltas; input/output
mutation, scope/unit/currency/context, arithmetic guards; provider/solver/simulator
isolation. Deterministic no-solver demo reads a retained synthetic procurement fixture.

Verification: comparison tests + direct procurement/output/serving/decision regressions.
No existing shared schema/lifecycle/API change, so no full suite. Rollback removes only
new comparison source/tests/demo/docs and appended state/roadmap/design entries.
BE internal presentation facts only; FE/API/DB/ML unchanged. No winner/selection,
new target/safety/defaults, ADR acceptance, commit/push or next slice.

## Delivery / CURRENT FACT

Pure contracts/domain/application projection and independent output reconciliation
implemented. Existing engine contracts/validator/arithmetic/search are unchanged.
Exact plan/evaluation serialization defines grouping; SHA256 only creates internal
tokens, with collision rejection. Unordered evaluated rows normalize for identity;
no numeric facts are repaired. Same plan/incompatible evaluation stays separate with
diagnostic. All strategy targets/proofs/raw solver/search journals remain individual.
Input source preserves forecast warnings/captured issues/assumptions/provenance/coverage.

Important observed limit: captured payable_fee has no delivery fee taxonomy. Expose
purchase/payable_fees/total exactly, delivery_fees=null for generic payable modes;
NONE has explicit zero. No classification invented or new schema/API field imposed.
Source is one invocation; cross-run comparison is outside this accepted boundary.

## Exact verification commands / results

Commands below use existing `.venv/Scripts/python.exe`; logs in runtime/s351 and ZIP.

- `-m pytest tests/unit/test_procurement_comparison.py -q` initial:36 passed,1 failed,
  9.54s. Test incorrectly called clear() on dumped tuple; implementation did not fail.
- `-m pytest tests/unit/test_procurement_comparison.py -q -k 'snapshot_mutation or ordering or duplicate_plan or same_plan or identity_hash'`:
  5 passed,33 deselected,1.70s after correction/exact grouping hardening.
- `-m pytest tests/unit/test_procurement_comparison.py -q` final: **40 passed,11.26s**.
- `-m pytest tests/unit/test_procurement.py tests/unit/test_serving_output_validation.py tests/unit/test_decision_execution.py -q`:
  **202 passed,41.91s**. Direct typed/output boundaries used by comparison. Existing
  numerical/basket/search tests confirm no procurement behavior change. No shared
  schema/transaction/API changes, no reason to run full suite. No DB fixtures used.
- `scripts/generate_comparison_fixture.py`: exit0. Offline canonical fixed-basket
  evaluations 0/2/4 packs; not procurement search; explicitly INCOMPLETE/UNPROVEN.
- `scripts/generate_comparison_fixture.py --equal-cost`: exit0. Two captured offers,
  equal-money distinct offer/lot baskets. Explicit manual subset provenance.
- Original runtime/s344/demo_numeric_miss.json and demo_target_met.json copied to
  dedicated new test fixtures; original files unchanged, original native/finite proof
  retained. Metadata-downgrade tests are explicitly synthetic exercises, not new solves.
- `scripts/demo_procurement_comparison.py --output runtime/s351/demo_output.json`:
  exit0; deterministic fixture-only projection; no solver/simulation rerun. Output text
  redirected to runtime/s351/demo_output.txt. Re-executed after token canonicalization.
- `git diff --check`: passed. New-doc link/compile/bundle checks recorded separately.

Tests prove hand-calculated Product/path gains, rational ratios/deltas, horizon-ending
versus sum-of-balances, unit isolation, zero versus no candidate, unknown/no-pass proof,
duplicate evidence preservation, equal-cost different-plan separation, incompatibility
diagnostics, type/classification/outlay reconciliation and input/output mutation guards.
Fault numeric/collision cases are labelled, not native optimizer evidence. Domain
fresh-process import isolation verified. No new global optimality, allocation replay,
forecast accuracy, profitability, probability, DB/fresh-session/OpenAPI or full-suite
claim. Existing source evidence is preserved, not independently recertified.

## OPEN / remaining scope

API/UX details, delivery-fee capture/taxonomy, customer-choice acknowledgments and
persistence, cross-run comparisons, authorization, recommendation policy and configured
safety semantics remain open. No winner, FE, endpoints, purchase order, DB/migration,
new policy, commit/push or next slice. Rollback only new files and four labelled doc
entries plus this feature/task note; preexisting source/evidence kept by hash check.

## Packaging incident / corrected

First cloned bundle script retained the S3.4.4 destination filename and overwrote that
generated archive. Corrected to shelfcash_S3_5_1_review.zip with an explicit destination
guard. Reconstructed S3.4.4 archive from pre-S3.5.1 source/docs: all415 snapshot hashes
matched, original source/evidence/repository files untouched. Recovered archive has362
entries, valid CRC/manifest, same source/doc bytes; its ZIP hash differs from the
original (original ZIP byte identity could not be recovered). Historical status is
labelled regenerated. Recovery metadata: runtime/s351/s344_archive_recovery.json.
No unique source/test/evidence lost; do not claim the old archive bytes were preserved.
