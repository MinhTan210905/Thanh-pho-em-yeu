import './AmThuc.css';
import { useEffect } from 'react';
import GameRedirect from '../../components/common/GameRedirect';

export default function AmThuc() {
  useEffect(() => {
    document.body.classList.add('page-am-thuc-active');
    return () => {
      document.body.classList.remove('page-am-thuc-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.am-thuc-page .section-wrapper');

      if (sectionWrappers.length === 0) {
        return;
      }

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
    <div className="am-thuc-page">
      <section className="at-hero">
        <div className="at-hero-glow at-glow-1"></div>
        <div className="at-hero-glow at-glow-2"></div>
        <div className="container section-wrapper at-hero-grid">
          <div className="at-hero-copy">
            <div className="at-breadcrumb reveal fade-up">
              <span>Văn Hóa</span>
              <span className="at-separator">•</span>
              <span className="at-current">Ẩm Thực</span>
            </div>
            <h1 className="at-title reveal fade-up delay-100">Ẩm Thực TP.HCM</h1>
            <p className="at-subtitle reveal fade-up delay-200">
              Top 20 thành phố có ẩm thực ngon nhất thế giới. Nơi đây là sự kết tinh,
                hội tụ tinh hoa ẩm thực Bắc - Trung - Nam và cả sắc vị phương Đông.
            </p>
            <div className="at-hero-points reveal fade-up delay-300">
              <span>• Đa dạng món ăn đường phố</span>
              <span>• Giao thoa văn hóa vị giác</span>
              <span>• Năng động, hiện đại, bản sắc</span>
            </div>
          </div>

          <div className="at-hero-panel reveal zoom-in delay-300">
            <div className="at-stat-card">
              <span className="at-stat-label">Xếp hạng quốc tế</span>
              <strong className="at-stat-value">Top 20</strong>
            </div>
            <div className="at-stat-card">
              <span className="at-stat-label">Hội tụ vùng miền</span>
              <strong className="at-stat-value">Bắc · Trung · Nam</strong>
            </div>
            <div className="at-stat-card">
              <span className="at-stat-label">Bản sắc</span>
              <strong className="at-stat-value">Phương Đông</strong>
            </div>
          </div>
        </div>
      </section>

      <main className="at-content">
        <div className="section-wrapper at-core-group">
          <section className="at-overview">
            <div className="container">
            <div className="at-overview-top reveal fade-up">
              <span className="at-tag">Ẩm Thực Đô Thị</span>
              <h2 className="at-section-title">Tươi Mới, Phóng Khoáng, Kết Nối</h2>
            </div>

            <div className="at-bento-grid reveal fade-up delay-200">
              <div className="at-bento-summary">
                <div className="at-summary-badge">
                  <i className="fas fa-utensils"></i>
                  Top 20 Thế Giới
                </div>
                <h3 className="at-summary-title">
                  Top 20 thành phố có ẩm thực ngon nhất thế giới
                </h3>
                <p className="at-summary-desc">
                  Ẩm thực nơi đây là sự kết tinh, hội tụ nền ẩm thực từ khắp
                  mọi miền Bắc - Trung - Nam và cả ẩm thực phương Đông.
                </p>
                <div className="at-summary-regions">
                  <span><i className="fas fa-location-dot"></i> Bắc</span>
                  <span><i className="fas fa-location-dot"></i> Trung</span>
                  <span><i className="fas fa-location-dot"></i> Nam</span>
                  <span><i className="fas fa-globe-asia"></i> Phương Đông</span>
                </div>
              </div>

              <div className="at-bento-cards">
                <div className="at-b-card">
                  <div className="at-b-icon"><i className="fas fa-clock"></i></div>
                  <div>
                    <h3>Độ phủ món ngon</h3>
                    <p>Sáng, trưa, tối đều có lựa chọn từ bình dân đến cao cấp.</p>
                  </div>
                </div>
                <div className="at-b-card">
                  <div className="at-b-icon"><i className="fas fa-mug-hot"></i></div>
                  <div>
                    <h3>Nhịp sống thành phố</h3>
                    <p>Ẩm thực gắn với văn hóa đường phố, nhanh, tiện nhưng vẫn đậm vị.</p>
                  </div>
                </div>
                <div className="at-b-card at-b-card-accent">
                  <div className="at-b-icon"><i className="fas fa-star"></i></div>
                  <div>
                    <h3>Điểm đặc trưng</h3>
                    <p>Đa vùng miền · Dễ tiếp cận · Liên tục sáng tạo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="at-canvas">
          <div className="container">
            <div className="at-canvas-head reveal fade-up">
              <h3>Khám phá chi tiết qua bản trình bày</h3>
              <p>Toàn bộ nội dung trực quan về hành trình ẩm thực TP.HCM.</p>
            </div>
            <div className="at-canvas-wrapper reveal fade-up delay-200">
              <div className="at-canvas-embed">
                <iframe
                  loading="lazy"
                  src="https://www.canva.com/design/DAG9QlrPYmY/5Ra1NBbgB0OT_NpMmPNX9Q/view?embed"
                  allowFullScreen
                  allow="fullscreen"
                  title="ẨM THỰC TP.HCM"
                ></iframe>
              </div>
            </div>
          </div>

          <GameRedirect to="/tro-choi-am-thuc" gameName="Đuổi hình bắt chữ" />
        </section>
        </div>
      </main>
    </div>
  );
}
