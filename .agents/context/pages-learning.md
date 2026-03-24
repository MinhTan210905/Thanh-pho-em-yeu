# Pages: Learning Module

## Hub (`src/pages/learning/`)

### Learning.jsx + Learning.css
- Trang hub với hero slider (2 slides: Tài liệu + Trò chơi)
- Auto-rotate mỗi 6s với progress indicator
- Route: `/hoc-tap`

### BaiTap.jsx + BaiTap.css  
- Trang tổng hợp 8 trò chơi ôn tập
- Hiển thị card cho mỗi game: thumbnail, title, mô tả, progress
- Đọc progress từ `sessionStorage.bt_game_progress`
- Route: `/bai-tap`

### gameDefs.js
- Export `GAME_DEFS` array — metadata cho 8 game
- Mỗi game def: `{id, title, category, description, image, totalQuestions, route, storageKey}`

### confettiEffect.js
- Shared helper `fireConfetti(intensity)` dùng `canvas-confetti`
- Gọi khi hoàn thành game với kết quả tốt

## 8 Trò Chơi

### 1. TroChoiAmThuc (Đuổi Hình Bắt Chữ)
- **Mechanic**: Xem ảnh món ăn → kéo thả chữ cái → ghép tên
- **Prefix CSS**: `tc-`
- **Route**: `/tro-choi-am-thuc`
- **10 câu**, có gợi ý (hint)

### 2. TroChoiDiTichLichSu (Phân Loại Di Tích)
- **Mechanic**: Phân loại di tích lịch sử vào đúng thời kỳ
- **Prefix CSS**: `dt-` 
- **Route**: `/tro-choi-di-tich-lich-su`
- **9 câu**

### 3. TroChoiDiaLiTuNhien (Túi Mù Bí Ẩn)
- **Mechanic**: Xé túi mù → trắc nghiệm 4 đáp án
- **Prefix CSS**: `tk-`
- **Route**: `/tro-choi-dia-li-tu-nhien`
- **10 câu**

### 4. TroChoiLangNghe (Kết Nối Làng Nghề)
- **Mechanic**: Ghép hình ảnh với tên làng nghề
- **Prefix CSS**: `ln-`
- **Route**: `/tro-choi-lang-nghe`
- **5 cặp**

### 5. TroChoiLeHoi (Giải Mã Lễ Hội)
- **Mechanic**: Chọn từ khóa đúng cho lễ hội (orbital UI)
- **Prefix CSS**: `lh-`
- **Route**: `/tro-choi-le-hoi`
- **8 câu**

### 6. TroChoiNhanVatLichSu (Đảo Chữ Thông Thái)
- **Mechanic**: Đọc gợi ý → sắp xếp chữ cái bị xáo → tìm tên nhân vật
- **Prefix CSS**: `nv-`
- **Route**: `/tro-choi-nhan-vat-lich-su`
- **14 câu**

### 7. TroChoiDanCu (Quán Ăn Hạnh Phúc)
- **Mechanic**: Chọn món ăn → trả lời trắc nghiệm về dân cư → hoàn thiện thực đơn
- **Prefix CSS**: `dc-`
- **Route**: `/tro-choi-dan-cu`
- **5 câu**
- **Assets**: nen.jpg, nen_2.jpg, ban_hieu.png, 4 đầu bếp, 5 món ăn, khay
- **Flow**: intro1 (bảng hiệu) → intro2 (chào mừng) → menu (chọn món) → question → finish

### 8. TroChoiKinhTe (Truy Tìm Ô Chữ)
- **Mechanic**: Tìm từ khóa ẩn trong bảng chữ cái (word search)
- **Prefix CSS**: `kt-`
- **Route**: `/tro-choi-kinh-te`
- **5 từ khóa**
