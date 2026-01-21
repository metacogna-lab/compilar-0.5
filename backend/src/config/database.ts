/**
 * Database Configuration
 *
 * Centralized Supabase client configuration
 */

import { createClient } from '@supabase/supabase-js'

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if we should use mock database for testing
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || (!SUPABASE_URL || !SUPABASE_ANON_KEY)

if (USE_MOCK_DB) {
  console.warn('⚠️  Using mock database for testing. Set SUPABASE_URL and SUPABASE_ANON_KEY for production.')
} else {
  console.log('✅ Supabase database configured')
}

// Initialize Supabase clients or mock database
export const supabase = USE_MOCK_DB ? require('./mockDatabase').mockSupabase : createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const supabaseAdmin = USE_MOCK_DB ? require('./mockDatabase').mockSupabase : createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)