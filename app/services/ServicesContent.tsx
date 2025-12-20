'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { ProviderCard, ProviderCardSkeleton } from '@/components/providers/ProviderCard';
import { searchProviders, getAllCategories, getAllCities } from '@/lib/firestore';
import type { Provider, SearchFilter } from '@/types';

// ==================== CONSTANTS ====================

const ITEMS_PER_PAGE = 12;

// Default categories synced with Firebase seed data
const defaultCategories = [
  { id: 'dentist', name: 'Dentist', icon: '🦷' },
  { id: 'beauty', name: 'Beauty', icon: '💅' },
  { id: 'gym', name: 'Gym', icon: '💪' },
  { id: 'physiotherapy', name: 'Physiotherapy', icon: '🏥' },
  { id: 'yoga', name: 'Yoga', icon: '🧘' },
  { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
  { id: 'mental-health', name: 'Mental Health', icon: '🧠' },
  { id: 'dermatology', name: 'Dermatology', icon: '✨' },
  { id: 'ayurveda', name: 'Ayurveda', icon: '🌿' },
  { id: 'eye-care', name: 'Eye Care', icon: '👁️' },
];

// Australian cities synced with Firebase seed data
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

// Mock providers synced with Firebase seed data (Australian cities)
const mockProviders: Provider[] = [
  {
    uid: 'provider_001',
    businessName: 'Sydney Smile Dental',
    description: 'We provide comprehensive dental services including cleanings, fillings, and cosmetic dentistry.',
    categories: ['Dentist', 'Dental Care', 'Cosmetic Dentistry'],
    location: 'Bondi Junction',
    city: 'Sydney',
    bio: 'Expert dental care with modern technology and experienced professionals.',
    profileImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400',
    rating: 4.8,
    reviewCount: 234,
    verified: true,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'provider_002',
    businessName: 'Melbourne Beauty Lounge',
    description: 'Premium beauty and spa services for all your grooming needs.',
    categories: ['Beauty', 'Spa', 'Skincare', 'Hair Salon'],
    location: 'South Yarra',
    city: 'Melbourne',
    bio: 'Transform yourself with our expert beauty treatments.',
    profileImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    rating: 4.9,
    reviewCount: 189,
    verified: true,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'provider_003',
    businessName: 'FitZone Brisbane',
    description: 'State-of-the-art fitness center with certified personal trainers.',
    categories: ['Gym', 'Personal Training', 'Fitness', 'Yoga'],
    location: 'Fortitude Valley',
    city: 'Brisbane',
    bio: 'Achieve your fitness goals with expert trainers and modern equipment.',
    profileImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    rating: 4.7,
    reviewCount: 156,
    verified: true,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'provider_004',
    businessName: 'Perth Physio & Rehab',
    description: 'Specialized physiotherapy services for pain relief and rehabilitation.',
    categories: ['Physiotherapy', 'Rehabilitation', 'Sports Medicine'],
    location: 'Subiaco',
    city: 'Perth',
    bio: 'Get back to your active lifestyle with expert physiotherapy care.',
    profileImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
    rating: 4.9,
    reviewCount: 98,
    verified: true,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'provider_005',
    businessName: 'Bondi Yoga Studio',
    description: 'Traditional and modern yoga classes for all levels.',
    categories: ['Yoga', 'Meditation', 'Wellness', 'Pranayama'],
    location: 'Bondi Beach',
    city: 'Sydney',
    bio: 'Find your inner peace with expert yoga instructors.',
    profileImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
    rating: 4.8,
    reviewCount: 267,
    verified: true,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'provider_006',
    businessName: 'Adelaide Nutrition Clinic',
    description: 'Personalized nutrition plans and dietary consultations.',
    categories: ['Nutrition', 'Diet Planning', 'Wellness', 'Weight Management'],
    location: 'North Adelaide',
    city: 'Adelaide',
    bio: 'Transform your health with certified nutritionists.',
    profileImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
    rating: 4.6,
    reviewCount: 145,
    verified: true,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'provider_007',
    businessName: 'MindWell Psychology',
    description: 'Professional mental health counseling and therapy services.',
    categories: ['Mental Health', 'Counseling', 'Therapy', 'Psychology'],
    location: 'St Kilda',
    city: 'Melbourne',
    bio: 'Your mental health matters. Get professional support.',
    profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
    rating: 4.9,
    reviewCount: 89,
    verified: true,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'provider_008',
    businessName: 'Gold Coast Skin Clinic',
    description: 'Advanced dermatology treatments for acne, pigmentation, and anti-aging.',
    categories: ['Dermatology', 'Skincare', 'Anti-Aging', 'Acne Treatment'],
    location: 'Surfers Paradise',
    city: 'Gold Coast',
    bio: 'Get glowing, healthy skin with our expert dermatologists.',
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    rating: 4.7,
    reviewCount: 178,
    verified: true,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'provider_009',
    businessName: 'Canberra Natural Therapies',
    description: 'Traditional naturopathic treatments and therapies for holistic healing.',
    categories: ['Ayurveda', 'Wellness', 'Natural Healing', 'Naturopathy'],
    location: 'Braddon',
    city: 'Canberra',
    bio: 'Experience the power of natural healing.',
    profileImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    rating: 4.8,
    reviewCount: 134,
    verified: true,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'provider_010',
    businessName: 'Newcastle Eye Centre',
    description: 'Comprehensive eye care services including exams, glasses, and LASIK.',
    categories: ['Eye Care', 'Ophthalmology', 'Optometry'],
    location: 'Newcastle CBD',
    city: 'Newcastle',
    bio: 'Clear vision for a brighter future.',
    profileImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400',
    rating: 4.6,
    reviewCount: 112,
    verified: true,
    consultationSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ==================== SERVICES CONTENT COMPONENT ====================

export function ServicesContent() {
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
    const fetchProviders = async () => {
      setIsLoading(true);
      try {
        const filters: SearchFilter = {
          searchQuery: searchQuery || undefined,
          category: selectedCategory || undefined,
          city: selectedCity || undefined,
        };

        const results = await searchProviders(filters);
        
        // If no results from Firestore, use mock data
        if (results.length === 0) {
          let filteredMock = [...mockProviders];
          
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredMock = filteredMock.filter(
              p =>
                p.businessName.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.categories.some(c => c.toLowerCase().includes(query))
            );
          }
          
          if (selectedCategory) {
            filteredMock = filteredMock.filter(p =>
              p.categories.some(c => c.toLowerCase().includes(selectedCategory.toLowerCase()))
            );
          }
          
          if (selectedCity) {
            filteredMock = filteredMock.filter(
              p => p.city.toLowerCase() === selectedCity.toLowerCase()
            );
          }
          
          // Sort by rating (descending)
          filteredMock.sort((a, b) => b.rating - a.rating);
          
          setProviders(filteredMock);
          setHasMore(false);
        } else {
          // Sort results by rating (descending)
          const sortedResults = [...results].sort((a, b) => b.rating - a.rating);
          setProviders(sortedResults);
          setHasMore(sortedResults.length >= ITEMS_PER_PAGE);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        // Fallback to mock data
        setProviders(mockProviders);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [searchQuery, selectedCategory, selectedCity]);

  // URL sync removed - content is now on home page

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
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
    // In real implementation, this would fetch more data
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedCity;

  // ==================== RENDER ====================

  return (
    <section className="py-8 lg:py-12 bg-[#faf8f5]">
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
            {[...Array(8)].map((_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        ) : providers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {providers.map((provider) => (
                <ProviderCard key={provider.uid} provider={provider} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-12 text-center">
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

