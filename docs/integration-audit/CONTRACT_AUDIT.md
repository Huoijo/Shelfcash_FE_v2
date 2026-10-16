# Phase 3: static integration contract audit

Template status: NOT_RUN. No contract comparison has been performed in this preparation pass.

For every mapped consumer compare method/path, path/query parameters, body, response/envelope, enum casing, date/time formats, nullable/optional/omitted fields, arrays/objects, HTTP statuses, error shapes, authorization, Store scope, idempotency/CAS, and lifecycle guards.

Inspect fallback defaults hiding malformed responses; loose typing/any; ignored fields; optimistic updates; cache invalidation; query keys; scope isolation; mutation success handlers; and differences between BE defaults and FE defaults. Record exact source/contract/deployment evidence before classifying a mismatch.

## Finding record

- Boundary and affected case IDs: NOT_RECORDED
- FE assumption and source: NOT_RECORDED
- Applicable BE contract/deployment behavior and source: NOT_RECORDED
- Observed mismatch: NOT_RECORDED
- Expected UI state and user impact: NOT_RECORDED
- Classification / confidence / BUGS.md reference: NOT_RECORDED
- Verification mode: STATIC_ONLY until exercised

Do not silently update contract pins, regenerate clients, add defaults, accept malformed responses, alter permissions, or change enums to make discovery pass. Distinguish harmless documentation/format differences from wire incompatibility. A live/pinned contract disagreement needs explicit disposition and affected-scope accounting, not a guessed deployment revision.

Do not infer success for lifecycle operations from a shared response shape or a similar endpoint. Mark static checks separately from live cases; static evidence cannot close UI/authorization/persistence obligations.
