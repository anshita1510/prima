'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);

        // Store session data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Set token as cookie for middleware with 30-day expiration
        const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
        document.cookie = `token=${token}; path=/; max-age=${thirtyDaysInSeconds}; SameSite=Lax`;

        // Route based on role
        const routes: Record<string, string> = {
          SUPER_ADMIN: '/superAdmin',
          ADMIN: '/admin',
          MANAGER: '/manager',
          EMPLOYEE: '/user',
        };

        const targetRoute = routes[user.role as keyof typeof routes];

        // Use window.location for hard navigation
        window.location.href = targetRoute || '/dashboard';
      } catch (error) {
        console.error('Error processing callback:', error);
        router.push('/login?error=invalid_callback');
      }
    } else {
      router.push('/login?error=missing_data');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <Loader className="w-12 h-12 animate-spin text-blue-600" />
          <div className="absolute inset-0 w-12 h-12 animate-ping text-blue-400 opacity-20">
            <Loader className="w-12 h-12" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing sign in...
        </h2>
        <p className="text-gray-600">Please wait while we redirect you</p>
      </div>
    </div>
  );
}

export default function LoginCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <Loader className="w-12 h-12 animate-spin text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
