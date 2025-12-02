'use client';

import Image from 'next/image';
import { Star, MapPin, Shield, Clock, Calendar, Check } from 'lucide-react';
import type { Provider, Review } from '@/types';

interface ProviderProfileProps {
  provider: Provider;
  reviews?: Review[];
}

export function ProviderProfile({ provider, reviews = [] }: ProviderProfileProps) {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Image */}
          <div className="relative w-32 h-32 shrink-0">
            <Image
              src={provider.profileImage || '/placeholder-avatar.png'}
              alt={provider.businessName}
              fill
              className="object-cover rounded-2xl"
            />
            {provider.verified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center border-2 border-white">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-dark-900">
                  {provider.businessName}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{provider.rating}</span>
                    <span className="text-dark-500">
                      ({provider.totalReviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-dark-500">
                    <MapPin className="w-4 h-4" />
                    <span>{provider.location.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {provider.verified && (
                <span className="badge-secondary">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified Provider
                </span>
              )}
              {provider.featured && (
                <span className="badge-primary">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </span>
              )}
              <span className="badge bg-dark-100 text-dark-600">
                <Calendar className="w-3 h-3 mr-1" />
                {provider.totalBookings}+ bookings
              </span>
            </div>

            {/* Specializations */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {provider.subcategories.map((sub) => (
                  <span
                    key={sub}
                    className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-dark-900 mb-4">About</h2>
        <p className="text-dark-600 whitespace-pre-line">{provider.description}</p>
      </div>

      {/* Services */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-dark-900 mb-4">
          Services ({provider.services.length})
        </h2>
        <div className="space-y-4">
          {provider.services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 bg-dark-50 rounded-xl"
            >
              <div>
                <h3 className="font-medium text-dark-900">{service.name}</h3>
                <p className="text-sm text-dark-500 mt-1">{service.description}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-dark-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration} mins
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-dark-900">
                  ₹{service.price}
                  {service.priceType !== 'fixed' && (
                    <span className="text-sm font-normal text-dark-500">
                      {service.priceType === 'hourly' ? '/hr' : '+'}
                    </span>
                  )}
                </div>
                <button className="btn-primary text-sm py-2 px-4 mt-2">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark-900">
            Reviews ({reviews.length})
          </h2>
        </div>

        {/* Rating Summary */}
        <div className="flex items-center gap-6 p-4 bg-dark-50 rounded-xl mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-dark-900">{provider.rating}</div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(provider.rating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-dark-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-dark-500 mt-1">
              {provider.totalReviews} reviews
            </div>
          </div>
        </div>

        {/* Review List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-dark-100 pb-6 last:border-0"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">U</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-dark-900">Customer</h4>
                    <span className="text-sm text-dark-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-dark-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-dark-600 mt-2">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Working Hours */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-dark-900 mb-4">Working Hours</h2>
        <div className="space-y-3">
          {provider.availability.days.map((day) => (
            <div key={day.day} className="flex items-center justify-between">
              <span className="capitalize text-dark-600">{day.day}</span>
              <span
                className={
                  day.isAvailable ? 'text-dark-900 font-medium' : 'text-dark-400'
                }
              >
                {day.isAvailable
                  ? `${day.slots[0]?.start} - ${day.slots[0]?.end}`
                  : 'Closed'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-dark-900 mb-4">Location</h2>
        <p className="text-dark-600">
          {provider.location.address}
          <br />
          {provider.location.city}, {provider.location.state}
          <br />
          {provider.location.pincode}
        </p>
      </div>
    </div>
  );
}



