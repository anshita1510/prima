/**
 * Authentication Utility Functions
 * Provides helper functions for authentication and authorization
 */

export interface User {
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

/**
 * Get the current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the current auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!(getAuthToken() && getCurrentUser());
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: string | string[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
}

/**
 * Check if user is Super Admin
 */
export function isSuperAdmin(): boolean {
  return hasRole('SUPER_ADMIN');
}

/**
 * Check if user is Admin or higher
 */
export function isAdmin(): boolean {
  return hasRole(['SUPER_ADMIN', 'ADMIN']);
}

/**
 * Check if user is Manager or higher
 */
export function isManager(): boolean {
  return hasRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
}

/**
 * Check if user is Employee (any role)
 */
export function isEmployee(): boolean {
  return hasRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']);
}

/**
 * Get the default dashboard route for a user's role
 */
export function getDefaultRoute(role?: string): string {
  const userRole = role || getCurrentUser()?.role;
  
  const routes: Record<string, string> = {
    SUPER_ADMIN: '/superAdmin',
    ADMIN: '/admin',
    MANAGER: '/manager',
    EMPLOYEE: '/user',
  };
  
  return routes[userRole || ''] || '/login';
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Clear cookie
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * Set authentication data
 */
export function setAuth(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Set cookie for middleware with 30-day expiration
  const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
  document.cookie = `token=${token}; path=/; max-age=${thirtyDaysInSeconds}; SameSite=Lax`;
}

/**
 * Check if token is expired (basic check)
 */
export function isTokenExpired(): boolean {
  const token = getAuthToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    
    if (!exp) return false;
    
    return Date.now() >= exp * 1000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

/**
 * Get authorization headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  
  if (!token) {
    return {
      'Content-Type': 'application/json',
    };
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Redirect to login with return URL
 */
export function redirectToLogin(returnUrl?: string): void {
  if (typeof window === 'undefined') return;
  
  const url = new URL('/login', window.location.origin);
  if (returnUrl) {
    url.searchParams.set('returnUrl', returnUrl);
  }
  
  window.location.href = url.toString();
}

/**
 * Handle authentication error
 */
export function handleAuthError(error: any): void {
  const errorCode = error?.response?.data?.code;
  
  if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
    clearAuth();
    redirectToLogin(window.location.pathname);
  } else if (errorCode === 'USER_INACTIVE') {
    clearAuth();
    window.location.href = '/login?error=account_inactive';
  }
}
