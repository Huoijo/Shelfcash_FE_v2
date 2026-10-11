# ShelfCash Frontend (v2)

Production frontend rebuild for ShelfCash.

## Tech Stack

- React 19
- TypeScript
- Vite
- Vanilla CSS
- React Router (declarative SPA routing)

## Development

Use Node.js 22.22.0 or newer (required by the installed React Router version).

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Typecheck and build for production
VITE_DATA_SOURCE=api npm run build

# Lint code
npm run lint

# Verify Import contracts and retry/seal behavior (no extra dependencies)
npm run test:import

# Verify Auth/session, Store and shared HTTP behavior with controlled responses
npm run test:auth

# Verify canonical Planning integration and current OpenAPI drift
npm run test:planning
npm run check:planning-wire
```

## Milestone 09: Dự đoán / Kế hoạch nhập

`/forecast` opens the authenticated `/forecast/planning` workspace in the existing shell. Setup consumes C01 and selected-date R01, then explicitly creates C02 and polls/resumes C03; retained results expose C04/C05 ingredients and C08 deterministic engine reasons. The backend owns forecast/BOM/procurement/selection internally—there are no public ForecastRun/DecisionRun/Brief routes in the current package. What-if, Hỏi AI, priority input, Open PO/scenarios and PO conversion stay unavailable, with no invented semantics or fixture fallback in API mode.

Status is **PARTIAL / VERIFIED_CONTROLLED**, not live-complete: local BE `localhost:18001` refused health/A03 connections. [Milestone09 review, evidence, concerns and exact changed-file manifest](./docs/006-decision-planning-e2e-integration.md). MagicPath setup/results were read-only references; no redesign or remote edits. A `plan_id` query is an authorized server locator only. An uncertain create intent is memory-only and is lost on reload/leaving the page/Store or session change; explicit retry preserves its original body/key while mounted.

## Current milestone: Auth + Session + Store foundation

- `/` redirects to `/login`; Login remains outside the application shell.
- `/imports` opens the Import Batch workspace; `/imports/history` opens the separate H01/H02 History surface inside the shared shell. `/import-history` redirects to `/imports/history`, retaining query parameters and fragment.
- API mode wraps the internal application in AuthGuard → StoreProvider/StoreGate → AppShell. Refresh reads A03 before showing protected content; unauthenticated sessions return to Login, while unavailable or malformed responses show an error/retry state. The frontend guard controls navigation; the backend must enforce permissions on every request.
- Login keeps the existing UI and sends canonical A01 credentials, then uses A03 as session authority. A01 HTTP200 alone does not authenticate the application. AuthProvider owns session/bootstrap status, current user and in-memory CSRF; it does not own business data. Registration and public password recovery remain absent.
- StoreProvider resolves A03's single accessible default through T02. No Store shows support guidance; multiple Stores remain unresolved until a separately scoped selection UI exists. The app never guesses the first Store from a page. Import, History, Inventory and Menu consume the same narrow current-Store context; no public development Store ID overrides authenticated scope.
- Server logout uses A04 and its bodyless HTTP204 before clearing FE session/Store state. Failure remains visible and does not pretend the server session was revoked. Protected `401 UNAUTHENTICATED` clears session state; A01 `INVALID_CREDENTIALS` stays on Login. No automatic CSRF renewal or mutation replay is introduced.
- Mock mode is an explicitly labeled `mock_preview` available only in the Vite development server. It has no authenticated identity, session cookie or CSRF token, and sends no Auth/Store requests. Production builds cannot enable mock preview; API mode never falls back to it.
- Import keeps picker/drop, local remove/clear and preliminary prospective-selection checks: .csv/.xlsx extensions, 20 submitted files per call, 20 MiB per file and 100 MiB selected source bytes (inclusive, using `File.size`, not expanded XLSX). Invalid local additions preserve the existing selection; extensions do not prove valid contents. Explicit “Tạo lô và tải file” creates I01 using the selected `data_date`, reads I04, uploads I02 multipart and refreshes I04. Further uploads accumulate into that same unsealed draft. Local selections, active batch and exact retry intents stay in memory across Import ↔ History; leaving the workspace or refreshing destroys them. There is no invented cross-refresh resume route or persisted batch state.
- Server receipts distinguish uploaded/rejected from removable local files. A 200 upload may be partial; 422 `UPLOAD_REJECTED` contains committed rejected receipts/revisions and is handled separately from request-validation 422. Accepted files have no Remove/Replace action. Whole-batch `quota`, `source_set`, revisions and `allowed_actions` come from I04, independently of the paginated `files[]`; rejected bytes do not consume accepted quota. Limits remain 20 accepted logical files / 20 MiB per file / 100 MiB accepted source bytes. Local remaining-quota feedback is advisory; server admission is final.
- Existing “Xử lý dữ liệu” now prepares I03 analysis by reading every file page from a coherent revision/version, showing accepted/rejected scope and requiring acknowledgment. I03 sends the complete canonical accepted IDs, complete rejected client IDs, `file_set_version`, quoted current `If-Match` and a UUID idempotency key. A successful analysis receipt locks upload immediately; failed analysis does not reopen the sealed source set. API mode polls I04 while analyzing; mapping, preview and commit are not implemented. Stale revisions require a new I04 read and reconstructed confirmation.
- Uncertain mutation outcomes retain the original idempotency key, client UUIDs, File references, names and order for explicit retry; no automatic new logical upload is created. Known per-item outcomes are reconciled through I04 before presenting current quota. See [Import integration status](./docs/002-technical-debt-and-integration-todo.md#e-import-upload-contract-validation).
- Import History implements H01/H02 only, not inventory movements or planning history.
- HDSD opens a static, keyboard-accessible help drawer on `/imports`, following the read-only MagicPath interaction reference. Vietnamese preparation guidance comes from Import Contract V1 §§5, 6, 9.1 and 13. Import presentation follows `ShelfCashDataImportScreen`, MagicPath component `458395069779681280`, revision `458401934337019904`, inspected read-only. Exact column schemas, purchase-history imports and arbitrary supplier workbooks are not advertised; File mẫu remains disabled.
- `/inventory` opens Kho in the existing AppShell. The Kho Sidebar link is URL-active; unfinished destinations stay disabled. The read-only table, status filters, name/SKU search and lot/movement drawer follow MagicPath Kho component `458590758262427648`, revision `458596566140329984`; MagicPath was not modified.
- Inventory V1 §§2–3/6 defines V01 list, V02 ingredient/initial lots, V03 additional lots and V04 movements. Recorded physical stock, usable stock, completeness and unknown facts remain distinct. Quantities stay exact decimal strings; no float business arithmetic, inferred zero, unit conversion or stock mutation. Summary counts are Store-wide, not page totals. Details/continuations pin the list snapshot; expired snapshots invalidate the displayed set and require a full refresh.
- Inventory fixtures are deterministic illustrative reads, not backend evidence. API mode uses runtime response validation and never falls back to fixtures. Location is explicitly unsupported; AI/forecast actions are disabled. Inventory timestamps use validated current-Store timezone when available, with an explicitly labeled UTC fixture fallback; Store-local `as_of_date` and expiry/receipt dates are not converted. See [Inventory integration debt §J](./docs/002-technical-debt-and-integration-todo.md#j-inventory-integration-maturity).
- `/menu` opens the read-only product/recipe workspace in AppShell; Menu is a URL-active Sidebar link. The table, name search, active/paused filters and product detail panel follow MagicPath component `458614109248847872`, revision `458616728595894272`, inspected read-only. Dự đoán now opens Planning; Hôm nay and Cửa hàng remain disabled.
- Catalog/Menu/Recipe V1 §§4–8 defines P01 products and P02 product/current recipe. Search is product-name-only, server-side in API mode and over the complete fixture dataset before pagination in mock mode. Summary stays Store-wide. Cursor changes preserve filters; filter/search changes reset cursor. Catalog/date mismatch between pages or list/detail requires a fresh read set, not mixed-version data. P02 has no query parameters; the server selects the inclusive Store-date recipe, never the FE's highest version.
- Product UUID, recipe UUID/integer version, recipe-line UUID and ingredient UUID remain distinct. Exact quantities describe the whole recipe yield in canonical units; no unit conversion, float business arithmetic, BOM calculation or inventory availability inference. Missing recipe, known empty recipe, forbidden ingredient count, null price and zero price remain distinct. Menu timestamps use the response's Store timezone; date-only facts stay date-only. AI and the Menu→Kho ingredient action are disabled; no unfiltered stock link or fake saved edits. N20–N22 scheduling is designed in V1 but absent from this MagicPath workflow and not implemented. See [Menu integration debt §K](./docs/002-technical-debt-and-integration-todo.md#k-menu--recipe-integration-maturity).

Copy the public settings from `.env.example` into an ignored `.env.local` if needed:

```env
VITE_DATA_SOURCE=mock
VITE_API_BASE_URL=http://localhost:8000
```

Development `mock` selects October 2026 UI examples. Import Batch uses an explicitly labeled deterministic adapter whose state lives only in the mounted workspace closure; it performs no HTTP requests or background analysis and persists nothing. History/Inventory/Menu retain their fixture boundaries. Set `VITE_DATA_SOURCE=api` to use A03 bootstrap and canonical authenticated Store resolution. Production uses API mode and rejects a mock configuration. The base URL excludes `/api/v1`, which each feature supplies. Unspecified page limits are omitted, including I04 `files_limit` and T01 `limit` (backend default50/max100); small pages are QA-only. API business requests cannot proceed without resolved current Store context.

Restart Vite after changing these values; production values are embedded at build time. Override the development mock setting with `VITE_DATA_SOURCE=api` for deployment builds. All `VITE_*` values are public: never put API keys/passwords/shared secrets here. `.env` and `.env.*` are ignored except `.env.example`.

API mode never falls back to fixtures. Shared HTTP sends included cookies and `no-store`, obtains authenticated mutation CSRF from the session owner and preserves canonical errors/request references. Import delegates CSRF to that shared boundary; its optional injected source is retained for focused boundary tests only, not a feature-owned token lifecycle. Missing CSRF fails before the mutation is sent. Login is the pre-session exception; GET requires no mutation token. No fake token, bearer token, public secret or environment-token setting is used. Auth/Store models, validators and adapters are implemented in the FE; actual backend readiness is recorded below.

## Backend readiness and deployment requirements

The audit classifies A01 `POST /api/v1/auth/login`, A03 `GET /api/v1/auth/me`, A04 `POST /api/v1/auth/logout`, T01 `GET /api/v1/stores` and T02 `GET /api/v1/stores/{store_id}` as **CONTRACT_ONLY**. CSRF issuance, session-cookie behavior, credentialed CORS and Origin enforcement are also contract-only. Live authenticated acceptance is **BLOCKED** until compatible backend implementation and an accessible test environment are supplied; no capability is classified IMPLEMENTED or VERIFIED from the available backend evidence.

Evidence: current [AUTH V1 introduction and session rules](./api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-v1) explicitly describe auth/business HTTP as absent; [AUTH acceptance/backlog](./api-contract-v1/AUTHORIZATION_CONTRACT_VI.md#auth-acceptance) lists public routes and cookie/CSRF/CORS verification as pending. The [V1 handoff](./api-contract-v1/README_VI.md) states that READY is contract review, not implementation. This checkout has no backend source/OpenAPI/server configuration, no obvious sibling backend checkout was found on Desktop, and no process listened on the configured local port8000 during the audit. Historical `/health`-only references and Import's assumed valid-auth evidence do not establish current Auth readiness. Controlled FE tests demonstrate handling, not a working server login or session.

The server must set the opaque `__Host-shelfcash_session` cookie with Secure/HttpOnly/SameSite=Lax/Path=/ and no Domain, issue real A01/A03 CSRF, and enforce current memberships/grants. Local cookie development needs HTTPS or the backend's explicitly configured loopback cookie policy. Cross-origin deployment requires exact allowed FE origins, credentialed CORS and allowed `X-CSRF-Token`/`If-Match`/`Idempotency-Key` headers; all browser mutations, including login/logout, require Origin enforcement. FE does not fabricate Origin or weaken cookie attributes. A04 must return HTTP204 without a JSON envelope. SPA hosting must separately rewrite direct application paths to `index.html`, while preserving API and missing-asset responses.

Import Batch models, response validation, API/mock adapters and the workspace workflow live in `features/import-data`; H01/H02 remain in `features/import-history`. Generic JSON and multipart transport live in `shared/http`. Implemented routes are I01 `POST /api/v1/stores/{store_id}/imports`, I02 `POST /api/v1/imports/{import_id}/files`, I04 `GET /api/v1/imports/{import_id}` (`files_cursor` only when continuing), and I03 `POST /api/v1/imports/{import_id}/analyze`.

Contract authority is root V1 Import §§4/6/9.1/9.3/10 and AUTH V1, followed by the accepted [batch mechanics supplement](./api-contract-v1/IMPORT_BATCH_MECHANICS_RESPONSE_VI.md). Batch accumulation, partial admission and receipt-set revision semantics are resolved. The supplement's §9.1a backlink is absent from the supplied canonical snapshot; its explicitly accepted clarification is additive to the existing version description, with no conflicting behavior identified. Verification results are recorded separately in the architecture document; fixture/interception QA is not live backend evidence.

## Documentation & Architecture Reports

Tài liệu và báo cáo kiến trúc định kỳ được lưu trữ tại thư mục [`docs/`](./docs/README.md):
- [Báo cáo #001: Thiết lập Nền tảng Dự án & Định hướng Kiến trúc](./docs/001-architecture-foundation.md)
- [Báo cáo #006: Decision / Planning E2E integration](./docs/006-decision-planning-e2e-integration.md)
