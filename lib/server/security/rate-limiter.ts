import { RedisService } from '../redis/redis-client';
import { ApiError } from '../errors/api-error';
import { Logger } from '../logging/logger';

export type RateLimitCategory = 'AUTH' | 'PAYMENT' | 'EXPENSIVE' | 'API';

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  /** If true, reject requests when Redis is unavailable (security-critical endpoints) */
  failClosed: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number | null;
}

/**
 * Production Redis-backed Sliding Window Rate Limiter
 *
 * Uses Redis sorted sets (ZADD + ZREMRANGEBYSCORE + ZCARD) inside a
 * MULTI/EXEC pipeline for atomic sliding-window enforcement.
 *
 * Works consistently across multiple application instances because
 * all state lives in Redis, not in-process memory.
 */
export class RateLimiter {
  private static categoryConfigs: Record<RateLimitCategory, RateLimitConfig> = {
    AUTH:      { maxRequests: 5,   windowSeconds: 900, failClosed: true },   // 5 req per 15 min
    PAYMENT:   { maxRequests: 10,  windowSeconds: 60,  failClosed: true },   // 10 req per min
    EXPENSIVE: { maxRequests: 10,  windowSeconds: 60,  failClosed: false },  // 10 req per min
    API:       { maxRequests: 100, windowSeconds: 60,  failClosed: false },  // 100 req per min
  };

  /**
   * Checks whether the identifier is within its rate limit for the given category.
   * Uses a Redis sorted-set sliding window for distributed, atomic enforcement.
   */
  static async check(identifier: string, category: RateLimitCategory = 'API'): Promise<RateLimitResult> {
    const config = this.categoryConfigs[category];
    const key = `medibill:ratelimit:${category}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowSeconds * 1000;

    try {
      const redis = RedisService.getClient();
      const pipeline = redis.multi();

      // Remove entries outside the current window
      pipeline.zremrangebyscore(key, '-inf', windowStart);
      // Add current request with timestamp as score
      pipeline.zadd(key, now, `${now}:${Math.random().toString(36).substring(2, 8)}`);
      // Count entries in current window
      pipeline.zcard(key);
      // Set key expiry to auto-cleanup
      pipeline.expire(key, config.windowSeconds);

      const results = await pipeline.exec();

      if (!results) {
        throw new Error('Redis pipeline returned null');
      }

      // results[2] is [err, count] for ZCARD
      const currentCount = (results[2]?.[1] as number) || 0;
      const remaining = Math.max(0, config.maxRequests - currentCount);
      const resetTime = Math.floor((now + config.windowSeconds * 1000) / 1000);

      if (currentCount > config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter: config.windowSeconds,
        };
      }

      return {
        allowed: true,
        remaining,
        resetTime,
        retryAfter: null,
      };
    } catch (err) {
      Logger.error(`[RATE_LIMIT] Redis error for ${category}:${identifier}`, err);

      if (config.failClosed) {
        // Security-critical endpoints: deny on Redis failure
        return {
          allowed: false,
          remaining: 0,
          resetTime: Math.floor(Date.now() / 1000) + 60,
          retryAfter: 60,
        };
      }

      // Non-critical endpoints: allow on Redis failure (fail-open)
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: Math.floor(Date.now() / 1000) + config.windowSeconds,
        retryAfter: null,
      };
    }
  }

  /**
   * Convenience: check + throw ApiError if rate limited.
   * Used inside API route handlers.
   */
  static async enforce(identifier: string, category: RateLimitCategory = 'API'): Promise<RateLimitResult> {
    const result = await this.check(identifier, category);

    if (!result.allowed) {
      throw ApiError.rateLimitExceeded(
        `Rate limit exceeded. Maximum ${this.categoryConfigs[category].maxRequests} requests per ${this.categoryConfigs[category].windowSeconds}s allowed. Try again later.`
      );
    }

    return result;
  }
}
