import type { Wireapp__application__contracts__notifications__Notification } from '../backend-capabilities/capabilities.wire'

export type NotificationItem = Wireapp__application__contracts__notifications__Notification
/** Map only registered, resource-matching destinations; never follow arbitrary server URLs. */
export function notificationDestination(item: NotificationItem): string | null {
  if (!item.store || item.link?.availability !== 'available') return null
  const store = item.store.store_id, id = item.object.id
  if (item.object.type === 'mapping_submission' && item.link.path === `/stores/${store}/mapping-submissions/${id}`) {
    const query = new URLSearchParams({ store_id: store, submission_id: id })
    if (item.object.revision) query.set('submission_version', item.object.revision)
    return `/imports/approvals?${query}`
  }
  if (item.object.type === 'membership' && item.link.path === `/stores/${store}`) return `/store?${new URLSearchParams({ store_id: store })}`
  if (item.object.type === 'permission_request' && item.link.path === `/stores/${store}/permission-requests/${id}`) return `/store?${new URLSearchParams({ store_id: store, permission_request_id: id })}`
  return null
}
