/**
 * AI Routes
 *
 * API endpoints for AI-powered features (coaching, chat, guidance, quiz generation)
 */

import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { supabase } from '../index';
import { requireAuth } from '../middleware/auth';
import { rateLimitAI } from '../middleware/ratelimit';
import { createCoachingService } from '../services/coaching.service';
import { createAssessmentService } from '../services/assessment.service';
import { getLLMService } from '../services/llm/llm.service';
import { traceChat } from '../services/llm/tracing';
import type { Message, TraceMetadata } from '../services/llm/types';

const ai = new Hono();
const coachingService = createCoachingService(supabase);
const assessmentService = createAssessmentService(supabase);
const llmService = getLLMService();

/**
 * POST /api/v1/ai/coaching
 * Generate personalized coaching feedback (streaming)
 */
ai.post('/coaching', requireAuth, rateLimitAI, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { assessmentId, pillar, mode, scores, responses } = body;

  if (!assessmentId || !pillar || !mode) {
    return c.json({ error: 'assessmentId, pillar, and mode are required' }, 400);
  }

  return stream(c, async (streamWriter) => {
    try {
      const generator = coachingService.generateCoaching({
        userId: user.id,
        assessmentId,
        pillar,
        mode,
        scores,
        responses
      });

      for await (const chunk of generator) {
        await streamWriter.write(chunk);
      }
    } catch (error: any) {
      await streamWriter.write(`\n\nError: ${error.message}`);
    }
  });
});

/**
 * POST /api/v1/ai/chat
 * Chatbot conversation (streaming)
 */
ai.post('/chat', requireAuth, rateLimitAI, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { message, assessmentId, pillar, mode, history } = body;

  if (!message) {
    return c.json({ error: 'message is required' }, 400);
  }

  return stream(c, async (streamWriter) => {
    try {
      const context = {
        userId: user.id,
        assessmentId,
        pillar,
        mode,
        history: history || []
      };

      const generator = coachingService.getChatbotResponse(message, context);

      for await (const chunk of generator) {
        await streamWriter.write(chunk);
      }
    } catch (error: any) {
      await streamWriter.write(`\n\nError: ${error.message}`);
    }
  });
});

/**
 * POST /api/v1/ai/guidance
 * Get contextual guidance (non-streaming)
 */
ai.post('/guidance', requireAuth, rateLimitAI, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { pillar, mode } = body;

  try {
    const guidance = await coachingService.getGuidance(user.id, pillar, mode);

    return c.json({ guidance });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /api/v1/ai/quiz-questions
 * Generate quiz questions for assessment
 */
ai.post('/quiz-questions', requireAuth, rateLimitAI, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { pillar, mode, count = 10 } = body;

  if (!pillar || !mode) {
    return c.json({ error: 'pillar and mode are required' }, 400);
  }

  try {
    const questions = await assessmentService.generateQuizQuestions(pillar, mode, count);

    return c.json({ questions });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /api/v1/ai/analyze-content
 * Content alignment analysis for CMS
 */
ai.post('/analyze-content', requireAuth, rateLimitAI, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { content, pillar, mode } = body;

  if (!content) {
    return c.json({ error: 'content is required' }, 400);
  }

  try {
    const systemPrompt = `You are a PILAR Framework expert analyzing content for alignment.

${pillar && mode ? `Analyze this content for alignment with the **${pillar}** pillar in **${mode}** mode.` : 'Analyze this content for general PILAR framework alignment.'}

Provide:
1. **Alignment Score** (0-10): How well the content aligns with PILAR theory
2. **Pillar Coverage**: Which pillars are addressed
3. **Strengths**: What the content does well
4. **Improvements**: How to better align with PILAR theory

Format your response as JSON:
{
  "alignment_score": <number>,
  "pillar_coverage": ["pillar1", "pillar2"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: content }
    ];

    const metadata: TraceMetadata = {
      userId: user.id,
      pillar,
      mode,
      feature: 'content_analysis'
    };

    const response = await traceChat(
      () => llmService.chat(messages, { temperature: 0.5, maxTokens: 1024 }, metadata),
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
      return c.json({ error: 'Failed to parse analysis response' }, 500);
    }

    return c.json({ analysis });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export { ai };
