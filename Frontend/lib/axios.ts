// Frontend/app/lib/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;

      if (status === 401) {
        console.log('🚨 401 Error detected');
        console.log('🚨 URL:', error.config?.url);
        console.log('🚨 Current path:', typeof window !== 'undefined' ? window.location.pathname : 'unknown');

        // Only clear token if we're not already on login page
        // This prevents clearing token during page initialization
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          console.log('❌ Clearing token due to 401 error');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/login?session=expired';
        }
      } else if (status === 403) {
        // Forbidden - user doesn't have permission
        console.error('Access forbidden');
      } else if (status === 404) {
        console.error('Resource not found');
      } else if (status >= 500) {
        console.error('Server error');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - no response received');
    } else {
      // Error in request setup
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;