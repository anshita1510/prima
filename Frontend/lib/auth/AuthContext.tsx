"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  employeeId?: number;
  companyId?: number;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  firstName?: string;
  lastName?: string;
  phone?: string;
  designation?: string;
  status?: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        console.log('🔄 Initializing auth from storage...');
        
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('📦 Storage check:', {
          hasToken: !!storedToken,
          hasUser: !!storedUser,
          tokenLength: storedToken?.length || 0
        });

        if (storedToken && storedUser) {
          // Parse and validate user data
          const parsedUser = JSON.parse(storedUser);
          
          console.log('👤 Parsed user:', {
            id: parsedUser?.id,
            role: parsedUser?.role,
            name: parsedUser?.name
          });
          
          // Only set if we have valid data with proper role
          if (parsedUser && parsedUser.id && parsedUser.role && 
              ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'].includes(parsedUser.role)) {
            setToken(storedToken);
            setUser(parsedUser);
            
            // Also ensure cookie is set (in case it was cleared)
            const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
            document.cookie = `token=${storedToken}; path=/; max-age=${thirtyDaysInSeconds}; SameSite=Lax`;
            
            console.log('✅ Auth restored from localStorage');
            console.log('✅ Cookie refreshed');
          } else {
            console.warn('⚠️ Invalid user data in localStorage - clearing auth data');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        } else {
          console.log('ℹ️ No stored authentication found');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        // Don't clear localStorage on parse errors - user might just have corrupted data
        // Let them try to login again without losing their session
      } finally {
        setIsLoading(false);
        console.log('✅ Auth initialization complete');
      }
    };

    initAuth();
  }, []);

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken || !storedUser) {
        return false;
      }

      // Verify token with backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Token validation failed');
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        setToken(storedToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
      return false;
    }
  };

  // Login function
  const login = (newToken: string, newUser: User) => {
    console.log('🔐 Login function called with:', { 
      hasToken: !!newToken, 
      hasUser: !!newUser,
      userRole: newUser?.role 
    });
    
    // Store in localStorage
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Set cookie for middleware with 30-day expiration
    // This ensures the token persists across browser sessions
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    const cookieString = `token=${newToken}; path=/; max-age=${thirtyDaysInSeconds}; SameSite=Lax`;
    document.cookie = cookieString;
    
    console.log('✅ Token stored in localStorage and cookie');
    console.log('📝 Cookie set:', cookieString.substring(0, 50) + '...');
    
    setToken(newToken);
    setUser(newUser);
    
    console.log('✅ User logged in successfully');
  };

  // Logout function
  const logout = () => {
    console.log('🚪 Logout initiated');
    
    // Clear state first
    setToken(null);
    setUser(null);
    setIsLoading(false);
    
    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    console.log('✅ Logout complete, redirecting to login');
    
    // Force redirect with replace to prevent back navigation
    window.location.href = '/login';
  };

  // Check if user has required role
  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    checkAuth,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
