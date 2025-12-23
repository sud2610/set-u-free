'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Eye,
  Star,
  DollarSign,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();

  // Redirect customers
  if (user?.role !== 'provider') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">This page is only available for service providers.</p>
        <Link href="/dashboard" className="text-yellow-600 hover:text-yellow-700 mt-2 inline-block">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Mock analytics data
  const stats = [
    {
      label: 'Profile Views',
      value: '2,456',
      change: '+23%',
      trend: 'up',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Bookings',
      value: '156',
      change: '+12%',
      trend: 'up',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'New Customers',
      value: '48',
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Average Rating',
      value: '4.8',
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  const monthlyBookings = [
    { month: 'Jul', bookings: 12 },
    { month: 'Aug', bookings: 18 },
    { month: 'Sep', bookings: 15 },
    { month: 'Oct', bookings: 22 },
    { month: 'Nov', bookings: 28 },
    { month: 'Dec', bookings: 35 },
  ];

  const topServices = [
    { name: 'Dental Checkup', bookings: 45, revenue: 6750 },
    { name: 'Teeth Whitening', bookings: 23, revenue: 8050 },
    { name: 'Root Canal', bookings: 12, revenue: 9600 },
    { name: 'Dental Cleaning', bookings: 38, revenue: 3800 },
  ];

  const maxBookings = Math.max(...monthlyBookings.map((m) => m.bookings));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your business performance and growth</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bookings Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Bookings</h2>
            <span className="text-sm text-gray-500">Last 6 months</span>
          </div>
          <div className="flex items-end gap-3 h-48">
            {monthlyBookings.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  <span className="text-sm font-medium text-gray-900 mb-1">
                    {month.bookings}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg transition-all hover:from-yellow-500 hover:to-yellow-400"
                    style={{
                      height: `${(month.bookings / maxBookings) * 140}px`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">{month.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Top Services</h2>
            <Link
              href="/dashboard/services"
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {topServices.map((service, index) => (
              <div
                key={service.name}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
              >
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center font-bold text-yellow-700">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-500">{service.bookings} bookings</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${service.revenue}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <BarChart3 className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Performance Insights</h3>
            <p className="mt-1 text-gray-600">
              Your bookings increased by <span className="font-bold text-green-600">25%</span> compared to last month. 
              Keep up the great work! Consider adding more availability slots to accommodate the growing demand.
            </p>
            <div className="flex gap-4 mt-4">
              <Link
                href="/dashboard/settings"
                className="text-yellow-700 hover:text-yellow-800 font-medium text-sm flex items-center gap-1"
              >
                Update Availability
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/services"
                className="text-yellow-700 hover:text-yellow-800 font-medium text-sm flex items-center gap-1"
              >
                Manage Services
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

