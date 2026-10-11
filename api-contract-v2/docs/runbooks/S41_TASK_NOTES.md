# S4.1 — Auth/session and assisted provisioning

## Frozen plan before edits — 2026-10-10

Authorization: explicit S4.1 task, canonical SHELFCASH_API_CONTRACT_V1_VI and
AUTHORIZATION_CONTRACT_VI current v1 (not superseded FE0). Read S364 notes,
PLANNING_RUN and ADR-022: internal trusted identity is not HTTP authorization.
Branch feat/from_forecast_to_decision_run, HEAD
a4b68378f35fea6f71b549e24393cf4bbb35aba5. Extensive existing S3/doc WIP and
archives are preserved; baseline status, hashes and OpenAPI in runtime/s41.

Scope: A01/A03/A04/T01/T02/N7 only; typed envelopes, opaque digest-only sessions,
Argon2id credentials, verified assisted operator commands/audit, current Store
membership and canonical permissions-v2. Additive auth tables; retain S1 reserved
permissions=[] and store Staff grants separately. No backfill, invitation/grant
HTTP editor, worker, planning HTTP, business engine change or next slice.

Acceptance: real HTTP shape/status/cookies/Origin/CSRF, uniform failed login,
rate limits, idle/absolute expiry, logout/reset revocation, single-use completion
race, zero/multiple Stores, revoked membership/grants, scoped Owner/Staff and
resource spoofing; PostgreSQL fresh-session atomic provisioning/credentials/
sessions/audit, rollback, migration/metadata parity and old identity regressions.
Test DB must parse to exact local shelfcash_test before fixtures. Never development.
OpenAPI comparison must keep health and add only authorized six business routes.

Coverage: new auth unit/HTTP/PostgreSQL tests plus affected identity/schema,
bootstrap/verification, application persistence and health boundaries. No solver
or ML benchmark. Broaden only with evidence of wider regression risk.

Affected BE/FE: six public routes and deployment auth/CORS/operator/delivery config.
ML/Data and S1/S2/S3 writers unchanged. No development migration or onboarding seed.
Rollback: reverse only new auth files/registration/config/router/docs and this
slice's schema expectations using baseline hashes, never checkout/reset WIP.
Test-only downgrade destroys new auth history; not a production data rollback.

## Technical choices and drift

No product contract change. Keep requested S4 order; preview/import/supplier
completeness and recipe/config/forecast integration dependencies are recorded in
ROADMAP. Old S4 Explanation/S5/S6 future order becomes explicitly historical.
Old handoff/auth inventories marked historical; canonical behavior is untouched.

Separate grants preserve S1 reserved JSON. Add authorization_revision default1 to
StoreMembership (not ownership/grant backfill); PostgreSQL membership/grant triggers
avoid ABA versions and serialize revoke against held membership fences. User
deactivation trigger revokes sessions, not runs. Concrete AuthRepository holds SQL;
application owns transaction/commit. Resource reads without action/Owner-only deny.
Proof stores verified email/time/reference; changed email invalidates token/session
until verified again. Operator is deployment-configured audit identity, not Store role.

Argon2id via pinned argon2-cffi25.1.0,64MiB/t3/p4, per official primary documentation
https://argon2-cffi.readthedocs.io/en/stable/howto.html. No custom password composition.
Rate windows stored in PG:5 failed logins/account+IP/15min; technical IP ceilings
100 login attempts and20 credential attempts/15min. Cookies production secure;
explicit dev cookie requires both loopback Host and peer, not spoofed Host alone.
OpenAPI public login/N7 do not require a session; logout allows absent session.
Secret DTO repr/errors redact inputs; API error handler logs only exception class.
Programming/uncertain commit errors fail closed, never reconcile to success.

## Verification commands actually run

All pytest commands use `.venv/Scripts/python.exe -u -m pytest`, followed by
`2>&1 | Tee-Object runtime/s41/<log>; exit $LASTEXITCODE`. Logs are local ignored
artifacts, not credential dumps. All groups overlap; counts are not summed as full
regression. No skips used to weaken acceptance.

Environment: first guarded test connection timed out because Docker daemon was
stopped. Started Docker Desktop hidden and `docker compose up -d postgres` (no
volume removal). Parsed Settings.test_database_url, required exact shelfcash_test,
local host/no query overrides/environment=test/validate_reset_target; connected
only that DB and asserted current_database(), server17.11. Existing fixture admin
postgres catalogue check is the supported test DB mechanism, not development DB.
Guard PASS before reset/migration fixtures. Migration0010 applied to test only.

1. `tests/unit/test_auth_contracts.py tests/integration/test_auth_public.py -q
   --tb=short -x` —19 passed/1 failed9.83s, auth_initial.log. Fixture used nonexistent
   Product.sales_unit; corrected to actual selling_unit. Production code unchanged.
2. `tests/integration/test_auth_public.py -k 'store_isolation or setup_reset or
   concurrent_completion or delivery_failure or transaction_failure' -q --tb=short`
   —6 passed/1 failed/8 deselected7.04s, auth_affected.log. Commit fault checked dirty
   AuthAccount after autoflush cleared it; changed injection to pending completion
   audit, still requiring real flush before rollback. No assertion weakened.
3. `tests/integration/test_auth_public.py -k 'transaction_failure or store_isolation
   or setup_reset or concurrent_completion' tests/unit/test_application_contracts.py
   tests/unit/test_auth_contracts.py -q --tb=short` —6 passed/58 deselected5.71s,
   auth_refactor.log. Global -k also deselected unit files: this is NOT their gate.
4. `tests/unit/test_auth_contracts.py tests/integration/test_auth_public.py
   tests/api/test_health.py tests/api/test_auth_openapi.py
   tests/unit/test_application_contracts.py tests/unit/test_database_config.py
   tests/unit/test_smoke.py -q --tb=short` —81 passed16.12s, auth_gate.log.
5. `tests/integration/test_identity_store_schema.py
   tests/integration/test_database_bootstrap.py tests/integration/test_verification_commands.py
   tests/integration/test_catalog_recipe_schema.py tests/integration/test_data_semantics_correction.py
   tests/integration/test_supplier_operational_constraints.py
   tests/integration/test_forecast_decision_persistence.py -q --tb=short`
   —223 passed/1 failed149.87s, schema_gate.log. Updated table list was unsorted
   while assertion sorts inspector output; sorted expected explicit list, retaining
   exact names and Alembic metadata parity assertions.
6. `tests/integration/test_identity_store_schema.py::test_schema_exact_tables_constraints_indexes_and_metadata
   tests/integration/test_auth_public.py -k 'schema_exact or store_inactive or
   http_programming or credential_expiry or authorization_fence or setup_reset or
   login_me_store' -q --tb=short` —7 passed/13 deselected7.42s, hardening_gate.log.
7. `tests/integration/test_application_paths.py tests/integration/test_operational_paths.py
   tests/integration/test_forecast_execution_s1_regression.py tests/integration/test_planning_run.py
   -k 'not actual_capture_pipeline and not concurrent_claim and not process and not
   fresh_read and not corruption' tests/unit/test_repository_contract.py
   tests/unit/test_repository_guards.py -q --tb=short` —133 passed/14 deselected115.12s,
   caller_gate.log. Target internal persistence/ownership/lifecycle, no solver benchmark.
8. `tests/unit/test_auth_contracts.py tests/integration/test_auth_public.py
   tests/api/test_auth_openapi.py tests/api/test_health.py
   tests/integration/test_identity_store_schema.py tests/integration/test_database_bootstrap.py
   tests/unit/test_application_contracts.py tests/unit/test_repository_contract.py
   tests/unit/test_database_config.py -q --tb=short` —112 passed46.30s, auth_final.log.
   Includes final additive revision/email-proof schema and actual PG fence/ABA/rates.
9. `tests/unit/test_auth_contracts.py tests/api/test_auth_openapi.py tests/api/test_health.py
   tests/integration/test_auth_public.py -k 'not concurrent_completion and not grants_aba
   and not identity_proof and not ip_and_completion and not grant_revoke and not credential_expiry
   and not transaction_failure and not authorization_fence and not store_inactive
   and not setup_reset and not delivery_failure' -q --tb=short`
   —24 passed/13 deselected11.24s, transport_final.log. Target origin/loopback and repr.
10. `tests/unit/test_auth_cleanup.py
    tests/integration/test_auth_public.py::test_explicit_dev_cookie_requires_loopback_peer_and_has_separate_name
    -q --tb=short` —3 passed1.66s, cleanup_dev.log. Synthetic cleanup fault injection;
    dev cookie HTTP still uses real PG, loopback peer supplied by explicit ASGI test wrapper.
11. `tests/api/test_auth_openapi.py tests/api/test_health.py tests/unit/test_auth_contracts.py
    tests/integration/test_auth_public.py` + same filter/flags as9 —25 passed/13
    deselected11.61s, openapi_final.log, after required envelope fields/public session
    security corrections. Earlier Pydantic repr warning removed by DTO repr filter;
    final rerun has only existing Starlette/anyio deprecation warning.

12. `tests/integration/test_auth_public.py::test_setup_reset_reissue_expiry_and_single_use_http
    tests/integration/test_auth_public.py::test_grant_revoke_waits_for_authorization_fence_and_next_request_denies
    tests/unit/test_application_contracts.py tests/unit/test_repository_contract.py
    -q --tb=short` —42 passed2.96s, final_boundary.log; final N7 envelope and fence/
    application/repository checks. Annotation-only changes do not change runtime.

Additional light commands: `-m pip install argon2-cffi==25.1.0` succeeded;
`-m pip check` no broken requirements; `-m scripts.provision_auth --help` exit0;
`-m pytest tests/unit/test_auth_contracts.py tests/unit/test_auth_cleanup.py
tests/api/test_auth_openapi.py tests/integration/test_auth_public.py --collect-only -q`
38 cases collected (not an execution result). Python OpenAPI before/after check:
health operation identical, exactly6 authorized added paths,0 removed; snapshots
and check result in runtime/s41. `git diff --check` passed, CRLF informational warnings.

## Evidence and limits

Fresh PG Sessions assert committed digest-only sessions, revoked logout/reset/
deactivation, Argon2id credential+revision+consumed token+audit, atomic Owner/Store
provision and reference retry. Two real PG completions yield one success; concurrent
provision same reference yields one receipt/User. Grant ABA increments stored revision;
PG pg_stat_activity verifies revoke waiting on authority lock, then next read denies.
Expiry test waits until credential operation reaches the blocked user lock, advances
clock to deadline, and asserts no credential/token consumption persisted. Pre-commit
injected programming errors rollback whole aggregates; post-durable login bug returns
503/no cookie while fresh Session sees durable state. Not transport-loss simulation.
HTTP tests verify uniform failures, CORS allowlist/Origin/CSRF, cookies/no-store,
nulls/pagination/zero+multiple Stores, revoked membership and foreign resource404,
Staff missing action/Owner-only403, spoofed payload422, real persistent throttles.

Verification breadth justified by new auth persistence/shared app composition:
schema/head/metadata+S1 state/writers+selected S2/S3 persistence are covered. Business
engines/arithmetic are unchanged; full suite/solver/ML benchmark not needed and not run.
No browser FE integration, real SMTP credentials/delivery, production proxy/HTTPS
deployment, penetration/security certification or latency/capacity SLA tested.
SMTP delivery used a controlled synthetic adapter in PG tests; production adapter
requires configured verified channel. No auto purge of auth/audit/limiter records;
maintenance/retention beyond stated audit intent remains technical debt/OPEN.
Commit uncertainty never fabricates success; an unreturned session/consumed token
can be durable and retries must follow documented login/new issuance behavior.
S4.2 editor/invitation/audit HTTP and all later product workflows remain unimplemented.

Final preservation/document checks:410 pre-edit files hashed, only allowlisted
S4.1 paths changed;18 existing archives unchanged;78 local document links resolve.
HEAD remains a4b68378f35fea6f71b549e24393cf4bbb35aba5. New files are untracked;
existing changes remain unstaged. No unrelated WIP rollback/staging, commit/push,
deployment, development migration/reset, new ZIP or S4.2 implementation.
