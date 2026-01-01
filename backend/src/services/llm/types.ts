/**
 * LLM Service Type Definitions
 *
 * Unified types for multi-provider LLM integration (OpenAI + Anthropic)
 */

export type LLMProviderName = 'openai' | 'anthropic';

export type LLMTaskType = 'chat' | 'embed' | 'stream';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
}

export interface StreamOptions extends ChatOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

export interface EmbedOptions {
  model?: string;
  dimensions?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface EmbedResponse {
  embedding: number[];
  model: string;
  usage: {
    totalTokens: number;
  };
}

/**
 * Trace metadata for Langsmith integration
 */
export interface TraceMetadata {
  userId?: string;
  sessionId?: string;
  feature: 'assessment_coaching' | 'chatbot' | 'rag_query' | 'content_analysis' | 'quiz_generation';
  pillar?: string;
  mode?: 'egalitarian' | 'hierarchical';
  [key: string]: any;
}

/**
 * Base LLM Provider Interface
 *
 * All provider implementations must conform to this interface
 */
export interface LLMProvider {
  /**
   * Provider name (openai or anthropic)
   */
  name: LLMProviderName;

  /**
   * Standard chat completion
   *
   * @param messages - Conversation messages
   * @param options - Chat options (temperature, max tokens, etc.)
   * @param metadata - Trace metadata for Langsmith
   * @returns Promise with chat response
   */
  chat(
    messages: Message[],
    options?: ChatOptions,
    metadata?: TraceMetadata
  ): Promise<ChatResponse>;

  /**
   * Streaming chat completion
   *
   * @param messages - Conversation messages
   * @param options - Stream options
   * @param metadata - Trace metadata for Langsmith
   * @returns Async generator yielding text chunks
   */
  stream(
    messages: Message[],
    options?: StreamOptions,
    metadata?: TraceMetadata
  ): AsyncGenerator<string, void, unknown>;

  /**
   * Generate embeddings for text
   *
   * @param text - Text to embed
   * @param options - Embed options
   * @param metadata - Trace metadata for Langsmith
   * @returns Promise with embedding vector
   */
  embed(
    text: string,
    options?: EmbedOptions,
    metadata?: TraceMetadata
  ): Promise<EmbedResponse>;

  /**
   * Get model name for specific task
   *
   * @param task - Task type (chat, embed, stream)
   * @returns Model identifier
   */
  getModel(task: LLMTaskType): string;

  /**
   * Check if provider is available (API key configured)
   */
  isAvailable(): boolean;
}

/**
 * LLM Service Configuration
 */
export interface LLMConfig {
  provider: LLMProviderName;
  fallbackProvider?: LLMProviderName;
  openai?: {
    apiKey: string;
    models: {
      chat: string;
      chatFallback: string;
      embed: string;
    };
  };
  anthropic?: {
    apiKey: string;
    models: {
      chat: string;
      chatFallback: string;
    };
  };
  langsmith?: {
    apiKey: string;
    project: string;
    enabled: boolean;
  };
}

/**
 * Error types for LLM operations
 */
export class LLMError extends Error {
  constructor(
    message: string,
    public provider: LLMProviderName,
    public originalError?: any
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export class LLMProviderUnavailableError extends LLMError {
  constructor(provider: LLMProviderName) {
    super(`LLM provider '${provider}' is not available (check API key)`, provider);
    this.name = 'LLMProviderUnavailableError';
  }
}

export class LLMRateLimitError extends LLMError {
  constructor(provider: LLMProviderName, retryAfter?: number) {
    super(`Rate limit exceeded for provider '${provider}'${retryAfter ? ` - retry after ${retryAfter}s` : ''}`, provider);
    this.name = 'LLMRateLimitError';
  }
}

export class LLMContextLengthError extends LLMError {
  constructor(provider: LLMProviderName, maxTokens: number) {
    super(`Context length exceeds maximum (${maxTokens} tokens) for provider '${provider}'`, provider);
    this.name = 'LLMContextLengthError';
  }
}
