# ShelfCash frontend work

For all UI/interaction work, follow [.agents/rules/ui-magicpath-authority.md](.agents/rules/ui-magicpath-authority.md). UI must follow current MagicPath designs. API-first work may prepare data/services and tests independently; it never authorizes designing UI ahead of MagicPath. Missing designs stay tracked and pending.

When changing the Import flow (`src/features/import-data/` or `src/pages/imports/`), follow [.cursor/rules/import-ui-design-contract.mdc](.cursor/rules/import-ui-design-contract.mdc).

Read and maintain [docs/status/FOUND_MISSING_UI_V1.md](docs/status/FOUND_MISSING_UI_V1.md) as the current implementation/design/backend/verification register. Read [docs/FOUND_MISSING_UI.md](docs/FOUND_MISSING_UI.md) for historical evidence; preserve it without rewriting. Audit current OWNER/STAFF MagicPath designs before implementation; record gaps with independent statuses, ownership, next action and safe current behavior. Do not invent final production UI. Reuse defined shared patterns only when no new product decision is introduced; a temporary fallback does not resolve a design gap.

Keep correct business/API behavior, distinguish proposed/design-ready from runtime, and preserve existing user changes. Do not commit/push unless explicitly requested.

When planning, running, debugging or evaluating E2E / BE–FE integration against a live backend, read and follow [.agents/skills/live-be-fe-e2e/SKILL.md](.agents/skills/live-be-fe-e2e/SKILL.md). Apply it to the requested test scope, including Owner/Staff, design coverage, authoritative readback and mutation recovery. Mock/controlled/API-only checks must not be reported as live UI acceptance. This rule does not authorize live mutations outside the user's task.
