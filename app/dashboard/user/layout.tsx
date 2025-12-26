import { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { DashboardLayoutClient } from './DashboardLayoutClient';

// ==================== METADATA ====================

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | My Dashboard - FreeSetu',
  },
  description: 'Manage your bookings, profile, and settings on FreeSetu.',
  robots: {
    index: false,
    follow: false,
  },
};

// ==================== LAYOUT ====================

export default function UserDashboardLayout({
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
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </>
  );
}
