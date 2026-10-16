---
name: live-be-fe-e2e
description: Plans, executes, and reports ShelfCash FE-BE integration discovery and live E2E audits, including Owner/Staff, permissions, Store isolation, state coverage, authoritative readback, and mutation recovery. Use for integration QA, production-readiness discovery, live testing, audit preparation, and acceptance assessment.
---

# ShelfCash integration discovery and live E2E

## Determine assignment mode before acting

Read the [integration audit rule](../../rules/integration-audit.md) and [audit workspace](../../../docs/integration-audit/README.md).

- PREPARATION_ONLY means documentation preparation only. Do not start applications, probe APIs, log in, upload inputs, run browser interactions, build/lint/test, diagnose workers/processes, operate databases, or modify product code. A stored execution prompt does not activate itself.
- DISCOVERY_EXECUTION requires an explicit execution assignment for the target environment and stated scope. Existing authorization remains valid; do not ask again for actions already authorized. Access to accounts/repositories does not authorize arbitrary data changes.
- The current preparation package records a user-reported macOS PID-tracking blocker. Do not present its root cause as verified, treat all macOS environments as unsupported, or bypass process identity checks. Establish supported native architecture, runtime, process ownership/incarnation, and worker evidence on the target.
- Preserve existing dirty work. No commit, push, reset, rebase, deletion, migration, or rewriting work. Stop after the discovery report; product fixes require an explicit follow-up instruction.
- Discovery does not permit product-code edits. The original prompt's necessary-startup exception is narrow, must be authorized and recorded with a new baseline, and never permits weakening authorization, mutation safety, or process tracking. PREPARATION_ONLY has no startup exception.

## Discovery workflow

Use the [original English prompt](../../../docs/integration-audit/PROMPT.md) as the complete discovery assignment, subject to the user's current mode and scope. Its original wording is preserved there.

1. Establish target-host safety, source/build/contract/design/environment/data baselines.
2. Inspect both repositories and map every FE route/consumer/control family to its relevant BE operation, contracts, guards, and expected states.
3. Enumerate meaningful route x role x permission x Store x data x lifecycle x action combinations, including nested controls and automatic transitions. Explain impossible combinations.
4. Perform the static contract audit and record findings before changes.
5. Execute runnable live-browser cases with UI/network/readback/refresh/deep-link evidence.
6. Exercise applicable adversarial, negative, navigation, authorization, and consistency cases.
7. Perform an additional exploratory sweep for states/edges missing from the matrix; add and evaluate new cases as far as the environment allows.
8. Produce the current-run coverage, defect ledger, and A-L discovery report; stop without implementing fixes.

The canonical output workspace is docs/integration-audit, not a competing root-level directory. Use [COVERAGE_MATRIX](../../../docs/integration-audit/COVERAGE_MATRIX.md), [BUGS](../../../docs/integration-audit/BUGS.md), and [REPORT](../../../docs/integration-audit/REPORT.md). Preparation templates are not completed inventory, cases, findings, or test results.

## Evidence and operating rules

1. Verify user action -> actual request/response -> authoritative state -> rendered/cache state -> refresh/deep-link. HTTP 200/202, a toast, screenshot, source inspection, or health check alone does not establish business success.
2. Isolate Owner/Staff browser contexts, cookies, storage, and Store rights. Never borrow Owner authority to make a Staff case pass. Verify both client guards and safe independent BE enforcement; direct API checks are not live UI acceptance.
3. Record FE/BE revisions and dirty fingerprints, deployed identity when evidenced, applicable contract hashes, current design revisions, platform/runtime/browser versions, and data provenance. Unknown deployment identity stays UNKNOWN; a handoff SHA is not a deployment attestation.
4. Verify actual FE data source, API URL, TLS/certificate trust, Origin/CORS, session/CSRF, required workers, and supported process identity. Do not carry over another machine's ports, absolute paths, seeds, sessions, PIDs, or test PASS results.
5. Audit latest relevant MagicPath source and previews before claiming design coverage. Include state nodes, every control/edge, guards, nested/error/recovery/permission branches, role variants, aliases, and secondary surfaces. Reconcile changes to design/build/contract; fixed inventory counts and DEV playgrounds are not exhaustive evidence.
6. Do not guess entity bindings, source semantics, IGNORE choices, missing/null/zero/false meanings, or unsupported layout interpretation. Block dependent cases on unresolved source semantics and continue independent work.
7. Use authorized test Stores/data/recipients, run-specific namespaces, and independent expected-result oracles. Account access does not authorize database resets, deletion, migrations, real-user grant changes, unrelated writes, or external email. Cleanup must be supported and must not erase failure evidence.
8. Distinguish before-send failure, definite rejection, known receipt, and unknown outcome. Retain exact intent/key/body/CAS/pins; follow operation-specific readback or exact replay. Never use a fresh key to escape uncertainty or infer non-application from unchanged state. FE cancellation does not prove BE cancellation.
9. Known receipt plus failed readback does not authorize another mutation. If exact intent or authoritative proof is unavailable, retain unknown/locked state and document the limitation; do not reconstruct secrets or intent after reload/logout/Store switch.
10. Preserve redacted trace/network/readback when errors occur. Stop dependent writers for authorization, isolation, duplicate-write, or data-integrity risk; continue independent authorized cases. Use bounded polling/retries and escalate exact prerequisites rather than repeatedly attempting the same blocked path.
11. Separate environmental/platform prerequisites from product defects. Broken promised behavior is FAIL; dependent cases may be BLOCKED. Do not hide failures under blockers or call missing prerequisites NOT_APPLICABLE.
12. Sanitize before persistence. Keep passwords, cookies, CSRF, mail/invitation tokens, raw HAR/storageState, and sensitive logs out of tracked evidence. Use aliases and relevant non-secret request/resource references; private artifacts require an ignored local location.
13. Follow [MagicPath authority](../../rules/ui-magicpath-authority.md). Do not create placeholder production UI or new business decisions to complete integration. Maintain [current V1](../../../docs/status/FOUND_MISSING_UI_V1.md); preserve [historical evidence](../../../docs/FOUND_MISSING_UI.md) without rewriting and keep [parked scope](../../../docs/status/Underconstruction_by_BE.md) parked.
14. New discovery cases use NOT_RUN, PASS, FAIL, BLOCKED, or NOT_APPLICABLE. Record blocker category and scope disposition separately. Use P0-P4 severity for new audit defects; preserve historical labels. Keep STATIC_ONLY, API_ONLY, LIVE_UI, LIVE_WITH_FAULT_INJECTION, CONTROLLED, and MOCK outcomes separate.
15. Report node/edge/API/permission/Store/data accounting, actual execution, and acceptance independently. No remaining NOT_RUN or unaudited inventory may be hidden by a completion claim. Environment-limited discovery is not full acceptance, and an average score cannot compensate for authorization or integrity failure. Never claim bug free or every possible input tested.

## ShelfCash business invariants

- Mapping proposal, reusable Profile approval, persisted Review confirmation, and canonical Commit are different facts. Staff cannot decide reusable Profiles; Owner may approve their own proposal; approval does not grant Commit authority.
- A valid full spec without missing_fields may approve eligible RULE proposals together. Do not require resolving every RULE separately. needs_confirmation with a target is a proposal needing review; profile_proposals=[] does not discard suggestions; available source_only is supported.
- Preview/Review/Commit preserve source/mapping/read-set/evidence pins and current required permissions. Stale/retired/identity/domain blockers must hold globally regardless of drawer visibility. Atomic Commit must not partially write; replay must not duplicate effects.
- Pure inserts/NO_OP may omit/null Commit reason where contracted. Corrections/amendments require justification. A temporary FE reason requirement does not rewrite BE policy.
- Purchase history does not increase stock, and usage history does not automatically decrease stock. Opening/count/actual receipt are distinct. Do not infer recipe yield, pack/base-unit cost/MOQ, timezone, calendar, promotion, weather/uplift, or forecast semantics.
- Completion is an immutable receipt; Readiness is a separate current assessment. Planning readiness requires planning.context.read, budget.read, and procurement.cost.read. Readiness failure does not undo completion or authorize another Commit.
- Do not invent accepted-file delete/replace/unseal, separate Preview decision persistence, generic negative mutation-outcome proof, or batch-scoped SourceContext semantic flags. Re-check the actual applicable contract when capabilities change.

## Direct reference documents

- [HANDOFF](../../../docs/integration-audit/HANDOFF.md): target transfer, private credentials, compatibility, and future activation text.
- [ENVIRONMENT](../../../docs/integration-audit/ENVIRONMENT.md): fresh baseline and process/platform gate.
- [SYSTEM_MAP](../../../docs/integration-audit/SYSTEM_MAP.md) and [STATE_MATRIX](../../../docs/integration-audit/STATE_MATRIX.md): both-repository inventory and meaningful coverage.
- [CONTRACT_AUDIT](../../../docs/integration-audit/CONTRACT_AUDIT.md) and [EXECUTION_PLAYBOOK](../../../docs/integration-audit/EXECUTION_PLAYBOOK.md): phase details, evidence, blockers, and stop condition.
- [INPUT_DATA](../../../docs/integration-audit/INPUT_DATA.md): workbook inspection and independent oracles; no workbook execution was performed during preparation.
- [017 protocol](../../../docs/testing/017_Live_BE_FE_E2E_Protocol.md): supplemental checklist; older pins/absence claims do not override current contracts/runtime or this discovery package's reporting conventions.
- [Consolidated contract workflow](../../../contracts/WORKFLOW.md) and [Owner/Staff guide](../../../docs/guides/IMPORT_FLOW_OWNER_STAFF_GUIDE.md): interpret with current code/contracts and later receipts, not as blanket live acceptance.
