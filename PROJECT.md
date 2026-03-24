# KhamPhaTPHCM - Khám Phá Thành Phố Hồ Chí Minh

## Tech Stack
- **Frontend**: React 18 + Vite 5
- **Routing**: React Router DOM v6
- **AI**: Google Generative AI (Gemini) cho chatbot
- **Styling**: Vanilla CSS (mỗi component 1 file CSS riêng)
- **Effects**: canvas-confetti cho hiệu ứng game

## Kiến Trúc

```
src/
├── App.jsx              # Router chính, định nghĩa tất cả routes
├── main.jsx             # Entry point
├── components/          # Shared components
│   ├── layout/          # Header, Footer, Layout (wrapper chung cho mọi trang)
│   └── chatbot/         # Chatbot AI (ẩn khi chơi game)
├── constants/           # Dữ liệu tĩnh
│   └── chatbotKnowledge.js  # Knowledge base cho chatbot
├── pages/               # Trang nội dung, chia theo chủ đề
│   ├── home/            # Trang chủ (Home.jsx)
│   ├── geography/       # Địa lí: ViTri, KinhTe, TuNhien, DanCu
│   ├── history/         # Lịch sử: DiTich, NhanVat
│   ├── culture/         # Văn hóa: AmThuc, LangNghe, LeHoi
│   ├── learning/        # Hub học tập + 8 trò chơi ôn tập
│   └── vr360/           # Tham quan VR360
├── services/            # API services (chatbotService.js)
├── styles/              # CSS toàn cục
│   ├── variables.css    # CSS custom properties
│   ├── global.css       # Reset + global styles
│   └── override.css     # Override specifics
└── utils/               # Tiện ích chung
```

## Các Module Chi Tiết

| Module | Mô tả | Files | Doc |
|--------|--------|-------|-----|
| **Layout** | Header/Footer/Layout wrapper, shared cho tất cả trang | 3 files | `.agents/context/components.md` |
| **Chatbot** | AI chatbot dùng Gemini, ẩn khi chơi game | 2 files | `.agents/context/components.md` |
| **Geography** | 4 trang + 1 hub: ViTri, KinhTe, TuNhien, DanCu | 10 files | `.agents/context/pages-geography.md` |
| **History** | 2 trang + 1 hub: DiTich, NhanVat | 6 files | `.agents/context/pages-history.md` |
| **Culture** | 3 trang + 1 hub: AmThuc, LangNghe, LeHoi | 8 files | `.agents/context/pages-culture.md` |
| **Learning** | Hub học tập + 8 trò chơi | 22 files | `.agents/context/pages-learning.md` |
| **VR360** | Tham quan VR360 | 2 files | `.agents/context/pages-vr360.md` |

## 8 Trò Chơi Ôn Tập

| # | Game | Component | Chủ đề | Số câu |
|---|------|-----------|--------|--------|
| 1 | Đuổi Hình Bắt Chữ | TroChoiAmThuc | Văn hóa | 10 |
| 2 | Phân Loại Di Tích | TroChoiDiTichLichSu | Lịch sử | 9 |
| 3 | Túi Mù Bí Ẩn | TroChoiDiaLiTuNhien | Địa lí | 10 |
| 4 | Kết Nối Làng Nghề | TroChoiLangNghe | Văn hóa | 5 |
| 5 | Giải Mã Lễ Hội | TroChoiLeHoi | Văn hóa | 8 |
| 6 | Đảo Chữ Thông Thái | TroChoiNhanVatLichSu | Lịch sử | 14 |
| 7 | Quán Ăn Hạnh Phúc | TroChoiDanCu | Địa lí | 5 |
| 8 | Truy Tìm Ô Chữ | TroChoiKinhTe | Địa lí | 5 |

## Business Rules Chung
- Mỗi game tối đa **3 lượt chơi** (MAX_ATTEMPTS = 3)
- Điểm cao nhất được lưu qua `sessionStorage` (key: `bt_game_progress`)
- State game lưu `sessionStorage` để resume khi quay lại
- Chatbot tự ẩn khi vào trang game
- Header fixed ở top khi chơi game
