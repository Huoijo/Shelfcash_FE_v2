# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: import-experience.api.spec.ts >> 012 API Preview blocked cannot enter Review and offers correct recovery
- Location: tests\e2e\import-experience.api.spec.ts:138:54

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Preview bị chặn toàn lô', { exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Preview bị chặn toàn lô', { exact: true }) with timeout 5000ms
  - waiting for getByText('Preview bị chặn toàn lô', { exact: true })

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
    - paragraph: Chưa có dữ liệu nào được ghi vào ShelfCash.
    - button "Tạo bản xem trước" [disabled]
- button "Debug"
```

# Test source

```ts
  56  |   await page.getByRole('button', { name: 'Kiểm tra cách hiểu', exact: true }).click()
  57  | }
  58  | async function review(page: Page) {
  59  |   await page.getByRole('button', { name: 'Tạo Preview', exact: true }).click()
  60  |   await page.getByRole('button', { name: 'Tiếp tục xác nhận' }).click()
  61  |   await page.getByLabel('Lý do review (bắt buộc)').fill('Controlled reviewed snapshot')
  62  |   await page.getByLabel('Tôi đã đọc đủ dữ liệu, nguồn báo cáo, cách đọc và cảnh báo.').check()
  63  |   await page.getByRole('button', { name: 'Xác nhận đã kiểm tra' }).click()
  64  |   await page.getByLabel('Lý do nhập dữ liệu (bắt buộc)').fill('Controlled stock correction')
  65  |   await page.getByLabel('Tôi đã kiểm tra dữ liệu, cảnh báo và phạm vi nhập.').check()
  66  |   await page.getByRole('button', { name: 'Xác nhận và nhập dữ liệu' }).click()
  67  | }
  68  | 
  69  | test('frozen Staff submits a persisted profile, waits, then resumes retained batch after separate Owner approval', async ({ page }) => {
  70  |   const work = await prepared(true), summary = await work.source.summary(work.id), proposal = summary.profile_proposals[0]
  71  |   let row: any = null
  72  |   const writes = await api(page, work, (path, method, body) => {
  73  |     if (path === `/api/v1/stores/${s}/mapping-submissions`) return env({ items: row ? [row] : [] }, { ...paging(row ? 1 : 0), snapshot_id: 'submissions/1', observed_at: at })
  74  |     if (path === `/api/v1/imports/${work.id}/mapping-submissions` && method === 'POST') {
  75  |       row = { submission_id: '00000000-0000-4000-8000-000000000043', store_id: s, profile_id: proposal.profile_id, import_id: work.id, sheet_id: summary.sheets[0].sheet_id, file_id: summary.files[0].file_id, submitted_by_user_id: user, submitted_at: at, reason: body.reason, version: 'submission/1', state: 'submitted', proposal_revision: proposal.proposal_revision, mapping_revision: summary.mapping_revision, import_revision: 'captured-import/1', file_set_version: 'files/1', lifecycle_revision_at_submission: proposal.lifecycle_revision, spec_digest: 'spec/1', expected_active_version: proposal.active_version, review_eligibility: { eligible: true, reason_codes: [] }, current_profile: { lifecycle_revision: proposal.lifecycle_revision, active_version: proposal.active_version, reviewed_version_retired: false }, decision: null, allowed_actions: ['withdraw'] }
  76  |       return { httpStatus: 201, body: env(row) }
  77  |     }
  78  |   })
  79  |   await resolve(page, work.id)
  80  |   await page.getByRole('button', { name: 'Gửi Owner duyệt', exact: true }).click()
  81  |   await page.getByLabel('Profile cần gửi').selectOption(proposal.profile_id)
  82  |   await page.getByLabel('Lý do gửi đề xuất').fill('Staff checked source evidence')
  83  |   await page.getByRole('dialog').getByRole('button', { name: 'Gửi Owner duyệt', exact: true }).click()
  84  |   await expect(page.getByText('Đang chờ Owner', { exact: true })).toBeVisible()
  85  |   await expect(page.getByRole('button', { name: 'Tạo Preview', exact: true })).toHaveCount(0)
  86  |   await expect(page.getByRole('button', { name: 'Chỉnh mapping', exact: true })).toBeDisabled()
  87  |   expect(writes).toHaveLength(1); expect(writes[0].body.action).toBe('submit'); expect(writes[0].body.proposal_revision).toBe(proposal.proposal_revision)
  88  |   await work.source.decideProfile(s, proposal.profile_id, { key: crypto.randomUUID(), lifecycleRevision: proposal.lifecycle_revision, decision: { decision: 'approve_activate', proposal_revision: proposal.proposal_revision, expected_active_version: proposal.active_version, reason: 'Separate Owner actor reviewed full spec' } })
  89  |   row = { ...row, state: 'approved', version: 'submission/2', allowed_actions: [], decision: { decision_id: crypto.randomUUID(), decision: 'approve_activate', actor_user_id: member, reason: 'Separate Owner approved', decided_at: at } }
  90  |   await page.getByRole('button', { name: 'Đọc lại quyết định', exact: true }).click()
  91  |   await expect(page.getByText('Đang dùng cách đọc đã duyệt', { exact: true })).toBeVisible()
  92  |   await expect(page.getByRole('button', { name: 'Tạo Preview', exact: true })).toBeEnabled()
  93  |   await page.reload(); await page.getByRole('button', { name: 'Kiểm tra cách hiểu', exact: true }).click()
  94  |   expect(writes).toHaveLength(1); expect(new URL(page.url()).searchParams.get('import_id')).toBe(work.id)
  95  | })
  96  | 
  97  | test('012 API permission revoked at commit has its own state and retains batch/review without retrying a new write', async ({ page }) => {
  98  |   const work = await prepared(), writes = await api(page, work, (path, method, body) => path.endsWith('/process') && method === 'POST' && body.phase === 'commit' ? errorResponse(403, 'WRITE_PERMISSION_REVOKED') : undefined)
  99  |   await resolve(page, work.id); await review(page)
  100 |   await expect(page.getByText('Quyền hiện tại không cho phép thao tác này', { exact: true })).toBeVisible()
  101 |   await expect(page.getByLabel('Lý do review (bắt buộc)')).toHaveValue('Controlled reviewed snapshot')
  102 |   await expect(page.getByRole('button', { name: 'Kiểm tra lại trạng thái' })).toHaveCount(0)
  103 |   expect(writes.filter(w => w.body.phase === 'commit')).toHaveLength(1)
  104 |   expect(new URL(page.url()).searchParams.get('import_id')).toBe(work.id)
  105 | })
  106 | 
  107 | test('012 API lost commit acknowledgement retains exact intent; completion may still have blocked Readiness', async ({ page }) => {
  108 |   const work = await prepared(); let lost = false
  109 |   const writes = await api(page, work, async (path, method, body, headers, url) => {
  110 |     if (path.endsWith('/process') && body?.phase === 'commit' && !lost) {
  111 |       lost = true
  112 |       await work.source.commit(work.id, { key: headers['idempotency-key'], importRevision: JSON.parse(headers['if-match']), previewId: body.preview_id, previewDigest: body.preview_digest, reason: body.reason, resolutions: body.resolutions, supplierChanges: body.supplier_changes })
  113 |       return 'ABORT'
  114 |     }
  115 |     if (path.endsWith('/readiness')) {
  116 |       const value = planningReadinessFixture(url.searchParams.get('forecast_start_date')!)
  117 |       value.actions = value.actions.map(action => ({ ...action, availability: 'blocked' as const, can_execute: false, data_status: 'incomplete' as const, blockers: [{ code: 'SALES_COVERAGE_INCOMPLETE', source: 'sales' as const, scope: 'STORE' as const, entity_id: null, affected_dates: [], details: {} }] }))
  118 |       return env(value)
  119 |     }
  120 |   })
  121 |   await resolve(page, work.id); await review(page)
  122 |   await expect(page.getByText(/Đang kiểm tra trạng thái lần nhập/)).toBeVisible()
  123 |   await page.getByRole('button', { name: 'Kiểm tra lại trạng thái' }).click()
  124 |   await expect(page.getByRole('heading', { name: 'Import đã hoàn tất', exact: true, level: 2 })).toBeVisible()
  125 |   const commits = writes.filter(w => w.body.phase === 'commit')
  126 |   expect(commits).toHaveLength(1)
  127 |   await page.getByRole('button', { name: 'Kiểm tra Readiness', exact: true }).click()
  128 |   if(await page.getByRole('button', {name:'Kiểm tra Readiness',exact:true}).isVisible() && !(await page.getByText('Đủ dữ liệu', {exact:true}).isVisible())) await page.getByRole('button', {name:'Kiểm tra Readiness',exact:true}).click()
  129 |   await expect(page.getByText('Cần bổ sung', { exact: true })).toBeVisible()
  130 |   await expect(page.getByText(/Sales coverage chưa đủ/)).toBeVisible()
  131 |   await expect(page.getByRole('heading', { name: 'Import đã hoàn tất', exact: true, level: 2 })).toBeVisible()
  132 |   await page.screenshot({ path: 'test-results/012-api-complete-not-ready.png', fullPage: true })
  133 |   await page.reload()
  134 |   await expect(page.getByRole('heading', { name: 'Import đã hoàn tất', exact: true, level: 2 })).toBeVisible()
  135 |   expect(writes.filter(w => w.body.phase === 'commit')).toHaveLength(1)
  136 | })
  137 | 
  138 | for (const variant of ['stale', 'blocked'] as const) test(`012 API Preview ${variant} cannot enter Review and offers correct recovery`, async ({ page }) => {
  139 |   const work = await prepared(); let first = true
  140 |   const writes = await api(page, work, async (path, method, body, headers, url) => {
  141 |     if (path === `/api/v1/imports/${work.id}` && url.searchParams.has('include') && first) {
  142 |       const bundle = await work.source.readPreview(work.id, {})
  143 |       if (variant === 'stale') { bundle.preview.stale = true; first = false }
  144 |       else { bundle.preview.summary.validation_status = 'blocked'; bundle.preview.summary.blockers = [{ code: 'INVALID_ROW', message: 'Cần xử lý dữ liệu nguồn.', severity: 'ERROR' }] }
  145 |       return importEnvelope({ ...await work.batches.read(work.id), ...bundle })
  146 |     }
  147 |   })
  148 |   await resolve(page, work.id)
  149 |   await page.getByRole('button', { name: 'Tạo Preview', exact: true }).click()
  150 |   await expect(page.getByRole('button', { name: 'Tiếp tục xác nhận' })).toHaveCount(0)
  151 |   if (variant === 'stale') {
  152 |     await expect(page.getByText('Preview không còn mới nhất', { exact: true })).toBeVisible()
  153 |     await page.getByRole('button', { name: 'Tạo lại Preview', exact: true }).click()
  154 |     await expect(page.getByRole('button', { name: 'Tiếp tục xác nhận' })).toBeEnabled()
  155 |   } else {
> 156 |     await expect(page.getByText('Preview bị chặn toàn lô', { exact: true })).toBeVisible()
      |                                                                              ^ Error: expect(locator).toBeVisible() failed
  157 |     await page.getByRole('button', { name: 'Quay lại xử lý', exact: true }).click()
  158 |     await expect(page.getByRole('heading', { name: 'Kiểm tra cách hiểu', exact: true })).toBeVisible()
  159 |     await expect(page.getByRole('list', { name: 'Tiến trình nhập dữ liệu 6 bước' }).locator('[aria-current=step]')).toContainText('Kiểm tra')
  160 |   }
  161 |   expect(writes.filter(w => ['confirm_review', 'commit'].includes(w.body?.phase))).toHaveLength(0)
  162 | })
  163 | 
  164 | test('frozen v1 Sales and Supplier decisions gate Review and require separate persisted Review before Commit',async({page})=>{
  165 |   const work=await prepared()
  166 |   const read=work.source.readPreview
  167 |   work.source.readPreview=async(...args)=>{const value=await read(...args);value.preview.rows=value.preview.rows.map((row,index)=>({...row,before:null,after:null,canonical_domain:index===0?'sales':'supplier_terms',proposed_action:index===0?'MERGE_DISJOINT_SALES':'AMEND_TERM_PERIOD',confirmation_required:true}));return value}
  168 |   const writes=await api(page,work)
  169 |   await resolve(page,work.id);await page.getByRole('button',{name:'Tạo Preview',exact:true}).click()
  170 |   const next=page.getByRole('button',{name:'Tiếp tục xác nhận',exact:true})
  171 |   await expect(next).toBeDisabled()
  172 |   const domain=page.locator('.input-domain-review')
  173 |   await domain.locator('.input-domain-grid article').first().getByRole('button').click()
  174 |   let drawer=page.getByRole('dialog',{name:'Hai contribution riêng',exact:true})
  175 |   await drawer.getByLabel('Report business key từ chứng từ nguồn').fill('REPORT-SHIFT-B')
  176 |   await drawer.getByLabel('Tham chiếu bằng chứng').fill('Signed independent shift report')
  177 |   await drawer.getByLabel('Lý do xác nhận').fill('Two separate non-overlapping shifts')
  178 |   await drawer.getByLabel('Tôi xác nhận hai nguồn là các contribution riêng.').check()
  179 |   await drawer.getByRole('button',{name:'Xác nhận thay đổi',exact:true}).click()
  180 |   await expect(next).toBeDisabled()
  181 |   await domain.locator('.input-domain-grid article').last().getByRole('button').click()
  182 |   drawer=page.getByRole('dialog',{name:'Supplier term change',exact:true})
  183 |   await drawer.getByLabel('Lý do xác nhận').fill('Reviewed term period without implicit history closure')
  184 |   await drawer.getByLabel('Tôi xác nhận điều khoản/phí và ngày hiệu lực trong Preview.').check()
  185 |   await drawer.screenshot({path:'test-results/015-supplier-domain.png'})
  186 |   await drawer.getByRole('button',{name:'Xác nhận thay đổi',exact:true}).click()
  187 |   await expect(next).toBeEnabled();await next.click()
  188 |   await expect(page.getByLabel('Lý do nhập dữ liệu (bắt buộc)')).toBeDisabled()
  189 |   await page.getByLabel('Lý do review (bắt buộc)').fill('Reviewed Sales and Supplier decisions')
  190 |   await page.getByLabel('Tôi đã đọc đủ dữ liệu, nguồn báo cáo, cách đọc và cảnh báo.').check()
  191 |   await page.getByRole('button',{name:'Xác nhận đã kiểm tra',exact:true}).click()
  192 |   await expect(page.getByLabel('Lý do nhập dữ liệu (bắt buộc)')).toBeEnabled()
  193 |   await expect(page.getByLabel('Lý do nhập dữ liệu (bắt buộc)')).toHaveValue('')
  194 |   await expect(page.getByRole('button',{name:'Xác nhận và nhập dữ liệu',exact:true})).toBeDisabled()
  195 |   expect(writes.filter(w=>w.body.phase==='confirm_review')).toHaveLength(1)
  196 |   expect(writes.filter(w=>w.body.phase==='commit')).toHaveLength(0)
  197 | })
  198 | 
  199 | test('frozen v1 Analyze source context uses actual evidence and validates custom identifiers without guessing a provider',async({page})=>{
  200 |   const work=await prepared(),summary=work.source.summary,queue=work.source.queue
  201 |   work.source.summary=async(...args)=>({...await summary(...args),can_preview:false,progress:{total_fields:1,completed_fields:0,unresolved:1},blockers:[{code:'SOURCE_CONTEXT_REQUIRED',severity:'ERROR',message:'Source proof required'}]})
  202 |   work.source.queue=async(...args)=>{const value=await queue(args[0],{...args[1],review_only:false},args[2]);return {...value,counts:{total_fields:1,completed_fields:0,unresolved:1},items:value.items.map(row=>({...row,issue_type:'source_context',code:'SOURCE_CONTEXT_REQUIRED',status:'unmatched',target_field:null,suggested_target_field:null,resolution:null,source_header:'Report header evidence',samples:['Export source: POS nội bộ']}))}}
  203 |   const writes=await api(page,work,(_path,method,body)=>method==='POST'&&body?.resolution?.kind==='source_context'?errorResponse(422,'SOURCE_EVIDENCE_REVIEW_REQUIRED'):undefined)
  204 |   await page.goto(`/imports?import_id=${work.id}`)
  205 |   await expect(page.getByRole('heading',{name:'Cần xác nhận nguồn dữ liệu',exact:true})).toBeVisible()
  206 |   const source=page.locator('.input-source-context')
  207 |   await expect(source.getByText('Export source: POS nội bộ',{exact:true})).toBeVisible()
  208 |   const save=source.getByRole('button',{name:'Xác nhận nguồn',exact:true})
  209 |   await expect(save).toBeDisabled()
  210 |   await source.getByLabel('Hệ thống nguồn',{exact:true}).fill('POS nội bộ')
  211 |   await source.getByLabel('Loại báo cáo',{exact:true}).fill('daily_sales')
  212 |   await source.getByLabel('Bằng chứng / tham chiếu nguồn',{exact:true}).fill('Report header and export settings')
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
```