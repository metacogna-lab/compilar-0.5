# Entity Migration Guide

## Overview

This guide provides a step-by-step process for migrating individual entities from Base44 SDK to standalone Hono server architecture. It covers assessment, planning, implementation, and validation phases for each entity migration.

## Scope

This guide applies to migrating Base44 entities to:
- PostgreSQL database tables
- Hono REST API endpoints
- Authentication and authorization logic
- Data validation and business rules

## Prerequisites

- Completed [Migration Patterns](migration-patterns.md) review
- Access to Base44 SDK documentation
- PostgreSQL database setup
- Hono server environment configured
- Test environment with sample data

## Related Documentation

- [Migration Patterns](migration-patterns.md)
- [API Migration Patterns](api-migration-patterns.md)
- [Database Migration Guide](database-migration-guide.md)
- [Migration Checklist](migration-checklist.md)

---

## Entity Assessment Checklist

### Pre-Migration Assessment

**Data Structure Analysis**
- [ ] Review Base44 entity schema and field types
- [ ] Identify all relationships (belongs_to, has_many, many_to_many)
- [ ] Document field constraints and validations
- [ ] Analyze data volume and growth patterns
- [ ] Identify sensitive or PII data fields

**Usage Pattern Analysis**
- [ ] Review common query patterns and filters
- [ ] Identify read/write operation frequencies
- [ ] Document user access patterns (public vs authenticated)
- [ ] Analyze performance requirements and SLAs
- [ ] Identify caching requirements

**Business Logic Assessment**
- [ ] Document all business rules and validations
- [ ] Identify dependent entities and cascade behaviors
- [ ] Review authorization requirements
- [ ] Document data lifecycle (creation, updates, deletion)
- [ ] Identify integration points with other systems

**Technical Dependencies**
- [ ] List all Base44 functions using this entity
- [ ] Identify frontend components consuming this entity
- [ ] Document external API integrations
- [ ] Review backup and recovery requirements
- [ ] Assess monitoring and alerting needs

### Risk Assessment

**Migration Complexity**
- [ ] Rate complexity: Low/Medium/High/Critical
- [ ] Identify potential data loss scenarios
- [ ] Assess rollback complexity
- [ ] Estimate migration downtime requirements
- [ ] Document fallback procedures

**Business Impact**
- [ ] Identify critical user workflows affected
- [ ] Assess impact of service unavailability
- [ ] Document communication requirements
- [ ] Plan user support during migration
- [ ] Define success criteria and KPIs

---

## Schema Migration Steps

### Database Table Creation

**Step 1: Create Base Table Structure**
```sql
-- Create table with primary key
CREATE TABLE entity_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add ownership field for user-scoped entities
ALTER TABLE entity_name ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add common audit fields
ALTER TABLE entity_name ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE entity_name ADD COLUMN updated_by UUID REFERENCES auth.users(id);
```

**Step 2: Add Entity-Specific Fields**
```sql
-- Add fields matching Base44 schema
ALTER TABLE entity_name ADD COLUMN field_name FIELD_TYPE;
ALTER TABLE entity_name ADD COLUMN another_field FIELD_TYPE CONSTRAINTS;

-- Example for user profile entity
ALTER TABLE user_profiles ADD COLUMN email TEXT NOT NULL UNIQUE;
ALTER TABLE user_profiles ADD COLUMN display_name TEXT;
ALTER TABLE user_profiles ADD COLUMN bio TEXT;
ALTER TABLE user_profiles ADD COLUMN avatar_url TEXT;
```

**Step 3: Create Indexes**
```sql
-- Primary lookup indexes
CREATE INDEX idx_entity_name_user_id ON entity_name(user_id);
CREATE INDEX idx_entity_name_created_at ON entity_name(created_at DESC);

-- Query optimization indexes
CREATE INDEX idx_entity_name_field ON entity_name(field_name);
CREATE INDEX idx_entity_name_composite ON entity_name(user_id, field_name);
```

**Step 4: Add Constraints**
```sql
-- Foreign key constraints
ALTER TABLE entity_name ADD CONSTRAINT fk_entity_name_user_id
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Check constraints
ALTER TABLE entity_name ADD CONSTRAINT chk_field_name_valid
  CHECK (field_name IN ('value1', 'value2', 'value3'));

-- Unique constraints
ALTER TABLE entity_name ADD CONSTRAINT unique_user_field
  UNIQUE (user_id, field_name);
```

### Data Migration Script

**Step 1: Create Migration Function**
```sql
CREATE OR REPLACE FUNCTION migrate_entity_name()
RETURNS INTEGER AS $$
DECLARE
  migrated_count INTEGER := 0;
  batch_size INTEGER := 1000;
  last_id UUID;
BEGIN
  -- Create temporary table for tracking migration
  CREATE TEMP TABLE migration_log (
    base44_id TEXT PRIMARY KEY,
    new_id UUID,
    migrated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Migrate data in batches
  LOOP
    -- Insert migrated data
    INSERT INTO entity_name (user_id, field_name, created_at, updated_at)
    SELECT
      u.id as user_id,
      b.field_name,
      b.created_at,
      b.updated_at
    FROM base44_entity_name b
    JOIN auth.users u ON u.email = b.created_by
    WHERE b.id > COALESCE(last_id, '00000000-0000-0000-0000-000000000000'::UUID)
    ORDER BY b.id
    LIMIT batch_size;

    -- Update migration log
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    EXIT WHEN migrated_count = 0;

    -- Get last processed ID for next batch
    SELECT MAX(id) INTO last_id FROM entity_name;
  END LOOP;

  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;
```

**Step 2: Execute Migration**
```sql
-- Run migration in transaction
BEGIN;
SELECT migrate_entity_name();
COMMIT;

-- Verify migration results
SELECT COUNT(*) as migrated_records FROM entity_name;
SELECT COUNT(*) as base44_records FROM base44_entity_name;
```

**Step 3: Data Validation**
```sql
-- Compare record counts
SELECT
  'entity_name' as table_name,
  COUNT(*) as migrated_count
FROM entity_name
UNION ALL
SELECT
  'base44_entity_name' as table_name,
  COUNT(*) as base44_count
FROM base44_entity_name;

-- Validate data integrity
SELECT
  b.id as base44_id,
  m.id as migrated_id,
  b.field_name = m.field_name as data_matches
FROM base44_entity_name b
LEFT JOIN entity_name m ON m.user_id = (
  SELECT id FROM auth.users WHERE email = b.created_by
)
WHERE b.field_name != m.field_name; -- Should return no rows
```

---

## API Endpoint Migration

### Route Implementation

**Step 1: Create Route Handlers**
```typescript
// Import required dependencies
import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { entityName } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

// List entities for authenticated user
app.get('/api/v1/entity-names', authMiddleware, async (c) => {
  const user = c.get('user');

  const entities = await db
    .select()
    .from(entityName)
    .where(eq(entityName.userId, user.id))
    .orderBy(desc(entityName.createdAt));

  return c.json(entities);
});

// Get specific entity
app.get('/api/v1/entity-names/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const entity = await db
    .select()
    .from(entityName)
    .where(and(
      eq(entityName.id, id),
      eq(entityName.userId, user.id)
    ))
    .limit(1);

  if (!entity[0]) {
    return c.json({ error: 'Entity not found' }, 404);
  }

  return c.json(entity[0]);
});

// Create new entity
app.post('/api/v1/entity-names', authMiddleware, async (c) => {
  const user = c.get('user');
  const data = await c.req.json();

  // Validate input
  const validation = validateEntityData(data);
  if (!validation.valid) {
    return c.json({ error: validation.errors }, 400);
  }

  const result = await db
    .insert(entityName)
    .values({
      userId: user.id,
      ...data,
      createdBy: user.id
    })
    .returning();

  return c.json(result[0]);
});

// Update entity
app.put('/api/v1/entity-names/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const data = await c.req.json();

  // Validate input
  const validation = validateEntityData(data);
  if (!validation.valid) {
    return c.json({ error: validation.errors }, 400);
  }

  const result = await db
    .update(entityName)
    .set({
      ...data,
      updatedBy: user.id,
      updatedAt: new Date()
    })
    .where(and(
      eq(entityName.id, id),
      eq(entityName.userId, user.id)
    ))
    .returning();

  if (!result[0]) {
    return c.json({ error: 'Entity not found' }, 404);
  }

  return c.json(result[0]);
});

// Delete entity
app.delete('/api/v1/entity-names/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const result = await db
    .delete(entityName)
    .where(and(
      eq(entityName.id, id),
      eq(entityName.userId, user.id)
    ))
    .returning();

  if (!result[0]) {
    return c.json({ error: 'Entity not found' }, 404);
  }

  return c.json({ success: true });
});
```

**Step 2: Add Input Validation**
```typescript
import { z } from 'zod';

const entitySchema = z.object({
  fieldName: z.string().min(1).max(255),
  anotherField: z.string().optional(),
  numericField: z.number().min(0).optional()
});

function validateEntityData(data: any) {
  try {
    entitySchema.parse(data);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    };
  }
}
```

**Step 3: Add Error Handling**
```typescript
// Global error handler
app.onError((err, c) => {
  console.error('API Error:', err);

  // Handle specific error types
  if (err instanceof ValidationError) {
    return c.json({ error: 'Validation failed', details: err.details }, 400);
  }

  if (err instanceof DatabaseError) {
    return c.json({ error: 'Database error' }, 500);
  }

  if (err instanceof AuthorizationError) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Generic error response
  return c.json({ error: 'Internal server error' }, 500);
});
```

### Authentication Middleware

**Step 1: Implement JWT Validation**
```typescript
import { verify } from 'jsonwebtoken';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing authorization header' }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const payload = verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Validate token expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return c.json({ error: 'Token expired' }, 401);
    }

    // Set user context
    c.set('user', {
      id: payload.sub,
      email: payload.email,
      role: payload.role || 'user'
    });

    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};
```

**Step 2: Add Role-Based Authorization**
```typescript
export const requireRole = (requiredRole: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user || user.role !== requiredRole) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
};

// Usage for admin-only endpoints
app.delete('/api/v1/entity-names/:id',
  authMiddleware,
  requireRole('admin'),
  async (c) => { /* ... */ }
);
```

---

## Testing and Validation

### Unit Testing

**Step 1: Test Database Operations**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/connection';
import { entityName } from '../db/schema';

describe('Entity Name Database Operations', () => {
  beforeEach(async () => {
    // Clean up test data
    await db.delete(entityName).where(eq(entityName.userId, testUserId));
  });

  it('should create entity with valid data', async () => {
    const testData = {
      userId: testUserId,
      fieldName: 'Test Value'
    };

    const result = await db.insert(entityName).values(testData).returning();

    expect(result[0]).toBeDefined();
    expect(result[0].fieldName).toBe(testData.fieldName);
    expect(result[0].userId).toBe(testData.userId);
  });

  it('should enforce user ownership', async () => {
    const entity = await db
      .select()
      .from(entityName)
      .where(and(
        eq(entityName.id, testEntityId),
        eq(entityName.userId, testUserId)
      ));

    expect(entity).toHaveLength(1);
  });

  it('should validate required fields', async () => {
    await expect(
      db.insert(entityName).values({ userId: testUserId })
    ).rejects.toThrow();
  });
});
```

**Step 2: Test API Endpoints**
```typescript
import { testClient } from '../test/utils';

describe('Entity Name API Endpoints', () => {
  it('should return user entities', async () => {
    const response = await testClient
      .get('/api/v1/entity-names')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should create new entity', async () => {
    const testData = { fieldName: 'New Entity' };

    const response = await testClient
      .post('/api/v1/entity-names')
      .set('Authorization', `Bearer ${testToken}`)
      .send(testData);

    expect(response.status).toBe(201);
    expect(response.body.fieldName).toBe(testData.fieldName);
  });

  it('should reject unauthorized access', async () => {
    const response = await testClient
      .get('/api/v1/entity-names')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });

  it('should validate input data', async () => {
    const invalidData = { fieldName: '' }; // Invalid: empty string

    const response = await testClient
      .post('/api/v1/entity-names')
      .set('Authorization', `Bearer ${testToken}`)
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('validation');
  });
});
```

### Integration Testing

**Step 1: End-to-End Migration Test**
```typescript
describe('Entity Migration E2E', () => {
  it('should migrate data correctly', async () => {
    // Setup: Create data in Base44
    const base44Entity = await base44Client.entities.EntityName.create({
      fieldName: 'Migration Test'
    });

    // Execute migration
    await runMigration('entity_name');

    // Verify: Check migrated data
    const migratedEntity = await db
      .select()
      .from(entityName)
      .where(eq(entityName.id, base44Entity.id))
      .limit(1);

    expect(migratedEntity[0]).toBeDefined();
    expect(migratedEntity[0].fieldName).toBe(base44Entity.fieldName);
  });

  it('should maintain referential integrity', async () => {
    // Test foreign key relationships
    const relatedEntity = await db
      .select()
      .from(entityName)
      .leftJoin(relatedTable, eq(entityName.id, relatedTable.entityId))
      .where(eq(entityName.userId, testUserId));

    // Verify all relationships are intact
    expect(relatedEntity.every(row => row.entity_name && row.related_table)).toBe(true);
  });
});
```

**Step 2: Performance Testing**
```typescript
describe('Entity Performance Tests', () => {
  it('should handle concurrent requests', async () => {
    const promises = Array(100).fill().map(() =>
      testClient
        .get('/api/v1/entity-names')
        .set('Authorization', `Bearer ${testToken}`)
    );

    const responses = await Promise.all(promises);

    expect(responses.every(r => r.status === 200)).toBe(true);
    expect(responses.every(r => Array.isArray(r.body))).toBe(true);
  });

  it('should perform within time limits', async () => {
    const startTime = Date.now();

    await testClient
      .get('/api/v1/entity-names')
      .set('Authorization', `Bearer ${testToken}`);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(500); // 500ms limit
  });
});
```

### Data Validation

**Step 1: Record Count Validation**
```sql
-- Compare record counts
SELECT
  'Migrated' as source,
  COUNT(*) as count
FROM entity_name
UNION ALL
SELECT
  'Base44' as source,
  COUNT(*) as count
FROM base44_entity_name;

-- Should show identical counts
```

**Step 2: Data Integrity Validation**
```sql
-- Check for orphaned records
SELECT COUNT(*) as orphaned_records
FROM entity_name e
LEFT JOIN auth.users u ON u.id = e.user_id
WHERE u.id IS NULL;

-- Should return 0 orphaned records

-- Validate field constraints
SELECT COUNT(*) as invalid_records
FROM entity_name
WHERE field_name IS NULL OR LENGTH(field_name) = 0;

-- Should return 0 invalid records
```

**Step 3: Relationship Validation**
```sql
-- Check foreign key relationships
SELECT COUNT(*) as broken_relationships
FROM entity_name e
LEFT JOIN related_entity r ON r.id = e.related_id
WHERE e.related_id IS NOT NULL AND r.id IS NULL;

-- Should return 0 broken relationships
```

---

## Rollback Procedures

### Database Rollback

**Step 1: Create Rollback Script**
```sql
-- Rollback migration for entity_name
BEGIN;

-- Drop migrated table
DROP TABLE IF EXISTS entity_name CASCADE;

-- Restore from backup if needed
-- (Backup should have been created before migration)

-- Recreate original structure if rolling back to Base44
-- (This would depend on your specific rollback strategy)

COMMIT;
```

**Step 2: Application Rollback**
```typescript
// Temporarily redirect API calls back to Base44
const USE_MIGRATED_API = process.env.USE_MIGRATED_API === 'true';

app.get('/api/v1/entity-names', async (c) => {
  if (USE_MIGRATED_API) {
    // Use migrated implementation
    return handleMigratedRequest(c);
  } else {
    // Fallback to Base44
    return proxyToBase44(c);
  }
});
```

### Data Recovery

**Step 1: Restore from Backup**
```sql
-- Restore table from backup
DROP TABLE IF EXISTS entity_name;
CREATE TABLE entity_name AS
SELECT * FROM entity_name_backup;

-- Restore indexes and constraints
CREATE INDEX idx_entity_name_user_id ON entity_name(user_id);
-- ... restore other indexes and constraints
```

**Step 2: Incremental Recovery**
```sql
-- Recover only changed records since migration
INSERT INTO entity_name (id, user_id, field_name, created_at, updated_at)
SELECT id, user_id, field_name, created_at, updated_at
FROM entity_name_backup
WHERE updated_at > '2024-01-01 00:00:00' -- Migration timestamp
ON CONFLICT (id) DO UPDATE SET
  field_name = EXCLUDED.field_name,
  updated_at = EXCLUDED.updated_at;
```

---

## Migration Checklist

### Pre-Migration
- [ ] Entity assessment completed
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Test environment prepared
- [ ] Stakeholder communication sent

### Migration Execution
- [ ] Database schema created
- [ ] Data migration script tested
- [ ] API endpoints implemented
- [ ] Authentication middleware added
- [ ] Input validation implemented
- [ ] Unit tests passing
- [ ] Integration tests passing

### Post-Migration Validation
- [ ] Record counts verified
- [ ] Data integrity checked
- [ ] API endpoints tested
- [ ] Performance validated
- [ ] User acceptance testing completed
- [ ] Monitoring alerts configured

### Go-Live Readiness
- [ ] Production environment updated
- [ ] Feature flags configured
- [ ] Rollback procedures tested
- [ ] Support team briefed
- [ ] User communication prepared
- [ ] Monitoring dashboards ready

---

## Common Issues and Solutions

### Data Migration Issues

**Issue: Foreign Key Violations**
```
Solution: Migrate related entities first, or disable constraints during migration
ALTER TABLE entity_name DISABLE TRIGGER ALL;
-- Migrate data
ALTER TABLE entity_name ENABLE TRIGGER ALL;
```

**Issue: Data Type Mismatches**
```
Solution: Add data transformation in migration script
SELECT
  id,
  CASE
    WHEN field_name::text ~ '^\d+$' THEN field_name::integer
    ELSE 0
  END as numeric_field
FROM base44_entity_name;
```

**Issue: Large Dataset Performance**
```
Solution: Implement batch processing with progress tracking
FOR batch IN 0..total_batches-1 LOOP
  -- Process batch
  PERFORM migrate_batch(batch * batch_size, batch_size);
  -- Log progress
  RAISE NOTICE 'Processed batch % of %', batch + 1, total_batches;
END LOOP;
```

### API Migration Issues

**Issue: Authentication Failures**
```
Solution: Verify JWT secret and token format consistency
// Debug token validation
console.log('Token payload:', decoded);
console.log('User lookup result:', userResult);
```

**Issue: Performance Degradation**
```
Solution: Add database indexes and optimize queries
EXPLAIN ANALYZE SELECT * FROM entity_name WHERE user_id = $1;
-- Add missing indexes based on query analysis
```

**Issue: Validation Errors**
```
Solution: Align validation rules with Base44 behavior
// Test validation against Base44 responses
const base44Response = await base44.create(testData);
const migratedResponse = await migrated.create(testData);
assert.deepEqual(validationErrors, base44Response.errors);
```

---

## Success Metrics

- **Data Accuracy**: 100% of records migrated without data loss
- **API Compatibility**: All Base44 operations work identically
- **Performance**: Response times within 10% of Base44 baseline
- **Test Coverage**: 95%+ test coverage for migrated code
- **Downtime**: Zero downtime during production migration
- **User Impact**: No user-reported issues post-migration

---

## Version History

- **v1.0** (2024-01-01): Initial entity migration guide
- **v1.1** (2024-01-15): Added advanced validation and rollback procedures
- **v1.2** (2024-02-01): Updated with real-world migration examples and troubleshooting

---

## Related Documentation

- [Migration Patterns](migration-patterns.md)
- [API Migration Patterns](api-migration-patterns.md)
- [Database Migration Guide](database-migration-guide.md)
- [Frontend Integration Guide](frontend-integration-guide.md)
- [Migration Checklist](migration-checklist.md)
- [Advanced Migration Patterns](advanced-migration-patterns.md)