-- Enable pgvector extension (Supabase supports this natively)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create match_pilar_knowledge RPC function for vector similarity search
-- This function is called from RAGService.semanticSearch()
CREATE OR REPLACE FUNCTION match_pilar_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_pillar text DEFAULT NULL,
  filter_mode text DEFAULT NULL,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with function owner privileges
SET search_path = public  -- Security: prevent injection
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pkv.id,
    pkv.content_chunk AS content,
    pkv.metadata,
    1 - (pkv.embedding <=> query_embedding) AS similarity
  FROM pilar_knowledge_vectors pkv
  WHERE
    (filter_pillar IS NULL OR pkv.metadata->>'pillar' = filter_pillar)
    AND (filter_mode IS NULL OR pkv.metadata->>'mode' = filter_mode)
    AND (filter_category IS NULL OR pkv.metadata->>'category' = filter_category)
    AND 1 - (pkv.embedding <=> query_embedding) > match_threshold
  ORDER BY pkv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create index for faster vector search
-- IVFFlat is faster than exact search for large datasets
CREATE INDEX IF NOT EXISTS pilar_knowledge_vectors_embedding_idx
ON pilar_knowledge_vectors
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_pilar_knowledge TO authenticated;
GRANT EXECUTE ON FUNCTION match_pilar_knowledge TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION match_pilar_knowledge IS 'Semantic search over PILAR knowledge using pgvector cosine similarity';
