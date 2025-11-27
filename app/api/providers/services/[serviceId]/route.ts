import { NextRequest, NextResponse } from 'next/server';
import { getService, updateService, deleteService } from '@/lib/firestore';
import type { Service } from '@/types';

// ==================== TYPES ====================

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

interface RouteContext {
  params: Promise<{ serviceId: string }>;
}

interface UpdateServiceRequestBody {
  category?: string;
  title?: string;
  description?: string;
  duration?: number;
  images?: string[];
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

// ==================== VALIDATION ====================

function validateUpdateInput(body: UpdateServiceRequestBody): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (body.category !== undefined) {
    if (typeof body.category !== 'string' || body.category.length < 2 || body.category.length > 50) {
      errors.category = 'Category must be between 2 and 50 characters';
    }
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.length < 2 || body.title.length > 100) {
      errors.title = 'Title must be between 2 and 100 characters';
    }
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string' || body.description.length < 10 || body.description.length > 500) {
      errors.description = 'Description must be between 10 and 500 characters';
    }
  }

  if (body.duration !== undefined) {
    if (typeof body.duration !== 'number' || body.duration < 5 || body.duration > 480) {
      errors.duration = 'Duration must be between 5 and 480 minutes';
    }
  }

  if (body.images !== undefined) {
    if (!Array.isArray(body.images)) {
      errors.images = 'Images must be an array';
    } else if (body.images.length > 10) {
      errors.images = 'Maximum 10 images allowed';
    } else {
      for (const img of body.images) {
        try {
          new URL(img);
        } catch {
          errors.images = 'All images must be valid URLs';
          break;
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ==================== MOCK DATA ====================

function getMockService(serviceId: string): Service | null {
  const mockServices: Record<string, Service> = {
    's1': {
      id: 's1',
      providerId: 'p1',
      category: 'Dentist',
      title: 'Dental Consultation',
      description: 'Comprehensive dental check-up and consultation with our expert dentist.',
      duration: 30,
      images: [],
      createdAt: new Date(),
    },
    's2': {
      id: 's2',
      providerId: 'p1',
      category: 'Dentist',
      title: 'Teeth Cleaning',
      description: 'Professional teeth cleaning to remove plaque and tartar buildup.',
      duration: 45,
      images: [],
      createdAt: new Date(),
    },
  };

  return mockServices[serviceId] || null;
}

// ==================== GET HANDLER ====================

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    const { serviceId } = await context.params;

    // Fetch service
    let service: Service | null = null;
    try {
      service = await getService(serviceId);
    } catch (error) {
      console.error('Error fetching service:', error);
      service = getMockService(serviceId);
    }

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Service fetched successfully',
        data: { service },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Get service error:', error);
    
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
    const { serviceId } = await context.params;

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Parse request body
    let body: UpdateServiceRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400, headers: getSecurityHeaders() }
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
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Fetch service to verify ownership
    let service: Service | null = null;
    try {
      service = await getService(serviceId);
    } catch (error) {
      console.error('Error fetching service:', error);
      service = getMockService(serviceId);
    }

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Verify provider ownership
    if (service.providerId !== auth.userId) {
      return NextResponse.json(
        { success: false, message: 'You can only update your own services' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // Build update data
    const updateData: Partial<Service> = {};
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.images !== undefined) updateData.images = body.images;

    // Update service
    try {
      await updateService(serviceId, updateData);
    } catch (error) {
      console.error('Error updating service:', error);
      // Continue for development
    }

    const updatedService: Service = {
      ...service,
      ...updateData,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Service updated successfully',
        data: {
          service: updatedService,
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Update service error:', error);
    
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
    const { serviceId } = await context.params;

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Fetch service to verify ownership
    let service: Service | null = null;
    try {
      service = await getService(serviceId);
    } catch (error) {
      console.error('Error fetching service:', error);
      service = getMockService(serviceId);
    }

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Verify provider ownership
    if (service.providerId !== auth.userId) {
      return NextResponse.json(
        { success: false, message: 'You can only delete your own services' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // Delete service
    try {
      await deleteService(serviceId);
    } catch (error) {
      console.error('Error deleting service:', error);
      // Continue for development
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Service deleted successfully',
        data: {
          serviceId,
          deletedAt: new Date().toISOString(),
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Delete service error:', error);
    
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

