import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { config } from '../../app/config'
import { configureHttpSession, HttpError } from '../../shared/http/httpClient'
import { createAuthDataSource } from './auth.data'
import type { LoginCredentials } from './auth.types'
import { AuthContextValue, type AuthState } from './auth.context'
const source = createAuthDataSource(config.apiBaseUrl)

// Session truth and CSRF live only in memory. The browser alone owns the cookie.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: config.mockPreview ? 'mock_preview' : 'bootstrapping' })
  const csrf = useRef<string | null>(null)
  const epoch = useRef(0)
  const pending = useRef(false)
  const bootstrap = useRef<AbortController | null>(null)

  const invalidate = useCallback(() => {
    epoch.current += 1
    csrf.current = null
    setState({ status: 'unauthenticated' })
  }, [])

  const readCanonical = useCallback(async (controller: AbortController, operation: number) => {
    try {
      const context = await source.readSession(controller.signal)
      if (operation !== epoch.current || controller.signal.aborted) return
      csrf.current = context.session.csrf_token
      setState({ status: 'authenticated', context })
    } catch (error) {
      if (operation !== epoch.current || controller.signal.aborted) return
      csrf.current = null
      if (error instanceof HttpError && error.status === 401) setState({ status: 'unauthenticated' })
      else setState({ status: 'error', message: error instanceof Error ? error.message : 'Không kiểm tra được phiên đăng nhập.' })
    }
  }, [])

  const refresh = useCallback(async () => {
    if (config.mockPreview || pending.current) return
    bootstrap.current?.abort()
    const controller = new AbortController()
    bootstrap.current = controller
    const operation = ++epoch.current
    setState({ status: 'bootstrapping' })
    await readCanonical(controller, operation)
  }, [readCanonical])

  useEffect(() => {
    if (config.mockPreview) return
    const release = configureHttpSession({ getCsrfToken: () => csrf.current, onUnauthenticated: invalidate })
    const controller = new AbortController()
    bootstrap.current = controller
    // oxlint-disable-next-line react/set-state-in-effect -- State changes only after the external asynchronous A03 request resolves.
    void readCanonical(controller, ++epoch.current)
    return () => { epoch.current += 1; bootstrap.current?.abort(); csrf.current = null; release() }
  }, [invalidate, readCanonical])

  const login = useCallback(async (credentials: LoginCredentials) => {
    if (config.mockPreview) throw new Error('Bản xem trước không đăng nhập hoặc gửi thông tin tài khoản.')
    if (pending.current) throw new Error('Đang xử lý phiên đăng nhập. Vui lòng chờ rồi thử lại.')
    pending.current = true
    bootstrap.current?.abort()
    const operation = ++epoch.current
    try {
      const result = await source.login(credentials)
      if (operation !== epoch.current) throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng thử lại.')
      // A01 can issue CSRF, but only a fresh A03 confirms cookie-backed session truth.
      csrf.current = result.session.csrf_token
      const context = await source.readSession()
      if (operation !== epoch.current) throw new Error('Chưa xác nhận được phiên đăng nhập hiện hành. Vui lòng thử lại.')
      csrf.current = context.session.csrf_token
      setState({ status: 'authenticated', context })
    } catch (error) {
      if (operation === epoch.current) { csrf.current = null; setState({ status: 'unauthenticated' }) }
      throw error
    } finally { pending.current = false }
  }, [])

  const logout = useCallback(async () => {
    if (config.mockPreview || pending.current) return
    pending.current = true
    try {
      // Do not pretend to revoke a server session when A04 fails.
      await source.logout()
      invalidate()
    } finally { pending.current = false }
  }, [invalidate])

  return <AuthContextValue.Provider value={{ state, login, refresh, logout }}>{children}</AuthContextValue.Provider>
}
