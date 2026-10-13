import {test,expect} from '@playwright/test'
test('mobile Inventory and public credential page remain usable',async({page})=>{
  await page.goto('/inventory')
  await expect(page.getByRole('heading',{name:'Kho',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Nhận hàng / Tồn đầu kỳ'}).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByLabel(/Số lượng thực nhận/)).toBeVisible()
  await page.screenshot({path:'test-results/receipt-mobile.png',fullPage:false,animations:'disabled'})
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.goto('/credentials/complete')
  await expect(page.getByText(/Mở liên kết thiết lập mật khẩu/)).toBeVisible()
})
