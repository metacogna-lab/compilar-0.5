# Backend API Inventory

## Overview

This document provides a comprehensive inventory of all REST API endpoints in the Compilar backend, organized by functional area. All endpoints are prefixed with `/api/v1`.

## Authentication

All endpoints except health checks and public content require authentication via Bearer token in the Authorization header.

### Auth Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/me` | Get current user profile | Yes |

## Assessments API

Core PILAR assessment functionality including creation, management, and completion.

### Assessment CRUD

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| GET | `/assessments` | List user's assessments | Yes | No |
| POST | `/assessments` | Create new assessment | Yes | Yes |
| GET | `/assessments/:id` | Get specific assessment | Yes | No |
| DELETE | `/assessments/:id` | Delete assessment | Yes | No |

### Assessment Interactions

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| POST | `/assessments/:id/answers` | Submit answer to question | Yes | Yes |
| POST | `/assessments/:id/complete` | Complete assessment and generate results | Yes | Yes |

## AI API

AI-powered features including coaching, chat, guidance, and content analysis.

### AI Features

| Method | Endpoint | Description | Auth Required | Rate Limited | Streaming |
|--------|----------|-------------|---------------|--------------|-----------|
| POST | `/ai/coaching` | Generate personalized coaching feedback | Yes | Yes | Yes |
| POST | `/ai/chat` | Chatbot conversation | Yes | Yes | Yes |
| POST | `/ai/guidance` | Get contextual guidance | Yes | Yes | No |
| POST | `/ai/quiz-questions` | Generate quiz questions | Yes | Yes | No |
| POST | `/ai/analyze-content` | Content alignment analysis | Yes | Yes | No |

## RAG (Retrieval-Augmented Generation) API

Semantic search and knowledge retrieval over PILAR knowledge base.

### RAG Operations

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| POST | `/rag/query` | Semantic search over knowledge base | Optional | Yes |
| GET | `/rag/forces/:pillar` | Get psychological forces for pillar | Optional | No |
| GET | `/rag/connections` | Get force connections for mode | Optional | No |
| POST | `/rag/ingest` | Ingest new knowledge (admin only) | Yes | Yes |

## Users API

User profile management and progress tracking.

### User Profile

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| GET | `/users/profile` | Get current user profile | Yes | No |
| PUT | `/users/profile` | Update user profile | Yes | Yes |

### User History & Progress

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| GET | `/users/history` | Get assessment history with pagination | Yes | No |
| GET | `/users/progress` | Get progress and gamification data | Yes | No |

## Teams API

Team collaboration and management features.

### Team Management

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| GET | `/teams` | List user's teams | Yes | No |
| POST | `/teams` | Create new team | Yes | Yes |
| GET | `/teams/:id` | Get team details and members | Yes | No |
| PUT | `/teams/:id` | Update team details (admin only) | Yes | Yes |
| DELETE | `/teams/:id` | Delete team (admin only) | Yes | Yes |

### Team Membership

| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| POST | `/teams/:id/members` | Add member to team (admin only) | Yes | Yes |
| DELETE | `/teams/:id/members/:userId` | Remove member from team | Yes | No |

## Analytics API

User, assessment, and team analytics (admin access required for platform-wide data).

### User Analytics

| Method | Endpoint | Description | Auth Required | Admin Required |
|--------|----------|-------------|---------------|----------------|
| GET | `/analytics/user/:id` | Get analytics for specific user | Yes | Self or Admin |

### Platform Analytics

| Method | Endpoint | Description | Auth Required | Admin Required |
|--------|----------|-------------|---------------|----------------|
| GET | `/analytics/assessments` | Platform-wide assessment analytics | Yes | Yes |
| GET | `/analytics/teams` | Platform-wide team analytics | Yes | Yes |

## Content Management API

CMS content management for blog posts, pages, and resources.

### Content CRUD

| Method | Endpoint | Description | Auth Required | Admin Required | Rate Limited |
|--------|----------|-------------|---------------|----------------|--------------|
| GET | `/content` | List CMS content with filters | Optional | No | No |
| POST | `/content` | Create new content | Yes | Yes | Yes |
| GET | `/content/:id` | Get specific content | Optional | No | No |
| PUT | `/content/:id` | Update content | Yes | Yes | Yes |
| DELETE | `/content/:id` | Delete content | Yes | Yes | No |

## Blog API

Public blog functionality (subset of content management).

### Blog Content

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/blog/posts` | List published blog posts | No |
| GET | `/blog/posts/:slug` | Get specific blog post | No |
| GET | `/blog/pillars` | Get unique pillars for filtering | No |
| GET | `/blog/tags` | Get unique tags for filtering | No |

## Entities API

Generic CRUD operations for database entities (63+ entity types).

### Generic Entity Operations

All entity endpoints follow the pattern `/entities/{entity-name}` where entity-name corresponds to database table names.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/entities/{entity}` | List entities | Yes |
| POST | `/entities/{entity}` | Create entity | Yes |
| GET | `/entities/{entity}/{id}` | Get specific entity | Yes |
| PUT | `/entities/{entity}/{id}` | Update entity | Yes |
| DELETE | `/entities/{entity}/{id}` | Delete entity | Yes |

### Available Entities (63+ types)

**Core Entities:**
- `pilar-assessments`, `user-profiles`, `assessment-sessions`, `user-progress`
- `user-actions`, `development-plans`, `user-gamification`, `user-analytics`

**Social & Collaboration:**
- `teams`, `team-members`, `team-analytics`, `team-invitations`
- `study-groups`, `peer-feedback`, `coach-conversations`

**Content & Knowledge:**
- `cms-content`, `pilar-knowledge`, `pilar-knowledge-vectors`
- `ai-insight-questions`, `assessment-guidance`, `force-prompt-cards`

**Analytics & Tracking:**
- `session-analytics`, `group-analytics`, `user-profile-insights`
- `learning-pathways`, `time-series-data`, `pilar-snapshots`

**Gamification:**
- `challenges`, `trophies`, `badges`, `mastery-levels`, `goal-mappings`

**Advanced Features:**
- `battalions`, `cooperative-operations`, `data-enrichment-recommendations`
- `goal-mappings`, `chat-messages`, `group-rounds`

## Health & System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | System health check | No |

## Request/Response Schemas

All API endpoints use Zod schemas for validation. Key schemas include:

### Assessment Schemas
- `CreateAssessmentRequest`: `{ pillar_id: string, mode: enum, scores?: object }`
- `AssessmentResponse`: `{ assessment: PilarAssessment }`

### AI Schemas
- `GenerateCoachingRequest`: Complex coaching request with user/assessment context
- `RagQueryRequest`: `{ query: string, pillar?: string, mode?: enum }`

### Content Schemas
- `CreateContentRequest`: Full content creation with metadata
- `ListContentResponse`: Paginated content with total count

### Error Handling
All endpoints return standardized error responses:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Rate Limiting

Rate limits apply to AI operations and content creation:
- AI endpoints: Configurable limits (default: 50/hour per user)
- General operations: Configurable limits (default: 100/hour per user)

## Authentication & Authorization

- **Bearer Token**: Required for authenticated endpoints
- **User Scoping**: Automatic user_id filtering on user-specific data
- **Admin Access**: Required for analytics and content management
- **Optional Auth**: Some endpoints work with or without authentication

## Data Validation

- **Zod Schemas**: All request/response data validated
- **Type Safety**: Full TypeScript type inference from schemas
- **Input Sanitization**: Automatic validation and error responses

## Implementation Status

- ✅ **Implemented**: All core endpoints documented above
- ⚠️ **Stub Implementation**: AI and RAG endpoints return 503 when LLM not configured
- 🔄 **Migration Needed**: Frontend still uses Base44 client calls

## Next Steps

1. **Configure LLM Services**: Set up OpenAI/Anthropic API keys
2. **Fix Authentication**: Standardize auth middleware usage
3. **Create Compatibility Layer**: Bridge Base44 calls to REST endpoints
4. **Add Testing Infrastructure**: Implement comprehensive API testing
5. **Documentation**: Complete API contract specifications</content>
</xai:function_call name="todowrite">
<parameter name="todos">[{"content":"Document all 30+ REST endpoints with request/response schemas","status":"completed","priority":"high","id":"api_inventory"}]