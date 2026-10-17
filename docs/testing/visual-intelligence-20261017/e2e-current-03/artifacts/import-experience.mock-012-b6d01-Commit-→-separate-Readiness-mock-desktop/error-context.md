# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: import-experience.mock.spec.ts >> 012 OWNER navigates Analyze → Resolve → reusable approval → Preview → Review → Commit → separate Readiness
- Location: tests\e2e\import-experience.mock.spec.ts:32:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Chưa đánh giá', { exact: true })
Expected: visible
Error: strict mode violation: getByText('Chưa đánh giá', { exact: true }) resolved to 5 elements:
    1) <span class="import-page__step" data-brand-success="false">Chưa đánh giá</span> aka locator('span').filter({ hasText: 'Chưa đánh giá' })
    2) <small>Chưa đánh giá</small> aka getByText('Chưa đánh giá').nth(1)
    3) <small>Chưa đánh giá</small> aka getByText('Chưa đánh giá').nth(2)
    4) <small>Chưa đánh giá</small> aka getByText('Chưa đánh giá').nth(3)
    5) <small>Chưa đánh giá</small> aka getByText('Chưa đánh giá').nth(4)

Call log:
  - Expect "toBeVisible" getByText('Chưa đánh giá', { exact: true }) with timeout 5000ms
  - waiting for getByText('Chưa đánh giá', { exact: true })

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - link "Đi tới nội dung" [ref=e4] [cursor=pointer]:
      - /url: "#app-content"
    - complementary "Điều hướng ứng dụng" [ref=e5]:
      - button "Thu gọn sidebar" [expanded] [ref=e7] [cursor=pointer]
      - navigation "Các phân hệ ShelfCash" [ref=e11]:
        - link "Hôm nay" [ref=e12] [cursor=pointer]:
          - /url: /today
        - link "Nhập dữ liệu" [ref=e15] [cursor=pointer]:
          - /url: /imports
        - link "Dự đoán" [ref=e18] [cursor=pointer]:
          - /url: /forecast
        - link "Kho" [ref=e21] [cursor=pointer]:
          - /url: /inventory
        - link "Menu" [ref=e24] [cursor=pointer]:
          - /url: /menu
        - link "Cửa hàng" [ref=e27] [cursor=pointer]:
          - /url: /store
    - generic [ref=e33]:
      - banner [ref=e34]:
        - generic [ref=e35]: Nhập dữ liệu
        - generic [ref=e36]: ShelfCash
        - link "Thông báo" [ref=e37] [cursor=pointer]:
          - /url: /notifications
      - main [ref=e40]:
        - generic [ref=e42]:
          - heading "Nhập dữ liệu" [level=1] [ref=e43]
          - generic [ref=e44]: OWNER FLOW
        - paragraph [ref=e45]: Owner nhập dữ liệu, xác nhận cách hiểu và kiểm soát điều gì được tái sử dụng.
        - navigation "Tiện ích nhập dữ liệu" [ref=e46]:
          - generic [ref=e47] [cursor=pointer]: Nhập mới
          - link "Lịch sử" [ref=e48] [cursor=pointer]:
            - /url: /imports/history
          - link "Phê duyệt Staff" [ref=e49] [cursor=pointer]:
            - /url: /imports/approvals
          - button "Profiles" [ref=e50] [cursor=pointer]
        - list "Tiến trình nhập dữ liệu 6 bước" [ref=e51]:
          - listitem [ref=e52]:
            - generic [ref=e53]: ✓
            - generic [ref=e54]:
              - strong [ref=e55]: File
              - generic [ref=e56]: Tải dữ liệu
          - listitem [ref=e57]:
            - generic [ref=e58]: ✓
            - generic [ref=e59]:
              - strong [ref=e60]: Phân tích
              - generic [ref=e61]: Đọc nguồn
          - listitem [ref=e62]:
            - generic [ref=e63]: ✓
            - generic [ref=e64]:
              - strong [ref=e65]: Kiểm tra
              - generic [ref=e66]: Cách hiểu
          - listitem [ref=e67]:
            - generic [ref=e68]: ✓
            - generic [ref=e69]:
              - strong [ref=e70]: Duyệt profile
              - generic [ref=e71]: Reusable
          - listitem [ref=e72]:
            - generic [ref=e73]: ✓
            - generic [ref=e74]:
              - strong [ref=e75]: Nhập dữ liệu
              - generic [ref=e76]: Preview & commit
          - listitem [ref=e77]:
            - generic [ref=e78]: "6"
            - generic [ref=e79]:
              - strong [ref=e80]: Hoàn tất
              - generic [ref=e81]: Readiness
        - generic [ref=e82]:
          - generic [ref=e83]:
            - term [ref=e84]: Store
            - definition [ref=e85]: Cửa hàng A
          - generic [ref=e86]:
            - term [ref=e87]: File
            - definition [ref=e88]: 1 file · 1 sheets
          - generic [ref=e89]:
            - term [ref=e90]: Nguồn
            - definition [ref=e91]: Nguồn cửa hàng · Kiểm kê tồn kho
          - generic [ref=e92]:
            - term [ref=e93]: Trạng thái
            - definition [ref=e94]: Import hoàn tất
        - paragraph [ref=e95]: "Bước hiện tại: Lô có biên nhận hoàn tất"
        - region [ref=e96]:
          - heading "6. Hoàn tất" [active] [level=2] [ref=e97]
          - generic [ref=e98]:
            - generic [ref=e99]:
              - text: Bước 6/6 · Hoàn tất
              - heading "Import đã hoàn tất" [level=2] [ref=e100]
              - paragraph [ref=e101]: Batch đã commit thành công. Readiness được đánh giá riêng bên dưới.
            - region [ref=e102]:
              - generic [ref=e103]:
                - heading "2 rows đã được commit" [level=3] [ref=e104]:
                  - generic [aria-hidden] [ref=e105]: ✓
                  - text: 2 rows đã được commit
                - generic [ref=e106]: "Ngày dữ liệu: 10/10/2026"
              - generic [ref=e107]:
                - generic [ref=e108]:
                  - term [ref=e109]: dòng đã xử lý
                  - definition [ref=e110]: "2"
                - generic [ref=e111]:
                  - term [ref=e112]: mới
                  - definition [ref=e113]: "0"
                - generic [ref=e114]:
                  - term [ref=e115]: cập nhật
                  - definition [ref=e116]: "2"
                - generic [ref=e117]:
                  - term [ref=e118]: không đổi
                  - definition [ref=e119]: "0"
            - generic [ref=e120]:
              - generic [ref=e121]:
                - heading "Kho" [level=3] [ref=e122]
                - paragraph [ref=e123]:
                  - strong [ref=e124]: "2"
                  - text: nguyên liệu bị ảnh hưởng
                - link "Xem kho" [ref=e125] [cursor=pointer]:
                  - /url: /inventory
                - generic [ref=e126]: Đã cập nhật
              - generic [ref=e127]:
                - heading "Menu" [level=3] [ref=e128]
                - paragraph [ref=e129]:
                  - strong [ref=e130]: "0"
                  - text: món bị ảnh hưởng
                - link "Xem menu" [ref=e131] [cursor=pointer]:
                  - /url: /menu
                - generic [ref=e132]: Không cập nhật
              - generic [ref=e133]:
                - heading "Bán hàng" [level=3] [ref=e134]
                - paragraph [ref=e135]:
                  - strong [ref=e136]: "0"
                  - text: bản ghi mới
                - generic [ref=e137]: Không cập nhật bán hàng
            - region [ref=e138]:
              - generic [ref=e139]:
                - generic [ref=e140]:
                  - text: Readiness
                  - heading "Khả năng lập kế hoạch" [level=2] [ref=e141]
                - generic [ref=e142]: Chưa đánh giá
              - region "Mức sẵn sàng dữ liệu theo điều kiện" [ref=e143]:
                - generic [ref=e144]:
                  - strong [ref=e145]: Dữ liệu sẵn sàng
                  - generic [ref=e146]: Không phải tiến trình bước
                - list [ref=e152]:
                  - listitem [ref=e153]:
                    - generic [aria-hidden] [ref=e154]: …
                    - generic [ref=e155]:
                      - strong [ref=e156]: Doanh số
                      - generic [ref=e157]: Chưa đánh giá
                  - listitem [ref=e158]:
                    - generic [aria-hidden] [ref=e159]: …
                    - generic [ref=e160]:
                      - strong [ref=e161]: Tồn kho
                      - generic [ref=e162]: Chưa đánh giá
                  - listitem [ref=e163]:
                    - generic [aria-hidden] [ref=e164]: …
                    - generic [ref=e165]:
                      - strong [ref=e166]: Công thức
                      - generic [ref=e167]: Chưa đánh giá
                  - listitem [ref=e168]:
                    - generic [aria-hidden] [ref=e169]: …
                    - generic [ref=e170]:
                      - strong [ref=e171]: Nhà cung cấp
                      - generic [ref=e172]: Chưa đánh giá
                - paragraph [ref=e173]: Theo hành động planning và ngày đã chọn. Chưa có đánh giá riêng từng nguồn không đồng nghĩa nguồn đã hoàn tất.
              - button "Kiểm tra Readiness" [ref=e174] [cursor=pointer]
              - generic [ref=e175]:
                - link "Hoàn tất" [ref=e176] [cursor=pointer]:
                  - /url: /imports/history
                - link "Xem điều kiện và thiết lập kế hoạch" [ref=e177] [cursor=pointer]:
                  - /url: /forecast/planning
  - button "Debug" [ref=e178] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test'
  2   | 
  3   | async function uploadAndAnalyze(page: Page, scenario: string) {
  4   |   await page.addInitScript(value => sessionStorage.setItem('shelfcash:dev-scenario:v1', value), scenario)
  5   |   await page.goto('/imports')
  6   |   await page.getByLabel('Ngày dữ liệu', { exact: true }).fill('2026-10-10')
  7   |   await page.locator('input[type=file]').setInputFiles({ name: 'observed-stock.csv', mimeType: 'text/csv', buffer: Buffer.from('ingredient,on_hand,unit\nMilk,10,l\nCoffee,8,kg\n') })
  8   |   await page.getByRole('button', { name: 'Phân tích dữ liệu', exact: true }).click()
  9   |   await page.getByRole('button', { name: /^Phân tích [0-9]+ file$/ }).click()
  10  |   await expect(page.getByRole('heading', { name: scenario === 'owner-ready' ? 'Chưa có profile phù hợp' : scenario === 'staff-importer' ? 'Phân tích hoàn tất' : 'Chưa có cách đọc đã được duyệt', exact: true })).toBeVisible()
  11  |   await expect(page.getByRole('heading', { name: 'Kiểm tra cách hiểu', exact: true })).toHaveCount(0)
  12  |   await page.getByRole('button', { name: 'Kiểm tra cách hiểu', exact: true }).click()
  13  |   await expect(page.getByRole('heading', { name: 'Kiểm tra cách hiểu', exact: true })).toBeVisible()
  14  |   return new URL(page.url()).searchParams.get('import_id')
  15  | }
  16  | async function previewToCompletion(page: Page) {
  17  |   await page.getByRole('button', { name: 'Tạo Preview', exact: true }).click()
  18  |   await expect(page.getByRole('tab', { name: /Kiểm kê tồn kho/ })).toBeVisible()
  19  |   await expect(page.getByRole('button', { name: 'Tiếp tục xác nhận' })).toBeDisabled()
  20  |   await page.getByRole('button', { name: 'Đọc thêm dòng Preview' }).click()
  21  |   await page.getByRole('button', { name: 'Tiếp tục xác nhận' }).click()
  22  |   await page.getByLabel('Lý do review (bắt buộc)').fill('Reviewed all retained rows')
  23  |   await page.getByLabel('Tôi đã đọc đủ dữ liệu, nguồn báo cáo, cách đọc và cảnh báo.').check()
  24  |   await page.getByRole('button', { name: 'Xác nhận đã kiểm tra' }).click()
  25  |   await page.getByLabel('Lý do nhập dữ liệu (bắt buộc)').fill('Count observed stock')
  26  |   await page.getByLabel('Tôi đã kiểm tra dữ liệu, cảnh báo và phạm vi nhập.').check()
  27  |   await page.getByRole('button', { name: 'Xác nhận và nhập dữ liệu' }).click()
  28  |   await expect(page.getByRole('heading', { name: 'Import đã hoàn tất', exact: true, level: 2 })).toBeVisible()
  29  |   await expect(page.getByRole('heading', { name: 'Khả năng lập kế hoạch', exact: true })).toBeVisible()
  30  | }
  31  | 
  32  | test('012 OWNER navigates Analyze → Resolve → reusable approval → Preview → Review → Commit → separate Readiness', async ({ page }) => {
  33  |   const id = await uploadAndAnalyze(page, 'owner-ready')
  34  |   await expect(page.getByText('OWNER FLOW', { exact: true })).toBeVisible()
  35  |   await page.getByRole('button', { name: 'Chỉnh mapping', exact: true }).click()
  36  |   await page.getByRole('button', { name: /^Lưu (mapping|đề xuất)$/ }).click()
  37  |   await page.getByRole('button', { name: 'Xem profile sẽ được lưu' }).click()
  38  |   await expect(page.getByRole('heading', { name: 'Duyệt cách đọc dữ liệu' })).toBeVisible()
  39  |   await expect(page.getByRole('button', { name: 'Tạo Preview', exact: true })).toBeDisabled()
  40  |   await page.screenshot({ path: 'test-results/012-owner-review-profile.png', fullPage: true })
  41  |   await page.getByLabel('Lý do duyệt').fill('Owner reviewed reusable spec and evidence')
  42  |   await page.getByLabel('Tôi đã kiểm tra cách đọc đề xuất, bằng chứng và cách đọc đã duyệt (nếu có).').check()
  43  |   await page.getByRole('button', { name: 'Duyệt profile' }).click()
  44  |   await expect(page.getByRole('heading', { name: 'Profile đã được duyệt', exact: true })).toBeVisible()
  45  |   await page.screenshot({ path: 'test-results/012-owner-profile.png', fullPage: true })
  46  |   await previewToCompletion(page)
  47  |   expect(new URL(page.url()).searchParams.get('import_id')).toBe(id)
> 48  |   await expect(page.getByText('Chưa đánh giá', { exact: true })).toBeVisible()
      |                                                                  ^ Error: expect(locator).toBeVisible() failed
  49  |   await page.getByRole('button', { name: 'Kiểm tra Readiness', exact: true }).click()
  50  |   if(await page.getByRole('button', {name:'Kiểm tra Readiness',exact:true}).isVisible() && !(await page.getByText('Đủ dữ liệu', {exact:true}).isVisible())) await page.getByRole('button', {name:'Kiểm tra Readiness',exact:true}).click()
  51  |   await expect(page.getByText('Đủ dữ liệu', { exact: true })).toBeVisible()
  52  |   await page.screenshot({ path: 'test-results/012-owner-complete.png', fullPage: true })
  53  | })
  54  | 
  55  | test('012 STAFF reuses approved profile without Owner approval controls and completes import', async ({ page }) => {
  56  |   const id = await uploadAndAnalyze(page, 'staff-importer')
  57  |   await expect(page.getByText('STAFF FLOW', { exact: true })).toBeVisible()
  58  |   await expect(page.getByText('Đang dùng cách đọc đã duyệt', { exact: true })).toBeVisible()
  59  |   await expect(page.getByRole('button', { name: 'Xem profile sẽ được lưu' })).toHaveCount(0)
  60  |   await expect(page.getByRole('button', { name: 'Duyệt profile' })).toHaveCount(0)
  61  |   await expect(page.getByRole('button', { name: 'Gửi Owner duyệt', exact: true })).toHaveCount(0)
  62  |   await previewToCompletion(page)
  63  |   expect(new URL(page.url()).searchParams.get('import_id')).toBe(id)
  64  |   await expect(page.getByRole('button', { name: 'Kiểm tra Readiness', exact: true })).toBeDisabled()
  65  |   await expect(page.getByText(/Bạn chưa có quyền xem đánh giá lập kế hoạch/)).toBeVisible()
  66  |   await page.screenshot({ path: 'test-results/012-staff-complete.png', fullPage: true })
  67  | })
  68  | 
  69  | for (const reject of [false, true]) test(`012 STAFF reusable change: submit → waiting → ${reject ? 'rejected → retained mapping → unchanged proposal resubmit blocked' : 'approved'} retains batch`, async ({ page }) => {
  70  |   const id = await uploadAndAnalyze(page, reject ? 'staff-rejected' : 'staff-approval')
  71  |   await page.getByRole('button', { name: 'Chỉnh mapping', exact: true }).click()
  72  |   await page.getByRole('button', { name: /^Lưu (mapping|đề xuất)$/ }).click()
  73  |   await page.getByRole('button', { name: 'Gửi Owner duyệt', exact: true }).click()
  74  |   await page.getByRole('dialog').getByRole('button', { name: 'Gửi Owner duyệt', exact: true }).click()
  75  |   await expect(page.getByRole('heading', { name: 'Đang chờ Owner duyệt', exact: true })).toBeVisible()
  76  |   await expect(page.getByRole('button', { name: 'Chỉnh mapping', exact: true })).toHaveCount(0)
  77  |   if (reject) {
  78  |     await expect(page.getByText('Cần chỉnh lại cách hiểu', { exact: true })).toBeVisible()
  79  |     await page.getByRole('button', { name: 'Chỉnh lại', exact: true }).click()
  80  |     await page.getByRole('button', { name: 'Chỉnh mapping', exact: true }).click()
  81  |     await expect(page.getByRole('dialog').getByRole('button',{name:'Lưu mapping',exact:true})).toBeDisabled()
  82  |     await page.getByRole('dialog').getByRole('button',{name:'Hủy',exact:true}).click()
  83  |     await page.getByRole('button', { name: 'Gửi Owner duyệt', exact: true }).click()
  84  |     await page.getByRole('dialog').getByRole('button', { name: 'Gửi Owner duyệt', exact: true }).click()
  85  |     await expect(page.getByText('Đề xuất đã bị trả lại. Cần chỉnh cách hiểu trước khi gửi lại.',{exact:true})).toBeVisible()
  86  |     expect(new URL(page.url()).searchParams.get('import_id')).toBe(id)
  87  |     return
  88  |   }
  89  |   await expect(page.getByText('Cách đọc đã được duyệt', { exact: true })).toBeVisible()
  90  |   expect(new URL(page.url()).searchParams.get('import_id')).toBe(id)
  91  |   await expect(page.locator('input[type=file]')).toHaveCount(0)
  92  |   await expect(page.getByRole('button', { name: 'Duyệt profile' })).toHaveCount(0)
  93  |   await previewToCompletion(page)
  94  | })
  95  | 
  96  | test('012 unknown reopened import never creates a replacement draft on refresh', async ({ page }) => {
  97  |   await page.goto('/imports?import_id=00000000-0000-4000-8000-000000000999')
  98  |   await expect(page.getByText(/Chưa đọc được đúng lô trong URL/)).toBeVisible()
  99  |   await page.reload()
  100 |   expect(new URL(page.url()).searchParams.get('import_id')).toBe('00000000-0000-4000-8000-000000000999')
  101 |   await expect(page.getByRole('button', { name: 'Phân tích dữ liệu', exact: true })).toBeDisabled()
  102 | })
  103 | 
  104 | test('frozen v1 Owner rejection has separate reason/ack and returns to retained Resolve',async({page})=>{
  105 |   const id=await uploadAndAnalyze(page,'owner-ready')
  106 |   await page.getByRole('button',{name:'Chỉnh mapping',exact:true}).click()
  107 |   await page.getByRole('button',{name:'Lưu mapping',exact:true}).click()
  108 |   await page.getByRole('button',{name:'Xem profile sẽ được lưu',exact:true}).click()
  109 |   await page.getByRole('button',{name:'Từ chối',exact:true}).click()
  110 |   await page.getByLabel('Lý do từ chối',{exact:true}).fill('Need corrected semantic evidence')
  111 |   await expect(page.getByRole('button',{name:'Từ chối đề xuất',exact:true})).toBeDisabled()
  112 |   await page.getByLabel('Tôi xác nhận trả đề xuất này về để chỉnh lại.',{exact:true}).check()
  113 |   await page.getByRole('button',{name:'Từ chối đề xuất',exact:true}).click()
  114 |   await expect(page.getByRole('heading',{name:'Profile đã bị từ chối',exact:true})).toBeVisible()
  115 |   await page.getByRole('button',{name:'Quay lại chỉnh sửa',exact:true}).click()
  116 |   await expect(page.getByRole('heading',{name:'Kiểm tra cách hiểu',exact:true})).toBeVisible()
  117 |   expect(new URL(page.url()).searchParams.get('import_id')).toBe(id)
  118 | })
  119 | 
```