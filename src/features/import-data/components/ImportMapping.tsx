import { useState } from 'react'
import type { MappingIssue, MappingOption, MappingOptions, MappingQueue, MappingResolution, MappingStatus, MappingSummary, ProfileDecisionRequest } from '../importFlow.types'
import { ImportResolutionEditor } from './ImportResolutionEditor'

const statusLabels: Record<MappingStatus, string> = {
  auto_mapped: 'Đã ghép tự động', resolved: 'Đã xác nhận đề xuất', needs_confirmation: 'Cần xác nhận',
  ambiguous: 'Chưa rõ trường đích', unmatched: 'Chưa tìm được trường đích',
}
const issueLabels: Record<MappingIssue['issue_type'], string> = {
  column: 'Ghép cột', classification: 'Loại dữ liệu của Sheet', source_context: 'Ngữ cảnh nguồn',
  identity: 'Nhận diện đối tượng', conversion: 'Quy đổi đơn vị', schema_blocker: 'Dữ liệu / schema bị chặn',
}

export function Evidence({ value, label = 'Chi tiết từ máy chủ' }: { value: unknown; label?: string }) {
  return <details><summary>{label}</summary><pre>{JSON.stringify(value, null, 2)}</pre></details>
}

type Props = {
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
  const { summary, queue, busy, locked } = props
  const selectedSheet = summary.sheets.find((sheet) => sheet.sheet_id === props.selectedSheetId)
  const sheetOptions = props.selectedSheetId ? props.options[props.selectedSheetId] : undefined
  return <>
    <div className="import-mapping-progress">
      <dl aria-label="Tiến độ toàn lô từ máy chủ">
        <div><dt>mục được phát hiện</dt><dd>{summary.progress.total_fields}</dd></div>
        <div><dt>đã xử lý</dt><dd>{summary.progress.completed_fields}</dd></div>
        <div><dt>cần bạn xử lý</dt><dd>{summary.progress.unresolved}</dd></div>
      </dl>
      <div className="import-mapping-progress__track"><span><strong>{summary.progress.completed_fields} / {summary.progress.total_fields}</strong> hoàn tất</span>
        <progress aria-label="Tiến độ xử lý toàn lô" value={summary.progress.completed_fields} max={summary.progress.total_fields || 1} /></div>
    </div>
    <div className="import-flow__layout">
      <nav className="import-flow__navigator" aria-label="File và Sheet của lô">
        <header><h3>File / Sheet</h3><p className="import-flow__muted">{summary.files.length} file · {summary.sheets.length} sheets</p></header>
        {summary.files.map((file, index) => <section key={file.file_id ?? file.client_file_id ?? `file-${index}`}>
          <p><strong>{file.filename}</strong></p>
          <ul>{summary.sheets.filter((sheet) => sheet.file_id === file.file_id).map((sheet) => <li key={sheet.sheet_id}>
            <button type="button" disabled={busy || locked} aria-current={props.selectedSheetId === sheet.sheet_id ? 'true' : undefined} onClick={() => props.onSelectSheet(sheet.sheet_id)}>
              {sheet.name}<br /><span className="import-flow__muted">{sheet.row_count} dòng · {sheet.ignored ? 'Bỏ qua Sheet' : sheet.selected_type ?? 'Chưa chọn loại dữ liệu'}</span>
            </button>
          </li>)}</ul>
        </section>)}
      </nav>
      <section className="import-flow__queue" aria-label="Các mục cần ghép">
        {selectedSheet && <header className="import-mapping-sheet-header">
          <p className="import-flow__muted">{summary.files.find((file) => file.file_id === selectedSheet.file_id)?.filename} · {selectedSheet.ignored ? 'Bỏ qua Sheet' : selectedSheet.selected_type ?? 'Chưa xác định loại dữ liệu'}</p>
          <h3>Sheet: {selectedSheet.name}</h3>
          <details><summary>Thông tin và quy tắc của Sheet</summary>
          {selectedSheet.suggested_type && <p className="import-flow__muted">Gợi ý từ máy chủ: {selectedSheet.suggested_type} · {selectedSheet.classification_origin}. Gợi ý không tự trở thành quyết định.</p>}
          {selectedSheet.ignore_reason && <p>Lý do bỏ qua: {selectedSheet.ignore_reason}</p>}
          <p className="import-flow__muted">Các cột: {selectedSheet.headers.join(' · ') || 'Không có header'}</p>
          {!sheetOptions && props.onLoadSheetOptions && <button type="button" disabled={busy || locked} onClick={() => props.onLoadSheetOptions?.(selectedSheet.sheet_id)}>Xem catalogue schema và trường dữ liệu</button>}
          {sheetOptions && <SchemaCatalogue options={sheetOptions} />}
          {!!selectedSheet.shared_field_bindings?.length && <Evidence value={selectedSheet.shared_field_bindings} label="Quy tắc giá trị dùng chung đã khai báo" />}
          {!!selectedSheet.import_values?.length && <Evidence value={selectedSheet.import_values} label="Giá trị riêng của lần import này" />}
          </details>
        </header>}
        <div className="import-flow__filters">
          <div className="import-mapping-filter-tabs" role="group" aria-label="Lọc trạng thái ghép cột">
            {[['all', 'Tất cả'], ['needs_confirmation', 'Cần xác nhận'], ['ambiguous', 'Mơ hồ'], ['unmatched', 'Chưa ghép'], ['auto_mapped', 'Tự động'], ['resolved', 'Đã xác nhận']].map(([value, label]) =>
              <button key={value} type="button" aria-pressed={props.filter === value} disabled={busy || locked} onClick={() => props.onFilter(value, props.reviewOnly)}>{label}</button>)}
          </div>
          <label><input type="checkbox" checked={props.reviewOnly} disabled={busy || locked} onChange={(event) => props.onFilter(props.filter, event.target.checked)} />Ẩn mục đã ghép tự động</label>
        </div>
        <div className="import-mapping-card-list">
        {!props.canPropose && <p className="import-flow__notice">Bạn đang xem chỉ đọc: cần quyền mapping.propose và quyền đọc dữ liệu liên quan để sửa đề xuất.</p>}
        {!queue && <p role="status">Chọn một Sheet để đọc danh sách từ máy chủ.</p>}
        {queue && !queue.items.length && <p className="import-flow__notice">Không có mục trong bộ lọc này. Điều này không có nghĩa toàn lô đã sẵn sàng Preview.</p>}
        {queue?.items.map((issue) => <MappingCard key={`${summary.mapping_revision}:${issue.mapping_id}`} issue={issue} options={props.options[issue.mapping_id]} busy={busy || locked || !props.canPropose} readBusy={busy || locked} onLoadOptions={() => props.onLoadOptions(issue.mapping_id)} onConfirm={(target) => props.onConfirm(issue.mapping_id, target)} onResolve={(resolution) => props.onResolve(issue.mapping_id, resolution)} />)}
        {queue?.pagination.next_cursor && <button type="button" disabled={busy || locked} onClick={props.onLoadMore}>Xem thêm mục</button>}
        {queue && <p className="import-flow__muted">Đang hiển thị {queue.items.length} mục trong bộ lọc.</p>}
        </div>
      </section>
    </div>
  </>
}

export function FieldDescriptor({ option }: { option: MappingOption | MappingOptions['schemas'][number]['fields'][number] }) {
  return <div className="import-flow__field-info">
    <strong>{option.label || option.key}</strong> <code>{option.key}</code>
    <p>{option.description || option.input_help || 'Không có mô tả bổ sung.'}</p>
    <p className="import-flow__muted">{option.type} · {option.requiredness === 'required' ? 'Bắt buộc' : 'Không bắt buộc'} · {option.nullable ? 'Cho phép null' : 'Không cho phép null'}{option.unit_semantics ? ` · Đơn vị: ${option.unit_semantics}` : ''} · {option.support}</p>
    {option.input_help && option.description && <p>{option.input_help}</p>}
    {!!option.conditional_requirements?.length && <p>Điều kiện: {option.conditional_requirements.join(' · ')}</p>}
    {!option.available && <p className="import-flow__notice">Chưa thể ghép cột: {option.reason_code ?? 'Trường không sẵn sàng'}.</p>}
  </div>
}

function SchemaCatalogue({ options }: { options: MappingOptions }) {
  return <details className="import-flow__catalogue"><summary>Catalogue schema từ máy chủ ({options.schemas.length})</summary>
    <p className="import-flow__muted">Catalogue mô tả dữ liệu hỗ trợ. Khả dụng/duy nhất trong Sheet phải lấy từ field-options của từng mục ghép.</p>
    {options.schemas.map((schema) => <details key={schema.schema_id}><summary>{schema.label} · {schema.schema_id}{schema.schema_id === options.schema ? ' · đang chọn' : ''}</summary>
      <p>{schema.description}</p>
      {schema.fields.map((field) => <FieldDescriptor key={field.key} option={field} />)}
    </details>)}
  </details>
}

function MappingCard({ issue, options, busy, readBusy, onLoadOptions, onConfirm, onResolve }: {
  issue: MappingIssue; options?: MappingOptions; busy: boolean; readBusy: boolean; onLoadOptions: () => void; onConfirm: (target: string) => void; onResolve: (resolution: MappingResolution) => void
}) {
  const [target, setTarget] = useState('')
  const selected = options?.options.find((option) => option.key === target)
  const id = `mapping-${issue.mapping_id}`
  return <article className="import-flow__issue" aria-labelledby={`${id}-title`}>
    <div className="import-flow__issue-heading">
      <h3 id={`${id}-title`}>{issue.source_header ?? issueLabels[issue.issue_type]}</h3>
      <span className="import-flow__badge">{statusLabels[issue.status]}{issue.ignored ? ' · Bỏ qua' : ''}</span>
    </div>
    <p className="import-flow__samples">Mẫu nguồn: {issue.samples.length ? issue.samples.map((sample) => sample === '' ? '"" (chuỗi rỗng)' : sample).join(' · ') : 'Không có mẫu'}</p>
    {issue.target_field && <p>Trường đích hiện tại: <strong>{issue.target_field}</strong></p>}
    {issue.suggested_target_field && <p className="import-flow__muted">Gợi ý: {issue.suggested_target_field} · {issue.suggestion_origin}{typeof issue.confidence === 'number' ? ` · confidence ${issue.confidence}` : ''}. Không tự xác nhận.</p>}
    {!options && <button className="import-mapping-load-options" type="button" disabled={readBusy} onClick={onLoadOptions}>Chọn trường ShelfCash <span aria-hidden="true">⌄</span></button>}
    {options && issue.issue_type === 'column' && <>
      <div className="import-flow__selector">
        <label htmlFor={`${id}-target`}>Ghép với trường ShelfCash
          <select id={`${id}-target`} value={target} disabled={busy} onChange={(event) => setTarget(event.target.value)}>
            <option value="">Chọn trường đích…</option>
            {options.options.map((option) => <option key={option.key} value={option.key} disabled={!option.available || option.support !== 'supported'}>
              {option.label || option.key} · {option.key}{!option.available || option.support !== 'supported' ? ` · ${option.reason_code ?? option.support}` : ''}
            </option>)}
          </select>
        </label>
        <button type="button" disabled={busy || !selected?.available || selected.support !== 'supported'} onClick={() => onConfirm(target)}>Lưu ghép cột</button>
      </div>
      {selected && <details><summary>Mô tả trường đã chọn</summary><FieldDescriptor option={selected} /></details>}
    </>}
    {issue.issue_type === 'column' ? <details><summary>Cách xử lý khác</summary><ImportResolutionEditor issue={issue} options={options} disabled={busy} onResolve={onResolve} /></details> : <ImportResolutionEditor issue={issue} options={options} disabled={busy} onResolve={onResolve} />}
    <Evidence value={{ issue_type: issueLabels[issue.issue_type], code: issue.code, resolution_origin: issue.resolution_origin, mapping_id: issue.mapping_id, sheet_id: issue.sheet_id, source_location: issue.source_location, profile_ref: issue.profile_ref, resolution: issue.resolution, resolved_by: issue.resolved_by }} label="Chi tiết ghép dữ liệu" />
  </article>
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
    <h3>Duyệt mapping profile</h3>
    <p className="import-flow__muted">Chỉ Owner của Store hiện tại có thể kích hoạt, từ chối hoặc retire. Duyệt profile không thay bước review của từng import hoặc cấp thêm quyền commit.</p>
    {!summary.profile_proposals.length && <p>Không có đề xuất profile mới trong summary hiện tại. Profile được tái sử dụng đúng binding không cần duyệt lại.</p>}
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
  const hasBaseline = proposal.active_version === null || !!approvedSpec
  const canApprove = !busy && canDecide && reviewed && !!reason.trim() && !!proposal.spec && !proposal.missing_fields.length && hasBaseline
  return <article className="import-flow__card">
    <h3>Profile {proposal.profile_id}</h3>
    <p className="import-flow__muted">Proposal {proposal.proposal_revision} · lifecycle {proposal.lifecycle_revision} · active {proposal.active_version ?? 'chưa có'}</p>
    {!!proposal.missing_fields.length && <p className="import-flow__notice">Chưa thể duyệt: còn thiếu {proposal.missing_fields.join(', ')}.</p>}
    {!proposal.spec && <p className="import-flow__notice">Chưa có full proposed spec. Cần đọc summary với include_profile_details=true trước khi duyệt.</p>}
    {!hasBaseline && <p className="import-flow__notice">Chưa nhận được approved spec đúng profile và active version để so sánh. Không dùng version khác làm baseline; hãy tải lại đầy đủ hoặc nhờ BE/Owner kiểm tra.</p>}
    <div className="import-flow__profile-comparison">
      <section><h4>Spec đang được phê duyệt · {proposal.active_version ?? 'profile mới'}</h4>{approvedSpec ? <ReadOnlySpec value={approvedSpec} /> : <p>{proposal.active_version === null ? 'Profile mới, không có approved baseline.' : 'Chưa có baseline đúng version.'}</p>}</section>
      <section><h4>Full spec đề xuất · {proposal.proposal_revision}</h4>{proposal.spec && <ReadOnlySpec value={proposal.spec} />}</section>
    </div>
    <p className="import-flow__muted">Hiển thị toàn bộ spec và evidence được trả về; đây không phải computed diff của backend. Kiểm tra cả ngữ cảnh, identity, conversion, metadata và giá trị dùng chung.</p>
    {!canDecide ? <p className="import-flow__notice">Bạn không phải Owner của Store hiện tại. Đề xuất được giữ lại để Owner xem và quyết định.</p> : <fieldset disabled={busy} className="import-flow__form">
      <legend>Quyết định của Owner</legend>
      <label>Lý do quyết định<textarea maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
      <label className="import-flow__check"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} />Tôi đã xem toàn bộ proposed spec, evidence và approved baseline đúng version (nếu có).</label>
      <div className="import-flow__actions">
        <button type="button" disabled={!canApprove} onClick={() => onDecision({ decision: 'approve_activate', proposal_revision: proposal.proposal_revision, expected_active_version: proposal.active_version, reason: reason.trim() })}>Duyệt và kích hoạt profile</button>
        <button type="button" disabled={busy || !reason.trim()} onClick={() => onDecision({ decision: 'reject', proposal_revision: proposal.proposal_revision, reason: reason.trim() })}>Từ chối đề xuất</button>
        {proposal.active_version && <button type="button" disabled={busy || !reason.trim() || !reviewed} onClick={() => onDecision({ decision: 'retire', active_version: proposal.active_version!, reason: reason.trim() })}>Retire active version</button>}
      </div>
      <p className="import-flow__muted">Retire chặn các pin chưa commit dùng version này, không xóa completion đã ghi. Mỗi quyết định dùng lifecycle CAS riêng.</p>
    </fieldset>}
  </article>
}

function ReadOnlySpec({ value }: { value: unknown }) {
  if (value === null) return <span className="import-flow__muted">null</span>
  if (Array.isArray(value)) return value.length ? <ol className="import-flow__spec-list">{value.map((item, index) => <li key={index}><ReadOnlySpec value={item} /></li>)}</ol> : <span className="import-flow__muted">[]</span>
  if (typeof value === 'object') return <dl className="import-flow__spec">{Object.entries(value).map(([key, item]) => <div key={key}><dt>{key}</dt><dd><ReadOnlySpec value={item} /></dd></div>)}</dl>
  return <span>{String(value)}</span>
}
