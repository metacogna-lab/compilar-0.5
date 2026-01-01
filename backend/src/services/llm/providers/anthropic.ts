/**
 * Anthropic LLM Provider
 *
 * Implementation for Anthropic Claude models
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
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
import { LLMError, LLMRateLimitError, LLMContextLengthError } from '../types';
import { BaseLLMProvider } from './base';

export class AnthropicProvider extends BaseLLMProvider {
  name: LLMProviderName = 'anthropic';
  private client: Anthropic;
  private models: {
    chat: string;
    chatFallback: string;
  };

  constructor(
    apiKey: string,
    models?: {
      chat?: string;
      chatFallback?: string;
    }
  ) {
    super(apiKey);
    this.client = new Anthropic({ apiKey });
    this.models = {
      chat: models?.chat || 'claude-3-5-sonnet-20241022',
      chatFallback: models?.chatFallback || 'claude-3-haiku-20240307',
    };
  }

  /**
   * Get model name for task type
   */
  getModel(task: LLMTaskType): string {
    switch (task) {
      case 'chat':
      case 'stream':
        return this.models.chat;
      case 'embed':
        throw new Error('Anthropic does not provide embedding models - use OpenAI for embeddings');
      default:
        return this.models.chat;
    }
  }

  /**
   * Standard chat completion
   */
  async chat(
    messages: Message[],
    options?: ChatOptions,
    metadata?: TraceMetadata
  ): Promise<ChatResponse> {
    this.ensureAvailable();
    this.validateMessages(messages);

    const { system, messages: anthropicMessages } = this.convertMessages(messages);
    const opts = this.getDefaultChatOptions(options);

    try {
      const completion = await this.client.messages.create({
        model: opts.model,
        messages: anthropicMessages,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
        top_p: opts.topP,
        system: system || undefined,
        stop_sequences: opts.stop ? (Array.isArray(opts.stop) ? opts.stop : [opts.stop]) : undefined,
      });

      const content = completion.content[0];
      if (!content || content.type !== 'text') {
        throw new LLMError('No text response from Anthropic', this.name);
      }

      return {
        content: content.text,
        model: completion.model,
        usage: {
          promptTokens: completion.usage.input_tokens,
          completionTokens: completion.usage.output_tokens,
          totalTokens: completion.usage.input_tokens + completion.usage.output_tokens,
        },
        finishReason: completion.stop_reason || 'end_turn',
      };
    } catch (error: any) {
      this.handleError(error);
      throw error; // TypeScript requires this
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
    this.ensureAvailable();
    this.validateMessages(messages);

    const { system, messages: anthropicMessages } = this.convertMessages(messages);
    const opts = this.getDefaultChatOptions(options);

    try {
      const stream = await this.client.messages.stream({
        model: opts.model,
        messages: anthropicMessages,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
        top_p: opts.topP,
        system: system || undefined,
        stop_sequences: opts.stop ? (Array.isArray(opts.stop) ? opts.stop : [opts.stop]) : undefined,
      });

      let fullResponse = '';

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const text = event.delta.text;
          fullResponse += text;

          // Call onChunk callback if provided
          if (options?.onChunk) {
            options.onChunk(text);
          }

          yield text;
        }
      }

      // Call onComplete callback if provided
      if (options?.onComplete) {
        options.onComplete(fullResponse);
      }
    } catch (error: any) {
      // Call onError callback if provided
      if (options?.onError) {
        options.onError(error);
      }
      this.handleError(error);
    }
  }

  /**
   * Generate embeddings - NOT SUPPORTED by Anthropic
   * This method will throw an error
   */
  async embed(
    text: string,
    options?: EmbedOptions,
    metadata?: TraceMetadata
  ): Promise<EmbedResponse> {
    throw new LLMError(
      'Anthropic does not provide embedding models. Use OpenAI provider for embeddings.',
      this.name
    );
  }

  /**
   * Convert standard messages to Anthropic format
   * Anthropic requires system messages to be separate from conversation
   */
  private convertMessages(messages: Message[]): {
    system: string | null;
    messages: Anthropic.MessageParam[];
  } {
    let system: string | null = null;
    const conversationMessages: Anthropic.MessageParam[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        // Combine all system messages
        system = system ? `${system}\n\n${msg.content}` : msg.content;
      } else {
        conversationMessages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    }

    // Anthropic requires messages to start with user message
    if (conversationMessages.length > 0 && conversationMessages[0].role !== 'user') {
      conversationMessages.unshift({
        role: 'user',
        content: '...',
      });
    }

    return { system, messages: conversationMessages };
  }

  /**
   * Handle Anthropic-specific errors
   */
  private handleError(error: any): never {
    // Anthropic SDK errors have a status property
    if (error.status === 429) {
      const retryAfter = error.headers?.['retry-after'];
      throw new LLMRateLimitError(this.name, retryAfter ? parseInt(retryAfter) : undefined);
    }

    if (error.status === 400 && error.message?.includes('maximum context length')) {
      const match = error.message.match(/maximum context length is (\d+)/);
      const maxTokens = match ? parseInt(match[1]) : 0;
      throw new LLMContextLengthError(this.name, maxTokens);
    }

    if (error.status === 401 || error.status === 403) {
      throw new LLMError('Anthropic API authentication failed - check API key', this.name, error);
    }

    if (error.status >= 500) {
      throw new LLMError('Anthropic API server error', this.name, error);
    }

    // Generic error
    throw new LLMError(
      error.message || 'Unknown Anthropic error',
      this.name,
      error
    );
  }

  /**
   * Estimate tokens for Anthropic models
   */
  protected estimateTokens(text: string): number {
    // Claude tokenizer is roughly 3.5-4 characters per token
    return Math.ceil(text.length / 3.75);
  }
}
