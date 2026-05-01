import api from '../../lib/axios';

export interface AnalyticsData {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  userRegistrations: UserRegistrationData[];
  companyRegistrations: CompanyRegistrationData[];
  roleDistribution: RoleDistributionData[];
  activityTrends: ActivityTrendData[];
  currentTotals: {
    totalUsers: number;
    totalAdmins: number;
    totalCeos: number;
    totalManagers: number;
    totalHr: number;
    totalCompanies: number;
    activeUsers: number;
  };
}

export interface UserRegistrationData {
  period: string;
  total: number;
  ceos: number;
  managers: number;
  hr: number;
  otherAdmins: number;
}

export interface CompanyRegistrationData {
  period: string;
  total: number;
  active: number;
}

export interface RoleDistributionData {
  role: string;
  count: number;
  color: string;
}

export interface ActivityTrendData {
  period: string;
  activity: number;
}

export interface AnalyticsResponse {
  success: boolean;
  analytics: AnalyticsData;
}

export interface DetailedAnalyticsResponse {
  success: boolean;
  metric: string;
  period: string;
  data: any[];
}

export type TimePeriod = 'weekly' | 'monthly' | 'yearly';

class AnalyticsService {
  /**
   * Get analytics data for charts (SuperAdmin only)
   */
  async getAnalyticsData(period: TimePeriod = 'monthly', offset: number = 0): Promise<AnalyticsResponse> {
    try {
      const response = await api.get(`/api/analytics/data?period=${period}&offset=${offset}`);
      return response.data;
    } catch (error: any) {
      console.error("Get analytics data error:", error);
      throw error;
    }
  }

  /**
   * Get detailed analytics for a specific metric (SuperAdmin only)
   */
  async getDetailedAnalytics(metric: string, period: TimePeriod = 'monthly'): Promise<DetailedAnalyticsResponse> {
    try {
      const response = await api.get(`/api/analytics/detailed?metric=${metric}&period=${period}`);
      return response.data;
    } catch (error: any) {
      console.error("Get detailed analytics error:", error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();