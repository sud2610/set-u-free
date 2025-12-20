import { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';

// ==================== METADATA ====================

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// ==================== AUTH LAYOUT COMPONENT ====================

/**
 * Auth layout wrapper for login and register pages
 * Features:
 * - Clean, focused design
 * - Toast notifications
 * - Logo link to home
 * - No navbar/footer for distraction-free auth
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* Page Content */}
      {children}
    </>
  );
}






