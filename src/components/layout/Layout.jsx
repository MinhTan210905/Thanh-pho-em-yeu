import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";

const SCROLL_KEY = "khampha_scroll_pos";
const PATH_KEY = "khampha_scroll_path";

const Layout = () => {
  const location = useLocation();
  const lastGoodScrollY = useRef(0);
  const isRescuing = useRef(false);
  const rescueTimer = useRef(null);

  // 1. Quản lý Route Change (Lưu & khôi phục khi chuyển trang)
  useEffect(() => {
    const savedPath = sessionStorage.getItem(PATH_KEY);
    const savedScroll = sessionStorage.getItem(SCROLL_KEY);

    if (savedPath === location.pathname && savedScroll) {
      window.scrollTo(0, parseInt(savedScroll, 10));
      lastGoodScrollY.current = parseInt(savedScroll, 10);
    } else {
      window.scrollTo(0, 0);
      sessionStorage.setItem(PATH_KEY, location.pathname);
      sessionStorage.setItem(SCROLL_KEY, "0");
      lastGoodScrollY.current = 0;
    }
  }, [location.pathname]);

  // 2. Đặc trị Canva Fullscreen
  useEffect(() => {
    // Hàm ngắt "cứu hộ" ngay lập tức nếu người dùng tự cuộn tay
    const abortRescue = () => {
      isRescuing.current = false;
      if (rescueTimer.current) clearInterval(rescueTimer.current);
    };

    const handleScroll = () => {
      if (isRescuing.current) return; // Không lưu tọa độ lúc code đang chiến đấu với trình duyệt

      // MẤU CHỐT 1: Chống lưu nhầm tọa độ 0
      // Nếu đang focus vào iframe Canva, KHÔNG lưu tọa độ cuộn (vì lúc này trình duyệt hay tự giật bậy bạ)
      if (document.activeElement && document.activeElement.tagName === "IFRAME") {
        return; 
      }

      // Tránh lưu nhầm cú giật lên top đột biến của trình duyệt (nhảy thẳng về < 10px)
      if (window.scrollY < 10 && lastGoodScrollY.current > 100) {
        return; 
      }

      // Lưu tọa độ "sạch"
      lastGoodScrollY.current = window.scrollY;
      sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
    };

    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (!isFull) {
        // VỪA THOÁT FULLSCREEN: Kích hoạt chế độ Cứu hộ
        isRescuing.current = true;
        const targetY = lastGoodScrollY.current;

        // Bắt nó nằm im ở vị trí cũ
        window.scrollTo({ top: targetY, left: 0, behavior: "instant" });

        // Cử "vệ sĩ" canh gác trong 1 giây
        let ticks = 0;
        if (rescueTimer.current) clearInterval(rescueTimer.current);

        rescueTimer.current = setInterval(() => {
          // Nếu phát hiện trình duyệt ngoan cố kéo lên top (< 50px), giật nó về lại targetY
          if (window.scrollY < 50 && targetY > 50) {
            window.scrollTo({ top: targetY, left: 0, behavior: "instant" });
          }
          
          ticks++;
          if (ticks > 20) { // 20 vòng x 50ms = 1 giây là đủ an toàn
            abortRescue();
          }
        }, 50);
      }
    };

    // MẤU CHỐT 2: Chống giật trang
    // Hủy lệnh canh gác ngay khi người dùng tự lấy tay vuốt hoặc lăn chuột
    window.addEventListener("wheel", abortRescue, { passive: true });
    window.addEventListener("touchstart", abortRescue, { passive: true });
    window.addEventListener("keydown", abortRescue, { passive: true });

    // Lắng nghe cuộn và fullscreen
    window.addEventListener("scroll", handleScroll, { passive: true });
    const events = ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"];
    events.forEach(e => document.addEventListener(e, handleFullscreenChange));

    return () => {
      window.removeEventListener("wheel", abortRescue);
      window.removeEventListener("touchstart", abortRescue);
      window.removeEventListener("keydown", abortRescue);
      window.removeEventListener("scroll", handleScroll);
      events.forEach(e => document.removeEventListener(e, handleFullscreenChange));
      abortRescue();
    };
  }, []);

  // Ẩn chatbot ở các trang bài tập
  useEffect(() => {
    const body = document.body;
    if (
      location.pathname === "/bai-tap" ||
      location.pathname === "/tro-choi-am-thuc" ||
      location.pathname === "/tro-choi-lich-su"
    ) {
      body.classList.add("page-hide-chatbot");
    } else {
      body.classList.remove("page-hide-chatbot");
    }
    return () => body.classList.remove("page-hide-chatbot");
  }, [location.pathname]);

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;