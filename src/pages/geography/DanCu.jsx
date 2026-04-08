import './DanCu.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GameRedirect from '../../components/common/GameRedirect';

export default function DanCu() {
  const { t } = useTranslation();
  useEffect(() => {
    document.body.classList.add('page-dan-cu-active');
    return () => {
      document.body.classList.remove('page-dan-cu-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.dan-cu-page .section-wrapper');
      const heroReveals = document.querySelectorAll('.dc-hero .reveal');

      const allTargets = [...sectionWrappers, ...heroReveals];
      if (allTargets.length === 0) return;

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

      allTargets.forEach((el) => observer.observe(el));
    }, 250);

    return () => {
      clearTimeout(setupTimer);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div className="dan-cu-page">
      {/* ── HERO ── */}
      <section className="dc-hero">
        <div className="dc-hero-deco dc-deco-circles"></div>
        <div className="dc-hero-deco dc-deco-dots"></div>
        <div className="dc-hero-deco dc-deco-glow"></div>
        <div className="dc-hero-deco dc-deco-grid"></div>
        <div className="dc-hero-deco dc-deco-stripe"></div>

        <div className="container dc-hero-inner">
          <span className="dc-hero-badge reveal fade-up">
            {t("geography_page.population.badge_geo")}
            <span className="dc-dot">·</span>
            <span className="dc-badge-accent">{t("geography_page.population.badge_dc")}</span>
          </span>

          <h1 className="dc-hero-title reveal fade-up delay-100">
            {t("geography_page.population.hero_title")}<br /><span className="dc-highlight">{t("geography_page.population.highlight")}</span>
          </h1>

          <p className="dc-hero-desc reveal fade-up delay-200">
            {t("geography_page.population.hero_desc")}
          </p>

          {/* Dashboard stat bar — grouped with hero content */}
          <div className="dc-stat-bar reveal fade-up delay-300">
            <div className="dc-bar-item">
              <i className="fas fa-users"></i>
              <div>
                <span className="dc-bar-num">14+</span>
                <span className="dc-bar-label">{t("geography_page.population.bar1_label")}</span>
              </div>
            </div>
            <div className="dc-bar-divider"></div>
            <div className="dc-bar-item">
              <i className="fas fa-map-location-dot"></i>
              <div>
                <span className="dc-bar-num">168</span>
                <span className="dc-bar-label">{t("geography_page.population.bar2_label")}</span>
              </div>
            </div>
            <div className="dc-bar-divider"></div>
            <div className="dc-bar-item">
              <i className="fas fa-city"></i>
              <div>
                <span className="dc-bar-num">{t("geography_page.population.bar3_num")}</span>
                <span className="dc-bar-label">{t("geography_page.population.bar3_label")}</span>
              </div>
            </div>
            <div className="dc-bar-divider"></div>
            <div className="dc-bar-item">
              <i className="fas fa-people-group"></i>
              <div>
                <span className="dc-bar-num">54</span>
                <span className="dc-bar-label">{t("geography_page.population.bar4_label")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="dc-content">
        <div className="section-wrapper dc-core-group">

          {/* Overview Stats */}
          <section className="dc-stats">
            <div className="container">
              <div className="dc-stats-head">
                <span className="dc-tag reveal fade-up">{t("geography_page.population.stat_tag")}</span>
                <h2 className="dc-section-title reveal fade-up delay-100">{t("geography_page.population.stat_title")}</h2>
              </div>

              <div className="dc-stats-grid reveal fade-up delay-200">
                <div className="dc-stat-card">
                  <div className="dc-stat-icon">
                    <i className="fas fa-city"></i>
                  </div>
                  <span className="dc-stat-num">{t("geography_page.population.st1_num")}</span>
                  <span className="dc-stat-label">{t("geography_page.population.st1_label")}</span>
                  <p>
                    {t("geography_page.population.st1_desc")}
                  </p>
                </div>

                <div className="dc-stat-card">
                  <div className="dc-stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <span className="dc-stat-num">{t("geography_page.population.st2_num")}</span>
                  <span className="dc-stat-label">{t("geography_page.population.st2_label")}</span>
                  <p>
                    {t("geography_page.population.st2_desc")}
                  </p>
                </div>

                <div className="dc-stat-card dc-stat-accent">
                  <div className="dc-stat-icon">
                    <i className="fas fa-map"></i>
                  </div>
                  <span className="dc-stat-num">{t("geography_page.population.st3_num")}</span>
                  <span className="dc-stat-label">{t("geography_page.population.st3_label")}</span>
                  <p>
                    {t("geography_page.population.st3_desc")}
                  </p>
                </div>

                <div className="dc-stat-card">
                  <div className="dc-stat-icon">
                    <i className="fas fa-people-group"></i>
                  </div>
                  <span className="dc-stat-num">{t("geography_page.population.st4_num")}</span>
                  <span className="dc-stat-label">{t("geography_page.population.st4_label")}</span>
                  <p>
                    {t("geography_page.population.st4_desc")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Ethnic Diversity */}
          <section className="dc-ethnic">
            <div className="container">
              <div className="dc-ethnic-head">
                <span className="dc-tag reveal fade-up">{t("geography_page.population.eth_tag")}</span>
                <h2 className="dc-section-title reveal fade-up delay-100">{t("geography_page.population.eth_title")}</h2>
              </div>

              <div className="dc-ethnic-grid reveal fade-up delay-200">
                <div className="dc-ethnic-card dc-ethnic-main">
                  <div className="dc-ethnic-icon"><i className="fas fa-flag"></i></div>
                  <h3>{t("geography_page.population.eth1_title")}</h3>
                  <p>
                    {t("geography_page.population.eth1_desc")}
                  </p>
                  <div className="dc-deco-motif" aria-hidden="true"></div>
                </div>

                <div className="dc-ethnic-card">
                  <div className="dc-ethnic-icon"><i className="fas fa-torii-gate"></i></div>
                  <h3>{t("geography_page.population.eth2_title")}</h3>
                  <p>
                    {t("geography_page.population.eth2_desc")}
                  </p>
                  <div className="dc-deco-motif" aria-hidden="true"></div>
                </div>

                <div className="dc-ethnic-card">
                  <div className="dc-ethnic-icon"><i className="fas fa-mosque"></i></div>
                  <h3>{t("geography_page.population.eth3_title")}</h3>
                  <p>
                    {t("geography_page.population.eth3_desc")}
                  </p>
                  <div className="dc-deco-motif" aria-hidden="true"></div>
                </div>

                <div className="dc-ethnic-card">
                  <div className="dc-ethnic-icon"><i className="fas fa-gopuram"></i></div>
                  <h3>{t("geography_page.population.eth4_title")}</h3>
                  <p>
                    {t("geography_page.population.eth4_desc")}
                  </p>
                  <div className="dc-deco-motif" aria-hidden="true"></div>
                </div>

                <div className="dc-ethnic-card">
                  <div className="dc-ethnic-icon"><i className="fas fa-mountain-sun"></i></div>
                  <h3>{t("geography_page.population.eth5_title")}</h3>
                  <p>
                    {t("geography_page.population.eth5_desc")}
                  </p>
                  <div className="dc-deco-motif" aria-hidden="true"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Canva Embed */}
          <section className="dc-canvas">
            <div className="container">
              <div className="dc-canvas-intro reveal fade-up">
                <h3>{t("geography_page.canvas_intro_title")}</h3>
                <p>{t("geography_page.population.canvas_intro_desc")}</p>
              </div>
              <div className="dc-canvas-frame reveal fade-up delay-200">
                <div className="dc-canvas-embed">
                  <iframe
                    loading="lazy"
                    src="https://www.canva.com/design/DAG6vtt7LLo/aI7TalSv9HgnBja0iMEEeQ/view?embed"
                    allowFullScreen
                    allow="fullscreen"
                    title="DÂN CƯ TPHCM"
                  ></iframe>
                </div>
              </div>
            </div>

            <GameRedirect to="/tro-choi-dan-cu" gameName={t("learning_page.quiz.games.dan_cu.title")} />
          </section>
        </div>
      </main>
    </div>
  );
}
