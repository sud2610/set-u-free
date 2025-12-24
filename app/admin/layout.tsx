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
  Users,
  Briefcase,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  Star,
  Bell,
  Home,
  BarChart3,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Package,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// ⚠️ DEV MODE: Set this to true to bypass authentication during development
const DEV_BYPASS_AUTH = process.env.NODE_ENV === 'development';

// Mock admin user for development
const DEV_ADMIN_USER = {
  uid: 'dev-admin',
  fullName: 'Dev Admin',
  email: 'admin@localhost',
  role: 'admin' as const,
  location: 'Development',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, loading, logout } = useAuth();
  
  // Use mock admin in dev mode, otherwise use real auth
  const user = DEV_BYPASS_AUTH ? DEV_ADMIN_USER : authUser;
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [authChecked, setAuthChecked] = useState(DEV_BYPASS_AUTH ? true : false);
  const [firebaseUser, setFirebaseUser] = useState<boolean | null>(DEV_BYPASS_AUTH ? true : null);

  // Listen to Firebase Auth directly for faster detection
  useEffect(() => {
    // Skip auth check in dev mode
    if (DEV_BYPASS_AUTH) {
      console.log('🔓 Admin: DEV MODE - Auth bypassed');
      return;
    }
    
    if (!auth) {
      setFirebaseUser(false);
      setAuthChecked(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      console.log('Admin: Firebase auth state:', fbUser?.uid || 'no user');
      setFirebaseUser(!!fbUser);
      if (!fbUser) {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // When context user becomes available, mark as ready
  useEffect(() => {
    if (DEV_BYPASS_AUTH) return;
    
    if (user) {
      console.log('Admin: Context user available:', user.fullName, 'Role:', user.role);
      setAuthChecked(true);
    }
  }, [user]);

  // If Firebase has a user but context doesn't yet, wait a bit more
  useEffect(() => {
    if (DEV_BYPASS_AUTH) return;
    
    if (firebaseUser === true && !user && !loading) {
      console.log('Admin: Firebase has user, waiting for context...');
      const timer = setTimeout(() => {
        console.log('Admin: Timeout waiting for context user');
        setAuthChecked(true);
      }, 3000);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">
            {firebaseUser === null ? 'Checking authentication...' : 
             firebaseUser === true && !user ? 'Loading your profile...' : 
             'Please wait...'}
          </p>
        </div>
      </div>
    );
  }

  // No user after waiting - show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access Required</h1>
          <p className="text-slate-400 mb-6">
            Please sign in with an admin account to access this area
          </p>
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">
            You don&apos;t have permission to access the admin dashboard. This area is restricted to administrators only.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Admin navigation items
  const adminNavItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/providers', icon: Briefcase, label: 'Providers' },
    { href: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/admin/services', icon: Package, label: 'Services' },
    { href: '/admin/reviews', icon: Star, label: 'Reviews' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Dev Mode Banner */}
      {DEV_BYPASS_AUTH && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-1.5 text-sm font-medium">
          🔓 DEV MODE: Auth bypassed - You are viewing as mock admin
        </div>
      )}
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 z-50 h-full w-72 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${DEV_BYPASS_AUTH ? 'top-8' : 'top-0'}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <span className="font-bold text-white">FreeSetu</span>
              <span className="text-xs text-amber-500 block">Admin Panel</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Admin Profile Summary */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
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
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-900">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{user.fullName}</p>
              <p className="text-xs text-amber-500 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Management
          </p>
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-500 font-medium'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-amber-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-xl transition-colors"
          >
            <Home className="w-5 h-5 text-slate-500" />
            <span>Back to Site</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-xl transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 text-slate-500" />
            <span>User Dashboard</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
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
      <div className={`lg:pl-72 ${DEV_BYPASS_AUTH ? 'pt-8' : ''}`}>
        {/* Top Header */}
        <header className={`sticky z-30 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700 ${DEV_BYPASS_AUTH ? 'top-8' : 'top-0'}`}>
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-300" />
            </button>

            {/* Page Title */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <h1 className="text-xl font-semibold text-white">
                Admin Dashboard
              </h1>
            </div>

            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-white">Admin</span>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-slate-700 transition-colors">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
              </button>

              {/* Admin Avatar */}
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-700">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={user.fullName}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <span className="font-semibold text-slate-900">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{user.fullName}</p>
                  <p className="text-xs text-amber-500">Administrator</p>
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

