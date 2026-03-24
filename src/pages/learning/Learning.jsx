import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Learning.css";

export default function Learning() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHeroContentVisible, setIsHeroContentVisible] = useState(false);

  const heroImages = [
    {
      id: 1,
      image: "/images/tailieu_hoctap_1.jpg",
      title: "Tài liệu Học tập",
      description: "Hệ thống bài giảng, tài liệu tham khảo giúp bạn tìm hiểu sâu về TP.HCM",
      route: "/tai-lieu",
    },
    {
      id: 2,
      image: "/images/tailieu_hoctap_2.jpg",
      title: "Trò chơi Ôn tập",
      description: "Ôn luyện kiến thức qua các trò chơi tương tác thú vị và bài tập trắc nghiệm",
      route: "/bai-tap",
    },
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
    setIsHeroContentVisible(false);
    const rafId = requestAnimationFrame(() => {
      setIsHeroContentVisible(true);
    });

    return () => cancelAnimationFrame(rafId);
  }, [currentImageIndex]);

  const currentHero = heroImages[currentImageIndex];

  return (
    <>
      <div className="learning-hero">
        <div className="learning-hero-bg" aria-hidden="true">
          {heroImages.map((item, index) => (
            <div
              key={item.id}
              className={`learning-hero-slide ${index === currentImageIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${item.image})` }}
            ></div>
          ))}
        </div>
        <div className="learning-hero-overlay" aria-hidden="true"></div>

        <button
          type="button"
          className="learning-hero-clickzone"
          aria-label={`Mở trang ${currentHero.title}`}
          onClick={() => navigate(currentHero.route)}
        ></button>

        <section
          className={`learning-hero-content clickable ${isHeroContentVisible ? "is-visible" : ""}`}
          onClick={() => navigate(currentHero.route)}
        >
          <h1>{currentHero.title}</h1>
          <p>{currentHero.description}</p>
          <Link to={currentHero.route} className="learning-read-more">
            Đọc thêm
            <span className="learning-read-more-icon" aria-hidden="true">
              <i className="fas fa-arrow-right"></i>
            </span>
          </Link>
        </section>

        <div className="learning-dots">
          {heroImages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Chuyển ảnh ${index + 1}`}
              className={`dot ${index === currentImageIndex ? "active" : ""}`}
              style={index === currentImageIndex ? { "--progress": `${progress}%` } : undefined}
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
