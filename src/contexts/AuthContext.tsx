import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Staff, AuthState, LoginCredentials } from '@/api/types/auth.types';
import { authService } from '@/api/services/authService';
import { UserRole } from '@/api/types/common.types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getStoredToken();
      const storedUser = authService.getStoredUser();

      if (token && storedUser) {
        try {
          const user = await authService.getCurrentUser();
          authService.setStoredUser(user);

          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Invalid / expired token
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

  /**
   * Login (JSON: identifier + password)
   */
  const login = useCallback(
    async ({ identifier, password }: LoginCredentials) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const tokenData = await authService.login({
          identifier,
          password,
        });

        authService.setStoredToken(tokenData.access_token);

        const user = await authService.getCurrentUser();
        authService.setStoredUser(user);

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
    },
    []
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    });

    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    try {
      await authService.logout();
    } catch {
      // Ignore API logout failure
    }

    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  /**
   * Role checker
   */
  const hasRole = useCallback(
    (roles: UserRole[]) => {
      if (!state.user) return false;
      return roles.includes(state.user.role);
    },
    [state.user]
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
