# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: operations.api.spec.ts >> retained run → PDF job → authenticated binary download; no procurement/stock mutation
- Location: tests\e2e\operations.api.spec.ts:28:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog').getByText('PDF sẵn sàng')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('dialog').getByText('PDF sẵn sàng') with timeout 5000ms
  - waiting for getByRole('dialog').getByText('PDF sẵn sàng')

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
  1  | import {test,expect} from '@playwright/test'
  2  | import {inventoryFixtureItems,inventoryFixtureMeta,inventoryFixtureSummary,inventoryFixtureLots,inventoryFixtureMovements} from '../../src/features/inventory/inventory.fixtures'
  3  | import {planningRunFixture,planningContextFixture,PLANNING_FIXTURE_IDS} from '../../src/features/decision-planning/planning.fixtures'
  4  | import {createHash} from 'node:crypto'
  5  | import {s,user,at,env,paging,backend} from './helpers/api'
  6  | test('API receipt lost response retries same intent; fresh snapshot/lot/movement reads confirm one write',async({page})=>{
  7  |   const rows=structuredClone(inventoryFixtureItems),lots=structuredClone(inventoryFixtureLots),moves=structuredClone(inventoryFixtureMovements),meta=structuredClone(inventoryFixtureMeta)
  8  |   const id='10000000-0000-0000-0000-000000000001',lotId='00000000-0000-4000-8000-000000000021',moveId='00000000-0000-4000-8000-000000000022'
  9  |   const requests:any[]=[];let receipt:any
  10 |   await backend(page,async(path,method,body,headers)=>{
  11 |     if(path.endsWith('/inventory/receipts')){
  12 |       requests.push({body,headers});expect(method).toBe('POST');expect(headers['x-csrf-token']).toBe('controlled-csrf')
  13 |       if(!receipt){const row=rows.find(r=>r.ingredient_id===id)!;row.on_hand_quantity='17.625';row.usable_quantity='17.625';row.usable_known_quantity='17.625';meta.snapshot_id='controlled-after-receipt';meta.data_version='controlled-stock/2'
  14 |         const lot={...lots[id][1],lot_id:lotId,quantity:'2.125',batch_code:'QA-LOT'},movement={...moves[id][0],movement_id:moveId,lot_id:lotId,kind:'receipt',quantity_delta:'2.125',origin:'ACTUAL_RECEIPT'}
  15 |         lots[id].push(lot);moves[id].unshift(movement);receipt=env({receipt_id:lotId,origin:'ACTUAL_RECEIPT',lot,movement,inventory_version:meta.data_version,audit_reference:moveId,warnings:[]});return 'ABORT'
  16 |       }
  17 |       return receipt
  18 |     }
  19 |     if(path.endsWith('/inventory'))return env({summary:inventoryFixtureSummary,items:rows,missing_ingredient_ids:[]},{...meta,...paging(rows.length)})
  20 |     if(path.endsWith('/lots'))return env({ingredient_id:id,items:lots[id]},{...meta,...paging(lots[id].length)})
  21 |     if(path.endsWith('/movements'))return env({ingredient_id:id,items:moves[id]},{...meta,...paging(moves[id].length)})
  22 |     if(path.endsWith('/'+id))return env({...rows.find(r=>r.ingredient_id===id)!,lots:lots[id],lots_page:{next_cursor:null,total_count:lots[id].length},threshold_version:'threshold/1'},meta)
  23 |   })
  24 |   await page.goto('/inventory');await page.getByRole('button',{name:'Nhận hàng / Tồn đầu kỳ'}).click();const d=page.getByRole('dialog')
  25 |   await d.getByRole('combobox',{name:'Nguyên liệu',exact:true}).fill('Sữa tươi');await d.getByRole('option',{name:/Sữa tươi/}).click();await d.getByLabel(/Số lượng thực nhận/).fill('2.125');await d.getByLabel('Hệ thống/chứng từ nguồn').fill('qa-browser');await d.getByLabel('Mã dòng nhận hàng duy nhất').fill('row-1');await d.getByLabel(/Thời điểm quan sát/).fill(at);await d.getByLabel('Lý do',{exact:true}).fill('Actual receipt');await d.getByLabel('Tôi đã kiểm tra dữ liệu và xác nhận ghi.').check();await d.getByRole('button',{name:'Tiếp tục',exact:true}).click();await d.getByRole('button',{name:'Xác nhận nhận hàng',exact:true}).click()
  26 |   await d.getByRole('button',{name:'Thử lại cùng yêu cầu'}).click();await expect(d.getByText(/Đã đọc snapshot mới: 17.625/)).toBeVisible();expect(requests).toHaveLength(2);expect(requests[0].body).toEqual(requests[1].body);expect(requests[0].headers['idempotency-key']).toBe(requests[1].headers['idempotency-key']);expect(moves[id].filter(m=>m.movement_id===moveId)).toHaveLength(1)
  27 | })
  28 | test('retained run → PDF job → authenticated binary download; no procurement/stock mutation',async({page})=>{
  29 |   const run=planningRunFixture(),exp='00000000-0000-4000-8000-000000000031',job='00000000-0000-4000-8000-000000000032'
  30 |   const bytes=Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'),hash=createHash('sha256').update(bytes).digest('hex')
  31 |   const writes:string[]=[]
  32 |   await backend(page,(path,method,body)=>{
  33 |     if(method==='POST'){writes.push(path);expect(body.format).toBe('pdf');return env({export_id:exp,run_id:run.run_id,option_id:PLANNING_FIXTURE_IDS.option,status:'queued',job_id:job,result_digest:PLANNING_FIXTURE_IDS.digest,render_version:'planning-pdf/1'},{poll_after_ms:2000})}
  34 |     if(path===`/api/v1/procurement-plans/${run.run_id}`)return {data:run,meta:{poll_after_ms:0,warnings:[]},error:null}
  35 |     if(path===`/api/v1/jobs/${job}`)return env({job_id:job,operation:'planning_pdf_export',status:'completed',stage:'completed',progress:1,created_at:at,started_at:at,completed_at:at,context:{store_id:s,run_id:run.run_id,export_id:exp},result:{resource_type:'planning_pdf_export',resource_id:exp,run_id:run.run_id,option_id:PLANNING_FIXTURE_IDS.option,download_url:`/api/v1/procurement-plans/${run.run_id}/exports/${exp}`,sha256:hash,byte_count:bytes.length,media_type:'application/pdf'},error:null},{poll_after_ms:0,pagination:null,warnings:[]})
  36 |     if(path.endsWith('/exports/'+exp))return bytes
  37 |   })
> 38 |   await page.goto('/forecast/planning?plan_id='+run.run_id);await page.getByRole('button',{name:'Xuất PDF',exact:true}).click();const d=page.getByRole('dialog');await d.getByRole('button',{name:'Xác nhận xuất PDF'}).click();await expect(d.getByText('PDF sẵn sàng')).toBeVisible();const downloading=page.waitForEvent('download');await d.getByRole('button',{name:'Tải PDF',exact:true}).click();const download=await downloading;expect(download.suggestedFilename()).toContain(exp);expect(writes).toEqual([`/api/v1/procurement-plans/${run.run_id}/exports`])
     |                                                                                                                                                                                                                                                                           ^ Error: expect(locator).toBeVisible() failed
  39 | })
  40 | test('confirmed saved write with failed N2 retries only readback, never creates another resource',async({page})=>{
  41 |   const savedId='00000000-0000-4000-8000-000000000041';let writes=0,reads=0
  42 |   const requirements={budget_limit:null,paths:[{path:'BASE',min_fill_rate_percent:'95',product_overrides:[]}]}
  43 |   const detail={saved_requirement_id:savedId,store_id:s,name:'Known receipt',version:'saved/1',state:'active',created_at:at,updated_at:at,created_by_user_id:user,updated_by_user_id:user,requirements,default_reference:null,validation:{status:'valid',reason_codes:[]},warnings:[]}
  44 |   await backend(page,(path,method)=>{
  45 |     if(path.endsWith('/planning-context'))return env(planningContextFixture())
  46 |     if(path.endsWith('/planning-requirements')&&method==='POST'){writes++;return env(detail)}
  47 |     if(path.endsWith('/planning-requirements/'+savedId)){reads++;return reads===1?'ABORT':env(detail)}
  48 |   })
  49 |   await page.goto('/forecast/planning')
  50 |   await page.getByRole('tab',{name:'Tùy chỉnh',exact:true}).click()
  51 |   await page.getByRole('button',{name:'Lưu thành bộ mới',exact:true}).click()
  52 |   await page.getByLabel('Tên bộ yêu cầu').fill('Known receipt')
  53 |   await page.getByRole('button',{name:'Xác nhận lưu bộ mới',exact:true}).click()
  54 |   await page.getByRole('dialog').getByRole('button',{name:'Đọc lại bộ yêu cầu đã ghi'}).click()
  55 |   await expect(page.getByRole('tab',{name:'Đã lưu',exact:true})).toHaveAttribute('aria-selected','true')
  56 |   await expect(page.getByLabel('Bộ yêu cầu',{exact:true}).locator('option:checked')).toHaveText('Known receipt')
  57 |   await expect(page.getByRole('region',{name:'Yêu cầu lập kế hoạch'}).getByRole('alert')).toHaveCount(0)
  58 |   expect(writes).toBe(1);expect(reads).toBe(2)
  59 | })
  60 | 
```