"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOAuthController = void 0;
const google_auth_library_1 = require("google-auth-library");
const db_1 = require("../../../config/db");
const client_1 = require("@prisma/client");
const login_usecase_1 = require("../../usecase/auth/login.usecase");
const user_repository_1 = require("../../repository/auth/user.repository");
const userRepo = new user_repository_1.UserRepository();
class GoogleOAuthController {
    constructor() {
        /**
         * Generate Google OAuth URL
         * Frontend redirects user to this URL
         */
        this.getAuthUrl = (req, res) => {
            try {
                const authUrl = this.oauth2Client.generateAuthUrl({
                    access_type: "offline",
                    scope: [
                        "https://www.googleapis.com/auth/userinfo.profile",
                        "https://www.googleapis.com/auth/userinfo.email",
                    ],
                    prompt: "consent",
                });
                return res.json({ authUrl });
            }
            catch (error) {
                console.error("Error generating auth URL:", error);
                return res.status(500).json({ error: "Failed to generate auth URL" });
            }
        };
        /**
         * Handle Google OAuth callback
         * Exchange authorization code for tokens and user info
         */
        this.handleCallback = async (req, res) => {
            try {
                console.log('=== Google OAuth Callback ===');
                const { code } = req.query;
                console.log('Code received:', code ? 'Yes' : 'No');
                if (!code || typeof code !== "string") {
                    console.error('Missing or invalid code');
                    return res.redirect(`${process.env.FRONTEND_URL}/login?error=missing_code`);
                }
                // Exchange authorization code for tokens
                console.log('Exchanging code for tokens...');
                const { tokens } = await this.oauth2Client.getToken(code);
                this.oauth2Client.setCredentials(tokens);
                console.log('Tokens received');
                // Get user info from Google
                console.log('Verifying ID token...');
                const ticket = await this.oauth2Client.verifyIdToken({
                    idToken: tokens.id_token,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                if (!payload || !payload.email) {
                    console.error('Invalid token payload');
                    return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_token`);
                }
                const { email, given_name, family_name, sub: googleId } = payload;
                console.log('User email:', email);
                // Find or create user
                let user = await db_1.prisma.user.findUnique({
                    where: { email: email.toLowerCase() },
                });
                if (!user) {
                    console.log('Creating new user...');
                    // Create new user with Google auth
                    user = await db_1.prisma.user.create({
                        data: {
                            email: email.toLowerCase(),
                            firstName: given_name || "Google",
                            lastName: family_name || "User",
                            phone: "",
                            designation: "Employee",
                            role: client_1.Role.EMPLOYEE,
                            authProvider: client_1.AuthProvider.GOOGLE,
                            googleId: googleId,
                            status: client_1.Status.ACTIVE,
                            isActive: true,
                        },
                    });
                    console.log('User created:', user.id);
                }
                else {
                    console.log('User exists:', user.id);
                    // Update existing user with Google info if needed
                    if (user.authProvider !== client_1.AuthProvider.GOOGLE) {
                        console.log('Updating user auth provider...');
                        user = await db_1.prisma.user.update({
                            where: { id: user.id },
                            data: {
                                authProvider: client_1.AuthProvider.GOOGLE,
                                googleId: googleId,
                                status: client_1.Status.ACTIVE,
                                isActive: true,
                            },
                        });
                    }
                }
                // Generate JWT token
                console.log('Generating JWT token...');
                const usecase = new login_usecase_1.LoginUsecase(userRepo);
                const result = await usecase.generateTokenForUser(user);
                console.log('JWT generated');
                // Set HTTP-only cookie with JWT
                console.log('Setting cookie...');
                res.cookie("auth_token", result.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    path: "/",
                });
                console.log('Cookie set');
                // Redirect to dashboard based on user role
                const roleRoutes = {
                    SUPER_ADMIN: "/superAdmin",
                    ADMIN: "/admin",
                    MANAGER: "/manager",
                    EMPLOYEE: "/user",
                };
                const redirectPath = roleRoutes[user.role] || "/dashboard";
                const redirectUrl = `${process.env.FRONTEND_URL}${redirectPath}`;
                console.log('Redirecting to:', redirectUrl);
                return res.redirect(redirectUrl);
            }
            catch (error) {
                console.error("Google OAuth callback error:", error);
                console.error("Error stack:", error.stack);
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
            }
        };
        /**
         * Logout - Clear auth cookie
         */
        this.logout = (req, res) => {
            try {
                res.clearCookie("auth_token", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });
                return res.json({ success: true, message: "Logged out successfully" });
            }
            catch (error) {
                return res.status(500).json({ error: "Logout failed" });
            }
        };
        this.oauth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    }
}
exports.GoogleOAuthController = GoogleOAuthController;
