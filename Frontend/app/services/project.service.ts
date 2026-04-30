import api from '../../lib/axios';

export interface Project {
  id: number;
  name: string;
  description?: string;
  code?: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  budget?: number;
  actualCost?: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number;
    name: string;
    designation: string;
  };
  department: {
    id: number;
    name: string;
  };
  members: Array<{
    id: number;
    name: string;
    designation: string;
  }>;
  _count?: {
    tasks: number;
  };
}

export interface Employee {
  id: number;
  name: string;
  designation: string;
  employeeCode: string;
  user: {
    email: string;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
  departmentId: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  memberIds?: number[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  budget?: number;
  memberIds?: number[];
}

export interface ProjectFilters {
  departmentId?: number;
  status?: string;
  ownerId?: number;
  page?: number;
  limit?: number;
}

class ProjectService {
  /**
   * Get all projects (with filters)
   */
  async getProjects(filters: ProjectFilters = {}): Promise<{
    [x: string]: any; projects: Project[]; pagination: any 
}> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/projects?${params}`);
      
      if (response.data.success) {
        return {
          projects: response.data.data || [],
          pagination: response.data.pagination || {}
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch projects');
      }
    } catch (error: any) {
      console.error("Get projects error:", error);
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: number): Promise<Project> {
    try {
      const response = await api.get(`/api/projects/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Get project by ID error:", error);
      throw error;
    }
  }

  /**
   * Create a new project
   */
  async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      const response = await api.post('/api/projects', projectData);
      return response.data.data;
    } catch (error: any) {
      console.error("Create project error:", error);
      throw error;
    }
  }

  /**
   * Update a project
   */
  async updateProject(id: number, projectData: UpdateProjectData): Promise<Project> {
    try {
      const response = await api.put(`/api/projects/${id}`, projectData);
      return response.data.data;
    } catch (error: any) {
      console.error("Update project error:", error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: number): Promise<void> {
    try {
      await api.delete(`/api/projects/${id}`);
    } catch (error: any) {
      console.error("Delete project error:", error);
      throw error;
    }
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: number): Promise<{ owner: Employee; members: Employee[] }> {
    try {
      const response = await api.get(`/api/projects/${projectId}/members`);
      return response.data.data;
    } catch (error: any) {
      console.error("Get project members error:", error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();