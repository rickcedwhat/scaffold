import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { tokens, type ThemeMode, type ColorScheme } from './tokens';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  tokens: typeof tokens;
  colors: ColorScheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_STORAGE_KEY = 'scaffold-theme-mode';

export interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultMode = 'light',
  storageKey = DEFAULT_STORAGE_KEY,
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined' && 'localStorage' in window && storageKey) {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored === 'light' || stored === 'dark') {
          return stored;
        }
      } catch {
        // Fall back to defaultMode if localStorage is restricted
      }
    }
    return defaultMode;
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined' && 'localStorage' in window && storageKey) {
      try {
        window.localStorage.setItem(storageKey, newMode);
      } catch {
        // Ignore localStorage errors
      }
    }
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const value = useMemo<ThemeContextValue>(() => ({
    mode,
    toggleMode,
    setMode,
    tokens,
    colors: tokens.colors[mode],
  }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      mode: 'light',
      toggleMode: () => {},
      setMode: () => {},
      tokens,
      colors: tokens.colors.light,
    };
  }
  return context;
}
