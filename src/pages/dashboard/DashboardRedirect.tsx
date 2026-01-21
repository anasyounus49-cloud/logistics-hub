import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultDashboard } from '@/utils/roleConfig';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function DashboardRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const dashboardPath = getDefaultDashboard(user.role);
  return <Navigate to={dashboardPath} replace />;
}
