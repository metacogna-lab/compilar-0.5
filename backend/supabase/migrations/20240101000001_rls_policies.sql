-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilar_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilar_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PILAR Assessments: Users can only access their own assessments
CREATE POLICY "Users can view their own assessments" ON pilar_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" ON pilar_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" ON pilar_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- Assessment Sessions: Users can only access their own sessions
CREATE POLICY "Users can view their own sessions" ON assessment_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" ON assessment_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON assessment_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- User Progress: Users can only access their own progress
CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- CMS Content: Public read for published content, authenticated users can create/update their own
CREATE POLICY "Anyone can view published content" ON cms_content
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can create content" ON cms_content
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own content" ON cms_content
  FOR UPDATE USING (auth.uid() = author_id);

-- PILAR Knowledge: Public read access
CREATE POLICY "Anyone can view PILAR knowledge" ON pilar_knowledge
  FOR SELECT USING (true);

-- Teams: Team members can view their teams, owners can manage
CREATE POLICY "Team members can view their teams" ON teams
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update their teams" ON teams
  FOR UPDATE USING (auth.uid() = owner_id);

-- Team Members: Team members can view team membership
CREATE POLICY "Team members can view membership" ON team_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.owner_id = auth.uid()
    )
  );

-- Team Invitations: Team members can view invitations for their teams
CREATE POLICY "Team members can view invitations" ON team_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_invitations.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage invitations" ON team_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_invitations.team_id
      AND teams.owner_id = auth.uid()
    )
  );

-- Study Groups: Similar to teams
CREATE POLICY "Study group members can view their groups" ON study_groups
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.study_group_id = study_groups.id
      AND study_group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create study groups" ON study_groups
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Study group owners can update their groups" ON study_groups
  FOR UPDATE USING (auth.uid() = owner_id);

-- User Gamification: Users can only access their own data
CREATE POLICY "Users can view their own gamification" ON user_gamification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification" ON user_gamification
  FOR ALL USING (auth.uid() = user_id);

-- Badges: Public read, admin management
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

-- User Badges: Users can view their own badges
CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create user badges" ON user_badges
  FOR INSERT WITH CHECK (true);

-- Trophies: Public read, admin management
CREATE POLICY "Anyone can view trophies" ON trophies
  FOR SELECT USING (true);

-- User Trophies: Users can view their own trophies
CREATE POLICY "Users can view their own trophies" ON user_trophies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create user trophies" ON user_trophies
  FOR INSERT WITH CHECK (true);

-- Coach Conversations: Users can only access their own conversations
CREATE POLICY "Users can view their own conversations" ON coach_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" ON coach_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON coach_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- User Analytics: Users can view their own analytics
CREATE POLICY "Users can view their own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create user analytics" ON user_analytics
  FOR INSERT WITH CHECK (true);

-- Session Analytics: Users can view their own session analytics
CREATE POLICY "Users can view their own session analytics" ON session_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create session analytics" ON session_analytics
  FOR INSERT WITH CHECK (true);