# API Migration Patterns

## Overview

This document outlines patterns and best practices for migrating API endpoints from Base44 SDK function calls to REST API endpoints in a Hono server. It covers route implementation, authentication, authorization, error handling, and response formatting patterns.

## Scope

This document covers migration patterns for:
- REST API endpoint design and implementation
- Authentication middleware patterns
- Authorization and access control
- Error handling and response formatting
- API versioning and documentation

## Prerequisites

- Understanding of REST API design principles
- Familiarity with Hono framework
- Knowledge of JWT authentication
- Experience with Base44 SDK function calls

## Related Documentation

- [Migration Patterns](migration-patterns.md)
- [Entity Migration Guide](entity-migration-guide.md)
- [Database Migration Guide](database-migration-guide.md)
- [Migration Checklist](migration-checklist.md)

---

## Hono Route Patterns

### CRUD Operations Pattern

**Context**: Implementing standard Create, Read, Update, Delete operations for entities.

**Problem**: Need to migrate Base44 entity operations to RESTful API endpoints with consistent structure.

**Solution**:
1. Map Base44 operations to REST HTTP methods
2. Implement standard URL patterns
3. Add consistent response formats
4. Include proper HTTP status codes
5. Handle query parameters for filtering and pagination

**Example**:
```typescript
import { Hono } from 'hono';
import { eq, and, desc, asc } from 'drizzle-orm';
import { users, posts } from './db/schema';
import { authMiddleware } from './middleware/auth';

const app = new Hono();

// Base44 equivalent: base44.entities.Post.list({ created_by: user.email })
app.get('/api/v1/posts', authMiddleware, async (c) => {
  const user = c.get('user');

  // Parse query parameters
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');
  const sortBy = c.req.query('sort_by') || 'created_at';
  const sortOrder = c.req.query('sort_order') || 'desc';

  // Build query with filters
  let query = db.select().from(posts).where(eq(posts.userId, user.id));

  // Apply sorting
  if (sortBy === 'created_at') {
    query = query.orderBy(sortOrder === 'desc' ? desc(posts.createdAt) : asc(posts.createdAt));
  }

  // Apply pagination
  query = query.limit(limit).offset(offset);

  const results = await query;

  // Get total count for pagination metadata
  const totalCount = await db
    .select({ count: count() })
    .from(posts)
    .where(eq(posts.userId, user.id));

  return c.json({
    data: results,
    meta: {
      total: totalCount[0].count,
      limit,
      offset,
      hasMore: offset + limit < totalCount[0].count
    }
  });
});

// Base44 equivalent: base44.entities.Post.get(postId)
app.get('/api/v1/posts/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const post = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, id), eq(posts.userId, user.id)))
    .limit(1);

  if (!post[0]) {
    return c.json({ error: 'Post not found' }, 404);
  }

  return c.json(post[0]);
});

// Base44 equivalent: base44.entities.Post.create(data)
app.post('/api/v1/posts', authMiddleware, async (c) => {
  const user = c.get('user');
  const data = await c.req.json();

  // Validate input
  const validation = validatePostData(data);
  if (!validation.valid) {
    return c.json({ error: 'Validation failed', details: validation.errors }, 400);
  }

  const result = await db
    .insert(posts)
    .values({
      userId: user.id,
      title: data.title,
      content: data.content,
      published: data.published || false,
      createdBy: user.id
    })
    .returning();

  return c.json(result[0], 201);
});

// Base44 equivalent: base44.entities.Post.update(postId, data)
app.put('/api/v1/posts/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const data = await c.req.json();

  // Validate input
  const validation = validatePostData(data);
  if (!validation.valid) {
    return c.json({ error: 'Validation failed', details: validation.errors }, 400);
  }

  const result = await db
    .update(posts)
    .set({
      title: data.title,
      content: data.content,
      published: data.published,
      updatedBy: user.id,
      updatedAt: new Date()
    })
    .where(and(eq(posts.id, id), eq(posts.userId, user.id)))
    .returning();

  if (!result[0]) {
    return c.json({ error: 'Post not found' }, 404);
  }

  return c.json(result[0]);
});

// Base44 equivalent: base44.entities.Post.delete(postId)
app.delete('/api/v1/posts/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const result = await db
    .delete(posts)
    .where(and(eq(posts.id, id), eq(posts.userId, user.id)))
    .returning();

  if (!result[0]) {
    return c.json({ error: 'Post not found' }, 404);
  }

  return c.json({ success: true });
});
```

**Benefits**:
- RESTful API design following HTTP conventions
- Consistent URL patterns across all entities
- Proper HTTP status codes for different operations
- Built-in support for filtering, sorting, and pagination

**Trade-offs**:
- More verbose than Base44 function calls
- Requires understanding of HTTP methods and status codes
- Additional complexity for query parameter handling

**Related Patterns**: Authenticated CRUD, Bulk Operations

### Public Read Pattern

**Context**: Endpoints that allow anonymous read access while requiring authentication for writes.

**Problem**: Need to support public content (blogs, profiles) while protecting write operations.

**Solution**:
1. Create separate middleware for read vs write operations
2. Allow unauthenticated access to GET requests
3. Require authentication for POST/PUT/DELETE
4. Implement rate limiting for public endpoints
5. Add caching for frequently accessed public data

**Example**:
```typescript
// Public read middleware (optional authentication)
const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = verify(token, process.env.JWT_SECRET!) as JWTPayload;
      c.set('user', payload);
    } catch (error) {
      // Invalid token, but don't fail - treat as anonymous
    }
  }

  await next();
};

// Public profile endpoint
app.get('/api/v1/profiles/:username', optionalAuthMiddleware, async (c) => {
  const username = c.req.param('username');
  const user = c.get('user'); // May be undefined for anonymous users

  const profile = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      displayName: profiles.displayName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      isPublic: profiles.isPublic,
      // Include private fields only for profile owner
      email: user && user.id === profiles.userId ? profiles.email : null,
      createdAt: profiles.createdAt
    })
    .from(profiles)
    .where(and(
      eq(profiles.username, username),
      eq(profiles.isPublic, true)
    ))
    .limit(1);

  if (!profile[0]) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  return c.json(profile[0]);
});

// Public posts listing
app.get('/api/v1/posts/public', optionalAuthMiddleware, async (c) => {
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');

  const posts = await db
    .select({
      id: posts.id,
      title: posts.title,
      excerpt: posts.excerpt,
      authorName: profiles.displayName,
      authorUsername: profiles.username,
      publishedAt: posts.publishedAt,
      tags: posts.tags
    })
    .from(posts)
    .innerJoin(profiles, eq(posts.userId, profiles.userId))
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    data: posts,
    meta: { limit, offset }
  });
});

// Authenticated write operations
app.post('/api/v1/posts', authMiddleware, async (c) => {
  // Requires authentication
  const user = c.get('user');
  // ... implementation
});

app.put('/api/v1/profiles/:username', authMiddleware, async (c) => {
  const user = c.get('user');
  const username = c.req.param('username');

  // Verify ownership
  if (user.username !== username) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // ... update implementation
});
```

**Benefits**:
- Supports public content sharing and SEO
- Maintains security for write operations
- Flexible authentication model

**Trade-offs**:
- Complex authorization logic
- Potential for information leakage
- Requires careful rate limiting

**Related Patterns**: Authenticated CRUD, Group-scoped

### Group-scoped Pattern

**Context**: Operations scoped to user groups, teams, or organizations.

**Problem**: Need to implement access control based on group membership rather than individual ownership.

**Solution**:
1. Check user's group membership before allowing access
2. Implement group-based authorization middleware
3. Support different permission levels within groups
4. Handle group membership changes gracefully
5. Implement group-scoped queries and operations

**Example**:
```typescript
// Group membership check middleware
const requireGroupAccess = (requiredRole: string = 'member') => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    const groupId = c.req.param('groupId') || c.req.query('group_id');

    if (!groupId) {
      return c.json({ error: 'Group ID required' }, 400);
    }

    // Check group membership and role
    const membership = await db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user.id)
      ))
      .limit(1);

    if (!membership[0]) {
      return c.json({ error: 'Not a group member' }, 403);
    }

    if (requiredRole === 'admin' && membership[0].role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    c.set('groupMembership', membership[0]);
    await next();
  };
};

// Group-scoped resource endpoints
app.get('/api/v1/groups/:groupId/posts', authMiddleware, requireGroupAccess(), async (c) => {
  const groupId = c.req.param('groupId');
  const membership = c.get('groupMembership');

  const posts = await db
    .select()
    .from(groupPosts)
    .where(eq(groupPosts.groupId, groupId))
    .orderBy(desc(groupPosts.createdAt));

  return c.json(posts);
});

// Admin-only group management
app.post('/api/v1/groups/:groupId/members', authMiddleware, requireGroupAccess('admin'), async (c) => {
  const groupId = c.req.param('groupId');
  const { userId, role } = await c.req.json();

  // Add member to group
  const result = await db
    .insert(groupMembers)
    .values({
      groupId,
      userId,
      role: role || 'member',
      addedBy: c.get('user').id
    })
    .returning();

  return c.json(result[0], 201);
});

// Bulk group operations
app.post('/api/v1/groups/:groupId/posts/bulk', authMiddleware, requireGroupAccess(), async (c) => {
  const groupId = c.req.param('groupId');
  const posts = await c.req.json();

  if (!Array.isArray(posts)) {
    return c.json({ error: 'Expected array of posts' }, 400);
  }

  const results = [];
  const errors = [];

  await db.transaction(async (tx) => {
    for (const post of posts) {
      try {
        const result = await tx
          .insert(groupPosts)
          .values({
            groupId,
            userId: c.get('user').id,
            ...post
          })
          .returning();

        results.push(result[0]);
      } catch (error) {
        errors.push({
          post,
          error: error.message
        });
      }
    }
  });

  return c.json({
    success: results,
    errors,
    totalProcessed: posts.length
  });
});
```

**Benefits**:
- Supports collaborative features
- Flexible permission models
- Scalable for organizations

**Trade-offs**:
- Complex membership management
- Potential for permission escalation bugs
- Requires careful group hierarchy design

**Related Patterns**: Authenticated CRUD, Bulk Operations

### Bulk Operations Pattern

**Context**: Handling multiple records in a single API request.

**Problem**: Need to efficiently process multiple records while maintaining transaction safety and providing detailed feedback.

**Solution**:
1. Accept array of operations in request body
2. Process operations in database transaction
3. Validate all data before processing
4. Return detailed results for each operation
5. Implement proper error handling and rollback

**Example**:
```typescript
// Bulk create/update/delete pattern
app.post('/api/v1/tasks/bulk', authMiddleware, async (c) => {
  const user = c.get('user');
  const operations = await c.req.json();

  if (!Array.isArray(operations)) {
    return c.json({ error: 'Expected array of operations' }, 400);
  }

  // Validate all operations first
  const validationErrors = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const validation = validateTaskOperation(op);
    if (!validation.valid) {
      validationErrors.push({
        index: i,
        operation: op,
        errors: validation.errors
      });
    }
  }

  if (validationErrors.length > 0) {
    return c.json({
      error: 'Validation failed',
      details: validationErrors
    }, 400);
  }

  // Process operations in transaction
  const results = { created: [], updated: [], deleted: [], errors: [] };

  await db.transaction(async (tx) => {
    for (const operation of operations) {
      try {
        let result;

        switch (operation.type) {
          case 'create':
            result = await tx
              .insert(tasks)
              .values({
                userId: user.id,
                ...operation.data,
                createdBy: user.id
              })
              .returning();
            results.created.push(result[0]);
            break;

          case 'update':
            result = await tx
              .update(tasks)
              .set({
                ...operation.data,
                updatedBy: user.id,
                updatedAt: new Date()
              })
              .where(and(
                eq(tasks.id, operation.id),
                eq(tasks.userId, user.id)
              ))
              .returning();

            if (result[0]) {
              results.updated.push(result[0]);
            } else {
              results.errors.push({
                operation,
                error: 'Task not found'
              });
            }
            break;

          case 'delete':
            result = await tx
              .delete(tasks)
              .where(and(
                eq(tasks.id, operation.id),
                eq(tasks.userId, user.id)
              ))
              .returning();

            if (result[0]) {
              results.deleted.push(result[0]);
            } else {
              results.errors.push({
                operation,
                error: 'Task not found'
              });
            }
            break;
        }
      } catch (error) {
        results.errors.push({
          operation,
          error: error.message
        });
      }
    }
  });

  return c.json({
    success: true,
    results,
    summary: {
      created: results.created.length,
      updated: results.updated.length,
      deleted: results.deleted.length,
      errors: results.errors.length,
      total: operations.length
    }
  });
});

// Validation helper
function validateTaskOperation(operation: any) {
  const errors = [];

  if (!operation.type || !['create', 'update', 'delete'].includes(operation.type)) {
    errors.push('Invalid operation type');
  }

  if (operation.type === 'update' || operation.type === 'delete') {
    if (!operation.id) {
      errors.push('ID required for update/delete operations');
    }
  }

  if (operation.type === 'create' || operation.type === 'update') {
    if (!operation.data || typeof operation.data !== 'object') {
      errors.push('Data object required for create/update operations');
    }

    if (operation.data.title && operation.data.title.length > 255) {
      errors.push('Title too long');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Benefits**:
- Efficient batch processing
- Transaction safety
- Detailed error reporting
- Atomic operations

**Trade-offs**:
- Complex request/response handling
- Memory usage with large batches
- Partial failure scenarios

**Related Patterns**: Authenticated CRUD, Group-scoped

### Streaming Responses Pattern

**Context**: Real-time data streaming for large datasets or live updates.

**Problem**: Need to handle large result sets or provide real-time updates without blocking.

**Solution**:
1. Implement server-sent events (SSE) for real-time updates
2. Use pagination with cursors for large datasets
3. Implement WebSocket support for bidirectional communication
4. Add proper connection management and cleanup
5. Handle client disconnections gracefully

**Example**:
```typescript
// Server-sent events for real-time updates
app.get('/api/v1/tasks/stream', authMiddleware, async (c) => {
  const user = c.get('user');

  // Set SSE headers
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');

  // Get initial data
  const tasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, user.id))
    .orderBy(desc(tasks.createdAt))
    .limit(50);

  // Send initial data
  c.write(`data: ${JSON.stringify({ type: 'initial', data: tasks })}\n\n`);

  // Set up real-time subscription (if using a pub/sub system)
  const unsubscribe = subscribeToTaskChanges(user.id, (change) => {
    c.write(`data: ${JSON.stringify(change)}\n\n`);
  });

  // Handle client disconnect
  c.req.raw.signal.addEventListener('abort', () => {
    unsubscribe();
  });

  // Keep connection alive
  const keepAlive = setInterval(() => {
    c.write(': keepalive\n\n');
  }, 30000);

  // Clean up on disconnect
  c.req.raw.signal.addEventListener('abort', () => {
    clearInterval(keepAlive);
    unsubscribe();
  });
});

// Paginated responses with cursor
app.get('/api/v1/tasks/paginated', authMiddleware, async (c) => {
  const user = c.get('user');
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
  const cursor = c.req.query('cursor'); // Base64 encoded ID

  let query = db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, user.id));

  // Apply cursor-based pagination
  if (cursor) {
    const decodedCursor = Buffer.from(cursor, 'base64').toString();
    query = query.where(gt(tasks.id, decodedCursor));
  }

  const results = await query
    .orderBy(asc(tasks.id))
    .limit(limit + 1); // Get one extra to check if there are more

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, -1) : results;

  // Create next cursor
  const nextCursor = hasMore && data.length > 0
    ? Buffer.from(data[data.length - 1].id).toString('base64')
    : null;

  return c.json({
    data,
    meta: {
      hasMore,
      nextCursor,
      limit
    }
  });
});

// WebSocket endpoint for bidirectional communication
app.get('/api/v1/tasks/ws', authMiddleware, async (c) => {
  const user = c.get('user');

  // Upgrade to WebSocket
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.json({ error: 'WebSocket upgrade required' }, 400);
  }

  // WebSocket implementation would depend on your WebSocket library
  // This is a conceptual example
  const ws = await upgradeWebSocket(c);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case 'subscribe':
          // Subscribe to task changes
          break;
        case 'update':
          // Handle real-time updates
          break;
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    // Clean up subscriptions
  });
});
```

**Benefits**:
- Handles large datasets efficiently
- Provides real-time updates
- Better user experience for dynamic content

**Trade-offs**:
- Complex connection management
- Server resource usage
- Browser compatibility considerations

**Related Patterns**: Bulk Operations, Authenticated CRUD

---

## Authentication Middleware Patterns

### JWT Token Validation Pattern

**Context**: Validating JWT tokens for API authentication.

**Problem**: Need to securely validate user identity from JWT tokens across all endpoints.

**Solution**:
1. Extract and validate JWT from Authorization header
2. Verify token signature and expiration
3. Extract user claims and validate user existence
4. Set user context for request processing
5. Handle token refresh and revocation

**Example**:
```typescript
import { verify, JwtPayload } from 'jsonwebtoken';
import { db } from './db/connection';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

interface UserContext {
  id: string;
  email: string;
  role: string;
  username?: string;
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      sub: string;
      email: string;
      role?: string;
      username?: string;
    };

    // Validate token expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return c.json({ error: 'Token expired' }, 401);
    }

    // Validate user still exists and is active
    const userRecord = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        username: users.username,
        active: users.active
      })
      .from(users)
      .where(eq(users.id, decoded.sub))
      .limit(1);

    if (!userRecord[0] || !userRecord[0].active) {
      return c.json({ error: 'User not found or inactive' }, 401);
    }

    // Set user context
    const userContext: UserContext = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role || 'user',
      username: userRecord[0].username
    };

    c.set('user', userContext);
    await next();
  } catch (error) {
    console.error('JWT validation error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Optional authentication for public endpoints
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    try {
      // Same validation logic as authMiddleware
      const userContext = await validateToken(authHeader.substring(7));
      c.set('user', userContext);
    } catch (error) {
      // Invalid token, but don't fail - treat as anonymous
      console.warn('Invalid token in optional auth:', error.message);
    }
  }

  await next();
};
```

**Benefits**:
- Stateless authentication
- Scalable across multiple servers
- Standard security practices
- Flexible user context

**Trade-offs**:
- Cannot revoke tokens immediately
- Requires secure secret management
- Additional database query per request

**Related Patterns**: Role-based Authorization, User Context Extraction

### Role-based Authorization Pattern

**Context**: Implementing permission-based access control.

**Problem**: Need to control access based on user roles and permissions.

**Solution**:
1. Define roles and their associated permissions
2. Create middleware to check required permissions
3. Implement hierarchical role system
4. Cache role definitions for performance
5. Audit authorization decisions

**Example**:
```typescript
// Role and permission definitions
export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest'
} as const;

export const PERMISSIONS = {
  CREATE_POST: 'create_post',
  EDIT_POST: 'edit_post',
  DELETE_POST: 'delete_post',
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SYSTEM: 'manage_system'
} as const;

// Role-permission mapping
const rolePermissions: Record<string, string[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.EDIT_POST,
    PERMISSIONS.DELETE_POST,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_SYSTEM
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.EDIT_POST,
    PERMISSIONS.DELETE_POST,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.USER]: [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.EDIT_POST
  ],
  [ROLES.GUEST]: [
    // No permissions
  ]
};

// Permission checking functions
export function hasPermission(userRole: string, requiredPermission: string): boolean {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(requiredPermission);
}

export function hasAnyPermission(userRole: string, requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: string, requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userRole, permission));
}

// Middleware for permission checking
export const requirePermission = (permission: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (!hasPermission(user.role, permission)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
};

export const requireAnyPermission = (permissions: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (!hasAnyPermission(user.role, permissions)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
};

// Usage examples
app.post('/api/v1/posts',
  authMiddleware,
  requirePermission(PERMISSIONS.CREATE_POST),
  async (c) => { /* ... */ }
);

app.get('/api/v1/analytics',
  authMiddleware,
  requireAnyPermission([PERMISSIONS.VIEW_ANALYTICS, PERMISSIONS.MANAGE_SYSTEM]),
  async (c) => { /* ... */ }
);

app.delete('/api/v1/users/:id',
  authMiddleware,
  requirePermission(PERMISSIONS.MANAGE_USERS),
  async (c) => {
    const user = c.get('user');
    const targetUserId = c.req.param('id');

    // Prevent users from deleting themselves or higher-role users
    if (targetUserId === user.id) {
      return c.json({ error: 'Cannot delete yourself' }, 400);
    }

    const targetUser = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (targetUser[0] && getRoleLevel(targetUser[0].role) >= getRoleLevel(user.role)) {
      return c.json({ error: 'Cannot delete user with equal or higher role' }, 403);
    }

    // ... delete user logic
  }
);

// Helper function for role hierarchy
function getRoleLevel(role: string): number {
  const levels = {
    [ROLES.GUEST]: 0,
    [ROLES.USER]: 1,
    [ROLES.MODERATOR]: 2,
    [ROLES.ADMIN]: 3
  };
  return levels[role] || 0;
}
```

**Benefits**:
- Flexible permission system
- Easy to modify roles and permissions
- Supports role hierarchies
- Audit-friendly

**Trade-offs**:
- Complex permission management
- Requires careful role design
- Potential for privilege escalation

**Related Patterns**: JWT Token Validation, User Context Extraction

---

## Error Handling Patterns

### Structured Error Response Pattern

**Context**: Consistent error handling and response formatting across all endpoints.

**Problem**: Need to provide clear, actionable error messages while maintaining security.

**Solution**:
1. Define standard error response format
2. Categorize errors by type and severity
3. Include appropriate HTTP status codes
4. Log errors for debugging while hiding sensitive information
5. Provide user-friendly error messages

**Example**:
```typescript
// Error types and status codes
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

export const ERROR_STATUS_MAP = {
  [ERROR_TYPES.VALIDATION_ERROR]: 400,
  [ERROR_TYPES.AUTHENTICATION_ERROR]: 401,
  [ERROR_TYPES.AUTHORIZATION_ERROR]: 403,
  [ERROR_TYPES.NOT_FOUND]: 404,
  [ERROR_TYPES.CONFLICT]: 409,
  [ERROR_TYPES.RATE_LIMITED]: 429,
  [ERROR_TYPES.INTERNAL_ERROR]: 500
} as const;

// Structured error response interface
interface ErrorResponse {
  error: {
    type: string;
    message: string;
    details?: any;
    code?: string;
    timestamp: string;
    requestId: string;
  };
}

// Error creation utilities
export class APIError extends Error {
  public type: string;
  public statusCode: number;
  public details?: any;
  public code?: string;

  constructor(type: string, message: string, details?: any, code?: string) {
    super(message);
    this.type = type;
    this.statusCode = ERROR_STATUS_MAP[type] || 500;
    this.details = details;
    this.code = code;
  }
}

export function createErrorResponse(error: APIError | Error, requestId: string): ErrorResponse {
  const timestamp = new Date().toISOString();

  if (error instanceof APIError) {
    return {
      error: {
        type: error.type,
        message: error.message,
        details: error.details,
        code: error.code,
        timestamp,
        requestId
      }
    };
  }

  // Generic error handling
  console.error('Unhandled error:', error);

  return {
    error: {
      type: ERROR_TYPES.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      timestamp,
      requestId
    }
  };
}

// Global error handler
app.onError((err, c) => {
  const requestId = c.get('requestId') || generateRequestId();

  // Log error with context
  console.error(`[${requestId}] Error:`, {
    error: err.message,
    stack: err.stack,
    url: c.req.url,
    method: c.req.method,
    user: c.get('user')?.id,
    timestamp: new Date().toISOString()
  });

  const errorResponse = createErrorResponse(err, requestId);
  const statusCode = err instanceof APIError ? err.statusCode : 500;

  return c.json(errorResponse, statusCode);
});

// Request ID middleware
app.use('*', async (c, next) => {
  const requestId = c.req.header('X-Request-ID') || generateRequestId();
  c.set('requestId', requestId);
  c.header('X-Request-ID', requestId);
  await next();
});

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Usage in route handlers
app.post('/api/v1/posts', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const data = await c.req.json();

    // Validation
    if (!data.title) {
      throw new APIError(
        ERROR_TYPES.VALIDATION_ERROR,
        'Title is required',
        { field: 'title' },
        'VALIDATION_TITLE_REQUIRED'
      );
    }

    // Check for duplicate title
    const existing = await db
      .select()
      .from(posts)
      .where(and(
        eq(posts.title, data.title),
        eq(posts.userId, user.id)
      ))
      .limit(1);

    if (existing[0]) {
      throw new APIError(
        ERROR_TYPES.CONFLICT,
        'A post with this title already exists',
        { title: data.title },
        'CONFLICT_DUPLICATE_TITLE'
      );
    }

    // ... create post logic

  } catch (error) {
    // Error will be handled by global error handler
    throw error;
  }
});
```

**Benefits**:
- Consistent error format across all endpoints
- Proper HTTP status codes
- Detailed error logging for debugging
- User-friendly error messages

**Trade-offs**:
- Additional error handling code in each route
- Complex error classification logic
- Potential information leakage if not careful

**Related Patterns**: Validation Pattern, Logging Pattern

### Validation Pattern

**Context**: Input validation for API requests.

**Problem**: Need to validate and sanitize user input to prevent security issues and data corruption.

**Solution**:
1. Define validation schemas for each endpoint
2. Validate input data before processing
3. Provide detailed validation error messages
4. Sanitize input to prevent injection attacks
5. Implement both client-side and server-side validation

**Example**:
```typescript
import { z } from 'zod';

// Validation schemas
const createPostSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),

  content: z.string()
    .min(1, 'Content is required')
    .max(10000, 'Content must be less than 10,000 characters'),

  tags: z.array(z.string().max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),

  published: z.boolean().default(false),

  categoryId: z.string().uuid('Invalid category ID').optional()
});

const updatePostSchema = createPostSchema.partial();

const postQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort_by: z.enum(['created_at', 'updated_at', 'title']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  published: z.coerce.boolean().optional(),
  category_id: z.string().uuid().optional(),
  search: z.string().max(100).optional()
});

// Validation middleware
const validateBody = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      c.set('validatedBody', validatedData);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        throw new APIError(
          ERROR_TYPES.VALIDATION_ERROR,
          'Validation failed',
          { errors: validationErrors },
          'VALIDATION_FAILED'
        );
      }
      throw error;
    }
  };
};

const validateQuery = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.queries();
      const validatedQuery = schema.parse(query);
      c.set('validatedQuery', validatedQuery);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        throw new APIError(
          ERROR_TYPES.VALIDATION_ERROR,
          'Invalid query parameters',
          { errors: validationErrors },
          'INVALID_QUERY_PARAMS'
        );
      }
      throw error;
    }
  };
};

// Usage in routes
app.post('/api/v1/posts',
  authMiddleware,
  validateBody(createPostSchema),
  async (c) => {
    const user = c.get('user');
    const data = c.get('validatedBody');

    // Data is already validated and typed
    const result = await db
      .insert(posts)
      .values({
        userId: user.id,
        ...data,
        createdBy: user.id
      })
      .returning();

    return c.json(result[0], 201);
  }
);

app.get('/api/v1/posts',
  authMiddleware,
  validateQuery(postQuerySchema),
  async (c) => {
    const user = c.get('user');
    const query = c.get('validatedQuery');

    let dbQuery = db
      .select()
      .from(posts)
      .where(eq(posts.userId, user.id));

    // Apply filters
    if (query.published !== undefined) {
      dbQuery = dbQuery.where(eq(posts.published, query.published));
    }

    if (query.category_id) {
      dbQuery = dbQuery.where(eq(posts.categoryId, query.category_id));
    }

    if (query.search) {
      dbQuery = dbQuery.where(ilike(posts.title, `%${query.search}%`));
    }

    // Apply sorting
    const sortColumn = query.sort_by === 'created_at' ? posts.createdAt :
                      query.sort_by === 'updated_at' ? posts.updatedAt :
                      posts.title;

    dbQuery = dbQuery.orderBy(
      query.sort_order === 'desc' ? desc(sortColumn) : asc(sortColumn)
    );

    // Apply pagination
    const results = await dbQuery.limit(query.limit).offset(query.offset);

    return c.json({
      data: results,
      meta: {
        limit: query.limit,
        offset: query.offset
      }
    });
  }
);

// Custom validation for business rules
const validatePostOwnership = async (c: Context, postId: string) => {
  const user = c.get('user');

  const post = await db
    .select()
    .from(posts)
    .where(and(
      eq(posts.id, postId),
      eq(posts.userId, user.id)
    ))
    .limit(1);

  if (!post[0]) {
    throw new APIError(
      ERROR_TYPES.NOT_FOUND,
      'Post not found',
      { postId },
      'POST_NOT_FOUND'
    );
  }

  return post[0];
};

app.put('/api/v1/posts/:id',
  authMiddleware,
  validateBody(updatePostSchema),
  async (c) => {
    const postId = c.req.param('id');
    const data = c.get('validatedBody');

    // Validate ownership
    await validatePostOwnership(c, postId);

    // Update post
    const result = await db
      .update(posts)
      .set({
        ...data,
        updatedBy: c.get('user').id,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId))
      .returning();

    return c.json(result[0]);
  }
);
```

**Benefits**:
- Type-safe input validation
- Detailed error messages
- Prevention of common security issues
- Consistent validation across endpoints

**Trade-offs**:
- Additional dependency on validation library
- Performance overhead for complex validations
- Schema maintenance as requirements change

**Related Patterns**: Error Handling Pattern, Authentication Pattern

---

## Response Formatting Patterns

### Consistent Response Structure Pattern

**Context**: Standardized API response formats for all endpoints.

**Problem**: Need to provide consistent, well-structured responses that are easy for clients to consume.

**Solution**:
1. Define standard response envelopes
2. Include metadata for pagination and counts
3. Provide consistent error formats
4. Include versioning information
5. Support different content types

**Example**:
```typescript
// Standard response interfaces
interface APIResponse<T = any> {
  data?: T;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
    [key: string]: any;
  };
  links?: {
    self: string;
    next?: string;
    prev?: string;
    first?: string;
    last?: string;
  };
}

interface ListResponse<T> extends APIResponse<T[]> {
  meta: APIResponse['meta'] & {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface ErrorResponse {
  error: {
    type: string;
    message: string;
    details?: any;
    code?: string;
    timestamp: string;
    requestId: string;
  };
}

// Response helper functions
function createSuccessResponse<T>(
  data: T,
  meta?: Record<string, any>,
  links?: Record<string, string>
): APIResponse<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: getCurrentRequestId(),
      version: 'v1',
      ...meta
    },
    links: links ? {
      self: getCurrentUrl(),
      ...links
    } : undefined
  };
}

function createListResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number,
  additionalMeta?: Record<string, any>
): ListResponse<T> {
  const hasMore = offset + data.length < total;
  const links: Record<string, string> = {
    self: getCurrentUrl()
  };

  // Add pagination links
  if (offset > 0) {
    const prevOffset = Math.max(0, offset - limit);
    links.prev = updateQueryParams(getCurrentUrl(), { offset: prevOffset, limit });
  }

  if (hasMore) {
    const nextOffset = offset + limit;
    links.next = updateQueryParams(getCurrentUrl(), { offset: nextOffset, limit });
  }

  links.first = updateQueryParams(getCurrentUrl(), { offset: 0, limit });
  links.last = updateQueryParams(getCurrentUrl(), {
    offset: Math.floor(total / limit) * limit,
    limit
  });

  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: getCurrentRequestId(),
      version: 'v1',
      total,
      limit,
      offset,
      hasMore,
      ...additionalMeta
    },
    links
  };
}

// Usage in route handlers
app.get('/api/v1/posts', authMiddleware, async (c) => {
  const user = c.get('user');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');

  // Get data
  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.userId, user.id))
    .orderBy(desc(postsTable.createdAt))
    .limit(limit + 1) // +1 to check if there are more
    .offset(offset);

  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, -1) : posts;

  // Get total count
  const totalResult = await db
    .select({ count: count() })
    .from(postsTable)
    .where(eq(postsTable.userId, user.id));

  const total = totalResult[0].count;

  const response = createListResponse(data, total, limit, offset);
  return c.json(response);
});

app.post('/api/v1/posts', authMiddleware, async (c) => {
  const user = c.get('user');
  const data = await c.req.json();

  // Create post
  const result = await db
    .insert(postsTable)
    .values({
      userId: user.id,
      ...data,
      createdBy: user.id
    })
    .returning();

  const response = createSuccessResponse(result[0], {
    action: 'create',
    resource: 'post'
  });

  return c.json(response, 201);
});

// Helper functions
function getCurrentRequestId(): string {
  // Implementation depends on your request ID middleware
  return 'req_123';
}

function getCurrentUrl(): string {
  // Implementation depends on your framework
  return 'http://api.example.com/api/v1/posts';
}

function updateQueryParams(url: string, params: Record<string, any>): string {
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value.toString());
  });
  return urlObj.toString();
}
```

**Benefits**:
- Consistent API structure
- Easy client consumption
- Built-in pagination support
- Extensible metadata

**Trade-offs**:
- Additional response wrapper overhead
- More complex response handling
- Potential over-engineering for simple APIs

**Related Patterns**: Pagination Pattern, Error Handling Pattern

---

## Best Practices

### Do's and Don'ts

**Do's**:
- Use RESTful URL patterns and HTTP methods
- Implement proper authentication and authorization
- Validate all input data thoroughly
- Provide detailed error messages for debugging
- Use consistent response formats
- Implement rate limiting for public endpoints
- Log all API requests and errors
- Use API versioning from day one
- Document all endpoints with examples
- Implement proper CORS headers

**Don'ts**:
- Don't expose sensitive data in error messages
- Don't use GET requests for state-changing operations
- Don't rely solely on client-side validation
- Don't implement business logic in middleware
- Don't return different response formats for the same endpoint
- Don't forget to handle CORS preflight requests
- Don't use generic error messages in production
- Don't expose internal system details in responses
- Don't forget to implement request timeouts
- Don't use synchronous operations for I/O

### Common Pitfalls

1. **Inconsistent Error Handling**: Mixing different error response formats
2. **Missing Input Validation**: Accepting invalid data that breaks business logic
3. **Authorization Bypass**: Forgetting to check permissions on sensitive operations
4. **SQL Injection**: Using string concatenation instead of parameterized queries
5. **Race Conditions**: Not handling concurrent requests properly
6. **Memory Leaks**: Not properly cleaning up resources
7. **Inadequate Logging**: Not logging enough information for debugging
8. **Poor Performance**: Not implementing pagination for large datasets

### Performance Considerations

- Use database connection pooling
- Implement caching for frequently accessed data
- Use pagination to limit response sizes
- Optimize database queries with proper indexes
- Implement rate limiting to prevent abuse
- Use streaming for large responses
- Compress responses when appropriate
- Implement request timeouts
- Use async/await properly to avoid blocking

### Security Considerations

- Always validate JWT tokens
- Implement proper CORS policies
- Use HTTPS for all API communications
- Sanitize user inputs
- Implement rate limiting
- Log security events
- Use parameterized queries
- Implement proper session management
- Validate file uploads
- Implement CSRF protection for state-changing operations

### Testing Recommendations

- Write unit tests for all middleware
- Implement integration tests for API endpoints
- Test error conditions and edge cases
- Use API testing tools like Postman or Insomnia
- Implement load testing for performance validation
- Test authentication and authorization thoroughly
- Automate API tests in CI/CD pipeline
- Test CORS and security headers
- Validate response schemas
- Test pagination and filtering

---

## Implementation Checklist

### API Design Checklist
- [ ] Define RESTful URL structure
- [ ] Choose HTTP methods for each operation
- [ ] Design consistent response formats
- [ ] Plan error handling strategy
- [ ] Design authentication mechanism
- [ ] Plan API versioning strategy
- [ ] Document all endpoints
- [ ] Design pagination strategy

### Authentication Implementation Checklist
- [ ] Implement JWT token validation middleware
- [ ] Create user context extraction
- [ ] Implement role-based authorization
- [ ] Add session management
- [ ] Test authentication flow
- [ ] Implement secure token storage
- [ ] Add token refresh mechanism
- [ ] Document authentication requirements

### Route Implementation Checklist
- [ ] Create route handlers for all operations
- [ ] Implement input validation
- [ ] Add proper error handling
- [ ] Implement authorization checks
- [ ] Add request/response logging
- [ ] Test all endpoints manually
- [ ] Implement rate limiting
- [ ] Add API documentation

### Error Handling Implementation Checklist
- [ ] Define error types and codes
- [ ] Implement structured error responses
- [ ] Add global error handler
- [ ] Implement input validation
- [ ] Add error logging
- [ ] Test error scenarios
- [ ] Document error responses
- [ ] Implement error monitoring

### Testing Implementation Checklist
- [ ] Write unit tests for middleware
- [ ] Implement integration tests
- [ ] Test authentication endpoints
- [ ] Test authorization scenarios
- [ ] Test error handling
- [ ] Test pagination and filtering
- [ ] Implement load testing
- [ ] Automate tests in CI/CD
- [ ] Test CORS and security

### Documentation Implementation Checklist
- [ ] Document all API endpoints
- [ ] Provide request/response examples
- [ ] Document authentication requirements
- [ ] Document error responses
- [ ] Create API changelog
- [ ] Add interactive API documentation
- [ ] Document rate limits
- [ ] Provide SDK examples

---

## Success Metrics

- **API Compatibility**: 100% of Base44 operations successfully migrated
- **Response Time**: API responses within 200ms for simple operations
- **Error Rate**: Less than 0.1% of requests result in 5xx errors
- **Test Coverage**: 95%+ test coverage for API endpoints
- **Documentation**: 100% of endpoints documented with examples
- **Security**: Zero security vulnerabilities in API implementation
- **Client Satisfaction**: Positive feedback from API consumers

---

## Version History

- **v1.0** (2024-01-01): Initial API migration patterns documentation
- **v1.1** (2024-01-15): Added advanced patterns and error handling
- **v1.2** (2024-02-01): Updated with real-world examples and testing patterns

---

## Related Documentation

- [Migration Patterns](migration-patterns.md)
- [Entity Migration Guide](entity-migration-guide.md)
- [Database Migration Guide](database-migration-guide.md)
- [Frontend Integration Guide](frontend-integration-guide.md)
- [Migration Checklist](migration-checklist.md)
- [Advanced Migration Patterns](advanced-migration-patterns.md)