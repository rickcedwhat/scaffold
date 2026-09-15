import React, { type HTMLAttributes } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { type ButtonIntent } from '../Button/Button';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarShape = 'rounded' | 'circle';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> {
  fallback: string;
  src?: string;
  alt?: string;
  size?: AvatarSize;
  intent?: ButtonIntent;
  shape?: AvatarShape;
}

export function Avatar({
  fallback,
  src,
  alt = 'Avatar',
  size = 'md',
  intent = 'primary',
  shape = 'rounded',
  ...props
}: AvatarProps) {
  const { tokens, colors } = useTheme();
  const intentColors = colors.intent[intent];

  const sizeStyles = {
    sm: {
      width: '24px',
      height: '24px',
      fontSize: tokens.typography.fontSize.xs,
    },
    md: {
      width: '32px',
      height: '32px',
      fontSize: tokens.typography.fontSize.sm,
    },
    lg: {
      width: '40px',
      height: '40px',
      fontSize: tokens.typography.fontSize.base,
    },
  }[size];

  const borderRadius = shape === 'circle' ? tokens.radii.full : tokens.radii.md;

  return (
    <div
      style={{
        ...sizeStyles,
        borderRadius,
        backgroundColor: intentColors.main,
        color: intentColors.text,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: tokens.typography.fontWeight.bold,
        fontFamily: tokens.typography.fontFamily.sans,
        userSelect: 'none',
        overflow: 'hidden',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
      aria-label={alt}
      role="img"
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        fallback.slice(0, 2).toUpperCase()
      )}
    </div>
  );
}
