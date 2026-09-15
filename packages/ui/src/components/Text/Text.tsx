import React, { type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type TextAs = 'p' | 'span' | 'div' | 'label' | 'code';
export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type TextColor = 'primary' | 'secondary' | 'muted' | 'inverse' | 'danger' | 'success';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase';

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> {
  as?: TextAs;
  size?: TextSize;
  color?: TextColor;
  weight?: TextWeight;
  transform?: TextTransform;
  truncate?: boolean;
  children: ReactNode;
}

export function Text({
  as = 'p',
  size = 'base',
  color = 'primary',
  weight = 'normal',
  transform = 'none',
  truncate = false,
  children,
  ...props
}: TextProps) {
  const { tokens, colors } = useTheme();

  const colorMap = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    muted: colors.text.muted,
    inverse: colors.text.inverse,
    danger: colors.intent.danger.main,
    success: colors.intent.success.main,
  };

  const isCode = as === 'code';

  const baseStyles: React.CSSProperties = {
    margin: 0,
    padding: 0,
    fontFamily: isCode ? tokens.typography.fontFamily.mono : tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.fontSize[size],
    fontWeight: tokens.typography.fontWeight[weight],
    lineHeight: tokens.typography.lineHeight.normal,
    color: colorMap[color],
    textTransform: transform,
    boxSizing: 'border-box',
    ...(truncate
      ? {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }
      : {}),
    ...(isCode
      ? {
          backgroundColor: colors.bg.subtle,
          padding: `2px ${tokens.spacing[1]}`,
          borderRadius: tokens.radii.sm,
          fontSize: tokens.typography.fontSize.xs,
        }
      : {}),
  };

  const Component = as as React.ElementType;

  return (
    <Component style={baseStyles} {...props}>
      {children}
    </Component>
  );
}
