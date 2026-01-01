import { Hono } from 'hono';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth';
import { rateLimitGeneral } from '../middleware/ratelimit';

const rag = new Hono();

rag.post('/query', optionalAuth, rateLimitGeneral, async (c) => {
  const body = await c.req.json();
  const { query } = body;
  if (!query) {
    return c.json({ error: 'query is required' }, 400);
  }
  return c.json({ results: [] }, 200);
});

rag.get('/forces/:pillar', optionalAuth, async (c) => {
  const mode = c.req.query('mode');
  if (!mode || !['egalitarian', 'hierarchical'].includes(mode)) {
    return c.json({ error: 'mode must be egalitarian or hierarchical' }, 400);
  }
  return c.json({ forces: [] }, 200);
});

rag.get('/connections', optionalAuth, async (c) => {
  const mode = c.req.query('mode');
  if (!mode || !['egalitarian', 'hierarchical'].includes(mode)) {
    return c.json({ error: 'mode must be egalitarian or hierarchical' }, 400);
  }
  return c.json({ connections: [] }, 200);
});

rag.post('/ingest', requireAuth, requireAdmin, rateLimitGeneral, async (c) => {
  const body = await c.req.json();
  const { content } = body;
  if (!content) {
    return c.json({ error: 'content is required' }, 400);
  }
  return c.json({ success: true, message: 'Knowledge ingestion (stub)' }, 503);
});

export { rag };
