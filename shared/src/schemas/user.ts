/**
 * User-related Zod schemas shared across frontend and backend
 */
import { z } from 'zod';
import { uuidSchema, emailSchema, timestampSchema } from './common';

/**
 * User role
 */
export const userRoleSchema = z.enum(['user', 'admin', 'moderator']);

/**
 * Create user profile request
 */
export const createUserProfileRequestSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  preferences: z.record(z.any()).optional()
});

/**
 * Update user profile request
 */
export const updateUserProfileRequestSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  preferences: z.record(z.any()).optional(),
  avatar_url: z.string().url().optional()
});

/**
 * User profile response
 */
export const userProfileResponseSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  email: emailSchema,
  display_name: z.string().nullable(),
  bio: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  role: userRoleSchema,
  preferences: z.record(z.any()).nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema
});

/**
 * User progress update request
 */
export const updateUserProgressRequestSchema = z.object({
  pillar_id: z.string(),
  progress_data: z.record(z.any()),
  milestone_reached: z.string().optional()
});

/**
 * User progress response
 */
export const userProgressResponseSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  pillar_id: z.string(),
  progress_percentage: z.number().min(0).max(100),
  milestones_completed: z.array(z.string()),
  progress_data: z.record(z.any()),
  last_updated: timestampSchema,
  created_at: timestampSchema
});
