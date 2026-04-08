import './DiTich.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GameRedirect from '../../components/common/GameRedirect';

export default function DiTich() {
  const { t } = useTranslation();
  useEffect(() => {
    document.body.classList.add('page-di-tich-active');
    return () => {
      document.body.classList.remove('page-di-tich-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.di-tich-page .section-wrapper');

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
    <div className="di-tich-page">
      {/* ── HERO ── */}
      <section className="dt-hero">
        <div className="dt-hero-deco dt-deco-diamond"></div>
        <div className="dt-hero-deco dt-deco-stripe"></div>
        <div className="dt-hero-deco dt-deco-bottom-right"></div>

        <div className="container section-wrapper dt-hero-inner">
          <div className="dt-hero-badge reveal fade-up">
            <span>{t("history_page.relics.badge_his")}</span>
            <span className="dt-dot">·</span>
            <span className="dt-badge-accent">{t("history_page.relics.badge_relics")}</span>
          </div>

          <h1 className="dt-hero-title reveal fade-up delay-100">
            {t("history_page.relics.hero_title")} <span className="dt-highlight">{t("history_page.relics.highlight")}</span>
          </h1>

          <p className="dt-hero-desc reveal fade-up delay-200">
            {t("history_page.relics.hero_desc")}
          </p>

          <div className="dt-hero-stats reveal fade-up delay-300">
            <div className="dt-stat">
              <i className="fas fa-landmark"></i>
              <div>
                <strong>{t("history_page.relics.pill1_title")}</strong>
                <span>{t("history_page.relics.pill1_desc")}</span>
              </div>
            </div>
            <div className="dt-stat">
              <i className="fas fa-hourglass-half"></i>
              <div>
                <strong>{t("history_page.relics.pill2_title")}</strong>
                <span>{t("history_page.relics.pill2_desc")}</span>
              </div>
            </div>
            <div className="dt-stat">
              <i className="fas fa-shield-alt"></i>
              <div>
                <strong>{t("history_page.relics.pill3_title")}</strong>
                <span>{t("history_page.relics.pill3_desc")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="dt-content">
        <div className="section-wrapper dt-core-group">
          {/* Timeline */}
          <section className="dt-timeline-section">
            <div className="container">
              <div className="dt-section-head reveal fade-up">
                <span className="dt-tag">{t("history_page.relics.tl_tag")}</span>
                <h2 className="dt-section-title">{t("history_page.relics.tl_title")}</h2>
              </div>

              <div className="dt-timeline reveal fade-up delay-200">
                <div className="dt-timeline-line" aria-hidden="true"></div>

                {/* — Thời kì 1 — */}
                <div className="dt-tl-item dt-tl-left">
                  <div className="dt-tl-dot">
                    <i className="fas fa-gopuram"></i>
                  </div>
                  <div className="dt-tl-card">
                    <span className="dt-tl-era">{t("history_page.relics.era1_tag")}</span>
                    <h3>{t("history_page.relics.era1_title")}</h3>
                    <p>
                      {t("history_page.relics.era1_desc")}
                    </p>
                  </div>
                </div>

                {/* — Thời kì 2 — */}
                <div className="dt-tl-item dt-tl-right">
                  <div className="dt-tl-dot">
                    <i className="fas fa-compass"></i>
                  </div>
                  <div className="dt-tl-card">
                    <span className="dt-tl-era">{t("history_page.relics.era2_tag")}</span>
                    <h3>{t("history_page.relics.era2_title")}</h3>
                    <p>
                      {t("history_page.relics.era2_desc")}
                    </p>
                  </div>
                </div>

                {/* — Thời kì 3 — */}
                <div className="dt-tl-item dt-tl-left">
                  <div className="dt-tl-dot">
                    <i className="fas fa-fist-raised"></i>
                  </div>
                  <div className="dt-tl-card">
                    <span className="dt-tl-era">{t("history_page.relics.era3_tag")}</span>
                    <h3>{t("history_page.relics.era3_title")}</h3>
                    <p>
                      {t("history_page.relics.era3_desc")}
                    </p>
                  </div>
                </div>

                {/* — Thời kì 4 — */}
                <div className="dt-tl-item dt-tl-right">
                  <div className="dt-tl-dot dt-tl-dot-accent">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="dt-tl-card dt-tl-card-accent">
                    <span className="dt-tl-era">{t("history_page.relics.era4_tag")}</span>
                    <h3>{t("history_page.relics.era4_title")}</h3>
                    <p>
                      {t("history_page.relics.era4_desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Canva */}
          <section className="dt-canvas">
            <div className="container">
              <div className="dt-canvas-intro reveal fade-up">
                <h3>{t("history_page.canvas_intro_title")}</h3>
                <p>{t("history_page.relics.canvas_intro_desc")}</p>
              </div>
              <div className="dt-canvas-frame reveal fade-up delay-200">
                <div className="dt-canvas-embed">
                  <iframe
                    loading="lazy"
                    src="https://www.canva.com/design/DAHAV9VyCHk/Ry-x2mIW4x9NgMCCnnogCg/watch?embed"
                    allowFullScreen
                    allow="fullscreen"
                    title="DI TÍCH LỊCH SỬ TPHCM"
                  ></iframe>
                </div>
              </div>
            </div>

            <GameRedirect to="/tro-choi-di-tich-lich-su" gameName={t("learning_page.quiz.games.di_tich.title")} />
          </section>
        </div>
      </main>
    </div>
  );
}
