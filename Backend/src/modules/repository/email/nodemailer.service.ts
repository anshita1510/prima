import nodemailer from "nodemailer";
import { EmailService } from "../../domain/email/email.service";
import { SendEmailDTO } from "../../dto/email/sendEmail.dto";

export class NodemailerService implements EmailService {
  // Lazy transporter — only created on first send, not at construction time
  private transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

  private getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 8000,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  async sendEmail(data: SendEmailDTO): Promise<void> {
    // Hard 10s timeout so a hanging SMTP connection never blocks the caller
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Email send timeout')), 10000)
    );

    try {
      await Promise.race([
        this.getTransporter().sendMail({
          from: `"PRIMA Team" <${process.env.SMTP_USER}>`,
          to: data.to,
          subject: data.subject,
          html: data.html,
        }),
        timeout,
      ]);
      console.log('✅ Email sent to:', data.to);
    } catch (error: any) {
      // Never throw — email failure must not affect user creation
      console.error('❌ Email send failed (non-fatal):', error.message);
    }
  }
}
