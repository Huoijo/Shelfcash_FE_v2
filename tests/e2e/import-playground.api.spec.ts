import {test,expect} from '@playwright/test'
import {backend} from './helpers/api'

test('014 API-mode playground cannot call live Import mutations or Readiness',async({page})=>{
  const unexpected:string[]=[]
  await backend(page,(path,method)=>{if(/imports|readiness/.test(path))unexpected.push(`${method} ${path}`);return undefined})
  await page.goto('/imports')
  await expect(page.getByRole('heading',{name:'Nhập dữ liệu',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Debug',exact:true}).click()
  const debug=page.getByRole('dialog',{name:'UI State Preview',exact:true})
  await debug.getByRole('button',{name:'STAFF · Final',exact:true}).click()
  const final=page.locator('[data-ui-preview="complete-ready"]')
  await expect(final).toContainText('Đủ dữ liệu cho hành động tiếp theo')
  await debug.getByRole('button',{name:'Đóng Debug',exact:true}).click()
  await final.getByRole('button',{name:'Kiểm tra Readiness',exact:true}).click()
  if(await page.getByRole('button', {name:'Kiểm tra Readiness',exact:true}).isVisible() && !(await page.getByText('Đủ dữ liệu', {exact:true}).isVisible())) await page.getByRole('button', {name:'Kiểm tra Readiness',exact:true}).click()
  await page.getByRole('button',{name:'Debug',exact:true}).click()
  await debug.getByRole('button',{name:'OWNER · Start',exact:true}).click()
  await expect(page.locator('[data-ui-preview="file-ready"]')).toBeVisible()
  await debug.getByRole('button',{name:'Đóng Debug',exact:true}).click()
  await page.locator('[data-ui-preview="file-ready"]').getByRole('button',{name:'Phân tích dữ liệu',exact:true}).click()
  await page.getByRole('button', { name: /^Phân tích [0-9]+ file$/ }).click()
  await expect(page.locator('[data-ui-preview="file-ready"]').getByRole('heading',{name:'Phân tích hoàn tất',exact:true})).toBeVisible()
  expect(unexpected).toEqual([])
})
