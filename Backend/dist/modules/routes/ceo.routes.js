"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ceo_controller_1 = require("../controller/ceo/ceo.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const ceoController = new ceo_controller_1.CeoController();
/**
 * @swagger
 * /api/ceos:
 *   post:
 *     summary: Create a new CEO for a company
 *     tags: [CEOs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - companyId
 *               - password
 *     responses:
 *       201:
 *         description: CEO created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), (req, res) => ceoController.createCeo(req, res));
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), (req, res) => ceoController.getAllCeos(req, res));
router.get('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), (req, res) => ceoController.getCeoById(req, res));
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), (req, res) => ceoController.deleteCeo(req, res));
exports.default = router;
