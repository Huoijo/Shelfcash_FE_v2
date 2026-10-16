Run: `20261016-windows-d5cfbfb-discovery`. Mode: **DISCOVERY_EXECUTION**. Date: 2026-10-16, Asia/Saigon. Outcome: **DISCOVERY_ENVIRONMENT_LIMITED**.

# Workbook inspection and independent oracles

Read-only OOXML inspection via Python standard-library zipfile/XML, preserving original bytes. All six workbooks are present, all10 sheets traversed, serialized row counts/formula counts captured, header/preamble/first data values inspected. This establishes file structure and representative source semantics, **not** complete business/source approval or import acceptance. XLSX epoch date1904=false in each workbook. No formulas executed or source workbook modified; menu contains25 formulas, whose formulas/cache semantics require validation before importing dependent values.

| Workbook | SHA256 | Sheets: serialized row count / formula count |
| --- | --- | --- |
| 01_POS_BASELINE_to_2026-07-08.xlsx | 23010aaa9a8a88e03b3c6bc0562a7118ff7d2d99b5c4a3681f6559dca2d891dc | README: 10 / 0; POS_T7_2026: 1158 / 0 |
| 02_USAGE_BASELINE_to_2026-07-08.xlsx | e47eefcb233dce82fec7512f442b365197ff1bac43aad2adb190a920eb73bcb1 | NL_thực_dùng: 653 / 0 |
| 03_INVENTORY_PURCHASE_BASELINE_snapshot_2026-07-08.xlsx | ab3c5764c9fe230da7b64a3d0f6675cac92356836471601466b4b1d0bad60c47 | KiemKe_08-07: 14 / 0; PNK tháng 7: 72 / 0; Vendor rules: 13 / 0 |
| 04_RECIPES_BUSINESS_RULES.xlsx | a4370e477ffc4cfe843cdf7d46c2bf53a1a86ad84f4f1695496a2f8e2332023e | Định lượng món: 22 / 0; Điều kiện vận hành: 29 / 0 |
| 05_CONTEXT_HISTORY_and_W1_FORECAST_2026-01-01_to_2026-07-15.xlsx | 042e97456d2293b4b37e0fad967f516da3416d215eb8d455dcea1ce497d71bb0 | Calendar + Weather: 234 / 0 |
| 06_MENU.xlsx | 6864dc86b9cbcca1b89ba875648be3bd31a86a9497c79620b2adc3cff872ba98 | 06_Menu: 13 / 25 |

Counts include title/preamble/header/style rows, not assumed business records. Numeric Excel dates were observed (POS A4=46023; inventory count A4=46211; recipe H4=46174). Store-local date interpretation must be explicitly declared and tied to workbook epoch, not filename/upload date. README is not silently ignored; unsupported columns are not auto-mapped.

## Observed semantics and dependent safety

- POS title/preamble says operational data through08/07; row3 fields Ngày GD, Tên món/SKU, SLX, Đơn giá bán, Doanh thu, Hết món?, CTKM. A4 quantity0 and explicit Có stockout demonstrate zero != unknown stockout. No entity IDs are inferred from names.
- Usage preamble explicitly says simulated from POS + recipe with operational error. This is usage history, not automatic inventory decrement or independent demand truth; loss/usage bases need approved declarations.
- Inventory KiemKe sheet explicitly labels synthetic baseline/count and unknown received_date when absent. A count requires existing lot binding/CAS; it is not actual receipt. PNK sheet preamble explicitly says purchase_history record_only, despite additional Ngày nhập hàng column: no stock increment should follow that classification. Lot/PO/date/entity/source contribution bindings remain unverified.
- Vendor rules has MOQ/Order UOM/Pack Size/Base UOM/Lead time/Giá mua/delivery/shelf_life_days. Example first row1 thùng,15kg and price28000 does not prove price per pack versus source unit. Needs source cost basis/denominator and exact conversion; no guessed amount or fees.
- Recipe preamble says one ingredient per Product and default yield1 ly; header Lượng/1SP plus actual Yield column is evidence for a per-serving declaration, not permission to ignore differing row values. First quantity0.12kg/yield1/version1/effective Excel46174; all-row grouping, yield/loss and effective dates still require validation. Operating constraints include unsupported/mixed business semantics; never assume generic stored constraints are enforced.
- Context Calendar+Weather contains recorded/context forecasts whose time grain/known-at cutoffs require cell and source validation. Weather/promotion/uplift is not automatically a supported forecast feature.
- Menu formulas and selling-unit/price/name bindings require cache/error validation; preserve unknown versus zero and exact decimal strings.

## Frozen independent expected effects for follow-up

Upload/analyze: source/admission/parsed evidence only, zero canonical business writes. Mapping proposal/profile approval: no menu/stock/sales write. Preview: no canonical writes; confirm_review is a separate receipt. Pure inserts/NO_OP may omit reason where contracted; corrections require reason and pins. Sales same contribution corrects/replaces, never additively doubles. Purchase/usage history record-only creates no stock movement. Count equals justified target delta on existing bound lot; actual receipt/opening is separate identity and writer. Recipe per-serving0.12kg with verified yield1 remains0.12kg canonical whole-yield; do not apply loss twice. Vendor price oracle cannot be numeric until basis is declared. Retained completion and Run do not change after current facts change; Readiness is separate/current.

No workbook-dependent mutation was attempted because B-ACCOUNT/B-TLS prevent the authorized smoke prerequisites. Entity/source/unit/pack/yield/date/calendar ambiguities are BLOCKED_DATA for their dependent cases; no canonical results were invented. Follow-up oracles must independently calculate all selected quantities/costs/versions and assert fresh-session stored state after commit. No usable numerical plan/forecast quality oracle is established here.

Current15 published schema values: sales, recipes, inventory_count, opening_stock, inventory_receipts, products, ingredients, suppliers, supplier_terms, payable_fees, scope_declarations, calendar_events, promotion_observations, usage_history, purchase_history. Six files are acceptance candidates, not schema authority. Small disposable smoke data needs a run namespace and the correct assigned Store; no copies were uploaded.
