import './ViTri.css';
import { useEffect } from 'react';
import GameRedirect from '../../components/common/GameRedirect';

export default function ViTri() {
  useEffect(() => {
    document.body.classList.add('page-vi-tri-active');
    return () => {
      document.body.classList.remove('page-vi-tri-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.vi-tri-page .section-wrapper');

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
    <div className="vi-tri-page">
      {/* ── HERO ── */}
      <section className="vt-hero">
        <div className="vt-hero-deco vt-deco-topo"></div>
        <div className="vt-hero-deco vt-deco-compass"></div>
        <div className="vt-hero-deco vt-deco-grid"></div>

        <div className="container section-wrapper vt-hero-inner">
          <div className="vt-hero-badge reveal fade-up">
            <span>Địa Lí</span>
            <span className="vt-dot">·</span>
            <span className="vt-badge-accent">Vị Trí</span>
          </div>

          <h1 className="vt-hero-title reveal fade-up delay-100">
            Vị Trí Địa Lí <span className="vt-highlight">TP.HCM</span>
          </h1>

          <p className="vt-hero-desc reveal fade-up delay-200">
            TP.HCM giáp các tỉnh Đồng Nai, Đồng Tháp, Lâm Đồng, Tây Ninh và Biển Đông;
            tạo động lực phát triển của khu vực đồng bằng Đông Nam Bộ, Tây Nam Bộ và cả nước.
          </p>

          <div className="vt-hero-pills reveal fade-up delay-300">
            <div className="vt-pill">
              <i className="fas fa-expand-arrows-alt"></i>
              <div>
                <strong>Diện tích</strong>
                <span>~6.772 km²</span>
              </div>
            </div>
            <div className="vt-pill">
              <i className="fas fa-users"></i>
              <div>
                <strong>Dân số</strong>
                <span>Hơn 14 triệu người</span>
              </div>
            </div>
            <div className="vt-pill">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <strong>Hành chính</strong>
                <span>168 đơn vị cấp xã</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="vt-geo-content">
        <div className="section-wrapper vt-core-group">
          {/* Stats Dashboard */}
          <section className="vt-geo-stats">
            <div className="container">
              <div className="vt-stats-head reveal fade-up">
                <span className="vt-tag">Tổng Quan</span>
                <h2 className="vt-section-title">Bức Tranh Địa Lí Mở Rộng</h2>
                <p className="vt-stats-subtitle">
                  Quy mô mới của TP.HCM sau sắp xếp hành chính với diện tích lớn, dân số cao
                  và mạng lưới đơn vị cơ sở dày đặc.
                </p>
              </div>

              <div className="vt-stats-grid reveal fade-up delay-200">
                <div className="vt-stat-card vt-stat-main">
                  <div className="vt-stat-icon">
                    <i className="fas fa-ruler-combined"></i>
                  </div>
                  <div className="vt-stat-number">6.772</div>
                  <div className="vt-stat-unit">km²</div>
                  <div className="vt-stat-label">Tổng diện tích sau sáp nhập</div>
                  <div className="vt-stat-glow" aria-hidden="true"></div>
                </div>

                <div className="vt-stat-card">
                  <div className="vt-stat-icon">
                    <i className="fas fa-city"></i>
                  </div>
                  <div className="vt-stat-number">168</div>
                  <div className="vt-stat-unit">Đơn vị cấp xã</div>
                  <div className="vt-stat-label">Đơn vị hành chính</div>
                  <div className="vt-stat-breakdown">113 phường · 54 xã · 1 đặc khu</div>
                </div>

                <div className="vt-stat-card vt-stat-accent">
                  <div className="vt-stat-icon">
                    <i className="fas fa-user-friends"></i>
                  </div>
                  <div className="vt-stat-number">14+</div>
                  <div className="vt-stat-unit">Triệu người</div>
                  <div className="vt-stat-label">Dân số sau sáp nhập</div>
                </div>
              </div>
            </div>
          </section>

          {/* Geographic Highlights */}
          <section className="vt-highlights">
            <div className="container">
              <div className="vt-highlights-head reveal fade-up">
                <span className="vt-tag">Đặc Điểm Nổi Bật</span>
                <h2 className="vt-section-title">Lợi Thế Chiến Lược</h2>
              </div>

              <div className="vt-highlights-grid reveal fade-up delay-200">
                <div className="vt-hl-card">
                  <div className="vt-hl-icon">
                    <i className="fas fa-compass"></i>
                  </div>
                  <h3>Vị trí liên kết vùng</h3>
                  <p>
                    TP.HCM giáp Đồng Nai, Đồng Tháp, Lâm Đồng, Tây Ninh và Biển Đông,
                    tạo trục kết nối liên hoàn giữa cao nguyên, đồng bằng và biển.
                  </p>
                </div>

                <div className="vt-hl-card">
                  <div className="vt-hl-icon">
                    <i className="fas fa-water"></i>
                  </div>
                  <h3>Hệ thống sông ngòi</h3>
                  <p>
                    Sông Sài Gòn, sông Đồng Nai cùng mạng lưới kênh rạch
                    chằng chịt tạo hệ thống giao thông đường thủy phong phú.
                  </p>
                </div>

                <div className="vt-hl-card">
                  <div className="vt-hl-icon">
                    <i className="fas fa-plane-departure"></i>
                  </div>
                  <h3>Đầu mối giao thông</h3>
                  <p>
                    Sân bay Tân Sơn Nhất, cảng Cát Lái, hệ thống quốc lộ —
                    một trong những đầu mối giao thương quốc tế quan trọng của phía Nam.
                  </p>
                </div>

                <div className="vt-hl-card vt-hl-accent">
                  <div className="vt-hl-icon">
                    <i className="fas fa-globe-asia"></i>
                  </div>
                  <h3>Cửa ngõ quốc tế</h3>
                  <p>
                    Kết nối Đông Nam Á và thế giới, là một trong những đô thị
                    năng động của khu vực với hạ tầng hiện đại đang phát triển mạnh.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Canva Embed */}
          <section className="vt-canvas">
            <div className="container">
              <div className="vt-canvas-intro reveal fade-up">
                <h3>Khám phá trọn vẹn qua bản trình bày</h3>
                <p>Tổng hợp thông tin vị trí địa lí, đặc điểm tự nhiên và đơn vị hành chính TP.HCM.</p>
              </div>
              <div className="vt-canvas-frame reveal fade-up delay-200">
                <div className="vt-canvas-embed">
                  <iframe
                    loading="lazy"
                    src="https://www.canva.com/design/DAG6jKSZUe0/DCjgreIvm-qjpmn5JVA_lw/view?embed"
                    allowFullScreen
                    allow="fullscreen"
                    title="VỊ TRÍ ĐỊA LÍ TPHCM"
                  ></iframe>
                </div>
              </div>
            </div>

            <GameRedirect to="/tro-choi-vi-tri" gameName="Cuộc phiêu lưu của Táo Đỏ" />
          </section>
        </div>
      </main>
    </div>
  );
}
