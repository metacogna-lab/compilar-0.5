/**
 * REST API React Hooks
 *
 * Provides React-friendly interface to the REST API client with loading states,
 * error handling, and automatic token management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { restClient, ApiError, type StreamChunk } from '@/api/restClient';
import { supabase } from '@/utils/supabase';
import type {
  CreateAssessmentRequest,
  AssessmentResponse,
  RAGQueryRequest,
  Message,
  CoachConversationRequest,
} from '@compilar/shared/types';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Request execution options
 */
export interface RequestOptions<T = unknown> {
  silent?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

/**
 * Streaming options
 */
export interface StreamingOptions {
  onStart?: () => void;
  onComplete?: (chunks: StreamChunk[]) => void;
  onError?: (error: ApiError) => void;
}

/**
 * Chat message interface
 */
export interface ChatMessage extends Message {
  timestamp: Date;
  streaming?: boolean;
}

/**
 * Coaching response
 */
export interface CoachingResponse {
  content: string;
  [key: string]: unknown;
}

/**
 * Main REST API hook return type
 */
export interface UseRestApiResult {
  loading: boolean;
  error: ApiError | null;
  user: User | null;
  get: <T = unknown>(endpoint: string, options?: RequestOptions<T>) => Promise<T>;
  post: <TResponse = unknown, TRequest = unknown>(
    endpoint: string,
    data: TRequest,
    options?: RequestOptions<TResponse>
  ) => Promise<TResponse>;
  put: <TResponse = unknown, TRequest = unknown>(
    endpoint: string,
    data: TRequest,
    options?: RequestOptions<TResponse>
  ) => Promise<TResponse>;
  delete: <T = unknown>(endpoint: string, options?: RequestOptions<T>) => Promise<T>;
  health: (options?: RequestOptions<{ status: string; timestamp: string }>) => Promise<{ status: string; timestamp: string }>;
  executeRequest: <T = unknown>(
    requestFn: () => Promise<T>,
    options?: RequestOptions<T>
  ) => Promise<T>;
}

/**
 * Streaming API hook return type
 */
export interface UseStreamingApiResult {
  streaming: boolean;
  error: ApiError | null;
  chunks: StreamChunk[];
  stream: (
    endpoint: string,
    data: unknown,
    onChunk?: (chunk: StreamChunk) => void,
    options?: StreamingOptions
  ) => Promise<void>;
  stopStreaming: () => void;
  clearChunks: () => void;
}

/**
 * AI Coaching hook return type
 */
export interface UseAICoachingResult extends UseStreamingApiResult {
  coaching: CoachingResponse | null;
  startCoaching: (data: CoachConversationRequest) => Promise<void>;
}

/**
 * AI Chat hook return type
 */
export interface UseAIChatResult extends UseStreamingApiResult {
  messages: ChatMessage[];
  sendMessage: (message: string, context?: Record<string, unknown>) => Promise<void>;
}

/**
 * RAG hook return type
 */
export interface UseRAGResult {
  query: (queryText: string, options?: Partial<RAGQueryRequest>) => Promise<unknown>;
  results: unknown | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Assessments hook return type
 */
export interface UseAssessmentsResult {
  assessments: AssessmentResponse[];
  fetchAssessments: () => Promise<unknown>;
  createAssessment: (data: CreateAssessmentRequest) => Promise<unknown>;
  loading: boolean;
  error: ApiError | null;
}

// ============================================================================
// Main REST API Hook
// ============================================================================

/**
 * Hook for making REST API requests with React state management
 */
export function useRestApi(): UseRestApiResult {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Track user authentication state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.access_token) {
        restClient.setAuthToken(session.access_token);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.access_token) {
        restClient.setAuthToken(session.access_token);
      } else {
        restClient.setAuthToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Execute API request with loading and error state management
   */
  const executeRequest = useCallback(
    async <T = unknown>(
      requestFn: () => Promise<T>,
      options: RequestOptions<T> = {}
    ): Promise<T> => {
      const { silent = false, onSuccess, onError } = options;

      if (!silent) setLoading(true);
      setError(null);

      try {
        const data = await requestFn();

        if (onSuccess) {
          onSuccess(data);
        }

        return data;
      } catch (err) {
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError('UNKNOWN_ERROR', (err as Error).message, 0);
        setError(apiError);

        if (onError) {
          onError(apiError);
        }

        throw apiError;
      } finally {
        if (!silent) setLoading(false);
      }
    },
    []
  );

  /**
   * GET request with typed response
   */
  const get = useCallback(
    <T = unknown>(endpoint: string, options: RequestOptions<T> = {}): Promise<T> => {
      return executeRequest(() => restClient.get<T>(endpoint), options);
    },
    [executeRequest]
  );

  /**
   * POST request with typed request and response
   */
  const post = useCallback(
    <TResponse = unknown, TRequest = unknown>(
      endpoint: string,
      data: TRequest,
      options: RequestOptions<TResponse> = {}
    ): Promise<TResponse> => {
      return executeRequest(
        () => restClient.post<TResponse, TRequest>(endpoint, data),
        options
      );
    },
    [executeRequest]
  );

  /**
   * PUT request with typed request and response
   */
  const put = useCallback(
    <TResponse = unknown, TRequest = unknown>(
      endpoint: string,
      data: TRequest,
      options: RequestOptions<TResponse> = {}
    ): Promise<TResponse> => {
      return executeRequest(
        () => restClient.put<TResponse, TRequest>(endpoint, data),
        options
      );
    },
    [executeRequest]
  );

  /**
   * DELETE request with typed response
   */
  const del = useCallback(
    <T = unknown>(endpoint: string, options: RequestOptions<T> = {}): Promise<T> => {
      return executeRequest(() => restClient.delete<T>(endpoint), options);
    },
    [executeRequest]
  );

  /**
   * Health check
   */
  const health = useCallback(
    (
      options: RequestOptions<{ status: string; timestamp: string }> = {}
    ): Promise<{ status: string; timestamp: string }> => {
      return executeRequest(() => restClient.health(), options);
    },
    [executeRequest]
  );

  return {
    // State
    loading,
    error,
    user,

    // Methods
    get,
    post,
    put,
    delete: del,
    health,
    executeRequest,
  };
}

// ============================================================================
// Streaming API Hook
// ============================================================================

/**
 * Hook for streaming AI responses
 */
export function useStreamingApi(): UseStreamingApiResult {
  const [streaming, setStreaming] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [chunks, setChunks] = useState<StreamChunk[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Start streaming request
   */
  const stream = useCallback(
    async (
      endpoint: string,
      data: unknown,
      onChunk?: (chunk: StreamChunk) => void,
      options: StreamingOptions = {}
    ): Promise<void> => {
      const { onStart, onComplete, onError } = options;

      setStreaming(true);
      setError(null);
      setChunks([]);
      abortControllerRef.current = new AbortController();

      try {
        if (onStart) onStart();

        await restClient.stream(
          endpoint,
          data,
          (chunk) => {
            setChunks((prev) => [...prev, chunk]);
            if (onChunk) onChunk(chunk);
          },
          { signal: abortControllerRef.current.signal }
        );

        if (onComplete) onComplete(chunks);
      } catch (err) {
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError('STREAM_ERROR', (err as Error).message, 0);
        setError(apiError);

        if (onError) {
          onError(apiError);
        }
      } finally {
        setStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [chunks]
  );

  /**
   * Stop streaming
   */
  const stopStreaming = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStreaming(false);
    }
  }, []);

  /**
   * Clear chunks
   */
  const clearChunks = useCallback((): void => {
    setChunks([]);
  }, []);

  return {
    streaming,
    error,
    chunks,
    stream,
    stopStreaming,
    clearChunks,
  };
}

// ============================================================================
// AI Coaching Hook
// ============================================================================

/**
 * Hook for AI coaching with streaming
 */
export function useAICoaching(): UseAICoachingResult {
  const streaming = useStreamingApi();
  const [coaching, setCoaching] = useState<CoachingResponse | null>(null);

  const startCoaching = useCallback(
    async (data: CoachConversationRequest): Promise<void> => {
      setCoaching(null);

      await streaming.stream('/ai/coaching', data, (chunk) => {
        // Accumulate coaching response
        setCoaching((prev) => ({
          ...prev,
          ...chunk,
          content: (prev?.content || '') + (chunk.content || ''),
        }));
      });
    },
    [streaming]
  );

  return {
    ...streaming,
    coaching,
    startCoaching,
  };
}

// ============================================================================
// AI Chat Hook
// ============================================================================

/**
 * Hook for AI chat with streaming
 */
export function useAIChat(): UseAIChatResult {
  const streaming = useStreamingApi();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = useCallback(
    async (message: string, context: Record<string, unknown> = {}): Promise<void> => {
      const newMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);

      await streaming.stream(
        '/ai/chat',
        {
          message,
          context,
          conversation_id: context.conversation_id,
        },
        (chunk) => {
          // Handle streaming response
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === 'assistant' && lastMessage.streaming) {
              // Update existing streaming message
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  content: lastMessage.content + (chunk.content || ''),
                },
              ];
            } else {
              // Add new assistant message
              return [
                ...prev,
                {
                  role: 'assistant',
                  content: chunk.content || '',
                  timestamp: new Date(),
                  streaming: true,
                },
              ];
            }
          });
        },
        {
          onComplete: () => {
            // Mark last message as complete
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage?.streaming) {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, streaming: false },
                ];
              }
              return prev;
            });
          },
        }
      );
    },
    [streaming]
  );

  return {
    ...streaming,
    messages,
    sendMessage,
  };
}

// ============================================================================
// RAG Hook
// ============================================================================

/**
 * Hook for RAG queries
 */
export function useRAG(): UseRAGResult {
  const { post, loading, error } = useRestApi();
  const [results, setResults] = useState<unknown | null>(null);

  const query = useCallback(
    async (queryText: string, options: Partial<RAGQueryRequest> = {}): Promise<unknown> => {
      setResults(null);

      const response = await post('/rag/query', {
        query: queryText,
        ...options,
      });

      setResults(response);
      return response;
    },
    [post]
  );

  return {
    query,
    results,
    loading,
    error,
  };
}

// ============================================================================
// Assessments Hook
// ============================================================================

/**
 * Hook for assessment operations
 */
export function useAssessments(): UseAssessmentsResult {
  const { get, post, loading, error } = useRestApi();
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);

  const fetchAssessments = useCallback(async (): Promise<unknown> => {
    const response = await get<{ assessments?: AssessmentResponse[] }>('/assessments');
    setAssessments(response.assessments || []);
    return response;
  }, [get]);

  const createAssessment = useCallback(
    async (data: CreateAssessmentRequest): Promise<unknown> => {
      const response = await post<unknown, CreateAssessmentRequest>('/assessments', data);
      // Refresh assessments list
      await fetchAssessments();
      return response;
    },
    [post, fetchAssessments]
  );

  return {
    assessments,
    fetchAssessments,
    createAssessment,
    loading,
    error,
  };
}
