'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';

// ==================== TYPES ====================

interface AuthRedirectProps {
  children: React.ReactNode;
}

// ==================== AUTH REDIRECT COMPONENT ====================

/**
 * Client component that checks auth state
 * If user is logged in, shows a "continue to dashboard" prompt instead of auto-redirecting
 * This prevents redirect loops
 */
export function AuthRedirect({ children }: AuthRedirectProps) {
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  // Get redirect URL from query params, default to dashboard
  const rawRedirect = searchParams.get('redirect');
  const redirectUrl = rawRedirect 
    ? (rawRedirect.startsWith('/') ? rawRedirect : '/' + rawRedirect)
    : '/dashboard';

  useEffect(() => {
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  // Show loading state while checking auth
  if (loading || !authChecked) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Please wait...</p>
      </div>
    );
  }

  // User is logged in - show prompt to continue (NO AUTO-REDIRECT)
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          You&apos;re already signed in
        </h2>
        <p className="text-gray-500 mb-6">
          Welcome back, {user.fullName}!
        </p>
        <button
          onClick={() => window.location.href = redirectUrl}
          className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors"
        >
          Continue to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Go to Home
        </button>
      </div>
    );
  }

  // User is not logged in, render the form
  return <>{children}</>;
}






