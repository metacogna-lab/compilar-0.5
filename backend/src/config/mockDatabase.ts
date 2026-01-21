/**
 * Mock Database Client for Testing
 *
 * Provides in-memory database simulation for development/testing
 * when Supabase is not configured
 */

interface MockTable {
  [key: string]: any[];
}

class MockSupabaseClient {
  private data: MockTable = {
    pilar_assessments: [],
    assessment_sessions: [],
    user_profiles: [],
    pilar_knowledge: [],
    pilar_forces: [
      {
        id: 'leadership-1',
        pillar: 'leadership',
        mode: 'egalitarian',
        name: 'Inclusive Decision Making',
        description: 'Leaders involve team members in decisions and value diverse perspectives',
        category: 'participation'
      },
      {
        id: 'leadership-2',
        pillar: 'leadership',
        mode: 'egalitarian',
        name: 'Supportive Guidance',
        description: 'Leaders provide guidance while encouraging autonomy and growth',
        category: 'development'
      },
      {
        id: 'leadership-3',
        pillar: 'leadership',
        mode: 'hierarchical',
        name: 'Clear Direction',
        description: 'Leaders provide clear goals and expectations for team performance',
        category: 'direction'
      },
      {
        id: 'leadership-4',
        pillar: 'leadership',
        mode: 'hierarchical',
        name: 'Accountability Focus',
        description: 'Leaders establish clear accountability and performance standards',
        category: 'accountability'
      }
    ],
    assessment_sessions_responses: {}
  };

  from(table: string) {
    return {
      select: (columns = '*') => {
        const createQueryBuilder = (filters: any = {}) => ({
          eq: (column: string, value: any) => createQueryBuilder({ ...filters, [column]: value }),
          single: async () => {
            const items = this.data[table] || [];
            const item = items.find((item: any) =>
              Object.entries(filters).every(([key, val]) => item[key] === val)
            );
            return {
              data: item || null,
              error: item ? null : { message: 'Not found', code: 'PGRST116' }
            };
          },
          order: (column: string, options: any) => {
            let data = (this.data[table] || []).filter((item: any) =>
              Object.entries(filters).every(([key, val]) => item[key] === val)
            );
            data = data.sort((a, b) => {
              if (options?.ascending === false) {
                return new Date(b[column]).getTime() - new Date(a[column]).getTime();
              }
              return new Date(a[column]).getTime() - new Date(b[column]).getTime();
            });
            return { data, error: null };
          }
        });
        return createQueryBuilder();
      },
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const newItem = {
              ...data,
              id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            if (!this.data[table]) {
              this.data[table] = [];
            }
            this.data[table].push(newItem);
            return {
              data: newItem,
              error: null
            };
          }
        })
      }),
      update: (updates: any) => ({
        eq: (column: string, value: any) => ({
          data: this.data[table]?.filter((item: any) => item[column] === value) || [],
          error: null
        })
      })
    };
  }

  auth = {
    getUser: async (token: string) => {
      // Mock user for testing
      if (token === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c') {
        return {
          data: {
            user: {
              id: '12345678-1234-1234-1234-123456789012',
              email: 'test@example.com',
              user_metadata: { full_name: 'Test User' },
              app_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          },
          error: null
        };
      }
      return { data: { user: null }, error: { message: 'Invalid token' } };
    }
  };

  rpc = (functionName: string, params: any) => {
    // Mock RPC for update_assessment_response
    if (functionName === 'update_assessment_response') {
      const { assessment_id, question_id, answer_data } = params;
      // Simulate atomic update
      if (!this.data.assessment_sessions_responses[assessment_id]) {
        this.data.assessment_sessions_responses[assessment_id] = {};
      }
      this.data.assessment_sessions_responses[assessment_id][question_id] = answer_data;
      return { error: null };
    }
    return { error: { message: `Function ${functionName} not implemented in mock` } };
  };
}

export const mockSupabase = new MockSupabaseClient();