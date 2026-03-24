import './KinhTe.css';
import { useEffect } from 'react';

export default function KinhTe() {
  useEffect(() => {
    document.body.classList.add('page-kinh-te-active');
    return () => {
      document.body.classList.remove('page-kinh-te-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.kinh-te-page .section-wrapper');

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
    <div className="kinh-te-page">
      {/* ── HERO ── */}
      <section className="kt-hero">
        <div className="kt-hero-deco kt-deco-chart"></div>
        <div className="kt-hero-deco kt-deco-bars"></div>
        <div className="kt-hero-deco kt-deco-pulse"></div>

        <div className="container section-wrapper kt-hero-inner">
          <div className="kt-hero-badge reveal fade-up">
            <span>Địa Lý</span>
            <span className="kt-dot">·</span>
            <span className="kt-badge-accent">Kinh Tế</span>
          </div>

          <h1 className="kt-hero-title reveal fade-up delay-100">
            Địa Lí Kinh Tế <span className="kt-highlight">TP.HCM</span>
          </h1>

          <p className="kt-hero-desc reveal fade-up delay-200">
            Thành phố Hồ Chí Minh là trung tâm kinh tế lớn nhất cả nước
            với 3 khu vực kinh tế chủ lực, hơn 10 hệ thống khu công nghiệp
            quy mô lớn và nông nghiệp ứng dụng công nghệ cao, giữ vai trò
            đầu tàu phát triển kinh tế quốc gia.
          </p>

          <div className="kt-hero-pills reveal fade-up delay-300">
            <div className="kt-pill">
              <i className="fas fa-briefcase"></i>
              <div>
                <strong>Dịch vụ</strong>
                <span>Trung tâm hàng đầu</span>
              </div>
            </div>
            <div className="kt-pill">
              <i className="fas fa-industry"></i>
              <div>
                <strong>Công nghiệp</strong>
                <span>10+ KCN lớn</span>
              </div>
            </div>
            <div className="kt-pill">
              <i className="fas fa-seedling"></i>
              <div>
                <strong>Nông nghiệp</strong>
                <span>Công nghệ cao</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="kt-content">
        <div className="section-wrapper kt-core-group">

          {/* KPI Strip */}
          <section className="kt-kpi-strip">
            <div className="container">
              <div className="kt-kpi-bar reveal fade-up">
                <div className="kt-kpi">
                  <div className="kt-kpi-number">3</div>
                  <div className="kt-kpi-text">
                    <span>Khu vực</span>
                    <span>Kinh tế chủ lực</span>
                  </div>
                </div>
                <div className="kt-kpi-divider"></div>
                <div className="kt-kpi">
                  <div className="kt-kpi-number">10+</div>
                  <div className="kt-kpi-text">
                    <span>Khu CN</span>
                    <span>Quy mô lớn</span>
                  </div>
                </div>
                <div className="kt-kpi-divider"></div>
                <div className="kt-kpi">
                  <div className="kt-kpi-number">No.1</div>
                  <div className="kt-kpi-text">
                    <span>Đầu tàu</span>
                    <span>Kinh tế quốc gia</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sector Bento Grid */}
          <section className="kt-sectors">
            <div className="container">
              <div className="kt-sectors-head reveal fade-up">
                <span className="kt-tag">Ba Trụ Cột</span>
                <h2 className="kt-section-title">Cơ Cấu Kinh Tế Đa Dạng</h2>
              </div>

              <div className="kt-bento reveal fade-up delay-200">
                {/* Large card — Dịch vụ */}
                <article className="kt-bento-card kt-bento-large">
                  <div className="kt-bento-icon-wrap">
                    <i className="fas fa-concierge-bell"></i>
                  </div>
                  <h3>Dịch vụ</h3>
                  <p>
                    Thành phố là trung tâm dịch vụ lớn nhất cả nước. Một số ngành
                    nổi bật: giao thông vận tải, thương mại, du lịch, bất động sản,
                    tài chính – ngân hàng…
                  </p>
                  <div className="kt-deco-motif" aria-hidden="true"></div>
                </article>

                {/* Right column — stacked */}
                <article className="kt-bento-card">
                  <div className="kt-bento-icon-wrap">
                    <i className="fas fa-hard-hat"></i>
                  </div>
                  <h3>Công nghiệp – Xây dựng</h3>
                  <p>
                    Thu hút hàng nghìn doanh nghiệp; nổi bật ở cơ khí, dệt may,
                    giày da, nhựa – cao su, điện tử, chế biến thực phẩm và
                    thủy – hải sản. Nhiều KCN lớn: Hiệp Phước, Vĩnh Lộc,
                    Tân Phú Trung, Linh Trung…
                  </p>
                  <div className="kt-deco-motif" aria-hidden="true"></div>
                </article>

                <article className="kt-bento-card kt-bento-accent">
                  <div className="kt-bento-icon-wrap">
                    <i className="fas fa-leaf"></i>
                  </div>
                  <h3>Nông nghiệp</h3>
                  <p>
                    Trồng rau màu, hoa lan, cây kiểng, lúa; chăn nuôi bò, lợn,
                    gia cầm. Ứng dụng nhà màng, nhà lưới, thủy canh, cảm biến
                    nhiệt – ẩm, năng lượng mặt trời.
                  </p>
                  <div className="kt-deco-motif" aria-hidden="true"></div>
                </article>
              </div>
            </div>
          </section>

          {/* Future Outlook callout */}
          <section className="kt-outlook">
            <div className="container reveal fade-up">
              <div className="kt-outlook-box">
                <div className="kt-outlook-icon"><i className="fas fa-rocket"></i></div>
                <div className="kt-outlook-content">
                  <h3>Tầm nhìn & Thách thức</h3>
                  <p>
                    Thành phố tiếp tục mở rộng nghiên cứu khoa học trong lĩnh vực công nghệ,
                    đẩy mạnh liên kết vùng và phấn đấu giữ vững vai trò đầu tàu kinh tế cả nước.
                    Song song đó, TP.HCM đang đối mặt thách thức môi trường - ô nhiễm nước,
                    không khí, rác thải - và đẩy mạnh giải pháp đô thị xanh, đô thị thông minh,
                    phát triển phương tiện công cộng.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Canva Embed */}
          <section className="kt-canvas">
            <div className="container">
              <div className="kt-canvas-intro reveal fade-up">
                <h3>Khám phá trọn vẹn qua bản trình bày</h3>
                <p>Tổng quan cấu trúc kinh tế, các khu công nghiệp và tiềm năng phát triển của TP.HCM.</p>
              </div>
              <div className="kt-canvas-frame reveal fade-up delay-200">
                <div className="kt-canvas-embed">
                  <iframe
                    loading="lazy"
                    src="https://www.canva.com/design/DAG8kxFStN4/ulDiQDr61wl6nEWVh1_TJA/view?embed"
                    allowFullScreen
                    allow="fullscreen"
                    title="ĐỊA LÍ KINH TẾ TPHCM"
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
