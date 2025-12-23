'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Filter,
  Search,
  TrendingUp,
} from 'lucide-react';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [filterRating, setFilterRating] = useState<number | null>(null);

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

  // Mock reviews data
  const reviewStats = {
    average: 4.8,
    total: 156,
    breakdown: {
      5: 120,
      4: 25,
      3: 8,
      2: 2,
      1: 1,
    },
  };

  const reviews = [
    {
      id: 1,
      customer: 'John Smith',
      rating: 5,
      comment: 'Excellent service! The staff was very professional and friendly. I highly recommend this clinic to anyone looking for quality dental care.',
      date: '2024-12-20',
      service: 'Dental Checkup',
      replied: true,
    },
    {
      id: 2,
      customer: 'Maria Lopez',
      rating: 4,
      comment: 'Great experience overall. The waiting time was a bit longer than expected, but the service quality made up for it.',
      date: '2024-12-18',
      service: 'Teeth Whitening',
      replied: false,
    },
    {
      id: 3,
      customer: 'David Brown',
      rating: 5,
      comment: 'Best dental clinic I have ever visited. Clean facilities and caring staff.',
      date: '2024-12-15',
      service: 'Root Canal',
      replied: true,
    },
    {
      id: 4,
      customer: 'Sarah Wilson',
      rating: 3,
      comment: 'Service was okay. Could improve on communication regarding appointment times.',
      date: '2024-12-12',
      service: 'Dental Checkup',
      replied: false,
    },
  ];

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
        <p className="text-gray-500 mt-1">See what your customers are saying about your services</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Average Rating */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">{reviewStats.average}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(reviewStats.average)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-500">{reviewStats.total} reviews</p>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviewStats.breakdown[rating as keyof typeof reviewStats.breakdown];
              const percentage = Math.round((count / reviewStats.total) * 100);
              return (
                <button
                  key={rating}
                  onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    filterRating === rating ? 'bg-yellow-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-gray-900">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Info */}
      {filterRating && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Showing {filterRating}-star reviews</span>
          <button
            onClick={() => setFilterRating(null)}
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-gray-900">
                    {review.customer.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{review.customer}</h3>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span>{review.service}</span>
                    <span>•</span>
                    <span>
                      {new Date(review.date).toLocaleDateString('en-AU', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="mt-3 text-gray-600">{review.comment}</p>
                  {review.replied && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-2 border-yellow-400">
                      <p className="text-sm text-gray-500 font-medium">Your reply:</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Thank you for your feedback! We appreciate your kind words.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {!review.replied && (
                <button className="px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium text-sm rounded-lg transition-colors flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Reply
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Star className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-500">
            {filterRating
              ? `No ${filterRating}-star reviews yet`
              : 'Reviews from your customers will appear here'}
          </p>
        </div>
      )}
    </div>
  );
}

