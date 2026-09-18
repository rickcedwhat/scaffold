import React, {
  forwardRef,
  useState,
  useEffect,
  lazy,
  Suspense,
  type ReactNode,
  type HTMLAttributes,
  Component,
  type ErrorInfo,
} from 'react';
import { useTheme } from '../../theme/ThemeContext';

interface LottiePlayerProps {
  animationData?: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

const LazyLottie = lazy(async () => {
  const mod = await import('lottie-react');
  return { default: mod.Lottie as unknown as React.ComponentType<LottiePlayerProps> };
});

export type IllustrationPreset = 'search' | 'empty' | 'not-found' | 'error' | 'success';
export type IllustrationSize = 'sm' | 'md' | 'lg' | 'xl';

export interface StatusIllustrationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> {
  preset?: IllustrationPreset;
  size?: IllustrationSize;
  animationData?: Record<string, unknown>;
  loop?: boolean;
  autoplay?: boolean;
  fallback?: ReactNode;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

const ILLUSTRATION_STYLE_ID = 'scaffold-illustration-keyframes';

function ensureIllustrationKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(ILLUSTRATION_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = ILLUSTRATION_STYLE_ID;
  style.innerHTML = `
    @keyframes scaffold-illust-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    @keyframes scaffold-illust-pulse {
      0%, 100% { transform: scale(1); opacity: 0.85; }
      50% { transform: scale(1.06); opacity: 1; }
    }
    @keyframes scaffold-illust-sparkle {
      0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
      50% { opacity: 1; transform: scale(1.2) rotate(15deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .scaffold-illust-animated * {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Error boundary to gracefully catch any canvas/Lottie runtime rendering issues
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class LottieErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Graceful fallback without throwing unhandled exceptions
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const StatusIllustration = forwardRef<HTMLDivElement, StatusIllustrationProps>(
  (
    {
      preset = 'empty',
      size = 'md',
      animationData,
      loop = true,
      autoplay = true,
      fallback,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden,
      ...props
    },
    ref
  ) => {
    const { colors, tokens } = useTheme();
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
      return true;
    });

    useEffect(() => {
      ensureIllustrationKeyframes();
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener?.('change', listener);
        return () => mediaQuery.removeEventListener?.('change', listener);
      }
    }, []);

    const dimension = tokens.layout.illustrationSize[size] || tokens.layout.illustrationSize.md;

    // Built-in SVG presets designed to fit perfectly into the design system
    const renderPresetSvg = () => {
      switch (preset) {
        case 'search':
          return (
            <svg
              viewBox="0 0 120 120"
              fill="none"
              style={{ width: '100%', height: '100%' }}
              className="scaffold-illust-animated"
            >
              <circle
                cx="60"
                cy="60"
                r="44"
                fill={colors.bg.subtle}
                stroke={colors.border.subtle}
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <g style={{ animation: prefersReducedMotion ? 'none' : 'scaffold-illust-float 3s ease-in-out infinite' }}>
                <circle
                  cx="54"
                  cy="52"
                  r="24"
                  fill={colors.bg.surface}
                  stroke={colors.intent.primary.main}
                  strokeWidth="3.5"
                />
                <line
                  x1="71"
                  y1="69"
                  x2="88"
                  y2="86"
                  stroke={colors.intent.primary.main}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M44 42 A 14 14 0 0 1 64 42"
                  stroke={colors.text.muted}
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </g>
              <g style={{ animation: prefersReducedMotion ? 'none' : 'scaffold-illust-sparkle 2.4s ease-in-out infinite' }}>
                <circle cx="86" cy="36" r="3" fill={colors.intent.primary.main} />
                <circle cx="32" cy="74" r="2" fill={colors.text.muted} />
              </g>
            </svg>
          );

        case 'empty':
          return (
            <svg
              viewBox="0 0 120 120"
              fill="none"
              style={{ width: '100%', height: '100%' }}
              className="scaffold-illust-animated"
            >
              <rect
                x="20"
                y="52"
                width="80"
                height="44"
                rx={tokens.radii.lg}
                fill={colors.bg.subtle}
                stroke={colors.border.default}
                strokeWidth="1.5"
              />
              <g style={{ animation: prefersReducedMotion ? 'none' : 'scaffold-illust-float 3.5s ease-in-out infinite' }}>
                <rect
                  x="35"
                  y="26"
                  width="50"
                  height="36"
                  rx={tokens.radii.md}
                  fill={colors.bg.surface}
                  stroke={colors.border.strong}
                  strokeWidth="1.5"
                />
                <line
                  x1="45"
                  y1="38"
                  x2="75"
                  y2="38"
                  stroke={colors.text.muted}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="45"
                  y1="46"
                  x2="65"
                  y2="46"
                  stroke={colors.text.muted}
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </g>
              <path
                d="M20 56 L60 70 L100 56"
                stroke={colors.border.subtle}
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          );

        case 'not-found':
          return (
            <svg
              viewBox="0 0 120 120"
              fill="none"
              style={{ width: '100%', height: '100%' }}
              className="scaffold-illust-animated"
            >
              <ellipse
                cx="60"
                cy="60"
                rx="48"
                ry="18"
                fill="none"
                stroke={colors.border.subtle}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                transform="rotate(-15 60 60)"
              />
              <g style={{ animation: prefersReducedMotion ? 'none' : 'scaffold-illust-float 2.8s ease-in-out infinite' }}>
                <circle
                  cx="60"
                  cy="56"
                  r="28"
                  fill={colors.bg.surface}
                  stroke={colors.intent.primary.main}
                  strokeWidth="2"
                />
                <text
                  x="60"
                  y="62"
                  textAnchor="middle"
                  fill={colors.intent.primary.main}
                  fontSize="16"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                >
                  404
                </text>
              </g>
              <g style={{ animation: prefersReducedMotion ? 'none' : 'scaffold-illust-sparkle 3s ease-in-out infinite' }}>
                <circle cx="28" cy="40" r="2.5" fill={colors.text.muted} />
                <circle cx="94" cy="74" r="3" fill={colors.intent.primary.main} />
              </g>
            </svg>
          );

        case 'error':
          return (
            <svg
              viewBox="0 0 120 120"
              fill="none"
              style={{ width: '100%', height: '100%' }}
              className="scaffold-illust-animated"
            >
              <circle
                cx="60"
                cy="60"
                r="44"
                fill={colors.intent.danger.subtle}
                stroke={colors.intent.danger.main}
                strokeWidth="1.5"
                opacity="0.3"
                style={{ animation: prefersReducedMotion ? 'none' : 'scaffold-illust-pulse 2.2s ease-in-out infinite' }}
              />
              <g style={{ animation: prefersReducedMotion ? 'none' : 'scaffold-illust-float 3s ease-in-out infinite' }}>
                <path
                  d="M60 28 L90 82 L30 82 Z"
                  fill={colors.bg.surface}
                  stroke={colors.intent.danger.main}
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <line
                  x1="60"
                  y1="48"
                  x2="60"
                  y2="64"
                  stroke={colors.intent.danger.main}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="60" cy="73" r="2" fill={colors.intent.danger.main} />
              </g>
            </svg>
          );

        case 'success':
          return (
            <svg
              viewBox="0 0 120 120"
              fill="none"
              style={{ width: '100%', height: '100%' }}
              className="scaffold-illust-animated"
            >
              <circle
                cx="60"
                cy="60"
                r="44"
                fill={colors.intent.success.subtle}
                stroke={colors.intent.success.main}
                strokeWidth="1.5"
                opacity="0.3"
                style={{ animation: prefersReducedMotion ? 'none' : 'scaffold-illust-pulse 2.5s ease-in-out infinite' }}
              />
              <g style={{ animation: prefersReducedMotion ? 'none' : 'scaffold-illust-float 3.2s ease-in-out infinite' }}>
                <circle
                  cx="60"
                  cy="60"
                  r="30"
                  fill={colors.bg.surface}
                  stroke={colors.intent.success.main}
                  strokeWidth="3"
                />
                <path
                  d="M48 60 L56 68 L74 50"
                  fill="none"
                  stroke={colors.intent.success.main}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <g style={{ animation: prefersReducedMotion ? 'none' : 'scaffold-illust-sparkle 2.2s ease-in-out infinite' }}>
                <circle cx="86" cy="34" r="3" fill={colors.intent.success.main} />
                <circle cx="34" cy="38" r="2" fill={colors.intent.primary.main} />
                <circle cx="88" cy="84" r="2" fill={colors.intent.primary.main} />
              </g>
            </svg>
          );

        default:
          return null;
      }
    };

    const resolvedFallback = fallback ?? renderPresetSvg();

    return (
      <div
        ref={ref}
        role="img"
        aria-label={ariaLabel || `${preset} illustration`}
        aria-hidden={ariaHidden}
        style={{
          width: dimension,
          height: dimension,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxSizing: 'border-box',
          position: 'relative',
        }}
        {...props}
      >
        {animationData ? (
          <LottieErrorBoundary fallback={resolvedFallback}>
            <Suspense fallback={resolvedFallback}>
              <LazyLottie
                animationData={animationData}
                loop={prefersReducedMotion ? false : loop}
                autoplay={prefersReducedMotion ? false : autoplay}
                style={{ width: '100%', height: '100%' }}
              />
            </Suspense>
          </LottieErrorBoundary>
        ) : (
          resolvedFallback
        )}
      </div>
    );
  }
);

StatusIllustration.displayName = 'StatusIllustration';
