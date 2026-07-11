import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext.js';
import { showToast } from '../../../components/common/Toast.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'user' | 'tenant';
  requireVerified?: boolean;
}

export function ProtectedRoute({ children, role, requireVerified }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Silakan masuk terlebih dahulu untuk mengakses halaman ini.', 'error');
    } else if (role && user?.role !== role) {
      showToast('Anda tidak memiliki akses ke halaman tersebut.', 'error');
    } else if (requireVerified && user && !user.isVerified) {
      showToast('Akun Anda belum terverifikasi. Silakan verifikasi email Anda.', 'error');
    }
  }, [isAuthenticated, role, user?.role, user?.isVerified, requireVerified]);

  if (!isAuthenticated) return <Navigate to="/login/user" state={{ from: location }} replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  if (requireVerified && user && !user.isVerified) return <Navigate to="/" replace />;

  return <>{children}</>;
}
