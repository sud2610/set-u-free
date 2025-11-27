'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Calendar,
  LayoutDashboard,
  Briefcase,
  Search,
  Bell,
} from 'lucide-react';

// ==================== TYPES ====================

interface NavLink {
  label: string;
  href: string;
}

// ==================== CONSTANTS ====================

const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// ==================== NAVBAR COMPONENT ====================

/**
 * Main navigation bar component
 * Features:
 * - Logo and branding
 * - Navigation links
 * - Auth buttons (Login/Register) when logged out
 * - User profile dropdown when logged in
 * - Provider sign-up CTA
 * - Responsive mobile menu
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

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // ==================== HELPERS ====================

  const isActiveLink = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getUserInitials = (): string => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
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
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* ==================== LOGO ==================== */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900">Set-U-</span>
              <span className="text-xl font-bold text-orange-500">Free</span>
            </div>
          </Link>

          {/* ==================== DESKTOP NAVIGATION ==================== */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveLink(link.href)
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ==================== RIGHT SECTION ==================== */}
          <div className="flex items-center gap-3">
            {/* Search Button (Desktop) */}
            <button
              className="hidden md:flex p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {loading ? (
              // Loading skeleton
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ) : user ? (
              // ==================== LOGGED IN STATE ====================
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <button
                  className="hidden md:flex p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors"
                    aria-expanded={isProfileDropdownOpen}
                    aria-haspopup="true"
                  >
                    {/* Avatar */}
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt={user.fullName}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-100"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {getUserInitials()}
                        </span>
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {user.fullName.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isProfileDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full capitalize">
                          {user.role}
                        </span>
                      </div>

                      {/* Menu Items */}
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

                      {/* Logout */}
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
              // ==================== LOGGED OUT STATE ====================
              <div className="flex items-center gap-3">
                {/* Provider CTA - Desktop */}
                <Link
                  href="/register?role=provider"
                  className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  Become a Provider
                </Link>

                {/* Login Button */}
                <Link
                  href="/login"
                  className="hidden sm:flex px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Sign In
                </Link>

                {/* Register Button */}
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* ==================== MOBILE MENU BUTTON ==================== */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* ==================== MOBILE MENU ==================== */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top duration-200">
            {/* Search - Mobile */}
            <div className="px-2 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1 px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActiveLink(link.href)
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Buttons - Mobile */}
            {!user && (
              <div className="mt-4 pt-4 border-t border-gray-100 px-2 space-y-2">
                {/* Provider CTA */}
                <Link
                  href="/register?role=provider"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl font-medium transition-colors"
                >
                  <Briefcase className="w-5 h-5" />
                  Become a Provider
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-3 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-3 text-center text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold transition-colors"
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
