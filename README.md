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

# HTTPS local development matching the backend's allowed browser origin
npm run dev:https

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
npm run test:store
npm run check:store-wire
npm run check:planning-wire
```

UI transitions use Motion with `reducedMotion="user"`. Shared timing, active-tab indicators, content reveals and panel transitions live in `src/shared/motion`. Explicit panel Close/Escape animates for 160ms before restoring focus; route/Store/read invalidation still unmounts immediately and cancels pending close callbacks. Import progress uses authoritative counters, and the completion icon appears only with the retained completion receipt. The same UI motion is available in local mock mode.

Open `https://localhost:5173` when using `dev:https`; `http` and `127.0.0.1` are different browser origins. The dev-only SSL plugin caches a self-signed certificate under `node_modules/.vite`; the browser may require accepting its local certificate warning. Stop any existing server on port 5173 first. API login also requires `VITE_DATA_SOURCE=api` in `.env` and a reachable `VITE_API_BASE_URL`. This command does not change backend CORS or cookie settings.

## Milestone 10: Cửa hàng

`/store` opens the latest MagicPath Store workspace inside the existing authenticated shell. T01/T02 support explicit multi-Store selection and valid no-Store state; Store/auth-version changes invalidate all scoped feature state. Owner Staff grants and invitations use N12/N13/N15/N16/N17 with canonical catalogue, CAS and same-intent retries. Known Store budget ceilings use C01/N4, separately from per-run/default requirements. Unsupported profile/settings fields remain visibly readonly; ambiguous null ceilings cannot be created without BE clarification. DEV memory fixtures are labeled, Store-isolated and never an API fallback. Status: `PARTIAL / VERIFIED_CONTROLLED`; see [007](docs/sprints/007/007-store-workspace-e2e-integration.md) for field audits, exact files/tests and live/browser limits. No real delivery or persistence is claimed.

## Milestone 09: Dự đoán / Kế hoạch nhập

`/forecast` opens the authenticated `/forecast/planning` workspace in the existing shell. Setup consumes C01 and selected-date R01, then explicitly creates C02 and polls/resumes C03; retained results expose C04/C05 ingredients and C08 deterministic engine reasons. The backend owns forecast/BOM/procurement/selection internally—there are no public ForecastRun/DecisionRun/Brief routes in the current package. What-if, Hỏi AI, priority input, Open PO/scenarios and PO conversion stay unavailable, with no invented semantics or fixture fallback in API mode.

Status is **PARTIAL / VERIFIED_CONTROLLED**, not live-complete: local BE `localhost:18001` refused health/A03 connections. [Milestone09 review, evidence, concerns and exact changed-file manifest](docs/sprints/006/006-decision-planning-e2e-integration.md). MagicPath setup/results were read-only references; no redesign or remote edits. A `plan_id` query is an authorized server locator only. An uncertain create intent is memory-only and is lost on reload/leaving the page/Store or session change; explicit retry preserves its original body/key while mounted.

## Current integration: Import input and schema mapping

Input/mapping now follows the [BE response #004](contracts/history/v1/004_IMPORT_FLOW_BE_RESPONSE_VI.md) and [consolidated contract workflow](contracts/WORKFLOW.md) and the [016 Import OpenAPI slice](contracts/016/openapi.main.json). The FE consumes flat files/top-level sheets, three-counter batch progress, current mapping issues and nullable schema descriptors. Typed forms support all seven resolution kinds, exact shared values, and explicit Owner profile decisions with full spec/evidence and lifecycle CAS. The continuation separates Preview → server `confirm_review` → Commit202 → J01 → retained I06; sales/supplier confirmations use exact preview row IDs. `/imports?import_id=...` and History links restore authorized server state, not a local workflow cache. [Implementation and verification](docs/sprints/005/005-import-input-schema-mapping.md).

Live acceptance remains **unverified**: the dedicated local backend at `http://localhost:18001` was unreachable during this implementation. API mode never substitutes fixtures. The original [Milestone08 handoff](docs/sprints/003/003-import-flow-integration.md) and [clarification #004](docs/sprints/004/004-import-flow-be-clarification.md) are historical snapshots; their older schema/environment blockers do not describe the current BE package.

Development mock mode can demonstrate an explicitly labeled fixed, already-approved inventory-count scenario through receipt rendering. It does not parse the user's file, approve a profile or write canonical data. Canonical `allowed_actions`, global mapping progress, immutable preview ID/digest, exact same-intent retries and typed terminal jobs drive the real boundary; tabs and visible row counts do not grant authority. No new persistence, authentication scheme or dependency is introduced.

### Existing foundations preserved

- `/` opens the public MagicPath marketing homepage; `/login` remains outside the application shell. `/today` is protected by AuthGuard and StoreGate, showing permission-scoped inventory attention items and navigation to Planning without inventing pending plans or forecast readiness.
- `/imports` opens the Import Batch workspace; `/imports/history` opens the separate H01/H02 History surface inside the shared shell. `/import-history` redirects to `/imports/history`, retaining query parameters and fragment.
- API mode wraps the internal application in AuthGuard → StoreProvider/StoreGate → AppShell. Refresh reads A03 before showing protected content; unauthenticated sessions return to Login, while unavailable or malformed responses show an error/retry state. The frontend guard controls navigation; the backend must enforce permissions on every request.
- Login follows the MagicPath account tabs and sends canonical A01 credentials, then uses A03 as session authority. A01 HTTP200 alone does not authenticate the application. AuthProvider owns session/bootstrap status, current user and in-memory CSRF; it does not own business data. Registration remains disabled; the password-recovery control gives support guidance and sends no recovery request.
- StoreProvider resolves A03's single accessible default through T02. No Store shows support guidance; multiple Stores remain unresolved until a separately scoped selection UI exists. The app never guesses the first Store from a page. Import, History, Inventory and Menu consume the same narrow current-Store context; no public development Store ID overrides authenticated scope.
- Server logout uses A04 and its bodyless HTTP204 before clearing FE session/Store state. Failure remains visible and does not pretend the server session was revoked. Protected `401 UNAUTHENTICATED` clears session state; A01 `INVALID_CREDENTIALS` stays on Login. No automatic CSRF renewal or mutation replay is introduced.
- Mock mode is an explicitly labeled `mock_preview` available only in the Vite development server. It has no authenticated identity, session cookie or CSRF token, and sends no Auth/Store requests. Production builds cannot enable mock preview; API mode never falls back to it.
- Import keeps picker/drop, local remove/clear and preliminary prospective-selection checks: .csv/.xlsx extensions, 20 submitted files per call, 20 MiB per file and 100 MiB selected source bytes (inclusive, using `File.size`, not expanded XLSX). Invalid local additions preserve the existing selection; extensions do not prove valid contents. “Xử lý dữ liệu” creates I01 using the selected `data_date`, reads I04, uploads I02 multipart, refreshes I04, reads every coherent receipt page and starts I03 analysis in one action. Source sealing remains internal to I03, with no separate lock/finalize screen. Rejected receipts remain visible and excluded from analysis. An uncertain mutation or failed consistency read stops the sequence; exact retries never silently start the next mutation. Local File selections and exact retry intents stay in memory across Import ↔ History and are lost on refresh/leaving. The URL retains only the import identifier; re-entry hydrates I04/J01/M01/I06 from the server. No invented resume mutation or persisted workflow truth is used.
- Server receipts distinguish uploaded/rejected from removable local files. A 200 upload may be partial; 422 `UPLOAD_REJECTED` contains committed rejected receipts/revisions and is handled separately from request-validation 422. Accepted files have no Remove/Replace action. Whole-batch `quota`, `source_set`, revisions and `allowed_actions` come from I04, independently of the paginated `files[]`; rejected bytes do not consume accepted quota. Limits remain 20 accepted logical files / 20 MiB per file / 100 MiB accepted source bytes. Local remaining-quota feedback is advisory; server admission is final.
- Existing “Xử lý dữ liệu” prepares I03 analysis by reading every file page from a coherent revision/version, showing accepted/rejected scope and requiring acknowledgment. I03 sends the complete canonical accepted IDs, complete rejected client IDs, `file_set_version`, quoted current `If-Match` and a UUID idempotency key. A successful analysis receipt locks upload immediately; failed analysis does not reopen the sealed source set. Continuation polls J01 with server scheduling guidance and reconciles I04; terminal failure is not success. Stale revisions require a new I04 read and reconstructed confirmation.
- Uncertain mutation outcomes retain the original idempotency key, client UUIDs, File references, names and order for explicit retry; no automatic new logical upload is created. Known per-item outcomes are reconciled through I04 before presenting current quota. See [Import integration status](docs/sprints/002/002-technical-debt-and-integration-todo.md#e-import-upload-contract-validation).
- Import History implements H01/H02 only, not inventory movements or planning history.
- HDSD keeps the static keyboard-accessible drawer on `/imports`, with guidance from Import Contract V1 §§5, 6, 9.1 and 13 and explicit distinctions between upload, preview and durable completion. Milestone08 inspected Mapping component `458395069779681280` / revision `458401934337019904` and Completion `458406500038234112` / revision `458407962478804992` read-only; it preserved the existing upload UI. No separate Review/Preview/Commit MagicPath component exists. Exact unsupported schemas, purchase-history imports and arbitrary supplier workbooks are not advertised; File mẫu remains disabled.
- `/inventory` opens Kho in the existing AppShell. The Kho Sidebar link is URL-active; unfinished destinations stay disabled. The read-only table, status filters, name/SKU search and lot/movement drawer follow MagicPath Kho component `458590758262427648`, revision `458596566140329984`; MagicPath was not modified.
- Inventory V1 §§2–3/6 defines V01 list, V02 ingredient/initial lots, V03 additional lots and V04 movements. Recorded physical stock, usable stock, completeness and unknown facts remain distinct. Quantities stay exact decimal strings; no float business arithmetic, inferred zero, unit conversion or stock mutation. Summary counts are Store-wide, not page totals. Details/continuations pin the list snapshot; expired snapshots invalidate the displayed set and require a full refresh.
- Inventory fixtures are deterministic illustrative reads, not backend evidence. API mode uses runtime response validation and never falls back to fixtures. Location is explicitly unsupported; AI/forecast actions are disabled. Inventory timestamps use validated current-Store timezone when available, with an explicitly labeled UTC fixture fallback; Store-local `as_of_date` and expiry/receipt dates are not converted. See [Inventory integration debt §J](docs/sprints/002/002-technical-debt-and-integration-todo.md#j-inventory-integration-maturity).
- `/menu` opens the read-only product/recipe workspace in AppShell; Menu is a URL-active Sidebar link. The table, name search, active/paused filters and product detail panel follow MagicPath component `458614109248847872`, revision `458616728595894272`, inspected read-only. Dự đoán opens Planning, Cửa hàng opens `/store`, and Hôm nay opens `/today`.
- Catalog/Menu/Recipe V1 §§4–8 defines P01 products and P02 product/current recipe. Search is product-name-only, server-side in API mode and over the complete fixture dataset before pagination in mock mode. Summary stays Store-wide. Cursor changes preserve filters; filter/search changes reset cursor. Catalog/date mismatch between pages or list/detail requires a fresh read set, not mixed-version data. P02 has no query parameters; the server selects the inclusive Store-date recipe, never the FE's highest version.
- Product UUID, recipe UUID/integer version, recipe-line UUID and ingredient UUID remain distinct. Exact quantities describe the whole recipe yield in canonical units; no unit conversion, float business arithmetic, BOM calculation or inventory availability inference. Missing recipe, known empty recipe, forbidden ingredient count, null price and zero price remain distinct. Menu timestamps use the response's Store timezone; date-only facts stay date-only. AI and the Menu→Kho ingredient action are disabled; no unfiltered stock link or fake saved edits. N20–N22 scheduling is designed in V1 but absent from this MagicPath workflow and not implemented. See [Menu integration debt §K](docs/sprints/002/002-technical-debt-and-integration-todo.md#k-menu--recipe-integration-maturity).

Copy the public settings from `.env.example` into an ignored `.env.local` if needed:

```env
VITE_DATA_SOURCE=mock
VITE_API_BASE_URL=http://localhost:18001
```

Development `mock` selects October 2026 UI examples. Import uses an explicitly labeled fixed inventory-count scenario whose state lives only in the mounted workspace closure; its simulated jobs are UI fixtures, not background analysis or backend evidence. It performs no HTTP requests and persists nothing. History/Inventory/Menu retain their fixture boundaries. Set `VITE_DATA_SOURCE=api` to use A03 bootstrap and canonical authenticated Store resolution. Production uses API mode and rejects a mock configuration. The base URL excludes `/api/v1`, which each feature supplies. Unspecified page limits are omitted, including I04 `files_limit` and T01 `limit` (backend default50/max100); small pages are QA-only. API business requests cannot proceed without resolved current Store context.

Restart Vite after changing these values; production values are embedded at build time. Override the development mock setting with `VITE_DATA_SOURCE=api` for deployment builds. All `VITE_*` values are public: never put API keys/passwords/shared secrets here. `.env` and `.env.*` are ignored except `.env.example`.

API mode never falls back to fixtures. Shared HTTP sends included cookies and `no-store`, obtains authenticated mutation CSRF from the session owner and preserves canonical errors/request references. Import delegates CSRF to that shared boundary; its optional injected source is retained for focused boundary tests only, not a feature-owned token lifecycle. Missing CSRF fails before the mutation is sent. Login is the pre-session exception; GET requires no mutation token. No fake token, bearer token, public secret or environment-token setting is used. Auth/Store models, validators and adapters are implemented in the FE; actual backend readiness is recorded below.

## Backend readiness and deployment requirements

The current V2 handoff and BE response report implemented Auth/Store/Import surfaces with historical executed evidence. This is not a fresh runtime verification or a staging-ready claim. A01/A03/A04/T01/T02 still need to work in a reachable environment before live FE acceptance can run. The configured local integration target is `http://localhost:18001`; it was unreachable in the current check.

Historical authority/evidence for the preceding baseline sections (current slice pins are in [contracts](contracts/README.md)): [V2 handoff](contracts/history/v2/README_VI.md), [current OpenAPI](contracts/history/v2/generated/openapi.json), [BE response](contracts/history/v1/004_IMPORT_FLOW_BE_RESPONSE_VI.md), and [local integration runbook](contracts/history/v2/docs/runbooks/S411_LOCAL_INTEGRATION.md). The older V1 Auth backlog and localhost8000 probe are historical, not proof of current endpoint absence. Controlled FE tests demonstrate boundary/workflow handling, not a working server login, browser acceptance or canonical database writes.

The server must set the opaque `__Host-shelfcash_session` cookie with Secure/HttpOnly/SameSite=Lax/Path=/ and no Domain, issue real A01/A03 CSRF, and enforce current memberships/grants. Local cookie development needs HTTPS or the backend's explicitly configured loopback cookie policy. Cross-origin deployment requires exact allowed FE origins, credentialed CORS and allowed `X-CSRF-Token`/`If-Match`/`Idempotency-Key` headers; all browser mutations, including login/logout, require Origin enforcement. FE does not fabricate Origin or weaken cookie attributes. A04 must return HTTP204 without a JSON envelope. SPA hosting must separately rewrite direct application paths to `index.html`, while preserving API and missing-asset responses.

Import Batch/Flow models, validation, API/mock adapters and workflows live in `features/import-data`; H01/H02 remain in `features/import-history`. Generic JSON and multipart transport live in `shared/http`. Batch adapters implement I01/I02/I03/I04; continuation implements M01/M02/M03/M04/N5, all three I05 phases, pinned I04 reads, J01 and I06. No new backend route is invented.

Import wire authority is the hash-pinned 016 handoff main, interpreted with current accepted domain/authorization contracts and the consolidated workflow; publication labels do not change `/api/v1` routes. 019 migrates Planning, Store Workspace and Operations schema closures to the same main016; unchanged session/read slices retain their established consumers. Batch accumulation, partial admission and receipt-set revision semantics remain resolved. Run `npm run check:import-wire` to detect local schema/type drift. Verification results and remaining live checks are recorded in [005](docs/sprints/005/005-import-input-schema-mapping.md); synthetic/SSR tests are not live backend evidence.

## Documentation & Architecture Reports

Tài liệu và báo cáo kiến trúc định kỳ được lưu trữ tại thư mục [`docs/`](docs/README.md):
- [Báo cáo #001: Thiết lập Nền tảng Dự án & Định hướng Kiến trúc](docs/architecture/001-architecture-foundation.md)
- [Báo cáo #006: Decision / Planning E2E integration](docs/sprints/006/006-decision-planning-e2e-integration.md)

## Sprint 016 contracts and integration

Start at [contracts/README.md](contracts/README.md) and [WORKFLOW.md](contracts/WORKFLOW.md). Historical v1/v2 were relocated byte-for-byte to `contracts/history`; run `npm run check:contracts` to verify preservation/pins. Import/SU01/Import-completion R01 consume the 016 main snapshot; Auth/Store/Planning/Operations keep separate 011 pins.

[016 sprint](docs/sprints/016/016_Integration_Sprint.md) records implemented typed Import compatibility, Supplier discovery, source_only/RULE guards and Readiness permissions, plus deferred MQ/NF/onboarding/deeper work. [FE_ask 016](FE_ask/016_Integration_Design_and_Verification.md) and [Found Missing UI](docs/FOUND_MISSING_UI.md) keep actual capability, design, FE wiring and live verification distinct. No production UI is invented from API availability.

[018 API-first services](docs/sprints/018/018_Backend_Capabilities_Service_Boundary.md) expose all 73 published main operations through typed services and scoped read/explicit mutation state. [019](docs/sprints/019/019_Main_Frontend_Implementation.md) now connects frozen supported onboarding, bootstrap, notifications, submissions and Today surfaces; unsupported action designs remain service-only. Run `npm run check:capabilities-wire` and `npm run test:capabilities` for this additive boundary; passing controlled checks is not live acceptance.

Main freeze implementation: [019 receipt](docs/sprints/019/019_Main_Frontend_Implementation.md), [remaining integration gaps](FE_ask/019_Freeze_Integration_Gaps.md), [latest missing UI register](docs/FOUND_MISSING_UI.md). Controlled checks are distinct from live Owner/Staff acceptance.
