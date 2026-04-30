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

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone?: string;
  designation: string;
  role: string;
  status: string;
  employeeCode?: string;
  companyId?: number;
  departmentId?: number;
  isActive?: boolean;
}

export const teamService = {
  // Get manager's team members
  async getManagerTeamMembers() {
    try {
      console.log('📤 Fetching manager team members...');
      const response = await api.get('/api/employees/team/members');
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Get manager team members error:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch team members'
      };
    }
  },

  // Get unassigned employees
  async getUnassignedEmployees() {
    try {
      console.log('📤 Fetching unassigned employees...');
      const response = await api.get('/api/employees/team/unassigned');
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Get unassigned employees error:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch unassigned employees'
      };
    }
  },

  // Assign employee to manager
  async assignEmployeeToManager(employeeId: number) {
    try {
      console.log('📤 Assigning employee to manager:', employeeId);
      const response = await api.post(`/api/employees/team/assign/${employeeId}`);
      console.log('✅ Employee assigned:', response.data.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Employee assigned successfully'
      };
    } catch (error: any) {
      console.error('❌ Assign employee error:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to assign employee'
      };
    }
  },

  // Get all users (for admin)
  async getAllUsers(role?: string) {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);

      const response = await api.get(
        `/api/employees/users/all${params.toString() ? `?${params.toString()}` : ''}`
      );
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Get all users error:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch users'
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
