#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { config } from 'dotenv'

// Load environment variables
config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

console.log('🔍 Verifying Compilar Backend Setup...\n')

// Check environment variables
console.log('📋 Environment Variables:')
const envChecks = [
  { name: 'SUPABASE_URL', value: SUPABASE_URL, required: true },
  { name: 'SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY, required: true },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', value: SUPABASE_SERVICE_ROLE_KEY, required: true },
  { name: 'OPENAI_API_KEY', value: OPENAI_API_KEY, required: false },
  { name: 'GEMINI_API_KEY', value: GEMINI_API_KEY, required: false },
]

let envValid = true
envChecks.forEach(check => {
  const status = check.value ? '✅' : '❌'
  const masked = check.value ? (check.name.includes('KEY') ? '***' + check.value.slice(-4) : check.value) : 'NOT SET'
  console.log(`  ${status} ${check.name}: ${masked}`)
  if (check.required && !check.value) envValid = false
})

if (!envValid) {
  console.log('\n❌ Missing required environment variables. Please check your .env file.')
  process.exit(1)
}

// Check Supabase connection
console.log('\n🔌 Testing Supabase Connection...')
try {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Test basic connection
  const { data, error } = await supabase.from('pilar_knowledge').select('count').limit(1)

  if (error) {
    console.log('❌ Supabase connection failed:', error.message)
    process.exit(1)
  }

  console.log('✅ Supabase connection successful')

  // Check if tables exist
  console.log('\n📊 Checking Database Tables...')
  const tables = [
    'user_profiles',
    'pilar_assessments',
    'assessment_sessions',
    'user_progress',
    'cms_content',
    'pilar_knowledge',
    'teams',
    'user_gamification',
    'coach_conversations'
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error && !error.message.includes('Row Level Security')) {
        console.log(`❌ Table '${table}' check failed:`, error.message)
      } else {
        console.log(`✅ Table '${table}' exists`)
      }
    } catch (err) {
      console.log(`❌ Table '${table}' check failed:`, err.message)
    }
  }

  // Check PILAR knowledge data
  console.log('\n📚 Checking PILAR Knowledge Data...')
  const { data: pilarData, error: pilarError } = await supabase
    .from('pilar_knowledge')
    .select('pillar_id, mode, title')
    .limit(5)

  if (pilarError) {
    console.log('❌ PILAR knowledge check failed:', pilarError.message)
  } else {
    console.log(`✅ Found ${pilarData.length} PILAR knowledge entries`)
    pilarData.forEach(entry => {
      console.log(`   - ${entry.mode}: ${entry.title} (${entry.pillar_id})`)
    })
  }

} catch (error) {
  console.log('❌ Supabase test failed:', error.message)
  process.exit(1)
}

// Check API keys (optional)
console.log('\n🤖 AI API Keys:')
if (OPENAI_API_KEY) {
  console.log('✅ OpenAI API key configured')
} else {
  console.log('⚠️  OpenAI API key not configured (optional)')
}

if (GEMINI_API_KEY) {
  console.log('✅ Gemini API key configured')
} else {
  console.log('⚠️  Gemini API key not configured (optional)')
}

// Check file structure
console.log('\n📁 File Structure Check:')
const requiredFiles = [
  'src/index.ts',
  'src/routes/assessments.ts',
  'src/routes/blog.ts',
  'src/schemas/database.ts',
  'src/schemas/api.ts',
  'package.json',
  'supabase/migrations/20240101000000_initial_schema.sql',
  'supabase/migrations/20240101000001_rls_policies.sql',
  'supabase/seed/pilar_knowledge_seed.sql'
]

requiredFiles.forEach(file => {
  const exists = existsSync(file)
  console.log(`${exists ? '✅' : '❌'} ${file}`)
})

console.log('\n🎉 Backend verification complete!')
console.log('\n🚀 Next steps:')
console.log('1. Run: bun run dev (to start the development server)')
console.log('2. Test endpoints at http://localhost:3001')
console.log('3. Proceed to Phase 2: Assessment Flow Migration')

process.exit(0)