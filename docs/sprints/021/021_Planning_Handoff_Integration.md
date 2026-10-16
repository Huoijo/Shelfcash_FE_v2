# 021 — Planning Summary / Assistant / PDF handoff

Verdict: **PARTIAL PRODUCT INTEGRATION — COMPLETE SUPPORTED API/APPLICATION BOUNDARY**.
Backend **SOURCE_READY / NOT_DEPLOYED**, serving runtime **UNVERIFIED**. Live API and full-app E2E **NOT_RUN**.

## Handoff authority

Supplied directory: `BE_answer/17_10_earlymorning/shelfcash-fe-summary-pdf-chat-preview-a17d153`.
Source main local `a17d153feccfa96de34002dd536bf9381c01f219`; deployment and remote server were not verified. All 20 supplied manifest entries verified. No ZIP was supplied at this path, so ZIP CRC was not tested. Documents contain reviewed uncommitted overlays; their manifest hashes, rather than the source commit alone, authenticate these bytes.

Pinned [OpenAPI](../../../contracts/021/openapi.main.json), SHA256 `68204af15000f3c79da135ecd56435becf30b6ef069e7338bb93f87552869a5b`: **76 operations / 69 paths**. Independent comparison preserves every operation and every schema except the four supplied version properties in ExportAccepted, SummaryAnswer and SummaryDiagnostics. PDF accepts /1-/2-/3; Summary accepts the supplied renderer/prompt/validator versions. [Pin manifest](../../../contracts/021/pin.json) locks the exact approved properties. The recovery policy is semantically unchanged (28 rules); the original generated policy pin remains valid. Import feature pins/flow remain unchanged.

Primary documents inspected: START_HERE capability response; exact OpenAPI; Planning §§15.4/17/18; Assistant feature/provider limits; examples and request sequences; authorization/general API and recovery policy/audit. Examples are historical or ILLUSTRATIVE/OFFLINE/DTO-only as marked by BE, not live acceptance.

## Existing frontend audit and integration map recorded before editing

- `/forecast/planning` owns setup/results and URL Run locator; `/forecast/planning/history` reopens retained Runs. AppShell/routing stay intact. Results already supplies PlanExport and an inactive Assistant entry.
- Central `shared/http/httpClient.ts` owns cookie credentials, fresh CSRF, cancellation, timeout and normalized HttpError. Capability adapters validate pinned schemas and identity. There is no React Query dependency: existing workflows use subscriptions, memory state and explicit readers; capability hooks own scoped reads/mutations.
- AuthContextValue supplies current actor/session lifetime; CurrentStore supplies current Store, effective permissions, authorization version and change guards. Planning reads require all three result/money rights; PDF additionally requires planning.export. Role names do not imply grants.
- Existing FlowDialog/FlowState/native dialog, local loading states and HTTP error presentation are reused. This pass creates no toast system, shell, modal family or AI visual language. Server notifications remain unrelated.
- Existing PlanExport implements N10 -> J01 -> N11, bounded polling, URL locators, artifact size/hash verification; RetainedExports implements EX01 snapshot/cursor paging and allowed-actions download. The gap was durable intent/receipt recovery and the old PDF /1-only validator.
- Existing generic IndexedDB journal uses strict transactions and atomic reservation; dedicated T03 has its own owner and remains untouched. New Planning orchestration adopts only N10/AS01/AS03 policies. No scattered localStorage or new persistence framework.
- Existing tests use Vite-bundled Node suites and Playwright controlled API fixtures. A separate isolated component browser runner avoids application/BE servers and the host's application-worker/PID path; it does not establish that full app E2E is available on this host.

## Integration status

- **Planning Summary — PARTIAL product / COMPLETE boundary.** AS01/AS02, vi/en, simple/technical, returned text/claims/references and legacy/current versions preserved. Running/completed/failed generation, bounded retained GET polling, explicit refresh and same-key replay implemented. Safe generation ID persists atomically with ACK, so a lost UI/URL update does not lose the locator. No production UI caller until PL-01 states are designed.
- **Assistant — PARTIAL product / COMPLETE boundary.** One C03-pinned Run/evidence scope; read/explain/compare only. No GET history, fake server thread, operational commands, model/version selector or provider activation. Returned context drives follow-ups; recent complete messages stay within six messages/4000 code points, each message/question within 2000 code points; request UTF-8 body capped at 32KiB. No backend business reasoning is reconstructed.
- **Clarification — PARTIAL product / COMPLETE boundary.** Explicit ingredient/option/Product candidate validation; continue the original question with a new turn key after a known response. No automatic candidate choice or retry for clarification. UI selection awaits canonical design.
- **Deterministic fallback — PARTIAL product / COMPLETE boundary.** Valid answer/source/diagnostics are retained independently of Planning status. REGENERATED is not a FE retry instruction. No synthetic replacement answer is generated.
- **PDF — COMPLETE within existing supported flow.** Current renderer receipts are accepted. Durable N10 pre-dispatch reservation, exact replay and safe export/job IDs restore into the existing confirmation/job/download UI. Restored original option is displayed while retry is locked. Backend creates all business PDF content; the FE only downloads and verifies it.
- **Retained export discovery — COMPLETE within existing surface.** EX01 paging/snapshot/availability/allowed actions and N11 size/SHA256 verification retained. Fresh list/download denial removes accumulated protected rows; page-level denial hides the protected Planning result. No creator name is invented from a UUID or current catalog, and no new metadata/control layout is authored.
- **Intent journal — COMPLETE selected scope.** N10 and AS01 full reviewed body; AS03 metadata only. Actor/Store/operation/resource/original key/hash/time/state retained; only safe receipt UUIDs accompany ACK, never raw responses, credentials or excluded text. Storage failure blocks dispatch. Confirmed receipt IDs and terminal state share one transaction.
- **Uncertain recovery — PARTIAL by supported contract.** N10/AS01 recover across reload/restart with original identity. AS03 can exact-replay only while its original body remains in memory; after reload the metadata-only policy cannot reconstruct it and blocks replacement. No safe negative-proof endpoint exists. Live GENERATION_IN_PROGRESS remains unknown; AS03's explicit immutable GENERATION_FAILED is a terminal failure, allowing only a deliberate new turn after review. No automatic POST/replay/expiry loop.
- **Store scope — COMPLETE for new boundaries.** Actor/session/Store/version changes fence late responses; Planning and export component owners remount on actor/session identity. A foreign-Store Run cannot mount export controls. Persisted intent never migrates to another actor/Store.
- **Permission handling — COMPLETE for new boundaries.** Fresh 401/403/404 and evidence conflict invalidate protected conversation/history; late responses cannot republish facts under changed authority. N10/J01/EX01/N11 denial hides protected export/result surfaces. Unknown delivery is preserved despite denial. Permission grants remain backend-authoritative.

## Canonical design audit and remaining UI work

Read-only current MagicPath Results component `458423352311304192`, revision `461899945612550144`, project `458079658328604672`, verified against the current component list. Copilot source defines first-open, composer/suggestions, answer/evidence, loading, permission and unavailable views. It does **not** define clarification candidate selection, stale-context reset, metadata-only lost-ACK Chat recovery, or Summary generation/mode/language lifecycle. Prototype business values and budget proposal actions are not ported.

The complete Assistant product entry stays parked; no new placeholder flow is invented. See [specific design request](../../../FE_ask/021_Planning_Assistant_Design_States.md) and [PL-01 register](../../status/FOUND_MISSING_UI_V1.md#pl-01--retained-planning-summary--assistant-interactions). This task reopens bounded retained-plan explanation integration, not global AI/What-if/Draft PO.

## Files changed

- API/domain: `contracts/021/`, wire-source/version compatibility gates, generated capabilities/Operations wire, Assistant history/body/response guards, capability coverage inventory.
- Application state: `planning.assistant.ts`, `planning.intent.ts`; scoped Summary/Chat, explicit candidates, fallback, stale/authority fences, retained generations, terminal-vs-unknown outcomes.
- Persistence/recovery: shared `recovery.journal.ts` adds allowlisted receipt IDs to atomic ACK; `usePlanExportIntent.ts` binds N10 to native storage and the existing UI. Dedicated Store writer is unchanged.
- UI: existing PlanExport, RetainedExports and PlanningPage only; durable recovery wiring, original-option display, actor/session/Store fences, denial-driven redaction. No new Assistant UI, CSS, routing, IA or setup redesign.
- Tests: `planning-assistant.test.mjs`, Planning test runner, isolated `verify-planning-021-browser.mjs`.
- Docs/rules: this receipt, current register, FE_ask/021, testing/sprint indexes, evidence receipts; reusable backend truth/recovery policy linked from AGENTS.md. Historical register remains byte-identical.

## Verification and limits

**519 controlled Node tests PASS**: Planning 119 (40 added), capabilities 83, Operations 30, Import 143, Store 118, Auth 26. These use explicit fixtures/intercepted fetch/local state, not a live server.

**12 controlled component browser cases PASS** on native macOS arm64 Chromium: unknown delivery, real IndexedDB reservation, reload, clean isolated browser restart, explicit exact replay, renderer /3, J01 processing/completion, verified synthetic N11 download, receipt-ID restore without URL, EX01 rediscovery/download, N11 denial, EX01 pagination denial, read-only Staff and foreign Store. Several assertions share one case. Every HTTP request is intercepted; **zero unhandled/live requests**. This is actual production export component behavior under synthetic providers, not a full app journey or real authentication/BE acceptance. The small synthetic PDF verifies transport/hash behavior, not backend PDF layout/content. Screenshots capture four meaningful export states; no Assistant UI screenshots or visual-convergence PASS are claimed.

Build, lint and all seven contract/wire gates PASS. Lint retains two existing effect warnings (OnboardingPages/RecipeSchedulePage); build retains the existing large-chunk warning. No application worker, DB, provider, mail, live BE endpoint, restart/migration, external account or real business mutation was used.

Detailed [verification](../../testing/planning-021/VERIFICATION.json), [browser receipt](../../testing/planning-021/BROWSER_VERIFICATION.json), and screenshots in that directory. Repeat with `npm run test:planning` / `node scripts/verify-planning-021-browser.mjs`.

## Concrete deployment/acceptance blockers

- Verify the actual serving source/schema and current authorization before testing AS01/AS02/AS03, N10 renderer /3, J01, EX01 and N11 live. The preview does not prove endpoints are absent or available; status is CONTRACT_INTEGRATED / LIVE_NOT_VERIFIED.
- Supply the PL-01 MagicPath interactions, then bind the prepared application owner and test complete Summary/Chat user journeys. Missing UI states remain MISSING, not a temporary fallback.
- AS03 reload recovery must respect the existing text-persistence exclusion and lack of a message GET. No new policy is assumed; operation-specific design/capability is needed for a richer continuation.
- Real provider wording, backend PDF content/layout, actual worker/deployment, Owner/Staff live authentication, permission revocation and real cross-Store acceptance remain NOT_RUN. Native controlled browser restart does not prove OS crash/worker recovery, shared-device/XSS or cross-device recovery.

Regression: Import/Input, auth implementation, Store administration/invitations, notifications, Planning setup, global navigation and backend source/data were not changed. Shared contract snapshots and existing journal metadata were extended only as described. No commit/push performed.
