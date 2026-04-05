import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../../context/AuthContext';
import './Login.css';

function resolveRedirect(search) {
  const params = new URLSearchParams(search);
  const redirect = params.get('redirect');

  if (!redirect || !redirect.startsWith('/')) {
    return '/';
  }

  return redirect;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = useMemo(() => resolveRedirect(location.search), [location.search]);
  const { login, isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const signedInUser = await login(form);
      const blockedManagement = redirectTo === '/quan-ly' && signedInUser?.role === 'student';
      navigate(blockedManagement ? '/' : redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoHome = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <section className="login-split-page">
      <div className="login-split-banner">
        <div className="login-banner-content">
          <img src="/images/logo_truong.png" alt="Logo HCMUE" className="login-brand-logo" />
          <div className="login-banner-text">
            <h1>Thành phố em yêu</h1>
            <p>Hệ thống học tập và khám phá vẻ đẹp của Thành phố Hồ Chí Minh. Dành cho {ROLE_LABELS.admin}, {ROLE_LABELS.school}, {ROLE_LABELS.teacher} và {ROLE_LABELS.student}.</p>
          </div>

          <ul className="login-banner-features">
            <li><i className="fa-solid fa-check"></i> Tạo và quản lí tài khoản theo phân cấp</li>
            <li><i className="fa-solid fa-check"></i> Theo dõi kết quả học tập tự động</li>
            <li><i className="fa-solid fa-check"></i> Phân quyền truy cập rõ ràng</li>
          </ul>

          <div className="login-banner-footer">
            <span>Khám phá:</span>
            <Link to="/">Trang chủ</Link>
            <Link to="/dia-ly">Địa lí</Link>
            <Link to="/lich-su">Lịch sử</Link>
            <Link to="/van-hoa">Văn hóa</Link>
          </div>
        </div>
      </div>

      <div className="login-split-form-wrapper">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Đăng nhập</h2>
            <p>Nhập tài khoản của bạn để tiếp tục truy cập vào hệ thống.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label htmlFor="username">Tên đăng nhập</label>
            </div>

            <div className="login-field">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label htmlFor="password">Mật khẩu</label>
            </div>

            {error ? <div className="login-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</div> : null}

            <button type="submit" className="login-submit" disabled={submitting}>
              {submitting ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
            </button>
          </form>

          <div className="login-back-home">
            <Link to="/" onClick={handleGoHome}>
              <i className="fa-solid fa-arrow-left"></i> Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
