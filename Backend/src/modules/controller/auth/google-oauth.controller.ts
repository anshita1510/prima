import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../../config/db";
import { Role, Status, AuthProvider } from "@prisma/client";
import { LoginUsecase } from "../../usecase/auth/login.usecase";
import { UserRepository } from "../../repository/auth/user.repository";

const userRepo = new UserRepository();

export class GoogleOAuthController {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generate Google OAuth URL
   * Frontend redirects user to this URL
   */
  getAuthUrl = (req: Request, res: Response) => {
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
    } catch (error: any) {
      console.error("Error generating auth URL:", error);
      return res.status(500).json({ error: "Failed to generate auth URL" });
    }
  };

  /**
   * Handle Google OAuth callback
   * Exchange authorization code for tokens and user info
   */
  handleCallback = async (req: Request, res: Response) => {
    try {
      console.log('=== Google OAuth Callback ===');
      const { code } = req.query;
      console.log('Code received:', code ? 'Yes' : 'No');

      if (!code || typeof code !== "string") {
        console.error('Missing or invalid code');
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=missing_code`
        );
      }

      // Exchange authorization code for tokens
      console.log('Exchanging code for tokens...');
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      console.log('Tokens received');

      // Get user info from Google
      console.log('Verifying ID token...');
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        console.error('Invalid token payload');
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=invalid_token`
        );
      }

      const { email, given_name, family_name, sub: googleId } = payload;
      console.log('User email:', email);

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        console.log('Creating new user...');
        // Create new user with Google auth
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            firstName: given_name || "Google",
            lastName: family_name || "User",
            phone: "",
            designation: "Employee",
            role: Role.EMPLOYEE,
            authProvider: AuthProvider.GOOGLE,
            googleId: googleId,
            status: Status.ACTIVE,
            isActive: true,
          },
        });
        console.log('User created:', user.id);
      } else {
        console.log('User exists:', user.id);
        // Update existing user with Google info if needed
        if (user.authProvider !== AuthProvider.GOOGLE) {
          console.log('Updating user auth provider...');
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              authProvider: AuthProvider.GOOGLE,
              googleId: googleId,
              status: Status.ACTIVE,
              isActive: true,
            },
          });
        }
      }

      // Generate JWT token
      console.log('Generating JWT token...');
      const usecase = new LoginUsecase(userRepo);
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
      const roleRoutes: Record<string, string> = {
        SUPER_ADMIN: "/superAdmin",
        ADMIN: "/admin",
        MANAGER: "/manager",
        EMPLOYEE: "/user",
      };

      const redirectPath = roleRoutes[user.role] || "/dashboard";
      const redirectUrl = `${process.env.FRONTEND_URL}${redirectPath}`;
      
      console.log('Redirecting to:', redirectUrl);
      return res.redirect(redirectUrl);
    } catch (error: any) {
      console.error("Google OAuth callback error:", error);
      console.error("Error stack:", error.stack);
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`
      );
    }
  };

  /**
   * Logout - Clear auth cookie
   */
  logout = (req: Request, res: Response) => {
    try {
      res.clearCookie("auth_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return res.json({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
      return res.status(500).json({ error: "Logout failed" });
    }
  };
}
