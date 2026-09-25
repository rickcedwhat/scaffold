import type {
  FieldError,
  FieldErrors,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';

/**
 * Extracts a human-readable error message from an RHF FieldError.
 * Prefers `message`, then walks nested `types` / root errors.
 */
export function getErrorMessage(error: FieldError | undefined): string | undefined {
  if (!error) return undefined;
  if (typeof error.message === 'string' && error.message.length > 0) {
    return error.message;
  }

  if (error.types) {
    for (const value of Object.values(error.types)) {
      if (typeof value === 'string' && value.length > 0) return value;
      if (Array.isArray(value)) {
        const first = value.find((v) => typeof v === 'string' && v.length > 0);
        if (typeof first === 'string') return first;
      }
    }
  }

  return undefined;
}

/**
 * Looks up a field error by path from an RHF errors object.
 */
export function getFieldError<TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
  name: FieldPath<TFieldValues>,
): FieldError | undefined {
  const segments = String(name).split('.');
  let current: unknown = errors;

  for (const segment of segments) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  if (current == null || typeof current !== 'object') return undefined;

  // RHF FieldError has a `type` and optional `message`
  if ('type' in (current as object) || 'message' in (current as object)) {
    return current as FieldError;
  }

  // Nested object errors sometimes surface root under `root`
  if ('root' in (current as object)) {
    return (current as { root?: FieldError }).root;
  }

  return undefined;
}

/**
 * Returns the first field path that currently has an error (depth-first).
 * Useful for error summaries and focus management.
 */
export function getFirstErrorPath(
  errors: FieldErrors,
  prefix = '',
): string | undefined {
  for (const [key, value] of Object.entries(errors)) {
    if (value == null) continue;
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && ('message' in value || 'type' in value)) {
      return path;
    }

    if (typeof value === 'object') {
      const nested = getFirstErrorPath(value as FieldErrors, path);
      if (nested) return nested;
    }
  }

  return undefined;
}

/**
 * Builds a flat list of `{ path, message }` pairs for error summary UIs.
 */
export function flattenFieldErrors(
  errors: FieldErrors,
  prefix = '',
): Array<{ path: string; message: string }> {
  const results: Array<{ path: string; message: string }> = [];

  for (const [key, value] of Object.entries(errors)) {
    if (value == null) continue;
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && ('message' in value || 'type' in value)) {
      const message = getErrorMessage(value as FieldError);
      if (message) results.push({ path, message });
      continue;
    }

    if (typeof value === 'object') {
      results.push(...flattenFieldErrors(value as FieldErrors, path));
    }
  }

  return results;
}

/**
 * Props intended for `@scaffold/ui` FormField / control wiring.
 * Maps RHF field state onto accessible attributes.
 */
export interface FormControlA11yProps {
  'aria-invalid': boolean | undefined;
  'aria-describedby'?: string;
  hasError: boolean;
  errorMessage?: string;
  isDirty: boolean;
}

/**
 * Derives FormField-friendly a11y + error props for a registered field.
 */
export function getFormControlProps<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  name: FieldPath<TFieldValues>,
  options?: { describedById?: string },
): FormControlA11yProps {
  const error = getFieldError(form.formState.errors, name);
  const errorMessage = getErrorMessage(error);
  const hasError = Boolean(errorMessage);
  const isDirty = Boolean(form.getFieldState(name).isDirty);

  return {
    'aria-invalid': hasError ? true : undefined,
    'aria-describedby': options?.describedById,
    hasError,
    errorMessage,
    isDirty,
  };
}
