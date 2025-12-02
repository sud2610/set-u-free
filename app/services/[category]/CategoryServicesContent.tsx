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
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
];

const ratingOptions = [
  { value: '', label: 'All Ratings' },
  { value: '4', label: '4+ Stars' },
  { value: '4.5', label: '4.5+ Stars' },
];

// Mock providers for development (filtered by category)
const getMockProviders = (categoryName: string): Provider[] => {
  const allMock: Provider[] = [
    {
      uid: '1',
      businessName: 'Smile Dental Clinic',
      description: 'Expert dental care with modern technology.',
      categories: ['Dentist', 'Dental Care'],
      location: 'Andheri West',
      city: 'Mumbai',
      bio: 'Comprehensive dental services for the whole family.',
      profileImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400',
      rating: 4.8,
      reviewCount: 234,
      verified: true,
      consultationSlots: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      uid: '2',
      businessName: 'Perfect Smile Dental',
      description: 'Advanced dental treatments with care.',
      categories: ['Dentist', 'Orthodontics'],
      location: 'Bandra',
      city: 'Mumbai',
      bio: 'Specialized in orthodontics and cosmetic dentistry.',
      profileImage: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400',
      rating: 4.9,
      reviewCount: 178,
      verified: true,
      consultationSlots: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      uid: '3',
      businessName: 'Glamour Beauty Studio',
      description: 'Premium beauty and spa services.',
      categories: ['Beauty', 'Spa', 'Skincare'],
      location: 'Koramangala',
      city: 'Bangalore',
      bio: 'Transform yourself with our expert treatments.',
      profileImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
      rating: 4.9,
      reviewCount: 189,
      verified: true,
      consultationSlots: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      uid: '4',
      businessName: 'FitLife Gym & Training',
      description: 'State-of-the-art fitness center.',
      categories: ['Gym', 'Personal Training', 'Fitness'],
      location: 'Connaught Place',
      city: 'Delhi',
      bio: 'Achieve your fitness goals with expert trainers.',
      profileImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      rating: 4.7,
      reviewCount: 156,
      verified: true,
      consultationSlots: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      uid: '5',
      businessName: 'Serenity Yoga Center',
      description: 'Traditional and modern yoga classes.',
      categories: ['Yoga', 'Meditation', 'Wellness'],
      location: 'Bandra',
      city: 'Mumbai',
      bio: 'Find your inner peace with expert instructors.',
      profileImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
      rating: 4.8,
      reviewCount: 267,
      verified: true,
      consultationSlots: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      uid: '6',
      businessName: 'NutriWell Clinic',
      description: 'Personalized nutrition plans.',
      categories: ['Nutrition', 'Diet Planning', 'Wellness'],
      location: 'HSR Layout',
      city: 'Bangalore',
      bio: 'Transform your health with certified experts.',
      profileImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
      rating: 4.6,
      reviewCount: 145,
      verified: true,
      consultationSlots: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return allMock.filter((p) =>
    p.categories.some((c) => c.toLowerCase().includes(categoryName.toLowerCase()))
  );
};

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
        const results = await getProvidersByCategory(categoryName);

        if (results.length === 0) {
          // Use mock data as fallback
          let mockResults = getMockProviders(categoryName);

          // Apply filters
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            mockResults = mockResults.filter(
              (p) =>
                p.businessName.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
          }

          if (selectedCity) {
            mockResults = mockResults.filter(
              (p) => p.city.toLowerCase() === selectedCity.toLowerCase()
            );
          }

          if (minRating) {
            mockResults = mockResults.filter((p) => p.rating >= parseFloat(minRating));
          }

          setProviders(mockResults);
        } else {
          // Apply client-side filters to Firestore results
          let filtered = results;

          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
              (p) =>
                p.businessName.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
          }

          if (selectedCity) {
            filtered = filtered.filter(
              (p) => p.city.toLowerCase() === selectedCity.toLowerCase()
            );
          }

          if (minRating) {
            filtered = filtered.filter((p) => p.rating >= parseFloat(minRating));
          }

          setProviders(filtered);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        setProviders(getMockProviders(categoryName));
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
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* City Filter */}
            <div className="relative lg:w-48">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer transition-all"
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
                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer transition-all"
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')} className="hover:text-orange-900">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {selectedCity && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  {selectedCity}
                  <button onClick={() => setSelectedCity('')} className="hover:text-orange-900">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {minRating && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  {minRating}+ Stars
                  <button onClick={() => setMinRating('')} className="hover:text-orange-900">
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
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
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



