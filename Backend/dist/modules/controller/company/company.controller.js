"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const db_1 = require("../../../config/db");
class CompanyController {
    async generateUniqueCompanyCode() {
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
            // Format: CMP-{RANDOM-ALPHANUMERIC}-{TIMESTAMP}
            const randomAlphanumeric = Math.random().toString(36).substring(2, 8).toUpperCase();
            // Timestamp as DDMMYYYY for the example format (or just Date.now())
            const date = new Date();
            const timestamp = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
            const code = `CMP-${randomAlphanumeric}-${timestamp}`;
            const existingCompany = await db_1.prisma.company.findUnique({
                where: { code }
            });
            if (!existingCompany) {
                return code;
            }
            attempts++;
        }
        const fallbackStamp = Date.now().toString().slice(-6);
        return `CMP-FALLBK-${fallbackStamp}`;
    }
    /**
     * Create a new company (SuperAdmin only)
     */
    async createCompany(req, res) {
        try {
            const user = req.user;
            // Only SuperAdmin can create companies
            if (user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. SuperAdmin access required.',
                    code: 'INSUFFICIENT_PERMISSIONS'
                });
            }
            const { name, industry, description, technology, plan } = req.body;
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Company name is required',
                    code: 'MISSING_REQUIRED_FIELDS'
                });
            }
            // Check for duplicate names (since Prisma has @unique on name)
            const existingName = await db_1.prisma.company.findUnique({ where: { name: name.trim() } });
            if (existingName) {
                return res.status(400).json({
                    success: false,
                    message: 'Company name already exists',
                    code: 'DUPLICATE_COMPANY_NAME'
                });
            }
            // Generate unique company code automatically
            const code = await this.generateUniqueCompanyCode();
            const calculatedPlan = plan && ['TRIAL', 'BASIC', 'PRO', 'ENTERPRISE'].includes(plan.toUpperCase())
                ? plan.toUpperCase()
                : 'TRIAL';
            // Create the company
            const company = await db_1.prisma.company.create({
                data: {
                    name: name.trim(),
                    code: code,
                    industry: industry || null,
                    description: description || null,
                    technology: technology || null,
                    plan: calculatedPlan,
                    isActive: true
                }
            });
            console.log(`✅ SuperAdmin ${user.email} created company: ${company.name} (${company.code})`);
            return res.status(201).json({
                success: true,
                message: 'Company created successfully',
                company: {
                    id: company.id,
                    name: company.name,
                    code: company.code,
                    industry: company.industry,
                    description: company.description,
                    technology: company.technology,
                    plan: company.plan,
                    isActive: company.isActive,
                    createdAt: company.createdAt
                }
            });
        }
        catch (error) {
            console.error('Error creating company:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create company',
                error: error.message
            });
        }
    }
    /**
     * Update company (SuperAdmin only)
     */
    async updateCompany(req, res) {
        try {
            const user = req.user;
            // Only SuperAdmin can update companies
            if (user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. SuperAdmin access required.',
                    code: 'INSUFFICIENT_PERMISSIONS'
                });
            }
            const { id } = req.params;
            const { name, code, isActive, industry, plan } = req.body;
            const companyId = parseInt(id);
            if (isNaN(companyId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid company ID',
                    code: 'INVALID_COMPANY_ID'
                });
            }
            // Check if company exists
            const existingCompany = await db_1.prisma.company.findUnique({
                where: { id: companyId }
            });
            if (!existingCompany) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found',
                    code: 'COMPANY_NOT_FOUND'
                });
            }
            // If code is being changed, check for conflicts
            if (code && code.toUpperCase() !== existingCompany.code) {
                const codeConflict = await db_1.prisma.company.findUnique({
                    where: { code: code.toUpperCase() }
                });
                if (codeConflict) {
                    return res.status(400).json({
                        success: false,
                        message: 'Company with this code already exists',
                        code: 'COMPANY_CODE_EXISTS'
                    });
                }
            }
            const calculatedPlan = plan && ['TRIAL', 'BASIC', 'PRO', 'ENTERPRISE'].includes(plan.toUpperCase())
                ? plan.toUpperCase()
                : undefined;
            // Update the company
            const updatedCompany = await db_1.prisma.company.update({
                where: { id: companyId },
                data: {
                    ...(name && { name: name.trim() }),
                    ...(code && { code: code.toUpperCase().trim() }),
                    ...(industry !== undefined && { industry }),
                    ...(calculatedPlan && { plan: calculatedPlan }),
                    ...(typeof isActive === 'boolean' && { isActive })
                }
            });
            console.log(`✅ SuperAdmin ${user.email} updated company: ${updatedCompany.name}`);
            return res.json({
                success: true,
                message: 'Company updated successfully',
                company: {
                    id: updatedCompany.id,
                    name: updatedCompany.name,
                    code: updatedCompany.code,
                    isActive: updatedCompany.isActive,
                    updatedAt: updatedCompany.updatedAt
                }
            });
        }
        catch (error) {
            console.error('Error updating company:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update company',
                error: error.message
            });
        }
    }
    /**
     * Get all companies (SuperAdmin only)
     * Used for dropdown selection when creating users
     */
    async getAllCompanies(req, res) {
        try {
            const user = req.user;
            // Only SuperAdmin can fetch all companies
            if (user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. SuperAdmin access required.',
                    code: 'INSUFFICIENT_PERMISSIONS'
                });
            }
            const companies = await db_1.prisma.company.findMany({
                where: {
                // isActive: true
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    industry: true,
                    description: true,
                    technology: true,
                    plan: true,
                    isActive: true,
                    createdAt: true,
                    users: {
                        where: {
                            role: "ADMIN",
                            OR: [
                                { designation: "Director" },
                                { designation: "DIRECTOR" }
                            ]
                        },
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            designation: true,
                            role: true
                        }
                    },
                    _count: {
                        select: {
                            users: true,
                            employees: true
                        }
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });
            return res.json({
                success: true,
                companies: companies.map(company => ({
                    id: company.id,
                    name: company.name,
                    code: company.code,
                    industry: company.industry,
                    description: company.description,
                    technology: company.technology,
                    plan: company.plan,
                    isActive: company.isActive,
                    createdAt: company.createdAt,
                    userCount: company._count.users,
                    employeeCount: company._count.employees,
                    // Agar sirf ek Director/Admin chahiye to first element le sakte ho
                    directorAdmin: company.users.length > 0 ? company.users[0] : null
                }))
            });
        }
        catch (error) {
            console.error('Error fetching companies:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch companies',
                error: error.message
            });
        }
    }
    /**
     * Get current user's company details
     * Used for Admin/Manager to see their company info
     */
    async getCurrentUserCompany(req, res) {
        try {
            const user = req.user;
            if (!user.companyId) {
                return res.status(404).json({
                    success: false,
                    message: 'User is not associated with any company',
                    code: 'NO_COMPANY'
                });
            }
            const company = await db_1.prisma.company.findUnique({
                where: {
                    id: user.companyId
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    _count: {
                        select: {
                            users: true,
                            employees: true,
                            departments: true
                        }
                    }
                }
            });
            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found',
                    code: 'COMPANY_NOT_FOUND'
                });
            }
            return res.json({
                success: true,
                company: {
                    id: company.id,
                    name: company.name,
                    code: company.code,
                    userCount: company._count.users,
                    employeeCount: company._count.employees,
                    departmentCount: company._count.departments
                }
            });
        }
        catch (error) {
            console.error('Error fetching user company:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch company details',
                error: error.message
            });
        }
    }
    /**
     * Get company by ID (SuperAdmin only)
     */
    async getCompanyById(req, res) {
        try {
            const { id } = req.params;
            const companyId = parseInt(id);
            if (isNaN(companyId)) {
                return res.status(400).json({ success: false, message: 'Invalid company ID' });
            }
            const company = await db_1.prisma.company.findUnique({
                where: { id: companyId },
                select: {
                    id: true, name: true, code: true, industry: true,
                    plan: true, isActive: true, createdAt: true, updatedAt: true,
                    _count: { select: { users: true, employees: true, departments: true } }
                }
            });
            if (!company) {
                return res.status(404).json({ success: false, message: 'Company not found' });
            }
            return res.json({
                success: true,
                company: {
                    ...company,
                    userCount: company._count.users,
                    employeeCount: company._count.employees,
                    departmentCount: company._count.departments,
                }
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Failed to fetch company', error: error.message });
        }
    }
    /**
     * Delete company (SuperAdmin only) — soft delete
     */
    async deleteCompany(req, res) {
        try {
            const { id } = req.params;
            const companyId = parseInt(id);
            if (isNaN(companyId)) {
                return res.status(400).json({ success: false, message: 'Invalid company ID' });
            }
            const company = await db_1.prisma.company.findUnique({ where: { id: companyId } });
            if (!company) {
                return res.status(404).json({ success: false, message: 'Company not found' });
            }
            await db_1.prisma.company.update({ where: { id: companyId }, data: { isActive: false } });
            return res.json({ success: true, message: 'Company deactivated successfully' });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Failed to delete company', error: error.message });
        }
    }
}
exports.CompanyController = CompanyController;
