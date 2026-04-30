import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/admin",
  "/user",
  "/manager",
  "/superAdmin",
  "/enhanced-tms",
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/set_pass", "/otp_check", "/Forget_pass"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log("🔍 Middleware: Processing request for:", pathname);

  // Check for logout parameter first - clear everything
  const logout = request.nextUrl.searchParams.get("logout");
  if (logout === "true") {
    console.log("🚪 Middleware: Logout detected, clearing auth_token");
    const response = NextResponse.next();
    response.cookies.delete("auth_token");
    return response;
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  console.log("🔍 Middleware: Route analysis:", {
    pathname,
    isProtectedRoute,
    isAuthRoute
  });

  // Get auth token from cookie
  const authToken = request.cookies.get("auth_token")?.value;
  console.log("🔍 Middleware: Auth token present:", !!authToken);

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !authToken) {
    console.log("🔒 Middleware: Protected route without token, redirecting to login");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ONLY redirect from auth routes (login, etc.) to role-specific dashboards
  // Don't redirect users who are already on their correct role-based routes
  if (isAuthRoute && authToken) {
    // Check if user wants to force access to auth page (e.g., to switch accounts)
    const forceAuth = request.nextUrl.searchParams.get("force") === "true";
    
    if (forceAuth) {
      console.log("🔓 Middleware: Force auth parameter detected, allowing access to auth page");
      return NextResponse.next();
    }
    
    // TEMPORARILY ALLOW LOGIN ACCESS FOR DEBUGGING
    console.log("⚠️ Middleware: Allowing access to login page for debugging");
    return NextResponse.next();
    
    try {
      console.log("🔍 Middleware: Verifying token for auth route redirect...");
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `auth_token=${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        
        console.log("✅ Middleware: Token verified, redirecting from auth route to role dashboard");
        
        const roleRoutes: Record<string, string> = {
          SUPER_ADMIN: "/superAdmin",
          ADMIN: "/admin",
          MANAGER: "/manager",
          EMPLOYEE: "/user",
        };

        const redirectPath = roleRoutes[user.role] || "/dashboard";
        console.log("🔄 Middleware: Redirecting from auth route to", redirectPath);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      } else {
        console.log("❌ Middleware: Token verification failed");
      }
    } catch (error) {
      console.log("❌ Middleware: Token verification error:", error);
      const response = NextResponse.next();
      response.cookies.delete("auth_token");
      return response;
    }
  }

  console.log("✅ Middleware: Allowing request to proceed");
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
