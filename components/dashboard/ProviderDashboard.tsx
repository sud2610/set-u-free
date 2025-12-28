'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Calendar,
  Star,
  Clock,
  Users,
  ArrowRight,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  BarChart3,
} from 'lucide-react';

export function ProviderDashboard() {
  const { user } = useAuth();

  // Stats configuration - values will come from real data
  const stats = [
    {
      label: 'Total Bookings',
      value: '0',
      change: '',
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'This Month',
      value: '0',
      change: '',
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Profile Views',
      value: '0',
      change: '',
      icon: Eye,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Avg. Rating',
      value: '-',
      change: '',
      icon: Star,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
  ];

  // Empty arrays - data comes from Firebase
  const upcomingBookings: Array<{
    id: number;
    customer: string;
    service: string;
    date: string;
    time: string;
    status: string;
  }> = [];

  const recentReviews: Array<{
    id: number;
    customer: string;
    rating: number;
    comment: string;
    date: string;
  }> = [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 rounded-2xl p-6 md:p-8 text-gray-900">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user?.fullName?.split(' ')[0]}! 👋
            </h1>
            <p className="mt-2 text-gray-800 opacity-90">
              Manage your bookings and grow your business. Let&apos;s make it a great day!
            </p>
          </div>
          <Link
            href="/dashboard/bookings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            View All Bookings
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              {stat.change && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h2>
            <Link
              href="/dashboard/bookings"
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {upcomingBookings.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                        <span className="font-semibold text-gray-900">
                          {booking.customer.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.customer}</h3>
                        <p className="text-sm text-gray-500">{booking.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{booking.date}</p>
                      <p className="text-sm text-gray-500">{booking.time}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming bookings yet</p>
              <p className="text-sm text-gray-400 mt-1">Your bookings will appear here</p>
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
            <Link
              href="/dashboard/reviews"
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentReviews.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentReviews.map((review) => (
                <div key={review.id} className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{review.customer}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">{review.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No reviews yet</p>
              <p className="text-sm text-gray-400 mt-1">Reviews from customers will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-sm text-gray-500">Completion Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">New Messages</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Total Customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Boost Your Profile</h3>
            <p className="mt-1 text-gray-600">
              Complete your profile to get 40% more visibility. Add photos, update your services, and respond to reviews promptly!
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Update Profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
