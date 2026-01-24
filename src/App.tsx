import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";

// Layout
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Dashboard pages
import DashboardRedirect from "@/pages/dashboard/DashboardRedirect";
import SuperAdminDashboard from "@/pages/dashboard/SuperAdminDashboard";
import PurchaseAdminDashboard from "@/pages/dashboard/PurchaseAdminDashboard";
import SecurityDashboard from "@/pages/dashboard/SecurityDashboard";
import OperatorDashboard from "@/pages/dashboard/OperatorDashboard";

// Management pages
import StaffManagementPage from "@/pages/management/StaffManagementPage";
import DriverManagementPage from "@/pages/management/DriverManagementPage";
import { VehicleManagementPage } from "@/pages/management/VehicleManagementPage";
import PurchaseOrderManagementPage from "@/pages/management/PurchaseOrderManagementPage";
import MaterialManagementPage from "@/pages/management/MaterialManagementPage";

// Operations pages
import TripManagementPage from "@/pages/operations/TripManagementPage";

// Other pages
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes with dashboard layout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard redirect based on role */}
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* Role-specific dashboards */}
              <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} />
              <Route path="/dashboard/purchase-admin" element={<PurchaseAdminDashboard />} />
              <Route path="/dashboard/security" element={<SecurityDashboard />} />
              <Route path="/dashboard/operator" element={<OperatorDashboard />} />

              {/* Management routes */}
              <Route path="/management/staff" element={<StaffManagementPage />} />
              <Route path="/management/drivers" element={<DriverManagementPage />} />
              <Route path="/management/vehicles" element={<VehicleManagementPage />} />
              <Route path="/management/purchase-orders" element={<PurchaseOrderManagementPage />} />
              <Route path="/management/materials" element={<MaterialManagementPage />} />
              <Route path="/management/*" element={<PlaceholderPage title="Management" />} />
              <Route path="/operations/trips" element={<TripManagementPage />} />
              <Route path="/operations/*" element={<PlaceholderPage title="Operations" />} />
              <Route path="/approvals/*" element={<PlaceholderPage title="Approvals" />} />
              <Route path="/security/*" element={<PlaceholderPage title="Security" />} />
              <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
              <Route path="/activity" element={<PlaceholderPage title="Activity Log" />} />
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Placeholder component for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">
        This section is under development. The full implementation will include
        data tables, forms, and complete CRUD operations.
      </p>
    </div>
  );
}

export default App;
