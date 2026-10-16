# PL-01 controlled regression seal

**PL-01 CLOSED — CONTROLLED REGRESSION SEALED**

All requested checks passed after PL-01 integration. No regression was reproduced; no product code, contract, persistent rule or dependency was changed in this follow-up. The existing dirty implementation worktree was preserved without committing or pushing.

## Full pre-existing controlled baseline

The repository's [documented baseline](../../../architecture/UI_REFACTOR_TOOLCHAIN.md) is the six controlled Node suite entrypoints, formerly 519 tests. PL-01 adds 59 Planning tests, bringing the complete current baseline to **578/578 PASS**, with zero failures, skips, cancellations or TODOs.

- `npm run test:planning` — **178 PASS**; [log](test-planning.txt).
- `npm run test:capabilities` — **83 PASS**; [log](test-capabilities.txt).
- `npm run test:operations` — **30 PASS**; [log](test-operations.txt).
- `npm run test:import` — **143 PASS**; [log](test-import.txt).
- `npm run test:store` — **118 PASS**; [log](test-store.txt).
- `npm run test:auth` — **26 PASS**; [log](test-auth.txt).

## Build, lint and every package gate

- Build **PASS**; existing large-chunk warning unchanged. [Build log](build.txt).
- Lint **PASS**; only the existing OnboardingPages/RecipeSchedulePage effect warnings. No unrelated warning fixes. [Lint log](lint.txt).
- `check:contracts`, `check:capabilities-wire`, `check:recovery-policy`, `check:planning-wire`, `check:operations-wire`, `check:import-wire`, `check:store-wire`: **all PASS**. Individual logs and exit codes are recorded in [VERIFICATION.json](VERIFICATION.json).

## Controlled browser reruns

- PL-01: **62/62 PASS**; [per-case receipt](assistant/BROWSER_VERIFICATION.json), [runner log](assistant-browser.txt), 23 fresh desktop/narrow captures. Actual production components, intercepted HTTP and native isolated IndexedDB.
- PDF/export: **12/12 PASS**; [per-case receipt](export/BROWSER_VERIFICATION.json), [runner log](export-browser.txt), four fresh captures.
- Zero unexpected requests/page errors. Owned native darwin/arm64 Chromium profiles were cleaned up; no live FE/BE servers or real accounts.
- Fresh destinations preserve previous implementation/preparation screenshots and receipts. The Assistant runner now accepts an optional output directory, matching the existing export runner; its default is unchanged.

## Negative-case label correction

**P17: `NEW_QUESTION_AFTER_UNCERTAIN` → `UNCERTAIN_NEW_QUESTION_BLOCKED`.**

This is a receipt/test taxonomy correction only. The fixture builder, controller, original unknown operation, action blocking and zero replacement-dispatch expectation are unchanged. The current catalog, browser runner, browser plan, binding matrix and canonical mapping use the explicit negative name. The new P17 browser receipt passes under that name.

Older immutable preparation/implementation JSON receipts retain their original spelling as historical evidence. Their old label always meant **a new question is blocked while the original outcome remains unknown**, never permission to replace or retry. A known terminal outcome is separately covered by `NEW_QUESTION_AFTER_KNOWN_TERMINAL`.

## Preservation and boundary

[UNCHANGED_SOURCE_PROOF.json](UNCHANGED_SOURCE_PROOF.json) compares every src/contracts/.agents file and package/lockfile with the working tree at the start of this follow-up. It includes the already-uncommitted PL-01 source; it does not compare only to HEAD. Protected contents and file sets are identical.

**Live BE: NOT RUN. Provider: NOT RUN. Real account/business mutations: 0.** This seal covers the documented controlled baseline plus the two requested browser runners. The separate full-app Playwright projects/live E2E and provider quality are not certified by these checks.
