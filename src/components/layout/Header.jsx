import { useEffect, useRef, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth, ROLE_LABELS } from "../../context/AuthContext";

// Dữ liệu submenu cho từng mục
const NAV_ITEMS = [
  { id: "trang-chu", label: "Trang chủ", to: "/", subPages: [] },
  {
    id: "dia-ly",
    label: "Địa lí",
    to: "/dia-ly",
    activeRoutes: ["/dia-ly", "/vi-tri", "/kinh-te", "/tu-nhien", "/dan-cu"],
    subPages: [
      { label: "Vị trí", to: "/vi-tri" },
      { label: "Kinh tế", to: "/kinh-te" },
      { label: "Tự nhiên", to: "/tu-nhien" },
      { label: "Dân cư", to: "/dan-cu" },
    ],
  },
  {
    id: "lich-su",
    label: "Lịch sử",
    to: "/lich-su",
    activeRoutes: ["/lich-su", "/di-tich", "/nhan-vat"],
    subPages: [
      { label: "Di tích lịch sử", to: "/di-tich" },
      { label: "Nhân vật lịch sử", to: "/nhan-vat" },
    ],
  },
  {
    id: "van-hoa",
    label: "Văn hóa",
    to: "/van-hoa",
    activeRoutes: ["/van-hoa", "/lang-nghe", "/am-thuc", "/le-hoi"],
    subPages: [
      { label: "Ẩm thực", to: "/am-thuc" },
      { label: "Làng nghề", to: "/lang-nghe" },
      { label: "Lễ hội", to: "/le-hoi" },
    ],
  },
  {
    id: "hoc-tap",
    label: "Góc học tập",
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
      { label: "Tài liệu học tập", to: "/tai-lieu" },
      { label: "Trò chơi ôn tập", to: "/bai-tap" },
    ],
  },
];

export default function Header({ currentPage }) {
  const { isAuthenticated, user, logout } = useAuth();
  const canOpenManagement = user?.role === 'admin' || user?.role === 'school' || user?.role === 'teacher';
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLang') || "VIE";
    }
    return "VIE";
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

  const changeLang = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('selectedLang', lang);
    setIsDropdownOpen(false);

    const loadingScreen = document.getElementById('translate-loading');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';

      const spinner = document.getElementById('spinner');
      if (spinner) {
        spinner.innerHTML = '<div class="spinner-circle1"></div>';
      }

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

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
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
                  {item.label}
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
                            {sub.label}
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
          <li><Link to="/" onClick={() => { goTop(); closeMobileMenu(); }}>Trang chủ</Link></li>
          <li><Link to="/dia-ly" onClick={closeMobileMenu}>Địa lí</Link></li>
          <li><Link to="/lich-su" onClick={closeMobileMenu}>Lịch sử</Link></li>
          <li><Link to="/van-hoa" onClick={closeMobileMenu}>Văn hóa</Link></li>
          <li><Link to="/hoc-tap" onClick={closeMobileMenu}>Góc học tập</Link></li>
          {isAuthenticated ? (
            <>
              {canOpenManagement ? <li><Link to="/quan-ly" onClick={closeMobileMenu}>Trang quản lí</Link></li> : null}
              <li><button type="button" className="mobile-logout-btn" onClick={handleLogout}>Đăng xuất</button></li>
            </>
          ) : (
            <li><Link to="/dang-nhap" onClick={closeMobileMenu}>Đăng nhập</Link></li>
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
                  {user?.role ? ` (${ROLE_LABELS[user.role] || user.role})` : ''}
                </span>
                {canOpenManagement ? <Link to="/quan-ly" className="auth-quick-link">Quản lí</Link> : null}
                <button type="button" className="auth-quick-link auth-quick-logout" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/dang-nhap" className="auth-quick-link">Đăng nhập</Link>
            )}
          </div>

          <span className="top-bar-divider" aria-hidden="true">|</span>

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
      </div>
    </>
  );
}