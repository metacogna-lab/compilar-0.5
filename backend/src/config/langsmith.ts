/**
 * Langsmith Configuration
 *
 * Setup for LangSmith tracing and monitoring
 */

import { Client } from 'langsmith';

/**
 * Langsmith client configuration
 */
export interface LangsmithConfig {
  apiKey: string;
  project: string;
  enabled: boolean;
}

/**
 * Get Langsmith configuration from environment
 */
export function getLangsmithConfig(): LangsmithConfig {
  return {
    apiKey: process.env.LANGSMITH_API_KEY || '',
    project: process.env.LANGSMITH_PROJECT || 'compilar-v0.5',
    enabled: Boolean(process.env.LANGSMITH_API_KEY),
  };
}

/**
 * Create Langsmith client
 */
export function createLangsmithClient(config?: LangsmithConfig): Client | null {
  const cfg = config || getLangsmithConfig();

  if (!cfg.enabled || !cfg.apiKey) {
    console.warn('Langsmith tracing is disabled (no API key configured)');
    return null;
  }

  try {
    return new Client({
      apiKey: cfg.apiKey,
    });
  } catch (error) {
    console.error('Failed to create Langsmith client:', error);
    return null;
  }
}

// Singleton instance
let langsmithClient: Client | null | undefined = undefined;

/**
 * Get singleton Langsmith client
 */
export function getLangsmithClient(): Client | null {
  if (langsmithClient === undefined) {
    langsmithClient = createLangsmithClient();
  }
  return langsmithClient;
}

/**
 * Check if Langsmith is enabled
 */
export function isLangsmithEnabled(): boolean {
  return Boolean(getLangsmithClient());
}
