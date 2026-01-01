/**
 * User Intent Analytics Layer
 * Non-visual analytics engine that interprets user intent, alignment with pillars,
 * and generates competency insights for the radial map display.
 */

// Pillar alignment weights based on Ben Heslop's PILAR research
const PILLAR_ALIGNMENT_FACTORS = {
  purpose: {
    keywords: ['direction', 'meaning', 'values', 'goal', 'vision', 'mission', 'why', 'purpose', 'motivation', 'drive'],
    behavioralIndicators: ['goal_setting', 'reflection', 'planning', 'vision_articulation'],
    assessmentWeight: 0.4,
    activityWeight: 0.3,
    consistencyWeight: 0.3,
  },
  interpersonal: {
    keywords: ['team', 'collaborate', 'communicate', 'empathy', 'relationship', 'trust', 'conflict', 'listen', 'connect'],
    behavioralIndicators: ['group_participation', 'feedback_given', 'collaboration', 'mentoring'],
    assessmentWeight: 0.35,
    activityWeight: 0.35,
    consistencyWeight: 0.3,
  },
  learning: {
    keywords: ['learn', 'grow', 'develop', 'skill', 'knowledge', 'curious', 'improve', 'study', 'understand', 'master'],
    behavioralIndicators: ['course_completion', 'reading', 'practice', 'reflection'],
    assessmentWeight: 0.3,
    activityWeight: 0.4,
    consistencyWeight: 0.3,
  },
  action: {
    keywords: ['do', 'execute', 'accomplish', 'complete', 'achieve', 'momentum', 'discipline', 'progress', 'results'],
    behavioralIndicators: ['task_completion', 'consistency', 'goal_achievement', 'initiative'],
    assessmentWeight: 0.3,
    activityWeight: 0.4,
    consistencyWeight: 0.3,
  },
  resilience: {
    keywords: ['stress', 'recover', 'adapt', 'overcome', 'persist', 'challenge', 'setback', 'bounce', 'cope', 'endure'],
    behavioralIndicators: ['stress_management', 'recovery_speed', 'emotional_regulation', 'persistence'],
    assessmentWeight: 0.35,
    activityWeight: 0.3,
    consistencyWeight: 0.35,
  },
};

/**
 * Analyze user's pillar alignment based on their activity patterns
 */
export function analyzeUserAlignment(userProfile, assessments, actions, gamification) {
  const alignment = {};
  const scores = userProfile?.pillar_scores || {};
  
  Object.keys(PILLAR_ALIGNMENT_FACTORS).forEach(pillar => {
    const factors = PILLAR_ALIGNMENT_FACTORS[pillar];
    
    // Assessment score component
    const assessmentScore = scores[pillar] || 0;
    
    // Activity frequency component
    const pillarAssessments = assessments?.filter(a => a.pillar === pillar && a.completed) || [];
    const activityScore = Math.min(100, pillarAssessments.length * 20);
    
    // Consistency component (based on streaks and regular engagement)
    const streakBonus = Math.min(30, (gamification?.streaks?.current_streak || 0) * 3);
    const consistencyScore = Math.min(100, streakBonus + (pillarAssessments.length > 1 ? 40 : 0));
    
    // Weighted composite score
    alignment[pillar] = Math.round(
      assessmentScore * factors.assessmentWeight +
      activityScore * factors.activityWeight +
      consistencyScore * factors.consistencyWeight
    );
  });
  
  return alignment;
}

/**
 * Detect user's primary intent based on recent actions and profile
 */
export function detectUserIntent(userProfile, recentActions = [], currentPage) {
  const intents = {
    exploration: 0,      // Learning about the system
    assessment: 0,       // Taking assessments
    improvement: 0,      // Working on weaknesses
    mastery: 0,          // Reinforcing strengths
    collaboration: 0,    // Team activities
    reflection: 0,       // Self-analysis
  };
  
  // Analyze recent actions
  recentActions.forEach(action => {
    switch (action.action_type) {
      case 'page_view':
        if (action.page?.includes('Info') || action.page?.includes('Graph')) intents.exploration += 2;
        if (action.page?.includes('Profile')) intents.reflection += 3;
        if (action.page?.includes('Group')) intents.collaboration += 3;
        break;
      case 'assessment_started':
      case 'assessment_completed':
        intents.assessment += 5;
        break;
      case 'pillar_selected':
        intents.exploration += 2;
        break;
      case 'recommendation_clicked':
        intents.improvement += 4;
        break;
    }
  });
  
  // Profile-based intent inference
  const scores = userProfile?.pillar_scores || {};
  const scoreValues = Object.values(scores).filter(s => s > 0);
  
  if (scoreValues.length === 0) {
    intents.exploration += 10;
    intents.assessment += 8;
  } else {
    const avgScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
    if (avgScore < 50) intents.improvement += 5;
    if (avgScore > 70) intents.mastery += 5;
  }
  
  // Determine primary intent
  const primaryIntent = Object.entries(intents)
    .sort(([, a], [, b]) => b - a)[0];
  
  return {
    primary: primaryIntent[0],
    confidence: Math.min(100, primaryIntent[1] * 5),
    all: intents,
  };
}

/**
 * Generate competency profile for radial map visualization
 */
export function generateCompetencyProfile(userProfile, assessments, gamification) {
  const competencies = {};
  const scores = userProfile?.pillar_scores || {};
  
  Object.keys(PILLAR_ALIGNMENT_FACTORS).forEach(pillar => {
    const baseScore = scores[pillar] || 0;
    const assessmentCount = assessments?.filter(a => a.pillar === pillar && a.completed).length || 0;
    
    // Calculate growth trajectory
    const pillarAssessments = assessments
      ?.filter(a => a.pillar === pillar && a.completed)
      .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at)) || [];
    
    let trend = 'stable';
    if (pillarAssessments.length >= 2) {
      const recent = pillarAssessments[pillarAssessments.length - 1].overall_score;
      const previous = pillarAssessments[pillarAssessments.length - 2].overall_score;
      trend = recent > previous ? 'improving' : recent < previous ? 'declining' : 'stable';
    }
    
    // Calculate confidence level based on data quality
    const confidence = Math.min(100, assessmentCount * 25 + (baseScore > 0 ? 25 : 0));
    
    // Stretch factor for radial visualization (0.3 to 1.0)
    const stretchFactor = baseScore > 0 ? 0.3 + (baseScore / 100) * 0.7 : 0.2;
    
    competencies[pillar] = {
      score: baseScore,
      stretchFactor,
      trend,
      confidence,
      assessmentCount,
      status: getCompetencyStatus(baseScore),
      recommendation: generatePillarRecommendation(pillar, baseScore, trend, assessmentCount),
    };
  });
  
  return competencies;
}

/**
 * Get competency status label
 */
function getCompetencyStatus(score) {
  if (!score || score === 0) return 'unassessed';
  if (score >= 80) return 'strength';
  if (score >= 60) return 'proficient';
  if (score >= 40) return 'developing';
  return 'foundational';
}

/**
 * Generate pillar-specific recommendation
 */
function generatePillarRecommendation(pillar, score, trend, assessmentCount) {
  if (assessmentCount === 0) {
    return `Begin your ${pillar} assessment to establish a baseline.`;
  }
  
  if (score >= 80 && trend !== 'declining') {
    return `Excellent ${pillar} competency. Consider mentoring others.`;
  }
  
  if (score >= 60) {
    return `Strong foundation in ${pillar}. Focus on advanced practice.`;
  }
  
  if (score >= 40) {
    return `${pillar} is developing. Consistent practice will accelerate growth.`;
  }
  
  return `Prioritize ${pillar} development through targeted learning.`;
}

/**
 * Calculate overall leadership profile metrics
 */
export function calculateLeadershipMetrics(competencies) {
  const scores = Object.values(competencies).map(c => c.score).filter(s => s > 0);
  
  if (scores.length === 0) {
    return {
      overallScore: 0,
      balance: 0,
      coverage: 0,
      growthPotential: 100,
    };
  }
  
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  // Balance: how evenly distributed are the scores (100 = perfectly balanced)
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - overallScore, 2), 0) / scores.length;
  const balance = Math.max(0, Math.round(100 - Math.sqrt(variance)));
  
  // Coverage: percentage of pillars assessed
  const coverage = Math.round((scores.length / 5) * 100);
  
  // Growth potential: inverse of overall score
  const growthPotential = Math.round(100 - overallScore * 0.7);
  
  return { overallScore, balance, coverage, growthPotential };
}

/**
 * Generate personalized learning path recommendations
 */
export function generateLearningRecommendations(competencies, userProfile) {
  const recommendations = [];
  const pillars = Object.entries(competencies)
    .sort(([, a], [, b]) => a.score - b.score);
  
  // Priority 1: Unassessed pillars
  const unassessed = pillars.filter(([, c]) => c.status === 'unassessed');
  if (unassessed.length > 0) {
    recommendations.push({
      type: 'assessment',
      priority: 'high',
      pillar: unassessed[0][0],
      title: `Assess your ${unassessed[0][0]} competency`,
      description: 'Complete an assessment to unlock personalized development recommendations.',
    });
  }
  
  // Priority 2: Weakest assessed pillar
  const assessed = pillars.filter(([, c]) => c.score > 0);
  if (assessed.length > 0 && assessed[0][1].score < 60) {
    recommendations.push({
      type: 'development',
      priority: 'high',
      pillar: assessed[0][0],
      title: `Strengthen your ${assessed[0][0]}`,
      description: `Current score: ${assessed[0][1].score}%. Targeted practice can significantly improve this area.`,
    });
  }
  
  // Priority 3: Declining pillars
  const declining = pillars.filter(([, c]) => c.trend === 'declining');
  declining.forEach(([pillar, comp]) => {
    recommendations.push({
      type: 'maintenance',
      priority: 'medium',
      pillar,
      title: `Reinforce ${pillar} skills`,
      description: `Recent decline detected. Refresh your ${pillar} competency.`,
    });
  });
  
  // Priority 4: Strengths to leverage
  const strengths = pillars.filter(([, c]) => c.status === 'strength');
  if (strengths.length > 0) {
    recommendations.push({
      type: 'leverage',
      priority: 'low',
      pillar: strengths[strengths.length - 1][0],
      title: `Leverage your ${strengths[strengths.length - 1][0]} strength`,
      description: 'Consider mentoring others or taking on leadership roles in this area.',
    });
  }
  
  return recommendations.slice(0, 4);
}

/**
 * Generate micro-missions based on user profile and intent
 */
export function generateMicroMissions(competencies, userIntent, pillar = null) {
  const missions = [];
  const targetPillar = pillar || Object.entries(competencies)
    .filter(([, c]) => c.score > 0 && c.score < 80)
    .sort(([, a], [, b]) => a.score - b.score)[0]?.[0];
  
  if (!targetPillar) return missions;
  
  const missionTemplates = {
    purpose: [
      { title: 'Values Clarification', description: 'Write down your top 5 core values and rank them', duration: 15, points: 20 },
      { title: 'Vision Statement', description: 'Draft a personal vision statement for the next year', duration: 20, points: 25 },
      { title: 'Meaning Reflection', description: 'Identify 3 activities that give you deep satisfaction', duration: 10, points: 15 },
    ],
    interpersonal: [
      { title: 'Active Listening', description: 'Practice reflective listening in your next conversation', duration: 15, points: 20 },
      { title: 'Feedback Exchange', description: 'Give constructive feedback to a colleague', duration: 10, points: 15 },
      { title: 'Empathy Exercise', description: 'Consider a recent disagreement from the other perspective', duration: 15, points: 20 },
    ],
    learning: [
      { title: 'Curiosity Quest', description: 'Explore a topic outside your expertise for 20 minutes', duration: 20, points: 20 },
      { title: 'Reflection Journal', description: 'Document key learnings from your past week', duration: 15, points: 15 },
      { title: 'Skill Stretch', description: 'Attempt something slightly beyond your current ability', duration: 25, points: 25 },
    ],
    action: [
      { title: 'Priority Focus', description: 'Complete your most important task before checking email', duration: 30, points: 25 },
      { title: 'Momentum Builder', description: 'Break a large goal into 3 actionable steps', duration: 10, points: 15 },
      { title: 'Discipline Check', description: 'Maintain focus on one task for 25 minutes without distraction', duration: 25, points: 20 },
    ],
    resilience: [
      { title: 'Stress Audit', description: 'Identify your top 3 current stressors and one coping strategy', duration: 15, points: 20 },
      { title: 'Recovery Routine', description: 'Practice a 5-minute breathing or mindfulness exercise', duration: 5, points: 10 },
      { title: 'Reframe Challenge', description: 'Rewrite a recent setback as a learning opportunity', duration: 10, points: 15 },
    ],
  };
  
  return (missionTemplates[targetPillar] || []).map((m, i) => ({
    ...m,
    id: `${targetPillar}_mission_${i}`,
    pillar: targetPillar,
    type: 'micro_mission',
  }));
}

/**
 * Merge all user data into master UserAnalytics entity
 */
export async function syncUserAnalytics(userEmail, userProfile, assessments, actions, gamification, groups, pathways) {
  const { base44 } = await import('@/api/base44Client');
  
  // Check for existing analytics record
  let existingRecords = [];
  try {
    existingRecords = await base44.entities.UserAnalytics.filter({ email: userEmail });
  } catch (e) {
    console.log('UserAnalytics query failed, will create new record');
  }
  
  const scores = userProfile?.pillar_scores || {};
  const completedPillars = Object.keys(scores).filter(k => scores[k] > 0);
  
  // Calculate computed insights
  const avgScore = completedPillars.length > 0
    ? Math.round(completedPillars.reduce((sum, k) => sum + scores[k], 0) / completedPillars.length)
    : 0;
  
  // Balance index calculation
  let balanceIndex = 0;
  if (completedPillars.length >= 2) {
    const values = completedPillars.map(k => scores[k]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    balanceIndex = Math.max(0, Math.round(100 - Math.sqrt(variance)));
  }
  
  // Determine user segment
  const totalPoints = gamification?.total_points || 0;
  const streak = gamification?.streaks?.current_streak || 0;
  let userSegment = 'newcomer';
  if (totalPoints > 1000 && streak > 7) userSegment = 'power_user';
  else if (totalPoints > 500) userSegment = 'engaged';
  else if (totalPoints > 100) userSegment = 'casual';
  else if (streak === 0 && completedPillars.length > 0) userSegment = 'at_risk';
  
  // Sorted pillars for insights
  const sortedPillars = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort(([, a], [, b]) => b - a);
  
  const strongestPillar = sortedPillars[0]?.[0];
  const growthPillar = sortedPillars[sortedPillars.length - 1]?.[0];
  
  // Detect intent
  const intent = detectUserIntent(userProfile, actions?.slice(0, 20) || [], '');
  
  // Build pillar metrics with trends
  const pillarMetrics = {};
  ['purpose', 'interpersonal', 'learning', 'action', 'resilience'].forEach(pillar => {
    const pillarAssessments = assessments?.filter(a => a.pillar === pillar && a.completed) || [];
    const latestScore = scores[pillar] || 0;
    
    let trend = 'stable';
    if (pillarAssessments.length >= 2) {
      const sorted = pillarAssessments.sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));
      const recent = sorted[sorted.length - 1].overall_score;
      const previous = sorted[sorted.length - 2].overall_score;
      trend = recent > previous ? 'improving' : recent < previous ? 'declining' : 'stable';
    }
    
    pillarMetrics[pillar] = {
      score: latestScore,
      attempts: pillarAssessments.length,
      time_spent: pillarAssessments.reduce((sum, a) => {
        const responses = a.responses || [];
        return sum + responses.reduce((s, r) => s + (r.time_spent_seconds || 0), 0);
      }, 0),
      trend,
      last_assessed: pillarAssessments[pillarAssessments.length - 1]?.completed_at || null,
    };
  });
  
  // Unique sessions
  const uniqueSessions = new Set(actions?.map(a => a.session_id) || []);
  
  // Build analytics record
  const analyticsData = {
    user_uuid: userEmail,
    email: userEmail,
    direct_metrics: {
      total_sessions: uniqueSessions.size,
      total_time_spent_minutes: 0,
      assessments_completed: assessments?.filter(a => a.completed).length || 0,
      activities_completed: gamification?.points_history?.length || 0,
      challenges_joined: 0,
      challenges_completed: 0,
      groups_joined: groups?.filter(g => g.participants?.some(p => p.email === userEmail)).length || 0,
      messages_sent: 0,
      pages_viewed: actions?.filter(a => a.action_type === 'page_view').length || 0,
      reflections_written: 0,
    },
    pillar_metrics: pillarMetrics,
    computed_insights: {
      engagement_score: Math.min(100, totalPoints / 50 + streak * 5),
      consistency_score: Math.min(100, streak * 10 + uniqueSessions.size * 2),
      collaboration_score: Math.min(100, (groups?.length || 0) * 20),
      growth_velocity: avgScore > 0 ? Math.round(avgScore / Math.max(1, completedPillars.length)) : 0,
      balance_index: balanceIndex,
      predicted_churn_risk: streak === 0 && completedPillars.length > 0 ? 0.7 : streak < 3 ? 0.4 : 0.1,
      recommended_focus: growthPillar || 'purpose',
      user_segment: userSegment,
      strongest_pillar: strongestPillar,
      growth_pillar: growthPillar,
    },
    intent_analysis: {
      primary_intent: intent.primary,
      intent_confidence: intent.confidence,
      intent_history: [],
    },
    gamification_state: {
      level: gamification?.level || 1,
      total_points: totalPoints,
      current_streak: streak,
      longest_streak: gamification?.streaks?.longest_streak || streak,
      badges_earned: gamification?.badges?.length || 0,
      trophies_earned: 0,
      challenges_active: 0,
      leaderboard_rank: 0,
    },
    session_refs: Array.from(uniqueSessions).slice(0, 50),
    group_refs: groups?.filter(g => g.participants?.some(p => p.email === userEmail)).map(g => g.id) || [],
    pathway_refs: pathways?.map(p => p.id) || [],
    last_active: new Date().toISOString(),
    first_seen: existingRecords[0]?.first_seen || new Date().toISOString(),
    last_analyzed: new Date().toISOString(),
  };
  
  // Update or create
  if (existingRecords.length > 0) {
    return base44.entities.UserAnalytics.update(existingRecords[0].id, analyticsData);
  } else {
    return base44.entities.UserAnalytics.create(analyticsData);
  }
}

export default {
  analyzeUserAlignment,
  detectUserIntent,
  generateCompetencyProfile,
  calculateLeadershipMetrics,
  generateLearningRecommendations,
  generateMicroMissions,
  syncUserAnalytics,
};