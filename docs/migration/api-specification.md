# API Specification: Standalone Hono Server

This document specifies the REST API for the standalone Hono server, replacing Supabase client calls with direct HTTP endpoints.

## API Architecture

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "uuid"
  }
}
```

### Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  },
  "data": null
}
```

## Authentication Endpoints

### POST /auth/login
User login with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe"
    },
    "token": "jwt_token_here",
    "expires_at": "2024-01-02T00:00:00Z"
  }
}
```

### POST /auth/register
User registration.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/refresh
Refresh JWT token.

**Request:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response:**
```json
{
  "data": {
    "token": "new_jwt_token",
    "expires_at": "2024-01-02T00:00:00Z"
  }
}
```

### GET /auth/me
Get current user profile.

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

## Entity CRUD Endpoints

### PILAR Assessments

#### GET /entities/pilar-assessments
List user's PILAR assessments.

**Query Parameters:**
- `pillar_id` - Filter by pillar
- `mode` - Filter by mode ('egalitarian' | 'hierarchical')
- `limit` - Max results (default: 50)
- `offset` - Pagination offset

**Response:**
```json
{
  "data": {
    "pilar_assessments": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "pillar_id": "divsexp",
        "mode": "egalitarian",
        "scores": { "force1": 8.5, "force2": 7.2 },
        "forces_data": { ... },
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "meta": {
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

#### POST /entities/pilar-assessments
Create new assessment.

**Request:**
```json
{
  "pillar_id": "divsexp",
  "mode": "egalitarian",
  "scores": { "force1": 8.5, "force2": 7.2 },
  "forces_data": { ... }
}
```

#### GET /entities/pilar-assessments/:id
Get specific assessment.

#### PUT /entities/pilar-assessments/:id
Update assessment.

#### DELETE /entities/pilar-assessments/:id
Delete assessment.

### Assessment Sessions

#### GET /entities/assessment-sessions
List user's assessment sessions.

**Query Parameters:**
- `stage` - Filter by stage
- `pillar_id` - Filter by pillar
- `mode` - Filter by mode
- `completed` - Filter by completion status

#### POST /entities/assessment-sessions
Create new session.

**Request:**
```json
{
  "pillar_id": "divsexp",
  "mode": "egalitarian",
  "stage": "profile",
  "responses": {}
}
```

#### PUT /entities/assessment-sessions/:id
Update session (e.g., save progress).

**Request:**
```json
{
  "responses": { "question1": "answer1" },
  "stage": "quiz_active"
}
```

### User Progress

#### GET /entities/user-progress
Get user's progress across all pillars/modes.

#### PUT /entities/user-progress/:id
Update progress (experience points, level, etc.).

### Teams

#### GET /entities/teams
List teams user is member of.

#### POST /entities/teams
Create new team.

**Request:**
```json
{
  "team_name": "Innovation Squad",
  "description": "Cross-functional innovation team",
  "settings": { "is_private": false }
}
```

#### GET /entities/teams/:id/members
Get team members.

#### POST /entities/teams/:id/members
Add team member (team owners only).

**Request:**
```json
{
  "user_email": "member@example.com",
  "role": "member"
}
```

#### DELETE /entities/teams/:id/members/:memberId
Remove team member (team owners only).

### Study Groups

#### GET /entities/study-groups
List study groups user can access.

#### POST /entities/study-groups
Create new study group.

#### GET /entities/study-groups/:id/members
Get group members.

#### POST /entities/study-groups/:id/members
Join study group.

### Gamification

#### GET /entities/user-gamification
Get user's gamification stats.

#### GET /entities/badges
List available badges.

#### GET /entities/user-badges
List user's earned badges.

#### POST /entities/user-badges
Award badge to user (admin/system only).

### Analytics

#### GET /entities/user-analytics
Get user's analytics events.

**Query Parameters:**
- `event_type` - Filter by event type
- `start_date` - Start date filter
- `end_date` - End date filter
- `limit` - Max results

#### POST /entities/user-analytics
Record analytics event.

**Request:**
```json
{
  "event_type": "assessment_completed",
  "event_data": {
    "pillar_id": "divsexp",
    "mode": "egalitarian",
    "duration_seconds": 450
  },
  "page_url": "/assess/divsexp"
}
```

### CMS Content

#### GET /entities/cms-content
List published content (public access).

**Query Parameters:**
- `content_type` - Filter by type ('blog' | 'page' | 'resource')
- `status` - Filter by status ('published' | 'draft' | 'archived')
- `pillar` - Filter by pillar
- `tags` - Filter by tags (array)

#### POST /entities/cms-content
Create new content (authenticated users).

#### PUT /entities/cms-content/:id
Update content (authors only).

### AI Endpoints

#### POST /ai/coach/conversation
Start or continue AI coaching conversation.

**Request:**
```json
{
  "message": "I need help understanding my diversity expression results",
  "context": {
    "pillar_id": "divsexp",
    "mode": "egalitarian",
    "assessment_id": "uuid"
  },
  "conversation_id": "uuid" // optional, for continuing conversation
}
```

**Response:**
```json
{
  "data": {
    "conversation_id": "uuid",
    "response": "Based on your assessment results...",
    "suggestions": ["action1", "action2"],
    "follow_up_questions": ["question1", "question2"]
  }
}
```

#### POST /ai/rag/query
Query PILAR knowledge base.

**Request:**
```json
{
  "query": "What is psychological safety in teams?",
  "pillar_id": "divsexp",
  "mode": "egalitarian",
  "context": "assessment_guidance"
}
```

**Response:**
```json
{
  "data": {
    "response": "Psychological safety refers to...",
    "sources": [
      {
        "title": "Diverse Expression in Teams",
        "relevance_score": 0.95,
        "excerpt": "..."
      }
    ],
    "related_pillars": ["indrecip", "popularity"]
  }
}
```

#### POST /ai/assessment/guidance
Generate assessment guidance.

**Request:**
```json
{
  "assessment_id": "uuid",
  "user_profile": { ... },
  "conversation_history": [ ... ]
}
```

#### POST /ai/content/analyze
Analyze content for PILAR alignment.

**Request:**
```json
{
  "content": "Article or text content here...",
  "content_type": "blog_post"
}
```

**Response:**
```json
{
  "data": {
    "pilar_alignment": {
      "divsexp": { "score": 0.85, "confidence": 0.92 },
      "indrecip": { "score": 0.72, "confidence": 0.88 }
    },
    "key_themes": ["psychological_safety", "open_communication"],
    "recommendations": ["suggestion1", "suggestion2"]
  }
}
```

### File Upload Endpoints

#### POST /files/upload
Upload file (images, documents).

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` - File to upload
- `category` - 'avatar' | 'content' | 'assessment'

**Response:**
```json
{
  "data": {
    "file_id": "uuid",
    "url": "https://cdn.example.com/files/uuid/filename.jpg",
    "thumbnail_url": "https://cdn.example.com/files/uuid/thumb_filename.jpg",
    "metadata": {
      "size": 12345,
      "mime_type": "image/jpeg",
      "width": 800,
      "height": 600
    }
  }
}
```

#### DELETE /files/:fileId
Delete uploaded file.

### Admin Endpoints

#### GET /admin/analytics/overview
Get system-wide analytics (admin only).

**Response:**
```json
{
  "data": {
    "total_users": 1250,
    "active_users_30d": 450,
    "total_assessments": 8750,
    "avg_session_duration": 420,
    "popular_pillars": [
      { "pillar": "divsexp", "count": 1200 },
      { "pillar": "indrecip", "count": 980 }
    ]
  }
}
```

#### POST /admin/users/:userId/badge
Award badge to user (admin only).

#### GET /admin/content/pending
List content pending review (admin only).

## Rate Limiting

### Global Limits
- **Authenticated requests:** 1000/hour per user
- **AI endpoints:** 50/hour per user
- **File uploads:** 10/hour per user
- **Admin endpoints:** 100/hour per admin

### Burst Limits
- **Authenticated requests:** 50/minute per user
- **AI endpoints:** 10/minute per user

## Caching Strategy

### Response Caching
- **PILAR knowledge:** 24 hours
- **Public CMS content:** 1 hour
- **User profiles:** 5 minutes
- **Analytics data:** No cache

### Cache Headers
```http
Cache-Control: public, max-age=3600
ETag: "etag_value"
Last-Modified: Wed, 01 Jan 2024 00:00:00 GMT
```

## WebSocket Endpoints

### Real-time Features (Future)

#### WS /realtime/assessments
Real-time assessment updates.

**Messages:**
```json
{
  "type": "assessment_progress",
  "data": {
    "session_id": "uuid",
    "progress": 75,
    "current_question": 15
  }
}
```

#### WS /realtime/teams/:teamId
Real-time team collaboration.

#### WS /realtime/coach/:conversationId
Real-time AI coaching.

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `AUTHENTICATION_ERROR` | 401 | Invalid or missing token |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Pagination

All list endpoints support pagination:

**Request:**
```
GET /entities/pilar-assessments?limit=20&offset=40
```

**Response:**
```json
{
  "data": { ... },
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "has_more": true
  }
}
```

## Filtering & Sorting

### Filter Syntax
```
GET /entities/assessment-sessions?stage=completed&pillar_id=divsexp
```

### Sort Syntax
```
GET /entities/pilar-assessments?sort=created_at:desc
GET /entities/user-analytics?sort=event_type:asc,created_at:desc
```

## API Versioning

### Version Strategy
- **URL Path Versioning:** `/api/v1/...`
- **Breaking Changes:** New major version
- **Additions:** Backward compatible within version
- **Deprecations:** Marked in response headers

### Version Headers
```http
X-API-Version: v1.0.0
X-API-Deprecated: This endpoint will be removed in v2.0.0
```

## Monitoring & Observability

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "ai_services": "healthy"
  }
}
```

### Metrics Endpoint
```
GET /metrics
```

Returns Prometheus-compatible metrics for monitoring.

## SDK Generation

### OpenAPI Specification
The API is fully documented with OpenAPI 3.0 specification available at:
```
GET /api/v1/docs/openapi.json
```

### Client SDKs
Auto-generated SDKs available for:
- JavaScript/TypeScript
- Python
- Go
- Java

Download from: `/api/v1/docs/sdks/`

## Migration Compatibility

### Legacy Endpoint Mapping
For backward compatibility during migration:

| Legacy Call | New Endpoint |
|-------------|--------------|
| `base44.entities.PilarAssessment.list()` | `GET /api/v1/entities/pilar-assessments` |
| `base44.entities.AssessmentSession.create(data)` | `POST /api/v1/entities/assessment-sessions` |
| `base44.functions.generateAICoaching(...)` | `POST /api/v1/ai/coach/guidance` |

### Compatibility Headers
```http
X-Migration-Mode: compatibility
X-Legacy-Client: base44-sdk
```

This ensures smooth transition while maintaining existing frontend functionality.