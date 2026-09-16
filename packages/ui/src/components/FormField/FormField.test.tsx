import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FormField } from './FormField';
import { Input } from '../Input/Input';

describe('FormField', () => {
  it('renders label and automatically links htmlFor to input id', () => {
    render(
      <FormField label="Email Address">
        <Input placeholder="name@example.com" />
      </FormField>
    );

    const label = screen.getByText('Email Address');
    const input = screen.getByPlaceholderText('name@example.com');
    expect(label).toHaveAttribute('for', input.getAttribute('id'));
  });

  it('renders required asterisk when required is true', () => {
    render(
      <FormField label="Username" required>
        <Input placeholder="Enter username" />
      </FormField>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Enter username');
    expect(input).toHaveAttribute('required');
  });

  it('renders helper text and links aria-describedby', () => {
    render(
      <FormField label="Username" helperText="Must be unique.">
        <Input placeholder="Enter username" />
      </FormField>
    );

    const helper = screen.getByText('Must be unique.');
    const input = screen.getByPlaceholderText('Enter username');
    expect(input).toHaveAttribute('aria-describedby', helper.getAttribute('id'));
  });

  it('renders error message with role="alert" and sets aria-invalid', () => {
    render(
      <FormField label="Email" errorMessage="Invalid email address">
        <Input placeholder="Enter email" />
      </FormField>
    );

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Invalid email address');
    const input = screen.getByPlaceholderText('Enter email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toContain(error.parentElement?.getAttribute('id') ?? '');
  });

  it('supports render prop function children', () => {
    render(
      <FormField label="Custom Field" errorMessage="Required field">
        {({ id, hasError, 'aria-describedby': describedBy }) => (
          <input
            id={id}
            data-testid="custom-input"
            aria-describedby={describedBy}
            aria-invalid={hasError}
          />
        )}
      </FormField>
    );

    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const label = screen.getByText('Custom Field');
    expect(label).toHaveAttribute('for', input.getAttribute('id'));
  });
});
