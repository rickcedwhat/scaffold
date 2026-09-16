import React, {
  forwardRef,
  useState,
  type SelectHTMLAttributes,
  type ReactNode,
  type FocusEvent,
} from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectIntent = 'neutral' | 'primary' | 'danger' | 'success';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

/**
 * Design System Select
 *
 * Public interface strictly omits 'className' and 'style' to enforce
 * design system guardrails and prevent styling drift.
 */
export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'style' | 'size'> {
  size?: SelectSize;
  intent?: SelectIntent;
  hasError?: boolean;
  fullWidth?: boolean;
  options?: SelectOption[];
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    size = 'md',
    intent = 'primary',
    hasError = false,
    fullWidth = false,
    options,
    children,
    disabled = false,
    onFocus,
    onBlur,
    onMouseEnter,
    onMouseLeave,
    ...props
  },
  ref
) {
  const { tokens, colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFocus = (e: FocusEvent<HTMLSelectElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const sizeConfig = {
    sm: {
      height: '32px',
      fontSize: tokens.typography.fontSize.xs,
      paddingLeft: tokens.spacing[2],
      paddingRight: tokens.spacing[6],
    },
    md: {
      height: '40px',
      fontSize: tokens.typography.fontSize.sm,
      paddingLeft: tokens.spacing[3],
      paddingRight: tokens.spacing[8],
    },
    lg: {
      height: '48px',
      fontSize: tokens.typography.fontSize.base,
      paddingLeft: tokens.spacing[4],
      paddingRight: tokens.spacing[10],
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
    position: 'relative',
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
    cursor: disabled ? 'not-allowed' : 'pointer',
    height: sizeConfig.height,
  };

  const selectStyles: React.CSSProperties = {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: colors.text.primary,
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: sizeConfig.fontSize,
    lineHeight: tokens.typography.lineHeight.normal,
    paddingLeft: sizeConfig.paddingLeft,
    paddingRight: sizeConfig.paddingRight,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    boxSizing: 'border-box',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const chevronStyles: React.CSSProperties = {
    position: 'absolute',
    right: tokens.spacing[3],
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: disabled ? colors.text.muted : colors.text.secondary,
  };

  return (
    <div
      style={containerStyles}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.(e as any);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e as any);
      }}
    >
      <select
        ref={ref}
        disabled={disabled}
        aria-invalid={hasError || props['aria-invalid']}
        style={selectStyles}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <span style={chevronStyles} aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
});
