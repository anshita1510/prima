import { Router } from "express";
import { GoogleOAuthController } from "../../controller/auth/google-oauth.controller";

const router = Router();
const controller = new GoogleOAuthController();

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Get Google OAuth URL
 *     tags: [OAuth]
 *     description: Returns the Google OAuth authorization URL for user to login
 *     responses:
 *       200:
 *         description: Google auth URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authUrl:
 *                   type: string
 *                   example: https://accounts.google.com/o/oauth2/v2/auth?...
 */
router.get("/google", controller.getAuthUrl);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [OAuth]
 *     description: Handles Google OAuth callback, exchanges code for tokens, and sets auth cookie
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *     responses:
 *       302:
 *         description: Redirects to dashboard on success or login on failure
 */
router.get("/google/callback", controller.handleCallback);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [OAuth]
 *     description: Clears the auth cookie and logs out the user
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", controller.logout);

export default router;
