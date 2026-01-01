/**
 * Teams Routes
 *
 * API endpoints for team collaboration and management
 */

import { Hono } from 'hono';
import { supabase } from '../index';
import { requireAuth } from '../middleware/auth';
import { rateLimitGeneral } from '../middleware/ratelimit';

const teams = new Hono();

/**
 * GET /api/v1/teams
 * List teams the user is a member of
 */
teams.get('/', requireAuth, async (c) => {
  const user = c.get('user');

  // Get teams where user is a member
  const { data: memberships, error } = await supabase
    .from('team_members')
    .select(`
      team_id,
      role,
      teams (
        id,
        name,
        description,
        created_at,
        created_by
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  const teamsData = memberships?.map(m => ({
    ...(m as any).teams,
    user_role: m.role
  })) || [];

  return c.json({ teams: teamsData });
});

/**
 * POST /api/v1/teams
 * Create a new team
 */
teams.post('/', requireAuth, rateLimitGeneral, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { name, description } = body;

  if (!name) {
    return c.json({ error: 'name is required' }, 400);
  }

  // Create team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name,
      description: description || '',
      created_by: user.id
    })
    .select()
    .single();

  if (teamError) {
    return c.json({ error: teamError.message }, 500);
  }

  // Add creator as admin member
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: user.id,
      role: 'admin'
    });

  if (memberError) {
    // Rollback team creation if member addition fails
    await supabase.from('teams').delete().eq('id', team.id);
    return c.json({ error: 'Failed to create team membership' }, 500);
  }

  return c.json({ team }, 201);
});

/**
 * GET /api/v1/teams/:id
 * Get team details including members
 */
teams.get('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const teamId = c.req.param('id');

  // Verify user is a team member
  const { data: membership, error: membershipError } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single();

  if (membershipError) {
    if (membershipError.code === 'PGRST116') {
      return c.json({ error: 'Not a team member' }, 403);
    }
    return c.json({ error: membershipError.message }, 500);
  }

  // Get team details
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (teamError) {
    if (teamError.code === 'PGRST116') {
      return c.json({ error: 'Team not found' }, 404);
    }
    return c.json({ error: teamError.message }, 500);
  }

  // Get team members
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select(`
      user_id,
      role,
      joined_at
    `)
    .eq('team_id', teamId);

  if (membersError) {
    return c.json({ error: membersError.message }, 500);
  }

  return c.json({
    team: {
      ...team,
      members,
      user_role: membership.role
    }
  });
});

/**
 * PUT /api/v1/teams/:id
 * Update team details (admin only)
 */
teams.put('/:id', requireAuth, rateLimitGeneral, async (c) => {
  const user = c.get('user');
  const teamId = c.req.param('id');
  const body = await c.req.json();

  // Verify user is team admin
  const { data: membership, error: membershipError } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single();

  if (membershipError || membership?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  // Allowed update fields
  const allowedFields = ['name', 'description'];
  const updates: Record<string, any> = {};

  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  const { data: team, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', teamId)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ team });
});

/**
 * DELETE /api/v1/teams/:id
 * Delete team (admin only)
 */
teams.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const teamId = c.req.param('id');

  // Verify user is team admin
  const { data: membership, error: membershipError } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single();

  if (membershipError || membership?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  // Delete team (cascade will handle team_members)
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true, message: 'Team deleted successfully' });
});

/**
 * POST /api/v1/teams/:id/members
 * Add a member to the team (admin only)
 */
teams.post('/:id/members', requireAuth, rateLimitGeneral, async (c) => {
  const user = c.get('user');
  const teamId = c.req.param('id');
  const body = await c.req.json();
  const { user_id, role = 'member' } = body;

  if (!user_id) {
    return c.json({ error: 'user_id is required' }, 400);
  }

  if (!['admin', 'member'].includes(role)) {
    return c.json({ error: 'role must be admin or member' }, 400);
  }

  // Verify requester is team admin
  const { data: membership, error: membershipError } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single();

  if (membershipError || membership?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  // Check if user is already a member
  const { data: existing } = await supabase
    .from('team_members')
    .select('user_id')
    .eq('team_id', teamId)
    .eq('user_id', user_id)
    .single();

  if (existing) {
    return c.json({ error: 'User is already a team member' }, 400);
  }

  // Add member
  const { data: newMember, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id,
      role
    })
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ member: newMember }, 201);
});

/**
 * DELETE /api/v1/teams/:id/members/:userId
 * Remove a member from the team (admin only, or self-removal)
 */
teams.delete('/:id/members/:userId', requireAuth, async (c) => {
  const user = c.get('user');
  const teamId = c.req.param('id');
  const userIdToRemove = c.req.param('userId');

  // Check if user is removing themselves
  const isSelfRemoval = user.id === userIdToRemove;

  if (!isSelfRemoval) {
    // Verify requester is team admin
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || membership?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
  }

  // Prevent removing the last admin
  if (!isSelfRemoval) {
    const { data: targetMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userIdToRemove)
      .single();

    if (targetMember?.role === 'admin') {
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId)
        .eq('role', 'admin');

      if (count === 1) {
        return c.json({ error: 'Cannot remove the last admin' }, 400);
      }
    }
  }

  // Remove member
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userIdToRemove);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true, message: 'Member removed successfully' });
});

export { teams };
