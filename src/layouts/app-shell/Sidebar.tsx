import { NavLink } from 'react-router'

const sections = ['Hôm nay', 'Nhập dữ liệu', 'Dự đoán', 'Kho', 'Menu', 'Cửa hàng']
const routes: Record<string, string> = { 'Nhập dữ liệu': '/imports', 'Dự đoán': '/forecast', Kho: '/inventory', Menu: '/menu' }

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className="app-sidebar" aria-label="Điều hướng ứng dụng">
      <div className="app-sidebar__controls">
        <button className="app-sidebar__toggle" type="button" onClick={onToggle}
          aria-expanded={!collapsed} aria-controls="app-navigation"
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7 4v12" stroke="currentColor" strokeWidth="1.4" />
            <path d={collapsed ? 'M11 7.5l2.5 2.5-2.5 2.5' : 'M13.5 7.5L11 10l2.5 2.5'}
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <nav id="app-navigation" className="app-sidebar__navigation" aria-label="Các phân hệ ShelfCash">
        {sections.map((label) => routes[label] ? (
          <NavLink key={label} to={routes[label]} className="app-sidebar__item" aria-label={label} title={label}>
            <span className="app-sidebar__icon" aria-hidden="true" />
            <span className="app-sidebar__label">{label}</span>
          </NavLink>
        ) : (
          <span key={label} className="app-sidebar__item app-sidebar__item--unavailable"
            aria-disabled="true" aria-label={`${label} — chưa triển khai`} title={`${label} — chưa triển khai`}>
            <span className="app-sidebar__icon" aria-hidden="true" />
            <span className="app-sidebar__label">{label}</span>
          </span>
        ))}
      </nav>
    </aside>
  )
}
