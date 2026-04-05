import { Router } from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// POST /api/scores - Học sinh lưu điểm sau khi chơi game
router.post('/', verifyToken, requireRole('student'), async (req, res) => {
  try {
    const { game_id, score, attempts } = req.body;
    const userId = req.user.id;

    if (!game_id || score === undefined) {
      return res.status(400).json({ message: 'Thiếu thông tin game_id hoặc score!' });
    }

    await pool.execute(
      'INSERT INTO game_scores (user_id, game_id, score, attempts) VALUES (?, ?, ?, ?)',
      [userId, game_id, score, attempts || 1]
    );

    res.status(201).json({ message: 'Lưu điểm thành công!' });
  } catch (err) {
    console.error('Save score error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống!' });
  }
});

// GET /api/scores/my - Học sinh xem điểm của mình
router.get('/my', verifyToken, requireRole('student'), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT game_id, score, attempts, completed_at FROM game_scores WHERE user_id = ? ORDER BY completed_at DESC',
      [req.user.id]
    );
    res.json({ scores: rows });
  } catch (err) {
    console.error('Get my scores error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống!' });
  }
});

// GET /api/scores/students - Giáo viên xem điểm của học sinh mình quản lí
router.get('/students', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id as student_id, u.full_name, u.class_name, 
              gs.game_id, gs.score, gs.attempts, gs.completed_at
       FROM users u
       LEFT JOIN game_scores gs ON u.id = gs.user_id
       WHERE u.parent_id = ? AND u.role = 'student'
       ORDER BY u.full_name, gs.completed_at DESC`,
      [req.user.id]
    );

    // Gom theo học sinh
    const studentsMap = {};
    rows.forEach(row => {
      if (!studentsMap[row.student_id]) {
        studentsMap[row.student_id] = {
          id: row.student_id,
          full_name: row.full_name,
          class_name: row.class_name,
          scores: []
        };
      }
      if (row.game_id) {
        studentsMap[row.student_id].scores.push({
          game_id: row.game_id,
          score: row.score,
          attempts: row.attempts,
          completed_at: row.completed_at
        });
      }
    });

    res.json({ students: Object.values(studentsMap) });
  } catch (err) {
    console.error('Get student scores error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống!' });
  }
});

// GET /api/scores/overview - Admin/School xem tổng quan điểm
router.get('/overview', verifyToken, requireRole('admin', 'school'), async (req, res) => {
  try {
    let query, params;

    if (req.user.role === 'admin') {
      query = `SELECT u.full_name, u.class_name, u.school_id, gs.game_id, gs.score, gs.attempts, gs.completed_at
               FROM game_scores gs
               JOIN users u ON gs.user_id = u.id
               ORDER BY gs.completed_at DESC
               LIMIT 100`;
      params = [];
    } else {
      // School chỉ xem điểm học sinh thuộc trường mình
      query = `SELECT u.full_name, u.class_name, gs.game_id, gs.score, gs.attempts, gs.completed_at
               FROM game_scores gs
               JOIN users u ON gs.user_id = u.id
               WHERE u.school_id = ?
               ORDER BY gs.completed_at DESC
               LIMIT 100`;
      params = [req.user.id];
    }

    const [rows] = await pool.execute(query, params);
    res.json({ scores: rows });
  } catch (err) {
    console.error('Get overview scores error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống!' });
  }
});

export default router;
