// Assessment Process Schema
// Defines the complete data structure that builds up through the assessment flow

export const AssessmentSessionSchema = {
  // Stage 1: Profile Data (from ProfileSetupModal)
  profile: {
    full_name: null,
    email: null,
    position: null,
    goal: null,
    life_complications: null,
    onboarding_completed: false
  },

  // Stage 2: Goal Refinement (from GoalEnrichmentModal)
  goals: {
    original_goal: null,
    refined_goal: null,
    goal_type: null, // 'egalitarian', 'hierarchical', 'balanced'
    goal_breakdown: [],
    selected_at: null
  },

  // Stage 3: Path Selection (diagnostic_choice)
  path: {
    path_type: null, // 'diagnostic' or 'card_draw'
    selected_at: null
  },

  // Stage 4A: Diagnostic Results (if diagnostic path)
  diagnostic: {
    pillar_scores: {
      purpose: null,
      interpersonal: null,
      learning: null,
      action: null,
      resilience: null
    },
    conversation_history: [],
    completed_at: null,
    time_spent_seconds: 0
  },

  // Stage 4B: Card Draw Assessment (if card_draw path)
  card_assessment: {
    pillar_id: null,
    pillar_name: null,
    mode: null, // 'egalitarian' or 'hierarchical'
    score: null,
    responses: [],
    conversation_history: [],
    completed_at: null,
    time_spent_seconds: 0
  },

  // Stage 5: AI Coaching & Results
  results: {
    ai_coaching: null,
    performance_insights: [],
    recommended_next_steps: [],
    suggested_pillars: [],
    pdf_generated: false,
    pdf_url: null
  },

  // Metadata
  session_id: null,
  started_at: null,
  completed_at: null,
  current_stage: 'profile', // 'profile', 'goals', 'choose_path', 'assessment', 'results'
  session_quality_score: null
};

// Initialize a new assessment session
export function initializeAssessmentSession(user) {
  return {
    ...AssessmentSessionSchema,
    session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    started_at: new Date().toISOString(),
    current_stage: 'profile',
    profile: {
      ...AssessmentSessionSchema.profile,
      email: user?.email || null,
      full_name: user?.full_name || null
    }
  };
}

// Validation functions for each stage
export const StageValidation = {
  profile: (data) => {
    return !!(data.full_name && data.email && data.position);
  },

  goals: (data) => {
    return !!(data.original_goal || data.refined_goal);
  },

  choose_path: (data) => {
    return !!(data.path_type);
  },

  assessment: (data) => {
    if (data.path_type === 'diagnostic') {
      return !!(data.diagnostic.completed_at);
    } else if (data.path_type === 'card_draw') {
      return !!(data.card_assessment.completed_at && data.card_assessment.score !== null);
    }
    return false;
  }
};

// Calculate session quality score
export function calculateSessionQuality(sessionData) {
  let score = 0;
  
  // Profile completeness (20 points)
  if (StageValidation.profile(sessionData.profile)) score += 20;
  
  // Goals completeness (15 points)
  if (sessionData.goals.refined_goal) score += 15;
  
  // Assessment completion (40 points)
  if (sessionData.path.path_type === 'diagnostic' && sessionData.diagnostic.completed_at) {
    score += 40;
  } else if (sessionData.path.path_type === 'card_draw' && sessionData.card_assessment.completed_at) {
    score += 40;
  }
  
  // Engagement metrics (25 points)
  const conversationLength = sessionData.diagnostic.conversation_history?.length || 
                             sessionData.card_assessment.conversation_history?.length || 0;
  score += Math.min(25, conversationLength * 2);
  
  return Math.min(100, score);
}

export default AssessmentSessionSchema;