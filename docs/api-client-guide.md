# API Client Guide

## Frontend-Backend Integration Patterns

This guide documents the API client patterns for integrating the frontend with the backend during and after the Base44 to REST migration.

## Current State (Migration Period)

During the migration, the frontend should use a hybrid approach that can handle both Base44 and REST API calls based on feature flags.

### Function Call Pattern

For Base44-style function calls, use the compatibility layer:

```javascript
// Function calls during migration
const result = await base44.functions.invoke('generateQuestionsByDifficulty', {
  pillar: 'divsexp',
  mode: 'egalitarian',
  count: 10
});

// The compatibility layer will automatically route to:
// - REST API if feature flag is enabled
// - Base44 fallback if migration not yet complete
```

### Entity Access Pattern

For entity access, use the entities API:

```javascript
// Entity access during migration
const assessments = await base44.entities.PilarAssessment.filter({
  user_id: userId
});

// Routes to: GET /api/v1/entities/pilar-assessments
```

## Post-Migration State (REST Only)

After migration completion, the frontend should use direct REST API calls:

### Authentication

```javascript
// Get auth token
const token = await getAuthToken();

// Include in all requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Assessment Operations

```javascript
// Create assessment
const response = await fetch('/api/v1/assessments', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    pillar_id: 'divsexp',
    mode: 'egalitarian'
  })
});
const { assessment } = await response.json();

// Get assessment
const response = await fetch(`/api/v1/assessments/${assessmentId}`, {
  headers
});
const { assessment } = await response.json();

// Submit answer
await fetch(`/api/v1/assessments/${assessmentId}/answers`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    question_id: 'q1',
    answer: 'option_a'
  })
});

// Complete assessment
const response = await fetch(`/api/v1/assessments/${assessmentId}/complete`, {
  method: 'POST',
  headers
});
const result = await response.json();
```

### AI Features

```javascript
// Generate quiz questions
const response = await fetch('/api/v1/ai/quiz-questions', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    pillar: 'divsexp',
    mode: 'egalitarian',
    count: 10
  })
});
const { questions } = await response.json();

// Streaming coaching feedback
const response = await fetch('/api/v1/ai/coaching', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    assessmentId,
    pillar: 'divsexp',
    mode: 'egalitarian',
    scores: { /* assessment scores */ }
  })
});

// Handle streaming response
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = new TextDecoder().decode(value);
  // Process streaming chunk
}
```

### User Profile Management

```javascript
// Get user profile
const response = await fetch('/api/v1/users/profile', { headers });
const { profile } = await response.json();

// Update profile
await fetch('/api/v1/users/profile', {
  method: 'PUT',
  headers,
  body: JSON.stringify({
    display_name: 'New Name',
    bio: 'Updated bio'
  })
});

// Get user progress
const response = await fetch('/api/v1/users/progress', { headers });
const { progress, stats } = await response.json();
```

### RAG Search

```javascript
// Semantic search
const response = await fetch('/api/v1/rag/query', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    query: 'What is psychological safety?',
    pillar: 'divsexp',
    limit: 5
  })
});
const { results } = await response.json();
```

### Team Collaboration

```javascript
// List user's teams
const response = await fetch('/api/v1/teams', { headers });
const { teams } = await response.json();

// Create team
const response = await fetch('/api/v1/teams', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    name: 'Study Group Alpha',
    description: 'Advanced PILAR studies'
  })
});
const { team } = await response.json();

// Add team member
await fetch(`/api/v1/teams/${teamId}/members`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    user_id: 'user-uuid',
    role: 'member'
  })
});
```

## Error Handling

### Standard Error Response Format

All endpoints return errors in a consistent format:

```javascript
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE", // Optional machine-readable code
  "details": {} // Optional additional error details
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource state conflict)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
- `503` - Service Unavailable (migration pending)

### Error Handling Patterns

```javascript
try {
  const response = await fetch('/api/v1/assessments', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('API call failed:', error);
  // Handle error (show user message, retry, etc.)
}
```

## Rate Limiting

API endpoints have rate limits to prevent abuse:

- **AI endpoints**: 50 requests/hour per user
- **General operations**: 100 requests/hour per user
- **Assessment submissions**: 20 requests/hour per user

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests per hour
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Migration Compatibility

During migration, the backend provides backward compatibility:

### Function Proxy Endpoints

Base44 function calls are proxied through `/api/v1/functions/:functionName`:

```javascript
// This still works during migration
const result = await base44.functions.invoke('generateQuestionsByDifficulty', params);

// Internally routes to: POST /api/v1/functions/generateQuestionsByDifficulty
```

### Feature Flags

The system uses feature flags to control migration rollout:

- Functions not yet migrated return `503 Service Unavailable`
- Entities not yet migrated fall back to Base44
- Migration status can be checked programmatically

### Migration Status Checking

```javascript
// Check if a function is migrated
const response = await fetch('/api/v1/functions/generateQuestionsByDifficulty', {
  method: 'POST',
  headers,
  body: JSON.stringify({ /* test params */ })
});

if (response.status === 503) {
  // Function not yet migrated, use Base44 fallback
  return useBase44Fallback();
}
```

## Testing

### Unit Testing API Calls

```javascript
// Mock API responses for testing
const mockFetch = (url, options) => {
  if (url.includes('/api/v1/assessments')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ assessment: mockAssessment })
    });
  }
  // Handle other endpoints...
};
```

### Integration Testing

```javascript
// Test against real API
describe('Assessment API', () => {
  test('creates assessment successfully', async () => {
    const response = await apiRequest('/api/v1/assessments', {
      method: 'POST',
      body: { pillar_id: 'divsexp', mode: 'egalitarian' }
    });

    expect(response.status).toBe(201);
    expect(response.data.assessment).toBeDefined();
  });
});
```

## Performance Considerations

### Request Batching

For multiple related operations, consider batching:

```javascript
// Instead of multiple requests
const [profile, progress, history] = await Promise.all([
  fetch('/api/v1/users/profile', { headers }),
  fetch('/api/v1/users/progress', { headers }),
  fetch('/api/v1/users/history', { headers })
]);
```

### Caching Strategy

Implement appropriate caching for static data:

```javascript
// Cache user profile for session
let cachedProfile = null;
const getProfile = async () => {
  if (!cachedProfile) {
    const response = await fetch('/api/v1/users/profile', { headers });
    cachedProfile = await response.json();
  }
  return cachedProfile;
};
```

### Streaming Responses

Handle streaming responses appropriately for large data:

```javascript
const response = await fetch('/api/v1/ai/coaching', { /* ... */ });
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  // Process chunk (update UI incrementally)
}
```

This guide provides the foundation for frontend integration with the migrated REST API while maintaining compatibility during the transition period.</content>
</xai:function_call name="todowrite">
<parameter name="todos">[{"content":"Create API client wrapper for frontend compatibility","status":"completed","priority":"high","id":"api_client_wrapper"}]