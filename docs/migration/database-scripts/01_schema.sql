-- Compilar v0.5 Database Schema
-- Standalone PostgreSQL version (no Supabase dependencies)

-- =========================================
-- CORE ENTITIES
-- =========================================

-- Users table (replaces auth.users dependency)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles (extended user information)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PILAR Assessments (core assessment results)
CREATE TABLE pilar_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pillar_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('egalitarian', 'hierarchical')),
  scores JSONB NOT NULL DEFAULT '{}',
  forces_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment Sessions (interactive assessment workflow)
CREATE TABLE assessment_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- User Progress (gamification progress tracking)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pillar_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('egalitarian', 'hierarchical')),
  current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
  experience_points INTEGER DEFAULT 0 CHECK (experience_points >= 0),
  completed_challenges INTEGER DEFAULT 0 CHECK (completed_challenges >= 0),
  mastery_score DECIMAL(5,2) CHECK (mastery_score >= 0 AND mastery_score <= 100),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pillar_id, mode)
);

-- CMS Content (blog posts, pages, resources)
CREATE TABLE cms_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  content_type TEXT NOT NULL DEFAULT 'blog' CHECK (content_type IN ('blog', 'page', 'resource')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  published_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  pillar TEXT,
  force_vector TEXT,
  social_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PILAR Knowledge (static framework data)
CREATE TABLE pilar_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- =========================================
-- SOCIAL ENTITIES
-- =========================================

-- Teams (team collaboration)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  aggregated_scores JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members (team membership with roles)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team Invitations (team join invitations)
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Groups (smaller collaborative groups)
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 10 CHECK (max_members >= 1),
  is_private BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Group Members
CREATE TABLE study_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(study_group_id, user_id)
);

-- Peer Feedback (user-to-user feedback)
CREATE TABLE peer_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  giver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Coach Conversations (AI coaching chat history)
CREATE TABLE coach_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages (individual messages in conversations)
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES coach_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type TEXT DEFAULT 'user' CHECK (message_type IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================
-- GAMIFICATION ENTITIES
-- =========================================

-- User Gamification (overall user stats)
CREATE TABLE user_gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
  badges_earned INTEGER DEFAULT 0 CHECK (badges_earned >= 0),
  trophies_earned INTEGER DEFAULT 0 CHECK (trophies_earned >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  experience_points INTEGER DEFAULT 0 CHECK (experience_points >= 0),
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Badges (achievement definitions)
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  requirements JSONB NOT NULL DEFAULT '{}',
  points_value INTEGER DEFAULT 0 CHECK (points_value >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badges (earned badges junction table)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Trophies (advanced achievements)
CREATE TABLE trophies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '{}',
  points_value INTEGER DEFAULT 0 CHECK (points_value >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Trophies (earned trophies junction table)
CREATE TABLE user_trophies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trophy_id UUID NOT NULL REFERENCES trophies(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, trophy_id)
);

-- Challenges (gamification challenges)
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pillar_id TEXT,
  mode TEXT CHECK (mode IN ('egalitarian', 'hierarchical')),
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('assessment', 'learning', 'social', 'practice')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  requirements JSONB DEFAULT '{}' NOT NULL,
  rewards JSONB DEFAULT '{}' NOT NULL,
  time_limit_minutes INTEGER CHECK (time_limit_minutes > 0),
  max_attempts INTEGER DEFAULT 3 CHECK (max_attempts > 0),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================
-- ANALYTICS ENTITIES
-- =========================================

-- User Analytics (behavior tracking)
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}' NOT NULL,
  session_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Analytics (assessment session metrics)
CREATE TABLE session_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  duration_seconds INTEGER CHECK (duration_seconds >= 0),
  completion_rate DECIMAL(5,2) CHECK (completion_rate >= 0 AND completion_rate <= 100),
  interaction_count INTEGER DEFAULT 0 CHECK (interaction_count >= 0),
  pillar_focus TEXT,
  mode TEXT CHECK (mode IN ('egalitarian', 'hierarchical')),
  quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Analytics (team/study group metrics)
CREATE TABLE group_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_data JSONB DEFAULT '{}' NOT NULL,
  time_period TEXT NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CHECK (group_id IS NOT NULL OR team_id IS NOT NULL)
);

-- Team Analytics (team-specific metrics)
CREATE TABLE team_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_data JSONB DEFAULT '{}' NOT NULL,
  time_period TEXT NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================
-- AI/ML ENTITIES
-- =========================================

-- PILAR Knowledge Vectors (embeddings for RAG)
CREATE TABLE pilar_knowledge_vectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_id UUID NOT NULL REFERENCES pilar_knowledge(id) ON DELETE CASCADE,
  content_chunk TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI ada-002 dimension
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Profile Insights (AI-generated insights)
CREATE TABLE user_profile_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  insight_data JSONB DEFAULT '{}' NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Learning Pathways (structured learning journeys)
CREATE TABLE learning_pathways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  pillar_focus TEXT,
  mode TEXT CHECK (mode IN ('egalitarian', 'hierarchical')),
  pathway_type TEXT DEFAULT 'personal' CHECK (pathway_type IN ('personal', 'team', 'group')),
  steps JSONB DEFAULT '[]' NOT NULL,
  progress JSONB DEFAULT '{}' NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  estimated_completion_days INTEGER CHECK (estimated_completion_days > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- AI Insight Questions (dynamic question generation)
CREATE TABLE ai_insight_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pillar_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('egalitarian', 'hierarchical')),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('diagnostic', 'exploratory', 'reflective')),
  context_data JSONB DEFAULT '{}' NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  used_in_session UUID REFERENCES assessment_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Assessment Guidance (AI-generated guidance)
CREATE TABLE assessment_guidance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  guidance_type TEXT NOT NULL CHECK (guidance_type IN ('question_selection', 'interpretation', 'next_steps')),
  content TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================
-- ADVANCED ENTITIES
-- =========================================

-- Battalions (large-scale formations)
CREATE TABLE battalions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  commander_id UUID REFERENCES users(id) ON DELETE SET NULL,
  battalion_type TEXT NOT NULL CHECK (battalion_type IN ('military', 'corporate', 'community')),
  settings JSONB DEFAULT '{}' NOT NULL,
  member_count INTEGER DEFAULT 0 CHECK (member_count >= 0),
  max_capacity INTEGER CHECK (max_capacity > 0),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Battalion Members
CREATE TABLE battalion_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battalion_id UUID NOT NULL REFERENCES battalions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('commander', 'officer', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(battalion_id, user_id)
);

-- Cooperative Operations (large-scale activities)
CREATE TABLE cooperative_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  operation_type TEXT NOT NULL,
  pillar_focus TEXT,
  mode TEXT CHECK (mode IN ('egalitarian', 'hierarchical')),
  participants UUID[] DEFAULT '{}',
  objectives JSONB DEFAULT '[]' NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Group Rounds (collaborative assessment rounds)
CREATE TABLE group_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  pillar_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('egalitarian', 'hierarchical')),
  participants UUID[] DEFAULT '{}',
  responses JSONB DEFAULT '{}' NOT NULL,
  results JSONB DEFAULT '{}' NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Development Plans (user growth plans)
CREATE TABLE development_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  pillar_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('egalitarian', 'hierarchical')),
  goals JSONB DEFAULT '[]' NOT NULL,
  progress JSONB DEFAULT '{}' NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  target_completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Force Prompt Cards (assessment question templates)
CREATE TABLE force_prompt_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pillar_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('egalitarian', 'hierarchical')),
  force_name TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  card_type TEXT DEFAULT 'question' CHECK (card_type IN ('question', 'scenario', 'reflection')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  context_tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Sessions (extended session tracking)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}' NOT NULL,
  ip_address INET,
  user_agent TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Data Enrichment Recommendations (AI suggestions)
CREATE TABLE data_enrichment_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  data_requirements JSONB DEFAULT '{}' NOT NULL,
  estimated_benefit TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'implemented')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Time Series Data (longitudinal tracking)
CREATE TABLE time_series_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  data_point JSONB DEFAULT '{}' NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  source TEXT NOT NULL,
  quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- PILAR Snapshots (point-in-time assessments)
CREATE TABLE pilar_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('assessment', 'progress', 'milestone')),
  pillar_data JSONB DEFAULT '{}' NOT NULL,
  force_data JSONB DEFAULT '{}' NOT NULL,
  metadata JSONB DEFAULT '{}' NOT NULL,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Mastery Levels (skill progression system)
CREATE TABLE mastery_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pillar_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('egalitarian', 'hierarchical')),
  level_number INTEGER NOT NULL CHECK (level_number >= 1),
  level_name TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB DEFAULT '{}' NOT NULL,
  rewards JSONB DEFAULT '{}' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Goal Mappings (goal-to-pillar alignment)
CREATE TABLE goal_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  pillar_alignment JSONB DEFAULT '{}' NOT NULL,
  force_alignment JSONB DEFAULT '{}' NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  mapped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Actions (activity tracking)
CREATE TABLE user_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_data JSONB DEFAULT '{}' NOT NULL,
  pillar_id TEXT,
  mode TEXT CHECK (mode IN ('egalitarian', 'hierarchical')),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================
-- VERIFICATION
-- =========================================

-- Verify all tables were created
SELECT schemaname, tablename, tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;