# #007 — Store Workspace E2E integration

ID: `#007` · Milestone 10 · Ngày tạo lập: 11/10/2026.

General Context: tích hợp Cửa hàng trong AppShell/Auth/Store hiện có, theo thiết kế MagicPath mới nhất và API handoff hiện hành. Báo cáo phân biệt semantics V1, runtime do BE bàn giao, implementation FE, controlled evidence và live acceptance. Không sửa contracts/backend, không commit/push; giữ nguyên thay đổi Import có sẵn.

## 1. Executive status

**PARTIAL — VERIFIED_CONTROLLED, chưa VERIFIED_LIVE.** FE hỗ trợ Store discovery/selection, thông tin canonical, Owner xem Staff/chỉnh quyền, tạo/quản lý lời mời và sửa trần ngân sách đã có version. Không triển khai persistence giả cho các trường thiết kế chưa có API.

**Gửi BE dev team:** đọc [§14.1–14.3 — yêu cầu phản hồi/bổ sung cho BE](#141-handoff-cho-be-dev-team) và [§14.4–14.10 — format JSON/API chi tiết](#144-format-jsonapi--phân-biệt-hiện-hành-và-đề-xuất). Có một clarification ưu tiên cao về ngân sách; các API profile/giờ hoạt động/trạng thái kinh doanh chưa có và cần chốt scope với Product. Không yêu cầu xây lại API quyền/lời mời đã bàn giao. Phần handoff này cập nhật 11/10/2026 bằng audit offline; không phải kết quả chạy live mới.

Authority: [V1 README](../api-contract-v1/README_VI.md), [aggregate](../api-contract-v1/SHELFCASH_API_CONTRACT_V1_VI.md), [AUTH](../api-contract-v1/AUTHORIZATION_CONTRACT_VI.md), [PROC §14](../api-contract-v1/PROCUREMENT_API_CONTRACT_VI.md); current [V2 handoff](../api-contract-v2/CONTRACT_HANDOFF_DELTA_VI.md), [OpenAPI](../api-contract-v2/generated/openapi.json), [Auth/session](../api-contract-v2/docs/features/AUTH_SESSION.md), [Staff permissions/invitations](../api-contract-v2/docs/features/STAFF_PERMISSIONS_INVITATIONS.md), [planning configuration](../api-contract-v2/docs/features/PLANNING_CONFIGURATION_READINESS.md), [public planning](../api-contract-v2/docs/features/PUBLIC_PLANNING.md) và [source evidence](../api-contract-v2/generated/source_evidence.json). Các ghi chú “no public API” ở persistence/V1 cũ là lịch sử; không phủ nhận handoff runtime mới. `IMPLEMENTED/HANDOFF` dưới đây không có nghĩa Python vừa được chạy lại hoặc server hiện tại đã xác minh.

Đã kiểm tra architecture/routes/session/shared HTTP, Import [003](003-import-flow-integration.md)/[005](005-import-input-schema-mapping.md), Planning [006](006-decision-planning-e2e-integration.md), readiness/configuration và dependencies Store-scoped. Không đưa endpoint engine, operator command hoặc DB writer vào browser.

## 2. MagicPath → FE implementation

Read-only project `458079658328604672`; component **`459953227023159296`**, revision **`459954103565570048`**, `ShelfCash · Cửa hàng workspace` / `gentle-dawn-6293`. Đã đọc toàn bộ code context và xem render; không sửa canvas. Đây là Store design mới, không dùng component Import/Planning làm thay thế.

| Thiết kế | FE implementation / adaptation |
| --- | --- |
| Existing sidebar/header, title + selector | Giữ AppShell; `/store` là link URL-active, lazy page. Không thêm shell/framework/UI dependency. |
| Tổng quan: profile, giờ mở cửa, trạng thái | Giữ cards/grid/density; name/timezone/currency từ T02. Những trường chưa có DTO/writer giữ disabled, unknown và giải thích rõ. |
| Thành viên & quyền | Staff roster N12 + current identity A03/T02 riêng; không tạo danh sách Owner giả. Member name là keyboard button. |
| Permission drawer | Native modal, catalogue/current grants, reason, full replacement N13; Owner/inactive/unknown grants readonly. |
| Invite drawer | Email + Staff cố định + offered grants + reason/catalogue; không copy prototype “Đã gửi” thành membership success. Known receipt đóng drawer, hiển thị trạng thái máy chủ. |
| Invitation lifecycle | Tách lời mời khỏi Staff; detail drawer nhẹ cho reissue/revoke và terminal states, không thêm module quản trị khác. |
| Thiết lập vận hành | Giữ nhóm chung/planning/nhận hàng/ngân sách. Chỉ known Store ceiling có writer; tên editable label đổi thành “Trần ngân sách cửa hàng” để không giả default budget. |
| No Store / restricted / errors | Không coi count0 là login failure; selection/loading/retry và Staff self rights readonly. Không ship prototype scenario switcher trong API mode. |

CSS giữ white/border/rounded cards, tab underline, drawer khoảng440px; narrow grids/drawers/table overflow có rules. Keyboard tab arrows/Home/End, modal focus containment/return, Escape/dirty discard được cài đặt. **SSR/helper/static CSS checks không chứng minh actual browser focus hoặc responsive screenshots.**

## 3. E2E Store flow

```text
A01 login → A03 session authority → T01 authorized Store list
  → one canonical default: T02; multiple: explicit local selection → T02
  → /store: overview / members / operating defaults
  → Owner: N12 Staff + catalogue, N16 invitations
      → N13 full grant replacement → canonical receipt → T02 refresh
      → N15 invitation + queued delivery → N16 refresh
      → N17 explicit reissue/revoke + CAS → N16 refresh
  → authorized budget reader: C01 current ceiling/version
      → N4 replace known ceiling + CAS → C01 refresh
  → explicit Store switch: clear/unmount A → T02 B → new B workspace
```

Session stays owned by AuthProvider; cookies/current memory-only CSRF use shared HTTP. API never falls back to fixtures. Selection does not mutate A03/default Store, create membership or persist to localStorage. No Store retains AppShell and access to `/store`; other business routes remain gated.

## 4. API surface

Paths below include `/api/v1`. `IMPLEMENTED/HANDOFF` means current V2 package reports implementation, not live verification. No writer in this table was called against the real server this milestone.

| Area | Method | Path | Purpose | Contract | Implementation | FE integration |
| --- | --- | --- | --- | --- | --- | --- |
| Auth | POST | `/api/v1/auth/login` | A01 login | AUTH | IMPLEMENTED/HANDOFF | Existing AuthProvider |
| Session | GET | `/api/v1/auth/me` | A03 identity/session authority | AUTH | IMPLEMENTED/HANDOFF | Existing bootstrap; first live probe only |
| Session | POST | `/api/v1/auth/logout` | A04 /204 | AUTH | IMPLEMENTED/HANDOFF | Existing shared session actions |
| Store list | GET | `/api/v1/stores` | T01 authorized discovery, cursor | AUTH | IMPLEMENTED/HANDOFF | Implemented; no inferred first Store |
| Store context | GET | `/api/v1/stores/{store_id}` | T02 metadata/current membership/effective rights | AUTH | IMPLEMENTED/HANDOFF | Implemented selection/refresh |
| Members | GET | `/api/v1/stores/{store_id}/memberships` | N12 Staff roster/catalogue; `role=STAFF&active=all` | AUTH §4 | IMPLEMENTED/HANDOFF | Owner only; paged |
| Permissions | PUT | `/api/v1/stores/{store_id}/memberships/{membership_id}/permissions` | N13 full replace grants/reason | AUTH §4 | IMPLEMENTED/HANDOFF | Owner only, key + Staff CAS |
| Permission audit | GET | `/api/v1/stores/{store_id}/permission-events` | N14 audit | AUTH §4 | IMPLEMENTED/HANDOFF | Not consumed; no designed audit affordance |
| Invitation create | POST | `/api/v1/stores/{store_id}/staff-invitations` | N15 email/offered grants/catalogue/reason | AUTH §6 | IMPLEMENTED/HANDOFF | Implemented; key, no token/account creation |
| Invitations | GET | `/api/v1/stores/{store_id}/staff-invitations` | N16 `view=invitations&sort=-issued_at`, cursor | AUTH §6 | IMPLEMENTED/HANDOFF | Implemented; not events view |
| Invitation actions | POST | `/api/v1/stores/{store_id}/staff-invitations/{invitation_id}/actions` | N17 reissue/revoke | AUTH §6 | IMPLEMENTED/HANDOFF | Implemented; key + invitation CAS |
| Recipient offer | GET | `/api/v1/staff-invitations/{invitation_id}` | N18 verified recipient/token | AUTH §6 | IMPLEMENTED/HANDOFF | Not consumed; recipient UI absent |
| Recipient accept | POST | `/api/v1/staff-invitations/{invitation_id}/accept` | N19 consent + atomic membership | AUTH §6 | IMPLEMENTED/HANDOFF | Not consumed; never Owner impersonation |
| Budget/config read | GET | `/api/v1/stores/{store_id}/planning-context` | C01 ceiling/default requirements | PROC | IMPLEMENTED/HANDOFF | Existing planning boundary reused |
| Budget write | PUT | `/api/v1/stores/{store_id}/planning-budget` | N4 create/replace ceiling | PROC §14 | IMPLEMENTED/HANDOFF | Replace known cap; ambiguous null creation blocked |
| Profile/settings write | — | **No canonical route** | Store metadata/preferences/hours/status/default priority/receiving calendar | Not defined | NOT_PRESENT | Readonly/unavailable; no giant settings PUT |

N1–N3 saved requirements are canonical, but not a Store-default registry/editor and not consumed here. R01 is not needed for saving a ceiling: planning readiness is independent of configuration saveability. C02/C03 behavior remains unchanged.

## 5. Store field audit

| Designed field | Ownership | Canonical read | Canonical write | API-mode behavior / gap |
| --- | --- | --- | --- | --- |
| Current Store selection | Local tab context over authorized memberships | T01/T02 | None/session not mutated | Explicit selection; no arbitrary UUID/first-row selection |
| Name | Store metadata | T02.name | Absent | Canonical readonly; Save disabled |
| Business type | Store profile | Absent | Absent | Unknown/disabled; no default “Café” in API |
| Address | Store profile | Absent | Absent | Unknown/disabled; no sample address |
| Phone | Store profile | Absent | Absent | Unknown/disabled; not account email/phone |
| Timezone | Store metadata, shared by both tabs | T02.timezone | Absent | Canonical readonly; no duplicate settings source |
| Currency | Store metadata, shared by both tabs | T02.currency | Absent | Canonical readonly; not writable through N4 |
| Monday open flag + start/end | Store operating hours | Absent | Absent | Unknown, no assumed07:00–22:00 |
| Tuesday open flag + start/end | Store operating hours | Absent | Absent | Unknown/disabled |
| Wednesday open flag + start/end | Store operating hours | Absent | Absent | Unknown/disabled |
| Thursday open flag + start/end | Store operating hours | Absent | Absent | Unknown/disabled |
| Friday open flag + start/end | Store operating hours | Absent | Absent | Unknown/disabled |
| Saturday open flag + start/end | Store operating hours | Absent | Absent | Unknown/disabled |
| Sunday open flag + start/end | Store operating hours | Absent | Absent | Unknown/disabled; no invented closed day |
| Active/paused business toggle | Product lifecycle, not access control | No such lifecycle DTO | Absent | Disabled. T02.active=true means technically accessible/active, not a writer for “Tạm ngưng” |
| Header activity badge | Accessible Store context | T02.active | None | Labels current accessible context; explanatory note distinguishes business lifecycle |
| Member name/email/role/status | Identity + membership | A03/T02 self; N12 Staff only | Only grants N13 | No fake Owner roster, role switch, delete/reactivate or ownership transfer |
| Staff permissions | Per-Store grants | N12 catalogue/grants/version | N13 | Explicit independent keys; reason/full replacement/CAS |
| Invitation email/role/permissions/status | Invitation, not current membership | N16 | N15/N17 | Staff fixed; offered grants only; delivery separate |

Illustrative profile values exist only behind explicit `mockPreview`, visibly marked DEV/QA. They are not API DTOs, editable persistence or evidence of BE fields.

## 6. Membership / permission model

N12–N17 Owner operations follow explicit canonical Owner-only authority from current T02; this is **not** a general “Owner allows everything” rule. Staff sees A03/T02 self identity/effective permissions readonly and does not request Owner lists. N12 is Staff-only; there is no complete Owner/member count inferred from its page. Inactive Staff can be inspected but cannot be edited/reactivated by N13.

Catalogue `permissions-v2` uses canonical keys, labels/descriptions/exposure/dependency guidance; UI provides Vietnamese task labels without replacing action IDs. Unknown/nondelegable keys stay readonly or fail closed at the boundary, never silently dropped, remapped or auto-granted. `required_with` is guidance only: missing prerequisites are explained, not automatically ticked. Cost/budget exposure stays distinct.

N13 sends only sorted unique `grants` and nonblank1..1000-character `reason`. `[]` explicitly revokes feature grants, not membership/session. Required original quoted `If-Match` and a distinct `Idempotency-Key`; no-op keeps version and `event_id=null`. Success/replay refreshes T02, causing all scoped business state to invalidate. 409/412/428 discard stale drafts, reread canonical data and require a new explicit intent; never auto-write with refreshed CAS.

401 follows central Auth invalidation. Workspace403/404 conservatively clears all sensitive roster/invitation/catalogue/budget caches, aborts concurrent reads and disables cached authority pending T02 refresh; it does not claim the exact reason is ownership revocation. Lost ACK keeps exact original key/body/CAS in memory; 5xx/unreadable replies remain uncertain. A later denial cannot prove the first request was unaccepted. After such denial retry is disabled, unresolved intent stays locked; external reconciliation is needed before knowingly leaving/resetting. No hidden persistent receipts.

Budget server rights are `budget.update + budget.read`, not Owner-only. FE additionally needs the **separate C01** composite read rights `planning.context.read + budget.read + procurement.cost.read` to obtain current ceiling/CAS. A Staff with only writer rights cannot safely fabricate the missing version; this is a reader/UX limitation, not an invented N4 cost permission.

## 7. Invitation lifecycle

Owner explicitly reviews email, optional initial grants, current catalogue and reason. N15 creates a pending invitation plus **queued delivery intent**, not an account/membership, active rights, successful SMTP or a read email. Unknown/existing account is not disclosed. Duplicate pending or existing membership errors remain canonical409, never treated as activation/merge. No pending invitation is added to the Staff roster.

N16 shows canonical pending/accepted/revoked/expired independently of queued/delivered/failed delivery. Reissue explicitly reviews offered grants/catalogue/reason, keeps recipient identity, rotates version/token server-side; revoke only affects pending invitation, not an existing member. Accepted is terminal. Expiry comes from server lifecycle/time; FE never grants by a local clock. LIST_VERSION_CHANGED/changed pages require whole-list reread, not mixed snapshots.

N18/N19 and verified-recipient acceptance **exist in BE handoff**, but this Owner workspace design has no recipient consent screen; no runtime recipient route is fabricated. Therefore full invitation→recipient acceptance E2E is still incomplete in FE. Future recipient UI must use authenticated verified matching account, memory-only token, erase fragment, no-referrer, current offer/CAS/consent; then refresh A03/T01/T02 after acceptance. No Owner token, token in query/localStorage/logs, Owner accept-as-Staff or bypass verification. Assisted account/credential setup remains external to this workspace.

Delivery dispatcher/operator configuration is a BE/deployment responsibility, not a command executed by FE. SMTP acknowledgment is not evidence the recipient read/accepted. Audit readers/events exist but are not exposed in this design.

## 8. Store switching

T01 lists only authorized active Store summaries with name/UUID ordering, default50/max100 cursor pagination. A03 count0 is valid no-Store; one Store uses its canonical default; multiple/defaultnull requires explicit selection. T01 does not invent Store settings, snapshot/as_of fields or authoritative full membership data. T02 can be newer than its discovery summary.

Switch invalidates current ID and unmounts A before reading B. AppShell Outlet is keyed by Store ID + current membership authorization version + catalogue version; Import draft/continuation/History, Planning context/results/detail, Inventory/Menu pages and drawers remount under B. Aborted/late A responses cannot restore A. A03 owner changes hide old scope synchronously. No resource locator silently switches Store or grants access.

Dirty forms, saving and uncertain intents block Store changes. Permission writes and fresh T02 changes invalidate feature state; session credentials/CSRF remain shared. Failed B read leaves no current Store/fallback A facts. Counts/cursors/catalogue shifts reject mixed lists. Store membership revocation is enforced by BE on every request, not by hiding navigation alone.

Explicit DEV source has two Stores; B is restricted Staff. Legacy Inventory/Menu/History/Planning mocks are A-only, so B's non-Store business routes show an unsupported-fixture note rather than A data labeled B. Workspace mock server memory is per Store, lasts through route/T02 remounts and clears on browser reload; no HTTP, real session, disk storage or delivery. API source never uses it.

## 9. Operating defaults audit

| Design control | True owner / read | Write surface | FE decision |
| --- | --- | --- | --- |
| Week start Monday | Store preference not defined | Absent | Unknown/disabled, no assumed persisted Monday |
| Display language Vietnamese | Current FE presentation only; no Store preference | Absent | Label “giao diện hiện tại”, disabled; not saved metadata |
| Timezone/currency | Same T02 Store metadata as overview | Absent | Canonical readonly, no duplicate source |
| Planning horizon7/5/3 | Current server horizon fixed7, C01 | No Store/per-run horizon writer | Show7 readonly; no5/3 payload |
| Include open PO | Current capability false | Absent/unsupported | Disabled false with explanation; not local planning input |
| Default priority pills | No Store default-priority concept; strategies are server compared results | Absent | All disabled/unselected; no fake balanced default or strategy payload |
| Receiving weekdays T2–CN | Store receiving calendar not defined | Absent | Unknown/disabled; supplier-specific delivery calendars are different ownership |
| Designed “default import budget” | Not a canonical persistent default amount | No giant defaults writer | Preserve card but clarify concepts below |
| Store ceiling | C01.budget_ceiling amount/currency/version/time | N4 | Replace known cap with exact text/CAS; zero valid; unknown/null not unlimited |
| Default requirements budget | C01.default_requirements.budget_limit | Not N4; N1–N3 are saved sets, not current default writer | Readonly; null means inherit current ceiling, missing defaults means unknown |

N4 body is only `{amount: MoneyText}` (up to18 integer/18 fractional digits); no currency, date, horizon, default version or priority. Null/unlimited is not supported. Existing cap requires quoted `If-Match`; verified initial absence would require **only** `If-None-Match:*`. Current successful C01 nullable shape has no explicit absence-vs-unreadable discriminator/guarantee in the handed-off evidence: initial creation stays blocked pending narrow clarification. Boundary supports explicit create condition, but UI does not guess it.

Writes do not require executable forecasting/readiness, run a plan, alter saved/default requirements or rewrite accepted Runs. Reduced ceiling may make saved sets invalid; C01 is reread, not clamped. Dự đoán keeps per-run request overrides and retained cap-at-acceptance separately. No duplication as a new Store settings engine.

## 10. Live integration evidence

**LIVE_ENVIRONMENT_BLOCKER.** BE maintenance was already reported by the user; no repeated per-feature probes or waiting.

First and only endpoint probe: `GET http://localhost:18001/api/v1/auth/me` (A03), 11/10/2026; curl with2s connection/4s total limit, no credentials/cookies supplied: connection failed, exit7, HTTP000. No response/status/request ID/body exists. Sandbox/network policy may also constrain localhost; this result establishes no successful connection, not a new diagnosis of the deployment. No retry outside sandbox this milestone.

A03 did not complete; T01/T02, members, permissions, invitations, settings/budget and Store switching therefore have **no live evidence**, and were not individually probed. A01/A04 were not invoked live. No real credentials, DB resets/seeds, operator scripts, workers, invitations or business writes were used.

Browser skill was read; its supported browser execution tool was not exposed after discovery. Consequently native interaction, screenshots at desktop/mobile, focus return/trap, actual history refresh and credentialed requests are **NOT VERIFIED_BROWSER**. Controlled SSR/logic/static-responsive checks below are explicitly lower-tier evidence. No unsupported automation fallback or fake live claim.

## 11. Concerns / issues

| ID | Concern | Evidence | Impact | Classification | Owner | Recommended next action | Blocking? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S01 | Profile, business lifecycle and operating preferences lack canonical writes (many lack reads) | T02/OpenAPI vs field audits §§5/9 | Designed Save/settings cannot persist | PRODUCT GAP | Product + BE | Decide ownership/semantics, contract narrow fields/writers; keep current readonly | Yes for full designed persistence |
| S02 | Null ceiling cannot prove initial absence | PROC14.6 vs nullable C01, configuration handoff | Cannot safely initiate first N4 cap | CONTRACT GAP | BE | Explicit guarantee successful C01null means verified absence, or expose discriminator/read error semantics | Yes for initial creation only |
| S03 | Recipient acceptance/audit UI not in this Store design | N14/N18/N19 exist; Owner canvas only | Not whole invitation E2E; no audit viewing | DESIGN GAP | Product + FE | Specify recipient consent route/token handling; separately decide audit affordance | Yes for full recipient journey, not Owner writes |
| S04 | No live BE or browser interaction acceptance | First probe/tool availability §10 | Cannot certify persistence, current-grant fences, delivery or responsive interactions | LIVE ENVIRONMENT BLOCKER | BE/deployment + QA/FE | After maintenance run authorized acceptance in browser; do not resend real writes blindly | Yes for live sign-off |
| S05 | Existing main bundle remains over500kB | Production build warning | Performance debt, not failed compilation | TECH DEBT | FE | Separate safe code-splitting/performance milestone; Store itself lazy-loaded | No |

No observed live BE BUG or proven CONTRACT DRIFT is asserted. Archived handoff tests are implementation evidence only; no security/atomicity certification from FE tests.

## 12. Test evidence

Final controlled counts: **Store113/113**, **Auth26/26**, **Planning76/76**, **Import93/93**; **308/308**, zero skipped/failures.

| Command / suite | Exact result | Evidence scope |
| --- | --- | --- |
| `npm run test:store` → store-context | 22/22 | T01/T02/default/multi/empty, guards, scope invalidation, stale responses |
| → store-workspace-boundary | 27/27 | Frozen DTOs, HTTP paths/headers/CSRF, errors, full grants, receipt/lifecycle/identity invariants |
| → store-workspace-workflow | 36/36 | Rights, CAS/lost ACK/retry, no-op, known receipt vs failed GET, authorization cache clearing, pagination, budgetzero/null, invitation lifecycle |
| → store-workspace-ui | 20/20 | SSR escaping/readonly states, labels, keyboard/focus helpers, money parsing and static responsive rules |
| → store-navigation | 8/8 | Return paths, Sidebar, scope-keyed shell, route gating, no/multi Store SSR |
| `npm run test:auth` | 26/26 | Existing Auth/session/shared HTTP regressions |
| `npm run test:planning` | 76/76 | Existing Decision/Planning regression |
| `npm run test:import` | 93/93 | Existing dirty-worktree Import regression preserved |
| `npm run check:store-wire` | PASS25schemas/25types | SHA256 `0680aa9925364a6597c2b4e28c212a72ca00531f427b407d1f34ac164e2b5bde` |
| `npm run check:planning-wire` | PASS80schemas/80types | Existing slice drift gate |
| `npm run check:import-wire` | PASS123schemas/119types | Existing slice drift gate |
| `npm run build` / `npm run lint` / `git diff --check` | PASS | TypeScript + production bundle; main chunk warning remains; no lint warnings |

Tests use synthetic controlled sources/fetch/SSR, not actual database/email/server grants. Store permission/ceiling mutation atomicity and real replay/CSRF/CORS/cookie behavior require BE/live tests. Browser interaction and real A→B feature traversal remain open.

## 13. Files changed

Exact **38 M10 files** below. Other dirty/untracked Import/V2 handoff files predate this milestone and are not claimed as new M10 changes. No dependency/lockfile, env, contract or backend file changed for M10.

```text
README.md
docs/README.md
docs/001-architecture-foundation.md
docs/002-technical-debt-and-integration-todo.md
docs/007-store-workspace-e2e-integration.md
package.json
src/app/AppRouter.tsx
src/features/auth/auth.navigation.ts
src/layouts/app-shell/AppShell.tsx
src/layouts/app-shell/Sidebar.tsx
src/features/store/StoreProvider.tsx
src/features/store/store.context.ts
src/features/store/store.data.ts
src/features/store/store.fixtures.ts
src/features/store/store.workflow.ts
src/features/store-workspace/storeWorkspace.types.ts
src/features/store-workspace/storeWorkspace.wire.ts
src/features/store-workspace/storeWorkspace.validation.ts
src/features/store-workspace/storeWorkspace.data.ts
src/features/store-workspace/storeWorkspace.fixtures.ts
src/features/store-workspace/storeWorkspace.format.ts
src/features/store-workspace/storeWorkspace.workflow.ts
src/features/store-workspace/components/index.ts
src/features/store-workspace/components/StoreWorkspaceChrome.tsx
src/features/store-workspace/components/StoreOverview.tsx
src/features/store-workspace/components/StoreMembers.tsx
src/features/store-workspace/components/StoreWorkspaceDrawers.tsx
src/features/store-workspace/components/StoreOperatingDefaults.tsx
src/features/store-workspace/components/StoreWorkspace.css
src/pages/store/StorePage.tsx
src/pages/store/StorePage.css
scripts/check-store-wire.mjs
tests/run-store-workspace.mjs
tests/store-context.test.mjs
tests/store-workspace-boundary.test.mjs
tests/store-workspace-workflow.test.mjs
tests/store-workspace-ui.test.mjs
tests/store-navigation.test.mjs
```

## 14. Remaining scope

- **FE incomplete:** native browser QA; recipient N18/N19 consent/acceptance screen (no current design), audit UI if selected; no durable uncertain-intent resume across logout/reload. Known-cap Owner/Staff management and switching are implemented, not labeled unfinished simply because live is offline.
- **BE/API missing:** metadata mutation and unsupported profile/hours/business status/Store preferences/receiving-calendar/default-priority surfaces. Existing N12–N19/N4 are not missing endpoints. Product must first authorize exact ownership/semantics; no giant settings API is requested by inference.
- **Contract clarification:** only narrow S02 blocker for safely creating the initial budget; distinguish absent from unavailable, including Staff reader/CAS accessibility if product needs writers lacking C01 cost rights. No need re-clarify settled grant/invitation/CAS semantics.
- **Live environment:** after maintenance, authorized Owner + restricted Staff + two-Store accounts; verify A03/T01/T02 and each listed read/write, fresh permissions/denials, CAS conflicts/no-op/same-intent retries, canonical budget reread, invitation delivery/recipient consent, deep links/refresh and responsive/focus behavior. Use synthetic test data and explicit authorization for mutations; retain request references only, not secrets.
- **Future enhancement:** recipient/audit design, performance/chunk splitting, large-roster pagination/load acceptance, explicitly designed safe resume. Ownership transfer, membership delete/reactivation, custom settings service, local business engine, automatic planning/PO/email dispatch and one-time bypass are outside scope.

Handoff decision: send BE the narrow budget-null question and field ownership gap inventory; do not ask them to rework already-settled contract or treat maintenance as a semantic defect. Do not claim Store E2E complete until real acceptance exists.

### 14.1. Handoff cho BE dev team

Mục tiêu phản hồi: xác nhận cách FE dùng API hiện hành và thống nhất phần thiết kế Store chưa có canonical surface. **Đây là yêu cầu làm rõ/đề xuất scope, không tự động phê duyệt thêm API, schema hoặc policy.** “Chưa có” bên dưới là chưa thấy trong root V1/current V2 OpenAPI được bàn giao; nếu BE đã có surface mới hơn, vui lòng gửi đúng contract/version thay vì để FE đoán route.

**BE-01 · P0 · Contract clarification — điều kiện tạo trần ngân sách lần đầu.**

- Hiện có C01 `GET /api/v1/stores/{store_id}/planning-context` và N4 `PUT /api/v1/stores/{store_id}/planning-budget`; **không thiếu budget writer**.
- Cần BE xác nhận: response C01 **HTTP 200 + `budget_ceiling:null` có luôn nghĩa là đã đọc thành công và xác minh chưa có cấu hình trần không?** Nếu loader/nguồn budget không đọc được thì trả HTTP/error code nào; có trường hợp vẫn 200/null không?
- Evidence: [PROC §14.6](../api-contract-v2/docs/PROCUREMENT_API_CONTRACT_VI.md#planning-configuration-6) phân biệt verified absence với unreadable; schema `Context.budget_ceiling` trong [OpenAPI](../api-contract-v2/generated/openapi.json) hiện chỉ nullable, chưa có discriminator. `readiness.can_generate=false` hoặc worker không hoạt động không tự chứng minh budget thiếu/không đọc được.
- Phản hồi tối thiểu cần: guarantee chính thức và ví dụ cho ba tình huống **chưa cấu hình / đã cấu hình amount="0" / đọc nguồn thất bại**. Nếu response 200/null đã bảo đảm absence thì chỉ cần bổ sung rõ contract/evidence, **không cần endpoint mới**. Nếu không, BE đề xuất semantics phân biệt được, giữ nguyên deny-by-default và CAS.
- Sau xác nhận, FE có thể mở N4 create-only bằng `If-None-Match:*` + key cho verified absence; cap có version vẫn dùng `If-Match`. Không tự đổi null thành0/unlimited, không gửi cả hai conditional headers. Hiện FE chỉ khóa initial create, không khóa known-cap replacement.

**BE-02 · P1 nếu Product duyệt · API gap — Store profile và metadata mutation.**

- T02 hiện đọc `name`, `timezone`, `currency`; không có profile mutation. `business type`, `address`, `phone` trong thiết kế chưa có canonical read/write DTO. Không có `PATCH/PUT /stores/{store_id}` trong current OpenAPI.
- Cần BE + Product chốt từng field: có trong scope không, nullable/unknown thế nào, ai được xem/sửa và field nào immutable. Nếu duyệt lưu profile, cần canonical reader/writer tương ứng; **BE quyết định method/path/DTO**, FE không tự áp đặt một Store CRUD/settings endpoint.
- Riêng **timezone/currency**: không mặc định là field có thể sửa chung với tên/địa chỉ. Cần quyết định ảnh hưởng Store-local dates, dữ liệu tiền hiện có, cấu hình và retained Runs; nếu immutable thì xác nhận để FE giữ readonly.
- Output mong muốn: field matrix, read/write operation nếu có, quyền hiện hành, version/precondition, idempotency/replay/no-op, validation/errors và response example. Metadata mutation cần version đúng resource; **không dùng T02 `authorization_version` của membership làm Store/profile CAS**. Không để nút Save chỉ ghi state FE.

**BE-03 · P1 nếu Product duyệt · API gap — giờ hoạt động và trạng thái kinh doanh.**

- Chưa có reader/writer cho lịch mở cửa theo từng thứ: mở/đóng, giờ bắt đầu/kết thúc; cần chốt closed day, unknown, khung giờ qua ngày và timezone áp dụng trước khi FE gửi dữ liệu.
- Chưa có business lifecycle “Đang hoạt động/Tạm ngưng” như thiết kế. T02 `active=true` hiện là accessible/active Store context; **không được tự dùng làm API tạm ngưng kinh doanh hoặc vô hiệu quyền truy cập**.
- Cần Product + BE quyết định pause ảnh hưởng phần nào: chỉ vận hành, cho phép đọc lịch sử/cấu hình, có chặn Import/Planning hay không và ai có quyền mở lại. Sau đó BE cung cấp canonical state/writer và concurrency/error semantics, hoặc xác nhận deferred để FE tiếp tục disabled.

**BE-04 · P2 / cần Product quyết định · Operating defaults — không coi mọi control là thiếu API đơn giản.**

- **Week start / display language:** xác định là Store preference, User preference hay chỉ presentation của FE; chỉ cần API nếu đã duyệt persistence theo đúng owner.
- **Ngày nhận hàng của Store:** nếu đưa vào scope, chốt đây là preference hay hard constraint, cách đọc/ghi và tác động tới planning. Không lấy supplier-specific delivery calendar thay thế.
- **“Ngân sách mặc định”:** N4 hiện sửa Store ceiling; C01 default requirements là nguồn khác, N1–N3 là saved requirement sets, không phải writer của current default. Nếu Product thật sự cần chỉnh default requirements thì cần design/contract riêng; không đổi nghĩa N4 hoặc dùng saved set như default registry.
- **Horizon5/3, ưu tiên mặc định, Open PO:** hiện horizon cố định7, strategies là các phương án server so sánh, Open PO capability false. FE giữ disabled; mở các control này là thay đổi product/engine scope, **không yêu cầu BE bổ sung writer chỉ để khớp prototype**.
- Vui lòng trả lời từng nhóm `SUPPORTED` / `DEFERRED` / `NEEDS_PRODUCT_DECISION`, không tự gộp thành một endpoint settings tổng quát.

**BE-05 · P2 / conditional clarification — quyền đọc version cho Staff chỉ quản lý ngân sách.**

- N4 server yêu cầu `budget.read + budget.update`; C01 lại cần `planning.context.read + budget.read + procurement.cost.read` vì toàn response có dữ liệu nhạy cảm. Staff có writer rights nhưng thiếu C01 rights hiện không có canonical cách đọc cap/version để FE dựng CAS.
- Cần xác nhận workflow dự kiến cho nhóm Staff này: chấp nhận điều kiện C01 hiện hành và UI unavailable, hay Product cần budget administration độc lập với quyền xem procurement costs?
- **Không yêu cầu BE thêm GET budget ngay:** [PROC §14.3](../api-contract-v2/docs/PROCUREMENT_API_CONTRACT_VI.md#planning-configuration-3) hiện chủ ý không có GET budget riêng. Nếu cần workflow độc lập, phải thống nhất amendment/minimal protected read/CAS semantics trước; không làm yếu C01 authorization, thêm tiền vào T02 hoặc tự cấp cost rights.
- Không chặn Owner/Staff đã có đủ C01 rights; đây là quyết định coverage cho permission combination, không phải bằng chứng BE authorization bug.

### 14.2. Không cần BE bổ sung lại / chưa phải API gap

- **Multi-Store:** A03/T01/T02 đã đủ discovery/context; chọn Store là FE-local context, không cần session-default mutation hoặc Store-switch endpoint.
- **Staff permissions:** N12/N13 đã có catalogue, full replacement, CAS, reason, idempotency và no-op. Không cần grants gộp đơn giản theo role, auto-add prerequisites hoặc Staff tự sửa quyền.
- **Invitations:** N15/N16/N17 đã có initial offered grants, lifecycle và delivery status. N18/N19 đã có verified-recipient review/acceptance; thiếu màn hình consent là FE/design, không phải yêu cầu BE tạo acceptance API mới.
- **Audit:** N14 và N16 events view đã có; chưa consume trong Store design này không có nghĩa thiếu backend.
- **Budget/saved requirements:** C01/N4 và N1–N3 đã có; giữ đúng ranh giới ceiling / current default / saved set / per-run override. Chỉ BE-01 cần làm rõ để mở initial ceiling creation.
- **SMTP/delivery:** dispatcher và cấu hình delivery là BE/deployment; cần phối hợp môi trường khi nghiệm thu, không bổ sung endpoint lộ token cho Owner hoặc báo queued là delivered.
- **Owner transfer, xóa/reactivate membership, Store CRUD tổng quát:** ngoài scope hiện tại; không đưa vào backlog BE như yêu cầu đã được Product duyệt.
- **BE maintenance / browser QA / bundle:** lần lượt là live environment, FE/QA và FE performance; không phân loại thành missing API hay BE bug.

### 14.3. Mẫu phản hồi và thứ tự xử lý đề nghị

BE vui lòng phản hồi theo từng ID `BE-01`…`BE-05` với:

1. **Kết luận:** `CLARIFIED_NO_API_CHANGE`, `EXISTING_API` (kèm version/path), `NEEDS_CONTRACT_ADDITION`, `NEEDS_PRODUCT_DECISION` hoặc `DEFERRED`.
2. **Semantics được chốt:** field ownership, quyền, null/unknown/zero và ảnh hưởng scope; không chỉ trả lời “đã hỗ trợ”.
3. **Nếu có API mới/đổi:** method/path, request/response/schema examples, precondition/version, idempotency/no-op, errors và compatibility với T02/C01/retained Runs. Cập nhật canonical contract + OpenAPI; không chỉ gửi route qua chat.
4. **Evidence:** implementation/handoff version, targeted acceptance evidence và điều kiện môi trường; không gửi credentials, cookie, CSRF hoặc invitation tokens vào tài liệu/Git.

Ưu tiên: **trả lời BE-01 trước**; tiếp theo xác nhận Product scope cho BE-02/03; BE-04/05 chỉ mở rộng khi có quyết định tương ứng. Sau bảo trì mới phối hợp live acceptance với test Store/Owner/Staff được cấp hợp lệ, Origin/cookie/CSRF và invitation delivery được cấu hình. Không cần chờ server chạy để trả lời clarification hoặc chốt contract; không có yêu cầu probe/live write mới trong lần cập nhật tài liệu này.

Kiểm chứng lần cập nhật handoff: documentation-only; kiểm tra cấu trúc 14 major sections, local links và whitespace. Kết quả 308 tests ở §12 là evidence của lượt implementation M10 trước đó, **không phải vừa chạy lại trong lượt sửa docs này**. Chỉ chỉnh `docs/007-store-workspace-e2e-integration.md`; không sửa code/contracts/backend và không commit/push.

### 14.4. Format JSON/API — phân biệt hiện hành và đề xuất

**Mục đích:** BE có thể đối chiếu trực tiếp DTO/request/response mà FE cần, thay vì chỉ xác nhận “có API”. Tất cả ID, request references, phiên bản và dữ liệu trong ví dụ là **synthetic**, không phải captured live responses; message tiếng Việt minh họa, không đòi byte-identical wording.

- **CURRENT CONTRACT:** §14.5 mô tả C01/N4 đang có. Không yêu cầu đổi envelope, thêm field hoặc đổi quyền những endpoint này bằng tài liệu FE.
- **PROPOSAL_FOR_REVIEW:** §14.6–14.9 là **đề xuất cụ thể** cho các resource chưa có trong current OpenAPI. Method/path, tên field, enum, limits, quyền và policy mới **chưa được chấp nhận/triển khai**. BE/Product cần chốt hoặc trả alternative tương đương, sau đó cập nhật canonical contract/OpenAPI; FE chưa gọi các route đề xuất.
- Các ví dụ dùng `snake_case`, JSON thật không comment/ellipsis; kiểu `string|null`, enum và nullable được giải thích bằng prose. BE cần giao schema machine-readable với `required`, `additionalProperties`, format và bounds tương ứng; example không thay OpenAPI schema.

**Transport hiện hành và nguyên tắc không đổi:** cookie session với `credentials:include`; GET không cần mutation CSRF; writes cần allowlisted browser Origin và `X-CSRF-Token` hiện hành. Browser tự gửi Origin, FE không tự tạo header giả để bypass. Private JSON dùng `Content-Type: application/json`, `Cache-Control: no-store`, `Referrer-Policy: no-referrer`; CORS phải cho phép credentials, request headers và expose ETag/Location nếu FE cần đọc. Không đưa role/actor/session/CSRF/invitation token vào business payload.

**Quy ước chung CHỈ cho các DTO mới đề xuất ở §14.6–14.9:**

1. Success: `{data: object, meta: {request_id: string}, error: null}`. Error: `{data: null, meta: {request_id: string}, error: {code, message, details}}`. Đây **không phải** yêu cầu thêm request_id vào `meta:{}` của C01/N4 errors hiện hành.
2. `data.store_id`: canonical UUID của requested Store, response-only. `configuration_state`: required enum `configured|not_configured`, **không suy từ payload null**.
3. Khi `configured`: `version` opaque nonblank1..128, `updated_at` UTC ISO8601 string, payload resource là object. `ETag` là strong quoted chính `version`. Khi `not_configured`: version/updated_at/payload **đều null**, không có ETag giả; nghĩa là BE đã authorize và đọc thành công, xác minh chưa tồn tại cấu hình. Loader failure phải non-2xx, không200/not_configured.
4. `capabilities: {can_update:boolean}`: required server-projected UX hint, không thay authorization. Nếu field/authority chưa được chốt thì không expose writer/không trả can_update=true; không dùng fake grant keys. Read/write permissions chính xác, gồm Owner/Staff scope, cần BE/Product duyệt; mặc định deny cho combination chưa được định nghĩa.
5. Null trong field nullable = đã đọc thành công nhưng chưa cấu hình giá trị đó; không có nghĩa “không đủ quyền” hoặc “loader lỗi”. Toàn resource unavailable/forbidden dùng error. `[]` = đã đọc thành công và xác nhận rỗng; không tráo null/[]/0/false. Required nullable keys phải hiện diện.
6. GET không tạo resource. PUT là **full replacement của đúng payload resource**, không merge ngầm; tất cả writable keys bắt buộc, null chỉ dùng để clear field nullable. Body chỉ gồm payload và `reason`; không nhận store_id/version/updated_at/capabilities/authorization_version/role/user_id hay field thuộc resource khác. Đề xuất reject unknown fields bằng422.
7. Writer mới: UUID `Idempotency-Key`, nonblank reason1..1000 ký tự. Tạo chỉ sau authorized GET `not_configured`, dùng **chỉ** `If-None-Match:*` →201; sửa dùng **chỉ** `If-Match:"<resource.version>"` →200. Response trả canonical object + ETag; create có Location trỏ đúng GET resource. Không reuse membership/context/budget version cho resource khác.
8. Current authorization kiểm lại mỗi read/write/replay; CAS, resource update, audit và receipt atomic. Same key/body/original conditional trả retained receipt, không execute lại; đổi body/conditional cùng key409. Stale CAS412 phải GET lại và user reconfirm; thiếu conditional428. Exact no-op giữ version/updated_at, không fake change event. Receipt cũ không thay current GET.

Các quy ước mới trên là đề xuất review, **không override** schema/status/error/header của API hiện có. BE có thể chọn surface khác nhưng cần giữ được các phân biệt absent/unavailable, current rights và concurrency tương đương.

### 14.5. BE-01 — JSON ngân sách hiện hành và clarification cần chốt

**CURRENT CONTRACT:** `GET /api/v1/stores/{store_id}/planning-context` trả **full Context**, không chỉ ngân sách. Full schema-compatible example có sẵn tại [planning-context-empty-store.json](../api-contract-v2/docs/features/examples/s48/planning-context-empty-store.json). FE vẫn cần tất cả required fields của C01; không đổi nó thành một budget-only response.

Hai JSON sau là **projection của riêng field `data.budget_ceiling`**, không phải full HTTP C01 responses:

**JSON-C01-ABSENCE-PROJECTION** — cần BE xác nhận null chỉ mang nghĩa verified absence sau successful authorized read:

```json
{
  "budget_ceiling": null
}
```

**JSON-C01-ZERO-PROJECTION** — zero đã cấu hình, không phải absent:

```json
{
  "budget_ceiling": {
    "amount": "0",
    "currency": "VND",
    "version": "synthetic-cap/1",
    "updated_at": "2026-10-11T02:00:00Z"
  }
}
```

**Ưu tiên không đổi wire:** BE xác nhận200/null chỉ là verified absence, failure đọc nguồn trả non-2xx, thiếu composite read permissions trả whole-response403. Nếu không thể bảo đảm, BE đề xuất discriminator riêng và canonical amendment; **không tự thêm** `budget_availability` vào Context hiện hành (`additionalProperties:false`) trước khi đổi OpenAPI và FE validator. `BUDGET_CEILING_UNKNOWN` trong readiness không đủ để chọn create-only.

**JSON-C01-READ-ERROR** — schema-compatible example, HTTP503; C01 errors dùng `meta:{}` và không có `field_errors`:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Chưa đọc được cấu hình hiện hành.",
    "details": {}
  }
}
```

**N4 create request:** chỉ sau verified absence; ví dụ headers, không chứa credential thật:

```http
PUT /api/v1/stores/10000000-0000-0000-0000-000000000001/planning-budget
Content-Type: application/json
Origin: https://fe.example.test
X-CSRF-Token: <current-memory-session-csrf>
Idempotency-Key: 10000000-0000-4000-8000-000000000002
If-None-Match: *
```

**JSON-N4-REQUEST** — toàn bộ body, chỉ một field:

```json
{
  "amount": "0"
}
```

**JSON-N4-SUCCESS** — create201, `ETag: "synthetic-cap/1"`, `Location: /api/v1/stores/10000000-0000-0000-0000-000000000001/planning-context`:

```json
{
  "data": {
    "store_id": "10000000-0000-0000-0000-000000000001",
    "budget_ceiling": {
      "amount": "0",
      "currency": "VND",
      "version": "synthetic-cap/1",
      "updated_at": "2026-10-11T02:00:00Z"
    }
  },
  "meta": { "request_id": "synthetic-budget-write" },
  "error": null
}
```

**N4 replace:** cùng route/body shape; dùng key mới cho intent mới và `If-Match: "synthetic-cap/1"`, **bỏ If-None-Match**. Success200 trả cùng shape với canonical amount/version/time; exact numeric no-op giữ version/time cũ. CAS lấy từ `budget_ceiling.version`, không phải C01 `context_version` hoặc T02 `authorization_version`.

`amount` required nonnull **decimal string** không âm, tối đa18 chữ số nguyên/18 chữ số lẻ; ví dụ `"50000000.125"` hợp lệ. Không dùng JSON number, dấu phân cách hàng nghìn, exponent, dấu+/-, whitespace, null hay string rỗng. Currency lấy Store; không gửi currency/default budget/priority/horizon. Ví dụ dùng UUID idempotency key theo configuration handoff, không suy từ staff API rằng N4 nhận mọi opaque key.

**JSON-N4-CONFLICT** — HTTP412, envelope hiện hành:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "CONFIGURATION_VERSION_CHANGED",
    "message": "Cấu hình đã thay đổi. Vui lòng đọc lại trước khi lưu.",
    "details": {}
  }
}
```

**JSON-N4-VALIDATION** — HTTP422, envelope hiện hành:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "INVALID_PLANNING_CONFIGURATION",
    "message": "Trần ngân sách không hợp lệ.",
    "details": {
      "field_errors": [
        {
          "code": "INVALID_DECIMAL_TEXT",
          "field": "amount",
          "message": "Ngân sách phải là chuỗi số thập phân không âm."
        }
      ]
    }
  }
}
```

400 `INVALID_REQUEST`, 428 `PRECONDITION_REQUIRED`, 412 `CONFIGURATION_VERSION_CHANGED`, 422 `INVALID_PLANNING_CONFIGURATION`, 503 `SERVICE_UNAVAILABLE` giữ current semantics. Phải reread C01 sau known receipt; failure GET không replay PUT. Lost ACK giữ body/key/original conditional. N4 rights vẫn `budget.read + budget.update`; C01 rights vẫn composite như BE-05, không đề nghị nới quyền qua DTO.

### 14.6. BE-02 — đề xuất JSON Store profile

**PROPOSAL_FOR_REVIEW, chưa có route:** đề xuất `GET|PUT /api/v1/stores/{store_id}/profile`. BE có thể chốt path khác; không mở write trên T02 ngầm. Phần header/envelope/state/CAS của §14.4 áp dụng chỉ khi proposal được duyệt.

**JSON-PROFILE-READ** — configured200, `ETag: "synthetic-profile/3"`; GET và successful PUT trả cùng shape:

```json
{
  "data": {
    "store_id": "10000000-0000-0000-0000-000000000001",
    "configuration_state": "configured",
    "version": "synthetic-profile/3",
    "updated_at": "2026-10-11T02:00:00Z",
    "profile": {
      "name": "Cửa hàng minh họa",
      "business_type_code": "cafe",
      "address": "Địa chỉ minh họa",
      "phone": "028 1234 5678"
    },
    "business_type_catalog": [
      { "code": "cafe", "label_vi": "Cà phê" }
    ],
    "capabilities": { "can_update": true }
  },
  "meta": { "request_id": "synthetic-profile-read" },
  "error": null
}
```

**JSON-PROFILE-WRITE** — full payload replacement; `If-Match: "synthetic-profile/3"` + fresh UUID key; ví dụ clear phone:

```json
{
  "profile": {
    "name": "Cửa hàng minh họa",
    "business_type_code": "cafe",
    "address": "Địa chỉ minh họa mới",
    "phone": null
  },
  "reason": "Cập nhật thông tin liên hệ cửa hàng"
}
```

**Field contract đề xuất:**

- `profile.name`: required string, trim hai đầu,1..200 Unicode code points; cùng canonical Store name T01/T02, không tạo `profile_name` song song. Save name cập nhật cùng nguồn; BE định nghĩa cursor invalidation cho T01 sorted-by-name sau rename.
- `business_type_code`: required nullable string, code1..64 ký tự theo catalogue BE. `business_type_catalog`: required array các `{code:string,label_vi:string}` unique code, response-only; ví dụ `cafe` không đóng băng enum sản phẩm. BE revalidate code lúc write; unknown code trả422, FE không map label thành ID. Catalog unavailable không giả array rỗng.
- `address`: required nullable string; nếu nonnull trim/nonblank1..1000 Unicode code points. Một free-text address khớp UI hiện có; không tự bắt thêm phường/quận/postal fields.
- `phone`: required nullable string; nếu nonnull trim/nonblank1..50 ký tự, không control characters. Format/normalization chính thức do BE/Product chốt; không suy country code từ timezone/currency, không ép E.164 khi chưa được duyệt. Response trả canonical string BE đã lưu.
- Null = clear optional field có chủ ý; omit field lỗi trong full PUT. Nullable values không có nghĩa field unsupported hoặc thiếu quyền. Nếu scope bỏ field nào, BE sửa schema contract trước, không silently omit required key.
- `timezone` và `currency` tiếp tục canonical readonly ở T02; **không có trong profile PUT**. Metadata version độc lập với membership authorization version. Không cấp thêm role/ownership/membership capabilities bằng profile.

Nếu profile resource chưa tồn tại, GET phải trả `configuration_state:not_configured`, profile/version/updated_at=null và catalogue hiện hành; FE vẫn đọc name hiện có từ T02 và chỉ create profile sau explicit user save với If-None-Match. GET không sinh business record.

### 14.7. BE-03a — đề xuất JSON giờ hoạt động

**PROPOSAL_FOR_REVIEW:** `GET|PUT /api/v1/stores/{store_id}/operating-hours`; weekly schedule một interval/ngày theo thiết kế hiện tại, không tự bổ sung ngày lễ/exception/multiple shifts.

**JSON-HOURS-READ** — configured200, `ETag: "synthetic-hours/2"`:

```json
{
  "data": {
    "store_id": "10000000-0000-0000-0000-000000000001",
    "configuration_state": "configured",
    "version": "synthetic-hours/2",
    "updated_at": "2026-10-11T02:00:00Z",
    "timezone": "Asia/Ho_Chi_Minh",
    "operating_hours": {
      "weekly_schedule": [
        { "weekday": 1, "state": "open", "opens_at": "07:00", "closes_at": "22:00", "closes_next_day": false },
        { "weekday": 2, "state": "open", "opens_at": "07:00", "closes_at": "22:00", "closes_next_day": false },
        { "weekday": 3, "state": "open", "opens_at": "07:00", "closes_at": "22:00", "closes_next_day": false },
        { "weekday": 4, "state": "open", "opens_at": "07:00", "closes_at": "22:00", "closes_next_day": false },
        { "weekday": 5, "state": "open", "opens_at": "07:00", "closes_at": "23:00", "closes_next_day": false },
        { "weekday": 6, "state": "open", "opens_at": "07:00", "closes_at": "23:00", "closes_next_day": false },
        { "weekday": 7, "state": "closed", "opens_at": null, "closes_at": null, "closes_next_day": null }
      ]
    },
    "capabilities": { "can_update": true }
  },
  "meta": { "request_id": "synthetic-hours-read" },
  "error": null
}
```

**JSON-HOURS-WRITE** — full7-day replacement, headerCAS/key ngoài body; minh họa Friday qua ngày và Sunday chưa cấu hình:

```json
{
  "operating_hours": {
    "weekly_schedule": [
      { "weekday": 1, "state": "open", "opens_at": "07:00", "closes_at": "22:00", "closes_next_day": false },
      { "weekday": 2, "state": "open", "opens_at": "07:00", "closes_at": "22:00", "closes_next_day": false },
      { "weekday": 3, "state": "open", "opens_at": "07:00", "closes_at": "22:00", "closes_next_day": false },
      { "weekday": 4, "state": "open", "opens_at": "07:00", "closes_at": "22:00", "closes_next_day": false },
      { "weekday": 5, "state": "open", "opens_at": "22:00", "closes_at": "02:00", "closes_next_day": true },
      { "weekday": 6, "state": "open", "opens_at": "07:00", "closes_at": "23:00", "closes_next_day": false },
      { "weekday": 7, "state": "unset", "opens_at": null, "closes_at": null, "closes_next_day": null }
    ]
  },
  "reason": "Cập nhật lịch mở cửa theo tuần"
}
```

**JSON-HOURS-NOT-CONFIGURED** — authorized GET200, verified absence; không giả bảy ngày closed hoặc giờ mặc định:

```json
{
  "data": {
    "store_id": "10000000-0000-0000-0000-000000000001",
    "configuration_state": "not_configured",
    "version": null,
    "updated_at": null,
    "timezone": "Asia/Ho_Chi_Minh",
    "operating_hours": null,
    "capabilities": { "can_update": true }
  },
  "meta": { "request_id": "synthetic-hours-absent" },
  "error": null
}
```

**Invariants đề xuất:** all fields trong mỗi day required; exactly7 unique ISO weekdays1=Monday…7=Sunday, response sort1→7. `state` enum `open|closed|unset`; open bắt buộc HH:mm00:00–23:59 + boolean; closed/unset bắt buộc cả ba time/next-day fields=null. `closed` là confirmed không có interval bắt đầu ngày đó; `unset` là chưa khai báo, không suy thành closed. Chuyển unset trong PUT là clear khai báo ngày, không DELETE toàn resource.

Time là local wall-clock theo Store timezone, không UTC timestamps; Friday22:00→Saturday02:00 gắn weekday5, `closes_next_day:true`. Đề xuất duration>0 và<24h, reject equal start/end (24h operation cần Product contract riêng); same-day close>open, next-day close<open. BE kiểm overlap ngày liền kề và vòng Sunday→Monday. Closed/unset Saturday không tự phủ nhận phần Friday kéo sang Saturday. DST/ambiguous local time cần BE chốt nếu timezone hỗ trợ có DST; FE không tự convert/split interval.

`timezone` response-only phải cùng T02; không cho PUT sửa timezone. Resource version phải invalid khi semantics/timezone liên quan thay đổi. Lịch này không tự thành supplier delivery calendar hoặc planning hard constraint; integration policy cần duyệt riêng. Read failure503 không trả `not_configured`.

### 14.8. BE-03b — đề xuất JSON trạng thái kinh doanh

**PROPOSAL_FOR_REVIEW:** `GET|PUT /api/v1/stores/{store_id}/business-status`. Không tái sử dụng T02 `active`, không mặc định thay đổi session/membership khi pause.

**JSON-STATUS-READ** — configured200, `ETag: "synthetic-business-status/2"`:

```json
{
  "data": {
    "store_id": "10000000-0000-0000-0000-000000000001",
    "configuration_state": "configured",
    "version": "synthetic-business-status/2",
    "updated_at": "2026-10-11T02:00:00Z",
    "business_status": { "status": "paused" },
    "capabilities": { "can_update": true }
  },
  "meta": { "request_id": "synthetic-business-status-read" },
  "error": null
}
```

**JSON-STATUS-WRITE** — full replacement, headerCAS/key; không gửi active/role/member/user IDs:

```json
{
  "business_status": { "status": "operating" },
  "reason": "Mở lại hoạt động kinh doanh"
}
```

`business_status.status`: required enum `operating|paused`, không nhận boolean hoặc label dịch. Chưa cấu hình thì whole business_status/version/time=null với `configuration_state:not_configured`; không tự seed operating từ T02.active. Đề xuất transition immediate, không thêm future scheduling hoặc historical backdate field vào body.

**Policy vẫn cần BE-03 trả lời trước khi enable writer:** pause có chặn new Import/Planning không, retained reads/accepted jobs xử lý ra sao, ai được resume. Ví dụ chỉ chốt **format đề xuất**, không tự chốt tác động nghiệp vụ. FE không tính can_execute từ status; BE enforced actions/readiness theo policy đã duyệt. Owner vẫn cần đường authorized để đọc/resume nếu Product yêu cầu; pause không ngầm thành revoke membership/session.

### 14.9. BE-04 — đề xuất JSON operating preferences có điều kiện

**PROPOSAL_FOR_REVIEW, chỉ khi Product chốt STORE ownership:** `GET|PUT /api/v1/stores/{store_id}/operating-preferences`. Nếu language/week start thuộc User thì BE phản hồi alternative User-owned resource; không đặt User settings vào Store bằng suy đoán.

**JSON-PREFERENCES-READ** — configured200, `ETag: "synthetic-preferences/4"`:

```json
{
  "data": {
    "store_id": "10000000-0000-0000-0000-000000000001",
    "configuration_state": "configured",
    "version": "synthetic-preferences/4",
    "updated_at": "2026-10-11T02:00:00Z",
    "ownership": "STORE",
    "preferences": {
      "week_starts_on": 1,
      "display_locale": "vi-VN",
      "receiving_weekdays": [1, 2, 3, 4, 5, 6]
    },
    "supported_display_locales": ["vi-VN"],
    "receiving_semantics": "preference_only",
    "capabilities": { "can_update": true }
  },
  "meta": { "request_id": "synthetic-preferences-read" },
  "error": null
}
```

**JSON-PREFERENCES-WRITE** — full replacement, headerCAS/key; ví dụ explicit none cho receiving days:

```json
{
  "preferences": {
    "week_starts_on": 1,
    "display_locale": "vi-VN",
    "receiving_weekdays": []
  },
  "reason": "Cập nhật tùy chọn vận hành cửa hàng"
}
```

- `week_starts_on`: required `integer1..7|null`, ISO weekday; null chưa chọn, không tự Monday. Không đổi business-date/timezone/cutoff hoặc horizon.
- `display_locale`: required `string|null`; nonnull phải có trong `supported_display_locales` (required unique response-only string array). Ví dụ vi-VN minh họa, không hứa có bản dịch/locale khác. Null chưa chọn, không được đổi thành persisted vi-VN chỉ vì FE đang tiếng Việt.
- `receiving_weekdays`: required `integer[]|null`, unique/sorted1..7, max7; null chưa cấu hình, [] confirmed không ngày nào, [7] chỉ Sunday. BE/Product phải chốt [] được phép hay cần validation error trước khi writer được duyệt; không silently đổi [] thành all days.
- `ownership`, `supported_display_locales`, `receiving_semantics` là response-only. `preference_only` là **đề xuất scope hẹp**, không tuyên bố runtime planning đã consume lịch này. Nếu Product chọn hard constraint, cần contract/engine integration và error/readiness semantics được duyệt, không chỉ đổi enum rồi coi solver đã áp dụng.
- Không nhận `budget`, `budget_ceiling`, `default_budget`, `default_requirements`, `priority`, `horizon_days`, `include_open_purchase_orders`, currency/timezone trong request này. Ngân sách giữ C01/N4; engine capabilities giữ contract hiện hành.

### 14.10. Lỗi đề xuất, acceptance cases và cách BE bàn giao

**JSON-PROPOSAL-CONFLICT** — chỉ cho resources mới đề xuất, HTTP412:

```json
{
  "data": null,
  "meta": { "request_id": "synthetic-profile-conflict" },
  "error": {
    "code": "CONFIGURATION_VERSION_CHANGED",
    "message": "Thông tin đã thay đổi. Đọc lại trước khi xác nhận lưu.",
    "details": {}
  }
}
```

**JSON-PROPOSAL-VALIDATION** — chỉ cho resources mới đề xuất, HTTP422; `field` là JSON path trong body, không phải UI label:

```json
{
  "data": null,
  "meta": { "request_id": "synthetic-hours-validation" },
  "error": {
    "code": "INVALID_STORE_CONFIGURATION",
    "message": "Lịch hoạt động không hợp lệ.",
    "details": {
      "field_errors": [
        {
          "code": "INVALID_TIME_RANGE",
          "field": "operating_hours.weekly_schedule[4].closes_at",
          "message": "Giờ đóng cửa không khớp lựa chọn đóng sang ngày kế tiếp."
        }
      ]
    }
  }
}
```

Đề xuất mappings cho **API mới**: malformed/body/header400 `INVALID_REQUEST`; no session401 `UNAUTHENTICATED`; missing authority403 `PERMISSION_DENIED`; resource/Store outside scope404 `RESOURCE_NOT_FOUND`; reused key/different intent409 `IDEMPOTENCY_KEY_REUSED`; CAS412 `CONFIGURATION_VERSION_CHANGED`; missing conditional428 `PRECONDITION_REQUIRED`; invalid fields422 `INVALID_STORE_CONFIGURATION`; unavailable source/persistence503 `SERVICE_UNAVAILABLE`. `field_errors` khi có là array `{field,code,message}`, không echo raw secrets/input. Status code phải là HTTP status thật, không200 với `error` nonnull. BE chốt mappings cùng canonical OpenAPI; không coi tên error mới là đã có trong runtime.

**Acceptance tối thiểu cần BE giao cho mỗi resource được duyệt:**

1. GET configured + nullable field; verified not_configured; forbidden; loader failure. Không trả cùng200/null cho mọi tình huống.
2. Create201 + correct Location/ETag; replace200 + version mới; exact no-op giữ version/time; missing/stale condition428/412; same-key retained replay; key reused409; lost ACK rồi retry không duplicate update/audit.
3. Current Owner/Staff permission combinations, scope404, authority revoked giữa GET/PUT và trước retry. Không suy writer quyền từ frontend boolean hoặc gửi role trong payload.
4. Profile clear nullable/code catalogue validation/renameT01-T02 coherence; hours đủ7 ngày/closed-vs-unset/overnight/overlap; business pause/resume effects đã chốt; receiving null-vs-empty và policy đã chốt. Test evidence phải chứng minh persisted state qua fresh read/session, không chỉ HTTP2xx.
5. Reader/receipt phải match requested Store và resource version; examples có schema validation. Không làm bể current T02/C01 envelope/strict validators bằng unsolicited fields.

**Save nhiều nhóm:** proposal tách resource/CAS không tạo atomicity xuyên bốn PUT. FE chỉ được báo thành công theo từng resource đã có receipt, dùng nút Save riêng hoặc explicit partial-success UX. Nếu Product giữ một “Lưu thay đổi” cho profile+hours+status thì cần thống nhất một atomic business operation/transaction hoặc rõ partial semantics trước; không âm thầm gọi nhiều endpoint rồi báo toàn bộ đã lưu.

**Gói bàn giao BE cần trả:** quyết định cho từng BE-ID; approved method/path/permission matrix; complete OpenAPI schemas + required/nullable/enum/bounds; JSON samples configured/absent/zero/closed/unset/empty/validation/conflict/unavailable theo scope; exact header/status/error semantics; implementation/version và targeted persistence/authorization/replay evidence. Nếu BE chọn DTO khác proposal, gửi mapping/diff cụ thể; FE chỉ sửa typed boundary sau khi contract được chốt. Các JSON ở đây là đề xuất trao đổi, không tự sửa contracts hoặc enable API mới.

Kiểm chứng phần JSON: **18/18 fenced JSON parse PASS**; 7 ví dụ/projection CURRENT C01/N4 và linked full C01 example đối chiếu schema handoff PASS; invariant cơ bản cho DTO đề xuất (UUID, state/null, full PUT, lịch7 ngày/qua đêm/overlap, enum và preferences) PASS. Cấu trúc14 major sections,20 local links/anchors, fences và whitespace PASS. Chỉ sửa docs007, không triển khai endpoint, thay FE runtime hay chạy lại các308 tests lịch sử.
