import api from '@/lib/axios';

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  designation: string;
  role: string;
  employeeCode?: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  designation: string;
  role: string;
  status: string;
  isActive: boolean;
  employeeCode?: string;
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  async createUser(userData: CreateUserData) {
    try {
      const response = await api.post('/api/users/register', userData);
      return {
        success: true,
        message: response.data.message,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          message:
            error.response.data?.error ||
            error.response.data?.message ||
            `Server error (${error.response.status})`,
        };
      }
      return {
        success: false,
        message:
          error.code === 'ECONNABORTED'
            ? 'Request timed out. Please check the server is running.'
            : 'Network error — backend not reachable',
      };
    }
  },

  async getUsers() {
    try {
      const response = await api.get('/api/users');
      return {
        success: true,
        data: response.data.users || [],
      };
    } catch (error: any) {
      console.error('Get users error:', error);
      const status = error.response?.status;
      return {
        success: false,
        message: status === 403
          ? '403 Forbidden — insufficient permissions'
          : error.response?.data?.error || 'Failed to fetch users',
        data: [],
      };
    }
  },

  async updateUser(userId: number, userData: Partial<CreateUserData>) {
    try {
      const response = await api.put(`/api/users/update/${userId}`, userData);
      return {
        success: true,
        message: response.data.message,
        data: response.data.user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update user',
      };
    }
  },

  async updatePassword(userId: number, newPassword: string) {
    try {
      const response = await api.post(`/api/users/${userId}/update-password`, { newPassword });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update password',
      };
    }
  },
};
