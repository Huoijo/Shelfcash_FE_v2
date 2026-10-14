import { DebugValue } from '../../../shared/debug/DevelopmentTools'
import { businessField } from '../importPresentation'
import { useContext, useState } from 'react'
import { ImportResolutionView } from '../importResolutionView.context'
import type { MappingIssue, MappingOptions, MappingResolution } from '../importFlow.types'

type Props = { issue: MappingIssue; options?: MappingOptions; disabled: boolean; onResolve: (resolution: MappingResolution) => void }
type SourceContext = Extract<MappingResolution, { kind: 'source_context' }>
type PeriodAmendment = { id: string; expected_version: string; effective_to: string; reason: string }

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const namespace = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/
const money = /^(0|[1-9][0-9]{0,17})(\.[0-9]{1,18})?$/
const positiveDecimal = (value: string) => value.length <= 200 && /^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value) && /[1-9]/.test(value)

export function ImportResolutionEditor(props: Props) {
  const { issue, options } = props
  return <>
    <DebugValue label="Resolution descriptor" value={{issue,options}} />
    {issue.issue_type === 'classification' && <ClassificationEditor {...props} />}
    {issue.issue_type === 'source_context' && <SourceContextEditor {...props} />}
    {issue.issue_type === 'identity' && <IdentityEditor {...props} />}
    {issue.issue_type === 'conversion' && <ConversionEditor {...props} />}
    {issue.issue_type === 'column' && <OptionalIgnoreEditor {...props} />}
    {issue.issue_type === 'schema_blocker' && <p className="import-flow__notice">Cần kiểm tra dữ liệu nguồn trước khi tiếp tục. Không tự thay dữ liệu thiếu thành 0.</p>}
    {options?.schema && options.options.some((field) => field.support === 'supported' && field.input_sources?.includes('shared_value') && field.allowed_shared_scopes?.length) && <SharedValueEditor {...props} options={options} />}
  </>
}

function ClassificationEditor({ options, disabled, onResolve }: Props) {
  const [schema, setSchema] = useState('')
  const [reason, setReason] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const ignored = schema === 'IGNORE'
  const selected = options?.schemas.find((entry) => entry.schema_id === schema)
  return <fieldset disabled={disabled} className="import-flow__form">
    <legend>Chọn loại dữ liệu cho Sheet</legend>
    <label>Loại dữ liệu<select value={schema} onChange={(event) => { setSchema(event.target.value); setAcknowledged(false) }}>
      <option value="">Chọn loại dữ liệu…</option>
      {options?.schemas.map((entry) => <option key={entry.schema_id} value={entry.schema_id}>{entry.label}</option>)}
      <option value="IGNORE">Không nhập dữ liệu của Sheet này</option>
    </select></label>
    {selected && <p>{selected.description}</p>}
    {!options && <p className="import-flow__muted">Đang tải các loại dữ liệu có thể chọn.</p>}
    <label>Lý do phân loại hoặc bỏ qua<textarea maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
    {ignored && <label className="import-flow__check"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />Tôi xác nhận toàn bộ Sheet này không tham gia import. Thao tác làm mất hiệu lực Preview/review hiện tại.</label>}

    <button type="button" disabled={disabled || !reason.trim() || (!selected && !ignored) || (ignored && !acknowledged)} onClick={() => onResolve({ kind: 'sheet_type', sheet_type: ignored ? null : selected!.schema_id, ignored, acknowledgment: ignored && acknowledged, reason: reason.trim() })}>Lưu loại dữ liệu</button>
  </fieldset>
}

function SourceContextEditor({ disabled, onResolve }: Props) {
  const [source, setSource] = useState('')
  const [report, setReport] = useState('')
  const [evidence, setEvidence] = useState('')
  const [sales, setSales] = useState<NonNullable<SourceContext['sales_semantics']> | ''>('')
  const [inventory, setInventory] = useState<NonNullable<SourceContext['inventory_semantics']> | ''>('')
  const [decimal, setDecimal] = useState<NonNullable<SourceContext['decimal_locale']> | ''>('')
  const [date, setDate] = useState<NonNullable<SourceContext['date_format']> | ''>('')
  const [expiry, setExpiry] = useState(false)
  const [expiryEvidence, setExpiryEvidence] = useState('')
  const [terms, setTerms] = useState<PeriodAmendment[]>([])
  const [fees, setFees] = useState<PeriodAmendment[]>([])
  const validAmendments = (items: PeriodAmendment[]) => items.every((item) => uuid.test(item.id) && item.expected_version.trim() && item.expected_version.length <= 128 && /^\d{4}-\d{2}-\d{2}$/.test(item.effective_to) && item.reason.trim()) && new Set(items.map((item) => item.id)).size === items.length
  const valid = namespace.test(source) && namespace.test(report) && !!evidence.trim() && (!expiry || !!expiryEvidence.trim()) && validAmendments(terms) && validAmendments(fees)
  function submit() {
    const resolution: SourceContext = {
      kind: 'source_context', source_system_key: source, report_type: report, evidence_reference: evidence.trim(),
      ...(sales ? { sales_semantics: sales } : {}), ...(inventory ? { inventory_semantics: inventory } : {}),
      ...(decimal ? { decimal_locale: decimal } : {}), ...(date ? { date_format: date } : {}),
      ...(expiry ? { planned_arrival_expiry_rule: { basis: 'ARRIVAL_PLUS_DECLARED_SHELF_LIFE_DAYS', evidence_reference: expiryEvidence.trim() } } : {}),
      term_period_amendments: terms.map((item) => ({ supplier_term_id: item.id, expected_version: item.expected_version.trim(), effective_to: item.effective_to, reason: item.reason.trim() })),
      fee_period_amendments: fees.map((item) => ({ fee_id: item.id, expected_version: item.expected_version.trim(), effective_to: item.effective_to, reason: item.reason.trim() })),
    }
    onResolve(resolution)
  }
  return <fieldset disabled={disabled} className="import-flow__form">
    <legend>Khai báo ngữ cảnh nguồn</legend>
    <div className="import-flow__form-grid">
      <label>Hệ thống nguồn<input maxLength={128} value={source} onChange={(event) => setSource(event.target.value)} placeholder="Mã từ hệ thống xuất dữ liệu" /></label>
      <label>Loại báo cáo<input maxLength={128} value={report} onChange={(event) => setReport(event.target.value)} /></label>
    </div>
    <p className="import-flow__muted">Dùng mã nguồn báo cáo đã được thống nhất với cửa hàng.</p>
    <EvidenceInput value={evidence} onChange={setEvidence} />
    <details><summary>Semantics và định dạng nguồn (chỉ khai báo khi đã biết)</summary>
      <div className="import-flow__form-grid">
        <label>Doanh số<select value={sales} onChange={(event) => setSales(event.target.value as typeof sales)}><option value="">Không khai báo</option><option value="daily_total">Tổng theo ngày</option><option value="disjoint_contribution">Phần đóng góp không trùng</option></select></label>
        <label>Kiểm kho<select value={inventory} onChange={(event) => setInventory(event.target.value as typeof inventory)}><option value="">Không khai báo</option><option value="lot_stock_count">Số đếm theo lô</option></select></label>
        <label>Dấu thập phân<select value={decimal} onChange={(event) => setDecimal(event.target.value as typeof decimal)}><option value="">Không khai báo</option><option value="dot">Dấu chấm</option><option value="comma">Dấu phẩy</option></select></label>
        <label>Ngày nguồn<select value={date} onChange={(event) => setDate(event.target.value as typeof date)}><option value="">Không khai báo</option><option value="ISO">ISO · YYYY-MM-DD</option><option value="DMY_SLASH">DD/MM/YYYY</option><option value="MDY_SLASH">MM/DD/YYYY</option><option value="EXCEL_SERIAL">Ngày dạng số Excel</option></select></label>

      </div>
      <p className="import-flow__muted">Giá và MOQ cần có cơ sở tính rõ ràng.</p>
      <label className="import-flow__check"><input type="checkbox" checked={expiry} onChange={(event) => setExpiry(event.target.checked)} />Khai báo expiry từ ngày nhận dự kiến + số ngày shelf-life đã được khai báo.</label>
      {expiry && <EvidenceInput label="Bằng chứng quy tắc expiry" value={expiryEvidence} onChange={setExpiryEvidence} />}
    </details>
    <details><summary>Amendment kỳ hạn/fee (cần Owner review policy)</summary>
      <p className="import-flow__muted">Không tự động đóng kỳ lịch sử.</p>
      <PeriodAmendments label="Supplier term" items={terms} onChange={setTerms} />
      <PeriodAmendments label="Payable fee" items={fees} onChange={setFees} />
    </details>
    <button type="button" disabled={disabled || !valid} onClick={submit}>Lưu ngữ cảnh nguồn</button>
  </fieldset>
}

function PeriodAmendments({ label, items, onChange }: { label: string; items: PeriodAmendment[]; onChange: (items: PeriodAmendment[]) => void }) {
  function update(index: number, patch: Partial<PeriodAmendment>) { onChange(items.map((item, at) => at === index ? { ...item, ...patch } : item)) }
  return <section className="import-flow__amendments"><h4>{label}</h4>
    {items.map((item, index) => <div key={index} className="import-flow__field-info">
      <div className="import-flow__form-grid">
        <label>{label} ID (UUID)<input value={item.id} maxLength={36} onChange={(event) => update(index, { id: event.target.value })} /></label>
        <label>Phiên bản hiện tại<input value={item.expected_version} maxLength={128} onChange={(event) => update(index, { expected_version: event.target.value })} /></label>
        <label>Ngày cuối kỳ<input type="date" value={item.effective_to} onChange={(event) => update(index, { effective_to: event.target.value })} /></label>
        <label>Lý do<textarea maxLength={1000} value={item.reason} onChange={(event) => update(index, { reason: event.target.value })} /></label>
      </div><button type="button" onClick={() => onChange(items.filter((_, at) => at !== index))}>Bỏ amendment {index + 1}</button>
    </div>)}
    <button type="button" onClick={() => onChange([...items, { id: '', expected_version: '', effective_to: '', reason: '' }])}>Thêm amendment {label}</button>
  </section>
}

function IdentityEditor({ disabled, onResolve }: Props) {
  const view=useContext(ImportResolutionView)
  const [mode, setMode] = useState<'existing' | 'new'>(view.identityMode)
  const [canonicalId, setCanonicalId] = useState('')
  const [entity, setEntity] = useState<'product' | 'ingredient' | 'supplier'>('product')
  const [businessKey, setBusinessKey] = useState('')
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [active, setActive] = useState<boolean | null>(null)
  const [expiry, setExpiry] = useState<boolean | null>(null)
  const [evidence, setEvidence] = useState('')
  const canPropose = businessKey.trim() && name.trim() && evidence.trim() && active !== null && (entity === 'supplier' || unit.trim()) && (entity !== 'ingredient' || expiry !== null) && (entity !== 'product' || price === '' || money.test(price))
  function submitNew() {
    const shared = { kind: 'new_entity_proposal' as const, source_business_key: businessKey, evidence_reference: evidence.trim() }
    if (entity === 'supplier') onResolve({ ...shared, entity, metadata: { name: name.trim(), active: active! } })
    else if (entity === 'ingredient') onResolve({ ...shared, entity, metadata: { name: name.trim(), base_unit: unit.trim(), sku: sku.trim() || null, expiry_tracking: expiry!, active: active! } })
    else onResolve({ ...shared, entity, metadata: { name: name.trim(), selling_unit: unit.trim(), sku: sku.trim() || null, price: price || null, active: active! } })
  }
  return <fieldset disabled={disabled} className="import-flow__form">
    <legend>Xác nhận đối tượng</legend>
    <label>Cách xử lý<select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}><option value="existing">Gắn đối tượng đã có trong cửa hàng</option><option value="new">Đề xuất tạo đối tượng mới</option></select></label>
    <p className="import-flow__muted">Chọn đúng đối tượng thuộc cửa hàng.</p>
    {mode === 'existing' ? <>
      <label>Mã đối tượng<input value={canonicalId} maxLength={36} onChange={(event) => setCanonicalId(event.target.value)} /></label>
      <button type="button" disabled={disabled || !uuid.test(canonicalId)} onClick={() => onResolve({ kind: 'identity_binding', canonical_id: canonicalId })}>Lưu liên kết đối tượng</button>
    </> : <>
      <label>Loại đối tượng<select value={entity} onChange={(event) => setEntity(event.target.value as typeof entity)}><option value="product">Món</option><option value="ingredient">Nguyên liệu</option><option value="supplier">Nhà cung cấp</option></select></label>
      <label>Mã chính xác trong nguồn<input maxLength={1000} value={businessKey} onChange={(event) => setBusinessKey(event.target.value)} /></label>
      <div className="import-flow__form-grid">
        <label>Tên<input maxLength={200} value={name} onChange={(event) => setName(event.target.value)} /></label>
        {entity !== 'supplier' && <><label>{entity === 'ingredient' ? 'Base unit' : 'Selling unit'}<input maxLength={32} value={unit} onChange={(event) => setUnit(event.target.value)} /></label><label>SKU (không bắt buộc)<input maxLength={64} value={sku} onChange={(event) => setSku(event.target.value)} /></label></>}
        {entity === 'product' && <label>Giá (để trống nếu chưa xác định)<input inputMode="decimal" value={price} maxLength={37} onChange={(event) => setPrice(event.target.value)} /></label>}
        <label>Trạng thái<select value={active === null ? '' : String(active)} onChange={(event) => setActive(event.target.value === '' ? null : event.target.value === 'true')}><option value="">Chọn rõ trạng thái…</option><option value="true">Đang dùng</option><option value="false">Không hoạt động</option></select></label>
        {entity === 'ingredient' && <label>Theo dõi hạn sử dụng<select value={expiry === null ? '' : String(expiry)} onChange={(event) => setExpiry(event.target.value === '' ? null : event.target.value === 'true')}><option value="">Chọn rõ trạng thái…</option><option value="true">Có</option><option value="false">Không</option></select></label>}
      </div>
      <EvidenceInput value={evidence} onChange={setEvidence} />
      <p className="import-flow__muted">Đề xuất đối tượng mới cần Owner duyệt.</p>
      <button type="button" disabled={disabled || !canPropose} onClick={submitNew}>Lưu đề xuất đối tượng mới</button>
    </>}
  </fieldset>
}

function ConversionEditor({ issue, disabled, onResolve }: Props) {
  const [numerator, setNumerator] = useState('')
  const [denominator, setDenominator] = useState('')
  const [evidence, setEvidence] = useState('')
  const from = issue.source_header
  const to = issue.samples.at(-1)
  return <fieldset disabled={disabled} className="import-flow__form">
    <legend>Khai báo quy đổi chính xác</legend>
    <p>Đơn vị nguồn: <strong>{from ?? 'Chưa có'}</strong> → đơn vị đích: <strong>{to ?? 'Chưa có'}</strong></p>
    <div className="import-flow__form-grid">
      <label>Tử số (decimal text &gt; 0)<input maxLength={200} inputMode="decimal" value={numerator} onChange={(event) => setNumerator(event.target.value)} /></label>
      <label>Mẫu số (decimal text &gt; 0)<input maxLength={200} inputMode="decimal" value={denominator} onChange={(event) => setDenominator(event.target.value)} /></label>
    </div>
    <EvidenceInput value={evidence} onChange={setEvidence} />
    <p className="import-flow__muted">Tỉ lệ = tử số / mẫu số. Không tự làm tròn.</p>
    <button type="button" disabled={disabled || !from || !to || from.length > 32 || to.length > 32 || !positiveDecimal(numerator) || !positiveDecimal(denominator) || !evidence.trim()} onClick={() => onResolve({ kind: 'declared_conversion', from_unit: from!, to_unit: to!, factor: { numerator, denominator }, evidence_reference: evidence.trim() })}>Lưu quy đổi</button>
  </fieldset>
}

function OptionalIgnoreEditor({ disabled, onResolve }: Props) {
  const [evidence, setEvidence] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  return <details><summary>Bỏ qua cột nguồn không bắt buộc</summary>
    <fieldset disabled={disabled} className="import-flow__form">
      <legend>Bỏ qua cột không bắt buộc</legend>
      <p className="import-flow__muted">Không bỏ qua dữ liệu bắt buộc. Đề xuất này vẫn cần Owner duyệt.</p>
      <EvidenceInput value={evidence} onChange={setEvidence} />
      <label className="import-flow__check"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />Tôi xác nhận cột này không chứa dữ kiện bắt buộc cần nhập.</label>
      <button type="button" disabled={disabled || !evidence.trim() || !acknowledged} onClick={() => onResolve({ kind: 'ignored_optional_field', evidence_reference: evidence.trim() })}>Lưu đề xuất bỏ qua cột</button>
    </fieldset>
  </details>
}

function SharedValueEditor({ issue, options, disabled, onResolve }: Props & { options: MappingOptions }) {
  const view=useContext(ImportResolutionView)
  const [expanded,setExpanded]=useState(view.sharedValueExpanded)
  const [target, setTarget] = useState('')
  const [scope, setScope] = useState<'PROFILE_CONSTANT' | 'IMPORT_VALUE' | ''>('')
  const [kind, setKind] = useState<'string' | 'boolean' | 'integer' | 'null' | ''>('')
  const [text, setText] = useState('')
  const [boolean, setBoolean] = useState<'true' | 'false' | ''>('')
  const [evidence, setEvidence] = useState('')
  const [replace, setReplace] = useState(false)
  const [index, setIndex] = useState(issue.source_location.source_column_index === null || issue.source_location.source_column_index === undefined ? '' : String(issue.source_location.source_column_index))
  const [acknowledged, setAcknowledged] = useState(false)
  const fields = options.options.filter((field) => field.support === 'supported' && field.input_sources?.includes('shared_value') && field.allowed_shared_scopes?.length)
  const selected = fields.find((field) => field.key === target)
  const numeric = /^-?(0|[1-9][0-9]*)$/.test(text) ? Number(text) : NaN
  const validValue = kind === 'string' ? !!text.trim() && text.length <= 1000 : kind === 'boolean' ? boolean !== '' : kind === 'integer' ? Number.isInteger(numeric) && numeric >= -2147483648 && numeric <= 2147483647 : kind === 'null' ? selected?.nullable === true : false
  const validReplace = !replace || (/^(0|[1-9][0-9]*)$/.test(index) && Number(index) <= 255 && acknowledged)
  const valid = selected && scope && selected.allowed_shared_scopes?.includes(scope) && validValue && validReplace && evidence.trim()
  function submit() {
    const value = kind === 'null' ? null : kind === 'boolean' ? boolean === 'true' : kind === 'integer' ? numeric : text
    if (scope) onResolve({ kind: 'shared_value', target_field: target, scope, value, evidence_reference: evidence.trim(), ...(replace ? { replace_source_column_index: Number(index), acknowledgment: acknowledged } : {}) })
  }
  return <details open={expanded} onToggle={event=>setExpanded(event.currentTarget.open)}><summary>Khai báo giá trị dùng chung / giá trị riêng lần import</summary>
    <fieldset disabled={disabled} className="import-flow__form">
      <legend>Nguồn giá trị cho trường</legend>
      <label>Trường đích<select value={target} onChange={(event) => { setTarget(event.target.value); setScope(''); setKind(''); setText(''); setBoolean('') }}><option value="">Chọn trường dữ liệu…</option>{fields.map((field) => <option key={field.key} value={field.key}>{field.label || businessField(field.key)}</option>)}</select></label>
      {selected && <p className="import-flow__muted">{selected.nullable ? 'Cho phép null' : 'Không cho phép null'}{selected.unit_semantics ? ` · ${selected.unit_semantics}` : ''}. {selected.input_help || selected.description}</p>}
      <label>Phạm vi<select value={scope} onChange={(event) => setScope(event.target.value as typeof scope)}><option value="">Chọn phạm vi…</option>{selected?.allowed_shared_scopes?.map((entry) => <option key={entry} value={entry}>{entry === 'PROFILE_CONSTANT' ? 'Hằng số profile — cần Owner duyệt' : 'Giá trị của riêng lần import — phải khai báo lại'}</option>)}</select></label>
      <div className="import-flow__form-grid">
        <label>Kiểu giá trị<select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}><option value="">Chọn rõ kiểu…</option><option value="string">Văn bản, ngày hoặc số thập phân</option><option value="boolean">Có / Không</option><option value="integer">Số nguyên</option><option value="null" disabled={!selected?.nullable}>Chưa xác định</option></select></label>
        {(kind === 'string' || kind === 'integer') && <label>Giá trị<input maxLength={kind === 'string' ? 1000 : 11} inputMode={kind === 'integer' ? 'numeric' : 'text'} value={text} onChange={(event) => setText(event.target.value)} /></label>}
        {kind === 'boolean' && <label>Giá trị<select value={boolean} onChange={(event) => setBoolean(event.target.value as typeof boolean)}><option value="">Chọn…</option><option value="true">Có</option><option value="false">Không</option></select></label>}
      </div>
      <p className="import-flow__muted">Không, 0 và chưa xác định là ba giá trị khác nhau.</p>
      <label className="import-flow__check"><input type="checkbox" checked={replace} onChange={(event) => { setReplace(event.target.checked); setAcknowledged(false) }} />Dùng giá trị khai báo thay cho cột nguồn</label>
      {selected && !selected.available && <p className="import-flow__notice">Trường này đang lấy dữ liệu từ cột nguồn. Xác nhận chuyển nguồn nếu muốn dùng giá trị khai báo.</p>}
      {replace && <><label>Source column index chính xác (zero-based 0–255)<input inputMode="numeric" value={index} maxLength={3} onChange={(event) => setIndex(event.target.value)} /></label><label className="import-flow__check"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />Tôi xác nhận thay nguồn của đúng cột này; dữ liệu cột không còn là nguồn cho trường đích.</label></>}
      <EvidenceInput value={evidence} onChange={setEvidence} />
      <button type="button" disabled={disabled || !valid} onClick={submit}>Lưu giá trị đã khai báo</button>
    </fieldset>
  </details>
}

function EvidenceInput({ label = 'Bằng chứng / tham chiếu nguồn', value, onChange }: { label?: string; value: string; onChange: (value: string) => void }) {
  return <label>{label}<textarea maxLength={1000} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Tham chiếu tài liệu, báo cáo hoặc căn cứ xác nhận dữ liệu" /></label>
}
