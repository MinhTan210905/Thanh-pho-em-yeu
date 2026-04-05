-- 1) Tạo Database
CREATE DATABASE IF NOT EXISTS khampha_tphcm
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE khampha_tphcm;

-- 2) Bảng users (lưu tất cả loại tài khoản)
CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(120) NOT NULL,
        role ENUM('admin', 'school', 'teacher', 'student') NOT NULL,
        parent_id INT UNSIGNED DEFAULT NULL,
        school_id INT UNSIGNED DEFAULT NULL,
        class_name VARCHAR(50) DEFAULT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_users_parent
            FOREIGN KEY (parent_id)
            REFERENCES users(id)
            ON DELETE SET NULL,

        CONSTRAINT fk_users_school
            FOREIGN KEY (school_id)
            REFERENCES users(id)
            ON DELETE SET NULL,

        INDEX idx_users_role (role),
        INDEX idx_users_parent (parent_id),
        INDEX idx_users_school (school_id)
) ENGINE=InnoDB;

-- 3) Bảng game_scores (lưu điểm học sinh)
CREATE TABLE IF NOT EXISTS game_scores (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        game_id VARCHAR(50) NOT NULL,
        score INT NOT NULL,
        attempts INT NOT NULL DEFAULT 1,
        completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_scores_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        CHECK (score >= 0),
        CHECK (attempts >= 1),

        INDEX idx_scores_user (user_id),
        INDEX idx_scores_game (game_id),
        INDEX idx_scores_completed_at (completed_at),
        INDEX idx_scores_user_game (user_id, game_id)
) ENGINE=InnoDB;

-- 3.1) Bảng classes (quản lí lớp theo trường)
CREATE TABLE IF NOT EXISTS classes (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        school_id INT UNSIGNED NOT NULL,
        class_name VARCHAR(50) NOT NULL,
        teacher_id INT UNSIGNED DEFAULT NULL,
        approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
        created_by INT UNSIGNED NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_classes_school
            FOREIGN KEY (school_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_classes_teacher
            FOREIGN KEY (teacher_id)
            REFERENCES users(id)
            ON DELETE SET NULL,

        CONSTRAINT fk_classes_creator
            FOREIGN KEY (created_by)
            REFERENCES users(id)
            ON DELETE CASCADE,

        UNIQUE KEY uq_school_class (school_id, class_name),
        INDEX idx_classes_teacher (teacher_id),
        INDEX idx_classes_status (approval_status)
) ENGINE=InnoDB;

-- 3.2) Bảng yêu cầu chuyển/rời lớp (nhà trường duyệt)
CREATE TABLE IF NOT EXISTS class_transfer_requests (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        class_id INT UNSIGNED NOT NULL,
        school_id INT UNSIGNED NOT NULL,
        requested_by_teacher_id INT UNSIGNED NOT NULL,
        target_teacher_id INT UNSIGNED DEFAULT NULL,
        action ENUM('transfer', 'unassign') NOT NULL,
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        note VARCHAR(255) DEFAULT NULL,
        review_note VARCHAR(255) DEFAULT NULL,
        reviewed_by INT UNSIGNED DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL DEFAULT NULL,

        CONSTRAINT fk_transfer_class
            FOREIGN KEY (class_id)
            REFERENCES classes(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_transfer_school
            FOREIGN KEY (school_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_transfer_requester
            FOREIGN KEY (requested_by_teacher_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_transfer_target_teacher
            FOREIGN KEY (target_teacher_id)
            REFERENCES users(id)
            ON DELETE SET NULL,

        CONSTRAINT fk_transfer_reviewer
            FOREIGN KEY (reviewed_by)
            REFERENCES users(id)
            ON DELETE SET NULL,

        INDEX idx_transfer_school_status (school_id, status),
        INDEX idx_transfer_requester (requested_by_teacher_id)
) ENGINE=InnoDB;

-- ============================================================
-- 4) Seed tài khoản admin mặc định
-- Mật khẩu cho toàn bộ tài khoản: admin123
-- ============================================================

INSERT INTO users (username, password, full_name, role)
VALUES ('admin', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Hệ thống Admin', 'admin')
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- 5) Seed dữ liệu mẫu theo phân cấp
-- Mật khẩu mặc định cho tất cả tài khoản: admin123

-- 5.1) Tạo 2 tài khoản school do admin quản lí
INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'school_hbt', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Trường Tiểu học Hai Bà Trưng', 'school', a.id, NULL, NULL, 1
FROM users a
WHERE a.username = 'admin'
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    role = VALUES(role),
    parent_id = VALUES(parent_id),
    class_name = NULL,
    is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'school_ntt', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Trường Tiểu học Nguyễn Thái Học', 'school', a.id, NULL, NULL, 1
FROM users a
WHERE a.username = 'admin'
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    role = VALUES(role),
    parent_id = VALUES(parent_id),
    class_name = NULL,
    is_active = 1;

-- School phải có school_id = chính ID của school
UPDATE users
SET school_id = id
WHERE role = 'school' AND username IN ('school_hbt', 'school_ntt');

-- 5.2) Tạo 4 tài khoản teacher (mỗi trường 2 giáo viên)
INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'gv_hbt_01', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Nguyễn Thị Ánh', 'teacher', s.id, s.id, NULL, 1
FROM users s
WHERE s.username = 'school_hbt'
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    role = VALUES(role),
    parent_id = VALUES(parent_id),
    school_id = VALUES(school_id),
    class_name = NULL,
    is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'gv_hbt_02', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Trần Minh Châu', 'teacher', s.id, s.id, NULL, 1
FROM users s
WHERE s.username = 'school_hbt'
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    role = VALUES(role),
    parent_id = VALUES(parent_id),
    school_id = VALUES(school_id),
    class_name = NULL,
    is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'gv_ntt_01', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Lê Quốc Bảo', 'teacher', s.id, s.id, NULL, 1
FROM users s
WHERE s.username = 'school_ntt'
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    role = VALUES(role),
    parent_id = VALUES(parent_id),
    school_id = VALUES(school_id),
    class_name = NULL,
    is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'gv_ntt_02', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Phạm Thu Hà', 'teacher', s.id, s.id, NULL, 1
FROM users s
WHERE s.username = 'school_ntt'
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    role = VALUES(role),
    parent_id = VALUES(parent_id),
    school_id = VALUES(school_id),
    class_name = NULL,
    is_active = 1;

-- 5.3) Tạo tài khoản student
-- Lớp 3A (Trường HBT, GV Nguyễn Thị Ánh) — 10 học sinh
INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_hbt_3a_01', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Lê Gia Hân', 'student', t.id, t.school_id, '3A', 1
FROM users t WHERE t.username = 'gv_hbt_01'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_hbt_3a_02', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Võ Minh Khang', 'student', t.id, t.school_id, '3A', 1
FROM users t WHERE t.username = 'gv_hbt_01'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_hbt_3a_03', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Trần Bảo Ngọc', 'student', t.id, t.school_id, '3A', 1
FROM users t WHERE t.username = 'gv_hbt_01'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_hbt_3a_04', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Nguyễn Đức Anh', 'student', t.id, t.school_id, '3A', 1
FROM users t WHERE t.username = 'gv_hbt_01'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_hbt_3a_05', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Phạm Thị Mai', 'student', t.id, t.school_id, '3A', 1
FROM users t WHERE t.username = 'gv_hbt_01'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_hbt_3a_06', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Huỳnh Minh Tuấn', 'student', t.id, t.school_id, '3A', 1
FROM users t WHERE t.username = 'gv_hbt_01'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_hbt_3a_07', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Đỗ Thanh Tâm', 'student', t.id, t.school_id, '3A', 1
FROM users t WHERE t.username = 'gv_hbt_01'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_hbt_3a_08', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Bùi Hồng Nhung', 'student', t.id, t.school_id, '3A', 1
FROM users t WHERE t.username = 'gv_hbt_01'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_hbt_3a_09', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Lý Quốc Huy', 'student', t.id, t.school_id, '3A', 1
FROM users t WHERE t.username = 'gv_hbt_01'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_hbt_3a_10', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Tạ Phương Linh', 'student', t.id, t.school_id, '3A', 1
FROM users t WHERE t.username = 'gv_hbt_01'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

-- Lớp 4A (Trường HBT, GV Trần Minh Châu) — 2 học sinh
INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_hbt_4a_01', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Đặng Thu Uyên', 'student', t.id, t.school_id, '4A', 1
FROM users t WHERE t.username = 'gv_hbt_02'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_hbt_4a_02', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Ngô Quốc An', 'student', t.id, t.school_id, '4A', 1
FROM users t WHERE t.username = 'gv_hbt_02'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

-- Lớp 3B (Trường NTT, GV Lê Quốc Bảo) — 2 học sinh
INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_ntt_3b_01', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Trương Hoài Nam', 'student', t.id, t.school_id, '3B', 1
FROM users t WHERE t.username = 'gv_ntt_01'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_ntt_3b_02', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Bùi Khánh Linh', 'student', t.id, t.school_id, '3B', 1
FROM users t WHERE t.username = 'gv_ntt_01'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

-- Lớp 4B (Trường NTT, GV Phạm Thu Hà) — 2 học sinh
INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_ntt_4b_01', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Phan Gia Bảo', 'student', t.id, t.school_id, '4B', 1
FROM users t WHERE t.username = 'gv_ntt_02'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name, is_active)
SELECT 'hs_ntt_4b_02', '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq', 'Lí Hoàng Yến', 'student', t.id, t.school_id, '4B', 1
FROM users t WHERE t.username = 'gv_ntt_02'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), parent_id = VALUES(parent_id), school_id = VALUES(school_id), class_name = VALUES(class_name), is_active = 1;

-- 6) Đồng bộ mật khẩu mẫu khi chạy lại schema
-- Mật khẩu cho toàn bộ tài khoản demo: admin123
UPDATE users
SET password = '$2b$10$rsvaHukZpRAfO15Ba9FcdODaDwVXCaZunOY.Vm8KXc7gNW77uzZAq'
WHERE username IN (
    'admin',
    'school_hbt', 'school_ntt',
    'gv_hbt_01', 'gv_hbt_02', 'gv_ntt_01', 'gv_ntt_02',
    'hs_hbt_3a_01', 'hs_hbt_3a_02', 'hs_hbt_3a_03', 'hs_hbt_3a_04', 'hs_hbt_3a_05',
    'hs_hbt_3a_06', 'hs_hbt_3a_07', 'hs_hbt_3a_08', 'hs_hbt_3a_09', 'hs_hbt_3a_10',
    'hs_hbt_4a_01', 'hs_hbt_4a_02',
    'hs_ntt_3b_01', 'hs_ntt_3b_02', 'hs_ntt_4b_01', 'hs_ntt_4b_02'
);

-- ============================================================
-- 7) Seed classes (lớp học)
-- ============================================================

INSERT INTO classes (school_id, class_name, teacher_id, approval_status, created_by)
SELECT s.id, '3A', t.id, 'approved', s.id
FROM users s JOIN users t ON t.username = 'gv_hbt_01'
WHERE s.username = 'school_hbt'
ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id), approval_status = 'approved';

INSERT INTO classes (school_id, class_name, teacher_id, approval_status, created_by)
SELECT s.id, '4A', t.id, 'approved', s.id
FROM users s JOIN users t ON t.username = 'gv_hbt_02'
WHERE s.username = 'school_hbt'
ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id), approval_status = 'approved';

INSERT INTO classes (school_id, class_name, teacher_id, approval_status, created_by)
SELECT s.id, '3B', t.id, 'approved', s.id
FROM users s JOIN users t ON t.username = 'gv_ntt_01'
WHERE s.username = 'school_ntt'
ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id), approval_status = 'approved';

INSERT INTO classes (school_id, class_name, teacher_id, approval_status, created_by)
SELECT s.id, '4B', t.id, 'approved', s.id
FROM users s JOIN users t ON t.username = 'gv_ntt_02'
WHERE s.username = 'school_ntt'
ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id), approval_status = 'approved';

-- ============================================================
-- 8) Seed điểm game cho 10 HS lớp 3A
-- Mỗi HS chơi 3-5 game, điểm 50-100, attempts 1-4
-- ============================================================

-- Xóa điểm cũ của các HS demo trước khi seed (tránh trùng)
DELETE gs FROM game_scores gs
JOIN users u ON gs.user_id = u.id
WHERE u.username LIKE 'hs_hbt_3a_%' OR u.username LIKE 'hs_hbt_4a_%'
   OR u.username LIKE 'hs_ntt_3b_%' OR u.username LIKE 'hs_ntt_4b_%';

-- HS 01: Lê Gia Hân (giỏi)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'am_thuc', 95, 1, '2026-03-20 09:15:00' FROM users u WHERE u.username = 'hs_hbt_3a_01';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'di_tich', 88, 2, '2026-03-21 10:30:00' FROM users u WHERE u.username = 'hs_hbt_3a_01';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'dia_li_tu_nhien', 92, 1, '2026-03-22 14:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_01';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'le_hoi', 90, 2, '2026-03-25 08:45:00' FROM users u WHERE u.username = 'hs_hbt_3a_01';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'vi_tri', 85, 1, '2026-04-01 11:20:00' FROM users u WHERE u.username = 'hs_hbt_3a_01';

-- HS 02: Võ Minh Khang (khá)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'am_thuc', 78, 2, '2026-03-20 09:30:00' FROM users u WHERE u.username = 'hs_hbt_3a_02';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'dan_cu', 82, 1, '2026-03-22 10:15:00' FROM users u WHERE u.username = 'hs_hbt_3a_02';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'lang_nghe', 75, 3, '2026-03-24 15:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_02';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'kinh_te', 80, 2, '2026-03-28 09:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_02';

-- HS 03: Trần Bảo Ngọc (giỏi)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'di_tich', 98, 1, '2026-03-19 08:30:00' FROM users u WHERE u.username = 'hs_hbt_3a_03';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'nhan_vat_lich_su', 94, 1, '2026-03-20 14:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_03';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'le_hoi', 87, 2, '2026-03-23 10:45:00' FROM users u WHERE u.username = 'hs_hbt_3a_03';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'am_thuc', 91, 1, '2026-03-29 09:15:00' FROM users u WHERE u.username = 'hs_hbt_3a_03';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'vi_tri', 89, 2, '2026-04-02 11:30:00' FROM users u WHERE u.username = 'hs_hbt_3a_03';

-- HS 04: Nguyễn Đức Anh (trung bình)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'am_thuc', 65, 3, '2026-03-21 09:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_04';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'dia_li_tu_nhien', 58, 4, '2026-03-23 10:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_04';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'dan_cu', 70, 2, '2026-03-27 14:30:00' FROM users u WHERE u.username = 'hs_hbt_3a_04';

-- HS 05: Phạm Thị Mai (khá)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'lang_nghe', 83, 1, '2026-03-20 11:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_05';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'le_hoi', 76, 2, '2026-03-22 15:30:00' FROM users u WHERE u.username = 'hs_hbt_3a_05';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'kinh_te', 88, 1, '2026-03-26 09:45:00' FROM users u WHERE u.username = 'hs_hbt_3a_05';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'nhan_vat_lich_su', 79, 3, '2026-03-30 10:15:00' FROM users u WHERE u.username = 'hs_hbt_3a_05';

-- HS 06: Huỳnh Minh Tuấn (giỏi)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'am_thuc', 100, 1, '2026-03-18 08:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_06';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'di_tich', 95, 1, '2026-03-20 09:30:00' FROM users u WHERE u.username = 'hs_hbt_3a_06';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'dia_li_tu_nhien', 97, 1, '2026-03-22 11:15:00' FROM users u WHERE u.username = 'hs_hbt_3a_06';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'vi_tri', 93, 2, '2026-03-25 14:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_06';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'le_hoi', 96, 1, '2026-04-01 10:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_06';

-- HS 07: Đỗ Thanh Tâm (trung bình khá)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'dan_cu', 72, 2, '2026-03-21 14:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_07';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'kinh_te', 68, 3, '2026-03-24 10:30:00' FROM users u WHERE u.username = 'hs_hbt_3a_07';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'am_thuc', 74, 2, '2026-03-28 09:15:00' FROM users u WHERE u.username = 'hs_hbt_3a_07';

-- HS 08: Bùi Hồng Nhung (khá giỏi)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'nhan_vat_lich_su', 86, 1, '2026-03-19 10:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_08';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'le_hoi', 82, 2, '2026-03-21 15:30:00' FROM users u WHERE u.username = 'hs_hbt_3a_08';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'am_thuc', 90, 1, '2026-03-25 09:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_08';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'di_tich', 84, 2, '2026-03-29 11:45:00' FROM users u WHERE u.username = 'hs_hbt_3a_08';

-- HS 09: Lý Quốc Huy (trung bình)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'am_thuc', 55, 4, '2026-03-22 09:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_09';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'dia_li_tu_nhien', 62, 3, '2026-03-25 10:30:00' FROM users u WHERE u.username = 'hs_hbt_3a_09';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'vi_tri', 58, 3, '2026-03-30 14:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_09';

-- HS 10: Tạ Phương Linh (khá)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'lang_nghe', 80, 1, '2026-03-20 10:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_10';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'le_hoi', 77, 2, '2026-03-23 09:30:00' FROM users u WHERE u.username = 'hs_hbt_3a_10';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'am_thuc', 85, 1, '2026-03-27 11:00:00' FROM users u WHERE u.username = 'hs_hbt_3a_10';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'nhan_vat_lich_su', 73, 3, '2026-04-01 14:30:00' FROM users u WHERE u.username = 'hs_hbt_3a_10';

-- Điểm mẫu cho HS lớp 4A (2 bé)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'am_thuc', 82, 1, '2026-03-22 09:00:00' FROM users u WHERE u.username = 'hs_hbt_4a_01';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'di_tich', 75, 2, '2026-03-25 10:30:00' FROM users u WHERE u.username = 'hs_hbt_4a_01';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'am_thuc', 70, 2, '2026-03-23 09:15:00' FROM users u WHERE u.username = 'hs_hbt_4a_02';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'kinh_te', 88, 1, '2026-03-28 14:00:00' FROM users u WHERE u.username = 'hs_hbt_4a_02';

-- Điểm mẫu cho HS lớp 3B (2 bé)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'le_hoi', 90, 1, '2026-03-20 10:00:00' FROM users u WHERE u.username = 'hs_ntt_3b_01';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'nhan_vat_lich_su', 78, 2, '2026-03-24 11:30:00' FROM users u WHERE u.username = 'hs_ntt_3b_01';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'am_thuc', 85, 1, '2026-03-21 09:00:00' FROM users u WHERE u.username = 'hs_ntt_3b_02';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'dia_li_tu_nhien', 72, 3, '2026-03-26 14:45:00' FROM users u WHERE u.username = 'hs_ntt_3b_02';

-- Điểm mẫu cho HS lớp 4B (2 bé)
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'vi_tri', 88, 1, '2026-03-22 08:30:00' FROM users u WHERE u.username = 'hs_ntt_4b_01';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'dan_cu', 76, 2, '2026-03-25 10:00:00' FROM users u WHERE u.username = 'hs_ntt_4b_01';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'lang_nghe', 81, 1, '2026-03-23 11:15:00' FROM users u WHERE u.username = 'hs_ntt_4b_02';
INSERT INTO game_scores (user_id, game_id, score, attempts, completed_at)
SELECT u.id, 'kinh_te', 67, 3, '2026-03-28 15:00:00' FROM users u WHERE u.username = 'hs_ntt_4b_02';
