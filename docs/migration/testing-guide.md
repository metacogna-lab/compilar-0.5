# Testing Guide: Migration Verification

This guide provides comprehensive testing strategies to verify the success of the Supabase to standalone Hono server migration.

## Testing Overview

### Testing Pyramid
```
End-to-End Tests (E2E)     ████████░░ 20%
Integration Tests          ██████████ 30%
Unit Tests                 ██████████ 40%
Database Tests             ████████░░ 10%
```

### Test Categories
- **Database Tests**: Schema integrity, data migration, query performance
- **Unit Tests**: Individual functions, API endpoints, business logic
- **Integration Tests**: API-to-database interactions, authentication flow
- **End-to-End Tests**: Complete user workflows, frontend integration

## Database Testing

### Schema Integrity Tests

#### Table Existence Verification
```sql
-- Verify all tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: 32 tables
-- Compare against: known_table_list
```

#### Column Structure Validation
```sql
-- Check table structure matches expectations
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pilar_assessments'
ORDER BY ordinal_position;
```

#### Foreign Key Constraints
```sql
-- Verify all foreign keys are intact
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

#### Index Verification
```sql
-- Check all expected indexes exist
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Data Migration Tests

#### Row Count Validation
```sql
-- Compare row counts between source and target
SELECT
    'user_profiles' as table_name,
    COUNT(*) as row_count
FROM user_profiles

UNION ALL

SELECT
    'pilar_assessments' as table_name,
    COUNT(*) as row_count
FROM pilar_assessments

-- Add all other tables...
ORDER BY table_name;
```

#### Data Integrity Checks
```sql
-- Verify foreign key relationships
SELECT 'Orphaned user_profiles' as issue, COUNT(*) as count
FROM user_profiles up
LEFT JOIN users u ON up.id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 'Orphaned pilar_assessments' as issue, COUNT(*) as count
FROM pilar_assessments pa
LEFT JOIN users u ON pa.user_id = u.id
WHERE u.id IS NULL

-- Add more integrity checks...
;
```

#### JSONB Data Validation
```sql
-- Validate JSONB structure in assessments
SELECT
    id,
    pillar_id,
    mode,
    jsonb_typeof(scores) as scores_type,
    jsonb_object_keys(scores) as score_keys
FROM pilar_assessments
WHERE jsonb_typeof(scores) != 'object'
   OR jsonb_object_keys(scores) = '{}';
```

### Performance Tests

#### Query Performance Benchmarking
```sql
-- Test common query patterns
EXPLAIN ANALYZE
SELECT * FROM pilar_assessments
WHERE user_id = 'test-user-id'
ORDER BY created_at DESC
LIMIT 10;

-- Expected: < 50ms execution time
```

#### Index Usage Analysis
```sql
-- Check if indexes are being used
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## Unit Testing

### API Endpoint Tests

#### Authentication Middleware
```typescript
// Test JWT token validation
describe('Authentication Middleware', () => {
  it('should accept valid JWT tokens', async () => {
    const token = generateTestToken();
    const response = await request(app)
      .get('/api/v1/entities/pilar-assessments')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it('should reject invalid tokens', async () => {
    const response = await request(app)
      .get('/api/v1/entities/pilar-assessments')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
});
```

#### CRUD Operations
```typescript
// Test entity CRUD operations
describe('PilarAssessment CRUD', () => {
  let testUserId: string;
  let testAssessmentId: string;

  beforeAll(async () => {
    testUserId = await createTestUser();
  });

  it('should create assessment', async () => {
    const assessmentData = {
      pillar_id: 'divsexp',
      mode: 'egalitarian',
      scores: { force1: 8.5, force2: 7.2 }
    };

    const response = await request(app)
      .post('/api/v1/entities/pilar-assessments')
      .set('Authorization', `Bearer ${getTestToken()}`)
      .send(assessmentData);

    expect(response.status).toBe(201);
    expect(response.body.pilar_assessment).toMatchObject(assessmentData);
    testAssessmentId = response.body.pilar_assessment.id;
  });

  it('should retrieve assessment', async () => {
    const response = await request(app)
      .get(`/api/v1/entities/pilar-assessments/${testAssessmentId}`)
      .set('Authorization', `Bearer ${getTestToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.pilar_assessment.id).toBe(testAssessmentId);
  });

  it('should update assessment', async () => {
    const updateData = { scores: { force1: 9.0, force2: 7.5 } };

    const response = await request(app)
      .put(`/api/v1/entities/pilar-assessments/${testAssessmentId}`)
      .set('Authorization', `Bearer ${getTestToken()}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.pilar_assessment.scores.force1).toBe(9.0);
  });

  it('should delete assessment', async () => {
    const response = await request(app)
      .delete(`/api/v1/entities/pilar-assessments/${testAssessmentId}`)
      .set('Authorization', `Bearer ${getTestToken()}`);

    expect(response.status).toBe(200);

    // Verify deletion
    const getResponse = await request(app)
      .get(`/api/v1/entities/pilar-assessments/${testAssessmentId}`)
      .set('Authorization', `Bearer ${getTestToken()}`);

    expect(getResponse.status).toBe(404);
  });
});
```

### Business Logic Tests

#### Authorization Logic
```typescript
describe('Authorization Logic', () => {
  it('should allow users to access their own data', async () => {
    const userId = 'test-user-id';
    const resourceId = 'test-assessment-id';

    const hasAccess = await checkUserOwnership(userId, resourceId, 'pilar_assessments');
    expect(hasAccess).toBe(true);
  });

  it('should deny access to other users data', async () => {
    const userId = 'different-user-id';
    const resourceId = 'test-assessment-id';

    const hasAccess = await checkUserOwnership(userId, resourceId, 'pilar_assessments');
    expect(hasAccess).toBe(false);
  });

  it('should allow team members to access team data', async () => {
    const userId = 'team-member-id';
    const teamId = 'test-team-id';

    const hasAccess = await checkTeamMembership(userId, teamId);
    expect(hasAccess).toBe(true);
  });
});
```

#### Data Validation Tests
```typescript
describe('Data Validation', () => {
  it('should validate PILAR assessment data', () => {
    const validData = {
      pillar_id: 'divsexp',
      mode: 'egalitarian',
      scores: { force1: 8.5, force2: 7.2 }
    };

    const result = pilarAssessmentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid pillar IDs', () => {
    const invalidData = {
      pillar_id: 'invalid_pillar',
      mode: 'egalitarian',
      scores: { force1: 8.5 }
    };

    const result = pilarAssessmentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate email format', () => {
    const validEmail = 'user@example.com';
    const invalidEmail = 'not-an-email';

    expect(emailSchema.safeParse(validEmail).success).toBe(true);
    expect(emailSchema.safeParse(invalidEmail).success).toBe(false);
  });
});
```

## Integration Testing

### API-to-Database Integration
```typescript
describe('API to Database Integration', () => {
  let dbConnection: Pool;

  beforeAll(async () => {
    dbConnection = new Pool(getTestDbConfig());
  });

  afterAll(async () => {
    await dbConnection.end();
  });

  it('should persist data correctly', async () => {
    // Create assessment via API
    const assessmentData = {
      pillar_id: 'divsexp',
      mode: 'egalitarian',
      scores: { force1: 8.5 }
    };

    const apiResponse = await request(app)
      .post('/api/v1/entities/pilar-assessments')
      .set('Authorization', `Bearer ${getTestToken()}`)
      .send(assessmentData);

    const assessmentId = apiResponse.body.pilar_assessment.id;

    // Verify in database
    const dbResult = await dbConnection.query(
      'SELECT * FROM pilar_assessments WHERE id = $1',
      [assessmentId]
    );

    expect(dbResult.rows[0]).toMatchObject({
      pillar_id: 'divsexp',
      mode: 'egalitarian',
      scores: { force1: 8.5 }
    });
  });

  it('should handle concurrent requests', async () => {
    const promises = Array(10).fill().map(() =>
      request(app)
        .post('/api/v1/entities/user-actions')
        .set('Authorization', `Bearer ${getTestToken()}`)
        .send({
          action_type: 'assessment_started',
          action_data: { pillar_id: 'divsexp' }
        })
    );

    const responses = await Promise.all(promises);
    responses.forEach(response => {
      expect(response.status).toBe(201);
    });
  });
});
```

### Authentication Flow Testing
```typescript
describe('Authentication Flow', () => {
  it('should complete full auth cycle', async () => {
    // Register user
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User'
      });

    expect(registerResponse.status).toBe(201);
    const token = registerResponse.body.token;

    // Access protected resource
    const protectedResponse = await request(app)
      .get('/api/v1/entities/user-profiles')
      .set('Authorization', `Bearer ${token}`);

    expect(protectedResponse.status).toBe(200);

    // Refresh token
    const refreshResponse = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refresh_token: registerResponse.body.refresh_token });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.token).toBeDefined();
  });
});
```

## End-to-End Testing

### Complete User Workflow
```typescript
describe('Complete Assessment Workflow', () => {
  let userToken: string;
  let sessionId: string;
  let assessmentId: string;

  beforeAll(async () => {
    // Setup test user and get token
    userToken = await setupTestUser();
  });

  it('should complete full assessment flow', async () => {
    // 1. Start assessment session
    const sessionResponse = await request(app)
      .post('/api/v1/entities/assessment-sessions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        pillar_id: 'divsexp',
        mode: 'egalitarian',
        stage: 'profile'
      });

    expect(sessionResponse.status).toBe(201);
    sessionId = sessionResponse.body.assessment_session.id;

    // 2. Update session with responses
    const updateResponse = await request(app)
      .put(`/api/v1/entities/assessment-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        responses: { question1: 'answer1', question2: 'answer2' },
        stage: 'quiz_active'
      });

    expect(updateResponse.status).toBe(200);

    // 3. Complete assessment
    const completeResponse = await request(app)
      .put(`/api/v1/entities/assessment-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        stage: 'results',
        completed_at: new Date().toISOString(),
        results: { score: 85, feedback: 'Good work!' }
      });

    expect(completeResponse.status).toBe(200);

    // 4. Create assessment record
    const assessmentResponse = await request(app)
      .post('/api/v1/entities/pilar-assessments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        pillar_id: 'divsexp',
        mode: 'egalitarian',
        scores: { force1: 8.5, force2: 7.2 },
        forces_data: { /* detailed force data */ }
      });

    expect(assessmentResponse.status).toBe(201);
    assessmentId = assessmentResponse.body.pilar_assessment.id;

    // 5. Verify assessment was created
    const verifyResponse = await request(app)
      .get(`/api/v1/entities/pilar-assessments/${assessmentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.pilar_assessment.scores.force1).toBe(8.5);
  });

  it('should handle AI coaching interaction', async () => {
    // Start coaching conversation
    const coachingResponse = await request(app)
      .post('/api/v1/ai/coach/conversation')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        message: 'What does my diversity expression score mean?',
        context: {
          pillar_id: 'divsexp',
          mode: 'egalitarian',
          assessment_id: assessmentId
        }
      });

    expect(coachingResponse.status).toBe(200);
    expect(coachingResponse.body.response).toBeDefined();
    expect(coachingResponse.body.conversation_id).toBeDefined();
  });
});
```

### Frontend Integration Testing
```typescript
describe('Frontend Integration', () => {
  it('should work with existing frontend code', async () => {
    // Mock the API client calls that frontend makes
    const mockApiClient = {
      getAssessments: jest.fn(),
      createAssessment: jest.fn(),
      updateSession: jest.fn()
    };

    // Simulate frontend workflow
    mockApiClient.createAssessment.mockResolvedValue({
      id: 'test-id',
      pillar_id: 'divsexp',
      scores: { force1: 8.5 }
    });

    // Test that frontend logic works with new API
    const result = await simulateFrontendWorkflow(mockApiClient);
    expect(result.success).toBe(true);
    expect(result.assessmentId).toBe('test-id');
  });
});
```

## Performance Testing

### Load Testing
```typescript
describe('Performance Tests', () => {
  it('should handle concurrent users', async () => {
    const concurrentUsers = 50;
    const requestsPerUser = 10;

    const startTime = Date.now();

    const promises = Array(concurrentUsers).fill().map(async (_, userIndex) => {
      const userToken = await getUserToken(userIndex);

      const userPromises = Array(requestsPerUser).fill().map(async () => {
        return request(app)
          .get('/api/v1/entities/pilar-assessments')
          .set('Authorization', `Bearer ${userToken}`);
      });

      return Promise.all(userPromises);
    });

    const results = await Promise.all(promises);
    const endTime = Date.now();

    const totalRequests = concurrentUsers * requestsPerUser;
    const totalTime = endTime - startTime;
    const avgResponseTime = totalTime / totalRequests;

    console.log(`Total requests: ${totalRequests}`);
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Average response time: ${avgResponseTime}ms`);

    // Assert performance requirements
    expect(avgResponseTime).toBeLessThan(200); // < 200ms average
    results.flat().forEach(response => {
      expect(response.status).toBe(200);
    });
  });

  it('should handle database load', async () => {
    // Test database query performance under load
    const queryCount = 1000;

    const startTime = Date.now();

    const promises = Array(queryCount).fill().map(() =>
      dbConnection.query('SELECT * FROM pilar_assessments LIMIT 10')
    );

    await Promise.all(promises);
    const endTime = Date.now();

    const totalTime = endTime - startTime;
    const avgQueryTime = totalTime / queryCount;

    console.log(`Average query time: ${avgQueryTime}ms`);
    expect(avgQueryTime).toBeLessThan(50); // < 50ms per query
  });
});
```

## Test Data Management

### Test Data Setup
```typescript
// Create test data factory
class TestDataFactory {
  static async createTestUser(overrides = {}) {
    const defaultUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'testpass123',
      full_name: 'Test User'
    };

    const userData = { ...defaultUser, ...overrides };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);

    return {
      id: response.body.user.id,
      token: response.body.token,
      ...userData
    };
  }

  static async createTestAssessment(userId: string, overrides = {}) {
    const defaultAssessment = {
      pillar_id: 'divsexp',
      mode: 'egalitarian',
      scores: { force1: 8.5, force2: 7.2 },
      forces_data: { /* mock force data */ }
    };

    const assessmentData = { ...defaultAssessment, ...overrides };

    const response = await request(app)
      .post('/api/v1/entities/pilar-assessments')
      .set('Authorization', `Bearer ${getTokenForUser(userId)}`)
      .send(assessmentData);

    return response.body.pilar_assessment;
  }
}
```

### Test Database Management
```typescript
// Test database utilities
class TestDatabase {
  static async setup() {
    // Create test database
    await dbConnection.query('CREATE DATABASE compilar_test');

    // Run migrations
    await runMigrations('compilar_test');

    // Seed test data
    await seedTestData();
  }

  static async teardown() {
    // Clean up test database
    await dbConnection.query('DROP DATABASE compilar_test');
  }

  static async reset() {
    // Reset all test data
    const tables = await dbConnection.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
    `);

    for (const { tablename } of tables.rows) {
      await dbConnection.query(`TRUNCATE TABLE ${tablename} CASCADE`);
    }

    await seedTestData();
  }
}
```

## Continuous Integration

### GitHub Actions Test Workflow
```yaml
name: Migration Tests
on: [push, pull_request]

jobs:
  test:
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

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Setup test database
        run: |
          psql -h localhost -U postgres -c 'CREATE DATABASE compilar_test;'

      - name: Run database migrations
        run: npm run db:migrate:test

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run performance tests
        run: npm run test:performance
```

## Test Reporting

### Coverage Requirements
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

### Test Results Dashboard
```typescript
// Generate test report
class TestReporter {
  static generateReport(results: TestResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        coverage: results.coverage
      },
      performance: {
        avgResponseTime: results.avgResponseTime,
        maxResponseTime: results.maxResponseTime,
        throughput: results.throughput
      },
      failures: results.failures.map(failure => ({
        test: failure.test,
        error: failure.error,
        stack: failure.stack
      }))
    };

    // Save to file or send to monitoring system
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    return report;
  }
}
```

## Migration Verification Checklist

### Pre-Migration Tests
- [ ] All Supabase functionality working
- [ ] Frontend integration tests passing
- [ ] Performance benchmarks established
- [ ] Data consistency verified

### Migration Tests
- [ ] Schema creation successful
- [ ] Data migration completed without errors
- [ ] Foreign key constraints intact
- [ ] Indexes created and functional
- [ ] Application starts without errors

### Post-Migration Tests
- [ ] All API endpoints functional
- [ ] Authentication working
- [ ] Authorization logic correct
- [ ] Performance meets requirements
- [ ] Data integrity maintained
- [ ] Frontend integration working

### Go-Live Checklist
- [ ] Full end-to-end test suite passing
- [ ] Performance testing completed
- [ ] Security audit passed
- [ ] Rollback plan documented and tested
- [ ] Monitoring and alerting configured
- [ ] Team trained on new system

This comprehensive testing strategy ensures the migration maintains system reliability while eliminating Supabase dependencies.