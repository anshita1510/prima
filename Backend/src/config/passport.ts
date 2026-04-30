import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./db";
import { Role, Status, AuthProvider, Designation } from "@prisma/client";

console.log('=== Passport Configuration ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('==============================');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.GOOGLE_REDIRECT_URI ||
        "http://localhost:5004/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;

        if (!email) {
          return done(new Error("No email from Google"), undefined);
        }

        let user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        // ===== EXISTING USER =====
        if (user) {
          if (!user.googleId || user.authProvider !== AuthProvider.GOOGLE) {
            user = await prisma.user.update({
              where: { email: email.toLowerCase() },
              data: {
                googleId: profile.id,
                authProvider: AuthProvider.GOOGLE,
                status: Status.ACTIVE,
                isActive: true,
              },
            });
          }
        }
        // ===== NEW USER =====
        else {
          user = await prisma.user.create({
            data: {
              email: email.toLowerCase(),
              firstName: profile.name?.givenName || "Google",
              lastName: profile.name?.familyName || "User",
              phone: "",
              designation: Designation.SOFTWARE_ENGINEER,
              role: Role.EMPLOYEE,
              googleId: profile.id,
              authProvider: AuthProvider.GOOGLE,
              status: Status.ACTIVE,
              isActive: true,
            },
          });
        }

        // ===== AUTH USER FOR PASSPORT =====
        const authUser: Express.User = {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId ?? undefined,
          designation: (user.designation as Designation) ?? null,  // ✅ FIXED
          isActive: user.isActive ?? true,
          employeeId: undefined,
          departmentId: undefined,
        };

        return done(null, authUser);
      } catch (err) {
        console.error("Passport error:", err);
        return done(err, undefined);
      }
    }
  )
);

/**
 * IMPORTANT:
 * We are NOT using session-based auth.
 * So Passport only needs minimal serialize/deserialize.
 */
passport.serializeUser((user: Express.User, done) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

export default passport;