'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, CheckCircle, Star, Users } from 'lucide-react';

// ==================== TYPES ====================

interface TrustBadge {
  icon: React.ReactNode;
  text: string;
}

// ==================== CONSTANTS ====================

const trustBadges: TrustBadge[] = [
  { icon: <CheckCircle className="w-4 h-4" />, text: '100% Free Consultations' },
  { icon: <Star className="w-4 h-4" />, text: 'Verified Professionals' },
  { icon: <Users className="w-4 h-4" />, text: '10K+ Happy Customers' },
];

// ==================== HERO SECTION COMPONENT ====================

/**
 * Hero section for the home page
 * Features:
 * - Large hero banner with background image/gradient
 * - Main headline and subheading
 * - CTA buttons
 * - Trust badges
 * - Floating stats cards
 * - Responsive design
 */
export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* ==================== BACKGROUND ==================== */}
      
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50" />
      
      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-300/10 rounded-full blur-3xl" />

      {/* ==================== CONTENT ==================== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* ==================== LEFT CONTENT ==================== */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 shadow-sm mb-6">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              <span className="text-sm font-medium text-gray-700">
                Trusted by 10,000+ customers across India
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Find Trusted Service Providers for{' '}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Free Consultations
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C50 4 150 2 298 10"
                    stroke="url(#paint0_linear)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="paint0_linear" x1="2" y1="10" x2="298" y2="10">
                      <stop stopColor="#f97316" />
                      <stop offset="1" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Connect with verified dentists, beauty experts, fitness trainers, and more. 
              Book your free consultation today and get expert advice at no cost.
            </p>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <span className="text-green-500">{badge.icon}</span>
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                Explore Services
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                href="/register?role=provider"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-300"
              >
                Become a Provider
              </Link>
            </div>

            {/* Provider Avatars */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white shadow-sm"
                    style={{
                      backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`,
                      backgroundSize: 'cover',
                    }}
                  />
                ))}
                <div className="w-10 h-10 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">500+</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">500+ providers</span> ready to help
              </p>
            </div>
          </div>

          {/* ==================== RIGHT CONTENT - HERO IMAGE ==================== */}
          <div className="relative hidden lg:block">
            {/* Main Image Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="aspect-[4/3] relative">
                <Image
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80"
                  alt="Healthcare professional consultation"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              
              {/* Image Overlay Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
                    <Play className="w-5 h-5 text-orange-500 ml-1" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Watch How It Works</p>
                    <p className="text-white/80 text-sm">2 min video</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card - Top Right */}
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Booking Confirmed!</p>
                  <p className="text-sm text-gray-500">Free Consultation</p>
                </div>
              </div>
            </div>

            {/* Floating Card - Bottom Left */}
            <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white"
                      style={{
                        backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 20})`,
                        backgroundSize: 'cover',
                      }}
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">2,500+ Reviews</p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-10 right-10 w-20 h-20 bg-orange-200 rounded-full blur-xl opacity-60" />
            <div className="absolute -z-10 bottom-10 left-10 w-32 h-32 bg-amber-200 rounded-full blur-xl opacity-60" />
          </div>
        </div>
      </div>

      {/* ==================== SCROLL INDICATOR ==================== */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-gray-400">
        <span className="text-xs font-medium">Scroll to explore</span>
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-gray-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
