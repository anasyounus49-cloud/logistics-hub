import { UserRole, Department } from './common.types';

export interface LoginCredentials {
  username: string;
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string | null;
  client_secret?: string | null;
}

export interface TokenOut {
  access_token: string;
  token_type: string;
}

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

export interface StaffCreate {
  email: string;
  username: string;
  full_name?: string | null;
  role: UserRole;
  department: Department;
  password: string;
  is_superuser?: boolean;
}

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

export interface AuthState {
  user: Staff | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
