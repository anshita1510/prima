import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Employee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  designation: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  status: 'ACTIVE' | 'AWAY' | 'BUSY' | 'OFFLINE';
  location?: string;
  employeeCode?: string;
  companyId?: number;
  departmentId?: number;
  activeTasks?: number;
  completedTasks?: number;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  phone?: string;
  designation: string;
  role?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  status?: 'ACTIVE' | 'AWAY' | 'BUSY' | 'OFFLINE';
  location?: string;
  departmentId?: number;
  managerId?: number;
  password?: string;
}

export interface UpdateEmployeePayload {
  name?: string;
  email?: string;
  phone?: string;
  designation?: string;
  role?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  status?: 'ACTIVE' | 'AWAY' | 'BUSY' | 'OFFLINE';
  location?: string;
  departmentId?: number;
  managerId?: number;
}

export const employeeService = {
  // Get all employees
  async getAllEmployees(filters?: {
    companyId?: number;
    departmentId?: number;
    status?: string;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.companyId) params.append('companyId', filters.companyId.toString());
      if (filters?.departmentId) params.append('departmentId', filters.departmentId.toString());
      if (filters?.status) params.append('status', filters.status);

      const response = await api.get(
        `/api/employees${params.toString() ? `?${params.toString()}` : ''}`
      );
      return {
        success: true,
        data: response.data.data || response.data || [],
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Get all employees error:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch employees'
      };
    }
  },

  // Get employee by ID
  async getEmployeeById(employeeId: number) {
    try {
      const response = await api.get(`/api/employees/${employeeId}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Get employee error:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch employee'
      };
    }
  },

  // Create new employee
  async createEmployee(payload: CreateEmployeePayload) {
    try {
      console.log('📤 Creating employee:', payload);
      const response = await api.post('/api/employees', payload);
      console.log('✅ Employee created:', response.data.data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Employee created successfully'
      };
    } catch (error: any) {
      console.error('❌ Create employee error:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Failed to create employee'
      };
    }
  },

  // Update employee
  async updateEmployee(employeeId: number, payload: UpdateEmployeePayload) {
    try {
      const response = await api.put(`/api/employees/${employeeId}`, payload);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Employee updated successfully'
      };
    } catch (error: any) {
      console.error('❌ Update employee error:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update employee'
      };
    }
  },

  // Delete employee
  async deleteEmployee(employeeId: number) {
    try {
      const response = await api.delete(`/api/employees/${employeeId}`);
      return {
        success: true,
        message: response.data.message || 'Employee deleted successfully'
      };
    } catch (error: any) {
      console.error('❌ Delete employee error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete employee'
      };
    }
  },

  // Get company employees
  async getCompanyEmployees(companyId: number) {
    try {
      const response = await api.get(`/api/employees?companyId=${companyId}`);
      return {
        success: true,
        data: response.data.data || response.data || [],
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Get company employees error:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch company employees'
      };
    }
  },

  // Get department employees
  async getDepartmentEmployees(departmentId: number) {
    try {
      const response = await api.get(`/api/employees?departmentId=${departmentId}`);
      return {
        success: true,
        data: response.data.data || response.data || [],
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Get department employees error:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch department employees'
      };
    }
  },

  // Get employee statistics
  async getEmployeeStats(employeeId: number) {
    try {
      const response = await api.get(`/api/employees/${employeeId}/stats`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Get employee stats error:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch employee stats'
      };
    }
  },

  // Utility function to generate avatar initials
  generateAvatarInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  // Utility function to get status color
  getStatusColor(status: string) {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'AWAY':
        return 'bg-yellow-100 text-yellow-800';
      case 'BUSY':
        return 'bg-red-100 text-red-800';
      case 'OFFLINE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Utility function to get status dot color
  getStatusDotColor(status: string) {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'AWAY':
        return 'bg-yellow-500';
      case 'BUSY':
        return 'bg-red-500';
      case 'OFFLINE':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  }
};
