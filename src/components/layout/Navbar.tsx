import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const routeTitles: Record<string, string> = {
  '/dashboard/super-admin': 'Super Admin Dashboard',
  '/dashboard/purchase-admin': 'Purchase Admin Dashboard',
  '/dashboard/security': 'Security Dashboard',
  '/dashboard/operator': 'Operator Dashboard',
  '/management/staff': 'Staff Management',
  '/management/drivers': 'Driver Management',
  '/management/vehicles': 'Vehicle Management',
  '/management/materials': 'Material Management',
  '/management/purchase-orders': 'Purchase Orders',
  '/operations/trips': 'Trip Management',
  '/operations/weights': 'Weight Records',
  '/operations/weight-capture': 'Weight Capture',
  '/operations/active-trips': 'Active Trips',
  '/operations/quality-check': 'Quality Check',
  '/operations/unloading': 'Material Unloading',
  '/security/vehicle-registration': 'Vehicle Registration',
  '/security/po-verification': 'PO Verification',
  '/security/recent-vehicles': 'Recent Vehicles',
  '/security/gate-entry': 'Gate Entry',
  '/approvals/drivers': 'Driver Approvals',
  '/approvals/vehicles': 'Vehicle Approvals',
  '/settings': 'Settings',
  '/activity': 'Activity Log',
};

export function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    return routeTitles[location.pathname] || 'Dashboard';
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    
    if (parts.length <= 1) return null;

    return parts.map((part, index) => {
      const title = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      const isLast = index === parts.length - 1;
      
      return (
        <span key={part} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
          <span className={isLast ? 'font-medium' : 'text-muted-foreground'}>
            {title}
          </span>
        </span>
      );
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="-ml-2" />

        <div className="flex-1">
          <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
          <div className="flex items-center text-sm text-muted-foreground">
            {getBreadcrumbs()}
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-64 pl-9 h-9 bg-muted/50"
            />
          </div>
        </div>

        {/* Notifications */}
        {/* <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button> */}

        {/* User info */}
        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.full_name || user?.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {user?.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
