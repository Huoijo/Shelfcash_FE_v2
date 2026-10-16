# API contract

## CURRENT FACT — S4.11 consumer synchronization

No new public route or architectural decision. H01/H02 now emit explicit
`meta.warnings: Notice[]` per existing Import common-success contract; the S4.10
omission was runtime drift found by real FE integration. History uses normalized
`in_progress`, and Notice does not invent mandatory details. Whole history reads
retry only PostgreSQL40001, at most five attempts with0.75s total backoff,
fresh current authorization/snapshot each time; exhausted errors remain503.
Current examples are in features/examples/s411; old S410 traces are historical.
Six authoritative VI contracts and exact runtime OpenAPI are synchronized in
integration handoff v2. Baseline32 ->54 operations,22 additions,6 changed old
definitions (I01-I05/M04),0 removed; response components also affect consumers.
See compatibility changelog and S411 notes for actual verification and limits.

## CURRENT FACT / ACCEPTED DECISION — S4.10 public retained surfaces

Exact accepted PLAN15–16 and IMP11/14.5 add C04/C05/C08/N9/N10/N11/H01/H02,
with existing J01 extended for planning_pdf_export. All use /api/v1, current
cookie/Store-sensitive authorization; N10 additionally requires CSRF/Origin and
canonical UUID idempotency key. C06 remains MERGED; no C07 computation surface.
Paths, DTOs, filters/errors and validated actual synthetic examples are described
in [retained feature](features/RETAINED_PLANNING_HISTORY_PDF.md).

Accepted user clarification resolves PLAN16's conflicting result availability:
C04/C05 result_digest is required nullable only for terminal prepared computed
scope without retained result, with captured snapshot integrity verified.
Engine-dependent fields remain unavailable; result_digest stays valid/non-null
when a retained result exists. This does not expand read permissions or engine
policy. Both conditional-null examples are validated against DTO/OpenAPI.

N10 requires format, option_id (explicit null permitted), locale; N11 is private
application/pdf binary with verified size/SHA/attachment/no-store/nosniff headers.
J01 adds rendering stage/export context/discriminated result. H01/H02 use Store
timezone first-upload dates, same-file category+q and verified completion status.
OpenAPI46->54 operations,53core+health: eight additive operations/six paths,
no changed old operation. Only old shared JobView component expands; compatibility
details in [changelog](CONTRACT_COMPATIBILITY_CHANGELOG_VI.md). No FE-sync claim.

## HISTORICAL INFORMATION — S4.8 accepted contract implementation

Accepted PLAN14 N1 POST /stores/{store_id}/planning-requirements (201),
N2 GET and N3 PUT /stores/{store_id}/planning-requirements/{saved_requirement_id}
(200), N4 PUT /stores/{store_id}/planning-budget (201 create/200 replace);
accepted IMP14 R01 GET /stores/{store_id}/readiness and PLAN4 C01 GET
/stores/{store_id}/planning-context (200). All use /api/v1 and current cookie
authorization. No new contract decisions are introduced here; exact authoritative
PLAN/IMP/Auth definitions remain the authority.

New retained I06 readiness evaluates the post-write canonical snapshot in the
same transaction; previous completions retain their original assessment. New
actions support ready/blocked/unknown and keep NOT_ASSESSED. Offline OpenAPI diff
adds exactly these six operations/five paths; existing operations are unchanged,
with only the two shared completion readiness components expanded.
Wire/validation details and FE synchronization requirements are recorded in
[compatibility](CONTRACT_COMPATIBILITY_CHANGELOG_VI.md); examples and manual steps
in [feature](features/PLANNING_CONFIGURATION_READINESS.md).


## CURRENT FACT — S4.7 / audit remediation11/10/2026

N20 GET /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule;
N21 POST cùng path/changes, phase preview|commit synchronous200;
N22 GET cùng path/changes/{change_id}. Accepted CAT12 design, typed source/runtime,
current auth/Store scopes, retained preview/CAS/atomic audit/replay; no engine execution.
Accepted audit decisions: I05 reason conditional effective actions; Source Money18/18
khác exact Quantity, key1000; Staff sheet IGNORE own batch; N6 opening temporal
fence/receipt late event. No new design route, no H01/H02 implementation in S4.7.
[Contract](CATALOG_MENU_RECIPE_API_CONTRACT_VI.md#recipe-effectivity),
[feature](features/RECIPE_SCHEDULE.md), [compatibility](CONTRACT_COMPATIBILITY_CHANGELOG_VI.md),
[tests/limits](runbooks/S47_TASK_NOTES.md). Handoff baseline unchanged.

## HISTORICAL INFORMATION — S4.6 accepted surfaces, 11/10/2026

Import I01–I06/M*/J01 paths retained. All nine existing schemas now have atomic
canonical adapters; I04 configurations.state becomes committed from retained I06.
Additive Import DTO fields: fee_period_amendments, EntityRefs.fee_id,
EntityRef.path, nested references/provenance, movement_ids/canonical_version,
and actual inventory/configuration impacts. Supplier_changes.action_id is the
PreviewRow.row_id; exact complete confirmation set required for CHANGED/AMEND
terms/fees, independent of Owner mapping approval. No receipt Excel schema added.

Accepted N6: POST /api/v1/stores/{store_id}/inventory/receipts →201 first /200 replay,
Envelope<StockReceiptResult>; typed StockReceiptRequest, source identity + stock CAS,
current inventory.receive/read/ingredient.read and cost right for non-null unit cost.
Accepted N8: PUT /api/v1/stores/{store_id}/inventory/{ingredient_id}/threshold →200,
Envelope<ThresholdResult>; Owner-only, strong quoted If-Match, canonical UUID
Idempotency-Key, CSRF/Origin. Threshold nullable/zero/no-op and immutable audit.
V01–V04 remain read-only, project known receipt origins/actors, current thresholds
and unchanged-dependency inventory declarations; no parser/job/LLM/engine on GET.

[Authoritative Import](IMPORT_MAPPING_API_CONTRACT_VI.md#runtime-s46),
[Inventory](INVENTORY_API_CONTRACT_VI.md), [feature](features/IMPORT_INVENTORY_SUPPLIER.md),
[verification/limits](runbooks/S46_TASK_NOTES.md). No claim all v1 HTTP is ready.


## HISTORICAL INFORMATION — S4.5 public wire

I05 POST /api/v1/imports/{import_id}/process: phase preview202, confirm_review200
staging-only, commit202 ImportEnvelope<CommitAccepted>. Accepted existing design
I06 GET /api/v1/imports/{import_id}/completion →200 ImportEnvelope<ImportCompletion>;
J01 supports import_commit/import_completion; I04 exposes completion availability/
actor-dependent can_commit. Four schemas products/ingredients/sales/recipes only;
unsupported whole preview409 SCHEMA_BLOCKED. Current reason nonblank/confirm true,
resolutions exact scope, authority/CAS/idempotency retained. No new migration.
[Authoritative Import](IMPORT_MAPPING_API_CONTRACT_VI.md#runtime-s45),
[feature/DTO examples](features/IMPORT_CANONICAL_COMMIT.md),
[verified evidence](runbooks/S45_TASK_NOTES.md). OpenAPI diff offline: one existing
design path I06 added, one I05 operation changed, only Import DTO components changed.
S4.4 extension notes below are HISTORICAL INFORMATION, not current commit absence.

CURRENT FACT / accepted S4.4 batch mechanics: I04 adds required data.quota with
accepted_file_count,accepted_total_bytes,remaining_file_slots,remaining_bytes, whole
batch independent files page. No path changes; current grants/source-set/revision
fences retained. Ordered I02 partial admission, file evidence-set revisions and
I03 acceptance seal documented in [Import9.1a](IMPORT_MAPPING_API_CONTRACT_VI.md#import-batch-mechanics).
I02 all-rejected422 receipt differs from request-level validation422; existing
OpenAPI422 declaration favors UploadFailure, runtime general error still possible.
Verification: [task notes](runbooks/IMPORT_BATCH_MECHANICS_TASK_NOTES.md).

CURRENT FACT / explicit field-value extension: M04 shared_value variant, M03 scopes,
M01/I04 sheet declarations and preview provenance are additive; same routes/status.
Profile constants versus import-only declarations/rules follow approved freeze:
[Import contract](IMPORT_MAPPING_API_CONTRACT_VI.md),
[feature](features/IMPORT_FIELD_VALUE_BINDINGS.md). No canonical commit or migration.

CURRENT FACT / user-authorized Import extension: same31 paths and endpoint IDs.
M04 adds sheet_type/acknowledged ignore and permits reviewed proposal edits to reused
columns; M01/M02/M03/I04 additive classification/descriptors/confirmation projections.
I05 phase=confirm_review →200 typed ConfirmationResult with ETag; preview stays202,
commit stays409 unsupported. Existing sessions/current grants/CAS/key policies apply.
Canonical delta: [Import contract](IMPORT_MAPPING_API_CONTRACT_VI.md); runtime/evidence:
[feature](features/IMPORT_STAGING_PREVIEW.md),
[task notes](runbooks/IMPORT_CLASSIFICATION_TASK_NOTES.md). No non-Import wire change.

## CURRENT FACT — implemented API

CURRENT FACT S4.4: I01–I04/M01–M04/N5/I05 preview/J01 registered; user-approved
M04 source_context variant, no extra context route. Typed staging/preview only;
At S4.4 time commit unsupported; now S4.5 scope/runtime above supersedes this absence.
Canonical details IMPORT_MAPPING_API_CONTRACT_VI; runtime/evidence/limits
features/IMPORT_STAGING_PREVIEW and runbooks/S44_TASK_NOTES. Private cursor
correction preserves existing wire; preexisting20 operations/DTO preservation
checked separately from new Import operation inventory.

| ID | Method | Path below /api/v1 | Result |
| --- | --- | --- | --- |
| I01 | POST | /stores/{store_id}/imports | 201 draft |
| I02 | POST | /imports/{import_id}/files | 200 receipts / 422 UPLOAD_REJECTED |
| I03 | POST | /imports/{import_id}/analyze | 202 durable job |
| I04 | GET | /imports/{import_id} | 200 metadata/retained preview/configurations |
| M01 | GET | /imports/{import_id}/mapping-summary | 200 progress/profiles/context catalogue |
| M02 | GET | /imports/{import_id}/mappings | 200 paged issues |
| M03 | GET | /imports/{import_id}/sheets/{sheet_id}/field-options | 200 typed options |
| M04 | PATCH | /imports/{import_id}/mappings/{mapping_id} | 200 proposal/CAS |
| N5 | POST | /stores/{store_id}/mapping-profiles/{profile_id}/decisions | 200 Owner decision |
| I05 | POST | /imports/{import_id}/process | 202 preview / 200 confirm_review / 202 commit (four schemas) |
| I06 | GET | /imports/{import_id}/completion | 200 retained completion / 409 IMPORT_NOT_COMPLETED |
| J01 | GET | /jobs/{job_id} | 200 scoped completed/failed/pending outcome |

Mutations require session/Origin/CSRF/UUID key; CAS revision where canonical
contract requires it. Sensitive reads require current domain grants; approval
Owner-only.202 acceptance not computation; default worker disabled, see feature.

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| GET | `/health` | No body or query parameters required | HTTP 200, `application/json`, HealthResponse |
| POST | `/api/v1/auth/login` (A01) | LoginRequest, Origin | 200 Envelope[AuthContext], secure cookie |
| GET | `/api/v1/auth/me` (A03) | Session cookie | 200 Envelope[AuthContext] |
| POST | `/api/v1/auth/logout` (A04) | Origin; CSRF for valid session | 204, clear cookie, no body |
| POST | `/api/v1/auth/credentials/complete` (N7) | CredentialCompletion, Origin | 200 Envelope[CompletedCredential], no session |
| GET | `/api/v1/stores` (T01) | Session, limit/cursor | 200 Envelope[StoreList], pagination |
| GET | `/api/v1/stores/{store_id}` (T02) | Session, UUID Store | 200 Envelope[StoreContext], current membership |
| GET | `/api/v1/stores/{store_id}/memberships` (N12) | Owner, role/active/limit/cursor | 200 MembershipList envelope, catalogue/pagination |
| PUT | `/api/v1/stores/{store_id}/memberships/{membership_id}/permissions` (N13) | Owner, grants/reason, Origin/CSRF/If-Match/key | 200 PermissionUpdate envelope, ETag |
| GET | `/api/v1/stores/{store_id}/permission-events` (N14) | Owner, membership_id/limit/cursor | 200 PermissionEvents envelope |
| POST | `/api/v1/stores/{store_id}/staff-invitations` (N15) | Owner, email/grants/catalogue/reason, Origin/CSRF/key | 201 InvitationCreation envelope, queued delivery |
| GET | `/api/v1/stores/{store_id}/staff-invitations` (N16) | Owner, view/filters/limit/cursor | 200 InvitationList or InvitationEvents envelope |
| POST | `/api/v1/stores/{store_id}/staff-invitations/{invitation_id}/actions` (N17) | Owner, discriminated reissue/revoke, Origin/CSRF/If-Match/key | 200 InvitationAction envelope, ETag |
| GET | `/api/v1/staff-invitations/{invitation_id}` (N18) | Verified recipient session, X-Invitation-Token | 200 OfferRead envelope, ETag |
| POST | `/api/v1/staff-invitations/{invitation_id}/accept` (N19) | Verified recipient session, token/accept, Origin/CSRF/If-Match/key | 201 AcceptanceReceipt envelope; replay200 |


| GET | `/api/v1/stores/{store_id}/products` (P01) | menu.read; q/status/sort/limit/cursor | 200 CatalogEnvelope[Menu], Store-wide summary |
| GET | `/api/v1/stores/{store_id}/products/{product_id}` (P02) | menu.read + recipe.read + ingredient.read | 200 CatalogEnvelope[ProductDetail], Store-today recipe |
| GET | `/api/v1/stores/{store_id}/inventory` (V01) | inventory.read + ingredient.read; q/repeated IDs/status/sort/limit/cursor | 200 InventoryEnvelope[InventoryList] |
| GET | `/api/v1/stores/{store_id}/inventory/{ingredient_id}` (V02) | inventory.read + ingredient.read; snapshot_id/lot_limit | 200 InventoryEnvelope[InventoryDetail] |
| GET | `/api/v1/stores/{store_id}/inventory/{ingredient_id}/lots` (V03) | inventory.read + ingredient.read; snapshot_id/limit/cursor/sort | 200 InventoryEnvelope[Lots], permission-scoped cost |
| GET | `/api/v1/stores/{store_id}/inventory/{ingredient_id}/movements` (V04) | inventory.read + ingredient.read; snapshot_id/limit/cursor/sort | 200 InventoryEnvelope[Movements], signed exact delta |

CURRENT FACT S4.3: these six reads implement the handed-off Catalog/Inventory
contracts; no new product contract. Typed source: public_reads contracts/routes/
use cases/repository and additive migration0012. Snapshot/keyset, structured
warnings/errors, explicit UNKNOWN completeness/threshold/provenance and monetary
permission boundaries: [feature](features/PUBLIC_MENU_INVENTORY_READS.md),
[evidence](runbooks/S43_TASK_NOTES.md). Auth operations retain their prior wire
schemas. Planning, import, receipt and threshold mutations remain absent.

CURRENT FACT S4.1: these six business routes implement the current AUTH v1
contract, not FE0. Typed DTOs/OpenAPI: app/application/contracts/auth.py and
app/api/auth.py. Canonical behavior/errors/transport remain in
AUTHORIZATION_CONTRACT_VI#auth-v1; implementation/manual limits in
[AUTH_SESSION](features/AUTH_SESSION.md), verification in S41_TASK_NOTES.
JSON private responses data/meta/error with meta.request_id; no-store. No
registration or planning route is registered. S4.2 adds eight Staff operations on
seven new paths; canonical product behavior is AUTH v1 sections4/6, not a new
contract. Typed DTOs/use cases/routes: app/application/contracts/staff.py,
app/application/use_cases/staff.py, app/api/staff.py. Delivery is an explicit local
command, not an HTTP worker. See [Staff feature](features/STAFF_PERMISSIONS_INVITATIONS.md)
and S42_TASK_NOTES for runtime/errors/evidence/limits.

```json
{"status": "ok", "service": "shelfcash-backend"}
```

`HealthResponse` is the Pydantic public schema: required `status` is literal `ok`;
required `service` is a string from configured app name (default `shelfcash-backend`);
additional properties are forbidden. Health is liveness only, with no database,
storage, LLM or business readiness check. Health remains unauthenticated.

FastAPI also serves schema metadata at `GET /openapi.json` (framework HEAD supported).
This is not a business operation in the generated OpenAPI paths. `/docs`, `/redoc`
and OAuth documentation redirects are disabled. Only routes in the table above
are registered.

## ACCEPTED DECISION — public boundary policy

Use typed Pydantic request/response schemas. Do not freeze stable contracts using
arbitrary `dict[str, Any]`. Accept contract changes explicitly, test schema/behavior,
inspect OpenAPI diffs and then update this document. Do not silently change semantics.

## PROPOSED FUTURE SURFACE

The planning product contract and delegated design are documented in
[PROCUREMENT_API_CONTRACT_VI.md](PROCUREMENT_API_CONTRACT_VI.md) (2026-10-09).
C01/C02 and C03 polling/result are design-only; C07 read responsibility is folded
into C03 v1. No corresponding route or public OpenAPI schema is implemented. The
three user-approved policies (temporal assumptions, money permissions, indefinite
retention) do not authorize runtime changes in this documentation turn.
Other future slices may define store
operational truth, forecast runs, decisions, hypothetical comparisons, mapping and
authorized explanations only after acceptance criteria and permissions are frozen.
These capabilities are not present in the current API.
