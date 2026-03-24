---
description: Workflow phát triển KhamPhaTPHCM
---

# Dev Workflow

// turbo-all

## 1. Chạy dev server
```bash
npm run dev
```
Server chạy tại `http://localhost:5173`

## 2. Build production
```bash
npm run build
```
Output ra thư mục `dist/`

## 3. Preview build
```bash
npm run preview
```

## Cấu trúc file khi thêm trang mới
1. Tạo `TenTrang.jsx` + `TenTrang.css` trong thư mục module tương ứng (`pages/geography/`, `pages/history/`, etc.)
2. Import và thêm `<Route>` trong `App.jsx`
3. Nếu là game: thêm entry vào `gameDefs.js` và thêm URL vào `ChatbotGate.hideOn` trong `App.jsx`

## Cấu trúc file khi thêm trò chơi mới
1. Tạo `TroChoiXxx.jsx` + `TroChoiXxx.css` trong `pages/learning/`
2. Thêm game def vào `gameDefs.js`
3. Import component + thêm `<Route>` trong `App.jsx`
4. Thêm route vào `hideOn` set trong `ChatbotGate` (`App.jsx`)
5. CSS prefix riêng cho game (vd: `xx-`) để tránh xung đột
