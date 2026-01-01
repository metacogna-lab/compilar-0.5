/**
 * RAG Service
 *
 * Retrieval-Augmented Generation service for PILAR knowledge base
 * Provides semantic search using pgvector embeddings
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { getLLMService } from './llm/llm.service';
import { traceEmbed, trace } from './llm/tracing';
import type { TraceMetadata } from './llm/types';

export interface SearchResult {
  id: string;
  content: string;
  metadata: {
    pillar?: string;
    mode?: string;
    category?: string;
    [key: string]: any;
  };
  similarity: number;
}

export interface Force {
  id: string;
  name: string;
  description: string;
  pillar: string;
  mode: string;
  category: string;
}

export interface ForceConnection {
  id: string;
  name: string;
  from_pillar: string;
  to_pillar: string;
  mode: string;
  connection_type: 'reinforce' | 'inverse' | 'discretionary';
  description: string;
}

export class RAGService {
  private supabase: SupabaseClient;
  private llmService: ReturnType<typeof getLLMService>;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.llmService = getLLMService();
  }

  /**
   * Semantic search over PILAR knowledge base
   *
   * @param query - Search query
   * @param options - Filter options (pillar, mode, limit)
   * @param metadata - Trace metadata
   * @returns Search results ordered by similarity
   */
  async semanticSearch(
    query: string,
    options?: {
      pillar?: string;
      mode?: string;
      category?: string;
      limit?: number;
      threshold?: number;
    },
    metadata?: TraceMetadata
  ): Promise<SearchResult[]> {
    return await trace(
      'rag_semantic_search',
      async () => {
        // Generate embedding for query
        const embeddingResponse = await traceEmbed(
          () => this.llmService.embed(query),
          query,
          { ...metadata, feature: 'rag_query' }
        );

        // Call Supabase RPC function for vector similarity search
        const { data, error } = await this.supabase.rpc('match_pilar_knowledge', {
          query_embedding: embeddingResponse.embedding,
          match_threshold: options?.threshold || 0.7,
          match_count: options?.limit || 10,
          filter_pillar: options?.pillar || null,
          filter_mode: options?.mode || null,
          filter_category: options?.category || null,
        });

        if (error) {
          throw new Error(`Vector search failed: ${error.message}`);
        }

        return (data || []).map((result: any) => ({
          id: result.id,
          content: result.content,
          metadata: result.metadata || {},
          similarity: result.similarity,
        }));
      },
      { query, options },
      metadata
    );
  }

  /**
   * Get forces for a specific pillar and mode
   *
   * @param pillar - Pillar ID (e.g., 'divsexp', 'normexp')
   * @param mode - Mode (egalitarian or hierarchical)
   * @returns Array of forces for the pillar
   */
  async getForces(pillar: string, mode: string): Promise<Force[]> {
    const { data, error } = await this.supabase
      .from('pilar_forces')
      .select('*')
      .eq('pillar', pillar)
      .eq('mode', mode)
      .order('category');

    if (error) {
      throw new Error(`Failed to fetch forces: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all force connections for a mode
   *
   * @param mode - Mode (egalitarian or hierarchical)
   * @returns Array of force connections
   */
  async getConnections(mode: string): Promise<ForceConnection[]> {
    const { data, error } = await this.supabase
      .from('force_connections')
      .select('*')
      .eq('mode', mode)
      .order('from_pillar');

    if (error) {
      throw new Error(`Failed to fetch connections: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get specific connection between two pillars
   */
  async getConnection(
    fromPillar: string,
    toPillar: string,
    mode: string
  ): Promise<ForceConnection | null> {
    const { data, error } = await this.supabase
      .from('force_connections')
      .select('*')
      .eq('from_pillar', fromPillar)
      .eq('to_pillar', toPillar)
      .eq('mode', mode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to fetch connection: ${error.message}`);
    }

    return data;
  }

  /**
   * Ingest new knowledge into the vector database
   * (Admin only - requires service role key)
   *
   * @param content - Text content to ingest
   * @param metadata - Metadata about the content
   * @returns Created knowledge entry ID
   */
  async ingestKnowledge(
    content: string,
    metadata: {
      pillar?: string;
      mode?: string;
      category?: string;
      title?: string;
      [key: string]: any;
    }
  ): Promise<string> {
    return await trace(
      'rag_ingest_knowledge',
      async () => {
        // Generate embedding
        const embeddingResponse = await traceEmbed(
          () => this.llmService.embed(content),
          content,
          { feature: 'rag_query', pillar: metadata.pillar, mode: metadata.mode }
        );

        // Insert into database
        const { data, error } = await this.supabase
          .from('pilar_knowledge_vector')
          .insert({
            content,
            embedding: embeddingResponse.embedding,
            metadata,
          })
          .select('id')
          .single();

        if (error) {
          throw new Error(`Failed to ingest knowledge: ${error.message}`);
        }

        return data.id;
      },
      { contentLength: content.length, metadata }
    );
  }

  /**
   * Batch ingest multiple knowledge entries
   */
  async ingestKnowledgeBatch(
    entries: Array<{
      content: string;
      metadata: {
        pillar?: string;
        mode?: string;
        category?: string;
        title?: string;
        [key: string]: any;
      };
    }>
  ): Promise<string[]> {
    return await trace(
      'rag_ingest_batch',
      async () => {
        const ids: string[] = [];

        for (const entry of entries) {
          const id = await this.ingestKnowledge(entry.content, entry.metadata);
          ids.push(id);
        }

        return ids;
      },
      { count: entries.length }
    );
  }

  /**
   * Search with context enhancement
   * Performs semantic search and enriches results with related forces/connections
   */
  async searchWithContext(
    query: string,
    options?: {
      pillar?: string;
      mode?: string;
      limit?: number;
    },
    metadata?: TraceMetadata
  ): Promise<{
    results: SearchResult[];
    forces?: Force[];
    connections?: ForceConnection[];
  }> {
    const results = await this.semanticSearch(query, options, metadata);

    // If pillar and mode are specified, include related forces
    let forces: Force[] | undefined;
    let connections: ForceConnection[] | undefined;

    if (options?.pillar && options?.mode) {
      forces = await this.getForces(options.pillar, options.mode);
    }

    if (options?.mode) {
      connections = await this.getConnections(options.mode);
    }

    return {
      results,
      forces,
      connections,
    };
  }

  /**
   * Get contextual knowledge for a specific pillar and force
   * Useful for generating quiz questions or coaching insights
   */
  async getContextualKnowledge(
    pillar: string,
    mode: string,
    force?: string
  ): Promise<{
    forces: Force[];
    connections: ForceConnection[];
    knowledge: SearchResult[];
  }> {
    const [forces, connections, knowledge] = await Promise.all([
      this.getForces(pillar, mode),
      this.getConnections(mode).then(conns =>
        conns.filter(c => c.from_pillar === pillar || c.to_pillar === pillar)
      ),
      this.semanticSearch(
        `${pillar} ${mode} ${force || ''}`,
        { pillar, mode, limit: 5 },
        { feature: 'rag_query', pillar, mode }
      ),
    ]);

    return {
      forces,
      connections,
      knowledge,
    };
  }
}

/**
 * Create RAG service instance
 */
export function createRAGService(supabase: SupabaseClient): RAGService {
  return new RAGService(supabase);
}
