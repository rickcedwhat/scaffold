import React, {
  forwardRef,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type MouseEvent,
  type FocusEvent,
} from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputIntent = 'neutral' | 'primary' | 'danger' | 'success';

/**
 * Design System Input
 *
 * Public interface strictly omits 'className' and 'style' to enforce
 * design system guardrails and prevent styling drift.
 */
export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'style' | 'size'> {
  size?: InputSize;
  intent?: InputIntent;
  hasError?: boolean;
  fullWidth?: boolean;
  prefixSlot?: ReactNode;
  suffixSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    intent = 'primary',
    hasError = false,
    fullWidth = false,
    prefixSlot,
    suffixSlot,
    disabled = false,
    onFocus,
    onBlur,
    onMouseEnter,
    onMouseLeave,
    type = 'text',
    ...props
  },
  forwardedRef
) {
  const { tokens, colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const innerRef = useRef<HTMLInputElement | null>(null);

  const setRefs = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
  };

  const handleContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== innerRef.current && !disabled) {
      innerRef.current?.focus();
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const sizeConfig = {
    sm: {
      height: '32px',
      fontSize: tokens.typography.fontSize.xs,
      paddingX: tokens.spacing[2],
      gap: tokens.spacing[1],
    },
    md: {
      height: '40px',
      fontSize: tokens.typography.fontSize.sm,
      paddingX: tokens.spacing[3],
      gap: tokens.spacing[2],
    },
    lg: {
      height: '48px',
      fontSize: tokens.typography.fontSize.base,
      paddingX: tokens.spacing[4],
      gap: tokens.spacing[3],
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

  const containerStyles: React.CSSProperties = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    boxSizing: 'border-box',
    borderRadius: tokens.radii.md,
    backgroundColor: disabled ? colors.bg.subtle : colors.bg.surface,
    border: `1px solid ${getBorderColor()}`,
    boxShadow: isFocused && !disabled ? `0 0 0 3px ${activeIntentColor.subtle}` : 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    height: sizeConfig.height,
    paddingLeft: prefixSlot ? sizeConfig.paddingX : '0',
    paddingRight: suffixSlot ? sizeConfig.paddingX : '0',
    gap: sizeConfig.gap,
  };

  const inputStyles: React.CSSProperties = {
    flex: 1,
    width: '100%',
    minWidth: 0,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: colors.text.primary,
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: sizeConfig.fontSize,
    lineHeight: tokens.typography.lineHeight.normal,
    paddingLeft: prefixSlot ? 0 : sizeConfig.paddingX,
    paddingRight: suffixSlot ? 0 : sizeConfig.paddingX,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    boxSizing: 'border-box',
    cursor: disabled ? 'not-allowed' : 'text',
    WebkitAppearance: 'none',
  };

  const slotStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text.secondary,
    flexShrink: 0,
    fontSize: sizeConfig.fontSize,
  };

  return (
    <div
      style={containerStyles}
      onClick={handleContainerClick}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.(e as any);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e as any);
      }}
    >
      {prefixSlot && <span style={slotStyles}>{prefixSlot}</span>}
      <input
        ref={setRefs}
        type={type}
        disabled={disabled}
        aria-invalid={hasError || props['aria-invalid']}
        style={inputStyles}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {suffixSlot && <span style={slotStyles}>{suffixSlot}</span>}
    </div>
  );
});
