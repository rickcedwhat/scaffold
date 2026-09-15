import React, { type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type PageShellMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface PageShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> {
  children: ReactNode;
}

export function PageShell({ children, ...props }: PageShellProps) {
  const { colors } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg.canvas,
        color: colors.text.primary,
        transition: 'background-color 0.15s ease, color 0.15s ease',
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> {
  maxWidth?: PageShellMaxWidth;
  children: ReactNode;
}

export function Container({ maxWidth = 'xl', children, ...props }: ContainerProps) {
  const { tokens } = useTheme();

  const maxWidthMap: Record<PageShellMaxWidth, string> = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1200px',
    full: '100%',
  };

  return (
    <div
      style={{
        maxWidth: maxWidthMap[maxWidth],
        margin: '0 auto',
        padding: `${tokens.spacing[6]} ${tokens.spacing[4]}`,
        boxSizing: 'border-box',
        width: '100%',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
