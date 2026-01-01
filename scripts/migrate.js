#!/usr/bin/env node

/**
 * Migration CLI Tool
 *
 * Provides commands for managing Base44 to REST API migration
 */

import { featureRegistry } from '../src/utils/migration/featureRegistry.ts';
import { Base44Detector } from '../src/utils/migration/base44Detector.ts';

const [,, command, ...args] = process.argv;

async function main() {
  try {
    switch (command) {
      case 'register':
        const [name, description, ...base44Usage] = args;
        const id = featureRegistry.register({
          name,
          description,
          base44Usage,
          restEndpoints: [],
          dependencies: [],
          priority: 'medium',
          status: 'detected'
        });
        console.log(`✅ Registered feature: ${name} (${id})`);
        break;

      case 'generate':
        const [featureId] = args;
        const script = featureRegistry.generateMigrationScript(featureId);
        if (script) {
          console.log('Generated migration script:');
          console.log(script);
        } else {
          console.log('❌ No suitable template found');
        }
        break;

      case 'list':
        const features = featureRegistry.getFeatures();
        if (features.length === 0) {
          console.log('No features registered');
        } else {
          console.table(features.map(f => ({
            name: f.name,
            status: f.status,
            priority: f.priority,
            created: f.createdAt.toISOString().split('T')[0]
          })));
        }
        break;

      case 'stats':
        const stats = featureRegistry.getMigrationStats();
        console.log('📊 Migration Statistics:');
        console.log(`   Total Features: ${stats.total}`);
        console.log(`   Migrated: ${stats.migrated}`);
        console.log(`   In Progress: ${stats.inProgress}`);
        console.log(`   Failed: ${stats.failed}`);
        console.log(`   Pending: ${stats.pending}`);
        break;

      case 'scan':
        const detector = new Base44Detector();
        await detector.generateMigrationSuggestions();
        break;

      case 'check':
        const checkDetector = new Base44Detector();
        const clean = await checkDetector.checkForNewUsage();
        if (!clean) {
          process.exit(1);
        }
        break;

      default:
        console.log('Usage: migrate <command> [args...]');
        console.log('');
        console.log('Commands:');
        console.log('  register <name> <description> [base44Usage...]  Register a new feature');
        console.log('  generate <featureId>                          Generate migration script');
        console.log('  list                                          List all features');
        console.log('  stats                                         Show migration statistics');
        console.log('  scan                                          Scan codebase for Base44 usage');
        console.log('  check                                         Check for new Base44 usage (CI)');
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();