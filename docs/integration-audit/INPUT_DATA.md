# Input data and independent oracles

Status: NOT_RUN. Workbook contents, sheets, row counts, schemas, hashes, and business semantics have not been inspected in this preparation pass.

## Known candidate files

The preceding session listed these filenames under [INPUT_FOR_TESTING](../../INPUT_FOR_TESTING). Their current availability and integrity on the target must be established anew:

- 01_POS_BASELINE_to_2026-07-08.xlsx
- 02_USAGE_BASELINE_to_2026-07-08.xlsx
- 03_INVENTORY_PURCHASE_BASELINE_snapshot_2026-07-08.xlsx
- 04_RECIPES_BUSINESS_RULES.xlsx
- 05_CONTEXT_HISTORY_and_W1_FORECAST_2026-01-01_to_2026-07-15.xlsx
- 06_MENU.xlsx

All six candidates currently have inspection status NOT_RUN. A filename is not proof of schema, data date, entity identity, source semantics, or import support. Do not upload all workbooks merely because they are present.

## Dataset record template

```yaml
dataset_id: TO_ASSIGN
path_and_sha256: NOT_RECORDED
authorized_store_and_namespace: NOT_RECORDED
source_provenance: NOT_RECORDED
sheets_rows_and_rejected_scope: NOT_RECORDED
declared_schemas_and_field_evidence: NOT_RECORDED
source_locale_dates_timezone: NOT_RECORDED
entity_bindings_and_evidence: NOT_RECORDED
quantity_unit_pack_price_moq_yield_semantics: NOT_RECORDED
baseline_reader_evidence: NOT_RECORDED
independent_expected_effects_and_no_effects: NOT_RECORDED
supported_cleanup_and_retention: NOT_RECORDED
case_ids: []
inspection_status: NOT_RUN
```

## Preparation requirements for a future run

Read actual sheets/cells and accepted business contracts. Resolve ambiguous purchase-history versus actual-receipt meaning, source date meanings, recipe per-serving versus whole-yield quantities, pack/base-unit pricing/MOQ, and calendar/promotion semantics before dependent writes. Keep unresolved semantics BLOCKED_DATA; continue independent cases.

Prepare known-valid, missing-required, invalid-type/unit/date, duplicate/conflict, boundary, null/absent/zero/false/unknown, and permission variants for the published schemas relevant to the assigned scope. Whole-app audit should reconcile all published schemas; a narrow assignment should not silently expand into unrelated writes.

Use a run-specific namespace and a small isolated subset first. Calculate expected records, quantities, costs, versions, and no-op behavior independently of the FE implementation under test. Preserve original workbooks; derive test copies only under authorized scope. Record deliberate exclusion; never silently drop sheets/columns/rows or select entities/IGNORE to force success.
