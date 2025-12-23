'use client';

import { useAuth } from '@/context/AuthContext';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';
import { ProviderDashboard } from '@/components/dashboard/ProviderDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return user.role === 'provider' ? <ProviderDashboard /> : <CustomerDashboard />;
}

