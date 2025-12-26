import { Metadata, Viewport } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { AnnouncementBanner } from '@/components/common/AnnouncementBanner';

// ==================== STRUCTURED DATA (JSON-LD) ====================

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://freesetu.com';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'FreeSetu',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    'FreeSetu connects customers with verified service providers for 100% free consultations.',
  foundingDate: '2023',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact.freesetu@gmail.com',
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://facebook.com/freesetu',
    'https://twitter.com/freesetu',
    'https://instagram.com/freesetu',
    'https://linkedin.com/company/freesetu',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'FreeSetu',
  url: BASE_URL,
  description: 'Free consultations with verified local service providers',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/services?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'FreeSetu',
  description: 'Platform connecting customers with verified service providers for free consultations',
  url: BASE_URL,
  priceRange: 'Free',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    description: 'Free initial consultations with all service providers',
  },
};

// ==================== METADATA ====================

export const metadata: Metadata = {
  title: {
    default: 'FreeSetu - Free Consultations with Verified Service Providers',
    template: '%s | FreeSetu',
  },
  description:
    'FreeSetu connects you with verified local service providers for 100% free consultations. Find dentists, beauty experts, fitness trainers, and more. Book instantly - no hidden charges, no commitments!',
  keywords: [
    'FreeSetu',
    'free consultation',
    'service providers',
    'local services',
    'dentist',
    'beauty salon',
    'fitness trainer',
    'yoga classes',
    'physiotherapy',
    'nutrition consultant',
    'book appointment free',
    'verified professionals',
    'India',
  ],
  authors: [{ name: 'FreeSetu Team' }],
  creator: 'FreeSetu',
  publisher: 'FreeSetu',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://freesetu.com'),
  alternates: {
    canonical: 'https://freesetu.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://freesetu.com',
    siteName: 'FreeSetu',
    title: 'FreeSetu - Free Consultations with Verified Service Providers',
    description:
      'FreeSetu connects you with verified professionals for 100% free consultations. Find dentists, beauty experts, fitness trainers, and more!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FreeSetu - Free Consultations with Verified Professionals',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeSetu - Free Consultations with Verified Professionals',
    description:
      'Connect with verified service providers for 100% free consultations. Book instantly on FreeSetu!',
    images: ['/og-image.png'],
    creator: '@freesetu',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // TODO: Add your actual Google Search Console verification code here
  // Get it from: https://search.google.com/search-console
  // verification: {
  //   google: 'your-actual-verification-code',
  // },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// ==================== LAYOUT COMPONENT ====================

/**
 * Home layout wrapper
 * Features:
 * - Consistent Navbar and Footer
 * - Toast notifications provider
 * - SEO metadata
 * - Responsive structure
 */
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />

      <div className="flex flex-col min-h-screen">
        {/* Announcement Banner - Floating at top */}
        <AnnouncementBanner />

        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}






