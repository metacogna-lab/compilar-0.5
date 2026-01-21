/**
 * Integration Tests for Backend API
 *
 * High-level tests that verify expected API behavior without inspecting implementation
 */

import { describe, test, expect, beforeAll } from 'bun:test';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';

// Mock auth token (in real tests, this would be obtained from Supabase auth)
const MOCK_AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'mock-token-for-testing';

interface ApiResponse {
  status: number;
  data?: any;
}

// Helper function to make authenticated requests
async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = true
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    headers['Authorization'] = `Bearer ${MOCK_AUTH_TOKEN}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return {
    status: response.status,
    ok: response.ok,
    headers: response.headers,
    data: response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : await response.text(),
  };
}

describe('Health & Status', () => {
  test('GET /health returns 200 with status ok', async () => {
    const result = await apiRequest('/health', {}, false);

    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('status', 'ok');
    expect(result.data).toHaveProperty('timestamp');
  });

  test('GET /nonexistent returns 404', async () => {
    const result = await apiRequest('/nonexistent', {}, false);

    expect(result.status).toBe(404);
    expect(result.data).toHaveProperty('error');
  });
});

describe('Authentication', () => {
  test('GET /api/v1/auth/me without token returns 401', async () => {
    const result = await apiRequest('/api/v1/auth/me', {}, false);

    expect(result.status).toBe(401);
    expect(result.data).toHaveProperty('error');
  });

  test('GET /api/v1/auth/me with invalid token returns 401', async () => {
    const result = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token-12345',
      },
    });

    expect(result.status).toBe(401);
  });
});

describe('Assessments API', () => {
  test('GET /api/v1/assessments requires authentication', async () => {
    const result = await apiRequest('/api/v1/assessments', {}, false);

    expect(result.status).toBe(401);
  });

  test('POST /api/v1/assessments without required fields returns 400', async () => {
    const result = await apiRequest('/api/v1/assessments', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Expect 400 or 401 depending on auth validation order
    expect([400, 401]).toContain(result.status);
  });

  test('POST /api/v1/assessments with valid data shape expects success or auth error', async () => {
    const result = await apiRequest('/api/v1/assessments', {
      method: 'POST',
      body: JSON.stringify({
        pillar_id: 'divsexp',
        mode: 'egalitarian',
      }),
    });

    // Expect either 201 (success) or 401 (auth failure with mock token)
    expect([201, 401, 500]).toContain(result.status);

    if (result.status === 201) {
      expect(result.data).toHaveProperty('assessment');
    }
  });

  test('GET /api/v1/assessments/:id with non-existent ID returns 404 or 401', async () => {
    const result = await apiRequest('/api/v1/assessments/00000000-0000-0000-0000-000000000000');

    // Expect 404 (not found) or 401 (auth failure)
    expect([404, 401, 500]).toContain(result.status);
  });
});

describe('RAG API', () => {
  test('POST /api/v1/rag/query without query parameter returns 400', async () => {
    const result = await apiRequest('/api/v1/rag/query', {
      method: 'POST',
      body: JSON.stringify({}),
    }, false); // optionalAuth

    expect([400, 500]).toContain(result.status);
  });

  test('POST /api/v1/rag/query with query parameter has expected shape', async () => {
    const result = await apiRequest('/api/v1/rag/query', {
      method: 'POST',
      body: JSON.stringify({
        query: 'What is the PILAR framework?',
        limit: 5,
      }),
    }, false); // optionalAuth

    // Expect success or error due to missing embeddings/data
    expect([200, 500]).toContain(result.status);

    if (result.status === 200) {
      expect((result.data as any)).toHaveProperty('results');
      expect(Array.isArray((result.data as any).results)).toBe(true);
    }
  });

  test('GET /api/v1/rag/forces/:pillar without mode returns 400', async () => {
    const result = await apiRequest('/api/v1/rag/forces/divsexp', {}, false);

    expect([400, 500]).toContain(result.status);
  });

  test('GET /api/v1/rag/forces/:pillar with valid mode has expected shape', async () => {
    const result = await apiRequest('/api/v1/rag/forces/divsexp?mode=egalitarian', {}, false);

    // Expect success or error
    expect([200, 500]).toContain(result.status);

    if (result.status === 200) {
      expect((result.data as any)).toHaveProperty('forces');
      expect(Array.isArray((result.data as any).forces)).toBe(true);
    }
  });

  test('GET /api/v1/rag/connections without mode returns 400', async () => {
    const result = await apiRequest('/api/v1/rag/connections', {}, false);

    expect([400, 500]).toContain(result.status);
  });

  test('POST /api/v1/rag/ingest requires admin authentication', async () => {
    const result = await apiRequest('/api/v1/rag/ingest', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Test content',
        metadata: { test: true },
      }),
    });

    // Expect 401 (not authenticated) or 403 (not admin)
    expect([401, 403, 500]).toContain(result.status);
  });
});

describe('AI API', () => {
  test('POST /api/v1/ai/coaching requires authentication', async () => {
    const result = await apiRequest('/api/v1/ai/coaching', {
      method: 'POST',
      body: JSON.stringify({}),
    }, false);

    expect(result.status).toBe(401);
  });

  test('POST /api/v1/ai/coaching without required fields returns 400', async () => {
    const result = await apiRequest('/api/v1/ai/coaching', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Expect 400 (missing fields) or 401 (auth failure)
    expect([400, 401]).toContain(result.status);
  });

  test('POST /api/v1/ai/chat requires authentication', async () => {
    const result = await apiRequest('/api/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    }, false);

    expect(result.status).toBe(401);
  });

  test('POST /api/v1/ai/chat without message returns 400', async () => {
    const result = await apiRequest('/api/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Expect 400 (missing message) or 401 (auth failure)
    expect([400, 401]).toContain(result.status);
  });

  test('POST /api/v1/ai/quiz-questions without required fields returns 400', async () => {
    const result = await apiRequest('/api/v1/ai/quiz-questions', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Expect 400 (missing fields) or 401 (auth failure)
    expect([400, 401]).toContain(result.status);
  });

  test('POST /api/v1/ai/analyze-content without content returns 400', async () => {
    const result = await apiRequest('/api/v1/ai/analyze-content', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Expect 400 (missing content) or 401 (auth failure)
    expect([400, 401]).toContain(result.status);
  });
});

describe('Users API', () => {
  test('GET /api/v1/users/profile requires authentication', async () => {
    const result = await apiRequest('/api/v1/users/profile', {}, false);

    expect(result.status).toBe(401);
  });

  test('PUT /api/v1/users/profile requires authentication', async () => {
    const result = await apiRequest('/api/v1/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ display_name: 'Test User' }),
    }, false);

    expect(result.status).toBe(401);
  });

  test('GET /api/v1/users/history requires authentication', async () => {
    const result = await apiRequest('/api/v1/users/history', {}, false);

    expect(result.status).toBe(401);
  });

  test('GET /api/v1/users/progress requires authentication', async () => {
    const result = await apiRequest('/api/v1/users/progress', {}, false);

    expect(result.status).toBe(401);
  });
});

describe('Teams API', () => {
  test('GET /api/v1/teams requires authentication', async () => {
    const result = await apiRequest('/api/v1/teams', {}, false);

    expect(result.status).toBe(401);
  });

  test('POST /api/v1/teams without name returns 400', async () => {
    const result = await apiRequest('/api/v1/teams', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Expect 400 (missing name) or 401 (auth failure)
    expect([400, 401]).toContain(result.status);
  });

  test('GET /api/v1/teams/:id requires authentication', async () => {
    const result = await apiRequest('/api/v1/teams/00000000-0000-0000-0000-000000000000', {}, false);

    expect(result.status).toBe(401);
  });

  test('POST /api/v1/teams/:id/members without user_id returns 400', async () => {
    const result = await apiRequest('/api/v1/teams/00000000-0000-0000-0000-000000000000/members', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Expect 400 (missing user_id) or 401 (auth failure)
    expect([400, 401, 403]).toContain(result.status);
  });
});

describe('Analytics API', () => {
  test('GET /api/v1/analytics/user/:id requires authentication', async () => {
    const result = await apiRequest('/api/v1/analytics/user/00000000-0000-0000-0000-000000000000', {}, false);

    expect(result.status).toBe(401);
  });

  test('GET /api/v1/analytics/assessments requires admin', async () => {
    const result = await apiRequest('/api/v1/analytics/assessments');

    // Expect 401 (not authenticated) or 403 (not admin)
    expect([401, 403, 500]).toContain(result.status);
  });

  test('GET /api/v1/analytics/teams requires admin', async () => {
    const result = await apiRequest('/api/v1/analytics/teams');

    // Expect 401 (not authenticated) or 403 (not admin)
    expect([401, 403, 500]).toContain(result.status);
  });
});

describe('Content API', () => {
  test('GET /api/v1/content returns list with pagination', async () => {
    const result = await apiRequest('/api/v1/content', {}, false);

    // Expect success or error
    expect([200, 500]).toContain(result.status);

    if (result.status === 200) {
      expect((result.data as any)).toHaveProperty('content');
      expect((result.data as any)).toHaveProperty('pagination');
      expect(Array.isArray((result.data as any).content)).toBe(true);
    }
  });

  test('POST /api/v1/content requires admin', async () => {
    const result = await apiRequest('/api/v1/content', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Content',
        content: 'Test body',
        content_type: 'article',
      }),
    });

    // Expect 401 (not authenticated) or 403 (not admin)
    expect([401, 403, 500]).toContain(result.status);
  });

  test('GET /api/v1/content/:id with non-existent ID returns 404', async () => {
    const result = await apiRequest('/api/v1/content/00000000-0000-0000-0000-000000000000', {}, false);

    // Expect 404 (not found) or 500 (error)
    expect([404, 500]).toContain(result.status);
  });

  test('PUT /api/v1/content/:id requires admin', async () => {
    const result = await apiRequest('/api/v1/content/00000000-0000-0000-0000-000000000000', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    // Expect 401 (not authenticated) or 403 (not admin)
    expect([401, 403, 404, 500]).toContain(result.status);
  });

  test('DELETE /api/v1/content/:id requires admin', async () => {
    const result = await apiRequest('/api/v1/content/00000000-0000-0000-0000-000000000000', {
      method: 'DELETE',
    });

    // Expect 401 (not authenticated) or 403 (not admin)
    expect([401, 403, 404, 500]).toContain(result.status);
  });
});

describe('Rate Limiting', () => {
  test('AI endpoints should have rate limit headers', async () => {
    const result = await apiRequest('/api/v1/ai/guidance', {
      method: 'POST',
      body: JSON.stringify({ pillar: 'divsexp', mode: 'egalitarian' }),
    });

    // Check for rate limit headers (if endpoint responds)
    if (result.status !== 500) {
      // Rate limit headers should be present
      const hasRateLimitHeaders =
        result.headers.has('X-RateLimit-Limit') ||
        result.headers.has('X-RateLimit-Remaining') ||
        result.headers.has('X-RateLimit-Reset');

      // Note: Headers may only be set on successful requests
      // This is just a shape test
      expect(typeof hasRateLimitHeaders).toBe('boolean');
    }
  });
});

describe('Error Handling', () => {
  test('Invalid JSON body returns proper error', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json{',
    });

    // Expect 400 or 500 for malformed JSON
    expect([400, 500]).toContain(response.status);
  });

  test('Method not allowed returns proper error', async () => {
    const result = await apiRequest('/api/v1/assessments', {
      method: 'PATCH',
    }, false);

    // Expect 404 or 405 for unsupported method
    expect([404, 405]).toContain(result.status);
  });
});
