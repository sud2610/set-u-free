'use client';

import { useEffect, useState } from 'react';
import { 
  Calendar, 
  Search, 
  Filter,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Eye,
  Trash2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import type { Booking, User as UserType, Provider, Service, BookingStatus } from '@/types';
import Image from 'next/image';

interface BookingWithDetails extends Booking {
  user?: UserType;
  provider?: Provider;
  service?: Service;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 15;

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, statusFilter]);

  const fetchBookings = async () => {
    if (!db) return;

    try {
      const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      const bookingsData = await Promise.all(
        bookingsSnapshot.docs.map(async (bookingDoc) => {
          const data = bookingDoc.data();
          
          // Get user data
          let user: UserType | undefined;
          if (data.userId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', data.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                user = {
                  uid: userDoc.id,
                  ...userData,
                  createdAt: userData.createdAt?.toDate() || new Date(),
                  updatedAt: userData.updatedAt?.toDate() || new Date(),
                } as UserType;
              }
            } catch (e) {
              console.error('Error fetching user:', e);
            }
          }

          // Get provider data
          let provider: Provider | undefined;
          if (data.providerId) {
            try {
              const providerDoc = await getDoc(doc(db, 'providers', data.providerId));
              if (providerDoc.exists()) {
                const providerData = providerDoc.data();
                provider = {
                  uid: providerDoc.id,
                  ...providerData,
                  createdAt: providerData.createdAt?.toDate() || new Date(),
                  updatedAt: providerData.updatedAt?.toDate() || new Date(),
                } as Provider;
              }
            } catch (e) {
              console.error('Error fetching provider:', e);
            }
          }

          // Get service data
          let service: Service | undefined;
          if (data.serviceId) {
            try {
              const serviceDoc = await getDoc(doc(db, 'services', data.serviceId));
              if (serviceDoc.exists()) {
                const serviceData = serviceDoc.data();
                service = {
                  id: serviceDoc.id,
                  ...serviceData,
                  createdAt: serviceData.createdAt?.toDate() || new Date(),
                } as Service;
              }
            } catch (e) {
              console.error('Error fetching service:', e);
            }
          }

          return {
            id: bookingDoc.id,
            ...data,
            dateTime: data.dateTime?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            user,
            provider,
            service,
          } as BookingWithDetails;
        })
      );

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.id.toLowerCase().includes(query) ||
        booking.user?.fullName?.toLowerCase().includes(query) ||
        booking.user?.email?.toLowerCase().includes(query) ||
        booking.provider?.businessName?.toLowerCase().includes(query) ||
        booking.service?.title?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  };

  const updateBookingStatus = async (booking: BookingWithDetails, newStatus: BookingStatus) => {
    if (!db) return;
    setActionLoading(booking.id);

    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, { status: newStatus, updatedAt: new Date() });
      
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { ...b, status: newStatus } : b
      ));

      if (selectedBooking?.id === booking.id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteBooking = async (booking: BookingWithDetails) => {
    if (!db || !confirm(`Are you sure you want to delete this booking? This action cannot be undone.`)) return;
    setActionLoading(booking.id);

    try {
      await deleteDoc(doc(db, 'bookings', booking.id));
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      setShowBookingModal(false);
    } catch (error) {
      console.error('Error deleting booking:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + bookingsPerPage);

  const getStatusConfig = (status: BookingStatus) => {
    const configs = {
      pending: { 
        icon: Clock, 
        color: 'text-amber-400', 
        bg: 'bg-amber-500/20', 
        border: 'border-amber-500/30',
        label: 'Pending'
      },
      confirmed: { 
        icon: CheckCircle, 
        color: 'text-blue-400', 
        bg: 'bg-blue-500/20', 
        border: 'border-blue-500/30',
        label: 'Confirmed'
      },
      completed: { 
        icon: CheckCircle, 
        color: 'text-emerald-400', 
        bg: 'bg-emerald-500/20', 
        border: 'border-emerald-500/30',
        label: 'Completed'
      },
      cancelled: { 
        icon: XCircle, 
        color: 'text-red-400', 
        bg: 'bg-red-500/20', 
        border: 'border-red-500/30',
        label: 'Cancelled'
      },
    };
    return configs[status] || configs.pending;
  };

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Booking Management</h1>
          <p className="text-slate-400 mt-1">View and manage all bookings</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchBookings();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-400 text-sm">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-slate-400 text-sm">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
              <p className="text-slate-400 text-sm">Confirmed</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
              <p className="text-slate-400 text-sm">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
              <p className="text-slate-400 text-sm">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by booking ID, customer, provider, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Booking ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Provider</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Service</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Date & Time</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <p>No bookings found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => {
                  const statusConfig = getStatusConfig(booking.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <tr key={booking.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-white font-mono text-sm">#{booking.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {booking.user?.profileImage ? (
                            <Image
                              src={booking.user.profileImage}
                              alt={booking.user.fullName}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-white text-sm">{booking.user?.fullName || 'Unknown'}</p>
                            <p className="text-slate-500 text-xs">{booking.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {booking.provider?.profileImage ? (
                            <Image
                              src={booking.provider.profileImage}
                              alt={booking.provider.businessName}
                              width={32}
                              height={32}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                              <Briefcase className="w-4 h-4 text-purple-400" />
                            </div>
                          )}
                          <span className="text-white text-sm">{booking.provider?.businessName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300 text-sm">{booking.service?.title || 'Unknown Service'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white text-sm">{booking.dateTime.toLocaleDateString()}</p>
                          <p className="text-slate-500 text-xs">{booking.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowBookingModal(true);
                            }}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={() => deleteBooking(booking)}
                            disabled={actionLoading === booking.id}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete booking"
                          >
                            {actionLoading === booking.id ? (
                              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-400" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {startIndex + 1} to {Math.min(startIndex + bookingsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-amber-500 text-slate-900'
                        : 'hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Booking Details</h2>
                  <p className="text-slate-400 mt-1">#{selectedBooking.id}</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[]).map((status) => {
                    const config = getStatusConfig(status);
                    const isActive = selectedBooking.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => updateBookingStatus(selectedBooking, status)}
                        disabled={actionLoading === selectedBooking.id || isActive}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                          isActive
                            ? `${config.bg} ${config.color} border-2 ${config.border}`
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600 border-2 border-transparent'
                        }`}
                      >
                        {actionLoading === selectedBooking.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <config.icon className="w-4 h-4" />
                        )}
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">Customer</h3>
                <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl">
                  {selectedBooking.user?.profileImage ? (
                    <Image
                      src={selectedBooking.user.profileImage}
                      alt={selectedBooking.user.fullName}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{selectedBooking.user?.fullName || 'Unknown'}</p>
                    <p className="text-slate-400 text-sm">{selectedBooking.user?.email}</p>
                    {selectedBooking.user?.phone && (
                      <p className="text-slate-400 text-sm">{selectedBooking.user.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Provider Info */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">Provider</h3>
                <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl">
                  {selectedBooking.provider?.profileImage ? (
                    <Image
                      src={selectedBooking.provider.profileImage}
                      alt={selectedBooking.provider.businessName}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-purple-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{selectedBooking.provider?.businessName || 'Unknown'}</p>
                    <p className="text-slate-400 text-sm">{selectedBooking.provider?.city}, {selectedBooking.provider?.location}</p>
                  </div>
                </div>
              </div>

              {/* Service & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Service</h3>
                  <div className="p-4 bg-slate-700/50 rounded-xl">
                    <p className="text-white font-medium">{selectedBooking.service?.title || 'Unknown'}</p>
                    <p className="text-slate-400 text-sm">{selectedBooking.service?.duration} minutes</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Date & Time</h3>
                  <div className="p-4 bg-slate-700/50 rounded-xl">
                    <p className="text-white font-medium">{selectedBooking.dateTime.toLocaleDateString()}</p>
                    <p className="text-slate-400 text-sm">{selectedBooking.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Notes</h3>
                  <div className="p-4 bg-slate-700/50 rounded-xl">
                    <p className="text-slate-300">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>Created: {selectedBooking.createdAt.toLocaleString()}</span>
                <span>•</span>
                <span>Updated: {selectedBooking.updatedAt.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => deleteBooking(selectedBooking)}
                disabled={actionLoading === selectedBooking.id}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

