# Testing Guide: Base44-to-REST Migration

## Overview

This comprehensive testing guide ensures the successful migration from Base44 client API calls to well-formed REST endpoints. The testing strategy covers unit tests, integration tests, end-to-end tests, and performance tests to validate functionality, security, and performance throughout the migration.

## Testing Strategy

### Testing Pyramid

```
End-to-End Tests (10%)
  ↳ Integration Tests (20%)
    ↳ Unit Tests (70%)
```

### Test Categories

**Unit Tests:** Individual functions, components, and API endpoints
**Integration Tests:** API-to-API interactions and data flow
**End-to-End Tests:** Complete user workflows
**Performance Tests:** Load testing and performance validation
**Security Tests:** Authentication, authorization, and vulnerability testing

## Unit Testing

### API Contract Testing

**Contract Validation Tests:**
```javascript
// tests/contracts/api-contracts.test.js
import { apiContracts } from '../contracts';
import { createTestServer } from '../helpers/test-server';

describe('API Contracts', () => {
  let server;
  let testUser;

  beforeAll(async () => {
    server = await createTestServer();
    testUser = await server.createTestUser();
  });

  afterAll(async () => {
    await server.cleanup();
  });

  describe('Authentication Contracts', () => {
    test('login contract validation', async () => {
      const request = {
        email: 'test@example.com',
        password: 'ValidPass123!'
      };

      // Validate request against schema
      const validation = apiContracts.auth.login.request.validate(request);
      expect(validation.valid).toBe(true);

      // Make API call
      const response = await server.request('POST', '/auth/login', request);

      // Validate response against schema
      const responseValidation = apiContracts.auth.login.response.validate(response);
      expect(responseValidation.valid).toBe(true);

      // Validate response structure
      expect(response).toHaveProperty('data.user');
      expect(response).toHaveProperty('data.token');
      expect(response.data.user.email).toBe(request.email);
    });

    test('login contract error handling', async () => {
      const invalidRequest = {
        email: 'invalid-email',
        password: 'short'
      };

      const response = await server.request('POST', '/auth/login', invalidRequest);

      expect(response.status).toBe(400);
      expect(response.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Entity CRUD Contracts', () => {
    test('assessment CRUD operations', async () => {
      const assessmentData = {
        pillar_id: 'divsexp',
        mode: 'egalitarian',
        scores: { force1: 8.5, force2: 7.2 }
      };

      // Test CREATE
      const createResponse = await server.request(
        'POST',
        '/entities/pilar-assessments',
        assessmentData,
        testUser.token
      );

      expect(createResponse.status).toBe(201);
      const createdAssessment = createResponse.data.pilar_assessment;
      expect(createdAssessment.pillar_id).toBe(assessmentData.pillar_id);

      // Test READ
      const readResponse = await server.request(
        'GET',
        `/entities/pilar-assessments/${createdAssessment.id}`,
        null,
        testUser.token
      );

      expect(readResponse.status).toBe(200);
      expect(readResponse.data.pilar_assessment.id).toBe(createdAssessment.id);

      // Test UPDATE
      const updateData = { scores: { force1: 9.0, force2: 8.0 } };
      const updateResponse = await server.request(
        'PUT',
        `/entities/pilar-assessments/${createdAssessment.id}`,
        updateData,
        testUser.token
      );

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.pilar_assessment.scores.force1).toBe(9.0);

      // Test DELETE
      const deleteResponse = await server.request(
        'DELETE',
        `/entities/pilar-assessments/${createdAssessment.id}`,
        null,
        testUser.token
      );

      expect(deleteResponse.status).toBe(200);

      // Verify deletion
      const verifyResponse = await server.request(
        'GET',
        `/entities/pilar-assessments/${createdAssessment.id}`,
        null,
        testUser.token
      );

      expect(verifyResponse.status).toBe(404);
    });
  });
});
```

### Component Testing

**Frontend Component Tests:**
```javascript
// tests/components/AssessmentCard.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { AssessmentCard } from '../../src/components/assess/AssessmentCard';
import { createMockAPI } from '../mocks/api';

describe('AssessmentCard', () => {
  const mockAPI = createMockAPI();
  const mockAssessment = {
    id: 'test-assessment-id',
    pillar_id: 'divsexp',
    mode: 'egalitarian',
    scores: { force1: 8.5, force2: 7.2 },
    created_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    mockAPI.getAssessment.mockResolvedValue(mockAssessment);
  });

  test('renders assessment data correctly', async () => {
    render(<AssessmentCard assessmentId={mockAssessment.id} />, {
      wrapper: ({ children }) => (
        <APIProvider api={mockAPI}>{children}</APIProvider>
      )
    });

    await waitFor(() => {
      expect(screen.getByText('Diversity Expression')).toBeInTheDocument();
      expect(screen.getByText('Egalitarian')).toBeInTheDocument();
      expect(screen.getByText('8.5')).toBeInTheDocument();
    });
  });

  test('handles loading state', () => {
    mockAPI.getAssessment.mockImplementation(() => new Promise(() => {}));

    render(<AssessmentCard assessmentId={mockAssessment.id} />, {
      wrapper: ({ children }) => (
        <APIProvider api={mockAPI}>{children}</APIProvider>
      )
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('handles error state', async () => {
    mockAPI.getAssessment.mockRejectedValue(new Error('API Error'));

    render(<AssessmentCard assessmentId={mockAssessment.id} />, {
      wrapper: ({ children }) => (
        <APIProvider api={mockAPI}>{children}</APIProvider>
      )
    });

    await waitFor(() => {
      expect(screen.getByText('Error loading assessment')).toBeInTheDocument();
    });
  });
});
```

### Migration Compatibility Testing

**Compatibility Layer Tests:**
```javascript
// tests/migration/compatibility.test.js
import { base44 } from '../../src/api/base44Client';
import { createMockBase44API, createMockRestAPI } from '../mocks';

describe('Migration Compatibility Layer', () => {
  describe('Entity Wrapper', () => {
    test('routes to Supabase when enabled', async () => {
      process.env.USE_SUPABASE = 'true';

      const mockSupabaseAPI = createMockRestAPI();
      const mockBase44API = createMockBase44API();

      // Mock the entities
      jest.mock('../../src/api/supabaseEntities', () => ({
        PilarAssessment: mockSupabaseAPI
      }));

      jest.mock('../../src/api/base44Client', () => ({
        PilarAssessment: mockBase44API
      }));

      const result = await base44.entities.PilarAssessment.list();

      expect(mockSupabaseAPI.list).toHaveBeenCalled();
      expect(mockBase44API.list).not.toHaveBeenCalled();
    });

    test('routes to Base44 when disabled', async () => {
      process.env.USE_SUPABASE = 'false';

      const mockSupabaseAPI = createMockRestAPI();
      const mockBase44API = createMockBase44API();

      const result = await base44.entities.PilarAssessment.list();

      expect(mockBase44API.list).toHaveBeenCalled();
      expect(mockSupabaseAPI.list).not.toHaveBeenCalled();
    });
  });

  describe('Function Wrapper', () => {
    test('gradually migrates functions', async () => {
      // Initially uses Base44
      const result1 = await base44.functions.generateAICoaching({});
      expect(result1.source).toBe('base44');

      // Enable Supabase for this function
      base44.migrationUtils.enableSupabaseForFunction('generateAICoaching');

      // Now uses Supabase
      const result2 = await base44.functions.generateAICoaching({});
      expect(result2.source).toBe('supabase');
    });
  });
});
```

## Integration Testing

### API Integration Tests

**End-to-End API Workflows:**
```javascript
// tests/integration/assessment-workflow.test.js
import { createTestServer } from '../helpers/test-server';
import { createTestUser } from '../helpers/test-user';

describe('Assessment Workflow Integration', () => {
  let server;
  let user;
  let token;

  beforeAll(async () => {
    server = await createTestServer();
    user = await createTestUser(server);
    token = await server.authenticateUser(user);
  });

  afterAll(async () => {
    await server.cleanup();
  });

  test('complete assessment workflow', async () => {
    // 1. Create assessment
    const createResponse = await server.request('POST', '/assessments', {
      pillar_id: 'divsexp',
      mode: 'egalitarian'
    }, token);

    expect(createResponse.status).toBe(201);
    const assessment = createResponse.data.assessment;

    // 2. Start assessment session
    const sessionResponse = await server.request('POST', '/assessments', {
      pillar_id: 'divsexp',
      mode: 'egalitarian'
    }, token);

    expect(sessionResponse.status).toBe(201);
    const session = sessionResponse.data.assessment;

    // 3. Submit answers
    const questions = await server.request('GET', `/assessments/${assessment.id}/questions`, null, token);
    expect(questions.status).toBe(200);

    for (const question of questions.data.questions) {
      const answerResponse = await server.request('POST', `/assessments/${assessment.id}/answers`, {
        question_id: question.id,
        answer: 8 // Sample answer
      }, token);

      expect(answerResponse.status).toBe(200);
    }

    // 4. Complete assessment
    const completeResponse = await server.request('POST', `/assessments/${assessment.id}/complete`, {}, token);
    expect(completeResponse.status).toBe(200);

    // 5. Verify results
    const resultsResponse = await server.request('GET', `/assessments/${assessment.id}`, null, token);
    expect(resultsResponse.status).toBe(200);
    expect(resultsResponse.data.assessment.scores).toBeDefined();
    expect(resultsResponse.data.assessment.completed_at).toBeDefined();

    // 6. Generate coaching
    const coachingResponse = await server.request('POST', '/ai/coaching', {
      assessmentId: assessment.id,
      pillar: 'divsexp',
      mode: 'egalitarian'
    }, token);

    expect(coachingResponse.status).toBe(200);
    expect(coachingResponse.data.coaching).toBeDefined();
  });

  test('team collaboration workflow', async () => {
    // Create team
    const teamResponse = await server.request('POST', '/entities/teams', {
      team_name: 'Test Team',
      description: 'Integration test team'
    }, token);

    expect(teamResponse.status).toBe(201);
    const team = teamResponse.data.team;

    // Invite member
    const inviteResponse = await server.request('POST', `/entities/teams/${team.id}/invitations`, {
      email: 'member@example.com',
      role: 'member'
    }, token);

    expect(inviteResponse.status).toBe(201);

    // Create team assessment
    const teamAssessmentResponse = await server.request('POST', '/assessments', {
      pillar_id: 'divsexp',
      mode: 'egalitarian',
      team_id: team.id
    }, token);

    expect(teamAssessmentResponse.status).toBe(201);

    // Verify team analytics
    const analyticsResponse = await server.request('GET', `/teams/${team.id}/analytics`, null, token);
    expect(analyticsResponse.status).toBe(200);
  });
});
```

### Database Integration Tests

**Data Consistency Tests:**
```javascript
// tests/integration/database-consistency.test.js
import { createTestDatabase } from '../helpers/test-database';

describe('Database Integration', () => {
  let db;

  beforeAll(async () => {
    db = await createTestDatabase();
  });

  afterAll(async () => {
    await db.cleanup();
  });

  test('foreign key constraints', async () => {
    // Try to create assessment with invalid user_id
    await expect(
      db.query('INSERT INTO pilar_assessments (user_id, pillar_id, mode) VALUES ($1, $2, $3)', [
        'invalid-user-id',
        'divsexp',
        'egalitarian'
      ])
    ).rejects.toThrow('foreign key constraint');

    // Create valid assessment
    const user = await db.createTestUser();
    const result = await db.query('INSERT INTO pilar_assessments (user_id, pillar_id, mode) VALUES ($1, $2, $3) RETURNING id', [
      user.id,
      'divsexp',
      'egalitarian'
    ]);

    expect(result.rows[0].id).toBeDefined();
  });

  test('data integrity triggers', async () => {
    const user = await db.createTestUser();

    // Insert assessment
    await db.query('INSERT INTO pilar_assessments (user_id, pillar_id, mode, scores) VALUES ($1, $2, $3, $4)', [
      user.id,
      'divsexp',
      'egalitarian',
      JSON.stringify({ force1: 8.5 })
    ]);

    // Verify updated_at trigger
    const assessment = await db.query('SELECT updated_at FROM pilar_assessments WHERE user_id = $1', [user.id]);
    expect(assessment.rows[0].updated_at).toBeDefined();
  });

  test('user isolation', async () => {
    const user1 = await db.createTestUser();
    const user2 = await db.createTestUser();

    // User1 creates assessment
    await db.query('INSERT INTO pilar_assessments (user_id, pillar_id, mode) VALUES ($1, $2, $3)', [
      user1.id,
      'divsexp',
      'egalitarian'
    ]);

    // User2 should not see User1's assessment
    const user2Assessments = await db.query('SELECT * FROM pilar_assessments WHERE user_id = $1', [user2.id]);
    expect(user2Assessments.rows).toHaveLength(0);

    // User1 should see their assessment
    const user1Assessments = await db.query('SELECT * FROM pilar_assessments WHERE user_id = $1', [user1.id]);
    expect(user1Assessments.rows).toHaveLength(1);
  });
});
```

## End-to-End Testing

### User Workflow Tests

**Complete User Journey:**
```javascript
// tests/e2e/user-journey.test.js
import { createTestBrowser } from '../helpers/test-browser';

describe('User Journey E2E', () => {
  let browser;

  beforeAll(async () => {
    browser = await createTestBrowser();
  });

  afterAll(async () => {
    await browser.cleanup();
  });

  test('complete assessment journey', async () => {
    const page = await browser.newPage();

    // 1. User registration
    await page.goto('/register');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'ValidPass123!');
    await page.fill('[data-testid="confirm-password"]', 'ValidPass123!');
    await page.click('[data-testid="register-button"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');

    // 2. Start assessment
    await page.click('[data-testid="start-assessment"]');
    await page.selectOption('[data-testid="pillar-select"]', 'divsexp');
    await page.selectOption('[data-testid="mode-select"]', 'egalitarian');
    await page.click('[data-testid="begin-assessment"]');

    // 3. Complete assessment questions
    const questions = await page.$$('[data-testid="question"]');
    for (const question of questions) {
      await question.fill('[data-testid="answer-input"]', '8');
      await question.click('[data-testid="next-question"]');
    }

    // 4. View results
    await page.waitForSelector('[data-testid="assessment-results"]');
    const scores = await page.$$('[data-testid="force-score"]');
    expect(scores).toHaveLength(2); // Should have 2 force scores

    // 5. Access coaching
    await page.click('[data-testid="get-coaching"]');
    await page.waitForSelector('[data-testid="coaching-response"]');
    const coachingText = await page.textContent('[data-testid="coaching-content"]');
    expect(coachingText.length).toBeGreaterThan(0);

    // 6. Create team
    await page.goto('/teams');
    await page.click('[data-testid="create-team"]');
    await page.fill('[data-testid="team-name"]', 'Test Team');
    await page.fill('[data-testid="team-description"]', 'E2E test team');
    await page.click('[data-testid="save-team"]');

    // Verify team creation
    await page.waitForSelector('[data-testid="team-card"]');
    const teamName = await page.textContent('[data-testid="team-name-display"]');
    expect(teamName).toBe('Test Team');
  });

  test('team collaboration journey', async () => {
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();

    // User 1 creates team
    await page1.goto('/login');
    await page1.fill('[data-testid="email"]', 'user1@example.com');
    await page1.fill('[data-testid="password"]', 'password123');
    await page1.click('[data-testid="login-button"]');

    await page1.goto('/teams');
    await page1.click('[data-testid="create-team"]');
    await page1.fill('[data-testid="team-name"]', 'Collaboration Team');
    await page1.click('[data-testid="save-team"]');

    // User 2 joins team
    await page2.goto('/login');
    await page2.fill('[data-testid="email"]', 'user2@example.com');
    await page2.fill('[data-testid="password"]', 'password123');
    await page2.click('[data-testid="login-button"]');

    // Accept invitation (assuming email invitation system)
    await page2.goto('/teams');
    await page2.click('[data-testid="join-team-Collaboration Team"]');

    // Both users should see the team
    await page1.waitForSelector('[data-testid="team-member-user2"]');
    await page2.waitForSelector('[data-testid="team-member-user1"]');

    // User 1 creates team assessment
    await page1.click('[data-testid="create-team-assessment"]');
    await page1.selectOption('[data-testid="pillar-select"]', 'divsexp');
    await page1.click('[data-testid="start-assessment"]');

    // User 2 should see the team assessment
    await page2.waitForSelector('[data-testid="team-assessment-available"]');
  });
});
```

### Migration Compatibility Tests

**Backward Compatibility Tests:**
```javascript
// tests/e2e/migration-compatibility.test.js
describe('Migration Compatibility E2E', () => {
  test('frontend works during migration', async () => {
    const page = await browser.newPage();

    // Set migration flags to mix old and new
    await page.evaluateOnNewDocument(() => {
      window.MIGRATION_FLAGS = {
        USE_REST_API: true,
        ENTITIES_REST: ['user_profiles'],
        ENTITIES_BASE44: ['pilar_assessments'],
        FUNCTIONS_REST: ['generateAICoaching'],
        FUNCTIONS_BASE44: ['pilarRagQuery']
      };
    });

    // User journey should work seamlessly
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await page.waitForURL('/dashboard');

    // Profile loads from REST API
    const profileName = await page.textContent('[data-testid="user-name"]');
    expect(profileName).toBeDefined();

    // Assessment loads from Base44 (during migration)
    await page.click('[data-testid="view-assessments"]');
    await page.waitForSelector('[data-testid="assessment-list"]');

    // Coaching uses REST API
    await page.click('[data-testid="get-coaching"]');
    await page.waitForSelector('[data-testid="coaching-response"]');
  });

  test('gradual migration validation', async () => {
    // Start with all Base44
    let flags = { USE_REST_API: false };

    // Verify all functionality works
    await runUserJourneyTest(flags);

    // Migrate user profiles to REST
    flags.ENTITIES_REST = ['user_profiles'];
    await runUserJourneyTest(flags);

    // Migrate assessments to REST
    flags.ENTITIES_REST = ['user_profiles', 'pilar_assessments'];
    await runUserJourneyTest(flags);

    // Migrate all entities
    flags.USE_REST_API = true;
    flags.ENTITIES_BASE44 = [];
    await runUserJourneyTest(flags);
  });
});
```

## Performance Testing

### Load Testing

**API Load Tests:**
```javascript
// tests/performance/api-load.test.js
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

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001/api/v1';

export default function () {
  const params = {
    headers: {
      'Authorization': `Bearer ${__ENV.TEST_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  // Test assessment listing
  const listResponse = http.get(`${BASE_URL}/assessments`, params);
  check(listResponse, {
    'assessment list status is 200': (r) => r.status === 200,
    'assessment list response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Test assessment creation
  const createResponse = http.post(`${BASE_URL}/assessments`, JSON.stringify({
    pillar_id: 'divsexp',
    mode: 'egalitarian'
  }), params);

  check(createResponse, {
    'assessment create status is 201': (r) => r.status === 201,
    'assessment create response time < 300ms': (r) => r.timings.duration < 300,
  });

  // Test AI coaching (expensive operation)
  const coachingResponse = http.post(`${BASE_URL}/ai/coaching`, JSON.stringify({
    assessmentId: 'test-assessment-id',
    pillar: 'divsexp',
    mode: 'egalitarian'
  }), params);

  check(coachingResponse, {
    'coaching status is 200': (r) => r.status === 200,
    'coaching response time < 2000ms': (r) => r.timings.duration < 2000,
  });
}
```

### Database Performance Tests

**Query Performance Tests:**
```javascript
// tests/performance/database-performance.test.js
import { createTestDatabase } from '../helpers/test-database';

describe('Database Performance', () => {
  let db;

  beforeAll(async () => {
    db = await createTestDatabase();
    // Seed with test data
    await db.seedUsers(1000);
    await db.seedAssessments(5000);
  });

  afterAll(async () => {
    await db.cleanup();
  });

  test('assessment queries perform well', async () => {
    const users = await db.getTestUsers(100);

    const startTime = Date.now();

    // Test concurrent queries
    const promises = users.map(user =>
      db.query('SELECT * FROM pilar_assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [user.id])
    );

    const results = await Promise.all(promises);
    const endTime = Date.now();

    const avgQueryTime = (endTime - startTime) / users.length;

    expect(avgQueryTime).toBeLessThan(50); // Should be under 50ms per query
    expect(results.every(r => r.rows.length >= 0)).toBe(true);
  });

  test('complex analytics queries', async () => {
    const startTime = Date.now();

    // Complex analytics query
    const result = await db.query(`
      SELECT
        pillar_id,
        mode,
        AVG((scores->>'force1')::float) as avg_force1,
        COUNT(*) as assessment_count
      FROM pilar_assessments
      WHERE created_at > $1
      GROUP BY pillar_id, mode
      ORDER BY assessment_count DESC
    `, [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]); // Last 30 days

    const queryTime = Date.now() - startTime;

    expect(queryTime).toBeLessThan(200); // Should complete within 200ms
    expect(result.rows.length).toBeGreaterThan(0);
  });

  test('concurrent user sessions', async () => {
    const concurrentUsers = 50;
    const operationsPerUser = 10;

    const startTime = Date.now();

    const promises = Array(concurrentUsers).fill().map(async (_, i) => {
      const user = await db.getTestUser(i);

      const userPromises = Array(operationsPerUser).fill().map(async () => {
        // Mix of read and write operations
        const operation = Math.random();

        if (operation < 0.7) {
          // Read operation
          return db.query('SELECT * FROM pilar_assessments WHERE user_id = $1 LIMIT 5', [user.id]);
        } else {
          // Write operation
          return db.query(`
            INSERT INTO user_analytics (user_id, event_type, event_data)
            VALUES ($1, $2, $3)
          `, [user.id, 'test_event', { test: true }]);
        }
      });

      return Promise.all(userPromises);
    });

    await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    const avgOperationTime = totalTime / (concurrentUsers * operationsPerUser);

    expect(avgOperationTime).toBeLessThan(100); // Under 100ms per operation
  });
});
```

### Memory and Resource Testing

**Memory Leak Tests:**
```javascript
// tests/performance/memory-leak.test.js
import { createTestServer } from '../helpers/test-server';

describe('Memory Leak Tests', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.cleanup();
  });

  test('no memory leaks in assessment workflow', async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // Run assessment workflow multiple times
    for (let i = 0; i < 100; i++) {
      const user = await server.createTestUser();
      const token = await server.authenticateUser(user);

      // Complete assessment workflow
      const assessment = await server.createAssessment(token, {
        pillar_id: 'divsexp',
        mode: 'egalitarian'
      });

      await server.completeAssessment(token, assessment.id);
      await server.generateCoaching(token, assessment.id);
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Allow for some memory increase but not excessive
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
  });

  test('connection pool stability', async () => {
    const initialConnections = await server.getConnectionCount();

    // Simulate high concurrent load
    const promises = Array(100).fill().map(async () => {
      const user = await server.createTestUser();
      const token = await server.authenticateUser(user);

      for (let i = 0; i < 10; i++) {
        await server.request('GET', '/assessments', null, token);
      }
    });

    await Promise.all(promises);

    const finalConnections = await server.getConnectionCount();

    // Connection pool should be stable
    expect(finalConnections).toBeLessThan(initialConnections + 10); // Allow some growth but not excessive
  });
});
```

## Security Testing

### Authentication & Authorization Tests

**Security Test Suite:**
```javascript
// tests/security/auth-security.test.js
describe('Authentication Security', () => {
  test('prevents brute force attacks', async () => {
    const server = await createTestServer();

    // Attempt multiple failed logins
    for (let i = 0; i < 10; i++) {
      const response = await server.request('POST', '/auth/login', {
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      if (i < 5) {
        expect(response.status).toBe(401);
      } else {
        expect(response.status).toBe(429); // Rate limited
      }
    }
  });

  test('validates JWT tokens properly', async () => {
    const server = await createTestServer();
    const user = await server.createTestUser();

    // Get valid token
    const loginResponse = await server.request('POST', '/auth/login', {
      email: user.email,
      password: 'password123'
    });

    const validToken = loginResponse.data.token;

    // Test valid token
    const validResponse = await server.request('GET', '/auth/me', null, validToken);
    expect(validResponse.status).toBe(200);

    // Test expired token
    const expiredToken = createExpiredToken();
    const expiredResponse = await server.request('GET', '/auth/me', null, expiredToken);
    expect(expiredResponse.status).toBe(401);

    // Test tampered token
    const tamperedToken = validToken.slice(0, -5) + 'xxxxx';
    const tamperedResponse = await server.request('GET', '/auth/me', null, tamperedToken);
    expect(tamperedResponse.status).toBe(401);
  });

  test('enforces proper authorization', async () => {
    const server = await createTestServer();
    const user1 = await server.createTestUser();
    const user2 = await server.createTestUser();

    const token1 = await server.authenticateUser(user1);
    const token2 = await server.authenticateUser(user2);

    // User1 creates assessment
    const assessment = await server.createAssessment(token1, {
      pillar_id: 'divsexp',
      mode: 'egalitarian'
    });

    // User2 tries to access User1's assessment
    const accessResponse = await server.request('GET', `/assessments/${assessment.id}`, null, token2);
    expect(accessResponse.status).toBe(403);

    // User1 can access their own assessment
    const ownAccessResponse = await server.request('GET', `/assessments/${assessment.id}`, null, token1);
    expect(ownAccessResponse.status).toBe(200);
  });
});
```

### Input Validation & Injection Tests

**Security Validation Tests:**
```javascript
// tests/security/input-validation.test.js
describe('Input Validation Security', () => {
  test('prevents SQL injection', async () => {
    const server = await createTestServer();
    const user = await server.createTestUser();
    const token = await server.authenticateUser(user);

    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; SELECT * FROM users; --",
      "<script>alert('xss')</script>",
      "../../../etc/passwd",
      "javascript:alert('xss')"
    ];

    for (const input of maliciousInputs) {
      // Test in various endpoints
      const responses = await Promise.all([
        server.request('POST', '/assessments', { pillar_id: input }, token),
        server.request('POST', '/ai/rag/query', { query: input }, token),
        server.request('POST', '/entities/cms-content', { title: input }, token)
      ]);

      // All should either validate or sanitize input
      responses.forEach(response => {
        expect([200, 201, 400]).toContain(response.status);
        if (response.status === 400) {
          expect(response.error.code).toBe('VALIDATION_ERROR');
        }
      });
    }
  });

  test('validates file uploads securely', async () => {
    const server = await createTestServer();
    const user = await server.createTestUser();
    const token = await server.authenticateUser(user);

    // Test malicious file uploads
    const maliciousFiles = [
      { name: 'malicious.exe', type: 'application/x-msdownload' },
      { name: 'script.php', type: 'application/x-php' },
      { name: 'large-file.jpg', size: 100 * 1024 * 1024 }, // 100MB
      { name: '../../../etc/passwd', type: 'text/plain' }
    ];

    for (const file of maliciousFiles) {
      const formData = new FormData();
      formData.append('file', new File(['test'], file.name, { type: file.type }));
      formData.append('category', 'content');

      const response = await server.request('POST', '/files/upload', formData, token, {
        'Content-Type': 'multipart/form-data'
      });

      expect(response.status).toBe(400);
      expect(response.error.code).toBe('VALIDATION_ERROR');
    }

    // Test valid file upload
    const validFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const validFormData = new FormData();
    validFormData.append('file', validFile);
    validFormData.append('category', 'avatar');

    const validResponse = await server.request('POST', '/files/upload', validFormData, token, {
      'Content-Type': 'multipart/form-data'
    });

    expect(validResponse.status).toBe(200);
    expect(validResponse.data.fileId).toBeDefined();
  });
});
```

## Test Automation & CI/CD

### Test Automation Pipeline

**GitHub Actions Workflow:**
```yaml
# .github/workflows/test-migration.yml
name: Migration Tests

on:
  push:
    branches: [ feat/base44-migration-docs ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run contract tests
        run: npm run test:contracts

  integration-tests:
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
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npm run db:migrate:test

      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install

      - name: Run E2E tests
        run: npm run test:e2e

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run k6 load tests
        uses: grafana/k6-action@v0.2.0
        with:
          filename: tests/performance/api-load.test.js
          flags: --out json=results.json

      - name: Upload performance results
        uses: actions/upload-artifact@v3
        with:
          name: k6-results
          path: results.json

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run security tests
        run: npm run test:security

      - name: Run OWASP ZAP scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'http://localhost:3001'
          rules_file_name: '.zap/rules.tsv'
          artifact_name: 'zap-scan'

  migration-compatibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run migration compatibility tests
        run: npm run test:migration
```

### Test Data Management

**Test Data Factory:**
```javascript
// tests/helpers/test-data-factory.js
export class TestDataFactory {
  constructor(db) {
    this.db = db;
  }

  async createUser(overrides = {}) {
    const defaultUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'hashed_password',
      full_name: 'Test User',
      created_at: new Date(),
      updated_at: new Date()
    };

    const userData = { ...defaultUser, ...overrides };
    const result = await this.db.query(`
      INSERT INTO users (email, password, full_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      userData.email,
      userData.password,
      userData.full_name,
      userData.created_at,
      userData.updated_at
    ]);

    return result.rows[0];
  }

  async createAssessment(userId, overrides = {}) {
    const defaultAssessment = {
      user_id: userId,
      pillar_id: 'divsexp',
      mode: 'egalitarian',
      scores: { force1: 8.5, force2: 7.2 },
      forces_data: {},
      created_at: new Date(),
      updated_at: new Date()
    };

    const assessmentData = { ...defaultAssessment, ...overrides };
    const result = await this.db.query(`
      INSERT INTO pilar_assessments (user_id, pillar_id, mode, scores, forces_data, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      assessmentData.user_id,
      assessmentData.pillar_id,
      assessmentData.mode,
      JSON.stringify(assessmentData.scores),
      JSON.stringify(assessmentData.forces_data),
      assessmentData.created_at,
      assessmentData.updated_at
    ]);

    return result.rows[0];
  }

  async createTeam(ownerId, overrides = {}) {
    const defaultTeam = {
      team_name: `Test Team ${Date.now()}`,
      description: 'Test team description',
      owner_id: ownerId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const teamData = { ...defaultTeam, ...overrides };
    const result = await this.db.query(`
      INSERT INTO teams (team_name, description, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      teamData.team_name,
      teamData.description,
      teamData.owner_id,
      teamData.created_at,
      teamData.updated_at
    ]);

    return result.rows[0];
  }
}
```

This comprehensive testing guide ensures that the migration from Base44 to REST endpoints is thoroughly validated at every level, from individual functions to complete user workflows, with proper security, performance, and compatibility testing.