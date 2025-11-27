import { NextRequest, NextResponse } from 'next/server';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUser } from '@/lib/firestore';
import type { User } from '@/types';

// ==================== TYPES ====================

interface RegisterRequestBody {
  email: string;
  password: string;
  fullName: string;
  role: 'customer' | 'provider';
  location: string;
  phone?: string;
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

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

function validateInput(body: RegisterRequestBody): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Full name validation
  if (!body.fullName || body.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }
  if (body.fullName && body.fullName.length > 50) {
    errors.fullName = 'Full name must be less than 50 characters';
  }

  // Email validation
  if (!body.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(body.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!body.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(body.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.message!;
    }
  }

  // Role validation
  if (!body.role) {
    errors.role = 'Role is required';
  } else if (!['customer', 'provider'].includes(body.role)) {
    errors.role = 'Role must be either "customer" or "provider"';
  }

  // Location validation
  if (!body.location || body.location.trim().length < 2) {
    errors.location = 'Location is required';
  }

  // Phone validation (optional)
  if (body.phone && !/^[6-9]\d{9}$/.test(body.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
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
    'auth/email-already-in-use': {
      status: 409,
      message: 'An account with this email already exists',
    },
    'auth/invalid-email': {
      status: 400,
      message: 'Invalid email address format',
    },
    'auth/operation-not-allowed': {
      status: 403,
      message: 'Email/password accounts are not enabled',
    },
    'auth/weak-password': {
      status: 400,
      message: 'Password is too weak. Please use a stronger password',
    },
    'auth/network-request-failed': {
      status: 503,
      message: 'Network error. Please check your connection and try again',
    },
    'auth/too-many-requests': {
      status: 429,
      message: 'Too many requests. Please try again later',
    },
  };

  return errorMap[errorCode] || {
    status: 500,
    message: 'An unexpected error occurred. Please try again',
  };
}

// ==================== POST HANDLER ====================

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Parse request body
    let body: RegisterRequestBody;
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

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      body.email.toLowerCase().trim(),
      body.password
    );

    const firebaseUser = userCredential.user;

    // Update display name in Firebase Auth
    await updateProfile(firebaseUser, {
      displayName: body.fullName.trim(),
    });

    // Send email verification (optional - uncomment if needed)
    // await sendEmailVerification(firebaseUser);

    // Prepare user data for Firestore
    const userData: Omit<User, 'uid'> = {
      fullName: body.fullName.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone || undefined,
      role: body.role,
      location: body.location.trim(),
      profileImage: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create user document in Firestore
    await createUser(firebaseUser.uid, userData);

    // Get ID token for response
    const idToken = await firebaseUser.getIdToken();

    // Prepare response data (exclude sensitive info)
    const responseUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: userData.fullName,
      role: userData.role,
      location: userData.location,
      emailVerified: firebaseUser.emailVerified,
      createdAt: userData.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        data: {
          user: responseUser,
          token: idToken,
        },
      },
      { status: 201, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);

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
