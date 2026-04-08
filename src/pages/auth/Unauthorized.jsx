import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Login.css';

export default function Unauthorized() {
  const { t } = useTranslation();
  return (
    <section className="login-page">
      <div className="login-shell">
        <div className="login-card" style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2>{t("auth_page.login.unauthorized.title")}</h2>
          <p>
            {t("auth_page.login.unauthorized.desc")}
          </p>
          <div className="login-actions" style={{ marginTop: 18, display: 'flex', gap: 12 }}>
            <Link to="/quan-ly">{t("auth_page.login.unauthorized.btn_management")}</Link>
            <Link to="/">{t("auth_page.login.unauthorized.btn_home")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
