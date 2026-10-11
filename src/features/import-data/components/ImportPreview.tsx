import { useState } from 'react'
import type { PreviewBundle, PreviewRow, SalesResolution, SupplierConfirmation } from '../importFlow.types'
import { Evidence } from './ImportMapping'

export function ImportPreview({ bundle, busy, locked, blockers, reason, acknowledged, reviewReason, reviewAcknowledged, reviewBlockers,
  resolutions, supplierChanges, onReviewReason, onReviewAcknowledge, onConfirmReview, onResolutions, onSupplierChanges,
  onReason, onAcknowledge, onLoadMore, onCommit }: {
  bundle: PreviewBundle; busy: boolean; locked: boolean; blockers: string[]; reason: string; acknowledged: boolean
  reviewReason: string; reviewAcknowledged: boolean; reviewBlockers: string[]
  resolutions: SalesResolution[]; supplierChanges: SupplierConfirmation[]
  onReviewReason: (reason: string) => void; onReviewAcknowledge: (value: boolean) => void; onConfirmReview: () => void
  onResolutions: (resolutions: SalesResolution[]) => void; onSupplierChanges: (changes: SupplierConfirmation[]) => void
  onReason: (reason: string) => void; onAcknowledge: (value: boolean) => void; onLoadMore: () => void; onCommit: () => void
}) {
  const { summary, rows, rows_page: page } = bundle.preview
  return <>
    <h2>Preview dữ liệu canonical</h2>
    <p>Snapshot chỉ đọc · Toàn bộ lô được ghi nguyên tử sau khi bạn xác nhận. Preview chưa ghi dữ liệu nghiệp vụ.</p>
    <p className="import-flow__muted">Preview: {summary.preview_id} · Policy: {summary.policy_version} · {summary.validation_status}</p>
    <Evidence value={{ digest: summary.digest, source_set_version: summary.source_set_version, mapping_bindings: summary.mapping_bindings, created_at: summary.created_at }} label="Phiên bản và nguồn của snapshot" />
    <div className="import-flow__table-scroll" tabIndex={0} role="region" aria-label="Nhóm thay đổi toàn lô">
      <table>
        <caption>Nhóm thay đổi toàn snapshot từ máy chủ — không tính từ trang dòng đang hiển thị</caption>
        <thead><tr><th scope="col">Nhóm</th><th scope="col">Quyền ghi</th><th scope="col">Dòng</th><th scope="col">Thêm</th><th scope="col">Cập nhật</th><th scope="col">Không đổi</th><th scope="col">Bị chặn</th></tr></thead>
        <tbody>{summary.groups.map((group) => <tr key={`${group.canonical_domain}:${group.required_write_action}`}><th scope="row">{group.canonical_domain}</th><td>{group.required_write_action}</td><td>{group.row_count}</td><td>{group.planned_insert_count}</td><td>{group.planned_update_count}</td><td>{group.no_op_count}</td><td>{group.blocked_count}</td></tr>)}</tbody>
      </table>
    </div>
    <Evidence value={summary.counts} label="Số lượng phân loại từ máy chủ" />
    {!!summary.blockers.length && <Evidence value={summary.blockers} label={`Lỗi chặn (${summary.blockers.length})`} />}
    {!!summary.warnings.length && <Evidence value={summary.warnings} label={`Cảnh báo (${summary.warnings.length})`} />}
    <div className="import-flow__table-scroll" tabIndex={0} role="region" aria-label="Các dòng Preview">
      <table>
        <caption>Dòng Preview đã đọc: {rows.length}; tổng trong snapshot: {page.total_count ?? 'Chưa biết'}. Giá trị giữ nguyên chuỗi chính xác; null không phải 0.</caption>
        <thead><tr><th scope="col">Nguồn</th><th scope="col">Phân loại / Thao tác</th><th scope="col">Trước</th><th scope="col">Sau</th><th scope="col">Thay đổi / Bằng chứng</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.row_id}>
          <th scope="row">{row.row_id}<Evidence value={row.source_location} label="Vị trí nguồn" /></th>
          <td>{row.classification}<br />{row.proposed_action}{row.confirmation_required && <p>Cần xác nhận</p>}</td>
          <td><pre>{JSON.stringify(row.before, null, 2)}</pre></td>
          <td><pre>{JSON.stringify(row.after, null, 2)}</pre></td>
          <td><Evidence value={{ changes: row.changes, entity_refs: row.entity_refs, provenance: row.provenance, source_locations: row.source_locations,
            line_provenance: row.line_provenance, nested_provenance: row.nested_provenance, nested_references: row.nested_references,
            dependencies: row.dependencies, canonical_domain: row.canonical_domain, target_reserved_or_existing_id: row.target_reserved_or_existing_id,
            expected_version: row.expected_version, normalized_source_quantity: row.normalized_source_quantity, required_permissions: row.required_permissions,
            blockers: row.blockers, warnings: row.warnings }} label="Xem thay đổi, nguồn lồng nhau và provenance" />{!!row.unsupportedFields.length && <p>Chưa hỗ trợ: {row.unsupportedFields.join(', ')}</p>}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {page.next_cursor && <p><button type="button" disabled={busy || locked} onClick={onLoadMore}>Xem thêm dòng Preview</button></p>}
    {bundle.configurations && <Evidence value={bundle.configurations} label="Cấu hình của các trang preview đã đọc — không phải toàn bộ cấu hình Store" />}
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
      <p><button type="button" className="import-flow__primary" disabled={busy || locked || !!blockers.length || !acknowledged} aria-describedby={blockers.length ? 'import-commit-blockers' : undefined} onClick={onCommit}>Ghi nguyên tử toàn bộ lô</button></p>
    </section>
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
