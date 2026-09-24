import { describe, it, expect } from 'vitest';
import {
  createQueryClient,
  isClientError,
  defaultRetry,
  defaultRetryDelay,
} from './queryClient';

describe('createQueryClient & query policies', () => {
  it('creates a QueryClient with standard production defaults', () => {
    const client = createQueryClient();
    const queryDefaults = client.getDefaultOptions().queries;

    expect(queryDefaults?.staleTime).toBe(120_000); // 2 minutes
    expect(queryDefaults?.gcTime).toBe(600_000);   // 10 minutes
    expect(queryDefaults?.refetchOnWindowFocus).toBe(false);
    expect(typeof queryDefaults?.retry).toBe('function');
    expect(typeof queryDefaults?.retryDelay).toBe('function');

    const mutationDefaults = client.getDefaultOptions().mutations;
    expect(mutationDefaults?.retry).toBe(0);
  });

  it('allows overriding default options', () => {
    const client = createQueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          refetchOnWindowFocus: true,
        },
      },
    });

    const queryDefaults = client.getDefaultOptions().queries;
    expect(queryDefaults?.staleTime).toBe(30_000);
    expect(queryDefaults?.refetchOnWindowFocus).toBe(true);
    expect(queryDefaults?.gcTime).toBe(600_000); // Retains default gcTime
  });

  describe('isClientError', () => {
    it('detects HTTP 4xx status codes', () => {
      expect(isClientError({ status: 400 })).toBe(true);
      expect(isClientError({ status: 404 })).toBe(true);
      expect(isClientError({ statusCode: 401 })).toBe(true);
      expect(isClientError({ response: { status: 403 } })).toBe(true);
    });

    it('does not classify 5xx or network errors as client errors', () => {
      expect(isClientError({ status: 500 })).toBe(false);
      expect(isClientError({ status: 503 })).toBe(false);
      expect(isClientError(new Error('Network disconnected'))).toBe(false);
      expect(isClientError(null)).toBe(false);
      expect(isClientError(undefined)).toBe(false);
    });

    it('treats HTTP 429 as retryable across supported status shapes', () => {
      expect(isClientError({ status: 429 })).toBe(false);
      expect(isClientError({ statusCode: 429 })).toBe(false);
      expect(isClientError({ response: { status: 429 } })).toBe(false);
    });

    it('detects common client error codes in messages', () => {
      expect(isClientError({ code: 'permission-denied' })).toBe(true);
      expect(isClientError({ code: 'not-found' })).toBe(true);
      expect(isClientError({ code: 'unauthenticated' })).toBe(true);
    });
  });

  describe('defaultRetry', () => {
    it('immediately aborts on 4xx client errors', () => {
      expect(defaultRetry(0, { status: 404 })).toBe(false);
      expect(defaultRetry(1, { status: 401 })).toBe(false);
      expect(defaultRetry(0, { code: 'not-found' })).toBe(false);
    });

    it('retries up to 3 times on server or network errors', () => {
      const serverErr = { status: 500 };
      expect(defaultRetry(0, serverErr)).toBe(true);
      expect(defaultRetry(1, serverErr)).toBe(true);
      expect(defaultRetry(2, serverErr)).toBe(true);
      expect(defaultRetry(3, serverErr)).toBe(false);
    });

    it('retries HTTP 429 up to the normal retry limit', () => {
      expect(defaultRetry(0, { status: 429 })).toBe(true);
      expect(defaultRetry(2, { status: 429 })).toBe(true);
      expect(defaultRetry(3, { status: 429 })).toBe(false);
    });
  });

  describe('defaultRetryDelay', () => {
    it('calculates exponential backoff with jitter', () => {
      const delay0 = defaultRetryDelay(0);
      expect(delay0).toBeGreaterThanOrEqual(1000);
      expect(delay0).toBeLessThanOrEqual(1300);

      const delay1 = defaultRetryDelay(1);
      expect(delay1).toBeGreaterThanOrEqual(2000);
      expect(delay1).toBeLessThanOrEqual(2300);

      const delay2 = defaultRetryDelay(2);
      expect(delay2).toBeGreaterThanOrEqual(4000);
      expect(delay2).toBeLessThanOrEqual(4300);

      // Capped at 30 seconds
      const delay10 = defaultRetryDelay(10);
      expect(delay10).toBeLessThanOrEqual(30_300);
    });
  });
});
