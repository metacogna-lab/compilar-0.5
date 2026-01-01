/**
 * Learning Pathway Service
 * Generates personalized learning paths using RAG and cached insights
 */

import { base44 } from '@/api/base44Client';
import { getCachedProfileInsights, searchKnowledge } from './RAGService';

const PATHWAY_MODULES = {
  purpose: {
    beginner: [
      { type: 'micro_learning', title: 'Understanding Your Why', duration: 5, points: 10 },
      { type: 'reflection', title: 'Values Discovery Journal', duration: 15, points: 25 },
      { type: 'exercise', title: 'Purpose Statement Draft', duration: 20, points: 30 },
      { type: 'article', title: 'The Science of Purpose', duration: 10, points: 15 },
      { type: 'practice', title: 'Daily Purpose Check-in', duration: 5, points: 20 },
    ],
    intermediate: [
      { type: 'micro_learning', title: 'Values Alignment Deep Dive', duration: 10, points: 15 },
      { type: 'exercise', title: 'Life Vision Mapping', duration: 30, points: 40 },
      { type: 'reflection', title: 'Purpose in Action Review', duration: 15, points: 25 },
      { type: 'practice', title: 'Meaning Extraction Practice', duration: 10, points: 20 },
      { type: 'assessment', title: 'Purpose Refinement Check', duration: 15, points: 35 },
    ],
    advanced: [
      { type: 'exercise', title: 'Purpose Leadership Framework', duration: 25, points: 45 },
      { type: 'practice', title: 'Mentoring Others on Purpose', duration: 30, points: 50 },
      { type: 'reflection', title: 'Legacy Planning', duration: 20, points: 35 },
      { type: 'article', title: 'Purpose-Driven Teams', duration: 15, points: 25 },
    ],
  },
  interpersonal: {
    beginner: [
      { type: 'micro_learning', title: 'Active Listening Basics', duration: 5, points: 10 },
      { type: 'exercise', title: 'Empathy Mapping', duration: 15, points: 25 },
      { type: 'practice', title: 'Daily Connection Challenge', duration: 10, points: 20 },
      { type: 'reflection', title: 'Relationship Inventory', duration: 15, points: 25 },
      { type: 'article', title: 'The Power of Presence', duration: 10, points: 15 },
    ],
    intermediate: [
      { type: 'exercise', title: 'Difficult Conversations Workshop', duration: 25, points: 40 },
      { type: 'micro_learning', title: 'Conflict Resolution Strategies', duration: 10, points: 15 },
      { type: 'practice', title: 'Feedback Exchange', duration: 15, points: 25 },
      { type: 'reflection', title: 'Communication Style Analysis', duration: 20, points: 30 },
      { type: 'assessment', title: 'Interpersonal Skills Check', duration: 15, points: 35 },
    ],
    advanced: [
      { type: 'exercise', title: 'Team Dynamics Facilitation', duration: 30, points: 50 },
      { type: 'practice', title: 'Cross-functional Collaboration', duration: 25, points: 45 },
      { type: 'article', title: 'Building Psychological Safety', duration: 15, points: 25 },
    ],
  },
  learning: {
    beginner: [
      { type: 'micro_learning', title: 'Learning How to Learn', duration: 10, points: 15 },
      { type: 'exercise', title: 'Curiosity Exploration', duration: 15, points: 25 },
      { type: 'reflection', title: 'Learning Style Discovery', duration: 15, points: 25 },
      { type: 'practice', title: 'Daily Learning Log', duration: 5, points: 15 },
      { type: 'article', title: 'The Growth Mindset', duration: 10, points: 15 },
    ],
    intermediate: [
      { type: 'exercise', title: 'Deliberate Practice Design', duration: 20, points: 35 },
      { type: 'micro_learning', title: 'Knowledge Transfer Techniques', duration: 10, points: 15 },
      { type: 'practice', title: 'Teach What You Learn', duration: 25, points: 40 },
      { type: 'reflection', title: 'Learning Journey Review', duration: 15, points: 25 },
      { type: 'assessment', title: 'Learning Agility Check', duration: 15, points: 35 },
    ],
    advanced: [
      { type: 'exercise', title: 'Creating Learning Systems', duration: 30, points: 50 },
      { type: 'practice', title: 'Mentoring & Knowledge Sharing', duration: 30, points: 50 },
      { type: 'article', title: 'Building Learning Organizations', duration: 20, points: 30 },
    ],
  },
  action: {
    beginner: [
      { type: 'micro_learning', title: 'Overcoming Inertia', duration: 5, points: 10 },
      { type: 'exercise', title: 'Small Wins Planning', duration: 15, points: 25 },
      { type: 'practice', title: '5-Minute Action Sprint', duration: 5, points: 20 },
      { type: 'reflection', title: 'Procrastination Patterns', duration: 15, points: 25 },
      { type: 'article', title: 'The Power of Momentum', duration: 10, points: 15 },
    ],
    intermediate: [
      { type: 'exercise', title: 'Goal Breakdown Workshop', duration: 25, points: 40 },
      { type: 'micro_learning', title: 'Execution Frameworks', duration: 10, points: 15 },
      { type: 'practice', title: 'Accountability Partnership', duration: 20, points: 30 },
      { type: 'reflection', title: 'Discipline Audit', duration: 15, points: 25 },
      { type: 'assessment', title: 'Execution Effectiveness Check', duration: 15, points: 35 },
    ],
    advanced: [
      { type: 'exercise', title: 'Leading Through Action', duration: 30, points: 50 },
      { type: 'practice', title: 'Team Momentum Building', duration: 25, points: 45 },
      { type: 'article', title: 'Scaling Execution Excellence', duration: 15, points: 25 },
    ],
  },
  resilience: {
    beginner: [
      { type: 'micro_learning', title: 'Stress Response Awareness', duration: 5, points: 10 },
      { type: 'exercise', title: 'Breathing & Grounding', duration: 10, points: 20 },
      { type: 'practice', title: 'Daily Resilience Check-in', duration: 5, points: 15 },
      { type: 'reflection', title: 'Setback Stories', duration: 15, points: 25 },
      { type: 'article', title: 'The Science of Resilience', duration: 10, points: 15 },
    ],
    intermediate: [
      { type: 'exercise', title: 'Emotional Regulation Toolkit', duration: 20, points: 35 },
      { type: 'micro_learning', title: 'Reframing Techniques', duration: 10, points: 15 },
      { type: 'practice', title: 'Recovery Rituals', duration: 15, points: 25 },
      { type: 'reflection', title: 'Growth Through Adversity', duration: 20, points: 30 },
      { type: 'assessment', title: 'Resilience Capacity Check', duration: 15, points: 35 },
    ],
    advanced: [
      { type: 'exercise', title: 'Crisis Leadership', duration: 30, points: 50 },
      { type: 'practice', title: 'Building Team Resilience', duration: 25, points: 45 },
      { type: 'article', title: 'Post-Traumatic Growth', duration: 20, points: 30 },
    ],
  },
};

/**
 * Generate a personalized learning pathway
 */
export async function generateLearningPathway(userEmail, userProfile, options = {}) {
  const { targetPillar, pathwayType = 'weakness_focus', customGoal } = options;
  
  const scores = userProfile?.pillar_scores || {};
  
  // Determine target pillar if not specified
  let pillar = targetPillar;
  if (!pillar) {
    const sortedPillars = Object.entries(scores)
      .filter(([_, score]) => score > 0)
      .sort(([, a], [, b]) => a - b);
    pillar = sortedPillars[0]?.[0] || 'purpose';
  }
  
  const currentScore = scores[pillar] || 0;
  
  // Determine difficulty level based on score
  const difficulty = currentScore < 40 ? 'beginner' : currentScore < 70 ? 'intermediate' : 'advanced';
  
  // Get relevant knowledge for content enrichment
  const knowledgeResults = await searchKnowledge(
    `${pillar} development strategies exercises`,
    { pillar, topK: 5, minSimilarity: 0.6 }
  );
  
  // Get modules for this pillar and difficulty
  const baseModules = PATHWAY_MODULES[pillar]?.[difficulty] || PATHWAY_MODULES.purpose.beginner;
  
  // Enrich modules with knowledge base content
  const enrichedModules = baseModules.map((mod, index) => {
    const relevantKnowledge = knowledgeResults.results?.find(k => 
      k.category === mod.type || k.title.toLowerCase().includes(mod.title.toLowerCase().split(' ')[0])
    );
    
    return {
      id: `${pillar}_${difficulty}_${index}_${Date.now()}`,
      ...mod,
      order: index + 1,
      description: relevantKnowledge?.content?.slice(0, 200) || `Develop your ${pillar} through ${mod.type}.`,
      content: relevantKnowledge?.content || null,
      completed: false,
    };
  });
  
  // Calculate target score
  const targetScore = Math.min(100, currentScore + (difficulty === 'beginner' ? 20 : difficulty === 'intermediate' ? 15 : 10));
  
  // Create the pathway
  const pathway = {
    user_email: userEmail,
    pathway_type: pathwayType,
    target_pillar: pillar,
    title: customGoal || `${pillar.charAt(0).toUpperCase() + pillar.slice(1)} Development Path`,
    description: `A personalized ${difficulty} pathway to strengthen your ${pillar} capabilities from ${currentScore}% toward ${targetScore}%.`,
    difficulty_level: difficulty,
    estimated_duration_days: Math.ceil(enrichedModules.length * 2),
    modules: enrichedModules,
    knowledge_sources: knowledgeResults.results?.map(k => k.chunk_id) || [],
    starting_score: currentScore,
    target_score: targetScore,
    current_progress: 0,
    modules_completed: 0,
    status: 'active',
    adaptive_recommendations: [],
    started_at: new Date().toISOString(),
  };
  
  // Save to database
  const saved = await base44.entities.LearningPathway.create(pathway);
  return saved;
}

/**
 * Get active pathways for a user
 */
export async function getUserPathways(userEmail) {
  return base44.entities.LearningPathway.filter({ 
    user_email: userEmail, 
    status: 'active' 
  });
}

/**
 * Complete a module in a pathway
 */
export async function completeModule(pathwayId, moduleId, notes = '', rating = null) {
  const pathways = await base44.entities.LearningPathway.filter({ id: pathwayId });
  const pathway = pathways[0];
  if (!pathway) throw new Error('Pathway not found');
  
  const updatedModules = pathway.modules.map(mod => {
    if (mod.id === moduleId) {
      return {
        ...mod,
        completed: true,
        completed_at: new Date().toISOString(),
        user_notes: notes,
        rating,
      };
    }
    return mod;
  });
  
  const completedCount = updatedModules.filter(m => m.completed).length;
  const progress = Math.round((completedCount / updatedModules.length) * 100);
  const isCompleted = progress === 100;
  
  await base44.entities.LearningPathway.update(pathwayId, {
    modules: updatedModules,
    modules_completed: completedCount,
    current_progress: progress,
    status: isCompleted ? 'completed' : 'active',
    completed_at: isCompleted ? new Date().toISOString() : null,
  });
  
  // Return points earned
  const completedModule = pathway.modules.find(m => m.id === moduleId);
  return { points: completedModule?.points || 0, progress, isCompleted };
}

/**
 * Generate adaptive recommendations based on pathway progress
 */
export async function getAdaptiveRecommendations(pathwayId, userProfile) {
  const pathways = await base44.entities.LearningPathway.filter({ id: pathwayId });
  const pathway = pathways[0];
  if (!pathway) return [];
  
  const recommendations = [];
  const completedModules = pathway.modules.filter(m => m.completed);
  const lowRatedModules = completedModules.filter(m => m.rating && m.rating < 3);
  
  // If user is struggling, suggest easier content
  if (lowRatedModules.length >= 2) {
    recommendations.push({
      trigger: 'low_ratings',
      recommendation: `Consider revisiting the basics of ${pathway.target_pillar}. The foundational concepts will strengthen your understanding.`,
      applied: false,
    });
  }
  
  // If making good progress, suggest stretch activities
  if (pathway.current_progress >= 50 && completedModules.every(m => !m.rating || m.rating >= 4)) {
    recommendations.push({
      trigger: 'high_performance',
      recommendation: `You're excelling! Consider exploring advanced ${pathway.target_pillar} concepts or helping others in their journey.`,
      applied: false,
    });
  }
  
  return recommendations;
}