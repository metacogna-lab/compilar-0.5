/**
 * Rate Limiting Middleware
 *
 * Production-ready rate limiter with Redis backend for multi-instance deployments
 */

import { Context, Next } from 'hono';
import Redis from 'ioredis';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RedisRateLimitRecord {
  count: number;
  resetAt: string;
}

// Redis client singleton
let redisClient: Redis | null = null;

/**
 * Initialize Redis client
 */
function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(redisUrl);

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis for rate limiting');
    });
  }

  return redisClient;
}

/**
 * Fallback in-memory store for when Redis is unavailable
 */
const fallbackStore = new Map<string, RateLimitRecord>();

// Cleanup expired records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of fallbackStore.entries()) {
    if (record.resetAt < now) {
      fallbackStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (c: Context) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Create a rate limiter middleware
 */
export const createRateLimiter = (options: RateLimiterOptions) => {
  return async (c: Context, next: Next) => {
    const client = getRedisClient();
    const useRedis = client && client.status === 'ready';

    // Generate rate limit key (user ID, IP address, etc.)
    const key = options.keyGenerator
      ? options.keyGenerator(c)
      : c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown';

    const now = Date.now();
    const windowStart = Math.floor(now / options.windowMs) * options.windowMs;
    const windowEnd = windowStart + options.windowMs;

    let record: RateLimitRecord | null = null;

    try {
      if (useRedis) {
        // Redis-based rate limiting
        const redisKey = `ratelimit:${key}:${windowStart}`;
        const existing = await client.get(redisKey);

        if (existing) {
          const parsed: RedisRateLimitRecord = JSON.parse(existing);
          record = {
            count: parsed.count,
            resetAt: new Date(parsed.resetAt).getTime()
          };
        } else {
          record = { count: 0, resetAt: windowEnd };
        }

        // Check if window is still active
        if (record.resetAt > now) {
          if (record.count >= options.max) {
            return c.json({
              error: options.message || 'Too many requests, please try again later',
              retryAfter: Math.ceil((record.resetAt - now) / 1000)
            }, 429);
          }
          record.count++;
        } else {
          // New window
          record = { count: 1, resetAt: windowEnd };
        }

        // Store updated record
        await client.setex(redisKey, Math.ceil((windowEnd - now) / 1000), JSON.stringify({
          count: record.count,
          resetAt: new Date(record.resetAt).toISOString()
        }));

      } else {
        // Fallback to in-memory (single instance only)
        console.warn('Redis unavailable, using in-memory rate limiting');
        record = fallbackStore.get(key) || null;

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
          record = {
            count: 1,
            resetAt: windowEnd
          };
        }

        fallbackStore.set(key, record);
      }

      // Add rate limit headers
      const currentRecord = record;
      c.header('X-RateLimit-Limit', options.max.toString());
      c.header('X-RateLimit-Remaining', Math.max(0, options.max - currentRecord.count).toString());
      c.header('X-RateLimit-Reset', new Date(currentRecord.resetAt).toISOString());

      await next();

    } catch (error) {
      console.error('Rate limiting error:', error);

      // On Redis errors, fall back to in-memory
      if (useRedis) {
        console.warn('Redis error, falling back to in-memory rate limiting');
        return createRateLimiter(options)(c, next);
      }

      // If everything fails, allow the request
      console.warn('Rate limiting completely failed, allowing request');
      await next();
    }
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

/**
 * Rate limiter for file uploads
 * 20 uploads per hour per user
 */
export const rateLimitUploads = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many file uploads. Please try again later.',
  keyGenerator: (c) => {
    const user = c.get('user');
    return `upload:${user?.id || c.req.header('x-forwarded-for') || 'unknown'}`;
  }
});

/**
 * Graceful shutdown for Redis
 */
export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};