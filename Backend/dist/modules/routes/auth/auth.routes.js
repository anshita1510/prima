"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../../controller/auth/auth.controller");
const inviteAuth_middleware_1 = require("../../../middlewares/inviteAuth.middleware");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const role_middleware_1 = require("../../../middlewares/role.middleware");
const client_1 = require("@prisma/client");
const forget_password_controller_1 = require("../../controller/password/forget.password.controller");
const verify_password_1 = require("../../controller/password/verify.password");
const reset_password_controller_1 = require("../../controller/password/reset.password.controller");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.UserController();
/**
 * @swagger
 * /api/users/verify:
 *   post:
 *     summary: Verify email using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/verify', controller.verifyEmail);
/* ---------------- AUTH ---------------- */
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", controller.login);
/**
 * @swagger
 * /api/users/check-user:
 *   post:
 *     summary: Check if user exists
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: User check result
 */
router.post("/check-user", controller.checkUser);
/**
 * @swagger
 * /api/users/google-login:
 *   post:
 *     summary: Google OAuth login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: google-oauth-token
 *     responses:
 *       200:
 *         description: Google login successful
 */
router.post("/google-login", controller.googleLogin);
/**
 * @swagger
 * /api/users/microsoft-login:
 *   post:
 *     summary: Microsoft OAuth login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: microsoft-oauth-token
 *     responses:
 *       200:
 *         description: Microsoft login successful
 */
router.post("/microsoft-login", controller.microsoftLogin);
/**
 * @swagger
 * /api/users/superAdmin:
 *   post:
 *     summary: Create super admin (Initial setup only)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Super admin created successfully
 */
router.post("/superAdmin", controller.createSuperAdmin);
/* ---------------- DEBUG ---------------- */
router.get("/debug-test", auth_middleware_1.authenticate, controller.debugTest);
/* ---------------- AUTHENTICATED USER ---------------- */
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Invite employee (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, EMPLOYEE]
 *               phone:
 *                 type: string
 *               designation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee invited successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.post("/register", auth_middleware_1.authenticate, (0, role_middleware_1.requireAnyRole)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.MANAGER), controller.inviteEmployee);
// Alias for /register — same handler, simpler endpoint name
router.post("/create-user", auth_middleware_1.authenticate, (0, role_middleware_1.requireAnyRole)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.MANAGER), controller.inviteEmployee);
router.put("/update/:id", auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(client_1.Role.ADMIN), controller.updateCredentials);
/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/me", auth_middleware_1.authenticate, controller.getCurrentUser);
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get("/", auth_middleware_1.authenticate, (0, role_middleware_1.requireAnyRole)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN), controller.getAllUsers);
router.post("/:id/update-password", auth_middleware_1.authenticate, controller.updatePassword);
/* ---------------- INVITE FLOW ---------------- */
/**
 * @swagger
 * /api/users/set-password:
 *   post:
 *     summary: Set password for invited user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *                 description: 6-digit OTP from invitation email
 *               currentPassword:
 *                 type: string
 *                 example: TempPass123
 *                 description: Temporary password from invitation email
 *               newPassword:
 *                 type: string
 *                 example: MyNewPassword123
 *                 description: New password to set
 *     responses:
 *       200:
 *         description: Password set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password set successfully. You can now log in.
 *       400:
 *         description: Bad request - Missing fields or invalid OTP
 */
router.post("/set-password", controller.setPassword);
router.post("/resend-otp", inviteAuth_middleware_1.inviteAuthMiddleware, controller.resendOtp);
/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post("/forgot-password", forget_password_controller_1.forgotPassword);
/**
 * @swagger
 * /api/users/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post("/verify-otp", verify_password_1.verifyOtp);
/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post("/reset-password", reset_password_controller_1.resetPassword);
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (SuperAdmin only - can delete admins, managers, employees, and other super admins)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.delete("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(client_1.Role.SUPER_ADMIN), controller.deleteUser);
/**
 * @swagger
 * /api/users/{id}/resend-invitation:
 *   post:
 *     summary: Resend invitation email (Admin/SuperAdmin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to resend invitation
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.post("/:id/resend-invitation", auth_middleware_1.authenticate, (0, role_middleware_1.requireAnyRole)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN), controller.resendInvitation);
/* ---------------- API DOCUMENTATION ---------------- */
router.get("/api-docs", controller.getApiDocumentation);
router.get("/postman-collection", controller.downloadPostmanCollection);
exports.default = router;
