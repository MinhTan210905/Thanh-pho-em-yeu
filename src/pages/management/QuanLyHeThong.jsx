import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE_LABELS, useAuth } from '../../context/AuthContext';
import './QuanLyHeThong.css';

const NEXT_ROLE = {
  admin: 'school',
  school: 'teacher',
  teacher: 'student',
};

const GAME_LABELS = {
  am_thuc: 'Ẩm thực',
  di_tich: 'Di tích lịch sử',
  dia_li_tu_nhien: 'Địa lí tự nhiên',
  dan_cu: 'Dân cư',
  lang_nghe: 'Làng nghề',
  le_hoi: 'Lễ hội',
  nhan_vat_lich_su: 'Nhân vật lịch sử',
  kinh_te: 'Kinh tế',
  vi_tri: 'Vị trí địa lí',
};

const ALL_GAME_IDS = Object.keys(GAME_LABELS);

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('vi-VN');
}

function toGameLabel(gameId) {
  return GAME_LABELS[gameId] || gameId || '-';
}

/** Lấy tên (chữ cuối) để sắp xếp theo bảng chữ cái VN */
function getLastName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1];
}

function createInitialForm(childRole, role = '') {
  return {
    username: '',
    password: '',
    full_name: '',
    class_name: childRole === 'student' || role === 'admin' ? '' : '',
    target_role: 'school',
    target_school_id: '',
    target_parent_id: '',
  };
}

export default function QuanLyHeThong() {
  const { user, authRequest, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || '';
  const childRole = useMemo(() => NEXT_ROLE[role] || '', [role]);
  const canManageUsers = Boolean(childRole);
  const managedTableLabel = childRole === 'school' ? 'Tên trường' : 'Họ tên';

  const [users, setUsers] = useState([]);
  const [classRows, setClassRows] = useState([]);
  const [classRequests, setClassRequests] = useState([]);
  const [teachersInSchool, setTeachersInSchool] = useState([]);
  const [scoreRows, setScoreRows] = useState([]);
  const [studentRows, setStudentRows] = useState([]);

  const [createForm, setCreateForm] = useState(() => createInitialForm(childRole, role));
  const [classForm, setClassForm] = useState({ class_name: '', teacher_id: '' });
  const [transferDraft, setTransferDraft] = useState({ classId: null, targetTeacherId: '' });
  const [editUserId, setEditUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    class_name: '',
    password: '',
  });

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [showCreatePwd, setShowCreatePwd] = useState(false);
  const [scoreViewMode, setScoreViewMode] = useState('class'); // 'class' | 'history'
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [adminRoleFilter, setAdminRoleFilter] = useState('');
  const [adminSchoolFilter, setAdminSchoolFilter] = useState('');

  // Compute unique class names for filter dropdown
  const availableClasses = useMemo(() => {
    if (role === 'teacher') {
      const names = studentRows.map(s => s.class_name).filter(Boolean);
      return [...new Set(names)].sort();
    }
    const names = scoreRows.map(s => s.class_name).filter(Boolean);
    return [...new Set(names)].sort();
  }, [role, studentRows, scoreRows]);

  // Sort students by Vietnamese last name (tên)
  const sortedStudentRows = useMemo(() => {
    return [...studentRows].sort((a, b) => {
      const nameA = getLastName(a.full_name).toLowerCase();
      const nameB = getLastName(b.full_name).toLowerCase();
      return nameA.localeCompare(nameB, 'vi');
    });
  }, [studentRows]);

  // Group students by class for class-based view
  const classBased = useMemo(() => {
    const map = {};
    const students = classFilter
      ? sortedStudentRows.filter(s => s.class_name === classFilter)
      : sortedStudentRows;
    for (const s of students) {
      const cn = s.class_name || 'Không có lớp';
      if (!map[cn]) map[cn] = [];
      map[cn].push(s);
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], 'vi'));
  }, [sortedStudentRows, classFilter]);

  // Filtered history data
  const filteredScoreRows = useMemo(() => {
    let rows = scoreRows;
    if (classFilter) rows = rows.filter(s => s.class_name === classFilter);
    if (gameFilter) rows = rows.filter(s => s.game_id === gameFilter);
    return rows;
  }, [scoreRows, classFilter, gameFilter]);

  // Build full game status for a student (all 9 games)
  const buildGameStatus = useCallback((student) => {
    return ALL_GAME_IDS.map(gid => {
      const played = student.scores.filter(s => s.game_id === gid);
      if (played.length === 0) {
        return { game_id: gid, played: false, bestScore: null, totalAttempts: 0, lastPlayed: null };
      }
      const bestScore = Math.max(...played.map(p => p.score));
      const totalAttempts = played.reduce((sum, p) => sum + p.attempts, 0);
      const lastPlayed = played.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0]?.completed_at;
      return { game_id: gid, played: true, bestScore, totalAttempts, lastPlayed };
    });
  }, []);

  const clearAlerts = () => {
    setMessage('');
    setError('');
  };

  const handleLogout = () => {
    logout();
    window.scrollTo({ top: 0, behavior: 'auto' });
    navigate('/', { replace: true });
  };

  const loadUsers = useCallback(async () => {
    if (!canManageUsers) {
      setUsers([]);
      return;
    }

    setLoadingUsers(true);
    try {
      const payload = await authRequest('/api/users');
      setUsers(payload.users || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoadingUsers(false);
    }
  }, [authRequest, canManageUsers]);

  const loadScores = useCallback(async () => {
    setLoadingScores(true);
    try {
      if (role === 'student') {
        const payload = await authRequest('/api/scores/my');
        setScoreRows(payload.scores || []);
        setStudentRows([]);
        return;
      }

      if (role === 'teacher') {
        const payload = await authRequest('/api/scores/students');
        setStudentRows(payload.students || []);
        setScoreRows([]);
        return;
      }

      const payload = await authRequest('/api/scores/overview');
      setScoreRows(payload.scores || []);
      setStudentRows([]);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu điểm.');
    } finally {
      setLoadingScores(false);
    }
  }, [authRequest, role]);

  const loadClasses = useCallback(async () => {
    if (role !== 'school' && role !== 'teacher') {
      setClassRows([]);
      setClassRequests([]);
      setTeachersInSchool([]);
      return;
    }

    setLoadingClasses(true);
    try {
      const [classesPayload, requestsPayload, teachersPayload] = await Promise.all([
        authRequest('/api/classes'),
        authRequest('/api/classes/transfer-requests'),
        authRequest('/api/classes/teachers'),
      ]);

      setClassRows(classesPayload.classes || []);
      setClassRequests(requestsPayload.requests || []);
      setTeachersInSchool(teachersPayload.teachers || []);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu lớp học.');
    } finally {
      setLoadingClasses(false);
    }
  }, [authRequest, role]);

  useEffect(() => {
    if (!user) return;

    setCreateForm(createInitialForm(childRole, role));
    loadScores();
    loadUsers();
    loadClasses();
  }, [childRole, loadScores, loadUsers, loadClasses, user]);

  const handleCreateInput = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInput = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassInput = (event) => {
    const { name, value } = event.target;
    setClassForm((prev) => ({ ...prev, [name]: value }));
  };

  const closeTransferModal = () => {
    setTransferDraft({ classId: null, targetTeacherId: '' });
  };

  const openTransferModal = (classId) => {
    setTransferDraft({ classId, targetTeacherId: '' });
  };

  const handleTransferDraftChange = (event) => {
    setTransferDraft((prev) => ({ ...prev, targetTeacherId: event.target.value }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (!childRole && role !== 'admin') return;

    clearAlerts();
    setSubmitting(true);

    try {
      const payload = {
        username: createForm.username.trim(),
        password: createForm.password,
        full_name: createForm.full_name.trim(),
      };

      if (role === 'admin') {
        payload.target_role = createForm.target_role;
        payload.target_school_id = createForm.target_school_id ? Number(createForm.target_school_id) : null;
        payload.target_parent_id = createForm.target_parent_id ? Number(createForm.target_parent_id) : null;
        if (createForm.target_role === 'student') {
          payload.class_name = createForm.class_name.trim();
        }
      } else if (childRole === 'student') {
        payload.class_name = createForm.class_name.trim();
      }

      const response = await authRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setMessage(response.message || 'Tạo tài khoản thành công.');
      setCreateForm(createInitialForm(childRole, role));
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Không thể tạo tài khoản.');
    } finally {
      setSubmitting(false);
    }
  };

  const beginEdit = (managedUser) => {
    clearAlerts();
    setEditUserId(managedUser.id);
    setEditForm({
      full_name: managedUser.full_name || '',
      class_name: managedUser.class_name || '',
      password: '',
    });
  };

  const cancelEdit = () => {
    setEditUserId(null);
    setEditForm({ full_name: '', class_name: '', password: '' });
  };

  const handleSaveEdit = async (userId) => {
    clearAlerts();
    setSubmitting(true);

    try {
      const payload = {
        full_name: editForm.full_name.trim(),
      };

      if (childRole === 'student') {
        payload.class_name = editForm.class_name.trim();
      }

      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      const response = await authRequest(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setMessage(response.message || 'Cập nhật tài khoản thành công.');
      cancelEdit();
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Không thể cập nhật tài khoản.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    clearAlerts();
    const confirmed = window.confirm('Bạn có chắc muốn xóa tài khoản này?');
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const response = await authRequest(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      setMessage(response.message || 'Xóa tài khoản thành công.');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Không thể xóa tài khoản.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateClass = async (event) => {
    event.preventDefault();
    if (role !== 'school' && role !== 'teacher') return;

    clearAlerts();
    setSubmitting(true);
    try {
      const payload = {
        class_name: classForm.class_name.trim(),
      };

      if (role === 'school' && classForm.teacher_id) {
        payload.teacher_id = Number(classForm.teacher_id);
      }

      const response = await authRequest('/api/classes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setMessage(response.message || 'Tạo lớp thành công.');
      setClassForm({ class_name: '', teacher_id: '' });
      await loadClasses();
    } catch (err) {
      setError(err.message || 'Không thể tạo lớp.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewClass = async (classId, status) => {
    if (role !== 'school') return;

    clearAlerts();
    setSubmitting(true);
    try {
      const response = await authRequest(`/api/classes/${classId}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessage(response.message || 'Đã cập nhật trạng thái lớp.');
      await loadClasses();
    } catch (err) {
      setError(err.message || 'Không thể duyệt lớp.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestUnassign = async (classId) => {
    if (role !== 'teacher') return;

    clearAlerts();
    setSubmitting(true);
    try {
      const response = await authRequest(`/api/classes/${classId}/transfer-requests`, {
        method: 'POST',
        body: JSON.stringify({ action: 'unassign' }),
      });
      setMessage(response.message || 'Đã gửi yêu cầu rời lớp.');
      await loadClasses();
    } catch (err) {
      setError(err.message || 'Không thể gửi yêu cầu rời lớp.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestTransfer = async () => {
    if (role !== 'teacher' || !transferDraft.classId) return;
    if (!transferDraft.targetTeacherId) {
      setError('Vui lòng chọn giáo viên nhận lớp.');
      return;
    }

    clearAlerts();
    setSubmitting(true);
    try {
      const response = await authRequest(`/api/classes/${transferDraft.classId}/transfer-requests`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'transfer',
          target_teacher_id: Number(transferDraft.targetTeacherId),
        }),
      });
      setMessage(response.message || 'Đã gửi yêu cầu chuyển lớp.');
      closeTransferModal();
      await loadClasses();
    } catch (err) {
      setError(err.message || 'Không thể chuyển giao lớp.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTransferRequest = async (requestId) => {
    if (role !== 'teacher') return;
    
    if (!window.confirm('Bạn có chắc chắn muốn hủy yêu cầu này?')) return;

    clearAlerts();
    setSubmitting(true);
    try {
      const response = await authRequest(`/api/classes/transfer-requests/${requestId}`, {
        method: 'DELETE',
      });
      setMessage(response.message || 'Đã hủy yêu cầu thành công.');
      await loadClasses();
    } catch (err) {
      setError(err.message || 'Không thể hủy yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewTransfer = async (requestId, status) => {
    if (role !== 'school') return;

    clearAlerts();
    setSubmitting(true);
    try {
      const response = await authRequest(`/api/classes/transfer-requests/${requestId}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessage(response.message || 'Đã xử lí yêu cầu chuyển lớp.');
      await loadClasses();
    } catch (err) {
      setError(err.message || 'Không thể xử lí yêu cầu chuyển lớp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="ql-page">
      <div className="ql-shell">
        <div className="ql-head">
          <div className="ql-head-content">
            <span className="ql-head-tag">Trang quản lí</span>
            <h1>Quản lí tài khoản và kết quả học tập</h1>
            <p>
              Bạn đang đăng nhập với vai trò <strong><span className={`badge-role badge-${role}`}>{ROLE_LABELS[role] || role}</span></strong>.
            </p>
          </div>

          <div className="ql-head-actions">
            <button type="button" className="ql-btn-home" onClick={() => navigate('/')}>
              <i className="fa-solid fa-house"></i> Về trang chính
            </button>
            <button type="button" className="ql-btn-refresh" onClick={() => { clearAlerts(); loadScores(); loadUsers(); loadClasses(); }}>
              <i className="fa-solid fa-rotate-right"></i> Làm mới dữ liệu
            </button>
            <button type="button" className="ql-btn-logout" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
            </button>
          </div>
        </div>

        {message ? <div className="ql-alert success"><i className="fa-solid fa-circle-check"></i> {message}</div> : null}
        {error ? <div className="ql-alert error"><i className="fa-solid fa-circle-exclamation"></i> {error}</div> : null}

        <div className="ql-grid">
          <article className="ql-card">
            <h2>Thông tin tài khoản</h2>
            <dl className="ql-profile-grid">
              <div>
                <dt>Họ tên</dt>
                <dd>{user?.full_name || '-'}</dd>
              </div>
              <div>
                <dt>Tên đăng nhập</dt>
                <dd>{user?.username || '-'}</dd>
              </div>
              <div>
                <dt>Vai trò</dt>
                <dd><span className={`badge-role badge-${user?.role}`}>{ROLE_LABELS[user?.role] || user?.role || '-'}</span></dd>
              </div>
              <div>
                <dt>Lớp</dt>
                <dd>{user?.class_name || '-'}</dd>
              </div>
              <div>
                <dt>School ID</dt>
                <dd>{user?.school_id || '-'}</dd>
              </div>
            </dl>
          </article>

          {canManageUsers || role === 'admin' ? (
            <article className="ql-card ql-card-wide">
              <h2>Tạo tài khoản {role === 'admin' ? '' : (ROLE_LABELS[childRole] || childRole)}</h2>
              <form className="ql-create-form" onSubmit={handleCreateUser}>
                {role === 'admin' && (
                  <select name="target_role" value={createForm.target_role} onChange={handleCreateInput} required>
                    <option value="school">Trường học</option>
                    <option value="teacher">Giáo viên</option>
                    <option value="student">Học sinh</option>
                  </select>
                )}
                {role === 'admin' && (createForm.target_role === 'teacher' || createForm.target_role === 'student') && (
                  <select name="target_school_id" value={createForm.target_school_id} onChange={handleCreateInput} required>
                    <option value="">Chọn trường thuộc về</option>
                    {users.filter(u => u.role === 'school').map(s => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                )}
                {role === 'admin' && createForm.target_role === 'student' && (
                  <select name="target_parent_id" value={createForm.target_parent_id} onChange={handleCreateInput} required>
                    <option value="">Chọn giáo viên phụ trách</option>
                    {users.filter(u => u.role === 'teacher' && u.school_id === Number(createForm.target_school_id)).map(t => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                )}
                <input
                  name="full_name"
                  value={createForm.full_name}
                  onChange={handleCreateInput}
                  placeholder={(childRole === 'school' || createForm.target_role === 'school') ? 'Tên trường' : 'Họ và tên'}
                  required
                />
                <input
                  name="username"
                  value={createForm.username}
                  onChange={handleCreateInput}
                  placeholder="Tên đăng nhập"
                  required
                />
                <div className="ql-pwd-field">
                  <input
                    name="password"
                    value={createForm.password}
                    onChange={handleCreateInput}
                    type={showCreatePwd ? 'text' : 'password'}
                    placeholder="Mật khẩu"
                    required
                  />
                  <button
                    type="button"
                    className="ql-pwd-toggle"
                    onClick={() => setShowCreatePwd(v => !v)}
                    title={showCreatePwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <i className={`fa-solid ${showCreatePwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {childRole === 'student' || (role === 'admin' && createForm.target_role === 'student') ? (
                  <input
                    name="class_name"
                    value={createForm.class_name}
                    onChange={handleCreateInput}
                    placeholder="Lớp học (vd: 5A)"
                  />
                ) : null}

                <button type="submit" disabled={submitting}>
                  {submitting ? 'Đang xử lí...' : `Tạo tài khoản`}
                </button>
              </form>

              {role === 'admin' && (
                <div className="ql-filter-bar">
                  <label><i className="fa-solid fa-filter"></i> Lọc Vai trò:</label>
                  <select value={adminRoleFilter} onChange={e => setAdminRoleFilter(e.target.value)}>
                    <option value="">Tất cả vai trò</option>
                    <option value="school">Trường học</option>
                    <option value="teacher">Giáo viên</option>
                    <option value="student">Học sinh</option>
                  </select>
                  
                  <label><i className="fa-solid fa-building"></i> Lọc Trường:</label>
                  <select value={adminSchoolFilter} onChange={e => setAdminSchoolFilter(e.target.value)}>
                    <option value="">Tất cả trường</option>
                    {users.filter(u => u.role === 'school').map(s => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="ql-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{role === 'admin' ? 'Họ tên / Tên trường' : managedTableLabel}</th>
                      <th>Tài khoản</th>
                      <th>Vai trò</th>
                      {role === 'admin' && <th>Thuộc trường</th>}
                      <th>Lớp</th>
                      <th>Ngày tạo</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr>
                        <td colSpan="6">Đang tải danh sách tài khoản...</td>
                      </tr>
                    ) : null}

                    {!loadingUsers && users.length === 0 ? (
                      <tr>
                        <td colSpan="6">Chưa có tài khoản con nào.</td>
                      </tr>
                    ) : null}

                    {!loadingUsers
                      ? users
                        .filter(u => !adminRoleFilter || u.role === adminRoleFilter)
                        .filter(u => !adminSchoolFilter || u.school_id === Number(adminSchoolFilter) || u.id === Number(adminSchoolFilter))
                        .map((managedUser) => {
                        const isEditing = editUserId === managedUser.id;
                        return (
                          <tr key={managedUser.id}>
                            <td>
                              {isEditing ? (
                                <input
                                  name="full_name"
                                  value={editForm.full_name}
                                  onChange={handleEditInput}
                                />
                              ) : (
                                managedUser.full_name || '-'
                              )}
                            </td>
                            <td>{managedUser.username}</td>
                            <td><span className={`badge-role badge-${managedUser.role}`}>{ROLE_LABELS[managedUser.role] || managedUser.role}</span></td>
                            {role === 'admin' && <td>{managedUser.role === 'school' ? '-' : (users.find(u => u.id === managedUser.school_id)?.full_name || '-')}</td>}
                            <td>
                              {isEditing && (childRole === 'student' || (role === 'admin' && managedUser.role === 'student')) ? (
                                <input
                                  name="class_name"
                                  value={editForm.class_name}
                                  onChange={handleEditInput}
                                />
                              ) : (
                                managedUser.class_name || '-'
                              )}
                            </td>
                            <td>{formatDate(managedUser.created_at)}</td>
                            <td className="ql-actions-cell">
                              {isEditing ? (
                                <>
                                  <input
                                    name="password"
                                    type="password"
                                    value={editForm.password}
                                    onChange={handleEditInput}
                                    placeholder="Mật khẩu mới (tuỳ chọn)"
                                  />
                                  <button type="button" onClick={() => handleSaveEdit(managedUser.id)}>
                                    Lưu
                                  </button>
                                  <button type="button" className="ghost" onClick={cancelEdit}>
                                    Hủy
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button type="button" onClick={() => beginEdit(managedUser)}>
                                    Sửa
                                  </button>
                                  <button
                                    type="button"
                                    className="danger"
                                    onClick={() => handleDelete(managedUser.id)}
                                  >
                                    Xóa
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                      : null}
                  </tbody>
                </table>
              </div>
            </article>
          ) : null}

          {(role === 'school' || role === 'teacher') ? (
            <article className="ql-card ql-card-wide">
              <h2>Quản lí lớp học</h2>

              <form className="ql-create-form" onSubmit={handleCreateClass}>
                <input
                  name="class_name"
                  value={classForm.class_name}
                  onChange={handleClassInput}
                  placeholder="Tên lớp (vd: 5A)"
                  required
                />

                {role === 'school' ? (
                  <select
                    name="teacher_id"
                    value={classForm.teacher_id}
                    onChange={handleClassInput}
                  >
                    <option value="">Chọn giáo viên phụ trách (tuỳ chọn)</option>
                    {teachersInSchool.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>{teacher.full_name} ({teacher.username})</option>
                    ))}
                  </select>
                ) : null}

                <button type="submit" disabled={submitting}>
                  {role === 'school' ? 'Tạo lớp' : 'Gửi yêu cầu tạo lớp'}
                </button>
              </form>

              <div className="ql-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Lớp</th>
                      <th>Giáo viên phụ trách</th>
                      <th>Trạng thái duyệt</th>
                      <th>Người tạo</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingClasses ? (
                      <tr>
                        <td colSpan="5">Đang tải dữ liệu lớp...</td>
                      </tr>
                    ) : null}

                    {!loadingClasses && classRows.length === 0 ? (
                      <tr>
                        <td colSpan="5">Chưa có lớp nào.</td>
                      </tr>
                    ) : null}

                    {!loadingClasses ? classRows.map((classRow) => (
                      <tr key={classRow.id}>
                        <td>{classRow.class_name}</td>
                        <td>{classRow.teacher_name || '-'}</td>
                        <td><span className={`badge-status badge-status-${classRow.approval_status}`}>{classRow.approval_status === 'pending' ? 'Chờ duyệt' : classRow.approval_status === 'approved' ? 'Đã duyệt' : classRow.approval_status === 'rejected' ? 'Từ chối' : classRow.approval_status}</span></td>
                        <td>{classRow.created_by_name || '-'}</td>
                        <td className="ql-actions-cell">
                          {role === 'school' && classRow.approval_status === 'pending' ? (
                            <>
                              <button type="button" onClick={() => handleReviewClass(classRow.id, 'approved')}>Duyệt</button>
                              <button type="button" className="danger" onClick={() => handleReviewClass(classRow.id, 'rejected')}>Từ chối</button>
                            </>
                          ) : null}

                          {role === 'teacher' && classRow.teacher_id === user?.id && classRow.approval_status === 'approved' ? (
                            <>
                              <button type="button" onClick={() => openTransferModal(classRow.id)}>Xin chuyển lớp</button>
                              <button type="button" className="ghost" onClick={() => handleRequestUnassign(classRow.id)}>Xin rời lớp</button>
                            </>
                          ) : null}
                        </td>
                      </tr>
                    )) : null}
                  </tbody>
                </table>
              </div>

              <h2 style={{ marginTop: '24px' }}>Yêu cầu chuyển/rời lớp</h2>
              <div className="ql-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Lớp</th>
                      <th>Yêu cầu</th>
                      <th>Người gửi</th>
                      <th>Giáo viên nhận lớp</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingClasses ? (
                      <tr>
                        <td colSpan="6">Đang tải yêu cầu...</td>
                      </tr>
                    ) : null}

                    {!loadingClasses && classRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6">Chưa có yêu cầu chuyển/rời lớp.</td>
                      </tr>
                    ) : null}

                    {!loadingClasses ? classRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.class_name}</td>
                        <td>{request.action === 'transfer' ? 'Chuyển lớp' : 'Rời lớp'}</td>
                        <td>{request.requester_name || '-'}</td>
                        <td>{request.target_teacher_name || '-'}</td>
                        <td><span className={`badge-status badge-status-${request.status}`}>{request.status === 'pending' ? 'Chờ duyệt' : request.status === 'approved' ? 'Đã duyệt' : request.status === 'rejected' ? 'Từ chối' : request.status}</span></td>
                        <td className="ql-actions-cell">
                          {role === 'school' && request.status === 'pending' ? (
                            <>
                              <button type="button" onClick={() => handleReviewTransfer(request.id, 'approved')}>Duyệt</button>
                              <button type="button" className="danger" onClick={() => handleReviewTransfer(request.id, 'rejected')}>Từ chối</button>
                            </>
                          ) : null}
                          {role === 'teacher' && request.status === 'pending' ? (
                            <button type="button" className="ghost danger" onClick={() => handleCancelTransferRequest(request.id)}>Hủy yêu cầu</button>
                          ) : null}
                        </td>
                      </tr>
                    )) : null}
                  </tbody>
                </table>
              </div>
            </article>
          ) : null}

          <article className="ql-card ql-card-wide">
            <h2>Kết quả học tập</h2>

            {/* Tab switcher */}
            {role !== 'student' ? (
              <div className="ql-score-tabs">
                <button
                  type="button"
                  className={`ql-score-tab ${scoreViewMode === 'class' ? 'active' : ''}`}
                  onClick={() => setScoreViewMode('class')}
                >
                  <i className="fa-solid fa-users"></i> Theo lớp
                </button>
                <button
                  type="button"
                  className={`ql-score-tab ${scoreViewMode === 'history' ? 'active' : ''}`}
                  onClick={() => setScoreViewMode('history')}
                >
                  <i className="fa-solid fa-clock-rotate-left"></i> Lịch sử
                </button>
              </div>
            ) : null}

            {/* Filters */}
            {!loadingScores ? (
              <div className="ql-filter-bar">
                {availableClasses.length > 0 ? (
                  <>
                    <label><i className="fa-solid fa-filter"></i> Lớp:</label>
                    <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                      <option value="">Tất cả lớp</option>
                      {availableClasses.map(cn => (
                        <option key={cn} value={cn}>{cn}</option>
                      ))}
                    </select>
                  </>
                ) : null}
                {scoreViewMode === 'history' && role !== 'student' ? (
                  <>
                    <label><i className="fa-solid fa-gamepad"></i> Trò chơi:</label>
                    <select value={gameFilter} onChange={(e) => setGameFilter(e.target.value)}>
                      <option value="">Tất cả trò chơi</option>
                      {ALL_GAME_IDS.map(gid => (
                        <option key={gid} value={gid}>{toGameLabel(gid)}</option>
                      ))}
                    </select>
                  </>
                ) : null}
              </div>
            ) : null}

            {loadingScores ? <p>Đang tải dữ liệu điểm...</p> : null}

            {/* ─── CLASS VIEW (teacher) ─── */}
            {!loadingScores && role === 'teacher' && scoreViewMode === 'class' ? (
              <div className="ql-class-view">
                {classBased.length === 0 ? <p>Chưa có học sinh.</p> : null}
                {classBased.map(([className, students]) => (
                  <div className="ql-class-section" key={className}>
                    <div className="ql-class-header">
                      <i className="fa-solid fa-chalkboard"></i>
                      <span>Lớp {className}</span>
                      <span className="ql-class-count">{students.length} học sinh</span>
                    </div>
                    <div className="ql-student-list">
                      {students.map((student) => (
                        <div className="ql-student-card" key={student.id}>
                          <div
                            className={`ql-student-card-head ${expandedStudentId === student.id ? 'expanded' : ''}`}
                            onClick={() => setExpandedStudentId(prev => prev === student.id ? null : student.id)}
                          >
                            <div className="ql-student-avatar">
                              {getLastName(student.full_name)?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="ql-student-info">
                              <span className="ql-student-name">{student.full_name}</span>
                              <span className="ql-student-meta">
                                {student.scores.length} lượt chơi
                                {student.scores.length > 0 ? ` · Cao nhất: ${Math.max(...student.scores.map(s => s.score))} điểm · TB: ${(student.scores.reduce((sum, s) => sum + s.score, 0) / student.scores.length).toFixed(1)} điểm` : ''}
                              </span>
                            </div>
                            <i className={`fa-solid fa-chevron-${expandedStudentId === student.id ? 'up' : 'down'}`}></i>
                          </div>

                          {expandedStudentId === student.id ? (
                            <div className="ql-student-detail">
                              <div className="ql-game-grid">
                                {buildGameStatus(student).map(g => (
                                  <div className={`ql-game-item ${g.played ? 'played' : 'not-played'}`} key={g.game_id}>
                                    <div className="ql-game-item-head">
                                      <span className="ql-game-item-name">{toGameLabel(g.game_id)}</span>
                                      <span className={`ql-game-item-badge ${g.played ? 'yes' : 'no'}`}>
                                        {g.played ? 'Đã chơi' : 'Chưa chơi'}
                                      </span>
                                    </div>
                                    {g.played ? (
                                      <div className="ql-game-item-stats">
                                        <span><strong>{g.bestScore}</strong> điểm</span>
                                        <span>{g.totalAttempts} lượt</span>
                                        <span>{formatDate(g.lastPlayed)}</span>
                                      </div>
                                    ) : (
                                      <div className="ql-game-item-stats muted">Chưa có dữ liệu</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* ─── HISTORY VIEW (teacher) ─── */}
            {!loadingScores && role === 'teacher' && scoreViewMode === 'history' ? (
              <div className="ql-student-groups">
                {sortedStudentRows.length === 0 ? <p>Chưa có học sinh hoặc chưa có điểm.</p> : null}
                {(classFilter ? sortedStudentRows.filter(s => s.class_name === classFilter) : sortedStudentRows).map((student) => (
                  <div className="ql-student-block" key={student.id}>
                    <h3>
                      {student.full_name} {student.class_name ? `(${student.class_name})` : ''}
                    </h3>
                    {(() => {
                      const filtered = gameFilter
                        ? student.scores.filter(s => s.game_id === gameFilter)
                        : student.scores;
                      return filtered.length === 0 ? (
                        <p>Không có dữ liệu phù hợp.</p>
                      ) : (
                        <div className="ql-table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Game</th>
                                <th>Điểm</th>
                                <th>Lượt</th>
                                <th>Thời gian</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.map((score, index) => (
                                <tr key={`${student.id}-${score.game_id}-${index}`}>
                                  <td>{toGameLabel(score.game_id)}</td>
                                  <td>{score.score}</td>
                                  <td>{score.attempts}</td>
                                  <td>{formatDate(score.completed_at)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            ) : null}

            {/* ─── NON-TEACHER VIEW (admin/school/student) ─── */}
            {!loadingScores && role !== 'teacher' ? (
              <div className="ql-table-wrap">
                <table>
                  <thead>
                    <tr>
                      {role !== 'student' ? <th>Học sinh</th> : null}
                      {role !== 'student' ? <th>Lớp</th> : null}
                      <th>Game</th>
                      <th>Điểm</th>
                      <th>Lượt</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScoreRows.length === 0 ? (
                      <tr>
                        <td colSpan={role === 'student' ? 4 : 6}>Chưa có dữ liệu điểm.</td>
                      </tr>
                    ) : (
                      filteredScoreRows.map((score, index) => (
                        <tr key={`${score.game_id || 'game'}-${score.completed_at || index}-${index}`}>
                          {role !== 'student' ? <td>{score.full_name || '-'}</td> : null}
                          {role !== 'student' ? <td>{score.class_name || '-'}</td> : null}
                          <td>{toGameLabel(score.game_id)}</td>
                          <td>{score.score}</td>
                          <td>{score.attempts}</td>
                          <td>{formatDate(score.completed_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : null}
          </article>
        </div>

        {transferDraft.classId ? (
          <div className="ql-modal-overlay" role="dialog" aria-modal="true">
            <div className="ql-modal-card">
              <h3>Chuyển lớp cho giáo viên khác</h3>
              <p>Chọn giáo viên nhận lớp. Yêu cầu này sẽ chờ nhà trường duyệt.</p>
              <select value={transferDraft.targetTeacherId} onChange={handleTransferDraftChange}>
                <option value="">Chọn giáo viên</option>
                {teachersInSchool
                  .filter((teacher) => teacher.id !== user?.id)
                  .map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name} ({teacher.username})
                    </option>
                  ))}
              </select>
              <div className="ql-modal-actions">
                <button type="button" onClick={handleRequestTransfer} disabled={submitting}>
                  Gửi yêu cầu
                </button>
                <button type="button" className="ghost" onClick={closeTransferModal}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
