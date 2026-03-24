import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer-area">
      <div className="footer-container">
        <div className="footer-row">
          <div className="footer-col left">
            <img src="/images/logo_truong.png" alt="Logo Footer" className="footer-logo" />

            <div className="footer-socials">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-tiktok"></i></a>
              <a href="#"><i className="fab fa-youtube"></i></a>
            </div>

            <div className="footer-info">
              <h4>TRƯỜNG ĐẠI HỌC SƯ PHẠM TP.HỒ CHÍ MINH</h4>
              <p>280 An Dương Vương, Phường Chợ Quán, Quận 5, TP.HCM</p>

              <br />

              <h4>KHOA GIÁO DỤC TIỂU HỌC</h4>
              <a href="#" className="footer-link">Website thuộc nhóm NCKH khoa Giáo dục Tiểu học</a>
              <p>Liên hệ công tác: (0394) 952 938</p>
            </div>
          </div>

          <div className="footer-col middle">
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/dia-ly">Địa lý</Link></li>
              <li><Link to="/lich-su">Lịch sử</Link></li>
              <li><Link to="/van-hoa">Văn hóa</Link></li>
              <li><Link to="/hoc-tap">Góc học tập</Link></li>
            </ul>
          </div>

          <div className="footer-col right">
            <h3>ĐĂNG KÝ NHẬN TÀI LIỆU MỚI</h3>
            <p>Nhận những tài liệu mới nhất về Lịch sử, Văn hóa - Xã hội, Địa lý Sài Gòn gửi trực tiếp vào hộp thư của bạn!</p>

            <form className="subscribe-form">
              <input type="email" placeholder="Nhập email của bạn..." />
              <button type="submit">
                Đăng ký <i className="fas fa-arrow-right"></i>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container bottom-row">
          <p>Designed by Nhóm NCKH khoa Giáo dục Tiểu học</p>
          <p>&copy; 2026 HCMUE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
