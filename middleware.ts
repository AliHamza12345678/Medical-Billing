import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/config/env';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestId = req.headers.get('x-correlation-id') || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. Apply Security Headers
  const response = NextResponse.next();
  response.headers.set('x-correlation-id', requestId);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 2. Process API routes only
  if (pathname.startsWith('/api')) {
    // CORS validation
    const origin = req.headers.get('origin');
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

    if (origin && !allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'CORS origin not allowed',
            requestId,
          },
        },
        { status: 403, headers: response.headers }
      );
    }

    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Correlation-ID');
    }

    // Handle OPTIONS Preflight
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
