import { NextRequest, NextResponse } from 'next/server';
import { searchProviders, getAllCategories, getAllCities } from '@/lib/firestore';
import type { Provider, SearchFilter } from '@/types';

// ==================== TYPES ====================

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface SearchResult {
  providers: Provider[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    category: string | null;
    city: string | null;
    searchQuery: string | null;
    minRating: number | null;
    verified: boolean | null;
  };
  facets: {
    categories: string[];
    cities: string[];
  };
}

// ==================== SECURITY HEADERS ====================

function getSecurityHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
  };
}

// ==================== MOCK DATA ====================

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

// Categories synced with Firebase seed data
const defaultCategories = [
  'Dentist',
  'Beauty',
  'Gym',
  'Physiotherapy',
  'Yoga',
  'Nutrition',
  'Mental Health',
  'Dermatology',
  'Ayurveda',
  'Eye Care',
];

// Cities synced with Firebase seed data (Australia)
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

// ==================== FULL-TEXT SEARCH ====================

function fullTextSearch(providers: Provider[], query: string): Provider[] {
  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  
  return providers.filter((provider) => {
    const searchableText = [
      provider.businessName,
      provider.description,
      provider.bio,
      provider.location,
      provider.city,
      ...provider.categories,
    ]
      .join(' ')
      .toLowerCase();

    // All search terms must match
    return searchTerms.every((term) => searchableText.includes(term));
  });
}

// ==================== GET HANDLER ====================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<SearchResult>>> {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const searchQuery = searchParams.get('q') || searchParams.get('searchQuery');
    const minRating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : null;
    const verified = searchParams.get('verified') === 'true' ? true : searchParams.get('verified') === 'false' ? false : null;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const sortBy = searchParams.get('sortBy') || 'rating';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build search filter
    const filters: SearchFilter = {
      category: category || undefined,
      city: city || undefined,
      searchQuery: searchQuery || undefined,
      rating: minRating || undefined,
    };

    // Fetch providers
    let providers: Provider[] = [];
    let categories: string[] = [];
    let cities: string[] = [];

    try {
      [providers, categories, cities] = await Promise.all([
        searchProviders(filters),
        getAllCategories(),
        getAllCities(),
      ]);
    } catch (error) {
      console.error('Error fetching from Firestore:', error);
      // Use mock data
      providers = [...mockProviders];
      categories = defaultCategories;
      cities = defaultCities;
    }

    // If no results from Firestore, use mock data
    if (providers.length === 0) {
      providers = [...mockProviders];
      categories = categories.length > 0 ? categories : defaultCategories;
      cities = cities.length > 0 ? cities : defaultCities;
    }

    // Apply filters to mock/fetched data
    let filteredProviders = [...providers];

    // Category filter
    if (category) {
      filteredProviders = filteredProviders.filter((p) =>
        p.categories.some((c) => c.toLowerCase().includes(category.toLowerCase()))
      );
    }

    // City filter
    if (city) {
      filteredProviders = filteredProviders.filter(
        (p) => p.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Full-text search
    if (searchQuery) {
      filteredProviders = fullTextSearch(filteredProviders, searchQuery);
    }

    // Rating filter
    if (minRating !== null && !isNaN(minRating)) {
      filteredProviders = filteredProviders.filter((p) => p.rating >= minRating);
    }

    // Verified filter
    if (verified !== null) {
      filteredProviders = filteredProviders.filter((p) => p.verified === verified);
    }

    // Sort providers
    filteredProviders.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'reviewCount':
          aValue = a.reviewCount;
          bValue = b.reviewCount;
          break;
        case 'name':
          return sortOrder === 'asc'
            ? a.businessName.localeCompare(b.businessName)
            : b.businessName.localeCompare(a.businessName);
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.rating;
          bValue = b.rating;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Calculate pagination
    const total = filteredProviders.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProviders = filteredProviders.slice(startIndex, endIndex);

    return NextResponse.json(
      {
        success: true,
        message: `Found ${total} provider${total !== 1 ? 's' : ''}`,
        data: {
          providers: paginatedProviders,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
          filters: {
            category,
            city,
            searchQuery,
            minRating,
            verified,
          },
          facets: {
            categories: categories.length > 0 ? categories : defaultCategories,
            cities: cities.length > 0 ? cities : defaultCities,
          },
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Search providers error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// ==================== OPTIONS HANDLER ====================

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        ...getSecurityHeaders(),
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

