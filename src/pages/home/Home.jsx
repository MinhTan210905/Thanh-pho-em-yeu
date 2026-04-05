import './Home.css';
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const sliderTrackRef = useRef(null);
  const counterRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    // === SLIDER LOGIC (INFINITE LOOP - FIXED) ===
    const track = sliderTrackRef.current;
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (!track || !nextBtn || !prevBtn) return;

    // Lấy tất cả slides gốc
    let slides = Array.from(track.getElementsByClassName('slide-item')).filter(
      slide => !slide.id || (!slide.id.includes('clone'))
    );

    if (slides.length === 0) return;

    const TOTAL_ORIGINAL = slides.length; // 11 slides

    // Tạo clone
    const firstSlide = slides[0].cloneNode(true);
    firstSlide.id = 'first-clone';
    const lastSlide = slides[slides.length - 1].cloneNode(true);
    lastSlide.id = 'last-clone';

    // Xóa clone cũ nếu có
    track.querySelectorAll('[id*="clone"]').forEach(el => el.remove());

    // Thêm clone mới
    track.prepend(lastSlide);   // [clone-slide10, slide0, slide1, ..., slide10]
    track.append(firstSlide);   // [clone-slide10, slide0, slide1, ..., slide10, clone-slide0]

    // State
    let counter = 1; // Bắt đầu ở slide 0 thực
    let isAnimating = false;
    let autoSlideInterval = null;

    // Set position ban đầu
    track.style.transition = 'none';
    track.style.transform = `translateX(${-counter * 100}%)`;

    const goToSlide = (slideIndex, animate = true) => {
      if (isAnimating) return;
      isAnimating = true;

      counter = slideIndex;
      track.style.transition = animate ? 'transform 1s ease-in-out' : 'none';
      track.style.transform = `translateX(${-counter * 100}%)`;
    };

    const next = () => goToSlide(counter + 1, true);
    const prev = () => goToSlide(counter - 1, true);

    const handleTransitionEnd = () => {
      isAnimating = false;

      // Jump từ clone về gốc
      if (counter >= TOTAL_ORIGINAL + 1) {
        // Tới clone-slide0 ở cuối
        track.style.transition = 'none';
        counter = 1;
        track.style.transform = `translateX(${-counter * 100}%)`;
      } else if (counter <= 0) {
        // Tới clone-slide10 ở đầu
        track.style.transition = 'none';
        counter = TOTAL_ORIGINAL;
        track.style.transform = `translateX(${-counter * 100}%)`;
      }
    };

    track.addEventListener('transitionend', handleTransitionEnd);

    // Auto-slide
    const startAutoSlide = () => {
      clearInterval(autoSlideInterval);
      autoSlideInterval = setInterval(next, 5000);
    };

    startAutoSlide();

    nextBtn.addEventListener('click', () => {
      next();
      startAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
      prev();
      startAutoSlide();
    });

    const handleVisibilityChange = () => {
      if (document.hidden) clearInterval(autoSlideInterval);
      else startAutoSlide();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(autoSlideInterval);
      track.removeEventListener('transitionend', handleTransitionEnd);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      nextBtn.removeEventListener('click', next);
      prevBtn.removeEventListener('click', prev);
    };
  }, []);

  useEffect(() => {
    // === COUNTER ANIMATION ===
    const runCounter = (el) => {
      const target = +el.getAttribute('data-target');
      const start = +el.getAttribute('data-start') || 0;
      const speed = 20;
      let count = start;

      const updateCount = () => {
        const distance = target - count;
        const inc = distance / speed;

        if (distance > 1) {
          count += inc;
          el.innerText = Math.ceil(count);
          setTimeout(updateCount, 20);
        } else {
          el.innerText = target;
        }
      };
      updateCount();
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
        } else {
          const startVal = entry.target.getAttribute('data-start') || 0;
          entry.target.innerText = startVal;
        }
      });
    }, { threshold: 0.5 });

    if (counterRef.current) {
      counterObserver.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        counterObserver.unobserve(counterRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // === REVEAL ANIMATIONS (Delayed to ensure initial hidden state) ===
    console.log('Setting up reveal animations...');

    // Delay to let elements render in hidden state
    const setupTimer = setTimeout(() => {
      const sectionWrappers = document.querySelectorAll('.section-wrapper');
      console.log('Found section wrappers:', sectionWrappers.length);

      if (sectionWrappers.length === 0) {
        console.warn('No section wrappers found!');
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              console.log('Adding active class to section:', entry.target.className.substring(0, 50));
              entry.target.classList.add('active');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -60px 0px'
        }
      );

      sectionWrappers.forEach((el) => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }, 300); // Wait 300ms for initial render

    return () => clearTimeout(setupTimer);
  }, []);

  return (
    <>
      <div className="video-wrapper">
        <div className="video-container">
          <div style={{ width: "100%", aspectRatio: "16/9" }}>
            <iframe
              src="https://www.youtube.com/embed/a-HnU3k7ZfM?autoplay=1&mute=1&controls=0&loop=1&playlist=a-HnU3k7ZfM"
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="autoplay"
              allowFullScreen
              title="YouTube video background"
            ></iframe>
          </div>
          <div className="overlay"></div>
        </div>
      </div>

      <main className="content-section">
        <section className="about-area">
          <div className="section-wrapper reveal fade-up">
            <div className="container">
              <div className="about-grid">
                <div className="about-image fade-right">
                  <div className="image-wrapper">
                    <div className="slider-window">
                      <div className="slider-track" id="sliderTrack" ref={sliderTrackRef}>
                        <div className="slide-item">
                          <img src="/images/trang_chu_1.png" alt="Tòa tháp Bitexco về đêm" />
                          <div className="slide-caption">
                            <h3>Tòa tháp Bitexco</h3>
                            <p>Biểu tượng hiện đại của Sài Gòn</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_2.jpg" alt="Chợ Bến Thành biểu tượng Sài Gòn" />
                          <div className="slide-caption">
                            <h3>Chợ Bến Thành</h3>
                            <p>Ngôi chợ trăm năm tuổi</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_3.png" alt="Đền Tưởng niệm các Vua Hùng" />
                          <div className="slide-caption">
                            <h3>Đền Tưởng niệm các Vua Hùng (Công viên Tao Đàn)</h3>
                            <p>Văn hóa tâm linh cội nguồn</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_4.jpg" alt="Nhà thờ Đức Bà cổ kính" />
                          <div className="slide-caption">
                            <h3>Nhà thờ Đức Bà</h3>
                            <p>Kiệt tác kiến trúc giữa lòng phố</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_5.jpg" alt="Bảo tàng Thành phố Hồ Chí Minh" />
                          <div className="slide-caption">
                            <h3>Bảo tàng TP. Hồ Chí Minh</h3>
                            <p>Nơi lưu giữ kí ức lịch sử</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_6.jpg" alt="Dinh Độc Lập lịch sử" />
                          <div className="slide-caption">
                            <h3>Dinh Độc Lập</h3>
                            <p>Di tích Quốc gia đặc biệt</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_7.png" alt="Hoàng hôn bên Hồ Bán Nguyệt" />
                          <div className="slide-caption">
                            <h3>Hồ Bán Nguyệt</h3>
                            <p>Vẻ đẹp lãng mạn lúc hoàng hôn</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_8.jpg" alt="Bưu điện Trung tâm Sài Gòn" />
                          <div className="slide-caption">
                            <h3>Bưu điện Trung tâm</h3>
                            <p>Dấu ấn kiến trúc Pháp độc đáo</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_9.jpg" alt="Nhà thờ Tân Định màu hồng độc đáo" />
                          <div className="slide-caption">
                            <h3>Nhà thờ Tân Định</h3>
                            <p>Nhà thờ màu hồng tuyệt đẹp</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_10.jpg" alt="Khu du lịch văn hóa Suối Tiên" />
                          <div className="slide-caption">
                            <h3>KDL Văn hóa Suối Tiên</h3>
                            <p>Thiên đường vui chơi giải trí</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_11.jpg" alt="Công viên Cầu Ánh Sao" />
                          <div className="slide-caption">
                            <h3>Cầu Ánh Sao</h3>
                            <p>Lung linh sắc màu về đêm</p>
                          </div>
                        </div>
                      </div>
                      <button id="prevBtn" className="slider-btn left-btn"></button>
                      <button id="nextBtn" className="slider-btn right-btn"></button>
                    </div>

                    <div className="exp-badge">
                      <div className="badge-group">
                        <span className="badge-num count" data-start="0" data-target="300" ref={counterRef}>0</span>
                        <span className="badge-plus">+</span>
                      </div>
                      <span className="badge-text">Năm hình thành<br />và phát triển</span>
                    </div>
                  </div>
                </div>

                <div className="about-content">
                  <h4 className="sub-title fade-up delay-100">XIN CHÀO!</h4>

                  <h2 className="main-title">
                    <span className="split-text fade-up delay-200">Khám phá Thành phố</span> <br />
                    <span className="split-text fade-up delay-300">Hồ Chí Minh</span>
                  </h2>

                  <p className="desc-text fade-up delay-400">
                    Chào mừng bạn đến với website <strong>Thành Phố Em Yêu</strong>, một
                    không gian học tập trực tuyến sinh động về lịch sử, địa lí, văn hóa - xã hội của thành
                    phố mang tên Bác.
                  </p>

                  <p className="desc-text fade-up delay-500">
                    Website được thiết kế dành cho giáo viên, học sinh và những ai yêu thích tìm hiểu về vùng
                    đất này. Tại đây, bạn sẽ được bước vào hành trình khám phá những trang sử hào hùng, các
                    đặc điểm địa lí nổi bật và nét đẹp trong đời sống của người dân nơi đây.
                  </p>

                  <div className="btn-wrapper fade-up delay-600">
                    <a href="#" className="btn-primary">Tìm hiểu thêm <i className="fas fa-arrow-right"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="geo-area">
          <div className="section-wrapper reveal fade-up">
            <div className="container">
              <div className="geo-wrapper">
                <div className="geo-content">
                  <h4 className="sub-title fade-up">TỔNG QUAN</h4>

                  <h2 className="main-title">
                    <span className="split-text fade-up delay-100">Địa Lí Thành phố</span> <br />
                    <span className="split-text fade-up delay-200">Hồ Chí Minh</span>
                  </h2>

                  <p className="desc-text fade-up delay-300">
                    Khám phá Thành phố Hồ Chí Minh qua lăng kính địa lí đầy sống động –
                    nơi những bản đồ trực quan mở ra trước mắt bạn một hành trình hiểu sâu
                    về địa hình, khí hậu, sông ngòi và nhịp phát triển đô thị không ngừng của thành phố.
                  </p>

                  <p className="desc-text fade-up delay-400">
                    Website mang đến kho tư liệu phong phú với hình ảnh,
                    video và dữ liệu thông tin bổ ích. Giúp bạn cảm nhận rõ nét
                    sự chuyển mình của không gian đô thị; tìm hiểu từng phường,
                    từng xã, và thấy được vai trò trọng yếu của Thành phố Hồ Chí Minh
                    trong vùng kinh tế động lực phía Nam.
                  </p>

                  <div className="fade-up delay-500">
                    <Link to="/dia-ly" className="btn-primary btn-outline">Khám phá ngay <i className="fas fa-arrow-right"></i></Link>
                  </div>
                </div>

                <div className="geo-grid">
                  <Link to="/vi-tri" className="geo-card fade-up delay-600">
                    <img src="/images/dia_ly_1.jfif" alt="Vị trí địa lí" />
                    <div className="geo-tag">
                      <i className="fas fa-map-marked-alt"></i>
                      <span>Vị trí</span>
                    </div>
                  </Link>

                  <Link to="/tu-nhien" className="geo-card fade-up delay-700">
                    <img src="/images/dia_ly_2.svg" alt="Đặc điểm tự nhiên" />
                    <div className="geo-tag">
                      <i className="fas fa-tree"></i>
                      <span>Tự nhiên</span>
                    </div>
                  </Link>

                  <Link to="/kinh-te" className="geo-card fade-up delay-800">
                    <img src="/images/dia_ly_3.jpg" alt="Kinh tế phát triển" />
                    <div className="geo-tag">
                      <i className="fas fa-chart-line"></i>
                      <span>Kinh tế</span>
                    </div>
                  </Link>

                  <Link to="/dan-cu" className="geo-card fade-up delay-900">
                    <img src="/images/dia_ly_4.jpg" alt="Dân cư" />
                    <div className="geo-tag">
                      <i className="fas fa-users"></i>
                      <span>Dân cư</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="history-area">
          <div className="section-wrapper reveal fade-up">
            <div className="container">
              <div className="history-header">
                <h4
                  className="sub-title fade-up"
                  style={{ color: "#ffcc00", borderColor: "#ffcc00" }}
                >
                  DÒNG CHẢY THỜI GIAN
                </h4>
                <h2 className="main-title text-white fade-up delay-200">Lịch sử hào hùng</h2>
                <p className="desc-text text-white-50 fade-up delay-400">
                  Khám phá chiều sâu lịch sử Thành phố Hồ Chí Minh là một hành trình ngược dòng thời gian đầy thú vị.
                  Nơi đưa bạn trở về với những bước chân khai phá đầu tiên để chứng kiến sự hình thành, phát triển của một vùng đất kiên cường.
                  Trải qua bao biến cố, mảnh đất ấy đã viết nên những trang sử vàng trong công cuộc đấu tranh giành độc lập dân tộc.
                </p>
              </div>

              <div className="history-grid">
                <div className="history-card fade-up delay-800">
                  <Link to="/di-tich" className="history-link">
                    <img src="/images/lich_su_2.jpg" alt="Di tích lịch sử" />
                    <div className="history-overlay">
                      <h3>Di tích<br />Lịch sử</h3>
                      <p>Những công trình kiến trúc ghi dấu ấn thời gian.</p>
                      <span className="btn-link">Xem chi tiết <i className="fas fa-arrow-right"></i></span>
                    </div>
                  </Link>
                </div>

                <div className="history-card reveal fade-up delay-1000">
                  <Link to="/nhan-vat" className="history-link">
                    <img src="/images/lich_su_3.jpg" alt="Nhân vật lịch sử" />
                    <div className="history-overlay">
                      <h3>Nhân vật<br />Lịch sử</h3>
                      <p>Những người con ưu tú đã làm rạng danh vùng đất này.</p>
                      <span className="btn-link">Xem chi tiết <i className="fas fa-arrow-right"></i></span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="history-footer fade-up delay-1200">
                <Link to="/lich-su" className="btn-primary btn-history">Tìm hiểu thêm <i className="fas fa-arrow-right"></i></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="culture-area">
          <div className="section-wrapper reveal fade-up">
            <div className="container">
              <div className="culture-wrapper">
                <div className="culture-content">
                  <h4 className="sub-title fade-up">ĐA DẠNG và BẢN SẮC</h4>
                  <h2 className="main-title fade-up delay-200">Văn hóa - Xã hội</h2>
                  <p className="desc-text fade-up delay-400">
                    Không chỉ là đầu tàu kinh tế của cả nước, Thành phố Hồ Chí Minh còn là bức tranh sống động nơi bản sắc truyền thống hòa quyện cùng nhịp sống hiện đại. Từ những ngôi chùa cổ kính nép mình bên tòa nhà chọc trời, đến gánh hàng rong bánh đa giữa phố thị phồn hoa.
                  </p>
                  <p className="desc-text fade-up delay-600">
                    Hãy cùng khám phá chiều sâu văn hóa của vùng đất này, nơi mỗi góc phố dấu ấn chứa những câu chuyện thú vị về phong tục, lễ hội và sự hào sảng, nghĩa tình của người dân nơi đây.
                  </p>
                  <div className="fade-up delay-700">
                    <Link to="/van-hoa" className="btn-primary">Khám phá ngay <i className="fas fa-arrow-right"></i></Link>
                  </div>
                </div>

                <div className="culture-grid">
                  <div className="culture-item fade-up delay-1000">
                    <Link to="/am-thuc" className="culture-link">
                      <img src="/images/vanhoa_xahoi_1.jpg" alt="Ẩm thực Sài Gòn" />
                      <div className="culture-tag">🍜 Ẩm thực</div>
                    </Link>
                  </div>

                  <div className="culture-item fade-up delay-1200">
                    <Link to="/le-hoi" className="culture-link">
                      <img src="/images/vanhoa_xahoi_3.svg" alt="Lễ hội truyền thống" />
                      <div className="culture-tag">🎉 Lễ hội</div>
                    </Link>
                  </div>

                  <div className="culture-item fade-up delay-1400">
                    <Link to="/lang-nghe" className="culture-link">
                      <img src="/images/vanhoa_xahoi_4.svg" alt="Làng nghề truyền thống" />
                      <div className="culture-tag">🎨 Làng nghề</div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        <section className="learning-area">
          <div className="section-wrapper reveal fade-up">
            <div className="container">
              <div className="learning-header">
                <h4 className="sub-title fade-up">KHO TÀNG TRI THỨC</h4>
                <h2 className="main-title fade-up delay-200">Tài liệu và Ôn tập</h2>
                <p className="desc-text fade-up delay-400">
                  Truy cập kho tàng tài liệu phong phú từ sách tham khảo đến các trò chơi ôn tập kiến thức đầy hấp dẫn.
                </p>
              </div>

              <div className="learning-grid">
                <div className="learning-card fade-up delay-600">
                  <img src="/images/tailieu_hoctap_1.jpg" className="card-bg-img" alt="Thư viện tài liệu" />
                  <div className="overlay-dark"></div>
                  <div className="card-content">
                    <div className="icon-small"><i className="fas fa-book-reader"></i></div>
                    <h3>Thư viện tài liệu</h3>
                    <p>Tổng hợp sách, bài báo và tư liệu quý về lịch sử, văn hóa Sài Gòn xưa và nay.</p>
                    <a href="#" className="btn-outline-white">Xem ngay <i className="fas fa-arrow-right"></i></a>
                  </div>
                </div>

                <div className="learning-card fade-up delay-800">
                  <img src="/images/tailieu_hoctap_2.jpg" className="card-bg-img" alt="Trò chơi dân gian" />
                  <div className="overlay-dark"></div>
                  <div className="card-content">
                    <div className="icon-small"><i className="fas fa-gamepad"></i></div>
                    <h3>Trò chơi ôn tập</h3>
                    <p>Thử thách kiến thức qua các bài Quiz vui nhộn, vừa học vừa chơi cực đã.</p>
                    <Link to="/bai-tap" className="btn-outline-white">Chơi ngay <i className="fas fa-arrow-right"></i></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
