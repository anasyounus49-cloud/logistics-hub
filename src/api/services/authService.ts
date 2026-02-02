import apiClient from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';
import { LoginCredentials, TokenOut, Staff } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<TokenOut> {
    // Send JSON body instead of form-urlencoded
    const response = await apiClient.post<TokenOut>(
      ENDPOINTS.AUTH.LOGIN,
      {
        identifier: credentials.identifier, // username OR email
        password: credentials.password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<Staff> {
    const response = await apiClient.get<Staff>(ENDPOINTS.STAFF.ME);
    return response.data;
  },

  async register(data: {
    email: string;
    username: string;
    full_name?: string;
    role: string;
    department: string;
    password: string;
    is_superuser?: boolean;
  }): Promise<Staff> {
    const response = await apiClient.post<Staff>(
      ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  },

  getStoredUser(): Staff | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setStoredToken(token: string): void {
    localStorage.setItem('access_token', token);
  },

  setStoredUser(user: Staff): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },
};
