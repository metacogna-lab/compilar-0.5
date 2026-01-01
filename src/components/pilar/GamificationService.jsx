/**
 * ComPILAR Gamification Service
 * Leadership simulation based on cooperative excellence and group dynamics
 * 
 * Core Model: Five PILARs representing leadership qualities
 * - Prospects: Future outlook and group goal achievement belief
 * - Involved: Active participation and engagement level
 * - Liked: Social acceptance and interpersonal bonds
 * - Agency: Autonomy and decision-making capacity
 * - Respect: Recognition of competence and contributions
 */

// =============================================================================
// COMPILAR MODEL CONFIGURATION
// =============================================================================

// The Five PILARs of Leadership
export const COMPILAR_PILLARS = {
  prospects: {
    id: 'prospects',
    name: 'Prospects',
    description: 'Belief in group goal achievement and future outlook',
    icon: '🎯',
    color: 'violet',
    forces: ['GrpProsp', 'OwnProsp', 'NormExp'],
  },
  involved: {
    id: 'involved',
    name: 'Involved',
    description: 'Active participation and engagement in group activities',
    icon: '🤝',
    color: 'blue',
    forces: ['DirRecip', 'IndRecip', 'Participation'],
  },
  liked: {
    id: 'liked',
    name: 'Liked',
    description: 'Social acceptance, trust, and interpersonal bonds',
    icon: '💖',
    color: 'pink',
    forces: ['Popularity', 'Trust', 'Belonging'],
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    description: 'Autonomy, initiative, and decision-making capacity',
    icon: '⚡',
    color: 'emerald',
    forces: ['Autonomy', 'Initiative', 'Ownership'],
  },
  respect: {
    id: 'respect',
    name: 'Respect',
    description: 'Recognition of competence and valued contributions',
    icon: '👑',
    color: 'amber',
    forces: ['IncResp', 'OutResp', 'Status'],
  },
};

// Psychological Forces (19 forces mapped to PILARs)
export const PSYCHOLOGICAL_FORCES = {
  // Prospects Forces
  GrpProsp: { name: 'Group Prospects', pillar: 'prospects', type: 'egalitarian', description: 'Belief in collective goal achievement' },
  OwnProsp: { name: 'Own Prospects', pillar: 'prospects', type: 'hierarchical', description: 'Personal advancement expectations' },
  NormExp: { name: 'Normative Expression', pillar: 'prospects', type: 'hierarchical', description: 'Support or suppression of change' },
  DivsExp: { name: 'Diverse Expression', pillar: 'prospects', type: 'egalitarian', description: 'Openness to varied perspectives' },
  
  // Involved Forces
  DirRecip: { name: 'Direct Reciprocity', pillar: 'involved', type: 'hierarchical', description: 'Help with expected repayment' },
  IndRecip: { name: 'Indirect Reciprocity', pillar: 'involved', type: 'egalitarian', description: 'Help without direct return expectation' },
  Participation: { name: 'Active Participation', pillar: 'involved', type: 'both', description: 'Engagement in group activities' },
  
  // Liked Forces
  Popularity: { name: 'Popularity', pillar: 'liked', type: 'egalitarian', description: 'Social standing among peers' },
  Trust: { name: 'Trust', pillar: 'liked', type: 'both', description: 'Reliability and dependability' },
  Belonging: { name: 'Belonging', pillar: 'liked', type: 'both', description: 'Sense of group membership' },
  
  // Agency Forces
  Autonomy: { name: 'Autonomy', pillar: 'agency', type: 'both', description: 'Freedom to make decisions' },
  Initiative: { name: 'Initiative', pillar: 'agency', type: 'both', description: 'Proactive action-taking' },
  Ownership: { name: 'Ownership', pillar: 'agency', type: 'both', description: 'Responsibility for outcomes' },
  
  // Respect Forces
  IncResp: { name: 'Incoming Respect', pillar: 'respect', type: 'hierarchical', description: 'Respect received for competence' },
  OutResp: { name: 'Outgoing Respect', pillar: 'respect', type: 'egalitarian', description: 'Respect given to others' },
  Status: { name: 'Status', pillar: 'respect', type: 'hierarchical', description: 'Formal position or seniority' },
};

// Game Phases
export const GAME_PHASES = {
  phase1: {
    id: 'phase1',
    name: 'Collaborative Familiarization',
    description: 'Learn to manage a single PILAR through incident response',
    unlockLevel: 1,
    focus: 'single_pillar',
  },
  phase2: {
    id: 'phase2',
    name: 'Egalitarian Leadership',
    description: 'Manage full E-ComPILAR suite representing team individuals',
    unlockLevel: 3,
    focus: 'egalitarian',
  },
  phase3: {
    id: 'phase3',
    name: 'Hierarchical Leadership',
    description: 'Navigate H-ComPILAR forces and formal structures',
    unlockLevel: 5,
    focus: 'hierarchical',
  },
  phase4: {
    id: 'phase4',
    name: 'Mission Command Agility',
    description: 'Dynamically switch between leadership models',
    unlockLevel: 7,
    focus: 'adaptive',
  },
};

// Points configuration aligned with ComPILAR
export const POINTS_CONFIG = {
  // Core activities
  assessment_completed: 100,
  assessment_retake: 50,
  activity_completed: 25,
  goal_completed: 75,
  resource_viewed: 10,
  daily_login: 5,
  streak_bonus: 10,
  
  // ComPILAR specific
  incident_resolved: 40,
  force_card_played: 15,
  pillar_balanced: 60,
  team_cohesion_improved: 80,
  leadership_decision: 35,
  phase_completed: 200,
  
  // Cooperation bonuses
  group_participation: 30,
  team_challenge_contribution: 45,
  peer_support_given: 20,
  collaborative_win: 100,
  
  // Milestone bonuses
  first_pillar_complete: 150,
  all_pillars_complete: 500,
  mission_success: 250,
};

// =============================================================================
// BADGE DEFINITIONS - ComPILAR Leadership Simulation
// =============================================================================

export const BADGES = [
  // === PILAR STARTER BADGES (30%) - Prospects, Involved, Liked, Agency, Respect ===
  { id: 'prospects_starter', name: 'Visionary', description: 'Demonstrate 30%+ in Prospects', icon: '🎯', pillar: 'prospects', requirement: { type: 'score', pillar: 'purpose', value: 30 } },
  { id: 'involved_starter', name: 'Engaged', description: 'Demonstrate 30%+ in Involved', icon: '🤝', pillar: 'involved', requirement: { type: 'score', pillar: 'interpersonal', value: 30 } },
  { id: 'liked_starter', name: 'Trusted', description: 'Demonstrate 30%+ in Liked', icon: '💖', pillar: 'liked', requirement: { type: 'score', pillar: 'learning', value: 30 } },
  { id: 'agency_starter', name: 'Initiator', description: 'Demonstrate 30%+ in Agency', icon: '⚡', pillar: 'agency', requirement: { type: 'score', pillar: 'action', value: 30 } },
  { id: 'respect_starter', name: 'Valued', description: 'Demonstrate 30%+ in Respect', icon: '👑', pillar: 'respect', requirement: { type: 'score', pillar: 'resilience', value: 30 } },
  
  // === PILAR ADEPT BADGES (60%) ===
  { id: 'prospects_adept', name: 'Goal Setter', description: 'Demonstrate 60%+ in Prospects', icon: '🏹', pillar: 'prospects', requirement: { type: 'score', pillar: 'purpose', value: 60 } },
  { id: 'involved_adept', name: 'Contributor', description: 'Demonstrate 60%+ in Involved', icon: '🌉', pillar: 'involved', requirement: { type: 'score', pillar: 'interpersonal', value: 60 } },
  { id: 'liked_adept', name: 'Connector', description: 'Demonstrate 60%+ in Liked', icon: '🤗', pillar: 'liked', requirement: { type: 'score', pillar: 'learning', value: 60 } },
  { id: 'agency_adept', name: 'Decision Maker', description: 'Demonstrate 60%+ in Agency', icon: '🎯', pillar: 'agency', requirement: { type: 'score', pillar: 'action', value: 60 } },
  { id: 'respect_adept', name: 'Influential', description: 'Demonstrate 60%+ in Respect', icon: '⭐', pillar: 'respect', requirement: { type: 'score', pillar: 'resilience', value: 60 } },
  
  // === PILAR MASTERY BADGES (85%) ===
  { id: 'prospects_master', name: 'Strategist', description: 'Master Prospects at 85%+', icon: '🌟', pillar: 'prospects', requirement: { type: 'score', pillar: 'purpose', value: 85 } },
  { id: 'involved_master', name: 'Catalyst', description: 'Master Involved at 85%+', icon: '🔥', pillar: 'involved', requirement: { type: 'score', pillar: 'interpersonal', value: 85 } },
  { id: 'liked_master', name: 'Heart of Team', description: 'Master Liked at 85%+', icon: '💎', pillar: 'liked', requirement: { type: 'score', pillar: 'learning', value: 85 } },
  { id: 'agency_master', name: 'Empowered', description: 'Master Agency at 85%+', icon: '🦅', pillar: 'agency', requirement: { type: 'score', pillar: 'action', value: 85 } },
  { id: 'respect_master', name: 'Revered', description: 'Master Respect at 85%+', icon: '🏆', pillar: 'respect', requirement: { type: 'score', pillar: 'resilience', value: 85 } },
  
  // === COOPERATIVE EXCELLENCE BADGES ===
  { id: 'cooperative_win', name: 'WIN Together', description: 'Achieve a collaborative team victory', icon: '🏅', requirement: { type: 'collaborative_wins', value: 1 } },
  { id: 'team_synergy', name: 'Team Synergy', description: 'Help team achieve balanced PILARs', icon: '⚖️', requirement: { type: 'team_balance', value: 1 } },
  { id: 'cohesion_builder', name: 'Cohesion Builder', description: 'Improve team cohesion 3 times', icon: '🔗', requirement: { type: 'cohesion_improvements', value: 3 } },
  
  // === LEADERSHIP PHASE BADGES ===
  { id: 'phase1_complete', name: 'Collaborator', description: 'Complete Phase 1: Familiarization', icon: '📘', requirement: { type: 'phase_completed', value: 1 } },
  { id: 'phase2_complete', name: 'Egalitarian Leader', description: 'Complete Phase 2: Egalitarian model', icon: '📗', requirement: { type: 'phase_completed', value: 2 } },
  { id: 'phase3_complete', name: 'Hierarchical Leader', description: 'Complete Phase 3: Hierarchical model', icon: '📙', requirement: { type: 'phase_completed', value: 3 } },
  { id: 'phase4_complete', name: 'Adaptive Commander', description: 'Complete Phase 4: Mission Command', icon: '📕', requirement: { type: 'phase_completed', value: 4 } },
  
  // === INCIDENT RESPONSE BADGES ===
  { id: 'incident_responder', name: 'First Responder', description: 'Resolve your first incident', icon: '🚨', requirement: { type: 'incidents_resolved', value: 1 } },
  { id: 'crisis_manager', name: 'Crisis Manager', description: 'Resolve 10 incidents', icon: '🛡️', requirement: { type: 'incidents_resolved', value: 10 } },
  { id: 'tactical_genius', name: 'Tactical Genius', description: 'Resolve 25 incidents', icon: '🧠', requirement: { type: 'incidents_resolved', value: 25 } },
  
  // === FORCE CARD BADGES ===
  { id: 'force_apprentice', name: 'Force Apprentice', description: 'Play 10 force cards', icon: '🃏', requirement: { type: 'force_cards_played', value: 10 } },
  { id: 'force_strategist', name: 'Force Strategist', description: 'Play 50 force cards', icon: '🎴', requirement: { type: 'force_cards_played', value: 50 } },
  
  // === BALANCE BADGES ===
  { id: 'balanced_starter', name: 'Balanced Explorer', description: 'Score 40%+ in all PILARs', icon: '⚖️', requirement: { type: 'all_pillars_min', value: 40 } },
  { id: 'balanced_adept', name: 'Harmony Achieved', description: 'Score 60%+ in all PILARs', icon: '☯️', requirement: { type: 'all_pillars_min', value: 60 } },
  { id: 'balanced_master', name: 'Transcendent Leader', description: 'Score 80%+ in all PILARs', icon: '🔆', requirement: { type: 'all_pillars_min', value: 80 } },
  
  // === ACHIEVEMENT BADGES ===
  { id: 'first_steps', name: 'First Steps', description: 'Complete your first assessment', icon: '👣', requirement: { type: 'assessments', value: 1 } },
  { id: 'explorer', name: 'Explorer', description: 'Assess all 5 PILARs', icon: '🗺️', requirement: { type: 'all_pillars' } },
  { id: 'deep_diver', name: 'Deep Diver', description: 'Retake an assessment 3 times', icon: '🔍', requirement: { type: 'retakes', value: 3 } },
  
  // === CONSISTENCY BADGES ===
  { id: 'streak_3', name: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥', requirement: { type: 'streak', value: 3 } },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '💪', requirement: { type: 'streak', value: 7 } },
  { id: 'streak_14', name: 'Fortnight Focus', description: 'Maintain a 14-day streak', icon: '✨', requirement: { type: 'streak', value: 14 } },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🏆', requirement: { type: 'streak', value: 30 } },
  
  // === POINTS BADGES ===
  { id: 'century', name: 'Century', description: 'Earn 100 points', icon: '💯', requirement: { type: 'points', value: 100 } },
  { id: 'rising_star', name: 'Rising Star', description: 'Earn 500 points', icon: '⭐', requirement: { type: 'points', value: 500 } },
  { id: 'champion', name: 'Champion', description: 'Earn 1,000 points', icon: '👑', requirement: { type: 'points', value: 1000 } },
  { id: 'legend', name: 'Legend', description: 'Earn 5,000 points', icon: '🏅', requirement: { type: 'points', value: 5000 } },
  
  // === TEAM COLLABORATION BADGES ===
  { id: 'team_player', name: 'Team Player', description: 'Join your first group', icon: '🤝', requirement: { type: 'groups', value: 1 } },
  { id: 'collaborator', name: 'Collaborator', description: 'Join 3 groups', icon: '👥', requirement: { type: 'groups', value: 3 } },
  { id: 'top_collaborator', name: 'Top Collaborator', description: 'Complete 5 group activities', icon: '🌟', requirement: { type: 'group_activities', value: 5 } },
  { id: 'challenge_champion', name: 'Challenge Champion', description: 'Complete 3 team challenges', icon: '🎖️', requirement: { type: 'team_challenges', value: 3 } },
  
  // === MISSION SUCCESS BADGES ===
  { id: 'mission_contributor', name: 'Mission Contributor', description: 'Contribute to team mission success', icon: '🎯', requirement: { type: 'mission_contributions', value: 1 } },
  { id: 'mission_achiever', name: 'Mission Achiever', description: 'Lead 3 successful missions', icon: '🏁', requirement: { type: 'missions_led', value: 3 } },
];

// =============================================================================
// LEVEL & RANK SYSTEM
// =============================================================================

// Level thresholds for progression
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000
];

// Leadership Rank Titles (aligned with cooperative excellence)
export const RANK_TITLES = [
  'Recruit',           // Level 1
  'Team Member',       // Level 2
  'Contributor',       // Level 3
  'Supporter',         // Level 4
  'Collaborator',      // Level 5
  'Coordinator',       // Level 6
  'Facilitator',       // Level 7
  'Leader',            // Level 8
  'Commander',         // Level 9
  'Strategist',        // Level 10
  'Mission Master',    // Level 11+
];

// Get rank title for a level
export function getRankTitle(level) {
  return RANK_TITLES[Math.min(level - 1, RANK_TITLES.length - 1)] || 'Mission Master';
}

export function calculateLevel(points) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Award points for specific actions
export async function awardPoints(base44, reason, pillar = null, points = null) {
  try {
    const pointsToAward = points || POINTS_CONFIG[reason] || 0;
    if (pointsToAward === 0) return;

    const gamificationRecords = await base44.entities.UserGamification.list();
    let gamification = gamificationRecords[0];

    const newEntry = {
      points: pointsToAward,
      reason,
      pillar,
      earned_at: new Date().toISOString()
    };

    if (gamification) {
      const updatedHistory = [...(gamification.points_history || []), newEntry];
      const newTotal = (gamification.total_points || 0) + pointsToAward;
      const newLevel = calculateLevel(newTotal);

      await base44.entities.UserGamification.update(gamification.id, {
        total_points: newTotal,
        level: newLevel,
        points_history: updatedHistory
      });
    } else {
      await base44.entities.UserGamification.create({
        total_points: pointsToAward,
        level: calculateLevel(pointsToAward),
        points_history: [newEntry],
        badges: [],
        streaks: { current_streak: 0, longest_streak: 0 },
        pillar_milestones: {}
      });
    }

    return pointsToAward;
  } catch (error) {
    console.error('Failed to award points:', error);
    return 0;
  }
}

export function getPointsToNextLevel(points) {
  const level = calculateLevel(points);
  if (level >= LEVEL_THRESHOLDS.length) return 0;
  return LEVEL_THRESHOLDS[level] - points;
}

export function getLevelProgress(points) {
  const level = calculateLevel(points);
  if (level >= LEVEL_THRESHOLDS.length) return 100;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level];
  return Math.round(((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
}

export function checkBadgeEligibility(gamification, userProfile, assessments, groups, pathways = []) {
  const earnedBadgeIds = gamification?.badges?.map(b => b.id) || [];
  const newBadges = [];
  
  const pillarScores = userProfile?.pillar_scores || {};
  const completedPillars = Object.keys(pillarScores).filter(p => pillarScores[p] > 0);
  const allPillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];
  
  for (const badge of BADGES) {
    if (earnedBadgeIds.includes(badge.id)) continue;
    
    let earned = false;
    const req = badge.requirement;
    
    switch (req.type) {
      case 'score':
        earned = (pillarScores[req.pillar] || 0) >= req.value;
        break;
      case 'assessments':
        earned = assessments.filter(a => a.completed).length >= req.value;
        break;
      case 'all_pillars':
        earned = completedPillars.length >= 5;
        break;
      case 'all_pillars_min':
        earned = allPillars.every(p => (pillarScores[p] || 0) >= req.value);
        break;
      case 'streak':
        earned = (gamification?.streaks?.current_streak || 0) >= req.value;
        break;
      case 'groups':
        earned = groups.filter(g => g.participants?.some(p => p.email === gamification?.created_by)).length >= req.value;
        break;
      case 'group_activities':
        const groupActivities = gamification?.points_history?.filter(p => p.reason?.includes('group')) || [];
        earned = groupActivities.length >= req.value;
        break;
      case 'team_challenges':
        const teamChallenges = gamification?.points_history?.filter(p => p.reason?.includes('challenge')) || [];
        earned = teamChallenges.length >= req.value;
        break;
      case 'points':
        earned = (gamification?.total_points || 0) >= req.value;
        break;
      case 'retakes':
        const retakeCounts = {};
        assessments.forEach(a => {
          if (a.completed) retakeCounts[a.pillar] = (retakeCounts[a.pillar] || 0) + 1;
        });
        earned = Object.values(retakeCounts).some(count => count >= req.value);
        break;
      case 'pathways_started':
        earned = pathways.length >= req.value;
        break;
      case 'pathways_completed':
        earned = pathways.filter(p => p.status === 'completed').length >= req.value;
        break;
      case 'reflections':
        const reflections = gamification?.points_history?.filter(p => p.reason?.includes('reflection')) || [];
        earned = reflections.length >= req.value;
        break;
      case 'improvements':
        // Check if any pillar has been improved multiple times
        const pillarAttempts = {};
        assessments.filter(a => a.completed).forEach(a => {
          if (!pillarAttempts[a.pillar]) pillarAttempts[a.pillar] = [];
          pillarAttempts[a.pillar].push(a.overall_score);
        });
        let improvements = 0;
        Object.values(pillarAttempts).forEach(scores => {
          for (let i = 1; i < scores.length; i++) {
            if (scores[i] > scores[i-1]) improvements++;
          }
        });
        earned = improvements >= req.value;
        break;
    }
    
    if (earned) {
      newBadges.push({
        ...badge,
        earned_at: new Date().toISOString()
      });
    }
  }
  
  return newBadges;
}

// =============================================================================
// INCIDENT SCENARIOS - Leadership Challenges
// =============================================================================

export const INCIDENT_SCENARIOS = [
  {
    id: 'conflict_resolution',
    title: 'Team Conflict',
    description: 'Two team members have a disagreement about task priorities',
    pillar_focus: 'liked',
    forces_involved: ['Trust', 'Belonging', 'IndRecip'],
    difficulty: 'medium',
    points: 40,
  },
  {
    id: 'task_delegation',
    title: 'Resource Allocation',
    description: 'Limited resources need to be distributed among competing priorities',
    pillar_focus: 'agency',
    forces_involved: ['Autonomy', 'Ownership', 'Status'],
    difficulty: 'medium',
    points: 40,
  },
  {
    id: 'morale_boost',
    title: 'Low Team Morale',
    description: 'Team motivation has dropped after a setback',
    pillar_focus: 'prospects',
    forces_involved: ['GrpProsp', 'NormExp', 'Participation'],
    difficulty: 'easy',
    points: 30,
  },
  {
    id: 'new_member',
    title: 'Onboarding Challenge',
    description: 'A new team member needs to be integrated effectively',
    pillar_focus: 'involved',
    forces_involved: ['Belonging', 'IndRecip', 'Participation'],
    difficulty: 'easy',
    points: 30,
  },
  {
    id: 'recognition',
    title: 'Recognition Gap',
    description: 'Team members feel their contributions are not being acknowledged',
    pillar_focus: 'respect',
    forces_involved: ['IncResp', 'OutResp', 'Status'],
    difficulty: 'medium',
    points: 40,
  },
  {
    id: 'deadline_pressure',
    title: 'Deadline Pressure',
    description: 'Critical deadline approaching with incomplete work',
    pillar_focus: 'agency',
    forces_involved: ['Initiative', 'Ownership', 'DirRecip'],
    difficulty: 'hard',
    points: 50,
  },
  {
    id: 'cross_team',
    title: 'Cross-Team Collaboration',
    description: 'Need to coordinate with another team with different priorities',
    pillar_focus: 'involved',
    forces_involved: ['DirRecip', 'Trust', 'Popularity'],
    difficulty: 'hard',
    points: 50,
  },
  {
    id: 'leadership_transition',
    title: 'Leadership Transition',
    description: 'Team is adapting to new leadership or organizational change',
    pillar_focus: 'prospects',
    forces_involved: ['Status', 'NormExp', 'OwnProsp'],
    difficulty: 'hard',
    points: 50,
  },
];

// =============================================================================
// ACTIVITY GENERATION - Aligned with ComPILAR
// =============================================================================

export function generatePlanActivities(pillar, score) {
  // Map original pillars to ComPILAR PILARs
  const pilarMapping = {
    purpose: 'prospects',
    interpersonal: 'involved',
    learning: 'liked',
    action: 'agency',
    resilience: 'respect',
  };
  
  const activities = {
    purpose: [
      { title: 'Group Vision Exercise', description: 'Facilitate a team discussion about shared goals and future outlook', type: 'group_activity', points: 35 },
      { title: 'Prospects Assessment', description: 'Evaluate your belief in the team\'s ability to achieve objectives', type: 'reflection', points: 25 },
      { title: 'Goal Alignment Session', description: 'Align personal goals with team mission', type: 'practice', points: 30 },
    ],
    interpersonal: [
      { title: 'Reciprocity Practice', description: 'Identify ways to support team members without expecting immediate return', type: 'practice', points: 25 },
      { title: 'Engagement Audit', description: 'Assess your participation level in team activities', type: 'reflection', points: 20 },
      { title: 'Collaboration Challenge', description: 'Partner with a team member on a shared objective', type: 'group_activity', points: 35 },
    ],
    learning: [
      { title: 'Trust Building Exercise', description: 'Practice vulnerability and openness with team members', type: 'group_activity', points: 35 },
      { title: 'Belonging Reflection', description: 'Reflect on your sense of connection to the team', type: 'reflection', points: 20 },
      { title: 'Social Bond Activity', description: 'Initiate a non-work interaction with team members', type: 'practice', points: 25 },
    ],
    action: [
      { title: 'Initiative Sprint', description: 'Take ownership of a team challenge without being asked', type: 'practice', points: 30 },
      { title: 'Decision Making Exercise', description: 'Practice making and communicating decisions confidently', type: 'practice', points: 25 },
      { title: 'Autonomy Assessment', description: 'Evaluate where you can take more ownership', type: 'reflection', points: 20 },
    ],
    resilience: [
      { title: 'Respect Mapping', description: 'Identify how respect flows in your team', type: 'reflection', points: 20 },
      { title: 'Recognition Practice', description: 'Acknowledge a team member\'s contribution today', type: 'practice', points: 15 },
      { title: 'Status Reflection', description: 'Reflect on how formal and informal status affects team dynamics', type: 'reflection', points: 25 },
    ],
  };
  
  const activityCount = score < 50 ? 3 : score < 70 ? 2 : 1;
  return (activities[pillar] || []).slice(0, activityCount).map((a, i) => ({
    ...a,
    id: `${pillar}_${i}_${Date.now()}`,
    pillar,
    compilar_pillar: pilarMapping[pillar],
    completed: false
  }));
}

// =============================================================================
// COOPERATIVE WIN CALCULATION
// =============================================================================

export function calculateTeamCohesion(memberScores) {
  if (!memberScores || memberScores.length === 0) return 0;
  
  const avgScores = memberScores.reduce((acc, member) => {
    Object.keys(member.pillar_scores || {}).forEach(pillar => {
      acc[pillar] = (acc[pillar] || 0) + (member.pillar_scores[pillar] || 0);
    });
    return acc;
  }, {});
  
  const pillars = Object.keys(avgScores);
  pillars.forEach(p => avgScores[p] /= memberScores.length);
  
  // Calculate balance (lower variance = higher cohesion)
  const values = Object.values(avgScores);
  if (values.length === 0) return 0;
  
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  const balanceScore = Math.max(0, 100 - Math.sqrt(variance));
  
  return Math.round(balanceScore);
}

export function isCooperativeWin(teamCohesion, teamAvgScore, challengeCompleted) {
  return teamCohesion >= 70 && teamAvgScore >= 60 && challengeCompleted;
}