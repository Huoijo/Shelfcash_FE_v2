import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Invitation, PermissionDescriptor, PermissionMutationRequest, StaffInvitationActionRequest, StaffInvitationCreateRequest, StaffMembership } from '../storeWorkspace.types'
import { canonicalStoreEmail, formatStoreTimestamp, isKnownStorePermission, missingStorePrerequisites, sameStoreGrants, sortedStoreGrants, storeDeliveryStatus, storeDialogFocusIndex, storeInvitationStatus, storePermissionGroup, storePermissionLabel, validStoreReason } from '../storeWorkspace.format'
import type { StoreWorkspaceIdentity } from './StoreMembers'
import './StoreWorkspace.css'

export type StoreDrawerFeedback = { busy: boolean; error?: string | null; notice?: string | null; locked?: boolean; onRetry?: () => void; onDirtyChange?: (dirty: boolean) => void }

function useStoreDirty(dirty: boolean, onDirtyChange?: (dirty: boolean) => void) {
  useEffect(() => {
    onDirtyChange?.(dirty)
    return () => onDirtyChange?.(false)
  }, [dirty, onDirtyChange])
}

function StoreDrawer({ title, subtitle, status, children, onClose, dirty, busy }: { title: string; subtitle?: ReactNode; status?: ReactNode; children: ReactNode | ((requestClose: () => void) => ReactNode); onClose: () => void; dirty: boolean; busy: boolean }) {
  const id = useId()
  const ref = useRef<HTMLDialogElement>(null)
  const [discard, setDiscard] = useState(false)
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      if (dialog?.open) dialog.close()
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus()
    }
  }, [])
  function close() {
    if (busy) return
    if (dirty) setDiscard(true)
    else onClose()
  }
  return <dialog ref={ref} className="sc-store-drawer" aria-modal="true" aria-labelledby={`${id}-title`} aria-busy={busy || undefined}
    onCancel={(event) => { event.preventDefault(); close() }}
    onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}
    onKeyDown={(event) => {
      if (event.key !== 'Tab') return
      const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')]
        .filter((element) => element.getClientRects().length > 0)
      const next = storeDialogFocusIndex(controls.indexOf(document.activeElement as HTMLElement), controls.length, event.shiftKey)
      if (next !== null) { event.preventDefault(); controls[next]?.focus() }
    }}>
    <header className="sc-store-drawer-header"><div><h2 id={`${id}-title`}>{title}</h2>{subtitle && <div className="sc-store-drawer-identity">{subtitle}</div>}{status}</div>
      <button type="button" className="sc-store-drawer-close" autoFocus aria-label="Đóng bảng chi tiết" disabled={busy} onClick={close}>✕</button></header>
    {discard && <div className="sc-store-discard" role="alert"><p className="sc-store-note">Bạn có thay đổi chưa lưu. Bỏ thay đổi để đóng?</p><div className="sc-store-actions"><button type="button" className="sc-store-secondary" onClick={() => setDiscard(false)}>Tiếp tục chỉnh sửa</button><button type="button" className="sc-store-primary" onClick={onClose}>Bỏ thay đổi</button></div></div>}
    {typeof children === 'function' ? children(close) : children}
  </dialog>
}

export type StorePermissionFieldsProps = { catalog: PermissionDescriptor[]; grants: string[]; disabled: boolean; onChange: (grants: string[]) => void }
export function StorePermissionFields({ catalog, grants, disabled, onChange }: StorePermissionFieldsProps) {
  const uniqueCatalog = [...new Map(catalog.map((descriptor) => [descriptor.key, descriptor])).values()]
  const unknownGrants = grants.filter((key) => !uniqueCatalog.some((descriptor) => descriptor.key === key))
  const groups = [...new Set(uniqueCatalog.map((descriptor) => storePermissionGroup(descriptor.key)))]
  const missing = missingStorePrerequisites(grants, catalog)
  return <><div className="sc-store-permissions">{groups.map((group) => <section key={group} className="sc-store-permission-group"><h4>{group}</h4>
    {uniqueCatalog.filter((descriptor) => storePermissionGroup(descriptor.key) === group).map((descriptor) => <label className="sc-store-permission" key={descriptor.key}>
      <input type="checkbox" checked={grants.includes(descriptor.key)} disabled={disabled || !descriptor.grantable_to_staff || !isKnownStorePermission(descriptor.key)}
        onChange={() => onChange(sortedStoreGrants(grants.includes(descriptor.key) ? grants.filter((key) => key !== descriptor.key) : [...grants, descriptor.key]))} />
      <span>{storePermissionLabel(descriptor.key)}<small>{descriptor.description_vi}</small>
        {!isKnownStorePermission(descriptor.key) && <small><code>{descriptor.key}</code> · chỉ đọc, không tự gán sang quyền khác.</small>}
        {descriptor.exposure !== 'ordinary' && <small>{descriptor.exposure === 'budget' ? 'Có thể lộ thông tin ngân sách.' : 'Có thể lộ thông tin chi phí.'}</small>}
      </span></label>)}
  </section>)}</div>
    {unknownGrants.length > 0 && <section className="sc-store-drawer-notice"><h3>Quyền chưa nhận diện trong danh mục</h3>{unknownGrants.map((key) => <p className="sc-store-note" key={key}>{storePermissionLabel(key)} · <code>{key}</code> · chỉ đọc.</p>)}</section>}
    {missing.length > 0 && <p className="sc-store-drawer-notice" role="note">Một số tác vụ đã chọn chưa dùng được vì thiếu quyền đi kèm: {missing.map(storePermissionLabel).join(', ')}. Không tự thêm quyền; tập bạn chọn sẽ được giữ nguyên.</p>}
  </>
}

function hasUnreviewedGrants(grants: string[], catalog: PermissionDescriptor[]) {
  return grants.some((key) => !isKnownStorePermission(key) || !catalog.some((descriptor) => descriptor.key === key && descriptor.grantable_to_staff))
}

function DrawerFeedback({ busy, error, notice, locked, onRetry }: StoreDrawerFeedback) {
  return <>{busy && <p className="sc-store-drawer-notice" role="status">Đang gửi yêu cầu…</p>}{error && <p className="sc-store-drawer-notice" role="alert">{error}</p>}{notice && <p className="sc-store-drawer-notice" role="status">{notice}</p>}
    {locked && <div className="sc-store-drawer-notice"><p>Yêu cầu trước chưa được giải quyết. Đóng bảng không hủy yêu cầu đã gửi; chưa gửi thay đổi mới khi chưa đối chiếu.</p>{onRetry && <button type="button" className="sc-store-secondary" disabled={busy} onClick={onRetry}>Thử lại đúng yêu cầu trước</button>}</div>}</>
}

export type MemberPermissionDrawerProps = StoreDrawerFeedback & {
  member?: StaffMembership | null
  identity?: StoreWorkspaceIdentity | null
  catalog: PermissionDescriptor[]
  canEdit: boolean
  onSave: (request: PermissionMutationRequest) => void
  onClose: () => void
}

export function MemberPermissionDrawer({ member, identity, catalog, canEdit, busy, error, notice, locked, onRetry, onSave, onClose, onDirtyChange }: MemberPermissionDrawerProps) {
  const baseGrants = member?.grants ?? identity?.grants ?? []
  const [grants, setGrants] = useState(() => [...baseGrants])
  const [reason, setReason] = useState('')
  const id = useId()
  const dirty = !sameStoreGrants(grants, baseGrants) || reason !== ''
  useStoreDirty(dirty, onDirtyChange)
  // N12 is Staff-only; role may be omitted because its OpenAPI default is STAFF.
  const editable = !!member && member.active && canEdit && !busy && !locked && !hasUnreviewedGrants(baseGrants, catalog)
  const name = member?.user.display_name || member?.user.email || identity?.name || identity?.email || 'Thành viên'
  const email = member?.user.email ?? identity?.email ?? ''
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (editable && validStoreReason(reason)) onSave({ grants: sortedStoreGrants(grants), reason })
  }
  return <StoreDrawer title={name} subtitle={<><span>{member ? 'Staff' : identity?.role === 'OWNER' ? 'Owner' : 'Staff'}</span><span aria-hidden="true">·</span><span>{email}</span></>} status={<span className="sc-store-status">{member ? member.active ? 'Đang hoạt động' : 'Không hoạt động' : 'Quyền hiện hành của bạn'}</span>} onClose={onClose} dirty={dirty} busy={busy}>
    {(requestClose) => <form onSubmit={save} noValidate><section className="sc-store-drawer-section"><h3>Quyền truy cập</h3><p className="sc-store-copy">Chọn những khu vực và hành động nhân viên này được phép sử dụng.</p>
      {!member && <p className="sc-store-note sc-store-note-spaced">{identity?.role === 'OWNER' ? 'Quyền Owner chỉ đọc; không thể chuyển hoặc hạ quyền sở hữu tại đây.' : 'Đây là quyền hiện hành của bạn; chỉ Owner được đổi quyền Staff.'}</p>}
      {member && !member.active && <p className="sc-store-note sc-store-note-spaced">Staff không hoạt động chỉ được xem. Thay đổi quyền không kích hoạt lại thành viên.</p>}
      {member && hasUnreviewedGrants(baseGrants, catalog) && <p className="sc-store-drawer-notice">Có quyền chưa được đối chiếu đầy đủ. Chưa thể lưu tập quyền thay thế; cần tải lại danh mục hiện hành.</p>}
      <StorePermissionFields catalog={catalog} grants={grants} disabled={!editable} onChange={setGrants} />
      {member && <label className="sc-store-field" htmlFor={`${id}-reason`}>Lý do thay đổi<textarea className="sc-store-input" id={`${id}-reason`} value={reason} onChange={(event) => setReason(event.target.value)} disabled={!editable} maxLength={2000} aria-describedby={`${id}-reason-note`} /></label>}
      {member && <p className="sc-store-note sc-store-note-spaced" id={`${id}-reason-note`}>Cần lý do từ 1 đến 1.000 ký tự. Bỏ chọn tất cả sẽ thu toàn bộ quyền tính năng, không xóa thành viên.</p>}
      <DrawerFeedback busy={busy} error={error} notice={notice} locked={locked} onRetry={onRetry} />
    </section><footer className="sc-store-actions"><button type="button" className="sc-store-secondary" disabled={busy} onClick={requestClose}>Hủy</button>
      {member && <button type="submit" className="sc-store-primary" disabled={!editable || !validStoreReason(reason)}>Lưu quyền</button>}</footer></form>}
  </StoreDrawer>
}

export type StaffInviteDrawerProps = StoreDrawerFeedback & {
  catalog: PermissionDescriptor[]
  catalogVersion: string | null
  canInvite: boolean
  sent?: Invitation | null
  onSend: (request: StaffInvitationCreateRequest) => void
  onClose: () => void
}

export function StaffInviteDrawer({ catalog, catalogVersion, canInvite, sent, busy, error, notice, locked, onRetry, onSend, onClose, onDirtyChange }: StaffInviteDrawerProps) {
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [grants, setGrants] = useState<string[]>([])
  const id = useId()
  const dirty = !sent && (email !== '' || reason !== '' || grants.length > 0)
  useStoreDirty(dirty, onDirtyChange)
  const editable = canInvite && !busy && !locked && !!catalogVersion && catalog.length > 0
  const canonicalEmail = canonicalStoreEmail(email)
  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (editable && canonicalEmail && catalogVersion && validStoreReason(reason) && !hasUnreviewedGrants(grants, catalog)) onSend({ email: canonicalEmail, grants: sortedStoreGrants(grants), permission_catalog_version: catalogVersion, reason })
  }
  return <StoreDrawer title="Mời nhân viên" subtitle="Mời Staff vào cửa hàng hiện tại; quyền chỉ có sau khi họ chấp nhận." onClose={onClose} dirty={dirty} busy={busy}>
    {sent ? <section className="sc-store-drawer-section"><h3>Đã tạo lời mời</h3><p className="sc-store-copy">{sent.target_email}</p><p className="sc-store-note sc-store-note-spaced">{storeInvitationStatus(sent.status)} · {storeDeliveryStatus(sent.delivery_status)}.</p>
      <p className="sc-store-note sc-store-note-spaced">Gửi email chưa có nghĩa đã cấp quyền hoặc người nhận đã đọc email. Nhân viên cần tự đăng nhập và chấp nhận.</p><div className="sc-store-actions"><button type="button" className="sc-store-primary" onClick={onClose}>Hoàn tất</button></div></section>
      : <form onSubmit={send} noValidate><section className="sc-store-drawer-section">
        <label className="sc-store-field" htmlFor={`${id}-email`}>Email<input id={`${id}-email`} type="email" className="sc-store-input" value={email} onChange={(event) => setEmail(event.target.value)} disabled={!editable} maxLength={320} autoComplete="email" placeholder="nhanvien@example.com" aria-invalid={email.trim() !== '' && !canonicalEmail || undefined} /></label>
        <label className="sc-store-field">Vai trò<select className="sc-store-input" disabled value="STAFF"><option value="STAFF">Staff</option></select></label>
        <div className="sc-store-drawer-section"><h3>Quyền ban đầu</h3><p className="sc-store-copy">Có thể không chọn quyền nào. Quyền đề nghị chưa phải quyền hiện hành.</p><StorePermissionFields catalog={catalog} grants={grants} disabled={!editable} onChange={setGrants} /></div>
        <label className="sc-store-field" htmlFor={`${id}-reason`}>Lý do mời<textarea className="sc-store-input" id={`${id}-reason`} value={reason} onChange={(event) => setReason(event.target.value)} disabled={!editable} maxLength={2000} /></label><p className="sc-store-note sc-store-note-spaced">Cần lý do từ 1 đến 1.000 ký tự. Không gửi lời mời làm Owner.</p>
        <DrawerFeedback busy={busy} error={error} notice={notice} locked={locked} onRetry={onRetry} />
      </section><footer className="sc-store-actions"><button type="submit" className="sc-store-primary" disabled={!editable || !canonicalEmail || !validStoreReason(reason) || hasUnreviewedGrants(grants, catalog)}>Gửi lời mời</button></footer></form>}
  </StoreDrawer>
}

export type InvitationActionDrawerProps = StoreDrawerFeedback & {
  invitation: Invitation
  catalog: PermissionDescriptor[]
  catalogVersion: string | null
  canManage: boolean
  onAction: (request: StaffInvitationActionRequest) => void
  onClose: () => void
}

export function InvitationActionDrawer({ invitation, catalog, catalogVersion, canManage, busy, error, notice, locked, onRetry, onAction, onClose, onDirtyChange }: InvitationActionDrawerProps) {
  const [grants, setGrants] = useState(() => [...invitation.offered_grants])
  const [reason, setReason] = useState('')
  const [action, setAction] = useState<'reissue' | 'revoke'>('reissue')
  const id = useId()
  const dirty = !sameStoreGrants(grants, invitation.offered_grants) || reason !== ''
  useStoreDirty(dirty, onDirtyChange)
  const editable = canManage && !busy && !locked && invitation.status !== 'accepted'
  const canReissue = editable && !!catalogVersion && catalog.length > 0 && !hasUnreviewedGrants(grants, catalog)
  const canRevoke = editable && invitation.status === 'pending'
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validStoreReason(reason)) return
    if (action === 'revoke' && canRevoke) onAction({ action: 'revoke', reason })
    else if (action === 'reissue' && canReissue && catalogVersion) onAction({ action: 'reissue', grants: sortedStoreGrants(grants), permission_catalog_version: catalogVersion, reason })
  }
  return <StoreDrawer title="Lời mời nhân viên" subtitle={<><span>Staff</span><span aria-hidden="true">·</span><span>{invitation.target_email}</span></>} status={<span className="sc-store-status">{storeInvitationStatus(invitation.status)}</span>} onClose={onClose} dirty={dirty} busy={busy}>
    <form onSubmit={submit} noValidate><section className="sc-store-drawer-section"><p className="sc-store-note">{storeDeliveryStatus(invitation.delivery_status)} · Hết hạn: {formatStoreTimestamp(invitation.expires_at)}.</p>
      <h3 className="sc-store-note-spaced">Quyền được đề nghị</h3><StorePermissionFields catalog={catalog} grants={grants} disabled={!canReissue || action === 'revoke'} onChange={setGrants} />
      {invitation.status === 'accepted' ? <p className="sc-store-drawer-notice">Lời mời đã chấp nhận không thể gửi lại hoặc thu hồi. Đổi quyền của thành viên trong danh sách Staff, không dùng quyền đề nghị cũ làm quyền hiện hành.</p> : <>
        <label className="sc-store-field">Thao tác<select className="sc-store-input" value={action} disabled={!editable} onChange={(event) => setAction(event.target.value as 'reissue' | 'revoke')}><option value="reissue">Phát hành lại lời mời</option>{canRevoke && <option value="revoke">Thu hồi lời mời</option>}</select></label>
        <p className="sc-store-note sc-store-note-spaced">Phát hành lại tạo lời mời phiên bản mới và vô hiệu liên kết cũ. Không đổi email người nhận, không kích hoạt thành viên.</p>
        <label className="sc-store-field" htmlFor={`${id}-reason`}>Lý do<textarea className="sc-store-input" id={`${id}-reason`} value={reason} disabled={!editable} maxLength={2000} onChange={(event) => setReason(event.target.value)} /></label>
      </>}
      <DrawerFeedback busy={busy} error={error} notice={notice} locked={locked} onRetry={onRetry} />
    </section>{invitation.status !== 'accepted' && <footer className="sc-store-actions"><button type="submit" className="sc-store-primary" disabled={!validStoreReason(reason) || (action === 'reissue' ? !canReissue : !canRevoke)}>{action === 'revoke' ? 'Thu hồi lời mời' : 'Phát hành lại lời mời'}</button></footer>}</form>
  </StoreDrawer>
}
