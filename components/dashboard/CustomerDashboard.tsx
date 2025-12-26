'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Calendar,
  Star,
  Clock,
  Search,
  ArrowRight,
  MapPin,
  TrendingUp,
  Heart,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export function CustomerDashboard() {
  const { user } = useAuth();

  // Mock data - In production, fetch from Firebase
  const stats = [
    {
      label: 'Total Bookings',
      value: '12',
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Completed',
      value: '8',
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Upcoming',
      value: '3',
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Favorites',
      value: '5',
      icon: Heart,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
  ];

  const recentBookings = [
    {
      id: 1,
      provider: 'Smile Dental Clinic',
      service: 'Dental Checkup',
      date: 'Dec 28, 2024',
      time: '10:00 AM',
      status: 'upcoming',
      category: 'Dentist',
    },
    {
      id: 2,
      provider: 'Global Visa Consultants',
      service: 'Visa Consultation',
      date: 'Dec 25, 2024',
      time: '2:00 PM',
      status: 'upcoming',
      category: 'Migration',
    },
    {
      id: 3,
      provider: 'Career Plus Recruitment',
      service: 'Career Consultation',
      date: 'Dec 20, 2024',
      time: '11:00 AM',
      status: 'completed',
      category: 'Recruitment',
    },
  ];

  const quickActions = [
    {
      label: 'Find a Dentist',
      href: '/?category=Dentist',
      icon: '🦷',
    },
    {
      label: 'Migration Advice',
      href: '/?category=Migration',
      icon: '🛂',
    },
    {
      label: 'Legal Services',
      href: '/?category=Legal',
      icon: '⚖️',
    },
    {
      label: 'Beauty Services',
      href: '/?category=Beauty',
      icon: '💅',
    },
  ];

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
              Ready to book your next service? Find the best providers near you.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Search className="w-5 h-5" />
            Find Services
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
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link
              href="/dashboard/bookings"
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {booking.provider}
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          {booking.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{booking.service}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.time}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'upcoming'
                          ? 'bg-yellow-100 text-yellow-700'
                          : booking.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No bookings yet</p>
                <Link
                  href="/"
                  className="mt-3 inline-block text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Book your first service →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 transition-colors group"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="flex-1 font-medium text-gray-700 group-hover:text-gray-900">
                  {action.label}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-yellow-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Pro Tip</h3>
            <p className="mt-1 text-gray-600">
              Save your favorite providers to quickly book them again. Look for the heart icon on provider profiles!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

