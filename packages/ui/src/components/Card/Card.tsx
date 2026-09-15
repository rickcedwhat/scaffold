import React, { type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type CardPadding = 'none' | 'compact' | 'normal' | 'spacious';
export type CardVariant = 'surface' | 'subtle' | 'outline';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> {
  padding?: CardPadding;
  variant?: CardVariant;
  children: ReactNode;
}

export function Card({
  padding = 'normal',
  variant = 'surface',
  children,
  ...props
}: CardProps) {
  const { colors, tokens } = useTheme();

  const paddingMap = {
    none: '0px',
    compact: tokens.spacing[3],
    normal: tokens.spacing[5],
    spacious: tokens.spacing[8],
  };

  const variantStyles = {
    surface: {
      backgroundColor: colors.bg.surface,
      border: `1px solid ${colors.border.subtle}`,
    },
    subtle: {
      backgroundColor: colors.bg.subtle,
      border: `1px solid ${colors.border.subtle}`,
    },
    outline: {
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border.default}`,
    },
  }[variant];

  return (
    <div
      style={{
        borderRadius: tokens.radii.lg,
        padding: paddingMap[padding],
        boxSizing: 'border-box',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
        ...variantStyles,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
