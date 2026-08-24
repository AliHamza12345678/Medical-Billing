import { NextRequest } from 'next/server';
import { RateLimiter, RateLimitCategory, RateLimitResult } from './rate-limiter';
import { ApiError } from '../errors/api-error';

/**
 * Extracts client identifier from NextRequest for rate limiting.
 * Combines IP address with user ID if authenticated session is present.
 */
export function getClientIdentifier(req: NextRequest, userId?: string): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  return userId ? `user:${userId}:ip:${ip}` : `ip:${ip}`;
}

/**
 * Enforces rate limits inside Next.js API route handlers.
 * Throws ApiError.rateLimitExceeded on violation.
 */
export async function enforceRateLimit(
  req: NextRequest,
  category: RateLimitCategory = 'API',
  userId?: string
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(req, userId);
  return await RateLimiter.enforce(identifier, category);
}
