import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

export default function Header({ currentPage }) {
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLang') || "VIE";
    }
    return "VIE";
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // === STICKY HEADER ===
    const header = document.getElementById('mainHeader');
    const handleScroll = () => {
      if (window.scrollY > 0) {
        header?.classList.add('sticky');
      } else {
        header?.classList.remove('sticky');
      }
    };
    window.addEventListener('scroll', handleScroll);

    // === MOBILE MENU ===
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('closeBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    const openMenu = () => mobileMenu?.classList.add('active');
    const closeMenu = () => mobileMenu?.classList.remove('active');
    const clickOutside = (e) => {
      if (e.target === mobileMenu) closeMenu();
    };

    hamburgerBtn?.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    mobileMenu?.addEventListener('click', clickOutside);

    // === CLOSE DROPDOWN WHEN CLICK OUTSIDE ===
    const handleClickOutside = (e) => {
      const langContainer = document.querySelector('.lang-container');
      if (langContainer && !langContainer.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      hamburgerBtn?.removeEventListener('click', openMenu);
      closeBtn?.removeEventListener('click', closeMenu);
      mobileMenu?.removeEventListener('click', clickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const changeLang = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('selectedLang', lang);
    setIsDropdownOpen(false);

    // Hiện loading screen với spinner hình tròn xoay
    const loadingScreen = document.getElementById('translate-loading');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';

      // Dùng 1 kiểu spinner cố định cho mượt
      const spinner = document.getElementById('spinner');
      if (spinner) {
        spinner.innerHTML = '<div class="spinner-circle1"></div>';
      }

      // Trigger Google Translate
      if (lang === 'ENG') {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = 'en';
          select.dispatchEvent(new Event('change'));
        }
      } else if (lang === 'VIE') {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = 'vi';
          select.dispatchEvent(new Event('change'));
        }
      }

      // Reload trang sau 2 giây
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <>
      <header id="mainHeader">
        <div className="menu-toggle" id="hamburgerBtn">
          <i className="fas fa-grip-lines"></i>
        </div>

        <div className="logo-wrapper">
          <a href="#">
            <img src="/images/logo_truong.png" alt="Logo" className="logo-img" />
          </a>
        </div>

        <nav className="desktop-nav">
          <ul>
            <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>Trang chủ</Link></li>
            <li><Link to="/dia-ly" className={location.pathname === "/dia-ly" || location.pathname === "/vi-tri" || location.pathname === "/kinh-te" || location.pathname === "/tu-nhien" || location.pathname === "/dan-cu" ? "active" : ""}>Địa lý</Link></li>
            <li><Link to="/lich-su" className={location.pathname === "/lich-su" || location.pathname === "/di-tich" || location.pathname === "/nhan-vat" ? "active" : ""}>Lịch sử</Link></li>
            <li><Link to="/van-hoa" className={location.pathname === "/van-hoa" || location.pathname === "/lang-nghe" || location.pathname === "/am-thuc" || location.pathname === "/le-hoi" ? "active" : ""}>Văn hóa</Link></li>
            <li><Link to="/hoc-tap" className={[
              "/hoc-tap", "/bai-tap", "/tai-lieu", 
              "/tro-choi-am-thuc", "/tro-choi-di-tich-lich-su", 
              "/tro-choi-dia-li-tu-nhien", "/tro-choi-dan-cu", 
              "/tro-choi-lang-nghe", "/tro-choi-le-hoi", 
              "/tro-choi-nhan-vat-lich-su", "/tro-choi-kinh-te", 
              "/tro-choi-vi-tri"
            ].includes(location.pathname) ? "active" : ""}>Góc học tập</Link></li>
          </ul>
        </nav>

        <div className="search-wrapper">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Tìm kiếm..." />
          </div>
        </div>

        <div className="mobile-search-icon">
          <i className="fas fa-search"></i>
        </div>
      </header>

      <div className="mobile-menu-overlay" id="mobileMenu">
        <div className="mobile-menu-header">
          <div className="menu-logo"><img src="/images/logo_truong.png" alt="Logo" /></div>
          <div className="close-btn" id="closeBtn"><i className="fas fa-times"></i></div>
        </div>
        <ul className="mobile-nav-links">
          <li><Link to="/">Trang chủ</Link></li>
          <li><a href="#">Giới thiệu</a></li>
          <li><Link to="/dia-ly">Địa lý</Link></li>
          <li><Link to="/lich-su">Lịch sử</Link></li>
          <li><Link to="/van-hoa">Văn hóa</Link></li>
          <li><Link to="/hoc-tap">Góc học tập</Link></li>
          <li><a href="#">Tài liệu tham khảo</a></li>
        </ul>
        <div className="mobile-socials">
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fab fa-youtube"></i></a>
          <a href="#"><i className="fab fa-tiktok"></i></a>
        </div>
      </div>

      <div className="top-bar">
        <div className="social-icons">
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fab fa-youtube"></i></a>
          <a href="#"><i className="fab fa-tiktok"></i></a>
        </div>

        <div className="lang-container notranslate">
          <div className="current-lang notranslate" id="currentLang" onClick={toggleDropdown}>
            <img
              src={currentLang === "VIE"
                ? "https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                : "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"}
              className="flag-img"
              alt={currentLang}
            />
            {currentLang}
            <i className="fas fa-chevron-down" style={{ fontSize: "0.7rem", marginLeft: "5px" }}></i>
          </div>
          <div className={`lang-dropdown notranslate ${isDropdownOpen ? 'show' : ''}`}>
            <div className="lang-option notranslate" onClick={() => changeLang('VIE')}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg" alt="VN" />
              Tiếng Việt
            </div>
            <div className="lang-option notranslate" onClick={() => changeLang('ENG')}>
              <img src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" alt="US" />
              English
            </div>
          </div>
        </div>
      </div>
    </>
  );
}