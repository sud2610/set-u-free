import { NextRequest, NextResponse } from 'next/server';

// ==================== TYPES ====================

interface TokenPayload {
  user_id?: string;
  sub?: string;
  email?: string;
  role?: 'customer' | 'provider';
  exp?: number;
  iat?: number;
}

interface AuthResult {
  isAuthenticated: boolean;
  userId?: string;
  role?: 'customer' | 'provider';
  error?: string;
}

// ==================== ROUTE CONFIGURATION ====================

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/',
  '/home',
  '/services',
  '/providers',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/login',
  '/register',
];

/**
 * Public route patterns (regex)
 */
const PUBLIC_PATTERNS = [
  /^\/services\/[^/]+$/, // /services/[category]
  /^\/providers\/[^/]+$/, // /providers/[id]
  /^\/(home)?\/?$/, // / or /home
];

/**
 * Auth routes (redirect to dashboard if already logged in)
 */
const AUTH_ROUTES = ['/login', '/register'];

/**
 * Customer-only routes
 */
const CUSTOMER_ROUTES = ['/dashboard/user'];

/**
 * Provider-only routes
 */
const PROVIDER_ROUTES = ['/dashboard/provider'];

/**
 * Protected API routes requiring authentication
 */
const PROTECTED_API_ROUTES = [
  '/api/bookings/create',
  '/api/bookings/user',
  '/api/bookings/provider',
];

/**
 * Protected API patterns
 */
const PROTECTED_API_PATTERNS = [
  /^\/api\/bookings\/[^/]+$/, // /api/bookings/[id]
];

/**
 * API routes requiring ownership verification (handled in route handlers)
 */
const OWNER_ONLY_API_METHODS = ['PUT', 'DELETE', 'PATCH'];

// ==================== TOKEN VERIFICATION ====================

/**
 * Decode and verify JWT token
 * Note: In production, use Firebase Admin SDK for secure verification
 */
function verifyToken(token: string): AuthResult {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isAuthenticated: false, error: 'Invalid token format' };
    }

    // Decode payload
    const payload: TokenPayload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { isAuthenticated: false, error: 'Token expired' };
    }

    // Check issued at (not in the future)
    if (payload.iat && payload.iat > now + 60) {
      return { isAuthenticated: false, error: 'Invalid token' };
    }

    const userId = payload.user_id || payload.sub;
    if (!userId) {
      return { isAuthenticated: false, error: 'Invalid token payload' };
    }

    return {
      isAuthenticated: true,
      userId,
      role: payload.role,
    };
  } catch (error) {
    return { isAuthenticated: false, error: 'Token verification failed' };
  }
}

/**
 * Extract token from request
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const tokenCookie = request.cookies.get('auth-token')?.value;
  if (tokenCookie) {
    return tokenCookie;
  }

  // Check session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  if (sessionCookie) {
    return sessionCookie;
  }

  return null;
}

// ==================== ROUTE MATCHING ====================

/**
 * Check if path matches any public route
 */
function isPublicRoute(pathname: string): boolean {
  // Check exact matches
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    // Exclude dashboard routes
    if (pathname.startsWith('/dashboard')) {
      return false;
    }
    return true;
  }

  // Check patterns
  return PUBLIC_PATTERNS.some((pattern) => pattern.test(pathname));
}

/**
 * Check if path is an auth route (login/register)
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}`));
}

/**
 * Check if path is a customer-only route
 */
function isCustomerRoute(pathname: string): boolean {
  return CUSTOMER_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if path is a provider-only route
 */
function isProviderRoute(pathname: string): boolean {
  return PROVIDER_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if API route requires authentication
 */
function isProtectedApiRoute(pathname: string, method: string): boolean {
  // Check exact matches
  if (PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return true;
  }

  // Check patterns
  if (PROTECTED_API_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return true;
  }

  // Provider routes - PUT/DELETE require auth
  if (pathname.match(/^\/api\/providers\/[^/]+$/) && OWNER_ONLY_API_METHODS.includes(method)) {
    return true;
  }

  // Provider services routes
  if (pathname.startsWith('/api/providers/services') && OWNER_ONLY_API_METHODS.includes(method)) {
    return true;
  }

  // Provider slots routes
  if (pathname.startsWith('/api/providers/slots') && ['POST', 'DELETE'].includes(method)) {
    return true;
  }

  return false;
}

/**
 * Check if it's a static asset or Next.js internal route
 */
function isStaticOrInternal(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // Files with extensions
  );
}

// ==================== RESPONSE HELPERS ====================

/**
 * Create JSON error response for API routes
 */
function createApiErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      error: status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : 'Error',
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}

/**
 * Create redirect response with return URL
 */
function createRedirectResponse(
  request: NextRequest,
  destination: string,
  includeReturnUrl: boolean = true
): NextResponse {
  const url = new URL(destination, request.url);
  
  if (includeReturnUrl && destination.startsWith('/login')) {
    const returnUrl = request.nextUrl.pathname + request.nextUrl.search;
    if (returnUrl !== '/' && returnUrl !== '/login') {
      url.searchParams.set('redirect', returnUrl);
    }
  }

  return NextResponse.redirect(url);
}

// ==================== MIDDLEWARE FUNCTION ====================

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip static assets and Next.js internals
  if (isStaticOrInternal(pathname)) {
    return NextResponse.next();
  }

  // Get authentication token
  const token = getTokenFromRequest(request);
  const auth = token ? verifyToken(token) : { isAuthenticated: false };

  // ==================== API ROUTE HANDLING ====================

  if (pathname.startsWith('/api')) {
    // Public API routes
    if (!isProtectedApiRoute(pathname, method)) {
      return NextResponse.next();
    }

    // Protected API routes require authentication
    if (!auth.isAuthenticated) {
      return createApiErrorResponse('Authentication required', 401);
    }

    // Add user info to request headers for route handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', auth.userId || '');
    requestHeaders.set('x-user-role', auth.role || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // ==================== PAGE ROUTE HANDLING ====================

  // Public routes - allow access
  if (isPublicRoute(pathname) && !isAuthRoute(pathname)) {
    return NextResponse.next();
  }

  // Auth routes (login/register) - redirect to dashboard if already logged in
  if (isAuthRoute(pathname)) {
    if (auth.isAuthenticated) {
      // Redirect based on role
      const dashboardPath = auth.role === 'provider' 
        ? '/dashboard/provider' 
        : '/dashboard/user';
      return createRedirectResponse(request, dashboardPath, false);
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!auth.isAuthenticated) {
    // Redirect to login with return URL
    return createRedirectResponse(request, '/login', true);
  }

  // Customer-only routes
  if (isCustomerRoute(pathname)) {
    if (auth.role === 'provider') {
      // Redirect providers to their dashboard
      return createRedirectResponse(request, '/dashboard/provider', false);
    }
    return NextResponse.next();
  }

  // Provider-only routes
  if (isProviderRoute(pathname)) {
    if (auth.role !== 'provider') {
      // Redirect customers to their dashboard
      return createRedirectResponse(request, '/dashboard/user', false);
    }
    return NextResponse.next();
  }

  // Default: allow access
  return NextResponse.next();
}

// ==================== MIDDLEWARE CONFIG ====================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

