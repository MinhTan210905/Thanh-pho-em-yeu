# Business Rules & Nghiệp Vụ

## Hệ Thống Trò Chơi

### Lưu trạng thái
- **Game state**: `sessionStorage` với key riêng per game (vd: `tc_amthuc_state`, `tc_dan_cu_state`)
- **Progress tổng**: `sessionStorage` key `bt_game_progress` — object chứa `{answered, correctCount, score, attempts}` cho mỗi game
- Dùng `sessionStorage` → mất khi đóng tab, phù hợp cho môi trường học tập

### Giới hạn lượt chơi
- `MAX_ATTEMPTS = 3` cho mỗi game
- Khi hết lượt → nút "Chơi lại" bị disable, hiển thị "Hết lượt"
- Điểm cao nhất được giữ lại (**best score**)

### Luồng chơi chung
1. Intro screen → hướng dẫn/giới thiệu
2. Gameplay → trả lời câu hỏi / tương tác
3. Khi hoàn thành tất cả câu → hiện nút "Xem tổng kết"
4. Finish screen → hiển thị score, cho phép chơi lại (nếu còn lượt)

### Tính điểm
- Công thức chung: `score = (correctCount / totalQuestions) * 100`
- Một số game dùng `correctCount * 10` (vd: AmThuc có 10 câu → max 100)
- Điểm cao nhất từ các lượt được giữ lại

### Dialog xác nhận
- Khi nhấn "Chơi lại" → hiện dialog xác nhận (không restart ngay)
- Thông báo rõ: "Đây sẽ là lượt mới" + còn bao nhiêu lượt
- Nếu hết lượt → hiện alert "Bạn đã hết lượt chơi"

## Trang Nội Dung

### Pattern chung
- Hero section với ảnh nền + overlay
- Nội dung chia thành sections với animation reveal khi scroll
- Breadcrumb / back navigation
- Responsive design (mobile-first)

### Navigation
- Header cố định khi scroll
- Active state cho menu item tương ứng với trang hiện tại
- Search box (tìm kiếm nội dung)

## Chatbot AI
- Sử dụng Google Gemini API
- Knowledge base hardcoded trong `constants/chatbotKnowledge.js`
- Trả lời câu hỏi về TP.HCM dựa trên knowledge base
- Ẩn khi user đang chơi game (tránh che giao diện)
