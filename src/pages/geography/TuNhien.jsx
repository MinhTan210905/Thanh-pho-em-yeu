import './TuNhien.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GameRedirect from '../../components/common/GameRedirect';

export default function TuNhien() {
  const { t } = useTranslation();
  useEffect(() => {
    document.body.classList.add('page-tu-nhien-active');
    return () => {
      document.body.classList.remove('page-tu-nhien-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.tu-nhien-page .section-wrapper');
      const heroReveals = document.querySelectorAll('.tn-hero .reveal');

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
    <div className="tu-nhien-page">
      {/* ── HERO — 2-Column Explorer ── */}
      <section className="tn-hero">
        <div className="tn-hero-deco tn-deco-wave"></div>
        <div className="tn-hero-deco tn-deco-dots"></div>
        <div className="tn-hero-deco tn-deco-mist"></div>
        <div className="tn-hero-deco tn-deco-meteors" aria-hidden="true">
          <span className="tn-meteor"></span>
          <span className="tn-meteor"></span>
          <span className="tn-meteor"></span>
          <span className="tn-meteor"></span>
          <span className="tn-meteor"></span>
          <span className="tn-meteor"></span>
        </div>

        <div className="container tn-hero-grid">
          {/* Left: Copy */}
          <div className="tn-hero-copy">
            <span className="tn-hero-badge reveal fade-up">
              {t("geography_page.nature.badge_geo")}
              <span className="tn-dot">·</span>
              <span className="tn-badge-accent">{t("geography_page.nature.badge_tn")}</span>
            </span>

            <h1 className="tn-title reveal fade-up delay-100">
              {t("geography_page.nature.hero_title")}<br /><span className="tn-highlight">{t("geography_page.nature.highlight")}</span>
            </h1>

            <p className="tn-subtitle reveal fade-up delay-200">
              {t("geography_page.nature.hero_desc")}
            </p>

            <div className="tn-hero-points reveal fade-up delay-300">
              <div className="tn-point">
                <i className="fas fa-mountain"></i>
                <span>{t("geography_page.nature.point1")}</span>
              </div>
              <div className="tn-point">
                <i className="fas fa-seedling"></i>
                <span>{t("geography_page.nature.point2")}</span>
              </div>
              <div className="tn-point">
                <i className="fas fa-water"></i>
                <span>{t("geography_page.nature.point3")}</span>
              </div>
            </div>
          </div>

          {/* Right: Nature Dashboard Panel */}
          <div className="tn-hero-panel reveal zoom-in delay-300">
            <div className="tn-panel-card">
              <span className="tn-panel-num">2000+</span>
              <span className="tn-panel-label">{t("geography_page.nature.panel1")}</span>
            </div>
            <div className="tn-panel-card">
              <span className="tn-panel-num">8+</span>
              <span className="tn-panel-label">{t("geography_page.nature.panel2")}</span>
            </div>
            <div className="tn-panel-card tn-panel-accent">
              <span className="tn-panel-num">27.6°C</span>
              <span className="tn-panel-label">{t("geography_page.nature.panel3")}</span>
            </div>
            <div className="tn-panel-card">
              <span className="tn-panel-num">7+</span>
              <span className="tn-panel-label">{t("geography_page.nature.panel4")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="tn-content">
        <div className="section-wrapper tn-core-group">

          {/* Biome Chips Strip */}
          <section className="tn-biomes">
            <div className="container">
              <div className="tn-biomes-head reveal fade-up">
                <span className="tn-tag">{t("geography_page.nature.biome_tag")}</span>
                <h2 className="tn-section-title">{t("geography_page.nature.biome_title")}</h2>
              </div>
              <div className="tn-biome-chips reveal fade-up delay-100">
                <div className="tn-chip"><i className="fas fa-paw"></i><span>{t("geography_page.nature.chip1")}</span></div>
                <div className="tn-chip"><i className="fas fa-layer-group"></i><span>{t("geography_page.nature.chip2")}</span></div>
                <div className="tn-chip"><i className="fas fa-gem"></i><span>{t("geography_page.nature.chip3")}</span></div>
                <div className="tn-chip"><i className="fas fa-mountain"></i><span>{t("geography_page.nature.chip4")}</span></div>
                <div className="tn-chip"><i className="fas fa-cloud-sun"></i><span>{t("geography_page.nature.chip5")}</span></div>
                <div className="tn-chip"><i className="fas fa-water"></i><span>{t("geography_page.nature.chip6")}</span></div>
                <div className="tn-chip"><i className="fas fa-ship"></i><span>{t("geography_page.nature.chip7")}</span></div>
              </div>
            </div>
          </section>

          {/* Nature Mosaic — staggered 3-col grid */}
          <section className="tn-mosaic">
            <div className="container">
              <div className="tn-mosaic-grid reveal fade-up delay-100">
                {/* Row 1: Wide + Small */}
                <div className="tn-mosaic-card tn-mosaic-wide">
                  <div className="tn-mosaic-icon"><i className="fas fa-paw"></i></div>
                  <h3>{t("geography_page.nature.mo1_title")}</h3>
                  <p>
                    {t("geography_page.nature.mo1_desc")}
                  </p>
                  <span className="tn-mosaic-badge">{t("geography_page.nature.mo1_badge")}</span>
                </div>
                <div className="tn-mosaic-card">
                  <div className="tn-mosaic-icon"><i className="fas fa-layer-group"></i></div>
                  <h3>{t("geography_page.nature.mo2_title")}</h3>
                  <p>
                    {t("geography_page.nature.mo2_desc")}
                  </p>
                  <span className="tn-mosaic-badge">{t("geography_page.nature.mo2_badge")}</span>
                </div>

                {/* Row 2: Small accent + Wide */}
                <div className="tn-mosaic-card tn-mosaic-accent">
                  <div className="tn-mosaic-icon"><i className="fas fa-gem"></i></div>
                  <h3>{t("geography_page.nature.mo3_title")}</h3>
                  <p>
                    {t("geography_page.nature.mo3_desc")}
                  </p>
                  <span className="tn-mosaic-badge">{t("geography_page.nature.mo3_badge")}</span>
                </div>
                <div className="tn-mosaic-card tn-mosaic-wide">
                  <div className="tn-mosaic-icon"><i className="fas fa-cloud-sun"></i></div>
                  <h3>{t("geography_page.nature.mo4_title")}</h3>
                  <p>
                    {t("geography_page.nature.mo4_desc")}
                  </p>
                  <span className="tn-mosaic-badge">{t("geography_page.nature.mo4_badge")}</span>
                </div>

                {/* Row 3: 3 small */}
                <div className="tn-mosaic-card">
                  <div className="tn-mosaic-icon"><i className="fas fa-mountain"></i></div>
                  <h3>{t("geography_page.nature.mo5_title")}</h3>
                  <p>
                    {t("geography_page.nature.mo5_desc")}
                  </p>
                  <span className="tn-mosaic-badge">{t("geography_page.nature.mo5_badge")}</span>
                </div>
                <div className="tn-mosaic-card">
                  <div className="tn-mosaic-icon"><i className="fas fa-water"></i></div>
                  <h3>{t("geography_page.nature.mo6_title")}</h3>
                  <p>
                    {t("geography_page.nature.mo6_desc")}
                  </p>
                  <span className="tn-mosaic-badge">{t("geography_page.nature.mo6_badge")}</span>
                </div>
                <div className="tn-mosaic-card">
                  <div className="tn-mosaic-icon"><i className="fas fa-ship"></i></div>
                  <h3>{t("geography_page.nature.mo7_title")}</h3>
                  <p>
                    {t("geography_page.nature.mo7_desc")}
                  </p>
                  <span className="tn-mosaic-badge">{t("geography_page.nature.mo7_badge")}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Canva Embed */}
          <section className="tn-canvas">
            <div className="container">
              <div className="tn-canvas-intro reveal fade-up">
                <h3>{t("geography_page.canvas_intro_title")}</h3>
                <p>{t("geography_page.nature.canvas_intro_desc")}</p>
              </div>
              <div className="tn-canvas-frame reveal fade-up delay-200">
                <div className="tn-canvas-embed">
                  <iframe
                    loading="lazy"
                    src="https://www.canva.com/design/DAHCLpToiSA/brS7O1C6CiOfWQrRQvBzlg/view?embed"
                    allowFullScreen
                    allow="fullscreen"
                    title="ĐỊA LÍ TỰ NHIÊN TPHCM"
                  ></iframe>
                </div>
              </div>
            </div>

            <GameRedirect to="/tro-choi-dia-li-tu-nhien" gameName={t("learning_page.quiz.games.tu_nhien.title")} />
          </section>
        </div>
      </main>
    </div>
  );
}
