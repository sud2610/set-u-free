'use client';

// ==================== HERO SECTION COMPONENT ====================

/**
 * Hero section - Compact and attractive
 */
export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-orange-100/50 via-[#faf8f5] to-amber-100/50 overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
          For{' '}
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Free Consultations
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
          Connect with verified dentists, beauty experts, fitness trainers, and more.
          Book your free consultation today and get expert advice at no cost.
        </p>

        {/* Quick trust indicators */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            100% Free
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Verified Experts
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            500+ Providers
          </span>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
