/**
 * RAG Service - Vector Database Interface for PILAR Knowledge
 * Provides semantic search and context-aware responses based on Ben Heslop's work
 * Uses caching for profile insights to minimize LLM calls
 */

import { base44 } from '@/api/base44Client';

const CACHE_STALENESS_THRESHOLD = 10; // Score difference threshold to trigger refresh

/**
 * Initialize the knowledge base (call once)
 */
export async function initializeKnowledgeBase() {
  const response = await base44.functions.invoke('ingestKnowledge', { action: 'ingest' });
  return response.data;
}

/**
 * Check knowledge base status
 */
export async function getKnowledgeBaseStatus() {
  const response = await base44.functions.invoke('ingestKnowledge', { action: 'status' });
  return response.data;
}

/**
 * Perform semantic search on the knowledge base
 */
export async function searchKnowledge(query, options = {}) {
  const { pillar = 'all', topK = 5, minSimilarity = 0.7 } = options;
  
  const response = await base44.functions.invoke('vectorSearch', {
    query,
    pillar,
    topK,
    minSimilarity
  });
  
  return response.data;
}

/**
 * Check if cached insights are stale
 */
function isCacheStale(cachedScores, currentScores) {
  if (!cachedScores || !currentScores) return true;
  
  const pillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];
  for (const pillar of pillars) {
    const cached = cachedScores[pillar] || 0;
    const current = currentScores[pillar] || 0;
    if (Math.abs(cached - current) >= CACHE_STALENESS_THRESHOLD) {
      return true;
    }
  }
  return false;
}

/**
 * Get cached profile insights or generate new ones
 */
export async function getCachedProfileInsights(userEmail, userProfile, forceRefresh = false) {
  // Try to get cached insights
  const cached = await base44.entities.UserProfileInsights.filter({ user_email: userEmail });
  const existingInsights = cached[0];
  
  const currentScores = userProfile?.pillar_scores || {};
  
  // Return cached if valid and not stale
  if (existingInsights && !forceRefresh && !isCacheStale(existingInsights.cached_scores, currentScores)) {
    return { insights: existingInsights, fromCache: true };
  }
  
  // Generate new insights via RAG
  const newInsights = await generateProfileInsights(userEmail, userProfile);
  
  // Store in cache
  if (existingInsights) {
    await base44.entities.UserProfileInsights.update(existingInsights.id, newInsights);
  } else {
    await base44.entities.UserProfileInsights.create(newInsights);
  }
  
  return { insights: newInsights, fromCache: false };
}

/**
 * Generate fresh profile insights using RAG
 */
async function generateProfileInsights(userEmail, userProfile) {
  const scores = userProfile?.pillar_scores || {};
  const sortedPillars = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort(([, a], [, b]) => b - a);
  
  const strongestPillar = sortedPillars[0]?.[0];
  const weakestPillar = sortedPillars[sortedPillars.length - 1]?.[0];
  
  // Generate comprehensive analysis via RAG
  const ragQuery = `Provide a comprehensive PILAR profile analysis for a user with these scores: ${JSON.stringify(scores)}.
  
Strongest pillar: ${strongestPillar || 'none assessed'}
Growth area: ${weakestPillar || 'none assessed'}
Journey stage: ${userProfile?.journey_stage || 'newcomer'}

Provide:
1. A profile summary (2-3 sentences)
2. Specific insights for each assessed pillar
3. Top 3 prioritized next steps
4. How their strongest pillar can leverage growth
5. A motivational insight based on PILAR principles`;

  const ragResponse = await base44.functions.invoke('ragQuery', {
    query: ragQuery,
    userProfile,
    context: { comprehensive: true },
    topK: 8,
    includeReasoning: true
  });

  const answer = ragResponse.data?.answer || '';
  const lines = answer.split('\n').filter(l => l.trim());
  
  // Build pillar insights
  const pillarInsights = {};
  const pillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];
  
  for (const pillar of pillars) {
    if (scores[pillar]) {
      pillarInsights[pillar] = {
        analysis: `Your ${pillar} score of ${scores[pillar]}% indicates ${scores[pillar] >= 70 ? 'strong development' : scores[pillar] >= 40 ? 'growing capability' : 'an opportunity for focused development'}.`,
        recommendations: generatePillarRecommendations(pillar, scores[pillar]),
        score_at_analysis: scores[pillar]
      };
    }
  }

  // Build next steps
  const nextSteps = [];
  if (weakestPillar) {
    nextSteps.push({
      title: `Strengthen ${weakestPillar.charAt(0).toUpperCase() + weakestPillar.slice(1)}`,
      description: `Focus on ${weakestPillar} development activities to build a more balanced profile.`,
      pillar: weakestPillar,
      priority: 1
    });
  }
  
  const unassessedPillars = pillars.filter(p => !scores[p]);
  if (unassessedPillars.length > 0) {
    nextSteps.push({
      title: `Assess ${unassessedPillars[0].charAt(0).toUpperCase() + unassessedPillars[0].slice(1)}`,
      description: `Complete the ${unassessedPillars[0]} assessment to get a fuller picture.`,
      pillar: unassessedPillars[0],
      priority: 2
    });
  }

  return {
    user_email: userEmail,
    profile_summary: lines[0] || `Your profile shows ${sortedPillars.length} assessed pillars with ${strongestPillar || 'emerging'} as your strongest area.`,
    pillar_insights: pillarInsights,
    next_steps: nextSteps,
    strength_leverage: strongestPillar 
      ? `Your ${strongestPillar} strength can accelerate growth in connected pillars.`
      : 'Complete assessments to discover your core strengths.',
    team_suggestion: 'Collaboration amplifies individual growth through shared learning and accountability.',
    motivational_insight: lines[lines.length - 1] || 'Balanced development across all pillars creates sustainable growth.',
    interconnection_insights: generateInterconnectionInsights(scores),
    cached_scores: scores,
    last_analyzed: new Date().toISOString(),
    analysis_version: 1
  };
}

function generatePillarRecommendations(pillar, score) {
  const recommendations = {
    purpose: score < 50 
      ? ['Reflect on what gives you long-term energy', 'Write down your core values', 'Connect daily tasks to bigger goals']
      : ['Share your purpose with others', 'Mentor someone in finding their direction', 'Align team goals with personal purpose'],
    interpersonal: score < 50
      ? ['Practice active listening daily', 'Ask more questions before responding', 'Seek feedback on your communication']
      : ['Facilitate group discussions', 'Help resolve conflicts between others', 'Build bridges across teams'],
    learning: score < 50
      ? ['Set aside dedicated learning time', 'Keep a reflection journal', 'Try one new approach each week']
      : ['Teach what you learn to others', 'Take on stretch assignments', 'Create learning resources for your team'],
    action: score < 50
      ? ['Break large goals into small steps', 'Start with 5-minute actions', 'Track your daily progress']
      : ['Lead initiatives from start to finish', 'Help others build momentum', 'Optimize your execution systems'],
    resilience: score < 50
      ? ['Develop a stress response routine', 'Practice reframing setbacks', 'Build a support network']
      : ['Coach others through difficulties', 'Share your recovery strategies', 'Lead during challenging times']
  };
  return recommendations[pillar] || [];
}

function generateInterconnectionInsights(scores) {
  const insights = [];
  const pillars = Object.entries(scores).filter(([_, s]) => s > 0);
  
  if (pillars.length >= 2) {
    const sorted = pillars.sort(([, a], [, b]) => b - a);
    const [strongest] = sorted[0];
    const [weakest] = sorted[sorted.length - 1];
    
    insights.push({
      from_pillar: strongest,
      to_pillar: weakest,
      insight: `Your ${strongest} strength can support ${weakest} development through intentional practice.`
    });
  }
  
  return insights;
}

/**
 * Get a RAG-enhanced response for complex queries only
 * Simple queries should use cached insights
 */
export async function getRAGResponse(query, userProfile, additionalContext = {}) {
  const response = await base44.functions.invoke('ragQuery', {
    query,
    userProfile,
    context: additionalContext,
    topK: 5,
    includeReasoning: true
  });
  
  return response.data;
}

/**
 * Determine if a query is complex enough to warrant RAG
 */
export function shouldUseRAG(query, userProfile) {
  const complexityIndicators = [
    // Question complexity
    query.length > 100,
    query.includes('?') && query.split('?').length > 2,
    /why|how|explain|understand|relationship|connection|compare/i.test(query),
    
    // Personality/profile considerations
    userProfile?.pillar_scores && Object.keys(userProfile.pillar_scores).length >= 3,
    
    // Multi-pillar queries
    ['purpose', 'interpersonal', 'learning', 'action', 'resilience']
      .filter(p => query.toLowerCase().includes(p)).length > 1
  ];
  
  return complexityIndicators.filter(Boolean).length >= 2;
}

/**
 * Get personalized recommendations based on RAG analysis
 */
export async function getPersonalizedRecommendations(userProfile, focusArea = null) {
  const scores = userProfile?.pillar_scores || {};
  const sortedPillars = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort(([, a], [, b]) => a - b);
  
  const weakestPillar = sortedPillars[0]?.[0];
  const targetPillar = focusArea || weakestPillar;
  
  if (!targetPillar) {
    return {
      recommendations: [],
      message: 'Complete at least one assessment to get personalized recommendations'
    };
  }
  
  const query = `What are the most effective strategies for developing ${targetPillar} when current score is ${scores[targetPillar] || 0}%? Consider practical exercises and mindset shifts.`;
  
  const response = await getRAGResponse(query, userProfile, {
    focusArea: targetPillar,
    currentScore: scores[targetPillar] || 0
  });
  
  return response;
}

/**
 * Analyze team dynamics using RAG
 */
export async function analyzeTeamDynamics(teamMembers, teamGoals = []) {
  const aggregateScores = {};
  const pillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];
  
  pillars.forEach(pillar => {
    const scores = teamMembers
      .map(m => m.pillar_scores?.[pillar])
      .filter(s => s > 0);
    
    if (scores.length > 0) {
      aggregateScores[pillar] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
  });
  
  const query = `Analyze a team with these average pillar scores: ${JSON.stringify(aggregateScores)}. 
  Team size: ${teamMembers.length}. 
  What are the team's collective strengths, potential blind spots, and recommendations for improved collaboration?`;
  
  const response = await getRAGResponse(query, { pillar_scores: aggregateScores }, {
    teamSize: teamMembers.length,
    teamGoals
  });
  
  return response;
}