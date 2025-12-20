import { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

// ==================== METADATA ====================

export const metadata: Metadata = {
  title: {
    default: 'Browse Services',
    template: '%s | Set-U-Free Services',
  },
};

// ==================== LAYOUT COMPONENT ====================

export default function ServicesLayout({
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
            fontSize: '14px',
          },
        }}
      />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50">{children}</main>
        <Footer />
      </div>
    </>
  );
}






