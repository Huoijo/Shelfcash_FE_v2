import { requestJson, requestNoContent } from '../../shared/http/httpClient'
import type { AuthDataSource, LoginCredentials } from './auth.types'
import { validateAuthContext } from './auth.validation'

export function createAuthDataSource(apiBaseUrl: string): AuthDataSource {
  return {
    async login(credentials: LoginCredentials) {
      const email = credentials.email.trim().toLowerCase()
      if (!email || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Email chưa hợp lệ.')
      }
      if (typeof credentials.password !== 'string' || !credentials.password || typeof credentials.remember_me !== 'boolean') {
        throw new Error('Hãy nhập mật khẩu và lựa chọn ghi nhớ đăng nhập hợp lệ.')
      }
      // Login has Origin enforcement, but no session CSRF token before authentication.
      const response = await requestJson<unknown>(apiBaseUrl, '/api/v1/auth/login', {
        method: 'POST', auth: 'public',
        body: { email, password: credentials.password, remember_me: credentials.remember_me },
      })
      return validateAuthContext(response)
    },
    async readSession(signal) {
      const response = await requestJson<unknown>(apiBaseUrl, '/api/v1/auth/me', { signal })
      return validateAuthContext(response)
    },
    async logout() {
      await requestNoContent(apiBaseUrl, '/api/v1/auth/logout', { method: 'POST' })
    },
  }
}
