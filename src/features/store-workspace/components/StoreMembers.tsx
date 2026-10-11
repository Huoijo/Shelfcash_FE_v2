import type { StaffMembership, Invitation } from '../storeWorkspace.types'
import { storeDeliveryStatus, storeInvitationStatus } from '../storeWorkspace.format'
import { StoreWorkspaceFeedback } from './StoreWorkspaceChrome'
import './StoreWorkspace.css'

export type StoreWorkspaceIdentity = { name: string; email: string; role: 'OWNER' | 'STAFF'; grants: string[] }
export type StoreMembersProps = {
  members: StaffMembership[]
  invitations: Invitation[]
  currentIdentity?: StoreWorkspaceIdentity | null
  canManage: boolean
  busy: boolean
  error?: string | null
  notice?: string | null
  membersTotal?: number | null
  invitationsTotal?: number | null
  hasMoreMembers?: boolean
  hasMoreInvitations?: boolean
  onSelectMember: (member: StaffMembership) => void
  onSelectIdentity?: () => void
  onSelectInvitation: (invitation: Invitation) => void
  onInvite: () => void
  onRetry?: () => void
  onMoreMembers?: () => void
  onMoreInvitations?: () => void
}

export function StoreMembers({ members, invitations, currentIdentity, canManage, busy, error, notice, membersTotal, invitationsTotal,
  hasMoreMembers, hasMoreInvitations, onSelectMember, onSelectIdentity, onSelectInvitation, onInvite, onRetry, onMoreMembers, onMoreInvitations }: StoreMembersProps) {
  return <div className="sc-store-stack"><section className="sc-store-card" aria-label="Thành viên và quyền hiện hành" aria-busy={busy || undefined}>
    <header className="sc-store-members-heading"><div><h2>Thành viên & quyền</h2><p className="sc-store-copy">Ai đang có quyền truy cập cửa hàng này?</p></div>
      <button type="button" className="sc-store-primary" onClick={onInvite} disabled={!canManage || busy}>+ Mời nhân viên</button></header>
    {notice && <p className="sc-store-message" role="status">{notice}</p>}
    {!canManage && <p className="sc-store-message">Chỉ Owner được xem danh sách Staff, thay đổi quyền và mời nhân viên. Quyền hiện hành của bạn vẫn do cửa hàng xác định.</p>}
    {currentIdentity && <div className="sc-store-message"><strong>{currentIdentity.role === 'OWNER' ? 'Owner hiện tại của phiên này' : 'Tài khoản của bạn'}</strong><br />
      {onSelectIdentity ? <button type="button" className="sc-store-member-name" onClick={onSelectIdentity} aria-label={`Xem quyền của ${currentIdentity.name}`}><strong>{currentIdentity.name || currentIdentity.email}</strong><span>{currentIdentity.email}</span></button> : <span>{currentIdentity.name || currentIdentity.email} · {currentIdentity.email}</span>}
      <p className="sc-store-note">{currentIdentity.role === 'OWNER' ? 'Quyền Owner chỉ đọc tại đây; danh sách bên dưới chỉ gồm Staff, không phải toàn bộ Owner.' : `${currentIdentity.grants.length} quyền hiện hành tại cửa hàng này.`}</p></div>}
    {error && <StoreWorkspaceFeedback title="Không tải được danh sách thành viên" message={error} onRetry={onRetry} />}
    {canManage && !error && <><div className="sc-store-table-scroll" tabIndex={0} role="region" aria-label="Danh sách Staff, có thể cuộn ngang"><table className="sc-store-table"><thead><tr><th scope="col">Thành viên</th><th scope="col">Vai trò</th><th scope="col">Quyền truy cập</th><th scope="col">Trạng thái</th><th scope="col"><span className="sc-store-note">Chi tiết</span></th></tr></thead><tbody>
      {members.map((member) => <tr key={member.membership_id}><td><button type="button" className="sc-store-member-name" onClick={() => onSelectMember(member)} aria-label={`Xem quyền của ${member.user.display_name || member.user.email}`} disabled={busy}>
        <strong>{member.user.display_name || member.user.email}</strong><span>{member.user.email}</span></button></td><td>Staff</td><td>{member.grants.length} quyền</td><td><span className="sc-store-status">{member.active ? 'Đang hoạt động' : 'Không hoạt động'}</span></td><td><button className="sc-store-chevron" type="button" onClick={() => onSelectMember(member)} disabled={busy} aria-label={`Mở quyền của ${member.user.display_name || member.user.email}`}>›</button></td></tr>)}
      {members.length === 0 && <tr><td colSpan={5}>Chưa có Staff trong danh sách đã đọc.</td></tr>}
    </tbody></table></div><div className="sc-store-message">Đã đọc {members.length} Staff · Tổng {membersTotal === null || membersTotal === undefined ? 'chưa biết' : membersTotal}.
      {hasMoreMembers && onMoreMembers && <div className="sc-store-actions"><button type="button" className="sc-store-secondary" onClick={onMoreMembers} disabled={busy}>Đọc thêm Staff</button></div>}</div></>}
  </section>
    {canManage && <section className="sc-store-card" aria-label="Lời mời Staff"><header className="sc-store-members-heading"><div><h2>Lời mời nhân viên</h2><p className="sc-store-copy">Lời mời chưa chấp nhận không phải thành viên và chưa cấp quyền.</p></div></header>
      <div className="sc-store-table-scroll" tabIndex={0} role="region" aria-label="Lời mời Staff, có thể cuộn ngang"><table className="sc-store-table"><thead><tr><th scope="col">Người được mời</th><th scope="col">Vai trò</th><th scope="col">Quyền đề nghị</th><th scope="col">Trạng thái</th><th scope="col">Email</th></tr></thead><tbody>
        {invitations.map((invitation) => <tr key={invitation.invitation_id}><td><button type="button" className="sc-store-member-name" disabled={busy} onClick={() => onSelectInvitation(invitation)} aria-label={`Xem lời mời ${invitation.target_email}`}><strong>{invitation.target_email}</strong><span>Chưa suy ra tên tài khoản</span></button></td><td>Staff</td><td>{invitation.offered_grants.length} quyền đề nghị</td><td><span className={`sc-store-status${invitation.status === 'pending' ? ' sc-store-status-pending' : ''}`}>{storeInvitationStatus(invitation.status)}</span></td><td>{storeDeliveryStatus(invitation.delivery_status)}</td></tr>)}
        {invitations.length === 0 && <tr><td colSpan={5}>Chưa có lời mời trong danh sách đã đọc.</td></tr>}
      </tbody></table></div><div className="sc-store-message">Đã đọc {invitations.length} lời mời · Tổng {invitationsTotal === null || invitationsTotal === undefined ? 'chưa biết' : invitationsTotal}.
        {hasMoreInvitations && onMoreInvitations && <div className="sc-store-actions"><button type="button" className="sc-store-secondary" disabled={busy} onClick={onMoreInvitations}>Đọc thêm lời mời</button></div>}</div>
    </section>}
  </div>
}
