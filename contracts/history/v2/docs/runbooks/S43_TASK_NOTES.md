# S4.3 — public Menu/recipe and inventory reads

## Frozen plan before implementation — 2026-10-10

Authority: explicit S4.3 attachment, AGENTS ordered documents, accepted ADR007/
009/010, canonical handoff v1, Catalog P01/P02 and Inventory V01–V04, current
AUTH permissions/session and S41/S42 source/evidence. FE0/historical absence notes
are not current authority. Branch feat/from_forecast_to_decision_run, HEAD
a4b68378f35fea6f71b549e24393cf4bbb35aba5.443-file baseline/status/OpenAPI retained
in ignored runtime/s43, including18 archives. Preserve all existing WIP.

Scope: six authorized GET routes, typed projection/query/envelopes, exact quantities,
whole-response permissions/count availability, Store-local dated recipe, explicit
unknown stock completeness/threshold/provenance and structured warnings; no writes,
solver, forecast, readiness, import, threshold editor, timeline or S4.4.

TECHNICAL CHOICE: additive Store read revision counters with transactional triggers
for relevant insert/update/delete (including direct current internal writers). This
avoids whole-Store content materialization for optimistic versions and detects
delete/insert/ABA changes missed by timestamps. Separate menu/recipe/stock counters
prevent forbidden recipe changes leaking into menu-only P01 version. Metadata-only
initialization for existing Stores; no business completeness/threshold backfill.
Consistent read uses owned READ ONLY REPEATABLE READ before first statement; auth
bookkeeping separate short Sessions, current authorization rechecked before return.
Detached typed values, no connection held across pages; signed keyset cursor scoped
actor/Store/date/permissions/filters/order. SQL-bounded pages and aggregate queries.

No threshold/declaration/audit-actor source exists: UNKNOWN/null/unconfigured opaque
version, never invented0/CONFIRMED/source actor. Old references preserved, origin
UNKNOWN until a writer with verifiable provenance is authorized. Physical balances
are not reconstructed from recent movement pages. Exact base labels/yield/loss.

Acceptance planned: pure formatting/search/status edge cases; real PG HTTP auth/
cross-Store/current revoke; summary vs filtered totals; Vietnamese search/ties,
inclusive Store-date recipes/gap/empty; unknown/expiry/future/zero stock and cost
masking; signed movement/provenance; keyset source-change/date/filter/actor checks;
concurrent operational change inside capture must not mix facts; fresh-session
invariants and GET no domain writes; malformed/overflow fail closed; query count on
paged fixture. OpenAPI preserve14 auth operations, add exactly6; affected schema/
catalog/recipe/inventory/auth regressions. Only guarded local shelfcash_test.

Rollback: only new S43 modules/migration/registration/composition/docs and necessary
schema/head expectations, against baseline. No checkout/reset/staging, existing ZIP
changes or development DB access. Migration downgrade only exercised on test data;
no deletion of real retained state authorized. BE projection/FE reads affected;
ML/Data/engines/demo/writers business semantics unchanged. No next slice.

## Implementation and verification — 2026-10-10

CURRENT FACT: six GET transports, typed public_reads DTOs/use cases, scoped SQL
projection repository, owned read-only snapshot adapter, pure numeric/lot rules
and additive migration0012 are implemented. Feature/manual/source map:
[PUBLIC_MENU_INVENTORY_READS](../features/PUBLIC_MENU_INVENTORY_READS.md).
No public mutations, completeness/threshold storage, import/planning or next slice.

Before fixtures: parsed Settings.test_database_url, asserted database exactly
shelfcash_test, host localhost/127.0.0.1 and no URL query overrides; built test-only
Settings, validate_reset_target, then SELECT current_database() and SHOW
server_version. Confirmed local shelfcash_test, PostgreSQL17.11. No credentials
printed. Existing conftest owns only this disposable DB and runs guarded reset +
Alembic head before/after each test. No development connection/migration/reset.

Commands below use `.venv/Scripts/python.exe`; counts overlap and are **targeted**,
not a full suite total. No solver/ML benchmarks or full pytest were run. Schema
revision triggers touch operational tables, so verification includes their existing
writers/transaction regressions plus auth/identity/schema and HTTP/OpenAPI. This
coverage justified a broader targeted gate, not a full-suite rerun.

1. `-m pytest tests/unit/test_public_read_rules.py tests/api/test_public_reads_openapi.py tests/integration/test_public_reads.py -q --maxfail=2`
   — 2 failed/8 passed. PowerShell-to-Python stdin replaced Vietnamese fixture
   literals by `?`; use Unicode escapes in generated fixture/test strings. This
   was test construction, not runtime search logic.
2. `-m pytest tests/unit/test_public_read_rules.py tests/integration/test_public_reads.py -q --maxfail=3`
   — 2 failed/15 passed. Fixture used nonexistent permission_key instead of
   MembershipGrant.permission; wrong-unit corruption was rejected by real FK.
   Fixed grant field and deliberately dropped that FK only inside guarded disposable
   test fixture to exercise read-boundary503. Normal FK/writer regressions remain.
3. `-m pytest tests/integration/test_public_reads.py -q -k 'permission or malformed' --tb=short`
   — 2 passed/7 deselected.
4. `-m pytest tests/integration/test_public_reads.py -q -k 'missing_required or stock_and_first or overlap or cross_store or rollback or menu_only or query_count' --tb=short`
   — 8 passed/8 deselected.
5. `-m pytest tests/api/test_health.py tests/api/test_auth_openapi.py tests/api/test_staff_openapi.py tests/api/test_public_reads_openapi.py tests/unit/test_operational_contracts.py tests/integration/test_identity_store_schema.py tests/integration/test_catalog_recipe_schema.py tests/integration/test_operational_paths.py tests/integration/test_database_bootstrap.py tests/integration/test_verification_commands.py tests/integration/test_auth_public.py tests/integration/test_staff_public.py -q --tb=short --maxfail=3`
   — first attempt174 passed/3 setup-teardown errors: operator mistakenly started
   another PostgreSQL pytest process while this group still ran; shared test schema
   resets collided. Stopped the overlapping process; its incomplete output is not
   PASS evidence. No implementation/test semantics changed to mask setup errors.
   Repeated the same command **sequentially** —245 passed/1 failed (195.21s).
   Failure S4.2 test_owner_only_cross_store_filters_and_headers reused a revoked
   Owner browser session after logging in as another account; expected404 got401.
6. `-m pytest tests/integration/test_staff_public.py::test_owner_only_cross_store_filters_and_headers -q --tb=short`
   —1 failed, reproducing fixture failure independently. HTTP login legitimately
   revokes previous browser session. Changed only this related test: fresh-session
   assert old Owner token revoked, then obtain fresh Owner login before cross-Store
   assertion. Kept404/403 expectations; no auth or S4.2 product logic modified.
7. `-m pytest tests/integration/test_staff_public.py::test_owner_only_cross_store_filters_and_headers tests/unit/test_public_read_rules.py tests/api/test_public_reads_openapi.py tests/integration/test_public_reads.py -q --tb=short --maxfail=2`
   —28 passed (22.63s), includes corrected regression and test-only migration
   downgrade/re-upgrade with committed business facts preserved.
8. `-m pytest tests/unit/test_application_contracts.py tests/unit/test_repository_contract.py tests/unit/test_auth_cleanup.py -q --tb=short`
   —42 passed (0.65s); application/repository/cleanup boundary coverage.
9. `-m pytest tests/integration/test_public_reads.py -q -k 'authority_rechecked or unauthenticated' --tb=short`
   —2 passed/17 deselected. Revoke cost permission on a separate connection during
   capture returns409/no data; next fresh request cost forbidden. No session401
   uses read error meta{}; invalid naive internal clock fails closed503.
10. `-m pytest tests/integration/test_supplier_operational_constraints.py tests/integration/test_data_semantics_correction.py tests/integration/test_forecast_decision_persistence.py -q --tb=short --maxfail=2`
    —147 passed (108.25s). Updated head/table assertions only; canonical constraints,
    migration reversibility, persisted S1/S2 run and recipe/operational behavior kept.

Routine follow-up: V02 stock aggregation now scopes SQL to selected Ingredient
(no full-Store aggregate needed for detail); GET body rejects on first streamed
nonempty chunk instead of reading arbitrary body size. Normalized observed_at to
aware UTC and rejected naive clock. Final affected transport/detail checks below.

11. `-m pytest tests/integration/test_public_reads.py tests/unit/test_public_read_rules.py tests/api/test_public_reads_openapi.py tests/api/test_health.py -q --tb=short`
    —31 passed (23.67s). Covers affected six-route transport, detail-scoped SQL,
    exact read rules and preserved health. No full-suite claim.
12. Final cursor review found client-held session token alone was insufficient as
    signing secret. Changed **only S4.3** to private owned process key + session-bound
    MAC, using existing crypto token generator, no new dependency/public field/schema.
    Added real HTTP case rejecting signature computed by client from own session
    token. Restart refresh behavior422 cursor/409 explicit snapshot documented.
    `-m pytest tests/integration/test_public_reads.py tests/api/test_public_reads_openapi.py -q --tb=short`
    —21 passed (23.42s):20 PostgreSQL/HTTP plus1 OpenAPI. Prior S4.1/S4.2 cursor
    signing remains unchanged; not a claim of hardening the whole auth surface.
13. `-m pytest tests/api/test_public_reads_openapi.py -q --tb=short`
    —1 passed (0.69s) after declaring existing Cache-Control/X-Request-ID headers
    in six-route OpenAPI responses. Earlier exact-text edit script aborted before
    writing when formatted source did not match; direct patch applied successfully.
    No HTTP behavior or previous operations changed.
14. `-m pytest tests/integration/test_public_reads.py::test_query_count_bounded_not_per_product -q -s --tb=short`
    —1 passed (1.93s). PowerShell output filtered with
    `2>&1 | Select-String -Pattern 'P01|passed|failed|error'; exit $LASTEXITCODE`.
    Actual **20 SELECTs at limit5 and20 at limit50**, including current auth checks,
    with203 synthetic Products. No per-row recipe queries or full Store materialization.
15. Extended existing fixture/assertions for inactive Ingredient retained, SKU
    search, equal-expiry batch/null key paging; no extra count-only tests.
    `-m pytest tests/integration/test_public_reads.py -q -k 'inventory_quantities or filters_missing' --tb=short`
    —2 passed/18 deselected (3.14s). Only affected cases rerun after fixture expansion.

Completion: **30 new S4.3 cases verified across the groups** (20 real PostgreSQL/
HTTP,9 pure unit,1 OpenAPI), not a summed group count. Related gate245 passes plus
the separately corrected/reverified Staff fixture;147 further schema regressions;
42 application/repository/cleanup checks. These overlap with other commands and
must not be added into a unique full-regression count. One upstream Starlette/AnyIO
deprecation warning in HTTP groups; no dependency upgrade in this slice. Black used
only from ignored runtime/s43/formattools, no manifest/lockfile changes.

## Evidence and limits

Fresh Session fixtures commit actual Products/Ingredients/dated recipes/lines/
lots/signed movements before HTTP. Read assertions include exact long Decimal,
price null vs0, paused, gap/empty/overlap, unit corruption fail503, expiry day/+7/+8,
zero/no-lot UNKNOWN, missing tracked expiry/future date, nullable/zero/private cost,
movements with equal timestamps/UUID ordering and unknown actor/origin.

Real separate-connection mutations inside capture prove PostgreSQL READ ONLY
REPEATABLE READ, old coherent summary/lot page, later request new versions; exposed
snapshot Sessions have no active transaction after return. Revision no-domain-write
assertions and fresh-session movement counts stay unchanged after GET. Insert/delete
and ABA invalidate; rollback does not. Menu-only version/updated_at do not expose
recipe changes; current revoke/cross-Store/cursor tamper/filter binding verified.

Paging fixture203 Products at limits5/50 checks equal SELECT count20/20, bounded SQL
LIMIT and correct filtered count. This is a query-shape/N+1 observation, not scale,
latency/production SLA. SQL aggregates still scan source scope; counters may serialize
writes in a Store. Revision maintenance outside normal writers (TRUNCATE/disabled
triggers/restore) requires invalidation before serving.

OpenAPI script compared runtime/s43/openapi_before.json to fresh create_app schema:
all prior paths/operations and existing component DTO schemas identical, exactly
6 new GET IDs P01/P02/V01–V04; saved ignored openapi_after.json. `git diff --check`
passed (existing LF/CRLF notice only). Baseline SHA256 checks preserve18 ZIPs, .env,
AGENTS and unrelated engines/writers/WIP. Final allowlist check found only17 existing
files changed within declared S4.3 documentation/composition/schema assertions and
the related Staff fixture correction; every other baseline hash unchanged.

Not browser/FE acceptance, live credentials/delivery, production load/security
certification or full regression. Completeness/threshold/provenance unavailable
sources remain explicit UNKNOWN, no fabricated facts. No development DB, commit,
stage/push/deploy/ZIP, next slice or accepted ADR/public contract change.
