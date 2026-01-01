import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Database Performance Optimization Service
 * Provides optimized queries, caching, and performance monitoring
 */

export class DatabaseService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Optimized assessment queries with proper indexing
   */
  async getUserAssessmentsOptimized(userId: string, options: {
    pillar?: string;
    mode?: 'egalitarian' | 'hierarchical';
    limit?: number;
    offset?: number;
  } = {}) {
    let query = this.supabase
      .from('pilar_assessments')
      .select('id, user_id, pillar_id, mode, scores, created_at, updated_at')
      .eq('user_id', userId);

    if (options.pillar) {
      query = query.eq('pillar_id', options.pillar);
    }

    if (options.mode) {
      query = query.eq('mode', options.mode);
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(options.limit || 50)
      .range(options.offset || 0, (options.offset || 0) + (options.limit || 50) - 1);

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Get assessment with related session data (optimized join)
   */
  async getAssessmentWithSessions(userId: string, assessmentId: string) {
    // First get the assessment
    const { data: assessment, error: assessmentError } = await this.supabase
      .from('pilar_assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', userId)
      .single();

    if (assessmentError) throw assessmentError;

    // Then get related sessions (using indexed query)
    const { data: sessions, error: sessionsError } = await this.supabase
      .from('assessment_sessions')
      .select('id, stage, responses, results, started_at, completed_at')
      .eq('user_id', userId)
      .eq('pillar_id', assessment.pillar_id)
      .eq('mode', assessment.mode)
      .order('started_at', { ascending: false })
      .limit(10);

    if (sessionsError) throw sessionsError;

    return {
      ...assessment,
      sessions: sessions || []
    };
  }

  /**
   * Batch user progress updates (reduces round trips)
   */
  async batchUpdateUserProgress(updates: Array<{
    userId: string;
    pillarId: string;
    mode: 'egalitarian' | 'hierarchical';
    experiencePoints?: number;
    level?: number;
    masteryScore?: number;
  }>) {
    const promises = updates.map(update => {
      return this.supabase
        .from('user_progress')
        .upsert({
          user_id: update.userId,
          pillar_id: update.pillarId,
          mode: update.mode,
          experience_points: update.experiencePoints,
          current_level: update.level,
          mastery_score: update.masteryScore,
          last_activity: new Date().toISOString()
        }, {
          onConflict: 'user_id,pillar_id,mode'
        });
    });

    const results = await Promise.allSettled(promises);
    const failures = results.filter(result => result.status === 'rejected');

    if (failures.length > 0) {
      console.error('Batch update failures:', failures);
    }

    return {
      successful: results.length - failures.length,
      failed: failures.length
    };
  }

  /**
   * Analytics queries with time-based partitioning optimization
   */
  async getUserAnalyticsAggregated(userId: string, options: {
    eventType?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  } = {}) {
    let query = this.supabase
      .from('user_analytics')
      .select('event_type, created_at, event_data')
      .eq('user_id', userId);

    if (options.eventType) {
      query = query.eq('event_type', options.eventType);
    }

    if (options.startDate) {
      query = query.gte('created_at', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Client-side aggregation (could be moved to stored procedure)
    const aggregated = data.reduce((acc, event) => {
      const date = new Date(event.created_at);
      const key = options.groupBy === 'week'
        ? `${date.getFullYear()}-W${Math.ceil((date.getDate() - date.getDay() + 1) / 7)}`
        : options.groupBy === 'month'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : date.toISOString().split('T')[0];

      if (!acc[key]) {
        acc[key] = { count: 0, events: [] };
      }

      acc[key].count++;
      acc[key].events.push(event);

      return acc;
    }, {} as Record<string, { count: number; events: any[] }>);

    return aggregated;
  }

  /**
   * Optimized team queries with member counts
   */
  async getUserTeamsWithMembers(userId: string) {
    // Get user's teams
    const { data: userTeams, error: teamsError } = await this.supabase
      .from('team_members')
      .select(`
        team_id,
        role,
        teams (
          id,
          team_name,
          description,
          created_at
        )
      `)
      .eq('user_id', userId);

    if (teamsError) throw teamsError;

    // Get member counts for each team
    const teamIds = userTeams.map(ut => ut.team_id);
    const { data: memberCounts, error: countsError } = await this.supabase
      .from('team_members')
      .select('team_id')
      .in('team_id', teamIds);

    if (countsError) throw countsError;

    // Aggregate member counts
    const countMap = memberCounts.reduce((acc, member) => {
      acc[member.team_id] = (acc[member.team_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Combine data
    return userTeams.map(userTeam => ({
      ...userTeam.teams,
      user_role: userTeam.role,
      member_count: countMap[userTeam.team_id] || 0
    }));
  }

  /**
   * Connection health check with performance metrics
   */
  async healthCheck() {
    const startTime = Date.now();

    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('count', { count: 'exact', head: true });

      const latency = Date.now() - startTime;

      return {
        status: error ? 'unhealthy' : 'healthy',
        latency,
        error: error?.message
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Query performance monitoring
   */
  async logSlowQuery(query: string, executionTime: number, params?: any) {
    // In production, this could write to a monitoring service
    console.warn(`Slow query detected: ${executionTime}ms`, {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      params,
      timestamp: new Date().toISOString()
    });
  }
}

// Factory function
export function createDatabaseService(supabase: SupabaseClient) {
  return new DatabaseService(supabase);
}