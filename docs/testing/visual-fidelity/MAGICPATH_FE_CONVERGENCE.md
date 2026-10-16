# MagicPath → FE visual convergence

Date: 2026-10-17. Baseline: `d0de974` (`Update: Colour update`). Verdict: **PARTIAL VISUAL CONVERGENCE — FOLLOW-UP REQUIRED**.

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
- **UNRESOLVED_VISUAL_DEFECT:** the 266 unmatched literal occurrences are screening candidates, not 266 unsupported strings. Semantic/contract review of every occurrence and all dynamic/prop-based copy remains open. No automatic removal is authorized by this inventory.
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
