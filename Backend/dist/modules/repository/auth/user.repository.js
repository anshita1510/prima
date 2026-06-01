"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../../../config/db");
class UserRepository {
    /* Find user by invite token (via password table) */
    async findByInviteToken(token) {
        return db_1.prisma.user.findFirst({
            where: { inviteToken: token },
        });
    }
    /* Find by email */
    async findByEmail(email) {
        return db_1.prisma.user.findUnique({
            where: { email },
            include: {
                employee: true
            }
        });
    }
    /* Find by ID */
    async findById(id) {
        return db_1.prisma.user.findUnique({
            where: { id },
            include: {
                employee: true
            }
        });
    }
    /* Count Super Admins */
    async countSuperAdmins() {
        return db_1.prisma.user.count({
            where: { role: client_1.Role.SUPER_ADMIN },
        });
    }
    /* Create user – password is optional (null during invite) */
    async create(data) {
        return db_1.prisma.user.create({
            data: {
                ...data,
                password: data.password ?? null,
                isActive: data.isActive ?? false,
            },
        });
    }
    /* Generic update */
    async updateUser(id, data) {
        return db_1.prisma.user.update({
            where: { id },
            data,
        });
    }
    /* Specific method to update only the password – CLEAN & REUSABLE */
    async updatePassword(userId, hashedPassword) {
        return db_1.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });
    }
    async findByOtp(otp) {
        return db_1.prisma.user.findFirst({
            where: {
                otp,
                otpExpiry: { gt: new Date() },
            },
        });
    }
    /* Activate user after setting password (used in invite flow) */
    async activateUser(userId, hashedPassword) {
        return db_1.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                status: client_1.Status.ACTIVE,
                isActive: true,
                // Clear invite fields
                inviteToken: null,
                inviteExpiry: null,
                tempPassword: null,
                otp: null,
                otpExpiry: null,
            },
        });
    }
}
exports.UserRepository = UserRepository;
