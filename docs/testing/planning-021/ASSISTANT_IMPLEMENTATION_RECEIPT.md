# PL-01 production implementation receipt

Verdict: **PL-01 FRONTEND IMPLEMENTED — CONTROLLED VERIFIED**.

This is DESIGN → APPLICATION binding for the retained Planning Run only. No global assistant, operational commands, What-if, Draft PO, provider controls, routes or backend contracts were added. No commit/push was performed.

## A. Canonical MagicPath binding

- Project: `458079658328604672`.
- Component: `458423352311304192` — ShelfCash · Kế hoạch nhập · Kết quả.
- Exact revision: `461952561365278720`.
- Read-only exact editable source and stored preview inspected. The stored preview shows the closed drawer; open-state authority comes from this revision's exact TSX/CSS. No remote design writes/builds.
- [Source hashes](assistant-implementation/CANONICAL_BINDING.json); [32 state/function anchors](assistant-implementation/CANONICAL_STATE_MAPPING.json). Stable per-state element IDs were not supplied; source function/selector anchors are recorded instead of inventing IDs.

## B. Production UI files changed

- `src/features/decision-planning/components/PlanningAssistantDrawer.tsx`: actual canonical render, clarification, Summary, permission/recovery, keyboard semantics.
- `PlanningAssistant.css` in the same directory: 460px right drawer, approved geometry/hierarchy/green; narrow 390px full-width layout; no prototype selector styling.
- `PlanningAssistantWorkspace.tsx`: scoped Auth/Store/grants/Run/version/option owner, native journal, typed API actions and React entry composition.
- `PlanningResults.tsx`: header entry before PDF/export, contextual “Vì sao?” composition, accurate retained availability copy. Existing tabs/results/export remain intact.
- `PlanningEvidence.tsx`: optional contextual action in the existing notification surface.
- `src/pages/forecast/PlanningPage.tsx`: mounts one workspace for the supported retained scope, delegates fresh C03 to the existing workflow, propagates fresh denial to the existing protected-page guard. The Planning facts are removed while the already-open safe permission/unknown drawer remains mounted; denial does not erase the unresolved status.
- `planning.assistant.ts`: B01/B02, actual pending-request signal and abort/late-response fencing.
- `planning.intent.ts`: restores retained CAS identity for original-generation reads and recognizes an actually rejected terminal record; no recovery-policy expansion.
- `planning.workflow.ts`: fresh C03 401/403/404 removes retained protected facts/inspector pages. Transient read errors retain the existing behavior. The callback refuses to treat an already busy/no-op refresh as a verified fresh read.

Paths above are under `src/features/decision-planning/` unless fully specified. Existing foundations, centralized cookie/CSRF HTTP and contracts are reused; no second browser/mocking architecture or package dependency.

## C. State mappings completed

All P01–P32 mappings pass rendered production-component checks. Normal/answer/loading/prior answer, permission/unavailable, ingredient/similar/option/Product/unsupported clarification, stale/refreshing/restored/restored+unresolved, unknown/blocked/known-terminal new question, permission+unknown and Summary initial/presentation/request-pending/running/completed/failed/original recovery/previous context/new generation are bound.

The renderer combines application state, both intent controllers, current grants and verified caller context. It never infers access from phase alone. P01–P32 are fixture-bound **render/interaction** cases, not claims that every fixture was created by a live operation. R cases separately exercise actual production Workspace, typed API, intercepted HTTP and native IndexedDB.

## D. B01 fix

`setPresentation` configures next work while retaining the previous terminal Summary. A deliberate generate action uses a new key and selected locale/detail; original generation identity/receipt remains durable.

Eight Node regressions cover completed **and failed** → vi/en × simple/technical; four browser R05 variants exercise terminal → explicit configuration → new-key AS01. All PASS. No journal clearing is used to unlock product work.

## E. B02 current-versus-retained gate

Summary acceptance compares returned identity with verified C03. Old immutable output is preserved as `summaryContext=previous`; the render boundary also fences explicit option mismatch. Original AS01 recovery keeps original key/body/version. AS02 reads keep the original retained CAS version, followed by the current-versus-retained presentation gate.

Node B02 regression PASS. Native browser R07 exact old-body replay under a fresh context, R08 acknowledged locator restoration/AS02 and R09 deliberate current-context generation PASS. A valid old result is neither discarded nor presented as current Planning truth.

## F. Clarification behavior

Returned original question, candidates, names/IDs and option source_strategies are used. No first candidate or fuzzy dispatch. Radio choice is explicit and separate from continuation; a new response does not inherit an old selection. Product selection goes in context.product_id. Option candidates have no invented friendly name/winner/rank. Unsupported responses expose a deliberate new-question composer only after a known response. P06–P10 and actual AS03 R02 variants PASS.

## G. Stale / unresolved behavior

Stale owners clear old facts/history and abort in-flight work. Only the existing Planning caller rereads C03; a fresh owner restores durable journals before enabling writes. R04 verifies stale → refreshing → fresh facts **plus still-unresolved Chat**. No C03 read resolves old AS03 delivery. Unit late-response and identity-change browser cases fence delayed facts.

## H. Unknown recovery behavior

Native metadata-only Chat survives reload and close with no original text/history reconstruction, replay, replacement, clear/TTL or new-question action. R03 PASS; P15–P17 are negative continuation/replacement cases. Closing is not resolution. Known GENERATION_FAILED is terminal and separately permits a deliberately different question/new key (R15). Permission denial never proves rollback.

Test-only synthetic IndexedDB reset is used only to start independent browser scenarios in a temporary isolated origin/profile. It is not shipped or used to claim an unknown operation resolved. No mutation lookup endpoint was invented.

## I. Summary lifecycle

Request pending and acknowledged retained-running are different render states. AS01 creates or exactly recovers; AS02 reads the original retained generation. No polling POST. Explicit bounded reader refresh is supported; no fake completion timer or provider replay loop.

Initial and terminal-to-new vi/en × simple/technical pass. Unknown Summary exposes only “Khôi phục lần tạo này”, selecting retained-ID AS02 or exact original AS01. Completed/fallback output keeps returned text/claims/references; terminal failed may configure genuinely new work. No FE recomputation/translation. P19–P28/P31/P32 and runtime R05–R09 PASS.

## J. Permission behavior

Current three grants, actor/session/Store/Run/version/option determine authority. R10 revokes each grant while a request is in flight; protected text/context is absent from the DOM and original uncertainty remains. R11 proves an authorized Staff uses the same surface. R13 actor/session/Store changes dispose the old owner. R16 fresh 401/403/404 overrides cached facts. Node C03-denial regressions also clear the existing Planning facts/inspector pages.

These are synthetic providers and controlled HTTP. They do not establish live account grants or serving BE behavior.

## K. Controlled browser matrix

[Machine-readable per-case receipt](assistant-implementation/BROWSER_VERIFICATION.json): **62/62 PASS**, 0 unexpected requests, 0 page errors. Actual production Drawer/Workspace, native isolated Chromium on darwin/arm64, owned temporary browser/profile, no app/BE server. Every HTTP request is explicitly fulfilled or denied; unexpected requests fail the run. No external fonts/services/provider network.

- **P01 PASS** — NORMAL_FIRST_OPEN.
- **P02 PASS** — NORMAL_ANSWER.
- **P03 PASS** — LOADING.
- **P04 PASS** — PERMISSION_DENIED.
- **P05 PASS** — UNAVAILABLE.
- **P06 PASS** — CLARIFICATION_INGREDIENT.
- **P07 PASS** — CLARIFICATION_SIMILAR_INGREDIENTS.
- **P08 PASS** — CLARIFICATION_OPTION.
- **P09 PASS** — CLARIFICATION_PRODUCT.
- **P10 PASS** — QUERY_UNSUPPORTED.
- **P11 PASS** — CONTEXT_STALE.
- **P12 PASS** — CONTEXT_REFRESHING.
- **P13 PASS** — CONTEXT_RESTORED.
- **P14 PASS** — CONTEXT_RESTORED_UNRESOLVED.
- **P15 PASS** — UNCERTAIN_AFTER_RELOAD.
- **P16 PASS** — UNCERTAIN_BLOCKED_CONTINUATION.
- **P17 PASS** — UNCERTAIN_NEW_QUESTION_BLOCKED.
- **P18 PASS** — NEW_QUESTION_AFTER_KNOWN_TERMINAL.
- **P19 PASS** — SUMMARY_INITIAL.
- **P20 PASS** — SUMMARY_RUNNING.
- **P21 PASS** — SUMMARY_COMPLETED.
- **P22 PASS** — SUMMARY_FAILED.
- **P23 PASS** — SUMMARY_SAFE_RECOVERY.
- **P24 PASS** — SUMMARY_NEW_GENERATION.
- **P25 PASS** — SUMMARY_VI_SIMPLE.
- **P26 PASS** — SUMMARY_VI_TECHNICAL.
- **P27 PASS** — SUMMARY_EN_SIMPLE.
- **P28 PASS** — SUMMARY_EN_TECHNICAL.
- **P29 PASS** — LOADING_RETAINED_ANSWER.
- **P30 PASS** — PERMISSION_DENIED_UNCERTAIN.
- **P31 PASS** — SUMMARY_REQUEST_PENDING.
- **P32 PASS** — SUMMARY_RECOVERED_PREVIOUS_CONTEXT.
- **R01 PASS** — real Chat first/next turn + retained answer + Escape/focus return.
- **R02-ingredient PASS** — real explicit candidate preserves question and matching identity.
- **R02-similar-ingredients PASS** — real explicit candidate preserves question and matching identity.
- **R02-option PASS** — real explicit candidate preserves question and matching identity.
- **R02-product PASS** — real explicit candidate preserves question and matching identity.
- **R02-unsupported PASS** — real unsupported response → explicit new-question composer.
- **R03 PASS** — native IndexedDB AS03 metadata-only reload/close remains blocked.
- **R04 PASS** — real stale→external context refresh→fresh facts + unresolved Chat blocked.
- **R05-vi-simple PASS** — B01 terminal→deliberate Summary new configuration/new key.
- **R05-vi-technical PASS** — B01 terminal→deliberate Summary new configuration/new key.
- **R05-en-simple PASS** — B01 terminal→deliberate Summary new configuration/new key.
- **R05-en-technical PASS** — B01 terminal→deliberate Summary new configuration/new key.
- **R06 PASS** — retained running→AS02 completed, zero polling POST.
- **R07 PASS** — B02 native reload exact old-key/body AS01 replay displays previous context.
- **R08 PASS** — restored retained locator→AS02 old evidence read, no POST and B02 preserved.
- **R09 PASS** — previous terminal Summary→deliberate current-context generation/new key.
- **R10-planning.result.read PASS** — revocation+pending/late response redacts protected DOM and retains uncertainty.
- **R10-budget.read PASS** — revocation+pending/late response redacts protected DOM and retains uncertainty.
- **R10-procurement.cost.read PASS** — revocation+pending/late response redacts protected DOM and retains uncertainty.
- **R11 PASS** — Staff with all actual grants can ask; role label is not authority.
- **R12 PASS** — contextual Vì sao opens same production drawer and sends scoped canonical question.
- **R13-qaActor PASS** — identity change disposes old owner and fences delayed answer.
- **R13-qaSession PASS** — identity change disposes old owner and fences delayed answer.
- **R13-qaStore PASS** — identity change disposes old owner and fences delayed answer.
- **R14 PASS** — keyboard close focus, tab arrows/selection, focus wrap, named input, disabled send.
- **R15 PASS** — known AS03 GENERATION_FAILED→explicit different question/new key.
- **R16-401 PASS** — fresh HTTP denial removes protected facts without rollback/new-intent assumption.
- **R16-403 PASS** — fresh HTTP denial removes protected facts without rollback/new-intent assumption.
- **R16-404 PASS** — fresh HTTP denial removes protected facts without rollback/new-intent assumption.
- **R17 PASS** — known unavailable/local failure returns to question surface without reclassifying unknown.

Fresh [PDF/export regression](assistant-implementation/export-regression/BROWSER_VERIFICATION.json): **12/12 PASS**. Original 021 captures/receipts are byte-identical; the existing runner accepts an optional output destination to avoid overwriting them.

## L. Screenshot evidence

**23 controlled Assistant screenshots** at 1440×1000/100% zoom and existing iPhone 13 narrow 390×844. Drawer outer width/right-edge and no horizontal document overflow are asserted. Runtime capture includes actual AS03 answer and native recovered previous-context Summary; fixture captures cover clarification/stale/unknown/permission/Summary lifecycle/recovery. Four fresh export regression screenshots live in the sibling export-regression folder.

- [normal_answer-desktop.png](assistant-implementation/normal_answer-desktop.png)
- [normal_answer-narrow.png](assistant-implementation/normal_answer-narrow.png)
- [clarification_similar_ingredients-desktop.png](assistant-implementation/clarification_similar_ingredients-desktop.png)
- [clarification_similar_ingredients-narrow.png](assistant-implementation/clarification_similar_ingredients-narrow.png)
- [context_stale-desktop.png](assistant-implementation/context_stale-desktop.png)
- [context_stale-narrow.png](assistant-implementation/context_stale-narrow.png)
- [uncertain_after_reload-desktop.png](assistant-implementation/uncertain_after_reload-desktop.png)
- [uncertain_after_reload-narrow.png](assistant-implementation/uncertain_after_reload-narrow.png)
- [summary_running-desktop.png](assistant-implementation/summary_running-desktop.png)
- [summary_running-narrow.png](assistant-implementation/summary_running-narrow.png)
- [summary_completed-desktop.png](assistant-implementation/summary_completed-desktop.png)
- [summary_completed-narrow.png](assistant-implementation/summary_completed-narrow.png)
- [summary_failed-desktop.png](assistant-implementation/summary_failed-desktop.png)
- [summary_failed-narrow.png](assistant-implementation/summary_failed-narrow.png)
- [summary_safe_recovery-desktop.png](assistant-implementation/summary_safe_recovery-desktop.png)
- [summary_safe_recovery-narrow.png](assistant-implementation/summary_safe_recovery-narrow.png)
- [permission_denied_uncertain-desktop.png](assistant-implementation/permission_denied_uncertain-desktop.png)
- [permission_denied_uncertain-narrow.png](assistant-implementation/permission_denied_uncertain-narrow.png)
- [summary_recovered_previous_context-desktop.png](assistant-implementation/summary_recovered_previous_context-desktop.png)
- [summary_recovered_previous_context-narrow.png](assistant-implementation/summary_recovered_previous_context-narrow.png)
- [runtime-answer-desktop.png](assistant-implementation/runtime-answer-desktop.png)
- [runtime-previous-context-desktop.png](assistant-implementation/runtime-previous-context-desktop.png)
- [runtime-previous-context-narrow.png](assistant-implementation/runtime-previous-context-narrow.png)

## M. Accessibility findings

PASS: dialog accessible name, named input/selects, Ask/Summary tab roles/selection/arrows, candidate radiogroup/checked state/arrow navigation, disabled actions, initial close focus, focus wrap, Escape and focus return. Permission-forbidden facts are removed from DOM. Pending requests use status/aria-busy and state region aria-live. Long transcript/evidence scrolls inside the drawer. Manual source/render review is not a full assistive-technology certification.

## N. Tests

- Planning/application/prepared Assistant/Summary: **178 PASS**.
- Capabilities: **83 PASS**; Operations/export: **30 PASS**. Total **291 Node tests**.
- Controlled Assistant browser: **62 PASS**; existing controlled PDF/export browser: **12 PASS**.
- Build PASS; existing large-chunk warning retained.
- Lint PASS; only the two existing effect warnings in OnboardingPages/RecipeSchedulePage retained; no new warning.
- Contracts, capabilities wire, recovery policy and Planning wire gates PASS.
- [Verification and immutable evidence hashes](assistant-implementation/VERIFICATION.json). package.json/lockfile/contracts/BE handoff/persistent rules unchanged. No live fixtures or credentials used.

## O. Live backend status

**NOT RUN**. Live BE calls=0; provider calls=0; real account/business mutations=0. Serving deployment, full-app live E2E and provider/language-quality acceptance are not certified.

## P. Remaining gaps and visual review

- **Actual implementation defect:** none outstanding in the requested controlled matrix. This is bounded evidence, not a claim of exhaustive behavior against live systems.
- **Visual fidelity follow-up:** no blocking PL-01 geometry/hierarchy defect found in reviewed controlled renders. Canonical source geometry/borders/density/green are reused. RUNTIME_REQUIRED differences: evidence displays returned source/pointer/identity instead of prototype business values; date/Run/candidate counts/content naturally vary. Contextual “Vì sao?” uses the canonical generic evidence question with actual Run/explicit option, avoiding an invented early-order cause. Full-shell spacing outside PL-01 was not refactored. No pixel-identity claim.
- **Typography follow-up:** canonical 8–10px scale intentionally preserved under this task's explicit exception. It is not a completed global typography normalization or accessibility readability certification.
- **Future live acceptance:** verified serving schema/source, approved Owner/Staff account grants, real C03/AS01/AS02/AS03 behavior and provider answer quality require a separately authorized live run.

Copy provenance: canonical static copy is MAGICPATH_COPY; returned text/claims/references/IDs/dates are DATA; existing “Hỏi AI và kịch bản giả định chưa khả dụng.” was an obsolete CONTRACT_REQUIRED availability claim, reduced to the still-correct parked What-if portion when Assistant is present. No generic subtitle deletion or approved copy rewrite. No prototype QA selectors, fake facts, timers or operational controls were ported.

## Full regression closure — follow-up

**PL-01 CLOSED — CONTROLLED REGRESSION SEALED**. Full six-suite baseline **578 PASS**, all seven gates/build/lint PASS, PL-01 **62 PASS**, PDF/export **12 PASS**. No product-code change was required. [Seal receipt and fresh evidence](regression-seal/README.md). P17 is now `UNCERTAIN_NEW_QUESTION_BLOCKED`; historical `NEW_QUESTION_AFTER_UNCERTAIN` was always a negative test, with unchanged behavior. Live BE remains **NOT RUN**.
