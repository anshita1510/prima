import api from '../../lib/axios';

export interface Employee {
  id: number;
  name: string;
  designation: string;
  employeeCode: string;
  user: {
    email: string;
  };
  department: {
    id: number;
    name: string;
  };
}

export interface EmployeeFilters {
  departmentId?: number;
  designation?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

class EmployeeService {
  /**
   * Get all employees (with filters)
   */
  async getEmployees(filters: EmployeeFilters = {}): Promise<{ employees: Employee[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/employees?${params}`);
      
      if (response.data.success) {
        return {
          employees: response.data.data || [],
          pagination: response.data.pagination || {}
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch employees');
      }
    } catch (error: any) {
      console.error("Get employees error:", error);
      throw error;
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: number): Promise<Employee> {
    try {
      const response = await api.get(`/api/employees/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Get employee by ID error:", error);
      throw error;
    }
  }
}

export const employeeService = new EmployeeService();