import React, {
  forwardRef,
  useId,
  useState,
  type SelectHTMLAttributes,
  type ReactNode,
  type FocusEvent,
  type ChangeEvent,
} from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type DropdownSize = 'small' | 'medium';
export type DropdownVariant = 'default' | 'filled' | 'ghost';

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

/**
 * Design System Dropdown / Select
 *
 * Outlined select with integrated floating label, isDirty modification feedback,
 * and custom styled chevron indicator.
 * Strictly omits 'className' and 'style' props.
 */
export interface DropdownProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'style' | 'size'> {
  label?: string;
  helperText?: ReactNode;
  error?: boolean;
  hasError?: boolean;
  isDirty?: boolean;
  size?: DropdownSize;
  inputVariant?: DropdownVariant;
  fullWidth?: boolean;
  options?: DropdownOption[];
  placeholder?: string;
  children?: ReactNode;
}

export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(function Dropdown(
  {
    label,
    helperText,
    error: errorProp,
    hasError: hasErrorProp,
    isDirty = false,
    size = 'medium',
    inputVariant = 'default',
    fullWidth = true,
    options,
    placeholder,
    children,
    disabled = false,
    id: explicitId,
    value,
    defaultValue,
    onFocus,
    onBlur,
    onChange,
    ...props
  },
  ref
) {
  const { tokens, colors } = useTheme();
  const generatedId = useId();
  const selectId = explicitId || `select-${generatedId}`;
  const helperId = `${selectId}-helper`;

  const isError = Boolean(errorProp || hasErrorProp);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const hasContent = String(currentValue ?? '').length > 0;
  const isDense = size === 'small';

  // Label shrinks on focus, content, or in dense mode
  const shouldShrink = Boolean(isFocused || hasContent || isDense);

  const handleFocus = (e: FocusEvent<HTMLSelectElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  const sizeStyles = {
    small: {
      height: '32px',
      fontSize: tokens.typography.fontSize.xs,
      paddingLeft: tokens.spacing[3],
      paddingRight: tokens.spacing[8],
      radius: tokens.radii.sm,
      labelRestY: '7px',
      labelShrinkY: '-9px',
      chevronRight: tokens.spacing[2],
    },
    medium: {
      height: '56px',
      fontSize: tokens.typography.fontSize.base,
      paddingLeft: tokens.spacing[4],
      paddingRight: tokens.spacing[10],
      radius: tokens.radii.md,
      labelRestY: '17px',
      labelShrinkY: '-10px',
      chevronRight: tokens.spacing[3],
    },
  }[size];

  const getBorderColor = () => {
    if (disabled) return colors.border.subtle;
    if (isError) return colors.intent.danger.main;
    if (isFocused) return colors.intent.primary.main;
    if (isDirty) return colors.intent.primary.main;
    if (isHovered) return colors.border.strong;
    if (inputVariant === 'ghost') return 'transparent';
    return colors.border.default;
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.bg.subtle;
    if (isDirty && !isError) return colors.intent.primary.subtle;
    if (inputVariant === 'filled') return colors.bg.subtle;
    return colors.bg.surface;
  };

  const containerStyles: React.CSSProperties = {
    display: fullWidth ? 'flex' : 'inline-flex',
    flexDirection: 'column',
    width: fullWidth ? '100%' : 'auto',
    boxSizing: 'border-box',
    gap: tokens.spacing[1],
  };

  const fieldWrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: sizeStyles.height,
    boxSizing: 'border-box',
    borderRadius: sizeStyles.radius,
    backgroundColor: getBackgroundColor(),
    border: `1px solid ${getBorderColor()}`,
    borderLeftWidth: isDirty && !isError ? '4px' : '1px',
    borderLeftColor: isDirty && !isError ? colors.intent.primary.main : getBorderColor(),
    boxShadow: isFocused && !disabled
      ? `0 0 0 3px ${isError ? colors.intent.danger.subtle : colors.intent.primary.subtle}`
      : 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
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
    fontSize: sizeStyles.fontSize,
    paddingLeft: sizeStyles.paddingLeft,
    paddingRight: sizeStyles.paddingRight,
    paddingTop: label && !isDense ? '14px' : '0',
    paddingBottom: '0',
    margin: 0,
    boxSizing: 'border-box',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const labelStyles: React.CSSProperties = {
    position: 'absolute',
    left: sizeStyles.paddingLeft,
    top: '0',
    transform: shouldShrink
      ? `translate(0, ${sizeStyles.labelShrinkY}) scale(0.75)`
      : `translate(0, ${sizeStyles.labelRestY}) scale(1)`,
    transformOrigin: 'top left',
    transition: 'transform 0.15s ease, color 0.15s ease',
    color: isError
      ? colors.intent.danger.main
      : isFocused || (isDirty && !isError)
      ? colors.intent.primary.main
      : colors.text.secondary,
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: sizeStyles.fontSize,
    fontWeight: shouldShrink
      ? tokens.typography.fontWeight.semibold
      : tokens.typography.fontWeight.medium,
    pointerEvents: 'none',
    userSelect: 'none',
    backgroundColor: shouldShrink ? colors.bg.surface : 'transparent',
    padding: shouldShrink ? '0 4px' : '0',
    zIndex: 1,
    lineHeight: 1,
  };

  const chevronStyles: React.CSSProperties = {
    position: 'absolute',
    right: sizeStyles.chevronRight,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isError
      ? colors.intent.danger.main
      : isDirty
      ? colors.intent.primary.main
      : colors.text.secondary,
    zIndex: 2,
  };

  return (
    <div style={containerStyles}>
      <div
        style={fieldWrapperStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {label && (
          <label htmlFor={selectId} style={labelStyles}>
            {label}
            {props.required && (
              <span style={{ color: colors.intent.danger.main, marginLeft: '2px' }}>*</span>
            )}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          aria-invalid={isError}
          aria-describedby={helperText ? helperId : undefined}
          style={selectStyles}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden={Boolean(props.required)}>
              {placeholder}
            </option>
          )}
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

      {helperText && (
        <span
          id={helperId}
          role={isError ? 'alert' : undefined}
          style={{
            fontSize: tokens.typography.fontSize.xs,
            color: isError ? colors.intent.danger.main : colors.text.secondary,
            fontFamily: tokens.typography.fontFamily.sans,
            marginLeft: tokens.spacing[2],
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
});

// Aliases
export const Select = Dropdown;
export type SelectProps = DropdownProps;
export type SelectOption = DropdownOption;
export type SelectSize = DropdownSize;
