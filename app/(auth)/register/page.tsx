'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}

// Redirect logic component
function RegisterRedirect() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    
    // Don't pass redirect if it points to provider-access or login/register (avoid loops)
    const shouldPassRedirect = redirect && 
      !redirect.includes('provider-access') && 
      !redirect.includes('/login') && 
      !redirect.includes('/register');
    
    const targetUrl = shouldPassRedirect 
      ? `/provider-access?redirect=${encodeURIComponent(redirect)}`
      : '/provider-access';
    
    // Use hard redirect to ensure it works
    window.location.href = targetUrl;
  }, [searchParams]);

  return <LoadingSpinner />;
}

// MVP: Only providers can register - redirect to provider access page
export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RegisterRedirect />
    </Suspense>
  );
}
