#!/usr/bin/env node

/**
 * Integration Test Runner
 *
 * Starts test server, runs integration tests, and handles cleanup
 * Usage: bun run test-runner.js [--watch] [--verbose]
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const watchMode = args.includes('--watch');
const verbose = args.includes('--verbose');

let serverProcess = null;
let testProcess = null;
let isShuttingDown = false;

function log(message, force = false) {
  if (verbose || force) {
    console.log(`[TEST RUNNER] ${message}`);
  }
}

function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  log(`Received ${signal}, shutting down...`, true);

  // Kill test process first
  if (testProcess) {
    log('Stopping test process...', true);
    testProcess.kill('SIGTERM');
  }

  // Then kill server
  if (serverProcess) {
    log('Stopping server process...', true);
    serverProcess.kill('SIGTERM');

    // Give server 5 seconds to shut down gracefully
    const timeout = setTimeout(() => {
      log('Force killing server...', true);
      serverProcess.kill('SIGKILL');
      process.exit(1);
    }, 5000);

    serverProcess.on('close', (code) => {
      clearTimeout(timeout);
      log(`Server shut down (exit code: ${code})`, true);
      process.exit(code || 0);
    });
  } else {
    process.exit(0);
  }
}

// Register shutdown handlers
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

async function waitForServer(port = 3001, timeout = 30000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`http://localhost:${port}/health`);
      if (response.ok) {
        const data = await response.json();
        log(`Server ready: ${JSON.stringify(data)}`);
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  log(`Server failed to start within ${timeout/1000} seconds`, true);
  return false;
}

async function runTests() {
  log('Starting integration test runner...', true);

  try {
    // Start the test server
    log('Starting test server...');
    serverProcess = spawn('bun', ['run', 'test-startup.js'], {
      cwd: __dirname,
      stdio: verbose ? 'inherit' : ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' }
    });

    // Handle server output if not verbose
    if (!verbose) {
      serverProcess.stdout?.on('data', (data) => {
        const output = data.toString().trim();
        if (output.includes('Server is ready') || output.includes('Test server running')) {
          log('Server started successfully');
        }
      });

      serverProcess.stderr?.on('data', (data) => {
        const error = data.toString().trim();
        if (error) log(`Server error: ${error}`);
      });
    }

    // Wait for server to be ready
    const serverReady = await waitForServer();
    if (!serverReady) {
      throw new Error('Server failed to start');
    }

    // Run the tests
    log('Running integration tests...');
    const testArgs = ['test', 'tests/integration'];
    if (watchMode) {
      testArgs.push('--watch');
    }

    testProcess = spawn('bun', testArgs, {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    });

    // Handle test process completion
    return new Promise((resolve, reject) => {
      testProcess.on('close', (code, signal) => {
        log(`Tests completed (exit code: ${code}, signal: ${signal})`, true);

        if (code === 0) {
          log('✅ All tests passed!', true);
          resolve();
        } else {
          log('❌ Tests failed', true);
          reject(new Error(`Tests failed with exit code ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        log(`Test process error: ${error.message}`, true);
        reject(error);
      });
    });

  } catch (error) {
    log(`Error: ${error.message}`, true);
    throw error;
  } finally {
    if (!watchMode) {
      shutdown('test completion');
    }
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, true);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  log(`Unhandled rejection: ${reason}`, true);
  shutdown('unhandledRejection');
});

// Run the tests
runTests().catch((error) => {
  log(`Test runner failed: ${error.message}`, true);
  process.exit(1);
});