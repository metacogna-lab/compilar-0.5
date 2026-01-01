import { z } from 'zod';
import type { MiddlewareHandler } from 'hono';

/**
 * Validation Middleware
 * Provides automatic request/response validation using Zod schemas
 */

/**
 * Create validation middleware for request body
 */
export function validateBody<T extends z.ZodType>(
  schema: T
): MiddlewareHandler {
  return async (c, next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);

      // Store validated data in context for use in route handlers
      c.set('validatedBody', validatedData);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        }, 400);
      }

      throw error;
    }
  };
}

/**
 * Create validation middleware for request query parameters
 */
export function validateQuery<T extends z.ZodType>(
  schema: T
): MiddlewareHandler {
  return async (c, next) => {
    try {
      const query = Object.fromEntries(
        Object.entries(c.req.query()).map(([key, value]) => [
          key,
          value === '' ? undefined : value
        ])
      );

      const validatedData = schema.parse(query);

      // Store validated data in context
      c.set('validatedQuery', validatedData);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        }, 400);
      }

      throw error;
    }
  };
}

/**
 * Create validation middleware for request params
 */
export function validateParams<T extends z.ZodType>(
  schema: T
): MiddlewareHandler {
  return async (c, next) => {
    try {
      const params = c.req.param();
      const validatedData = schema.parse(params);

      // Store validated data in context
      c.set('validatedParams', validatedData);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid path parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        }, 400);
      }

      throw error;
    }
  };
}

/**
 * Validate and format API response
 */
export function validateResponse<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: any } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Create standardized API response wrapper
 */
export function createApiResponse(
  data?: any,
  error?: any,
  meta?: Record<string, any>
) {
  const response: any = {
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      version: 'v1',
      ...meta
    }
  };

  if (error) {
    response.error = error;
  } else {
    response.data = data;
  }

  return response;
}

/**
 * Combined validation middleware for common patterns
 */
export function validateRequest({
  body,
  query,
  params
}: {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
}): MiddlewareHandler {
  return async (c, next) => {
    // Validate params first (highest priority)
    if (params) {
      const paramResult = validateParams(params);
      await paramResult(c, async () => {});
    }

    // Validate query
    if (query) {
      const queryResult = validateQuery(query);
      await queryResult(c, async () => {});
    }

    // Validate body
    if (body) {
      const bodyResult = validateBody(body);
      await bodyResult(c, async () => {});
    }

    await next();
  };
}