import React, {
  useId,
  isValidElement,
  cloneElement,
  type ReactNode,
  type ReactElement,
} from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';

export interface FormFieldRenderProps {
  id: string;
  hasError: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  required?: boolean;
}

/**
 * Design System FormField
 *
 * Public interface strictly omits 'className' and 'style' to enforce
 * design system guardrails and prevent styling drift.
 */
export interface FormFieldProps {
  label?: ReactNode;
  helperText?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  id?: string;
  fullWidth?: boolean;
  children: ReactNode | ((props: FormFieldRenderProps) => ReactNode);
}

export function FormField({
  label,
  helperText,
  errorMessage,
  required = false,
  id: explicitId,
  fullWidth = true,
  children,
}: FormFieldProps) {
  const { tokens, colors } = useTheme();
  const generatedId = useId();
  const fieldId = explicitId || `field-${generatedId}`;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;

  const hasError = Boolean(errorMessage);
  const describedBy = hasError ? errorId : helperText ? helperId : undefined;

  let renderedControl: ReactNode;

  if (typeof children === 'function') {
    renderedControl = children({
      id: fieldId,
      hasError,
      'aria-describedby': describedBy,
      'aria-invalid': hasError,
      required,
    });
  } else if (isValidElement(children)) {
    const childProps = children.props as Record<string, any>;
    renderedControl = cloneElement(children as ReactElement<any>, {
      id: childProps.id ?? fieldId,
      hasError: childProps.hasError ?? hasError,
      'aria-describedby': childProps['aria-describedby'] ?? describedBy,
      'aria-invalid': childProps['aria-invalid'] ?? (hasError ? true : undefined),
      required: childProps.required ?? required,
      fullWidth: childProps.fullWidth ?? fullWidth,
    });
  } else {
    renderedControl = children;
  }

  const labelStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[1],
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: colors.text.primary,
    cursor: 'pointer',
    userSelect: 'none',
  };

  const asteriskStyles: React.CSSProperties = {
    color: colors.intent.danger.main,
    fontWeight: tokens.typography.fontWeight.bold,
  };

  return (
    <Stack direction="column" gap={1} align="stretch">
      {label && (
        <label htmlFor={fieldId} style={labelStyles}>
          {label}
          {required && (
            <span style={asteriskStyles} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {renderedControl}

      {hasError && (
        <Text id={errorId} size="xs" color="danger">
          <span role="alert">{errorMessage}</span>
        </Text>
      )}

      {!hasError && helperText && (
        <Text id={helperId} size="xs" color="secondary">
          {helperText}
        </Text>
      )}
    </Stack>
  );
}
