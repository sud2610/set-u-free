'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Calendar,
  LayoutDashboard,
  Briefcase,
} from 'lucide-react';

// ==================== TYPES ====================

interface NavTab {
  label: string;
  href: string;
  emoji: string;
  isNew?: boolean;
}

// ==================== CONSTANTS ====================

const navTabs: NavTab[] = [
  { label: 'Services', href: '/', emoji: '🏠' },
  { label: 'Experiences', href: '/about', emoji: '🎈', isNew: true },
  { label: 'Providers', href: '/contact', emoji: '🛎️', isNew: true },
];

// ==================== NAVBAR COMPONENT ====================

/**
 * Airbnb-style navigation bar component with blue theme
 */
export function Navbar() {
  // ==================== STATE ====================
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // ==================== HOOKS ====================
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ==================== EFFECTS ====================

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  // ==================== HANDLERS ====================

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  // ==================== HELPERS ====================

  const isActiveLink = (href: string): boolean => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getUserInitials = (): string => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return names[0][0].toUpperCase();
  };

  const getDashboardLink = (): string => {
    return user?.role === 'provider' ? '/dashboard/provider' : '/dashboard/user';
  };

  // ==================== RENDER ====================

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-28">
          {/* ==================== LOGO ==================== */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Set-U-Free - Free Help is Just a Click Away"
              width={400}
              height={100}
              className="h-16 sm:h-20 md:h-24 w-auto object-contain"
              priority
            />
          </Link>

          {/* ==================== CENTER NAVIGATION TABS ==================== */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center">
              {navTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="relative group"
                >
                  <div
                    className={`flex flex-col items-center px-5 py-1 transition-all duration-200 ${
                      isActiveLink(tab.href)
                        ? 'opacity-100'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {tab.isNew && (
                      <span className="absolute -top-1 right-1 px-1.5 py-0.5 bg-yellow-500 text-gray-900 text-[10px] font-bold rounded-full">
                        NEW
                      </span>
                    )}
                    <span className="text-xl mb-0.5">{tab.emoji}</span>
                    <span
                      className={`text-xs font-medium ${
                        isActiveLink(tab.href) ? 'text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </div>
                  {isActiveLink(tab.href) && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-gray-900 rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* ==================== RIGHT SECTION ==================== */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center gap-2 p-2 pl-3 rounded-full border border-gray-200 hover:shadow-md transition-all duration-200 bg-white"
                    aria-expanded={isProfileDropdownOpen}
                    aria-haspopup="true"
                  >
                    <Menu className="w-4 h-4 text-gray-600" />
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt={user.fullName}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-900">
                          {getUserInitials()}
                        </span>
                      </div>
                    )}
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 truncate">{user.fullName}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full capitalize">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-2">
                        <Link
                          href={getDashboardLink()}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">Dashboard</span>
                        </Link>

                        <Link
                          href={`${getDashboardLink()}/bookings`}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">My Bookings</span>
                        </Link>

                        {user.role === 'provider' && (
                          <Link
                            href="/dashboard/provider/services"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">My Services</span>
                          </Link>
                        )}

                        <Link
                          href={`${getDashboardLink()}/settings`}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">Settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/register?role=provider"
                  className="hidden lg:flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  Become a provider
                </Link>

                <Link
                  href="/login"
                  className="flex items-center gap-2 p-2 pl-3 rounded-full border border-gray-200 hover:shadow-md transition-all duration-200 bg-white"
                >
                  <Menu className="w-4 h-4 text-gray-600" />
                  <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </Link>
              </div>
            )}

            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ==================== MOBILE MENU ==================== */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-gray-100 animate-in slide-in-from-top duration-200">
            <div className="flex justify-around py-3">
              {navTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="relative flex flex-col items-center"
                >
                  {tab.isNew && (
                    <span className="absolute -top-1 right-0 px-1.5 py-0.5 bg-yellow-500 text-gray-900 text-[9px] font-bold rounded-full">
                      NEW
                    </span>
                  )}
                  <span className="text-xl mb-0.5">{tab.emoji}</span>
                  <span
                    className={`text-xs font-medium ${
                      isActiveLink(tab.href) ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {tab.label}
                  </span>
                  {isActiveLink(tab.href) && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gray-900 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {!user && (
              <div className="mt-3 pt-3 border-t border-gray-100 px-2 space-y-2">
                <Link
                  href="/register?role=provider"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  Become a Provider
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2.5 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2.5 text-center text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-xl font-semibold transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
