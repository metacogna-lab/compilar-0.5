/**
 * Team-related Zod schemas shared across frontend and backend
 */
import { z } from 'zod';
import { uuidSchema, emailSchema, timestampSchema } from './common';

/**
 * Team member role
 */
export const teamMemberRoleSchema = z.enum(['owner', 'admin', 'member', 'viewer']);

/**
 * Create team request
 */
export const createTeamRequestSchema = z.object({
  name: z.string().min(1, 'Team name required').max(100),
  description: z.string().max(500).optional(),
  settings: z.record(z.any()).optional()
});

/**
 * Update team request
 */
export const updateTeamRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  settings: z.record(z.any()).optional()
});

/**
 * Team response
 */
export const teamResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  description: z.string().nullable(),
  owner_id: uuidSchema,
  settings: z.record(z.any()).nullable(),
  member_count: z.number().int().nonnegative(),
  created_at: timestampSchema,
  updated_at: timestampSchema
});

/**
 * Add team member request
 */
export const addTeamMemberRequestSchema = z.object({
  user_id: uuidSchema.optional(),
  email: emailSchema.optional(),
  role: teamMemberRoleSchema.default('member')
}).refine(data => data.user_id || data.email, {
  message: 'Either user_id or email must be provided'
});

/**
 * Update team member request
 */
export const updateTeamMemberRequestSchema = z.object({
  role: teamMemberRoleSchema
});

/**
 * Team member response
 */
export const teamMemberResponseSchema = z.object({
  id: uuidSchema,
  team_id: uuidSchema,
  user_id: uuidSchema,
  role: teamMemberRoleSchema,
  joined_at: timestampSchema,
  user_profile: z.object({
    display_name: z.string().nullable(),
    email: emailSchema,
    avatar_url: z.string().url().nullable()
  }).optional()
});
