# Import schema inventory / descriptors follow-up

## Before edit — authorized scope, freeze, acceptance and rollback

User request: inventory every current typed source field, including nested structured
values; distinguish Excel, reviewed identity binding and application context. Compare
legacy evidence and approved Import/Inventory scope without adding legacy schemas.
Opening stock, actual receipts and purchase history must never become inventory_count.

CURRENT FACT: nine SOURCE_MODELS, profile bindings map physical columns; canonical UUID
references already accept source tokens resolved by approved IdentityRule/reservation.
SourceContext supplies profile/semantic/parsing metadata, not arbitrary row constants.
Typed-source requiredness is row-value requiredness, not inherently an Excel-column
requirement. Current build_spec does require mapped columns for all required row fields;
this gap will be disclosed rather than claiming generic context injection exists.

Frozen additive descriptor delta: preserve requiredness required/optional and all
existing profile/validation behavior; expose nullable, accepted input sources and
business help for identities/units/dates. Do not add source schemas, profile constant
storage, routes, writers or migrations in this descriptor slice. Inventory report
separates current runtime from accepted future capabilities and OPEN proposals.

Affected: M03 descriptor bodies and bounded Qwen descriptors, manual mapping aliases;
no engine/S1/S2/S3 writer changes. Acceptance: source-field parity/nullability, source
tokens resolving without UUID columns, exact date meaning and wrong-domain negative
mapping, unsupported fields. Targeted descriptor/provider/preview/OpenAPI tests plus
affected rule/identity regressions; no full suite or DB access needed for pure metadata.

Rollback: revert only this follow-up's descriptor/DTO/tests/docs delta, preserving
preexisting uncommitted Import and all other WIP. Initial hashes/status recorded under
ignored runtime/import_schema_inventory. No staging/commit/push/ZIP or development DB.
Authority: current Import contract, Inventory N6, ADR008/009/010/013; legacy report/ZIP
are evidence only. Roadmap S4.5 canonical commits and S4.6 receipts remain PLANNED.

## Delivered / decisions / limits

Inventory: docs/features/IMPORT_SCHEMA_INVENTORY.md has111 rows across9 schemas,
including discriminators and nested FeeComponent/three declaration kinds/Capacity/
SupplierLimit, validation and per-field destinations where canonical columns exist.
Quantity JSON Schema pattern remains exact (HTML escaped pipe for table rendering).
Required/nullable projected from typed source; no invented optional business default.

FieldOption adds nullable/input_sources/input_help, retains requiredness semantics.
Business labels/aliases allow Product/Ingredient/Supplier name/code columns with
approved bindings; existing normalize resolves them, no UUID in Excel needed. Count
has lot identity/observation/current-quantity help; receipt/purchase/opening dates
and quantities are not count aliases. No live provider/request calls or DB changes.

Observed gap: generic context-to-row constants absent; all required source fields
still need a mapped column. This is disclosed rather than resolved with fabricated
defaults or a new profile subsystem. Approved-context binding extension remains
to freeze before consumers need it; nested declaration refs currently canonical
JSON, not automated nested token resolution. These limits are not claimed COMPLETE.
Opening/actual receipts N6 approved contract wait S4.6, internal receive core does
not implement full N6 identity/actor/CAS/idempotency; purchase history has no approved
import capability. No legacy parity schemas or writer changes made.

Routine decisions: preserve public requiredness vocabulary, expose nullability
separately; preserve raw/canonical units/identities; remove ambiguous generic
"Tồn kho" count alias in favor of "Số tồn kiểm kê". Added fields only report current
sources, not imaginary context support. Shelf-life/max-order missing inputs are
preview warnings, distinguished from row rejection and Decision readiness.

## Verification actually run (2026-10-10)

Selected coverage: descriptors affect rules, provider projection, normalization
help and M03 DTO/OpenAPI only. Pure descriptor/identity/preview/offline provider and
API schema regressions cover these callers; no schema/writer/transaction change
requiring PostgreSQL rerun or full suite. Previous PostgreSQL results are historical.

```text
.venv/Scripts/python.exe -m pytest tests/unit/test_import_schema_suggestions.py tests/unit/test_import_suggestions.py tests/unit/test_import_preview.py tests/api/test_import_openapi.py -q --tb=short
47 passed, 3 existing Pydantic warnings, 6.49s

.venv/Scripts/python.exe -m pytest tests/unit/test_import_schema_suggestions.py -q --tb=short
23 passed, same 3 warnings, 1.49s
```

Second run follows business warning wording clarification/formatting, only affected
descriptor group. Counts overlap, not70 unique tests/full regression. New independent
case uses "Trà đào" source token + approved Product UUID binding, quantity0 preserved;
business headers map to sales and actual receipt/purchase/opening fields remain
unresolved under count. Handpicked required-nullable fields retain requiredness.

Existing local formatting tool (no dependency install):
`$env:PYTHONPATH='runtime/s43/formattools'; .venv/Scripts/python.exe -m black app/application/import_descriptors.py app/application/contracts/import_mapping.py tests/unit/test_import_schema_suggestions.py`
completed, two reformatted/one unchanged. No semantic change claimed from formatting.

`.venv/Scripts/python.exe runtime/import_schema_inventory/check_final.py` PASS:
458 baseline tracked/untracked files checked, only8 in-scope existing files changed;
new inventory/task notes in scope. All19 older ZIPs retained, index empty/HEAD
unchanged, git diff --check/UTF8/AST/local links PASS.31 OpenAPI paths/operations
unchanged; only FieldOption component gains nullable/input_sources/input_help.
Mechanical JSON evidence runtime/import_schema_inventory/final_checks.json.

No full pytest, PostgreSQL, live OpenRouter, FE browser, customer workbook quality
or production security/load checks in this follow-up. No interrupted result counted.
No S4.5/S4.6 implementation, development DB access, commit/stage/push/new archive.
