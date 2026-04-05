import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth({ children, roles = [] }) {
  const { isAuthenticated, isBootstrapping, user } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <section className="auth-loading-wrap">
        <div className="auth-loading-card">
          <h2>Đang kiểm tra đăng nhập...</h2>
          <p>Vui lòng chờ trong giây lát.</p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    const redirectPath = `${location.pathname}${location.search}`;
    return <Navigate to={`/dang-nhap?redirect=${encodeURIComponent(redirectPath)}`} replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/khong-co-quyen" replace />;
  }

  return children;
}
