'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  Calendar,
  Star,
  Package,
  Loader2,
  ArrowUpRight,
  Activity,
  PieChart,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { User, Booking, Provider, Service, Review } from '@/types';

interface AnalyticsData {
  users: {
    total: number;
    customers: number;
    providers: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  providers: {
    total: number;
    verified: number;
    pending: number;
    thisMonth: number;
  };
  services: {
    total: number;
    byCategory: { category: string; count: number }[];
  };
  reviews: {
    total: number;
    averageRating: number;
    distribution: { rating: number; count: number }[];
  };
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    if (!db) return;

    try {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch all collections
      const [usersSnapshot, bookingsSnapshot, providersSnapshot, servicesSnapshot, reviewsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'bookings')),
        getDocs(collection(db, 'providers')),
        getDocs(collection(db, 'services')),
        getDocs(collection(db, 'reviews')),
      ]);

      // Process users
      const users = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      
      const usersThisMonth = users.filter(u => u.createdAt >= thisMonthStart).length;
      const usersLastMonth = users.filter(u => u.createdAt >= lastMonthStart && u.createdAt <= lastMonthEnd).length;
      const userGrowth = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 100;

      // Process bookings
      const bookings = bookingsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });

      const bookingsThisMonth = bookings.filter(b => b.createdAt >= thisMonthStart).length;
      const bookingsLastMonth = bookings.filter(b => b.createdAt >= lastMonthStart && b.createdAt <= lastMonthEnd).length;
      const bookingGrowth = bookingsLastMonth > 0 ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100 : 100;

      // Process providers
      const providers = providersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });

      // Process services by category
      const services = servicesSnapshot.docs.map(doc => doc.data());
      const categoryCount: Record<string, number> = {};
      services.forEach(s => {
        const cat = s.category || 'Other';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      const servicesByCategory = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      // Process reviews
      const reviews = reviewsSnapshot.docs.map(doc => doc.data());
      const avgRating = reviews.length > 0 
        ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length 
        : 0;
      
      const ratingDist = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: reviews.filter(r => r.rating === rating).length,
      }));

      setData({
        users: {
          total: users.length,
          customers: users.filter(u => u.role === 'customer').length,
          providers: users.filter(u => u.role === 'provider').length,
          thisMonth: usersThisMonth,
          lastMonth: usersLastMonth,
          growth: userGrowth,
        },
        bookings: {
          total: bookings.length,
          pending: bookings.filter(b => b.status === 'pending').length,
          confirmed: bookings.filter(b => b.status === 'confirmed').length,
          completed: bookings.filter(b => b.status === 'completed').length,
          cancelled: bookings.filter(b => b.status === 'cancelled').length,
          thisMonth: bookingsThisMonth,
          lastMonth: bookingsLastMonth,
          growth: bookingGrowth,
        },
        providers: {
          total: providers.length,
          verified: providers.filter(p => p.verified).length,
          pending: providers.filter(p => !p.verified).length,
          thisMonth: providers.filter(p => p.createdAt >= thisMonthStart).length,
        },
        services: {
          total: services.length,
          byCategory: servicesByCategory,
        },
        reviews: {
          total: reviews.length,
          averageRating: avgRating,
          distribution: ratingDist,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-slate-400 mt-1">Platform performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${data.users.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.users.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(data.users.growth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">{data.users.total.toLocaleString()}</p>
            <p className="text-slate-400 text-sm">Total Users</p>
            <p className="text-slate-500 text-xs mt-2">{data.users.thisMonth} new this month</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${data.bookings.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.bookings.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(data.bookings.growth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">{data.bookings.total.toLocaleString()}</p>
            <p className="text-slate-400 text-sm">Total Bookings</p>
            <p className="text-slate-500 text-xs mt-2">{data.bookings.thisMonth} this month</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Briefcase className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-sm text-emerald-400">
              <Activity className="w-4 h-4" />
              <span>{data.providers.verified}/{data.providers.total}</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">{data.providers.total.toLocaleString()}</p>
            <p className="text-slate-400 text-sm">Providers</p>
            <p className="text-slate-500 text-xs mt-2">{data.providers.verified} verified</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Star className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">{data.reviews.averageRating.toFixed(1)}</p>
            <p className="text-slate-400 text-sm">Avg Rating</p>
            <p className="text-slate-500 text-xs mt-2">{data.reviews.total} reviews</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Distribution */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">Booking Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Pending', value: data.bookings.pending, color: 'bg-amber-500' },
              { label: 'Confirmed', value: data.bookings.confirmed, color: 'bg-blue-500' },
              { label: 'Completed', value: data.bookings.completed, color: 'bg-emerald-500' },
              { label: 'Cancelled', value: data.bookings.cancelled, color: 'bg-red-500' },
            ].map(item => {
              const percentage = data.bookings.total > 0 
                ? (item.value / data.bookings.total) * 100 
                : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Services by Category */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">Services by Category</h3>
          <div className="space-y-3">
            {data.services.byCategory.slice(0, 6).map((item, index) => {
              const percentage = data.services.total > 0 
                ? (item.count / data.services.total) * 100 
                : 0;
              const colors = [
                'bg-amber-500',
                'bg-blue-500',
                'bg-emerald-500',
                'bg-purple-500',
                'bg-pink-500',
                'bg-cyan-500',
              ];
              return (
                <div key={item.category} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-sm truncate">{item.category}</span>
                      <span className="text-slate-400 text-sm">{item.count}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-slate-500 text-sm mt-4 text-center">
            {data.services.total} total services across {data.services.byCategory.length} categories
          </p>
        </div>
      </div>

      {/* User Distribution & Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">User Distribution</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray={`${(data.users.customers / data.users.total) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="12"
                  strokeDasharray={`${(data.users.providers / data.users.total) * 251.2} 251.2`}
                  strokeDashoffset={`-${(data.users.customers / data.users.total) * 251.2}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{data.users.total}</p>
                  <p className="text-slate-400 text-xs">Users</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <div>
                  <p className="text-white font-medium">{data.users.customers}</p>
                  <p className="text-slate-400 text-sm">Customers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-purple-500" />
                <div>
                  <p className="text-white font-medium">{data.users.providers}</p>
                  <p className="text-slate-400 text-sm">Providers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">Rating Distribution</h3>
          <div className="flex items-end justify-center gap-4 h-40">
            {data.reviews.distribution.map(({ rating, count }) => {
              const maxCount = Math.max(...data.reviews.distribution.map(r => r.count));
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={rating} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-12 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-white font-medium">{rating}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                  <span className="text-slate-500 text-xs">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm">New Users (This Month)</p>
          <p className="text-2xl font-bold text-white mt-1">{data.users.thisMonth}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm">Pending Bookings</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{data.bookings.pending}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm">Pending Verifications</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{data.providers.pending}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Services</p>
          <p className="text-2xl font-bold text-white mt-1">{data.services.total}</p>
        </div>
      </div>
    </div>
  );
}

