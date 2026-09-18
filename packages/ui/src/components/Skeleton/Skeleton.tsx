import React, { type HTMLAttributes, forwardRef } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

export interface SkeletonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  animation?: SkeletonAnimation;
  'aria-label'?: string;
}

const SKELETON_STYLE_ID = 'scaffold-skeleton-keyframes';

function ensureSkeletonKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SKELETON_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = SKELETON_STYLE_ID;
  style.innerHTML = `
    @keyframes scaffold-skeleton-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    @keyframes scaffold-skeleton-wave {
      0% { transform: translateX(-100%); }
      60%, 100% { transform: translateX(100%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .scaffold-skeleton-animated,
      .scaffold-skeleton-animated * {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function formatDimension(dim?: string | number): string | undefined {
  if (dim === undefined) return undefined;
  return typeof dim === 'number' ? `${dim}px` : dim;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      lines = 1,
      animation = 'pulse',
      'aria-label': ariaLabel = 'Loading...',
      ...props
    },
    ref
  ) => {
    const { colors, tokens } = useTheme();

    ensureSkeletonKeyframes();

    const borderRadius = {
      text: tokens.radii.sm,
      circular: tokens.radii.full,
      rectangular: tokens.radii.none,
      rounded: tokens.radii.lg,
    }[variant];

    const defaultHeight = {
      text: '1em',
      circular: formatDimension(width) || tokens.spacing[10],
      rectangular: tokens.spacing[12],
      rounded: tokens.spacing[12],
    }[variant];

    const defaultWidth = {
      text: '100%',
      circular: formatDimension(height) || tokens.spacing[10],
      rectangular: '100%',
      rounded: '100%',
    }[variant];

    const resolvedWidth = formatDimension(width) || defaultWidth;
    const resolvedHeight = formatDimension(height) || defaultHeight;

    const baseStyle: React.CSSProperties = {
      backgroundColor: colors.bg.subtle,
      borderRadius,
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
    };

    const animationStyle: React.CSSProperties = {
      pulse: {
        animation: 'scaffold-skeleton-pulse 1.8s ease-in-out infinite',
      },
      wave: {},
      none: {},
    }[animation];

    // If multi-line text is requested
    if (variant === 'text' && lines > 1) {
      const lineElements = Array.from({ length: lines }).map((_, index) => {
        const isLastLine = index === lines - 1;
        // The last line naturally tapers to ~65% width for realistic paragraph skeleton flow
        const lineWidth = isLastLine ? '65%' : '100%';

        return (
          <div
            key={index}
            className={animation !== 'none' ? 'scaffold-skeleton-animated' : undefined}
            style={{
              ...baseStyle,
              ...animationStyle,
              width: lineWidth,
              height: resolvedHeight,
              marginBottom: isLastLine ? 0 : tokens.spacing[2],
            }}
          >
            {animation === 'wave' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(90deg, transparent, ${colors.border.subtle}, transparent)`,
                  animation: 'scaffold-skeleton-wave 1.6s linear infinite',
                }}
              />
            )}
          </div>
        );
      });

      return (
        <div
          ref={ref}
          role="status"
          aria-busy="true"
          aria-label={ariaLabel}
          style={{ width: resolvedWidth, boxSizing: 'border-box' }}
          {...props}
        >
          {lineElements}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-label={ariaLabel}
        className={animation !== 'none' ? 'scaffold-skeleton-animated' : undefined}
        style={{
          ...baseStyle,
          ...animationStyle,
          width: resolvedWidth,
          height: resolvedHeight,
        }}
        {...props}
      >
        {animation === 'wave' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(90deg, transparent, ${colors.border.subtle}, transparent)`,
              animation: 'scaffold-skeleton-wave 1.6s linear infinite',
            }}
          />
        )}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';
