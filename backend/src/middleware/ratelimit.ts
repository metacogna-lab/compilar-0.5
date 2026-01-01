/**
 * Rate Limiting Middleware
 *
 * In-memory rate limiter for protecting API endpoints
 * NOTE: For production, replace with Redis-backed implementation
 */

import { Context, Next } from 'hono';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store (replace with Redis in production)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup expired records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (c: Context) => string;
}

/**
 * Create a rate limiter middleware
 *
 * @param options - Rate limiter configuration
 * @returns Hono middleware function
 */
export const createRateLimiter = (options: RateLimiterOptions) => {
  return async (c: Context, next: Next) => {
    // Generate rate limit key (user ID, IP address, etc.)
    const key = options.keyGenerator
      ? options.keyGenerator(c)
      : c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown';

    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (record && record.resetAt > now) {
      // Window is still active
      if (record.count >= options.max) {
        return c.json({
          error: options.message || 'Too many requests, please try again later',
          retryAfter: Math.ceil((record.resetAt - now) / 1000)
        }, 429);
      }
      record.count++;
    } else {
      // Create new window
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + options.windowMs
      });
    }

    // Add rate limit headers
    const currentRecord = rateLimitStore.get(key)!;
    c.header('X-RateLimit-Limit', options.max.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, options.max - currentRecord.count).toString());
    c.header('X-RateLimit-Reset', new Date(currentRecord.resetAt).toISOString());

    await next();
  };
};

/**
 * Rate limiter for AI endpoints
 * 50 requests per 15 minutes per user
 */
export const rateLimitAI = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many AI requests. Please try again later.',
  keyGenerator: (c) => {
    const user = c.get('user');
    return user?.id || c.req.header('x-forwarded-for') || 'unknown';
  }
});

/**
 * Rate limiter for general API endpoints
 * 100 requests per minute per IP
 */
export const rateLimitGeneral = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests. Please slow down.'
});

/**
 * Rate limiter for authentication endpoints
 * 10 requests per 15 minutes per IP (prevent brute force)
 */
export const rateLimitAuth = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts. Please try again later.'
});
