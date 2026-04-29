<h1 align="center">
  🇻🇳 KHÁM PHÁ TP.HCM (Thành Phố Em Yêu)<br>
  🇬🇧 DISCOVER HO CHI MINH CITY
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/AI_Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini" />
</p>

---

## 🌍 Table of Contents / Mục lục
- [🇻🇳 Tiếng Việt](#-tiếng-việt-vietnamese)
  - [1. Tổng quan dự án](#1-tổng-quan-dự-án)
  - [2. Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
  - [3. Tính năng cốt lõi](#3-tính-năng-cốt-lõi)
  - [4. Hệ sinh thái Trò chơi (Gamification)](#4-hệ-sinh-thái-trò-chơi-gamification)
  - [5. Hướng dẫn triển khai](#5-hướng-dẫn-triển-khai)
- [🇬🇧 English](#-english)
  - [1. Project Overview](#1-project-overview)
  - [2. System Architecture](#2-system-architecture)
  - [3. Core Features](#3-core-features)
  - [4. Gamification Ecosystem](#4-gamification-ecosystem)
  - [5. Deployment Guide](#5-deployment-guide)

---

## 🇻🇳 Tiếng Việt (Vietnamese)

### 1. Tổng quan dự án
**"Khám Phá TP.HCM"** là một nền tảng giáo dục điện tử (E-Learning Platform) hiện đại, được thiết kế và phát triển với mục tiêu phục vụ **Nghiên cứu Khoa học (NCKH) trong lĩnh vực Giáo dục**. Dự án áp dụng phương pháp **Học tập qua Trò chơi (Gamification)** và tích hợp **Trí tuệ nhân tạo (AI)** để tạo ra một môi trường tương tác sinh động, giúp học sinh tiểu học tiếp thu kiến thức về Địa lí, Lịch sử và Văn hóa Thành phố Hồ Chí Minh một cách tự nhiên và hiệu quả nhất.

### 2. Kiến trúc hệ thống
Dự án được thiết kế theo mô hình **Client-Server** chặt chẽ, đảm bảo tính bảo mật, hiệu suất và khả năng mở rộng:
- **Frontend (Client)**: Xây dựng bằng `ReactJS` và `Vite`, kiến trúc Component-based, hỗ trợ đa ngôn ngữ (i18n) và Responsive Design tối ưu cho mọi thiết bị.
- **Backend (Server)**: Phát triển với `Node.js` và `Express.js`, cung cấp hệ thống RESTful APIs chuẩn mực, xử lý logic nghiệp vụ và quản lý kết nối cơ sở dữ liệu.
- **Cơ sở dữ liệu (Database)**: Sử dụng `MySQL` (Relational Database) để lưu trữ cấu trúc dữ liệu người dùng, điểm số và quản lý phân quyền bảo mật cao.
- **Bảo mật (Security)**: Xác thực và phân quyền truy cập thông qua `JSON Web Token (JWT)`. Dữ liệu nhạy cảm được mã hóa một chiều bằng thuật toán `Bcrypt`.

### 3. Tính năng cốt lõi
- 📚 **Tri thức số hóa đa chiều**: Phân loại kiến thức khoa học thành các Hub bài bản: **Địa lí** (Vị trí, Kinh tế, Tự nhiên, Dân cư), **Lịch sử** (Di tích, Nhân vật), **Văn hóa** (Ẩm thực, Làng nghề, Lễ hội).
- 🤖 **Trợ lý ảo AI (Gemini Agent)**: Chatbot tích hợp API của Google Gemini, được tinh chỉnh (prompt engineering) với Cơ sở tri thức (Knowledge Base) chuyên sâu về TP.HCM, hoạt động như một chuyên gia bản địa giải đáp thắc mắc 24/7.
- 👨‍🏫 **Hệ thống Quản lý Học tập (LMS)**: Quản lý, thống kê và theo dõi tiến độ học tập (Learning Analytics) với hệ thống phân quyền 4 cấp độ (Quản trị viên, Nhà trường, Giáo viên, Học sinh).

### 4. Hệ sinh thái Trò chơi (Gamification)
Tích hợp **9 Mini-games** giáo dục được lập trình mô phỏng các tương tác vật lý và logic:
1. **Đuổi Hình Bắt Chữ** (Văn hóa/Ẩm thực) - *React State & Logic*
2. **Phân Loại Di Tích** (Lịch sử) - *Drag & Drop Algorithm*
3. **Túi Mù Bí Ẩn** (Địa lí/Tự nhiên) - *Randomization Logic*
4. **Kết Nối Làng Nghề** (Văn hóa) - *Matching Mechanics*
5. **Dấu Ấn Lễ Hội** (Văn hóa) - *Array Mapping & Filtering*
6. **Giải Mã Bí Ẩn** (Lịch sử) - *String Manipulation*
7. **Quán Ăn Hạnh Phúc** (Địa lí/Dân cư) - *UI/UX Interaction*
8. **Truy Tìm Ô Chữ** (Địa lí/Kinh tế) - *2D Matrix Search*
9. **Cuộc Phiêu Lưu Của Táo Đỏ** (Địa lí/Vị trí) - *Step-based Assessment*

### 5. Hướng dẫn triển khai

**Bước 1: Clone dự án & Cài đặt thư viện**
```bash
git clone https://github.com/your-username/KhamPhaTPHCM.git
cd KhamPhaTPHCM

# Cài đặt Frontend
npm install

# Cài đặt Backend
cd server
npm install
```

**Bước 2: Cấu hình môi trường (.env)**
- Tại thư mục gốc (Frontend), tạo file `.env` dựa trên `.env.example` và nhập `VITE_GEMINI_API_KEY`.
- Tại thư mục `server/`, tạo file `.env` để cấu hình thông số kết nối MySQL (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`).

**Bước 3: Khởi chạy hệ thống**
Khởi động đồng thời cả 2 terminal:
```bash
# Terminal 1: Khởi động Backend (Port 5000)
cd server
npm run dev

# Terminal 2: Khởi động Frontend (Port 5173)
cd KhamPhaTPHCM
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:5173`

---

## 🇬🇧 English

### 1. Project Overview
**"Discover Ho Chi Minh City"** is a modern, academic **E-Learning Platform** designed and developed for **Educational Scientific Research**. The project applies **Gamification** methodologies and integrates **Artificial Intelligence (AI)** to create a highly interactive learning environment. It assists elementary students in acquiring knowledge about the Geography, History, and Culture of Ho Chi Minh City intuitively and effectively.

### 2. System Architecture
The project follows a strict **Client-Server** model, ensuring high security, performance, and scalability:
- **Frontend (Client)**: Built with `ReactJS` and `Vite`, utilizing a Component-based architecture, multi-language support (i18n), and a responsive UI optimized for all devices.
- **Backend (Server)**: Developed using `Node.js` and `Express.js`, providing standard RESTful APIs, handling business logic, and managing database connections.
- **Database**: Employs `MySQL` (Relational Database) for structured storage of user data, grades, and highly secure role-based access control.
- **Security**: Authentication and authorization are handled via `JSON Web Token (JWT)`. Sensitive data (passwords) is one-way hashed using the `Bcrypt` algorithm.

### 3. Core Features
- 📚 **Multidimensional Digital Knowledge Hub**: Scientifically categorizes knowledge into structured Hubs: **Geography** (Location, Economy, Nature, Population), **History** (Relics, Historical Figures), and **Culture** (Cuisine, Traditional Crafts, Festivals).
- 🤖 **AI Assistant (Gemini Agent)**: A Chatbot integrated with Google's Gemini API, customized via prompt engineering with a specialized Knowledge Base about HCMC. It acts as a local expert answering questions 24/7.
- 👨‍🏫 **Learning Management System (LMS)**: Tracks and manages learning progress (Learning Analytics) with a robust 4-tier Role-Based Access Control system (Admin, School, Teacher, Student).

### 4. Gamification Ecosystem
Features **9 educational Mini-games** programmed to simulate various logical and physical interactions:
1. **Catchphrase** (Culture/Food) - *React State & Logic*
2. **Relic Sorting** (History) - *Drag & Drop Algorithm*
3. **Mystery Blind Box** (Geography/Nature) - *Randomization Logic*
4. **Craft Matching** (Culture) - *Matching Mechanics*
5. **Festival Decoder** (Culture) - *Array Mapping & Filtering*
6. **Historical Anagram** (History) - *String Manipulation*
7. **Happy Restaurant** (Geography/Population) - *UI/UX Interaction*
8. **Crossword Puzzle** (Geography/Economy) - *2D Matrix Search*
9. **Red Apple's Adventure** (Geography/Location) - *Step-based Assessment*

### 5. Deployment Guide

**Step 1: Clone the repository & Install dependencies**
```bash
git clone https://github.com/your-username/KhamPhaTPHCM.git
cd KhamPhaTPHCM

# Install Frontend
npm install

# Install Backend
cd server
npm install
```

**Step 2: Environment Configuration (.env)**
- In the root directory (Frontend), create a `.env` file based on `.env.example` and insert your `VITE_GEMINI_API_KEY`.
- In the `server/` directory, create a `.env` file for MySQL connection details and the JWT Secret.

**Step 3: Run the application**
Start both servers in separate terminals:
```bash
# Terminal 1: Start Backend (Port 5000)
cd server
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd KhamPhaTPHCM
npm run dev
```
Access the application at: `http://localhost:5173`

---
*Designed & Developed for Educational Research Purposes.*
