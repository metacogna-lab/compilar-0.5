# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Compilar v0.5** is a group dynamics assessment and learning platform based on the **PILAR Framework** (Prospects, Involved, Liked, Agency, Respect). Built with React, TypeScript, and Supabase, the application helps users assess group coordination across two fundamental modes of operation: **Egalitarian** and **Hierarchical**. Each mode has 5 distinct pillars, and each pillar is driven by 4 psychological forces that shape team dynamics and performance.

**Migration Status**: ✅ **COMPLETED** - Migrated from Base44 SDK to Supabase (Jan 2025)

**Tech Stack:**
- **Frontend**: React 18, Vite, TypeScript/JSX
- **Backend**: Bun runtime, Hono v4 framework, TypeScript
- **Database**: Supabase (PostgreSQL + pgvector for RAG)
- **Auth**: Supabase Auth with JWT tokens
- **UI**: Tailwind CSS, shadcn/ui (New York style), Framer Motion
- **State**: Zustand with persistence, React Query for server state
- **AI/LLM**: Multi-provider (OpenAI/Anthropic) with automatic fallback
- **Observability**: Langsmith for LLM tracing
- **Icons**: Lucide React

## Development Commands

**Always use `bun` as the package manager** (per user's global instructions).

### Frontend Development

```bash
# Install dependencies
bun install

# Development server (http://localhost:5173)
bun run dev

# Production build
bun run build

# Preview production build
bun run preview

# Linting
bun run lint
```

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Install dependencies
bun install

# Setup environment variables
bun run setup-env

# Development server with hot reload (http://localhost:3001)
bun run dev

# Production build
bun run build

# Start production server
bun run start

# Verify setup and health
bun run verify-setup
bun run test-health

# Run integration tests
bun run test:integration

# Database type generation (requires SUPABASE_PROJECT_ID)
bun run db:generate

# Database operations
bun run db:push    # Push migrations
bun run db:reset   # Reset and seed database
```

### Running Full Stack

```bash
# Terminal 1 - Backend
cd backend && bun run dev

# Terminal 2 - Frontend
bun run dev
```

**Development URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Backend Health Check: http://localhost:3001/health

## Architecture Overview

### Backend API Architecture (Hono + Bun)

**Server Configuration** (`backend/src/index.ts`):
- **Framework**: Hono v4.0 (lightweight, edge-optimized)
- **Runtime**: Bun (native TypeScript support, hot reload)
- **Port**: 3001 (configurable via `PORT` env var)
- **Middleware Stack**:
  - CORS (configurable origins)
  - Logging (Hono logger)
  - Pretty JSON formatting
  - Global error handler with Langsmith integration

**API Route Structure**:
```
/health                      # Health check endpoint
/api/v1/
├── /auth/me                 # User authentication
├── /assessments/*           # Assessment CRUD operations
├── /blog/*                  # Blog operations
├── /entities/*              # Generic entity CRUD (27 entities)
├── /ai/*                    # AI coaching & chat (streaming)
│   ├── /coaching            # Personalized coaching
│   ├── /chat                # Conversational AI coach
│   ├── /guidance            # Contextual guidance
│   ├── /quiz-questions      # AI-generated quiz questions
│   └── /analyze-content     # PILAR alignment analysis
├── /rag/*                   # RAG semantic search & forces
│   ├── /query               # Vector search (pgvector)
│   ├── /forces/:pillar      # Get psychological forces
│   ├── /connections         # Get force connections
│   └── /ingest              # Admin-only knowledge ingestion
├── /users/*                 # User management
├── /teams/*                 # Team operations
├── /analytics/*             # Analytics endpoints
├── /content/*               # Content management
└── /functions/*             # Base44 compatibility layer
```

**Critical Files:**
- `backend/src/index.ts` - Server initialization and middleware
- `backend/src/routes/*.ts` - API route handlers
- `backend/src/middleware/auth.ts` - JWT authentication via Supabase
- `backend/src/middleware/ratelimit.ts` - Rate limiting (Redis/in-memory)
- `backend/src/services/llm/llm.service.ts` - Multi-provider LLM abstraction
- `backend/src/services/rag.service.ts` - RAG with pgvector
- `backend/src/services/coaching.service.ts` - AI coaching logic
- `backend/src/config/database.ts` - Supabase client configuration

### Multi-Provider LLM Integration

**Architecture**: The backend supports **multiple LLM providers** with automatic fallback.

**Configuration** (`.env`):
```bash
# Primary provider: 'openai' | 'anthropic'
LLM_PROVIDER=anthropic

# Optional fallback provider
LLM_FALLBACK_PROVIDER=openai

# OpenAI API credentials
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-4-turbo-preview
OPENAI_CHAT_FALLBACK_MODEL=gpt-3.5-turbo
OPENAI_EMBED_MODEL=text-embedding-3-small

# Anthropic API credentials
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_CHAT_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_CHAT_FALLBACK_MODEL=claude-3-haiku-20240307

# Langsmith tracing (optional)
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=compilar-v0.5
```

**LLM Service** (`backend/src/services/llm/llm.service.ts`):

```typescript
// Singleton service manages providers
const llmService = LLMService.getInstance();

// Standard chat completion with automatic fallback
const response = await llmService.chat(messages, {
  temperature: 0.7,
  maxTokens: 2048,
  stream: false
});

// Streaming chat completion
for await (const chunk of llmService.stream(messages, options)) {
  // Process chunk
}

// Embeddings (always uses OpenAI, even if Anthropic is primary)
const embedResponse = await llmService.embed(text);
// Returns: { embedding: number[1536] }
```

**Key Features:**
- **Automatic Fallback**: If primary provider fails, automatically tries fallback
- **Langsmith Tracing**: All LLM calls traced with metadata
- **Streaming Support**: Async generators for real-time responses
- **Embedding Always OpenAI**: Anthropic doesn't provide embeddings
- **Error Handling**: Typed errors (rate limit, context length, auth)

**Important Notes:**
- Anthropic requires system messages separate from conversation
- OpenAI and Anthropic have different message formats (handled by providers)
- Circuit breaker exists (`backend/src/services/llm/circuit-breaker.ts`) but **NOT integrated** (known issue)

### RAG (Retrieval-Augmented Generation)

**Technology**: Supabase pgvector for semantic search

**Workflow**:
```typescript
// 1. User query
POST /api/v1/rag/query { query: "leadership styles", pillar: "divsexp", mode: "egalitarian" }

// 2. Generate query embedding
const embedding = await llmService.embed(query);

// 3. Vector similarity search (PostgreSQL RPC function)
const results = await supabase.rpc('match_pilar_knowledge', {
  query_embedding: embedding,
  match_threshold: 0.7,
  match_count: 10,
  filter_pillar: 'divsexp',
  filter_mode: 'egalitarian'
});

// 4. Returns ranked results
// [{ id, content, metadata, similarity }]
```

**Database Requirements:**
- PostgreSQL extension: `pgvector`
- Table: `pilar_knowledge_vector` with `embedding vector(1536)` column
- RPC function: `match_pilar_knowledge(...)` for similarity search
- Indexes: GIN index on `metadata` JSONB, ivfflat index on `embedding`

**Key Files:**
- `backend/src/services/rag.service.ts` - RAG implementation
- `backend/src/routes/rag.ts` - RAG API endpoints
- `backend/supabase/migrations/` - Database schema with pgvector

### Frontend-Backend Integration

**Dual-Layer Compatibility Architecture** (during migration):

```
Frontend Component
    ↓
Base44 Client (compatibility layer)
    ↓
Migration Layer (feature flags)
    ↓
    ├─→ Supabase Entities (new)
    └─→ REST Client (REST API)
         ↓
    Backend Hono Routes
         ↓
    Supabase Database
```

**Key Integration Files:**

1. **`src/api/supabaseEntities.js`**:
   - Mimics Base44 API interface for backward compatibility
   - Wraps REST API calls to backend
   - Methods: `.list()`, `.filter()`, `.create()`, `.update()`, `.delete()`

2. **`src/api/restClient.js`**:
   - Comprehensive REST client with JWT token management
   - Request/response interceptors
   - Automatic token refresh via Supabase auth

3. **`src/api/migrationCompat.js`**:
   - Feature flags for gradual migration
   - Proxy wrappers for seamless transition
   - Migration utilities and status tracking

**Authentication Flow**:
```
1. Frontend → Supabase.auth.signInWithPassword(email, password)
2. Supabase → Returns JWT access_token + refresh_token
3. Frontend → Stores tokens in memory
4. API Requests → Authorization: Bearer <access_token>
5. Backend → requireAuth middleware validates token
6. Backend → supabase.auth.getUser(token)
7. Backend → Sets user in Hono context
8. Route Handler → Access user via c.get('user')
```

**Important**: Auth middleware makes external API call to Supabase on **EVERY request** (no token caching - known performance issue).

### State Management Strategy

The application uses **Zustand stores** for client state and **React Query** for server state.

**Current Stores:**
- `useAssessmentStore` - Assessment session state (pillar selection, mode, responses, results)
- `useGameStore` - Gamification state (pillar values, scenarios, persistence)
- `usePageStore` - Page-level UI state

**State Persistence:**
- Zustand persist middleware saves to localStorage (`compilar-save-v1`)
- Use selective subscriptions to prevent re-renders: `useAssessmentStore((state) => state.field)`

**React Query Pattern**:
```jsx
const { data: user } = useQuery({
  queryKey: ['user'],
  queryFn: () => base44.auth.me()
});

const { data: assessments } = useQuery({
  queryKey: ['assessments', user?.id],
  queryFn: () => PilarAssessment.list(),
  enabled: !!user
});

const createMutation = useMutation({
  mutationFn: (data) => PilarAssessment.create(data),
  onSuccess: () => queryClient.invalidateQueries(['assessments'])
});
```

### Routing & Pages

**Routing**: React Router v7 with BrowserRouter (configured in `src/pages/index.jsx`)

**Page Registry**: All pages registered in `PAGES` object with auto-mapped routes:
1. Extracts last URL segment
2. Matches case-insensitively to page names
3. Defaults to first page if no match

**Key Pages:**
- `Assess.jsx` - Core assessment flow (pillar deck → quiz → AI coaching)
- `PilarInfo.jsx` - PILAR theory exploration
- `PilarDefinitions.jsx` - Force explorer and knowledge observatory
- `CMS.jsx` - Content management with AI authoring
- `AdminDashboard.jsx` - Analytics and admin controls
- `Profile.jsx` - User profile and assessment history
- `Teams.jsx` / `StudyGroups.jsx` - Collaborative features

### Component Organization

```
src/
├── components/
│   ├── admin/          # Admin dashboard, analytics widgets
│   ├── assess/         # Assessment flow components (quiz, coaching, chatbot)
│   ├── blog/           # Blog cards, pillar badges
│   ├── cms/            # Content management system components
│   ├── collaboration/  # Study groups, peer feedback
│   ├── game/           # Gamification scenario cards
│   ├── pilar/          # PILAR theory visualizations (graphs, modals, forces)
│   ├── pilarDefinitions/ # Force explorer, observatory, raw data views
│   ├── progress/       # Skill trees, badge charts
│   ├── stores/         # Zustand stores and slices
│   ├── teams/          # Team management components
│   ├── ui/             # shadcn/ui components (40+ components)
│   └── utils/          # Shared utilities
├── pages/              # Route components (27 pages)
├── api/                # API client layer (Base44 compatibility + REST)
├── hooks/              # Custom React hooks
└── lib/                # Utility functions (cn helper)

backend/
├── src/
│   ├── index.ts        # Hono server initialization
│   ├── routes/         # API route handlers
│   ├── middleware/     # Auth, rate limiting, validation
│   ├── services/       # Business logic (LLM, RAG, coaching, assessments)
│   │   ├── llm/        # Multi-provider LLM abstraction
│   │   ├── rag.service.ts
│   │   ├── coaching.service.ts
│   │   └── assessment.service.ts
│   ├── config/         # Database, Langsmith configuration
│   └── types/          # TypeScript types
├── supabase/
│   └── migrations/     # Database schema SQL files
└── tests/
    └── integration/    # API integration tests
```

### Design System

**Theme**: Dark mode with glassmorphic surfaces (see `src/components/admin/DESIGN_GUIDE.md.jsx`)

**Colors:**
- Background: `#0F0F12` (deep space)
- Primary: `#6C4BF4` (purple)
- Pillar Colors (semantic mapping across both modes):
  - **Violet** `#8B5CF6` - Expression pillars (Diverse/Normative)
  - **Pink** `#EC4899` - Reciprocity pillars (Indirect/Direct)
  - **Indigo** `#4F46E5` - Standing pillars (Popularity/Status)
  - **Emerald** `#10B981` - Prospects pillars (Group/Own)
  - **Amber** `#F59E0B` - Respect pillars (Outgoing/Incoming)

**Typography:**
- Font: Inter
- Headings: `text-4xl`, `text-2xl`, `text-xl`, `text-base`
- Body: `text-base` (16px), secondary: `text-sm` (14px)

**UI Library:**
- shadcn/ui (New York style, no prefix)
- Components in `src/components/ui/`
- Add new components: `bunx shadcn-ui@latest add <component>`

## The PILAR Framework

**PILAR** stands for: **Prospects, Involved, Liked, Agency, Respect**

The framework explores two fundamental modes of group coordination:

**1. EGALITARIAN MODE** (Peer-based coordination):
- **Diverse Expression** (DivsExp) - Psychological safety, challenging status quo
- **Indirect Reciprocity** (IndRecip) - Unconditional helping, pay-it-forward culture
- **Popularity** - Being liked, informal influence through relationships
- **Group Prospects** (GrpProsp) - Collective goal success, shared vision
- **Outgoing Respect** (OutResp) - Trusting others' competence and intentions

**2. HIERARCHICAL MODE** (Authority-based coordination):
- **Normative Expression** (NormExp) - Defending status quo, norm enforcement
- **Direct Reciprocity** (DirRecip) - Transactional helping, quid pro quo
- **Status** - Formal hierarchical power, command capacity
- **Own Prospects** (OwnProsp) - Personal advancement, individual success
- **Incoming Respect** (IncResp) - How others perceive your competence

**Forces**: Each pillar has 4 psychological forces (see `forcesData.jsx`) organized into groups:
- **Prospects**: Goal clarity, future confidence, shared vision, incentive alignment
- **Involved**: Help norms, transaction cost, debt & obligation, resource fairness
- **Liked**: Belonging, influence channels, social support, legitimacy
- **Agency**: Voice safety, change capacity, decision speed, norm pressure
- **Respect**: Competence signals, trust signals, learning emulation, credibility loop

**Force Connections**: Forces interact across pillars creating feedback loops. Each mode has 20 named connections stored in `forceConnectionsData.jsx`.

**Pillar IDs by Mode:**
- **Egalitarian**: `divsexp`, `indrecip`, `popularity`, `grpprosp`, `outresp`
- **Hierarchical**: `normexp`, `dirrecip`, `status`, `ownprosp`, `incresp`

### Working with Pillar Data

**Static Data Files:**
- `src/components/pilar/pillarsData.jsx` - Pillar metadata (`pillarsInfo.egalitarian` / `pillarsInfo.hierarchical`)
- `src/components/pilar/forceConnectionsData.jsx` - Inter-pillar force relationships (20 per mode)
- `src/components/pilar/forcesData.jsx` - Psychological force definitions

**Data Adapters:**
- `src/components/assess/assessDataAdapter.jsx` - Transform pillar data for UI
- `src/components/pilar/forceGraphAdapter.jsx` - Format for graph visualizations

**Helper Functions:**
```jsx
import { getPillarData, getPillarForces } from '@/components/assess/assessDataAdapter';
import { pillarsInfo } from '@/components/pilar/pillarsData';

// Get pillar data for a specific mode
const egalitarianPillars = pillarsInfo.egalitarian;
const pillar = getPillarData('divsexp', 'egalitarian');
const forces = getPillarForces('divsexp', 'egalitarian'); // Returns 4 forces
```

## Assessment Pipeline

The assessment flow has distinct stages managed by `useAssessmentStore`:

1. **pillar-selection** - User draws/selects a pillar from the deck
2. **mode-selection** - User selects Egalitarian or Hierarchical mode
3. **quiz-active** - User answers pillar-specific questions (influenced by forces)
4. **results** - Display scores and AI coaching feedback
5. **completed** - Session archived, can restart

**Key Components:**
- `PillarDeck` - Interactive card deck for pillar selection (5 cards per mode)
- `PillarModeVisualizer` - Egalitarian vs Hierarchical comparison interface
- `PillarQuiz` - Dynamic quiz generation integrating pillar forces
- `AICoachingFeedback` - Personalized AI-generated insights
- `PersistentAICoach` - Contextual chatbot throughout the flow

**Backend Flow:**

```typescript
// 1. Create assessment
POST /api/v1/assessments { pillar_id: 'divsexp', mode: 'egalitarian' }
→ Creates record in pilar_assessments table

// 2. Generate quiz questions (AI-powered)
POST /api/v1/ai/quiz-questions { pillar_id: 'divsexp', mode: 'egalitarian', count: 10 }
→ Fetches forces for pillar
→ LLM generates questions based on forces
→ Returns QuizQuestion[] array

// 3. Submit answers (⚠️ RACE CONDITION - see Known Issues)
POST /api/v1/assessments/:id/answers { question_id, answer }
→ Updates assessment_sessions.responses JSONB field

// 4. Complete assessment
POST /api/v1/assessments/:id/complete
→ Calculates results (force scores, pillar score)
→ Generates AI coaching insights
→ Marks completed_at

// 5. Get coaching (streaming)
POST /api/v1/ai/coaching { assessment_id }
→ Streams personalized coaching based on results
```

## Path Aliases

Vite is configured with path aliases:
```js
@/ → src/
@/components → src/components
@/lib → src/lib
@/hooks → src/hooks
@/api → src/api
```

**Example:**
```jsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PilarAssessment } from '@/api/entities';
```

## Environment Variables

### Frontend (.env in root)

Currently uses **hardcoded Base44 app ID** - no environment variables required for frontend.

### Backend (backend/.env)

**Required:**
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# LLM Provider (at least one provider required)
LLM_PROVIDER=anthropic  # 'openai' | 'anthropic'

# OpenAI (required if using OpenAI, or for embeddings even with Anthropic)
OPENAI_API_KEY=sk-your-openai-api-key

# Anthropic (required if using Anthropic as primary)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
```

**Optional:**
```bash
# Fallback LLM provider
LLM_FALLBACK_PROVIDER=openai

# Custom model names
OPENAI_CHAT_MODEL=gpt-4-turbo-preview
OPENAI_CHAT_FALLBACK_MODEL=gpt-3.5-turbo
OPENAI_EMBED_MODEL=text-embedding-3-small
ANTHROPIC_CHAT_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_CHAT_FALLBACK_MODEL=claude-3-haiku-20240307

# Langsmith observability
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=compilar-v0.5

# Redis for production rate limiting
REDIS_URL=redis://localhost:6379

# Server configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Setup:**
```bash
cd backend
bun run setup-env  # Creates .env from .env.example
# Then edit .env with your credentials
bun run verify-setup  # Validates configuration
```

## Known Issues & Bugs

### Critical Issues

**1. Circuit Breaker Not Integrated** (`backend/src/services/llm/circuit-breaker.ts`)

Circuit breaker implementation exists but is **NOT used** by LLM providers.

**Impact**: No protection against cascading LLM failures, could exhaust API quotas during outages.

**Fix**: Wrap LLM calls in circuit breaker:
```typescript
async chat(messages, options, metadata) {
  const breaker = circuitBreakerManager.getBreaker(this.name);
  return breaker.execute(async () => {
    return await this.client.chat.completions.create(...);
  });
}
```

**2. Assessment Answer Race Condition** (`backend/src/services/assessment.service.ts:202-236`)

Answer submission uses read-then-write pattern without transaction:
```typescript
// ❌ Non-atomic operation
const assessment = await supabase.from('assessment_sessions').select('*').single();
const updatedResponses = { ...assessment.responses, [questionId]: answer };
await supabase.from('assessment_sessions').update({ responses: updatedResponses });
```

**Impact**: Concurrent answer submissions could overwrite each other, causing lost updates.

**Fix**: Use PostgreSQL JSONB operators or add optimistic locking with version field.

**3. Token Expiration Check Vulnerability** (`src/api/restClient.js:69-78`)

Uses simple `atob()` without validation:
```typescript
isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < currentTime;
  } catch (error) {
    return true; // ❌ Assumes expired on ANY error
  }
}
```

**Impact**: Malformed tokens cause unnecessary refresh attempts, no distinction between expired vs invalid.

**Fix**: Use `jsonwebtoken` library for proper JWT validation.

**4. RAG Service Missing Error Handling** (`backend/src/services/rag.service.ts:83-94`)

PostgreSQL RPC call has no validation for missing function:
```typescript
const { data, error } = await supabase.rpc('match_pilar_knowledge', { ... });
if (error) throw new Error(`Vector search failed: ${error.message}`);
```

**Missing**:
- Check if RPC function exists
- Validate embedding dimensions match (1536-d)
- Handle `data` being `null` vs empty array

**5. Auth Middleware Performance Issue** (`backend/src/middleware/auth.ts`)

Makes external API call to Supabase on **EVERY request**:
```typescript
export const requireAuth = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token); // ❌ External API call
  if (error || !user) return c.json({ error: 'Unauthorized' }, 401);
  c.set('user', user);
  await next();
};
```

**Impact**: High latency, unnecessary API calls, rate limiting from Supabase.

**Fix**: Implement token caching with short TTL (30-60 seconds).

### Warning-Level Issues

**6. In-Memory Rate Limiting Fallback** (`backend/src/middleware/ratelimit.ts`)

Falls back to in-memory Map when Redis unavailable:
```typescript
// ⚠️ Only works for single-instance deployments
if (!useRedis) {
  console.warn('Redis unavailable, using in-memory rate limiting');
}
```

**Impact**: Multi-instance deployments have independent limits; users could bypass by hitting different instances.

**7. Streaming Error Handling** (`backend/src/routes/ai.ts:165-185`)

Streaming errors sent as inline text, not proper error responses:
```typescript
return stream(c, async (streamWriter) => {
  try {
    // ...
  } catch (error) {
    await streamWriter.write(`\n\nError: ${error.message}`); // ⚠️ Can't distinguish from content
  }
});
```

**Impact**: Frontend can't distinguish errors from actual content, no HTTP status codes.

**Fix**: Use Server-Sent Events (SSE) format with error events.

**8. Hardcoded API Base URL** (`src/api/supabaseEntities.js:17`)

```typescript
this.baseUrl = '/api/v1/entities'; // ❌ Hardcoded
```

**Impact**: Can't configure different backend URLs, breaks in development with different ports.

**9. Zustand Store Anti-Pattern** (`src/components/stores/useAssessmentStore.jsx`)

Actions object mutates but doesn't trigger re-renders:
```typescript
export const useAssessmentStore = create((set) => ({
  actions: {  // ❌ Object reference never changes
    setPipelineStage: (stage) => set({ pipelineStage: stage }),
  }
}));
```

**Fix**: Separate actions from state using custom hooks.

**10. Inconsistent Error Response Format**

Some routes return `{ error: string }`, others use `createApiResponse(null, { code, message })`.

**Fix**: Standardize on `APIResponse` format across all routes.

## Key Constraints

### LLM Integration

- **At least one provider required**: Server exits if no LLM provider configured
- **Embeddings always use OpenAI**: Even if Anthropic is primary (Anthropic doesn't provide embeddings)
- **Langsmith tracing optional**: Leave `LANGSMITH_API_KEY` empty to disable
- **Streaming has no fallback**: Can't retry streaming requests (use non-streaming for critical operations)

### Database

- **Row Level Security (RLS)**: All tables enforce user-based access control
- **pgvector required**: PostgreSQL extension for RAG semantic search
- **JSONB for metadata**: Use JSONB operators for querying structured data
- **Single connection client**: No connection pooling configuration (performance issue)

### State Management

- **Avoid prop drilling**: Use Zustand stores for shared state
- **Selective subscriptions**: Use `(state) => state.field` to prevent re-renders
- **Persist critical state**: Add `persist` middleware for user progress
- **Computed values**: Use selectors or custom hooks, not inline calculations

### Component Guidelines

- Use `motion` from Framer Motion for animations (import from `@/components/config/motion`)
- Apply pillar colors semantically (don't mix pillar colors with UI accents)
- Glassmorphic surfaces use `backdrop-blur-xl` with low opacity backgrounds
- All interactive elements need hover states and focus rings

### Performance

- Memoize expensive calculations with `useMemo`
- Lazy load heavy components (graphs, 3D visualizations)
- Debounce search/filter inputs
- Cache RAG queries (planned in `useRAGStore`)

## Testing Strategy

**Current State**: Basic integration tests in `backend/tests/integration/`

**Test Commands:**
```bash
cd backend

# Run integration tests
bun run test:integration

# Run with test server
bun run test:with-server

# Watch mode
bun run test:watch
```

**Recommended Coverage:**
- Unit tests for stores (Zustand slices)
- Integration tests for assessment pipeline
- Component tests for critical UI (quiz, coaching)
- E2E tests for complete user flows
- LLM provider mocking in tests

## Build & Deployment

### Frontend Build

```bash
bun run build
# Output: dist/ directory (static files)

# Preview production build
bun run preview
```

**Vite Configuration:**
- Path aliases enabled
- JSX in `.js` files supported via `optimizeDeps.esbuildOptions`
- Server allows all hosts (`allowedHosts: true`)

### Backend Build

```bash
cd backend
bun run build
# Output: dist/index.js

# Start production server
bun run start
```

**Production Checklist:**
1. Set environment variables on hosting platform
2. Configure `CORS_ORIGIN` for production domain
3. Set `NODE_ENV=production`
4. Configure Redis for rate limiting (or accept in-memory fallback)
5. Enable Langsmith for production monitoring
6. Apply database migrations: `bun run db:push`
7. Run verification: `bun run verify-setup`

**Recommended Hosting:**
- Frontend: Vercel, Netlify (static hosting)
- Backend: Railway, Render, Fly.io (Bun support)
- Database: Supabase (managed PostgreSQL + pgvector)

## Migration Notes

**Status**: ✅ **COMPLETED** (January 2025)

The migration from Base44 SDK to Supabase is marked complete, but compatibility layer remains:

**Compatibility Layer Files** (can be removed in future):
- `src/api/base44Client.js` - Base44 client wrapper
- `src/api/migrationCompat.js` - Feature flags and migration utilities
- `backend/src/routes/functions.ts` - Base44 function compatibility endpoints

**Migration Benefits:**
- Cost reduction (eliminated Base44 licensing)
- Performance (direct database access)
- Control (full schema ownership)
- Standard PostgreSQL vs proprietary API

**To Complete Migration:**
1. Remove Base44 SDK dependency from `package.json`
2. Update all entity imports to use Supabase directly
3. Remove compatibility layer files
4. Update documentation

## Additional Notes

- **TypeScript**: Project uses JSX, not TSX (see `components.json`)
- **Package Manager**: Always use `bun` (not npm/yarn/pnpm)
- **Framer Motion**: Import motion config from `@/components/config/motion` for consistency
- **Toast Notifications**: Use `toast` from `sonner` for user feedback
- **Loading States**: Use `ThinkingLoader` component for AI operations
- **Rate Limiting**: AI endpoints limited to 50 requests per 15 minutes per user
- **Admin Routes**: Check `user_profiles.role = 'admin'` via `requireAdmin` middleware
