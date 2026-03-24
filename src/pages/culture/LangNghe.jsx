import './LangNghe.css';
import { useEffect } from 'react';

export default function LangNghe() {
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
            Văn Hóa
            <span className="ln-dot">·</span>
            <span className="ln-badge-accent">Làng Nghề</span>
          </span>

          <h1 className="ln-hero-title reveal fade-up delay-100">
            Làng Nghề<br /><span className="ln-highlight">Truyền Thống</span>
          </h1>

          <p className="ln-hero-desc reveal fade-up delay-200">
            Những làng nghề lâu đời tại TP.HCM lưu giữ kỹ thuật thủ công<br/>
            tinh xảo, mang đậm giá trị văn hóa và kinh tế địa phương.
          </p>

          <div className="ln-hero-pills reveal fade-up delay-300">
            <div className="ln-pill">
              <i className="fas fa-hourglass-half"></i>
              <div>
                <strong>Bề dày</strong>
                <span>100+ năm lịch sử</span>
              </div>
            </div>
            <div className="ln-pill">
              <i className="fas fa-hammer"></i>
              <div>
                <strong>Nổi bật</strong>
                <span>4 làng nghề tiêu biểu</span>
              </div>
            </div>
            <div className="ln-pill">
              <i className="fas fa-award"></i>
              <div>
                <strong>Giá trị</strong>
                <span>Di sản và tinh thần</span>
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
                <span className="ln-tag">Giá Trị Cốt Lõi</span>
                <h2 className="ln-section-title">Bản Sắc Làng Nghề TP.HCM</h2>
              </div>

              <div className="ln-ribbon reveal fade-up delay-100">
                <div className="ln-ribbon-card">
                  <div className="ln-ribbon-icon-wrap">
                    <i className="fas fa-hands"></i>
                  </div>
                  <div className="ln-ribbon-body">
                    <h3>Thủ công tỉ mỉ</h3>
                    <p>Quy trình sản xuất trải qua nhiều<br/>
                    công đoạn thủ công, đòi hỏi sự kiên nhẫn và kỹ thuật cao từ nghệ nhân.</p>
                  </div>
                  <span className="ln-ribbon-badge">Kỹ thuật</span>
                </div>
                <div className="ln-ribbon-card">
                  <div className="ln-ribbon-icon-wrap">
                    <i className="fas fa-leaf"></i>
                  </div>
                  <div className="ln-ribbon-body">
                    <h3>Nguyên liệu bản địa</h3>
                    <p>Sử dụng nguyên liệu gần gũi thiên nhiên, khai thác từ nguồn tài nguyên địa phương, gắn liền với vùng đất.</p>
                  </div>
                  <span className="ln-ribbon-badge">Tự nhiên</span>
                </div>
                <div className="ln-ribbon-card ln-ribbon-accent">
                  <div className="ln-ribbon-icon-wrap">
                    <i className="fas fa-gem"></i>
                  </div>
                  <div className="ln-ribbon-body">
                    <h3>Giá trị văn hóa & kinh tế</h3>
                    <p>Sản phẩm mang giá trị văn hóa truyền đời, đồng thời tạo sinh kế ổn định và mở rộng ra thị trường trong nước, xuất khẩu.</p>
                  </div>
                  <span className="ln-ribbon-badge">Di sản</span>
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
                    <span>Văn hóa</span>
                    <span>Lưu giữ kỹ thuật truyền đời</span>
                  </div>
                </div>
                <div className="ln-insight-divider"></div>
                <div className="ln-insight">
                  <div className="ln-insight-icon"><i className="fas fa-coins"></i></div>
                  <div className="ln-insight-text">
                    <span>Kinh tế</span>
                    <span>Sinh kế cho hộ gia đình</span>
                  </div>
                </div>
                <div className="ln-insight-divider"></div>
                <div className="ln-insight">
                  <div className="ln-insight-icon"><i className="fas fa-globe-asia"></i></div>
                  <div className="ln-insight-text">
                    <span>Thị trường</span>
                    <span>Mở rộng trong & ngoài nước</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Canva Embed */}
          <section className="ln-canvas">
            <div className="container">
              <div className="ln-canvas-intro reveal fade-up">
                <h3>Khám phá chi tiết qua bản trình bày</h3>
                <p>Toàn bộ nội dung trực quan về hành trình làng nghề TP.HCM.</p>
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
          </section>
        </div>
      </main>
    </div>
  );
}
