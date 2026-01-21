import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Staff, AuthState } from '@/api/types/auth.types';
import { authService } from '@/api/services/authService';
import { UserRole } from '@/api/types/common.types';

// Demo users for testing without API
const DEMO_USERS: Record<string, Staff> = {
  'superadmin': {
    id: 1,
    email: 'superadmin@acwms.com',
    username: 'superadmin',
    full_name: 'Super Administrator',
    role: 'super admin',
    department: 'HR',
    is_active: true,
    is_superuser: true,
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  'admin': {
    id: 2,
    email: 'admin@acwms.com',
    username: 'admin',
    full_name: 'Purchase Admin',
    role: 'admin',
    department: 'purchase',
    is_active: true,
    is_superuser: false,
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  'security': {
    id: 3,
    email: 'security@acwms.com',
    username: 'security',
    full_name: 'Security Officer',
    role: 'security',
    department: 'HR',
    is_active: true,
    is_superuser: false,
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  'operator': {
    id: 4,
    email: 'operator@acwms.com',
    username: 'operator',
    full_name: 'Weighbridge Operator',
    role: 'operator',
    department: 'HR',
    is_active: true,
    is_superuser: false,
    created_at: new Date().toISOString(),
    updated_at: null,
  },
};

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getStoredToken();
      const storedUser = authService.getStoredUser();

      if (token && storedUser) {
        // Check if it's a demo token
        if (token === 'demo-token') {
          setState({
            user: storedUser,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          setIsDemoMode(true);
          return;
        }

        try {
          // Verify token by fetching current user
          const user = await authService.getCurrentUser();
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          authService.setStoredUser(user);
        } catch {
          // Token invalid, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    // Check for demo users first (password: demo)
    const demoUser = DEMO_USERS[username.toLowerCase()];
    if (demoUser && password === 'demo') {
      const demoToken = 'demo-token';
      authService.setStoredToken(demoToken);
      authService.setStoredUser(demoUser);
      setIsDemoMode(true);
      
      setState({
        user: demoUser,
        token: demoToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    // Try real API login
    try {
      const tokenData = await authService.login({ username, password });
      authService.setStoredToken(tokenData.access_token);

      const user = await authService.getCurrentUser();
      authService.setStoredUser(user);
      setIsDemoMode(false);

      setState({
        user,
        token: tokenData.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    if (!isDemoMode) {
      try {
        await authService.logout();
      } catch {
        // Continue with logout even if API call fails
      }
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsDemoMode(false);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, [isDemoMode]);

  const hasRole = useCallback(
    (roles: UserRole[]) => {
      if (!state.user) return false;
      return roles.includes(state.user.role);
    },
    [state.user]
  );

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasRole, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
