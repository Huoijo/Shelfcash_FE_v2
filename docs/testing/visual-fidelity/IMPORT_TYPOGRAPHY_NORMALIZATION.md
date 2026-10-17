# Import typography normalization — 17 October 2026

**PARTIAL IMPORT TYPOGRAPHY NORMALIZATION — FOLLOW-UP REQUIRED**

The bounded production typography change passes controlled source, semantic and rendered checks. Overall sign-off remains partial because four ordinary repository contract/wire gates fail on the starting Windows checkout. No contract, generated wire, business logic, approved copy or MagicPath content was changed to repair those unrelated failures.

## A. Starting state

- Root: `C:\Users\Dell\Desktop\Shelfcash_FE_v2`; branch `main`; HEAD `b318e90888ba60c7c1c226e05855d1a1989f74a3`.
- Existing dirty work: `docs/status/FOUND_MISSING_UI_V1.md` and untracked `docs/testing/import-typography-20261017/`. Preserved; the earlier authority-blocked audit remains historical evidence.
- Production files were clean. The working tree, including existing documentation, was the baseline. npm / package-lock; Node `v24.15.0`. Dependencies were absent and restored using `npm ci --ignore-scripts`, without changing the lockfile or installing another testing stack/browser.
- Before implementation, actual Import tests passed **143/143** and Planning **178/178**. The supplied full baseline was 578; the final full controlled run reproduces **578/578**.

## B. Design authority and explicit chart exclusion

Authenticated MagicPath read-only inspection verified project `458079658328604672` and the exact prompt revisions. Fresh canvas context then identified newer revisions:

| Surface | Component | Prompt revision inspected | Current revision inspected |
|---|---|---|---|
| OWNER | 460747146686242816 | 461895559079428096 | 461975629559140352 |
| STAFF | 460747115572916224 | 461895532667871232 | 461976479094435840 |
| Import History | 458255053002780672 | 461892415150780416 | 461979574209744896 |

[Authority comparison](import-typography-20261017/AUTHORITY.json) records unchanged/changed files. The current OWNER/STAFF changes add `ShelfCashVisualIntelligence`, `WriteCompositionRail` and `ReadinessSegments`; History adds its visual-intelligence stylesheet and screen additions. The remaining shared operational styles/specification sources match the prompt revisions. Per the user's explicit scope, **no chart, new chart region or chart data flow was implemented**. Existing FE surfaces alone were normalized. No legacy Input Flow authority and no MagicPath writes.

## C. Rules and skills loaded

`AGENTS.md`, `DESIGN.md`, visual fidelity, copy provenance, typography, MagicPath authority and Import UI design contract; current and historical missing-UI registers; the business document `docs/references/SHELFCASH_IMPORT_NAM_NGUYEN.docx` (source/profile/Review/Commit distinctions). Skills: repository-local `design-md-workflow`, `frontend-ui-standards` and `playwright-cli`, its selected upstream implementation sections and the installed Microsoft CLI skill; MagicPath plugin skill for authenticated design inspection.

## D–F. Semantic mapping, components and primitives

Five production CSS files changed. Existing selectors/primitives were reused; `ImportTypography.css`, imported by the existing Import flow stylesheet, supplies Import-scoped semantic variables rather than modifying global or shared Planning tokens.

| Role | Size / leading | Applied to |
|---|---|---|
| Body / evidence value | 12px / 20px | Source interpretation, evidence, samples, before/after values, Profile explanation, recovery, Review receipts, row values |
| Control | 12px / 20px | Input/select/textarea values, interactive filters, links/buttons styled as actions, consequential acknowledgment |
| Label | 11px / 18px | Evidence/form/context labels, comparison labels, operational status |
| Micro | 10px / 16px | Secondary step descriptions, redundant step numeral, secondary file byte size |
| Card title | 14px / 22px | Evidence and Profile/domain grouped headings where the selector owns the size |
| Evidence drawer title | 20px / 28px | Existing evidence drawers previously overridden to 18px |

Page and major section hierarchy remain intact; no global multiplier, root font increase, color changes, copy edits or component/state refactor. No new runtime component, route, API call or business condition.

The [pre-change semantic inventory](import-typography-20261017/SEMANTIC_INVENTORY.json) maps 88 explicit existing declarations to roles, including inherited 11px controls and overridden historical declarations. It is a source inventory, not a count of rendered text nodes. Subsequent fixes explicitly cover resolver base text, control inheritance, source acknowledgment and evidence drawer titles.

Families covered, following the requested order: context evidence; before/after; mutation/recovery; shared resolver shell; Source Context; Sales/Supplier/domain review; History Correction; first/reusable Profile; Review/Commit; dense Preview tables; six-stage stepper secondary text. Shared `ImportBusinessFacts` rendering is preserved; its scoped label/value typography is normalized through its existing classes.

## G. Remaining 8/9/10px census

[Remaining declarations](import-typography-20261017/REMAINING_TYPE.json): **APPROVED_MICRO 5; PROTOTYPE_ONLY 0; UNRESOLVED 0**. Counts include token definitions/references, not visible text occurrences.

| File / selector | Value | Classification and reason |
|---|---|---|
| ImportTypography.css / micro token | 10px | APPROVED_MICRO; scoped definition for the three roles below |
| ImportPage.css / `.input-steps li > span` | micro token | APPROVED_MICRO; redundant numeral/check alongside the stage title |
| ImportPage.css / `.input-steps small` | micro token | APPROVED_MICRO; approved secondary orientation exception |
| ImportPage.css / upload file size | micro token | APPROVED_MICRO; secondary noninteractive bytes, separate from filename/quota |
| ImportHistoryPage.css / calendar count child span | 8px, unchanged | APPROVED_MICRO; `aria-hidden` decorative dot, adjacent count remains 11px |

No meaningful production 8px/9px remains in the audited Import families. No inline `fontSize` or typography utility-size declaration existed in the scoped production TSX scan. Planning Assistant's separate canonical microtype is outside this census.

## H–J. OWNER/STAFF, layout and screenshots

The [final hydrated capture](import-typography-20261017/accepted-stepper/capture.json) measures **88** production component cases at **1440px and 390px**, with **22** actual drawer/evidence interactions and four additional identity-search screenshots. A [separate intercepted-API capture](import-typography-20261017/submission-accepted/capture.json) checks **4** Owner-review cases: actual Staff-origin proposal and Owner self-proposal at both widths. Request Changes is present/enabled only for the valid Staff context; no decision was submitted.

All final guards pass: **0** text below 10px, **0** controls below 12px, **0** mapped semantic-floor violations, **0** clipped text (including overflow inside step chevrons), **0** document overflow, **0** page errors and **0** unhandled network attempts. Twenty-two dialog checks confirm content can be scrolled above footer actions. A sticky footer overlapping the initial long body's bounding rectangle was corrected as a measurement error: verification measures reachability at scroll end, with no production layout workaround.

Equivalent OWNER/STAFF states use the same selectors and variables. Resolver geometry stays 500px on desktop and the existing viewport calculation on narrow screens. Step segments remain 54px high and the overall stepper box remains 88px including padding; horizontal step scrolling remains local. The narrow step basis increases **155 → 168px** for both roles: the 10px “Preview & commit” line measures 81px, exceeding the old 70px content region; the new region is 83px. The dedicated inner-text guard [caught the regression](import-typography-20261017/stepper-check/capture.json) and the final capture verifies zero remaining cases. Tables retain existing local scrolling and natural row wrapping. Larger labels/values produce natural wrapping/height growth; no material drawer/card widening or role-specific typography patch.

CSS cascade defects found and fixed: generic `font: inherit` caused resolver/source controls to inherit 11px labels; Source Context acknowledgment also inherited its label size. Explicit semantic control/ack rules now win those cascades. Evidence drawer title is restored to 20px. The single narrow stepper text-width regression is fixed by the bounded basis adjustment above; no layout redesign.

Representative images:

- [Before resolver desktop](import-typography-20261017/before-final/owner-resolve-manual-1440.png) → [after](import-typography-20261017/accepted-stepper/owner-resolve-manual-1440.png).
- [Before reusable comparison narrow](import-typography-20261017/before-final/owner-profile-reusable-390.png) → [after](import-typography-20261017/accepted-stepper/owner-profile-reusable-390.png).
- [Source evidence, narrow](import-typography-20261017/accepted-stepper/owner-source-evidence-390.png): labels/values/instructions and acknowledgment.
- [Preview table, desktop](import-typography-20261017/accepted-stepper/owner-preview-warnings-1440.png): values/actions, local table scroll.
- [History Correction](import-typography-20261017/accepted-stepper/owner-history-correction-390.png), [Sales comparison](import-typography-20261017/accepted-stepper/owner-sales-before-after-390.png), [Supplier comparison](import-typography-20261017/accepted-stepper/staff-supplier-before-after-1440.png).
- [Review awaiting confirmation](import-typography-20261017/accepted-stepper/owner-review-awaiting-390.png), [optional Commit reason](import-typography-20261017/accepted-stepper/staff-commit-optional-1440.png), [unknown Commit](import-typography-20261017/accepted-stepper/owner-commit-uncertain-390.png).
- [Valid Staff Request Changes](import-typography-20261017/submission-accepted/owner-submission-staff-390.png).

The browser uses installed Playwright 1.64.0 with the pre-existing Chromium headless binary, selected explicitly because its default expected binary was absent; exact browser version is recorded in capture JSON. Font uses locally available Inter/system fallback, with no remote font fetch. Captures are hydrated component/fixture checks with the production CSS and a blank 240px desktop shell inset, not full signed-in app acceptance. Before captures use the original clean CSS baseline; new fixtures come from existing playground and controlled test shapes, not new production states. No historical evidence was overwritten.

## K–M. Regression and gates

[Final results and command logs](import-typography-20261017/regression/results.json): Planning **178**, Capabilities **83**, Operations **30**, Import **143**, Store **118**, Auth **26** — **578/578 PASS**, no removed tests. Build and lint pass. Import, Planning and Store wire gates pass. Existing bundle-size and two unrelated React effect lint warnings remain outside scope.

Ordinary **check:contracts**, **check:capabilities-wire**, **check:recovery-policy** and **check:operations-wire** fail. Their inputs/generators were already clean at orientation and remain unchanged. Windows checkout has LF→CRLF conversion (`git ls-files --eol` confirms index LF / worktree CRLF for recovery policy and generated capability wire). Read-only diagnostics against exact Git baseline data make capability, recovery and operations projection checks pass; these diagnostics are **not** substituted for ordinary gate results. Contract historical snapshot/pin failures still require a separate checkout/provenance investigation. No regeneration, repinning or contract edit was made.

PL-01: production Planning/PDF/export files, global styles and shared FlowDialog were untouched. The new variables and all changed selectors belong to Import; searching Planning and its page sources finds no matching Import classes. Planning's **178** controlled tests pass. The separate **62** Assistant and **12** PDF/export browser suites were **not rerun**, based on that dependency isolation; no fresh claim is made for those historical counts.

Regression guards: `scripts/audit-import-typography.mjs` checks scoped source declarations with explicit micro exceptions; `scripts/capture-import-typography.mjs` checks actual computed semantic floors, controls, clipping and overflow, and exits nonzero for failures outside baseline mode. It extends the existing Vite/Playwright isolated rendering approach without a new framework/server.

## N. Live backend

**NOT RUN**. Provider calls, real accounts and real business mutations: **0**. Main fixtures block all external requests; the four submission cases fulfill only allowlisted synthetic GET responses and block everything else. No live E2E claim. No commit/push.

## O. Follow-up

- **Typography defect:** none unresolved in the bounded controlled Import coverage.
- **Geometry defect:** none newly identified in the verified cases; full-product/all-state/a11y coverage retains its independent status.
- **Non-Import typography:** untouched, including sealed Planning Assistant microtype.
- **Repository gates:** resolve the four pre-existing checkout/provenance failures separately before calling the complete repository gate set green.
- **Future live acceptance:** NOT RUN; remains separate from these controlled checks.
- **Charts:** current MagicPath design additions remain outside FE implementation scope; a separate feature instruction is required.
