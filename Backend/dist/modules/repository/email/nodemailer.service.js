"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodemailerService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class NodemailerService {
    constructor() {
        // Lazy transporter — only created on first send, not at construction time
        this.transporter = null;
    }
    getTransporter() {
        if (!this.transporter) {
            this.transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false,
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 15000,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        }
        return this.transporter;
    }
    async sendEmail(data) {
        // Hard 15s timeout so a hanging SMTP connection never blocks the caller
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Email send timeout')), 15000));
        try {
            const info = await Promise.race([
                this.getTransporter().sendMail({
                    from: `"PRIMA Team" <${process.env.SMTP_USER}>`,
                    to: data.to,
                    subject: data.subject,
                    html: data.html,
                }),
                timeout,
            ]);
            console.log('✅ Email sent to:', data.to);
        }
        catch (error) {
            // Never throw — email failure must not affect user creation
            console.error('❌ Email send failed (non-fatal):', error.message);
            console.error('Full error:', error);
        }
    }
}
exports.NodemailerService = NodemailerService;
