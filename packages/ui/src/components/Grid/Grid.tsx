import React, { type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { type StackGap } from '../Stack/Stack';

export interface GridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> {
  minItemWidth?: number | string;
  gap?: StackGap;
  children: ReactNode;
}

export function Grid({
  minItemWidth = '280px',
  gap = 6,
  children,
  ...props
}: GridProps) {
  const { tokens } = useTheme();
  const minWidthValue = typeof minItemWidth === 'number' ? `${minItemWidth}px` : minItemWidth;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidthValue}, 1fr))`,
        gap: tokens.spacing[gap] || tokens.spacing[6],
        boxSizing: 'border-box',
        width: '100%',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
