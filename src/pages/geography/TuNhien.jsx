import './TuNhien.css';
import { useEffect } from 'react';
import GameRedirect from '../../components/common/GameRedirect';

export default function TuNhien() {
  useEffect(() => {
    document.body.classList.add('page-tu-nhien-active');
    return () => {
      document.body.classList.remove('page-tu-nhien-active');
    };
  }, []);

  useEffect(() => {
    let observer;

    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.tu-nhien-page .section-wrapper');
      const heroReveals = document.querySelectorAll('.tn-hero .reveal');

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
    <div className="tu-nhien-page">
      {/* ── HERO — 2-Column Explorer ── */}
      <section className="tn-hero">
        <div className="tn-hero-deco tn-deco-wave"></div>
        <div className="tn-hero-deco tn-deco-dots"></div>
        <div className="tn-hero-deco tn-deco-mist"></div>
        <div className="tn-hero-deco tn-deco-meteors" aria-hidden="true">
          <span className="tn-meteor"></span>
          <span className="tn-meteor"></span>
          <span className="tn-meteor"></span>
          <span className="tn-meteor"></span>
          <span className="tn-meteor"></span>
          <span className="tn-meteor"></span>
        </div>

        <div className="container tn-hero-grid">
          {/* Left: Copy */}
          <div className="tn-hero-copy">
            <span className="tn-hero-badge reveal fade-up">
              Địa Lý
              <span className="tn-dot">·</span>
              <span className="tn-badge-accent">Tự Nhiên</span>
            </span>

            <h1 className="tn-title reveal fade-up delay-100">
              Địa Lí<br /><span className="tn-highlight">Tự Nhiên</span>
            </h1>

            <p className="tn-subtitle reveal fade-up delay-200">
              Khám phá hệ sinh thái phong phú, địa hình đa dạng, khí hậu
              nhiệt đới and mạng lưới sông ngòi dày đặc của TP.HCM.
            </p>

            <div className="tn-hero-points reveal fade-up delay-300">
              <div className="tn-point">
                <i className="fas fa-mountain"></i>
                <span>5 dạng địa hình đặc trưng</span>
              </div>
              <div className="tn-point">
                <i className="fas fa-seedling"></i>
                <span>2000+ loài sinh vật</span>
              </div>
              <div className="tn-point">
                <i className="fas fa-water"></i>
                <span>5+ sông ngòi & 7+ kênh rạch</span>
              </div>
            </div>
          </div>

          {/* Right: Nature Dashboard Panel */}
          <div className="tn-hero-panel reveal zoom-in delay-300">
            <div className="tn-panel-card">
              <span className="tn-panel-num">2000+</span>
              <span className="tn-panel-label">Loài sinh vật</span>
            </div>
            <div className="tn-panel-card">
              <span className="tn-panel-num">8+</span>
              <span className="tn-panel-label">Loại khoáng sản</span>
            </div>
            <div className="tn-panel-card tn-panel-accent">
              <span className="tn-panel-num">27.6°C</span>
              <span className="tn-panel-label">Nhiệt độ TB</span>
            </div>
            <div className="tn-panel-card">
              <span className="tn-panel-num">7+</span>
              <span className="tn-panel-label">Kênh rạch</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="tn-content">
        <div className="section-wrapper tn-core-group">

          {/* Biome Chips Strip */}
          <section className="tn-biomes">
            <div className="container">
              <div className="tn-biomes-head reveal fade-up">
                <span className="tn-tag">Khám Phá</span>
                <h2 className="tn-section-title">Hệ Sinh Thái & Tài Nguyên</h2>
              </div>
              <div className="tn-biome-chips reveal fade-up delay-100">
                <div className="tn-chip"><i className="fas fa-paw"></i><span>Sinh vật</span></div>
                <div className="tn-chip"><i className="fas fa-layer-group"></i><span>Đất</span></div>
                <div className="tn-chip"><i className="fas fa-gem"></i><span>Khoáng sản</span></div>
                <div className="tn-chip"><i className="fas fa-mountain"></i><span>Địa hình</span></div>
                <div className="tn-chip"><i className="fas fa-cloud-sun"></i><span>Khí hậu</span></div>
                <div className="tn-chip"><i className="fas fa-water"></i><span>Sông ngòi</span></div>
                <div className="tn-chip"><i className="fas fa-ship"></i><span>Biển</span></div>
              </div>
            </div>
          </section>

          {/* Nature Mosaic — staggered 3-col grid */}
          <section className="tn-mosaic">
            <div className="container">
              <div className="tn-mosaic-grid reveal fade-up delay-100">
                {/* Row 1: Wide + Small */}
                <div className="tn-mosaic-card tn-mosaic-wide">
                  <div className="tn-mosaic-icon"><i className="fas fa-paw"></i></div>
                  <h3>Sinh vật</h3>
                  <p>
                    Hơn 2.000 loài sinh vật đa dạng, bao gồm thực vật, động vật
                    and vi sinh vật, tạo nên hệ sinh thái phong phú cho thành phố.
                  </p>
                  <span className="tn-mosaic-badge">2000+ loài</span>
                </div>
                <div className="tn-mosaic-card">
                  <div className="tn-mosaic-icon"><i className="fas fa-layer-group"></i></div>
                  <h3>Đất</h3>
                  <p>
                    Nhiều loại đất khác nhau phù hợp nông nghiệp, xây dựng
                    and phát triển đô thị.
                  </p>
                  <span className="tn-mosaic-badge">Đa dạng</span>
                </div>

                {/* Row 2: Small accent + Wide */}
                <div className="tn-mosaic-card tn-mosaic-accent">
                  <div className="tn-mosaic-icon"><i className="fas fa-gem"></i></div>
                  <h3>Khoáng sản</h3>
                  <p>
                    Tài nguyên khoáng sản gồm cát, sỏi, đá, sét and nhiều loại
                    khác phục vụ xây dựng, công nghiệp.
                  </p>
                  <span className="tn-mosaic-badge">8+ loại</span>
                </div>
                <div className="tn-mosaic-card tn-mosaic-wide">
                  <div className="tn-mosaic-icon"><i className="fas fa-cloud-sun"></i></div>
                  <h3>Khí hậu</h3>
                  <p>
                    Thành phố Hồ chí Minh chỉ có hai mùa: mùa khô and mùa mưa,
                    chịu ảnh hưởng của gió mùa.
                  </p>
                  <span className="tn-mosaic-badge">27.6°C · 1.500–1.979 mm</span>
                </div>

                {/* Row 3: 3 small */}
                <div className="tn-mosaic-card">
                  <div className="tn-mosaic-icon"><i className="fas fa-mountain"></i></div>
                  <h3>Địa hình</h3>
                  <p>
                    Đồng bằng thấp, trũng, đầm lầy; Gò cao lượn sóng; Đồng bằng phẳng,
                    thấp; Đồi núi thấp;  Địa hình ven biển, tạo nên cảnh quan đa dạng.
                  </p>
                  <span className="tn-mosaic-badge">5 dạng</span>
                </div>
                <div className="tn-mosaic-card">
                  <div className="tn-mosaic-icon"><i className="fas fa-water"></i></div>
                  <h3>Sông ngòi & Kênh rạch</h3>
                  <p>
                    Hệ thống sông ngòi, kênh rạch vô cùng đa dạng thuận lợi cho
                    các hoạt động giao thông đường thủy,
                    sản xuất nông nghiệp, du lịch sinh thái…
                  </p>
                  <span className="tn-mosaic-badge">5+ sông · 7+ kênh</span>
                </div>
                <div className="tn-mosaic-card">
                  <div className="tn-mosaic-icon"><i className="fas fa-ship"></i></div>
                  <h3>Biển</h3>
                  <p>
                    Tiếp giáp biển Đông với hơn 2 vùng biển, tạo điều kiện
                    phát triển kinh tế biển and giao thương quốc tế.
                  </p>
                  <span className="tn-mosaic-badge">2+ vùng</span>
                </div>
              </div>
            </div>
          </section>

          {/* Canva Embed */}
          <section className="tn-canvas">
            <div className="container">
              <div className="tn-canvas-intro reveal fade-up">
                <h3>Khám phá trọn vẹn qua bản trình bày</h3>
                <p>Toàn bộ nội dung trực quan về địa lí tự nhiên Thành phố Hồ Chí Minh.</p>
              </div>
              <div className="tn-canvas-frame reveal fade-up delay-200">
                <div className="tn-canvas-embed">
                  <iframe
                    loading="lazy"
                    src="https://www.canva.com/design/DAHCLpToiSA/brS7O1C6CiOfWQrRQvBzlg/view?embed"
                    allowFullScreen
                    allow="fullscreen"
                    title="ĐỊA LÍ TỰ NHIÊN TPHCM"
                  ></iframe>
                </div>
              </div>
            </div>

            <GameRedirect to="/tro-choi-dia-li-tu-nhien" gameName="Truy tìm bí ẩn tự nhiên" />
          </section>
        </div>
      </main>
    </div>
  );
}
