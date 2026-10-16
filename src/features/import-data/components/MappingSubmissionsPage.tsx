import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AppShellHeader } from '../../../layouts/app-shell/AppShell'
import { useCurrentStore } from '../../store/store.context'
import { RequestedStore } from '../../store/RequestedStore'
import { useAuth } from '../../auth/auth.context'
import { capabilitiesApi, capabilityError, useCapabilityMutation, useCapabilityQuery } from '../../backend-capabilities/capabilities.react'
import type { WireMappingSubmission, WireSourceEvidenceCell, WireStaffMembership } from '../../backend-capabilities/capabilities.wire'
import { ImportProfileSpecification } from './ImportProfileSpecification'
import { ImportBusinessFacts } from './ImportBusinessFacts'
import { FlowDialog } from '../../../shared/flow/FlowDialog'
import { isImportUuid } from '../importData.validation'
import { canRequestStaffChanges, submissionStateLabel } from '../importSubmission.policy'
import './ImportFlow.css'
import '../../notifications/NotificationsPage.css'

export function MappingSubmissionsPage() {
  const { state, currentStoreId } = useCurrentStore(), [params, setParams] = useSearchParams()
  const requested = params.get('store_id'), selected = params.get('submission_id'), expectedVersion = params.get('submission_version')
  const role = state.status === 'ready' || state.status === 'mock_preview' ? state.store.membership.role : null
  const resetTarget = () => { const next = new URLSearchParams(params); next.delete('store_id'); next.delete('submission_id'); next.delete('submission_version'); setParams(next) }
  if (requested && requested !== currentStoreId) return <><AppShellHeader><span>Đề xuất cách đọc</span></AppShellHeader>{isImportUuid(requested) ? <RequestedStore storeId={requested} onCancel={resetTarget} /> : <p role="alert">Liên kết cửa hàng không hợp lệ.</p>}</>
  if (!currentStoreId || !role) return <p role="alert">Chọn cửa hàng để đọc đề xuất.</p>
  if (selected && !isImportUuid(selected)) return <p role="alert">Liên kết đề xuất không hợp lệ.</p>
  return <><AppShellHeader><span>Nhập dữ liệu · Đề xuất cách đọc</span></AppShellHeader><main className="notification-page"><header className="input-section-title"><h1>{role === 'OWNER' ? 'Phê duyệt Staff' : 'Đề xuất của bạn'}</h1><p>Quyết định cách đọc reusable. Dữ liệu chỉ được ghi qua Preview → Review → Commit.</p></header><nav className="input-view-tabs"><Link to="/imports">Nhập mới</Link><Link to="/imports/history">Lịch sử</Link><button onClick={resetTarget}>Danh sách đề xuất</button></nav>
    {selected ? <SubmissionDetail key={selected} storeId={currentStoreId} submissionId={selected} expectedVersion={expectedVersion} onReadCurrent={() => { const next = new URLSearchParams(params); next.delete('submission_version'); setParams(next) }} /> : <SubmissionList storeId={currentStoreId} />}
  </main></>
}

function SubmissionList({ storeId }: { storeId: string }) {
  const [filter, setFilter] = useState<WireMappingSubmission['state'] | ''>('submitted'), [cursor, setCursor] = useState<string | undefined>(), [rows, setRows] = useState<WireMappingSubmission[]>([]), [error, setError] = useState('')
  const snapshot = useRef<string | null>(null), seen = useRef(new Set<string>())
  const query = useCapabilityQuery('MQ02', { path: { store_id: storeId }, query: { limit: 20, ...(filter ? { state: filter } : {}), ...(cursor ? { cursor } : {}) } })
  useEffect(() => {
    if (!query.result) return
    const page = query.result
    // oxlint-disable-next-line react/set-state-in-effect -- Accumulate the acknowledged external query page.
    if (cursor && snapshot.current !== page.meta.snapshot_id) { setError('Danh sách đã thay đổi. Đọc lại danh sách trước khi xem tiếp.'); return }
    if (cursor && page.data.items.some(row => seen.current.has(row.submission_id))) { setError('Danh sách bị trùng hoặc đã thay đổi. Đọc lại danh sách.'); return }
    snapshot.current = page.meta.snapshot_id; if (!cursor) seen.current.clear(); page.data.items.forEach(row => seen.current.add(row.submission_id)); setRows(old => cursor ? [...old, ...page.data.items] : page.data.items)
  }, [query.result, cursor])
  return <section className="input-panel"><label>Trạng thái<select aria-label="Trạng thái đề xuất" value={filter} onChange={e => { setRows([]); setCursor(undefined); snapshot.current = null; setError(''); setFilter(e.target.value as typeof filter) }}><option value="">Tất cả</option>{Object.entries(submissionStateLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button disabled={query.loading} onClick={() => { setCursor(undefined); snapshot.current = null; setError(''); query.retry() }}>Đọc lại danh sách</button>
    {query.loading && <p role="status">Đang đọc đề xuất…</p>}{!!(query.error || error) && <p role="alert">{error || capabilityError(query.error)}</p>}{!query.loading && !query.error && !rows.length && <p>Chưa có đề xuất trong phạm vi này.</p>}
    {rows.map(row => <article className="input-status" key={row.submission_id}><strong>{submissionStateLabel[row.state]}</strong><p>{row.reason}</p><p>Gửi lúc {row.submitted_at}</p><Link to={`/imports/approvals?${new URLSearchParams({ store_id: storeId, submission_id: row.submission_id, submission_version: row.version })}`}>Mở đề xuất →</Link></article>)}
    {query.result?.meta.pagination.next_cursor && !error && <button disabled={query.loading} onClick={() => setCursor(query.result!.meta.pagination.next_cursor!)}>Xem thêm đề xuất</button>}
  </section>
}

function useStaffOrigin(storeId: string, userId: string | undefined, owner: boolean) {
  const [member, setMember] = useState<WireStaffMembership | null>(null)
  useEffect(() => {
    if (!owner || !userId) return
    const controller = new AbortController()
    void (async () => {
      let page = await capabilitiesApi.operations.N12({ path: { store_id: storeId }, query: { limit: 100 } }, { signal: controller.signal }), found = page.data.items.find(item => item.user.user_id === userId)
      const seen = new Set<string>()
      while (!found && page.meta.pagination?.next_cursor) { const cursor = page.meta.pagination.next_cursor; if (seen.has(cursor)) throw Error('Không xác nhận được người gửi.'); seen.add(cursor); page = await capabilitiesApi.operations.N12({ path: { store_id: storeId }, query: { limit: 100, cursor } }, { signal: controller.signal }); found = page.data.items.find(item => item.user.user_id === userId) }
      if (!controller.signal.aborted) setMember(found ?? null)
    })().catch(() => { if (!controller.signal.aborted) setMember(null) })
    return () => controller.abort()
  }, [storeId, userId, owner])
  return member?.user.user_id === userId ? member : null
}

function SubmissionDetail({ storeId, submissionId, expectedVersion, onReadCurrent }: { storeId: string; submissionId: string; expectedVersion: string | null; onReadCurrent: () => void }) {
  const { state: store } = useCurrentStore(), { state: auth } = useAuth(), query = useCapabilityQuery('MQ03', { path: { store_id: storeId, submission_id: submissionId }, query: { evidence_limit: 20 } })
  const decision = useCapabilityMutation('N5', submissionId), withdraw = useCapabilityMutation('MQ01', submissionId)
  const [action, setAction] = useState<'approve_activate' | 'reject' | 'request_changes' | null>(null), [reason, setReason] = useState(''), [ack, setAck] = useState(false), [error, setError] = useState(''), [extra, setExtra] = useState<WireSourceEvidenceCell[]>([]), [evidenceCursor, setEvidenceCursor] = useState<string | null | undefined>(), [reading, setReading] = useState(false), [withdrawOpen, setWithdrawOpen] = useState(false)
  const detail = query.result?.data, row = decision.result?.data.submission ?? withdraw.result?.data ?? detail?.submission
  const baselineQuery = useCapabilityQuery('M01', { path: { import_id: row?.import_id ?? '' }, query: { include_profile_details: true } }, !!row?.expected_active_version)
  const baseline = baselineQuery.result?.data.approved_profiles?.find(profile => profile.binding.profile_id === row?.profile_id && profile.binding.version === row.expected_active_version)?.spec
  const owner = (store.status === 'ready' || store.status === 'mock_preview') && store.store.membership.role === 'OWNER'
  const origin = useStaffOrigin(storeId, detail?.submission.submitted_by_user_id, owner)
  const locked = decision.locked || withdraw.locked || reading, stale = !!row && !!expectedVersion && row.version !== expectedVersion && !decision.result && !withdraw.result
  const canChange = !!row && canRequestStaffChanges(owner, origin, row, auth.status === 'authenticated' ? auth.context.user.user_id : undefined)
  async function recover() {
    const result = await (decision.uncertain ? decision.replay() : withdraw.replay())
    if (result) { setAction(null); setWithdrawOpen(false); query.retry() }
  }
  async function sendDecision() {
    if (!row || !detail || !action || !reason.trim() || !ack || locked || stale || !owner || !row.review_eligibility.eligible || !row.allowed_actions.includes(action) || action === 'request_changes' && !canChange) return
    const common = { proposal_revision: row.proposal_revision, reason: reason.trim(), submission_id: row.submission_id, expected_submission_version: row.version }
    const body = action === 'approve_activate' ? { ...common, decision: action, expected_active_version: row.expected_active_version } : { ...common, decision: action }
    const receipt = await decision.send({ path: { store_id: storeId, profile_id: row.profile_id }, key: crypto.randomUUID(), revision: row.current_profile.lifecycle_revision, body })
    if (receipt) { setAction(null); query.retry() }
  }
  async function readEvidence() {
    if (!row || !detail || reading || locked) return
    const cursor = evidenceCursor === undefined ? detail.evidence.next_cursor : evidenceCursor
    if (!cursor) return
    setReading(true); setError('')
    try { const page = await capabilitiesApi.mapping.read({ path: { store_id: storeId, submission_id: submissionId }, query: { evidence_limit: 100, evidence_cursor: cursor } }, { submissionPin: { submission_id: row.submission_id, version: row.version, spec_digest: row.spec_digest } }); setExtra(cells => [...cells, ...page.data.evidence.cells]); setEvidenceCursor(page.data.evidence.next_cursor) }
    catch (cause) { setError(capabilityError(cause)) } finally { setReading(false) }
  }
  async function withdrawSubmission() {
    if (!row || !reason.trim() || !ack || locked || !row.allowed_actions.includes('withdraw') || stale) return
    setReading(true); setError('')
    try { const batch = await capabilitiesApi.operations.I04({ path: { import_id: row.import_id } }); if (batch.data.store_id !== storeId) throw Error('Lô không thuộc cửa hàng hiện tại.'); const result = await withdraw.send({ path: { import_id: row.import_id }, key: crypto.randomUUID(), revision: batch.data.import_revision, body: { action: 'withdraw', submission_id: row.submission_id, expected_submission_version: row.version, reason: reason.trim() } }); if (result) { setWithdrawOpen(false); query.retry() } }
    catch (cause) { setError(capabilityError(cause)) } finally { setReading(false) }
  }
  if (!detail || !row) return <section className="input-status"><h2>{query.loading ? 'Đang đọc đề xuất…' : 'Chưa mở được đề xuất'}</h2>{!!query.error && <p role="alert">{capabilityError(query.error)}</p>}<button disabled={query.loading} onClick={query.retry}>Đọc lại đề xuất</button></section>
  return <section className="input-panel"><header className="input-section-title"><h2>{detail.source.filename} · {detail.source.sheet_name}</h2><p>{submissionStateLabel[row.state]} · Gửi lúc {row.submitted_at}</p><p>Người gửi: {origin?.user.display_name ?? (auth.status === 'authenticated' && row.submitted_by_user_id === auth.context.user.user_id ? 'Bạn' : 'Tài khoản gửi đề xuất')}</p></header><section className="input-status"><strong>Lý do gửi đề xuất</strong><p>{row.reason}</p></section>
    {stale && <section className="input-status" role="alert"><strong>Đề xuất đã thay đổi</strong><p>Không quyết định dựa trên phiên bản trong liên kết cũ.</p><button onClick={() => { onReadCurrent(); query.retry() }}>Đọc trạng thái hiện tại</button></section>}
    {row.decision && <section className="input-status"><h3>{submissionStateLabel[row.state]}</h3><p>{row.decision.reason}</p><p>Quyết định Profile không có nghĩa dữ liệu đã nhập.</p></section>}
    {!row.review_eligibility.eligible && row.state === 'submitted' && <p role="alert">Đề xuất hiện không đủ điều kiện quyết định. Đọc lại trạng thái trước khi tiếp tục.</p>}
    <ImportProfileSpecification proposed={detail.spec} baseline={baseline} first={row.expected_active_version === null} />
    {row.expected_active_version && !baseline && <p>Chưa đọc được baseline đúng phiên bản. Vẫn có thể xem toàn bộ Profile đề xuất. <button disabled={baselineQuery.loading} onClick={baselineQuery.retry}>Đọc lại baseline</button></p>}
    {!!detail.warnings.length && <section className="input-status"><h3>Cần chú ý</h3>{detail.warnings.map((warning, index) => <p key={index}>{warning.message}</p>)}</section>}
    {!!detail.missing_fields.length && <p role="alert">Còn thiếu thông tin: {detail.missing_fields.join(', ')}</p>}
    <details><summary>Bằng chứng nguồn đã gửi</summary><ImportBusinessFacts value={[...detail.evidence.cells, ...extra]} />{(evidenceCursor === undefined ? detail.evidence.next_cursor : evidenceCursor) && <button disabled={reading || locked} onClick={() => void readEvidence()}>Xem thêm bằng chứng</button>}</details>
    {!!(error || decision.error || withdraw.error) && <p role="alert">{error || capabilityError(decision.error || withdraw.error)}</p>}
    {(decision.uncertain || withdraw.uncertain) && <section className="input-status"><strong>Chưa xác nhận được kết quả</strong><p>Giữ nguyên yêu cầu trước. Không tạo quyết định cạnh tranh.</p><button disabled={decision.busy || withdraw.busy} onClick={() => void recover()}>Kiểm tra đúng yêu cầu trước</button></section>}
    <footer className="input-actions"><Link to={`/imports?${new URLSearchParams({ import_id: row.import_id, submission_id: row.submission_id, ...(row.state === 'changes_requested' ? { resolve: '1', sheet_id: row.sheet_id } : {}) })}`}>{row.state === 'changes_requested' ? 'Chỉnh lại cách hiểu' : row.state === 'approved' ? 'Tiếp tục lần nhập' : 'Mở lần nhập'}</Link><button disabled={locked} onClick={query.retry}>Đọc lại quyết định</button>
      {owner && row.state === 'submitted' && row.review_eligibility.eligible && !stale && <>{(['approve_activate', 'reject', ...(canChange ? ['request_changes'] : [])] as const).map(value => <button key={value} disabled={locked || !row.allowed_actions.includes(value) || value === 'approve_activate' && !!detail.missing_fields.length} onClick={() => { setAction(value as typeof action); setReason(''); setAck(false) }}>{value === 'approve_activate' ? 'Duyệt Profile' : value === 'reject' ? 'Từ chối' : 'Yêu cầu chỉnh sửa'}</button>)}</>}
      {row.allowed_actions.includes('withdraw') && !stale && <button disabled={locked} onClick={() => { setWithdrawOpen(true); setReason(''); setAck(false) }}>Rút đề xuất</button>}
    </footer>
    {(action || withdrawOpen) && <FlowDialog title={withdrawOpen ? 'Rút đề xuất đang chờ?' : action === 'request_changes' ? 'Yêu cầu Staff chỉnh sửa' : action === 'reject' ? 'Từ chối đề xuất' : 'Duyệt toàn bộ Profile'} center closeDisabled={locked} onClose={() => { setAction(null); setWithdrawOpen(false) }} footer={<><button disabled={locked} onClick={() => { setAction(null); setWithdrawOpen(false) }}>Hủy</button><button className="sc-flow-primary" data-brand-accent={!withdrawOpen && action === 'approve_activate' && !decision.uncertain} disabled={locked || !reason.trim() || !ack} onClick={() => void (withdrawOpen ? withdrawSubmission() : sendDecision())}>Xác nhận</button></>}><p>{action === 'request_changes' ? 'Staff quay lại Step 3 để chỉnh proposal. Files và các quyết định không liên quan vẫn được giữ.' : action === 'reject' ? 'Đề xuất hiện tại kết thúc. Đây không phải yêu cầu chỉnh sửa.' : withdrawOpen ? 'Rút submission này; không xóa file hoặc các quyết định resolver của lần nhập.' : 'Duyệt toàn bộ cấu hình reusable; chưa ghi dữ liệu của lô.'}</p><label>Lý do<textarea aria-label="Lý do quyết định" value={reason} disabled={locked} maxLength={1000} onChange={e => { setReason(e.target.value); setAck(false) }} /></label><label className="input-decision-ack"><input type="checkbox" checked={ack} disabled={locked} onChange={e => setAck(e.target.checked)} />Tôi xác nhận quyết định này và phạm vi áp dụng.</label>{!!(decision.error || withdraw.error) && <p role="alert">{capabilityError(decision.error || withdraw.error)}</p>}{(decision.uncertain || withdraw.uncertain) && <button disabled={decision.busy || withdraw.busy} onClick={() => void recover()}>Kiểm tra đúng yêu cầu trước</button>}</FlowDialog>}
  </section>
}
