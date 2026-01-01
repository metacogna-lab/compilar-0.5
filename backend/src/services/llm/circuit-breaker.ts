/**
 * Circuit Breaker Pattern for LLM Providers
 *
 * Prevents cascading failures by temporarily stopping requests to failing providers
 */

/// <reference types="node" />

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, requests blocked
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number;    // Failures before opening circuit
  recoveryTimeout: number;     // Time before trying HALF_OPEN (ms)
  monitoringPeriod: number;    // How often to check state (ms)
  successThreshold: number;    // Successes needed to close circuit
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private lastSuccessTime = 0;
  private totalRequests = 0;
  private totalFailures = 0;
  private totalSuccesses = 0;

  private config: CircuitBreakerConfig;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 10000, // 10 seconds
      successThreshold: 3,
      ...config
    };

    // Start monitoring
    this.startMonitoring();
  }

  /**
   * Execute operation through circuit breaker
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptRecovery()) {
        this.state = CircuitState.HALF_OPEN;
        console.log('Circuit breaker moving to HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Record successful operation
   */
  private onSuccess(): void {
    this.successes++;
    this.totalSuccesses++;
    this.lastSuccessTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successes >= this.config.successThreshold) {
        this.closeCircuit();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failures = 0;
    }
  }

  /**
   * Record failed operation
   */
  private onFailure(): void {
    this.failures++;
    this.totalFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Single failure in HALF_OPEN reopens circuit
      this.openCircuit();
    } else if (this.state === CircuitState.CLOSED &&
               this.failures >= this.config.failureThreshold) {
      this.openCircuit();
    }
  }

  /**
   * Check if we should attempt recovery from OPEN state
   */
  private shouldAttemptRecovery(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.recoveryTimeout;
  }

  /**
   * Open the circuit (stop accepting requests)
   */
  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.successes = 0;
    console.warn(`Circuit breaker opened after ${this.failures} failures`);
  }

  /**
   * Close the circuit (resume normal operation)
   */
  private closeCircuit(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    console.log('Circuit breaker closed - service recovered');
  }

  /**
   * Start monitoring interval
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.checkState();
    }, this.config.monitoringPeriod);
  }

  /**
   * Periodic state checks
   */
  private checkState(): void {
    // Could implement health checks here in the future
    // For now, just log stats periodically
    if (this.totalRequests > 0) {
      const failureRate = this.totalFailures / this.totalRequests;
      if (failureRate > 0.5) {
        console.warn(`High failure rate detected: ${(failureRate * 100).toFixed(1)}%`);
      }
    }
  }

  /**
   * Get current statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    };
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = 0;
    this.lastSuccessTime = 0;
    console.log('Circuit breaker manually reset');
  }

  /**
   * Force open the circuit (for testing)
   */
  forceOpen(): void {
    this.openCircuit();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }
}

/**
 * Provider-specific circuit breaker factory
 */
export class CircuitBreakerManager {
  private breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create circuit breaker for a provider
   */
  getBreaker(providerName: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(providerName)) {
      this.breakers.set(providerName, new CircuitBreaker(config));
    }
    return this.breakers.get(providerName)!;
  }

  /**
   * Get all circuit breaker stats
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Cleanup all resources
   */
  destroy(): void {
    for (const breaker of this.breakers.values()) {
      breaker.destroy();
    }
    this.breakers.clear();
  }
}

// Global circuit breaker manager
export const circuitBreakerManager = new CircuitBreakerManager();

// Graceful shutdown
process.on('SIGINT', () => {
  circuitBreakerManager.destroy();
});

process.on('SIGTERM', () => {
  circuitBreakerManager.destroy();
});