import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from './auth.context'
import { authenticatedReturnPath } from './auth.navigation'
import { captureProof, forgetProof } from './invitationProof'
import { useCapabilityMutation, capabilityError } from '../backend-capabilities/capabilities.react'
import { HttpError } from '../../shared/http/httpClient'
import { config } from '../../app/config'
import './LoginForm.css'
import '../../pages/login/LoginPage.css'

export function AccountFrame({ title, copy, children }: { title: string; copy: string; children: ReactNode }) {
  return <div className="login-page" lang="vi"><header className="login-page__header"><Link className="login-page__brand" to="/">ShelfCash</Link><Link className="login-page__back" to="/login">← Đăng nhập</Link></header><main className="login-page__main"><div className="login-page__intro"><p className="login-page__eyebrow">TÀI KHOẢN SHELFCASH</p><h1>{title}</h1><p>{copy}</p></div><section className="login-page__card"><div className="auth-form">{children}</div></section></main></div>
}
export function AccountField({ label, type = 'text', value, onChange, disabled = false, autoComplete, maxLength }: { label: string; type?: string; value: string; onChange: (v: string) => void; disabled?: boolean; autoComplete?: string; maxLength?: number }) {
  return <label className="auth-form__field"><span>{label}</span><span className="auth-form__input-shell"><input aria-label={label} type={type} value={value} maxLength={maxLength} autoComplete={autoComplete} disabled={disabled} onChange={e => onChange(e.target.value)} required /></span></label>
}
export function RegistrationPage() {
  const location = useLocation(), navigate = useNavigate(), mutation = useCapabilityMutation('A02')
  const [email, setEmail] = useState(''), [name, setName] = useState(''), [validation, setValidation] = useState('')
  const from = authenticatedReturnPath(location.state?.from)
  async function submit(event: FormEvent) {
    event.preventDefault(); if (mutation.locked) return
    const address = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) || !name.trim()) { setValidation('Nhập email hợp lệ và tên hiển thị.'); return }
    setValidation('')
    const receipt = await mutation.send({ body: { email: address, display_name: name.trim() } })
    if (receipt) navigate('/email-verification', { state: { email: address, from, retryAfter: receipt.data.retry_after_seconds ?? 60 } })
  }
  return <AccountFrame title="Bắt đầu với ShelfCash." copy="Tạo tài khoản trước, sau đó xác minh email để bắt đầu sử dụng."><div className="auth-form__tabs"><Link to="/login" state={{ from }}>Đăng nhập</Link><button role="tab" aria-selected="true">Đăng ký</button></div><form onSubmit={e => void submit(e)}><div className="auth-form__fields"><AccountField label="Email" type="email" value={email} onChange={setEmail} disabled={mutation.locked} autoComplete="email" maxLength={320} /><AccountField label="Tên hiển thị" value={name} onChange={setName} disabled={mutation.locked} autoComplete="name" maxLength={200} /></div><p className="auth-form__notice">Bạn sẽ thiết lập mật khẩu từ liên kết xác minh trong email.</p>{!!(validation || mutation.error) && <p role="alert">{validation || capabilityError(mutation.error)}</p>}{mutation.uncertain && <p role="alert">Chưa xác nhận được kết quả. Kiểm tra hộp thư hoặc đăng nhập; không gửi lại tự động.</p>}<button className="auth-form__primary-button" disabled={mutation.locked || config.mockPreview}>{mutation.busy ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}</button></form></AccountFrame>
}

export function VerificationPage() {
  const location = useLocation()
  return <VerificationContent key={location.key} />
}
function VerificationContent() {
  const location = useLocation(), [params] = useSearchParams(), { state: auth, logout } = useAuth(), navigate = useNavigate()
  const completion = useCapabilityMutation('A05'), resend = useCapabilityMutation('A06')
  const [proof] = useState(() => captureProof('email-verification', location.hash, () => history.replaceState(history.state, '', location.pathname + location.search)))
  const [email, setEmail] = useState(typeof location.state?.email === 'string' ? location.state.email : '')
  const [password, setPassword] = useState(''), [confirmation, setConfirmation] = useState(''), [validation, setValidation] = useState('')
  const [remaining, setRemaining] = useState<number>(location.state?.retryAfter ?? 0)
  const [deadline, setDeadline] = useState(() => Date.now() + remaining * 1000)
  useEffect(() => { const timer = setInterval(() => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))), 1000); return () => clearInterval(timer) }, [deadline])
  const invitation = params.get('invitation_id')
  const from = authenticatedReturnPath(invitation ? `/invitations/${invitation}` : location.state?.from)
  const confirmed = !!completion.result
  const tokenInvalid = completion.error instanceof HttpError && completion.error.problem?.code === 'EMAIL_VERIFICATION_TOKEN_INVALID'
  async function complete(event: FormEvent) {
    event.preventDefault(); if (!proof || completion.locked) return
    if ([...password].length < 12 || [...password].length > 128 || password !== confirmation) { setValidation('Mật khẩu cần 12–128 ký tự và xác nhận phải khớp.'); return }
    setValidation(''); const receipt = await completion.send({ body: { token: proof, password } })
    if (receipt) { forgetProof('email-verification'); setPassword(''); setConfirmation('') }
  }
  async function sendAgain() {
    if (remaining || resend.locked) return
    const address = email.trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) { setValidation('Nhập email hợp lệ.'); return }
    setValidation(''); const receipt = await resend.send({ body: { email: address } })
    if (receipt) { const seconds = receipt.data.retry_after_seconds ?? 60; setDeadline(Date.now() + seconds * 1000); setRemaining(seconds) }
  }
  async function continueLogin() {
    // A05's receipt does not identify/authenticate the token holder. Never reuse an unrelated active account.
    try { if (auth.status === 'authenticated') await logout(); navigate('/login', { state: { from } }) }
    catch (error) { setValidation(capabilityError(error)) }
  }
  return <AccountFrame title={confirmed ? 'Tài khoản đã sẵn sàng' : tokenInvalid ? 'Không thể xác minh từ liên kết này' : proof ? 'Xác minh email của bạn' : 'Kiểm tra email của bạn'} copy={confirmed ? 'Email đã được xác minh thành công.' : tokenInvalid ? 'Liên kết không hợp lệ, đã dùng hoặc đã hết hạn. Bạn có thể đăng nhập hoặc yêu cầu liên kết mới.' : proof ? 'Thiết lập mật khẩu để hoàn tất xác minh email.' : 'Mở liên kết trong email để hoàn tất xác minh. Việc gửi yêu cầu chưa chứng minh email đã được giao.'}>
    {from.startsWith('/invitations/') && <p className="auth-form__notice">Sau khi đăng nhập, bạn sẽ quay lại lời mời để xác nhận tham gia.</p>}
    {confirmed ? <><p role="status">Đăng nhập để tiếp tục{from.startsWith('/invitations/') ? ' lời mời' : ' vào ShelfCash'}.</p><button className="auth-form__primary-button" onClick={() => void continueLogin()}>Tiếp tục đăng nhập</button></> : <>
      {proof && !tokenInvalid && <form onSubmit={e => void complete(e)}><div className="auth-form__fields"><AccountField label="Mật khẩu mới" type="password" value={password} onChange={setPassword} disabled={completion.locked} autoComplete="new-password" maxLength={128} /><AccountField label="Xác nhận mật khẩu" type="password" value={confirmation} onChange={setConfirmation} disabled={completion.locked} autoComplete="new-password" maxLength={128} /></div><p className="auth-form__notice">12–128 ký tự.</p><button className="auth-form__primary-button" disabled={completion.locked || config.mockPreview}>{completion.busy ? 'Đang xác minh…' : 'Xác minh email'}</button></form>}
      <AccountField label="Email" type="email" value={email} onChange={setEmail} disabled={resend.locked} autoComplete="email" maxLength={320} />
      {resend.result && <p role="status">Đã nhận yêu cầu gửi lại email xác minh. Kiểm tra hộp thư của bạn.</p>}
      <button className="auth-form__primary-button" disabled={!!remaining || resend.locked || config.mockPreview} onClick={() => void sendAgain()}>{resend.busy ? 'Đang gửi…' : remaining ? `Gửi lại sau ${remaining}s` : 'Gửi lại email xác minh'}</button>
    </>}
    {!!(validation || completion.error || resend.error) && <p role="alert">{validation || capabilityError(completion.error || resend.error)}</p>}
    {(completion.uncertain || resend.uncertain) && <p role="alert">Chưa rõ kết quả yêu cầu trước. Kiểm tra email hoặc đăng nhập, không gửi lại bằng ý định mới.</p>}
    <Link to="/login" state={{ from }}>Quay lại đăng nhập</Link>
  </AccountFrame>
}

export function PasswordResetPage() {
  const request = useCapabilityMutation('A07'), [email, setEmail] = useState('')
  return <AccountFrame title="Khôi phục mật khẩu" copy="Nhập email tài khoản để yêu cầu liên kết thiết lập mật khẩu."><form onSubmit={event => { event.preventDefault(); if (!request.locked) void request.send({ body: { email: email.trim().toLowerCase() } }) }}><AccountField label="Email" type="email" value={email} onChange={setEmail} disabled={request.locked} maxLength={320} autoComplete="email" /><button className="auth-form__primary-button" disabled={request.locked || config.mockPreview}>{request.busy ? 'Đang gửi…' : 'Gửi liên kết khôi phục'}</button></form>{request.result && <p role="status">Đã nhận yêu cầu. Kiểm tra email nếu tài khoản đủ điều kiện.</p>}{!!request.error && <p role="alert">{capabilityError(request.error)}</p>}{request.uncertain && <p>Chưa xác nhận được kết quả; kiểm tra hộp thư trước khi yêu cầu khác.</p>}</AccountFrame>
}
