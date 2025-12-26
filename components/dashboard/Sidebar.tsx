'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  Bell,
  HelpCircle,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { User as UserType } from '@/types';

// ==================== TYPES ====================

interface SidebarProps {
  user: UserType | null;
  variant?: 'user' | 'provider';
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

// ==================== NAV ITEMS ====================

const userNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard/user', icon: LayoutDashboard },
  { name: 'My Bookings', href: '/dashboard/user/bookings', icon: Calendar, badge: 0 },
  { name: 'Profile', href: '/dashboard/user/profile', icon: User },
  { name: 'Notifications', href: '/dashboard/user/notifications', icon: Bell, badge: 3 },
  { name: 'Settings', href: '/dashboard/user/settings', icon: Settings },
  { name: 'Help & Support', href: '/dashboard/user/help', icon: HelpCircle },
];

const providerNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard/provider', icon: LayoutDashboard },
  { name: 'Appointments', href: '/dashboard/provider/appointments', icon: Calendar, badge: 5 },
  { name: 'Services', href: '/dashboard/provider/services', icon: Settings },
  { name: 'Profile', href: '/dashboard/provider/profile', icon: User },
  { name: 'Notifications', href: '/dashboard/provider/notifications', icon: Bell, badge: 2 },
  { name: 'Settings', href: '/dashboard/provider/settings', icon: Settings },
];

// ==================== SIDEBAR COMPONENT ====================

export function Sidebar({ user, variant = 'user' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = variant === 'provider' ? providerNavItems : userNavItems;

  // ==================== HANDLERS ====================

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeMobile = () => setIsMobileOpen(false);

  // ==================== RENDER ====================

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-40 p-2 bg-white rounded-xl shadow-lg border border-gray-200"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 lg:top-20 left-0 z-50 lg:z-auto
          w-72 h-screen lg:h-[calc(100vh-5rem)]
          bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold text-gray-900">FreeSetu</span>
            </Link>
            <button
              onClick={closeMobile}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 lg:p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {user?.fullName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {user?.fullName || 'Guest User'}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {user?.email || 'Not logged in'}
                </p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="mt-3">
              <span className={`
                inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                ${variant === 'provider' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
                }
              `}>
                {variant === 'provider' ? 'Service Provider' : 'Customer'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard/user' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className={`
                        flex items-center justify-between px-4 py-3 rounded-xl transition-all
                        ${isActive
                          ? 'bg-orange-50 text-orange-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : ''}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full">
                          {item.badge}
                        </span>
                      ) : isActive ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            {/* Back to Home */}
            <Link
              href="/"
              onClick={closeMobile}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all mb-2"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
