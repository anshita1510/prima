// Backend/src/modules/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Role, PrismaClient, Designation } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../types/express';

const prisma = new PrismaClient();

interface JwtPayload {
  id: number;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("🔍 Auth middleware: Processing request to", req.path);
    console.log("🔍 Auth middleware: Method", req.method);

    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.auth_token;

    console.log("🔍 Auth middleware: Auth header present", !!authHeader);
    console.log("🔍 Auth middleware: Cookie token present", !!cookieToken);
    console.log("🔍 Auth middleware: All cookies", req.cookies);

    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log("🔍 Auth middleware: Using Bearer token");
    } else if (cookieToken) {
      token = cookieToken;
      console.log("🔍 Auth middleware: Using cookie token");
    }

    if (!token) {
      console.log("❌ Auth middleware: No token provided");
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JwtPayload;

    console.log("🔍 Auth middleware: Token decoded successfully", {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    });

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.log("❌ Auth middleware: Token expired");
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // ✅ FIX 1: Added designation: null to satisfy Express.User type
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      designation: null,
    };

    console.log("✅ Auth middleware: User authenticated", req.user);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.auth_token;

    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JwtPayload;

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // In authenticateToken middleware, replace the prisma.user.findUnique call with:
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        employee: {
          select: { id: true, name: true, designation: true, companyId: true, departmentId: true, isActive: true }
        },
        company: { select: { id: true, name: true } }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
        code: 'USER_INACTIVE'
      });
    }

    const companyId = user.employee?.companyId || user.companyId;

    if (!companyId && user.role !== 'SUPER_ADMIN') {
      return res.status(401).json({
        success: false,
        message: 'Company information not found for user',
        code: 'NO_COMPANY'
      });
    }

    // ✅ FIX 2: Changed undefined to null using ?? null
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      employeeId: user.employee?.id,
      companyId: companyId || undefined,
      designation: (user.employee?.designation as Designation) ?? null,
      isActive: user.employee?.isActive || user.isActive,
      departmentId: user.employee?.departmentId ?? undefined,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser | undefined;

    if (!user || !user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: user.role
      });
    }

    next();
  };
};

export const requireActiveUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as AuthUser | undefined;

    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isActive: true }
    });

    if (!dbUser || !dbUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
        code: 'USER_INACTIVE'
      });
    }

    next();
  } catch (error) {
    console.error('Active user check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking user status'
    });
  }
};