# MagicPath → FE visual convergence

Date: 2026-10-17. Baseline: `d0de974` (`Update: Colour update`). Verdict: **PARTIAL VISUAL CONVERGENCE — FOLLOW-UP REQUIRED**.

Current follow-up: copy provenance is **COPY PROVENANCE CLOSED — REVIEW ITEMS REMAIN** at baseline `623574d`; see [adjudication closure](#copy-provenance-adjudication-closure). This does not close the separate whole-product visual/geometry/accessibility work. The initial screening and earlier verification below remain historical evidence.

## Constraint and scope

Read and applied [.agents/rules/SHELFCASH_VISUAL_FIDELITY.md](../../../.agents/rules/SHELFCASH_VISUAL_FIDELITY.md). The requested `.agents/SHELFCASH_VISUAL_FIDELITY.md` path does not exist; the supplied rule exists in `rules/` and was left untouched. The user's provenance safeguards override the attachment's broader permission to shorten/rewrite copy or edit MagicPath. This is a frontend convergence pass. No MagicPath edits, new revisions, API/contract changes, live BE access, credentials, uploads or business mutations.

**MODERATE** secondary-copy layering is visible, particularly in Planning's requirements section. This is a qualitative assessment, not a claim that all helper text is redundant. The [copy inventory](COPY_PROVENANCE_AUDIT.json) screens 315 literal JSX `p`/`small` occurrences across `src`, including DEV and secondary surfaces. Forty-nine have exact source matches somewhere in the inspected design packages; 266 do not. Neither count is a final provenance classification. Semantic equivalents remain valid, and bundled legacy/prototype files alone do not authorize production copy. Dynamic expressions, component props, strings in presentation dictionaries, labels and full runtime reachability require separate review. This inventory is not an exhaustive runtime-copy census.

## Canonical components audited

Read the current complete source context of all 13 canonical components; [exact IDs, revisions and source-file inventory](CANONICAL_DESIGN_AUDIT.json). Excluded the legacy standalone Input `458395069779681280`.

- Marketing Homepage: `461893687010529280`.
- Auth: `461891988820754432`.
- Today: `461892308242173952`.
- Import History: `461892415150780416`.
- Planning Setup / History: **`461898344663502848`**, newer than the green-pass pin.
- Planning Results / Exports: **`461899945612550144`**, newer than the green-pass pin.
- Inventory / Receive Goods: `461892685356224512`.
- Menu / Recipe lifecycle: `461892711532871680`.
- Store / bootstrap / permissions: `461892732009484288`.
- Input STAFF: `461895532667871232`.
- Input OWNER: `461895559079428096`.
- Notifications: `461893380679548928`.
- Invitation Acceptance: `461893402536087552`.

This is a source-level audit of these families, not rendered acceptance of every state. Most families were intentionally left unchanged: no absence-of-exact-string rule, speculative hierarchy changes or prototype behaviors were ported.

## Systematic drift and changes applied

**GEOMETRY_DRIFT / SPACING_DRIFT / TYPOGRAPHY_DRIFT / DENSITY_DRIFT:** Planning Setup retained older 28px outer card padding plus 28px gaps and bottom-only section padding. Current canonical `ShelfCashPlanningScreen.css` uses contiguous, divided sections with `22px 24px` section padding and no outer card gap. Corrected the existing `.sc-planning-setup-card` and `.sc-planning-numbered` rules in [Planning.css](../../../src/features/decision-planning/components/Planning.css), without moving any fields or actions.

- Section header bottom margin: 24px → canonical 16px; numbered indicator: 28px → 24px; section heading: 18px → 15px / 22px; subtitle: 13px → 12px / 19px.
- Page heading: existing 28px / 36px retained; canonical 18px header bottom margin and 4px subtitle top margin.
- Field gap: 24px → 18px; date/select and currency controls: 44px → 42px. Labels remain visible; disabled, validation, described-by and focus behavior remain intact.
- Footer uses the canonical grid, neutral background, `18px 24px` padding and 190px / 44px CTA. Ready status fits its content, avoiding a stretched green strip. Existing green CTA and neutral blocked states remain.
- Existing requirements section receives canonical border/header/tab hierarchy; its header uses 14px, helper 11px, tabs 34px height and values 12px. Kept all actual requirement data, mode controls and mutation dialogs.
- Advanced controls use canonical 40px priority controls, 12px labels and a flat top-divider treatment. Retained unsupported-option explanations and disabled controls.
- Updated the old setup breakpoint rules toward the current 700px mobile layout. Controlled 390px and 1440px captures have no horizontal document overflow.
- Render inspection caught narrow nested RecordFacts values on mobile despite the lack of document overflow. Scoped mobile label/value rows now stack in one column, matching canonical's single-column requirement facts, without truncating or removing values.

No shared global primitive/token was modified. The systematic setup mismatch was corrected in the owning stylesheet; selectors affecting the reused RequirementsControls are scoped to `.sc-planning-content`, leaving other callers intact. Results CSS behavior and existing brand tokens were preserved. This does not certify that every other geometry difference has been resolved.

## Copy drift removed

Only two occurrences were removed. Both were assessed as `UNSUPPORTED_COPY` before deletion; [ledger with original locations and reasons](COPY_PROVENANCE_AUDIT.json). No approved MagicPath wording was rewritten.

1. **ImportFlow — Completion receipt retrieval, OWNER and STAFF**
   - Removed: `Đang tải kết quả của lô đã nhập.`
   - The retained heading `Đang đọc biên nhận hoàn tất` already identifies the receipt and retrieval state. The extra sentence supplies no distinct decision, scope, data, permission or recovery instruction. No equivalent extra sentence was found in the canonical Input packages.
   - Kept busy state, actual error copy and `Đọc lại biên nhận` action. No replacement copy.
2. **Planning History — loading**
   - Removed: `Đang đọc các lần chạy đã lưu.`
   - Canonical `ShelfCashPlanHistory.tsx` communicates loading with `Đang tải lịch sử kế hoạch…`, which remains the FE state title. The extra FE paragraph repeats that state.
   - Kept filters, Store timezone, request behavior, error recovery, pagination and the status region. No replacement copy.

Structural AST comparison confirms the two TSX files are identical to HEAD except these approved paragraph removals and the empty JSX child needed by FlowState's existing required-children signature. [Evidence](BEHAVIOR_PRESERVATION.json). No changes to event handlers, conditions, state, roles, routes or API payloads.

## Small text intentionally preserved

- `MAGICPATH_COPY`: Import overview `Xem tổng quan trước; chỉ mở resolver khi cần kiểm tra hoặc chỉnh một phần.`; OWNER profile `Owner đang phê duyệt phần interpretation có thể tái sử dụng, không phải import batch.`; Store `Ai đang có quyền truy cập cửa hàng này?`; Notifications `Những việc cần bạn chú ý và nơi cần đến để xử lý.`
- `MAGICPATH_COPY`, semantic counterparts: Planning's FE `Cấu hình một lần chạy cho cửa hàng hiện tại.` corresponds to current canonical `Cấu hình một Planning Run cho Store hiện tại.`; FE requirements/source and Store-ceiling/run-budget subtitles have canonical counterparts too. They were **not** classified as unsupported merely because wording differs. Existing wording was preserved.
- `CONTRACT_REQUIRED_COPY`: classification draft fields are not yet saved and classification must be persisted before column confirmation; source proof and reusable/batch scope; required reason/ack; staged corrections versus atomic commit; approval does not grant commit permission; unknown outcome retains the original intent; stale/version and current-right guards; unsupported advanced controls; missing budget is not zero. These are not decorative descriptions.
- `DATA`: filenames, sheets, sample values, before/after values, evidence, Store, dates/timezone, actor, IDs, counts, costs, statuses and retained run facts. None removed or compressed into invented values.
- Store pending invitation is not membership; notification read is not action completion; verified email is not invitation acceptance. These state differentiators remain visible.

## Import state-family review

Source anchors below are present in both current OWNER/STAFF packages unless role-specific. Corresponding FE implementation was checked for preserved distinctions; this is not a claim that every dynamic branch was visually exercised.

- File / Analyze: canonical main Input, AdvancedImportSurface and SourceContextSurface → ImportUploadAdmission, ImportBatchPanel, ImportSourceContext. Kept receipt/accepted-source-set and parse failure/unknown information.
- Source Context: SourceContextSurface / DeclarationContextEditor → ImportSourceContext and ImportResolutionEditor. Kept source evidence, report meaning and supported scope.
- Resolver overview / Mapping / Identity / Declarations / Units: main Input, ResolverScopeSurface / ResolverWave1 → ImportResolveOverview, ImportResolveDrawers, ImportIdentityResolver and ImportResolutionEditor. Kept mapping draft/persisted distinction, source values, entity scope, tri-state values and conversion semantics.
- Profile / Staff submission: Wave7ProfileDecision / ResolverMutationRecovery → ImportProfileSpecification, ImportProfileReview, ImportSubmissionLifecycle, MappingSubmissionsPage. Kept full-spec decision scope, approval/commit distinction, revision/permission/recovery states.
- Preview / Sales / Supplier / History Correction: DomainReviewSurface / HistoryCorrectionSurface → ImportPreviewExplorer, ImportDomainReview, ImportHistoryCorrections. Kept evidence, before/after, staged confirmations and per-row reasons. Existing SC020-02 persisted-vs-staged contract difference remains explicit.
- Review / Commit / Completion / Readiness: ReviewCommitSurface / MutationRecovery / main Input → ImportPreview, ImportProcessing, ImportMutationStatus, ImportResult and ImportReadiness. Kept Review/commit separation, atomicity, uncertain outcome, completed receipt and independent Readiness.
- Failure / permission / stale / uncertain: ResolverMutationRecovery, MutationRecovery and corresponding state-specific branches above. No blanket removal or generic replacement of recovery instructions.

## Review required and remaining differences

The following were left in place, with independent dispositions:

- **UNRESOLVED_VISUAL_DEFECT:** RequirementsControls still renders generic nested RecordFacts rather than the exact canonical compact value arrangement. All values were kept. The scoped typography/container fixes improve hierarchy, but the full nested default/custom/saved/management state set has not been reconciled. Do not call this widget visually converged or silently replace its input/data contract.
- **UNRESOLVED_VISUAL_DEFECT:** the existing early-return completion-receipt retrieval branch lacks the styled normal-flow wrapper. Its captured heading/action remain readable, but this sparse loading surface is not visually accepted against a dedicated canonical receipt-retrieval state. The two roles share the same branch. This pass removed only the redundant sentence; it did not invent a replacement loading workflow or claim this styling issue resolved.
- **Historical screening, superseded:** the 266 literal non-matches were screening candidates, not 266 unsupported strings. Their production occurrences now have final classifications in [COPY_PROVENANCE_FINAL.json](COPY_PROVENANCE_FINAL.json); DEV/dead declarations and prior removals have explicit dispositions. The old raw inventory remains evidence of the initial screen, not an open production backlog.
- **CONTRACT_REQUIRED:** pending/unknown replay, grants/revisions, reason/ack, staged correction confirmations, source proof, unsupported actions, budget precision and missing-vs-zero feedback differ from or supplement prototype copy to preserve actual published/runtime contracts.
- **RUNTIME_REQUIRED:** real Store/actor/date/amount/status values, paginated data and unavailable/partial sections replace prototype sample data. No mock result or implied success was shipped.
- **RENDERED_VERIFICATION_PENDING:** authenticated app-shell captures, hydrated interactions, every empty/loading/error/drawer/confirmation state and complete Owner/Staff role coverage across the other families. Component SSR captures do not close this work.
- **RENDERED_VERIFICATION_PENDING:** exact Inter font availability, full accessibility/focus review and approved engine-output/value arrangements. Local captures use the existing font stack without a remote font request.

Possible **future design-review items**, not edits made here: the OWNER profile sentence mixing `interpretation`/`import batch`; resolver English helper labels; repeated conceptual introductions in the Planning requirement subsection. Their canonical origin/meaning makes verbosity insufficient grounds for deletion in this pass.

## Typography normalization candidates

[Inventory](TYPOGRAPHY_CANDIDATES.json): 69 CSS declarations at 8–10px. These are source candidates, not verified production computed styles; DEV/prototype-only selectors are included and must be excluded through reachability review. No global enlargement or deletion was applied.

Representative preserved production candidates: Import resolver labels/samples/summary counts/footer help at 8–10px, Import History calendar count at 8px, Today weekday/demand labels at 10px and notification unread count at 10px. Current OWNER canonical source itself uses 9px metrics and 10px overview copy; normalization therefore needs design review, not a unilateral implementation change. New Planning field/heading typography uses values already present in its canonical stylesheet.

## Representative states and evidence

[Capture receipt](planning/capture.json) records **CONTROLLED_STATIC_COMPONENT_RENDER**, Chromium on macOS arm64, desktop 1440px / 100% zoom and one 390px mobile state. SSR markup comes from actual production components with synthetic fixture props. React effects, hydration and real mutations do not run. Network interception denies all requests; recorded attempts: **0**. No FE/BE server was started. No BE process/PID tracking or safety guard was bypassed.

[Canonical preview](planning/canonical-preview.png) was retrieved from the current MagicPath component listing and inspected alongside the current source. It is a cropped first viewport, not a full-state screenshot. [Verification receipt](VERIFICATION.json) records source/screenshot hashes and the preview asset URL.

- Planning: default before/after, blocked, busy, permission gate, missing budget, Readiness loading/error, expanded advanced controls and mobile.
- Import: actual completion-receipt loading branch in OWNER and STAFF.
- Planning History: actual page loading branch with a synthetic authorized Store provider.

The 240px blank inset represents the space occupied by the shell; it is not a screenshot of the full authenticated shell. Native date presentation and fixture values differ from MagicPath samples. Screenshots live under `planning/` and `import/`. Repeatable safe capture: `node scripts/capture-visual-convergence.mjs`; an optional output directory and previous Planning.css path produce before/after evidence. The current report's before image uses the original file saved before this pass, not a reconstructed design.

Reviewed actual captures for spacing/alignment, labels, state context, CTA visibility and preserved error/safety messages. No overflow was measured in captured states. Status and major actions remain in their existing sequence and position. This is bounded component evidence, not whole-product visual PASS or live E2E.

## Regression and completion status

- Planning: **79/79** existing controlled tests pass.
- Import: **143/143** existing controlled tests pass.
- Operations: **30/30** existing controlled tests pass.
- Total: **252/252**; build and lint pass. Two pre-existing effect warnings and the bundle-size warning remain.
- No new implementation-mirroring tests; the capture script is an evidence tool.
- No contracts, API/state/service files or workflow handlers changed. Historical `docs/FOUND_MISSING_UI.md` retains SHA256 `3017bfd528eccd22988ff7851793bfec5babd69eb1aeb6a942a529967828fa9e`.
- MagicPath modified components/new revisions: **none**.
- Live BE / live E2E: **NOT RUN**. Controlled screenshots are not live acceptance.

**PARTIAL VISUAL CONVERGENCE — FOLLOW-UP REQUIRED.** Source screening and the bounded changes above are complete; a complete production copy census, unresolved widget fidelity and hydrated all-family/state visual acceptance remain explicitly open in TD-01. No new product decision is required to retain the safe current behavior. No commit/push.

## Copy provenance adjudication closure

Date: 2026-10-17. Baseline: `623574d` (`Update: Clean up subtitle elements`). The paragraph immediately above describes the earlier pass; this section supersedes its copy-census limitation. Persistent constraints: [visual fidelity](../../../.agents/rules/SHELFCASH_VISUAL_FIDELITY.md) and [copy provenance](../../../.agents/rules/SHELFCASH_COPY_PROVENANCE.md).

### A. Adjudication summary

**COPY PROVENANCE CLOSED — REVIEW ITEMS REMAIN.** [Final ledger](COPY_PROVENANCE_FINAL.json) contains one terminal classification per in-scope candidate. No production candidate remains merely unmatched/unclassified. One explicit design-review case covers 16 strings in the marketing hero illustration.

Started from the previous evidence. Expanded from literal paragraphs to JSX text, helper/description/title props, labels, placeholders, dictionaries, state/validation/empty/help copy, table renderers, accessible names and rendered data branches. Reachability starts at `src/main.tsx`; DEV/debug/mock branches, unused declarations, structural attributes, comments/logs and non-rendered schema/type metadata are excluded. Static aliases/composition are accounted for at their producer rather than being legitimized as dynamic data. Conditional/coalescing value branches are separate from their static prefixes/fallbacks. The final JSON records source locations, state/role context, current MagicPath references or runtime evidence, exclusions and bindings.

All **315** original screened occurrences are reconciled: **275** map to adjudicated production copy, **38** are explicitly non-production, and **2** were already removed by the earlier pass. Identical text in the unused `UnderConstructionPage` is not conflated with the active `UnderConstructionButton` occurrence.

Important reachability finding: `ImportPage` initializes `helpOpen=false`; its sole HDSD opener is inside `DebugContent`. Therefore `ImportHelp` is not user-openable in production. Its temporary follow-up edits were reverted, its candidates excluded, and its final bytes match the follow-up baseline. Controlled opening of a closed dialog does not prove a production entry point. No Help UI was enabled. This also disproves the old marketing resource notice's production HDSD handoff.

### B. Final classification counts

**4,131 adjudicated producer/value occurrences**, including removed occurrences and two new minimal availability notices. This is not a count of subtitles or simultaneous DOM nodes. Counts cover the expanded scope; the old 49/266 screening counts are not the result.

- `MAGICPATH_EXACT`: **1,065** → KEEP.
- `MAGICPATH_SEMANTIC`: **15** → KEEP.
- `CONTRACT_REQUIRED`: **2,305** → KEEP_MINIMAL.
- `DYNAMIC_DATA`: **716** → KEEP.
- `UNSUPPORTED_COPY`: **14** → REMOVE; all applied.
- `REVIEW_REQUIRED`: **16** → REPORT / DO_NOT_AUTO_EDIT; one explicit case.

Source code, dictionaries and data bindings can produce multiple states; counts do not certify hydrated reachability or live integration. The production exclusions are part of the ledger, not unclassified items retained by default.

### C. Unsupported copy removed

Fourteen literal occurrences removed from **9 product files** (8 TSX plus one unused CSS rule). Every removal has an item ID and evidence in the ledger. Repeated conditional alternatives are counted separately, though they share a paragraph.

- Import History empty/filter state: removed the two additional instructions to choose another day/change filters. The canonical empty/no-match state titles and existing pagination control remain.
- Store activity: removed the invitation-selector instruction repeated by its label and placeholder; retained selection, pagination, authorization and error handling.
- Permission-request queue, Owner/Staff: removed both FE-only introductory alternatives. Kept request scope, status, reasons, grants, role gates and the request action.
- Store overview: removed the generic identity subtitle and repeated active-access sentence. Kept every form label, value, read-only restriction and status control.
- Operational defaults: removed the receiving-day definition repeated by its heading. Unsupported scheduling feedback remains.
- Store bootstrap: removed the decorative eyebrow and two unproven assertions that the account/Store has no business data or no menu/inventory/budget. T03/access-count responses do not establish those assertions. Removed only the now-unused eyebrow CSS rule.
- Shared unavailable-feature dialog: removed the promise that the feature will become available in the next update. The named current-unavailable state and Close action remain. The unused page export is not edited.
- Public marketing notices: removed the future-pricing/support promise and the instruction pointing to DEV-only HDSD. Replaced them in the **existing notice** with `Bảng giá chưa khả dụng.` and `Tài nguyên chưa khả dụng.` These two minimal `CONTRACT_REQUIRED` strings identify actual unsupported destinations. Click handling, modifiers, routing and notice dismissal are unchanged.

No approved MagicPath copy was rewritten. No new routes, cards, dialogs, tooltips, API calls or product flows. No typography normalization. Wrapper cleanup is limited to the deleted copy; no full RequirementsControls or completion-wrapper redesign.

### D. Contract-required copy retained

Concrete evidence is attached to each item, including the producing source/symbol/branch or published contract. In particular:

- Planning: Store ceiling vs run budget; exact decimal/zero bounds; saved/default/custom requirements; missing budget; unsupported advanced controls and winner selection; date/readiness gates; immutable retained evidence; paused polling versus server cancellation.
- Import OWNER/STAFF: source proof; explicit entity binding; declaration scope; required source-column replacement acknowledgement; unknown/false/zero; units/conversion evidence; conditional commit reason; separate Review/Commit acknowledgement; staged domain/history confirmations versus atomic commit; Profile approval versus commit authority; current permission/CAS/snapshot/unknown recovery.
- Store: current membership vs offered invitation grants; partial approval; inactive Staff; grants dependencies; reason requirements; nonempty/precision/IANA/currency validation; T03 uncertain create/replay/readback; unsupported profile/hours/operational controls.
- Auth/Invitation: verification/setup/login/acceptance distinctions; current-account matching; expired/invalid/wrong-account states; unknown acceptance/decline recovery and reason requirements.
- Notifications/Today/Inventory/Menu: read vs handled; authorized destinations; missing/partial data; physical vs usable stock; missing vs zero; recipe quantity/yield/effectivity; version/pagination mismatch; captured evidence versus current Store data.

Labels, accessible-region names and status/action identifiers remain where the actual adjacent control/data/state requires them. Backend catalog descriptions and business values are `DYNAMIC_DATA`; frontend fallbacks/dictionaries/static prose are separate adjudicated producers. A `{title}`/`{routeNotice}` binding alone does not grant provenance.

### E. MagicPath semantic equivalents retained

Examples with state-specific source evidence in the ledger:

- Planning Setup: `Cấu hình một lần chạy cho cửa hàng hiện tại.` ↔ canonical `Cấu hình một Planning Run cho Store hiện tại.`
- Requirements source: FE Store/run/default/custom/saved wording ↔ the canonical source selector in `ShelfCashPlanningScreen.tsx`.
- Planning budget: Store ceiling/run-budget distinction ↔ canonical BudgetPanel prose.
- Planning History: saved-run/current-Store introduction and first-run empty state ↔ `ShelfCashPlanHistory.tsx`.
- Store bootstrap: basic setup now/configure operations later ↔ `ShelfCashStoreBootstrap.tsx`.
- Export: inspection/export selection does not change the winner ↔ `ShelfCashPlanExportOverlay.tsx`.
- STAFF import introduction and upload/drop wording ↔ the equivalent current STAFF state; step-4 reusable indicator ↔ current reusable-profile state.

The known exact Import overview, OWNER reusable-interpretation explanation, Store access subtitle, Notifications subtitle and Planning context paragraph remain intact. Their verbosity does not authorize removal.

### F. Review-required items

**RV-01 — Marketing hero product preview**, PUBLIC, `HomePage.tsx`, 16 explicit occurrences listed in the ledger. Current copy includes `Từ dữ liệu đến quyết định`, `MỘT QUY TRÌNH RÕ RÀNG`, `Chủ động hơn / với mỗi lần nhập hàng.`, the preview introduction, three step labels/descriptions, step numbers and the illustration's accessible name.

- **MagicPath evidence found:** component `458083907045322752`, revision `461893687010529280`, `ShelfCashMarketingHomepageGrayscale.tsx` contains only `sc-product-preview`, `aria-label="Vùng giữ chỗ giao diện sản phẩm"` and `ShelfCash Product Preview`.
- **Evidence missing:** an approved final preview asset/content. The FE process illustration is not the canonical placeholder, and placeholder/prototype copy cannot serve as a production replacement.
- **Runtime requirement:** none establishes this illustration prose; it is not API/user data or a safety requirement.
- **Decision needed:** MagicPath Design supplies/approves the final preview asset, or approves omission of that region. No business/permission/API policy needs deciding.
- **Temporary disposition:** DO_NOT_AUTO_EDIT. Existing illustration remains an explicitly unapproved fallback, not accepted final production UI. Its 16 strings have a terminal `REVIEW_REQUIRED` classification; they are not merely unmatched.

This is one bounded asset/content decision, not a reason to leave other workspaces unclassified. It remains separate from known valid MagicPath copy that may be discussed in a future editorial review.

### G. Files changed

- `src/features/import-history/components/ImportHistoryList.tsx`.
- `src/features/operations/StoreActivityPage.tsx`.
- `src/features/store-workspace/components/PermissionRequests.tsx`.
- `src/features/store-workspace/components/StoreOperatingDefaults.tsx`.
- `src/features/store-workspace/components/StoreOverview.tsx`.
- `src/features/store/StoreBootstrap.tsx` and `StoreBootstrap.css`.
- `src/shared/UnderConstruction.tsx`.
- `src/pages/home/HomePage.tsx`.

Evidence tooling: [capture-copy-provenance.mjs](../../../scripts/capture-copy-provenance.mjs). Final ledger, [AST evidence](COPY_BEHAVIOR_PRESERVATION.json), [verification](COPY_VERIFICATION.json), captures and this report document the pass. Historical `COPY_PROVENANCE_AUDIT.json`, earlier `BEHAVIOR_PRESERVATION.json`, typography inventory and previous screenshots retain their historical scope. The user-supplied policy files were not modified. No commit/push.

### H. Representative visual evidence

[Capture receipt](copy-closure/capture.json): **22 before/after images**, 1440px, 100% zoom. Nine isolated component states use actual production components with controlled providers/props and SSR: Store overview/defaults/bootstrap, Owner/Staff permission-queue loading, initial administrative activity, named unavailable-feature dialog, and Import History empty/filtered state. The dialog is opened directly in the evidence DOM; this is not a hydrated authenticated-flow interaction. T03 mutations and query effects do not run.

Public marketing pricing/resource notices are additionally exercised through the actual local client component and click handlers in MemoryRouter. The client bundle has no app/BE server, credentials or external navigation; all network requests are denied. **Recorded network attempts: 0.** This is controlled public-component interaction, not authenticated shell or live E2E acceptance.

Representative images: Store overview [before](copy-closure/overview-before.png) / [after](copy-closure/overview-after.png); resource notice [before](copy-closure/public-resources-before.png) / [after](copy-closure/public-resources-after.png); permission queue [Owner](copy-closure/permission-owner-after.png) / [Staff](copy-closure/permission-staff-after.png).

Captures were reviewed for visible state/action labels, alignment and unnecessary empty markup. The new notices report current unavailability without future promises. All existing error/permission/unsupported-state instructions remain. Full authenticated shell, invite-selection activity branch, T03 success/readback and exhaustive state visual verification remain separately pending; source/AST evidence covers the copy-only changes without claiming those states were rendered here.

### I. Regression tests

- Store: **118/118**; Import: **143/143**; Operations: **30/30**; Planning: **79/79** — **370/370** existing controlled tests pass.
- Build and lint pass. Two pre-existing effect warnings and the large-bundle warning remain.
- [Structural AST comparison](COPY_BEHAVIOR_PRESERVATION.json) passes for all eight changed TSX files, normalizing only the adjudicated paragraph/segment removals and two declared notice-literal replacements. The sole removed JSX visibility predicate governed only the deleted invitation-selector helper; it enclosed no handler/business action.
- All other event handlers, role/permission/state checks, routes, API calls, request payloads and mutation logic are unchanged. The CSS diff removes only the unused eyebrow rule. No API/state/service/workflow source file changed.
- `docs/FOUND_MISSING_UI.md` remains SHA256 `3017bfd528eccd22988ff7851793bfec5babd69eb1aeb6a942a529967828fa9e`.

### J. Live BE status

**NOT RUN.** No live BE reads/mutations, login/accounts, upload, worker/process/PID bypass, contract changes or deployment changes. MagicPath access is read-only; no new revisions. Existing Windows live evidence is not reused as verification for this pass.

### K. Remaining non-copy visual defects

Keep these separate from the adjudication result: RequirementsControls arrangement, completion-receipt wrapper fidelity, approved typography normalization, full-shell/hydrated authenticated/all-state/a11y verification, and RV-01's final marketing preview asset. General visual convergence remains PARTIAL. Copy provenance itself is **COPY PROVENANCE CLOSED — REVIEW ITEMS REMAIN**.
