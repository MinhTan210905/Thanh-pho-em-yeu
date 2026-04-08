import './ViTri.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GameRedirect from '../../components/common/GameRedirect';

export default function ViTri() {
  const { t } = useTranslation();
  useEffect(() => {
    document.body.classList.add('page-vi-tri-active');
    return () => {
      document.body.classList.remove('page-vi-tri-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.vi-tri-page .section-wrapper');

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
    <div className="vi-tri-page">
      {/* ── HERO ── */}
      <section className="vt-hero">
        <div className="vt-hero-deco vt-deco-topo"></div>
        <div className="vt-hero-deco vt-deco-compass"></div>
        <div className="vt-hero-deco vt-deco-grid"></div>

        <div className="container section-wrapper vt-hero-inner">
          <div className="vt-hero-badge reveal fade-up">
            <span>{t("geography_page.location.badge_geo")}</span>
            <span className="vt-dot">·</span>
            <span className="vt-badge-accent">{t("geography_page.location.badge_vt")}</span>
          </div>

          <h1 className="vt-hero-title reveal fade-up delay-100">
            {t("geography_page.location.hero_title")} <span className="vt-highlight">{t("geography_page.location.highlight")}</span>
          </h1>

          <p className="vt-hero-desc reveal fade-up delay-200">
            {t("geography_page.location.hero_desc")}
          </p>

          <div className="vt-hero-pills reveal fade-up delay-300">
            <div className="vt-pill">
              <i className="fas fa-expand-arrows-alt"></i>
              <div>
                <strong>{t("geography_page.location.pill1_title")}</strong>
                <span>{t("geography_page.location.pill1_desc")}</span>
              </div>
            </div>
            <div className="vt-pill">
              <i className="fas fa-users"></i>
              <div>
                <strong>{t("geography_page.location.pill2_title")}</strong>
                <span>{t("geography_page.location.pill2_desc")}</span>
              </div>
            </div>
            <div className="vt-pill">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <strong>{t("geography_page.location.pill3_title")}</strong>
                <span>{t("geography_page.location.pill3_desc")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="vt-geo-content">
        <div className="section-wrapper vt-core-group">
          {/* Stats Dashboard */}
          <section className="vt-geo-stats">
            <div className="container">
              <div className="vt-stats-head reveal fade-up">
                <span className="vt-tag">{t("geography_page.location.stat_tag")}</span>
                <h2 className="vt-section-title">{t("geography_page.location.stat_title")}</h2>
                <p className="vt-stats-subtitle">
                  {t("geography_page.location.stat_desc")}
                </p>
              </div>

              <div className="vt-stats-grid reveal fade-up delay-200">
                <div className="vt-stat-card vt-stat-main">
                  <div className="vt-stat-icon">
                    <i className="fas fa-ruler-combined"></i>
                  </div>
                  <div className="vt-stat-number">6.772</div>
                  <div className="vt-stat-unit">km²</div>
                  <div className="vt-stat-label">{t("geography_page.location.stat_area_label")}</div>
                  <div className="vt-stat-glow" aria-hidden="true"></div>
                </div>

                <div className="vt-stat-card">
                  <div className="vt-stat-icon">
                    <i className="fas fa-city"></i>
                  </div>
                  <div className="vt-stat-number">168</div>
                  <div className="vt-stat-unit">{t("geography_page.location.stat_admin_unit")}</div>
                  <div className="vt-stat-label">{t("geography_page.location.stat_admin_label")}</div>
                  <div className="vt-stat-breakdown">{t("geography_page.location.stat_admin_breakdown")}</div>
                </div>

                <div className="vt-stat-card vt-stat-accent">
                  <div className="vt-stat-icon">
                    <i className="fas fa-user-friends"></i>
                  </div>
                  <div className="vt-stat-number">14+</div>
                  <div className="vt-stat-unit">{t("geography_page.location.stat_pop_unit")}</div>
                  <div className="vt-stat-label">{t("geography_page.location.stat_pop_label")}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Geographic Highlights */}
          <section className="vt-highlights">
            <div className="container">
              <div className="vt-highlights-head reveal fade-up">
                <span className="vt-tag">{t("geography_page.location.hl_tag")}</span>
                <h2 className="vt-section-title">{t("geography_page.location.hl_title")}</h2>
              </div>

              <div className="vt-highlights-grid reveal fade-up delay-200">
                <div className="vt-hl-card">
                  <div className="vt-hl-icon">
                    <i className="fas fa-compass"></i>
                  </div>
                  <h3>{t("geography_page.location.hl1_title")}</h3>
                  <p>
                    {t("geography_page.location.hl1_desc")}
                  </p>
                </div>

                <div className="vt-hl-card">
                  <div className="vt-hl-icon">
                    <i className="fas fa-water"></i>
                  </div>
                  <h3>{t("geography_page.location.hl2_title")}</h3>
                  <p>
                    {t("geography_page.location.hl2_desc")}
                  </p>
                </div>

                <div className="vt-hl-card">
                  <div className="vt-hl-icon">
                    <i className="fas fa-plane-departure"></i>
                  </div>
                  <h3>{t("geography_page.location.hl3_title")}</h3>
                  <p>
                    {t("geography_page.location.hl3_desc")}
                  </p>
                </div>

                <div className="vt-hl-card vt-hl-accent">
                  <div className="vt-hl-icon">
                    <i className="fas fa-globe-asia"></i>
                  </div>
                  <h3>{t("geography_page.location.hl4_title")}</h3>
                  <p>
                    {t("geography_page.location.hl4_desc")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Canva Embed */}
          <section className="vt-canvas">
            <div className="container">
              <div className="vt-canvas-intro reveal fade-up">
                <h3>{t("geography_page.canvas_intro_title")}</h3>
                <p>{t("geography_page.location.canvas_intro_desc")}</p>
              </div>
              <div className="vt-canvas-frame reveal fade-up delay-200">
                <div className="vt-canvas-embed">
                  <iframe
                    loading="lazy"
                    src="https://www.canva.com/design/DAG6jKSZUe0/DCjgreIvm-qjpmn5JVA_lw/view?embed"
                    allowFullScreen
                    allow="fullscreen"
                    title="VỊ TRÍ ĐỊA LÍ TPHCM"
                  ></iframe>
                </div>
              </div>
            </div>

            <GameRedirect to="/tro-choi-vi-tri" gameName={t("learning_page.quiz.games.vi_tri.title")} />
          </section>
        </div>
      </main>
    </div>
  );
}
