import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer-area">
      <div className="footer-container">
        <div className="footer-row">
          <div className="footer-col left">
            <img src="/images/logo_truong.png" alt="Logo Footer" className="footer-logo" />

            <div className="footer-socials">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-tiktok"></i></a>
              <a href="#"><i className="fab fa-youtube"></i></a>
            </div>

            <div className="footer-info">
              <h4>{t("footer.university")}</h4>
              <p>{t("footer.address")}</p>

              <br />

              <h4>{t("footer.faculty")}</h4>
              <a href="#" className="footer-link">{t("footer.project")}</a>
              <p>{t("footer.contact")}</p>
            </div>
          </div>

          <div className="footer-col middle">
            <ul className="footer-links">
              <li><Link to="/">{t("header.home")}</Link></li>
              <li><Link to="/dia-ly">{t("header.geography")}</Link></li>
              <li><Link to="/lich-su">{t("header.history")}</Link></li>
              <li><Link to="/van-hoa">{t("header.culture")}</Link></li>
              <li><Link to="/hoc-tap">{t("header.learning")}</Link></li>
            </ul>
          </div>

          <div className="footer-col right">
            <h3>{t("footer.subscribe_title")}</h3>
            <p>{t("footer.subscribe_desc")}</p>

            <form className="subscribe-form">
              <input type="email" placeholder={t("footer.email_placeholder")} />
              <button type="submit">
                {t("footer.btn_subscribe")} <i className="fas fa-arrow-right"></i>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container bottom-row">
          <p>{t("footer.designed_by")}</p>
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
