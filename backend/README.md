# Compilar Backend

Bun + Hono backend for the Compilar PILAR assessment platform.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Language**: TypeScript

## Setup

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Environment variables**:
   Run the setup script to configure environment variables:
   ```bash
   bun run setup-env
   ```
   Then edit `.env` with your actual Supabase credentials.

3. **Supabase Project Setup**:
   ```bash
   # Create a new Supabase project at https://supabase.com
   # Or use existing project credentials

   # Copy your project credentials to .env:
   # SUPABASE_URL=https://your-project-id.supabase.co
   # SUPABASE_ANON_KEY=your-anon-key
   # SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Database setup**:
   ```bash
   # Initialize Supabase locally (optional for development)
   supabase init

   # Start local Supabase (optional)
   supabase start

   # For production: Apply migrations to your Supabase project
   # The SQL files in supabase/migrations/ contain the complete schema
   ```

4. **Development**:
   ```bash
   bun run dev
   ```

## API Structure

```
/api/v1/
├── auth/
│   └── me                    # GET - Get current user
├── users/                    # User management
├── assessments/              # Assessment pipeline
│   └──                     # GET - List user assessments
├── blog/
│   └── posts               # GET - List published blog posts
├── teams/                   # Team management
├── gamification/            # Badges & points
├── analytics/               # Admin analytics
└── cms/                     # Content management
```

## Database Schema

### Core Tables

- **user_profiles** - Extended user information
- **pilar_assessments** - Assessment results by pillar/mode
- **assessment_sessions** - Assessment session tracking
- **user_progress** - User learning progress
- **cms_content** - Blog posts and pages
- **pilar_knowledge** - Static PILAR framework data
- **teams** - Team management
- **user_gamification** - Points, badges, trophies
- **coach_conversations** - AI coaching chat history

### Security

All tables use Row Level Security (RLS) with policies ensuring:
- Users can only access their own data
- Public read access for published content
- Team-based access for collaborative features
- Admin-only access for analytics

## Development Commands

```bash
# Development server
bun run dev

# Build for production
bun run build

# Database operations
bun run db:generate  # Generate TypeScript types
bun run db:push      # Push migrations
bun run db:reset     # Reset and seed database
```

## Migration Status

### ✅ Phase 1 (COMPLETED): Database Foundation
- [x] Bun + Hono backend infrastructure
- [x] Supabase PostgreSQL schema (27 tables)
- [x] Row Level Security policies (20+ policies)
- [x] PILAR knowledge base seeded (10 pillars, 40 forces)
- [x] TypeScript schemas (database + API)
- [x] Authentication integration
- [x] API routes structure (/api/v1/)
- [x] Environment configuration
- [x] Verification and setup scripts

### 🔄 Phase 2 (Next): Assessment Pipeline
- [ ] Assessment session management
- [ ] AI coaching functions (OpenAI/Gemini integration)
- [ ] Question generation algorithms
- [ ] RAG system for PILAR knowledge
- [ ] Assessment flow completion

### Phase 3: Collaboration Features
- [ ] Teams and study groups
- [ ] Blog system
- [ ] Peer feedback

### Phase 4: Advanced Features
- [ ] Gamification
- [ ] Admin analytics
- [ ] CMS completion

## Architecture Notes

- **Stateless API**: All state managed in Supabase
- **RLS Security**: Database-level access control
- **Type Safety**: Full TypeScript integration
- **Scalable**: Built for horizontal scaling

## Environment Variables

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
OPENAI_API_KEY=your_openai_key
```