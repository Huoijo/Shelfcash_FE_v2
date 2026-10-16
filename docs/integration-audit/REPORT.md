Run: `20261016-windows-d5cfbfb-resume-01`. Mode: **IMPLEMENTATION_AND_RESUME_DISCOVERY**. Date: 2026-10-16, Asia/Saigon. Outcome: **BOUNDED_LIVE_IMPORT_VERIFIED_WITH_REMAINING_LIMITS**.

# ShelfCash implementation and resumed discovery report

## A. Environment

The authorized Store is **Local Test Store**, `e2597866-e772-4bd5-9f3d-1996ddd0179c`. Separate Edge contexts verified Owner authority (43 permissions) and Staff's actual `menu.read` grant. The verified FE certificate was imported into CurrentUser Root; normal browser TLS validation then passed. [ENVIRONMENT](ENVIRONMENT.md) records fingerprints, the exact public certificate path and trust command.

The clean running backend remains `d5cfbfb59de7c45bc08eb47129b5ba3919e05473`, checkout `backend-local-runtime-d5cfbfb`, API https://localhost:8103, allowed Origin https://localhost:5173, database `shelfcash_local`, migration `l5_20261016_assistant_f4`, 76 tables and OpenAPI 76 operations / 69 paths. Four business workers were observed; three Import jobs actually executed. Email/Qwen/Summary/Chat OFF overrides remain user-attested; no provider or email workflow was invoked. No backend source, launcher configuration, migration, reset or restart changed.

FE HEAD advanced externally from `951ac2d` to `78d338c0616792e23f56af8411cfaf82d06ff749` during execution. The agent did not commit. Results apply to that HEAD plus the later working changes, identified by [six file hashes](evidence/20261016-windows-d5cfbfb-resume-01/source-files.json). Existing WIP was preserved. The [previous run](runs/20261016-windows-d5cfbfb-discovery/REPORT.md) was archived before active reports were replaced.

## B. Implementation

**BUG-001 is fixed for T03 Store creation.** An actor-scoped IndexedDB journal commits an explicitly allowlisted intent before dispatch, retaining the exact operation, key, validated body, actor, timestamps and required pins. Pending/unknown intents restore after reload. Storage failures stop dispatch. Web Locks and atomic reservation prevent competing intents across tabs. Explicit replay checks the current account and uses fresh session/CSRF headers with the original key/body. Empty readback or denied replay does not unlock a replacement. No credentials/tokens are journaled, and clearing storage is not cancellation. Other mutations retain their existing recovery behavior; this is not a claim of universal durable recovery.

The existing Store recovery UI was reused, consistent with MagicPath revision `461722261150400512`. **QA-001 is fixed:** the N9 fixture now matches current captured-budget/meta fields and unavailable-budget copy. Pagination/filter assertions remain, and an independent current-contract history control is retained.

## C. Coverage and verification

| Total | PASS | FAIL | BLOCKED | N/A | NOT_RUN |
| --- | --- | --- | --- | --- | --- |
| 279 | 269 | 2 | 4 | 4 | 0 |

| Mode | PASS | FAIL | BLOCKED | N/A |
| --- | --- | --- | --- | --- |
| CONTROLLED | 244 | 0 | 0 | 0 |
| STATIC_ONLY | 2 | 0 | 0 | 4 |
| LIVE_UI | 20 | 2 | 4 | 0 |
| API_ONLY | 3 | 0 | 0 | 0 |

[COVERAGE_MATRIX](COVERAGE_MATRIX.md) and its machine-readable ledger record individual dispositions. These are bounded assertions, not exhaustive coverage.

Final focused browser verification: **10 passed**, comprising eight T03 recovery cases and two history controls. Auth/capabilities/Store unit and SSR regressions: **205 passed** (26/61/118). TypeScript typecheck and changed-file oxlint passed. The initial affected browser group returned 34 passed / 3 failed; the obsolete fixture and account-switch test expectation were corrected, while an unrelated invitation extra-GET failure passed one unchanged rerun. The ledger represents 39 unique browser cases using latest applicable results; repeated attempts are not additional cases or a whole-suite pass.

From FE:

```text
npm run test:auth
npm run test:capabilities
npm run test:store
node node_modules/typescript/bin/tsc -b --pretty false
node node_modules/oxlint/bin/oxlint src/features/store/storeCreate.journal.ts src/features/store/storeCreate.react.ts src/features/store/StoreBootstrap.tsx
node node_modules/@playwright/test/cli.js test --config D:/hocc_bk/ai/proj/projectMLAI/backend/runtime/verification/integration-resume-20261016/final-focused.config.cjs store-journal.api.spec.ts history-contract.api.spec.ts design-states.api.spec.ts -g "T03|History paginates|Independent current-contract"
```

The initial group used `controlled.config.cjs` for store-journal/design-states/frozen-lifecycle/pass020. The unchanged invitation rerun selected pass020 with `-g "decline lost-pending"`. Configs/logs remain ignored under `backend/runtime/verification/integration-resume-20261016`. No full pytest, build, full lint or full live acceptance pass is claimed.

## D. Defects

Fixed: historical P2 BUG-001 (controlled T03 verification) and QA P3 QA-001. Newly documented, unfixed live P3 defects:

- **BUG-002:** an approved profile still presents an approval-required proposed-version diff caused by internal provenance differences.
- **BUG-003:** reloading a completed batch labels its source unconfirmed despite retained approved source evidence.

[BUGS](BUGS.md) records prerequisites, steps, expected/actual results, evidence and confidence. No new P0/P1/P2 was established; this does not prove their absence. New defects were not repaired outside scope.

## E. Contract and checkout diagnostics

Current runtime/handoff is d5cfbfb, 76 operations / 69 paths. FE main016 remains an older 73-operation pin. Prior comparison found original operations/DTO closures unchanged; that remains historical evidence rather than a new drift-gate PASS. No API or wire contract changed here. Existing CRLF/provenance failures remain: 153 CRLF-only files, two missing `.DS_Store` entries, and generated wire byte-check differences. No pins/manifests/checkers were rewritten and no `.DS_Store` was fabricated.

## F. Authorization

Owner and Staff login/context were verified against the exact Store. Staff Menu read passes and recipe information remains permission-gated. Inventory and completion reads returned 403; one Staff import-create probe returned 403. A fresh read-only database session confirms **zero Staff batches**. API-assisted negative probes remain labeled API_ONLY. Staff Planning shows permission guidance. No grants, users, additional Stores or foreign-Store writes changed. Multi-Store and revocation races remain untested.

## G. Recovery and cache

Controlled tests cover reload restoration, exact replay with fresh CSRF, empty readback, unavailable/write-failing storage, account changes, two tabs, late original success and denied replay. Simulated Store effects are distinct from real persistence; no real Store was created. Live Import results agree with fresh database state and Menu reload. Staff's previously empty Menu shows the permitted Product after explicit reload; automatic cross-session refresh is not claimed.

## H. Live workflow and retained records

One UI flow completed: admission → retained file/quota readback → exactly one Analyze → terminal job → explicit source declaration and metadata proposal → Owner approval → Preview → retained review confirmation → atomic Commit → terminal job/completion → fresh-session Product readback → completion/Menu deep-link and reload.

The authored disposable CSV is 141 bytes, SHA256 `1bcef4d73bb5c75a67be4c1ad79c243d4157afa10825caf94ef00c68f0a94e08`. Its units/identity/price were explicitly supplied as synthetic facts. No filename-derived business facts or original workbooks were uploaded.

Retained batch: `0532608d-53a2-499b-a248-afd91b069ced`. Retained Product: `c0a7181c-7258-48df-818e-19c6a028080b`, SKU `AUDIT-R2-P01`, name “Audit 20261016 R2 disposable product”, unit `ly`, price `12345` VND, active. Fresh guarded SQLAlchemy Session confirms exactly one matching Product, completed/sealed batch, no active job and three completed jobs:

- Analyze `6beec166-21c8-4190-a89e-0c645122bc0c`.
- Preview `c6b8c149-5a77-461a-b4c1-d100f32a77a3`.
- Commit `91b8b020-079b-45b4-899b-81a318f3bc67`.

Completion reports NEW 1 / changed 0 / no-op 0; inventory/sales/supplier/terms/fees effects are false. Profile/version, source, jobs, preview, review, receipt and audit provenance remain retained. No existing business record was changed/deleted. [Sanitized HTTP evidence](evidence/20261016-windows-d5cfbfb-resume-01/live-evidence.json) retains original mutation keys/body/CAS/pins; [fresh readback](evidence/20261016-windows-d5cfbfb-resume-01/final-db-readback.json) independently confirms persistence. No replacement batch or Analyze resend occurred.

## I. Error observations

An initial live history 503 produced safe error/retry UI; an independent read and fresh navigation/reload recovered to 200/empty. Auth persistence OperationalError/connection resets were logged, but root cause remains unestablished. An initial R01 diagnostic omitted required `actions` and returned 422; the corrected request returned a valid blocked result. Node APIRequestContext did not use Windows trust, so diagnostics used normal browser fetch; TLS validation was never disabled.

## J. Remaining limits

Planning readiness is blocked by missing Product history/recipe and absent default requirements, budget, model, limits and inbound completeness. R01 reports `NO_COMPUTABLE_PRODUCTS`, `BUDGET_CEILING_UNKNOWN`, `LIMIT_CONFIGURATION_UNKNOWN`, `COMMITTED_INBOUND_UNKNOWN`, `MODEL_CONFIGURATION_UNKNOWN`, `PRODUCT_HISTORY_MISSING` and `RECIPE_PERIOD_GAP`. No facts were invented to force a Run. No Run means retained Planning results, PDF and deterministic Assistant cases remain blocked. Provider-backed AI and real email remain excluded.

Notifications empty-list/unread/reload passed; populated/handoff writes lack a suitable notification fixture. Multi/foreign-Store and mutable-role fixtures remain unavailable. Six workbook hashes were reverified unchanged; prior structural inspection is not full formula/numerical/source-binding validation. Route/control/data-transition inventory remains incomplete.

## K. Follow-up

Review the scoped T03/fixture fixes; shared-device, storage eviction and deliberate clearing limits remain. Address BUG-002/003 in a separately authorized task. Supply approved history/recipe/configuration facts before dependent Planning tests, and authorize additional fixtures before expanding role/notification coverage. Resolve byte/provenance tooling while preserving historical integrity.

## L. Confidence, changed files and stop

Confidence is high for controlled T03 acceptance, TLS/login, actual Import worker execution and one-Product fresh-session persistence; limited for whole-app integration and blocked workflows. Temporary live browsers, the old harness and controlled FE4174 were closed after identity checks. FE5173 and the verified backend remain running. No agent commit/push/deploy, reset/migration, secret edit or provider/email enable occurred.

Product/test files changed: `src/features/store/storeCreate.journal.ts`, `storeCreate.react.ts`, `StoreBootstrap.tsx`; `tests/e2e/store-journal.api.spec.ts`, `design-states.api.spec.ts`, `history-contract.api.spec.ts`. Canonical audit documents and the scoped V1 recovery account were updated; the previous run was archived. The external commit captured some earlier edits, so the final Git diff alone does not describe the whole assignment.

Evidence limitation: an initial pre-fix invocation reused an old ignored output config and overwrote its raw browser JSON. Archived canonical reports, 761-case ledger and screenshots were preserved; subsequent outputs use the distinct current directory. An ephemeral cookie appeared in an initial tool exception but was not copied into tracked evidence. Current evidence is redacted; credentials, cookies and CSRF are absent from the product journal. This assignment stops with this report and retained disposable data.
