import { Metadata } from 'next';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ProviderDetailContent } from './ProviderDetailContent';
import { ProviderDetailLoading } from './ProviderDetailLoading';

// ==================== TYPES ====================

interface PageProps {
  params: Promise<{ id: string }>;
}

// ==================== METADATA ====================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  
  // Use a generic title since we can't fetch from Firebase on the server easily
  // The actual provider name will be shown in the page content
  return {
    title: `Provider Details | Set-U-Free`,
    description: 'View provider details, services, reviews, and book a free consultation on Set-U-Free.',
    openGraph: {
      title: `Provider Details | Set-U-Free`,
      description: 'View provider details, services, reviews, and book a free consultation.',
      type: 'profile',
      images: [`/api/og/provider/${resolvedParams.id}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Provider Details | Set-U-Free',
      description: 'View provider details, services, reviews, and book a free consultation.',
    },
  };
}

// ==================== PROVIDER DETAIL PAGE ====================

/**
 * Provider detail page
 * Features:
 * - Provider header with profile info
 * - About section with bio and services
 * - Availability with booking modal
 * - Reviews section
 * - Related providers
 * - SEO optimized
 */
export default async function ProviderDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '12px',
            padding: '16px',
          },
        }}
      />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50">
          <Suspense fallback={<ProviderDetailLoading />}>
            <ProviderDetailContent providerId={resolvedParams.id} />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
}
