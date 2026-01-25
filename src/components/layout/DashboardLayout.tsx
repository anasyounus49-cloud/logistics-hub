import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Navbar } from '@/components/layout/Navbar';
import { SidebarProvider } from '@/components/ui/sidebar';

export function DashboardLayout() {
  const { user } = useAuth();

  if (!user) return null;

  // Use user.id as key to force complete re-mount when user changes
  return (
    <SidebarProvider key={`sidebar-${user.id}`} defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar key={`app-sidebar-${user.id}`} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar key={`navbar-${user.id}`} />
          <main className="flex-1 p-6 overflow-auto">
            <div className="mx-auto max-w-7xl animate-fade-in">
              <Outlet key={`outlet-${user.id}-${user.role}`} />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
