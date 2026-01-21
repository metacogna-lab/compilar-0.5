/**
 * REST API React Hook
 *
 * Provides React-friendly interface to the REST API client with loading states,
 * error handling, and automatic token management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { restClient, ApiError } from '@/api/restClient';
import { supabase } from '../../utils/supabase';

/**
 * Hook for making REST API requests with React state management
 */
export function useRestApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        if (session?.access_token) {
          restClient.setAuthToken(session.access_token);
        } else {
          restClient.setAuthToken(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Execute API request with loading and error state management
   */
  const executeRequest = useCallback(async (requestFn, options = {}) => {
    const { silent = false, onSuccess, onError } = options;

    if (!silent) setLoading(true);
    setError(null);

    try {
      const response = await requestFn();

      // Handle different response types
      let data;
      if (response instanceof Response) {
        data = await response.json();
      } else {
        data = response;
      }

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('UNKNOWN_ERROR', err.message, 0);
      setError(apiError);

      if (onError) {
        onError(apiError);
      }

      throw apiError;
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  /**
   * GET request
   */
  const get = useCallback((endpoint, options = {}) => {
    return executeRequest(() => restClient.get(endpoint), options);
  }, [executeRequest]);

  /**
   * POST request
   */
  const post = useCallback((endpoint, data, options = {}) => {
    return executeRequest(() => restClient.post(endpoint, data), options);
  }, [executeRequest]);

  /**
   * PUT request
   */
  const put = useCallback((endpoint, data, options = {}) => {
    return executeRequest(() => restClient.put(endpoint, data), options);
  }, [executeRequest]);

  /**
   * DELETE request
   */
  const del = useCallback((endpoint, options = {}) => {
    return executeRequest(() => restClient.delete(endpoint), options);
  }, [executeRequest]);

  /**
   * Health check
   */
  const health = useCallback((options = {}) => {
    return executeRequest(() => restClient.health(), options);
  }, [executeRequest]);

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

/**
 * Hook for streaming AI responses
 */
export function useStreamingApi() {
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [chunks, setChunks] = useState([]);
  const abortControllerRef = useRef(null);

  /**
   * Start streaming request
   */
  const stream = useCallback(async (endpoint, data, onChunk, options = {}) => {
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
          setChunks(prev => [...prev, chunk]);
          if (onChunk) onChunk(chunk);
        },
        { signal: abortControllerRef.current.signal }
      );

      if (onComplete) onComplete(chunks);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('STREAM_ERROR', err.message, 0);
      setError(apiError);

      if (onError) {
        onError(apiError);
      }
    } finally {
      setStreaming(false);
      abortControllerRef.current = null;
    }
  }, [chunks]);

  /**
   * Stop streaming
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStreaming(false);
    }
  }, []);

  /**
   * Clear chunks
   */
  const clearChunks = useCallback(() => {
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

/**
 * Hook for AI coaching with streaming
 */
export function useAICoaching() {
  const streaming = useStreamingApi();
  const [coaching, setCoaching] = useState(null);

  const startCoaching = useCallback(async (data) => {
    setCoaching(null);

    await streaming.stream('/ai/coaching', data, (chunk) => {
      // Accumulate coaching response
      setCoaching(prev => ({
        ...prev,
        ...chunk,
        content: (prev?.content || '') + (chunk.content || ''),
      }));
    });
  }, [streaming]);

  return {
    ...streaming,
    coaching,
    startCoaching,
  };
}

/**
 * Hook for AI chat with streaming
 */
export function useAIChat() {
  const streaming = useStreamingApi();
  const [messages, setMessages] = useState([]);

  const sendMessage = useCallback(async (message, context = {}) => {
    const newMessage = { role: 'user', content: message, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);

    await streaming.stream('/ai/chat', {
      message,
      context,
      conversation_id: context.conversation_id,
    }, (chunk) => {
      // Handle streaming response
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage.streaming) {
          // Update existing streaming message
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: lastMessage.content + (chunk.content || ''),
            }
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
            }
          ];
        }
      });
    }, {
      onComplete: () => {
        // Mark last message as complete
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.streaming) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, streaming: false }
            ];
          }
          return prev;
        });
      }
    });
  }, [streaming]);

  return {
    ...streaming,
    messages,
    sendMessage,
  };
}

/**
 * Hook for RAG queries
 */
export function useRAG() {
  const { post, loading, error } = useRestApi();
  const [results, setResults] = useState(null);

  const query = useCallback(async (queryText, options = {}) => {
    setResults(null);

    const response = await post('/rag/query', {
      query: queryText,
      ...options,
    });

    setResults(response);
    return response;
  }, [post]);

  return {
    query,
    results,
    loading,
    error,
  };
}

/**
 * Hook for assessment operations
 */
export function useAssessments() {
  const { get, post, loading, error } = useRestApi();
  const [assessments, setAssessments] = useState([]);

  const fetchAssessments = useCallback(async () => {
    const response = await get('/assessments');
    setAssessments(response.assessments || []);
    return response;
  }, [get]);

  const createAssessment = useCallback(async (data) => {
    const response = await post('/assessments', data);
    // Refresh assessments list
    await fetchAssessments();
    return response;
  }, [post, fetchAssessments]);

  return {
    assessments,
    fetchAssessments,
    createAssessment,
    loading,
    error,
  };
}