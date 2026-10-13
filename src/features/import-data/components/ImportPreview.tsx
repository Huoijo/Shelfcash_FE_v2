import { ImportGuardHelp } from './ImportGuardHelp'
import { useState } from 'react'
import type { PreviewBundle, PreviewRow, SalesResolution, SupplierConfirmation, MappingSummary } from '../importFlow.types'
import { ImportPreviewExplorer } from './ImportPreviewExplorer'
import { previewDomainLabels } from './preview.labels'
import { FlowDialog } from '../../../shared/flow/FlowDialog'
import { RecordFacts } from '../../../shared/flow/RecordFacts'
import { Evidence } from './ImportMapping'

export function ImportPreview({ mapping,stage = 'all', bundle, busy, locked, blockers, reason, acknowledged, reviewReason, reviewAcknowledged, reviewBlockers,
  resolutions, supplierChanges, onReviewReason, onReviewAcknowledge, onConfirmReview, onResolutions, onSupplierChanges,
  onReason, onAcknowledge, onLoadMore, onCommit }: {
  mapping?:MappingSummary|null;stage?: 'all' | 'preview' | 'review'; bundle: PreviewBundle; busy: boolean; locked: boolean; blockers: string[]; reason: string; acknowledged: boolean
  reviewReason: string; reviewAcknowledged: boolean; reviewBlockers: string[]
  resolutions: SalesResolution[]; supplierChanges: SupplierConfirmation[]
  onReviewReason: (reason: string) => void; onReviewAcknowledge: (value: boolean) => void; onConfirmReview: () => void
  onResolutions: (resolutions: SalesResolution[]) => void; onSupplierChanges: (changes: SupplierConfirmation[]) => void
  onReason: (reason: string) => void; onAcknowledge: (value: boolean) => void; onLoadMore: () => void; onCommit: () => void
}) {
  const [confirmOpen,setConfirmOpen]=useState(false)
  const { summary, rows, rows_page: page } = bundle.preview
  return <>
    {stage !== 'review' && <>
    <ImportPreviewExplorer key={summary.preview_id} bundle={bundle} mapping={mapping} busy={busy} locked={locked} onLoadMore={onLoadMore}/>
    <details><summary>Snapshot và các nhóm thao tác từ máy chủ</summary><Evidence value={{preview_id:summary.preview_id,digest:summary.digest,source_set_version:summary.source_set_version,mapping_bindings:summary.mapping_bindings,created_at:summary.created_at}} label="Phiên bản và nguồn của snapshot"/><RecordFacts value={summary.groups}/></details>
    <details><summary>Bằng chứng đầy đủ và nguồn lồng nhau của các dòng đã tải</summary><RecordFacts value={rows.map(r=>({row_id:r.row_id,provenance:r.provenance,source_locations:r.source_locations,line_provenance:r.line_provenance,nested_provenance:r.nested_provenance,nested_references:r.nested_references,expected_version:r.expected_version,required_permissions:r.required_permissions,normalized_source_quantity:r.normalized_source_quantity}))}/></details>
    {bundle.configurations&&<details><summary>Cấu hình thuộc Preview hiện tại</summary><p>Đây là projection của Preview, không phải toàn bộ cấu hình Store.</p><RecordFacts value={bundle.configurations}/></details>}
    </>}
    {stage !== 'preview' && <>
    <header><h2>Kiểm tra trước khi nhập</h2><p>Bước 4/5 · Review xác nhận thay đổi sẽ ghi. Chưa ghi dữ liệu nghiệp vụ.</p></header>
    <div className="sc-preview-review-summary">{summary.groups.map(g=><div key={g.canonical_domain+g.required_write_action}><span>{previewDomainLabels[g.canonical_domain]}</span><strong>{g.row_count}</strong><small>{g.planned_insert_count} thêm · {g.planned_update_count} cập nhật · {g.no_op_count} không đổi · {g.blocked_count} chặn</small></div>)}</div>
    <section className="import-flow__card"><h3>Cần chú ý</h3><ImportGuardHelp codes={summary.blockers.map(n=>n.code)}/>{[...summary.blockers,...summary.warnings].map((n,i)=><p key={n.code+i}>{n.severity==='ERROR'?'Chặn':'Cảnh báo'}: {n.message}</p>)}{!summary.blockers.length&&!summary.warnings.length&&<p>Không có cảnh báo hoặc lỗi chặn toàn snapshot.</p>}</section>
    <section className="import-flow__card" aria-labelledby="import-review-title">
      <h3 id="import-review-title">1. Xác nhận đã review snapshot</h3>
      <p>Xác nhận này được lưu trên máy chủ cho đúng nguồn, mapping và preview. Chưa ghi dữ liệu nghiệp vụ.</p>
      {bundle.review_confirmation && <><p role="status">{bundle.confirmation_usable ? 'Đã có xác nhận review còn dùng được.' : 'Xác nhận cũ không còn dùng được; cần review lại.'}</p><Evidence value={bundle.review_confirmation} label="Biên nhận review từ máy chủ" /></>}
      <label htmlFor="import-review-reason">Lý do review (bắt buộc)</label>
      <textarea id="import-review-reason" value={reviewReason} disabled={busy || locked} maxLength={1000} onChange={(event) => onReviewReason(event.target.value)} />
      <label className="import-flow__check"><input type="checkbox" checked={reviewAcknowledged} disabled={busy || locked || !!page.next_cursor || bundle.preview.stale || (page.total_count !== null && rows.length !== page.total_count)} onChange={(event) => onReviewAcknowledge(event.target.checked)} /><span>Tôi đã đọc đủ các trang snapshot, ngữ cảnh nguồn, profile và cảnh báo.</span></label>
      {!!reviewBlockers.length && !bundle.confirmation_usable && <ul>{reviewBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>}
      <button type="button" disabled={busy || locked || !!reviewBlockers.length} onClick={onConfirmReview}>Lưu xác nhận review</button>
    </section>
    {rows.filter((row) => row.confirmation_required && ['REPLACE_DAILY_TOTAL', 'MERGE_DISJOINT_SALES'].includes(row.proposed_action)).map((row) =>
      <SalesConfirmation key={`${summary.preview_id}:${row.row_id}`} row={row} value={resolutions.find((item) => item.row_id === row.row_id)} disabled={busy || locked}
        onChange={(value) => onResolutions([...resolutions.filter((item) => item.row_id !== row.row_id), ...(value ? [value] : [])])} />)}
    {rows.filter((row) => row.confirmation_required && ['supplier_terms', 'payable_fees'].includes(row.canonical_domain ?? row.after?.domain ?? row.before?.domain ?? '')).map((row) =>
      <SupplierChange key={`${summary.preview_id}:${row.row_id}`} row={row} value={supplierChanges.find((item) => item.action_id === row.row_id)} disabled={busy || locked}
        onChange={(value) => onSupplierChanges([...supplierChanges.filter((item) => item.action_id !== row.row_id), ...(value ? [value] : [])])} />)}
    <section className="import-flow__card" aria-labelledby="import-commit-title">
      <h3 id="import-commit-title">2. Xác nhận ghi toàn bộ lô</h3>
      <p>Không ghi từng dòng riêng lẻ. Máy chủ sẽ kiểm tra lại quyền, profile, phiên bản và dữ liệu trước khi ghi.</p>
      <label htmlFor="import-commit-reason">Lý do (bắt buộc khi sửa / ghép dữ liệu hoặc kiểm kê)</label>
      <textarea id="import-commit-reason" value={reason} disabled={busy || locked} maxLength={1000} onChange={(event) => onReason(event.target.value)} />
      <label className="import-flow__check"><input type="checkbox" checked={acknowledged} disabled={busy || locked} onChange={(event) => onAcknowledge(event.target.checked)} /><span>Tôi đã kiểm tra snapshot, cảnh báo và phạm vi ghi toàn bộ lô.</span></label>
      {!!blockers.length && <div className="import-flow__notice" id="import-commit-blockers"><p>Chưa thể ghi dữ liệu:</p><ul>{blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul></div>}
      <p><button type="button" className="import-flow__primary" disabled={busy || locked || !!blockers.length || !acknowledged} aria-describedby={blockers.length ? 'import-commit-blockers' : undefined} onClick={() => setConfirmOpen(true)}>Ghi nguyên tử toàn bộ lô</button></p>
    </section>
    {confirmOpen&&<FlowDialog title="Ghi dữ liệu vào ShelfCash?" center onClose={()=>{if(!busy)setConfirmOpen(false)}} closeDisabled={busy} footer={<><button type="button" disabled={busy} onClick={()=>setConfirmOpen(false)}>Quay lại Review</button><button type="button" className="sc-flow-primary" disabled={busy||locked||!!blockers.length||!acknowledged||bundle.preview.stale} onClick={()=>{setConfirmOpen(false);onCommit()}}>Xác nhận ghi</button></>}><p>Thao tác này ghi nguyên tử toàn bộ lô đã qua Preview và Review vào cửa hàng hiện tại.</p><p>{summary.groups.length} nhóm thao tác · {page.total_count??'Chưa biết tổng'} dòng trong snapshot.</p><p>Nếu file hoặc mapping thay đổi, cần tạo lại Preview/Review.</p></FlowDialog>}
    </>}
  </>
}

function SalesConfirmation({ row, value, disabled, onChange }: {
  row: PreviewRow; value?: SalesResolution; disabled: boolean; onChange: (value: SalesResolution | null) => void
}) {
  const [businessKey, setBusinessKey] = useState('')
  const [evidence, setEvidence] = useState('')
  const [reason, setReason] = useState('')
  const [disjoint, setDisjoint] = useState(false)
  const merge = row.proposed_action === 'MERGE_DISJOINT_SALES'
  const id = `sales-${row.row_id}`
  return <fieldset className="import-flow__card" disabled={disabled}>
    <legend>{merge ? 'Xác nhận gộp nguồn doanh số không giao nhau' : 'Xác nhận thay thế tổng doanh số'} · {row.row_id}</legend>
    <p>Thao tác do preview xác định. Không nhập quantity override; bằng chứng phải ứng với đúng nguồn và ngày của dòng này.</p>
    <label htmlFor={`${id}-key`}>Report business key từ chứng từ nguồn<input id={`${id}-key`} value={businessKey} maxLength={1000} onChange={(event) => { setBusinessKey(event.target.value); onChange(null) }} /></label>
    <label htmlFor={`${id}-evidence`}>Tham chiếu bằng chứng<input id={`${id}-evidence`} value={evidence} maxLength={1000} onChange={(event) => { setEvidence(event.target.value); onChange(null) }} /></label>
    <label htmlFor={`${id}-reason`}>Lý do cho dòng này<textarea id={`${id}-reason`} value={reason} maxLength={1000} onChange={(event) => { setReason(event.target.value); onChange(null) }} /></label>
    {merge && <label className="import-flow__check"><input type="checkbox" checked={disjoint} onChange={(event) => { setDisjoint(event.target.checked); onChange(null) }} />Tôi xác nhận các nguồn không giao nhau, theo bằng chứng đã nhập.</label>}
    <button type="button" disabled={!businessKey.trim() || !evidence.trim() || !reason.trim() || merge && !disjoint} onClick={() => onChange({
      row_id: row.row_id, action: merge ? 'confirm_disjoint_merge' : 'replace_daily_total', report_business_key: businessKey.trim(),
      evidence_reference: evidence.trim(), reason: reason.trim(), disjoint_assertion: merge ? true : null,
    })}>{value ? 'Đã xác nhận dòng — cập nhật' : 'Xác nhận đúng dòng này'}</button>
    {value && <p role="status">Đã chuẩn bị xác nhận cho row_id này; chưa gửi commit.</p>}
  </fieldset>
}

function SupplierChange({ row, value, disabled, onChange }: {
  row: PreviewRow; value?: SupplierConfirmation; disabled: boolean; onChange: (value: SupplierConfirmation | null) => void
}) {
  const [reason, setReason] = useState('')
  const id = `supplier-${row.row_id}`
  return <fieldset className="import-flow__card" disabled={disabled}>
    <legend>Xác nhận thay đổi điều khoản/phí · {row.proposed_action}</legend>
    <p>Action ID: {row.row_id}. Xác nhận đúng logical action của preview, không dùng supplier/term ID thay thế.</p>
    <label htmlFor={`${id}-reason`}>Lý do thay đổi<textarea id={`${id}-reason`} value={reason} maxLength={1000} onChange={(event) => { setReason(event.target.value); onChange(null) }} /></label>
    <button type="button" disabled={!reason.trim()} onClick={() => onChange({ action_id: row.row_id, reason: reason.trim() })}>{value ? 'Đã xác nhận action — cập nhật' : 'Xác nhận thay đổi này'}</button>
    {value && <p role="status">Đã chuẩn bị xác nhận cho action này; chưa gửi commit.</p>}
  </fieldset>
}
