'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Star,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  FileText,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { createBooking } from '@/lib/firestore';
import type { Provider, Service, TimeSlot, Booking } from '@/types';

// ==================== TYPES ====================

interface BookingModalProps {
  /** Provider data */
  provider: Provider;
  /** Service being booked */
  service: Service;
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Callback after successful booking */
  onConfirm?: (booking: Booking) => void;
}

interface DaySlots {
  date: string;
  dayName: string;
  dayNumber: number;
  month: string;
  isToday: boolean;
  slots: TimeSlot[];
}

// ==================== HELPERS ====================

/**
 * Generate available time slots for next 7 days
 * In production, this would come from the provider's consultationSlots
 */
function generateTimeSlots(provider: Provider): DaySlots[] {
  const days: DaySlots[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const isToday = i === 0;

    // Check if provider has slots for this day
    const providerSlots = provider.consultationSlots?.filter(
      (slot) => slot.date === dateStr
    ) || [];

    // Generate default slots if none exist
    const slots: TimeSlot[] = providerSlots.length > 0
      ? providerSlots
      : generateDefaultSlots(dateStr, isToday);

    days.push({
      date: dateStr,
      dayName,
      dayNumber,
      month,
      isToday,
      slots,
    });
  }

  return days;
}

/**
 * Generate default time slots for a day
 */
function generateDefaultSlots(date: string, isToday: boolean): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const times = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
  ];

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  times.forEach((time) => {
    const [hour, minute] = time.split(':').map(Number);
    
    // Skip past times for today
    if (isToday) {
      if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
        return;
      }
    }

    // Randomly make some slots unavailable for demo
    const available = Math.random() > 0.3;

    slots.push({
      date,
      startTime: time,
      endTime: `${hour}:${minute + 30}`,
      available,
    });
  });

  return slots;
}

/**
 * Format time for display (24h to 12h)
 */
function formatTime(time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

// ==================== BOOKING MODAL COMPONENT ====================

/**
 * Modal for booking a service with a provider
 * Features:
 * - Provider and service details display
 * - Calendar view for date selection
 * - Time slot grid selection
 * - Notes textarea
 * - Loading and error states
 * - Toast notifications
 * - Auth check
 */
export function BookingModal({
  provider,
  service,
  isOpen,
  onClose,
  onConfirm,
}: BookingModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  // ==================== STATE ====================
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');

  // ==================== DERIVED STATE ====================
  const availableDays = useMemo(() => generateTimeSlots(provider), [provider]);

  const selectedDaySlots = useMemo(() => {
    return availableDays.find((day) => day.date === selectedDate)?.slots || [];
  }, [availableDays, selectedDate]);

  // ==================== EFFECTS ====================

  // Set default selected date to first available day
  useEffect(() => {
    if (isOpen && availableDays.length > 0 && !selectedDate) {
      setSelectedDate(availableDays[0].date);
    }
  }, [isOpen, availableDays, selectedDate]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate('');
      setSelectedSlot(null);
      setNotes('');
      setError(null);
      setStep('select');
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ==================== HANDLERS ====================

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
      setError(null);
    }
  };

  const handleContinue = () => {
    // Check authentication
    if (!user) {
      toast.error('Please sign in to book an appointment');
      router.push(`/login?redirect=/providers/${provider.uid}`);
      return;
    }

    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    setStep('confirm');
  };

  const handleBack = () => {
    setStep('select');
    setError(null);
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedSlot) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create booking datetime
      const [hours, minutes] = selectedSlot.startTime.split(':').map(Number);
      const bookingDate = new Date(selectedSlot.date);
      bookingDate.setHours(hours, minutes, 0, 0);

      // Create booking data
      const bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        providerId: provider.uid,
        serviceId: service.id,
        status: 'pending',
        dateTime: bookingDate,
        notes: notes.trim() || undefined,
      };

      // Call API to create booking
      const newBooking = await createBooking(bookingData);

      // Show success
      setStep('success');
      toast.success('Booking confirmed successfully!');

      // Callback
      if (onConfirm) {
        onConfirm(newBooking);
      }
    } catch (err) {
      console.error('Booking error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER ====================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        {/* ==================== HEADER ==================== */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step === 'confirm' && (
              <button
                onClick={handleBack}
                className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <h2 id="booking-modal-title" className="text-lg font-bold text-gray-900">
              {step === 'select' && 'Book Appointment'}
              {step === 'confirm' && 'Confirm Booking'}
              {step === 'success' && 'Booking Confirmed!'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ==================== CONTENT ==================== */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Provider & Service Info */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl mb-5">
            {/* Provider Avatar */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
              {provider.profileImage ? (
                <Image
                  src={provider.profileImage}
                  alt={provider.businessName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {provider.businessName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {provider.businessName}
                </h3>
                {provider.verified && (
                  <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" />
                )}
              </div>
              <p className="text-sm text-orange-600 font-medium mt-0.5">
                {service.title}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {provider.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {service.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {provider.city}
                </span>
              </div>
            </div>
          </div>

          {/* ==================== STEP: SELECT ==================== */}
          {step === 'select' && (
            <>
              {/* Date Selection */}
              <div className="mb-5">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Calendar className="w-4 h-4" />
                  Select Date
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                  {availableDays.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setSelectedSlot(null);
                      }}
                      className={`flex flex-col items-center p-3 min-w-[70px] rounded-xl border-2 transition-all ${
                        selectedDate === day.date
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <span className="text-xs font-medium uppercase">
                        {day.dayName}
                      </span>
                      <span className="text-xl font-bold mt-1">{day.dayNumber}</span>
                      <span className="text-xs">{day.month}</span>
                      {day.isToday && (
                        <span className="text-[10px] font-semibold text-orange-500 mt-1">
                          Today
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div className="mb-5">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Clock className="w-4 h-4" />
                  Select Time
                </h4>
                {selectedDaySlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDaySlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.available}
                        className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                          !slot.available
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selectedSlot?.startTime === slot.startTime &&
                              selectedSlot?.date === slot.date
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                            : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                        }`}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No available slots for this date</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="w-4 h-4" />
                  Notes (Optional)
                </h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements or questions..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            </>
          )}

          {/* ==================== STEP: CONFIRM ==================== */}
          {step === 'confirm' && selectedSlot && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Booking Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-900">
                      {formatTime(selectedSlot.startTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service</span>
                    <span className="font-medium text-gray-900">
                      {service.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-gray-900">
                      {service.duration} minutes
                    </span>
                  </div>
                  {notes && (
                    <div className="pt-2 mt-2 border-t border-orange-200">
                      <span className="text-gray-500 block mb-1">Notes</span>
                      <p className="text-gray-900">{notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Free Consultation</p>
                  <p className="text-sm text-green-600">
                    This consultation is 100% free. No payment required.
                  </p>
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== STEP: SUCCESS ==================== */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-gray-600 mb-6">
                Your appointment has been booked successfully. You will receive a
                confirmation email shortly.
              </p>

              {selectedSlot && (
                <div className="p-4 bg-gray-50 rounded-xl text-left mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Provider</span>
                      <span className="font-medium text-gray-900">
                        {provider.businessName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service</span>
                      <span className="font-medium text-gray-900">
                        {service.title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date & Time</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at {formatTime(selectedSlot.startTime)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl mt-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="p-5 border-t border-gray-100 bg-gray-50">
          {step === 'select' && (
            <button
              onClick={handleContinue}
              disabled={!selectedSlot}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          )}

          {step === 'confirm' && (
            <button
              onClick={handleConfirmBooking}
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          )}

          {step === 'success' && (
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard/user/bookings')}
                className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
