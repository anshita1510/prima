"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "../services/auth.service";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      console.log("🔍 Dashboard: Checking authentication...");
      
      // First check localStorage
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      console.log("📦 Dashboard: Storage check:", {
        hasToken: !!storedToken,
        hasUser: !!storedUser
      });
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("👤 Dashboard: Stored user role:", parsedUser?.role);
        } catch (e) {
          console.error("❌ Dashboard: Invalid user data in localStorage");
        }
      }
      
      const userData = await authService.checkAuth();
      if (!userData) {
        console.log("❌ Dashboard: No user data, redirecting to login");
        router.push("/login");
        return;
      }
      
      console.log("✅ Dashboard: User authenticated:", userData.email, "Role:", userData.role);
      
      // Redirect to role-specific dashboard
      const roleRoutes: Record<string, string> = {
        SUPER_ADMIN: "/superAdmin",
        ADMIN: "/admin",
        MANAGER: "/manager",
        EMPLOYEE: "/user",
      };

      const roleDashboard = roleRoutes[userData.role];
      if (roleDashboard) {
        console.log("🔄 Dashboard: Redirecting to role-specific dashboard:", roleDashboard);
        // Use replace instead of push to prevent back navigation to generic dashboard
        router.replace(roleDashboard);
        return;
      }
      
      console.log("⚠️ Dashboard: Unknown role, staying on generic dashboard:", userData.role);
      setUser(userData);
    } catch (error) {
      console.error("❌ Dashboard: Auth check failed:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      // No need to manually redirect - authService.logout() handles it
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, redirect to login
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user.name}!
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Email:</span>
              <span className="text-gray-600">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Role:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Designation:</span>
              <span className="text-gray-600">{user.designation}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🎉 Authentication Successful!
          </h3>
          <p className="text-blue-800">
            You have successfully logged in using Google OAuth 2.0. Your session
            is secured with an HTTP-only cookie.
          </p>
        </div>
      </main>
    </div>
  );
}
