export type ThemeMode = 'light' | 'dark';

export interface IntentColor {
  main: string;
  hover: string;
  text: string;
  subtle: string;
}

export interface ColorScheme {
  bg: {
    canvas: string;
    surface: string;
    subtle: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
  };
  intent: {
    primary: IntentColor;
    secondary: IntentColor;
    danger: IntentColor;
    success: IntentColor;
    neutral: IntentColor;
  };
  overlay: {
    backdrop: string;
  };
}

export const tokens = {
  spacing: {
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
  },
  radii: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.2',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  colors: {
    light: {
      bg: {
        canvas: '#f8fafc',
        surface: '#ffffff',
        subtle: '#f1f5f9',
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8',
        inverse: '#ffffff',
      },
      border: {
        subtle: '#e2e8f0',
        default: '#cbd5e1',
        strong: '#94a3b8',
      },
      intent: {
        primary: {
          main: '#2563eb',
          hover: '#1d4ed8',
          text: '#ffffff',
          subtle: '#dbeafe',
        },
        secondary: {
          main: '#475569',
          hover: '#334155',
          text: '#ffffff',
          subtle: '#f1f5f9',
        },
        danger: {
          main: '#dc2626',
          hover: '#b91c1c',
          text: '#ffffff',
          subtle: '#fee2e2',
        },
        success: {
          main: '#16a34a',
          hover: '#15803d',
          text: '#ffffff',
          subtle: '#dcfce7',
        },
        neutral: {
          main: '#64748b',
          hover: '#475569',
          text: '#ffffff',
          subtle: '#f8fafc',
        },
      },
      overlay: {
        backdrop: 'rgba(0, 0, 0, 0.65)',
      },
    },
    dark: {
      bg: {
        canvas: '#090d16',
        surface: '#111827',
        subtle: '#1f2937',
      },
      text: {
        primary: '#f9fafb',
        secondary: '#9ca3af',
        muted: '#6b7280',
        inverse: '#111827',
      },
      border: {
        subtle: '#1f2937',
        default: '#374151',
        strong: '#4b5563',
      },
      intent: {
        primary: {
          main: '#3b82f6',
          hover: '#2563eb',
          text: '#ffffff',
          subtle: '#1e3a8a',
        },
        secondary: {
          main: '#9ca3af',
          hover: '#d1d5db',
          text: '#111827',
          subtle: '#374151',
        },
        danger: {
          main: '#ef4444',
          hover: '#dc2626',
          text: '#ffffff',
          subtle: '#7f1d1d',
        },
        success: {
          main: '#22c55e',
          hover: '#16a34a',
          text: '#ffffff',
          subtle: '#14532d',
        },
        neutral: {
          main: '#9ca3af',
          hover: '#cbd5e1',
          text: '#111827',
          subtle: '#1e293b',
        },
      },
      overlay: {
        backdrop: 'rgba(0, 0, 0, 0.75)',
      },
    },
  } satisfies Record<ThemeMode, ColorScheme>,
};
