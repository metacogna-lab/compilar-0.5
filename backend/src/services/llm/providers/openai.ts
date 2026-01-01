/**
 * OpenAI LLM Provider
 *
 * Implementation for OpenAI GPT models
 */

import OpenAI from 'openai';
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

export class OpenAIProvider extends BaseLLMProvider {
  name: LLMProviderName = 'openai';
  private client: OpenAI;
  private models: {
    chat: string;
    chatFallback: string;
    embed: string;
  };

  constructor(
    apiKey: string,
    models?: {
      chat?: string;
      chatFallback?: string;
      embed?: string;
    }
  ) {
    super(apiKey);
    this.client = new OpenAI({ apiKey });
    this.models = {
      chat: models?.chat || 'gpt-4-turbo-preview',
      chatFallback: models?.chatFallback || 'gpt-3.5-turbo',
      embed: models?.embed || 'text-embedding-3-small',
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
        return this.models.embed;
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

    const normalizedMessages = this.normalizeMessages(messages);
    const opts = this.getDefaultChatOptions(options);

    try {
      const completion = await this.client.chat.completions.create({
        model: opts.model,
        messages: normalizedMessages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
        top_p: opts.topP,
        frequency_penalty: opts.frequencyPenalty,
        presence_penalty: opts.presencePenalty,
        stop: opts.stop,
      });

      const choice = completion.choices[0];
      if (!choice || !choice.message) {
        throw new LLMError('No response from OpenAI', this.name);
      }

      return {
        content: choice.message.content || '',
        model: completion.model,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        finishReason: choice.finish_reason || 'stop',
      };
    } catch (error: any) {
      this.handleError(error);
      throw error; // TypeScript requires this even though handleError always throws
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

    const normalizedMessages = this.normalizeMessages(messages);
    const opts = this.getDefaultChatOptions(options);

    try {
      const stream = await this.client.chat.completions.create({
        model: opts.model,
        messages: normalizedMessages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
        top_p: opts.topP,
        frequency_penalty: opts.frequencyPenalty,
        presence_penalty: opts.presencePenalty,
        stop: opts.stop,
        stream: true,
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          fullResponse += delta;

          // Call onChunk callback if provided
          if (options?.onChunk) {
            options.onChunk(delta);
          }

          yield delta;
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
   * Generate embeddings
   */
  async embed(
    text: string,
    options?: EmbedOptions,
    metadata?: TraceMetadata
  ): Promise<EmbedResponse> {
    this.ensureAvailable();

    if (!text || text.trim().length === 0) {
      throw new Error('Text for embedding cannot be empty');
    }

    const opts = this.getDefaultEmbedOptions(options);

    try {
      const response = await this.client.embeddings.create({
        model: opts.model,
        input: text,
        dimensions: opts.dimensions,
      });

      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        throw new LLMError('No embedding returned from OpenAI', this.name);
      }

      return {
        embedding,
        model: response.model,
        usage: {
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (error: any) {
      this.handleError(error);
      throw error; // TypeScript requires this
    }
  }

  /**
   * Handle OpenAI-specific errors
   */
  private handleError(error: any): never {
    // OpenAI SDK errors have a status property
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
      throw new LLMError('OpenAI API authentication failed - check API key', this.name, error);
    }

    if (error.status >= 500) {
      throw new LLMError('OpenAI API server error', this.name, error);
    }

    // Generic error
    throw new LLMError(
      error.message || 'Unknown OpenAI error',
      this.name,
      error
    );
  }

  /**
   * Estimate tokens for OpenAI models
   * More accurate than base implementation
   */
  protected estimateTokens(text: string): number {
    // OpenAI's tokenizer is roughly 3-4 characters per token
    // This is a rough estimate - for exact count, use tiktoken
    return Math.ceil(text.length / 3.5);
  }
}
