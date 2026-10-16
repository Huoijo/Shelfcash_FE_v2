import { test, expect, type Page } from '@playwright/test'
import { backend, env, paging, s, member, user, at, permissions, errorResponse } from './helpers/api'
import { ImportBatchWorkflow } from '../../src/features/import-data/importData.workflow'
import { createMockImportDataSource } from '../../src/features/import-data/importData.fixtures'
import { createMockImportFlowDataSource } from '../../src/features/import-data/importFlow.fixtures'
import { planningReadinessFixture } from '../../src/features/decision-planning/planning.fixtures'

const wire = (value: any): any => Array.isArray(value) ? value.map(wire) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([key]) => !['unsupportedFields', 'poll_after_ms'].includes(key)).map(([key, item]) => [key, wire(item)])) : value
const importEnvelope = (data: unknown, pagination: unknown = null, poll?: number) => env(wire(data), { warnings: [], pagination, ...(poll !== undefined ? { poll_after_ms: poll } : {}) })
async function prepared(ownerRequired = false) {
  const batches = createMockImportDataSource({ continuation: true })
  const upload = new ImportBatchWorkflow(batches, s)
  upload.setDataDate('2026-10-11')
  upload.setFiles([new File(['lot,on_hand\nLOT,10'], 'observed.csv', { type: 'text/csv' })])
  await upload.upload(); await upload.prepareAnalysis(); upload.acknowledgeRejected(true); await upload.analyze()
  const source = createMockImportFlowDataSource(batches, { ownerRequired, pageSize: 2 })
  const id = upload.getSnapshot().batch!.import_id
  if (ownerRequired) {
    const summary = await source.summary(id), queue = await source.queue(id, {})
    await source.confirm(id, queue.items[0].mapping_id, { key: crypto.randomUUID(), mappingRevision: summary.mapping_revision, targetField: 'on_hand' })
  }
  return { batches, upload, source, id }
}
async function api(page: Page, work: Awaited<ReturnType<typeof prepared>>, hook?: (path: string, method: string, body: any, headers: Record<string, string>, url: URL) => any) {
  const writes: any[] = []
  await backend(page, async (path, method, body, headers, url) => {
    if (!['GET', 'OPTIONS'].includes(method)) writes.push({ path, body, key: headers['idempotency-key'], version: headers['if-match'] })
    const intercepted = await hook?.(path, method, body, headers, url)
    if (intercepted !== undefined) return intercepted
    if (path === '/api/v1/stores') return env({ items: [{ store_id: s, name: 'Controlled Store', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', role: 'STAFF', membership_id: member, authorization_version: 'controlled-member/1' }] }, paging(1))
    if (path === `/api/v1/stores/${s}`) return env({ store_id: s, name: 'Controlled Store', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', role: 'STAFF', membership_id: member, authorization_version: 'controlled-member/1', active: true, server_now: at, as_of_date: '2026-10-12', membership: { membership_id: member, role: 'STAFF', authorization_version: 'controlled-member/1', effective_permissions: [...permissions, 'mapping.read', 'mapping.propose', 'import.preview', 'import.commit', 'inventory.count.correct'] }, permission_catalog_version: 'permissions-v3' })
    if (path === `/api/v1/imports/${work.id}`) {
      const batch = await work.batches.read(work.id)
      if (url.searchParams.has('include')) return importEnvelope({ ...batch, ...await work.source.readPreview(work.id, { previewId: url.searchParams.get('preview_id') ?? undefined, rowsCursor: url.searchParams.get('rows_cursor') ?? undefined }) })
      return importEnvelope(batch)
    }
    if (path.endsWith('/mapping-summary')) return importEnvelope(await work.source.summary(work.id))
    if (path.endsWith('/mappings')) {
      const queue = await work.source.queue(work.id, { sheet_id: url.searchParams.get('sheet_id') ?? undefined, review_only: url.searchParams.get('review_only') !== 'false' })
      return importEnvelope({ items: queue.items, counts: queue.counts }, queue.pagination)
    }
    if (path.endsWith('/field-options')) return importEnvelope(await work.source.options(work.id, path.split('/').at(-2)!, url.searchParams.get('mapping_id') ?? undefined))
    if (path.endsWith('/process')) {
      const key = headers['idempotency-key'], importRevision = JSON.parse(headers['if-match'])
      if (body.phase === 'preview') return importEnvelope(await work.source.preview(work.id, { key, importRevision, mappingRevision: body.mapping_revision }), null, 2000)
      if (body.phase === 'confirm_review') return importEnvelope(await work.source.confirmReview(work.id, { key, importRevision, mappingRevision: body.mapping_revision, previewId: body.preview_id, previewDigest: body.preview_digest, reason: body.reason }))
      if (body.phase === 'commit') return importEnvelope(await work.source.commit(work.id, { key, importRevision, previewId: body.preview_id, previewDigest: body.preview_digest, reason: body.reason, resolutions: body.resolutions, supplierChanges: body.supplier_changes }), null, 2000)
    }
    if (path.startsWith('/api/v1/jobs/')) { const job = await work.source.job(path.split('/').at(-1)!); return importEnvelope(job, null, job.poll_after_ms) }
    if (path.endsWith('/completion')) return importEnvelope(await work.source.completion(work.id))
  })
  return writes
}
async function resolve(page: Page, id: string) {
  await page.goto(`/imports?import_id=${id}`)
  await page.getByRole('button', { name: 'Kiểm tra cách hiểu', exact: true }).click()
}
async function review(page: Page) {
  await page.getByRole('button', { name: 'Tạo Preview', exact: true }).click()
  await page.getByRole('button', { name: 'Tiếp tục xác nhận' }).click()
  await page.getByLabel('Lý do review (bắt buộc)').fill('Controlled reviewed snapshot')
  await page.getByLabel('Tôi đã đọc đủ dữ liệu, nguồn báo cáo, cách đọc và cảnh báo.').check()
  await page.getByRole('button', { name: 'Xác nhận đã kiểm tra' }).click()
  await page.getByLabel('Lý do nhập dữ liệu (bắt buộc)').fill('Controlled stock correction')
  await page.getByLabel('Tôi đã kiểm tra dữ liệu, cảnh báo và phạm vi nhập.').check()
  await page.getByRole('button', { name: 'Xác nhận và nhập dữ liệu' }).click()
}

test('frozen Staff submits a persisted profile, waits, then resumes retained batch after separate Owner approval', async ({ page }) => {
  const work = await prepared(true), summary = await work.source.summary(work.id), proposal = summary.profile_proposals[0]
  let row: any = null
  const writes = await api(page, work, (path, method, body) => {
    if (path === `/api/v1/stores/${s}/mapping-submissions`) return env({ items: row ? [row] : [] }, { ...paging(row ? 1 : 0), snapshot_id: 'submissions/1', observed_at: at })
    if (path === `/api/v1/imports/${work.id}/mapping-submissions` && method === 'POST') {
      row = { submission_id: '00000000-0000-4000-8000-000000000043', store_id: s, profile_id: proposal.profile_id, import_id: work.id, sheet_id: summary.sheets[0].sheet_id, file_id: summary.files[0].file_id, submitted_by_user_id: user, submitted_at: at, reason: body.reason, version: 'submission/1', state: 'submitted', proposal_revision: proposal.proposal_revision, mapping_revision: summary.mapping_revision, import_revision: 'captured-import/1', file_set_version: 'files/1', lifecycle_revision_at_submission: proposal.lifecycle_revision, spec_digest: 'spec/1', expected_active_version: proposal.active_version, review_eligibility: { eligible: true, reason_codes: [] }, current_profile: { lifecycle_revision: proposal.lifecycle_revision, active_version: proposal.active_version, reviewed_version_retired: false }, decision: null, allowed_actions: ['withdraw'] }
      return { httpStatus: 201, body: env(row) }
    }
  })
  await resolve(page, work.id)
  await page.getByRole('button', { name: 'Gửi Owner duyệt', exact: true }).click()
  await page.getByLabel('Profile cần gửi').selectOption(proposal.profile_id)
  await page.getByLabel('Lý do gửi đề xuất').fill('Staff checked source evidence')
  await page.getByRole('dialog').getByRole('button', { name: 'Gửi Owner duyệt', exact: true }).click()
  await expect(page.getByText('Đang chờ Owner', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tạo Preview', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Chỉnh mapping', exact: true })).toBeDisabled()
  expect(writes).toHaveLength(1); expect(writes[0].body.action).toBe('submit'); expect(writes[0].body.proposal_revision).toBe(proposal.proposal_revision)
  await work.source.decideProfile(s, proposal.profile_id, { key: crypto.randomUUID(), lifecycleRevision: proposal.lifecycle_revision, decision: { decision: 'approve_activate', proposal_revision: proposal.proposal_revision, expected_active_version: proposal.active_version, reason: 'Separate Owner actor reviewed full spec' } })
  row = { ...row, state: 'approved', version: 'submission/2', allowed_actions: [], decision: { decision_id: crypto.randomUUID(), decision: 'approve_activate', actor_user_id: member, reason: 'Separate Owner approved', decided_at: at } }
  await page.getByRole('button', { name: 'Đọc lại quyết định', exact: true }).click()
  await expect(page.getByText('Đang dùng cách đọc đã duyệt', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tạo Preview', exact: true })).toBeEnabled()
  await page.reload(); await page.getByRole('button', { name: 'Kiểm tra cách hiểu', exact: true }).click()
  expect(writes).toHaveLength(1); expect(new URL(page.url()).searchParams.get('import_id')).toBe(work.id)
})

test('012 API permission revoked at commit has its own state and retains batch/review without retrying a new write', async ({ page }) => {
  const work = await prepared(), writes = await api(page, work, (path, method, body) => path.endsWith('/process') && method === 'POST' && body.phase === 'commit' ? errorResponse(403, 'WRITE_PERMISSION_REVOKED') : undefined)
  await resolve(page, work.id); await review(page)
  await expect(page.getByText('Quyền hiện tại không cho phép thao tác này', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Lý do review (bắt buộc)')).toHaveValue('Controlled reviewed snapshot')
  await expect(page.getByRole('button', { name: 'Kiểm tra lại trạng thái' })).toHaveCount(0)
  expect(writes.filter(w => w.body.phase === 'commit')).toHaveLength(1)
  expect(new URL(page.url()).searchParams.get('import_id')).toBe(work.id)
})

test('012 API lost commit acknowledgement retains exact intent; completion may still have blocked Readiness', async ({ page }) => {
  const work = await prepared(); let lost = false
  const writes = await api(page, work, async (path, method, body, headers, url) => {
    if (path.endsWith('/process') && body?.phase === 'commit' && !lost) {
      lost = true
      await work.source.commit(work.id, { key: headers['idempotency-key'], importRevision: JSON.parse(headers['if-match']), previewId: body.preview_id, previewDigest: body.preview_digest, reason: body.reason, resolutions: body.resolutions, supplierChanges: body.supplier_changes })
      return 'ABORT'
    }
    if (path.endsWith('/readiness')) {
      const value = planningReadinessFixture(url.searchParams.get('forecast_start_date')!)
      value.actions = value.actions.map(action => ({ ...action, availability: 'blocked' as const, can_execute: false, data_status: 'incomplete' as const, blockers: [{ code: 'SALES_COVERAGE_INCOMPLETE', source: 'sales' as const, scope: 'STORE' as const, entity_id: null, affected_dates: [], details: {} }] }))
      return env(value)
    }
  })
  await resolve(page, work.id); await review(page)
  await expect(page.getByText(/Đang kiểm tra trạng thái lần nhập/)).toBeVisible()
  await page.getByRole('button', { name: 'Kiểm tra lại trạng thái' }).click()
  await expect(page.getByRole('heading', { name: 'Import đã hoàn tất', exact: true, level: 2 })).toBeVisible()
  const commits = writes.filter(w => w.body.phase === 'commit')
  expect(commits).toHaveLength(1)
  await page.getByRole('button', { name: 'Kiểm tra Readiness', exact: true }).click()
  if(await page.getByRole('button', {name:'Kiểm tra Readiness',exact:true}).isVisible() && !(await page.getByText('Đủ dữ liệu', {exact:true}).isVisible())) await page.getByRole('button', {name:'Kiểm tra Readiness',exact:true}).click()
  await expect(page.getByText('Cần bổ sung', { exact: true })).toBeVisible()
  await expect(page.getByText(/Sales coverage chưa đủ/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Import đã hoàn tất', exact: true, level: 2 })).toBeVisible()
  await page.screenshot({ path: 'test-results/012-api-complete-not-ready.png', fullPage: true })
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Import đã hoàn tất', exact: true, level: 2 })).toBeVisible()
  expect(writes.filter(w => w.body.phase === 'commit')).toHaveLength(1)
})

for (const variant of ['stale', 'blocked'] as const) test(`012 API Preview ${variant} cannot enter Review and offers correct recovery`, async ({ page }) => {
  const work = await prepared(); let first = true
  const writes = await api(page, work, async (path, method, body, headers, url) => {
    if (path === `/api/v1/imports/${work.id}` && url.searchParams.has('include') && first) {
      const bundle = await work.source.readPreview(work.id, {})
      if (variant === 'stale') { bundle.preview.stale = true; first = false }
      else { bundle.preview.summary.validation_status = 'blocked'; bundle.preview.summary.blockers = [{ code: 'INVALID_ROW', message: 'Cần xử lý dữ liệu nguồn.', severity: 'ERROR' }] }
      return importEnvelope({ ...await work.batches.read(work.id), ...bundle })
    }
  })
  await resolve(page, work.id)
  await page.getByRole('button', { name: 'Tạo Preview', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Tiếp tục xác nhận' })).toHaveCount(0)
  if (variant === 'stale') {
    await expect(page.getByText('Preview không còn mới nhất', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Tạo lại Preview', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Tiếp tục xác nhận' })).toBeEnabled()
  } else {
    await expect(page.getByText('Preview bị chặn toàn lô', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Quay lại xử lý', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Kiểm tra cách hiểu', exact: true })).toBeVisible()
    await expect(page.getByRole('list', { name: 'Tiến trình nhập dữ liệu 6 bước' }).locator('[aria-current=step]')).toContainText('Kiểm tra')
  }
  expect(writes.filter(w => ['confirm_review', 'commit'].includes(w.body?.phase))).toHaveLength(0)
})

test('frozen v1 Sales and Supplier decisions gate Review and require separate persisted Review before Commit',async({page})=>{
  const work=await prepared()
  const read=work.source.readPreview
  work.source.readPreview=async(...args)=>{const value=await read(...args);value.preview.rows=value.preview.rows.map((row,index)=>({...row,before:null,after:null,canonical_domain:index===0?'sales':'supplier_terms',proposed_action:index===0?'MERGE_DISJOINT_SALES':'AMEND_TERM_PERIOD',confirmation_required:true}));return value}
  const writes=await api(page,work)
  await resolve(page,work.id);await page.getByRole('button',{name:'Tạo Preview',exact:true}).click()
  const next=page.getByRole('button',{name:'Tiếp tục xác nhận',exact:true})
  await expect(next).toBeDisabled()
  const domain=page.locator('.input-domain-review')
  await domain.locator('.input-domain-grid article').first().getByRole('button').click()
  let drawer=page.getByRole('dialog',{name:'Hai contribution riêng',exact:true})
  await drawer.getByLabel('Report business key từ chứng từ nguồn').fill('REPORT-SHIFT-B')
  await drawer.getByLabel('Tham chiếu bằng chứng').fill('Signed independent shift report')
  await drawer.getByLabel('Lý do xác nhận').fill('Two separate non-overlapping shifts')
  await drawer.getByLabel('Tôi xác nhận hai nguồn là các contribution riêng.').check()
  await drawer.getByRole('button',{name:'Xác nhận thay đổi',exact:true}).click()
  await expect(next).toBeDisabled()
  await domain.locator('.input-domain-grid article').last().getByRole('button').click()
  drawer=page.getByRole('dialog',{name:'Supplier term change',exact:true})
  await drawer.getByLabel('Lý do xác nhận').fill('Reviewed term period without implicit history closure')
  await drawer.getByLabel('Tôi xác nhận điều khoản/phí và ngày hiệu lực trong Preview.').check()
  await drawer.screenshot({path:'test-results/015-supplier-domain.png'})
  await drawer.getByRole('button',{name:'Xác nhận thay đổi',exact:true}).click()
  await expect(next).toBeEnabled();await next.click()
  await expect(page.getByLabel('Lý do nhập dữ liệu (bắt buộc)')).toBeDisabled()
  await page.getByLabel('Lý do review (bắt buộc)').fill('Reviewed Sales and Supplier decisions')
  await page.getByLabel('Tôi đã đọc đủ dữ liệu, nguồn báo cáo, cách đọc và cảnh báo.').check()
  await page.getByRole('button',{name:'Xác nhận đã kiểm tra',exact:true}).click()
  await expect(page.getByLabel('Lý do nhập dữ liệu (bắt buộc)')).toBeEnabled()
  await expect(page.getByLabel('Lý do nhập dữ liệu (bắt buộc)')).toHaveValue('')
  await expect(page.getByRole('button',{name:'Xác nhận và nhập dữ liệu',exact:true})).toBeDisabled()
  expect(writes.filter(w=>w.body.phase==='confirm_review')).toHaveLength(1)
  expect(writes.filter(w=>w.body.phase==='commit')).toHaveLength(0)
})

test('frozen v1 Analyze source context uses actual evidence and validates custom identifiers without guessing a provider',async({page})=>{
  const work=await prepared(),summary=work.source.summary,queue=work.source.queue
  work.source.summary=async(...args)=>({...await summary(...args),can_preview:false,progress:{total_fields:1,completed_fields:0,unresolved:1},blockers:[{code:'SOURCE_CONTEXT_REQUIRED',severity:'ERROR',message:'Source proof required'}]})
  work.source.queue=async(...args)=>{const value=await queue(args[0],{...args[1],review_only:false},args[2]);return {...value,counts:{total_fields:1,completed_fields:0,unresolved:1},items:value.items.map(row=>({...row,issue_type:'source_context',code:'SOURCE_CONTEXT_REQUIRED',status:'unmatched',target_field:null,suggested_target_field:null,resolution:null,source_header:'Report header evidence',samples:['Export source: POS nội bộ']}))}}
  const writes=await api(page,work,(_path,method,body)=>method==='POST'&&body?.resolution?.kind==='source_context'?errorResponse(422,'SOURCE_EVIDENCE_REVIEW_REQUIRED'):undefined)
  await page.goto(`/imports?import_id=${work.id}`)
  await expect(page.getByRole('heading',{name:'Cần xác nhận nguồn dữ liệu',exact:true})).toBeVisible()
  const source=page.locator('.input-source-context')
  await expect(source.getByText('Export source: POS nội bộ',{exact:true})).toBeVisible()
  const save=source.getByRole('button',{name:'Xác nhận nguồn',exact:true})
  await expect(save).toBeDisabled()
  await source.getByLabel('Hệ thống nguồn',{exact:true}).fill('POS nội bộ')
  await source.getByLabel('Loại báo cáo',{exact:true}).fill('daily_sales')
  await source.getByLabel('Bằng chứng / tham chiếu nguồn',{exact:true}).fill('Report header and export settings')
  await expect(save).toBeDisabled()
  await source.getByLabel('Hệ thống nguồn',{exact:true}).fill('custom.pos')
  await expect(save).toBeDisabled()
  await source.getByText('Semantics và định dạng nguồn (chỉ khai báo khi đã biết)',{exact:true}).click()
  await source.getByLabel('Thiếu thông tin hết hàng',{exact:true}).selectOption('not_provided')
  await source.getByLabel('Cơ sở tính giá',{exact:true}).selectOption('PER_SOURCE_UNIT')
  await source.getByRole('button',{name:'Thêm alias hết hàng',exact:true}).click()
  await source.getByLabel('Giá trị nguồn',{exact:true}).fill('HẾT HÀNG')
  await source.getByLabel('ShelfCash hiểu là',{exact:true}).selectOption('true')
  await source.getByRole('checkbox',{name:'Tôi xác nhận đây là đề xuất cách hiểu nguồn dùng lại, cần quyết định Profile.'}).check()
  await expect(save).toBeEnabled()
  await source.screenshot({path:'test-results/015-source-context.png'})
  expect(writes).toHaveLength(0)
  await save.click();await expect(source.getByRole('alert')).toBeVisible()
  const resolution=writes[0].body.resolution
  expect(resolution).toMatchObject({kind:'source_context',source_system_key:'custom.pos',missing_stockout:'not_provided',pack_cost_basis:'PER_SOURCE_UNIT',stockout_aliases:[{token:'HẾT HÀNG',value:true}]})
  expect(resolution).not.toHaveProperty('scope')
})

test('016 Supplier resolver uses SU01 snapshot paging and saves only the explicitly selected identity', async ({ page }) => {
  const work = await prepared(), searches: URL[] = [], saves: any[] = []
  let saved = false
  await api(page, work, async (path, method, body, headers, url) => {
    if (path === `/api/v1/stores/${s}`) return env({ store_id: s, name: 'Controlled Store', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', role: 'STAFF', membership_id: member, authorization_version: 'controlled-member/1', active: true, server_now: at, as_of_date: '2026-10-12', membership: { membership_id: member, role: 'STAFF', authorization_version: 'controlled-member/1', effective_permissions: [...permissions, 'supplier.read', 'mapping.propose'] }, permission_catalog_version: 'permissions-v3' })
    if (path.endsWith('/mapping-summary')) {
      const summary = await work.source.summary(work.id)
      return importEnvelope({ ...summary, progress: { total_fields: 3, completed_fields: saved ? 3 : 2, unresolved: saved ? 0 : 1 } })
    }
    if (path.endsWith('/mappings') && method === 'GET') {
      const queue = await work.source.queue(work.id, { review_only: false })
      return importEnvelope({ items: queue.items.map(item => ({ ...item, issue_type: 'identity', status: saved ? 'resolved' : 'needs_confirmation', target_field: 'supplier_terms.supplier_id', suggested_target_field: 'supplier_terms.supplier_id' })), counts: { total_fields: 3, completed_fields: saved ? 3 : 2, unresolved: saved ? 0 : 1 } }, queue.pagination)
    }
    if (path === `/api/v1/stores/${s}/suppliers`) {
      searches.push(url)
      const second = url.searchParams.has('cursor')
      return env({ items: [{ supplier_id: second ? '00000000-0000-4000-8000-000000000092' : '00000000-0000-4000-8000-000000000091', name: second ? 'Supplier selected' : 'Supplier inactive', active: second, version: 'supplier/1' }] }, { snapshot_id: 'supplier-snapshot/1', observed_at: at, pagination: { limit: 20, total_count: 2, next_cursor: second ? null : 'signed-supplier-cursor' } })
    }
    if (method === 'PATCH' && path.includes('/mappings/')) {
      saves.push(body)
      const result = await work.source.resolve(work.id, path.split('/').at(-1)!, { key: headers['idempotency-key'], mappingRevision: JSON.parse(headers['if-match']), resolution: body.resolution })
      saved = true
      return importEnvelope(result)
    }
  })
  await resolve(page, work.id)
  await page.getByRole('button', { name: 'Chọn entity', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: 'Identity', exact: true })
  await drawer.getByLabel('Tìm nhà cung cấp').fill('Supplier')
  await expect(drawer.getByRole('button', { name: /Supplier inactive/ })).toBeVisible()
  expect(saves).toHaveLength(0)
  await drawer.getByRole('button', { name: 'Xem thêm', exact: true }).click()
  await drawer.getByRole('button', { name: /Supplier selected/ }).click()
  await drawer.getByRole('button', { name: 'Lưu bindings', exact: true }).click()
  await expect(drawer).toHaveCount(0)
  expect(searches).toHaveLength(2)
  expect(searches[1].searchParams.get('snapshot_id')).toBe('supplier-snapshot/1')
  expect(searches[0].searchParams.has('active')).toBe(false)
  expect(saves).toEqual([{ resolution: { kind: 'identity_binding', canonical_id: '00000000-0000-4000-8000-000000000092' } }])
})

test('016 Owner reaches complete full-spec review with pending RULE candidates without an M04 confirmation first', async ({ page }) => {
  const work = await prepared(true)
  const writes = await api(page, work, async path => {
    if (path === '/api/v1/stores') return env({ items: [{ store_id: s, name: 'Controlled Store', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', role: 'OWNER', membership_id: member, authorization_version: 'controlled-member/1' }] }, paging(1))
    if (path === `/api/v1/stores/${s}`) return env({ store_id: s, name: 'Controlled Store', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', role: 'OWNER', membership_id: member, authorization_version: 'controlled-member/1', active: true, server_now: at, as_of_date: '2026-10-12', membership: { membership_id: member, role: 'OWNER', authorization_version: 'controlled-member/1', effective_permissions: [...permissions, 'mapping.propose'] }, permission_catalog_version: 'permissions-v3' })
    if (path.endsWith('/mapping-summary')) {
      const summary = await work.source.summary(work.id)
      return importEnvelope({ ...summary, progress: { total_fields: 3, completed_fields: 2, unresolved: 1 } })
    }
    if (path.endsWith('/mappings')) {
      const queue = await work.source.queue(work.id, { review_only: false })
      return importEnvelope({ items: queue.items.map(item => ({ ...item, status: 'needs_confirmation', suggestion_origin: 'RULE' })), counts: { total_fields: 3, completed_fields: 2, unresolved: 1 } }, queue.pagination)
    }
  })
  await resolve(page, work.id)
  await page.getByRole('button', { name: 'Xem profile sẽ được lưu' }).click()
  await expect(page.getByRole('heading', { name: 'Duyệt cách đọc dữ liệu', exact: true })).toBeVisible()
  await page.getByLabel('Lý do duyệt', { exact: true }).fill('Reviewed complete RULE specification')
  await page.getByLabel('Tôi đã kiểm tra cách đọc đề xuất, bằng chứng và cách đọc đã duyệt (nếu có).').check()
  await expect(page.getByRole('button', { name: 'Duyệt profile', exact: true })).toBeEnabled()
  expect(writes).toHaveLength(0)
})

for (const missing of ['planning.context.read', 'budget.read', 'procurement.cost.read']) test(`016 completion keeps receipt but disables R01 when ${missing} is absent`, async ({ page }) => {
  const work = await prepared()
  let readinessReads = 0
  await api(page, work, path => {
    if (path.endsWith('/readiness')) readinessReads++
    if (path === `/api/v1/stores/${s}`) return env({ store_id: s, name: 'Controlled Store', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', role: 'STAFF', membership_id: member, authorization_version: 'controlled-member/1', active: true, server_now: at, as_of_date: '2026-10-12', membership: { membership_id: member, role: 'STAFF', authorization_version: 'controlled-member/1', effective_permissions: [...permissions.filter(permission => permission !== missing), 'mapping.propose', 'import.commit', 'inventory.count.correct'] }, permission_catalog_version: 'permissions-v3' })
  })
  await resolve(page, work.id); await review(page)
  await expect(page.getByRole('heading', { name: 'Import đã hoàn tất', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Kiểm tra Readiness', exact: true })).toBeDisabled()
  expect(readinessReads).toBe(0)
})

test('020 multiple history corrections gate every Review entry; closing evidence leaves pending and commit loss freezes confirmed rows',async({page})=>{
 const work=await prepared(),original=work.source.readPreview
 work.source.readPreview=async(...args)=>{const value=await original(...args);return {...value,preview:{...value.preview,rows:value.preview.rows.map(row=>({...row,proposed_action:'CORRECT_HISTORY_RECORD',confirmation_required:true,expected_version:'history/1'}))}}}
 const writes=await api(page,work,(_path,method,body)=>method==='POST'&&body?.phase==='commit'?'ABORT':undefined)
 await resolve(page,work.id);await page.getByRole('button',{name:'Tạo Preview',exact:true}).click();const next=page.getByRole('button',{name:'Tiếp tục xác nhận',exact:true});await expect(next).toBeDisabled()
 await page.getByRole('button',{name:'Chi tiết bản sửa',exact:true}).first().click();let d=page.getByRole('dialog',{name:'Kiểm tra và xác nhận bản sửa'});await d.getByRole('button',{name:'Đóng',exact:true}).click();await expect(next).toBeDisabled();expect(writes.filter(w=>w.body.phase==='commit')).toHaveLength(0)
 const buttons=page.getByRole('button',{name:'Chi tiết bản sửa',exact:true});expect(await buttons.count()).toBe(2)
 for(let i=0;i<2;i++){await buttons.nth(i).click();d=page.getByRole('dialog',{name:'Kiểm tra và xác nhận bản sửa'});await d.getByLabel('Lý do correction').fill(`Evidence for history ${i+1}`);await d.getByRole('checkbox').check();await d.getByRole('button',{name:'Xác nhận cho lần nhập này',exact:true}).click();if(i===0)await expect(next).toBeDisabled()}
 await expect(next).toBeEnabled();await next.click();await page.getByLabel('Lý do review (bắt buộc)').fill('Reviewed historical evidence');await page.getByLabel('Tôi đã đọc đủ dữ liệu, nguồn báo cáo, cách đọc và cảnh báo.').check();await page.getByRole('button',{name:'Xác nhận đã kiểm tra',exact:true}).click();await page.getByLabel('Lý do nhập dữ liệu (bắt buộc)').fill('Historical correction');await page.getByLabel('Tôi đã kiểm tra dữ liệu, cảnh báo và phạm vi nhập.').check();await page.getByRole('button',{name:'Xác nhận và nhập dữ liệu',exact:true}).click()
 await expect(page.getByRole('button',{name:'Kiểm tra lại trạng thái',exact:true})).toBeVisible();const commits=writes.filter(w=>w.body.phase==='commit');expect(commits).toHaveLength(1);expect(commits[0].body.history_corrections).toHaveLength(2);expect(commits[0].body.history_corrections[0].expected_version).toBe('history/1');await page.getByRole('button',{name:'Kiểm tra lại trạng thái',exact:true}).click();expect(writes.filter(w=>w.body.phase==='commit')).toHaveLength(1);await expect(page.getByRole('button',{name:'Chi tiết bản sửa',exact:true})).toHaveCount(0)
})
