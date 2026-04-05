import { Link } from 'react-router-dom';
import './Login.css';

export default function Unauthorized() {
  return (
    <section className="login-page">
      <div className="login-shell">
        <div className="login-card" style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2>Bạn không có quyền truy cập</h2>
          <p>
            Tài khoản hiện tại không có quyền mở trang này. Vui lòng đăng nhập bằng tài khoản phù hợp.
          </p>
          <div className="login-actions" style={{ marginTop: 18, display: 'flex', gap: 12 }}>
            <Link to="/quan-ly">Về trang quản lí</Link>
            <Link to="/">Về trang chủ</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
