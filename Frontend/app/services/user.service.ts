import api from '../../lib/axios';

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  designation: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  companyName?: string;
  companyId?: string | number;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  designation: string;
  role: string;
  companyName?: string;
  companyId?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserResponse {
  success: boolean;
  user: User;
  message: string;
}

export interface GetUsersResponse {
  success: boolean;
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface Company {
  id: number;
  name: string;
  code: string;
  userCount?: number;
  employeeCount?: number;
  departmentCount?: number;
}

export interface CompanyFull extends Company {
  industry?: string;
  plan?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface GetCompaniesResponse {
  success: boolean;
  companies: Company[];
}

export interface GetCurrentCompanyResponse {
  success: boolean;
  company: Company;
}

export interface CreateCompanyData {
  name: string;
  industry?: string;
  description?: string;
  technology?: string;
  plan?: string;
}

export interface CreateCompanyResponse {
  success: boolean;
  company: Company;
  message: string;
}

export interface Ceo {
  id: number;
  ceoId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  isActive: boolean;
  isVerified: boolean;
  companyId?: number;
  companyName?: string;
  companyCode?: string;
  createdAt: string;
}

export interface CreateCeoData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyId: number;
  password: string;
}

export interface CreateCeoResponse {
  success: boolean;
  message: string;
  ceo: {
    id: number;
    ceoId: string;
    email: string;
    name: string;
    company: string;
    companyCode: string;
  };
}

export interface GetCeosResponse {
  success: boolean;
  ceos: Ceo[];
  total: number;
  page: number;
  limit: number;
}

class UserService {
  async createUser(userData: CreateUserData): Promise<CreateUserResponse> {
    try {
      const response = await api.post('/api/users/register', userData);
      return response.data;
    } catch (error: any) {
      const msg =
        error.code === 'ECONNABORTED'
          ? 'Request timed out. Please check the server is running and try again.'
          : error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Failed to create user';
      throw new Error(msg);
    }
  }

  async getUsers(page = 1, limit = 10, search?: string): Promise<GetUsersResponse> {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append('search', search);
      const response = await api.get(`/api/users?${params}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async updateUser(userId: number, userData: Partial<CreateUserData>): Promise<CreateUserResponse> {
    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async resendInvitation(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/api/users/${userId}/resend-invitation`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  generateEmployeeId(firstName: string, lastName: string): string {
    const initials = `${firstName.substring(0, 2)}${lastName.substring(0, 2)}`.toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EMP${initials}${randomNum}`;
  }

  generateCompanyId(companyName: string): string {
    const cleanName = companyName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${cleanName}${randomSuffix}`;
  }

  validateEmployeeId(employeeId: string): boolean {
    return /^[A-Za-z0-9_-]+$/.test(employeeId) &&
      employeeId.length >= 3 &&
      employeeId.length <= 20;
  }

  async getCompanies(): Promise<GetCompaniesResponse> {
    const response = await api.get('/api/companies');
    return response.data;
  }

  async getCurrentUserCompany(): Promise<GetCurrentCompanyResponse> {
    const response = await api.get('/api/companies/current');
    return response.data;
  }

  async createCompany(companyData: CreateCompanyData): Promise<CreateCompanyResponse> {
    const response = await api.post('/api/companies', companyData);
    return response.data;
  }

  async updateCompany(
    companyId: number,
    companyData: Partial<CreateCompanyData & { isActive: boolean }>
  ): Promise<CreateCompanyResponse> {
    const response = await api.put(`/api/companies/${companyId}`, companyData);
    return response.data;
  }

  async getCompanyById(id: number): Promise<{ success: boolean; company: CompanyFull }> {
    const response = await api.get(`/api/companies/${id}`);
    return response.data;
  }

  async deleteCompany(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/companies/${id}`);
    return response.data;
  }

  async createCeo(data: CreateCeoData): Promise<CreateCeoResponse> {
    const response = await api.post('/api/ceos', data);
    return response.data;
  }

  async getCeos(page = 1, limit = 20, search?: string): Promise<GetCeosResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    const response = await api.get(`/api/ceos?${params}`);
    return response.data;
  }

  async deleteCeo(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/ceos/${id}`);
    return response.data;
  }
}

export const userService = new UserService();
