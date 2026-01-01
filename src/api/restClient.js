/**
 * REST API Client
 *
 * Comprehensive client for Compilar REST API with JWT refresh, streaming support,
 * and robust error handling. Enables gradual migration from Base44 SDK.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client for auth
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class RestApiClient {
  constructor(baseURL = '/api/v1') {
    this.baseURL = baseURL;
    this.authToken = null;
    this.refreshPromise = null;

    // Request/response interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Get current authentication token, refreshing if needed
   */
  async getAuthToken() {
    if (!this.authToken) {
      return null;
    }

    // Check if token is expired (simple check - in production use JWT decode)
    const isExpired = this.isTokenExpired(this.authToken);
    if (isExpired) {
      await this.refreshToken();
    }

    return this.authToken;
  }

  /**
   * Check if token is expired (simplified - decode JWT in production)
   */
  isTokenExpired(token) {
    // This is a simplified check. In production, decode the JWT and check exp claim
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // Assume expired if we can't parse
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;

        this.authToken = data.session?.access_token || null;
        return this.authToken;
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.authToken = null;
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Make HTTP request with interceptors and auth
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = await this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Run request interceptors
    for (const interceptor of this.requestInterceptors) {
      await interceptor(config);
    }

    try {
      const response = await fetch(url, config);

      // Run response interceptors
      for (const interceptor of this.responseInterceptors) {
        await interceptor(response, config);
      }

      return response;
    } catch (error) {
      // Handle network errors
      throw new ApiError('NETWORK_ERROR', error.message, 0);
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data = null, options = {}) {
    const config = { ...options, method: 'POST' };
    if (data) {
      config.body = JSON.stringify(data);
    }
    return this.request(endpoint, config);
  }

  /**
   * PUT request
   */
  async put(endpoint, data = null, options = {}) {
    const config = { ...options, method: 'PUT' };
    if (data) {
      config.body = JSON.stringify(data);
    }
    return this.request(endpoint, config);
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Streaming request for AI endpoints
   */
  async stream(endpoint, data = null, onChunk = null, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = await this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.code || 'STREAM_ERROR',
          errorData.message || `HTTP ${response.status}`,
          response.status
        );
      }

      if (!response.body) {
        throw new ApiError('STREAM_ERROR', 'Response body is not readable', 0);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      const processChunk = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Keep the last incomplete line in buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const chunk = JSON.parse(line);
                  if (onChunk) {
                    await onChunk(chunk);
                  }
                } catch (parseError) {
                  // Handle non-JSON chunks (plain text)
                  if (onChunk) {
                    await onChunk({ content: line });
                  }
                }
              }
            }
          }

          // Process any remaining buffer
          if (buffer.trim() && onChunk) {
            try {
              const chunk = JSON.parse(buffer);
              await onChunk(chunk);
            } catch (parseError) {
              await onChunk({ content: buffer });
            }
          }
        } catch (error) {
          throw new ApiError('STREAM_ERROR', error.message, 0);
        }
      };

      await processChunk();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('STREAM_ERROR', error.message, 0);
    }
  }

  /**
   * Health check
   */
  async health() {
    try {
      const response = await this.get('/health');
      return await response.json();
    } catch (error) {
      throw new ApiError('HEALTH_CHECK_FAILED', error.message, 0);
    }
  }
}

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Create configured REST API client
 */
export function createRestClient() {
  const client = new RestApiClient();

  // Add logging interceptor
  client.addRequestInterceptor(async (config) => {
    console.debug(`API Request: ${config.method} ${config.url || 'unknown'}`);
  });

  client.addResponseInterceptor(async (response, config) => {
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignore JSON parse errors
      }

      throw new ApiError(
        errorData.code || 'HTTP_ERROR',
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }
  });

  return client;
}

// Export singleton instance
export const restClient = createRestClient();

// Export utility functions
export { RestApiClient };