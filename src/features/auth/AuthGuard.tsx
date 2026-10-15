import { Link, Navigate, Outlet, useLocation } from 'react-router'
import { LoginPage } from '../../pages/login/LoginPage'
import { useAuth } from './auth.context'
import { authenticatedReturnPath } from './auth.navigation'
import './SessionFeedback.css'

export function SessionFeedback({ title, message, onRetry, loginFrom }: { title: string; message?: string; onRetry?: () => void; loginFrom?: string }) {
  return <main className="session-feedback" lang="vi" aria-busy={!message && !onRetry}>
    <h1>{title}</h1>
    {message && <p role="alert">{message}</p>}
    {onRetry && <button type="button" onClick={onRetry}>Thử lại</button>}
    {loginFrom && <Link to="/login" state={{ from: loginFrom }}>Đăng nhập lại</Link>}
  </main>
}

function BootstrapState() {
  const { state, refresh } = useAuth()
  const location = useLocation()
  return state.status === 'error'
    ? <SessionFeedback title="Không kiểm tra được phiên đăng nhập" message={state.message} onRetry={() => { void refresh() }} loginFrom={location.pathname + location.search + location.hash} />
    : <SessionFeedback title="Đang kiểm tra phiên đăng nhập…" />
}

// Central UX guard; server authorization remains mandatory on every request.
export function AuthGuard() {
  const { state } = useAuth()
  const location = useLocation()
  if (state.status === 'bootstrapping' || state.status === 'error') return <BootstrapState />
  if (state.status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />
  return <Outlet />
}

export function LoginRoute() {
  const { state } = useAuth()
  const location = useLocation()
  if (state.status === 'bootstrapping') return <BootstrapState />
  if (state.status === 'authenticated') {
    const from: unknown = location.state?.from
    const target = authenticatedReturnPath(from)
    return <Navigate to={target} replace />
  }
  return <LoginPage />
}
