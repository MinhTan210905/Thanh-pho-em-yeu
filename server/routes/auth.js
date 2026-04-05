import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = Router();

// POST /api/auth/login - Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu!' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác!' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác!' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        parent_id: user.parent_id,
        school_id: user.school_id,
        class_name: user.class_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        school_id: user.school_id,
        class_name: user.class_name,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống!' });
  }
});

// GET /api/auth/me - Lấy thông tin người dùng hiện tại
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Chưa đăng nhập!' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute(
      'SELECT id, username, full_name, role, school_id, class_name FROM users WHERE id = ?',
      [decoded.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(403).json({ message: 'Token không hợp lệ!' });
  }
});

export default router;
