'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Mock data for demonstration
const mockBookings = [
  {
    id: '1',
    serviceName: 'Home Cleaning',
    customerName: 'Rahul Sharma',
    customerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    date: '2024-01-25',
    time: '10:00 AM',
    status: 'pending',
    amount: 1500,
  },
  {
    id: '2',
    serviceName: 'AC Repair',
    customerName: 'Priya Patel',
    customerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    date: '2024-01-26',
    time: '02:00 PM',
    status: 'confirmed',
    amount: 800,
  },
  {
    id: '3',
    serviceName: 'Plumbing Work',
    customerName: 'Amit Kumar',
    customerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    date: '2024-01-27',
    time: '11:00 AM',
    status: 'confirmed',
    amount: 600,
  },
];

const mockReviews = [
  {
    id: '1',
    customerName: 'Rahul Sharma',
    rating: 5,
    comment: 'Excellent service! Very professional.',
    date: '2024-01-20',
  },
  {
    id: '2',
    customerName: 'Priya Patel',
    rating: 4,
    comment: 'Good work, arrived on time.',
    date: '2024-01-18',
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

export function ProviderDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Total Earnings',
      value: '₹45,250',
      change: '+12%',
      icon: DollarSign,
      color: 'text-secondary-500',
      bgColor: 'bg-secondary-50',
    },
    {
      label: 'Total Bookings',
      value: '156',
      change: '+8%',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Average Rating',
      value: '4.8',
      change: '+0.2',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Total Customers',
      value: '89',
      change: '+15%',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl p-6 md:p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {user?.displayName?.split(' ')[0] || 'Provider'}! 👋
        </h1>
        <p className="text-secondary-100">
          Here&apos;s an overview of your business performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-secondary-500">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-dark-900">{stat.value}</div>
              <div className="text-sm text-dark-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between p-6 border-b border-dark-100">
              <h2 className="text-lg font-semibold text-dark-900">Upcoming Bookings</h2>
              <Link
                href="/dashboard/provider/bookings"
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
                          src={booking.customerImage}
                          alt={booking.customerName}
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
                          {booking.customerName}
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
                      <button className="p-2 rounded-lg hover:bg-dark-100 transition-colors">
                        <MoreVertical className="w-5 h-5 text-dark-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Reviews */}
          <div className="card">
            <div className="flex items-center justify-between p-6 border-b border-dark-100">
              <h2 className="text-lg font-semibold text-dark-900">Recent Reviews</h2>
              <Link
                href="/dashboard/provider/reviews"
                className="text-primary-500 text-sm font-medium hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="p-4 space-y-4">
              {mockReviews.map((review) => (
                <div key={review.id} className="p-3 bg-dark-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-dark-900 text-sm">
                      {review.customerName}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-dark-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-dark-600 line-clamp-2">{review.comment}</p>
                  <p className="text-xs text-dark-400 mt-2">
                    {new Date(review.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-dark-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/provider/services"
                className="flex items-center justify-between p-3 bg-primary-50 rounded-xl text-primary-600 hover:bg-primary-100 transition-colors"
              >
                <span className="font-medium">Manage Services</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/provider/settings"
                className="flex items-center justify-between p-3 bg-dark-50 rounded-xl text-dark-600 hover:bg-dark-100 transition-colors"
              >
                <span className="font-medium">Update Profile</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/provider/earnings"
                className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl text-secondary-600 hover:bg-secondary-100 transition-colors"
              >
                <span className="font-medium">View Earnings</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

