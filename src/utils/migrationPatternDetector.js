/**
 * Automated Migration Pattern Detection
 *
 * Analyzes codebase to detect Base44 SDK usage patterns and
 * suggests optimal migration strategies and priorities.
 */

import { getMigrationStatus } from '@/api/migrationLayer';

/**
 * Pattern Detector Class
 *
 * Analyzes code patterns to detect migration opportunities
 */
export class MigrationPatternDetector {
  constructor() {
    this.detectionResults = new Map();
    this.analysisCache = new Map();
  }

  /**
   * Analyze a component file for migration patterns
   */
  async analyzeComponent(componentPath, componentCode) {
    if (this.analysisCache.has(componentPath)) {
      return this.analysisCache.get(componentPath);
    }

    const patterns = {
      base44Imports: this.detectBase44Imports(componentCode),
      apiCalls: this.detectApiCalls(componentCode),
      entityUsage: this.detectEntityUsage(componentCode),
      hookUsage: this.detectHookUsage(componentCode),
      complexity: this.assessComplexity(componentCode),
      dependencies: this.analyzeDependencies(componentCode),
    };

    const analysis = {
      componentPath,
      patterns,
      migrationScore: this.calculateMigrationScore(patterns),
      riskLevel: this.assessRiskLevel(patterns),
      effort: this.estimateEffort(patterns),
      recommendations: this.generateRecommendations(patterns),
      priority: this.calculatePriority(patterns),
    };

    this.analysisCache.set(componentPath, analysis);
    return analysis;
  }

  /**
   * Detect Base44 SDK imports
   */
  detectBase44Imports(code) {
    const patterns = [
      /import.*from.*['"]base44['"]/g,
      /import.*\{.*useBase44.*\}/g,
      /import.*base44Client/g,
      /const.*base44Client/g,
    ];

    const matches = [];
    patterns.forEach(pattern => {
      const found = code.match(pattern);
      if (found) {
        matches.push(...found);
      }
    });

    return {
      hasBase44Imports: matches.length > 0,
      importLines: matches,
      count: matches.length,
    };
  }

  /**
   * Detect API call patterns
   */
  detectApiCalls(code) {
    const patterns = {
      // CRUD operations
      create: /\b(create|add|insert)\w*\s*\(/g,
      read: /\b(get|fetch|read|find)\w*\s*\(/g,
      update: /\b(update|edit|modify|save)\w*\s*\(/g,
      delete: /\b(delete|remove|destroy)\w*\s*\(/g,

      // Specific API patterns
      assessments: /\bassessments?\./g,
      users: /\busers?\./g,
      teams: /\bteams?\./g,
      content: /\bcontent\.|\bposts?\./g,
      ai: /\bai\.|\bcoaching\.|\bchat\.|\brag\./g,
    };

    const results = {};
    Object.entries(patterns).forEach(([key, pattern]) => {
      const matches = code.match(pattern) || [];
      results[key] = {
        count: matches.length,
        lines: matches.slice(0, 5), // Keep first 5 matches
      };
    });

    return results;
  }

  /**
   * Detect entity usage patterns
   */
  detectEntityUsage(code) {
    const entities = [
      'Assessment', 'User', 'Team', 'Content', 'Post',
      'PilarAssessment', 'UserProfile', 'StudyGroup', 'PeerFeedback',
      'Challenge', 'Trophy', 'Badge', 'MasteryLevel',
      'Analytics', 'CoachConversation', 'DevelopmentPlan',
    ];

    const usage = {};
    entities.forEach(entity => {
      const pattern = new RegExp(`\\b${entity}\\b`, 'g');
      const matches = code.match(pattern) || [];
      if (matches.length > 0) {
        usage[entity] = matches.length;
      }
    });

    return {
      entities: usage,
      totalEntities: Object.keys(usage).length,
      primaryEntity: Object.entries(usage).sort((a, b) => b[1] - a[1])[0]?.[0],
    };
  }

  /**
   * Detect hook usage patterns
   */
  detectHookUsage(code) {
    const hooks = [
      'useState', 'useEffect', 'useCallback', 'useMemo',
      'useBase44', 'useAssessment', 'useUser', 'useTeam',
      'useApi', 'useRest', 'useMigrated',
    ];

    const usage = {};
    hooks.forEach(hook => {
      const pattern = new RegExp(`\\b${hook}\\b`, 'g');
      const matches = code.match(pattern) || [];
      if (matches.length > 0) {
        usage[hook] = matches.length;
      }
    });

    return {
      hooks: usage,
      hasCustomHooks: Object.keys(usage).some(hook => !hook.startsWith('use')),
      totalHooks: Object.keys(usage).length,
    };
  }

  /**
   * Assess code complexity
   */
  assessComplexity(code) {
    const lines = code.split('\n').length;
    const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
    const conditionals = (code.match(/if\s*\(|else|switch|case/g) || []).length;
    const loops = (code.match(/for\s*\(|while\s*\(|map\s*\(|filter\s*\(/g) || []).length;

    let complexity = 'low';
    if (lines > 200 || functions > 10 || conditionals > 15) {
      complexity = 'high';
    } else if (lines > 100 || functions > 5 || conditionals > 8) {
      complexity = 'medium';
    }

    return {
      lines,
      functions,
      conditionals,
      loops,
      complexity,
      score: (lines * 0.1) + (functions * 2) + (conditionals * 1) + (loops * 1.5),
    };
  }

  /**
   * Analyze dependencies
   */
  analyzeDependencies(code) {
    const imports = code.match(/import\s+.*from\s+['"]([^'"]+)['"]/g) || [];
    const dependencies = imports.map(imp => {
      const match = imp.match(/from\s+['"]([^'"]+)['"]/);
      return match ? match[1] : null;
    }).filter(Boolean);

    const internalDeps = dependencies.filter(dep =>
      dep.startsWith('@/') || dep.startsWith('./') || dep.startsWith('../')
    );

    const externalDeps = dependencies.filter(dep =>
      !dep.startsWith('@/') && !dep.startsWith('./') && !dep.startsWith('../')
    );

    return {
      totalImports: imports.length,
      internalDeps: internalDeps.length,
      externalDeps: externalDeps.length,
      hasBase44Dep: dependencies.some(dep => dep.includes('base44')),
      hasApiDeps: dependencies.some(dep => dep.includes('api') || dep.includes('rest')),
    };
  }

  /**
   * Calculate migration score (0-100)
   */
  calculateMigrationScore(patterns) {
    let score = 0;

    // Base44 usage increases migration priority
    if (patterns.base44Imports.hasBase44Imports) score += 30;
    score += patterns.base44Imports.count * 5;

    // API calls increase priority
    const totalApiCalls = Object.values(patterns.apiCalls).reduce((sum, calls) => sum + calls.count, 0);
    score += Math.min(totalApiCalls * 2, 20);

    // Entity usage increases priority
    score += patterns.entityUsage.totalEntities * 3;

    // Hook usage indicates modern patterns
    if (patterns.hookUsage.hasCustomHooks) score += 10;

    // Complexity affects score (simpler components first)
    const complexityPenalty = patterns.complexity.complexity === 'high' ? 15 :
                             patterns.complexity.complexity === 'medium' ? 5 : 0;
    score -= complexityPenalty;

    // Dependencies
    if (patterns.dependencies.hasBase44Dep) score += 15;
    if (patterns.dependencies.hasApiDeps) score -= 10; // Already migrated

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess risk level
   */
  assessRiskLevel(patterns) {
    let risk = 'low';

    if (patterns.complexity.complexity === 'high') risk = 'high';
    else if (patterns.complexity.complexity === 'medium') risk = 'medium';

    if (patterns.apiCalls.update.count > 5 || patterns.apiCalls.delete.count > 3) {
      risk = 'high'; // Write operations are riskier
    }

    if (patterns.dependencies.externalDeps > 5) {
      risk = risk === 'low' ? 'medium' : 'high';
    }

    return risk;
  }

  /**
   * Estimate migration effort
   */
  estimateEffort(patterns) {
    let effort = 1; // Base effort in hours

    // Complexity factor
    const complexityMultiplier = patterns.complexity.complexity === 'high' ? 3 :
                                patterns.complexity.complexity === 'medium' ? 2 : 1;
    effort *= complexityMultiplier;

    // API calls factor
    const totalApiCalls = Object.values(patterns.apiCalls).reduce((sum, calls) => sum + calls.count, 0);
    effort += totalApiCalls * 0.1;

    // Entity factor
    effort += patterns.entityUsage.totalEntities * 0.5;

    // Dependencies factor
    effort += patterns.dependencies.totalImports * 0.2;

    return Math.max(1, Math.round(effort));
  }

  /**
   * Generate migration recommendations
   */
  generateRecommendations(patterns) {
    const recommendations = [];

    if (patterns.base44Imports.hasBase44Imports) {
      recommendations.push('Replace Base44 SDK imports with REST API hooks');
    }

    if (patterns.entityUsage.totalEntities > 0) {
      const primaryEntity = patterns.entityUsage.primaryEntity;
      if (primaryEntity) {
        recommendations.push(`Use useMigratedEntity('${primaryEntity}') hook`);
      }
    }

    if (patterns.apiCalls.create.count > 0 || patterns.apiCalls.update.count > 0) {
      recommendations.push('Test write operations thoroughly after migration');
    }

    if (patterns.complexity.complexity === 'high') {
      recommendations.push('Consider breaking down component before migration');
    }

    if (patterns.hookUsage.totalHooks > 5) {
      recommendations.push('Review and consolidate hook usage');
    }

    return recommendations;
  }

  /**
   * Calculate migration priority
   */
  calculatePriority(patterns) {
    const score = this.calculateMigrationScore(patterns);
    const risk = this.assessRiskLevel(patterns);

    let priority = 'medium';

    if (score > 70 && risk === 'low') priority = 'high';
    else if (score < 30 || risk === 'high') priority = 'low';

    return priority;
  }

  /**
   * Generate migration plan for multiple components
   */
  async generateMigrationPlan(componentFiles) {
    const analyses = await Promise.all(
      componentFiles.map(([path, code]) => this.analyzeComponent(path, code))
    );

    // Sort by priority and risk
    const sorted = analyses.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const riskOrder = { low: 3, medium: 2, high: 1 };

      const aScore = priorityOrder[a.priority] * 10 + riskOrder[a.riskLevel];
      const bScore = priorityOrder[b.priority] * 10 + riskOrder[b.riskLevel];

      return bScore - aScore; // Higher scores first
    });

    const plan = {
      components: sorted,
      summary: {
        totalComponents: analyses.length,
        highPriority: analyses.filter(a => a.priority === 'high').length,
        mediumPriority: analyses.filter(a => a.priority === 'medium').length,
        lowPriority: analyses.filter(a => a.priority === 'low').length,
        highRisk: analyses.filter(a => a.riskLevel === 'high').length,
        totalEffort: analyses.reduce((sum, a) => sum + a.effort, 0),
      },
      phases: this.createMigrationPhases(sorted),
    };

    return plan;
  }

  /**
   * Create migration phases
   */
  createMigrationPhases(analyses) {
    const phases = {
      phase1: { name: 'Low Risk, High Impact', components: [], effort: 0 },
      phase2: { name: 'Medium Risk, Medium Impact', components: [], effort: 0 },
      phase3: { name: 'High Risk, Low Impact', components: [], effort: 0 },
    };

    analyses.forEach(analysis => {
      let phase = 'phase2'; // Default

      if (analysis.riskLevel === 'low' && analysis.migrationScore > 60) {
        phase = 'phase1';
      } else if (analysis.riskLevel === 'high' || analysis.migrationScore < 40) {
        phase = 'phase3';
      }

      phases[phase].components.push(analysis);
      phases[phase].effort += analysis.effort;
    });

    return phases;
  }

  /**
   * Clear analysis cache
   */
  clearCache() {
    this.analysisCache.clear();
  }
}

/**
 * Migration Pattern Analyzer
 *
 * High-level analyzer that processes entire codebases
 */
export class MigrationPatternAnalyzer {
  constructor() {
    this.detector = new MigrationPatternDetector();
  }

  /**
   * Analyze entire codebase
   */
  async analyzeCodebase(files) {
    console.log(`🔍 Analyzing ${files.length} files for migration patterns...`);

    const componentFiles = files.filter(([path]) =>
      path.includes('/components/') ||
      path.includes('/pages/') ||
      path.includes('/hooks/') ||
      path.endsWith('.jsx') ||
      path.endsWith('.js') ||
      path.endsWith('.ts') ||
      path.endsWith('.tsx')
    );

    const plan = await this.detector.generateMigrationPlan(componentFiles);

    // Generate insights
    const insights = this.generateInsights(plan);

    return {
      plan,
      insights,
      recommendations: this.generateGlobalRecommendations(plan),
    };
  }

  /**
   * Generate insights from migration plan
   */
  generateInsights(plan) {
    const insights = [];

    if (plan.summary.highPriority > plan.summary.totalComponents * 0.3) {
      insights.push({
        type: 'warning',
        message: 'High number of high-priority components suggests aggressive migration strategy needed',
      });
    }

    if (plan.summary.highRisk > plan.summary.totalComponents * 0.2) {
      insights.push({
        type: 'warning',
        message: 'Significant number of high-risk components - consider phased approach',
      });
    }

    const avgEffort = plan.summary.totalEffort / plan.summary.totalComponents;
    if (avgEffort > 8) {
      insights.push({
        type: 'info',
        message: `Average migration effort is ${avgEffort.toFixed(1)} hours per component`,
      });
    }

    const phase1Ratio = plan.phases.phase1.components.length / plan.summary.totalComponents;
    if (phase1Ratio > 0.5) {
      insights.push({
        type: 'success',
        message: `${(phase1Ratio * 100).toFixed(0)}% of components are low-risk and high-impact`,
      });
    }

    return insights;
  }

  /**
   * Generate global recommendations
   */
  generateGlobalRecommendations(plan) {
    const recommendations = [];

    if (plan.summary.highPriority > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Start with high-priority components',
        details: `Migrate ${plan.summary.highPriority} high-priority components first for maximum impact`,
      });
    }

    if (plan.summary.totalEffort > 100) {
      recommendations.push({
        priority: 'medium',
        action: 'Consider team allocation',
        details: `Total migration effort estimated at ${plan.summary.totalEffort} hours - plan team resources accordingly`,
      });
    }

    if (plan.phases.phase1.components.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Execute Phase 1 immediately',
        details: `${plan.phases.phase1.components.length} low-risk components can be migrated quickly`,
      });
    }

    recommendations.push({
      priority: 'medium',
      action: 'Set up monitoring',
      details: 'Implement performance monitoring and error tracking during migration',
    });

    return recommendations;
  }
}

// Export singleton instances
export const patternDetector = new MigrationPatternDetector();
export const patternAnalyzer = new MigrationPatternAnalyzer();