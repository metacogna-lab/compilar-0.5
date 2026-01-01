/**
 * Functions Routes
 *
 * Compatibility layer for Base44-style function calls
 * Proxies function invocations to appropriate REST endpoints
 */

import { Hono } from 'hono';
import { supabase } from '../index';
import { requireAuth } from '../middleware/auth';
import { rateLimitGeneral } from '../middleware/ratelimit';
import { shouldUseRestForFunction, logMigrationEvent } from '../config/feature-flags';

const functions = new Hono();

/**
 * POST /api/v1/functions/:functionName
 * Proxy Base44-style function calls to REST endpoints
 */
functions.post('/:functionName', requireAuth, rateLimitGeneral, async (c) => {
  const user = c.get('user');
  const functionName = c.req.param('functionName');
  const body = await c.req.json();

  logMigrationEvent(`Function call: ${functionName}`, { userId: user.id, functionName });

  try {
    // Check if this function should use REST API
    if (shouldUseRestForFunction(functionName)) {
      logMigrationEvent(`Using REST for function: ${functionName}`);
      // Route to REST handlers
      switch (functionName) {
        case 'generateQuestionsByDifficulty':
          return await handleGenerateQuestions(user, body);

        case 'vectorSearch':
          return await handleVectorSearch(user, body);

        case 'generateAICoaching':
          return await handleGenerateAICoaching(user, body);

        case 'getUserProfileInsights':
          return await handleGetUserProfileInsights(user, body);

        case 'analyzeContent':
          return await handleAnalyzeContent(user, body);

        case 'getAssessmentGuidance':
          return await handleGetAssessmentGuidance(user, body);

        default:
          return c.json({
            error: `Unknown function: ${functionName}`,
            availableFunctions: [
              'generateQuestionsByDifficulty',
              'vectorSearch',
              'generateAICoaching',
              'getUserProfileInsights',
              'analyzeContent',
              'getAssessmentGuidance'
            ]
          }, 400);
      }
    } else {
      logMigrationEvent(`Using Base44 fallback for function: ${functionName}`);
      // Return Base44-style response indicating migration not yet enabled
      return c.json({
        success: false,
        error: `Function ${functionName} migration not yet enabled`,
        migrationStatus: 'pending',
        message: 'This function will be migrated to REST API in upcoming phases'
      }, 503);
    }
  } catch (error: any) {
    console.error(`Function ${functionName} error:`, error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * Handle generateQuestionsByDifficulty function
 */
async function handleGenerateQuestions(user: any, body: any) {
  const { pillar, mode, count = 10, difficulty } = body;

  if (!pillar || !mode) {
    throw new Error('pillar and mode are required');
  }

  // Proxy to AI quiz questions endpoint
  const aiResponse = await fetch('http://localhost:3001/api/v1/ai/quiz-questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getMockToken()}`, // Use mock token for internal calls
    },
    body: JSON.stringify({ pillar, mode, count }),
  });

  if (!aiResponse.ok) {
    const error = await aiResponse.text();
    throw new Error(`AI service error: ${error}`);
  }

  const data = await aiResponse.json();

  // Transform response to Base44 format
  return {
    success: true,
    data: {
      questions: data.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options,
        pillar_force: q.pillar_force,
        difficulty: q.difficulty,
      }))
    }
  };
}

/**
 * Handle vectorSearch function
 */
async function handleVectorSearch(user: any, body: any) {
  const { query, pillar, mode, limit = 5 } = body;

  if (!query) {
    throw new Error('query is required');
  }

  // Proxy to RAG query endpoint
  const ragResponse = await fetch('http://localhost:3001/api/v1/rag/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getMockToken()}`,
    },
    body: JSON.stringify({ query, pillar, mode, limit }),
  });

  if (!ragResponse.ok) {
    const error = await ragResponse.text();
    throw new Error(`RAG service error: ${error}`);
  }

  const data = await ragResponse.json();

  // Transform response to Base44 format
  return {
    success: true,
    data: {
      results: data.results.map((r: any) => ({
        content: r.content,
        pillar: r.pillar,
        mode: r.mode,
        relevance_score: r.relevance_score,
        metadata: r.metadata,
      }))
    }
  };
}

/**
 * Handle generateAICoaching function
 */
async function handleGenerateAICoaching(user: any, body: any) {
  const { assessmentId, pillar, mode, scores, responses } = body;

  if (!assessmentId || !pillar || !mode) {
    throw new Error('assessmentId, pillar, and mode are required');
  }

  // Proxy to AI coaching endpoint
  const coachingResponse = await fetch('http://localhost:3001/api/v1/ai/coaching', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getMockToken()}`,
    },
    body: JSON.stringify({ assessmentId, pillar, mode, scores, responses }),
  });

  if (!coachingResponse.ok) {
    const error = await coachingResponse.text();
    throw new Error(`Coaching service error: ${error}`);
  }

  // For streaming responses, we need to handle differently
  // For now, return a placeholder
  return {
    success: true,
    data: {
      coaching: {
        summary: 'Coaching feedback generated',
        strengths_identified: [],
        areas_for_improvement: [],
        actionable_recommendations: [],
        next_steps: [],
      }
    }
  };
}

/**
 * Handle getUserProfileInsights function
 */
async function handleGetUserProfileInsights(user: any, body: any) {
  // Proxy to user progress endpoint
  const progressResponse = await fetch(`http://localhost:3001/api/v1/users/progress`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getMockToken()}`,
    },
  });

  if (!progressResponse.ok) {
    const error = await progressResponse.text();
    throw new Error(`User service error: ${error}`);
  }

  const data = await progressResponse.json();

  // Transform to Base44 format
  return {
    success: true,
    data: {
      insights: {
        total_assessments: data.stats.totalAssessments,
        pillars_covered: data.stats.pillarsCovered,
        modes_covered: data.stats.modesCovered,
        pillar_averages: data.stats.pillarAverages,
        recent_activity: data.stats.recentActivity,
      }
    }
  };
}

/**
 * Handle analyzeContent function
 */
async function handleAnalyzeContent(user: any, body: any) {
  const { content, pillar, mode } = body;

  if (!content) {
    throw new Error('content is required');
  }

  // Proxy to AI analyze content endpoint
  const analysisResponse = await fetch('http://localhost:3001/api/v1/ai/analyze-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getMockToken()}`,
    },
    body: JSON.stringify({ content, pillar, mode }),
  });

  if (!analysisResponse.ok) {
    const error = await analysisResponse.text();
    throw new Error(`Analysis service error: ${error}`);
  }

  const data = await analysisResponse.json();

  return {
    success: true,
    data: {
      analysis: data.analysis
    }
  };
}

/**
 * Handle getAssessmentGuidance function
 */
async function handleGetAssessmentGuidance(user: any, body: any) {
  const { pillar, mode } = body;

  // Proxy to AI guidance endpoint
  const guidanceResponse = await fetch('http://localhost:3001/api/v1/ai/guidance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getMockToken()}`,
    },
    body: JSON.stringify({ pillar, mode }),
  });

  if (!guidanceResponse.ok) {
    const error = await guidanceResponse.text();
    throw new Error(`Guidance service error: ${error}`);
  }

  const data = await guidanceResponse.json();

  return {
    success: true,
    data: {
      guidance: data.guidance
    }
  };
}

/**
 * Get mock token for internal API calls
 * TODO: Implement proper service-to-service authentication
 */
function getMockToken(): string {
  // This should be replaced with proper service authentication
  return 'mock-service-token';
}

export { functions };