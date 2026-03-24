# Kiến Trúc Tổng Quan - KhamPhaTPHCM

## Stack
- **React 18** + **Vite 5** (dev server + build)
- **React Router DOM v6** (client-side routing, flat routes)
- **Google Generative AI** (Gemini API cho chatbot)
- **canvas-confetti** (hiệu ứng chúc mừng trong game)
- **Vanilla CSS** (không dùng CSS modules hay Tailwind)

## Pattern Chung

### Routing
- Tất cả routes đều flat (không nested), định nghĩa trong `App.jsx`
- Mọi route nằm trong `<Layout>` wrapper (Header + Footer + Outlet)
- Chatbot hiển thị global trừ khi URL nằm trong danh sách `hideOn` của `ChatbotGate`

### Trang Nội Dung (Content Pages)
- Mỗi trang = 1 `.jsx` + 1 `.css` cùng tên
- Sử dụng `IntersectionObserver` cho hiệu ứng reveal khi scroll
- Ảnh nền hero section với overlay gradient
- Responsive breakpoint chính: 768px, 980px

### Trò Chơi (Game Pages)
- Mỗi game = 1 `.jsx` + 1 `.css`
- State lưu `sessionStorage` (key riêng per game) để có thể resume
- Progress sync vào `bt_game_progress` (shared key) cho trang BaiTap
- Tối đa 3 lượt chơi (MAX_ATTEMPTS)
- Body class toggle (`page-tro-choi-active` / `page-tro-choi-dan-cu-active`) để override header style
- Chatbot tự ẩn khi chơi game

### Styling
- CSS custom properties tại `styles/variables.css`
- Reset + global styles tại `styles/global.css` 
- Mỗi component tự scope bằng prefix class riêng (vd: `tc-`, `dc-`, `lh-`, `ln-`)
- Không dùng CSS modules → cần cẩn thận tránh xung đột class names

## File Quan Trọng
- `App.jsx` — Router + ChatbotGate
- `components/layout/Layout.jsx` — Wrapper (Header + Outlet + Footer)
- `components/layout/Header.jsx` — Navigation + search
- `pages/learning/gameDefs.js` — Metadata cho 8 game (id, title, route, storageKey)
- `pages/learning/confettiEffect.js` — Shared confetti animation helper
- `pages/learning/BaiTap.jsx` — Trang tổng hợp bài tập, hiển thị progress từ sessionStorage
