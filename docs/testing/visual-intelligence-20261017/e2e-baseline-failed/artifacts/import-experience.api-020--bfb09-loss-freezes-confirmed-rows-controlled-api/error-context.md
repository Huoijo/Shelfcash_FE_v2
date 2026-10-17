# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: import-experience.api.spec.ts >> 020 multiple history corrections gate every Review entry; closing evidence leaves pending and commit loss freezes confirmed rows
- Location: tests\e2e\import-experience.api.spec.ts:309:1

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator: getByRole('button', { name: 'Tiếp tục xác nhận', exact: true })
Expected: disabled
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeDisabled" getByRole('button', { name: 'Tiếp tục xác nhận', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Tiếp tục xác nhận', exact: true })

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
  - text: Nhập dữ liệu ShelfCash
  - link "Thông báo · 0 chưa đọc":
    - /url: /notifications
- main "Nhập dữ liệu":
  - heading "Nhập dữ liệu" [level=1]
  - text: STAFF FLOW
  - paragraph: Reuse khi an toàn, xử lý khi cần; chỉ gửi Owner duyệt khi cách đọc reusable thay đổi.
  - navigation "Tiện ích nhập dữ liệu":
    - text: Nhập mới
    - link "Lịch sử":
      - /url: /imports/history
  - list "Tiến trình nhập dữ liệu 6 bước":
    - listitem:
      - text: ✓
      - strong: File
      - text: Tải dữ liệu
    - listitem:
      - text: ✓
      - strong: Phân tích
      - text: Đọc nguồn
    - listitem:
      - text: ✓
      - strong: Kiểm tra
      - text: Cách hiểu
    - listitem:
      - text: "4"
      - strong: Xem trước
      - text: Read-only
    - listitem:
      - text: "5"
      - strong: Xác nhận
      - text: Commit
    - listitem:
      - text: "6"
      - strong: Hoàn tất
      - text: Readiness
  - term: Store
  - definition: Controlled Store
  - term: File
  - definition: 1 file · 1 sheets
  - term: Nguồn
  - definition: Nguồn cửa hàng · Kiểm kê tồn kho
  - term: Trạng thái
  - definition: Preview · Chưa ghi dữ liệu
  - paragraph: "Bước hiện tại: Đang tạo Preview"
  - region "4. Xem trước dữ liệu":
    - heading "4. Xem trước dữ liệu" [level=2]
    - status:
      - strong: Đang xử lý dữ liệu
    - paragraph: Chưa có dữ liệu nào được ghi vào ShelfCash.
    - button "Tạo bản xem trước"
- button "Debug"
```

# Test source

```ts
  213 |   await expect(save).toBeDisabled()
  214 |   await source.getByLabel('Hệ thống nguồn',{exact:true}).fill('custom.pos')
  215 |   await expect(save).toBeDisabled()
  216 |   await source.getByText('Semantics và định dạng nguồn (chỉ khai báo khi đã biết)',{exact:true}).click()
  217 |   await source.getByLabel('Thiếu thông tin hết hàng',{exact:true}).selectOption('not_provided')
  218 |   await source.getByLabel('Cơ sở tính giá',{exact:true}).selectOption('PER_SOURCE_UNIT')
  219 |   await source.getByRole('button',{name:'Thêm alias hết hàng',exact:true}).click()
  220 |   await source.getByLabel('Giá trị nguồn',{exact:true}).fill('HẾT HÀNG')
  221 |   await source.getByLabel('ShelfCash hiểu là',{exact:true}).selectOption('true')
  222 |   await source.getByRole('checkbox',{name:'Tôi xác nhận đây là đề xuất cách hiểu nguồn dùng lại, cần quyết định Profile.'}).check()
  223 |   await expect(save).toBeEnabled()
  224 |   await source.screenshot({path:'test-results/015-source-context.png'})
  225 |   expect(writes).toHaveLength(0)
  226 |   await save.click();await expect(source.getByRole('alert')).toBeVisible()
  227 |   const resolution=writes[0].body.resolution
  228 |   expect(resolution).toMatchObject({kind:'source_context',source_system_key:'custom.pos',missing_stockout:'not_provided',pack_cost_basis:'PER_SOURCE_UNIT',stockout_aliases:[{token:'HẾT HÀNG',value:true}]})
  229 |   expect(resolution).not.toHaveProperty('scope')
  230 | })
  231 | 
  232 | test('016 Supplier resolver uses SU01 snapshot paging and saves only the explicitly selected identity', async ({ page }) => {
  233 |   const work = await prepared(), searches: URL[] = [], saves: any[] = []
  234 |   let saved = false
  235 |   await api(page, work, async (path, method, body, headers, url) => {
  236 |     if (path === `/api/v1/stores/${s}`) return env({ store_id: s, name: 'Controlled Store', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', role: 'STAFF', membership_id: member, authorization_version: 'controlled-member/1', active: true, server_now: at, as_of_date: '2026-10-12', membership: { membership_id: member, role: 'STAFF', authorization_version: 'controlled-member/1', effective_permissions: [...permissions, 'supplier.read', 'mapping.propose'] }, permission_catalog_version: 'permissions-v3' })
  237 |     if (path.endsWith('/mapping-summary')) {
  238 |       const summary = await work.source.summary(work.id)
  239 |       return importEnvelope({ ...summary, progress: { total_fields: 3, completed_fields: saved ? 3 : 2, unresolved: saved ? 0 : 1 } })
  240 |     }
  241 |     if (path.endsWith('/mappings') && method === 'GET') {
  242 |       const queue = await work.source.queue(work.id, { review_only: false })
  243 |       return importEnvelope({ items: queue.items.map(item => ({ ...item, issue_type: 'identity', status: saved ? 'resolved' : 'needs_confirmation', target_field: 'supplier_terms.supplier_id', suggested_target_field: 'supplier_terms.supplier_id' })), counts: { total_fields: 3, completed_fields: saved ? 3 : 2, unresolved: saved ? 0 : 1 } }, queue.pagination)
  244 |     }
  245 |     if (path === `/api/v1/stores/${s}/suppliers`) {
  246 |       searches.push(url)
  247 |       const second = url.searchParams.has('cursor')
  248 |       return env({ items: [{ supplier_id: second ? '00000000-0000-4000-8000-000000000092' : '00000000-0000-4000-8000-000000000091', name: second ? 'Supplier selected' : 'Supplier inactive', active: second, version: 'supplier/1' }] }, { snapshot_id: 'supplier-snapshot/1', observed_at: at, pagination: { limit: 20, total_count: 2, next_cursor: second ? null : 'signed-supplier-cursor' } })
  249 |     }
  250 |     if (method === 'PATCH' && path.includes('/mappings/')) {
  251 |       saves.push(body)
  252 |       const result = await work.source.resolve(work.id, path.split('/').at(-1)!, { key: headers['idempotency-key'], mappingRevision: JSON.parse(headers['if-match']), resolution: body.resolution })
  253 |       saved = true
  254 |       return importEnvelope(result)
  255 |     }
  256 |   })
  257 |   await resolve(page, work.id)
  258 |   await page.getByRole('button', { name: 'Chọn entity', exact: true }).click()
  259 |   const drawer = page.getByRole('dialog', { name: 'Identity', exact: true })
  260 |   await drawer.getByLabel('Tìm nhà cung cấp').fill('Supplier')
  261 |   await expect(drawer.getByRole('button', { name: /Supplier inactive/ })).toBeVisible()
  262 |   expect(saves).toHaveLength(0)
  263 |   await drawer.getByRole('button', { name: 'Xem thêm', exact: true }).click()
  264 |   await drawer.getByRole('button', { name: /Supplier selected/ }).click()
  265 |   await drawer.getByRole('button', { name: 'Lưu bindings', exact: true }).click()
  266 |   await expect(drawer).toHaveCount(0)
  267 |   expect(searches).toHaveLength(2)
  268 |   expect(searches[1].searchParams.get('snapshot_id')).toBe('supplier-snapshot/1')
  269 |   expect(searches[0].searchParams.has('active')).toBe(false)
  270 |   expect(saves).toEqual([{ resolution: { kind: 'identity_binding', canonical_id: '00000000-0000-4000-8000-000000000092' } }])
  271 | })
  272 | 
  273 | test('016 Owner reaches complete full-spec review with pending RULE candidates without an M04 confirmation first', async ({ page }) => {
  274 |   const work = await prepared(true)
  275 |   const writes = await api(page, work, async path => {
  276 |     if (path === '/api/v1/stores') return env({ items: [{ store_id: s, name: 'Controlled Store', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', role: 'OWNER', membership_id: member, authorization_version: 'controlled-member/1' }] }, paging(1))
  277 |     if (path === `/api/v1/stores/${s}`) return env({ store_id: s, name: 'Controlled Store', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', role: 'OWNER', membership_id: member, authorization_version: 'controlled-member/1', active: true, server_now: at, as_of_date: '2026-10-12', membership: { membership_id: member, role: 'OWNER', authorization_version: 'controlled-member/1', effective_permissions: [...permissions, 'mapping.propose'] }, permission_catalog_version: 'permissions-v3' })
  278 |     if (path.endsWith('/mapping-summary')) {
  279 |       const summary = await work.source.summary(work.id)
  280 |       return importEnvelope({ ...summary, progress: { total_fields: 3, completed_fields: 2, unresolved: 1 } })
  281 |     }
  282 |     if (path.endsWith('/mappings')) {
  283 |       const queue = await work.source.queue(work.id, { review_only: false })
  284 |       return importEnvelope({ items: queue.items.map(item => ({ ...item, status: 'needs_confirmation', suggestion_origin: 'RULE' })), counts: { total_fields: 3, completed_fields: 2, unresolved: 1 } }, queue.pagination)
  285 |     }
  286 |   })
  287 |   await resolve(page, work.id)
  288 |   await page.getByRole('button', { name: 'Xem profile sẽ được lưu' }).click()
  289 |   await expect(page.getByRole('heading', { name: 'Duyệt cách đọc dữ liệu', exact: true })).toBeVisible()
  290 |   await page.getByLabel('Lý do duyệt', { exact: true }).fill('Reviewed complete RULE specification')
  291 |   await page.getByLabel('Tôi đã kiểm tra cách đọc đề xuất, bằng chứng và cách đọc đã duyệt (nếu có).').check()
  292 |   await expect(page.getByRole('button', { name: 'Duyệt profile', exact: true })).toBeEnabled()
  293 |   expect(writes).toHaveLength(0)
  294 | })
  295 | 
  296 | for (const missing of ['planning.context.read', 'budget.read', 'procurement.cost.read']) test(`016 completion keeps receipt but disables R01 when ${missing} is absent`, async ({ page }) => {
  297 |   const work = await prepared()
  298 |   let readinessReads = 0
  299 |   await api(page, work, path => {
  300 |     if (path.endsWith('/readiness')) readinessReads++
  301 |     if (path === `/api/v1/stores/${s}`) return env({ store_id: s, name: 'Controlled Store', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', role: 'STAFF', membership_id: member, authorization_version: 'controlled-member/1', active: true, server_now: at, as_of_date: '2026-10-12', membership: { membership_id: member, role: 'STAFF', authorization_version: 'controlled-member/1', effective_permissions: [...permissions.filter(permission => permission !== missing), 'mapping.propose', 'import.commit', 'inventory.count.correct'] }, permission_catalog_version: 'permissions-v3' })
  302 |   })
  303 |   await resolve(page, work.id); await review(page)
  304 |   await expect(page.getByRole('heading', { name: 'Import đã hoàn tất', exact: true })).toBeVisible()
  305 |   await expect(page.getByRole('button', { name: 'Kiểm tra Readiness', exact: true })).toBeDisabled()
  306 |   expect(readinessReads).toBe(0)
  307 | })
  308 | 
  309 | test('020 multiple history corrections gate every Review entry; closing evidence leaves pending and commit loss freezes confirmed rows',async({page})=>{
  310 |  const work=await prepared(),original=work.source.readPreview
  311 |  work.source.readPreview=async(...args)=>{const value=await original(...args);return {...value,preview:{...value.preview,rows:value.preview.rows.map(row=>({...row,proposed_action:'CORRECT_HISTORY_RECORD',confirmation_required:true,expected_version:'history/1'}))}}}
  312 |  const writes=await api(page,work,(_path,method,body)=>method==='POST'&&body?.phase==='commit'?'ABORT':undefined)
> 313 |  await resolve(page,work.id);await page.getByRole('button',{name:'Tạo Preview',exact:true}).click();const next=page.getByRole('button',{name:'Tiếp tục xác nhận',exact:true});await expect(next).toBeDisabled()
      |                                                                                                                                                                                                  ^ Error: expect(locator).toBeDisabled() failed
  314 |  await page.getByRole('button',{name:'Chi tiết bản sửa',exact:true}).first().click();let d=page.getByRole('dialog',{name:'Kiểm tra và xác nhận bản sửa'});await d.getByRole('button',{name:'Đóng',exact:true}).click();await expect(next).toBeDisabled();expect(writes.filter(w=>w.body.phase==='commit')).toHaveLength(0)
  315 |  const buttons=page.getByRole('button',{name:'Chi tiết bản sửa',exact:true});expect(await buttons.count()).toBe(2)
  316 |  for(let i=0;i<2;i++){await buttons.nth(i).click();d=page.getByRole('dialog',{name:'Kiểm tra và xác nhận bản sửa'});await d.getByLabel('Lý do correction').fill(`Evidence for history ${i+1}`);await d.getByRole('checkbox').check();await d.getByRole('button',{name:'Xác nhận cho lần nhập này',exact:true}).click();if(i===0)await expect(next).toBeDisabled()}
  317 |  await expect(next).toBeEnabled();await next.click();await page.getByLabel('Lý do review (bắt buộc)').fill('Reviewed historical evidence');await page.getByLabel('Tôi đã đọc đủ dữ liệu, nguồn báo cáo, cách đọc và cảnh báo.').check();await page.getByRole('button',{name:'Xác nhận đã kiểm tra',exact:true}).click();await page.getByLabel('Lý do nhập dữ liệu (bắt buộc)').fill('Historical correction');await page.getByLabel('Tôi đã kiểm tra dữ liệu, cảnh báo và phạm vi nhập.').check();await page.getByRole('button',{name:'Xác nhận và nhập dữ liệu',exact:true}).click()
  318 |  await expect(page.getByRole('button',{name:'Kiểm tra lại trạng thái',exact:true})).toBeVisible();const commits=writes.filter(w=>w.body.phase==='commit');expect(commits).toHaveLength(1);expect(commits[0].body.history_corrections).toHaveLength(2);expect(commits[0].body.history_corrections[0].expected_version).toBe('history/1');await page.getByRole('button',{name:'Kiểm tra lại trạng thái',exact:true}).click();expect(writes.filter(w=>w.body.phase==='commit')).toHaveLength(1);await expect(page.getByRole('button',{name:'Chi tiết bản sửa',exact:true})).toHaveCount(0)
  319 | })
  320 | 
```