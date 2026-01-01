/**
 * RAG Routes
 *
 * API endpoints for semantic search, force retrieval, and knowledge ingestion
 */

import { Hono } from 'hono';
import { supabase } from '../index';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth';
import { rateLimitGeneral } from '../middleware/ratelimit';
import { createRAGService } from '../services/rag.service';

const rag = new Hono();
const ragService = createRAGService(supabase);

/**
 * POST /api/v1/rag/query
 * Semantic search over PILAR knowledge base
 */
rag.post('/query', optionalAuth, rateLimitGeneral, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { query, pillar, mode, category, limit = 5 } = body;

  if (!query) {
    return c.json({ error: 'query is required' }, 400);
  }

  try {
    const results = await ragService.semanticSearch(
      query,
      {
        pillar,
        mode,
        category,
        limit
      },
      user?.id
    );

    return c.json({ results });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/v1/rag/forces/:pillar
 * Get psychological forces for a specific pillar and mode
 * Query params: mode (egalitarian | hierarchical)
 */
rag.get('/forces/:pillar', optionalAuth, async (c) => {
  const user = c.get('user');
  const pillar = c.req.param('pillar');
  const mode = c.req.query('mode');

  if (!pillar) {
    return c.json({ error: 'pillar is required' }, 400);
  }

  if (!mode || !['egalitarian', 'hierarchical'].includes(mode)) {
    return c.json({ error: 'mode must be egalitarian or hierarchical' }, 400);
  }

  try {
    const forces = await ragService.getForces(pillar, mode, user?.id);

    return c.json({ forces });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/v1/rag/connections
 * Get force connections for a specific mode
 * Query params: mode (egalitarian | hierarchical)
 */
rag.get('/connections', optionalAuth, async (c) => {
  const user = c.get('user');
  const mode = c.req.query('mode');

  if (!mode || !['egalitarian', 'hierarchical'].includes(mode)) {
    return c.json({ error: 'mode must be egalitarian or hierarchical' }, 400);
  }

  try {
    const connections = await ragService.getConnections(mode, user?.id);

    return c.json({ connections });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /api/v1/rag/ingest
 * Ingest new knowledge into the RAG system (admin only)
 */
rag.post('/ingest', requireAuth, requireAdmin, rateLimitGeneral, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { content, metadata } = body;

  if (!content) {
    return c.json({ error: 'content is required' }, 400);
  }

  try {
    await ragService.ingestKnowledge(
      content,
      {
        ...metadata,
        created_by: user.id,
        created_at: new Date().toISOString()
      },
      user.id
    );

    return c.json({ success: true, message: 'Knowledge ingested successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export { rag };
