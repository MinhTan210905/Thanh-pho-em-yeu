import './LeHoi.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GameRedirect from '../../components/common/GameRedirect';

export default function LeHoi() {
  const { t } = useTranslation();
  useEffect(() => {
    document.body.classList.add('page-le-hoi-active');
    return () => {
      document.body.classList.remove('page-le-hoi-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.le-hoi-page .section-wrapper');

      if (sectionWrappers.length === 0) return;

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
    <div className="le-hoi-page">
      {/* ── HERO ── */}
      <section className="lh-hero">
        <div className="lh-hero-deco lh-deco-stars"></div>
        <div className="lh-hero-deco lh-deco-stars lh-stars-2"></div>
        <div className="lh-hero-deco lh-deco-1"></div>
        <div className="lh-hero-deco lh-deco-2"></div>
        <div className="lh-hero-deco lh-deco-3"></div>

        <div className="container section-wrapper lh-hero-inner">
          <div className="lh-hero-badge reveal fade-up">
            <span>{t("culture_page.festival.badge_cul")}</span>
            <span className="lh-dot">·</span>
            <span className="lh-badge-accent">{t("culture_page.festival.badge_fest")}</span>
          </div>

          <h1 className="lh-hero-title reveal fade-up delay-100">
            {t("culture_page.festival.hero_title")} <span className="lh-highlight">{t("culture_page.festival.highlight")}</span>
          </h1>

          <p className="lh-hero-desc reveal fade-up delay-200">
            {t("culture_page.festival.hero_desc")}
          </p>

          <div className="lh-hero-chips reveal fade-up delay-300">
            <div className="lh-chip">
              <i className="fas fa-fire"></i>
              <div>
                <strong>{t("culture_page.festival.chip1_title")}</strong>
                <span>{t("culture_page.festival.chip1_desc")}</span>
              </div>
            </div>
            <div className="lh-chip">
              <i className="fas fa-city"></i>
              <div>
                <strong>{t("culture_page.festival.chip2_title")}</strong>
                <span>{t("culture_page.festival.chip2_desc")}</span>
              </div>
            </div>
            <div className="lh-chip">
              <i className="fas fa-users"></i>
              <div>
                <strong>{t("culture_page.festival.chip3_title")}</strong>
                <span>{t("culture_page.festival.chip3_desc")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="lh-content">
        <div className="section-wrapper lh-core-group">
          {/* Feature Strip */}
          <section className="lh-features">
            <div className="container">
              <div className="lh-features-head reveal fade-up">
                <span className="lh-tag">{t("culture_page.festival.sec_tag")}</span>
                <h2 className="lh-section-title">{t("culture_page.festival.sec_title")}</h2>
              </div>

              <div className="lh-strip reveal fade-up delay-200">
                <div className="lh-strip-card lh-strip-wide">
                  <div className="lh-strip-num">{t("culture_page.festival.str1_num")}</div>
                  <h3>{t("culture_page.festival.str1_title")}</h3>
                  <p>
                    {t("culture_page.festival.str1_desc")}
                  </p>
                </div>
                <div className="lh-strip-card">
                  <div className="lh-strip-num">{t("culture_page.festival.str2_num")}</div>
                  <h3>{t("culture_page.festival.str2_title")}</h3>
                  <p>
                    {t("culture_page.festival.str2_desc")}
                  </p>
                </div>
                <div className="lh-strip-card lh-strip-accent">
                  <div className="lh-strip-num">{t("culture_page.festival.str3_num")}</div>
                  <h3>{t("culture_page.festival.str3_title")}</h3>
                  <p>{t("culture_page.festival.str3_desc")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Canva */}
          <section className="lh-canvas">
            <div className="container">
              <div className="lh-canvas-intro reveal fade-up">
                <h3>{t("culture_page.canvas_intro_title")}</h3>
                <p>{t("culture_page.festival.canvas_desc")}</p>
              </div>
              <div className="lh-canvas-frame reveal fade-up delay-200">
                <div className="lh-canvas-embed">
                  <iframe
                    loading="lazy"
                    src="https://www.canva.com/design/DAG_qp2TOAw/s9BdksGn9vWOZmC9yRzAaw/watch?embed"
                    allowFullScreen
                    allow="fullscreen"
                    title="LỄ HỘI TP.HCM"
                  ></iframe>
                </div>
              </div>
            </div>

            <GameRedirect to="/tro-choi-le-hoi" gameName={t("learning_page.quiz.games.le_hoi.title")} />
          </section>
        </div>
      </main>
    </div>
  );
}
