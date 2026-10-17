# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sprint011.api.spec.ts >> 011 revoked download permission prevents retry and new export actions
- Location: tests\e2e\sprint011.api.spec.ts:56:1

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
    - definition: Tiết kiệm / Cân bằng / An toàn
    - text: Phương án sẽ xuất
    - combobox "Phương án sẽ xuất" [disabled]:
      - option "Phương án đề xuất đã lưu" [selected]
      - option "Tiết kiệm / Cân bằng / An toàn"
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
    - article:
      - heading "Cần nhập" [level=2]
      - strong: Chưa biết
      - text: 1 dòng mua; chưa có tổng nguyên liệu toàn kế hoạch
    - article:
      - heading "Mức đáp ứng" [level=2]
      - strong: Chưa đánh giá
      - text: Không có tỷ lệ tổng; xem theo món và đường nhu cầu
    - heading "Kế hoạch mua hàng" [level=2]
    - text: Tiết kiệm / Cân bằng / An toàn
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
  1  | import {test,expect,type Page} from '@playwright/test'
  2  | import {createHash} from 'node:crypto'
  3  | import {backend,env,errorResponse,s,at} from './helpers/api'
  4  | import {planningRunFixture,planningNoWinnerFixture,PLANNING_FIXTURE_IDS} from '../../src/features/decision-planning/planning.fixtures'
  5  | const exp='00000000-0000-4000-8000-000000000071',job='00000000-0000-4000-8000-000000000072'
  6  | const bytes=Buffer.from('%PDF-1.4\nretained reference\n%%EOF\n'),hash=createHash('sha256').update(bytes).digest('hex')
  7  | const accepted=(run:string,option:string)=>env({export_id:exp,run_id:run,option_id:option,status:'queued',job_id:job,result_digest:PLANNING_FIXTURE_IDS.digest,render_version:'planning-pdf/1'},{poll_after_ms:2000})
  8  | const ready=(run:string,option:string)=>env({job_id:job,operation:'planning_pdf_export',status:'completed',stage:'completed',progress:1,created_at:at,started_at:at,completed_at:at,context:{store_id:s,run_id:run,export_id:exp},result:{resource_type:'planning_pdf_export',resource_id:exp,run_id:run,option_id:option,download_url:`/api/v1/procurement-plans/${run}/exports/${exp}`,sha256:hash,byte_count:bytes.length,media_type:'application/pdf'},error:null},{poll_after_ms:0,warnings:[]})
  9  | async function open(page:Page,run:string){await page.goto('/forecast/planning?plan_id='+run);await page.getByRole('button',{name:'Xuất PDF',exact:true}).click();return page.getByRole('dialog')}
  10 | 
  11 | test('011 reference candidate without winner exports with warning; lost ACK preserves intent',async({page})=>{
  12 |  const run=planningRunFixture(),option=PLANNING_FIXTURE_IDS.option,posts:any[]=[]
  13 |  run.outcome='no_eligible_candidate';run.result!.winner_option_id=null;run.result!.winner_reason='NO_ELIGIBLE_CANDIDATE'
  14 |  run.result!.options[0].eligible=false;run.result!.options[0].rejection_reasons=['CUSTOMER_REQUIREMENTS_NOT_MET'];run.result!.options[0].not_selected_reason='CUSTOMER_REQUIREMENTS_NOT_MET'
  15 |  for(const strategy of run.result!.strategies){strategy.customer_pass=false;strategy.selection_kind='REFERENCE_NOT_RANKED';strategy.customer_feasibility='UNKNOWN'}
  16 |  await backend(page,(path,method,body,headers)=>{
  17 |   if(path.endsWith('/exports')&&method==='POST'){posts.push({body,key:headers['idempotency-key']});return posts.length===1?'ABORT':accepted(run.run_id,option)}
  18 |   if(path===`/api/v1/procurement-plans/${run.run_id}`)return {data:run,meta:{poll_after_ms:0,warnings:[]},error:null}
  19 |   if(path===`/api/v1/jobs/${job}`)return ready(run.run_id,option)
  20 |  })
  21 |  const d=await open(page,run.run_id);await expect(d.getByRole('button',{name:'Xác nhận xuất PDF'})).toBeDisabled();expect(posts).toHaveLength(0)
  22 |  await d.getByLabel('Phương án sẽ xuất').selectOption(option)
  23 |  await expect(d.getByText('Phương án tham khảo — không được khuyến nghị',{exact:true})).toBeVisible()
  24 |  await expect(d.getByText('CUSTOMER_REQUIREMENTS_NOT_MET',{exact:true})).toBeVisible()
  25 |  await d.getByRole('button',{name:'Xác nhận xuất PDF'}).click();await d.getByRole('button',{name:'Thử lại cùng yêu cầu'}).click()
  26 |  await expect(d.getByText('PDF sẵn sàng',{exact:true})).toBeVisible();await expect(d.getByText('Phương án tham khảo — không được khuyến nghị',{exact:true})).toBeVisible()
  27 |  expect(posts).toHaveLength(2);expect(posts[0]).toEqual(posts[1]);expect(posts[0].body.option_id).toBe(option);expect(run.result!.winner_option_id).toBeNull()
  28 |  await d.screenshot({path:'test-results/011-reference-export.png',animations:'disabled'})
  29 | })
  30 | 
  31 | test('011 no retained candidate never submits export or invents a selection',async({page})=>{
  32 |  const run=planningNoWinnerFixture();let writes=0
  33 |  await backend(page,(path,method)=>{if(method==='POST')writes++;if(path===`/api/v1/procurement-plans/${run.run_id}`)return {data:run,meta:{poll_after_ms:0,warnings:[]},error:null}})
  34 |  const d=await open(page,run.run_id);await expect(d.getByText('Không có candidate đã lưu để xuất PDF.',{exact:true})).toBeVisible()
  35 |  await expect(d.getByRole('button',{name:'Xác nhận xuất PDF'})).toBeDisabled();await expect(d.getByLabel('Phương án sẽ xuất').locator('option')).toHaveCount(1);expect(writes).toBe(0)
  36 | })
  37 | 
  38 | for(const recovery of ['retry','new'] as const)test(`011 artifact unavailable 503 uses explicit ${recovery} recovery`,async({page})=>{
  39 |  const run=planningRunFixture(),posts:any[]=[];let reads=0
  40 |  await backend(page,(path,method,body,headers)=>{
  41 |   if(path.endsWith('/exports')&&method==='POST'){posts.push({body,key:headers['idempotency-key']});return accepted(run.run_id,PLANNING_FIXTURE_IDS.option)}
  42 |   if(path===`/api/v1/procurement-plans/${run.run_id}`)return {data:run,meta:{poll_after_ms:0,warnings:[]},error:null}
  43 |   if(path===`/api/v1/jobs/${job}`)return ready(run.run_id,PLANNING_FIXTURE_IDS.option)
  44 |   if(path.endsWith('/exports/'+exp)){reads++;return reads===1?errorResponse(503,'EXPORT_ARTIFACT_UNAVAILABLE'):bytes}
  45 |  })
  46 |  const d=await open(page,run.run_id);await d.getByRole('button',{name:'Xác nhận xuất PDF'}).click();await expect(d.getByText('PDF sẵn sàng',{exact:true})).toBeVisible()
  47 |  await d.getByRole('button',{name:'Tải PDF',exact:true}).click();await expect(d.getByRole('heading',{name:'Bản PDF không còn khả dụng'})).toBeVisible();expect(posts).toHaveLength(1)
  48 |  if(recovery==='retry'){
  49 |   const download=page.waitForEvent('download');await d.getByRole('button',{name:'Thử tải lại artifact'}).click();await download;await expect(d.getByRole('heading',{name:'Tải PDF thành công'})).toBeVisible();expect(reads).toBe(2);expect(posts).toHaveLength(1)
  50 |  }else{
  51 |   await d.getByRole('button',{name:'Tạo export mới'}).click();await expect(d.getByRole('button',{name:'Xác nhận xuất PDF'})).toBeEnabled();expect(posts).toHaveLength(1)
  52 |   await d.getByRole('button',{name:'Xác nhận xuất PDF'}).click();await expect.poll(()=>posts.length).toBe(2);expect(posts[0].key).not.toBe(posts[1].key);expect(posts[0].body).toEqual(posts[1].body)
  53 |  }
  54 | })
  55 | 
  56 | test('011 revoked download permission prevents retry and new export actions',async({page})=>{
  57 |  const run=planningRunFixture();let writes=0
  58 |  await backend(page,(path,method)=>{
  59 |   if(path.endsWith('/exports')&&method==='POST'){writes++;return accepted(run.run_id,PLANNING_FIXTURE_IDS.option)}
  60 |   if(path===`/api/v1/procurement-plans/${run.run_id}`)return {data:run,meta:{poll_after_ms:0,warnings:[]},error:null}
  61 |   if(path===`/api/v1/jobs/${job}`)return ready(run.run_id,PLANNING_FIXTURE_IDS.option)
  62 |   if(path.endsWith('/exports/'+exp))return errorResponse(403,'PERMISSION_DENIED')
  63 |  })
> 64 |  const d=await open(page,run.run_id);await d.getByRole('button',{name:'Xác nhận xuất PDF'}).click();await expect(d.getByText('PDF sẵn sàng',{exact:true})).toBeVisible()
     |                                                                                                                                                            ^ Error: expect(locator).toBeVisible() failed
  65 |  await d.getByRole('button',{name:'Tải PDF',exact:true}).click();await expect(d.getByRole('heading',{name:'Không còn quyền tải PDF'})).toBeVisible()
  66 |  await expect(d.getByRole('button',{name:/Tải PDF|Thử lại tải|Tạo export mới|Thử tải lại artifact/})).toHaveCount(0);expect(writes).toBe(1)
  67 | })
  68 | 
```