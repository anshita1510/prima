"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("../../../config/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth
 *     tags: [OAuth]
 *     description: Redirects to Google OAuth login page
 */
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));
/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [OAuth]
 *     description: Handles Google OAuth callback and sets HTTP-only cookie
 */
router.get("/google/callback", passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
}), (req, res) => {
    try {
        const user = req.user; // AuthUser from Passport strategy
        console.log('=== OAuth Callback Success ===');
        console.log('User:', user.email);
        console.log('Role:', user.role);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" });
        console.log('JWT generated');
        // Set HTTP-only cookie
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/",
        });
        console.log('Cookie set');
        // Redirect based on user role
        const roleRoutes = {
            SUPER_ADMIN: "/superAdmin",
            ADMIN: "/admin",
            MANAGER: "/manager",
            EMPLOYEE: "/user",
        };
        const redirectPath = roleRoutes[user.role];
        if (!redirectPath) {
            console.error('Unknown role:', user.role);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_role`);
        }
        // Redirect to callback page with token and user data
        // The callback page will store token in localStorage and redirect to role page
        const callbackUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
        callbackUrl.searchParams.set('token', token);
        callbackUrl.searchParams.set('redirect', redirectPath);
        console.log('Redirecting to callback:', callbackUrl.toString());
        console.log('User role:', user.role, '→ Final destination:', redirectPath);
        res.redirect(callbackUrl.toString());
    }
    catch (error) {
        console.error('Callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
});
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [OAuth]
 *     description: Clears the auth cookie
 */
router.post("/logout", (req, res) => {
    try {
        res.clearCookie("auth_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
        res.json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Logout failed" });
    }
});
exports.default = router;
