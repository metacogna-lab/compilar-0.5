-- PostgreSQL Extensions Setup
-- Run as superuser before creating schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable cryptographic functions for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable vector operations for AI embeddings (optional)
-- Note: Requires separate installation of pgvector
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- Enable table functions for advanced queries
CREATE EXTENSION IF NOT EXISTS "tablefunc";

-- Enable unaccent for text search (optional)
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Verify extensions are installed
SELECT name, default_version, installed_version
FROM pg_available_extensions
WHERE name IN ('uuid-ossp', 'pgcrypto', 'vector', 'tablefunc', 'unaccent')
ORDER BY name;