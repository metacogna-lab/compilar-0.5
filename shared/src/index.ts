/**
 * @compilar/shared - Shared contracts for Compilar
 *
 * This package provides a single source of truth for API contracts
 * between the frontend and backend.
 *
 * Features:
 * - Zod schemas for runtime validation
 * - TypeScript types derived from schemas (z.infer)
 * - Consistent error handling
 * - Type-safe API contracts
 *
 * Usage:
 *
 * Backend (validation):
 * ```typescript
 * import { createAssessmentRequestSchema } from '@compilar/shared/schemas';
 * import { validateBody } from '../middleware/validation';
 *
 * app.post('/assessments',
 *   validateBody(createAssessmentRequestSchema),
 *   handler
 * );
 * ```
 *
 * Frontend (types):
 * ```typescript
 * import type { CreateAssessmentRequest, AssessmentResponse } from '@compilar/shared/types';
 *
 * const createAssessment = async (data: CreateAssessmentRequest): Promise<AssessmentResponse> => {
 *   // Type-safe API call
 * };
 * ```
 */

// Export all schemas for validation
export * as schemas from './schemas';

// Export all types for TypeScript
export * as types from './types';

// Convenience re-exports
export * from './schemas';
export * from './types';
