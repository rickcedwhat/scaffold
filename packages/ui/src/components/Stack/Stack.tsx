import React, { type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type StackDirection = 'row' | 'column';
export type StackGap = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around';

/**
 * Design System Stack Primitive
 * 
 * Enforces layout structure using design system spacing tokens.
 * Omits 'className' and 'style' to prevent arbitrary margins and layout hacking.
 */
export interface StackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> {
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  children: ReactNode;
}

export function Stack({
  direction = 'column',
  gap = 4,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  children,
  ...props
}: StackProps) {
  const { tokens } = useTheme();

  const alignMap: Record<StackAlign, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  };

  const justifyMap: Record<StackJustify, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
  };

  const computedStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    gap: tokens.spacing[gap] || tokens.spacing[4],
    alignItems: alignMap[align],
    justifyContent: justifyMap[justify],
    flexWrap: wrap ? 'wrap' : 'nowrap',
    boxSizing: 'border-box',
  };

  return (
    <div style={computedStyles} {...props}>
      {children}
    </div>
  );
}
