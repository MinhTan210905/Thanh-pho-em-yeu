import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import './Culture.css';

export default function Culture() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      image: "/images/vanhoa_xahoi_1.jpg",
      title: t("culture_page.overview.item1_title"),
      description: t("culture_page.overview.item1_desc")
    },
    {
      id: 2,
      image: "/images/vanhoa_xahoi_4.svg",
      title: t("culture_page.overview.item2_title"),
      description: t("culture_page.overview.item2_desc")
    },
    {
      id: 3,
      image: "/images/vanhoa_xahoi_3.svg",
      title: t("culture_page.overview.item3_title"),
      description: t("culture_page.overview.item3_desc")
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
  const isLangNgheSlide = currentHero.id === 2;
  const isAmThucSlide = currentHero.id === 1;
  const isLeHoiSlide = currentHero.id === 3;

  return (
    <>
      <div className="culture-hero">
        <div className="culture-hero-bg" aria-hidden="true">
          {heroImages.map((item, index) => (
            <div
              key={item.id}
              className={`culture-hero-slide ${index === currentImageIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${item.image})` }}
            ></div>
          ))}
        </div>
        <div className="culture-hero-overlay" aria-hidden="true"></div>

        {isLangNgheSlide && (
          <button
            type="button"
            className="culture-hero-clickzone"
            aria-label={t("culture_page.overview.aria_craft")}
            onClick={() => navigate('/lang-nghe')}
          ></button>
        )}

        {isAmThucSlide && (
          <button
            type="button"
            className="culture-hero-clickzone"
            aria-label={t("culture_page.overview.aria_food")}
            onClick={() => navigate('/am-thuc')}
          ></button>
        )}

        {isLeHoiSlide && (
          <button
            type="button"
            className="culture-hero-clickzone"
            aria-label={t("culture_page.overview.aria_festival")}
            onClick={() => navigate('/le-hoi')}
          ></button>
        )}

        <section
          className={`culture-hero-content ${isInitialLoad ? "initial-animation" : ""} ${(isLangNgheSlide || isAmThucSlide || isLeHoiSlide) ? "clickable" : ""}`}
          onClick={isLangNgheSlide ? () => navigate('/lang-nghe') : isAmThucSlide ? () => navigate('/am-thuc') : isLeHoiSlide ? () => navigate('/le-hoi') : undefined}
        >
          <h1>{currentHero.title}</h1>
          <p>{currentHero.description}</p>
           {isLangNgheSlide ? (
            <Link to="/lang-nghe" className="culture-read-more">
              {t("culture_page.btn_read_more")}
              <span className="culture-read-more-icon" aria-hidden="true">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>
          ) : isAmThucSlide ? (
            <Link to="/am-thuc" className="culture-read-more">
              {t("culture_page.btn_read_more")}
              <span className="culture-read-more-icon" aria-hidden="true">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>
          ) : isLeHoiSlide ? (
            <Link to="/le-hoi" className="culture-read-more">
              {t("culture_page.btn_read_more")}
              <span className="culture-read-more-icon" aria-hidden="true">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>
          ) : (
            <button className="culture-read-more">
              {t("culture_page.btn_read_more")}
              <span className="culture-read-more-icon" aria-hidden="true">
                <i className="fas fa-arrow-right"></i>
              </span>
            </button>
          )}
        </section>

        <div className="culture-dots">
          {heroImages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={t("culture_page.overview.aria_dot", { count: index + 1 })}
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
