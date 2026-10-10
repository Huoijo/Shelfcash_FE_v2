import { useState } from 'react'
import type { FormEvent } from 'react'
import './LoginForm.css'

type FormErrors = { email?: string; password?: string }

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberLogin, setRememberLogin] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [notice, setNotice] = useState('')

  function clearError(field: keyof FormErrors) {
    setNotice('')
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: FormErrors = {}
    const normalizedEmail = email.trim()
    if (normalizedEmail.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = 'Nhập một địa chỉ email hợp lệ.'
    }
    // A01 checks presence. N7's 12–128 Unicode-character credential setup/reset
    // policy belongs to that separate flow. Preserve the login password exactly.
    if (!password) nextErrors.password = 'Vui lòng nhập mật khẩu.'
    setErrors(nextErrors)
    const firstInvalidField = Object.keys(nextErrors)[0]
    if (firstInvalidField) {
      setNotice('')
      document.getElementById(`auth-${firstInvalidField}`)?.focus()
    } else {
      setNotice('Đăng nhập chưa được kết nối. Chưa gửi thông tin tài khoản.')
    }
  }

  return (
    <div className="auth-form">
      <h2 className="auth-form__heading">Đăng nhập</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-form__fields">
          <div className="auth-form__field">
            <label htmlFor="auth-email">Email</label>
            <div className={`auth-form__input-shell${errors.email ? ' auth-form__input-shell--error' : ''}`}>
              <input id="auth-email" name="email" type="email" autoComplete="email"
                required value={email} placeholder="Nhập email của bạn"
                aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'auth-email-help' : undefined}
                onChange={(event) => { setEmail(event.target.value); clearError('email') }} />
            </div>
            {errors.email && <p id="auth-email-help" className="auth-form__error-text">{errors.email}</p>}
          </div>
          <div className="auth-form__field">
            <label htmlFor="auth-password">Mật khẩu</label>
            <div className={`auth-form__input-shell${errors.password ? ' auth-form__input-shell--error' : ''}`}>
              <input id="auth-password" name="password" type={showPassword ? 'text' : 'password'}
                autoComplete="current-password" required value={password} placeholder="Nhập mật khẩu"
                aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'auth-password-help' : undefined}
                onChange={(event) => { setPassword(event.target.value); clearError('password') }} />
              <button className="auth-form__password-toggle" type="button"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Ẩn' : 'Hiện'}</button>
            </div>
            {errors.password && <p id="auth-password-help" className="auth-form__error-text">{errors.password}</p>}
          </div>
        </div>
        <div className="auth-form__options">
          <label className="auth-form__remember">
            <input type="checkbox" checked={rememberLogin}
              onChange={(event) => setRememberLogin(event.target.checked)} />
            <span>Ghi nhớ đăng nhập</span>
          </label>
        </div>
        <button className="auth-form__primary-button" type="submit">Đăng nhập</button>
      </form>
      <p className="auth-form__notice" role="status">{notice}</p>
      <p className="auth-form__support">Liên hệ hỗ trợ ShelfCash nếu cần thiết lập tài khoản hoặc đặt lại mật khẩu.</p>
    </div>
  )
}
