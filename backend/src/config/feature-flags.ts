/**
 * Feature Flags Configuration
 *
 * Controls migration from Base44 to REST API calls
 * Allows gradual rollout and rollback capabilities
 */

export interface FeatureFlags {
  // Entity migration flags - true = use REST, false = use Base44
  entities: {
    PilarAssessment: boolean;
    UserProfile: boolean;
    AssessmentSession: boolean;
    UserProgress: boolean;
    UserAction: boolean;
    DevelopmentPlan: boolean;
    UserGamification: boolean;
    UserAnalytics: boolean;
    SessionAnalytics: boolean;
    UserProfileInsights: boolean;
    LearningPathways: boolean;
    PeerFeedback: boolean;
    AIInsightQuestions: boolean;
    UserSessions: boolean;
    AssessmentGuidance: boolean;
    DataEnrichmentRecommendations: boolean;
    TimeSeriesData: boolean;
    PilarSnapshots: boolean;
    GoalMappings: boolean;
    CoachConversations: boolean;
  };

  // Function migration flags
  functions: {
    generateQuestionsByDifficulty: boolean;
    vectorSearch: boolean;
    generateAICoaching: boolean;
    getUserProfileInsights: boolean;
    analyzeContent: boolean;
    getAssessmentGuidance: boolean;
  };

  // Global flags
  migration: {
    enabled: boolean;
    allowRollback: boolean;
    logMigrationEvents: boolean;
  };
}

/**
 * Current feature flag configuration
 * Update this to control migration rollout
 */
export const FEATURE_FLAGS: FeatureFlags = {
  entities: {
    // Phase 1: Core entities (Week 4)
    PilarAssessment: false, // Start with false, enable after testing
    UserProfile: false,
    AssessmentSession: false,
    UserProgress: false,

    // Phase 2: Extended entities (Week 5)
    UserAction: false,
    DevelopmentPlan: false,
    UserGamification: false,
    UserAnalytics: false,
    SessionAnalytics: false,
    UserProfileInsights: false,
    LearningPathways: false,

    // Phase 3: Advanced entities (Week 6)
    PeerFeedback: false,
    AIInsightQuestions: false,
    UserSessions: false,
    AssessmentGuidance: false,
    DataEnrichmentRecommendations: false,
    TimeSeriesData: false,
    PilarSnapshots: false,
    GoalMappings: false,
    CoachConversations: false,
  },

  functions: {
    // AI Functions - Enable for testing
    generateQuestionsByDifficulty: true,
    generateAICoaching: true,
    analyzeContent: true,
    getAssessmentGuidance: true,

    // Search Functions
    vectorSearch: false,
    getUserProfileInsights: false,
  },

  migration: {
    enabled: true,
    allowRollback: true,
    logMigrationEvents: true,
  },
};

/**
 * Migration phases for gradual rollout
 */
export const MIGRATION_PHASES = {
  phase1: {
    name: 'Core Assessment Features',
    entities: ['PilarAssessment', 'UserProfile', 'AssessmentSession', 'UserProgress'],
    functions: ['generateQuestionsByDifficulty', 'generateAICoaching'],
  },
  phase2: {
    name: 'Extended User Features',
    entities: ['UserAction', 'DevelopmentPlan', 'UserGamification', 'UserAnalytics', 'SessionAnalytics'],
    functions: ['getUserProfileInsights', 'analyzeContent'],
  },
  phase3: {
    name: 'Advanced Collaboration',
    entities: ['PeerFeedback', 'AIInsightQuestions', 'LearningPathways', 'CoachConversations'],
    functions: ['vectorSearch', 'getAssessmentGuidance'],
  },
  phase4: {
    name: 'Analytics & Insights',
    entities: ['UserProfileInsights', 'DataEnrichmentRecommendations', 'TimeSeriesData', 'PilarSnapshots', 'GoalMappings'],
    functions: [],
  },
} as const;

/**
 * Enable a migration phase
 */
export function enablePhase(phaseName: keyof typeof MIGRATION_PHASES): void {
  const phase = MIGRATION_PHASES[phaseName];

  // Enable entities
  phase.entities.forEach(entity => {
    if (entity in FEATURE_FLAGS.entities) {
      (FEATURE_FLAGS.entities as any)[entity] = true;
    }
  });

  // Enable functions
  phase.functions.forEach(func => {
    if (func in FEATURE_FLAGS.functions) {
      (FEATURE_FLAGS.functions as any)[func] = true;
    }
  });

  console.log(`✅ Enabled migration phase: ${phase.name}`);
}

/**
 * Disable a migration phase (rollback)
 */
export function disablePhase(phaseName: keyof typeof MIGRATION_PHASES): void {
  const phase = MIGRATION_PHASES[phaseName];

  // Disable entities
  phase.entities.forEach(entity => {
    if (entity in FEATURE_FLAGS.entities) {
      (FEATURE_FLAGS.entities as any)[entity] = false;
    }
  });

  // Disable functions
  phase.functions.forEach(func => {
    if (func in FEATURE_FLAGS.functions) {
      (FEATURE_FLAGS.functions as any)[func] = false;
    }
  });

  console.log(`⏪ Disabled migration phase: ${phase.name}`);
}

/**
 * Check if an entity should use REST API
 */
export function shouldUseRestForEntity(entityName: string): boolean {
  if (!FEATURE_FLAGS.migration.enabled) {
    return false; // Use Base44 for all if migration disabled
  }

  const flag = (FEATURE_FLAGS.entities as any)[entityName];
  return flag === true;
}

/**
 * Check if a function should use REST API
 */
export function shouldUseRestForFunction(functionName: string): boolean {
  if (!FEATURE_FLAGS.migration.enabled) {
    return false; // Use Base44 for all if migration disabled
  }

  const flag = (FEATURE_FLAGS.functions as any)[functionName];
  return flag === true;
}

/**
 * Get migration status summary
 */
export function getMigrationStatus(): {
  entitiesMigrated: number;
  entitiesTotal: number;
  functionsMigrated: number;
  functionsTotal: number;
  overallProgress: number;
} {
  const entitiesTotal = Object.keys(FEATURE_FLAGS.entities).length;
  const entitiesMigrated = Object.values(FEATURE_FLAGS.entities).filter(Boolean).length;

  const functionsTotal = Object.keys(FEATURE_FLAGS.functions).length;
  const functionsMigrated = Object.values(FEATURE_FLAGS.functions).filter(Boolean).length;

  const totalFeatures = entitiesTotal + functionsTotal;
  const migratedFeatures = entitiesMigrated + functionsMigrated;
  const overallProgress = totalFeatures > 0 ? (migratedFeatures / totalFeatures) * 100 : 0;

  return {
    entitiesMigrated,
    entitiesTotal,
    functionsMigrated,
    functionsTotal,
    overallProgress: Math.round(overallProgress),
  };
}

/**
 * Log migration events if enabled
 */
export function logMigrationEvent(event: string, details?: any): void {
  if (FEATURE_FLAGS.migration.logMigrationEvents) {
    console.log(`🔄 Migration Event: ${event}`, details || '');
  }
}
