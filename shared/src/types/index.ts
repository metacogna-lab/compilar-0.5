/**
 * TypeScript types derived from Zod schemas
 *
 * These types are automatically inferred from the Zod schemas,
 * ensuring perfect alignment between validation and types.
 */
import { z } from 'zod';
import * as schemas from '../schemas';

// ============================================================================
// Common Types
// ============================================================================

export type UUID = z.infer<typeof schemas.uuidSchema>;
export type Email = z.infer<typeof schemas.emailSchema>;
export type PillarId = z.infer<typeof schemas.pillarIdSchema>;
export type AssessmentMode = z.infer<typeof schemas.assessmentModeSchema>;
export type Timestamp = z.infer<typeof schemas.timestampSchema>;
export type PaginationQuery = z.infer<typeof schemas.paginationQuerySchema>;

// ============================================================================
// Assessment Types
// ============================================================================

export type CreateAssessmentRequest = z.infer<typeof schemas.createAssessmentRequestSchema>;
export type AssessmentResponse = z.infer<typeof schemas.assessmentResponseSchema>;
export type SubmitAnswerRequest = z.infer<typeof schemas.submitAnswerRequestSchema>;
export type AnswerData = z.infer<typeof schemas.answerDataSchema>;
export type CompleteAssessmentRequest = z.infer<typeof schemas.completeAssessmentRequestSchema>;
export type AssessmentResults = z.infer<typeof schemas.assessmentResultsSchema>;
export type AssessmentSessionResponse = z.infer<typeof schemas.assessmentSessionResponseSchema>;
export type ListAssessmentsQuery = z.infer<typeof schemas.listAssessmentsQuerySchema>;

// ============================================================================
// AI Types
// ============================================================================

export type MessageRole = z.infer<typeof schemas.messagRoleSchema>;
export type Message = z.infer<typeof schemas.messageSchema>;
export type CoachConversationRequest = z.infer<typeof schemas.coachConversationRequestSchema>;
export type RAGQueryRequest = z.infer<typeof schemas.ragQueryRequestSchema>;
export type RAGSearchResult = z.infer<typeof schemas.ragSearchResultSchema>;
export type GenerateQuizQuestionsRequest = z.infer<typeof schemas.generateQuizQuestionsRequestSchema>;
export type QuizQuestion = z.infer<typeof schemas.quizQuestionSchema>;
export type AnalyzeContentRequest = z.infer<typeof schemas.analyzeContentRequestSchema>;
export type ContentAnalysisResult = z.infer<typeof schemas.contentAnalysisResultSchema>;
export type CoachingGuidanceRequest = z.infer<typeof schemas.coachingGuidanceRequestSchema>;

// ============================================================================
// User Types
// ============================================================================

export type UserRole = z.infer<typeof schemas.userRoleSchema>;
export type CreateUserProfileRequest = z.infer<typeof schemas.createUserProfileRequestSchema>;
export type UpdateUserProfileRequest = z.infer<typeof schemas.updateUserProfileRequestSchema>;
export type UserProfileResponse = z.infer<typeof schemas.userProfileResponseSchema>;
export type UpdateUserProgressRequest = z.infer<typeof schemas.updateUserProgressRequestSchema>;
export type UserProgressResponse = z.infer<typeof schemas.userProgressResponseSchema>;

// ============================================================================
// Team Types
// ============================================================================

export type TeamMemberRole = z.infer<typeof schemas.teamMemberRoleSchema>;
export type CreateTeamRequest = z.infer<typeof schemas.createTeamRequestSchema>;
export type UpdateTeamRequest = z.infer<typeof schemas.updateTeamRequestSchema>;
export type TeamResponse = z.infer<typeof schemas.teamResponseSchema>;
export type AddTeamMemberRequest = z.infer<typeof schemas.addTeamMemberRequestSchema>;
export type UpdateTeamMemberRequest = z.infer<typeof schemas.updateTeamMemberRequestSchema>;
export type TeamMemberResponse = z.infer<typeof schemas.teamMemberResponseSchema>;

// ============================================================================
// RAG Types
// ============================================================================

export type Force = z.infer<typeof schemas.forceSchema>;
export type GetForcesQuery = z.infer<typeof schemas.getForcesQuerySchema>;
export type ForceConnection = z.infer<typeof schemas.forceConnectionSchema>;
export type GetConnectionsQuery = z.infer<typeof schemas.getConnectionsQuerySchema>;
export type IngestKnowledgeRequest = z.infer<typeof schemas.ingestKnowledgeRequestSchema>;
export type KnowledgeIngestionResult = z.infer<typeof schemas.knowledgeIngestionResultSchema>;

// ============================================================================
// API Response Types
// ============================================================================

export type APIError = z.infer<typeof schemas.apiErrorSchema>;

// Generic API response wrapper
export interface APIResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
  metadata?: {
    timestamp: string;
    requestId?: string;
  };
}
