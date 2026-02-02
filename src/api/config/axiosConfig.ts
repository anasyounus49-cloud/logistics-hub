import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './endpoints';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // ❌ REMOVED: Don't set global Content-Type
  // headers: {
  //   'Content-Type': 'application/json',
  // },
  timeout: 30000,
});

// Request interceptor - add auth token and handle Content-Type
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ ADDED: Only set Content-Type to JSON if data is NOT FormData
    // For FormData, axios will automatically set 'multipart/form-data' with boundary
    if (config.headers && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;