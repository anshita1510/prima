import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const authService = {
  // Login
  async login(email: string, password: string) {
    try {
      const response = await api.post('/api/users/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set auth_token cookie for middleware (same as OAuth) with 30-day expiration
        const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
        document.cookie = `auth_token=${response.data.token}; path=/; max-age=${thirtyDaysInSeconds}; SameSite=Lax`;
      }
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Login failed' 
      };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No token found' };
      }

      const response = await api.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get user error:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Failed to get user' 
      };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear auth_token cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    console.log('Logged out - redirecting to login page');
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get stored user
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  },

  // Create demo admin session (for testing)
  createDemoSession() {
    const demoToken = 'demo-admin-token-' + Date.now();
    const demoUser = {
      id: 1,
      name: 'Demo Admin',
      email: 'admin@demo.com',
      role: 'ADMIN',
      designation: 'MANAGER'
    };
    
    localStorage.setItem('token', demoToken);
    localStorage.setItem('user', JSON.stringify(demoUser));
    
    return { success: true, user: demoUser, token: demoToken };
  },

  // Quick login with real admin user (for testing)
  async quickAdminLogin() {
    try {
      const response = await this.login('admin@PRIMA.com', 'Admin@123');
      return response;
    } catch (error: any) {
      console.error('Quick admin login error:', error);
      return { success: false, message: 'Quick login failed' };
    }
  }
};