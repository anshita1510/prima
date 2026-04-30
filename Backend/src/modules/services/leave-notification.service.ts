import { PrismaClient, LeaveStatus, Role } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

interface LeaveWithDetails {
  id: number;
  type: string;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  employee: {
    id: number;
    name: string;
    user: {
      role: Role;
    };
  };
}

interface ApproverEmployee {
  id: number;
  name: string;
  user: {
    role: Role;
    firstName: string;
    lastName: string;
  };
}

export class LeaveNotificationService {
  /**
   * ✅ CRITICAL: NO notification sent when leave is applied
   * Leave remains silently in PENDING state
   */
  async sendLeaveApplicationNotification(): Promise<void> {
    // Intentionally empty - no notifications on application
    return;
  }

  /**
   * ✅ Send notification ONLY to applicant when leave status changes
   * Triggered only on APPROVE or REJECT action
   */
  async sendLeaveStatusNotification(
    leave: LeaveWithDetails,
    newStatus: LeaveStatus,
    approver: ApproverEmployee,
    approverRole: Role,
    rejectionReason?: string
  ): Promise<void> {
    try {
      // Only send notification if status changed from PENDING to APPROVED/REJECTED
      if (newStatus !== LeaveStatus.APPROVED && newStatus !== LeaveStatus.REJECTED) {
        return;
      }

      // Calculate leave duration
      const leaveDays = this.calculateLeaveDays(leave.startDate, leave.endDate);
      const startDateFormatted = format(new Date(leave.startDate), 'dd MMM yyyy');
      const endDateFormatted = format(new Date(leave.endDate), 'dd MMM yyyy');
      const actionDateTime = format(new Date(), 'dd MMM yyyy, hh:mm a');

      // Get approver role display name
      const approverRoleDisplay = this.getRoleDisplayName(approverRole);

      // Build notification message based on status
      let title: string;
      let message: string;

      if (newStatus === LeaveStatus.APPROVED) {
        title = '✅ Leave Request Approved';
        message = `Your ${leave.type} leave request has been APPROVED.\n\n` +
          `📅 Duration: ${startDateFormatted} to ${endDateFormatted} (${leaveDays} day${leaveDays > 1 ? 's' : ''})\n` +
          `👤 Approved by: ${approver.name} (${approverRoleDisplay})\n` +
          `🕐 Action Date: ${actionDateTime}\n\n` +
          `Your leave has been confirmed. Enjoy your time off!`;
      } else {
        title = '❌ Leave Request Rejected';
        message = `Your ${leave.type} leave request has been REJECTED.\n\n` +
          `📅 Duration: ${startDateFormatted} to ${endDateFormatted} (${leaveDays} day${leaveDays > 1 ? 's' : ''})\n` +
          `👤 Rejected by: ${approver.name} (${approverRoleDisplay})\n` +
          `🕐 Action Date: ${actionDateTime}`;
        
        if (rejectionReason) {
          message += `\n📝 Reason: ${rejectionReason}`;
        }
        
        message += `\n\nPlease contact your ${approverRoleDisplay} for more details.`;
      }

      // Create notification in database
      await prisma.notification.create({
        data: {
          title,
          message,
          type: newStatus === LeaveStatus.APPROVED ? 'TASK_UPDATED' : 'TASK_UPDATED', // Using existing types
          referenceId: leave.id,
          referenceType: 'leave',
          metadata: {
            leaveType: leave.type,
            startDate: leave.startDate,
            endDate: leave.endDate,
            leaveDays,
            status: newStatus,
            approverName: approver.name,
            approverRole: approverRole,
            actionDateTime,
            rejectionReason: rejectionReason || null
          },
          createdById: approver.id,
          recipients: {
            create: {
              recipientId: leave.employee.id, // ✅ ONLY send to applicant
              isRead: false
            }
          }
        }
      });

      console.log(`✅ Leave notification sent to applicant (Employee ID: ${leave.employee.id})`);
      console.log(`   Leave Type: ${leave.type}`);
      console.log(`   Status: ${newStatus}`);
      console.log(`   Approver: ${approver.name} (${approverRoleDisplay})`);
      console.log(`   Action Time: ${actionDateTime}`);
    } catch (error) {
      console.error('Failed to send leave status notification:', error);
      throw error;
    }
  }

  /**
   * Calculate number of leave days
   */
  private calculateLeaveDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  }

  /**
   * Get user-friendly role display name
   */
  private getRoleDisplayName(role: Role): string {
    const roleMap: Record<Role, string> = {
      SUPER_ADMIN: 'CEO',
      ADMIN: 'HR',
      MANAGER: 'Manager',
      EMPLOYEE: 'Employee'
    };
    return roleMap[role] || role;
  }

  /**
   * Get unread leave notifications count for an employee
   */
  async getUnreadLeaveNotificationsCount(employeeId: number): Promise<number> {
    const count = await prisma.notificationRecipient.count({
      where: {
        recipientId: employeeId,
        isRead: false,
        notification: {
          referenceType: 'leave'
        }
      }
    });
    return count;
  }

  /**
   * Mark leave notifications as read
   */
  async markLeaveNotificationsAsRead(
    employeeId: number,
    notificationIds: number[]
  ): Promise<void> {
    await prisma.notificationRecipient.updateMany({
      where: {
        recipientId: employeeId,
        notificationId: {
          in: notificationIds
        }
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  /**
   * Get all leave notifications for an employee
   */
  async getLeaveNotifications(employeeId: number, unreadOnly: boolean = false) {
    const where: any = {
      recipientId: employeeId,
      notification: {
        referenceType: 'leave'
      }
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notificationRecipient.findMany({
      where,
      include: {
        notification: {
          include: {
            createdBy: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return notifications.map(nr => ({
      id: nr.id,
      notificationId: nr.notificationId,
      title: nr.notification.title,
      message: nr.notification.message,
      type: nr.notification.type,
      referenceId: nr.notification.referenceId,
      metadata: nr.notification.metadata,
      isRead: nr.isRead,
      readAt: nr.readAt,
      createdAt: nr.notification.createdAt,
      approver: {
        name: nr.notification.createdBy.name,
        role: nr.notification.createdBy.user.role
      }
    }));
  }
}
