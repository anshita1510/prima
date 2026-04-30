// Frontend/app/services/authService.ts
import api from '../../lib/axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    designation?: string;
    status?: string;
    isActive?: boolean;
  };
  message?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/users/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set auth_token cookie for middleware (same as OAuth) with 30-day expiration
        const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
        document.cookie = `auth_token=${response.data.token}; path=/; max-age=${thirtyDaysInSeconds}; SameSite=Lax`;
      }
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/users/register', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('resetEmail'); // Clear any password reset data
    
    // Clear auth_token cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    console.log('Logged out - redirecting to login page');
    window.location.href = '/login';
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/users/me');
      
      if (response.data.success && response.data.user) {
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch user' };
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get stored user data
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};