import './TaiLieuHocTap.css';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';


export default function TaiLieuHocTap() {
  const { t } = useTranslation();
  const [activeDoc, setActiveDoc] = useState(null);
  const canvasRef = useRef(null);

  const DOCUMENTS = useMemo(() => [
    {
      id: 1,
      title: t("learning_page.documents.list.hcm_title"),
      description: t("learning_page.documents.list.hcm_desc"),
      fileUrl: "/documents/LOP 4 - TP. HO CHI MINH.pdf",
      coverImage: "/images/tailieu_hoctap_3.png",
      tags: [ t("common.regions.hcm"), t("learning_page.documents.category_local_education") ]
    },
    {
      id: 2,
      title: t("learning_page.documents.list.brvt_title"),
      description: t("learning_page.documents.list.brvt_desc"),
      fileUrl: "/documents/LOP 4 - BA RIA - VUNG TAU.pdf",
      coverImage: "/images/tailieu_hoctap_4.png",
      tags: [t("common.regions.brvt"), t("header.geography")]
    },
    {
      id: 3,
      title: t("learning_page.documents.list.bd_title"),
      description: t("learning_page.documents.list.bd_desc"),
      fileUrl: "/documents/LOP 4 - BINH DUONG.pdf",
      coverImage: "/images/tailieu_hoctap_5.png",
      tags: [t("common.regions.bd"), t("header.history")]
    }
  ], [t]);

  useEffect(() => {
    document.body.classList.add('page-tai-lieu-active');
    return () => {
      document.body.classList.remove('page-tai-lieu-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.tl-page .section-wrapper');

      if (sectionWrappers.length === 0) return;

      observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
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

  const handleRead = (doc) => {
    setActiveDoc(doc);
    // Smooth scroll to the canvas section
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="tl-page">
      {/* ── HERO ── */}
      <section className="tl-hero">
        <div className="tl-hero-deco tl-deco-circle-1"></div>
        <div className="tl-hero-deco tl-deco-circle-2"></div>
        <div className="tl-hero-deco tl-deco-grid"></div>
        <div className="tl-hero-deco tl-deco-icon tl-pos-1"><i className="fa-solid fa-book-open"></i></div>
        <div className="tl-hero-deco tl-deco-icon tl-pos-2"><i className="fa-solid fa-graduation-cap"></i></div>
        <div className="tl-hero-deco tl-deco-icon tl-pos-3"><i className="fa-solid fa-feather-pointed"></i></div>

        <div className="container section-wrapper tl-hero-inner">
          <div className="tl-hero-badge reveal fade-up">
            <span>{t("learning_page.badge_corner")}</span>
            <span className="tl-dot">·</span>
            <span className="tl-badge-accent">{t("learning_page.badge_doc")}</span>
          </div>

          <h1 className="tl-hero-title reveal fade-up delay-100">
            {t("learning_page.documents.hero_title")} <span className="tl-highlight">{t("learning_page.documents.hero_highlight")}</span>
          </h1>

          <p className="tl-hero-desc reveal fade-up delay-200">
            {t("learning_page.documents.hero_desc")}
          </p>

          <div className="tl-hero-stats reveal fade-up delay-300">
            <div className="tl-stat">
              <i className="fas fa-book-open"></i>
              <div>
                <strong>{t("learning_page.documents.stat1_title")}</strong>
                <span>{t("learning_page.documents.stat1_desc")}</span>
              </div>
            </div>
            <div className="tl-stat">
              <i className="fas fa-graduation-cap"></i>
              <div>
                <strong>{t("learning_page.documents.stat2_title")}</strong>
                <span>{t("learning_page.documents.stat2_desc")}</span>
              </div>
            </div>
            <div className="tl-stat">
              <i className="fas fa-microscope"></i>
              <div>
                <strong>{t("learning_page.documents.stat3_title")}</strong>
                <span>{t("learning_page.documents.stat3_desc")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="tl-content">
        <div className="section-wrapper tl-core-group">

          {/* List of Documents */}
          <section className="tl-documents-section">
            <div className="container">
              <div className="tl-section-head reveal fade-up">
                <span className="tl-tag">{t("learning_page.documents.sec_tag")}</span>
                <h2 className="tl-section-title">{t("learning_page.documents.sec_title")}</h2>
              </div>

              <div className="tl-grid reveal fade-up delay-200">
                {DOCUMENTS.map((doc) => (
                  <div key={doc.id} className={`tl-card ${activeDoc?.id === doc.id ? 'active' : ''}`} onClick={() => handleRead(doc)}>
                    <div className="tl-card-image-wrap">
                      <img src={doc.coverImage} alt={doc.title} className="tl-card-img" />
                      <div className="tl-card-overlay">
                       <span className="tl-btn-read">
                          <i className="fa-solid fa-book-open"></i> {t("learning_page.documents.btn_preview")}
                        </span>
                      </div>
                    </div>
                    <div className="tl-card-info">
                      <div className="tl-tags">
                        {doc.tags.map(tag => <span key={tag}>{tag}</span>)}
                      </div>
                      <h3>{doc.title}</h3>
                      <p>{doc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Canvas PDF Viewer */}
          <section className="tl-canvas" ref={canvasRef}>
            <div className="container">
              <div className="tl-canvas-intro reveal fade-up">
                <h3>{t("learning_page.documents.canvas_title")}</h3>
                <p>{t("learning_page.documents.canvas_desc")}</p>
              </div>

              {!activeDoc ? (
                <div className="tl-canvas-empty reveal fade-up delay-200">
                  <div className="tl-empty-icon"><i className="fa-solid fa-file-pdf"></i></div>
                  <h4>{t("learning_page.documents.empty_title")}</h4>
                  <p>{t("learning_page.documents.empty_desc")}</p>
                </div>
              ) : (
                <div className="tl-canvas-frame reveal fade-up delay-200">
                  <div className="tl-canvas-toolbar">
                    <div className="tl-canvas-title">
                      <i className="fa-solid fa-book-open-reader"></i> {t("learning_page.documents.viewing", { title: activeDoc.title })}
                    </div>
                    <div className="tl-canvas-actions">
                      <a href={activeDoc.fileUrl} target="_blank" rel="noreferrer" className="tl-btn-external" title={t("learning_page.documents.btn_new_tab")}>
                        <i className="fa-solid fa-arrow-up-right-from-square"></i> {t("learning_page.documents.btn_new_tab")}
                      </a>
                      <button className="tl-btn-close" onClick={() => setActiveDoc(null)} title={t("learning_page.documents.btn_close")}>
                        {t("learning_page.documents.btn_close")}
                      </button>
                    </div>
                  </div>
                  <div className="tl-canvas-embed">
                    {/* #toolbar=1 gives the native PDF tools (zoom, print, save) inside the iframe */}
                    <iframe
                      loading="lazy"
                      src={`${activeDoc.fileUrl}#toolbar=1&navpanes=0&view=FitH`}
                      title={activeDoc.title}
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
