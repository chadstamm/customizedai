import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_REQUESTS = 10;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 60 seconds
let lastCleanup = Date.now();
function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < RATE_LIMIT_WINDOW_MS) return;
  lastCleanup = now;
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

const ALLOWED_ORIGINS = [
  'https://customizedai.app',
  'https://www.customizedai.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

function isAllowedOrigin(origin: string | null, referer: string | null): boolean {
  // Allow requests with no origin/referer (e.g., server-side, curl in dev)
  if (!origin && !referer) return true;

  if (origin) {
    if (ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))) return true;
    if (origin.includes('localhost')) return true;
    // Allow Vercel preview deployments
    if (origin.includes('.vercel.app')) return true;
  }

  if (referer) {
    if (ALLOWED_ORIGINS.some((allowed) => referer.startsWith(allowed))) return true;
    if (referer.includes('localhost')) return true;
    if (referer.includes('.vercel.app')) return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect API routes
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  // Check origin/referer
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (!isAllowedOrigin(origin, referer)) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Rate limiting by IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  cleanupExpiredEntries();

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count++;
    if (entry.count > MAX_REQUESTS) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
