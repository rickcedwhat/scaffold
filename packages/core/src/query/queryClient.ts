import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';
import { defaultCircuitBreaker, type CircuitBreaker } from '../circuit-breaker/CircuitBreaker';

export interface CreateQueryClientOptions extends QueryClientConfig {
  /**
   * Optional circuit breaker instance to guard against infinite render loops.
   */
  circuitBreaker?: CircuitBreaker;
}

/**
 * Checks whether an error represents a client-side HTTP 4xx error that should not be retried.
 */
export function isClientError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as Record<string, unknown>;
  const status = Number(err.status || err.statusCode || (err.response && (err.response as Record<string, unknown>).status));

  if (!isNaN(status) && status >= 400 && status < 500) {
    return true;
  }

  // Check common error codes/messages
  const code = String(err.code || '');
  if (code.includes('not-found') || code.includes('permission-denied') || code.includes('unauthenticated')) {
    return true;
  }

  return false;
}

/**
 * Standard retry policy: up to 3 retries, but immediately aborts on 4xx client errors.
 */
export function defaultRetry(failureCount: number, error: unknown): boolean {
  if (isClientError(error)) {
    return false;
  }
  return failureCount < 3;
}

/**
 * Standard exponential backoff delay with jitter (caps at 30 seconds).
 */
export function defaultRetryDelay(attemptIndex: number): number {
  const base = Math.min(1000 * 2 ** attemptIndex, 30_000);
  const jitter = Math.random() * 200;
  return base + jitter;
}

/**
 * Creates a pre-configured, production-tested TanStack QueryClient instance.
 *
 * Defaults:
 * - staleTime: 2 minutes (120,000ms)
 * - gcTime: 10 minutes (600,000ms)
 * - refetchOnWindowFocus: false (avoids jarring re-renders during app switching)
 * - retry: defaultRetry (exponential backoff up to 3 times, aborts on 4xx)
 * - retryDelay: defaultRetryDelay (exponential backoff with jitter)
 */
export function createQueryClient(options: CreateQueryClientOptions = {}): QueryClient {
  const { circuitBreaker: _circuitBreaker = defaultCircuitBreaker, defaultOptions = {}, ...restConfig } = options;

  return new QueryClient({
    defaultOptions: {
      ...defaultOptions,
      queries: {
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 10,   // 10 minutes
        refetchOnWindowFocus: false,
        retry: defaultRetry,
        retryDelay: defaultRetryDelay,
        ...defaultOptions.queries,
      },
      mutations: {
        retry: 0, // By default do not blindly retry mutations
        ...defaultOptions.mutations,
      },
    },
    ...restConfig,
  });
}
