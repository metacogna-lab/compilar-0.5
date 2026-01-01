import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { rateLimitAI } from '../middleware/ratelimit';

const ai = new Hono();

ai.post('/coaching', requireAuth, rateLimitAI, async (c) => {
  const body = await c.req.json();
  const { assessmentId, pillar, mode } = body;
  if (!assessmentId || !pillar || !mode) {
    return c.json({ error: 'assessmentId, pillar, and mode are required' }, 400);
  }
  return c.json({ stub: true, message: 'Coaching endpoint (LLM not initialized)' }, 503);
});

ai.post('/chat', requireAuth, rateLimitAI, async (c) => {
  const body = await c.req.json();
  const { message } = body;
  if (!message) {
    return c.json({ error: 'message is required' }, 400);
  }
  return c.json({ stub: true, message: 'Chat endpoint (LLM not initialized)' }, 503);
});

ai.post('/guidance', requireAuth, rateLimitAI, async (c) => {
  return c.json({ stub: true, guidance: 'Guidance endpoint (LLM not initialized)' }, 503);
});

ai.post('/quiz-questions', requireAuth, rateLimitAI, async (c) => {
  const body = await c.req.json();
  const { pillar, mode } = body;
  if (!pillar || !mode) {
    return c.json({ error: 'pillar and mode are required' }, 400);
  }
  return c.json({ stub: true, questions: [] }, 503);
});

ai.post('/analyze-content', requireAuth, rateLimitAI, async (c) => {
  const body = await c.req.json();
  const { content } = body;
  if (!content) {
    return c.json({ error: 'content is required' }, 400);
  }
  return c.json({ stub: true, analysis: {} }, 503);
});

export { ai };
