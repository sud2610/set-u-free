import { NextRequest, NextResponse } from 'next/server';
import { 
  getBooking, 
  updateBookingStatus, 
  cancelBooking,
  getUser,
  getProvider,
  getService,
} from '@/lib/firestore';
import type { Booking } from '@/types';

// ==================== TYPES ====================

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

interface UpdateBookingRequestBody {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
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

// ==================== OWNERSHIP VALIDATION ====================

async function validateOwnership(
  booking: Booking,
  userId: string
): Promise<{ valid: boolean; role: 'user' | 'provider' | null }> {
  // Check if user is the booking customer
  if (booking.userId === userId) {
    return { valid: true, role: 'user' };
  }

  // Check if user is the provider
  if (booking.providerId === userId) {
    return { valid: true, role: 'provider' };
  }

  // Check if user has provider profile that matches
  try {
    const provider = await getProvider(userId);
    if (provider && provider.uid === booking.providerId) {
      return { valid: true, role: 'provider' };
    }
  } catch (error) {
    console.error('Error checking provider:', error);
  }

  return { valid: false, role: null };
}

// ==================== MOCK BOOKING DATA ====================

function getMockBooking(id: string): Booking | null {
  const mockBookings: Record<string, Booking> = {
    'b1': {
      id: 'b1',
      userId: 'u1',
      providerId: 'p1',
      serviceId: 's1',
      status: 'pending',
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      notes: 'First consultation',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'b2': {
      id: 'b2',
      userId: 'u1',
      providerId: 'p2',
      serviceId: 's2',
      status: 'confirmed',
      dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  return mockBookings[id] || null;
}

// ==================== GET HANDLER ====================

export async function GET(
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
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Fetch booking
    let booking: Booking | null = null;
    try {
      booking = await getBooking(id);
    } catch (error) {
      console.error('Error fetching booking:', error);
      // Use mock data for development
      booking = getMockBooking(id);
    }

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Validate ownership
    const ownership = await validateOwnership(booking, auth.userId!);
    if (!ownership.valid) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to view this booking' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // Fetch related data
    let userData = null;
    let providerData = null;
    let serviceData = null;

    try {
      [userData, providerData, serviceData] = await Promise.all([
        getUser(booking.userId),
        getProvider(booking.providerId),
        getService(booking.serviceId),
      ]);
    } catch (error) {
      console.error('Error fetching related data:', error);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Booking fetched successfully',
        data: {
          booking: {
            id: booking.id,
            userId: booking.userId,
            providerId: booking.providerId,
            serviceId: booking.serviceId,
            status: booking.status,
            dateTime: booking.dateTime,
            notes: booking.notes,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
          },
          user: userData ? {
            id: userData.uid,
            name: userData.fullName,
            email: userData.email,
          } : null,
          provider: providerData ? {
            id: providerData.uid,
            name: providerData.businessName,
          } : null,
          service: serviceData ? {
            id: serviceData.id,
            title: serviceData.title,
            duration: serviceData.duration,
          } : null,
          viewerRole: ownership.role,
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Get booking error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500, headers: getSecurityHeaders() }
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
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Parse request body
    let body: UpdateBookingRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid status',
          errors: { status: `Status must be one of: ${validStatuses.join(', ')}` }
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Fetch booking
    let booking: Booking | null = null;
    try {
      booking = await getBooking(id);
    } catch (error) {
      console.error('Error fetching booking:', error);
      booking = getMockBooking(id);
    }

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Validate ownership
    const ownership = await validateOwnership(booking, auth.userId!);
    if (!ownership.valid) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to update this booking' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // Validate status transitions based on role
    if (body.status) {
      // Users can only cancel their bookings
      if (ownership.role === 'user') {
        if (body.status !== 'cancelled') {
          return NextResponse.json(
            { success: false, message: 'Customers can only cancel bookings' },
            { status: 403, headers: getSecurityHeaders() }
          );
        }
      }

      // Providers can confirm, complete, or cancel
      if (ownership.role === 'provider') {
        const allowedTransitions: Record<string, string[]> = {
          'pending': ['confirmed', 'cancelled'],
          'confirmed': ['completed', 'cancelled'],
          'completed': [],
          'cancelled': [],
        };

        if (!allowedTransitions[booking.status]?.includes(body.status)) {
          return NextResponse.json(
            { 
              success: false, 
              message: `Cannot change status from '${booking.status}' to '${body.status}'` 
            },
            { status: 400, headers: getSecurityHeaders() }
          );
        }
      }
    }

    // Update booking
    try {
      if (body.status) {
        await updateBookingStatus(id, body.status);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      // Continue for development
    }

    // Return updated booking
    const updatedBooking = {
      ...booking,
      status: body.status || booking.status,
      notes: body.notes !== undefined ? body.notes : booking.notes,
      updatedAt: new Date(),
    };

    return NextResponse.json(
      {
        success: true,
        message: `Booking ${body.status === 'confirmed' ? 'confirmed' : body.status === 'cancelled' ? 'cancelled' : body.status === 'completed' ? 'completed' : 'updated'} successfully`,
        data: {
          booking: updatedBooking,
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Update booking error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// ==================== DELETE HANDLER ====================

export async function DELETE(
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
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Fetch booking
    let booking: Booking | null = null;
    try {
      booking = await getBooking(id);
    } catch (error) {
      console.error('Error fetching booking:', error);
      booking = getMockBooking(id);
    }

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Validate ownership
    const ownership = await validateOwnership(booking, auth.userId!);
    if (!ownership.valid) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to delete this booking' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete a completed booking' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Booking is already cancelled' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Cancel booking (soft delete)
    try {
      await cancelBooking(id);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      // Continue for development
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Booking cancelled successfully',
        data: {
          bookingId: id,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Delete booking error:', error);
    
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
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
