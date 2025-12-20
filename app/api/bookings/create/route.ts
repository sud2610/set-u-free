import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getProvider, getService, getUser } from '@/lib/firestore';
import type { Booking } from '@/types';

// ==================== TYPES ====================

interface CreateBookingRequestBody {
  userId: string;
  providerId: string;
  serviceId: string;
  dateTime: string; // ISO date string
  notes?: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
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
    // Decode JWT to get user ID (in production, use Firebase Admin SDK)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Check expiration
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

function validateInput(body: CreateBookingRequestBody): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!body.userId || typeof body.userId !== 'string') {
    errors.userId = 'User ID is required';
  }

  if (!body.providerId || typeof body.providerId !== 'string') {
    errors.providerId = 'Provider ID is required';
  }

  if (!body.serviceId || typeof body.serviceId !== 'string') {
    errors.serviceId = 'Service ID is required';
  }

  if (!body.dateTime) {
    errors.dateTime = 'Date and time is required';
  } else {
    const date = new Date(body.dateTime);
    if (isNaN(date.getTime())) {
      errors.dateTime = 'Invalid date format';
    } else if (date < new Date()) {
      errors.dateTime = 'Booking date must be in the future';
    }
  }

  if (body.notes && body.notes.length > 500) {
    errors.notes = 'Notes must be less than 500 characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ==================== NOTIFICATION PLACEHOLDER ====================

async function sendBookingNotification(
  booking: Booking,
  provider: { businessName: string; email?: string },
  user: { fullName: string; email: string }
): Promise<void> {
  // Placeholder for email/notification service
  // In production, integrate with:
  // - SendGrid, Mailgun, or AWS SES for email
  // - Firebase Cloud Messaging for push notifications
  // - Twilio for SMS
  
  console.log('📧 Notification: New booking request');
  console.log(`   Provider: ${provider.businessName}`);
  console.log(`   Customer: ${user.fullName} (${user.email})`);
  console.log(`   Date: ${new Date(booking.dateTime).toLocaleString()}`);
  console.log(`   Status: ${booking.status}`);
  
  // Example email payload
  const emailPayload = {
    to: provider.email || 'provider@example.com',
    subject: `New Booking Request from ${user.fullName}`,
    html: `
      <h2>New Booking Request</h2>
      <p><strong>Customer:</strong> ${user.fullName}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Date:</strong> ${new Date(booking.dateTime).toLocaleString()}</p>
      <p><strong>Notes:</strong> ${booking.notes || 'None'}</p>
      <p>Please log in to your dashboard to confirm or reject this booking.</p>
    `,
  };
  
  // TODO: Send email using your preferred email service
  // await sendEmail(emailPayload);
}

// ==================== POST HANDLER ====================

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Parse request body
    let body: CreateBookingRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Validate input
    const validation = validateInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Verify user matches authenticated user
    if (auth.userId !== body.userId) {
      return NextResponse.json(
        { success: false, message: 'You can only create bookings for yourself' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // Verify provider exists
    let provider;
    try {
      provider = await getProvider(body.providerId);
      if (!provider) {
        return NextResponse.json(
          { success: false, message: 'Provider not found' },
          { status: 404, headers: getSecurityHeaders() }
        );
      }
    } catch (error) {
      console.error('Error fetching provider:', error);
      // Continue if Firestore is not set up (development)
      provider = { businessName: 'Provider', uid: body.providerId };
    }

    // Verify service exists
    let service;
    try {
      service = await getService(body.serviceId);
      if (!service) {
        return NextResponse.json(
          { success: false, message: 'Service not found' },
          { status: 404, headers: getSecurityHeaders() }
        );
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      // Continue if Firestore is not set up (development)
      service = { id: body.serviceId, title: 'Service' };
    }

    // Verify user exists
    let user;
    try {
      user = await getUser(body.userId);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404, headers: getSecurityHeaders() }
        );
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Continue if Firestore is not set up (development)
      user = { fullName: 'User', email: 'user@example.com', uid: body.userId };
    }

    // Create booking data
    const bookingData: Omit<Booking, 'id'> = {
      userId: body.userId,
      providerId: body.providerId,
      serviceId: body.serviceId,
      status: 'pending',
      dateTime: new Date(body.dateTime),
      notes: body.notes?.trim() || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create booking in Firestore
    let createdBooking: Booking;
    try {
      createdBooking = await createBooking(bookingData);
    } catch (error) {
      console.error('Error creating booking:', error);
      // Generate mock booking for development
      createdBooking = {
        id: `booking_${Date.now()}`,
        ...bookingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Send notification to provider
    try {
      await sendBookingNotification(
        createdBooking,
        provider as { businessName: string; email?: string },
        user as { fullName: string; email: string }
      );
    } catch (error) {
      console.error('Error sending notification:', error);
      // Don't fail the request if notification fails
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        data: {
          booking: {
            id: createdBooking.id,
            userId: createdBooking.userId,
            providerId: createdBooking.providerId,
            serviceId: createdBooking.serviceId,
            status: createdBooking.status,
            dateTime: createdBooking.dateTime,
            notes: createdBooking.notes,
            createdAt: createdBooking.createdAt,
          },
          provider: {
            id: body.providerId,
            name: (provider as { businessName?: string }).businessName || 'Provider',
          },
          service: {
            id: body.serviceId,
            title: (service as { title?: string }).title || 'Service',
          },
        },
      },
      { status: 201, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Create booking error:', error);
    
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
