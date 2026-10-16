import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ImportMapping, ImportProfileReview } from '../src/features/import-data/components/ImportMapping'
import { ImportResolutionEditor } from '../src/features/import-data/components/ImportResolutionEditor'
import { MappingEditor } from '../src/features/import-data/components/ImportResolveDrawers'
import { classificationDraftOptions, classificationDraftScope } from '../src/features/import-data/importClassificationDraft'
import { ImportDomainReview } from '../src/features/import-data/components/ImportDomainReview'
import { ImportPreview } from '../src/features/import-data/components/ImportPreview'
import { ImportFlow } from '../src/features/import-data/components/ImportFlow'
import { ImportFlowWorkflow } from '../src/features/import-data/importFlow.workflow'
import { MemoryRouter } from 'react-router'

const id = (number) => `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`
const noop = () => {}
const field = { key: 'sales.unit', label: 'Đơn vị từ máy chủ', type: 'string', requiredness: 'required', nullable: true,
  support: 'supported', available: true, reason_code: null, unit_semantics: 'Declared source unit',
  aliases: [], conditional_requirements: [], description: 'Mô tả exact descriptor', input_help: 'Không đoán đơn vị',
  input_sources: ['excel', 'shared_value'], allowed_shared_scopes: ['PROFILE_CONSTANT', 'IMPORT_VALUE'], value_role: 'canonical_candidate', unsupportedFields: [] }
const options = { schema: 'sales', schema_version: 'import_schema/1', schema_context_id: id(3), mapping_revision: 'map-v1',
  duplicate_mapping_allowed: false, options: [field], unsupportedFields: [],
  schemas: [{ schema_id: 'sales', label: 'Schema nhãn từ BE', description: 'Mô tả schema từ BE', supported: true, fields: [field] }] }
const issue = (type = 'column') => ({ mapping_id: id(4), sheet_id: id(3), issue_type: type, code: 'SYNTHETIC_REVIEW',
  status: 'resolved', source_header: 'Header <script>unsafe()</script>', target_field: 'sales.unit',
  samples: ['0', 'false', 'null'], source_location: { file_id: id(2), sheet_id: id(3), source_column_index: 0 },
  resolution_origin: 'USER_PROPOSAL', profile_ref: null, resolution: null, resolved_by: null,
  suggested_target_field: null, confidence: null, ignored: false, unsupportedFields: [] })
const spec = (marker) => ({ scope: { source_system_key: 'qa.synthetic', report_type: 'sales', schema_version: 'import_schema/1' },
  schema: 'sales', structure: { sheet_roles: ['sales'], header_rules: [], schema_signature: marker },
  field_bindings: [{ source_column_index: 0, source_header: marker, target_field: 'sales.unit', requiredness: 'required', ignored: false }],
  identity_rules: [], entity_proposals: [], aliases: [], normalizations: [], conversions: [],
  sales_semantics: 'daily_total', inventory_semantics: null, planned_arrival_expiry_rule: null,
  term_period_amendments: [], fee_period_amendments: [], shared_field_bindings: [],
  source_provenance: { declared_by: id(8), evidence_references: [`evidence:${marker}`], verification: 'USER_DECLARED', owner_reviewed: false } })
const proposal = (activeVersion = null) => ({ profile_id: id(5), proposal_revision: 'proposal-v2', lifecycle_revision: 'lifecycle-v3',
  active_version: activeVersion, spec: spec('FULL_PROPOSED_EVIDENCE'), missing_fields: [] })
const summary = () => ({ import_id: id(1), analysis_id: id(9), mapping_revision: 'map-v1',
  progress: { total_fields: 17, completed_fields: 12, unresolved: 5 },
  files: [{ client_file_id: id(10), file_id: id(2), filename: 'File <img src=x onerror=unsafe()>.csv',
    type: 'csv', size_bytes: 42, content_digest: null, upload_status: 'uploaded', error: null, parse_status: 'parsed' }],
  sheets: [{ file_id: id(2), sheet_id: id(3), name: 'Joined Sheet', schema_signature: 'qa', row_count: 120, headers: ['header'],
    profile_id: id(5), selected_type: 'sales', suggested_type: null, classification_origin: 'MANUAL', confidence: null,
    ignored: false, ignore_reason: null, shared_field_bindings: [], import_values: [] }],
  binding_refs: [], approved_profiles: [], profile_proposals: [], approved_contexts: [], blockers: [], warnings: [],
  can_preview: false, allowed_actions: [], unsupportedFields: [] })
const renderMapping = (overrides = {}) => renderToStaticMarkup(createElement(ImportMapping, {
  summary: summary(), queue: { items: [issue()], counts: { total_fields: 17, completed_fields: 12, unresolved: 5 },
    pagination: { limit: 50, next_cursor: null, total_count: 1 }, unsupportedFields: [] }, selectedSheetId: id(3),
  filter: 'all', reviewOnly: true, options: { [id(3)]: options, [id(4)]: options }, busy: false, locked: false,
  canPropose: true, onSelectSheet: noop, onFilter: noop, onLoadOptions: noop, onLoadSheetOptions: noop,
  onConfirm: noop, onResolve: noop, onLoadMore: noop, ...overrides,
}))

const classificationFixture=()=>{
  const current=summary();current.sheets[0].selected_type=null
  const inventory={...field,key:'inventory_count.quantity',label:'Số lượng kiểm kê từ BE',support:'source_only'}
  const catalogue={...options,schema:null,options:[],schemas:[...options.schemas,{schema_id:'inventory_count',label:'Kiểm kê từ BE',description:'Đếm thực tế',fields:[inventory]}]}
  const draft={scope:classificationDraftScope(current,id(3)),sheetType:'sales',reason:'Nguồn bán hàng',acknowledged:false}
  return {current,catalogue,draft,inventory}
}
test('classification selection immediately projects server catalogue fields before saving or requesting anything',t=>{
  t.mock.method(globalThis,'fetch',()=>{throw Error('Selection must not dispatch')})
  const {current,catalogue,draft}=classificationFixture(),before=structuredClone(catalogue)
  const sales=classificationDraftOptions(current,id(3),draft,catalogue)
  assert.equal(sales.pending,true);assert.deepEqual(sales.options.options.map(o=>o.key),['sales.unit'])
  const inventory=classificationDraftOptions(current,id(3),{...draft,sheetType:'inventory_count'},catalogue)
  assert.deepEqual(inventory.options.options.map(o=>o.key),['inventory_count.quantity'])
  assert.equal(inventory.options.options[0].support,'source_only')
  assert.deepEqual(catalogue,before);assert.equal(current.sheets[0].selected_type,null)
})
test('classification draft updates actual column dropdown and removes the previous schema target',()=>{
  const {current,catalogue,draft}=classificationFixture()
  const preview=classificationDraftOptions(current,id(3),{...draft,sheetType:'inventory_count'},catalogue)
  for(const selectedIssue of [issue(),{...issue(),status:'unmatched',target_field:null}]){
    const html=renderToStaticMarkup(createElement(MappingEditor,{issue:selectedIssue,summary:current,options:preview.options,classificationPending:preview.pending,disabled:false,onConfirm:noop,onResolve:noop,onProposal:noop}))
    assert.match(html,/Số lượng kiểm kê từ BE/);assert.doesNotMatch(html,/value="sales\.unit"/)
    assert.match(html,/<option value="" selected="">Chọn trường/)
    assert.match(html,/Lưu phân loại trước khi xác nhận ghép cột/)
  }
})
test('classification controlled editor retains chosen type/reason while navigating mapping rows',()=>{
  const {current,catalogue,draft}=classificationFixture()
  const value={...draft,sheetType:'inventory_count',reason:'Giữ bằng chứng kiểm kê'}
  const html=renderToStaticMarkup(createElement(ImportResolutionEditor,{issue:issue('classification'),options:catalogue,disabled:false,onResolve:noop,classificationDraft:{value,onChange:noop}}))
  assert.match(html,/<option value="inventory_count" selected="">Kiểm kê từ BE/)
  assert.match(html,/Giữ bằng chứng kiểm kê/)
  assert.match(html,/Đếm thực tế/)
  assert.equal(current.sheets[0].selected_type,null)
})
test('classification draft cannot reuse another sheet, import or mapping revision',()=>{
  const {current,catalogue,draft}=classificationFixture()
  for(const scoped of [{...draft,scope:classificationDraftScope(current,id(30))},{...draft,scope:classificationDraftScope({...current,import_id:id(99)},id(3))},{...draft,scope:classificationDraftScope({...current,mapping_revision:'new'},id(3))}]){
    const result=classificationDraftOptions(current,id(3),scoped,catalogue)
    assert.equal(result.pending,false);assert.equal(result.options,catalogue)
  }
})
test('classification changed without coherent catalogue never falls back to stale schema fields',()=>{
  const {current,catalogue,draft}=classificationFixture()
  for(const descriptor of [undefined,{...catalogue,schema_context_id:id(33)},{...catalogue,mapping_revision:'old'},{...catalogue,unsupportedFields:['unknown']}]){
    const result=classificationDraftOptions(current,id(3),draft,descriptor)
    assert.equal(result.pending,true);assert.equal(result.options,undefined)
  }
})
test('classification blank, IGNORE or absent schema clears candidate fields rather than guessing',()=>{
  const {current,catalogue,draft}=classificationFixture()
  for(const sheetType of ['','IGNORE','weather'])assert.deepEqual(classificationDraftOptions(current,id(3),{...draft,sheetType},catalogue).options.options,[])
})
test('saved classification keeps per-column availability and cancel drops all draft projections',()=>{
  const {current,catalogue,draft}=classificationFixture();current.sheets[0].selected_type='sales'
  const column={...catalogue,schema:'sales',options:[{...field,available:false,reason_code:'TARGET_ALREADY_USED'}]}
  const same=classificationDraftOptions(current,id(3),draft,column)
  assert.equal(same.pending,false);assert.equal(same.options,column);assert.equal(same.options.options[0].available,false)
  const cancelled=classificationDraftOptions(current,id(3),null,column)
  assert.equal(cancelled.pending,false);assert.equal(cancelled.options,column)
})
test('draft catalogue availability and unsupported fields remain disabled in the actual selector',()=>{
  const {current,catalogue,draft}=classificationFixture()
  catalogue.schemas[0].fields=[{...field,available:false},{...field,key:'sales.unsupported',support:'unsupported'}]
  const preview=classificationDraftOptions(current,id(3),draft,catalogue)
  const html=renderToStaticMarkup(createElement(MappingEditor,{issue:issue(),summary:current,options:preview.options,classificationPending:true,disabled:false,onConfirm:noop,onResolve:noop,onProposal:noop}))
  assert.match(html,/<option value="sales.unit" disabled=""/);assert.match(html,/<option value="sales.unsupported" disabled=""/)
})

test('mapping UI joins flat files/top-level sheets, escapes evidence and never fabricates filter counts', () => {
  const html = renderMapping()
  assert.match(html, /Joined Sheet/)
  assert.doesNotMatch(html, /Tiến độ toàn lô từ máy chủ|filter_counts/)
  assert.match(html, /120 dòng/)
  assert.match(html, /&lt;script&gt;unsafe\(\)&lt;\/script&gt;/)
  assert.doesNotMatch(html, /<script>|<img src=x/)
  assert.doesNotMatch(html, /filter_counts|unresolved_required|schema_blocker_count/)
  assert.match(html, /Đã xác nhận đề xuất/)
  assert.match(html, /Xác nhận/)
})

test('read-only mapping still renders catalogue and descriptor semantics without granting mutations', () => {
  const html = renderMapping({ canPropose: false })
  assert.match(html, /Bạn chỉ có quyền xem/)
  assert.doesNotMatch(html, /Catalogue schema từ máy chủ/)
  assert.match(html, /Mô tả exact descriptor/)
  assert.match(html, /Bắt buộc/)
  assert.doesNotMatch(html, /Cho phép null|unsupportedFields/)
  assert.match(html, /disabled=""[^>]*>Xác nhận/)
})

test('classification offers only returned schema catalogue and explicit whole-sheet IGNORE', () => {
  const html = renderToStaticMarkup(createElement(ImportResolutionEditor, { issue: issue('classification'), options, disabled: false, onResolve: noop }))
  assert.doesNotMatch(html, /Catalogue schema từ máy chủ/)
  assert.match(html, /value="IGNORE">Không nhập dữ liệu của Sheet này/)
  assert.match(html, /Lý do phân loại hoặc bỏ qua/)
  assert.doesNotMatch(html, /Staff được IGNORE|business-required/)
  assert.doesNotMatch(html, /value="recipes"|value="inventory_count"/)
  assert.match(html, /disabled=""[^>]*>Lưu loại dữ liệu/)
})

test('source context exposes typed optional semantics and explicit period amendments', () => {
  const html = renderToStaticMarkup(createElement(ImportResolutionEditor, { issue: issue('source_context'), options, disabled: false, onResolve: noop }))
  for (const text of ['Hệ thống nguồn', 'Loại báo cáo', 'daily_total', 'disjoint_contribution', 'lot_stock_count', 'DMY_SLASH', 'EXCEL_SERIAL', 'Giá và MOQ', 'PER_PACK', 'PER_SOURCE_UNIT', 'quantity_only', 'not_provided', 'Thêm alias hết hàng', 'cần quyết định Profile', 'Supplier term', 'Payable fee']) assert.ok(html.includes(text), text)
  assert.match(html, /Không tự động đóng kỳ lịch sử/)
  assert.match(html, /disabled=""[^>]*>Lưu ngữ cảnh nguồn/)
})

test('identity/conversion/ignored forms expose exact supported inputs, not arbitrary JSON mutation', () => {
  const identity = renderToStaticMarkup(createElement(ImportResolutionEditor, { issue: issue('identity'), disabled: false, onResolve: noop }))
  assert.match(identity, /Mã đối tượng/)
  assert.match(identity, /Đề xuất tạo đối tượng mới/)
  const conversion = renderToStaticMarkup(createElement(ImportResolutionEditor, { issue: issue('conversion'), disabled: false, onResolve: noop }))
  assert.match(conversion, /Tử số/)
  assert.match(conversion, /Mẫu số/)
  assert.match(conversion, /Không tự làm tròn/)
  const ignored = renderToStaticMarkup(createElement(ImportResolutionEditor, { issue: issue(), disabled: false, onResolve: noop }))
  assert.match(ignored, /Bỏ qua cột không bắt buộc/)
  assert.match(ignored, /Đề xuất này vẫn cần Owner duyệt/)
  assert.doesNotMatch(identity + conversion + ignored, /placeholder=".*JSON|JSON editor/i)
})

test('shared editor is available even on source-context issue and explicitly separates false/zero/null', () => {
  const html = renderToStaticMarkup(createElement(ImportResolutionEditor, { issue: issue('source_context'), options, disabled: false, onResolve: noop }))
  for (const text of ['Phạm vi', 'Chọn phạm vi', 'Có / Không', 'Số nguyên', 'Chưa xác định', 'Không, 0 và chưa xác định', 'Dùng giá trị khai báo thay cho cột nguồn']) assert.ok(html.includes(text), text)
  assert.match(html, /disabled=""[^>]*>Lưu giá trị đã khai báo/)
})

test('Staff can inspect full proposed evidence but sees no Owner decision actions', () => {
  const value = summary(); value.profile_proposals = [proposal()]
  const html = renderToStaticMarkup(createElement(ImportProfileReview, { summary: value, busy: false, locked: false, canDecide: false, onDecision: noop }))
  assert.match(html, /FULL_PROPOSED_EVIDENCE/)
  assert.match(html, /evidence:FULL_PROPOSED_EVIDENCE/)
  assert.match(html, /Đề xuất được giữ lại để Owner xem và quyết định/)
  assert.doesNotMatch(html, />Duyệt profile<|>Từ chối đề xuất<|>Ngừng sử dụng profile</)
})

test('Owner review uses exact profile/version baseline, never substitutes unrelated approved spec', () => {
  const value = summary(); value.profile_proposals = [proposal('approved/1')]
  value.approved_profiles = [{ binding: { sheet_id: id(3), profile_id: id(50), version: 'approved/1', content_digest: 'opaque' }, spec: spec('UNRELATED_BASELINE') }]
  const missing = renderToStaticMarkup(createElement(ImportProfileReview, { summary: value, busy: false, locked: false, canDecide: true, onDecision: noop }))
  assert.match(missing, /Chưa tải đủ cách đọc đã duyệt để so sánh/)
  assert.match(missing, /Chưa thể so sánh/)
  assert.match(missing, /Chưa có baseline để so sánh/)
  assert.doesNotMatch(missing, /UNRELATED_BASELINE/)
  assert.match(missing, /disabled=""[^>]*>Duyệt profile/)
  value.approved_profiles[0].binding.profile_id = id(5)
  value.approved_profiles[0].spec = spec('MATCHED_FULL_BASELINE')
  const matched = renderToStaticMarkup(createElement(ImportProfileReview, { summary: value, busy: false, locked: false, canDecide: true, onDecision: noop }))
  assert.match(matched, /MATCHED_FULL_BASELINE/)
  assert.match(matched, /FULL_PROPOSED_EVIDENCE/)
  assert.doesNotMatch(matched, /Chưa tải đủ cách đọc đã duyệt để so sánh/)
  // An initial render has no deliberate review checkbox/reason; no autoapproval.
  assert.match(matched, /disabled=""[^>]*>Duyệt profile/)
  assert.doesNotMatch(matched, /lifecycle-v3/)
})

const renderPreview = (page = { limit: 50, next_cursor: null, total_count: 1 }, stale = false, serverBlockers = []) => {
  const location = { file_id: id(2), sheet_id: id(3), row_number: 2 }
  const row = { row_id: id(40), source_location: location, classification: 'CHANGED', proposed_action: 'AMEND_TERM_PERIOD',
    canonical_domain: 'supplier_terms', entity_refs: { supplier_term_id: id(41) }, before: null, after: null,
    changes: [], provenance: {}, blockers: [], warnings: [], confirmation_required: true, unsupportedFields: [],
    source_locations: [location], line_provenance: [], nested_provenance: [{ path: 'term.component[0]', source_location: location,
      provenance: { amount: { origin: 'SOURCE_EXPLICIT', applied_rule_ids: ['EXACT_NESTED_EVIDENCE'], value_source: 'SOURCE_COLUMN', source_column_index: 0 } } }],
    nested_references: [{ entity: 'supplier_term', canonical_id: id(41), path: 'term.component[0]' }],
    dependencies: [id(42)], expected_version: 'expected-term-v1', normalized_source_quantity: '123456789012345678.123456789012345678',
    required_permissions: ['supplier.terms.correct'] }
  const bundle = { import_id: id(1), store_id: id(6), import_revision: 'import-v1', status: 'preview_ready', allowed_actions: [],
    completion_available: false, review_confirmation: null, confirmation_usable: false, unsupportedFields: [],
    preview: { summary: { preview_id: id(43), digest: 'opaque-preview-digest', created_at: '2026-10-11T01:00:00Z',
      source_set_version: 'source-v1', mapping_bindings: [], policy_version: 'import_mapping_policy/1', mode: 'atomic',
      validation_status: 'confirmation_required', can_commit: false, required_actions: ['supplier.terms.correct'], groups: [],
      counts: { CHANGED: 1 }, blockers: serverBlockers, warnings: [], confirmed_resolutions_version: null }, rows: [row], rows_page: page, stale },
    configurations: { suppliers: [], terms: [], fees: [], declarations: [], preview_id: id(43), preview_digest: 'opaque-preview-digest',
      blocked_row_ids: [], rows_page: page, analysis_rows: [], basis: 'preview', stale } }
  return renderToStaticMarkup(createElement(ImportPreview, { bundle, busy: false, locked: false,
    blockers: ['Chưa xác nhận review trên máy chủ'], reason: '', acknowledged: false, reviewReason: '', reviewAcknowledged: false,
    reviewBlockers: ['Cần đọc và xác nhận snapshot'], resolutions: [], supplierChanges: [], onReviewReason: noop,
    onReviewAcknowledge: noop, onConfirmReview: noop, onResolutions: noop, onSupplierChanges: noop,
    onReason: noop, onAcknowledge: noop, onLoadMore: noop, onCommit: noop }))
}

test('preview UI review checkbox remains disabled until complete same-pin nonstale row pages', () => {
  const reviewCheckbox = (html) => html.match(/<input\b[^>]*type="checkbox"[^>]*>/)?.[0]
  assert.match(reviewCheckbox(renderPreview({ limit: 50, next_cursor: 'signed-next', total_count: 2 })), /disabled=""/)
  assert.match(reviewCheckbox(renderPreview({ limit: 50, next_cursor: null, total_count: 2 })), /disabled=""/)
  assert.match(reviewCheckbox(renderPreview(undefined, true)), /disabled=""/)
  assert.match(reviewCheckbox(renderPreview()), /disabled=/) // Pending supplier decision also blocks Review.
})

test('preview UI keeps business confirmation and isolates raw source/configuration/action IDs from product content', () => {
  const html = renderPreview()
  for (const text of ['EXACT_NESTED_EVIDENCE','term.component[0]','expected-term-v1','supplier.terms.correct','Action ID:']) assert.ok(!html.includes(text),text)
  assert.ok(!html.replace(/<[^>]*>/g,'').includes(id(40)))
  assert.match(html, /1\. Xác nhận đã kiểm tra dữ liệu/)
  assert.match(html, /2\. Xác nhận ghi toàn bộ lô/)
  assert.match(html, /Supplier terms|điều khoản/)
  assert.match(html, /disabled=""[^>]*>Xác nhận và nhập dữ liệu/)
})

test('source/recipe scope guards explain recovery without enabling whole-batch commit', () => {
  const html = renderPreview(undefined, false, [
    {code:'SOURCE_CONTEXT_REQUIRED',severity:'ERROR',message:'Source declaration required'},
    {code:'RECIPE_SOURCE_SCOPE_AMBIGUOUS',severity:'ERROR',message:'Ambiguous recipe source scope'},
  ])
  assert.match(html,/xác nhận nguồn, loại báo cáo và bằng chứng/)
  assert.match(html,/chưa hỗ trợ ghép các phần qua nhiều file\/Sheet/)
  assert.match(html,/Lỗi chặn toàn lô/)
  assert.match(html,/disabled=""[^>]*>Xác nhận và nhập dữ liệu/)
})

test('016 available source_only target remains selectable while unsupported target stays disabled', () => {
  const props = { summary: summary(), queue: { items: [issue()], pagination: { limit: 20, next_cursor: null, total_count: 1 } }, selectedSheetId: id(3), filter: 'all', reviewOnly: true,
    options: { [id(4)]: { ...options, options: [{ ...field, support: 'source_only' }, { ...field, key: 'blocked', label: 'Unsupported target', support: 'unsupported' }] } },
    busy: false, locked: false, canPropose: true, onSelectSheet: noop, onFilter: noop, onLoadOptions: noop, onConfirm: noop, onResolve: noop, onLoadMore: noop }
  const html = renderToStaticMarkup(createElement(ImportMapping, props))
  assert.match(html, /<option value="sales.unit"[^>]*>Đơn vị từ máy chủ/)
  assert.doesNotMatch(html, /<option value="sales.unit"[^>]*disabled/)
  assert.match(html, /<option value="blocked"[^>]*disabled/)
})

test('016 complete proposal can reach Owner review and Staff handoff with pending RULE candidates; missing spec stays locked', () => {
  const render = (role, valid) => {
    const controller = new ImportFlowWorkflow({}, {})
    const base = summary()
    base.profile_proposals = [{ ...proposal(), missing_fields: valid ? [] : ['source proof'] }]
    base.can_preview = false
    const state = { ...controller.getSnapshot(), summary: base, queue: null }
    return renderToStaticMarkup(createElement(MemoryRouter, {}, createElement(ImportFlow, { state, workflow: controller, parentBusy: false, parentStale: false, canDecideProfile: role === 'OWNER', canProposeMapping: true, role })))
  }
  for (const [role, label] of [['OWNER', 'Xem profile sẽ được lưu'], ['STAFF', 'Bàn giao cho Owner']]) {
    assert.doesNotMatch(render(role, true), new RegExp(`disabled=""[^>]*>${label}`))
    assert.match(render(role, true), new RegExp(`>${label}</button>`))
    assert.match(render(role, false), new RegExp(`disabled=""[^>]*>${label}`))
  }
})


test('mixed domain review reflects confirmed History together with Sales instead of a permanent pending badge',()=>{
 const sales={row_id:id(90),proposed_action:'REPLACE_DAILY_TOTAL',confirmation_required:true,source_location:{row_number:2}},history={row_id:id(91),proposed_action:'CORRECT_HISTORY_RECORD',confirmation_required:true,expected_version:'history/1',source_location:{row_number:3}}
 const props={bundle:{preview:{rows:[sales,history]}},resolutions:[{row_id:sales.row_id,action:'replace_daily_total',disjoint_assertion:false,report_business_key:'report',evidence_reference:'source',reason:'Reviewed'}],supplierChanges:[],disabled:false,onResolutions:noop,onSupplierChanges:noop}
 const pending=renderToStaticMarkup(createElement(ImportDomainReview,props));assert.match(pending,/Còn quyết định cần xác nhận/)
 const done=renderToStaticMarkup(createElement(ImportDomainReview,{...props,historyCorrections:[{row_id:history.row_id,expected_version:'history/1',reason:'Reviewed history'}]}));assert.doesNotMatch(done,/Còn quyết định cần xác nhận/);assert.match(done,/Đã xác nhận cho lần nhập này/)
})
