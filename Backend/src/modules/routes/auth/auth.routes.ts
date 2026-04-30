
import { Router } from "express";
import { UserController } from "../../controller/auth/auth.controller";
import { inviteAuthMiddleware } from "../../../middlewares/inviteAuth.middleware";
import { authenticate } from "../../../middlewares/auth.middleware";
import { requireRole, requireAnyRole } from "../../../middlewares/role.middleware";
import { Role } from "@prisma/client";
import { forgotPassword } from "../../controller/password/forget.password.controller"
import { verifyOtp } from "../../controller/password/verify.password";
import { resetPassword } from "../../controller/password/reset.password.controller";

const router = Router();
const controller = new UserController();

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
router.get(
    "/debug-test",
    authenticate,
    controller.debugTest
);

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
router.post(
    "/register",
    authenticate,
    requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
    controller.inviteEmployee
);

// Alias for /register — same handler, simpler endpoint name
router.post(
    "/create-user",
    authenticate,
    requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
    controller.inviteEmployee
);

router.put(
    "/update/:id",
    authenticate,
    requireRole(Role.ADMIN),
    controller.updateCredentials
);

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
router.get(
    "/me",
    authenticate,
    controller.getCurrentUser
);

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
router.get(
    "/",
    authenticate,
    requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN),
    controller.getAllUsers
);

router.post(
    "/:id/update-password",
    authenticate,
    controller.updatePassword
);

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
router.post(
    "/set-password",
    controller.setPassword
);

router.post(
    "/resend-otp",
    inviteAuthMiddleware,
    controller.resendOtp
);

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
router.post(
    "/forgot-password",
    forgotPassword
)

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
router.post(
    "/verify-otp",
    verifyOtp

)

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
router.post(
    "/reset-password",
    resetPassword
)

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
router.delete(
    "/:id",
    authenticate,
    requireRole(Role.SUPER_ADMIN),
    controller.deleteUser
);

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
router.post(
    "/:id/resend-invitation",
    authenticate,
    requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN),
    controller.resendInvitation
);

/* ---------------- API DOCUMENTATION ---------------- */
router.get(
    "/api-docs",
    controller.getApiDocumentation
);

router.get(
    "/postman-collection",
    controller.downloadPostmanCollection
);

export default router;

