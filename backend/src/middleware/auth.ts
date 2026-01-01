/**
 * Authentication Middleware
 *
 * Supabase-compatible authentication middleware for Hono
 * Supports required, optional, and admin-only authentication
 * Implements token caching with TTL to reduce Supabase API calls
 */

import { Context, Next } from 'hono';
import { supabase } from '../config/database';
import type { User } from '@supabase/supabase-js';

/**
 * Token cache with TTL
 */
interface CachedUser {
  user: User;
  expiresAt: number;
}

const tokenCache = new Map<string, CachedUser>();
const TOKEN_CACHE_TTL = 60000; // 60 seconds

/**
 * Clean up expired tokens periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [token, cached] of tokenCache.entries()) {
    if (cached.expiresAt < now) {
      tokenCache.delete(token);
    }
  }
}, 30000); // Clean every 30 seconds

/**
 * Get user from cache or Supabase
 */
async function getUserFromToken(token: string): Promise<User | null> {
  // Check cache first
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }

  // Cache miss - fetch from Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    // Remove from cache if exists
    tokenCache.delete(token);
    return null;
  }

  // Cache the result
  tokenCache.set(token, {
    user,
    expiresAt: Date.now() + TOKEN_CACHE_TTL,
  });

  return user;
}

/**
 * Required auth - blocks unauthenticated requests
 *
 * Usage: app.get('/protected', requireAuth, handler)
 */
export const requireAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'No authorization header' }, 401);
  }

  const token = authHeader.substring(7);
  const user = await getUserFromToken(token);

  if (!user) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  // Add user to context for downstream handlers
  c.set('user', user);
  await next();
};

/**
 * Optional auth - allows both authenticated and anonymous requests
 *
 * Usage: app.get('/public', optionalAuth, handler)
 * Check: const user = c.get('user'); if (user) { ... }
 */
export const optionalAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);

    if (user) {
      c.set('user', user);
    }
  }

  await next();
};

/**
 * Admin only - requires user to have admin role
 *
 * Usage: app.get('/admin', requireAuth, requireAdmin, handler)
 * Must be used AFTER requireAuth middleware
 */
export const requireAdmin = async (c: Context, next: Next) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Check user role from user_profiles table
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Failed to fetch user profile:', error);
    return c.json({ error: 'Failed to verify admin access' }, 500);
  }

  if (profile?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  await next();
};

/**
 * Invalidate token cache (for testing or logout)
 */
export function invalidateTokenCache(token?: string): void {
  if (token) {
    tokenCache.delete(token);
  } else {
    tokenCache.clear();
  }
}

/**
 * Get cache statistics (for monitoring)
 */
export function getTokenCacheStats(): { size: number; ttl: number } {
  return {
    size: tokenCache.size,
    ttl: TOKEN_CACHE_TTL,
  };
}
