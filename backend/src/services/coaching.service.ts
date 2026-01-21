/**
 * Coaching Service
 *
 * AI-powered coaching and chatbot service for PILAR assessments
 * Generates personalized insights and conversational guidance
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { getLLMService } from './llm/llm.service';
import { createRAGService, type RAGService } from './rag.service';
import { traceChat, traceStream, trace } from './llm/tracing';
import type { Message, TraceMetadata } from './llm/types';

export interface CoachingRequest {
  userId: string;
  assessmentId: string;
  pillar: string;
  mode: 'egalitarian' | 'hierarchical';
  scores?: Record<string, number>;
  responses?: Array<{
    question: string;
    answer: any;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ConversationContext {
  userId: string;
  assessmentId?: string;
  pillar?: string;
  mode?: 'egalitarian' | 'hierarchical';
  history: ChatMessage[];
}

export class CoachingService {
  private supabase: SupabaseClient;
  private llmService: ReturnType<typeof getLLMService>;
  private ragService: RAGService;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.llmService = getLLMService();
    this.ragService = createRAGService(supabase);
  }

  /**
   * Generate personalized coaching feedback for an assessment
   *
   * @param request - Coaching request with assessment data
   * @returns Async generator yielding coaching text chunks
   */
  async *generateCoaching(request: CoachingRequest): AsyncGenerator<string, void, unknown> {
    const metadata: TraceMetadata = {
      userId: request.userId,
      sessionId: request.assessmentId,
      feature: 'assessment_coaching',
      pillar: request.pillar,
      mode: request.mode,
    };

    // Get contextual knowledge about the pillar
    const context = await this.ragService.getContextualKnowledge(
      request.pillar,
      request.mode
    );

    // Build system prompt with PILAR theory context
    const systemPrompt = this.buildCoachingSystemPrompt(request, context);

    // Build user prompt with assessment results
    const userPrompt = this.buildCoachingUserPrompt(request);

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // Stream coaching response
    const stream = await traceStream(
      () => this.llmService.stream(messages, { temperature: 0.7, maxTokens: 2048 }, metadata),
      messages,
      metadata
    );

    yield* stream;

    // Save coaching to database
    await this.saveCoaching(request.userId, request.assessmentId, messages);
  }

  /**
   * Get chatbot response for conversational coaching
   *
   * @param message - User's message
   * @param context - Conversation context
   * @returns Async generator yielding response chunks
   */
  async *getChatbotResponse(
    message: string,
    context: ConversationContext
  ): AsyncGenerator<string, void, unknown> {
    const metadata: TraceMetadata = {
      userId: context.userId,
      sessionId: context.assessmentId,
      feature: 'chatbot',
      pillar: context.pillar,
      mode: context.mode,
    };

    // Get relevant knowledge if pillar/mode specified
    let ragContext = '';
    if (context.pillar && context.mode) {
      const searchResults = await this.ragService.semanticSearch(
        message,
        { pillar: context.pillar, mode: context.mode, limit: 3 },
        metadata
      );

      if (searchResults.length > 0) {
        ragContext = '\n\nRelevant PILAR Knowledge:\n' +
          searchResults.map((r, i) => `${i + 1}. ${r.content}`).join('\n');
      }
    }

    // Build conversation messages
    const systemPrompt = this.buildChatbotSystemPrompt(context, ragContext);

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...context.history.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Stream chatbot response
    const stream = await traceStream(
      () => this.llmService.stream(messages, { temperature: 0.8, maxTokens: 1024 }, metadata),
      messages,
      metadata
    );

    let fullResponse = '';
    for await (const chunk of stream) {
      fullResponse += chunk;
      yield chunk;
    }

    // Save conversation to database
    await this.saveConversation(context.userId, message, fullResponse, context.assessmentId);
  }

  /**
   * Generate contextual guidance based on user's current state
   */
  async getGuidance(
    userId: string,
    pillar?: string,
    mode?: 'egalitarian' | 'hierarchical'
  ): Promise<string> {
    const metadata: TraceMetadata = {
      userId,
      feature: 'chatbot',
      pillar,
      mode,
    };

    // Get user's assessment history
    const history = await this.getUserAssessmentHistory(userId);

    // Build guidance prompt
    const systemPrompt = `You are a PILAR Framework expert providing guidance on group dynamics.
The PILAR framework analyzes coordination across Egalitarian and Hierarchical modes.

Provide brief, actionable guidance based on the user's context.`;

    const userPrompt = pillar && mode
      ? `Provide guidance for understanding the ${pillar} pillar in ${mode} mode.`
      : `Provide general guidance on using the PILAR assessment framework.`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await traceChat(
      () => this.llmService.chat(messages, { temperature: 0.7, maxTokens: 512 }, metadata),
      messages,
      metadata
    );

    return response.content;
  }

  /**
   * Build system prompt for coaching
   */
  private buildCoachingSystemPrompt(request: CoachingRequest, context: any): string {
    return `You are an expert coach specializing in the PILAR Framework for group dynamics assessment.

The user has just completed an assessment for the **${request.pillar}** pillar in **${request.mode}** mode.

## PILAR Framework Context

The PILAR framework explores coordination across two modes:
- **Egalitarian Mode**: Peer-based coordination (trust, reciprocity, informal influence)
- **Hierarchical Mode**: Authority-based coordination (status, command, formal structure)

Each mode has 5 pillars, and each pillar is driven by 4 psychological forces.

## Assessment Context

Pillar: ${request.pillar}
Mode: ${request.mode}
Forces: ${context.forces?.map((f: any) => f.name).join(', ')}

## Related Connections

${context.connections?.map((c: any) => `- ${c.name}: ${c.from_pillar} → ${c.to_pillar}`).join('\n')}

## Your Role

Provide personalized, actionable coaching based on the user's assessment results.
Focus on:
1. Interpreting their scores in the context of the forces
2. Highlighting patterns and insights
3. Suggesting practical improvements
4. Explaining how this pillar connects to others

Be warm, supportive, and concrete. Use specific examples where possible.`;
  }

  /**
   * Build user prompt for coaching
   */
  private buildCoachingUserPrompt(request: CoachingRequest): string {
    let prompt = `Generate coaching feedback for my assessment results.\n\n`;

    if (request.scores) {
      prompt += `## Scores\n`;
      for (const [force, score] of Object.entries(request.scores)) {
        prompt += `- ${force}: ${score}/10\n`;
      }
      prompt += '\n';
    }

    if (request.responses && request.responses.length > 0) {
      prompt += `## Selected Responses\n`;
      request.responses.slice(0, 3).forEach((resp, i) => {
        prompt += `${i + 1}. Q: ${resp.question}\n   A: ${JSON.stringify(resp.answer)}\n`;
      });
    }

    prompt += `\nProvide comprehensive coaching on my results.`;
    return prompt;
  }

  /**
   * Build system prompt for chatbot
   */
  private buildChatbotSystemPrompt(context: ConversationContext, ragContext: string): string {
    return `You are a helpful AI coach specializing in the PILAR Framework.

You're having a conversation with a user about group dynamics and coordination.

${context.pillar && context.mode ? `
Current Context:
- Pillar: ${context.pillar}
- Mode: ${context.mode}
` : ''}

${ragContext}

Respond naturally and conversationally. Provide insights, ask clarifying questions, and help the user understand PILAR concepts.`;
  }

  /**
   * Save coaching to database
   */
  private async saveCoaching(
    userId: string,
    assessmentId: string,
    messages: Message[]
  ): Promise<void> {
    try {
      await this.supabase
        .from('coach_conversations')
        .insert({
          user_id: userId,
          assessment_id: assessmentId,
          conversation_type: 'coaching',
          messages: messages,
        });
    } catch (error) {
      console.error('Failed to save coaching:', error);
    }
  }

  /**
   * Save conversation to database
   */
  private async saveConversation(
    userId: string,
    userMessage: string,
    assistantResponse: string,
    assessmentId?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('coach_conversations')
        .insert({
          user_id: userId,
          assessment_id: assessmentId,
          conversation_type: 'chat',
          messages: [
            { role: 'user', content: userMessage },
            { role: 'assistant', content: assistantResponse },
          ],
        });
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  /**
   * Get user's assessment history
   */
  private async getUserAssessmentHistory(userId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('pilar_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    return data || [];
  }
}

/**
 * Create coaching service instance
 */
export function createCoachingService(supabase: SupabaseClient): CoachingService {
  return new CoachingService(supabase);
}
