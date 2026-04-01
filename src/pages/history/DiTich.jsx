import './DiTich.css';
import { useEffect } from 'react';
import GameRedirect from '../../components/common/GameRedirect';

export default function DiTich() {
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
            <span>Lịch Sử</span>
            <span className="dt-dot">·</span>
            <span className="dt-badge-accent">Di Tích</span>
          </div>

          <h1 className="dt-hero-title reveal fade-up delay-100">
            Di Tích Lịch Sử <span className="dt-highlight">TP.HCM</span>
          </h1>

          <p className="dt-hero-desc reveal fade-up delay-200">
            Di tích lịch sử – văn hoá là những công trình, địa điểm và hiện vật
            có giá trị lịch sử, văn hoá, khoa học được xếp hạng và bảo tồn qua các thời kì.
          </p>

          <div className="dt-hero-stats reveal fade-up delay-300">
            <div className="dt-stat">
              <i className="fas fa-landmark"></i>
              <div>
                <strong>Di sản</strong>
                <span>Quý giá qua thời gian</span>
              </div>
            </div>
            <div className="dt-stat">
              <i className="fas fa-hourglass-half"></i>
              <div>
                <strong>4 Thời kì</strong>
                <span>Dòng chảy lịch sử</span>
              </div>
            </div>
            <div className="dt-stat">
              <i className="fas fa-shield-alt"></i>
              <div>
                <strong>Bảo tồn</strong>
                <span>Gìn giữ cho mai sau</span>
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
                <span className="dt-tag">Dòng Chảy Thời Gian</span>
                <h2 className="dt-section-title">Các Thời Kì Lịch Sử</h2>
              </div>

              <div className="dt-timeline reveal fade-up delay-200">
                <div className="dt-timeline-line" aria-hidden="true"></div>

                {/* — Thời kì 1 — */}
                <div className="dt-tl-item dt-tl-left">
                  <div className="dt-tl-dot">
                    <i className="fas fa-gopuram"></i>
                  </div>
                  <div className="dt-tl-card">
                    <span className="dt-tl-era">Thời kì I</span>
                    <h3>Thời kì Óc Eo</h3>
                    <p>
                      Nền văn hóa Óc Eo phát triển từ thế kỉ I đến thế kỉ VII, để lại
                      nhiều di tích khảo cổ quý giá trên vùng đất Nam Bộ - minh chứng cho
                      sự giao thương và phát triển sớm của cộng đồng cư dân cổ.
                    </p>
                  </div>
                </div>

                {/* — Thời kì 2 — */}
                <div className="dt-tl-item dt-tl-right">
                  <div className="dt-tl-dot">
                    <i className="fas fa-compass"></i>
                  </div>
                  <div className="dt-tl-card">
                    <span className="dt-tl-era">Thời kì II</span>
                    <h3>Khai phá vùng đất phương Nam</h3>
                    <p>
                      Từ cuối thế kỉ XVI, các lưu dân người Việt bắt đầu khai hoang lập ấp,
                      mở rộng lãnh thổ về phía Nam, hình thành nên vùng đất Sài Gòn – Gia Định
                      with những công trình, đình chùa ghi dấu buổi đầu lập nghiệp.
                    </p>
                  </div>
                </div>

                {/* — Thời kì 3 — */}
                <div className="dt-tl-item dt-tl-left">
                  <div className="dt-tl-dot">
                    <i className="fas fa-fist-raised"></i>
                  </div>
                  <div className="dt-tl-card">
                    <span className="dt-tl-era">Thời kì III</span>
                    <h3>Kháng chiến chống Pháp</h3>
                    <p>
                      Trong gần một thế kỉ đô hộ của thực dân Pháp, nhiều phong trào yêu nước
                      đã nổ ra, để lại những di tích gắn liền with tinh thần bất khuất
                      của nhân dân Sài Gòn – Chợ Lớn.
                    </p>
                  </div>
                </div>

                {/* — Thời kì 4 — */}
                <div className="dt-tl-item dt-tl-right">
                  <div className="dt-tl-dot dt-tl-dot-accent">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="dt-tl-card dt-tl-card-accent">
                    <span className="dt-tl-era">Thời kì IV</span>
                    <h3>Kháng chiến chống Mỹ</h3>
                    <p>
                      Giai đoạn 1954–1975, Sài Gòn là trung tâm của cuộc đấu tranh giải phóng
                      miền Nam, with nhiều di tích lịch sử như Dinh Độc Lập, Địa đạo Củ Chi
                      ghi dấu chiến thắng vẻ vang.
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
                <h3>Khám phá trọn vẹn qua bản trình bày</h3>
                <p>Hình ảnh và câu chuyện về các di tích lịch sử nổi bật tại TP.HCM.</p>
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

            <GameRedirect to="/tro-choi-di-tich-lich-su" gameName="Phân loại di tích" />
          </section>
        </div>
      </main>
    </div>
  );
}
