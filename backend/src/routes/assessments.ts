/**
 * Assessment Routes
 *
 * API endpoints for PILAR assessment CRUD operations
 */

import { Hono } from 'hono';
import { supabase } from '../index';
import { requireAuth } from '../middleware/auth';
import { rateLimitGeneral } from '../middleware/ratelimit';
import { createAssessmentService } from '../services/assessment.service';

const assessments = new Hono();
const assessmentService = createAssessmentService(supabase);

/**
 * GET /api/v1/assessments
 * List user's assessments (sorted by most recent)
 */
assessments.get('/', requireAuth, async (c) => {
  const user = c.get('user');

  const { data, error } = await supabase
    .from('pilar_assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ assessments: data });
});

/**
 * POST /api/v1/assessments
 * Create new assessment
 */
assessments.post('/', requireAuth, rateLimitGeneral, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { pillar_id, mode } = body;

  if (!pillar_id || !mode) {
    return c.json({ error: 'pillar_id and mode are required' }, 400);
  }

  try {
    const assessment = await assessmentService.createAssessment(
      user.id,
      pillar_id,
      mode
    );

    return c.json({ assessment }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/v1/assessments/:id
 * Get specific assessment
 */
assessments.get('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const { data, error } = await supabase
    .from('pilar_assessments')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return c.json({ error: 'Assessment not found' }, 404);
    }
    return c.json({ error: error.message }, 500);
  }

  return c.json({ assessment: data });
});

/**
 * POST /api/v1/assessments/:id/answers
 * Submit an answer to a quiz question
 */
assessments.post('/:id/answers', requireAuth, rateLimitGeneral, async (c) => {
  const user = c.get('user');
  const assessmentId = c.req.param('id');
  const body = await c.req.json();
  const { question_id, answer } = body;

  if (!question_id || answer === undefined) {
    return c.json({ error: 'question_id and answer are required' }, 400);
  }

  try {
    await assessmentService.submitAnswer(assessmentId, question_id, answer);

    return c.json({ success: true, message: 'Answer submitted successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /api/v1/assessments/:id/complete
 * Complete assessment and generate final results
 */
assessments.post('/:id/complete', requireAuth, rateLimitGeneral, async (c) => {
  const user = c.get('user');
  const assessmentId = c.req.param('id');

  try {
    const result = await assessmentService.completeAssessment(assessmentId);

    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * DELETE /api/v1/assessments/:id
 * Delete an assessment
 */
assessments.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  // Verify ownership before deletion
  const { data: assessment, error: fetchError } = await supabase
    .from('pilar_assessments')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return c.json({ error: 'Assessment not found' }, 404);
    }
    return c.json({ error: fetchError.message }, 500);
  }

  if (assessment.user_id !== user.id) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const { error } = await supabase
    .from('pilar_assessments')
    .delete()
    .eq('id', id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true, message: 'Assessment deleted successfully' });
});

export { assessments };