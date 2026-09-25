import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { createFormSchema, z } from './createFormSchema';
import {
  flattenFieldErrors,
  getErrorMessage,
  getFieldError,
  getFirstErrorPath,
} from './fieldHelpers';
import { useAppForm } from './useAppForm';
import type { FieldErrors } from 'react-hook-form';

const profileSchema = createFormSchema({
  name: z.string().min(1, 'Full name is required.'),
  email: z
    .string()
    .min(1, 'Email address is required.')
    .email('Please enter a valid email address (e.g. name@example.com).'),
  org: z.string().min(1, 'Organization name is required.'),
  role: z.enum(['admin', 'editor', 'viewer']),
  timezone: z.enum(['utc', 'est', 'cst', 'pst', 'gmt']),
});

describe('createFormSchema', () => {
  it('builds a Zod object schema that validates fields', () => {
    const result = profileSchema.safeParse({
      name: '',
      email: 'not-an-email',
      org: 'Acme',
      role: 'admin',
      timezone: 'utc',
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const messages = result.error.issues.map((i) => i.message);
    expect(messages).toContain('Full name is required.');
    expect(messages).toContain(
      'Please enter a valid email address (e.g. name@example.com).',
    );
  });

  it('accepts valid values', () => {
    const result = profileSchema.safeParse({
      name: 'Alex Developer',
      email: 'alex@example.com',
      org: 'Acme Technologies',
      role: 'admin',
      timezone: 'utc',
    });

    expect(result.success).toBe(true);
  });
});

describe('fieldHelpers', () => {
  const errors = {
    email: { type: 'invalid_format', message: 'Invalid email' },
    profile: {
      name: { type: 'too_small', message: 'Name required' },
    },
  } as FieldErrors;

  it('getErrorMessage reads FieldError.message', () => {
    expect(getErrorMessage(errors.email as never)).toBe('Invalid email');
    expect(getErrorMessage(undefined)).toBeUndefined();
  });

  it('getFieldError resolves nested paths', () => {
    expect(getFieldError(errors, 'email' as never)?.message).toBe('Invalid email');
    expect(getFieldError(errors, 'profile.name' as never)?.message).toBe('Name required');
    expect(getFieldError(errors, 'missing' as never)).toBeUndefined();
  });

  it('getFirstErrorPath and flattenFieldErrors walk the tree', () => {
    expect(getFirstErrorPath(errors)).toBe('email');
    expect(flattenFieldErrors(errors)).toEqual([
      { path: 'email', message: 'Invalid email' },
      { path: 'profile.name', message: 'Name required' },
    ]);
  });
});

describe('useAppForm', () => {
  it('validates on submit and surfaces field errors for FormField', async () => {
    const { result } = renderHook(() =>
      useAppForm({
        schema: profileSchema,
        defaultValues: {
          name: '',
          email: 'alex',
          org: '',
          role: 'admin',
          timezone: 'utc',
        },
      }),
    );

    const onValid = vi.fn();

    await act(async () => {
      await result.current.handleAppSubmit(onValid)();
    });

    await waitFor(() => {
      expect(result.current.fieldError('email')).toMatch(/valid email/i);
      expect(result.current.fieldError('name')).toBe('Full name is required.');
      expect(result.current.fieldError('org')).toBe('Organization name is required.');
    });

    expect(onValid).not.toHaveBeenCalled();

    const emailProps = result.current.fieldProps('email');
    expect(emailProps.hasError).toBe(true);
    expect(emailProps['aria-invalid']).toBe(true);
    expect(emailProps.errorMessage).toMatch(/valid email/i);

    const summary = result.current.errorSummary();
    expect(summary.length).toBeGreaterThanOrEqual(3);
    expect(result.current.firstErrorPath()).toBeTruthy();
  });

  it('calls the submit handler when values are valid and tracks dirty state', async () => {
    const { result } = renderHook(() =>
      useAppForm({
        schema: profileSchema,
        defaultValues: {
          name: 'Alex Developer',
          email: 'alex@example.com',
          org: 'Acme Technologies',
          role: 'admin' as const,
          timezone: 'utc' as const,
        },
      }),
    );

    expect(result.current.isFieldDirty('name')).toBe(false);

    await act(async () => {
      result.current.setValue('name', 'Jordan Smith', { shouldDirty: true });
    });

    expect(result.current.isFieldDirty('name')).toBe(true);

    const onValid = vi.fn();
    await act(async () => {
      await result.current.handleAppSubmit(onValid)();
    });

    await waitFor(() => {
      expect(onValid).toHaveBeenCalledTimes(1);
    });

    expect(onValid.mock.calls[0]![0]).toMatchObject({
      name: 'Jordan Smith',
      email: 'alex@example.com',
    });

    await act(async () => {
      result.current.commitDefaults();
    });

    expect(result.current.isFieldDirty('name')).toBe(false);

    await act(async () => {
      result.current.setValue('name', 'Someone Else', { shouldDirty: true });
    });
    expect(result.current.isFieldDirty('name')).toBe(true);

    await act(async () => {
      result.current.resetToDefaults();
    });

    expect(result.current.getValues('name')).toBe('Jordan Smith');
    expect(result.current.isFieldDirty('name')).toBe(false);
  });
});
