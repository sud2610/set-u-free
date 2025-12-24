'use client';

import { useEffect, useState } from 'react';
import { 
  Star, 
  Search, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  User,
  Briefcase,
  Calendar,
  Flag,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import type { Review, User as UserType, Provider } from '@/types';
import Image from 'next/image';

interface ReviewWithDetails extends Review {
  user?: UserType;
  provider?: Provider;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchQuery, ratingFilter]);

  const fetchReviews = async () => {
    if (!db) return;

    try {
      const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const reviewsData = await Promise.all(
        reviewsSnapshot.docs.map(async (reviewDoc) => {
          const data = reviewDoc.data();
          
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

          return {
            id: reviewDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            user,
            provider,
          } as ReviewWithDetails;
        })
      );

      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = [...reviews];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        review.comment?.toLowerCase().includes(query) ||
        review.user?.fullName?.toLowerCase().includes(query) ||
        review.provider?.businessName?.toLowerCase().includes(query)
      );
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(review => review.rating === ratingFilter);
    }

    setFilteredReviews(filtered);
    setCurrentPage(1);
  };

  const deleteReview = async (review: ReviewWithDetails) => {
    if (!db || !confirm(`Are you sure you want to delete this review? This action cannot be undone.`)) return;
    setActionLoading(review.id);

    try {
      await deleteDoc(doc(db, 'reviews', review.id));
      setReviews(prev => prev.filter(r => r.id !== review.id));
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);

  // Stats
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100)
      : 0
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Review Moderation</h1>
          <p className="text-slate-400 mt-1">Monitor and moderate user reviews</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Overview */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <p className="text-4xl font-bold text-white">{avgRating}</p>
              <p className="text-slate-400">Average Rating</p>
              <p className="text-slate-500 text-sm">{reviews.length} total reviews</p>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-white font-medium mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-white font-medium">{rating}</span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-slate-400 text-sm w-12 text-right">{count}</span>
              </div>
            ))}
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
              placeholder="Search by review content, user, or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {paginatedReviews.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No reviews found matching your criteria</p>
          </div>
        ) : (
          paginatedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-6 hover:border-slate-600 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* User Info */}
                <div className="flex items-center gap-3 lg:w-48 flex-shrink-0">
                  {review.user?.profileImage ? (
                    <Image
                      src={review.user.profileImage}
                      alt={review.user.fullName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{review.user?.fullName || 'Unknown User'}</p>
                    <p className="text-slate-500 text-sm">{review.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white font-medium">{review.rating}.0</span>
                  </div>

                  {/* Comment */}
                  <p className="text-slate-300">{review.comment}</p>

                  {/* Provider */}
                  <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
                    <Briefcase className="w-4 h-4" />
                    <span>Review for:</span>
                    <span className="text-white">{review.provider?.businessName || 'Unknown Provider'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 lg:flex-shrink-0">
                  <button
                    onClick={() => deleteReview(review)}
                    disabled={actionLoading === review.id}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete review"
                  >
                    {actionLoading === review.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + reviewsPerPage, filteredReviews.length)} of {filteredReviews.length} reviews
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
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
            ))}
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
  );
}

