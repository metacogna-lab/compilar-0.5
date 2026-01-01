# Compilar v0.5 Migration: Supabase to Standalone Hono Server

## Overview

This document outlines the comprehensive migration strategy to move Compilar v0.5 from its current Supabase-dependent architecture to a standalone Hono server with direct PostgreSQL connectivity.

## Current Architecture

### Backend Stack
- **Framework**: Hono v4.0.0
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (JWT tokens)
- **Storage**: Supabase Storage
- **AI Services**: OpenAI, Anthropic via LangSmith
- **Deployment**: Supabase Edge Functions

### Frontend Stack
- **Framework**: React 18 + Vite
- **State Management**: Zustand with persistence
- **API Client**: Custom compatibility layer with Base44/Supabase switching
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion

### Data Model
- **27+ Entities**: Users, assessments, teams, gamification, analytics, etc.
- **Complex Relationships**: Foreign keys, junction tables, JSONB fields
- **Row Level Security**: Comprehensive RLS policies for data isolation
- **Indexes**: Performance-optimized for common query patterns

## Migration Objectives

### Primary Goals
- ✅ **Cost Reduction**: Eliminate Supabase licensing fees (~$25/month)
- ✅ **Performance**: Direct database access vs API abstraction layer
- ✅ **Control**: Full ownership of database schema and operations
- ✅ **Scalability**: Better scaling capabilities with direct PostgreSQL
- ✅ **Zero Downtime**: Maintain service availability during transition

### Secondary Goals
- 🔄 **Backward Compatibility**: Frontend continues working during migration
- 🔄 **Security**: Maintain or improve current security posture
- 🔄 **Maintainability**: Standard PostgreSQL instead of proprietary API
- 🔄 **Developer Experience**: Simplified local development setup

## Migration Phases

### Phase 1: Data Model Migration (Week 1)
**Objective**: Migrate database schema and establish standalone PostgreSQL connection

#### 1.1 Database Setup
- [ ] Set up standalone PostgreSQL instance (local/Docker/cloud)
- [ ] Create database user and permissions
- [ ] Configure connection pooling and monitoring

#### 1.2 Schema Migration
- [ ] Convert Supabase migrations to standalone SQL files
- [ ] Remove Supabase-specific extensions and functions
- [ ] Implement application-level authorization (replace RLS)
- [ ] Create database indexes and constraints

#### 1.3 Data Migration
- [ ] Export data from Supabase (if production)
- [ ] Transform data for new schema (if needed)
- [ ] Import data to standalone PostgreSQL
- [ ] Validate data integrity

### Phase 2: API Layer Migration (Week 2)
**Objective**: Convert Supabase client calls to direct PostgreSQL operations

#### 2.1 Hono Server Setup
- [ ] Configure standalone Hono server with middleware
- [ ] Set up PostgreSQL connection pool (pg library)
- [ ] Implement JWT authentication (replace Supabase Auth)
- [ ] Configure CORS, logging, and error handling

#### 2.2 Authentication Migration
- [ ] Implement JWT token generation/validation
- [ ] Create user registration/login endpoints
- [ ] Migrate password hashing and session management
- [ ] Update token refresh logic

#### 2.3 Entity API Migration
- [ ] Convert generic CRUD operations to direct SQL queries
- [ ] Implement application-level authorization logic
- [ ] Add request validation with Zod schemas
- [ ] Create optimized database queries

### Phase 3: Frontend Integration (Week 3)
**Objective**: Update frontend to use new standalone API endpoints

#### 3.1 API Client Update
- [ ] Create new API client for standalone Hono server
- [ ] Update authentication flow (JWT tokens)
- [ ] Migrate entity operations to new endpoints
- [ ] Update error handling and retry logic

#### 3.2 Compatibility Layer Update
- [ ] Update migration compatibility layer
- [ ] Remove Supabase dependencies from frontend
- [ ] Update environment configuration
- [ ] Test backward compatibility

#### 3.3 State Management Updates
- [ ] Update Zustand stores if needed
- [ ] Test persistence and caching
- [ ] Validate real-time features (if any)

### Phase 4: Advanced Features (Week 4)
**Objective**: Implement advanced features not available in Supabase

#### 4.1 File Storage Migration
- [ ] Set up file storage system (local/cloud)
- [ ] Implement file upload/download endpoints
- [ ] Migrate existing files from Supabase Storage
- [ ] Update file URL generation

#### 4.2 Background Jobs
- [ ] Implement job queue system (Redis/ PostgreSQL-based)
- [ ] Create background processing for analytics
- [ ] Set up email sending capabilities
- [ ] Implement data export/import jobs

#### 4.3 Caching Layer
- [ ] Implement Redis for session caching
- [ ] Add database query result caching
- [ ] Cache AI responses and RAG data
- [ ] Implement cache invalidation strategies

#### 4.4 Monitoring & Observability
- [ ] Set up application monitoring (Prometheus/Grafana)
- [ ] Implement structured logging
- [ ] Add health check endpoints
- [ ] Create performance monitoring

## Entity Analysis

### Core Entities (High Priority)

| Entity | Records | Relationships | RLS Complexity |
|--------|---------|---------------|----------------|
| `user_profiles` | ~1K | 1:1 with auth.users | Simple |
| `pilar_assessments` | ~10K | FK to users | User-owned |
| `assessment_sessions` | ~50K | FK to users/assessments | User-owned |
| `user_progress` | ~5K | FK to users | User-owned |
| `cms_content` | ~100 | FK to users | Public read, user write |

### Social Entities (Medium Priority)

| Entity | Records | Relationships | RLS Complexity |
|--------|---------|---------------|----------------|
| `teams` | ~100 | FK to users, 1:M members | Team-based |
| `team_members` | ~500 | FK to teams/users | Team membership |
| `study_groups` | ~50 | FK to users, 1:M members | Group-based |
| `peer_feedback` | ~2K | FK to users | User-owned |

### Gamification Entities (Medium Priority)

| Entity | Records | Relationships | RLS Complexity |
|--------|---------|---------------|----------------|
| `user_gamification` | ~1K | FK to users | User-owned |
| `badges` | ~50 | None | Public read |
| `user_badges` | ~5K | FK to users/badges | User-owned |
| `challenges` | ~100 | None | Public read |

### Analytics Entities (Low Priority)

| Entity | Records | Relationships | RLS Complexity |
|--------|---------|---------------|----------------|
| `user_analytics` | ~100K | FK to users | User-owned |
| `session_analytics` | ~50K | FK to users/sessions | User-owned |
| `group_analytics` | ~1K | FK to groups/teams | Group-owned |

## Technical Implementation

### Database Connection
```typescript
// New standalone connection (replace Supabase client)
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
})
```

### Authentication Migration
```typescript
// JWT-based auth (replace Supabase Auth)
import jwt from 'jsonwebtoken'

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '24h' })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!)
}
```

### Entity CRUD Operations
```typescript
// Direct SQL operations (replace Supabase client calls)
export const getUserAssessments = async (userId: string) => {
  const query = `
    SELECT * FROM pilar_assessments
    WHERE user_id = $1
    ORDER BY created_at DESC
  `
  const result = await pool.query(query, [userId])
  return result.rows
}
```

## Risk Assessment

### High Risk
- **Data Loss**: Migration of production data
- **Authentication**: JWT implementation security
- **Authorization**: Replacing RLS with application logic
- **Performance**: Query optimization for direct SQL

### Medium Risk
- **File Storage**: Migration of user-uploaded content
- **Real-time Features**: WebSocket implementation
- **Background Jobs**: Async processing reliability
- **Caching**: Cache invalidation and consistency

### Low Risk
- **Frontend Changes**: API client updates
- **Monitoring**: Adding observability
- **Documentation**: API documentation updates

## Testing Strategy

### Unit Tests
- [ ] Database connection and queries
- [ ] Authentication middleware
- [ ] Entity CRUD operations
- [ ] Authorization logic

### Integration Tests
- [ ] API endpoints functionality
- [ ] Authentication flow
- [ ] Data relationships
- [ ] File upload/download

### End-to-End Tests
- [ ] Complete user workflows
- [ ] Assessment flow
- [ ] Team collaboration
- [ ] Admin functions

### Performance Tests
- [ ] Database query performance
- [ ] API response times
- [ ] Concurrent user load
- [ ] Memory usage

## Rollback Plan

### Database Rollback
1. Keep Supabase instance running during migration
2. Use database snapshots/backups
3. Implement dual-write strategy during transition
4. Prepare database migration scripts for rollback

### Application Rollback
1. Keep old API endpoints available
2. Use feature flags for gradual rollout
3. Implement circuit breaker pattern
4. Prepare frontend rollback configuration

### Data Rollback
1. Maintain data export/import capabilities
2. Use point-in-time recovery
3. Implement data validation checks
4. Prepare data transformation scripts

## Success Metrics

### Technical Metrics
- **Performance**: API response time < 200ms (current: ~150ms)
- **Reliability**: Uptime > 99.9% (current: 99.95%)
- **Security**: Zero security incidents during migration
- **Scalability**: Support 10x current load

### Business Metrics
- **Cost**: 50% reduction in infrastructure costs
- **User Experience**: No degradation in user experience
- **Development**: Faster development cycle
- **Maintenance**: Reduced operational overhead

## Timeline & Milestones

### Week 1: Foundation
- [ ] Database setup and schema migration
- [ ] Basic Hono server with PostgreSQL connection
- [ ] Authentication system implementation
- [ ] Core entity CRUD operations

### Week 2: Core Features
- [ ] Complete API migration
- [ ] Frontend integration
- [ ] Testing and validation
- [ ] Performance optimization

### Week 3: Advanced Features
- [ ] File storage migration
- [ ] Background jobs implementation
- [ ] Caching layer
- [ ] Monitoring setup

### Week 4: Production Ready
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Documentation updates
- [ ] Production deployment

## Dependencies & Prerequisites

### Infrastructure
- [ ] PostgreSQL 15+ instance
- [ ] Redis (optional, for caching)
- [ ] File storage (S3, local, or cloud)
- [ ] SSL certificates
- [ ] Domain configuration

### Development Tools
- [ ] Node.js 18+ / Bun
- [ ] PostgreSQL client tools
- [ ] Testing frameworks
- [ ] Monitoring tools

### Team Skills
- [ ] PostgreSQL expertise
- [ ] Hono/Node.js backend development
- [ ] JWT authentication
- [ ] Docker/containerization

## Next Steps

1. **Review and Approval**: Get stakeholder approval for migration plan
2. **Resource Allocation**: Assign team members to migration tasks
3. **Environment Setup**: Prepare development and staging environments
4. **Kickoff Meeting**: Align team on migration approach and timeline
5. **Phase 1 Start**: Begin database migration implementation

---

## Appendices

- [Entity Schema Documentation](./entity-schemas.md)
- [API Specification](./api-specification.md)
- [Database Migration Scripts](./database-scripts/)
- [Testing Guide](./testing-guide.md)
- [Deployment Guide](./deployment-guide.md)
- [Security Assessment](./security-review.md)