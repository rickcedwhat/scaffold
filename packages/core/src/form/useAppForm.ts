import { useMemo, type BaseSyntheticEvent } from 'react';
import {
  useForm,
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  type PathValue,
  type Resolver,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';
import {
  flattenFieldErrors,
  getErrorMessage,
  getFieldError,
  getFirstErrorPath,
  getFormControlProps,
  type FormControlA11yProps,
} from './fieldHelpers';

export interface UseAppFormOptions<TFieldValues extends FieldValues>
  extends Omit<UseFormProps<TFieldValues>, 'resolver'> {
  /**
   * Zod schema used as the form resolver.
   * Prefer schemas built with `createFormSchema`.
   */
  schema: ZodType<TFieldValues>;
}

export interface AppFormHelpers<TFieldValues extends FieldValues> {
  /** Message for a field, if any. */
  fieldError: (name: FieldPath<TFieldValues>) => string | undefined;
  /** Accessibility + dirty props for UI FormField / controls. */
  fieldProps: (
    name: FieldPath<TFieldValues>,
    options?: { describedById?: string },
  ) => FormControlA11yProps;
  /** Whether the field differs from default values. */
  isFieldDirty: (name: FieldPath<TFieldValues>) => boolean;
  /** Flat error summary for banners / live regions. */
  errorSummary: () => Array<{ path: string; message: string }>;
  /** First errored field path (for summaries / focus). */
  firstErrorPath: () => string | undefined;
  /**
   * Reset to the values captured when the form was created (or last
   * `commitDefaults` call). Equivalent to a successful-save baseline.
   */
  resetToDefaults: () => void;
  /**
   * Treat the current values as the new baseline (clears dirty + errors).
   */
  commitDefaults: (values?: TFieldValues) => void;
  /**
   * Typed submit wrapper that keeps handler signatures clean.
   */
  handleAppSubmit: (
    onValid: SubmitHandler<TFieldValues>,
    onInvalid?: SubmitErrorHandler<TFieldValues>,
  ) => (e?: BaseSyntheticEvent) => Promise<void>;
}

export type UseAppFormReturn<TFieldValues extends FieldValues> =
  UseFormReturn<TFieldValues> & AppFormHelpers<TFieldValues>;

const DEFAULT_MODE = 'onTouched' as const;

/**
 * Opinionated React Hook Form preset bound to a Zod schema.
 *
 * Defaults:
 * - `mode: 'onTouched'` — validate after first blur, then on change
 * - `shouldFocusError: true` — focus first invalid control on submit
 * - Zod resolver via `@hookform/resolvers/zod`
 *
 * Extra helpers map errors onto `@scaffold/ui` FormField / Input props.
 */
export function useAppForm<TFieldValues extends FieldValues>(
  options: UseAppFormOptions<TFieldValues>,
): UseAppFormReturn<TFieldValues> {
  const {
    schema,
    mode = DEFAULT_MODE,
    shouldFocusError = true,
    defaultValues,
    ...rest
  } = options;

  const form = useForm<TFieldValues>({
    ...rest,
    defaultValues,
    mode,
    shouldFocusError,
    // zodResolver's Zod 4 overloads disagree with ZodType<TFieldValues>;
    // cast keeps call sites fully typed against the schema output.
    resolver: zodResolver(schema as never) as Resolver<TFieldValues>,
  });

  // Subscribe to formState so helpers re-render when validation changes.
  const { errors, dirtyFields, isSubmitted, submitCount } = form.formState;

  const helpers = useMemo<AppFormHelpers<TFieldValues>>(() => {
    return {
      fieldError(name) {
        return getErrorMessage(getFieldError(errors, name));
      },

      fieldProps(name, fieldOptions) {
        return getFormControlProps(form, name, fieldOptions);
      },

      isFieldDirty(name) {
        return Boolean(form.getFieldState(name).isDirty);
      },

      errorSummary() {
        return flattenFieldErrors(errors);
      },

      firstErrorPath() {
        return getFirstErrorPath(errors);
      },

      resetToDefaults() {
        form.reset();
      },

      commitDefaults(values) {
        const next = values ?? form.getValues();
        form.reset(next, { keepValues: true });
      },

      handleAppSubmit(onValid, onInvalid) {
        return async (e?: BaseSyntheticEvent) => {
          await form.handleSubmit(onValid, onInvalid)(e);
        };
      },
    };
  }, [form, errors, dirtyFields, isSubmitted, submitCount]);

  return Object.assign(form, helpers);
}

/**
 * Narrow helper for setting a single typed field value.
 */
export function setTypedValue<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  form: UseFormReturn<TFieldValues>,
  name: TName,
  value: PathValue<TFieldValues, TName>,
  options?: Parameters<UseFormReturn<TFieldValues>['setValue']>[2],
): void {
  form.setValue(name, value, options);
}

export type { DefaultValues, SubmitHandler, SubmitErrorHandler };
