'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

// ==================== TYPES ====================

interface AuthRedirectProps {
  children: React.ReactNode;
}

// ==================== AUTH REDIRECT COMPONENT ====================

/**
 * Client component that checks auth state and redirects if logged in
 * Used to protect auth pages (login/register) from authenticated users
 */
export function AuthRedirect({ children }: AuthRedirectProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, redirect to appropriate dashboard
        const redirectUrl =
          user.role === 'provider' ? '/dashboard/provider' : '/dashboard/user';
        router.replace(redirectUrl);
      } else {
        // User is not logged in, show the form
        setIsChecking(false);
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading || isChecking) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Checking authentication...</p>
      </div>
    );
  }

  // User is not logged in, render the form
  return <>{children}</>;
}

