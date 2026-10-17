# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: operations.mock.spec.ts >> parked features show construction notices and close accessibly
- Location: tests\e2e\operations.mock.spec.ts:80:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Hỏi AI', exact: true })

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e3]:
    - link "Đi tới nội dung" [ref=f1e4] [cursor=pointer]:
      - /url: "#app-content"
    - complementary "Điều hướng ứng dụng" [ref=f1e5]:
      - button "Thu gọn sidebar" [expanded] [ref=f1e7] [cursor=pointer]
      - navigation "Các phân hệ ShelfCash" [ref=f1e11]:
        - link "Hôm nay" [ref=f1e12] [cursor=pointer]:
          - /url: /today
        - link "Nhập dữ liệu" [ref=f1e15] [cursor=pointer]:
          - /url: /imports
        - link "Dự đoán" [ref=f1e18] [cursor=pointer]:
          - /url: /forecast
        - link "Kho" [ref=f1e21] [cursor=pointer]:
          - /url: /inventory
        - link "Menu" [ref=f1e24] [cursor=pointer]:
          - /url: /menu
        - link "Cửa hàng" [ref=f1e27] [cursor=pointer]:
          - /url: /store
    - generic [ref=f1e31]:
      - banner [ref=f1e32]:
        - navigation "Vị trí trong ShelfCash" [ref=f1e33]:
          - link "Dự đoán" [ref=f1e34] [cursor=pointer]:
            - /url: /forecast/planning
          - generic [aria-hidden] [ref=f1e35]: /
          - generic [ref=f1e36]: Kế hoạch nhập
        - generic [ref=f1e37]: ShelfCash
        - link "Thông báo" [ref=f1e38] [cursor=pointer]:
          - /url: /notifications
      - note [ref=f1e41]: DEV/QA minh họa — dữ liệu cố định, không chạy dự báo hay ghi dữ liệu thật.
      - paragraph [ref=f1e42]:
        - link "Lịch sử kế hoạch" [ref=f1e43] [cursor=pointer]:
          - /url: /forecast/planning/history
      - region "Trạng thái lập kế hoạch" [ref=f1e44]:
        - region "Cảnh báo của lần đọc kế hoạch" [ref=f1e45]:
          - heading "Cảnh báo của lần đọc kế hoạch" [level=3] [ref=f1e46]
          - list [ref=f1e47]:
            - listitem [ref=f1e48]:
              - text: Dữ liệu ví dụ DEV/QA; không phải kết quả Backend thật.
              - code [ref=f1e49]: SYNTHETIC_QA_FIXTURE
      - main [ref=f1e51]:
        - generic [ref=f1e52]:
          - generic [ref=f1e53]:
            - heading "Kế hoạch nhập" [level=1] [ref=f1e54]
            - paragraph [ref=f1e55]: 11/10/2026 · 7 ngày · kết quả đã lưu
          - generic [ref=f1e56]:
            - button "Hỏi ShelfCash" [disabled] [ref=f1e57]:
              - generic [aria-hidden] [ref=f1e58]: ✦
              - text: Hỏi ShelfCash
            - generic [ref=f1e59]:
              - button "Bản xuất đã có" [ref=f1e60] [cursor=pointer]
              - button "Xuất PDF" [ref=f1e61] [cursor=pointer]
            - button "Thiết lập mới" [ref=f1e62]
        - tablist "Kế hoạch nhập" [ref=f1e63]:
          - tab "Tổng quan" [selected] [ref=f1e64]
          - tab "Nguyên liệu" [ref=f1e65]
          - tab "Phương án khác" [ref=f1e66]
          - tab "Lý do" [ref=f1e67]
          - button "Kịch bản giả định" [ref=f1e68]
        - tabpanel "Tổng quan" [ref=f1e69]:
          - generic [ref=f1e70]:
            - generic [ref=f1e71]:
              - article [ref=f1e72]:
                - heading "Chi phí dự kiến" [level=2] [ref=f1e73]
                - strong [ref=f1e74]: 7.000 VND
                - generic [ref=f1e75]: Tổng chi phí canonical của phương án được chọn
              - article [ref=f1e76]:
                - heading "Cần nhập" [level=2] [ref=f1e77]
                - strong [ref=f1e78]: Chưa biết
                - generic [ref=f1e79]: 1 dòng mua; chưa có tổng nguyên liệu toàn kế hoạch
              - article [ref=f1e80]:
                - heading "Mức đáp ứng" [level=2] [ref=f1e81]
                - strong [ref=f1e82]: Chưa đánh giá
                - generic [ref=f1e83]: Không có tỷ lệ tổng; xem theo món và đường nhu cầu
            - generic [ref=f1e84]:
              - generic [ref=f1e85]:
                - heading "Kế hoạch mua hàng" [level=2] [ref=f1e86]
                - generic [ref=f1e87]: Tiết kiệm / Cân bằng / An toàn
              - list [ref=f1e88]:
                - listitem [ref=f1e89]:
                  - button "Dòng Nguyên liệu · …000004 Mua 7 l 7.000 VND" [ref=f1e90]:
                    - generic "Dòng" [ref=f1e91]: "1"
                    - strong [ref=f1e92]: Nguyên liệu · …000004
                    - generic [ref=f1e93]: Mua 7 l
                    - generic [ref=f1e94]: 7.000 VND
              - group [ref=f1e95]:
                - generic "Xem toàn bộ kế hoạch" [ref=f1e96] [cursor=pointer]
            - region "Cảnh báo của kết quả" [ref=f1e97]:
              - heading "Cảnh báo của kết quả" [level=3] [ref=f1e98]
              - list [ref=f1e99]:
                - listitem [ref=f1e100]:
                  - text: Dữ liệu ví dụ DEV/QA; không phải kết quả Backend thật.
                  - code [ref=f1e101]: SYNTHETIC_QA_FIXTURE
              - button "Vì sao?" [disabled] [ref=f1e102]
            - region "Cảnh báo dự báo" [ref=f1e103]:
              - heading "Cảnh báo dự báo" [level=3] [ref=f1e104]
              - list [ref=f1e105]:
                - listitem [ref=f1e106]:
                  - text: Dữ liệu ví dụ DEV/QA; không phải kết quả Backend thật.
                  - code [ref=f1e107]: SYNTHETIC_QA_FIXTURE
            - group [ref=f1e108]:
              - generic "Phạm vi món và dữ liệu bị loại" [ref=f1e109] [cursor=pointer]
            - group [ref=f1e110]:
              - generic "Thông tin dự báo đã lưu" [ref=f1e111] [cursor=pointer]
            - paragraph [ref=f1e112]: "Cơ sở vận hành: CURRENT_CAPTURE · Ngày chụp 11/10/2026 · Asia/Ho_Chi_Minh. Đây không phải tái tạo tồn kho lịch sử."
            - generic [ref=f1e113]:
              - button "Tạo Draft PO" [ref=f1e114]
              - button "Xem phương án khác" [ref=f1e115]
              - button "Xem lý do từ engine" [ref=f1e116]
            - group [ref=f1e117]:
              - generic "Thông tin lần lập kế hoạch" [ref=f1e118] [cursor=pointer]
  - button "Debug" [ref=f1e119] [cursor=pointer]
```

# Test source

```ts
  1   | import { test,expect } from '@playwright/test'
  2   | test('receipt writes shared stock and later detail/lots/movements reads; reset is explicit',async({page})=>{
  3   |   await page.goto('/inventory')
  4   |   await page.getByRole('button',{name:'Nhận hàng / Tồn đầu kỳ'}).click()
  5   |   const dialog=page.getByRole('dialog')
  6   |   await dialog.getByRole('combobox',{name:'Nguyên liệu',exact:true}).fill('Sữa tươi')
  7   |   await dialog.getByRole('option',{name:/Sữa tươi/}).click()
  8   |   await dialog.getByLabel(/Số lượng thực nhận/).fill('2.125')
  9   |   await dialog.getByLabel('Hệ thống/chứng từ nguồn').fill('qa-browser')
  10  |   await dialog.getByLabel('Mã dòng nhận hàng duy nhất').fill('line-1')
  11  |   await dialog.getByLabel('Ngày nhận (có thể chưa rõ)').fill('2026-10-10')
  12  |   await dialog.getByLabel('Hạn dùng (có thể chưa rõ)').fill('2026-11-01')
  13  |   await dialog.getByLabel(/Thời điểm quan sát/).fill('2026-10-10T03:00:00Z')
  14  |   await dialog.getByLabel('Lý do',{exact:true}).fill('QA actual receipt')
  15  |   await dialog.getByLabel('Tôi đã kiểm tra dữ liệu và xác nhận ghi.').check()
  16  |   await dialog.getByRole('button',{name:'Tiếp tục',exact:true}).click()
  17  |   await dialog.getByRole('button',{name:'Xác nhận nhận hàng',exact:true}).click()
  18  |   await expect(dialog.getByText(/Đã đọc snapshot mới: 17.625/)).toBeVisible()
  19  |   await expect(dialog.getByText(/Đã thấy lô mới/)).toBeVisible()
  20  |   await expect(dialog.getByText(/Đã thấy biến động/)).toBeVisible()
  21  |   await dialog.getByRole('button',{name:'Đóng',exact:true}).click()
  22  |   await page.getByRole('link',{name:'Hôm nay',exact:true}).click()
  23  |   await expect(page.getByRole('heading',{name:'Hôm nay',exact:true})).toBeVisible()
  24  | 
  25  | })
  26  | test('planning run retained across navigation appears in shared History',async({page})=>{
  27  |   await page.goto('/forecast/planning')
  28  |   await page.getByRole('button',{name:'Tạo kế hoạch nhập hàng'}).click()
  29  |   await expect(page).toHaveURL(/plan_id=/)
  30  |   const locator=new URL(page.url()).searchParams.get('plan_id')!
  31  |   await expect(page.getByRole('button',{name:/Xuất PDF/})).toBeVisible()
  32  |   await page.getByRole('link',{name:'Lịch sử kế hoạch',exact:true}).click()
  33  |   await expect(page.getByRole('link',{name:'Xem kế hoạch'})).toHaveCount(1)
  34  |   await page.getByRole('link',{name:'Xem kế hoạch'}).click()
  35  |   await expect(page).toHaveURL(new RegExp(locator))
  36  | })
  37  | test('recipe preview → commit → fresh timeline, old content remains',async({page})=>{
  38  |   await page.goto('/menu/recipe?product_id=00000000-0000-0000-0000-000000000011')
  39  |   await page.getByRole('button',{name:'Tạo phiên bản mới'}).click()
  40  |   await page.getByLabel('Hiệu lực từ').fill('2026-10-11')
  41  |   await page.getByLabel('Yield (cup)').fill('2')
  42  |   await page.getByLabel(/Tỷ lệ hao hụt/).fill('0.02')
  43  |   await page.getByLabel('Lý do',{exact:true}).fill('QA future recipe')
  44  |   await page.getByRole('button',{name:'Thêm nguyên liệu'}).click()
  45  |   await page.getByRole('combobox',{name:'Nguyên liệu',exact:true}).last().fill('Bột mì')
  46  |   await page.getByRole('option',{name:/Bột mì/}).click()
  47  |   await page.getByLabel(/Lượng \(/).last().fill('300')
  48  |   await page.getByLabel(/Đóng công thức hiện hành/).check()
  49  |   await page.getByRole('button',{name:'Xem trước thay đổi'}).click()
  50  |   await expect(page.getByRole('heading',{name:'Kiểm tra thay đổi'})).toBeVisible()
  51  |   await page.getByRole('button',{name:'Tiếp tục xác nhận'}).click()
  52  |   await page.getByRole('button',{name:'Xác nhận ghi lịch công thức'}).click()
  53  |   await expect(page.getByText(/Đã ghi lịch công thức/)).toBeVisible()
  54  |   await page.getByRole('dialog').getByRole('button',{name:'Đóng',exact:true}).click()
  55  |   await expect(page.getByRole('heading',{name:/Phiên bản.*Đã lên lịch/})).toBeVisible()
  56  |   await page.screenshot({path:'test-results/recipe-timeline.png',fullPage:false,animations:'disabled'})
  57  | })
  58  | test('readonly actor cannot start receipt/planning writes; no-store does not expose fixture data',async({page})=>{
  59  |   await page.goto('/inventory')
  60  |   await page.getByRole('button',{name:'Debug',exact:true}).click()
  61  |   await page.getByText('Advanced diagnostics',{exact:true}).click()
  62  |   await page.getByLabel('DEV scenario',{exact:true}).selectOption('staff-readonly')
  63  |   await page.goto('/inventory')
  64  |   await expect(page.getByRole('heading',{name:'Kho',exact:true})).toBeVisible()
  65  |   await expect(page.getByRole('button',{name:'Nhận hàng / Tồn đầu kỳ'})).toHaveCount(0)
  66  |   await page.goto('/forecast/planning')
  67  |   await expect(page.getByText(/Cần quyền xem kết quả kế hoạch/)).toBeVisible()
  68  |   await page.getByRole('button',{name:'Debug',exact:true}).click()
  69  |   await page.getByText('Advanced diagnostics',{exact:true}).click()
  70  |   await page.getByLabel('DEV scenario',{exact:true}).selectOption('no-store')
  71  |   await page.goto('/inventory')
  72  |   await expect(page.getByRole('heading',{name:'Chưa có cửa hàng'})).toBeVisible()
  73  |   await expect(page.getByRole('heading',{name:'Kho',exact:true})).toHaveCount(0)
  74  | })
  75  | test('Import step navigation is Preview before review/commit',async({page})=>{
  76  |   await page.goto('/imports')
  77  |   await expect(page.getByRole('list',{name:'Tiến trình nhập dữ liệu 6 bước'}).locator('[aria-current=step]')).toContainText('File')
  78  |   await expect(page.getByText('Xem lại trước khi Preview')).toHaveCount(0)
  79  | })
  80  | test('parked features show construction notices and close accessibly',async({page})=>{
  81  |   await page.goto('/imports')
  82  |   await page.getByRole('link',{name:'Phê duyệt Staff'}).click()
  83  |   await expect(page).toHaveURL(/imports\/approvals/)
  84  |   await expect(page.getByRole('heading',{name:'Phê duyệt Staff',exact:true})).toBeVisible()
  85  |   await page.goto('/forecast/planning')
  86  |   await page.getByRole('button',{name:'Tạo kế hoạch nhập hàng'}).click()
  87  |   for(const name of ['Hỏi AI','Kịch bản giả định','Tạo Draft PO']){
> 88  |     await page.getByRole('button',{name,exact:true}).click()
      |                                                      ^ Error: locator.click: Test timeout of 60000ms exceeded.
  89  |     await expect(page.getByRole('dialog')).toContainText('đang được xây dựng')
  90  |     await page.getByRole('dialog').getByRole('button',{name:'Đóng',exact:true}).click()
  91  |   }
  92  | })
  93  | test('new requirements become discoverable and run uses saved zero budget',async({page})=>{
  94  |   await page.goto('/forecast/planning')
  95  |   await page.getByRole('tab',{name:'Tùy chỉnh',exact:true}).click()
  96  |   await page.getByLabel('Kế thừa trần Store').uncheck()
  97  |   await page.getByLabel('Ngân sách của bộ yêu cầu').fill('0')
  98  |   await page.getByRole('button',{name:'Lưu thành bộ mới',exact:true}).click()
  99  |   await page.getByLabel('Tên bộ yêu cầu').fill('009 browser saved')
  100 |   await page.getByRole('button',{name:'Xác nhận lưu bộ mới',exact:true}).click()
  101 |   await expect(page.getByRole('tab',{name:'Đã lưu',exact:true})).toHaveAttribute('aria-selected','true')
  102 |   await expect(page.getByLabel('Bộ yêu cầu',{exact:true}).locator('option:checked')).toHaveText('009 browser saved')
  103 |   await page.getByRole('button',{name:'Tạo kế hoạch nhập hàng'}).click()
  104 |   await expect(page.getByText('Đã hoàn tất — chưa có phương án đủ điều kiện')).toBeVisible()
  105 | })
  106 | test('Preview groups, keyboard row drawer and same-snapshot Review gate',async({page})=>{
  107 |   await page.goto('/imports')
  108 |   await page.getByLabel('Ngày dữ liệu',{exact:true}).fill('2026-10-10')
  109 |   await page.locator('input[type=file]').setInputFiles({name:'observed-stock.csv',mimeType:'text/csv',buffer:Buffer.from('ingredient,on_hand,unit\nMilk,10,l\nCoffee,8,kg\n')})
  110 |   await page.getByRole('button',{name:'Phân tích dữ liệu',exact:true}).click()
  111 |   await page.getByRole('button', { name: /^Phân tích [0-9]+ file$/ }).click()
  112 |   await page.getByRole('button',{name:'Kiểm tra cách hiểu',exact:true}).click()
  113 |   await page.getByRole('button',{name:'Chỉnh mapping',exact:true}).click()
  114 |   await page.getByRole('button',{name:/^Lưu (mapping|đề xuất)$/}).click()
  115 |   await page.getByRole('button',{name:'Xem profile sẽ được lưu'}).click()
  116 |   await page.getByLabel('Lý do duyệt').fill('Reviewed reusable inventory interpretation')
  117 |   await page.getByLabel('Tôi đã kiểm tra cách đọc đề xuất, bằng chứng và cách đọc đã duyệt (nếu có).').check()
  118 |   await page.getByRole('button',{name:'Duyệt profile'}).click()
  119 |   await page.getByRole('button',{name:'Tạo Preview',exact:true}).click()
  120 |   await expect(page.getByRole('tab',{name:/Kiểm kê tồn kho/})).toBeVisible()
  121 |   const row=page.getByRole('row',{name:/Mở chi tiết dòng/}).first()
  122 |   await row.focus();await page.keyboard.press('Enter')
  123 |   const d=page.getByRole('dialog',{name:'Chi tiết dòng dữ liệu'})
  124 |   await expect(d.getByRole('heading',{name:'Nguồn dữ liệu'})).toBeVisible()
  125 |   await expect(d.getByText('SOURCE_EXPLICIT',{exact:true})).toHaveCount(0)
  126 |   await d.screenshot({path:'test-results/009-preview-row.png',animations:'disabled'})
  127 |   await page.keyboard.press('Escape');await expect(row).toBeFocused()
  128 |   await page.getByRole('button',{name:'Đọc thêm dòng Preview'}).click()
  129 |   await expect(page.getByRole('row',{name:/Mở chi tiết dòng/})).toHaveCount(2)
  130 |   await page.getByRole('button',{name:'Tiếp tục xác nhận'}).click()
  131 |   await page.getByLabel('Lý do review (bắt buộc)').fill('Review observed counts')
  132 |   await page.getByLabel('Tôi đã đọc đủ dữ liệu, nguồn báo cáo, cách đọc và cảnh báo.').check()
  133 |   await page.getByRole('button',{name:'Xác nhận đã kiểm tra'}).click()
  134 |   await page.getByLabel('Lý do nhập dữ liệu (bắt buộc)').fill('Commit reviewed stock count')
  135 |   await page.getByLabel('Tôi đã kiểm tra dữ liệu, cảnh báo và phạm vi nhập.').check()
  136 |   await page.getByRole('button',{name:'Quay lại Preview',exact:true}).click()
  137 |   await expect(page.getByRole('heading',{name:'Xem trước dữ liệu',exact:true})).toBeVisible()
  138 |   await page.getByRole('button',{name:'Tiếp tục xác nhận',exact:true}).click()
  139 |   await expect(page.getByRole('heading',{name:'Xác nhận nhập dữ liệu'})).toBeVisible()
  140 |   await page.screenshot({path:'test-results/009-review.png',animations:'disabled'})
  141 | })
  142 | 
  143 | test('custom requirements draft survives mode changes and saved configurations stay readonly until explicit management',async({page})=>{
  144 |   await page.goto('/forecast/planning')
  145 |   await page.getByRole('tab',{name:'Tùy chỉnh',exact:true}).click()
  146 |   await page.getByLabel('Kế thừa trần Store').uncheck()
  147 |   await page.getByLabel('Ngân sách của bộ yêu cầu').fill('123.000000000000000001')
  148 |   await page.getByRole('tab',{name:'Mặc định',exact:true}).click()
  149 |   await page.getByRole('tab',{name:'Đã lưu',exact:true}).click()
  150 |   await page.getByLabel('Bộ yêu cầu',{exact:true}).selectOption('d0900000-0000-4000-8000-000000000008')
  151 |   await expect(page.getByRole('button',{name:'Quản lý cấu hình đã lưu'})).toBeVisible()
  152 |   await expect(page.getByLabel('Ngân sách của bộ yêu cầu')).toHaveCount(0)
  153 |   await page.getByRole('tab',{name:'Tùy chỉnh',exact:true}).click()
  154 |   await expect(page.getByLabel('Ngân sách của bộ yêu cầu')).toHaveValue('123.000000000000000001')
  155 | })
  156 | 
  157 | test('receipt dirty close keeps draft and combobox Escape closes only its popup',async({page})=>{
  158 |   await page.goto('/inventory');await page.getByRole('button',{name:'Nhận hàng / Tồn đầu kỳ'}).click()
  159 |   const d=page.getByRole('dialog',{name:'Nhận hàng vào Kho'})
  160 |   await d.getByLabel(/Số lượng thực nhận/).fill('2')
  161 |   await d.getByRole('combobox',{name:'Nguyên liệu',exact:true}).fill('Sữa')
  162 |   await expect(d.getByRole('listbox')).toBeVisible()
  163 |   await page.keyboard.press('Escape');await expect(d).toBeVisible();await expect(d.getByRole('listbox')).toHaveCount(0)
  164 |   await page.keyboard.press('Escape')
  165 |   await expect(page.getByRole('dialog',{name:'Bạn có thay đổi chưa lưu'})).toBeVisible()
  166 |   await page.getByRole('button',{name:'Tiếp tục chỉnh sửa'}).click()
  167 |   await expect(d.getByLabel(/Số lượng thực nhận/)).toHaveValue('2')
  168 |   // Returning focus to the combobox can reopen its popup; use the drawer close action here.
  169 |   await d.getByRole('button',{name:'Đóng Nhận hàng vào Kho',exact:true}).click();await page.getByRole('button',{name:'Đóng và bỏ thay đổi'}).click()
  170 |   await expect(page.getByRole('dialog')).toHaveCount(0)
  171 | })
  172 | 
```