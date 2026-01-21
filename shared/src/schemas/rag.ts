/**
 * RAG (Retrieval-Augmented Generation) schemas
 */
import { z } from 'zod';
import { uuidSchema, pillarIdSchema, assessmentModeSchema } from './common';

/**
 * Force data
 */
export const forceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  pillar_id: pillarIdSchema,
  mode: assessmentModeSchema,
  category: z.string(),
  weight: z.number().min(0).max(1).optional()
});

/**
 * Get forces query
 */
export const getForcesQuerySchema = z.object({
  mode: assessmentModeSchema.optional()
});

/**
 * Force connection
 */
export const forceConnectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  source_pillar: pillarIdSchema,
  target_pillar: pillarIdSchema,
  mode: assessmentModeSchema,
  connection_type: z.enum(['reinforce', 'inverse', 'discretionary']),
  strength: z.number().min(0).max(1).optional()
});

/**
 * Get connections query
 */
export const getConnectionsQuerySchema = z.object({
  mode: assessmentModeSchema,
  pillar_id: pillarIdSchema.optional()
});

/**
 * Ingest knowledge request (admin only)
 */
export const ingestKnowledgeRequestSchema = z.object({
  content: z.string().min(1, 'Content required').max(50000),
  metadata: z.object({
    pillar: pillarIdSchema.optional(),
    mode: assessmentModeSchema.optional(),
    category: z.string().optional(),
    source: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional()
});

/**
 * Knowledge ingestion result
 */
export const knowledgeIngestionResultSchema = z.object({
  id: uuidSchema,
  chunks_created: z.number().int().nonnegative(),
  embedding_dimensions: z.number().int().positive(),
  processing_time_ms: z.number().nonnegative()
});
