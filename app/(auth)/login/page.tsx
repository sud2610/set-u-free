import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/forms/LoginForm';
import { AuthRedirect } from './AuthRedirect';

// ==================== METADATA ====================

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to your FreeSetu account to book free consultations with verified service providers.',
  openGraph: {
    title: 'Sign In | FreeSetu',
    description: 'Access your account and book free consultations.',
  },
};

// ==================== LOADING FALLBACK ====================

function FormSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="h-14 bg-gray-200 rounded-xl mb-6" />
      <div className="h-px bg-gray-200 my-6" />
      <div className="space-y-5">
        <div>
          <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-14 bg-gray-200 rounded-xl" />
        </div>
        <div>
          <div className="h-5 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-14 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-40" />
        <div className="h-14 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

// ==================== LOGIN PAGE COMPONENT ====================

/**
 * Login page
 * Features:
 * - Full-page layout with split design
 * - LoginForm component
 * - Auto-redirect if already logged in
 * - SEO meta tags
 * - Loading states
 * - Error handling via form component
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* ==================== LEFT SIDE - BRANDING ==================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-300/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-yellow-500">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">FreeSetu</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
            Welcome back to
            <br />
            your service hub
          </h1>
          <p className="text-gray-800 text-lg max-w-md leading-relaxed">
            Access your bookings, connect with verified providers, and manage your
            consultations all in one place.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/30 border-2 border-white/50 backdrop-blur-sm"
                  style={{
                    backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`,
                    backgroundSize: 'cover',
                  }}
                />
              ))}
            </div>
            <p className="text-gray-800 text-sm">
              Join <span className="font-bold text-gray-900">10,000+</span> happy users
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-gray-700 text-sm">
          © {new Date().getFullYear()} FreeSetu. All rights reserved.
        </div>
      </div>

      {/* ==================== RIGHT SIDE - FORM ==================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-gray-900">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FreeSetu</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Auth Redirect Check */}
          <Suspense fallback={<FormSkeleton />}>
            <AuthRedirect>
              <LoginForm />
            </AuthRedirect>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
