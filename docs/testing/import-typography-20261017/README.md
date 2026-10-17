# Import typography normalization — authority-blocked source audit

Date: 2026-10-17 (Asia/Bangkok).

**PARTIAL IMPORT TYPOGRAPHY NORMALIZATION — FOLLOW-UP REQUIRED**

No production implementation or typography acceptance is claimed. This is a bounded source audit for the requested typography task, not a live integration discovery audit.

## Authority and execution limits

Read DESIGN.md, the visual fidelity/copy/typography rules, MagicPath authority, Import contract, current register and historical register, plus the local design/frontend/Playwright skill entrypoints. The user-supplied attachment contains fragments of the task, including comparison minimums, diff discipline and final reporting requirements; omitted numbered sections were not reconstructed as instructions.

The available web tool could not access https://www.magicpath.ai/files/458079658328604672. The user supplied the same project URL after the access question; it did not provide source content or revision verification. No authenticated MagicPath connector/browser is available in this session. The historical current-register pins are OWNER `461895559079428096` and STAFF `461895532667871232`; they have **not** been freshly checked. Unavailable authority is not evidence that a design is missing or fundamentally disagrees with implementation.

The repository-local design-md-workflow skill requires: “Establish the current canonical MagicPath revision for the relevant surface/role through an authorized read-only audit. Local receipts are historical evidence until checked against the current source.” Production UI edits remain pending that check. No permission exception is inferred from the project link.

`node_modules` is absent, including the locked Playwright skill/CLI. No dependency installation, browser installation, application server, build or test execution occurred. Node was used only for the source inventory.

## Findings and bounded implementation plan

[SOURCE_AUDIT.json](SOURCE_AUDIT.json) records hashes for 65 Import source files and each literal 8/9/10px candidate in those files. Counts are declarations, including overrides, **not** unique selectors, computed styles or rendered text occurrences. Shared CSS, inherited/relative/variable sizes and shared components outside those directories are not included. All candidates remain conservatively UNRESOLVED; this is not a completed semantic census.

| Size | Candidates |
|---|---:|
| 8px | 3 |
| 9px | 26 |
| 10px | 29 |
| Total | 58 |

Concrete families requiring review against current designs:

- Evidence: `.input-context-evidence` uses 10px and its paragraphs use 9px. Typography rules require evidence values/body at least 12px and labels at least 11px.
- Comparisons: Profile comparison sections use 11px and their labels inherit the 9px rule-group `small` selector. `ImportProfileSpecification.tsx` renders previous/proposed sections there. Labels require at least 11px, values at least 12px. Sales/Supplier uses the comparison class too; shared cascade must be inspected.
- Resolver: scope select values use 10px; navigation actions use 9px; labels use 10px; input/select/textarea values also have an 11px base. These require semantic treatment rather than blanket replacement.
- Source Context: form labels use 10px, explanations use 9px, and controls inherit a form scale. Explicit label/body/control tokens must respect the different floors.
- Tables: scoped Preview headers, cells and row actions use 10px. Headers require 11px; cells/actions require 12px.
- Stepper: secondary text uses 9px; the approved rules allow a 10px secondary description, subject to geometry verification.

These are source-level discrepancies against the typography rules, not proof of rendered failures. Some 11px semantic violations sit outside the 8/9/10px inventory. No exception is approved solely from a selector name. No new primitive is warranted until existing shared styles and current canonical states are checked.

After access is restored, verify current OWNER/STAFF designs, map evidence/comparison/recovery/resolver/source/domain/history/Profile/review/table/stepper families to the approved semantic scale, and render each family before proceeding. Use Import-scoped tokens if a shared change would affect sealed PL-01. Inspect actual production components at 1440px and supported narrow widths for wrapping, card height, clipping, overflow, hierarchy and action/footer collisions. Use isolated fixtures and block/intercept all network requests; preserve copy, permissions, mutation/recovery behavior and existing density.

## Executive receipt

| Requested item | Result |
|---|---|
| Verdict | PARTIAL IMPORT TYPOGRAPHY NORMALIZATION — FOLLOW-UP REQUIRED |
| Production files changed | None |
| Typography system | Approved semantic scale read; no tokens implemented or runtime changes claimed |
| Before → after | No production change; source baseline recorded |
| Remaining audit | APPROVED_MICRO 0; PROTOTYPE_ONLY 0; UNRESOLVED 58 literal declaration candidates, limited scope above |
| Visual/layout regressions | NOT RUN; none fixed or ruled out |
| OWNER/STAFF parity | NOT VERIFIED for this task |
| Controlled tests | NOT RUN; final task test total 0 |
| Browser verification | NOT RUN |
| Build/lint/gates | Build/lint/contract gates NOT RUN; documentation diff check reported separately |
| PL-01 | No production files changed; regression tests NOT RUN |
| Live backend | NOT RUN |
| Follow-up | Current canonical source access/revision audit, local locked dependency setup, implementation, actual production component rendering and controlled regression |

Existing register dimensions are unchanged. This follow-up belongs to TD-01 visual/verification debt; it creates no new missing-design FM item. Historical register preserved. No commit/push.
