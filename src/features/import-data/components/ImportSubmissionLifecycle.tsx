import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { capabilitiesApi, capabilityError, useCapabilityMutation } from '../../backend-capabilities/capabilities.react'
import type { WireMappingSubmission } from '../../backend-capabilities/capabilities.wire'
import type { ImportBatch } from '../importData.types'
import type { MappingSummary } from '../importFlow.types'
import { FlowDialog } from '../../../shared/flow/FlowDialog'
import { ImportBusinessFacts } from './ImportBusinessFacts'
import { schemaLabel, sourceLabel } from '../importPresentation'
import { submissionStateLabel } from '../importSubmission.policy'
import { readImportSubmissions } from '../importSubmission.data'

export function ImportSubmissionLifecycle({ batch, summary, disabled, canPropose, onLock, onRefresh }: { batch: ImportBatch; summary: MappingSummary; disabled: boolean; canPropose: boolean; onLock: (id: string, locked: boolean) => void; onRefresh: () => Promise<void> }) {
  const [attempt, retry] = useState(0), [resource, setResource] = useState<{ rows?: WireMappingSubmission[]; error?: unknown; attempt: number }>({ attempt: -1 })
  const [open, setOpen] = useState(false), [profileId, setProfileId] = useState(''), [reason, setReason] = useState('')
  const mutation = useCapabilityMutation('MQ01', batch.import_id), rows = resource.attempt === attempt ? resource.rows : undefined
  const loading = resource.attempt !== attempt, error = resource.attempt === attempt ? resource.error : null
  useEffect(() => {
    const controller = new AbortController()
    void readImportSubmissions(batch.store_id, batch.import_id, controller.signal, capabilitiesApi).then(rows => { if (!controller.signal.aborted) setResource({ rows, attempt }) }).catch(error => { if (!controller.signal.aborted) setResource({ error, attempt }) })
    return () => controller.abort()
  }, [batch.store_id, batch.import_id, attempt])
  const waiting = rows?.some(row => row.state === 'submitted') ?? true
  useEffect(() => { onLock(batch.import_id, loading || !!error || waiting || mutation.locked) }, [batch.import_id, loading, error, waiting, mutation.locked, onLock])
  const selected = summary.profile_proposals.find(proposal => proposal.profile_id === profileId)
  async function submit() {
    if (!selected?.spec || selected.missing_fields.length || !reason.trim() || !canPropose || disabled || mutation.locked || loading || error || waiting) return
    const receipt = await mutation.send({ path: { import_id: batch.import_id }, key: crypto.randomUUID(), revision: batch.import_revision, body: { action: 'submit', reason: reason.trim(), profile_id: selected.profile_id, proposal_revision: selected.proposal_revision, mapping_revision: summary.mapping_revision } })
    if (receipt) { setOpen(false); retry(v => v + 1); await onRefresh() }
  }
  async function check() {
    if (mutation.uncertain) { const receipt = await mutation.replay(); if (!receipt) return; setOpen(false) }
    retry(v => v + 1); await onRefresh()
  }
  return <section className="input-submissions"><header><h3>Đề xuất cách đọc reusable</h3><p>Gửi từng Profile để Owner quyết định. File và các quyết định của lần nhập vẫn được giữ.</p></header>
    {loading && <p role="status">Đang kiểm tra đề xuất hiện tại…</p>}
    {!!(error || mutation.error) && <p role="alert">{capabilityError(error || mutation.error)}</p>}
    {mutation.uncertain && <p role="alert">Chưa rõ kết quả gửi đề xuất. Không chỉnh proposal hoặc gửi ý định mới; kiểm tra đúng yêu cầu trước.</p>}
    {rows?.map(row => <section className="input-status" key={row.submission_id}><strong>{submissionStateLabel[row.state]}</strong><p>{row.decision?.reason ?? row.reason}</p>{row.state === 'changes_requested' && <p>Chỉnh cách hiểu ở Step 3 rồi gửi lại. Không cần tải lại file hoặc làm lại quyết định không liên quan.</p>}{row.state === 'rejected' && <p>Proposal hiện tại đã kết thúc. Có thể chỉnh cách hiểu cho một đề xuất mới.</p>}{row.state === 'approved' && <p>Tiếp tục Preview khi tất cả điều kiện của lần nhập đã đủ. Approval không cấp quyền commit.</p>}<Link to={`/imports/approvals?${new URLSearchParams({ store_id: batch.store_id, submission_id: row.submission_id, submission_version: row.version })}`}>Xem đề xuất{row.allowed_actions.includes('withdraw') ? ' / Rút đề xuất' : ''} →</Link></section>)}
    <div className="input-actions"><button disabled={loading || mutation.busy || disabled} onClick={() => void check()}>{mutation.uncertain ? 'Kiểm tra đúng yêu cầu trước' : 'Đọc lại quyết định'}</button>{!!summary.profile_proposals.length && <button className="input-primary" disabled={disabled || mutation.locked || loading || !!error || waiting || !canPropose} onClick={() => { setOpen(true); setProfileId(''); setReason('') }}>Gửi Owner duyệt</button>}</div>
    {open && <FlowDialog title="Gửi đề xuất để Owner duyệt" center closeDisabled={mutation.locked} onClose={() => setOpen(false)} footer={<><button disabled={mutation.locked} onClick={() => setOpen(false)}>Hủy</button><button className="sc-flow-primary" data-brand-accent={!mutation.uncertain} disabled={mutation.locked || !selected?.spec || !!selected.missing_fields.length || !reason.trim() || disabled || !canPropose} onClick={() => void submit()}>{mutation.busy ? 'Đang gửi…' : 'Gửi Owner duyệt'}</button></>}><p>Chỉ gửi một Profile theo revision đang xem. Chưa ghi dữ liệu của batch.</p><label>Profile cần gửi<select aria-label="Profile cần gửi" value={profileId} disabled={mutation.locked} onChange={e => setProfileId(e.target.value)}><option value="">Chọn Profile…</option>{summary.profile_proposals.map((proposal, index) => <option key={proposal.profile_id} value={proposal.profile_id} disabled={!proposal.spec || !!proposal.missing_fields.length}>{index + 1}. {proposal.spec ? `${sourceLabel(proposal.spec.scope.source_system_key)} · ${schemaLabel(proposal.spec.schema)}` : 'Cách đọc chưa đủ thông tin'}</option>)}</select></label>{selected?.spec && <ImportBusinessFacts value={{ field_bindings: selected.spec.field_bindings, shared_field_bindings: selected.spec.shared_field_bindings, conversions: selected.spec.conversions }} />}<label>Lý do gửi đề xuất<textarea aria-label="Lý do gửi đề xuất" value={reason} disabled={mutation.locked} maxLength={1000} onChange={e => setReason(e.target.value)} /></label>{!!mutation.error && <p role="alert">{capabilityError(mutation.error)}</p>}{mutation.uncertain && <button disabled={mutation.busy} onClick={() => void check()}>Kiểm tra đúng yêu cầu trước</button>}</FlowDialog>}
  </section>
}
