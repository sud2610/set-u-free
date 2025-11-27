'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Star,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  BarChart3,
  Package,
  BadgeCheck,
  Eye,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  getProviderBookings,
  getServices,
  getProviderReviews,
  updateBookingStatus,
  deleteService,
} from '@/lib/firestore';
import type { Booking, Service, Review, Provider } from '@/types';

// ==================== TYPES ====================

interface ExtendedBooking extends Booking {
  customerName?: string;
  customerEmail?: string;
  serviceName?: string;
}

// ==================== MOCK DATA ====================

const mockBookings: ExtendedBooking[] = [
  {
    id: 'b1',
    userId: 'u1',
    providerId: 'p1',
    serviceId: 's1',
    status: 'pending',
    dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    notes: 'First time consultation',
    createdAt: new Date(),
    updatedAt: new Date(),
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul@example.com',
    serviceName: 'Dental Consultation',
  },
  {
    id: 'b2',
    userId: 'u2',
    providerId: 'p1',
    serviceId: 's2',
    status: 'confirmed',
    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    createdAt: new Date(),
    updatedAt: new Date(),
    customerName: 'Priya Patel',
    customerEmail: 'priya@example.com',
    serviceName: 'Teeth Cleaning',
  },
  {
    id: 'b3',
    userId: 'u3',
    providerId: 'p1',
    serviceId: 's1',
    status: 'pending',
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    createdAt: new Date(),
    updatedAt: new Date(),
    customerName: 'Amit Kumar',
    customerEmail: 'amit@example.com',
    serviceName: 'Dental Consultation',
  },
];

const mockServices: Service[] = [
  {
    id: 's1',
    providerId: 'p1',
    category: 'Dentist',
    title: 'Dental Consultation',
    description: 'Comprehensive dental check-up and consultation.',
    duration: 30,
    images: [],
    createdAt: new Date(),
  },
  {
    id: 's2',
    providerId: 'p1',
    category: 'Dentist',
    title: 'Teeth Cleaning',
    description: 'Professional cleaning to remove plaque and tartar.',
    duration: 45,
    images: [],
    createdAt: new Date(),
  },
  {
    id: 's3',
    providerId: 'p1',
    category: 'Dentist',
    title: 'Teeth Whitening',
    description: 'Advanced whitening treatment for brighter smile.',
    duration: 60,
    images: [],
    createdAt: new Date(),
  },
];

const mockReviews: (Review & { userName: string })[] = [
  {
    id: 'r1',
    userId: 'u1',
    providerId: 'p1',
    rating: 5,
    comment: 'Excellent service! Very professional.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    userName: 'Rahul S.',
  },
  {
    id: 'r2',
    userId: 'u2',
    providerId: 'p1',
    rating: 4,
    comment: 'Good experience, would recommend.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    userName: 'Priya P.',
  },
];

// ==================== STATUS CONFIG ====================

const bookingStatusConfig = {
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

// ==================== PROVIDER DASHBOARD PAGE ====================

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  
  // ==================== STATE ====================
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<(Review & { userName: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'reject' | 'complete' | null>(null);

  // ==================== FETCH DATA ====================

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      setIsLoading(true);
      try {
        const [bookingsData, servicesData, reviewsData] = await Promise.all([
          getProviderBookings(user.uid),
          getServices(user.uid),
          getProviderReviews(user.uid),
        ]);

        setBookings(bookingsData.length > 0 ? (bookingsData as ExtendedBooking[]) : mockBookings);
        setServices(servicesData.length > 0 ? servicesData : mockServices);
        setReviews(
          reviewsData.length > 0
            ? reviewsData.map((r) => ({ ...r, userName: 'Customer' }))
            : mockReviews
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        setBookings(mockBookings);
        setServices(mockServices);
        setReviews(mockReviews);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.uid]);

  // ==================== HANDLERS ====================

  const handleBookingAction = (booking: ExtendedBooking, action: 'confirm' | 'reject' | 'complete') => {
    setSelectedBooking(booking);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedBooking || !confirmAction) return;

    setActionLoading(selectedBooking.id);
    try {
      const newStatus = confirmAction === 'confirm' 
        ? 'confirmed' 
        : confirmAction === 'complete' 
          ? 'completed' 
          : 'cancelled';

      await updateBookingStatus(selectedBooking.id, newStatus);
      
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id ? { ...b, status: newStatus } : b
        )
      );

      const actionText = confirmAction === 'confirm' 
        ? 'confirmed' 
        : confirmAction === 'complete' 
          ? 'marked as complete' 
          : 'rejected';
      
      toast.success(`Booking ${actionText} successfully!`);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking. Please try again.');
    } finally {
      setActionLoading(null);
      setShowConfirmModal(false);
      setSelectedBooking(null);
      setConfirmAction(null);
    }
  };

  const handleDeleteService = (service: Service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedService) return;

    setActionLoading(selectedService.id);
    try {
      await deleteService(selectedService.id);
      setServices((prev) => prev.filter((s) => s.id !== selectedService.id));
      toast.success('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service. Please try again.');
    } finally {
      setActionLoading(null);
      setShowDeleteModal(false);
      setSelectedService(null);
    }
  };

  // ==================== DERIVED DATA ====================

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  // ==================== RENDER ====================

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Provider'}! 👋
            </h1>
            <p className="mt-2 text-purple-100">
              Manage your services, bookings, and grow your business.
            </p>
          </div>
          <Link
            href="/dashboard/provider/services/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={bookings.length.toString()}
          icon={Calendar}
          color="bg-blue-500"
          trend="+12%"
        />
        <StatCard
          title="Pending Requests"
          value={pendingBookings.length.toString()}
          icon={Clock}
          color="bg-yellow-500"
          highlight
        />
        <StatCard
          title="Average Rating"
          value={averageRating}
          icon={Star}
          color="bg-orange-500"
          suffix="/5"
        />
        <StatCard
          title="Services"
          value={services.length.toString()}
          icon={Package}
          color="bg-purple-500"
        />
      </section>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Bookings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Bookings */}
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Pending Requests</h2>
                  <p className="text-sm text-gray-500">
                    {pendingBookings.length} awaiting response
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/provider/appointments"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2].map((i) => (
                  <BookingCardSkeleton key={i} />
                ))}
              </div>
            ) : pendingBookings.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {pendingBookings.slice(0, 3).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onConfirm={() => handleBookingAction(booking, 'confirm')}
                    onReject={() => handleBookingAction(booking, 'reject')}
                    isLoading={actionLoading === booking.id}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-2" />
                <p>No pending requests</p>
              </div>
            )}
          </section>

          {/* Upcoming Confirmed */}
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Upcoming Appointments</h2>
                  <p className="text-sm text-gray-500">
                    {confirmedBookings.length} confirmed
                  </p>
                </div>
              </div>
            </div>

            {confirmedBookings.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {confirmedBookings.slice(0, 3).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onComplete={() => handleBookingAction(booking, 'complete')}
                    isLoading={actionLoading === booking.id}
                    showComplete
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No upcoming appointments</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Services */}
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">My Services</h2>
              <Link
                href="/dashboard/provider/services/new"
                className="text-purple-600 hover:text-purple-700"
              >
                <Plus className="w-5 h-5" />
              </Link>
            </div>

            {services.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={() => {}}
                    onDelete={() => handleDeleteService(service)}
                    isDeleting={actionLoading === service.id}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 mb-4">No services yet</p>
                <Link
                  href="/dashboard/provider/services/new"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add your first service
                </Link>
              </div>
            )}
          </section>

          {/* Reviews Summary */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Reviews</h2>
              <Link
                href="/dashboard/provider/reviews"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {/* Rating Summary */}
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{averageRating}</div>
                <div className="flex items-center gap-0.5 justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(parseFloat(averageRating))
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {reviews.length} reviews
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="space-y-4">
              {reviews.slice(0, 2).map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {review.userName}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Verification Status */}
          <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-4 lg:p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Verified Provider</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your profile is verified and visible to customers.
                </p>
                <Link
                  href="/dashboard/provider/profile"
                  className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium mt-2"
                >
                  View Profile
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Booking Action Modal */}
      {showConfirmModal && selectedBooking && confirmAction && (
        <ActionModal
          title={
            confirmAction === 'confirm'
              ? 'Confirm Booking'
              : confirmAction === 'complete'
              ? 'Complete Booking'
              : 'Reject Booking'
          }
          message={
            confirmAction === 'confirm'
              ? `Confirm appointment with ${selectedBooking.customerName}?`
              : confirmAction === 'complete'
              ? `Mark appointment with ${selectedBooking.customerName} as complete?`
              : `Reject appointment request from ${selectedBooking.customerName}?`
          }
          confirmLabel={
            confirmAction === 'confirm'
              ? 'Confirm'
              : confirmAction === 'complete'
              ? 'Mark Complete'
              : 'Reject'
          }
          confirmColor={
            confirmAction === 'reject'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }
          isLoading={!!actionLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedBooking(null);
            setConfirmAction(null);
          }}
        />
      )}

      {/* Delete Service Modal */}
      {showDeleteModal && selectedService && (
        <ActionModal
          title="Delete Service"
          message={`Are you sure you want to delete "${selectedService.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmColor="bg-red-600 hover:bg-red-700"
          isLoading={!!actionLoading}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}

// ==================== STAT CARD COMPONENT ====================

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: string;
  suffix?: string;
  highlight?: boolean;
}

function StatCard({ title, value, icon: Icon, color, trend, suffix, highlight }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 lg:p-6 ${
        highlight ? 'border-yellow-300 ring-2 ring-yellow-100' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl lg:text-3xl font-bold text-gray-900">
        {value}
        {suffix && <span className="text-lg text-gray-400">{suffix}</span>}
      </div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  );
}

// ==================== BOOKING CARD COMPONENT ====================

interface BookingCardProps {
  booking: ExtendedBooking;
  onConfirm?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  isLoading?: boolean;
  showComplete?: boolean;
}

function BookingCard({
  booking,
  onConfirm,
  onReject,
  onComplete,
  isLoading,
  showComplete,
}: BookingCardProps) {
  const status = bookingStatusConfig[booking.status];
  const StatusIcon = status.icon;
  const dateTime = new Date(booking.dateTime);

  return (
    <div className="p-4 lg:p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-white">
              {booking.customerName?.charAt(0) || 'C'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {booking.customerName || 'Customer'}
            </h4>
            <p className="text-sm text-gray-500">{booking.serviceName || 'Service'}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {dateTime.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {dateTime.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {booking.status === 'pending' && onConfirm && onReject && (
            <>
              <button
                onClick={onReject}
                disabled={isLoading}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Confirm
              </button>
            </>
          )}
          {showComplete && booking.status === 'confirmed' && onComplete && (
            <button
              onClick={onComplete}
              disabled={isLoading}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Complete
            </button>
          )}
          {!onConfirm && !onReject && !showComplete && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
            >
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== BOOKING CARD SKELETON ====================

function BookingCardSkeleton() {
  return (
    <div className="p-4 lg:p-6 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-40" />
        </div>
        <div className="h-9 bg-gray-200 rounded-lg w-24" />
      </div>
    </div>
  );
}

// ==================== SERVICE CARD COMPONENT ====================

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

function ServiceCard({ service, onEdit, onDelete, isDeleting }: ServiceCardProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{service.title}</h4>
          <p className="text-sm text-gray-500 mt-0.5">{service.category}</p>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
            <Clock className="w-4 h-4" />
            <span>{service.duration} min</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            aria-label="Edit service"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Delete service"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== ACTION MODAL COMPONENT ====================

interface ActionModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ActionModal({
  title,
  message,
  confirmLabel,
  confirmColor,
  isLoading,
  onConfirm,
  onCancel,
}: ActionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 ${confirmColor} text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
