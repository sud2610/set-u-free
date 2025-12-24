'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  XCircle,
  Shield,
  Star,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
} from 'firebase/firestore';
import type { User, Booking, Provider, Service, Review } from '@/types';

interface AdminStats {
  totalUsers: number;
  totalProviders: number;
  totalCustomers: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingVerifications: number;
  verifiedProviders: number;
  totalServices: number;
  totalReviews: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'booking' | 'provider' | 'review';
  title: string;
  description: string;
  timestamp: Date;
  status?: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!db) return;

    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[];
      
      const totalUsers = users.length;
      const totalCustomers = users.filter(u => u.role === 'customer').length;
      const totalProviderUsers = users.filter(u => u.role === 'provider').length;

      // Fetch providers
      const providersSnapshot = await getDocs(collection(db, 'providers'));
      const providers = providersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as Provider[];
      
      const totalProviders = providers.length;
      const verifiedProviders = providers.filter(p => p.verified).length;
      const pendingVerifications = providers.filter(p => !p.verified).length;

      // Fetch bookings
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[];
      
      const totalBookings = bookings.length;
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

      // Fetch services
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const totalServices = servicesSnapshot.size;

      // Fetch reviews
      const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
      const totalReviews = reviewsSnapshot.size;

      setStats({
        totalUsers,
        totalProviders,
        totalCustomers,
        totalBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        pendingVerifications,
        verifiedProviders,
        totalServices,
        totalReviews,
      });

      // Build recent activity
      const activity: RecentActivity[] = [];

      // Recent users
      const recentUsersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      recentUsersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        activity.push({
          id: doc.id,
          type: 'user',
          title: `New ${data.role === 'provider' ? 'provider' : 'user'} registered`,
          description: data.fullName || data.email,
          timestamp: data.createdAt?.toDate() || new Date(),
        });
      });

      // Recent bookings
      const recentBookingsQuery = query(
        collection(db, 'bookings'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
      recentBookingsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        activity.push({
          id: doc.id,
          type: 'booking',
          title: 'New booking created',
          description: `Booking #${doc.id.slice(0, 8)}`,
          timestamp: data.createdAt?.toDate() || new Date(),
          status: data.status,
        });
      });

      // Sort by timestamp
      activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setRecentActivity(activity.slice(0, 10));

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      subtitle: `${stats?.totalCustomers || 0} customers, ${stats?.totalProviders || 0} providers`,
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      subtitle: `${stats?.pendingBookings || 0} pending`,
    },
    {
      title: 'Providers',
      value: stats?.totalProviders || 0,
      icon: Briefcase,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      subtitle: `${stats?.verifiedProviders || 0} verified`,
    },
    {
      title: 'Services',
      value: stats?.totalServices || 0,
      icon: Package,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      subtitle: 'Active services',
    },
  ];

  const bookingStats = [
    { label: 'Completed', value: stats?.completedBookings || 0, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Pending', value: stats?.pendingBookings || 0, icon: Clock, color: 'text-amber-400' },
    { label: 'Cancelled', value: stats?.cancelledBookings || 0, icon: XCircle, color: 'text-red-400' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'booking': return Calendar;
      case 'provider': return Briefcase;
      case 'review': return Star;
      default: return Users;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const colors: Record<string, string> = {
      pending: 'bg-amber-500/20 text-amber-400',
      confirmed: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-emerald-500/20 text-emerald-400',
      cancelled: 'bg-red-500/20 text-red-400',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-slate-500/20 text-slate-400'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here&apos;s what&apos;s happening on FreeSetu.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>12%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
              <p className="text-slate-400 text-sm mt-1">{stat.title}</p>
              <p className="text-slate-500 text-xs mt-2">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Stats & Pending Verifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Breakdown */}
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-6">Booking Status</h2>
          <div className="grid grid-cols-3 gap-4">
            {bookingStats.map((item) => (
              <div key={item.label} className="text-center p-4 bg-slate-700/50 rounded-xl">
                <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-slate-400 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Verifications</h2>
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Pending</p>
                  <p className="text-slate-400 text-sm">Awaiting review</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-amber-500">{stats?.pendingVerifications || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Verified</p>
                  <p className="text-slate-400 text-sm">Approved providers</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-emerald-500">{stats?.verifiedProviders || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                    <ActivityIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{activity.title}</p>
                    <p className="text-slate-400 text-sm truncate">{activity.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(activity.status)}
                    <span className="text-slate-500 text-xs">
                      {activity.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="/admin/users"
          className="flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition-colors group"
        >
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-medium">Manage Users</p>
            <p className="text-slate-400 text-sm">View all users</p>
          </div>
        </a>
        <a
          href="/admin/providers"
          className="flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition-colors group"
        >
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-medium">Verify Providers</p>
            <p className="text-slate-400 text-sm">{stats?.pendingVerifications || 0} pending</p>
          </div>
        </a>
        <a
          href="/admin/bookings"
          className="flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition-colors group"
        >
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-medium">View Bookings</p>
            <p className="text-slate-400 text-sm">All bookings</p>
          </div>
        </a>
        <a
          href="/admin/reviews"
          className="flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition-colors group"
        >
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Star className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-white font-medium">Moderate Reviews</p>
            <p className="text-slate-400 text-sm">{stats?.totalReviews || 0} reviews</p>
          </div>
        </a>
      </div>
    </div>
  );
}

