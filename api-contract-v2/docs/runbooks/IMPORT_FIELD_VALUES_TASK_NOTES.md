# Explicit field-value bindings — authorized S4.4 extension

## Before edit / scope and freeze (2026-10-10)

Read current authority/source and preceding classification/schema inventory notes.
Keep all typed rows/writers/engine rules. No DATA_REQUIREMENTS, new schemas,
canonical writes, S4.5/S4.6, commit/stage/push/ZIP/development DB access.
WIP/status/hash/OpenAPI baseline: ignored runtime/import_values. Accepted intent
ADR004/008/009/010/013 unchanged. Rollback only this extension's files/lines.

Frozen per-field allowlist (all other business fields remain SOURCE_COLUMN only;
refs already accept approved token identity/reservation, conversions remain existing):

| Schema | PROFILE_CONSTANT or IMPORT_VALUE | IMPORT_VALUE only | Not shared in slice |
| --- | --- | --- | --- |
| sales | unit | business_report_key | product_id, sales_date, quantity |
| inventory_count | unit | observed_at, reason | ingredient_id, lot_id, on_hand |
| recipes | unit, yield_unit, yield_quantity, process_loss_rate | version, effective_from, effective_to | product_id, ingredient_id, quantity |
| products | selling_unit, active | — | name, sku, price, source_business_key |
| ingredients | base_unit, active, expiry_tracking | — | name, sku, source_business_key |
| suppliers | active | — | name, source_supplier_key |
| supplier_terms | unit, currency, active | effective_from, effective_to, pack_size_base_quantity, pack_cost, minimum_order_packs, lead_time_days, shelf_life_days, maximum_order_base_quantity | source_term_key, supplier_id, ingredient_id |
| payable_fees | scope, mode, coverage, currency | effective_from, effective_to, source_fee_key, evidence_reference, reason | components, covered_source_term_keys, covered_source_supplier_keys |
| scope_declarations | — | source_declaration_key | declaration (all nested fields) |

Technical choice: stable scalar policies above permit both scopes; batch keys,
observations/reasons/dates/version/prices never PROFILE_CONSTANT. No identity scalar
injection or nested/executable values. These choices are delegated allowlist details,
not new business defaults or policies. Every source row still fully validates.

Additive freeze: typed versioned profile constants and import-value requirements in
ProfileSpec; typed sheet import declarations in staging JSON, not profile values.
M04 shared_value variant anchored to any sheet mapping issue; explicit column switch
requires matching source index + acknowledgment/evidence. First import-value source
rule needs N5; changing only a value under approved IMPORT_VALUE rule needs current
mapping.propose/review, not profile activation. Reused profile has constants and
requirements but no previous import values. No new tables/migration/endpoint.
M03 scopes/help and SheetInfo/I04 projections; per-row provenance identifies source,
index or declaration ID. Existing profile/preview/confirmation digests cover content.

Acceptance: user two-sales-row example/zero/date parsing; next import missing key
blocked then new key/confirmation; recipe explicit yield/loss/effectivity/null;
invalid/scalar/allowlist/conflicts/scope/type/revoke/CAS/retry/provider boundaries;
fresh guarded PostgreSQL immutable evidence/rollback/no canonical writes.
Tests scoped to Import shared-values + impacted classification/profile/preview/API
and offline provider regressions. No full suite automatically (no DB schema/engine
change); sequential PG only after exact local shelfcash_test target guard.

## Delivered / implementation facts

All9 schemas retain the original typed row contracts; allowlist above is implemented
by import_field_values.allowed_scopes and shared descriptors. Every other field
remains physical column or existing token/identity/conversion binding, not arbitrary
constant injection. Source-only metadata remains separate from canonical columns.
M04 shared_value, ProfileSpec rules and sheet declarations are versioned field_value/1,
bounded64 entries/scalar1000 characters/int32; native bool/int strict, no float or
array/object. Missing value and explicit null distinct; blank strings reject, even
nullable shared fields. Typed lexical/cross-row/business validation remains preview.

First source rule requires Owner N5. PROFILE_CONSTANT stores value/id/evidence in
immutable version; IMPORT_VALUE rule stores target only, sheet actual value separately.
Approved import-value updates keep pin but revision/review invalidates. Profile/rule
change forks proposal and requires N5. Explicit column switch verifies target/index
and ack, retains IGNORE/evidence plus audited request; switching back removes rule.
Type change clears incompatible shared content, immutable old evidence retained.
Current Store rights/CAS/idempotency reused, no new bypass/authority system.

Profile/preview/review hashes include source rules/values. Shared row provenance now
survives wire serializer via ProvenanceValue, source column index or declaration ID
and normalization/conversion IDs retained. JSONB0013 reused; no schema/migration.
Runtime computation occurs with zero checked-out DB connections (actual PG test).
Qwen has descriptors only, not actual declared values; manual flow needs no provider.
No canonical sales/recipe writes; receipt/opening/purchase-history gaps unchanged.

## Commands/results actually run (2026-10-10)

Pre-fixture guard command:

```text
.venv/Scripts/python.exe -c "from app.config import Settings; from sqlalchemy.engine import make_url; from sqlalchemy import text; from scripts.dev import validate_reset_target; from app.infrastructure.database.engine import create_database_engine; u=make_url(Settings().test_database_url); assert u.database=='shelfcash_test' and u.host in ('localhost','127.0.0.1') and not u.query; s=Settings(_env_file=None,environment='test',database_url=u.render_as_string(hide_password=False)); validate_reset_target(s); e=create_database_engine(s); c=e.connect(); assert c.scalar(text('select current_database()'))=='shelfcash_test'; c.close(); e.dispose(); print('Guard PASS: local shelfcash_test reachable, no development connection')"
```

PASS, local exact shelfcash_test reached; no credential output. Supported sequential
fixtures subsequently reset only test DB, PG17.11/0013 reported. No development DB.

All following commands use prefix `.venv/Scripts/python.exe -m pytest`:

```text
tests/unit/test_import_schema_suggestions.py tests/unit/test_import_preview.py tests/unit/test_import_suggestions.py tests/api/test_import_openapi.py -q --tb=short
19 failed / 28 passed, 7.22s: implementation used row['sheet_id'] instead of outer sheet; fixed.

tests/unit/test_import_field_values.py tests/unit/test_import_preview.py -q --tb=short
1 failed / 32 passed, 4.47s: test expected ValueError instead of canonical RowBlocked; corrected assertion.

tests/integration/test_import_field_value_bindings.py -q --tb=short
2 failed / 1 passed, 8.82s: test used nonexistent payload_json/blocking_issues; corrected to content_json/blockers.

tests/integration/test_import_field_value_bindings.py::test_explicit_switch_conflicts_profile_change_and_value_invalidates_review -q --tb=short --show-capture=no
1 failed, 3.99s (same incorrect blockers assertion).

tests/integration/test_import_field_value_bindings.py -k 'first_sales or explicit_switch' -q --tb=short --show-capture=no
1 failed / 1 passed / 1 deselected, 6.69s: reused missing-value sheet hidden by summary clean filter.

tests/integration/test_import_field_value_bindings.py::test_first_sales_then_reuse_requires_new_import_report_key -q --tb=short --show-capture=no
1 passed, 4.21s: summary now retains blocked sheets for FE.

tests/integration/test_import_field_value_bindings.py::test_recipe_missing_columns_need_explicit_sources_and_preserve_null -q --tb=short --show-capture=no
1 passed, 4.34s: explicit recipe sources + column restoration, fresh canonical zero counts.

tests/integration/test_import_field_value_bindings.py -k 'first_sales or current_permissions' -q --tb=short --show-capture=no
collection ERROR, 0.39s: misplaced new fixture test block caused indentation; repaired layout, no tests counted PASS.
rerun same command: 2 passed / 3 deselected, 7.49s.

tests/unit/test_import_field_values.py tests/unit/test_import_schema_suggestions.py tests/unit/test_import_preview.py tests/unit/test_import_suggestions.py tests/api/test_import_openapi.py tests/integration/test_import_field_value_bindings.py tests/integration/test_import_classification.py tests/integration/test_import_staging.py -q --tb=short --show-capture=no
106 passed, 4 warnings, 123.16s. Targeted Import regression only.

tests/unit/test_import_field_values.py tests/unit/test_import_preview.py tests/api/test_import_openapi.py -q --tb=short
34 passed, 3 warnings, 6.17s after copied duplicate-source guard + false/date assertions.

tests/unit/test_import_field_values.py -q --tb=short
13 passed, 3 warnings, 0.37s after independent shared recipe overlap/unit/derived provenance case.

tests/unit/test_import_field_values.py tests/unit/test_import_preview.py tests/api/test_import_openapi.py tests/integration/test_import_field_value_bindings.py -q --tb=short --show-capture=no
40 passed, 4 warnings, 19.14s after fixing wire provenance serializer to retain source/index/declaration and adding HTTP assertions.

tests/unit/test_import_field_values.py -q --tb=short
13 passed, 3 warnings, 0.41s after strict shared blank-vs-null guard.
```

Groups overlap; no summed total or full-suite claim. Last40-test process had already
loaded modules when blank-only guard was edited; final13-test rerun verifies that
last guard. No interrupted/running process counted PASS; all completions observed.
Warnings: three existing schema-name Pydantic warnings, AnyIO test-client deprecation.

Existing local Black tool, no dependency install: prefix
`$env:PYTHONPATH='runtime/s43/formattools'; .venv/Scripts/python.exe -m black` on scoped
contracts/import_field_values.py, contracts/import_mapping.py, import_descriptors.py,
import_analysis.py, import_preview.py, use_cases/import_staging.py and three affected
unit/integration tests. Completed; subsequent small groups rerun, not full gate.

## Evidence and limits

PG fresh Sessions prove profile never contains old report key; reuse has same version,
unit retained but missing report key blocked; new report value/review independent.
Two rows12/0, source token→UUID, DMY date, source declarations/index exposed in actual
HTTP preview; computation pool checkedout0. Profile constant edit needs approval,
wrong unit still blocks, value edit invalidates review, old version unchanged. Failure
after real flush rolls back pointer/audit; same-key retry one audit. Staff with rights
can change approved import value; stale CAS412, current mapping.propose revoke403,
cross-Store404/no value inheritance, type edit removes shared fields. Recipe yield10/
loss.2/endnull explicit, no Recipe/RecipeLine writes. Broader Import regressions cover
existing RR/capture/process recovery/retention/Owner/Store/permission/lifecycle cases.

Pure new tests prove missing/null/zero/false, invalid quantity/date/bool/integer/float,
forbidden source/scope/nested, duplicate/copy revalidation and unchanged overlap/unit
rules with shared recipe inputs. Declared numeric locale preserves declaration ref
after exact normalization. Provider allowlisted projection excludes actual shared values.

Live Qwen/provider availability/accuracy, FE/browser/load/security certification and
real customer workbooks not checked. No full pytest, new DB schema, canonical writes,
S4.5/S4.6, engine/DATA_REQUIREMENTS, commit/stage/push/deploy/new ZIP. Nested JSON
and identity scalar injection/fallback/live lookup remain explicitly unsupported.

Final descriptor wording removes obsolete "Required column" for nullable effective
end dates; required normalized value can come from either allowed source.
Executed `.venv/Scripts/python.exe -m pytest tests/unit/test_import_schema_suggestions.py -q --tb=short`:
23 passed, 3 warnings, 1.52s. Only affected descriptor group rerun.

## Final mechanical checks

`.venv/Scripts/python.exe runtime/import_values/final_checks.py` exited0:460 baseline
tracked/untracked files compared, only13 expected existing files changed plus5 new
in-scope files. Unrelated WIP/accepted ADRs/models/migrations/writers/provider adapter
preserved.19 older ZIP SHA256 retained, supplied legacy ZIP/report unchanged in
baseline. HEAD a4b68378f35fea6f71b549e24393cf4bbb35aba5 unchanged, index empty.
git diff --check, UTF8/replacement-char/AST and151 local documentation links PASS.

OpenAPI generated without starting lifespan/worker or DB connection:31 paths/all
IDs/operation definitions unchanged; four new components ImportValue/
ImportValueRequirement/ProfileConstant/SharedValueResolution; five changed Import
components FieldOption/ProfileSpec/ProvenanceValue/ResolveRequest/SheetInfo; none
removed. Old non-Import foundation schemas identical. Existing M04 schema $ref has
new typed variant (referenced DTO change, no new route/status). Evidence ignored
runtime/import_values/openapi_after.json and final_checks.json. Mechanical proof
is distinct from executed tests and does not certify provider accuracy/security.
