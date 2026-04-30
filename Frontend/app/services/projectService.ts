import api from '@/lib/axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';

export interface Project {
  id: number;
  name: string;
  description?: string;
  code?: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  progressPercentage: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  actualCost?: number;
  companyId: number;
  departmentId: number;
  ownerId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number;
    name: string;
    employeeCode: string;
    designation: string;
  };
  department: {
    name: string;
    type: string;
  };
  company: {
    name: string;
    code: string;
  };
  members: ProjectMember[];
  tasks: Task[];
  stats?: {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    teamMembersCount: number;
  };
}

export interface ProjectMember {
  id: number;
  projectId: number;
  employeeId: number;
  role: 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  employee: {
    id: number;
    name: string;
    employeeCode: string;
    designation: string;
    user?: {
      email: string;
      phone: string;
    };
  };
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  code?: string;
  projectId: number;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  progressPercentage: number;
  assignedToId?: number;
  createdById: number;
  milestoneId?: number;
  parentTaskId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: number;
    name: string;
    employeeCode: string;
  };
  createdBy: {
    id: number;
    name: string;
    employeeCode: string;
  };
  project: {
    id: number;
    name: string;
    code: string;
  };
}

export interface Employee {
  id: number;
  name: string;
  employeeCode: string;
  designation: string;
  user: {
    email: string;
    role: string;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
  code?: string;
  companyId?: number; // Optional:backend uses token
  departmentId?: number;
  ownerId?: number; // Optional:backend uses token
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  teamMembers?: Array<{
    employeeId: number;
    role: 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  }>;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  progressPercentage?: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  code?: string;
  projectId: number;
  assignedToId?: number;
  createdById?: number; // Optional: backend uses token
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  milestoneId?: number;
  parentTaskId?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  assignedToId?: number;
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progressPercentage?: number;
}

export interface AssignTeamMemberData {
  employeeId: number;
  role: 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';
}

export const projectService = {
  // Project Management
  async createProject(projectData: CreateProjectData) {
    try {
      console.log('📤 Sending project creation request:', projectData);
      console.log('🔗 API URL:', `${API_BASE_URL}/api/project-management`);
      console.log('🔑 Token in localStorage:', !!localStorage.getItem('token'));

      const response = await api.post('/api/project-management', projectData);

      console.log('📥 Raw API response:', response);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Create project error:', error);
      console.error('📋 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create project'
      };
    }
  },

  async updateProject(projectId: number, updateData: UpdateProjectData) {
    try {
      const response = await api.put(`/api/project-management/${projectId}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Update project error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update project'
      };
    }
  },

  async getProject(projectId: number) {
    try {
      const response = await api.get(`/api/project-management/${projectId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Get project error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch project',
        data: null
      };
    }
  },

  async getAllProjects(companyId?: number, departmentId?: number, ownerId?: number) {
    try {
      const params = new URLSearchParams();
      if (companyId) params.append('companyId', companyId.toString());
      if (departmentId) params.append('departmentId', departmentId.toString());
      if (ownerId) params.append('ownerId', ownerId.toString());

      const url = `/api/project-management${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Get all projects error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch projects',
        data: []
      };
    }
  },

  async deleteProject(projectId: number) {
    try {
      const response = await api.delete(`/api/project-management/${projectId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Delete project error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete project'
      };
    }
  },

  // Team Member Management
  async assignTeamMember(projectId: number, memberData: AssignTeamMemberData) {
    try {
      const response = await api.post(`/api/project-management/${projectId}/members`, memberData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Assign team member error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to assign team member'
      };
    }
  },

  async removeTeamMember(projectId: number, employeeId: number) {
    try {
      const response = await api.delete(`/api/project-management/${projectId}/members/${employeeId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Remove team member error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove team member'
      };
    }
  },

  async updateTeamMemberRole(projectId: number, employeeId: number, role: 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER') {
    try {
      const response = await api.put(`/api/project-management/${projectId}/members/${employeeId}/role`, { role });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Update team member role error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update team member role'
      };
    }
  },

  async getProjectTeamMembers(projectId: number) {
    try {
      const response = await api.get(`/api/project-management/${projectId}/members`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Get team members error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch team members',
        data: []
      };
    }
  },

  // Task Management
  async createTask(projectId: number, taskData: CreateTaskData) {
    try {
      const response = await api.post(`/api/project-management/${projectId}/tasks`, taskData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Create task error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create task'
      };
    }
  },

  async updateTask(taskId: number, updateData: UpdateTaskData) {
    try {
      const response = await api.put(`/api/project-management/tasks/${taskId}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Update task error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update task'
      };
    }
  },

  async getProjectTasks(projectId: number, status?: string, assignedToId?: number) {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (assignedToId) params.append('assignedToId', assignedToId.toString());

      const url = `/api/project-management/${projectId}/tasks${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Get project tasks error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch tasks',
        data: []
      };
    }
  },

  async deleteTask(taskId: number) {
    try {
      const response = await api.delete(`/api/project-management/tasks/${taskId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Delete task error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete task'
      };
    }
  },

  // Dashboard and Analytics
  async getDashboardStats(companyId?: number, departmentId?: number) {
    try {
      const params = new URLSearchParams();
      if (companyId) params.append('companyId', companyId.toString());
      if (departmentId) params.append('departmentId', departmentId.toString());

      const url = `/api/project-management/dashboard/stats${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Get dashboard stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch dashboard stats',
        data: {
          projects: { total: 0, active: 0, completed: 0, onHold: 0, planning: 0 },
          tasks: { total: 0, completed: 0, overdue: 0, inProgress: 0 }
        }
      };
    }
  },

  // Utility Functions
  async getAvailableEmployees(companyId?: number, departmentId?: number) {
    try {
      // Get user from localStorage if companyId not provided
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const finalCompanyId = companyId || user?.companyId;

      if (!finalCompanyId) {
        console.error('Company ID not found');
        return {
          success: false,
          message: 'Company ID not found',
          data: []
        };
      }

      const params = new URLSearchParams();
      params.append('companyId', finalCompanyId.toString());
      if (departmentId) params.append('departmentId', departmentId.toString());

      const response = await api.get(`/api/project-management/utils/available-employees?${params.toString()}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Get available employees error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch available employees',
        data: []
      };
    }
  },

  // Helper Functions
  getStatusColor(status: string) {
    switch (status) {
      case 'PLANNING':
        return 'bg-purple-100 text-purple-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'IN_REVIEW':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getPriorityColor(priority: string) {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getRoleColor(role: string) {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'MEMBER':
        return 'bg-green-100 text-green-800';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};