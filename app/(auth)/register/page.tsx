import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { AuthRedirect } from '../login/AuthRedirect';

// ==================== METADATA ====================

export const metadata: Metadata = {
  title: 'Create Account',
  description:
    'Create your FreeSetu account to book free consultations or register as a service provider.',
  openGraph: {
    title: 'Create Account | FreeSetu',
    description:
      'Join FreeSetu to connect with verified service providers or offer your services.',
  },
};

// ==================== LOADING FALLBACK ====================

function FormSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="h-24 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-14 bg-gray-200 rounded-xl mb-6" />
      <div className="h-px bg-gray-200 my-6" />
      <div className="space-y-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-14 bg-gray-200 rounded-xl" />
          </div>
        ))}
        <div className="h-5 bg-gray-200 rounded w-64" />
        <div className="h-14 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

// ==================== REGISTER PAGE COMPONENT ====================

/**
 * Register page
 * Features:
 * - Full-page layout with split design
 * - RegisterForm component
 * - Auto-redirect if already logged in
 * - Creates user record in Firestore
 * - SEO meta tags
 * - Loading states
 * - Error handling via form component
 */
export default function RegisterPage() {
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
            Start your journey
            <br />
            with FreeSetu
          </h1>
          <p className="text-gray-800 text-lg max-w-md leading-relaxed">
            Whether you need services or want to offer them, create an account and
            join our growing community of trusted professionals and happy customers.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-gray-700 text-sm">Verified Providers</div>
            </div>
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-gray-700 text-sm">Service Categories</div>
            </div>
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-gray-700 text-sm">Free Consultations</div>
            </div>
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/40">
              <div className="text-3xl font-bold text-gray-900">25+</div>
              <div className="text-gray-700 text-sm">Cities Covered</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-gray-700 text-sm">
          © {new Date().getFullYear()} FreeSetu. All rights reserved.
        </div>
      </div>

      {/* ==================== RIGHT SIDE - FORM ==================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
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
              Create an account
            </h2>
            <p className="mt-2 text-gray-600">
              Fill in your details to get started
            </p>
          </div>

          {/* Auth Redirect Check */}
          <Suspense fallback={<FormSkeleton />}>
            <AuthRedirect>
              <RegisterForm />
            </AuthRedirect>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
