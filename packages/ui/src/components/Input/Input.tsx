import React, {
  forwardRef,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type FocusEvent,
  type ChangeEvent,
} from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type TextInputSize = 'small' | 'medium';
export type TextInputVariant = 'default' | 'filled' | 'ghost';

/**
 * Design System TextInput
 *
 * Controlled / uncontrolled input with built-in floating outlined label,
 * isDirty modification feedback, and tokenized error states.
 * Strictly omits 'className' and 'style' props to preserve design boundaries.
 */
export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'style' | 'size'> {
  /** Floating outlined label */
  label?: string;
  /** Helper text or error message displayed below field */
  helperText?: ReactNode;
  /** Error state */
  error?: boolean;
  /** Alias for error */
  hasError?: boolean;
  /** Dirty state - field has been modified from initial value */
  isDirty?: boolean;
  /** Control size: 'small' (32px dense) or 'medium' (56px default comfortable) */
  size?: TextInputSize;
  /** Visual variant */
  inputVariant?: TextInputVariant;
  /** Full width container (default: false) */
  fullWidth?: boolean;
  /** Always keep floating label anchored to border (default: false) */
  floatingLabel?: boolean;
  /** Optional prefix adornment */
  prefixSlot?: ReactNode;
  /** Optional suffix adornment */
  suffixSlot?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    label,
    helperText,
    error: errorProp,
    hasError: hasErrorProp,
    isDirty = false,
    size = 'medium',
    inputVariant = 'default',
    fullWidth = false,
    floatingLabel = false,
    prefixSlot,
    suffixSlot,
    id: explicitId,
    disabled = false,
    value,
    defaultValue,
    placeholder,
    onFocus,
    onBlur,
    onChange,
    type = 'text',
    ...props
  },
  forwardedRef
) {
  const { tokens, colors } = useTheme();
  const generatedId = useId();
  const inputId = explicitId || `input-${generatedId}`;
  const helperId = `${inputId}-helper`;

  const isError = Boolean(errorProp || hasErrorProp);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const hasContent = String(currentValue ?? '').length > 0;

  // Floating label shrinks to border when focused, has content, or floatingLabel is explicitly enabled
  const shouldShrink = Boolean(isFocused || hasContent || floatingLabel);

  const innerRef = useRef<HTMLInputElement | null>(null);

  const setRefs = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  const sizeStyles = {
    small: {
      height: '32px',
      fontSize: tokens.typography.fontSize.xs,
      paddingX: tokens.spacing[3],
      paddingY: '0',
      radius: tokens.radii.sm,
    },
    medium: {
      height: '56px',
      fontSize: tokens.typography.fontSize.base,
      paddingX: tokens.spacing[4],
      paddingY: '14px',
      radius: tokens.radii.md,
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
    width: fullWidth ? '100%' : '320px',
    maxWidth: '100%',
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
    cursor: disabled ? 'not-allowed' : 'text',
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
    fontSize: sizeStyles.fontSize,
    paddingLeft: prefixSlot ? tokens.spacing[2] : sizeStyles.paddingX,
    paddingRight: suffixSlot ? tokens.spacing[2] : sizeStyles.paddingX,
    paddingTop: '0',
    paddingBottom: '0',
    margin: 0,
    boxSizing: 'border-box',
    cursor: disabled ? 'not-allowed' : 'text',
    WebkitAppearance: 'none',
  };

  const labelStyles: React.CSSProperties = {
    position: 'absolute',
    left: prefixSlot ? `calc(${sizeStyles.paddingX} + 1.25rem - 4px)` : `calc(${sizeStyles.paddingX} - 4px)`,
    top: shouldShrink ? '-0.5px' : '50%',
    transform: shouldShrink
      ? 'translateY(-50%) scale(0.75)'
      : 'translateY(-50%) scale(1)',
    transformOrigin: '4px center',
    transition: 'top 0.15s ease, transform 0.15s ease, color 0.15s ease',
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
    padding: '0 4px',
    zIndex: 1,
    lineHeight: 1,
  };

  const slotStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text.secondary,
    flexShrink: 0,
    paddingLeft: prefixSlot ? sizeStyles.paddingX : '0',
    paddingRight: suffixSlot ? sizeStyles.paddingX : '0',
    fontSize: sizeStyles.fontSize,
    zIndex: 2,
  };

  return (
    <div style={containerStyles}>
      <div
        style={fieldWrapperStyles}
        onClick={() => !disabled && innerRef.current?.focus()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {label && (
          <label htmlFor={inputId} style={labelStyles}>
            {label}
            {props.required && (
              <span style={{ color: colors.intent.danger.main, marginLeft: '2px' }}>*</span>
            )}
          </label>
        )}

        {prefixSlot && <span style={slotStyles}>{prefixSlot}</span>}

        <input
          ref={setRefs}
          id={inputId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          placeholder={!label ? placeholder : isFocused && !hasContent ? placeholder : undefined}
          aria-invalid={isError}
          aria-describedby={helperText ? helperId : undefined}
          style={inputStyles}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />

        {suffixSlot && <span style={slotStyles}>{suffixSlot}</span>}
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

// Alias Input to TextInput for backwards compatibility
export const Input = TextInput;
export type InputProps = TextInputProps;
