'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, LogIn } from 'lucide-react';

import { cn } from '@/lib/utils';
import { authService } from '@/app/services/authService';
import { userService, Company } from '@/app/services/user.service';
import CreateUserForm from '../../components/CreateUserForm';

type MessageType = {
  type: 'success' | 'error';
  text: string;
};

type AdminCreateUserWrapperProps = {
  layoutVariant?: 'default' | 'console';
  onUserCreated?: () => void;
};

export default function AdminCreateUserWrapper({
  layoutVariant = 'default',
  onUserCreated,
}: AdminCreateUserWrapperProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserCompany, setCurrentUserCompany] = useState<Company | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);

      const hasPermission = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(parsedUser.role);
      setIsAuthenticated(hasPermission);

      if (hasPermission && parsedUser.role !== 'SUPER_ADMIN') {
        loadCurrentUserCompany();
      }
    } catch (error) {
      console.error('Error parsing user:', error);
      setIsAuthenticated(false);
    }
  };

  const loadCurrentUserCompany = async () => {
    try {
      const response = await userService.getCurrentUserCompany();
      setCurrentUserCompany(response.company);
    } catch (error) {
      console.error('Failed to load company:', error);
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      const result = await authService.quickAdminLogin();

      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);

        setMessage({
          type: 'success',
          text: 'Successfully logged in as admin!'
        });

        if (result.user.role !== 'SUPER_ADMIN') {
          loadCurrentUserCompany();
        }
      } else {
        setMessage({
          type: 'error',
          text: 'Auto login failed. Please ensure your session is valid.'
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: 'Quick login failed. Please try manual login.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (msg: string) => {
    setMessage({ type: 'success', text: msg });
    onUserCreated?.();
    setTimeout(() => setMessage(null), 5000);
  };

  const handleError = (msg: string) => {
    setMessage({ type: 'error', text: msg });
  };

  // 🔒 Not Authenticated UI
  if (!isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-[1100px]">
        <Card className="premium-card border-orange-200/50 bg-orange-50/50 dark:bg-orange-950/10 dark:border-orange-900/30">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-500" />
              <CardTitle className="text-orange-800 dark:text-orange-400">
                Authentication Required
              </CardTitle>
            </div>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              You need to be logged in as an admin to create users.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Please check your session or log in again.
            </p>

            <Button
              onClick={handleQuickLogin}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Retry Access
                </>
              )}
            </Button>

            {message && (
              <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50/50 dark:border-red-900/30' : 'border-green-200 bg-green-50/50'}>
                <AlertDescription className={message.type === 'error' ? 'text-red-600' : 'text-green-600'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Authenticated UI — form surface + info panel live in CreateUserForm (theme tokens)
  return (
    <div
      className={cn(
        'w-full animate-[fade-in-up_0.55s_ease-out_both]',
        layoutVariant === 'console' && 'flex min-h-0 flex-1 flex-col'
      )}
    >
      {message && (
        <Alert
          className={`mb-6 shrink-0 ${message.type === 'error' ? 'border-red-400' : 'border-green-400'}`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <AlertDescription>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div
        className={cn(
          layoutVariant === 'console' && 'flex min-h-0 min-w-0 flex-1 flex-col'
        )}
      >
        <CreateUserForm
          currentUserRole={currentUser?.role || 'ADMIN'}
          currentUserCompany={currentUserCompany || undefined}
          layoutVariant={layoutVariant}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
}