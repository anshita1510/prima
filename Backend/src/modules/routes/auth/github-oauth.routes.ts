import { Router } from "express";
import { GitHubOAuthController } from "../../controller/auth/github-oauth.controller";

const router = Router();
const controller = new GitHubOAuthController();

/**
 * @swagger
 * /api/auth/github:
 *   get:
 *     summary: Get GitHub OAuth URL
 *     tags: [OAuth]
 *     responses:
 *       200:
 *         description: GitHub auth URL generated
 */
router.get("/github", controller.getAuthUrl);

/**
 * @swagger
 * /api/auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [OAuth]
 */
router.get("/github/callback", controller.handleCallback);

export default router;
