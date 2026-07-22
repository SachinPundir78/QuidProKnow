import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowUnonboarded = false }) {
  const { token, user, isSyncing } = useAuth();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;

  if (isSyncing || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fff7ed]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user.onboarded && !allowUnonboarded) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  return children;
}
