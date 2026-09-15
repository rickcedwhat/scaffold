import React, { type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export interface HeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> {
  sticky?: boolean;
  children: ReactNode;
}

export function Header({ sticky = false, children, ...props }: HeaderProps) {
  const { colors, tokens } = useTheme();

  return (
    <header
      style={{
        backgroundColor: colors.bg.surface,
        borderBottom: `1px solid ${colors.border.subtle}`,
        padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
        position: sticky ? 'sticky' : 'relative',
        top: 0,
        zIndex: 50,
        boxSizing: 'border-box',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      }}
      {...props}
    >
      {children}
    </header>
  );
}
