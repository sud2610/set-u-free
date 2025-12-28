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

// ==================== HANDLER ====================

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
      // Return empty results if Firestore fails
      providers = [];
      categories = [];
      cities = [];
    }

    // If no results from Firestore, return empty arrays
    if (providers.length === 0) {
      providers = [];
      categories = categories.length > 0 ? categories : [];
      cities = cities.length > 0 ? cities : [];
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
            categories: categories,
            cities: cities,
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

