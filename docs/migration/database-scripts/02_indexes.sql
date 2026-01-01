-- Performance Indexes for Compilar Database
-- Optimized for common query patterns and data access patterns

-- =========================================
-- CORE ENTITY INDEXES
-- =========================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_sign_in ON users(last_sign_in_at);

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- PILAR Assessments indexes (high volume table)
CREATE INDEX idx_pilar_assessments_user_id ON pilar_assessments(user_id);
CREATE INDEX idx_pilar_assessments_pillar_mode ON pilar_assessments(pillar_id, mode);
CREATE INDEX idx_pilar_assessments_created_at ON pilar_assessments(created_at DESC);
CREATE INDEX idx_pilar_assessments_user_pillar ON pilar_assessments(user_id, pillar_id);

-- Assessment Sessions indexes (frequently queried)
CREATE INDEX idx_assessment_sessions_user_id ON assessment_sessions(user_id);
CREATE INDEX idx_assessment_sessions_stage ON assessment_sessions(stage);
CREATE INDEX idx_assessment_sessions_pillar_mode ON assessment_sessions(pillar_id, mode);
CREATE INDEX idx_assessment_sessions_completed ON assessment_sessions(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_assessment_sessions_started ON assessment_sessions(started_at DESC);
CREATE INDEX idx_assessment_sessions_user_stage ON assessment_sessions(user_id, stage);

-- User Progress indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_pillar_mode ON user_progress(pillar_id, mode);
CREATE INDEX idx_user_progress_level ON user_progress(current_level);
CREATE INDEX idx_user_progress_activity ON user_progress(last_activity DESC);

-- CMS Content indexes
CREATE INDEX idx_cms_content_status ON cms_content(status);
CREATE INDEX idx_cms_content_type ON cms_content(content_type);
CREATE INDEX idx_cms_content_slug ON cms_content(slug);
CREATE INDEX idx_cms_content_author ON cms_content(author_id);
CREATE INDEX idx_cms_content_published ON cms_content(published_date) WHERE published_date IS NOT NULL;
CREATE INDEX idx_cms_content_pillar ON cms_content(pillar) WHERE pillar IS NOT NULL;

-- PILAR Knowledge indexes
CREATE INDEX idx_pilar_knowledge_pillar_mode ON pilar_knowledge(pillar_id, mode);

-- =========================================
-- SOCIAL ENTITY INDEXES
-- =========================================

-- Teams indexes
CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_teams_created_at ON teams(created_at DESC);

-- Team Members indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);

-- Team Invitations indexes
CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(invited_email);
CREATE INDEX idx_team_invitations_status ON team_invitations(status);
CREATE INDEX idx_team_invitations_expires ON team_invitations(expires_at);

-- Study Groups indexes
CREATE INDEX idx_study_groups_owner_id ON study_groups(owner_id);
CREATE INDEX idx_study_groups_private ON study_groups(is_private);
CREATE INDEX idx_study_groups_created_at ON study_groups(created_at DESC);

-- Study Group Members indexes
CREATE INDEX idx_study_group_members_group_id ON study_group_members(study_group_id);
CREATE INDEX idx_study_group_members_user_id ON study_group_members(user_id);
CREATE INDEX idx_study_group_members_role ON study_group_members(role);

-- Peer Feedback indexes
CREATE INDEX idx_peer_feedback_giver_id ON peer_feedback(giver_id);
CREATE INDEX idx_peer_feedback_receiver_id ON peer_feedback(receiver_id);
CREATE INDEX idx_peer_feedback_session_id ON peer_feedback(session_id);
CREATE INDEX idx_peer_feedback_type ON peer_feedback(feedback_type);
CREATE INDEX idx_peer_feedback_status ON peer_feedback(status);
CREATE INDEX idx_peer_feedback_created_at ON peer_feedback(created_at DESC);

-- Coach Conversations indexes
CREATE INDEX idx_coach_conversations_user_id ON coach_conversations(user_id);
CREATE INDEX idx_coach_conversations_session_id ON coach_conversations(session_id);
CREATE INDEX idx_coach_conversations_created_at ON coach_conversations(created_at DESC);

-- Chat Messages indexes
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_type ON chat_messages(message_type);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- =========================================
-- GAMIFICATION INDEXES
-- =========================================

-- User Gamification indexes
CREATE INDEX idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX idx_user_gamification_level ON user_gamification(level);
CREATE INDEX idx_user_gamification_points ON user_gamification(total_points DESC);

-- Badges indexes
CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_rarity ON badges(rarity);
CREATE INDEX idx_badges_active ON badges(is_active);

-- User Badges indexes
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- Trophies indexes
CREATE INDEX idx_trophies_category ON trophies(category);
CREATE INDEX idx_trophies_active ON trophies(is_active);

-- User Trophies indexes
CREATE INDEX idx_user_trophies_user_id ON user_trophies(user_id);
CREATE INDEX idx_user_trophies_trophy_id ON user_trophies(trophy_id);
CREATE INDEX idx_user_trophies_earned_at ON user_trophies(earned_at DESC);

-- Challenges indexes
CREATE INDEX idx_challenges_pillar_id ON challenges(pillar_id);
CREATE INDEX idx_challenges_mode ON challenges(mode);
CREATE INDEX idx_challenges_type ON challenges(challenge_type);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX idx_challenges_active ON challenges(is_active);

-- =========================================
-- ANALYTICS INDEXES (HIGH VOLUME)
-- =========================================

-- User Analytics indexes (potentially millions of rows)
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX idx_user_analytics_created_at ON user_analytics(created_at DESC);
CREATE INDEX idx_user_analytics_session_id ON user_analytics(session_id);
CREATE INDEX idx_user_analytics_user_event ON user_analytics(user_id, event_type, created_at DESC);

-- Partial indexes for common event types
CREATE INDEX idx_user_analytics_assessment_completed ON user_analytics(user_id, created_at DESC)
WHERE event_type = 'assessment_completed';

CREATE INDEX idx_user_analytics_page_view ON user_analytics(user_id, page_url, created_at DESC)
WHERE event_type = 'page_view';

-- Session Analytics indexes
CREATE INDEX idx_session_analytics_user_id ON session_analytics(user_id);
CREATE INDEX idx_session_analytics_session_id ON session_analytics(session_id);
CREATE INDEX idx_session_analytics_pillar ON session_analytics(pillar_focus);
CREATE INDEX idx_session_analytics_mode ON session_analytics(mode);
CREATE INDEX idx_session_analytics_created_at ON session_analytics(created_at DESC);

-- Group Analytics indexes
CREATE INDEX idx_group_analytics_group_id ON group_analytics(group_id) WHERE group_id IS NOT NULL;
CREATE INDEX idx_group_analytics_team_id ON group_analytics(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX idx_group_analytics_type ON group_analytics(metric_type);
CREATE INDEX idx_group_analytics_period ON group_analytics(time_period);

-- Team Analytics indexes
CREATE INDEX idx_team_analytics_team_id ON team_analytics(team_id);
CREATE INDEX idx_team_analytics_type ON team_analytics(metric_type);
CREATE INDEX idx_team_analytics_period ON team_analytics(time_period);

-- =========================================
-- AI/ML INDEXES
-- =========================================

-- PILAR Knowledge Vectors indexes (vector search optimization)
CREATE INDEX idx_pilar_knowledge_vectors_knowledge_id ON pilar_knowledge_vectors(knowledge_id);

-- Vector similarity search (requires pgvector extension)
-- CREATE INDEX idx_pilar_knowledge_vectors_embedding ON pilar_knowledge_vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- User Profile Insights indexes
CREATE INDEX idx_user_profile_insights_user_id ON user_profile_insights(user_id);
CREATE INDEX idx_user_profile_insights_type ON user_profile_insights(insight_type);
CREATE INDEX idx_user_profile_insights_generated ON user_profile_insights(generated_at DESC);
CREATE INDEX idx_user_profile_insights_expires ON user_profile_insights(expires_at) WHERE expires_at IS NOT NULL;

-- Learning Pathways indexes
CREATE INDEX idx_learning_pathways_user_id ON learning_pathways(user_id);
CREATE INDEX idx_learning_pathways_status ON learning_pathways(status);
CREATE INDEX idx_learning_pathways_type ON learning_pathways(pathway_type);
CREATE INDEX idx_learning_pathways_pillar ON learning_pathways(pillar_focus);

-- AI Insight Questions indexes
CREATE INDEX idx_ai_insight_questions_user_id ON ai_insight_questions(user_id);
CREATE INDEX idx_ai_insight_questions_pillar_mode ON ai_insight_questions(pillar_id, mode);
CREATE INDEX idx_ai_insight_questions_type ON ai_insight_questions(question_type);
CREATE INDEX idx_ai_insight_questions_generated ON ai_insight_questions(generated_at DESC);

-- Assessment Guidance indexes
CREATE INDEX idx_assessment_guidance_user_id ON assessment_guidance(user_id);
CREATE INDEX idx_assessment_guidance_session_id ON assessment_guidance(session_id);
CREATE INDEX idx_assessment_guidance_type ON assessment_guidance(guidance_type);
CREATE INDEX idx_assessment_guidance_created_at ON assessment_guidance(created_at DESC);

-- =========================================
-- ADVANCED ENTITY INDEXES
-- =========================================

-- Battalions indexes
CREATE INDEX idx_battalions_commander_id ON battalions(commander_id);
CREATE INDEX idx_battalions_type ON battalions(battalion_type);
CREATE INDEX idx_battalions_active ON battalions(is_active);

-- Battalion Members indexes
CREATE INDEX idx_battalion_members_battalion_id ON battalion_members(battalion_id);
CREATE INDEX idx_battalion_members_user_id ON battalion_members(user_id);
CREATE INDEX idx_battalion_members_role ON battalion_members(role);

-- Cooperative Operations indexes
CREATE INDEX idx_cooperative_operations_status ON cooperative_operations(status);
CREATE INDEX idx_cooperative_operations_type ON cooperative_operations(operation_type);
CREATE INDEX idx_cooperative_operations_started ON cooperative_operations(started_at) WHERE started_at IS NOT NULL;
CREATE INDEX idx_cooperative_operations_completed ON cooperative_operations(completed_at) WHERE completed_at IS NOT NULL;

-- Group Rounds indexes
CREATE INDEX idx_group_rounds_group_id ON group_rounds(group_id);
CREATE INDEX idx_group_rounds_status ON group_rounds(status);
CREATE INDEX idx_group_rounds_pillar_mode ON group_rounds(pillar_id, mode);
CREATE INDEX idx_group_rounds_started ON group_rounds(started_at DESC);

-- Development Plans indexes
CREATE INDEX idx_development_plans_user_id ON development_plans(user_id);
CREATE INDEX idx_development_plans_status ON development_plans(status);
CREATE INDEX idx_development_plans_pillar_mode ON development_plans(pillar_id, mode);
CREATE INDEX idx_development_plans_target_date ON development_plans(target_completion_date);

-- Force Prompt Cards indexes
CREATE INDEX idx_force_prompt_cards_pillar_mode ON force_prompt_cards(pillar_id, mode);
CREATE INDEX idx_force_prompt_cards_type ON force_prompt_cards(card_type);
CREATE INDEX idx_force_prompt_cards_difficulty ON force_prompt_cards(difficulty);
CREATE INDEX idx_force_prompt_cards_active ON force_prompt_cards(is_active);

-- User Sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Data Enrichment Recommendations indexes
CREATE INDEX idx_data_enrichment_recommendations_user_id ON data_enrichment_recommendations(user_id);
CREATE INDEX idx_data_enrichment_recommendations_type ON data_enrichment_recommendations(recommendation_type);
CREATE INDEX idx_data_enrichment_recommendations_priority ON data_enrichment_recommendations(priority);
CREATE INDEX idx_data_enrichment_recommendations_status ON data_enrichment_recommendations(status);

-- Time Series Data indexes (optimized for time-based queries)
CREATE INDEX idx_time_series_data_user_id ON time_series_data(user_id);
CREATE INDEX idx_time_series_data_type ON time_series_data(data_type);
CREATE INDEX idx_time_series_data_timestamp ON time_series_data(timestamp DESC);
CREATE INDEX idx_time_series_data_user_type_time ON time_series_data(user_id, data_type, timestamp DESC);

-- PILAR Snapshots indexes
CREATE INDEX idx_pilar_snapshots_user_id ON pilar_snapshots(user_id);
CREATE INDEX idx_pilar_snapshots_type ON pilar_snapshots(snapshot_type);
CREATE INDEX idx_pilar_snapshots_captured ON pilar_snapshots(captured_at DESC);
CREATE INDEX idx_pilar_snapshots_expires ON pilar_snapshots(expires_at) WHERE expires_at IS NOT NULL;

-- Mastery Levels indexes
CREATE INDEX idx_mastery_levels_pillar_mode ON mastery_levels(pillar_id, mode);
CREATE INDEX idx_mastery_levels_number ON mastery_levels(level_number);
CREATE INDEX idx_mastery_levels_active ON mastery_levels(is_active);

-- Goal Mappings indexes
CREATE INDEX idx_goal_mappings_user_id ON goal_mappings(user_id);
CREATE INDEX idx_goal_mappings_mapped_at ON goal_mappings(mapped_at DESC);

-- User Actions indexes
CREATE INDEX idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX idx_user_actions_type ON user_actions(action_type);
CREATE INDEX idx_user_actions_created_at ON user_actions(created_at DESC);
CREATE INDEX idx_user_actions_pillar ON user_actions(pillar_id);

-- =========================================
-- COMPOSITE AND COVERING INDEXES
-- =========================================

-- Complex query optimization
CREATE INDEX idx_assessment_sessions_user_pillar_mode ON assessment_sessions(user_id, pillar_id, mode);
CREATE INDEX idx_user_progress_user_pillar_mode_level ON user_progress(user_id, pillar_id, mode, current_level);
CREATE INDEX idx_peer_feedback_giver_receiver_created ON peer_feedback(giver_id, receiver_id, created_at DESC);
CREATE INDEX idx_user_analytics_user_event_created ON user_analytics(user_id, event_type, created_at DESC);

-- Covering indexes (include frequently selected columns)
CREATE INDEX idx_pilar_assessments_user_pillar_covering ON pilar_assessments(user_id, pillar_id, mode, scores, created_at);
CREATE INDEX idx_assessment_sessions_user_stage_covering ON assessment_sessions(user_id, stage, pillar_id, mode, started_at, completed_at);
CREATE INDEX idx_user_progress_user_activity_covering ON user_progress(user_id, last_activity, current_level, experience_points);

-- =========================================
-- PARTIAL INDEXES FOR COMMON FILTERS
-- =========================================

-- Active sessions only
CREATE INDEX idx_assessment_sessions_active ON assessment_sessions(user_id, started_at DESC)
WHERE completed_at IS NULL;

-- Published CMS content only
CREATE INDEX idx_cms_content_published_active ON cms_content(published_date DESC, content_type)
WHERE status = 'published';

-- Active badges only
CREATE INDEX idx_badges_active_category ON badges(category, rarity)
WHERE is_active = true;

-- Non-expired insights
CREATE INDEX idx_user_profile_insights_active ON user_profile_insights(user_id, generated_at DESC)
WHERE expires_at IS NULL OR expires_at > NOW();

-- Active user sessions
CREATE INDEX idx_user_sessions_active_expiring ON user_sessions(user_id, expires_at)
WHERE is_active = true AND expires_at > NOW();

-- =========================================
-- INDEX MAINTENANCE
-- =========================================

-- Analyze all tables for query planning
ANALYZE;

-- Create index usage statistics view
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Create unused indexes view (for cleanup)
CREATE OR REPLACE VIEW unused_indexes AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- =========================================
-- VERIFICATION
-- =========================================

-- Verify all indexes were created
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;