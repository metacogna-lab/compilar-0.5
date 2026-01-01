/**
 * PILAR Navigation Heuristics Engine
 * Determines optimal next pillar based on user data, behavioral patterns, and response analysis
 */

// Pillar adjacency graph - research-based connections between pillars
const pillarGraph = {
  purpose: ['learning', 'action'],           // Purpose → Learning (grow skills) or Action (act on purpose)
  interpersonal: ['resilience', 'purpose'],  // Interpersonal → Resilience (handle conflict) or Purpose (shared meaning)
  learning: ['action', 'interpersonal'],     // Learning → Action (apply knowledge) or Interpersonal (learn together)
  action: ['resilience', 'learning'],        // Action → Resilience (sustain effort) or Learning (reflect on outcomes)
  resilience: ['purpose', 'interpersonal']   // Resilience → Purpose (reconnect with why) or Interpersonal (seek support)
};

// Response-based routing: keywords that suggest which pillar to explore next
const responseRoutingKeywords = {
  purpose: ['meaning', 'why', 'direction', 'goal', 'vision', 'future', 'purpose', 'lost', 'confused', 'uncertain'],
  interpersonal: ['people', 'team', 'relationship', 'communication', 'conflict', 'trust', 'colleague', 'friend', 'family', 'lonely'],
  learning: ['learn', 'grow', 'skill', 'improve', 'curious', 'knowledge', 'understand', 'develop', 'study', 'practice'],
  action: ['do', 'start', 'procrastinate', 'lazy', 'motivation', 'energy', 'execute', 'accomplish', 'achieve', 'stuck'],
  resilience: ['stress', 'anxiety', 'overwhelm', 'pressure', 'recover', 'setback', 'fail', 'burnout', 'tired', 'cope']
};

// Emotional state to pillar mapping
const emotionalPillarMap = {
  stressed: 'resilience',
  anxious: 'resilience',
  confused: 'purpose',
  disconnected: 'interpersonal',
  stagnant: 'learning',
  unmotivated: 'action',
  lost: 'purpose',
  frustrated: 'interpersonal',
  overwhelmed: 'resilience',
  curious: 'learning',
  energetic: 'action'
};

// Sentiment keywords for analysis
const sentimentKeywords = {
  negative: ['difficult', 'hard', 'struggle', 'can\'t', 'never', 'hate', 'fail', 'stress', 'anxious', 'worried', 'frustrated'],
  positive: ['love', 'enjoy', 'excited', 'great', 'excellent', 'easy', 'confident', 'happy', 'motivated'],
  uncertain: ['maybe', 'sometimes', 'not sure', 'possibly', 'might', 'perhaps', 'don\'t know']
};

/**
 * Analyze text sentiment
 */
export function analyzeSentiment(text) {
  if (!text) return { sentiment: 'neutral', confidence: 0 };
  
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  let uncertainCount = 0;

  sentimentKeywords.positive.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  sentimentKeywords.negative.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  sentimentKeywords.uncertain.forEach(word => {
    if (lowerText.includes(word)) uncertainCount++;
  });

  const total = positiveCount + negativeCount + uncertainCount;
  if (total === 0) return { sentiment: 'neutral', confidence: 50 };

  if (uncertainCount > positiveCount && uncertainCount > negativeCount) {
    return { sentiment: 'mixed', confidence: 30 + uncertainCount * 10 };
  }
  if (positiveCount > negativeCount) {
    return { sentiment: 'positive', confidence: Math.min(100, 50 + positiveCount * 15) };
  }
  if (negativeCount > positiveCount) {
    return { sentiment: 'negative', confidence: Math.min(100, 50 + negativeCount * 15) };
  }
  return { sentiment: 'neutral', confidence: 50 };
}

/**
 * Calculate response confidence based on answer characteristics
 */
export function calculateResponseConfidence(answer, timeSpentSeconds) {
  if (!answer) return 0;
  
  let confidence = 50;
  
  // Length factor (longer answers often indicate more engagement)
  if (answer.length > 200) confidence += 20;
  else if (answer.length > 100) confidence += 10;
  else if (answer.length < 20) confidence -= 20;
  
  // Time factor (too fast might mean less thought)
  if (timeSpentSeconds < 10) confidence -= 15;
  else if (timeSpentSeconds > 60) confidence += 15;
  else if (timeSpentSeconds > 30) confidence += 5;
  
  // Specificity indicators
  const specificityWords = ['because', 'example', 'specifically', 'when', 'usually'];
  specificityWords.forEach(word => {
    if (answer.toLowerCase().includes(word)) confidence += 5;
  });
  
  return Math.max(0, Math.min(100, confidence));
}

/**
 * Detect emotional indicators from responses
 */
export function detectEmotionalIndicators(responses) {
  const indicators = {
    stress_detected: false,
    enthusiasm_level: 'medium',
    uncertainty_count: 0
  };

  if (!responses || responses.length === 0) return indicators;

  let stressSignals = 0;
  let enthusiasmSignals = 0;

  responses.forEach(response => {
    const text = response.answer?.toLowerCase() || '';
    
    // Stress detection
    if (text.includes('stress') || text.includes('anxious') || text.includes('overwhelm') || text.includes('pressure')) {
      stressSignals++;
    }
    
    // Enthusiasm detection
    if (text.includes('love') || text.includes('excited') || text.includes('passionate') || text.includes('enjoy')) {
      enthusiasmSignals++;
    }
    
    // Uncertainty counting
    if (response.sentiment === 'mixed' || text.includes('not sure') || text.includes('maybe')) {
      indicators.uncertainty_count++;
    }
  });

  indicators.stress_detected = stressSignals >= 2;
  indicators.enthusiasm_level = enthusiasmSignals >= 3 ? 'high' : enthusiasmSignals >= 1 ? 'medium' : 'low';

  return indicators;
}

/**
 * Analyze user responses to detect which pillar they should explore next
 */
export function analyzeResponsesForRouting(responses) {
  if (!responses || responses.length === 0) return null;
  
  const pillarScores = {
    purpose: 0,
    interpersonal: 0,
    learning: 0,
    action: 0,
    resilience: 0
  };

  responses.forEach(response => {
    const text = (response.answer || '').toLowerCase();
    
    Object.entries(responseRoutingKeywords).forEach(([pillar, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          pillarScores[pillar] += 1;
        }
      });
    });
  });

  // Find pillar with highest mention (indicates area of concern/interest)
  const sorted = Object.entries(pillarScores)
    .filter(([_, score]) => score > 0)
    .sort(([,a], [,b]) => b - a);

  return sorted.length > 0 ? { pillar: sorted[0][0], strength: sorted[0][1] } : null;
}

/**
 * Main heuristic: Determine the recommended next pillar
 * Uses user responses, emotional state, and journey progress to personalize recommendations
 */
export function determineNextPillar(userProfile, assessments, currentPillar = null) {
  const completedPillars = new Set(
    assessments.filter(a => a.completed).map(a => a.pillar)
  );
  const allPillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];
  const incompletePillars = allPillars.filter(p => !completedPillars.has(p));

  // Get recent responses for analysis
  const recentAssessments = assessments
    .filter(a => a.completed)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    .slice(0, 3);

  const allRecentResponses = recentAssessments.flatMap(a => a.responses || []);
  const emotionalIndicators = detectEmotionalIndicators(allRecentResponses);

  // Priority 1: Analyze response content for routing signals
  const responseRouting = analyzeResponsesForRouting(allRecentResponses);
  if (responseRouting && responseRouting.strength >= 2 && !completedPillars.has(responseRouting.pillar)) {
    const pillarName = responseRouting.pillar.charAt(0).toUpperCase() + responseRouting.pillar.slice(1);
    return {
      pillar: responseRouting.pillar,
      reason: `Your responses suggest ${pillarName.toLowerCase()} is an important area for you right now.`,
      priority: 'high',
      confidence: 85
    };
  }

  // Priority 2: Stress/anxiety signals → Resilience
  if (emotionalIndicators.stress_detected && !completedPillars.has('resilience')) {
    return {
      pillar: 'resilience',
      reason: 'Your responses indicate stress. Building resilience can help you navigate challenges more effectively.',
      priority: 'high',
      confidence: 90
    };
  }

  // Priority 3: Low enthusiasm/energy → Purpose (reconnect with meaning)
  if (emotionalIndicators.enthusiasm_level === 'low' && !completedPillars.has('purpose')) {
    return {
      pillar: 'purpose',
      reason: 'Reconnecting with your sense of purpose can help reignite your motivation and energy.',
      priority: 'high',
      confidence: 85
    };
  }

  // Priority 4: High uncertainty → Learning (build confidence through knowledge)
  if (emotionalIndicators.uncertainty_count >= 2 && !completedPillars.has('learning')) {
    return {
      pillar: 'learning',
      reason: 'Developing your learning skills can help you feel more confident when facing new challenges.',
      priority: 'medium',
      confidence: 75
    };
  }

  // Priority 5: Weakest pillar score (needs development)
  if (userProfile?.pillar_scores) {
    const scores = userProfile.pillar_scores;
    let weakestPillar = null;
    let lowestScore = Infinity;

    Object.entries(scores).forEach(([pillar, score]) => {
      if (score !== undefined && score < lowestScore && !completedPillars.has(pillar)) {
        lowestScore = score;
        weakestPillar = pillar;
      }
    });

    if (weakestPillar && lowestScore < 60) {
      return {
        pillar: weakestPillar,
        reason: `Strengthening your ${weakestPillar} (${lowestScore}%) will create a more balanced foundation.`,
        priority: 'medium',
        confidence: 75
      };
    }
  }

  // Priority 6: Follow natural pillar flow based on current pillar
  if (currentPillar && pillarGraph[currentPillar]) {
    const adjacentPillars = pillarGraph[currentPillar];
    const nextFromGraph = adjacentPillars.find(p => !completedPillars.has(p));
    
    if (nextFromGraph) {
      const flowReasons = {
        'purpose-learning': 'Now that you\'ve explored your purpose, learning new skills will help you pursue it.',
        'purpose-action': 'With clarity on your purpose, taking action will move you toward your goals.',
        'interpersonal-resilience': 'Strong relationships need resilience to weather challenges together.',
        'interpersonal-purpose': 'Understanding shared purpose deepens meaningful connections.',
        'learning-action': 'Put your new knowledge into practice through purposeful action.',
        'learning-interpersonal': 'Learning with and from others accelerates growth.',
        'action-resilience': 'Sustained action requires resilience when facing obstacles.',
        'action-learning': 'Reflect on your actions to learn and improve.',
        'resilience-purpose': 'Reconnect with your deeper purpose to sustain your resilience.',
        'resilience-interpersonal': 'Lean on your relationships for support and strength.'
      };
      
      const key = `${currentPillar}-${nextFromGraph}`;
      const reason = flowReasons[key] || `${nextFromGraph.charAt(0).toUpperCase() + nextFromGraph.slice(1)} naturally builds on ${currentPillar}.`;
      
      return {
        pillar: nextFromGraph,
        reason: reason,
        priority: 'normal',
        confidence: 70
      };
    }
  }

  // Priority 7: Start with Purpose if new user
  if (incompletePillars.length > 0) {
    if (incompletePillars.includes('purpose')) {
      return {
        pillar: 'purpose',
        reason: 'Begin your journey by exploring what gives your life meaning and direction.',
        priority: 'normal',
        confidence: 70
      };
    }
    
    return {
      pillar: incompletePillars[0],
      reason: `Continue exploring by diving into ${incompletePillars[0]}.`,
      priority: 'normal',
      confidence: 60
    };
  }

  // All completed - suggest deepening weakest area
  if (userProfile?.weakest_pillar) {
    return {
      pillar: userProfile.weakest_pillar,
      reason: `You've explored all pillars! Deepen your ${userProfile.weakest_pillar} skills for continued growth.`,
      priority: 'low',
      confidence: 55
    };
  }

  return {
    pillar: 'purpose',
    reason: 'Start your PILAR journey by exploring your sense of purpose.',
    priority: 'normal',
    confidence: 50
  };
}

/**
 * Calculate journey stage based on completions and scores
 */
export function calculateJourneyStage(totalCompleted, avgScore) {
  if (totalCompleted === 0) return 'newcomer';
  if (totalCompleted < 3) return 'explorer';
  if (totalCompleted < 5 || avgScore < 70) return 'practitioner';
  if (avgScore >= 70) return 'master';
  return 'practitioner';
}

/**
 * Generate activity recommendations based on pillar and score
 */
export function generateActivityRecommendations(pillar, score) {
  const activities = {
    purpose: {
      low: [
        'Write down 3 things that energize you daily',
        'Create a personal values list',
        'Reflect on meaningful moments from the past week'
      ],
      medium: [
        'Develop a 5-year vision statement',
        'Align one daily activity with your core values',
        'Practice weekly purpose journaling'
      ],
      high: [
        'Mentor others in finding their purpose',
        'Create a purpose-driven project',
        'Lead a values-alignment workshop'
      ]
    },
    interpersonal: {
      low: [
        'Practice active listening for 5 minutes daily',
        'Send one appreciation message per day',
        'Notice your reactions in conversations'
      ],
      medium: [
        'Initiate deeper conversations weekly',
        'Practice "I feel" statements',
        'Schedule regular connection calls'
      ],
      high: [
        'Facilitate group discussions',
        'Mediate a conflict constructively',
        'Build a support network for others'
      ]
    },
    learning: {
      low: [
        'Learn one new thing daily',
        'Ask "why" three times today',
        'Read for 10 minutes before bed'
      ],
      medium: [
        'Start a learning journal',
        'Teach someone what you learned',
        'Take on a stretch challenge'
      ],
      high: [
        'Design your own curriculum',
        'Create educational content',
        'Mentor a learner'
      ]
    },
    action: {
      low: [
        'Complete one small task immediately',
        'Set a 2-minute timer and start',
        'Write tomorrow\'s top 3 priorities tonight'
      ],
      medium: [
        'Time-block your most important work',
        'Build a daily action habit',
        'Find an accountability partner'
      ],
      high: [
        'Launch a personal project',
        'Lead a team initiative',
        'Create systems for consistent execution'
      ]
    },
    resilience: {
      low: [
        'Practice 3 deep breaths when stressed',
        'Name your emotions as they arise',
        'Get 7+ hours of sleep tonight'
      ],
      medium: [
        'Develop a stress-response toolkit',
        'Practice daily mindfulness',
        'Build recovery rituals'
      ],
      high: [
        'Help others build resilience',
        'Turn setbacks into growth stories',
        'Lead through challenging situations'
      ]
    }
  };

  const level = score < 40 ? 'low' : score < 70 ? 'medium' : 'high';
  return activities[pillar]?.[level] || activities.purpose.medium;
}

/**
 * Score an answer using heuristics
 */
export function scoreAnswer(answer, pillar, questionId) {
  if (!answer || answer.length < 10) return 30;
  
  let score = 50;
  
  // Length bonus
  if (answer.length > 150) score += 15;
  else if (answer.length > 80) score += 10;
  
  // Sentiment bonus
  const { sentiment } = analyzeSentiment(answer);
  if (sentiment === 'positive') score += 15;
  else if (sentiment === 'negative') score -= 5;
  
  // Specificity bonus
  const specificIndicators = ['because', 'for example', 'specifically', 'I think', 'I feel', 'I believe'];
  specificIndicators.forEach(indicator => {
    if (answer.toLowerCase().includes(indicator)) score += 3;
  });
  
  // Self-awareness bonus
  const awarenessIndicators = ['I realize', 'I notice', 'I\'ve learned', 'I understand'];
  awarenessIndicators.forEach(indicator => {
    if (answer.toLowerCase().includes(indicator)) score += 5;
  });
  
  return Math.max(20, Math.min(100, score));
}