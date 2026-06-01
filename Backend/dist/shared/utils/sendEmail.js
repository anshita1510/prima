"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer_1.default.createTransport({
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
    }
    catch (error) {
        console.error("❌ Email send failed:", error.message);
        throw error;
    }
};
exports.sendEmail = sendEmail;
