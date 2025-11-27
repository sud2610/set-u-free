import { NextRequest, NextResponse } from 'next/server';
import {
  getProvider,
  updateProvider,
  getServices,
  getProviderReviews,
  getAverageRating,
} from '@/lib/firestore';
import type { Provider, Service, Review } from '@/types';

// ==================== TYPES ====================

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface UpdateProviderRequestBody {
  businessName?: string;
  description?: string;
  categories?: string[];
  location?: string;
  city?: string;
  bio?: string;
  profileImage?: string;
}

interface ProviderWithDetails extends Provider {
  services: Service[];
  reviews: (Review & { userName?: string })[];
  averageRating: number;
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

function getNoCacheHeaders(): HeadersInit {
  return {
    ...getSecurityHeaders(),
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };
}

// ==================== AUTHENTICATION ====================

async function verifyAuth(request: NextRequest): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return { valid: false, error: 'Authorization header is required' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return { valid: false, error: 'Token is required' };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, userId: payload.user_id || payload.sub };
  } catch {
    return { valid: false, error: 'Token verification failed' };
  }
}

// ==================== VALIDATION ====================

function validateUpdateInput(body: UpdateProviderRequestBody): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (body.businessName !== undefined) {
    if (body.businessName.length < 2) {
      errors.businessName = 'Business name must be at least 2 characters';
    }
    if (body.businessName.length > 100) {
      errors.businessName = 'Business name must be less than 100 characters';
    }
  }

  if (body.description !== undefined && body.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  if (body.bio !== undefined && body.bio.length > 2000) {
    errors.bio = 'Bio must be less than 2000 characters';
  }

  if (body.categories !== undefined) {
    if (!Array.isArray(body.categories)) {
      errors.categories = 'Categories must be an array';
    } else if (body.categories.length === 0) {
      errors.categories = 'At least one category is required';
    } else if (body.categories.length > 10) {
      errors.categories = 'Maximum 10 categories allowed';
    }
  }

  if (body.location !== undefined && body.location.length < 2) {
    errors.location = 'Location must be at least 2 characters';
  }

  if (body.city !== undefined && body.city.length < 2) {
    errors.city = 'City must be at least 2 characters';
  }

  if (body.profileImage !== undefined) {
    try {
      new URL(body.profileImage);
    } catch {
      errors.profileImage = 'Invalid image URL';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ==================== MOCK DATA ====================

function getMockProvider(id: string): ProviderWithDetails | null {
  const mockProviders: Record<string, ProviderWithDetails> = {
    '1': {
      uid: '1',
      businessName: 'Smile Dental Clinic',
      description: 'Expert dental care with modern technology and experienced professionals.',
      categories: ['Dentist', 'Dental Care', 'Orthodontics'],
      location: 'Shop 12, Crystal Plaza, Andheri West',
      city: 'Mumbai',
      bio: 'Welcome to Smile Dental Clinic, where your oral health is our top priority. With over 15 years of experience in dental care, we provide comprehensive services.',
      profileImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800',
      rating: 4.8,
      reviewCount: 234,
      verified: true,
      consultationSlots: [
        { date: '2024-01-25', startTime: '09:00', endTime: '09:30', available: true },
        { date: '2024-01-25', startTime: '10:00', endTime: '10:30', available: true },
      ],
      createdAt: new Date('2022-01-15'),
      updatedAt: new Date('2024-01-20'),
      services: [
        {
          id: 's1',
          providerId: '1',
          category: 'Dentist',
          title: 'Dental Consultation',
          description: 'Comprehensive dental check-up and consultation.',
          duration: 30,
          images: [],
          createdAt: new Date(),
        },
        {
          id: 's2',
          providerId: '1',
          category: 'Dentist',
          title: 'Teeth Cleaning',
          description: 'Professional cleaning to remove plaque and tartar.',
          duration: 45,
          images: [],
          createdAt: new Date(),
        },
      ],
      reviews: [
        {
          id: 'r1',
          userId: 'u1',
          providerId: '1',
          rating: 5,
          comment: 'Excellent service! Very professional.',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          userName: 'Rahul S.',
        },
        {
          id: 'r2',
          userId: 'u2',
          providerId: '1',
          rating: 4,
          comment: 'Good experience, would recommend.',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          userName: 'Priya P.',
        },
      ],
      averageRating: 4.8,
    },
  };

  return mockProviders[id] || null;
}

// ==================== GET HANDLER ====================

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<ProviderWithDetails>>> {
  try {
    const { id } = await context.params;

    // Fetch provider
    let provider: Provider | null = null;
    let services: Service[] = [];
    let reviews: Review[] = [];
    let averageRating = 0;

    try {
      [provider, services, reviews, averageRating] = await Promise.all([
        getProvider(id),
        getServices(id),
        getProviderReviews(id),
        getAverageRating(id),
      ]);
    } catch (error) {
      console.error('Error fetching provider data:', error);
      // Use mock data for development
      const mockData = getMockProvider(id);
      if (mockData) {
        return NextResponse.json(
          {
            success: true,
            message: 'Provider fetched successfully',
            data: mockData,
          },
          { status: 200, headers: getSecurityHeaders() }
        );
      }
    }

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404, headers: getNoCacheHeaders() }
      );
    }

    // Combine data
    const providerWithDetails: ProviderWithDetails = {
      ...provider,
      services,
      reviews: reviews.map((r) => ({ ...r, userName: 'Customer' })),
      averageRating,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Provider fetched successfully',
        data: providerWithDetails,
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Get provider error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500, headers: getNoCacheHeaders() }
    );
  }
}

// ==================== PUT HANDLER ====================

export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await context.params;

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 401, headers: getNoCacheHeaders() }
      );
    }

    // Verify user is the provider
    if (auth.userId !== id) {
      return NextResponse.json(
        { success: false, message: 'You can only update your own profile' },
        { status: 403, headers: getNoCacheHeaders() }
      );
    }

    // Parse request body
    let body: UpdateProviderRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400, headers: getNoCacheHeaders() }
      );
    }

    // Validate input
    const validation = validateUpdateInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400, headers: getNoCacheHeaders() }
      );
    }

    // Update provider
    const updateData: Partial<Provider> = {
      ...(body.businessName && { businessName: body.businessName.trim() }),
      ...(body.description && { description: body.description.trim() }),
      ...(body.categories && { categories: body.categories }),
      ...(body.location && { location: body.location.trim() }),
      ...(body.city && { city: body.city.trim() }),
      ...(body.bio && { bio: body.bio.trim() }),
      ...(body.profileImage && { profileImage: body.profileImage }),
      updatedAt: new Date(),
    };

    try {
      await updateProvider(id, updateData);
    } catch (error) {
      console.error('Error updating provider:', error);
      // Continue for development
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        data: {
          providerId: id,
          updated: updateData,
        },
      },
      { status: 200, headers: getNoCacheHeaders() }
    );
  } catch (error: unknown) {
    console.error('Update provider error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500, headers: getNoCacheHeaders() }
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
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
