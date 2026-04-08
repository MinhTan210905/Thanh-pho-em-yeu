import './KinhTe.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GameRedirect from '../../components/common/GameRedirect';

export default function KinhTe() {
  const { t } = useTranslation();
  useEffect(() => {
    document.body.classList.add('page-kinh-te-active');
    return () => {
      document.body.classList.remove('page-kinh-te-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.kinh-te-page .section-wrapper');

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
    <div className="kinh-te-page">
      {/* ── HERO ── */}
      <section className="kt-hero">
        <div className="kt-hero-deco kt-deco-chart"></div>
        <div className="kt-hero-deco kt-deco-bars"></div>
        <div className="kt-hero-deco kt-deco-pulse"></div>

        <div className="container section-wrapper kt-hero-inner">
          <div className="kt-hero-badge reveal fade-up">
            <span>{t("geography_page.economy.badge_geo")}</span>
            <span className="kt-dot">·</span>
            <span className="kt-badge-accent">{t("geography_page.economy.badge_kt")}</span>
          </div>

          <h1 className="kt-hero-title reveal fade-up delay-100">
            {t("geography_page.economy.hero_title")} <span className="kt-highlight">{t("geography_page.economy.highlight")}</span>
          </h1>

          <p className="kt-hero-desc reveal fade-up delay-200">
            {t("geography_page.economy.hero_desc")}
          </p>

          <div className="kt-hero-pills reveal fade-up delay-300">
            <div className="kt-pill">
              <i className="fas fa-briefcase"></i>
              <div>
                <strong>{t("geography_page.economy.pill1_title")}</strong>
                <span>{t("geography_page.economy.pill1_desc")}</span>
              </div>
            </div>
            <div className="kt-pill">
              <i className="fas fa-industry"></i>
              <div>
                <strong>{t("geography_page.economy.pill2_title")}</strong>
                <span>{t("geography_page.economy.pill2_desc")}</span>
              </div>
            </div>
            <div className="kt-pill">
              <i className="fas fa-seedling"></i>
              <div>
                <strong>{t("geography_page.economy.pill3_title")}</strong>
                <span>{t("geography_page.economy.pill3_desc")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="kt-content">
        <div className="section-wrapper kt-core-group">

          {/* KPI Strip */}
          <section className="kt-kpi-strip">
            <div className="container">
              <div className="kt-kpi-bar reveal fade-up">
                <div className="kt-kpi">
                  <div className="kt-kpi-number">3</div>
                  <div className="kt-kpi-text">
                    <span>{t("geography_page.economy.kpi1_top")}</span>
                    <span>{t("geography_page.economy.kpi1_bot")}</span>
                  </div>
                </div>
                <div className="kt-kpi-divider"></div>
                <div className="kt-kpi">
                  <div className="kt-kpi-number">10+</div>
                  <div className="kt-kpi-text">
                    <span>{t("geography_page.economy.kpi2_top")}</span>
                    <span>{t("geography_page.economy.kpi2_bot")}</span>
                  </div>
                </div>
                <div className="kt-kpi-divider"></div>
                <div className="kt-kpi">
                  <div className="kt-kpi-number">No.1</div>
                  <div className="kt-kpi-text">
                    <span>{t("geography_page.economy.kpi3_top")}</span>
                    <span>{t("geography_page.economy.kpi3_bot")}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sector Bento Grid */}
          <section className="kt-sectors">
            <div className="container">
              <div className="kt-sectors-head reveal fade-up">
                <span className="kt-tag">{t("geography_page.economy.sector_tag")}</span>
                <h2 className="kt-section-title">{t("geography_page.economy.sector_title")}</h2>
              </div>

              <div className="kt-bento reveal fade-up delay-200">
                {/* Large card — Dịch vụ */}
                <article className="kt-bento-card kt-bento-large">
                  <div className="kt-bento-icon-wrap">
                    <i className="fas fa-concierge-bell"></i>
                  </div>
                  <h3>{t("geography_page.economy.sec1_title")}</h3>
                  <p>
                    {t("geography_page.economy.sec1_desc")}
                  </p>
                  <div className="kt-deco-motif" aria-hidden="true"></div>
                </article>

                {/* Right column — stacked */}
                <article className="kt-bento-card">
                  <div className="kt-bento-icon-wrap">
                    <i className="fas fa-hard-hat"></i>
                  </div>
                  <h3>{t("geography_page.economy.sec2_title")}</h3>
                  <p>
                    {t("geography_page.economy.sec2_desc")}
                  </p>
                  <div className="kt-deco-motif" aria-hidden="true"></div>
                </article>

                <article className="kt-bento-card kt-bento-accent">
                  <div className="kt-bento-icon-wrap">
                    <i className="fas fa-leaf"></i>
                  </div>
                  <h3>{t("geography_page.economy.sec3_title")}</h3>
                  <p>
                    {t("geography_page.economy.sec3_desc")}
                  </p>
                  <div className="kt-deco-motif" aria-hidden="true"></div>
                </article>
              </div>
            </div>
          </section>

          {/* Future Outlook callout */}
          <section className="kt-outlook">
            <div className="container reveal fade-up">
              <div className="kt-outlook-box">
                <div className="kt-outlook-icon"><i className="fas fa-rocket"></i></div>
                <div className="kt-outlook-content">
                  <h3>{t("geography_page.economy.outlook_title")}</h3>
                  <p>
                    {t("geography_page.economy.outlook_desc")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Canva Embed */}
          <section className="kt-canvas">
            <div className="container">
              <div className="kt-canvas-intro reveal fade-up">
                <h3>{t("geography_page.canvas_intro_title")}</h3>
                <p>{t("geography_page.economy.canvas_intro_desc")}</p>
              </div>
              <div className="kt-canvas-frame reveal fade-up delay-200">
                <div className="kt-canvas-embed">
                  <iframe
                    loading="lazy"
                    src="https://www.canva.com/design/DAG8kxFStN4/ulDiQDr61wl6nEWVh1_TJA/view?embed"
                    allowFullScreen
                    allow="fullscreen"
                    title="ĐỊA LÍ KINH TẾ TPHCM"
                  ></iframe>
                </div>
              </div>
            </div>

            <GameRedirect to="/tro-choi-kinh-te" gameName={t("learning_page.quiz.games.kinh_te.title")} />
          </section>
        </div>
      </main>
    </div>
  );
}
