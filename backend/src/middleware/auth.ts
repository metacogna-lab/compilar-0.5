/**
 * Authentication Middleware
 *
 * Supabase-compatible authentication middleware for Hono
 * Supports required, optional, and admin-only authentication
 */

import { Context, Next } from 'hono';
import { supabase } from '../index';

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
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
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
    const { data: { user } } = await supabase.auth.getUser(token);

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
