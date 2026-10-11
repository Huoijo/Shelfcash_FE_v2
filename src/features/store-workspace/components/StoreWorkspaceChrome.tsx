import type { KeyboardEvent, ReactNode } from 'react'
import type { StoreContext } from '../../store/store.types'
import './StoreWorkspace.css'

export type StoreWorkspaceTab = 'overview' | 'members' | 'operations'
const tabs: [StoreWorkspaceTab, string][] = [['overview', 'Tổng quan'], ['members', 'Thành viên & quyền'], ['operations', 'Thiết lập vận hành']]

export function StoreWorkspaceHeader({ store, selector, restricted = false }: { store: StoreContext; selector: ReactNode; restricted?: boolean }) {
  return <div className="sc-store-header"><div><h1>Cửa hàng</h1>
    <div className="sc-store-header-identity"><strong>{store.name}</strong><span className="sc-store-status">Đang hoạt động</span></div>
    {restricted && <p className="sc-store-note sc-store-note-spaced">Bạn có quyền xem thông tin cửa hàng. Quản lý thành viên chỉ dành cho Owner; thay đổi ngân sách cần quyền tương ứng.</p>}
  </div><div className="sc-store-header-selector">{selector}</div></div>
}

export function StoreWorkspaceTabs({ tab, onTab, id }: { tab: StoreWorkspaceTab; onTab: (tab: StoreWorkspaceTab) => void; id: string }) {
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null
    if (next === null) return
    event.preventDefault()
    onTab(tabs[next][0])
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }
  return <div className="sc-store-tabs" role="tablist" aria-label="Cửa hàng">
    {tabs.map(([key, label], index) => <button key={key} id={`${id}-tab-${key}`} type="button" role="tab" aria-selected={tab === key}
      aria-controls={`${id}-panel-${key}`} tabIndex={tab === key ? 0 : -1} onKeyDown={(event) => keyboard(event, index)} onClick={() => onTab(key)}>{label}</button>)}
  </div>
}

export function StoreNoAccess() {
  return <div className="sc-store-empty"><div><div className="sc-store-empty-icon" aria-hidden="true">□</div><h1>Bạn chưa có cửa hàng</h1>
    <p>Tài khoản này hiện chưa được cấp quyền truy cập cửa hàng nào.</p><p>Liên hệ Owner hoặc hỗ trợ ShelfCash.</p></div></div>
}

export function StoreWorkspaceLoading({ label = 'Đang tải cửa hàng…' }: { label?: string }) {
  return <div className="sc-store-loading" role="status" aria-label={label}><span className="sc-store-note">{label}</span><div aria-hidden="true" /><div aria-hidden="true" /></div>
}

export function StoreWorkspaceFeedback({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return <section className="sc-store-feedback" role="alert"><h2>{title}</h2><p>{message}</p>{onRetry && <button type="button" className="sc-store-secondary" onClick={onRetry}>Thử lại</button>}</section>
}

export function StoreReadonlyToggle({ checked, label }: { checked: boolean; label: string }) {
  return <button type="button" className="sc-store-toggle" aria-label={label} aria-pressed={checked} disabled />
}
