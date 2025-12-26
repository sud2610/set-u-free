'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, Filter, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { ProviderCard, ProviderCardSkeleton } from '@/components/providers/ProviderCard';
import { searchProviders, getAllCategories, getAllCities } from '@/lib/firestore';
import type { Provider, SearchFilter } from '@/types';

// ==================== CONSTANTS ====================

const ITEMS_PER_PAGE = 8;

// Default categories synced with Firebase seed data
const defaultCategories = [
  { id: 'recruitment-agencies', name: 'Recruitment Agencies', icon: '💼' },
  { id: 'migration-visa', name: 'Migration & Visa Advisers', icon: '🛂' },
  { id: 'beauty', name: 'Beauty', icon: '💅' },
  { id: 'dentist', name: 'Dentist', icon: '🦷' },
  { id: 'eye-care', name: 'Eye Care', icon: '👁️' },
  { id: 'doctors', name: 'Doctors', icon: '👨‍⚕️' },
  { id: 'mental-health', name: 'Mental Health', icon: '🧠' },
  { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
  { id: 'physiotherapy', name: 'Physiotherapy', icon: '🏥' },
  { id: 'legal-services', name: 'Legal Services', icon: '⚖️' },
];

// MVP cities - Sydney and Melbourne only
const defaultCities = [
  'Sydney',
  'Melbourne',
];


// ==================== SERVICES CONTENT COMPONENT ====================

export function ServicesContent() {
  // ==================== HOOKS ====================
  const searchParams = useSearchParams();
  const router = useRouter();

  // ==================== STATE ====================
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // ==================== URL SYNC ====================

  // Read filters from URL on mount
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const city = searchParams.get('city') || '';
    
    setSearchQuery(query);
    setSelectedCategory(category);
    setSelectedCity(city);
    setIsInitialized(true);
  }, [searchParams]);

  // Update URL when filters change (after initialization)
  const updateURL = useCallback((query: string, category: string, city: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    
    const newURL = params.toString() ? `/?${params.toString()}` : '/';
    router.replace(newURL, { scroll: false });
  }, [router]);

  // ==================== FETCH DATA ====================

  useEffect(() => {
    // Fetch categories and cities
    const fetchFilterOptions = async () => {
      try {
        const [fetchedCategories, fetchedCities] = await Promise.all([
          getAllCategories(),
          getAllCities(),
        ]);
        setCategories(fetchedCategories.length > 0 ? fetchedCategories : defaultCategories.map(c => c.name));
        setCities(fetchedCities.length > 0 ? fetchedCities : defaultCities);
      } catch (error) {
        console.error('Error fetching filter options:', error);
        setCategories(defaultCategories.map(c => c.name));
        setCities(defaultCities);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    // Don't fetch until URL params are read
    if (!isInitialized) return;

    const fetchProviders = async () => {
      setIsLoading(true);
      try {
        const filters: SearchFilter = {
          searchQuery: searchQuery || undefined,
          category: selectedCategory || undefined,
          city: selectedCity || undefined,
        };

        const results = await searchProviders(filters);
        
        // Sort results by rating (descending)
        const sortedResults = [...results].sort((a, b) => b.rating - a.rating);
        setProviders(sortedResults);
        setHasMore(sortedResults.length >= ITEMS_PER_PAGE);
      } catch (error) {
        console.error('Error fetching providers:', error);
        // No fallback - show empty results
        setProviders([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
    
    // Update URL to reflect current filters
    updateURL(searchQuery, selectedCategory, selectedCity);
  }, [searchQuery, selectedCategory, selectedCity, isInitialized, updateURL]);

  // ==================== HANDLERS ====================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCity('');
    setCurrentPage(1);
    router.replace('/', { scroll: false });
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
    // In real implementation, this would fetch more data
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedCity;

  // ==================== RENDER ====================

  return (
    <section id="services-section" className="py-8 lg:py-12 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ==================== SEARCH & FILTERS ==================== */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-yellow-400 p-4 sm:p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services or providers..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative lg:w-52">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none cursor-pointer transition-all text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* City Filter */}
            <div className="relative lg:w-44">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none cursor-pointer transition-all text-sm"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl shadow-lg shadow-yellow-500/25 transition-all"
            >
              Search
            </button>
          </form>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-yellow-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="hover:text-yellow-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {selectedCity && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  {selectedCity}
                  <button
                    onClick={() => setSelectedCity('')}
                    className="hover:text-yellow-900"
                  >
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
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isLoading
                ? 'Loading...'
                : providers.length > ITEMS_PER_PAGE 
                  ? 'Top Providers' 
                  : `${providers.length} Provider${providers.length !== 1 ? 's' : ''} Found`}
            </h2>
            {hasActiveFilters && (
              <p className="text-sm text-gray-500 mt-1">
                Showing results for your search
              </p>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* ==================== PROVIDERS GRID ==================== */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        ) : providers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {providers.slice(0, currentPage * ITEMS_PER_PAGE).map((provider, index) => (
                <ProviderCard 
                  key={provider.uid} 
                  provider={provider}
                  priority={index < 4}
                />
              ))}
            </div>

            {/* Load More */}
            {providers.length > currentPage * ITEMS_PER_PAGE && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-white border-2 border-gray-200 hover:border-yellow-400 text-gray-700 hover:text-yellow-600 font-semibold rounded-xl transition-all"
                >
                  Load More Providers
                </button>
              </div>
            )}
          </>
        ) : (
          /* No Results */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No providers found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              We couldn&apos;t find any providers matching your search criteria.
              Try adjusting your filters or search for something else.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

