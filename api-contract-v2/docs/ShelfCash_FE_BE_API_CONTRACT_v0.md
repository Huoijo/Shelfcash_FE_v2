# ShelfCash — Frontend → Backend API Contract v0

**Completed v0 handoff · 08 October 2026 · FE/BE agreement required**

This is a proposed integration contract derived from the latest ShelfCash MagicPath screens. It documents frontend requirements, not a claim that these backend APIs already exist. No backend implementation or OpenAPI specification was supplied or found in the current workspace. **No endpoint in this document is marked EXISTING / CONFIRMED.** No MagicPath design was modified.

## 1. Scope

ShelfCash supports inventory and procurement decisions for small and medium F&B businesses. This contract covers authentication, import/upload/history/mapping/completion, Hôm nay, Kho, Menu, procurement setup/results/scenarios, contextual AI, and minimum store context.

The existing sidebar remains: **Hôm nay → Nhập dữ liệu → Dự đoán → Kho → Menu → Cửa hàng**. Procurement setup/results belong to the existing Dự đoán workflow; this contract does not add navigation entries.

### 1.1 Evidence and version boundary

Connected MagicPath project: `458079658328604672`. The recovered draft records the following canvas revisions reviewed on 08 October 2026 in the user's timezone. The prior run inspected editable source for all nine authenticated designs and native previews for mapping, completion and procurement results. Import, history and mapping coexist in some component source trees; the dedicated mapping revision below is authoritative for mapping-card behavior. This continuation preserves those documented requirements instead of repeating that audit.

| Screen / component | Component ID | Inspected revision ID |
|---|---|---|
| Đăng nhập / Đăng ký | `458185906336202752` | `458185906336202753` |
| Nhập dữ liệu + Lịch sử nhập | `458255053002780672` | `458402037797892096` |
| Ghép cột dữ liệu | `458395069779681280` | `458401934337019904` |
| Hoàn tất | `458406500038234112` | `458407962478804992` |
| Kế hoạch nhập — Thiết lập | `458414835571515392` | `458416333273579520` |
| Kế hoạch nhập — Kết quả | `458423352311304192` | `458595022460325888` |
| Kho | `458590758262427648` | `458596566140329984` |
| Menu | `458614109248847872` | `458616728595894272` |
| Hôm nay | `458632053018234880` | `458637450923900928` |

Source files used include `ShelfCashDataImportScreen`, `ShelfCashImportHistoryData/Screen`, `ShelfCashMappingData/Screen`, `ShelfCashCompletionData/Screen`, `ShelfCashPlanningData/Screen`, `ShelfCashProcurementData/Screen`, `ShelfCashInventoryData/Screen`, `ShelfCashMenuData/Screen`, `ShelfCashTodayData/Screen`, and their contextual AI components. IDs above pin the reviewed evidence; subsequent design changes require a contract review.

Continuation check: the connected project/component inventory was checked read-only on 08 October 2026. Only the missing Today AI date-selection payload was inspected in live source; its selected/base revision is still `458637450923900928`, matching the draft. That source sends `snapshotId`, `asOfDate` and `selectedDate`; the proposed wire adapter is specified in Section 14. Other clearly documented screens were not re-audited. All 20 sections, examples, endpoint references and dependency tables were checked before this handoff. No MagicPath mutation or backend implementation was performed.

**Status vocabulary for API entries:**

- **PROPOSED:** a concrete FE-required API shape for BE review; implementation is unverified.
- **TBD WITH BE:** route/behavior is a negotiation item, usually because the UI currently exposes an intent or placeholder without a confirmed service contract.
- **EXISTING / CONFIRMED:** reserved for an endpoint verified against BE code, a current OpenAPI document or an authorized live API. None were verified in this task.

“Observed UI” below means verified frontend prototype behavior. It does not mean a backend capability is confirmed. Every JSON payload is illustrative. Fixture IDs, counts, dates and example AI answers are not production records.

### 1.2 Responsibility boundaries

| Workspace | Owns | Does not own |
|---|---|---|
| Hôm nay | Exceptions, pending decisions, readiness and a compact seven-day outlook | Detailed inventory, recipes or the full procurement plan |
| Kho | Current quantities, lots, expiry and movements | Purchase recommendations or forecasting logic |
| Menu | Products, prices, selling status and current recipes | Inventory lots or procurement recommendations |
| Kế hoạch nhập | Planning inputs, recommendations, alternatives and scenarios | Product/recipe editing or inventory maintenance |
| Contextual AI | Explanation of the selected data/decision | Executing purchases or changing operational data |

Resources and workflows are separated. Reads retrieve inventory/products/imports/plans/scenarios. Mutations upload, analyze, resolve mappings, process imports, generate plans, run scenarios or request explanations. A compact `/today` aggregation is allowed; a single endpoint returning the whole application is not.

### 1.3 Observed gaps that integration must not hide

| Observed frontend behavior | Contract implication |
|---|---|
| Upload currently stores file names locally, accepts any picker file and enables “Xử lý dữ liệu” whenever the list is nonempty. Date may be blank. | Real integration must retain `File` bytes, enforce CSV/XLSX, require an agreed `data_date`, and distinguish staged from successfully uploaded files. These are integration requirements, not implemented behavior. |
| “Xử lý dữ liệu” opens mapping; mapping “Tiếp tục” currently only announces readiness. | Analysis precedes review. Canonical persistence must occur after review, not on the first CTA. |
| Help/mapping show `Bước 1/5` and `Bước 2/5`; completion shows `Bước 3/3`. | Use semantic workflow states in the API. FE must agree on step-number copy separately. This document organizes upload → review → completion as three phases without altering the design. |
| Mapping dropdowns are sheet/schema scoped and all cards use dropdown → Confirm. | Do not introduce candidate-chip mutations, bulk acceptance or global cross-sheet uniqueness. |
| Setup priority maps to `lean`, `balanced`, `protected`. Selecting a results strategy card changes comparison focus only. | Strategy inspection is a read/local selection, not a mutation of the applied plan. |
| Charts use an existing screenshot or a supplied renderer; scenario results have one hard-coded example; AI answers are examples. | Structured chart data, scenario execution and LLM explanation are proposed dependencies, not verified services. Unknown results stay `null`/unavailable. |
| Menu currently has 3 illustrative products, not 63. Completion has independent example impact counts. | Never use completion impact counts as current Menu/Kho totals. Never derive global totals from a paginated page. |
| Results fixture displays 71% budget but has no authoritative budget amount; setup's example budget is 50,000,000 VND. | Do not combine these fixtures into a real plan. BE must return the actual run budget and ratio. Examples below use 8,338,000 / 50,000,000 = 0.16676. |
| Kho's current fixture contains Cam: 2 lots, only 1 near expiry; Hôm nay uses 1 near-expiry Cam lot. | Count lots and affected ingredients separately; do not reproduce the earlier “2 lô gần hạn” example blindly. |
| Cửa hàng, `/forecast`, `/sales-data`, File mẫu and password recovery have no complete destination workflow in these designs. | Treat missing destinations as explicit integration decisions, not existing screens/services. |

No inventory/menu write APIs, schema editor, purchase approval, supplier management, account permissions, rollback, file deletion/download, global AI chat history or new forecast engine is introduced here.

## 2. Shared conventions

**All conventions in this section are PROPOSED; authentication transport and compatibility with existing BE naming are TBD WITH BE.** Routes below are relative to `/api/v1`. Browser page routes such as `/inventory` are not API routes.

### 2.1 Transport and envelope

JSON requests use `Content-Type: application/json`; file upload uses multipart. Successful JSON responses use:

```json
{
  "data": {},
  "meta": {
    "request_id": "req_001",
    "warnings": []
  },
  "error": null
}
```

Examples sometimes use `meta: {}` for brevity; an implementation must still supply the agreed trace metadata. Failures use Section 16. `204 No Content`, if agreed for logout, has no envelope. Do not put a failure in a nominal success body's `data` without a documented per-item upload result or job failure.

Protected endpoints require an authenticated user authorized for the referenced store. Endpoints without `store_id` must resolve their resource's owning store and enforce the same authorization. Guessing an ID must never bypass store scope. `401`, `403`, `404`, request-shape `422` and temporary service failures apply to all protected endpoints in addition to their listed domain errors.

### 2.2 Primitive values

| Concept | Proposed wire representation / rule |
|---|---|
| IDs | Opaque strings, stable across reads; entity IDs, source column IDs and mapping IDs are separate. Do not use filenames, array indexes or displayed `Import #0241` as the sole identity. Proposed `source_column_index` is zero-based physical column position; row-number semantics for diagnostics are TBD in Section 16. |
| Dates | ISO date `YYYY-MM-DD`, no timezone or implicit conversion. Month: `YYYY-MM`. |
| Datetimes | RFC 3339 with offset or `Z`, e.g. `2026-10-02T09:42:00+07:00`. FE converts to store timezone for calendar grouping/display. |
| Store timezone | IANA identifier, initially e.g. `Asia/Ho_Chi_Minh`; backend store context is authoritative. |
| Money | Integer VND amounts, accompanied by `currency: "VND"` at resource/config level. No formatted `₫` strings in numeric fields. This v0 proposes VND only; multi-currency precision is TBD. |
| Quantities | Decimal strings such as `"8.28"`, `"24"`, `"-2.5"`; FE adapts to numbers for existing components/charts. Avoid changing business values through display rounding. Precision/limits are TBD WITH BE. |
| Units | Stable catalog codes, e.g. `kg`, `g`, `l`, `ml`, `piece`, `cup`; FE displays `L`, `cái`, `ly`. BE must define aliases and safe conversions, especially recipe g/ml versus stock kg/L. Never add mixed units. |
| Ratios | Numbers in `[0,1]`: `0.988` → `98,8%`. UI fixture percent values 98.8 / 71 need an adapter. Monetary budget utilization may exceed 1. |
| Confidence | Score `[0,1]`, `0.61` → `61%`. Do not call it a calibrated probability without BE evidence. Auto-accept threshold is BE-owned/TBD. |
| Counts | Nonnegative integer; `null` means unknown, not zero. |
| Status/reasons | Stable machine codes; FE owns Vietnamese labels. Natural-language AI answers/explanatory prose may be Vietnamese when `locale: "vi"` is requested. |

Required-but-unknown fields use explicit `null`; absent optional expansions mean “not requested”, not “empty”. `[]` means a known empty collection. Never substitute zero for unavailable cost, risk, price, forecast or import-impact data. A zero shortage-risk value is a measured/computed zero, not “no stochastic estimate”.

### 2.3 Lists, filters and consistency

Lists use `limit` (proposed default 50, maximum 100) and opaque `cursor`. Response:

```json
{
  "data": {
    "items": []
  },
  "meta": {
    "pagination": {
      "limit": 50,
      "next_cursor": null,
      "total_count": 0
    },
    "warnings": []
  },
  "error": null
}
```

`total_count` is the entire filtered result, not the page length; `null` is acceptable if unavailable and FE must not invent it. `next_cursor: null` means exhausted. Summary cards use explicitly store-wide, unfiltered counts unless the response declares another scope. Sorting is allowlisted; invalid sort/filter values return `422 INVALID_FILTER`. Use `sort=field,-other_field`, a stable ID tie-breaker, and null-expiry dates last.

Ingredient/product searches should preserve the current Vietnamese case/diacritic-insensitive matching; history filename search is case-insensitive. BE implementation/collation is TBD. Query filters are combined with AND unless stated otherwise. Multiple accepted values within one filter use OR: for example, `status=low_stock,empty` matches either status, and repeated `ingredient_id` values select that set. This does not change the import-history rule that category and filename must match the same file.

Responses that join current stock, movements or planning data identify `as_of_date`, `updated_at` and, where supported, an opaque `data_version`/`snapshot_id`. FE must not silently mix a plan's cutoff inventory with current Kho inventory. If separate reads return different versions, refresh/reconcile rather than summing mismatched data. Snapshot pinning support is TBD WITH BE.

### 2.4 Warnings, mutations and retries

Warnings are nonblocking structured objects: `code`, `entity`, `details`; FE selects concise labels. Errors block a requested action. An informational null metric is not itself an error. Whether warnings require explicit acknowledgement is TBD; no acknowledgement workflow is currently designed.

Propose `Idempotency-Key` for import creation, file upload, analysis/process, plan/scenario generation, draft-PO creation and AI explanation. Retries with the same key/payload return the same operation/resource; reuse with a different payload returns `409 IDEMPOTENCY_KEY_REUSED`. Key scope/retention is TBD. Concurrent mapping updates use an agreed mapping revision (`If-Match`, Section 6). Polling/job conventions are in Section 17.

### 2.5 Shared frontend data states

These are integration behaviors, not additional backend capabilities or new screens.

| API outcome | FE behavior |
|---|---|
| Initial GET pending | Show loading for the requested region; unknown counts/metrics are not zero. |
| Successful known-empty collection | Show that screen's empty state; distinguish an empty store from a filter with no matches. |
| Successful response with nullable metrics or an unavailable child resource | Render an unavailable value/region while keeping the rest of the known report usable. |
| GET refresh fails | Preserve previously loaded content where useful and show a retry state; do not present cached data as newly refreshed. |
| Mutation validation/conflict fails | Keep input/selection and explain the actionable error; do not advance to completion/results. |
| Async POST accepted | Show pending state and track the returned job/resource; success awaits its durable result. |
| Transport failure after a POST | Outcome is unknown. Reconcile by the resource/job or retry with the original idempotency key; do not issue a new-key duplicate. |
| Store/resource changes while a request is pending | Apply the response only to its captured store/resource/version; do not overwrite the newly selected context. |

## 3. Authentication

Observed UI: email/password, login/register modes, password visibility, login “Ghi nhớ đăng nhập”, register confirmation, and a password-recovery placeholder. Register currently checks at least 8 characters; confirmation is FE-only and must not be sent as an extra credential. There is no username, phone, organization or store-creation form.

**Mechanism: TBD WITH BE.** Preferred proposal: an HttpOnly, Secure cookie session, with explicit expiry and an agreed CSRF/CORS policy. If BE already uses bearer tokens, agree on token delivery, refresh and logout before FE integration; do not assume both transports. Examples describe the cookie proposal and intentionally contain no access token. Session lifetime and “remember me” duration are not specified here.

### A01 — Login

**PROPOSED · `POST /auth/login` · synchronous.** Authenticate and resolve an authorized default store, if one exists.

Request:

```json
{
  "email": "owner@example.com",
  "password": "example-password",
  "remember_me": true
}
```

`200` response (cookie delivered through the agreed transport):

```json
{
  "data": {
    "user": {
      "user_id": "user_001",
      "email": "owner@example.com"
    },
    "session": {
      "expires_at": "2026-10-09T01:40:00+07:00"
    },
    "default_store_id": "store_001"
  },
  "meta": {},
  "error": null
}
```

`default_store_id` may be `null`. UI: idle → submitting → authenticated / field or credential error; keep credentials out of URL/logs. Errors: `401 INVALID_CREDENTIALS`, `422 INVALID_EMAIL`, `429 RATE_LIMITED`. Redirect to Hôm nay only after store context is resolved; no store onboarding behavior is assumed.

### A02 — Register

**PROPOSED · `POST /auth/register` · synchronous account creation; verification/onboarding policy TBD.**

```json
{
  "email": "owner@example.com",
  "password": "example-password"
}
```

Proposed `201` response:

```json
{
  "data": {
    "user": {
      "user_id": "user_002",
      "email": "owner@example.com"
    },
    "session": null,
    "default_store_id": null,
    "next_action": "login"
  },
  "meta": {},
  "error": null
}
```

UI: submitting → account created → agreed next action. Errors: `409 EMAIL_ALREADY_REGISTERED`, `422 PASSWORD_POLICY_VIOLATION`, `422 INVALID_EMAIL`. Auto-login versus login-after-register is TBD; the example does not create a store or promise verification capability.

### A03 — Current session

**PROPOSED · `GET /auth/me` · synchronous read.** No body.

```json
{
  "data": {
    "user": {
      "user_id": "user_001",
      "email": "owner@example.com"
    },
    "session": {
      "expires_at": "2026-10-09T01:40:00+07:00"
    },
    "default_store_id": "store_001"
  },
  "meta": {},
  "error": null
}
```

UI: session checking → authenticated / unauthenticated. Errors: `401 SESSION_EXPIRED` or `401 UNAUTHENTICATED` clears protected context and invokes the agreed login redirect. A missing default store is not an invented store-selection screen.

### A04 — Logout

**PROPOSED · `POST /auth/logout` · synchronous, idempotent.** Request `{}`; proposed `200` response:

```json
{
  "data": {
    "logged_out": true
  },
  "meta": {},
  "error": null
}
```

Invalidate the current session; clear FE store/resource caches. An already expired session should still leave FE logged out. `204` is an acceptable agreed alternative. There is no visible logout control in the reviewed shell; this is an authentication lifecycle dependency. Password recovery remains **TBD WITH BE**, without a committed endpoint in v0.

## 4. Data Import Workflow

### 4.1 Proposed execution order

1. User chooses a business data date and stages files locally; drag-over, file count and help/sidebar behavior are local UI.
2. On “Xử lý dữ liệu”, FE validates the agreed date and supported types, creates the batch, uploads the staged bytes, then starts analysis.
3. BE discovers sheets/columns and performs assisted mapping. FE waits for the analysis job before opening review.
4. User resolves only review issues. “Tiếp tục” starts validate → normalize → persist (Section 6).
5. Show completion only after the processing job succeeds; read its actual completion and readiness result.

Creating the draft at the first processing click avoids silently binding an empty date or uploading against a date that the user subsequently edits. If BE wants immediate upload on file selection, date-edit semantics and a draft-update API are **TBD WITH BE**, not assumed here. Preserve staged files/date when opening HDSD/history or collapsing the sidebar.

`data_date` is batch business context. Historical sales and purchases may contain many row-level dates: do not overwrite every canonical row date with this one date-picker value. Fallback rules for missing dates, inventory snapshot timing and conflicting date columns must be agreed with BE.

### I01 — Create import batch

**PROPOSED · `POST /stores/{store_id}/imports` · synchronous draft creation.** Header: `Idempotency-Key`.

```json
{
  "data_date": "2026-10-06"
}
```

`201` response:

```json
{
  "data": {
    "import_id": "imp_0248",
    "display_number": "0248",
    "store_id": "store_001",
    "data_date": "2026-10-06",
    "status": "draft",
    "created_at": "2026-10-08T01:42:00+07:00",
    "imported_at": null,
    "file_count": 0
  },
  "meta": {},
  "error": null
}
```

UI: staged → creating batch → uploading. Errors: `422 DATA_DATE_REQUIRED`, `422 INVALID_DATA_DATE`. Future/backdated date policy is TBD. Empty draft creation is not a successful import.

### I02 — Upload files

**PROPOSED · `POST /imports/{import_id}/files` · synchronous byte acceptance; sheet parsing is deferred to I03.** Multipart and `Idempotency-Key`.

Request example (multipart fields, not JSON):

```text
files[]: <sales.xlsx bytes>
client_file_ids[]: staged_sales_01
files[]: <inventory.xlsx bytes>
client_file_ids[]: staged_inventory_01
```

Pair arrays by ordinal position; BE must validate their lengths. Each stable `client_file_id` identifies one intended upload across retries. Files with identical names are not automatically the same file; content deduplication policy is TBD. FE need not parse Excel.

`200` response, one result per submitted file:

```json
{
  "data": {
    "import_id": "imp_0248",
    "accepted_file_count": 2,
    "results": [
      {
        "client_file_id": "staged_sales_01",
        "file_id": "file_sales",
        "filename": "sales.xlsx",
        "file_type": "xlsx",
        "size_bytes": 2457600,
        "sheet_count": null,
        "upload_status": "uploaded",
        "error": null
      },
      {
        "client_file_id": "staged_inventory_01",
        "file_id": "file_inventory",
        "filename": "inventory.xlsx",
        "file_type": "xlsx",
        "size_bytes": 860160,
        "sheet_count": null,
        "upload_status": "uploaded",
        "error": null
      }
    ]
  },
  "meta": {},
  "error": null
}
```

Known permitted formats: CSV/XLSX. Type/sniffing/size limits are BE-owned. A rejected item uses `file_id: null`, `upload_status: "rejected"` and an item-level Section 16 error. Partial byte acceptance is proposed; if all files are rejected, return `422 UPLOAD_REJECTED` with per-item details. Accepted parser failures later remain identifiable files in the batch.

This request illustrates two files. The four-file/nine-sheet M01 and I06 examples assume that `recipes.xlsx` and `sales_archive.xlsx` were accepted in another I02 request before analysis. Additional uploads within the same batch do not create additional calendar import sessions.

UI integration states: staged, uploading, uploaded, rejected, retryable failure. Local staged count must not be confused with accepted server file count. Do not analyze rejected files. Errors: `415 INVALID_FILE_TYPE` for request-level unsupported content, item-level `INVALID_FILE_TYPE`, `413 FILE_TOO_LARGE`, `422 EMPTY_FILE`, `409 IMPORT_STATE_CONFLICT`; corrupt/unreadable workbook may be detected here or in I03. Whether to allow continuation with some rejected files requires FE/BE agreement; never silently process a different set than the user sees.

### I03 — Analyze files and assisted mappings

**PROPOSED · `POST /imports/{import_id}/analyze` · asynchronous, Section 17.** Request `{}` + idempotency key. Require at least one accepted file and a valid data date; seal this analysis input set against concurrent additions.

`202` response:

```json
{
  "data": {
    "import_id": "imp_0248",
    "status": "analyzing",
    "job_id": "job_analysis_248",
    "job_status": "queued"
  },
  "meta": {
    "poll_after_ms": 2000
  },
  "error": null
}
```

Job stages: sheet discovery, column analysis, mapping analysis. Analysis creates stable sheet/column/mapping IDs and progress, not canonical operational records. Completion points to M01. UI: analysis pending → review available / analysis failed. Errors: `409 NO_UPLOADED_FILES`, `409 IMPORT_STATE_CONFLICT`; job errors: `CORRUPT_FILE`, `EMPTY_SHEET`, `ANALYSIS_FAILED`. Empty-sheet treatment and LLM-unavailable manual fallback are TBD, without an invented automatic fallback.

### I04 — Read import resource / inspection details

**PROPOSED · `GET /imports/{import_id}` · synchronous read.** No body.

```json
{
  "data": {
    "import_id": "imp_0241",
    "display_number": "0241",
    "store_id": "store_001",
    "data_date": "2026-10-01",
    "created_at": "2026-10-02T09:40:00+07:00",
    "imported_at": "2026-10-02T09:42:00+07:00",
    "completed_at": "2026-10-02T09:44:00+07:00",
    "status": "completed",
    "file_count": 4,
    "files": [
      {
        "file_id": "file_241_sales",
        "filename": "sales_history.csv",
        "file_type": "csv",
        "size_bytes": 2457600,
        "category": "sales",
        "status": "completed",
        "warning_count": 0,
        "error_count": 0
      }
    ],
    "files_page": {
      "next_cursor": "files_241_page2",
      "total_count": 4
    },
    "active_job_id": null,
    "completion_available": true
  },
  "meta": {},
  "error": null
}
```

The file array above is a first-page example, not all four files. Optional `files_cursor`/`files_limit` paginate files within this resource; files belong to a batch, not a file explorer. Read this when expanding a history batch or invoking completion “Xem chi tiết”. Processing status and per-file status must remain distinct from upload acceptance. Errors: `404 IMPORT_NOT_FOUND`. Data date is the dataset's business date; `imported_at` is the actual upload-session timestamp. Exact timestamp capture is an open BE question; it must not be substituted with `data_date`, `created_at` or completion time.

## 5. Import History

Observed: monthly calendar, selected date panel, expandable batches, category/status/filename filters. A calendar count is a count of **distinct import batches**, not files or sheets. Group by `imported_at` in the store timezone. The month uses Monday-first display in FE; BE need not send layout cells.

Filtering semantics preserve current behavior: batch status matches the status filter; at least one file in the batch must match both category and filename query. Once the matching batch is opened, show all its files, not just the matched file. Categories observed: `sales`, `inventory`, `recipes`, `supplier`. These categories are not the CSV/XLSX format. Support for supplier schemas in assisted mapping is TBD because the current mapping fixture only declares sales/inventory/recipes.

### H01 — Monthly activity

**PROPOSED · `GET /stores/{store_id}/imports/calendar?month=2026-10` · synchronous read.** Optional `category`, `status`, `q`; same filter vocabulary as H02.

```json
{
  "data": {
    "month": "2026-10",
    "timezone": "Asia/Ho_Chi_Minh",
    "grouped_by": "imported_at",
    "matched_import_count": 7,
    "unfiltered_import_count": 7,
    "days": [
      {
        "date": "2026-10-01",
        "import_count": 1
      },
      {
        "date": "2026-10-02",
        "import_count": 3
      },
      {
        "date": "2026-10-05",
        "import_count": 1
      },
      {
        "date": "2026-10-06",
        "import_count": 2
      }
    ]
  },
  "meta": {},
  "error": null
}
```

Sparse days: omitted dates have zero **matched** batches. `unfiltered_import_count` distinguishes an empty month from filters excluding all activity. Calendar aggregation covers the entire matching month, not a single H02 page. Month response and selected-date counts must use the same filter semantics. UI: activity / empty month / no filter match. Errors: `422 INVALID_MONTH`, `422 INVALID_FILTER`.

### H02 — Batches on selected upload date

**PROPOSED · `GET /stores/{store_id}/imports?import_date=2026-10-02&limit=50&sort=-imported_at` · synchronous read.** Optional `category`, `status`, `q`, `cursor`.

```json
{
  "data": {
    "items": [
      {
        "import_id": "imp_0243",
        "display_number": "0243",
        "data_date": "2026-09-30",
        "imported_at": "2026-10-02T17:06:00+07:00",
        "file_count": 1,
        "status": "failed"
      },
      {
        "import_id": "imp_0242",
        "display_number": "0242",
        "data_date": "2026-10-02",
        "imported_at": "2026-10-02T14:18:00+07:00",
        "file_count": 2,
        "status": "completed_with_warnings"
      },
      {
        "import_id": "imp_0241",
        "display_number": "0241",
        "data_date": "2026-10-01",
        "imported_at": "2026-10-02T09:42:00+07:00",
        "file_count": 4,
        "status": "completed"
      }
    ]
  },
  "meta": {
    "pagination": {
      "limit": 50,
      "next_cursor": null,
      "total_count": 3
    },
    "unfiltered_date_count": 3
  },
  "error": null
}
```

Wire-to-UI history status mapping: `completed` → Thành công, `completed_with_warnings` → Có cảnh báo, `failed` → Thất bại. Behavior for in-progress batches is **TBD WITH BE**; the current filter UI only demonstrates the three terminal categories. Define whether drafts with no upload timestamp are excluded and whether uploaded-but-unprocessed batches appear. UI: selected-day batches / truly empty day / no matches. Open a batch via I04. Errors: `422 INVALID_DATE`, `422 INVALID_FILTER`.

## 6. Column Mapping

Observed queue states are confirmation, ambiguous and unmatched. Proposed wire normalization: `needs_confirmation`, `ambiguous`, `unmatched`; successful states: `auto_mapped`, `resolved`. Canonical fields are selected through one dropdown and committed by **Xác nhận in every unresolved-card state**. Merely opening/changing a dropdown must not persist a mapping. A suggested field is not accepted until confirmation succeeds.

### M01 — File/sheet discovery and progress

**PROPOSED · `GET /imports/{import_id}/mapping-summary` · synchronous read after analysis.** No body.

```json
{
  "data": {
    "import_id": "imp_0248",
    "analysis_status": "completed",
    "mapping_revision": "map_v1",
    "progress": {
      "total_fields": 32,
      "auto_mapped": 27,
      "resolved": 0,
      "unresolved": 5,
      "unresolved_required": 5,
      "completed_fields": 27,
      "schema_blocker_count": 0,
      "complete": false,
      "can_process": false
    },
    "files": [
      {
        "file_id": "file_sales",
        "filename": "sales.xlsx",
        "sheet_count": 1,
        "unresolved_count": 2,
        "sheets": [
          {
            "sheet_id": "sheet_orders",
            "name": "Orders",
            "is_virtual": false,
            "schema": "sales",
            "schema_context_id": "ctx_orders",
            "column_count": 5,
            "auto_mapped_count": 3,
            "unresolved_count": 2,
            "schema_blockers": []
          }
        ]
      },
      {
        "file_id": "file_inventory",
        "filename": "inventory.xlsx",
        "sheet_count": 1,
        "unresolved_count": 2,
        "sheets": [
          {
            "sheet_id": "sheet_stock",
            "name": "Current Stock",
            "is_virtual": false,
            "schema": "inventory",
            "schema_context_id": "ctx_stock",
            "column_count": 5,
            "auto_mapped_count": 3,
            "unresolved_count": 2,
            "schema_blockers": []
          }
        ]
      },
      {
        "file_id": "file_recipes",
        "filename": "recipes.xlsx",
        "sheet_count": 1,
        "unresolved_count": 1,
        "sheets": [
          {
            "sheet_id": "sheet_recipes",
            "name": "Recipes",
            "is_virtual": false,
            "schema": "recipes",
            "schema_context_id": "ctx_recipes",
            "column_count": 4,
            "auto_mapped_count": 3,
            "unresolved_count": 1,
            "schema_blockers": []
          }
        ]
      },
      {
        "file_id": "file_archive",
        "filename": "sales_archive.xlsx",
        "sheet_count": 6,
        "unresolved_count": 0,
        "sheets": [],
        "sheets_collapsed": true
      }
    ]
  },
  "meta": {},
  "error": null
}
```

The clean archive is compact by default. `include_clean_sheets=true` on M01 returns its six sheet descriptors on expansion; no hidden unresolved sheet may be omitted. CSV is represented as one virtual review unit (`is_virtual: true`), not parsed by FE. Exact names/header-row discovery rules and unsupported sheet schema handling are TBD.

Progress is import-wide and backend authoritative, not computed from a paginated issue page. In this example, `completed_fields = auto_mapped + resolved`; `total_fields = completed_fields + unresolved`. `complete` means the review queue is resolved; `can_process` additionally checks required canonical fields/schema blockers and the agreed optional-column policy. They must not be conflated.

Required canonical fields absent from the source are reported through `schema_blockers`, e.g. `{ "code": "MISSING_REQUIRED_CANONICAL_FIELD", "target_field": "product_name" }`. Do not invent a source column to represent a missing destination. The current UI has no dedicated schema-blocker control: BE/FE must agree on displaying/handling these blockers before integration. Optional unresolved-column handling is also TBD; never silently discard data to make progress green.

UI: files/sheets with issues expanded, clean files compact, progress, pending/not-ready analysis. Errors: `409 ANALYSIS_NOT_READY`, `404 IMPORT_NOT_FOUND`.

### M02 — Mapping queue and read-only successful pairs

**PROPOSED · `GET /imports/{import_id}/mappings?sheet_id=sheet_orders&review_only=true` · synchronous, paginated read.** Optional `status`, `cursor`, `limit`, `include_details=true`.

```json
{
  "data": {
    "sheet_id": "sheet_orders",
    "schema_context_id": "ctx_orders",
    "mapping_revision": "map_v1",
    "items": [
      {
        "mapping_id": "map_qty",
        "source_column_id": "column_qty",
        "source_column": "qty",
        "source_column_index": 2,
        "sample_values": [
          "12",
          "8",
          "25",
          "4"
        ],
        "required": true,
        "mapping_status": "needs_confirmation",
        "target_field": null,
        "suggested_field": "quantity_sold",
        "confidence": 0.61,
        "candidate_fields": [
          "quantity_sold"
        ],
        "reason_code": "low_confidence"
      },
      {
        "mapping_id": "map_price",
        "source_column_id": "column_price",
        "source_column": "price",
        "source_column_index": 3,
        "sample_values": [
          "42000",
          "45000",
          "39000"
        ],
        "required": true,
        "mapping_status": "ambiguous",
        "target_field": null,
        "suggested_field": null,
        "confidence": null,
        "candidate_fields": [
          "selling_price",
          "revenue"
        ],
        "reason_code": "multiple_candidates"
      }
    ],
    "filter_counts": {
      "all": 2,
      "needs_confirmation": 1,
      "ambiguous": 1,
      "unmatched": 0
    }
  },
  "meta": {
    "pagination": {
      "limit": 50,
      "next_cursor": null,
      "total_count": 2
    }
  },
  "error": null
}
```

The candidates match the latest UI schema; `unit_price`/`cost_price` are not declared sales dropdown options in this revision. Candidates annotate options inside the dropdown, never create a second mapping control. Already-used `revenue` can appear as a candidate but remains disabled by M03.

For “Xem chi tiết”, `include_details=true` may add `details: { "detected_type": "integer", "explanation": "..." }`; do not show technical type by default. Sample values are short strings for display and must not load entire rows/files. Sample limits and disclosure policy are TBD.

For the global collapsed successful-mapping summary, use the same endpoint without `sheet_id`, `review_only=false&status=auto_mapped`; return file/sheet IDs and names on every row. Rows then include `target_field`, e.g. `date → date`, `product → product_name`, `revenue → revenue`. For an inspected sheet with “Chỉ hiện trường cần xử lý” turned off, include read-only successful rows with `review_only=false`. Do not require confirmations for high-confidence pairs. `filter_counts` applies to the whole selected sheet before the status filter, not just the current page.

Errors: `404 SHEET_NOT_FOUND`, `409 ANALYSIS_NOT_READY`, `422 INVALID_FILTER`. UI: sheet selection, four filters, issue empty state, successful pairs expanded.

### M03 — Canonical dropdown options

**PROPOSED · `GET /imports/{import_id}/sheets/{sheet_id}/field-options` · synchronous read.** Optional `mapping_id` to return issue-specific AI preference; no body.

```json
{
  "data": {
    "schema": "sales",
    "schema_context_id": "ctx_orders",
    "mapping_revision": "map_v1",
    "duplicate_mapping_allowed": false,
    "options": [
      {
        "key": "date",
        "available": false,
        "reason_code": "already_mapped",
        "ai_preferred": false
      },
      {
        "key": "product_name",
        "available": false,
        "reason_code": "already_mapped",
        "ai_preferred": false
      },
      {
        "key": "quantity_sold",
        "available": true,
        "reason_code": null,
        "ai_preferred": true
      },
      {
        "key": "unit",
        "available": true,
        "reason_code": null,
        "ai_preferred": false
      },
      {
        "key": "selling_price",
        "available": true,
        "reason_code": null,
        "ai_preferred": false
      },
      {
        "key": "revenue",
        "available": false,
        "reason_code": "already_mapped",
        "ai_preferred": false
      },
      {
        "key": "is_stockout",
        "available": true,
        "reason_code": null,
        "ai_preferred": false
      },
      {
        "key": "promotion_name",
        "available": true,
        "reason_code": null,
        "ai_preferred": false
      }
    ]
  },
  "meta": {},
  "error": null
}
```

Observed catalogs to reconcile with BE:

| Schema | Current UI keys |
|---|---|
| sales | `date`, `product_name`, `quantity_sold`, `unit`, `selling_price`, `revenue`, `is_stockout`, `promotion_name` |
| inventory | `snapshot_date`, `ingredient_name`, `on_hand`, `unit`, `expiry_date`, `batch_id`, `warehouse_name` |
| recipes | `product_name`, `ingredient_name`, `ingredient_quantity`, `ingredient_unit`, `yield_quantity`, `yield_unit`, `recipe_version`, `effective_date` |

Canonical requiredness/descriptions and schema version are BE-owned/TBD. Current UI prohibits duplicate targets within the selected sheet. The proposal expresses this as `schema_context_id`; identical canonical targets in independent sheets are valid. Any supported merge/repeated-target exception must be explicitly negotiated—there is no such control in the current UI. Errors: `404 SHEET_NOT_FOUND`, `409 ANALYSIS_NOT_READY`.

### M04 — Confirm one mapping

**PROPOSED · `PATCH /imports/{import_id}/mappings/{mapping_id}` · synchronous atomic mutation.** Header example: `If-Match: "map_v1"`.

```json
{
  "target_field": "quantity_sold"
}
```

`200` response:

```json
{
  "data": {
    "mapping_id": "map_qty",
    "mapping_status": "resolved",
    "target_field": "quantity_sold",
    "mapping_revision": "map_v2",
    "progress": {
      "total_fields": 32,
      "auto_mapped": 27,
      "resolved": 1,
      "unresolved": 4,
      "unresolved_required": 4,
      "completed_fields": 28,
      "schema_blocker_count": 0,
      "complete": false,
      "can_process": false
    },
    "sheet_summary": {
      "sheet_id": "sheet_orders",
      "unresolved_count": 1
    },
    "file_summary": {
      "file_id": "file_sales",
      "unresolved_count": 1
    }
  },
  "meta": {},
  "error": null
}
```

On success, remove the card from the unresolved queue, update global progress/navigation badges from the response, and refresh affected dropdown availability. BE must enforce target validity and uniqueness atomically, including concurrent tabs. The proposed `If-Match` guard refers to the import-wide mapping revision returned by M01–M03; also return that revision as a quoted `ETag` on mapping reads/mutations. If an existing BE instead uses a body revision, agree on one adapter rather than two conflicting guards. Retry of an already-accepted identical mapping should be a no-op or handled through agreed request idempotency; do not count it twice. Revising a completed mapping is not a designed workflow.

Errors: `422 INVALID_MAPPING_TARGET`, `409 DUPLICATE_MAPPING`, `412 MAPPING_REVISION_CONFLICT`, `409 IMPORT_STATE_CONFLICT`, `404 MAPPING_NOT_FOUND`. Preserve the user's selected target on a failure; refresh authoritative options/progress after a conflict. All three unresolved states use this same mutation.

### I05 — Validate, normalize and persist import

**PROPOSED · `POST /imports/{import_id}/process` · asynchronous.** Request `{}` + idempotency key and the latest `If-Match` mapping revision from M04/M01, subject to the agreed guard adapter. Require `can_process: true` and no active conflicting job.

```json
{
  "data": {
    "import_id": "imp_0248",
    "status": "processing",
    "job_id": "job_process_248",
    "job_status": "queued"
  },
  "meta": {
    "poll_after_ms": 2000
  },
  "error": null
}
```

Job stages: validation → normalization → persistence → readiness assessment. No separate validation page/API is required by the current design; validation is a backend stage in this workflow. Show completion only after a durable successful commit, not merely after mapping is complete. Proposed safe default: validate before committing the batch, with no partial canonical update on failure. **Atomic versus explicitly reported partial-import policy is TBD WITH BE.** Warnings must not conceal dropped invalid rows or partial changes.

Errors: `409 UNRESOLVED_REQUIRED_FIELDS`, `409 SCHEMA_BLOCKED`, `412 MAPPING_REVISION_CONFLICT`, `409 IMPORT_STATE_CONFLICT`; job errors: `DATA_VALIDATION_FAILED`, `NORMALIZATION_FAILED`, `IMPORT_PROCESSING_FAILED`. Error details must identify file/sheet/column/row where known. Detailed correction UI is not yet designed; keep the batch/mappings available for inspection instead of redirecting to a false success.

## 7. Import Completion / Data Readiness

### I06 — Completion resource

**PROPOSED · `GET /imports/{import_id}/completion` · synchronous read after successful processing.** No body.

```json
{
  "data": {
    "import_id": "imp_0248",
    "status": "completed",
    "data_date": "2026-10-06",
    "completed_at": "2026-10-08T01:46:00+07:00",
    "summary": {
      "files": 4,
      "sheets": 9,
      "mapped_fields": 32,
      "errors": 0,
      "warnings": 0
    },
    "updated_resources": {
      "inventory": {
        "updated": true,
        "affected_ingredient_count": 247,
        "changed_record_count": null
      },
      "menu": {
        "updated": true,
        "affected_product_count": 63,
        "changed_record_count": null
      },
      "sales": {
        "updated": true,
        "added_record_count": 12438
      }
    },
    "readiness": {
      "forecast": {
        "ready": true,
        "history_days": null,
        "required_history_days": null,
        "reason_codes": []
      }
    }
  },
  "meta": {},
  "error": null
}
```

Counts above are completion-screen examples only. Impact semantics: inventory/menu counts are distinct affected entities in this committed batch, not current store totals; sales count is newly added records, not all historical records. BE must define deduplication/no-op/upsert accounting. If unavailable, return count `null` with `updated: true` so FE can show “Đã cập nhật” without inventing a number. If no menu data was committed, return `menu: {"updated": false, "affected_product_count": null, "changed_record_count": null}`; FE displays “Chưa cập nhật”. Supplier impact is optional/TBD and has no current completion card.

Not-ready forecast example:

```json
{
  "ready": false,
  "history_days": 42,
  "required_history_days": 140,
  "reason_codes": [
    "insufficient_history"
  ]
}
```

`history_days` must count distinct usable business dates, not rows/files/sheets or merely calendar span. Define required dataset coverage, model readiness, training and gaps with BE; 140 is a design example, not a hard-coded universal threshold. `ready: true` must be backed by the agreed downstream forecasting preconditions.

UI: success metrics; destination updated/not-updated; forecast ready → primary `/forecast`, insufficient → primary `/data-import` and disabled forecast action. “Xem chi tiết” uses I04/inspection intent; it does not require a new full report screen. Errors: `409 IMPORT_NOT_COMPLETED`, `404 IMPORT_NOT_FOUND`.

### R01 — Store readiness

**PROPOSED · `GET /stores/{store_id}/readiness` · synchronous read.** No body. Completion contains a point-in-time readiness result; this endpoint refreshes it for later navigation/setup.

```json
{
  "data": {
    "store_id": "store_001",
    "as_of_date": "2026-10-08",
    "data": {
      "status": "needs_update",
      "latest_business_date": "2026-10-07",
      "reason_codes": [
        "sales_not_updated_today"
      ]
    },
    "forecast": {
      "status": "ready",
      "ready": true,
      "history_days": null,
      "required_history_days": null,
      "reason_codes": []
    },
    "plan": {
      "status": "ready",
      "latest_plan_id": "plan_001",
      "reason_codes": []
    }
  },
  "meta": {},
  "error": null
}
```

Machine-to-UI labels: data `ready`/`needs_update`; forecast `ready`/`insufficient_data`; plan `ready`/`none`. Lack of a plan is not a server error. Readiness can be mixed: stale sales does not automatically invalidate an already-generated plan; whether it should be blocked/stale is a BE/product policy to agree. Errors: `404 STORE_NOT_FOUND`; absent optional data should be represented explicitly, not defaulted to ready.

## 8. Dashboard / Hôm nay

### D01 — Today attention aggregation

**PROPOSED · `GET /stores/{store_id}/today?date=2026-10-08` · synchronous bounded read.** `date` defaults to today in the store timezone. No body. This aggregation must not trigger forecasting or plan generation.

```json
{
  "data": {
    "store_id": "store_001",
    "date": "2026-10-08",
    "timezone": "Asia/Ho_Chi_Minh",
    "snapshot_id": "today_20261008_v1",
    "readiness": {
      "data": "needs_update",
      "forecast": "ready",
      "plan": "ready"
    },
    "attention": {
      "total_count": 5,
      "items": [
        {
          "attention_id": "att_condensed",
          "type": "shortage_risk",
          "severity": "high",
          "priority_rank": 1,
          "entity": {
            "type": "ingredient",
            "id": "condensed-milk",
            "name": "Sữa đặc"
          },
          "state": "at_risk",
          "facts": {
            "risk_start_date": "2026-10-10"
          },
          "destination": {
            "workspace": "procurement",
            "plan_id": "plan_001",
            "tab": "ingredients",
            "ingredient_id": "condensed-milk"
          }
        },
        {
          "attention_id": "att_fresh",
          "type": "near_expiry",
          "severity": "medium",
          "priority_rank": 2,
          "entity": {
            "type": "ingredient",
            "id": "fresh-milk",
            "name": "Sữa tươi"
          },
          "state": "near_expiry",
          "facts": {
            "lot_count": 1,
            "nearest_expiry": "2026-10-09"
          },
          "destination": {
            "workspace": "inventory",
            "ingredient_id": "fresh-milk"
          }
        },
        {
          "attention_id": "att_orange",
          "type": "near_expiry",
          "severity": "medium",
          "priority_rank": 3,
          "entity": {
            "type": "ingredient",
            "id": "orange",
            "name": "Cam"
          },
          "state": "near_expiry",
          "facts": {
            "lot_count": 1,
            "nearest_expiry": "2026-10-11"
          },
          "destination": {
            "workspace": "inventory",
            "ingredient_id": "orange"
          }
        },
        {
          "attention_id": "att_sugar",
          "type": "low_stock",
          "severity": "medium",
          "priority_rank": 4,
          "entity": {
            "type": "ingredient",
            "id": "sugar",
            "name": "Đường"
          },
          "state": "low_stock",
          "facts": {},
          "destination": {
            "workspace": "inventory",
            "ingredient_id": "sugar"
          }
        },
        {
          "attention_id": "att_sales",
          "type": "stale_data",
          "severity": "medium",
          "priority_rank": 5,
          "entity": {
            "type": "dataset",
            "id": "sales",
            "name": null
          },
          "state": "not_updated_today",
          "facts": {
            "latest_business_date": "2026-10-07"
          },
          "destination": {
            "workspace": "data_import"
          }
        }
      ]
    },
    "pending_decision": {
      "plan_id": "plan_001",
      "strategy": "protected",
      "currency": "VND",
      "total_cost": 8338000,
      "ingredient_count": 9,
      "status": "awaiting_review",
      "destination": {
        "workspace": "procurement",
        "plan_id": "plan_001",
        "tab": "overview"
      }
    },
    "outlook": {
      "start_date": "2026-10-08",
      "end_date": "2026-10-14",
      "days": [
        {
          "date": "2026-10-08",
          "demand_pressure": "normal",
          "shortage_ingredient_count": 0,
          "incoming_order_count": 0
        },
        {
          "date": "2026-10-09",
          "demand_pressure": "elevated",
          "shortage_ingredient_count": 1,
          "incoming_order_count": 0
        },
        {
          "date": "2026-10-10",
          "demand_pressure": "high",
          "shortage_ingredient_count": 3,
          "incoming_order_count": 1
        },
        {
          "date": "2026-10-11",
          "demand_pressure": "elevated",
          "shortage_ingredient_count": 2,
          "incoming_order_count": 2
        },
        {
          "date": "2026-10-12",
          "demand_pressure": "normal",
          "shortage_ingredient_count": 1,
          "incoming_order_count": 0
        },
        {
          "date": "2026-10-13",
          "demand_pressure": "normal",
          "shortage_ingredient_count": 0,
          "incoming_order_count": 1
        },
        {
          "date": "2026-10-14",
          "demand_pressure": "elevated",
          "shortage_ingredient_count": 1,
          "incoming_order_count": 0
        }
      ]
    }
  },
  "meta": {
    "generated_at": "2026-10-08T01:40:00+07:00",
    "warnings": []
  },
  "error": null
}
```

The timeline values above reproduce the prototype's illustrative signals, not a confirmed calculation. BE must define demand-pressure thresholds, alert freshness, deduplication, priority ranking and the source of expected deliveries. Risk counts are distinct affected ingredients per day; incoming counts are purchase orders expected to arrive, not line items or kilograms. A date with unavailable forecasts/deliveries must contain `null` metrics; it must not look safely zero. BE must not compute a new forecast merely because this dashboard is loaded.

The dashboard `date` is the date being viewed, not the latest imported business date or the inventory snapshot cutoff. Selecting an outlook date does not change that date or request another forecast. Only a successfully evaluated empty attention set qualifies for the calm state; a failed/unavailable dashboard read must not be displayed as “mọi thứ đang ổn”.

For this v0, the attention list is bounded and `total_count` must describe the returned actionable set; there is no designed “show more”/alert pagination. If a larger queue is required, agree on a bounded overview plus a destination before returning unseen counts. A pending plan is shown in its separate card, not counted twice as an attention row without a deliberate policy. `awaiting_review` is a proposed business status, not a confirmed approval capability.

Calm state: `attention: {"total_count": 0, "items": []}`; FE shows “Hôm nay mọi thứ đang ổn”. No pending decision: `pending_decision: null`. Keep a real pending plan/outlook visible even when attention is empty. Selecting a day is local and reads its supplied counts; “Xem chi tiết” uses a destination adapter. Do not add a local resolution/acknowledgement mutation for alerts.

UI: actionable/calm, pending/no pending, mixed readiness, day selection, AI drawer. Errors: `422 INVALID_DATE`, `404 STORE_NOT_FOUND`. Absence of a forecast/plan is a valid non-ready state, not HTTP 500. Cross-navigation is specified in Section 19.

## 9. Inventory / Kho

Current UI also contains `watch`, `empty`, `expired`; do not reduce the schema to only stable/low/near-expiry. Proposed wire statuses: `stable`, `low_stock`, `near_expiry`, `watch`, `empty`, `expired`. FE maps prototype `low` → `low_stock`, `near-expiry` → `near_expiry`.

The current “Sắp hết” filter includes both `low_stock` and `empty`. “Gần hạn” excludes already-expired lots for the near-expiry summary; expired status remains visible in all/ingredient detail. Thresholds and status precedence are **TBD WITH BE**, and must not be derived from procurement recommendations in FE.

### V01 — Inventory list and store-wide summary

**PROPOSED · `GET /stores/{store_id}/inventory?q=Cam&limit=50&sort=name` · synchronous, paginated read.** Optional `status` (comma-separated), repeated `ingredient_id`, `cursor`.

```json
{
  "data": {
    "summary": {
      "ingredient_count": 10,
      "positive_lot_count": 11,
      "near_expiry_lot_count": 2
    },
    "items": [
      {
        "ingredient_id": "orange",
        "name": "Cam",
        "on_hand_quantity": "8.28",
        "unit": "kg",
        "lot_count": 2,
        "nearest_expiry": "2026-10-11",
        "status": "near_expiry"
      }
    ],
    "missing_ingredient_ids": []
  },
  "meta": {
    "as_of_date": "2026-10-07",
    "updated_at": "2026-10-07T08:40:00+07:00",
    "snapshot_id": "stock_20261007_v1",
    "pagination": {
      "limit": 50,
      "next_cursor": null,
      "total_count": 1
    }
  },
  "error": null
}
```

Summary remains unfiltered/store-wide; this search returns one matching row. “Hiện có” means physical on-hand in the agreed snapshot, not forecast inventory or recommended purchase quantity. The prototype sums positive lots, including physical expired stock; whether expired/quarantined stock should be excluded from available stock is **TBD WITH BE**. Do not label this quantity “usable” without agreement. Include catalog ingredients with known zero stock if required by the agreed source-of-truth model; do not invent zero-stock rows for unknown ingredient IDs.

If repeated `ingredient_id` filters originate from a recipe, return only known matches plus `missing_ingredient_ids`; a missing row is not automatically a zero quantity. UI: filters/search/table, empty stock/list results, selected row. Errors: `422 INVALID_FILTER`, `404 STORE_NOT_FOUND`.

### V02 — Selected ingredient and initial lot page

**PROPOSED · `GET /stores/{store_id}/inventory/{ingredient_id}` · synchronous read.** No body; optional agreed snapshot reference/`lot_limit`.

```json
{
  "data": {
    "ingredient_id": "orange",
    "name": "Cam",
    "status": "near_expiry",
    "on_hand_quantity": "8.28",
    "unit": "kg",
    "lot_count": 2,
    "lots": [
      {
        "lot_id": "lot_cam_001",
        "batch_code": "CAM-001",
        "quantity": "3.28",
        "unit": "kg",
        "expiry_date": "2026-10-11",
        "status": "near_expiry",
        "use_first": true,
        "location": "Quầy pha chế",
        "updated_at": "2026-10-07T08:40:00+07:00"
      },
      {
        "lot_id": "lot_cam_002",
        "batch_code": "CAM-002",
        "quantity": "5",
        "unit": "kg",
        "expiry_date": "2026-10-20",
        "status": "stable",
        "use_first": false,
        "location": "Kho chính",
        "updated_at": "2026-10-07T08:40:00+07:00"
      }
    ],
    "lots_page": {
      "next_cursor": null,
      "total_count": 2
    }
  },
  "meta": {
    "as_of_date": "2026-10-07",
    "snapshot_id": "stock_20261007_v1"
  },
  "error": null
}
```

Lot order: earliest expiry first; null expiry last, then stable batch/ID tie-break. `use_first` is the business-facing earliest suitable lot marker; never prioritize an expired lot. FE can compute “Còn 4 ngày” from explicit `as_of_date`, not the browser's arbitrary timezone. `batch_code` may be null; it is different from `lot_id`. Detail must contain factual stock only, without procurement/forecast values. Errors: `404 INGREDIENT_NOT_FOUND`, `409 SNAPSHOT_NOT_AVAILABLE` if historical pinning is supported and unavailable.

### V03 — Additional lot pages

**PROPOSED · `GET /stores/{store_id}/inventory/{ingredient_id}/lots?limit=1&sort=expiry_date,batch_code` · synchronous paginated read.** Optional `cursor` and the same snapshot reference.

```json
{
  "data": {
    "ingredient_id": "orange",
    "items": [
      {
        "lot_id": "lot_cam_001",
        "batch_code": "CAM-001",
        "quantity": "3.28",
        "unit": "kg",
        "expiry_date": "2026-10-11",
        "status": "near_expiry",
        "use_first": true,
        "location": "Quầy pha chế",
        "updated_at": "2026-10-07T08:40:00+07:00"
      }
    ]
  },
  "meta": {
    "as_of_date": "2026-10-07",
    "snapshot_id": "stock_20261007_v1",
    "pagination": {
      "limit": 1,
      "next_cursor": "lot_cam_002_cursor",
      "total_count": 2
    }
  },
  "error": null
}
```

The example uses `limit=1` to illustrate continuation; normal page limits follow Section 2. Required only when the lot collection exceeds the initial detail page. Lots scroll within the drawer; this is not a new full lot-management screen. Errors and ordering are the same as V02, plus `422 INVALID_CURSOR`.

### V04 — Movement history

**PROPOSED · `GET /stores/{store_id}/inventory/{ingredient_id}/movements?limit=50&sort=-occurred_at` · synchronous paginated read.** Optional `cursor`; date range only if agreed, not required by current UI.

```json
{
  "data": {
    "ingredient_id": "orange",
    "items": [
      {
        "movement_id": "move_003",
        "occurred_at": "2026-10-07T08:15:00+07:00",
        "quantity_delta": "10",
        "unit": "kg",
        "kind": "receipt",
        "batch_code": null
      },
      {
        "movement_id": "move_002",
        "occurred_at": "2026-10-06T16:30:00+07:00",
        "quantity_delta": "-2.5",
        "unit": "kg",
        "kind": "usage",
        "batch_code": "CAM-001"
      },
      {
        "movement_id": "move_001",
        "occurred_at": "2026-10-05T09:00:00+07:00",
        "quantity_delta": "-0.8",
        "unit": "kg",
        "kind": "adjustment",
        "batch_code": "CAM-001"
      }
    ]
  },
  "meta": {
    "pagination": {
      "limit": 50,
      "next_cursor": null,
      "total_count": 3
    }
  },
  "error": null
}
```

Signed quantity is authoritative; `kind` is `receipt`, `usage`, `adjustment`. These recent rows are not a complete opening-balance ledger: their sum must not be used to reconstruct current stock. Load lazily on “Biến động”. Known empty history returns `items: []`. Errors: `404 INGREDIENT_NOT_FOUND`, `422 INVALID_CURSOR`. No editing or adjustment mutation is specified.

## 10. Menu / Recipes

Observed statuses are **`active` / `paused`**, not `active` / `inactive`. If existing BE uses `inactive`, reconcile through an explicit adapter. Current counts are 3 products / 2 active / 1 paused in the prototype; no fake 63-product list is required.

### P01 — Products and store-wide summary

**PROPOSED · `GET /stores/{store_id}/products?q=Matcha&limit=50&sort=name` · synchronous paginated read.** Optional `status=active|paused`, `cursor`.

```json
{
  "data": {
    "summary": {
      "product_count": 3,
      "active_count": 2,
      "paused_count": 1
    },
    "items": [
      {
        "product_id": "matcha-latte",
        "name": "Matcha Latte",
        "selling_price": 49000,
        "currency": "VND",
        "status": "active",
        "ingredient_count": 6
      }
    ]
  },
  "meta": {
    "updated_at": "2026-10-07T08:40:00+07:00",
    "data_version": "menu_v1",
    "pagination": {
      "limit": 50,
      "next_cursor": null,
      "total_count": 1
    }
  },
  "error": null
}
```

Summary is unfiltered. `ingredient_count` describes current recipe lines using the agreed definition; if no recipe is known, propose `null`, not a fabricated zero. Price may be null. UI: known empty menu → “Chưa có dữ liệu menu” + import CTA; filtered empty → “Không tìm thấy món”. Errors: `422 INVALID_FILTER`, `404 STORE_NOT_FOUND`.

### P02 — Product with current recipe

**PROPOSED · `GET /stores/{store_id}/products/{product_id}` · synchronous read.** No body.

```json
{
  "data": {
    "product_id": "matcha-latte",
    "name": "Matcha Latte",
    "selling_price": 49000,
    "currency": "VND",
    "status": "active",
    "recipe": {
      "recipe_id": "recipe_matcha_current",
      "yield_quantity": "1",
      "yield_unit": "cup",
      "effective_date": "2026-10-01",
      "ingredients": [
        {
          "recipe_line_id": "rl_01",
          "ingredient_id": "matcha",
          "ingredient_name": "Bột matcha",
          "quantity": "8",
          "unit": "g"
        },
        {
          "recipe_line_id": "rl_02",
          "ingredient_id": "fresh-milk",
          "ingredient_name": "Sữa tươi",
          "quantity": "180",
          "unit": "ml"
        },
        {
          "recipe_line_id": "rl_03",
          "ingredient_id": "sugar",
          "ingredient_name": "Đường",
          "quantity": "20",
          "unit": "g"
        },
        {
          "recipe_line_id": "rl_04",
          "ingredient_id": "ice",
          "ingredient_name": "Đá",
          "quantity": "150",
          "unit": "g"
        },
        {
          "recipe_line_id": "rl_05",
          "ingredient_id": "cups-500",
          "ingredient_name": "Ly 500ml",
          "quantity": "1",
          "unit": "piece"
        },
        {
          "recipe_line_id": "rl_06",
          "ingredient_id": "cup-lids",
          "ingredient_name": "Nắp ly",
          "quantity": "1",
          "unit": "piece"
        }
      ]
    }
  },
  "meta": {
    "data_version": "menu_v1"
  },
  "error": null
}
```

`recipe: null` means no known current recipe. Yield and effective date may be unknown; use null and display “—”. Do not add full version history or recipe mutations. “Xem tồn kho nguyên liệu” derives ingredient IDs from this recipe and invokes V01 via the FE route adapter; do not include full stock/lots in P02. The source may contain recipe ingredients not present in the inventory fixture, so missing stock rows need explicit handling. Errors: `404 PRODUCT_NOT_FOUND`. Selecting/closing details or changing product focus is local UI.

## 11. Procurement Planning Setup

### C01 — Planning context, defaults and supported controls

**PROPOSED · `GET /stores/{store_id}/planning-context` · synchronous read.** No body. This provides configuration/readiness, not a generated plan.

```json
{
  "data": {
    "store_id": "store_001",
    "currency": "VND",
    "latest_business_date": "2026-10-07",
    "defaults": {
      "cutoff_date": "2026-10-07",
      "horizon_days": 7,
      "budget": 50000000,
      "strategy": "balanced",
      "include_open_purchase_orders": true,
      "advanced": {
        "method": "standard",
        "scenario_count": null
      }
    },
    "supported_horizon_days": [
      1,
      3,
      5,
      7
    ],
    "supported_strategies": [
      "lean",
      "balanced",
      "protected"
    ],
    "capabilities": {
      "include_open_purchase_orders": true,
      "scenario_based_planning": null
    },
    "advanced_options": {
      "methods": [
        "standard"
      ],
      "scenario_counts": []
    },
    "readiness": {
      "can_generate": true,
      "reason_codes": []
    }
  },
  "meta": {},
  "error": null
}
```

The response above illustrates an agreed standard path with open-order support; it is not evidence that the current BE supports it. Defaults reflect observed controls, while returned supported options must reflect the actual agreed engine. Scenario planning is deliberately unknown in this example and is not advertised as selectable. If supported, BE may advertise `scenario_based` and the supported counts from the UI's 30/100/300 options. A null capability is unknown; it must not enable a request that depends on that capability. In particular, `can_generate: true` for the default open-order configuration requires confirmed open-order support. BE must not silently accept an unsupported advanced mode or ignore open orders. If a setting is unsupported, FE and BE must agree on disabling it or returning an explicit domain error. There is no permission/settings screen being proposed here.

| UI | Proposed request field/value |
|---|---|
| Dữ liệu tính đến ngày | `cutoff_date` |
| Lập kế hoạch cho | `horizon_days`: 1, 3, 5, 7 |
| Ngân sách nhập hàng | Integer `budget`, VND |
| Tiết kiệm / Cân bằng / An toàn | `strategy`: `lean` / `balanced` / `protected` |
| Tính cả đơn hàng đang chờ | `include_open_purchase_orders` |
| Phương pháp tính, advanced only | `advanced.method`: `standard` / `scenario_based` |
| Mức độ mô phỏng, advanced only | `advanced.scenario_count`: null in standard mode; 30/100/300 when supported |

Normal business controls must not need model/optimizer parameters. Backend mapping of these advanced values is TBD. The current FE serializer uses camelCase and `deterministic` internally; an API adapter must translate it to the agreed wire shape. Budget parsing currently allows zero; do not change this silently to a positive-only form rule. A zero-budget request can still be infeasible as a business outcome. Cutoff/end-of-day snapshot semantics and delivery calendar handling are BE policy to confirm, not inferred from a valid HTML date.

UI: defaults, chosen priority, open orders enabled, advanced collapsed/expanded, valid/invalid form and readiness. Errors: `404 STORE_NOT_FOUND`; malformed saved defaults or unsupported options are explicit availability/configuration states.

### C02 — Generate procurement plan

**PROPOSED · `POST /stores/{store_id}/procurement-plans` · asynchronous.** Header: idempotency key. The example represents the user choosing An toàn instead of the default Cân bằng.

```json
{
  "cutoff_date": "2026-10-07",
  "horizon_days": 7,
  "budget": 50000000,
  "currency": "VND",
  "strategy": "protected",
  "include_open_purchase_orders": true,
  "advanced": {
    "method": "standard",
    "scenario_count": null
  }
}
```

`202` response:

```json
{
  "data": {
    "plan_id": "plan_001",
    "generation_status": "queued",
    "job_id": "job_plan_001",
    "job_status": "queued"
  },
  "meta": {
    "poll_after_ms": 2000
  },
  "error": null
}
```

If forecasting is an internal prerequisite, the job may include it; do not force FE to guess when to call a separate forecast/training service. Whether BE already splits forecast and decision runs is TBD (Section 17). An accepted request is not a ready plan. Job completion points to C03; default results tab is Tổng quan. Persist applied inputs and referenced data versions so later explanations/scenarios are reproducible at the contract boundary.

UI integration states: ready → generating → result ready / failed. Errors: `422 INVALID_PLANNING_CONFIGURATION`, `422 INVALID_CUTOFF_DATE`, `422 UNSUPPORTED_PLANNING_OPTION`, `409 INSUFFICIENT_HISTORICAL_DATA`, `409 FORECAST_NOT_READY`; job failures may include `BUDGET_INFEASIBLE`, `PLAN_GENERATION_FAILED`. Do not claim the engine generates/ranks all three priorities automatically; alternative availability is separately negotiated.

## 12. Procurement Results

Tabs are `overview`, `ingredients`, `strategies`, `scenarios`; default overview. Use separate/lazy resource reads for ingredient charts, comparisons and long analysis. The current React component expects a combined `ProcurementPlan`; a FE adapter can merge these responses into its presentation model without requiring a giant backend response.

### C03 — Plan resource / overview

**PROPOSED · `GET /procurement-plans/{plan_id}` · synchronous read.** No body.

```json
{
  "data": {
    "plan_id": "plan_001",
    "store_id": "store_001",
    "plan_version": "plan_v1",
    "generation_status": "completed",
    "decision_status": "awaiting_review",
    "configuration": {
      "cutoff_date": "2026-10-07",
      "horizon_days": 7,
      "budget": 50000000,
      "currency": "VND",
      "strategy": "protected",
      "include_open_purchase_orders": true,
      "advanced": {
        "method": "standard",
        "scenario_count": null
      }
    },
    "selected_strategy": "protected",
    "recommended_strategy": null,
    "metrics": {
      "total_cost": 8338000,
      "budget_utilization": 0.16676,
      "purchase_ingredient_count": 9,
      "total_ingredient_count": 10,
      "service_rate": 0.988,
      "shortage_risk": 0.015
    },
    "priority_purchases": [
      {
        "rank": 1,
        "ingredient_id": "condensed-milk",
        "name": "Sữa đặc",
        "recommended_quantity": "24",
        "unit": "l",
        "expected_cost": 1128000,
        "order_date": null
      },
      {
        "rank": 2,
        "ingredient_id": "banana",
        "name": "Chuối",
        "recommended_quantity": "20",
        "unit": "kg",
        "expected_cost": 480000,
        "order_date": null
      },
      {
        "rank": 3,
        "ingredient_id": "cups-500",
        "name": "Ly 500ml",
        "recommended_quantity": "1000",
        "unit": "piece",
        "expected_cost": 750000,
        "order_date": null
      }
    ],
    "warning_summary": {
      "total_count": 1,
      "highest_priority": {
        "warning_id": "warn_lead",
        "code": "order_early",
        "priority_rank": 1,
        "details": {
          "lead_time_days_min": 2,
          "lead_time_days_max": 4
        }
      }
    },
    "actions": {
      "draft_po": {
        "available": null,
        "state": null,
        "draft_po_ids": null
      },
      "regenerate": {
        "available": null
      }
    },
    "ai_summary": {
      "available": false,
      "bullets": []
    }
  },
  "meta": {},
  "error": null
}
```

Cost, service and risk numbers are illustrative UI values. A live deterministic path may return `shortage_risk: null`; FE displays “—”, not 0%. Define service-rate denominator, shortage-risk meaning and budget utilization with BE. `budget_utilization` is actual total cost divided by the run's actual positive budget; if budget is zero or unknown, return null plus known amounts, not divide by zero. Priority purchases are a ranked subset: their sum/length does not equal the full plan totals.

`selected_strategy` is the applied business priority. `recommended_strategy` is a separately justified system recommendation and may be null; the prototype currently equates its recommendation badge with the selected plan strategy. BE/product must decide whether that badge is truly backed by ranking. Do not synthesize rankings from incomplete alternative metrics.

Keep execution `generation_status` separate from user attention `decision_status`. `awaiting_review` is proposed; the design provides no explicit “approve plan” mutation. Draft creation must not silently mean supplier order placement or plan approval. Unknown action availability/state/IDs remain null and the action stays unavailable until C09 is agreed; do not imply that absence of a callback result proves no draft exists. Highest-priority warning is concise; additional details can be supplied in the relevant ingredient/analysis context without expanding the overview into every warning.

UI: three KPIs, selected priority, top purchases, one warning, draft-PO intent, AI summary. In-progress C03 may return the same plan ID/configuration with metrics null and an `active_job_id`; FE waits rather than treating it as zero-valued results. Errors: `404 PLAN_NOT_FOUND`; result-only child resources may return `409 PLAN_NOT_READY`.

### C04 — Ingredient navigator

**PROPOSED · `GET /procurement-plans/{plan_id}/ingredients?status=needs_order&limit=3` · synchronous paginated read.** Optional `cursor`; statuses `needs_order`, `sufficient` (all when omitted).

```json
{
  "data": {
    "items": [
      {
        "ingredient_id": "condensed-milk",
        "name": "Sữa đặc",
        "status": "needs_order",
        "recommended_quantity": "24",
        "unit": "l"
      },
      {
        "ingredient_id": "banana",
        "name": "Chuối",
        "status": "needs_order",
        "recommended_quantity": "20",
        "unit": "kg"
      },
      {
        "ingredient_id": "cups-500",
        "name": "Ly 500ml",
        "status": "needs_order",
        "recommended_quantity": "1000",
        "unit": "piece"
      }
    ],
    "counts": {
      "all": 10,
      "needs_order": 9,
      "sufficient": 1
    }
  },
  "meta": {
    "pagination": {
      "limit": 3,
      "next_cursor": "plan_items_page2",
      "total_count": 9
    }
  },
  "error": null
}
```

Counts are full-plan/unfiltered; pagination totals follow the selected filter. FE adapter maps source `order`/`enough` to wire values above. Unknown recommended quantity stays null; `sufficient` does not require a made-up purchase of zero. Select one ingredient at a time and read C05. Errors: `404 PLAN_NOT_FOUND`, `409 PLAN_NOT_READY`, `422 INVALID_FILTER`.

### C05 — Selected ingredient decision detail

**PROPOSED · `GET /procurement-plans/{plan_id}/ingredients/{ingredient_id}` · synchronous read.** No body.

```json
{
  "data": {
    "plan_id": "plan_001",
    "plan_version": "plan_v1",
    "ingredient_id": "condensed-milk",
    "name": "Sữa đặc",
    "status": "needs_order",
    "recommendation": {
      "quantity": "24",
      "unit": "l",
      "expected_cost": 1128000,
      "currency": "VND",
      "order_date": "2026-10-07",
      "expected_arrival_date": "2026-10-10",
      "supplier": {
        "supplier_id": "supplier_01",
        "name": "Sữa Việt Distribution",
        "lead_time_days": 3
      },
      "packaging": {
        "pack_count": "1",
        "quantity_per_pack": "24",
        "unit": "l"
      }
    },
    "inventory_reference": {
      "snapshot_id": null,
      "as_of_date": "2026-10-07",
      "on_hand_quantity": null,
      "unit": "l"
    },
    "demand_summary": {
      "horizon_quantity": "22",
      "unit": "l",
      "coverage_days": null
    },
    "reasons": [
      {
        "code": "insufficient_inventory",
        "details": {}
      },
      {
        "code": "supplier_lead_time",
        "details": {
          "days": 3
        }
      },
      {
        "code": "order_before_shortage",
        "details": {}
      }
    ],
    "warnings": []
  },
  "meta": {},
  "error": null
}
```

Dates above are contract examples aligned to the proposed October run, not a claim that the source's August screenshot was recomputed. Supplier, lead time, packaging, forecast and stock values may individually be null. Preserve factual unknowns; do not choose a supplier or pack size in FE. Reasons are structured codes plus supporting facts so short bullets do not require a narrative-only API. `inventory_reference` refers to data used by this plan; the Kho link opens current inventory separately. Errors: `404 PLAN_INGREDIENT_NOT_FOUND`, `409 PLAN_NOT_READY`.

### C06 — Selected ingredient chart series

**PROPOSED · `GET /procurement-plans/{plan_id}/ingredients/{ingredient_id}/forecast-series` · synchronous read; no computation on GET.** No body.

Unavailable-series example:

```json
{
  "data": {
    "plan_id": "plan_001",
    "ingredient_id": "condensed-milk",
    "status": "unavailable",
    "unit": "l",
    "start_date": "2026-10-08",
    "end_date": "2026-10-14",
    "forecast_id": null,
    "points": [],
    "interval_definition": null,
    "reason_code": "series_not_available"
  },
  "meta": {},
  "error": null
}
```

When available, `status` is `available` or `partial` and `points` contain this shape (one point example, not an independently computed result):

```json
{
  "date": "2026-10-08",
  "expected_demand": "3",
  "projected_inventory": "0",
  "incoming_quantity": "0",
  "demand_lower": "2",
  "demand_upper": "4"
}
```

All quantities share the returned unit. Unknown per-day signals are null; keep gaps in the chart rather than interpolating invented values. `interval_definition`, when present, must describe exactly which demand interval BE returns; never label arbitrary lower/upper bounds “95% confidence”. Forecast series definition, inventory point-in-day timing and inbound-order handling are **TBD WITH BE**. Do not expose technical interval labels by default or send chart images as the only API.

UI: render a chart only in selected ingredient detail; unavailable → “Chưa có chuỗi dữ liệu”. Errors: `404 PLAN_INGREDIENT_NOT_FOUND`, `409 PLAN_NOT_READY`; no stored series is a valid unavailable response, not a generic 500.

### C07 — Alternative priorities and trade-offs

**PROPOSED · `GET /procurement-plans/{plan_id}/strategies` · synchronous read.** No body. Do not compute all alternatives on every tab switch.

```json
{
  "data": {
    "selected_strategy": "protected",
    "recommended_strategy": null,
    "items": [
      {
        "strategy": "lean",
        "availability": "not_available",
        "metrics": {
          "total_cost": null,
          "service_rate": null,
          "shortage_risk": null
        },
        "purchase_ingredient_count": null,
        "recommended": null,
        "advantages": [
          {
            "code": "prioritize_cost",
            "details": {}
          }
        ],
        "tradeoffs": []
      },
      {
        "strategy": "balanced",
        "availability": "partial",
        "metrics": {
          "total_cost": 7918000,
          "service_rate": null,
          "shortage_risk": null
        },
        "purchase_ingredient_count": null,
        "recommended": null,
        "advantages": [
          {
            "code": "balance_cost_availability",
            "details": {}
          }
        ],
        "tradeoffs": []
      },
      {
        "strategy": "protected",
        "availability": "available",
        "metrics": {
          "total_cost": 8338000,
          "service_rate": 0.988,
          "shortage_risk": 0.015
        },
        "purchase_ingredient_count": 9,
        "recommended": null,
        "advantages": [
          {
            "code": "reduce_shortage_risk",
            "details": {}
          }
        ],
        "tradeoffs": [
          {
            "code": "higher_cost",
            "compared_with": "balanced",
            "details": {
              "difference_amount": 420000,
              "currency": "VND"
            }
          }
        ]
      }
    ],
    "rejected_options": []
  },
  "meta": {},
  "error": null
}
```

Selecting a card only inspects pros/cons. It must not silently switch the applied plan or the strategy used by “Tạo Draft PO”. Missing metrics stay null; no ranking/causal trade-off may be invented from a priority's label. Rejected options can carry an option ID and structured reason if actually produced; empty means no supplied rejected-option data, not proof that every option was feasible. Availability of all three generated plans, the recommendation criterion and lazy computation policy are TBD. UI: three comparable cards, selected trade-offs, collapsed rejection reasons. Errors: `404 PLAN_NOT_FOUND`, `409 PLAN_NOT_READY`.

### C08 — Saved detailed analysis

**PROPOSED · `GET /procurement-plans/{plan_id}/explanation` · synchronous retrieval, not a new LLM invocation.** No body; load only when the AI-summary accordion requests full analysis.

```json
{
  "data": {
    "plan_id": "plan_001",
    "available": false,
    "sections": [],
    "evidence": [],
    "reason_code": "explanation_not_available"
  },
  "meta": {},
  "error": null
}
```

If already produced, `sections` contain `section_id`, short `title`, `bullets` and optional `text`; evidence uses X02's schema. Natural-language text is the explanatory exception to machine-only status values. C03 can supply short saved `ai_summary.bullets` without requiring this long response on initial load. If no saved analysis exists, use an unavailable state or invoke the agreed X01 explanation flow explicitly; never run expensive generation silently in GET. Actual saved-analysis availability is TBD. Errors: `404 PLAN_NOT_FOUND`, `409 PLAN_NOT_READY`.

### C09 — Draft PO intent

**TBD WITH BE · candidate `POST /procurement-plans/{plan_id}/draft-purchase-orders` · asynchronous capability proposed only if an existing draft-order service can support it.** The current CTA only emits a callback/event; no PO is created in the prototype. Do not expose a production-enabled button until its contract is agreed.

Candidate request:

```json
{
  "strategy": "protected",
  "plan_version": "plan_v1"
}
```

Candidate accepted response:

```json
{
  "data": {
    "plan_id": "plan_001",
    "job_id": "job_draft_po_001",
    "job_status": "queued"
  },
  "meta": {
    "poll_after_ms": 2000
  },
  "error": null
}
```

Completion can point to C03 with `actions.draft_po: {"available": true, "state": "created", "draft_po_ids": ["po_draft_001"]}`. This creates drafts only—no supplier submission, payment, approval or receipt operation is requested. State options proposed: `not_created`, `creating`, `created`, `unavailable`. Grouping by supplier, missing supplier handling, duplicate prevention and whether the action resolves a pending decision are TBD. Use idempotency to prevent duplicate drafts. UI: intent → pending → actual created/unavailable/error, never optimistic “created” after just emitting an event. Errors proposed: `409 PLAN_NOT_READY`, `409 DRAFT_PO_ALREADY_CREATED`, `422 SUPPLIER_INFORMATION_MISSING`, `422 STRATEGY_NOT_APPLIED`, `503 CAPABILITY_UNAVAILABLE`.

### C10 — “Chạy lại” intent

**TBD WITH BE · candidate `POST /procurement-plans/{plan_id}/regenerate` · asynchronous if agreed.** This header action exists in the current source, even though no processing is implemented by the callback.

Candidate request `{}` + idempotency key; candidate response:

```json
{
  "data": {
    "source_plan_id": "plan_001",
    "plan_id": "plan_002",
    "job_id": "job_plan_002",
    "job_status": "queued"
  },
  "meta": {
    "poll_after_ms": 2000
  },
  "error": null
}
```

Propose a new immutable plan ID rather than overwriting the old report. Same inputs/snapshot versus refreshed data is **TBD WITH BE** and must be explicit before implementation. Existing plan and AI conversation remain scoped to their IDs while the new run is pending. UI: action pending / new result / error. Errors proposed: `404 PLAN_NOT_FOUND`, `409 PLAN_NOT_READY`, `409 SOURCE_CONFIGURATION_UNAVAILABLE`, `PLAN_GENERATION_FAILED` in the job. BE may instead reuse C02 with prior configuration; do not implement both routes without need.

## 13. Procurement What-if

Observed: percent demand change; nonnegative integer supplier delay; optional budget; “Giữ nguyên” priority; one comparison table. Changing inputs invalidates the previous result in the current source. A scenario must never mutate the baseline plan or create a purchase order.

### S01 — Run scenario

**PROPOSED · `POST /procurement-plans/{plan_id}/scenarios` · asynchronous.** Header: idempotency key.

```json
{
  "demand_change_pct": 10,
  "supplier_delay_days": 1,
  "budget": 10000000,
  "currency": "VND",
  "strategy": "protected",
  "baseline_plan_version": "plan_v1"
}
```

`202` response:

```json
{
  "data": {
    "scenario_id": "scenario_001",
    "baseline_plan_id": "plan_001",
    "job_id": "job_scenario_001",
    "job_status": "queued"
  },
  "meta": {
    "poll_after_ms": 2000
  },
  "error": null
}
```

`+10%` is transmitted as `10`, not multiplier `1.1`; adapter translates the existing FE request if BE accepts a multiplier instead. Proposed lower demand bound is -100% as validated by the UI; upper bound/server workload limit is TBD. Delay is integer ≥0. `strategy` is an actual strategy; FE resolves “Giữ nguyên” from the baseline, not a fourth strategy enum. Current empty scenario budget means “Không giới hạn”, so propose `budget: null` = no scenario budget cap, not “inherit budget”. If BE cannot support that meaning, negotiate an explicit budget mode; do not silently inherit.

UI: valid inputs → pending (run button disabled) → comparison / unavailable/error. Errors: `422 INVALID_SCENARIO_CONFIGURATION`, `409 PLAN_NOT_READY`, `412 BASELINE_VERSION_CONFLICT`, `422 UNSUPPORTED_SCENARIO_OPTION`; job errors: `SCENARIO_FAILED`, `BUDGET_INFEASIBLE`. Source prototype only provides one example outcome; BE simulation capability is unverified.

### S02 — Scenario resource with baseline comparison

**PROPOSED · `GET /procurement-plans/{plan_id}/scenarios/{scenario_id}` · synchronous read.** No body.

```json
{
  "data": {
    "scenario_id": "scenario_001",
    "baseline_plan_id": "plan_001",
    "baseline_plan_version": "plan_v1",
    "status": "completed",
    "inputs": {
      "demand_change_pct": 10,
      "supplier_delay_days": 1,
      "budget": 10000000,
      "currency": "VND",
      "strategy": "protected"
    },
    "comparison": {
      "baseline": {
        "total_cost": 8338000,
        "service_rate": 0.988,
        "shortage_risk": 0.015
      },
      "scenario": {
        "total_cost": 9100000,
        "service_rate": 0.964,
        "shortage_risk": 0.041
      }
    },
    "changed_recommendations": null
  },
  "meta": {},
  "error": null
}
```

Scenario metrics above are the user's single illustrative before/after case, not a verified simulation. Return actual baseline/result metrics together, with nullable unavailable fields. `changed_recommendations: null` means not supplied; `[]` would mean evaluated and none changed. No new ingredient-impact table is required by the current UI. Pending resource may carry `comparison: null` and `active_job_id`; failed job is not a successful null-result comparison. Errors: `404 SCENARIO_NOT_FOUND`, `409 SCENARIO_NOT_READY` for result-only requests. FE must ignore a delayed response whose input/job token no longer matches the current controls.

## 14. Contextual AI

Observed: the same right-side drawer is reused in procurement, selected inventory/product contexts and Hôm nay. Initial suggestions are local context-derived chips; conversations remain visible on tab/item changes. Procurement context resets when the plan ID changes. Today context resets when the snapshot ID changes; selecting another outlook day within the same snapshot preserves displayed messages and captures the new date for the next question. No global AI tab, history folders or action execution is required.

Opening/closing the drawer needs no backend call. Send current context when the user actually asks. The current `onSendAIMessage` callbacks carry UI context/fixture data; the integration adapter should send identifiers and typed selection, not the entire React state, rendered UI, raw dataset or client-computed answer.

### X01 — Ask for an explanation

**PROPOSED · `POST /stores/{store_id}/ai/explain` · asynchronous proposal, subject to BE's existing explain mechanism.** Header: idempotency key. Example:

```json
{
  "client_message_id": "client_msg_001",
  "locale": "vi",
  "context": {
    "scope": "procurement_plan",
    "resource_id": "plan_001",
    "resource_version": "plan_v1",
    "tab": "strategies",
    "entity": null,
    "selected_strategy": "protected",
    "scenario_id": null,
    "scenario_draft": null
  },
  "question": "Vì sao chọn An toàn?",
  "question_key": "strategy-why"
}
```

`question_key` is optional suggestion routing, not an instruction to bypass the user's question. `client_message_id` is for correlation/deduplication. Proposed `202` response:

```json
{
  "data": {
    "explanation_id": "explain_001",
    "client_message_id": "client_msg_001",
    "job_id": "job_explain_001",
    "job_status": "queued"
  },
  "meta": {
    "poll_after_ms": 2000
  },
  "error": null
}
```

| Context | Required source identity / selection | Typical UI evidence focus |
|---|---|---|
| Procurement overview | `scope=procurement_plan`, plan ID/version, `tab=overview` | cost, plan, service |
| Procurement ingredient | Same plan, `tab=ingredients`, `entity={type:ingredient,id:...}` | recommendation, forecast, supplier |
| Comparison | Same plan, `tab=strategies`, selected strategy | strategies / cost trade-off |
| Scenario | Same plan/version, `tab=scenarios`, scenario ID if run; typed draft if not run | scenario-controls / scenario-results |
| Kho ingredient | `scope=inventory`, ingredient resource ID, snapshot/version, ingredient entity, `view=lots` or `view=movements` | inventory-total / inventory-lots / inventory-movements |
| Menu product | `scope=menu`, product resource ID, menu data version, product entity/current recipe ID where known | product-facts / recipe |
| Hôm nay | `scope=today`, today snapshot resource ID, `as_of_date` and nullable `selected_date` | today-attention / today-decision / today-outlook |

**Proposed context field rules.** This is a discriminated DTO: send the fields applicable to the declared scope, not every field from every screen. BE resolves facts and checks store ownership; the client supplies identity and current selection only.

| Field | Rule |
|---|---|
| `scope` | `procurement_plan`, `inventory`, `menu` or `today`. |
| `resource_id` | Plan ID for procurement; ingredient ID for selected Kho detail; product ID for Menu detail; snapshot ID from D01 for Today. IDs are obtained from real responses. |
| `resource_version` | Plan version, inventory snapshot ID or Menu data version where available. May be null when BE has no supported version identity; the freshness/fallback policy is TBD WITH BE. Today's snapshot ID already identifies its viewed result, so this may be null. |
| `entity` | `{type, id}` for a selected ingredient/product; null for procurement overview or Today. BE validates that it belongs to the resource/store. |
| Procurement selection | `tab` is `overview`, `ingredients`, `strategies` or `scenarios`. `selected_strategy` is the card being inspected when applicable; it does not replace the plan's applied strategy. |
| Scenario selection | `scenario_id` references a completed scenario being viewed, or `scenario_draft` contains unrun S01 business inputs. Use null for the other; do not present stale results as the edited draft's outcome. The draft omits transport-only `baseline_plan_version`, because the parent context already carries the plan version. |
| Kho selection | `view` is `lots` or `movements`. `resource_version` identifies the viewed inventory snapshot if supported. |
| Menu selection | Optional `recipe_id` is the current recipe from P02, or null when unknown; no recipe history or client-supplied recipe facts are required. |
| Today selection | `as_of_date` is D01's dashboard `date`; `selected_date` is a day actually present in D01's outlook, or null when none is selected/available. Do not substitute the latest import date. |

Today question example, completing the live `snapshotId` / `asOfDate` / `selectedDate` adapter:

```json
{
  "client_message_id": "client_msg_today_001",
  "locale": "vi",
  "context": {
    "scope": "today",
    "resource_id": "today_20261008_v1",
    "resource_version": null,
    "entity": null,
    "as_of_date": "2026-10-08",
    "selected_date": "2026-10-10"
  },
  "question": "Ngày 10/10 cần chú ý điều gì?",
  "question_key": "day"
}
```

Selected Kho detail context example for the same X01 request envelope:

```json
{
  "scope": "inventory",
  "resource_id": "orange",
  "resource_version": "stock_20261007_v1",
  "entity": { "type": "ingredient", "id": "orange" },
  "view": "lots"
}
```

Selected Menu detail context example:

```json
{
  "scope": "menu",
  "resource_id": "matcha-latte",
  "resource_version": "menu_v1",
  "entity": { "type": "product", "id": "matcha-latte" },
  "recipe_id": "recipe_matcha_current"
}
```

For example, an ingredient request includes `entity: {"type": "ingredient", "id": "condensed-milk"}`. Unrun scenario draft uses the business input shape in S01; it is hypothetical input, not a computed scenario. BE must distinguish “not run” from an actual result and never invent outcomes. Backend may resolve resource identities differently; this is a proposed context DTO, not proof those snapshot IDs are stored today.

BE retrieves authorized source facts by IDs. For budget questions, supplied evidence must include actual budget/cost and known comparison inputs; the UI's 71% example alone is not sufficient. For strategy comparisons, cite the two actual alternatives or admit missing metrics. Source freshness/version must be respected; a later UI selection changes future questions without rewriting an in-flight message's captured context.

UI: suggested questions → sending → answer / no response; keep the current report/item visible. Errors: `422 INVALID_AI_CONTEXT`, `404 CONTEXT_RESOURCE_NOT_FOUND`, `409 CONTEXT_NOT_READY`, `412 CONTEXT_VERSION_CONFLICT`, `429 RATE_LIMITED`; job errors: `AI_EXPLANATION_FAILED`. The AI is read-only: this endpoint must not create POs, mutate mappings or perform financial actions.

### X02 — Explanation result

**PROPOSED · `GET /ai/explanations/{explanation_id}` · synchronous result read; not global chat history.** No body.

```json
{
  "data": {
    "explanation_id": "explain_001",
    "client_message_id": "client_msg_001",
    "status": "completed",
    "context": {
      "scope": "procurement_plan",
      "resource_id": "plan_001",
      "resource_version": "plan_v1",
      "tab": "strategies",
      "selected_strategy": "protected"
    },
    "answer": {
      "title": "Phương án An toàn trong kế hoạch này:",
      "bullets": [
        "9 nguyên liệu cần nhập",
        "Một số mặt hàng có thời gian giao 2–4 ngày",
        "Mức đáp ứng dự kiến là 98,8%"
      ]
    },
    "evidence": [
      {
        "evidence_id": "e_plan",
        "type": "procurement_plan",
        "resource_id": "plan_001",
        "entity_id": null,
        "ui_target": {
          "workspace": "procurement",
          "tab": "overview",
          "section": "plan"
        }
      },
      {
        "evidence_id": "e_service",
        "type": "service_metric",
        "resource_id": "plan_001",
        "entity_id": null,
        "ui_target": {
          "workspace": "procurement",
          "tab": "overview",
          "section": "service"
        }
      }
    ],
    "suggested_questions": [
      {
        "key": "strategy-balanced",
        "text": "Nếu chọn Cân bằng thì sao?"
      },
      {
        "key": "strategy-difference",
        "text": "Chi phí chênh lệch bao nhiêu?"
      }
    ]
  },
  "meta": {},
  "error": null
}
```

This payload is an illustrative response shape, not an existing LLM output. FE presents title + short bullets + evidence chips; it may use its own current-context suggestions if none are returned. Machine metadata/enums remain stable; answer/follow-up text may be localized Vietnamese.

Evidence must identify a real authorized source. `ui_target` is a typed navigation/highlight hint, not an arbitrary URL, HTML or CSS selector. FE owns an allowlisted target registry and localized chip labels. Existing targets include procurement `plan`, `cost`, `service`, `forecast`, `supplier`, `ingredient-reasons`, `strategies`, `scenario-controls`, `scenario-results`; inventory `inventory-total`, `inventory-lots`, `inventory-movements`; Menu `product-facts`, `recipe`; Today `today-attention`, `today-decision`, `today-outlook`. For Today outlook evidence, `ui_target.date` may carry the exact outlook day to focus; the current frontend supports this date-specific evidence target. FE validates it against the viewed snapshot. Missing/out-of-scope references remain noninteractive and must not navigate to guessed data.

Conversation display stays in FE for MVP. Server-side multi-turn memory, retention and a conversation ID are **TBD WITH BE**. The current callbacks do not send prior turns; do not promise conversational memory just because multiple messages are displayed. If BE already accepts bounded prior messages or an ephemeral context ID, document that adapter; do not add account-wide history APIs. A response with insufficient evidence may still return a concise honest answer with no invented metrics/evidence. A failed explanation job uses the Section 16 error; it is not a completed answer with made-up bullets. Errors: `404 EXPLANATION_NOT_FOUND`, `409 EXPLANATION_NOT_READY` when a result is requested too early.

## 15. Store Context

The reviewed authenticated screens do not contain a store selector or a finished Cửa hàng screen. Their fixtures also do not establish a real active store. `store_001` in this document is an example identifier, not a hard-coded production default.

Proposed flow: A03 resolves the session/default store → T01 confirms accessible stores if needed → T02 loads selected store metadata → all subsequent store-scoped requests use that authorized store. If there is no store, FE needs an agreed onboarding/blocked-entry destination; this document does not invent one. Choosing/persisting an active store and what Cửa hàng should edit are **TBD WITH BE/product**.

### T01 — Accessible stores

**PROPOSED · `GET /stores?limit=50` · synchronous paginated read.** No body; optional cursor.

```json
{
  "data": {
    "items": [
      {
        "store_id": "store_001",
        "name": "Example Café",
        "timezone": "Asia/Ho_Chi_Minh",
        "currency": "VND"
      }
    ],
    "default_store_id": "store_001"
  },
  "meta": {
    "pagination": {
      "limit": 50,
      "next_cursor": null,
      "total_count": 1
    }
  },
  "error": null
}
```

Return only accessible stores. `[]` and `default_store_id: null` are valid no-store states, not automatic store creation. FE must not assume the first paginated item is the user's default. Errors: auth errors in Section 2; `422 INVALID_CURSOR`. No role editor or membership management is required.

### T02 — Store metadata

**PROPOSED · `GET /stores/{store_id}` · synchronous read.** No body.

```json
{
  "data": {
    "store_id": "store_001",
    "name": "Example Café",
    "timezone": "Asia/Ho_Chi_Minh",
    "currency": "VND"
  },
  "meta": {},
  "error": null
}
```

This is the minimum context for dates/currency and scope. Planning defaults live in C01; do not presume every store setting is editable through this read. Errors: `404 STORE_NOT_FOUND`, `403 STORE_ACCESS_DENIED`. An active-store switch must invalidate/partition import, stock, menu, plan and AI caches; never display another store's response after a switch. The actual store selection/settings UI remains TBD.

## 16. Error Contract

**PROPOSED shared model.** Keep request errors separate from domain job failures and nonblocking warnings.

Request error example (`409`):

```json
{
  "data": null,
  "meta": {
    "request_id": "req_071"
  },
  "error": {
    "code": "INSUFFICIENT_HISTORICAL_DATA",
    "message": "More usable history is required.",
    "details": {
      "history_days": 42,
      "required_history_days": 140
    },
    "field_errors": [],
    "retryable": false
  }
}
```

Field/row error example (`422`):

```json
{
  "data": null,
  "meta": {
    "request_id": "req_072"
  },
  "error": {
    "code": "DATA_VALIDATION_FAILED",
    "message": "Some source values are invalid.",
    "details": {
      "error_count": 1,
      "truncated": false
    },
    "field_errors": [
      {
        "code": "INVALID_DATE_VALUE",
        "path": "files/file_sales/sheets/sheet_orders/columns/column_date",
        "file_id": "file_sales",
        "sheet_id": "sheet_orders",
        "source_column_id": "column_date",
        "row_number": 17,
        "details": {
          "expected_format": "YYYY-MM-DD"
        }
      }
    ],
    "retryable": false
  }
}
```

The same error object goes into a failed job's `error`; its HTTP status resource read still returns `200`. `message` is a safe human-readable fallback, not raw stack traces/backend codes as the main Vietnamese UI. FE maps `code`/`field_errors` to concise labels and optional relevant controls. Diagnostic sampling/truncation and whether row numbers are 1-based worksheet rows (including headers) must be agreed; do not leak whole datasets in errors.

| Condition / code family | Proposed HTTP behavior | FE behavior |
|---|---|---|
| `INVALID_CREDENTIALS`, `UNAUTHENTICATED`, `SESSION_EXPIRED` | 401 | Credential notice or login/session recovery |
| `STORE_ACCESS_DENIED` | 403 | Stop protected action; do not switch to a guessed store |
| `*_NOT_FOUND` | 404 | Resource missing; preserve current source context where possible |
| `FILE_TOO_LARGE` | 413 | File-scoped message; retain other staged files |
| `INVALID_FILE_TYPE` | 415 request-level; item error in mixed upload | Reject unsupported format explicitly |
| `EMPTY_FILE`, `CORRUPT_FILE`, `EMPTY_SHEET` | 422 when known synchronously; failed analysis job otherwise | Identify the affected file/sheet |
| `INVALID_DATA_DATE`, `DATA_DATE_REQUIRED`, `INVALID_EMAIL`, `PASSWORD_POLICY_VIOLATION` | 422 | Field-level validation |
| `INVALID_MAPPING_TARGET` | 422 | Retain selection, refresh valid canonical options |
| `DUPLICATE_MAPPING` | 409 | Explain target already used in the relevant context |
| `MAPPING_REVISION_CONFLICT`, `BASELINE_VERSION_CONFLICT`, `CONTEXT_VERSION_CONFLICT` | 412 | Re-read authoritative state; do not silently overwrite |
| `UNRESOLVED_REQUIRED_FIELDS`, `SCHEMA_BLOCKED` | 409 | Keep mapping/review context; Continue remains blocked |
| `ANALYSIS_NOT_READY`, `PLAN_NOT_READY`, `FORECAST_NOT_READY`, `IMPORT_NOT_COMPLETED`, `SCENARIO_NOT_READY`, `EXPLANATION_NOT_READY` | 409 | Pending/blocked state, not a fabricated empty result |
| `INVALID_PLANNING_CONFIGURATION`, `INVALID_CUTOFF_DATE`, `INVALID_SCENARIO_CONFIGURATION`, `UNSUPPORTED_*_OPTION` | 422 | Explain specific invalid/unsupported input |
| `INSUFFICIENT_HISTORICAL_DATA` | 409, or job failure if discovered after acceptance | Readiness progress; offer import more data |
| `BUDGET_INFEASIBLE` | 422 if rejected immediately; otherwise a failed plan/scenario job | Explain inability to produce a feasible result; keep inputs |
| `IMPORT_PROCESSING_FAILED`, `NORMALIZATION_FAILED`, `PLAN_GENERATION_FAILED`, `SCENARIO_FAILED`, `AI_EXPLANATION_FAILED` | Failed async job; synchronous 5xx only for an actual service failure | Show failed operation, not success/zero metrics |
| `IMPORT_STATE_CONFLICT`, `NO_UPLOADED_FILES`, `DRAFT_PO_ALREADY_CREATED` | 409 | Prevent incompatible/repeated action |
| `IDEMPOTENCY_KEY_REUSED` | 409 | Do not retry a different payload with the same key |
| `INVALID_CURSOR`, `INVALID_FILTER`, `INVALID_MONTH`, `INVALID_DATE`, `INVALID_AI_CONTEXT` | 422 | Correct request/query; preserve screen context |
| `RATE_LIMITED` | 429 + agreed retry hint | Temporarily disable/reschedule, do not create duplicate jobs |
| `CAPABILITY_UNAVAILABLE` | 503 for agreed temporary capability outage | Honest unavailable state; do not simulate success |

These are proposed error codes, not a claim BE currently emits them. Known legacy codes such as a BE's training-data error can be adapted after verification instead of renaming the engine. Error code spelling/casing and standard validation response compatibility must be negotiated once, not separately per screen. Unsupported permanent capability should generally be declared in context before a click; do not misuse 503 for every permanently unsupported feature.

## 17. Async Job Contract

**PROPOSED coordination pattern; existing BE run-resource compatibility is TBD WITH BE.** Long operations must not require an open synchronous request to be treated as finished. A `202` acceptance response identifies the job and, where already allocated, its import/plan/scenario/explanation resource ID. The FE follows one status/state pattern for file discovery + LLM mapping, import processing, forecasting inside planning, plan generation, scenarios and AI explanation.

### J01 — Job status

**PROPOSED · `GET /jobs/{job_id}` · synchronous polling read.** No body.

Running example:

```json
{
  "data": {
    "job_id": "job_process_248",
    "operation": "import_process",
    "status": "running",
    "stage": "validating",
    "progress": null,
    "created_at": "2026-10-08T01:44:00+07:00",
    "started_at": "2026-10-08T01:44:02+07:00",
    "completed_at": null,
    "context": {
      "store_id": "store_001",
      "import_id": "imp_0248"
    },
    "result": null,
    "error": null
  },
  "meta": {
    "poll_after_ms": 2000
  },
  "error": null
}
```

Completed example:

```json
{
  "data": {
    "job_id": "job_process_248",
    "operation": "import_process",
    "status": "completed",
    "stage": "completed",
    "progress": 1,
    "created_at": "2026-10-08T01:44:00+07:00",
    "started_at": "2026-10-08T01:44:02+07:00",
    "completed_at": "2026-10-08T01:46:00+07:00",
    "context": {
      "store_id": "store_001",
      "import_id": "imp_0248"
    },
    "result": {
      "resource_type": "import_completion",
      "resource_id": "imp_0248"
    },
    "error": null
  },
  "meta": {},
  "error": null
}
```

Failed example:

```json
{
  "data": {
    "job_id": "job_process_248",
    "operation": "import_process",
    "status": "failed",
    "stage": "validating",
    "progress": null,
    "created_at": "2026-10-08T01:44:00+07:00",
    "started_at": "2026-10-08T01:44:02+07:00",
    "completed_at": "2026-10-08T01:45:00+07:00",
    "context": {
      "store_id": "store_001",
      "import_id": "imp_0248"
    },
    "result": null,
    "error": {
      "code": "DATA_VALIDATION_FAILED",
      "message": "Source values require correction.",
      "details": {
        "import_id": "imp_0248"
      },
      "field_errors": [],
      "retryable": false
    }
  },
  "meta": {},
  "error": null
}
```

On a successfully fetched job resource, the envelope's top-level `error` is null. A failed operation instead has `data.status=failed`, `data.error` populated and `data.result=null`. `queued`/`running` have no terminal result/error; `completed` has an agreed result reference and no operation error. Fetch that reference before displaying the destination's actual content; job completion alone is not a substitute for a completion/report payload.

The result discriminator uses this proposed routing table; no server-supplied arbitrary URL is needed:

| Operation | `result.resource_type` | `result.resource_id` | Owning context / result read |
|---|---|---|---|
| `file_analysis` | `mapping_summary` | Import ID | `context.import_id` → M01 |
| `import_process` | `import_completion` | Import ID | `context.import_id` → I06 |
| `procurement_generate`, `procurement_regenerate` | `procurement_plan` | New plan ID | `context.plan_id` → C03 |
| `scenario_run` | `procurement_scenario` | Scenario ID | `context.plan_id` is the baseline, `context.scenario_id` is the result → S02 |
| `ai_explain` | `ai_explanation` | Explanation ID | Store/context ownership → X02 |
| `draft_po_create`, if agreed | `procurement_plan` | Source plan ID | `context.plan_id` → agreed C03 draft action state |

Errors for J01: `404 JOB_NOT_FOUND`, plus inherited authorization/transport errors. A missing or expired job does not prove the underlying operation failed or never ran; reconcile through its owning resource. Job retention/expiry responses remain TBD WITH BE.

| Job concept | Contract |
|---|---|
| States | `queued`, `running`, `completed`, `failed`; only completed/failed terminate polling. No cancel endpoint is required in this iteration. |
| Operations | Proposed `file_analysis`, `import_process`, `procurement_generate`, `procurement_regenerate`, `scenario_run`, `ai_explain`, `draft_po_create`; unsupported operations remain unavailable. |
| Progress | `[0,1]` only if meaningful; otherwise null. Do not manufacture percentages for uncertain-duration LLM work. |
| Stages | Stable business-workflow codes, e.g. `discovering_sheets`, `mapping_columns`, `validating`, `normalizing`, `persisting`, `forecasting`, `planning`, `explaining`. FE localizes; no optimizer/model names are required. |
| Timestamps | `created_at` is known when accepted; `started_at` is null until work starts; `completed_at` is null until a terminal completed/failed state. Keep the same keys on every status response. |
| Results | Typed resource reference: mapping summary → M01; import completion → I06; procurement plan → C03; scenario → S02; AI explanation → X02; draft PO result → agreed C03 action state. |
| Authorization | A job inherits the owning resource's store/access constraints. Knowing a job ID alone is insufficient. |
| Failure | Failed job remains readable with a domain error and its owning IDs. Retrying a polling GET never restarts work. |

Proposed FE polling: honor `poll_after_ms` (default 2 seconds), back off transient transport errors, and stop at terminal status. Losing a connection or reaching a UI wait timeout does not prove the job failed. Reconcile by GET before offering a new mutation. Duplicate POST retries use the original idempotency key; a deliberate new run uses a new key after the old job outcome is known.

Changing tabs, closing help/AI, collapsing the sidebar or returning from a drawer must not create another job or reset the underlying import/plan. Store/plan/input changes must invalidate stale response application using captured IDs/revisions; they need not delete server-side results. Refresh/reload recovery can use resource `active_job_id` and latest workflow status rather than an account-wide job listing. Job retention and cross-reload recovery are TBD.

### 17.1 Import lifecycle proposal

| Batch state | Meaning / next allowed action |
|---|---|
| `draft` | Batch exists; no accepted files yet; I02 allowed |
| `uploaded` | At least one accepted file; I03 allowed |
| `analyzing` | I03 job queued/running; no incompatible file-set mutation |
| `mapping_ready` | Analysis completed; M01–M04 available; I05 only when `can_process` |
| `processing` | Validation/commit job queued/running; mappings locked |
| `completed` | Commit succeeded without warnings; I06 available |
| `completed_with_warnings` | Commit succeeded with explicit nonblocking warnings; I06 available |
| `failed` | Analysis or processing failed; error phase/context retained; no false completion |

Proposed `imported_at` capture is the first successful upload acceptance in this batch; `created_at` remains draft creation and `completed_at` remains processing completion. This proposal must be checked against BE's existing timestamp semantics. Repeated file additions during one upload session still count as one batch, not multiple calendar imports.

### 17.2 Existing run-resource alternative

If BE already has domain-specific forecast/decision/import run IDs, **keep that architecture where practical**. Agree on an adapter with: operation/run ID, queued/running/completed/failed mapping, status-read route, terminal result ID, domain error and polling hint. FE can implement the same state machine without BE building a new generic job service. Exact existing routes/status names must be verified by BE; no current run endpoint is confirmed here. Do not implement a duplicate job subsystem purely to match the candidate `/jobs` name.

## 18. Endpoint Summary

All routes are relative to `/api/v1`. Endpoint IDs identify the definitions above. **PROPOSED does not mean implemented.** Candidate C09/C10 should be enabled only after their TBD contracts are resolved.

| ID | Method | Endpoint | Purpose | FE Screen | Execution | Status |
|---|---|---|---|---|---|---|
| A01 | POST | `/auth/login` | Authenticate + default-store context | Đăng nhập | sync | PROPOSED |
| A02 | POST | `/auth/register` | Create account | Đăng ký | sync | PROPOSED |
| A03 | GET | `/auth/me` | Session bootstrap | Protected app shell | sync | PROPOSED |
| A04 | POST | `/auth/logout` | End session | Auth lifecycle | sync | PROPOSED |
| I01 | POST | `/stores/{store_id}/imports` | Create dated batch | Nhập dữ liệu | sync | PROPOSED |
| I02 | POST | `/imports/{import_id}/files` | Accept CSV/XLSX bytes | Nhập dữ liệu | sync | PROPOSED |
| I03 | POST | `/imports/{import_id}/analyze` | Discover sheets + assisted mapping | Upload → mapping | async workflow | PROPOSED |
| I04 | GET | `/imports/{import_id}` | Batch metadata + file inspection | History / completion details | sync | PROPOSED |
| H01 | GET | `/stores/{store_id}/imports/calendar` | Monthly distinct-batch counts | Lịch sử nhập | sync | PROPOSED |
| H02 | GET | `/stores/{store_id}/imports` | Selected upload-date batch list | Lịch sử nhập | sync | PROPOSED |
| M01 | GET | `/imports/{import_id}/mapping-summary` | File/sheet navigator + global progress | Ghép cột | sync | PROPOSED |
| M02 | GET | `/imports/{import_id}/mappings` | Issues or read-only successful pairs | Ghép cột | sync | PROPOSED |
| M03 | GET | `/imports/{import_id}/sheets/{sheet_id}/field-options` | Available canonical targets | Mapping dropdown | sync | PROPOSED |
| M04 | PATCH | `/imports/{import_id}/mappings/{mapping_id}` | Confirm one chosen target | Mapping cards | sync | PROPOSED |
| I05 | POST | `/imports/{import_id}/process` | Validate/normalize/commit | Mapping → completion | async workflow | PROPOSED |
| I06 | GET | `/imports/{import_id}/completion` | Actual import impacts + readiness | Hoàn tất | sync | PROPOSED |
| R01 | GET | `/stores/{store_id}/readiness` | Refresh downstream readiness | Completion / entry guards | sync | PROPOSED |
| D01 | GET | `/stores/{store_id}/today` | Attention + pending plan + seven days | Hôm nay | sync | PROPOSED |
| V01 | GET | `/stores/{store_id}/inventory` | Summary and ingredient rows | Kho | sync | PROPOSED |
| V02 | GET | `/stores/{store_id}/inventory/{ingredient_id}` | Selected ingredient + first lots | Kho detail | sync | PROPOSED |
| V03 | GET | `/stores/{store_id}/inventory/{ingredient_id}/lots` | Additional ordered lot pages | Kho detail | sync | PROPOSED |
| V04 | GET | `/stores/{store_id}/inventory/{ingredient_id}/movements` | Recent signed movements | Kho / Biến động | sync | PROPOSED |
| P01 | GET | `/stores/{store_id}/products` | Summary and product rows | Menu | sync | PROPOSED |
| P02 | GET | `/stores/{store_id}/products/{product_id}` | Product + current recipe | Menu detail | sync | PROPOSED |
| C01 | GET | `/stores/{store_id}/planning-context` | Business defaults/readiness/options | Planning setup | sync | PROPOSED |
| C02 | POST | `/stores/{store_id}/procurement-plans` | Generate a plan | Planning setup | async workflow | PROPOSED |
| C03 | GET | `/procurement-plans/{plan_id}` | Bounded overview + applied config | Tổng quan | sync | PROPOSED |
| C04 | GET | `/procurement-plans/{plan_id}/ingredients` | Compact ingredient navigator | Nguyên liệu | sync | PROPOSED |
| C05 | GET | `/procurement-plans/{plan_id}/ingredients/{ingredient_id}` | Explain one recommendation | Nguyên liệu detail | sync | PROPOSED |
| C06 | GET | `/procurement-plans/{plan_id}/ingredients/{ingredient_id}/forecast-series` | Stored demand/inventory/inbound series | Ingredient chart | sync | PROPOSED |
| C07 | GET | `/procurement-plans/{plan_id}/strategies` | Available alternatives/trade-offs | Phương án | sync | PROPOSED |
| C08 | GET | `/procurement-plans/{plan_id}/explanation` | Optional saved full analysis | AI summary disclosure | sync | PROPOSED |
| C09 | POST | `/procurement-plans/{plan_id}/draft-purchase-orders` | Candidate draft creation only | Tổng quan CTA | async if agreed | TBD WITH BE |
| C10 | POST | `/procurement-plans/{plan_id}/regenerate` | Candidate rerun/new plan | Chạy lại | async if agreed | TBD WITH BE |
| S01 | POST | `/procurement-plans/{plan_id}/scenarios` | Run business-input scenario | Thử kịch bản | async workflow | PROPOSED |
| S02 | GET | `/procurement-plans/{plan_id}/scenarios/{scenario_id}` | Baseline/result comparison | Scenario result | sync | PROPOSED |
| X01 | POST | `/stores/{store_id}/ai/explain` | Contextual read-only explanation | AI drawer | async workflow | PROPOSED |
| X02 | GET | `/ai/explanations/{explanation_id}` | Fetch one explanation result | AI drawer | sync | PROPOSED |
| T01 | GET | `/stores` | Accessible store contexts | Session bootstrap | sync | PROPOSED |
| T02 | GET | `/stores/{store_id}` | Store name/timezone/currency | App scope | sync | PROPOSED |
| J01 | GET | `/jobs/{job_id}` | Common async status adapter | Long workflows | sync status read | PROPOSED |

There are **41 candidate endpoint definitions**: 39 PROPOSED and 2 TBD WITH BE; 0 verified existing endpoints. This is a surface to reconcile, not a demand to build 41 new services. BE can map multiple FE reads to existing resources and FE adapters while preserving the documented fields, lazy loading and state semantics.


## 19. FE Screen → API Dependency Matrix

### 19.1 Screen dependencies

| Screen | Initial Load | User Actions / lazy reads | Required Mutations |
|---|---|---|---|
| Đăng nhập | No protected data; optional session check A03 | Credentials, remember preference, visibility/mode toggles local | A01 |
| Đăng ký | No protected data | Confirmation/visibility local; recovery remains placeholder | A02 |
| Authenticated shell | A03, then T01/T02 as needed | Sidebar toggle local; routes resolve active store | A04 for lifecycle, no navigation mutation |
| Hôm nay | D01 | Select outlook day local; navigate to resource; AI X01/X02 | None for attention; AI question only |
| Nhập dữ liệu | Local staged state; active import I04 only for agreed resume | Picker/drop/date/help/history, upload metadata | I01, I02, I03 |
| Lịch sử nhập | H01 + H02 for selected date | Month/filter changes refresh matching reads; batch expansion I04 | None |
| Ghép cột | M01, M02 for selected sheet, M03 | Switch sheet/status; expand successful pairs/details M02; help local | M04 on Confirm; I05 on Continue |
| Hoàn tất | I06, optionally fresh R01 | Inspect batch I04; resource navigation | None |
| Kho | V01 | Select ingredient V02; extra lots V03; Biến động V04; AI optional | None for inventory; AI question only |
| Menu | P01 | Select product P02; ingredient cross-link V01; AI optional | None for product/recipe; AI question only |
| Kế hoạch nhập — setup | C01 / readiness | All form selections local; advanced expansion local | C02 |
| Tổng quan results | C03 after generation or plan lookup | Open ingredient C04/C05; compare C07; full saved analysis C08 | C09/C10 only after BE agreement |
| Nguyên liệu results | C04 + C05 for selected item | C06 for chart; switch/filter lazily; current stock V02 | None |
| Phương án results | C07 | Compare selected card locally; expand rejected reasons | None; selecting a card does not apply it |
| Thử kịch bản | Baseline C03 + local scenario controls | Read S02 after job; changed controls invalidate result | S01 |
| Contextual AI drawer | Local current context/suggestions; existing FE messages | Read X02 after job; evidence routes/focus to existing resources | X01 per actual question |
| Cửa hàng | No completed settings UI; minimum T02 if needed | Store selection/edit behavior TBD | None specified |
| HDSD / File mẫu | Help content local; File mẫu placeholder | Open/close/scroll local, preserve workflow | No API required for current placeholder |

All asynchronous mutations above use J01 or the agreed domain-run adapter. Initial loads do not create jobs. No `/sales-data` API is specified because its destination screen is not designed; completion's visible “Xem dữ liệu” link needs FE/BE scope agreement.

### 19.2 Navigation is a frontend adapter boundary

Server destinations/evidence should carry typed workspace/resource/selection IDs. FE resolves browser routes and highlights. The reviewed components expose `onNavigate` callbacks or `shelfcash:navigate`/focus events; they are not a connected production router. Successful UI event emission does not prove any API mutation or cross-screen navigation completed.

| Existing intent / browser route | Required resolution | API dependency / integration note |
|---|---|---|
| `/today` | Active store → current day dashboard | D01; timezone from T02 |
| `/data-import` | Enter upload; preserve current draft when returning | I04 only if resuming; fresh local state otherwise |
| `/data-import/history` | Selected month/date/batch context | H01/H02/I04; completion inspection can focus the batch's upload date |
| `/data-import/mapping` | Resolve a real `import_id` and ready analysis | M01/M02/M03; do not open unrelated fixture mappings |
| `/data-import/completion` | Resolve committed `import_id` | I06; never enter on failed/pending processing |
| `/inventory?ingredient=orange` | Load current stock and focus Cam | V01/V02; if row is outside page/filter, fetch detail directly rather than assuming missing |
| `/inventory?source=menu&product=matcha-latte&ingredients=...` | Recipe ingredient IDs → scoped inventory subset | V01 repeated `ingredient_id` filter; **current Kho source only consumes singular `ingredient`, so a router adapter is still required** |
| `/menu?product=matcha-latte` | Load/focus a real product | P01/P02; product selection is independent of list page/filter |
| `/forecast` | Agree whether this opens setup, current results or a future forecast workspace | Resolve R01/C01/C03 as agreed; no separate forecast screen is currently designed |
| `/forecast/planning` | Setup for active store | C01 |
| `/forecast/planning/results?tab=ingredients&ingredient=condensed-milk` | Resolve a plan ID then select the plan's ingredient | C03/C04/C05/C06; **current component reads ingredient query but relies on props for general tab selection** |
| `/forecast/planning/results?date=2026-10-10` | Resolve plan + intended day focus | **Current results component does not consume this date parameter**; agree a day-focus adapter/destination, not a new full dashboard modal |
| `/sales-data` | Completion sales inspection destination | **TBD WITH BE/product**; no destination data screen/API invented here |
| `/store` | Store workspace | **TBD WITH BE/product**; metadata T02 does not imply editable settings |

For Dashboard shortage alerts, include the actual plan/forecast context ID; do not silently select a different plan just because the current route omits `plan_id`. For a plan's “Xem tồn kho”, preserve ingredient identity but open current Kho truth, not plan-generated stock. Missing/deleted/stale entities produce a known not-found/refresh state rather than selecting the first row.

### 19.3 Cache/refetch dependencies

- Successful I05: invalidate inventory, products/recipes, readiness, import history and Today; preserve the returned batch completion impact separately from current resource totals.
- Successful M04: refresh authoritative progress and target availability in the affected context; no canonical stock/menu changes occur yet.
- Successful C02/C10: read new C03 and refresh Today/readiness; do not replace an older plan's AI context with a new ID until navigation is intentional.
- Successful S01: update only the requested scenario/comparison; baseline remains unchanged.
- Successful C09, if supported: refresh the current plan's draft state and any affected open-order/readiness aggregation according to BE's agreed semantics.
- X01 explanations are read-only; clicking evidence may fetch/focus an existing resource but must not trigger procurement or stock mutations.

## 20. Open Questions for Backend

These questions are acceptance gates for v0, not assumptions. Resolve P0 items before FE live integration. BE should annotate endpoint IDs with existing route/schema equivalents, concrete changes and any unavailable capability.

| Priority | Topic / question | Why FE needs the decision |
|---|---|---|
| P0 | Which of A01–J01 already exist? Supply current OpenAPI or code and identify adapters/renames, rather than marking proposals implemented from memory. | Establish a verified surface and avoid duplicate endpoints/services. |
| P0 | Cookie or bearer auth? Login/register next action, session renewal/logout/CSRF/CORS behavior, remember-me policy and server password requirements? | Auth fields/loading/expiry and safe protected bootstrap. No verification/recovery workflow is assumed. |
| P0 | How is active/default store resolved? What if the user has none or multiple? Is Cửa hàng a settings page or something else? | All resource scopes, timezone, route guards and cache keys. |
| P0 | Should batch creation/upload happen on the first processing click or on file selection? Is the selected business date required, and can it change after upload? | Current date field is optional in the prototype; avoid uploading against an undefined/mutable date. |
| P0 | What does `data_date` mean for historical multi-date files and inventory snapshots? What exact event sets `imported_at`? | Preserve row-level history and maintain calendar-versus-business-date distinction. |
| P0 | Who parses sheets/headers? CSV virtual sheet naming, duplicate column names, blank sheets, mixed-schema workbooks, size/file limits and retry/dedup rules? | Stable file/sheet/column IDs and manageable analysis states. FE currently does not parse data. |
| P0 | Where is the canonical catalog/version? Which fields/schemas are required? How do UI `batch_id` and resource `batch_code` map? Are supplier/purchase data schemas supported beyond the three current mapping catalogs? | Valid dropdown targets, schema blockers and history categories without inventing schema capabilities. |
| P0 | What produces mapping confidence and the auto-accept threshold? Is score calibrated? Does target uniqueness apply per sheet, schema context or batch? Any legitimate repeated targets/one-to-many mappings? | Correct exception queue, disabled options, concurrency validation and human review. Current UI supports one source → one target. |
| P0 | How are absent required canonical fields and optional unresolved columns handled? Does every optional issue block processing, and where are blockers displayed? | `complete` is not necessarily `can_process`; no silent omission or fake green progress. |
| P0 | Is import validation/commit synchronous or async? Is it atomic? What are partial success, warning, duplicate/upsert/no-op and inventory lot identity semantics? | Honest completion/error states and affected-entity versus changed-record counts. No rollback UI is specified. |
| P0 | Generic jobs or existing domain run resources? Concrete status/error names, durable result IDs, polling hints and idempotency/retention/reload recovery? | One FE async state machine; do not force a new BE job subsystem. |
| P0 | What exactly makes forecast/planning ready: usable date coverage, recipe completeness, model trained/current, inventory cutoff constraints? Is 140 configurable? Forecast separate from plan generation? | Reliable completion CTA and planning entry guards, not raw error codes or fixed thresholds. |
| P0 | How does BE interpret `lean`/`balanced`/`protected`? Is manual priority applied directly? What justifies a recommended badge? Are three alternatives already generated/stored? | Inspection must not silently change applied strategy; unavailable metrics/rankings stay unknown. |
| P0 | Which open POs count in planning, how are expected deliveries represented, and are the current advanced modes/counts actually supported? | The current controls cannot silently invoke unavailable engine paths or ignore pending orders. |
| P0 | Define cost/budget ratio, service-rate denominator, shortage-risk meaning and nullability. What happens with zero/no-limit budget or infeasible input? | Comparable KPIs/what-if tables without mixing fractions, percents or unavailable estimates. |
| P0 | Inventory physical versus usable quantity: include expired/quarantined stock? Positive-lot counts, nearest expiry, status precedence/thresholds and snapshot freshness? | Kho owns factual truth; near-expiry and low-stock counters must reconcile with Today. |
| P0 | Are product states `paused` or `inactive`? Price/yield nullability, recipe ingredient count semantics, units/aliases and current recipe/effective date identity? | Menu matches current source and does not display invented prices/yields/counts. |
| P1 | Which stored forecast/inventory/inbound series exists per plan ingredient? Point-in-day semantics, lower/upper interval meaning and missing-day policy? | Replace screenshot charts with real data without inventing statistical claims. |
| P1 | Can what-if change demand, supplier delay, budget and priority today? Does null budget mean no cap? Does it return baseline + scenario and optional changed recommendations? | Scenario submission/comparison semantics; prototype example is not simulation capability. |
| P1 | Does Draft PO creation exist? Supplier grouping/missing data, duplicate behavior, approval separation and effect on pending decisions? | Enable C09 only when drafts can genuinely be created; no purchase transaction from chat. |
| P1 | What should “Chạy lại” do: same snapshot/configuration or refreshed inputs? New plan ID or reuse? Is C02 enough? | Resolve C10 without overwriting an existing report/conversation. |
| P1 | What supplies Today alert ranking, stale-data policy, demand-pressure levels, risk counts and incoming delivery counts? Can attention exceed the designed bounded list? | Attention is concise, deduplicated and navigable, not an unverified alert engine. |
| P1 | Which LLM/explanation endpoint/evidence format exists? Sync or async? Can BE resolve the proposed inventory/Menu/Today IDs and date-scoped evidence, and what is the freshness policy if snapshots are not retained? Bounded prior turns versus ephemeral conversation ID, and retention? | Reuse the contextual drawer without claiming persisted AI memory or global history. |
| P1 | How should FE resolve `/forecast`, Today selected-day details, recipe → stock subset and completion `/sales-data`? | Current routes contain known adapter gaps; no missing destination is silently implemented here. |
| P1 | Should in-progress imports appear in history, and how are file category/status filters applied to mixed-schema workbooks and failed files? | Calendar counts, day panel and expanded batch files stay consistent. |
| P1 | After an analysis/process failure, can the same import be retried with its mappings preserved, or must the user start a new batch? Which state transitions are permitted? | Recovery must not duplicate committed records or lose a completed mapping review. No retry/reset endpoint is assumed. |

### Agreement checklist for the handoff

1. BE marks each endpoint ID with its existing equivalent or agreed proposal, including unsupported capabilities.
2. FE/BE approve shared date/money/unit/null/error/async conventions and the mapping concurrency boundary.
3. Resolve P0 questions and decide explicitly which TBD actions remain disabled/placeholders.
4. Provide at least one real response fixture per integration path: upload + analysis, partial mapping, successful/failed import, not-ready store, inventory/product detail, generated plan, unavailable alternative, scenario and contextual evidence.
5. FE builds adapters/router bindings against the approved surface; this document alone is not evidence that services are deployed.

**Acceptance goal:** BE can confirm an implementable endpoint/payload/state mapping or identify a specific unresolved item without inferring requirements from screenshots.
