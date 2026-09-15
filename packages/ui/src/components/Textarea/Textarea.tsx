import React, {
  forwardRef,
  useState,
  type TextareaHTMLAttributes,
  type FocusEvent,
} from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaIntent = 'neutral' | 'primary' | 'danger' | 'success';
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

/**
 * Design System Textarea
 *
 * Public interface strictly omits 'className' and 'style' to enforce
 * design system guardrails and prevent styling drift.
 */
export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'style'> {
  size?: TextareaSize;
  intent?: TextareaIntent;
  hasError?: boolean;
  fullWidth?: boolean;
  resize?: TextareaResize;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    size = 'md',
    intent = 'primary',
    hasError = false,
    fullWidth = false,
    resize = 'vertical',
    disabled = false,
    onFocus,
    onBlur,
    onMouseEnter,
    onMouseLeave,
    rows = 3,
    ...props
  },
  ref
) {
  const { tokens, colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const sizeConfig = {
    sm: {
      fontSize: tokens.typography.fontSize.xs,
      padding: `${tokens.spacing[2]} ${tokens.spacing[2]}`,
    },
    md: {
      fontSize: tokens.typography.fontSize.sm,
      padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    },
    lg: {
      fontSize: tokens.typography.fontSize.base,
      padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    },
  }[size];

  const activeIntentColor = hasError ? colors.intent.danger : colors.intent[intent];

  const getBorderColor = () => {
    if (disabled) return colors.border.subtle;
    if (hasError) return colors.intent.danger.main;
    if (isFocused) return activeIntentColor.main;
    if (isHovered) return colors.border.strong;
    return colors.border.default;
  };

  const textareaStyles: React.CSSProperties = {
    display: fullWidth ? 'block' : 'inline-block',
    width: fullWidth ? '100%' : 'auto',
    minWidth: 0,
    boxSizing: 'border-box',
    borderRadius: tokens.radii.md,
    backgroundColor: disabled ? colors.bg.subtle : colors.bg.surface,
    border: `1px solid ${getBorderColor()}`,
    boxShadow: isFocused && !disabled ? `0 0 0 3px ${activeIntentColor.subtle}` : 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
    color: colors.text.primary,
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: sizeConfig.fontSize,
    lineHeight: tokens.typography.lineHeight.normal,
    padding: sizeConfig.padding,
    resize,
    outline: 'none',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  return (
    <textarea
      ref={ref}
      disabled={disabled}
      aria-invalid={hasError || props['aria-invalid']}
      rows={rows}
      style={textareaStyles}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e);
      }}
      {...props}
    />
  );
});
