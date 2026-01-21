# Shared Contract Integration Guide

**Created**: January 2, 2026
**Status**: ✅ Implemented

This document explains the shared contract layer between frontend and backend, ensuring type safety and validation consistency across the entire stack.

---

## 🎯 Overview

The `@compilar/shared` package provides a **single source of truth** for API contracts:

- **Zod schemas** for runtime validation
- **TypeScript types** automatically derived from schemas
- **Consistent error handling** across frontend and backend
- **Contract enforcement** preventing frontend-backend drift

### Architecture

```
Frontend (React)          Shared Package          Backend (Hono)
     │                         │                        │
     │  import types           │   import schemas       │
     ├────────────────────────►│◄───────────────────────┤
     │                         │                        │
     │  CreateAssessmentReq    │   Zod Schema          │
     │  (TypeScript type)      │   (validation)         │
     │                         │                        │
     └─────────────────────────┴────────────────────────┘
              Single Source of Truth
```

---

## 📦 Package Structure

```
shared/
├── src/
│   ├── schemas/              # Zod validation schemas
│   │   ├── common.ts         # UUID, email, pillar IDs, etc.
│   │   ├── assessment.ts     # Assessment contracts
│   │   ├── ai.ts             # AI/LLM contracts
│   │   ├── user.ts           # User contracts
│   │   ├── team.ts           # Team contracts
│   │   ├── rag.ts            # RAG contracts
│   │   └── index.ts          # Re-exports
│   ├── types/
│   │   └── index.ts          # TypeScript types (z.infer)
│   └── index.ts              # Main entry point
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Backend Integration

### Step 1: Update Route with Shared Schema

**Before** (No validation):
```typescript
// backend/src/routes/assessments.ts
import { Hono } from 'hono';

const assessments = new Hono();

assessments.post('/', requireAuth, async (c) => {
  const body = await c.req.json(); // ❌ any type
  const { pillar_id, mode } = body; // ❌ no validation

  // Could be anything! Security risk!
  const assessment = await createAssessment(pillar_id, mode);
  return c.json(assessment);
});
```

**After** (With shared schema):
```typescript
// backend/src/routes/assessments.ts
import { Hono } from 'hono';
import { createAssessmentRequestSchema } from '@compilar/shared/schemas';
import { validateBody } from '../middleware/validation';
import type { CreateAssessmentRequest } from '@compilar/shared/types';

const assessments = new Hono();

assessments.post('/',
  requireAuth,
  validateBody(createAssessmentRequestSchema), // ✅ Validates input
  async (c) => {
    const body = c.get('validatedBody') as CreateAssessmentRequest; // ✅ Type-safe

    // body.pillar_id is validated enum
    // body.mode is 'egalitarian' | 'hierarchical'
    const assessment = await createAssessment(body.pillar_id, body.mode);

    return c.json(assessment);
  }
);
```

### Step 2: Update Service Layer

```typescript
// backend/src/services/assessment.service.ts
import type {
  CreateAssessmentRequest,
  AssessmentResponse,
  SubmitAnswerRequest
} from '@compilar/shared/types';

export class AssessmentService {
  async createAssessment(
    userId: string,
    request: CreateAssessmentRequest
  ): Promise<AssessmentResponse> {
    // Type-safe: request.pillar_id is validated
    const { data, error } = await this.supabase
      .from('pilar_assessments')
      .insert({
        user_id: userId,
        pillar_id: request.pillar_id,
        mode: request.mode
      })
      .select()
      .single();

    if (error) throw error;
    return data; // ✅ Matches AssessmentResponse type
  }

  async submitAnswer(
    assessmentId: string,
    request: SubmitAnswerRequest
  ): Promise<void> {
    // Type-safe: request.answer is validated union type
    await this.supabase.rpc('update_assessment_response', {
      assessment_id: assessmentId,
      question_id: request.question_id,
      answer_data: {
        answer: request.answer,
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

### Step 3: Response Validation (Optional)

```typescript
import { assessmentResponseSchema } from '@compilar/shared/schemas';

assessments.get('/:id', requireAuth, async (c) => {
  const { data } = await supabase
    .from('pilar_assessments')
    .select('*')
    .eq('id', id)
    .single();

  // Validate response matches schema (catches DB schema changes)
  const validated = assessmentResponseSchema.parse(data);

  return c.json(validated);
});
```

---

## 🎨 Frontend Integration

### Step 1: Update API Client

**Before** (No types):
```typescript
// src/api/restClient.js
export const createAssessment = async (pillarId, mode) => {
  // ❌ No type safety
  const response = await fetch('/api/v1/assessments', {
    method: 'POST',
    body: JSON.stringify({ pillar_id: pillarId, mode })
  });
  return response.json();
};
```

**After** (With shared types):
```typescript
// src/api/restClient.ts (renamed to .ts)
import type {
  CreateAssessmentRequest,
  AssessmentResponse
} from '@compilar/shared/types';

export const createAssessment = async (
  request: CreateAssessmentRequest
): Promise<AssessmentResponse> => {
  // ✅ Type-safe request
  const response = await fetch('/api/v1/assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Failed to create assessment: ${response.statusText}`);
  }

  return response.json() as Promise<AssessmentResponse>;
};

// Usage
const assessment = await createAssessment({
  pillar_id: 'divsexp',     // ✅ Type-checked enum
  mode: 'egalitarian'       // ✅ Type-checked enum
});

// ❌ TypeScript error:
// createAssessment({ pillar_id: 'invalid', mode: 123 });
```

### Step 2: Update React Components

```typescript
// src/components/assess/AssessmentCreator.tsx
import { useState } from 'react';
import type {
  CreateAssessmentRequest,
  AssessmentResponse,
  PillarId,
  AssessmentMode
} from '@compilar/shared/types';
import { createAssessment } from '@/api/restClient';

export const AssessmentCreator = () => {
  const [pillarId, setPillarId] = useState<PillarId>('divsexp');
  const [mode, setMode] = useState<AssessmentMode>('egalitarian');

  const handleCreate = async () => {
    const request: CreateAssessmentRequest = {
      pillar_id: pillarId,
      mode: mode
    };

    // ✅ Type-safe API call
    const assessment: AssessmentResponse = await createAssessment(request);

    // ✅ Type-safe property access
    console.log(assessment.id, assessment.pillar_id, assessment.mode);
  };

  return (
    <button onClick={handleCreate}>
      Create Assessment
    </button>
  );
};
```

### Step 3: Runtime Validation (Frontend)

```typescript
// src/utils/validation.ts
import { createAssessmentRequestSchema } from '@compilar/shared/schemas';

export const validateAssessmentRequest = (data: unknown) => {
  const result = createAssessmentRequestSchema.safeParse(data);

  if (!result.success) {
    // Display errors to user
    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));

    throw new ValidationError('Invalid assessment request', errors);
  }

  return result.data; // ✅ Validated and typed
};

// Usage in form submission
const handleSubmit = (formData) => {
  try {
    const validatedData = validateAssessmentRequest(formData);
    await createAssessment(validatedData);
  } catch (error) {
    if (error instanceof ValidationError) {
      // Show validation errors to user
      setErrors(error.errors);
    }
  }
};
```

---

## 📋 Common Patterns

### Pattern 1: List with Query Parameters

```typescript
// Shared schema
export const listAssessmentsQuerySchema = z.object({
  pillar_id: pillarIdSchema.optional(),
  mode: assessmentModeSchema.optional(),
  completed: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

// Backend
import { listAssessmentsQuerySchema } from '@compilar/shared/schemas';
import { validateQuery } from '../middleware/validation';

assessments.get('/',
  requireAuth,
  validateQuery(listAssessmentsQuerySchema),
  async (c) => {
    const query = c.get('validatedQuery');
    // query.pillar_id, query.mode, query.page all validated
  }
);

// Frontend
import type { ListAssessmentsQuery } from '@compilar/shared/types';

const fetchAssessments = async (query: ListAssessmentsQuery) => {
  const params = new URLSearchParams();
  if (query.pillar_id) params.set('pillar_id', query.pillar_id);
  if (query.mode) params.set('mode', query.mode);
  params.set('page', String(query.page));

  const response = await fetch(`/api/v1/assessments?${params}`);
  return response.json();
};
```

### Pattern 2: Nested Objects

```typescript
// Shared schema
export const completeAssessmentRequestSchema = z.object({
  final_responses: z.record(z.object({
    answer: z.union([z.number(), z.string(), z.boolean()]),
    timestamp: timestampSchema
  })).optional()
});

// Backend
assessments.post('/:id/complete',
  requireAuth,
  validateBody(completeAssessmentRequestSchema),
  async (c) => {
    const body = c.get('validatedBody');
    // body.final_responses is validated record
  }
);

// Frontend
import type { CompleteAssessmentRequest } from '@compilar/shared/types';

const completeAssessment = async (
  id: string,
  request: CompleteAssessmentRequest
) => {
  await fetch(`/api/v1/assessments/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
};
```

### Pattern 3: Union Types

```typescript
// Shared schema
export const answerSchema = z.union([
  z.number().int().min(1).max(5),  // Likert scale
  z.string(),                       // Text answer
  z.boolean(),                      // Yes/No
  z.array(z.string())               // Multiple choice
]);

// TypeScript type
export type Answer = z.infer<typeof answerSchema>;
// Answer = number | string | boolean | string[]

// Frontend component
const handleAnswerChange = (answer: Answer) => {
  // TypeScript knows all possible types
  if (typeof answer === 'number') {
    // Likert scale (1-5)
  } else if (typeof answer === 'boolean') {
    // Yes/No
  } else if (Array.isArray(answer)) {
    // Multiple choice
  } else {
    // Text answer
  }
};
```

---

## 🧪 Testing Contracts

### Backend Contract Tests

```typescript
// backend/tests/integration/contracts.test.ts
import { describe, test, expect } from 'bun:test';
import { createAssessmentRequestSchema } from '@compilar/shared/schemas';

describe('Assessment Contract Validation', () => {
  test('validates correct assessment request', () => {
    const validRequest = {
      pillar_id: 'divsexp',
      mode: 'egalitarian'
    };

    const result = createAssessmentRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  test('rejects invalid pillar ID', () => {
    const invalidRequest = {
      pillar_id: 'invalid',
      mode: 'egalitarian'
    };

    const result = createAssessmentRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('Invalid pillar ID');
  });

  test('rejects invalid mode', () => {
    const invalidRequest = {
      pillar_id: 'divsexp',
      mode: 'invalid'
    };

    const result = createAssessmentRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});
```

### Frontend Contract Tests

```typescript
// src/__tests__/api.test.ts
import { describe, test, expect, vi } from 'vitest';
import { createAssessment } from '@/api/restClient';
import type { CreateAssessmentRequest } from '@compilar/shared/types';

describe('API Client Type Safety', () => {
  test('createAssessment accepts valid request', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: '123', pillar_id: 'divsexp', mode: 'egalitarian' })
    });

    const request: CreateAssessmentRequest = {
      pillar_id: 'divsexp',
      mode: 'egalitarian'
    };

    const assessment = await createAssessment(request);
    expect(assessment.id).toBe('123');
  });

  // TypeScript compilation test
  test('TypeScript prevents invalid requests', () => {
    // This won't compile:
    // const request: CreateAssessmentRequest = {
    //   pillar_id: 'invalid',  // ❌ Type error
    //   mode: 123              // ❌ Type error
    // };

    // This compiles:
    const request: CreateAssessmentRequest = {
      pillar_id: 'divsexp',
      mode: 'egalitarian'
    };

    expect(request.pillar_id).toBe('divsexp');
  });
});
```

---

## 🔒 Benefits

### 1. Type Safety

**Frontend knows exactly what backend expects:**
```typescript
// ✅ Autocomplete works
const request: CreateAssessmentRequest = {
  pillar_id: '...',  // IDE suggests valid pillar IDs
  mode: '...'        // IDE suggests 'egalitarian' | 'hierarchical'
};

// ❌ TypeScript catches mistakes
const request: CreateAssessmentRequest = {
  pillar_id: 'invalid',  // Compile error
  mode: 123              // Compile error
};
```

### 2. Runtime Validation

**Backend validates all inputs:**
```typescript
// Invalid request gets caught immediately
POST /api/v1/assessments
{ "pillar_id": "invalid", "mode": 123 }

// Returns 400 with clear error:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "path": "pillar_id",
        "message": "Invalid pillar ID"
      },
      {
        "path": "mode",
        "message": "Mode must be either 'egalitarian' or 'hierarchical'"
      }
    ]
  }
}
```

### 3. Contract Enforcement

**Frontend and backend can't drift apart:**
```typescript
// Backend changes schema
export const createAssessmentRequestSchema = z.object({
  pillar_id: pillarIdSchema,
  mode: assessmentModeSchema,
  context: z.string().optional()  // New field added
});

// Frontend gets TypeScript error if it doesn't handle new field
const request: CreateAssessmentRequest = {
  pillar_id: 'divsexp',
  mode: 'egalitarian'
  // context is optional, so this is still valid
};
```

### 4. Refactoring Safety

**Change once, update everywhere:**
```typescript
// Change schema
export const pillarIdSchema = z.enum([
  // Add new pillar
  'newpillar',
  'divsexp',
  // ...
]);

// TypeScript automatically:
// - Updates all type definitions
// - Shows errors where new value needs handling
// - Provides autocomplete for new value

// Both frontend and backend automatically aware of change
```

---

## 📚 Migration Checklist

### ✅ Completed

- [x] Create `shared/` package structure
- [x] Define Zod schemas for all API contracts
- [x] Export TypeScript types from schemas
- [x] Add shared package to backend dependencies
- [x] Add shared package to frontend dependencies
- [x] Install dependencies

### 🔄 In Progress

- [ ] Update backend routes to use shared schemas
- [ ] Update frontend API client to use shared types
- [ ] Add contract validation tests

### 📋 Remaining

- [ ] Update all 43 backend routes (currently 5/43)
- [ ] Convert frontend API client from .js to .ts
- [ ] Add query and path parameter validation
- [ ] Standardize error responses
- [ ] Update documentation

---

## 🎯 Next Steps

1. **Update Backend Routes** (Priority: High)
   - Replace inline Zod schemas with shared schemas
   - Apply `validateBody` middleware to all routes
   - Ensure all routes return validated responses

2. **Update Frontend API Client** (Priority: High)
   - Rename `.js` files to `.ts`
   - Add type annotations using shared types
   - Add runtime validation for critical paths

3. **Add Contract Tests** (Priority: Medium)
   - Test each schema with valid/invalid data
   - Test frontend-backend integration
   - Ensure error messages are clear

4. **Documentation** (Priority: Medium)
   - Update API documentation with types
   - Add examples for each endpoint
   - Document error codes and formats

---

## 📖 Resources

- Shared package: `/shared/`
- Backend validation: `/backend/src/middleware/validation.ts`
- AI routes (example): `/backend/src/routes/ai.ts`
- Frontend API client: `/src/api/restClient.js`
- Zod documentation: https://zod.dev

---

**Status**: ✅ Infrastructure complete, ready for integration
**Next**: Apply shared schemas to remaining 38 backend routes
