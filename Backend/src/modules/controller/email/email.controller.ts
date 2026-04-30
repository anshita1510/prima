
import { Request, Response } from "express";
import { sendEmail } from "../../../shared/utils/sendEmail";

export const sendEmailController = async (req: Request, res: Response) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ message: "Missing fields" });
  }

  await sendEmail(to, subject, message);

  return res.json({ message: "Email sent successfully" });
};
