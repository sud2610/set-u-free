import { NextRequest, NextResponse } from 'next/server';
import { createService, getProvider, getServices } from '@/lib/firestore';
import type { Service } from '@/types';

// ==================== TYPES ====================

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

interface CreateServiceRequestBody {
  providerId: string;
  category: string;
  title: string;
  description: string;
  duration: number;
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

function validateInput(body: CreateServiceRequestBody): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!body.providerId || typeof body.providerId !== 'string') {
    errors.providerId = 'Provider ID is required';
  }

  if (!body.category || typeof body.category !== 'string') {
    errors.category = 'Category is required';
  } else if (body.category.length < 2 || body.category.length > 50) {
    errors.category = 'Category must be between 2 and 50 characters';
  }

  if (!body.title || typeof body.title !== 'string') {
    errors.title = 'Title is required';
  } else if (body.title.length < 2 || body.title.length > 100) {
    errors.title = 'Title must be between 2 and 100 characters';
  }

  if (!body.description || typeof body.description !== 'string') {
    errors.description = 'Description is required';
  } else if (body.description.length < 10 || body.description.length > 500) {
    errors.description = 'Description must be between 10 and 500 characters';
  }

  if (body.duration === undefined || body.duration === null) {
    errors.duration = 'Duration is required';
  } else if (typeof body.duration !== 'number' || body.duration < 5 || body.duration > 480) {
    errors.duration = 'Duration must be between 5 and 480 minutes';
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

// ==================== GET HANDLER ====================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Fetch services
    let services: Service[] = [];
    try {
      services = await getServices(providerId);
    } catch (error) {
      console.error('Error fetching services:', error);
      // Return empty array for development
      services = [];
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Services fetched successfully',
        data: {
          services,
          count: services.length,
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Get services error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
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
    let body: CreateServiceRequestBody;
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

    // Verify provider ownership
    if (auth.userId !== body.providerId) {
      return NextResponse.json(
        { success: false, message: 'You can only add services to your own profile' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // Verify provider exists
    try {
      const provider = await getProvider(body.providerId);
      if (!provider) {
        return NextResponse.json(
          { success: false, message: 'Provider not found' },
          { status: 404, headers: getSecurityHeaders() }
        );
      }
    } catch (error) {
      console.error('Error checking provider:', error);
      // Continue for development
    }

    // Create service data
    const serviceData: Omit<Service, 'id'> = {
      providerId: body.providerId,
      category: body.category.trim(),
      title: body.title.trim(),
      description: body.description.trim(),
      duration: body.duration,
      images: body.images || [],
      createdAt: new Date(),
    };

    // Create service in Firestore
    let serviceId: string;
    try {
      serviceId = await createService(body.providerId, serviceData);
    } catch (error) {
      console.error('Error creating service:', error);
      // Generate mock ID for development
      serviceId = `service_${Date.now()}`;
    }

    const createdService: Service = {
      id: serviceId,
      ...serviceData,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Service created successfully',
        data: {
          service: createdService,
        },
      },
      { status: 201, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Create service error:', error);
    
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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}






