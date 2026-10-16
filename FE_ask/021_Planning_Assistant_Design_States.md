# 021 — Planning Assistant: missing canonical interactions

Current status: **APPROVED / IMPLEMENTED — CONTROLLED VERIFIED** at revision `461952561365278720`. See the closure below and [implementation receipt](../docs/testing/planning-021/ASSISTANT_IMPLEMENTATION_RECEIPT.md). The original design request/preparation findings below are preserved as history.

Scope reopened by the 17/10 handoff task: explanation over one retained Planning Run only. Global AI, What-if, budget proposal application, Draft PO and operational commands remain outside scope.

MagicPath project 458079658328604672, Results component 458423352311304192, current revision 461899945612550144, read-only source audited on 17/10. `ShelfCashPlanningCopilot.tsx` defines first-open, suggestions, composer, answer/evidence, loading, permission and unavailable states. Its ResultSummary/business values and proposal actions are prototype fixtures, not authoritative backend output. No remote design was modified.

The following states need explicit canonical design before activating the complete production conversation:

1. Clarification: inline ingredient, option and Product candidate selection; candidate-less QUERY_UNSUPPORTED; retain the original question, display server names/IDs, no automatic first choice. The current prototype has no clarification state or candidate selection handler.
2. Stale evidence: stop showing old conversation as current; reread C03 and deliberately establish new explanation context, while preserving unresolved original intents. Current prototype has no stale/version state.
3. Uncertain Chat after reload: metadata-only durable policy excludes question/history/pending.original_question. There is no GET message API; a hash/context cannot reconstruct the original turn. Design must show the safe blocked recovery disposition without implying a retry can submit a new question/key. Do not silently authorize free-text persistence or drop uncertainty.
4. Summary: placement/entry for AS01 versus AS03 summary questions; optional mode/language controls (simple/technical, vi/en), retained running/failed generation, and explicit same-key recovery versus a deliberate new generation. Existing prototype ResultSummary is conversational fixture content, not a complete generation lifecycle.

Existing answer/loading/error/permission styling and approved wording remain useful design foundations, but do not establish these missing interactions. A common button/card pattern does not close the gaps.

Implemented now: typed API, scoped application state, explicit candidate validation/continuation, bounded history, returned context, deterministic fallback, stale/authority fencing, AS01 full-body and AS03 metadata-only pre-dispatch journals, AS02 reader and exact replay. No new Assistant product flow or prototype action is enabled.

BE prerequisite is deployment verification of the supplied source/schema, not another policy decision. Backend status remains SOURCE_READY / NOT_DEPLOYED, serving runtime UNVERIFIED. Candidate8/provider activation are not FE controls. The newer Import branch is excluded.

## Preparation follow-up — current implementation limits

See the [binding matrix](../docs/testing/planning-021/ASSISTANT_UI_BINDING_MATRIX.md), [future browser cases](../docs/testing/planning-021/ASSISTANT_UI_BROWSER_PLAN.md) and [integration checklist](../docs/testing/planning-021/ASSISTANT_DESIGN_INTEGRATION_CHECKLIST.md). This preparation does not change MagicPath or enable the entry.

- A deliberate new same-scope question after metadata-only uncertain reload is currently **blocked**, not an available escape/retry. A separate positive fixture requires a proven terminal prior outcome; no new policy is requested.
- B01 is a reproducible FE blocker: setPresentation after terminal Summary clears the result but leaves a locator that prevents generateSummary. Initial four presentation combinations do not establish switching support.
- B02 is a recovery/presentation hazard: an old retained Summary replay can return an old identity to a new owner. Final binding must fence it from current-evidence display; this is not a request to rewrite the old replay version/body or change BE policy.
- C03 refresh is external orchestration plus fresh owner construction; the current owner has no implemented context-refresh action. Journal uncertainty survives C03 refresh.

No UI action/copy should imply unsupported continuation. B01 needs a separate scoped implementation fix; B02 needs explicit tested current-versus-retained gating before final enablement. The final MagicPath revision/state IDs remain pending and must be recorded after the parallel design pass.

## Approved PL-01 implementation — 17/10/2026

Project `458079658328604672` · Component `458423352311304192` · Revision `461952561365278720`. The user approved the contract-aligned states; this closes the design request for the supported retained Planning Assistant. B01/B02 are fixed and controlled browser verified. See [implementation receipt](../docs/testing/planning-021/ASSISTANT_IMPLEMENTATION_RECEIPT.md). Prior findings above are historical; live/provider acceptance remains NOT RUN. No global AI/What-if/Draft PO expansion.
