import { NextRequest, NextResponse } from 'next/server';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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

// ==================== CLEAR COOKIE HEADERS ====================

function getClearCookieHeaders(): HeadersInit {
  return {
    // Clear any auth-related cookies
    'Set-Cookie': [
      'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict',
      'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict',
      'refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict',
    ].join(', '),
  };
}

// ==================== POST HANDLER ====================

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Verify authorization header (optional - for additional security)
    const authHeader = request.headers.get('Authorization');
    
    // Note: Firebase client-side signOut doesn't require server validation
    // but we can check if a token was provided for logging purposes
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      // In production, you might want to:
      // 1. Revoke the token using Firebase Admin SDK
      // 2. Add the token to a blacklist
      // 3. Log the logout event
      console.log('Logout request received with token');
    }

    // Sign out from Firebase Auth (client-side state)
    // Note: This mainly affects server-side Firebase instance
    // Client should also call signOut separately
    try {
      await signOut(auth);
    } catch (firebaseError) {
      // Firebase signOut might fail if no user is signed in
      // This is not an error condition for logout
      console.log('Firebase signOut:', firebaseError);
    }

    // Return success response with cookie clearing headers
    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
        data: {
          loggedOutAt: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          ...getSecurityHeaders(),
          ...getClearCookieHeaders(),
        },
      }
    );
  } catch (error: unknown) {
    console.error('Logout error:', error);

    // Even if something fails, we should still try to clear cookies
    // and return success to ensure the client can clean up
    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
        data: {
          loggedOutAt: new Date().toISOString(),
          note: 'Session cleared on client',
        },
      },
      {
        status: 200,
        headers: {
          ...getSecurityHeaders(),
          ...getClearCookieHeaders(),
        },
      }
    );
  }
}

// ==================== GET HANDLER (For convenience) ====================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  // Redirect GET requests to POST handler for convenience
  // Some implementations might use GET for logout
  return POST(request);
}

// ==================== OPTIONS HANDLER (CORS) ====================

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        ...getSecurityHeaders(),
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}






