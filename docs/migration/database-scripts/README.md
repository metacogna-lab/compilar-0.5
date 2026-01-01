# Database Migration Scripts

This directory contains all SQL scripts needed to migrate from Supabase to standalone PostgreSQL.

## Directory Structure

```
database-scripts/
├── 00_extensions.sql          # PostgreSQL extensions setup
├── 01_schema.sql              # Core database schema
├── 02_indexes.sql             # Performance indexes
├── 03_triggers.sql            # Database triggers
├── 04_initial_data.sql        # Seed data
├── 05_migration_utils.sql     # Migration helper functions
├── 06_rls_replacement.sql     # Application-level auth functions
├── 07_vector_setup.sql        # pgvector extension for embeddings
├── 08_partitioning.sql        # Table partitioning (optional)
└── migration-runner.sh        # Automated migration script
```

## Prerequisites

### PostgreSQL Setup
```bash
# Install PostgreSQL 15+
sudo apt-get install postgresql-15

# Create database and user
sudo -u postgres psql
```

```sql
-- Create database and user
CREATE DATABASE compilar_prod;
CREATE USER compilar_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE compilar_prod TO compilar_user;
```

### Environment Variables
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=compilar_prod
export DB_USER=compilar_user
export DB_PASSWORD=your_password
```

## Migration Steps

### Step 1: Extensions Setup
```bash
psql -d $DB_NAME -f 00_extensions.sql
```

**What it does:**
- Installs `uuid-ossp` for UUID generation
- Installs `pgcrypto` for password hashing
- Installs `pgvector` for AI embeddings (optional)

### Step 2: Schema Creation
```bash
psql -d $DB_NAME -f 01_schema.sql
```

**What it does:**
- Creates all 32 entity tables
- Sets up foreign key relationships
- Configures check constraints
- Creates enums and domains

### Step 3: Indexes
```bash
psql -d $DB_NAME -f 02_indexes.sql
```

**What it does:**
- Creates performance indexes for common queries
- Sets up composite indexes for complex filters
- Optimizes foreign key lookups

### Step 4: Triggers
```bash
psql -d $DB_NAME -f 03_triggers.sql
```

**What it does:**
- Creates `updated_at` timestamp triggers
- Sets up audit logging triggers
- Implements data validation triggers

### Step 5: Initial Data
```bash
psql -d $DB_NAME -f 04_initial_data.sql
```

**What it does:**
- Seeds PILAR knowledge base
- Creates default badges and trophies
- Sets up system configuration

## Data Migration

### Export from Supabase
```bash
# Use Supabase CLI or direct PostgreSQL connection
pg_dump --host db.your-project.supabase.co \
        --username postgres \
        --dbname postgres \
        --no-owner \
        --no-privileges \
        --data-only \
        --table=user_profiles \
        --table=pilar_assessments \
        --table=assessment_sessions \
        > supabase_data.sql
```

### Transform Data
```bash
# Run transformation script
node transform-supabase-data.js supabase_data.sql > transformed_data.sql
```

### Import to Standalone DB
```bash
psql -d $DB_NAME -f transformed_data.sql
```

## Migration Utilities

### Helper Functions
Located in `05_migration_utils.sql`:

```sql
-- Check data integrity
SELECT check_data_integrity();

-- Validate foreign keys
SELECT validate_foreign_keys();

-- Generate migration report
SELECT generate_migration_report();
```

### RLS Replacement
Located in `06_rls_replacement.sql`:

```sql
-- Check user permissions
SELECT check_user_permission(user_id, 'read', 'pilar_assessments', resource_id);

-- Get user accessible resources
SELECT get_user_resources(user_id, 'teams');
```

## Automated Migration

### Using the Runner Script
```bash
# Make executable
chmod +x migration-runner.sh

# Run full migration
./migration-runner.sh --full

# Run specific steps
./migration-runner.sh --step schema --step data
```

### Runner Options
```bash
./migration-runner.sh [options]

Options:
  --full              Run complete migration
  --step STEP         Run specific step (extensions|schema|indexes|triggers|data)
  --verify            Verify migration success
  --rollback          Rollback to previous state
  --dry-run           Show what would be done
  --help              Show this help
```

## Verification

### Post-Migration Checks
```bash
# Run verification script
psql -d $DB_NAME -f verify_migration.sql
```

**Verification checks:**
- Table existence and structure
- Foreign key constraints
- Data integrity
- Index performance
- Row counts vs. source

### Performance Benchmarking
```bash
# Run performance tests
pgbench -d $DB_NAME -f benchmark.sql -T 60
```

## Rollback Procedures

### Full Rollback
```bash
# Drop all tables and start over
psql -d $DB_NAME -f rollback_full.sql
```

### Partial Rollback
```bash
# Rollback specific changes
psql -d $DB_NAME -c "DROP TABLE IF EXISTS new_table;"
```

### Backup Strategy
```bash
# Create backup before migration
pg_dump -d $DB_NAME > pre_migration_backup.sql

# Restore if needed
psql -d $DB_NAME < pre_migration_backup.sql
```

## Troubleshooting

### Common Issues

#### Extension Installation Fails
```sql
-- Check if superuser
SELECT current_user, usesuper;

-- Install as superuser
sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS uuid_ossp;"
```

#### Foreign Key Violations
```sql
-- Find orphaned records
SELECT * FROM child_table c
LEFT JOIN parent_table p ON c.parent_id = p.id
WHERE p.id IS NULL;
```

#### Performance Issues
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM large_table WHERE condition;

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE relname = 'table_name';
```

### Logs and Monitoring
```bash
# Enable query logging
ALTER DATABASE $DB_NAME SET log_statement = 'all';

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-15-main.log
```

## Performance Optimizations

### Connection Pooling
```sql
-- Install pgBouncer
sudo apt-get install pgbouncer

-- Configure connection pooling
# /etc/pgbouncer/pgbouncer.ini
[databases]
compilar_prod = host=localhost port=5432 dbname=compilar_prod

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

### Query Optimization
```sql
-- Create partial indexes
CREATE INDEX idx_active_sessions ON assessment_sessions (user_id)
WHERE completed_at IS NULL;

-- Use covering indexes
CREATE INDEX idx_assessment_lookup ON pilar_assessments (user_id, pillar_id, mode)
INCLUDE (scores, created_at);
```

### Partitioning Strategy
For high-volume tables like `user_analytics`:

```sql
-- Create partitioned table
CREATE TABLE user_analytics_y2024m01 PARTITION OF user_analytics
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Automatic partitioning function
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
    next_month date := date_trunc('month', now() + interval '1 month');
BEGIN
    EXECUTE format('CREATE TABLE IF NOT EXISTS user_analytics_y%sm%s PARTITION OF user_analytics FOR VALUES FROM (%L) TO (%L)',
                   extract(year from next_month), lpad(extract(month from next_month)::text, 2, '0'),
                   next_month, next_month + interval '1 month');
END;
$$ LANGUAGE plpgsql;
```

## Security Considerations

### Database User Permissions
```sql
-- Create limited user for application
CREATE USER compilar_app WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE compilar_prod TO compilar_app;
GRANT USAGE ON SCHEMA public TO compilar_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO compilar_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO compilar_app;
```

### Encryption
```sql
-- Enable encryption at rest
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'pgp -c %p > /var/lib/postgresql/15/main/archive/%f';
```

### Audit Logging
```sql
-- Create audit table
CREATE TABLE audit_log (
    id bigserial PRIMARY KEY,
    table_name text NOT NULL,
    operation text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    user_id uuid,
    timestamp timestamptz DEFAULT now()
);

-- Create audit function
CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS trigger AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, old_values, new_values, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_setting('app.user_id', true)::uuid);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## Monitoring Setup

### Database Metrics
```sql
-- Create monitoring views
CREATE VIEW db_stats AS
SELECT
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables;

-- Query performance view
CREATE VIEW query_performance AS
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Automated Monitoring
```bash
# Install monitoring tools
sudo apt-get install prometheus-postgres-exporter

# Configure alerting
# /etc/prometheus/prometheus.yml
scrape_configs:
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
```

## Backup Strategy

### Automated Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -d $DB_NAME > /backups/compilar_$DATE.sql

# Compress and retain last 30 days
gzip /backups/compilar_$DATE.sql
find /backups -name "compilar_*.sql.gz" -mtime +30 -delete
```

### Point-in-Time Recovery
```sql
-- Enable WAL archiving
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'cp %p /var/lib/postgresql/15/main/archive/%f';

-- Restore to specific time
pg_restore --target-time "2024-01-01 12:00:00" /backups/compilar_backup.sql
```

## Migration Timeline

### Phase 1: Infrastructure (Day 1)
- [ ] PostgreSQL installation and configuration
- [ ] Database user and permission setup
- [ ] Backup of Supabase data
- [ ] Extension installation

### Phase 2: Schema Migration (Day 2)
- [ ] Schema creation and validation
- [ ] Index creation and testing
- [ ] Trigger setup and testing
- [ ] Initial data seeding

### Phase 3: Data Migration (Day 3)
- [ ] Data export from Supabase
- [ ] Data transformation and validation
- [ ] Data import to standalone DB
- [ ] Integrity and consistency checks

### Phase 4: Testing & Optimization (Day 4)
- [ ] Performance testing
- [ ] Query optimization
- [ ] Monitoring setup
- [ ] Backup strategy implementation

### Phase 5: Go-Live (Day 5)
- [ ] Final data synchronization
- [ ] Application cutover
- [ ] Post-migration monitoring
- [ ] Documentation updates