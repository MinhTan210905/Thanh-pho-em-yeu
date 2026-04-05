import './DanCu.css';
import { useEffect } from 'react';
import GameRedirect from '../../components/common/GameRedirect';

export default function DanCu() {
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
            Địa Lí
            <span className="dc-dot">·</span>
            <span className="dc-badge-accent">Dân Cư</span>
          </span>

          <h1 className="dc-hero-title reveal fade-up delay-100">
            Địa Lí<br /><span className="dc-highlight">Dân Cư</span>
          </h1>

          <p className="dc-hero-desc reveal fade-up delay-200">
            Khám phá bức tranh dân số sống động của Thành phố Hồ Chí Minh -
            đô thị đặc biệt với hơn 14 triệu cư dân, 168 đơn vị hành chính
            và sự hòa quyện của 54 dân tộc anh em.
          </p>

          {/* Dashboard stat bar — grouped with hero content */}
          <div className="dc-stat-bar reveal fade-up delay-300">
            <div className="dc-bar-item">
              <i className="fas fa-users"></i>
              <div>
                <span className="dc-bar-num">14+</span>
                <span className="dc-bar-label">Triệu dân</span>
              </div>
            </div>
            <div className="dc-bar-divider"></div>
            <div className="dc-bar-item">
              <i className="fas fa-map-location-dot"></i>
              <div>
                <span className="dc-bar-num">168</span>
                <span className="dc-bar-label">Đơn vị hành chính</span>
              </div>
            </div>
            <div className="dc-bar-divider"></div>
            <div className="dc-bar-item">
              <i className="fas fa-city"></i>
              <div>
                <span className="dc-bar-num">TP Đặc biệt</span>
                <span className="dc-bar-label">Đô thị loại đặc biệt</span>
              </div>
            </div>
            <div className="dc-bar-divider"></div>
            <div className="dc-bar-item">
              <i className="fas fa-people-group"></i>
              <div>
                <span className="dc-bar-num">54</span>
                <span className="dc-bar-label">Dân tộc anh em</span>
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
                <span className="dc-tag reveal fade-up">Tổng Quan</span>
                <h2 className="dc-section-title reveal fade-up delay-100">Dân Số & Hành Chính</h2>
              </div>

              <div className="dc-stats-grid reveal fade-up delay-200">
                <div className="dc-stat-card">
                  <div className="dc-stat-icon">
                    <i className="fas fa-city"></i>
                  </div>
                  <span className="dc-stat-num">TP Đặc biệt</span>
                  <span className="dc-stat-label">Phân loại đô thị</span>
                  <p>
                    TP.HCM là đô thị đặc biệt trực thuộc Trung ương,
                    giữ vai trò trung tâm kinh tế lớn nhất cả nước với tốc độ phát triển vượt trội.
                  </p>
                </div>

                <div className="dc-stat-card">
                  <div className="dc-stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <span className="dc-stat-num">14+ triệu</span>
                  <span className="dc-stat-label">Quy mô dân số</span>
                  <p>
                    Hơn 14 triệu người sinh sống, làm việc và học tập,
                    tạo nên đô thị sôi động bậc nhất Việt Nam.
                  </p>
                </div>

                <div className="dc-stat-card dc-stat-accent">
                  <div className="dc-stat-icon">
                    <i className="fas fa-map"></i>
                  </div>
                  <span className="dc-stat-num">168</span>
                  <span className="dc-stat-label">Đơn vị hành chính</span>
                  <p>
                    Gồm các quận, thành phố trực thuộc, phường và xã -
                    hệ thống hành chính hoàn chỉnh.
                  </p>
                </div>

                <div className="dc-stat-card">
                  <div className="dc-stat-icon">
                    <i className="fas fa-people-group"></i>
                  </div>
                  <span className="dc-stat-num">54 dân tộc</span>
                  <span className="dc-stat-label">Đa dạng sắc tộc</span>
                  <p>
                    Dân tộc Kinh chiếm đa số, cùng 53 dân tộc thiểu số
                    khác cùng sinh sống hài hòa.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Ethnic Diversity */}
          <section className="dc-ethnic">
            <div className="container">
              <div className="dc-ethnic-head">
                <span className="dc-tag reveal fade-up">Đa Dạng</span>
                <h2 className="dc-section-title reveal fade-up delay-100">Bức Tranh Dân Tộc</h2>
              </div>

              <div className="dc-ethnic-grid reveal fade-up delay-200">
                <div className="dc-ethnic-card dc-ethnic-main">
                  <div className="dc-ethnic-icon"><i className="fas fa-flag"></i></div>
                  <h3>Dân tộc Kinh</h3>
                  <p>
                    Chiếm tỉ lệ đa số trong cơ cấu dân số thành phố,
                    đóng vai trò chủ đạo trong phát triển kinh tế - xã hội
                    và văn hóa đô thị.
                  </p>
                  <div className="dc-deco-motif" aria-hidden="true"></div>
                </div>

                <div className="dc-ethnic-card">
                  <div className="dc-ethnic-icon"><i className="fas fa-torii-gate"></i></div>
                  <h3>Người Hoa</h3>
                  <p>
                    Cộng đồng dân tộc thiểu số lớn nhất,
                    tập trung chủ yếu ở thành phố Hồ Chí Minh với nền văn hóa phong phú
                  </p>
                  <div className="dc-deco-motif" aria-hidden="true"></div>
                </div>

                <div className="dc-ethnic-card">
                  <div className="dc-ethnic-icon"><i className="fas fa-mosque"></i></div>
                  <h3>Người Chăm</h3>
                  <p>
                    Mang theo di sản văn hóa Chăm-pa độc đáo,
                    góp phần tạo nên sự đa dạng văn hóa cho thành phố.
                  </p>
                  <div className="dc-deco-motif" aria-hidden="true"></div>
                </div>

                <div className="dc-ethnic-card">
                  <div className="dc-ethnic-icon"><i className="fas fa-gopuram"></i></div>
                  <h3>Người Khmer</h3>
                  <p>
                    Cộng đồng người Khmer với bản sắc văn hóa đặc trưng
                    và các lễ hội truyền thống riêng biệt.
                  </p>
                  <div className="dc-deco-motif" aria-hidden="true"></div>
                </div>

                <div className="dc-ethnic-card">
                  <div className="dc-ethnic-icon"><i className="fas fa-mountain-sun"></i></div>
                  <h3>Người Tày & Các dân tộc khác</h3>
                  <p>
                    Cùng nhiều dân tộc khác từ khắp mọi miền,
                    tạo nên bức tranh cộng đồng đa sắc tộc phong phú.
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
                <h3>Khám phá trọn vẹn qua bản trình bày</h3>
                <p>Toàn bộ nội dung trực quan về địa lí dân cư Thành phố Hồ Chí Minh.</p>
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

            <GameRedirect to="/tro-choi-dan-cu" gameName="Quán ăn hạnh phúc" />
          </section>
        </div>
      </main>
    </div>
  );
}
