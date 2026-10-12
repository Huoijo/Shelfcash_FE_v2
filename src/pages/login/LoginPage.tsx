import { LoginForm } from '../../features/auth/LoginForm'
import { Link } from 'react-router'
import './LoginPage.css'

export function LoginPage() {
  return (
    <div className="login-page" lang="vi">
      <header className="login-page__header">
        <Link to="/" className="login-page__brand" aria-label="Trang chủ ShelfCash">ShelfCash</Link>
        <Link to="/" className="login-page__back"><span aria-hidden="true">←</span> Trang chủ</Link>
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
