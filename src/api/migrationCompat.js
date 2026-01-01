// Migration compatibility layer
// Allows gradual transition from Base44 to Supabase
// Set USE_SUPABASE=true in environment to switch to Supabase

const USE_SUPABASE = process.env.USE_SUPABASE === 'true';

// Import both implementations
import * as base44Entities from './base44Client';
import * as supabaseEntities from './supabaseEntities';

// Migration status tracking
const MIGRATION_STATUS = {
  entities: {
    PilarAssessment: USE_SUPABASE,
    UserProfile: USE_SUPABASE,
    AssessmentSession: USE_SUPABASE,
    UserProgress: USE_SUPABASE,
    // Add other entities as they are migrated
  },
  functions: {
    // Track which functions have been migrated
    pilarRagQuery: false,
    generateAICoaching: false,
    // Add other functions as they are migrated
  }
};

// Entity migration wrapper
function createEntityWrapper(base44Entity, supabaseEntity, entityName) {
  return new Proxy(base44Entity, {
    get(target, prop) {
      if (MIGRATION_STATUS.entities[entityName]) {
        // Use Supabase implementation
        return supabaseEntity[prop];
      } else {
        // Use Base44 implementation
        return target[prop];
      }
    }
  });
}

// Function migration wrapper
function createFunctionWrapper(base44Function, supabaseFunction, functionName) {
  return function(...args) {
    if (MIGRATION_STATUS.functions[functionName]) {
      return supabaseFunction.apply(this, args);
    } else {
      return base44Function.apply(this, args);
    }
  };
}

// Create wrapped entities
export const PilarAssessment = createEntityWrapper(
  base44Entities.PilarAssessment,
  supabaseEntities.PilarAssessment,
  'PilarAssessment'
);

export const UserProfile = createEntityWrapper(
  base44Entities.UserProfile,
  supabaseEntities.UserProfile,
  'UserProfile'
);

export const AssessmentSession = createEntityWrapper(
  base44Entities.AssessmentSession,
  supabaseEntities.AssessmentSession,
  'AssessmentSession'
);

export const UserProgress = createEntityWrapper(
  base44Entities.UserProgress,
  supabaseEntities.UserProgress,
  'UserProgress'
);

// Add other entities as they are migrated...
export const UserAction = supabaseEntities.UserAction;
export const PilarKnowledge = supabaseEntities.PilarKnowledge;
export const GroupRound = supabaseEntities.GroupRound;
export const ChatMessage = supabaseEntities.ChatMessage;
export const DevelopmentPlan = supabaseEntities.DevelopmentPlan;
export const UserGamification = supabaseEntities.UserGamification;
export const Challenge = supabaseEntities.Challenge;
export const Trophy = supabaseEntities.Trophy;
export const UserAnalytics = supabaseEntities.UserAnalytics;
export const SessionAnalytics = supabaseEntities.SessionAnalytics;
export const GroupAnalytics = supabaseEntities.GroupAnalytics;
export const PilarKnowledgeVector = supabaseEntities.PilarKnowledgeVector;
export const UserProfileInsights = supabaseEntities.UserProfileInsights;
export const LearningPathway = supabaseEntities.LearningPathway;
export const Battalion = supabaseEntities.Battalion;
export const CooperativeOperation = supabaseEntities.CooperativeOperation;
export const Team = supabaseEntities.Team;
export const TeamAnalytics = supabaseEntities.TeamAnalytics;
export const TeamInvitation = supabaseEntities.TeamInvitation;
export const StudyGroup = supabaseEntities.StudyGroup;
export const PeerFeedback = supabaseEntities.PeerFeedback;
export const CmsContent = supabaseEntities.CmsContent;
export const AiInsightQuestions = supabaseEntities.AiInsightQuestions;
export const UserSession = supabaseEntities.UserSession;
export const ForcePromptCard = supabaseEntities.ForcePromptCard;
export const AssessmentGuidance = supabaseEntities.AssessmentGuidance;
export const DataEnrichmentRecommendation = supabaseEntities.DataEnrichmentRecommendation;
export const TimeSeriesData = supabaseEntities.TimeSeriesData;
export const PilarSnapshot = supabaseEntities.PilarSnapshot;
export const Badge = supabaseEntities.Badge;
export const MasteryLevel = supabaseEntities.MasteryLevel;
export const GoalMapping = supabaseEntities.GoalMapping;
export const CoachConversation = supabaseEntities.CoachConversation;

// Auth wrapper
export const auth = USE_SUPABASE ? supabaseEntities.auth : base44Entities.auth;

// Functions wrapper
export const functions = {
  // Wrap each function individually
  pilarRagQuery: createFunctionWrapper(
    base44Entities.functions.pilarRagQuery,
    supabaseEntities.functions.pilarRagQuery,
    'pilarRagQuery'
  ),

  generateAICoaching: createFunctionWrapper(
    base44Entities.functions.generateAICoaching,
    supabaseEntities.functions.generateAICoaching,
    'generateAICoaching'
  ),

  // Add other functions as they are implemented...
  streamPilarInsights: base44Entities.functions.streamPilarInsights,
  coachConversation: base44Entities.functions.coachConversation,
  getAssessmentGuidance: base44Entities.functions.getAssessmentGuidance,
  generateCoachQuestions: base44Entities.functions.generateCoachQuestions,
  contentManagement: base44Entities.functions.contentManagement,
  analyzePilarAlignment: base44Entities.functions.analyzePilarAlignment,
  ingestKnowledge: base44Entities.functions.ingestKnowledge,
  ragQuery: base44Entities.functions.ragQuery,
  vectorSearch: base44Entities.functions.vectorSearch,
  checkContentConsistency: base44Entities.functions.checkContentConsistency,
  suggestBlogPosts: base44Entities.functions.suggestBlogPosts,
  ingestPilarTheory: base44Entities.functions.ingestPilarTheory,
  generateMetadata: base44Entities.functions.generateMetadata,
  analyzeBlogPost: base44Entities.functions.analyzeBlogPost,
  suggestTopics: base44Entities.functions.suggestTopics,
  seedSiteContent: base44Entities.functions.seedSiteContent,
  authenticateCompilarAdmin: base44Entities.functions.authenticateCompilarAdmin,
  ingestPilarKnowledge: base44Entities.functions.ingestPilarKnowledge,
  generateAssessmentQuestions: base44Entities.functions.generateAssessmentQuestions,
  getChatbotContext: base44Entities.functions.getChatbotContext,
  generateContextualGuidance: base44Entities.functions.generateContextualGuidance,
  extractPillarElements: base44Entities.functions.extractPillarElements,
  generateAssessmentEmailSummary: base44Entities.functions.generateAssessmentEmailSummary,
  analyzeEntityUsage: base44Entities.functions.analyzeEntityUsage,
  generateQuestionsByDifficulty: base44Entities.functions.generateQuestionsByDifficulty,
  extractPillarsAndForces: base44Entities.functions.extractPillarsAndForces,
  generateLearningPDF: base44Entities.functions.generateLearningPDF,
  generateMLInsights: base44Entities.functions.generateMLInsights,
  evaluateUserProgress: base44Entities.functions.evaluateUserProgress,
  analyzeGoal: base44Entities.functions.analyzeGoal,
  refineGoal: base44Entities.functions.refineGoal,
  llmCache: base44Entities.functions.llmCache,
  langfuseClient: base44Entities.functions.langfuseClient,
  enhanceGoalPilar: base44Entities.functions.enhanceGoalPilar,
};

// Integrations wrapper
export const integrations = USE_SUPABASE ? supabaseEntities.integrations : base44Entities.integrations;

// Agents wrapper
export const agents = USE_SUPABASE ? supabaseEntities.agents : base44Entities.agents;

// Migration utilities
export const migrationUtils = {
  // Check migration status
  getMigrationStatus() {
    return MIGRATION_STATUS;
  },

  // Enable Supabase for specific entity
  enableSupabaseFor(entityName) {
    if (MIGRATION_STATUS.entities[entityName] !== undefined) {
      MIGRATION_STATUS.entities[entityName] = true;
      console.log(`✅ Enabled Supabase for ${entityName}`);
    }
  },

  // Enable Supabase for specific function
  enableSupabaseForFunction(functionName) {
    if (MIGRATION_STATUS.functions[functionName] !== undefined) {
      MIGRATION_STATUS.functions[functionName] = true;
      console.log(`✅ Enabled Supabase for function ${functionName}`);
    }
  },

  // Check if using Supabase globally
  isUsingSupabase() {
    return USE_SUPABASE;
  },

  // Get current backend
  getCurrentBackend() {
    return USE_SUPABASE ? 'supabase' : 'base44';
  }
};

// Export migration utilities
export { migrationUtils };