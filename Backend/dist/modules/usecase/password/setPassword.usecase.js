"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetPasswordUsecase = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const db_1 = require("../../../config/db");
class SetPasswordUsecase {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async execute(email, otp, currentPassword, newPassword) {
        const user = await this.userRepo.findByEmail(email);
        if (!user || !user.otp || !user.otpExpiry) {
            throw new Error("Invalid OTP request");
        }
        if (user.otpExpiry < new Date()) {
            throw new Error("OTP expired");
        }
        const otpValid = await bcrypt_1.default.compare(otp, user.otp);
        if (!otpValid) {
            throw new Error("Invalid OTP");
        }
        if (!user.tempPassword) {
            throw new Error("Temporary password not set");
        }
        const tempPasswordValid = await bcrypt_1.default.compare(currentPassword, user.tempPassword);
        if (!tempPasswordValid) {
            throw new Error("Invalid temporary password");
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await this.userRepo.updateUser(user.id, {
            password: hashedPassword,
            tempPassword: null,
            otp: null,
            otpExpiry: null,
            status: client_1.Status.ACTIVE,
            isActive: true,
        });
        // Create employee record if it doesn't exist
        await this.createEmployeeRecordIfNeeded(user.id);
    }
    async createEmployeeRecordIfNeeded(userId) {
        try {
            // Check if employee record already exists
            const existingEmployee = await db_1.prisma.employee.findUnique({
                where: { userId }
            });
            if (existingEmployee) {
                return; // Employee record already exists
            }
            const user = await db_1.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return;
            }
            // Get or create default company
            let companyId = user.companyId;
            if (!companyId) {
                const defaultCompany = await db_1.prisma.company.upsert({
                    where: { code: 'DEFAULT_COMPANY' },
                    update: {},
                    create: {
                        name: 'Default Company',
                        code: 'DEFAULT_COMPANY',
                        isActive: true
                    }
                });
                companyId = defaultCompany.id;
                // Update user with company
                await db_1.prisma.user.update({
                    where: { id: userId },
                    data: { companyId }
                });
            }
            // Get or create default department
            const defaultDepartment = await db_1.prisma.department.upsert({
                where: {
                    companyId_name: {
                        companyId: companyId,
                        name: 'General'
                    }
                },
                update: {},
                create: {
                    name: 'General',
                    type: client_1.DepartmentType.OPERATIONS,
                    companyId: companyId
                }
            });
            // Map user role to employee designation
            let designation;
            switch (user.role) {
                case 'SUPER_ADMIN':
                case 'ADMIN':
                    designation = client_1.Designation.MANAGER;
                    break;
                case 'MANAGER':
                    designation = client_1.Designation.MANAGER;
                    break;
                default:
                    designation = client_1.Designation.SOFTWARE_ENGINEER;
            }
            // Generate unique employee code
            const employeeCode = `EMP${userId.toString().padStart(4, '0')}`;
            // Create employee record
            const employee = await db_1.prisma.employee.create({
                data: {
                    userId,
                    companyId,
                    departmentId: defaultDepartment.id,
                    name: `${user.firstName} ${user.lastName}`.trim(),
                    designation,
                    employeeCode,
                    isActive: true
                }
            });
            console.log(`✅ Created employee record during password setup for user ${userId} (Employee ID: ${employee.id}, Code: ${employeeCode})`);
        }
        catch (error) {
            console.error(`❌ Failed to create employee record for user ${userId}:`, error);
            // Don't throw error to avoid breaking password setup
        }
    }
}
exports.SetPasswordUsecase = SetPasswordUsecase;
