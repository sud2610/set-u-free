'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  X,
  LogOut,
  Settings,
  Calendar,
  LayoutDashboard,
  Briefcase,
  Search,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

// ==================== TYPES ====================

interface NavTab {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// ==================== NAVBAR COMPONENT ====================

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navTabs: NavTab[] = [
    { label: 'Services', href: '/', icon: <Search className="w-4 h-4" /> },
    { label: 'About', href: '/about', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Contact', href: '/contact', icon: <Briefcase className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
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
    return '/dashboard';
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 shadow-xl shadow-amber-500/20'
          : 'bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400'
      }`}
    >
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* ==================== LOGO ==================== */}
          <Link href="/" className="flex items-center flex-shrink-0 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-white/30 rounded-2xl blur-sm group-hover:bg-white/40 transition-colors" />
              <Image
                src="/logo.png"
                alt="FreeSetu"
                width={280}
                height={70}
                className="relative h-14 sm:h-16 md:h-[72px] w-auto object-contain drop-shadow-sm rounded-xl border-2 border-gray-900"
                priority
              />
            </div>
          </Link>

          {/* ==================== CENTER NAVIGATION ==================== */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg shadow-amber-600/10 border border-white/50">
              {navTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActiveLink(tab.href)
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/40'
                      : 'text-gray-700 hover:text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {isActiveLink(tab.href) && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* ==================== RIGHT SECTION ==================== */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-white/50 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-white/90 hover:bg-white border-2 border-white/50 hover:border-amber-300 shadow-md hover:shadow-lg transition-all duration-200"
                    aria-expanded={isProfileDropdownOpen}
                  >
                    <Menu className="w-4 h-4 text-amber-700" />
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt={user.fullName}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center ring-2 ring-amber-400">
                        <span className="text-xs font-bold text-white">{getUserInitials()}</span>
                      </div>
                    )}
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl shadow-amber-500/20 border border-amber-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-4 bg-gradient-to-r from-yellow-400 to-amber-400">
                        <div className="flex items-center gap-3">
                          {user.profileImage ? (
                            <Image src={user.profileImage} alt={user.fullName} width={48} height={48} className="w-12 h-12 rounded-full object-cover ring-2 ring-white" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center ring-2 ring-white">
                              <span className="text-lg font-bold text-white">{getUserInitials()}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 truncate">{user.fullName}</p>
                            <p className="text-sm text-amber-800 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/80 text-amber-800 text-xs font-semibold rounded-full capitalize">
                            <Sparkles className="w-3 h-3" />
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="py-2">
                        {[
                          { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                          { href: '/dashboard/bookings', icon: Calendar, label: 'My Bookings' },
                          ...(user.role === 'provider' ? [{ href: '/dashboard/services', icon: Briefcase, label: 'My Services' }] : []),
                          { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-amber-50 transition-colors group"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="w-5 h-5 text-amber-500" />
                              <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-amber-100 p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full rounded-xl"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/provider-access"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Provider Access</span>
                </Link>
              </div>
            )}

            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2.5 rounded-xl bg-white/80 hover:bg-white text-amber-800 shadow-md hover:shadow-lg transition-all duration-200"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ==================== MOBILE MENU ==================== */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 animate-in slide-in-from-top duration-200">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/50">
              <div className="flex flex-col gap-1 mb-4">
                {navTabs.map((tab) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      isActiveLink(tab.href)
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900 font-semibold shadow-md'
                        : 'text-gray-700 hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActiveLink(tab.href) ? 'text-gray-900' : 'text-amber-600'}>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActiveLink(tab.href) ? 'text-gray-900' : 'text-gray-400'}`} />
                  </Link>
                ))}
              </div>

              {!user && (
                <div className="pt-4 border-t border-amber-200">
                  <Link
                    href="/provider-access"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-white bg-gray-900 hover:bg-gray-800 rounded-xl font-semibold shadow-lg transition-all"
                  >
                    <Briefcase className="w-4 h-4" />
                    Provider Access
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
