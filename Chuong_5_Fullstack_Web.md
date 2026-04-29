# Chương 5. Tìm hiểu chuyên sâu 01 công nghệ: Fullstack Web Development (ReactJS & Node.js)

## 1. Tổng quan công nghệ
**Fullstack Web Development** là quá trình xây dựng toàn diện một ứng dụng web từ giao diện người dùng (Frontend) đến logic xử lý và quản trị dữ liệu máy chủ (Backend). Thay vì phải phụ thuộc vào nhiều ngôn ngữ khác nhau, hiện nay hệ sinh thái **JavaScript** cho phép lập trình viên sử dụng chung một ngôn ngữ cho cả hai phía, nổi bật nhất là bộ giải pháp **Vite-Node Stack**:
*   **Frontend (Client-side)**: Sử dụng thư viện **ReactJS** kết hợp cùng công cụ build tốc độ cao **Vite**. Công nghệ này mang lại khả năng tái sử dụng component cao, quản lý state linh hoạt thông qua mô hình Single Page Application (SPA).
*   **Backend (Server-side)**: Sử dụng **Node.js** cùng framework **Express.js**. Đây là môi trường thực thi bất đồng bộ, xử lý luồng sự kiện (Event-driven) mạnh mẽ, giúp hệ thống chịu tải tốt và thiết lập các API RESTful một cách nhanh chóng.
*   **Database**: Kết hợp với hệ quản trị cơ sở dữ liệu quan hệ **MySQL**, giúp lưu trữ dữ liệu người dùng và kết quả học tập một cách chặt chẽ.

## 2. Kiến trúc / mô hình hoạt động
Mô hình hoạt động của dự án dựa trên kiến trúc **Client-Server (RESTful API)**:
1.  **Client (ReactJS)** gửi các HTTP request thông qua giao diện người dùng.
2.  **Server (Node.js)** tiếp nhận request thông qua các Endpoint API.
3.  Server tiến hành xác thực bằng **JWT** và xử lý logic nghiệp vụ.
4.  Server truy vấn xuống **Database (MySQL)** để đọc hoặc ghi thông tin.
5.  Server đóng gói dữ liệu phản hồi (JSON) và gửi ngược lại cho Client.
6.  Client nhận dữ liệu, cập nhật lại State và tự động re-render giao diện.

Đặc biệt, dự án tích hợp thêm **Gemini AI API**, đóng vai trò như một gateway truyền tải và nhận phản hồi thông minh cho chatbot trợ lý học tập.

## 3. Ứng dụng thực tế: Dự án "Khám Phá TP.HCM"
Công nghệ Fullstack Web đã được ứng dụng trực tiếp để phát triển sản phẩm đồ án **Khám Phá TP.HCM** – một nền tảng giáo dục tương tác dành cho học sinh lớp 4.
*   **Frontend**: Cung cấp giao diện trực quan với các Hub kiến thức và hệ sinh thái gồm **9 Mini-games** tương tác.
*   **Backend**: Đảm nhận việc xử lý bảo mật, lưu trữ thông tin, xác thực người dùng và tích hợp AI.
*   **Kết quả**: Sản phẩm hoạt động mượt mà, tốc độ phản hồi nhanh, giao diện thân thiện với trẻ em.

## 4. Ưu - nhược điểm
### Ưu điểm:
*   **Đồng nhất ngôn ngữ**: Dùng JavaScript cho cả hai phía, giúp tối ưu thời gian phát triển.
*   **Hiệu suất cao**: Node.js Non-blocking I/O xử lý tốt lượng lớn request đồng thời.
*   **Dễ triển khai**: Phù hợp với các nền tảng đám mây hiện đại như Vercel hay Render.

### Nhược điểm:
*   **Tốc độ cập nhật nhanh**: Đòi hỏi lập trình viên phải liên tục cập nhật kiến thức mới.
*   **Độ phức tạp**: Cần nắm vững kiến thức từ UI, Logic đến Bảo mật và Cơ sở dữ liệu.

## 5. Lý do chọn công nghệ này cho định hướng cá nhân
Em chọn Fullstack Web vì đây là kỹ năng thiết yếu trong kỷ nguyên số. Việc nắm vững cả Frontend và Backend giúp em có cái nhìn tổng thể về một sản phẩm công nghệ, từ đó có thể tự mình xây dựng các công cụ hỗ trợ giảng dạy sáng tạo, phù hợp với định hướng trở thành một giáo viên thời đại công nghệ số 4.0.

---
- **Người thực hiện:** Bùi Minh Tân
- **MSSV:** 49.01.104.131
- **Dự án:** Thiết kế website KhamPhaTPHCM cho học sinh lớp 4
