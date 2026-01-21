/**
 * Test Server - Minimal Backend for Integration Tests
 *
 * This server includes all routes but uses stub implementations for LLM features
 * to avoid dependency issues during testing
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { createClient } from '@supabase/supabase-js';
import { assessments } from './routes/assessments';
import { blog } from './routes/blog';
import { entities } from './routes/entities';
import { ai } from './routes/ai-stub';
import { rag } from './routes/rag-stub';
import { users } from './routes/users';
import { teams } from './routes/teams';
import { analytics } from './routes/analytics';
import { content } from './routes/content';
import { requireAuth } from './middleware/auth';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required Supabase environment variables');
  process.exit(1);
}

console.log('✅ Test Server Configuration:');
console.log('   Mode: Integration Testing');
console.log('   LLM Features: Stubbed');
console.log('');

// Initialize Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

// Initialize Hono app
const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());
app.use('*', prettyJSON());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
const api = new Hono();

// Auth routes
api.get('/auth/me', requireAuth, async (c) => {
  const user = c.get('user');
  return c.json({ user });
});

// Mount route modules
api.route('/assessments', assessments);
api.route('/blog', blog);
api.route('/entities', entities);
api.route('/ai', ai);
api.route('/rag', rag);
api.route('/users', users);
api.route('/teams', teams);
api.route('/analytics', analytics);
api.route('/content', content);

// Mount API routes
app.route('/api/v1', api);

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Simple error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

export default {
  port: process.env.PORT || 3001,
  fetch: app.fetch,
};
