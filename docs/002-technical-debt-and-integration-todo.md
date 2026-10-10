# Technical Debt & Integration TODO — ShelfCash FE v2

ID: `#002` · Created: 10/10/2026 · Baseline: Milestone 03

## General context

Track evidence-backed work required before staging acceptance, production or deeper integration. This register does not authorize implementation or add a feature wishlist.

Existing: Login-local validation, AppShell, local Import selection/HDSD, H01/H02 and read-only Kho V01–V04 boundaries. Real auth, upload and backend HTTP integration remain unverified; completed foundations are not missing work.

Authority: [handoff README](../api-contract-v1/README_VI.md) → [V1 aggregate §1](../api-contract-v1/SHELFCASH_API_CONTRACT_V1_VI.md#authority) → root [AUTH current V1](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-v1) / [IMP](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md). Historical references/MagicPath do not override V1. FE/BE must use the same handoff version; design review/interception is not live HTTP evidence.

`BLOCKED_BY_BE` means awaiting verified contract-compatible endpoints, not a new claim about an external server outage. Staging infrastructure requirements below are project operational requirements, not a V1 hosting topology.

## A. Authentication & route protection

Status: `BLOCKED_BY_BE` · Owner: FE + BE · Required before: authenticated staging acceptance and production.

Why: `/imports`, `/imports/history` and `/inventory` are intentionally unprotected for FE development; Login does not send credentials. Production must not ship this state.

What remains: Integrate A01 login, A03 bootstrap and A04 logout; T01/T02 are covered in B. Place AuthGuard/ProtectedRoute **outside AppShell** after session resolution. Use opaque Secure/HttpOnly cookie sessions, not JWT/localStorage tokens or fake sessions. Preserve existing `credentials: 'include'` / `no-store`. Authenticated mutations use session-bound CSRF from A01/A03; all browser mutations require Origin checks, but pre-session login needs no CSRF token. Handle logout's 204 outside the JSON-only helper.

Validation / Definition of Done: Real login, refresh/bootstrap, expiry and logout (including expired session) work; unauthenticated deep links are blocked without redirect loops; Origin/CSRF failures and rotation match V1; no secrets persist in FE storage/logs.

Evidence: [LoginForm](../src/features/auth/LoginForm.tsx), [AppRouter](../src/app/AppRouter.tsx), [AppShell](../src/layouts/app-shell/AppShell.tsx), [HTTP helper](../src/shared/http/httpClient.ts); AUTH current V1 [§1 session](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-session), [§3 routes](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-routes), [§5 acceptance](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-acceptance).

## B. Store context

Status: `BLOCKED_BY_BE` · Owner: FE + BE · Required before: real Store-scoped integration and Store switching.

Why: History and Kho currently build requests from public `VITE_DEV_STORE_ID`, not authenticated current-Store context. Kho timestamps are explicitly UTC-labelled until a real Store timezone is available; date-only snapshot/expiry facts remain unchanged.

What remains: Replace the development scope with A03/T01/T02 accessible-Store selection and timezone/currency/business date/membership context. Selection is local FE context, not a global session mutation. Scope requests/data and any future cache by Store ID; cancel/reset old requests, cursors and Import selections on switch. No cache/global-state library is implied.

Validation / Definition of Done: Zero/one/multiple accessible Store flows work; no-Store login shows support guidance. Switching during a pending request cannot display the previous Store's results or reuse its selections/cursors; separate tabs can select different Stores. Inaccessible scope and denied actions retain V1 404/403 behavior.

Evidence: [config](../src/app/config.ts), [History data boundary](../src/features/import-history/importHistory.data.ts), [History page](../src/pages/import-history/ImportHistoryPage.tsx), [ImportWorkspace](../src/pages/imports/ImportWorkspace.tsx); AUTH current V1 [§3 T01/T02 and selection](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-routes).

## C. Staging environment

### C1. Isolated integration environment and test identities

Status: `BLOCKED_BY_DEPLOYMENT` · Owner: Deployment + BE, with FE verification · Required before: live integration acceptance.

Why: No staging FE/BE/DB provisioning or seed/reset configuration is present in this repository; external infrastructure availability is unverified.

What remains: Supply staging FE/BE, isolated database, internal Store and real Owner/Staff test accounts. Provide safe, repeatable staging-only seed/reset tooling and representative Import/History data. Keep operator tooling separate from product permissions: no Owner/Staff reset privilege, direct FE database access or shared demo credentials. Product onboarding remains assisted provisioning/credential completion; Staff membership follows real invitation/acceptance, not fake grants.

Validation / Definition of Done: Environment endpoints and versions are recorded; Owner/Staff can authenticate with different permissions; test data can be reproduced/reset only against a verified non-production target. Credentials stay outside source/public `VITE_*` settings; tooling cannot accidentally target production.

Evidence: [README development/configuration and integration limitations](../README.md), [Vite config](../vite.config.ts), [package scripts](../package.json); AUTH current V1 [§2 assisted provisioning/reset](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-assisted), [§6 Staff invitation](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-invitations). Environment isolation/tooling is a staging requirement, not a substitute for these product workflows.

### C2. Request correlation for integration failures

Status: `TODO` · Owner: FE + BE · Required before: staging troubleshooting/acceptance.

Why: Success History responses validate `meta.request_id`, but `HttpError` does not retain failure metadata/request IDs; live server-log correlation has not been demonstrated.

What remains: Preserve a safe backend request reference in the error/support path and correlate it with BE logs. Use V1 `meta.request_id`; additional trace-ID transport needs operational agreement, not an invented field or tracing-platform dependency.

Validation / Definition of Done: A real staging success and error can each be located in BE logs from their request reference without logging passwords, cookies, CSRF tokens or raw uploaded data.

Evidence: [History validators](../src/features/import-history/importHistory.validation.ts), [HTTP helper / HttpError](../src/shared/http/httpClient.ts), [HTTP envelope types](../src/shared/http/http.types.ts); AUTH current V1 [§1 envelope](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-session), IMP [§9 wire envelope](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#wire).

## D. SPA deployment fallback

Status: `BLOCKED_BY_DEPLOYMENT` · Owner: Deployment · Required before: staging/production deep-link acceptance.

Why: BrowserRouter needs host fallback to `index.html`. The README documents it, but hosting rewrites are absent; Vite dev-server refresh is not production evidence.

What remains: Configure SPA/history fallback at the chosen hosting layer (Nginx, Cloudflare Pages, Vercel, Netlify, static-host rewrites or equivalent). Keep business API routes and missing static assets separate from the fallback; do not return the SPA for API requests.

Validation / Definition of Done: Direct open, refresh and new-tab open of `/imports/history`, `/imports` and `/inventory` return the frontend entry document without server-side 404, then resolve through Router/auth. API paths still return API responses; missing assets do not return HTML masquerading as assets.

Evidence: [README hosting requirement](../README.md), [BrowserRouter](../src/app/App.tsx), [routes](../src/app/AppRouter.tsx), [Vite config](../vite.config.ts), [package scripts](../package.json). Hosting configuration remains absent/unverified, not proven misconfigured.

## E. Import upload contract validation

Status: `TODO` · Owner: FE + BE · Required before: real I02 integration and production upload UI.

Why: Root V1 **confirms all four values**: CSV/XLSX only; maximum **20 files per batch, 20 MiB per file, 100 MiB total compressed bytes per batch** (IMP §6, lines 271–275; I02 sniffing at §9.1, line 462). No value is awaiting numeric contract agreement.

Current FE validation (completed): Picker and drop share prospective local batch selection checks: existing selected files + incoming files, with inclusive count/per-file/total limits. Total sums source `File.size` (compressed/stored bytes, not expanded XLSX). Any invalid addition is rejected atomically without changing the previous selection. Errors/UI explicitly describe filename extensions; suffixes do not prove valid contents. No real batch, upload, server acceptance or persistent batch state exists.

What remains (deferred I01/I02 integration): Enforce canonical server batch truth across actual upload calls, including files already accepted by the backend, not only files currently held in FE memory or the incoming request. Integrate server content/format sniffing, parser/resource-limit errors and real per-item receipts; align the preliminary extension policy with BE sniffing. Local atomic-add rejection is not I02 per-item acceptance. Do not simulate this with fake batch IDs/counts/server state or localStorage persistence.

Validation / Definition of Done: Picker/drop preserve inclusive count/byte boundaries and accurate copy; staging verifies server sniffing, cumulative batch limits and resource-limit errors, including expanded XLSX/sheet/row/column limits. No browser canonicalization, fabricated constraints or filename-based identity.

Evidence: [file checks](../src/features/import-data/importData.files.ts), [ImportUpload](../src/features/import-data/components/ImportUpload.tsx), [ImportWorkspace](../src/pages/imports/ImportWorkspace.tsx), [ImportPage](../src/pages/imports/ImportPage.tsx); IMP [§6 supported inputs/limits](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#schemas), [§9.1 upload](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#wire).

## F. Real Import workflow

Status: `BLOCKED_BY_BE` · Owner: FE + BE · Required before: enabling real upload/processing; depends on A/B/E.

Why: Current Import only selects files/date locally; processing is disabled. No real batches, uploads, mappings or writes exist in this UI.

What remains:

- I01–I04: create a draft with required business-context date; multipart upload with paired client-file identities and per-item receipts; acknowledge rejected files and seal the accepted set for analysis; inspect server state/revisions/allowed actions. Add only the multipart transport actually needed; the current HTTP helper is JSON-only.
- M01–M04: typed summary/issues/options and proposal edits; separate Owner-only profile decisions (N5), never treat M04 resolution as activation or commit permission.
- I05/I06: server-bound immutable preview, explicit confirmation/reasons/resolutions and atomic commit with CAS/idempotent retry/reconciliation; show completion only from durable committed/no-changes receipts and refetch affected resources afterward.
- R01/J01: real typed readiness (blocked ≠ unknown) and server-paced job polling/terminal errors. HTTP 202 or a failed-job HTTP 200 is not successful import completion.

Validation / Definition of Done: Staging exercises success/no-change, rejected input, unresolved mapping, denied rights, stale previews/revisions and failed jobs/retries without duplicate or partial writes. IDs/results/readiness come from BE; no fake success, batches or mapping, client domain engine or automatic planning.

Evidence: [ImportPage](../src/pages/imports/ImportPage.tsx), [ImportWorkspace](../src/pages/imports/ImportWorkspace.tsx), [JSON HTTP helper](../src/shared/http/httpClient.ts); IMP [§§2–3 flow/routes](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#flow), [§5 profile authority](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#mapping), [§9 wire contracts](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#wire), [§10 concurrency/rights](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#security), [§11 completion](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#errors), [§14 R01 / §14.5 J01](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#readiness-v1).

## G. Import History integration maturity

Status: `BLOCKED_BY_BE` · Owner: FE + BE · Required before: declaring History staging/production integrated; depends on A/B/C/D.

Why: H01/H02 typed data boundary, mock/API switch, runtime validation and page states already exist. Real backend HTTP is not verified; API-mode browser interception proves FE handling only.

What remains: Validate the existing boundary against real authenticated staging H01/H02; resolve actual contract/deployment mismatches without fixture fallback. Preserve the completed pagination fix: page omits unspecified `limit`, backend default is 50/max100, small pages remain QA-only—not reopened debt.

Validation / Definition of Done: Real data verifies Store-local upload-date grouping, distinct batches, same-file filters, null counts, cursor continuation/stale recovery and empty/error/retry states; 401/403 and cross-Store access remain honest. Network evidence confirms undefined `limit` is omitted and production never requests fixture-only `limit=3`.

Evidence: [History data](../src/features/import-history/importHistory.data.ts), [types](../src/features/import-history/importHistory.types.ts), [validators](../src/features/import-history/importHistory.validation.ts), [page](../src/pages/import-history/ImportHistoryPage.tsx); IMP [§4 pagination](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#states), [§11 H01/H02](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#errors); [architecture §8 QA limitations](./001-architecture-foundation.md#8-kết-quả-xác-minh-kỹ-thuật-validation).

## H. Permissions / Owner vs Staff

Status: `BLOCKED_BY_BE` · Owner: FE + BE · Required before: permission-sensitive product actions and Owner/Staff workflow release.

Why: Current shell has no real membership/grant context. V1 defines Owner authority only within the current Store and Staff's explicit current grants; hiding UI is UX, never authorization enforcement.

What remains: Drive navigation/interactions from T02 current effective permissions and server action/state responses; handle changed/revoked grants. Use Owner-only N12 catalogue/descriptors for the separately scoped Staff-grant/audit UI; integrate V1 invitation/acceptance workflows. BE enforces every read/retry/mutation/commit; no fake grants, implicit permission expansion, shared Owner key or one-time bypass.

Validation / Definition of Done: Real Owner/Staff accounts exercise distinct permitted/denied actions; Staff cannot manage Owner-only operations; Owner cannot cross Store scope; revocation is honored on subsequent requests and commit fences. Direct API use cannot bypass hidden/disabled UI.

Evidence: [Sidebar](../src/layouts/app-shell/Sidebar.tsx), [AppShell](../src/layouts/app-shell/AppShell.tsx); AUTH current V1 [§1 current rights](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-session), [§4 Staff grants/audit](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-staff), [§6 invitations](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-invitations); IMP [§10 authorization](../api-contract-v1/IMPORT_MAPPING_API_CONTRACT_VI.md#security).

## I. Sidebar unfinished destinations — no debt item

Verified: Nhập dữ liệu links to `/imports`, active for History too; Kho links to `/inventory`. Active state derives from Router URL. Hôm nay, Dự đoán, Menu and Cửa hàng remain disabled spans without dummy URLs. Kế hoạch nhập is absent, not an alias for Dự đoán. No navigation fix or placeholder-page debt; future screens are not added to this register.

Evidence: [Sidebar](../src/layouts/app-shell/Sidebar.tsx), [AppRouter](../src/app/AppRouter.tsx). AppShell's `#app-content` is a real accessibility skip target, not dummy navigation.

## J. Inventory integration maturity

Status: `BLOCKED_BY_BE` · Owner: FE + BE · Required before: declaring Kho staging/production integrated; depends on A/B/C/D/H.

Why: Kho FE foundation implements read-only V01–V04 models/boundary/runtime validation, deterministic fixtures, status/search, lot and movement evidence with snapshot-aware pagination. Root Inventory V1 is reviewed design only; internal reads and intercepted browser QA are not verified public HTTP. Location explicitly remains unsupported, not an unfinished warehouse selector.

What remains: Verify real authenticated V01–V04 with both inventory.read and ingredient.read, live Store timezone/context, cost redaction/current grants, optimistic snapshot rollover and cursor scope. Replace temporary UTC-labelled timestamp presentation with real Store-timezone formatting (do not change business dates). Verify exact decimals, physical vs usable/completeness, null threshold/counts, date boundaries and inactive ingredients against staging. On expired snapshots reload the whole read set; never silently fall back to fixtures or merge revisions. V03 sort is left unspecified to use the canonical default; do not infer extra query filters from terse contract notation.

Inventory mutation workflows (N6 receipts/opening stock, N8 Owner threshold setting, import count) require separately assigned integration/design work and verified backend atomic/audit/CAS semantics. No writer, fake stock adjustment, local batch/server state, FEFO execution, procurement or AI generation is implemented. AI capability scope remains NEEDS_REVIEW; disabled presentation is not capability evidence.

Validation / Definition of Done: Real staging list/detail/lots/movements preserve same snapshot/date/data_version; 409 or rollover forces whole-set refresh, cross-filter cursor errors remain visible, no mixed versions/stale ingredient response. Real 401/403/404/network/malformed data remain honest, masked cost cannot leak, and quantities retain exact string representation. Deep links/refresh and Store switching pass under real auth and deployment fallback. Fixtures/interception alone cannot close this item.

Evidence: [Kho page](../src/pages/inventory/InventoryPage.tsx), [data boundary](../src/features/inventory/inventory.data.ts), [validators](../src/features/inventory/inventory.validation.ts), [detail](../src/features/inventory/components/InventoryDetail.tsx); root [INV §§2–3/6](../api-contract-v1/INVENTORY_API_CONTRACT_VI.md#inventory-reads), [shared PLAN types](../api-contract-v1/PROCUREMENT_API_CONTRACT_VI.md#planning-types), [CAT decimals](../api-contract-v1/CATALOG_MENU_RECIPE_API_CONTRACT_VI.md), [V1 capability status](../api-contract-v1/SHELFCASH_API_CONTRACT_V1_VI.md#authority).
