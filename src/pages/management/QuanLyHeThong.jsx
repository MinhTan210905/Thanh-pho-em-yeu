import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import './QuanLyHeThong.css';

const NEXT_ROLE = {
  admin: 'school',
  school: 'teacher',
  teacher: 'student',
};

/** These labels should now be retrieved via t() for dynamic localization */
const getGameLabels = (t) => ({
  am_thuc: t("learning_page.quiz.games.am_thuc.title"),
  di_tich: t("learning_page.quiz.games.di_tich.title"),
  dia_li_tu_nhien: t("learning_page.quiz.games.tu_nhien.title"),
  dan_cu: t("learning_page.quiz.games.dan_cu.title"),
  lang_nghe: t("learning_page.quiz.games.lang_nghe.title"),
  le_hoi: t("learning_page.quiz.games.le_hoi.title"),
  nhan_vat_lich_su: t("learning_page.quiz.games.nhan_vat.title"),
  kinh_te: t("learning_page.quiz.games.kinh_te.title"),
  vi_tri: t("learning_page.quiz.games.vi_tri.title"),
});

const ALL_GAME_IDS = ['am_thuc', 'di_tich', 'dia_li_tu_nhien', 'dan_cu', 'lang_nghe', 'le_hoi', 'nhan_vat_lich_su', 'kinh_te', 'vi_tri'];

function formatDate(value, i18n) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
}

function toGameLabel(gameId, t) {
  const gameKey = gameId.replace('dia_li_tu_nhien', 'tu_nhien').replace('nhan_vat_lich_su', 'nhan_vat');
  return t(`learning_page.quiz.games.${gameKey}.title`, { defaultValue: gameId || '-' });
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
  const { t, i18n } = useTranslation();

  const role = user?.role || '';
  const childRole = useMemo(() => NEXT_ROLE[role] || '', [role]);
  const canManageUsers = Boolean(childRole);
  const managedTableLabel = childRole === 'school' ? t("management_page.users.placeholder_school_name") : t("management_page.users.placeholder_full_name");

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
      const cn = s.class_name || (i18n.language === 'en' ? 'No class' : 'Không có lớp');
      if (!map[cn]) map[cn] = [];
      map[cn].push(s);
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], i18n.language));
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
      setError(err.message || t("management_page.alerts.load_users_error"));
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
      setError(err.message || t("management_page.alerts.load_scores_error"));
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
      setError(err.message || t("management_page.alerts.load_classes_error"));
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

      setMessage(response.message || t("management_page.alerts.create_user_success"));
      setCreateForm(createInitialForm(childRole, role));
      await loadUsers();
    } catch (err) {
      setError(err.message || t("management_page.alerts.create_user_error"));
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

      setMessage(response.message || t("management_page.alerts.update_user_success"));
      cancelEdit();
      await loadUsers();
    } catch (err) {
      setError(err.message || t("management_page.alerts.update_user_error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    clearAlerts();
    const confirmed = window.confirm(t("management_page.alerts.delete_confirm"));
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const response = await authRequest(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      setMessage(response.message || t("management_page.alerts.delete_success"));
      await loadUsers();
    } catch (err) {
      setError(err.message || t("management_page.alerts.delete_error"));
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

      setMessage(response.message || t("management_page.alerts.create_class_success"));
      setClassForm({ class_name: '', teacher_id: '' });
      await loadClasses();
    } catch (err) {
      setError(err.message || t("management_page.alerts.create_class_error"));
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
      setMessage(response.message || t("management_page.alerts.approve_class_success"));
      await loadClasses();
    } catch (err) {
      setError(err.message || t("management_page.alerts.approve_class_error"));
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
      setMessage(response.message || t("management_page.alerts.request_unassign_success"));
      await loadClasses();
    } catch (err) {
      setError(err.message || t("management_page.alerts.request_unassign_error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestTransfer = async () => {
    if (role !== 'teacher' || !transferDraft.classId) return;
    if (!transferDraft.targetTeacherId) {
      setError(t("management_page.transfer_modal.select_teacher"));
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
      setMessage(response.message || t("management_page.alerts.request_transfer_success"));
      closeTransferModal();
      await loadClasses();
    } catch (err) {
      setError(err.message || t("management_page.alerts.request_transfer_error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTransferRequest = async (requestId) => {
    if (role !== 'teacher') return;
    
    if (!window.confirm(t("management_page.alerts.cancel_request_confirm"))) return;

    clearAlerts();
    setSubmitting(true);
    try {
      const response = await authRequest(`/api/classes/transfer-requests/${requestId}`, {
        method: 'DELETE',
      });
      setMessage(response.message || t("management_page.alerts.cancel_request_success"));
      await loadClasses();
    } catch (err) {
      setError(err.message || t("management_page.alerts.cancel_request_error"));
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
      setMessage(response.message || t("management_page.alerts.review_transfer_success"));
      await loadClasses();
    } catch (err) {
      setError(err.message || t("management_page.alerts.review_transfer_error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="ql-page">
      <div className="ql-shell">
        <div className="ql-head">
          <div className="ql-head-content">
            <span className="ql-head-tag">{t("management_page.breadcrumb")}</span>
            <h1>{t("management_page.title")}</h1>
            <p>
              {t("management_page.role_badge")} <strong><span className={`badge-role badge-${role}`}>{t(`common.roles.${role}`)}</span></strong>.
            </p>
          </div>

          <div className="ql-head-actions">
            <button type="button" className="ql-btn-home" onClick={() => navigate('/')}>
              <i className="fa-solid fa-house"></i> {t("management_page.btn_home")}
            </button>
            <button type="button" className="ql-btn-refresh" onClick={() => { clearAlerts(); loadScores(); loadUsers(); loadClasses(); }}>
              <i className="fa-solid fa-rotate-right"></i> {t("management_page.btn_refresh")}
            </button>
            <button type="button" className="ql-btn-logout" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> {t("management_page.btn_logout")}
            </button>
          </div>
        </div>

        {message ? <div className="ql-alert success"><i className="fa-solid fa-circle-check"></i> {message}</div> : null}
        {error ? <div className="ql-alert error"><i className="fa-solid fa-circle-exclamation"></i> {error}</div> : null}

        <div className="ql-grid">
          <article className="ql-card">
            <h2>{t("management_page.profile.title")}</h2>
            <dl className="ql-profile-grid">
              <div>
                <dt>{t("management_page.profile.full_name")}</dt>
                <dd>{user?.full_name || '-'}</dd>
              </div>
              <div>
                <dt>{t("management_page.profile.username")}</dt>
                <dd>{user?.username || '-'}</dd>
              </div>
              <div>
                <dt>{t("management_page.profile.role")}</dt>
                <dd><span className={`badge-role badge-${user?.role}`}>{t(`common.roles.${user?.role}`)}</span></dd>
              </div>
              <div>
                <dt>{t("management_page.profile.class")}</dt>
                <dd>{user?.class_name || '-'}</dd>
              </div>
              <div>
                <dt>{t("management_page.profile.school_id")}</dt>
                <dd>{user?.school_id || '-'}</dd>
              </div>
            </dl>
          </article>

          {canManageUsers || role === 'admin' ? (
            <article className="ql-card ql-card-wide">
              <h2>{t("management_page.users.create_title", { role: role === 'admin' ? '' : t(`common.roles.${childRole}`) })}</h2>
              <form className="ql-create-form" onSubmit={handleCreateUser}>
                {role === 'admin' && (
                  <select name="target_role" value={createForm.target_role} onChange={handleCreateInput} required>
                    <option value="school">{t("common.roles.school")}</option>
                    <option value="teacher">{t("common.roles.teacher")}</option>
                    <option value="student">{t("common.roles.student")}</option>
                  </select>
                )}
                {role === 'admin' && (createForm.target_role === 'teacher' || createForm.target_role === 'student') && (
                  <select name="target_school_id" value={createForm.target_school_id} onChange={handleCreateInput} required>
                    <option value="">{t("management_page.users.select_school")}</option>
                    {users.filter(u => u.role === 'school').map(s => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                )}
                {role === 'admin' && createForm.target_role === 'student' && (
                  <select name="target_parent_id" value={createForm.target_parent_id} onChange={handleCreateInput} required>
                    <option value="">{t("management_page.users.select_teacher")}</option>
                    {users.filter(u => u.role === 'teacher' && u.school_id === Number(createForm.target_school_id)).map(t => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                )}
                <input
                  name="full_name"
                  value={createForm.full_name}
                  onChange={handleCreateInput}
                  placeholder={(childRole === 'school' || createForm.target_role === 'school') ? t("management_page.users.placeholder_school_name") : t("management_page.users.placeholder_full_name")}
                  required
                />
                <input
                  name="username"
                  value={createForm.username}
                  onChange={handleCreateInput}
                  placeholder={t("management_page.users.placeholder_username")}
                  required
                />
                <div className="ql-pwd-field">
                  <input
                    name="password"
                    value={createForm.password}
                    onChange={handleCreateInput}
                    type={showCreatePwd ? 'text' : 'password'}
                    placeholder={t("management_page.users.placeholder_password")}
                    required
                  />
                  <button
                    type="button"
                    className="ql-pwd-toggle"
                    onClick={() => setShowCreatePwd(v => !v)}
                    title={showCreatePwd ? t("management_page.users.toggle_hide_pwd") : t("management_page.users.toggle_show_pwd")}
                  >
                    <i className={`fa-solid ${showCreatePwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {childRole === 'student' || (role === 'admin' && createForm.target_role === 'student') ? (
                  <input
                    name="class_name"
                    value={createForm.class_name}
                    onChange={handleCreateInput}
                    placeholder={t("management_page.users.placeholder_class")}
                  />
                ) : null}

                <button type="submit" disabled={submitting}>
                  {submitting ? t("management_page.users.btn_submitting") : t("management_page.users.btn_create")}
                </button>
              </form>

              {role === 'admin' && (
                <div className="ql-filter-bar">
                  <label><i className="fa-solid fa-filter"></i> {t("management_page.users.filter_role")}</label>
                  <select value={adminRoleFilter} onChange={e => setAdminRoleFilter(e.target.value)}>
                    <option value="">{t("management_page.users.filter_role_all")}</option>
                    <option value="school">{t("common.roles.school")}</option>
                    <option value="teacher">{t("common.roles.teacher")}</option>
                    <option value="student">{t("common.roles.student")}</option>
                  </select>
                  
                  <label><i className="fa-solid fa-building"></i> {t("management_page.users.filter_school")}</label>
                  <select value={adminSchoolFilter} onChange={e => setAdminSchoolFilter(e.target.value)}>
                    <option value="">{t("management_page.users.filter_school_all")}</option>
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
                      <th>{role === 'admin' ? t("management_page.users.table_head_name") : managedTableLabel}</th>
                      <th>{t("management_page.users.table_head_username")}</th>
                      <th>{t("management_page.users.table_head_role")}</th>
                      {role === 'admin' && <th>{t("management_page.users.table_head_school")}</th>}
                      <th>{t("management_page.users.table_head_class")}</th>
                      <th>{t("management_page.users.table_head_date")}</th>
                      <th>{t("management_page.users.table_head_actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr>
                        <td colSpan="6">{t("management_page.users.loading_users")}</td>
                      </tr>
                    ) : null}

                    {!loadingUsers && users.length === 0 ? (
                      <tr>
                        <td colSpan="6">{t("management_page.users.empty_users")}</td>
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
                            <td><span className={`badge-role badge-${managedUser.role}`}>{t(`common.roles.${managedUser.role}`)}</span></td>
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
                                    placeholder={t("management_page.users.placeholder_new_pwd")}
                                  />
                                  <button type="button" onClick={() => handleSaveEdit(managedUser.id)}>
                                    {t("management_page.users.btn_save")}
                                  </button>
                                  <button type="button" className="ghost" onClick={cancelEdit}>
                                    {t("management_page.users.btn_cancel")}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button type="button" onClick={() => beginEdit(managedUser)}>
                                    {t("management_page.users.btn_edit")}
                                  </button>
                                  <button
                                    type="button"
                                    className="danger"
                                    onClick={() => handleDelete(managedUser.id)}
                                  >
                                    {t("management_page.users.btn_delete")}
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
              <h2>{t("management_page.classes.title")}</h2>

              <form className="ql-create-form" onSubmit={handleCreateClass}>
                <input
                  name="class_name"
                  value={classForm.class_name}
                  onChange={handleClassInput}
                  placeholder={t("management_page.classes.placeholder_class_name")}
                  required
                />

                {role === 'school' ? (
                  <select
                    name="teacher_id"
                    value={classForm.teacher_id}
                    onChange={handleClassInput}
                  >
                    <option value="">{t("management_page.classes.placeholder_select_teacher")}</option>
                    {teachersInSchool.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>{teacher.full_name} ({teacher.username})</option>
                    ))}
                  </select>
                ) : null}

                <button type="submit" disabled={submitting}>
                  {role === 'school' ? t("management_page.classes.btn_create_class") : t("management_page.classes.btn_request_class")}
                </button>
              </form>

              <div className="ql-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t("management_page.classes.table_head_class")}</th>
                      <th>{t("management_page.classes.table_head_teacher")}</th>
                      <th>{t("management_page.classes.table_head_status")}</th>
                      <th>{t("management_page.classes.table_head_creator")}</th>
                      <th>{t("management_page.classes.table_head_actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingClasses ? (
                      <tr>
                        <td colSpan="5">{t("management_page.classes.loading_classes")}</td>
                      </tr>
                    ) : null}

                    {!loadingClasses && classRows.length === 0 ? (
                      <tr>
                        <td colSpan="5">{t("management_page.classes.empty_classes")}</td>
                      </tr>
                    ) : null}

                    {!loadingClasses ? classRows.map((classRow) => (
                      <tr key={classRow.id}>
                        <td>{classRow.class_name}</td>
                        <td>{classRow.teacher_name || '-'}</td>
                        <td><span className={`badge-status badge-status-${classRow.approval_status}`}>{classRow.approval_status === 'pending' ? t("management_page.classes.status_pending") : classRow.approval_status === 'approved' ? t("management_page.classes.status_approved") : classRow.approval_status === 'rejected' ? t("management_page.classes.status_rejected") : classRow.approval_status}</span></td>
                        <td>{classRow.created_by_name || '-'}</td>
                        <td className="ql-actions-cell">
                          {role === 'school' && classRow.approval_status === 'pending' ? (
                            <>
                              <button type="button" onClick={() => handleReviewClass(classRow.id, 'approved')}>{t("management_page.classes.btn_approve")}</button>
                              <button type="button" className="danger" onClick={() => handleReviewClass(classRow.id, 'rejected')}>{t("management_page.classes.btn_reject")}</button>
                            </>
                          ) : null}

                          {role === 'teacher' && classRow.teacher_id === user?.id && classRow.approval_status === 'approved' ? (
                            <>
                              <button type="button" onClick={() => openTransferModal(classRow.id)}>{t("management_page.classes.btn_request_transfer")}</button>
                              <button type="button" className="ghost" onClick={() => handleRequestUnassign(classRow.id)}>{t("management_page.classes.btn_request_unassign")}</button>
                            </>
                          ) : null}
                        </td>
                      </tr>
                    )) : null}
                  </tbody>
                </table>
              </div>

              <h2 style={{ marginTop: '24px' }}>{t("management_page.requests.title")}</h2>
              <div className="ql-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t("management_page.requests.table_head_class")}</th>
                      <th>{t("management_page.requests.table_head_action")}</th>
                      <th>{t("management_page.requests.table_head_sender")}</th>
                      <th>{t("management_page.requests.table_head_receiver")}</th>
                      <th>{t("management_page.requests.table_head_status")}</th>
                      <th>{t("management_page.requests.table_head_actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingClasses ? (
                      <tr>
                        <td colSpan="6">{t("management_page.requests.loading_requests")}</td>
                      </tr>
                    ) : null}

                    {!loadingClasses && classRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6">{t("management_page.requests.empty_requests")}</td>
                      </tr>
                    ) : null}

                    {!loadingClasses ? classRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.class_name}</td>
                        <td>{request.action === 'transfer' ? t("management_page.requests.action_transfer") : t("management_page.requests.action_unassign")}</td>
                        <td>{request.requester_name || '-'}</td>
                        <td>{request.target_teacher_name || '-'}</td>
                        <td><span className={`badge-status badge-status-${request.status}`}>{request.status === 'pending' ? t("management_page.classes.status_pending") : request.status === 'approved' ? t("management_page.classes.status_approved") : request.status === 'rejected' ? t("management_page.classes.status_rejected") : request.status}</span></td>
                        <td className="ql-actions-cell">
                          {role === 'school' && request.status === 'pending' ? (
                            <>
                              <button type="button" onClick={() => handleReviewTransfer(request.id, 'approved')}>{t("management_page.classes.btn_approve")}</button>
                              <button type="button" className="danger" onClick={() => handleReviewTransfer(request.id, 'rejected')}>{t("management_page.classes.btn_reject")}</button>
                            </>
                          ) : null}
                          {role === 'teacher' && request.status === 'pending' ? (
                            <button type="button" className="ghost danger" onClick={() => handleCancelTransferRequest(request.id)}>{t("management_page.requests.btn_cancel_request")}</button>
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
            <h2>{t("management_page.scores.title")}</h2>

            {/* Tab switcher */}
            {role !== 'student' ? (
              <div className="ql-score-tabs">
                <button
                  type="button"
                  className={`ql-score-tab ${scoreViewMode === 'class' ? 'active' : ''}`}
                  onClick={() => setScoreViewMode('class')}
                >
                  <i className="fa-solid fa-users"></i> {t("management_page.scores.tab_class")}
                </button>
                <button
                  type="button"
                  className={`ql-score-tab ${scoreViewMode === 'history' ? 'active' : ''}`}
                  onClick={() => setScoreViewMode('history')}
                >
                  <i className="fa-solid fa-clock-rotate-left"></i> {t("management_page.scores.tab_history")}
                </button>
              </div>
            ) : null}

            {/* Filters */}
            {!loadingScores ? (
              <div className="ql-filter-bar">
                {availableClasses.length > 0 ? (
                  <>
                    <label><i className="fa-solid fa-filter"></i> {t("management_page.scores.filter_class")}</label>
                    <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                      <option value="">{t("management_page.scores.filter_class_all")}</option>
                      {availableClasses.map(cn => (
                        <option key={cn} value={cn}>{cn}</option>
                      ))}
                    </select>
                  </>
                ) : null}
                {scoreViewMode === 'history' && role !== 'student' ? (
                  <>
                    <label><i className="fa-solid fa-gamepad"></i> {t("management_page.scores.filter_game")}</label>
                    <select value={gameFilter} onChange={(e) => setGameFilter(e.target.value)}>
                      <option value="">{t("management_page.scores.filter_game_all")}</option>
                      {ALL_GAME_IDS.map(gid => (
                        <option key={gid} value={gid}>{toGameLabel(gid, t)}</option>
                      ))}
                    </select>
                  </>
                ) : null}
              </div>
            ) : null}

            {loadingScores ? <p>{t("management_page.scores.loading_scores")}</p> : null}

            {/* ─── CLASS VIEW (teacher) ─── */}
            {!loadingScores && role === 'teacher' && scoreViewMode === 'class' ? (
              <div className="ql-class-view">
                {classBased.length === 0 ? <p>{t("management_page.scores.empty_students")}</p> : null}
                {classBased.map(([className, students]) => (
                  <div className="ql-class-section" key={className}>
                    <div className="ql-class-header">
                      <i className="fa-solid fa-chalkboard"></i>
                      <span>{t("management_page.profile.class")} {className}</span>
                      <span className="ql-class-count">{t("management_page.scores.student_meta", { count: students.length })}</span>
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
                                {t("management_page.scores.student_meta", { count: student.scores.length })}
                                {student.scores.length > 0 ? t("management_page.scores.student_meta_ext", { 
                                  best: Math.max(...student.scores.map(s => s.score)), 
                                  avg: (student.scores.reduce((sum, s) => sum + s.score, 0) / student.scores.length).toFixed(1) 
                                }) : ''}
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
                                      <span className="ql-game-item-name">{toGameLabel(g.game_id, t)}</span>
                                      <span className={`ql-game-item-badge ${g.played ? 'yes' : 'no'}`}>
                                        {g.played ? t("management_page.scores.game_played") : t("management_page.scores.game_not_played")}
                                      </span>
                                    </div>
                                    {g.played ? (
                                      <div className="ql-game-item-stats">
                                        <span dangerouslySetInnerHTML={{ __html: t("management_page.scores.game_stats", { 
                                          score: g.bestScore, 
                                          attempts: g.totalAttempts, 
                                          time: formatDate(g.lastPlayed, i18n) 
                                        }) }} />
                                      </div>
                                    ) : (
                                      <div className="ql-game-item-stats muted">{t("management_page.scores.game_no_data")}</div>
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
                {sortedStudentRows.length === 0 ? <p>{t("management_page.scores.no_score_data")}</p> : null}
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
                        <p>{t("management_page.scores.empty_history")}</p>
                      ) : (
                        <div className="ql-table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>{t("management_page.scores.table_head_game")}</th>
                                <th>{t("management_page.scores.table_head_score")}</th>
                                <th>{t("management_page.scores.table_head_attempts")}</th>
                                <th>{t("management_page.scores.table_head_time")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.map((score, index) => (
                                <tr key={`${student.id}-${score.game_id}-${index}`}>
                                  <td>{toGameLabel(score.game_id, t)}</td>
                                  <td>{score.score}</td>
                                  <td>{score.attempts}</td>
                                  <td>{formatDate(score.completed_at, i18n)}</td>
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
                      {role !== 'student' ? <th>{t("management_page.scores.table_head_student")}</th> : null}
                      {role !== 'student' ? <th>{t("management_page.scores.table_head_class")}</th> : null}
                      <th>{t("management_page.scores.table_head_game")}</th>
                      <th>{t("management_page.scores.table_head_score")}</th>
                      <th>{t("management_page.scores.table_head_attempts")}</th>
                      <th>{t("management_page.scores.table_head_time")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScoreRows.length === 0 ? (
                      <tr>
                        <td colSpan={role === 'student' ? 4 : 6}>{t("management_page.scores.no_score_data")}</td>
                      </tr>
                    ) : (
                      filteredScoreRows.map((score, index) => (
                        <tr key={`${score.game_id || 'game'}-${score.completed_at || index}-${index}`}>
                          {role !== 'student' ? <td>{score.full_name || '-'}</td> : null}
                          {role !== 'student' ? <td>{score.class_name || '-'}</td> : null}
                          <td>{toGameLabel(score.game_id, t)}</td>
                          <td>{score.score}</td>
                          <td>{score.attempts}</td>
                          <td>{formatDate(score.completed_at, i18n)}</td>
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
              <h3>{t("management_page.transfer_modal.title")}</h3>
              <p>{t("management_page.transfer_modal.desc")}</p>
              <select value={transferDraft.targetTeacherId} onChange={handleTransferDraftChange}>
                <option value="">{t("management_page.transfer_modal.select_teacher")}</option>
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
                  {t("management_page.transfer_modal.btn_submit")}
                </button>
                <button type="button" className="ghost" onClick={closeTransferModal}>
                  {t("management_page.transfer_modal.btn_cancel")}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
