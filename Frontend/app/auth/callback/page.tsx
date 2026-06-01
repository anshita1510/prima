"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const token = searchParams.get("token");
      const redirectPath = searchParams.get("redirect");

      if (!token) {
        setError("No authentication token received");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      localStorage.setItem("token", token);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';
      const response = await fetch(`${baseUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        localStorage.setItem("user", JSON.stringify(user));

        const roleRoutes: Record<string, string> = {
          SUPER_ADMIN: "/superAdmin",
          ADMIN: "/admin",
          MANAGER: "/manager",
          EMPLOYEE: "/user",
        };

        const finalRedirect = redirectPath || roleRoutes[user.role] || "/dashboard";
        window.location.href = finalRedirect;
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {error ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In</h2>
            <p className="text-gray-600">Setting up your session, please wait...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
