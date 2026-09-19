import React, { useState, useEffect } from 'react';
import { useTheme } from '@scaffold/ui';
import {
  CircuitBreaker,
  defaultCircuitBreaker,
  type RenderStormTripEvent,
  type CircuitBreakerEvent,
} from './CircuitBreaker';

export interface RenderStormOverlayProps {
  /**
   * Custom CircuitBreaker instance to monitor.
   * Defaults to defaultCircuitBreaker.
   */
  breaker?: CircuitBreaker;
  /**
   * Controlled visibility override.
   */
  open?: boolean;
  /**
   * Callback fired when manually dismissed or reset.
   */
  onClose?: () => void;
}

export const RenderStormOverlay: React.FC<RenderStormOverlayProps> = ({
  breaker = defaultCircuitBreaker,
  open: controlledOpen,
  onClose,
}) => {
  const { colors, tokens } = useTheme();
  const [internalTrip, setInternalTrip] = useState<RenderStormTripEvent | null>(
    breaker.getLastTrip()
  );
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = breaker.subscribe((event: CircuitBreakerEvent) => {
      if (event.type === 'trip') {
        setInternalTrip(event.tripEvent);
        setIsDismissed(false);
      } else if (event.type === 'reset') {
        setInternalTrip(null);
        setIsDismissed(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [breaker]);

  const activeTrip =
    controlledOpen === false
      ? null
      : controlledOpen === true
        ? breaker.getLastTrip() || internalTrip
        : internalTrip;
  const isVisible = Boolean(activeTrip && !isDismissed);

  if (!isVisible || !activeTrip) {
    return null;
  }

  const handleReset = () => {
    breaker.reset();
    setIsDismissed(false);
    onClose?.();
  };

  const handleMute = () => {
    breaker.mute(30000);
    setIsDismissed(true);
    onClose?.();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onClose?.();
  };

  return (
    <div
      role="alert"
      aria-label="Render-Storm Circuit Breaker Alert"
      style={{
        position: 'fixed',
        bottom: tokens.spacing[6],
        right: tokens.spacing[6],
        zIndex: 99999,
        maxWidth: '480px',
        width: 'calc(100vw - 3rem)',
        backgroundColor: colors.bg.surface,
        border: `2px solid ${colors.intent.danger.main}`,
        borderRadius: tokens.radii.lg,
        boxShadow: tokens.shadows.xl,
        padding: tokens.spacing[5],
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[3],
        fontFamily: tokens.typography.fontFamily.sans,
        color: colors.text.primary,
        boxSizing: 'border-box',
        animation: 'scaffold-slide-up 0.25s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: tokens.spacing[2],
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: tokens.radii.full,
              backgroundColor: colors.intent.danger.subtle,
              color: colors.intent.danger.main,
              fontWeight: tokens.typography.fontWeight.bold,
              fontSize: tokens.typography.fontSize.base,
            }}
          >
            ⚡
          </span>
          <span
            style={{
              fontWeight: tokens.typography.fontWeight.bold,
              fontSize: tokens.typography.fontSize.base,
              color: colors.intent.danger.main,
            }}
          >
            Render-Storm Circuit Breaker
          </span>
        </div>
        <span
          style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
            borderRadius: tokens.radii.sm,
            backgroundColor: colors.intent.danger.main,
            color: colors.intent.danger.text,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          TRIPPED
        </span>
      </div>

      {/* Main message */}
      <p
        style={{
          fontSize: tokens.typography.fontSize.sm,
          color: colors.text.secondary,
          margin: 0,
          lineHeight: tokens.typography.lineHeight.normal,
        }}
      >
        Runaway query or render loop detected. Outbound calls for this identifier have been halted
        to protect client and network stability.
      </p>

      {/* Key & Velocity Box */}
      <div
        style={{
          backgroundColor: colors.bg.subtle,
          border: `1px solid ${colors.border.subtle}`,
          borderRadius: tokens.radii.md,
          padding: tokens.spacing[3],
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[1],
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.fontSize.xs }}>
          <span style={{ color: colors.text.muted, fontWeight: tokens.typography.fontWeight.medium }}>
            Target Identifier:
          </span>
          <span style={{ color: colors.intent.danger.main, fontWeight: tokens.typography.fontWeight.bold }}>
            {activeTrip.velocity} calls / sec
          </span>
        </div>
        <code
          style={{
            fontFamily: tokens.typography.fontFamily.mono,
            fontSize: tokens.typography.fontSize.xs,
            color: colors.text.primary,
            wordBreak: 'break-all',
            backgroundColor: colors.bg.canvas,
            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
            borderRadius: tokens.radii.sm,
            border: `1px solid ${colors.border.default}`,
          }}
        >
          {activeTrip.key}
        </code>
        <div style={{ fontSize: tokens.typography.fontSize.xs, color: colors.text.muted, marginTop: '2px' }}>
          Threshold: {activeTrip.threshold} calls / {activeTrip.windowMs}ms window
        </div>
      </div>

      {/* Diagnostic Tip */}
      <div
        style={{
          fontSize: tokens.typography.fontSize.xs,
          color: colors.text.muted,
          lineHeight: tokens.typography.lineHeight.snug,
        }}
      >
        💡 <strong>Common fix:</strong> Verify that <code>useEffect</code> dependencies are stable,
        avoid creating inline object keys in <code>useQuery</code>, and ensure state setters are not
        called unconditionally in render bodies.
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: tokens.spacing[2],
          marginTop: tokens.spacing[1],
        }}
      >
        <button
          type="button"
          onClick={handleMute}
          style={{
            background: 'none',
            border: 'none',
            color: colors.text.secondary,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            cursor: 'pointer',
            padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
            borderRadius: tokens.radii.md,
          }}
        >
          Mute 30s
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: `1px solid ${colors.border.default}`,
            color: colors.text.primary,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            cursor: 'pointer',
            padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
            borderRadius: tokens.radii.md,
          }}
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={handleReset}
          style={{
            backgroundColor: colors.intent.primary.main,
            color: colors.intent.primary.text,
            border: 'none',
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            cursor: 'pointer',
            padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
            borderRadius: tokens.radii.md,
            boxShadow: tokens.shadows.sm,
          }}
        >
          Reset Circuit
        </button>
      </div>
    </div>
  );
};
