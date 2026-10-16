# S4.2 — Staff permissions, invitations and audit

## Frozen plan before edits — 2026-10-10

Explicit S4.2 task and canonical AUTHORIZATION_CONTRACT_VI current v1 sections4/6
authorize N12–N19 only. Read ordered authorities, handoff v1, AUTH_SESSION, S41
notes/source/tests/migration and identity/Store. Branch feat/from_forecast_to_decision_run,
HEAD a4b68378f35fea6f71b549e24393cf4bbb35aba5. Extensive uncommitted S3/S4.1/doc WIP
and existing ZIPs are retained. Baseline status/hashes/OpenAPI in runtime/s42.

Plan: strict typed routes/envelopes and current S4.1 authorization; full Staff grant
replacement with CAS/receipts/permission events; versioned Store/email invitations,
verified-account review/acceptance, digest-only token identity, encrypted bounded-life
delivery intents and explicit local dispatcher/SMTP adapter. Additive migration;
no ownership/grants backfill, registration, Owner lifecycle, remove-member,
one-time bypass, S4.3, engine/arithmetic/run changes or second auth system.

Transaction plan: pre-read immutable scope/issuer, lock involved Users in UUID order
before S4.1 session resolution, then Store, memberships and invitation. Recheck
current session/proof/authority/token/version/expiry at write fence. Receipt lookup
after authorization before stale CAS; no locks during email. Delivery success
only after actual adapter return and confirmed persistence. Unknown commit/cleanup
never fabricated success. Acceptance writes membership/exact grants/transition/
audit/receipt atomically. Reissue invalidates old secret and requires renewed consent.

Acceptance: eight exact routes/status/headers/DTO/OpenAPI; Owner scope and Staff403/
foreign404; malformed/spoofed requests; CAS/[]/no-op/retry/current revoke;
invitation create/list/filter/cursor/read/reissue/revoke/expiry/pinned catalogue;
wrong/unverified account, token/version mismatch, existing membership rejection;
real PG accept races against accept/revoke/reissue and permission updates;
delivery failure/uncertainty/no secrets; fresh-session atomic persisted graphs,
S4.1/session/provision/schema regressions. Guard only local shelfcash_test before
fixtures/migrations. No development DB or solver/ML benchmark/full suite by default.

Affected FE: new Owner management and invitation recipient review/acceptance.
Operator: configured encrypted-intent key, invitation FE link and explicit dispatcher.
ML/Data/demo/business computations unaffected. Rollback only this slice's additions
and narrow composition/registration/schema expectations against baseline; no git
reset/checkout/staging. Downgrade loses new auth workflow history and is test-only,
not authorized on development or real retained data.

## Implementation and routine choices — CURRENT FACT

- N12–N19 public DTOs/routes use AUTH v1 sections4/6 unchanged. Composite prerequisites
  remain guidance; all grants explicit. Unknown keys are rejected, not made grants.
- Five additive tables in0011; no backfill, S4.1 triggers/revision reused. New assisted
  Store provisioning records its initial permission event atomically; old audit is
  retained without inventing historical permission events.
- Request receipts include canonical body/CAS digest; accept secret is hashed before
  fingerprinting. Current authorization precedes receipt/CAS; history does not
  reapply grants. No-op grants/revoke have no fake change event/version bump.
- Encrypted AES256-GCM intents use private32-byte key, random96-bit nonce and
  purpose/versioned AAD. New cryptography dependency is required for actual encrypted
  retention, not a new auth provider. HTTPS invitation fragment page is configured
  separately from credential page; existing TLS SMTP settings reused.
- Explicit controlled dispatcher claims with invitation→intent lock order, closes
  Session/connection before send, fresh-session finalization and bounded expiry
  ciphertext sweep. No broker/background worker. Unknown claimed/send/commit
  acknowledgment is not auto retried into a success; Owner reissue recovers it.
- Owner invitation attempts10/Store/10minutes; recipient30/account+IP/15minutes.
  Counters persist separately so validation/CAS rollback cannot erase rate limit.
  Key opaque nonblank≤128 UTF8bytes; strong ETag output; no weak/wildcard CAS.
- List cursors are HMAC-bound to actor/session/Store/filter/authorization/snapshot;
  count and page share fence. Current implementation materializes scoped list in
  memory; large-Store performance remains unmeasured.

## Commands and evidence — executed 2026-10-10, Asia/Saigon

All pytest commands below use `.venv/Scripts/python.exe -m pytest` from backend.
These are targeted groups, with overlap; they are **not** a full-suite result.

Before fixtures an inline Python guard parsed only Settings.test_database_url,
required postgresql+psycopg/localhost and exact `shelfcash_test`, rejected URL query,
called `validate_reset_target`, then SELECT current_database()/SHOW server_version.
PASS: local shelfcash_test, PostgreSQL17.11. No development connection. Fixtures
use existing guarded scripts.dev reset/migrate; final head0011,31 tables including
Alembic. Package install: `.venv/Scripts/python.exe -m pip install 'cryptography>=46,<47'`
PASS, installed46.0.7. No credentials printed or actual mail sent.

| Arguments after pytest | Actual result | Scope / fail→fix |
| --- | --- | --- |
| `tests/integration/test_staff_public.py::test_create_accept_atomic_exact_grants_audits_and_readonly_receipt -q --tb=short` | 1 failed | Concrete FK insert ordering: invitation must flush before intent; fixed within same transaction, no partial commit. |
| `tests/integration/test_staff_public.py -q --tb=short` | 18 passed,5 failed | Initial23 cases. Five failures were fixture session rotation: switching accounts through one browser intentionally revokes previous session in S4.1. Fixture now keeps independent authenticated Owner/Staff sessions; no weakening runtime guards. |
| `tests/integration/test_staff_public.py --lf -q --tb=short` | 5 passed,18 deselected | Reran only fixture failures; grants/[]/no-op/CAS/replay/expiry and retained receipt assertions passed. |
| `tests/unit/test_staff_contracts.py tests/api tests/unit/test_auth_contracts.py tests/unit/test_auth_cleanup.py tests/unit/test_application_contracts.py -q --tb=short` | 57 passed | New typed consent/grants/encryption; S4.1 DTO/cleanup; exact OpenAPI/health and all application AST boundary checks. |
| `tests/integration/test_staff_public.py -k 'lock_wait or commit_error or uncertainty or mutation_throttle or pinned_consent or delivery_failure' -q --tb=short` | 7 passed,1 failed,22 deselected | New lock-wait/failure/rate cases; overlong header mapped generic VALIDATION_ERROR. Fixed invitation-only validation mapping including actual header alias X-Invitation-Token to INVALID_TOKEN. |
| `tests/integration/test_auth_public.py tests/integration/test_identity_store_schema.py tests/integration/test_database_bootstrap.py tests/integration/test_verification_commands.py -q --tb=short` | 50 passed | S4.1 HTTP/provision/credential/session/revoke/fences; fresh PostgreSQL metadata/head/31tables, migrations down/up and guarded dev commands. |
| `tests/integration/test_staff_public.py::test_accept_pinned_consent_empty_grants_and_token_errors tests/api/test_staff_openapi.py tests/api/test_auth_openapi.py -q --tb=short` | 3 passed | Fixed512-byte token error contract, consent/payload rejection/empty grants and both OpenAPI groups. |
| `tests/integration/test_catalog_recipe_schema.py tests/integration/test_data_semantics_correction.py tests/integration/test_forecast_decision_persistence.py tests/integration/test_supplier_operational_constraints.py -q --tb=short` | 197 passed,1 failed | S1/S2 schema/lifecycle/recipe/operational invariants. One historical table-count assertion26 updated to31; no business rule changed. |
| `tests/integration/test_staff_public.py -k 'two_dispatchers or cross_store_invitation or grant_replace_audit' tests/integration/test_forecast_decision_persistence.py::test_fresh_migration_exact_tables_and_downgrade -q --tb=short` | 3 passed,31 deselected | New delivery/concealment/grant rollback cases; global -k also deselected schema node, so this command did **not** verify that fix. |
| `tests/integration/test_forecast_decision_persistence.py::test_fresh_migration_exact_tables_and_downgrade -q --tb=short` | 1 passed | Explicit rerun count/head/downgrade/reupgrade check after fix. |
| `tests/integration/test_staff_public.py -k 'dispatch or delivery' -q --tb=short` | 4 passed,30 deselected | Read-through found ORM cache hazard in intent discovery→lock: add populate_existing after lock wait. Added deterministic two-dispatcher stale pre-read barrier; only one send. Also delivery failure, unknown durable claim + expiry purge, reissue while send has no DB locks. |
| `tests/integration/test_staff_public.py::test_cross_store_invitation_and_wrong_account_offer_no_private_facts tests/unit/test_application_contracts.py::test_application_has_no_http_or_direct_queries tests/api -q --tb=short` | 6 passed | Expanded HTTP checks: Owner target422 and inactive Staff409 (no reactivation), recipient/Store concealment; application/OpenAPI/health after final changes. |
| Inline Python `pytest.main(['tests/integration/test_staff_public.py::test_dispatch_claim_refreshes_stale_preread_after_lock_wait','-q','--tb=line'])` with process-only old unrefreshed lock injected | Expected1 failure; outer guard exit0 | Negative control reproduced **two sends**. No source edit, mock SMTP callback + real PostgreSQL. Confirms test exposes actual cached pre-read race. |
| `tests/integration/test_staff_public.py::test_dispatch_claim_refreshes_stale_preread_after_lock_wait -q --tb=short` | 1 passed | Final positive rerun using actual locked refresh source, no injected old behavior. |

New S4.2 cases verified across these groups:34 PostgreSQL/HTTP +2 unit +1 OpenAPI.
Do not sum overlapped commands into unique regression counts. Affected delivery
group reran after final repository refresh fix. Broader verification rationale:
additive auth-only schema is covered by metadata/head, downgrade/reupgrade, all
affected schema expectations and S1/S2 persistence regressions plus S4.1 authority
and cleanup. Targeted coverage sufficient here; no full suite, solver/ML benchmark
or claim of overall security certification.

Inline OpenAPI comparison against runtime/s42/openapi_before.json: PASS; existing
health/six S4.1 path operations and all existing component DTO schemas unchanged;
exactly seven new paths/eight operations N12–N19. Saved openapi_after.json. AST parse
of9 new implementation/migration modules PASS; feature/task notes UTF8 PASS.

## What the PostgreSQL evidence proves

Fresh Sessions assert no member before consent; exact offered grants (including[])
after acceptance, issuer distinct from acceptor, accepted version/receipt/audits;
no historical replay restoration after grants withdrawal and inactive member403.
Grant CAS/revision/[]/no-op/retry committed state and count; audit write fault
rolls back grants/revision/receipt; acceptance audit fault leaves no ghost member.
Owner scope, Staff403/foreign404, wrong account/no private facts, unknown token/UUID
common404, unknown verification reference, old token/offer version, expiry, pending
duplicates/existing inactive membership and Owner target rejection are exercised.
Read-only expiry leaves DB pending. N16 filters/cursor signatures/snapshot drift and
invitation events are tested; immutable invitation audit UPDATE rejected by PG.

Concurrent accept/accept (different and same keys), accept/revoke/reissue and
grant/grant CAS run on independent real PostgreSQL connections: one transition or
one accepted receipt + replay, no duplicate member/stale grants. Controlled User
row-lock wait tests verify issuer membership revoke and expiry after wait before
commit. No SQLite or unit mocks stand in for persisted/concurrency evidence.

Delivery callback asserts pool.checkedout()==0. Two concurrent dispatcher claims
after cached pre-read still produce one send; in-flight reissue preserves new
queued revision and rejects old token. Adapter failures record not-confirmed/clear
ciphertext, never grant. Injected durable claim acknowledgment loss does not send,
does not auto replay uncertain send and expiry sweep clears encrypted secret.
Injected commit ValueError before/after durable DB commit + rollback/close OSError
preserve primary diagnostics, HTTP503/no secret echo; fresh state is respectively
none or complete invitation/intent/event/receipt, never fabricated successful HTTP.
Fault injection demonstrates application behavior, not real network partition.

## Limits / handoff

Real SMTP/inbox/browser FE, key rotation operations, load/performance and external
security audit unverified. Encrypted expiry cleanup requires running explicit
dispatcher; no autonomous scheduler. Claimed uncertain delivery needs Owner reissue;
not exactly-once email. Provider outcomes suppressed to sanitized exception classes.
Long-term audit retention and Owner/membership lifecycle remain outside this slice.
No full regression claim. Development DB never connected/migrated/reset; no commit,
stage, push, deploy or ZIP. Existing18 archives and unrelated WIP retained against
429-file baseline; final preservation/OpenAPI/doc checks recorded below.

Next roadmap slice S4.3 is PLANNED only, not started/authorized by this completion.

Completion: S4.2 COMPLETE within authorized scope, HTTP/PostgreSQL acceptance
verified. CLI smoke `.venv/Scripts/python.exe -m scripts.dispatch_invitations --help`
PASS (no database/send). OpenAPI/AST/UTF8 checks PASS; preservation comparison
against429 original files: no missing file, only documented S4.2 composition/docs/
schema expectation files changed;18 ZIPs and .env unchanged. No accepted ADR changed.

Final `git diff --check`: PASS (only existing LF/CRLF informational warnings).
Final inline baseline comparison:27 expected existing files changed, no missing
file, .env/AGENTS/18 ZIPs unchanged, no staged changes and HEAD unchanged.
UTF8/local Markdown link checks on Staff feature, task notes, CURRENT_STATE,
ROADMAP and API_CONTRACT: PASS. Baseline and final artifacts remain ignored under
runtime/s42; no review archive created.
