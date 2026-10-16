# Trả lời Import Batch Mechanics — ShelfCash

Cập nhật FE hiện hành: **10/10/2026, S4.4 batch mechanics extension**. Người dùng
đã duyệt giữ multi-call accounting, ordered partial admission và evidence/receipt-set
revision semantics. I04 quota metadata đã implement additive, không path/DELETE/
admission-policy mới. Verification targeted trên guarded shelfcash_test, không
development DB/live OpenRouter/full suite. Bản khảo sát ban đầu là lịch sử;
không giữ ba clarification đã duyệt dưới nhãn cần quyết định.

## Nguồn và cách phân loại

- **ACCEPTED CONTRACT**: [Import contract](IMPORT_MAPPING_API_CONTRACT_VI.md),
  mục4/6/9.1/9.1a/10 (batch mechanics đã chốt); [Auth](AUTHORIZATION_CONTRACT_VI.md#auth-v1). Numeric limits đã chốt:
  **20 files/batch, 20 MiB/file, 100 MiB tổng uploaded source bytes/batch**;
  MiB=1.048.576 bytes. Không hỏi lại numeric limits.
- **CURRENT IMPLEMENTATION**: app/api/import_staging.py (`draft/upload/analyze/read`);
  app/application/use_cases/import_staging.py (`_draft/_files/_file/upload/analyze/
  _batch/_old/_request/_fail/read`); app/application/contracts/import_mapping.py
  (`DraftRequest/Draft/UploadResult/UploadFailure/AnalyzeRequest/SourceSet/ImportQuota/ImportRead`);
  app/models/import_staging.py; alembic/versions/0013_import_staging.py.
- **VERIFIED EVIDENCE**: [S44 notes](runbooks/S44_TASK_NOTES.md), resumption audit:
  COMPLETE authorized staging/preview, không toàn Import; explicit upload/dedup/seal
  và all-rejected group **2 passed,4.33s**; failed-analysis retry nằm group **4 passed,
  12.31s**. Historical combined gate59 passed không cộng với các nhóm overlap.
  Evidence mới tại [batch task notes](runbooks/IMPORT_BATCH_MECHANICS_TASK_NOTES.md):
  gate13 cases passed22.33s gồm real PG quota/races/read coherence và OpenAPI. Không
  cộng với các groups lịch sử. Test source tồn tại không tự là evidence đã chạy.
- Classification follow-up: [notes](runbooks/IMPORT_CLASSIFICATION_TASK_NOTES.md),
  [schema inventory](features/IMPORT_SCHEMA_INVENTORY.md),
  [shared-value feature](features/IMPORT_FIELD_VALUE_BINDINGS.md),
  [shared-value notes](runbooks/IMPORT_FIELD_VALUES_TASK_NOTES.md),
  [staging feature](features/IMPORT_STAGING_PREVIEW.md). Các updates này thêm typed
  sheet classification, profile/import values và per-import review; không thêm
  delete/unseal/quota release. Shared-value notes ghi targeted106 passed, sau đó
  các rerun34/13/40/13 và wording23; không cộng thành full-suite hoặc coverage A–F.
- **GAP / giới hạn còn tồn tại**: OpenAPI422/general validation error documentation,
  production load và giới hạn ngoài authorized staging; phần accounting/admission/
  revision đã có product authority, không còn câu hỏi chặn scope này.

Đường dẫn source/tests dưới đây là evidence trong repo, không legacy behavior.
Các file contract giữ nguyên. Kết luận HTTP giả thiết actor/Store/grants/Origin/CSRF/
key hợp lệ, DB hoạt động; lỗi auth/transport/persistence có thể chặn trước business
outcome. Upload acceptance chỉ nhận bytes, không chứng minh parser/schema/domain hợp lệ.

## 1. Bảng trả lời bảy câu hỏi

| Câu hỏi | ACCEPTED CONTRACT | CURRENT IMPLEMENTATION | VERIFIED EVIDENCE / GAP |
| --- | --- | --- | --- |
| 1. Multi-call accumulation | I02 nhận immutable bytes vào draft; không upload sau seal. Mục9.1a chốt nhiều calls trước seal. | Có nhiều calls. `upload` đọc tất cả ImportFile của batch, cộng count/size chỉ các record `uploaded`; state guard chính là `sealed==false`. Luồng bình thường là draft/uploaded; không allowlist status trong method. Không mở upload khi failed nhưng đã seal. | S44 `test_upload_retry_content_dedup_and_source_set_seal` gửi nhiều calls; new test_multicall_8_7_6_accepts_five_and_rejects_one đã chạy real PG/HTTP. |
| 2. Accepted vs submitted | Limits đã chốt, per-item acceptance; mục9.1a chốt accepted logical files/rejected không quota/blob dedup độc lập. | Batch quota tính logical accepted file records (`upload_status=uploaded`), không submitted attempts hoặc unique blob. Rejected không chiếm count/bytes. Tuy nhiên mỗi HTTP call còn guard1..20 submitted files; request21 files bị413 dù phần lớn invalid. | All-rejected case chứng minh rejected record/receipt có lưu. B18+2valid+1invalid xem scenario B; accounting đã được người dùng duyệt. |
| 3. Partial acceptance | Contract9.1 nêu per-item outcomes, all rejected422; atomic canonical commit không áp thành atomic byte acceptance. | Duyệt `entries` theo thứ tự multipart: A valid/B invalid/C valid thì A/C được nhận nếu đủ quota. Chỉ còn1 slot, hai valid: nhận file gặp trước, reject file sau; không pre-reserve cả request. Exception cấp request rollback toàn transaction. | Ordered per-file đã chốt9.1a; tests multi-call/byte boundary/concurrentI02 đã chạy. Không hứa fairness giữa concurrent calls. |
| 4. Byte accounting | Tổng actual uploaded source bytes ≤100 MiB; parser expanded limits độc lập. | `len(content)` và SHA-256 server bytes. CSV là bytes nguyên bản, cả BOM/newlines/encoding; XLSX là archive bytes nguyên bản, không uncompressed XML. Rejected/replay cùng client không cộng; new client ID cùng bytes cộng lại logical size. | Dedup test giữ1 blob/2 file records. Expanded XLSX200 MiB, sheets/rows/columns/ZIP safety là parser/analysis guard riêng, không thay100 MiB upload quota. |
| 5. Removal/quota release | Sau seal đổi bytes/file set thì draft mới; không replace. Không có contract delete. | Không DELETE/remove/replace route hoặc operation cho file. ImportFile/blob có immutable evidence triggers, physical DELETE bị chặn. `ignored` sheet/column là mapping semantic exclusion, file vẫn uploaded và vẫn chiếm quota. | Migration0013 immutable/sealed triggers, `test_db_prevents_evidence_update_delete` và `test_migration_roundtrip_preserves_canonical_rows`; không suy migration downgrade/test teardown là public delete. Không quota release workflow. |
| 6. Sealing/lifecycle | I03 seal accepted file set, không quietly omit; thay source cần draft mới. | Seal trong transaction I03 acceptance (`b.sealed=True` trước `_accept`/commit), visible khi commit, không đợi claim/completion. `_fail` không unset seal; nếu failed và chưa có analysis_json thì I03 retry explicit cùng source set/new job được, upload vẫn409. | Upload/seal case; `test_parser_failure_retains_location_and_retry_is_explicit`. Concurrent transitions dùng batch FOR UPDATE+populate_existing, DB sealed trigger. New tests actual PG I02 quota/ I02-I03 fences đã chạy. |
| 7. Canonical FE state | I01/I02 metadata receipt; I04 authoritative read, không compute import. | I01/I04 có accepted `file_count`, status/import_revision/file_set_version. I02 chỉ call items+versions. I04 có paged all entries, SourceSet.version/sealed/accepted_file_ids/digest/allowed_actions. Expose required quota object toàn batch; bốn fields xem mục4. | FE dùng data.quota authoritative độc lập files page; không cộng rejected.size_bytes/page length/local attempts. GET read/projection/staleness check, không parse/analyze/repreview hoặc mutate batch/quota. Auth session activity theo Auth policy khác import mutation. |

## 2. Algorithm và lỗi — evidence cụ thể

`ImportStaging.upload` làm lần lượt: validate request entry count/unique IDs → fingerprint
→ authorize current actor → lock và refresh batch (`_batch`, FOR UPDATE,
populate_existing) → receipt replay → sealed guard → đọc existing files → per-entry
client replay/type/byte/quota checks → lưu accepted blob hoặc rejected metadata →
đổi import_revision/file_set_version, lưu receipt/audit → commit atomic staging.

Priority per-file errors: bytes>20 MiB **hoặc** count≥20 **hoặc** acceptedBytes+
newBytes>100 MiB → RESOURCE_LIMIT_EXCEEDED; sau đó unknown type → INVALID_FILE_TYPE;
sau đó empty bytes → EMPTY_FILE. Khi đã hết slot, invalid file cũng có thể nhận
RESOURCE_LIMIT_EXCEEDED thay INVALID_FILE_TYPE. CSV/XLSX upload sniff không full parse:
.csv không PK và không NUL trong8.192 bytes đầu; .xlsx phải PK; malformed workbook
vẫn có thể uploaded rồi analysis fail. Client Content-Type/declared size không quota
source of truth. Filename normalized basename, cắt255 chars, dùng sniff extension.

Per-file rejected record có internal UUID nhưng API file_id=null, content_digest=null,
size_bytes actual rejected bytes, raw_digest giữ nội bộ để replay/conflict; blob bytes
rejected không được lưu. Rejected metadata không chiếm accepted quota nhưng tồn tại
trong I04/ack list. Rejected entries có thể nhiều hơn20 qua nhiều calls;20 là accepted
quota, không total metadata records hiện có. Vì vậy phải phân trang files của I04.

**Request-level rejection**, không per-file committed receipts: multipart/DTO/header
invalid422; mismatch pairing INVALID_IMPORT_CONFIGURATION422;1..20 count hoặc duplicate
client IDs trong cùng call413 RESOURCE_LIMIT_EXCEEDED; batch sealed409; client/key
conflict409; rights401/403/404; DB/uncertain persistence503. Nêu mã theo routes +
`upload/_request`, không quy mọi422 thành UploadFailure. Exception sau đã stage file
trong transaction rollback cả call, không giữ các entry trước exception.

`ImportBodyLimits` cap whole multipart request ở100 MiB+128 KiB overhead, streaming
actual request bytes trước decode/spooling. Đây là request guard khác batch quota:
rejected/replay bytes vẫn đi qua transport và có thể làm request413 trước per-file
outcomes. Không suy request payload >100 MiB được xử lý partial theo remaining quota.
Nếu connection/transport bị cắt trước service, không có committed file receipts.

**All returned items rejected**: I02 trả422 `UploadFailure`, data=null,
error.code=UPLOAD_REJECTED, details.items/import_revision/file_set_version và ETag.
Đây là transaction đã commit metadata/receipt, không rollback vì HTTP422. Nếu batch
đã có accepted files từ calls trước, vẫn422 theo **items của call**, status batch vẫn
uploaded. Nếu ít nhất một item uploaded (kể cả client replay), trả200 ImportEnvelope.
S44 all-rejected test chứng minh lỗi actionable và same-key receipt replay.

## 3. Retry, duplicate, revisions và acknowledgment

- Idempotency-Key phải UUID canonical. `_request` fingerprint ordered list gồm
  client ID, original filename, actual length và actual SHA-256 (I02 không nhận
  client checksum/size fields). Multipart chỉ files[]/client_file_ids[]; extra field422.
  `_old` scope actor+Store+operation/key; cùng key khác fingerprint409
  IDEMPOTENCY_KEY_REUSED. Đổi order/filename/payload cũng có thể đổi fingerprint.
- Same key/same body sau current authorization replay frozen receipt **trước seal**,
  không quota/revision/audit tăng lần nữa, kể cả batch đã seal sau original upload.
  Response/ETag là version lịch sử của receipt, không current state; phải I04 refresh.
- New key/same client ID, cùng raw checksum và normalized filename: trả file receipt
  cũ, không count/bytes thêm. Nhưng method vẫn đổi cả revisions/audit khi commit call
  mới, dù chỉ client replay; nếu đã sealed thì new-key409 (khác same-key replay).
- Same client ID khác raw bytes **hoặc normalized filename**409 rollback cả call.
  Điều này áp cả rejected client ID: không sửa file rejected bằng bytes mới và giữ
  ID cũ. Khi còn unsealed, submit corrected bytes với client ID/key mới; rejected
  receipt cũ vẫn phải acknowledge. Sau seal phải draft mới.
- Same bytes, tên/client ID mới: tạo accepted file record mới nếu đủ quota, cộng
  count+len(bytes), warning DUPLICATE_CONTENT nếu shared Store blob đã có. Blob dedup
  không file dedup. Digest equality không tự hợp nhất business data hoặc loại duplicate
  rows. `test_upload_retry_content_dedup_and_source_set_seal` assert1 blob/2 files.
- I02 successful service call với new key đổi **cả** import_revision/file_set_version
  kể cả tất cả rejected hoặc toàn client-ID replay. ACCEPTED CONTRACT9.1a chốt evidence/receipt-set revision,
  bao gồm rejected/client-only new-key calls; seal không đổi file_set_version. Không suy accepted count tăng chỉ vì version đổi.
- I03 cần If-Match import_revision (quoted opaque value), cùng file_set_version,
  accepted_file_ids bằng **toàn bộ** uploaded IDs và acknowledged_rejected_client_file_ids
  bằng **toàn bộ** rejected client IDs, set equality/không duplicates. Không ack parser
  failed như rejected upload. Missing/excess IDs422 INVALID_IMPORT_CONFIGURATION;
  missing If-Match428; stale import_revision412 IMPORT_REVISION_CONFLICT. Không seal
  hoặc tạo job nếu validations thất bại. Nếu zero uploaded409 NO_UPLOADED_FILES.

## 4. I01/I02/I04 fields và công thức cho FE

| Surface | Fields có thật | Field không có / cách đọc |
| --- | --- | --- |
| I01 Draft | import_id,display_number,store_id,data_date,status,import_revision,created_at,imported_at,file_count,file_set_version; response ETag import_revision | file_count=0,imported_at=null,draft mới. Không files/accepted bytes/sealed/remaining quota ở DTO này. |
| I02 UploadResult | import_id,import_revision,file_set_version,items[],warnings[]; ETag import_revision | Items chỉ call vừa gửi/replay, không authoritative whole batch count/bytes/status/seal. |
| I02 FileReceipt / I04 FileView | client_file_id,file_id|null,filename,type,size_bytes,content_digest|null,upload_status,error|null; I04 thêm parse_status | Rejected file_id=null; parse failed vẫn upload_status=uploaded và chiếm quota. |
| I04 ImportRead extends Draft | quota,active_job_id,files[],files_page,source_set,allowed_actions,preview,completion_available=false,configurations,review_confirmation,confirmation_usable | Files gồm accepted+rejected, page có thể không đủ; source_set.accepted_file_ids là full batch không page subset. |
| I04 SourceSet | version,sealed,accepted_file_ids[],digest | Digest hash ID+content digest list, không upload checksum từ client. Version=file_set_version. Seal nguồn khác status/job. |
| I04 quota required | accepted_file_count,accepted_total_bytes,remaining_file_slots,remaining_bytes: integer≥0 | Whole batch independent pagination; parse-failed uploaded tính; duplicate logical records cộng lại. |

Server tính N=file_count=|source_set.accepted_file_ids|=quota.accepted_file_count,
B=Σsize_bytes của uploaded records toàn batch=quota.accepted_total_bytes;
remaining_file_slots=20−N,remaining_bytes=104.857.600−B. Không unique-digest sum,
không include rejected, không expanded XLSX hoặc client size; MiB=1.048.576 bytes.
FE **không cần** fetch đủ file pages chỉ để tính quota. Khi cần render rejected/ack,
vẫn đọc đủ pages và cùng file_set_version. Source_set/version/quota/file_count cùng
refreshed batch read. Cursor invalidated thì refresh, không trộn snapshot metadata.

imported_at là first accepted upload UTC, không latest upload/analyze completion.
status uploaded còn có thể không analyzed; failed không có nghĩa unsealed.
allowed_actions lọc quyền/state, nhưng không hứa quota đủ cho file cụ thể. I04 có thể
đọc metadata và retained results/staleness bằng current read-set; không chạy parser,
worker/LLM/solver hay persist recalculation. Files/query scope cần current import.read
và sensitive reads như `_authority`; không giả import.upload mặc nhiên đủ I04 reads.

## 5. Scenarios A–F

Quy ước: mỗi call là new valid key/new client IDs, chưa seal, actor hợp lệ;
trừ E nói retry. Source bytes không bao gồm multipart overhead. “Valid” ở đây là
upload sniff/nonempty/≤20 MiB, không đảm bảo canonical valid. Nếu tổng request vượt
transport cap hoặc có conflict/auth error, request-level result thay per-file result.
R,V là opaque import_revision/file_set_version trước call; R′,V′ là giá trị server
mới, không counter và không thể ghi exact UUID trước khi nhận response.

### A. 8 accepted →7 accepted →6 valid mới

Hai bước đầu chỉ kết luận N=15 nếu đã accepted thành công; B15 chưa được cung cấp.
Với đủ byte budget cho5 file đầu trong call6, HTTP200: nhận5 đầu, reject file thứ6
RESOURCE_LIMIT_EXCEEDED, N=20, Bfinal=B15+Σbytes(5 file nhận), status=uploaded,
R′/V′ mới. Có thể nhận ít hơn5 do100 MiB và file sizes: với từng file, chỉ nhận nếu
N<20 và B+size≤cap; file lớn bị reject không ngăn file nhỏ sau còn fit. Zero nhận
thì422 UPLOAD_REJECTED, vẫn R′/V′ mới, N/B unchanged. Không thể cho exact B hoặc
khẳng định200 chỉ từ số file. FE đọc từng item, I04 refresh; phần muốn tiếp tục mà
không đủ quota cần batch mới, không DELETE/replace tự nghĩ ra. Evidence: upload loop.

### B. 18 accepted →2 valid +1 invalid

Không phải reject cả call chỉ vì18+3 submitted=21: submitted call3≤20. Giả sử order
valid1,valid2,invalid3 và B18+size1+size2≤cap, HTTP200; accepted2, rejected1,
N=20, Bfinal=B18+size1+size2, R′/V′ mới, status=uploaded. Invalid3 nhận
RESOURCE_LIMIT_EXCEEDED vì count priority, không nhất thiết INVALID_FILE_TYPE.
Nếu invalid ở trước quota đầy, lỗi cụ thể theo guard/type/empty. Chưa biết byte sizes
nên chỉ case đủ byte budget có thể kết luận accepted2; tổng khác có thể bớt nhận.
FE giữ rejected client ID để ack, không cộng size của nó; refresh I04 rồi I03 toàn
accepted IDs + rejected acknowledgment. Không giả exactB hoặc error type invalid chưa nói.

### C. 99 MiB accepted →2 files mỗi file1 MiB

Giả sử n≤19 accepted trước call, cả hai valid/new và request cap hợp lệ. HTTP200:
nhận file đầu, reject file sau RESOURCE_LIMIT_EXCEEDED; Bfinal=100 MiB=
104.857.600 bytes; Nfinal=n+1, không đủ dữ kiện cho exact N; R′/V′ mới, uploaded.
Nếu n=20 trước call, cả hai rejected,422 UPLOAD_REJECTED, Bfinal=99 MiB=
103.809.024 bytes, N=20; revisions vẫn đổi. FE render remainingBytes0 trong nhánh
nhận1; rejected bytes không cộng. Evidence: cumulative size/count+ordered checks.

### D. Concurrent uploads ở sát quota

Ví dụ thêm điều kiện rõ: N0=19, đủ byte budget cho một file, mỗi call một valid/new
file khác nhau. Call lấy được lock/commit trước:200 accepted1; call sau refresh batch:
422 rejected1 RESOURCE_LIMIT_EXCEEDED. Final N=20, B=B0+size(file thắng), statusuploaded;
hai committed calls tạo hai revision generations, final là call commit sau. Không
hứa winner theo thời điểm click/start/network; không có fairness ordering policy.
Sát bytes cũng check quota dưới lock trước mỗi accepted file. Source không cho hai
I02 hợp lệ cùng batch vượt quota qua race này; **VERIFIED EVIDENCE mới**:
test_concurrent_i02_cannot_exceed_count_or_bytes (2 real PG cases). Test jobs cũ
không được dùng thay quota concurrency evidence. FE refresh sau cả kết quả.

### E. Lost response rồi retry

Nếu original committed: same key/client IDs/order/filename/bytes trả cùng status200
hoặc422 và frozen receipt; N/B/R/V không thay thêm. Nếu original rollback/chưa commit:
retry xử lý một lần theo current quota/state; chưa biết original outcome thì không
thể ghi exact count/bytes/revision. Existing uncertain commit exception503 không
chứng minh rollback; reconcile samekey + I04. Token/grants mất thì không guarantee
successful replay. New key/new client ID cùng bytes có thể accepted duplicate và
chiếm quota; không gọi đó là retry an toàn. FE giữ intent IDs/key, disable duplicate
submit, không cộng local receipt vào quota; refresh authoritative state.
Evidence: `_old`, upload receipt-before-seal; upload retry/all-rejected tests.

### F. Upload trong lúc analyze/seal

Nếu I03 lock/commit trước:202 analysis accepted, sealed=true, statusanalyzing,
active_job_id mới, import_revision mới, file_set_version unchanged; new I02 sau409
IMPORT_STATE_CONFLICT, N/B không đổi. Nếu I02 lock/commit trước:200/422 per-file outcome,
R′/V′ đổi; I03 request dùng R/V cũ trả412 IMPORT_REVISION_CONFLICT, không seal/job,
N/B là kết quả upload; FE I04 refresh, dựng lại full IDs/ack/If-Match rồi I03.
I03 trướccommit chưa phải seal externally visible; rollback I03 không seal. Worker
claim/completion không quyết định admission. Failed analysis không reopen: I04 có
thể offer analyze retry nếu analysis_json=null/statusfailed, same source/new job;
thay bytes/thêm file cần new draft. Exception case E cùng-key old receipt có thể
replay sau seal; không có new upload. Race evidence mới: test_upload_analyze_race_fenced_at_actual_database_batch_lock
(2 real PG cases), upload-first và seal-first; không fake DB locking bằng mock.

## 6. Current wire examples đúng DTO

Các JSON dưới đây synthetic, revisions/digests/IDs minh họa, không HTTP acceptance.
Headers browser: Origin allowlist, current session cookie, X-CSRF-Token, UUID
Idempotency-Key; I03 thêm If-Match quoted import_revision. I02 không nhận If-Match
CAS trong route hiện hành; quota/source-set admission serialize server side.

I01 request, response201:

```json
{
  "data_date": "2026-10-10"
}
```

```json
{
  "data": {
    "import_id": "00000000-0000-4000-8000-000000000001",
    "display_number": "IMP-00000000-0000-4000-8000-000000000001",
    "store_id": "00000000-0000-4000-8000-000000000002",
    "data_date": "2026-10-10",
    "status": "draft",
    "import_revision": "revision-draft",
    "created_at": "2026-10-10T01:00:00Z",
    "imported_at": null,
    "file_count": 0,
    "file_set_version": "set-draft"
  },
  "meta": {
    "request_id": "synthetic-request",
    "warnings": [],
    "poll_after_ms": null,
    "pagination": null
  },
  "error": null
}
```

I02 multipart request (không JSON upload body): paired files[]=(source.csv, actual
8 bytes `a,b\n1,2\n`) và client_file_ids[]=UUID…003; một invalid bad.exe actual7 bytes
đi kèm client UUID…004. Response200 có accepted/rejected riêng:

```json
{
  "data": {
    "import_id": "00000000-0000-4000-8000-000000000001",
    "import_revision": "revision-upload",
    "file_set_version": "set-upload",
    "items": [
      {
        "client_file_id": "00000000-0000-4000-8000-000000000003",
        "file_id": "00000000-0000-4000-8000-000000000005",
        "filename": "source.csv",
        "type": "csv",
        "size_bytes": 8,
        "content_digest": "sha256:492d5ea496056f1a6a6592241032fab764c321596317930b4fa0e1e8bc3b7470",
        "upload_status": "uploaded",
        "error": null
      },
      {
        "client_file_id": "00000000-0000-4000-8000-000000000004",
        "file_id": null,
        "filename": "bad.exe",
        "type": "unknown",
        "size_bytes": 7,
        "content_digest": null,
        "upload_status": "rejected",
        "error": {
          "code": "INVALID_FILE_TYPE",
          "message": "INVALID_FILE_TYPE",
          "approval_request_allowed": false
        }
      }
    ],
    "warnings": []
  },
  "meta": {
    "request_id": "synthetic-request",
    "warnings": [],
    "poll_after_ms": null,
    "pagination": null
  },
  "error": null
}
```

Call khác chỉ invalid bad.exe: response422 shape sau đây, không general validation422.
Synthetic revisions ở đây mô tả call đã commit rejected receipt:

```json
{
  "data": null,
  "meta": {
    "request_id": "synthetic-request",
    "warnings": [],
    "poll_after_ms": null,
    "pagination": null
  },
  "error": {
    "code": "UPLOAD_REJECTED",
    "message": "UPLOAD_REJECTED",
    "details": {
      "items": [
        {
          "client_file_id": "00000000-0000-4000-8000-000000000004",
          "file_id": null,
          "filename": "bad.exe",
          "type": "unknown",
          "size_bytes": 7,
          "content_digest": null,
          "upload_status": "rejected",
          "error": {
            "code": "INVALID_FILE_TYPE",
            "message": "INVALID_FILE_TYPE",
            "approval_request_allowed": false
          }
        }
      ],
      "import_revision": "revision-rejected",
      "file_set_version": "set-rejected",
      "approval_request_allowed": false
    }
  }
}
```

I03 request sau đọc đầy đủ state, accepted1/rejected1:

```json
{
  "file_set_version": "set-upload",
  "accepted_file_ids": [
    "00000000-0000-4000-8000-000000000005"
  ],
  "acknowledged_rejected_client_file_ids": [
    "00000000-0000-4000-8000-000000000004"
  ]
}
```

I04 response200 ví dụ draft rỗng với quota metadata required đúng DTO:

```json
{
  "data": {
    "import_id": "00000000-0000-4000-8000-000000000001",
    "display_number": "IMP-00000000-0000-4000-8000-000000000001",
    "store_id": "00000000-0000-4000-8000-000000000002",
    "data_date": "2026-10-10",
    "status": "draft",
    "import_revision": "revision-draft",
    "created_at": "2026-10-10T01:00:00Z",
    "imported_at": null,
    "file_count": 0,
    "file_set_version": "set-draft",
    "active_job_id": null,
    "files": [],
    "files_page": {
      "limit": 50,
      "next_cursor": null,
      "total_count": 0
    },
    "source_set": {
      "version": "set-draft",
      "sealed": false,
      "accepted_file_ids": [],
      "digest": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
    },
    "allowed_actions": [
      "upload"
    ],
    "preview": null,
    "completion_available": false,
    "configurations": null,
    "review_confirmation": null,
    "confirmation_usable": false,
    "quota": {
      "accepted_file_count": 0,
      "accepted_total_bytes": 0,
      "remaining_file_slots": 20,
      "remaining_bytes": 104857600
    }
  },
  "meta": {
    "request_id": "synthetic-request",
    "warnings": [],
    "poll_after_ms": null,
    "pagination": null
  },
  "error": null
}
```

## 7. FE workflow đề nghị từ behavior hiện hành

1. Local precheck: cùng batch dùng data.quota.remaining_file_slots/remaining_bytes từ I04 snapshot;
   size rawFile.size đúng bytes, mỗi file≤20 MiB, call≤20 submitted. Sniff/type check
   local chỉ feedback; server bytes/hash authoritative. Quota phản ánh
   snapshot, concurrent upload có thể đổi quota trước submit; server admission cuối cùng.
2. Tạo draft I01; giữ import_id, UUID intent keys và từng client_file_id. Multipart
   pairs theo thứ tự hiển thị; đừng đổi order/key/client IDs khi retry response loss.
3. Gửi I02; render **mỗi item**.200 không nghĩa tất cả accepted;422 UPLOAD_REJECTED
   có committed receipts cần đọc error.details, khác request-level lỗi không receipts.
4. Refresh I04 với quyền hợp lệ; quota authoritative không phụ thuộc files_limit/cursor; N reconcile file_count
   và full accepted IDs. Đọc đủ rejected pages khi chuẩn bị acknowledgment. Không cộng optimistic new files hoặc replay vào old state.
   Rejected entries hiển thị riêng, không quota; không nút xóa giả hoặc ignore=release.
5. Analyze: dùng current If-Match/file_set_version/full accepted IDs/full rejected ack.
   Nếu412 refresh; nếu202 source đã sealed, khóa upload ngay, poll J01/I04 read-only.
   Failed analysis retry theo allowed_actions, không auto reopen. Muốn đổi source dùng
   draft mới; classification/shared-value edits thuộc mapping, không thay uploaded bytes.

## 8. Semantics đã chốt và giới hạn còn lại

**ACCEPTED CONTRACT, không còn pending**: multi-call accepted logical file quota,
rejected không count/bytes, new client ID cùng bytes tính file mới; ordered per-file
remaining-quota admission; file_set_version evidence/receipt-set revision gồm
new-key rejected/client-replay, same-key replay không thêm, seal không đổi version.
Chi tiết duy nhất tại [Import9.1a](IMPORT_MAPPING_API_CONTRACT_VI.md#import-batch-mechanics).
Không hỏi lại numeric limits hoặc ba lựa chọn đã chốt.

**CURRENT IMPLEMENTATION / VERIFIED EVIDENCE**: required I04 quota, whole batch,
current permissions/Store/page semantics; refreshed batch after authorization tránh
cached revision cũ với file records mới. New test tái hiện stale revision trước fix,
sau fix real PG reader metadata/count/quota khớp committed upload. No admission-policy
change. GET không parser/jobs/LLM/canonical hoặc import mutation; Auth activity theo
existing session policy khác import writes.

**GAP / chưa nằm trong verification**:

- I02 OpenAPI422 khai báo UploadFailure, nhưng request-validation422 runtime có thể
  trả general Auth ErrorEnvelope. FE phân nhánh error.code/details; tài liệu nêu cả
  hai. Chưa thay route/DTO lỗi trong quota-only extension này.
- Không remove/replace/quota release; ignore không trả quota. Canonical atomic commit,
  receipt/count/supplier writer integrations thuộc S4.5/S4.6, chưa bắt đầu.
- Near-limit bytes đã có HTTP/PG scenarios, nhưng không production memory/latency/load
  certification hoặc customer files. Expanded-XLSX parser guards giữ cũ, không bằng
  accepted-byte quota. Không live Qwen/OpenRouter hoặc browser FE verification.

## 9. Verification hiện hành

New targeted gate: `.venv/Scripts/python.exe -m pytest tests/integration/test_import_batch_mechanics.py tests/api/test_import_openapi.py -q --tb=short --maxfail=2`
→ **13 passed,22.33s**, real PostgreSQL17.11 local shelfcash_test, fresh Sessions,
count/byte races và controlled metadata refresh race. Parser/provider hooks bị cấm
trong quota tests. Initial provider-hook test fixture lỗi tên đã sửa; pre-implementation
quota missing và old metadata được tái hiện failed rồi fixed, không hidden failures.

Affected caller gate: **48 passed, 106.44s** (staging, classification, field-value
bindings và OpenAPI), có overlap với gate 13; không cộng tổng.

Affected callers/commands/results, OpenAPI diff và documentation/protected-hash checks
nằm tại [task notes](runbooks/IMPORT_BATCH_MECHANICS_TASK_NOTES.md). Các gates overlap,
không cộng thành tổng full-suite. Không development DB, migration mới, provider thật,
engine/solver change/commit/stage/push/ZIP/S4.5/S4.6. Acceptance cũ là historical,
không lấy source/tests presence để thay kết quả chạy hiện hành.
