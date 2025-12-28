'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Loader2, Bell, Clock, XCircle, Mail, Phone, AlertTriangle } from 'lucide-react';
import { getProvider } from '@/lib/firestore';
import type { Provider } from '@/types';

// ==================== LAYOUT CLIENT COMPONENT ====================

export function ProviderDashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [providerData, setProviderData] = useState<Provider | null>(null);
  const [providerLoading, setProviderLoading] = useState(true);

  // ==================== AUTH CHECK ====================

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/provider');
    }
  }, [user, loading, router]);

  // ==================== FETCH PROVIDER STATUS ====================

  useEffect(() => {
    const fetchProviderData = async () => {
      if (user?.uid && user.role === 'provider') {
        try {
          const data = await getProvider(user.uid);
          setProviderData(data);
        } catch (error) {
          console.error('Error fetching provider data:', error);
        }
      }
      setProviderLoading(false);
    };

    if (!loading && user) {
      fetchProviderData();
    }
  }, [user, loading]);

  // ==================== LOADING STATE ====================

  if (loading || providerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ==================== NOT AUTHENTICATED ====================

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to access your provider dashboard.
          </p>
          <Link
            href="/login?redirect=/dashboard/provider"
            className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ==================== ROLE CHECK ====================

  if (user.role !== 'provider') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Customer Account Detected
          </h2>
          <p className="text-gray-600 mb-6">
            You&apos;re logged in as a customer. Please use the customer dashboard
            or register as a provider.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard/user"
              className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-center"
            >
              Customer Dashboard
            </Link>
            <Link
              href="/register?role=provider"
              className="flex-1 px-6 py-3 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold rounded-xl transition-colors text-center"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==================== PENDING APPROVAL CHECK ====================

  const providerStatus = providerData?.status || 'pending';

  if (providerStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Account Pending Approval
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for registering as a provider on FreeSetu! Your account is currently
            under review by our admin team. You&apos;ll receive access to your dashboard
            once your account is approved.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  <li>Our team will review your profile</li>
                  <li>This usually takes 1-2 business days</li>
                  <li>You&apos;ll be notified once approved</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500 mb-4">Need help? Contact our support team</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:support@freesetu.com"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== REJECTED CHECK ====================

  if (providerStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Account Not Approved
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Unfortunately, your provider account was not approved at this time.
            This could be due to incomplete information or not meeting our provider criteria.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">What can you do?</p>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  <li>Contact support to understand the reason</li>
                  <li>Update your profile with complete information</li>
                  <li>Request a re-review of your application</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500 mb-4">Need assistance? Reach out to our team</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:support@freesetu.com"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-xl transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER DASHBOARD ====================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900">FreeSetu</span>
                <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  Provider
                </span>
              </div>
            </Link>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile */}
              <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {user.fullName?.charAt(0) || 'P'}
                    </span>
                  </div>
                )}
                <span className="hidden md:block font-medium text-gray-900">
                  {user.fullName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex max-w-screen-2xl mx-auto">
        {/* Sidebar */}
        <Sidebar user={user} variant="provider" />

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-5rem)] p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}






