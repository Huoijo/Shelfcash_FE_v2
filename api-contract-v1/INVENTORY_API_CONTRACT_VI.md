# Kho — đọc tồn, lô, movements và ghi nhận lô thực tế

09/10/2026 · inventory-contract/1 · DESIGN ONLY. Điểm vào:
[bàn giao v1](SHELFCASH_API_CONTRACT_V1_VI.md). **ĐÃ CHỐT**: lot-level inventory,
atomic justified movements, count chỉ lô đã định danh; v1 nhận lô ban đầu/hàng
thực nhận; gần hạn7 ngày, sắp hết theo ngưỡng Owner. **TECHNICAL CHOICE**: wire
schema/receipt provenance/CAS bên dưới. Không public HTTP hoặc tests đã chạy.

## Mục lục

- [Nguồn và đối chiếu FE](#inventory-sources)
- [Luồng, tồn vật lý và dùng được](#inventory-semantics)
- [V01–V04](#inventory-reads)
- [Nhận lô N6](#inventory-receipt)
- [Ngưỡng Owner N8](#inventory-threshold)
- [Quyền, errors, acceptance và backlog](#inventory-acceptance)

<a id="inventory-sources"></a>
## 1. Nguồn và endpoint gốc

| Nguồn | Classification / evidence |
| --- | --- |
| [FE0 mục9](references/ShelfCash_FE_BE_API_CONTRACT_v0.md#9-inventory--kho) | PROPOSED V01–V04; thresholds/precedence chưa quyết trong v0. |
| [ADR-009](references/adr/ADR-009-inventory-mutation-audit-policy.md), [ADR-010](references/adr/ADR-010-data-completeness-and-missing-business-facts.md) | ACCEPTED: physical lot + movement atomic, expired retained/usable0, unknown received_date không bịa. |
| app/application/contracts/inventory.py; use_cases/inventory.py; repositories/inventory.py | CURRENT FACT đọc source: receive tạo lot+RECEIPT positive; adjust COUNT_CORRECTION/MANUAL_ADJUSTMENT atomic/locked, exactunit, trackedexpiryrequired. Không opening-stock HTTP/idempotency/actor enforcement. |
| tests/integration/test_operational_paths.py; docs/features/SERVING_FEFO.md; app/domain/decision/serving.py | Source specs / internal pure FEFO: expiry date X còn dùng trong ngày X, X+1 expired; không expiry writer. Không tuyên bố tests đã chạy. |
| [Catalog](CATALOG_MENU_RECIPE_API_CONTRACT_VI.md), [Import](IMPORT_MAPPING_API_CONTRACT_VI.md), [Auth](AUTHORIZATION_CONTRACT_VI.md#auth-v1) | Catalog identities/units; count không bootstrap; current grants. |

| ID/method/route FE gốc | Xử lý | Lý do |
| --- | --- | --- |
| V01 GET /stores/{store_id}/inventory | GIỮ; sửa projection | Physical và usable tách rõ; known/unknown, không fixture quantities. |
| V02 GET /stores/{store_id}/inventory/{ingredient_id} | GIỮ | Ingredient summary + initial lot page cùng snapshot. |
| V03 GET /stores/{store_id}/inventory/{ingredient_id}/lots | GIỮ | Pagination cùng snapshot, không list lot CRUD. |
| V04 GET /stores/{store_id}/inventory/{ingredient_id}/movements | GIỮ; mở kind canonical | Sáu movement types đúng ADR, không gom mọi disposal thành adjustment. |
| N6 POST /stores/{store_id}/inventory/receipts | THÊM đã duyệt responsibility | Count import không tạo lot; hàng thực nhận và opening stock cần đường ghi riêng. |
| N8 PUT /stores/{store_id}/inventory/{ingredient_id}/threshold | THÊM technical route | Owner khai báo ngưỡng để nhãn sắp hết có nghĩa; không CRUD ingredient. |

<a id="inventory-semantics"></a>
## 2. Luồng khách và quantities

Import tạo/bind Ingredient trước → khách nhập lô có thật N6 → V01/V02 đọc stock →
V03 thêm lô/V04 audit → kiểm kê import chỉnh lô đã định danh. Recipe→Kho bằng
ingredient_id canonical. Không receipt từ recommendation/PO/chưa nhận hàng.

Store-local as_of_date=today, timestamp UTC Z. Quantity là QuantityText theo Catalog,
PositiveQuantity là alias PositiveQuantityText (>0), không rational object của
C03. SignedQuantity là plain decimal string signed (cho dấu trừ, không dấu cộng,
không exponent/negativezero); regex `^-?(0|[1-9][0-9]*)(\.[0-9]+)?$`, cấm âm0.
Quantity trong schemas dưới đây là alias QuantityText; mọi unit exact
Ingredient.base_unit. Không tự g↔kg. Public decimal input không áp bounds tiền
cho quantities; request≤64KiB, output giữ exact không truncate/round.

Các quantities của Ingredient:

- on_hand_quantity: tổng balance hiện hành mọi lô, kể cả hết hạn; là tồn vật lý
  **đã ghi nhận**, không chứng minh đã kiểm kê đủ kho.
- usable_quantity: tổng lô có balance dương đủ điều kiện dùng ngày as_of_date.
  expiry<as_of_date không dùng, expiry=as_of_date còn dùng. Null nếu có lô dương
  thiếu expiry bắt buộc hoặc fact/date không hợp lệ; usable_known_quantity vẫn
  trả tổng phần xác định. usable_availability là known|unknown.
- expired_quantity: tổng balance dương có expiry đã biết<as_of_date. GET không
  ghi movement EXPIRED hoặc tự giảm tồn vật lý.
- stock_completeness: CONFIRMED|UNKNOWN. Không có lô thì recorded on_hand="0",
  nhưng không tự xác nhận tồn thực tế bằng0. Planning cần declaration toàn phạm
  vi theo Import13.5; một receipt không đủ chứng minh toàn bộ stock.

received_date null có warning, không chặn usable hiện tại. Ngày nhận đã biết trong
future không biến lô thành inbound, loại khỏi usable và báo lỗi dữ liệu. Ingredient
tracked thiếu expiry thì usable unknown; nontracked null expiry được dùng với
warning EXPIRY_UNKNOWN. Không suy tuổi lô/expiry/cost. Unknown unit_cost không
ảnh hưởng tổng quantities; availability của cost riêng. Chưa có quarantine policy.

**Gần hạn đã chốt:** lô usable có balance dương và0≤expiry−as_of_date≤7 ngày;
không bao gồm expired hoặc expiry unknown. **Sắp hết đã chốt:** ngưỡng Owner theo
base unit; usable_quantity đã biết≤threshold thì low_stock. Threshold null khác0;
thiếu ngưỡng thì low_stock_assessment.status="unknown", không suy từ forecast.

Ingredient status theo thứ tự:
1. expired nếu recorded physical>0, mọi phần dương đều xác định hết hạn và phạm
   vi stock CONFIRMED;
2. empty nếu usable_quantity="0" đã biết và phạm vi CONFIRMED;
3. low_stock nếu threshold/usable đã biết, phạm vi CONFIRMED và usable≤threshold;
4. near_expiry nếu có lô usable gần hạn;
5. watch nếu completeness/usable/threshold chưa biết hoặc warning ngày;
6. stable khi mọi check biết, không có điều kiện trên.

status_reasons[] và các assessment/counters giữ được nhiều dấu hiệu đồng thời;
status chính không xóa cảnh báo khác. Lot status: empty|expired|near_expiry|watch|
stable theo balance/expiry, không dùng threshold của Ingredient.

use_first=true cho duy nhất lô dương đủ điều kiện đứng đầu FEFO: expiry tăng dần,
null cuối; received_date tăng dần/null cuối; UUID tie-break. Đây là thứ tự đọc,
không ghi USAGE/tiêu hao. location=null/location_availability=unsupported vì chưa
có location model. batch_code adapter=lot_code nullable, không unique identity.

<a id="inventory-reads"></a>
## 3. V01–V04 requests/responses và snapshots

Envelope/types/errors theo [Planning](PROCUREMENT_API_CONTRACT_VI.md#planning-types).
V01 query q1..200 case/diacritic-insensitive name/SKU; repeated ingredient_id UUID,
status list enum trên, limit50/max100,cursor,sort=name|-name|nearest_expiry (UUID
tiebreak). Filters AND, status values OR. Summary Store-wide unfiltered, response
filtered total_count riêng. Missing IDs chỉ explicit filter unknownwithinStore,
không tiết lộ existence Store khác. Known catalog Ingredient no lots vẫn row với
recorded totals0/completenessUNKNOWN; missing ID không fake row0. Active false giữ
stock/history, ingredient_active flag, không auto-delete.

IngredientStock={ingredient_id,name,sku:string|null,ingredient_active:boolean,
unit,on_hand_quantity,usable_quantity:Quantity|null,usable_known_quantity,
usable_availability,expired_quantity,stock_completeness,lot_count:int,
positive_lot_count:int,nearest_expiry:date|null,status,status_reasons:Notification[],
low_stock_assessment:{status:"low"|"ok"|"unknown",threshold:Quantity|null,
version:Version|null},near_expiry_lot_count:int}. Nearest expiry only eligible known
positive lot, không chọn expired. Summary={ingredient_count,positive_lot_count,
near_expiry_lot_count,near_expiry_ingredient_count,expired_lot_count,
low_stock_ingredient_count:int|null,unknown_assessment_ingredient_count:int}.
Low countnull nếu không đánh giá được toàn Store; không show0 cho missing thresholds.

V02 query snapshot_id?,lot_limit50/max100, không body; data=IngredientStock+
{lots:InventoryLot[],lots_page:{next_cursor,total_count},threshold_version:Version}.
V03 query snapshot_id?,limit,cursor,sort=expiry_date,batch_code duy nhất; data=
{ingredient_id,items:InventoryLot[]}. InventoryLot={lot_id,batch_code,quantity,unit,
supplier_id:UUID|null,received_date:date|null,expiry_date:date|null,status,
use_first:boolean,location:null,location_availability:"unsupported",updated_at,
version,origin:"OPENING_STOCK"|"ACTUAL_RECEIPT"|"UNKNOWN",cost:{availability:
"known"|"unknown"|"forbidden",unit_cost:MoneyText|null,currency}}. Cost omitted?
Không: cost object required, forbidden→null và không derived values/sortfiltercost.

V04 query snapshot_id?,limit,cursor,sort=-occurred_at; data={ingredient_id,
items:Movement[]}. Movement={movement_id,lot_id,batch_code,kind:receipt|usage|waste|
expired|count_correction|manual_adjustment,quantity_delta:SignedQuantity,unit,
occurred_at:Timestamp,recorded_at:Timestamp,actor_user_id:UUID|null,reason:string|null,
reference:{type,id}:object|null,origin:OPENING_STOCK|ACTUAL_RECEIPT|IMPORT_COUNT|
UNKNOWN}. Null old audit facts remainunknown; do not fabricate historical actor.
No money fields V04. List recent movements không reconstruct whole balance.

Meta everyread={request_id,as_of_date,updated_at:Timestamp|null,snapshot_id:Version,
data_version:Version,pagination?}. TECHNICAL CHOICE optimistic snapshot token binds
Store/date/inventory+catalog+threshold revision. Không historical copy service:
same snapshot đọc được chỉ khi versions hiện hành còn khớp; changed/date rollover409
SNAPSHOT_NOT_AVAILABLE yêu cầu refresh cả set. Cursor bind actor,filters,snapshot;
crossfilter422 INVALID_CURSOR, privileges changed recheck, versionchanged409. Join
một short consistent read transaction; initialV02 page lô cùng snapshot summary.

Ví dụ V01 (đã Owner xác nhận phạm vi, 12 L ghi nhận trong một lô nontracked):

```json
{"data":{"summary":{"ingredient_count":1,"positive_lot_count":1,"near_expiry_lot_count":0,"near_expiry_ingredient_count":0,"expired_lot_count":0,"low_stock_ingredient_count":0,"unknown_assessment_ingredient_count":0},"items":[{"ingredient_id":"00000000-0000-0000-0000-000000000003","name":"Sữa","sku":null,"ingredient_active":true,"unit":"l","on_hand_quantity":"12","usable_quantity":"12","usable_known_quantity":"12","usable_availability":"known","expired_quantity":"0","stock_completeness":"CONFIRMED","lot_count":1,"positive_lot_count":1,"nearest_expiry":"2026-10-25","status":"stable","status_reasons":[],"low_stock_assessment":{"status":"ok","threshold":"2","version":"threshold-1"},"near_expiry_lot_count":0}],"missing_ingredient_ids":[]},"meta":{"request_id":"req-stock","as_of_date":"2026-10-09","updated_at":"2026-10-09T02:00:00Z","snapshot_id":"stock-8","data_version":"stock-8","pagination":{"limit":50,"next_cursor":null,"total_count":1}},"error":null}
```

<a id="inventory-receipt"></a>
## 4. N6 — opening stock và hàng thực nhận

POST /stores/{store_id}/inventory/receipts, synchronous201; Idempotency-Key required,
body discriminated origin OPENING_STOCK|ACTUAL_RECEIPT. Common fields
{receipt_identity:{source_system_key,source_record_id},ingredient_id,supplier_id:
UUID|null,lot_code:string1..128|null,quantity:PositiveQuantity,unit,received_date:
date|null,expiry_date:date|null,unit_cost:MoneyText|null,currency,observed_at:Timestamp,
reason:string1..1000,expected_inventory_version:Version}. source keys1..128 nonblank,
unique Store+source_system_key+source_record_id; not filename/lotcode identity.
Currencyexact Store, unit_cost null do chưa biết, known0 valid. Dates knownreceipt≤today,
expiry≥knownreceipt, expiry tracking requires date; expired **opening stock** có
thể ghi để phản ánh vật lý, cảnh báo unusable. New receipt alreadyexpired warning
không che thông tin; không tự giả chất lượng/return workflow. observed_at là lúc
khách thực sự kiểm/nhận, bắt buộc known≤now; received_date unknown giữnull, không
derive từ observed_at. Receiptcurrentbalance phải observed current và không
intervening observation/source events; CAS changed409 INVENTORY_VERSION_CONFLICT.

TECHNICAL CHOICE phù hợp ADR009: OPENING_STOCK quantity là **số còn hiện tại** của
một lô đã có thực, không lượng mua trước đây. Tạo lot balancequantity + positive
COUNT_CORRECTION từ baseline0 với reason và reference_type=OPENING_STOCK;
occurred_at=observed_at, recorded_at=server time. Không bịa RECEIPT lịch sử hoặc
received_date. ACTUAL_RECEIPT quantity là thực nhận lần này; lô mới + positive
RECEIPT, reference_type=ACTUAL_RECEIPT. Đây là design opening writer mới, internal
receive hiện chỉ RECEIPT, chưa hỗ trợ distinction này. Không thêm movement type.
Không reuse canonical lot đã tồn tại bằng lot_code; muốn countlot dùng import
snapshot. Source identity trùng cùng normalized payload trả receipt cũ200, khác
payload409 RECEIPT_IDENTITY_CONFLICT; không correction hàng cũ qua newkey/newlot.
Client phải xác nhận source identity; key khác không bằng chứng lô khác.

Response {receipt_id:UUID,origin,lot:InventoryLot,movement:Movement,
inventory_version:Version,audit_reference:UUID,warnings:Notification[]}.
Idempotent replay trả retained mutation receipt sau current permissions check,
không live lot balance sau các count. Lot+movement+identity nguồn+idempotency+
audit atomic. quantity = 0 không tạo lot/movement,422; toàn bộ tồn kho known0 được
declaration qua Import readiness declarations, không fake lot0. Không tự đánh
CONFIRMED toàn Ingredient chỉ vì nhận một lô; completeness phải khai báo phạm vi.

```json
{"origin":"OPENING_STOCK","receipt_identity":{"source_system_key":"store-opening-20261009","source_record_id":"sua-lot-01"},"ingredient_id":"00000000-0000-0000-0000-000000000003","supplier_id":null,"lot_code":"LOT-01","quantity":"12","unit":"l","received_date":null,"expiry_date":"2026-10-25","unit_cost":null,"currency":"VND","observed_at":"2026-10-09T02:00:00Z","reason":"Ghi nhận số dư lô có thật khi bắt đầu dùng ShelfCash","expected_inventory_version":"stock-7"}
```

<a id="inventory-threshold"></a>
## 5. N8 — Owner khai báo ngưỡng sắp hết

PUT /stores/{store_id}/inventory/{ingredient_id}/threshold Owner-only;
If-Match + Idempotency-Key, version đọc từ V02 dù config chưa có (`unconfigured-*`).
Body {minimum_usable_quantity:Quantity|null,unit,reason:string1..1000}.
Response200 {ingredient_id,minimum_usable_quantity,unit,version,updated_at,updated_by}.
Null clearconfig→unknownassessment;0 nghĩa chỉ hết dùng mới chạm ngưỡng. Không
unit conversion, không threshold từ forecast, không thay planning safety/storage
constraints. threshold update là UI alert setting, audit+CAS atomic, storedRun giữ
nguyên. Version changed412 THRESHOLD_REVISION_CONFLICT; missing428; Owner củaStore
khác404, Staff403. Retry key semantics như mutationPlanning, no-op giữversion.

<a id="inventory-acceptance"></a>
## 6. Permissions, errors và acceptance

V01–V04 require inventory.read + ingredient.read. N6 inventory.receive+
inventory.read+ingredient.read; unit_cost nonnull thêm procurement.cost.read để
khách kiểm giá mình đang ghi (inventory.receive authority cho cost receipt);
unit_cost null do chưa biết không buộc costread. Lotcost redaction có cấu trúc known/unknown/
forbidden là **TECHNICAL CHOICE riêng Kho**, không đổi whole-denial Planning/Import.
No values/valuation/ordering leak khi thiếu costread. Threshold Owner-only.
Owner/Staff active checks theo [Auth](AUTHORIZATION_CONTRACT_VI.md#auth-session).

400 INVALID_REQUEST;401 UNAUTHENTICATED;403 PERMISSION_DENIED/CSRF_CHECK_FAILED;
404 RESOURCE_NOT_FOUND scope-safe;422 VALIDATION_ERROR/INVALID_UNIT/
REQUIRED_EXPIRY_MISSING/INVALID_FILTER/INVALID_CURSOR;428 PRECONDITION_REQUIRED;
412 THRESHOLD_REVISION_CONFLICT;409 SNAPSHOT_NOT_AVAILABLE/INVENTORY_VERSION_CONFLICT/
RECEIPT_IDENTITY_CONFLICT/IDEMPOTENCY_KEY_REUSED/STALE_STOCK_OBSERVATION;503
SERVICE_UNAVAILABLE. Errors details field_errors/blockers, không SQL/secrets.

Acceptance specifications chưa chạy:
1. Expiredphysical retained, usable0; expiryday dùng được, read không movement.
2. Nontracked missingdate warn; tracked nhưng thiếu expiry unknown, không fake dates;
   no lots recorded0/completenessunknown không whole-stock0.
3. Near-expiry7 inclusive, excludes expired; low threshold null unknown/zeroexact;
   flags/counters phân biệt lotcount và ingredientcount, summary unfiltered.
4. V02 firstpage/V03/V04 pinned snapshot; stockchange409 refresh, cursor không
   ghép filters/Store; no reconstruction from recent page.
5. Opening12 tạo COUNT_CORRECTION+12, actualreceipt5 tạo RECEIPT+5; count12→10
   là -2 trên lô đã định danh; không initialreceipt giả/unknownlot từ count.
6. Same source/key retry một lot/movement; changedsource409; fault rollback mọi
   writes, committed receipt đọc freshsession khi implementation verification.
7. Cost forbidden null không metricleak; ngưỡng Owner cập nhật auditedCAS,
   Staffdeny/crossStore404; revoke trước commit fence không writes.

IMPLEMENTATION BACKLOG: typed readprojections/snapshots/counters/thresholdstorage,
openingstock writer/receiptidentity/actor audit/idempotency bridge, toàn bộ tồn kho
declarations loader từ Import, costfield masking/current auth, public HTTP/OpenAPI.
Internal receive/adjust sở hữu Session riêng chưa tự compose whole batch. Không
tests/DB/solver trong task; không sửa ADR/code hoặc WIP của phiên khác.
