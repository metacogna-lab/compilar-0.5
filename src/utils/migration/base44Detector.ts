/**
 * Base44 Usage Detector
 *
 * Scans the codebase for Base44 SDK usage and suggests migrations
 */

import { featureRegistry } from './featureRegistry.ts';
import { readFileSync } from 'fs';

export interface Base44Usage {
  file: string;
  line: number;
  code: string;
  pattern: string;
  suggestion: string;
}

export class Base44Detector {
  private base44Patterns = [
    {
      regex: /base44Entities\.(\w+)\.(\w+)\(/g,
      type: 'entity_method',
      suggestion: 'Replace with REST API call'
    },
    {
      regex: /base44Entities\.functions\.(\w+)\(/g,
      type: 'function_call',
      suggestion: 'Replace with REST API function call'
    },
    {
      regex: /base44Auth\.(\w+)\(/g,
      type: 'auth_method',
      suggestion: 'Replace with REST auth API'
    },
    {
      regex: /import.*base44.*from/g,
      type: 'import_statement',
      suggestion: 'Remove Base44 import, use REST client instead'
    },
    {
      regex: /@base44\/sdk/g,
      type: 'dependency',
      suggestion: 'Remove @base44/sdk dependency'
    }
  ];

  /**
   * Scan a file for Base44 usage
   */
  scanFile(filePath: string): Base44Usage[] {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const usages: Base44Usage[] = [];

      lines.forEach((line, index) => {
        this.base44Patterns.forEach(pattern => {
          const matches = line.match(pattern.regex);
          if (matches) {
            usages.push({
              file: filePath,
              line: index + 1,
              code: line.trim(),
              pattern: pattern.type,
              suggestion: pattern.suggestion
            });
          }
        });
      });

      return usages;
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Scan entire codebase for Base44 usage
   */
  async scanCodebase(basePath: string = 'src'): Promise<Base44Usage[]> {
    const allUsages: Base44Usage[] = [];

    // Find all TypeScript/JavaScript files
    const files = await this.findSourceFiles(basePath);

    for (const file of files) {
      const usages = this.scanFile(file);
      allUsages.push(...usages);
    }

    return allUsages;
  }

  /**
   * Find all source files in the codebase
   */
  private async findSourceFiles(basePath: string): Promise<string[]> {
    // This is a simplified version - in practice you'd use a proper glob library
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const files: string[] = [];

    // For now, return hardcoded list - replace with actual file discovery
    return [
      'src/api/migrationCompat.js',
      'src/utils/entitySwitcher.js',
      'src/hooks/useMigratedEntity.js',
      'src/components/migration/MigrationStatusDashboard.jsx',
      'src/components/migration/EntityMigrationControls.jsx'
    ];
  }

  /**
   * Generate migration suggestions for detected usage
   */
  async generateMigrationSuggestions(): Promise<void> {
    const usages = await this.scanCodebase();

    if (usages.length === 0) {
      console.log('✅ No Base44 usage detected in codebase');
      return;
    }

    console.log(`🔍 Found ${usages.length} Base44 usage instances:`);
    console.log('');

    // Group by file
    const byFile = usages.reduce((acc, usage) => {
      if (!acc[usage.file]) acc[usage.file] = [];
      acc[usage.file].push(usage);
      return acc;
    }, {} as Record<string, Base44Usage[]>);

    for (const [file, fileUsages] of Object.entries(byFile)) {
      console.log(`📁 ${file}:`);
      fileUsages.forEach(usage => {
        console.log(`  ${usage.line}: ${usage.code}`);
        console.log(`    💡 ${usage.suggestion}`);
      });
      console.log('');
    }

    // Auto-register features for migration
    const features = this.extractFeatures(usages);
    features.forEach(feature => {
      const id = featureRegistry.registerFeature(feature);
      console.log(`📝 Auto-registered feature: ${feature.name} (${id})`);
    });
  }

  /**
   * Extract features from Base44 usage
   */
  private extractFeatures(usages: Base44Usage[]): any[] {
    const features: any[] = [];
    const seen = new Set<string>();

    usages.forEach(usage => {
      let featureName = '';
      let base44Usage: string[] = [];

      if (usage.pattern === 'entity_method') {
        const match = usage.code.match(/base44Entities\.(\w+)\.(\w+)\(/);
        if (match) {
          featureName = `${match[1]}.${match[2]}`;
          base44Usage = [usage.code];
        }
      } else if (usage.pattern === 'function_call') {
        const match = usage.code.match(/base44Entities\.functions\.(\w+)\(/);
        if (match) {
          featureName = `function.${match[1]}`;
          base44Usage = [usage.code];
        }
      }

      if (featureName && !seen.has(featureName)) {
        seen.add(featureName);
        features.push({
          name: featureName,
          description: `Auto-detected Base44 usage: ${featureName}`,
          base44Usage,
          restEndpoints: [],
          dependencies: [],
          priority: 'medium',
          status: 'detected'
        });
      }
    });

    return features;
  }

  /**
   * Check if new Base44 usage was added (for CI/pre-commit)
   */
  async checkForNewUsage(): Promise<boolean> {
    const usages = await this.scanCodebase();

    if (usages.length > 0) {
      console.error('❌ Base44 usage detected! Please migrate to REST API:');
      usages.forEach(usage => {
        console.error(`  ${usage.file}:${usage.line} - ${usage.suggestion}`);
      });
      return false;
    }

    return true;
  }
}

// CLI interface
export const cli = {
  scan: async () => {
    const detector = new Base44Detector();
    await detector.generateMigrationSuggestions();
  },

  check: async () => {
    const detector = new Base44Detector();
    const clean = await detector.checkForNewUsage();
    process.exit(clean ? 0 : 1);
  }
};