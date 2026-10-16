# 020 — Canonical green visual refinement

Date: 2026-10-17. Visual-only follow-up to the supplied MagicPathWorker report. Current engineering register: [V1](../../status/FOUND_MISSING_UI_V1.md).

## Authority

Read the exact final source contexts for all 13 canonical components in project `458079658328604672`. [Design audit](../../testing/VISUAL_GREEN_20261017_DESIGN_AUDIT.json) records each component/revision, palette and verification boundary. OWNER uses `461895559079428096`; STAFF uses `461895532667871232`, superseding their earlier green-accent revisions. The legacy Input flow component is excluded.

The worker's build/render results remain attributed to the supplied report. History has no separately captured final preview in that report. This pass inspected the exact revision sources; it did not independently rerender the remote components or run FE browser/live acceptance.

## Changes

[BrandAccent.css](../../../src/shared/styles/BrandAccent.css), imported from the existing root stylesheet, defines brand `#1F6B4A`, hover `#18563C`, soft `#EEF6F1`, border `#B8D1C3` and success `#2E7D5A`.

- Marketing/Auth/App shell/Invitation wordmarks receive the 6px brand cue. The active sidebar icon receives green; sidebar, shell and body typography stay neutral.
- Positive primary CTA, active tabs/filters, selected controls, focus and checkbox/radio accents use the palette. Existing actions, routes, permissions, disabled rules and transitions are unchanged.
- The shared OWNER/STAFF stepper uses a fully green current arrow and a softly tinted completed arrow, with future arrows grayscale. Clip-path, dimensions and spacing are unchanged.
- Completion/ready/resolved/active indicators and unread/count micro-cues are accented on badges/icons, without colouring their parent cards or tables. KPI panels and selected strategy-card backgrounds remain neutral; the selected strategy receives only a subtle accent border.
- Shared `sc-flow-primary` and `sc-store-primary` are not globally recoloured. Presentation-only `data-brand-accent` / `data-brand-success` attributes distinguish approved/accept/submit/create/export/receipt contexts from Reject, Request changes, Withdraw, Revoke, Decline, discard and uncertain recovery. Unknown/retained recipe intent is conservatively neutral when its positive operation cannot be established from the existing local context.
- Low-stock, near-expiry, warning, blocked, stale, lost-ACK and invalid/wrong-account feedback retain neutral styling. Negative confirmations also retain neutral checkbox/focus accents. No generic green body-link/icon theme, gradients, illustrations or new surfaces.

All TSX edits are styling annotations only. A TypeScript AST comparison, ignoring just those two presentation attributes, confirms identical handlers, state, routing, conditions and JSX structure. CSS declaration inspection confirms colour-only properties outside the explicitly approved wordmark pseudo-element. No business/API, routing, IA, layout, feature availability or workflow changes are introduced.

## Verification and remaining work

[Verification receipt](../../testing/PASS_020_VISUAL_GREEN_VERIFICATION.json) records 479 existing controlled tests passing across Auth/Import/Planning/Store/Operations/Capabilities, build and lint, plus the AST/CSS checks. Existing effect warnings and the large-bundle warning remain. No implementation-mirroring CSS tests were added.

FE browser screenshots, visual/a11y acceptance and live E2E were not run. TD-01 remains PARTIAL for that broader work; this visual pass closes no runtime/business gap. No new production design fallback was invented and no parked scope was reopened. No commit/push in this pass.
