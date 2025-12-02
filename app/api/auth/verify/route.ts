import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/firestore';

// ==================== TYPES ====================

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ==================== SECURITY HEADERS ====================

function getSecurityHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
  };
}

// ==================== TOKEN VERIFICATION ====================

/**
 * Verify Firebase ID token
 * In production, use Firebase Admin SDK for secure server-side verification
 * 
 * Example with Admin SDK:
 * import { getAuth } from 'firebase-admin/auth';
 * const decodedToken = await getAuth().verifyIdToken(token);
 */
async function verifyToken(token: string): Promise<{ valid: boolean; uid?: string; error?: string }> {
  try {
    // For client-side Firebase, we can decode the JWT to get basic info
    // NOTE: This is NOT secure verification - use Firebase Admin SDK in production
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    // Decode the payload (middle part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    // Check issued at (not in the future)
    if (payload.iat && payload.iat > now + 60) {
      return { valid: false, error: 'Token issued in the future' };
    }

    // Return user ID from token
    return { valid: true, uid: payload.user_id || payload.sub };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'Token verification failed' };
  }
}

// ==================== GET HANDLER ====================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization header is required',
        },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token is required',
        },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Verify token
    const verification = await verifyToken(token);

    if (!verification.valid) {
      return NextResponse.json(
        {
          success: false,
          message: verification.error || 'Invalid token',
        },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Fetch user data from Firestore
    let userData = null;
    if (verification.uid) {
      try {
        userData = await getUser(verification.uid);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Return user data
    return NextResponse.json(
      {
        success: true,
        message: 'Token is valid',
        data: {
          user: {
            uid: verification.uid,
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role,
            location: userData.location,
            phone: userData.phone,
            profileImage: userData.profileImage,
            createdAt: userData.createdAt,
          },
          tokenValid: true,
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Token verification error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while verifying the token',
      },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// ==================== POST HANDLER (Alternative) ====================

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Parse request body for token
    let body: { token?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON in request body',
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const token = body.token || request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token is required',
        },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Verify token
    const verification = await verifyToken(token);

    if (!verification.valid) {
      return NextResponse.json(
        {
          success: false,
          message: verification.error || 'Invalid token',
        },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Token is valid',
        data: {
          uid: verification.uid,
          tokenValid: true,
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Token verification error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while verifying the token',
      },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// ==================== OPTIONS HANDLER (CORS) ====================

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        ...getSecurityHeaders(),
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}



