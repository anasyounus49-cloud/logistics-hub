import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './endpoints';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', // Default to JSON
  },
  timeout: 30000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ IMPORTANT: Handle Content-Type properly
    // If request is form-urlencoded, override the default JSON header
    if (config.data instanceof URLSearchParams) {
      // For form-urlencoded data
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (config.data instanceof FormData) {
      // For FormData (file uploads), let browser set the Content-Type with boundary
      delete config.headers['Content-Type'];
    }
    // For JSON data, the default 'application/json' will be used
    
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