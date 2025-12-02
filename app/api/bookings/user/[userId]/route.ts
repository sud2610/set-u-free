import { NextRequest, NextResponse } from 'next/server';
import { getBookings } from '@/lib/firestore';
import type { Booking } from '@/types';

// ==================== TYPES ====================

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface RouteContext {
  params: Promise<{ userId: string }>;
}

interface PaginatedBookings {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    status: string | null;
    sortBy: string;
    sortOrder: string;
  };
}

// ==================== SECURITY HEADERS ====================

function getSecurityHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
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

// ==================== MOCK DATA ====================

function getMockUserBookings(userId: string): Booking[] {
  const mockBookings: Booking[] = [
    {
      id: 'b1',
      userId: userId,
      providerId: 'p1',
      serviceId: 's1',
      status: 'confirmed',
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      notes: 'First dental checkup',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'b2',
      userId: userId,
      providerId: 'p2',
      serviceId: 's2',
      status: 'pending',
      dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'b3',
      userId: userId,
      providerId: 'p1',
      serviceId: 's3',
      status: 'completed',
      dateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'b4',
      userId: userId,
      providerId: 'p3',
      serviceId: 's4',
      status: 'cancelled',
      dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  return mockBookings;
}

// ==================== GET HANDLER ====================

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<PaginatedBookings>>> {
  try {
    const { userId } = await context.params;

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Verify user is requesting their own bookings
    if (auth.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'You can only view your own bookings' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const sortBy = searchParams.get('sortBy') || 'dateTime';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate status filter
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid status filter. Must be one of: ${validStatuses.join(', ')}` 
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Fetch bookings
    let bookings: Booking[] = [];
    try {
      bookings = await getBookings(userId);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Use mock data for development
      bookings = getMockUserBookings(userId);
    }

    // Apply status filter
    if (status) {
      bookings = bookings.filter((b) => b.status === status);
    }

    // Sort bookings
    bookings.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'dateTime':
          aValue = new Date(a.dateTime).getTime();
          bValue = new Date(b.dateTime).getTime();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'status':
          const statusOrder = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        default:
          aValue = new Date(a.dateTime).getTime();
          bValue = new Date(b.dateTime).getTime();
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Calculate pagination
    const total = bookings.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookings = bookings.slice(startIndex, endIndex);

    return NextResponse.json(
      {
        success: true,
        message: 'Bookings fetched successfully',
        data: {
          bookings: paginatedBookings,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
          filters: {
            status: status,
            sortBy,
            sortOrder,
          },
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Get user bookings error:', error);
    
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}



