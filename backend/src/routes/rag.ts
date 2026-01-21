/**
 * RAG Routes
 *
 * API endpoints for semantic search, force retrieval, and knowledge ingestion
 */

import { Hono } from 'hono';
import { supabase } from '../config/database';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth';
import { rateLimitGeneral } from '../middleware/ratelimit';
import { validateBody, validateQuery } from '../middleware/validation';
import { createRAGService } from '../services/rag.service';
import {
  ragQueryRequestSchema,
  getForcesQuerySchema,
  getConnectionsQuerySchema,
  ingestKnowledgeRequestSchema
} from '@compilar/shared/schemas';

const rag = new Hono();
const ragService = createRAGService(supabase);

/**
 * POST /api/v1/rag/query
 * Semantic search over PILAR knowledge base
 */
rag.post('/query', optionalAuth, rateLimitGeneral, validateBody(ragQueryRequestSchema), async (c) => {
  const user = c.get('user');
  const { query, pillar, mode, category, limit } = c.get('validatedBody');

  try {
    const results = await ragService.semanticSearch(
      query,
      {
        pillar,
        mode,
        category,
        limit
      },
      {
        userId: user?.id,
        feature: 'rag_query'
      }
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
rag.get('/forces/:pillar', optionalAuth, validateQuery(getForcesQuerySchema), async (c) => {
  const _user = c.get('user');
  const pillar = c.req.param('pillar');
  const validatedQuery = c.get('validatedQuery') as { mode?: string };

  // Mode is required for this endpoint
  if (!validatedQuery.mode) {
    return c.json({ error: 'mode query parameter is required' }, 400);
  }

  try {
    const forces = await ragService.getForces(pillar, validatedQuery.mode);

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
rag.get('/connections', optionalAuth, validateQuery(getConnectionsQuerySchema), async (c) => {
  const user = c.get('user');
  const { mode } = c.get('validatedQuery');

  try {
    const connections = await ragService.getConnections(mode);

    return c.json({ connections });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /api/v1/rag/ingest
 * Ingest new knowledge into the RAG system (admin only)
 */
rag.post('/ingest', requireAuth, requireAdmin, rateLimitGeneral, validateBody(ingestKnowledgeRequestSchema), async (c) => {
  const user = c.get('user');
  const { content, metadata } = c.get('validatedBody');

  try {
    await ragService.ingestKnowledge(
      content,
      {
        ...metadata,
        created_by: user.id,
        created_at: new Date().toISOString()
      },
    );

    return c.json({ success: true, message: 'Knowledge ingested successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export { rag };
