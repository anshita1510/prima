"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCalendarQuerySchema = exports.GetLogsQuerySchema = exports.GetStatsQuerySchema = exports.MarkAttendanceSchema = exports.CheckOutSchema = exports.CheckInSchema = exports.AttendanceStatusEnum = void 0;
// src/dto/attendance.dto.ts
const zod_1 = require("zod");
// Define AttendanceStatus enum locally for validation
exports.AttendanceStatusEnum = zod_1.z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE']);
// Check-in DTO
exports.CheckInSchema = zod_1.z.object({
    employeeId: zod_1.z.number().positive('Employee ID must be a positive number'),
    companyId: zod_1.z.number().positive('Company ID must be a positive number'),
    departmentId: zod_1.z.number().positive('Department ID must be a positive number')
});
// Check-out DTO
exports.CheckOutSchema = zod_1.z.object({
    employeeId: zod_1.z.number().positive('Employee ID must be a positive number')
});
// Mark attendance DTO
exports.MarkAttendanceSchema = zod_1.z.object({
    employeeId: zod_1.z.number().positive('Employee ID must be a positive number'),
    companyId: zod_1.z.number().positive('Company ID must be a positive number'),
    departmentId: zod_1.z.number().positive('Department ID must be a positive number'),
    date: zod_1.z.string().or(zod_1.z.date()).transform(val => new Date(val)),
    status: exports.AttendanceStatusEnum,
    checkIn: zod_1.z.string().or(zod_1.z.date()).transform(val => new Date(val)).optional(),
    checkOut: zod_1.z.string().or(zod_1.z.date()).transform(val => new Date(val)).optional()
});
// Query params DTOs
exports.GetStatsQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(['week', 'month', 'year']).optional().default('week')
});
exports.GetLogsQuerySchema = zod_1.z.object({
    days: zod_1.z.string().regex(/^\d+$/, 'Days must be a number').optional().default('30')
});
exports.GetCalendarQuerySchema = zod_1.z.object({
    month: zod_1.z.string().regex(/^(0?[1-9]|1[0-2])$/, 'Month must be between 1 and 12'),
    year: zod_1.z.string().regex(/^\d{4}$/, 'Year must be a 4-digit number')
});
