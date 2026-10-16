import { FlowDialog } from '../../../shared/flow/FlowDialog'
import { capabilityError, useCapabilityQuery } from '../../backend-capabilities/capabilities.react'
import type { StoreContext } from '../../store/store.types'
import { storePermissionLabel } from '../storeWorkspace.format'
export function PermissionRequestNotice({ store, requestId, onClose, onMember }: { store: StoreContext; requestId: string; onClose: () => void; onMember: (membershipId: string) => void }) {
  const query = useCapabilityQuery('PR03', { path: { store_id: store.store_id, request_id: requestId } }), request = query.result?.data
  const labels: Record<string, string> = { pending: 'Đang chờ quyết định', approved: 'Đã duyệt', rejected: 'Đã từ chối', cancelled: 'Đã hủy', satisfied: 'Quyền hiện tại đã đáp ứng', invalidated: 'Yêu cầu không còn hiệu lực' }
  return <FlowDialog title="Yêu cầu quyền truy cập" onClose={onClose} footer={<><button onClick={onClose}>Đóng</button>{request && store.membership.role === 'OWNER' && <button className="sc-flow-primary" onClick={() => onMember(request.requester_membership_id)}>Mở quyền hiện tại</button>}</>}>
    {query.loading && <p role="status">Đang kiểm tra quyền và yêu cầu hiện tại…</p>}{!!query.error && <><p role="alert">{capabilityError(query.error)}</p><button onClick={query.retry}>Đọc lại yêu cầu</button></>}
    {request && <><h3>{labels[request.state]}</h3><p>{request.reason}</p><h4>Quyền được yêu cầu</h4><ul>{request.requested_permissions.map(permission => <li key={permission}>{storePermissionLabel(permission)}</li>)}</ul><p>Đọc yêu cầu không thay đổi quyền. Màn hình quyền hiện tại là thao tác quản trị riêng, không phải tự phê duyệt yêu cầu này.</p></>}
  </FlowDialog>
}
