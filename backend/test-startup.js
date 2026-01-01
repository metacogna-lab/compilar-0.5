#!/usr/bin/env node

/**
 * Test Server Startup Script
 *
 * Starts the backend server for integration testing
 * Handles graceful shutdown and cleanup
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serverProcess = null;
let isShuttingDown = false;

// Handle graceful shutdown
function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n🛑 Received ${signal}, shutting down test server...`);

  if (serverProcess) {
    serverProcess.kill('SIGTERM');

    // Give it 5 seconds to shut down gracefully
    const timeout = setTimeout(() => {
      console.log('⚠️  Force killing server process...');
      serverProcess.kill('SIGKILL');
      process.exit(1);
    }, 5000);

    serverProcess.on('close', (code) => {
      clearTimeout(timeout);
      console.log(`✅ Test server shut down (exit code: ${code})`);
      process.exit(code);
    });
  } else {
    process.exit(0);
  }
}

// Register shutdown handlers
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGUSR2', () => shutdown('SIGUSR2')); // nodemon restart

async function startTestServer() {
  console.log('🚀 Starting Compilar backend test server...');

  // Set test environment variables
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    PORT: '3001',
    // Use test database if available, otherwise fallback to main
    SUPABASE_URL: process.env.TEST_SUPABASE_URL || process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    // Disable LLM services for faster test startup (they return stubs)
    LLM_PROVIDER: 'none',
    OPENAI_API_KEY: '',
    ANTHROPIC_API_KEY: '',
  };

  // Start the server using Bun
  serverProcess = spawn('bun', ['run', '--hot', 'src/index.ts'], {
    cwd: __dirname,
    env,
    stdio: ['inherit', 'inherit', 'inherit'],
  });

  // Handle server process events
  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

  serverProcess.on('close', (code, signal) => {
    if (!isShuttingDown) {
      console.log(`⚠️  Server process exited unexpectedly (code: ${code}, signal: ${signal})`);
      process.exit(code || 1);
    }
  });

  // Wait for server to be ready
  console.log('⏳ Waiting for server to be ready...');

  let retries = 30; // 30 seconds timeout
  while (retries > 0) {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Server is ready:', data);
        console.log('🎯 Test server running at http://localhost:3001');
        console.log('💡 Run your tests now, press Ctrl+C to stop');

        // Keep the process running
        return;
      }
    } catch (error) {
      // Server not ready yet
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    retries--;

    if (retries % 5 === 0) {
      console.log(`⏳ Still waiting... (${30 - retries}s)`);
    }
  }

  console.error('❌ Server failed to start within 30 seconds');
  serverProcess.kill('SIGTERM');
  process.exit(1);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

// Start the server
startTestServer().catch((error) => {
  console.error('❌ Failed to start test server:', error);
  process.exit(1);
});