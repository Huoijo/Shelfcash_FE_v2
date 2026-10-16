# Phase 2: meaningful state coverage

Template status: NOT_RUN. These are coverage obligations, not enumerated or executed cases.

Derive meaningful combinations of route x role x permission x Store context x data state x lifecycle state x action. Reduce impossible combinations only with a specific guard/contract explanation. Do not generate an arbitrary full Cartesian product or claim every theoretical combination was exercised.

## Dimensions

- User: unauthenticated/authenticated, valid/expired/invalid session, current account and invited-account mismatch where applicable.
- Authorization: Owner/Staff, read/write allowed/forbidden, each required grant missing, grants or membership changing after load and before/in flight with a mutation.
- Store: none/one/multiple, selected, stale/invalid/inaccessible Store, Store/entity/cursor substitutions, late responses after switching scope.
- Data: loading/populated/empty/partial/stale; missing/invalid referenced entities; unknown/absent/null/zero/false; boundary size/value/date/timezone/unit conditions.
- Lifecycle: every backend-supported state, terminal state, retained receipt, eligible/ineligible transition, and guard; do not copy prototype scenario names as invented backend enums.
- Mutation: idle/pending/succeeded/rejected/unknown; validation/authorization/conflict/stale/backend/network failure; known receipt followed by failed readback; operation-specific recovery.
- Interaction: submit/cancel/close/back/retry, double-click, competing pending submissions, refresh/deep-link, multiple tabs/actors, and out-of-order reads.

## Coverage accounting

Record node/state coverage, control/edge coverage, endpoint/contract coverage, permission/Store coverage, data coverage, and execution mode separately. A state rendering correctly does not prove its outgoing transitions work. Parent-screen coverage does not cover nested drawers/fields/errors.

Each execution case uses exactly NOT_RUN, PASS, FAIL, BLOCKED, or NOT_APPLICABLE. A scope disposition such as PARKED_PRODUCT_SCOPE is a separate field; excluded combinations require a reason and authority. Missing prerequisites are BLOCKED, not NOT_APPLICABLE.

At discovery close, every enumerated row must have a result or an explicit remaining NOT_RUN limitation. Any remaining NOT_RUN prevents claiming discovery completion. Blocked rows permit an environment-limited discovery report, not full acceptance. Add new cases discovered by the final exploratory sweep and evaluate them before closing as far as the environment allows.
