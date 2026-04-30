
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../../config/db";
import { sendEmail } from "../../../shared/utils/sendEmail";

/* ================= VERIFY OTP ================= */
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.resetOtp || !user.resetOtpExpiry) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (user.resetOtpExpiry < new Date()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  const isOtpValid = await bcrypt.compare(otp, user.resetOtp);

  if (!isOtpValid) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  await prisma.user.update({
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