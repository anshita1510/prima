import { Request, Response } from "express";
import { PrismaClient, LeaveStatus } from "@prisma/client";
import "../../../types/express"; // Import express type extensions
import { LeaveNotificationService } from "../../services/leave-notification.service";
import { LeaveApprovalService } from "../../services/leave-approval.service";

const prisma = new PrismaClient();
const notificationService = new LeaveNotificationService();
const approvalService = new LeaveApprovalService();

export const createLeave = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: "Unauthorized" 
      });
    }

    const { type, reason, startDate, endDate } = req.body;
    
    // Validate required fields
    if (!type || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: type, startDate, endDate" 
      });
    }

    // Get user's employee record
    const employee = await prisma.employee.findFirst({
      where: { userId: req.user.id },
      include: { 
        department: true,
        user: true
      }
    });

    if (!employee) {
      return res.status(400).json({ 
        success: false,
        error: "Employee record not found. Please contact admin." 
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (end < start) {
      return res.status(400).json({ 
        success: false,
        error: "End date cannot be before start date" 
      });
    }

    if (start < today) {
      return res.status(400).json({ 
        success: false,
        error: "Start date cannot be in the past" 
      });
    }

    // Check for overlapping leaves
    const hasOverlap = await approvalService.checkOverlappingLeaves(
      employee.id,
      start,
      end
    );

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        error: "You already have a leave request for overlapping dates"
      });
    }

    // Calculate leave days
    const leaveDays = approvalService.calculateLeaveDays(start, end);

    const leave = await prisma.leave.create({
      data: {
        employeeId: employee.id,
        departmentId: employee.departmentId,
        type,
        reason: reason || "",
        startDate: start,
        endDate: end,
        status: LeaveStatus.PENDING
      },
      include: {
        employee: {
          include: { user: true }
        },
        department: true
      }
    });

    // ✅ NO NOTIFICATION TO APPLICANT - Silent submission
    // Leave remains in PENDING state without any UI indication

    res.status(201).json({
      success: true,
      message: "", // ❌ Empty message - no UI indication
      leave: {
        id: leave.id,
        type: leave.type,
        reason: leave.reason,
        startDate: leave.startDate,
        endDate: leave.endDate,
        status: leave.status,
        leaveDays,
        employee: {
          name: leave.employee.name,
          employeeCode: leave.employee.employeeCode
        },
        department: leave.department.name,
        createdAt: leave.createdAt
      }
    });
  } catch (error) {
    console.error("Create leave error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to create leave application",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const getMyLeaves = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user's employee record
    const employee = await prisma.employee.findFirst({
      where: { userId: req.user.id }
    });

    if (!employee) {
      return res.status(400).json({ 
        error: "Employee record not found" 
      });
    }

    // ✅ Show ALL leaves (PENDING, APPROVED, REJECTED) to applicant
    // But NO success message on application
    const leaves = await prisma.leave.findMany({
      where: { employeeId: employee.id },
      include: { 
        employee: {
          include: { user: true }
        },
        department: true, 
        approvedBy: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedLeaves = leaves.map(leave => ({
      id: leave.id,
      type: leave.type,
      reason: leave.reason,
      startDate: leave.startDate,
      endDate: leave.endDate,
      status: leave.status,
      department: leave.department.name,
      approvedBy: leave.approvedBy ? 
        `${leave.approvedBy.user.firstName} ${leave.approvedBy.user.lastName}` : null,
      createdAt: leave.createdAt,
      updatedAt: leave.updatedAt
    }));

    res.json({
      success: true,
      leaves: formattedLeaves,
      count: formattedLeaves.length
    });
  } catch (error) {
    console.error("Get my leaves error:", error);
    res.status(500).json({ error: "Failed to fetch your leaves" });
  }
};

export const getAllLeaves = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Only admins and managers can see all leaves
    if (!['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const leaves = await prisma.leave.findMany({
      include: { 
        employee: {
          include: { user: true }
        },
        department: true, 
        approvedBy: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedLeaves = leaves.map(leave => ({
      id: leave.id,
      type: leave.type,
      reason: leave.reason,
      startDate: leave.startDate,
      endDate: leave.endDate,
      status: leave.status,
      employee: {
        name: `${leave.employee.user.firstName} ${leave.employee.user.lastName}`,
        employeeCode: leave.employee.employeeCode
      },
      department: leave.department.name,
      approvedBy: leave.approvedBy ? 
        `${leave.approvedBy.user.firstName} ${leave.approvedBy.user.lastName}` : null,
      createdAt: leave.createdAt,
      updatedAt: leave.updatedAt
    }));

    res.json({
      success: true,
      leaves: formattedLeaves,
      count: formattedLeaves.length
    });
  } catch (error) {
    console.error("Get all leaves error:", error);
    res.status(500).json({ error: "Failed to fetch leaves" });
  }
};

export const getLeaveById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const leave = await prisma.leave.findUnique({
      where: { id: Number(req.params.id) },
      include: { 
        employee: {
          include: { user: true }
        },
        department: true, 
        approvedBy: {
          include: { user: true }
        }
      }
    });

    if (!leave) {
      return res.status(404).json({ error: "Leave not found" });
    }

    // Check if user can access this leave
    const userEmployee = await prisma.employee.findFirst({
      where: { userId: req.user.id }
    });

    const canAccess = 
      leave.employeeId === userEmployee?.id || // Own leave
      ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(req.user.role); // Admin/Manager

    if (!canAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const formattedLeave = {
      id: leave.id,
      type: leave.type,
      reason: leave.reason,
      startDate: leave.startDate,
      endDate: leave.endDate,
      status: leave.status,
      employee: {
        name: `${leave.employee.user.firstName} ${leave.employee.user.lastName}`,
        employeeCode: leave.employee.employeeCode
      },
      department: leave.department.name,
      approvedBy: leave.approvedBy ? 
        `${leave.approvedBy.user.firstName} ${leave.approvedBy.user.lastName}` : null,
      createdAt: leave.createdAt,
      updatedAt: leave.updatedAt
    };

    res.json({
      success: true,
      leave: formattedLeave
    });
  } catch (error) {
    console.error("Get leave by ID error:", error);
    res.status(500).json({ error: "Failed to fetch leave" });
  }
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: "Unauthorized" 
      });
    }

    const { status, rejectionReason } = req.body;
    
    if (!Object.values(LeaveStatus).includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid status" 
      });
    }

    // Get approver's employee record
    const approverEmployee = await prisma.employee.findFirst({
      where: { userId: req.user.id },
      include: { user: true }
    });

    if (!approverEmployee) {
      return res.status(400).json({
        success: false,
        error: "Approver employee record not found"
      });
    }

    // Check if user can approve this leave
    const permission = await approvalService.canApproveLeave(
      approverEmployee.id,
      req.user.role,
      Number(req.params.id)
    );

    if (!permission.canApprove) {
      return res.status(403).json({
        success: false,
        error: permission.reason || "You don't have permission to approve this leave"
      });
    }

    // Update leave status
    const leave = await prisma.leave.update({
      where: { id: Number(req.params.id) },
      data: { 
        status, 
        approvedById: approverEmployee.id 
      },
      include: {
        employee: {
          include: { user: true }
        },
        department: true,
        approvedBy: {
          include: { user: true }
        }
      }
    });

    // ✅ SEND NOTIFICATION ONLY TO APPLICANT when status changes from PENDING
    if (status === LeaveStatus.APPROVED || status === LeaveStatus.REJECTED) {
      await notificationService.sendLeaveStatusNotification(
        leave,
        status,
        approverEmployee,
        req.user.role,
        rejectionReason
      );
    }

    const formattedLeave = {
      id: leave.id,
      type: leave.type,
      reason: leave.reason,
      startDate: leave.startDate,
      endDate: leave.endDate,
      status: leave.status,
      employee: {
        name: leave.employee.name,
        employeeCode: leave.employee.employeeCode,
        role: leave.employee.user.role
      },
      department: leave.department.name,
      approvedBy: leave.approvedBy ? leave.approvedBy.name : null,
      createdAt: leave.createdAt,
      updatedAt: leave.updatedAt
    };

    res.json({
      success: true,
      message: "", // ❌ No success message on approve/reject
      leave: formattedLeave
    });
  } catch (error) {
    console.error("Update leave status error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update leave status",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const deleteLeave = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const leave = await prisma.leave.findUnique({
      where: { id: Number(req.params.id) },
      include: { employee: true }
    });

    if (!leave) {
      return res.status(404).json({ error: "Leave not found" });
    }

    // Check if user can delete this leave
    const userEmployee = await prisma.employee.findFirst({
      where: { userId: req.user.id }
    });

    const canDelete = 
      leave.employeeId === userEmployee?.id || // Own leave
      ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role); // Admin only

    if (!canDelete) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Only allow deletion of pending leaves
    if (leave.status !== LeaveStatus.PENDING) {
      return res.status(400).json({ 
        error: "Only pending leaves can be deleted" 
      });
    }

    await prisma.leave.delete({ 
      where: { id: Number(req.params.id) } 
    });

    res.json({ 
      success: true,
      message: "Leave deleted successfully" 
    });
  } catch (error) {
    console.error("Delete leave error:", error);
    res.status(500).json({ error: "Failed to delete leave" });
  }
};

/**
 * Get leaves that the current user can approve
 */
export const getApprovableLeaves = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: "Unauthorized" 
      });
    }

    // Get approver's employee record
    const approverEmployee = await prisma.employee.findFirst({
      where: { userId: req.user.id }
    });

    if (!approverEmployee) {
      return res.status(400).json({
        success: false,
        error: "Employee record not found"
      });
    }

    const leaves = await approvalService.getApprovableLeaves(
      approverEmployee.id,
      req.user.role,
      approverEmployee.companyId
    );

    res.json({
      success: true,
      leaves,
      count: leaves.length
    });
  } catch (error) {
    console.error("Get approvable leaves error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch approvable leaves",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Get leave statistics for the current user
 */
export const getLeaveStatistics = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: "Unauthorized" 
      });
    }

    const employee = await prisma.employee.findFirst({
      where: { userId: req.user.id }
    });

    if (!employee) {
      return res.status(400).json({
        success: false,
        error: "Employee record not found"
      });
    }

    const stats = await approvalService.getLeaveStatistics(
      employee.id,
      employee.companyId
    );

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error("Get leave statistics error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch leave statistics",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Get leave notifications for the current user
 */
export const getLeaveNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: "Unauthorized" 
      });
    }

    const employee = await prisma.employee.findFirst({
      where: { userId: req.user.id }
    });

    if (!employee) {
      return res.status(400).json({
        success: false,
        error: "Employee record not found"
      });
    }

    const notifications = await prisma.notificationRecipient.findMany({
      where: {
        recipientId: employee.id,
        notification: {
          referenceType: 'leave'
        }
      },
      include: {
        notification: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    const formattedNotifications = notifications.map(nr => ({
      id: nr.id,
      notificationId: nr.notificationId,
      title: nr.notification.title,
      message: nr.notification.message,
      type: nr.notification.type,
      referenceId: nr.notification.referenceId,
      metadata: nr.notification.metadata,
      isRead: nr.isRead,
      readAt: nr.readAt,
      createdAt: nr.notification.createdAt
    }));

    const unreadCount = await notificationService.getUnreadLeaveNotificationsCount(
      employee.id
    );

    res.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount
    });
  } catch (error) {
    console.error("Get leave notifications error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch leave notifications",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Mark leave notifications as read
 */
export const markLeaveNotificationsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: "Unauthorized" 
      });
    }

    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "notificationIds must be a non-empty array"
      });
    }

    const employee = await prisma.employee.findFirst({
      where: { userId: req.user.id }
    });

    if (!employee) {
      return res.status(400).json({
        success: false,
        error: "Employee record not found"
      });
    }

    await notificationService.markLeaveNotificationsAsRead(
      employee.id,
      notificationIds
    );

    res.json({
      success: true,
      message: "Notifications marked as read"
    });
  } catch (error) {
    console.error("Mark notifications read error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to mark notifications as read",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Check if user can approve a specific leave
 */
export const checkApprovalPermission = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: "Unauthorized" 
      });
    }

    const employee = await prisma.employee.findFirst({
      where: { userId: req.user.id }
    });

    if (!employee) {
      return res.status(400).json({
        success: false,
        error: "Employee record not found"
      });
    }

    const permission = await approvalService.canApproveLeave(
      employee.id,
      req.user.role,
      Number(req.params.id)
    );

    res.json({
      success: true,
      permission
    });
  } catch (error) {
    console.error("Check approval permission error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to check approval permission",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
