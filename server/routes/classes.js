import { Router } from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

function normalizeClassName(value = '') {
  return value.trim().toUpperCase();
}

router.get('/teachers', verifyToken, requireRole('school', 'teacher'), async (req, res) => {
  try {
    const schoolId = req.user.role === 'school' ? req.user.id : req.user.school_id;
    const [rows] = await pool.execute(
      `SELECT id, username, full_name
       FROM users
       WHERE role = 'teacher' AND school_id = ? AND is_active = 1
       ORDER BY full_name`,
      [schoolId]
    );
    res.json({ teachers: rows });
  } catch (err) {
    console.error('Get teachers error:', err);
    res.status(500).json({ message: 'Không thể tải danh sách giáo viên.' });
  }
});

router.get('/', verifyToken, requireRole('school', 'teacher'), async (req, res) => {
  try {
    const schoolId = req.user.role === 'school' ? req.user.id : req.user.school_id;
    const [rows] = await pool.execute(
      `SELECT c.id, c.class_name, c.teacher_id, c.approval_status, c.created_at,
              t.full_name AS teacher_name, t.username AS teacher_username,
              creator.full_name AS created_by_name
       FROM classes c
       LEFT JOIN users t ON t.id = c.teacher_id
       LEFT JOIN users creator ON creator.id = c.created_by
       WHERE c.school_id = ?
       ORDER BY c.class_name`,
      [schoolId]
    );
    res.json({ classes: rows });
  } catch (err) {
    console.error('Get classes error:', err);
    res.status(500).json({ message: 'Không thể tải danh sách lớp.' });
  }
});

router.post('/', verifyToken, requireRole('school', 'teacher'), async (req, res) => {
  try {
    const { class_name, teacher_id } = req.body;
    const normalizedName = normalizeClassName(class_name);

    if (!normalizedName) {
      return res.status(400).json({ message: 'Vui lòng nhập tên lớp.' });
    }

    const creator = req.user;
    const schoolId = creator.role === 'school' ? creator.id : creator.school_id;
    let assignedTeacherId = null;
    let approvalStatus = 'approved';

    if (creator.role === 'school') {
      if (teacher_id) {
        const [teacherRows] = await pool.execute(
          `SELECT id FROM users WHERE id = ? AND role = 'teacher' AND school_id = ?`,
          [teacher_id, schoolId]
        );
        if (teacherRows.length === 0) {
          return res.status(400).json({ message: 'Giáo viên được chọn không hợp lệ.' });
        }
        assignedTeacherId = teacher_id;
      }
    } else {
      assignedTeacherId = creator.id;
      approvalStatus = 'pending';
    }

    const [existing] = await pool.execute(
      'SELECT id FROM classes WHERE school_id = ? AND class_name = ?',
      [schoolId, normalizedName]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Tên lớp đã tồn tại trong trường.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO classes (school_id, class_name, teacher_id, approval_status, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [schoolId, normalizedName, assignedTeacherId, approvalStatus, creator.id]
    );

    res.status(201).json({
      message:
        creator.role === 'teacher'
          ? 'Đã gửi yêu cầu tạo lớp, chờ nhà trường duyệt.'
          : 'Tạo lớp thành công.',
      classId: result.insertId,
    });
  } catch (err) {
    console.error('Create class error:', err);
    res.status(500).json({ message: 'Không thể tạo lớp.' });
  }
});

router.patch('/:id/approval', verifyToken, requireRole('school'), async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const { status, teacher_id } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái duyệt không hợp lệ.' });
    }

    const [classRows] = await pool.execute(
      'SELECT id FROM classes WHERE id = ? AND school_id = ?',
      [classId, req.user.id]
    );
    if (classRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lớp.' });
    }

    let assignedTeacherId = null;
    if (status === 'approved' && teacher_id) {
      const [teacherRows] = await pool.execute(
        `SELECT id FROM users WHERE id = ? AND role = 'teacher' AND school_id = ?`,
        [teacher_id, req.user.id]
      );
      if (teacherRows.length === 0) {
        return res.status(400).json({ message: 'Giáo viên không hợp lệ.' });
      }
      assignedTeacherId = teacher_id;
    }

    await pool.execute(
      'UPDATE classes SET approval_status = ?, teacher_id = COALESCE(?, teacher_id) WHERE id = ?',
      [status, assignedTeacherId, classId]
    );

    res.json({ message: status === 'approved' ? 'Đã duyệt lớp.' : 'Đã từ chối lớp.' });
  } catch (err) {
    console.error('Review class error:', err);
    res.status(500).json({ message: 'Không thể duyệt lớp.' });
  }
});

router.post('/:id/transfer-requests', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const { action, target_teacher_id, note } = req.body;

    if (!['transfer', 'unassign'].includes(action)) {
      return res.status(400).json({ message: 'Hành động không hợp lệ.' });
    }

    if (action === 'transfer' && !target_teacher_id) {
      return res.status(400).json({ message: 'Vui lòng chọn giáo viên nhận lớp.' });
    }

    const [classRows] = await pool.execute(
      `SELECT id, school_id, teacher_id, approval_status
       FROM classes
       WHERE id = ?`,
      [classId]
    );
    if (classRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lớp.' });
    }

    const classRow = classRows[0];
    if (classRow.school_id !== req.user.school_id || classRow.teacher_id !== req.user.id) {
      return res.status(403).json({ message: 'Bạn chỉ được gửi yêu cầu cho lớp mình đang dạy.' });
    }
    if (classRow.approval_status !== 'approved') {
      return res.status(400).json({ message: 'Lớp chưa được duyệt nên chưa thể chuyển giao.' });
    }

    let targetTeacherId = null;
    if (action === 'transfer') {
      const [teacherRows] = await pool.execute(
        `SELECT id FROM users WHERE id = ? AND role = 'teacher' AND school_id = ?`,
        [target_teacher_id, req.user.school_id]
      );
      if (teacherRows.length === 0) {
        return res.status(400).json({ message: 'Giáo viên nhận lớp không hợp lệ.' });
      }
      targetTeacherId = target_teacher_id;
    }

    await pool.execute(
      `INSERT INTO class_transfer_requests
       (class_id, school_id, requested_by_teacher_id, target_teacher_id, action, status, note)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [classId, req.user.school_id, req.user.id, targetTeacherId, action, note?.trim() || null]
    );

    res.status(201).json({ message: 'Đã gửi yêu cầu, chờ nhà trường duyệt.' });
  } catch (err) {
    console.error('Create transfer request error:', err);
    res.status(500).json({ message: 'Không thể gửi yêu cầu.' });
  }
});

router.get('/transfer-requests', verifyToken, requireRole('school', 'teacher'), async (req, res) => {
  try {
    if (req.user.role === 'school') {
      const [rows] = await pool.execute(
        `SELECT r.id, r.class_id, r.action, r.status, r.note, r.created_at,
                c.class_name,
                requester.full_name AS requester_name,
                target.full_name AS target_teacher_name,
                requester.id AS requester_id,
                r.target_teacher_id
         FROM class_transfer_requests r
         JOIN classes c ON c.id = r.class_id
         JOIN users requester ON requester.id = r.requested_by_teacher_id
         LEFT JOIN users target ON target.id = r.target_teacher_id
         WHERE r.school_id = ?
         ORDER BY r.status = 'pending' DESC, r.created_at DESC`,
        [req.user.id]
      );
      return res.json({ requests: rows });
    }

    const [rows] = await pool.execute(
      `SELECT r.id, r.class_id, r.action, r.status, r.note, r.created_at,
              c.class_name,
              target.full_name AS target_teacher_name
       FROM class_transfer_requests r
       JOIN classes c ON c.id = r.class_id
       LEFT JOIN users target ON target.id = r.target_teacher_id
       WHERE r.requested_by_teacher_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    return res.json({ requests: rows });
  } catch (err) {
    console.error('Get transfer requests error:', err);
    res.status(500).json({ message: 'Không thể tải danh sách yêu cầu.' });
  }
});

router.delete('/transfer-requests/:id', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    const [rows] = await pool.execute(
      `SELECT status FROM class_transfer_requests WHERE id = ? AND requested_by_teacher_id = ?`,
      [requestId, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu.' });
    }
    if (rows[0].status !== 'pending') {
      return res.status(400).json({ message: 'Không thể hủy yêu cầu đã được xử lí.' });
    }
    await pool.execute('DELETE FROM class_transfer_requests WHERE id = ?', [requestId]);
    res.json({ message: 'Đã hủy yêu cầu thành công.' });
  } catch (err) {
    console.error('Delete transfer request error:', err);
    res.status(500).json({ message: 'Không thể hủy yêu cầu.' });
  }
});

router.patch('/transfer-requests/:id/review', verifyToken, requireRole('school'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const requestId = Number(req.params.id);
    const { status, review_note } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái duyệt không hợp lệ.' });
    }

    await conn.beginTransaction();

    const [rows] = await conn.execute(
      `SELECT r.id, r.class_id, r.action, r.status, r.target_teacher_id, r.school_id
       FROM class_transfer_requests r
       WHERE r.id = ? FOR UPDATE`,
      [requestId]
    );

    if (rows.length === 0 || rows[0].school_id !== req.user.id) {
      await conn.rollback();
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu.' });
    }

    const request = rows[0];
    if (request.status !== 'pending') {
      await conn.rollback();
      return res.status(400).json({ message: 'Yêu cầu này đã được xử lí trước đó.' });
    }

    if (status === 'approved') {
      if (request.action === 'transfer') {
        await conn.execute('UPDATE classes SET teacher_id = ? WHERE id = ?', [request.target_teacher_id, request.class_id]);
      }
      if (request.action === 'unassign') {
        await conn.execute('UPDATE classes SET teacher_id = NULL WHERE id = ?', [request.class_id]);
      }
    }

    await conn.execute(
      `UPDATE class_transfer_requests
       SET status = ?, review_note = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [status, review_note?.trim() || null, req.user.id, requestId]
    );

    await conn.commit();
    res.json({ message: status === 'approved' ? 'Đã duyệt yêu cầu.' : 'Đã từ chối yêu cầu.' });
  } catch (err) {
    await conn.rollback();
    console.error('Review transfer request error:', err);
    res.status(500).json({ message: 'Không thể duyệt yêu cầu.' });
  } finally {
    conn.release();
  }
});

export default router;
