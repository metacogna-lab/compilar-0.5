-- RLS Policies for missing entities
-- Enable Row Level Security on all new tables
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilar_knowledge_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE battalions ENABLE ROW LEVEL SECURITY;
ALTER TABLE battalion_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insight_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE force_prompt_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_enrichment_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_series_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilar_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_mappings ENABLE ROW LEVEL SECURITY;

-- User Actions: Users can only access their own actions
CREATE POLICY "Users can view their own actions" ON user_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own actions" ON user_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Group Rounds: Group members can view their group rounds
CREATE POLICY "Group members can view group rounds" ON group_rounds
  FOR SELECT USING (
    auth.uid() = ANY(participants) OR
    EXISTS (
      SELECT 1 FROM study_groups
      WHERE study_groups.id = group_rounds.group_id
      AND (study_groups.owner_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM study_group_members
             WHERE study_group_members.study_group_id = study_groups.id
             AND study_group_members.user_id = auth.uid()
           ))
    )
  );

CREATE POLICY "Group owners can manage rounds" ON group_rounds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM study_groups
      WHERE study_groups.id = group_rounds.group_id
      AND study_groups.owner_id = auth.uid()
    )
  );

-- Chat Messages: Users can access messages in their conversations
CREATE POLICY "Users can view their conversation messages" ON chat_messages
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM coach_conversations
      WHERE coach_conversations.id = chat_messages.conversation_id
      AND coach_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Development Plans: Users can only access their own plans
CREATE POLICY "Users can view their own development plans" ON development_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own development plans" ON development_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own development plans" ON development_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Challenges: Public read, admin management
CREATE POLICY "Anyone can view active challenges" ON challenges
  FOR SELECT USING (is_active = true);

-- Group Analytics: Group members can view their analytics
CREATE POLICY "Group members can view group analytics" ON group_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM study_groups
      WHERE study_groups.id = group_analytics.group_id
      AND (study_groups.owner_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM study_group_members
             WHERE study_group_members.study_group_id = study_groups.id
             AND study_group_members.user_id = auth.uid()
           ))
    ) OR
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = group_analytics.team_id
      AND (teams.owner_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM team_members
             WHERE team_members.team_id = teams.id
             AND team_members.user_id = auth.uid()
           ))
    )
  );

-- PILAR Knowledge Vectors: Public read access
CREATE POLICY "Anyone can view knowledge vectors" ON pilar_knowledge_vectors
  FOR SELECT USING (true);

-- User Profile Insights: Users can only access their own insights
CREATE POLICY "Users can view their own profile insights" ON user_profile_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create user profile insights" ON user_profile_insights
  FOR INSERT WITH CHECK (true);

-- Learning Pathways: Users can only access their own pathways
CREATE POLICY "Users can view their own learning pathways" ON learning_pathways
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning pathways" ON learning_pathways
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning pathways" ON learning_pathways
  FOR UPDATE USING (auth.uid() = user_id);

-- Battalions: Public read for active battalions, members can view details
CREATE POLICY "Anyone can view active battalions" ON battalions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Battalion commanders can manage battalions" ON battalions
  FOR ALL USING (auth.uid() = commander_id);

-- Battalion Members: Battalion members can view membership
CREATE POLICY "Battalion members can view membership" ON battalion_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM battalion_members bm
      WHERE bm.battalion_id = battalion_members.battalion_id
      AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY "Battalion commanders can manage members" ON battalion_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM battalions
      WHERE battalions.id = battalion_members.battalion_id
      AND battalions.commander_id = auth.uid()
    )
  );

-- Cooperative Operations: Participants can view their operations
CREATE POLICY "Operation participants can view operations" ON cooperative_operations
  FOR SELECT USING (auth.uid() = ANY(participants));

-- Team Analytics: Team members can view their analytics
CREATE POLICY "Team members can view team analytics" ON team_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_analytics.team_id
      AND (teams.owner_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM team_members
             WHERE team_members.team_id = teams.id
             AND team_members.user_id = auth.uid()
           ))
    )
  );

-- Peer Feedback: Users can view feedback they've given or received
CREATE POLICY "Users can view their peer feedback" ON peer_feedback
  FOR SELECT USING (auth.uid() IN (giver_id, receiver_id));

CREATE POLICY "Users can create peer feedback" ON peer_feedback
  FOR INSERT WITH CHECK (auth.uid() = giver_id);

CREATE POLICY "Users can update their own feedback" ON peer_feedback
  FOR UPDATE USING (auth.uid() = giver_id);

-- AI Insight Questions: Users can only access their own questions
CREATE POLICY "Users can view their own insight questions" ON ai_insight_questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create insight questions" ON ai_insight_questions
  FOR INSERT WITH CHECK (true);

-- User Sessions: Users can only access their own sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create user sessions" ON user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Force Prompt Cards: Public read access
CREATE POLICY "Anyone can view force prompt cards" ON force_prompt_cards
  FOR SELECT USING (is_active = true);

-- Assessment Guidance: Users can only access their own guidance
CREATE POLICY "Users can view their own assessment guidance" ON assessment_guidance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create assessment guidance" ON assessment_guidance
  FOR INSERT WITH CHECK (true);

-- Data Enrichment Recommendations: Users can only access their own recommendations
CREATE POLICY "Users can view their own recommendations" ON data_enrichment_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" ON data_enrichment_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations" ON data_enrichment_recommendations
  FOR INSERT WITH CHECK (true);

-- Time Series Data: Users can only access their own data
CREATE POLICY "Users can view their own time series data" ON time_series_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create time series data" ON time_series_data
  FOR INSERT WITH CHECK (true);

-- PILAR Snapshots: Users can only access their own snapshots
CREATE POLICY "Users can view their own snapshots" ON pilar_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create snapshots" ON pilar_snapshots
  FOR INSERT WITH CHECK (true);

-- Mastery Levels: Public read access
CREATE POLICY "Anyone can view mastery levels" ON mastery_levels
  FOR SELECT USING (is_active = true);

-- Goal Mappings: Users can only access their own mappings
CREATE POLICY "Users can view their own goal mappings" ON goal_mappings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goal mappings" ON goal_mappings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal mappings" ON goal_mappings
  FOR UPDATE USING (auth.uid() = user_id);