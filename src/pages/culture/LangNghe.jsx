import './LangNghe.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GameRedirect from '../../components/common/GameRedirect';

export default function LangNghe() {
  const { t } = useTranslation();
  useEffect(() => {
    document.body.classList.add('page-lang-nghe-active');
    return () => {
      document.body.classList.remove('page-lang-nghe-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.lang-nghe-page .section-wrapper');
      const heroReveals = document.querySelectorAll('.ln-hero .reveal');

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
    <div className="lang-nghe-page">
      {/* ── HERO ── */}
      <section className="ln-hero">
        <div className="ln-hero-deco ln-deco-weave"></div>
        <div className="ln-hero-deco ln-deco-grain"></div>
        <div className="ln-hero-deco ln-deco-glow"></div>

        <div className="ln-hero-inner container">
          <span className="ln-hero-badge reveal fade-up">
            {t("culture_page.craft.badge_cul")}
            <span className="ln-dot">·</span>
            <span className="ln-badge-accent">{t("culture_page.craft.badge_craft")}</span>
          </span>

          <h1 className="ln-hero-title reveal fade-up delay-100">
            {t("culture_page.craft.hero_title")}<br /><span className="ln-highlight">{t("culture_page.craft.highlight")}</span>
          </h1>

          <p className="ln-hero-desc reveal fade-up delay-200">
            {t("culture_page.craft.hero_desc")}
          </p>

          <div className="ln-hero-pills reveal fade-up delay-300">
            <div className="ln-pill">
              <i className="fas fa-hourglass-half"></i>
              <div>
                <strong>{t("culture_page.craft.pill1_title")}</strong>
                <span>{t("culture_page.craft.pill1_desc")}</span>
              </div>
            </div>
            <div className="ln-pill">
              <i className="fas fa-hammer"></i>
              <div>
                <strong>{t("culture_page.craft.pill2_title")}</strong>
                <span>{t("culture_page.craft.pill2_desc")}</span>
              </div>
            </div>
            <div className="ln-pill">
              <i className="fas fa-award"></i>
              <div>
                <strong>{t("culture_page.craft.pill3_title")}</strong>
                <span>{t("culture_page.craft.pill3_desc")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="ln-content">
        <div className="section-wrapper ln-core-group">

          {/* Heritage Ribbon */}
          <section className="ln-heritage">
            <div className="container">
              <div className="ln-heritage-head reveal fade-up">
                <span className="ln-tag">{t("culture_page.craft.sec_tag")}</span>
                <h2 className="ln-section-title">{t("culture_page.craft.sec_title")}</h2>
              </div>

              <div className="ln-ribbon reveal fade-up delay-100">
                <div className="ln-ribbon-card">
                  <div className="ln-ribbon-icon-wrap">
                    <i className="fas fa-hands"></i>
                  </div>
                  <div className="ln-ribbon-body">
                    <h3>{t("culture_page.craft.rib1_title")}</h3>
                    <p>{t("culture_page.craft.rib1_desc")}</p>
                  </div>
                  <span className="ln-ribbon-badge">{t("culture_page.craft.rib1_badge")}</span>
                </div>
                <div className="ln-ribbon-card">
                  <div className="ln-ribbon-icon-wrap">
                    <i className="fas fa-leaf"></i>
                  </div>
                  <div className="ln-ribbon-body">
                    <h3>{t("culture_page.craft.rib2_title")}</h3>
                    <p>{t("culture_page.craft.rib2_desc")}</p>
                  </div>
                  <span className="ln-ribbon-badge">{t("culture_page.craft.rib2_badge")}</span>
                </div>
                <div className="ln-ribbon-card ln-ribbon-accent">
                  <div className="ln-ribbon-icon-wrap">
                    <i className="fas fa-gem"></i>
                  </div>
                  <div className="ln-ribbon-body">
                    <h3>{t("culture_page.craft.rib3_title")}</h3>
                    <p>{t("culture_page.craft.rib3_desc")}</p>
                  </div>
                  <span className="ln-ribbon-badge">{t("culture_page.craft.rib3_badge")}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Insight Strip */}
          <section className="ln-insights">
            <div className="container reveal fade-up">
              <div className="ln-insight-bar">
                <div className="ln-insight">
                  <div className="ln-insight-icon"><i className="fas fa-landmark"></i></div>
                  <div className="ln-insight-text">
                    <span>{t("culture_page.craft.ins1_top")}</span>
                    <span>{t("culture_page.craft.ins1_bot")}</span>
                  </div>
                </div>
                <div className="ln-insight-divider"></div>
                <div className="ln-insight">
                  <div className="ln-insight-icon"><i className="fas fa-coins"></i></div>
                  <div className="ln-insight-text">
                    <span>{t("culture_page.craft.ins2_top")}</span>
                    <span>{t("culture_page.craft.ins2_bot")}</span>
                  </div>
                </div>
                <div className="ln-insight-divider"></div>
                <div className="ln-insight">
                  <div className="ln-insight-icon"><i className="fas fa-globe-asia"></i></div>
                  <div className="ln-insight-text">
                    <span>{t("culture_page.craft.ins3_top")}</span>
                    <span>{t("culture_page.craft.ins3_bot")}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Canva Embed */}
          <section className="ln-canvas">
            <div className="container">
              <div className="ln-canvas-intro reveal fade-up">
                <h3>{t("culture_page.canvas_intro_detail")}</h3>
                <p>{t("culture_page.craft.canvas_desc")}</p>
              </div>
              <div className="ln-canvas-frame reveal fade-up delay-200">
                <div className="ln-canvas-embed">
                  <iframe
                    loading="lazy"
                    src="https://www.canva.com/design/DAG-Bhhk3ik/ve17K-ECprFUqmYm_MMWTA/view?embed"
                    allowFullScreen
                    allow="fullscreen"
                    title="LÀNG NGHỀ TPHCM"
                  ></iframe>
                </div>
              </div>
            </div>

            <GameRedirect to="/tro-choi-lang-nghe" gameName={t("learning_page.quiz.games.lang_nghe.title")} />
          </section>
        </div>
      </main>
    </div>
  );
}
