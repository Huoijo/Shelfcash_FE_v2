import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router';
import type { ReactNode, MouseEvent } from 'react';
import './HomePage.css';

// Visual reference: MagicPath 458083907045322752 / 458087405988220928.
const shelfCashRoutes = {
  product: '#solution',
  platform: '#how-it-works',
  resources: '/resources',
  pricing: '/pricing',
  login: '/login',
  register: '/login'
} as const;
type LinkProps = {
  children: ReactNode;
  href: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  compact?: boolean;
};
export function PrimaryButton({
  children,
  href,
  onNavigate,
  compact
}: LinkProps) {
  return <a className={`sc-button sc-primary${compact ? ' sc-compact' : ''}`} href={href} onClick={event => onNavigate(event, href)} data-component="Primary Button">{children}</a>;
}
export function SecondaryButton({
  children,
  href,
  onNavigate,
  compact
}: LinkProps) {
  return <a className={`sc-button sc-secondary${compact ? ' sc-compact' : ''}`} href={href} onClick={event => onNavigate(event, href)} data-component="Secondary Button">{children}</a>;
}
export function NavigationItem({
  children,
  href,
  onNavigate
}: LinkProps) {
  return <a className="sc-navigation-item" href={href} onClick={event => onNavigate(event, href)} data-component="Navigation Item">{children}</a>;
}
type CardProps = {
  title: string;
  description: string;
};
export function ProblemCard({
  title,
  description
}: CardProps) {
  return <article className="sc-card sc-problem-card" data-component="Problem Card"><h3>{title}</h3><p>{description}</p></article>;
}
export function FeatureCard({
  title,
  description
}: CardProps) {
  return <article className="sc-card sc-feature-card" data-component="Feature Card"><h3>{title}</h3><p>{description}</p></article>;
}
type WorkflowProps = {
  number: string;
  title: string;
  items: string[];
};
export function WorkflowStep({
  number,
  title,
  items
}: WorkflowProps) {
  return <article className="sc-workflow-step" role="listitem" data-component="Workflow Step">
    <p className="sc-step-number">Bước {number}</p>
    <h3>{title}</h3>
    <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>
  </article>;
}
function SectionHeading({
  label,
  title,
  id
}: {
  label: string;
  title: string;
  id: string;
}) {
  return <div className="sc-section-heading"><p className="sc-section-label">{label}</p><h2 id={id}>{title}</h2></div>;
}
export const HomePage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [routeNotice, setRouteNotice] = useState<string | null>(null);
  const onNavigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setMenuOpen(false);
    if (href.startsWith('#')) {
      event.preventDefault();
      setRouteNotice(null);
      document.getElementById(href.slice(1))?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    } else {
      event.preventDefault();
      if (href === '/login') navigate('/login');
      else setRouteNotice(href === '/pricing' ? 'Bảng giá chưa khả dụng.' : 'Tài nguyên chưa khả dụng.');
    }
  };
  const actionProps = {
    onNavigate
  };
  const navItems = [{
    label: 'Sản phẩm',
    href: shelfCashRoutes.product
  }, {
    label: 'Nền tảng',
    href: shelfCashRoutes.platform
  }, {
    label: 'Tài nguyên',
    href: shelfCashRoutes.resources
  }, {
    label: 'Giá bán',
    href: shelfCashRoutes.pricing
  }];
  const problems = [{
    title: 'Khó biết nhu cầu sắp tới',
    description: 'Quyết định nhập hàng thường dựa vào cảm tính hoặc doanh số gần đây, thay vì ước lượng nhu cầu đáng tin cậy.'
  }, {
    title: 'Thiếu hàng và tồn kho dư cùng tồn tại',
    description: 'Mua quá ít gây thiếu hàng. Mua quá nhiều khiến vốn bị giữ trong tồn kho và tăng nguy cơ hao hụt.'
  }, {
    title: 'Dữ liệu có nhưng khó biến thành quyết định',
    description: 'Dữ liệu bán hàng, tồn kho, công thức món và nhà cung cấp nằm ở nhiều nơi, chưa chỉ rõ cần làm gì tiếp theo.'
  }];
  const features = [{
    title: 'Dự báo nhu cầu',
    description: 'Ước lượng nhu cầu sắp tới từ dữ liệu vận hành lịch sử.'
  }, {
    title: 'Lập kế hoạch nhập hàng',
    description: 'Chuyển dự báo thành nhu cầu nguyên liệu và đề xuất nhập hàng.'
  }, {
    title: 'Giải thích quyết định',
    description: 'Hiểu vì sao ShelfCash đề xuất mỗi quyết định nhập hàng.'
  }];
  const workflow = [{
    number: '01',
    title: 'Kết nối dữ liệu vận hành',
    items: ['Dữ liệu bán hàng', 'Tồn kho', 'Công thức món', 'Thông tin nhà cung cấp']
  }, {
    number: '02',
    title: 'Dự báo và lập kế hoạch',
    items: ['Dự báo nhu cầu', 'Nhu cầu nguyên liệu', 'Kế hoạch nhập hàng']
  }, {
    number: '03',
    title: 'Ra quyết định',
    items: ['Mua gì?', 'Mua bao nhiêu?', 'Khi nào cần mua?', 'Vì sao có đề xuất này?']
  }];
  return <div className="sc-page" id="home" lang="vi" data-section="ShelfCash Homepage">
    <header className="sc-navbar" data-section="01 Navbar">
      <div className="sc-container sc-navbar-inner">
        <a className="sc-wordmark" href="#home" onClick={event => onNavigate(event, '#home')} aria-label="ShelfCash — Trang chủ">ShelfCash</a>
        <nav className="sc-desktop-nav" aria-label="Điều hướng chính">
          {navItems.map(item => <NavigationItem key={item.href} href={item.href} {...actionProps}>{item.label}</NavigationItem>)}
        </nav>
        <div className="sc-navbar-actions">
          <SecondaryButton href={shelfCashRoutes.login} compact {...actionProps}>Đăng nhập</SecondaryButton>
          <PrimaryButton href={shelfCashRoutes.register} compact {...actionProps}>Bắt đầu</PrimaryButton>
        </div>
        <button className="sc-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="sc-mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Đóng' : 'Menu'}</button>
      </div>
      {menuOpen && <nav id="sc-mobile-navigation" className="sc-mobile-nav" aria-label="Điều hướng di động">
        {navItems.map(item => <NavigationItem key={item.href} href={item.href} {...actionProps}>{item.label}</NavigationItem>)}
        <NavigationItem href={shelfCashRoutes.login} {...actionProps}>Đăng nhập</NavigationItem>
      </nav>}
    </header>
    <main>
      <section className="sc-hero sc-container" aria-labelledby="sc-hero-title" data-section="02 Hero">
        <h1 id="sc-hero-title">Ra quyết định tồn kho tốt hơn,<br className="sc-desktop-break" /> trước khi vấn đề xảy ra.</h1>
        <p className="sc-hero-description">ShelfCash biến dữ liệu bán hàng và tồn kho thành dự báo nhu cầu, kế hoạch nhập hàng và những quyết định dễ hiểu cho doanh nghiệp F&B.</p>
        <div className="sc-actions">
          <PrimaryButton href={shelfCashRoutes.register} {...actionProps}>Bắt đầu</PrimaryButton>
          <SecondaryButton href={shelfCashRoutes.platform} {...actionProps}>Xem cách ShelfCash hoạt động</SecondaryButton>
        </div>
        <div className="sc-product-preview" aria-label="Minh họa quy trình ShelfCash"><div className="home-preview"><div className="home-preview__bar"><strong>ShelfCash</strong><span>Từ dữ liệu đến quyết định</span></div><div className="home-preview__body"><div><span className="home-preview__eyebrow">MỘT QUY TRÌNH RÕ RÀNG</span><h2>Chủ động hơn<br />với mỗi lần nhập hàng.</h2><p>Tập trung dữ liệu, theo dõi tồn kho và lập kế hoạch trong cùng một nơi.</p></div><ol><li><span>01</span><strong>Nhập dữ liệu</strong><small>Bán hàng · Tồn kho · Công thức</small></li><li><span>02</span><strong>Dự báo nhu cầu</strong><small>Hiểu nhu cầu nguyên liệu sắp tới</small></li><li><span>03</span><strong>Kế hoạch nhập hàng</strong><small>Xem đề xuất và cơ sở quyết định</small></li></ol></div></div></div>
      </section>
      <section className="sc-problem sc-container" aria-labelledby="sc-problem-title" data-section="03 Problem">
        <SectionHeading label="Vấn đề" title="Quản lý tồn kho không chỉ là biết còn bao nhiêu hàng." id="sc-problem-title" />
        <div className="sc-card-grid">
          {problems.map(problem => <ProblemCard key={problem.title} {...problem} />)}
        </div>
      </section>
      <section className="sc-solution" id="solution" aria-labelledby="sc-solution-title" data-section="04 Solution">
        <div className="sc-container">
          <SectionHeading label="Giải pháp" title="Từ dữ liệu vận hành đến quyết định có thể hành động." id="sc-solution-title" />
          <div className="sc-card-grid">
            {features.map(feature => <FeatureCard key={feature.title} {...feature} />)}
          </div>
        </div>
      </section>
      <section className="sc-how sc-container" id="how-it-works" aria-labelledby="sc-how-title" data-section="05 How It Works">
        <SectionHeading label="Cách ShelfCash hoạt động" title="Từ dữ liệu đến quyết định trong một quy trình rõ ràng." id="sc-how-title" />
        <div className="sc-workflow" role="list" aria-label="Quy trình ShelfCash gồm ba bước">
          {workflow.map((step, index) => <Fragment key={step.number}>
            <WorkflowStep {...step} />
            {index < workflow.length - 1 && <span className="sc-flow-arrow" aria-hidden="true">→</span>}
          </Fragment>)}
        </div>
      </section>
    </main>
    {routeNotice && <div className="sc-route-notice" role="status"><span>{routeNotice}</span><button type="button" onClick={() => setRouteNotice(null)} aria-label="Đóng thông báo">Đóng</button></div>}
  </div>;
};
