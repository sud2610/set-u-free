'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Star,
  Search,
  Bell,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getBookings, cancelBooking, updateBookingStatus } from '@/lib/firestore';
import type { Booking } from '@/types';

// ==================== TYPES ====================

interface ExtendedBooking extends Booking {
  providerName?: string;
  serviceName?: string;
  providerImage?: string;
}

// ==================== MOCK DATA ====================

const mockBookings: ExtendedBooking[] = [
  {
    id: 'b1',
    userId: 'u1',
    providerId: '1',
    serviceId: 's1',
    status: 'confirmed',
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    notes: 'First time visit for dental checkup',
    createdAt: new Date(),
    updatedAt: new Date(),
    providerName: 'Smile Dental Clinic',
    serviceName: 'Dental Consultation',
    providerImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400',
  },
  {
    id: 'b2',
    userId: 'u1',
    providerId: '2',
    serviceId: 's2',
    status: 'pending',
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    createdAt: new Date(),
    updatedAt: new Date(),
    providerName: 'Glamour Beauty Studio',
    serviceName: 'Hair Styling',
    providerImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
  },
  {
    id: 'b3',
    userId: 'u1',
    providerId: '3',
    serviceId: 's3',
    status: 'completed',
    dateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    createdAt: new Date(),
    updatedAt: new Date(),
    providerName: 'FitLife Gym & Training',
    serviceName: 'Personal Training Session',
    providerImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  },
  {
    id: 'b4',
    userId: 'u1',
    providerId: '4',
    serviceId: 's4',
    status: 'cancelled',
    dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    createdAt: new Date(),
    updatedAt: new Date(),
    providerName: 'Serenity Yoga Center',
    serviceName: 'Yoga Class',
    providerImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
  },
];

// ==================== STATUS CONFIG ====================

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-700',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
};

// ==================== USER DASHBOARD PAGE ====================

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);

  // ==================== FETCH BOOKINGS ====================

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) return;
      
      setIsLoading(true);
      try {
        const data = await getBookings(user.uid);
        if (data.length > 0) {
          // In production, join with provider/service data
          setBookings(data as ExtendedBooking[]);
        } else {
          setBookings(mockBookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings(mockBookings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user?.uid]);

  // ==================== HANDLERS ====================

  const handleCancelClick = (booking: ExtendedBooking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    setCancellingId(selectedBooking.id);
    try {
      await cancelBooking(selectedBooking.id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id ? { ...b, status: 'cancelled' as const } : b
        )
      );
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
      setShowCancelModal(false);
      setSelectedBooking(null);
    }
  };

  // ==================== DERIVED DATA ====================

  const upcomingBookings = bookings.filter(
    (b) =>
      (b.status === 'confirmed' || b.status === 'pending') &&
      new Date(b.dateTime) > new Date()
  );

  const pastBookings = bookings.filter(
    (b) =>
      b.status === 'completed' ||
      b.status === 'cancelled' ||
      new Date(b.dateTime) <= new Date()
  );

  // ==================== RENDER ====================

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Welcome back, {user?.fullName?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="mt-2 text-orange-100">
              Manage your bookings and explore new services.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors"
          >
            <Search className="w-5 h-5" />
            Find Services
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-orange-400/30">
          <div className="text-center">
            <div className="text-2xl lg:text-3xl font-bold">{upcomingBookings.length}</div>
            <div className="text-sm text-orange-100">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl lg:text-3xl font-bold">
              {bookings.filter((b) => b.status === 'completed').length}
            </div>
            <div className="text-sm text-orange-100">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl lg:text-3xl font-bold">
              {bookings.length}
            </div>
            <div className="text-sm text-orange-100">Total Bookings</div>
          </div>
        </div>
      </section>

      {/* Upcoming Bookings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
          <Link
            href="/dashboard/user/bookings"
            className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        ) : upcomingBookings.length > 0 ? (
          <div className="grid gap-4">
            {upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={() => handleCancelClick(booking)}
                isCancelling={cancellingId === booking.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No upcoming bookings"
            description="You don't have any scheduled appointments. Browse services to book your next consultation."
            actionLabel="Find Services"
            actionHref="/services"
          />
        )}
      </section>

      {/* Past Bookings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Past Bookings</h2>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        ) : pastBookings.length > 0 ? (
          <div className="grid gap-4">
            {pastBookings.slice(0, 3).map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isPast
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
            No past bookings yet.
          </div>
        )}
      </section>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Cancel Booking?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to cancel your appointment with{' '}
              <strong>{selectedBooking.providerName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={!!cancellingId}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancellingId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== BOOKING CARD COMPONENT ====================

interface BookingCardProps {
  booking: ExtendedBooking;
  onCancel?: () => void;
  isCancelling?: boolean;
  isPast?: boolean;
}

function BookingCard({ booking, onCancel, isCancelling, isPast }: BookingCardProps) {
  const status = statusConfig[booking.status];
  const StatusIcon = status.icon;
  const dateTime = new Date(booking.dateTime);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Provider Image */}
        <div className="w-full sm:w-20 h-32 sm:h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          {booking.providerImage ? (
            <img
              src={booking.providerImage}
              alt={booking.providerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {booking.providerName?.charAt(0) || 'P'}
              </span>
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">
                {booking.providerName || 'Provider'}
              </h3>
              <p className="text-sm text-gray-500">{booking.serviceName || 'Service'}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
            >
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </span>
          </div>

          {/* Date & Time */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {dateTime.toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                {dateTime.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Link
              href={`/providers/${booking.providerId}`}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              View Provider
            </Link>
            {!isPast && booking.status !== 'cancelled' && (
              <>
                <span className="text-gray-300">|</span>
                <button
                  onClick={onCancel}
                  disabled={isCancelling}
                  className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </>
            )}
            {isPast && booking.status === 'completed' && (
              <>
                <span className="text-gray-300">|</span>
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Leave Review
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== BOOKING CARD SKELETON ====================

function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-20 h-32 sm:h-20 bg-gray-200 rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== EMPTY STATE ====================

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-orange-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      <Link
        href={actionHref}
        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
      >
        <Search className="w-5 h-5" />
        {actionLabel}
      </Link>
    </div>
  );
}
