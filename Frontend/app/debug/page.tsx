"use client";

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkAuthData = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const cookies = document.cookie;
      
      let parsedUser = null;
      try {
        parsedUser = user ? JSON.parse(user) : null;
      } catch (e) {
        parsedUser = { error: 'Invalid JSON in localStorage' };
      }

      setDebugInfo({
        localStorage: {
          token: token ? `${token.substring(0, 20)}...` : null,
          user: parsedUser,
        },
        cookies: cookies,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    };

    checkAuthData();
  }, []);

  const clearAllAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Auth Debug Information</h1>
            <button
              onClick={clearAllAuth}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Clear All Auth Data
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">LocalStorage Data</h2>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                {JSON.stringify(debugInfo.localStorage, null, 2)}
              </pre>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Cookies</h2>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                {debugInfo.cookies}
              </pre>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Current URL</h2>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                {debugInfo.url}
              </pre>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Timestamp</h2>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                {debugInfo.timestamp}
              </pre>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/login'}
                className="block w-full text-left px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              >
                Go to Login Page
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="block w-full text-left px-3 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/user'}
                className="block w-full text-left px-3 py-2 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors"
              >
                Go to User Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="block w-full text-left px-3 py-2 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
              >
                Go to Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}