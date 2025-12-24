'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, X, Star } from 'lucide-react';
import { ProviderCard, ProviderCardSkeleton } from '@/components/providers/ProviderCard';
import { getProvidersByCategory, getAllCities } from '@/lib/firestore';
import type { Provider } from '@/types';

// ==================== TYPES ====================

interface CategoryServicesContentProps {
  categoryId: string;
  categoryName: string;
}

// ==================== CONSTANTS ====================

const defaultCities = [
  'Sydney',
  'Melbourne',
  'Brisbane',
  'Perth',
  'Adelaide',
  'Gold Coast',
  'Canberra',
  'Newcastle',
  'Hobart',
  'Darwin',
];

const ratingOptions = [
  { value: '', label: 'All Ratings' },
  { value: '4', label: '4+ Stars' },
  { value: '4.5', label: '4.5+ Stars' },
];


// ==================== CATEGORY SERVICES CONTENT ====================

export function CategoryServicesContent({
  categoryId,
  categoryName,
}: CategoryServicesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ==================== STATE ====================
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [cities, setCities] = useState<string[]>(defaultCities);

  // ==================== FETCH DATA ====================

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const fetchedCities = await getAllCities();
        if (fetchedCities.length > 0) {
          setCities(fetchedCities);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching providers for category: "${categoryName}"`);
        const results = await getProvidersByCategory(categoryName);
        console.log(`Got ${results.length} providers from Firestore`);

        // Apply client-side filters to Firestore results
        let filtered = results;

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              (p.businessName || '').toLowerCase().includes(query) ||
              (p.description || '').toLowerCase().includes(query)
          );
        }

        if (selectedCity) {
          filtered = filtered.filter(
            (p) => (p.city || '').toLowerCase() === selectedCity.toLowerCase()
          );
        }

        if (minRating) {
          filtered = filtered.filter((p) => p.rating >= parseFloat(minRating));
        }

        // Sort by rating (descending)
        filtered.sort((a, b) => b.rating - a.rating);

        setProviders(filtered);
      } catch (error: any) {
        console.error('Error fetching providers:', error);
        // Check if it's an index error
        if (error?.message?.includes('index')) {
          console.error('⚠️ FIRESTORE INDEX REQUIRED - Click the link in the error above to create it');
        }
        setProviders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [categoryName, searchQuery, selectedCity, minRating]);

  // ==================== URL SYNC ====================

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCity) params.set('city', selectedCity);
    if (minRating) params.set('rating', minRating);

    const queryString = params.toString();
    const newUrl = queryString
      ? `/services/${categoryId}?${queryString}`
      : `/services/${categoryId}`;
    router.replace(newUrl, { scroll: false });
  }, [categoryId, searchQuery, selectedCity, minRating, router]);

  // ==================== HANDLERS ====================

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setMinRating('');
  };

  const hasActiveFilters = searchQuery || selectedCity || minRating;

  // ==================== RENDER ====================

  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ==================== FILTERS ==================== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${categoryName} providers...`}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>

            {/* City Filter */}
            <div className="relative lg:w-48">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none cursor-pointer transition-all"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Rating Filter */}
            <div className="relative lg:w-40">
              <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none cursor-pointer transition-all"
              >
                {ratingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')} className="hover:text-yellow-900">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {selectedCity && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                  {selectedCity}
                  <button onClick={() => setSelectedCity('')} className="hover:text-yellow-900">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {minRating && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                  {minRating}+ Stars
                  <button onClick={() => setMinRating('')} className="hover:text-yellow-900">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ==================== RESULTS HEADER ==================== */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isLoading
              ? 'Loading...'
              : `${providers.length} ${categoryName} Provider${providers.length !== 1 ? 's' : ''}`}
          </h2>
        </div>

        {/* ==================== PROVIDERS GRID ==================== */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        ) : providers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {providers.map((provider) => (
              <ProviderCard key={provider.uid} provider={provider} />
            ))}
          </div>
        ) : (
          /* No Results */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No {categoryName} providers found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              We couldn&apos;t find any providers matching your criteria in this category.
              Try adjusting your filters or check back later.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}






