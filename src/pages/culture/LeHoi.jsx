import './LeHoi.css';
import { useEffect } from 'react';
import GameRedirect from '../../components/common/GameRedirect';

export default function LeHoi() {
  useEffect(() => {
    document.body.classList.add('page-le-hoi-active');
    return () => {
      document.body.classList.remove('page-le-hoi-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.le-hoi-page .section-wrapper');

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
    <div className="le-hoi-page">
      {/* ── HERO ── */}
      <section className="lh-hero">
        <div className="lh-hero-deco lh-deco-stars"></div>
        <div className="lh-hero-deco lh-deco-stars lh-stars-2"></div>
        <div className="lh-hero-deco lh-deco-1"></div>
        <div className="lh-hero-deco lh-deco-2"></div>
        <div className="lh-hero-deco lh-deco-3"></div>

        <div className="container section-wrapper lh-hero-inner">
          <div className="lh-hero-badge reveal fade-up">
            <span>Văn Hóa</span>
            <span className="lh-dot">·</span>
            <span className="lh-badge-accent">Lễ Hội</span>
          </div>

          <h1 className="lh-hero-title reveal fade-up delay-100">
            Lễ Hội <span className="lh-highlight">TP.HCM</span>
          </h1>

          <p className="lh-hero-desc reveal fade-up delay-200">
            Đa dạng, kết hợp giữa truyền thống và hiện đại - phản ánh đời sống văn&nbsp;hóa phong phú, sôi động của người dân thành phố.
          </p>

          <div className="lh-hero-chips reveal fade-up delay-300">
            <div className="lh-chip">
              <i className="fas fa-fire"></i>
              <div>
                <strong>Truyền thống</strong>
                <span>Lễ hội dân gian lâu đời</span>
              </div>
            </div>
            <div className="lh-chip">
              <i className="fas fa-city"></i>
              <div>
                <strong>Hiện đại</strong>
                <span>Sự kiện quốc tế, đô thị</span>
              </div>
            </div>
            <div className="lh-chip">
              <i className="fas fa-users"></i>
              <div>
                <strong>Cộng đồng</strong>
                <span>Gắn kết mọi thế hệ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="lh-content">
        <div className="section-wrapper lh-core-group">
        {/* Feature Strip */}
        <section className="lh-features">
          <div className="container">
            <div className="lh-features-head reveal fade-up">
              <span className="lh-tag">Đặc Sắc Lễ Hội</span>
              <h2 className="lh-section-title">Sắc Màu Thành Phố</h2>
            </div>

            <div className="lh-strip reveal fade-up delay-200">
              <div className="lh-strip-card lh-strip-wide">
                <div className="lh-strip-num">01</div>
                <h3>Kết hợp truyền thống & hiện đại</h3>
                <p>
                  Từ lễ hội Nguyên Tiêu, Tết Nguyên Đán, lễ hội Nghinh&nbsp;Ông đến
                  những sự kiện âm nhạc quốc tế, hội chợ đa văn hóa - tất cả
                  hòa quyện with nhịp sống thành phố.
                </p>
              </div>
              <div className="lh-strip-card">
                <div className="lh-strip-num">02</div>
                <h3>Đời sống văn hóa phong phú</h3>
                <p>
                  Lễ hội phản ánh bản sắc đa dân tộc, đa tôn giáo, tạo không gian
                  để mọi&nbsp;người cùng tôn vinh, trải nghiệm và chia sẻ.
                </p>
              </div>
              <div className="lh-strip-card lh-strip-accent">
                <div className="lh-strip-num">03</div>
                <h3>Sôi động quanh năm</h3>
                <p>Gần như tháng nào cũng có lễ hội, sự kiện văn hóa lớn nhỏ diễn ra khắp thành phố.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Canva */}
        <section className="lh-canvas">
          <div className="container">
            <div className="lh-canvas-intro reveal fade-up">
              <h3>Khám phá trọn vẹn qua bản trình bày</h3>
              <p>Hình ảnh và câu chuyện về các lễ hội nổi bật tại TP.HCM.</p>
            </div>
            <div className="lh-canvas-frame reveal fade-up delay-200">
              <div className="lh-canvas-embed">
                <iframe
                  loading="lazy"
                  src="https://www.canva.com/design/DAG_qp2TOAw/s9BdksGn9vWOZmC9yRzAaw/watch?embed"
                  allowFullScreen
                  allow="fullscreen"
                  title="LỄ HỘI TP.HCM"
                ></iframe>
              </div>
            </div>
          </div>

          <GameRedirect to="/tro-choi-le-hoi" gameName="Dấu ấn lễ hội địa phương" />
        </section>
        </div>
      </main>
    </div>
  );
}
