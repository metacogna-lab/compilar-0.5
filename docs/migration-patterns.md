# Migration Patterns

## Overview

This document catalogs reusable migration patterns and templates for migrating from Base44 SDK to standalone Hono server architecture. These patterns provide standardized approaches for common migration scenarios, ensuring consistency and reducing implementation time.

## Scope

This document covers migration patterns for:
- Entity operations (CRUD, relationships, authorization)
- API endpoint implementation
- Database schema management
- Authentication and authorization
- Testing strategies

## Prerequisites

- Understanding of Base44 SDK entity operations
- Familiarity with Hono framework and REST API design
- Knowledge of PostgreSQL database operations
- Experience with JWT authentication patterns

## Related Documentation

- [Entity Migration Guide](entity-migration-guide.md)
- [API Migration Patterns](api-migration-patterns.md)
- [Database Migration Guide](database-migration-guide.md)
- [Migration Checklist](migration-checklist.md)

---

## Entity Migration Patterns

### Simple CRUD Entity Pattern

**Context**: Basic entity with user ownership and standard CRUD operations.

**Problem**: Need to migrate a straightforward entity with create, read, update, delete operations and user-based authorization.

**Solution**:
1. Create PostgreSQL table with user ownership
2. Implement Hono routes for CRUD operations
3. Add JWT authentication middleware
4. Implement user-based authorization
5. Add proper error handling and validation

**Example**:
```sql
-- Database schema
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hono route implementation
app.post('/api/v1/user-profiles', async (c) => {
  const user = c.get('user');
  const data = await c.req.json();

  const result = await db
    .insert(userProfiles)
    .values({
      userId: user.id,
      email: user.email,
      ...data
    })
    .returning();

  return c.json(result[0]);
});
```

**Benefits**:
- Standardized user ownership pattern
- Consistent API structure
- Built-in authorization
- Easy to extend and maintain

**Trade-offs**:
- Additional database queries for authorization
- Requires JWT token validation on all requests

**Related Patterns**: Relationship Entity, Public Entity

### Relationship Entity Pattern

**Context**: Entity with foreign key relationships to other entities.

**Problem**: Need to migrate entities that reference other entities while maintaining referential integrity.

**Solution**:
1. Identify all foreign key relationships
2. Create tables with proper constraints
3. Implement cascading operations where appropriate
4. Add relationship validation in API layer
5. Handle orphaned records during migration

**Example**:
```sql
-- Database schema with relationships
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Hono route with relationship validation
app.post('/api/v1/team-members', async (c) => {
  const user = c.get('user');
  const { teamId, userId, role } = await c.req.json();

  // Validate team ownership
  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  if (!team[0] || team[0].ownerId !== user.id) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const result = await db
    .insert(teamMembers)
    .values({ teamId, userId, role })
    .returning();

  return c.json(result[0]);
});
```

**Benefits**:
- Maintains data integrity
- Automatic cleanup of related records
- Consistent relationship patterns

**Trade-offs**:
- Complex migration scripts for existing data
- Potential performance impact with cascading deletes

**Related Patterns**: Simple CRUD Entity, Group Entity

### Public Entity Pattern

**Context**: Entity with public read access but authenticated write operations.

**Problem**: Need to migrate entities that allow anonymous read access while requiring authentication for modifications.

**Solution**:
1. Implement separate middleware for read vs write operations
2. Add public read routes without authentication
3. Require authentication for create/update/delete
4. Implement rate limiting for public endpoints
5. Add caching for frequently accessed public data

**Example**:
```typescript
// Public read route (no auth required)
app.get('/api/v1/public-posts', async (c) => {
  const posts = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      authorName: users.displayName,
      createdAt: posts.createdAt
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  return c.json(posts);
});

// Authenticated write route
app.post('/api/v1/posts', authMiddleware, async (c) => {
  const user = c.get('user');
  const data = await c.req.json();

  const result = await db
    .insert(posts)
    .values({
      authorId: user.id,
      ...data
    })
    .returning();

  return c.json(result[0]);
});
```

**Benefits**:
- Enables public content sharing
- Maintains security for write operations
- Supports SEO and content discovery

**Trade-offs**:
- Requires careful rate limiting
- Potential for abuse of public endpoints
- Caching complexity for dynamic content

**Related Patterns**: Authenticated CRUD, Group-scoped

---

## API Migration Patterns

### Authenticated CRUD Pattern

**Context**: Standard REST API with JWT authentication for all operations.

**Problem**: Need to implement secure CRUD operations with consistent authentication.

**Solution**:
1. Apply authentication middleware to all routes
2. Extract user context from JWT token
3. Implement user-based authorization
4. Add proper error responses for unauthorized access
5. Include user context in database operations

**Example**:
```typescript
const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing authorization header' }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

app.get('/api/v1/user-profiles', authMiddleware, async (c) => {
  const user = c.get('user');

  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  return c.json(profile[0] || null);
});
```

**Benefits**:
- Consistent security across all endpoints
- User context available in all handlers
- Standardized error responses

**Trade-offs**:
- All requests require valid JWT tokens
- Additional latency for token verification

**Related Patterns**: Public Read, Group-scoped

### Bulk Operations Pattern

**Context**: Handling multiple records in a single API call.

**Problem**: Need to efficiently process multiple records while maintaining transaction safety.

**Solution**:
1. Accept array of records in request body
2. Wrap operations in database transaction
3. Validate all records before processing
4. Return detailed results for each operation
5. Implement proper error handling and rollback

**Example**:
```typescript
app.post('/api/v1/bulk-assessments', authMiddleware, async (c) => {
  const user = c.get('user');
  const assessments = await c.req.json();

  if (!Array.isArray(assessments)) {
    return c.json({ error: 'Expected array of assessments' }, 400);
  }

  const results = [];
  const errors = [];

  await db.transaction(async (tx) => {
    for (const assessment of assessments) {
      try {
        const result = await tx
          .insert(assessments)
          .values({
            userId: user.id,
            ...assessment
          })
          .returning();

        results.push(result[0]);
      } catch (error) {
        errors.push({
          assessment,
          error: error.message
        });
      }
    }
  });

  return c.json({
    success: results,
    errors,
    totalProcessed: assessments.length
  });
});
```

**Benefits**:
- Efficient batch processing
- Transaction safety
- Detailed error reporting

**Trade-offs**:
- Complex error handling logic
- Potential for partial failures
- Memory usage with large batches

**Related Patterns**: Streaming Responses, Authenticated CRUD

---

## Database Migration Patterns

### Schema Migration Pattern

**Context**: Creating and modifying database tables during migration.

**Problem**: Need to safely migrate database schema while preserving data.

**Solution**:
1. Create migration files with up/down scripts
2. Use transactions for schema changes
3. Add proper indexes and constraints
4. Test migrations on development data
5. Include rollback procedures

**Example**:
```sql
-- Migration: 001_create_user_profiles.sql
BEGIN;

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Add RLS policies if needed
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Rollback
-- DROP TABLE user_profiles;
```

**Benefits**:
- Version-controlled schema changes
- Safe rollback procedures
- Performance optimization with indexes

**Trade-offs**:
- Requires careful planning for production deployment
- Potential downtime during complex migrations

**Related Patterns**: Index Migration, Constraint Migration

### Index Optimization Pattern

**Context**: Adding performance indexes to support query patterns.

**Problem**: Database queries are slow due to missing indexes.

**Solution**:
1. Analyze query patterns from Base44 usage
2. Create appropriate indexes for common filters
3. Use composite indexes for multi-column queries
4. Monitor index usage and performance
5. Remove unused indexes to save space

**Example**:
```sql
-- Single column indexes
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_pillar ON assessments(pillar);
CREATE INDEX idx_assessments_created_at ON assessments(created_at);

-- Composite indexes for common query patterns
CREATE INDEX idx_assessments_user_pillar ON assessments(user_id, pillar);
CREATE INDEX idx_assessments_user_created ON assessments(user_id, created_at DESC);

-- Partial indexes for specific conditions
CREATE INDEX idx_assessments_completed ON assessments(user_id, completed_at)
WHERE completed_at IS NOT NULL;
```

**Benefits**:
- Improved query performance
- Reduced database load
- Better user experience

**Trade-offs**:
- Increased storage usage
- Slower write operations
- Requires ongoing maintenance

**Related Patterns**: Schema Migration, Data Migration

---

## Authentication Patterns

### JWT Token Validation Pattern

**Context**: Validating JWT tokens for API authentication.

**Problem**: Need to securely validate user identity from JWT tokens.

**Solution**:
1. Extract token from Authorization header
2. Verify token signature and expiration
3. Extract user claims from token payload
4. Validate token against revocation list if needed
5. Set user context for request processing

**Example**:
```typescript
import { verify } from 'jsonwebtoken';

const validateJWT = async (token: string): Promise<UserContext> => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }

    // Check if user still exists and is active
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.sub))
      .limit(1);

    if (!user[0] || !user[0].active) {
      throw new Error('User not found or inactive');
    }

    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role || 'user'
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
};
```

**Benefits**:
- Stateless authentication
- Scalable across multiple servers
- Standard security practices

**Trade-offs**:
- Cannot revoke tokens immediately
- Requires secure secret management
- Token size limits payload data

**Related Patterns**: User Context Extraction, Role-based Authorization

### Role-based Authorization Pattern

**Context**: Implementing permission-based access control.

**Problem**: Need to control access based on user roles and permissions.

**Solution**:
1. Define roles and permissions in database
2. Check user role against required permissions
3. Implement hierarchical role system
4. Cache role data for performance
5. Audit authorization decisions

**Example**:
```typescript
const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user'
} as const;

const PERMISSIONS = {
  CREATE_POST: 'create_post',
  DELETE_POST: 'delete_post',
  MANAGE_USERS: 'manage_users'
} as const;

const rolePermissions = {
  [ROLES.ADMIN]: [PERMISSIONS.CREATE_POST, PERMISSIONS.DELETE_POST, PERMISSIONS.MANAGE_USERS],
  [ROLES.MODERATOR]: [PERMISSIONS.CREATE_POST, PERMISSIONS.DELETE_POST],
  [ROLES.USER]: [PERMISSIONS.CREATE_POST]
};

const checkPermission = (userRole: string, requiredPermission: string): boolean => {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(requiredPermission);
};

// Usage in route
app.delete('/api/v1/posts/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const postId = c.req.param('id');

  if (!checkPermission(user.role, PERMISSIONS.DELETE_POST)) {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  // Delete post logic...
});
```

**Benefits**:
- Flexible permission system
- Easy to modify roles and permissions
- Audit trail capabilities

**Trade-offs**:
- Complex role hierarchy management
- Requires careful permission design
- Potential for privilege escalation bugs

**Related Patterns**: JWT Token Validation, User Context Extraction

---

## Testing Patterns

### Migration Testing Pattern

**Context**: Testing migrated functionality against Base44 behavior.

**Problem**: Need to ensure migrated code behaves identically to Base44 SDK.

**Solution**:
1. Create test fixtures with Base44 data
2. Implement parallel testing (Base44 vs migrated)
3. Compare API responses and database state
4. Test error conditions and edge cases
5. Automate regression testing

**Example**:
```typescript
describe('User Profile Migration', () => {
  let base44Client: Base44Client;
  let migratedClient: HonoClient;

  beforeAll(async () => {
    base44Client = new Base44Client({ apiKey: process.env.BASE44_KEY });
    migratedClient = new HonoClient({ baseURL: 'http://localhost:3000' });
  });

  test('Create user profile - identical behavior', async () => {
    const testData = {
      displayName: 'Test User',
      bio: 'Test bio'
    };

    // Test Base44
    const base44Result = await base44Client.entities.UserProfile.create(testData);

    // Test migrated
    const migratedResult = await migratedClient.post('/api/v1/user-profiles', {
      json: testData,
      headers: { Authorization: `Bearer ${testToken}` }
    });

    // Compare results
    expect(migratedResult.id).toBeDefined();
    expect(migratedResult.displayName).toBe(base44Result.displayName);
    expect(migratedResult.createdAt).toBeDefined();
  });

  test('Authorization - identical behavior', async () => {
    // Test that both systems reject unauthorized access identically
    const responses = await Promise.all([
      base44Client.entities.UserProfile.get(otherUserId).catch(e => e),
      migratedClient.get(`/api/v1/user-profiles/${otherUserId}`, {
        headers: { Authorization: `Bearer ${testToken}` }
      }).catch(e => e)
    ]);

    expect(responses[0].status).toBe(403);
    expect(responses[1].status).toBe(403);
  });
});
```

**Benefits**:
- Ensures behavioral compatibility
- Catches regression issues early
- Builds confidence in migration

**Trade-offs**:
- Requires maintaining Base44 access during testing
- Complex test setup and teardown
- Potential for test flakes due to timing

**Related Patterns**: API Testing, Database Testing

---

## Best Practices

### Do's and Don'ts

**Do's**:
- Use transactions for multi-step operations
- Implement proper error handling and logging
- Add comprehensive input validation
- Use parameterized queries to prevent SQL injection
- Implement rate limiting for public endpoints
- Add request/response logging for debugging
- Use connection pooling for database operations
- Implement graceful degradation for service failures

**Don'ts**:
- Don't expose sensitive data in error messages
- Don't use string concatenation for SQL queries
- Don't implement business logic in database triggers
- Don't skip input validation on trusted inputs
- Don't use root/admin database users in application code
- Don't log sensitive information like passwords or tokens
- Don't implement authentication without proper session management

### Common Pitfalls

1. **Authorization Bypass**: Forgetting to check ownership on update/delete operations
2. **SQL Injection**: Using string interpolation instead of parameterized queries
3. **Race Conditions**: Not using transactions for related operations
4. **Memory Leaks**: Not properly closing database connections
5. **Inconsistent Error Handling**: Mixing different error response formats
6. **Missing Validation**: Accepting invalid data that breaks business logic

### Performance Considerations

- Use database indexes for frequently queried columns
- Implement caching for expensive operations
- Use pagination for large result sets
- Optimize database queries to avoid N+1 problems
- Implement connection pooling
- Use prepared statements for repeated queries
- Monitor query performance and optimize slow queries

### Security Considerations

- Always validate JWT tokens on protected endpoints
- Implement proper CORS policies
- Use HTTPS for all API communications
- Sanitize user inputs to prevent XSS attacks
- Implement rate limiting to prevent abuse
- Log security events for audit purposes
- Regularly update dependencies for security patches

### Testing Recommendations

- Write unit tests for all business logic
- Implement integration tests for API endpoints
- Test error conditions and edge cases
- Use property-based testing for complex logic
- Implement load testing for performance validation
- Test authentication and authorization thoroughly
- Automate testing in CI/CD pipeline

---

## Implementation Checklist

### Entity Migration Checklist
- [ ] Identify all entity relationships and dependencies
- [ ] Create database schema with proper constraints
- [ ] Implement CRUD API endpoints
- [ ] Add authentication and authorization
- [ ] Implement input validation and sanitization
- [ ] Add comprehensive error handling
- [ ] Write unit and integration tests
- [ ] Test migration with real data
- [ ] Document API endpoints and usage
- [ ] Update client code to use new endpoints

### API Migration Checklist
- [ ] Design RESTful API structure
- [ ] Implement authentication middleware
- [ ] Create route handlers for all operations
- [ ] Add request/response validation
- [ ] Implement proper error responses
- [ ] Add logging and monitoring
- [ ] Test all endpoints thoroughly
- [ ] Document API with examples
- [ ] Implement rate limiting if needed
- [ ] Add API versioning strategy

### Database Migration Checklist
- [ ] Analyze existing data structure
- [ ] Create migration scripts with rollback
- [ ] Add appropriate indexes for performance
- [ ] Implement data validation constraints
- [ ] Test migrations on development data
- [ ] Plan production migration strategy
- [ ] Backup data before migration
- [ ] Monitor migration performance
- [ ] Validate data integrity after migration
- [ ] Document schema changes and rationale

### Authentication Migration Checklist
- [ ] Implement JWT token validation
- [ ] Create user context extraction
- [ ] Implement role-based authorization
- [ ] Add session management if needed
- [ ] Test authentication flow thoroughly
- [ ] Implement secure token storage
- [ ] Add token refresh mechanism
- [ ] Document authentication requirements
- [ ] Implement logout and token revocation
- [ ] Add security monitoring and alerts

### Testing Migration Checklist
- [ ] Create test fixtures with realistic data
- [ ] Implement unit tests for all functions
- [ ] Write integration tests for API endpoints
- [ ] Test error conditions and edge cases
- [ ] Implement performance and load tests
- [ ] Test authentication and authorization
- [ ] Automate testing in CI/CD pipeline
- [ ] Document test coverage requirements
- [ ] Implement monitoring for test results
- [ ] Plan for ongoing regression testing

---

## Success Metrics

- **API Compatibility**: 100% of Base44 operations successfully migrated
- **Performance**: Query performance within 10% of Base44 baseline
- **Security**: Zero security vulnerabilities in migrated code
- **Test Coverage**: 90%+ code coverage for new implementation
- **Error Rate**: Less than 0.1% error rate in production
- **Migration Time**: Complete migration within planned timeline
- **User Impact**: Zero downtime during production migration
- **Documentation**: 100% of endpoints and patterns documented

---

## Version History

- **v1.0** (2024-01-01): Initial migration patterns documentation
- **v1.1** (2024-01-15): Added advanced patterns and testing guidelines
- **v1.2** (2024-02-01): Updated with real-world migration examples

---

## Related Patterns

- [Entity Migration Guide](entity-migration-guide.md)
- [API Migration Patterns](api-migration-patterns.md)
- [Database Migration Guide](database-migration-guide.md)
- [Frontend Integration Guide](frontend-integration-guide.md)
- [Migration Checklist](migration-checklist.md)
- [Advanced Migration Patterns](advanced-migration-patterns.md)