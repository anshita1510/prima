"use client";

import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.services';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  designation?: string;
  status?: string;
  isActive?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error: any) {
      setError(error.message || 'Failed to refresh user data');
      console.error('Error refreshing user:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user data locally
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      
      const updatedUser = { ...prevUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  // Get user initials for avatar
  const getUserInitials = useCallback(() => {
    if (!user?.name) return '??';
    
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  // Get formatted role display
  const getRoleDisplay = useCallback(() => {
    if (!user?.role) return 'User';
    
    return user.role.replace('_', ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [user?.role]);

  return {
    user,
    loading,
    error,
    refreshUser,
    updateUser,
    getUserInitials,
    getRoleDisplay,
    isAuthenticated: !!user,
  };
};