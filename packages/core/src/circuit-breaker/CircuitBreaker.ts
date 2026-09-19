export type CircuitState = 'closed' | 'open' | 'half-open';

export interface RenderStormTripEvent {
  key: string;
  velocity: number;
  threshold: number;
  windowMs: number;
  timestamp: number;
  stack?: string;
  circuitState: CircuitState;
}

export class RenderStormError extends Error {
  readonly tripEvent: RenderStormTripEvent;

  constructor(tripEvent: RenderStormTripEvent) {
    super(
      `[Render-Storm Circuit Breaker] Runaway query/render loop detected for "${tripEvent.key}". ` +
        `Recorded velocity: ${tripEvent.velocity} calls/sec (threshold: ${tripEvent.threshold} calls/sec in ${tripEvent.windowMs}ms). ` +
        `Outbound calls halted to protect client and network stability.`
    );
    this.name = 'RenderStormError';
    this.tripEvent = tripEvent;
    Object.setPrototypeOf(this, RenderStormError.prototype);
  }
}

export type CircuitBreakerEventType = 'trip' | 'reset' | 'mute' | 'state-change';

export interface CircuitBreakerEvent {
  type: CircuitBreakerEventType;
  state: CircuitState;
  tripEvent: RenderStormTripEvent | null;
  timestamp: number;
}

export interface CircuitBreakerOptions {
  /**
   * Rolling window in milliseconds to track call velocity.
   * @default 1000
   */
  windowMs?: number;
  /**
   * Maximum allowed calls within the rolling window before tripping.
   * @default 10
   */
  maxVelocity?: number;
  /**
   * Cooldown period in milliseconds before testing half-open recovery.
   * @default 5000
   */
  cooldownMs?: number;
  /**
   * Whether circuit breaker enforcement is active.
   * Defaults to development mode (`NODE_ENV !== 'production'`).
   */
  isDev?: boolean;
}

function resolveIsDev(explicit?: boolean): boolean {
  if (explicit !== undefined) return explicit;
  try {
    // Browser / modern ESM bundlers (Vite, Rollup, etc.)
    if (
      typeof import.meta !== 'undefined' &&
      (import.meta as { env?: { DEV?: boolean } }).env?.DEV !== undefined
    ) {
      return (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;
    }
  } catch {
    // Ignore environments where import.meta is restricted
  }
  // Node / common bundler replacement - default safe (only true if NODE_ENV === 'development' or 'test')
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  }
  return false;
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private readonly windowMs: number;
  private readonly maxVelocity: number;
  private readonly cooldownMs: number;
  private readonly isDev: boolean;

  private callTimestamps: Map<string, number[]> = new Map();
  private lastTrip: RenderStormTripEvent | null = null;
  private trippedAt: number | null = null;
  private isProbing: boolean = false;
  private mutedUntil: number = 0;
  private listeners: Set<(event: CircuitBreakerEvent) => void> = new Set();

  constructor(options: CircuitBreakerOptions = {}) {
    this.windowMs = options.windowMs ?? 1000;
    this.maxVelocity = options.maxVelocity ?? 10;
    this.cooldownMs = options.cooldownMs ?? 5000;
    this.isDev = resolveIsDev(options.isDev);
  }

  getState(): CircuitState {
    this.checkCooldownTransition();
    return this.state;
  }

  getLastTrip(): RenderStormTripEvent | null {
    return this.lastTrip;
  }

  getVelocity(key?: string): number {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    if (key) {
      const timestamps = this.callTimestamps.get(key) || [];
      const valid = timestamps.filter((t) => t >= cutoff);
      return Math.round((valid.length / (this.windowMs / 1000)) * 10) / 10;
    }

    // Aggregate velocity across all tracked keys
    let totalCalls = 0;
    for (const timestamps of this.callTimestamps.values()) {
      totalCalls += timestamps.filter((t) => t >= cutoff).length;
    }
    return Math.round((totalCalls / (this.windowMs / 1000)) * 10) / 10;
  }

  isMuted(): boolean {
    return Date.now() < this.mutedUntil;
  }

  subscribe(listener: (event: CircuitBreakerEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(type: CircuitBreakerEventType) {
    const event: CircuitBreakerEvent = {
      type,
      state: this.state,
      tripEvent: this.lastTrip,
      timestamp: Date.now(),
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('[CircuitBreaker] Listener error:', err);
      }
    }
  }

  private checkCooldownTransition() {
    if (this.state === 'open' && this.trippedAt !== null) {
      if (Date.now() - this.trippedAt >= this.cooldownMs) {
        this.state = 'half-open';
        this.isProbing = false;
        this.notify('state-change');
      }
    }
  }

  /**
   * Records an invocation for the specified key.
   * Returns whether the call is allowed and current velocity.
   */
  recordCall(key: string, stack?: string): { allowed: boolean; velocity: number } {
    if (!this.isDev) {
      return { allowed: true, velocity: 0 };
    }

    if (this.isMuted()) {
      return { allowed: true, velocity: 0 };
    }

    this.checkCooldownTransition();

    if (this.state === 'open') {
      return { allowed: false, velocity: this.getVelocity(key) };
    }

    if (this.state === 'half-open') {
      // In half-open state, permit a trial request without immediately re-tripping on old window timestamps
      return { allowed: true, velocity: 1 };
    }

    const now = Date.now();
    const cutoff = now - this.windowMs;
    const existing = this.callTimestamps.get(key) || [];
    const valid = existing.filter((t) => t >= cutoff);
    valid.push(now);
    this.callTimestamps.set(key, valid);

    const velocity = valid.length / (this.windowMs / 1000);

    // Check if threshold exceeded
    if (velocity > this.maxVelocity) {
      this.state = 'open';
      this.trippedAt = now;
      this.lastTrip = {
        key,
        velocity,
        threshold: this.maxVelocity,
        windowMs: this.windowMs,
        timestamp: now,
        stack: stack || new Error().stack,
        circuitState: 'open',
      };
      this.notify('trip');
      return { allowed: false, velocity };
    }

    return { allowed: true, velocity };
  }

  /**
   * Executes a protected asynchronous or synchronous function.
   * Rejects immediately with RenderStormError if circuit is open or exceeds threshold.
   */
  async execute<T>(key: string, fn: () => Promise<T> | T, stack?: string): Promise<T> {
    if (!this.isDev) {
      return fn();
    }

    if (this.isMuted()) {
      return fn();
    }

    this.checkCooldownTransition();

    if (this.state === 'open') {
      throw new RenderStormError(
        this.lastTrip || {
          key,
          velocity: this.getVelocity(key),
          threshold: this.maxVelocity,
          windowMs: this.windowMs,
          timestamp: Date.now(),
          stack,
          circuitState: 'open',
        }
      );
    }

    if (this.state === 'half-open') {
      if (this.isProbing) {
        throw new RenderStormError(
          this.lastTrip || {
            key,
            velocity: this.getVelocity(key),
            threshold: this.maxVelocity,
            windowMs: this.windowMs,
            timestamp: Date.now(),
            stack,
            circuitState: 'half-open',
          }
        );
      }
      this.isProbing = true;
    }

    const check = this.recordCall(key, stack);
    if (!check.allowed) {
      throw new RenderStormError(this.lastTrip!);
    }

    try {
      const result = await fn();
      if (this.state === 'half-open') {
        // Successful call in half-open state confirms recovery
        this.state = 'closed';
        this.lastTrip = null;
        this.trippedAt = null;
        this.isProbing = false;
        this.callTimestamps.clear();
        this.notify('state-change');
      }
      return result;
    } catch (error) {
      if (this.state === 'half-open') {
        // Failed recovery re-trips the circuit
        const now = Date.now();
        this.state = 'open';
        this.trippedAt = now;
        this.isProbing = false;
        this.lastTrip = {
          key,
          velocity: check.velocity,
          threshold: this.maxVelocity,
          windowMs: this.windowMs,
          timestamp: now,
          stack: stack || new Error().stack,
          circuitState: 'open',
        };
        this.notify('trip');
      }
      throw error;
    }
  }

  /**
   * Manually resets the circuit breaker, clearing all history and closing the circuit.
   */
  reset(): void {
    this.state = 'closed';
    this.lastTrip = null;
    this.trippedAt = null;
    this.isProbing = false;
    this.callTimestamps.clear();
    this.notify('reset');
  }

  /**
   * Mutes breaker tripping for the given duration in milliseconds.
   */
  mute(durationMs = 30000): void {
    this.mutedUntil = Date.now() + durationMs;
    this.notify('mute');
  }
}

// Global singleton instance for shared app-wide query protection
export const defaultCircuitBreaker = new CircuitBreaker();
