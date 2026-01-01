# Security Review: Standalone Hono Migration

This document provides a comprehensive security assessment for migrating from Supabase to a standalone Hono server architecture.

## Security Architecture Comparison

### Current Supabase Security
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Supabase      │───▶│   PostgreSQL    │
│   (Browser)     │    │   Auth + API    │    │   (RLS)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Supabase      │
                       │   Storage       │
                       └─────────────────┘
```

### New Standalone Security
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Hono Server   │───▶│   PostgreSQL    │
│   (Browser)     │    │   (JWT Auth)    │    │   (App Auth)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   File Storage  │
                       │   (S3/Local)    │
                       └─────────────────┘
```

## Authentication Security

### JWT Implementation Security

#### Token Generation
```typescript
// Secure JWT token generation
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' }  // Short-lived access tokens
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }   // Longer-lived refresh tokens
  );

  return { accessToken, refreshToken };
};
```

#### Token Validation Middleware
```typescript
// JWT validation middleware
export const authenticateToken = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'No authorization header' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Check token type
    if (decoded.type !== 'access') {
      return c.json({ error: 'Invalid token type' }, 401);
    }

    // Add user to context
    c.set('userId', decoded.userId);
    await next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return c.json({ error: 'Token expired' }, 401);
    }
    return c.json({ error: 'Invalid token' }, 401);
  }
};
```

#### Password Security
```typescript
// Secure password hashing
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // Industry standard
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### Session Management

#### Secure Session Storage
```typescript
// User sessions table for tracking
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}' NOT NULL,
  ip_address INET,
  user_agent TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

// Session cleanup function
export const cleanupExpiredSessions = async () => {
  await db.query(`
    UPDATE user_sessions
    SET is_active = false
    WHERE expires_at < NOW() AND is_active = true
  `);
};
```

#### Session Security Middleware
```typescript
// Track user activity and enforce session limits
export const trackActivity = async (c: Context, next: Next) => {
  const userId = c.get('userId');
  const clientIP = c.req.header('CF-Connecting-IP') ||
                   c.req.header('X-Forwarded-For') ||
                   c.req.header('X-Real-IP');

  // Update last activity
  await db.query(`
    UPDATE user_sessions
    SET last_activity = NOW()
    WHERE user_id = $1 AND is_active = true
  `, [userId]);

  // Log security event
  await logSecurityEvent({
    type: 'activity',
    userId,
    ipAddress: clientIP,
    userAgent: c.req.header('User-Agent'),
    endpoint: c.req.path,
    method: c.req.method
  });

  await next();
};
```

## Authorization Security

### Application-Level Authorization

#### Resource Ownership Checks
```typescript
// Check if user owns a resource
export const checkResourceOwnership = async (
  userId: string,
  resourceId: string,
  tableName: string
): Promise<boolean> => {
  const query = `
    SELECT COUNT(*) as count
    FROM ${tableName}
    WHERE id = $1 AND user_id = $2
  `;

  const result = await db.query(query, [resourceId, userId]);
  return result.rows[0].count > 0;
};

// Check team membership
export const checkTeamAccess = async (
  userId: string,
  teamId: string,
  requiredRole?: string
): Promise<boolean> => {
  let query = `
    SELECT tm.role
    FROM team_members tm
    WHERE tm.team_id = $1 AND tm.user_id = $2
  `;
  const params = [teamId, userId];

  if (requiredRole) {
    query += ' AND tm.role = $3';
    params.push(requiredRole);
  }

  const result = await db.query(query, params);
  return result.rows.length > 0;
};
```

#### Authorization Middleware
```typescript
// Generic authorization middleware
export const authorize = (options: {
  resourceType: string;
  action: 'read' | 'write' | 'delete';
  ownershipField?: string;
}) => {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId');
    const resourceId = c.req.param('id');

    switch (options.resourceType) {
      case 'user_owned':
        const hasOwnership = await checkResourceOwnership(
          userId,
          resourceId,
          options.ownershipField || 'user_id'
        );
        if (!hasOwnership) {
          return c.json({ error: 'Access denied' }, 403);
        }
        break;

      case 'team':
        const teamId = c.req.param('teamId') || resourceId;
        const hasTeamAccess = await checkTeamAccess(userId, teamId);
        if (!hasTeamAccess) {
          return c.json({ error: 'Access denied' }, 403);
        }
        break;

      case 'public':
        // Allow access
        break;

      default:
        return c.json({ error: 'Invalid resource type' }, 500);
    }

    await next();
  };
};
```

### API Endpoint Protection
```typescript
// Apply authorization to routes
const protectedRoutes = new Hono();

// User-owned resources
protectedRoutes.get('/pilar-assessments/:id',
  authenticateToken,
  authorize({ resourceType: 'user_owned', action: 'read', ownershipField: 'pilar_assessments' }),
  getAssessment
);

protectedRoutes.put('/pilar-assessments/:id',
  authenticateToken,
  authorize({ resourceType: 'user_owned', action: 'write', ownershipField: 'pilar_assessments' }),
  updateAssessment
);

// Team resources
protectedRoutes.get('/teams/:teamId/members',
  authenticateToken,
  authorize({ resourceType: 'team', action: 'read' }),
  getTeamMembers
);
```

## Data Protection

### Input Validation & Sanitization

#### Zod Schema Validation
```typescript
import { z } from 'zod';

// Strict input validation
export const createAssessmentSchema = z.object({
  pillar_id: z.enum(['divsexp', 'indrecip', 'popularity', 'grpprosp', 'outresp']),
  mode: z.enum(['egalitarian', 'hierarchical']),
  scores: z.record(z.number().min(0).max(10)).refine(
    (scores) => Object.keys(scores).length > 0,
    'At least one score required'
  ),
  forces_data: z.record(z.any()).optional()
}).strict(); // No additional properties allowed

// Sanitize HTML content
export const cmsContentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1), // Will be sanitized before storage
  excerpt: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(10).optional()
});
```

#### SQL Injection Prevention
```typescript
// Use parameterized queries exclusively
export const getUserAssessments = async (userId: string, pillarId?: string) => {
  let query = `
    SELECT id, pillar_id, mode, scores, created_at
    FROM pilar_assessments
    WHERE user_id = $1
  `;
  const params = [userId];

  if (pillarId) {
    query += ' AND pillar_id = $2';
    params.push(pillarId);
  }

  query += ' ORDER BY created_at DESC';

  return db.query(query, params);
};
```

### Data Encryption

#### Sensitive Data Handling
```typescript
// Encrypt sensitive data at rest
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
```

#### PII Data Protection
```typescript
// Store PII separately with encryption
CREATE TABLE user_pii (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  encrypted_ssn TEXT,        -- For future features
  encrypted_phone TEXT,      -- For future features
  encrypted_address JSONB,   -- For future features
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Network Security

### HTTPS & TLS Configuration
```typescript
// Force HTTPS in production
export const securityHeaders = async (c: Context, next: Next) => {
  // Security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // CORS configuration
  c.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'http://localhost:5173');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  c.header('Access-Control-Max-Age', '86400');

  await next();
};
```

### Rate Limiting
```typescript
// Implement rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
  analytics: true
});

export const rateLimit = async (c: Context, next: Next) => {
  const identifier = c.get('userId') || c.req.header('CF-Connecting-IP') || 'anonymous';
  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }

  await next();
};
```

### API Gateway Security
```typescript
// API key validation for server-to-server calls
export const validateApiKey = async (c: Context, next: Next) => {
  const apiKey = c.req.header('X-API-Key');

  if (!apiKey) {
    return c.json({ error: 'API key required' }, 401);
  }

  const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
  if (!validKeys.includes(apiKey)) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  await next();
};
```

## Database Security

### Connection Security
```typescript
// Secure database connection
import { Pool } from 'pg';

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
  max: 20,              // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const db = new Pool(dbConfig);

// Connection error handling
db.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(1);
});
```

### Database User Permissions
```sql
-- Create limited database user
CREATE USER compilar_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE compilar_prod TO compilar_app;
GRANT USAGE ON SCHEMA public TO compilar_app;

-- Grant specific table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO compilar_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO compilar_app;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM compilar_app;
REVOKE USAGE ON LANGUAGE plpgsql FROM compilar_app;
```

### Query Auditing
```sql
-- Enable query logging for security monitoring
ALTER SYSTEM SET log_statement = 'ddl';
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Create audit trigger for sensitive tables
CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_log (
    table_name, operation, user_id, old_values, new_values, query
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    current_setting('app.user_id', true)::uuid,
    row_to_json(OLD)::jsonb,
    row_to_json(NEW)::jsonb,
    current_query()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_pilar_assessments
  AFTER INSERT OR UPDATE OR DELETE ON pilar_assessments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

## File Storage Security

### Secure File Upload
```typescript
// File upload validation and security
import { createHash } from 'crypto';
import { promises as fs } from 'fs';

export const validateFileUpload = (file: File) => {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large');
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };

  if (mimeToExt[file.type] !== extension) {
    throw new Error('File extension does not match MIME type');
  }

  return true;
};

export const processFileUpload = async (file: File, userId: string) => {
  // Generate secure filename
  const hash = createHash('sha256')
    .update(`${userId}-${Date.now()}-${file.name}`)
    .digest('hex');
  const extension = file.name.split('.').pop();
  const filename = `${hash}.${extension}`;

  // Validate file
  validateFileUpload(file);

  // Scan for malware (if available)
  // await scanFileForMalware(file);

  // Store file securely
  const filePath = `/uploads/${userId}/${filename}`;
  await fs.writeFile(filePath, file.buffer);

  return {
    filename,
    path: filePath,
    size: file.size,
    mimeType: file.type
  };
};
```

### File Access Control
```typescript
// Secure file serving with access control
export const serveFile = async (c: Context) => {
  const filename = c.req.param('filename');
  const userId = c.get('userId');

  // Verify user owns the file
  const fileRecord = await db.query(`
    SELECT * FROM user_files
    WHERE filename = $1 AND user_id = $2
  `, [filename, userId]);

  if (fileRecord.rows.length === 0) {
    return c.json({ error: 'File not found or access denied' }, 404);
  }

  // Serve file with security headers
  c.header('Cache-Control', 'private, max-age=3600');
  c.header('X-Content-Type-Options', 'nosniff');

  return c.body(fileStream);
};
```

## Security Monitoring

### Security Event Logging
```typescript
// Comprehensive security event logging
interface SecurityEvent {
  type: 'auth_attempt' | 'auth_success' | 'auth_failure' | 'access_denied' |
        'suspicious_activity' | 'data_breach_attempt' | 'rate_limit_hit';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const logSecurityEvent = async (event: SecurityEvent) => {
  await db.query(`
    INSERT INTO security_events (
      type, user_id, ip_address, user_agent, details, severity, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
  `, [
    event.type,
    event.userId,
    event.ipAddress,
    event.userAgent,
    JSON.stringify(event.details),
    event.severity
  ]);

  // Alert on high/critical events
  if (event.severity === 'high' || event.severity === 'critical') {
    await sendSecurityAlert(event);
  }
};
```

### Intrusion Detection
```typescript
// Basic intrusion detection
export const detectSuspiciousActivity = (events: SecurityEvent[]) => {
  // Check for brute force attempts
  const failedLogins = events.filter(
    e => e.type === 'auth_failure' &&
    e.details.reason === 'invalid_password'
  );

  if (failedLogins.length > 5) {
    return {
      type: 'brute_force_attempt',
      severity: 'high',
      details: { failed_attempts: failedLogins.length }
    };
  }

  // Check for unusual access patterns
  const unusualAccess = events.filter(
    e => e.type === 'access_denied' &&
    e.details.resource === 'admin_endpoint'
  );

  if (unusualAccess.length > 3) {
    return {
      type: 'suspicious_access_pattern',
      severity: 'medium',
      details: { denied_access_count: unusualAccess.length }
    };
  }

  return null;
};
```

## Compliance Considerations

### GDPR Compliance
```typescript
// Data subject access request handling
export const handleDataRequest = async (userId: string, requestType: 'access' | 'delete') => {
  if (requestType === 'access') {
    // Export all user data
    const userData = await exportUserData(userId);
    return userData;
  } else if (requestType === 'delete') {
    // Delete all user data (GDPR right to be forgotten)
    await deleteUserData(userId);
    return { success: true };
  }
};

export const exportUserData = async (userId: string) => {
  const tables = [
    'users', 'user_profiles', 'pilar_assessments', 'assessment_sessions',
    'user_progress', 'coach_conversations', 'user_analytics'
  ];

  const exportData: Record<string, any[]> = {};

  for (const table of tables) {
    const result = await db.query(`SELECT * FROM ${table} WHERE user_id = $1`, [userId]);
    exportData[table] = result.rows;
  }

  return exportData;
};
```

### Security Headers Compliance
```typescript
// Comprehensive security headers
export const securityMiddleware = async (c: Context, next: Next) => {
  // OWASP recommended headers
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.header('Content-Security-Policy', "default-src 'self'");
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Remove server information
  c.header('X-Powered-By', '');

  await next();
};
```

## Security Testing

### Automated Security Tests
```typescript
describe('Security Tests', () => {
  it('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request(app)
      .post('/api/v1/entities/pilar-assessments')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ pillar_id: maliciousInput });

    expect(response.status).toBe(400);
    // Verify users table still exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'users'
      )
    `);
    expect(tableExists.rows[0].exists).toBe(true);
  });

  it('should validate JWT tokens properly', async () => {
    const invalidTokens = [
      'invalid.jwt.token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.invalid',
      expiredToken
    ];

    for (const token of invalidTokens) {
      const response = await request(app)
        .get('/api/v1/entities/user-profiles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
    }
  });

  it('should enforce rate limiting', async () => {
    const requests = Array(101).fill().map(() =>
      request(app)
        .get('/api/v1/entities/pilar-assessments')
        .set('Authorization', `Bearer ${testToken}`)
    );

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);

    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

## Incident Response

### Security Incident Procedure
1. **Detection**: Security monitoring alerts trigger
2. **Assessment**: Evaluate incident severity and impact
3. **Containment**: Isolate affected systems
4. **Recovery**: Restore from clean backups
5. **Analysis**: Determine root cause and attack vector
6. **Reporting**: Notify affected users and authorities if required
7. **Prevention**: Implement additional security measures

### Emergency Contacts
- **Security Team**: security@compilar.com
- **Infrastructure Team**: infra@compilar.com
- **Legal Team**: legal@compilar.com

## Security Audit Checklist

### Pre-Migration Audit
- [ ] Authentication system security review
- [ ] Authorization logic verification
- [ ] Data encryption implementation
- [ ] Network security configuration
- [ ] Database security settings

### Post-Migration Audit
- [ ] Penetration testing completed
- [ ] Code security review finished
- [ ] Dependency vulnerability scan passed
- [ ] Security monitoring operational
- [ ] Incident response plan documented

### Ongoing Security
- [ ] Regular security updates applied
- [ ] Security monitoring alerts configured
- [ ] Access reviews conducted quarterly
- [ ] Security training completed annually
- [ ] Third-party security assessments performed

This security review ensures the standalone Hono migration maintains or improves upon Supabase's security posture while providing full control over the security implementation.