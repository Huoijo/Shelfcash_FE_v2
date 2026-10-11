import { useState } from 'react'
import type { ReactNode } from 'react'
import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { SessionActions } from '../../features/auth/SessionActions'
import './AppShell.css'

// API routes mount only after AuthGuard and current Store resolution.
export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`app-shell${collapsed ? ' app-shell--collapsed' : ''}`} lang="vi">
      <a className="app-shell__skip-link" href="#app-content">Đi tới nội dung</a>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="app-shell__workspace" id="app-content" tabIndex={-1}>
        <Outlet />
      </div>
    </div>
  )
}

// Pages supply their own date control or breadcrumb; the chrome stays consistent.
export function AppShellHeader({ children }: { children: ReactNode }) {
  return (
    <header className="app-shell__header">
      {children}
      <div className="app-shell__session"><SessionActions /><span className="app-shell__wordmark">ShelfCash</span></div>
    </header>
  )
}
