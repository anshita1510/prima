"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSuperAdminUsecase = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jwt = __importStar(require("jsonwebtoken"));
const sendEmail_usecase_1 = require("../../usecase/email/sendEmail.usecase");
const nodemailer_service_1 = require("../../repository/email/nodemailer.service");
const db_1 = require("../../../config/db");
const emailService = new nodemailer_service_1.NodemailerService();
const sendEmailUseCase = new sendEmail_usecase_1.SendEmailUseCase(emailService);
const JWT_SECRET_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_ENV) {
    throw new Error("JWT_SECRET is not defined");
}
const JWT_SECRET = JWT_SECRET_ENV;
const jwtOptions = {
    expiresIn: "7d",
};
class CreateSuperAdminUsecase {
    async execute(data) {
        // Prevent multiple Super Admins
        const existing = await db_1.prisma.user.findFirst({
            where: { role: "SUPER_ADMIN" },
        });
        if (existing) {
            throw new Error("Super Admin already exists");
        }
        // Generate secure random password
        const rawPassword = crypto_1.default.randomBytes(8).toString("hex");
        const hashedPassword = await bcrypt_1.default.hash(rawPassword, 10);
        // Generate invite token (kept for consistency, even if not used)
        const inviteToken = crypto_1.default.randomBytes(32).toString("hex");
        const inviteExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        // Create Super Admin
        const user = await db_1.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone, // ← Provided correctly
                designation: data.designation,
                role: "SUPER_ADMIN",
                status: "ACTIVE",
                isActive: true,
                inviteToken,
                inviteExpiry,
                companyId: data.companyId ?? null,
            },
        });
        // Generate JWT for immediate login
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, JWT_SECRET, jwtOptions);
        console.log("SUPER ADMIN TOKEN:", token);
        // Send credentials via email
        await sendEmailUseCase.execute({
            to: user.email,
            subject: "Your Super Admin Credentials",
            html: `
        <h2>Welcome ${user.firstName}!</h2>
        <p>Your Super Admin account has been created.</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Temporary Password:</b> ${rawPassword}</p>
        <p><strong>Please change your password after logging in.</strong></p>
        <br/>
        <p>Thank you,<br/>Team PRIMA</p>
      `,
        });
        // Return safe user data + token
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                designation: user.designation,
                role: user.role,
                status: user.status,
                isActive: user.isActive,
            },
            token,
        };
    }
}
exports.CreateSuperAdminUsecase = CreateSuperAdminUsecase;
