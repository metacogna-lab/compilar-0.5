-- Missing entities migration for Base44 to Supabase
-- This migration adds all entities that exist in Base44 but are missing from current Supabase schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Actions (activity tracking)
CREATE TABLE user_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  action_data JSONB DEFAULT '{}' NOT NULL,
  pillar_id TEXT,
  mode TEXT CHECK (mode IN ('egalitarian', 'hierarchical')),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Group Rounds (collaborative assessment rounds)
CREATE TABLE group_rounds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Chat Messages (conversation history)
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES coach_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message_type TEXT DEFAULT 'user' CHECK (message_type IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Development Plans (user growth plans)
CREATE TABLE development_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Challenges (gamification challenges)
CREATE TABLE challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pillar_id TEXT,
  mode TEXT CHECK (mode IN ('egalitarian', 'hierarchical')),
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('assessment', 'learning', 'social', 'practice')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  requirements JSONB DEFAULT '{}' NOT NULL,
  rewards JSONB DEFAULT '{}' NOT NULL,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Group Analytics (team/group performance metrics)
CREATE TABLE group_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_data JSONB DEFAULT '{}' NOT NULL,
  time_period TEXT NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- PILAR Knowledge Vectors (vector embeddings for RAG)
CREATE TABLE pilar_knowledge_vectors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  knowledge_id UUID REFERENCES pilar_knowledge(id) ON DELETE CASCADE NOT NULL,
  content_chunk TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI ada-002 dimension
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Profile Insights (AI-generated insights)
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

-- Learning Pathways (structured learning journeys)
CREATE TABLE learning_pathways (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pillar_focus TEXT,
  mode TEXT CHECK (mode IN ('egalitarian', 'hierarchical')),
  pathway_type TEXT DEFAULT 'personal' CHECK (pathway_type IN ('personal', 'team', 'group')),
  steps JSONB DEFAULT '[]' NOT NULL,
  progress JSONB DEFAULT '{}' NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  estimated_completion_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Battalions (large group formations)
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

-- Battalion Members
CREATE TABLE battalion_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  battalion_id UUID REFERENCES battalions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('commander', 'officer', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(battalion_id, user_id)
);

-- Cooperative Operations (large-scale collaborative activities)
CREATE TABLE cooperative_operations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Team Analytics (team performance metrics)
CREATE TABLE team_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  metric_type TEXT NOT NULL,
  metric_data JSONB DEFAULT '{}' NOT NULL,
  time_period TEXT NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Peer Feedback (user-to-user feedback system)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- AI Insight Questions (dynamic question generation)
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

-- User Sessions (extended session tracking)
CREATE TABLE user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}' NOT NULL,
  ip_address INET,
  user_agent TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Force Prompt Cards (assessment question templates)
CREATE TABLE force_prompt_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Assessment Guidance (AI-generated assessment guidance)
CREATE TABLE assessment_guidance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE NOT NULL,
  guidance_type TEXT NOT NULL CHECK (guidance_type IN ('question_selection', 'interpretation', 'next_steps')),
  content TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Data Enrichment Recommendations (AI suggestions for data collection)
CREATE TABLE data_enrichment_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_type TEXT NOT NULL,
  data_point JSONB DEFAULT '{}' NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  source TEXT NOT NULL,
  quality_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- PILAR Snapshots (point-in-time assessments)
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

-- Mastery Levels (skill progression system)
CREATE TABLE mastery_levels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pillar_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('egalitarian', 'hierarchical')),
  level_number INTEGER NOT NULL,
  level_name TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB DEFAULT '{}' NOT NULL,
  rewards JSONB DEFAULT '{}' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Goal Mapping (goal-to-pillar alignment)
CREATE TABLE goal_mappings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_text TEXT NOT NULL,
  pillar_alignment JSONB DEFAULT '{}' NOT NULL,
  force_alignment JSONB DEFAULT '{}' NOT NULL,
  confidence_score DECIMAL(3,2),
  mapped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX idx_user_actions_action_type ON user_actions(action_type);
CREATE INDEX idx_group_rounds_group_id ON group_rounds(group_id);
CREATE INDEX idx_group_rounds_status ON group_rounds(status);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_development_plans_user_id ON development_plans(user_id);
CREATE INDEX idx_development_plans_status ON development_plans(status);
CREATE INDEX idx_challenges_pillar_id ON challenges(pillar_id);
CREATE INDEX idx_challenges_is_active ON challenges(is_active);
CREATE INDEX idx_group_analytics_group_id ON group_analytics(group_id);
CREATE INDEX idx_group_analytics_team_id ON group_analytics(team_id);
CREATE INDEX idx_pilar_knowledge_vectors_knowledge_id ON pilar_knowledge_vectors(knowledge_id);
CREATE INDEX idx_user_profile_insights_user_id ON user_profile_insights(user_id);
CREATE INDEX idx_learning_pathways_user_id ON learning_pathways(user_id);
CREATE INDEX idx_battalions_commander_id ON battalions(commander_id);
CREATE INDEX idx_battalion_members_battalion_id ON battalion_members(battalion_id);
CREATE INDEX idx_cooperative_operations_status ON cooperative_operations(status);
CREATE INDEX idx_team_analytics_team_id ON team_analytics(team_id);
CREATE INDEX idx_peer_feedback_giver_id ON peer_feedback(giver_id);
CREATE INDEX idx_peer_feedback_receiver_id ON peer_feedback(receiver_id);
CREATE INDEX idx_ai_insight_questions_user_id ON ai_insight_questions(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_force_prompt_cards_pillar_id ON force_prompt_cards(pillar_id);
CREATE INDEX idx_assessment_guidance_session_id ON assessment_guidance(session_id);
CREATE INDEX idx_data_enrichment_recommendations_user_id ON data_enrichment_recommendations(user_id);
CREATE INDEX idx_time_series_data_user_id ON time_series_data(user_id);
CREATE INDEX idx_time_series_data_data_type ON time_series_data(data_type);
CREATE INDEX idx_pilar_snapshots_user_id ON pilar_snapshots(user_id);
CREATE INDEX idx_mastery_levels_pillar_id ON mastery_levels(pillar_id);
CREATE INDEX idx_goal_mappings_user_id ON goal_mappings(user_id);

-- Updated at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_group_rounds_updated_at BEFORE UPDATE ON group_rounds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_development_plans_updated_at BEFORE UPDATE ON development_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cooperative_operations_updated_at BEFORE UPDATE ON cooperative_operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_peer_feedback_updated_at BEFORE UPDATE ON peer_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_enrichment_recommendations_updated_at BEFORE UPDATE ON data_enrichment_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goal_mappings_updated_at BEFORE UPDATE ON goal_mappings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();