# Security Review: Base44-to-REST Migration

## Overview

This security review assesses the risks and mitigations for migrating from Base44 client API calls to well-formed REST endpoints. The migration introduces new security considerations while maintaining or improving the current security posture.

## Current Security Posture

### Base44 SDK Security

**Authentication:**
- Proprietary authentication via Base44 SDK
- JWT tokens managed by Base44 infrastructure
- Limited visibility into token handling

**Authorization:**
- Base44-managed access controls
- Row Level Security (RLS) in Supabase
- Proprietary permission system

**Data Protection:**
- Data encrypted in transit (TLS)
- Data at rest encryption via Supabase
- Limited control over encryption keys

### Known Security Issues

**Vendor Lock-in Risks:**
- Dependency on Base44 infrastructure availability
- Limited auditability of security controls
- Potential single points of failure

**Data Exposure Risks:**
- Broad permissions in development environments
- Potential over-permissive RLS policies
- Limited data classification controls

## Migration Security Architecture

### Authentication Security

#### JWT Token Management

**Token Generation:**
```typescript
// Secure token generation with proper claims
const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    {
      userId,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      iss: 'compilar-api',
      aud: 'compilar-client'
    },
    process.env.JWT_SECRET!,
    { algorithm: 'HS256' }
  );
};
```

**Token Validation:**
```typescript
// Comprehensive token validation
const validateToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ['HS256'],
      issuer: 'compilar-api',
      audience: 'compilar-client',
      clockTolerance: 30 // 30 second tolerance
    });

    // Additional validation
    if (!decoded.userId || !decoded.role) {
      throw new Error('Invalid token payload');
    }

    return decoded as TokenPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid token', error);
  }
};
```

#### Security Headers Implementation

**Helmet.js Configuration:**
```typescript
// Security headers middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

### Authorization Security

#### Application-Level Access Control

**Authorization Middleware:**
```typescript
// Resource ownership validation
export const requireOwnership = (resourceType: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    const resourceId = c.req.param('id');

    const isOwner = await checkResourceOwnership(user.id, resourceType, resourceId);

    if (!isOwner) {
      return c.json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'You do not have permission to access this resource'
        }
      }, 403);
    }

    await next();
  };
};

// Role-based access control
export const requireRole = (requiredRole: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user.roles.includes(requiredRole)) {
      return c.json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Required role: ${requiredRole}`
        }
      }, 403);
    }

    await next();
  };
};
```

**Permission Matrix:**
```typescript
const PERMISSIONS = {
  // Assessment permissions
  assessment: {
    create: ['user'],
    read: ['owner', 'admin'],
    update: ['owner', 'admin'],
    delete: ['owner', 'admin']
  },

  // Team permissions
  team: {
    create: ['user'],
    read: ['member', 'admin'],
    update: ['owner', 'admin'],
    delete: ['owner'],
    invite: ['owner', 'admin'],
    remove_member: ['owner', 'admin']
  },

  // Admin permissions
  admin: {
    read_analytics: ['admin'],
    manage_users: ['admin'],
    system_config: ['super_admin']
  }
};
```

### Data Protection

#### Input Validation & Sanitization

**Request Validation:**
```typescript
// Comprehensive input validation
import { z } from 'zod';

const assessmentCreateSchema = z.object({
  pillar_id: z.string().min(1).max(50).regex(/^[a-z]+$/),
  mode: z.enum(['egalitarian', 'hierarchical']),
  scores: z.record(z.number().min(0).max(10)).optional(),
  forces_data: z.record(z.any()).optional()
}).strict(); // No additional properties allowed

// SQL injection prevention
const safeQuery = (userId: string, pillarId?: string) => {
  const query = `
    SELECT * FROM pilar_assessments
    WHERE user_id = $1
    ${pillarId ? 'AND pillar_id = $2' : ''}
  `;
  const params = pillarId ? [userId, pillarId] : [userId];

  return pool.query(query, params);
};
```

#### Data Encryption

**Database Encryption:**
```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_data(data text, key text)
RETURNS text AS $$
BEGIN
  RETURN encode(encrypt(data::bytea, key::bytea, 'aes'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_data(encrypted_data text, key text)
RETURNS text AS $$
BEGIN
  RETURN decrypt(decode(encrypted_data, 'hex'), key::bytea, 'aes')::text;
END;
$$ LANGUAGE plpgsql;
```

**API Response Encryption:**
```typescript
// Encrypt sensitive response data
const encryptResponse = (data: any, userKey: string) => {
  const jsonString = JSON.stringify(data);
  return crypto.encrypt(jsonString, userKey);
};

// Decrypt request data
const decryptRequest = (encryptedData: string, userKey: string) => {
  const jsonString = crypto.decrypt(encryptedData, userKey);
  return JSON.parse(jsonString);
};
```

### API Security

#### Rate Limiting

**Tiered Rate Limiting:**
```typescript
// Rate limiting configuration
const rateLimits = {
  // Authentication endpoints
  auth: {
    login: { window: '15m', max: 5 }, // 5 attempts per 15 minutes
    register: { window: '1h', max: 3 }, // 3 registrations per hour
    refresh: { window: '1h', max: 10 } // 10 refreshes per hour
  },

  // General API
  general: {
    authenticated: { window: '1h', max: 1000 }, // 1000 requests per hour
    anonymous: { window: '1h', max: 100 } // 100 requests per hour
  },

  // AI endpoints (expensive)
  ai: {
    coaching: { window: '1h', max: 50 }, // 50 coaching requests per hour
    rag: { window: '1h', max: 100 }, // 100 RAG queries per hour
    streaming: { window: '1h', max: 20 } // 20 streaming sessions per hour
  }
};
```

**Rate Limit Implementation:**
```typescript
// Redis-based rate limiting
const checkRateLimit = async (key: string, limit: RateLimitConfig) => {
  const redisKey = `ratelimit:${key}`;
  const now = Date.now();
  const windowStart = now - parseDuration(limit.window);

  // Remove old entries
  await redis.zremrangebyscore(redisKey, 0, windowStart);

  // Count current requests
  const requestCount = await redis.zcard(redisKey);

  if (requestCount >= limit.max) {
    const oldestRequest = await redis.zrange(redisKey, 0, 0, 'WITHSCORES');
    const resetTime = parseInt(oldestRequest[1]) + parseDuration(limit.window);

    throw new RateLimitError({
      retryAfter: Math.ceil((resetTime - now) / 1000),
      limit: limit.max,
      window: limit.window
    });
  }

  // Add current request
  await redis.zadd(redisKey, now, `${now}-${Math.random()}`);
  await redis.expire(redisKey, parseDuration(limit.window));
};
```

#### CORS Configuration

**Secure CORS Setup:**
```typescript
// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined) => {
    const allowedOrigins = [
      'https://compilar.app',
      'https://www.compilar.app',
      'https://staging.compilar.app',
      process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
    ].filter(Boolean);

    return allowedOrigins.includes(origin!) || false;
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 86400 // 24 hours
};
```

### Database Security

#### Connection Security

**Secure Database Configuration:**
```typescript
// Database connection with security
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CA,
    cert: process.env.DB_SSL_CERT,
    key: process.env.DB_SSL_KEY
  },
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  query_timeout: 10000, // 10 second query timeout
  statement_timeout: 10000 // 10 second statement timeout
};
```

#### Query Security

**Prepared Statements:**
```typescript
// Always use parameterized queries
const getUserAssessments = async (userId: string, pillarId?: string) => {
  const query = `
    SELECT id, pillar_id, mode, scores, created_at
    FROM pilar_assessments
    WHERE user_id = $1
    ${pillarId ? 'AND pillar_id = $2' : ''}
    ORDER BY created_at DESC
    LIMIT $3
  `;

  const params = pillarId
    ? [userId, pillarId, 50]
    : [userId, 50];

  return pool.query(query, params);
};
```

**SQL Injection Prevention:**
```typescript
// Whitelist allowed table names and columns
const ALLOWED_TABLES = new Set([
  'pilar_assessments',
  'assessment_sessions',
  'user_profiles',
  'teams'
]);

const ALLOWED_COLUMNS = new Set([
  'id', 'user_id', 'pillar_id', 'mode', 'created_at', 'updated_at'
]);

const validateTableName = (tableName: string) => {
  if (!ALLOWED_TABLES.has(tableName)) {
    throw new SecurityError('Invalid table name');
  }
};

const validateColumnName = (columnName: string) => {
  if (!ALLOWED_COLUMNS.has(columnName)) {
    throw new SecurityError('Invalid column name');
  }
};
```

### File Upload Security

#### File Validation

**Comprehensive File Validation:**
```typescript
// File upload security
const validateFileUpload = (file: File, category: string) => {
  // File size limits by category
  const sizeLimits = {
    avatar: 2 * 1024 * 1024, // 2MB
    content: 10 * 1024 * 1024, // 10MB
    assessment: 5 * 1024 * 1024, // 5MB
    team: 20 * 1024 * 1024 // 20MB
  };

  if (file.size > sizeLimits[category]) {
    throw new ValidationError('File too large');
  }

  // MIME type validation
  const allowedTypes = {
    avatar: ['image/jpeg', 'image/png', 'image/webp'],
    content: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    assessment: ['application/json', 'text/csv'],
    team: ['image/jpeg', 'image/png', 'application/pdf']
  };

  if (!allowedTypes[category].includes(file.type)) {
    throw new ValidationError('Invalid file type');
  }

  // File name sanitization
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

  return {
    ...file,
    name: sanitizedName,
    safeName: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${sanitizedName}`
  };
};
```

#### Secure File Storage

**File Storage Security:**
```typescript
// Secure file storage with access control
const storeFile = async (file: File, userId: string, category: string) => {
  const validatedFile = validateFileUpload(file, category);

  // Generate secure path
  const filePath = `uploads/${userId}/${category}/${validatedFile.safeName}`;

  // Store file metadata in database first
  const fileRecord = await pool.query(`
    INSERT INTO files (user_id, filename, original_name, mime_type, size, path, category)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `, [
    userId,
    validatedFile.safeName,
    validatedFile.name,
    validatedFile.type,
    validatedFile.size,
    filePath,
    category
  ]);

  // Upload to secure storage
  await uploadToSecureStorage(validatedFile, filePath);

  return fileRecord.rows[0];
};
```

### Monitoring & Auditing

#### Security Event Logging

**Comprehensive Audit Logging:**
```typescript
// Security event logging
const logSecurityEvent = async (event: SecurityEvent) => {
  const auditEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    event_type: event.type,
    user_id: event.userId,
    ip_address: event.ipAddress,
    user_agent: event.userAgent,
    resource_type: event.resourceType,
    resource_id: event.resourceId,
    action: event.action,
    success: event.success,
    details: event.details,
    severity: event.severity
  };

  // Store in database
  await pool.query(`
    INSERT INTO security_audit_log
    (id, timestamp, event_type, user_id, ip_address, user_agent,
     resource_type, resource_id, action, success, details, severity)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `, Object.values(auditEntry));

  // Send to monitoring system
  if (event.severity === 'high') {
    await sendAlert(auditEntry);
  }
};
```

**Security Events to Monitor:**
```typescript
const SECURITY_EVENTS = {
  AUTHENTICATION_SUCCESS: 'auth_success',
  AUTHENTICATION_FAILURE: 'auth_failure',
  AUTHORIZATION_FAILURE: 'authz_failure',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  DATA_ACCESS_VIOLATION: 'data_access_violation',
  FILE_UPLOAD_VIOLATION: 'file_upload_violation',
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
  XSS_ATTEMPT: 'xss_attempt'
} as const;
```

### Incident Response

#### Security Incident Response Plan

**Incident Classification:**
```typescript
const INCIDENT_SEVERITY = {
  low: {
    description: 'Minor security issue, no immediate threat',
    response_time: '24 hours',
    notification: 'internal_team'
  },
  medium: {
    description: 'Security vulnerability with potential impact',
    response_time: '4 hours',
    notification: 'security_team'
  },
  high: {
    description: 'Active security breach or critical vulnerability',
    response_time: '1 hour',
    notification: 'all_teams_emergency'
  },
  critical: {
    description: 'System-wide compromise or data breach',
    response_time: 'immediate',
    notification: 'executives_emergency'
  }
};
```

**Incident Response Checklist:**
```typescript
const INCIDENT_RESPONSE_STEPS = [
  'Isolate affected systems',
  'Assess breach scope and impact',
  'Contain the incident',
  'Gather evidence for forensics',
  'Notify affected parties',
  'Implement fixes',
  'Conduct post-mortem analysis',
  'Update security measures'
];
```

### Compliance Considerations

#### Data Protection Compliance

**GDPR Compliance:**
- Data minimization principles
- Right to erasure implementation
- Consent management
- Data portability features

**Data Retention Policies:**
```typescript
const DATA_RETENTION_POLICIES = {
  user_profiles: 'forever', // Until account deletion
  pilar_assessments: 'forever', // User data preservation
  assessment_sessions: '2_years', // Performance analytics
  user_analytics: '1_year', // Analytics retention
  security_audit_log: '7_years', // Legal requirement
  chat_messages: '1_year', // Conversation history
  file_uploads: 'user_defined' // User-controlled retention
};
```

### Security Testing

#### Automated Security Testing

**Security Test Suite:**
```typescript
// security/security-tests.ts
describe('Security Tests', () => {
  describe('Authentication', () => {
    test('should prevent brute force attacks', async () => {
      // Test rate limiting
      for (let i = 0; i < 10; i++) {
        await expect(api.login(invalidCredentials)).rejects.toThrow('RATE_LIMIT_EXCEEDED');
      }
    });

    test('should validate JWT tokens properly', async () => {
      const invalidTokens = [
        'invalid.jwt.token',
        expiredToken,
        tamperedToken
      ];

      for (const token of invalidTokens) {
        await expect(api.callWithToken(token)).rejects.toThrow('INVALID_TOKEN');
      }
    });
  });

  describe('Authorization', () => {
    test('should enforce resource ownership', async () => {
      const otherUserAssessment = await createAssessment(otherUser.id);

      await expect(
        api.getAssessment(otherUserAssessment.id, currentUser.token)
      ).rejects.toThrow('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('Input Validation', () => {
    test('should prevent SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE users; --";

      await expect(
        api.searchAssessments(maliciousInput)
      ).rejects.toThrow('VALIDATION_ERROR');
    });

    test('should prevent XSS attacks', async () => {
      const xssPayload = '<script>alert("xss")</script>';

      const result = await api.createAssessment({ title: xssPayload });
      expect(result.title).not.toContain('<script>');
    });
  });
});
```

### Migration-Specific Security Risks

#### Data Migration Security

**Data Export Security:**
```typescript
// Secure data export during migration
const exportUserData = async (userId: string) => {
  // Verify user consent
  const consent = await checkDataExportConsent(userId);
  if (!consent) {
    throw new AuthorizationError('Data export not authorized');
  }

  // Export data with encryption
  const userData = await gatherUserData(userId);
  const encryptedData = encryptDataForExport(userData, userId);

  // Log export event
  await logSecurityEvent({
    type: 'DATA_EXPORT',
    userId,
    resourceType: 'user_data',
    action: 'export',
    success: true
  });

  return encryptedData;
};
```

**Data Consistency Validation:**
```typescript
// Validate data integrity during migration
const validateDataConsistency = async () => {
  const base44Count = await getBase44RecordCount();
  const restCount = await getRestRecordCount();

  if (Math.abs(base44Count - restCount) > threshold) {
    await sendAlert('Data consistency violation detected');
  }

  // Validate data integrity
  const integrityCheck = await runIntegrityChecks();
  if (!integrityCheck.passed) {
    await sendAlert('Data integrity check failed', integrityCheck.errors);
  }
};
```

### Security Monitoring Dashboard

#### Key Security Metrics

**Real-time Security Monitoring:**
```typescript
// Security metrics collection
const securityMetrics = {
  authentication: {
    successRate: calculateSuccessRate('auth_success', 'auth_failure'),
    failedAttempts: countEvents('auth_failure'),
    suspiciousLogins: detectSuspiciousLoginPatterns()
  },

  authorization: {
    permissionDenials: countEvents('authz_failure'),
    resourceAccess: monitorResourceAccessPatterns()
  },

  api: {
    rateLimitHits: countEvents('rate_limit_exceeded'),
    errorRate: calculateErrorRate(),
    responseTime: measureResponseTimes()
  },

  data: {
    accessPatterns: monitorDataAccess(),
    exportRequests: countEvents('data_export'),
    integrityStatus: checkDataIntegrity()
  }
};
```

This comprehensive security review ensures that the migration from Base44 to REST endpoints maintains and improves the security posture of the Compilar system while introducing proper security controls and monitoring capabilities.