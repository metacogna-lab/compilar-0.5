/**
 * Assessment-related Zod schemas shared across frontend and backend
 */
import { z } from 'zod';
import { uuidSchema, pillarIdSchema, assessmentModeSchema, timestampSchema } from './common';

/**
 * Assessment creation request
 */
export const createAssessmentRequestSchema = z.object({
  pillar_id: pillarIdSchema,
  mode: assessmentModeSchema
});

/**
 * Assessment response
 */
export const assessmentResponseSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  pillar_id: pillarIdSchema,
  mode: assessmentModeSchema,
  scores: z.record(z.number()).optional(),
  forces_data: z.record(z.any()).optional(),
  created_at: timestampSchema,
  updated_at: timestampSchema
});

/**
 * Submit answer request
 */
export const submitAnswerRequestSchema = z.object({
  question_id: z.string().min(1, 'Question ID required'),
  answer: z.union([
    z.number().int().min(1).max(5), // Likert scale
    z.string(),
    z.boolean(),
    z.array(z.string())
  ])
});

/**
 * Answer data stored in assessment
 */
export const answerDataSchema = z.object({
  answer: z.union([
    z.number().int().min(1).max(5),
    z.string(),
    z.boolean(),
    z.array(z.string())
  ]),
  timestamp: timestampSchema
});

/**
 * Complete assessment request
 */
export const completeAssessmentRequestSchema = z.object({
  final_responses: z.record(answerDataSchema).optional()
});

/**
 * Assessment results
 */
export const assessmentResultsSchema = z.object({
  pillar_score: z.number().min(0).max(100),
  force_scores: z.record(z.number().min(0).max(100)),
  insights: z.array(z.string()),
  recommendations: z.array(z.string()).optional()
});

/**
 * Assessment session response
 */
export const assessmentSessionResponseSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  assessment_id: uuidSchema,
  pillar_id: pillarIdSchema,
  mode: assessmentModeSchema,
  responses: z.record(answerDataSchema),
  results: assessmentResultsSchema.nullable(),
  completed_at: timestampSchema.nullable(),
  session_quality_score: z.number().min(0).max(100).nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema
});

/**
 * List assessments query parameters
 */
export const listAssessmentsQuerySchema = z.object({
  pillar_id: pillarIdSchema.optional(),
  mode: assessmentModeSchema.optional(),
  completed: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});
