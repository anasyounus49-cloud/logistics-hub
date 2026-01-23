import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultDashboard } from '@/utils/roleConfig';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const dashboardPath = getDefaultDashboard(user.role);
  
  // Use key to force re-mount when user changes
  return <Navigate to={dashboardPath} replace key={`${user.id}-${user.role}`} />;
}
