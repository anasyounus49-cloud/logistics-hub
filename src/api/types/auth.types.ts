import { UserRole, Department } from './common.types';

/**
 * Login payload (JSON only)
 * identifier = username OR email
 */
export interface LoginCredentials {
  identifier: string;
  password: string;
}

/**
 * Token response from backend
 */
export interface TokenOut {
  access_token: string;
  token_type: string;
}

/**
 * Staff model
 */
export interface Staff {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  role: UserRole;
  department: Department;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * Staff creation payload
 */
export interface StaffCreate {
  email: string;
  username: string;
  full_name?: string | null;
  role: UserRole;
  department: Department;
  password: string;
  is_superuser?: boolean;
}

/**
 * Staff update payload
 */
export interface StaffUpdate {
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  password?: string | null;
  is_active?: boolean | null;
  is_superuser?: boolean | null;
  role?: UserRole | null;
  department?: Department | null;
}

/**
 * Auth store state
 */
export interface AuthState {
  user: Staff | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
