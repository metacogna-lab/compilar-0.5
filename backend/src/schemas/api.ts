import { z } from 'zod'
import {
  pilarAssessmentSchema,
  cmsContentSchema,
  assessmentSessionSchema,
} from './database'

// Auth API Schemas
export const authMeResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  }),
})

// Assessment API Schemas
export const createAssessmentRequestSchema = z.object({
  pillar_id: z.string(),
  mode: z.enum(['egalitarian', 'hierarchical']),
  scores: z.record(z.number()).optional(),
  forces_data: z.record(z.any()).optional(),
})

export const createAssessmentResponseSchema = z.object({
  assessment: pilarAssessmentSchema,
})

export const listAssessmentsResponseSchema = z.object({
  assessments: z.array(pilarAssessmentSchema),
})

export const getAssessmentResponseSchema = z.object({
  assessment: pilarAssessmentSchema,
})

// Assessment Session API Schemas
export const createSessionRequestSchema = z.object({
  pillar_id: z.string().optional(),
  mode: z.enum(['egalitarian', 'hierarchical']).optional(),
})

export const createSessionResponseSchema = z.object({
  session: assessmentSessionSchema,
})

// Blog API Schemas
export const listBlogPostsResponseSchema = z.object({
  posts: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    slug: z.string(),
    excerpt: z.string().nullable(),
    author_id: z.string().uuid().nullable(),
    published_date: z.string().datetime().nullable(),
    metadata: z.record(z.any()),
    tags: z.array(z.string()),
    pillar: z.string().nullable(),
    force_vector: z.string().nullable(),
    social_image_url: z.string().url().nullable(),
  })),
})

export const getBlogPostResponseSchema = z.object({
  post: cmsContentSchema,
})

export const getBlogPillarsResponseSchema = z.object({
  pillars: z.array(z.string()),
})

export const getBlogTagsResponseSchema = z.object({
  tags: z.array(z.string()),
})

// AI Coaching API Schemas
export const generateCoachingRequestSchema = z.object({
  user_id: z.string().uuid(),
  session_id: z.string().uuid().optional(),
  pillar_id: z.string(),
  mode: z.enum(['egalitarian', 'hierarchical']),
  assessment_data: z.record(z.any()),
  conversation_history: z.array(z.any()).optional(),
})

export const generateCoachingResponseSchema = z.object({
  coaching: z.object({
    summary: z.string(),
    strengths_identified: z.array(z.string()),
    areas_for_improvement: z.array(z.string()),
    actionable_recommendations: z.array(z.string()),
    next_steps: z.array(z.string()),
  }),
  conversation_id: z.string().uuid(),
})

// Legacy RAG Query API Schemas (keeping for backward compatibility)
export const legacyRagQueryRequestSchema = z.object({
  query: z.string(),
  pillar: z.string().optional(),
  mode: z.enum(['egalitarian', 'hierarchical']).optional(),
  context: z.record(z.any()).optional(),
})

export const legacyRagQueryResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(z.object({
    content: z.string(),
    pillar: z.string(),
    mode: z.string(),
    relevance_score: z.number(),
  })),
  confidence: z.number(),
})

// Question Generation API Schemas
export const generateQuestionsRequestSchema = z.object({
  pillar_id: z.string(),
  mode: z.enum(['egalitarian', 'hierarchical']),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  count: z.number().int().min(1).max(20).optional(),
  user_context: z.record(z.any()).optional(),
})

export const generateQuestionsResponseSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    type: z.enum(['multiple_choice', 'scale', 'open_ended']),
    options: z.array(z.string()).optional(),
    pillar_force: z.string(),
    difficulty: z.string(),
  })),
})

// Content Management API Schemas
export const createContentRequestSchema = z.object({
  title: z.string(),
  content: z.string(),
  content_type: z.enum(['blog', 'page', 'resource']).optional(),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pillar: z.string().optional(),
  force_vector: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const createContentResponseSchema = z.object({
  content: cmsContentSchema,
})

export const updateContentRequestSchema = createContentRequestSchema.partial()

export const listContentResponseSchema = z.object({
  content: z.array(cmsContentSchema),
  total: z.number(),
})

// Team API Schemas
export const createTeamRequestSchema = z.object({
  team_name: z.string(),
  description: z.string().optional(),
  settings: z.record(z.any()).optional(),
})

export const createTeamResponseSchema = z.object({
  team: z.object({
    id: z.string().uuid(),
    team_name: z.string(),
    description: z.string().nullable(),
    owner_email: z.string().email(),
    owner_id: z.string().uuid(),
    created_at: z.string().datetime(),
  }),
})

export const listTeamsResponseSchema = z.object({
  teams: z.array(z.object({
    id: z.string().uuid(),
    team_name: z.string(),
    description: z.string().nullable(),
    owner_email: z.string().email(),
    member_count: z.number(),
    created_at: z.string().datetime(),
  })),
})

// Error Response Schema
export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
})

// Generic API Response
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: dataSchema.optional(),
  error: z.string().optional(),
})

// Health Check Response
export const healthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string().datetime(),
  version: z.string().optional(),
  database: z.object({
    status: z.string(),
    latency: z.number().optional(),
  }).optional(),
})

// AI API Schemas (aligned with API specification)

// Coach Conversation API Schemas
export const coachConversationRequestSchema = z.object({
  message: z.string().min(1),
  context: z.object({
    pillar_id: z.string().optional(),
    mode: z.enum(['egalitarian', 'hierarchical']).optional(),
    assessment_id: z.string().uuid().optional()
  }).optional(),
  conversation_id: z.string().uuid().optional()
});

export const coachConversationResponseSchema = z.object({
  conversation_id: z.string().uuid(),
  response: z.string(),
  suggestions: z.array(z.string()).optional(),
  follow_up_questions: z.array(z.string()).optional()
});

// RAG Query API Schemas
export const ragQueryRequestSchema = z.object({
  query: z.string().min(1),
  pillar_id: z.string().optional(),
  mode: z.enum(['egalitarian', 'hierarchical']).optional(),
  context: z.string().optional()
});

export const ragQueryResponseSchema = z.object({
  response: z.string(),
  sources: z.array(z.object({
    title: z.string(),
    relevance_score: z.number().min(0).max(1),
    excerpt: z.string().optional()
  })).optional(),
  related_pillars: z.array(z.string()).optional()
});

// Assessment Guidance API Schemas
export const assessmentGuidanceRequestSchema = z.object({
  assessment_id: z.string().uuid(),
  user_profile: z.record(z.any()).optional(),
  conversation_history: z.array(z.any()).optional()
});

export const assessmentGuidanceResponseSchema = z.object({
  guidance: z.string(),
  assessment_data: z.record(z.any()),
  conversation_context: z.array(z.any())
});

// Content Analysis API Schemas
export const contentAnalysisRequestSchema = z.object({
  content: z.string().min(1),
  content_type: z.string().optional()
});

export const contentAnalysisResponseSchema = z.object({
  pilar_alignment: z.record(z.object({
    score: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1)
  })),
  key_themes: z.array(z.string()),
  recommendations: z.array(z.string())
});

// Enhanced Generic API Response Schema (with pagination and timing)
export const enhancedApiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: dataSchema.optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }).optional(),
  meta: z.object({
    timestamp: z.string().datetime(),
    requestId: z.string().uuid(),
    version: z.string(),
    executionTime: z.number().optional(),
    pagination: z.object({
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
      has_more: z.boolean()
    }).optional()
  })
 });


// Additional Assessment Schemas
export const submitAnswerRequestSchema = z.object({
  question_id: z.string().uuid(),
  answer: z.union([z.number(), z.string(), z.boolean()])
});

export const completeAssessmentRequestSchema = z.object({
  final_notes: z.string().max(1000).optional()
});

// User Schemas
export const updateProfileRequestSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  preferred_mode: z.enum(['egalitarian', 'hierarchical']).optional(),
  preferences: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
});

export const historyQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
});

// Team Schemas
export const updateTeamRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional()
});

export const addTeamMemberRequestSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'member']).default('member')
});

// Updated RAG Schemas
export const ragQueryRequestSchemaFull = z.object({
  query: z.string().min(1).max(1000),
  pillar: z.string().optional(),
  mode: z.enum(['egalitarian', 'hierarchical']).optional(),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(20).default(5)
});

export const ingestKnowledgeRequestSchema = z.object({
  content: z.string().min(1),
  metadata: z.object({
    title: z.string().optional(),
    pillar: z.string().optional(),
    mode: z.enum(['egalitarian', 'hierarchical']).optional(),
    category: z.string().optional()
  }).optional()
});

// Content Schemas
export const updateContentRequestSchemaFull = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  content_type: z.enum(['blog', 'page', 'resource']).optional(),
  pillar_id: z.string().optional(),
  mode: z.enum(['egalitarian', 'hierarchical']).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional()
});

export const contentQuerySchema = z.object({
  pillar: z.string().optional(),
  mode: z.enum(['egalitarian', 'hierarchical']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0)
});

// Type exports
