/**
 * Content Routes
 *
 * API endpoints for CMS content management
 */

import { Hono } from 'hono';
import { supabase } from '../index';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth';
import { rateLimitGeneral } from '../middleware/ratelimit';

const content = new Hono();

/**
 * GET /api/v1/content
 * List CMS content with optional filters
 * Query params: pillar, mode, content_type, status, limit, offset
 */
content.get('/', optionalAuth, async (c) => {
  const pillar = c.req.query('pillar');
  const mode = c.req.query('mode');
  const contentType = c.req.query('content_type');
  const status = c.req.query('status') || 'published';
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  let query = supabase
    .from('cms_content')
    .select('*', { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (pillar) {
    query = query.eq('pillar_id', pillar);
  }

  if (mode) {
    query = query.eq('mode', mode);
  }

  if (contentType) {
    query = query.eq('content_type', contentType);
  }

  const { data, count, error } = await query;

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({
    content: data,
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0)
    }
  });
});

/**
 * POST /api/v1/content
 * Create new CMS content (admin only)
 */
content.post('/', requireAuth, requireAdmin, rateLimitGeneral, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const {
    title,
    content: contentBody,
    content_type,
    pillar_id,
    mode,
    tags,
    metadata,
    status = 'draft'
  } = body;

  if (!title || !contentBody || !content_type) {
    return c.json({ error: 'title, content, and content_type are required' }, 400);
  }

  const { data, error } = await supabase
    .from('cms_content')
    .insert({
      title,
      content: contentBody,
      content_type,
      pillar_id,
      mode,
      tags: tags || [],
      metadata: metadata || {},
      status,
      created_by: user.id
    })
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ content: data }, 201);
});

/**
 * GET /api/v1/content/:id
 * Get specific content item
 */
content.get('/:id', optionalAuth, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  let query = supabase
    .from('cms_content')
    .select('*')
    .eq('id', id);

  // Non-admin users can only see published content
  if (!user) {
    query = query.eq('status', 'published');
  } else {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      query = query.eq('status', 'published');
    }
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return c.json({ error: 'Content not found' }, 404);
    }
    return c.json({ error: error.message }, 500);
  }

  return c.json({ content: data });
});

/**
 * PUT /api/v1/content/:id
 * Update content (admin only)
 */
content.put('/:id', requireAuth, requireAdmin, rateLimitGeneral, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  // Allowed update fields
  const allowedFields = [
    'title',
    'content',
    'content_type',
    'pillar_id',
    'mode',
    'tags',
    'metadata',
    'status'
  ];

  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  const { data, error } = await supabase
    .from('cms_content')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return c.json({ error: 'Content not found' }, 404);
    }
    return c.json({ error: error.message }, 500);
  }

  return c.json({ content: data });
});

/**
 * DELETE /api/v1/content/:id
 * Delete content (admin only)
 */
content.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id');

  const { error } = await supabase
    .from('cms_content')
    .delete()
    .eq('id', id);

  if (error) {
    if (error.code === 'PGRST116') {
      return c.json({ error: 'Content not found' }, 404);
    }
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true, message: 'Content deleted successfully' });
});

export { content };
