# 018 — Backend capabilities at the service/application-state boundary

**Creation date:** 16/10/2026. **General context:** implement every published backend capability that can be prepared without new UX/business decisions; surfaces being redesigned stop at typed services/application state. No routes, components, product interactions or feature entry points are added or changed.

## Delivered boundary and source authority

- [Public service entry point](../../../src/features/backend-capabilities/index.ts), [HTTP adapters](../../../src/features/backend-capabilities/capabilities.data.ts), [state helpers](../../../src/features/backend-capabilities/capabilities.state.ts).
- Source: exact [016 OpenAPI](../../../contracts/016/openapi.main.json), main `869eaec914aa6905d6b935889afebe7d973004ae`, SHA256 `790443d80350cc597c7c06179309e43303ba558de34017ea1dd4113de71fc1ee`. This is not evidence of a deployed SHA or the reported `b0db90c`.
- **73 callable operations / 66 paths**, including health, with **467 referenced schemas** closed transitively. [Generated coverage inventory](../../testing/BACKEND_CAPABILITY_COVERAGE.json) lists every operation, method, path, response mode, state boundary and live-verification status.
- Every operation has a typed input/output and a callable `api.operations.<operationId>`. Named groups cover onboarding, Store creation/discovery, invitation acceptance/decline, notifications, permission requests, mapping submissions/decisions and exports. Operations with existing UI callers also have an additive main-contract service; this does not switch those callers automatically.
- Existing Auth/Store/Planning/Operations feature adapters retain their 011 pins; Import/SU01/Import R01 retain their 016 runtime integration. The new explicit `capabilities` consumer independently pins 016. Full current-contract service coverage is distinct from whole-app runtime parity.
- The service module is not imported by existing routes. No automatic request, mutation, email, navigation, Store selection, permission refresh, approval, commit or polling occurs at construction.

## Capability audit and implementation

**New or deferred families now callable without UI decisions:**

- **A02/A05/A06/A07:** register, request/resend verification, complete EMAIL_VERIFY, request password reset. Public cookie transport; no session CSRF, invented callback route or implicit login/Store creation. N7 SETUP/RESET remains a separate operation. Generic 202 acceptance does not prove email delivery/account existence. A05/N7 have no automatic replay.
- **T03:** explicit name/timezone/currency and caller-owned idempotency key; visible ASCII keys of length 1–128 are accepted, not restricted to UUID. Returns the Store receipt; does not select it, seed business data or fabricate membership/session refresh.
- **IN01:** decline invitation with body proof/reason, current session/CSRF, idempotency and quoted invitation CAS. No invented accept/decline screen.
- **NF01–03:** account inbox, scoped unread count and read/unread mutation; snapshot/current-scope validation and notification CAS. Reads do not navigate, accept invitations, change grants, approve profiles or commit imports.
- **PR01–04:** submit/list/detail/approve/reject/cancel permission requests; preserve permission catalog, current/submitted grants, request revision, reasons and actual added permissions. No optimistic union into local session grants or guessed permission picker.
- **MQ01–03:** one-profile submit/withdraw, scoped queue and captured detail/evidence; preserve exact import CAS, proposal/mapping/submission revisions, eligibility, full spec/evidence and allowed actions. Explicit optional read fences reject changed submission/version/spec digest or repeated evidence cursors.
- **N5:** includes `request_changes` as well as approve_activate/reject/retire and exact submission fences. Existing production UI still supports its previously wired subset. No new decision button, automatic approval or batch commit is added.
- **D01:** typed section reader, current authorization/partial/null sections and snapshot preserved. Today UI remains underconstruction; no dashboard or substitute operational interpretation is created.
- **EX01:** retained export discovery with option/status/cursor/snapshot filters. `downloadRetained` uses N11's registered path and verifies receipt byte count/SHA256; it does not follow arbitrary `download_url` values.
- **SU01:** existing runtime integration remains; the additive service exposes its full current query/response contract independently.

**Existing families also covered by the main service boundary:**

- Health and A01/A03/A04; N7; T01/T02; N12–N19 memberships/grants/audit/invitations.
- P01/P02 Menu; V01–V04 Inventory readers; N6 actual receipts; N8 threshold; N20–N22 recipe schedule preview/commit/retained change.
- I01–I06 Import draft/upload/analyze/read/process/completion; M01–M04 mapping summary/list/descriptors/resolutions; J01 jobs; H01/H02 history.
- N1–N4 planning requirements/budget, R01 readiness, C01/C02 context/generation, C03/C04/C05/C08 retained results/explanation, N9 retained Run history, N10/N11 exports/download.
- Supplied Planning helpers serialize the same typed C02 request into C01/R01 contextual queries without changing field presence, array order, custom/saved/default mode or known-zero budget. Default reads remain available explicitly through C01/R01; helpers do not turn default configuration failures into supplied-request blockers.

There is no supplied public API for Decision Assistant/chat, What-if/scenario lifecycle, Draft PO/order placement, generic file replace/delete/unseal, separately saved Preview domain decisions or generic negative mutation-outcome proof. No endpoint or product behavior is invented for them.

## Transport, validation and application state

- Strict structural validation uses operation-specific path/query/body schemas and transitive response envelopes. Unknown keys are rejected where the source declares `additionalProperties=false`; enums, dates/timestamps, UUIDs, bounds, binary files and discriminated alternatives remain typed/validated.
- Generator rejects unsupported schema keywords/formats rather than silently weakening validation. `--check` compares generated types, schemas, operations and coverage inventory against the hash-pinned source.
- Cookie/no-store/no-referrer transport; protected mutations use the current shared CSRF owner. Public auth operations stay public. Only declared key/CAS/proof headers are supplied; no bearer token or browser-owned Origin override.
- Callers provide keys/revisions explicitly. Budget N4 requires exactly one create-only `If-None-Match: *` or update `If-Match` precondition. Quoted revisions and published header limits are checked before dispatch.
- I02 preserves named File bytes, multipart boundary and one explicit unique client file ID per file. It does not replace accepted bytes or select/seal a source set. JSON bodies are not default-filled, normalized or silently changed on replay.
- Only documented success HTTP statuses are accepted. Health has its raw JSON schema, A04 requires empty 204, N11 validates PDF type/signature, and domain errors remain shared typed `HttpError` values.
- Readers reject echoed wrong resources/Store, requested snapshot mismatches, duplicate identities in a page, repeating cursors and invalid pagination; optional MQ detail pins keep captured evidence stable. These checks supplement server authorization, not replace it.
- Read state is one explicit scoped resource: caller supplies an actor/session/Store scope, newer loads cancel/fence older ones, and clear removes loaded data. Results are copied so consumers cannot mutate retained state. No guessed UI empty/error layouts or page aggregation is introduced.
- Mutation state captures one immutable logical intent and distinguishes pending/succeeded/rejected/unknown. A receipt/schema failure, transport/5xx, timeout or malformed gateway response remains unknown; a valid backend 4xx rejection or local preflight/CSRF failure can be rejected.
- Pending/unknown blocks competing intents on that state instance. Exact replay is explicit and only available to keyed operations; public auth/token operations and I02 do not replay through this helper. Receipt-known success cannot replay. There is no automatic retry or negative-outcome inference.
- State is memory-only. Dispose forgets secrets/intent without cancelling a write or asserting rollback. It is not a durable recovery manager or substitute for operation-specific retained-state proof; after teardown, callers must use authoritative readers and cannot reconstruct keys/bodies by guessing.

## Using the boundary while UI is redesigned

```ts
import {
  createBackendCapabilitiesApi,
  createCapabilityReadState,
  createCapabilityMutationState,
} from '../features/backend-capabilities'

const api = createBackendCapabilitiesApi(apiBaseUrl)
const inbox = createCapabilityReadState(api, 'NF01')
const submitMapping = createCapabilityMutationState(api, 'MQ01')
// Future callers explicitly provide typed input, current session/Store scope,
// server versions and caller-owned intent keys. Construction performs no I/O.
```

Read/input/output types are exported from the public entry point. `operations` exposes the entire operation set; named service groups offer the same signatures. The shared session hooks must be owned by the real Auth layer when protected calls are made.

UI implementation must still audit the latest relevant MagicPath revision and follow [.agents UI authority](../../../.agents/rules/ui-magicpath-authority.md). This pass creates no production placeholder flow and claims no fresh visual audit. Current missing designs, source-semantics questions and underconstruction scopes remain as recorded. API-only service preparation does not close FM-003 or FM-013–016, implement handoff/notification/onboarding UX, or authorize live mail/account/data mutations outside the task.

The existing mixed-pin UI adapters remain a separate migration task: wire closures, presentation projections, callers and fixtures must advance together when their surfaces are ready. Future callers should load capabilities at the appropriate feature boundary; the broad generated schema registry is currently outside existing route bundles.

## Verification

- `npm run check:capabilities-wire`: PASS, all 73 operations and 467 schemas, exact source and generated inventory.
- `npm run test:capabilities`: **53/53 controlled tests** covering new service families, typed operation completeness, HTTP modes/statuses, validation, CAS/snapshot/resource fencing, immutable replay, unknown outcomes, scoped cancellation and retained PDF hash. Includes **28 published synthetic main response examples** preserved unchanged across the boundary, including Planning captured zero, null/unknown digests, forecast/readiness assessments and retained source references.
- Regression: Auth **26/26**, Store **118/118**, Planning **77/77**, Operations **30/30**, Import **133/133**. Together with the new suite: **437 passing tests**. These are unit/boundary/workflow/component/controlled fixture checks, not live persistence.
- TypeScript and production build PASS. Existing large-chunk warning remains; lint retains the two existing set-state-in-effect warnings in unchanged OnboardingPages/RecipeSchedulePage.
- Contract preservation PASS: 252 historical files byte-identical; baseline 54/50 and main 73/66 pins preserved. No dependency changes, commit/push, backend deployment or live business mutation.

Service coverage is complete for the pinned published operation set. Product UI coverage, per-operation business acceptance and live E2E acceptance are separate; the inventory marks every operation `uiChange=NONE`, `liveVerification=NOT_RUN`.
