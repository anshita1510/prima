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
  });
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log(
    "SMTP_PASS:",
    process.env.SMTP_PASS ? "LOADED" : "MISSING"
  );

  await transporter.sendMail({
    from: `"Support" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
};
