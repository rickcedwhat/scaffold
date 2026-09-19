import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '@scaffold/ui';
import { CircuitBreaker, RenderStormError } from './CircuitBreaker';
import { protectQueryFn, serializeQueryKey } from './queryWrapper';
import { RenderStormOverlay } from './RenderStormOverlay';
import { RenderStormProvider, useRenderStorm } from './RenderStormProvider';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      windowMs: 1000,
      maxVelocity: 5,
      cooldownMs: 200,
      isDev: true,
    });
  });

  it('starts in closed state with zero velocity', () => {
    expect(breaker.getState()).toBe('closed');
    expect(breaker.getVelocity()).toBe(0);
    expect(breaker.getLastTrip()).toBeNull();
  });

  it('allows calls below threshold and stays closed', async () => {
    const fn = vi.fn().mockResolvedValue('ok');

    for (let i = 0; i < 5; i++) {
      const res = await breaker.execute('test-key', fn);
      expect(res).toBe('ok');
    }

    expect(fn).toHaveBeenCalledTimes(5);
    expect(breaker.getState()).toBe('closed');
  });

  it('trips to open and halts execution when exceeding maxVelocity', async () => {
    const fn = vi.fn().mockResolvedValue('data');

    // 5 calls allowed
    for (let i = 0; i < 5; i++) {
      await breaker.execute('runaway-query', fn);
    }
    expect(fn).toHaveBeenCalledTimes(5);

    // 6th call exceeds maxVelocity of 5 -> Trips!
    await expect(breaker.execute('runaway-query', fn)).rejects.toThrow(RenderStormError);

    expect(breaker.getState()).toBe('open');
    expect(fn).toHaveBeenCalledTimes(5); // underlying function NOT called on tripped attempt

    const trip = breaker.getLastTrip();
    expect(trip).not.toBeNull();
    expect(trip?.key).toBe('runaway-query');
    expect(trip?.velocity).toBe(6);
    expect(trip?.threshold).toBe(5);

    // Subsequent calls are immediately blocked while open
    await expect(breaker.execute('runaway-query', fn)).rejects.toThrow(RenderStormError);
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it('resets state and call counts when reset() is called', async () => {
    const fn = vi.fn().mockResolvedValue('data');

    for (let i = 0; i < 5; i++) {
      await breaker.execute('storm', fn);
    }
    await expect(breaker.execute('storm', fn)).rejects.toThrow(RenderStormError);
    expect(breaker.getState()).toBe('open');

    // Reset
    breaker.reset();
    expect(breaker.getState()).toBe('closed');
    expect(breaker.getLastTrip()).toBeNull();
    expect(breaker.getVelocity('storm')).toBe(0);

    // Calls succeed again
    const res = await breaker.execute('storm', fn);
    expect(res).toBe('data');
  });

  it('supports cooldown transition to half-open and restores on success', async () => {
    const fn = vi.fn().mockResolvedValue('data');

    for (let i = 0; i < 6; i++) {
      try {
        await breaker.execute('cooldown-test', fn);
      } catch {
        // expected trip
      }
    }
    expect(breaker.getState()).toBe('open');

    // Wait for cooldownMs (200ms)
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(breaker.getState()).toBe('half-open');

    // Successful execution in half-open confirms recovery and closes circuit
    const res = await breaker.execute('cooldown-test', fn);
    expect(res).toBe('data');
    expect(breaker.getState()).toBe('closed');
  });

  it('bypasses enforcement in production mode (isDev = false)', async () => {
    const prodBreaker = new CircuitBreaker({
      windowMs: 1000,
      maxVelocity: 2,
      isDev: false,
    });

    const fn = vi.fn().mockResolvedValue('prod-data');

    // Make 10 calls, far exceeding maxVelocity of 2
    for (let i = 0; i < 10; i++) {
      const res = await prodBreaker.execute('prod-query', fn);
      expect(res).toBe('prod-data');
    }

    expect(fn).toHaveBeenCalledTimes(10);
    expect(prodBreaker.getState()).toBe('closed');
  });

  it('permits only one in-flight probe during half-open and rejects concurrent calls', async () => {
    const fn = vi.fn().mockResolvedValue('data');
    for (let i = 0; i < 6; i++) {
      try {
        await breaker.execute('probe-test', fn);
      } catch {
        // trip
      }
    }
    expect(breaker.getState()).toBe('open');
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(breaker.getState()).toBe('half-open');

    // Simulate in-flight pending probe
    let resolveProbe!: (val: string) => void;
    const probePromise = new Promise<string>((res) => {
      resolveProbe = res;
    });

    const firstCall = breaker.execute('probe-test', () => probePromise);
    // Second concurrent call should be rejected immediately because probe is in flight
    await expect(breaker.execute('probe-test', fn)).rejects.toThrow(RenderStormError);

    // Resolve first probe
    resolveProbe('ok');
    const firstResult = await firstCall;
    expect(firstResult).toBe('ok');
    expect(breaker.getState()).toBe('closed');
  });

  it('re-trips with a fresh trip event when half-open recovery fails', async () => {
    const fn = vi.fn().mockResolvedValue('data');
    for (let i = 0; i < 6; i++) {
      try {
        await breaker.execute('fail-recovery', fn);
      } catch {
        // trip
      }
    }
    expect(breaker.getState()).toBe('open');
    const initialTripTimestamp = breaker.getLastTrip()?.timestamp;

    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(breaker.getState()).toBe('half-open');

    // Recovery probe throws error
    const failingProbe = vi.fn().mockRejectedValue(new Error('backend failed'));
    await expect(breaker.execute('fail-recovery', failingProbe)).rejects.toThrow('backend failed');

    expect(breaker.getState()).toBe('open');
    expect(breaker.getLastTrip()?.timestamp).toBeGreaterThanOrEqual(initialTripTimestamp!);
  });

  it('normalizes velocity over non-standard windowMs', () => {
    const customBreaker = new CircuitBreaker({
      windowMs: 2000,
      maxVelocity: 5,
      isDev: true,
    });

    // 10 calls in a 2000ms window = 5 calls/sec. Should be allowed.
    for (let i = 0; i < 10; i++) {
      const res = customBreaker.recordCall('key');
      expect(res.allowed).toBe(true);
    }

    // 11th call = 11 / 2 = 5.5 calls/sec > maxVelocity (5). Should trip.
    const tripRes = customBreaker.recordCall('key');
    expect(tripRes.allowed).toBe(false);
    expect(customBreaker.getState()).toBe('open');
  });

  it('respects mute duration and ignores trips during mute', async () => {
    breaker.mute(1000);
    expect(breaker.isMuted()).toBe(true);

    const fn = vi.fn().mockResolvedValue('muted-data');

    // Even with 20 calls, breaker will not trip while muted
    for (let i = 0; i < 20; i++) {
      await breaker.execute('muted-key', fn);
    }

    expect(fn).toHaveBeenCalledTimes(20);
    expect(breaker.getState()).toBe('closed');
  });
});

describe('protectQueryFn', () => {
  it('wraps query function with circuit breaker protection', async () => {
    const testBreaker = new CircuitBreaker({
      windowMs: 1000,
      maxVelocity: 3,
      isDev: true,
    });

    const queryMock = vi.fn().mockResolvedValue({ id: 1 });
    const wrapped = protectQueryFn(queryMock, ['users', 'list'], testBreaker);

    await wrapped();
    await wrapped();
    await wrapped();
    expect(queryMock).toHaveBeenCalledTimes(3);

    // 4th call exceeds velocity of 3
    await expect(wrapped()).rejects.toThrow(RenderStormError);
    expect(queryMock).toHaveBeenCalledTimes(3);
  });

  it('serializes undefined and non-standard query keys stably', () => {
    expect(serializeQueryKey(undefined)).toBe('undefined');
    expect(serializeQueryKey('simple-key')).toBe('simple-key');
    expect(serializeQueryKey(['users', 1])).toBe('["users",1]');
  });
});

describe('RenderStormOverlay', () => {
  it('renders diagnostic alert when breaker trips and clears on reset', async () => {
    const testBreaker = new CircuitBreaker({
      windowMs: 1000,
      maxVelocity: 2,
      isDev: true,
    });

    render(
      <ThemeProvider>
        <RenderStormOverlay breaker={testBreaker} />
      </ThemeProvider>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Trip the breaker
    act(() => {
      for (let i = 0; i < 3; i++) {
        testBreaker.recordCall('runaway-component-key');
      }
    });

    // Alert appears
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText('Render-Storm Circuit Breaker')).toBeInTheDocument();
    expect(screen.getByText('TRIPPED')).toBeInTheDocument();
    expect(screen.getByText('runaway-component-key')).toBeInTheDocument();

    // Click Reset Circuit
    const resetBtn = screen.getByRole('button', { name: 'Reset Circuit' });
    fireEvent.click(resetBtn);

    expect(testBreaker.getState()).toBe('closed');
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('honors open={false} as a controlled visibility override even after trip', async () => {
    const testBreaker = new CircuitBreaker({
      windowMs: 1000,
      maxVelocity: 2,
      isDev: true,
    });

    const { rerender } = render(
      <ThemeProvider>
        <RenderStormOverlay breaker={testBreaker} open={false} />
      </ThemeProvider>
    );

    // Trip the breaker
    act(() => {
      for (let i = 0; i < 3; i++) {
        testBreaker.recordCall('test-forced-close');
      }
    });

    expect(testBreaker.getState()).toBe('open');
    // Still not rendered because open={false} overrides
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Rerender with open={true} to verify explicit open
    rerender(
      <ThemeProvider>
        <RenderStormOverlay breaker={testBreaker} open={true} />
      </ThemeProvider>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('RenderStormProvider & useRenderStorm', () => {
  it('provides breaker state and context value', () => {
    const testBreaker = new CircuitBreaker({ isDev: true });

    function TestConsumer() {
      const { state, velocity } = useRenderStorm();
      return (
        <div>
          <span>State: {state}</span>
          <span>Velocity: {velocity}</span>
        </div>
      );
    }

    render(
      <ThemeProvider>
        <RenderStormProvider breaker={testBreaker} showOverlay={false}>
          <TestConsumer />
        </RenderStormProvider>
      </ThemeProvider>
    );

    expect(screen.getByText('State: closed')).toBeInTheDocument();
    expect(screen.getByText('Velocity: 0')).toBeInTheDocument();
  });
});
