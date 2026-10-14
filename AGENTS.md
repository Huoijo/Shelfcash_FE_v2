# ShelfCash frontend work

When changing the Import flow (`src/features/import-data/` or `src/pages/imports/`), follow [.cursor/rules/import-ui-design-contract.mdc](.cursor/rules/import-ui-design-contract.mdc).

Read and maintain [docs/FOUND_MISSING_UI.md](docs/FOUND_MISSING_UI.md): audit latest OWNER/STAFF MagicPath designs before implementation, record required states without adequate designs, and do not invent final production UI. Reuse defined shared patterns only when no new product decision is introduced. A temporary fallback does not resolve a design gap.

Keep correct business/API behavior, distinguish proposed/design-ready from runtime, and preserve existing user changes. Do not commit/push unless explicitly requested.
