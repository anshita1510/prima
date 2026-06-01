"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../../../config/db");
const resetPassword = async (req, res) => {
    const { newPassword, confirmPassword, email } = req.body;
    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required....." });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }
    // 🔐 Find the user who passed OTP verification
    // If email is provided, use it; otherwise find any user with passwordResetAllowed
    const whereClause = email
        ? { email, passwordResetAllowed: true }
        : { passwordResetAllowed: true };
    const user = await db_1.prisma.user.findFirst({
        where: whereClause,
    });
    if (!user) {
        return res.status(403).json({
            message: "OTP verification required or invalid session",
        });
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await db_1.prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetAllowed: false, // 🔒 lock again
            resetOtp: null,
            resetOtpExpiry: null,
        },
    });
    return res.json({
        message: "Password reset successful",
    });
};
exports.resetPassword = resetPassword;
