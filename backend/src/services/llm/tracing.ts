/**
 * Langsmith Tracing Utilities
 *
 * Utilities for tracing LLM operations with Langsmith
 */

import { getLangsmithClient, isLangsmithEnabled, getLangsmithConfig } from '../../config/langsmith';
import type { TraceMetadata, Message, ChatResponse, EmbedResponse } from './types';
import { randomUUID } from 'node:crypto';

/**
 * Trace a chat completion operation
 */
export async function traceChat(
  operation: () => Promise<ChatResponse>,
  messages: Message[],
  metadata?: TraceMetadata
): Promise<ChatResponse> {
  if (!isLangsmithEnabled()) {
    return await operation();
  }

  const client = getLangsmithClient();
  if (!client) {
    return await operation();
  }

  const config = getLangsmithConfig();
  const runId = randomUUID();

  try {
    // Start trace
    await client.createRun({
      name: `chat_${metadata?.feature || 'unknown'}`,
      run_type: 'llm',
      project_name: config.project,
      id: runId,
      inputs: {
        messages: sanitizeMessages(messages),
      },
      extra: {
        metadata: sanitizeMetadata(metadata),
      },
      start_time: Date.now(),
    });

    // Execute operation
    const startTime = Date.now();
    const response = await operation();
    const endTime = Date.now();

    // End trace with success
    await client.updateRun(runId, {
      outputs: {
        content: response.content.substring(0, 500), // Truncate for logging
        model: response.model,
      },
      end_time: endTime,
      extra: {
        metadata: {
          ...sanitizeMetadata(metadata),
          usage: response.usage,
          finishReason: response.finishReason,
          latencyMs: endTime - startTime,
        },
      },
    });

    return response;
  } catch (error: any) {
    // End trace with error
    try {
      await client.updateRun(runId, {
        end_time: Date.now(),
        error: error.message || 'Unknown error',
        extra: {
          metadata: sanitizeMetadata(metadata),
          errorStack: error.stack,
        },
      });
    } catch (traceError) {
      console.error('Failed to update trace with error:', traceError);
    }

    throw error;
  }
}

/**
 * Trace a streaming chat operation
 */
export async function traceStream(
  operation: () => AsyncGenerator<string, void, unknown>,
  messages: Message[],
  metadata?: TraceMetadata
): Promise<AsyncGenerator<string, void, unknown>> {
  if (!isLangsmithEnabled()) {
    return operation();
  }

  const client = getLangsmithClient();
  if (!client) {
    return operation();
  }

  const config = getLangsmithConfig();
  const runId = randomUUID();

  // Start trace
  await client.createRun({
    name: `stream_${metadata?.feature || 'unknown'}`,
    run_type: 'llm',
    project_name: config.project,
    id: runId,
    inputs: {
      messages: sanitizeMessages(messages),
    },
    extra: {
      metadata: sanitizeMetadata(metadata),
    },
    start_time: Date.now(),
  });

  // Wrap generator to track completion
  return (async function* () {
    let fullResponse = '';
    const startTime = Date.now();

    try {
      for await (const chunk of operation()) {
        fullResponse += chunk;
        yield chunk;
      }

      // Stream completed successfully
      const endTime = Date.now();
      await client.updateRun(runId, {
        outputs: {
          content: fullResponse.substring(0, 500), // Truncate for logging
        },
        end_time: endTime,
        extra: {
          metadata: {
            ...sanitizeMetadata(metadata),
            latencyMs: endTime - startTime,
            totalChars: fullResponse.length,
          },
        },
      });
    } catch (error: any) {
      // Stream failed
      await client.updateRun(runId, {
        end_time: Date.now(),
        error: error.message || 'Stream error',
        extra: {
          metadata: sanitizeMetadata(metadata),
          errorStack: error.stack,
          partialResponse: fullResponse.substring(0, 500),
        },
      });

      throw error;
    }
  })();
}

/**
 * Trace an embedding operation
 */
export async function traceEmbed(
  operation: () => Promise<EmbedResponse>,
  text: string,
  metadata?: TraceMetadata
): Promise<EmbedResponse> {
  if (!isLangsmithEnabled()) {
    return await operation();
  }

  const client = getLangsmithClient();
  if (!client) {
    return await operation();
  }

  const config = getLangsmithConfig();
  const runId = randomUUID();

  try {
    // Start trace
    await client.createRun({
      name: `embed_${metadata?.feature || 'unknown'}`,
      run_type: 'embedding',
      project_name: config.project,
      id: runId,
      inputs: {
        text: text.substring(0, 500), // Truncate for logging
      },
      extra: {
        metadata: sanitizeMetadata(metadata),
      },
      start_time: Date.now(),
    });

    // Execute operation
    const startTime = Date.now();
    const response = await operation();
    const endTime = Date.now();

    // End trace with success
    await client.updateRun(runId, {
      outputs: {
        dimensions: response.embedding.length,
        model: response.model,
      },
      end_time: endTime,
      extra: {
        metadata: {
          ...sanitizeMetadata(metadata),
          usage: response.usage,
          latencyMs: endTime - startTime,
        },
      },
    });

    return response;
  } catch (error: any) {
    // End trace with error
    try {
      await client.updateRun(runId, {
        end_time: Date.now(),
        error: error.message || 'Unknown error',
        extra: {
          metadata: sanitizeMetadata(metadata),
          errorStack: error.stack,
        },
      });
    } catch (traceError) {
      console.error('Failed to update trace with error:', traceError);
    }

    throw error;
  }
}

/**
 * Trace a generic async operation
 */
export async function trace<T>(
  name: string,
  operation: () => Promise<T>,
  inputs?: any,
  metadata?: TraceMetadata
): Promise<T> {
  // Temporarily disable all tracing for integration testing
  return await operation();
}

/**
 * Sanitize messages for logging (remove sensitive data, truncate)
 */
function sanitizeMessages(messages: Message[]): any[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content.substring(0, 1000), // Truncate long messages
  }));
}

/**
 * Sanitize metadata (remove/hash sensitive fields)
 */
function sanitizeMetadata(metadata?: TraceMetadata): any {
  if (!metadata) return {};

  const { userId, ...rest } = metadata;

  return {
    ...rest,
    // Hash user ID for privacy
    userIdHash: userId ? hashString(userId) : undefined,
  };
}

/**
 * Simple string hash for privacy
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
