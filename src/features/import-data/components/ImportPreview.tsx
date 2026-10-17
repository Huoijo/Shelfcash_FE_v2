import { ImportHistoryCorrections } from './ImportHistoryCorrections'
import { DebugContent, DebugValue } from '../../../shared/debug/DevelopmentTools'
import { importMessage } from '../importPresentation'
import { ImportGuardHelp } from './ImportGuardHelp'
import type { PreviewBundle, SalesResolution, SupplierConfirmation, MappingSummary } from '../importFlow.types'
import { ImportPreviewExplorer } from './ImportPreviewExplorer'
import { previewDomainLabels } from './preview.labels'
import {ImportActionBar} from './ImportActionBar'
import {ImportDomainReview} from './ImportDomainReview'
import {importDomainBlockers} from '../importDomainReview'
import { commitReasonRequired } from '../importCommitReason'
import { Evidence } from './ImportMapping'
import { ImportWriteComposition } from './ImportVisualIntelligence'

export function ImportPreview({ mapping,stage = 'all', showStaleNotice=true, bundle, busy, locked, blockers, reason, acknowledged, reviewReason, reviewAcknowledged, reviewBlockers,
  resolutions, supplierChanges, historyCorrections = [], onHistoryCorrections, onReviewReason, onReviewAcknowledge, onConfirmReview, onResolutions, onSupplierChanges,
  onReason, onAcknowledge, onLoadMore, onCommit, onBack }: {
  onBack?:()=>void; showStaleNotice?:boolean;mapping?:MappingSummary|null;stage?: 'all' | 'preview' | 'review'; bundle: PreviewBundle; busy: boolean; locked: boolean; blockers: string[]; reason: string; acknowledged: boolean
  reviewReason: string; reviewAcknowledged: boolean; reviewBlockers: string[]
  resolutions: SalesResolution[]; supplierChanges: SupplierConfirmation[]; historyCorrections?: import('../importFlow.types').HistoryCorrection[]; onHistoryCorrections?: (values: import('../importFlow.types').HistoryCorrection[]) => void
  onReviewReason: (reason: string) => void; onReviewAcknowledge: (value: boolean) => void; onConfirmReview: () => void
  onResolutions: (resolutions: SalesResolution[]) => void; onSupplierChanges: (changes: SupplierConfirmation[]) => void
  onReason: (reason: string) => void; onAcknowledge: (value: boolean) => void; onLoadMore: () => void; onCommit: () => void
}) {
  const { summary, rows, rows_page: page } = bundle.preview
  const domainBlocked=!!importDomainBlockers(bundle,resolutions,supplierChanges,historyCorrections).length
  const commitLocked=busy||locked||!bundle.confirmation_usable||domainBlocked
  const reasonRequired = commitReasonRequired(bundle)
  return <>
    {stage !== 'review' && <>
    <ImportPreviewExplorer showStaleNotice={showStaleNotice} key={summary.preview_id} bundle={bundle} mapping={mapping} busy={busy} locked={locked} onLoadMore={onLoadMore}/>
    <ImportHistoryCorrections bundle={bundle} values={historyCorrections} onChange={onHistoryCorrections} disabled={busy||locked} />
    <ImportDomainReview historyCorrections={historyCorrections} bundle={bundle} resolutions={resolutions} supplierChanges={supplierChanges} disabled={busy||locked} onResolutions={onResolutions} onSupplierChanges={onSupplierChanges}/>
    <DebugValue label="Preview response / configurations" value={bundle} />
    </>}
    {stage !== 'preview' && <>
    <header className="input-section-title"><h2>Xác nhận nhập dữ liệu</h2><p>Đây là quyết định ghi dữ liệu business. Dữ liệu chỉ được ghi sau khi bạn xác nhận.</p></header>
    {/* MAGICPATH DENSITY NORMALIZATION: one action rail; domain totals add scope. */}
    <ImportWriteComposition summary={summary}/>
    <div className="sc-preview-review-summary">{summary.groups.map(g=><div key={g.canonical_domain+g.required_write_action}><span>{previewDomainLabels[g.canonical_domain]}</span><strong>{g.row_count} dòng</strong><details><summary>Hành động trong nhóm</summary><small>{g.planned_insert_count} thêm · {g.planned_update_count} cập nhật · {g.no_op_count} không đổi · {g.blocked_count} chặn</small></details></div>)}</div>
    {!!(summary.blockers.length || summary.warnings.length) && <section className="import-flow__card"><h3>Cần chú ý</h3><ImportGuardHelp codes={summary.blockers.map(n=>n.code)}/>{[...summary.blockers,...summary.warnings].map((n,i)=><p key={n.code+i}>{n.severity==='ERROR'?'Chặn':'Cảnh báo'}: {importMessage(n.code,n.message)}</p>)}</section>}
    {[...blockers,...reviewBlockers].some(value=>/quyền|Quyền/.test(value)) && <section className="input-status" role="alert"><strong>Không đủ quyền ghi dữ liệu</strong><p>Owner profile approval và Staff commit permission là hai quyết định khác nhau.</p></section>}
    <section className="import-flow__card" aria-labelledby="import-review-title">
      <header><h3 id="import-review-title">1. Xác nhận đã kiểm tra dữ liệu</h3><span>{bundle.confirmation_usable?'Đã xác nhận':domainBlocked?'Đang khóa':busy?'Đang lưu':'Chưa xác nhận'}</span></header>
      {bundle.review_confirmation && <><p role="status">{bundle.confirmation_usable ? 'Review đã xác nhận.' : 'Cần kiểm tra lại Preview.'}</p><div className="input-review-receipt"><strong>{bundle.review_confirmation.reason}</strong><small>{bundle.review_confirmation.confirmed_at}</small></div><Evidence value={bundle.review_confirmation} label="Biên nhận review từ máy chủ" /></>}
      <label htmlFor="import-review-reason">Lý do review (bắt buộc)</label>
      <textarea id="import-review-reason" value={reviewReason} disabled={busy || locked || domainBlocked || bundle.confirmation_usable} maxLength={1000} onChange={(event) => onReviewReason(event.target.value)} />
      <label className="import-flow__check"><input type="checkbox" checked={reviewAcknowledged} disabled={busy || locked || domainBlocked || bundle.confirmation_usable || !!page.next_cursor || bundle.preview.stale || (page.total_count !== null && rows.length !== page.total_count)} onChange={(event) => onReviewAcknowledge(event.target.checked)} /><span>Tôi đã đọc đủ dữ liệu, nguồn báo cáo, cách đọc và cảnh báo.</span></label>
      {!!reviewBlockers.length && !bundle.confirmation_usable && <DebugContent><ul>{reviewBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul></DebugContent>}
      <button type="button" disabled={busy || locked || domainBlocked || bundle.confirmation_usable || !!reviewBlockers.length} onClick={onConfirmReview}>Xác nhận đã kiểm tra</button>
    </section>
    <section className="import-flow__card" aria-labelledby="import-commit-title">
      <header><h3 id="import-commit-title">2. Xác nhận ghi toàn bộ lô</h3><span>{bundle.confirmation_usable&&!locked?'Sẵn sàng':'Đang khóa'}</span></header>
      {!bundle.confirmation_usable&&<p className="input-status">Cần xác nhận Review được lưu thành công trước khi nhập dữ liệu.</p>}
      <p>Quyền nhập dữ liệu sẽ được kiểm tra lại trước khi ghi.</p>
      <label htmlFor="import-commit-reason">Lý do nhập dữ liệu ({reasonRequired ? 'bắt buộc' : 'không bắt buộc'})</label>
      <textarea id="import-commit-reason" value={reason} required={reasonRequired} disabled={commitLocked} maxLength={1000} onChange={(event) => onReason(event.target.value)} />
      <label className="import-flow__check"><input type="checkbox" checked={acknowledged} disabled={commitLocked} onChange={(event) => onAcknowledge(event.target.checked)} /><span>Tôi đã kiểm tra dữ liệu, cảnh báo và phạm vi nhập.</span></label>
      {!!blockers.length && <DebugContent><div className="import-flow__notice" id="import-commit-blockers"><p>Chưa thể ghi dữ liệu:</p><ul>{blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul></div></DebugContent>}
    </section>
    <ImportActionBar back={onBack} backLabel="Quay lại Preview"><button type="button" className="input-primary import-flow__primary" disabled={commitLocked||!!blockers.length||!acknowledged||(reasonRequired&&!reason.trim())||bundle.preview.stale} onClick={onCommit}>Xác nhận và nhập dữ liệu</button></ImportActionBar>
    </>}
  </>
}
