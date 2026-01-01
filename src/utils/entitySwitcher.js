/**
 * Entity Switching Utilities
 *
 * High-level utilities for switching components and entities between
 * Base44 and REST APIs with batch operations, presets, and A/B testing.
 */

import { updateMigrationStatus, getMigrationStatus, shouldUseRest, shouldUseBase44 } from '@/api/migrationLayer';

/**
 * Entity Switcher Class
 *
 * Manages switching entities between APIs with validation and rollback
 */
export class EntitySwitcher {
  constructor() {
    this.switchHistory = [];
    this.activeExperiments = new Map();
  }

  /**
   * Switch a single entity to REST API
   */
  async switchToRest(entityName, options = {}) {
    const { validate = true, dryRun = false, experimentId = null } = options;

    console.log(`🔄 Switching ${entityName} to REST API...`);

    const previousStatus = shouldUseRest(entityName) ? 'rest' : 'base44';

    if (!dryRun) {
      updateMigrationStatus(entityName, 'entity', 'rest');
    }

    // Record the switch
    this.recordSwitch(entityName, previousStatus, 'rest', experimentId);

    if (validate && !dryRun) {
      await this.validateSwitch(entityName);
    }

    console.log(`✅ ${entityName} switched to REST API`);
    return { success: true, previousStatus };
  }

  /**
   * Switch a single entity to Base44 API
   */
  async switchToBase44(entityName, options = {}) {
    const { validate = true, dryRun = false, experimentId = null } = options;

    console.log(`🔄 Switching ${entityName} to Base44 API...`);

    const previousStatus = shouldUseRest(entityName) ? 'rest' : 'base44';

    if (!dryRun) {
      updateMigrationStatus(entityName, 'entity', 'base44');
    }

    // Record the switch
    this.recordSwitch(entityName, previousStatus, 'base44', experimentId);

    if (validate && !dryRun) {
      await this.validateSwitch(entityName);
    }

    console.log(`✅ ${entityName} switched to Base44 API`);
    return { success: true, previousStatus };
  }

  /**
   * Switch multiple entities at once
   */
  async switchEntities(entities, targetApi, options = {}) {
    const { validate = true, dryRun = false, experimentId = null, parallel = true } = options;

    console.log(`🔄 Switching ${entities.length} entities to ${targetApi} API...`);

    const results = [];
    const switchFn = targetApi === 'rest' ? this.switchToRest.bind(this) : this.switchToBase44.bind(this);

    if (parallel) {
      // Switch in parallel
      const promises = entities.map(entity =>
        switchFn(entity, { validate, dryRun, experimentId: `${experimentId}_${entity}` })
      );
      results.push(...await Promise.all(promises));
    } else {
      // Switch sequentially
      for (const entity of entities) {
        try {
          const result = await switchFn(entity, { validate, dryRun, experimentId: `${experimentId}_${entity}` });
          results.push(result);
        } catch (error) {
          console.error(`Failed to switch ${entity}:`, error);
          results.push({ success: false, error: error.message });
        }
      }
    }

    console.log(`✅ Switched ${results.filter(r => r.success).length}/${entities.length} entities to ${targetApi} API`);
    return results;
  }

  /**
   * Rollback an entity to its previous API
   */
  async rollbackEntity(entityName, options = {}) {
    const { validate = true, dryRun = false } = options;

    const lastSwitch = this.switchHistory
      .filter(s => s.entity === entityName)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (!lastSwitch) {
      throw new Error(`No switch history found for ${entityName}`);
    }

    console.log(`🔄 Rolling back ${entityName} to ${lastSwitch.from} API...`);

    const rollbackFn = lastSwitch.from === 'rest' ? this.switchToRest.bind(this) : this.switchToBase44.bind(this);

    return rollbackFn(entityName, { validate, dryRun });
  }

  /**
   * Validate that a switch was successful
   */
  async validateSwitch(entityName) {
    // Simple validation - check that the status was updated
    const status = getMigrationStatus();
    const currentStatus = status.entities[entityName];

    if (!currentStatus) {
      throw new Error(`Entity ${entityName} not found in migration status`);
    }

    // Additional validation could include:
    // - API health checks
    // - Performance metrics
    // - Error rate monitoring

    return { valid: true, status: currentStatus };
  }

  /**
   * Record a switch in history
   */
  recordSwitch(entity, from, to, experimentId = null) {
    this.switchHistory.push({
      entity,
      from,
      to,
      timestamp: Date.now(),
      experimentId,
    });

    // Keep only last 1000 switches
    if (this.switchHistory.length > 1000) {
      this.switchHistory = this.switchHistory.slice(-1000);
    }
  }

  /**
   * Get switch history for an entity
   */
  getSwitchHistory(entity = null) {
    if (entity) {
      return this.switchHistory.filter(s => s.entity === entity);
    }
    return [...this.switchHistory];
  }
}

/**
 * Migration Presets
 *
 * Predefined migration patterns for common scenarios
 */
export const MigrationPresets = {
  /**
   * Migrate user-facing features first (low risk)
   */
  USER_FACING_FIRST: [
    'UserProfile',
    'UserProgress',
    'CoachConversation',
    'AiInsightQuestion',
    'AssessmentGuidance',
  ],

  /**
   * Migrate assessment-related entities
   */
  ASSESSMENT_CORE: [
    'PilarAssessment',
    'AssessmentSession',
    'AiInsightQuestion',
    'AssessmentGuidance',
  ],

  /**
   * Migrate content and knowledge entities
   */
  CONTENT_FIRST: [
    'Content',
    'PilarKnowledge',
    'LearningPathway',
  ],

  /**
   * Migrate social features (higher risk)
   */
  SOCIAL_FEATURES: [
    'Team',
    'StudyGroup',
    'PeerFeedback',
    'ChatMessage',
  ],

  /**
   * Migrate gamification (can be isolated)
   */
  GAMIFICATION: [
    'UserGamification',
    'Challenge',
    'Trophy',
    'Badge',
    'MasteryLevel',
  ],

  /**
   * Migrate analytics (usually low risk)
   */
  ANALYTICS: [
    'UserAnalytics',
    'SessionAnalytics',
    'GroupAnalytics',
    'TeamAnalytics',
  ],
};

/**
 * A/B Testing Utilities
 *
 * Enable A/B testing of REST vs Base44 APIs
 */
export class MigrationABTester {
  constructor(entitySwitcher) {
    this.entitySwitcher = entitySwitcher;
    this.experiments = new Map();
  }

  /**
   * Start an A/B test for an entity
   */
  async startABTest(entityName, options = {}) {
    const {
      duration = 7 * 24 * 60 * 60 * 1000, // 7 days
      trafficSplit = 0.5, // 50/50 split
      metrics = ['responseTime', 'errorRate', 'successRate'],
    } = options;

    const experimentId = `ab_test_${entityName}_${Date.now()}`;

    console.log(`🧪 Starting A/B test for ${entityName} (ID: ${experimentId})`);

    const experiment = {
      id: experimentId,
      entity: entityName,
      startTime: Date.now(),
      endTime: Date.now() + duration,
      trafficSplit,
      metrics,
      results: {
        rest: { requests: 0, errors: 0, totalTime: 0 },
        base44: { requests: 0, errors: 0, totalTime: 0 },
      },
    };

    this.experiments.set(experimentId, experiment);

    // Set up traffic splitting (this would be more sophisticated in production)
    // For now, just randomly assign based on traffic split
    const useRest = Math.random() < trafficSplit;

    await this.entitySwitcher[useRest ? 'switchToRest' : 'switchToBase44'](
      entityName,
      { experimentId }
    );

    return experimentId;
  }

  /**
   * Record metrics for an A/B test
   */
  recordMetric(experimentId, api, metric, value) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    if (metric === 'responseTime') {
      experiment.results[api].totalTime += value;
      experiment.results[api].requests++;
    } else if (metric === 'error') {
      experiment.results[api].errors++;
      experiment.results[api].requests++;
    } else if (metric === 'success') {
      experiment.results[api].requests++;
    }
  }

  /**
   * Get A/B test results
   */
  getABTestResults(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const { results } = experiment;
    const restRequests = results.rest.requests;
    const base44Requests = results.base44.requests;

    return {
      experimentId,
      entity: experiment.entity,
      duration: Date.now() - experiment.startTime,
      rest: {
        requests: restRequests,
        avgResponseTime: restRequests > 0 ? results.rest.totalTime / restRequests : 0,
        errorRate: restRequests > 0 ? results.rest.errors / restRequests : 0,
      },
      base44: {
        requests: base44Requests,
        avgResponseTime: base44Requests > 0 ? results.base44.totalTime / base44Requests : 0,
        errorRate: base44Requests > 0 ? results.base44.errors / base44Requests : 0,
      },
    };
  }

  /**
   * End an A/B test and recommend a winner
   */
  async endABTest(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const results = this.getABTestResults(experimentId);

    // Simple winner determination based on error rate and response time
    const restScore = (1 - results.rest.errorRate) / (results.rest.avgResponseTime || 1);
    const base44Score = (1 - results.base44.errorRate) / (results.base44.avgResponseTime || 1);

    const winner = restScore > base44Score ? 'rest' : 'base44';
    const confidence = Math.abs(restScore - base44Score) / Math.max(restScore, base44Score);

    console.log(`🏁 A/B test ${experimentId} completed. Winner: ${winner} (confidence: ${(confidence * 100).toFixed(1)}%)`);

    // Clean up
    this.experiments.delete(experimentId);

    return {
      experimentId,
      winner,
      confidence,
      results,
      recommendation: winner === 'rest' ? 'Migrate to REST API' : 'Keep on Base44 API',
    };
  }
}

/**
 * Performance Comparison Utilities
 */
export class PerformanceComparator {
  constructor(entitySwitcher) {
    this.entitySwitcher = entitySwitcher;
    this.measurements = new Map();
  }

  /**
   * Compare performance between REST and Base44 APIs
   */
  async comparePerformance(entityName, operation, testData, iterations = 10) {
    console.log(`📊 Comparing performance for ${entityName}.${operation}...`);

    const results = {
      rest: [],
      base44: [],
    };

    // Test REST API
    await this.entitySwitcher.switchToRest(entityName, { dryRun: false });
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      try {
        await this.executeOperation(entityName, operation, testData);
        const endTime = performance.now();
        results.rest.push(endTime - startTime);
      } catch (error) {
        results.rest.push(-1); // Error indicator
      }
    }

    // Test Base44 API
    await this.entitySwitcher.switchToBase44(entityName, { dryRun: false });
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      try {
        await this.executeOperation(entityName, operation, testData);
        const endTime = performance.now();
        results.base44.push(endTime - startTime);
      } catch (error) {
        results.base44.push(-1); // Error indicator
      }
    }

    // Calculate statistics
    const restStats = this.calculateStats(results.rest.filter(t => t >= 0));
    const base44Stats = this.calculateStats(results.base44.filter(t => t >= 0));

    const comparison = {
      entity: entityName,
      operation,
      iterations,
      rest: {
        ...restStats,
        errors: results.rest.filter(t => t < 0).length,
      },
      base44: {
        ...base44Stats,
        errors: results.base44.filter(t => t < 0).length,
      },
      recommendation: restStats.avg < base44Stats.avg ? 'REST' : 'Base44',
      improvement: ((base44Stats.avg - restStats.avg) / base44Stats.avg * 100).toFixed(1) + '%',
    };

    console.log(`📊 Performance comparison complete:`, comparison);
    return comparison;
  }

  /**
   * Execute an operation (mock implementation - would need to be customized per entity)
   */
  async executeOperation(entityName, operation, testData) {
    // This would need to be implemented based on the specific entity and operation
    // For now, just simulate some work
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    return { success: true };
  }

  /**
   * Calculate statistics for an array of timings
   */
  calculateStats(timings) {
    if (timings.length === 0) return { avg: 0, min: 0, max: 0, p95: 0 };

    const sorted = [...timings].sort((a, b) => a - b);
    const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95 = sorted[p95Index];

    return { avg, min, max, p95 };
  }
}

/**
 * Batch Migration Manager
 */
export class BatchMigrationManager {
  constructor(entitySwitcher) {
    this.entitySwitcher = entitySwitcher;
    this.migrationPlans = new Map();
  }

  /**
   * Create a migration plan
   */
  createPlan(name, entities, options = {}) {
    const plan = {
      name,
      entities: [...entities],
      options: {
        parallel: true,
        validate: true,
        rollbackOnError: true,
        ...options,
      },
      status: 'created',
      progress: 0,
      results: [],
      createdAt: Date.now(),
    };

    this.migrationPlans.set(name, plan);
    return plan;
  }

  /**
   * Execute a migration plan
   */
  async executePlan(planName, targetApi = 'rest') {
    const plan = this.migrationPlans.get(planName);
    if (!plan) {
      throw new Error(`Migration plan ${planName} not found`);
    }

    console.log(`🚀 Executing migration plan: ${planName}`);
    plan.status = 'running';

    try {
      const results = await this.entitySwitcher.switchEntities(
        plan.entities,
        targetApi,
        {
          parallel: plan.options.parallel,
          validate: plan.options.validate,
        }
      );

      plan.results = results;
      plan.progress = 100;
      plan.status = 'completed';

      const successCount = results.filter(r => r.success).length;
      console.log(`✅ Migration plan ${planName} completed: ${successCount}/${plan.entities.length} entities migrated`);

      return { success: true, results };
    } catch (error) {
      plan.status = 'failed';
      console.error(`❌ Migration plan ${planName} failed:`, error);

      if (plan.options.rollbackOnError) {
        console.log(`🔄 Rolling back migration plan ${planName}...`);
        await this.rollbackPlan(planName);
      }

      throw error;
    }
  }

  /**
   * Rollback a migration plan
   */
  async rollbackPlan(planName) {
    const plan = this.migrationPlans.get(planName);
    if (!plan) return;

    for (const entity of plan.entities) {
      try {
        await this.entitySwitcher.rollbackEntity(entity);
      } catch (error) {
        console.error(`Failed to rollback ${entity}:`, error);
      }
    }

    plan.status = 'rolled_back';
  }

  /**
   * Get plan status
   */
  getPlanStatus(planName) {
    return this.migrationPlans.get(planName) || null;
  }

  /**
   * List all plans
   */
  listPlans() {
    return Array.from(this.migrationPlans.values());
  }
}

// Export singleton instances
export const entitySwitcher = new EntitySwitcher();
export const abTester = new MigrationABTester(entitySwitcher);
export const performanceComparator = new PerformanceComparator(entitySwitcher);
export const batchMigrationManager = new BatchMigrationManager(entitySwitcher);