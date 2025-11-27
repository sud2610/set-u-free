'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, MapPin, BadgeCheck, ArrowRight, Clock } from 'lucide-react';
import type { Provider } from '@/types';

// ==================== TYPES ====================

interface ProviderCardProps {
  /** Provider data object */
  provider: Provider;
  /** Optional callback when card is clicked */
  onClick?: (provider: Provider) => void;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
}

// ==================== FALLBACK AVATAR ====================

/**
 * Generates initials from business name for fallback avatar
 */
function getInitials(name: string): string {
  const words = name.split(' ');
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Generates a consistent color based on the provider's uid
 */
function getAvatarColor(uid: string): string {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
    'from-teal-400 to-teal-600',
    'from-indigo-400 to-indigo-600',
    'from-rose-400 to-rose-600',
  ];
  
  // Use uid to consistently pick a color
  const index = uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

// ==================== PROVIDER CARD COMPONENT ====================

/**
 * Provider card component for displaying provider information
 * Features:
 * - Provider profile image with fallback avatar
 * - Business name and category badges
 * - Location display
 * - Star rating and review count
 * - Verified badge
 * - View Details button
 * - Hover effects and animations
 * - Clickable to navigate to provider profile
 */
export function ProviderCard({
  provider,
  onClick,
  className = '',
  style,
}: ProviderCardProps) {
  const router = useRouter();

  // ==================== HANDLERS ====================

  const handleClick = () => {
    if (onClick) {
      onClick(provider);
    } else {
      // Navigate to provider profile page
      router.push(`/providers/${provider.uid}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // ==================== RENDER HELPERS ====================

  const renderRatingStars = () => {
    const fullStars = Math.floor(provider.rating);
    const hasHalfStar = provider.rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < fullStars
                ? 'text-yellow-400 fill-yellow-400'
                : index === fullStars && hasHalfStar
                ? 'text-yellow-400 fill-yellow-400/50'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // ==================== RENDER ====================

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group relative bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:border-orange-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${className}`}
      style={style}
      aria-label={`View ${provider.businessName} profile`}
    >
      {/* ==================== IMAGE SECTION ==================== */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {provider.profileImage ? (
          <Image
            src={provider.profileImage}
            alt={provider.businessName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          // Fallback Avatar
          <div
            className={`w-full h-full bg-gradient-to-br ${getAvatarColor(
              provider.uid
            )} flex items-center justify-center`}
          >
            <span className="text-4xl font-bold text-white/90">
              {getInitials(provider.businessName)}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Badges - Top */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* Verified Badge */}
          {provider.verified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-lg shadow-lg">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
          
          {/* Rating Badge - Mobile */}
          <div className="sm:hidden flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold text-gray-900">{provider.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Location Badge - Bottom */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg text-sm text-gray-700 shadow-lg">
            <MapPin className="w-4 h-4 text-gray-500" />
            {provider.city}
          </span>
        </div>
      </div>

      {/* ==================== CONTENT SECTION ==================== */}
      <div className="p-5">
        {/* Business Name */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
          {provider.businessName}
        </h3>

        {/* Categories */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {provider.categories.slice(0, 3).map((category, index) => (
            <span
              key={index}
              className="inline-block px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-md"
            >
              {category}
            </span>
          ))}
          {provider.categories.length > 3 && (
            <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-md">
              +{provider.categories.length - 3} more
            </span>
          )}
        </div>

        {/* Bio/Description */}
        {provider.bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {provider.bio}
          </p>
        )}

        {/* Rating & Reviews - Desktop */}
        <div className="hidden sm:flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          {renderRatingStars()}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-gray-900">
              {provider.rating.toFixed(1)}
            </span>
            <span className="text-gray-500">
              ({provider.reviewCount} {provider.reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        {/* Mobile Rating */}
        <div className="sm:hidden mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {renderRatingStars()}
              <span className="text-sm text-gray-500">
                ({provider.reviewCount})
              </span>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <button
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-semibold rounded-xl transition-all duration-200 group/btn"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          View Details
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>

      {/* ==================== HOVER OVERLAY ==================== */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </article>
  );
}

// ==================== SKELETON LOADER ====================

/**
 * Skeleton loader for ProviderCard
 * Use while data is loading
 */
export function ProviderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[4/3] bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-5">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded-lg w-3/4" />

        {/* Categories */}
        <div className="mt-3 flex gap-2">
          <div className="h-6 bg-gray-200 rounded-md w-20" />
          <div className="h-6 bg-gray-200 rounded-md w-16" />
        </div>

        {/* Description */}
        <div className="mt-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>

        {/* Rating */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </div>

        {/* Button */}
        <div className="mt-4 h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

// ==================== COMPACT VARIANT ====================

/**
 * Compact version of ProviderCard for lists and sidebars
 */
export function ProviderCardCompact({
  provider,
  onClick,
  className = '',
}: ProviderCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick(provider);
    } else {
      router.push(`/providers/${provider.uid}`);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${className}`}
      aria-label={`View ${provider.businessName} profile`}
    >
      {/* Avatar */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
        {provider.profileImage ? (
          <Image
            src={provider.profileImage}
            alt={provider.businessName}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${getAvatarColor(
              provider.uid
            )} flex items-center justify-center`}
          >
            <span className="text-lg font-bold text-white">
              {getInitials(provider.businessName)}
            </span>
          </div>
        )}
        {provider.verified && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
            <BadgeCheck className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
          {provider.businessName}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          {provider.categories.slice(0, 2).join(', ')}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-gray-900">
              {provider.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-gray-500">{provider.city}</span>
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors shrink-0" />
    </article>
  );
}

export default ProviderCard;
