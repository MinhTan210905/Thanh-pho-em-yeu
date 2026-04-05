import jwt from 'jsonwebtoken';

// Middleware kiểm tra người dùng đã đăng nhập chưa
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Chưa đăng nhập!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role, parent_id, school_id }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token không hợp lệ!' });
  }
};

// Middleware kiểm tra quyền truy cập theo Role
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập!' });
    }
    next();
  };
};
