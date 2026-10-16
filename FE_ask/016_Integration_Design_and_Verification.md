# 016 — FE integration, design and verification follow-up

Creation date: 16/10/2026. General context: consume main handoff `869eaec9` after v1/v2 consolidation. This is a sprint follow-up, not a request to rebuild APIs already supplied. FE implementation/status and evidence live in [docs/016](../docs/sprints/016/016_Integration_Sprint.md).

**018 API-first update:** [typed services and application-state helpers](../docs/sprints/018/018_Backend_Capabilities_Service_Boundary.md) now expose all 73 published operations, including MQ/NF/PR/onboarding/T03/IN01/D01/EX01 and N5 request_changes. These capabilities no longer wait for UI to prepare their data layer. Existing UI callers/pins and complete lifecycle UX still require their own integration; the design/environment/source-semantics follow-ups below remain valid. No placeholder UI or live acceptance is implied.

## Confirmed capabilities — do not reopen policy

SU01 Supplier picker, MQ01–03, notifications, N5 self-approval/request_changes, eligible RULE full-spec approval, 15 schemas, source_only, Preview/persisted Review/atomic commit/I06 and current authorization are present in newer BE source/handoff. Commit reason may be null/omitted for pure inserts/NO_OP. Planning R01 requires context/budget/cost reads. None of these requires a new product policy decision.

FE now consumes the 016 Import/SU01/Import R01 slice with strict wire; other feature slices retain 011 until separately migrated. Ground truth, sources and byte hashes: [contracts](../contracts/README.md).

## BE evidence/environment needed

1. **Deployment identity:** confirm whether integration should target supplied SHA `869eaec9` or reported `b0db90c`; provide exact OpenAPI artifact/hash for the latter if required and deployed non-secret base URL. Current local/remote evidence did not establish `b0db90c`. Do not republish SU01/MQ schemas already present unless they changed.
2. **Live prerequisites:** dedicated test Store, Owner/Staff membership/grants and worker-health evidence; credentials through the session's appropriate private channel, never committed to docs/examples. Confirm which writes/data are disposable before live integration. Health/OpenAPI alone is insufficient.
3. **Email capability/callback:** freeze EMAIL_VERIFY callback route and confirm delivery/resend capability/configuration. N7 SETUP/RESET `/credentials/complete` is a different purpose. Do not request BE to invent FE UI or send real email during static audit.
4. **Operation-specific recovery evidence:** share tested retained-state/same-key replay behavior and retention windows where not documented. We acknowledge no general negative intent-status endpoint exists; this is an evidence request, not a new endpoint proposal.

## MagicPath follow-up needed

Use current project [458079658328604672](https://www.magicpath.ai/files/458079658328604672), OWNER revision `461110616439017472`, STAFF `461109945690124288` inspected in this pass. Reuse shared resolver/Profile/Review/permission geometry and retain previous FM history.

- **FM-013:** signup → mailbox proof/password → login, delivery-unavailable/resend/expired/consumed/wrong-link states. Existing login/register form is not a complete email-verification design.
- **FM-014:** authenticated account with zero Store → explicit T03 name/timezone/currency creation → unknown receipt/retry/readback → Store selection. Signup does not implicitly create Store/Owner membership.
- **FM-015:** account notification inbox/unread/read state, permission loss and pinned submission/decision deep links. Notification read must not approve/commit or silently select another Store.
- **FM-016:** extend existing Staff submit/waiting and Owner queue/full-spec design with required reason, one-profile-per-submission, withdraw, request_changes/resubmit, exact pinned evidence/eligibility/stale/unknown recovery and notification context. Do not label the entire queue as undesigned; these required variants are missing/incomplete.
- **FM-003 extension:** optional reason for pure inserts/NO_OP versus correction-required reason in the existing two-phase Review/Commit form. Preserve required Review and per-action justification/ack; no extra confirmation modal.

## Source semantics only when actual files need clarification

- PNK: purchase history, order evidence or actual goods received? NCT: which business date/timestamp?
- Recipe quantity per serving or whole declared yield; exact loss/units/effectivity?
- Supplier price/MOQ per pack, stated quantity or base unit; explicit pack conversion?
- Stock observation timestamp/timezone; Calendar event meaning/scope?

These questions belong to the source owner and apply only where evidence is insufficient. They do not reopen approval/permission/unknown/IGNORE policy. General layout constraints/weather/uplift/combo/discount/derived savings would be new BE scope, not a workaround for unsupported input.

## Acceptance for next slices

MQ submit/replay → Owner pinned read/request_changes/approve → Staff readback/preview → persisted Review → atomic commit → retained I06 with current rights; notifications remain navigation only. Signup/verify/create-Store require their own complete designs and controlled tests before live accounts/email. Broader Planning/PR/D01/EX01 integration needs exact typed DTOs, scope semantics and corresponding UI; no arbitrary-object validation or simulated production endpoints.
