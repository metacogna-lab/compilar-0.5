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

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required Supabase environment variables:')
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing')
  console.error('   SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '⚠️  Optional')
  console.error('\nPlease configure your .env file with Supabase credentials.')
  process.exit(1)
}

// Initialize Supabase clients
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)