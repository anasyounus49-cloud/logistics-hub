import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultDashboard } from '@/utils/roleConfig';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function DashboardRedirect() {
  const { user, isLoading, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If authenticated and user is loaded, redirect to role-specific dashboard
    if (!isLoading && isAuthenticated && user && token) {
      const dashboardPath = getDefaultDashboard(user.role);
      navigate(dashboardPath, { replace: true });
    }
  }, [isLoading, isAuthenticated, user, token, navigate]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Get the role-specific dashboard path and redirect
  const dashboardPath = getDefaultDashboard(user.role);
  
  // Use key to force re-mount when user changes
  return <Navigate to={dashboardPath} replace key={`redirect-${user.id}-${user.role}`} />;
}
