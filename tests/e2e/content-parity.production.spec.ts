import { test, expect } from '@playwright/test'
import { backend } from './helpers/api'

test('013 production build exposes product UI without Debug, mock controls or diagnostic surfaces',async({page})=>{
  await backend(page,()=>undefined)
  await page.goto('/imports')
  await expect(page.getByRole('heading',{name:'Nhập dữ liệu',exact:true})).toBeVisible()
  await expect(page.getByRole('button',{name:'Debug',exact:true})).toHaveCount(0)
  await expect(page.getByLabel('DEV scenario')).toHaveCount(0)
  await expect(page.locator('.development-trigger,.development-drawer,.development-section')).toHaveCount(0)
  await expect(page.getByRole('main')).not.toContainText(/DEV\/QA|mock\.synthetic|Minh họa|Không phân tích file|API capability|STATE:|CANONICAL FLOW/)
  // Both canonical MagicPath headers deliberately include their role badge.
  await expect(page.getByText('OWNER FLOW',{exact:true})).toBeVisible()
  await page.screenshot({path:'test-results/013-production-upload.png',fullPage:true})
})
