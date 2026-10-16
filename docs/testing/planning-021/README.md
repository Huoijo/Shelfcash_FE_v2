# 021 — Controlled Planning evidence

Current PL-01: production bound and controlled verified; see [implementation receipt](ASSISTANT_IMPLEMENTATION_RECEIPT.md). Earlier 021/preparation sections below are historical snapshots; current binding is documented in the final section.

[Implementation receipt](../../sprints/021/021_Planning_Handoff_Integration.md) and [verification](VERIFICATION.json).

- 519 Node tests, including 40 added Planning cases, use fixtures/intercepted fetch/local state.
- [12 browser cases](BROWSER_VERIFICATION.json) mount the actual export components with synthetic Auth/Store/Run providers and intercept every HTTP request; native IndexedDB survives reload and clean isolated Chromium restart. No real session or BE server is used.
- `pdf-uncertain.png`: original unresolved intent, replacement locked.
- `pdf-processing.png`: exact replay accepted, J01 running.
- `pdf-completed.png`: completed job, download available.
- `retained-discovery.png`: EX01 retained receipt, existing artifact download.

Screenshots are component/state evidence, not full-shell visual acceptance. Synthetic PDF bytes prove transport/hash behavior only. Summary/Chat have application-state tests but no production UI caller/screenshots pending canonical interactions. Live API/full app E2E/provider/backend PDF content NOT_RUN.

Repeat: `npm run test:planning`; `node scripts/verify-planning-021-browser.mjs`. Browser runner builds a temporary isolated bundle/profile, uses no app/BE server, and removes its temporary files/profile on exit. The backend handoff directory is read-only input.

## PL-01 implementation preparation

Preparation-only additions; no pending Assistant UI is rendered or enabled:

- [State → UI binding matrix](ASSISTANT_UI_BINDING_MATRIX.md): 30 conceptual/variant states mapped to current owners, DTOs, actions and recovery limits.
- [Controlled browser plan](ASSISTANT_UI_BROWSER_PLAN.md): 30 planned cases, all browser execution NOT_RUN until final canonical binding.
- [Design integration checklist](ASSISTANT_DESIGN_INTEGRATION_CHECKLIST.md).
- Test-only portable fixtures in `tests/fixtures/planning-assistant-preparation.ts`, exact synthetic BE envelopes in `planning-assistant-responses.json`, and assertion/interception helpers in `tests/helpers/planning-assistant-preparation.mjs`.
- [Preparation verification](ASSISTANT_PREPARATION_VERIFICATION.json).

B01: switching presentation after terminal Summary currently blocks a deliberate new generation. B02: old-version Summary replay requires an explicit current-evidence gate before presentation. Characterization tests reproduce these; production behavior is unchanged. Unknown metadata-only Chat after reload still blocks both replay and a new same-scope question. Verdict: PL-01 PREPARATION PARTIAL — BLOCKERS FOUND. Earlier 021 evidence/counts above remain historical.

## Approved PL-01 production binding — current

Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`. [Implementation receipt](ASSISTANT_IMPLEMENTATION_RECEIPT.md), [Assistant browser evidence](assistant-implementation/BROWSER_VERIFICATION.json), [fresh PDF/export regression evidence](assistant-implementation/export-regression/BROWSER_VERIFICATION.json). Summary/Chat now have production callers. Historical preparation findings/counts above are preserved and superseded for current PL-01 status. Live BE/provider/full-app E2E: NOT RUN.

Repeat Assistant: `node scripts/verify-planning-assistant-browser.mjs`. PDF regression with fresh destination: `node scripts/verify-planning-021-browser.mjs docs/testing/planning-021/assistant-implementation/export-regression`. Do not overwrite original 021 captures.

## PL-01 regression closure

**PL-01 CLOSED — CONTROLLED REGRESSION SEALED**. [Complete baseline receipt](regression-seal/README.md): 578 Node tests, 62 Assistant browser cases, 12 PDF/export browser cases, build/lint and every package gate PASS. No product changes in the closure task; live BE **NOT RUN**. P17 is named `UNCERTAIN_NEW_QUESTION_BLOCKED`; older immutable receipts use the historical negative-case alias `NEW_QUESTION_AFTER_UNCERTAIN`.
