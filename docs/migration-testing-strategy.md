# Migration Testing Strategy

## Overview

This document outlines a comprehensive testing strategy for the Base44-to-REST migration. The strategy ensures data integrity, API contract compliance, and frontend compatibility throughout the transition while maintaining system stability.

## Testing Objectives

### Primary Goals
- ✅ **Contract Compliance**: All API interactions match defined contracts
- ✅ **Data Integrity**: Zero data loss during migration
- ✅ **Functional Compatibility**: Frontend components work with new APIs
- ✅ **Performance Standards**: API responses meet <200ms target
- ✅ **Error Handling**: Proper error responses and recovery

### Success Criteria
- **API Contract Tests**: 100% pass rate for all contracts
- **Data Validation**: 100% data consistency between systems
- **Frontend Tests**: All components render and function correctly
- **Performance Tests**: 95% of requests <200ms response time
- **Error Tests**: All error scenarios handled appropriately

## Testing Framework Architecture

### Test Categories

#### 1. Contract Tests
**Purpose**: Validate API request/response compliance with specifications

**Scope**: All REST endpoints and their contracts

**Tools**: Jest, Supertest, Zod validation

#### 2. Integration Tests
**Purpose**: Validate end-to-end functionality across system boundaries

**Scope**: Frontend ↔ Backend ↔ Database interactions

**Tools**: Playwright, Cypress, Supertest

#### 3. Data Integrity Tests
**Purpose**: Ensure data consistency during and after migration

**Scope**: Database records, foreign keys, business rules

**Tools**: PostgreSQL queries, custom validation scripts

#### 4. Performance Tests
**Purpose**: Validate API performance meets requirements

**Scope**: Response times, throughput, resource usage

**Tools**: Artillery, k6, custom benchmarks

#### 5. Compatibility Tests
**Purpose**: Ensure frontend components work with migrated APIs

**Scope**: React components, Zustand stores, hooks

**Tools**: Jest, React Testing Library, MSW

## Contract Testing Implementation

### API Contract Test Framework

```typescript
// tests/contracts/contract-test-framework.ts
export class ContractTestRunner {
  private contracts: APIContract[];

  constructor(contracts: APIContract[]) {
    this.contracts = contracts;
  }

  async runContractTests() {
    const results = [];

    for (const contract of this.contracts) {
      const result = await this.testContract(contract);
      results.push(result);

      if (!result.passed) {
        console.error(`Contract failed: ${contract.path}`, result.errors);
      }
    }

    return results;
  }

  private async testContract(contract: APIContract) {
    const errors = [];

    try {
      // Test valid request/response
      const validResult = await this.testValidScenario(contract);
      if (!validResult.passed) {
        errors.push(...validResult.errors);
      }

      // Test invalid requests
      const invalidResults = await this.testInvalidScenarios(contract);
      errors.push(...invalidResults.flatMap(r => r.errors));

      // Test error responses
      const errorResults = await this.testErrorScenarios(contract);
      errors.push(...errorResults.flatMap(r => r.errors));

    } catch (error) {
      errors.push(`Test execution failed: ${error.message}`);
    }

    return {
      contract: contract.path,
      passed: errors.length === 0,
      errors
    };
  }

  private async testValidScenario(contract: APIContract) {
    // Generate valid test data
    const testData = this.generateValidTestData(contract.requestSchema);

    // Make API call
    const response = await this.makeAuthenticatedRequest(contract, testData);

    // Validate response against schema
    try {
      contract.responseSchema.parse(response.data);
      return { passed: true, errors: [] };
    } catch (error) {
      return { passed: false, errors: [error.message] };
    }
  }

  private async testInvalidScenarios(contract: APIContract) {
    const invalidScenarios = this.generateInvalidTestData(contract.requestSchema);
    const results = [];

    for (const scenario of invalidScenarios) {
      try {
        const response = await this.makeAuthenticatedRequest(contract, scenario.data);
        const expectedError = scenario.expectedError;

        if (response.status !== expectedError.status) {
          results.push({
            passed: false,
            errors: [`Expected status ${expectedError.status}, got ${response.status}`]
          });
        } else if (response.data.error?.code !== expectedError.code) {
          results.push({
            passed: false,
            errors: [`Expected error code ${expectedError.code}, got ${response.data.error?.code}`]
          });
        } else {
          results.push({ passed: true, errors: [] });
        }
      } catch (error) {
        results.push({ passed: false, errors: [error.message] });
      }
    }

    return results;
  }

  private generateValidTestData(schema: ZodSchema): any {
    // Generate valid test data based on schema
    // Implementation would use a library like @faker-js/faker
    // or custom generators for each schema type
  }

  private generateInvalidTestData(schema: ZodSchema): Array<{data: any, expectedError: any}> {
    // Generate invalid test data with expected errors
    // Tests missing required fields, wrong types, invalid enums, etc.
  }
}
```

### Contract Test Examples

#### PilarAssessment Contract Tests

```typescript
// tests/contracts/entities/pilar-assessment.contract.test.ts
describe('PilarAssessment Contracts', () => {
  const runner = new ContractTestRunner([
    createPilarAssessmentContract,
    listPilarAssessmentsContract,
    getPilarAssessmentContract,
    updatePilarAssessmentContract,
    deletePilarAssessmentContract
  ]);

  beforeAll(async () => {
    // Setup test database with clean state
    await setupTestDatabase();
    // Create test user and authentication
    await setupTestUser();
  });

  test('all contracts pass', async () => {
    const results = await runner.runContractTests();
    const failures = results.filter(r => !r.passed);

    if (failures.length > 0) {
      console.error('Contract test failures:', failures);
    }

    expect(failures).toHaveLength(0);
  });

  describe('Create Assessment', () => {
    test('valid assessment creation', async () => {
      const testData = {
        pillar_id: 'divsexp',
        mode: 'egalitarian',
        scores: { force1: 8.5, force2: 7.2 },
        forces_data: { psychological: {}, social: {} }
      };

      const response = await api.post('/api/v1/entities/pilar-assessments', testData);

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.pillar_id).toBe(testData.pillar_id);

      // Validate schema compliance
      createPilarAssessmentContract.responseSchema.parse(response.data);
    });

    test('invalid pillar_id returns validation error', async () => {
      const invalidData = {
        pillar_id: '', // Invalid: empty string
        mode: 'egalitarian',
        scores: { force1: 8.5 },
        forces_data: {}
      };

      const response = await api.post('/api/v1/entities/pilar-assessments', invalidData);

      expect(response.status).toBe(400);
      expect(response.data.error.code).toBe('VALIDATION_ERROR');
      expect(response.data.error.details).toContain('pillar_id');
    });

    test('missing required field returns validation error', async () => {
      const invalidData = {
        // Missing pillar_id
        mode: 'egalitarian',
        scores: { force1: 8.5 },
        forces_data: {}
      };

      const response = await api.post('/api/v1/entities/pilar-assessments', invalidData);

      expect(response.status).toBe(400);
      expect(response.data.error.code).toBe('VALIDATION_ERROR');
      expect(response.data.error.field).toBe('pillar_id');
    });
  });

  describe('List Assessments', () => {
    beforeEach(async () => {
      // Create test assessments
      await createTestAssessments(5);
    });

    test('returns paginated results', async () => {
      const response = await api.get('/api/v1/entities/pilar-assessments?limit=2&offset=1');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveLength(2);
      expect(response.data.meta.pagination.total).toBe(5);
      expect(response.data.meta.pagination.hasMore).toBe(true);
    });

    test('filters by pillar', async () => {
      const response = await api.get('/api/v1/entities/pilar-assessments?filter[pillar_id]=divsexp');

      expect(response.status).toBe(200);
      expect(response.data.data.every(a => a.pillar_id === 'divsexp')).toBe(true);
    });
  });
});
```

#### AI Function Contract Tests

```typescript
// tests/contracts/ai/coaching.contract.test.ts
describe('AI Coaching Contracts', () => {
  test('streaming coaching response', async () => {
    const request = {
      assessmentId: 'test-assessment-id',
      pillar: 'divsexp',
      mode: 'egalitarian',
      scores: { force1: 8.5, force2: 7.2 }
    };

    const response = await api.post('/api/v1/ai/coaching', request, {
      responseType: 'stream'
    });

    expect(response.status).toBe(200);

    // Validate streaming response format
    let chunkCount = 0;
    response.data.on('data', (chunk) => {
      const parsed = JSON.parse(chunk.toString());
      expect(['chunk', 'complete', 'error']).toContain(parsed.type);

      if (parsed.type === 'chunk') {
        expect(typeof parsed.data).toBe('string');
        expect(parsed.data.length).toBeGreaterThan(0);
      }

      chunkCount++;
    });

    // Wait for completion
    await new Promise(resolve => {
      response.data.on('end', () => {
        expect(chunkCount).toBeGreaterThan(0);
        resolve();
      });
    });
  });

  test('rate limiting works', async () => {
    const requests = Array(15).fill().map(() =>
      api.post('/api/v1/ai/coaching', {
        assessmentId: 'test-id',
        pillar: 'divsexp',
        mode: 'egalitarian'
      })
    );

    const responses = await Promise.allSettled(requests);
    const failures = responses.filter(r => r.status === 'rejected' ||
      r.value?.status === 429);

    expect(failures.length).toBeGreaterThan(0);
  });
});
```

## Data Integrity Testing

### Database Consistency Tests

```sql
-- tests/data-integrity/database-consistency.test.sql
-- Test foreign key integrity
SELECT 'Broken FK: pilar_assessments.user_id' as issue,
       COUNT(*) as count
FROM pilar_assessments pa
LEFT JOIN auth.users u ON pa.user_id = u.id
WHERE u.id IS NULL;

-- Test data type consistency
SELECT 'Invalid mode values' as issue,
       mode,
       COUNT(*) as count
FROM pilar_assessments
WHERE mode NOT IN ('egalitarian', 'hierarchical')
GROUP BY mode;

-- Test score range validity
SELECT 'Invalid score range' as issue,
       pillar_id,
       mode,
       jsonb_object_keys(scores) as force,
       scores->jsonb_object_keys(scores) as score
FROM pilar_assessments
WHERE NOT (scores->jsonb_object_keys(scores))::numeric BETWEEN 0 AND 10;
```

### Migration Data Validation

```typescript
// tests/data-integrity/migration-validation.test.ts
describe('Migration Data Validation', () => {
  test('assessment counts match between systems', async () => {
    const [base44Count] = await db.query('SELECT COUNT(*) FROM base44_assessments');
    const [restCount] = await db.query('SELECT COUNT(*) FROM pilar_assessments');

    expect(restCount).toBe(base44Count);
  });

  test('all assessments have valid user references', async () => {
    const orphaned = await db.query(`
      SELECT COUNT(*) as count
      FROM pilar_assessments pa
      LEFT JOIN auth.users u ON pa.user_id = u.id
      WHERE u.id IS NULL
    `);

    expect(orphaned[0].count).toBe(0);
  });

  test('assessment data integrity', async () => {
    const assessments = await db.query('SELECT * FROM pilar_assessments LIMIT 100');

    for (const assessment of assessments) {
      // Validate pillar_id format
      expect(assessment.pillar_id).toMatch(/^[a-z]+$/);

      // Validate mode enum
      expect(['egalitarian', 'hierarchical']).toContain(assessment.mode);

      // Validate scores are numbers 0-10
      Object.values(assessment.scores).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(10);
      });

      // Validate timestamps
      expect(new Date(assessment.created_at).getTime()).toBeLessThan(Date.now());
      expect(new Date(assessment.updated_at).getTime()).toBeGreaterThanOrEqual(
        new Date(assessment.created_at).getTime()
      );
    }
  });
});
```

### Continuous Data Validation

```typescript
// tests/data-integrity/continuous-validation.test.ts
describe('Continuous Data Validation', () => {
  test('real-time data consistency monitoring', async () => {
    // This test runs continuously during migration
    const interval = setInterval(async () => {
      const metrics = await validateDataConsistency();

      if (!metrics.isConsistent) {
        console.error('Data inconsistency detected:', metrics.issues);
        // Send alert to monitoring system
        await alertMonitoringSystem(metrics.issues);
      }
    }, 60000); // Check every minute

    // Run for test duration
    await new Promise(resolve => setTimeout(resolve, 300000)); // 5 minutes
    clearInterval(interval);
  });

  async function validateDataConsistency() {
    const issues = [];

    // Check assessment counts
    const [base44Count] = await db.query('SELECT COUNT(*) FROM base44_assessments');
    const [restCount] = await db.query('SELECT COUNT(*) FROM pilar_assessments');

    if (base44Count !== restCount) {
      issues.push({
        type: 'count_mismatch',
        table: 'pilar_assessments',
        base44: base44Count,
        rest: restCount
      });
    }

    // Check for orphaned records
    const [orphaned] = await db.query(`
      SELECT COUNT(*) as count
      FROM pilar_assessments
      WHERE user_id NOT IN (SELECT id FROM auth.users)
    `);

    if (orphaned.count > 0) {
      issues.push({
        type: 'orphaned_records',
        table: 'pilar_assessments',
        count: orphaned.count
      });
    }

    return {
      isConsistent: issues.length === 0,
      issues,
      timestamp: new Date().toISOString()
    };
  }
});
```

## Frontend Compatibility Testing

### Component Migration Tests

```typescript
// tests/frontend/components/pilar-assessment.test.tsx
describe('PilarAssessment Component Migration', () => {
  test('migrates from Base44 to REST API', async () => {
    // Mock migration status
    mockMigrationStatus({ entities: { PilarAssessment: 'rest' } });

    // Mock REST API response
    const mockAssessment = {
      id: 'test-id',
      pillar_id: 'divsexp',
      mode: 'egalitarian',
      scores: { force1: 8.5 },
      forces_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockRestClient.list.mockResolvedValue([mockAssessment]);

    // Render component
    render(<PilarAssessment />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('divsexp')).toBeInTheDocument();
    });

    // Verify REST API was called
    expect(mockRestClient.list).toHaveBeenCalledWith('pilar-assessments');
    expect(mockRestClient.list).toHaveBeenCalledTimes(1);
  });

  test('handles API errors gracefully', async () => {
    mockRestClient.list.mockRejectedValue(new Error('API Error'));

    render(<PilarAssessment />);

    await waitFor(() => {
      expect(screen.getByText('Error loading assessment')).toBeInTheDocument();
    });
  });

  test('shows loading state', async () => {
    mockRestClient.list.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<PilarAssessment />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### State Management Tests

```typescript
// tests/frontend/stores/assessment-store.test.ts
describe('Assessment Store Migration', () => {
  test('uses REST API when migrated', async () => {
    // Setup migration status
    setMigrationStatus({ entities: { PilarAssessment: 'rest' } });

    const store = createAssessmentStore();

    // Trigger data loading
    await store.loadAssessments();

    // Verify REST client was used
    expect(restClient.list).toHaveBeenCalledWith('pilar-assessments');
    expect(base44Client.entities.PilarAssessment.list).not.toHaveBeenCalled();
  });

  test('falls back to Base44 when needed', async () => {
    setMigrationStatus({ entities: { PilarAssessment: 'base44' } });

    const store = createAssessmentStore();

    await store.loadAssessments();

    expect(base44Client.entities.PilarAssessment.list).toHaveBeenCalled();
    expect(restClient.list).not.toHaveBeenCalled();
  });

  test('handles migration status changes', async () => {
    const store = createAssessmentStore();

    // Start with Base44
    setMigrationStatus({ entities: { PilarAssessment: 'base44' } });
    await store.loadAssessments();
    expect(base44Client.entities.PilarAssessment.list).toHaveBeenCalledTimes(1);

    // Switch to REST
    setMigrationStatus({ entities: { PilarAssessment: 'rest' } });
    await store.loadAssessments();
    expect(restClient.list).toHaveBeenCalledTimes(1);
  });
});
```

## Performance Testing

### API Performance Benchmarks

```typescript
// tests/performance/api-performance.test.ts
describe('API Performance Benchmarks', () => {
  test('assessment CRUD operations meet performance targets', async () => {
    const results = [];

    // Test create performance
    for (let i = 0; i < 100; i++) {
      const start = Date.now();
      await api.post('/api/v1/entities/pilar-assessments', {
        pillar_id: 'divsexp',
        mode: 'egalitarian',
        scores: { force1: Math.random() * 10 },
        forces_data: {}
      });
      const duration = Date.now() - start;
      results.push(duration);
    }

    const avgDuration = results.reduce((a, b) => a + b) / results.length;
    const maxDuration = Math.max(...results);
    const p95Duration = results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)];

    console.log(`Create Performance: avg=${avgDuration}ms, max=${maxDuration}ms, p95=${p95Duration}ms`);

    expect(avgDuration).toBeLessThan(200);
    expect(p95Duration).toBeLessThan(500);
  });

  test('list operations scale properly', async () => {
    // Create test data
    await createBulkTestData(1000);

    const results = [];

    // Test list performance with different page sizes
    for (const limit of [10, 50, 100]) {
      const start = Date.now();
      await api.get(`/api/v1/entities/pilar-assessments?limit=${limit}`);
      const duration = Date.now() - start;
      results.push({ limit, duration });
    }

    results.forEach(({ limit, duration }) => {
      console.log(`List ${limit} items: ${duration}ms`);
      expect(duration).toBeLessThan(200);
    });
  });
});
```

### Load Testing

```typescript
// tests/performance/load-testing.test.ts
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be below 10%
  },
};

export default function () {
  const response = http.get('http://localhost:3001/api/v1/entities/pilar-assessments');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has valid response structure': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.success === true && Array.isArray(data.data);
      } catch {
        return false;
      }
    }
  });
}
```

## Integration Testing

### End-to-End User Workflows

```typescript
// tests/integration/user-workflows.test.ts
describe('User Assessment Workflow', () => {
  test('complete assessment journey', async () => {
    // 1. User logs in
    const loginResponse = await api.post('/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    expect(loginResponse.data.success).toBe(true);
    const token = loginResponse.data.data.token;

    // Set auth header for subsequent requests
    api.defaults.headers.Authorization = `Bearer ${token}`;

    // 2. Start assessment session
    const sessionResponse = await api.post('/api/v1/entities/assessment-sessions', {
      pillar_id: 'divsexp',
      mode: 'egalitarian',
      stage: 'profile'
    });

    expect(sessionResponse.data.success).toBe(true);
    const sessionId = sessionResponse.data.data.id;

    // 3. Submit assessment responses
    const assessmentResponse = await api.post('/api/v1/entities/pilar-assessments', {
      pillar_id: 'divsexp',
      mode: 'egalitarian',
      scores: { force1: 8.5, force2: 7.2 },
      forces_data: { psychological: {}, social: {} }
    });

    expect(assessmentResponse.data.success).toBe(true);
    const assessmentId = assessmentResponse.data.data.id;

    // 4. Get AI coaching
    const coachingResponse = await api.post('/api/v1/ai/coaching', {
      assessmentId,
      pillar: 'divsexp',
      mode: 'egalitarian'
    });

    expect(coachingResponse.status).toBe(200);
    // Validate streaming response...

    // 5. Check progress dashboard
    const progressResponse = await api.get('/api/v1/entities/user-progress');
    expect(progressResponse.data.success).toBe(true);
    expect(progressResponse.data.data.length).toBeGreaterThan(0);
  });
});
```

## Test Automation & CI/CD

### Test Pipeline Configuration

```yaml
# .github/workflows/migration-tests.yml
name: Migration Tests

on:
  push:
    branches: [ feat/base44-migration-docs ]
  pull_request:
    branches: [ main ]

jobs:
  contract-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'bun'

      - name: Install dependencies
        run: bun install

      - name: Setup test database
        run: bun run db:migrate:test

      - name: Run contract tests
        run: bun run test:contracts

      - name: Run data integrity tests
        run: bun run test:data-integrity

  performance-tests:
    runs-on: ubuntu-latest
    needs: contract-tests

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'bun'

      - name: Install dependencies
        run: bun install

      - name: Run performance tests
        run: bun run test:performance

      - name: Upload performance results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: test-results/performance/

  frontend-tests:
    runs-on: ubuntu-latest
    needs: contract-tests

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'bun'

      - name: Install dependencies
        run: bun install

      - name: Run frontend component tests
        run: bun run test:frontend

      - name: Run integration tests
        run: bun run test:integration
```

### Test Result Reporting

```typescript
// tests/utils/test-reporting.ts
export class TestReporter {
  private results: TestResult[] = [];

  recordResult(result: TestResult) {
    this.results.push(result);
    this.reportToMonitoring(result);
  }

  generateReport() {
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.passed).length,
      failed: this.results.filter(r => !r.passed).length,
      coverage: this.calculateCoverage(),
      performance: this.calculatePerformanceMetrics()
    };

    return summary;
  }

  private reportToMonitoring(result: TestResult) {
    if (!result.passed) {
      // Send alert for failed tests
      fetch('/api/monitoring/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test_failure',
          test: result.testName,
          errors: result.errors,
          timestamp: new Date().toISOString()
        })
      });
    }
  }

  private calculateCoverage() {
    // Calculate code coverage metrics
    // Implementation would integrate with coverage tools
  }

  private calculatePerformanceMetrics() {
    // Calculate performance benchmarks
    // Implementation would analyze response times
  }
}
```

## Test Data Management

### Test Data Factory

```typescript
// tests/utils/test-data-factory.ts
export class TestDataFactory {
  private faker = new Faker();

  createUser(overrides: Partial<User> = {}): User {
    return {
      id: this.faker.string.uuid(),
      email: this.faker.internet.email(),
      full_name: this.faker.person.fullName(),
      avatar_url: this.faker.image.avatar(),
      created_at: this.faker.date.past().toISOString(),
      updated_at: this.faker.date.recent().toISOString(),
      ...overrides
    };
  }

  createPilarAssessment(userId: string, overrides: Partial<PilarAssessment> = {}): PilarAssessment {
    return {
      id: this.faker.string.uuid(),
      user_id: userId,
      pillar_id: this.faker.helpers.arrayElement(['divsexp', 'status', 'path', 'complex']),
      mode: this.faker.helpers.arrayElement(['egalitarian', 'hierarchical']),
      scores: {
        force1: this.faker.number.float({ min: 0, max: 10, precision: 0.1 }),
        force2: this.faker.number.float({ min: 0, max: 10, precision: 0.1 }),
        force3: this.faker.number.float({ min: 0, max: 10, precision: 0.1 })
      },
      forces_data: {
        psychological: {},
        social: {},
        institutional: {}
      },
      created_at: this.faker.date.past().toISOString(),
      updated_at: this.faker.date.recent().toISOString(),
      ...overrides
    };
  }

  createAssessmentSession(userId: string, overrides: Partial<AssessmentSession> = {}): AssessmentSession {
    return {
      id: this.faker.string.uuid(),
      user_id: userId,
      pillar_id: this.faker.helpers.arrayElement(['divsexp', 'status', 'path', 'complex']),
      mode: this.faker.helpers.arrayElement(['egalitarian', 'hierarchical']),
      stage: this.faker.helpers.arrayElement(['profile', 'assessment', 'results']),
      responses: {},
      results: {},
      started_at: this.faker.date.past().toISOString(),
      created_at: this.faker.date.past().toISOString(),
      updated_at: this.faker.date.recent().toISOString(),
      ...overrides
    };
  }
}
```

This comprehensive testing strategy ensures the Base44-to-REST migration maintains system reliability, performance, and data integrity throughout the transition.