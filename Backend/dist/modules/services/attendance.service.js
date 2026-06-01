"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
// src/services/attendance.service.ts
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
class AttendanceService {
    // Check in employee
    async checkIn(employeeId, companyId, departmentId) {
        const today = (0, date_fns_1.startOfDay)(new Date());
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
                status: client_1.AttendanceStatus.PRESENT
            },
            create: {
                employeeId,
                companyId,
                departmentId,
                date: today,
                checkIn: new Date(),
                status: client_1.AttendanceStatus.PRESENT
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
    async checkOut(employeeId) {
        const today = (0, date_fns_1.startOfDay)(new Date());
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
    async getAttendanceStats(employeeId, startDate, endDate) {
        const attendances = await prisma.attendance.findMany({
            where: {
                employeeId,
                date: {
                    gte: (0, date_fns_1.startOfDay)(startDate),
                    lte: (0, date_fns_1.endOfDay)(endDate)
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        const totalDays = attendances.length;
        const presentDays = attendances.filter(a => a.status === client_1.AttendanceStatus.PRESENT).length;
        const absentDays = attendances.filter(a => a.status === client_1.AttendanceStatus.ABSENT).length;
        const halfDays = attendances.filter(a => a.status === client_1.AttendanceStatus.HALF_DAY).length;
        const leaveDays = attendances.filter(a => a.status === client_1.AttendanceStatus.LEAVE).length;
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
    async getAttendanceLogs(employeeId, days = 30) {
        const startDate = (0, date_fns_1.subDays)(new Date(), days);
        const attendances = await prisma.attendance.findMany({
            where: {
                employeeId,
                date: {
                    gte: (0, date_fns_1.startOfDay)(startDate)
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
                isHoliday: attendance.status === client_1.AttendanceStatus.LEAVE
            };
        });
    }
    // Get team attendance stats
    async getTeamAttendanceStats(departmentId, startDate, endDate) {
        const attendances = await prisma.attendance.findMany({
            where: {
                departmentId,
                date: {
                    gte: (0, date_fns_1.startOfDay)(startDate),
                    lte: (0, date_fns_1.endOfDay)(endDate)
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
            if (!a.checkIn)
                return false;
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
    async markAttendance(employeeId, companyId, departmentId, date, status, checkIn, checkOut) {
        const attendanceDate = (0, date_fns_1.startOfDay)(date);
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
    async getTodayAttendance(employeeId) {
        const today = (0, date_fns_1.startOfDay)(new Date());
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
    async getAttendanceCalendar(employeeId, month, year) {
        const startDate = (0, date_fns_1.startOfMonth)(new Date(year, month - 1));
        const endDate = (0, date_fns_1.endOfMonth)(new Date(year, month - 1));
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
exports.AttendanceService = AttendanceService;
