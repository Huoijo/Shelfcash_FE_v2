# Nguyên liệu → Menu/sản phẩm → Công thức — API contract

Ngày review: 09/10/2026. Document version: catalog-menu-recipe-contract/1.

Đây là contract **DESIGN ONLY** của một cụm dữ liệu độc lập, không phải API đã
triển khai. **CURRENT FACT** bên dưới là kết quả đọc source/tests; không chạy lại
tests. **ACCEPTED DECISION** chỉ dẫn quy tắc đã có hoặc câu trả lời trực tiếp của
người dùng. **PROPOSAL / TECHNICAL CHOICE** là thiết kế public boundary theo ủy
quyền, chưa phải runtime hoặc ADR mới ACCEPT. Implementation backlog tách ở mục 10.

Nguồn FE gốc: [ShelfCash_FE_BE_API_CONTRACT_v0.md](references/ShelfCash_FE_BE_API_CONTRACT_v0.md),
mục 9/10, P01/P02 và liên kết recipe → V01; giữ nguyên file đó.
Phân quyền: [AUTHORIZATION_CONTRACT_VI.md](AUTHORIZATION_CONTRACT_VI.md).
Pipeline: [PROCUREMENT_API_CONTRACT_VI.md](PROCUREMENT_API_CONTRACT_VI.md).

## Mục lục

- [Luồng và phạm vi](#flow)
- [Endpoint gốc → contract cụm](#endpoints)
- [Backend hiện hành và giới hạn evidence](#current)
- [Đơn vị, sản phẩm và công thức](#semantics)
- [Conventions](#conventions)
- [P01 — Menu](#p01)
- [P02 — món và công thức](#p02)
- [Quyền và errors](#permissions)
- [Ảnh hưởng đến dữ liệu và Planning](#effects)
- [Backlog, acceptance và verification](#verification)
- [Quyết định sản phẩm của lượt review](#decisions)
- [Đổi hiệu lực công thức — timeline/preview/commit](#recipe-effectivity)

<a id="flow"></a>
## 1. Luồng sử dụng và phạm vi

Khách vào Menu → P01 đọc danh sách món, giá bán, trạng thái và số nguyên liệu công
thức hiện hành → chọn món → P02 đọc thông tin món và công thức cho ngày Store hôm
nay → chọn “Xem tồn kho nguyên liệu” → FE chuyển sang Kho và dùng V01 với các
ingredient_id nhận được. P02 không trả lô/giá nhập/tồn kho hoặc purchase suggestions.
Đơn vị nguyên liệu trong công thức là đơn vị canonical của chính nguyên liệu đó;
UI hiển thị nhãn dễ đọc nhưng không đổi số đo.

Chưa có Menu thì FE dùng CTA nhập dữ liệu sẵn có của FE gốc. Nhập dữ liệu có trách
nhiệm tạo facts theo hợp đồng import và quyền ghi từng nhóm, không coi P01/P02
là write. Đọc công thức rỗng/thiếu không phải tự tạo công thức, không tự chạy solver.

Scope ban đầu là đọc dữ liệu/liên kết Kho; wording giới hạn theo FE0 của lượt
đầu là lịch sử. Theo yêu cầu mới, mục12 review workflow đổi hiệu lực công thức:
khách sửa lịch tương lai có preview/audit, không phải nhờ developer sửa DB. FE0
chỉ nguồn đối chiếu, không giới hạn chức năng. Không mở generic Ingredient/Product
CRUD, đổi đơn vị, chỉnh sales/kho hoặc sửa công thức hồi tố.

<a id="endpoints"></a>
## 2. Endpoint FE gốc → giữ/gộp/sửa/bỏ/thêm

Routes tương đối với `/api/v1`. IDs dưới đây lấy đúng từ FE gốc.

| Endpoint gốc | Quyết định design | Lý do / thay đổi |
| --- | --- | --- |
| P01 `GET /stores/{store_id}/products` | GIỮ ID/route, SỬA projection | Thêm selling_unit/SKU; giá bán MoneyText; giải nghĩa active/paused và ingredient_count theo recipe/ngày/quyền. Không dùng totals trang thay totals Store. |
| P02 `GET /stores/{store_id}/products/{product_id}` | GIỮ ID/route, SỬA projection | Recipe canonical có version, from/to, yield_unit và process_loss_rate; nguyên liệu có base_unit/active/expiry_tracking. Không gửi nullable yield/effective dates giả vì canonical backend yêu cầu known values. |
| V01 `GET /stores/{store_id}/inventory` | GIỮ liên kết, không thiết kế lại Kho | P02 cung cấp ingredient IDs; V01 đã có repeated ingredient_id và missing_ingredient_ids. Missing row không phải stock zero. |
| V02–V04 | NGOÀI CỤM | Lot detail/history thuộc Kho, không gộp vào công thức. |
| I*/M* | DEPENDENCY, không đổi route | Import là đường đưa dữ liệu vào từ FE hiện có; mutation/approval mapping được review ở cụm import. |
| Endpoint nguyên liệu/catalog độc lập | KHÔNG THÊM | Luồng hiện có đã đọc nguyên liệu của recipe tại P02 và tồn kho qua V01. Chưa có ingredient picker/editor/search catalog độc lập cần API riêng. |
| Generic CRUD | KHÔNG THÊM | Không có responsibility mới chỉ vì có bảng DB. |
| Recipe timeline/đổi hiệu lực | THÊM N20–N22, mục12 | Workflow rõ: xem lịch → preview before/after → xác nhận đóng/mở kỳ tương lai atomic; không sửa DB thủ công. |

Không bỏ/gộp P01/P02: summary list và selected detail là hai trách nhiệm/lazy reads
khác nhau. Không thêm ID giả từ FE. Tổng số endpoint mới trong cụm hiện hành: **3** (N20–N22); 0 là số lịch sử của lượt chỉ đọc.

<a id="current"></a>
## 3. CURRENT FACT — đối chiếu source/tests, không chứng nhận WIP

| Thành phần đã đọc | Behavior có căn cứ trên filesystem | Giới hạn |
| --- | --- | --- |
| `app/main.py`; `app/api/health.py` | Chỉ đăng ký health; chưa P01/P02/catalog HTTP. | Không authentication/permission enforcement cho cụm. |
| `app/models/product.py`, `ingredient.py`, `recipe.py`, `recipe_line.py` | Store-scoped identity/SKU; Product.price nullable; active metadata; recipe/date/yield/loss và unit witness FKs. | ORM fields không tự là update/lifecycle service. Không version public catalog/ETag. |
| `app/application/contracts/catalog.py`; `use_cases/catalog.py` | Internal Product/Ingredient create/get; scoped lookup; nullable SKU/price; typed by-value output. | Không list/search/pagination API, update/deactivate hoặc actor auth. |
| `app/application/contracts/recipe.py`; `use_cases/recipe.py`; `repositories/recipe.py` | Atomic header+lines; explicit integer version; nonoverlap; get_active(date) inclusive; empty lines được lưu. | Không auto-close, sửa row cũ, backdated correction workflow hoặc version-history HTTP. |
| `app/application/_validation.py` | require_unit so chuỗi chính xác; require_product/load_ingredient kiểm Store/existence. | Không kiểm actor; existence không đồng nghĩa active check. |
| `app/domain/demand/bom.py`, `arithmetic.py` | Dated recipe expansion; whole-yield/loss formula; gaps/empty recipe; precision50 contribution boundary, exact sums của exported contributions. | Không ghi tiêu hao inventory thật; không unit conversion. |

Evidence tests đã **đọc**, không chạy: `tests/unit/test_application_contracts.py`
(exact labels/nullable facts); `tests/integration/test_application_paths.py`
(Product scope/fresh read, recipe temporal read); `tests/integration/test_operational_paths.py`
(Ingredient scope, recipe atomicity/no autoclose/unit mismatch); `tests/unit/test_bom.py`
(whole-yield/loss, inclusive switch, missing/empty recipe); schema tests tại
`tests/integration/test_catalog_recipe_schema.py`. File schema test có WIP từ phiên
khác: chỉ đọc, không nhận là verification mới của task này.

Runtime notes trong docs/ADRs có các câu cũ như “Decision executor NOT IMPLEMENTED”
trong DOMAIN_MODEL dù sections/capture pipeline mới đã tồn tại. Đây là thông tin
lịch sử cần đọc theo slice/time, không chứng minh HTTP có sẵn. Không sửa tài liệu
trạng thái hoặc WIP để che drift. Internal S3.6.4 persistence không được dùng làm
bằng chứng public catalog/auth đã verified; task này không chạy/chứng nhận slice đó.

<a id="semantics"></a>
## 4. Nguyên liệu, đơn vị, sản phẩm và công thức

### 4.1. Đơn vị và identity — ACCEPTED DECISION hiện hành

Theo S1.7 trong [APPLICATION_CONTRACTS](references/features/APPLICATION_CONTRACTS.md), canonical
RecipeLine.unit, InventoryLot.unit và SupplierTerm.unit phải bằng Ingredient.base_unit
chính xác. Product.selling_unit là đơn vị đầu ra recipe và quantity sales/forecast
của Product đó. Canonical labels có thể là `g`, `ml`, `cup` nhưng không có catalog
enum hoặc conversion engine đã accepted. Không trim/case-normalize canonical unit
hoặc SKU của existing records; không dùng UI alias làm dữ liệu canonical.

Ví dụ nguyên liệu Milk có base_unit `ml`, recipe ghi `180 ml`, stock cũng là `ml`:
đọc đúng các giá trị đó. Không tự trả stock bằng `l` hoặc cho phép recipe `l` vì
“cùng thể tích”. `g` → `kg`, `ml` → `l`, piece → cup, mass → volume đều chưa là
conversion behavior hiện hành. FE có thể đổi cách viết nhãn nhưng không nhân/chia
quantity. Source unit khác canonical cần mapping/normalization có evidence và rule
được duyệt ở import, không LLM chọn hệ số hoặc P02 chữa facts lúc đọc.

UUID xác định entity; names không unique. SKU nullable, unique/case-sensitive trong
Store khi có; Ingredient và Product có namespaces SKU riêng. Không join theo tên,
không dùng SKU/null name làm recipe identity hoặc stock lookup.

### 4.2. Status và giá — policy nền + TECHNICAL CHOICE adapter

Product.active=true → wire `status=active`; false → `status=paused`, khớp hai nhãn
FE gốc. Đây là projection boolean, không tuyên bố có lịch ngừng bán, ngày pause,
lifecycle archive hoặc writer đổi trạng thái. P01 mặc định liệt kê cả hai; filter
chỉ tác động items, summary vẫn toàn Store. P02 vẫn đọc được paused Product theo ID
và quyền hiện hành, không coi paused là resource không tồn tại.

Ingredient trả `active:boolean` là metadata của nguyên liệu, không đồng nhất với
Product.status. Existing inactive Ingredient vẫn là identity tham chiếu trong
recipe; read không bỏ line đó hoặc xóa stock. Internal capture không có chứng cứ
chặn Ingredient chỉ vì active=false; không tự đặt rule “tất cả recipes bị khóa”.
Workflow ngừng nguyên liệu và cách xử lý dependencies chưa được giao, không thêm
writer hoặc suy ra semantics mới từ cờ này.

Giá bán là giá niêm yết hiện tại cho một selling_unit, Store.currency, nullable khi
chưa biết; zero là giá zero thật. Không trả giá vốn/cost/biên lợi nhuận hoặc lấy
supplier price làm selling_price. Quyền xem Menu bao gồm giá niêm yết đã chốt ở mục 11.

### 4.3. Recipe và ngày — ACCEPTED DECISION hiện hành

Recipe.version là integer >0, unique theo Product; không phải opaque ETag.
Recipe effective_from/effective_to là DATE inclusive; null to nghĩa open-ended.
Ngày hôm nay tính theo timezone Store tại đầu request, không timezone browser.
P01/P02 dùng cùng ngày định nghĩa này; không gửi dates tùy ý hoặc fallback recipe
gần nhất nếu hôm nay không được covered. Chỉ có 0 hoặc 1 recipe đúng ngày; overlap
là integrity error, không chọn version lớn nhất.

yield_quantity >0: output của toàn mẻ trong Product.selling_unit. Quantity mỗi line
>0 là nguyên liệu cho **toàn yield**, không mặc nhiên một serving. process_loss_rate
là tỷ lệ recipe-level trong [0,1), không percent display và không per-line loss.
Định nghĩa hiện hành: nhu cầu ingredient = demand_product × line_quantity /
yield_quantity / (1−process_loss_rate). Không cộng loss lần nữa vì thấy tên yield.
Ví dụ yield10 cup, milk1000 ml, loss0.2, demand40 cup → 5000 ml. Đây là minh họa
formula/test fixture, không số liệu quán hoặc forecast quality.

Recipe canonical header không có yield_unit riêng: wire yield_unit được derive
từ selling_unit của Product cùng snapshot. from/yield/loss không nullable canonical;
không áp nullable illustration FE gốc lên canonical schema. Không có recipe:
recipe=null. Có header nhưng lines=[]: known empty, count0, khác missing recipe;
không ready cho BOM, kể cả forecast demand=0. Line unit không khớp base_unit hoặc
yield không hợp lệ không được biến thành recipe=null nhằm giấu corruption.

CURRENT FACT: internal create_version chỉ thêm version với period không chồng lấn;
Recipe1 open-ended chặn Recipe2 overlap, không update/auto-close. Mục12 là workflow
public mới được giao: đổi calendar explicit có preview/confirmation/audit, giữ
content version và ngày≤hôm nay, không tự đóng khi tạo/import newversion hoặc GET.

<a id="conventions"></a>
## 5. Public conventions — PROPOSAL / TECHNICAL CHOICE

Dùng ResourceId UUID canonical lowercase, Version opaque, Timestamp UTC RFC3339,
MoneyText và notifications/envelope từ mục 2 contract Planning. Giá bán phải là
MoneyText/null, thay integer tiền của FE v0. Không number rounding, không VND-only
giả nếu Store.currency khác. Backend precision vượt public representation đã chốt
thì trả lỗi projection, không truncate canonical values.

QuantityText là unsigned plain decimal string `^(0|[1-9][0-9]*)(\.[0-9]+)?$`, finite,
không exponent/NaN/Infinity/sign; trả exact stored value, không format ngăn cách.
PositiveQuantityText >0; LossRateText cùng representation và 0≤value<1. GET không
thêm fixed scale hoặc round công thức. MoneyText giữ bounds Planning; QuantityText
không gán bounds tiền lên canonical quantities. Public output có budget bytes
được kiểm ở boundary, không cắt recipe lines thành response trông như đầy đủ.

Envelope success `{data,meta,error:null}`; failure `{data:null,meta:{},error:{code,
message,details}}`. meta.request_id luôn có ở success. Nullable counts/price không
được biến thành zero. Notifications dùng `{code,message,details}`; không raw SQL.
data_version là opaque version của projection snapshot nguồn, không ETag recipe
integer hoặc dựa duy nhất max(updated_at). Quyền ảnh hưởng payload nên không cache
chia sẻ: `Cache-Control: private, no-store`; FE cache theo Store/actor/quyền và xóa
khi đổi Store/revocation. Không HTTP304 hoặc optimistic writes trong read-only scope.

meta.observed_at là thời điểm request snapshot, không giả “lần sửa dữ liệu gần nhất”.
meta.updated_at là nguồn thay đổi gần nhất đã xác minh/null nếu chưa có source
provenance; không dùng observed_at làm update time. data_version REQUIRED nonnull
khi reader đã wired; thiếu coherent version/loader không trả fake successful data.

<a id="p01"></a>
## 6. P01 — đọc Menu và summary

`GET /stores/{store_id}/products`; không body.
Query allowlist: `q` optional 1..200 ký tự sau trim; `status=active|paused` optional;
`limit` integer default50, 1..100; `cursor` opaque; `sort=name|-name|selling_price|
-selling_price` default name. SKU không được search theo tên bằng implicit join;
q khớp product name theo Unicode case/diacritic-insensitive Vietnamese, including
Đ/đ → d, không mutate stored name. Unknown/repeated singleton query hoặc enum sai
trả422. Price null luôn last, tie-break UUID tăng dần. status filter không làm mất
summary counts paused/active.

Pagination keyset có snapshot/data_version trong cursor, gắn Store/filters/sort;
catalog/version đổi giữa các pages trả409 LIST_VERSION_CHANGED, FE bắt đầu lại.
Không trả các pages khác version như một list nhất quán. total_count là số toàn
bộ filtered result của read snapshot; summary counts toàn Store, nonnegative.
Không tính total từ items.length. Empty Store count0/items=[] khác filtered empty.

data REQUIRED `summary:{product_count,active_count,paused_count}` và `items:ProductRow[]`.
ProductRow keys: product_id, sku:string|null, name, selling_unit, selling_price:
MoneyText|null, currency, status, ingredient_count:integer|null,
ingredient_count_availability:available|missing_recipe|forbidden.
Ingredient count = số Ingredient distinct trong recipe effective hôm nay; uniqueness
lines khiến bằng line count. Có empty recipe count0/available; không recipe null/
missing_recipe. Không có recipe/ingredient read permissions: null/forbidden, không
lộ số lượng qua sorting/search/summary. Giá bán vẫn đọc được với menu.read theo mục 11.

Ví dụ **SYNTHETIC TARGET DESIGN**, không runtime response:

```json
{
  "data": {
    "summary": {"product_count": 1, "active_count": 1, "paused_count": 0},
    "items": [{
      "product_id": "00000000-0000-4000-8000-000000000010",
      "sku": "MATCHA-01", "name": "Matcha Latte", "selling_unit": "cup",
      "selling_price": "49000", "currency": "VND", "status": "active",
      "ingredient_count": 1, "ingredient_count_availability": "available"
    }]
  },
  "meta": {
    "request_id": "req-menu-demo", "observed_at": "2026-10-09T03:00:00Z",
    "as_of_date": "2026-10-09", "timezone": "Asia/Ho_Chi_Minh",
    "updated_at": "2026-10-08T02:00:00Z", "data_version": "catalog-demo-1",
    "pagination": {"limit": 50, "next_cursor": null, "total_count": 1}, "warnings": []
  }, "error": null
}
```

P01 không trả recipe nội dung, lots, sales histories, stock forecast, stock-derived
status, margin/cost hoặc ingredient name search. Product.active không bị suy ra từ
có bán hôm qua/stock=0/thiếu recipe; paused không tự mất khỏi summary.

<a id="p02"></a>
## 7. P02 — sản phẩm và công thức hiện hành

`GET /stores/{store_id}/products/{product_id}`; không body/query. P02 là full read
product + recipe, cần đầy đủ quyền mục 8; thiếu quyền thì chặn response, không
trả recipe=null để giả không có recipe. Không thêm query history/as_of/edit/new
recipe chỉ vì repository có method. P01 vẫn usable cho actor chỉ có menu.read.

data REQUIRED product_id, sku, name, selling_unit, selling_price, currency, status,
recipe:Recipe|null. Product shape và price/status semantics như P01, không suy ra
ingredient count từ phiên P01 khác version.

Recipe REQUIRED recipe_id, version:positive integer, effective_from:DATE,
effective_to:DATE|null, yield_quantity:PositiveQuantityText, yield_unit:string,
process_loss_rate:LossRateText, ingredients:RecipeIngredient[]. Không field
effective_date alias trùng; FE chuyển effective_from sang label cũ. Version chọn
theo ngày, không latest/highest recipe version.

RecipeIngredient REQUIRED recipe_line_id, ingredient_id, ingredient_name,
ingredient_sku:string|null, ingredient_active:boolean, expiry_tracking:boolean,
base_unit:string, quantity:PositiveQuantityText, unit:string. unit=base_unit exact;
không trả Ingredient costs. Order ingredient_id UUID tăng dần, ổn định; không
duplicate ingredients. Các flags là current metadata trong cùng read snapshot,
không facts lịch sử tại effective_from.

Ví dụ **SYNTHETIC TARGET DESIGN**:

```json
{
  "data": {
    "product_id": "00000000-0000-4000-8000-000000000010",
    "sku": "MATCHA-01", "name": "Matcha Latte", "selling_unit": "cup",
    "selling_price": "49000", "currency": "VND", "status": "active",
    "recipe": {
      "recipe_id": "00000000-0000-4000-8000-000000000020", "version": 1,
      "effective_from": "2026-10-01", "effective_to": null,
      "yield_quantity": "1", "yield_unit": "cup", "process_loss_rate": "0",
      "ingredients": [{
        "recipe_line_id": "00000000-0000-4000-8000-000000000030",
        "ingredient_id": "00000000-0000-4000-8000-000000000040",
        "ingredient_name": "Sữa tươi", "ingredient_sku": "MILK-01",
        "ingredient_active": true, "expiry_tracking": true, "base_unit": "ml",
        "quantity": "180", "unit": "ml"
      }]
    }
  },
  "meta": {
    "request_id": "req-product-demo", "observed_at": "2026-10-09T03:00:00Z",
    "as_of_date": "2026-10-09", "timezone": "Asia/Ho_Chi_Minh",
    "updated_at": "2026-10-08T02:00:00Z", "data_version": "catalog-demo-1", "warnings": []
  }, "error": null
}
```

Không có version effective hôm nay:200 recipe=null, warning RECIPE_NOT_AVAILABLE
với impact “Không có công thức hiệu lực tại ngày đọc”; không 404 cho Product có thật.
Có header với ingredients=[]:200 Recipe đầy đủ, warning EMPTY_RECIPE. Không lấy
recipe tương lai hoặc quá khứ lấp chỗ trống. P01 count và P02 recipe phải reconcile
trong cùng version/ngày/quyền; nếu version khác FE refresh trước đối chiếu.

“Xem tồn kho nguyên liệu” lấy IDs từ ingredients, gọi đúng V01/repeated ingredient_id
qua FE route adapter. Missing ingredients trong stock result nhận qua
missing_ingredient_ids; không fake quantity0 hoặc tạo stock lot. Recipe missing/empty
không có IDs để điều hướng. Thiếu inventory.read thì chặn Kho, không tự grant vì
đã đọc được recipe; không đưa lots/cost vào P02 để bypass quyền.

<a id="permissions"></a>
## 8. Permissions, validation và errors

**ACCEPTED DECISION:** Owner/Staff theo Store, quyền read/write riêng, deny-by-default,
recheck session/Store/membership mỗi request; resource ngoài scope không leak.
Không Owner key/one-time approval tự động. Catalog grant names dưới đây là
**PROPOSAL action mapping**, chưa enum catalogue/runtime grants:

| Read responsibility | Quyền boundary |
| --- | --- |
| P01 product fields/summary/retail selling_price | menu.read |
| P01 ingredient_count | recipe.read + ingredient.read, ngoài menu.read; nếu thiếu count=null/forbidden |
| P02 product + full recipe + Ingredient metadata | menu.read + recipe.read + ingredient.read; thiếu bất kỳ quyền nào 403 toàn response |
| P02 → Kho/V01 | inventory.read theo contract Kho, không tự cấp từ menu/recipe |
| Write import | Quyền ghi Product/Ingredient/Recipe của batch theo auth/import, không được suy ra từ menu.read |

Không budget.read hoặc procurement.cost.read chỉ để xem giá bán niêm yết. P2
Planning không bị nới: actor vẫn cần toàn bộ quyền tiền/planning tương ứng ở C01–C03.
P01 giới hạn redaction ở count scalar với availability rõ; không trả recipe IDs,
dates/yield/ingredient names hoặc derived counts cho actor thiếu quyền. P02 dùng
whole-response denial để không có partial recipe làm FE hiểu là thiếu dữ liệu.

GET không Idempotency-Key/If-Match bắt buộc, không write/retry side effects. Một
request đọc Product/recipe/Ingredient/summary nhất quán trong read snapshot, đóng
Session trước serialize/return; không solver/LLM/filesystem generation trong read.
Không claim ORM FK là actor authorization hoặc code list hiện tại là paging API.

| HTTP / code | Điều kiện và xử lý |
| --- | --- |
| 400 INVALID_REQUEST | GET JSON body không được nhận; request syntax hỏng. |
| 401 UNAUTHENTICATED | Session không hợp lệ. |
| 403 PERMISSION_DENIED | Thiếu quyền trong Store được phép biết; approval_request_allowed=false cho reads này đến khi allowlist được duyệt. |
| 404 RESOURCE_NOT_FOUND | Store/Product không tồn tại hoặc ngoài authorized scope; same shape/message, không lộ ownership. |
| 409 LIST_VERSION_CHANGED | Cursor snapshot/version không còn current; reset pagination, không ghép trang. |
| 422 INVALID_FILTER / INVALID_CURSOR / INVALID_RESOURCE_ID | Query/type/enum/sort/cursor signature hay scope sai; UUID sai canonical. |
| 503 CATALOG_READ_UNAVAILABLE | Loader/snapshot không khả dụng; không trả Store empty giả. |
| 503 CATALOG_INTEGRITY_UNAVAILABLE | Overlap/foreign graph/missing referenced Ingredient/unit mismatch/invalid canonical value; không bịa recipe hoặc bỏ line lỗi. |
| 503 CATALOG_REPRESENTATION_UNAVAILABLE | Canonical facts vượt representation/response capacity, không round/truncate để success. |

Errors không raw SQL/trace/cross-Store entity. No recipe/nullable price không phải
503. Warning thiếu recipe/empty chỉ gửi khi actor có quyền biết facts đó.
Error shape ví dụ, **không phải lỗi runtime vừa quan sát**:

```json
{
  "data": null, "meta": {},
  "error": {
    "code": "PERMISSION_DENIED", "message": "Bạn chưa có quyền xem công thức.",
    "details": {"approval_request_allowed": false}
  }
}
```

<a id="effects"></a>
## 9. Nhất quán với sales, kho, forecast và Run đã lưu

| Dữ liệu / thay đổi | Policy đã có / boundary của cụm |
| --- | --- |
| Recipe dated switch trong horizon7 | Pipeline chọn từng ngày inclusive; P02 chỉ recipe hôm nay, không dùng một recipe P02 cho cả 7 ngày. C02 không nhận recipe facts do FE gửi. |
| Product đang paused | P01/P02 vẫn đọc identity; Planning capture active menu theo contract đã chốt. Không xóa SalesDaily/ForecastRun/DecisionRun vì Product không trong scope mới. |
| Active Product thiếu recipe/empty/recipe gap | Read vẫn giải thích được missing/empty; Planning exclusions/computed scope theo contract hiện hành. Menu read thành công không phải can_generate=true. |
| Ingredient inactive | Read giữ line/identity/metadata; không xóa tồn kho hoặc tự đổi BOM/serving. Workflow deactivate dependencies không nằm trong public surface này. |
| Đổi tên/giá niêm yết qua workflow được giao sau | Read projection là current facts; không suy ra historical selling price/revenue/margin từ Product.price hiện tại. SalesDaily hiện chỉ canonical quantity/date/Product, không price history. |
| Đổi base_unit/selling_unit | Cụm này không có writer cho thao tác này. Không đổi nghĩa quantity cũ qua read adapter; SalesDaily không lưu selling_unit riêng nên đặc biệt không suy ra có thể sửa Product.selling_unit an toàn. Migration/conversion/correction có hệ quả phải có task/decision riêng nếu mở workflow. |
| Bật expiry_tracking với stock cũ | Đây chỉ là metadata read. Không phát minh expiry cho old lots hoặc chuyển missing expiry thành known; không có toggle writer được duyệt ở cụm này. |
| Recipe correction có ngày quá khứ | Writer nội bộ chỉ new version không overlap; không overwrite/auto-close. Không retroactively ghi tiêu hao kho hoặc sửa SalesDaily; correction workflow riêng chưa tồn tại. |
| Forecast và recipe/price | Recipe/stock/supplier/budget changes không tự đổi forecast identity theo Planning; forecast quantity dùng exact captured selling_unit. Không thêm training/reuse mutation trong P01/P02. |
| Run đã nhận/lưu | ADR-011 và Planning: dùng retained config/input/result; không re-query current P02 để viết lại recipe/yield/units/cost của Run. Tên/labels hiện tại của Menu không thay retained facts của Run. |

Không dùng P02 current recipe để khẳng định recipe thực tế mà nhân viên đã dùng
ở ngày bán quá khứ. Calendar effective date không là availability/knowledge history.
BOM lý thuyết không phải actual inventory depletion; không gọi GET rồi trừ tồn kho.
Menu data_version khác Run snapshot identity; FE không mix current stock với capture
của Run. Existing immutable Run policy không phải “toàn bộ mutable catalog rows đã
có DB immutability enforcement”.

<a id="verification"></a>
## 10. Implementation backlog, acceptance và verification

### 10.1. Backlog — không phải câu hỏi sản phẩm

Public typed P01/P02/readers, auth enforcement/catalogue action mapping, coherent
catalog data_version, Vietnamese search/keyset pagination, shape adapter FE,
permission-aware count projection, snapshot read và integrity error mapping chưa
triển khai trong public HTTP. Không tạo infrastructure hoặc generic repository
abstraction chỉ để đáp ứng contract. SQLAlchemy synchronous Session theo ADR-007.

Import identity/normalization/correction và stock read/statuses thuộc cụm tương
ứng, không giả supported. Không backlog write CRUD tự động vào roadmap; nếu có
luồng edit độc lập được giao sau thì review policy/endpoint ngay trong file này,
không tách file theo endpoint/lượt. Không chọn schema migration/table layout ở đây.

### 10.2. Acceptance cases — DESIGN SPECIFICATIONS, chưa chạy

1. P01 unfiltered summary reconciles whole Store; filter/search/page count đúng;
   active→paused adapter không mất identity/history, price=null khác zero.
2. Read paused Product bằng P02 được khi đủ quyền; không Product404 vì thiếu recipe.
   Empty recipe có count0/EMPTY_RECIPE; missing recipe countnull/recipe=null.
3. Inclusive today selection theo Store timezone; effective_to hôm qua không current;
   future recipe không fallback; overlap 503, không chọn max version.
4. Yield/loss examples reconcile whole batch; unit=Ingredient.base_unit/yield_unit=
   Product.selling_unit exact; không kg/g/ml/l normalization hoặc float rounding.
5. P01 count forbidden không lộ recipe facts; P02 thiếu read permissions bị chặn
   toàn response; retail selling_price có menu.read, costs/budget không xuất hiện.
   Foreign Store/IDs đồng nhất404; membership revoked chặn refresh/read.
6. P02 Ingredient flags/name/SKU cùng snapshot; known zero khác missing stock;
   cross-link V01 đúng IDs, không inventory grant từ recipe read.
7. Page cursor bound Store/filter/sort/version; tamper/filter mismatch422, catalog
   change409; no-store/filter-empty counts không bị coi cùng một trạng thái UI.
8. Coherent P01/P02 version/as_of_date/count reconcile; integrity malformed source
   fail closed, không drop line hoặc chế data. GET không DB writes/LLM/solver.
9. Canonical tests sau implementation cần targeted boundary tests và persistence
   snapshot coverage; only shelfcash_test và fresh-session assertions nếu có writers
   trong slice được giao. Không suy GET success thành write/persistence evidence.
10. Run snapshot cũ giữ recipe/unit/price facts đã capture, không dùng current reads
    sửa package; sales quantities/revenue không được viết lại do Menu read.

### 10.3. Task notes, phạm vi và verification lượt này

Trước viết đã đọc AGENTS/auth, FE đúng file, planning contract, models/contracts/
use cases/repositories/routes/tests nêu mục 3, ADR-008/010/011/012 và S1.7 semantics.
Đã quan sát git status: có nhiều WIP S3.6.4, bao gồm schema tests liên quan; chỉ đọc.
Không sửa status/ADRs/contract Planning/FE gốc hoặc các file ngoài scope.

Ảnh hưởng design: BE public reads/auth, FE Menu/recipe/Kho adapter; ML/Data giữ
forecast/BOM semantics, demo examples synthetic. Rollback bỏ đúng file mới này;
không reset/clean/restore source của phiên khác. Không chạy tests/solver/DB,
migrations/OpenAPI runtime, không branch/commit/push/ZIP. Chỉ documentation checks.
Acceptance trên không runtime verified, không full regression passing claim.

Verification documentation-only vừa chạy:

- Python qua `.\.venv\Scripts\python.exe -`: PASS UTF-8/whitespace, parse 3 JSON
  examples, 11 anchors duy nhất/mục lục đúng đích, 4 links tài liệu có thật, 3
  route sử dụng khớp FE gốc; không speculative write route.
- `git diff --check`: exit0 cho tracked WIP; tài liệu mới untracked được script
  trên kiểm whitespace riêng, không suy đây là kiểm thử implementation.
- `git status --short -- docs/CATALOG_MENU_RECIPE_API_CONTRACT_VI.md`: một file
  contract mới, không commit hoặc artifact ZIP.

Coverage là syntax/examples/references/endpoint matching và consistency review,
không API/auth/pagination/persistence acceptance, không PostgreSQL hoặc runtime
performance evidence. Các cases 10.2 là yêu cầu kiểm trong slice implementation sau.

<a id="decisions"></a>
## 11. Quyết định nghiệp vụ đã hỏi và kết quả

Tình huống: Staff có quyền xem Menu mở Matcha Latte. Product.price hiện stored
nhưng chưa public auth; auth contract chưa chốt retail price visibility.
Khuyến nghị: menu.read bao gồm giá niêm yết, giúp khách thấy thông tin món; không
grant xem giá nhập/giá vốn. Alternative cần separate retail-price read permission
và giá unavailable riêng, làm Menu partial với actor không có quyền đó.

**ACCEPTED DECISION — sản phẩm, 09/10/2026:** người dùng trả lời trực tiếp
“Xem Menu được thấy giá bán niêm yết”. Áp P01/P02 tại mục 6–8; không tạo grant
procurement.cost.read/budget.read hoặc nới P2 Planning.

Không còn vấn đề sản phẩm cần duyệt trong public read scope này; **0 vấn đề quan
trọng bị để lại chưa hỏi**. Unit exact, dated nonoverlap/no autoclose, Run snapshot
và không tác động kho/sales đã có authority, không hỏi lại. Workflow đổi hiệu lực được giao sau lượt chỉ đọc và đã review tại mục12. Các luồng
conversion/deactivate/correction hồi tố khác chưa được duyệt, không tự coi là policy
đã chốt cho tương lai. Nếu scope mới cần chúng, tình huống/hệ
quả/authority được review riêng trong chính tài liệu này trước design implementation.

<a id="recipe-effectivity"></a>
## 12. Workflow đổi hiệu lực công thức — v1, chỉ tương lai

**ĐÃ CHỐT / ACCEPTED DECISION sản phẩm 09/10/2026:** người dùng chọn “Từ ngày
Store kế tiếp; chưa sửa lịch sử”. T=Store-local hôm nay ở mỗi mutation. Workflow
chỉ thay việc áp dụng từ T+1; không đổi toàn ngày T sau khi đã bán từ sáng, không
intraday timestamps hoặc apply hồi tố. Future scheduling không có worker activate:
lookup ngày theo calendar đã commit. Content cũ/yield/loss/lines không overwrite.

**CURRENT FACT**: RecipeUseCases.create_version/get_active, contracts Recipe và
RecipeLine, repositories/recipe.py; models/recipe.py có uniqueProductVersion,
inclusive daterange exclusion; tests/integration/test_operational_paths.py và
supplier_operational_constraints kiểm graph/date/nonoverlap. Chưa public calendar
reader/change/preview/audit/cancel applicability. [ADR011](references/adr/ADR-011-historical-run-immutability-snapshot-policy.md)
giữ Run snapshot. Source/tests chỉ được đọc, không tests vừa chạy hoặc WIP verified.
**TECHNICAL CHOICE** operations/calendar revisions bên dưới, không sửa acceptedADR.

### 12.1. Luồng và semantics

Khách mở món → xem timeline current/future/history → chọn ngày từ T+1 → soạn
nội dung version mới hoặc đổi lịch version tương lai → preview BEFORE/AFTER đầy
đủ dates, yield/loss/Ingredient quantities, warnings → khách xác nhận **các thay
đổi cụ thể** → commit atomic → refresh P01/P02/timeline/C01/R01. P02 hôm nay vẫn
công thức hôm nay; từ ngày mới lookup version đúng ngày, không chọn max version.

Ví dụ hôm nay09/10: v1 từ01/10 đếnnull; khách muốn v2 từ10/10. Request phải có
explicit v1 effective_to=09/10 và v2 effective_from=10/10. Client gửi mỗi v2 mà
không sửa period v1 thì preview blocker RECIPE_PERIOD_OVERLAP; server không tự đóng.
Tại ngày10/10 chỉ v2, ngày09/10 vẫn v1. Phiên bản nội dung và version calendar là
hai identity khác nhau; kỳ inclusive không dùng to exclusive gây lệch một ngày.

Mỗi Recipe content version immutable; sửa yield/loss/lines dù version chỉ ở tương
lai cũng tạo version mới/UUID mới. Đổi lịch là applicability, không thay content.
Có thể dời ngày future version, rút version chưa hiệu lực khỏi lịch, hoặc đóng/
mở lại phần **tương lai** của period cũ bằng operations explicit. Nội dung và audit
version rút vẫn đọc được, không DELETE. Không tái dùng UUID đã rút để overwrite
nội dung mới, không recycle số version. Version cũ có period bắt đầu quá khứ được
đổi effective_to nếu mọi ngày≤T vẫn cùng recipe identity/content/availability.

Rút future version không tự kéo dài version trước hoặc chọn version sau để lấp
khoảng trống. Nếu khách muốn tiếp tục công thức cũ thì phải gửi SET_PERIOD tương
ứng và xác nhận. Gaps được preview hiển thị RECIPE_GAP_WARNING/affected_dates,
khách phải acknowledge rõ; Planning xử lý missingrecipe/exclusions theo policy
đã chốt, không auto-pause Product hoặc fabricate recipe. Empty/invalid new recipe
không trở thành publishable nhờ acknowledgement.

### 12.2. Route đối chiếu và types

Không FE0 endpoint nào nhận sửa lịch: P02 read hôm nay; I05 import tạo data theo
approved mapping, không có editor/explicit period-change flow. Giữ P01/P02/I05;
ba routes mới chỉ phục vụ timeline/change, không CRUD từng RecipeLine.

| Nhãn / method / route | Responsibility |
| --- | --- |
| N20 GET /stores/{store_id}/products/{product_id}/recipe-schedule | Đọc timeline/current/future/unassigned contents và version để chỉnh lịch. |
| N21 POST /stores/{store_id}/products/{product_id}/recipe-schedule/changes | phase preview hoặc commit; preview immutable, atomic explicit calendar+newversion changes. |
| N22 GET /stores/{store_id}/products/{product_id}/recipe-schedule/changes/{change_id} | Mở lại preview, blockers/diff hoặc committed receipt/audit của change, không compute lại. |

ResourceId/Version/Timestamp/envelope theo Planning; QuantityText/PositiveQuantityText/
LossRateText theo mục5; Dates theo timezone Store. JSON unknown fields422. Idempotency
key UUID cho mỗi N21 phase; If-Match schedule_version cần cả preview/commit.
Content={recipe_id:UUID,version:positiveint,yield_quantity:PositiveQuantityText,
yield_unit:Product.selling_unit,process_loss_rate:LossRateText,
ingredients:array {recipe_line_id:UUID,ingredient_id,quantity:PositiveQuantityText,
unit:Ingredient.base_unit}}. Name/active metadata reads cùng catalog snapshot như
P02; content facts không gồm price/stock. Existing empty content vẫn đọc được;
newversion cần1..100 distinct Ingredient lines, exact known units, finitepositive
qty/yield và0≤loss<1. Inactive Ingredient warning INGREDIENT_INACTIVE, không tự
thay Ingredient hoặc khác policy readers/engine. Không convert unit trong editor.

ScheduleItem={content:Content,assignment:{effective_from:date,effective_to:date|null}|null,
state:past|in_effect|scheduled|unassigned}. state derive date/assignment; unassigned
là content giữ nhưng không thuộc active calendar. Reader engine chỉ materialize
assigned ranges, cùng contract Recipe với known dates; P02 canonical dates không
bị đổi thànhnull. Current DB headers không hỗ trợ unassigned/canceled schedule;
persistence adaptation/migration để giữ content/history và applicability phải
freeze trong slice triển khai riêng. Nonoverlap của **calendar đang áp dụng**,
uniqueness identity/version và graph integrity vẫn giữ; không pretend schema hiện
có đã hỗ trợ việc rút version. Không chốt DB layout hoặc lén sửa accepted ADR.

N20 query status=past,in_effect,scheduled,unassigned defaultin_effect,scheduled;
limit50/max100,cursor,sort=effective_from,version (null assignments cuối, UUIDtie),
optional from_date/to_date ordered filterperiodintersect. Response
{store_id,product_id,as_of_date,schedule_version,catalog_version,
items:ScheduleItem[],minimum_change_date:T+1}; ETag schedule_version,
meta pagination exacttotalcount/null nếu chưa đủ và request_id. MissingProduct/
crossStore404; paused Product vẫn có timeline, không auto-activate menu. Pages
pin calendar+catalog versions/actor/filter, đổi dữ liệu409 LIST_VERSION_CHANGED,
không silently mix pages. Read past/unassigned để audit không grant sửa lịch sử.

### 12.3. N21 preview request/response

Preview body {phase:"preview",new_recipes:NewRecipe[],operations:ScheduleOperation[],
reason:string1..1000}. NewRecipe={client_reference:string1..64 unique,
yield_quantity,yield_unit,process_loss_rate,ingredients:[{ingredient_id,quantity,unit}]};
không recipe_id/version/namePrice. Ops union:

- {kind:"SET_PERIOD",recipe_ref:{recipe_id:UUID}|{new_recipe_reference:string},
  effective_from:date,effective_to:date|null};
- {kind:"WITHDRAW_FUTURE",recipe_ref:{recipe_id:UUID}}.

Mỗi recipe ref tối đa một operation; mọi NewRecipe phải được SET_PERIOD, không
create content orphan.≤20newversions/100ops, request≤64KiB; toàn outcome calendar
có≤1000futureassignments để preview bounded. Overflow/resource limits block,
không truncate. RecipeIDs cùng Product/Store, no rename/unit/Product activation.

Preview transaction chỉ giữ staging/reserved UUIDs+versions/digest, không canonical
calendar/content writes. Max+1 nội dungversion được **đề xuất** trong preview,
commit CAS/uniqueness giữ chỗ; concurrent allocation làm PREVIEW_STALE, không dùng
client gửi version hoặc đổi UUID/values trong commit lặng lẽ. Sorted operations/
lines canonical hóa numeric value exact, không display rounding.

DateRange={from_date:date,to_date:date|null}, inclusive, null là không có ngày kết thúc.
RecipeSchedulePreview=Response200 {change_id,status:"preview_ready"|"blocked",preview_digest:Version,
store_id,product_id,evaluated_at,as_of_date,minimum_change_date,schedule_version,
catalog_version,before:ScheduleItem[],after:ScheduleItem[],changed_ranges:DateRange[],
new_contents:Content[],required_permissions:string[],blockers:Notification[],
warnings:Notification[],required_warning_acknowledgements:string[],can_commit:boolean}.
Only diff domain relevant dates/content rows; full affectedtimeline đủ thấy overlaps/
gaps, không chỉ mộtnewrow. Canonical blockers vẫn trả previewblocked200 để FE sửa,
syntax/type/foreignIDs theo generalerrors; no fake successcommit. Preview retained
không default expires tự commit; validity bởi day/CAS/inputrights, không hiddenTTL.

Example preview request, synthetic Storedate09/10, oldrecipe01/10→null:

```json
{"phase":"preview","new_recipes":[{"client_reference":"recipe-next","yield_quantity":"1","yield_unit":"cup","process_loss_rate":"0","ingredients":[{"ingredient_id":"00000000-0000-0000-0000-000000000003","quantity":"180","unit":"ml"}]}],"operations":[{"kind":"SET_PERIOD","recipe_ref":{"recipe_id":"00000000-0000-4000-8000-000000000020"},"effective_from":"2026-10-01","effective_to":"2026-10-09"},{"kind":"SET_PERIOD","recipe_ref":{"new_recipe_reference":"recipe-next"},"effective_from":"2026-10-10","effective_to":null}],"reason":"Thay công thức từ ca kinh doanh ngày mai"}
```

### 12.4. Validation và commit

Validate outcome calendar inclusive/nonoverlap theo Product, positiveversion,
knownforeignrefs/units, effective_to≥from, dates/UTC overflow; loại affected
interval ngày≤T thì **before/after recipe identity/content/availability phải giống**.
Newversion/newassignment từT+1; currentassignment bắt đầu quá khứ giữ from,
closing current atT được vì ngàyT vẫn sameRecipe; không chỉ validate “mọi from≥T+1”
rồi chặn closure hợp lệ. WITHDRAW_FUTURE chỉ assignment có from>T, không rút
recipe đã từng áp dụng. Existing futureperiod có thể dời/withdraw, nhưng không
được chèn vào≤T. Entirepast recipes không mutate dưới guise futureoperation.

Commit body {phase:"commit",change_id,preview_digest,confirm:true,
acknowledged_warning_codes:string[]}; không operations/content/reason mới (đổi
reason thì preview mới). If-Match scheduleversion gốc; Idempotency-Key khác phase
preview. Warning acknowledgement exact computed list, không unblock overlap,
auth/history/units/negativeqty. Warning gap hiển thị periods kết quả, không
estimate lostsales/costrisk hay solver proof bằng preview.

RecipeScheduleReceipt=Response200 {change_id,status:"committed",preview_digest,store_id,product_id,
committed_at,schedule_version_before,schedule_version_after,
created_recipe_ids:UUID[],affected_recipe_ids:UUID[],audit_reference:UUID,
updated_resources:{menu:true,recipes:true,inventory:false,sales:false,forecast:false,
retained_runs:false},warnings:Notification[]}. No-op toàn timeline/content giữ
scheduleversion, changed=false/arrays[],updated menu/recipesfalse; receipt mới
vẫn recorded. Response có changed:boolean required cả changed/no-op.

Trong transaction commit: recheck actor/membership/actions+Storedate, catalogunits/
Product/versionreadset → lock Productcalendar/versionreservation → verify pinned
diff ngày≤today không đổi + fullfuture nonoverlap → create immutable newcontent,
apply explicit applicabilityoperations → increment calendar/version → append
before/after/reason/actor/preview/sourceaudit+idempotencyreceipt → commit. Anyfailure
rollback whole, không oldclosed+newmissing. Snapshotdate đổi làm operation ảnh
hưởng ngày hôm nay:409 RECIPE_DATE_POLICY_CHANGED, yêu cầu re-preview; không rebase
ngày hoặc silent partialapply. Nếu Storedate đổi nhưng can prove lịch vẫn future,
v1 vẫn yêu cầu re-preview cho mọi dayrollover để khách review minimumdate rõ ràng.

Content hoặc rawcanonicalvalidity khác giữa preview/commit409 PREVIEW_STALE;
If-Match khác412 RECIPE_SCHEDULE_REVISION_CONFLICT, absent428. Retry receiptlookup
sau currentauthorization trước staleCAS/daychecks, samekey/payload giữreceipt,
không activate again; keydifferentpayload409 IDEMPOTENCY_KEY_REUSED. Uncertain
commit đọc receipt+committedcalendar qua freshSession trong verification sau này,
không mù create version. N22 trả200 {change_id,status:"preview_ready"|"blocked"|
"committed",preview:RecipeSchedulePreview,receipt:RecipeScheduleReceipt|null,
audit:RecipeScheduleAudit|null}. Receipt/audit chỉ có khi committed; preview là
bản đã giữ, không tái tính bằng current DB. Quyền đọc hiện hành theo Store/action;
đọc past change không thay schedule.

### 12.5. Quyền, audit, effects và acceptance

N20/N22 require menu.read+recipe.read+ingredient.read. N21 require cả readset này
và recipe.manage_effectivity; thêm recipe.create_version nếu request tạo newcontent.
Owner có quyền đúng Store; Staff phải được Owner cấp từng action. Không suy
create_version cho phép thay calendar cũ. Unknown/foreign read/receipt deny như
P02, no one-timeapprovalbypass cho đến approved allowlist. Price/budget không
trong response, không buộc procurement.cost.read. Quyền mới đã vào AUTH catalogue
permissions-v2 và Owner invitation có thể chọn nếu descriptorcurrent.

RecipeScheduleAudit immutable {change_id,actor_user_id,store_id,product_id,reason,occurred_at,
preview_digest,calendar_before_version,calendar_after_version,before,after,
new_content_ids,operations,acknowledged_warnings,request_id}; no delete oldfacts.
N22 là retained change/audit viewer, không tạo endpoint auditglobal theo DBtable.

Không ghi sales/USAGE/stock hoặc recomputeforecast/planning. Recipe/yield/loss đổi
thay Ingredient demand của **Run mới** theo datedBOM; forecast Productquantities
không tự đổi identity. Run đã capture/input/result giữ nguyên, kể cả futurewindow
có ngày vừa đổi. Queued Run chưa capture giữ accepted config nhưng operational
capture theo thời điểm thực như PLAN7; có thể đọc lịch mới nếu commit trước capture,
không nói accepted đã freeze mọi operational fact. C01/R01 refetchfuture recipes;
Save yêu cầu vẫn độc lập readiness, requirements/winner không đổi. Imported new
version vẫn không autoclose: I05 không được hiểu missing closure là instruction.
Không ghép recipecalendarchange vào import canonicalbatch trong v1 contract này;
khách đóng/điều chỉnh calendar qua preview explicit hoặc tạo content qua editor,
không dùng hai transaction rời để giả atomic recipe switch.

Errors thêm409 RECIPE_PERIOD_OVERLAP/PREVIEW_BLOCKED/PREVIEW_STALE/
RECIPE_DATE_POLICY_CHANGED/RECIPE_CHANGE_NOT_READY;412 RECIPE_SCHEDULE_REVISION_CONFLICT;
422 HISTORY_CHANGE_NOT_ALLOWED/INVALID_RECIPE_REFERENCE/INVALID_UNIT/
INVALID_RECIPE_CONTENT/INVALID_DATE_RANGE/INVALID_WARNING_ACKNOWLEDGEMENT;
413 RESOURCE_LIMIT_EXCEEDED; general401/403/404/422/428/503 như mục8. Sourcecorrupt
503 CATALOG_INTEGRITY_UNAVAILABLE, không auto chọn maxversion hoặc skipinvalidrow.

Acceptance specifications chưa chạy:

1. Oldfrom01/10→null, explicitclose09/10/newfrom10/10: hôm nay v1, ngàymai v2.
   Chỉnewversion gâyoverlap block, không tự closure; inclusive đúng dateboundary.
2. 10giờ đổi hôm nay/quá khứ blocked HISTORY_CHANGE_NOT_ALLOWED; Storemidnight
   invalidpreview, không rebase. Nội dung cũ/pastdates/Run snapshots giữ nguyên.
3. Futuremove/withdraw explicit, content retained; no autofill/reopen; gap cần
   acknowledgement và Planning exclusions theo policy, không auto-pause Product.
4. Sửa futurecontent tạo newUUID/version; concurrentpublication một thắng/stale,
   fault rollback oldcalendar+newcontent+audit/receipt, no orphan hoặc timelinegap.
5. Differentunits/foreignrefs/emptynewcontent/negativeyield/lossinvalid blocked;
   no syntheticconversion, preview không solver/LLM/tồn kho write.
6. Grant create_version thôi không editcalendar, Staff manage+reads mới allowed;
   revoked before fence chặn, retry không permissionbypass hoặc duplicateversion.
7. N20 pages pin version; N22 retaineddiff/history; P02 currenttoday không đổi,
   horizon từngngày/forecastreuse/configacceptance/C03/C05/PDF không reinterpret.

FE bổ sung timeline/current/future/unassigned, form newversion/đổi lịch, preview
before-after+gapwarnings, confirm/apply và changehistory/resume. Tách “xem recipe
hôm nay” và “đổi từ ngày…”; minimumdate server, không browsertimezone. Không
tạo form genericDBCRUD hoặc updateInventory từ Recipe.
IMPLEMENTATION BACKLOG: immutablecontent/applicability lifecycle+calendarversions/
preview+audit/receiptstorage+schema adaptation, typedserializers/rangevalidation/
locking/authfences, HTTP/OpenAPI/FEadapters; source hiện chưa có. Freeze migration
trong slice được giao, không sửa source/acceptedADR/WIP để claim design implemented.
Không còn câu hỏi sản phẩm chặn future-only workflow này; correctionhồi tố ngoài
policy được duyệt, không tự tạo assumption hoặc hỏi lại lịch sử đã bị giới hạn.
