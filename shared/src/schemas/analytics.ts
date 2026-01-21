/**
 * Analytics-related Zod schemas shared across frontend and backend
 */
import { z } from 'zod';
import { uuidSchema, pillarIdSchema, assessmentModeSchema, timestampSchema } from './common';

/**
 * User analytics query parameters
 */
export const userAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  include_trends: z.coerce.boolean().default(true)
});

/**
 * User analytics response
 */
export const userAnalyticsResponseSchema = z.object({
  userId: uuidSchema,
  analytics: z.object({
    totalAssessments: z.number().int().nonnegative(),
    pillarsCovered: z.number().int().nonnegative(),
    modeDistribution: z.record(z.number().int().nonnegative()),
    pillarAverages: z.record(z.number().min(0).max(100)),
    recentActivity: z.number().int().nonnegative(),
    assessmentTrend: z.array(z.object({
      date: timestampSchema,
      pillar: pillarIdSchema,
      mode: assessmentModeSchema
    }))
  })
});

/**
 * Platform assessment analytics response
 */
export const assessmentAnalyticsResponseSchema = z.object({
  analytics: z.object({
    totalAssessments: z.number().int().nonnegative(),
    uniqueUsers: z.number().int().nonnegative(),
    averageAssessmentsPerUser: z.number().nonnegative(),
    pillarDistribution: z.record(z.number().int().nonnegative()),
    modeDistribution: z.record(z.number().int().nonnegative()),
    pillarAverages: z.record(z.number().min(0).max(100)),
    assessmentsByDay: z.array(z.object({
      date: z.string(),
      count: z.number().int().nonnegative()
    }))
  })
});

/**
 * Team analytics response
 */
export const teamAnalyticsResponseSchema = z.object({
  analytics: z.object({
    totalTeams: z.number().int().nonnegative(),
    totalMemberships: z.number().int().nonnegative(),
    averageTeamSize: z.number().nonnegative(),
    largestTeamSize: z.number().int().nonnegative(),
    smallestTeamSize: z.number().int().nonnegative(),
    teamsByDay: z.array(z.object({
      date: z.string(),
      count: z.number().int().nonnegative()
    })),
    teamSizeDistribution: z.object({
      small: z.number().int().nonnegative(),
      medium: z.number().int().nonnegative(),
      large: z.number().int().nonnegative()
    })
  })
});
