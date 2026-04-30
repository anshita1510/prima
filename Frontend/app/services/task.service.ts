import api from '../../lib/axios';

export interface Task {
  id: number;
  title: string;
  description?: string;
  code: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  project: {
    id: number;
    name: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    designation: string;
  };
  createdBy: {
    id: number;
    name: string;
    designation?: string;
  };
  _count?: {
    comments: number;
  };
}

export interface TaskComment {
  id: number;
  comment: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  inReview: number;
  completed: number;
  cancelled: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: number;
  assignedToId?: number;
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedToId?: number;
  dueDate?: string;
}

export interface TaskFilters {
  projectId?: number;
  status?: string;
  priority?: string;
  assignedTo?: number;
  page?: number;
  limit?: number;
}

class TaskService {
  /**
   * Get all tasks (with filters)
   */
  async getTasks(filters: TaskFilters = {}): Promise<{ tasks: Task[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/tasks?${params}`);
      
      // Handle the backend response format: { success: true, data: tasks, pagination: ... }
      if (response.data.success) {
        return {
          tasks: response.data.data || [],
          pagination: response.data.pagination || {}
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch tasks');
      }
    } catch (error: any) {
      console.error("Get tasks error:", error);
      throw error;
    }
  }

  /**
   * Get tasks assigned to current user
   */
  async getMyTasks(status?: string): Promise<Task[]> {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await api.get(`/api/tasks/my-tasks${params}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Get my tasks error:", error);
      throw error;
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStats(projectId?: number): Promise<TaskStats> {
    try {
      const params = projectId ? `?projectId=${projectId}` : '';
      const response = await api.get(`/api/tasks/stats${params}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Get task stats error:", error);
      throw error;
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: number): Promise<Task> {
    try {
      const response = await api.get(`/api/tasks/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Get task by ID error:", error);
      throw error;
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      const response = await api.post('/api/tasks', taskData);
      return response.data.data;
    } catch (error: any) {
      console.error("Create task error:", error);
      throw error;
    }
  }

  /**
   * Update a task
   */
  async updateTask(id: number, taskData: UpdateTaskData): Promise<Task> {
    try {
      const response = await api.put(`/api/tasks/${id}`, taskData);
      return response.data.data;
    } catch (error: any) {
      console.error("Update task error:", error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id: number): Promise<void> {
    try {
      await api.delete(`/api/tasks/${id}`);
    } catch (error: any) {
      console.error("Delete task error:", error);
      throw error;
    }
  }

  /**
   * Add comment to task
   */
  async addTaskComment(taskId: number, comment: string): Promise<TaskComment> {
    try {
      const response = await api.post(`/api/tasks/${taskId}/comments`, { comment });
      return response.data.data;
    } catch (error: any) {
      console.error("Add task comment error:", error);
      throw error;
    }
  }
}

export const taskService = new TaskService();