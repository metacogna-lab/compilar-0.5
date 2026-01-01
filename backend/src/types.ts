/**
 * Type definitions for the Compilar backend
 */

import type { User } from '@supabase/supabase-js';

// Extend Hono context to include user and validated body
declare module 'hono' {
  interface ContextVariableMap {
    user: User;
    validatedBody: any;
  }
}

// Re-export common types
export type { User } from '@supabase/supabase-js';