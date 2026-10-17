# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: import-playground.mock.spec.ts >> 014 product buttons progress the isolated world independently of controller navigation
- Location: tests\e2e\import-playground.mock.spec.ts:73:1

# Error details

```
Error: page.goto: net::ERR_PROXY_CONNECTION_FAILED at http://127.0.0.1:4173/imports
Call log:
  - navigating to "http://127.0.0.1:4173/imports", waiting until "load"

```

# Test source

```ts
  1   | import {test,expect,type Page} from '@playwright/test'
  2   | import {importPlaygroundCatalog,happyPath,previewScenario} from '../../src/shared/debug/importPlayground.catalog'
  3   | import type {ImportRole} from '../../src/features/import-data/importExperience'
  4   | 
  5   | async function open(page:Page){await page.getByRole('button',{name:'Debug',exact:true}).click();return page.getByRole('dialog',{name:'UI State Preview',exact:true})}
  6   | async function choose(page:Page,role:ImportRole,id:string){
  7   |   const debug=page.getByRole('dialog',{name:'UI State Preview',exact:true})
  8   |   if(await debug.getByLabel('Role',{exact:true}).inputValue()!==role)await debug.getByLabel('Role',{exact:true}).selectOption(role)
  9   |   const scenario=previewScenario(role,id)
  10  |   await debug.getByLabel('Step',{exact:true}).selectOption(String(scenario.step))
  11  |   await debug.getByLabel('Scenario',{exact:true}).selectOption(id)
  12  |   const view=page.locator(`.import-page[data-ui-preview="${id}"]`)
  13  |   await expect(view).toBeVisible()
  14  |   return view
  15  | }
  16  | 
  17  | test('014 every catalog scenario renders the actual Import screen without reload',async({page})=>{
  18  |   let navigations=0;page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations++})
  19  |   await page.goto('/imports');await open(page)
  20  |   const start=navigations
  21  |   for(const role of ['OWNER','STAFF'] as const)for(const scenario of importPlaygroundCatalog[role]){
  22  |     const view=await choose(page,role,scenario.id)
  23  |     await expect(view.locator('.input-steps [aria-current=step]')).toContainText(String(scenario.step))
  24  |     await expect(view.locator('h1')).toHaveText('Nhập dữ liệu')
  25  |     await expect(view).toContainText(`${role} FLOW`)
  26  |     await expect(page.getByRole('dialog',{name:'UI State Preview',exact:true})).toBeVisible()
  27  |     if(role==='OWNER'&&scenario.id==='profile-review'||role==='STAFF'&&scenario.id==='resolve-waiting')await page.screenshot({path:`test-results/014-${role}-${scenario.id}.png`,fullPage:false})
  28  |   }
  29  |   expect(navigations).toBe(start)
  30  | })
  31  | 
  32  | test('014 Next/Previous follow both canonical paths, including frozen Processing and ready Completion',async({page})=>{
  33  |   await page.goto('/imports');const debug=await open(page)
  34  |   for(const role of ['OWNER','STAFF'] as const){
  35  |     await debug.getByRole('button',{name:`${role} · Start`,exact:true}).click()
  36  |     for(const id of happyPath[role]){
  37  |       const view=page.locator(`.import-page[data-ui-preview="${id}"]`);await expect(view).toBeVisible()
  38  |       if(id==='commit-processing'){await expect(view).toContainText('Đang nhập dữ liệu');await page.waitForTimeout(2600);await expect(view).toContainText('Đang nhập dữ liệu')}
  39  |       if(id==='complete-ready'){await expect(view).toContainText('Đủ dữ liệu cho hành động tiếp theo');break}
  40  |       await debug.getByRole('button',{name:'Next state →',exact:true}).click()
  41  |     }
  42  |     await expect(debug.getByRole('button',{name:'Next state →',exact:true})).toBeDisabled()
  43  |     await debug.getByRole('button',{name:'← Previous state',exact:true}).click()
  44  |     await expect(page.locator('[data-ui-preview="commit-processing"]')).toBeVisible()
  45  |   }
  46  | })
  47  | 
  48  | test('014 presets/errors update screens; reset and exit preserve the original selected file',async({page})=>{
  49  |   await page.goto('/imports')
  50  |   await page.getByLabel('Ngày dữ liệu',{exact:true}).fill('2026-10-09')
  51  |   await page.locator('input[type=file]').setInputFiles({name:'my-original.csv',mimeType:'text/csv',buffer:Buffer.from('original\n1')})
  52  |   const debug=await open(page)
  53  |   await expect(debug.getByLabel('Role',{exact:true})).toBeVisible()
  54  |   await expect(debug.getByText('Lô nhập hiện tại',{exact:true})).not.toBeVisible()
  55  |   await debug.getByLabel('Data condition',{exact:true}).selectOption('missing')
  56  |   await expect(page.locator('[data-ui-preview="complete-blocked"]')).toContainText('Supplier cost còn thiếu')
  57  |   await expect(page.locator('[data-ui-preview="complete-blocked"]')).toContainText('Inventory completeness chưa đạt')
  58  |   await debug.getByRole('button',{name:'Next state →',exact:true}).click()
  59  |   await expect(debug.getByLabel('Data condition',{exact:true})).toHaveValue('sufficient')
  60  |   await expect(page.locator('[data-ui-preview="file-ready"]')).toBeVisible()
  61  |   await debug.getByLabel('Simulate error',{exact:true}).selectOption('preview-stale')
  62  |   await expect(page.locator('[data-ui-preview="preview-stale"]')).toContainText('Preview không còn mới nhất')
  63  |   await debug.getByRole('button',{name:'Reset scenario',exact:true}).click()
  64  |   await expect(page.locator('[data-ui-preview="file-ready"]')).toBeVisible()
  65  |   await expect(debug.getByLabel('Data condition',{exact:true})).toHaveValue('sufficient')
  66  |   await debug.getByRole('button',{name:'Return to current import',exact:true}).click()
  67  |   await debug.getByRole('button',{name:'Đóng Debug',exact:true}).click()
  68  |   await expect(page.locator('[data-ui-preview]')).toHaveCount(0)
  69  |   await expect(page.getByRole('main')).toContainText('my-original.csv')
  70  |   await expect(page.getByLabel('Ngày dữ liệu',{exact:true})).toHaveValue('2026-10-09')
  71  | })
  72  | 
  73  | test('014 product buttons progress the isolated world independently of controller navigation',async({page})=>{
> 74  |   await page.goto('/imports');const debug=await open(page)
      |              ^ Error: page.goto: net::ERR_PROXY_CONNECTION_FAILED at http://127.0.0.1:4173/imports
  75  |   await choose(page,'STAFF','file-ready')
  76  |   await debug.getByRole('button',{name:'Đóng Debug',exact:true}).click()
  77  |   const view=page.locator('[data-ui-preview="file-ready"]')
  78  |   await view.getByRole('button',{name:'Phân tích dữ liệu',exact:true}).click()
  79  |   await page.getByRole('button', { name: /^Phân tích [0-9]+ file$/ }).click()
  80  |   await expect(view.getByRole('heading',{name:'Phân tích hoàn tất',exact:true})).toBeVisible()
  81  |   await view.getByRole('button',{name:'Kiểm tra cách hiểu',exact:true}).click()
  82  |   await view.getByRole('button',{name:'Tạo Preview',exact:true}).click()
  83  |   await expect(view.getByRole('heading',{name:'Xem trước dữ liệu',exact:true})).toBeVisible()
  84  |   await view.getByRole('button',{name:'Tiếp tục xác nhận',exact:true}).click()
  85  |   await expect(view.getByRole('heading',{name:'Xác nhận nhập dữ liệu',exact:true})).toBeVisible()
  86  | })
  87  | 
  88  | test('frozen v1 OWNER/STAFF share resolver scope geometry and a single navigation counter',async({page})=>{
  89  |   await page.goto('/imports');await open(page)
  90  |   const widths:number[]=[]
  91  |   for(const role of ['OWNER','STAFF'] as const){
  92  |     await choose(page,role,'resolve-manual')
  93  |     await page.getByRole('dialog',{name:'UI State Preview',exact:true}).getByRole('button',{name:'Đóng Debug',exact:true}).click()
  94  |     const drawer=page.getByRole('dialog',{name:'Cấu trúc & semantics',exact:true})
  95  |     await expect(drawer).toBeVisible()
  96  |     await expect(drawer.getByRole('combobox',{name:'File',exact:true})).toBeVisible()
  97  |     await expect(drawer.getByRole('combobox',{name:'Sheet',exact:true})).toBeVisible()
  98  |     await expect(drawer.locator('.input-resolver-itemnav strong')).toHaveCount(1)
  99  |     widths.push((await drawer.boundingBox())!.width)
  100 |     await expect(drawer.getByRole('button',{name:'Tất cả',exact:true})).toBeVisible()
  101 |     await expect(drawer.getByRole('button',{name:/^Lưu (mapping|đề xuất)$/})).toBeVisible()
  102 |     await drawer.screenshot({path:`test-results/015-frozen-${role}-resolver.png`})
  103 |     await drawer.getByRole('button',{name:'Hủy',exact:true}).click()
  104 |     await open(page)
  105 |   }
  106 |   expect(widths[0]).toBe(500);expect(widths[1]).toBe(widths[0])
  107 | })
  108 | 
  109 | test('frozen v1 identity search requires explicit Store entity selection and does not call HTTP in DEV preview',async({page})=>{
  110 |   const requests:string[]=[];page.on('request',request=>{if(request.url().includes('/api/v1/'))requests.push(request.url())})
  111 |   await page.goto('/imports');await open(page);await choose(page,'OWNER','resolve-identity')
  112 |   await page.getByRole('dialog',{name:'UI State Preview',exact:true}).getByRole('button',{name:'Đóng Debug',exact:true}).click()
  113 |   const drawer=page.getByRole('dialog',{name:'Identity',exact:true})
  114 |   const save=drawer.getByRole('button',{name:'Lưu bindings',exact:true})
  115 |   await expect(save).toBeDisabled()
  116 |   await drawer.getByLabel('Tìm nguyên liệu',{exact:true}).fill('Sữa tươi')
  117 |   await expect(drawer.locator('.input-entity-results button')).toHaveCount(2)
  118 |   await expect(save).toBeDisabled()
  119 |   await drawer.locator('.input-entity-results button').first().click()
  120 |   await expect(save).toBeEnabled()
  121 |   await expect(drawer.locator('.input-binding-preview')).toContainText('Sữa tươi')
  122 |   await drawer.getByLabel('Tìm nguyên liệu',{exact:true}).fill('Oatly')
  123 |   await expect(save).toBeDisabled()
  124 |   expect(requests).toEqual([])
  125 | })
  126 | 
```