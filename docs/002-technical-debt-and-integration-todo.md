# Technical Debt & Integration TODO — ShelfCash FE v2

ID: `#002` · Created: 10/10/2026 · Baseline: Milestone 03

## General context

> Update Milestone10, 11/10/2026: multi-Store selection and `/store` UI are implemented, including Owner Staff grants/invitations and known budget ceiling; Cửa hàng is no longer disabled. Current V2 handoff reports public Auth/Store/Staff/config implementation, so older CONTRACT_ONLY/missing-Store-switcher statements below are historical, not current blockers. Live acceptance remains open during reported maintenance. New actionable gaps are unsupported profile/settings writers, ambiguous initial ceiling absence and recipient/browser acceptance; see [007](007-store-workspace-e2e-integration.md). No request to invent Store CRUD or re-open settled invitation/grants semantics.

Track evidence-backed work required before staging acceptance, production or deeper integration. This register does not authorize implementation or add a feature wishlist.

Existing: FE A01/A03/A04 session/bootstrap/CSRF and API AuthGuard, T01/T02 boundary with single-default Store resolution, AppShell, Import Batch I01/I02/I04/I03 with local selection/HDSD, H01/H02, read-only Kho V01–V04 and Menu/Recipe P01/P02 boundaries. Auth/Store FE plumbing and Import mechanics are implemented; actual compatible BE routes, live/staging/production acceptance and Store selection UI remain outstanding. Completed foundations are not reopened as missing work.

Authority: [handoff README](../api-contract-v1/README_VI.md) → [V1 aggregate §1](../api-contract-v1/SHELFCASH_API_CONTRACT_V1_VI.md#authority) → root [AUTH current V1](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-v1) / [IMP](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md), followed by the accepted [Import Batch mechanics/evidence supplement](../api-contract-v1/IMPORT_BATCH_MECHANICS_RESPONSE_VI.md). Historical references/MagicPath do not override V1. The supplement's §9.1a backlink is missing from this canonical snapshot; accepted receipt-set clarification is additive, with no behavior conflict identified. FE/BE must use the same handoff version; design review/interception is not live HTTP evidence.

`BLOCKED_BY_BE` means awaiting verified contract-compatible endpoints, not a new claim about an external server outage. Staging infrastructure requirements below are project operational requirements, not a V1 hosting topology.

## A. Authentication & route protection

Status: `FE_FOUNDATION_IMPLEMENTED / LIVE_ACCEPTANCE_BLOCKED_BY_BE` · Owner: FE + BE · Required before: authenticated staging acceptance and production.

Implemented FE: A01 sends the canonical email/password/remember-me body; successful A03 is authentication authority after login and refresh. AuthProvider owns in-memory user/session/CSRF and explicit loading/authenticated/unauthenticated/error states. API AuthGuard wraps StoreGate and AppShell for `/imports`, `/imports/history`, `/inventory` and `/menu`. Unresolved sessions never render protected content. Mock is a distinct labeled DEV-only preview without session/CSRF and cannot be enabled in a production build.

Shared HTTP includes cookies/no-store, session-owned mutation CSRF, canonical errors/request references and protected401 notification. Import consumes the prepared session token source. Missing CSRF fails before fetch; pre-session A01 and GET do not require mutation CSRF. A04 uses a bodyless HTTP204 boundary, then clears FE session/Store. Failed logout remains visible without claiming server revocation. Login `INVALID_CREDENTIALS` does not trigger global redirects. No token storage, bearer token, fake/public/env token, automatic token renewal or mutation replay.

Readiness audit, 11/10/2026:

- A01 `/api/v1/auth/login`, A03 `/api/v1/auth/me` and A04 `/api/v1/auth/logout`: `CONTRACT_ONLY`; current AUTH introduction explicitly says auth/business HTTP absent, and §5 lists credentials/session/public routes/OpenAPI/security acceptance as implementation backlog.
- T01 `/api/v1/stores` and T02 `/api/v1/stores/{store_id}`: `CONTRACT_ONLY`; aggregate references only internal membership/Store persistence, not public route implementation or current authorization enforcement.
- CSRF issuance, opaque HttpOnly session cookie, credentialed CORS and Origin checks: `CONTRACT_ONLY`; AUTH §1 defines them and §5 states acceptance has not run. No supported backend capability is classified `IMPLEMENTED` or `VERIFIED`.
- This FE checkout has no backend source/OpenAPI/server configuration; no obvious ShelfCash backend sibling checkout was found on Desktop and no listener existed on configured local port8000 at audit time. Historical health-only evidence and Import supplement's assumed valid Auth do not establish current readiness. Actual live acceptance is `BLOCKED`; this is not a claim that an identified external backend is down.

What remains: Supply compatible real A01/A03/A04/T01/T02 and security/session implementation, then verify login→A03→T02 plus one safe authenticated GET. Verify Secure/HttpOnly/SameSite=Lax/Path=/ with no Domain, real CSRF issuance/rotation, current grants/revocation, exact Origin enforcement and credentialed CORS/header allowlists. Local development needs HTTPS or explicit backend loopback cookie policy; FE does not weaken production cookie rules or fabricate Origin. A04 must return204 without a body. Do not declare live login/logout ready from controlled-response tests.

Validation / Definition of Done: Real login, refresh/bootstrap, expiry and logout (including expired session) work; unauthenticated deep links are blocked without redirect loops; Origin/CSRF failures and rotation match V1; no secrets persist in FE storage/logs.

Evidence: [AuthProvider](../src/features/auth/AuthProvider.tsx), [AuthGuard](../src/features/auth/AuthGuard.tsx), [Auth boundary](../src/features/auth/auth.data.ts), [LoginForm](../src/features/auth/LoginForm.tsx), [AppRouter](../src/app/AppRouter.tsx), [HTTP helper](../src/shared/http/httpClient.ts); AUTH current V1 [introduction](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-v1), [§1 session](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-session), [§3 routes](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-routes), [§5 acceptance](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-acceptance), [handoff readiness limits](../api-contract-v1/README_VI.md). Guard QA demonstrates FE behavior only.

## B. Store context

Status: `FE_SINGLE_STORE_IMPLEMENTED / LIVE_VERIFICATION_BLOCKED / SELECTOR_OUT_OF_SCOPE` · Owner: FE + BE · Required before: real Store-scoped acceptance and separately scoped Store switching.

Implemented FE: StoreProvider resolves only A03's single accessible default via T02 and exposes narrow current Store ID/timezone/membership context. Import, History, Kho and Menu consume it; environment Store scope has been removed. No Store shows support guidance; multiple Stores/defaultnull remain unresolved without guessing the first T01 page. T01 adapter/validation exists, but this milestone adds no Store switcher. Store selection is local FE scope, not a global session mutation. Kho timestamp formatting uses validated Store timezone when present, with a labeled UTC fixture fallback; History/Menu retain their response timezone semantics and date-only facts are unchanged.

What remains: Verify real A03/T01/T02, current membership/grants and Store timezone/currency/date against the same backend contract. Separately design and implement explicit multi-Store selection, including full list pagination, old request cancellation and resetting feature selections/cursors on switch. Do not freeze Store into a session or add environment fallback. No cache/global-state library is implied.

Validation / Definition of Done: Zero/one/multiple accessible Store flows work; no-Store login shows support guidance. Switching during a pending request cannot display the previous Store's results or reuse its selections/cursors; separate tabs can select different Stores. Inaccessible scope and denied actions retain V1 404/403 behavior.

Evidence: [StoreProvider](../src/features/store/StoreProvider.tsx), [Store boundary](../src/features/store/store.data.ts), [Store validation](../src/features/store/store.validation.ts), [History data boundary](../src/features/import-history/importHistory.data.ts), [History page](../src/pages/import-history/ImportHistoryPage.tsx), [ImportWorkspace](../src/pages/imports/ImportWorkspace.tsx); AUTH current V1 [§3 T01/T02 and selection](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-routes).

## C. Staging environment

### C1. Isolated integration environment and test identities

Status: `BLOCKED_BY_DEPLOYMENT` · Owner: Deployment + BE, with FE verification · Required before: live integration acceptance.

Why: No staging FE/BE/DB provisioning or seed/reset configuration is present in this repository; external infrastructure availability is unverified.

What remains: Supply staging FE/BE, isolated database, internal Store and real Owner/Staff test accounts. Provide safe, repeatable staging-only seed/reset tooling and representative Import/History data. Keep operator tooling separate from product permissions: no Owner/Staff reset privilege, direct FE database access or shared demo credentials. Product onboarding remains assisted provisioning/credential completion; Staff membership follows real invitation/acceptance, not fake grants.

Validation / Definition of Done: Environment endpoints and versions are recorded; Owner/Staff can authenticate with different permissions; test data can be reproduced/reset only against a verified non-production target. Credentials stay outside source/public `VITE_*` settings; tooling cannot accidentally target production.

Evidence: [README development/configuration and integration limitations](../README.md), [Vite config](../vite.config.ts), [package scripts](../package.json); AUTH current V1 [§2 assisted provisioning/reset](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-assisted), [§6 Staff invitation](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-invitations). Environment isolation/tooling is a staging requirement, not a substitute for these product workflows.

### C2. Request correlation for integration failures

Status: `FE_REFERENCE_IMPLEMENTED / LIVE_CORRELATION_PENDING` · Owner: FE + BE · Required before: staging troubleshooting/acceptance.

Implemented FE: Shared HTTP preserves a validated safe request reference from failure `meta.request_id` for support/error handling. Existing feature response validation is retained. Actual correlation with backend logs has not been demonstrated.

What remains: Correlate real success/error request references with BE logs. Use V1 `meta.request_id`; additional trace-ID transport needs operational agreement, not an invented field or tracing-platform dependency.

Validation / Definition of Done: A real staging success and error can each be located in BE logs from their request reference without logging passwords, cookies, CSRF tokens or raw uploaded data.

Evidence: [History validators](../src/features/import-history/importHistory.validation.ts), [HTTP helper / HttpError](../src/shared/http/httpClient.ts), [HTTP envelope types](../src/shared/http/http.types.ts); AUTH current V1 [§1 envelope](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-session), IMP [§9 wire envelope](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#wire).

## D. SPA deployment fallback

Status: `BLOCKED_BY_DEPLOYMENT` · Owner: Deployment · Required before: staging/production deep-link acceptance.

Why: BrowserRouter needs host fallback to `index.html`. The README documents it, but hosting rewrites are absent; Vite dev-server refresh is not production evidence.

What remains: Configure SPA/history fallback at the chosen hosting layer (Nginx, Cloudflare Pages, Vercel, Netlify, static-host rewrites or equivalent). Keep business API routes and missing static assets separate from the fallback; do not return the SPA for API requests.

Validation / Definition of Done: Direct open, refresh and new-tab open of `/imports/history`, `/imports`, `/inventory` and `/menu` return the frontend entry document without server-side 404, then resolve through Router/auth. API paths still return API responses; missing assets do not return HTML masquerading as assets.

Evidence: [README hosting requirement](../README.md), [BrowserRouter](../src/app/App.tsx), [routes](../src/app/AppRouter.tsx), [Vite config](../vite.config.ts), [package scripts](../package.json). Hosting configuration remains absent/unverified, not proven misconfigured.

## E. Import upload contract validation

Status: `FE_IMPLEMENTED / LIVE_VERIFICATION_PENDING` · Owner: FE + BE · Required before: staging/production acceptance; depends on A/B/C.

Resolved: Root V1 confirms CSV/XLSX, 20 accepted logical files/batch, 20 MiB/file and 100 MiB accepted source bytes/batch. Accepted mechanics now settle multiple I02 calls into one draft, ordered partial admission, rejected files consuming no accepted quota and opaque evidence/receipt-set revisions. These are no longer BE clarification blockers. Content dedup does not merge logical files or release quota; no remove/replace/DELETE/quota-release workflow exists.

Implemented FE: Picker/drop retain prospective local-selection checks and preserve the old selection on invalid additions. Explicit I01 uses only `data_date`, then I04 establishes canonical state before paired multipart I02. Every result is shown: 200 can be partial; all-rejected 422 `UPLOAD_REJECTED` commits receipts/revisions and is distinct from request-level 422. I04 is refreshed after receipts, and required whole-batch quota/source_set/actions remain independent of file pagination. Accepted files are immutable in the UI; local files remain removable before submission. No unspecified `files_limit` is sent. Runtime validators cover envelopes, I01/I02/I03/I04, receipts, quota, pagination, UUIDs and opaque versions.

Retry/state: Exact UUID key/client IDs/order/filenames/File bytes remain in memory for uncertain retry; no automatic new-key duplicate upload. I04 reconciles canonical state after outcomes/conflicts. Local remaining quota is advisory; concurrent activity can change admission. A deterministic contract-shaped mock adapter exists only for labeled UI/QA, isolated to the mounted workspace with no HTTP, hidden persistence or worker. API never falls back to it.

What remains: FE session-owned CSRF/current Store are wired; compatible real Auth/Store and local/staging I01/I02/I04/I03 remain to be verified against the same handoff version. The supplement reports targeted BE tests but FE controlled responses do not independently verify those routes. Exercise actual sniffing, cumulative count/bytes, partial/all-rejected, response loss/503, authorization, stale pages and near-limit transport/resource failures. Expanded-XLSX/sheet/row/column parser guards remain separate analysis limits, not FE upload quota. Production/load verification is still open.

Validation / Definition of Done: Real authenticated staging evidence proves accepted quota across repeated calls, independent paginated receipts, no duplicate quota on same-intent retry and immediate seal lock; request-level errors do not masquerade as committed receipts. FE boundary/browser QA proves handling only and cannot close live verification. Final local check results belong in the architecture validation record.

Evidence: [data boundary](../src/features/import-data/importData.data.ts), [runtime validation](../src/features/import-data/importData.validation.ts), [workflow](../src/features/import-data/importData.workflow.ts), [file checks](../src/features/import-data/importData.files.ts), [batch UI](../src/features/import-data/components/ImportBatchPanel.tsx), [ImportWorkspace](../src/pages/imports/ImportWorkspace.tsx); IMP [§6](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#schemas), [§9.1](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#wire), accepted [mechanics supplement](../api-contract-v1/IMPORT_BATCH_MECHANICS_RESPONSE_VI.md).

## F. Real Import workflow

Status: `FE_CONTINUATION_PARTIAL / CONTRACT_GAPS / LIVE_BLOCKED` · Owner: FE + BE · Required before: complete Import business workflow; depends on A/B/E.

Milestone08 adds Mapping/Review/Preview/Commit/Result presentation, M01–M04/I05/I04-preview/J01/I06 boundaries and a memory-only continuation controller beside the preserved upload workflow. Canonical progress/actions, pinned snapshots, frozen uncertain intents and durable I06 outcomes are implemented as FE controls. API mapping/commit remain fail-closed for underspecified rich DTOs; no live success is claimed. The fixed already-approved inventory mock is explicit DEV/QA only. [A–M implementation/evidence report](./003-import-flow-integration.md) records the exact first gaps and verification.

Preserved staging scope: I03 prepares a coherent complete read set, requires explicit accepted/rejected acknowledgment and sends current quoted `If-Match`, `file_set_version`, full accepted IDs and all rejected client IDs. Mixed-version pages are discarded; 412 requires fresh I04 and reconstructed confirmation. Response202 seals immediately; failure never reopens upload. Continuation now polls J01 and reconciles I04; its explicit DEV fixture extends the default staging-test fixture. No business completion is implied by analysis acceptance. Current read-only MagicPath Mapping/Completion attribution is recorded in report #003.

Memory/resume limitation: Batch identity, selection/date and exact retry intent survive Import ↔ History only. Refresh or leaving the workspace destroys them; no canonical active-draft resume route is defined in the current UX. Do not invent localStorage receipts, resumed batches or new retry identities after refresh. A later resume milestone must use an explicitly defined canonical mechanism and authoritative I04 reconciliation.

What remains:

- Live Auth/Store and authenticated acceptance for the implemented I01/I02/I04/I03 flow; FE AuthProvider/AuthGuard/Store context now exist. No remaining semantic blocker about batch accumulation/admission/revisions. Store switcher and canonical writers remain absent.
- M01–M04: finalize exact issue/descriptor/binding/profile DTOs with BE, then enable the currently blocked API confirmation branch; implement separately required Owner-only N5 full spec/diff/evidence review. M04 is never activation.
- I05/I06: finalize complete preview domain/count/binding DTOs, supplier action pagination/confirmations and exact commit acceptance receipt, then verify atomic writers/receipts. Sales replacement/disjoint-merge confirmation UI remains disabled. FE preview/retry/result controls do not prove backend atomicity.
- R01 is deliberately not called: I06 retained readiness is rendered separately from any later current readiness. J01 typed polling/terminal failure and reconciliation exist in FE; real worker/job/receipt acceptance remains unverified. HTTP202 or failed-job HTTP200 never indicates successful Import.

Validation / Definition of Done: Staging exercises success/no-change, rejected input, unresolved mapping, denied rights, stale previews/revisions and failed jobs/retries without duplicate or partial writes. IDs/results/readiness come from BE; no fake success, batches or mapping, client domain engine or automatic planning.

Evidence: [ImportPage](../src/pages/imports/ImportPage.tsx), [ImportWorkspace](../src/pages/imports/ImportWorkspace.tsx), [workflow](../src/features/import-data/importData.workflow.ts), [JSON/multipart HTTP helper](../src/shared/http/httpClient.ts); IMP [§§2–3 flow/routes](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#flow), [§5 profile authority](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#mapping), [§9 wire contracts](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#wire), [§10 concurrency/rights](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#security), [§11 completion](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#errors), [§14 R01 / §14.5 J01](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#readiness-v1).

## G. Import History integration maturity

Status: `BLOCKED_BY_BE` · Owner: FE + BE · Required before: declaring History staging/production integrated; depends on A/B/C/D.

Why: H01/H02 typed data boundary, mock/API switch, runtime validation and page states already exist. Real backend HTTP is not verified; API-mode browser interception proves FE handling only.

What remains: Validate the existing boundary against real authenticated staging H01/H02; resolve actual contract/deployment mismatches without fixture fallback. Preserve the completed pagination fix: page omits unspecified `limit`, backend default is 50/max100, small pages remain QA-only—not reopened debt.

Validation / Definition of Done: Real data verifies Store-local upload-date grouping, distinct batches, same-file filters, null counts, cursor continuation/stale recovery and empty/error/retry states; 401/403 and cross-Store access remain honest. Network evidence confirms undefined `limit` is omitted and production never requests fixture-only `limit=3`.

Evidence: [History data](../src/features/import-history/importHistory.data.ts), [types](../src/features/import-history/importHistory.types.ts), [validators](../src/features/import-history/importHistory.validation.ts), [page](../src/pages/import-history/ImportHistoryPage.tsx); IMP [§4 pagination](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#states), [§11 H01/H02](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#errors); [architecture §8 QA limitations](./001-architecture-foundation.md#8-kết-quả-xác-minh-kỹ-thuật-validation).

## H. Permissions / Owner vs Staff

Status: `BLOCKED_BY_BE` · Owner: FE + BE · Required before: permission-sensitive product actions and Owner/Staff workflow release.

Why: T02 membership/effective-permission context is wired in the FE, but actual backend current-grant enforcement and revocation remain unverified. V1 defines Owner authority only within the current Store and Staff's explicit current grants; hiding UI is UX, never authorization enforcement.

What remains: Drive navigation/interactions from T02 current effective permissions and server action/state responses; handle changed/revoked grants. Use Owner-only N12 catalogue/descriptors for the separately scoped Staff-grant/audit UI; integrate V1 invitation/acceptance workflows. BE enforces every read/retry/mutation/commit; no fake grants, implicit permission expansion, shared Owner key or one-time bypass.

Validation / Definition of Done: Real Owner/Staff accounts exercise distinct permitted/denied actions; Staff cannot manage Owner-only operations; Owner cannot cross Store scope; revocation is honored on subsequent requests and commit fences. Direct API use cannot bypass hidden/disabled UI.

Evidence: [Sidebar](../src/layouts/app-shell/Sidebar.tsx), [AppShell](../src/layouts/app-shell/AppShell.tsx); AUTH current V1 [§1 current rights](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-session), [§4 Staff grants/audit](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-staff), [§6 invitations](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-invitations); IMP [§10 authorization](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#security).

## I. Sidebar unfinished destinations — no debt item

Verified: Nhập dữ liệu links to `/imports`, active for History too; Kho links to `/inventory`; Menu links to `/menu`. Active state derives from Router URL. Hôm nay, Dự đoán and Cửa hàng remain disabled spans without dummy URLs. Kế hoạch nhập is absent, not an alias for Dự đoán. No navigation fix or placeholder-page debt; future screens are not added to this register.

Evidence: [Sidebar](../src/layouts/app-shell/Sidebar.tsx), [AppRouter](../src/app/AppRouter.tsx). AppShell's `#app-content` is a real accessibility skip target, not dummy navigation.

## J. Inventory integration maturity

Status: `BLOCKED_BY_BE` · Owner: FE + BE · Required before: declaring Kho staging/production integrated; depends on A/B/C/D/H.

Why: Kho FE foundation implements read-only V01–V04 models/boundary/runtime validation, deterministic fixtures, status/search, lot and movement evidence with snapshot-aware pagination. Root Inventory V1 is reviewed design only; internal reads and intercepted browser QA are not verified public HTTP. Location explicitly remains unsupported, not an unfinished warehouse selector.

What remains: Verify real authenticated V01–V04 with both inventory.read and ingredient.read, current Store context, cost redaction/current grants, optimistic snapshot rollover and cursor scope. FE timestamp formatting now accepts validated Store timezone; verify its real T02 value and keep date-only facts unchanged. Verify exact decimals, physical vs usable/completeness, null threshold/counts, date boundaries and inactive ingredients against staging. On expired snapshots reload the whole read set; never silently fall back to fixtures or merge revisions. V03 sort is left unspecified to use the canonical default; do not infer extra query filters from terse contract notation.

Inventory mutation workflows (N6 receipts/opening stock, N8 Owner threshold setting, import count) require separately assigned integration/design work and verified backend atomic/audit/CAS semantics. No writer, fake stock adjustment, local batch/server state, FEFO execution, procurement or AI generation is implemented. AI capability scope remains NEEDS_REVIEW; disabled presentation is not capability evidence.

Validation / Definition of Done: Real staging list/detail/lots/movements preserve same snapshot/date/data_version; 409 or rollover forces whole-set refresh, cross-filter cursor errors remain visible, no mixed versions/stale ingredient response. Real 401/403/404/network/malformed data remain honest, masked cost cannot leak, and quantities retain exact string representation. Deep links/refresh and Store switching pass under real auth and deployment fallback. Fixtures/interception alone cannot close this item.

Evidence: [Kho page](../src/pages/inventory/InventoryPage.tsx), [data boundary](../src/features/inventory/inventory.data.ts), [validators](../src/features/inventory/inventory.validation.ts), [detail](../src/features/inventory/components/InventoryDetail.tsx); root [INV §§2–3/6](../api-contract-v1/INVENTORY_API_CONTRACT_VI.md#inventory-reads), [shared PLAN types](../api-contract-v1/PROCUREMENT_API_CONTRACT_VI.md#planning-types), [CAT decimals](../api-contract-v1/CATALOG_MENU_RECIPE_API_CONTRACT_VI.md), [V1 capability status](../api-contract-v1/SHELFCASH_API_CONTRACT_V1_VI.md#authority).

## K. Menu / Recipe integration maturity

Status: `BLOCKED_BY_BE` · Owner: FE + BE · Required before: declaring Menu staging/production integrated; depends on A/B/C/D/H.

Why: Read-only Menu FE foundation implements P01/P02 models, boundary/runtime validation, deterministic fixtures, name/status query, cursor navigation and product/current-recipe panel. Root CAT is DESIGN ONLY; fixtures and intercepted QA do not verify public HTTP or current permissions. The Menu→Kho action is disabled: existing Inventory routing does not consume the canonical ingredient-ID set, and real inventory grants are not wired. It must not open an unfiltered Kho as if it showed this recipe's ingredients.

What remains: Verify real authenticated P01 menu.read including retail price and count availability/redaction; P02 requires menu.read + recipe.read + ingredient.read, with whole-response denial if any are missing. Verify Store timezone/date, canonical decimals/units, current inclusive recipe selection, missing/empty recipes, inactive ingredient metadata, null/zero price, full-name search scope, filtered total_count and Store-wide summary. Verify keyset cursor scope/409 LIST_VERSION_CHANGED and list/detail version/date coherence, not an invented P02 snapshot query. FE current Store plumbing is complete; actual A03/T02 and Kho timezone verification remain open.

Separately scoped integration: Menu→Kho must use canonical repeated ingredient_id UUIDs with V01/missing_ingredient_ids handling and real inventory.read + ingredient.read; never infer stock zero or permissions from reading a recipe. No Inventory calls or availability calculations belong in P02. N20–N22 scheduling/timeline/preview/commit is already designed in CAT §12, but not implemented in this read-only MagicPath milestone: it needs an explicit UI workflow and verified future-only atomic/CAS/idempotency/audit backend, not local saved edits or generic CRUD. AI remains NEEDS_REVIEW, not an inferred capability.

Validation / Definition of Done: Real staging Owner/Staff reads prove count redaction/P02 denial, Unicode name search over the complete canonical Store dataset, query-bound cursor recovery and no mixed-version list/detail. Full recipe lines retain UUID identities, yield/loss/date/unit truth without float arithmetic, conversion, truncation or nearest-version fallback. API/network/401/403/404/503/malformed data stay honest with no fixture fallback. Deep links/refresh and Store switching pass under real auth/deployment fallback. Fixtures/interception cannot close this item.

Evidence: [Menu page](../src/pages/menu/MenuPage.tsx), [data boundary](../src/features/menu/menu.data.ts), [validators](../src/features/menu/menu.validation.ts), [detail](../src/features/menu/components/MenuDetail.tsx); root [CAT P01](../api-contract-v1/CATALOG_MENU_RECIPE_API_CONTRACT_VI.md#p01), [P02](../api-contract-v1/CATALOG_MENU_RECIPE_API_CONTRACT_VI.md#p02), [permissions](../api-contract-v1/CATALOG_MENU_RECIPE_API_CONTRACT_VI.md#permissions), [effectivity](../api-contract-v1/CATALOG_MENU_RECIPE_API_CONTRACT_VI.md#recipe-effectivity), [PLAN primitives](../api-contract-v1/PROCUREMENT_API_CONTRACT_VI.md#planning-types), [AUTH](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-v1).
