import { Hono } from 'hono'
import { supabase } from '../index'
import { requireAuth } from '../middleware/auth'

const entities = new Hono()

// Generic entity CRUD operations
function createEntityRoutes(entityName, tableName) {
  const entityRoutes = new Hono()

  // GET /api/v1/entities/:entity - List entities
  entityRoutes.get('/', requireAuth, async (c) => {
    const user = c.get('user')

    // Build query with filters
    let query = supabase.from(tableName).select('*')

    // Add user filter for user-specific tables
    const userSpecificTables = [
      'pilar_assessments', 'assessment_sessions', 'user_progress', 'user_profiles',
      'user_actions', 'development_plans', 'user_gamification', 'user_analytics',
      'session_analytics', 'user_profile_insights', 'learning_pathways',
      'peer_feedback', 'ai_insight_questions', 'user_sessions', 'assessment_guidance',
      'data_enrichment_recommendations', 'time_series_data', 'pilar_snapshots',
      'goal_mappings', 'coach_conversations'
    ]

    if (userSpecificTables.includes(tableName)) {
      query = query.eq('user_id', user.id)
    }

    // Apply query parameters
    const { data, error } = await query

    if (error) {
      return c.json({ error: error.message }, 500)
    }

    return c.json({ [entityName.toLowerCase()]: data })
  })

  // POST /api/v1/entities/:entity - Create entity
  entityRoutes.post('/', requireAuth, async (c) => {
    const user = c.get('user')

    const body = await c.req.json()

    // Add user_id for user-specific tables
    const userSpecificTables = [
      'pilar_assessments', 'assessment_sessions', 'user_progress', 'user_profiles',
      'user_actions', 'development_plans', 'user_gamification', 'user_analytics',
      'session_analytics', 'user_profile_insights', 'learning_pathways',
      'peer_feedback', 'ai_insight_questions', 'user_sessions', 'assessment_guidance',
      'data_enrichment_recommendations', 'time_series_data', 'pilar_snapshots',
      'goal_mappings', 'coach_conversations'
    ]

    if (userSpecificTables.includes(tableName)) {
      body.user_id = user.id
    }

    const { data, error } = await supabase
      .from(tableName)
      .insert(body)
      .select()
      .single()

    if (error) {
      return c.json({ error: error.message }, 500)
    }

    return c.json({ [entityName.toLowerCase().slice(0, -1)]: data }, 201)
  })

  // GET /api/v1/entities/:entity/:id - Get specific entity
  entityRoutes.get('/:id', requireAuth, async (c) => {
    const user = c.get('user')

    const id = c.req.param('id')
    let query = supabase.from(tableName).select('*').eq('id', id)

    // Add user filter for user-specific tables
    const userSpecificTables = [
      'pilar_assessments', 'assessment_sessions', 'user_progress', 'user_profiles',
      'user_actions', 'development_plans', 'user_gamification', 'user_analytics',
      'session_analytics', 'user_profile_insights', 'learning_pathways',
      'peer_feedback', 'ai_insight_questions', 'user_sessions', 'assessment_guidance',
      'data_enrichment_recommendations', 'time_series_data', 'pilar_snapshots',
      'goal_mappings', 'coach_conversations'
    ]

    if (userSpecificTables.includes(tableName)) {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Entity not found' }, 404)
      }
      return c.json({ error: error.message }, 500)
    }

    return c.json({ [entityName.toLowerCase().slice(0, -1)]: data })
  })

  // PUT /api/v1/entities/:entity/:id - Update entity
  entityRoutes.put('/:id', requireAuth, async (c) => {
    const user = c.get('user')

    const id = c.req.param('id')
    const body = await c.req.json()

    let query = supabase.from(tableName).update(body).eq('id', id)

    // Add user filter for user-specific tables
    const userSpecificTables = [
      'pilar_assessments', 'assessment_sessions', 'user_progress', 'user_profiles',
      'user_actions', 'development_plans', 'user_gamification', 'user_analytics',
      'session_analytics', 'user_profile_insights', 'learning_pathways',
      'peer_feedback', 'ai_insight_questions', 'user_sessions', 'assessment_guidance',
      'data_enrichment_recommendations', 'time_series_data', 'pilar_snapshots',
      'goal_mappings', 'coach_conversations'
    ]

    if (userSpecificTables.includes(tableName)) {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query.select().single()

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Entity not found' }, 404)
      }
      return c.json({ error: error.message }, 500)
    }

    return c.json({ [entityName.toLowerCase().slice(0, -1)]: data })
  })

  // DELETE /api/v1/entities/:entity/:id - Delete entity
  entityRoutes.delete('/:id', requireAuth, async (c) => {
    const user = c.get('user')

    const id = c.req.param('id')
    let query = supabase.from(tableName).delete().eq('id', id)

    // Add user filter for user-specific tables
    const userSpecificTables = [
      'pilar_assessments', 'assessment_sessions', 'user_progress', 'user_profiles',
      'user_actions', 'development_plans', 'user_gamification', 'user_analytics',
      'session_analytics', 'user_profile_insights', 'learning_pathways',
      'peer_feedback', 'ai_insight_questions', 'user_sessions', 'assessment_guidance',
      'data_enrichment_recommendations', 'time_series_data', 'pilar_snapshots',
      'goal_mappings', 'coach_conversations'
    ]

    if (userSpecificTables.includes(tableName)) {
      query = query.eq('user_id', user.id)
    }

    const { error } = await query

    if (error) {
      return c.json({ error: error.message }, 500)
    }

    return c.json({ success: true })
  })

  return entityRoutes
}

// Register entity routes
const entityMappings = {
  'pilar-assessments': 'pilar_assessments',
  'user-profiles': 'user_profiles',
  'assessment-sessions': 'assessment_sessions',
  'user-progress': 'user_progress',
  'user-actions': 'user_actions',
  'pilar-knowledge': 'pilar_knowledge',
  'group-rounds': 'group_rounds',
  'chat-messages': 'chat_messages',
  'development-plans': 'development_plans',
  'user-gamification': 'user_gamification',
  'challenges': 'challenges',
  'trophies': 'trophies',
  'user-analytics': 'user_analytics',
  'session-analytics': 'session_analytics',
  'group-analytics': 'group_analytics',
  'pilar-knowledge-vectors': 'pilar_knowledge_vectors',
  'user-profile-insights': 'user_profile_insights',
  'learning-pathways': 'learning_pathways',
  'battalions': 'battalions',
  'cooperative-operations': 'cooperative_operations',
  'teams': 'teams',
  'team-analytics': 'team_analytics',
  'team-invitations': 'team_invitations',
  'study-groups': 'study_groups',
  'peer-feedback': 'peer_feedback',
  'cms-content': 'cms_content',
  'ai-insight-questions': 'ai_insight_questions',
  'user-sessions': 'user_sessions',
  'force-prompt-cards': 'force_prompt_cards',
  'assessment-guidance': 'assessment_guidance',
  'data-enrichment-recommendations': 'data_enrichment_recommendations',
  'time-series-data': 'time_series_data',
  'pilar-snapshots': 'pilar_snapshots',
  'badges': 'badges',
  'mastery-levels': 'mastery_levels',
  'goal-mappings': 'goal_mappings',
  'coach-conversations': 'coach_conversations'
}

// Mount all entity routes
Object.entries(entityMappings).forEach(([routeName, tableName]) => {
  entities.route(`/${routeName}`, createEntityRoutes(routeName.replace(/-/g, ' '), tableName))
})

export { entities }