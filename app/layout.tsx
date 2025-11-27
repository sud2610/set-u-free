import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Set-U-Free | Find Local Service Providers',
    template: '%s | Set-U-Free',
  },
  description:
    'Connect with trusted local service providers for home services, beauty, wellness, education, and more. Book instantly and get things done effortlessly.',
  keywords: [
    'local services',
    'service providers',
    'home services',
    'beauty services',
    'wellness',
    'tutoring',
    'book services online',
    'India',
  ],
  authors: [{ name: 'Set-U-Free Team' }],
  creator: 'Set-U-Free',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://setufree.com',
    siteName: 'Set-U-Free',
    title: 'Set-U-Free | Find Local Service Providers',
    description:
      'Connect with trusted local service providers. Book instantly and get things done effortlessly.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Set-U-Free - Your Local Service Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Set-U-Free | Find Local Service Providers',
    description:
      'Connect with trusted local service providers. Book instantly and get things done effortlessly.',
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
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#faf8f5] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

