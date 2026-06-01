"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const github_oauth_controller_1 = require("../../controller/auth/github-oauth.controller");
const router = (0, express_1.Router)();
const controller = new github_oauth_controller_1.GitHubOAuthController();
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
exports.default = router;
