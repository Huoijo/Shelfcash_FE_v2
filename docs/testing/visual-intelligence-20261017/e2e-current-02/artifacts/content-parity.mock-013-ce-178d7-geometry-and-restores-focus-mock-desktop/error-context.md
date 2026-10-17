# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: content-parity.mock.spec.ts >> 013 centralized Debug is out of flow, preserves geometry and restores focus
- Location: tests\e2e\content-parity.mock.spec.ts:8:1

# Error details

```
Error: page.goto: net::ERR_PROXY_CONNECTION_FAILED at http://127.0.0.1:4173/imports
Call log:
  - navigating to "http://127.0.0.1:4173/imports", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect, type Page } from '@playwright/test'
  2  | 
  3  | async function geometry(page: Page) {
  4  |   const selectors=['.app-shell__header','.import-page__heading','.input-steps','.import-upload__dropzone','.import-page__process']
  5  |   return Promise.all(selectors.map(selector=>page.locator(selector).boundingBox()))
  6  | }
  7  | 
  8  | test('013 centralized Debug is out of flow, preserves geometry and restores focus',async({page})=>{
> 9  |   await page.goto('/imports')
     |              ^ Error: page.goto: net::ERR_PROXY_CONNECTION_FAILED at http://127.0.0.1:4173/imports
  10 |   const main=page.getByRole('main')
  11 |   await expect(main).not.toContainText(/Minh họa|DEV\/QA|mock\.synthetic|Không phân tích file|Không ghi dữ liệu thật/)
  12 |   await expect(page.getByLabel('DEV scenario',{exact:true})).toHaveCount(0)
  13 |   const before=await geometry(page), scroll=await page.evaluate(()=>scrollY)
  14 |   const trigger=page.getByRole('button',{name:'Debug',exact:true})
  15 |   expect(await trigger.evaluate(element=>getComputedStyle(element).position)).toBe('fixed')
  16 |   await trigger.click()
  17 |   const debug=page.getByRole('dialog',{name:'UI State Preview',exact:true})
  18 |   await expect(debug.getByLabel('Role',{exact:true})).toBeVisible()
  19 |   await expect(debug.getByLabel('DEV scenario',{exact:true})).not.toBeVisible()
  20 |   await debug.getByText('Advanced diagnostics',{exact:true}).click()
  21 |   await expect(debug.getByLabel('DEV scenario',{exact:true})).toBeVisible()
  22 |   await expect(debug).toContainText('Mock — không phân tích file hoặc ghi dữ liệu thật')
  23 |   await debug.getByText('Import workspace',{exact:true}).click()
  24 |   await expect(debug).toContainText('"role": "OWNER"')
  25 |   expect(await geometry(page)).toEqual(before)
  26 |   expect(await page.evaluate(()=>scrollY)).toBe(scroll)
  27 |   await page.keyboard.press('Escape')
  28 |   await expect(debug).toHaveCount(0)
  29 |   await expect(trigger).toBeFocused()
  30 |   expect(await geometry(page)).toEqual(before)
  31 | })
  32 | 
  33 | test('013 row evidence is available only in Debug, including while a product drawer is open',async({page})=>{
  34 |   await page.addInitScript(()=>sessionStorage.setItem('shelfcash:dev-scenario:v1','staff-importer'))
  35 |   await page.goto('/imports')
  36 |   await page.getByLabel('Ngày dữ liệu',{exact:true}).fill('2026-10-11')
  37 |   await page.locator('input[type=file]').setInputFiles({name:'observed.csv',mimeType:'text/csv',buffer:Buffer.from('lot,on_hand\nLOT,10')})
  38 |   await page.getByRole('button',{name:'Phân tích dữ liệu',exact:true}).click()
  39 |   await page.getByRole('button', { name: /^Phân tích [0-9]+ file$/ }).click()
  40 |   await expect(page.getByRole('heading',{name:'Phân tích hoàn tất',exact:true})).toBeVisible()
  41 |   await expect(page.getByRole('main')).not.toContainText(/Stage:|mock\.synthetic|Bindings và|schema\/|DEV\/QA/)
  42 |   await page.screenshot({path:'test-results/013-staff-analyze.png',fullPage:true})
  43 |   await page.getByRole('button',{name:'Kiểm tra cách hiểu',exact:true}).click()
  44 |   await page.screenshot({path:'test-results/013-staff-resolve.png',fullPage:true})
  45 |   await page.getByRole('button',{name:'Tạo Preview',exact:true}).click()
  46 |   const row=page.getByRole('row',{name:/Mở chi tiết dòng/}).first()
  47 |   await row.focus();await page.keyboard.press('Enter')
  48 |   const detail=page.getByRole('dialog',{name:'Chi tiết dòng dữ liệu',exact:true})
  49 |   await expect(detail).not.toContainText(/SOURCE_EXPLICIT|source_column_index|row_id|read-set|DTO/)
  50 |   await expect(detail.getByRole('heading',{name:'Giá trị trước → Giá trị sau'})).toBeVisible()
  51 |   await page.getByRole('button',{name:'Debug',exact:true}).click()
  52 |   const debug=page.getByRole('dialog',{name:'UI State Preview',exact:true})
  53 |   await debug.getByText('Advanced diagnostics',{exact:true}).click()
  54 |   await debug.getByText('Preview row / provenance / permissions',{exact:true}).click()
  55 |   await expect(debug).toContainText('SOURCE_EXPLICIT')
  56 |   await expect(debug).toContainText('row_id')
  57 |   await page.keyboard.press('Escape')
  58 |   await expect(debug).toHaveCount(0)
  59 |   await expect(detail).toBeVisible()
  60 |   await page.getByRole('button',{name:'Debug',exact:true}).click()
  61 |   await debug.getByRole('button',{name:'OWNER · Start',exact:true}).click()
  62 |   await expect(page.locator('[data-ui-preview="file-ready"]')).toBeVisible()
  63 |   await expect(detail).not.toBeVisible()
  64 |   await debug.getByRole('button',{name:'Return to current import',exact:true}).click()
  65 |   await debug.getByRole('button',{name:'Đóng Debug',exact:true}).click()
  66 |   await expect(detail).toBeVisible()
  67 |   await page.keyboard.press('Escape')
  68 |   await expect(detail).toHaveCount(0)
  69 | })
  70 | 
```