// Migration compatibility layer
// This replaces the direct Base44 client with a compatibility layer
// that can switch between Base44 and Supabase implementations

import { createClient } from '@base44/sdk';
import * as migrationCompat from './migrationCompat';

// Original Base44 client (kept for fallback)
const originalBase44 = createClient({
  appId: "6941fcfe62ca5b02677be083",
  requiresAuth: true
});

// Migration compatibility client
// This provides a seamless transition path
export const base44 = new Proxy(originalBase44, {
  get(target, prop) {
    // Route to appropriate implementation based on migration status
    if (prop === 'entities') {
      return migrationCompat;
    }
    if (prop === 'auth') {
      return migrationCompat.auth;
    }
    if (prop === 'functions') {
      return migrationCompat.functions;
    }
    if (prop === 'integrations') {
      return migrationCompat.integrations;
    }
    if (prop === 'agents') {
      return migrationCompat.agents;
    }

    // For other properties, use original Base44
    return target[prop];
  }
});

// Export migration utilities for development
export { migrationCompat };
