"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get token and redirect path from URL
      const token = searchParams.get("token");
      const redirectPath = searchParams.get("redirect");

      if (!token) {
        setError("No authentication token received");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      console.log("OAuth callback - storing token in localStorage");

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Fetch user data and store it
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        
        // Store user data
        localStorage.setItem("user", JSON.stringify(user));
        
        console.log("User data stored:", user.email, "Role:", user.role);

        // Redirect to role-specific page
        const roleRoutes: Record<string, string> = {
          SUPER_ADMIN: "/superAdmin",
          ADMIN: "/admin", 
          MANAGER: "/manager",
          EMPLOYEE: "/user",
        };

        const userRoleRoute = roleRoutes[user.role];
        const finalRedirect = redirectPath || userRoleRoute || "/dashboard";
        
        console.log("User role:", user.role);
        console.log("Role route:", userRoleRoute);
        console.log("Redirect path from URL:", redirectPath);
        console.log("Final redirect:", finalRedirect);
        
        // Use window.location for hard navigation
        window.location.href = finalRedirect;
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (err) {
      console.error("OAuth callback error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {error ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Completing Sign In
            </h2>
            <p className="text-gray-600">
              Setting up your session, please wait...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
