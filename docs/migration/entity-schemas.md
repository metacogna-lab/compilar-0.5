# Entity Schemas & Relationships

This document provides comprehensive documentation of all 27+ entities in the Compilar v0.5 system, their schemas, relationships, and migration considerations.

## Entity Overview

| Category | Entity Count | Description |
|----------|-------------|-------------|
| **Core** | 5 | User profiles, assessments, sessions, progress, CMS |
| **Social** | 8 | Teams, study groups, feedback, conversations |
| **Gamification** | 6 | Badges, trophies, challenges, user stats |
| **Analytics** | 4 | User analytics, session analytics, group analytics |
| **AI/ML** | 5 | Knowledge vectors, insights, questions, guidance |
| **Advanced** | 4 | Battalions, operations, snapshots, time series |
| **Total** | **32** | Complete entity ecosystem |

## Core Entities

### 1. User Profiles (`user_profiles`)

**Purpose**: Extended user information beyond Supabase auth.users

**Schema**:
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:
- `1:1` with `auth.users`
- Referenced by: All user-specific entities

**Migration Notes**:
- Remove Supabase auth.users dependency
- Implement user registration in standalone system
- Maintain referential integrity

### 2. PILAR Assessments (`pilar_assessments`)

**Purpose**: Core assessment results for each pillar/mode combination

**Schema**:
```sql
CREATE TABLE pilar_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pillar_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('egalitarian', 'hierarchical')),
  scores JSONB NOT NULL DEFAULT '{}',
  forces_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:
- `N:1` with `user_profiles`
- Referenced by: `assessment_sessions`

**Migration Notes**:
- High volume table (~10K records expected)
- JSONB fields contain complex scoring data
- Requires efficient indexing on `user_id`

### 3. Assessment Sessions (`assessment_sessions`)

**Purpose**: Interactive assessment workflow state and progress

**Schema**:
```sql
CREATE TABLE assessment_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pillar_id TEXT,
  mode TEXT CHECK (mode IN ('egalitarian', 'hierarchical')),
  stage TEXT NOT NULL DEFAULT 'profile',
  responses JSONB NOT NULL DEFAULT '{}',
  results JSONB,
  session_quality_score DECIMAL(3,2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:
- `N:1` with `user_profiles`
- `1:1` with `coach_conversations` (optional)

**Migration Notes**:
- Session state management critical for UX
- Large JSONB fields for responses/results
- Time-based queries need optimization

### 4. User Progress (`user_progress`)

**Purpose**: Gamification progress tracking per pillar/mode

**Schema**:
```sql
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pillar_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('egalitarian', 'hierarchical')),
  current_level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  completed_challenges INTEGER DEFAULT 0,
  mastery_score DECIMAL(5,2),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pillar_id, mode)
);
```

**Relationships**:
- `N:1` with `user_profiles`
- Unique constraint on `(user_id, pillar_id, mode)`

**Migration Notes**:
- Composite unique key requires careful handling
- Progress calculations may need background processing

### 5. CMS Content (`cms_content`)

**Purpose**: Blog posts, pages, and learning resources

**Schema**:
```sql
CREATE TABLE cms_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  content_type TEXT NOT NULL DEFAULT 'blog' CHECK (content_type IN ('blog', 'page', 'resource')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  pillar TEXT,
  force_vector TEXT,
  social_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:
- `N:1` with `user_profiles` (author)
- Unique constraint on `slug`

**Migration Notes**:
- Public read access (no RLS in Supabase)
- Rich content with metadata and tags
- SEO-critical with slug uniqueness

## Social Entities

### 6. Teams (`teams`)

**Purpose**: Team collaboration and aggregated assessments

**Schema**:
```sql
CREATE TABLE teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_name TEXT NOT NULL,
  description TEXT,
  owner_email TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  aggregated_scores JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:
- `1:N` with `team_members`
- `1:N` with `team_invitations`
- `1:N` with `team_analytics`

### 7. Team Members (`team_members`)

**Purpose**: Team membership with roles

**Schema**:
```sql
CREATE TABLE team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
```

**Relationships**:
- `N:1` with `teams`
- `N:1` with `user_profiles`
- Unique constraint on `(team_id, user_id)`

### 8. Study Groups (`study_groups`)

**Purpose**: Smaller collaborative learning groups

**Schema**:
```sql
CREATE TABLE study_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  max_members INTEGER DEFAULT 10,
  is_private BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:
- `1:N` with `study_group_members`
- `1:N` with `group_rounds`
- `1:N` with `group_analytics`

### 9. Peer Feedback (`peer_feedback`)

**Purpose**: User-to-user feedback system

**Schema**:
```sql
CREATE TABLE peer_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  giver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('assessment', 'general', 'praise', 'improvement')),
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  pillar_ratings JSONB DEFAULT '{}' NOT NULL,
  is_anonymous BOOLEAN DEFAULT false NOT NULL,
  status TEXT DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'reported')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:
- `N:1` with `user_profiles` (giver)
- `N:1` with `user_profiles` (receiver)
- `N:1` with `assessment_sessions` (optional)

### 10. Coach Conversations (`coach_conversations`)

**Purpose**: AI coaching conversation history

**Schema**:
```sql
CREATE TABLE coach_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:
- `N:1` with `user_profiles`
- `1:1` with `assessment_sessions`
- `1:N` with `chat_messages`

## Gamification Entities

### 11. User Gamification (`user_gamification`)

**Purpose**: Overall user gamification statistics

**Schema**:
```sql
CREATE TABLE user_gamification (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  trophies_earned INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**Relationships**:
- `1:1` with `user_profiles`
- Unique constraint on `user_id`

### 12. Badges (`badges`)

**Purpose**: Achievement badges with rarity levels

**Schema**:
```sql
CREATE TABLE badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  requirements JSONB NOT NULL DEFAULT '{}',
  points_value INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:
- `1:N` with `user_badges`

### 13. User Badges (`user_badges`)

**Purpose**: Junction table for earned badges

**Schema**:
```sql
CREATE TABLE user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

**Relationships**:
- `N:1` with `user_profiles`
- `N:1` with `badges`
- Unique constraint on `(user_id, badge_id)`

## Analytics Entities

### 14. User Analytics (`user_analytics`)

**Purpose**: User behavior tracking and analytics

**Schema**:
```sql
CREATE TABLE user_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}' NOT NULL,
  session_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:
- `N:1` with `user_profiles`

**Migration Notes**:
- High volume table (~100K records expected)
- IP address storage requires privacy considerations
- Event-based partitioning may be needed

### 15. Session Analytics (`session_analytics`)

**Purpose**: Assessment session performance metrics

**Schema**:
```sql
CREATE TABLE session_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  duration_seconds INTEGER,
  completion_rate DECIMAL(5,2),
  interaction_count INTEGER DEFAULT 0,
  pillar_focus TEXT,
  mode TEXT,
  quality_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:
- `N:1` with `user_profiles`
- `N:1` with `assessment_sessions`

## AI/ML Entities

### 16. PILAR Knowledge (`pilar_knowledge`)

**Purpose**: Static framework knowledge base

**Schema**:
```sql
CREATE TABLE pilar_knowledge (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pillar_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('egalitarian', 'hierarchical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  forces JSONB NOT NULL DEFAULT '[]',
  indicators JSONB NOT NULL DEFAULT '{}',
  key_questions TEXT[] DEFAULT '{}',
  full_description TEXT,
  abbreviation TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pillar_id, mode)
);
```

**Relationships**:
- `1:N` with `pilar_knowledge_vectors`
- Unique constraint on `(pillar_id, mode)`

### 17. PILAR Knowledge Vectors (`pilar_knowledge_vectors`)

**Purpose**: Vector embeddings for RAG system

**Schema**:
```sql
CREATE TABLE pilar_knowledge_vectors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  knowledge_id UUID REFERENCES pilar_knowledge(id) ON DELETE CASCADE NOT NULL,
  content_chunk TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI ada-002 dimension
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Relationships**:
- `N:1` with `pilar_knowledge`

**Migration Notes**:
- Requires pgvector extension
- Large embeddings (1536 dimensions)
- Vector similarity searches need optimization

### 18. User Profile Insights (`user_profile_insights`)

**Purpose**: AI-generated user insights

**Schema**:
```sql
CREATE TABLE user_profile_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL,
  insight_data JSONB DEFAULT '{}' NOT NULL,
  confidence_score DECIMAL(3,2),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Relationships**:
- `N:1` with `user_profiles`

### 19. AI Insight Questions (`ai_insight_questions`)

**Purpose**: Dynamic assessment questions generated by AI

**Schema**:
```sql
CREATE TABLE ai_insight_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pillar_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('egalitarian', 'hierarchical')),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('diagnostic', 'exploratory', 'reflective')),
  context_data JSONB DEFAULT '{}' NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  used_in_session UUID REFERENCES assessment_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Relationships**:
- `N:1` with `user_profiles`
- `N:1` with `assessment_sessions` (optional)

## Advanced Entities

### 20. Battalions (`battalions`)

**Purpose**: Large-scale group formations

**Schema**:
```sql
CREATE TABLE battalions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  commander_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  battalion_type TEXT NOT NULL CHECK (battalion_type IN ('military', 'corporate', 'community')),
  settings JSONB DEFAULT '{}' NOT NULL,
  member_count INTEGER DEFAULT 0,
  max_capacity INTEGER,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Relationships**:
- `1:N` with `battalion_members`
- `N:1` with `user_profiles` (commander)

### 21. Time Series Data (`time_series_data`)

**Purpose**: Longitudinal user data tracking

**Schema**:
```sql
CREATE TABLE time_series_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_type TEXT NOT NULL,
  data_point JSONB DEFAULT '{}' NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  source TEXT NOT NULL,
  quality_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Relationships**:
- `N:1` with `user_profiles`

**Migration Notes**:
- Time-series optimized queries needed
- Potential for table partitioning by date

### 22. PILAR Snapshots (`pilar_snapshots`)

**Purpose**: Point-in-time assessment snapshots

**Schema**:
```sql
CREATE TABLE pilar_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('assessment', 'progress', 'milestone')),
  pillar_data JSONB DEFAULT '{}' NOT NULL,
  force_data JSONB DEFAULT '{}' NOT NULL,
  metadata JSONB DEFAULT '{}' NOT NULL,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Relationships**:
- `N:1` with `user_profiles`

## Database Indexes

### Performance Indexes (Required)

```sql
-- Core entity indexes
CREATE INDEX idx_pilar_assessments_user_id ON pilar_assessments(user_id);
CREATE INDEX idx_assessment_sessions_user_id ON assessment_sessions(user_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_cms_content_status ON cms_content(status);
CREATE INDEX idx_cms_content_slug ON cms_content(slug);

-- Social entity indexes
CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Analytics indexes (high volume)
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX idx_session_analytics_user_id ON session_analytics(user_id);

-- AI/ML indexes
CREATE INDEX idx_pilar_knowledge_vectors_knowledge_id ON pilar_knowledge_vectors(knowledge_id);
```

### Composite Indexes (Recommended)

```sql
-- Complex query optimization
CREATE INDEX idx_assessment_sessions_user_stage ON assessment_sessions(user_id, stage);
CREATE INDEX idx_user_progress_user_pillar ON user_progress(user_id, pillar_id, mode);
CREATE INDEX idx_peer_feedback_giver_receiver ON peer_feedback(giver_id, receiver_id);
```

## Authorization Migration

### From RLS to Application-Level Security

**Current RLS Policies**:
```sql
-- User-owned data
CREATE POLICY "Users can view their own assessments" ON pilar_assessments
  FOR SELECT USING (auth.uid() = user_id);

-- Public read data
CREATE POLICY "Anyone can view PILAR knowledge" ON pilar_knowledge
  FOR SELECT USING (true);

-- Group-based access
CREATE POLICY "Team members can view their teams" ON teams
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );
```

**New Application-Level Authorization**:
```typescript
// User-owned resource check
export const checkUserOwnership = async (userId: string, resourceId: string, table: string) => {
  const query = `SELECT user_id FROM ${table} WHERE id = $1`;
  const result = await pool.query(query, [resourceId]);
  return result.rows[0]?.user_id === userId;
};

// Group membership check
export const checkGroupMembership = async (userId: string, groupId: string) => {
  const query = `
    SELECT 1 FROM team_members
    WHERE team_id = $1 AND user_id = $2
  `;
  const result = await pool.query(query, [groupId, userId]);
  return result.rows.length > 0;
};
```

## Data Volume Estimates

| Entity | Estimated Records | Growth Rate | Retention Policy |
|--------|------------------|-------------|------------------|
| `user_profiles` | 1K | Low | Forever |
| `pilar_assessments` | 10K | Medium | Forever |
| `assessment_sessions` | 50K | High | 2 years |
| `user_analytics` | 100K | High | 1 year |
| `cms_content` | 100 | Low | Forever |
| `teams` | 100 | Medium | Forever |
| `peer_feedback` | 2K | Medium | Forever |

## Migration Checklist

### Schema Migration
- [ ] Remove Supabase-specific extensions (`uuid-ossp`, `pgcrypto`)
- [ ] Convert `auth.users` references to local user table
- [ ] Implement application-level foreign key constraints
- [ ] Add database triggers for `updated_at` columns
- [ ] Create all required indexes
- [ ] Set up vector extension for embeddings (if needed)

### Data Migration
- [ ] Export data from Supabase (CSV/JSON)
- [ ] Transform user IDs from Supabase to local format
- [ ] Handle JSONB field transformations
- [ ] Validate referential integrity
- [ ] Import data with proper ordering (parents before children)

### Authorization Migration
- [ ] Implement user authentication system
- [ ] Create authorization middleware
- [ ] Replace RLS policies with application logic
- [ ] Test all access control scenarios
- [ ] Implement audit logging

### Performance Optimization
- [ ] Analyze query patterns from current system
- [ ] Create optimized indexes
- [ ] Implement query result caching
- [ ] Set up database connection pooling
- [ ] Configure PostgreSQL for optimal performance