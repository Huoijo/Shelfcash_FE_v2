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
npm run build

# Lint code
npm run lint
```

## Current milestone: Menu FE foundation

- `/` redirects to `/login`; Login remains outside the application shell.
- `/imports` opens local file selection; `/imports/history` opens H01/H02 History inside the shared shell. `/import-history` redirects to `/imports/history`, retaining query parameters and fragment.
- Internal routes are intentionally unprotected for FE development. A future AuthGuard must wrap AppShell; this development routing is not production security.
- Login validates locally only. Registration/recovery and real session requests are not implemented.
- Import supports picker/drop, filename/size and remove/clear. Both addition paths validate the prospective local batch selection (existing + incoming) atomically: .csv/.xlsx filename extensions only, maximum 20 files per batch, 20 MiB per file and 100 MiB total compressed bytes per batch (inclusive, using source `File.size`, not expanded XLSX size). An invalid addition leaves the previous selection intact; suffix checks do not validate contents. Selection and data date stay in memory while navigating the Import workspace; leaving it or refreshing clears them. There is no upload, batch creation or processing. Future I01/I02 integration must enforce canonical server batch truth across actual upload calls, including files already accepted by the backend; see [integration debt §E](./docs/002-technical-debt-and-integration-todo.md#e-import-upload-contract-validation).
- Import History implements H01/H02 only, not inventory movements or planning history.
- HDSD opens a static, keyboard-accessible help drawer on `/imports`, following the read-only MagicPath interaction reference. Vietnamese preparation guidance comes from Import Contract V1 §§5, 6, 9.1 and 13; it distinguishes local selection from future server processing. It adds no route, upload or sample-file download. Exact column schemas, purchase-history imports and arbitrary supplier workbooks are not advertised.
- `/inventory` opens Kho in the existing AppShell. The Kho Sidebar link is URL-active; unfinished destinations stay disabled. The read-only table, status filters, name/SKU search and lot/movement drawer follow MagicPath Kho component `458590758262427648`, revision `458596566140329984`; MagicPath was not modified.
- Inventory V1 §§2–3/6 defines V01 list, V02 ingredient/initial lots, V03 additional lots and V04 movements. Recorded physical stock, usable stock, completeness and unknown facts remain distinct. Quantities stay exact decimal strings; no float business arithmetic, inferred zero, unit conversion or stock mutation. Summary counts are Store-wide, not page totals. Details/continuations pin the list snapshot; expired snapshots invalidate the displayed set and require a full refresh.
- Inventory fixtures are deterministic illustrative reads, not backend evidence. API mode uses runtime response validation and never falls back to fixtures. Location is explicitly unsupported; AI/forecast actions are disabled. Timestamp display is explicitly UTC until real Store timezone context is integrated; Store-local `as_of_date` and expiry/receipt dates are not converted. See [Inventory integration debt §J](./docs/002-technical-debt-and-integration-todo.md#j-inventory-integration-maturity).
- `/menu` opens the read-only product/recipe workspace in AppShell; Menu is a URL-active Sidebar link. The table, name search, active/paused filters and product detail panel follow MagicPath component `458614109248847872`, revision `458616728595894272`, inspected read-only. Hôm nay, Dự đoán and Cửa hàng remain disabled.
- Catalog/Menu/Recipe V1 §§4–8 defines P01 products and P02 product/current recipe. Search is product-name-only, server-side in API mode and over the complete fixture dataset before pagination in mock mode. Summary stays Store-wide. Cursor changes preserve filters; filter/search changes reset cursor. Catalog/date mismatch between pages or list/detail requires a fresh read set, not mixed-version data. P02 has no query parameters; the server selects the inclusive Store-date recipe, never the FE's highest version.
- Product UUID, recipe UUID/integer version, recipe-line UUID and ingredient UUID remain distinct. Exact quantities describe the whole recipe yield in canonical units; no unit conversion, float business arithmetic, BOM calculation or inventory availability inference. Missing recipe, known empty recipe, forbidden ingredient count, null price and zero price remain distinct. Menu timestamps use the response's Store timezone; date-only facts stay date-only. AI and the Menu→Kho ingredient action are disabled; no unfiltered stock link or fake saved edits. N20–N22 scheduling is designed in V1 but absent from this MagicPath workflow and not implemented. See [Menu integration debt §K](./docs/002-technical-debt-and-integration-todo.md#k-menu--recipe-integration-maturity).

Copy the public settings from `.env.example` into an ignored `.env.local` if needed:

```env
VITE_DATA_SOURCE=mock
VITE_API_BASE_URL=http://localhost:8000
VITE_DEV_STORE_ID=
```

`mock` (default) selects static October 2026 examples. Set `VITE_DATA_SOURCE=api` and provide an actual lowercase Store UUID in `VITE_DEV_STORE_ID` to attempt the canonical Store-scoped H01/H02, V01–V04 and P01/P02 endpoints. The base URL excludes `/api/v1`, which each feature supplies. Unspecified page limits are omitted (backend default50/max100); small pages are QA-only. The Store ID is a temporary public development scope, not a permission or a fake session. Leaving it empty in API mode produces an explicit configuration error on the page.

Restart Vite after changing these values; production values are embedded at build time. All `VITE_*` values are public: never put API keys/passwords/shared secrets here. `.env` and `.env.*` are ignored except `.env.example`.

API mode never falls back to fixtures. Business API deployment is unverified, and auth is not integrated, so network/contract errors are expected until a reachable backend and real session exist. Cross-origin requests require backend credentialed CORS/cookie support; the frontend does not work around it. Production hosting must rewrite SPA paths to `index.html` for direct route entry/refresh.

The Import History boundary keeps contract models, fixtures, response validation and data access in `features/import-history`; only generic JSON HTTP lives in `shared/http`. See the architecture document for contract provenance and nullable/date/cursor semantics.

## Documentation & Architecture Reports

Tài liệu và báo cáo kiến trúc định kỳ được lưu trữ tại thư mục [`docs/`](./docs/README.md):
- [Báo cáo #001: Thiết lập Nền tảng Dự án & Định hướng Kiến trúc](./docs/001-architecture-foundation.md)
