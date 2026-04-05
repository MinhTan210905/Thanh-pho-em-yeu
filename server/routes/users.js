import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// ─── Quy tắc phân cấp ───
// Admin  -> tạo tài khoản "school"
// School -> tạo tài khoản "teacher"
// Teacher -> tạo tài khoản "student"

const ALLOWED_CHILD_ROLE = {
  admin: 'school',
  school: 'teacher',
  teacher: 'student',
};

// POST /api/users - Tạo tài khoản mới (theo phân cấp)
router.post('/', verifyToken, requireRole('admin', 'school', 'teacher'), async (req, res) => {
  try {
    const { username, password, full_name, class_name, target_role, target_school_id, target_parent_id } = req.body;
    const creator = req.user;

    // Xác định role con được phép tạo
    let childRole;
    if (creator.role === 'admin') {
      childRole = target_role || 'school'; // Admin can create school, teacher, student
      if (!['school', 'teacher', 'student'].includes(childRole)) {
        return res.status(400).json({ message: 'Role không hợp lệ!' });
      }
    } else {
      childRole = ALLOWED_CHILD_ROLE[creator.role];
      if (!childRole) {
        return res.status(403).json({ message: 'Bạn không có quyền tạo tài khoản!' });
      }
    }

    if (!username || !password || !full_name) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
    }

    // Kiểm tra username đã tồn tại chưa
    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại!' });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Xác định school_id và parent_id
    let schoolId = null;
    let parentId = creator.id;

    if (creator.role === 'admin') {
      if (childRole === 'school') {
        schoolId = null; // will be updated later
        parentId = creator.id;
      } else if (childRole === 'teacher') {
        if (!target_school_id) return res.status(400).json({ message: 'Vui lòng chọn trường!' });
        schoolId = target_school_id;
        parentId = target_school_id; // For teacher, parent_id is school_id
      } else if (childRole === 'student') {
        if (!target_school_id) return res.status(400).json({ message: 'Vui lòng chọn trường!' });
        if (!target_parent_id) return res.status(400).json({ message: 'Vui lòng chọn giáo viên phụ trách!' });
        schoolId = target_school_id;
        parentId = target_parent_id;
      }
    } else if (creator.role === 'school') {
      // School tạo teacher -> school_id = ID của school
      schoolId = creator.id;
      parentId = creator.id;
    } else if (creator.role === 'teacher') {
      // Teacher tạo student -> school_id = school_id của teacher
      schoolId = creator.school_id;
      parentId = creator.id;
    }

    const [result] = await pool.execute(
      'INSERT INTO users (username, password, full_name, role, parent_id, school_id, class_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, full_name, childRole, parentId, schoolId, class_name || null]
    );

    // Nếu tạo school, set school_id = chính ID vừa tạo
    if (childRole === 'school') {
      await pool.execute('UPDATE users SET school_id = ? WHERE id = ?', [result.insertId, result.insertId]);
    }

    res.status(201).json({
      message: `Tạo tài khoản ${childRole} thành công!`,
      user: {
        id: result.insertId,
        username,
        full_name,
        role: childRole,
        class_name: class_name || null,
      }
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống!' });
  }
});

// GET /api/users - Lấy danh sách tài khoản con (theo phân cấp)
router.get('/', verifyToken, requireRole('admin', 'school', 'teacher'), async (req, res) => {
  try {
    const creator = req.user;
    let query = '';
    let params = [];

    if (creator.role === 'admin') {
      // Admin xem tất cả (ngoại trừ chính admin)
      query = 'SELECT id, username, full_name, role, school_id, parent_id, class_name, created_at FROM users WHERE role != ?';
      params = ['admin'];
    } else if (creator.role === 'school') {
      // School xem teacher do mình tạo
      query = 'SELECT id, username, full_name, role, school_id, parent_id, class_name, created_at FROM users WHERE parent_id = ? AND role = ?';
      params = [creator.id, 'teacher'];
    } else if (creator.role === 'teacher') {
      // Teacher xem student do mình tạo
      query = 'SELECT id, username, full_name, role, school_id, parent_id, class_name, created_at FROM users WHERE parent_id = ? AND role = ?';
      params = [creator.id, 'student'];
    }

    const [rows] = await pool.execute(query, params);
    res.json({ users: rows });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống!' });
  }
});

// DELETE /api/users/:id - Xóa tài khoản
router.delete('/:id', verifyToken, requireRole('admin', 'school', 'teacher'), async (req, res) => {
  try {
    const userId = req.params.id;
    const creator = req.user;

    // Kiểm tra quyền: Chỉ xóa được tài khoản do mình tạo (hoặc admin xóa school)
    let query = '';
    let params = [];

    if (creator.role === 'admin') {
      query = 'DELETE FROM users WHERE id = ? AND role != ?';
      params = [userId, 'admin'];
    } else {
      query = 'DELETE FROM users WHERE id = ? AND parent_id = ?';
      params = [userId, creator.id];
    }

    const [result] = await pool.execute(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản hoặc bạn không có quyền xóa!' });
    }

    res.json({ message: 'Xóa tài khoản thành công!' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống!' });
  }
});

// PUT /api/users/:id - Cập nhật tài khoản
router.put('/:id', verifyToken, requireRole('admin', 'school', 'teacher'), async (req, res) => {
  try {
    const userId = req.params.id;
    const creator = req.user;
    const { full_name, password, class_name } = req.body;

    // Kiểm tra quyền
    let checkQuery, checkParams;
    if (creator.role === 'admin') {
      checkQuery = 'SELECT id FROM users WHERE id = ? AND role != ?';
      checkParams = [userId, 'admin'];
    } else {
      checkQuery = 'SELECT id FROM users WHERE id = ? AND parent_id = ?';
      checkParams = [userId, creator.id];
    }

    const [existing] = await pool.execute(checkQuery, checkParams);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản hoặc bạn không có quyền sửa!' });
    }

    // Build update query
    const updates = [];
    const values = [];

    if (full_name) { updates.push('full_name = ?'); values.push(full_name); }
    if (class_name !== undefined) { updates.push('class_name = ?'); values.push(class_name); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Không có thông tin cần cập nhật!' });
    }

    values.push(userId);
    await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Cập nhật thành công!' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống!' });
  }
});

export default router;
