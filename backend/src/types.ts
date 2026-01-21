/**
 * Type definitions for the Compilar backend
 */

import type { User } from '@supabase/supabase-js';

// Extend Hono context to include user and validated data
declare module 'hono' {
  interface ContextVariableMap {
    user: User;
    validatedBody: any;
    validatedQuery: any;
    validatedParams: any;
  }
}

// Re-export common types
export type { User } from '@supabase/supabase-js';