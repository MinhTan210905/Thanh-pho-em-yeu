import './TaiLieuHocTap.css';
import { useState, useEffect, useRef } from 'react';

const DOCUMENTS = [
  {
    id: 1,
    title: "Tài Liệu Học Tập TP. Hồ Chí Minh",
    description: "Khám phá vùng đất năng động, di tích lịch sử và văn hóa đa dạng của Thành phố Hồ Chí Minh.",
    fileUrl: "/documents/LOP 4 - TP. HO CHI MINH.pdf",
    coverImage: "/images/tailieu_hoctap_3.png",
    tags: ["TP.HCM", "Giáo dục địa phương"]
  },
  {
    id: 2,
    title: "Tài Liệu Học Tập Bà Rịa - Vũng Tàu",
    description: "Tìm hiểu vùng đất biển Bà Rịa - Vũng Tàu qua góc nhìn lịch sử, địa lí và đặc sản nổi tiếng.",
    fileUrl: "/documents/LOP 4 - BA RIA - VUNG TAU.pdf",
    coverImage: "/images/tailieu_hoctap_4.png",
    tags: ["Bà Rịa - Vũng Tàu", "Địa lí"]
  },
  {
    id: 3,
    title: "Tài Liệu Học Tập Bình Dương",
    description: "Học tập về sự giao thoa văn hóa, kinh tế công nghiệp và đời sống con người tỉnh Bình Dương.",
    fileUrl: "/documents/LOP 4 - BINH DUONG.pdf",
    coverImage: "/images/tailieu_hoctap_5.png",
    tags: ["Bình Dương", "Lịch sử"]
  }
];

export default function TaiLieuHocTap() {
  const [activeDoc, setActiveDoc] = useState(null);
  const canvasRef = useRef(null);

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
            <span>Góc Học Tập</span>
            <span className="tl-dot">·</span>
            <span className="tl-badge-accent">Tài Liệu</span>
          </div>

          <h1 className="tl-hero-title reveal fade-up delay-100">
            Tài Liệu <span className="tl-highlight">Học Tập</span>
          </h1>

          <p className="tl-hero-desc reveal fade-up delay-200">
            Thư viện tri thức thu nhỏ giúp bạn khám phá trọn vẹn về địa lí, lịch sử và văn hóa đa dạng của vùng đất Nam Bộ yêu thương.
          </p>

          <div className="tl-hero-stats reveal fade-up delay-300">
            <div className="tl-stat">
              <i className="fas fa-book-open"></i>
              <div>
                <strong>Phong phú</strong>
                <span>Đa dạng chủ đề</span>
              </div>
            </div>
            <div className="tl-stat">
              <i className="fas fa-graduation-cap"></i>
              <div>
                <strong>Lớp 4</strong>
                <span>Chuẩn kiến thức</span>
              </div>
            </div>
            <div className="tl-stat">
              <i className="fas fa-microscope"></i>
              <div>
                <strong>Khám phá</strong>
                <span>Mở rộng tư duy</span>
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
                <span className="tl-tag">Kho Tàng Tri Thức</span>
                <h2 className="tl-section-title">Danh Sách Tài Liệu</h2>
              </div>

              <div className="tl-grid reveal fade-up delay-200">
                {DOCUMENTS.map((doc) => (
                  <div key={doc.id} className={`tl-card ${activeDoc?.id === doc.id ? 'active' : ''}`} onClick={() => handleRead(doc)}>
                    <div className="tl-card-image-wrap">
                      <img src={doc.coverImage} alt={doc.title} className="tl-card-img" />
                      <div className="tl-card-overlay">
                        <span className="tl-btn-read">
                          <i className="fa-solid fa-book-open"></i> Xem Thử
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
                <h3>Không gian đọc tài liệu</h3>
                <p>Mở rộng trải nghiệm, đọc trực tiếp với đầy đủ công cụ của trình duyệt.</p>
              </div>

              {!activeDoc ? (
                <div className="tl-canvas-empty reveal fade-up delay-200">
                  <div className="tl-empty-icon"><i className="fa-solid fa-file-pdf"></i></div>
                  <h4>Chưa chọn tài liệu</h4>
                  <p>Vui lòng chọn một tài liệu từ danh sách phía trên để xem nội dung.</p>
                </div>
              ) : (
                <div className="tl-canvas-frame reveal fade-up delay-200">
                  <div className="tl-canvas-toolbar">
                    <div className="tl-canvas-title">
                      <i className="fa-solid fa-book-open-reader"></i> Đang xem: {activeDoc.title}
                    </div>
                    <div className="tl-canvas-actions">
                      <a href={activeDoc.fileUrl} target="_blank" rel="noreferrer" className="tl-btn-external" title="Mở trang mới đầy đủ">
                        <i className="fa-solid fa-arrow-up-right-from-square"></i> Mở tab mới
                      </a>
                      <button className="tl-btn-close" onClick={() => setActiveDoc(null)} title="Đóng trình xem này">
                        Xóa xem
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
