import { PrismaClient, AuditAction, RequestStatus, AttendanceStatus, RegularizationType } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

interface CheckInData {
  employeeId: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    deviceType: string;
  };
}

interface CheckOutData {
  employeeId: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    deviceType: string;
  };
}

interface RegularizationRequestData {
  employeeId: number;
  attendanceId: number;
  requestType: RegularizationType;
  reason: string;
  proposedCheckIn?: Date;
  proposedCheckOut?: Date;
  proposedStatus?: AttendanceStatus;
}

interface AttendanceCorrectionData {
  attendanceId: number;
  checkIn?: Date;
  checkOut?: Date;
  status?: AttendanceStatus;
  reason: string;
  correctedBy: number;
}

class AttendanceService {
  // Personal Attendance Methods
  async checkIn(data: CheckInData, req: Request) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get employee details first
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
      include: { user: true }
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Get existing attendance for today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: data.employeeId,
          date: today
        }
      }
    });

    const checkInTime = new Date();

    // Check if currently checked in (has check-in but no check-out)
    if (existingAttendance) {
      // Parse existing time slots
      const timeSlots = (existingAttendance.timeSlots as any) || [];

      // Check if there's an open slot (checked in but not checked out)
      const hasOpenSlot = timeSlots.some((slot: any) => slot.checkIn && !slot.checkOut);

      if (hasOpenSlot) {
        throw new Error('Already checked in. Please check out first.');
      }

      // Add new check-in slot
      timeSlots.push({
        checkIn: checkInTime.toISOString(),
        checkOut: null
      });

      // Determine status based on first check-in of the day
      const firstCheckIn = timeSlots[0]?.checkIn ? new Date(timeSlots[0].checkIn) : checkInTime;
      const status = this.determineAttendanceStatus(firstCheckIn, 'checkin');

      console.log(`✅ Employee ${employee.name} (ID: ${data.employeeId}) checking in again at ${checkInTime.toISOString()}`);

      const attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          timeSlots: timeSlots,
          status,
          location: data.location,
          deviceInfo: data.deviceInfo,
          updatedAt: new Date()
        }
      });

      // Create audit entry
      await this.createAuditEntry({
        attendanceId: attendance.id,
        action: AuditAction.CHECK_IN,
        performedBy: data.employeeId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        newValues: { checkIn: checkInTime, status, timeSlots },
        reason: 'Employee check-in (multiple)'
      });

      return attendance;
    }

    // First check-in of the day
    const status = this.determineAttendanceStatus(checkInTime, 'checkin');

    console.log(`✅ Employee ${employee.name} (ID: ${data.employeeId}) checking in at ${checkInTime.toISOString()}`);

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: data.employeeId,
        companyId: employee.companyId,
        departmentId: employee.departmentId,
        date: today,
        checkIn: checkInTime,
        status,
        location: data.location,
        deviceInfo: data.deviceInfo,
        timeSlots: [{
          checkIn: checkInTime.toISOString(),
          checkOut: null
        }]
      }
    });

    // Create audit entry
    await this.createAuditEntry({
      attendanceId: attendance.id,
      action: AuditAction.CHECK_IN,
      performedBy: data.employeeId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      newValues: { checkIn: checkInTime, status },
      reason: 'Employee check-in (first)'
    });

    return attendance;
  }

  async checkOut(data: CheckOutData, req: Request) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: data.employeeId,
          date: today
        }
      },
      include: {
        employee: true
      }
    });

    if (!attendance) {
      throw new Error('No check-in found for today. Please check in first.');
    }

    const checkOutTime = new Date();

    // Parse existing time slots
    const timeSlots = (attendance.timeSlots as any) || [];

    // Find the last open slot (checked in but not checked out)
    const openSlotIndex = timeSlots.findIndex((slot: any) => slot.checkIn && !slot.checkOut);

    if (openSlotIndex === -1) {
      throw new Error('No active check-in found. Please check in first.');
    }

    // Update the open slot with check-out time
    timeSlots[openSlotIndex].checkOut = checkOutTime.toISOString();

    // Calculate total work hours from all completed slots
    let totalWorkMinutes = 0;
    timeSlots.forEach((slot: any) => {
      if (slot.checkIn && slot.checkOut) {
        const checkInDate = new Date(slot.checkIn);
        const checkOutDate = new Date(slot.checkOut);
        const diffMs = checkOutDate.getTime() - checkInDate.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        totalWorkMinutes += diffMinutes;
      }
    });

    const totalWorkHours = totalWorkMinutes / 60;
    const overtime = this.calculateOvertime(totalWorkHours);

    // Determine final status based on first check-in and last check-out
    const firstCheckIn = new Date(timeSlots[0].checkIn);
    const lastCheckOut = checkOutTime;
    const finalStatus = this.determineFinalAttendanceStatus(firstCheckIn, lastCheckOut);

    console.log(`✅ Employee ${attendance.employee.name} (ID: ${data.employeeId}) checking out at ${checkOutTime.toISOString()}`);
    console.log(`📊 Total Work Hours: ${totalWorkHours.toFixed(2)}h, Overtime: ${overtime}h, Status: ${finalStatus}`);
    console.log(`📋 Time Slots: ${timeSlots.length} entries`);

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        timeSlots: timeSlots,
        workHours: totalWorkHours,
        overtime,
        status: finalStatus,
        location: data.location,
        deviceInfo: data.deviceInfo,
        updatedAt: new Date()
      }
    });

    // Create audit entry
    await this.createAuditEntry({
      attendanceId: attendance.id,
      action: AuditAction.CHECK_OUT,
      performedBy: data.employeeId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      oldValues: { checkOut: null },
      newValues: {
        checkOut: checkOutTime,
        workHours: totalWorkHours,
        overtime,
        status: finalStatus,
        timeSlots
      },
      reason: 'Employee check-out'
    });

    return updatedAttendance;
  }

  async getPersonalAttendanceHistory(employeeId: number, startDate?: Date, endDate?: Date) {
    const whereClause: any = { employeeId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    return await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: {
        regularizationRequests: {
          include: {
            approver: {
              select: { name: true }
            }
          }
        }
      }
    });
  }

  async submitRegularizationRequest(data: RegularizationRequestData, req: Request) {
    // Check if employee is trying to self-approve (separation of duties)
    const attendance = await prisma.attendance.findUnique({
      where: { id: data.attendanceId },
      include: { employee: true }
    });

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    const request = await prisma.regularizationRequest.create({
      data: {
        employeeId: data.employeeId,
        attendanceId: data.attendanceId,
        requestType: data.requestType,
        reason: data.reason,
        proposedCheckIn: data.proposedCheckIn,
        proposedCheckOut: data.proposedCheckOut,
        proposedStatus: data.proposedStatus,
        status: RequestStatus.PENDING
      }
    });

    // Create audit entry
    await this.createRegularizationAuditEntry({
      requestId: request.id,
      action: AuditAction.CREATE,
      performedBy: data.employeeId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      newValues: data,
      reason: 'Regularization request submitted'
    });

    return request;
  }

  // Employee Management Methods
  async getAllEmployeeAttendance(date?: Date, departmentId?: number) {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    const whereClause: any = { date: targetDate };
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    return await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
            designation: true
          }
        },
        department: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { checkIn: 'asc' }
      ]
    });
  }

  async performManualAttendanceCorrection(data: AttendanceCorrectionData, req: Request) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: data.attendanceId }
    });

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    if (attendance.isLocked) {
      throw new Error('Cannot modify locked attendance record');
    }

    const oldValues = {
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      status: attendance.status
    };

    const updatedAttendance = await prisma.attendance.update({
      where: { id: data.attendanceId },
      data: {
        checkIn: data.checkIn || attendance.checkIn,
        checkOut: data.checkOut || attendance.checkOut,
        status: data.status || attendance.status,
        isManuallyEdited: true,
        editReason: data.reason,
        editedBy: data.correctedBy,
        editedAt: new Date(),
        workHours: data.checkIn && data.checkOut ?
          this.calculateWorkHours(data.checkIn, data.checkOut) :
          attendance.workHours
      }
    });

    // Create audit entry
    await this.createAuditEntry({
      attendanceId: data.attendanceId,
      action: AuditAction.UPDATE,
      performedBy: data.correctedBy,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      oldValues,
      newValues: {
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        status: data.status
      },
      reason: data.reason
    });

    return updatedAttendance;
  }

  async getPendingRegularizationRequests(approverId?: number) {
    const whereClause: any = { status: RequestStatus.PENDING };

    // If approverId is provided, filter by department or reporting structure
    if (approverId) {
      // Add logic to filter based on approval hierarchy
    }

    return await prisma.regularizationRequest.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
            designation: true
          }
        },
        attendance: {
          select: {
            date: true,
            checkIn: true,
            checkOut: true,
            status: true
          }
        }
      },
      orderBy: { submittedAt: 'asc' }
    });
  }

  async approveRegularizationRequest(requestId: string, approverId: number, req: Request) {
    const request = await prisma.regularizationRequest.findUnique({
      where: { id: requestId },
      include: { employee: true, attendance: true }
    });

    if (!request) {
      throw new Error('Regularization request not found');
    }

    // Prevent self-approval (separation of duties)
    if (request.employeeId === approverId) {
      throw new Error('Cannot approve your own regularization request');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new Error('Request is not in pending status');
    }

    // Update the request
    const updatedRequest = await prisma.regularizationRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.APPROVED,
        approvedBy: approverId,
        approvedAt: new Date()
      }
    });

    // Apply the changes to the attendance record
    await prisma.attendance.update({
      where: { id: request.attendanceId },
      data: {
        checkIn: request.proposedCheckIn || request.attendance.checkIn,
        checkOut: request.proposedCheckOut || request.attendance.checkOut,
        status: request.proposedStatus || request.attendance.status,
        requiresApproval: false,
        approvedBy: approverId,
        approvedAt: new Date()
      }
    });

    // Create audit entry
    await this.createRegularizationAuditEntry({
      requestId,
      action: AuditAction.APPROVE,
      performedBy: approverId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      oldValues: { status: RequestStatus.PENDING },
      newValues: { status: RequestStatus.APPROVED, approvedBy: approverId },
      reason: 'Regularization request approved'
    });

    return updatedRequest;
  }

  async rejectRegularizationRequest(requestId: string, approverId: number, rejectionReason: string, req: Request) {
    const request = await prisma.regularizationRequest.findUnique({
      where: { id: requestId },
      include: { employee: true }
    });

    if (!request) {
      throw new Error('Regularization request not found');
    }

    // Prevent self-rejection (separation of duties)
    if (request.employeeId === approverId) {
      throw new Error('Cannot reject your own regularization request');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new Error('Request is not in pending status');
    }

    const updatedRequest = await prisma.regularizationRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REJECTED,
        approvedBy: approverId,
        approvedAt: new Date(),
        rejectionReason
      }
    });

    // Create audit entry
    await this.createRegularizationAuditEntry({
      requestId,
      action: AuditAction.REJECT,
      performedBy: approverId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      oldValues: { status: RequestStatus.PENDING },
      newValues: { status: RequestStatus.REJECTED, rejectionReason },
      reason: rejectionReason
    });

    return updatedRequest;
  }

  // Reporting Methods
  async generateDailyAttendanceReport(date: Date, departmentId?: number) {
    const whereClause: any = { date };
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
            designation: true
          }
        },
        department: {
          select: {
            name: true
          }
        }
      }
    });

    const summary = {
      totalEmployees: attendances.length,
      present: attendances.filter(a => a.status === AttendanceStatus.PRESENT).length,
      absent: attendances.filter(a => a.status === AttendanceStatus.ABSENT).length,
      late: attendances.filter(a => a.status === AttendanceStatus.LATE).length,
      earlyDeparture: attendances.filter(a => a.status === AttendanceStatus.EARLY_DEPARTURE).length,
      halfDay: attendances.filter(a => a.status === AttendanceStatus.HALF_DAY).length,
      leave: attendances.filter(a => a.status === AttendanceStatus.LEAVE).length,
      presentPercentage: attendances.length > 0 ? Math.round((attendances.filter(a => a.status === AttendanceStatus.PRESENT).length / attendances.length) * 100) : 0,
      totalWorkHours: attendances.reduce((sum, a) => sum + (a.workHours || 0), 0),
      totalOvertime: attendances.reduce((sum, a) => sum + (a.overtime || 0), 0)
    };

    return {
      date,
      summary,
      attendances
    };
  }

  async generateMonthlyAttendanceReport(year: number, month: number, departmentId?: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
            designation: true
          }
        }
      }
    });

    // Group by employee
    const employeeAttendance = attendances.reduce((acc, attendance) => {
      const empId = attendance.employeeId;
      if (!acc[empId]) {
        acc[empId] = {
          employee: attendance.employee,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          totalWorkHours: 0,
          totalOvertime: 0,
          attendances: []
        };
      }

      acc[empId].totalDays++;
      acc[empId].attendances.push(attendance);

      if (attendance.status === AttendanceStatus.PRESENT) acc[empId].presentDays++;
      if (attendance.status === AttendanceStatus.ABSENT) acc[empId].absentDays++;
      if (attendance.status === AttendanceStatus.LATE) acc[empId].lateDays++;

      acc[empId].totalWorkHours += attendance.workHours || 0;
      acc[empId].totalOvertime += attendance.overtime || 0;

      return acc;
    }, {} as any);

    return {
      period: { year, month },
      employeeAttendance: Object.values(employeeAttendance)
    };
  }

  // Audit Methods
  async getAuditTrail(attendanceId?: number, employeeId?: number, startDate?: Date, endDate?: Date) {
    const whereClause: any = {};

    if (attendanceId) {
      whereClause.attendanceId = attendanceId;
    }

    if (employeeId) {
      whereClause.attendance = {
        employeeId
      };
    }

    if (startDate || endDate) {
      whereClause.performedAt = {};
      if (startDate) whereClause.performedAt.gte = startDate;
      if (endDate) whereClause.performedAt.lte = endDate;
    }

    return await prisma.attendanceAuditEntry.findMany({
      where: whereClause,
      include: {
        performer: {
          select: {
            id: true,
            name: true,
            employeeCode: true
          }
        },
        attendance: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                employeeCode: true
              }
            }
          }
        }
      },
      orderBy: { performedAt: 'desc' }
    });
  }

  // Helper Methods
  private determineAttendanceStatus(checkInTime: Date, type: 'checkin' | 'checkout'): AttendanceStatus {
    const hour = checkInTime.getHours();
    const minute = checkInTime.getMinutes();

    if (type === 'checkin') {
      // Late if after 9:30 AM
      if (hour > 9 || (hour === 9 && minute > 30)) {
        return AttendanceStatus.LATE;
      }
      return AttendanceStatus.PRESENT;
    }

    return AttendanceStatus.PRESENT;
  }

  private determineFinalAttendanceStatus(checkIn: Date, checkOut: Date): AttendanceStatus {
    const checkInHour = checkIn.getHours();
    const checkInMinute = checkIn.getMinutes();
    const checkOutHour = checkOut.getHours();
    const checkOutMinute = checkOut.getMinutes();

    // Check if late (after 9:30 AM)
    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 30);

    // Check if early departure (before 6:30 PM)
    const isEarlyDeparture = checkOutHour < 18 || (checkOutHour === 18 && checkOutMinute < 30);

    if (isLate && isEarlyDeparture) {
      return AttendanceStatus.PARTIAL;
    } else if (isLate) {
      return AttendanceStatus.LATE;
    } else if (isEarlyDeparture) {
      return AttendanceStatus.EARLY_DEPARTURE;
    } else {
      return AttendanceStatus.PRESENT;
    }
  }

  private calculateWorkHours(checkIn: Date, checkOut: Date): number {
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // Round to 2 decimal places
    return Math.round(diffHours * 100) / 100;
  }

  private calculateOvertime(workHours: number): number {
    // Standard work hours: 9:30 AM to 6:30 PM = 9 hours
    const standardHours = 9;
    const overtime = workHours > standardHours ? workHours - standardHours : 0;

    // Round to 2 decimal places
    return Math.round(overtime * 100) / 100;
  }

  // Auto checkout functionality
  async performAutoCheckout() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all employees who are checked in but not checked out
    const pendingAttendances = await prisma.attendance.findMany({
      where: {
        date: today,
        checkIn: { not: null },
        checkOut: null
      },
      include: {
        employee: true
      }
    });

    console.log(`🕕 Auto-checkout process: Found ${pendingAttendances.length} employees to check out`);

    const results = [];

    for (const attendance of pendingAttendances) {
      try {
        // Set checkout time to exactly 6:30 PM
        const checkOutTime = new Date();
        checkOutTime.setHours(18, 30, 0, 0);

        const workHours = this.calculateWorkHours(attendance.checkIn!, checkOutTime);
        const overtime = this.calculateOvertime(workHours);
        const finalStatus = this.determineFinalAttendanceStatus(attendance.checkIn!, checkOutTime);

        const updatedAttendance = await prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            checkOut: checkOutTime,
            workHours,
            overtime,
            status: finalStatus,
            isManuallyEdited: true,
            editReason: 'Auto checkout at 6:30 PM',
            editedBy: null, // System auto-checkout
            editedAt: new Date(),
            updatedAt: new Date()
          }
        });

        // Create audit entry
        await this.createAuditEntry({
          attendanceId: attendance.id,
          action: AuditAction.CHECK_OUT,
          performedBy: attendance.employeeId,
          ipAddress: 'system',
          userAgent: 'auto-checkout-system',
          oldValues: { checkOut: null },
          newValues: {
            checkOut: checkOutTime,
            workHours,
            overtime,
            status: finalStatus,
            autoCheckout: true
          },
          reason: 'Automatic checkout at 6:30 PM'
        });

        results.push({
          employeeId: attendance.employeeId,
          employeeName: attendance.employee.name,
          workHours,
          overtime,
          status: finalStatus,
          success: true
        });

        console.log(`✅ Auto-checkout: ${attendance.employee.name} - ${workHours}h (${overtime}h OT)`);

      } catch (error: any) {
        console.error(`❌ Auto-checkout failed for employee ${attendance.employee.name}:`, error.message);
        results.push({
          employeeId: attendance.employeeId,
          employeeName: attendance.employee.name,
          success: false,
          error: error.message
        });
      }
    }

    return {
      processedCount: results.length,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length,
      results
    };
  }

  private async createAuditEntry(data: {
    attendanceId: number;
    action: AuditAction;
    performedBy: number;
    ipAddress?: string;
    userAgent?: string;
    oldValues?: any;
    newValues?: any;
    reason?: string;
    sessionId?: string;
  }) {
    return await prisma.attendanceAuditEntry.create({
      data: {
        attendanceId: data.attendanceId,
        action: data.action,
        performedBy: data.performedBy,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        oldValues: data.oldValues,
        newValues: data.newValues,
        reason: data.reason,
        sessionId: data.sessionId,
        isImmutable: true
      }
    });
  }

  private async createRegularizationAuditEntry(data: {
    requestId: string;
    action: AuditAction;
    performedBy: number;
    ipAddress?: string;
    userAgent?: string;
    oldValues?: any;
    newValues?: any;
    reason?: string;
    sessionId?: string;
  }) {
    return await prisma.regularizationAuditEntry.create({
      data: {
        requestId: data.requestId,
        action: data.action,
        performedBy: data.performedBy,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        oldValues: data.oldValues,
        newValues: data.newValues,
        reason: data.reason,
        sessionId: data.sessionId,
        isImmutable: true
      }
    });
  }
}

export const attendanceService = new AttendanceService();