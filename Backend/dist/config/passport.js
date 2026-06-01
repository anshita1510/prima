"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const db_1 = require("./db");
const client_1 = require("@prisma/client");
console.log('=== Passport Configuration ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('==============================');
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI ||
        "http://localhost:5004/api/auth/google/callback",
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0].value;
        if (!email) {
            return done(new Error("No email from Google"), undefined);
        }
        let user = await db_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        // ===== EXISTING USER =====
        if (user) {
            if (!user.googleId || user.authProvider !== client_1.AuthProvider.GOOGLE) {
                user = await db_1.prisma.user.update({
                    where: { email: email.toLowerCase() },
                    data: {
                        googleId: profile.id,
                        authProvider: client_1.AuthProvider.GOOGLE,
                        status: client_1.Status.ACTIVE,
                        isActive: true,
                    },
                });
            }
        }
        // ===== NEW USER =====
        else {
            user = await db_1.prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    firstName: profile.name?.givenName || "Google",
                    lastName: profile.name?.familyName || "User",
                    phone: "",
                    designation: client_1.Designation.SOFTWARE_ENGINEER,
                    role: client_1.Role.EMPLOYEE,
                    googleId: profile.id,
                    authProvider: client_1.AuthProvider.GOOGLE,
                    status: client_1.Status.ACTIVE,
                    isActive: true,
                },
            });
        }
        // ===== AUTH USER FOR PASSPORT =====
        const authUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            companyId: user.companyId ?? undefined,
            designation: user.designation ?? null, // ✅ FIXED
            isActive: user.isActive ?? true,
            employeeId: undefined,
            departmentId: undefined,
        };
        return done(null, authUser);
    }
    catch (err) {
        console.error("Passport error:", err);
        return done(err, undefined);
    }
}));
/**
 * IMPORTANT:
 * We are NOT using session-based auth.
 * So Passport only needs minimal serialize/deserialize.
 */
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
exports.default = passport_1.default;
