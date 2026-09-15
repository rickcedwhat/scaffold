import React, { type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { type ButtonIntent } from '../Button/Button';

export type BadgeVariant = 'subtle' | 'solid' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style' | 'className'> {
  intent?: ButtonIntent;
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

export function Badge({
  intent = 'primary',
  variant = 'subtle',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const { tokens, colors } = useTheme();
  const intentColors = colors.intent[intent];

  const sizeStyles = {
    sm: {
      padding: `2px ${tokens.spacing[2]}`,
      fontSize: tokens.typography.fontSize.xs,
      height: '20px',
    },
    md: {
      padding: `3px ${tokens.spacing[3]}`,
      fontSize: tokens.typography.fontSize.xs,
      height: '24px',
    },
  }[size];

  const variantStyles = {
    subtle: {
      backgroundColor: intentColors.subtle,
      color: intentColors.main,
      border: '1px solid transparent',
    },
    solid: {
      backgroundColor: intentColors.main,
      color: intentColors.text,
      border: '1px solid transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      color: intentColors.main,
      border: `1px solid ${intentColors.main}`,
    },
  }[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: tokens.radii.full,
        fontWeight: tokens.typography.fontWeight.semibold,
        fontFamily: tokens.typography.fontFamily.sans,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...sizeStyles,
        ...variantStyles,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
