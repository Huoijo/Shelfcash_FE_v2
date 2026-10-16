import type { ReactNode } from 'react'
import { NotificationContext, useUnreadNotifications } from './notifications.context'
import { Link } from 'react-router'
import { useCapabilityQuery } from '../backend-capabilities/capabilities.react'
export function NotificationProvider({ children }: { children: ReactNode }) {
  const query = useCapabilityQuery('NF02', {})
  return <NotificationContext.Provider value={{ count: query.result?.data.unread_count ?? null, refresh: query.retry }}>{children}</NotificationContext.Provider>
}
export function NotificationBell() {
  const context = useUnreadNotifications()
  if (!context) return null
  return <Link className="notification-bell" to="/notifications" aria-label={context.count === null ? 'Thông báo' : `Thông báo · ${context.count} chưa đọc`} title="Thông báo"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>{context.count !== null && context.count > 0 && <span className="notification-bell__count">{context.count}</span>}</Link>
}
