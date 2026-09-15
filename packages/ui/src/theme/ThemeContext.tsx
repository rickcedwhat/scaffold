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

export interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'light' }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
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
