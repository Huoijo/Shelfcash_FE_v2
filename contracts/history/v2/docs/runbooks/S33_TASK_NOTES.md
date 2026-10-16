# S3.3 - Pure serving allocation and dated FEFO

Classification: CURRENT FACT / ACCEPTED DECISION / TECHNICAL DEBT / PROPOSAL.

## Pre-edit plan, numeric freeze and rollback

User task (2026-10-07) explicitly authorizes provisional progressive proportional
serving + captured inventory/FEFO only, plus recording future procurement/no-winner
directions. ADR-017 will partially supersede ADR-016/011 conflicting policy intent;
accepted historical ADR files will remain unchanged. Read AGENTS and authority-order
documents, existing S3.1 contracts and S3.2 BOM/arithmetic/tests before implementation.

Existing branch feat/from_forecast_to_decision_run; preserve all S3.1/S3.2 and
verification-policy WIP. No S1/S2 changes, DB access/reset/migration, commit/push,
API, procurement/budget allocator, selector or persistence/replay implementation.
Serving uses recipes/units/time/provenance validated by the unchanged BOM boundary.
New typed input wraps PreparedDecisionInput and explicit hypothetical arrivals.
Per-day stock flow: arrival, remove previously expired, allocation, FEFO, close;
expiry X usable in X, remainder disposed once at close X. Future-dated operational
lots are excluded throughout, never scheduled as arrivals. Unknown receipt stays
unknown and warns; FEFO: known expiry first, then known receipt first, stable UUID.
Unknown expiry on usable positive tracked stock blocks; missing cost retains warning.
Any captured DATA_BLOCKER blocks serving output, even when BOM math is complete.
Independent inventory state per LOW/BASE/HIGH; no whole-Decision READY assertion.

Numeric freeze: exact Fraction state, exact recipe intensity line/(yield*(1-loss)),
exact requested/fulfilled/lost/Ingredient/lot conservation. Progressive filling
uses exact saturation fractions and freezes the union of simultaneous bottlenecks.
No epsilon or integer servings. Output Quantity contains canonical numerator and
denominator strings (exact business quantity) and a Decimal display rounded once
at precision50/HALF_EVEN, MAX_EMAX/MIN_EMIN; views never drive balances. Repeating
remainders remain in exact state. Exact quantity minus Fraction(display) exposes
the signed display remainder, never a hidden lost/waste adjustment. Resource guard:
1000 digits for exact numerator/denominator and source decimal expansion, checked
before expansion and at calculation boundaries. Numeric failures or existing
Decimal output-boundary failures produce typed ARITHMETIC_BLOCKED and no partial
paths/rows. Technical limits are versioned, not business readiness thresholds.
This exact-state contract is separate from unchanged dated_bom/1 rounded outputs.

Acceptance: hand milk20/10 with6L =>15/7.5; complementary shortage20/0 and15/5;
simultaneous bottlenecks; permutations; dated yield/loss; FEFO and expiry inclusive;
cross-Ingredient unconsumed stock; explicit arrivals/future lot exclusion; zeros,
fractions/numeric failures; Product/Ingredient/lot/day/path rational conservation;
immutability, isolated paths, preserved blockers/warnings/provenance, forged copies.
Golden G04/G07 and relevant portions G01/G05/G09/G12/G14 become executable only
where this foundation actually computes; procurement/recommendation remain specs.

Verification: new serving tests + S3.1 and BOM boundary callers + existing recipe /
inventory shape regressions; plain-domain import guard and manual small input.
Additive in-memory modules only: no full suite/PG/OpenAPI gate unless actual impact
expands. BE pure entrypoint; FE/ML/Data/API/DB untouched. Document links/hash audit.

Rollback: remove new serving contracts/domain/use case/tests/demo docs/script and
reverse S3.3-only edits to canonical docs. ADR-017 is a new record, not a mutation
of old ADRs. No DB/dependency rollback; preserve pre-existing WIP. Future policy
changes require new semantics version; no historical run reinterpretation.

## Verification evidence

CURRENT FACT, Windows/Python 3.11.9, 2026-10-07; exact commands actually run:

1. `./.venv/Scripts/python.exe -m pytest tests/unit/test_serving.py -q`
   => 26 passed, 1 failed in 2.23s. Failure was the subprocess import-guard fixture
   calling UUID(int) positionally, not the allocator. Corrected to UUID(int=i).
2. `./.venv/Scripts/python.exe -m pytest tests/unit/test_serving.py::test_domain_framework_provider_io_import_guard -q`
   => 1 passed in 0.21s. No unrelated rerun for that fixture fix.
3. Added exact carried-remainder, arrival permutation/provenance and programming-error
   cases. `./.venv/Scripts/python.exe -m pytest tests/unit/test_serving.py tests/unit/test_bom.py tests/unit/test_decision_execution.py -q`
   => 144 passed in 2.98s (30 new serving +33 unchanged BOM +81 unchanged S3.1).
4. `./.venv/Scripts/python.exe -m pytest tests/unit/test_operational_contracts.py -k 'recipe or inventory or balance' -q`
   => 9 passed, 43 deselected in 0.11s.
5. Hardened exact digit guard before integer-string conversion and explicit owned
   Decimal traps. `./.venv/Scripts/python.exe -m pytest tests/unit/test_serving.py -k 'repeating or ambient or numeric or quantity' -q`
   => 6 passed, 24 deselected in 0.87s. Reran only affected arithmetic cases.
6. `./.venv/Scripts/python.exe -m scripts.demo_serving_fefo`
   => COMPLETE / NOT_ASSESSED / serving_fefo/1; SYNTHETIC BASE day1 A15/1, B15/2,
   lost5/1 and5/2. No DB access or provider needed.

153 distinct targeted cases passed across groups; reruns are not additional cases.
No full suite, PostgreSQL, fresh-session persistence or public API verification was
run. No database access/reset/migration/commit/push. Pure additive foundation touches
no shared existing contract/writer/infrastructure. No persistence/accuracy/optimality
inference from unit pass. Old full regression counts stay historical evidence.

Assertions: progressive equal fractions, complementarity, simultaneous saturation,
input permutation/caller mutation independence, dated yield/loss, day-start arrivals,
excluded future operational lots, inclusive expiry and one-time disposal, exact
FEFO ties including unknown receipt, zero demand/stock, rational repeating remainder,
Product/Ingredient/lot/day/path conservation, path isolation, retained warnings and
provenance, typed blockers and no partial numeric results, forged-input rejection,
programming errors propagate, and framework/provider import isolation.

Routine choices frozen: exact-state ratio + one-way display contract; resource cap
1000 digits, exact remainder rather than epsilon/clamping; explicit in-window
hypothetical arrivals for the serving use case; all known blockers stop serving;
quantity-only output with zero other_waste and no cost valuation. These do not
implement future procurement policy. All quantities and lots ordered deterministically.
Numeric diagnostics currently cover Product scope rather than locating first failed
day/path; technical limitation documented, no fabricated quantities.

New files: app/application/contracts/serving.py, use_cases/serving.py,
app/domain/decision/quantities.py and serving.py; tests/unit/test_serving.py;
scripts/demo_serving_fefo.py; ADR-017, SERVING_FEFO.md and these notes.
Canonical docs updated separately; no old ADR file or S3.1/S3.2 source/tests edited.
Hash audit verifies all previously existing app/tests/alembic/ADR/AGENTS bytes remain
unchanged and no file disappeared. `git diff --check` passed. Inline Python local
Markdown-link check: 100 links checked, no broken paths.

S3.3 COMPLETE within authorized pure scope; S3 overall IN PROGRESS. Accepted future
heuristic/joint supplier evaluation, LOW/BASE/HIGH construction and no-winner
completed persistence direction recorded in ADR-017, partially superseding ADR-016/011.
The policy-v1/package-v1/S1 lifecycle still differ from that future accepted direction;
this is explicitly pending wiring, not a silently altered contract. No next slice.
Pending specifications: heuristic search/termination/ties, exact best_available
ranking, safety floor, policy-v2 and no-winner persistence schema/lifecycle/API.

Review ZIP: shelfcash_S3_3_review_updated.zip, uncommitted current-filesystem snapshot.
Includes relevant source dependencies, targeted tests, canonical docs/ADRs/notes,
manual demo and original authorization, plus guide/status/manifest/omissions. ZIP
integrity, paths, manifest and byte-for-byte source content checked before delivery.
Excludes env/secrets, caches, DB dumps/model binaries/datasets and old ZIPs. No new
tests run merely for collection. ZIP remains ignored and is not a commit.

