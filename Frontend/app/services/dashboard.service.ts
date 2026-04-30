import api from '../../lib/axios';

export interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalManagers: number;
  totalEmployees: number;
  totalCompanies: number;
  totalProjects: number;
  totalDepartments: number;
  activeUsers: number;
  pendingApprovals: number;
  systemHealth: number;
  recentRegistrations: number;
}

export interface RecentActivity {
  id: string;
  type: 'admin_created' | 'user_created' | 'company_created' | 'system_update' | 'security_alert';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface DashboardStatsResponse {
  success: boolean;
  stats: DashboardStats;
}

export interface RecentActivityResponse {
  success: boolean;
  activities: RecentActivity[];
}

class DashboardService {
  /**
   * Get dashboard statistics (SuperAdmin only)
   */
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    try {
      const response = await api.get('/api/dashboard/stats');
      return response.data;
    } catch (error: any) {
      console.error("Get dashboard stats error:", error);
      throw error;
    }
  }

  /**
   * Get recent system activity (SuperAdmin only)
   */
  async getRecentActivity(): Promise<RecentActivityResponse> {
    try {
      const response = await api.get('/api/dashboard/activity');
      return response.data;
    } catch (error: any) {
      console.error("Get recent activity error:", error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();