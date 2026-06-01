"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controller/company/company.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const companyController = new company_controller_1.CompanyController();
/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a new company (SuperAdmin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Acme Corporation"
 *               description:
 *                 type: string
 *                 example: "Technology company"
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Invalid input or company code already exists
 *       403:
 *         description: Access denied - SuperAdmin required
 */
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), (req, res) => companyController.createCompany(req, res));
/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Update company (SuperAdmin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       404:
 *         description: Company not found
 *       403:
 *         description: Access denied - SuperAdmin required
 */
router.put('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), (req, res) => companyController.updateCompany(req, res));
/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies (SuperAdmin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all companies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 companies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       userCount:
 *                         type: number
 *                       employeeCount:
 *                         type: number
 *       403:
 *         description: Access denied - SuperAdmin required
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), (req, res) => companyController.getAllCompanies(req, res));
/**
 * @swagger
 * /api/companies/current:
 *   get:
 *     summary: Get current user's company details
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's company details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 company:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *                     userCount:
 *                       type: number
 *                     employeeCount:
 *                       type: number
 *                     departmentCount:
 *                       type: number
 *       404:
 *         description: Company not found or user not associated with company
 *       401:
 *         description: Unauthorized
 */
router.get('/current', auth_middleware_1.authenticateToken, (req, res) => companyController.getCurrentUserCompany(req, res));
router.get('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), (req, res) => companyController.getCompanyById(req, res));
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), (req, res) => companyController.deleteCompany(req, res));
exports.default = router;
