# Discovery execution playbook

Status: PREPARATION_ONLY. The steps below are instructions for a later authorized run; none are executed by preparing these documents.

## Phase 0: safety and baseline

Populate ENVIRONMENT.md on the target. Identify both working trees/revisions/dirty states, actual startup methods, endpoints, native architecture, process ownership, contracts, designs, accounts, test Stores, seed data, and permitted writes. Verify environment prerequisites only after execution is authorized. Keep environment/platform blockers separate from product defects.

Do not commit, push, reset, rebase, delete data, or rewrite work. No product-code edits during discovery. The prompt permits only a necessary startup repair within the assignment; document it separately and establish a new baseline. Never use that exception to weaken PID/process ownership, authorization, idempotency, or domain rules.

## Phase 1: system map

Inspect both repositories before interacting with the UI. Populate SYSTEM_MAP.md with all known FE routes/consumers/control families and relevant BE endpoints/contracts/guards. Map consumer -> endpoint -> request -> response -> authorization/Store -> expected UI. Register mismatches immediately; do not fix them.

## Phase 2: state matrix

Derive cases using STATE_MATRIX.md and populate COVERAGE_MATRIX.md. Include every backend lifecycle state and meaningful role/grant/Store/data/action combination. Document impossible combinations and parked scope with authority. No discovered case may be implicit.

## Phase 3: static contract audit

Follow CONTRACT_AUDIT.md for every boundary. Record defects in BUGS.md before browser execution. Static conclusions are not live acceptance; an apparently correct implementation still needs execution coverage.

## Phase 4: live browser sweep

For every runnable in-scope case:

1. Establish preconditions, the correct isolated role/session/Store, and initial UI/server state.
2. Navigate through the intended user entry point and capture the initial state.
3. Perform the named visible user action and inspect browser console/network.
4. Inspect URL, method, payload, relevant non-secret headers/pins, status, and response shape. Do not persist auth material.
5. Verify pending/disabled/error/success states, navigation, and current FE/cache state.
6. Use authoritative readers to verify persisted state and absence of prohibited side effects. Database inspection is allowed only when authorized and should not substitute for the public flow.
7. Refresh, revisit through a deep link where applicable, and verify reconstruction from the server.
8. Record the result and redacted evidence. A toast, screenshot, HTTP 200/202, or job receipt alone is insufficient.

## Phase 5: adversarial and negative cases

Apply only errors/conditions supported by the operation and safe test scope:

- HTTP: 400/401/403/404/409/422/429/500; also 412/413/415/428/503 or other documented statuses where applicable; unknown code, malformed/non-JSON responses, missing pins, and failed jobs.
- Network: slow request/response, timeout, connection loss, interruption, bounded retry, and stale/out-of-order responses. Distinguish before-send failure from after-apply lost acknowledgment.
- Interaction: rapid double-click, repeat/competing submit, close while pending, navigation away, Back/Forward, refresh, and the same resource in multiple tabs.
- State: stale/deleted reference, changed grants/membership, stale Store selection/cache, and expired authentication. Do not delete real resources to manufacture a case.
- Input: empty/whitespace, min/max/max+1, numeric/decimal boundaries, invalid enum/date/ID, duplicates, and Unicode/Vietnamese content.

Look for duplicate writes, false success, permanently disabled buttons/spinners, stale rows/counters, wrong-Store data, unauthorized controls/calls, swallowed or raw errors, blank screens, uncaught promises/React exceptions, request storms, and redirect loops.

Label actual live, live with fault injection, controlled, mock, API-only, and static checks separately. A mocked success or unauthorized direct API check does not count as live UI PASS.

## Phase 6: navigation and persistence

Exercise sidebar, buttons, rows, dialogs/drawers, redirects, Back/Forward, direct/reloaded/bookmarked URLs, invalid IDs, and unauthorized destinations. Verify server reconstruction rather than assuming retained in-memory state survives refresh. Check Store/actor changes and stale responses cannot revive another scope's state.

## Phase 7: authorization

For every privileged mutation, verify visible controls, FE guards, safe direct API denial under the unauthorized role, backend enforcement, user-facing rejection, absence of sensitive data leaks, and safe Store/entity/cursor substitution. Hidden buttons alone do not establish security. Keep unauthorized API probes separate from UI acceptance and verify no write occurred.

## Phase 8: data consistency

Compare user action -> request -> response -> persisted server state -> FE/cache state -> rendered UI -> state after refresh. Inspect optimistic updates, invalidation/query keys, Store scope, ordering/paging/filters, derived counts, and timezone semantics against an independent oracle. Receipt-known success followed by readback failure must not open a new writer.

## Blocked-case behavior

Preserve the observation, scope, intent, and evidence. Identify the precise missing prerequisite and owner. A product defect is recorded as FAIL; dependent cases may be BLOCKED with a reference to that defect. An environment prerequisite can independently block a case without proving a product defect.

Stop affected writers when data integrity, authorization, isolation, or duplicate-write risk appears. Continue independent authorized cases. Do not bypass guards, change actors to make a case pass, edit the database, silently mock success, retry indefinitely, or create a fresh mutation key after an unknown result. Use operation-specific recovery and retain uncertainty when proof is unavailable.

If all remaining work is blocked, produce an environment-limited report with the attempts, preserved state, affected cases, and exact prerequisite for resuming. Do not silently stop, mark inaccessible cases PASS/N/A, or claim the original mutation failed because unchanged state was observed.

## Additional exploratory sweep and stop condition

After planned discovery, perform one more sweep specifically for missing states/controls/transitions. Add newly discovered cases and execute them as far as the authorized environment permits. Discovery cannot be marked complete while cases remain NOT_RUN or inventories/edges remain unaudited.

Produce REPORT.md sections A-L with all limitations. Distinguish completed discovery with documented blockers from full acceptance. Do not claim fully tested or bug free. Stop after reporting; fixes require an explicit follow-up instruction.
