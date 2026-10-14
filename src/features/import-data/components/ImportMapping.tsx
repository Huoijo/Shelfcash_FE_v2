import { DebugContent, DebugValue } from '../../../shared/debug/DevelopmentTools'
import { businessField, schemaLabel, sourceLabel, reportLabel, importMessage } from '../importPresentation'
import { ImportBusinessFacts } from './ImportBusinessFacts'
import { resolutionGroup, type ResolutionGroup } from '../importExperience'
import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ActiveIndicator } from '../../../shared/motion/ActiveIndicator'
import { uiTransition } from '../../../shared/motion/motion'
import type { MappingIssue, MappingOption, MappingOptions, MappingQueue, MappingResolution, MappingStatus, MappingSummary, MappingProfileSpec, ProfileDecisionRequest } from '../importFlow.types'
import { ImportProfileSpecification } from './ImportProfileSpecification'
import { FlowDialog } from '../../../shared/flow/FlowDialog'
import { ImportResolutionEditor } from './ImportResolutionEditor'

const statusLabels: Record<MappingStatus, string> = {
  auto_mapped: 'Đã ghép tự động', resolved: 'Đã xác nhận đề xuất', needs_confirmation: 'Cần xác nhận',
  ambiguous: 'Mơ hồ', unmatched: 'Chưa ghép',
}
const issueLabels: Record<MappingIssue['issue_type'], string> = {
  column: 'Ghép cột', classification: 'Loại dữ liệu của Sheet', source_context: 'Ngữ cảnh nguồn',
  identity: 'Nhận diện đối tượng', conversion: 'Quy đổi đơn vị', schema_blocker: 'Dữ liệu bị chặn',
}

export function Evidence({ value, label = 'Chi tiết từ máy chủ' }: { value: unknown; label?: string }) {
  return <DebugValue label={label} value={value} />
}

type Props = {
  category?: ResolutionGroup | 'all'
  summary: MappingSummary
  queue: MappingQueue | null
  selectedSheetId: string | null
  filter: string
  reviewOnly: boolean
  options: Record<string, MappingOptions>
  busy: boolean
  locked: boolean
  canPropose: boolean
  onSelectSheet: (id: string) => void
  onFilter: (filter: string, reviewOnly: boolean) => void
  onLoadOptions: (id: string) => void
  onLoadSheetOptions?: (sheetId: string) => void
  onConfirm: (id: string, target: string) => void
  onResolve: (id: string, resolution: MappingResolution) => void
  onLoadMore: () => void
}

export function ImportMapping(props: Props) {
  const indicatorId = useId()
  const reducedMotion = useReducedMotion()
  const { summary, queue, busy, locked } = props
  const selectedSheet = summary.sheets.find((sheet) => sheet.sheet_id === props.selectedSheetId)
  const sheetOptions = props.selectedSheetId ? props.options[props.selectedSheetId] : undefined
  return <>
    <DebugContent><div className="import-mapping-progress">
      <dl aria-label="Tiến độ toàn lô từ máy chủ">
        <div><dt>mục được phát hiện</dt><dd>{summary.progress.total_fields}</dd></div>
        <div><dt>đã xử lý</dt><dd>{summary.progress.completed_fields}</dd></div>
        <div><dt>cần bạn xử lý</dt><dd>{summary.progress.unresolved}</dd></div>
      </dl>
      <div className="import-mapping-progress__track"><span><strong>{summary.progress.completed_fields} / {summary.progress.total_fields}</strong> hoàn tất</span>
        <progress className="sr-only" aria-label="Tiến độ xử lý toàn lô" value={summary.progress.completed_fields} max={summary.progress.total_fields || 1} />
        <div className="import-mapping-progress__bar" aria-hidden="true"><motion.span initial={false}
          animate={{ scaleX: summary.progress.total_fields ? Math.min(1, summary.progress.completed_fields / summary.progress.total_fields) : 0 }}
          transition={reducedMotion ? { duration: 0 } : uiTransition} /></div></div>
    </div>
    </DebugContent><div className="import-flow__layout">
      <nav className="import-flow__navigator" aria-label="File và Sheet của lô">
        <header><h3>File / Sheet</h3><p className="import-flow__muted">{summary.files.length} file · {summary.sheets.length} sheets</p></header>
        {summary.files.map((file, index) => <details className="import-mapping-file" open key={file.file_id ?? file.client_file_id ?? `file-${index}`}>
          <summary>{file.filename}</summary>
          <ul>{summary.sheets.filter((sheet) => sheet.file_id === file.file_id).map((sheet) => <li key={sheet.sheet_id}>
            <button type="button" disabled={busy || locked} aria-current={props.selectedSheetId === sheet.sheet_id ? 'true' : undefined} onClick={() => props.onSelectSheet(sheet.sheet_id)}>
              {sheet.name}<br /><span className="import-flow__muted">{sheet.row_count} dòng · {sheet.ignored ? 'Bỏ qua Sheet' : schemaLabel(sheet.selected_type)}</span>
            </button>
          </li>)}</ul>
        </details>)}
      </nav>
      <section className="import-flow__queue" aria-label="Các mục cần ghép">
        {selectedSheet && <header className="import-mapping-sheet-header">
          <p className="import-flow__muted">{summary.files.find((file) => file.file_id === selectedSheet.file_id)?.filename} · {selectedSheet.ignored ? 'Bỏ qua Sheet' : schemaLabel(selectedSheet.selected_type)}</p>
          <h3>Sheet: {selectedSheet.name}</h3>
          <details><summary>Thông tin và quy tắc của Sheet</summary>
          <DebugValue label="Sheet diagnostics / schema" value={{sheet:selectedSheet,options:sheetOptions}} />
          {selectedSheet.ignore_reason && <p>Lý do bỏ qua: {selectedSheet.ignore_reason}</p>}
          <p>Các cột: {selectedSheet.headers.join(' · ') || 'Không có header'}</p>
          {!!selectedSheet.shared_field_bindings?.length && <Evidence value={selectedSheet.shared_field_bindings} label="Quy tắc giá trị dùng chung đã khai báo" />}
          {!!selectedSheet.import_values?.length && <Evidence value={selectedSheet.import_values} label="Giá trị riêng của lần import này" />}
          </details>
        </header>}
        <div className="import-flow__filters">
          <div className="import-mapping-filter-tabs" role="group" aria-label="Lọc trạng thái ghép cột">
            {[['all', 'Tất cả'], ['needs_confirmation', 'Cần xác nhận'], ['ambiguous', 'Mơ hồ'], ['unmatched', 'Chưa ghép'], ['auto_mapped', 'Đã ghép tự động'], ['resolved', 'Đã xác nhận đề xuất']].map(([value, label]) =>
              <button key={value} type="button" aria-pressed={props.filter === value} disabled={busy || locked} onClick={() => props.onFilter(value, ['auto_mapped','resolved'].includes(value)?false:props.reviewOnly)}>{props.filter === value && <ActiveIndicator id={`${indicatorId}-mapping-filter`} />}{label}</button>)}
          </div>
          <label><input type="checkbox" checked={props.reviewOnly} disabled={busy || locked} onChange={(event) => props.onFilter(props.filter, event.target.checked)} />Chỉ hiện trường cần xử lý</label>
        </div>
        <div className="import-mapping-card-list">
        {!props.canPropose && <p className="import-flow__notice">Bạn chỉ có quyền xem. Cần người có quyền chỉnh sửa xử lý mục này.</p>}
        {!queue && <p role="status">Chọn một Sheet để đọc danh sách từ máy chủ.</p>}
        <DebugValue label="Mapping paging" value={queue?.pagination} />
        {queue && !queue.items.length && <p className="import-flow__notice">Không có trường trong bộ lọc này.</p>}
        {queue?.items.filter(issue => !props.category || props.category === 'all' || resolutionGroup(issue) === props.category).map((issue) => <MappingCard key={`${summary.mapping_revision}:${issue.mapping_id}`} issue={issue} options={props.options[issue.mapping_id]} busy={busy || locked || !props.canPropose} readBusy={busy || locked} onLoadOptions={() => props.onLoadOptions(issue.mapping_id)} onConfirm={(target) => props.onConfirm(issue.mapping_id, target)} onResolve={(resolution) => props.onResolve(issue.mapping_id, resolution)} />)}
        {props.category && props.category !== 'all' && <p className="import-flow__muted">Các mục đã tải trong nhóm này.</p>}
        {queue?.pagination.next_cursor && <button type="button" disabled={busy || locked} onClick={props.onLoadMore}>Xem thêm mục</button>}

        </div>
      </section>
    </div>
    <DebugContent><div className="import-mapping-completed"><span>✓ {summary.progress.completed_fields} mục đã xử lý</span><button type="button" disabled={busy || locked} onClick={() => props.onFilter('all', !props.reviewOnly)}>{props.reviewOnly ? 'Xem các trường đã ghép' : 'Chỉ xem trường cần xử lý'}</button></div>
    </DebugContent>
  </>
}

export function FieldDescriptor({ option }: { option: MappingOption | MappingOptions['schemas'][number]['fields'][number] }) {
  return <div className="import-flow__field-info">
    <strong>{option.label || businessField(option.key)}</strong><DebugValue label="Field descriptor" value={option} />
    {(option.description || option.input_help) && <p>{option.description || option.input_help}</p>}
    <p className="import-flow__muted">{option.requiredness === 'required' ? 'Bắt buộc' : 'Không bắt buộc'}{option.unit_semantics ? ` · Đơn vị: ${option.unit_semantics}` : ''}</p>
    {option.input_help && option.description && <p>{option.input_help}</p>}
    {!!option.conditional_requirements?.length && <p>Điều kiện: {option.conditional_requirements.join(' · ')}</p>}
    {!option.available && <p className="import-flow__notice">Chưa thể ghép cột: {importMessage(option.reason_code ?? '', 'Trường không sẵn sàng')}.</p>}
  </div>
}

function MappingCard({ issue, options, busy, readBusy, onLoadOptions, onConfirm, onResolve }: {
  issue: MappingIssue; options?: MappingOptions; busy: boolean; readBusy: boolean; onLoadOptions: () => void; onConfirm: (target: string) => void; onResolve: (resolution: MappingResolution) => void
}) {
  const [target, setTarget] = useState<string | null>(null)
  const reducedMotion = useReducedMotion()
  const suggested = issue.suggested_target_field ?? issue.target_field ?? ''
  const value = target ?? (options?.options.some((option) => option.key === suggested && option.available && option.support === 'supported') ? suggested : '')
  const selected = options?.options.find((option) => option.key === value)
  const id = `mapping-${issue.mapping_id}`
  return <motion.article className="import-flow__issue" aria-labelledby={`${id}-title`}
    layout={reducedMotion ? false : 'position'} initial={reducedMotion ? false : { opacity: 0.7 }}
    animate={{ opacity: 1 }} transition={reducedMotion ? { duration: 0 } : uiTransition}>
    <p className="import-flow__muted">{issueLabels[issue.issue_type]}</p>
    <div className="import-flow__issue-heading">
      <h3 id={`${id}-title`}>{issue.source_header ?? issueLabels[issue.issue_type]}</h3>
      <span className="import-flow__badge">{statusLabels[issue.status]}{issue.ignored ? ' · Bỏ qua' : ''}</span>
    </div>
    <p className="import-flow__samples">Mẫu dữ liệu: {issue.samples.length ? issue.samples.map((sample) => sample === '' ? '"" (chuỗi rỗng)' : sample).join(' · ') : 'Không có mẫu'}</p>
    {issue.suggested_target_field && <p className="import-flow__muted">{issue.suggestion_origin === 'QWEN' ? 'AI đề xuất' : 'Gợi ý ghép cột'}{typeof issue.confidence === 'number' ? ` · ${Math.round(issue.confidence * 100)}%` : ''}</p>}
    {issue.issue_type === 'source_context' && <p className="import-flow__notice">Xác nhận nguồn và loại báo cáo của lần nhập này, kèm bằng chứng. Header giống profile cũ không chứng minh file mới cùng nguồn; duyệt profile không thay bước Preview/Review.</p>}
    {issue.status === 'ambiguous' && <p className="import-flow__muted">Có nhiều trường phù hợp</p>}
    {issue.issue_type === 'column' && <div className="import-flow__selector">
      <label htmlFor={`${id}-target`}>Ghép với trường ShelfCash
        <select id={`${id}-target`} value={value} disabled={busy || !options} onFocus={() => { if (!options && !readBusy) onLoadOptions() }} onChange={(event) => setTarget(event.target.value)}>
          <option value="">{options ? 'Chọn trường ShelfCash' : 'Đang tải danh sách trường…'}</option>
          {options?.options.map((option) => <option key={option.key} value={option.key} disabled={!option.available || option.support !== 'supported'}>
            {option.label || businessField(option.key)}{option.key === issue.suggested_target_field ? ' · Đề xuất' : ''}{!option.available || option.support !== 'supported' ? ' · Không khả dụng' : ''}
          </option>)}
        </select>
      </label>
    </div>}
    <div className="import-mapping-card-actions">
      <details><summary>Xem chi tiết</summary>
        {selected && <FieldDescriptor option={selected} />}
        {issue.issue_type === 'column' && <ImportResolutionEditor issue={issue} options={options} disabled={busy} onResolve={onResolve} />}
        <Evidence value={{ issue_type: issueLabels[issue.issue_type], code: issue.code, resolution_origin: issue.resolution_origin, mapping_id: issue.mapping_id, sheet_id: issue.sheet_id, source_location: issue.source_location, profile_ref: issue.profile_ref, resolution: issue.resolution, resolved_by: issue.resolved_by }} label="Chi tiết ghép dữ liệu" />
      </details>
      {issue.issue_type === 'column' && <button className="import-flow__primary" type="button" disabled={busy || !selected?.available || selected.support !== 'supported'} onClick={() => onConfirm(value)}>Xác nhận</button>}
    </div>
    {issue.issue_type !== 'column' && <>
      {!options && <button type="button" disabled={readBusy} onClick={onLoadOptions}>Tải lựa chọn xử lý</button>}
      <ImportResolutionEditor issue={issue} options={options} disabled={busy} onResolve={onResolve} />
    </>}
  </motion.article>
}

type ReviewProps = {
  summary: MappingSummary
  busy: boolean
  locked: boolean
  canDecide: boolean
  onDecision: (profileId: string, lifecycleRevision: string, decision: ProfileDecisionRequest) => void
}

export function ImportProfileReview({ summary, busy, locked, canDecide, onDecision }: ReviewProps) {
  return <section aria-label="Owner duyệt mapping profile">

    {!summary.profile_proposals.length && summary.approved_profiles.filter(profile => summary.binding_refs.some(binding => binding.profile_id === profile.binding.profile_id && binding.version === profile.binding.version)).map(profile => <ProfileInterpretation key={profile.binding.profile_id + profile.binding.version} spec={profile.spec} />)}
    {summary.profile_proposals.map((proposal) => {
      const approved = summary.approved_profiles.find((profile) => profile.binding.profile_id === proposal.profile_id && profile.binding.version === proposal.active_version)
      return <ProfileReviewCard key={`${proposal.profile_id}:${proposal.lifecycle_revision}:${proposal.proposal_revision}`} proposal={proposal} approvedSpec={approved?.spec} busy={busy || locked} canDecide={canDecide} onDecision={(decision) => onDecision(proposal.profile_id, proposal.lifecycle_revision, decision)} />
    })}
  </section>
}

function ProfileReviewCard({ proposal, approvedSpec, busy, canDecide, onDecision }: {
  proposal: MappingSummary['profile_proposals'][number]
  approvedSpec?: MappingSummary['approved_profiles'][number]['spec']
  busy: boolean
  canDecide: boolean
  onDecision: (decision: ProfileDecisionRequest) => void
}) {
  const [reason, setReason] = useState('')
  const [reviewed, setReviewed] = useState(false)
  const [rejectOpen,setRejectOpen]=useState(false),[rejectReason,setRejectReason]=useState(''),[rejectAck,setRejectAck]=useState(false)
  const [retireOpen,setRetireOpen]=useState(false),[retireReason,setRetireReason]=useState(''),[retireAck,setRetireAck]=useState(false)
  const hasBaseline = proposal.active_version === null || !!approvedSpec
  const canApprove = !busy && canDecide && reviewed && !!reason.trim() && !!proposal.spec && !proposal.missing_fields.length && hasBaseline
  return <article className="import-flow__card">
    <DebugValue label="Profile / CAS" value={proposal} />
    {!!proposal.missing_fields.length && <p className="import-flow__notice">Chưa thể duyệt: còn thiếu {proposal.missing_fields.map(businessField).join(', ')}.</p>}
    {!proposal.spec && <p className="import-flow__notice">Chưa tải đủ cách đọc đề xuất. Tải lại trước khi duyệt.</p>}
    {!hasBaseline && <p className="import-flow__notice">Chưa tải đủ cách đọc đã duyệt để so sánh. Tải lại trước khi quyết định.</p>}
    <section className="input-profile-version"><strong>{proposal.active_version===null?'Tạo Profile đầu tiên':`Profile hiện tại · v${proposal.active_version}`}</strong><span>{proposal.active_version===null?'Chưa có reusable Profile baseline':'Đề xuất version mới · Chưa có hiệu lực'}</span></section>
    {proposal.spec && <ImportProfileSpecification proposed={proposal.spec} baseline={approvedSpec} first={proposal.active_version===null}/>}
    <details className="input-profile-evidence"><summary>Xem toàn bộ cách đọc và bằng chứng</summary><div className="import-flow__profile-comparison">
      <section><h4>Cách đọc đã duyệt</h4>{approvedSpec ? <ImportBusinessFacts value={approvedSpec} /> : <p>{proposal.active_version === null ? 'Profile mới.' : 'Chưa tải được cách đọc đã duyệt.'}</p>}</section>
      <section><h4>Cách đọc đề xuất</h4>{proposal.spec && <ImportBusinessFacts value={proposal.spec} />}</section>
    </div></details>
    {!canDecide ? <p className="import-flow__notice">Đề xuất được giữ lại để Owner xem và quyết định.</p> : <fieldset disabled={busy} className="import-flow__form">
      <legend>Quyết định của Owner</legend>
      <label>Lý do duyệt<textarea maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
      <label className="import-flow__check"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} />Tôi đã kiểm tra cách đọc đề xuất, bằng chứng và cách đọc đã duyệt (nếu có).</label>
      <div className="import-flow__actions">
        <button type="button" className="import-flow__primary" disabled={!canApprove} onClick={() => onDecision({ decision: 'approve_activate', proposal_revision: proposal.proposal_revision, expected_active_version: proposal.active_version, reason: reason.trim() })}>Duyệt profile</button>
        <button type="button" disabled={busy} onClick={() => setRejectOpen(true)}>Từ chối</button>
        {proposal.active_version && <button type="button" disabled={busy} onClick={() => setRetireOpen(true)}>Ngừng sử dụng profile</button>}
      </div>

    </fieldset>}
    {rejectOpen&&<section className="input-profile-reject"><h3>Trả Profile proposal về để chỉnh lại</h3><label>Lý do từ chối<textarea value={rejectReason} maxLength={1000} disabled={busy} onChange={event=>setRejectReason(event.target.value)}/></label><label className="import-flow__check"><input type="checkbox" checked={rejectAck} disabled={busy} onChange={event=>setRejectAck(event.target.checked)}/>Tôi xác nhận trả đề xuất này về để chỉnh lại.</label><div className="input-actions"><button type="button" disabled={busy} onClick={()=>setRejectOpen(false)}>Hủy</button><button type="button" disabled={busy||!canDecide||!rejectAck||!rejectReason.trim()} onClick={()=>onDecision({decision:'reject',proposal_revision:proposal.proposal_revision,reason:rejectReason.trim()})}>Từ chối đề xuất</button></div></section>}
    {retireOpen&&<FlowDialog center title="Ngừng sử dụng Profile này?" onClose={()=>{if(!busy)setRetireOpen(false)}} closeDisabled={busy} footer={<><button type="button" disabled={busy} onClick={()=>setRetireOpen(false)}>Hủy</button><button type="button" className="sc-flow-primary" disabled={busy||!canDecide||!retireAck||!retireReason.trim()} onClick={()=>onDecision({decision:'retire',active_version:proposal.active_version!,reason:retireReason.trim()})}>Ngừng sử dụng Profile</button></>}><p>Profile version này sẽ không được chọn cho import mới. Import đã hoàn tất không bị thay đổi; không tự kích hoạt version khác.</p><label>Lý do ngừng sử dụng<textarea disabled={busy} value={retireReason} maxLength={1000} onChange={event=>setRetireReason(event.target.value)}/></label><label className="import-flow__check"><input type="checkbox" checked={retireAck} disabled={busy} onChange={event=>setRetireAck(event.target.checked)}/>Tôi xác nhận không dùng Profile version này cho import mới.</label></FlowDialog>}
  </article>
}

function ProfileInterpretation({ spec }: { spec: MappingProfileSpec }) {
  return <div className="input-resolve-grid input-profile-grid">
    <section><span>1</span><h3>Nguồn</h3><p>{sourceLabel(spec.scope.source_system_key)} · {reportLabel(spec.scope.report_type)}</p><p>Bằng chứng: {spec.source_provenance.evidence_references.join(', ') || 'Chưa được cung cấp'}</p></section>
    <section><span>2</span><h3>Cách hiểu tái sử dụng</h3>{spec.field_bindings.map((binding, i) => <p key={i}><strong>{binding.source_header}</strong> → {binding.ignored ? 'Bỏ qua đã khai báo' : binding.target_field ? businessField(binding.target_field) : 'Chưa xác định'}</p>)}</section>
    <section><span>3</span><h3>Identity và binding</h3><p>{spec.identity_rules?.length ?? 'Chưa được cung cấp'} liên kết · {spec.aliases?.length ?? 'Chưa được cung cấp'} tên gọi · {spec.entity_proposals?.length ?? 'Chưa được cung cấp'} đề xuất entity</p><details><summary>Xem liên kết đối tượng</summary><ImportBusinessFacts value={{ identity_rules: spec.identity_rules, aliases: spec.aliases, entity_proposals: spec.entity_proposals }} /></details></section>
    <section><span>4</span><h3>Declaration và units</h3><p>{spec.conversions?.length ?? 'Chưa được cung cấp'} quy đổi · {spec.shared_field_bindings?.length ?? 'Chưa được cung cấp'} khai báo giá trị dùng chung</p><details><summary>Xem khai báo và quy đổi</summary><ImportBusinessFacts value={{ conversions: spec.conversions, shared_field_bindings: spec.shared_field_bindings, normalizations: spec.normalizations, planned_arrival_expiry_rule: spec.planned_arrival_expiry_rule, term_period_amendments: spec.term_period_amendments, fee_period_amendments: spec.fee_period_amendments }} /></details></section>
  </div>
}
