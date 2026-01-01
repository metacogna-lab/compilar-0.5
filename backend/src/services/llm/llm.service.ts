/**
 * LLM Service
 *
 * Main service providing unified interface to LLM providers
 * Supports provider switching and automatic fallback
 */

import type {
  LLMProvider,
  LLMProviderName,
  Message,
  ChatOptions,
  StreamOptions,
  EmbedOptions,
  ChatResponse,
  EmbedResponse,
  TraceMetadata,
  LLMConfig,
} from './types';
import { LLMError, LLMProviderUnavailableError } from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';

export class LLMService {
  private primaryProvider: LLMProvider | null = null;
  private fallbackProvider: LLMProvider | null = null;
  private embedProvider: LLMProvider | null = null; // Always OpenAI for embeddings
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.initialize();
  }

  /**
   * Initialize providers based on configuration
   */
  private initialize(): void {
    // Initialize primary provider
    if (this.config.provider === 'openai' && this.config.openai?.apiKey) {
      this.primaryProvider = new OpenAIProvider(
        this.config.openai.apiKey,
        this.config.openai.models
      );
    } else if (this.config.provider === 'anthropic' && this.config.anthropic?.apiKey) {
      this.primaryProvider = new AnthropicProvider(
        this.config.anthropic.apiKey,
        this.config.anthropic.models
      );
    }

    // Initialize fallback provider (opposite of primary)
    if (this.config.fallbackProvider) {
      if (this.config.fallbackProvider === 'openai' && this.config.openai?.apiKey) {
        this.fallbackProvider = new OpenAIProvider(
          this.config.openai.apiKey,
          this.config.openai.models
        );
      } else if (this.config.fallbackProvider === 'anthropic' && this.config.anthropic?.apiKey) {
        this.fallbackProvider = new AnthropicProvider(
          this.config.anthropic.apiKey,
          this.config.anthropic.models
        );
      }
    }

    // Initialize embedding provider (always OpenAI)
    if (this.config.openai?.apiKey) {
      this.embedProvider = new OpenAIProvider(
        this.config.openai.apiKey,
        this.config.openai.models
      );
    }

    // Validate at least one provider is available
    if (!this.primaryProvider && !this.fallbackProvider) {
      throw new Error('No LLM providers configured - check API keys');
    }
  }

  /**
   * Get active provider for chat/stream
   */
  private getProvider(): LLMProvider {
    if (this.primaryProvider?.isAvailable()) {
      return this.primaryProvider;
    }
    if (this.fallbackProvider?.isAvailable()) {
      console.warn(`Primary provider unavailable, using fallback: ${this.fallbackProvider.name}`);
      return this.fallbackProvider;
    }
    throw new LLMProviderUnavailableError(this.config.provider);
  }

  /**
   * Get embedding provider (always OpenAI)
   */
  private getEmbedProvider(): LLMProvider {
    if (!this.embedProvider?.isAvailable()) {
      throw new LLMProviderUnavailableError('openai');
    }
    return this.embedProvider;
  }

  /**
   * Standard chat completion with automatic fallback
   */
  async chat(
    messages: Message[],
    options?: ChatOptions,
    metadata?: TraceMetadata
  ): Promise<ChatResponse> {
    try {
      const provider = this.getProvider();
      return await provider.chat(messages, options, metadata);
    } catch (error) {
      // Try fallback if primary fails
      if (this.fallbackProvider && error instanceof LLMError) {
        console.warn(`Primary provider failed, attempting fallback: ${error.message}`);
        try {
          return await this.fallbackProvider.chat(messages, options, metadata);
        } catch (fallbackError) {
          console.error('Fallback provider also failed:', fallbackError);
          throw fallbackError;
        }
      }
      throw error;
    }
  }

  /**
   * Streaming chat completion
   */
  async *stream(
    messages: Message[],
    options?: StreamOptions,
    metadata?: TraceMetadata
  ): AsyncGenerator<string, void, unknown> {
    const provider = this.getProvider();
    yield* provider.stream(messages, options, metadata);
  }

  /**
   * Generate embeddings (always uses OpenAI)
   */
  async embed(
    text: string,
    options?: EmbedOptions,
    metadata?: TraceMetadata
  ): Promise<EmbedResponse> {
    const provider = this.getEmbedProvider();
    return await provider.embed(text, options, metadata);
  }

  /**
   * Batch embed multiple texts
   */
  async embedBatch(
    texts: string[],
    options?: EmbedOptions,
    metadata?: TraceMetadata
  ): Promise<EmbedResponse[]> {
    const provider = this.getEmbedProvider();
    return await Promise.all(
      texts.map(text => provider.embed(text, options, metadata))
    );
  }

  /**
   * Get current provider info
   */
  getProviderInfo(): {
    primary: LLMProviderName | null;
    fallback: LLMProviderName | null;
    embed: LLMProviderName | null;
  } {
    return {
      primary: this.primaryProvider?.name || null,
      fallback: this.fallbackProvider?.name || null,
      embed: this.embedProvider?.name || null,
    };
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return Boolean(
      (this.primaryProvider?.isAvailable() || this.fallbackProvider?.isAvailable()) &&
      this.embedProvider?.isAvailable()
    );
  }
}

/**
 * Create LLM service from environment variables
 */
export function createLLMService(): LLMService {
  const config: LLMConfig = {
    provider: (process.env.LLM_PROVIDER as LLMProviderName) || 'anthropic',
    fallbackProvider: process.env.LLM_FALLBACK_PROVIDER as LLMProviderName,
    openai: process.env.OPENAI_API_KEY ? {
      apiKey: process.env.OPENAI_API_KEY,
      models: {
        chat: process.env.OPENAI_CHAT_MODEL || 'gpt-4-turbo-preview',
        chatFallback: process.env.OPENAI_CHAT_FALLBACK_MODEL || 'gpt-3.5-turbo',
        embed: process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small',
      },
    } : undefined,
    anthropic: process.env.ANTHROPIC_API_KEY ? {
      apiKey: process.env.ANTHROPIC_API_KEY,
      models: {
        chat: process.env.ANTHROPIC_CHAT_MODEL || 'claude-3-5-sonnet-20241022',
        chatFallback: process.env.ANTHROPIC_CHAT_FALLBACK_MODEL || 'claude-3-haiku-20240307',
      },
    } : undefined,
    langsmith: {
      apiKey: process.env.LANGSMITH_API_KEY || '',
      project: process.env.LANGSMITH_PROJECT || 'compilar-v0.5',
      enabled: Boolean(process.env.LANGSMITH_API_KEY),
    },
  };

  return new LLMService(config);
}

// Singleton instance
let llmServiceInstance: LLMService | null = null;

/**
 * Get singleton LLM service instance
 */
export function getLLMService(): LLMService {
  if (!llmServiceInstance) {
    llmServiceInstance = createLLMService();
  }
  return llmServiceInstance;
}
