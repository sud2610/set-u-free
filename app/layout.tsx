import type { Metadata, Viewport } from 'next';
import { Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FreeSetu - Free Consultations with Verified Service Providers',
    template: '%s | FreeSetu',
  },
  description:
    'FreeSetu connects you with verified local service providers for 100% free consultations. Find dentists, beauty experts, fitness trainers, and more. Book instantly - no hidden charges!',
  keywords: [
    'free consultation',
    'FreeSetu',
    'local services',
    'service providers',
    'dentist consultation',
    'beauty services',
    'fitness trainer',
    'wellness',
    'book appointment free',
    'verified professionals',
    'India',
  ],
  authors: [{ name: 'FreeSetu Team' }],
  creator: 'FreeSetu',
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
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeSetu - Free Consultations with Verified Professionals',
    description:
      'Connect with verified service providers for 100% free consultations. Book instantly on FreeSetu!',
    images: ['/og-image.png'],
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
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fef7ee' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={playfair.variable}>
      <body className="min-h-screen bg-[#faf8f5] antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#facc15',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

