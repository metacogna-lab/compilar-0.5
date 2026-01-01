/**
 * Analytics Routes
 *
 * API endpoints for user, assessment, and team analytics
 */

import { Hono } from 'hono';
import { supabase } from '../index';
import { requireAuth, requireAdmin } from '../middleware/auth';

const analytics = new Hono();

/**
 * GET /api/v1/analytics/user/:id
 * Get analytics for a specific user
 * Users can only view their own analytics unless admin
 */
analytics.get('/user/:id', requireAuth, async (c) => {
  const currentUser = c.get('user');
  const targetUserId = c.req.param('id');

  // Check if user is viewing their own analytics or is admin
  if (currentUser.id !== targetUserId) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (profile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }
  }

  // Get user's assessments
  const { data: assessments, error: assessmentError } = await supabase
    .from('pilar_assessments')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false });

  if (assessmentError) {
    return c.json({ error: assessmentError.message }, 500);
  }

  // Calculate analytics
  const totalAssessments = assessments?.length || 0;
  const pillarsCovered = new Set(assessments?.map(a => a.pillar_id) || []);
  const modeDistribution = assessments?.reduce((acc: Record<string, number>, a) => {
    acc[a.mode] = (acc[a.mode] || 0) + 1;
    return acc;
  }, {}) || {};

  // Calculate average scores by pillar
  const scoresByPillar: Record<string, number[]> = {};
  assessments?.forEach(a => {
    if (!scoresByPillar[a.pillar_id]) {
      scoresByPillar[a.pillar_id] = [];
    }
    const scores = Object.values(a.scores || {});
    if (scores.length > 0) {
      const avg = scores.reduce((sum: number, score: any) => sum + (typeof score === 'number' ? score : 0), 0) / scores.length;
      scoresByPillar[a.pillar_id].push(avg);
    }
  });

  const pillarAverages: Record<string, number> = {};
  for (const [pillar, scores] of Object.entries(scoresByPillar)) {
    pillarAverages[pillar] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  // Assessment activity over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentAssessments = assessments?.filter(a =>
    new Date(a.created_at) >= thirtyDaysAgo
  ) || [];

  return c.json({
    userId: targetUserId,
    analytics: {
      totalAssessments,
      pillarsCovered: pillarsCovered.size,
      modeDistribution,
      pillarAverages,
      recentActivity: recentAssessments.length,
      assessmentTrend: recentAssessments.map(a => ({
        date: a.created_at,
        pillar: a.pillar_id,
        mode: a.mode
      }))
    }
  });
});

/**
 * GET /api/v1/analytics/assessments
 * Get platform-wide assessment analytics (admin only)
 */
analytics.get('/assessments', requireAuth, requireAdmin, async (c) => {
  // Get all assessments
  const { data: assessments, error: assessmentError } = await supabase
    .from('pilar_assessments')
    .select('*')
    .order('created_at', { ascending: false });

  if (assessmentError) {
    return c.json({ error: assessmentError.message }, 500);
  }

  // Calculate platform-wide statistics
  const totalAssessments = assessments?.length || 0;
  const uniqueUsers = new Set(assessments?.map(a => a.user_id) || []).size;

  // Distribution by pillar
  const pillarDistribution = assessments?.reduce((acc: Record<string, number>, a) => {
    acc[a.pillar_id] = (acc[a.pillar_id] || 0) + 1;
    return acc;
  }, {}) || {};

  // Distribution by mode
  const modeDistribution = assessments?.reduce((acc: Record<string, number>, a) => {
    acc[a.mode] = (acc[a.mode] || 0) + 1;
    return acc;
  }, {}) || {};

  // Average scores by pillar
  const scoresByPillar: Record<string, number[]> = {};
  assessments?.forEach(a => {
    if (!scoresByPillar[a.pillar_id]) {
      scoresByPillar[a.pillar_id] = [];
    }
    const scores = Object.values(a.scores || {});
    if (scores.length > 0) {
      const avg = scores.reduce((sum: number, score: any) => sum + (typeof score === 'number' ? score : 0), 0) / scores.length;
      scoresByPillar[a.pillar_id].push(avg);
    }
  });

  const pillarAverages: Record<string, number> = {};
  for (const [pillar, scores] of Object.entries(scoresByPillar)) {
    pillarAverages[pillar] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  // Assessments over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const assessmentsByDay = last7Days.map(day => ({
    date: day,
    count: assessments?.filter(a => a.created_at.startsWith(day)).length || 0
  }));

  return c.json({
    analytics: {
      totalAssessments,
      uniqueUsers,
      averageAssessmentsPerUser: uniqueUsers > 0 ? totalAssessments / uniqueUsers : 0,
      pillarDistribution,
      modeDistribution,
      pillarAverages,
      assessmentsByDay
    }
  });
});

/**
 * GET /api/v1/analytics/teams
 * Get platform-wide team analytics (admin only)
 */
analytics.get('/teams', requireAuth, requireAdmin, async (c) => {
  // Get all teams
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*');

  if (teamsError) {
    return c.json({ error: teamsError.message }, 500);
  }

  // Get team memberships
  const { data: memberships, error: membershipsError } = await supabase
    .from('team_members')
    .select('team_id, user_id, role');

  if (membershipsError) {
    return c.json({ error: membershipsError.message }, 500);
  }

  // Calculate team statistics
  const totalTeams = teams?.length || 0;
  const membershipsByTeam: Record<string, number> = {};
  const adminsByTeam: Record<string, number> = {};

  memberships?.forEach(m => {
    membershipsByTeam[m.team_id] = (membershipsByTeam[m.team_id] || 0) + 1;
    if (m.role === 'admin') {
      adminsByTeam[m.team_id] = (adminsByTeam[m.team_id] || 0) + 1;
    }
  });

  const teamSizes = Object.values(membershipsByTeam);
  const averageTeamSize = teamSizes.length > 0
    ? teamSizes.reduce((sum, size) => sum + size, 0) / teamSizes.length
    : 0;

  const largestTeamSize = teamSizes.length > 0 ? Math.max(...teamSizes) : 0;
  const smallestTeamSize = teamSizes.length > 0 ? Math.min(...teamSizes) : 0;

  // Teams created over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const teamsByDay = last7Days.map(day => ({
    date: day,
    count: teams?.filter(t => t.created_at.startsWith(day)).length || 0
  }));

  return c.json({
    analytics: {
      totalTeams,
      totalMemberships: memberships?.length || 0,
      averageTeamSize,
      largestTeamSize,
      smallestTeamSize,
      teamsByDay,
      teamSizeDistribution: {
        small: teamSizes.filter(s => s <= 5).length,
        medium: teamSizes.filter(s => s > 5 && s <= 20).length,
        large: teamSizes.filter(s => s > 20).length
      }
    }
  });
});

export { analytics };
