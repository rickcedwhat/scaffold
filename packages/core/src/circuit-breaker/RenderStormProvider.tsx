import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  CircuitBreaker,
  defaultCircuitBreaker,
  type CircuitState,
  type RenderStormTripEvent,
  type CircuitBreakerEvent,
} from './CircuitBreaker';
import { RenderStormOverlay } from './RenderStormOverlay';

export interface RenderStormContextValue {
  breaker: CircuitBreaker;
  state: CircuitState;
  lastTrip: RenderStormTripEvent | null;
  velocity: number;
  reset: () => void;
  mute: (durationMs?: number) => void;
}

const RenderStormContext = createContext<RenderStormContextValue | null>(null);

export interface RenderStormProviderProps {
  children: ReactNode;
  /**
   * Custom CircuitBreaker instance. Defaults to defaultCircuitBreaker.
   */
  breaker?: CircuitBreaker;
  /**
   * Whether to mount the visual diagnostic overlay when tripped.
   * Defaults to true in development.
   */
  showOverlay?: boolean;
}

export const RenderStormProvider: React.FC<RenderStormProviderProps> = ({
  children,
  breaker = defaultCircuitBreaker,
  showOverlay = true,
}) => {
  const [state, setState] = useState<CircuitState>(breaker.getState());
  const [lastTrip, setLastTrip] = useState<RenderStormTripEvent | null>(breaker.getLastTrip());
  const [velocity, setVelocity] = useState<number>(breaker.getVelocity());

  useEffect(() => {
    const unsubscribe = breaker.subscribe((event: CircuitBreakerEvent) => {
      setState(event.state);
      setLastTrip(event.tripEvent);
      setVelocity(breaker.getVelocity());
    });

    // Periodic velocity sampling for meters & devtools
    const interval = setInterval(() => {
      setVelocity(breaker.getVelocity());
      setState(breaker.getState());
    }, 250);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [breaker]);

  const value: RenderStormContextValue = {
    breaker,
    state,
    lastTrip,
    velocity,
    reset: () => breaker.reset(),
    mute: (durationMs) => breaker.mute(durationMs),
  };

  return (
    <RenderStormContext.Provider value={value}>
      {children}
      {showOverlay && <RenderStormOverlay breaker={breaker} />}
    </RenderStormContext.Provider>
  );
};

/**
 * Hook to access the active Render-Storm Circuit Breaker instance and live telemetry.
 */
export function useRenderStorm(): RenderStormContextValue {
  const ctx = useContext(RenderStormContext);
  if (!ctx) {
    // If used outside provider, fall back to defaultCircuitBreaker without throwing
    return {
      breaker: defaultCircuitBreaker,
      state: defaultCircuitBreaker.getState(),
      lastTrip: defaultCircuitBreaker.getLastTrip(),
      velocity: defaultCircuitBreaker.getVelocity(),
      reset: () => defaultCircuitBreaker.reset(),
      mute: (durationMs) => defaultCircuitBreaker.mute(durationMs),
    };
  }
  return ctx;
}
