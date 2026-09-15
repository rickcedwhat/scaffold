import React, { type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type HeadingColor = 'primary' | 'secondary' | 'inverse' | 'muted';

export interface HeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'style' | 'className'> {
  level?: HeadingLevel;
  size?: HeadingSize;
  color?: HeadingColor;
  children: ReactNode;
}

export function Heading({
  level = 2,
  size,
  color = 'primary',
  children,
  ...props
}: HeadingProps) {
  const { tokens, colors } = useTheme();

  const defaultSizeMap: Record<HeadingLevel, HeadingSize> = {
    1: '2xl',
    2: 'xl',
    3: 'lg',
    4: 'base',
    5: 'sm',
    6: 'sm',
  };

  const activeSize = size || defaultSizeMap[level];

  const colorMap = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    inverse: colors.text.inverse,
    muted: colors.text.muted,
  };

  const Tag = `h${level}` as const;

  return (
    <Tag
      style={{
        margin: 0,
        padding: 0,
        fontFamily: tokens.typography.fontFamily.sans,
        fontSize: tokens.typography.fontSize[activeSize],
        fontWeight: tokens.typography.fontWeight.bold,
        lineHeight: tokens.typography.lineHeight.tight,
        color: colorMap[color],
        boxSizing: 'border-box',
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
