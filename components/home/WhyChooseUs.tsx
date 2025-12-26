'use client';

import {
  Shield,
  Clock,
  BadgeCheck,
  CreditCard,
  HeadphonesIcon,
  Zap,
  Star,
  Lock,
} from 'lucide-react';

// ==================== TYPES ====================

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

// ==================== CONSTANTS ====================

const benefits: Benefit[] = [
  {
    id: 'free',
    title: '100% Free Consultations',
    description: 'Get expert advice and consultations at absolutely no cost. No hidden fees, no surprises.',
    icon: CreditCard,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'verified',
    title: 'Verified Professionals',
    description: 'All our service providers are thoroughly verified with background checks and credential validation.',
    icon: BadgeCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'instant',
    title: 'Instant Booking',
    description: 'Book appointments instantly with real-time availability. No waiting, no phone calls needed.',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    id: 'secure',
    title: 'Secure & Private',
    description: 'Your data is protected with enterprise-grade security. We never share your information.',
    icon: Lock,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'rated',
    title: 'Highly Rated Providers',
    description: 'Choose from providers with genuine reviews and ratings from real customers.',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    id: 'support',
    title: '24/7 Customer Support',
    description: 'Our dedicated support team is always here to help you with any questions or issues.',
    icon: HeadphonesIcon,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
];

// Highlighted features for the hero banner
const highlightedFeatures = [
  {
    icon: CreditCard,
    title: '100% Free',
    description: 'No hidden charges',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Pros',
    description: 'Background checked',
  },
  {
    icon: Zap,
    title: 'Instant Booking',
    description: 'Book in seconds',
  },
];

// ==================== WHY CHOOSE US COMPONENT ====================

/**
 * Why Choose Us section for the home page
 * Features:
 * - Highlighted feature banner
 * - 6 benefit cards with icons
 * - Responsive grid layout
 * - Hover animations
 */
export function WhyChooseUs() {
  return (
    <section className="py-10 lg:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ==================== HIGHLIGHTED FEATURES BANNER ==================== */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {highlightedFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 text-gray-900"
                  >
                    <div className="w-14 h-14 bg-gray-900/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-gray-700">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================== HEADER ==================== */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full mb-4">
            Why FreeSetu
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              FreeSetu?
            </span>
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            We&apos;re committed to making your search for local services simple, 
            safe, and completely free.
          </p>
        </div>

        {/* ==================== BENEFITS GRID ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.id}
                className="group bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 hover:border-yellow-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 ${benefit.bgColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-7 h-7 ${benefit.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ==================== TRUST BADGES ==================== */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
              Trusted & Recognized By
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60">
            {/* Placeholder logos - replace with actual trust badges */}
            {['StartupIndia', 'Google Partners', 'ISO Certified', 'NASSCOM', 'Razorpay'].map(
              (badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Shield className="w-6 h-6" />
                  <span className="font-semibold">{badge}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* ==================== CTA SECTION ==================== */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Ready to get started?</p>
                <p className="text-sm text-gray-500">Find your perfect service provider today</p>
              </div>
            </div>
            <a
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl shadow-lg shadow-yellow-500/25 transition-all duration-300 whitespace-nowrap"
            >
              Explore Services
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;

