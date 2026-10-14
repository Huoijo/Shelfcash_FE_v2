import {test,expect,type Page} from '@playwright/test'
import {importPlaygroundCatalog,happyPath,previewScenario} from '../../src/shared/debug/importPlayground.catalog'
import type {ImportRole} from '../../src/features/import-data/importExperience'

async function open(page:Page){await page.getByRole('button',{name:'Debug',exact:true}).click();return page.getByRole('dialog',{name:'UI State Preview',exact:true})}
async function choose(page:Page,role:ImportRole,id:string){
  const debug=page.getByRole('dialog',{name:'UI State Preview',exact:true})
  if(await debug.getByLabel('Role',{exact:true}).inputValue()!==role)await debug.getByLabel('Role',{exact:true}).selectOption(role)
  const scenario=previewScenario(role,id)
  await debug.getByLabel('Step',{exact:true}).selectOption(String(scenario.step))
  await debug.getByLabel('Scenario',{exact:true}).selectOption(id)
  const view=page.locator(`.import-page[data-ui-preview="${id}"]`)
  await expect(view).toBeVisible()
  return view
}

test('014 every catalog scenario renders the actual Import screen without reload',async({page})=>{
  let navigations=0;page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations++})
  await page.goto('/imports');await open(page)
  const start=navigations
  for(const role of ['OWNER','STAFF'] as const)for(const scenario of importPlaygroundCatalog[role]){
    const view=await choose(page,role,scenario.id)
    await expect(view.locator('.input-steps [aria-current=step]')).toContainText(String(scenario.step))
    await expect(view.locator('h1')).toHaveText('Nhập dữ liệu')
    await expect(view).toContainText(`${role} FLOW`)
    await expect(page.getByRole('dialog',{name:'UI State Preview',exact:true})).toBeVisible()
    if(role==='OWNER'&&scenario.id==='profile-review'||role==='STAFF'&&scenario.id==='resolve-waiting')await page.screenshot({path:`test-results/014-${role}-${scenario.id}.png`,fullPage:false})
  }
  expect(navigations).toBe(start)
})

test('014 Next/Previous follow both canonical paths, including frozen Processing and ready Completion',async({page})=>{
  await page.goto('/imports');const debug=await open(page)
  for(const role of ['OWNER','STAFF'] as const){
    await debug.getByRole('button',{name:`${role} · Start`,exact:true}).click()
    for(const id of happyPath[role]){
      const view=page.locator(`.import-page[data-ui-preview="${id}"]`);await expect(view).toBeVisible()
      if(id==='commit-processing'){await expect(view).toContainText('Đang nhập dữ liệu');await page.waitForTimeout(2600);await expect(view).toContainText('Đang nhập dữ liệu')}
      if(id==='complete-ready'){await expect(view).toContainText('Đủ dữ liệu cho hành động tiếp theo');break}
      await debug.getByRole('button',{name:'Next state →',exact:true}).click()
    }
    await expect(debug.getByRole('button',{name:'Next state →',exact:true})).toBeDisabled()
    await debug.getByRole('button',{name:'← Previous state',exact:true}).click()
    await expect(page.locator('[data-ui-preview="commit-processing"]')).toBeVisible()
  }
})

test('014 presets/errors update screens; reset and exit preserve the original selected file',async({page})=>{
  await page.goto('/imports')
  await page.getByLabel('Ngày dữ liệu',{exact:true}).fill('2026-10-09')
  await page.locator('input[type=file]').setInputFiles({name:'my-original.csv',mimeType:'text/csv',buffer:Buffer.from('original\n1')})
  const debug=await open(page)
  await expect(debug.getByLabel('Role',{exact:true})).toBeVisible()
  await expect(debug.getByText('Lô nhập hiện tại',{exact:true})).not.toBeVisible()
  await debug.getByLabel('Data condition',{exact:true}).selectOption('missing')
  await expect(page.locator('[data-ui-preview="complete-blocked"]')).toContainText('Supplier cost còn thiếu')
  await expect(page.locator('[data-ui-preview="complete-blocked"]')).toContainText('Inventory completeness chưa đạt')
  await debug.getByRole('button',{name:'Next state →',exact:true}).click()
  await expect(debug.getByLabel('Data condition',{exact:true})).toHaveValue('sufficient')
  await expect(page.locator('[data-ui-preview="file-ready"]')).toBeVisible()
  await debug.getByLabel('Simulate error',{exact:true}).selectOption('preview-stale')
  await expect(page.locator('[data-ui-preview="preview-stale"]')).toContainText('Preview không còn mới nhất')
  await debug.getByRole('button',{name:'Reset scenario',exact:true}).click()
  await expect(page.locator('[data-ui-preview="file-ready"]')).toBeVisible()
  await expect(debug.getByLabel('Data condition',{exact:true})).toHaveValue('sufficient')
  await debug.getByRole('button',{name:'Return to current import',exact:true}).click()
  await debug.getByRole('button',{name:'Đóng Debug',exact:true}).click()
  await expect(page.locator('[data-ui-preview]')).toHaveCount(0)
  await expect(page.getByRole('main')).toContainText('my-original.csv')
  await expect(page.getByLabel('Ngày dữ liệu',{exact:true})).toHaveValue('2026-10-09')
})

test('014 product buttons progress the isolated world independently of controller navigation',async({page})=>{
  await page.goto('/imports');const debug=await open(page)
  await choose(page,'STAFF','file-ready')
  await debug.getByRole('button',{name:'Đóng Debug',exact:true}).click()
  const view=page.locator('[data-ui-preview="file-ready"]')
  await view.getByRole('button',{name:'Phân tích dữ liệu',exact:true}).click()
  await expect(view.getByRole('heading',{name:'Phân tích hoàn tất',exact:true})).toBeVisible()
  await view.getByRole('button',{name:'Kiểm tra cách hiểu',exact:true}).click()
  await view.getByRole('button',{name:'Tạo Preview',exact:true}).click()
  await expect(view.getByRole('heading',{name:'Xem trước dữ liệu',exact:true})).toBeVisible()
  await view.getByRole('button',{name:'Tiếp tục xác nhận',exact:true}).click()
  await expect(view.getByRole('heading',{name:'Kiểm tra trước khi nhập',exact:true})).toBeVisible()
})
