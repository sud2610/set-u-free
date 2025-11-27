'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Star,
  Heart,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Mock data for demonstration
const mockBookings = [
  {
    id: '1',
    serviceName: 'Home Cleaning',
    providerName: 'CleanPro Services',
    providerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    date: '2024-01-25',
    time: '10:00 AM',
    status: 'confirmed',
    amount: 1500,
  },
  {
    id: '2',
    serviceName: 'AC Repair',
    providerName: 'CoolFix Solutions',
    providerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    date: '2024-01-28',
    time: '02:00 PM',
    status: 'pending',
    amount: 800,
  },
  {
    id: '3',
    serviceName: 'Hair Styling',
    providerName: 'Glamour Studio',
    providerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    date: '2024-01-20',
    time: '11:00 AM',
    status: 'completed',
    amount: 1200,
  },
];

const mockFavorites = [
  {
    id: '1',
    name: 'QuickFix Home Solutions',
    category: 'Home Services',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  },
  {
    id: '2',
    name: 'Glamour Studio',
    category: 'Beauty & Wellness',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200',
  },
];

const statusConfig = {
  pending: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    label: 'Pending',
  },
  confirmed: {
    icon: CheckCircle,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    label: 'Confirmed',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-secondary-500',
    bg: 'bg-secondary-50',
    label: 'Completed',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    label: 'Cancelled',
  },
};

export function UserDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Bookings', value: 12, icon: Calendar, color: 'text-blue-500' },
    { label: 'Completed', value: 8, icon: CheckCircle, color: 'text-secondary-500' },
    { label: 'Favorites', value: mockFavorites.length, icon: Heart, color: 'text-red-500' },
    { label: 'Reviews Given', value: 5, icon: Star, color: 'text-yellow-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {user?.displayName?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-primary-100">
          Here&apos;s what&apos;s happening with your bookings today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-dark-900">{stat.value}</div>
              <div className="text-sm text-dark-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between p-6 border-b border-dark-100">
              <h2 className="text-lg font-semibold text-dark-900">Recent Bookings</h2>
              <Link
                href="/dashboard/user/bookings"
                className="text-primary-500 text-sm font-medium hover:underline flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-dark-100">
              {mockBookings.map((booking) => {
                const status = statusConfig[booking.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                return (
                  <div
                    key={booking.id}
                    className="p-4 hover:bg-dark-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-dark-100 shrink-0">
                        <Image
                          src={booking.providerImage}
                          alt={booking.providerName}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-dark-900 truncate">
                          {booking.serviceName}
                        </h3>
                        <p className="text-sm text-dark-500 truncate">
                          {booking.providerName}
                        </p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-1 text-sm text-dark-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-dark-400">
                          <Clock className="w-4 h-4" />
                          {booking.time}
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Favorites */}
          <div className="card">
            <div className="flex items-center justify-between p-6 border-b border-dark-100">
              <h2 className="text-lg font-semibold text-dark-900">Favorites</h2>
              <Link
                href="/dashboard/user/favorites"
                className="text-primary-500 text-sm font-medium hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="p-4 space-y-4">
              {mockFavorites.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/providers/${provider.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-dark-100">
                    <Image
                      src={provider.image}
                      alt={provider.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-dark-900 truncate text-sm">
                      {provider.name}
                    </h3>
                    <p className="text-xs text-dark-500">{provider.category}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{provider.rating}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/"
                className="flex items-center justify-between p-3 bg-primary-50 rounded-xl text-primary-600 hover:bg-primary-100 transition-colors"
              >
                <span className="font-medium">Browse Services</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/user/settings"
                className="flex items-center justify-between p-3 bg-dark-50 rounded-xl text-dark-600 hover:bg-dark-100 transition-colors"
              >
                <span className="font-medium">Update Profile</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

