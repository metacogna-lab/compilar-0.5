/**
 * AI Routes
 *
 * API endpoints for AI-powered features aligned with API specification
 * Implements coaching, RAG queries, content analysis, and assessment guidance
 */

import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { supabase } from '../index';
import { requireAuth } from '../middleware/auth';
import { rateLimitAI } from '../middleware/ratelimit';
import { validateBody } from '../middleware/validation';
import { createCoachingService } from '../services/coaching.service';
import { createAssessmentService } from '../services/assessment.service';
import { getLLMService } from '../services/llm/llm.service';
import { traceChat } from '../services/llm/tracing';
import {
  coachConversationRequestSchema,
  ragQueryRequestSchema,
  assessmentGuidanceRequestSchema,
  contentAnalysisRequestSchema,
  createApiResponse
} from '../schemas/api';
import type { Message, TraceMetadata } from '../services/llm/types';

const ai = new Hono();
const coachingService = createCoachingService(supabase);
const assessmentService = createAssessmentService(supabase);
const llmService = getLLMService();

/**
 * POST /api/v1/ai/coach/conversation
 * Start or continue AI coaching conversation (streaming)
 */
ai.post('/coach/conversation',
  requireAuth,
  rateLimitAI,
  validateBody(coachConversationRequestSchema),
  async (c) => {
    const user = c.get('user');
    const { message, context, conversation_id } = c.get('validatedBody');

    return stream(c, async (streamWriter) => {
      try {
        const coachingContext = {
          userId: user.id,
          assessmentId: context?.assessment_id,
          pillar: context?.pillar_id,
          mode: context?.mode,
          conversationId: conversation_id,
          history: []
        };

        const generator = coachingService.getChatbotResponse(message, coachingContext);

        for await (const chunk of generator) {
          await streamWriter.write(chunk);
        }
      } catch (error: any) {
        await streamWriter.write(`\n\nError: ${error.message}`);
      }
    });
  }
);

/**
 * POST /api/v1/ai/rag/query
 * Query PILAR knowledge base
 */
ai.post('/rag/query',
  requireAuth,
  rateLimitAI,
  validateBody(ragQueryRequestSchema),
  async (c) => {
    const user = c.get('user');
    const { query, pillar_id, mode, context } = c.get('validatedBody');

    try {
      // For now, use the LLM service directly for RAG queries
      // TODO: Implement proper RAG service with vector search
      const systemPrompt = `You are a PILAR Framework expert. Answer the user's question about the PILAR framework.

${pillar_id && mode ? `Focus on the ${pillar_id} pillar in ${mode} mode.` : 'Provide general PILAR framework guidance.'}

If this is assessment-related, provide actionable insights.
If this is theoretical, explain concepts clearly.
Always tie answers back to PILAR theory.`;

      const messages: Message[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ];

      const metadata: TraceMetadata = {
        userId: user.id,
        pillar: pillar_id,
        mode,
        feature: 'rag_query'
      };

      const response = await traceChat(
        () => llmService.chat(messages, { temperature: 0.3, maxTokens: 1024 }, metadata),
        messages,
        metadata
      );

      // Parse response for structured output
      const responseData = {
        response: response.content,
        sources: [], // TODO: Implement actual source tracking
        related_pillars: pillar_id ? [pillar_id] : []
      };

      return c.json(createApiResponse(responseData));
    } catch (error: any) {
      return c.json(createApiResponse(null, {
        code: 'AI_SERVICE_ERROR',
        message: error.message
      }), 500);
    }
  }
);

/**
 * POST /api/v1/ai/assessment/guidance
 * Generate assessment guidance
 */
ai.post('/assessment/guidance',
  requireAuth,
  rateLimitAI,
  validateBody(assessmentGuidanceRequestSchema),
  async (c) => {
    const user = c.get('user');
    const { assessment_id, user_profile, conversation_history } = c.get('validatedBody');

    try {
      // Get assessment data from database
      const { data: assessment, error } = await supabase
        .from('pilar_assessments')
        .select('*')
        .eq('id', assessment_id)
        .eq('user_id', user.id)
        .single();

      if (error || !assessment) {
        return c.json(createApiResponse(null, {
          code: 'NOT_FOUND',
          message: 'Assessment not found'
        }), 404);
      }

      const guidance = await coachingService.getGuidance(
        user.id,
        assessment.pillar_id,
        assessment.mode
      );

      const responseData = {
        guidance,
        assessment_data: assessment,
        conversation_context: conversation_history || []
      };

      return c.json(createApiResponse(responseData));
    } catch (error: any) {
      return c.json(createApiResponse(null, {
        code: 'AI_SERVICE_ERROR',
        message: error.message
      }), 500);
    }
  }
);

/**
 * POST /api/v1/ai/content/analyze
 * Analyze content for PILAR alignment
 */
ai.post('/content/analyze',
  requireAuth,
  rateLimitAI,
  validateBody(contentAnalysisRequestSchema),
  async (c) => {
    const user = c.get('user');
    const { content, content_type } = c.get('validatedBody');

    try {
      const systemPrompt = `You are a PILAR Framework expert analyzing content for alignment.

Analyze this content for PILAR framework alignment. Provide a comprehensive analysis including:
1. **Alignment Score** (0-1): How well the content aligns with PILAR theory
2. **Pillar Coverage**: Which pillars are addressed and their alignment scores
3. **Key Themes**: Main PILAR-related themes identified
4. **Recommendations**: How to improve PILAR alignment

Format your response as JSON:
{
  "pilar_alignment": {
    "divsexp": {"score": 0.85, "confidence": 0.92},
    "indrecip": {"score": 0.72, "confidence": 0.88}
  },
  "key_themes": ["psychological_safety", "open_communication"],
  "recommendations": ["suggestion1", "suggestion2"]
}`;

      const messages: Message[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Content Type: ${content_type || 'general'}\n\n${content}` }
      ];

      const metadata: TraceMetadata = {
        userId: user.id,
        feature: 'content_analysis'
      };

      const response = await traceChat(
        () => llmService.chat(messages, { temperature: 0.3, maxTokens: 1024 }, metadata),
        messages,
        metadata
      );

      // Parse JSON response
      let analysis;
      try {
        const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/) ||
                          response.content.match(/\{[\s\S]*?\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response.content;
        analysis = JSON.parse(jsonStr);
      } catch (error) {
        return c.json(createApiResponse(null, {
          code: 'PARSE_ERROR',
          message: 'Failed to parse analysis response'
        }), 500);
      }

      return c.json(createApiResponse(analysis));
    } catch (error: any) {
      return c.json(createApiResponse(null, {
        code: 'AI_SERVICE_ERROR',
        message: error.message
      }), 500);
    }
  }
);

export { ai };
