'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Navbar } from '@/components/common/Navbar';
import {
  LayoutDashboard,
  Calendar,
  Settings,
  User,
  Star,
  BarChart3,
  FileText,
  Loader2,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<boolean | null>(null);

  // Listen to Firebase Auth directly for faster detection
  useEffect(() => {
    if (!auth) {
      setFirebaseUser(false);
      setAuthChecked(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      console.log('Dashboard: Firebase auth state:', fbUser?.uid || 'no user');
      setFirebaseUser(!!fbUser);
      if (!fbUser) {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // When context user becomes available, mark as ready
  useEffect(() => {
    if (user) {
      console.log('Dashboard: Context user available:', user.fullName);
      setAuthChecked(true);
    }
  }, [user]);

  // If Firebase has a user but context doesn't yet, wait a bit more
  useEffect(() => {
    if (firebaseUser === true && !user && !loading) {
      console.log('Dashboard: Firebase has user, waiting for context...');
      const timer = setTimeout(() => {
        console.log('Dashboard: Timeout waiting for context user');
        setAuthChecked(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [firebaseUser, user, loading]);

  // Show loading state while checking auth
  if (!authChecked || (firebaseUser === true && !user)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <Loader2 className="w-6 h-6 text-yellow-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-500">
              {firebaseUser === null ? 'Checking authentication...' : 
               firebaseUser === true && !user ? 'Loading your profile...' : 
               'Please wait...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No user after waiting - show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-200">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h1>
            <p className="text-gray-500 mb-6">
              Please sign in to access your dashboard
            </p>
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-yellow-200"
            >
              Sign In
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-yellow-600 hover:text-yellow-700 font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isProvider = user.role === 'provider';

  // Navigation items based on role
  const customerNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/dashboard/favorites', icon: Star, label: 'Favorites' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const providerNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/dashboard/services', icon: FileText, label: 'Services' },
    { href: '/dashboard/reviews', icon: Star, label: 'Reviews' },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = isProvider ? providerNavItems : customerNavItems;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Same Navbar as Home Page */}
      <Navbar />

      {/* Dashboard Sub-Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-20 md:top-24 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Dashboard Title */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">
                {isProvider ? 'Provider Dashboard' : 'My Dashboard'}
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back, {user.fullName.split(' ')[0]}!
              </p>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide flex-1 sm:flex-none sm:justify-end">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-yellow-100 text-yellow-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-yellow-600' : ''}`} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
