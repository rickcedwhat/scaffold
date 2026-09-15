import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'subtle';
export type ButtonIntent = 'primary' | 'secondary' | 'neutral' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Design System Button
 * 
 * Public interface strictly omits 'className' and 'style' to enforce
 * design system guardrails and prevent styling drift.
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'className'> {
  intent?: ButtonIntent;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  intent = 'primary',
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const { tokens, colors } = useTheme();
  const intentColors = colors.intent[intent];

  const sizeStyles = {
    sm: {
      padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
      fontSize: tokens.typography.fontSize.xs,
      height: '32px',
      gap: tokens.spacing[2],
    },
    md: {
      padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
      fontSize: tokens.typography.fontSize.sm,
      height: '40px',
      gap: tokens.spacing[2],
    },
    lg: {
      padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
      fontSize: tokens.typography.fontSize.base,
      height: '48px',
      gap: tokens.spacing[3],
    },
  }[size];

  const getVariantStyles = () => {
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: intentColors.main,
          color: intentColors.text,
          border: '1px solid transparent',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: intentColors.main,
          border: `1px solid ${intentColors.main}`,
        };
      case 'subtle':
        return {
          backgroundColor: intentColors.subtle,
          color: intentColors.main,
          border: '1px solid transparent',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: intentColors.main,
          border: '1px solid transparent',
        };
    }
  };

  const computedStyles: React.CSSProperties = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radii.md,
    fontFamily: tokens.typography.fontFamily.sans,
    fontWeight: tokens.typography.fontWeight.semibold,
    lineHeight: 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
    boxSizing: 'border-box',
    textDecoration: 'none',
    outline: 'none',
    ...sizeStyles,
    ...getVariantStyles(),
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      style={computedStyles}
      {...props}
    >
      {loading && (
        <span
          data-testid="button-spinner"
          style={{
            display: 'inline-block',
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'scaffold-spin 0.6s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
}
