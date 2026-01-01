/**
 * Base LLM Provider
 *
 * Abstract base class for all LLM provider implementations
 */

import type {
  LLMProvider,
  LLMProviderName,
  LLMTaskType,
  Message,
  ChatOptions,
  StreamOptions,
  EmbedOptions,
  ChatResponse,
  EmbedResponse,
  TraceMetadata,
} from '../types';
import { LLMProviderUnavailableError } from '../types';

export abstract class BaseLLMProvider implements LLMProvider {
  abstract name: LLMProviderName;
  protected apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Standard chat completion - must be implemented by provider
   */
  abstract chat(
    messages: Message[],
    options?: ChatOptions,
    metadata?: TraceMetadata
  ): Promise<ChatResponse>;

  /**
   * Streaming chat completion - must be implemented by provider
   */
  abstract stream(
    messages: Message[],
    options?: StreamOptions,
    metadata?: TraceMetadata
  ): AsyncGenerator<string, void, unknown>;

  /**
   * Generate embeddings - must be implemented by provider
   */
  abstract embed(
    text: string,
    options?: EmbedOptions,
    metadata?: TraceMetadata
  ): Promise<EmbedResponse>;

  /**
   * Get model name for task - must be implemented by provider
   */
  abstract getModel(task: LLMTaskType): string;

  /**
   * Check if provider is available (API key configured)
   */
  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  /**
   * Validate provider is available, throw error if not
   */
  protected ensureAvailable(): void {
    if (!this.isAvailable()) {
      throw new LLMProviderUnavailableError(this.name);
    }
  }

  /**
   * Convert messages to format expected by provider
   * Can be overridden by specific providers
   */
  protected normalizeMessages(messages: Message[]): Message[] {
    return messages.filter(msg => msg.content && msg.content.trim().length > 0);
  }

  /**
   * Get default chat options merged with provider defaults
   */
  protected getDefaultChatOptions(options?: ChatOptions): Required<Omit<ChatOptions, 'stop'>> & { stop?: string | string[] } {
    return {
      model: options?.model || this.getModel('chat'),
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 2048,
      topP: options?.topP ?? 1.0,
      frequencyPenalty: options?.frequencyPenalty ?? 0.0,
      presencePenalty: options?.presencePenalty ?? 0.0,
      stop: options?.stop,
    };
  }

  /**
   * Get default embedding options
   */
  protected getDefaultEmbedOptions(options?: EmbedOptions): Required<EmbedOptions> {
    return {
      model: options?.model || this.getModel('embed'),
      dimensions: options?.dimensions ?? 1536,
    };
  }

  /**
   * Sanitize metadata for tracing (remove sensitive data)
   */
  protected sanitizeMetadata(metadata?: TraceMetadata): TraceMetadata | undefined {
    if (!metadata) return undefined;

    // Create a copy and remove any sensitive fields
    const { userId, ...safe } = metadata;

    return {
      ...safe,
      // Hash user ID for privacy
      userIdHash: userId ? this.hashString(userId) : undefined,
    };
  }

  /**
   * Simple string hash for privacy
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Count tokens (rough estimate - provider implementations can override)
   */
  protected estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Count total tokens in messages
   */
  protected estimateMessageTokens(messages: Message[]): number {
    return messages.reduce((total, msg) => {
      return total + this.estimateTokens(msg.content) + 4; // +4 for message overhead
    }, 0);
  }

  /**
   * Validate message array is not empty
   */
  protected validateMessages(messages: Message[]): void {
    if (!messages || messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    const hasContent = messages.some(msg => msg.content && msg.content.trim().length > 0);
    if (!hasContent) {
      throw new Error('At least one message must have content');
    }
  }
}
