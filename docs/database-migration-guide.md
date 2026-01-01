# Database Migration Guide

## Overview

This guide provides comprehensive patterns and best practices for migrating database schemas from Base44 to standalone PostgreSQL. It covers schema design, data migration, performance optimization, and maintenance strategies for production databases.

## Scope

This guide covers database migration aspects including:
- Schema design and table creation
- Index optimization strategies
- Data migration scripts
- Constraint implementation
- Performance tuning
- Backup and recovery procedures

## Prerequisites

- PostgreSQL database administration experience
- Understanding of relational database design
- Knowledge of SQL and database migration tools
- Access to Base44 data export capabilities
- Production database environment setup

## Related Documentation

- [Migration Patterns](migration-patterns.md)
- [Entity Migration Guide](entity-migration-guide.md)
- [API Migration Patterns](api-migration-patterns.md)
- [Migration Checklist](migration-checklist.md)

---

## Schema Migration Patterns

### Table Creation Pattern

**Context**: Creating database tables with proper structure and constraints.

**Problem**: Need to create tables that match Base44 entity schemas while optimizing for PostgreSQL.

**Solution**:
1. Define table structure with appropriate data types
2. Add primary keys and foreign key constraints
3. Implement check constraints for data validation
4. Add default values and auto-generated columns
5. Create indexes for performance
6. Add table comments for documentation

**Example**:
```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  email_verified BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Add table comment
COMMENT ON TABLE users IS 'User accounts and profiles';
COMMENT ON COLUMN users.role IS 'User role for authorization: admin, moderator, user';

-- Create indexes
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE active = true;
CREATE UNIQUE INDEX idx_users_username ON users(username) WHERE active = true;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_role ON users(role) WHERE active = true;

-- Create posts table with foreign key
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 255),
  content TEXT NOT NULL,
  excerpt TEXT GENERATED ALWAYS AS (
    CASE
      WHEN length(content) > 200 THEN substring(content, 1, 200) || '...'
      ELSE content
    END
  ) STORED,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id),
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Add table and column comments
COMMENT ON TABLE posts IS 'User-created posts and articles';
COMMENT ON COLUMN posts.excerpt IS 'Auto-generated excerpt from content';
COMMENT ON COLUMN posts.tags IS 'Array of tag strings for categorization';

-- Create indexes for posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published ON posts(published) WHERE published = true;
CREATE INDEX idx_posts_published_at ON posts(published_at DESC) WHERE published = true;
CREATE INDEX idx_posts_category_id ON posts(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Create partial indexes for better performance
CREATE INDEX idx_posts_user_published ON posts(user_id, published_at DESC)
WHERE published = true;

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT CHECK (color ~ '^#[0-9A-Fa-f]{6}$'), -- Hex color validation
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Add foreign key from posts to categories
ALTER TABLE posts ADD CONSTRAINT fk_posts_category_id
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
```

**Benefits**:
- Proper data integrity with constraints
- Optimized queries with strategic indexes
- Self-documenting schema with comments
- Generated columns for computed values

**Trade-offs**:
- More complex schema design upfront
- Additional storage for indexes
- Constraint validation overhead

**Related Patterns**: Index Optimization, Constraint Migration

### Index Optimization Pattern

**Context**: Creating indexes to optimize query performance.

**Problem**: Database queries are slow due to missing or poorly designed indexes.

**Solution**:
1. Analyze query patterns from application code
2. Create single-column indexes for equality filters
3. Use composite indexes for multi-column queries
4. Implement partial indexes for filtered queries
5. Add indexes for foreign keys
6. Use appropriate index types (B-tree, GIN, GiST)
7. Monitor and maintain index usage

**Example**:
```sql
-- Single-column indexes for common filters
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_updated_at ON posts(updated_at DESC);

-- Composite indexes for multi-column queries
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_user_published ON posts(user_id, published, published_at DESC);

-- Partial indexes for specific conditions
CREATE INDEX idx_posts_published_only ON posts(published_at DESC)
WHERE published = true;

CREATE INDEX idx_posts_user_drafts ON posts(user_id, updated_at DESC)
WHERE published = false;

-- Foreign key indexes (usually auto-created, but explicit for clarity)
CREATE INDEX idx_posts_category_id ON posts(category_id);

-- GIN indexes for array columns
CREATE INDEX idx_posts_tags_gin ON posts USING GIN(tags);

-- Text search indexes
CREATE INDEX idx_posts_title_search ON posts USING GIN(to_tsvector('english', title));
CREATE INDEX idx_posts_content_search ON posts USING GIN(to_tsvector('english', content));

-- Unique indexes for business constraints
CREATE UNIQUE INDEX idx_users_email_active ON users(email) WHERE active = true;
CREATE UNIQUE INDEX idx_categories_slug_active ON categories(slug) WHERE active = true;

-- Function-based indexes
CREATE INDEX idx_posts_month ON posts(EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at));

-- Index for JSONB data (if using JSONB columns)
CREATE INDEX idx_user_preferences_gin ON user_preferences USING GIN(preferences);

-- Covering indexes (include data columns to avoid table lookups)
CREATE INDEX idx_posts_list ON posts(user_id, published, published_at DESC, title, excerpt)
WHERE published = true;
```

**Index Maintenance**:
```sql
-- Monitor index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname NOT IN ('pg_catalog', 'information_schema');

-- Reindex for maintenance
REINDEX INDEX CONCURRENTLY idx_posts_user_id;

-- Analyze table for query planning
ANALYZE posts;
```

**Benefits**:
- Significantly improved query performance
- Reduced database load
- Better user experience
- Optimized resource usage

**Trade-offs**:
- Increased storage usage
- Slower write operations
- Index maintenance overhead
- Complex index design decisions

**Related Patterns**: Schema Migration, Data Migration

### Constraint Migration Pattern

**Context**: Implementing data integrity constraints in the database.

**Problem**: Need to ensure data consistency and prevent invalid data entry.

**Solution**:
1. Add NOT NULL constraints for required fields
2. Implement CHECK constraints for value validation
3. Create UNIQUE constraints for business rules
4. Add FOREIGN KEY constraints for relationships
5. Use EXCLUDE constraints for complex business rules
6. Implement triggers for advanced validation

**Example**:
```sql
-- Basic constraints
ALTER TABLE users ADD CONSTRAINT chk_users_email_format
  CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users ADD CONSTRAINT chk_users_role_valid
  CHECK (role IN ('admin', 'moderator', 'user', 'guest'));

-- Unique constraints with conditions
ALTER TABLE users ADD CONSTRAINT unique_active_email
  EXCLUDE (email WITH =) WHERE (active = true);

ALTER TABLE categories ADD CONSTRAINT unique_active_slug
  EXCLUDE (slug WITH =) WHERE (active = true);

-- Foreign key constraints with cascading
ALTER TABLE posts ADD CONSTRAINT fk_posts_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE posts ADD CONSTRAINT fk_posts_category_id
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Check constraints for data validation
ALTER TABLE posts ADD CONSTRAINT chk_posts_title_length
  CHECK (length(trim(title)) >= 1 AND length(trim(title)) <= 255);

ALTER TABLE posts ADD CONSTRAINT chk_posts_published_at
  CHECK (
    (published = false AND published_at IS NULL) OR
    (published = true AND published_at IS NOT NULL)
  );

-- Complex business rule constraints
ALTER TABLE posts ADD CONSTRAINT chk_posts_publish_permissions
  CHECK (
    published = false OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = posts.user_id
      AND users.active = true
      AND users.email_verified = true
    )
  );

-- EXCLUDE constraints for advanced uniqueness
ALTER TABLE events ADD CONSTRAINT unique_event_per_day
  EXCLUDE (user_id WITH =, date_trunc('day', event_date) WITH =)
  WHERE (cancelled = false);

-- Trigger for advanced validation
CREATE OR REPLACE FUNCTION validate_post_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent unpublishing posts with high engagement
  IF OLD.published = true AND NEW.published = false THEN
    IF (SELECT like_count FROM posts WHERE id = NEW.id) > 100 THEN
      RAISE EXCEPTION 'Cannot unpublish posts with more than 100 likes';
    END IF;
  END IF;

  -- Auto-set published_at when publishing
  IF OLD.published = false AND NEW.published = true AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_post_update
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION validate_post_update();
```

**Benefits**:
- Data integrity at the database level
- Prevention of invalid data entry
- Automatic validation without application code
- Consistent business rules enforcement

**Trade-offs**:
- Complex constraint design
- Performance impact on writes
- Error messages may not be user-friendly
- Difficult to modify once in production

**Related Patterns**: Schema Migration, Data Validation

---

## Data Migration Scripts

### Incremental Migration Pattern

**Context**: Migrating large datasets without downtime.

**Problem**: Need to migrate millions of records while keeping the system operational.

**Solution**:
1. Create migration tracking table
2. Implement batch processing
3. Add progress tracking and resumability
4. Handle errors gracefully with retry logic
5. Validate data integrity during migration
6. Implement rollback procedures

**Example**:
```sql
-- Create migration tracking table
CREATE TABLE migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  batch_number INTEGER NOT NULL,
  records_processed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, batch_number)
);

-- Migration function for users
CREATE OR REPLACE FUNCTION migrate_users_batch(batch_size INTEGER DEFAULT 1000)
RETURNS INTEGER AS $$
DECLARE
  batch_num INTEGER;
  processed_count INTEGER := 0;
  last_user_id UUID;
BEGIN
  -- Get next batch number
  SELECT COALESCE(MAX(batch_number), 0) + 1 INTO batch_num
  FROM migration_log
  WHERE entity_type = 'users' AND status = 'completed';

  -- Mark batch as processing
  INSERT INTO migration_log (entity_type, batch_number, status, started_at)
  VALUES ('users', batch_num, 'processing', NOW())
  ON CONFLICT (entity_type, batch_number) DO UPDATE SET
    status = 'processing',
    started_at = NOW(),
    error_message = NULL;

  -- Migrate batch of users
  INSERT INTO users (
    id, email, username, display_name, avatar_url,
    role, email_verified, active, created_at, updated_at
  )
  SELECT
    u.id,
    u.email,
    u.username,
    u.display_name,
    u.avatar_url,
    COALESCE(u.role, 'user'),
    COALESCE(u.email_verified, false),
    COALESCE(u.active, true),
    COALESCE(u.created_at, NOW()),
    COALESCE(u.updated_at, NOW())
  FROM base44_users u
  WHERE u.id > COALESCE(last_user_id, '00000000-0000-0000-0000-000000000000'::UUID)
  ORDER BY u.id
  LIMIT batch_size
  ON CONFLICT (email) DO NOTHING; -- Handle duplicates

  GET DIAGNOSTICS processed_count = ROW_COUNT;

  -- Update batch status
  UPDATE migration_log
  SET
    records_processed = processed_count,
    status = CASE WHEN processed_count > 0 THEN 'processing' ELSE 'completed' END,
    completed_at = CASE WHEN processed_count = 0 THEN NOW() ELSE NULL END
  WHERE entity_type = 'users' AND batch_number = batch_num;

  -- Get last processed ID for next batch
  IF processed_count > 0 THEN
    SELECT MAX(id) INTO last_user_id FROM users;
  END IF;

  RETURN processed_count;
EXCEPTION
  WHEN OTHERS THEN
    -- Mark batch as failed
    UPDATE migration_log
    SET
      status = 'failed',
      error_message = SQLERRM,
      completed_at = NOW()
    WHERE entity_type = 'users' AND batch_number = batch_num;

    RAISE;
END;
$$ LANGUAGE plpgsql;

-- Migration function for posts with relationships
CREATE OR REPLACE FUNCTION migrate_posts_batch(batch_size INTEGER DEFAULT 1000)
RETURNS INTEGER AS $$
DECLARE
  batch_num INTEGER;
  processed_count INTEGER := 0;
  last_post_id UUID;
BEGIN
  -- Get next batch number
  SELECT COALESCE(MAX(batch_number), 0) + 1 INTO batch_num
  FROM migration_log
  WHERE entity_type = 'posts' AND status = 'completed';

  -- Mark batch as processing
  INSERT INTO migration_log (entity_type, batch_number, status, started_at)
  VALUES ('posts', batch_num, 'processing', NOW())
  ON CONFLICT (entity_type, batch_number) DO UPDATE SET
    status = 'processing',
    started_at = NOW(),
    error_message = NULL;

  -- Migrate batch of posts (only for users that exist)
  INSERT INTO posts (
    id, user_id, title, content, published, published_at,
    tags, created_at, updated_at, created_by, updated_by
  )
  SELECT
    p.id,
    p.user_id,
    p.title,
    p.content,
    COALESCE(p.published, false),
    CASE WHEN p.published THEN p.created_at ELSE NULL END,
    COALESCE(p.tags, '{}'),
    COALESCE(p.created_at, NOW()),
    COALESCE(p.updated_at, NOW()),
    p.user_id, -- created_by defaults to user_id
    p.user_id  -- updated_by defaults to user_id
  FROM base44_posts p
  INNER JOIN users u ON u.id = p.user_id -- Only migrate posts for existing users
  WHERE p.id > COALESCE(last_post_id, '00000000-0000-0000-0000-000000000000'::UUID)
  ORDER BY p.id
  LIMIT batch_size;

  GET DIAGNOSTICS processed_count = ROW_COUNT;

  -- Update batch status
  UPDATE migration_log
  SET
    records_processed = processed_count,
    status = CASE WHEN processed_count > 0 THEN 'processing' ELSE 'completed' END,
    completed_at = CASE WHEN processed_count = 0 THEN NOW() ELSE NULL END
  WHERE entity_type = 'posts' AND batch_number = batch_num;

  RETURN processed_count;
EXCEPTION
  WHEN OTHERS THEN
    -- Mark batch as failed
    UPDATE migration_log
    SET
      status = 'failed',
      error_message = SQLERRM,
      completed_at = NOW()
    WHERE entity_type = 'posts' AND batch_number = batch_num;

    RAISE;
END;
$$ LANGUAGE plpgsql;

-- Execute migration batches
DO $$
DECLARE
  total_processed INTEGER := 0;
  batch_count INTEGER;
BEGIN
  -- Migrate users in batches
  LOOP
    SELECT migrate_users_batch(1000) INTO batch_count;
    total_processed := total_processed + batch_count;
    EXIT WHEN batch_count = 0;
    COMMIT; -- Commit each batch
    PERFORM pg_sleep(0.1); -- Small delay to prevent overwhelming the system
  END LOOP;

  RAISE NOTICE 'Migrated % users', total_processed;

  -- Reset counter and migrate posts
  total_processed := 0;
  LOOP
    SELECT migrate_posts_batch(1000) INTO batch_count;
    total_processed := total_processed + batch_count;
    EXIT WHEN batch_count = 0;
    COMMIT;
    PERFORM pg_sleep(0.1);
  END LOOP;

  RAISE NOTICE 'Migrated % posts', total_processed;
END;
$$;

-- Monitor migration progress
SELECT
  entity_type,
  COUNT(*) as total_batches,
  SUM(records_processed) as total_records,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_batches,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_batches,
  MAX(completed_at) as last_completed
FROM migration_log
GROUP BY entity_type
ORDER BY entity_type;
```

**Benefits**:
- Zero-downtime migration capability
- Resumable migration process
- Progress tracking and monitoring
- Error handling and recovery
- Batch processing for performance

**Trade-offs**:
- Complex migration scripts
- Requires careful transaction management
- Monitoring and maintenance overhead

**Related Patterns**: Data Validation, Rollback Procedures

### Data Transformation Pattern

**Context**: Transforming data during migration to match new schema requirements.

**Problem**: Base44 data format doesn't match the new PostgreSQL schema requirements.

**Solution**:
1. Create transformation functions for data conversion
2. Handle data type conversions and formatting
3. Implement business logic transformations
4. Validate transformed data
5. Handle edge cases and data cleanup

**Example**:
```sql
-- Data transformation functions
CREATE OR REPLACE FUNCTION transform_user_role(base44_role TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Transform Base44 roles to new role system
  CASE LOWER(COALESCE(base44_role, ''))
    WHEN 'superuser' THEN RETURN 'admin';
    WHEN 'editor' THEN RETURN 'moderator';
    WHEN 'author' THEN RETURN 'user';
    ELSE RETURN 'user';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION transform_tags(base44_tags TEXT)
RETURNS TEXT[] AS $$
DECLARE
  tag_array TEXT[];
BEGIN
  -- Handle different tag formats from Base44
  IF base44_tags IS NULL OR base44_tags = '' THEN
    RETURN '{}';
  END IF;

  -- Try to parse as JSON array first
  BEGIN
    tag_array := ARRAY(SELECT json_array_elements_text(base44_tags::json));
    RETURN tag_array;
  EXCEPTION
    WHEN OTHERS THEN
      -- Fallback: split comma-separated string
      RETURN string_to_array(REPLACE(base44_tags, ' ', ''), ',');
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION clean_html_content(content TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove dangerous HTML tags and attributes
  RETURN regexp_replace(
    regexp_replace(content, '<script[^>]*>.*?</script>', '', 'gi'),
    '<[^>]*\bon\w+[^>]*>', '', 'gi'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION generate_post_slug(title TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate URL-friendly slug from title
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  -- Ensure uniqueness
  final_slug := base_slug;
  WHILE EXISTS(SELECT 1 FROM posts WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Migration with data transformation
INSERT INTO users (
  id, email, username, display_name, avatar_url,
  role, email_verified, active, created_at, updated_at
)
SELECT
  u.id,
  lower(trim(u.email)), -- Normalize email
  CASE
    WHEN u.username IS NOT NULL THEN lower(trim(u.username))
    ELSE split_part(u.email, '@', 1) -- Generate username from email
  END,
  trim(u.display_name),
  CASE
    WHEN u.avatar_url ~ '^https?://' THEN u.avatar_url -- Valid URL
    ELSE NULL -- Invalid URL, set to null
  END,
  transform_user_role(u.role),
  COALESCE(u.verified, false),
  COALESCE(u.active, true),
  COALESCE(u.created_at, NOW()),
  COALESCE(u.updated_at, NOW())
FROM base44_users u
WHERE u.email IS NOT NULL
  AND u.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'; -- Valid email only

-- Migrate posts with transformations
INSERT INTO posts (
  id, user_id, title, content, slug, published,
  published_at, tags, created_at, updated_at, created_by, updated_by
)
SELECT
  p.id,
  p.user_id,
  trim(p.title),
  clean_html_content(p.content),
  generate_post_slug(p.title, p.user_id),
  COALESCE(p.status = 'published', false),
  CASE WHEN p.status = 'published' THEN p.publish_date ELSE NULL END,
  transform_tags(p.tags),
  COALESCE(p.created_at, NOW()),
  COALESCE(p.updated_at, NOW()),
  p.author_id,
  p.author_id
FROM base44_posts p
INNER JOIN users u ON u.id = p.user_id -- Only migrate posts for migrated users
WHERE trim(p.title) != '' -- Skip posts without titles
  AND length(clean_html_content(p.content)) > 10; -- Skip very short content
```

**Benefits**:
- Data consistency and quality
- Business rule enforcement
- Schema compatibility
- Clean data for new system

**Trade-offs**:
- Complex transformation logic
- Performance impact during migration
- Potential data loss for invalid records
- Difficult to test all edge cases

**Related Patterns**: Incremental Migration, Data Validation

---

## Performance Optimization Patterns

### Query Optimization Pattern

**Context**: Optimizing database queries for better performance.

**Problem**: Slow queries are impacting application performance and user experience.

**Solution**:
1. Analyze query execution plans
2. Optimize table structures and indexes
3. Rewrite inefficient queries
4. Implement query result caching
5. Use appropriate PostgreSQL features

**Example**:
```sql
-- Analyze slow queries
EXPLAIN ANALYZE
SELECT p.*, u.display_name, c.name as category_name
FROM posts p
LEFT JOIN users u ON u.id = p.user_id
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.published = true
  AND p.created_at >= '2024-01-01'
ORDER BY p.created_at DESC
LIMIT 20;

-- Optimize with covering index
CREATE INDEX idx_posts_published_covering ON posts(
  published, created_at DESC, user_id, category_id, title, excerpt
) WHERE published = true;

-- Rewrite query to use index-only scan
SELECT
  p.id, p.title, p.excerpt, p.created_at, p.user_id, p.category_id,
  u.display_name,
  c.name as category_name
FROM posts p
LEFT JOIN users u ON u.id = p.user_id
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.published = true
  AND p.created_at >= '2024-01-01'
ORDER BY p.created_at DESC
LIMIT 20;

-- Use CTE for complex aggregations
WITH post_stats AS (
  SELECT
    p.user_id,
    COUNT(*) as post_count,
    AVG(length(p.content)) as avg_content_length,
    MAX(p.created_at) as last_post_date
  FROM posts p
  WHERE p.published = true
    AND p.created_at >= '2024-01-01'
  GROUP BY p.user_id
  HAVING COUNT(*) > 5
)
SELECT
  u.display_name,
  ps.post_count,
  ps.avg_content_length,
  ps.last_post_date
FROM post_stats ps
JOIN users u ON u.id = ps.user_id
ORDER BY ps.post_count DESC;

-- Implement pagination with cursor
CREATE OR REPLACE FUNCTION get_posts_paginated(
  limit_param INTEGER DEFAULT 20,
  cursor_param TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  created_at TIMESTAMPTZ,
  next_cursor TEXT
) AS $$
DECLARE
  cursor_timestamp TIMESTAMPTZ;
BEGIN
  -- Decode cursor (base64 encoded timestamp)
  IF cursor_param IS NOT NULL THEN
    cursor_timestamp := to_timestamp(
      decode(cursor_param, 'base64')::bigint / 1000.0
    );
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.created_at,
    encode(
      (extract(epoch from p.created_at) * 1000)::bigint::text::bytea,
      'base64'
    ) as next_cursor
  FROM posts p
  WHERE p.published = true
    AND (cursor_timestamp IS NULL OR p.created_at < cursor_timestamp)
  ORDER BY p.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Use materialized view for expensive aggregations
CREATE MATERIALIZED VIEW user_post_stats AS
SELECT
  p.user_id,
  COUNT(*) as total_posts,
  COUNT(CASE WHEN p.published THEN 1 END) as published_posts,
  COUNT(CASE WHEN NOT p.published THEN 1 END) as draft_posts,
  AVG(p.like_count) as avg_likes,
  MAX(p.created_at) as last_post_date
FROM posts p
GROUP BY p.user_id;

-- Refresh materialized view periodically
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_post_stats;
END;
$$ LANGUAGE plpgsql;

-- Set up automatic refresh (requires pg_cron extension)
SELECT cron.schedule('refresh-user-stats', '0 */6 * * *', 'SELECT refresh_user_stats();');
```

**Benefits**:
- Improved query performance
- Reduced database load
- Better user experience
- Scalable application architecture

**Trade-offs**:
- Complex query optimization
- Index maintenance overhead
- Potential for over-optimization
- Requires ongoing monitoring

**Related Patterns**: Index Optimization, Partitioning

### Partitioning Pattern

**Context**: Handling large tables with millions of records.

**Problem**: Large tables are slow to query and maintain.

**Solution**:
1. Choose appropriate partitioning strategy
2. Implement table partitioning
3. Update queries to work with partitions
4. Maintain partition management
5. Monitor partition performance

**Example**:
```sql
-- Partition posts table by month
CREATE TABLE posts (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE posts_2024_01 PARTITION OF posts
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE posts_2024_02 PARTITION OF posts
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Create default partition for future data
CREATE TABLE posts_future PARTITION OF posts
  DEFAULT;

-- Function to create partitions automatically
CREATE OR REPLACE FUNCTION create_monthly_partition(
  target_month DATE
)
RETURNS void AS $$
DECLARE
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  start_date := date_trunc('month', target_month);
  end_date := start_date + INTERVAL '1 month';
  partition_name := 'posts_' || to_char(start_date, 'YYYY_MM');

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF posts FOR VALUES FROM (%L) TO (%L)',
    partition_name,
    start_date,
    end_date
  );

  -- Create indexes on partition
  EXECUTE format(
    'CREATE INDEX IF NOT EXISTS idx_%s_user_id ON %I(user_id)',
    partition_name,
    partition_name
  );

  EXECUTE format(
    'CREATE INDEX IF NOT EXISTS idx_%s_created_at ON %I(created_at DESC)',
    partition_name,
    partition_name
  );
END;
$$ LANGUAGE plpgsql;

-- Create partitions for next 12 months
DO $$
DECLARE
  target_date DATE := date_trunc('month', CURRENT_DATE);
  i INTEGER;
BEGIN
  FOR i IN 0..11 LOOP
    PERFORM create_monthly_partition(target_date + (i || ' months')::INTERVAL);
  END LOOP;
END;
$$;

-- Partition large tables by hash for even distribution
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
) PARTITION BY HASH (user_id);

-- Create 4 hash partitions
CREATE TABLE user_sessions_0 PARTITION OF user_sessions
  FOR VALUES WITH (MODULUS 4, REMAINDER 0);

CREATE TABLE user_sessions_1 PARTITION OF user_sessions
  FOR VALUES WITH (MODULUS 4, REMAINDER 1);

CREATE TABLE user_sessions_2 PARTITION OF user_sessions
  FOR VALUES WITH (MODULUS 4, REMAINDER 2);

CREATE TABLE user_sessions_3 PARTITION OF user_sessions
  FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- Partition audit logs by year
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (timestamp);

-- Create yearly partitions
CREATE TABLE audit_logs_2023 PARTITION OF audit_logs
  FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE audit_logs_2024 PARTITION OF audit_logs
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Automatic partition management
CREATE OR REPLACE FUNCTION manage_partitions()
RETURNS void AS $$
DECLARE
  next_month DATE;
  next_year DATE;
BEGIN
  -- Create next month's post partition
  next_month := date_trunc('month', CURRENT_DATE + INTERVAL '2 months');
  PERFORM create_monthly_partition(next_month);

  -- Create next year's audit partition
  next_year := date_trunc('year', CURRENT_DATE + INTERVAL '1 year');
  -- ... create audit partition logic
END;
$$ LANGUAGE plpgsql;

-- Set up monthly partition maintenance (requires pg_cron)
SELECT cron.schedule('manage-partitions', '0 2 1 * *', 'SELECT manage_partitions();');

-- Query partitioned tables (partition pruning happens automatically)
SELECT * FROM posts
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';

-- Get partition information
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename LIKE 'posts_%'
ORDER BY tablename;
```

**Benefits**:
- Improved query performance on large tables
- Easier maintenance and archiving
- Better data organization
- Automatic partition pruning

**Trade-offs**:
- Complex partition management
- Application code changes required
- Partition key design is critical
- Some features don't work with partitioning

**Related Patterns**: Index Optimization, Query Optimization

---

## Backup and Recovery Patterns

### Backup Strategy Pattern

**Context**: Implementing comprehensive database backup and recovery procedures.

**Problem**: Need to protect data against loss and ensure business continuity.

**Solution**:
1. Implement multiple backup types
2. Create automated backup schedules
3. Test backup restoration regularly
4. Implement point-in-time recovery
5. Store backups securely offsite

**Example**:
```sql
-- Logical backup (pg_dump)
pg_dump -h localhost -U postgres -d myapp --format=custom --compress=9 --verbose --file=/backups/myapp_$(date +%Y%m%d_%H%M%S).backup

-- Physical backup (pg_basebackup)
pg_basebackup -h localhost -U postgres -D /backups/basebackup_$(date +%Y%m%d_%H%M%S) -Ft -z -P

-- Continuous archiving setup
-- postgresql.conf settings:
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /backups/wal/%f'

-- Backup script
#!/bin/bash
BACKUP_DIR="/backups"
DB_NAME="myapp"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Logical backup
pg_dump -h localhost -U postgres -d $DB_NAME --format=custom --compress=9 --verbose --file=$BACKUP_DIR/${DB_NAME}_logical_$DATE.backup

# Physical backup
pg_basebackup -h localhost -U postgres -D $BACKUP_DIR/${DB_NAME}_physical_$DATE -Ft -z -P

# WAL archiving backup
tar -czf $BACKUP_DIR/${DB_NAME}_wal_$DATE.tar.gz /backups/wal/

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "${DB_NAME}_*.backup" -mtime +30 -delete
find $BACKUP_DIR -name "${DB_NAME}_physical_*" -mtime +30 -delete
find $BACKUP_DIR -name "${DB_NAME}_wal_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"

-- Point-in-time recovery
-- 1. Restore base backup
pg_restore -h localhost -U postgres -d myapp --create --verbose /backups/myapp_physical_20240101_120000.tar.gz

-- 2. Restore WAL files up to target time
-- recovery.conf or postgresql.conf:
# recovery_target_time = '2024-01-02 15:30:00'
# recovery_target_action = 'promote'

-- Backup verification script
#!/bin/bash
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Create temporary database for testing
TEMP_DB="backup_test_$(date +%s)"
createdb $TEMP_DB

# Restore backup to temp database
pg_restore -h localhost -U postgres -d $TEMP_DB --verbose $BACKUP_FILE

# Run basic integrity checks
psql -h localhost -U postgres -d $TEMP_DB -c "
SELECT
  schemaname,
  tablename,
  n_tup_ins - n_tup_del as live_rows
FROM pg_stat_user_tables
ORDER BY n_tup_ins - n_tup_del DESC
LIMIT 10;
"

# Check for corruption
psql -h localhost -U postgres -d $TEMP_DB -c "
SELECT count(*) as total_rows FROM posts;
SELECT count(*) as users_count FROM users;
"

# Clean up
dropdb $TEMP_DB

echo "Backup verification completed for $BACKUP_FILE"
```

**Benefits**:
- Comprehensive data protection
- Multiple recovery options
- Automated backup processes
- Regular testing and verification

**Trade-offs**:
- Storage cost for backups
- Performance impact during backups
- Complex recovery procedures
- Regular maintenance required

**Related Patterns**: High Availability, Disaster Recovery

---

## Best Practices

### Do's and Don'ts

**Do's**:
- Always backup before schema changes
- Use transactions for data migrations
- Test migrations on production-like data
- Monitor migration performance and progress
- Document all schema changes and rationale
- Use appropriate data types for your use case
- Implement proper indexing strategies
- Regularly analyze and vacuum tables
- Use connection pooling in production
- Monitor database performance metrics
- Plan for database growth and scaling

**Don'ts**:
- Don't modify production data without backups
- Don't run migrations during peak hours
- Don't use generic data types for everything
- Don't forget to update indexes after schema changes
- Don't ignore database performance monitoring
- Don't use SELECT * in production queries
- Don't forget to handle database connections properly
- Don't implement business logic in database triggers
- Don't use database as a queue or cache
- Don't skip database normalization

### Common Pitfalls

1. **Missing Indexes**: Queries become slow without proper indexing
2. **Lock Contention**: Long-running transactions block other operations
3. **Connection Leaks**: Not properly closing database connections
4. **Large Transactions**: Risk of running out of memory or locks
5. **Poor Query Design**: N+1 queries and inefficient joins
6. **Inadequate Monitoring**: Not monitoring database health metrics
7. **Backup Failures**: Backups failing silently without notification
8. **Schema Drift**: Production and development schemas getting out of sync

### Performance Considerations

- Use EXPLAIN ANALYZE to understand query execution
- Monitor slow query logs and optimize them
- Use appropriate PostgreSQL configuration settings
- Implement query result caching where appropriate
- Use database connection pooling
- Optimize table structures for common access patterns
- Regularly update table statistics
- Consider read replicas for heavy read workloads
- Use appropriate hardware and storage
- Monitor and tune autovacuum settings

### Security Considerations

- Use parameterized queries to prevent SQL injection
- Implement proper access controls and permissions
- Encrypt sensitive data at rest and in transit
- Regularly update PostgreSQL and extensions
- Audit database access and changes
- Implement row-level security where appropriate
- Use strong passwords and proper authentication
- Limit database user privileges
- Monitor for security vulnerabilities
- Implement proper backup encryption

### Monitoring Recommendations

- Monitor database connection counts and usage
- Track query performance and slow queries
- Monitor table sizes and growth rates
- Alert on high CPU, memory, or disk usage
- Monitor replication lag if using replicas
- Track backup success and restoration times
- Monitor database lock waits and deadlocks
- Alert on unusual error rates or patterns
- Monitor index usage and bloat
- Track transaction rates and throughput

---

## Implementation Checklist

### Schema Design Checklist
- [ ] Analyze Base44 entity relationships and dependencies
- [ ] Design PostgreSQL tables with appropriate data types
- [ ] Implement primary keys and foreign key constraints
- [ ] Add check constraints for data validation
- [ ] Create unique constraints for business rules
- [ ] Add database comments for documentation
- [ ] Design indexing strategy for query patterns
- [ ] Plan table partitioning for large tables
- [ ] Review schema with application developers
- [ ] Document schema design decisions and rationale

### Index Optimization Checklist
- [ ] Analyze application query patterns
- [ ] Create single-column indexes for equality filters
- [ ] Implement composite indexes for multi-column queries
- [ ] Add partial indexes for filtered queries
- [ ] Create covering indexes to avoid table lookups
- [ ] Use appropriate index types (B-tree, GIN, GiST)
- [ ] Monitor index usage and performance impact
- [ ] Remove unused indexes to save space
- [ ] Document index design and maintenance procedures
- [ ] Plan index maintenance and rebuilding schedules

### Data Migration Checklist
- [ ] Create backup of Base44 data
- [ ] Design data transformation functions
- [ ] Implement incremental migration scripts
- [ ] Test migration on development data
- [ ] Validate data integrity during migration
- [ ] Implement error handling and retry logic
- [ ] Monitor migration progress and performance
- [ ] Verify migrated data against source
- [ ] Document migration procedures and results
- [ ] Plan rollback procedures for failed migrations

### Performance Optimization Checklist
- [ ] Analyze slow queries with EXPLAIN ANALYZE
- [ ] Optimize table structures and relationships
- [ ] Implement proper indexing strategies
- [ ] Rewrite inefficient queries
- [ ] Implement query result caching
- [ ] Use appropriate PostgreSQL features and extensions
- [ ] Monitor query performance metrics
- [ ] Optimize database configuration settings
- [ ] Implement connection pooling
- [ ] Plan for database scaling and growth

### Backup and Recovery Checklist
- [ ] Implement automated backup schedules
- [ ] Set up multiple backup types (logical, physical)
- [ ] Configure continuous archiving for PITR
- [ ] Test backup restoration procedures regularly
- [ ] Implement secure backup storage and encryption
- [ ] Create backup monitoring and alerting
- [ ] Document backup and recovery procedures
- [ ] Test disaster recovery scenarios
- [ ] Implement backup retention policies
- [ ] Train team on backup and recovery procedures

---

## Success Metrics

- **Migration Time**: Complete data migration within planned timeline
- **Data Accuracy**: 100% of records migrated without data loss or corruption
- **Query Performance**: Database queries perform within acceptable time limits
- **Backup Success**: 100% success rate for automated backups
- **Recovery Time**: Database recovery completed within RTO (Recovery Time Objective)
- **Downtime**: Minimal or zero downtime during migration and maintenance
- **Storage Efficiency**: Optimal use of storage with proper indexing and partitioning
- **Monitoring Coverage**: 100% of critical database metrics monitored and alerted
- **Documentation**: Complete documentation of schema, procedures, and maintenance

---

## Version History

- **v1.0** (2024-01-01): Initial database migration guide
- **v1.1** (2024-01-15): Added advanced patterns and performance optimization
- **v1.2** (2024-02-01): Updated with partitioning and backup strategies

---

## Related Documentation

- [Migration Patterns](migration-patterns.md)
- [Entity Migration Guide](entity-migration-guide.md)
- [API Migration Patterns](api-migration-patterns.md)
- [Frontend Integration Guide](frontend-integration-guide.md)
- [Migration Checklist](migration-checklist.md)
- [Advanced Migration Patterns](advanced-migration-patterns.md)