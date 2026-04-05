import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/layout/Layout";
import RequireAuth from "./components/auth/RequireAuth";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/home/Home";
import History from "./pages/history/History";
import Geography from "./pages/geography/Geography";
import Culture from "./pages/culture/Culture";
import LangNghe from "./pages/culture/LangNghe";
import AmThuc from "./pages/culture/AmThuc";
import LeHoi from "./pages/culture/LeHoi";
import DiTich from "./pages/history/DiTich";
import NhanVat from "./pages/history/NhanVat";
import ViTri from "./pages/geography/ViTri";
import KinhTe from "./pages/geography/KinhTe";
import TuNhien from "./pages/geography/TuNhien";
import DanCu from "./pages/geography/DanCu";
import Vr360 from "./pages/vr360/Vr360";
import Learning from "./pages/learning/Learning";
import BaiTap from "./pages/learning/BaiTap";
import TroChoiAmThuc from "./pages/learning/TroChoiAmThuc";
import TroChoiDiTichLichSu from "./pages/learning/TroChoiDiTichLichSu";
import TroChoiDiaLiTuNhien from "./pages/learning/TroChoiDiaLiTuNhien";
import TroChoiDanCu from "./pages/learning/TroChoiDanCu";
import TroChoiLangNghe from "./pages/learning/TroChoiLangNghe";
import TroChoiLeHoi from "./pages/learning/TroChoiLeHoi";
import TroChoiNhanVatLichSu from "./pages/learning/TroChoiNhanVatLichSu";
import TroChoiKinhTe from "./pages/learning/TroChoiKinhTe";
import TroChoiViTri from "./pages/learning/TroChoiViTri";
import Chatbot from "./components/chatbot/Chatbot";
import TaiLieuHocTap from "./pages/learning/TaiLieuHocTap";
import Login from "./pages/auth/Login";
import Unauthorized from "./pages/auth/Unauthorized";
import QuanLyHeThong from "./pages/management/QuanLyHeThong";

import "./styles/variables.css";
import "./styles/global.css";
import "./styles/override.css";

function ChatbotGate() {
  const location = useLocation();
  const hideOn = new Set([
    "/dang-nhap",
    "/quan-ly",
    "/khong-co-quyen",
    "/bai-tap",
    "/tro-choi-am-thuc",
    "/tro-choi-di-tich-lich-su",
    "/tro-choi-dia-li-tu-nhien",
    "/tro-choi-dan-cu",
    "/tro-choi-lang-nghe",
    "/tro-choi-le-hoi",
    "/tro-choi-nhan-vat-lich-su",
    "/tro-choi-kinh-te",
    "/tro-choi-vi-tri",
  ]);
  if (hideOn.has(location.pathname)) return null;
  return <Chatbot />;
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/dang-nhap" element={<Login />} />
          <Route
            path="/quan-ly"
            element={
              <RequireAuth roles={["admin", "school", "teacher"]}>
                <QuanLyHeThong />
              </RequireAuth>
            }
          />

          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/lich-su" element={<History />} />
            <Route path="/dia-ly" element={<Geography />} />
            <Route path="/van-hoa" element={<Culture />} />
            <Route path="/lang-nghe" element={<LangNghe />} />
            <Route path="/am-thuc" element={<AmThuc />} />
            <Route path="/le-hoi" element={<LeHoi />} />
            <Route path="/di-tich" element={<DiTich />} />
            <Route path="/nhan-vat" element={<NhanVat />} />
            <Route path="/vi-tri" element={<ViTri />} />
            <Route path="/kinh-te" element={<KinhTe />} />
            <Route path="/tu-nhien" element={<TuNhien />} />
            <Route path="/dan-cu" element={<DanCu />} />
            <Route path="/vr360" element={<Vr360 />} />
            <Route path="/hoc-tap" element={<Learning />} />
            <Route path="/tai-lieu" element={<TaiLieuHocTap />} />
            <Route path="/bai-tap" element={<BaiTap />} />
            <Route path="/khong-co-quyen" element={<Unauthorized />} />
            <Route path="/tro-choi-am-thuc" element={<TroChoiAmThuc />} />
            <Route path="/tro-choi-di-tich-lich-su" element={<TroChoiDiTichLichSu />} />
            <Route path="/tro-choi-dia-li-tu-nhien" element={<TroChoiDiaLiTuNhien />} />
            <Route path="/tro-choi-dan-cu" element={<TroChoiDanCu />} />
            <Route path="/tro-choi-lang-nghe" element={<TroChoiLangNghe />} />
            <Route path="/tro-choi-le-hoi" element={<TroChoiLeHoi />} />
            <Route path="/tro-choi-nhan-vat-lich-su" element={<TroChoiNhanVatLichSu />} />
            <Route path="/tro-choi-kinh-te" element={<TroChoiKinhTe />} />
            <Route path="/tro-choi-vi-tri" element={<TroChoiViTri />} />
          </Route>
        </Routes>
        <ChatbotGate />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;

