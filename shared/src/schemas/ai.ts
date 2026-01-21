/**
 * AI-related Zod schemas shared across frontend and backend
 */
import { z } from 'zod';
import { uuidSchema, pillarIdSchema, assessmentModeSchema } from './common';

/**
 * LLM message role
 */
export const messagRoleSchema = z.enum(['system', 'user', 'assistant']);

/**
 * LLM message
 */
export const messageSchema = z.object({
  role: messagRoleSchema,
  content: z.string().min(1, 'Message content cannot be empty')
});

/**
 * Coaching conversation request
 */
export const coachConversationRequestSchema = z.object({
  message: z.string().min(1, 'Message required').max(5000, 'Message too long'),
  pillar_id: pillarIdSchema,
  mode: assessmentModeSchema,
  assessment_id: uuidSchema.optional(),
  conversation_history: z.array(messageSchema).max(50).optional()
});

/**
 * RAG query request
 */
export const ragQueryRequestSchema = z.object({
  query: z.string().min(1, 'Query required').max(5000, 'Query too long'),
  pillar: pillarIdSchema.optional(),
  mode: assessmentModeSchema.optional(),
  category: z.string().optional(),
  limit: z.number().int().positive().max(50).optional().default(10),
  threshold: z.number().min(0).max(1).optional().default(0.7)
});

/**
 * RAG search result
 */
export const ragSearchResultSchema = z.object({
  id: uuidSchema,
  content: z.string(),
  metadata: z.object({
    pillar: pillarIdSchema.optional(),
    mode: assessmentModeSchema.optional(),
    category: z.string().optional(),
    source: z.string().optional()
  }),
  similarity: z.number().min(0).max(1)
});

/**
 * Quiz question generation request
 */
export const generateQuizQuestionsRequestSchema = z.object({
  pillar_id: pillarIdSchema,
  mode: assessmentModeSchema,
  count: z.number().int().positive().max(20).default(10)
});

/**
 * Quiz question
 */
export const quizQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  type: z.enum(['likert', 'multiple_choice', 'text', 'boolean']),
  options: z.array(z.string()).optional(),
  force_id: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * Content analysis request
 */
export const analyzeContentRequestSchema = z.object({
  content: z.string().min(1, 'Content required').max(10000, 'Content too long'),
  analysis_type: z.enum(['pilar_alignment', 'sentiment', 'complexity']).optional().default('pilar_alignment')
});

/**
 * Content analysis result
 */
export const contentAnalysisResultSchema = z.object({
  alignment: z.object({
    pillar: pillarIdSchema,
    mode: assessmentModeSchema,
    confidence: z.number().min(0).max(1)
  }).optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
  complexity_score: z.number().min(0).max(100).optional(),
  insights: z.array(z.string())
});

/**
 * Coaching guidance request
 */
export const coachingGuidanceRequestSchema = z.object({
  user_id: uuidSchema,
  pillar_id: pillarIdSchema,
  mode: assessmentModeSchema,
  assessment_results: z.object({
    pillar_score: z.number(),
    force_scores: z.record(z.number())
  }).optional()
});
