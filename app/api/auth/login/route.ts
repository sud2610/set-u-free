import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser } from '@/lib/firestore';

// ==================== TYPES ====================

interface LoginRequestBody {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

// ==================== VALIDATION ====================

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateInput(body: LoginRequestBody): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Email validation
  if (!body.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(body.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!body.password) {
    errors.password = 'Password is required';
  } else if (body.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
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

// ==================== ERROR MAPPING ====================

function mapFirebaseError(errorCode: string): { status: number; message: string } {
  const errorMap: Record<string, { status: number; message: string }> = {
    'auth/user-not-found': {
      status: 401,
      message: 'Invalid email or password',
    },
    'auth/wrong-password': {
      status: 401,
      message: 'Invalid email or password',
    },
    'auth/invalid-credential': {
      status: 401,
      message: 'Invalid email or password',
    },
    'auth/invalid-email': {
      status: 400,
      message: 'Invalid email address format',
    },
    'auth/user-disabled': {
      status: 403,
      message: 'This account has been disabled. Please contact support',
    },
    'auth/too-many-requests': {
      status: 429,
      message: 'Too many failed login attempts. Please try again later',
    },
    'auth/network-request-failed': {
      status: 503,
      message: 'Network error. Please check your connection and try again',
    },
    'auth/operation-not-allowed': {
      status: 403,
      message: 'Email/password login is not enabled',
    },
  };

  return errorMap[errorCode] || {
    status: 500,
    message: 'An unexpected error occurred. Please try again',
  };
}

// ==================== RATE LIMITING (Simple In-Memory) ====================

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts) {
    return { allowed: true };
  }

  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

function recordLoginAttempt(ip: string, success: boolean): void {
  if (success) {
    loginAttempts.delete(ip);
    return;
  }

  const attempts = loginAttempts.get(ip);
  if (attempts) {
    attempts.count++;
    attempts.lastAttempt = Date.now();
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: Date.now() });
  }
}

// ==================== POST HANDLER ====================

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0].trim() || 'unknown';

    // Check rate limit
    const rateLimitCheck = checkRateLimit(clientIp);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many login attempts. Please try again in ${Math.ceil(rateLimitCheck.retryAfter! / 60)} minutes`,
        },
        {
          status: 429,
          headers: {
            ...getSecurityHeaders(),
            'Retry-After': String(rateLimitCheck.retryAfter),
          },
        }
      );
    }

    // Parse request body
    let body: LoginRequestBody;
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

    // Check if Firebase is configured
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: 'Firebase authentication is not configured',
        },
        { status: 500, headers: getSecurityHeaders() }
      );
    }

    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      body.email.toLowerCase().trim(),
      body.password
    );

    const firebaseUser = userCredential.user;

    // Record successful login
    recordLoginAttempt(clientIp, true);

    // Get ID token
    const idToken = await firebaseUser.getIdToken();

    // Fetch user data from Firestore
    let userData = null;
    try {
      userData = await getUser(firebaseUser.uid);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Continue even if Firestore fetch fails
    }

    // Prepare response data
    const responseUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: userData?.fullName || firebaseUser.displayName || 'User',
      role: userData?.role || 'customer',
      location: userData?.location || '',
      phone: userData?.phone,
      profileImage: userData?.profileImage || firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      createdAt: userData?.createdAt || firebaseUser.metadata.creationTime,
      lastLoginAt: new Date().toISOString(),
    };

    // Set token expiration based on rememberMe
    const tokenExpiration = body.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          user: responseUser,
          token: idToken,
          expiresIn: tokenExpiration,
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0].trim() || 'unknown';

    // Record failed login attempt
    recordLoginAttempt(clientIp, false);

    console.error('Login error:', error);

    // Handle Firebase errors
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      const mappedError = mapFirebaseError(firebaseError.code);

      return NextResponse.json(
        {
          success: false,
          message: mappedError.message,
        },
        { status: mappedError.status, headers: getSecurityHeaders() }
      );
    }

    // Handle generic errors
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again later',
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}
