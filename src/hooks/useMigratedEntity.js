/**
 * Migration Wrapper Hooks
 *
 * Provides seamless migration from Base44 to REST APIs with automatic
 * API selection, fallback handling, and consistent interfaces.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRestApi } from './useRestApi';
import { useMigratedApi, shouldUseRest, shouldUseBase44, updateMigrationStatus, getMigrationStatus } from '@/api/migrationLayer';

/**
 * Hook for migrated entity operations
 *
 * Automatically switches between REST and Base44 APIs based on migration status.
 * Provides consistent interface and fallback handling.
 */
export function useMigratedEntity(entityName, base44Client = null) {
  const restApi = useRestApi();
  const migratedApi = useMigratedApi(base44Client);
  const [migrationStatus, setMigrationStatus] = useState(shouldUseRest(entityName) ? 'rest' : 'base44');
  const [overrideApi, setOverrideApi] = useState(null); // 'rest', 'base44', or null for auto

  // Update migration status when it changes
  useEffect(() => {
    const handleStatusChange = () => {
      if (!overrideApi) {
        setMigrationStatus(shouldUseRest(entityName) ? 'rest' : 'base44');
      }
    };

    window.addEventListener('migrationStatusChanged', handleStatusChange);
    return () => window.removeEventListener('migrationStatusChanged', handleStatusChange);
  }, [entityName, overrideApi]);

  // Determine which API to use
  const activeApi = useMemo(() => {
    if (overrideApi === 'rest') return 'rest';
    if (overrideApi === 'base44') return 'base44';
    return migrationStatus === 'rest' ? 'rest' : 'base44';
  }, [migrationStatus, overrideApi]);

  // Entity operations with automatic API selection
  const operations = useMemo(() => {
    const baseOperations = {
      // CRUD operations
      create: async (data, options = {}) => {
        const operation = `create${entityName}`;
        return migratedApi.execute(operation, data, {
          ...options,
          forceRest: activeApi === 'rest',
          forceBase44: activeApi === 'base44',
        });
      },

      get: async (id, options = {}) => {
        const operation = `get${entityName}`;
        return migratedApi.execute(operation, { id }, {
          ...options,
          forceRest: activeApi === 'rest',
          forceBase44: activeApi === 'base44',
        });
      },

      list: async (params = {}, options = {}) => {
        const operation = `list${entityName}`;
        return migratedApi.execute(operation, params, {
          ...options,
          forceRest: activeApi === 'rest',
          forceBase44: activeApi === 'base44',
        });
      },

      update: async (id, data, options = {}) => {
        const operation = `update${entityName}`;
        return migratedApi.execute(operation, { id, ...data }, {
          ...options,
          forceRest: activeApi === 'rest',
          forceBase44: activeApi === 'base44',
        });
      },

      delete: async (id, options = {}) => {
        const operation = `delete${entityName}`;
        return migratedApi.execute(operation, { id }, {
          ...options,
          forceRest: activeApi === 'rest',
          forceBase44: activeApi === 'base44',
        });
      },
    };

    // Add entity-specific operations based on entity type
    if (entityName === 'Assessment') {
      return {
        ...baseOperations,
        generateQuestions: async (pillarId, mode, options = {}) => {
          const operation = 'generateQuizQuestions';
          return migratedApi.execute(operation, { pillar_id: pillarId, mode }, {
            ...options,
            forceRest: activeApi === 'rest',
            forceBase44: activeApi === 'base44',
          });
        },

        getGuidance: async (assessmentId, options = {}) => {
          const operation = 'getAssessmentGuidance';
          return migratedApi.execute(operation, { assessment_id: assessmentId }, {
            ...options,
            forceRest: activeApi === 'rest',
            forceBase44: activeApi === 'base44',
          });
        },
      };
    }

    if (entityName === 'User') {
      return {
        ...baseOperations,
        getProfile: async (options = {}) => {
          const operation = 'getUserProfile';
          return migratedApi.execute(operation, {}, {
            ...options,
            forceRest: activeApi === 'rest',
            forceBase44: activeApi === 'base44',
          });
        },

        updateProfile: async (data, options = {}) => {
          const operation = 'updateUserProfile';
          return migratedApi.execute(operation, data, {
            ...options,
            forceRest: activeApi === 'rest',
            forceBase44: activeApi === 'base44',
          });
        },

        getHistory: async (options = {}) => {
          const operation = 'getUserHistory';
          return migratedApi.execute(operation, {}, {
            ...options,
            forceRest: activeApi === 'rest',
            forceBase44: activeApi === 'base44',
          });
        },
      };
    }

    if (entityName === 'Team') {
      return {
        ...baseOperations,
        join: async (teamId, options = {}) => {
          const operation = 'joinTeam';
          return migratedApi.execute(operation, { team_id: teamId }, {
            ...options,
            forceRest: activeApi === 'rest',
            forceBase44: activeApi === 'base44',
          });
        },

        leave: async (teamId, options = {}) => {
          const operation = 'leaveTeam';
          return migratedApi.execute(operation, { team_id: teamId }, {
            ...options,
            forceRest: activeApi === 'rest',
            forceBase44: activeApi === 'base44',
          });
        },
      };
    }

    return baseOperations;
  }, [entityName, migratedApi, activeApi]);

  // Migration control functions
  const switchToRest = useCallback(() => {
    updateMigrationStatus(entityName, 'entity', 'rest');
  }, [entityName]);

  const switchToBase44 = useCallback(() => {
    updateMigrationStatus(entityName, 'entity', 'base44');
  }, [entityName]);

  const overrideToRest = useCallback(() => {
    setOverrideApi('rest');
  }, []);

  const overrideToBase44 = useCallback(() => {
    setOverrideApi('base44');
  }, []);

  const clearOverride = useCallback(() => {
    setOverrideApi(null);
  }, []);

  return {
    // Operations
    ...operations,

    // Migration status
    isUsingRest: activeApi === 'rest',
    isUsingBase44: activeApi === 'base44',
    migrationStatus,
    overrideApi,

    // Control functions
    switchToRest,
    switchToBase44,
    overrideToRest,
    overrideToBase44,
    clearOverride,

    // Utilities
    entityName,
  };
}

/**
 * Hook for migrated function operations
 *
 * Similar to useMigratedEntity but for function calls rather than CRUD operations.
 */
export function useMigratedFunction(functionName, base44Client = null) {
  const migratedApi = useMigratedApi(base44Client);
  const [migrationStatus, setMigrationStatus] = useState(shouldUseRest(functionName) ? 'rest' : 'base44');
  const [overrideApi, setOverrideApi] = useState(null);

  // Update migration status when it changes
  useEffect(() => {
    const handleStatusChange = () => {
      if (!overrideApi) {
        setMigrationStatus(shouldUseRest(functionName) ? 'rest' : 'base44');
      }
    };

    window.addEventListener('migrationStatusChanged', handleStatusChange);
    return () => window.removeEventListener('migrationStatusChanged', handleStatusChange);
  }, [functionName, overrideApi]);

  const activeApi = useMemo(() => {
    if (overrideApi === 'rest') return 'rest';
    if (overrideApi === 'base44') return 'base44';
    return migrationStatus === 'rest' ? 'rest' : 'base44';
  }, [migrationStatus, overrideApi]);

  // Execute function with automatic API selection
  const execute = useCallback(async (data, options = {}) => {
    return migratedApi.execute(functionName, data, {
      ...options,
      forceRest: activeApi === 'rest',
      forceBase44: activeApi === 'base44',
    });
  }, [functionName, migratedApi, activeApi]);

  // Migration control functions
  const switchToRest = useCallback(() => {
    updateMigrationStatus(functionName, 'function', 'rest');
  }, [functionName]);

  const switchToBase44 = useCallback(() => {
    updateMigrationStatus(functionName, 'function', 'base44');
  }, [functionName]);

  const overrideToRest = useCallback(() => {
    setOverrideApi('rest');
  }, []);

  const overrideToBase44 = useCallback(() => {
    setOverrideApi('base44');
  }, []);

  const clearOverride = useCallback(() => {
    setOverrideApi(null);
  }, []);

  return {
    // Function execution
    execute,

    // Migration status
    isUsingRest: activeApi === 'rest',
    isUsingBase44: activeApi === 'base44',
    migrationStatus,
    overrideApi,

    // Control functions
    switchToRest,
    switchToBase44,
    overrideToRest,
    overrideToBase44,
    clearOverride,

    // Utilities
    functionName,
  };
}

/**
 * Hook for batch entity operations with migration awareness
 */
export function useMigratedEntities(entityNames, base44Client = null) {
  const entities = useMemo(() => {
    return entityNames.reduce((acc, entityName) => {
      acc[entityName] = useMigratedEntity(entityName, base44Client);
      return acc;
    }, {});
  }, [entityNames, base44Client]);

  // Batch migration operations
  const switchAllToRest = useCallback(() => {
    entityNames.forEach(entityName => {
      updateMigrationStatus(entityName, 'entity', 'rest');
    });
  }, [entityNames]);

  const switchAllToBase44 = useCallback(() => {
    entityNames.forEach(entityName => {
      updateMigrationStatus(entityName, 'entity', 'base44');
    });
  }, [entityNames]);

  return {
    entities,
    switchAllToRest,
    switchAllToBase44,
  };
}

/**
 * Hook for migration analytics and monitoring
 */
export function useMigrationAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalEntities: 0,
    migratedToRest: 0,
    stillOnBase44: 0,
    migrationProgress: 0,
  });

  useEffect(() => {
    const updateAnalytics = () => {
      const status = getMigrationStatus();
      const entities = Object.values(status.entities);
      const totalEntities = entities.length;
      const migratedToRest = entities.filter(s => s === 'rest').length;
      const stillOnBase44 = entities.filter(s => s === 'base44').length;

      setAnalytics({
        totalEntities,
        migratedToRest,
        stillOnBase44,
        migrationProgress: totalEntities > 0 ? (migratedToRest / totalEntities) * 100 : 0,
      });
    };

    updateAnalytics();
    window.addEventListener('migrationStatusChanged', updateAnalytics);
    return () => window.removeEventListener('migrationStatusChanged', updateAnalytics);
  }, []);

  return analytics;
}