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

## Current milestone: Login + Import History

- `/` redirects to `/login`; `/import-history` is directly accessible, intentionally without auth guards.
- Login validates locally only. Registration/recovery and real session requests are not implemented.
- Import History implements H01/H02 only, not inventory movements or planning history.

Copy the public settings from `.env.example` into an ignored `.env.local` if needed:

```env
VITE_DATA_SOURCE=mock
VITE_API_BASE_URL=http://localhost:8000
VITE_DEV_STORE_ID=
```

`mock` (default) selects static October 2026 examples. Set `VITE_DATA_SOURCE=api` and provide an actual lowercase Store UUID in `VITE_DEV_STORE_ID` to attempt the canonical Store-scoped H01/H02 endpoints. The base URL excludes `/api/v1`, which the feature supplies. The Store ID is a temporary public development scope, not a permission or a fake session. Leaving it empty in API mode produces an explicit configuration error on the page.

Restart Vite after changing these values; production values are embedded at build time. All `VITE_*` values are public: never put API keys/passwords/shared secrets here. `.env` and `.env.*` are ignored except `.env.example`.

API mode never falls back to fixtures. Business API deployment is unverified, and auth is not integrated, so network/contract errors are expected until a reachable backend and real session exist. Cross-origin requests require backend credentialed CORS/cookie support; the frontend does not work around it. Production hosting must rewrite SPA paths to `index.html` for direct route entry/refresh.

The Import History boundary keeps contract models, fixtures, response validation and data access in `features/import-history`; only generic JSON HTTP lives in `shared/http`. See the architecture document for contract provenance and nullable/date/cursor semantics.

## Documentation & Architecture Reports

Tài liệu và báo cáo kiến trúc định kỳ được lưu trữ tại thư mục [`docs/`](./docs/README.md):
- [Báo cáo #001: Thiết lập Nền tảng Dự án & Định hướng Kiến trúc](./docs/001-architecture-foundation.md)
