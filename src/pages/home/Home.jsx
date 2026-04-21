import './Home.css';
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t, i18n } = useTranslation();
  const sliderTrackRef = useRef(null);
  const counterRef = useRef(null);
  const videoWrapperRef = useRef(null); // Ref for the video section

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

    const handleNextClick = () => {
      next();
      startAutoSlide();
    };

    const handlePrevClick = () => {
      prev();
      startAutoSlide();
    };

    nextBtn.addEventListener('click', handleNextClick);
    prevBtn.addEventListener('click', handlePrevClick);

    const handleVisibilityChange = () => {
      if (document.hidden) clearInterval(autoSlideInterval);
      else startAutoSlide();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(autoSlideInterval);
      track.removeEventListener('transitionend', handleTransitionEnd);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      nextBtn.removeEventListener('click', handleNextClick);
      prevBtn.removeEventListener('click', handlePrevClick);
    };
  }, [i18n.resolvedLanguage]);

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

  // === AUDIO LOGIC ===
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // Khôi phục trạng thái "tạm dừng" từ session nếu có
  const isSessionPaused = () => sessionStorage.getItem('khampha_home_music_session_paused') === 'true';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Luôn bắt đầu lại từ đầu khi vào trang chủ (chạy chung với video background)
    audio.currentTime = 0;
    
    // KHÔNG reset trạng thái ở đây để giữ "trí nhớ" khi chuyển trang
    const currentlyPaused = isSessionPaused();

    const checkPlayState = () => setIsPlaying(!audio.paused);
    audio.addEventListener('play', checkPlayState);
    audio.addEventListener('pause', checkPlayState);

    // Cố gắng phát ngay từ đầu cùng với video (nếu không bị pause từ trước)
    if (!isSessionPaused()) {
      audio.play().catch(() => console.log('Chờ tương tác để phát nhạc...'));
    }

    // Chờ người dùng chạm/nhấp vào trang để vượt rào chặn autoplay của trình duyệt
    const forcePlayOnInteraction = () => {
      // Chỉ tự động phát nếu người dùng chưa bấm nút Tắt trong phiên này
      if (audio.paused && !isSessionPaused()) {
        audio.play().catch(() => {});
      }
      document.removeEventListener('click', forcePlayOnInteraction);
      document.removeEventListener('touchstart', forcePlayOnInteraction);
    };
    document.addEventListener('click', forcePlayOnInteraction);
    document.addEventListener('touchstart', forcePlayOnInteraction);

    // Xử lý khi chuyển tab trình duyệt
    const handleVisibilityChange = () => {
      if (document.hidden) {
        audio.pause();
      } else {
        // Chỉ phát lại nếu người dùng không chủ động tắt trước đó
        if (!isSessionPaused()) {
          audio.play().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      audio.removeEventListener('play', checkPlayState);
      audio.removeEventListener('pause', checkPlayState);
      document.removeEventListener('click', forcePlayOnInteraction);
      document.removeEventListener('touchstart', forcePlayOnInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audio.pause();
    };
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      sessionStorage.setItem('khampha_home_music_session_paused', 'true');
    } else {
      sessionStorage.setItem('khampha_home_music_session_paused', 'false');
      audio.play().catch(() => {});
    }
  };

  return (
    <>
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src="/audio/The_City_Wakes_In_Red.mp3" 
        loop={true} 
        preload="auto"
      />
      
      <div className="video-wrapper" ref={videoWrapperRef} style={{ position: "relative" }}>
        {/* Floating button at bottom left of the video */}
        <button 
          className="audio-toggle-btn-bottomleft" 
          onClick={togglePlay} 
          title={isPlaying ? t("home.music_pause") : t("home.music_play")}
        >
          {isPlaying ? <i className="fas fa-volume-up"></i> : <i className="fas fa-volume-mute"></i>}
        </button>

        <div className="video-container">
          <div style={{ width: "100%", aspectRatio: "16/9" }}>
            <iframe
              src="https://www.youtube.com/embed/a-HnU3k7ZfM?autoplay=1&mute=1&controls=0&loop=1&playlist=a-HnU3k7ZfM"
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="autoplay"
              allowFullScreen
              title="Video nền YouTube"
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
                          <img src="/images/trang_chu_1.png" alt={t("home.slider.bitexco_title")} />
                          <div className="slide-caption">
                            <h3>{t("home.slider.bitexco_title")}</h3>
                            <p>{t("home.slider.bitexco_desc")}</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_2.jpg" alt={t("home.slider.benthanh_title")} />
                          <div className="slide-caption">
                            <h3>{t("home.slider.benthanh_title")}</h3>
                            <p>{t("home.slider.benthanh_desc")}</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_3.png" alt={t("home.slider.hungking_title")} />
                          <div className="slide-caption">
                            <h3>{t("home.slider.hungking_title")}</h3>
                            <p>{t("home.slider.hungking_desc")}</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_4.jpg" alt={t("home.slider.notredame_title")} />
                          <div className="slide-caption">
                            <h3>{t("home.slider.notredame_title")}</h3>
                            <p>{t("home.slider.notredame_desc")}</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_5.jpg" alt={t("home.slider.museum_title")} />
                          <div className="slide-caption">
                            <h3>{t("home.slider.museum_title")}</h3>
                            <p>{t("home.slider.museum_desc")}</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_6.jpg" alt={t("home.slider.independence_title")} />
                          <div className="slide-caption">
                            <h3>{t("home.slider.independence_title")}</h3>
                            <p>{t("home.slider.independence_desc")}</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_7.png" alt={t("home.slider.starlight_title")} />
                          <div className="slide-caption">
                            <h3>{t("home.slider.starlight_title")}</h3>
                            <p>{t("home.slider.starlight_desc")}</p>
                          </div>
                        </div>


                        <div className="slide-item">
                          <img src="/images/trang_chu_8.jpg" alt={t("home.slider.postoffice_title")} />
                          <div className="slide-caption">
                            <h3>{t("home.slider.postoffice_title")}</h3>
                            <p>{t("home.slider.postoffice_desc")}</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_9.jpg" alt={t("home.slider.tandinh_title")} />
                          <div className="slide-caption">
                            <h3>{t("home.slider.tandinh_title")}</h3>
                            <p>{t("home.slider.tandinh_desc")}</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_10.jpg" alt={t("home.slider.suoitien_title")} />
                          <div className="slide-caption">
                            <h3>{t("home.slider.suoitien_title")}</h3>
                            <p>{t("home.slider.suoitien_desc")}</p>
                          </div>
                        </div>

                        <div className="slide-item">
                          <img src="/images/trang_chu_11.jpg" alt={t("home.slider.anhsao_title")} />
                          <div className="slide-caption">
                            <h3>{t("home.slider.anhsao_title")}</h3>
                            <p>{t("home.slider.anhsao_desc")}</p>
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
                      <span className="badge-text" dangerouslySetInnerHTML={{ __html: t("home.about.exp_badge") }}></span>
                    </div>
                  </div>
                </div>

                <div className="about-content">
                  <h4 className="sub-title fade-up delay-100">{t("home.about.greeting")}</h4>

                  <h2 className="main-title">
                    <span className="split-text fade-up delay-200">{t("home.about.title_1")}</span> <br />
                    <span className="split-text fade-up delay-300">{t("home.about.title_2")}</span>
                  </h2>

                  <p className="desc-text fade-up delay-400" dangerouslySetInnerHTML={{ __html: t("home.about.desc_1") }}></p>

                  <p className="desc-text fade-up delay-500">
                    {t("home.about.desc_2")}
                  </p>

                  <div className="btn-wrapper fade-up delay-600">
                    <a href="#" className="btn-primary">{t("home.about.btn_more")} <i className="fas fa-arrow-right"></i></a>
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
                  <h4 className="sub-title fade-up">{t("home.geo.subtitle")}</h4>

                  <h2 className="main-title">
                    <span className="split-text fade-up delay-100">{t("home.geo.title_1")}</span> <br />
                    <span className="split-text fade-up delay-200">{t("home.geo.title_2")}</span>
                  </h2>

                  <p className="desc-text fade-up delay-300">
                    {t("home.geo.desc_1")}
                  </p>

                  <p className="desc-text fade-up delay-400">
                    {t("home.geo.desc_2")}
                  </p>

                  <div className="fade-up delay-500">
                    <Link to="/dia-ly" className="btn-primary btn-outline">{t("home.geo.btn_explore")} <i className="fas fa-arrow-right"></i></Link>
                  </div>
                </div>

                <div className="geo-grid">
                  <Link to="/vi-tri" className="geo-card fade-up delay-600">
                    <img src="/images/dia_ly_1.jfif" alt="Vị trí địa lí" />
                    <div className="geo-tag">
                      <i className="fas fa-map-marked-alt"></i>
                      <span>{t("home.geo.tag_location")}</span>
                    </div>
                  </Link>

                  <Link to="/tu-nhien" className="geo-card fade-up delay-700">
                    <img src="/images/dia_ly_2.svg" alt="Đặc điểm tự nhiên" />
                    <div className="geo-tag">
                      <i className="fas fa-tree"></i>
                      <span>{t("home.geo.tag_nature")}</span>
                    </div>
                  </Link>

                  <Link to="/kinh-te" className="geo-card fade-up delay-800">
                    <img src="/images/dia_ly_3.jpg" alt="Kinh tế phát triển" />
                    <div className="geo-tag">
                      <i className="fas fa-chart-line"></i>
                      <span>{t("home.geo.tag_economy")}</span>
                    </div>
                  </Link>

                  <Link to="/dan-cu" className="geo-card fade-up delay-900">
                    <img src="/images/dia_ly_4.jpg" alt="Dân cư" />
                    <div className="geo-tag">
                      <i className="fas fa-users"></i>
                      <span>{t("home.geo.tag_population")}</span>
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
                  {t("home.history.subtitle")}
                </h4>
                <h2 className="main-title text-white fade-up delay-200">{t("home.history.title")}</h2>
                <p className="desc-text text-white-50 fade-up delay-400">
                  {t("home.history.desc")}
                </p>
              </div>

              <div className="history-grid">
                <div className="history-card fade-up delay-800">
                  <Link to="/di-tich" className="history-link">
                    <img src="/images/lich_su_2.jpg" alt="Di tích lịch sử" />
                    <div className="history-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: t("home.history.relic_title") }}></h3>
                      <p>{t("home.history.relic_desc")}</p>
                      <span className="btn-link">{t("home.history.btn_detail")} <i className="fas fa-arrow-right"></i></span>
                    </div>
                  </Link>
                </div>

                <div className="history-card reveal fade-up delay-1000">
                  <Link to="/nhan-vat" className="history-link">
                    <img src="/images/lich_su_3.jpg" alt="Nhân vật lịch sử" />
                    <div className="history-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: t("home.history.figure_title") }}></h3>
                      <p>{t("home.history.figure_desc")}</p>
                      <span className="btn-link">{t("home.history.btn_detail")} <i className="fas fa-arrow-right"></i></span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="history-footer fade-up delay-1200">
                <Link to="/lich-su" className="btn-primary btn-history">{t("home.history.btn_more")} <i className="fas fa-arrow-right"></i></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="culture-area">
          <div className="section-wrapper reveal fade-up">
            <div className="container">
              <div className="culture-wrapper">
                <div className="culture-content">
                  <h4 className="sub-title fade-up">{t("home.culture.subtitle")}</h4>
                  <h2 className="main-title fade-up delay-200">{t("home.culture.title")}</h2>
                  <p className="desc-text fade-up delay-400">
                    {t("home.culture.desc_1")}
                  </p>
                  <p className="desc-text fade-up delay-600">
                    {t("home.culture.desc_2")}
                  </p>
                  <div className="fade-up delay-700">
                    <Link to="/van-hoa" className="btn-primary">{t("home.culture.btn_explore")} <i className="fas fa-arrow-right"></i></Link>
                  </div>
                </div>

                <div className="culture-grid">
                  <div className="culture-item fade-up delay-1000">
                    <Link to="/am-thuc" className="culture-link">
                      <img src="/images/vanhoa_xahoi_1.jpg" alt="Ẩm thực Sài Gòn" />
                      <div className="culture-tag">🍜 {t("home.culture.tag_food")}</div>
                    </Link>
                  </div>

                  <div className="culture-item fade-up delay-1200">
                    <Link to="/le-hoi" className="culture-link">
                      <img src="/images/vanhoa_xahoi_3.svg" alt="Lễ hội truyền thống" />
                      <div className="culture-tag">🎉 {t("home.culture.tag_festival")}</div>
                    </Link>
                  </div>

                  <div className="culture-item fade-up delay-1400">
                    <Link to="/lang-nghe" className="culture-link">
                      <img src="/images/vanhoa_xahoi_4.svg" alt="Làng nghề truyền thống" />
                      <div className="culture-tag">🎨 {t("home.culture.tag_craft")}</div>
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
                <h4 className="sub-title fade-up">{t("home.learning.subtitle")}</h4>
                <h2 className="main-title fade-up delay-200">{t("home.learning.title")}</h2>
                <p className="desc-text fade-up delay-400">
                  {t("home.learning.desc")}
                </p>
              </div>

              <div className="learning-grid">
                <div className="learning-card fade-up delay-600">
                  <img src="/images/tailieu_hoctap_1.jpg" className="card-bg-img" alt="Thư viện tài liệu" />
                  <div className="overlay-dark"></div>
                  <div className="card-content">
                    <div className="icon-small"><i className="fas fa-book-reader"></i></div>
                    <h3>{t("home.learning.doc_title")}</h3>
                    <p>{t("home.learning.doc_desc")}</p>
                    <Link to="/tai-lieu" className="btn-outline-white">{t("home.learning.btn_view")} <i className="fas fa-arrow-right"></i></Link>
                  </div>
                </div>

                <div className="learning-card fade-up delay-800">
                  <img src="/images/tailieu_hoctap_2.jpg" className="card-bg-img" alt="Trò chơi dân gian" />
                  <div className="overlay-dark"></div>
                  <div className="card-content">
                    <div className="icon-small"><i className="fas fa-gamepad"></i></div>
                    <h3>{t("home.learning.game_title")}</h3>
                    <p>{t("home.learning.game_desc")}</p>
                    <Link to="/bai-tap" className="btn-outline-white">{t("home.learning.btn_play")} <i className="fas fa-arrow-right"></i></Link>
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
