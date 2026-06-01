"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../../../config/db");
/* ================= VERIFY OTP ================= */
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
        return res.status(400).json({ message: "Invalid request" });
    }
    if (user.resetOtpExpiry < new Date()) {
        return res.status(400).json({ message: "OTP expired" });
    }
    const isOtpValid = await bcrypt_1.default.compare(otp, user.resetOtp);
    if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid OTP" });
    }
    await db_1.prisma.user.update({
        where: { email },
        data: {
            passwordResetAllowed: true,
            resetOtp: null,
            resetOtpExpiry: null,
        },
    });
    res.json({
        message: "OTP verified successfully",
        // resetToken,
    });
};
exports.verifyOtp = verifyOtp;
