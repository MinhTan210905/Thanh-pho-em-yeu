import './NhanVat.css';
import { useEffect } from 'react';

export default function NhanVat() {
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
            <span>Lịch Sử</span>
            <span className="nv-dot">·</span>
            <span className="nv-badge-accent">Nhân Vật</span>
          </div>

          <h1 className="nv-hero-title reveal fade-up delay-100">
            Nhân Vật Lịch Sử <span className="nv-highlight">TP.HCM</span>
          </h1>

          <p className="nv-hero-desc reveal fade-up delay-200">
            Thành phố Hồ Chí Minh — vùng đất giàu truyền thống lịch sử, có đóng góp
            to lớn trong công cuộc xây dựng và bảo vệ Tổ quốc.
          </p>

          <div className="nv-hero-pills reveal fade-up delay-300">
            <div className="nv-pill">
              <i className="fas fa-user-shield"></i>
              <div>
                <strong>Anh hùng</strong>
                <span>Chiến đấu kiên cường</span>
              </div>
            </div>
            <div className="nv-pill">
              <i className="fas fa-feather-alt"></i>
              <div>
                <strong>Danh nhân</strong>
                <span>Văn hóa & giáo dục</span>
              </div>
            </div>
            <div className="nv-pill">
              <i className="fas fa-hands-helping"></i>
              <div>
                <strong>Cống hiến</strong>
                <span>Xây dựng Tổ quốc</span>
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
                <span className="nv-tag">Vinh Danh</span>
                <h2 className="nv-section-title">Những Người Con Ưu Tú</h2>
              </div>

              <div className="nv-tribute-grid reveal fade-up delay-200">
                <div className="nv-tribute-quote">
                  <div className="nv-quote-mark" aria-hidden="true">
                    <i className="fas fa-quote-left"></i>
                  </div>
                  <blockquote>
                    <p className="nv-quote-text">Dân ta phải biết sử ta,</p>
                    <p className="nv-quote-text">Cho tường gốc tích nước nhà Việt Nam.</p>
                    <p className="nv-quote-text">Kể năm hơn bốn ngàn năm,</p>
                    <p className="nv-quote-text">Tổ tiên rực rỡ, anh em thuận hòa.</p>
                    <footer className="nv-quote-author">
                      <span className="nv-quote-dash">—</span> <strong>Hồ Chí Minh</strong>
                    </footer>
                  </blockquote>
                </div>

                <div className="nv-tribute-cards">
                  <div className="nv-t-card">
                    <div className="nv-t-icon">
                      <i className="fas fa-medal"></i>
                    </div>
                    <h3>Anh hùng dân tộc</h3>
                    <p>Những vị tướng, chiến sĩ kiên trung đã chiến đấu và hy sinh vì Tổ quốc.</p>
                  </div>
                  <div className="nv-t-card">
                    <div className="nv-t-icon">
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    <h3>Nhà văn hóa – giáo dục</h3>
                    <p>Những trí thức lớn đã góp phần khai sáng, phát triển văn hóa, giáo dục thành phố.</p>
                  </div>
                  <div className="nv-t-card nv-t-card-accent">
                    <div className="nv-t-icon">
                      <i className="fas fa-flag"></i>
                    </div>
                    <h3>Lãnh đạo cách mạng</h3>
                    <p>Những nhà lãnh đạo tiên phong, dẫn dắt phong trào đấu tranh giành độc lập.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Canvas */}
          <section className="nv-canvas">
            <div className="container">
              <div className="nv-canvas-intro reveal fade-up">
                <h3>Khám phá trọn vẹn qua bản trình bày</h3>
                <p>Chân dung và câu chuyện về các nhân vật lịch sử nổi bật tại TP.HCM.</p>
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
          </section>
        </div>
      </main>
    </div>
  );
}
