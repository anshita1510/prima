export interface LeaveApplication {
  type: 'CASUAL' | 'SICK' | 'EARNED' | 'UNPAID';
  reason?: string;
  startDate: string;
  endDate: string;
}

export interface Leave {
  id: number;
  type: string;
  reason?: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  employee: {
    id?: number;
    name: string;
    employeeCode: string;
    role?: string;
    designation?: string;
  };
  department: string;
  approvedBy?: string;
  leaveDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: number;
  type: string;
  reason?: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  employee: {
    id: number;
    name: string;
    employeeCode: string;
    role: string;
    designation: string;
  };
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: {
    CASUAL: number;
    SICK: number;
    EARNED: number;
    UNPAID: number;
  };
}

export interface LeaveNotification {
  id: number;
  notificationId: number;
  title: string;
  message: string;
  type: string;
  referenceId?: number;
  metadata?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface ApprovalPermission {
  canApprove: boolean;
  reason?: string;
}

export interface LeaveResponse {
  success: boolean;
  message?: string;
  leave?: Leave;
  leaves?: Leave[] | LeaveRequest[];
  count?: number;
  statistics?: LeaveStats;
  notifications?: LeaveNotification[];
  unreadCount?: number;
  permission?: ApprovalPermission;
  error?: string;
}

class LeaveService {
  getPendingLeaves() {
    throw new Error('Method not implemented.');
  }
  getLeaveStats(id: any) {
    throw new Error('Method not implemented.');
  }
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';

  constructor() {
    console.log('🔧 LeaveService initialized with baseUrl:', this.baseUrl);
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Apply for leave
   */
  async applyLeave(leaveData: LeaveApplication): Promise<LeaveResponse> {
    try {
      console.log('📤 Applying for leave:', leaveData);
      
      const response = await fetch(`${this.baseUrl}/api/leaves`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(leaveData)
      });

      const data = await response.json();
      console.log('📥 Apply leave response:', { status: response.status, data });
      
      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Failed to apply for leave';
        console.error('❌ Apply leave failed:', errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('💥 Apply leave error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to apply for leave');
    }
  }

  /**
   * Get my leaves
   */
  async getMyLeaves(): Promise<LeaveResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaves/my-leaves`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaves');
      }

      return data;
    } catch (error) {
      console.error('Get my leaves error:', error);
      throw error;
    }
  }

  /**
   * Get all leaves (for admins/managers)
   */
  async getAllLeaves(): Promise<LeaveResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaves`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch all leaves');
      }

      return data;
    } catch (error) {
      console.error('Get all leaves error:', error);
      throw error;
    }
  }

  /**
   * Get leaves that can be approved by current user
   */
  async getApprovableLeaves(): Promise<LeaveResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaves/approvable`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch approvable leaves');
      }

      return data;
    } catch (error) {
      console.error('Get approvable leaves error:', error);
      throw error;
    }
  }

  /**
   * Get leave by ID
   */
  async getLeaveById(id: number): Promise<LeaveResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaves/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leave');
      }

      return data;
    } catch (error) {
      console.error('Get leave by ID error:', error);
      throw error;
    }
  }

  /**
   * Update leave status (approve/reject)
   */
  async updateLeaveStatus(
    id: number,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
  ): Promise<LeaveResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaves/${id}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, rejectionReason })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update leave status');
      }

      return data;
    } catch (error) {
      console.error('Update leave status error:', error);
      throw error;
    }
  }

  /**
   * Delete leave
   */
  async deleteLeave(id: number): Promise<LeaveResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaves/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete leave');
      }

      return data;
    } catch (error) {
      console.error('Delete leave error:', error);
      throw error;
    }
  }

  /**
   * Get leave statistics
   */
  async getLeaveStatistics(): Promise<LeaveResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaves/statistics`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leave statistics');
      }

      return data;
    } catch (error) {
      console.error('Get leave statistics error:', error);
      throw error;
    }
  }

  /**
   * Get leave notifications
   */
  async getLeaveNotifications(): Promise<LeaveResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaves/notifications`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notifications');
      }

      return data;
    } catch (error) {
      console.error('Get leave notifications error:', error);
      throw error;
    }
  }

  /**
   * Mark notifications as read
   */
  async markNotificationsRead(notificationIds: number[]): Promise<LeaveResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaves/notifications/mark-read`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ notificationIds })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark notifications as read');
      }

      return data;
    } catch (error) {
      console.error('Mark notifications read error:', error);
      throw error;
    }
  }

  /**
   * Check if user can approve a specific leave
   */
  async checkApprovalPermission(leaveId: number): Promise<LeaveResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaves/${leaveId}/can-approve`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check approval permission');
      }

      return data;
    } catch (error) {
      console.error('Check approval permission error:', error);
      throw error;
    }
  }

  // Helper method to calculate leave duration
  calculateLeaveDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  // Helper method to format leave type for display
  formatLeaveType(type: string): string {
    switch (type) {
      case 'CASUAL':
        return 'Casual Leave';
      case 'SICK':
        return 'Sick Leave';
      case 'EARNED':
        return 'Earned Leave';
      case 'UNPAID':
        return 'Unpaid Leave';
      default:
        return type;
    }
  }

  // Helper method to get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'APPROVED':
        return 'text-green-600 bg-green-100';
      case 'REJECTED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}

export const leaveService = new LeaveService();
