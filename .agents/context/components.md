# Components Module

## Layout (`src/components/layout/`)

### Header.jsx (8KB)
- Navigation chính với 5 mục: Trang chủ, Lịch sử, Địa lí, Văn hóa, Học tập
- Search box
- Logo + tên app
- Responsive: hamburger menu trên mobile
- CSS: inline trong file hoặc `global.css`

### Footer.jsx (2.5KB)  
- Footer cố định, hiển thị info liên hệ + copyright

### Layout.jsx (5KB)
- Wrapper component dùng `<Outlet>` của React Router
- Bọc Header + Footer cho tất cả trang
- Quản lý scroll-to-top khi chuyển route

## Chatbot (`src/components/chatbot/`)

### Chatbot.jsx (15KB)
- Floating chatbot button + chat window
- Kết nối Google Gemini AI 
- Knowledge base từ `constants/chatbotKnowledge.js`
- CSS: `Chatbot.css` (10KB)

### Ẩn chatbot khi chơi game
- `ChatbotGate` component trong `App.jsx` check URL
- Nếu URL match game route → return null (không render chatbot)
