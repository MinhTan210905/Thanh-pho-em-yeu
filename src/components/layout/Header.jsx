import { useEffect, useRef, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from 'react-i18next';

// Dữ liệu submenu cho từng mục (Sử dụng key cho đa ngôn ngữ)
/** Role labels are now handled via i18n in components */
const NAV_ITEMS = [
  { id: "trang-chu", labelKey: "header.home", to: "/", subPages: [] },
  {
    id: "dia-ly",
    labelKey: "header.geography",
    to: "/dia-ly",
    activeRoutes: ["/dia-ly", "/vi-tri", "/kinh-te", "/tu-nhien", "/dan-cu"],
    subPages: [
      { labelKey: "header.sub_geo_location", to: "/vi-tri" },
      { labelKey: "header.sub_geo_economy", to: "/kinh-te" },
      { labelKey: "header.sub_geo_nature", to: "/tu-nhien" },
      { labelKey: "header.sub_geo_population", to: "/dan-cu" },
    ],
  },
  {
    id: "lich-su",
    labelKey: "header.history",
    to: "/lich-su",
    activeRoutes: ["/lich-su", "/di-tich", "/nhan-vat"],
    subPages: [
      { labelKey: "header.sub_his_relics", to: "/di-tich" },
      { labelKey: "header.sub_his_figures", to: "/nhan-vat" },
    ],
  },
  {
    id: "van-hoa",
    labelKey: "header.culture",
    to: "/van-hoa",
    activeRoutes: ["/van-hoa", "/lang-nghe", "/am-thuc", "/le-hoi"],
    subPages: [
      { labelKey: "header.sub_cul_food", to: "/am-thuc" },
      { labelKey: "header.sub_cul_crafts", to: "/lang-nghe" },
      { labelKey: "header.sub_cul_festivals", to: "/le-hoi" },
    ],
  },
  {
    id: "hoc-tap",
    labelKey: "header.learning",
    to: "/hoc-tap",
    activeRoutes: [
      "/hoc-tap", "/bai-tap", "/tai-lieu",
      "/tro-choi-am-thuc", "/tro-choi-di-tich-lich-su",
      "/tro-choi-dia-li-tu-nhien", "/tro-choi-dan-cu",
      "/tro-choi-lang-nghe", "/tro-choi-le-hoi",
      "/tro-choi-nhan-vat-lich-su", "/tro-choi-kinh-te",
      "/tro-choi-vi-tri",
    ],
    subPages: [
      { labelKey: "header.sub_learn_documents", to: "/tai-lieu" },
      { labelKey: "header.sub_learn_games", to: "/bai-tap" },
    ],
  },
];

function safeGetSelectedLang() {
  try {
    return localStorage.getItem('selectedLang');
  } catch {
    return null;
  }
}

function safeSetSelectedLang(lang) {
  try {
    localStorage.setItem('selectedLang', lang);
  } catch {
    // Ignore storage write failure in strict privacy contexts.
  }
}

export default function Header({ currentPage }) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const canOpenManagement = user?.role === 'admin' || user?.role === 'school' || user?.role === 'teacher';
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState(() => {
    const saved = safeGetSelectedLang();
    return saved === 'en' ? 'ENG' : 'VIE';
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  // === NAV DROPDOWN STATE ===
  // openNav: id của nav item đang mở dropdown (null = không mở cái nào)
  const [openNav, setOpenNav] = useState(null);
  // anyOpen: true khi đang có ít nhất 1 dropdown hiện - dùng để bỏ delay
  const hoverTimerRef = useRef(null);
  const isAnyOpenRef = useRef(false);

  const closeMobileMenu = () => {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu?.classList.remove('active');
  };

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleLogout = () => {
    logout();
    goTop();
    closeMobileMenu();
    navigate("/", { replace: true });
  };

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

  // Sync ref khi openNav thay đổi
  useEffect(() => {
    isAnyOpenRef.current = openNav !== null;
  }, [openNav]);

  const handleNavMouseEnter = (itemId) => {
    // Xóa timer cũ nếu có
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    if (isAnyOpenRef.current) {
      // Đã có dropdown đang mở → hiện ngay
      setOpenNav(itemId);
    } else {
      // Chưa có dropdown → đợi 700ms
      hoverTimerRef.current = setTimeout(() => {
        setOpenNav(itemId);
        hoverTimerRef.current = null;
      }, 700);
    }
  };

  const handleNavMouseLeave = () => {
    // Xóa timer nếu chưa kịp mở
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setOpenNav(null);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const changeLang = (langCode) => {
    // 'VIE' = 'vi', 'ENG' = 'en'
    const newLang = langCode === 'ENG' ? 'en' : 'vi';
    
    // Tức thời đổi text trên giao diện thông qua react-i18next
    i18n.changeLanguage(newLang);
    
    // Lưu lại cấu hình
    setCurrentLang(langCode);
    safeSetSelectedLang(newLang);
    setIsDropdownOpen(false);
  };

  const isNavActive = (item) => {
    if (item.id === 'trang-chu') return location.pathname === '/';
    return item.activeRoutes?.includes(location.pathname);
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

        {/* Desktop Nav with hover dropdowns */}
        <nav className="desktop-nav" onMouseLeave={handleNavMouseLeave}>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li
                key={item.id}
                className={`nav-item-wrap ${openNav === item.id ? 'nav-open' : ''}`}
                onMouseEnter={() => handleNavMouseEnter(item.id)}
              >
                <Link
                  to={item.to}
                  onClick={item.id === 'trang-chu' ? goTop : undefined}
                  className={isNavActive(item) ? "active" : ""}
                >
                  {t(item.labelKey)}
                </Link>

                {/* Submenu dropdown */}
                {item.subPages.length > 0 && (
                  <div className={`nav-submenu ${openNav === item.id ? 'nav-submenu--open' : ''}`}>
                    <ul>
                      {item.subPages.map((sub) => (
                        <li key={sub.to}>
                          <Link
                            to={sub.to}
                            className={location.pathname === sub.to ? 'sub-active' : ''}
                            onClick={() => setOpenNav(null)}
                          >
                            {t(sub.labelKey)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="search-wrapper">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder={t("header.search")} />
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
          <li><Link to="/" onClick={() => { goTop(); closeMobileMenu(); }}>{t("header.home")}</Link></li>
          <li><Link to="/dia-ly" onClick={closeMobileMenu}>{t("header.geography")}</Link></li>
          <li><Link to="/lich-su" onClick={closeMobileMenu}>{t("header.history")}</Link></li>
          <li><Link to="/van-hoa" onClick={closeMobileMenu}>{t("header.culture")}</Link></li>
          <li><Link to="/hoc-tap" onClick={closeMobileMenu}>{t("header.learning")}</Link></li>
          {isAuthenticated ? (
            <>
              {canOpenManagement ? <li><Link to="/quan-ly" onClick={closeMobileMenu}>{t("header.management")}</Link></li> : null}
              <li><button type="button" className="mobile-logout-btn" onClick={handleLogout}>{t("header.logout")}</button></li>
            </>
          ) : (
            <li><Link to="/dang-nhap" onClick={closeMobileMenu}>{t("header.login")}</Link></li>
          )}
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

        <div className="top-bar-right">
          <div className="auth-quick-links">
            {isAuthenticated ? (
              <>
                <span className="auth-user-name">
                  {user?.full_name || user?.username}
                  {user?.role ? ` (${t(`common.roles.${user.role}`)})` : ''}
                </span>
                {canOpenManagement ? <Link to="/quan-ly" className="auth-quick-link">{t("header.management")}</Link> : null}
                <button type="button" className="auth-quick-link auth-quick-logout" onClick={handleLogout}>
                  {t("header.logout")}
                </button>
              </>
            ) : (
              <Link to="/dang-nhap" className="auth-quick-link">{t("header.login")}</Link>
            )}
          </div>

          <span className="top-bar-divider" aria-hidden="true">|</span>

          <div className="lang-container notranslate">
            <div className="current-lang notranslate" id="currentLang" onClick={toggleDropdown}>
              <img
                src={currentLang === "VIE"
                  ? "https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                  : "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg"}
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
                <img src="https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg" alt="UK" />
                English
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
