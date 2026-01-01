/**
 * Assessment Service
 *
 * Business logic for PILAR assessments including quiz generation,
 * answer submission, results calculation, and coaching integration
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { getLLMService } from './llm/llm.service';
import { createRAGService, type RAGService } from './rag.service';
import { createCoachingService, type CoachingService } from './coaching.service';
import { traceChat, trace } from './llm/tracing';
import type { Message, TraceMetadata } from './llm/types';

export interface Assessment {
  id: string;
  user_id: string;
  pillar_id: string;
  mode: string;
  scores: Record<string, number>;
  forces_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AssessmentSession {
  id: string;
  user_id: string;
  pillar_id: string | null;
  mode: string | null;
  stage: string;
  responses: Record<string, any>;
  results: any;
  session_quality_score: number | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  question_type: 'likert' | 'choice' | 'scenario';
  options?: string[];
  force_id?: string;
  pillar_id: string;
  mode: string;
}

export interface AssessmentResults {
  pillar_score: number;
  force_scores: Record<string, number>;
  insights: string[];
  recommendations: string[];
}

export class AssessmentService {
  private supabase: SupabaseClient;
  private llmService: ReturnType<typeof getLLMService>;
  private ragService: RAGService;
  private coachingService: CoachingService;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.llmService = getLLMService();
    this.ragService = createRAGService(supabase);
    this.coachingService = createCoachingService(supabase);
  }

  /**
   * Create a new assessment
   */
  async createAssessment(
    userId: string,
    pillarId: string,
    mode: string
  ): Promise<Assessment> {
    return await trace(
      'create_assessment',
      async () => {
        const { data, error } = await this.supabase
          .from('pilar_assessments')
          .insert({
            user_id: userId,
            pillar_id: pillarId,
            mode,
            scores: {},
            forces_data: {}
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create assessment: ${error.message}`);
        }

        return data;
      },
      { userId, pillarId, mode },
      { userId, pillar: pillarId, mode, feature: 'assessment_creation' }
    );
  }

  /**
   * Generate AI-powered quiz questions based on pillar forces
   */
  async generateQuizQuestions(
    pillar: string,
    mode: string,
    count: number = 10
  ): Promise<QuizQuestion[]> {
    return await trace(
      'generate_quiz_questions',
      async () => {
        // Get forces for the pillar
        const forces = await this.ragService.getForces(pillar, mode);

        if (forces.length === 0) {
          throw new Error(`No forces found for pillar ${pillar} in ${mode} mode`);
        }

        // Build system prompt for question generation
        const systemPrompt = `You are an expert in creating PILAR Framework assessment questions.

Generate ${count} assessment questions for the **${pillar}** pillar in **${mode}** mode.

The pillar has ${forces.length} forces:
${forces.map(f => `- ${f.name}: ${f.description}`).join('\n')}

Requirements:
1. Questions should be scenario-based and realistic
2. Use 5-point Likert scale format (Strongly Disagree to Strongly Agree)
3. Each question should assess one specific force
4. Questions should be clear, concise, and relevant to workplace dynamics
5. Avoid jargon and keep language accessible

Return ONLY a JSON array of questions in this format:
[
  {
    "question": "Your question text here",
    "force_id": "force_name_here",
    "question_type": "likert"
  }
]`;

        const metadata: TraceMetadata = {
          pillar,
          mode,
          feature: 'quiz_generation'
        };

        const messages: Message[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate ${count} diverse questions covering all ${forces.length} forces.` }
        ];

        const response = await traceChat(
          () => this.llmService.chat(messages, { temperature: 0.8, maxTokens: 2048 }, metadata),
          messages,
          metadata
        );

        // Parse JSON response
        let questionsData: any[];
        try {
          // Extract JSON from response (handle markdown code blocks)
          const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/) ||
                           response.content.match(/\[([\s\S]*?)\]/);
          const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response.content;
          questionsData = JSON.parse(jsonStr);
        } catch (error) {
          console.error('Failed to parse LLM response as JSON:', response.content);
          throw new Error('Failed to generate quiz questions');
        }

        // Transform to QuizQuestion format
        const questions: QuizQuestion[] = questionsData.map((q, index) => ({
          id: `${pillar}_${mode}_${index}`,
          question: q.question,
          question_type: 'likert' as const,
          force_id: q.force_id,
          pillar_id: pillar,
          mode
        }));

        return questions;
      },
      { pillar, mode, count },
      { pillar, mode, feature: 'quiz_generation' }
    );
  }

  /**
   * Submit an answer to a quiz question
   */
  async submitAnswer(
    assessmentId: string,
    questionId: string,
    answer: any
  ): Promise<void> {
    await trace(
      'submit_answer',
      async () => {
        // Get current assessment
        const { data: assessment, error: fetchError } = await this.supabase
          .from('assessment_sessions')
          .select('*')
          .eq('id', assessmentId)
          .single();

        if (fetchError || !assessment) {
          throw new Error('Assessment not found');
        }

        // Update responses
        const updatedResponses = {
          ...assessment.responses,
          [questionId]: {
            answer,
            timestamp: new Date().toISOString()
          }
        };

        const { error: updateError } = await this.supabase
          .from('assessment_sessions')
          .update({ responses: updatedResponses })
          .eq('id', assessmentId);

        if (updateError) {
          throw new Error(`Failed to submit answer: ${updateError.message}`);
        }
      },
      { assessmentId, questionId },
      { sessionId: assessmentId, feature: 'answer_submission' }
    );
  }

  /**
   * Calculate assessment results from responses
   */
  async calculateResults(
    assessmentId: string
  ): Promise<AssessmentResults> {
    return await trace(
      'calculate_results',
      async () => {
        // Get assessment session
        const { data: session, error } = await this.supabase
          .from('assessment_sessions')
          .select('*')
          .eq('id', assessmentId)
          .single();

        if (error || !session) {
          throw new Error('Assessment not found');
        }

        // Calculate force scores from responses
        const responses = session.responses || {};
        const forceScores: Record<string, number> = {};
        let totalScore = 0;
        let questionCount = 0;

        for (const [questionId, response] of Object.entries(responses)) {
          const answer = (response as any).answer;
          if (typeof answer === 'number') {
            totalScore += answer;
            questionCount++;

            // Aggregate by force (simplified - should map to actual forces)
            const forceId = questionId.split('_')[0];
            forceScores[forceId] = (forceScores[forceId] || 0) + answer;
          }
        }

        const pillarScore = questionCount > 0 ? totalScore / questionCount : 0;

        // Normalize force scores
        for (const force in forceScores) {
          forceScores[force] = forceScores[force] / questionCount;
        }

        // Generate insights (simplified - should use LLM)
        const insights: string[] = [];
        const recommendations: string[] = [];

        if (pillarScore > 7) {
          insights.push('Strong overall performance in this pillar');
        } else if (pillarScore < 4) {
          insights.push('Opportunity for growth in this pillar');
        }

        return {
          pillar_score: pillarScore,
          force_scores: forceScores,
          insights,
          recommendations
        };
      },
      { assessmentId },
      { sessionId: assessmentId, feature: 'results_calculation' }
    );
  }

  /**
   * Complete assessment and trigger coaching
   */
  async completeAssessment(
    assessmentId: string
  ): Promise<{ assessment: AssessmentSession; coachingUrl: string }> {
    return await trace(
      'complete_assessment',
      async () => {
        // Calculate results
        const results = await this.calculateResults(assessmentId);

        // Update assessment session
        const { data: session, error } = await this.supabase
          .from('assessment_sessions')
          .update({
            results,
            completed_at: new Date().toISOString(),
            session_quality_score: results.pillar_score
          })
          .eq('id', assessmentId)
          .select()
          .single();

        if (error || !session) {
          throw new Error('Failed to complete assessment');
        }

        // Coaching URL (placeholder - should integrate with coaching service)
        const coachingUrl = `/api/v1/ai/coaching?assessmentId=${assessmentId}`;

        return {
          assessment: session,
          coachingUrl
        };
      },
      { assessmentId },
      { sessionId: assessmentId, feature: 'assessment_completion' }
    );
  }
}

/**
 * Create assessment service instance
 */
export function createAssessmentService(supabase: SupabaseClient): AssessmentService {
  return new AssessmentService(supabase);
}
