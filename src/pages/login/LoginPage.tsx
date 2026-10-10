import { LoginForm } from '../../features/auth/LoginForm'
import './LoginPage.css'

export function LoginPage() {
  return (
    <div className="login-page" lang="vi">
      <header className="login-page__header">
        <span className="login-page__brand">ShelfCash</span>
      </header>

      <main className="login-page__main">
        <div className="login-page__intro">
          <p className="login-page__eyebrow">TÀI KHOẢN SHELFCASH</p>
          <h1>Chào mừng trở lại.</h1>
          <p>Tiếp tục quản lý tồn kho và kế hoạch nhập hàng.</p>
        </div>

        <section
          className="login-page__card"
          aria-label="Biểu mẫu đăng nhập"
        >
          <LoginForm />
        </section>
      </main>
    </div>
  )
}
