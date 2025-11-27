import { Metadata } from 'next';
import { Suspense } from 'react';
import { ServicesContent } from './ServicesContent';
import { ServicesLoading } from './ServicesLoading';

// ==================== METADATA ====================

export const metadata: Metadata = {
  title: 'Browse All Services | Find Trusted Service Providers',
  description:
    'Explore our wide range of services including dentists, beauty experts, fitness trainers, yoga instructors, and more. Book free consultations with verified professionals.',
  keywords: [
    'services',
    'dentist',
    'beauty salon',
    'fitness trainer',
    'yoga classes',
    'physiotherapy',
    'nutrition',
    'free consultation',
    'book appointment',
  ],
  openGraph: {
    title: 'Browse All Services | Set-U-Free',
    description:
      'Find trusted service providers for free consultations. Browse by category and location.',
    images: ['/og-services.png'],
  },
};

// ==================== SERVICES PAGE ====================

/**
 * Main services listing page
 * Features:
 * - Search and filter section
 * - Provider cards grid
 * - Pagination/Load more
 * - Responsive design
 * - SEO optimized
 */
export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Find Your Perfect{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Service Provider
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Browse through our verified professionals and book free consultations
              in just a few clicks.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <Suspense fallback={<ServicesLoading />}>
        <ServicesContent />
      </Suspense>
    </>
  );
}
