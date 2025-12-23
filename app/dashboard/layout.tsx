'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  LayoutDashboard,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  Briefcase,
  Star,
  Bell,
  Home,
  BarChart3,
  FileText,
  Loader2,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<boolean | null>(null); // null = unknown, true = has user, false = no user

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
        // No Firebase user, we can show login prompt
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
      }, 3000); // Wait up to 3 seconds for context to sync
      return () => clearTimeout(timer);
    }
  }, [firebaseUser, user, loading]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  }, [logout, router]);

  // Show loading state while checking auth
  if (!authChecked || (firebaseUser === true && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">
            {firebaseUser === null ? 'Checking authentication...' : 
             firebaseUser === true && !user ? 'Loading your profile...' : 
             'Please wait...'}
          </p>
        </div>
      </div>
    );
  }

  // No user after waiting - show login prompt (NO REDIRECT to avoid loops)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h1>
          <p className="text-gray-500 mb-6">
            Please sign in to access your dashboard
          </p>
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors"
          >
            Sign In
          </Link>
          <p className="mt-4 text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-yellow-600 hover:text-yellow-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const isProvider = user.role === 'provider';

  // Navigation items based on role
  const customerNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/bookings', icon: Calendar, label: 'My Bookings' },
    { href: '/dashboard/favorites', icon: Star, label: 'Favorites' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const providerNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/dashboard/services', icon: FileText, label: 'My Services' },
    { href: '/dashboard/reviews', icon: Star, label: 'Reviews' },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = isProvider ? providerNavItems : customerNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Set-U-Free"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="relative">
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.fullName}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user.fullName}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {isProvider ? (
                  <>
                    <Briefcase className="w-3 h-3" />
                    Service Provider
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3" />
                    Customer
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-yellow-50 text-yellow-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-yellow-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-yellow-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
          >
            <Home className="w-5 h-5 text-gray-400" />
            <span>Back to Home</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
            <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Page Title - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-900">
                {isProvider ? 'Provider Dashboard' : 'My Dashboard'}
              </h1>
            </div>

            {/* Mobile Logo */}
            <Link href="/" className="lg:hidden">
              <Image
                src="/logo.png"
                alt="Set-U-Free"
                width={100}
                height={32}
                className="h-7 w-auto"
              />
            </Link>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User Avatar */}
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={user.fullName}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                    <span className="font-semibold text-gray-900">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
