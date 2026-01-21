/**
 * Error Handler Middleware
 *
 * Global error handling with Langsmith logging for LLM-related errors
 */

import { Context } from 'hono';
import { trace } from '../services/llm/tracing';

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Global error handler for Hono
 *
 * Usage: app.onError(errorHandler)
 */
export const errorHandler = async (err: Error, c: Context) => {
  console.error('Error:', err);

  // Log to Langsmith if it's an LLM-related error
  if (err.message.includes('LLM') || err.message.includes('AI') || err.message.includes('OpenAI') || err.message.includes('Anthropic')) {
    try {
      await trace(
        'error_logging',
        async () => {
          return {
            error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
          };
        },
        undefined,
        {
          userId: c.get('user')?.id,
          feature: 'error_handling'
        }
      );
    } catch (traceError) {
      console.error('Failed to log error to Langsmith:', traceError);
    }
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return c.json({
      error: err.message,
      code: err.code
    }, err.status as any);
  }

  // Handle Supabase/PostgREST errors
  if (err.message.includes('PGRST')) {
    return c.json({
      error: 'Database error',
      code: 'DATABASE_ERROR'
    }, 500);
  }

  // Handle authentication errors
  if (err.message.includes('JWT') || err.message.includes('token')) {
    return c.json({
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    }, 401);
  }

  // Handle validation errors
  if (err.message.includes('validation') || err.message.includes('invalid')) {
    return c.json({
      error: err.message,
      code: 'VALIDATION_ERROR'
    }, 400);
  }

  // Default error response
  return c.json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    code: 'INTERNAL_ERROR'
  }, 500);
};

/**
 * Async error wrapper for route handlers
 *
 * Usage: app.get('/route', asyncHandler(async (c) => { ... }))
 */
export const asyncHandler = (fn: (c: Context) => Promise<Response>) => {
  return async (c: Context) => {
    try {
      return await fn(c);
    } catch (error) {
      return errorHandler(error as Error, c);
    }
  };
};
