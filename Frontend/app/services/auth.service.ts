const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  designation: string;
  status: string;
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

class AuthService {
  /**
   * Check if user is authenticated by verifying token in cookie
   */
  async checkAuth(): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "GET",
        credentials: "include", // Important: sends cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Auth check error:", error);
      return null;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    console.log("🚪 Starting logout process...");
    
    try {
      // Call backend to clear HTTP-only cookie
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      console.log("✅ Backend logout successful");
    } catch (error) {
      console.error("⚠️ Backend logout error (continuing anyway):", error);
    }
    
    // Always clear client-side data regardless of API call success
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear all possible cookie variations
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    console.log("✅ Cleared all auth data");
    
    // Force redirect with replace to prevent back navigation
    // Using window.location.replace ensures the current page is removed from history
    window.location.replace("/login");
  }

  /**
   * Traditional email/password login
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    return response.json();
  }
}

export const authService = new AuthService();
