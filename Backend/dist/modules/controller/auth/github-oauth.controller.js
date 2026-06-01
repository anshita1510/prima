"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubOAuthController = void 0;
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../../../config/db");
const client_1 = require("@prisma/client");
const login_usecase_1 = require("../../usecase/auth/login.usecase");
const user_repository_1 = require("../../repository/auth/user.repository");
const userRepo = new user_repository_1.UserRepository();
class GitHubOAuthController {
    constructor() {
        this.clientId = process.env.GITHUB_CLIENT_ID;
        this.clientSecret = process.env.GITHUB_CLIENT_SECRET;
        this.redirectUri = process.env.GITHUB_REDIRECT_URI;
        /**
         * Redirect to GitHub Authorization URL
         */
        this.getAuthUrl = (req, res) => {
            try {
                const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=user:email`;
                return res.redirect(authUrl);
            }
            catch (error) {
                console.error("Error generating GitHub auth URL:", error);
                return res.status(500).json({ error: "Failed to generate auth URL" });
            }
        };
        /**
         * Handle GitHub OAuth callback
         */
        this.handleCallback = async (req, res) => {
            try {
                console.log('=== GitHub OAuth Callback ===');
                const { code } = req.query;
                if (!code || typeof code !== "string") {
                    return res.redirect(`${process.env.FRONTEND_URL}/login?error=missing_code`);
                }
                // 1. Exchange code for access token
                const tokenResponse = await axios_1.default.post("https://github.com/login/oauth/access_token", {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    code: code,
                    redirect_uri: this.redirectUri,
                }, { headers: { Accept: "application/json" } });
                const accessToken = tokenResponse.data.access_token;
                if (!accessToken) {
                    throw new Error("Failed to obtain access token from GitHub");
                }
                // 2. Fetch user profile
                const userResponse = await axios_1.default.get("https://api.github.com/user", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const { id: githubId, name, login } = userResponse.data;
                // 3. Fetch user emails to get the primary email
                const emailsResponse = await axios_1.default.get("https://api.github.com/user/emails", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const primaryEmail = emailsResponse.data.find((e) => e.primary && e.verified)?.email
                    || emailsResponse.data[0]?.email;
                if (!primaryEmail) {
                    throw new Error("No verified primary email found on GitHub account");
                }
                // 4. Find or create user
                let user = await db_1.prisma.user.findUnique({
                    where: { email: primaryEmail.toLowerCase() },
                });
                if (!user) {
                    // Handle names
                    const names = (name || login).split(" ");
                    const firstName = names[0];
                    const lastName = names.slice(1).join(" ") || "GitHub User";
                    user = await db_1.prisma.user.create({
                        data: {
                            email: primaryEmail.toLowerCase(),
                            firstName,
                            lastName,
                            phone: "",
                            designation: "Employee",
                            role: client_1.Role.EMPLOYEE,
                            authProvider: client_1.AuthProvider.GITHUB,
                            githubId: String(githubId),
                            status: client_1.Status.ACTIVE,
                            isActive: true,
                        },
                    });
                }
                else {
                    // Link GitHub if not already linked
                    if (!user.githubId || user.authProvider !== client_1.AuthProvider.GITHUB) {
                        user = await db_1.prisma.user.update({
                            where: { id: user.id },
                            data: {
                                authProvider: client_1.AuthProvider.GITHUB,
                                githubId: String(githubId),
                                status: client_1.Status.ACTIVE,
                                isActive: true,
                            },
                        });
                    }
                }
                // 5. Generate JWT and set cookie
                const usecase = new login_usecase_1.LoginUsecase(userRepo);
                const result = await usecase.generateTokenForUser(user);
                res.cookie("auth_token", result.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: "/",
                });
                // 6. Redirect based on role
                const roleRoutes = {
                    SUPER_ADMIN: "/superAdmin",
                    ADMIN: "/admin",
                    MANAGER: "/manager",
                    EMPLOYEE: "/user",
                };
                const redirectPath = roleRoutes[user.role] || "/dashboard";
                // 6. Redirect to callback page with token and user data
                const callbackUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
                callbackUrl.searchParams.set('token', result.token);
                callbackUrl.searchParams.set('redirect', redirectPath);
                console.log('GitHub OAuth - Redirecting to callback:', callbackUrl.toString());
                return res.redirect(callbackUrl.toString());
            }
            catch (error) {
                console.error("GitHub OAuth callback error:", error);
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
            }
        };
    }
}
exports.GitHubOAuthController = GitHubOAuthController;
