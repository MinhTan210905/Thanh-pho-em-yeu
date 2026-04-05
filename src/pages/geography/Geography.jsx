import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Geography.css';

export default function Geography() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Only show animation on initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const heroImages = [
    {
      id: 1,
      image: "/images/dia_ly_1.jfif",
      title: "Vị trí địa lí",
      description: "Khám phá vị trí chiến lược của Thành\u00A0phố\u00A0Hồ\u00A0Chí\u00A0Minh",
      route: "/vi-tri"
    },
    {
      id: 2,
      image: "/images/dia_ly_3.jpg",
      title: "Địa lí kinh tế",
      description: "Khám phá các ngành kinh tế chủ lực của thành phố",
      route: "/kinh-te"
    },
    {
      id: 3,
      image: "/images/dia_ly_2.svg",
      title: "Địa lí tự nhiên",
      description: "Tìm hiểu về địa hình, khí hậu, hệ thống sông ngòi, kênh rạch, biển, sinh vật, đất và khoáng sản",
      route: "/tu-nhien"
    },
    {
      id: 4,
      image: "/images/dia_ly_4.jpg",
      title: "Địa lí dân cư",
      description: "Tìm hiểu phân bố dân cư và đặc điểm đô thị của Thành phố Hồ Chí Minh",
      route: "/dan-cu"
    }
  ];

  useEffect(() => {
    const duration = 6000;
    let rafId = null;
    let startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const ratio = Math.min(elapsed / duration, 1);
      setProgress(Math.round(ratio * 1000) / 10);

      if (ratio >= 1) {
        setProgress(0);
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [currentImageIndex, heroImages.length]);

  const handleDotClick = (index) => {
    setProgress(0);
    setCurrentImageIndex(index);
  };

  useEffect(() => {
    // === REVEAL ANIMATIONS (Delayed to ensure initial hidden state) ===
    console.log('Setting up reveal animations...');

    // Delay to let elements render in hidden state
    const setupTimer = setTimeout(() => {
      const revealElements = document.querySelectorAll('.reveal');
      console.log('Found reveal elements:', revealElements.length);

      if (revealElements.length === 0) {
        console.warn('No reveal elements found!');
        return;
      }

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('Adding active class to:', entry.target.className.substring(0, 50));
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
          }
        });
      },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );

      revealElements.forEach((el) => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }, 300); // Wait 300ms for initial render

    return () => clearTimeout(setupTimer);
  }, []);

  const currentHero = heroImages[currentImageIndex];
  const currentRoute = currentHero.route;

  return (
    <>
      <div className="geography-hero">
        <div className="geography-hero-bg" aria-hidden="true">
          {heroImages.map((item, index) => (
            <div
              key={item.id}
              className={`geography-hero-slide ${index === currentImageIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${item.image})` }}
            ></div>
          ))}
        </div>
        <div className="geography-hero-overlay" aria-hidden="true"></div>

        {currentRoute && (
          <button
            type="button"
            className="geography-hero-clickzone"
            aria-label="Mở chi tiết nội dung địa lí"
            onClick={() => navigate(currentRoute)}
          ></button>
        )}

        <section
          className={`geography-hero-content ${isInitialLoad ? "initial-animation" : ""} ${currentRoute ? "clickable" : ""}`}
          onClick={() => currentRoute && navigate(currentRoute)}
        >
          <h1>{currentHero.title}</h1>
          <p>{currentHero.description}</p>
          {currentRoute ? (
            <Link to={currentRoute} className="geography-read-more">
              Đọc thêm
              <span className="geography-read-more-icon" aria-hidden="true">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>
          ) : (
            <button className="geography-read-more">
              Đọc thêm
              <span className="geography-read-more-icon" aria-hidden="true">
                <i className="fas fa-arrow-right"></i>
              </span>
            </button>
          )}
        </section>

        <div className="geography-dots">
          {heroImages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Chuyển ảnh ${index + 1}`}
              className={`dot ${index === currentImageIndex ? "active" : ""}`}
              style={
                index === currentImageIndex
                  ? { "--progress": `${progress}%` }
                  : undefined
              }
              onClick={() => handleDotClick(index)}
            >
              <span className="dot-center"></span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
