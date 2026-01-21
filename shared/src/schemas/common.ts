/**
 * Common Zod schemas shared across frontend and backend
 */
import { z } from 'zod';

/**
 * UUID v4 validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email format');

/**
 * Non-empty string
 */
export const nonEmptyStringSchema = z.string().min(1, 'Cannot be empty');

/**
 * Pillar IDs
 */
export const pillarIdSchema = z.enum([
  // Egalitarian mode
  'divsexp',
  'indrecip',
  'popularity',
  'grpprosp',
  'outresp',
  // Hierarchical mode
  'normexp',
  'dirrecip',
  'status',
  'ownprosp',
  'incresp'
], { errorMap: () => ({ message: 'Invalid pillar ID' }) });

/**
 * Assessment mode
 */
export const assessmentModeSchema = z.enum(['egalitarian', 'hierarchical'], {
  errorMap: () => ({ message: 'Mode must be either "egalitarian" or "hierarchical"' })
});

/**
 * ISO timestamp
 */
export const timestampSchema = z.string().datetime('Invalid ISO timestamp');

/**
 * Pagination query parameters
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc')
});

/**
 * Standard API response wrapper
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  data: dataSchema.nullable(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }).nullable(),
  metadata: z.object({
    timestamp: timestampSchema,
    requestId: z.string().optional()
  }).optional()
});

/**
 * Standard error response
 */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }),
  metadata: z.object({
    timestamp: timestampSchema,
    requestId: z.string().optional()
  }).optional()
});
