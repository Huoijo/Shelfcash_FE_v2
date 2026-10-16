# 015 — Canonical ShelfCash Input Flow / frozen Design Contract v1

14/10/2026. **Implementation status: PARTIAL.** Supported frontend flow is implemented and verified locally; backend capability gaps prevent full frozen-contract runtime parity. No commit/push. Ongoing uncommitted 015 changes were preserved and extended, not reset.

## A. Authority and scope

- User request attachment `f158861c-31ed-4293-96e3-4d6aa42f83a1/Pasted text.txt`: canonical OWNER/STAFF, frozen v1, production architecture, all 12 FM reconciliation and truthful verification.
- MagicPath project `458079658328604672`: OWNER `460747146686242816` / revision `461110616439017472`; STAFF `460747115572916224` / revision `461109945690124288`. Read exact revision code contexts and stored previews. Legacy `ShelfCash · Input flow` component excluded as an authority.
- Business: `docs/references/SHELFCASH_IMPORT_NAM_NGUYEN.docx`, unchanged per user confirmation; SHA256 `492f5834625c1d3103eca97ea7c76927cd1511a7c2dfc04ee49cbff1339bd29d`. `(1).docx` was not read or substituted silently.
- Repository: AGENTS.md, scoped Import rule, architecture docs, previous 012–014 receipts/debts, FOUND_MISSING_UI, current Import types/validators/workflows/clients, AuthGuard/Store permissions, routing/AppShell, native FlowDialog, DEV isolation and existing tests.
- Runtime: `contracts/011/openapi.main.json`, generated wire and existing clients. No new backend endpoint, package or parallel application shell.

Full design inventory: [015 audit](015_Import_State_Audit.md), 160 OWNER +149 STAFF catalog entries including secondary surfaces/aliases, plus 13 scope conditions. Inventory is not an assertion that all 309 scenarios were tested or match pixel-for-pixel.

## B. Changes and behavior

- One shared operational layout and six-step projection. Shared Step 3 overview → focused 500px resolver → save → overview; role changes permission/action/transition rather than geometry.
- File/Sheet selection, local loaded-scope vs authoritative import-wide unresolved counts, unresolved/all filter, previous/next, one canonical counter, paging/loading/error/empty/retry. Unloaded/partial evidence never implies global completion. Sheet descriptors are available to classification/declaration editors, not only column rows.
- Product/Ingredient search reuses existing scoped Menu/Inventory readers, aborts stale queries and requires explicit selection. No auto-bind by name or inference of entity kind from ambiguous domain. Supplier collection remains unsupported. New metadata supports current M04 proposal semantics for Product/Ingredient/Supplier; no immediate-created success claim.
- Full-page Analyze source evidence/confirmation reuses the typed SourceContext editor. Custom namespace stays explicit; no filename proof or speculative source catalogue/period payload.
- Exact units are explicitly declared, with exact ratio strings and evidence. Target units are not inferred from samples. Declarations preserve false/zero/null and explicit IMPORT_VALUE/PROFILE_CONSTANT; replacement requires loaded evidence for the exact source column and explicit reason/ack.
- Profile first/active-baseline comparison, changed/full grouped view, evidence, full-spec approval, independent reject reason/ack and explicit retire confirmation. Current M01 no-proposal/can_preview route continues without creating a meaningless version. Staff cannot navigate to Owner decisions. Comparison survives error/permission states.
- Domain drawers stage exact Sales/Supplier confirmations in Preview. Review entry, Review controls/mutation and Commit all guard the same required decision set. Wrong/duplicate/extraneous IDs or disjoint assertions remain blocked. No persisted domain-save success is fabricated.
- Review and Commit are separate phases. Confirmation must persist for current pins before Commit controls unlock. Reasons/acks stay independent; persisted Review reason/time remains inspectable. Permission/stale/profile/commit failure retain context.
- Uncertain resolver/Profile/Review recovery reads server state without replay. Readback can search outside a filtered/paged queue without changing the user's filter. Positive proof unlocks; unknown stays locked. Commit uncertainty reads I04/J01/I06 without sending a second commit. Entered request intent remains retained.
- Partial upload keeps accepted receipts, exposes individual rejected retry/replacement/removal and explicit accepted-set confirmation. Removing a rejected operational row never deletes accepted sources or required I03 rejected acknowledgments. Lost upload ACK checks existing client receipts before any upload replay.
- Completion is distinct from Readiness. Readiness has unassessed/date selection/loading/ready/blocked/unknown/unavailable/permission states and cancels stale scope reads.
- Existing DEV controller remains isolated and production-excluded. Updated controller action boundary for real visible product actions; no MagicPath prototype storage, DOM-driven business state, hidden click bridges, MutationObserver or fake server timers were ported.

## C. Verification

Final validation:

- **374 unit/boundary/SSR tests pass:** Import 123 + Auth 26 + Store 118 + Planning 77 + Operations 30. The last Import run is123/123 after final code changes.
- **50/50 full browser regression pass**, followed by focused6/6 (including two newly added cases), visual4/4 and copy/complete Owner path1/1. **52 distinct browser cases verified across those runs**, not a claim that the final52-test suite was rerun together after every final adjustment.
- Browser controls use actual React screens: Owner first-profile approve/reject, Staff reuse/proposal/external handoff, source-context namespace validation, explicit identity selection, shared500px resolver, single navigation counter, Sales/Supplier global guard, persisted Review phase lock, commit permission/stale/blocked/uncertain, Readiness, mobile and production Debug exclusion.
- Final production build/typecheck PASS (main bundle~1,063 kB; existing size warning). Lint has no errors/new warnings; two baseline warnings remain in OnboardingPages/RecipeSchedulePage. Import wire gate PASS (127 schemas/types; current snapshot unchanged), `git diff --check` PASS.
- Visual inspection: stored canonical OWNER/STAFF previews and source/layout rules; actual FE Source Context, Owner Profile comparison and Owner resolver screenshots. Browser asserts both role widths and parity. Temporary Playwright screenshots are replaced by subsequent runs; no blanket pixel-parity claim.

 Browser cases use the local frontend with DEV adapters or intercepted/controlled HTTP responses. They are **not live backend E2E**.

Verified representative coverage includes Owner first-profile approval; Staff approved-profile reuse and external Owner handoff; Staff reusable proposal waiting/approved/rejected, retained Resolve and rejection of unchanged resubmission; complete Preview pagination; two-phase Review/Commit; permission revocation; stale/blocked Preview; lost Commit acknowledgment; independent Readiness; native drawer/focus; shared Owner/Staff resolver geometry and single counter; explicit identity selection/no HTTP in DEV; Sales/Supplier global gate; production Debug exclusion and responsive layout. Owner rejection and source form validations receive focused browser checks. Unit/boundary tests additionally cover typed request pins/CAS/full-spec guards, unknown/successful filtered readback, accepted-set acknowledgment and rejected retry/replacement/removal bookkeeping.

Not verified: live cookie/CSRF/server enforcement, actual workbook parsing/domain writers/rollback, all frozen catalog scenarios, exact visual parity for every surface, negative intent outcomes absent from the current API, or runtime Staff queue/notifications.

## D. Backend boundaries and design contradictions

- Immediate create+bind/import-only reuse choice in design is not the current new_entity_proposal reservation API. Safe implementation preserves proposal → Owner → atomic commit; Product/BE must clarify the boundary. No immediate create success is fabricated.
- Design's separate Sales/Supplier decision persistence/effectivity editor is not represented by current I05 commit-only confirmation DTOs. UI stages exact supported intents and gates Review; ambiguous relationship/effectivity mutation cases remain blocked.
- Readback cannot establish terminal not-saved for every intent, nor authoritative N5 rejection/retirement outcome. Unknown remains locked.
- General source period/context and friendly immutable displays/catalogues remain incomplete. API clients do not invent fields/endpoints.
- Staff queue/outcome/notification remains the existing dependency. Parked secondary features retain construction notices; underconstruction is not implemented or included in new capability requests.

Requests ready for BE review: [FE_ask/015](../../../FE_ask/015_Frozen_Input_Flow_Capability_Requests.md), all labeled **FE PROPOSAL TO BE, not runtime**. No DESIGN_READY endpoint was wired.

## E. FOUND_MISSING_UI reconciliation

All twelve original entries now have frozen design evidence, while historical findings remain preserved. Current implementation status: **4 IMPLEMENTED** (003/006/008/012), **8 PARTIAL** (001/002/004/005/007/009/010/011). Each includes component/route, role applicability and remaining runtime limit. No new FM IDs and no mass-completion claim.

See [FOUND_MISSING_UI](../../FOUND_MISSING_UI.md). Generic typed source/declaration/amendment controls and unavailable display projections remain bounded production adaptations, not a claim of exact design closure. See [TechDebt015](015_Import_TechDebt.md) for remaining FE/capability work.

## Known remaining frontend limits

Profile comparison is compact and evidence/full spec remain inspectable; grouping and array-index diffing are conservative adaptations. Generic descriptor source/declaration/amendment controls remain bounded, not fully customized to every frozen example. DEV fixtures cover81 representative scenarios rather than all 309 frozen entries. Browser coverage does not establish every multiple-file/sheet scope/error permutation.

A sealed failed Analyze batch offers authorized state readback; it does not invoke the guarded upload/analyze convenience method as a no-op or silently unseal/retry a worker. Initiating an explicit worker retry still requires a supported server capability.

## F. Exact cumulative 015 changed paths

Includes the ongoing pre-frozen 015 edits already present in the shared workspace, as well as this pass.

- `.cursor/rules/import-ui-design-contract.mdc`
- `AGENTS.md`
- `FE_ask/015_Frozen_Input_Flow_Capability_Requests.md`
- `docs/sprints/015/015_Implementation_Receipt.md`
- `docs/sprints/015/015_Import_State_Audit.md`
- `docs/sprints/015/015_Import_TechDebt.md`
- `docs/FOUND_MISSING_UI.md`
- `docs/README.md`
- `src/features/import-data/components/ImportActionBar.tsx`
- `src/features/import-data/components/ImportBusinessFacts.tsx`
- `src/features/import-data/components/ImportDomainReview.tsx`
- `src/features/import-data/components/ImportExperience.tsx`
- `src/features/import-data/components/ImportFlow.tsx`
- `src/features/import-data/components/ImportHelp.tsx`
- `src/features/import-data/components/ImportIdentityResolver.tsx`
- `src/features/import-data/components/ImportMapping.tsx`
- `src/features/import-data/components/ImportMutationStatus.tsx`
- `src/features/import-data/components/ImportPreview.tsx`
- `src/features/import-data/components/ImportPreviewExplorer.tsx`
- `src/features/import-data/components/ImportProcessing.tsx`
- `src/features/import-data/components/ImportProfileSpecification.tsx`
- `src/features/import-data/components/ImportReadiness.tsx`
- `src/features/import-data/components/ImportResolutionEditor.tsx`
- `src/features/import-data/components/ImportResolve.css`
- `src/features/import-data/components/ImportResolveDrawers.tsx`
- `src/features/import-data/components/ImportResolveOverview.tsx`
- `src/features/import-data/components/ImportResolverForm.tsx`
- `src/features/import-data/components/ImportResult.tsx`
- `src/features/import-data/components/ImportSourceContext.tsx`
- `src/features/import-data/components/ImportStatus.tsx`
- `src/features/import-data/components/ImportUpload.tsx`
- `src/features/import-data/components/ImportUploadAdmission.tsx`
- `src/features/import-data/importData.workflow.ts`
- `src/features/import-data/importDomainReview.ts`
- `src/features/import-data/importEntitySearch.context.ts`
- `src/features/import-data/importEntitySearch.data.ts`
- `src/features/import-data/importExperience.ts`
- `src/features/import-data/importFlow.workflow.ts`
- `src/features/import-data/importResolve.presentation.ts`
- `src/features/import-data/importResolverForm.context.ts`
- `src/pages/imports/ImportPage.css`
- `src/pages/imports/ImportPage.tsx`
- `src/shared/debug/ImportPlaygroundBoundary.tsx`
- `src/shared/debug/importPlayground.session.ts`
- `src/shared/flow/FlowDialog.tsx`
- `tests/e2e/content-parity.mock.spec.ts`
- `tests/e2e/import-experience.api.spec.ts`
- `tests/e2e/import-experience.mock.spec.ts`
- `tests/e2e/import-playground.api.spec.ts`
- `tests/e2e/import-playground.mock.spec.ts`
- `tests/e2e/operations.mock.spec.ts`
- `tests/e2e/responsive.spec.ts`
- `tests/import-batch.test.mjs`
- `tests/import-flow-workflow.test.mjs`
- `tests/import-mapping-ui.test.mjs`
