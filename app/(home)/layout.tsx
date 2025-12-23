import { Metadata, Viewport } from 'next';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

// ==================== METADATA ====================

export const metadata: Metadata = {
  title: {
    default: 'Set-U-Free | Find Trusted Service Providers for Free Consultations',
    template: '%s | Set-U-Free',
  },
  description:
    'Connect with verified local service providers for free consultations. Find dentists, beauty experts, fitness trainers, and more. Book instantly and get expert advice at no cost.',
  keywords: [
    'free consultation',
    'service providers',
    'local services',
    'dentist',
    'beauty salon',
    'fitness trainer',
    'yoga classes',
    'physiotherapy',
    'nutrition consultant',
    'book appointment',
    'verified professionals',
    'India',
  ],
  authors: [{ name: 'Set-U-Free Team' }],
  creator: 'Set-U-Free',
  publisher: 'Set-U-Free',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'Set-U-Free',
    title: 'Set-U-Free | Find Trusted Service Providers for Free Consultations',
    description:
      'Connect with verified local service providers. Book free consultations with dentists, beauty experts, fitness trainers, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Set-U-Free - Your Local Service Marketplace',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Set-U-Free | Find Trusted Service Providers',
    description:
      'Connect with verified local service providers. Book free consultations instantly.',
    images: ['/og-image.png'],
    creator: '@setufree',
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
  verification: {
    google: 'google-site-verification-code',
  },
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
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}






