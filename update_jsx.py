import re

with open('src/pages/management/QuanLyHeThong.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update createInitialForm
old_form = """function createInitialForm(childRole) {
  return {
    username: '',
    password: '',
    full_name: '',
    class_name: childRole === 'student' ? '' : '',
  };
}"""
new_form = """function createInitialForm(childRole, role = '') {
  return {
    username: '',
    password: '',
    full_name: '',
    class_name: childRole === 'student' || role === 'admin' ? '' : '',
    target_role: 'school',
    target_school_id: '',
    target_parent_id: '',
  };
}"""
content = content.replace(old_form, new_form)

# 2. Update setCreateForm initializations
content = content.replace("useState(() => createInitialForm(childRole))", "useState(() => createInitialForm(childRole, role))")
content = content.replace("setCreateForm(createInitialForm(childRole))", "setCreateForm(createInitialForm(childRole, role))")

# 3. Add states for admin filters
state_hook = """  const [expandedStudentId, setExpandedStudentId] = useState(null);"""
new_state_hook = """  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [adminRoleFilter, setAdminRoleFilter] = useState('');
  const [adminSchoolFilter, setAdminSchoolFilter] = useState('');"""
content = content.replace(state_hook, new_state_hook)

# 4. handleCreateUser logic
old_handle_create = """  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (!childRole) return;

    clearAlerts();
    setSubmitting(true);

    try {
      const payload = {
        username: createForm.username.trim(),
        password: createForm.password,
        full_name: createForm.full_name.trim(),
      };

      if (childRole === 'student') {
        payload.class_name = createForm.class_name.trim();
      }"""
new_handle_create = """  const handleCreateUser = async (event) => {
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
      }"""
content = content.replace(old_handle_create, new_handle_create)

# 5. Form rendering
old_form_render = """          {canManageUsers ? (
            <article className="ql-card ql-card-wide">
              <h2>Tạo tài khoản {ROLE_LABELS[childRole] || childRole}</h2>
              <form className="ql-create-form" onSubmit={handleCreateUser}>
                <input
                  name="full_name"
                  value={createForm.full_name}
                  onChange={handleCreateInput}
                  placeholder={childRole === 'school' ? 'Tên trường' : 'Họ và tên'}
                  required
                />"""
new_form_render = """          {canManageUsers || role === 'admin' ? (
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
                />"""
content = content.replace(old_form_render, new_form_render)

# update class_name logic
old_class_input = """                {childRole === 'student' ? (
                  <input
                    name="class_name"
                    value={createForm.class_name}
                    onChange={handleCreateInput}
                    placeholder="Lớp học (vd: 5A)"
                  />
                ) : null}

                <button type="submit" disabled={submitting}>
                  {submitting ? 'Đang xử lí...' : `Tạo ${ROLE_LABELS[childRole] || childRole}`}
                </button>"""
new_class_input = """                {childRole === 'student' || (role === 'admin' && createForm.target_role === 'student') ? (
                  <input
                    name="class_name"
                    value={createForm.class_name}
                    onChange={handleCreateInput}
                    placeholder="Lớp học (vd: 5A)"
                  />
                ) : null}

                <button type="submit" disabled={submitting}>
                  {submitting ? 'Đang xử lí...' : `Tạo tài khoản`}
                </button>"""
content = content.replace(old_class_input, new_class_input)

# Table Rendering section
old_table_wrap = """              <div className="ql-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{managedTableLabel}</th>
                      <th>Tài khoản</th>
                      <th>Vai trò</th>
                      <th>Lớp</th>
                      <th>Ngày tạo</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>"""
new_table_wrap = """              {role === 'admin' && (
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
                  </thead>"""
content = content.replace(old_table_wrap, new_table_wrap)

# Filtered users map
old_users_map = """                    {!loadingUsers
                      ? users.map((managedUser) => {"""
new_users_map = """                    {!loadingUsers
                      ? users
                        .filter(u => !adminRoleFilter || u.role === adminRoleFilter)
                        .filter(u => !adminSchoolFilter || u.school_id === Number(adminSchoolFilter) || u.id === Number(adminSchoolFilter))
                        .map((managedUser) => {"""
content = content.replace(old_users_map, new_users_map)

# Replace table td elements to insert Thuôc trường
old_tds = """                            <td><span className={`badge-role badge-${managedUser.role}`}>{ROLE_LABELS[managedUser.role] || managedUser.role}</span></td>
                            <td>
                              {isEditing && childRole === 'student' ? ("""
new_tds = """                            <td><span className={`badge-role badge-${managedUser.role}`}>{ROLE_LABELS[managedUser.role] || managedUser.role}</span></td>
                            {role === 'admin' && <td>{managedUser.role === 'school' ? '-' : (users.find(u => u.id === managedUser.school_id)?.full_name || '-')}</td>}
                            <td>
                              {isEditing && (childRole === 'student' || (role === 'admin' && managedUser.role === 'student')) ? ("""
content = content.replace(old_tds, new_tds)

with open('src/pages/management/QuanLyHeThong.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updating JSX")
