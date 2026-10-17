# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: design-states.api.spec.ts >> PDF captures chosen alternative and download failure retries artifact only
- Location: tests\e2e\design-states.api.spec.ts:99:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog').getByText('PDF sẵn sàng', { exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('dialog').getByText('PDF sẵn sàng', { exact: true }) with timeout 5000ms
  - waiting for getByRole('dialog').getByText('PDF sẵn sàng', { exact: true })

```

```yaml
- link "Đi tới nội dung":
  - /url: "#app-content"
- complementary "Điều hướng ứng dụng":
  - button "Thu gọn sidebar" [expanded]
  - navigation "Các phân hệ ShelfCash":
    - link "Hôm nay":
      - /url: /today
    - link "Nhập dữ liệu":
      - /url: /imports
    - link "Dự đoán":
      - /url: /forecast
    - link "Kho":
      - /url: /inventory
    - link "Menu":
      - /url: /menu
    - link "Cửa hàng":
      - /url: /store
  - button "Đăng xuất"
- banner:
  - navigation "Vị trí trong ShelfCash":
    - link "Dự đoán":
      - /url: /forecast/planning
    - text: Kế hoạch nhập
  - text: ShelfCash
  - link "Thông báo · 0 chưa đọc":
    - /url: /notifications
- paragraph:
  - link "Lịch sử kế hoạch":
    - /url: /forecast/planning/history
- main "Kế hoạch nhập":
  - heading "Kế hoạch nhập" [level=1]
  - paragraph: 11/10/2026 · 7 ngày · kết quả đã lưu
  - button "Hỏi ShelfCash"
  - button "Bản xuất đã có"
  - button "Xuất PDF"
  - dialog "Xuất kế hoạch PDF":
    - heading "Xuất kế hoạch PDF" [level=2]
    - paragraph: Kế hoạch nhập · kết quả đã lưu
    - button "Đóng Xuất kế hoạch PDF": ×
    - term: Khoảng dự báo
    - definition: 2026-10-11 · 7 ngày
    - term: Run
    - definition: d0900000-0000-4000-8000-000000000001
    - term: Phương án
    - definition: An toàn
    - text: Phương án sẽ xuất
    - combobox "Phương án sẽ xuất" [disabled]:
      - option "Phương án đề xuất đã lưu"
      - option "Tiết kiệm / Cân bằng"
      - option "An toàn" [selected]
    - paragraph: Chọn phương án để xuất không thay đổi winner của Run.
    - heading "PDF sẽ bao gồm" [level=3]
    - list:
      - listitem: Tổng quan phương án đã lưu
      - listitem: Nguyên liệu và số lượng đề xuất
      - listitem: Chi phí, cảnh báo và ràng buộc chính
      - listitem: Lý do lựa chọn phương án
    - paragraph: Mở cửa sổ chưa tạo tác vụ. Chỉ xác nhận xuất mới gửi yêu cầu.
    - alert:
      - heading "Chưa xác nhận được trạng thái" [level=3]
      - paragraph: HTTP success status không đúng contract của operation.
      - paragraph: Giữ nguyên Run và locator hiện có.
    - status:
      - heading "Chưa biết tác vụ đã được tạo hay chưa" [level=3]
      - paragraph: Thử lại giữ nguyên phương án, body và key. Không tạo export thay thế.
    - paragraph: Xuất PDF không đặt hàng hoặc thay đổi tồn kho.
    - button "Đóng"
    - button "Thử lại cùng yêu cầu"
    - button "Debug"
  - button "Thiết lập mới"
  - strong: Run lịch sử · chỉ đọc
  - text: Kết quả lịch sử bất biến. Không tái dựng từ tồn kho, công thức hoặc ngân sách hiện tại.
  - tablist "Kế hoạch nhập":
    - tab "Tổng quan" [selected]
    - tab "Nguyên liệu"
    - tab "Phương án khác"
    - tab "Lý do"
    - button "Kịch bản giả định"
  - tabpanel "Tổng quan":
    - article:
      - heading "Chi phí dự kiến" [level=2]
      - strong: 7.000 VND
      - text: Tổng chi phí canonical của phương án được chọn
      - img "Chi phí đề xuất retained 7.000 VND so với ngân sách run 1.000.000 VND"
      - text: 0,7% ngân sách run · không phải tiền đã chi
    - article:
      - heading "Cần nhập" [level=2]
      - strong: Chưa biết
      - text: 1 dòng mua; chưa có tổng nguyên liệu toàn kế hoạch
    - article:
      - heading "Mức đáp ứng" [level=2]
      - strong: Chưa đánh giá
      - text: Không có tỷ lệ tổng; xem theo món và đường nhu cầu
    - heading "Kế hoạch mua hàng" [level=2]
    - text: Tiết kiệm / Cân bằng
    - list:
      - listitem:
        - button "Dòng Nguyên liệu · …000004 Mua 7 l 7.000 VND":
          - text: "1"
          - strong: Nguyên liệu · …000004
          - text: Mua 7 l 7.000 VND
    - group: Xem toàn bộ kế hoạch
    - region "Cảnh báo của kết quả":
      - heading "Cảnh báo của kết quả" [level=3]
      - list:
        - listitem:
          - text: Dữ liệu ví dụ DEV/QA; không phải kết quả Backend thật.
          - code: SYNTHETIC_QA_FIXTURE
      - button "Vì sao?"
    - region "Cảnh báo dự báo":
      - heading "Cảnh báo dự báo" [level=3]
      - list:
        - listitem:
          - text: Dữ liệu ví dụ DEV/QA; không phải kết quả Backend thật.
          - code: SYNTHETIC_QA_FIXTURE
    - group: Phạm vi món và dữ liệu bị loại
    - group: Thông tin dự báo đã lưu
    - paragraph: "Cơ sở vận hành: CURRENT_CAPTURE · Ngày chụp 11/10/2026 · Asia/Ho_Chi_Minh. Đây không phải tái tạo tồn kho lịch sử."
    - button "Tạo Draft PO"
    - button "Xem phương án khác"
    - button "Xem lý do từ engine"
    - group: Thông tin lần lập kế hoạch
```

# Test source

```ts
  14  |     if(path==='/api/v1/auth/logout'){writes++;return {httpStatus:204}}
  15  |     if(method==='POST')throw Error('Unexpected business write')
  16  |   })
  17  |   await page.goto(`/invitations/${invite}#token=${proof}`)
  18  |   await expect(page.getByRole('heading',{name:'Hãy đăng nhập bằng tài khoản khác'})).toBeVisible()
  19  |   await expect(page.getByText('controlled@example.invalid',{exact:true})).toBeVisible()
  20  |   await expect(page.getByText('Invited Store')).toHaveCount(0)
  21  |   expect(page.url()).not.toContain('#')
  22  |   await page.getByRole('button',{name:'Đăng nhập bằng tài khoản khác'}).click()
  23  |   await expect.poll(()=>writes).toBe(1)
  24  | })
  25  | 
  26  | for(const status of ['expired','revoked'] as const)test(`invitation ${status} is terminal without acceptance writes`,async({page})=>{
  27  |   let writes=0
  28  |   await backend(page,(path,method)=>{if(method==='POST')writes++;if(path===`/api/v1/staff-invitations/${invite}`)return offer(status)})
  29  |   await page.goto(`/invitations/${invite}#token=${proof}`)
  30  |   await expect(page.getByRole('heading',{name:status==='expired'?'Lời mời đã hết hạn':'Lời mời không còn hiệu lực'})).toBeVisible()
  31  |   await expect(page.getByRole('button',{name:'Chấp nhận lời mời'})).toHaveCount(0)
  32  |   expect(writes).toBe(0)
  33  | })
  34  | 
  35  | test('acceptance lost ACK preserves intent and opens freshly verified invited Store',async({page})=>{
  36  |   const writes:any[]=[];let accepted=false,sessionReads=0,storeReads=0
  37  |   await backend(page,(path,method,body,headers)=>{
  38  |     if(path==='/api/v1/auth/me'){sessionReads++;return env({user:{user_id:user,email:'controlled@example.invalid',display_name:'QA'},session:{expires_at:'2027-01-01T00:00:00Z',absolute_expires_at:'2027-01-02T00:00:00Z',csrf_token:'controlled-csrf'},default_store_id:accepted?s:null,accessible_store_count:accepted?1:0,authorization_version:accepted?'auth/2':'auth/1'})}
  39  |     if(path===`/api/v1/staff-invitations/${invite}`)return offer(accepted?'accepted':'pending')
  40  |     if(path.endsWith('/accept')){writes.push({body,headers});accepted=true;if(writes.length===1)return 'ABORT';return env({invitation_id:invite,invitation_version_at_acceptance:'invite/1',store_id:s,membership_id:member,role:'STAFF',accepted_grants:['inventory.read'],authorization_version_at_acceptance:'staff/2',accepted_at:at,event_id:exp,next_action:'refresh_store_context'})}
  41  |     if(path==='/api/v1/stores')return env({items:[{store_id:s,name:'Invited Store',timezone:'Asia/Ho_Chi_Minh',currency:'VND',role:'STAFF',membership_id:member,authorization_version:'staff/2'}]},paging(1))
  42  |     if(path===`/api/v1/stores/${s}`){storeReads++;return env({store_id:s,name:'Invited Store',timezone:'Asia/Ho_Chi_Minh',currency:'VND',role:'STAFF',membership_id:member,authorization_version:'staff/2',active:true,server_now:at,as_of_date:'2026-10-12',membership:{membership_id:member,role:'STAFF',authorization_version:'staff/2',effective_permissions:['inventory.read','ingredient.read']},permission_catalog_version:'permissions-v3'})}
  43  |   })
  44  |   await page.goto(`/invitations/${invite}#token=${proof}`)
  45  |   await page.getByRole('button',{name:'Chấp nhận lời mời',exact:true}).click()
  46  |   await expect(page.getByText('Chưa xác nhận được kết quả',{exact:true})).toBeVisible()
  47  |   await page.getByRole('button',{name:'Kiểm tra lại trạng thái'}).click()
  48  |   await expect(page.getByText('Quyền truy cập đã được xác nhận',{exact:true})).toBeVisible()
  49  |   expect(writes).toHaveLength(2);expect(writes[0]).toEqual(writes[1]);expect(sessionReads).toBeGreaterThan(1);expect(storeReads).toBeGreaterThan(0)
  50  |   await page.getByRole('link',{name:'Đi tới cửa hàng',exact:true}).click()
  51  |   await expect(page.getByRole('heading',{name:'Cửa hàng',exact:true})).toBeVisible()
  52  |   await expect(page.getByLabel('Cửa hàng hiện tại')).toHaveValue(s)
  53  |   await expect.poll(()=>new URL(page.url()).searchParams.has('store_id')).toBe(false)
  54  |   await page.screenshot({path:'test-results/009-onboarding-store.png',animations:'disabled'})
  55  | })
  56  | 
  57  | test('credential UI retains 12-character contract, hides token and never auto-logins',async({page})=>{
  58  |   let writes=0,logins=0
  59  |   await backend(page,(path,method,body,headers)=>{
  60  |     if(path==='/api/v1/auth/credentials/complete'){writes++;expect(method).toBe('POST');expect(headers['x-csrf-token']).toBeUndefined();expect(body.password).toBe('Strong password 009');return env({completed_at:at,next_action:'login'})}
  61  |     if(path==='/api/v1/auth/login')logins++
  62  |   })
  63  |   await page.goto('/credentials/complete#token=synthetic-credential-proof')
  64  |   await page.getByLabel('Mật khẩu mới',{exact:true}).fill('short123')
  65  |   await page.getByLabel('Xác nhận mật khẩu',{exact:true}).fill('short123')
  66  |   await page.getByRole('button',{name:'Hoàn tất thiết lập',exact:true}).click()
  67  |   await expect(page.getByRole('alert')).toContainText('12–128')
  68  |   expect(writes).toBe(0)
  69  |   await page.getByLabel('Mật khẩu mới',{exact:true}).fill('Strong password 009')
  70  |   await page.getByLabel('Xác nhận mật khẩu',{exact:true}).fill('Strong password 009')
  71  |   await page.getByRole('button',{name:'Hoàn tất thiết lập',exact:true}).click()
  72  |   await expect(page.getByRole('heading',{name:'Thiết lập tài khoản đã hoàn tất'})).toBeVisible()
  73  |   expect(writes).toBe(1);expect(logins).toBe(0);expect(page.url()).not.toContain('token=')
  74  |   await page.screenshot({path:'test-results/009-credential-success.png',animations:'disabled'})
  75  | })
  76  | 
  77  | async function fillReceipt(page:Page){const d=page.getByRole('dialog');await d.getByRole('combobox',{name:'Nguyên liệu',exact:true}).fill('Sữa tươi');await d.getByRole('option',{name:/Sữa tươi/}).click();await d.getByLabel(/Số lượng thực nhận/).fill('2.125');await d.getByLabel('Hệ thống/chứng từ nguồn').fill('qa-009');await d.getByLabel('Mã dòng nhận hàng duy nhất').fill('readback');await d.getByLabel(/Thời điểm quan sát/).fill(at);await d.getByLabel('Lý do',{exact:true}).fill('Readback recovery');await d.getByLabel('Tôi đã kiểm tra dữ liệu và xác nhận ghi.').check();await d.getByRole('button',{name:'Tiếp tục',exact:true}).click();return d}
  78  | 
  79  | test('confirmed receipt with failed readback retries reads without another receipt write',async({page})=>{
  80  |   const id='10000000-0000-0000-0000-000000000001',rows=structuredClone(inventoryFixtureItems),lots=structuredClone(inventoryFixtureLots),moves=structuredClone(inventoryFixtureMovements),meta=structuredClone(inventoryFixtureMeta)
  81  |   let writes=0,failNext=false
  82  |   await backend(page,(path,method)=>{
  83  |     if(path.endsWith('/inventory/receipts')){writes++;failNext=true;const row=rows.find(r=>r.ingredient_id===id)!;row.on_hand_quantity='17.625';meta.snapshot_id='readback/2';meta.data_version='readback/2';const lot={...lots[id][1],lot_id:exp,quantity:'2.125'},movement={...moves[id][0],movement_id:jobId,lot_id:exp,quantity_delta:'2.125',kind:'receipt',origin:'ACTUAL_RECEIPT'};lots[id].push(lot);moves[id].unshift(movement);return env({receipt_id:exp,origin:'ACTUAL_RECEIPT',lot,movement,inventory_version:meta.data_version,audit_reference:jobId,warnings:[]})}
  84  |     if(path.endsWith('/inventory')){if(failNext){failNext=false;return 'ABORT'}return env({summary:inventoryFixtureSummary,items:rows,missing_ingredient_ids:[]},{...meta,...paging(rows.length)})}
  85  |     if(path.endsWith('/lots'))return env({ingredient_id:id,items:lots[id]},{...meta,...paging(lots[id].length)})
  86  |     if(path.endsWith('/movements'))return env({ingredient_id:id,items:moves[id]},{...meta,...paging(moves[id].length)})
  87  |     if(path.endsWith('/'+id))return env({...rows.find(r=>r.ingredient_id===id),lots:lots[id],lots_page:{next_cursor:null,total_count:lots[id].length},threshold_version:'threshold/1'},meta)
  88  |     if(method==='POST')throw Error('Unexpected write')
  89  |   })
  90  |   await page.goto('/inventory');await page.getByRole('button',{name:'Nhận hàng / Tồn đầu kỳ'}).click();const d=await fillReceipt(page)
  91  |   expect(writes).toBe(0)
  92  |   await d.getByRole('button',{name:'Xác nhận nhận hàng',exact:true}).click()
  93  |   await expect(d.getByRole('heading',{name:'Đã ghi nhận hàng, nhưng chưa tải đủ dữ liệu mới nhất'})).toBeVisible()
  94  |   await d.getByRole('button',{name:'Thử tải lại dữ liệu'}).click()
  95  |   await expect(d.getByText(/Đã đọc snapshot mới: 17.625/)).toBeVisible();expect(writes).toBe(1)
  96  |   await d.screenshot({path:'test-results/009-receipt-recovered.png',animations:'disabled'})
  97  | })
  98  | 
  99  | test('PDF captures chosen alternative and download failure retries artifact only',async({page})=>{
  100 |   const run=planningRunFixture(),option='controlled-alternative',bytes=Buffer.from('%PDF-1.4\ncontrolled artifact\n%%EOF\n'),hash=createHash('sha256').update(bytes).digest('hex')
  101 |   run.result!.options[0].source_strategies=['lean','balanced'];run.result!.strategies.find(s=>s.strategy==='protected')!.option_id=option
  102 |   run.result!.options.push(planningOptionFixture({option_id:option,source_strategies:['protected'],not_selected_reason:'HIGHER_COST'}))
  103 |   let writes=0,downloads=0
  104 |   await backend(page,(path,method,body)=>{
  105 |     if(path===`/api/v1/procurement-plans/${run.run_id}`)return {data:run,meta:{poll_after_ms:0,warnings:[]},error:null}
  106 |     if(method==='POST'){writes++;expect(body.option_id).toBe(option);return env({export_id:exp,run_id:run.run_id,option_id:option,status:'queued',job_id:jobId,result_digest:PLANNING_FIXTURE_IDS.digest,render_version:'planning-pdf/1'},{poll_after_ms:2000})}
  107 |     if(path===`/api/v1/jobs/${jobId}`)return env({job_id:jobId,operation:'planning_pdf_export',status:'completed',stage:'completed',progress:1,created_at:at,started_at:at,completed_at:at,context:{store_id:s,run_id:run.run_id,export_id:exp},result:{resource_type:'planning_pdf_export',resource_id:exp,run_id:run.run_id,option_id:option,download_url:`/api/v1/procurement-plans/${run.run_id}/exports/${exp}`,sha256:hash,byte_count:bytes.length,media_type:'application/pdf'},error:null},{poll_after_ms:0,pagination:null,warnings:[]})
  108 |     if(path.endsWith('/exports/'+exp)){downloads++;return downloads===1?'ABORT':bytes}
  109 |   })
  110 |   await page.goto('/forecast/planning?plan_id='+run.run_id+'&historical=1')
  111 |   await expect(page.getByText('Run lịch sử · chỉ đọc',{exact:true})).toBeVisible()
  112 |   await page.getByRole('button',{name:'Xuất PDF',exact:true}).click();const d=page.getByRole('dialog')
  113 |   await d.getByLabel('Phương án sẽ xuất').selectOption(option);expect(writes).toBe(0)
> 114 |   await d.getByRole('button',{name:'Xác nhận xuất PDF'}).click();await expect(d.getByText('PDF sẵn sàng',{exact:true})).toBeVisible()
      |                                                                                                                         ^ Error: expect(locator).toBeVisible() failed
  115 |   await d.getByRole('button',{name:'Tải PDF',exact:true}).click();await expect(d.getByRole('button',{name:'Thử lại tải'})).toBeVisible()
  116 |   const download=page.waitForEvent('download');await d.getByRole('button',{name:'Thử lại tải'}).click();await download
  117 |   await expect(d.getByRole('heading',{name:'Tải PDF thành công'})).toBeVisible();expect(writes).toBe(1);expect(downloads).toBe(2)
  118 | })
  119 | 
  120 | test('History paginates same snapshot and empty filters never manufacture budget or results',async({page})=>{
  121 |   const run=planningRunFixture(),second='00000000-0000-4000-8000-000000000064'
  122 |   const item={run_id:run.run_id,store_id:s,status:'completed',accepted_at:at,started_at:at,completed_at:at,forecast_start_date:'2026-10-11',forecast_end_date:'2026-10-17',requirements_mode:'default',created_by:{user_id:user,display_name:'QA'},winner_option_id:PLANNING_FIXTURE_IDS.option,outcome:'recommendation_available',error_code:null,result_schema_version:'planning-result/1',result_digest:PLANNING_FIXTURE_IDS.digest,record_version:'run/1',captured_budget:{availability:'unavailable',limit:null,currency:null}}
  123 |   const requests:URL[]=[]
  124 |   await backend(page,(path,_method,_body,_headers,url)=>{if(path===`/api/v1/stores/${s}/procurement-plans`){requests.push(url);const filtered=url.searchParams.has('status'),cursor=url.searchParams.has('cursor');return env({items:filtered?[]:cursor?[{...item,run_id:second,status:'running',completed_at:null,result_schema_version:null,result_digest:null,winner_option_id:null,outcome:null}]:[item]},{snapshot_id:'history/1',timezone:'Asia/Ho_Chi_Minh',applied_filters:{created_by_user_id:null,created_date_from:null,created_date_to:null},pagination:{limit:50,next_cursor:filtered||cursor?null:'signed-next',total_count:filtered?0:2}})}})
  125 |   await page.goto('/forecast/planning/history');await expect(page.getByRole('link',{name:'Xem kế hoạch'})).toHaveCount(1)
  126 |   await page.getByRole('button',{name:'Tải thêm',exact:true}).click();await expect(page.getByRole('link',{name:'Xem kế hoạch'})).toHaveCount(2)
  127 |   await expect(page.getByText('Chưa khả dụng',{exact:true})).toHaveCount(2)
  128 |   await page.getByLabel('Trạng thái',{exact:true}).selectOption('failed');await expect(page.getByRole('heading',{name:'Không có run phù hợp bộ lọc'})).toBeVisible()
  129 |   expect(requests.at(-1)!.searchParams.get('status')).toBe('failed');expect(requests.at(-1)!.searchParams.has('cursor')).toBe(false)
  130 |   await page.screenshot({path:'test-results/009-history-filtered-empty.png',animations:'disabled'})
  131 | })
  132 | 
```