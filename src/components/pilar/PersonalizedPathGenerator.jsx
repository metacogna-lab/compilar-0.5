/**
 * Personalized Learning Path Generator
 * Generates AI-driven learning paths based on user's PILAR profile
 */

import { base44 } from '@/api/base44Client';

const LEARNING_RESOURCES = {
  purpose: {
    articles: [
      { title: 'Finding Your North Star', type: 'article', duration: 10, url: '#', description: 'A guide to discovering your core purpose' },
      { title: 'Values-Based Leadership', type: 'article', duration: 15, url: '#', description: 'Aligning actions with principles' },
      { title: 'The Meaning of Work', type: 'article', duration: 12, url: '#', description: 'Extracting significance from daily activities' },
    ],
    exercises: [
      { title: 'Values Hierarchy Exercise', type: 'exercise', duration: 20, description: 'Rank and reflect on your core values' },
      { title: 'Future Self Visualization', type: 'exercise', duration: 15, description: 'Envision your ideal self in 5 years' },
      { title: 'Purpose Statement Workshop', type: 'exercise', duration: 25, description: 'Craft your personal purpose statement' },
    ],
    microLearning: [
      { title: 'Daily Intention Setting', type: 'micro_learning', duration: 5, description: 'Start each day with clear purpose' },
      { title: 'Meaning Moment', type: 'micro_learning', duration: 3, description: 'Identify one meaningful moment today' },
    ],
  },
  interpersonal: {
    articles: [
      { title: 'The Art of Active Listening', type: 'article', duration: 12, url: '#', description: 'Master the skill of truly hearing others' },
      { title: 'Building Trust in Teams', type: 'article', duration: 15, url: '#', description: 'Foundation of effective collaboration' },
      { title: 'Navigating Difficult Conversations', type: 'article', duration: 18, url: '#', description: 'Handle conflict constructively' },
    ],
    exercises: [
      { title: 'Empathy Mapping', type: 'exercise', duration: 20, description: 'Understand perspectives systematically' },
      { title: 'Feedback Practice', type: 'exercise', duration: 15, description: 'Give and receive constructive feedback' },
      { title: 'Connection Inventory', type: 'exercise', duration: 10, description: 'Assess and strengthen key relationships' },
    ],
    microLearning: [
      { title: 'Appreciation Note', type: 'micro_learning', duration: 5, description: 'Express genuine appreciation to someone' },
      { title: 'Perspective Shift', type: 'micro_learning', duration: 3, description: 'See a situation from another viewpoint' },
    ],
  },
  learning: {
    articles: [
      { title: 'The Growth Mindset', type: 'article', duration: 15, url: '#', description: 'Embrace challenges as opportunities' },
      { title: 'Deliberate Practice Principles', type: 'article', duration: 12, url: '#', description: 'Accelerate skill acquisition' },
      { title: 'Learning from Failure', type: 'article', duration: 10, url: '#', description: 'Transform setbacks into insights' },
    ],
    exercises: [
      { title: 'Learning Journal', type: 'exercise', duration: 15, description: 'Document and reflect on daily learnings' },
      { title: 'Skill Gap Analysis', type: 'exercise', duration: 20, description: 'Identify and prioritize development areas' },
      { title: 'Teaching Exercise', type: 'exercise', duration: 25, description: 'Teach something to reinforce your understanding' },
    ],
    microLearning: [
      { title: 'Curiosity Question', type: 'micro_learning', duration: 3, description: 'Ask one probing question today' },
      { title: 'Quick Read', type: 'micro_learning', duration: 5, description: 'Read one article on a new topic' },
    ],
  },
  action: {
    articles: [
      { title: 'The Power of Habits', type: 'article', duration: 15, url: '#', description: 'Build sustainable behavior patterns' },
      { title: 'Overcoming Procrastination', type: 'article', duration: 12, url: '#', description: 'Start and maintain momentum' },
      { title: 'Execution Excellence', type: 'article', duration: 14, url: '#', description: 'Turn plans into results' },
    ],
    exercises: [
      { title: 'Priority Matrix', type: 'exercise', duration: 15, description: 'Categorize tasks by importance and urgency' },
      { title: 'Habit Stacking', type: 'exercise', duration: 10, description: 'Link new behaviors to existing routines' },
      { title: 'Weekly Review', type: 'exercise', duration: 20, description: 'Assess progress and plan ahead' },
    ],
    microLearning: [
      { title: 'Two-Minute Rule', type: 'micro_learning', duration: 2, description: 'Complete any task under 2 minutes immediately' },
      { title: 'Progress Check', type: 'micro_learning', duration: 3, description: 'Note one thing you accomplished today' },
    ],
  },
  resilience: {
    articles: [
      { title: 'Stress as a Growth Signal', type: 'article', duration: 12, url: '#', description: 'Reframe pressure positively' },
      { title: 'Emotional Intelligence Foundations', type: 'article', duration: 15, url: '#', description: 'Understand and manage emotions' },
      { title: 'Building Mental Toughness', type: 'article', duration: 14, url: '#', description: 'Develop psychological strength' },
    ],
    exercises: [
      { title: 'Stress Inventory', type: 'exercise', duration: 15, description: 'Map your stressors and responses' },
      { title: 'Reframe Practice', type: 'exercise', duration: 10, description: 'Transform negative thoughts' },
      { title: 'Recovery Ritual Design', type: 'exercise', duration: 20, description: 'Create your personal recovery routine' },
    ],
    microLearning: [
      { title: 'Breath Break', type: 'micro_learning', duration: 3, description: 'Take 3 deep breaths to reset' },
      { title: 'Gratitude Moment', type: 'micro_learning', duration: 2, description: 'Identify one thing to be grateful for' },
    ],
  },
};

/**
 * Fetch RAG-enhanced pillar insights for pathway generation
 */
async function fetchPillarResearchContext(pillar, currentScore) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on Ben Heslop's PILAR framework research on "${pillar}", provide development guidance for someone at ${currentScore}% competency.
      
Include:
1. Key research insights about this pillar
2. Evidence-based development strategies
3. Common challenges at this level
4. Interconnections with other pillars that can accelerate growth

Keep it concise and actionable.`,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          research_insights: { type: "string" },
          development_strategies: { type: "array", items: { type: "string" } },
          challenges: { type: "array", items: { type: "string" } },
          pillar_connections: { type: "array", items: { type: "string" } }
        }
      }
    });
    return response;
  } catch (error) {
    console.error('RAG context fetch failed:', error);
    return null;
  }
}

/**
 * Generate a personalized learning pathway
 */
export async function generatePersonalizedPath(userEmail, userProfile, options = {}) {
  const { targetPillar, pathwayType = 'weakness_focus' } = options;
  const scores = userProfile?.pillar_scores || {};
  
  // Determine target pillar
  let pillar = targetPillar;
  if (!pillar) {
    const sortedPillars = Object.entries(scores)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => a - b);
    pillar = sortedPillars[0]?.[0] || 'purpose';
  }
  
  const currentScore = scores[pillar] || 0;
  const targetScore = Math.min(100, currentScore + 20);
  const resources = LEARNING_RESOURCES[pillar];
  
  // Fetch RAG-enhanced research context
  const researchContext = await fetchPillarResearchContext(pillar, currentScore);
  
  // Generate AI-enhanced pathway with RAG context
  let aiEnhancement = null;
  try {
    const researchInsights = researchContext?.research_insights || '';
    const strategies = researchContext?.development_strategies?.join(', ') || '';
    
    aiEnhancement = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a personalized learning pathway for someone developing their "${pillar}" competency based on Ben Heslop's PILAR research.

Current score: ${currentScore}%
Target score: ${targetScore}%
User journey stage: ${userProfile?.journey_stage || 'newcomer'}
Strongest pillar: ${userProfile?.strongest_pillar || 'unknown'}
Growth area: ${userProfile?.weakest_pillar || 'unknown'}

PILAR Research Context:
${researchInsights}

Evidence-based strategies to incorporate:
${strategies}

Create 5-6 focused learning modules that:
1. Apply PILAR research principles directly
2. Have clear, actionable titles
3. Include specific content/instructions based on the research
4. Are achievable in 10-30 minutes
5. Build progressively on previous modules
6. Connect to the user's strongest pillar for accelerated learning

Focus on practical application grounded in PILAR research.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                content: { type: "string" },
                module_type: { type: "string", enum: ["micro_learning", "exercise", "reflection", "article", "practice"] },
                duration_minutes: { type: "number" },
                points: { type: "number" }
              }
            }
          },
          difficulty_level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          estimated_days: { type: "number" }
        }
      }
    });
  } catch (error) {
    console.error('AI pathway generation failed, using fallback:', error);
  }
  
  // Build modules from AI or fallback to templates
  let modules = [];
  if (aiEnhancement?.modules) {
    modules = aiEnhancement.modules.map((m, i) => ({
      id: `${pillar}_ai_${i}_${Date.now()}`,
      title: m.title,
      description: m.description,
      content: m.content,
      module_type: m.module_type,
      duration_minutes: m.duration_minutes || 15,
      points: m.points || 20,
      order: i,
      completed: false,
    }));
  } else {
    // Fallback: combine resources into a structured path
    const allResources = [
      ...resources.microLearning.slice(0, 1),
      ...resources.articles.slice(0, 2),
      ...resources.exercises.slice(0, 2),
      ...resources.microLearning.slice(1),
    ];
    
    modules = allResources.map((r, i) => ({
      id: `${pillar}_${r.type}_${i}_${Date.now()}`,
      title: r.title,
      description: r.description,
      content: r.description,
      module_type: r.type,
      duration_minutes: r.duration,
      points: Math.round(r.duration * 1.5),
      order: i,
      completed: false,
    }));
  }
  
  // Create the pathway record
  const pathway = {
    user_email: userEmail,
    pathway_type: pathwayType,
    target_pillar: pillar,
    title: aiEnhancement?.title || `${pillar.charAt(0).toUpperCase() + pillar.slice(1)} Development Path`,
    description: aiEnhancement?.description || `A personalized pathway to strengthen your ${pillar} competency.`,
    difficulty_level: aiEnhancement?.difficulty_level || (currentScore < 40 ? 'beginner' : currentScore < 70 ? 'intermediate' : 'advanced'),
    estimated_duration_days: aiEnhancement?.estimated_days || 14,
    modules,
    starting_score: currentScore,
    target_score: targetScore,
    current_progress: 0,
    modules_completed: 0,
    status: 'active',
    started_at: new Date().toISOString(),
  };
  
  return base44.entities.LearningPathway.create(pathway);
}

/**
 * Complete a module and update pathway progress
 */
export async function completePathwayModule(pathwayId, moduleId, notes = '', rating = null) {
  const pathways = await base44.entities.LearningPathway.filter({ id: pathwayId });
  if (pathways.length === 0) throw new Error('Pathway not found');
  
  const pathway = pathways[0];
  const moduleIndex = pathway.modules.findIndex(m => m.id === moduleId);
  if (moduleIndex === -1) throw new Error('Module not found');
  
  const module = pathway.modules[moduleIndex];
  const updatedModules = [...pathway.modules];
  updatedModules[moduleIndex] = {
    ...module,
    completed: true,
    completed_at: new Date().toISOString(),
    user_notes: notes,
    rating,
  };
  
  const completedCount = updatedModules.filter(m => m.completed).length;
  const progress = Math.round((completedCount / updatedModules.length) * 100);
  const isComplete = progress === 100;
  
  await base44.entities.LearningPathway.update(pathway.id, {
    modules: updatedModules,
    modules_completed: completedCount,
    current_progress: progress,
    status: isComplete ? 'completed' : 'active',
    completed_at: isComplete ? new Date().toISOString() : null,
  });
  
  return {
    points: module.points,
    progress,
    isCompleted: isComplete,
    nextModule: isComplete ? null : updatedModules.find(m => !m.completed),
  };
}

export default {
  generatePersonalizedPath,
  completePathwayModule,
  LEARNING_RESOURCES,
};