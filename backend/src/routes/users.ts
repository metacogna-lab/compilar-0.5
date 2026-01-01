/**
 * User Routes
 *
 * API endpoints for user profile management, assessment history, and progress tracking
 */

import { Hono } from 'hono';
import { supabase } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { rateLimitGeneral } from '../middleware/ratelimit';

const users = new Hono();

/**
 * GET /api/v1/users/profile
 * Get current user's profile
 */
users.get('/profile', requireAuth, async (c) => {
  const user = c.get('user');

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Profile doesn't exist yet, return minimal data from auth user
      return c.json({
        profile: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        }
      });
    }
    return c.json({ error: error.message }, 500);
  }

  return c.json({ profile: data });
});

/**
 * PUT /api/v1/users/profile
 * Update current user's profile
 */
users.put('/profile', requireAuth, rateLimitGeneral, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  // Allowed profile fields for update
  const allowedFields = [
    'display_name',
    'avatar_url',
    'bio',
    'preferred_mode',
    'preferences',
    'metadata'
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

  // Check if profile exists
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  let data, error;

  if (existing) {
    // Update existing profile
    ({ data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single());
  } else {
    // Create new profile
    ({ data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        ...updates
      })
      .select()
      .single());
  }

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ profile: data });
});

/**
 * GET /api/v1/users/history
 * Get user's assessment history with pagination
 */
users.get('/history', requireAuth, async (c) => {
  const user = c.get('user');
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  // Get assessments
  const { data: assessments, error: assessmentError } = await supabase
    .from('pilar_assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (assessmentError) {
    return c.json({ error: assessmentError.message }, 500);
  }

  // Get total count
  const { count, error: countError } = await supabase
    .from('pilar_assessments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (countError) {
    return c.json({ error: countError.message }, 500);
  }

  return c.json({
    history: assessments,
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0)
    }
  });
});

/**
 * GET /api/v1/users/progress
 * Get user's progress and gamification data
 */
users.get('/progress', requireAuth, async (c) => {
  const user = c.get('user');

  // Get user progress data
  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (progressError && progressError.code !== 'PGRST116') {
    return c.json({ error: progressError.message }, 500);
  }

  // Get assessment stats
  const { data: assessments, error: statsError } = await supabase
    .from('pilar_assessments')
    .select('pillar_id, mode, scores, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (statsError) {
    return c.json({ error: statsError.message }, 500);
  }

  // Calculate statistics
  const totalAssessments = assessments?.length || 0;
  const pillarsCovered = new Set(assessments?.map(a => a.pillar_id) || []).size;
  const modesCovered = new Set(assessments?.map(a => a.mode) || []).size;

  // Calculate average scores by pillar
  const scoresByPillar: Record<string, number[]> = {};
  assessments?.forEach(a => {
    if (!scoresByPillar[a.pillar_id]) {
      scoresByPillar[a.pillar_id] = [];
    }
    const avgScore = a.scores && Object.values(a.scores).length > 0
      ? Object.values(a.scores).reduce((sum: number, score: any) => sum + (typeof score === 'number' ? score : 0), 0) / Object.values(a.scores).length
      : 0;
    scoresByPillar[a.pillar_id].push(avgScore);
  });

  const pillarAverages: Record<string, number> = {};
  for (const [pillar, scores] of Object.entries(scoresByPillar)) {
    pillarAverages[pillar] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  return c.json({
    progress: progress || {
      user_id: user.id,
      level: 1,
      xp: 0,
      badges: [],
      achievements: []
    },
    stats: {
      totalAssessments,
      pillarsCovered,
      modesCovered,
      pillarAverages,
      recentActivity: assessments?.slice(0, 5) || []
    }
  });
});

export { users };
