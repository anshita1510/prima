import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  console.log("📧 Attempting to send email to:", to);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "LOADED" : "MISSING");

  try {
    const info = await transporter.sendMail({
      from: `"PRIMA Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    console.log("✅ Email sent successfully:", info.messageId);
    return info;
  } catch (error: any) {
    console.error("❌ Email send failed:", error.message);
    throw error;
  }
};
