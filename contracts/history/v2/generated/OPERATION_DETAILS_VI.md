# Exact wire audit theo operation

CURRENT FACT: sinh từ baseline OpenAPI và current source OpenAPI. Phần này mô tả wire; semantic validators/current authorization được đối chiếu riêng trong delta và evidence source. Header optional/nullable trong OpenAPI không có nghĩa use case không require key/CAS/CSRF. Origin/cookie/browser transport và error handling chung nằm trong sáu contracts/checklist.

Mỗi operation có baseline/current method/path/parameters/body/status/security. Recursive component definitions, requiredness/nullability/default/pattern/enum và JSON-pointer changes nằm trong [operation_comparison.json](operation_comparison.json); schema hiện hành trong [openapi.json](openapi.json). Không suy runtime behavior từ route count.

<a id="op-a01"></a>
## A01

### Baseline

`POST /api/v1/auth/login`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/LoginRequest"}}}}`

Security: `[]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_AuthContext_"}}}` | Set-Cookie, Cache-Control |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `LoginRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| email | True | `{"type": "string", "maxLength": 320, "minLength": 1, "title": "Email"}` |
| password | True | `{"type": "string", "maxLength": 128, "minLength": 1, "format": "password", "title": "Password", "writeOnly": true}` |
| remember_me | False | `{"type": "boolean", "title": "Remember Me", "default": false}` |

### Hiện hành

`POST /api/v1/auth/login`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/LoginRequest"}}}}`

Security: `[]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_AuthContext_"}}}` | Set-Cookie, Cache-Control |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `LoginRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| email | True | `{"type": "string", "maxLength": 320, "minLength": 1, "title": "Email"}` |
| password | True | `{"type": "string", "maxLength": 128, "minLength": 1, "format": "password", "title": "Password", "writeOnly": true}` |
| remember_me | False | `{"type": "boolean", "title": "Remember Me", "default": false}` |

Source evidence: `app/api/auth.py:56`, handler `login`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-a03"></a>
## A03

### Baseline

`GET /api/v1/auth/me`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| — | — | Không parameters |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_AuthContext_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`GET /api/v1/auth/me`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| — | — | Không parameters |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_AuthContext_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/auth.py:65`, handler `me`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-a04"></a>
## A04

### Baseline

`POST /api/v1/auth/logout`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "description": "Required when a valid session exists.", "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `null`

Security: `[{}, {"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 204 | `{}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`POST /api/v1/auth/logout`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "description": "Required when a valid session exists.", "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `null`

Security: `[{}, {"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 204 | `{}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/auth.py:70`, handler `logout`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-c01"></a>
## C01

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/stores/{store_id}/planning-context`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_Context_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |

Source evidence: `app/api/readiness.py:29`, handler `context`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 25. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-c02"></a>
## C02

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`POST /api/v1/stores/{store_id}/procurement-plans`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| header/Idempotency-Key | True | `{"type": "string", "minLength": 36, "maxLength": 36, "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", "title": "Idempotency-Key"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/PlanningRequest-Input"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 202 | `{"application/json": {"schema": {"$ref": "#/components/schemas/PlanningEnvelope_Accepted_"}}}` | Location, Retry-After, Cache-Control |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/PlanningEnvelope_Accepted_"}}}` | Location, Retry-After, Cache-Control |

Request fields `PlanningRequest-Input`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| requirements_mode | True | `{"type": "string", "enum": ["default", "custom", "saved"], "title": "Requirements Mode"}` |
| forecast_start_date | True | `{"type": "string", "format": "date", "title": "Forecast Start Date"}` |
| default_requirements_version | False | `{"anyOf": [{"type": "string", "maxLength": 128, "minLength": 1}, {"type": "null"}], "title": "Default Requirements Version"}` |
| requirements | False | `{"anyOf": [{"$ref": "#/components/schemas/CustomRequirements-Input"}, {"type": "null"}]}` |
| saved_requirement_id | False | `{"anyOf": [{"type": "string", "format": "uuid"}, {"type": "null"}], "title": "Saved Requirement Id"}` |

Source evidence: `app/api/planning_public.py:37`, handler `accept`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 14. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-c03"></a>
## C03

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/procurement-plans/{plan_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/plan_id | True | `{"type": "string", "format": "uuid", "title": "Plan Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/PlanningEnvelope_RunView_"}}}` | ETag, Cache-Control |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |

Source evidence: `app/api/planning_public.py:53`, handler `read`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 38. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-c04"></a>
## C04

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/procurement-plans/{plan_id}/ingredients`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/plan_id | True | `{"type": "string", "format": "uuid", "title": "Plan Id"}` |
| query/option_id | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 128}, {"type": "null"}], "title": "Option Id"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |
| query/sort | False | `{"const": "ingredient_id", "type": "string", "default": "ingredient_id", "title": "Sort"}` |
| query/ingredient_id | False | `{"anyOf": [{"type": "array", "items": {"type": "string", "format": "uuid"}}, {"type": "null"}], "title": "Ingredient Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/InspectionEnvelope_IngredientNavigator_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |

Source evidence: `app/api/planning_public.py:64`, handler `ingredients`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 14. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-c05"></a>
## C05

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/procurement-plans/{plan_id}/ingredients/{ingredient_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/plan_id | True | `{"type": "string", "format": "uuid", "title": "Plan Id"}` |
| path/ingredient_id | True | `{"type": "string", "format": "uuid", "title": "Ingredient Id"}` |
| query/option_id | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 128}, {"type": "null"}], "title": "Option Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/InspectionEnvelope_IngredientDetail_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |

Source evidence: `app/api/planning_public.py:81`, handler `ingredient`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 19. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-c08"></a>
## C08

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/procurement-plans/{plan_id}/explanation`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/plan_id | True | `{"type": "string", "format": "uuid", "title": "Plan Id"}` |
| query/option_id | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 128}, {"type": "null"}], "title": "Option Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ExplanationEnvelope"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |

Source evidence: `app/api/planning_public.py:90`, handler `explanation`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 16. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-h01"></a>
## H01

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/stores/{store_id}/imports/calendar`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/month | True | `{"type": "string", "minLength": 7, "maxLength": 7, "title": "Month"}` |
| query/category | False | `{"anyOf": [{"enum": ["sales", "inventory", "recipes", "supplier"], "type": "string"}, {"type": "null"}], "title": "Category"}` |
| query/status | False | `{"anyOf": [{"enum": ["in_progress", "completed", "completed_with_warnings", "failed"], "type": "string"}, {"type": "null"}], "title": "Status"}` |
| query/q | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 255}, {"type": "null"}], "title": "Q"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/HistoryEnvelope_ImportCalendar_HistoryMeta_"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/history.py:20`, handler `calendar`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 11. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-h02"></a>
## H02

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/stores/{store_id}/imports`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/import_date | True | `{"type": "string", "format": "date", "title": "Import Date"}` |
| query/category | False | `{"anyOf": [{"enum": ["sales", "inventory", "recipes", "supplier"], "type": "string"}, {"type": "null"}], "title": "Category"}` |
| query/status | False | `{"anyOf": [{"enum": ["in_progress", "completed", "completed_with_warnings", "failed"], "type": "string"}, {"type": "null"}], "title": "Status"}` |
| query/q | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 255}, {"type": "null"}], "title": "Q"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |
| query/sort | False | `{"const": "-imported_at", "type": "string", "default": "-imported_at", "title": "Sort"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/HistoryEnvelope_ImportHistory_ImportHistoryMeta_"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/history.py:28`, handler `imports`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 11. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-i01"></a>
## I01

### Baseline

`POST /api/v1/stores/{store_id}/imports`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/DraftRequest"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 201 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_Draft_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `DraftRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| data_date | True | `{"type": "string", "format": "date", "title": "Data Date"}` |

### Hiện hành

`POST /api/v1/stores/{store_id}/imports`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/DraftRequest"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 201 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_Draft_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `DraftRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| data_date | True | `{"type": "string", "format": "date", "title": "Data Date"}` |

Source evidence: `app/api/import_staging.py:69`, handler `draft`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "/definition/responses/201/headers", "kind": "added"}]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-i02"></a>
## I02

### Baseline

`POST /api/v1/imports/{import_id}/files`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"multipart/form-data": {"schema": {"$ref": "#/components/schemas/Body_I02"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_UploadResult_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/UploadFailure"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`POST /api/v1/imports/{import_id}/files`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"multipart/form-data": {"schema": {"$ref": "#/components/schemas/Body_I02"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_UploadResult_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/UploadFailure"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/import_staging.py:93`, handler `upload`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "/definition/responses/200/headers", "kind": "added"}]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-i03"></a>
## I03

### Baseline

`POST /api/v1/imports/{import_id}/analyze`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/AnalyzeRequest"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 202 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_AnalysisAccepted_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `AnalyzeRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| file_set_version | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "File Set Version"}` |
| accepted_file_ids | True | `{"items": {"type": "string", "format": "uuid"}, "type": "array", "maxItems": 20, "minItems": 1, "title": "Accepted File Ids"}` |
| acknowledged_rejected_client_file_ids | True | `{"items": {"type": "string", "format": "uuid"}, "type": "array", "title": "Acknowledged Rejected Client File Ids"}` |

### Hiện hành

`POST /api/v1/imports/{import_id}/analyze`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/AnalyzeRequest"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 202 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_AnalysisAccepted_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `AnalyzeRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| file_set_version | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "File Set Version"}` |
| accepted_file_ids | True | `{"items": {"type": "string", "format": "uuid"}, "type": "array", "maxItems": 20, "minItems": 1, "title": "Accepted File Ids"}` |
| acknowledged_rejected_client_file_ids | True | `{"items": {"type": "string", "format": "uuid"}, "type": "array", "title": "Acknowledged Rejected Client File Ids"}` |

Source evidence: `app/api/import_staging.py:149`, handler `analyze`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "/definition/responses/202/headers", "kind": "added"}]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-i04"></a>
## I04

### Baseline

`GET /api/v1/imports/{import_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| query/files_limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Files Limit"}` |
| query/files_cursor | False | `{"anyOf": [{"type": "string", "maxLength": 4096}, {"type": "null"}], "title": "Files Cursor"}` |
| query/include_preview | False | `{"type": "boolean", "default": false, "title": "Include Preview"}` |
| query/preview_id | False | `{"anyOf": [{"type": "string", "format": "uuid"}, {"type": "null"}], "title": "Preview Id"}` |
| query/rows_limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Rows Limit"}` |
| query/rows_cursor | False | `{"anyOf": [{"type": "string", "maxLength": 4096}, {"type": "null"}], "title": "Rows Cursor"}` |
| query/classification | False | `{"anyOf": [{"enum": ["NEW", "UNCHANGED", "CHANGED", "INVALID", "CONFLICT"], "type": "string"}, {"type": "null"}], "title": "Classification"}` |
| query/include | False | `{"anyOf": [{"enum": ["configurations", "preview", "configurations,preview", "preview,configurations"], "type": "string"}, {"type": "null"}], "title": "Include"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_ImportRead_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`GET /api/v1/imports/{import_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| query/files_limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Files Limit"}` |
| query/files_cursor | False | `{"anyOf": [{"type": "string", "maxLength": 4096}, {"type": "null"}], "title": "Files Cursor"}` |
| query/include_preview | False | `{"type": "boolean", "default": false, "title": "Include Preview"}` |
| query/preview_id | False | `{"anyOf": [{"type": "string", "format": "uuid"}, {"type": "null"}], "title": "Preview Id"}` |
| query/rows_limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Rows Limit"}` |
| query/rows_cursor | False | `{"anyOf": [{"type": "string", "maxLength": 4096}, {"type": "null"}], "title": "Rows Cursor"}` |
| query/classification | False | `{"anyOf": [{"enum": ["NEW", "UNCHANGED", "CHANGED", "INVALID", "CONFLICT"], "type": "string"}, {"type": "null"}], "title": "Classification"}` |
| query/include | False | `{"anyOf": [{"enum": ["configurations", "preview", "configurations,preview", "preview,configurations"], "type": "string"}, {"type": "null"}], "title": "Include"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_ImportRead_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/import_staging.py:174`, handler `read`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "/definition/responses/200/headers", "kind": "added"}]`

Reachable schema JSON-pointer changes: 46. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-i05"></a>
## I05

### Baseline

`POST /api/v1/imports/{import_id}/process`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"oneOf": [{"$ref": "#/components/schemas/PreviewRequest"}, {"$ref": "#/components/schemas/CommitRequest"}], "discriminator": {"propertyName": "phase", "mapping": {"preview": "#/components/schemas/PreviewRequest", "commit": "#/components/schemas/CommitRequest"}}, "title": "Body"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 202 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_PreviewAccepted_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `PreviewRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| phase | True | `{"type": "string", "const": "preview", "title": "Phase"}` |
| mapping_revision | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Mapping Revision"}` |

Request fields `CommitRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| phase | True | `{"type": "string", "const": "commit", "title": "Phase"}` |
| preview_id | True | `{"type": "string", "format": "uuid", "title": "Preview Id"}` |
| preview_digest | True | `{"type": "string", "title": "Preview Digest"}` |
| confirm | True | `{"type": "boolean", "const": true, "title": "Confirm"}` |
| reason | True | `{"type": "string", "title": "Reason"}` |
| resolutions | True | `{"items": {"$ref": "#/components/schemas/SalesResolution"}, "type": "array", "title": "Resolutions"}` |
| supplier_changes | False | `{"items": {"$ref": "#/components/schemas/SupplierConfirmation"}, "type": "array", "title": "Supplier Changes", "default": []}` |

### Hiện hành

`POST /api/v1/imports/{import_id}/process`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"oneOf": [{"$ref": "#/components/schemas/app__application__contracts__import_mapping__PreviewRequest"}, {"$ref": "#/components/schemas/app__application__contracts__import_mapping__CommitRequest"}, {"$ref": "#/components/schemas/ConfirmReviewRequest"}], "discriminator": {"propertyName": "phase", "mapping": {"preview": "#/components/schemas/app__application__contracts__import_mapping__PreviewRequest", "commit": "#/components/schemas/app__application__contracts__import_mapping__CommitRequest", "confirm_review": "#/components/schemas/ConfirmReviewRequest"}}, "title": "Body"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 202 | `{"application/json": {"schema": {"anyOf": [{"$ref": "#/components/schemas/ImportEnvelope_PreviewAccepted_"}, {"$ref": "#/components/schemas/ImportEnvelope_CommitAccepted_"}], "title": "Response I05"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_ConfirmationResult_"}}}` | ETag |

Request fields `app__application__contracts__import_mapping__PreviewRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| phase | True | `{"type": "string", "const": "preview", "title": "Phase"}` |
| mapping_revision | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Mapping Revision"}` |

Request fields `app__application__contracts__import_mapping__CommitRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| phase | True | `{"type": "string", "const": "commit", "title": "Phase"}` |
| preview_id | True | `{"type": "string", "format": "uuid", "title": "Preview Id"}` |
| preview_digest | True | `{"type": "string", "title": "Preview Digest"}` |
| confirm | True | `{"type": "boolean", "const": true, "title": "Confirm"}` |
| reason | False | `{"anyOf": [{"type": "string", "maxLength": 1000, "minLength": 1}, {"type": "null"}], "title": "Reason"}` |
| resolutions | True | `{"items": {"$ref": "#/components/schemas/SalesResolution"}, "type": "array", "title": "Resolutions"}` |
| supplier_changes | False | `{"items": {"$ref": "#/components/schemas/SupplierConfirmation"}, "type": "array", "title": "Supplier Changes", "default": []}` |

Request fields `ConfirmReviewRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| phase | True | `{"type": "string", "const": "confirm_review", "title": "Phase"}` |
| preview_id | True | `{"type": "string", "format": "uuid", "title": "Preview Id"}` |
| preview_digest | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Preview Digest"}` |
| mapping_revision | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Mapping Revision"}` |
| confirm | True | `{"type": "boolean", "const": true, "title": "Confirm"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |

Source evidence: `app/api/import_staging.py:374`, handler `process`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "/definition/requestBody/content/application~1json/schema/discriminator/mapping/commit", "kind": "changed"}, {"path": "/definition/requestBody/content/application~1json/schema/discriminator/mapping/confirm_review", "kind": "added"}, {"path": "/definition/requestBody/content/application~1json/schema/discriminator/mapping/preview", "kind": "changed"}, {"path": "/definition/requestBody/content/application~1json/schema/oneOf", "kind": "changed"}, {"path": "/definition/responses/200", "kind": "added"}, {"path": "/definition/responses/202/content/application~1json/schema/$ref", "kind": "removed"}, {"path": "/definition/responses/202/content/application~1json/schema/anyOf", "kind": "added"}, {"path": "/definition/responses/202/content/application~1json/schema/title", "kind": "added"}, {"path": "/definition/responses/202/headers", "kind": "added"}]`

Reachable schema JSON-pointer changes: 10. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-i06"></a>
## I06

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/imports/{import_id}/completion`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_ImportCompletion_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/import_staging.py:416`, handler `completion`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 29. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-j01"></a>
## J01

### Baseline

`GET /api/v1/jobs/{job_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/job_id | True | `{"type": "string", "format": "uuid", "title": "Job Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_JobView_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`GET /api/v1/jobs/{job_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/job_id | True | `{"type": "string", "format": "uuid", "title": "Job Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_JobView_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/import_staging.py:429`, handler `job`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 9. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-m01"></a>
## M01

### Baseline

`GET /api/v1/imports/{import_id}/mapping-summary`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| query/include_clean_sheets | False | `{"type": "boolean", "default": false, "title": "Include Clean Sheets"}` |
| query/include_profile_details | False | `{"type": "boolean", "default": false, "title": "Include Profile Details"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_MappingSummary_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`GET /api/v1/imports/{import_id}/mapping-summary`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| query/include_clean_sheets | False | `{"type": "boolean", "default": false, "title": "Include Clean Sheets"}` |
| query/include_profile_details | False | `{"type": "boolean", "default": false, "title": "Include Profile Details"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_MappingSummary_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/import_staging.py:235`, handler `summary`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 19. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-m02"></a>
## M02

### Baseline

`GET /api/v1/imports/{import_id}/mappings`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| query/sheet_id | False | `{"anyOf": [{"type": "string", "format": "uuid"}, {"type": "null"}], "title": "Sheet Id"}` |
| query/review_only | False | `{"type": "boolean", "default": true, "title": "Review Only"}` |
| query/status | False | `{"anyOf": [{"enum": ["auto_mapped", "resolved", "needs_confirmation", "ambiguous", "unmatched"], "type": "string"}, {"type": "null"}], "title": "Status"}` |
| query/include_details | False | `{"type": "boolean", "default": false, "title": "Include Details"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_MappingList_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`GET /api/v1/imports/{import_id}/mappings`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| query/sheet_id | False | `{"anyOf": [{"type": "string", "format": "uuid"}, {"type": "null"}], "title": "Sheet Id"}` |
| query/review_only | False | `{"type": "boolean", "default": true, "title": "Review Only"}` |
| query/status | False | `{"anyOf": [{"enum": ["auto_mapped", "resolved", "needs_confirmation", "ambiguous", "unmatched"], "type": "string"}, {"type": "null"}], "title": "Status"}` |
| query/include_details | False | `{"type": "boolean", "default": false, "title": "Include Details"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_MappingList_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/import_staging.py:258`, handler `mappings`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 15. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-m03"></a>
## M03

### Baseline

`GET /api/v1/imports/{import_id}/sheets/{sheet_id}/field-options`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| path/sheet_id | True | `{"type": "string", "format": "uuid", "title": "Sheet Id"}` |
| query/mapping_id | False | `{"anyOf": [{"type": "string", "format": "uuid"}, {"type": "null"}], "title": "Mapping Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_FieldOptions_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`GET /api/v1/imports/{import_id}/sheets/{sheet_id}/field-options`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| path/sheet_id | True | `{"type": "string", "format": "uuid", "title": "Sheet Id"}` |
| query/mapping_id | False | `{"anyOf": [{"type": "string", "format": "uuid"}, {"type": "null"}], "title": "Mapping Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_FieldOptions_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/import_staging.py:299`, handler `field_options`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 11. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-m04"></a>
## M04

### Baseline

`PATCH /api/v1/imports/{import_id}/mappings/{mapping_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| path/mapping_id | True | `{"type": "string", "format": "uuid", "title": "Mapping Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"anyOf": [{"$ref": "#/components/schemas/TargetRequest"}, {"$ref": "#/components/schemas/ResolveRequest"}], "title": "Body"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_MappingUpdated_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `TargetRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| target_field | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Target Field"}` |

Request fields `ResolveRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| resolution | True | `{"oneOf": [{"$ref": "#/components/schemas/SourceContext"}, {"$ref": "#/components/schemas/IdentityBinding"}, {"$ref": "#/components/schemas/Conversion"}, {"$ref": "#/components/schemas/Ignored"}, {"$ref": "#/components/schemas/NewEntity"}], "title": "Resolution", "discriminator": {"propertyName": "kind", "mapping": {"declared_conversion": "#/components/schemas/Conversion", "identity_binding": "#/components/schemas/IdentityBinding", "ignored_optional_field": "#/components/schemas/Ignored", "new_entity_proposal": "#/components/schemas/NewEntity", "source_context": "#/components/schemas/SourceContext"}}}` |

### Hiện hành

`PATCH /api/v1/imports/{import_id}/mappings/{mapping_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/import_id | True | `{"type": "string", "format": "uuid", "title": "Import Id"}` |
| path/mapping_id | True | `{"type": "string", "format": "uuid", "title": "Mapping Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"anyOf": [{"$ref": "#/components/schemas/TargetRequest"}, {"$ref": "#/components/schemas/ResolveRequest-Input"}], "title": "Body"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_MappingUpdated_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `TargetRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| target_field | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Target Field"}` |

Request fields `ResolveRequest-Input`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| resolution | True | `{"oneOf": [{"$ref": "#/components/schemas/SourceContext"}, {"$ref": "#/components/schemas/IdentityBinding"}, {"$ref": "#/components/schemas/Conversion"}, {"$ref": "#/components/schemas/Ignored"}, {"$ref": "#/components/schemas/NewEntity-Input"}, {"$ref": "#/components/schemas/SheetTypeResolution"}, {"$ref": "#/components/schemas/SharedValueResolution"}], "title": "Resolution", "discriminator": {"propertyName": "kind", "mapping": {"declared_conversion": "#/components/schemas/Conversion", "identity_binding": "#/components/schemas/IdentityBinding", "ignored_optional_field": "#/components/schemas/Ignored", "new_entity_proposal": "#/components/schemas/NewEntity-Input", "shared_value": "#/components/schemas/SharedValueResolution", "sheet_type": "#/components/schemas/SheetTypeResolution", "source_context": "#/components/schemas/SourceContext"}}}` |

Source evidence: `app/api/import_staging.py:322`, handler `resolve`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "/definition/requestBody/content/application~1json/schema/anyOf", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 23. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n1"></a>
## N1

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`POST /api/v1/stores/{store_id}/planning-requirements`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/SaveRequest"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 201 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_SavedDetail_"}}}` | ETag, Location |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |

Request fields `SaveRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| name | True | `{"type": "string", "maxLength": 200, "minLength": 1, "title": "Name"}` |
| requirements | True | `{"$ref": "#/components/schemas/CustomRequirements-Input"}` |
| default_requirements_version | False | `{"anyOf": [{"type": "string", "maxLength": 128, "minLength": 1}, {"type": "null"}], "title": "Default Requirements Version"}` |

Source evidence: `app/api/planning_configuration.py:37`, handler `save`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 20. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n10"></a>
## N10

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`POST /api/v1/procurement-plans/{plan_id}/exports`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/plan_id | True | `{"type": "string", "format": "uuid", "title": "Plan Id"}` |
| header/Idempotency-Key | True | `{"type": "string", "minLength": 36, "maxLength": 36, "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", "title": "Idempotency-Key"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/ExportRequest"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 202 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ExportEnvelope"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |

Request fields `ExportRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| format | True | `{"type": "string", "const": "pdf", "title": "Format"}` |
| option_id | True | `{"anyOf": [{"type": "string", "maxLength": 128, "minLength": 1}, {"type": "null"}], "title": "Option Id"}` |
| locale | True | `{"type": "string", "const": "vi", "title": "Locale"}` |

Source evidence: `app/api/planning_exports.py:15`, handler `accept`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 9. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n11"></a>
## N11

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/procurement-plans/{plan_id}/exports/{export_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/plan_id | True | `{"type": "string", "format": "uuid", "title": "Plan Id"}` |
| path/export_id | True | `{"type": "string", "format": "uuid", "title": "Export Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/pdf": {"schema": {"type": "string", "format": "binary"}}}` | Content-Disposition, Content-Length, ETag, Cache-Control, X-Content-Type-Options |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |

Source evidence: `app/api/planning_exports.py:24`, handler `download`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 5. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n12"></a>
## N12

### Baseline

`GET /api/v1/stores/{store_id}/memberships`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/role | False | `{"const": "STAFF", "type": "string", "default": "STAFF", "title": "Role"}` |
| query/active | False | `{"enum": ["all", "true", "false"], "type": "string", "default": "all", "title": "Active"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_MembershipList_"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`GET /api/v1/stores/{store_id}/memberships`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/role | False | `{"const": "STAFF", "type": "string", "default": "STAFF", "title": "Role"}` |
| query/active | False | `{"enum": ["all", "true", "false"], "type": "string", "default": "all", "title": "Active"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_MembershipList_"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/staff.py:32`, handler `memberships`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n13"></a>
## N13

### Baseline

`PUT /api/v1/stores/{store_id}/memberships/{membership_id}/permissions`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/membership_id | True | `{"type": "string", "format": "uuid", "title": "Membership Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/GrantsRequest"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_PermissionUpdate_"}}}` | ETag |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `GrantsRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| grants | True | `{"items": {"type": "string"}, "type": "array", "maxItems": 37, "title": "Grants"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |

### Hiện hành

`PUT /api/v1/stores/{store_id}/memberships/{membership_id}/permissions`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/membership_id | True | `{"type": "string", "format": "uuid", "title": "Membership Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/GrantsRequest"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_PermissionUpdate_"}}}` | ETag |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `GrantsRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| grants | True | `{"items": {"type": "string"}, "type": "array", "maxItems": 37, "title": "Grants"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |

Source evidence: `app/api/staff.py:41`, handler `replace`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n14"></a>
## N14

### Baseline

`GET /api/v1/stores/{store_id}/permission-events`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/membership_id | False | `{"anyOf": [{"type": "string", "format": "uuid"}, {"type": "null"}], "title": "Membership Id"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_PermissionEvents_"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`GET /api/v1/stores/{store_id}/permission-events`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/membership_id | False | `{"anyOf": [{"type": "string", "format": "uuid"}, {"type": "null"}], "title": "Membership Id"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_PermissionEvents_"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/staff.py:51`, handler `events`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n15"></a>
## N15

### Baseline

`POST /api/v1/stores/{store_id}/staff-invitations`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/CreateInvitation"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 201 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_InvitationCreation_"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `CreateInvitation`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| grants | True | `{"items": {"type": "string"}, "type": "array", "maxItems": 37, "title": "Grants"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |
| email | True | `{"type": "string", "maxLength": 320, "minLength": 1, "title": "Email"}` |
| permission_catalog_version | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Permission Catalog Version"}` |

### Hiện hành

`POST /api/v1/stores/{store_id}/staff-invitations`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/CreateInvitation"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 201 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_InvitationCreation_"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `CreateInvitation`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| grants | True | `{"items": {"type": "string"}, "type": "array", "maxItems": 37, "title": "Grants"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |
| email | True | `{"type": "string", "maxLength": 320, "minLength": 1, "title": "Email"}` |
| permission_catalog_version | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Permission Catalog Version"}` |

Source evidence: `app/api/staff.py:60`, handler `create`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n16"></a>
## N16

### Baseline

`GET /api/v1/stores/{store_id}/staff-invitations`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/view | False | `{"enum": ["invitations", "events"], "type": "string", "default": "invitations", "title": "View"}` |
| query/status | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Status"}` |
| query/email | False | `{"anyOf": [{"type": "string", "maxLength": 320}, {"type": "null"}], "title": "Email"}` |
| query/invitation_id | False | `{"anyOf": [{"type": "string", "format": "uuid"}, {"type": "null"}], "title": "Invitation Id"}` |
| query/sort | False | `{"const": "-issued_at", "type": "string", "default": "-issued_at", "title": "Sort"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"anyOf": [{"$ref": "#/components/schemas/Envelope_InvitationList_"}, {"$ref": "#/components/schemas/Envelope_InvitationEvents_"}], "title": "Response N16"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`GET /api/v1/stores/{store_id}/staff-invitations`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/view | False | `{"enum": ["invitations", "events"], "type": "string", "default": "invitations", "title": "View"}` |
| query/status | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Status"}` |
| query/email | False | `{"anyOf": [{"type": "string", "maxLength": 320}, {"type": "null"}], "title": "Email"}` |
| query/invitation_id | False | `{"anyOf": [{"type": "string", "format": "uuid"}, {"type": "null"}], "title": "Invitation Id"}` |
| query/sort | False | `{"const": "-issued_at", "type": "string", "default": "-issued_at", "title": "Sort"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"anyOf": [{"$ref": "#/components/schemas/Envelope_InvitationList_"}, {"$ref": "#/components/schemas/Envelope_InvitationEvents_"}], "title": "Response N16"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/staff.py:68`, handler `invitations`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n17"></a>
## N17

### Baseline

`POST /api/v1/stores/{store_id}/staff-invitations/{invitation_id}/actions`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/invitation_id | True | `{"type": "string", "format": "uuid", "title": "Invitation Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"oneOf": [{"$ref": "#/components/schemas/ReissueInvitation"}, {"$ref": "#/components/schemas/RevokeInvitation"}], "discriminator": {"propertyName": "action", "mapping": {"reissue": "#/components/schemas/ReissueInvitation", "revoke": "#/components/schemas/RevokeInvitation"}}, "title": "Body"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_InvitationAction_"}}}` | ETag |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `ReissueInvitation`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| grants | True | `{"items": {"type": "string"}, "type": "array", "maxItems": 37, "title": "Grants"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |
| action | True | `{"type": "string", "const": "reissue", "title": "Action"}` |
| permission_catalog_version | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Permission Catalog Version"}` |

Request fields `RevokeInvitation`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| action | True | `{"type": "string", "const": "revoke", "title": "Action"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |

### Hiện hành

`POST /api/v1/stores/{store_id}/staff-invitations/{invitation_id}/actions`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/invitation_id | True | `{"type": "string", "format": "uuid", "title": "Invitation Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"oneOf": [{"$ref": "#/components/schemas/ReissueInvitation"}, {"$ref": "#/components/schemas/RevokeInvitation"}], "discriminator": {"propertyName": "action", "mapping": {"reissue": "#/components/schemas/ReissueInvitation", "revoke": "#/components/schemas/RevokeInvitation"}}, "title": "Body"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_InvitationAction_"}}}` | ETag |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `ReissueInvitation`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| grants | True | `{"items": {"type": "string"}, "type": "array", "maxItems": 37, "title": "Grants"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |
| action | True | `{"type": "string", "const": "reissue", "title": "Action"}` |
| permission_catalog_version | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Permission Catalog Version"}` |

Request fields `RevokeInvitation`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| action | True | `{"type": "string", "const": "revoke", "title": "Action"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |

Source evidence: `app/api/staff.py:93`, handler `action`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n18"></a>
## N18

### Baseline

`GET /api/v1/staff-invitations/{invitation_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/invitation_id | True | `{"type": "string", "format": "uuid", "title": "Invitation Id"}` |
| header/X-Invitation-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Invitation-Token"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_OfferRead_"}}}` | ETag |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`GET /api/v1/staff-invitations/{invitation_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/invitation_id | True | `{"type": "string", "format": "uuid", "title": "Invitation Id"}` |
| header/X-Invitation-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Invitation-Token"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_OfferRead_"}}}` | ETag |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/staff.py:104`, handler `offer`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n19"></a>
## N19

### Baseline

`POST /api/v1/staff-invitations/{invitation_id}/accept`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/invitation_id | True | `{"type": "string", "format": "uuid", "title": "Invitation Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/AcceptInvitation"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 201 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_AcceptanceReceipt_"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_AcceptanceReceipt_"}}}` | — |

Request fields `AcceptInvitation`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| token | True | `{"type": "string", "maxLength": 512, "minLength": 1, "title": "Token", "writeOnly": true}` |
| accept | True | `{"type": "boolean", "title": "Accept"}` |

### Hiện hành

`POST /api/v1/staff-invitations/{invitation_id}/accept`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/invitation_id | True | `{"type": "string", "format": "uuid", "title": "Invitation Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/AcceptInvitation"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 201 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_AcceptanceReceipt_"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 410 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_AcceptanceReceipt_"}}}` | — |

Request fields `AcceptInvitation`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| token | True | `{"type": "string", "maxLength": 512, "minLength": 1, "title": "Token", "writeOnly": true}` |
| accept | True | `{"type": "boolean", "title": "Accept"}` |

Source evidence: `app/api/staff.py:113`, handler `accept`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n2"></a>
## N2

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/stores/{store_id}/planning-requirements/{saved_requirement_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/saved_requirement_id | True | `{"type": "string", "format": "uuid", "title": "Saved Requirement Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_SavedDetail_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |

Source evidence: `app/api/planning_configuration.py:47`, handler `read`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 16. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n20"></a>
## N20

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/product_id | True | `{"type": "string", "format": "uuid", "title": "Product Id"}` |
| query/status | False | `{"type": "string", "maxLength": 128, "default": "in_effect,scheduled", "title": "Status"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |
| query/sort | False | `{"type": "string", "maxLength": 64, "default": "effective_from,version", "title": "Sort"}` |
| query/from_date | False | `{"anyOf": [{"type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"}, {"type": "null"}], "title": "From Date"}` |
| query/to_date | False | `{"anyOf": [{"type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"}, {"type": "null"}], "title": "To Date"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_Timeline_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/recipe_schedule.py:20`, handler `timeline`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 11. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n21"></a>
## N21

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`POST /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule/changes`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/product_id | True | `{"type": "string", "format": "uuid", "title": "Product Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"oneOf": [{"$ref": "#/components/schemas/app__application__contracts__recipe_schedule__PreviewRequest"}, {"$ref": "#/components/schemas/app__application__contracts__recipe_schedule__CommitRequest"}], "discriminator": {"propertyName": "phase", "mapping": {"preview": "#/components/schemas/app__application__contracts__recipe_schedule__PreviewRequest", "commit": "#/components/schemas/app__application__contracts__recipe_schedule__CommitRequest"}}, "title": "Body"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_Union_Preview__Receipt__"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `app__application__contracts__recipe_schedule__PreviewRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| phase | True | `{"type": "string", "const": "preview", "title": "Phase"}` |
| new_recipes | True | `{"items": {"$ref": "#/components/schemas/NewRecipe"}, "type": "array", "maxItems": 20, "title": "New Recipes"}` |
| operations | True | `{"items": {"oneOf": [{"$ref": "#/components/schemas/SetPeriod"}, {"$ref": "#/components/schemas/Withdraw"}], "discriminator": {"propertyName": "kind", "mapping": {"SET_PERIOD": "#/components/schemas/SetPeriod", "WITHDRAW_FUTURE": "#/components/schemas/Withdraw"}}}, "type": "array", "maxItems": 100, "title": "Operations"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |

Request fields `app__application__contracts__recipe_schedule__CommitRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| phase | True | `{"type": "string", "const": "commit", "title": "Phase"}` |
| change_id | True | `{"type": "string", "format": "uuid", "title": "Change Id"}` |
| preview_digest | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Preview Digest"}` |
| confirm | True | `{"type": "boolean", "const": true, "title": "Confirm"}` |
| acknowledged_warning_codes | True | `{"items": {"type": "string"}, "type": "array", "maxItems": 100, "title": "Acknowledged Warning Codes"}` |

Source evidence: `app/api/recipe_schedule.py:41`, handler `change`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 24. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n22"></a>
## N22

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/stores/{store_id}/products/{product_id}/recipe-schedule/changes/{change_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/product_id | True | `{"type": "string", "format": "uuid", "title": "Product Id"}` |
| path/change_id | True | `{"type": "string", "format": "uuid", "title": "Change Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_ChangeRead_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/recipe_schedule.py:53`, handler `read_change`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 22. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n3"></a>
## N3

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`PUT /api/v1/stores/{store_id}/planning-requirements/{saved_requirement_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/saved_requirement_id | True | `{"type": "string", "format": "uuid", "title": "Saved Requirement Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"oneOf": [{"$ref": "#/components/schemas/ReplaceRequest"}, {"$ref": "#/components/schemas/ArchiveRequest"}], "discriminator": {"propertyName": "state", "mapping": {"active": "#/components/schemas/ReplaceRequest", "archived": "#/components/schemas/ArchiveRequest"}}, "title": "Body"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_SavedDetail_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |

Request fields `ReplaceRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| name | True | `{"type": "string", "maxLength": 200, "minLength": 1, "title": "Name"}` |
| requirements | True | `{"$ref": "#/components/schemas/CustomRequirements-Input"}` |
| default_requirements_version | False | `{"anyOf": [{"type": "string", "maxLength": 128, "minLength": 1}, {"type": "null"}], "title": "Default Requirements Version"}` |
| state | True | `{"type": "string", "const": "active", "title": "State"}` |

Request fields `ArchiveRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| state | True | `{"type": "string", "const": "archived", "title": "State"}` |

Source evidence: `app/api/planning_configuration.py:55`, handler `replace`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 21. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n4"></a>
## N4

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`PUT /api/v1/stores/{store_id}/planning-budget`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/If-None-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-None-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/BudgetRequest"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_BudgetResult_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 201 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_BudgetResult_"}}}` | ETag, Location |

Request fields `BudgetRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| amount | True | `{"type": "string", "maxLength": 37, "minLength": 1, "title": "Amount"}` |

Source evidence: `app/api/planning_configuration.py:66`, handler `budget`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 11. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n5"></a>
## N5

### Baseline

`POST /api/v1/stores/{store_id}/mapping-profiles/{profile_id}/decisions`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/profile_id | True | `{"type": "string", "format": "uuid", "title": "Profile Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"oneOf": [{"$ref": "#/components/schemas/Approve"}, {"$ref": "#/components/schemas/Reject"}, {"$ref": "#/components/schemas/Retire"}], "discriminator": {"propertyName": "decision", "mapping": {"approve_activate": "#/components/schemas/Approve", "reject": "#/components/schemas/Reject", "retire": "#/components/schemas/Retire"}}, "title": "Body"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_DecisionResult_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `Approve`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| decision | True | `{"type": "string", "const": "approve_activate", "title": "Decision"}` |
| proposal_revision | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Proposal Revision"}` |
| expected_active_version | True | `{"anyOf": [{"type": "string", "maxLength": 128, "minLength": 1}, {"type": "null"}], "title": "Expected Active Version"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |

Request fields `Reject`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| decision | True | `{"type": "string", "const": "reject", "title": "Decision"}` |
| proposal_revision | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Proposal Revision"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |

Request fields `Retire`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| decision | True | `{"type": "string", "const": "retire", "title": "Decision"}` |
| active_version | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Active Version"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |

### Hiện hành

`POST /api/v1/stores/{store_id}/mapping-profiles/{profile_id}/decisions`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/profile_id | True | `{"type": "string", "format": "uuid", "title": "Profile Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"oneOf": [{"$ref": "#/components/schemas/Approve"}, {"$ref": "#/components/schemas/Reject"}, {"$ref": "#/components/schemas/Retire"}], "discriminator": {"propertyName": "decision", "mapping": {"approve_activate": "#/components/schemas/Approve", "reject": "#/components/schemas/Reject", "retire": "#/components/schemas/Retire"}}, "title": "Body"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ImportEnvelope_DecisionResult_"}}}` | ETag |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 415 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `Approve`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| decision | True | `{"type": "string", "const": "approve_activate", "title": "Decision"}` |
| proposal_revision | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Proposal Revision"}` |
| expected_active_version | True | `{"anyOf": [{"type": "string", "maxLength": 128, "minLength": 1}, {"type": "null"}], "title": "Expected Active Version"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |

Request fields `Reject`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| decision | True | `{"type": "string", "const": "reject", "title": "Decision"}` |
| proposal_revision | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Proposal Revision"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |

Request fields `Retire`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| decision | True | `{"type": "string", "const": "retire", "title": "Decision"}` |
| active_version | True | `{"type": "string", "maxLength": 128, "minLength": 1, "title": "Active Version"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "title": "Reason"}` |

Source evidence: `app/api/import_staging.py:347`, handler `decide`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n6"></a>
## N6

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`POST /api/v1/stores/{store_id}/inventory/receipts`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/StockReceiptRequest"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 201 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_StockReceiptResult_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_StockReceiptResult_"}}}` | — |

Request fields `StockReceiptRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| origin | True | `{"type": "string", "enum": ["OPENING_STOCK", "ACTUAL_RECEIPT"], "title": "Origin"}` |
| receipt_identity | True | `{"$ref": "#/components/schemas/ReceiptIdentity"}` |
| ingredient_id | True | `{"type": "string", "format": "uuid", "title": "Ingredient Id"}` |
| supplier_id | True | `{"anyOf": [{"type": "string", "format": "uuid"}, {"type": "null"}], "title": "Supplier Id"}` |
| lot_code | True | `{"anyOf": [{"type": "string", "maxLength": 128, "minLength": 1, "pattern": "\\S"}, {"type": "null"}], "title": "Lot Code"}` |
| quantity | True | `{"type": "string", "maxLength": 200, "pattern": "^(0&#124;[1-9][0-9]*)(\\.[0-9]+)?$", "title": "Quantity"}` |
| unit | True | `{"type": "string", "maxLength": 128, "minLength": 1, "pattern": "\\S", "title": "Unit"}` |
| received_date | True | `{"anyOf": [{"type": "string", "format": "date"}, {"type": "null"}], "title": "Received Date"}` |
| expiry_date | True | `{"anyOf": [{"type": "string", "format": "date"}, {"type": "null"}], "title": "Expiry Date"}` |
| unit_cost | True | `{"anyOf": [{"type": "string", "pattern": "^(0&#124;[1-9][0-9]{0,17})(\\.[0-9]{1,18})?$"}, {"type": "null"}], "title": "Unit Cost"}` |
| currency | True | `{"type": "string", "pattern": "^[A-Z]{3}$", "title": "Currency"}` |
| observed_at | True | `{"type": "string", "format": "date-time", "title": "Observed At"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "pattern": "\\S", "title": "Reason"}` |
| expected_inventory_version | True | `{"type": "string", "maxLength": 128, "minLength": 1, "pattern": "\\S", "title": "Expected Inventory Version"}` |

Source evidence: `app/api/stock_writes.py:18`, handler `receive`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 15. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n7"></a>
## N7

### Baseline

`POST /api/v1/auth/credentials/complete`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/CredentialCompletion"}}}}`

Security: `[]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_CompletedCredential_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `CredentialCompletion`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| token | True | `{"type": "string", "maxLength": 512, "minLength": 1, "title": "Token", "writeOnly": true}` |
| password | True | `{"type": "string", "maxLength": 128, "minLength": 12, "format": "password", "title": "Password", "writeOnly": true}` |

### Hiện hành

`POST /api/v1/auth/credentials/complete`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/CredentialCompletion"}}}}`

Security: `[]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_CompletedCredential_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `CredentialCompletion`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| token | True | `{"type": "string", "maxLength": 512, "minLength": 1, "title": "Token", "writeOnly": true}` |
| password | True | `{"type": "string", "maxLength": 128, "minLength": 12, "format": "password", "title": "Password", "writeOnly": true}` |

Source evidence: `app/api/auth.py:79`, handler `complete`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n8"></a>
## N8

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`PUT /api/v1/stores/{store_id}/inventory/{ingredient_id}/threshold`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/ingredient_id | True | `{"type": "string", "format": "uuid", "title": "Ingredient Id"}` |
| header/Idempotency-Key | False | `{"anyOf": [{"type": "string", "maxLength": 128}, {"type": "null"}], "title": "Idempotency-Key"}` |
| header/X-CSRF-Token | False | `{"anyOf": [{"type": "string", "maxLength": 512}, {"type": "null"}], "title": "X-Csrf-Token"}` |
| header/If-Match | False | `{"anyOf": [{"type": "string", "maxLength": 256}, {"type": "null"}], "title": "If-Match"}` |
| header/Origin | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Origin"}` |

Request body: `{"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/ThresholdRequest"}}}}`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_ThresholdResult_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 412 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 428 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Request fields `ThresholdRequest`:

| Field | Required | Type/nullability/constraints |
| --- | --- | --- |
| minimum_usable_quantity | True | `{"anyOf": [{"type": "string", "maxLength": 200, "pattern": "^(0&#124;[1-9][0-9]*)(\\.[0-9]+)?$"}, {"type": "null"}], "title": "Minimum Usable Quantity"}` |
| unit | True | `{"type": "string", "maxLength": 128, "minLength": 1, "pattern": "\\S", "title": "Unit"}` |
| reason | True | `{"type": "string", "maxLength": 1000, "minLength": 1, "pattern": "\\S", "title": "Reason"}` |

Source evidence: `app/api/stock_writes.py:28`, handler `threshold`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 8. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-n9"></a>
## N9

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/stores/{store_id}/procurement-plans`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |
| query/status | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 64}, {"type": "null"}], "title": "Status"}` |
| query/forecast_start_from | False | `{"anyOf": [{"type": "string", "format": "date"}, {"type": "null"}], "title": "Forecast Start From"}` |
| query/forecast_start_to | False | `{"anyOf": [{"type": "string", "format": "date"}, {"type": "null"}], "title": "Forecast Start To"}` |
| query/sort | False | `{"const": "-accepted_at", "type": "string", "default": "-accepted_at", "title": "Sort"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/RunHistoryEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 413 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ConfigurationErrorEnvelope"}}}` | — |

Source evidence: `app/api/history.py:37`, handler `runs`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 11. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-p01"></a>
## P01

### Baseline

`GET /api/v1/stores/{store_id}/products`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/q | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Q"}` |
| query/status | False | `{"anyOf": [{"enum": ["active", "paused"], "type": "string"}, {"type": "null"}], "title": "Status"}` |
| query/sort | False | `{"enum": ["name", "-name", "selling_price", "-selling_price"], "type": "string", "default": "name", "title": "Sort"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/CatalogEnvelope_Menu_"}}}` | Cache-Control, X-Request-ID |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |

### Hiện hành

`GET /api/v1/stores/{store_id}/products`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/q | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Q"}` |
| query/status | False | `{"anyOf": [{"enum": ["active", "paused"], "type": "string"}, {"type": "null"}], "title": "Status"}` |
| query/sort | False | `{"enum": ["name", "-name", "selling_price", "-selling_price"], "type": "string", "default": "name", "title": "Sort"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/CatalogEnvelope_Menu_"}}}` | Cache-Control, X-Request-ID |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |

Source evidence: `app/api/public_reads.py:67`, handler `menu`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 3. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-p02"></a>
## P02

### Baseline

`GET /api/v1/stores/{store_id}/products/{product_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/product_id | True | `{"type": "string", "format": "uuid", "title": "Product Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/CatalogEnvelope_ProductDetail_"}}}` | Cache-Control, X-Request-ID |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |

### Hiện hành

`GET /api/v1/stores/{store_id}/products/{product_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/product_id | True | `{"type": "string", "format": "uuid", "title": "Product Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/CatalogEnvelope_ProductDetail_"}}}` | Cache-Control, X-Request-ID |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |

Source evidence: `app/api/public_reads.py:98`, handler `product`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 3. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-r01"></a>
## R01

### Baseline

Chưa có operation trong baseline OpenAPI; xem baseline design evidence, không kết luận design chưa tồn tại.

### Hiện hành

`GET /api/v1/stores/{store_id}/readiness`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/actions | False | `{"type": "string", "maxLength": 128, "default": "import,menu,inventory", "title": "Actions"}` |
| query/forecast_start_date | False | `{"anyOf": [{"type": "string", "format": "date"}, {"type": "null"}], "title": "Forecast Start Date"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_Readiness_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | — |

Source evidence: `app/api/readiness.py:20`, handler `readiness`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[{"path": "", "kind": "changed"}]`

Reachable schema JSON-pointer changes: 14. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-t01"></a>
## T01

### Baseline

`GET /api/v1/stores`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_StoreList_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`GET /api/v1/stores`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_StoreList_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/auth.py:85`, handler `stores`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-t02"></a>
## T02

### Baseline

`GET /api/v1/stores/{store_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_StoreContext_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

### Hiện hành

`GET /api/v1/stores/{store_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/Envelope_StoreContext_"}}}` | — |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 429 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ErrorEnvelope"}}}` | — |

Source evidence: `app/api/auth.py:96`, handler `store_context`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-v01"></a>
## V01

### Baseline

`GET /api/v1/stores/{store_id}/inventory`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/q | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Q"}` |
| query/ingredient_id | False | `{"anyOf": [{"type": "array", "items": {"type": "string", "format": "uuid"}}, {"type": "null"}], "title": "Ingredient Id"}` |
| query/status | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Status"}` |
| query/sort | False | `{"enum": ["name", "-name", "nearest_expiry"], "type": "string", "default": "name", "title": "Sort"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/InventoryEnvelope_InventoryList_"}}}` | Cache-Control, X-Request-ID |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |

### Hiện hành

`GET /api/v1/stores/{store_id}/inventory`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| query/q | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Q"}` |
| query/ingredient_id | False | `{"anyOf": [{"type": "array", "items": {"type": "string", "format": "uuid"}}, {"type": "null"}], "title": "Ingredient Id"}` |
| query/status | False | `{"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Status"}` |
| query/sort | False | `{"enum": ["name", "-name", "nearest_expiry"], "type": "string", "default": "name", "title": "Sort"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/InventoryEnvelope_InventoryList_"}}}` | Cache-Control, X-Request-ID |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |

Source evidence: `app/api/public_reads.py:117`, handler `inventory`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 3. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-v02"></a>
## V02

### Baseline

`GET /api/v1/stores/{store_id}/inventory/{ingredient_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/ingredient_id | True | `{"type": "string", "format": "uuid", "title": "Ingredient Id"}` |
| query/snapshot_id | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 128}, {"type": "null"}], "title": "Snapshot Id"}` |
| query/lot_limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Lot Limit"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/InventoryEnvelope_InventoryDetail_"}}}` | Cache-Control, X-Request-ID |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |

### Hiện hành

`GET /api/v1/stores/{store_id}/inventory/{ingredient_id}`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/ingredient_id | True | `{"type": "string", "format": "uuid", "title": "Ingredient Id"}` |
| query/snapshot_id | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 128}, {"type": "null"}], "title": "Snapshot Id"}` |
| query/lot_limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Lot Limit"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/InventoryEnvelope_InventoryDetail_"}}}` | Cache-Control, X-Request-ID |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |

Source evidence: `app/api/public_reads.py:159`, handler `inventory_detail`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 3. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-v03"></a>
## V03

### Baseline

`GET /api/v1/stores/{store_id}/inventory/{ingredient_id}/lots`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/ingredient_id | True | `{"type": "string", "format": "uuid", "title": "Ingredient Id"}` |
| query/snapshot_id | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 128}, {"type": "null"}], "title": "Snapshot Id"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |
| query/sort | False | `{"const": "expiry_date,batch_code", "type": "string", "default": "expiry_date,batch_code", "title": "Sort"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/InventoryEnvelope_Lots_"}}}` | Cache-Control, X-Request-ID |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |

### Hiện hành

`GET /api/v1/stores/{store_id}/inventory/{ingredient_id}/lots`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/ingredient_id | True | `{"type": "string", "format": "uuid", "title": "Ingredient Id"}` |
| query/snapshot_id | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 128}, {"type": "null"}], "title": "Snapshot Id"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |
| query/sort | False | `{"const": "expiry_date,batch_code", "type": "string", "default": "expiry_date,batch_code", "title": "Sort"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/InventoryEnvelope_Lots_"}}}` | Cache-Control, X-Request-ID |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |

Source evidence: `app/api/public_reads.py:187`, handler `lots`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-v04"></a>
## V04

### Baseline

`GET /api/v1/stores/{store_id}/inventory/{ingredient_id}/movements`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/ingredient_id | True | `{"type": "string", "format": "uuid", "title": "Ingredient Id"}` |
| query/snapshot_id | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 128}, {"type": "null"}], "title": "Snapshot Id"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |
| query/sort | False | `{"const": "-occurred_at", "type": "string", "default": "-occurred_at", "title": "Sort"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/InventoryEnvelope_Movements_"}}}` | Cache-Control, X-Request-ID |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |

### Hiện hành

`GET /api/v1/stores/{store_id}/inventory/{ingredient_id}/movements`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| path/store_id | True | `{"type": "string", "format": "uuid", "title": "Store Id"}` |
| path/ingredient_id | True | `{"type": "string", "format": "uuid", "title": "Ingredient Id"}` |
| query/snapshot_id | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 128}, {"type": "null"}], "title": "Snapshot Id"}` |
| query/limit | False | `{"type": "integer", "maximum": 100, "minimum": 1, "default": 50, "title": "Limit"}` |
| query/cursor | False | `{"anyOf": [{"type": "string", "minLength": 1, "maxLength": 4096}, {"type": "null"}], "title": "Cursor"}` |
| query/sort | False | `{"const": "-occurred_at", "type": "string", "default": "-occurred_at", "title": "Sort"}` |

Request body: `null`

Security: `[{"APIKeyCookie": []}]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/InventoryEnvelope_Movements_"}}}` | Cache-Control, X-Request-ID |
| 400 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 401 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 403 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 404 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 409 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 422 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |
| 503 | `{"application/json": {"schema": {"$ref": "#/components/schemas/ReadErrorEnvelope"}}}` | Cache-Control, X-Request-ID |

Source evidence: `app/api/public_reads.py:217`, handler `movements`; hash trong [source_evidence.json](source_evidence.json). Router dispatch tới application use case; semantics/effects/rights không nằm ở route count.

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

<a id="op-health_health_get"></a>
## health_health_get

### Baseline

`GET /health`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| — | — | Không parameters |

Request body: `null`

Security: `[]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/HealthResponse"}}}` | — |

### Hiện hành

`GET /health`

Parameters (exact schema; required theo generated OpenAPI):

| In/name | Required | Schema |
| --- | --- | --- |
| — | — | Không parameters |

Request body: `null`

Security: `[]` (current rights đọc trong use case, không chỉ cookie scheme).

| Status | Media/schema | Response headers |
| --- | --- | --- |
| 200 | `{"application/json": {"schema": {"$ref": "#/components/schemas/HealthResponse"}}}` | — |

Definition changes: `[]`

Reachable schema JSON-pointer changes: 0. Component/ref rename là schema diff, không tự là operation-definition change.

