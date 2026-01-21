# @compilar/shared

**Shared TypeScript types and Zod schemas for Compilar frontend and backend.**

This package provides a single source of truth for API contracts, ensuring type safety and validation consistency across the entire stack.

## 🎯 Purpose

- **Type Safety**: TypeScript types automatically derived from Zod schemas
- **Validation**: Runtime validation on both frontend and backend
- **Single Source of Truth**: One definition for each API contract
- **DRY Principle**: No duplication between frontend and backend
- **Contract Enforcement**: Frontend and backend can't drift apart

## 📦 Installation

```bash
# In root directory
cd shared
bun install
```

## 🏗️ Architecture

```
shared/
├── src/
│   ├── schemas/           # Zod schemas for validation
│   │   ├── common.ts      # Shared schemas (UUID, email, etc.)
│   │   ├── assessment.ts  # Assessment-related schemas
│   │   ├── ai.ts          # AI/LLM schemas
│   │   ├── user.ts        # User schemas
│   │   ├── team.ts        # Team schemas
│   │   ├── rag.ts         # RAG schemas
│   │   └── index.ts       # Re-exports all schemas
│   ├── types/
│   │   └── index.ts       # TypeScript types (z.infer)
│   └── index.ts           # Main entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Usage

### Backend (Validation)

```typescript
import { createAssessmentRequestSchema } from '@compilar/shared/schemas';
import { validateBody } from '../middleware/validation';

// Apply validation middleware
app.post('/api/v1/assessments',
  requireAuth,
  validateBody(createAssessmentRequestSchema), // Validates request body
  async (c) => {
    const validatedData = c.get('validatedBody'); // Type-safe data
    // validatedData is typed as CreateAssessmentRequest
  }
);
```

### Frontend (Types)

```typescript
import type {
  CreateAssessmentRequest,
  AssessmentResponse
} from '@compilar/shared/types';

// Type-safe API client
const createAssessment = async (
  data: CreateAssessmentRequest
): Promise<AssessmentResponse> => {
  const response = await fetch('/api/v1/assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  return response.json() as Promise<AssessmentResponse>;
};

// TypeScript ensures correct usage
const result = await createAssessment({
  pillar_id: 'divsexp',
  mode: 'egalitarian'
});
// ✅ Type-safe: pillar_id must be valid enum value
// ✅ Type-safe: mode must be 'egalitarian' | 'hierarchical'
```

### Runtime Validation (Frontend or Backend)

```typescript
import { createAssessmentRequestSchema } from '@compilar/shared/schemas';

// Validate data at runtime
const parseResult = createAssessmentRequestSchema.safeParse(data);

if (!parseResult.success) {
  console.error('Validation errors:', parseResult.error.errors);
  // [
  //   {
  //     path: ['pillar_id'],
  //     message: 'Invalid pillar ID'
  //   }
  // ]
} else {
  // parseResult.data is typed and validated
  const validData = parseResult.data;
}
```

## 📋 Available Schemas

### Common Schemas

- `uuidSchema` - UUID v4 validation
- `emailSchema` - Email format validation
- `nonEmptyStringSchema` - Non-empty string
- `pillarIdSchema` - Valid pillar IDs (enum)
- `assessmentModeSchema` - 'egalitarian' | 'hierarchical'
- `timestampSchema` - ISO 8601 datetime
- `paginationQuerySchema` - Pagination parameters
- `apiResponseSchema<T>` - Standard API response wrapper
- `apiErrorSchema` - Standard error response

### Assessment Schemas

- `createAssessmentRequestSchema` - Create assessment
- `assessmentResponseSchema` - Assessment data
- `submitAnswerRequestSchema` - Submit quiz answer
- `answerDataSchema` - Answer with timestamp
- `completeAssessmentRequestSchema` - Complete assessment
- `assessmentResultsSchema` - Results data
- `assessmentSessionResponseSchema` - Session data
- `listAssessmentsQuerySchema` - List query params

### AI Schemas

- `messageSchema` - LLM message
- `coachConversationRequestSchema` - Chat request
- `ragQueryRequestSchema` - RAG search request
- `ragSearchResultSchema` - Search result
- `generateQuizQuestionsRequestSchema` - Quiz gen request
- `quizQuestionSchema` - Quiz question
- `analyzeContentRequestSchema` - Content analysis request
- `contentAnalysisResultSchema` - Analysis result
- `coachingGuidanceRequestSchema` - Coaching request

### User Schemas

- `userRoleSchema` - User role enum
- `createUserProfileRequestSchema` - Create profile
- `updateUserProfileRequestSchema` - Update profile
- `userProfileResponseSchema` - Profile data
- `updateUserProgressRequestSchema` - Update progress
- `userProgressResponseSchema` - Progress data

### Team Schemas

- `teamMemberRoleSchema` - Team role enum
- `createTeamRequestSchema` - Create team
- `updateTeamRequestSchema` - Update team
- `teamResponseSchema` - Team data
- `addTeamMemberRequestSchema` - Add member
- `updateTeamMemberRequestSchema` - Update member role
- `teamMemberResponseSchema` - Member data

### RAG Schemas

- `forceSchema` - Psychological force
- `getForcesQuerySchema` - Get forces query
- `forceConnectionSchema` - Force connection
- `getConnectionsQuerySchema` - Get connections query
- `ingestKnowledgeRequestSchema` - Ingest knowledge (admin)
- `knowledgeIngestionResultSchema` - Ingestion result

## 🔒 Type Safety Benefits

### Before (No Shared Types)

```typescript
// Backend
app.post('/assessments', async (c) => {
  const body = await c.req.json(); // any
  const { pillar_id, mode } = body; // any
  // No validation! Could be anything!
});

// Frontend
const data = { pillar_id: 'invalid', mode: 123 };
// ❌ No type checking, runtime error!
```

### After (Shared Types)

```typescript
// Backend
app.post('/assessments',
  validateBody(createAssessmentRequestSchema),
  async (c) => {
    const body = c.get('validatedBody'); // CreateAssessmentRequest
    // ✅ Validated at runtime
    // ✅ Type-safe at compile time
  }
);

// Frontend
const data: CreateAssessmentRequest = {
  pillar_id: 'invalid', // ❌ TypeScript error!
  mode: 123             // ❌ TypeScript error!
};
// Must use: pillar_id: 'divsexp', mode: 'egalitarian'
```

## 📝 Adding New Schemas

1. **Create schema in appropriate file** (`src/schemas/`):
```typescript
// src/schemas/analytics.ts
export const analyticsEventSchema = z.object({
  event_type: z.enum(['page_view', 'button_click']),
  properties: z.record(z.any())
});
```

2. **Export from schemas/index.ts**:
```typescript
export * from './analytics';
```

3. **Add TypeScript type** in `src/types/index.ts`:
```typescript
export type AnalyticsEvent = z.infer<typeof schemas.analyticsEventSchema>;
```

4. **Use in backend**:
```typescript
import { analyticsEventSchema } from '@compilar/shared/schemas';
app.post('/analytics', validateBody(analyticsEventSchema), handler);
```

5. **Use in frontend**:
```typescript
import type { AnalyticsEvent } from '@compilar/shared/types';
const trackEvent = (event: AnalyticsEvent) => { /* ... */ };
```

## 🧪 Testing

```bash
# Type check
bun run type-check

# Use in tests
import { createAssessmentRequestSchema } from '@compilar/shared/schemas';

test('validates assessment request', () => {
  const result = createAssessmentRequestSchema.safeParse({
    pillar_id: 'divsexp',
    mode: 'egalitarian'
  });

  expect(result.success).toBe(true);
});
```

## 🔄 Integration

### Backend Package.json

```json
{
  "dependencies": {
    "@compilar/shared": "file:../shared"
  }
}
```

### Frontend Package.json

```json
{
  "dependencies": {
    "@compilar/shared": "file:../shared"
  }
}
```

### Install

```bash
# Backend
cd backend
bun install

# Frontend
cd ..
bun install
```

## ✅ Benefits

1. **Type Safety**: TypeScript prevents runtime errors
2. **Validation**: Zod catches invalid data before it reaches handlers
3. **DRY**: Single definition shared across stack
4. **Refactoring**: Change once, update everywhere
5. **Documentation**: Schemas serve as API documentation
6. **IDE Support**: Autocomplete and type hints
7. **Testing**: Easy to test with known schema shapes

## 📚 Resources

- [Zod Documentation](https://zod.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- Backend validation: `backend/src/middleware/validation.ts`
- Frontend API client: `src/api/restClient.js`

---

**Note**: This package is internal to the Compilar monorepo. It's not published to npm.
