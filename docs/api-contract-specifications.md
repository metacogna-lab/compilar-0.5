# API Contract Specifications

## Overview

This document provides detailed, implementation-ready specifications for all API contracts in the Compilar system. These contracts define the exact request/response formats, validation rules, and error handling for the Base44-to-REST migration.

## Contract Architecture

### Base Contract Interface

```typescript
interface APIContract<TRequest = any, TResponse = any> {
  // Endpoint metadata
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  auth: boolean;

  // Schema definitions
  requestSchema: ZodSchema<TRequest>;
  responseSchema: ZodSchema<TResponse>;
  errorSchema: ZodSchema<APIError>;

  // Implementation details
  rateLimit?: RateLimit;
  cache?: CacheConfig;
  timeout?: number;
}
```

### Standard Response Wrapper

```typescript
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta: ResponseMeta;
}

interface ResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
  executionTime?: number;
  pagination?: PaginationMeta;
}

interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  nextOffset?: number;
  prevOffset?: number;
}
```

## Entity CRUD Contracts

### PilarAssessment Contract

**Base Path:** `/api/v1/entities/pilar-assessments`

#### List Assessments
```typescript
const listPilarAssessmentsContract: APIContract<ListOptions, PilarAssessment[]> = {
  method: 'GET',
  path: '/api/v1/entities/pilar-assessments',
  auth: true,

  requestSchema: z.object({
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0),
    orderBy: z.enum(['created_at', 'updated_at', 'pillar_id']).default('created_at'),
    orderDirection: z.enum(['asc', 'desc']).default('desc'),
    filter: z.object({
      pillar_id: z.string().optional(),
      mode: z.enum(['egalitarian', 'hierarchical']).optional(),
      user_id: z.string().uuid().optional() // Admin only
    }).optional()
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: z.array(pilarAssessmentSchema),
    meta: responseMetaSchema.extend({
      pagination: paginationMetaSchema
    })
  })
};
```

#### Create Assessment
```typescript
const createPilarAssessmentContract: APIContract<CreatePilarAssessmentRequest, PilarAssessment> = {
  method: 'POST',
  path: '/api/v1/entities/pilar-assessments',
  auth: true,

  requestSchema: z.object({
    pillar_id: z.string().min(1).max(50),
    mode: z.enum(['egalitarian', 'hierarchical']),
    scores: z.record(z.number().min(0).max(10)),
    forces_data: z.record(z.any()),
    completed_at: z.string().datetime().optional(),
    session_quality_score: z.number().min(0).max(1).optional()
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: pilarAssessmentSchema,
    meta: responseMetaSchema
  })
};
```

#### Get Assessment
```typescript
const getPilarAssessmentContract: APIContract<{ id: string }, PilarAssessment> = {
  method: 'GET',
  path: '/api/v1/entities/pilar-assessments/:id',
  auth: true,

  requestSchema: z.object({
    id: z.string().uuid()
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: pilarAssessmentSchema,
    meta: responseMetaSchema
  })
};
```

#### Update Assessment
```typescript
const updatePilarAssessmentContract: APIContract<UpdatePilarAssessmentRequest, PilarAssessment> = {
  method: 'PUT',
  path: '/api/v1/entities/pilar-assessments/:id',
  auth: true,

  requestSchema: z.object({
    id: z.string().uuid(),
    scores: z.record(z.number().min(0).max(10)).optional(),
    forces_data: z.record(z.any()).optional(),
    completed_at: z.string().datetime().optional(),
    session_quality_score: z.number().min(0).max(1).optional()
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: pilarAssessmentSchema,
    meta: responseMetaSchema
  })
};
```

#### Delete Assessment
```typescript
const deletePilarAssessmentContract: APIContract<{ id: string }, void> = {
  method: 'DELETE',
  path: '/api/v1/entities/pilar-assessments/:id',
  auth: true,

  requestSchema: z.object({
    id: z.string().uuid()
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: z.null(),
    meta: responseMetaSchema
  })
};
```

### AssessmentSession Contract

**Base Path:** `/api/v1/entities/assessment-sessions`

#### Create Session
```typescript
const createAssessmentSessionContract: APIContract<CreateAssessmentSessionRequest, AssessmentSession> = {
  method: 'POST',
  path: '/api/v1/entities/assessment-sessions',
  auth: true,

  requestSchema: z.object({
    pillar_id: z.string().optional(),
    mode: z.enum(['egalitarian', 'hierarchical']).optional(),
    stage: z.string().default('profile'),
    responses: z.record(z.any()).default({}),
    results: z.record(z.any()).optional()
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: assessmentSessionSchema,
    meta: responseMetaSchema
  })
};
```

#### Update Session Progress
```typescript
const updateAssessmentSessionContract: APIContract<UpdateAssessmentSessionRequest, AssessmentSession> = {
  method: 'PUT',
  path: '/api/v1/entities/assessment-sessions/:id',
  auth: true,

  requestSchema: z.object({
    id: z.string().uuid(),
    stage: z.string().optional(),
    responses: z.record(z.any()).optional(),
    results: z.record(z.any()).optional(),
    completed_at: z.string().datetime().optional()
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: assessmentSessionSchema,
    meta: responseMetaSchema
  })
};
```

### UserProfile Contract

**Base Path:** `/api/v1/entities/user-profiles`

#### Get Current User Profile
```typescript
const getCurrentUserProfileContract: APIContract<void, UserProfile> = {
  method: 'GET',
  path: '/api/v1/entities/user-profiles/me',
  auth: true,

  requestSchema: z.object({}),

  responseSchema: z.object({
    success: z.boolean(),
    data: userProfileSchema,
    meta: responseMetaSchema
  })
};
```

#### Update User Profile
```typescript
const updateUserProfileContract: APIContract<UpdateUserProfileRequest, UserProfile> = {
  method: 'PUT',
  path: '/api/v1/entities/user-profiles/me',
  auth: true,

  requestSchema: z.object({
    full_name: z.string().min(1).max(100).optional(),
    avatar_url: z.string().url().optional(),
    preferences: z.record(z.any()).optional()
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: userProfileSchema,
    meta: responseMetaSchema
  })
};
```

## AI Function Contracts

### AI Coaching Contract

**Endpoint:** `POST /api/v1/ai/coaching`

#### Request Contract
```typescript
const coachingRequestContract: APIContract<CoachingRequest, StreamingResponse> = {
  method: 'POST',
  path: '/api/v1/ai/coaching',
  auth: true,

  rateLimit: { window: 3600000, max: 10 }, // 10 requests per hour
  timeout: 30000, // 30 seconds

  requestSchema: z.object({
    assessmentId: z.string().uuid(),
    pillar: z.string().min(1).max(50),
    mode: z.enum(['egalitarian', 'hierarchical']),
    scores: z.record(z.number().min(0).max(10)).optional(),
    responses: z.record(z.any()).optional(),
    conversationHistory: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(2000),
      timestamp: z.string().datetime()
    })).optional()
  }),

  responseSchema: z.object({
    type: z.enum(['chunk', 'complete', 'error']),
    data: z.string().optional(),
    metadata: z.object({
      totalChunks: z.number().optional(),
      currentChunk: z.number().optional(),
      processingTime: z.number().optional(),
      confidence: z.number().min(0).max(1).optional()
    }).optional(),
    error: errorSchema.optional()
  })
};
```

#### Streaming Response Format
```typescript
// Server-Sent Events format
data: {"type": "chunk", "data": "Based on your assessment results..."}\n\n
data: {"type": "chunk", "data": "I recommend focusing on..."}\n\n
data: {"type": "complete", "metadata": {"processingTime": 2450, "confidence": 0.89}}\n\n
```

### RAG Query Contract

**Endpoint:** `POST /api/v1/ai/rag/query`

#### Request Contract
```typescript
const ragQueryContract: APIContract<RagQueryRequest, RagQueryResponse> = {
  method: 'POST',
  path: '/api/v1/ai/rag/query',
  auth: false, // Optional auth for public queries

  rateLimit: { window: 3600000, max: 100 }, // 100 requests per hour
  timeout: 15000, // 15 seconds
  cache: { ttl: 300 }, // Cache for 5 minutes

  requestSchema: z.object({
    query: z.string().min(3).max(500),
    pillar: z.string().optional(),
    mode: z.enum(['egalitarian', 'hierarchical']).optional(),
    context: z.string().max(1000).optional(),
    maxResults: z.number().min(1).max(20).default(5),
    includeSources: z.boolean().default(true),
    userId: z.string().uuid().optional() // For personalization
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: z.object({
      response: z.string(),
      sources: z.array(z.object({
        title: z.string(),
        content: z.string(),
        relevanceScore: z.number().min(0).max(1),
        pillar: z.string().optional(),
        mode: z.string().optional(),
        url: z.string().url().optional()
      })),
      relatedPillars: z.array(z.string()),
      processingTime: z.number(),
      confidence: z.number().min(0).max(1)
    }),
    meta: responseMetaSchema
  })
};
```

### Content Analysis Contract

**Endpoint:** `POST /api/v1/ai/analyze-content`

#### Request Contract
```typescript
const contentAnalysisContract: APIContract<ContentAnalysisRequest, ContentAnalysisResponse> = {
  method: 'POST',
  path: '/api/v1/ai/analyze-content',
  auth: true,

  rateLimit: { window: 3600000, max: 50 }, // 50 requests per hour
  timeout: 20000, // 20 seconds

  requestSchema: z.object({
    content: z.string().min(10).max(10000),
    pillar: z.string().optional(),
    mode: z.enum(['egalitarian', 'hierarchical']).optional(),
    contentType: z.enum(['blog', 'assessment', 'guide', 'theory']).default('blog'),
    analysisType: z.enum(['alignment', 'quality', 'completeness']).default('alignment')
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: z.object({
      alignment_score: z.number().min(0).max(10),
      pillar_coverage: z.array(z.string()),
      strengths: z.array(z.string()),
      improvements: z.array(z.string()),
      suggestions: z.array(z.string()),
      processingTime: z.number()
    }),
    meta: responseMetaSchema
  })
};
```

## Authentication Contracts

### Login Contract

**Endpoint:** `POST /api/v1/auth/login`

```typescript
const loginContract: APIContract<LoginRequest, LoginResponse> = {
  method: 'POST',
  path: '/api/v1/auth/login',
  auth: false,

  rateLimit: { window: 900000, max: 5 }, // 5 attempts per 15 minutes

  requestSchema: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    rememberMe: z.boolean().default(false)
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: z.object({
      user: userProfileSchema,
      token: z.string(),
      refreshToken: z.string(),
      expiresAt: z.string().datetime(),
      tokenType: z.literal('Bearer')
    }),
    meta: responseMetaSchema
  })
};
```

### Token Refresh Contract

**Endpoint:** `POST /api/v1/auth/refresh`

```typescript
const refreshTokenContract: APIContract<RefreshTokenRequest, RefreshTokenResponse> = {
  method: 'POST',
  path: '/api/v1/auth/refresh',
  auth: false,

  rateLimit: { window: 3600000, max: 10 }, // 10 refreshes per hour

  requestSchema: z.object({
    refreshToken: z.string().min(1)
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: z.object({
      token: z.string(),
      refreshToken: z.string(),
      expiresAt: z.string().datetime(),
      tokenType: z.literal('Bearer')
    }),
    meta: responseMetaSchema
  })
};
```

## Team Collaboration Contracts

### Team Management Contract

**Base Path:** `/api/v1/entities/teams`

#### Create Team
```typescript
const createTeamContract: APIContract<CreateTeamRequest, Team> = {
  method: 'POST',
  path: '/api/v1/entities/teams',
  auth: true,

  requestSchema: z.object({
    teamName: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    settings: z.object({
      isPrivate: z.boolean().default(true),
      allowSelfJoin: z.boolean().default(false),
      requireApproval: z.boolean().default(true),
      maxMembers: z.number().positive().optional()
    }).default({})
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: teamSchema,
    meta: responseMetaSchema
  })
};
```

#### Join Team
```typescript
const joinTeamContract: APIContract<JoinTeamRequest, TeamMember> = {
  method: 'POST',
  path: '/api/v1/entities/teams/:id/join',
  auth: true,

  requestSchema: z.object({
    id: z.string().uuid(),
    message: z.string().max(200).optional() // For approval-required teams
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: teamMemberSchema,
    meta: responseMetaSchema
  })
};
```

## Blog/Content Contracts

### List Blog Posts Contract

**Endpoint:** `GET /api/v1/blog/posts`

```typescript
const listBlogPostsContract: APIContract<BlogListRequest, BlogPostListResponse> = {
  method: 'GET',
  path: '/api/v1/blog/posts',
  auth: false,

  cache: { ttl: 600 }, // Cache for 10 minutes

  requestSchema: z.object({
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0),
    pillar: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().uuid().optional(),
    published: z.boolean().default(true)
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: z.array(blogPostSummarySchema),
    meta: responseMetaSchema.extend({
      pagination: paginationMetaSchema
    })
  })
};
```

### Get Blog Post Contract

**Endpoint:** `GET /api/v1/blog/posts/:slug`

```typescript
const getBlogPostContract: APIContract<{ slug: string }, BlogPostResponse> = {
  method: 'GET',
  path: '/api/v1/blog/posts/:slug',
  auth: false,

  cache: { ttl: 3600 }, // Cache for 1 hour

  requestSchema: z.object({
    slug: z.string().min(1).max(200)
  }),

  responseSchema: z.object({
    success: z.boolean(),
    data: blogPostFullSchema,
    meta: responseMetaSchema
  })
};
```

## Error Contracts

### Standardized Error Schema

```typescript
const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  field: z.string().optional(),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid(),
  stack: z.string().optional()
});
```

### Error Code Reference

```typescript
const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
} as const;
```

### Rate Limit Error Contract

```typescript
const rateLimitErrorContract: APIContract<any, RateLimitError> = {
  responseSchema: z.object({
    success: z.literal(false),
    error: errorSchema.extend({
      code: z.literal('RATE_LIMIT_EXCEEDED'),
      retryAfter: z.number(),
      limit: z.number(),
      window: z.number()
    }),
    meta: responseMetaSchema
  })
};
```

## Schema Definitions

### Core Entity Schemas

```typescript
// PilarAssessment Schema
const pilarAssessmentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  pillar_id: z.string(),
  mode: z.enum(['egalitarian', 'hierarchical']),
  scores: z.record(z.number()),
  forces_data: z.record(z.any()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  session_quality_score: z.number().min(0).max(1).optional()
});

// UserProfile Schema
const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// AssessmentSession Schema
const assessmentSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  pillar_id: z.string().optional(),
  mode: z.enum(['egalitarian', 'hierarchical']).optional(),
  stage: z.string(),
  responses: z.record(z.any()),
  results: z.record(z.any()).optional(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// Team Schema
const teamSchema = z.object({
  id: z.string().uuid(),
  teamName: z.string(),
  description: z.string().optional(),
  ownerId: z.string().uuid(),
  aggregatedScores: z.record(z.any()),
  settings: z.object({
    isPrivate: z.boolean(),
    allowSelfJoin: z.boolean(),
    requireApproval: z.boolean(),
    maxMembers: z.number().optional()
  }),
  memberCount: z.number(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// TeamMember Schema
const teamMemberSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'member']),
  joinedAt: z.string().datetime(),
  permissions: z.object({
    canInvite: z.boolean(),
    canRemove: z.boolean(),
    canManageSettings: z.boolean(),
    canViewAnalytics: z.boolean()
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});
```

### Blog Schemas

```typescript
// Blog Post Summary Schema
const blogPostSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  author_id: z.string().uuid(),
  published_date: z.string().datetime(),
  metadata: z.record(z.any()),
  tags: z.array(z.string()),
  pillar: z.string().optional(),
  force_vector: z.string().optional(),
  social_image_url: z.string().url().optional()
});

// Blog Post Full Schema
const blogPostFullSchema = blogPostSummarySchema.extend({
  content: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});
```

## Implementation Guidelines

### Request Validation Middleware

```typescript
// backend/src/middleware/validation.ts
export const validateContract = (contract: APIContract) => {
  return async (c: Context, next: Next) => {
    try {
      // Validate request body
      if (contract.requestSchema && ['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
        const body = await c.req.json();
        contract.requestSchema.parse(body);
        c.set('validatedBody', body);
      }

      // Validate query parameters
      if (contract.requestSchema && c.req.method === 'GET') {
        const query = c.req.query();
        contract.requestSchema.parse(query);
        c.set('validatedQuery', query);
      }

      await next();

      // Validate response
      if (contract.responseSchema) {
        const response = await c.res.clone().json();
        contract.responseSchema.parse(response);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.errors,
            timestamp: new Date().toISOString(),
            requestId: c.get('requestId')
          }
        }, 400);
      }
      throw error;
    }
  };
};
```

### Rate Limiting Implementation

```typescript
// backend/src/middleware/ratelimit.ts
export const rateLimitContract = (contract: APIContract) => {
  return async (c: Context, next: Next) => {
    if (!contract.rateLimit) {
      await next();
      return;
    }

    const { window, max } = contract.rateLimit;
    const key = `ratelimit:${c.req.method}:${c.req.path}:${c.get('user')?.id || c.req.header('CF-Connecting-IP')}`;

    const current = await redis.get(key);
    if (current && parseInt(current) >= max) {
      return c.json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded',
          retryAfter: window / 1000,
          limit: max,
          window: window,
          timestamp: new Date().toISOString(),
          requestId: c.get('requestId')
        }
      }, 429);
    }

    await redis.multi()
      .incr(key)
      .pexpire(key, window)
      .exec();

    await next();
  };
};
```

### Caching Implementation

```typescript
// backend/src/middleware/cache.ts
export const cacheContract = (contract: APIContract) => {
  return async (c: Context, next: Next) => {
    if (!contract.cache || c.req.method !== 'GET') {
      await next();
      return;
    }

    const cacheKey = `api:${c.req.method}:${c.req.path}:${JSON.stringify(c.req.query())}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const response = JSON.parse(cached);
      return c.json(response);
    }

    await next();

    if (c.res.status < 400) {
      const response = await c.res.clone().json();
      await redis.setex(cacheKey, contract.cache.ttl, JSON.stringify(response));
    }
  };
};
```

## Testing Contracts

### Contract Test Template

```typescript
// tests/contracts/pilar-assessment.contract.test.ts
describe('PilarAssessment Contract', () => {
  describe('Create Assessment', () => {
    test('valid request creates assessment', async () => {
      const request = {
        pillar_id: 'divsexp',
        mode: 'egalitarian',
        scores: { force1: 8.5, force2: 7.2 },
        forces_data: { psychological: {}, social: {} }
      };

      // Validate request schema
      createPilarAssessmentContract.requestSchema.parse(request);

      // Make API call
      const response = await api.post('/api/v1/entities/pilar-assessments', request);

      // Validate response schema
      createPilarAssessmentContract.responseSchema.parse(response.data);

      // Validate business rules
      expect(response.data.data.pillar_id).toBe(request.pillar_id);
      expect(response.data.data.mode).toBe(request.mode);
      expect(response.data.success).toBe(true);
    });

    test('invalid request returns validation error', async () => {
      const invalidRequest = {
        pillar_id: '', // Invalid: empty string
        mode: 'invalid_mode', // Invalid: not in enum
        scores: 'not_an_object' // Invalid: not an object
      };

      const response = await api.post('/api/v1/entities/pilar-assessments', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.data.error.code).toBe('VALIDATION_ERROR');
      expect(response.data.error.details).toBeDefined();
    });
  });
});
```

This contract specification provides the complete technical blueprint for implementing and testing all API endpoints during the Base44-to-REST migration.