// Migration compatibility layer
// Allows gradual transition from Base44 to REST API
// Set USE_REST_API=true in environment to switch to REST API

const USE_REST_API = process.env.USE_REST_API === 'true';

// Import all implementations
import * as base44Entities from './base44Client';
import * as supabaseEntities from './supabaseEntities';
import * as restEntities from './restEntities';

// Migration status tracking
const MIGRATION_STATUS = {
  entities: {
    PilarAssessment: USE_REST_API ? 'rest' : 'base44',
    UserProfile: USE_REST_API ? 'rest' : 'base44',
    AssessmentSession: USE_REST_API ? 'rest' : 'base44',
    UserProgress: USE_REST_API ? 'rest' : 'base44',
    // Add other entities as they are migrated
  },
  functions: {
    // Track which functions have been migrated to REST API
    pilarRagQuery: USE_REST_API,
    generateAICoaching: USE_REST_API,
    coachConversation: USE_REST_API,
    assessmentGuidance: USE_REST_API,
    contentAnalysis: USE_REST_API,
    // Add other functions as they are migrated
  }
};

// Entity migration wrapper
function createEntityWrapper(base44Entity, supabaseEntity, restEntity, entityName) {
  return new Proxy(base44Entity, {
    get(target, prop) {
      const status = MIGRATION_STATUS.entities[entityName];
      if (status === 'rest') {
        // Use REST API implementation
        return restEntity[prop];
      } else if (status === 'supabase') {
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
function createFunctionWrapper(base44Function, supabaseFunction, restFunction, functionName) {
  return function(...args) {
    const status = MIGRATION_STATUS.functions[functionName];
    if (status === 'rest') {
      return restFunction.apply(this, args);
    } else if (status === 'supabase') {
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
  restEntities.PilarAssessment,
  'PilarAssessment'
);

export const UserProfile = createEntityWrapper(
  base44Entities.UserProfile,
  supabaseEntities.UserProfile,
  restEntities.UserProfile,
  'UserProfile'
);

export const AssessmentSession = createEntityWrapper(
  base44Entities.AssessmentSession,
  supabaseEntities.AssessmentSession,
  restEntities.AssessmentSession,
  'AssessmentSession'
);

export const UserProgress = createEntityWrapper(
  base44Entities.UserProgress,
  supabaseEntities.UserProgress,
  restEntities.UserProgress,
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

// Auth wrapper with REST API support
export const auth = USE_REST_API ? restEntities.auth : (USE_SUPABASE ? supabaseEntities.auth : base44Entities.auth);

// Integrations wrapper
export const integrations = USE_REST_API ? restEntities.integrations : (USE_SUPABASE ? supabaseEntities.integrations : base44Entities.integrations);

// Agents wrapper
export const agents = USE_REST_API ? restEntities.agents : (USE_SUPABASE ? supabaseEntities.agents : base44Entities.agents);

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

  // Check if using REST API globally
  isUsingRestApi() {
    return USE_REST_API;
  },

  // Check if using Supabase globally
  isUsingSupabase() {
    return USE_SUPABASE && !USE_REST_API;
  },

  // Get current backend
  getCurrentBackend() {
    if (USE_REST_API) return 'rest';
    if (USE_SUPABASE) return 'supabase';
    return 'base44';
  }
};

// Export migration utilities
export { migrationUtils };