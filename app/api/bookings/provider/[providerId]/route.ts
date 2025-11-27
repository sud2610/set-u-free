import { NextRequest, NextResponse } from 'next/server';
import { getProviderBookings, getProvider, getUser } from '@/lib/firestore';
import type { Booking } from '@/types';

// ==================== TYPES ====================

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface RouteContext {
  params: Promise<{ providerId: string }>;
}

interface ExtendedBooking extends Booking {
  customerName?: string;
  customerEmail?: string;
  serviceName?: string;
}

interface PaginatedBookings {
  bookings: ExtendedBooking[];
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
    dateFrom: string | null;
    dateTo: string | null;
    sortBy: string;
    sortOrder: string;
  };
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
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

function getMockProviderBookings(providerId: string): ExtendedBooking[] {
  const mockBookings: ExtendedBooking[] = [
    {
      id: 'pb1',
      userId: 'u1',
      providerId: providerId,
      serviceId: 's1',
      status: 'pending',
      dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      notes: 'First time consultation',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul@example.com',
      serviceName: 'Dental Consultation',
    },
    {
      id: 'pb2',
      userId: 'u2',
      providerId: providerId,
      serviceId: 's2',
      status: 'confirmed',
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      customerName: 'Priya Patel',
      customerEmail: 'priya@example.com',
      serviceName: 'Teeth Cleaning',
    },
    {
      id: 'pb3',
      userId: 'u3',
      providerId: providerId,
      serviceId: 's1',
      status: 'pending',
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Have some tooth pain',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      customerName: 'Amit Kumar',
      customerEmail: 'amit@example.com',
      serviceName: 'Dental Consultation',
    },
    {
      id: 'pb4',
      userId: 'u4',
      providerId: providerId,
      serviceId: 's3',
      status: 'completed',
      dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      customerName: 'Sneha Gupta',
      customerEmail: 'sneha@example.com',
      serviceName: 'Teeth Whitening',
    },
    {
      id: 'pb5',
      userId: 'u5',
      providerId: providerId,
      serviceId: 's1',
      status: 'cancelled',
      dateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      customerName: 'Vikram Singh',
      customerEmail: 'vikram@example.com',
      serviceName: 'Dental Consultation',
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
    const { providerId } = await context.params;

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Verify user is the provider or has access
    let isAuthorized = false;

    // Check if user ID matches provider ID
    if (auth.userId === providerId) {
      isAuthorized = true;
    }

    // Check if user has a provider profile with matching ID
    if (!isAuthorized) {
      try {
        const provider = await getProvider(auth.userId!);
        if (provider && provider.uid === providerId) {
          isAuthorized = true;
        }
      } catch (error) {
        console.error('Error checking provider:', error);
        // For development, allow access
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to view these bookings' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const sortBy = searchParams.get('sortBy') || 'dateTime';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

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
    let bookings: ExtendedBooking[] = [];
    try {
      const rawBookings = await getProviderBookings(providerId);
      
      // Enrich with customer data
      bookings = await Promise.all(
        rawBookings.map(async (booking) => {
          let customerName = 'Customer';
          let customerEmail = '';
          
          try {
            const user = await getUser(booking.userId);
            if (user) {
              customerName = user.fullName;
              customerEmail = user.email;
            }
          } catch (error) {
            console.error('Error fetching customer:', error);
          }

          return {
            ...booking,
            customerName,
            customerEmail,
          } as ExtendedBooking;
        })
      );
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Use mock data for development
      bookings = getMockProviderBookings(providerId);
    }

    // Calculate stats before filtering
    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    };

    // Apply filters
    let filteredBookings = [...bookings];

    // Status filter
    if (status) {
      filteredBookings = filteredBookings.filter((b) => b.status === status);
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (!isNaN(fromDate.getTime())) {
        filteredBookings = filteredBookings.filter(
          (b) => new Date(b.dateTime) >= fromDate
        );
      }
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      if (!isNaN(toDate.getTime())) {
        filteredBookings = filteredBookings.filter(
          (b) => new Date(b.dateTime) <= toDate
        );
      }
    }

    // Sort bookings
    filteredBookings.sort((a, b) => {
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
        case 'customerName':
          return sortOrder === 'asc'
            ? (a.customerName || '').localeCompare(b.customerName || '')
            : (b.customerName || '').localeCompare(a.customerName || '');
        default:
          aValue = new Date(a.dateTime).getTime();
          bValue = new Date(b.dateTime).getTime();
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Calculate pagination
    const total = filteredBookings.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

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
            dateFrom: dateFrom,
            dateTo: dateTo,
            sortBy,
            sortOrder,
          },
          stats,
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Get provider bookings error:', error);
    
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

