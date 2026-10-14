import { useRef, useState } from 'react'
import { useAuth } from './auth.context'

export function SessionActions() {
  const { state, logout, refresh } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  if (state.status === 'mock_preview') return null
  if (state.status !== 'authenticated') return null

  async function leave() {
    if (submitting.current) return
    submitting.current = true
    setBusy(true); setError('')
    try { await logout() } catch (cause) {
      setError(`Chưa xác nhận được đăng xuất. ${cause instanceof Error ? cause.message : 'Vui lòng thử lại.'}`)
    } finally { submitting.current = false; setBusy(false) }
  }
  return <div className="session-actions">
    <button type="button" disabled={busy} onClick={() => { void leave() }}>{busy ? 'Đang đăng xuất…' : 'Đăng xuất'}</button>
    {error && <div className="session-actions__error"><p role="alert">{error}</p>
      <button type="button" onClick={() => { void refresh() }}>Kiểm tra lại phiên</button></div>}
  </div>
}
