import { UserRole } from '@/api/types/common.types';
import {
  LayoutDashboard,
  Users,
  Truck,
  Car,
  FileText,
  Package,
  Route,
  Scale,
  ShieldCheck,
  Settings,
  ClipboardList,
  CheckCircle,
  Eye,
  Weight,
  Activity,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export type RoleConfig = {
  [key in UserRole]: {
    label: string;
    dashboardPath: string;
    navigation: NavGroup[];
  };
};

export const roleConfig: RoleConfig = {
  'super admin': {
    label: 'Super Admin',
    dashboardPath: '/dashboard/super-admin',
    navigation: [
      {
        title: 'Overview',
        items: [
          { title: 'Dashboard', href: '/dashboard/super-admin', icon: LayoutDashboard },
          { title: 'Activity Log', href: '/activity', icon: Activity },
        ],
      },
      {
        title: 'Management',
        items: [
          { title: 'Staff', href: '/management/staff', icon: Users },
          { title: 'Drivers', href: '/management/drivers', icon: Truck },
          { title: 'Vehicles', href: '/management/vehicles', icon: Car },
          { title: 'Materials', href: '/management/materials', icon: Package },
          { title: 'Purchase Orders', href: '/management/purchase-orders', icon: FileText },
        ],
      },
      {
        title: 'Operations',
        items: [
          { title: 'Trips', href: '/operations/trips', icon: Route },
          { title: 'Weight Records', href: '/operations/weights', icon: Scale },
          { title: 'Unloading', href: '/operations/unloading', icon: Package },
        ],
      },
      {
        title: 'Settings',
        items: [
          { title: 'System Settings', href: '/settings', icon: Settings },
        ],
      },
    ],
  },
  'admin': {
    label: 'Purchase Admin',
    dashboardPath: '/dashboard/purchase-admin',
    navigation: [
      {
        title: 'Overview',
        items: [
          { title: 'Dashboard', href: '/dashboard/purchase-admin', icon: LayoutDashboard },
        ],
      },
      {
        title: 'Purchase Management',
        items: [
          { title: 'Purchase Orders', href: '/management/purchase-orders', icon: FileText },
          { title: 'Materials', href: '/management/materials', icon: Package },
        ],
      },
      {
        title: 'Approvals',
        items: [
          { title: 'Pending Drivers', href: '/approvals/drivers', icon: Truck },
          { title: 'Pending Vehicles', href: '/approvals/vehicles', icon: Car },
        ],
      },
      {
        title: 'Operations',
        items: [
          { title: 'Trip Monitoring', href: '/operations/trips', icon: Route },
        ],
      },
    ],
  },
  'security': {
    label: 'Security',
    dashboardPath: '/dashboard/security',
    navigation: [
      {
        title: 'Overview',
        items: [
          { title: 'Dashboard', href: '/dashboard/security', icon: LayoutDashboard },
        ],
      },
      {
        title: 'Gate Operations',
        items: [
          { title: 'Vehicle Registration', href: '/security/vehicle-registration', icon: Car },
          { title: 'PO Verification', href: '/security/po-verification', icon: ClipboardList },
          { title: 'Recent Vehicles', href: '/security/recent-vehicles', icon: Eye },
        ],
      },
      {
        title: 'Verification',
        items: [
          { title: 'Gate Entry', href: '/security/gate-entry', icon: ShieldCheck },
        ],
      },
    ],
  },
  'operator': {
    label: 'Operator',
    dashboardPath: '/dashboard/operator',
    navigation: [
      {
        title: 'Overview',
        items: [
          { title: 'Dashboard', href: '/dashboard/operator', icon: LayoutDashboard },
        ],
      },
      {
        title: 'Weight Operations',
        items: [
          { title: 'Weight Records', href: '/operations/weight-capture', icon: Scale },
          { title: 'Active Trips', href: '/operations/trips', icon: Route },
        ],
      },
      {
        title: 'Verification',
        items: [
          { title: 'Quality Check', href: '/operations/quality-check', icon: CheckCircle },
          { title: 'Unloading Records', href: '/operations/unloading', icon: Package },
        ],
      },
    ],
  },
  'user': {
    label: 'User',
    dashboardPath: '/dashboard',
    navigation: [
      {
        title: 'Overview',
        items: [
          { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ],
      },
    ],
  },
};

export function getRoleConfig(role: UserRole) {
  return roleConfig[role] || roleConfig['user'];
}

export function getDefaultDashboard(role: UserRole): string {
  return getRoleConfig(role).dashboardPath;
}
