/**
 * Migration Compatibility Layer
 *
 * Enables gradual migration from Base44 SDK to REST API by providing
 * a unified interface that can switch between implementations.
 */

import { restClient } from './restClient';
import { ApiError } from './restClient';

// Migration status configuration
const MIGRATION_STATUS = {
  entities: {
    PilarAssessment: 'rest',    // 'base44' | 'supabase' | 'rest'
    UserProfile: 'rest',
    Team: 'rest',               // ✅ Migrated to REST API
    AssessmentSession: 'rest',
    UserProgress: 'rest',
    StudyGroup: 'rest',          // ✅ Migrated to REST API
    PeerFeedback: 'rest',        // ✅ Migrated to REST API
    Challenge: 'rest',          // ✅ Migrated to REST API
    Trophy: 'rest',             // ✅ Migrated to REST API
    Badge: 'rest',              // ✅ Migrated to REST API
    MasteryLevel: 'rest',       // ✅ Migrated to REST API
    Analytics: 'rest',          // ✅ Migrated to REST API
    Content: 'rest',
    LearningPathway: 'rest',    // ✅ Migrated to REST API
    ChatMessage: 'rest',         // ✅ Migrated to REST API
    DevelopmentPlan: 'rest',     // ✅ Migrated to REST API
    DataEnrichment: 'rest',      // ✅ Migrated to REST API
    TimeSeriesData: 'rest',      // ✅ Migrated to REST API
    GoalMapping: 'rest',         // ✅ Migrated to REST API
    ForcePromptCard: 'rest',     // ✅ Migrated to REST API
    UserSession: 'rest',
  },
  functions: {
    generateAICoaching: 'rest',
    pilarRagQuery: 'rest',
    getAssessmentGuidance: 'rest',
    generateQuizQuestions: 'rest',
    analyzeContent: 'rest',
    createAssessment: 'rest',
    getUserProfile: 'rest',
    updateUserProgress: 'rest',
     createTeam: 'base44',
     joinStudyGroup: 'rest',       // ✅ Migrated to REST API
     submitPeerFeedback: 'rest',   // ✅ Migrated to REST API
     completeChallenge: 'rest',   // ✅ Migrated to REST API
     earnTrophy: 'rest',        // ✅ Migrated to REST API
     awardBadge: 'rest',        // ✅ Migrated to REST API
     trackAnalytics: 'rest',     // ✅ Migrated to REST API
    manageContent: 'rest',
     getLearningPath: 'rest',     // ✅ Migrated to REST API
     sendChatMessage: 'rest',     // ✅ Migrated to REST API
     updateDevelopmentPlan: 'rest', // ✅ Migrated to REST API
     enrichData: 'rest',           // ✅ Migrated to REST API
     recordTimeSeries: 'rest',     // ✅ Migrated to REST API
     mapGoals: 'rest',             // ✅ Migrated to REST API
     getForcePrompts: 'rest',      // ✅ Migrated to REST API
    trackUserSession: 'rest',
  }
};

/**
 * Check if entity/function should use REST API
 */
export function shouldUseRest(entityOrFunction) {
  return MIGRATION_STATUS.entities[entityOrFunction] === 'rest' ||
         MIGRATION_STATUS.functions[entityOrFunction] === 'rest';
}

/**
 * Check if entity/function should use Base44 SDK
 */
export function shouldUseBase44(entityOrFunction) {
  return MIGRATION_STATUS.entities[entityOrFunction] === 'base44' ||
         MIGRATION_STATUS.functions[entityOrFunction] === 'base44';
}

/**
 * Check if entity/function should use Supabase directly
 */
export function shouldUseSupabase(entityOrFunction) {
  return MIGRATION_STATUS.entities[entityOrFunction] === 'supabase';
}

/**
 * Update migration status for an entity or function
 */
export function updateMigrationStatus(entityOrFunction, target, status) {
  if (MIGRATION_STATUS.entities[entityOrFunction]) {
    MIGRATION_STATUS.entities[entityOrFunction] = status;
  } else if (MIGRATION_STATUS.functions[entityOrFunction]) {
    MIGRATION_STATUS.functions[entityOrFunction] = status;
  }

  // Log migration event
  console.log(`Migration: ${entityOrFunction} → ${status} (${target})`);

  // Dispatch custom event for components to react
  window.dispatchEvent(new CustomEvent('migrationStatusChanged', {
    detail: { entityOrFunction, target, status }
  }));
}

/**
 * Get current migration status
 */
export function getMigrationStatus() {
  return { ...MIGRATION_STATUS };
}

/**
 * Migration-aware API wrapper
 */
export class MigrationApiWrapper {
  constructor(base44Client, restClient = restClient) {
    this.base44Client = base44Client;
    this.restClient = restClient;
  }

  /**
   * Execute operation using appropriate API based on migration status
   */
  async execute(operation, data, options = {}) {
    const { forceRest = false, forceBase44 = false } = options;

    // Determine which API to use
    let useRest = shouldUseRest(operation);
    if (forceRest) useRest = true;
    if (forceBase44) useRest = false;

    try {
      if (useRest) {
        return await this.executeRest(operation, data, options);
      } else {
        return await this.executeBase44(operation, data, options);
      }
    } catch (error) {
      // Fallback logic - try the other API if primary fails
      const { fallback = true } = options;
      if (fallback) {
        try {
          console.warn(`Primary API failed for ${operation}, trying fallback...`);
          if (useRest) {
            return await this.executeBase44(operation, data, { ...options, fallback: false });
          } else {
            return await this.executeRest(operation, data, { ...options, fallback: false });
          }
        } catch (fallbackError) {
          console.error(`Both APIs failed for ${operation}:`, { primary: error, fallback: fallbackError });
          throw fallbackError;
        }
      }
      throw error;
    }
  }

  /**
   * Execute using REST API
   */
  async executeRest(operation, data, options) {
    const { method = 'POST', streaming = false } = options;

    // Map operation to REST endpoint
    const endpoint = this.mapOperationToRestEndpoint(operation);

    if (streaming) {
      return new Promise((resolve, reject) => {
        const chunks = [];
        this.restClient.stream(endpoint, data, (chunk) => {
          chunks.push(chunk);
        }).then(() => {
          resolve({ chunks, streaming: true });
        }).catch(reject);
      });
    } else {
      const response = await this.restClient.request(endpoint, {
        method,
        body: data ? JSON.stringify(data) : undefined,
      });
      return await response.json();
    }
  }

  /**
   * Execute using Base44 SDK
   */
  async executeBase44(operation, data, options) {
    // Map operation to Base44 method
    const method = this.mapOperationToBase44Method(operation);

    if (this.base44Client && typeof this.base44Client[method] === 'function') {
      return await this.base44Client[method](data);
    } else {
      throw new Error(`Base44 method ${method} not available`);
    }
  }

  /**
   * Map operation name to REST endpoint
   */
  mapOperationToRestEndpoint(operation) {
    const endpointMap = {
      // AI operations
      generateAICoaching: '/ai/coaching',
      pilarRagQuery: '/rag/query',
      getAssessmentGuidance: '/ai/guidance',
      generateQuizQuestions: '/ai/quiz-questions',
      analyzeContent: '/ai/analyze-content',

      // Assessment operations
      createAssessment: '/assessments',
      getAssessment: '/assessments/{id}',
      updateAssessment: '/assessments/{id}',
      deleteAssessment: '/assessments/{id}',

      // User operations
      getUserProfile: '/users/profile',
      updateUserProfile: '/users/profile',
      getUserHistory: '/users/history',
      getUserProgress: '/users/progress',

      // Content operations
      getContent: '/content',
      createContent: '/content',
      updateContent: '/content/{id}',
      deleteContent: '/content/{id}',

      // Team operations
      getTeams: '/teams',
      createTeam: '/teams',
      getTeam: '/teams/{id}',
      updateTeam: '/teams/{id}',
      deleteTeam: '/teams/{id}',

      // Analytics operations
      getUserAnalytics: '/analytics/user/{id}',
      getAssessmentAnalytics: '/analytics/assessments',
      getTeamAnalytics: '/analytics/teams',
    };

    return endpointMap[operation] || `/${operation.toLowerCase()}`;
  }

  /**
   * Map operation name to Base44 method
   */
  mapOperationToBase44Method(operation) {
    const methodMap = {
      // AI operations
      generateAICoaching: 'generateCoaching',
      pilarRagQuery: 'queryRAG',
      getAssessmentGuidance: 'getGuidance',
      generateQuizQuestions: 'generateQuestions',
      analyzeContent: 'analyzeContent',

      // Assessment operations
      createAssessment: 'createAssessment',
      getAssessment: 'getAssessment',
      updateAssessment: 'updateAssessment',
      deleteAssessment: 'deleteAssessment',

      // User operations
      getUserProfile: 'getUserProfile',
      updateUserProfile: 'updateUserProfile',
      getUserHistory: 'getUserHistory',
      getUserProgress: 'getUserProgress',

      // Content operations
      getContent: 'getContent',
      createContent: 'createContent',
      updateContent: 'updateContent',
      deleteContent: 'deleteContent',

      // Team operations
      getTeams: 'getTeams',
      createTeam: 'createTeam',
      getTeam: 'getTeam',
      updateTeam: 'updateTeam',
      deleteTeam: 'deleteTeam',

      // Analytics operations
      getUserAnalytics: 'getUserAnalytics',
      getAssessmentAnalytics: 'getAssessmentAnalytics',
      getTeamAnalytics: 'getTeamAnalytics',
    };

    return methodMap[operation] || operation;
  }
}

/**
 * React hook for migration-aware API calls
 */
export function useMigratedApi(base44Client) {
  const wrapper = new MigrationApiWrapper(base44Client);

  return {
    execute: (operation, data, options) => wrapper.execute(operation, data, options),
    shouldUseRest: (entityOrFunction) => shouldUseRest(entityOrFunction),
    shouldUseBase44: (entityOrFunction) => shouldUseBase44(entityOrFunction),
    updateMigrationStatus,
    getMigrationStatus,
  };
}

/**
 * Migration status monitor hook
 */
export function useMigrationStatus() {
  const [status, setStatus] = React.useState(getMigrationStatus());

  React.useEffect(() => {
    const handleStatusChange = (event) => {
      setStatus(getMigrationStatus());
    };

    window.addEventListener('migrationStatusChanged', handleStatusChange);
    return () => window.removeEventListener('migrationStatusChanged', handleStatusChange);
  }, []);

  return status;
}

/**
 * Gradual migration utilities
 */
export const MigrationUtils = {
  /**
   * Migrate entity gradually with feature flags
   */
  async migrateEntity(entityName, migrationFn, options = {}) {
    const { dryRun = false, rollbackOnError = true } = options;

    console.log(`Starting migration for ${entityName}...`);

    try {
      if (!dryRun) {
        await migrationFn();
      }

      updateMigrationStatus(entityName, 'entity', 'rest');
      console.log(`✅ Migration completed for ${entityName}`);
    } catch (error) {
      console.error(`❌ Migration failed for ${entityName}:`, error);

      if (rollbackOnError && !dryRun) {
        updateMigrationStatus(entityName, 'entity', 'base44');
        console.log(`🔄 Rolled back ${entityName} to Base44`);
      }

      throw error;
    }
  },

  /**
   * Migrate function gradually
   */
  async migrateFunction(functionName, migrationFn, options = {}) {
    const { dryRun = false, rollbackOnError = true } = options;

    console.log(`Starting function migration for ${functionName}...`);

    try {
      if (!dryRun) {
        await migrationFn();
      }

      updateMigrationStatus(functionName, 'function', 'rest');
      console.log(`✅ Function migration completed for ${functionName}`);
    } catch (error) {
      console.error(`❌ Function migration failed for ${functionName}:`, error);

      if (rollbackOnError && !dryRun) {
        updateMigrationStatus(functionName, 'function', 'base44');
        console.log(`🔄 Rolled back ${functionName} to Base44`);
      }

      throw error;
    }
  },

  /**
   * Validate migration by comparing results
   */
  async validateMigration(operation, testData, options = {}) {
    const { tolerance = 0.95 } = options; // 95% similarity required

    const wrapper = new MigrationApiWrapper();

    try {
      // Test both APIs
      const restResult = await wrapper.execute(operation, testData, { forceRest: true });
      const base44Result = await wrapper.execute(operation, testData, { forceBase44: true });

      // Compare results (simplified comparison)
      const similarity = calculateSimilarity(restResult, base44Result);

      if (similarity >= tolerance) {
        console.log(`✅ Migration validation passed for ${operation} (${similarity.toFixed(2)} similarity)`);
        return true;
      } else {
        console.warn(`⚠️ Migration validation failed for ${operation} (${similarity.toFixed(2)} similarity)`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Migration validation error for ${operation}:`, error);
      return false;
    }
  }
};

/**
 * Simple similarity calculation (for validation)
 */
function calculateSimilarity(obj1, obj2, path = '') {
  if (obj1 === obj2) return 1;

  if (obj1 == null || obj2 == null) return 0;
  if (typeof obj1 !== typeof obj2) return 0;

  if (typeof obj1 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return 0;

    let totalSimilarity = 0;
    for (const key of keys1) {
      if (!(key in obj2)) return 0;
      totalSimilarity += calculateSimilarity(obj1[key], obj2[key], `${path}.${key}`);
    }

    return totalSimilarity / keys1.length;
  }

  // For primitive values, check exact match
  return obj1 === obj2 ? 1 : 0;
}