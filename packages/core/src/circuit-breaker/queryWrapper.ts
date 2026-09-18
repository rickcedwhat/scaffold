import { defaultCircuitBreaker, CircuitBreaker } from './CircuitBreaker';

/**
 * Normalizes and stably serializes a query key into a readable identifier.
 */
export function serializeQueryKey(queryKey: unknown): string {
  if (typeof queryKey === 'string') return queryKey;
  try {
    return JSON.stringify(queryKey);
  } catch {
    return String(queryKey);
  }
}

/**
 * Wraps a TanStack Query queryFn with Render-Storm Circuit Breaker protection.
 * If runaway re-renders or unstable effects invoke this query faster than
 * the safe velocity threshold, the circuit trips and halts outbound network requests.
 */
export function protectQueryFn<TData, TQueryKey extends readonly unknown[] = readonly unknown[]>(
  queryFn: (context?: unknown) => Promise<TData>,
  queryKey: TQueryKey,
  breaker: CircuitBreaker = defaultCircuitBreaker
): (context?: unknown) => Promise<TData> {
  const keyIdentifier = serializeQueryKey(queryKey);

  return async (context?: unknown) => {
    return breaker.execute(keyIdentifier, () => queryFn(context));
  };
}

/**
 * Returns defaultOptions for a TanStack QueryClient with automatic queryFn wrapping.
 */
export function withCircuitBreakerQueryOptions(
  _breaker: CircuitBreaker = defaultCircuitBreaker
) {
  return {
    queries: {
      queryFn: async (context: { queryKey: readonly unknown[] }) => {
        throw new Error(
          `[CircuitBreaker] No queryFn provided for queryKey: ${serializeQueryKey(context.queryKey)}`
        );
      },
    },
  };
}
