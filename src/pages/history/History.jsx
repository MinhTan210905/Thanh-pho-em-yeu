import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './History.css';

export default function History() {
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
      image: "/images/lich_su_2.jpg",
      title: "Di tích Lịch sử",
      description: "Những công trình kiến trúc ghi dấu ấn thời gian"
    },
    {
      id: 2,
      image: "/images/lich_su_3.jpg",
      title: "Nhân vật Lịch sử",
      description: "Những người con ưu tú đã làm rạng danh vùng đất này"
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
  const currentRoute = currentImageIndex === 0 ? "/di-tich" : "/nhan-vat";

  return (
    <>
      <div className="history-hero">
        <div className="history-hero-bg" aria-hidden="true">
          {heroImages.map((item, index) => (
            <div
              key={item.id}
              className={`history-hero-slide ${index === currentImageIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${item.image})` }}
            ></div>
          ))}
        </div>
        <div className="history-hero-overlay" aria-hidden="true"></div>

        <button
          type="button"
          className="history-hero-clickzone"
          aria-label="Mở chi tiết nội dung lịch sử"
          onClick={() => navigate(currentRoute)}
        ></button>

        <section
          className={`history-hero-content ${isInitialLoad ? "initial-animation" : ""} clickable`}
          onClick={() => navigate(currentRoute)}
        >
          <h1>{currentHero.title}</h1>
          <p>{currentHero.description}</p>
          <Link to={currentRoute} className="history-read-more">
            Đọc thêm
            <span className="history-read-more-icon" aria-hidden="true">
              <i className="fas fa-arrow-right"></i>
            </span>
          </Link>
        </section>

        <div className="history-dots">
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
