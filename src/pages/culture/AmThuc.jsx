import './AmThuc.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GameRedirect from '../../components/common/GameRedirect';

export default function AmThuc() {
  const { t } = useTranslation();
  useEffect(() => {
    document.body.classList.add('page-am-thuc-active');
    return () => {
      document.body.classList.remove('page-am-thuc-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.am-thuc-page .section-wrapper');

      if (sectionWrappers.length === 0) {
        return;
      }

      observer = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
              obs.unobserve(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );

      sectionWrappers.forEach((el) => observer.observe(el));
    }, 250);

    return () => {
      clearTimeout(setupTimer);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div className="am-thuc-page">
      <section className="at-hero">
        <div className="at-hero-glow at-glow-1"></div>
        <div className="at-hero-glow at-glow-2"></div>
        <div className="container section-wrapper at-hero-grid">
          <div className="at-hero-copy">
            <div className="at-breadcrumb reveal fade-up">
              <span>{t("culture_page.food.badge_cul")}</span>
              <span className="at-separator">•</span>
              <span className="at-current">{t("culture_page.food.badge_food")}</span>
            </div>
            <h1 className="at-title reveal fade-up delay-100">{t("culture_page.food.hero_title")}</h1>
            <p className="at-subtitle reveal fade-up delay-200">
              {t("culture_page.food.hero_desc")}
            </p>
            <div className="at-hero-points reveal fade-up delay-300">
              <span>{t("culture_page.food.point1")}</span>
              <span>{t("culture_page.food.point2")}</span>
              <span>{t("culture_page.food.point3")}</span>
            </div>
          </div>

          <div className="at-hero-panel reveal zoom-in delay-300">
            <div className="at-stat-card">
              <span className="at-stat-label">{t("culture_page.food.stat1_label")}</span>
              <strong className="at-stat-value">{t("culture_page.food.stat1_val")}</strong>
            </div>
            <div className="at-stat-card">
              <span className="at-stat-label">{t("culture_page.food.stat2_label")}</span>
              <strong className="at-stat-value">{t("culture_page.food.stat2_val")}</strong>
            </div>
            <div className="at-stat-card">
              <span className="at-stat-label">{t("culture_page.food.stat3_label")}</span>
              <strong className="at-stat-value">{t("culture_page.food.stat3_val")}</strong>
            </div>
          </div>
        </div>
      </section>

      <main className="at-content">
        <div className="section-wrapper at-core-group">
          <section className="at-overview">
            <div className="container">
             <div className="at-overview-top reveal fade-up">
               <span className="at-tag">{t("culture_page.food.sec_tag")}</span>
               <h2 className="at-section-title">{t("culture_page.food.sec_title")}</h2>
             </div>

             <div className="at-bento-grid reveal fade-up delay-200">
               <div className="at-bento-summary">
                 <div className="at-summary-badge">
                   <i className="fas fa-utensils"></i>
                   {t("culture_page.food.bento_badge")}
                 </div>
                 <h3 className="at-summary-title">
                   {t("culture_page.food.bento_title")}
                 </h3>
                 <p className="at-summary-desc">
                   {t("culture_page.food.bento_desc")}
                 </p>
                 <div className="at-summary-regions">
                   <span><i className="fas fa-location-dot"></i> {t("culture_page.food.north")}</span>
                   <span><i className="fas fa-location-dot"></i> {t("culture_page.food.central")}</span>
                   <span><i className="fas fa-location-dot"></i> {t("culture_page.food.south")}</span>
                   <span><i className="fas fa-globe-asia"></i> {t("culture_page.food.orient")}</span>
                 </div>
               </div>

               <div className="at-bento-cards">
                 <div className="at-b-card">
                   <div className="at-b-icon"><i className="fas fa-clock"></i></div>
                   <div>
                     <h3>{t("culture_page.food.card1_title")}</h3>
                     <p>{t("culture_page.food.card1_desc")}</p>
                   </div>
                 </div>
                 <div className="at-b-card">
                   <div className="at-b-icon"><i className="fas fa-mug-hot"></i></div>
                   <div>
                     <h3>{t("culture_page.food.card2_title")}</h3>
                     <p>{t("culture_page.food.card2_desc")}</p>
                   </div>
                 </div>
                 <div className="at-b-card at-b-card-accent">
                   <div className="at-b-icon"><i className="fas fa-star"></i></div>
                   <div>
                     <h3>{t("culture_page.food.card3_title")}</h3>
                     <p>{t("culture_page.food.card3_desc")}</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </section>

        <section className="at-canvas">
          <div className="container">
            <div className="at-canvas-head reveal fade-up">
              <h3>{t("culture_page.canvas_intro_detail")}</h3>
              <p>{t("culture_page.food.canvas_desc")}</p>
            </div>
            <div className="at-canvas-wrapper reveal fade-up delay-200">
              <div className="at-canvas-embed">
                <iframe
                  loading="lazy"
                  src="https://www.canva.com/design/DAG9QlrPYmY/5Ra1NBbgB0OT_NpMmPNX9Q/view?embed"
                  allowFullScreen
                  allow="fullscreen"
                  title="ẨM THỰC TP.HCM"
                ></iframe>
              </div>
            </div>
          </div>

          <GameRedirect to="/tro-choi-am-thuc" gameName={t("learning_page.quiz.games.am_thuc.title")} />
        </section>
        </div>
      </main>
    </div>
  );
}
