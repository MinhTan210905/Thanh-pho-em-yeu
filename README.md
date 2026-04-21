# KHÁM PHÁ TP.HCM // Thành Phố Em Yêu

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![AI Gemini](https://img.shields.io/badge/AI-Gemini-blue?style=for-the-badge&logo=google-gemini&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

📖 Giới thiệu (Introduction)
----------------------------
**KhamPhaTPHCM** là một nền tảng giáo dục tương tác hiện đại, được thiết kế dành riêng cho trẻ em để khám phá vẻ đẹp, lịch sử và văn hóa của Thành phố Hồ Chí Minh. Dự án kết hợp giữa công nghệ Web tiên tiến và trí tuệ nhân tạo để tạo ra một môi trường học tập "vừa chơi vừa học" đầy thú vị, thông qua:

*   **Hệ thống tri thức số hóa**: Tích lũy dữ liệu về Địa lí, Lịch sử và Văn hóa được trình bày sinh động.
*   **Trí tuệ nhân tạo (Gemini AI)**: Tích hợp Chatbot thông minh giúp giải đáp mọi thắc mắc và dẫn dắt trẻ em trong hành trình khám phá thành phố.

✨ Tính năng nổi bật (Key Features)
---------------------------------
*   🔍 **Hub Khám Phá Đa Chiều**: Phân chia kiến thức thành các mảng Địa lí (Vị trí, Kinh tế, Tự nhiên), Lịch sử (Di tích, Nhân vật) và Văn hóa (Ẩm thực, Làng nghề, Lễ hội).
*   🤖 **Trợ lý ảo thông minh (Gemini Agent)**: Chatbot AI được huấn luyện với kho tri thức chuyên sâu về TP.HCM, sẵn sàng tương tác và trả lời câu hỏi 24/7.
*   🎮 **Hệ sinh thái 8 Mini-games**: Chuỗi trò chơi ôn tập kiến thức (Đuổi hình bắt chữ, Túi mù, Kết nối làng nghề...) với hiệu ứng `canvas-confetti` bắt mắt.
*   👓 **Tham quan thực tế ảo (VR360)**: Tích hợp công nghệ VR giúp trẻ em "đi du lịch" qua màn ảnh nhỏ, ngắm nhìn toàn cảnh các địa danh nổi tiếng.
*   📱 **Giao diện Responsive**: Tối ưu hóa trải nghiệm trên mọi thiết bị từ máy tính bảng đến điện thoại di động.

📂 Kiến trúc hệ thống (Repository)
---------------------------------
```text
src/
├── App.jsx              # Router chính // Điều hướng toàn bộ ứng dụng
├── main.jsx             # Entry point // Khởi tạo React & Style
├── components/          # Shared Components
│   ├── layout/          # Giao diện khung (Header, Footer, Layout)
│   └── chatbot/         # Module AI Chatbot (Gemini Integration)
├── pages/               # Các trạm nội dung chính
│   ├── home/            # Trang chủ sinh động
│   ├── geography/       # Hub Địa lí (4 trạm nội dung)
│   ├── history/         # Hub Lịch sử (2 trạm nội dung)
│   ├── culture/         # Hub Văn hóa (3 trạm nội dung)
│   ├── learning/        # Trung tâm học tập & 8 Trò chơi
│   └── vr360/           # Trạm tham quan thực tế ảo
├── constants/           # Dữ liệu tĩnh & Knowledge Base cho AI
├── services/            # Kết nối API (Gemini Service)
└── styles/              # Design System (Global & Variables)
```

🚀 Khởi chạy hệ thống (Quick Start)
----------------------------------
Dự án được xây dựng trên nền tảng **Vite**, đảm bảo tốc độ phản hồi cực nhanh trong quá trình phát triển.

1.  **Clone dự án & Cài đặt**:
    ```bash
    git clone <repository-url>
    cd KhamPhaTPHCM
    npm install
    ```

2.  **Cấu hình môi trường**:
    Tạo file `.env` tại thư mục gốc và cung cấp API Key:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

3.  **Lên sóng máy chủ phát triển**:
    ```bash
    npm run dev
    ```
    Truy cập tại: 👉 `http://localhost:5173`

🧰 Kịch bản sử dụng (Operation Protocol)
---------------------------------------
*   **Hành trình khám phá**: Truy cập các mục Địa lí/Lịch sử/Văn hóa từ Header để xem thông tin chi tiết về từng địa danh.
*   **Hỏi đáp với AI**: Nhấn vào biểu tượng Chatbot ở góc màn hình để đặt câu hỏi về thành phố (ví dụ: "Bưu điện Thành phố xây năm nào?").
*   **Ôn tập qua Game**: Vào mục "Góc học tập" để thử thách bản thân với 8 trò chơi tương tác, thu thập điểm số và hiệu ứng pháo hoa khi chiến thắng.

🎮 Danh sách 8 Trò chơi ôn tập
-----------------------------
| # | Tên trò chơi | Chủ đề | Công nghệ |
|---|---|---|---|
| 1 | **Đuổi Hình Bắt Chữ** | Văn hóa/Ẩm thực | React State |
| 2 | **Phân Loại Di Tích** | Lịch sử | Drag & Drop |
| 3 | **Túi Mù Bí Ẩn** | Địa lí/Tự nhiên | Random Logic |
| 4 | **Kết Nối Làng Nghề** | Văn hóa | Matching |
| 5 | **Giải Mã Lễ Hội** | Văn hóa | Cipher |
| 6 | **Đảo Chữ Thông Thái** | Lịch sử | String Manipulation |
| 7 | **Quán Ăn Hạnh Phúc** | Địa lí/Dân cư | UI Interaction |
| 8 | **Truy Tìm Ô Chữ** | Địa lí/Kinh tế | Puzzle Logic |

---
*Dự án được phát triển nhằm lan tỏa tình yêu quê hương và kiến thức bổ ích cho thế hệ trẻ.*
