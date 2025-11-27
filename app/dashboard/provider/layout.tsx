import { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { ProviderDashboardLayoutClient } from './ProviderDashboardLayoutClient';

// ==================== METADATA ====================

export const metadata: Metadata = {
  title: {
    default: 'Provider Dashboard',
    template: '%s | Provider Dashboard - Set-U-Free',
  },
  description: 'Manage your services, bookings, and business profile on Set-U-Free.',
  robots: {
    index: false,
    follow: false,
  },
};

// ==================== LAYOUT ====================

export default function ProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <ProviderDashboardLayoutClient>{children}</ProviderDashboardLayoutClient>
    </>
  );
}
