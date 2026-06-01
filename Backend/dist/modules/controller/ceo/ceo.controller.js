"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CeoController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../../../config/db");
const nodemailer_service_1 = require("../../repository/email/nodemailer.service");
const client_1 = require("@prisma/client");
const emailService = new nodemailer_service_1.NodemailerService();
class CeoController {
    async createCeo(req, res) {
        try {
            const { firstName, lastName, email, phoneNumber, companyId } = req.body;
            if (!firstName || !email || !phoneNumber || !companyId) {
                return res.status(400).json({ success: false, error: 'firstName, email, phoneNumber and companyId are required' });
            }
            // Email uniqueness check
            const existingUser = await db_1.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
            if (existingUser) {
                return res.status(400).json({ success: false, error: 'Email already in use' });
            }
            const company = await db_1.prisma.company.findUnique({ where: { id: Number(companyId) } });
            if (!company) {
                return res.status(404).json({ success: false, error: 'Company not found' });
            }
            // Collision-safe ceoId
            let ceoId;
            let attempts = 0;
            do {
                const randomStr = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
                ceoId = `CEO-${company.code}-${randomStr}`;
                const existing = await db_1.prisma.user.findFirst({ where: { ceoId } });
                if (!existing)
                    break;
                attempts++;
            } while (attempts < 10);
            // Auto-generate a temporary password
            const tempPassword = crypto_1.default.randomBytes(8).toString('hex');
            const hashedPassword = await bcrypt_1.default.hash(tempPassword, 12);
            const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
            const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            const user = await db_1.prisma.user.create({
                data: {
                    firstName: firstName.trim(),
                    lastName: (lastName || '').trim(),
                    email: email.toLowerCase().trim(),
                    phone: phoneNumber.trim(),
                    password: hashedPassword,
                    companyId: company.id,
                    role: client_1.Role.ADMIN,
                    designation: 'CEO',
                    status: client_1.Status.PENDING,
                    isActive: false,
                    isVerified: false,
                    verificationToken,
                    inviteExpiry: tokenExpiry,
                    ceoId,
                }
            });
            // Also create a default department and employee record to allow attendance check-ins
            const defaultDepartment = await db_1.prisma.department.upsert({
                where: { companyId_name: { companyId: company.id, name: 'Management' } },
                update: {},
                create: { name: 'Management', type: 'OPERATIONS', companyId: company.id }
            });
            await db_1.prisma.employee.create({
                data: {
                    userId: user.id,
                    companyId: company.id,
                    departmentId: defaultDepartment.id,
                    name: `${firstName} ${lastName || ''}`.trim(),
                    designation: 'MANAGER',
                    employeeCode: ceoId,
                    isActive: true
                }
            });
            // Confirmation email — clicking redirects to login
            const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify?token=${verificationToken}`;
            const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Welcome to PRIMA HRMS</title>
</head>

<body style="margin:0;padding:0;background:#f6f8fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="560" cellpadding="0" cellspacing="0"
          style="max-width:560px;width:100%;border-radius:16px;overflow:hidden;background:#ffffff;box-shadow:0 10px 40px rgba(0,0,0,0.06);">

          <!-- Header (Light Gradient) -->
          <tr>
            <td style="background:linear-gradient(135deg,#eef2ff 0%,#f8fafc 100%);padding:36px 32px;text-align:center;border-bottom:1px solid #e2e8f0;">
              
              <div style="margin-bottom:12px;">
                <span style="font-size:12px;font-weight:700;letter-spacing:0.18em;color:#6366f1;text-transform:uppercase;">
                  PRIMA HRMS
                </span>
              </div>

              <h1 style="margin:0;font-size:24px;font-weight:700;color:#0f172a;">
                Welcome aboard 👋
              </h1>

              <p style="margin:6px 0 0;font-size:13px;color:#64748b;">
                Smart Workforce Management Platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">

              <p style="color:#0f172a;font-size:15px;font-weight:600;margin:0 0 8px;">
                Hello, ${firstName}
              </p>

              <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
                You've been appointed as the 
                <strong style="color:#4f46e5;">Chief Executive Officer (CEO)</strong> of 
                <strong>${company.name}</strong> on PRIMA HRMS.
                Your account is ready — please use the credentials below to get started.
              </p>

              <!-- CEO ID -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:14px;">
                <p style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.12em;margin:0 0 4px;text-transform:uppercase;">
                  CEO ID
                </p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;font-family:monospace;">
                  ${ceoId}
                </p>
              </div>

              <!-- Password -->
              <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
                <p style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.12em;margin:0 0 4px;text-transform:uppercase;">
                  Temporary Password
                </p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;font-family:monospace;">
                  ${tempPassword}
                </p>
              </div>

              <p style="color:#475569;font-size:14px;margin:0 0 18px;">
                Click below to verify your account and access your dashboard:
              </p>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${loginLink}"
                  style="display:inline-block;padding:14px 32px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                  Go to Login →
                </a>
              </div>

              <!-- Note -->
              <div style="background:#f8fafc;border-radius:8px;padding:12px 14px;border:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
                  🔒 This link expires in <strong style="color:#0f172a;">7 days</strong>.
                  For security, please update your password after your first login.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 24px;text-align:center;border-top:1px solid #e2e8f0;background:#fafbff;">
              
              <p style="font-size:11px;color:#94a3b8;margin:0 0 4px;">
                © ${new Date().getFullYear()} PRIMA HRMS
              </p>

              <p style="font-size:11px;color:#cbd5e1;margin:0;">
                Secure • Reliable • Enterprise-grade
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
            // Non-blocking email
            emailService.sendEmail({
                to: user.email,
                subject: `Welcome to PRIMA HRMS — Confirm Your CEO Account`,
                html: emailHtml,
            }).catch(err => console.error('Email send error:', err));
            return res.status(201).json({
                success: true,
                message: 'CEO created successfully. Confirmation email sent.',
                ceo: {
                    id: user.id,
                    ceoId: user.ceoId,
                    email: user.email,
                    name: `${firstName} ${lastName || ''}`.trim(),
                    company: company.name,
                    companyCode: company.code,
                }
            });
        }
        catch (error) {
            console.error('Error creating CEO:', error);
            return res.status(500).json({ success: false, error: 'Failed to create CEO' });
        }
    }
    async getAllCeos(req, res) {
        try {
            const { page = 1, limit = 20, search } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = {
                role: client_1.Role.ADMIN,
                ceoId: { not: null },
            };
            if (search) {
                where.OR = [
                    { firstName: { contains: String(search), mode: 'insensitive' } },
                    { lastName: { contains: String(search), mode: 'insensitive' } },
                    { email: { contains: String(search), mode: 'insensitive' } },
                    { ceoId: { contains: String(search), mode: 'insensitive' } },
                ];
            }
            const [ceos, total] = await Promise.all([
                db_1.prisma.user.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    select: {
                        id: true, firstName: true, lastName: true, email: true,
                        phone: true, ceoId: true, status: true, isActive: true,
                        isVerified: true, createdAt: true,
                        company: { select: { id: true, name: true, code: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                db_1.prisma.user.count({ where })
            ]);
            return res.json({
                success: true,
                ceos: ceos.map(c => ({
                    ...c,
                    name: `${c.firstName} ${c.lastName}`,
                    companyName: c.company?.name,
                    companyCode: c.company?.code,
                })),
                total,
                page: Number(page),
                limit: Number(limit),
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: 'Failed to fetch CEOs' });
        }
    }
    async getCeoById(req, res) {
        try {
            const { id } = req.params;
            const user = await db_1.prisma.user.findFirst({
                where: { id: Number(id), role: client_1.Role.ADMIN, ceoId: { not: null } },
                include: { company: { select: { id: true, name: true, code: true } } }
            });
            if (!user)
                return res.status(404).json({ success: false, error: 'CEO not found' });
            return res.json({ success: true, ceo: user });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: 'Failed to fetch CEO' });
        }
    }
    async deleteCeo(req, res) {
        try {
            const { id } = req.params;
            const user = await db_1.prisma.user.findFirst({
                where: { id: Number(id), role: client_1.Role.ADMIN, ceoId: { not: null } }
            });
            if (!user)
                return res.status(404).json({ success: false, error: 'CEO not found' });
            // Soft delete — deactivate
            await db_1.prisma.user.update({
                where: { id: Number(id) },
                data: { isActive: false, status: client_1.Status.INACTIVE }
            });
            return res.json({ success: true, message: 'CEO deactivated successfully' });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: 'Failed to delete CEO' });
        }
    }
}
exports.CeoController = CeoController;
