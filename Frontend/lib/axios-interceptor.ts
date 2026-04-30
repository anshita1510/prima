import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to all requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
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

// Response interceptor - Handle token expiration and errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<any>) => {
    console.log('🚨 Axios interceptor error:', {
      status: error.response?.status,
      url: error.config?.url,
      errorCode: error.response?.data?.code
    });

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      const errorCode = error.response.data?.code;

      // Token expired or invalid
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'NO_TOKEN') {
        console.log('❌ Token invalid - clearing storage');
        
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // Redirect to login if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?session=expired';
        }
      }
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      const errorCode = error.response.data?.code;

      if (errorCode === 'USER_INACTIVE') {
        // User account is inactive
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login?error=account_inactive';
        }
      } else if (errorCode === 'INSUFFICIENT_PERMISSIONS') {
        // Insufficient permissions - show error but don't logout
        console.error('Access denied:', error.response.data.message);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
