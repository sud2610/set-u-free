import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ProviderDetailContent } from './ProviderDetailContent';
import { ProviderDetailLoading } from './ProviderDetailLoading';

// ==================== TYPES ====================

interface PageProps {
  params: Promise<{ id: string }>;
}

// ==================== MOCK DATA FOR METADATA ====================

// In production, fetch from Firestore
const getProviderForMetadata = async (id: string) => {
  // Mock provider data
  const mockProviders: Record<string, { name: string; description: string; category: string }> = {
    '1': {
      name: 'Smile Dental Clinic',
      description: 'Expert dental care with modern technology and experienced professionals.',
      category: 'Dentist',
    },
    '2': {
      name: 'Glamour Beauty Studio',
      description: 'Premium beauty and spa services for all your grooming needs.',
      category: 'Beauty',
    },
    '3': {
      name: 'FitLife Gym & Training',
      description: 'State-of-the-art fitness center with certified personal trainers.',
      category: 'Gym',
    },
  };

  return mockProviders[id] || null;
};

// ==================== METADATA ====================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const provider = await getProviderForMetadata(resolvedParams.id);

  if (!provider) {
    return {
      title: 'Provider Not Found',
      description: 'The requested service provider could not be found.',
    };
  }

  return {
    title: `${provider.name} | ${provider.category} Services`,
    description: provider.description,
    openGraph: {
      title: `${provider.name} | Set-U-Free`,
      description: provider.description,
      type: 'profile',
      images: [`/api/og/provider/${resolvedParams.id}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: provider.name,
      description: provider.description,
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
