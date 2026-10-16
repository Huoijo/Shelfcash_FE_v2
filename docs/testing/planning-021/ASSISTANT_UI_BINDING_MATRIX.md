# PL-01 Assistant state → UI binding matrix

Status: PREPARATION ONLY; no product binding or current-design acceptance. Source authority: [021 handoff receipt](../../sprints/021/021_Planning_Handoff_Integration.md), [design gaps](../../../FE_ask/021_Planning_Assistant_Design_States.md), [PlanningAssistant](../../../src/features/decision-planning/planning.assistant.ts), [intent controller](../../../src/features/decision-planning/planning.intent.ts), [recovery journal](../../../src/features/backend-capabilities/recovery.journal.ts), pinned contracts/021. Existing foundations are reused unchanged.

Preparation includes test-only fixtures/helpers and safe validation explicitly requested by this task. It is not live integration discovery or UI implementation. MagicPath is not accessed here; revision `461899945612550144` is historical context from 021, not attestation of the parallel worker's final design. Every final canonical state reference remains PENDING.

## Binding inputs and exact state names

`AssistantState.phase`: idle / sending / answer / clarification / stale / permission / error / uncertain. `summary`, `chat`, `history`, `error`, `summaryPolls` are separate inputs. Each controller has restoring / idle / pending / succeeded / failed / unknown / blocked, plus result/recoveryId/receiptIds. **Main phase alone is not an authorization or action-availability selector.** In particular, restore may leave main phase idle while a controller is blocked. `busy`, active task, and presentation are private; the eventual caller must track its awaited action and selected presentation without confusing retained running status with a network request. No new production selector/state is added here.

All cases require the current actor/session/Store/Run/evidence and all three grants `planning.result.read`, `budget.read`, `procurement.cost.read`. OWNER/STAFF role does not replace grants. A read-only Staff with only menu/ingredient/inventory grants cannot access these states' protected facts. Fresh denial wins over cache. Intent restoration requires the same actor/Store and current session authority; it does not cancel or migrate prior work.

Fixtures: [portable builders](../../../tests/fixtures/planning-assistant-preparation.ts), indexed by `fixtureCatalog.<UI_STATE>`. `harness.contextRead` and `harness.summaryPresentation` describe test orchestration, not new application enums/UI. Detached Summary replay records use an explicit marker hash; executable replay tests create a real hash with existing `prepareRecoveryRecord` before use. Three pinned BE illustrative envelopes are preserved separately; locally constructed variants are synthetic and do not certify BE grounding, translation or provider quality.

## NORMAL_FIRST_OPEN

- **UI state:** conceptual `NORMAL_FIRST_OPEN`; fixture `fixtureCatalog.NORMAL_FIRST_OPEN`.
- **Application owner / source:** PlanningAssistant.getSnapshot + both intent controllers + C03 caller.
- **Trigger condition:** phase=idle, restore completed and both intent statuses idle; fresh grants and C03 Run/version verified.
- **Data available:** Run/evidence scope from caller; empty history; supported caller presentation.
- **Data intentionally unavailable:** Server thread/history, model readiness, business answer before a response.
- **Allowed actions:** Explicit ask; explicit AS01 start with selected supported presentation.
- **Forbidden actions:** Send before restore; infer permissions from OWNER; expose operational commands.
- **Recovery semantics:** Restore is journal-only; inspect both controllers even when main phase is idle.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Current Run context, no fabricated prior conversation.

## NORMAL_ANSWER

- **UI state:** conceptual `NORMAL_ANSWER`; fixture `fixtureCatalog.NORMAL_ANSWER`.
- **Application owner / source:** state.chat + chatIntent.
- **Trigger condition:** phase=answer and chat.kind=answer after validated AS03 response.
- **Data available:** Exact answer/source/claims/references/context/diagnostics; bounded history.
- **Data intentionally unavailable:** New business conclusions, current-catalog aliases, hidden provider output.
- **Allowed actions:** Intentional follow-up with returned context; inspect existing authorized Planning evidence.
- **Forbidden actions:** Replace valid fallback with a failure; calculate recommendation or causal claims.
- **Recovery semantics:** Known receipt permits a distinct intentional turn with a new key; do not replay just to ask follow-up.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Returned answer remains usable for deterministic_fallback; not a Planning failure.

## LOADING

- **UI state:** conceptual `LOADING`; fixture `fixtureCatalog.LOADING`.
- **Application owner / source:** phase=sending + relevant intent pending + caller-owned awaited read promise.
- **Trigger condition:** AS01/AS03 dispatch or AS02 read is in flight.
- **Data available:** Captured original operation; prior known scope; reader generation ID when present.
- **Data intentionally unavailable:** A new answer or terminal outcome.
- **Allowed actions:** Wait/close without implying cancel; authorized readers as applicable.
- **Forbidden actions:** Competing write; automatic POST retries; infer that sending always means an in-flight request.
- **Recovery semantics:** Summary running also uses phase=sending after a request has returned; bind DTO status and caller promise separately.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Progress for the actual operation; no invented answer.

## PERMISSION_DENIED

- **UI state:** conceptual `PERMISSION_DENIED`; fixture `fixtureCatalog.PERMISSION_DENIED`.
- **Application owner / source:** authorize()/planningAccessFailure()/invalidate(permission).
- **Trigger condition:** Fresh 401/403/404 or actor/session/Store/grants mismatch.
- **Data available:** Safe error class/request metadata; durable uncertainty if any.
- **Data intentionally unavailable:** Cleared chat, Summary, history; cached protected facts.
- **Allowed actions:** External auth/Store authority revalidation; construct fresh authorized owner and restore original journal.
- **Forbidden actions:** Render old facts; infer denied replay rolled back prior work; reset unknown intent.
- **Recovery semantics:** Denial does not establish no-effect; phase=permission and chatIntent=unknown can coexist.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Protected facts hidden; recovery outcome not misrepresented.

## UNAVAILABLE

- **UI state:** conceptual `UNAVAILABLE`; fixture `fixtureCatalog.UNAVAILABLE`.
- **Application owner / source:** phase=error + both intent states + error code.
- **Trigger condition:** Actual request/read/storage failure, excluding valid answer/clarification and distinct Summary failed DTO.
- **Data available:** Safe normalized error; known locators; operation-specific status.
- **Data intentionally unavailable:** New answer, generic rollback proof, provider production readiness.
- **Allowed actions:** Retry permitted readers; exact replay only for original unknown intent with its body; separate storage/restore blocker.
- **Forbidden actions:** Blind generic retry; treat all error phases as settled failure.
- **Recovery semantics:** Transport/protocol errors after dispatch remain unknown; blocked restore cannot be treated as ready.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Request unavailable is distinct from valid fallback and Planning failure.

## CLARIFICATION_INGREDIENT

- **UI state:** conceptual `CLARIFICATION_INGREDIENT`; fixture `fixtureCatalog.CLARIFICATION_INGREDIENT`.
- **Application owner / source:** state.chat.clarification + selectCandidate(kind,id).
- **Trigger condition:** phase=clarification, kind=clarification; relevant typed candidate array contains explicit choices.
- **Data available:** candidates[].ingredient_id/name; original_question; returned context.
- **Data intentionally unavailable:** Automatic identity selection; invented labels/rank/winner; top-level product_id.
- **Allowed actions:** Explicit selectCandidate for an ID present in the matching ingredient array; deliberate different question after this known response.
- **Forbidden actions:** Select first/similar-name match automatically; replay old key with changed body; retry because diagnostics say FALLBACK.
- **Recovery semantics:** Continuation uses clarification.original_question; new turn key after known 200. Ingredient/option bind their request IDs; Product binds context.product_id. History/context are hints, not business authority.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Question and distinct returned identities; selection is a user decision, not an error retry.

## CLARIFICATION_SIMILAR_INGREDIENTS

- **UI state:** conceptual `CLARIFICATION_SIMILAR_INGREDIENTS`; fixture `fixtureCatalog.CLARIFICATION_SIMILAR_INGREDIENTS`.
- **Application owner / source:** state.chat.clarification + selectCandidate(kind,id).
- **Trigger condition:** phase=clarification, kind=clarification; relevant typed candidate array contains explicit choices.
- **Data available:** Five similar synthetic candidates with distinct ingredient_id/name; original_question/context.
- **Data intentionally unavailable:** Automatic identity selection; invented labels/rank/winner; top-level product_id.
- **Allowed actions:** Explicit selectCandidate for an ID present in the matching similar ingredients array; deliberate different question after this known response.
- **Forbidden actions:** Select first/similar-name match automatically; replay old key with changed body; retry because diagnostics say FALLBACK.
- **Recovery semantics:** Continuation uses clarification.original_question; new turn key after known 200. Ingredient/option bind their request IDs; Product binds context.product_id. History/context are hints, not business authority.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Question and distinct returned identities; selection is a user decision, not an error retry.

## CLARIFICATION_OPTION

- **UI state:** conceptual `CLARIFICATION_OPTION`; fixture `fixtureCatalog.CLARIFICATION_OPTION`.
- **Application owner / source:** state.chat.clarification + selectCandidate(kind,id).
- **Trigger condition:** phase=clarification, kind=clarification; relevant typed candidate array contains explicit choices.
- **Data available:** option_candidates[].option_id/source_strategies; original_question/context; no candidate name field.
- **Data intentionally unavailable:** Automatic identity selection; invented labels/rank/winner; top-level product_id.
- **Allowed actions:** Explicit selectCandidate for an ID present in the matching option array; deliberate different question after this known response.
- **Forbidden actions:** Select first/similar-name match automatically; replay old key with changed body; retry because diagnostics say FALLBACK.
- **Recovery semantics:** Continuation uses clarification.original_question; new turn key after known 200. Ingredient/option bind their request IDs; Product binds context.product_id. History/context are hints, not business authority.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Question and distinct returned identities; selection is a user decision, not an error retry.

## CLARIFICATION_PRODUCT

- **UI state:** conceptual `CLARIFICATION_PRODUCT`; fixture `fixtureCatalog.CLARIFICATION_PRODUCT`.
- **Application owner / source:** state.chat.clarification + selectCandidate(kind,id).
- **Trigger condition:** phase=clarification, kind=clarification; relevant typed candidate array contains explicit choices.
- **Data available:** product_candidates[].product_id/name; original_question; returned context.
- **Data intentionally unavailable:** Automatic identity selection; invented labels/rank/winner; top-level product_id.
- **Allowed actions:** Explicit selectCandidate for an ID present in the matching Product array; deliberate different question after this known response.
- **Forbidden actions:** Select first/similar-name match automatically; replay old key with changed body; retry because diagnostics say FALLBACK.
- **Recovery semantics:** Continuation uses clarification.original_question; new turn key after known 200. Ingredient/option bind their request IDs; Product binds context.product_id. History/context are hints, not business authority.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Question and distinct returned identities; selection is a user decision, not an error retry.

## QUERY_UNSUPPORTED

- **UI state:** conceptual `QUERY_UNSUPPORTED`; fixture `fixtureCatalog.QUERY_UNSUPPORTED`.
- **Application owner / source:** chat.kind=clarification + clarification.code + candidate arrays.
- **Trigger condition:** code=QUERY_UNSUPPORTED; zero ingredient/option/Product candidates.
- **Data available:** Server question/answer/code/original_question; optional context.
- **Data intentionally unavailable:** Supported choice, fabricated candidate, usable operational command.
- **Allowed actions:** Read explanation; deliberate different supported question after known receipt.
- **Forbidden actions:** Auto-retry original question; display fake selectable entity; generic error toast.
- **Recovery semantics:** Successful handled clarification, not uncertain delivery; no valid selectCandidate exists.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Unsupported question is a handled conversational branch.

## CONTEXT_STALE

- **UI state:** conceptual `CONTEXT_STALE`; fixture `fixtureCatalog.CONTEXT_STALE`.
- **Application owner / source:** setEvidenceVersion(newVersion) or HTTP EVIDENCE_VERSION_CONFLICT -> invalidate(stale).
- **Trigger condition:** C03/current version differs or backend 409 evidence conflict.
- **Data available:** Caller’s old/new pin and safe scope; existing durable records.
- **Data intentionally unavailable:** chat/summary/history cleared; former context no longer current.
- **Allowed actions:** External C03 reread; retain unresolved records; later construct new owner with validated current scope/version.
- **Forbidden actions:** Reuse old owner via setPresentation; automatic replay; treat old receipt as current.
- **Recovery semantics:** Owner invalidates epoch and aborts read. It does not update its private evidenceVersion or implement C03 refresh.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Old facts visibly fenced; change of evidence not presented as a provider failure.

## CONTEXT_REFRESHING

- **UI state:** conceptual `CONTEXT_REFRESHING`; fixture `fixtureCatalog.CONTEXT_REFRESHING`.
- **Application owner / source:** External C03 reader/caller; harness.contextRead=pending only in fixtures.
- **Trigger condition:** C03 reread is pending while the old owner remains stale.
- **Data available:** Original scope/pin and retained unresolved records.
- **Data intentionally unavailable:** Validated new evidence/context; old facts as current.
- **Allowed actions:** Await the actual C03 promise; cancel local read if scope changes.
- **Forbidden actions:** Invent phase=context_refreshing in PlanningAssistant; enable ask before validated current read.
- **Recovery semantics:** This is an orchestration state, not an implemented Assistant method; keep old owner fenced.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Refresh progress without republishing stale conversation.

## CONTEXT_RESTORED

- **UI state:** conceptual `CONTEXT_RESTORED`; fixture `fixtureCatalog.CONTEXT_RESTORED`.
- **Application owner / source:** Validated external C03 + newly constructed PlanningAssistant + restore().
- **Trigger condition:** Fresh C03 scope/version/grants validated; new owner restored and no unresolved records.
- **Data available:** New Run/evidence pin; empty conversation; current permissions.
- **Data intentionally unavailable:** Old server thread or migrated old chat history.
- **Allowed actions:** Explicit new ask/summary only after both intent controllers allow it.
- **Forbidden actions:** Claim C03 settled a prior unknown mutation; auto-send original or new turn.
- **Recovery semantics:** Fresh owner is required; restore may instead reveal unknown/blocked. Old Summary receipt must be compared against the current pin (B02).
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Current evidence context; no fabricated old conversation.

## CONTEXT_RESTORED_UNRESOLVED

- **UI state:** conceptual `CONTEXT_RESTORED_UNRESOLVED`; fixture `fixtureCatalog.CONTEXT_RESTORED_UNRESOLVED`.
- **Application owner / source:** New owner.restore + retained AS03 journal.
- **Trigger condition:** C03 current read succeeds but same actor/Store/Run AS03 record remains unknown.
- **Data available:** Current Planning evidence plus original operation/key/hash metadata.
- **Data intentionally unavailable:** Original Chat body/history or proof of no-effect.
- **Allowed actions:** Read authorized Planning facts; preserve blocked Chat intent.
- **Forbidden actions:** Unlock a new same-scope question just because C03 refreshed.
- **Recovery semantics:** Fresh C03 does not reconcile AS03; restored owner remains uncertain.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Current Planning can be read while unresolved Chat remains blocked.

## UNCERTAIN_AFTER_RELOAD

- **UI state:** conceptual `UNCERTAIN_AFTER_RELOAD`; fixture `fixtureCatalog.UNCERTAIN_AFTER_RELOAD`.
- **Application owner / source:** chatIntent.restore/replay/send + metadata-only journal.
- **Trigger condition:** Restored AS03 pending/unknown record; state.phase=uncertain; original memory body absent.
- **Data available:** Operation/actor/Store/Run/path/key/hash/time/state; recoveryId.
- **Data intentionally unavailable:** Question, full history, pending.original_question, replay_input, AS03 message receipt/generation lookup.
- **Allowed actions:** Inspect safe recovery metadata; close; externally revalidate authority/read current Planning.
- **Forbidden actions:** Exact retry from hash; reconstruct text; submit replacement/new key; discard or expire record to unlock.
- **Recovery semantics:** replayChat rejects missing body before network; ask rejects while controller unknown. A deliberate new same-scope question is NOT supported in this after-reload state.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Unknown remains unknown; no artificial retry or new-question affordance.

## UNCERTAIN_BLOCKED_CONTINUATION

- **UI state:** conceptual `UNCERTAIN_BLOCKED_CONTINUATION`; fixture `fixtureCatalog.UNCERTAIN_BLOCKED_CONTINUATION`.
- **Application owner / source:** chatIntent.restore/replay/send + metadata-only journal.
- **Trigger condition:** Restored AS03 pending/unknown record; state.phase=uncertain; original memory body absent.
- **Data available:** Operation/actor/Store/Run/path/key/hash/time/state; recoveryId.
- **Data intentionally unavailable:** Question, full history, pending.original_question, replay_input, AS03 message receipt/generation lookup.
- **Allowed actions:** Inspect safe recovery metadata; close; externally revalidate authority/read current Planning.
- **Forbidden actions:** Exact retry from hash; reconstruct text; submit replacement/new key; discard or expire record to unlock.
- **Recovery semantics:** replayChat rejects missing body before network; ask rejects while controller unknown. A deliberate new same-scope question is NOT supported in this after-reload state.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Unknown remains unknown; no artificial retry or new-question affordance.

## NEW_QUESTION_AFTER_UNCERTAIN

- **UI state:** conceptual `NEW_QUESTION_AFTER_UNCERTAIN`; fixture `fixtureCatalog.NEW_QUESTION_AFTER_UNCERTAIN`.
- **Application owner / source:** chatIntent.restore/replay/send + metadata-only journal.
- **Trigger condition:** Restored AS03 pending/unknown record; state.phase=uncertain; original memory body absent.
- **Data available:** Operation/actor/Store/Run/path/key/hash/time/state; recoveryId.
- **Data intentionally unavailable:** Question, full history, pending.original_question, replay_input, AS03 message receipt/generation lookup.
- **Allowed actions:** Inspect safe recovery metadata; close; externally revalidate authority/read current Planning.
- **Forbidden actions:** Exact retry from hash; reconstruct text; submit replacement/new key; discard or expire record to unlock.
- **Recovery semantics:** replayChat rejects missing body before network; ask rejects while controller unknown. A deliberate new same-scope question is NOT supported in this after-reload state.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Unknown remains unknown; no artificial retry or new-question affordance.

## NEW_QUESTION_AFTER_KNOWN_TERMINAL

- **UI state:** conceptual `NEW_QUESTION_AFTER_KNOWN_TERMINAL`; fixture `fixtureCatalog.NEW_QUESTION_AFTER_KNOWN_TERMINAL`.
- **Application owner / source:** AS03 GENERATION_FAILED terminal response / known prior success + controller send.
- **Trigger condition:** Old outcome is authoritative terminal, NOT merely restored metadata-only uncertainty.
- **Data available:** Known terminal status; current grants/context; distinct user-entered new question.
- **Data intentionally unavailable:** Original history after reload; proof from an empty read.
- **Allowed actions:** Explicit new ask with new key after terminal acknowledgement; UI may retain old outcome label.
- **Forbidden actions:** Convert timeout/reload/denial into terminal evidence; label a new question as recovery.
- **Recovery semantics:** Test positive path is in-memory lost ACK -> exact replay -> GENERATION_FAILED -> new turn. Seeded rejected record is a separate known-terminal fixture, not a transition out of unresolved metadata.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: New work is distinct from recovery of the original turn.

## SUMMARY_INITIAL

- **UI state:** conceptual `SUMMARY_INITIAL`; fixture `fixtureCatalog.SUMMARY_INITIAL`.
- **Application owner / source:** summary=null + summaryIntent idle + presentation held by caller.
- **Trigger condition:** Restore finished, no unresolved Chat/Summary and no unread retained generation locator.
- **Data available:** Supported vi/en and simple/technical; C03 expected version/option selector.
- **Data intentionally unavailable:** Generated text, internal headline/key_points, provider controls.
- **Allowed actions:** Explicit AS01 via generateSummary after initial setPresentation.
- **Forbidden actions:** Infer Summary availability means winner; send generation before restore.
- **Recovery semantics:** Null option is passed to BE; FE does not select a winner.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: No Summary until a validated result exists.

## SUMMARY_RUNNING

- **UI state:** conceptual `SUMMARY_RUNNING`; fixture `fixtureCatalog.SUMMARY_RUNNING`.
- **Application owner / source:** state.summary.status=running + summaryIntent succeeded; phase may remain sending.
- **Trigger condition:** AS01/AS02 retained result running.
- **Data available:** generation_id/run_id/status/timestamps; response result=null.
- **Data intentionally unavailable:** Summary answer, completion or failure, paid-provider replay permission.
- **Allowed actions:** Bounded AS02 pollSummary; explicit refreshSummary after local 60-read cap.
- **Forbidden actions:** POST merely to poll; competing generation; imply GET performs recovery.
- **Recovery semantics:** Reads use original generation ID; running DTO is not itself an in-flight HTTP promise.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Retained generation in progress, distinct from UI request spinner.

## SUMMARY_COMPLETED

- **UI state:** conceptual `SUMMARY_COMPLETED`; fixture `fixtureCatalog.SUMMARY_COMPLETED`.
- **Application owner / source:** summary.status=completed + result.
- **Trigger condition:** Validated completed generation, including deterministic_fallback.
- **Data available:** Returned answer/claims/references/source/diagnostics/locale/detail_level and immutable identity/pins.
- **Data intentionally unavailable:** New conclusions or translated/regenerated text from FE.
- **Allowed actions:** Read output; explicit same-presentation new generation after known outcome.
- **Forbidden actions:** Mark fallback as Planning failed; replace unavailable quantities with zero.
- **Recovery semantics:** Completed source and generation status are independent. Compare identity to current C03 before labeling current (B02).
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: BE wording and scope retained; fallback is usable.

## SUMMARY_FAILED

- **UI state:** conceptual `SUMMARY_FAILED`; fixture `fixtureCatalog.SUMMARY_FAILED`.
- **Application owner / source:** summary.status=failed, result=null, error_code; phase=error.
- **Trigger condition:** AS01/AS02 returned terminal failed generation.
- **Data available:** generation_id/status/error_code/timestamps.
- **Data intentionally unavailable:** Usable answer or positive recommendation.
- **Allowed actions:** Inspect failure; intentional new generation after known terminal outcome and current grants.
- **Forbidden actions:** Treat failed as deterministic fallback or unknown delivery; resurrect same failed generation.
- **Recovery semantics:** Same key retains original terminal result; new key is explicit new work.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Summary failed, independently of Planning execution outcome.

## SUMMARY_SAFE_RECOVERY

- **UI state:** conceptual `SUMMARY_SAFE_RECOVERY`; fixture `fixtureCatalog.SUMMARY_SAFE_RECOVERY`.
- **Application owner / source:** summaryIntent unknown/full-body record OR confirmed receiptIds.generation_id.
- **Trigger condition:** Response lost; or ACK locator persisted before UI update.
- **Data available:** Exact original AS01 body/key/hash, or safe generation UUID; current auth/Store/grants.
- **Data intentionally unavailable:** Newer business facts inferred from receipt; raw response in journal.
- **Allowed actions:** Known generation ID -> AS02; unknown without ID -> explicit replaySummary original key/body.
- **Forbidden actions:** New key/body as retry; rewrite original expected_evidence_version; paid-call loops.
- **Recovery semantics:** Full-body records revalidate original hash; confirmed safe locators survive reload. Old-version replay must not be published as current (B02).
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Safe original-generation recovery, distinct from start-new.

## SUMMARY_NEW_GENERATION

- **UI state:** conceptual `SUMMARY_NEW_GENERATION`; fixture `fixtureCatalog.SUMMARY_NEW_GENERATION`.
- **Application owner / source:** generateSummary after known terminal + idle/succeeded intent.
- **Trigger condition:** Existing Summary completed/failed, same current presentation and no unresolved Chat.
- **Data available:** Old generation retained and current original-scope authority.
- **Data intentionally unavailable:** Cancellation/regeneration of old receipt; automatic new generation on selector change.
- **Allowed actions:** Intentional AS01 with a new key, after known outcome.
- **Forbidden actions:** Start while running/unknown; conflate replay with new generation.
- **Recovery semantics:** Same-presentation path exists. Changing presentation after terminal currently hits B01 and is not supported end-to-end.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: New generation is deliberate independent work; mode/language change remains blocked until B01 addressed.

## SUMMARY_VI_SIMPLE

- **UI state:** conceptual `SUMMARY_VI_SIMPLE`; fixture `fixtureCatalog.SUMMARY_VI_SIMPLE`.
- **Application owner / source:** Initial setPresentation + AS01 request/result DTO.
- **Trigger condition:** Fresh owner selects locale=vi, detail_level=simple before generation.
- **Data available:** Exact requested presentation; backend result.locale/detail_level/text; synthetic fixture variant.
- **Data intentionally unavailable:** FE translation, internal provider prompts, quality proof.
- **Allowed actions:** Initial generation with these exact enums; render returned text unchanged.
- **Forbidden actions:** Assume terminal-generation presentation switch works (B01); interpret fixture metadata variants as live language-quality acceptance.
- **Recovery semantics:** All four fresh-owner combinations are controlled API-state tested; cross-generation selector transition is separately blocked.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Presentation selection and returned metadata agree; copy comes from the returned result.

## SUMMARY_VI_TECHNICAL

- **UI state:** conceptual `SUMMARY_VI_TECHNICAL`; fixture `fixtureCatalog.SUMMARY_VI_TECHNICAL`.
- **Application owner / source:** Initial setPresentation + AS01 request/result DTO.
- **Trigger condition:** Fresh owner selects locale=vi, detail_level=technical before generation.
- **Data available:** Exact requested presentation; backend result.locale/detail_level/text; synthetic fixture variant.
- **Data intentionally unavailable:** FE translation, internal provider prompts, quality proof.
- **Allowed actions:** Initial generation with these exact enums; render returned text unchanged.
- **Forbidden actions:** Assume terminal-generation presentation switch works (B01); interpret fixture metadata variants as live language-quality acceptance.
- **Recovery semantics:** All four fresh-owner combinations are controlled API-state tested; cross-generation selector transition is separately blocked.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Presentation selection and returned metadata agree; copy comes from the returned result.

## SUMMARY_EN_SIMPLE

- **UI state:** conceptual `SUMMARY_EN_SIMPLE`; fixture `fixtureCatalog.SUMMARY_EN_SIMPLE`.
- **Application owner / source:** Initial setPresentation + AS01 request/result DTO.
- **Trigger condition:** Fresh owner selects locale=en, detail_level=simple before generation.
- **Data available:** Exact requested presentation; backend result.locale/detail_level/text; synthetic fixture variant.
- **Data intentionally unavailable:** FE translation, internal provider prompts, quality proof.
- **Allowed actions:** Initial generation with these exact enums; render returned text unchanged.
- **Forbidden actions:** Assume terminal-generation presentation switch works (B01); interpret fixture metadata variants as live language-quality acceptance.
- **Recovery semantics:** All four fresh-owner combinations are controlled API-state tested; cross-generation selector transition is separately blocked.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Presentation selection and returned metadata agree; copy comes from the returned result.

## SUMMARY_EN_TECHNICAL

- **UI state:** conceptual `SUMMARY_EN_TECHNICAL`; fixture `fixtureCatalog.SUMMARY_EN_TECHNICAL`.
- **Application owner / source:** Initial setPresentation + AS01 request/result DTO.
- **Trigger condition:** Fresh owner selects locale=en, detail_level=technical before generation.
- **Data available:** Exact requested presentation; backend result.locale/detail_level/text; synthetic fixture variant.
- **Data intentionally unavailable:** FE translation, internal provider prompts, quality proof.
- **Allowed actions:** Initial generation with these exact enums; render returned text unchanged.
- **Forbidden actions:** Assume terminal-generation presentation switch works (B01); interpret fixture metadata variants as live language-quality acceptance.
- **Recovery semantics:** All four fresh-owner combinations are controlled API-state tested; cross-generation selector transition is separately blocked.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Presentation selection and returned metadata agree; copy comes from the returned result.

## LOADING_RETAINED_ANSWER

- **UI state:** conceptual `LOADING_RETAINED_ANSWER`; fixture `fixtureCatalog.LOADING_RETAINED_ANSWER`.
- **Application owner / source:** phase=sending + pending intent + prior state.chat.
- **Trigger condition:** Known previous answer exists while next turn is in flight.
- **Data available:** Prior receipt explicitly prior; pending original operation.
- **Data intentionally unavailable:** New answer or assumed result of pending turn.
- **Allowed actions:** Await original response; preserve scoped prior context only under current grants.
- **Forbidden actions:** Present previous text as the response to the new question; silently retry.
- **Recovery semantics:** Do not derive active task solely from the shared phase; caller tracks which promise is active.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Prior answer and pending turn remain distinguishable.

## PERMISSION_DENIED_UNCERTAIN

- **UI state:** conceptual `PERMISSION_DENIED_UNCERTAIN`; fixture `fixtureCatalog.PERMISSION_DENIED_UNCERTAIN`.
- **Application owner / source:** phase=permission + chatIntent unknown + retained record.
- **Trigger condition:** Fresh denial after a write with unknown delivery.
- **Data available:** Safe original intent identity and denial class.
- **Data intentionally unavailable:** All protected answer/Summary/history; original Chat text after reload.
- **Allowed actions:** Revalidate authority externally; keep unknown record fenced.
- **Forbidden actions:** Treat permission denial as rollback; enable replacement; leak cached facts.
- **Recovery semantics:** Denial redacts content but does not settle uncertain mutation.
- **Permission considerations:** current actor/session/Store/Run + all three grants above; fresh denial redacts protected facts while retaining unknown outcomes.
- **Expected canonical MagicPath state:** **PENDING** — final PL-01 revision/state/element IDs must be supplied and audited; expected semantics: Permission state and unknown outcome both remain truthful.

## Integration findings — foundations unchanged

### B01 — Terminal Summary presentation change blocks deliberate generation

Reproduced with the real owner under intercepted HTTP: generate a completed Summary → `setPresentation({locale:en, detail_level:technical, option_id:null})` clears `state.summary` but retains `summaryIntent.receiptIds.generation_id` → `generateSummary()` rejects `Resolve the current generation/turn first` before POST. A direct second same-presentation generation is supported; the selector-change transition is not. This contradicts an assumption that all four modes can be freely switched between known terminal generations. Fix requires a scoped implementation follow-up under the existing contract; no product source is changed in preparation. Characterization test PASS means the blocker was reproduced, not that the workflow is accepted.

### B02 — Old-version replay must not be labeled current

A fresh owner with a newer C03 pin can restore an old AS01 unresolved full-body record and explicitly replay its original body. The typed API correctly honors the original request's expected version, but `replaySummary()` publishes the old result with `phase=answer` without a current-pin distinction. The controlled fixture demonstrates this boundary hazard; it is not evidence that a live immutable Run actually changed. Retained old receipts remain valid immutable results; they must not become current facts merely because recovery succeeded. The test-only `assertSummaryMatchesCurrentEvidence` catches this. Future binding must compare `result.identity.aggregate_digest` to the caller's verified current C03 version and fence/label old evidence per canonical design. No replay-policy change is proposed.

### Supported safety limits, not new policy decisions

- Metadata-only AS03 after reload cannot resume or send a new same-scope question. No message GET, text reconstruction or negative-proof API exists. Keep the requested new-question case as a **negative test** until the old outcome is actually known; no reset/clear/TTL shortcut.
- C03 refresh is external caller orchestration; `PlanningAssistant` has no context-refresh method and an invalidated owner cannot be reset with `setPresentation`. Fresh owner construction must still restore and respect unresolved journals.
- AS03's terminal GENERATION_FAILED differs from GENERATION_IN_PROGRESS/denial/timeout. The positive new-question test resolves the original exact intent while its body still exists, then starts genuinely new work.
- Diagnostics may justify source/fallback/unavailable semantics, but do not authorize raw prompts, provider controls, token/cost debug panels or new production helper prose. Claims/reference pointers are evidence identifiers, not browser URLs.

Preparation artifacts are complete, but final binding has known B01/B02 obligations. Verdict: **PL-01 PREPARATION PARTIAL — BLOCKERS FOUND**. Product Assistant remains parked; no fake UI is supplied.
