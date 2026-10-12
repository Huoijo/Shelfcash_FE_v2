import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { HttpError } from '../../shared/http/httpClient'
import { useAuth } from './auth.context'
import './LoginForm.css'

type FormErrors = { email?: string; password?: string }

function describeLoginError(error: unknown): string {
  if (!(error instanceof HttpError)) {
    return error instanceof Error ? error.message : 'Chưa xác nhận được phiên đăng nhập. Vui lòng thử lại.'
  }
  if (error.problem?.code === 'INVALID_CREDENTIALS') return 'Email hoặc mật khẩu không đúng.'
  if (error.kind === 'transport') return 'Không kết nối được máy chủ đăng nhập. Kiểm tra kết nối rồi thử lại.'
  if (error.kind === 'protocol') return 'Máy chủ trả về dữ liệu đăng nhập hoặc phiên không hợp lệ. Chưa xác nhận đăng nhập.'
  if (error.status === 401) return 'Máy chủ chưa xác nhận phiên đăng nhập hợp lệ. Vui lòng đăng nhập lại.'
  if (error.status === 403) {
    return error.problem?.code === 'CSRF_CHECK_FAILED'
      ? 'Máy chủ từ chối xác thực yêu cầu đăng nhập. Vui lòng liên hệ hỗ trợ nếu lỗi tiếp diễn.'
      : 'Máy chủ không cho phép yêu cầu đăng nhập này. Vui lòng liên hệ hỗ trợ.'
  }
  if (error.status === 429) return 'Có quá nhiều lần đăng nhập. Vui lòng chờ rồi thử lại.'
  if ((error.status ?? 0) >= 500) return 'Máy chủ đăng nhập hiện chưa khả dụng. Vui lòng thử lại sau.'
  return error.message || 'Không đăng nhập được. Vui lòng thử lại.'
}

export function LoginForm() {
  const { state, login } = useAuth()
  const mockPreview = state.status === 'mock_preview'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberLogin, setRememberLogin] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [notice, setNotice] = useState('')
  const [requestError, setRequestError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  function clearError(field: keyof FormErrors) {
    setNotice('')
    setRequestError(null)
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current || mockPreview) return
    const nextErrors: FormErrors = {}
    const normalizedEmail = email.trim().toLowerCase()
    if (normalizedEmail.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = 'Nhập một địa chỉ email hợp lệ.'
    }
    // A01 checks presence. N7's 12–128 Unicode-character credential setup/reset
    // policy belongs to that separate flow. Preserve the login password exactly.
    if (!password) nextErrors.password = 'Vui lòng nhập mật khẩu.'
    setErrors(nextErrors)
    setRequestError(null)
    const firstInvalidField = Object.keys(nextErrors)[0]
    if (firstInvalidField) {
      setNotice('')
      document.getElementById(`auth-${firstInvalidField}`)?.focus()
      return
    }
    submittingRef.current = true
    setSubmitting(true)
    setNotice('Đang đăng nhập và xác nhận phiên làm việc…')
    try {
      await login({ email: normalizedEmail, password, remember_me: rememberLogin })
      setNotice('Đã xác nhận phiên đăng nhập.')
    } catch (error) {
      setNotice('')
      setRequestError(describeLoginError(error))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-form__tabs" role="tablist" aria-label="Tài khoản ShelfCash">
        <button id="auth-login-tab" type="button" role="tab" aria-selected="true" aria-controls="auth-login-panel">Đăng nhập</button>
        <button type="button" role="tab" aria-selected="false" disabled title="Liên hệ hỗ trợ ShelfCash để tạo tài khoản">Đăng ký</button>
      </div>
      <div id="auth-login-panel" role="tabpanel" aria-labelledby="auth-login-tab">
      <form onSubmit={(event) => { void handleSubmit(event) }} noValidate aria-busy={submitting}>
        <div className="auth-form__fields">
          <div className="auth-form__field">
            <label htmlFor="auth-email">Email</label>
            <div className={`auth-form__input-shell${errors.email ? ' auth-form__input-shell--error' : ''}`}>
              <input id="auth-email" name="email" type="email" autoComplete="email"
                required value={email} placeholder="Nhập email của bạn" disabled={submitting || mockPreview}
                aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'auth-email-help' : undefined}
                onChange={(event) => { setEmail(event.target.value); clearError('email') }} />
            </div>
            {errors.email && <p id="auth-email-help" className="auth-form__error-text">{errors.email}</p>}
          </div>
          <div className="auth-form__field">
            <label htmlFor="auth-password">Mật khẩu</label>
            <div className={`auth-form__input-shell${errors.password ? ' auth-form__input-shell--error' : ''}`}>
              <input id="auth-password" name="password" type={showPassword ? 'text' : 'password'}
                autoComplete="current-password" required value={password} placeholder="Nhập mật khẩu" disabled={submitting || mockPreview}
                aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'auth-password-help' : undefined}
                onChange={(event) => { setPassword(event.target.value); clearError('password') }} />
              <button className="auth-form__password-toggle" type="button"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} disabled={mockPreview}
                onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Ẩn' : 'Hiện'}</button>
            </div>
            {errors.password && <p id="auth-password-help" className="auth-form__error-text">{errors.password}</p>}
          </div>
        </div>
        <div className="auth-form__options">
          <label className="auth-form__remember">
            <input type="checkbox" checked={rememberLogin} disabled={submitting || mockPreview}
              onChange={(event) => setRememberLogin(event.target.checked)} />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <button className="auth-form__text-button" type="button" onClick={() => setNotice('Liên hệ hỗ trợ ShelfCash để được đặt lại mật khẩu.')}>Quên mật khẩu?</button>
        </div>
        <button className="auth-form__primary-button" type="submit" disabled={submitting || mockPreview}>{submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      </form>
      </div>
      {requestError && <p className="auth-form__request-error" role="alert">{requestError}</p>}
      <p className="auth-form__notice" role="status">{notice}</p>
      {mockPreview && (
        <p className="auth-form__preview">
          Chế độ minh họa giao diện dành cho phát triển. Không gửi tài khoản và không tạo phiên đăng nhập.
          {' '}<Link to="/imports">Mở giao diện minh họa</Link>
        </p>
      )}
      <p className="auth-form__support">Liên hệ hỗ trợ ShelfCash nếu cần thiết lập tài khoản hoặc đặt lại mật khẩu.</p>
    </div>
  )
}
