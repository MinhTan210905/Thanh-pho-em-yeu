import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
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
  const { t } = useTranslation();
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
      setError(err.message || t("auth_page.login.error_failed"));
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
            <h1>{t("auth_page.login.banner_title")}</h1>
            <p>{t("auth_page.login.banner_desc")}</p>
          </div>

          <ul className="login-banner-features">
            <li><i className="fa-solid fa-check"></i> {t("auth_page.login.feature1")}</li>
            <li><i className="fa-solid fa-check"></i> {t("auth_page.login.feature2")}</li>
            <li><i className="fa-solid fa-check"></i> {t("auth_page.login.feature3")}</li>
          </ul>

          <div className="login-banner-footer">
            <span>{t("auth_page.login.explore")}</span>
            <Link to="/">{t("auth_page.login.nav_home")}</Link>
            <Link to="/dia-ly">{t("auth_page.login.nav_geo")}</Link>
            <Link to="/lich-su">{t("auth_page.login.nav_his")}</Link>
            <Link to="/van-hoa">{t("auth_page.login.nav_cul")}</Link>
          </div>
        </div>
      </div>

      <div className="login-split-form-wrapper">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>{t("auth_page.login.form_title")}</h2>
            <p>{t("auth_page.login.form_desc")}</p>
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
              <label htmlFor="username">{t("auth_page.login.label_username")}</label>
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
              <label htmlFor="password">{t("auth_page.login.label_password")}</label>
            </div>

            {error ? <div className="login-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</div> : null}

            <button type="submit" className="login-submit" disabled={submitting}>
              {submitting ? t("auth_page.login.btn_submitting") : t("auth_page.login.btn_login")}
            </button>
          </form>

          <div className="login-back-home">
            <Link to="/" onClick={handleGoHome}>
              <i className="fa-solid fa-arrow-left"></i> {t("auth_page.login.back_home")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
