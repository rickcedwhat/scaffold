import React, {
  forwardRef,
  useId,
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
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
 * Custom themed dropdown with integrated floating label, isDirty modification feedback,
 * fully styled popover menu with keyboard navigation, and hidden form-compatible select.
 * Looks completely identical and polished across macOS, Windows, Linux, iOS, and Android.
 * Strictly omits 'className' and 'style' props to protect design boundaries.
 */
export interface DropdownProps {
  label?: string;
  helperText?: ReactNode;
  error?: boolean;
  hasError?: boolean;
  isDirty?: boolean;
  size?: DropdownSize;
  inputVariant?: DropdownVariant;
  fullWidth?: boolean;
  /** Always keep floating label anchored to border (default: false) */
  floatingLabel?: boolean;
  options?: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  'data-testid'?: string;
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
    fullWidth = false,
    floatingLabel = false,
    options: optionsProp,
    placeholder,
    children,
    disabled = false,
    required = false,
    id: explicitId,
    name,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    'data-testid': testId,
  },
  ref
) {
  const { tokens, colors } = useTheme();
  const generatedId = useId();
  const selectId = explicitId || `select-${generatedId}`;
  const helperId = `${selectId}-helper`;

  // Parse options from either `options` prop or `children` (<option> tags)
  const options: DropdownOption[] = React.useMemo(() => {
    if (optionsProp) return optionsProp;
    const extracted: DropdownOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const props = child.props as { value?: string | number; disabled?: boolean; children?: ReactNode };
        extracted.push({
          value: props.value ?? '',
          label: String(props.children ?? props.value ?? ''),
          disabled: props.disabled,
        });
      }
    });
    return extracted;
  }, [optionsProp, children]);

  const isError = Boolean(errorProp || hasErrorProp);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const [internalValue, setInternalValue] = useState<string | number>(() => {
    if (defaultValue !== undefined) return defaultValue;
    return '';
  });

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const selectedOption = options.find((opt) => String(opt.value) === String(currentValue));

  const hasContent = Boolean(selectedOption && String(selectedOption.value) !== '');
  const shouldShrink = Boolean(isFocused || isOpen || hasContent || floatingLabel);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const hiddenSelectRef = useRef<HTMLSelectElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  // Sync forwardRef with hidden select
  const setRefs = (node: HTMLSelectElement | null) => {
    hiddenSelectRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLSelectElement | null>).current = node;
    }
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
        onBlur?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onBlur]);

  const handleSelectOption = (opt: DropdownOption) => {
    if (opt.disabled || disabled) return;

    const newValue = String(opt.value);
    if (!isControlled) {
      setInternalValue(opt.value);
    }

    if (hiddenSelectRef.current) {
      hiddenSelectRef.current.value = newValue;
    }

    onChange?.({ target: { value: newValue, name } });
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        const currentIdx = options.findIndex((opt) => String(opt.value) === String(currentValue));
        setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleMenuKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        let next = prev + 1;
        while (next < options.length && options[next]?.disabled) {
          next++;
        }
        return next < options.length ? next : prev;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        let next = prev - 1;
        while (next >= 0 && options[next]?.disabled) {
          next--;
        }
        return next >= 0 ? next : prev;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && options[highlightedIndex]) {
        handleSelectOption(options[highlightedIndex]);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  const sizeStyles = {
    small: {
      height: '32px',
      fontSize: tokens.typography.fontSize.xs,
      paddingLeft: tokens.spacing[3],
      paddingRight: tokens.spacing[8],
      radius: tokens.radii.sm,
      chevronRight: tokens.spacing[2],
      menuItemPadding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
    },
    medium: {
      height: '56px',
      fontSize: tokens.typography.fontSize.base,
      paddingLeft: tokens.spacing[4],
      paddingRight: tokens.spacing[10],
      radius: tokens.radii.md,
      chevronRight: tokens.spacing[3],
      menuItemPadding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    },
  }[size];

  const getBorderColor = () => {
    if (disabled) return colors.border.subtle;
    if (isError) return colors.intent.danger.main;
    if (isFocused || isOpen) return colors.intent.primary.main;
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
    position: 'relative',
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
    boxShadow:
      (isFocused || isOpen) && !disabled
        ? `0 0 0 3px ${isError ? colors.intent.danger.subtle : colors.intent.primary.subtle}`
        : 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
  };

  const triggerButtonStyles: React.CSSProperties = {
    appearance: 'none',
    WebkitAppearance: 'none',
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: selectedOption ? colors.text.primary : colors.text.muted,
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: sizeStyles.fontSize,
    paddingLeft: sizeStyles.paddingLeft,
    paddingRight: sizeStyles.paddingRight,
    paddingTop: '0',
    paddingBottom: '0',
    margin: 0,
    boxSizing: 'border-box',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const labelStyles: React.CSSProperties = {
    position: 'absolute',
    left: `calc(${sizeStyles.paddingLeft} - 4px)`,
    top: shouldShrink ? '-0.5px' : '50%',
    transform: shouldShrink
      ? 'translateY(-50%) scale(0.75)'
      : 'translateY(-50%) scale(1)',
    transformOrigin: '4px center',
    transition: 'top 0.15s ease, transform 0.15s ease, color 0.15s ease',
    color: isError
      ? colors.intent.danger.main
      : isFocused || isOpen || (isDirty && !isError)
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
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s ease',
    zIndex: 2,
  };

  const menuStyles: React.CSSProperties = {
    position: 'absolute',
    top: `calc(${sizeStyles.height} + 4px)`,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: colors.bg.surface,
    border: `1px solid ${colors.border.default}`,
    borderRadius: tokens.radii.md,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
    padding: tokens.spacing[1],
    margin: 0,
    listStyle: 'none',
    maxHeight: '260px',
    overflowY: 'auto',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div ref={containerRef} style={containerStyles}>
      <div
        style={fieldWrapperStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {label && (
          <label htmlFor={selectId} style={labelStyles}>
            {label}
            {required && (
              <span style={{ color: colors.intent.danger.main, marginLeft: '2px' }}>*</span>
            )}
          </label>
        )}

        {/* Custom polished trigger button */}
        <button
          ref={triggerRef}
          id={`${selectId}-trigger`}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${selectId}-menu`}
          aria-labelledby={label ? selectId : undefined}
          aria-invalid={isError}
          aria-describedby={helperText ? helperId : undefined}
          disabled={disabled}
          style={triggerButtonStyles}
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              setIsFocused(true);
              onFocus?.();
            }
          }}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            if (!isOpen) {
              setIsFocused(false);
              onBlur?.();
            }
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          {selectedOption
            ? selectedOption.label
            : !label || isFocused || isOpen
            ? placeholder ?? ''
            : ''}
        </button>

        {/* Hidden native select for form submit */}
        <select
          ref={setRefs}
          id={selectId}
          name={name}
          value={currentValue}
          disabled={disabled}
          required={required}
          aria-hidden="true"
          tabIndex={-1}
          data-testid={testId}
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            width: '1px',
            height: '1px',
            top: 0,
            left: 0,
          }}
          onChange={(e) => {
            handleSelectOption({ value: e.target.value, label: e.target.value });
          }}
        >
          {placeholder && (
            <option value="" disabled hidden={required}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
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

      {/* Themed Custom Dropdown Popover Menu */}
      {isOpen && (
        <ul
          ref={menuRef}
          id={`${selectId}-menu`}
          role="listbox"
          tabIndex={-1}
          style={menuStyles}
          onKeyDown={handleMenuKeyDown}
        >
          {placeholder && (
            <li
              role="option"
              aria-selected={!selectedOption}
              style={{
                padding: sizeStyles.menuItemPadding,
                fontSize: sizeStyles.fontSize,
                fontFamily: tokens.typography.fontFamily.sans,
                color: colors.text.muted,
                borderRadius: tokens.radii.sm,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => handleSelectOption({ value: '', label: placeholder })}
            >
              {placeholder}
            </li>
          )}

          {options.map((opt, idx) => {
            const isSelected = String(opt.value) === String(currentValue);
            const isHighlighted = idx === highlightedIndex;

            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: sizeStyles.menuItemPadding,
                  fontSize: sizeStyles.fontSize,
                  fontFamily: tokens.typography.fontFamily.sans,
                  borderRadius: tokens.radii.sm,
                  backgroundColor: isSelected
                    ? colors.intent.primary.subtle
                    : isHighlighted
                    ? colors.bg.subtle
                    : 'transparent',
                  color: opt.disabled
                    ? colors.text.muted
                    : isSelected
                    ? colors.intent.primary.main
                    : colors.text.primary,
                  fontWeight: isSelected
                    ? tokens.typography.fontWeight.semibold
                    : tokens.typography.fontWeight.normal,
                  cursor: opt.disabled ? 'not-allowed' : 'pointer',
                  userSelect: 'none',
                  opacity: opt.disabled ? 0.5 : 1,
                  transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={() => !opt.disabled && setHighlightedIndex(idx)}
                onClick={() => handleSelectOption(opt)}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <span style={{ color: colors.intent.primary.main, fontSize: '12px' }}>
                    ✓
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

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
