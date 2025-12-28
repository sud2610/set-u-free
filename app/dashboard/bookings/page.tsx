'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Filter,
  Search,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  User,
  Building2,
} from 'lucide-react';

type BookingStatus = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function BookingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<BookingStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isProvider = user?.role === 'provider';

  // TODO: Fetch real bookings from Firebase
  const customerBookings: Array<{
    id: number;
    provider: string;
    providerImage: string | null;
    service: string;
    date: string;
    time: string;
    status: string;
    location: string;
    phone: string;
    category: string;
  }> = [];

  // TODO: Fetch real provider bookings from Firebase
  const providerBookings: Array<{
    id: number;
    customer: string;
    customerEmail: string;
    service: string;
    date: string;
    time: string;
    status: string;
    notes: string;
  }> = [];

  const bookings = isProvider ? providerBookings : customerBookings;

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab !== 'all' && booking.status !== activeTab) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (isProvider) {
        return (
          (booking as typeof providerBookings[0]).customer.toLowerCase().includes(searchLower) ||
          booking.service.toLowerCase().includes(searchLower)
        );
      } else {
        return (
          (booking as typeof customerBookings[0]).provider.toLowerCase().includes(searchLower) ||
          booking.service.toLowerCase().includes(searchLower)
        );
      }
    }
    return true;
  });

  const tabs = [
    { id: 'all' as const, label: 'All Bookings' },
    { id: 'upcoming' as const, label: 'Upcoming' },
    { id: 'completed' as const, label: 'Completed' },
    { id: 'cancelled' as const, label: 'Cancelled' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isProvider ? 'Customer Bookings' : 'My Bookings'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isProvider
              ? 'Manage your customer appointments'
              : 'View and manage your service bookings'}
          </p>
        </div>
        {!isProvider && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors"
          >
            Book New Service
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={isProvider ? 'Search customers...' : 'Search providers...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Provider/Customer Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shrink-0">
                    {isProvider ? (
                      <User className="w-6 h-6 text-gray-900" />
                    ) : (
                      <Building2 className="w-6 h-6 text-gray-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {isProvider
                          ? (booking as typeof providerBookings[0]).customer
                          : (booking as typeof customerBookings[0]).provider}
                      </h3>
                      {!isProvider && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          {(booking as typeof customerBookings[0]).category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{booking.service}</p>
                    {!isProvider && (
                      <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {(booking as typeof customerBookings[0]).location}
                      </div>
                    )}
                    {isProvider && (booking as typeof providerBookings[0]).notes && (
                      <p className="text-sm text-gray-400 mt-1 italic">
                        Note: {(booking as typeof providerBookings[0]).notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-6 lg:gap-8">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(booking.date).toLocaleDateString('en-AU', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Clock className="w-4 h-4" />
                      {booking.time}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusStyles(
                      booking.status
                    )}`}
                  >
                    {getStatusIcon(booking.status)}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 lg:ml-4">
                  {!isProvider && booking.status === 'upcoming' && (
                    <>
                      <a
                        href={`tel:${(booking as typeof customerBookings[0]).phone}`}
                        className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </>
                  )}
                  {isProvider && (
                    <a
                      href={`mailto:${(booking as typeof providerBookings[0]).customerEmail}`}
                      className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  <button className="px-4 py-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium text-sm transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : activeTab !== 'all'
                ? `No ${activeTab} bookings at the moment`
                : isProvider
                ? 'You don\'t have any bookings yet'
                : 'Start exploring services and book your first appointment!'}
            </p>
            {!isProvider && !searchQuery && activeTab === 'all' && (
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors"
              >
                Find Services
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

