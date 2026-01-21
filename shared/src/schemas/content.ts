/**
 * Content-related Zod schemas shared across frontend and backend
 */
import { z } from 'zod';
import { uuidSchema, pillarIdSchema, assessmentModeSchema, timestampSchema } from './common';

/**
 * Content type enum
 */
export const contentTypeSchema = z.enum([
  'article', 'guide', 'tutorial', 'video', 'infographic', 'assessment', 'resource'
]);

/**
 * Content status enum
 */
export const contentStatusSchema = z.enum(['draft', 'published', 'archived']);

/**
 * Content query parameters
 */
export const contentQuerySchema = z.object({
  pillar: pillarIdSchema.optional(),
  mode: assessmentModeSchema.optional(),
  content_type: contentTypeSchema.optional(),
  status: contentStatusSchema.default('published'),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0)
});

/**
 * Create content request
 */
export const createContentRequestSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  content: z.string().min(1, 'Content required'),
  content_type: contentTypeSchema,
  pillar_id: pillarIdSchema.optional(),
  mode: assessmentModeSchema.optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
  status: contentStatusSchema.default('draft')
});

/**
 * Content response
 */
export const contentResponseSchema = z.object({
  id: uuidSchema,
  title: z.string(),
  content: z.string(),
  content_type: contentTypeSchema,
  pillar_id: pillarIdSchema.nullable(),
  mode: assessmentModeSchema.nullable(),
  tags: z.array(z.string()),
  metadata: z.record(z.any()),
  status: contentStatusSchema,
  created_by: uuidSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema
});

/**
 * Update content request
 */
export const updateContentRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  content_type: contentTypeSchema.optional(),
  pillar_id: pillarIdSchema.optional(),
  mode: assessmentModeSchema.optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  status: contentStatusSchema.optional()
});

/**
 * Content list response
 */
export const contentListResponseSchema = z.object({
  content: z.array(contentResponseSchema),
  pagination: z.object({
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
    hasMore: z.boolean()
  })
});
