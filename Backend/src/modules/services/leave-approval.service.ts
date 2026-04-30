import { PrismaClient, Role, LeaveStatus, Designation } from '@prisma/client';

const prisma = new PrismaClient();

export interface ApprovalPermission {
  canApprove: boolean;
  reason?: string;
}

export class LeaveApprovalService {
  /**
   * Check if a user can approve a specific leave request
   * Uses DESIGNATION-based approval for Manager leaves
   */
  async canApproveLeave(
    approverId: number,
    approverRole: Role,
    leaveId: number
  ): Promise<ApprovalPermission> {
    console.log('🔍 Checking approval permission:', {
      approverId,
      approverRole,
      leaveId
    });

    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      include: {
        employee: {
          include: {
            user: true
          }
        }
      }
    });

    if (!leave) {
      return {
        canApprove: false,
        reason: 'Leave request not found'
      };
    }

    // Cannot approve own leave
    if (leave.employeeId === approverId) {
      console.log('🔴 Cannot approve own leave:', {
        leaveEmployeeId: leave.employeeId,
        leaveEmployeeName: leave.employee.name,
        leaveEmployeeDesignation: leave.employee.designation,
        approverId: approverId,
        leaveId: leaveId
      });
      return {
        canApprove: false,
        reason: 'You cannot approve your own leave request'
      };
    }

    // Leave must be pending
    if (leave.status !== LeaveStatus.PENDING) {
      return {
        canApprove: false,
        reason: `Leave request is already ${leave.status.toLowerCase()}`
      };
    }

    // Get approver's designation
    const approver = await prisma.employee.findUnique({
      where: { id: approverId },
      select: { 
        designation: true,
        name: true,
        employeeCode: true
      }
    });

    if (!approver) {
      return {
        canApprove: false,
        reason: 'Approver not found'
      };
    }

    const applicantDesignation = leave.employee.designation;
    const approverDesignation = approver.designation;

    console.log('📋 Designation-based approval check:', {
      applicant: {
        id: leave.employeeId,
        name: leave.employee.name,
        designation: applicantDesignation
      },
      approver: {
        id: approverId,
        name: approver.name,
        designation: approverDesignation,
        role: approverRole
      }
    });

    // DESIGNATION-BASED APPROVAL LOGIC ONLY
    
    // 1. Junior designations (INTERN, SOFTWARE_ENGINEER, SENIOR_ENGINEER, TECH_LEAD)
    if (applicantDesignation === Designation.INTERN || 
        applicantDesignation === Designation.SOFTWARE_ENGINEER || 
        applicantDesignation === Designation.SENIOR_ENGINEER || 
        applicantDesignation === Designation.TECH_LEAD) {
      // Junior employees can be approved by MANAGER or HR
      if (approverDesignation === Designation.MANAGER || approverDesignation === Designation.HR) {
        return { canApprove: true };
      }
      return {
        canApprove: false,
        reason: 'Only Manager or HR (by designation) can approve employee leave requests'
      };
    }

    // 2. MANAGER designation leaves
    if (applicantDesignation === Designation.MANAGER) {
      // Managers can be approved by HR, MANAGER, or DIRECTOR
      if (approverDesignation === Designation.HR || 
          approverDesignation === Designation.MANAGER || 
          approverDesignation === Designation.DIRECTOR) {
        return { canApprove: true };
      }
      return {
        canApprove: false,
        reason: 'Only HR, Manager, or Director (by designation) can approve manager leave requests'
      };
    }

    // 3. HR designation leaves
    if (applicantDesignation === Designation.HR) {
      // HR can be approved by MANAGER, HR, DIRECTOR or CEO (SUPER_ADMIN role)
      if (approverDesignation === Designation.MANAGER || 
          approverDesignation === Designation.HR || 
          approverDesignation === Designation.DIRECTOR || 
          approverRole === 'SUPER_ADMIN') {
        return { canApprove: true };
      }
      return {
        canApprove: false,
        reason: 'Only Manager, HR, Director or CEO can approve HR leave requests'
      };
    }

    // 4. DIRECTOR designation leaves
    if (applicantDesignation === Designation.DIRECTOR) {
      // Directors can only be approved by CEO (SUPER_ADMIN role)
      if (approverRole === 'SUPER_ADMIN') {
        return { canApprove: true };
      }
      return {
        canApprove: false,
        reason: 'Only CEO can approve Director leave requests'
      };
    }

    return {
      canApprove: false,
      reason: 'Invalid approval configuration'
    };
  }

  /**
   * Get leaves that the user can approve
   * Uses DESIGNATION-based filtering for Manager leaves
   */
  async getApprovableLeaves(
    approverId: number,
    approverRole: Role,
    companyId: number
  ): Promise<any[]> {
    // Get approver's designation
    const approver = await prisma.employee.findUnique({
      where: { id: approverId },
      select: { designation: true }
    });

    if (!approver) {
      return [];
    }

    const approverDesignation = approver.designation;

    let whereClause: any = {
      status: LeaveStatus.PENDING,
      employee: {
        companyId,
        NOT: {
          id: approverId // Exclude own leaves
        }
      }
    };

    // Filter based on approver designation ONLY
    if (approverDesignation === Designation.MANAGER) {
      // Managers can approve junior employees, HR, and other Managers
      whereClause.employee = {
        ...whereClause.employee,
        designation: {
          in: [Designation.INTERN, Designation.SOFTWARE_ENGINEER, Designation.SENIOR_ENGINEER, Designation.TECH_LEAD, Designation.HR, Designation.MANAGER]
        }
      };
    } else if (approverDesignation === Designation.HR) {
      // HR can approve junior employees, Managers, and other HR
      whereClause.employee = {
        ...whereClause.employee,
        designation: {
          in: [Designation.INTERN, Designation.SOFTWARE_ENGINEER, Designation.SENIOR_ENGINEER, Designation.TECH_LEAD, Designation.MANAGER, Designation.HR]
        }
      };
    } else if (approverDesignation === Designation.DIRECTOR) {
      // Directors can approve manager and HR designation leaves
      whereClause.employee = {
        ...whereClause.employee,
        designation: {
          in: [Designation.MANAGER, Designation.HR]
        }
      };
    } else if (approverRole === 'SUPER_ADMIN') {
      // CEO can approve all designation leaves
      whereClause.employee = {
        ...whereClause.employee,
        designation: {
          in: [Designation.INTERN, Designation.SOFTWARE_ENGINEER, Designation.SENIOR_ENGINEER, Designation.TECH_LEAD, Designation.MANAGER, Designation.HR, Designation.DIRECTOR]
        }
      };
    } else {
      // Other designations cannot approve any leaves
      return [];
    }

    const leaves = await prisma.leave.findMany({
      where: whereClause,
      include: {
        employee: {
          include: {
            user: true,
            department: true
          }
        },
        department: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return leaves.map(leave => ({
      id: leave.id,
      type: leave.type,
      reason: leave.reason,
      startDate: leave.startDate,
      endDate: leave.endDate,
      status: leave.status,
      employee: {
        id: leave.employee.id,
        name: leave.employee.name,
        employeeCode: leave.employee.employeeCode,
        role: leave.employee.user.role,
        designation: leave.employee.designation
      },
      department: leave.department.name,
      createdAt: leave.createdAt,
      updatedAt: leave.updatedAt
    }));
  }

  /**
   * Get leave statistics for dashboard
   */
  async getLeaveStatistics(
    employeeId: number,
    companyId: number
  ): Promise<any> {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const leaves = await prisma.leave.findMany({
      where: {
        employeeId,
        employee: {
          companyId
        },
        startDate: {
          gte: yearStart,
          lte: yearEnd
        }
      }
    });

    const stats = {
      total: leaves.length,
      pending: leaves.filter(l => l.status === LeaveStatus.PENDING).length,
      approved: leaves.filter(l => l.status === LeaveStatus.APPROVED).length,
      rejected: leaves.filter(l => l.status === LeaveStatus.REJECTED).length,
      byType: {
        CASUAL: leaves.filter(l => l.type === 'CASUAL').length,
        SICK: leaves.filter(l => l.type === 'SICK').length,
        EARNED: leaves.filter(l => l.type === 'EARNED').length,
        UNPAID: leaves.filter(l => l.type === 'UNPAID').length
      }
    };

    return stats;
  }

  /**
   * Calculate leave days
   */
  calculateLeaveDays(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  }

  /**
   * Check for overlapping leaves
   */
  async checkOverlappingLeaves(
    employeeId: number,
    startDate: Date,
    endDate: Date,
    excludeLeaveId?: number
  ): Promise<boolean> {
    const whereClause: any = {
      employeeId,
      status: {
        in: [LeaveStatus.PENDING, LeaveStatus.APPROVED]
      },
      OR: [
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: startDate } }
          ]
        },
        {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: endDate } }
          ]
        },
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } }
          ]
        }
      ]
    };

    if (excludeLeaveId) {
      whereClause.NOT = { id: excludeLeaveId };
    }

    const overlapping = await prisma.leave.findFirst({
      where: whereClause
    });

    return !!overlapping;
  }
}
