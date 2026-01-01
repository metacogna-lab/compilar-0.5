import { z } from 'zod'

// Base schemas
export const uuidSchema = z.string().uuid()
export const emailSchema = z.string().email()
export const timestampSchema = z.string().datetime()

// User Profile Schema
export const userProfileSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  full_name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const userProfileInsertSchema = userProfileSchema.omit({
  created_at: true,
  updated_at: true,
})

// PILAR Assessment Schema
export const pilarAssessmentSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  pillar_id: z.string(),
  mode: z.enum(['egalitarian', 'hierarchical']),
  scores: z.record(z.number()).default({}),
  forces_data: z.record(z.any()).default({}),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const pilarAssessmentInsertSchema = pilarAssessmentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// Assessment Session Schema
export const assessmentSessionSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  pillar_id: z.string().nullable(),
  mode: z.enum(['egalitarian', 'hierarchical']).nullable(),
  stage: z.string().default('profile'),
  responses: z.record(z.any()).default({}),
  results: z.record(z.any()).nullable(),
  session_quality_score: z.number().min(0).max(100).nullable(),
  started_at: timestampSchema,
  completed_at: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const assessmentSessionInsertSchema = assessmentSessionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  started_at: true,
})

// User Progress Schema
export const userProgressSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  pillar_id: z.string(),
  mode: z.enum(['egalitarian', 'hierarchical']),
  current_level: z.number().int().min(1).default(1),
  experience_points: z.number().int().min(0).default(0),
  completed_challenges: z.number().int().min(0).default(0),
  mastery_score: z.number().min(0).max(100).nullable(),
  last_activity: timestampSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const userProgressInsertSchema = userProgressSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// CMS Content Schema
export const cmsContentSchema = z.object({
  id: uuidSchema,
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  content_type: z.enum(['blog', 'page', 'resource']).default('blog'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  author_id: uuidSchema.nullable(),
  published_date: timestampSchema.nullable(),
  metadata: z.record(z.any()).default({}),
  tags: z.array(z.string()).default([]),
  pillar: z.string().nullable(),
  force_vector: z.string().nullable(),
  social_image_url: z.string().url().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const cmsContentInsertSchema = cmsContentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// PILAR Knowledge Schema
export const pilarKnowledgeSchema = z.object({
  id: uuidSchema,
  pillar_id: z.string(),
  mode: z.enum(['egalitarian', 'hierarchical']),
  title: z.string(),
  description: z.string(),
  forces: z.array(z.any()).default([]),
  indicators: z.record(z.array(z.string())).default({}),
  key_questions: z.array(z.string()).default([]),
  full_description: z.string(),
  abbreviation: z.string(),
  icon: z.string(),
  color: z.string(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

// Team Schema
export const teamSchema = z.object({
  id: uuidSchema,
  team_name: z.string(),
  description: z.string().nullable(),
  owner_email: emailSchema,
  owner_id: uuidSchema.nullable(),
  aggregated_scores: z.record(z.number()).default({}),
  settings: z.record(z.any()).default({}),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const teamInsertSchema = teamSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// Team Member Schema
export const teamMemberSchema = z.object({
  id: uuidSchema,
  team_id: uuidSchema,
  user_id: uuidSchema,
  role: z.enum(['owner', 'admin', 'member']).default('member'),
  joined_at: timestampSchema,
})

export const teamMemberInsertSchema = teamMemberSchema.omit({
  id: true,
  joined_at: true,
})

// Study Group Schema
export const studyGroupSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  description: z.string().nullable(),
  owner_id: uuidSchema,
  max_members: z.number().int().min(1).default(10),
  is_private: z.boolean().default(false),
  settings: z.record(z.any()).default({}),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const studyGroupInsertSchema = studyGroupSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// User Gamification Schema
export const userGamificationSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  total_points: z.number().int().min(0).default(0),
  current_streak: z.number().int().min(0).default(0),
  longest_streak: z.number().int().min(0).default(0),
  badges_earned: z.number().int().min(0).default(0),
  trophies_earned: z.number().int().min(0).default(0),
  level: z.number().int().min(1).default(1),
  experience_points: z.number().int().min(0).default(0),
  achievements: z.array(z.any()).default([]),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const userGamificationInsertSchema = userGamificationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// Badge Schema
export const badgeSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  category: z.string(),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']).default('common'),
  requirements: z.record(z.any()).default({}),
  points_value: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  created_at: timestampSchema,
})

// User Badge Schema
export const userBadgeSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  badge_id: uuidSchema,
  earned_at: timestampSchema,
})

// Coach Conversation Schema
export const coachConversationSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  session_id: uuidSchema.nullable(),
  messages: z.array(z.any()).default([]),
  context: z.record(z.any()).default({}),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const coachConversationInsertSchema = coachConversationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

// User Analytics Schema
export const userAnalyticsSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  event_type: z.string(),
  event_data: z.record(z.any()).default({}),
  session_id: z.string().nullable(),
  page_url: z.string().url().nullable(),
  user_agent: z.string().nullable(),
  ip_address: z.string().nullable(),
  created_at: timestampSchema,
})

// Session Analytics Schema
export const sessionAnalyticsSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  session_id: uuidSchema,
  duration_seconds: z.number().int().nullable(),
  completion_rate: z.number().min(0).max(100).nullable(),
  interaction_count: z.number().int().min(0).default(0),
  pillar_focus: z.string().nullable(),
  mode: z.enum(['egalitarian', 'hierarchical']).nullable(),
  quality_score: z.number().min(0).max(100).nullable(),
  created_at: timestampSchema,
})

// API Response Schemas
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: dataSchema,
  error: z.string().nullable(),
})

export const paginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: z.array(dataSchema),
  count: z.number().int().min(0),
  page: z.number().int().min(1),
  totalPages: z.number().int().min(0),
})

// Type exports
export type UserProfile = z.infer<typeof userProfileSchema>
export type PilarAssessment = z.infer<typeof pilarAssessmentSchema>
export type AssessmentSession = z.infer<typeof assessmentSessionSchema>
export type UserProgress = z.infer<typeof userProgressSchema>
export type CmsContent = z.infer<typeof cmsContentSchema>
export type PilarKnowledge = z.infer<typeof pilarKnowledgeSchema>
export type Team = z.infer<typeof teamSchema>
export type TeamMember = z.infer<typeof teamMemberSchema>
export type StudyGroup = z.infer<typeof studyGroupSchema>
export type UserGamification = z.infer<typeof userGamificationSchema>
export type Badge = z.infer<typeof badgeSchema>
export type UserBadge = z.infer<typeof userBadgeSchema>
export type CoachConversation = z.infer<typeof coachConversationSchema>
export type UserAnalytics = z.infer<typeof userAnalyticsSchema>
export type SessionAnalytics = z.infer<typeof sessionAnalyticsSchema>