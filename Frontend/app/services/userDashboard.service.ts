import api from '@/lib/axios';

export type EmployeeDashboardPayload = {
  summary: {
    myTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    hoursThisWeek: number;
    completionRate: number;
  };
  weeklyAttendance: { day: string; hours: number; status: string }[];
  taskDistribution: { name: string; value: number; color: string }[];
  monthlyProgress: { week: string; completed: number; assigned: number }[];
  productivityTrend: { month: string; tasks: number; hours: number }[];
  recentActivity: {
    id: string;
    type: 'task_completed' | 'task_started' | 'time_logged' | 'comment_added';
    title: string;
    description: string;
    timestamp: string;
    user: string;
  }[];
};

export const userDashboardService = {
  async fetchEmployeeDashboard(): Promise<{ success: boolean; data?: EmployeeDashboardPayload; message?: string }> {
    try {
      const res = await api.get('/api/dashboard/employee');
      if (res.data?.success && res.data.data) {
        return { success: true, data: res.data.data as EmployeeDashboardPayload };
      }
      return { success: false, message: res.data?.message || 'Unexpected response' };
    } catch (e: any) {
      return {
        success: false,
        message: e.response?.data?.message || e.message || 'Failed to load dashboard',
      };
    }
  },
};
