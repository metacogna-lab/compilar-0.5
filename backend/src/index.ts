import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { assessments } from './routes/assessments'
import { blog } from './routes/blog'
import { entities } from './routes/entities'
import { ai } from './routes/ai'
import { rag } from './routes/rag'
import { users } from './routes/users'
import { teams } from './routes/teams'
import { analytics } from './routes/analytics'
import { content } from './routes/content'
import { functions } from './routes/functions'
import { requireAuth } from './middleware/auth'
import { errorHandler } from './middleware/error'

// Environment variables with validation
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'anthropic'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY

// Validate LLM provider configuration
if (LLM_PROVIDER === 'openai' && !OPENAI_API_KEY) {
  console.error('❌ LLM_PROVIDER is set to "openai" but OPENAI_API_KEY is missing')
  process.exit(1)
}
if (LLM_PROVIDER === 'anthropic' && !ANTHROPIC_API_KEY) {
  console.error('❌ LLM_PROVIDER is set to "anthropic" but ANTHROPIC_API_KEY is missing')
  process.exit(1)
}

// Log configuration status
console.log('✅ Backend Configuration:')
console.log('   LLM Provider:', LLM_PROVIDER)
console.log('   OpenAI API Key:', OPENAI_API_KEY ? '✅ Set' : '❌ Not set')
console.log('   Anthropic API Key:', ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set')
console.log('   Langsmith API Key:', LANGSMITH_API_KEY ? '✅ Set' : '⚠️  Optional')
console.log('')

// Initialize Hono app
const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger())
app.use('*', prettyJSON())

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// API Routes
const api = new Hono()

// Auth routes
api.get('/auth/me', requireAuth, async (c) => {
  const user = c.get('user')
  return c.json({ user })
})

// Mount route modules
api.route('/assessments', assessments)
api.route('/blog', blog)
api.route('/entities', entities)
api.route('/ai', ai)
api.route('/rag', rag)
api.route('/users', users)
api.route('/teams', teams)
api.route('/analytics', analytics)
api.route('/content', content)
api.route('/functions', functions)

// Mount API routes
app.route('/api/v1', api)

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Global error handler with Langsmith integration
app.onError(errorHandler)

export default {
  port: process.env.PORT || 3001,
  fetch: app.fetch,
}