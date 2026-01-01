# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Compilar v0.5** is a group dynamics assessment and learning platform based on the **PILAR Framework** (Prospects, Involved, Liked, Agency, Respect). Built with React, TypeScript, and Supabase, the application helps users assess group coordination across two fundamental modes of operation: **Egalitarian** and **Hierarchical**. Each mode has 5 distinct pillars, and each pillar is driven by 4 psychological forces that shape team dynamics and performance.

**Migration Status**: ✅ **COMPLETED** - Migrated from Base44 SDK to Supabase (Jan 2025)

**Tech Stack:**
- Frontend: React 18, Vite, TypeScript/JSX
- UI: Tailwind CSS, shadcn/ui (New York style), Framer Motion
- State: Zustand with persistence
- Backend: Supabase (PostgreSQL + Auth + Edge Functions)
- AI: OpenAI API for RAG, coaching, and content generation
- Icons: Lucide React

## Development Commands

**Always use `bun` as the package manager** (per user's global instructions):

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

## Architecture Overview

### Supabase Backend Architecture

The application is built on Supabase, providing:
- **Authentication**: Supabase Auth with JWT tokens and user sessions
- **Database**: PostgreSQL with 27+ entities and Row Level Security (RLS)
- **API**: REST endpoints via Hono framework with automatic CRUD operations
- **Real-time**: Live subscriptions for collaborative features
- **Storage**: File uploads and static asset management

**Migration Details**: Fully migrated from Base44 SDK (Jan 2025)
- **Database**: All 27 entities migrated with proper relationships and RLS policies
- **Authentication**: Supabase Auth integration with backward compatibility
- **API**: REST endpoints replace Base44 function calls
- **Compatibility**: Migration layer allows gradual transition

**Key API Files:**
- `src/api/base44Client.js` - Migration compatibility layer
- `src/api/supabaseEntities.js` - Supabase entity operations
- `src/api/migrationCompat.js` - Migration utilities and feature flags
- `backend/src/routes/entities.js` - REST API endpoints
- `backend/supabase/migrations/` - Database schema and policies

### State Management Strategy

The application is **transitioning from local state to Zustand stores** (see `src/components/assess/STATE_MANAGEMENT_REFACTOR_PLAN.md.jsx`):

**Current Stores:**
- `useAssessmentStore` - Assessment session state (pillar selection, mode, responses, results)
- `useGameStore` - Gamification state (pillar values, scenarios, persistence)
- `usePageStore` - Page-level UI state

**Planned Stores (in migration):**
- `useConversationStore` - Chat message history and agent state
- `useRAGStore` - Cached RAG queries and force data
- `useUserProfileStore` - User profile and assessment history
- `useUIStore` - Modal states, sidebar visibility

**State Persistence:**
- Zustand persist middleware saves to localStorage (`compilar-save-v1`)
- Use `useAssessmentStore((state) => state.field)` for selective subscriptions

### API Architecture

#### REST API Endpoints
All entities are accessible via REST endpoints at `/api/v1/entities/{entity-name}`:

**CRUD Operations:**
- `GET /api/v1/entities/{entity}` - List entities
- `POST /api/v1/entities/{entity}` - Create entity
- `GET /api/v1/entities/{entity}/{id}` - Get specific entity
- `PUT /api/v1/entities/{entity}/{id}` - Update entity
- `DELETE /api/v1/entities/{entity}/{id}` - Delete entity

**Authentication:** All endpoints require Bearer token authentication
**Authorization:** Row Level Security (RLS) policies enforce data access

#### Entity URL Mapping
```
PilarAssessment → /api/v1/entities/pilar-assessments
UserProfile → /api/v1/entities/user-profiles
AssessmentSession → /api/v1/entities/assessment-sessions
Team → /api/v1/entities/teams
CoachConversation → /api/v1/entities/coach-conversations
```

#### Example API Usage
```bash
# Get user assessments
curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/v1/entities/pilar-assessments

# Create new assessment
curl -X POST "http://localhost:3001/api/v1/entities/pilar-assessments" \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"pillar_id":"divsexp","mode":"egalitarian","scores":{}}'
```

### Base44 to Supabase Migration

#### Migration Overview
**Status**: ✅ **COMPLETED** (January 2025)
**Approach**: Zero-downtime migration with compatibility layer
**Duration**: 2 weeks (Phase 1-4 implementation)
**Scope**: 27 entities, 26 functions, authentication, and integrations

#### Migration Architecture
```
Legacy (Base44) → Compatibility Layer → Modern (Supabase)
     ↓                ↓                        ↓
base44.entities.* → migrationCompat.js → supabaseEntities.js
base44.functions.* → REST API calls → backend/src/routes/
base44.auth.* → Supabase Auth → JWT tokens
```

#### Key Migration Components

**1. Database Schema (`backend/supabase/migrations/`)**
- `20240101000000_initial_schema.sql` - Core entities (existing)
- `20240102000000_missing_entities.sql` - 23 additional entities
- `20240102000001_missing_entities_rls.sql` - Security policies

**2. API Layer (`backend/src/routes/entities.js`)**
- Generic CRUD endpoints for all entities
- Authentication and authorization
- User-specific data filtering
- RESTful API design

**3. Compatibility Layer (`src/api/migrationCompat.js`)**
- Feature flags for gradual migration
- Proxy wrappers for seamless transition
- Migration utilities and status tracking
- Backward compatibility maintenance

**4. Entity Operations (`src/api/supabaseEntities.js`)**
- Base44-compatible method signatures
- REST API integration
- Error handling and logging
- Performance optimizations

#### Migration Benefits
- **Cost Reduction**: Eliminated Base44 licensing fees
- **Performance**: Direct database access vs API abstraction
- **Scalability**: Supabase provides better scaling capabilities
- **Control**: Full ownership of database schema and operations
- **Maintainability**: Standard PostgreSQL instead of proprietary API

#### Using the Migration Layer
```javascript
// Check migration status
import { migrationUtils } from '@/api/migrationCompat';
console.log(migrationUtils.getMigrationStatus());

// Enable Supabase for specific entities
migrationUtils.enableSupabaseFor('PilarAssessment');

// Switch to full Supabase mode
process.env.USE_SUPABASE = 'true';
```

### Routing & Pages

**Routing**: React Router v7 with BrowserRouter (configured in `src/pages/index.jsx`)

**Page Registry**: All pages are registered in the `PAGES` object and auto-mapped to routes. The router uses a custom URL-to-page mapping function that:
1. Extracts the last URL segment
2. Matches it case-insensitively to page names
3. Defaults to the first page if no match

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
├── api/                # Base44 SDK exports
├── hooks/              # Custom React hooks
└── lib/                # Utility functions (cn helper)
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

### The PILAR Framework

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

**Force Connections**: Forces interact across pillars creating feedback loops. Each mode has 20 named connections:

**EGALITARIAN MODE Connections** (20 total):
1. Group Prospects → Indirect Reciprocity (Discretionary)
2. **Circle the Wagons**: Group Prospects → Popularity (Inverse - impending failure increases bonding)
3. **Desperate Times**: Group Prospects → Diverse Expression (Inverse - threats increase openness)
4. **Scapegoating**: Group Prospects → Outgoing Respect (Reinforce - pressure erodes trust)
5. **Mucking in Together**: Indirect Reciprocity → Group Prospects (Reinforce)
6. **Spread the Love**: Indirect Reciprocity → Popularity (Reinforce)
7. **Here to Help**: Indirect Reciprocity → Diverse Expression (Reinforce)
8. **Watch and Learn**: Indirect Reciprocity → Outgoing Respect (Reinforce)
9. **Knowing What's Best**: Popularity → Group Prospects (Reinforce - informal influence)
10. **Spread Too Thin**: Popularity → Indirect Reciprocity (Inverse - reduces help capacity)
11. **Making Fetch Happen**: Popularity → Diverse Expression (Reinforce)
12. **Heavy Lies the Crown**: Popularity → Outgoing Respect (Inverse - attracts scrutiny)
13. **Font of Wisdom**: Diverse Expression → Group Prospects (Reinforce)
14. **Growth Mindset**: Diverse Expression → Indirect Reciprocity (Reinforce)
15. Diverse Expression → Popularity (Discretionary)
16. **Rise to the Occasion**: Diverse Expression → Outgoing Respect (Reinforce)
17. **Quality Street**: Outgoing Respect → Group Prospects (Reinforce)
18. **I'll Just Do It Myself**: Outgoing Respect → Indirect Reciprocity (Reinforce)
19. **Don't Dis Me Bro**: Outgoing Respect → Popularity (Reinforce)
20. **Compensatory Complacency**: Outgoing Respect → Diverse Expression (Inverse)

**HIERARCHICAL MODE Connections** (20 total):
1. Own Prospects → Direct Reciprocity (Discretionary)
2. **Short Poppies**: Own Prospects → Status (Inverse - success attracts envy)
3. **I've Got it Covered**: Own Prospects → Normative Expression (Inverse)
4. **Winners are Grinners**: Own Prospects → Incoming Respect (Reinforce)
5. **Strength to Your Arm**: Direct Reciprocity → Own Prospects (Reinforce)
6. **Pick and Stick**: Direct Reciprocity → Status (Reinforce - debt reinforces hierarchy)
7. **Left in the Lurch**: Direct Reciprocity → Normative Expression (Reinforce)
8. **Tits on a Bull**: Direct Reciprocity → Incoming Respect (Reinforce)
9. **Built-in Advantage**: Status → Own Prospects (Reinforce - structural advantage)
10. **More to Lose, or Gain**: Status → Direct Reciprocity (Inverse)
11. **Self Interest Quo**: Status → Normative Expression (Reinforce)
12. **All Praise the Boss**: Status → Incoming Respect (Inverse - creates deference expectations)
13. **Rewards of Conformity**: Normative Expression → Own Prospects (Reinforce)
14. **Predictability Preferred**: Normative Expression → Direct Reciprocity (Reinforce)
15. Normative Expression → Status (Discretionary)
16. **The Right Thing**: Normative Expression → Incoming Respect (Reinforce)
17. **External Locus of Control**: Incoming Respect → Own Prospects (Reinforce)
18. **Sulking in a Corner**: Incoming Respect → Direct Reciprocity (Reinforce)
19. **Inferred Status**: Incoming Respect → Status (Reinforce - deference reinforces rank)
20. **Comfortable in my Own Skin**: Incoming Respect → Normative Expression (Inverse)

### Assessment Pipeline

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

### AI & RAG Integration

**Base44 Functions** power AI features:
- `pilarRagQuery(query, pillar, mode)` - Semantic search over PILAR theory
- `generateAICoaching(profile, assessment)` - Personalized coaching
- `getAssessmentGuidance(userProfile, conversationHistory)` - Contextual guidance
- `coachConversation(messages, context)` - Interactive AI coach
- `analyzePilarAlignment(content)` - Content analysis for CMS

**RAG Data Sources:**
- PILAR theory documents (ingested via `ingestPilarKnowledge`)
- Force definitions (accessed via `getPillarForces(pillarId, mode)`)
- User assessment history

**Caching Strategy** (from refactor plan):
- Cache RAG results in `useRAGStore` to avoid redundant queries
- Pre-fetch forces when pillar/mode is selected
- Invalidate cache on knowledge updates

### Data Flow Patterns

**React Query** is used for server state:
```jsx
const { data: user } = useQuery({
  queryKey: ['user'],
  queryFn: () => base44.auth.me()
});

const { data: userProfile } = useQuery({
  queryKey: ['userProfile', user?.email],
  queryFn: () => base44.entities.UserProfile.filter({ created_by: user.email }),
  enabled: !!user
});
```

**Zustand** for client state:
```jsx
const selectedPillar = useAssessmentStore((state) => state.selectedPillarId);
const actions = useAssessmentActions(); // Custom hook for actions
```

**Mutations** for writes:
```jsx
const saveMutation = useMutation({
  mutationFn: (data) => base44.entities.AssessmentSession.create(data),
  onSuccess: () => queryClient.invalidateQueries(['assessmentSessions'])
});
```

## Common Development Tasks

### Adding a New Entity

1. Add entity to Base44 schema (via Base44 dashboard)
2. Entity auto-appears in `src/api/entities.js`
3. Use in components: `import { MyEntity } from '@/api/entities'`

### Creating a New Function

1. Define function in Base44 dashboard
2. Function auto-appears in `src/api/functions.js`
3. Use in components: `import { myFunction } from '@/api/functions'`

### Adding a shadcn/ui Component

```bash
bunx shadcn-ui@latest add button
# Component appears in src/components/ui/button.jsx
```

### Adding a New Page

1. Create page component in `src/pages/MyPage.jsx`
2. Add to `PAGES` object in `src/pages/index.jsx`
3. Add route in `<Routes>` section
4. Router auto-maps `/MyPage` to component

### Working with Pillar Data

**Static Data:**
- `src/components/pilar/pillarsData.jsx` - Pillar metadata by mode (`pillarsInfo.egalitarian` / `pillarsInfo.hierarchical`)
- `src/components/pilar/forceConnectionsData.jsx` - Inter-pillar force relationships (20 connections per mode)
- `src/components/pilar/forcesData.jsx` - Psychological force definitions (grouped by category)

**Pillar IDs by Mode:**
- **Egalitarian**: `divsexp`, `indrecip`, `popularity`, `grpprosp`, `outresp`
- **Hierarchical**: `normexp`, `dirrecip`, `status`, `ownprosp`, `incresp`

**Data Adapters:**
- `src/components/assess/assessDataAdapter.jsx` - Transform pillar data for UI
- `src/components/pilar/forceGraphAdapter.jsx` - Format for graph visualizations

**Helper Functions:**
```jsx
import { getPillarData, getPillarForces } from '@/components/assess/assessDataAdapter';
import { pillarsInfo } from '@/components/pilar/pillarsData';

// Get pillar data for a specific mode
const egalitarianPillars = pillarsInfo.egalitarian;
const hierarchicalPillars = pillarsInfo.hierarchical;

// Get specific pillar
const pillar = getPillarData('divsexp', 'egalitarian');
const forces = getPillarForces('divsexp', 'egalitarian'); // Returns 4 forces
```

### AI Coaching Implementation

**Pattern for streaming AI responses:**
```jsx
import { streamPilarInsights } from '@/api/functions';

const handleStream = async (query) => {
  const stream = await streamPilarInsights({
    query,
    pillar: selectedPillarId,
    mode: selectedMode
  });

  for await (const chunk of stream) {
    // Update UI with chunk
  }
};
```

**Conversation Context Building:**
```jsx
import { getChatbotContext } from '@/api/functions';

const context = await getChatbotContext({
  userProfile,
  pillar: selectedPillarId,
  mode: selectedMode,
  conversationHistory
});
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
import { UserProfile } from '@/api/entities';
```

## Key Constraints

### Base44 SDK

- **Always require auth**: `base44` client is configured with `requiresAuth: true`
- All entity operations auto-include `created_by` field
- Use filter syntax: `Entity.filter({ field: value }, '-created_at')`
- Sorting: Prefix field with `-` for descending (e.g., `'-session_quality_score'`)

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
- Cache RAG queries (see refactor plan)

## Testing Strategy

**Current State**: No test files present (add tests as features stabilize)

**Recommended Approach**:
- Unit tests for stores (Zustand slices)
- Integration tests for assessment pipeline
- Component tests for critical UI (quiz, coaching)
- E2E tests for complete user flows

## Build & Deployment

**Build Output**: `dist/` directory (static files)

**Vite Configuration**:
- Path aliases enabled
- JSX in `.js` files supported via `optimizeDeps.esbuildOptions`
- Server allows all hosts (`allowedHosts: true`)

**Environment Variables**: None currently used (Base44 app ID is hardcoded)

**Production Checklist**:
1. Run `bun run build`
2. Test with `bun run preview`
3. Deploy `dist/` to static hosting (Vercel, Netlify, etc.)
4. Ensure Base44 app ID matches production environment

## Additional Notes

- **TypeScript**: Project uses JSX, not TSX (see `components.json`)
- **Package Manager**: Always use `bun` (not npm/yarn/pnpm)
- **Framer Motion**: Import motion config from `@/components/config/motion` for consistency
- **Toast Notifications**: Use `toast` from `sonner` for user feedback
- **Loading States**: Use `ThinkingLoader` component for AI operations
