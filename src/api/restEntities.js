// REST API entity implementations
// Provides REST API versions of entity operations

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Generic REST API client
class RestClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return data.data || data;
    } catch (error) {
      console.error(`REST API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const restClient = new RestClient();

// REST API entity implementations
export const PilarAssessment = {
  async list(options = {}) {
    return restClient.get('/entities/pilar-assessments', options);
  },

  async create(data) {
    return restClient.post('/entities/pilar-assessments', data);
  },

  async get(id) {
    return restClient.get(`/entities/pilar-assessments/${id}`);
  },

  async update(id, data) {
    return restClient.put(`/entities/pilar-assessments/${id}`, data);
  },

  async delete(id) {
    return restClient.delete(`/entities/pilar-assessments/${id}`);
  }
};

export const UserProfile = {
  async get(userId) {
    return restClient.get(`/entities/user-profiles/${userId}`);
  },

  async update(userId, data) {
    return restClient.put(`/entities/user-profiles/${userId}`, data);
  },

  async me() {
    return restClient.get('/auth/me');
  }
};

export const AssessmentSession = {
  async list(options = {}) {
    return restClient.get('/entities/assessment-sessions', options);
  },

  async create(data) {
    return restClient.post('/entities/assessment-sessions', data);
  },

  async get(id) {
    return restClient.get(`/entities/assessment-sessions/${id}`);
  },

  async update(id, data) {
    return restClient.put(`/entities/assessment-sessions/${id}`, data);
  },

  async delete(id) {
    return restClient.delete(`/entities/assessment-sessions/${id}`);
  }
};

export const UserProgress = {
  async list(options = {}) {
    return restClient.get('/entities/user-progress', options);
  },

  async update(id, data) {
    return restClient.put(`/entities/user-progress/${id}`, data);
  }
};

// AI Functions (REST API)
export const functions = {
  async pilarRagQuery(query, options = {}) {
    return restClient.post('/ai/rag/query', { query, ...options });
  },

  async generateAICoaching(context) {
    return restClient.post('/ai/coach/conversation', context);
  },

  async coachConversation(message, context) {
    return restClient.post('/ai/coach/conversation', { message, context });
  },

  async assessmentGuidance(assessmentId, options = {}) {
    return restClient.post('/ai/assessment/guidance', { assessment_id: assessmentId, ...options });
  },

  async contentAnalysis(content, contentType) {
    return restClient.post('/ai/content/analyze', { content, content_type: contentType });
  }
};

// Auth functions
export const auth = {
  async login(email, password) {
    // For testing, use the test login endpoint
    if (email === 'test@example.com' && password === 'test') {
      return restClient.post('/auth/test-login');
    }
    return restClient.post('/auth/login', { email, password });
  },

  async register(email, password, fullName) {
    return restClient.post('/auth/register', { email, password, full_name: fullName });
  },

  async refreshToken(refreshToken) {
    return restClient.post('/auth/refresh', { refresh_token: refreshToken });
  },

  async getCurrentUser() {
    return restClient.get('/auth/me');
  }
};

// Team functions
export const Team = {
  async list() {
    return restClient.get('/entities/teams');
  },

  async create(data) {
    return restClient.post('/entities/teams', data);
  },

  async getMembers(teamId) {
    return restClient.get(`/entities/teams/${teamId}/members`);
  },

  async addMember(teamId, userEmail, role = 'member') {
    return restClient.post(`/entities/teams/${teamId}/members`, { user_email: userEmail, role });
  },

  async removeMember(teamId, memberId) {
    return restClient.delete(`/entities/teams/${teamId}/members/${memberId}`);
  }
};

// Analytics functions
export const UserAnalytics = {
  async record(eventType, eventData = {}, pageUrl = '') {
    return restClient.post('/entities/user-analytics', {
      event_type: eventType,
      event_data: eventData,
      page_url: pageUrl
    });
  },

  async list(options = {}) {
    return restClient.get('/entities/user-analytics', options);
  }
};

// CMS Content functions
export const CmsContent = {
  async list(options = {}) {
    return restClient.get('/entities/cms-content', options);
  },

  async create(data) {
    return restClient.post('/entities/cms-content', data);
  },

  async update(id, data) {
    return restClient.put(`/entities/cms-content/${id}`, data);
  },

  async delete(id) {
    return restClient.delete(`/entities/cms-content/${id}`);
  }
};

// Export all entities
export default {
  PilarAssessment,
  UserProfile,
  AssessmentSession,
  UserProgress,
  Team,
  UserAnalytics,
  CmsContent,
  functions,
  auth
};