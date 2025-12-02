import { ProviderCardSkeleton } from '@/components/providers/ProviderCard';

/**
 * Loading skeleton for the services page
 */
export function ServicesLoading() {
  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search & Filters Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-8 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-14 bg-gray-200 rounded-xl" />
            <div className="lg:w-48 h-14 bg-gray-200 rounded-xl" />
            <div className="lg:w-48 h-14 bg-gray-200 rounded-xl" />
            <div className="w-full lg:w-32 h-14 bg-gray-200 rounded-xl" />
          </div>
        </div>

        {/* Results Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 bg-gray-200 rounded w-48 animate-pulse" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProviderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}



