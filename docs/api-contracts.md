# API Contracts Documentation

## Overview

This document defines the rigorous contracts for all API interactions in the Compilar system. These contracts establish the interface between frontend components and backend services, ensuring consistency, reliability, and maintainability.

## Contract Architecture

### Base Contract Structure

All API contracts follow a consistent structure:

```typescript
interface APIContract {
  // Request/Response types
  Request: Type
  Response: Type
  Error: Type

  // Endpoint definition
  method: HTTPMethod
  path: string
  auth: boolean

  // Validation schemas
  requestSchema: ZodSchema
  responseSchema: ZodSchema
}
```

### Response Format Contract

**Standard Response Structure:**
```typescript
interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: APIError
  meta: ResponseMeta
}

interface ResponseMeta {
  timestamp: string
  requestId: string
  version: string
  executionTime?: number
}

interface APIError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
}
```

**HTTP Status Code Mapping:**
```typescript
const STATUS_CODES = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error'
} as const
```

## Authentication Contracts

### Login Contract

**Endpoint:** `POST /api/v1/auth/login`

**Request Contract:**
```typescript
interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional()
})
```

**Response Contract:**
```typescript
interface LoginResponse {
  user: UserProfile
  token: string
  refreshToken: string
  expiresAt: string
  tokenType: 'Bearer'
}

const loginResponseSchema = z.object({
  user: userProfileSchema,
  token: z.string(),
  refreshToken: z.string(),
  expiresAt: z.string().datetime(),
  tokenType: z.literal('Bearer')
})
```

**Error Cases:**
- `INVALID_CREDENTIALS`: Email/password combination invalid
- `ACCOUNT_DISABLED`: User account is disabled
- `RATE_LIMITED`: Too many login attempts

### Register Contract

**Endpoint:** `POST /api/v1/auth/register`

**Request Contract:**
```typescript
interface RegisterRequest {
  email: string
  password: string
  fullName: string
  acceptTerms: boolean
}

const registerRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  fullName: z.string().min(2).max(100),
  acceptTerms: z.boolean().refine(val => val === true)
})
```

### Token Refresh Contract

**Endpoint:** `POST /api/v1/auth/refresh`

**Request Contract:**
```typescript
interface RefreshTokenRequest {
  refreshToken: string
}

const refreshTokenRequestSchema = z.object({
  refreshToken: z.string()
})
```

## Entity CRUD Contracts

### Generic Entity Contract

**Base Entity Interface:**
```typescript
interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

interface EntityContract<T extends BaseEntity> {
  // List operations
  list(options?: ListOptions): Promise<T[]>
  filter(query: FilterQuery): Promise<T[]>

  // Single entity operations
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  get(id: string): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

interface ListOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

interface FilterQuery {
  [key: string]: any
}
```

### PILAR Assessment Contract

**Entity Interface:**
```typescript
interface PilarAssessment extends BaseEntity {
  userId: string
  pillarId: string
  mode: 'egalitarian' | 'hierarchical'
  scores: Record<string, number>
  forcesData: Record<string, any>
  completedAt?: string
  sessionQualityScore?: number
}

const pilarAssessmentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  pillarId: z.string(),
  mode: z.enum(['egalitarian', 'hierarchical']),
  scores: z.record(z.number()),
  forcesData: z.record(z.any()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  sessionQualityScore: z.number().min(0).max(1).optional()
})
```

**Endpoints:**
- `GET /api/v1/entities/pilar-assessments` - List user's assessments
- `POST /api/v1/entities/pilar-assessments` - Create assessment
- `GET /api/v1/entities/pilar-assessments/:id` - Get specific assessment
- `PUT /api/v1/entities/pilar-assessments/:id` - Update assessment
- `DELETE /api/v1/entities/pilar-assessments/:id` - Delete assessment

### Assessment Session Contract

**Entity Interface:**
```typescript
interface AssessmentSession extends BaseEntity {
  userId: string
  pillarId?: string
  mode?: 'egalitarian' | 'hierarchical'
  stage: string
  responses: Record<string, any>
  results?: Record<string, any>
  startedAt: string
  completedAt?: string
}

const assessmentSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  pillarId: z.string().optional(),
  mode: z.enum(['egalitarian', 'hierarchical']).optional(),
  stage: z.string(),
  responses: z.record(z.any()),
  results: z.record(z.any()).optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})
```

**Special Endpoints:**
- `POST /api/v1/assessments/:id/answers` - Submit answer
- `POST /api/v1/assessments/:id/complete` - Complete assessment

## AI Function Contracts

### AI Coaching Contract

**Endpoint:** `POST /api/v1/ai/coaching`

**Request Contract:**
```typescript
interface CoachingRequest {
  assessmentId: string
  pillar: string
  mode: 'egalitarian' | 'hierarchical'
  scores?: Record<string, number>
  responses?: Record<string, any>
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
}

const coachingRequestSchema = z.object({
  assessmentId: z.string().uuid(),
  pillar: z.string(),
  mode: z.enum(['egalitarian', 'hierarchical']),
  scores: z.record(z.number()).optional(),
  responses: z.record(z.any()).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string().datetime()
  })).optional()
})
```

**Response Contract:**
```typescript
interface CoachingResponse {
  coaching: string
  suggestions: string[]
  followUpQuestions: string[]
  confidence: number
  processingTime: number
}

const coachingResponseSchema = z.object({
  coaching: z.string(),
  suggestions: z.array(z.string()),
  followUpQuestions: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  processingTime: z.number()
})
```

### RAG Query Contract

**Endpoint:** `POST /api/v1/ai/rag/query`

**Request Contract:**
```typescript
interface RagQueryRequest {
  query: string
  pillar?: string
  mode?: 'egalitarian' | 'hierarchical'
  context?: string
  maxResults?: number
  includeSources?: boolean
}

const ragQueryRequestSchema = z.object({
  query: z.string().min(1).max(1000),
  pillar: z.string().optional(),
  mode: z.enum(['egalitarian', 'hierarchical']).optional(),
  context: z.string().optional(),
  maxResults: z.number().min(1).max(20).default(5),
  includeSources: z.boolean().default(true)
})
```

**Response Contract:**
```typescript
interface RagQueryResponse {
  response: string
  sources: Array<{
    title: string
    content: string
    relevanceScore: number
    pillar?: string
    mode?: string
  }>
  relatedPillars: string[]
  processingTime: number
}

const ragQueryResponseSchema = z.object({
  response: z.string(),
  sources: z.array(z.object({
    title: z.string(),
    content: z.string(),
    relevanceScore: z.number().min(0).max(1),
    pillar: z.string().optional(),
    mode: z.string().optional()
  })),
  relatedPillars: z.array(z.string()),
  processingTime: z.number()
})
```

### Streaming Response Contract

**Endpoint:** `POST /api/v1/ai/stream/insights`

**Streaming Response Format:**
```typescript
interface StreamingChunk {
  type: 'chunk' | 'complete' | 'error'
  data?: string
  metadata?: {
    totalChunks?: number
    currentChunk?: number
    processingTime?: number
  }
  error?: APIError
}

// Server-Sent Events format
data: {"type": "chunk", "data": "Generated insight text..."}\n\n
data: {"type": "complete", "metadata": {"processingTime": 1250}}\n\n
```

## Team Collaboration Contracts

### Team Management Contract

**Entity Interface:**
```typescript
interface Team extends BaseEntity {
  teamName: string
  description?: string
  ownerId: string
  aggregatedScores: Record<string, any>
  settings: TeamSettings
  memberCount: number
}

interface TeamSettings {
  isPrivate: boolean
  allowSelfJoin: boolean
  requireApproval: boolean
  maxMembers?: number
}

const teamSchema = z.object({
  id: z.string().uuid(),
  teamName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  ownerId: z.string().uuid(),
  aggregatedScores: z.record(z.any()),
  settings: z.object({
    isPrivate: z.boolean(),
    allowSelfJoin: z.boolean(),
    requireApproval: z.boolean(),
    maxMembers: z.number().positive().optional()
  }),
  memberCount: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})
```

**Team Member Contract:**
```typescript
interface TeamMember extends BaseEntity {
  teamId: string
  userId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  permissions: TeamPermissions
}

interface TeamPermissions {
  canInvite: boolean
  canRemove: boolean
  canManageSettings: boolean
  canViewAnalytics: boolean
}

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
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})
```

## Analytics Contracts

### User Analytics Contract

**Entity Interface:**
```typescript
interface UserAnalytics extends BaseEntity {
  userId: string
  eventType: string
  eventData: Record<string, any>
  sessionId?: string
  pageUrl?: string
  userAgent?: string
  ipAddress?: string
  deviceInfo?: DeviceInfo
}

interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet'
  os: string
  browser: string
  screenResolution?: string
}

const userAnalyticsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  eventType: z.string(),
  eventData: z.record(z.any()),
  sessionId: z.string().optional(),
  pageUrl: z.string().url().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  deviceInfo: z.object({
    type: z.enum(['desktop', 'mobile', 'tablet']),
    os: z.string(),
    browser: z.string(),
    screenResolution: z.string().optional()
  }).optional(),
  createdAt: z.string().datetime()
})
```

**Analytics Events:**
```typescript
const ANALYTICS_EVENTS = {
  ASSESSMENT_STARTED: 'assessment_started',
  ASSESSMENT_COMPLETED: 'assessment_completed',
  COACHING_REQUESTED: 'coaching_requested',
  TEAM_JOINED: 'team_joined',
  CONTENT_VIEWED: 'content_viewed',
  SEARCH_PERFORMED: 'search_performed',
  ERROR_OCCURRED: 'error_occurred'
} as const
```

## File Upload Contracts

### File Upload Contract

**Endpoint:** `POST /api/v1/files/upload`

**Request:** `multipart/form-data`

**Form Data Contract:**
```typescript
interface FileUploadRequest {
  file: File
  category: 'avatar' | 'content' | 'assessment' | 'team'
  metadata?: Record<string, any>
}

const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(file => file.size <= 10 * 1024 * 1024, 'File too large'),
  category: z.enum(['avatar', 'content', 'assessment', 'team']),
  metadata: z.record(z.any()).optional()
})
```

**Response Contract:**
```typescript
interface FileUploadResponse {
  fileId: string
  url: string
  thumbnailUrl?: string
  metadata: FileMetadata
}

interface FileMetadata {
  size: number
  mimeType: string
  width?: number
  height?: number
  duration?: number // for videos
  checksum: string
}

const fileUploadResponseSchema = z.object({
  fileId: z.string().uuid(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  metadata: z.object({
    size: z.number(),
    mimeType: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    duration: z.number().optional(),
    checksum: z.string()
  })
})
```

## Error Contracts

### Standardized Error Codes

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

  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const
```

### Error Response Contract

```typescript
interface APIError {
  code: keyof typeof ERROR_CODES
  message: string
  details?: Record<string, any>
  field?: string
  timestamp: string
  requestId: string
  stack?: string // Only in development
}

const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  field: z.string().optional(),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid(),
  stack: z.string().optional()
})
```

## Rate Limiting Contracts

### Rate Limit Headers

**Response Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 3600
```

### Rate Limit Response

```typescript
interface RateLimitError extends APIError {
  code: 'RATE_LIMIT_EXCEEDED'
  retryAfter: number
  limit: number
  window: number
}

const rateLimitErrorSchema = apiErrorSchema.extend({
  code: z.literal('RATE_LIMIT_EXCEEDED'),
  retryAfter: z.number(),
  limit: z.number(),
  window: z.number()
})
```

## Pagination Contracts

### Paginated Response Contract

```typescript
interface PaginatedResponse<T> extends APIResponse<T[]> {
  meta: ResponseMeta & PaginationMeta
}

interface PaginationMeta {
  total: number
  limit: number
  offset: number
  hasMore: boolean
  nextOffset?: number
  prevOffset?: number
}

const paginationMetaSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
  nextOffset: z.number().optional(),
  prevOffset: z.number().optional()
})
```

### Pagination Parameters

```typescript
interface PaginationParams {
  limit?: number // default: 50, max: 100
  offset?: number // default: 0
  cursor?: string // for cursor-based pagination
}

const paginationParamsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  cursor: z.string().optional()
})
```

## WebSocket Contracts

### Real-time Event Contract

**Connection:** `ws://api.example.com/realtime`

**Authentication:**
```typescript
// Initial message after connection
{
  "type": "auth",
  "token": "jwt_token_here"
}
```

**Event Format:**
```typescript
interface WebSocketEvent {
  type: string
  data: any
  timestamp: string
  userId?: string
  sessionId?: string
}

const webSocketEventSchema = z.object({
  type: z.string(),
  data: z.any(),
  timestamp: z.string().datetime(),
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional()
})
```

**Supported Events:**
```typescript
const WS_EVENTS = {
  ASSESSMENT_PROGRESS: 'assessment_progress',
  TEAM_UPDATE: 'team_update',
  COACHING_MESSAGE: 'coaching_message',
  NOTIFICATION: 'notification',
  SYSTEM_STATUS: 'system_status'
} as const
```

## Validation & Testing

### Contract Testing Framework

```typescript
// contracts/contract-tests.ts
describe('API Contracts', () => {
  describe('Authentication', () => {
    test('login contract', async () => {
      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Validate request
      loginRequestSchema.parse(request);

      // Mock API call
      const response = await api.login(request);

      // Validate response
      loginResponseSchema.parse(response);
    });
  });

  describe('Entity CRUD', () => {
    test('assessment CRUD contract', async () => {
      const assessment: PilarAssessment = {
        userId: 'user-123',
        pillarId: 'divsexp',
        mode: 'egalitarian',
        scores: { force1: 8.5 },
        forcesData: {}
      };

      // Test create
      const created = await api.createAssessment(assessment);
      pilarAssessmentSchema.parse(created);

      // Test get
      const retrieved = await api.getAssessment(created.id);
      pilarAssessmentSchema.parse(retrieved);

      // Test update
      const updated = await api.updateAssessment(created.id, { completedAt: new Date().toISOString() });
      pilarAssessmentSchema.parse(updated);

      // Test delete
      await api.deleteAssessment(created.id);
      await expect(api.getAssessment(created.id)).rejects.toThrow();
    });
  });
});
```

### Schema Validation Middleware

```typescript
// middleware/validation.ts
export const validateRequest = (schema: ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      schema.parse(body);
      c.set('validatedBody', body);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.errors
          }
        }, 400);
      }
      throw error;
    }
  };
};

export const validateResponse = (schema: ZodSchema) => {
  return async (c: Context, next: Next) => {
    await next();

    if (c.res.status >= 200 && c.res.status < 300) {
      try {
        const response = await c.res.json();
        schema.parse(response);
      } catch (error) {
        // Log validation error but don't fail the request
        console.error('Response validation failed:', error);
      }
    }
  };
};
```

## Versioning & Evolution

### API Versioning Strategy

**URL Path Versioning:**
```
/api/v1/entities/assessments
/api/v2/entities/assessments
```

**Header Versioning:**
```
X-API-Version: 2024-01-01
```

### Contract Evolution Rules

1. **Additive Changes**: New optional fields are backward compatible
2. **Breaking Changes**: Require new version
3. **Deprecation**: Mark old contracts as deprecated with warnings
4. **Migration**: Provide migration guides for breaking changes

### Deprecation Headers

```typescript
// Response headers for deprecated endpoints
X-API-Deprecated: true
X-API-Sunset: 2024-06-01
X-API-Replacement: /api/v2/assessments
```

## Monitoring & Compliance

### Contract Compliance Monitoring

```typescript
// middleware/contract-monitoring.ts
export const monitorContractCompliance = () => {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();

    // Capture request
    const requestData = {
      method: c.req.method,
      path: c.req.path,
      headers: Object.fromEntries(c.req.raw.headers.entries()),
      body: c.req.method !== 'GET' ? await c.req.text() : undefined
    };

    await next();

    const responseTime = Date.now() - startTime;

    // Capture response
    const responseData = {
      status: c.res.status,
      headers: Object.fromEntries(c.res.headers.entries()),
      body: await c.res.clone().text()
    };

    // Validate against contracts
    const contract = getContractForEndpoint(c.req.path, c.req.method);
    if (contract) {
      const compliance = validateContractCompliance(
        requestData,
        responseData,
        contract
      );

      // Log compliance issues
      if (!compliance.valid) {
        console.error('Contract violation:', compliance.errors);
      }

      // Store metrics
      metrics.recordContractCompliance(
        c.req.path,
        compliance.valid,
        responseTime
      );
    }
  };
};
```

## Tracing and Monitoring Contracts

### Langsmith Tracing Integration

All AI endpoints include comprehensive Langsmith tracing for observability and performance monitoring.

#### Trace Metadata Contract

**Standard Trace Metadata:**
```typescript
interface TraceMetadata {
  userId?: string;              // User identifier
  sessionId?: string;           // Session tracking
  feature: string;              // Feature type (assessment_coaching, chatbot, etc.)
  pillar?: string;              // Assessment pillar (if applicable)
  mode?: 'egalitarian' | 'hierarchical';  // Assessment mode
  conversationId?: string;      // Chat conversation tracking
  assessmentId?: string;        // Assessment identifier
  [key: string]: any;           // Additional context
}

const traceMetadataSchema = z.object({
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  feature: z.string(),
  pillar: z.string().optional(),
  mode: z.enum(['egalitarian', 'hierarchical']).optional(),
  conversationId: z.string().optional(),
  assessmentId: z.string().uuid().optional()
}).catchall(z.any());
```

#### Trace Types

**Chain Traces** (Service-level operations):
- `llm_chat`: Standard chat completion
- `llm_stream`: Streaming chat completion
- `llm_embed_batch`: Batch embedding operations

**LLM Traces** (Provider API calls):
- `openai_chat`: OpenAI chat completion
- `openai_embed`: OpenAI embedding
- `anthropic_chat`: Anthropic chat completion

#### Feature-Specific Metadata

**Assessment Coaching:**
```typescript
{
  feature: 'assessment_coaching',
  pillar: 'leadership' | 'communication' | etc.,
  mode: 'egalitarian' | 'hierarchical',
  assessmentId: string
}
```

**Chatbot Conversations:**
```typescript
{
  feature: 'chatbot',
  conversationId: string,
  messageCount: number
}
```

**RAG Queries:**
```typescript
{
  feature: 'rag_query',
  queryLength: number,
  resultsCount: number
}
```

### Tracing Headers

**Request Headers:**
```
X-Trace-Id: uuid-v4-trace-identifier
X-Parent-Trace-Id: parent-trace-reference
```

**Response Headers:**
```
X-Trace-Id: uuid-v4-trace-identifier
X-Langsmith-URL: https://smith.langchain.com/.../trace-id
```

### Monitoring Integration

**Performance Metrics Tracked:**
- Response time per operation
- Token usage (prompt + completion)
- Error rates by provider/feature
- User engagement patterns

**Business Metrics:**
- Feature usage distribution
- Conversation length analytics
- Assessment completion rates
- Error impact on user experience

This comprehensive contract documentation ensures that all API interactions are well-defined, validated, and maintainable throughout the migration from Base44 to REST endpoints.