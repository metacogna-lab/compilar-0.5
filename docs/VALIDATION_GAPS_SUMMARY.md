# API Validation Gaps - Quick Reference

**Assessment Date:** 2026-01-02
**Status:** ⚠️ CRITICAL - 90% of routes unvalidated

---

## Critical Statistics

- **Total Endpoints:** 43
- **Validated with Zod:** 5 (11.6%)
- **Missing Validation:** 38 (88.4%)
- **Production Ready:** NO

---

## Validation Coverage by Route

| Route Group | Total | Validated | Missing | Status |
|-------------|-------|-----------|---------|--------|
| AI | 5 | 5 ✅ | 0 | GOOD |
| Assessments | 7 | 0 | 7 ❌ | CRITICAL |
| RAG | 4 | 0 | 4 ❌ | CRITICAL |
| Users | 3 | 0 | 3 ❌ | CRITICAL |
| Teams | 7 | 0 | 7 ❌ | CRITICAL |
| Analytics | 3 | 0 | 3 ❌ | HIGH |
| Blog | 4 | 0 | 4 ❌ | MEDIUM |
| Content | 5 | 0 | 5 ❌ | HIGH |
| Entities | 5 | 0 | 5 ❌ | CRITICAL |
| **TOTAL** | **43** | **5** | **38** | - |

---

## Missing Zod Schemas (Priority Order)

### 1. Assessments (CRITICAL)
```typescript
// Need to create in backend/src/schemas/api.ts

export const submitAnswerRequestSchema = z.object({
  question_id: z.string().uuid(),
  answer: z.union([z.number(), z.string(), z.boolean()])
});

export const completeAssessmentRequestSchema = z.object({
  final_notes: z.string().optional()
});

// Apply to:
// - POST /assessments/:id/answers
// - POST /assessments/:id/complete
```

### 2. Users (CRITICAL)
```typescript
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

// Apply to:
// - PUT /users/profile
// - GET /users/history (query params)
```

### 3. Teams (CRITICAL)
```typescript
export const createTeamRequestSchemaFull = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional()
});

export const updateTeamRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional()
});

export const addTeamMemberRequestSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'member']).default('member')
});

// Apply to:
// - POST /teams
// - PUT /teams/:id
// - POST /teams/:id/members
```

### 4. RAG (CRITICAL)
```typescript
export const ragQueryRequestSchemaFull = z.object({
  query: z.string().min(1).max(1000),
  pillar: z.string().optional(),
  mode: z.enum(['egalitarian', 'hierarchical']).optional(),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(20).default(5)
});

export const forcesQuerySchema = z.object({
  mode: z.enum(['egalitarian', 'hierarchical'])
});

export const ingestKnowledgeRequestSchema = z.object({
  content: z.string().min(1),
  metadata: z.record(z.any()).optional()
});

// Apply to:
// - POST /rag/query
// - GET /rag/forces/:pillar (query params)
// - GET /rag/connections (query params)
// - POST /rag/ingest
```

### 5. Content (HIGH)
```typescript
export const createContentRequestSchemaFull = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  content_type: z.enum(['blog', 'page', 'resource']),
  pillar_id: z.string().optional(),
  mode: z.enum(['egalitarian', 'hierarchical']).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft')
});

export const updateContentRequestSchemaFull = createContentRequestSchemaFull.partial();

// Apply to:
// - POST /content
// - PUT /content/:id
```

### 6. Path Parameters (ALL ROUTES)
```typescript
export const uuidParamSchema = z.object({
  id: z.string().uuid()
});

export const slugParamSchema = z.object({
  slug: z.string().min(1).max(200)
});

// Apply to ALL :id routes (20+ endpoints)
```

---

## Quick Fix Template

### For POST/PUT Routes:
```typescript
// 1. Import validation
import { validateBody } from '../middleware/validation';
import { yourSchemaName } from '../schemas/api';

// 2. Add to route
router.post('/endpoint',
  requireAuth,
  rateLimitGeneral,
  validateBody(yourSchemaName), // ADD THIS LINE
  async (c) => {
    const validatedData = c.get('validatedBody'); // USE THIS
    // ... rest of handler
  }
);
```

### For GET Routes with Query Params:
```typescript
// 1. Import validation
import { validateQuery } from '../middleware/validation';
import { yourQuerySchema } from '../schemas/api';

// 2. Add to route
router.get('/endpoint',
  requireAuth,
  validateQuery(yourQuerySchema), // ADD THIS LINE
  async (c) => {
    const { param1, param2 } = c.get('validatedQuery'); // USE THIS
    // ... rest of handler
  }
);
```

### For Routes with Path Parameters:
```typescript
// 1. Import validation
import { validateParams } from '../middleware/validation';

const uuidParamSchema = z.object({
  id: z.string().uuid()
});

// 2. Add to route
router.get('/endpoint/:id',
  requireAuth,
  validateParams(uuidParamSchema), // ADD THIS LINE
  async (c) => {
    const { id } = c.get('validatedParams'); // USE THIS
    // ... rest of handler
  }
);
```

---

## Error Response Standardization

### Current Problem:
```typescript
// Different formats across codebase
return c.json({ error: error.message }, 500); // Format 1
return c.json({ assessment: data }); // Format 2
return c.json(createApiResponse(data)); // Format 3 (correct)
```

### Standard Fix:
```typescript
import { createApiResponse } from '../middleware/validation';

// Success response
return c.json(createApiResponse({ assessment: data }));

// Error response
return c.json(createApiResponse(null, {
  code: 'RESOURCE_NOT_FOUND',
  message: 'Assessment not found',
  field: 'id'
}), 404);
```

---

## Implementation Checklist

### Day 1 (6 hours)
- [ ] Create Assessment schemas (submitAnswer, completeAssessment)
- [ ] Create User schemas (updateProfile, historyQuery)
- [ ] Create Team schemas (createTeam, updateTeam, addMember)
- [ ] Apply validation to Assessments routes (6 endpoints)
- [ ] Apply validation to Users routes (2 endpoints)

### Day 2 (6 hours)
- [ ] Create RAG schemas (ragQuery, forces, ingest)
- [ ] Create Content schemas (create, update)
- [ ] Apply validation to Teams routes (4 endpoints)
- [ ] Apply validation to RAG routes (4 endpoints)
- [ ] Apply validation to Content routes (2 endpoints)

### Day 3 (8 hours)
- [ ] Create entity-specific schemas for entities.js (27 entities)
- [ ] Refactor entities.js to use schema map
- [ ] Test all entity CRUD operations
- [ ] Create path parameter schemas (uuid, slug)

### Day 4 (8 hours)
- [ ] Add path parameter validation to all :id routes
- [ ] Add query parameter validation to all GET routes
- [ ] Standardize all error responses to use createApiResponse
- [ ] Update integration tests to validate schemas

### Day 5 (8 hours)
- [ ] Add contract tests for all endpoints
- [ ] Security review (input sanitization, XSS prevention)
- [ ] CORS configuration for production
- [ ] Rate limit tuning
- [ ] Final validation coverage verification (target: 80%+)

---

## Priority Routes (Fix First)

1. **POST /api/v1/assessments** - Creates assessments (no validation)
2. **POST /api/v1/assessments/:id/answers** - Submits quiz answers (no validation)
3. **PUT /api/v1/users/profile** - Updates user profile (no validation)
4. **POST /api/v1/teams** - Creates teams (no validation)
5. **POST /api/v1/rag/query** - RAG search (partial validation)
6. **POST /api/v1/entities/:entity** - Generic CRUD (accepts ANY JSON - CRITICAL)

---

## Success Criteria

- [ ] Validation coverage ≥ 80% (34+ of 43 endpoints)
- [ ] All POST/PUT routes have Zod validation
- [ ] All query parameters validated
- [ ] All path parameters validated (:id, :slug, etc.)
- [ ] Error responses standardized across all routes
- [ ] Contract tests passing for all endpoints
- [ ] Integration tests updated to test validation failures
- [ ] No routes accept arbitrary JSON without schema validation

---

## Resources

- **Main Assessment:** `docs/PRODUCTION_READINESS_ASSESSMENT.md`
- **API Contracts:** `docs/api-contracts.md`
- **Existing Schemas:** `backend/src/schemas/api.ts`
- **Validation Middleware:** `backend/src/middleware/validation.ts`
- **Example (AI Routes):** `backend/src/routes/ai.ts` (100% validated ✅)

---

## Contact Points for Questions

- **Validation Middleware:** See `backend/src/middleware/validation.ts`
- **Zod Documentation:** https://zod.dev
- **Existing Schemas:** `backend/src/schemas/api.ts` lines 1-335
- **Error Codes:** `docs/api-contracts.md` lines 579-658
