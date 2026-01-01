/**
 * Feature Registration System
 *
 * Tracks new features requiring migration from Base44 to REST API
 * Provides automatic detection and migration planning
 */

export interface FeatureMetadata {
  name: string;
  description: string;
  base44Usage: string[]; // Base44 function/entity names used
  restEndpoints: string[]; // Corresponding REST endpoints
  dependencies: string[]; // Other features this depends on
  priority: 'high' | 'medium' | 'low';
  status: 'detected' | 'planned' | 'migrating' | 'migrated' | 'failed';
  migrationScript?: string;
  testCoverage?: number;
  createdAt: Date;
  migratedAt?: Date;
}

export interface MigrationTemplate {
  name: string;
  description: string;
  base44Pattern: RegExp;
  restTemplate: string;
  testTemplate?: string;
  schemaTemplate?: string;
}

class FeatureRegistry {
  private features: Map<string, FeatureMetadata> = new Map();
  private templates: Map<string, MigrationTemplate> = new Map();
  private listeners: Array<(feature: FeatureMetadata) => void> = [];

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize built-in migration templates
   */
  private initializeTemplates() {
    // CRUD Entity Template
    this.templates.set('crud-entity', {
      name: 'CRUD Entity',
      description: 'Standard CRUD operations for data entities',
      base44Pattern: /base44Entities\.(\w+)\.(create|list|get|update|delete)/g,
      restTemplate: `
export const {{entityName}}API = {
  list: (params?: any) => restClient.get('/api/v1/{{entityName}}', { params }),
  create: (data: any) => restClient.post('/api/v1/{{entityName}}', data),
  get: (id: string) => restClient.get('/api/v1/{{entityName}}/\${id}'),
  update: (id: string, data: any) => restClient.put('/api/v1/{{entityName}}/\${id}', data),
  delete: (id: string) => restClient.delete('/api/v1/{{entityName}}/\${id}')
};`,
      testTemplate: `
describe('{{entityName}} API', () => {
  test('should list {{entityName}}', async () => {
    const result = await {{entityName}}API.list();
    expect(Array.isArray(result)).toBe(true);
  });

  test('should create {{entityName}}', async () => {
    const data = { /* test data */ };
    const result = await {{entityName}}API.create(data);
    expect(result.id).toBeDefined();
  });
});`,
      schemaTemplate: `
import { z } from 'zod';

export const {{entityName}}Schema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  // Add entity-specific fields
});

export type {{entityName}} = z.infer<typeof {{entityName}}Schema>;`
    });

    // AI Function Template
    this.templates.set('ai-function', {
      name: 'AI Function',
      description: 'AI-powered functions like coaching, RAG queries',
      base44Pattern: /base44Entities\.functions\.(\w+)\(/g,
      restTemplate: `
export const {{functionName}} = async (params: any) => {
  const response = await restClient.post('/api/v1/ai/{{functionName}}', params);
  return response.data;
};`,
      testTemplate: `
describe('{{functionName}}', () => {
  test('should call {{functionName}} successfully', async () => {
    const params = { /* test params */ };
    const result = await {{functionName}}(params);
    expect(result).toBeDefined();
  });
});`
    });

    // Authentication Template
    this.templates.set('auth-function', {
      name: 'Authentication',
      description: 'User authentication and session management',
      base44Pattern: /base44Auth\.(login|register|logout|refresh)/g,
      restTemplate: `
export const authAPI = {
  login: (credentials: LoginCredentials) => restClient.post('/api/v1/auth/login', credentials),
  register: (userData: RegisterData) => restClient.post('/api/v1/auth/register', userData),
  logout: () => restClient.post('/api/v1/auth/logout'),
  refresh: (token: string) => restClient.post('/api/v1/auth/refresh', { token }),
  me: () => restClient.get('/api/v1/auth/me')
};`,
      testTemplate: `
describe('Authentication API', () => {
  test('should login user', async () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    const result = await authAPI.login(credentials);
    expect(result.token).toBeDefined();
  });
});`
    });

    // React Hook Template
    this.templates.set('react-hook', {
      name: 'React Data Hook',
      description: 'Custom React hooks for data fetching and state management',
      base44Pattern: /useBase44(\w+)/g,
      restTemplate: `
import { useState, useEffect } from 'react';
import { {{entityName}}API } from '../api/{{entityName}}';

export const use{{entityName}} = (id?: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetch{{entityName}}(id);
    } else {
      fetch{{entityName}}List();
    }
  }, [id]);

  const fetch{{entityName}}List = async (params = {}) => {
    setLoading(true);
    try {
      const result = await {{entityName}}API.list(params);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetch{{entityName}} = async (entityId: string) => {
    setLoading(true);
    try {
      const result = await {{entityName}}API.get(entityId);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const create{{entityName}} = async (entityData: any) => {
    setLoading(true);
    try {
      const result = await {{entityName}}API.create(entityData);
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update{{entityName}} = async (entityId: string, entityData: any) => {
    setLoading(true);
    try {
      const result = await {{entityName}}API.update(entityId, entityData);
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const delete{{entityName}} = async (entityId: string) => {
    setLoading(true);
    try {
      await {{entityName}}API.delete(entityId);
      setData(null);
      setError(null);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetch{{entityName}}List,
    fetch{{entityName}},
    create{{entityName}},
    update{{entityName}},
    delete{{entityName}}
  };
};`,
      testTemplate: `
import { renderHook, act } from '@testing-library/react';
import { use{{entityName}} } from './use{{entityName}}';

describe('use{{entityName}}', () => {
  test('should fetch {{entityName}} list', async () => {
    const { result } = renderHook(() => use{{entityName}}());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeDefined();
  });

  test('should fetch single {{entityName}}', async () => {
    const { result } = renderHook(() => use{{entityName}}('test-id'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data?.id).toBe('test-id');
  });
});`
    });

    // Zustand Store Template
    this.templates.set('zustand-store', {
      name: 'Zustand Store',
      description: 'State management stores using Zustand',
      base44Pattern: /createBase44Store|g\w+Store.*base44/g,
      restTemplate: `
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { {{entityName}}API } from '../api/{{entityName}}';

interface {{entityName}}State {
  {{entityName | lowercase}}s: any[];
  current{{entityName}}: any | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetch{{entityName}}s: (params?: any) => Promise<void>;
  fetch{{entityName}}: (id: string) => Promise<void>;
  create{{entityName}}: (data: any) => Promise<any>;
  update{{entityName}}: (id: string, data: any) => Promise<any>;
  delete{{entityName}}: (id: string) => Promise<void>;
  setCurrent{{entityName}}: ({{entityName | lowercase}}: any | null) => void;
  clearError: () => void;
}

export const use{{entityName}}Store = create<{{entityName}}State>()(
  subscribeWithSelector((set, get) => ({
    {{entityName | lowercase}}s: [],
    current{{entityName}}: null,
    loading: false,
    error: null,

    fetch{{entityName}}s: async (params = {}) => {
      set({ loading: true, error: null });
      try {
        const {{entityName | lowercase}}s = await {{entityName}}API.list(params);
        set({ {{entityName | lowercase}}s, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },

    fetch{{entityName}}: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const {{entityName | lowercase}} = await {{entityName}}API.get(id);
        set({ current{{entityName}}: {{entityName | lowercase}}, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },

    create{{entityName}}: async (data: any) => {
      set({ loading: true, error: null });
      try {
        const new{{entityName}} = await {{entityName}}API.create(data);
        set(state => ({
          {{entityName | lowercase}}s: [...state.{{entityName | lowercase}}s, new{{entityName}}],
          current{{entityName}}: new{{entityName}},
          loading: false
        }));
        return new{{entityName}};
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    update{{entityName}}: async (id: string, data: any) => {
      set({ loading: true, error: null });
      try {
        const updated{{entityName}} = await {{entityName}}API.update(id, data);
        set(state => ({
          {{entityName | lowercase}}s: state.{{entityName | lowercase}}s.map(item =>
            item.id === id ? updated{{entityName}} : item
          ),
          current{{entityName}}: state.current{{entityName}}?.id === id ? updated{{entityName}} : state.current{{entityName}},
          loading: false
        }));
        return updated{{entityName}};
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    delete{{entityName}}: async (id: string) => {
      set({ loading: true, error: null });
      try {
        await {{entityName}}API.delete(id);
        set(state => ({
          {{entityName | lowercase}}s: state.{{entityName | lowercase}}s.filter(item => item.id !== id),
          current{{entityName}}: state.current{{entityName}}?.id === id ? null : state.current{{entityName}},
          loading: false
        }));
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    setCurrent{{entityName}}: ({{entityName | lowercase}}: any | null) => {
      set({ current{{entityName}}: {{entityName | lowercase}} });
    },

    clearError: () => {
      set({ error: null });
    }
  }))
);

// Selectors for optimized re-renders
export const use{{entityName}}s = () => use{{entityName}}Store(state => state.{{entityName | lowercase}}s);
export const useCurrent{{entityName}} = () => use{{entityName}}Store(state => state.current{{entityName}});
export const use{{entityName}}Loading = () => use{{entityName}}Store(state => state.loading);
export const use{{entityName}}Error = () => use{{entityName}}Store(state => state.error);`
    });

    // File Upload Template
    this.templates.set('file-upload', {
      name: 'File Upload',
      description: 'File upload and storage operations',
      base44Pattern: /base44Storage\.upload|uploadFile.*base44/g,
      restTemplate: `
import { restClient } from './restClient';

export const fileAPI = {
  upload: async (file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await restClient.post('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getUploadUrl: async (filename: string, contentType: string) => {
    const response = await restClient.post('/api/v1/files/upload-url', {
      filename,
      contentType
    });
    return response.data;
  },

  delete: async (fileId: string) => {
    const response = await restClient.delete(\`/api/v1/files/\${fileId}\`);
    return response.data;
  },

  list: async (params?: any) => {
    const response = await restClient.get('/api/v1/files', { params });
    return response.data;
  },

  get: async (fileId: string) => {
    const response = await restClient.get(\`/api/v1/files/\${fileId}\`);
    return response.data;
  }
};

// React hook for file uploads
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file: File, metadata?: any) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await fileAPI.upload(file, metadata);

      clearInterval(progressInterval);
      setProgress(100);

      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
    progress,
    error
  };
};`,
      testTemplate: `
describe('File API', () => {
  test('should upload file', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const result = await fileAPI.upload(file);
    expect(result.id).toBeDefined();
    expect(result.url).toBeDefined();
  });

  test('should get upload URL', async () => {
    const result = await fileAPI.getUploadUrl('test.txt', 'text/plain');
    expect(result.uploadUrl).toBeDefined();
  });
});`
    });

    // Real-time Subscription Template
    this.templates.set('realtime-subscription', {
      name: 'Real-time Subscription',
      description: 'Real-time data subscriptions and live updates',
      base44Pattern: /base44Realtime\.subscribe|subscribeTo.*base44/g,
      restTemplate: `
import { restClient } from './restClient';

// WebSocket-based real-time updates
export class RealtimeService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(\`\${process.env.REACT_APP_WS_URL || 'ws://localhost:3001'}/api/v1/realtime\`);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifyListeners(data.type, data.payload);
    };

    this.ws.onclose = () => {
      // Auto-reconnect logic
      setTimeout(() => this.connect(), 1000);
    };
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }

  subscribe(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Send subscription message
    this.ws?.send(JSON.stringify({
      type: 'subscribe',
      event: eventType
    }));

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(eventType: string, payload: any) {
    const listeners = this.listeners.get(eventType) || [];
    listeners.forEach(callback => callback(payload));
  }
}

export const realtimeService = new RealtimeService();

// React hook for real-time subscriptions
export const useRealtimeSubscription = (eventType: string, callback: Function) => {
  useEffect(() => {
    realtimeService.connect();
    const unsubscribe = realtimeService.subscribe(eventType, callback);

    return () => {
      unsubscribe();
    };
  }, [eventType, callback]);
};

// Specific entity subscriptions
export const use{{entityName}}Subscription = (id?: string) => {
  const [data, setData] = useState(null);

  useRealtimeSubscription('{{entityName | lowercase}}.updated', (payload) => {
    if (!id || payload.id === id) {
      setData(payload);
    }
  });

  return data;
};`
    });

    // Search and Filtering Template
    this.templates.set('search-filter', {
      name: 'Search and Filtering',
      description: 'Advanced search, filtering, and sorting operations',
      base44Pattern: /base44Search\.|search.*base44|filter.*base44/g,
      restTemplate: `
import { restClient } from './restClient';

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const searchAPI = {
  search{{entityName}}: async (params: SearchParams): Promise<SearchResult<any>> => {
    const response = await restClient.post('/api/v1/{{entityName | lowercase}}/search', params);
    return response.data;
  },

  getFilters: async (): Promise<Record<string, any[]>> => {
    const response = await restClient.get('/api/v1/{{entityName | lowercase}}/filters');
    return response.data;
  },

  getSuggestions: async (query: string): Promise<string[]> => {
    const response = await restClient.get('/api/v1/{{entityName | lowercase}}/suggestions', {
      params: { q: query }
    });
    return response.data;
  }
};

// React hook for search functionality
export const use{{entityName}}Search = () => {
  const [results, setResults] = useState<SearchResult<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState<Record<string, any[]>>({});

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const filterData = await searchAPI.getFilters();
      setFilters(filterData);
    } catch (err) {
      console.error('Failed to load filters:', err);
    }
  };

  const search = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const searchResults = await searchAPI.search{{entityName}}(params);
      setResults(searchResults);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (query: string) => {
    try {
      return await searchAPI.getSuggestions(query);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
      return [];
    }
  };

  return {
    results,
    loading,
    error,
    filters,
    search,
    getSuggestions
  };
};`,
      testTemplate: `
describe('Search API', () => {
  test('should search {{entityName}}', async () => {
    const params = {
      query: 'test',
      pagination: { page: 1, limit: 10 }
    };
    const result = await searchAPI.search{{entityName}}(params);
    expect(result.items).toBeDefined();
    expect(result.total).toBeDefined();
  });

  test('should get filters', async () => {
    const filters = await searchAPI.getFilters();
    expect(typeof filters).toBe('object');
  });
});`
    });

    // Batch Operations Template
    this.templates.set('batch-operations', {
      name: 'Batch Operations',
      description: 'Bulk operations for multiple entities',
      base44Pattern: /base44Batch\.|batch.*base44|bulk.*base44/g,
      restTemplate: `
import { restClient } from './restClient';

export interface BatchOperation<T = any> {
  operation: 'create' | 'update' | 'delete';
  id?: string;
  data?: T;
}

export interface BatchResult {
  successful: Array<{ id: string; result: any }>;
  failed: Array<{ id?: string; error: string }>;
}

export const batchAPI = {
  execute{{entityName}}Batch: async (operations: BatchOperation[]): Promise<BatchResult> => {
    const response = await restClient.post('/api/v1/{{entityName | lowercase}}/batch', {
      operations
    });
    return response.data;
  },

  validateBatch: async (operations: BatchOperation[]): Promise<{ valid: boolean; errors: string[] }> => {
    const response = await restClient.post('/api/v1/{{entityName | lowercase}}/batch/validate', {
      operations
    });
    return response.data;
  }
};

// React hook for batch operations
export const use{{entityName}}Batch = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult | null>(null);

  const executeBatch = async (operations: BatchOperation[]) => {
    setProcessing(true);
    setProgress(0);
    setResults(null);

    try {
      // Validate first
      const validation = await batchAPI.validateBatch(operations);
      if (!validation.valid) {
        throw new Error(\`Validation failed: \${validation.errors.join(', ')}\`);
      }

      // Execute batch with progress tracking
      const result = await batchAPI.execute{{entityName}}Batch(operations);
      setResults(result);
      setProgress(100);

      return result;
    } catch (error) {
      setResults({
        successful: [],
        failed: [{ error: error.message }]
      });
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return {
    executeBatch,
    processing,
    progress,
    results
  };
};`,
      testTemplate: `
describe('Batch API', () => {
  test('should execute batch operations', async () => {
    const operations = [
      { operation: 'create', data: { name: 'Test 1' } },
      { operation: 'create', data: { name: 'Test 2' } }
    ];

    const result = await batchAPI.execute{{entityName}}Batch(operations);
    expect(result.successful).toHaveLength(2);
    expect(result.failed).toHaveLength(0);
  });

  test('should validate batch operations', async () => {
    const operations = [
      { operation: 'create', data: { name: 'Valid' } },
      { operation: 'update', id: 'invalid-id', data: {} }
    ];

    const result = await batchAPI.validateBatch(operations);
    expect(result.valid).toBeDefined();
  });
});`
    });

    // Error Handling Template
    this.templates.set('error-handling', {
      name: 'Error Handling',
      description: 'Comprehensive error handling and user feedback',
      base44Pattern: /base44Error\.|catch.*base44|error.*base44/g,
      restTemplate: `
// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public fields: Record<string, string[]>) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error handling utilities
export const errorHandler = {
  handleAPIError: (error: any): APIError => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return new APIError(
        data?.message || 'API Error',
        status,
        data?.code,
        data?.details
      );
    } else if (error.request) {
      // Network error
      return new NetworkError('Network Error - Please check your connection');
    } else {
      // Other error
      return new APIError(error.message || 'Unknown Error', 500);
    }
  },

  handleValidationError: (error: any): ValidationError => {
    if (error.response?.status === 400 && error.response?.data?.errors) {
      const fields = error.response.data.errors;
      return new ValidationError('Validation Error', fields);
    }
    return new ValidationError('Validation Error', {});
  },

  getErrorMessage: (error: any): string => {
    if (error instanceof APIError) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'Authentication required. Please log in.';
        case 403:
          return 'Access denied. You do not have permission.';
        case 404:
          return 'Resource not found.';
        case 409:
          return 'Conflict - Resource already exists.';
        case 422:
          return 'Validation failed. Please check your input.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return error.message;
      }
    }

    if (error instanceof NetworkError) {
      return error.message;
    }

    if (error instanceof ValidationError) {
      return error.message;
    }

    return 'An unexpected error occurred.';
  }
};

// React hook for error handling
export const useErrorHandler = () => {
  const [errors, setErrors] = useState<APIError[]>([]);

  const addError = (error: any) => {
    const apiError = errorHandler.handleAPIError(error);
    setErrors(prev => [...prev, apiError]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e !== apiError));
    }, 5000);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const clearError = (error: APIError) => {
    setErrors(prev => prev.filter(e => e !== error));
  };

  return {
    errors,
    addError,
    clearErrors,
    clearError,
    getErrorMessage: errorHandler.getErrorMessage
  };
};

// Higher-order component for error boundaries
export const withErrorBoundary = (Component: React.ComponentType) => {
  return class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="error-boundary">
            <h3>Something went wrong</h3>
            <p>{errorHandler.getErrorMessage(this.state.error)}</p>
            <button onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </button>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
};`,
      testTemplate: `
describe('Error Handler', () => {
  test('should handle API errors', () => {
    const mockError = {
      response: {
        status: 404,
        data: { message: 'Not found' }
      }
    };

    const error = errorHandler.handleAPIError(mockError);
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not found');
  });

  test('should handle network errors', () => {
    const mockError = {
      request: {}
    };

    const error = errorHandler.handleAPIError(mockError);
    expect(error).toBeInstanceOf(NetworkError);
  });

  test('should get user-friendly error messages', () => {
    const apiError = new APIError('Test', 404);
    const message = errorHandler.getErrorMessage(apiError);
    expect(message).toContain('not found');
  });
});`
    });
  }

  /**
   * Register a new feature for migration
   */
  registerFeature(feature: Omit<FeatureMetadata, 'createdAt'>): string {
    const id = `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullFeature: FeatureMetadata = {
      ...feature,
      createdAt: new Date()
    };

    this.features.set(id, fullFeature);
    this.notifyListeners(fullFeature);

    console.log(`📝 Registered new feature for migration: ${feature.name}`);
    return id;
  }

  /**
   * Auto-detect features from code analysis
   */
  async detectFeatures(codebasePath: string = 'src'): Promise<string[]> {
    const detectedFeatures: string[] = [];

    // Scan for Base44 usage patterns
    const base44Patterns = [
      /base44Entities\.(\w+)\./g,
      /base44Entities\.functions\.(\w+)\(/g,
      /base44Auth\./g
    ];

    // This would integrate with a code analysis tool
    // For now, return empty array - would need file scanning implementation
    return detectedFeatures;
  }

  /**
   * Generate migration script for a feature
   */
  generateMigrationScript(featureId: string): string | null {
    const feature = this.features.get(featureId);
    if (!feature) return null;

    // Find matching template
    for (const [templateName, template] of this.templates) {
      if (feature.base44Usage.some(usage => template.base44Pattern.test(usage))) {
        return this.applyTemplate(template, feature);
      }
    }

    return null;
  }

  /**
   * Apply template to feature
   */
  private applyTemplate(template: MigrationTemplate, feature: FeatureMetadata): string {
    let script = template.restTemplate;

    // Replace placeholders
    script = script.replace(/\{\{entityName\}\}/g, feature.name.toLowerCase());
    script = script.replace(/\{\{functionName\}\}/g, feature.name.toLowerCase());

    // Add test if template has one
    if (template.testTemplate) {
      script += '\n\n' + template.testTemplate
        .replace(/\{\{entityName\}\}/g, feature.name.toLowerCase())
        .replace(/\{\{functionName\}\}/g, feature.name.toLowerCase());
    }

    // Add schema if template has one
    if (template.schemaTemplate) {
      script += '\n\n' + template.schemaTemplate
        .replace(/\{\{entityName\}\}/g, feature.name);
    }

    return script;
  }

  /**
   * Update feature status
   */
  updateFeatureStatus(featureId: string, status: FeatureMetadata['status']): void {
    const feature = this.features.get(featureId);
    if (feature) {
      feature.status = status;
      if (status === 'migrated') {
        feature.migratedAt = new Date();
      }
      this.notifyListeners(feature);
    }
  }

  /**
   * Get all features
   */
  getFeatures(): FeatureMetadata[] {
    return Array.from(this.features.values());
  }

  /**
   * Get features by status
   */
  getFeaturesByStatus(status: FeatureMetadata['status']): FeatureMetadata[] {
    return this.getFeatures().filter(f => f.status === status);
  }

  /**
   * Add event listener for feature changes
   */
  onFeatureChange(listener: (feature: FeatureMetadata) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeFeatureChangeListener(listener: (feature: FeatureMetadata) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify listeners of feature changes
   */
  private notifyListeners(feature: FeatureMetadata): void {
    this.listeners.forEach(listener => {
      try {
        listener(feature);
      } catch (error) {
        console.error('Error in feature change listener:', error);
      }
    });
  }

  /**
   * Get migration statistics
   */
  getMigrationStats(): {
    total: number;
    migrated: number;
    inProgress: number;
    failed: number;
    pending: number;
  } {
    const features = this.getFeatures();
    return {
      total: features.length,
      migrated: features.filter(f => f.status === 'migrated').length,
      inProgress: features.filter(f => f.status === 'migrating').length,
      failed: features.filter(f => f.status === 'failed').length,
      pending: features.filter(f => ['detected', 'planned'].includes(f.status)).length
    };
  }
}

// Export singleton instance
export const featureRegistry = new FeatureRegistry();

// CLI helper functions
export const cli = {
  /**
   * Register a feature via CLI
   */
  register: (name: string, description: string, base44Usage: string[]) => {
    return featureRegistry.registerFeature({
      name,
      description,
      base44Usage,
      restEndpoints: [], // Will be filled by template
      dependencies: [],
      priority: 'medium',
      status: 'detected'
    });
  },

  /**
   * Generate migration for a feature
   */
  generate: (featureId: string) => {
    const script = featureRegistry.generateMigrationScript(featureId);
    if (script) {
      console.log('Generated migration script:');
      console.log(script);
      return script;
    } else {
      console.log('No suitable template found for this feature');
      return null;
    }
  },

  /**
   * List all features
   */
  list: () => {
    const features = featureRegistry.getFeatures();
    console.table(features.map(f => ({
      name: f.name,
      status: f.status,
      priority: f.priority,
      created: f.createdAt.toISOString().split('T')[0]
    })));
  },

  /**
   * Get migration statistics
   */
  stats: () => {
    const stats = featureRegistry.getMigrationStats();
    console.log('Migration Statistics:');
    console.log(`Total Features: ${stats.total}`);
    console.log(`Migrated: ${stats.migrated}`);
    console.log(`In Progress: ${stats.inProgress}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Pending: ${stats.pending}`);
  }
};