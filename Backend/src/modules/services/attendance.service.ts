// src/services/attendance.service.ts
import { PrismaClient, AttendanceStatus } from '@prisma/client';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from 'date-fns';

const prisma = new PrismaClient();

export class AttendanceService {
  // Check in employee
  async checkIn(employeeId: number, companyId: number, departmentId: number) {
    const today = startOfDay(new Date());
    
    // Check if already checked in today
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      }
    });

    if (existing && existing.checkIn) {
      throw new Error('Already checked in today');
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      },
      update: {
        checkIn: new Date(),
        status: AttendanceStatus.PRESENT
      },
      create: {
        employeeId,
        companyId,
        departmentId,
        date: today,
        checkIn: new Date(),
        status: AttendanceStatus.PRESENT
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return attendance;
  }

  // Check out employee
  async checkOut(employeeId: number) {
    const today = startOfDay(new Date());

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      }
    });

    if (!attendance) {
      throw new Error('No check-in record found for today');
    }

    if (attendance.checkOut) {
      throw new Error('Already checked out today');
    }

    const updated = await prisma.attendance.update({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      },
      data: {
        checkOut: new Date()
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return updated;
  }

  // Get attendance stats for an employee
  async getAttendanceStats(employeeId: number, startDate: Date, endDate: Date) {
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    const totalDays = attendances.length;
    const presentDays = attendances.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const absentDays = attendances.filter(a => a.status === AttendanceStatus.ABSENT).length;
    const halfDays = attendances.filter(a => a.status === AttendanceStatus.HALF_DAY).length;
    const leaveDays = attendances.filter(a => a.status === AttendanceStatus.LEAVE).length;

    // Calculate total hours worked
    let totalMinutes = 0;
    attendances.forEach(attendance => {
      if (attendance.checkIn && attendance.checkOut) {
        const diff = attendance.checkOut.getTime() - attendance.checkIn.getTime();
        totalMinutes += Math.floor(diff / (1000 * 60));
      }
    });

    const avgHoursPerDay = totalDays > 0 ? totalMinutes / totalDays / 60 : 0;
    const onTimePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      halfDays,
      leaveDays,
      avgHoursPerDay: parseFloat(avgHoursPerDay.toFixed(2)),
      onTimePercentage: parseFloat(onTimePercentage.toFixed(0)),
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60
    };
  }

  // Get attendance logs for last N days
  async getAttendanceLogs(employeeId: number, days: number = 30) {
    const startDate = subDays(new Date(), days);
    
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startOfDay(startDate)
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return attendances.map(attendance => {
      let effectiveHours = 0;
      let grossHours = 0;
      let arrivalStatus = 'On Time';

      if (attendance.checkIn && attendance.checkOut) {
        const diff = attendance.checkOut.getTime() - attendance.checkIn.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        
        effectiveHours = parseFloat((minutes / 60).toFixed(2));
        grossHours = parseFloat((minutes / 60).toFixed(2));

        // Check if late (assuming 9:30 AM is standard time)
        const checkInHour = attendance.checkIn.getHours();
        const checkInMinute = attendance.checkIn.getMinutes();
        if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 30)) {
          const lateMinutes = (checkInHour - 9) * 60 + (checkInMinute - 30);
          arrivalStatus = `${Math.floor(lateMinutes / 60)}:${String(lateMinutes % 60).padStart(2, '0')}:${String(Math.floor((lateMinutes % 1) * 60)).padStart(2, '0')} late`;
        }
      }

      return {
        date: attendance.date,
        status: attendance.status,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        effectiveHours,
        grossHours,
        arrivalStatus,
        isWeekend: [0, 6].includes(attendance.date.getDay()),
        isHoliday: attendance.status === AttendanceStatus.LEAVE
      };
    });
  }

  // Get team attendance stats
  async getTeamAttendanceStats(departmentId: number, startDate: Date, endDate: Date) {
    const attendances = await prisma.attendance.findMany({
      where: {
        departmentId,
        date: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    let totalMinutes = 0;
    let totalDays = 0;

    attendances.forEach(attendance => {
      if (attendance.checkIn && attendance.checkOut) {
        const diff = attendance.checkOut.getTime() - attendance.checkIn.getTime();
        totalMinutes += Math.floor(diff / (1000 * 60));
        totalDays++;
      }
    });

    const avgHoursPerDay = totalDays > 0 ? totalMinutes / totalDays / 60 : 0;
    const onTimeCount = attendances.filter(a => {
      if (!a.checkIn) return false;
      const checkInHour = a.checkIn.getHours();
      const checkInMinute = a.checkIn.getMinutes();
      return checkInHour < 9 || (checkInHour === 9 && checkInMinute <= 30);
    }).length;
    
    const onTimePercentage = attendances.length > 0 ? (onTimeCount / attendances.length) * 100 : 0;

    return {
      avgHoursPerDay: parseFloat(avgHoursPerDay.toFixed(2)),
      onTimePercentage: parseFloat(onTimePercentage.toFixed(0)),
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60
    };
  }

  // Mark attendance manually (for admins)
  async markAttendance(
    employeeId: number,
    companyId: number,
    departmentId: number,
    date: Date,
    status: AttendanceStatus,
    checkIn?: Date,
    checkOut?: Date
  ) {
    const attendanceDate = startOfDay(date);

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: attendanceDate
        }
      },
      update: {
        status,
        checkIn,
        checkOut
      },
      create: {
        employeeId,
        companyId,
        departmentId,
        date: attendanceDate,
        status,
        checkIn,
        checkOut
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return attendance;
  }

  // Get today's attendance status
  async getTodayAttendance(employeeId: number) {
    const today = startOfDay(new Date());

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      }
    });

    return attendance;
  }

  // Get attendance calendar data
  async getAttendanceCalendar(employeeId: number, month: number, year: number) {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return attendances;
  }
}