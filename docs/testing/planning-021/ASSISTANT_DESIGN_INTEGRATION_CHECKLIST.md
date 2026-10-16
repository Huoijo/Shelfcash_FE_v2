# PL-01 final design integration checklist

Status: PREPARATION ONLY. Use after the parallel MagicPath worker supplies final canonical interactions. No checked box here claims implementation or browser acceptance. Complete Assistant entry remains parked.

## Authority and blocking implementation findings

- [ ] Read DESIGN.md and ShelfCash fidelity/copy/typography rules; record current repository/contract baseline and preserved user changes.
- [ ] Read the [binding matrix](ASSISTANT_UI_BINDING_MATRIX.md), including B01/B02, and [browser plan](ASSISTANT_UI_BROWSER_PLAN.md).
- [ ] **B01:** fix and test changing Summary locale/detail after a known terminal generation without losing prior generation knowledge or blocking intentional new work. No new backend contract is needed. Do not work around this by clearing journals or manufacturing terminal state.
- [ ] **B02:** compare recovered Summary identity to the current verified C03 pin; old immutable receipts must not appear as current facts. Decide presentation from canonical design and retain original replay body/version.
- [ ] Treat passing characterization tests for B01/B02 as reproduced defects/hazards, not acceptance. Replace/extend them with the corrected acceptance expectations in the actual implementation task.

## Design binding

- [ ] Record final MagicPath project/component/revision and exact state/element references, including both authorized roles and relevant narrow layout.
- [ ] Map every designed state to actual phase, DTO, controller and caller-orchestration signals. Do not invent enums for fixture-only `harness` descriptors.
- [ ] Audit normal states plus clarification, stale, metadata-only recovery and Summary lifecycle against the final design.
- [ ] Port no prototype business value, mock-only action, budget proposal application, provider/model selector, operational command, What-if or Draft PO.
- [ ] Introduce no unsupported runtime semantics, copy or placeholder product flows. Preserve the current parked state until the complete supported binding passes.

## UI and state ownership

- [ ] Reuse the existing Planning drawer/pattern and current shell; no new shell, global chatbot or duplicate AI theme.
- [ ] Keep evidence tied to current actor/Store/Run/option/version. No current-catalog reinterpretation of retained labels.
- [ ] Bind shared `phase` together with `chat`, `summary`, both intent states and the caller's actual in-flight promise. Running Summary is not synonymous with an in-flight request.
- [ ] Honor `restoring`/`blocked` controllers even if main phase remains idle; no actions before storage/authority checks finish.
- [ ] Use approved canonical copy; preserve minimal required safety semantics and dynamic server text. No explanatory subtitles added to compensate for missing design.

## Clarification

- [ ] No automatic first-candidate selection, name matching or ambiguity collapse.
- [ ] Explicitly choose an ID from the correct candidate array. Ingredient/Product labels are returned names; option candidates expose ID/source_strategies without an invented name/rank/winner.
- [ ] Preserve clarification.original_question and returned context. A selected Product belongs in context.product_id, not an unsupported top-level request field.
- [ ] Use a new turn key only after a known successful clarification response. Unknown prior delivery is recovered separately, with original identity.
- [ ] QUERY_UNSUPPORTED/zero candidates is a handled clarification, not a generic retry loop or error toast. A different question is intentional new work only when the prior outcome is known.

## Stale

- [ ] Old context/answer/summary/history visibly fenced after local version mismatch or backend evidence conflict.
- [ ] C03 reread belongs to the existing Planning caller; no hidden Assistant refresh API is assumed.
- [ ] Wait for fresh scope/version/grants before constructing a new owner. Restore journals before enabling new writes.
- [ ] Refresh success does not settle unknown Chat/Summary mutations or republish stale facts; delayed responses stay fenced.
- [ ] Current-versus-retained Summary comparison remains enforced during recovery (B02).

## Uncertain reload

- [ ] Persisted AS03 metadata contains operation/actor/Store/Run/key/hash/status only, with no question/history/pending original text/replay_input or fake message receipt.
- [ ] No fake server history reconstruction; no GET messages endpoint; metadata/hash alone cannot recreate a body.
- [ ] No unsafe retry label/action when original body is unavailable. Same-scope new question remains blocked while outcome is unknown, even if the user deliberately enters different text.
- [ ] Positive deliberate-new-question branch requires an actually known prior terminal outcome. Do not transition to it from timeout, empty reader, permission denial, elapsed time, journal clearing or reload alone.
- [ ] Denial redacts content while preserving the unresolved intent; closing/logout is not cancellation or proof of no-effect.

## Summary

- [ ] Initial and subsequent generation flows cover vi/en × simple/technical; initial mode tests alone do not close B01.
- [ ] AS01 starts/replays; AS02 reads one retained generation. AS03 summary-like questions remain chat turns and do not masquerade as AS01 generation lifecycle.
- [ ] Distinguish request pending, retained running, completed with usable deterministic/model output, terminal failed with null result, and uncertain delivery.
- [ ] Render returned text/claims/references/qualifiers; do not reconstruct Summary, translate its facts locally, infer a winner or normalize unknown to zero.
- [ ] Retained ID recovery uses AS02; without ID, exact original AS01 replay is explicit. Safe locator persistence survives ACK-to-UI/URL interruption.
- [ ] Same-key recovery is distinct from explicit new generation. Original locale/detail/version/body survive replay; new presentation is not a retry.
- [ ] Respect bounded reads and allow explicit reader refresh without another POST. GET does not perform provider recovery.
- [ ] Diagnostics inform supported fallback/error semantics minimally; no raw provider prompt/output, token-cost debug UI or model/version controls are ported.

## Permissions and scope

- [ ] Authority comes from all three current grants, not OWNER/STAFF labels. Read-only Staff remains denied.
- [ ] Test each missing/revoked grant, expired session, foreign Store/Run, actor/session change and late responses.
- [ ] Late response cannot republish protected data after scope/authority changes. Cached conversation/Summary/history remains hidden after fresh denial.
- [ ] Original unknown identity remains preserved even when a replay is denied.

## Verification and final enablement

- [ ] Use pure test-only fixtures/builders and clone each scenario. Rehydrate executable Summary replay records with the existing prepareRecoveryRecord; detached marker hashes are not replayable proof.
- [ ] Keep current memory-journal/fetch fixtures distinct from native IndexedDB, UI rendering and live evidence.
- [ ] Run actual controlled browser cases only after canonical components are bound; no fake Assistant screen to manufacture PASS.
- [ ] Capture meaningful desktop/narrow/OWNER/STAFF evidence and action assertions in a fresh task-specific folder, not historical screenshot paths.
- [ ] Enforce live BE calls=0, provider calls=0, real mutations=0 for controlled visual work; block/intercept all requests and fail on unexpected routes.
- [ ] Run relevant controlled Planning tests, contract gates if touched, build and lint. Preserve unrelated warnings and unrelated product flows.
- [ ] Record remaining intentional differences and independent Design/Frontend/Backend/verification statuses. Update the current register only from actual evidence.
- [ ] Enable the complete Assistant entry only in the explicitly authorized implementation after canonical coverage and B01/B02 acceptance; do not expose debug routes/controls as product UI.

Live BE status for this preparation: **NOT RUN**. Current readiness: **PL-01 PREPARATION PARTIAL — BLOCKERS FOUND**.
