# 019 — Freeze integration gaps requiring BE/design clarification

Creation date: 16/10/2026. General context: latest frozen MagicPath implementation against supplied main016. Evidence is the pinned OpenAPI/handoff, not a verified live deployment. No new policy decision requested. Current implementation: [019 receipt](../docs/sprints/019/019_Main_Frontend_Implementation.md).

## P1 — Email verification continuation and delivery

Affected: signup/resend/reset and invitation verification. MagicPath distinguishes expired/invalid/already verified and continues using real account context. A02/A06/A07 accept mail requests; A05 accepts proof/password and returns next_action=login, no session/account identity. Invalid/expired/consumed proof shares EMAIL_VERIFICATION_TOKEN_INVALID. A01 unverified login returns generic INVALID_CREDENTIALS, so FE cannot safely label that as unverified.

FE proceeds with explicit A01/A03 and retains invitation ID plus purpose-specific proof in memory; verification never calls N19. Shared invalid/expired/used copy is intentional. Need deployed delivery/callback configuration evidence and real delivery testing. If product requires authenticated immediate continuation or distinct statuses, BE must publish that safe capability. Do not expose account existence through a speculative FE check.

## P1 — Mutation proof after unknown outcome

Affected: T03, MQ01/N5, Review/Commit, resolver and file uploads. Current operation-specific idempotent replay/readers remain authority. Empty lists/current unchanged state cannot prove a request was never applied. FE locks new intent and retains exact requests in memory across internal navigation; reload/session loss has no generic durable recovery identity.

Recommendation (suggestion, not existing API): operation-specific mutation receipt lookup by retained client intent/key with explicit accepted/rejected/unknown semantics and retention rules. A negative answer must be authoritative for the original operation and key. FE can proceed partially with retained exact replay/readback; cannot truthfully display universal “confirmed not saved/created” after lost ACK.

## P1 — Accepted source modification

MagicPath partial upload can replace/remove a failed local selection. Current I02 receipt/source set does not provide DELETE/replace accepted bytes or unseal. FE retains accepted files, retries only known rejected files with retained File bytes, and confirms the exact accepted source set. Unknown upload uses receipt readback and never blindly retries. A fresh intentional batch is needed for changed accepted bytes. Add explicit versioned replace/delete/unseal operations only if product expands this scope; do not reinterpret local removal as canonical deletion.

## P1 — Resolver create+bind and precise Staff feedback target

M04 new_entity_proposal is a reservation/proposal, not immediate entity creation. FE preserves metadata/evidence, Owner decision and atomic commit; no successful creation toast from proposal ACK. MQ03 identifies batch/file/sheet and decision reason but no structured resolver group/issue target. Feedback now opens retained Step 3 and selects the captured sheet. A structured affected mapping/issue/group reference is recommended if exact automatic focus is required; free text is never parsed into business actions.

## P2 — Notification destination expressiveness

NF object.type publishes membership, permission_request and mapping_submission. No generic Import or invitation destination is registered. A missing link can conflate source unavailable/access loss; FE displays neutral unavailable unless actual link availability explains it. Existing objects, current Store, allowed path and submission version are wired. Add registered objects/projections and explicit availability reasons if the other frozen examples are required. Read acknowledgments remain separate from business actions.

## P2 — Permission request and invitation-decline action design

PR01–04 and IN01 are verified typed callable services. Existing permission-request notification can open PR03 context and current member administration. Frozen design does not sufficiently define selecting/submitting/partially approving/cancelling a permission request, or explicit invitation decline confirmation/reason/recovery. Do not substitute direct grant edits for PR04 or automatically decline. Keep those writers at service boundary until MagicPath defines their product actions. This is a design/FE integration gap, not a missing BE endpoint.

## P2 — Today snapshot lacks complete frozen projection

D01 provides section availability/completeness, attention counts/ingredient IDs, task refs, current readiness and latest Run. It does not publish a seven-day demand/shortage/arrival outlook or a typed pending procurement decision with cost/count. FE uses real available sections and normal navigation; unknown is not zero/calm. Latest Run is clearly labeled and not assumed pending. Suggested additions: published outlook/day projection and a pending-decision projection with actionable resource state/current permission. No fake samples or derived forecast is produced. AI/What-if/Draft PO remain outside runtime scope.

## P2 — Preview domain decisions / display projections

Sales and Supplier decisions are included at commit; no separate save-before-commit operation exists. Global blockers persist in FE and persisted Review is distinct. Friendly immutable source/entity/field labels and baseline-at-version evidence should be published where current DTOs lack them; FE must not resolve historical labels from unrelated latest entities. Generic declaration editors retain existing descriptor limitations. These remain existing FM-007/010/011 rather than new duplicate gaps.

## Verification limitation

No live Owner/Staff accounts, deployed BE build or mail delivery evidence was exercised in this pass. All newly reported browser acceptance is controlled HTTP, with live inventory entries marked NOT_RUN. Follow the existing [live E2E protocol](../docs/testing/017_Live_BE_FE_E2E_Protocol.md) for real execution and authoritative data readback.
