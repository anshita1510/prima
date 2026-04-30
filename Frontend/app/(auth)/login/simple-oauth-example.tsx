"use client";

/**
 * SIMPLE GOOGLE OAUTH EXAMPLE
 * 
 * This is a simplified example showing how to implement Google OAuth 2.0
 * with the backend OAuth flow (authorization code exchange).
 * 
 * Use this as a reference for implementing OAuth in your existing login page.
 */

import { useState } from "react";
import GoogleLoginButton from "@/app/components/GoogleLoginButton";

export default function SimpleOAuthExample() {
  const [error, setError] = useState<string>("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to PRIMA</h2>
          <p className="mt-2 text-sm text-gray-600">
            Use your Google account to continue
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Google OAuth Button */}
          <GoogleLoginButton />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Traditional Login Link */}
          <a
            href="/login"
            className="block w-full text-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
          >
            Sign in with Email & Password
          </a>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
