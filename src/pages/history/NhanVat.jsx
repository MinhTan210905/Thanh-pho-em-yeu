import './NhanVat.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GameRedirect from '../../components/common/GameRedirect';

export default function NhanVat() {
  const { t } = useTranslation();
  useEffect(() => {
    document.body.classList.add('page-nhan-vat-active');
    return () => {
      document.body.classList.remove('page-nhan-vat-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.nhan-vat-page .section-wrapper');

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
    <div className="nhan-vat-page">
      {/* ── HERO ── */}
      <section className="nv-hero">
        <div className="nv-hero-deco nv-deco-lines"></div>
        <div className="nv-hero-deco nv-deco-bar"></div>
        <div className="nv-hero-deco nv-deco-glow"></div>

        <div className="container section-wrapper nv-hero-inner">
          <div className="nv-hero-badge reveal fade-up">
            <span>{t("history_page.figures.badge_his")}</span>
            <span className="nv-dot">·</span>
            <span className="nv-badge-accent">{t("history_page.figures.badge_figures")}</span>
          </div>

          <h1 className="nv-hero-title reveal fade-up delay-100">
            {t("history_page.figures.hero_title")} <span className="nv-highlight">{t("history_page.figures.highlight")}</span>
          </h1>

          <p className="nv-hero-desc reveal fade-up delay-200">
            {t("history_page.figures.hero_desc")}
          </p>

          <div className="nv-hero-pills reveal fade-up delay-300">
            <div className="nv-pill">
              <i className="fas fa-user-shield"></i>
              <div>
                <strong>{t("history_page.figures.pill1_title")}</strong>
                <span>{t("history_page.figures.pill1_desc")}</span>
              </div>
            </div>
            <div className="nv-pill">
              <i className="fas fa-feather-alt"></i>
              <div>
                <strong>{t("history_page.figures.pill2_title")}</strong>
                <span>{t("history_page.figures.pill2_desc")}</span>
              </div>
            </div>
            <div className="nv-pill">
              <i className="fas fa-hands-helping"></i>
              <div>
                <strong>{t("history_page.figures.pill3_title")}</strong>
                <span>{t("history_page.figures.pill3_desc")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="nv-content">
        <div className="section-wrapper nv-core-group">
          {/* Tribute Panel */}
          <section className="nv-tribute">
            <div className="container">
              <div className="nv-tribute-head reveal fade-up">
                <span className="nv-tag">{t("history_page.figures.tribute_tag")}</span>
                <h2 className="nv-section-title">{t("history_page.figures.tribute_title")}</h2>
              </div>

              <div className="nv-tribute-grid reveal fade-up delay-200">
                <div className="nv-tribute-quote">
                  <div className="nv-quote-mark" aria-hidden="true">
                    <i className="fas fa-quote-left"></i>
                  </div>
                  <blockquote>
                    <p className="nv-quote-text">{t("history_page.figures.quote_line1")}</p>
                    <p className="nv-quote-text">{t("history_page.figures.quote_line2")}</p>
                    <p className="nv-quote-text">{t("history_page.figures.quote_line3")}</p>
                    <p className="nv-quote-text">{t("history_page.figures.quote_line4")}</p>
                    <footer className="nv-quote-author">
                      <span className="nv-quote-dash">—</span> <strong>{t("history_page.figures.quote_author")}</strong>
                    </footer>
                  </blockquote>
                </div>

                <div className="nv-tribute-cards">
                  <div className="nv-t-card">
                    <div className="nv-t-icon">
                      <i className="fas fa-medal"></i>
                    </div>
                    <h3>{t("history_page.figures.card1_title")}</h3>
                      <p>{t("history_page.figures.card1_desc")}</p>
                  </div>
                  <div className="nv-t-card">
                    <div className="nv-t-icon">
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    <h3>{t("history_page.figures.card2_title")}</h3>
                    <p>{t("history_page.figures.card2_desc")}</p>
                  </div>
                  <div className="nv-t-card nv-t-card-accent">
                    <div className="nv-t-icon">
                      <i className="fas fa-flag"></i>
                    </div>
                    <h3>{t("history_page.figures.card3_title")}</h3>
                    <p>{t("history_page.figures.card3_desc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Canvas */}
          <section className="nv-canvas">
            <div className="container">
              <div className="nv-canvas-intro reveal fade-up">
                <h3>{t("history_page.canvas_intro_title")}</h3>
                <p>{t("history_page.figures.canvas_intro_desc")}</p>
              </div>
              <div className="nv-canvas-frame reveal fade-up delay-200">
                <div className="nv-canvas-embed">
                  <iframe
                    loading="lazy"
                    src="https://www.canva.com/design/DAG_hUQYIHw/nlEr6NL1q7U20XhyZN2yZg/view?embed"
                    allowFullScreen
                    allow="fullscreen"
                    title="NHÂN VẬT LỊCH SỬ TPHCM"
                  ></iframe>
                </div>
              </div>
            </div>

            <GameRedirect to="/tro-choi-nhan-vat-lich-su" gameName={t("learning_page.quiz.games.nhan_vat.title")} />
          </section>
        </div>
      </main>
    </div>
  );
}
