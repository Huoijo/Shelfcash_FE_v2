# ShelfCash integration audit: discovery before fixes

Applies to FE/BE integration QA, production-readiness discovery, live E2E planning, execution, and reporting.

- Read the [audit workspace](../../docs/integration-audit/README.md), [original prompt](../../docs/integration-audit/PROMPT.md), and [live E2E skill](../skills/live-be-fe-e2e/SKILL.md) before acting.
- Determine the assignment mode first. In PREPARATION_ONLY, read/write documentation only: no application startup, API calls, browser interaction, builds, tests, worker/process diagnostics, database operations, or product-code changes. A prompt stored in a document is not an instruction to execute it now.
- A later explicit audit assignment on the target host may authorize DISCOVERY_EXECUTION for its stated scope. Do not carry over the previous host's sessions, process identities, environment assumptions, or PASS results.
- Treat the macOS PID-tracking blocker as user-reported until supported by target-host evidence. Never disable process ownership checks, substitute guessed PIDs, bypass platform validation, or weaken recovery to force progress.
- Follow phases 0 through 8 in order: baseline, both-repository system map, state matrix, static contract audit, live browser sweep, adversarial cases, navigation, authorization, and data consistency. Discover and record defects before fixes.
- Use isolated Owner/Staff sessions and explicitly authorized test Stores/data. Account access does not authorize resets, migrations, deletion, arbitrary grants, external email, or unrelated writes.
- Preserve UI -> request/response -> authoritative state -> rendered state -> refresh/deep-link evidence. HTTP success, screenshots, source inspection, and API-only checks are not live UI acceptance.
- Every execution case has NOT_RUN, PASS, FAIL, BLOCKED, or NOT_APPLICABLE. Record scope dispositions and blocker types separately. A product defect is FAIL; dependent cases may be BLOCKED.
- Record meaningful route x role x permission x Store x data x lifecycle x action combinations. Document impossible combinations; do not remove difficult cases from coverage accounting.
- Preserve exact intent/key/body/CAS/pins after unknown mutations. Follow operation-specific readback/replay rules; no fresh-key retry, inferred failure, or competing writer. Cancellation does not establish server rollback.
- Stop affected writers on authorization/isolation/data-integrity risk; keep evidence and continue independent cases. Retry only within a recorded bounded policy. Escalate a blocker with the exact missing prerequisite.
- Discovery is read-only with respect to product code. The original prompt's startup exception is limited to a necessary, authorized startup repair, logged separately with a new baseline; it is never permission for product fixes or PID-safety bypasses. PREPARATION_ONLY allows no such exception.
- Use P0-P4 for new audit defects. Keep historic severity labels unchanged; do not average away authorization or integrity failures.
- Keep credentials, cookies, CSRF, tokens, raw HAR/storageState, and sensitive logs out of tracked evidence. Sanitize before persistence; private artifacts require an ignored local location.
- Keep current missing-design facts in [V1](../../docs/status/FOUND_MISSING_UI_V1.md); keep parked scope parked and follow MagicPath authority. The audit defect ledger is not a competing missing-UI register.
- Produce COVERAGE_MATRIX.md, BUGS.md, and REPORT.md under docs/integration-audit. Report every untested/blocked area and confidence limitation. Include one additional exploratory sweep and extend the matrix for new states.
- Stop after the discovery report. No implementation fixes, commit, push, reset, rebase, data deletion, or rewriting existing work without an explicit follow-up instruction.
