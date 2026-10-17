# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: import-experience.mock.spec.ts >> 012 STAFF reusable change: submit → waiting → approved retains batch
- Location: tests\e2e\import-experience.mock.spec.ts:69:37

# Error details

```
Error: page.goto: net::ERR_PROXY_CONNECTION_FAILED at http://127.0.0.1:4173/imports
Call log:
  - navigating to "http://127.0.0.1:4173/imports", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test'
  2   | 
  3   | async function uploadAndAnalyze(page: Page, scenario: string) {
  4   |   await page.addInitScript(value => sessionStorage.setItem('shelfcash:dev-scenario:v1', value), scenario)
> 5   |   await page.goto('/imports')
      |              ^ Error: page.goto: net::ERR_PROXY_CONNECTION_FAILED at http://127.0.0.1:4173/imports
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
  48  |   await expect(page.getByText('Chưa đánh giá', { exact: true })).toBeVisible()
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
```