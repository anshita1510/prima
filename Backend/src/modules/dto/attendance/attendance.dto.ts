// src/dto/attendance.dto.ts
import { z } from 'zod';

// Define AttendanceStatus enum locally for validation
export const AttendanceStatusEnum = z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE']);

// Check-in DTO
export const CheckInSchema = z.object({
  employeeId: z.number().positive('Employee ID must be a positive number'),
  companyId: z.number().positive('Company ID must be a positive number'),
  departmentId: z.number().positive('Department ID must be a positive number')
});

export type CheckInDto = z.infer<typeof CheckInSchema>;

// Check-out DTO
export const CheckOutSchema = z.object({
  employeeId: z.number().positive('Employee ID must be a positive number')
});

export type CheckOutDto = z.infer<typeof CheckOutSchema>;

// Mark attendance DTO
export const MarkAttendanceSchema = z.object({
  employeeId: z.number().positive('Employee ID must be a positive number'),
  companyId: z.number().positive('Company ID must be a positive number'),
  departmentId: z.number().positive('Department ID must be a positive number'),
  date: z.string().or(z.date()).transform(val => new Date(val)),
  status: AttendanceStatusEnum,
  checkIn: z.string().or(z.date()).transform(val => new Date(val)).optional(),
  checkOut: z.string().or(z.date()).transform(val => new Date(val)).optional()
});

export type MarkAttendanceDto = z.infer<typeof MarkAttendanceSchema>;

// Query params DTOs
export const GetStatsQuerySchema = z.object({
  period: z.enum(['week', 'month', 'year']).optional().default('week')
});

export type GetStatsQueryDto = z.infer<typeof GetStatsQuerySchema>;

export const GetLogsQuerySchema = z.object({
  days: z.string().regex(/^\d+$/, 'Days must be a number').optional().default('30')
});

export type GetLogsQueryDto = z.infer<typeof GetLogsQuerySchema>;

export const GetCalendarQuerySchema = z.object({
  month: z.string().regex(/^(0?[1-9]|1[0-2])$/, 'Month must be between 1 and 12'),
  year: z.string().regex(/^\d{4}$/, 'Year must be a 4-digit number')
});

export type GetCalendarQueryDto = z.infer<typeof GetCalendarQuerySchema>;

// Response DTOs
export interface AttendanceStatsDto {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  avgHoursPerDay: number;
  onTimePercentage: number;
  totalHours: number;
  totalMinutes: number;
}

export interface AttendanceLogDto {
  date: Date;
  status: string;
  checkIn: Date | null;
  checkOut: Date | null;
  effectiveHours: number;
  grossHours: number;
  arrivalStatus: string;
  isWeekend: boolean;
  isHoliday: boolean;
}

export interface TeamStatsDto {
  avgHoursPerDay: number;
  onTimePercentage: number;
  totalHours: number;
  totalMinutes: number;
}

export interface AttendanceResponseDto {
  id: number;
  employeeId: number;
  companyId: number;
  departmentId: number;
  date: Date;
  status: string;
  checkIn: Date | null;
  checkOut: Date | null;
  createdAt: Date;
  updatedAt: Date;
}