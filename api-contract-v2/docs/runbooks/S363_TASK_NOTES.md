# S3.6.3 — planning setup resolver

## Pre-edit plan / authorized scope (2026-10-09)

Contract frozen: current PROCUREMENT_API_CONTRACT_VI.md sections 2–5, default
BASE95/overrides=[]/budget=null declared/versioned by source, exact decimal strings,
same-path inheritance, saved resolved thresholds and late-bound budget. ADR-020/021
continue governing unchanged computation; no new business policy or ADR required.

Implement small application contracts/request parser, by-value configuration bundle,
resolver and explicit bridge to operational /2. Typed errors include field paths;
programming errors propagate. No auth/readiness/accepted-run claim from resolution.
Source records retain read time/consistency declaration, never infer DB isolation.

Acceptance: modes/forbidden fields; omitted/null/zero/[]; partial vs full custom;
stale/missing config; saved revision/default warning; budget ceiling; scoped active
overrides; numeric/date/resource guards; exact percentage shifting; detached and
forged boundaries; small resolver→pipeline fixture with exclusion audit; /1 regressions.
BASE95 benchmark for synthetic 5/10 Products using S362 topology and native solver,
separate resolver/phase timings and truthful eligibility/proof/deadline reporting.

Verification: new resolver tests + existing /2 contracts/pipeline/procurement tests
and /1 capture regressions whose bridge boundary is adjacent. No DB adapter/schema
change, therefore no new DB tests or full suite. Previous S362 12 PG passed is
HISTORICAL INFORMATION for this turn, not fresh verification.

Rollback: remove only new S363 files and restore only this slice's documentation
edits from runtime/s363/before. Baseline hashes preserve all existing source/tests,
unrelated WIP and 15 existing ZIPs. No edits to S1/S2, /1 callers, migrations/API routes.
BE internal setup only; FE/ML/Data unaffected; demo/benchmark uses explicit synthetic
configuration. No commit/push/development DB, next slice or ZIP creation.

## Implementation / routine technical choices

New small application modules: contracts/planning_setup.py, use_cases/planning_setup.py
and use_cases/planning_pipeline.py. Complete stored thresholds use decimal text at
the config boundary; effective ratios use exact exponent shifting. Config source
records include version/time/provenance and a consistency declaration, not a DB
isolation claim. Budget version is the actual ceiling version; effective amount and
full policy/config identity retained alongside it. Saved timestamp history can be
unknown. Approved BASE95 default content is validated at inheritance, not fabricated.
Full custom does not inherit those values. No new business decision/ADR.

Resolution output rederives business values from retained request/config; bridge
revalidates it and requires every existing execution declaration explicitly. The
three presence-sensitive request types share a narrowly scoped serialization/wrap
validator to preserve omitted fields through recursive Pydantic instance and JSON
revalidation. Other existing contracts/base class remain unchanged.
Raw JSON duplicate keys reject rather than selecting a last value silently.
Resource admission implemented here covers request bytes/path/override/active-menu
limits plus a known-offer bridge cap of 100; Ingredients/lots and public capture admission remain backlog,
not a claim that the current internal engine implements all public admission limits.

## Commands actually executed / failure-and-fix chronology

Logs in runtime/s363/*.txt are original PowerShell Tee-Object console bytes.

1. `.venv/Scripts/python.exe -m pytest tests/unit/test_planning_setup.py -q --tb=short`
   → 17 failed, 58 passed in 1.32s. Primary defect: nested instance revalidation made
   omitted optional fields appear as explicit None, rejecting otherwise valid setups.
2. Same command after a before-validator attempt → 17 failed, 58 passed in 1.25s.
   Pydantic had already converted instance attributes before that callback. Replaced
   it with a wrap validator that rebuilds through the presence-preserving serializer.
3. `.venv/Scripts/python.exe -m pytest tests/unit/test_planning_setup.py -q --tb=short --lf`
   → 17 passed, 58 deselected in 6.87s. These were the failed tests, not full regression.
4. Added important retained JSON round-trip, raw JSON, invalid constructed instance,
   zero/replacement floor and explicit-unknown declaration cases. Ran:

   ```powershell
   .venv/Scripts/python.exe -m pytest tests/unit/test_planning_setup.py tests/unit/test_decision_pipeline_v2.py tests/unit/test_decision_snapshot_adapter_v2.py tests/unit/test_procurement_v2.py tests/unit/test_decision_capture.py -q --tb=short
   ```

   → **212 passed, 11 warnings in 163.25s**. 84 new resolver cases plus 128 existing
   affected tests. Warnings came from intentional copied/forged invalid bool/float/
   NaN/Infinity/-1 serialization before rejection, not accepted invalid quantities.
5. Final resolver-only guards ensure corrupt default cannot enter via custom
   inheritance, duplicate JSON keys reject and foreign saved records cannot be
   retained as same-Store config. Adjusted inheritance case to use approved empty
   default overrides; did not weaken foreign/invalid/round-trip assertions.
   Reran affected module only:
   `.venv/Scripts/python.exe -m pytest tests/unit/test_planning_setup.py -q --tb=short`
   → **86 passed, 1 warning in 7.12s**. Do not claim a final 214-pass gate: other
   files were not rerun after these resolver-only changes; they were unchanged.
6. `.venv/Scripts/python.exe scripts/benchmark_planning_setup.py`
   → completed both native synthetic BASE95 cases, evidence
   runtime/s363/benchmark_BASE95/{summary,resolution_5p,resolution_10p,pipeline_5p,pipeline_10p}.json.
   Script chooses a new numbered output directory if one exists, preserving evidence.

Pytest/benchmark console commands used `2>&1 | Tee-Object -FilePath ...; exit
$LASTEXITCODE` to save logs without hiding exit codes. No DB tests/full suite here.
Previous S362 acceptance 12 PG passed is historical and was not rerun for this slice.

## BASE95 benchmark result / CURRENT FACT

Explicit declared default BASE95 per Product, overrides=[], null budget uses known
synthetic ceiling14 VND, finite domain65536. Same S362 5/10P fixture topology, no
percentages lowered to 1%. Config/facts are synthetic, not real customer data.

| Case | Resolver | External total | Engine wall / reported / overrun | Outcome |
| --- | ---: | ---: | --- | --- |
| 5P | 0.000958s | 12.420057s | 3.805755s / 3.800568s / 0 | NO_ELIGIBLE_CANDIDATE |
| 10P | 0.000771s | 22.239769s | 9.692435s / 9.678735s / 0 | NO_ELIGIBLE_CANDIDATE |

Both winner null, zero eligible options, all three strategies have reference
candidates but customer/construction fail, INCOMPLETE, UNPROVEN, feasibility UNKNOWN.
No exact enumeration. 10P LEAN SEARCH_LIMIT_NO_INCUMBENT; other terminations
ENCODED_NO_CUSTOMER_INCUMBENT_NOT_PROOF. No proof there is no feasible solution.
Every phase is recorded separately in raw summary and feature document. Later
comparison/selector/revalidation is outside the engine10s cooperative budget;
overrun0 observed here is not a universal deadline or SLA. No model accuracy,
calibrated quantile, savings or global optimum assertion.

## Deliverables / remaining scope

Feature: [PLANNING_SETUP_RESOLVER](../features/PLANNING_SETUP_RESOLVER.md).
CURRENT_STATE/ROADMAP/ARCHITECTURE and planning-contract capability table updated
only for new implementation facts. Product/API wire policy, original FE/C01/auth,
all accepted ADRs, existing engine/source/tests/S1/S2 remain unchanged.

Internal S3.6.3 COMPLETE within tested scope; S3 overall IN PROGRESS. Remaining:
real consistent config/saved/budget storage, auth/HTTP C01-C03, durable acceptance/
idempotency/worker/Run result/read/replay, forecast orchestration/reuse, operational
public admission. No business-policy blocker raised; no next slice authorized here.
No ZIP created, commit/push, migration or development DB access.


### Final small bridge guard and lightweight checks

After the benchmark, final review added the approved known-offer admission cap100
to the NEW bridge declaration (no existing /2/S1/S2 contract changed), with an
oversized copied-declaration rejection assertion. Affected rerun only:
`.venv/Scripts/python.exe -m pytest tests/unit/test_planning_setup.py -q --tb=short -k 'bridge or resolver_to_native_pipeline or missing_recipe_active_override or unknown_declarations'`
-> **5 passed, 82 deselected in 5.99s**. Do not call this a full87-test rerun.
Benchmark has eight offers; numerical computation/fixture unchanged. Its raw timing
is the measured earlier source, not a newly rerun final timing/SLA. New bridge request
values are compared with the benchmark's retained requests in the final context check.

Lightweight verification via `.venv/Scripts/python.exe -` (PowerShell here-string):
AST parse all five new Python files, local links in six changed/new documents,
SHA-256 guard of all preexisting first-party WIP except four authorized doc updates,
all15 existing ZIPs byte-identical and inventory unchanged (no new ZIP), OpenAPI
equal to previous S362 schema (/health only), BASE95/proof summary and unchanged
final bridge request values for5/10P. `git diff --check` also ran and passed.
Exact safe result recorded in runtime/s363/context_checks.json. These are not runtime
regression/DB/accuracy tests. No code/source change after these final checks.


## S3.6.3 small-domain review continuation (2026-10-09)

User explicitly requested this verification and a SMALL review ZIP; earlier no-ZIP
rule applied to the initial slice only. Scope/acceptance/rollback were recorded
before edits in docs/reports/S363_SMALL_DOMAIN_VERIFICATION.md. Baseline guards
all prior source/WIP, historical BASE95 artifacts and15 archives.

New hand fixture/oracle/native tests cover stock zero-winner, affordable purchase
and certified finite no-pass. Initial2 failures were a test field-name error
(option_token instead of token), not a runtime failure; expectations stayed intact.
Combined new+resolver tests90 passed/1 warning31.17s; after direct winner-outlay
assertions only affected2 reran:2 passed/1 deselected8.24s. Exact commands, oracle
independence, native evidence and proof scope in the review report.

Manual review script ran all3 actual pipelines again to retain typed JSON artifacts;
all VERIFIED. Existing5/10P benchmark native outputs unchanged UNKNOWN/UNPROVEN.
Only5 fixed exact probes each were evaluated. Separate conservative captured-fact
expiry bound proves P0 can fulfill at most9.6 of16 BASE servings (60%), below95%;
this is reviewer arithmetic, not an added engine proof/finite certificate or a
conclusion from failure to find a witness. See report for assumptions/dates/units.

No production/dependency correctness change, HTTP/DB/schema/migration/commit or
S3.6.4. Small ZIP is an overlay, not whole backend; dependency hashes and omissions
make unchanged external runtime requirements explicit. Existing archives preserved.


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
