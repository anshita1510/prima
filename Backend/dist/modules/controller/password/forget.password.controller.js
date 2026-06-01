"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../../../config/db");
const sendEmail_1 = require("../../../shared/utils/sendEmail");
/* ================= FORGOT PASSWORD ================= */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        console.log(`\n🔍 Forgot password request for: ${email}`);
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`❌ Email not found in database: ${email}`);
            return res.status(404).json({ message: "Email does not exist" });
        }
        const userName = `${user.firstName} ${user.lastName}`.trim();
        console.log(`✅ User found: ${userName} (${user.role})`);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt_1.default.hash(otp, 10);
        await db_1.prisma.user.update({
            where: { email },
            data: {
                resetOtp: hashedOtp,
                resetOtpExpiry: new Date(Date.now() + 5 * 60 * 1000),
            },
        });
        console.log(`🔐 Generated OTP for ${email}: ${otp}`);
        console.log(`⏰ OTP expires in 5 minutes`);
        await (0, sendEmail_1.sendEmail)(email, "Reset Password OTP - PRIMA", `Hello ${userName},\n\nYour OTP for password reset is: ${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nPRIMA Team`);
        console.log(`✅ OTP email sent successfully to ${email}\n`);
        res.json({ message: "OTP sent to email successfully" });
    }
    catch (error) {
        console.error("❌ Forgot password error:", error);
        res.status(500).json({
            message: "Failed to send OTP. Please try again.",
            error: error.message
        });
    }
};
exports.forgotPassword = forgotPassword;
