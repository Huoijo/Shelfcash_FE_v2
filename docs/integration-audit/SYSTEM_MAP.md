Run: `20261016-windows-d5cfbfb-discovery`. Mode: **DISCOVERY_EXECUTION**. Date: 2026-10-16, Asia/Saigon. Outcome: **DISCOVERY_ENVIRONMENT_LIMITED**.

# System map

CURRENT FACT from src/app/AppRouter.tsx:23 route patterns including aliases/fallback; /imports index is the parent route, not an extra URL. AuthGuard and StoreProvider wrap protected routes; StoreGate excludes zero-Store entry except /store and account-scoped notifications. Exact production caller reachability and individual nested controls are only partially audited; the generated operation service is not proof of UI coverage.

| Route | Surface | Guard | BE operations | Controls/transitions to evaluate |
| --- | --- | --- | --- | --- |
| / | HomePage | public | none | marketing links |
| /login | LoginRoute/LoginForm | public | A01/A03 | login, remember, show password, retry, return target |
| /register | RegistrationPage | public | A02 | email/name, pending/error/uncertain |
| /email-verification | VerificationPage | public | A05/A06 | fragment proof/password/resend/cooldown |
| /password-reset | PasswordResetPage | public | A07 | request/reset email |
| /credentials/complete | CredentialsPage | public | N7 | SETUP/RESET proof completion |
| /invitations/:invitationId | InvitationPage | public + current holder | N18/N19/IN01 | offer/accept/decline/wrong-account/terminal/recovery |
| /store | StorePage/StoreBootstrap | AuthGuard, no StoreGate | T01/T02/T03/N12-N17/N4/PR01-04 | Store selection, zero Store, grants/invitations/budget |
| /notifications | NotificationsPage | AuthGuard, no StoreGate | NF01-03 | scope/filter/paging/read/handoff |
| /store/activity | StoreActivityPage | AuthGuard + StoreGate | N14/N16 | audit paging/detail |
| /today | TodayPage | AuthGuard + StoreGate | D01 | section availability and navigation |
| /inventory | InventoryPage | AuthGuard + StoreGate | V01-04/N6/N8 | search/status/snapshot/lot/movements/receipt/threshold |
| /menu/recipe | RecipeSchedulePage | AuthGuard + StoreGate | N20-22/P01/P02 | timeline/preview/commit/stale/effectivity |
| /menu | MenuPage | AuthGuard + StoreGate | P01/P02 | name/search/status/paging/detail |
| /forecast/planning/history | PlanningHistoryPage | AuthGuard + StoreGate | N9 | date/creator/status/filter/cursor/retained link |
| /forecast | PlanningRedirect | AuthGuard + StoreGate | none | preserve search/hash |
| /forecast/planning | PlanningPage | AuthGuard + StoreGate | C01-05/C08/R01/C02/N1-3/N9/N10/J01/N11/EX01 | setup/run/poll/results/reasons/requirements/export |
| /forecast/planning/results | PlanningRedirect | AuthGuard + StoreGate | none | preserve plan locator |
| /imports | ImportWorkspace/ImportPage | AuthGuard + StoreGate | I01-06/M01-04/N5/J01/R01/SU01 | file selection/admission/analyze/mapping/review/commit/readiness |
| /imports/history | ImportHistoryPage | AuthGuard + StoreGate | H01/H02 | calendar/filter/paging/detail/resume |
| /imports/approvals | MappingSubmissionsPage | AuthGuard + StoreGate | MQ02/03/N5 | Owner/own queue/evidence/decision; Staff MQ01 in import |
| /import-history | LegacyImportHistoryRedirect | redirect then destination guard | none | preserve search/hash |
| * | Navigate /login | fallback | none | unknown route |

## Data and state boundaries

src/features/auth/auth.data.ts -> A01/A03/A04; AuthProvider owns current session/CSRF in memory; A03 establishes authority. store/store.data.ts + StoreProvider/store.workflow.ts -> T01/T02, explicit current Store/authorization-version scope. No public development Store substitution. Shared HTTP uses credentials include/no-store, current mutation CSRF and structured errors.

importData.data/workflow -> draft/upload/analyze/coherent paged file set. importFlow.data/workflow -> mapping/schema resolution/profile/preview/confirmation/commit/completion/J01. importSubmission.data.ts -> MQ lifecycle; importReadiness.data.ts -> current R01 independently from completion. importEntitySearch.data.ts -> scoped discovery. import-history/importHistory.data.ts -> H01/H02, distinct retained import history. decision-planning/planning.data/workflow.ts -> C01/C02/C03/C04/C05/C08/R01 and operation-specific keys/pins. inventory.data/menu.data -> canonical paged reads/snapshots. store-workspace data/workflow and operations.data.ts -> grants/invitations/budget/requirements/recipe/receipt/PDF/history. capabilities.data.ts is a strict typed73-operation service; capabilities.react.ts hooks scope queries and retainedWrites memory map, capabilities.state.ts handles exact intent/replay/unknown fencing. It does not persist across browser reload (BUG-001).

Cache/state ownership is local React/workflow state and abort/generation fences, not a shared query-cache library. Actual storage search found only DEV mock scenario sessionStorage and fragment proof history.replaceState; no implemented IndexedDB durable mutation journal. Positive controlled results do not prove live permission revocation/late-read suppression or persistence.

BE route modules: auth, staff, notifications, permission_requests, mapping_submissions, public_reads, discovery, import_staging, history, planning_configuration/public/exports, readiness, stock_writes, recipe_schedule, plan_summary and assistant_chat. Transport delegates authority/transaction/CAS to application use cases; infrastructure/persistence stores retained snapshots/receipts. Reads/jobs require current scoped authority. Domain computation is backend-owned, forecast host default user-attested; Assistant wording is separate. No infrastructure changes were made.

## Every published operation and static consumer references

The table inventories all76 live operations. Reference columns identify explicit operation-ID tokens in non-generated FE source; an empty cell is **unproven UI reachability**, not an unsupported backend operation. Baseline reader clients using literal paths are described above even if no ID token is present. Request schema, query/header parameters and status codes are preserved in [machine-readable boundary evidence](evidence/20261016-windows-d5cfbfb-discovery/contract-comparison.json). For original73, full operation and transitive schema closure match. The current handoff is backend/docs/handoff at verified d5cfbfb; its JSON equals live OpenAPI. FE older pin is a version mismatch.

| ID | Method/path | Body DTO | Statuses | FE reference/coverage disposition |
| --- | --- | --- | --- | --- |
| health_health_get | GET /health | none/query/headers | 200 | Path-based reader or service-only; see family map |
| A02 | POST /api/v1/auth/register | RegistrationRequest | 202,400,403,413,422,429,503 | src/features/auth/AccountLifecycle.tsx; src/features/backend-capabilities/capabilities.state.ts |
| A06 | POST /api/v1/auth/email-verifications/request | PublicEmailRequest | 202,400,403,413,422,429,503 | src/features/auth/AccountLifecycle.tsx; src/features/backend-capabilities/capabilities.state.ts |
| A05 | POST /api/v1/auth/email-verifications/complete | CredentialCompletion | 200,400,403,413,422,429,503 | src/features/auth/AccountLifecycle.tsx |
| A07 | POST /api/v1/auth/password-reset/request | PublicEmailRequest | 202,400,403,413,422,429,503 | src/features/auth/AccountLifecycle.tsx; src/features/backend-capabilities/capabilities.state.ts |
| A01 | POST /api/v1/auth/login | LoginRequest | 200,400,401,403,404,422,429,503 | Path-based reader or service-only; see family map |
| A03 | GET /api/v1/auth/me | none/query/headers | 200,400,401,403,404,422,429,503 | Path-based reader or service-only; see family map |
| A04 | POST /api/v1/auth/logout | none/query/headers | 204,400,401,403,404,422,429,503 | Path-based reader or service-only; see family map |
| N7 | POST /api/v1/auth/credentials/complete | CredentialCompletion | 200,400,401,403,404,422,429,503 | Path-based reader or service-only; see family map |
| T01 | GET /api/v1/stores | none/query/headers | 200,400,401,403,404,422,429,503 | src/features/store/store.validation.ts |
| T03 | POST /api/v1/stores | StoreCreateRequest | 201,400,401,403,404,422,429,503,409,413,428 | src/features/store/StoreBootstrap.tsx |
| T02 | GET /api/v1/stores/{store_id} | none/query/headers | 200,400,401,403,404,422,429,503 | src/features/store/store.validation.ts |
| N12 | GET /api/v1/stores/{store_id}/memberships | none/query/headers | 200,401,403,404,409,410,412,422,428,429,503 | src/features/store-workspace/storeWorkspace.validation.ts |
| N13 | PUT /api/v1/stores/{store_id}/memberships/{membership_id}/permissions | GrantsRequest | 200,401,403,404,409,410,412,422,428,429,503 | src/features/store-workspace/storeWorkspace.validation.ts |
| N14 | GET /api/v1/stores/{store_id}/permission-events | none/query/headers | 200,401,403,404,409,410,412,422,428,429,503 | Path-based reader or service-only; see family map |
| N15 | POST /api/v1/stores/{store_id}/staff-invitations | CreateInvitation | 201,401,403,404,409,410,412,422,428,429,503 | src/features/store-workspace/storeWorkspace.validation.ts |
| N16 | GET /api/v1/stores/{store_id}/staff-invitations | none/query/headers | 200,401,403,404,409,410,412,422,428,429,503 | src/features/store-workspace/storeWorkspace.validation.ts |
| N17 | POST /api/v1/stores/{store_id}/staff-invitations/{invitation_id}/actions | ReissueInvitation, RevokeInvitation | 200,401,403,404,409,410,412,422,428,429,503 | src/features/store-workspace/storeWorkspace.validation.ts |
| N18 | GET /api/v1/staff-invitations/{invitation_id} | none/query/headers | 200,401,403,404,409,410,412,422,428,429,503 | src/features/backend-capabilities/capabilities.react.ts; src/features/backend-capabilities/capabilities.state.ts |
| N19 | POST /api/v1/staff-invitations/{invitation_id}/accept | AcceptInvitation | 201,401,403,404,409,410,412,422,428,429,503,200 | Path-based reader or service-only; see family map |
| IN01 | POST /api/v1/staff-invitations/{invitation_id}/decline | DeclineInvitation | 200,401,403,404,409,410,412,422,428,429,503 | src/features/auth/InvitationDecline.tsx; src/features/backend-capabilities/capabilities.state.ts |
| NF01 | GET /api/v1/notifications | none/query/headers | 200,400,401,403,404,409,412,413,422,428,503 | src/features/backend-capabilities/capabilities.data.ts |
| NF02 | GET /api/v1/notifications/unread-count | none/query/headers | 200,400,401,403,404,409,412,413,422,428,503 | src/features/backend-capabilities/capabilities.data.ts; src/features/notifications/NotificationProvider.tsx; src/features/notifications/NotificationsPage.tsx |
| NF03 | PATCH /api/v1/notifications/{notification_id} | ReadRequest | 200,400,401,403,404,409,412,413,422,428,503 | src/features/backend-capabilities/capabilities.data.ts; src/features/backend-capabilities/capabilities.react.ts; src/features/notifications/NotificationsPage.tsx |
| PR01 | POST /api/v1/stores/{store_id}/permission-requests | SubmitRequest | 201,400,401,403,404,409,412,413,422,428,503 | src/features/store-workspace/components/PermissionRequests.tsx |
| PR02 | GET /api/v1/stores/{store_id}/permission-requests | none/query/headers | 200,400,401,403,404,409,412,413,422,428,503 | src/features/store-workspace/components/PermissionRequests.tsx |
| PR03 | GET /api/v1/stores/{store_id}/permission-requests/{request_id} | none/query/headers | 200,400,401,403,404,409,412,413,422,428,503 | src/features/store-workspace/components/PermissionRequestNotice.tsx; src/features/store-workspace/components/PermissionRequests.tsx |
| PR04 | POST /api/v1/stores/{store_id}/permission-requests/{request_id}/actions | ApproveRequest, RejectRequest, CancelRequest | 200,400,401,403,404,409,412,413,422,428,503 | src/features/store-workspace/components/PermissionRequests.tsx |
| MQ01 | POST /api/v1/imports/{import_id}/mapping-submissions | SubmitMapping, WithdrawMapping | 200,400,401,403,404,409,412,413,422,428,503,201 | src/features/backend-capabilities/capabilities.data.ts; src/features/import-data/components/ImportSubmissionLifecycle.tsx; src/features/import-data/components/MappingSubmissionsPage.tsx |
| MQ02 | GET /api/v1/stores/{store_id}/mapping-submissions | none/query/headers | 200,400,401,403,404,409,412,413,422,428,503 | src/features/import-data/components/MappingSubmissionsPage.tsx |
| MQ03 | GET /api/v1/stores/{store_id}/mapping-submissions/{submission_id} | none/query/headers | 200,400,401,403,404,409,412,413,422,428,503 | src/features/import-data/components/MappingSubmissionsPage.tsx |
| P01 | GET /api/v1/stores/{store_id}/products | none/query/headers | 200,400,401,403,404,409,422,503 | Path-based reader or service-only; see family map |
| P02 | GET /api/v1/stores/{store_id}/products/{product_id} | none/query/headers | 200,400,401,403,404,409,422,503 | Path-based reader or service-only; see family map |
| V01 | GET /api/v1/stores/{store_id}/inventory | none/query/headers | 200,400,401,403,404,409,422,503 | Path-based reader or service-only; see family map |
| V02 | GET /api/v1/stores/{store_id}/inventory/{ingredient_id} | none/query/headers | 200,400,401,403,404,409,422,503 | Path-based reader or service-only; see family map |
| V03 | GET /api/v1/stores/{store_id}/inventory/{ingredient_id}/lots | none/query/headers | 200,400,401,403,404,409,422,503 | Path-based reader or service-only; see family map |
| V04 | GET /api/v1/stores/{store_id}/inventory/{ingredient_id}/movements | none/query/headers | 200,400,401,403,404,409,422,503 | Path-based reader or service-only; see family map |
| D01 | GET /api/v1/stores/{store_id}/today | none/query/headers | 200,401,403,404,409,422,503 | src/pages/today/TodayPage.tsx |
| SU01 | GET /api/v1/stores/{store_id}/suppliers | none/query/headers | 200,401,403,404,409,422,503 | Path-based reader or service-only; see family map |
| N6 | POST /api/v1/stores/{store_id}/inventory/receipts | StockReceiptRequest | 201,400,401,403,404,409,412,413,422,428,503,200 | Path-based reader or service-only; see family map |
| N8 | PUT /api/v1/stores/{store_id}/inventory/{ingredient_id}/threshold | ThresholdRequest | 200,400,401,403,404,409,412,413,422,428,503 | Path-based reader or service-only; see family map |
| N20 | GET /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule | none/query/headers | 200,400,401,403,404,409,412,413,422,428,503 | Path-based reader or service-only; see family map |
| N21 | POST /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule/changes | app__application__contracts__recipe_schedule__PreviewRequest, app__application__contracts__recipe_schedule__CommitRequest | 200,400,401,403,404,409,412,413,422,428,503 | Path-based reader or service-only; see family map |
| N22 | GET /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule/changes/{change_id} | none/query/headers | 200,400,401,403,404,409,412,413,422,428,503 | Path-based reader or service-only; see family map |
| I01 | POST /api/v1/stores/{store_id}/imports | DraftRequest | 201,400,401,403,404,409,412,413,415,422,428,503 | src/features/import-data/importData.validation.ts |
| H02 | GET /api/v1/stores/{store_id}/imports | none/query/headers | 200,401,403,404,409,413,422,503 | Path-based reader or service-only; see family map |
| I02 | POST /api/v1/imports/{import_id}/files | Body_I02 | 200,400,401,403,404,409,412,413,415,422,428,503 | src/features/backend-capabilities/capabilities.state.ts; src/features/import-data/importData.validation.ts |
| I03 | POST /api/v1/imports/{import_id}/analyze | AnalyzeRequest | 202,400,401,403,404,409,412,413,415,422,428,503 | src/features/import-data/importData.validation.ts |
| I04 | GET /api/v1/imports/{import_id} | none/query/headers | 200,400,401,403,404,409,412,413,415,422,428,503 | src/features/import-data/importData.validation.ts |
| M01 | GET /api/v1/imports/{import_id}/mapping-summary | none/query/headers | 200,400,401,403,404,409,412,413,415,422,428,503 | src/features/import-data/importFlow.validation.ts; src/features/import-data/components/MappingSubmissionsPage.tsx |
| M02 | GET /api/v1/imports/{import_id}/mappings | none/query/headers | 200,400,401,403,404,409,412,413,415,422,428,503 | src/features/import-data/importFlow.validation.ts |
| M03 | GET /api/v1/imports/{import_id}/sheets/{sheet_id}/field-options | none/query/headers | 200,400,401,403,404,409,412,413,415,422,428,503 | src/features/backend-capabilities/capabilities.data.ts; src/features/import-data/importFlow.validation.ts |
| M04 | PATCH /api/v1/imports/{import_id}/mappings/{mapping_id} | TargetRequest, ResolveRequest-Input | 200,400,401,403,404,409,412,413,415,422,428,503 | src/features/import-data/importFlow.validation.ts |
| N5 | POST /api/v1/stores/{store_id}/mapping-profiles/{profile_id}/decisions | Approve, Reject, RequestChanges, Retire | 200,400,401,403,404,409,412,413,415,422,428,503 | src/features/backend-capabilities/capabilities.data.ts; src/features/import-data/importFlow.validation.ts; src/features/import-data/components/MappingSubmissionsPage.tsx |
| I05 | POST /api/v1/imports/{import_id}/process | app__application__contracts__import_mapping__PreviewRequest, app__application__contracts__import_mapping__CommitRequest, ConfirmReviewRequest | 202,400,401,403,404,409,412,413,415,422,428,503,200 | Path-based reader or service-only; see family map |
| I06 | GET /api/v1/imports/{import_id}/completion | none/query/headers | 200,400,401,403,404,409,412,413,415,422,428,503 | src/features/import-data/importFlow.validation.ts |
| J01 | GET /api/v1/jobs/{job_id} | none/query/headers | 200,400,401,403,404,409,412,413,415,422,428,503 | src/features/import-data/importFlow.validation.ts |
| N1 | POST /api/v1/stores/{store_id}/planning-requirements | SaveRequest | 201,400,401,403,404,409,412,413,428,503,422 | Path-based reader or service-only; see family map |
| N2 | GET /api/v1/stores/{store_id}/planning-requirements/{saved_requirement_id} | none/query/headers | 200,400,401,403,404,409,412,413,428,503,422 | Path-based reader or service-only; see family map |
| N3 | PUT /api/v1/stores/{store_id}/planning-requirements/{saved_requirement_id} | ReplaceRequest, ArchiveRequest | 200,400,401,403,404,409,412,413,428,503,422 | Path-based reader or service-only; see family map |
| N4 | PUT /api/v1/stores/{store_id}/planning-budget | BudgetRequest | 200,400,401,403,404,409,412,413,428,503,422,201 | src/features/backend-capabilities/capabilities.data.ts; src/features/store-workspace/storeWorkspace.validation.ts |
| R01 | GET /api/v1/stores/{store_id}/readiness | none/query/headers | 200,400,401,403,404,409,422,503 | Path-based reader or service-only; see family map |
| C01 | GET /api/v1/stores/{store_id}/planning-context | none/query/headers | 200,400,401,403,404,409,422,503 | src/features/decision-planning/planning.validation.ts |
| C02 | POST /api/v1/stores/{store_id}/procurement-plans | PlanningRequest-Input | 202,400,401,403,404,409,422,503,200 | src/features/backend-capabilities/capabilities.data.ts; src/features/decision-planning/planning.validation.ts |
| N9 | GET /api/v1/stores/{store_id}/procurement-plans | none/query/headers | 200,401,403,404,409,413,422,503 | Path-based reader or service-only; see family map |
| C03 | GET /api/v1/procurement-plans/{plan_id} | none/query/headers | 200,400,401,403,404,409,422,503 | src/features/decision-planning/planning.validation.ts |
| C04 | GET /api/v1/procurement-plans/{plan_id}/ingredients | none/query/headers | 200,400,401,403,404,409,422,503,413 | src/features/decision-planning/planning.validation.ts |
| C05 | GET /api/v1/procurement-plans/{plan_id}/ingredients/{ingredient_id} | none/query/headers | 200,400,401,403,404,409,422,503,413 | src/features/decision-planning/planning.validation.ts |
| C08 | GET /api/v1/procurement-plans/{plan_id}/explanation | none/query/headers | 200,400,401,403,404,409,422,503 | src/features/decision-planning/planning.validation.ts |
| AS01 | POST /api/v1/procurement-plans/{plan_id}/assistant/summary | SummaryRequest | 200,400,401,403,404,409,413,422,429,503 | Absent older FE pin / parked AI UI |
| AS02 | GET /api/v1/procurement-plans/{plan_id}/assistant/summary/{generation_id} | none/query/headers | 200,400,401,403,404,409,413,422,429,503 | Absent older FE pin / parked AI UI |
| AS03 | POST /api/v1/procurement-plans/{plan_id}/assistant/messages | ChatRequest | 200,400,401,403,404,409,413,422,429,503 | Absent older FE pin / parked AI UI |
| H01 | GET /api/v1/stores/{store_id}/imports/calendar | none/query/headers | 200,401,403,404,409,413,422,503 | Path-based reader or service-only; see family map |
| EX01 | GET /api/v1/procurement-plans/{plan_id}/exports | none/query/headers | 200,400,401,403,404,409,413,422,503 | src/features/operations/RetainedExports.tsx |
| N10 | POST /api/v1/procurement-plans/{plan_id}/exports | ExportRequest | 202,400,401,403,404,409,413,422,503 | Path-based reader or service-only; see family map |
| N11 | GET /api/v1/procurement-plans/{plan_id}/exports/{export_id} | none/query/headers | 200,400,401,403,404,409,413,422,503 | src/features/backend-capabilities/capabilities.data.ts |

## Current MagicPath baseline

Read-only project458079658328604672 access verified,14 components listed and source contexts inspected. Exact latest revisions below; Auth/Owner/Staff previews visually inspected. Other preview/interaction branches were not visually evaluated; extracted state tokens are a partial index, not exhaustive design node/edge coverage. Original general Input flow is historical alongside role-specific current components. No design edits. AI/What-if/Draft PO remain parked according to current V1 and Underconstruction register, notwithstanding available Assistant BE APIs.

| Component | ID | Current revision |
| --- | --- | --- |
| ShelfCash · Đăng nhập / Đăng ký | 458185906336202752 | 461578655542439936 |
| ShelfCash · Input flow · OWNER | 460747146686242816 | 461726308171411456 |
| ShelfCash · Input flow · STAFF | 460747115572916224 | 461725038614315008 |
| ShelfCash · Kho · Tồn kho hiện tại | 458590758262427648 | 460395468028002304 |
| ShelfCash · Menu · Món và công thức | 458614109248847872 | 460607009654472704 |
| ShelfCash · Kế hoạch nhập · Thiết lập | 458414835571515392 | 461721652229738496 |
| ShelfCash · Kế hoạch nhập · Kết quả | 458423352311304192 | 461720833971347456 |
| ShelfCash · Cửa hàng workspace | 459953227023159296 | 461722261150400512 |
| ShelfCash · Thông báo | 461565920406556672 | 461576911768944640 |
| ShelfCash · Employee Invitation Acceptance | 460368412145782784 | 461727345703817216 |
| ShelfCash · Lịch sử nhập | 458255053002780672 | 458402037797892096 |
| ShelfCash · Hôm nay · Trung tâm chú ý | 458632053018234880 | 458637450923900928 |
| ShelfCash · Marketing Homepage · Grayscale | 458083907045322752 | 458087405988220928 |
| ShelfCash · Input flow | 458395069779681280 | 461108241670217728 |
